// Retire the old cache-first Arabikos v1 worker without touching localStorage.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 await caches.delete('arabikos-v1');
 await self.registration.unregister();
 const tabs=await self.clients.matchAll({type:'window',includeUncontrolled:true});
 for(const tab of tabs)if(tab.url.startsWith(self.registration.scope))await tab.navigate(tab.url);
})()));
