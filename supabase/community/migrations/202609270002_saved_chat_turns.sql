begin;
-- Trusted server only: callers cannot manufacture assistant messages.
-- Serialize turns with recall changes/deletion; retries reuse the user message UUID.
create function public.save_conversation_turn(owner_id uuid, scope_id text, chat_id uuid, request_id uuid, question text, answer text)
returns boolean language plpgsql security definer set search_path='' as $$
declare existing public.conversation_messages;
begin
 perform 1 from public.conversations where id=chat_id and user_id=owner_id and community_id=scope_id for update;
 if not found then return false; end if;
 if not exists(select 1 from public.memberships m join public.role_assignments r on r.user_id=m.user_id
   where m.user_id=owner_id and m.community_id=scope_id and m.status='active' and r.revoked_at is null) then return false; end if;
 select * into existing from public.conversation_messages where id=request_id;
 if found then
   return existing.conversation_id=chat_id and existing.user_id=owner_id and existing.role='user' and existing.content=question;
 end if;
 insert into public.conversation_messages(id,conversation_id,user_id,community_id,role,content,created_at)
 values(request_id,chat_id,owner_id,scope_id,'user',question,clock_timestamp());
 insert into public.conversation_messages(conversation_id,user_id,community_id,role,content,created_at)
 values(chat_id,owner_id,scope_id,'assistant',answer,clock_timestamp()+interval '1 millisecond');
 return true;
end $$;
revoke all on function public.save_conversation_turn(uuid,text,uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.save_conversation_turn(uuid,text,uuid,uuid,text,text) to service_role;
commit;
