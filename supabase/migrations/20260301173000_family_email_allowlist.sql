create table if not exists public.family_email_allowlist (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  invited_by uuid not null references public.profiles(id) on delete restrict,
  joined_user_id uuid references public.profiles(id) on delete set null,
  joined_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_family_email_allowlist_family_email_lower
on public.family_email_allowlist (family_id, lower(email));

create index if not exists idx_family_email_allowlist_email_lower
on public.family_email_allowlist (lower(email));

alter table public.family_email_allowlist enable row level security;

drop policy if exists "family_email_allowlist_select_member" on public.family_email_allowlist;
create policy "family_email_allowlist_select_member"
on public.family_email_allowlist for select
using (public.is_family_member(family_id));

drop policy if exists "family_email_allowlist_insert_owner" on public.family_email_allowlist;
create policy "family_email_allowlist_insert_owner"
on public.family_email_allowlist for insert
with check (public.is_family_owner(family_id));

drop policy if exists "family_email_allowlist_update_owner" on public.family_email_allowlist;
create policy "family_email_allowlist_update_owner"
on public.family_email_allowlist for update
using (public.is_family_owner(family_id))
with check (public.is_family_owner(family_id));

drop policy if exists "family_email_allowlist_delete_owner" on public.family_email_allowlist;
create policy "family_email_allowlist_delete_owner"
on public.family_email_allowlist for delete
using (public.is_family_owner(family_id));

create or replace function public.claim_family_memberships()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_count integer := 0;
begin
  if v_user_id is null then
    return 0;
  end if;

  select lower(p.email)
    into v_email
  from public.profiles p
  where p.id = v_user_id;

  if v_email is null then
    return 0;
  end if;

  with matched as (
    select a.family_id, a.role
    from public.family_email_allowlist a
    where lower(a.email) = v_email
  )
  insert into public.family_members (family_id, user_id, role)
  select m.family_id, v_user_id, m.role
  from matched m
  on conflict (family_id, user_id) do nothing;

  get diagnostics v_count = row_count;

  update public.family_email_allowlist a
     set joined_user_id = v_user_id,
         joined_at = coalesce(a.joined_at, now())
   where lower(a.email) = v_email
     and (a.joined_user_id is null or a.joined_user_id = v_user_id);

  return v_count;
end;
$$;

grant execute on function public.claim_family_memberships() to authenticated;
