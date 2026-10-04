import {words,type Progress} from './course';
export function dictionaryWords(p:Progress,now:number){return words.filter(w=>p.completed.includes(w.lesson)).sort((a,b)=>{
 const da=p.reviews[a.id]?.due??0,db=p.reviews[b.id]?.due??0;
 const pendingA=da<=now,pendingB=db<=now;
 if(pendingA!==pendingB)return pendingA?-1:1;
 return pendingA?b.lesson-a.lesson||a.id-b.id:da-db||b.lesson-a.lesson||a.id-b.id;
})}
