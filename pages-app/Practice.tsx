import {useEffect,useRef,useState} from 'react';
import {lessons,words} from './lib/course';
import {playAnswerSound} from './lib/answer-sound';
type Props={completed:number[];sound:boolean;onSuccess:()=>void};
function shuffle<T>(items:T[]){return items.map(v=>({v,k:Math.random()})).sort((a,b)=>a.k-b.k).map(x=>x.v)}
export function SentencePractice({completed,sound,onSuccess}:Props){
 const examples=lessons.filter(l=>completed.includes(l.id)).slice().reverse().flatMap(l=>l.examples);
 const [index,I]=useState(0);
 const example=examples[index];
 return <><div className="eyebrow">ИЗ ИЗУЧЕННЫХ СЛОВ</div><h1>Практика предложений</h1><p className="intro">Прочитайте по-русски и соберите предложение по-арабски. Слова располагаются справа налево. После каждого пройденного урока добавляются 3 предложения; новые идут первыми.</p>{!examples.length?<div className="empty"><h2>Сначала пройдите первый урок</h2><p>Здесь появятся только предложения из полностью пройденных уроков.</p></div>:!example?<div className="empty"><h2>Все предложения собраны!</h2><p>Вы повторили {examples.length} предложений из пройденных уроков.</p><button className="primary" onClick={()=>I(0)}>Практиковаться ещё раз</button></div>:<SentenceRound key={index} example={example} count={index} sound={sound} onSuccess={onSuccess} next={()=>I(i=>i+1)}/>}</>;
}
function SentenceRound({example,count,sound,onSuccess,next}:{example:typeof lessons[number]['examples'][number];count:number;sound:boolean;onSuccess:()=>void;next:()=>void}){
 const [selected,S]=useState<number[]>([]),[feedback,F]=useState('');
 const [bank]=useState(()=>shuffle(example.ids.map((_,i)=>i)));const busy=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 function choose(token:number){if(busy.current||selected.includes(token))return;const answer=[...selected,token];S(answer);F('');if(answer.length===example.ids.length){const correct=answer.every((t,i)=>example.ids[t]===example.ids[i]);if(sound)playAnswerSound(correct);if(correct){busy.current=true;F('Верно!');onSuccess();timer.current=setTimeout(next,600)}else F('Порядок пока неверный. Нажмите на слово в ответе, чтобы убрать его.');}}
 return <section className="study-card"><span className="eyebrow">ПРЕДЛОЖЕНИЕ {count+1}</span><h2 className="practice-prompt">{example.ru}</h2><div className="sentence-builder" dir="rtl" lang="ar" aria-label="Ваше предложение">{selected.map((token,i)=><button className="word-token" key={token} disabled={busy.current} onClick={()=>{S(s=>s.filter((_,j)=>j!==i));F('')}}>{words[example.ids[token]].ar}</button>)}{!selected.length&&<span className="muted" lang="ru">Выберите слова ниже</span>}</div><div className="word-bank" dir="rtl" lang="ar">{bank.map(token=><button className="word-token" disabled={selected.includes(token)||busy.current} key={token} onClick={()=>choose(token)}>{words[example.ids[token]].ar}</button>)}</div><p role="status">{feedback||'Проверка происходит автоматически.'}</p><button className="textbtn center" disabled={busy.current} onClick={()=>{S([]);F('')}}>Собрать заново</button></section>;
}
export function VerbPractice({completed,sound,onSuccess}:Props){
 const verbs=words.filter(w=>w.lesson===7&&completed.includes(w.lesson));
 const [index,I]=useState(0),[feedback,F]=useState(''),[count,C]=useState(0);const busy=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const verb=verbs[index%Math.max(1,verbs.length)];const [options,O]=useState<typeof verbs>([]);
 useEffect(()=>{O(verb?shuffle([verb,...shuffle(verbs.filter(w=>w.id!==verb.id)).slice(0,3)]):[]);F('');busy.current=false;},[index,verb]);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 function answer(id:number){if(busy.current)return;const correct=id===verb.id;if(sound)playAnswerSound(correct);if(!correct){F('Попробуйте ещё раз.');return;}busy.current=true;F('Верно!');C(c=>c+1);onSuccess();timer.current=setTimeout(()=>I(i=>i+1),600);}
 return <><div className="eyebrow">ПРОЙДЕННЫЕ ДЕЙСТВИЯ</div><h1>Глаголы</h1><p className="intro">Вспоминайте изученные глаголы: прошедшее время, форма «он».</p>{!verb?<div className="empty"><h2>Глаголы откроются после урока 8</h2><p>Сначала изучите «Первые действия». Новые слова здесь не используются.</p></div>:<section className="study-card"><span className="eyebrow">ВЕРНЫХ ОТВЕТОВ: {count}</span><h2 className="practice-prompt">{verb.ru}</h2><p>Выберите арабский глагол.</p><div className="answers verb-answers">{options.map(w=><button className="arabic" lang="ar" dir="rtl" disabled={busy.current} key={w.id} onClick={()=>answer(w.id)}>{w.ar}</button>)}</div><p role="status">{feedback||'После верного ответа — следующий глагол.'}</p></section>}</>;
}
