// Service Worker do Tennis Point
// Responsável por receber notificações Web Push em background

const SW_VERSION = 'tp-v1';

self.addEventListener('install', (event) => {
  // Ativa imediatamente sem aguardar abas antigas fecharem
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Recebe push do servidor (Edge Function)
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { title: 'Tennis Point', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'Tennis Point';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/icon-192.png',
    tag: payload.tag || 'tennis-point',
    data: payload.data || {},
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Quando o user clica na notificação, abre/foca o app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Se já tem janela aberta do app, foca nela
      for (const c of clients) {
        if (c.url.includes(self.location.origin) && 'focus' in c) {
          c.navigate(target).catch(() => {});
          return c.focus();
        }
      }
      // Senão, abre nova
      if (self.clients.openWindow) {
        return self.clients.openWindow(target);
      }
    })
  );
});
