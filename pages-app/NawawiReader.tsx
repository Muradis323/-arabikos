import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {Bookmark,Check,ChevronLeft,ChevronRight,Flag,Library,Minus,Plus} from 'lucide-react';
import {nawawiHadiths} from './lib/nawawi-book';
import {NAWAWI_BOOK_ID,clampBookPage,nawawiPages,type NawawiPage} from './lib/nawawi-pages';
import {type ReadingProgress} from './lib/course';
import {addReadingWord,existingReadingWord,type BookToken} from './lib/reading-words';
import {dictionaryReadingKey} from './lib/word-key';
import './nawawi-reader.css';
const empty:ReadingProgress={paragraph:0,font:34,cards:{}};
type Selection={word:BookToken;id:string};
export const WORD_HOLD_MS=1500;
type WordGesture={x:number;y:number;node:HTMLButtonElement|null;id:number;moved:boolean;translated:boolean};
export function NawawiReader({reading=empty,knownWords=[],onChange,onBack}:{reading?:ReadingProgress;knownWords?:readonly {ar:string}[];onChange:(reading:ReadingProgress)=>void;onBack:()=>void}){
 const [page,Page]=useState(()=>clampBookPage(reading.bookmarks?.[NAWAWI_BOOK_ID]??(reading.storyId===NAWAWI_BOOK_ID?reading.paragraph:0)));
 const [wide,Wide]=useState(()=>window.matchMedia('(min-width: 1100px)').matches);
 const [selected,Select]=useState<Selection|null>(null),[position,Position]=useState({left:12,top:80,width:260,arrow:130});
 const [turning,Turning]=useState<{pages:NawawiPage[];direction:number;key:number}|null>(null);
 const latest=useRef(reading),change=useRef(onChange),anchor=useRef<HTMLButtonElement|null>(null),popover=useRef<HTMLElement|null>(null),surface=useRef<HTMLDivElement|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const gesture=useRef<WordGesture|null>(null),holdTimer=useRef<ReturnType<typeof setTimeout>|null>(null),locked=useRef(false);latest.current=reading;change.current=onChange;
 const visible=nawawiPages.slice(page,page+(wide?2:1)),current=nawawiPages[page],hadith=current.hadith;
 function commit(n:ReadingProgress){latest.current=n;change.current(n)}
 function remember(n:number){const r=latest.current;commit({...r,storyId:NAWAWI_BOOK_ID,paragraph:n,bookmarks:{...r.bookmarks,...(r.storyId!==NAWAWI_BOOK_ID?{[r.storyId??'ibrahim-retelling-v1']:r.paragraph}:{}),[NAWAWI_BOOK_ID]:n}})}
 function cancelHold(){if(holdTimer.current!==null){clearTimeout(holdTimer.current);holdTimer.current=null}}
 function cancelGesture(){cancelHold();gesture.current=null}
 function close(focus=false){Select(null);if(focus)anchor.current?.focus({preventScroll:true})}
 function place(node:HTMLButtonElement){const rect=node.getBoundingClientRect(),width=Math.min(280,window.innerWidth-24),height=popover.current?.offsetHeight??112,left=Math.max(12,Math.min(window.innerWidth-width-12,rect.left+rect.width/2-width/2));Position({left,top:Math.max(8,rect.top-height-14),width,arrow:Math.max(18,Math.min(width-18,rect.left+rect.width/2-left))})}
 function pick(node:HTMLButtonElement,toggle=false){const [hi,ti]=node.dataset.nawawiWord!.split(':').map(Number),word=nawawiHadiths[hi]?.tokens[ti];if(!word?.ru)return;anchor.current=node;Select(toggle&&selected?.id===node.dataset.nawawiWord?null:{word,id:node.dataset.nawawiWord!});place(node)}
 function turn(delta:number,target?:number){if(locked.current)return;const next=clampBookPage(target??page+delta*(wide?2:1));if(next===page)return;locked.current=true;cancelGesture();close();Turning({pages:visible,direction:delta,key:Date.now()});Page(next);remember(next);timer.current=setTimeout(()=>{Turning(null);locked.current=false},620)}
 useEffect(()=>{remember(page);const query=window.matchMedia('(min-width: 1100px)'),resize=()=>{cancelGesture();Wide(query.matches);close()};
  const scroll=()=>{const g=gesture.current;if(g&&!g.translated){g.moved=true;cancelHold()}},blur=()=>cancelGesture();
  query.addEventListener('change',resize);window.addEventListener('scroll',scroll,true);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',blur);
  return()=>{cancelGesture();query.removeEventListener('change',resize);window.removeEventListener('scroll',scroll,true);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',blur);if(timer.current)clearTimeout(timer.current)}},[]);
 useLayoutEffect(()=>{if(!selected)return;const refresh=()=>{if(anchor.current?.isConnected)place(anchor.current)};refresh();const frame=requestAnimationFrame(()=>{const node=anchor.current;if(node&&popover.current){const top=node.getBoundingClientRect().top,height=popover.current.offsetHeight;if(top<height+24)window.scrollBy({top:top-height-24,behavior:'instant'})}refresh()});const outside=(event:PointerEvent)=>{const node=event.target as Node;if(!popover.current?.contains(node)&&!(node instanceof Element&&node.closest('[data-nawawi-word]')))close()},escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();close(true)}};window.addEventListener('resize',refresh);window.addEventListener('scroll',refresh,true);window.addEventListener('pointerdown',outside);window.addEventListener('keydown',escape);return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',refresh);window.removeEventListener('scroll',refresh,true);window.removeEventListener('pointerdown',outside);window.removeEventListener('keydown',escape)}},[selected?.id]);
 const saved=!!selected&&(existingReadingWord(reading,selected.word.ar)!==undefined||knownWords.some(w=>dictionaryReadingKey(w.ar)===dictionaryReadingKey(selected.word.ar)));
 function leaf(entry:NawawiPage,index:number,ghost=false){const hi=nawawiHadiths.indexOf(entry.hadith),number=nawawiPages.indexOf(entry)+1;return <article key={number} className={'nawawi-leaf '+(index===0?'recto':'verso')} aria-label={ghost?undefined:`Страница ${number} из ${nawawiPages.length}`}>
  <div className="nawawi-running-head"><span>Сорок хадисов</span><span>Имам ан-Навави</span></div>
  <div className="nawawi-chapter"><span>ХАДИС {entry.hadith.id}{entry.part>0?' · ПРОДОЛЖЕНИЕ':''}</span><h2>{entry.hadith.title}</h2><i aria-hidden="true">❦</i></div>
  <div className="nawawi-arabic" lang="ar" dir="rtl" style={{fontSize:reading.font}}>{entry.hadith.tokens.slice(entry.start,entry.end).map((token,j)=>{const id=hi+':'+(entry.start+j);return token.ru?<button type="button" key={j} className="nawawi-word" data-nawawi-word={ghost?undefined:id} tabIndex={ghost?-1:0} aria-pressed={!ghost&&selected?.id===id} aria-controls={!ghost&&selected?.id===id?'nawawi-word-meaning':undefined} onClick={event=>{if(ghost||event.detail!==0)return;cancelGesture();pick(event.currentTarget,true)}}>{token.ar}</button>:<span key={j}>{token.ar}</span>})}</div>
  <div className="nawawi-folio"><span aria-hidden="true">✧</span><span>{new Intl.NumberFormat('ar').format(number)}</span><span aria-hidden="true">✧</span></div>
 </article>}
 return <section className="nawawi-reader"><button className="textbtn nawawi-back" onClick={onBack}><Library size={17}/> На книжную полку</button>
 <div className="nawawi-heading"><div><span className="eyebrow">БИБЛИОТЕКА · ЧТЕНИЕ В ПОДЛИННИКЕ</span><h1>40 хадисов ан-Навави</h1><p>Первые пять хадисов. Удерживайте слово 1,5 секунды, чтобы увидеть перевод.</p></div><span className="nawawi-edition"><Bookmark size={15}/> Место сохранено</span></div>
 <div className="nawawi-toolbar"><label>Хадис<select aria-label="Выбрать хадис" value={hadith.id} onChange={event=>{const target=nawawiPages.findIndex(p=>p.hadith.id===Number(event.target.value));turn(target>page?1:-1,target)}}>{nawawiHadiths.map(h=><option key={h.id} value={h.id}>{h.id}. {h.title}</option>)}</select></label><div className="nawawi-font"><button aria-label="Уменьшить шрифт" disabled={reading.font<=28} onClick={()=>commit({...latest.current,font:Math.max(28,reading.font-2)})}><Minus size={16}/></button><span aria-hidden="true">Aa</span><button aria-label="Увеличить шрифт" disabled={reading.font>=44} onClick={()=>commit({...latest.current,font:Math.min(44,reading.font+2)})}><Plus size={16}/></button></div></div>
 <p className="nawawi-gesture-hint">Читайте справа налево. Следующая страница — свайп вправо →</p>
 <div className="nawawi-book" ref={surface} tabIndex={0} role="group" aria-label="Открытая книга. Стрелка влево — вперёд, вправо — назад" onKeyDown={event=>{if(event.key==='ArrowLeft'){event.preventDefault();turn(1)}if(event.key==='ArrowRight'){event.preventDefault();turn(-1)}}}
 onPointerDown={event=>{
  if(event.isPrimary===false){cancelGesture();return}if(event.button!==0||locked.current)return;
  cancelGesture();const target=event.target as HTMLElement,node=target.closest<HTMLButtonElement>('[data-nawawi-word]');
  if(!node&&target.closest('button'))return;
  close();const g:WordGesture={x:event.clientX,y:event.clientY,node,id:event.pointerId,moved:false,translated:false};gesture.current=g;
  if(node)holdTimer.current=setTimeout(()=>{holdTimer.current=null;if(gesture.current!==g||g.moved||!node.isConnected)return;g.translated=true;pick(node)},WORD_HOLD_MS);
 }}
 onPointerMove={event=>{const g=gesture.current;if(!g||g.id!==event.pointerId)return;if(Math.hypot(event.clientX-g.x,event.clientY-g.y)>10){g.moved=true;cancelHold()}}}
 onPointerUp={event=>{const g=gesture.current;if(!g||g.id!==event.pointerId)return;cancelGesture();if(g.translated)return;const dx=event.clientX-g.x,dy=event.clientY-g.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4)turn(dx>0?1:-1)}}
 onPointerCancel={cancelGesture} onPointerLeave={cancelGesture}
 onContextMenu={event=>{if((event.target as HTMLElement).closest('[data-nawawi-word]'))event.preventDefault()}}>

 <div className="nawawi-spread">{visible.map((entry,index)=>leaf(entry,index))}{wide&&visible.length===1&&<article className="nawawi-leaf nawawi-colophon"><span>❦</span><h2>Пять хадисов —<br/>начало большого пути.</h2><p>Вернитесь к тексту и повторите сохранённые слова в словаре.</p></article>}</div>
 {turning&&<div key={turning.key} className={'nawawi-turn-layer '+(turning.direction>0?'turn-forward':'turn-backward')} aria-hidden="true" inert><div className="nawawi-spread">{turning.pages.map((entry,index)=>leaf(entry,index,true))}</div></div>}
 <button className="nawawi-corner next" aria-label="Перелистнуть вперёд" disabled={page+(wide?2:1)>=nawawiPages.length||!!turning} onClick={()=>turn(1)}><ChevronLeft size={18}/></button><button className="nawawi-corner previous" aria-label="Перелистнуть назад" disabled={page===0||!!turning} onClick={()=>turn(-1)}><ChevronRight size={18}/></button>
 </div>
 <nav className="nawawi-pagination" aria-label="Страницы книги"><button aria-label="Следующая страница" disabled={page+(wide?2:1)>=nawawiPages.length||!!turning} onClick={()=>turn(1)}><ChevronLeft size={21}/><span>Далее</span></button><span role="status" aria-live="polite">{page+1}{wide&&visible.length>1?'–'+(page+visible.length):''} / {nawawiPages.length}</span><button aria-label="Предыдущая страница" disabled={page===0||!!turning} onClick={()=>turn(-1)}><span>Назад</span><ChevronRight size={21}/></button></nav>
 <div className="nawawi-reading-progress" aria-label="Место в книге"><i style={{width:Math.min(100,(page+visible.length)/nawawiPages.length*100)+'%'}}/></div>
 {Array.from(new Map(visible.map(p=>[p.hadith.id,p.hadith])).values()).map(h=><details className="nawawi-translation" key={h.id}><summary>Смысловой перевод хадиса {h.id}</summary><p>{h.translation}</p><a href={h.sourceUrl} target="_blank" rel="noreferrer">Источник: {h.source} ↗</a><small>Перевод отдельных слов — подсказка для изучения языка. Смысл хадиса раскрывается в связном переводе.</small></details>)}
 {selected&&<aside id="nawawi-word-meaning" className="book-word-popover nawawi-popover" ref={popover} aria-label="Перевод слова" style={{left:position.left,top:position.top,width:position.width,'--word-arrow':position.arrow+'px'} as CSSProperties}><div role="status" aria-live="polite"><strong className="arabic" lang="ar" dir="rtl">{selected.word.ar}</strong><p>{selected.word.ru}</p></div><button className="book-save-word" type="button" aria-label={saved?'Слово уже в словаре':'Добавить слово в словарь'} aria-pressed={saved} disabled={saved} onClick={()=>commit(addReadingWord(latest.current,selected.word))}>{saved?<Check size={20}/>:<Flag size={20}/>}</button></aside>}
 </section>;
}
