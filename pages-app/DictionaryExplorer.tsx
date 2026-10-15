import {useState} from 'react';
import {DictionaryList} from './DictionaryList';
import {words,lessonSentenceBank,arabicText,isWordLearned,type Word,type Progress} from './lib/course';
export const searchText=(s:string)=>s.normalize('NFC').toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').trim();
const base=(s:string)=>searchText(s).replace(/^ال/,'');
export function DictionaryExplorer({items,progress,mastered,speak,subtitle,onMove}:{items:Word[];progress:Progress;mastered:boolean;speak:(s:string)=>void;subtitle:(w:Word)=>string;onMove:(id:number)=>void}){
 const [query,Q]=useState(''),[selected,S]=useState<number|null>(null);
 const filtered=items.filter(w=>!query||searchText(w.ar).includes(searchText(query))||searchText(w.ru).includes(searchText(query)));
 const word=items.find(w=>w.id===selected),variants=word?words.filter(w=>w.id!==word.id&&isWordLearned(progress,w.id)&&base(w.ar)===base(word.ar)):[];
 const examples=word?lessonSentenceBank.flat().filter(e=>e.ids.every(id=>isWordLearned(progress,id))&&e.ids.some(id=>base(words[id].ar)===base(word.ar))).filter((e,i,a)=>a.findIndex(x=>x.ids.join(',')===e.ids.join(','))===i).slice(0,2):[];
 return <><label className="dictionary-search">Найти слово<input type="search" value={query} onChange={e=>Q(e.target.value)} placeholder="Арабское слово или русский перевод"/></label><p className="muted">Найдено: {filtered.length}</p>{filtered.length?<DictionaryList words={filtered} mastered={mastered} speak={speak} subtitle={subtitle} onMove={onMove} onDetails={id=>S(selected===id?null:id)}/>:<p className="empty">Такого слова пока нет в этом списке.</p>}{word&&<section className="word-details"><button className="textbtn" onClick={()=>S(null)}>Закрыть разбор</button><h2 className="arabic" dir="rtl" lang="ar">{word.ar}</h2><p>{word.ru}</p>{variants.length>0&&<><h3>Изученные формы</h3>{variants.map(w=><p key={w.id}><button className="textbtn arabic" onClick={()=>speak(w.ar)} lang="ar">{w.ar}</button> — {w.ru}</p>)}</>}{examples.length>0?<><h3>В предложениях</h3>{examples.map((e,i)=><div key={i}><button className="textbtn arabic" dir="rtl" lang="ar" onClick={()=>speak(arabicText(e.ids))}>{arabicText(e.ids)}</button><p>{e.ru}</p></div>)}</>:<p>Примеры появятся после изучения нужных слов.</p>}</section>}</>;
}
