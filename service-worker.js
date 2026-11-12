const CACHE='ttc-shift-log:'+self.registration.scope+':v19.3.0';
const ASSETS=['./','./index.html','./styles.css?v=19.3.0','./core.js?v=19.3.0','./spareboard.js?v=19.3.0','./app.js?v=19.3.0','./storage.js?v=19.3.0','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim());});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||!event.request.url.startsWith(self.registration.scope))return;
 if(event.request.mode==='navigate')event.respondWith(caches.open(CACHE).then(cache=>cache.match('./index.html')));
 else event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request)).then(hit=>hit||fetch(event.request)));
});
