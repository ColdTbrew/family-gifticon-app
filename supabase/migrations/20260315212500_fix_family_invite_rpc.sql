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

  update public.family_invites fi
  set expires_at = now()
  where fi.family_id = target_family_id
    and fi.used_at is null
    and fi.expires_at > now();

  loop
    v_invite_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (
      select 1
      from public.family_invites fi
      where fi.invite_code = v_invite_code
    );
  end loop;

  insert into public.family_invites (family_id, invite_code, created_by, expires_at)
  values (target_family_id, v_invite_code, v_user_id, v_expires_at);

  return query
  select v_invite_code, v_expires_at;
end;
$$;
