import {ChoiceExercise,GapExercise,MatchExercise,TokenExercise,type ExerciseProps} from './LessonExercises';
import {useState,useRef,useEffect} from 'react';
import {lessons,words,arabicText,lessonSteps,type Word} from './lib/course';
import {playAnswerSound} from './lib/answer-sound';
import {usePronunciation} from './lib/pronunciation';
function shuffle<T>(values:T[]){const result=[...values];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}return result}
export function LessonRunner({id,startStep,sound,onStep,onFinish,onBack}:{id:number;startStep:number;sound:boolean;onStep:(step:number)=>void;onFinish:(score:number)=>void;onBack:()=>void}){
 const lesson=lessons[id],wordCount=lesson.words.length,total=lessonSteps(id),[step,Step]=useState(startStep),[translated,T]=useState(false),mistakes=useRef(new Set<number>());const audio=usePronunciation(sound),finishing=useRef(false);
 const text=step<wordCount?lesson.words[step].ar:step<wordCount+3?arabicText(lesson.examples[step-wordCount].ids):'';
 useEffect(()=>{if(text)audio.speak(text)},[step]);
 function next(){if(step===total-1){if(finishing.current)return;finishing.current=true;onFinish(Math.max(0,100-mistakes.current.size*10));return}Step(step+1);T(false);onStep(step+1)}
 return <><button className="textbtn practice-back" onClick={onBack}>← К пути уроков</button><div className="study-heading"><div><div className="eyebrow">{step<wordCount?'НОВЫЕ СЛОВА':step<wordCount+3?'ПРИМЕРЫ':'ПРОВЕРКА'} · {step+1} / {total}</div><h1 className="arabic lesson-topic" lang="ar" dir="rtl"><span className="lesson-digit" dir="ltr">{id+1}.</span><span>{lesson.title}</span></h1></div></div><div className="line studyline" role="progressbar" aria-label="Прогресс урока" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((step+1)/total*100)}><i style={{width:(step+1)/total*100+'%'}}/></div>{audio.message&&<p role="status">{audio.message}</p>}{step<wordCount+3?<section className="study-card" key={step}>{step===0&&<div className="course-rules"><h2>Что изучаем в этом уроке</h2>{lesson.rules.map(rule=><article key={rule.title}><h3>{rule.title}</h3><p>{rule.text}</p><div className="arabic" lang="ar" dir="rtl">{rule.ar}</div><small>{rule.ru}</small></article>)}</div>}<span className="eyebrow">{step<wordCount?'СЛОВО '+(step+1)+' ИЗ '+wordCount:'ПРЕДЛОЖЕНИЕ '+(step-wordCount+1)+' ИЗ 3'}</span><button className={'arabic pronunciation '+(step<wordCount?'giant':'sentence')} lang="ar" dir="rtl" onClick={()=>audio.speak(text)}>{text}</button>{step<wordCount?<h2>{lesson.words[step].ru}</h2>:<><button className="textbtn center" onClick={()=>T(!translated)}>{translated?'Скрыть перевод':'Показать перевод'}</button>{translated&&<h2>{lesson.examples[step-wordCount].ru}</h2>}</>}<button className="primary" onClick={next}>Дальше</button></section>:<LessonQuestion key={step} id={id} index={step-wordCount-3} sound={sound} next={next} onMiss={()=>mistakes.current.add(step-wordCount-3)}/>}</>;
}
export function LessonQuestion(p:ExerciseProps){
 if(p.index===2)return <GapExercise {...p}/>;
 if(p.index===3||p.index===6)return <MatchExercise {...p}/>;
 if(p.index===4)return <TokenExercise {...p} spelling/>;
 if(p.index>=7)return <TokenExercise {...p}/>;
 return <ChoiceExercise {...p}/>;
}
