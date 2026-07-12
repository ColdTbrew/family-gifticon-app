self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {
      title: "가족 기프티콘",
      body: event.data ? event.data.text() : "만료 예정 기프티콘을 확인해주세요."
    };
  }

  const title = payload.title || "가족 기프티콘";
  const options = {
    body: payload.body || "만료 예정 기프티콘을 확인해주세요.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: payload.tag || "gifticon-expiry",
    renotify: true,
    data: {
      url: payload.url || "/"
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const requestedUrl = new URL(event.notification.data?.url || "/", self.location.origin);
  const targetUrl =
    requestedUrl.origin === self.location.origin ? requestedUrl.href : self.location.origin;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          return client.focus().then(() => {
            if ("navigate" in client) {
              return client.navigate(targetUrl);
            }
          });
        }
      }

      return clients.openWindow(targetUrl);
    })
  );
});
