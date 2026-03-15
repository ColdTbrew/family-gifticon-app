insert into storage.buckets (id, name, public)
values ('gifticon-images', 'gifticon-images', false)
on conflict (id) do nothing;

drop policy if exists "gifticon_images_storage_select_member" on storage.objects;
create policy "gifticon_images_storage_select_member"
on storage.objects for select
using (
  bucket_id = 'gifticon-images'
  and public.is_family_member((storage.foldername(name))[1]::uuid)
);

drop policy if exists "gifticon_images_storage_insert_member" on storage.objects;
create policy "gifticon_images_storage_insert_member"
on storage.objects for insert
with check (
  bucket_id = 'gifticon-images'
  and auth.uid() is not null
  and public.is_family_member((storage.foldername(name))[1]::uuid)
);

drop policy if exists "gifticon_images_storage_update_member" on storage.objects;
create policy "gifticon_images_storage_update_member"
on storage.objects for update
using (
  bucket_id = 'gifticon-images'
  and public.is_family_member((storage.foldername(name))[1]::uuid)
)
with check (
  bucket_id = 'gifticon-images'
  and public.is_family_member((storage.foldername(name))[1]::uuid)
);

drop policy if exists "gifticon_images_storage_delete_member" on storage.objects;
create policy "gifticon_images_storage_delete_member"
on storage.objects for delete
using (
  bucket_id = 'gifticon-images'
  and public.is_family_member((storage.foldername(name))[1]::uuid)
);
