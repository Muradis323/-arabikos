import {lessons,words,BOOK1_COUNT,type Progress} from './course';
export function restoreThroughLesson(progress:Progress,count:number):Progress{
 if(!Number.isInteger(count)||count<1||count>lessons.length)throw Error('Некорректный урок');
 if(count>BOOK1_COUNT&&!progress.book1Exam?.passed)throw Error('Для второго тома сначала сдайте экзамен первого тома.');
 if(count<=progress.completed.length)return progress;
 const completed=Array.from({length:count},(_,i)=>i),reviews={...progress.reviews};
 for(const w of words)if(w.lesson<count&&!reviews[w.id])reviews[w.id]={level:0,due:0,seen:0};
 return {...progress,attempt:undefined,attempts:undefined,sentenceSession:undefined,completed,reviews,lesson:Math.min(count,lessons.length-1),step:0};
}
