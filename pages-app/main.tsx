import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './style.css';
createRoot(document.getElementById('root')!).render(<App/>);
// Retire the earlier cache-first worker, which otherwise serves the old app.
if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(registrations=>{for(const r of registrations)if(r.scope===new URL('./',location.href).href)void r.unregister();}).catch(()=>{});}
