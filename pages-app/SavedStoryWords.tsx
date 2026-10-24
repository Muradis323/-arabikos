import {useState} from 'react';
import {Flag} from 'lucide-react';
import {type ReadingProgress} from './lib/course';
export function SavedStoryWords({reading,onChange,speak,onReview}:{reading?:ReadingProgress;onChange:(r:ReadingProgress)=>void;speak:(s:string)=>void;onReview:()=>void}){
 const [query,Q]=useState('');if(!reading||!Object.keys(reading.cards).length)return null;
 const plain=(s:string)=>s.normalize('NFD').replace(/[\u064b-\u065f\u0670]/g,'').toLowerCase();
 const entries=Object.entries(reading.cards).filter(([,w])=>plain(w.ar+' '+w.ru).includes(plain(query.trim())));
 return <section className="saved-story-words"><h2>Из чтения <small>{Object.keys(reading.cards).length}</small></h2><p>Слова, которые вы отметили флажком.</p><button className="textbtn" onClick={onReview}>Повторить эти слова →</button><input className="story-search" aria-label="Поиск в словах книги" placeholder="Найти слово из книги" value={query} onChange={e=>Q(e.target.value)}/>{entries.map(([key,w])=><div className="saved-story-row" key={key}><button onClick={()=>speak(w.ar)} className="arabic" lang="ar" dir="rtl">{w.ar}</button><span>{w.ru}</span><button aria-label={'Убрать из словаря: '+w.ru} title="Убрать из словаря" onClick={()=>{const cards={...reading.cards};delete cards[key];onChange({...reading,cards})}}><Flag size={18} fill="currentColor"/></button></div>)}{!entries.length&&<p>Совпадений нет.</p>}</section>;
}
