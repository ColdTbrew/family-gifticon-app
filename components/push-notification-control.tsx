"use client";

import { useEffect, useState } from "react";

type PushState =
  | "checking"
  | "unsupported"
  | "needs-install"
  | "unavailable"
  | "disabled"
  | "enabling"
  | "enabled"
  | "disabling";

type PushNotificationControlProps = {
  vapidPublicKey: string;
};

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone(): boolean {
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function urlBase64ToArrayBuffer(value: string): ArrayBuffer {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(rawData.length));

  for (let index = 0; index < rawData.length; index += 1) {
    bytes[index] = rawData.charCodeAt(index);
  }

  return bytes.buffer;
}

async function saveSubscription(subscription: PushSubscription): Promise<void> {
  const response = await fetch("/api/push/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON())
  });

  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(result?.error || "알림 구독을 저장하지 못했습니다.");
  }
}

export function PushNotificationControl({ vapidPublicKey }: PushNotificationControlProps) {
  const [state, setState] = useState<PushState>("checking");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSubscription() {
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        if (!cancelled) setState("unsupported");
        return;
      }

      if (isIos() && !isStandalone()) {
        if (!cancelled) setState("needs-install");
        return;
      }

      if (!vapidPublicKey) {
        if (!cancelled) setState("unavailable");
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          await saveSubscription(subscription);
        }

        if (!cancelled) setState(subscription ? "enabled" : "disabled");
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "알림 상태를 확인하지 못했습니다.");
          setState("disabled");
        }
      }
    }

    void checkSubscription();

    return () => {
      cancelled = true;
    };
  }, [vapidPublicKey]);

  async function enableNotifications() {
    setMessage(null);
    setState("enabling");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error(
          permission === "denied"
            ? "브라우저 설정에서 이 사이트의 알림 권한을 허용해주세요."
            : "알림을 허용해야 만료 알림을 받을 수 있습니다."
        );
      }

      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      const existingSubscription = await registration.pushManager.getSubscription();
      const subscription =
        existingSubscription ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToArrayBuffer(vapidPublicKey)
        }));

      await saveSubscription(subscription);
      setState("enabled");
      setMessage("이 기기에서 D-7, D-3, D-1 만료 알림을 받습니다.");
    } catch (error) {
      setState("disabled");
      setMessage(error instanceof Error ? error.message : "알림을 켜지 못했습니다.");
    }
  }

  async function disableNotifications() {
    setMessage(null);
    setState("disabling");

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const response = await fetch("/api/push/subscriptions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });

        if (!response.ok) {
          throw new Error("알림 구독을 해제하지 못했습니다.");
        }

        await subscription.unsubscribe();
      }

      setState("disabled");
      setMessage("이 기기의 만료 알림을 껐습니다.");
    } catch (error) {
      setState("enabled");
      setMessage(error instanceof Error ? error.message : "알림을 끄지 못했습니다.");
    }
  }

  if (state === "unsupported") {
    return null;
  }

  return (
    <section className="rounded-[1.25rem] border border-[#d7def3] bg-[#f7f9ff] p-4 shadow-panel">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-brand">만료 알림</p>
          <h2 className="mt-1 text-base font-semibold text-ink">
            {state === "enabled" || state === "disabling"
              ? "이 기기에서 알림을 받고 있습니다"
              : "기프티콘 만료 전에 알려드릴게요"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {state === "needs-install"
              ? "iPhone 공유 메뉴에서 홈 화면에 추가한 뒤 앱 아이콘으로 다시 열어주세요."
              : state === "unavailable"
                ? "서버의 웹 푸시 키 설정이 필요합니다."
                : "사용 가능한 기프티콘을 D-7, D-3, D-1에 알려드립니다."}
          </p>
        </div>

        {state === "enabled" || state === "disabling" ? (
          <button
            type="button"
            className="min-h-[44px] shrink-0 rounded-xl border border-[#b8c5ec] bg-white px-4 py-2 text-sm font-semibold text-[#244aa5] disabled:cursor-wait disabled:opacity-60"
            onClick={disableNotifications}
            disabled={state === "disabling"}
          >
            {state === "disabling" ? "끄는 중…" : "알림 끄기"}
          </button>
        ) : (
          <button
            type="button"
            className="min-h-[44px] shrink-0 rounded-xl bg-[#2f5ec4] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            onClick={enableNotifications}
            disabled={
              state === "checking" ||
              state === "enabling" ||
              state === "needs-install" ||
              state === "unavailable"
            }
          >
            {state === "checking" ? "확인 중…" : state === "enabling" ? "켜는 중…" : "알림 받기"}
          </button>
        )}
      </div>

      {message ? <p className="mt-3 text-sm text-muted" role="status">{message}</p> : null}
    </section>
  );
}
