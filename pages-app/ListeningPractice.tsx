import {useEffect,useRef,useState} from 'react';
import {words,isWordLearned,type Progress} from './lib/course';
import {usePronunciation} from './lib/pronunciation';
import {playAnswerSound} from './lib/answer-sound';
const shuffle=<T,>(a:T[])=>[...a].map(v=>({v,r:Math.random()})).sort((a,b)=>a.r-b.r).map(x=>x.v);
export function ListeningPractice({progress,sound,enableSound,onResult}:{progress:Progress;sound:boolean;enableSound:()=>void;onResult:(id:number,ok:boolean)=>void}){
 const [session,S]=useState(0),[index,I]=useState(0);
 const [targets,T]=useState(()=>makeTargets(progress));
 function restart(){T(makeTargets(progress));I(0);S(s=>s+1)}
 return <><div className="eyebrow">СЛУШАЕМ БЕЗ ПОДСКАЗКИ</div><h1>Практика на слух</h1><p className="intro">Только изученные слова. Озвучивает арабский голос устройства; можно слушать медленнее.</p>{!sound?<section className="empty"><p>Для этого упражнения нужна озвучка.</p><button className="primary" onClick={enableSound}>Включить звук</button></section>:!targets.length?<p>Сначала изучите несколько слов в уроках.</p>:index>=targets.length?<section className="study-card"><h2>Слуховая практика завершена!</h2><p>{targets.length} слов повторено.</p><button className="primary" onClick={restart}>Ещё одна подборка</button></section>:<ListeningRound key={session+':'+index} id={targets[index]} progress={progress} sound={sound} index={index} total={targets.length} onResult={onResult} next={()=>I(i=>i+1)}/>}</>;
}
function makeTargets(p:Progress){const all=words.filter(w=>w.quiz&&isWordLearned(p,w.id));const unique=all.filter((w,i)=>all.findIndex(v=>v.ar===w.ar||v.ru===w.ru)===i);const weak=shuffle(unique.filter(w=>(p.wordErrors?.[w.id]??0)>0)).slice(0,4);return [...weak,...shuffle(unique.filter(w=>!weak.includes(w)))].slice(0,10).map(w=>w.id)}
function ListeningRound({id,progress,sound,index,total,onResult,next}:{id:number;progress:Progress;sound:boolean;index:number;total:number;onResult:(id:number,ok:boolean)=>void;next:()=>void}){
 const audio=usePronunciation(sound),word=words[id],timer=useRef<ReturnType<typeof setTimeout>|null>(null),busy=useRef(false);
 const [heard,H]=useState(false),[message,M]=useState(''),[wrong,W]=useState<number|null>(null),[correct,C]=useState(false);
 const [options]=useState(()=>shuffle([word,...shuffle(words.filter(w=>w.quiz&&isWordLearned(progress,w.id)&&w.ar!==word.ar&&w.ru!==word.ru).filter((w,i,a)=>a.findIndex(v=>v.ru===w.ru)===i)).slice(0,3)]));
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 function listen(slow=false){audio.speak(word.ar,slow);if(audio.available)H(true)}
 function answer(target:number){if(!heard||busy.current)return;const ok=target===id;onResult(id,ok);if(sound)playAnswerSound(ok);if(!ok){W(target);M('Это другой перевод. Прослушайте ещё раз, можно медленно.');return}busy.current=true;C(true);M('Верно: '+word.ar+' — '+word.ru);timer.current=setTimeout(next,1100)}
 return <section className="study-card"><span className="eyebrow">СЛОВО {index+1} / {total}</span><div className="listening-controls"><button className="primary" onClick={()=>listen()}>▶ Прослушать</button><button className="textbtn" onClick={()=>listen(true)}>Медленнее</button></div>{audio.message&&<p role="alert">{audio.message}</p>}<h2>Что означает слово?</h2><div className="answers">{options.map(w=><button key={w.id} disabled={!heard||correct} className={correct&&w.id===id?'correct':wrong===w.id?'incorrect':''} onClick={()=>answer(w.id)}>{w.ru}</button>)}</div><p role="status">{message||'Сначала нажмите «Прослушать».'}</p></section>;
}
