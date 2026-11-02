const CACHE='brew46-v25';
const ASSETS=[
  './','./index.html','./grinder.html','./theme.css?v=18','./coffee-icons.svg','./timer-bg.webp','./footer-banner.webp','./footer-v25.webp','./manifest.webmanifest','./apple-touch-icon.png','./icon.svg'
];
const FOOTER_STYLE=`<style id="footer-v25-hotfix">
.brand{position:relative!important;overflow:visible!important;border:0!important;background:transparent!important;box-shadow:none!important;border-radius:0!important}
.brand img{content:url('./footer-v25.webp')!important;display:block!important;width:100%!important;max-width:none!important;height:auto!important;margin:0!important;transform:translateY(-18px)!important;transform-origin:center top!important}
@media(max-width:430px){.brand img{transform:translateY(-16px)!important}}
</style>`;
function injectFooter(html){
  if(html.includes('footer-v25-hotfix'))return html;
  return html.replace('</head>',FOOTER_STYLE+'</head>');
}
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request,{cache:'no-store'}).then(async response=>{
      const type=response.headers.get('content-type')||'';
      if(!type.includes('text/html'))return response;
      const html=injectFooter(await response.text());
      const patched=new Response(html,{status:response.status,statusText:response.statusText,headers:response.headers});
      caches.open(CACHE).then(cache=>cache.put(request,patched.clone()));
      return patched;
    }).catch(async()=>{
      const cached=await caches.match(request)||await caches.match('./index.html')||await caches.match('./');
      if(!cached)return cached;
      const type=cached.headers.get('content-type')||'';
      if(!type.includes('text/html'))return cached;
      const html=injectFooter(await cached.text());
      return new Response(html,{status:cached.status,statusText:cached.statusText,headers:cached.headers});
    }));
    return;
  }
  const url=new URL(request.url);
  if(url.pathname.endsWith('/theme.css')){
    event.respondWith(fetch(request,{cache:'no-store'}).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));return response}).catch(()=>caches.match(request)));
    return;
  }
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));return response})));
});
