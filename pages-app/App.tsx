import {UnifiedDictionary} from './UnifiedDictionary';
import {unifiedDictionary,reviewDictionaryWord} from './lib/unified-dictionary';
import {DailyPointsBar} from './DailyPointsBar';
import {awardPoints} from './lib/daily-points';
import {dictionaryReadingKey} from './lib/word-key';
import {BookExam} from './BookExam';
import {completeBook1Exam} from './lib/book-exam';
import {ListeningPractice} from './ListeningPractice';
import {StoryLibrary} from './StoryLibrary';
import {TeacherMascot} from './TeacherMascot';
import {dayKey,reconcileStreak} from './lib/streak';
import {hapticsEnabled,saveHaptics,tactile} from './lib/haptics';
import {LessonRunner} from './LessonRunner';
import {finishLesson} from './lib/lesson-results';
import {CardDirection} from './DictionaryList';
import {ReviewCard} from './ReviewCard';
import {usePronunciation} from './lib/pronunciation';
import {dictionaryWords} from './lib/dictionary-order';
import {LessonsPage} from './Lessons';
import {useEffect,useState,useRef} from 'react';
import {SettingsPage} from './Settings';
import {repeatLabel} from './lib/review-time';
import {weakWords,clearDifficultWord} from './lib/spelling';
import {WordBuilder} from './WordBuilder';
import {PracticeHub,SentencePractice} from './Practice';
import {reviewQueueAfter} from './lib/repetition';
import {playAnswerSound} from './lib/answer-sound';
import {KEY,readProgress,writeProgress} from './lib/storage';
import {BookOpen,Library,Layers,ChevronLeft,Check,RotateCcw,Leaf,Settings,Volume2,VolumeX} from 'lucide-react';
import {words,BOOK1_COUNT,canOpenLesson,initial,setWordMastered,type Progress} from './lib/course';
export default function Page(){
 const [p,P]=useState<Progress>(initial),[ready,Ready]=useState(false),[unsaved,Unsaved]=useState(false),[sound,Sound]=useState(true),[dark,Dark]=useState(()=>document.documentElement.dataset.theme==='dark'),[palette,Palette]=useState(()=>document.documentElement.dataset.palette||'forest'),[error,E]=useState(''),[view,V]=useState('home'),[flip,F]=useState(false),[feedback,FB]=useState(''),[queue,Q]=useState<string[]>([]),[sessionCount,SC]=useState(0),[revealing,Revealing]=useState(false),[now,Now]=useState(Date.now());const reviewTimer=useRef<ReturnType<typeof setTimeout>|null>(null);const grading=useRef(false);useEffect(()=>()=>{if(reviewTimer.current)clearTimeout(reviewTimer.current)},[]);const lastAction=useRef(0);const progressRef=useRef(p);progressRef.current=p;
 const [reverse,Reverse]=useState(()=>{try{return localStorage.getItem('arabikos-card-direction')==='ru-ar'}catch{return false}});
 function setDirection(next:boolean){if(grading.current)return;Reverse(next);F(false);try{localStorage.setItem('arabikos-card-direction',next?'ru-ar':'ar-ru')}catch{}}
 const [lessonId,LessonId]=useState<number|null>(null),[lessonSession,LessonSession]=useState(0),[result,Result]=useState(0);
 const [haptics,Haptics]=useState(hapticsEnabled);function setHaptics(next:boolean){Haptics(next);saveHaptics(next);if(next)tactile('success')}
 const audio=usePronunciation(sound);
 useEffect(()=>{if(!ready||!['home','lessons'].includes(view))return;const app=document.querySelector<HTMLElement>('.app'),nav=app?.querySelector<HTMLElement>('.sidebar');if(!app||!nav)return;const measure=()=>app.style.setProperty('--lesson-nav-height',nav.getBoundingClientRect().height+'px');measure();const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(measure);observer?.observe(nav);window.addEventListener('resize',measure);return()=>{observer?.disconnect();window.removeEventListener('resize',measure)}},[ready,view]);

 useEffect(()=>{const refresh=()=>Now(Date.now());const timer=setInterval(refresh,30000);window.addEventListener('focus',refresh);return()=>{clearInterval(timer);window.removeEventListener('focus',refresh)}},[]);
 function load(){try{const stored=readProgress(localStorage),loaded=reconcileStreak(stored);P(loaded);E('');if(loaded!==stored){try{writeProgress(localStorage,loaded)}catch{Unsaved(true);E('Браузер не сохранил защиту серии. Попробуйте ещё раз.')}}}catch(e){E((e as Error).message||'Браузер не разрешает сохранение.');}Ready(true);}
 useEffect(()=>{load();try{Sound(localStorage.getItem('arabikos-sound')!=='off')}catch{};const otherTab=(e:StorageEvent)=>{if(e.key===KEY){load();V('home');F(false);Q([]);}};window.addEventListener('storage',otherTab);return()=>window.removeEventListener('storage',otherTab);},[]);
 useEffect(()=>{if(!ready)return;const next=reconcileStreak(p,new Date(now));if(next!==p)save(next)},[ready,dayKey(new Date(now))]);
 function setSound(next:boolean){Sound(next);try{localStorage.setItem('arabikos-sound',next?'on':'off')}catch{}}
 function setTheme(next:boolean){Dark(next);document.documentElement.dataset.theme=next?'dark':'light';document.querySelector('meta[name="theme-color"]')?.setAttribute('content',next?'#18201c':'#344e40');try{localStorage.setItem('arabikos-theme',next?'dark':'light')}catch{}}
 function save(n:Progress){try{writeProgress(localStorage,n);Unsaved(false);E('');}catch{Unsaved(true);E('Браузер не сохранил прогресс. Разрешите хранение данных; не закрывайте страницу до сохранения.');}progressRef.current=n;P(n);return true;}
 function acceptAction(){const now=performance.now();if(now-lastAction.current<160)return false;lastAction.current=now;return true;}
 const learned=dictionaryWords(p,now),entries=unifiedDictionary(p,now),due=entries.filter(w=>!w.mastered&&w.review.due<=now),reviewEntry=entries.find(w=>w.key===queue[0]);const weak=weakWords(p).filter(w=>!entries.find(e=>e.key===dictionaryReadingKey(w.ar))?.mastered);
 function daily(n:Progress,kind:'reviews'|'lessonSteps'|'read'){const k=dayKey(),old=n.daily?.[k]??{reviews:0,lessonSteps:0,read:false};return {...n,daily:{...n.daily,[k]:{...old,[kind]:kind==='read'?true:Number(old[kind])+1}}};}
 function activity(n:Progress){const k=dayKey();return {...n,days:{...n.days,[k]:(n.days[k]??0)+1}};}
 function openLesson(id=p.lesson){tactile('tap');if(id>=BOOK1_COUNT&&!p.book1Exam?.passed&&p.completed.length>=BOOK1_COUNT){go('exam');return}if(!canOpenLesson(p,id))return;LessonId(id);LessonSession(n=>n+1);go('lesson');}
 function finish(id:number,score:number){if(sound)playAnswerSound(true,'complete');save(finishLesson(progressRef.current,id,score));Result(score);go('complete');}
 function cancelReveal(){if(reviewTimer.current)clearTimeout(reviewTimer.current);grading.current=false;Revealing(false);}
 function go(v:string){cancelReveal();V(v);F(false);FB('');if(!['home','lessons'].includes(v))requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'auto'}));}
 function review(){cancelReveal();FB('');Q(due.map(w=>w.key));SC(0);F(false);V('review');}
 function grade(known:boolean){if(!queue.length||!reviewEntry||reviewEntry.mastered||grading.current||!acceptAction())return;grading.current=true;Revealing(true);F(true);if(sound)playAnswerSound(known);tactile(known?'success':'error');const old=reviewEntry.review;save(daily(activity(awardPoints(reviewDictionaryWord(progressRef.current,queue[0],known,Date.now()),known?1:0)),'reviews'));FB(known?(old.lastKnown===false?'Вспомнил трудное слово — отлично!':(sessionCount+1)%5===0?'Пять карточек позади. Хорошая работа!':'Верно!'):'Это слово вернётся через несколько карточек.');SC(c=>c+1);reviewTimer.current=setTimeout(()=>{Q(q=>reviewQueueAfter(q,known));F(false);Revealing(false);grading.current=false;FB('');},1000);}

 const nextDue=entries.filter(w=>!w.mastered).map(w=>w.review.due).filter(t=>t>now).sort((a,b)=>a-b)[0];

 return <div className={'app '+(['home','lessons'].includes(view)?'lesson-home':'')}><aside className="sidebar"><a className="brand" href="#" onClick={e=>{e.preventDefault();go('home')}}><img className="brand-logo" src="./favicon.svg" alt=""/><span>Арабикос<small>ЧИТАТЬ. ПОНИМАТЬ.</small></span></a><div className="side-label">ВАША КНИГА</div><nav>{([['home','Уроки',BookOpen],['dictionary','Мой словарь',Library],['practice','Практика',Layers]] as const).map(([key,label,Icon])=><button key={String(key)} className={(view===key||(key==='home'&&['lessons','lesson','complete','exam'].includes(view))||(key==='practice'&&['sentences','stories','listening'].includes(view))||(key==='dictionary'&&['review','wordbuilder'].includes(view)))?'nav active':'nav'} onClick={()=>go(String(key))}><Icon size={20}/><span>{String(label)}</span>{key==='dictionary'&&due.length>0&&<b>{due.length}</b>}</button>)}</nav><div className="side-bottom"><Leaf size={24}/><p>Знание растёт<br/>с каждой страницей.</p><small>Мединский курс · тома 1–2</small></div><span className="edition">АРАБСКИЙ ДЛЯ ПОНИМАНИЯ КОРАНА</span></aside>
 <div className="workspace"><header><DailyPointsBar progress={p} now={now}/><div><button className="sound-toggle" aria-label={sound?'Отключить звук':'Включить звук'} aria-pressed={sound} title={sound?'Отключить звук':'Включить звук'} onClick={()=>setSound(!sound)}>{sound?<Volume2 size={19}/>:<VolumeX size={19}/>}</button><button className="sound-toggle" aria-label="Настройки" title="Настройки" onClick={()=>go('settings')}><Settings size={20}/></button></div></header><main>
 {audio.message&&<p role="status">{audio.message}</p>}
 {error&&<div className="error" role="alert">{error} {!ready?<button onClick={load}>Повторить</button>:<button onClick={()=>save(p)}>Повторить сохранение</button>}</div>}
 {!ready?<div className="empty"><BookOpen/><h2>Открываем вашу книгу…</h2></div>:<>
 {view==='home'&&<LessonsPage progress={p} openLesson={openLesson} onExam={()=>go('exam')}/>}
 {view==='exam'&&<BookExam progress={p} sound={sound} onSave={book1ExamAttempt=>save({...progressRef.current,book1ExamAttempt})} onFinish={answers=>{const n=completeBook1Exam(progressRef.current,answers);save(n);if(sound)playAnswerSound(n.book1Exam!.last>=80,'complete')}} onBack={()=>go('lessons')} onNext={()=>openLesson(BOOK1_COUNT)}/>}
 {view==='lessons'&&<LessonsPage progress={p} openLesson={openLesson} onExam={()=>go('exam')}/>}
 {view==='lesson'&&<LessonRunner key={String(lessonId)+':'+lessonSession} id={lessonId??p.lesson} startStep={p.completed.includes(lessonId??p.lesson)?0:p.step} sound={sound} onReward={points=>save(awardPoints(progressRef.current,points))} attempt={p.attempts?.[lessonId??p.lesson]??p.attempt} wordErrors={p.wordErrors} onWordCorrect={id=>{const n=progressRef.current;save({...n,wordErrors:{...n.wordErrors,[id]:Math.max(0,(n.wordErrors?.[id]??0)-1)}})}} onAttempt={attempt=>save({...progressRef.current,attempt,attempts:{...progressRef.current.attempts,[attempt.id]:attempt}})} onWordMiss={id=>{const n=progressRef.current;save({...n,wordErrors:{...n.wordErrors,[id]:(n.wordErrors?.[id]??0)+1}})}} onStep={step=>{const n=progressRef.current;save(daily({...n,...(!n.completed.includes(lessonId??n.lesson)?{step}:{})},'lessonSteps'))}} onFinish={score=>finish(lessonId??p.lesson,score)} onBack={()=>go('lessons')}/>}
 {view==='complete'&&<section className="empty completion"><TeacherMascot emotion={result===100?'celebrating':'proud'} message={result===100?'Вот это результат! Ни одной ошибки.':'Ты довёл урок до конца. Я рад твоему успеху!'}/><div className="eyebrow">ЕЩЁ ОДНА СТРАНИЦА</div><h1>{result===100?'Без единой ошибки!':'Урок пройден!'}</h1><p className="completion-praise">{result===100?'Отличная работа. Ты уверенно освоил этот урок.':'Молодец, ты дошёл до конца. Каждое повторение делает знания крепче.'}</p><p>Правильных ответов: {result}%.</p>{result===100&&<p className="freeze-earned">❄ За урок без ошибок — до 1 заморозки в день</p>}<button className="primary" onClick={()=>go('lessons')}>К пути уроков</button><button className="textbtn center" onClick={()=>go('home')}>Вернуться на главную</button></section>}
 {view==='dictionary'&&<UnifiedDictionary progress={p} now={now} speak={audio.speak} onReview={review} onWeak={()=>go('wordbuilder')} weakCount={weak.length} onChange={save}/>}
 {view==='review'&&<><button className="textbtn" onClick={()=>go('dictionary')}><ChevronLeft size={17}/> Мой словарь</button><div className="eyebrow">ПОВТОРЕНИЕ С ИНТЕРВАЛАМИ</div><div className="section-title"><h1>Карточки словаря</h1><span>Осталось {queue.length}</span></div>{queue.length&&reviewEntry?<><CardDirection reverse={reverse} disabled={revealing} onChange={setDirection}/><ReviewCard word={reviewEntry!} reverse={reverse} flip={flip} disabled={revealing} onFlip={()=>F(!flip)}/><TeacherMascot compact emotion={revealing?(reviewEntry?.review.lastKnown?'happy':'encouraging'):'encouraging'} message={revealing?feedback:'Вспоминай спокойно. Если слово забылось, мы повторим его вместе.'}/><div className="review-actions"><button disabled={revealing} onClick={()=>grade(false)}><RotateCcw size={18}/>Не помню</button><button disabled={revealing} className="primary" onClick={()=>grade(true)}><Check size={18}/>Помню</button></div><p className="swipe-note">После ответа другая сторона откроется на мгновение, затем появится следующее слово.</p><button className="textbtn center" onClick={()=>go('dictionary')}>Вернуться в словарь</button></>:<div className="empty"><Check size={40}/><h2>{sessionCount?'Отличная работа!':'На сейчас всё'}</h2><p>{entries.length?'Карточек к повторению пока нет. Они появятся, когда подойдёт время.':'Изучите хотя бы одно слово в первом уроке — оно сразу появится здесь.'}</p>{entries.length?<>{nextDue&&<p>{repeatLabel(nextDue,now)}</p>}<button className="textbtn center" onClick={()=>go('dictionary')}>В словарь</button></>:<button className="primary" onClick={()=>openLesson()}>Начать урок</button>}</div>}</>}
 {view==='wordbuilder'&&<WordBuilder ids={weak.map(w=>w.id)} sound={sound} onSuccess={(id,withoutHint)=>save(awardPoints(activity(clearDifficultWord(progressRef.current,id,withoutHint)),1))} back={()=>go('dictionary')}/>}
 {view==='settings'&&<><SettingsPage progress={p} sound={sound} haptics={haptics} setHaptics={setHaptics} dark={dark} palette={palette} setSound={setSound} setDark={setTheme} setPalette={next=>{Palette(next);document.documentElement.dataset.palette=next;try{localStorage.setItem('arabikos-palette',next)}catch{}}} onImport={data=>{const imported=reconcileStreak(data);writeProgress(localStorage,imported);cancelReveal();P(imported);Unsaved(false);E('');Q([]);}}/></>}
 {view==='practice'&&<PracticeHub completed={p.completed} progress={p} open={go}/>}
 {view==='sentences'&&<><button className="textbtn practice-back" onClick={()=>go('practice')}>← Все тесты</button><SentencePractice saved={p.sentenceSession} onSave={sentenceSession=>save({...progressRef.current,sentenceSession})} key={p.completed.join(',')} completed={p.completed} sound={sound} onSuccess={()=>save(awardPoints(activity(progressRef.current),3))}/></>}
 {view==='stories'&&<><button className="textbtn practice-back" onClick={()=>go('practice')}>← Практика</button><StoryLibrary reading={p.reading} knownWords={learned} onChange={reading=>save({...progressRef.current,reading})}/></>}
 {view==='listening'&&<><button className="textbtn" onClick={()=>go('practice')}>← Практика</button><ListeningPractice progress={p} sound={sound} enableSound={()=>setSound(true)} onResult={(id,ok)=>{const n=progressRef.current;save({...awardPoints(ok?activity(n):n,ok?1:0),wordErrors:{...n.wordErrors,[id]:ok?Math.max(0,(n.wordErrors?.[id]??0)-1):(n.wordErrors?.[id]??0)+1}})}}/></>}

 </>}
 <footer><span>АРАБИКОС</span><span>Прогресс хранится только в этом браузере. Очистка данных удалит его.</span><span>✦</span></footer></main></div></div>
}