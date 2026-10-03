import {initial,type Progress} from './course';
export const KEY='arabikos-progress-v2';
export function validateProgress(p:Progress):boolean {
 if(!p||!Array.isArray(p.completed)||!Number.isInteger(p.lesson)||p.lesson<0||p.lesson>9||!Number.isInteger(p.step)||p.step<0||p.step>22)return false;
 if(p.completed.length>10||p.completed.some((v,i)=>v!==i)||p.lesson!==Math.min(p.completed.length,9))return false;
 if(!p.reviews||!p.days||Array.isArray(p.reviews)||Array.isArray(p.days))return false;
 for(const [id,r] of Object.entries(p.reviews))if(!/^\d{1,2}$/.test(id)||!p.completed.includes(Math.floor(Number(id)/10))||!r||!Number.isInteger(r.level)||r.level<0||r.level>9||!Number.isFinite(r.due)||r.due<0||!Number.isInteger(r.seen)||r.seen<0)return false;
 return Object.entries(p.days).every(([d,n])=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isInteger(n)&&n>=0);
}
export function readProgress(storage:Pick<Storage,'getItem'>):Progress {
 const raw=storage.getItem(KEY);if(!raw)return structuredClone(initial);
 const data=JSON.parse(raw);if(!validateProgress(data))throw Error('Сохранённые данные не удалось прочитать. Они не удалены.');return data;
}
export function writeProgress(storage:Pick<Storage,'setItem'>,data:Progress){if(!validateProgress(data))throw Error('Некорректный прогресс');storage.setItem(KEY,JSON.stringify(data));}
