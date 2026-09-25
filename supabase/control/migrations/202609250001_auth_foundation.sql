begin;

create type public.platform_role as enum ('platform_admin');

create table public.platform_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 100),
  created_at timestamptz not null default now()
);

create table public.platform_role_assignments (
  user_id uuid not null references public.platform_profiles(user_id) on delete cascade,
  role public.platform_role not null,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id),
  revoked_at timestamptz,
  primary key (user_id, role),
  check (revoked_at is null or revoked_at >= granted_at)
);

create or replace function public.has_platform_role(requested public.platform_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.platform_role_assignments r
    where r.user_id = (select auth.uid())
      and r.revoked_at is null
      and r.role = any(requested)
  );
$$;

create or replace function public.handle_new_platform_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.platform_profiles (user_id, display_name)
  values (new.id, nullif(left(new.raw_user_meta_data ->> 'display_name', 100), ''))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_platform_user_created
after insert on auth.users
for each row execute procedure public.handle_new_platform_user();

alter table public.platform_profiles enable row level security;
alter table public.platform_role_assignments enable row level security;

create policy platform_profiles_read_own on public.platform_profiles
for select to authenticated using (user_id = (select auth.uid()));

create policy platform_roles_read_own on public.platform_role_assignments
for select to authenticated using (user_id = (select auth.uid()));

revoke all on public.platform_profiles, public.platform_role_assignments from anon, authenticated;
grant select on public.platform_profiles, public.platform_role_assignments to authenticated;
revoke all on function public.has_platform_role(public.platform_role[]) from public;
grant execute on function public.has_platform_role(public.platform_role[]) to authenticated;
revoke all on function public.handle_new_platform_user() from public;

commit;
