const CACHE='brew46-v16';
const ASSETS=[
  './','./index.html','./grinder.html','./theme.css','./coffee-icons.svg','./timer-bg.webp','./footer-banner.webp','./manifest.webmanifest','./apple-touch-icon.png','./icon.svg'
];
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request,{cache:'no-store'}).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));return response}).catch(async()=>await caches.match(request)||await caches.match('./index.html')||await caches.match('./')));
    return;
  }
  event.respondWith(caches.match(request,{ignoreSearch:true}).then(cached=>cached||fetch(request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));return response})));
});
