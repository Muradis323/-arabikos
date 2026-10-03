import {type Progress} from './course';
import {validateProgress} from './storage';
export function makeBackup(progress:Progress){return JSON.stringify({app:'arabikos',version:1,exportedAt:new Date().toISOString(),progress},null,2)}
export function parseBackup(raw:string):Progress{
 let data;try{data=JSON.parse(raw)}catch{throw Error('Это не JSON-файл прогресса.');}
 if(data?.app!=='arabikos'||data.version!==1||!validateProgress(data.progress))throw Error('Файл не подходит или содержит повреждённый прогресс.');
 const p=data.progress as Progress;
 return {completed:[...p.completed],lesson:p.lesson,step:p.step,reviews:Object.fromEntries(Object.entries(p.reviews).map(([id,r])=>[id,{level:r.level,due:r.due,seen:r.seen}])),days:{...p.days}};
}
