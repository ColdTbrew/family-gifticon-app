create or replace function public.create_family_invite_code(
  target_family_id uuid,
  validity_hours integer default 72
)
returns table (invite_code text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_invite_code text;
  v_expires_at timestamptz := now() + make_interval(hours => greatest(validity_hours, 1));
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_family_owner(target_family_id) then
    raise exception 'Only the family owner can create invite codes';
  end if;

  update public.family_invites
  set expires_at = now()
  where family_id = target_family_id
    and used_at is null
    and expires_at > now();

  loop
    v_invite_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (
      select 1
      from public.family_invites
      where invite_code = v_invite_code
    );
  end loop;

  insert into public.family_invites (family_id, invite_code, created_by, expires_at)
  values (target_family_id, v_invite_code, v_user_id, v_expires_at);

  return query
  select v_invite_code, v_expires_at;
end;
$$;

create or replace function public.join_family_by_invite_code(invite_code_input text)
returns table (family_id uuid, family_name text, joined boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_invite record;
  v_joined boolean := false;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select fi.id, fi.family_id, f.name
  into v_invite
  from public.family_invites fi
  join public.families f on f.id = fi.family_id
  where fi.invite_code = upper(trim(invite_code_input))
    and fi.used_at is null
    and fi.expires_at > now()
  order by fi.created_at desc
  limit 1;

  if v_invite is null then
    raise exception 'Invite code is invalid or expired';
  end if;

  if exists (
    select 1
    from public.family_members fm
    where fm.family_id = v_invite.family_id
      and fm.user_id = v_user_id
  ) then
    return query
    select v_invite.family_id, v_invite.name, false;
    return;
  end if;

  insert into public.family_members (family_id, user_id, role)
  values (v_invite.family_id, v_user_id, 'member');

  update public.family_invites
  set used_at = now(),
      used_by = v_user_id
  where id = v_invite.id;

  v_joined := true;

  return query
  select v_invite.family_id, v_invite.name, v_joined;
end;
$$;

grant execute on function public.create_family_invite_code(uuid, integer) to authenticated;
grant execute on function public.join_family_by_invite_code(text) to authenticated;
