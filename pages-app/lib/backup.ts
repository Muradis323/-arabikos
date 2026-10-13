import {CURRICULUM,type Progress} from './course';
import {normalizeProgress} from './storage';
export function makeBackup(progress:Progress){return JSON.stringify({app:'arabikos',version:2,course:CURRICULUM,exportedAt:new Date().toISOString(),progress},null,2)}
export function parseBackup(raw:string):Progress{
 let data;try{data=JSON.parse(raw)}catch{throw Error('Это не JSON-файл прогресса.');}
 if(data?.app==='arabikos'&&data.version===1)throw Error('Этот файл относится к прежнему курсу. Он не подходит к урокам Мединского курса; исходный файл сохраните отдельно.');
 if(data?.app!=='arabikos'||data.version!==2||data.course!==CURRICULUM)throw Error('Файл не подходит или содержит повреждённый прогресс.');
 const p=normalizeProgress(data.progress as Progress);
 return {...(p.streakProtection?{streakProtection:{...p.streakProtection,frozenDays:[...p.streakProtection.frozenDays]}}:{}),...(p.mastered?{mastered:[...p.mastered]}:{}),...(p.lessonResults?{lessonResults:Object.fromEntries(Object.entries(p.lessonResults).map(([id,r])=>[id,{...r}]))}:{}),...(p.alphabet?{alphabet:{status:p.alphabet.status,passed:[...p.alphabet.passed]}}:{}),completed:[...p.completed],lesson:p.lesson,step:p.step,reviews:Object.fromEntries(Object.entries(p.reviews).map(([id,r])=>[id,{level:r.level,due:r.due,seen:r.seen,...(r.misses!==undefined?{misses:r.misses}:{}),...(r.lastKnown!==undefined?{lastKnown:r.lastKnown}:{}),...(r.spellingCleared!==undefined?{spellingCleared:r.spellingCleared}:{})}])),days:{...p.days}};
}
