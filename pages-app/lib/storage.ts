import {initial,lessons,words,type Progress} from './course';
export const KEY='arabikos-progress-v2';
export function validateProgress(p:Progress):boolean {
 if(!p||!Array.isArray(p.completed)||!Number.isInteger(p.lesson)||p.lesson<0||p.lesson>=lessons.length||!Number.isInteger(p.step)||p.step<0||p.step>22)return false;
 if(p.completed.length>lessons.length||p.completed.some((v,i)=>v!==i)||p.lesson!==Math.min(p.completed.length,lessons.length-1))return false;
 if(!p.reviews||!p.days||typeof p.reviews!=='object'||typeof p.days!=='object'||Array.isArray(p.reviews)||Array.isArray(p.days))return false;
 for(const [id,r] of Object.entries(p.reviews))if(!/^\d{1,3}$/.test(id)||!words[Number(id)]||!p.completed.includes(words[Number(id)].lesson)||!r||!Number.isInteger(r.level)||r.level<0||r.level>9||!Number.isFinite(r.due)||r.due<0||!Number.isSafeInteger(r.seen)||r.seen<0||(r.misses!==undefined&&(!Number.isSafeInteger(r.misses)||r.misses<0))||(r.lastKnown!==undefined&&typeof r.lastKnown!=='boolean'))return false;
 return Object.entries(p.days).every(([d,n])=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isSafeInteger(n)&&n>=0);
}
export function normalizeProgress(data:Progress):Progress {
 // A completed legacy ten-lesson course continues at lesson eleven.
 if(data&&Array.isArray(data.completed)&&data.completed.length===10&&data.lesson===9&&data.step===0)data={...data,lesson:10};
 if(!validateProgress(data))throw Error('Сохранённые данные не удалось прочитать. Они не удалены.');return data;
}
export function readProgress(storage:Pick<Storage,'getItem'>):Progress {
 const raw=storage.getItem(KEY);if(!raw)return structuredClone(initial);
 return normalizeProgress(JSON.parse(raw));
}
export function writeProgress(storage:Pick<Storage,'setItem'>,data:Progress){if(!validateProgress(data))throw Error('Некорректный прогресс');storage.setItem(KEY,JSON.stringify(data));}
