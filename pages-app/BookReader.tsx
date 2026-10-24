import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {Flag,ChevronLeft,ChevronRight} from 'lucide-react';
import {readingPages,pageTurn,swipePageDelta} from './lib/reading-pages';
import {adhkarBook} from './lib/adhkar-book';
import {type ReadingProgress} from './lib/course';
export type BookToken={ar:string;ru?:string};
export const readingWordKey=(ar:string)=>ar.normalize('NFKC').replace(/ٱ/g,'ا').replace(/[\u0640\u064b-\u065f\u0670]/g,'').replace(/[^\u0621-\u063a\u0641-\u064a]/g,'');
export function dictionaryReadingKey(ar:string){const key=readingWordKey(ar);return key.startsWith('ال')&&key!=='الله'?key.slice(2):key}
export function existingReadingWord(reading:ReadingProgress,ar:string){const key=dictionaryReadingKey(ar);return Object.entries(reading.cards).find(([,card])=>dictionaryReadingKey(card.ar)===key)?.[0]}
export function addReadingWord(reading:ReadingProgress,word:BookToken):ReadingProgress{
 if(!word.ru||!readingWordKey(word.ar)||existingReadingWord(reading,word.ar))return reading;
 return {...reading,cards:{...reading.cards,[word.ar]:{ar:word.ar,ru:word.ru,level:0,due:0,seen:0}}};
}
const empty:ReadingProgress={paragraph:0,font:34,cards:{}};
export function BookReader({reading=empty,onChange,knownWords=[]}:{reading?:ReadingProgress;knownWords?:readonly {ar:string}[];onChange?:(reading:ReadingProgress)=>void}){
 const [page,Page]=useState(()=>pageTurn(0,reading.bookmarks?.[adhkarBook.id]??(reading.storyId===adhkarBook.id?reading.paragraph:0),readingPages.length));
 const [selected,Select]=useState<{word:BookToken;id:string}|null>(null),[position,Position]=useState({left:16,top:120,width:240,arrow:120});
 const anchor=useRef<HTMLButtonElement|null>(null),popover=useRef<HTMLElement|null>(null),article=useRef<HTMLElement|null>(null),latest=useRef(reading),change=useRef(onChange);
 const gesture=useRef<{x:number;y:number;word:boolean;moved:boolean;id:number}|null>(null),ignoreClick=useRef(false),direction=useRef(1);latest.current=reading;change.current=onChange;
 function commit(n:ReadingProgress){latest.current=n;change.current?.(n)}
 function remember(n:number){const r=latest.current;if(r.storyId===adhkarBook.id&&r.paragraph===n)return;commit({...r,storyId:adhkarBook.id,paragraph:n,bookmarks:{...r.bookmarks,...(r.storyId!==adhkarBook.id?{[r.storyId??'ibrahim-retelling-v1']:r.paragraph}:{}),[adhkarBook.id]:n}})}
 function close(focus=false){Select(null);if(focus)anchor.current?.focus({preventScroll:true})}
 function place(node:HTMLButtonElement){
  const rect=node.getBoundingClientRect(),width=Math.min(280,window.innerWidth-24),height=popover.current?.offsetHeight??102;
  const left=Math.max(12,Math.min(window.innerWidth-width-12,rect.left+rect.width/2-width/2));
  Position({left,top:Math.max(8,rect.top-height-12),width,arrow:Math.max(18,Math.min(width-18,rect.left+rect.width/2-left))});
 }
 function pick(node:HTMLButtonElement,toggle=false){
  const [bi,ti]=node.dataset.word!.split(':').map(Number),word=adhkarBook.blocks[bi]?.tokens[ti] as BookToken|undefined;if(!word?.ru)return;
  anchor.current=node;const id=node.dataset.word!;Select(toggle&&selected?.id===id?null:{word,id});place(node);remember(page);
 }
 function turn(delta:number){const next=pageTurn(page,delta,readingPages.length);if(next===page)return;direction.current=delta;close();Page(next);remember(next);article.current?.scrollIntoView({block:'start',behavior:'smooth'})}
 useEffect(()=>{remember(page)},[]);
 useEffect(()=>{
  if(!selected)return;
  const refresh=()=>{if(anchor.current?.isConnected)place(anchor.current)};
  const frame=requestAnimationFrame(()=>{const node=anchor.current;if(node&&popover.current){const top=node.getBoundingClientRect().top,height=popover.current.offsetHeight;if(top<height+20)window.scrollBy(0,top-height-20)}refresh()}),escape=(e:KeyboardEvent)=>{if(e.key==='Escape')close(true)},outside=(e:PointerEvent)=>{const node=e.target as Node;if(!article.current?.contains(node)&&!popover.current?.contains(node))close()};
  window.addEventListener('keydown',escape);window.addEventListener('resize',refresh);window.addEventListener('scroll',refresh,true);window.addEventListener('pointerdown',outside);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('keydown',escape);window.removeEventListener('resize',refresh);window.removeEventListener('scroll',refresh,true);window.removeEventListener('pointerdown',outside)};
 },[selected?.id]);
 const saved=!!selected&&(existingReadingWord(reading,selected.word.ar)!==undefined||knownWords.some(word=>dictionaryReadingKey(word.ar)===dictionaryReadingKey(selected.word.ar)));
 const fragments=readingPages[page].fragments;
 return <div className="book-reader paged-book"><header className="book-reader-heading"><span className="eyebrow">ЧТЕНИЕ · АЗКАРЫ И ДУА</span><h1>Азкары и дуа</h1><p>Коснитесь слова и ведите пальцем по тексту. Листайте справа налево.</p></header>
 <article ref={article} key={page} className={'book-reading-page book-leaf '+(direction.current>0?'leaf-forward':'leaf-backward')} aria-label={'Страница '+(page+1)+' из '+readingPages.length} lang="ar" dir="rtl" style={{fontSize:reading.font}}
 onPointerDown={event=>{if(event.button!==0||event.isPrimary===false)return;const node=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-word]');gesture.current={x:event.clientX,y:event.clientY,word:!!node,moved:false,id:event.pointerId};ignoreClick.current=false;if(node){event.preventDefault();pick(node);event.currentTarget.setPointerCapture(event.pointerId)}}}
 onPointerMove={event=>{const g=gesture.current;if(!g||g.id!==event.pointerId)return;if(Math.abs(event.clientX-g.x)+Math.abs(event.clientY-g.y)>7)g.moved=true;if(!g.word)return;event.preventDefault();const node=document.elementFromPoint(event.clientX,event.clientY)?.closest<HTMLButtonElement>('[data-word]');if(node&&article.current?.contains(node)&&node!==anchor.current)pick(node);if(event.clientY>window.innerHeight-60)window.scrollBy(0,12);else if(event.clientY<85)window.scrollBy(0,-12)}}
 onPointerUp={event=>{const g=gesture.current;if(!g||g.id!==event.pointerId)return;gesture.current=null;ignoreClick.current=g.word||g.moved;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);if(!g.word){const delta=swipePageDelta(event.clientX-g.x,event.clientY-g.y);if(delta)turn(delta);else if(!g.moved)close()}}}
 onPointerCancel={()=>{gesture.current=null;ignoreClick.current=true}}
 onKeyDown={event=>{if(event.key==='ArrowLeft'){event.preventDefault();turn(1)}else if(event.key==='ArrowRight'){event.preventDefault();turn(-1)}}}>
 {fragments.map((fragment,index)=>{const {block,start,end,continued}=fragment,bi=adhkarBook.blocks.indexOf(block);return <div className={'book-block book-'+block.kind} key={block.id+':'+start}>
 {continued&&<small className="book-continuation" lang="ru" dir="ltr">Продолжение</small>}
 {block.kind==='note'&&block.tokens.filter(t=>'ru' in t).length>25&&<small className="book-continuation" lang="ru" dir="ltr">Сноски · стр. {block.page}</small>}
 {block.tokens.slice(start,end).map((token:BookToken,j)=>token.ru?<button className="book-token" data-word={bi+':'+(start+j)} type="button" key={j} lang="ar" dir="rtl" aria-pressed={selected?.id===bi+':'+(start+j)} aria-controls={selected?.id===bi+':'+(start+j)?'book-word-meaning':undefined} onClick={event=>{if(ignoreClick.current&&event.detail!==0){ignoreClick.current=false;return}pick(event.currentTarget,true)}}>{token.ar}</button>:<span key={j}>{token.ar}</span>)}
 </div>})}
 <div className="book-leaf-number" aria-hidden="true">{new Intl.NumberFormat('ar').format(page+1)}</div>
 </article>
 <nav className="book-pagination" aria-label="Страницы книги" dir="ltr"><button type="button" aria-label="Следующая страница" disabled={page===readingPages.length-1} onClick={()=>turn(1)}><ChevronLeft size={22}/></button><span role="status" aria-live="polite">{page+1} / {readingPages.length}</span><button type="button" aria-label="Предыдущая страница" disabled={page===0} onClick={()=>turn(-1)}><ChevronRight size={22}/></button></nav>
 <p className="book-source-note">Первая глава целиком · страницы 15–19 оригинала. Место чтения сохраняется автоматически.</p>
 {selected&&<aside ref={popover} className="book-word-popover" id="book-word-meaning" aria-label="Перевод слова" style={{left:position.left,top:position.top,width:position.width,'--word-arrow':position.arrow+'px'} as CSSProperties}>
 <div role="status" aria-live="polite"><strong className="arabic" lang="ar" dir="rtl">{selected.word.ar}</strong><p>{selected.word.ru}</p></div><button type="button" className="book-save-word" aria-label={saved?'Слово уже в словаре':'Добавить слово в словарь'} aria-pressed={saved} disabled={saved} onClick={()=>commit(addReadingWord(latest.current,selected.word))}><Flag size={21} fill={saved?'currentColor':'none'}/></button>
 </aside>}
 </div>;
}
