import {type Progress} from './course';
import {normalizeProgress} from './storage';
export function makeBackup(progress:Progress){return JSON.stringify({app:'arabikos',version:1,exportedAt:new Date().toISOString(),progress},null,2)}
export function parseBackup(raw:string):Progress{
 let data;try{data=JSON.parse(raw)}catch{throw Error('Это не JSON-файл прогресса.');}
 if(data?.app!=='arabikos'||data.version!==1)throw Error('Файл не подходит или содержит повреждённый прогресс.');
 const p=normalizeProgress(data.progress as Progress);
 return {...(p.alphabet?{alphabet:{status:p.alphabet.status,passed:[...p.alphabet.passed]}}:{}),completed:[...p.completed],lesson:p.lesson,step:p.step,reviews:Object.fromEntries(Object.entries(p.reviews).map(([id,r])=>[id,{level:r.level,due:r.due,seen:r.seen,...(r.misses!==undefined?{misses:r.misses}:{}),...(r.lastKnown!==undefined?{lastKnown:r.lastKnown}:{})}])),days:{...p.days}};
}
