import "server-only";
import webPush, { WebPushError } from "web-push";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const ALERT_THRESHOLDS = [1, 3, 7] as const;

type AlertThreshold = (typeof ALERT_THRESHOLDS)[number];

type GifticonRow = {
  id: string;
  family_id: string;
  title: string | null;
  brand: string;
  expires_at: string;
};

type MembershipRow = {
  family_id: string;
  user_id: string;
};

type SubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

class PushDeliveryError extends Error {
  attempts: number;
  statusCode: number | null;

  constructor(error: unknown, attempts: number) {
    super(error instanceof Error ? error.message : "Unknown web push error");
    this.name = "PushDeliveryError";
    this.attempts = attempts;
    this.statusCode = getWebPushErrorStatus(error);
  }
}

export type ExpiryNotificationResult = {
  dueGifticons: number;
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
  removedSubscriptions: number;
};

function formatKstDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function formatKoreanDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${year}.${month}.${day}`;
}

function getWebPushErrorStatus(error: unknown): number | null {
  if (error instanceof WebPushError) {
    return error.statusCode;
  }

  if (typeof error === "object" && error !== null && "statusCode" in error) {
    const statusCode = (error as { statusCode?: unknown }).statusCode;
    return typeof statusCode === "number" ? statusCode : null;
  }

  return null;
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message.slice(0, 1000) : "Unknown web push error";
}

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    throw new Error("Missing VAPID environment variables.");
  }

  webPush.setVapidDetails(subject, publicKey, privateKey);
}

async function sendNotificationWithRetry(
  subscription: SubscriptionRow,
  payload: string,
  threshold: AlertThreshold
): Promise<number> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await webPush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        },
        payload,
        { TTL: 60 * 60 * 12, urgency: threshold === 1 ? "high" : "normal" }
      );
      return attempt;
    } catch (error) {
      lastError = error;
      const statusCode = getWebPushErrorStatus(error);
      if (statusCode === 404 || statusCode === 410 || attempt === 3) {
        throw new PushDeliveryError(error, attempt);
      }

      await new Promise((resolve) => setTimeout(resolve, attempt * 250));
    }
  }

  throw new PushDeliveryError(lastError, 3);
}

export async function sendExpiryNotifications(now = new Date()): Promise<ExpiryNotificationResult> {
  configureWebPush();
  const supabase = createSupabaseAdminClient();
  const today = formatKstDate(now);
  const thresholdByDate = new Map<string, AlertThreshold>(
    ALERT_THRESHOLDS.map((threshold) => [addDays(today, threshold), threshold])
  );
  const result: ExpiryNotificationResult = {
    dueGifticons: 0,
    attempted: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    removedSubscriptions: 0
  };

  const { data: gifticonData, error: gifticonError } = await supabase
    .from("gifticons")
    .select("id,family_id,title,brand,expires_at")
    .eq("status", "available")
    .in("expires_at", Array.from(thresholdByDate.keys()));

  if (gifticonError) {
    throw new Error(`Failed to load due gifticons: ${gifticonError.message}`);
  }

  const gifticons = (gifticonData ?? []) as GifticonRow[];
  result.dueGifticons = gifticons.length;
  if (gifticons.length === 0) return result;

  const familyIds = Array.from(new Set(gifticons.map((gifticon) => gifticon.family_id)));
  const { data: membershipData, error: membershipError } = await supabase
    .from("family_members")
    .select("family_id,user_id")
    .in("family_id", familyIds);

  if (membershipError) {
    throw new Error(`Failed to load family members: ${membershipError.message}`);
  }

  const memberships = (membershipData ?? []) as MembershipRow[];
  const userIds = Array.from(new Set(memberships.map((membership) => membership.user_id)));
  if (userIds.length === 0) return result;

  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from("push_subscriptions")
    .select("id,user_id,endpoint,p256dh,auth")
    .in("user_id", userIds);

  if (subscriptionError) {
    throw new Error(`Failed to load push subscriptions: ${subscriptionError.message}`);
  }

  const subscriptions = (subscriptionData ?? []) as SubscriptionRow[];
  const userIdsByFamily = new Map<string, Set<string>>();
  for (const membership of memberships) {
    const familyUsers = userIdsByFamily.get(membership.family_id) ?? new Set<string>();
    familyUsers.add(membership.user_id);
    userIdsByFamily.set(membership.family_id, familyUsers);
  }

  for (const gifticon of gifticons) {
    const threshold = thresholdByDate.get(gifticon.expires_at);
    const familyUsers = userIdsByFamily.get(gifticon.family_id);
    if (!threshold || !familyUsers) continue;

    const recipients = subscriptions.filter((subscription) => familyUsers.has(subscription.user_id));
    for (const subscription of recipients) {
      const { data: deliveryData, error: deliveryError } = await supabase
        .from("notification_deliveries")
        .upsert(
          {
            gifticon_id: gifticon.id,
            user_id: subscription.user_id,
            subscription_id: subscription.id,
            threshold_days: threshold,
            scheduled_for: today,
            status: "pending"
          },
          {
            onConflict: "gifticon_id,subscription_id,threshold_days",
            ignoreDuplicates: true
          }
        )
        .select("id")
        .maybeSingle();

      if (deliveryError) {
        throw new Error(`Failed to claim notification delivery: ${deliveryError.message}`);
      }

      if (!deliveryData) {
        result.skipped += 1;
        continue;
      }

      result.attempted += 1;
      const displayTitle = gifticon.title?.trim() || `${gifticon.brand} 기프티콘`;
      const payload = JSON.stringify({
        title: `${displayTitle} · D-${threshold}`,
        body: `${formatKoreanDate(gifticon.expires_at)}에 만료됩니다. 사용 가능한 기프티콘을 확인해주세요.`,
        url: "/",
        tag: `gifticon-expiry-${gifticon.id}`
      });

      try {
        const attempts = await sendNotificationWithRetry(subscription, payload, threshold);

        await supabase
          .from("notification_deliveries")
          .update({ status: "sent", attempts, sent_at: new Date().toISOString(), error: null })
          .eq("id", deliveryData.id);
        result.sent += 1;
      } catch (error) {
        const statusCode = getWebPushErrorStatus(error);
        const attempts = error instanceof PushDeliveryError ? error.attempts : 1;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", subscription.id);
          result.removedSubscriptions += 1;
        } else {
          await supabase
            .from("notification_deliveries")
            .update({ status: "failed", attempts, error: toErrorMessage(error) })
            .eq("id", deliveryData.id);
        }
        result.failed += 1;
      }
    }
  }

  return result;
}
