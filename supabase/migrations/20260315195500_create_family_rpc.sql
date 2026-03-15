create or replace function public.create_family_with_owner_membership(family_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_family_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if family_name is null or btrim(family_name) = '' then
    raise exception 'Family name is required';
  end if;

  insert into public.families (name, owner_id)
  values (btrim(family_name), v_user_id)
  returning id into v_family_id;

  insert into public.family_members (family_id, user_id, role)
  values (v_family_id, v_user_id, 'owner')
  on conflict (family_id, user_id) do nothing;

  return v_family_id;
end;
$$;

grant execute on function public.create_family_with_owner_membership(text) to authenticated;
