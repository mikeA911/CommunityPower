begin;
create schema if not exists extensions;
create extension if not exists vector with schema extensions;
-- Fail closed if a pre-existing vector extension uses another schema; do not move it silently.
do $$ begin
 if not exists(select 1 from pg_extension e join pg_namespace n on n.oid=e.extnamespace where e.extname='vector' and n.nspname='extensions') then
   raise exception 'vector must be installed in extensions; review existing installation before migrating';
 end if;
end $$;

create table public.conversation_rag_settings (
 singleton boolean primary key default true check(singleton),
 indexing_enabled boolean not null default false,
 model text not null default 'text-embedding-3-small' check(model='text-embedding-3-small'),
 dimensions integer not null default 1536 check(dimensions=1536)
);
insert into public.conversation_rag_settings(singleton) values(true);
alter table public.conversation_rag_settings enable row level security;
revoke all on public.conversation_rag_settings from anon, authenticated;
grant select, update on public.conversation_rag_settings to service_role;

create function public.owns_active_chat_scope(scope_id text) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.memberships m join public.role_assignments r on r.user_id=m.user_id
 where m.user_id=(select auth.uid()) and m.community_id=scope_id and m.status='active' and r.revoked_at is null);
$$;
revoke all on function public.owns_active_chat_scope(text) from public;
grant execute on function public.owns_active_chat_scope(text) to authenticated;

create table public.conversations (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references public.profiles(user_id) on delete cascade,
 community_id text not null references public.community_config(id),
 title text not null default 'New conversation' check(char_length(title) between 1 and 150),
 memory_enabled boolean not null default false,
 created_at timestamptz not null default now(),
 unique(id,user_id,community_id)
);
create table public.conversation_messages (
 id uuid primary key default gen_random_uuid(),
 conversation_id uuid not null,
 user_id uuid not null default auth.uid(),
 community_id text not null,
 role text not null check(role in ('user','assistant')),
 content text not null check(char_length(content) between 1 and 4000),
 created_at timestamptz not null default now(),
 foreign key(conversation_id,user_id,community_id) references public.conversations(id,user_id,community_id) on delete cascade,
 unique(id,conversation_id,user_id,community_id)
);
create index conversation_messages_timeline on public.conversation_messages(conversation_id,created_at,id);

-- V1: one bounded immutable message per chunk. Text stays in messages, not copied into vectors/jobs.
create table public.conversation_chunks (
 message_id uuid primary key,
 conversation_id uuid not null,
 user_id uuid not null,
 community_id text not null,
 model text not null default 'text-embedding-3-small' check(model='text-embedding-3-small'),
 embedding extensions.vector(1536) not null,
 indexed_at timestamptz not null default now(),
 foreign key(message_id,conversation_id,user_id,community_id) references public.conversation_messages(id,conversation_id,user_id,community_id) on delete cascade,
 check(extensions.vector_norm(embedding)>0)
);
create index conversation_chunks_owner on public.conversation_chunks(user_id,community_id);
-- Exact search within the owner scope for the initial small corpus; benchmark ANN before adding it.
create table public.conversation_index_jobs (
 message_id uuid primary key references public.conversation_messages(id) on delete cascade,
 state text not null default 'pending' check(state in ('pending','leased','done','failed')),
 attempts integer not null default 0 check(attempts between 0 and 5),
 available_at timestamptz not null default now(),
 lease_token uuid,
 lease_until timestamptz,
 created_at timestamptz not null default now(),
 check((state='leased') = (lease_token is not null and lease_until is not null))
);
create index conversation_jobs_ready on public.conversation_index_jobs(state,available_at);

alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.conversation_chunks enable row level security;
alter table public.conversation_index_jobs enable row level security;
create policy conversations_owner on public.conversations for all to authenticated
 using(user_id=(select auth.uid()) and public.owns_active_chat_scope(community_id))
 with check(user_id=(select auth.uid()) and public.owns_active_chat_scope(community_id));
create policy messages_read on public.conversation_messages for select to authenticated
 using(user_id=(select auth.uid()) and public.owns_active_chat_scope(community_id));
create policy messages_insert on public.conversation_messages for insert to authenticated
 with check(user_id=(select auth.uid()) and role='user' and public.owns_active_chat_scope(community_id));
create policy messages_delete on public.conversation_messages for delete to authenticated
 using(user_id=(select auth.uid()) and public.owns_active_chat_scope(community_id));
create policy chunks_read on public.conversation_chunks for select to authenticated
 using(user_id=(select auth.uid()) and public.owns_active_chat_scope(community_id)
 and exists(select 1 from public.conversations c where c.id=conversation_id and c.memory_enabled));
revoke all on public.conversations,public.conversation_messages,public.conversation_chunks,public.conversation_index_jobs from anon,authenticated;
grant select,insert,delete on public.conversations to authenticated;
grant update(title,memory_enabled) on public.conversations to authenticated;
grant select,insert,delete on public.conversation_messages to authenticated;
grant select on public.conversation_chunks to authenticated;
grant all on public.conversations,public.conversation_messages,public.conversation_chunks,public.conversation_index_jobs to service_role;
grant usage on schema extensions to authenticated,service_role;

create function public.queue_conversation_message() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.conversations c where c.id=new.conversation_id and c.memory_enabled) then
  insert into public.conversation_index_jobs(message_id) values(new.id) on conflict do nothing;
 end if;
 return new;
end $$;
create trigger queue_new_conversation_message after insert on public.conversation_messages
 for each row execute function public.queue_conversation_message();

create function public.change_conversation_memory() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.memory_enabled and not old.memory_enabled then
  insert into public.conversation_index_jobs(message_id)
   select id from public.conversation_messages where conversation_id=new.id on conflict do nothing;
 elsif old.memory_enabled and not new.memory_enabled then
  delete from public.conversation_chunks where conversation_id=new.id;
  delete from public.conversation_index_jobs where message_id in(select id from public.conversation_messages where conversation_id=new.id);
 end if;
 return new;
end $$;
create trigger change_conversation_memory after update of memory_enabled on public.conversations
 for each row execute function public.change_conversation_memory();
revoke all on function public.queue_conversation_message(),public.change_conversation_memory() from public;

-- Worker-only leasing. Attempts are bounded; expired leases are reclaimed with a new fencing token.
create function public.claim_conversation_index_jobs(batch_size integer default 5)
returns table(message_id uuid,lease_token uuid,content text,model text,dimensions integer)
language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.conversation_rag_settings where indexing_enabled) then return; end if;
 update public.conversation_index_jobs j set state='failed',lease_token=null,lease_until=null
 where j.state='leased' and j.lease_until<=now() and j.attempts>=5;
 return query
 with candidates as (
  select j.message_id from public.conversation_index_jobs j
  join public.conversation_messages m on m.id=j.message_id
  join public.conversations c on c.id=m.conversation_id
  join public.memberships member on member.user_id=c.user_id and member.community_id=c.community_id
  where c.memory_enabled and member.status='active'
   and exists(select 1 from public.role_assignments r where r.user_id=c.user_id and r.revoked_at is null)
   and j.attempts<5 and ((j.state='pending' and j.available_at<=now()) or (j.state='leased' and j.lease_until<=now()))
  order by j.created_at,j.message_id for update of j skip locked limit greatest(1,least(coalesce(batch_size,5),20))
 ), claimed as (
  update public.conversation_index_jobs j set state='leased',attempts=j.attempts+1,lease_token=gen_random_uuid(),lease_until=now()+interval '5 minutes'
  from candidates c where j.message_id=c.message_id returning j.message_id,j.lease_token
 ) select claimed.message_id,claimed.lease_token,m.content,s.model,s.dimensions
 from claimed join public.conversation_messages m on m.id=claimed.message_id cross join public.conversation_rag_settings s;
end $$;

create function public.complete_conversation_index_job(job_id uuid,token uuid,vec extensions.vector(1536)) returns boolean
language plpgsql security definer set search_path='' as $$
declare msg public.conversation_messages; scope public.conversations;
begin
 -- Lock source scope first so withdrawal/deletion serializes with completion.
 select c.* into scope from public.conversations c join public.conversation_messages m on m.conversation_id=c.id where m.id=job_id for share of c;
 if not found or not scope.memory_enabled then return false; end if;
 if not exists(select 1 from public.conversation_rag_settings where indexing_enabled) then return false; end if;
 if not exists(select 1 from public.memberships m join public.role_assignments r on r.user_id=m.user_id
  where m.user_id=scope.user_id and m.community_id=scope.community_id and m.status='active' and r.revoked_at is null) then return false; end if;
 perform 1 from public.conversation_index_jobs j where j.message_id=job_id and j.state='leased' and j.lease_token=token and j.lease_until>now() for update;
 if not found then return false; end if;
 select * into msg from public.conversation_messages where id=job_id for share;
 if not found then return false; end if;
 insert into public.conversation_chunks(message_id,conversation_id,user_id,community_id,embedding)
 values(msg.id,msg.conversation_id,msg.user_id,msg.community_id,vec)
 on conflict(message_id) do update set embedding=excluded.embedding,indexed_at=now();
 update public.conversation_index_jobs set state='done',lease_token=null,lease_until=null where message_id=job_id;
 return true;
end $$;

create function public.fail_conversation_index_job(job_id uuid,token uuid) returns boolean
language plpgsql security definer set search_path='' as $$
begin
 update public.conversation_index_jobs set state=case when attempts>=5 then 'failed' else 'pending' end,
 available_at=now()+interval '1 minute'*attempts,lease_token=null,lease_until=null
 where message_id=job_id and state='leased' and lease_token=token and lease_until>now();
 return found;
end $$;
revoke all on function public.claim_conversation_index_jobs(integer),public.complete_conversation_index_job(uuid,uuid,extensions.vector),public.fail_conversation_index_job(uuid,uuid) from public,anon,authenticated;
grant execute on function public.claim_conversation_index_jobs(integer),public.complete_conversation_index_job(uuid,uuid,extensions.vector),public.fail_conversation_index_job(uuid,uuid) to service_role;

-- Invoker mode preserves RLS. No user_id argument that a caller could substitute.
create function public.match_private_conversation_chunks(query_embedding extensions.vector(1536),match_count integer default 5)
returns table(message_id uuid,conversation_id uuid,content text,similarity double precision)
language sql stable security invoker set search_path='' as $$
 select v.message_id,v.conversation_id,m.content,1-(v.embedding operator(extensions.<=>) query_embedding)
 from public.conversation_chunks v join public.conversation_messages m on m.id=v.message_id
 where v.user_id=(select auth.uid()) and extensions.vector_dims(query_embedding)=1536 and extensions.vector_norm(query_embedding)>0
 order by v.embedding operator(extensions.<=>) query_embedding
 limit greatest(1,least(coalesce(match_count,5),20));
$$;
revoke all on function public.match_private_conversation_chunks(extensions.vector,integer) from public,anon;
grant execute on function public.match_private_conversation_chunks(extensions.vector,integer) to authenticated;
commit;
