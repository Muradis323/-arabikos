import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
export default defineConfig({root:import.meta.dirname,base:'./',plugins:[react(),{name:'arabikos-offline',closeBundle(){
 const root=resolve(import.meta.dirname,'../pages-dist'),html=readFileSync(resolve(root,'index.html'),'utf8'),assets=readdirSync(resolve(root,'assets')).map(f=>'./assets/'+f),version=createHash('sha256').update(html).digest('hex').slice(0,12);
 const files=['./','./index.html','./favicon.svg','./apple-touch-icon.png','./manifest.webmanifest',...assets];
 writeFileSync(resolve(root,'sw.js'),`const CACHE='arabikos-app-${version}';const FILES=${JSON.stringify(files)};
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(FILES);if(!self.registration.active)await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if((key.startsWith('arabikos-app-')||key==='arabikos-v1')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')event.waitUntil(self.skipWaiting());});
self.addEventListener('fetch',event=>{const request=event.request,url=new URL(request.url);if(request.method!=='GET')return;if(url.origin===self.location.origin){if(!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;event.respondWith((async()=>{const cache=await caches.open(CACHE);if(request.mode==='navigate'){return await cache.match('./index.html')||fetch(request)}const stored=await cache.match(request);if(stored)return stored;const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response})());}else if(['fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname)){event.respondWith((async()=>{const cache=await caches.open(CACHE),stored=await cache.match(request);if(stored)return stored;const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response})());}});
`);
 }}],build:{outDir:'../pages-dist',emptyOutDir:true},css:{postcss:{plugins:[]}}});
