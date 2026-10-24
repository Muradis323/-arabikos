import {useEffect,useRef,useState} from 'react';
import {Flag,X} from 'lucide-react';
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
 const [selected,Select]=useState<{word:BookToken;id:string}|null>(null),anchor=useRef<HTMLButtonElement|null>(null),nodes=useRef<(HTMLDivElement|null)[]>([]),latest=useRef(reading),change=useRef(onChange);latest.current=reading;change.current=onChange;
 const initialBlock=Math.min(adhkarBook.blocks.length-1,Math.max(0,reading.bookmarks?.[adhkarBook.id]??(reading.storyId===adhkarBook.id?reading.paragraph:0)));
 function commit(n:ReadingProgress){latest.current=n;change.current?.(n)}
 function remember(paragraph:number){const r=latest.current;if(r.storyId===adhkarBook.id&&r.paragraph===paragraph)return;commit({...r,storyId:adhkarBook.id,paragraph,bookmarks:{...r.bookmarks,...(r.storyId!==adhkarBook.id?{[r.storyId??'ibrahim-retelling-v1']:r.paragraph}:{}),[adhkarBook.id]:paragraph}})}
 function close(){Select(null);anchor.current?.focus({preventScroll:true})}
 useEffect(()=>{
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')close()};window.addEventListener('keydown',escape);let observer:IntersectionObserver|undefined;
  const frame=requestAnimationFrame(()=>{if(initialBlock>0)nodes.current[initialBlock]?.scrollIntoView({block:'start'});if(typeof IntersectionObserver!=='undefined'){observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);if(visible.length){const n=Number((visible[0].target as HTMLElement).dataset.block);if(Number.isInteger(n))remember(n)}},{rootMargin:'-10% 0px -60% 0px',threshold:0});for(const node of nodes.current)if(node)observer.observe(node)}});
  return()=>{window.removeEventListener('keydown',escape);cancelAnimationFrame(frame);observer?.disconnect()};
 },[]);
 const saved=!!selected&&(existingReadingWord(reading,selected.word.ar)!==undefined||knownWords.some(word=>dictionaryReadingKey(word.ar)===dictionaryReadingKey(selected.word.ar)));
 return <div className="book-reader"><header className="book-reader-heading"><span className="eyebrow">ЧТЕНИЕ · НАЧАЛО КНИГИ</span><h1>Азкары и дуа</h1><p>Коснитесь слова для перевода. Флажок добавляет его в словарь.</p></header><article className="book-reading-page" aria-label="Книга о поминании Аллаха и мольбе" lang="ar" dir="rtl" style={{fontSize:reading.font}}>{adhkarBook.blocks.map((block,i)=><div className={'book-block book-'+block.kind} key={block.id} data-block={i} ref={node=>{nodes.current[i]=node}}>{block.tokens.map((token:BookToken,j)=>token.ru?<button className="book-token" type="button" key={j} lang="ar" dir="rtl" aria-pressed={selected?.id===block.id+':'+j} aria-controls={selected?'book-word-meaning':undefined} onClick={event=>{anchor.current=event.currentTarget;Select(selected?.id===block.id+':'+j?null:{word:token,id:block.id+':'+j});remember(i)}}>{token.ar}</button>:<span key={j}>{token.ar}</span>)}</div>)}</article><p className="book-source-note">По вашему PDF: обложка и предисловие целиком, страницы 1–7. Огласовки добавлены для чтения. Ссылки и номера хадисов сохранены как в книге. Место чтения сохраняется автоматически.</p>{selected&&<aside className="word-meaning book-word-meaning has-word" id="book-word-meaning" aria-label="Перевод слова"><div role="status" aria-live="polite"><strong className="arabic" lang="ar" dir="rtl">{selected.word.ar}</strong><p>{selected.word.ru}</p></div><button type="button" className="book-save-word" aria-label={saved?'Слово уже в словаре':'Добавить слово в словарь'} aria-pressed={saved} disabled={saved} onClick={()=>commit(addReadingWord(latest.current,selected.word))}><Flag size={23} fill={saved?'currentColor':'none'}/></button><button type="button" aria-label="Закрыть перевод" onClick={close}><X size={19}/></button></aside>}</div>;
}
