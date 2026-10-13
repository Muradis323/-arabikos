import {awardFreeze,reconcileStreak,dayKey} from './streak';
import {lessons,words,type Progress} from './course';
export function finishLesson(p:Progress,id:number,score:number,now=new Date()):Progress{
 if(!Number.isInteger(id)||id<0||id>=lessons.length||id>p.completed.length||!Number.isInteger(score)||score<0||score>100)throw Error('Некорректный результат урока');
 p=reconcileStreak(p,now);
 const replay=p.completed.includes(id),completed=replay?[...p.completed]:[...p.completed,id],reviews={...p.reviews};
 if(!replay)for(const w of words.filter(w=>w.lesson===id))if(!reviews[w.id])reviews[w.id]={level:0,due:now.getTime(),seen:0};
 const old=p.lessonResults?.[id],day=dayKey(now);
 const result={...p,completed,reviews,...(!replay?{lesson:Math.min(completed.length,lessons.length-1),step:0}:{}),lessonResults:{...p.lessonResults,[id]:{best:Math.max(old?.best??0,score),last:score,runs:(old?.runs??0)+1}},days:{...p.days,[day]:(p.days[day]??0)+1}};
 return score===100?awardFreeze(result,now):result;
}
export const totalPoints=(p:Progress)=>Object.values(p.lessonResults??{}).reduce((sum,r)=>sum+r.best,0);
