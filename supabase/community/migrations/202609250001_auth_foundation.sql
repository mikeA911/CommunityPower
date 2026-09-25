begin;

create type public.community_role as enum ('consumer', 'community_admin');
create type public.membership_status as enum ('active', 'suspended', 'left');

create table public.community_config (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  display_name text not null check (char_length(display_name) between 2 and 100),
  singleton boolean not null default true unique check (singleton),
  created_at timestamptz not null default now()
);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  community_id text not null references public.community_config(id),
  status public.membership_status not null default 'active',
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.role_assignments (
  user_id uuid not null references public.memberships(user_id) on delete cascade,
  role public.community_role not null,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id),
  revoked_at timestamptz,
  primary key (user_id, role),
  check (revoked_at is null or revoked_at >= granted_at)
);

create or replace function public.has_community_role(requested public.community_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    join public.role_assignments r on r.user_id = m.user_id
    where m.user_id = (select auth.uid())
      and m.status = 'active'
      and r.revoked_at is null
      and r.role = any(requested)
  );
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, nullif(left(new.raw_user_meta_data ->> 'display_name', 100), ''))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

alter table public.community_config enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.role_assignments enable row level security;

create policy community_config_read on public.community_config
for select to authenticated using (true);

create policy profiles_read_own on public.profiles
for select to authenticated
using (user_id = (select auth.uid()));

create policy memberships_read_scoped on public.memberships
for select to authenticated
using (
  user_id = (select auth.uid())
  or (select public.has_community_role(array['community_admin']::public.community_role[]))
);

create policy roles_read_scoped on public.role_assignments
for select to authenticated
using (
  user_id = (select auth.uid())
  or (select public.has_community_role(array['community_admin']::public.community_role[]))
);

revoke all on public.community_config, public.profiles, public.memberships, public.role_assignments from anon, authenticated;
grant select on public.community_config, public.profiles, public.memberships, public.role_assignments to authenticated;
revoke all on function public.has_community_role(public.community_role[]) from public;
grant execute on function public.has_community_role(public.community_role[]) to authenticated;
revoke all on function public.handle_new_auth_user() from public;

commit;
