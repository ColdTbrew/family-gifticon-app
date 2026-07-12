create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  gifticon_id uuid not null references public.gifticons(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  subscription_id uuid not null references public.push_subscriptions(id) on delete cascade,
  threshold_days integer not null check (threshold_days in (1, 3, 7)),
  scheduled_for date not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  attempts integer not null default 0 check (attempts >= 0),
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (gifticon_id, subscription_id, threshold_days)
);

create index if not exists idx_push_subscriptions_user_id
  on public.push_subscriptions (user_id);
create index if not exists idx_notification_deliveries_user_id
  on public.notification_deliveries (user_id);
create index if not exists idx_notification_deliveries_scheduled_for
  on public.notification_deliveries (scheduled_for);

alter table public.push_subscriptions enable row level security;
alter table public.notification_deliveries enable row level security;

drop policy if exists "push_subscriptions_select_self" on public.push_subscriptions;
create policy "push_subscriptions_select_self"
on public.push_subscriptions for select
using (user_id = auth.uid());

drop policy if exists "push_subscriptions_insert_self" on public.push_subscriptions;
create policy "push_subscriptions_insert_self"
on public.push_subscriptions for insert
with check (user_id = auth.uid());

drop policy if exists "push_subscriptions_update_self" on public.push_subscriptions;
create policy "push_subscriptions_update_self"
on public.push_subscriptions for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "push_subscriptions_delete_self" on public.push_subscriptions;
create policy "push_subscriptions_delete_self"
on public.push_subscriptions for delete
using (user_id = auth.uid());

drop policy if exists "notification_deliveries_select_self" on public.notification_deliveries;
create policy "notification_deliveries_select_self"
on public.notification_deliveries for select
using (user_id = auth.uid());
