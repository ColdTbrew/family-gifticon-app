create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (family_id, user_id)
);

create table if not exists public.family_invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  invite_code text not null unique,
  created_by uuid not null references public.profiles(id) on delete restrict,
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.gifticons (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  brand text not null,
  barcode text not null,
  expires_at date not null,
  status text not null default 'available' check (status in ('available', 'used', 'expired')),
  memo text,
  used_at timestamptz,
  used_by uuid references public.profiles(id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.gifticon_images (
  id uuid primary key default gen_random_uuid(),
  gifticon_id uuid not null references public.gifticons(id) on delete cascade,
  storage_path text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.gifticon_events (
  id uuid primary key default gen_random_uuid(),
  gifticon_id uuid not null references public.gifticons(id) on delete cascade,
  event_type text not null check (event_type in ('created', 'updated', 'used', 'expired', 'transferred')),
  actor_id uuid not null references public.profiles(id) on delete restrict,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_family_members_family_id on public.family_members (family_id);
create index if not exists idx_family_members_user_id on public.family_members (user_id);
create index if not exists idx_gifticons_family_id on public.gifticons (family_id);
create index if not exists idx_gifticons_expires_at on public.gifticons (expires_at);
create index if not exists idx_gifticons_status on public.gifticons (status);
create index if not exists idx_gifticon_events_gifticon_id on public.gifticon_events (gifticon_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), new.raw_user_meta_data->>'name')
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_family_member(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.family_id = target_family_id
      and fm.user_id = auth.uid()
  );
$$;

create or replace function public.is_family_owner(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.family_id = target_family_id
      and fm.user_id = auth.uid()
      and fm.role = 'owner'
  );
$$;

alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.family_invites enable row level security;
alter table public.gifticons enable row level security;
alter table public.gifticon_images enable row level security;
alter table public.gifticon_events enable row level security;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self"
on public.profiles for select
using (id = auth.uid());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles for insert
with check (id = auth.uid());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "families_select_member" on public.families;
create policy "families_select_member"
on public.families for select
using (public.is_family_member(id));

drop policy if exists "families_insert_owner" on public.families;
create policy "families_insert_owner"
on public.families for insert
with check (owner_id = auth.uid());

drop policy if exists "families_update_owner" on public.families;
create policy "families_update_owner"
on public.families for update
using (public.is_family_owner(id))
with check (public.is_family_owner(id));

drop policy if exists "families_delete_owner" on public.families;
create policy "families_delete_owner"
on public.families for delete
using (public.is_family_owner(id));

drop policy if exists "family_members_select_member" on public.family_members;
create policy "family_members_select_member"
on public.family_members for select
using (public.is_family_member(family_id));

drop policy if exists "family_members_insert_owner" on public.family_members;
create policy "family_members_insert_owner"
on public.family_members for insert
with check (public.is_family_owner(family_id));

drop policy if exists "family_members_update_owner" on public.family_members;
create policy "family_members_update_owner"
on public.family_members for update
using (public.is_family_owner(family_id))
with check (public.is_family_owner(family_id));

drop policy if exists "family_members_delete_owner" on public.family_members;
create policy "family_members_delete_owner"
on public.family_members for delete
using (public.is_family_owner(family_id));

drop policy if exists "family_invites_select_member" on public.family_invites;
create policy "family_invites_select_member"
on public.family_invites for select
using (public.is_family_member(family_id));

drop policy if exists "family_invites_insert_owner" on public.family_invites;
create policy "family_invites_insert_owner"
on public.family_invites for insert
with check (public.is_family_owner(family_id));

drop policy if exists "family_invites_update_owner" on public.family_invites;
create policy "family_invites_update_owner"
on public.family_invites for update
using (public.is_family_owner(family_id))
with check (public.is_family_owner(family_id));

drop policy if exists "family_invites_delete_owner" on public.family_invites;
create policy "family_invites_delete_owner"
on public.family_invites for delete
using (public.is_family_owner(family_id));

drop policy if exists "gifticons_select_member" on public.gifticons;
create policy "gifticons_select_member"
on public.gifticons for select
using (public.is_family_member(family_id));

drop policy if exists "gifticons_insert_member" on public.gifticons;
create policy "gifticons_insert_member"
on public.gifticons for insert
with check (
  public.is_family_member(family_id)
  and created_by = auth.uid()
);

drop policy if exists "gifticons_update_member" on public.gifticons;
create policy "gifticons_update_member"
on public.gifticons for update
using (public.is_family_member(family_id))
with check (public.is_family_member(family_id));

drop policy if exists "gifticons_delete_member" on public.gifticons;
create policy "gifticons_delete_member"
on public.gifticons for delete
using (public.is_family_member(family_id));

drop policy if exists "gifticon_images_select_member" on public.gifticon_images;
create policy "gifticon_images_select_member"
on public.gifticon_images for select
using (
  exists (
    select 1
    from public.gifticons g
    where g.id = gifticon_id
      and public.is_family_member(g.family_id)
  )
);

drop policy if exists "gifticon_images_insert_member" on public.gifticon_images;
create policy "gifticon_images_insert_member"
on public.gifticon_images for insert
with check (
  exists (
    select 1
    from public.gifticons g
    where g.id = gifticon_id
      and public.is_family_member(g.family_id)
  )
);

drop policy if exists "gifticon_images_delete_member" on public.gifticon_images;
create policy "gifticon_images_delete_member"
on public.gifticon_images for delete
using (
  exists (
    select 1
    from public.gifticons g
    where g.id = gifticon_id
      and public.is_family_member(g.family_id)
  )
);

drop policy if exists "gifticon_events_select_member" on public.gifticon_events;
create policy "gifticon_events_select_member"
on public.gifticon_events for select
using (
  exists (
    select 1
    from public.gifticons g
    where g.id = gifticon_id
      and public.is_family_member(g.family_id)
  )
);

drop policy if exists "gifticon_events_insert_member" on public.gifticon_events;
create policy "gifticon_events_insert_member"
on public.gifticon_events for insert
with check (
  actor_id = auth.uid()
  and exists (
    select 1
    from public.gifticons g
    where g.id = gifticon_id
      and public.is_family_member(g.family_id)
  )
);
