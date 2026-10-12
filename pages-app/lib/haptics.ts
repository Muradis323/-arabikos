export const HAPTICS_KEY='arabikos-haptics';
export function hapticsEnabled(){try{return localStorage.getItem(HAPTICS_KEY)!=='off'}catch{return true}}
export function hapticsSupported(){return typeof navigator!=='undefined'&&typeof navigator.vibrate==='function'}
export function tactile(kind:'tap'|'success'|'error'='tap'){
 if(!hapticsEnabled()||!hapticsSupported())return false;
 try{return navigator.vibrate(kind==='tap'?6:kind==='success'?[8,24,8]:18)}catch{return false}
}
export function saveHaptics(enabled:boolean){try{localStorage.setItem(HAPTICS_KEY,enabled?'on':'off')}catch{}if(!enabled&&hapticsSupported())try{navigator.vibrate(0)}catch{}}
