import {lessons,words,type Progress} from './course';
export function restoreThroughLesson(progress:Progress,count:number):Progress{
 if(!Number.isInteger(count)||count<1||count>lessons.length)throw Error('Некорректный урок');
 if(count<=progress.completed.length)return progress;
 const completed=Array.from({length:count},(_,i)=>i),reviews={...progress.reviews};
 for(const w of words)if(w.lesson<count&&!reviews[w.id])reviews[w.id]={level:0,due:0,seen:0};
 return {...progress,completed,reviews,lesson:Math.min(count,lessons.length-1),step:0};
}
