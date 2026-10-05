import {practiceExamples,practiceSession} from './lib/practice-examples';
import {useEffect,useRef,useState} from 'react';
import {lessons,words,lessonLabel} from './lib/course';
import {formsFor,practicedVerbs,type VerbForm} from './lib/verb-forms';
import {playAnswerSound} from './lib/answer-sound';
type Props={completed:number[];sound:boolean;onSuccess:()=>void};
function shuffle<T>(items:T[]){return items.map(v=>({v,k:Math.random()})).sort((a,b)=>a.k-b.k).map(x=>x.v)}
export function SentencePractice({completed,sound,onSuccess}:Props){
 const [selectedLesson,SelectLesson]=useState<number|null>(null),[session,Session]=useState(0);
 const [examples,Examples]=useState(()=>practiceSession(completed));
 const [index,I]=useState(0);
 const example=examples[index];
 function chooseLesson(id:number|null){SelectLesson(id);Examples(practiceSession(completed,examples[0]?.ids.join(','),id));I(0);Session(n=>n+1)}
 return <><div className="eyebrow">ИЗ ИЗУЧЕННЫХ СЛОВ</div><h1>Практика предложений</h1><p className="intro">Выберите пройденный урок или практикуйте все предложения. В каждом уроке — фразы с его новыми словами и уже знакомыми словами предыдущих уроков. Порядок случайный.</p>{completed.length>0&&<><div className="sentence-lesson-picker" aria-label="Выбор урока"><button className={selectedLesson===null?'selected arabic':'arabic'} lang="ar" dir="rtl" aria-label="Все уроки" aria-pressed={selectedLesson===null} onClick={()=>chooseLesson(null)}>كُلُّ الدُّرُوسِ</button>{lessons.filter(l=>completed.includes(l.id)).map(l=><button key={l.id} className={selectedLesson===l.id?'selected arabic':'arabic'} lang="ar" dir="rtl" aria-label={'Урок '+(l.id+1)} aria-pressed={selectedLesson===l.id} onClick={()=>chooseLesson(l.id)}>{lessonLabel(l.id)}</button>)}</div><p className="sentence-session-label"><span className="arabic" lang="ar" dir="rtl">{selectedLesson===null?'كُلُّ الدُّرُوسِ':lessonLabel(selectedLesson)}</span> · {examples.length} предложений</p></>}{!examples.length?<div className="empty"><h2>Сначала пройдите первый урок</h2><p>Здесь появятся только предложения из полностью пройденных уроков.</p></div>:!example?<div className="empty"><h2>Все предложения собраны!</h2><p>Вы повторили {examples.length} предложений {selectedLesson===null?'из пройденных уроков':'выбранного урока'}.</p><button className="primary" onClick={()=>chooseLesson(selectedLesson)}>Практиковаться ещё раз</button></div>:<SentenceRound key={session+':'+index} example={example} count={index} sound={sound} onSuccess={onSuccess} next={()=>I(i=>i+1)}/>}</>;
}
function SentenceRound({example,count,sound,onSuccess,next}:{example:typeof lessons[number]['examples'][number];count:number;sound:boolean;onSuccess:()=>void;next:()=>void}){
 const [selected,S]=useState<number[]>([]),[feedback,F]=useState('');
 const [bank]=useState(()=>shuffle(example.ids.map((_,i)=>i)));const busy=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 function choose(token:number){if(busy.current||selected.includes(token))return;const answer=[...selected,token];S(answer);F('');if(answer.length===example.ids.length){const correct=answer.every((t,i)=>example.ids[t]===example.ids[i]);if(sound)playAnswerSound(correct);if(correct){busy.current=true;F('Верно!');onSuccess();timer.current=setTimeout(next,600)}else F('Порядок пока неверный. Нажмите на слово в ответе, чтобы убрать его.');}}
 return <section className="study-card"><span className="eyebrow">ПРЕДЛОЖЕНИЕ {count+1}</span><h2 className="practice-prompt">{example.ru}</h2><div className="sentence-builder" dir="rtl" lang="ar" aria-label="Ваше предложение">{selected.map((token,i)=><button className="word-token" key={token} disabled={busy.current} onClick={()=>{S(s=>s.filter((_,j)=>j!==i));F('')}}>{words[example.ids[token]].ar}</button>)}{!selected.length&&<span className="muted" lang="ru">Выберите слова ниже</span>}</div><div className="word-bank" dir="rtl" lang="ar">{bank.map(token=><button className="word-token" disabled={selected.includes(token)||busy.current} key={token} onClick={()=>choose(token)}>{words[example.ids[token]].ar}</button>)}</div><p role="status">{feedback||'Проверка происходит автоматически.'}</p><button className="textbtn center" disabled={busy.current} onClick={()=>{S([]);F('')}}>Собрать заново</button></section>;
}
export function VerbPractice({completed,sound,onSuccess}:Props){
 const verbs=practicedVerbs(completed),[selected,S]=useState<number|null>(null),[finished,F]=useState(false),[session,Session]=useState(0);
 const verb=verbs.find(v=>v.id===selected);
 function choose(id:number){S(id);F(false);Session(n=>n+1)}
 function picker(){S(null);F(false)}
 return <><div className="eyebrow">ВРЕМЯ И ЛИЦО</div><h1>Глаголы</h1><p className="intro">Здесь все глаголы из всех полностью пройденных уроков. Нажмите на любой глагол, чтобы сразу практиковать время и лицо.</p>{!verbs.length?<div className="empty"><h2>Пока нет изученных глаголов</h2><p>Пройдите урок, в котором есть глаголы.</p></div>:!verb?<><h2>Какой глагол повторим?</h2><div className="verb-list">{verbs.map(v=><button key={v.id} className="verb-choice" onClick={()=>choose(v.id)}><span className="arabic" lang="ar" dir="rtl">{v.ar}</span><strong>{v.ru}</strong><span aria-hidden="true">›</span></button>)}</div></>:<><button className="textbtn verb-back" onClick={picker}>← Выбрать другой глагол</button>{finished?<section className="empty"><h2>Глагол повторён!</h2><span className="arabic" lang="ar" dir="rtl">{verb.ar}</span><p>Вы потренировали все 9 форм: время и лицо.</p><div className="alphabet-tools"><button className="primary" onClick={picker}>Выбрать другой глагол</button><button className="alphabet-secondary" onClick={()=>choose(verb.id)}>Повторить этот глагол</button></div></section>:<VerbSet key={verb.id+':'+session} id={verb.id} sound={sound} onSuccess={onSuccess} next={()=>F(true)}/>}</>}</>;
}
function VerbSet({id,sound,onSuccess,next}:{id:number;sound:boolean;onSuccess:()=>void;next:()=>void}){
 const [index,I]=useState(0);const forms=formsFor(id);
 return <VerbQuestion key={index} form={forms[index]} forms={forms} index={index} sound={sound} onSuccess={onSuccess} next={()=>index+1<forms.length?I(i=>i+1):next()}/>;
}
function VerbQuestion({form,forms,index,sound,onSuccess,next}:{form:VerbForm;forms:VerbForm[];index:number;sound:boolean;onSuccess:()=>void;next:()=>void}){
 const [options]=useState(()=>shuffle([form,...shuffle(forms.filter(f=>f.ar!==form.ar)).slice(0,3)]));
 const [feedback,F]=useState(''),[wrong,W]=useState('');const busy=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 function answer(option:VerbForm){if(busy.current)return;const correct=option.ar===form.ar;if(sound)playAnswerSound(correct);if(!correct){W(option.ar);F(`Это «${option.ru.toLowerCase()}». Попробуйте ещё раз.`);return;}busy.current=true;W('');F('Верно!');onSuccess();timer.current=setTimeout(next,600);}
 return <section className="study-card"><span className="eyebrow">ФОРМА {index+1} / {forms.length}</span><h2 className="practice-prompt">{form.ru}</h2><p>Выберите нужную форму глагола.</p><div className="answers verb-answers">{options.map(f=><button className={'arabic '+(wrong===f.ar?'incorrect':busy.current&&f.ar===form.ar?'correct':'')} lang="ar" dir="rtl" disabled={busy.current} key={f.ar} onClick={()=>answer(f)}>{f.ar}</button>)}</div><p role="status">{feedback||'Учитывайте время и лицо.'}</p></section>;
}

export function PracticeHub({completed,open}:{completed:number[];open:(view:string)=>void}){return <><div className="eyebrow">ЗАКРЕПЛЯЕМ ИЗУЧЕННОЕ</div><h1>Практика</h1><p className="intro">Выберите, что хотите потренировать.</p><div className="practice-menu"><button className="practice-tile" onClick={()=>open('sentences')}><h2>Предложения</h2><p>Собирайте фразы по-арабски из знакомых слов.</p><small>{practiceExamples(completed).length} предложений</small></button>{practicedVerbs(completed).length>0&&<button className="practice-tile" onClick={()=>open('verbs')}><h2>Глаголы</h2><p>Выбирайте глагол и тренируйте время и лицо.</p><small>{practicedVerbs(completed).length} изученных глаголов</small></button>}</div></>}
