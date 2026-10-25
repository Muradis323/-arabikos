import {useRef,useState} from 'react';
import {type ReadingProgress} from './lib/course';
import {scheduleReview} from './lib/repetition';
import {playAnswerSound} from './lib/answer-sound';
export function StoryReview({reading,onChange,sound,onReward}:{reading:ReadingProgress;onChange:(r:ReadingProgress)=>void;sound:boolean;onReward?:()=>void}){
 const lock=useRef(false);const [queue,Q]=useState(()=>Object.keys(reading.cards).filter(k=>reading.cards[k].due<=Date.now())),[flip,F]=useState(false),[feedback,M]=useState('');const key=queue[0],card=reading.cards[key];
 function answer(ok:boolean){if(!card||lock.current)return;lock.current=true;if(sound)playAnswerSound(ok);const updated=scheduleReview(card,ok,Date.now());onChange({...reading,cards:{...reading.cards,[key]:{...card,...updated}}});if(ok)onReward?.();Q(q=>{const rest=q.slice(1);if(!ok)rest.splice(Math.min(3,rest.length),0,key);return rest});F(false);M(ok?'Слово повторено.':'Забытое слово вернётся в этой подборке.')}
 return <><div className="eyebrow">ВЫБРАННЫЕ ВАМИ СЛОВА</div><h1>Слова чтения</h1><p role="status">{feedback}</p>{card?<><p>Осталось: {queue.length}</p><button className="flashcard" onClick={()=>{lock.current=false;F(v=>!v)}} aria-label="Показать другую сторону"><strong className={flip?'':'arabic giant'} lang={flip?'ru':'ar'}>{flip?card.ru:card.ar}</strong><small>Нажмите, чтобы перевернуть</small></button>{flip&&<div className="review-actions"><button onClick={()=>answer(false)}>Не помню</button><button className="primary" onClick={()=>answer(true)}>Помню</button></div>}</>:<section className="empty"><h2>На сейчас всё!</h2><p>Выбранные слова сохраняются и вернутся по расписанию повторений.</p></section>}</>;
}
