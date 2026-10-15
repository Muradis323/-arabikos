import {ChoiceExercise,GapExercise,MatchExercise,TokenExercise,type ExerciseProps} from './LessonExercises';
import {useState,useRef,useEffect} from 'react';
import {lessons,words,arabicText,lessonSteps,lessonTestCount,type LessonAttempt,type Word} from './lib/course';
import {playAnswerSound} from './lib/answer-sound';
import {usePronunciation} from './lib/pronunciation';
function shuffle<T>(values:T[]){const result=[...values];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}return result}
export function LessonRunner({id,startStep,sound,onStep,onFinish,onBack,attempt,onAttempt,onWordMiss,onWordCorrect,wordErrors}:{id:number;startStep:number;sound:boolean;onStep:(step:number)=>void;onFinish:(score:number)=>void;onBack:()=>void;attempt?:LessonAttempt;onAttempt?:(a:LessonAttempt)=>void;onWordMiss?:(id:number)=>void;onWordCorrect?:(id:number)=>void;wordErrors?:Record<string,number>}){
 const lesson=lessons[id],wordCount=lesson.words.length,total=lessonSteps(id),[step,Step]=useState(attempt?.id===id?attempt.step:startStep),[checkpoint,Checkpoint]=useState<number|null>(null),[translated,T]=useState(false),mistakes=useRef(new Set<number>(attempt?.id===id?attempt.mistakes:[]));const audio=usePronunciation(sound),finishing=useRef(false);
 const text=step<wordCount?lesson.words[step].ar:step<wordCount+3?arabicText(lesson.examples[step-wordCount].ids):'';
 useEffect(()=>{if(text)audio.speak(text)},[step]);
 function next(){if(step===total-1){if(finishing.current)return;finishing.current=true;onFinish(Math.max(0,100-Math.round(mistakes.current.size/lessonTestCount*100)));return}const n=step+1;Step(n);T(false);onStep(n);onAttempt?.({id,step:n,mistakes:[...mistakes.current]});if((n<=wordCount&&(n%8===0||n===wordCount))||(n>wordCount+3&&(n-wordCount-3)%8===0))Checkpoint(n)}
 if(checkpoint!==null)return <LessonPart key={checkpoint} lessonId={id} wordIds={checkpoint<=wordCount?lesson.words.slice(Math.max(0,checkpoint-(checkpoint%8||8)),checkpoint).map(w=>w.id):[]} sound={sound} onMiss={onWordMiss} next={()=>Checkpoint(null)} back={onBack}/>;
 return <><button className="textbtn practice-back" onClick={onBack}>← К пути уроков</button><div className="study-heading"><div><div className="eyebrow">{step<wordCount?'НОВЫЕ СЛОВА':step<wordCount+3?'ПРИМЕРЫ':'ПРОВЕРКА'} · {step+1} / {total}</div><h1 className="arabic lesson-topic" lang="ar" dir="rtl"><span className="lesson-digit" dir="ltr">{id+1}.</span><span>{lesson.title}</span></h1></div></div><div className="line studyline" role="progressbar" aria-label="Прогресс урока" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((step+1)/total*100)}><i style={{width:(step+1)/total*100+'%'}}/></div>{audio.message&&<p role="status">{audio.message}</p>}{step<wordCount+3?<section className="study-card" key={step}>{step===0&&<div className="course-rules"><h2>Что изучаем в этом уроке</h2>{lesson.rules.map(rule=><article key={rule.title}><h3>{rule.title}</h3><p>{rule.text}</p><div className="arabic" lang="ar" dir="rtl">{rule.ar}</div><small>{rule.ru}</small></article>)}</div>}<span className="eyebrow">{step<wordCount?'СЛОВО '+(step+1)+' ИЗ '+wordCount:'ПРЕДЛОЖЕНИЕ '+(step-wordCount+1)+' ИЗ 3'}</span><button className={'arabic pronunciation '+(step<wordCount?'giant':'sentence')} lang="ar" dir="rtl" onClick={()=>audio.speak(text)}>{text}</button>{step<wordCount?<h2>{lesson.words[step].ru}</h2>:<><button className="textbtn center" onClick={()=>T(!translated)}>{translated?'Скрыть перевод':'Показать перевод'}</button>{translated&&<h2>{lesson.examples[step-wordCount].ru}</h2>}</>}<button className="primary" onClick={next}>Дальше</button></section>:<LessonQuestion key={step} id={id} index={step-wordCount-3} sound={sound} next={next} wordErrors={wordErrors} onCorrect={onWordCorrect} onMiss={wordId=>{mistakes.current.add(step-wordCount-3);onAttempt?.({id,step,mistakes:[...mistakes.current]});if(wordId!==undefined)onWordMiss?.(wordId)}}/>}</>;
}
export function LessonQuestion(p:ExerciseProps){
 if(p.index>=10){const type=(p.index-10)%5;if(type===1)return <GapExercise {...p}/>;if(type===2)return <MatchExercise {...p}/>;if(type===3)return <TokenExercise {...p} spelling/>;if(type===4)return <TokenExercise {...p}/>;return <ChoiceExercise {...p}/>;}
 if(p.index===2)return <GapExercise {...p}/>;
 if(p.index===3||p.index===6)return <MatchExercise {...p}/>;
 if(p.index===4)return <TokenExercise {...p} spelling/>;
 if(p.index>=7)return <TokenExercise {...p}/>;
 return <ChoiceExercise {...p}/>;
}

function LessonPart({lessonId,wordIds,sound,onMiss,next,back}:{lessonId:number;wordIds:number[];sound:boolean;onMiss?:(id:number)=>void;next:()=>void;back:()=>void}){
 const [round,R]=useState(0),[ids]=useState(()=>shuffle(wordIds)),total=Math.min(3,ids.length);
 return <><div className="eyebrow">КОРОТКАЯ ЧАСТЬ УРОКА</div>{round<total?<><h1>Закрепим новые слова</h1><ChoiceExercise key={round} id={lessonId} index={round} wordIds={ids} sound={sound} onMiss={id=>{if(id!==undefined)onMiss?.(id)}} next={()=>R(n=>n+1)}/></>:<section className="study-card"><h1>Часть пройдена!</h1><p>Хорошая работа. Можно сделать паузу — место в уроке сохранено.</p><button className="primary" onClick={next}>Следующая часть</button><button className="textbtn center" onClick={back}>На сегодня достаточно</button></section>}</>;
}
