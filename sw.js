// Service worker do app da Pastora Simone: permite instalar o app e abrir offline
const CACHE = "pastora-simone-v1";
const BASICO = ["./login.html", "./css/plataforma.css", "./manifest.webmanifest", "./icons/icon-192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASICO)).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((chaves) => Promise.all(chaves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Rede primeiro (o conteúdo é sempre o mais novo); cache só quando estiver sem internet.
// Só arquivos do próprio site: Firebase e YouTube nunca passam por aqui.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copia = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copia));
        }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || (req.mode === "navigate" ? caches.match("./login.html") : Response.error())))
  );
});

// Toque na notificação de nova inscrição: abre (ou volta para) o painel
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "admin.html";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((abas) => {
      const aba = abas.find((c) => c.url.includes("admin.html"));
      return aba ? aba.focus() : self.clients.openWindow(url);
    })
  );
});

// Aviso push (enviado pela Cloud Function, mesmo com o app fechado)
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { /* sem conteúdo */ }
  const dados = d.data || d;
  e.waitUntil(self.registration.showNotification(dados.titulo || "Nova inscrição", {
    body: dados.corpo || "Chegou uma nova inscrição no evento.",
    icon: "icons/icon-192.png", badge: "icons/icon-192.png", tag: "inscricao", renotify: true,
    data: { url: dados.url || "admin.html" },
  }));
});
