begin;
create table public.consumer_bills (
 id uuid primary key,
 user_id uuid not null references public.profiles(user_id) on delete cascade,
 object_path text not null unique,
 sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
 extraction jsonb not null,
 reviewed jsonb,
 declaration jsonb,
 ownership text not null default 'unverified' check (ownership = 'unverified'),
 ownership_note text,
 status text not null default 'draft' check (status in ('draft','confirmed')),
 account_key text,
 period_start date,
 period_end date,
 confirmed_at timestamptz,
 created_at timestamptz not null default now(),
 unique(user_id, sha256),
 check (object_path like user_id::text || '/%'),
 check (status = 'draft' or (reviewed is not null and declaration is not null and account_key is not null and period_start is not null and period_end is not null and period_end >= period_start and confirmed_at is not null))
);
create unique index consumer_bill_period on public.consumer_bills(user_id, account_key, period_start, period_end) where status = 'confirmed';
alter table public.consumer_bills enable row level security;
create policy bills_own on public.consumer_bills for all to authenticated
 using (user_id = (select auth.uid()) and public.has_community_role(array['consumer']::public.community_role[]))
 with check (user_id = (select auth.uid()) and public.has_community_role(array['consumer']::public.community_role[]));
revoke all on public.consumer_bills from anon, authenticated;
grant select, insert on public.consumer_bills to authenticated;
grant update(reviewed, declaration, ownership_note, status, account_key, period_start, period_end, confirmed_at) on public.consumer_bills to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values ('consumer-bills','consumer-bills',false,3000000,array['image/jpeg','image/png']);
create policy bill_images_read on storage.objects for select to authenticated
 using (bucket_id = 'consumer-bills' and (storage.foldername(name))[1] = (select auth.uid())::text and public.has_community_role(array['consumer']::public.community_role[]));
create policy bill_images_insert on storage.objects for insert to authenticated
 with check (bucket_id = 'consumer-bills' and (storage.foldername(name))[1] = (select auth.uid())::text and public.has_community_role(array['consumer']::public.community_role[]));
create policy bill_images_cleanup on storage.objects for delete to authenticated
 using (bucket_id = 'consumer-bills' and (storage.foldername(name))[1] = (select auth.uid())::text and public.has_community_role(array['consumer']::public.community_role[]) and not exists (select 1 from public.consumer_bills where object_path = name));

create table public.bill_read_limits (user_id uuid primary key references auth.users(id) on delete cascade, window_start timestamptz not null, attempts integer not null);
alter table public.bill_read_limits enable row level security;
revoke all on public.bill_read_limits from anon, authenticated;
create function public.consume_bill_read() returns boolean language plpgsql security definer set search_path = '' as $$
declare used integer;
begin
 if auth.uid() is null or not public.has_community_role(array['consumer']::public.community_role[]) then return false; end if;
 insert into public.bill_read_limits values (auth.uid(), now(), 1)
 on conflict(user_id) do update set
 attempts = case when public.bill_read_limits.window_start < now() - interval '1 hour' then 1 else public.bill_read_limits.attempts + 1 end,
 window_start = case when public.bill_read_limits.window_start < now() - interval '1 hour' then now() else public.bill_read_limits.window_start end
 returning attempts into used;
 return used <= 10;
end;
$$;
revoke all on function public.consume_bill_read() from public;
grant execute on function public.consume_bill_read() to authenticated;
commit;
