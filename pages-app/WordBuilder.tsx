import {useEffect,useRef,useState} from 'react';
import {ChevronLeft} from 'lucide-react';
import {words} from './lib/course';
import {isMark,spellingTokens,matchesSpelling} from './lib/spelling';
import {playAnswerSound} from './lib/answer-sound';
type Props={ids:number[];sound:boolean;onSuccess:()=>void;back:()=>void};
export function WordBuilder({ids,sound,onSuccess,back}:Props){
 const [order]=useState(()=>[...ids]),[index,I]=useState(0);
 return <><button className="textbtn" onClick={back}><ChevronLeft size={17}/>Мой словарь</button><h1>Собрать слова</h1><p className="intro">Слова, которые пока трудно вспомнить. Выбирайте буквы и харакаты по порядку; слово соединится справа налево.</p>{!order.length?<div className="empty"><h2>Трудных слов пока нет</h2><p>Повторяйте карточки. Здесь появятся только слова, на которых вы нажали «Не помню» в карточках.</p></div>:index>=order.length?<div className="empty"><h2>Слова собраны!</h2><p>Вы потренировали {order.length} трудных слов.</p><button className="primary" onClick={()=>I(0)}>Повторить сборку</button></div>:<SpellingRound key={index} id={order[index]} index={index} total={order.length} sound={sound} onSuccess={onSuccess} next={()=>I(i=>i+1)}/>}</>;
}
function SpellingRound({id,index,total,sound,onSuccess,next}:{id:number;index:number;total:number;sound:boolean;onSuccess:()=>void;next:()=>void}){
 const word=words[id],tokens=spellingTokens(word.ar);
 const [bank]=useState(()=>tokens.map((_,i)=>({i,key:Math.random()})).sort((a,b)=>a.key-b.key).map(t=>t.i));
 const [selected,S]=useState<number[]>([]),[feedback,F]=useState(''),[hint,H]=useState(false);const busy=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 function choose(token:number){if(busy.current||selected.includes(token))return;const answer=[...selected,token];S(answer);F('');if(answer.length===tokens.length){const correct=matchesSpelling(answer.map(t=>tokens[t]),word.ar);if(sound)playAnswerSound(correct);if(correct){busy.current=true;F('Верно!');onSuccess();timer.current=setTimeout(next,700)}else F('Проверьте буквы и харакаты. Уберите лишний знак из ответа или начните заново.');}}
 const label=(t:string)=>isMark(t)?'◌'+t:t;
 return <section className="study-card"><span className="eyebrow">СЛОВО {index+1} / {total}</span><h2 className="practice-prompt">{word.ru}</h2><div className="sentence-builder spelling-result" dir="rtl" lang="ar" aria-label="Собранное слово">{selected.length?<span className="arabic">{selected.map(t=>tokens[t]).join('')}</span>:<span className="muted" lang="ru">Начните с первой буквы</span>}</div><div className="spelling-selected" dir="rtl" lang="ar">{selected.map((token,i)=><button className="letter-token selected" disabled={busy.current} key={token} onClick={()=>{S(s=>s.filter((_,j)=>j!==i));F('')}} aria-label={'Убрать '+label(tokens[token])}>{label(tokens[token])}</button>)}</div><div className="word-bank letter-bank" dir="rtl" lang="ar">{bank.map(token=><button className="letter-token" key={token} disabled={selected.includes(token)||busy.current} onClick={()=>choose(token)} aria-label={'Добавить '+label(tokens[token])}>{label(tokens[token])}</button>)}</div><p role="status">{feedback||'Буквы и харакаты выбираются отдельно. Пунктирный кружок лишь помогает увидеть харакат.'}</p><div className="spelling-tools"><button className="textbtn" disabled={busy.current} onClick={()=>{S([]);F('')}}>Начать заново</button><button className="textbtn" disabled={busy.current} onClick={()=>H(!hint)}>{hint?'Скрыть подсказку':'Показать слово'}</button></div>{hint&&<div className="arabic" lang="ar" dir="rtl">{word.ar}</div>}</section>;
}
