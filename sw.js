const CACHE='brew46-v27';
const ASSETS=[
  './','./index.html','./grinder.html','./theme.css?v=18','./coffee-icons.svg','./timer-bg.webp','./footer-v25.webp','./manifest.webmanifest','./apple-touch-icon.png','./icon.svg'
];
const FOOTER_CSS=`
/* v27 transparent footer */
.brand{
  position:relative!important;
  overflow:visible!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
  border-radius:0!important;
}
.brand img{
  display:block!important;
  width:100%!important;
  max-width:none!important;
  height:auto!important;
  margin:0!important;
  transform:translateY(-18px)!important;
  transform-origin:center top!important;
}
@media(max-width:430px){
  .brand img{transform:translateY(-16px)!important}
}
`;
function withFooterCss(response){
  return response.text().then(css=>new Response(css+'\n'+FOOTER_CSS,{
    status:response.status,
    statusText:response.statusText,
    headers:response.headers
  }));
}
self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});
self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);

  if(url.pathname.endsWith('/footer-banner.webp')){
    event.respondWith(
      caches.match('./footer-v25.webp').then(cached=>cached||fetch('./footer-v25.webp',{cache:'no-store'}))
    );
    return;
  }

  if(request.mode==='navigate'){
    event.respondWith(
      fetch(request,{cache:'no-store'})
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(request,copy));
          return response;
        })
        .catch(async()=>await caches.match(request)||await caches.match('./index.html')||await caches.match('./'))
    );
    return;
  }

  if(url.pathname.endsWith('/theme.css')){
    event.respondWith(
      fetch(request,{cache:'no-store'})
        .then(withFooterCss)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(request,copy));
          return response;
        })
        .catch(async()=>{
          const cached=await caches.match(request);
          return cached||new Response(FOOTER_CSS,{headers:{'Content-Type':'text/css'}});
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached=>cached||fetch(request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(request,copy));
      return response;
    }))
  );
});
