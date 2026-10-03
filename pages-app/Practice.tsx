import {useEffect,useRef,useState} from 'react';
import {lessons,words} from './lib/course';
import {formsFor,practicedVerbs,type VerbForm} from './lib/verb-forms';
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
 const verbs=practicedVerbs(completed),[index,I]=useState(0);
 const verb=verbs[index];
 return <><div className="eyebrow">ВРЕМЯ И ЛИЦО</div><h1>Глаголы</h1><p className="intro">Выберите форму по русской фразе: настоящее, прошедшее или будущее время и нужное лицо. Сначала познакомьтесь с формами изученного глагола.</p>{!verbs.length?<div className="empty"><h2>Глаголы откроются после урока 8</h2><p>Сначала изучите «Первые действия».</p></div>:!verb?<div className="empty"><h2>Формы глаголов повторены!</h2><button className="primary" onClick={()=>I(0)}>Практиковаться ещё раз</button></div>:<VerbSet key={verb.id} id={verb.id} sound={sound} onSuccess={onSuccess} next={()=>I(i=>i+1)}/>}</>;
}
function VerbSet({id,sound,onSuccess,next}:{id:number;sound:boolean;onSuccess:()=>void;next:()=>void}){
 const [studied,Studied]=useState(false),[index,I]=useState(0);const forms=formsFor(id);
 if(!studied)return <section className="study-card"><span className="eyebrow">ФОРМЫ ИЗУЧЕННОГО ГЛАГОЛА</span><div className="arabic" lang="ar" dir="rtl">{words[id].ar}</div><div className="verb-form-grid">{forms.map(f=><div key={f.ar}><span className="arabic" lang="ar" dir="rtl">{f.ar}</span><strong>{f.ru}</strong><small>{f.tense}</small></div>)}</div><button className="primary" onClick={()=>Studied(true)}>Практиковать формы</button></section>;
 return <VerbQuestion key={index} form={forms[index]} forms={forms} index={index} sound={sound} onSuccess={onSuccess} next={()=>index+1<forms.length?I(i=>i+1):next()}/>;
}
function VerbQuestion({form,forms,index,sound,onSuccess,next}:{form:VerbForm;forms:VerbForm[];index:number;sound:boolean;onSuccess:()=>void;next:()=>void}){
 const [options]=useState(()=>shuffle([form,...shuffle(forms.filter(f=>f.ar!==form.ar)).slice(0,3)]));
 const [feedback,F]=useState(''),[wrong,W]=useState('');const busy=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 function answer(option:VerbForm){if(busy.current)return;const correct=option.ar===form.ar;if(sound)playAnswerSound(correct);if(!correct){W(option.ar);F(`Это «${option.ru.toLowerCase()}». Попробуйте ещё раз.`);return;}busy.current=true;W('');F('Верно!');onSuccess();timer.current=setTimeout(next,600);}
 return <section className="study-card"><span className="eyebrow">ФОРМА {index+1} / {forms.length}</span><h2 className="practice-prompt">{form.ru}</h2><p>Выберите нужную форму глагола.</p><div className="answers verb-answers">{options.map(f=><button className={'arabic '+(wrong===f.ar?'incorrect':busy.current&&f.ar===form.ar?'correct':'')} lang="ar" dir="rtl" disabled={busy.current} key={f.ar} onClick={()=>answer(f)}>{f.ar}</button>)}</div><p role="status">{feedback||'Учитывайте время и лицо.'}</p></section>;
}
