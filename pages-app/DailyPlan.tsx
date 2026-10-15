import {type Progress,lessons} from './lib/course';
import {dayKey} from './lib/streak';
export function DailyPlan({progress,due,open,lesson}:{progress:Progress;due:number;open:(view:string)=>void;lesson:()=>void}){
 const today=progress.daily?.[dayKey()]??{reviews:0,lessonSteps:0,read:false};
 return <section className="daily-plan"><div><span className="eyebrow">НЕБОЛЬШОЙ ШАГ СЕГОДНЯ</span><h2>План на сегодня</h2></div><div className="daily-tasks"><button onClick={()=>open('review')}><b>{today.reviews>=5?'✓':'01'}</b><span>Повторить слова<small>{today.reviews>=5?'Пять ответов уже есть':due?`${due} слов готовы · начните с пяти`:'На сегодня повторений нет'}</small></span></button><button onClick={lesson}><b>{today.lessonSteps>=8?'✓':'02'}</b><span>Короткая часть урока<small>{today.lessonSteps>=8?'Восемь шагов выполнены':progress.completed.length===lessons.length?'Повторить знакомый урок':'Продолжить с сохранённого места'}</small></span></button><button onClick={()=>open('stories')}><b>{today.read?'✓':'03'}</b><span>Почитать по-арабски<small>{today.read?'Чтение отмечено':'Один небольшой рассказ'}</small></span></button></div></section>;
}
