import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './style.css';
createRoot(document.getElementById('root')!).render(<App/>);
if('serviceWorker' in navigator){
 window.addEventListener('load',()=>{navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>{
 const announce=()=>{if(r.waiting){window.dispatchEvent(new CustomEvent('arabikos-update',{detail:r.waiting}));}};
 announce();r.addEventListener('updatefound',()=>{const worker=r.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)announce()})});
 void navigator.storage?.persist?.();
 }).catch(()=>{});});
}
