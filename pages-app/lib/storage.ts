import {validateAlphabet} from './alphabet';
import {initial,lessons,words,lessonSteps,isWordLearned,type Progress} from './course';
export const LEGACY_KEY='arabikos-progress-v2';
export const KEY='arabikos-madinah-v1';
export function validateProgress(p:Progress):boolean {
 if(p?.lessonResults!==undefined){if(!p.lessonResults||typeof p.lessonResults!=='object'||Array.isArray(p.lessonResults))return false;for(const [id,r] of Object.entries(p.lessonResults))if(!/^\d{1,2}$/.test(id)||!p.completed?.includes(Number(id))||!r||!Number.isInteger(r.best)||r.best<0||r.best>100||!Number.isInteger(r.last)||r.last<0||r.last>r.best||!Number.isSafeInteger(r.runs)||r.runs<1)return false;}
 if(p?.alphabet!==undefined&&!validateAlphabet(p.alphabet))return false;
 if(!p||!Array.isArray(p.completed)||!Number.isInteger(p.lesson)||p.lesson<0||p.lesson>=lessons.length||!Number.isInteger(p.step)||p.step<0||p.step>=lessonSteps(p.lesson))return false;
 if(p.completed.length>lessons.length||p.completed.some((v,i)=>v!==i)||p.lesson!==Math.min(p.completed.length,lessons.length-1))return false;
 if(!p.reviews||!p.days||typeof p.reviews!=='object'||typeof p.days!=='object'||Array.isArray(p.reviews)||Array.isArray(p.days))return false;
 for(const [id,r] of Object.entries(p.reviews))if(!/^\d{1,3}$/.test(id)||!words[Number(id)]||!isWordLearned(p,Number(id))||!r||!Number.isInteger(r.level)||r.level<0||r.level>9||!Number.isFinite(r.due)||r.due<0||!Number.isSafeInteger(r.seen)||r.seen<0||(r.misses!==undefined&&(!Number.isSafeInteger(r.misses)||r.misses<0))||(r.lastKnown!==undefined&&typeof r.lastKnown!=='boolean')||(r.spellingCleared!==undefined&&typeof r.spellingCleared!=='boolean'))return false;
 return Object.entries(p.days).every(([d,n])=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isSafeInteger(n)&&n>=0);
}
export function normalizeProgress(data:Progress):Progress {
 if(data?.completed?.length===5&&data.lesson===4&&data.step===0)data={...data,lesson:5};
 if(!validateProgress(data))throw Error('Сохранённые данные не удалось прочитать. Они не удалены.');return data;
}
export function readProgress(storage:Pick<Storage,'getItem'>):Progress {
 const raw=storage.getItem(KEY);if(!raw){const n=structuredClone(initial);try{const old=JSON.parse(storage.getItem(LEGACY_KEY)||'null');if(old){if(validateAlphabet(old.alphabet))n.alphabet=old.alphabet;else if(old.completed?.length)n.alphabet={status:'skipped',passed:[]};if(old.days&&typeof old.days==='object'&&!Array.isArray(old.days))n.days=Object.fromEntries(Object.entries(old.days).filter(([d,v])=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isSafeInteger(v)&&Number(v)>=0)) as Record<string,number>;}}catch{}return n;}
 return normalizeProgress(JSON.parse(raw));
}
export function writeProgress(storage:Pick<Storage,'setItem'>,data:Progress){if(!validateProgress(data))throw Error('Некорректный прогресс');storage.setItem(KEY,JSON.stringify(data));}
