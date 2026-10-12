const C='somiphos-v3';
const FILES=['./','index.html','manifest.webmanifest','favicon.ico','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/favicon-32.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{
 // cache each file separately: one missing file must not break offline mode
 e.waitUntil(caches.open(C).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>null)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
 e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const fromCache=()=>caches.match(e.request,{ignoreSearch:true}).then(m=>m||caches.match('index.html'));
 // network first (to receive updates), but fall back to the cache when offline or the network is slow
 const net=fetch(e.request).then(r=>{
  if(r&&r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp))}
  return r;
 });
 const slow=new Promise((_,rej)=>setTimeout(()=>rej(new Error('slow')),4000));
 e.respondWith(Promise.race([net,slow]).catch(fromCache));
});
