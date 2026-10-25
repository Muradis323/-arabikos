import {useState} from 'react';
import {Plus,Layers} from 'lucide-react';
import {DictionaryRow} from './DictionaryList';
import {searchText} from './DictionaryExplorer';
import {unifiedDictionary,moveDictionaryWord,addCustomWord} from './lib/unified-dictionary';
import {repeatLabel} from './lib/review-time';
import {type Progress} from './lib/course';
export function UnifiedDictionary({progress,now,speak,onChange,onReview,onWeak,weakCount}:{progress:Progress;now:number;speak:(ar:string)=>void;onChange:(p:Progress)=>void;onReview:()=>void;onWeak:()=>void;weakCount:number}){
 const [query,Q]=useState(''),[archive,Archive]=useState(false),[adding,Adding]=useState(false),[ar,Ar]=useState(''),[ru,Ru]=useState(''),[message,Message]=useState('');
 const entries=unifiedDictionary(progress,now),active=entries.filter(w=>!w.mastered),archived=entries.filter(w=>w.mastered),due=active.filter(w=>w.review.due<=now).length;
 const shown=(archive?archived:active).filter(w=>searchText(w.ar+' '+w.ru).includes(searchText(query)));
 return <><div className="eyebrow">СЛОВА ИЗ УРОКОВ И ЧТЕНИЯ</div><div className="section-title"><h1>Мой словарь <small>{entries.length}</small></h1></div><div className="dictionary-actions"><button className="primary dictionary-action" onClick={onReview}><Layers size={18}/>Карточки <b>{due}</b></button><button className="dictionary-action" aria-expanded={adding} onClick={()=>{Adding(!adding);Message('')}}><Plus size={18}/>Добавить слово</button><button className="dictionary-action" onClick={onWeak}>Трудные слова <b>{weakCount}</b></button></div>
 {adding&&<form className="add-dictionary-word" onSubmit={event=>{event.preventDefault();try{onChange(addCustomWord(progress,ar,ru));Ar('');Ru('');Message('Слово добавлено в словарь и карточки.')}catch(error){Message((error as Error).message)}}}><label>Арабское слово<input lang="ar" dir="rtl" value={ar} maxLength={200} onChange={e=>Ar(e.target.value)} required autoComplete="off"/></label><label>Перевод<input value={ru} maxLength={1000} onChange={e=>Ru(e.target.value)} required/></label><button className="primary" type="submit">Добавить</button><p role="status">{message}</p></form>}
 {archive&&<><button className="textbtn practice-back" onClick={()=>{Archive(false);Q('')}}>← Вернуться в словарь</button><h2>Изученные слова</h2></>}
 <label className="dictionary-search">Найти слово<input type="search" value={query} onChange={e=>Q(e.target.value)} placeholder="Арабское слово или русский перевод"/></label>
 <p className="swipe-note">{archive?'Эти слова не попадают в карточки. Их можно вернуть на повторение.':'Слова из уроков, отмеченные флажком при чтении и добавленные вручную — в одном списке. Потяните слово влево, чтобы отметить его изученным.'}</p>
 <div className="dictionary swipe-dictionary">{shown.map(word=><DictionaryRow key={word.key} word={word} mastered={archive} speak={speak} subtitle={repeatLabel(word.review.due,now)} onMove={()=>onChange(moveDictionaryWord(progress,word.key,!archive))}/>)}</div>
 {!shown.length&&<p className="dictionary-empty">{query?'Совпадений нет.':archive?'В архиве пока нет слов.':'Здесь появятся слова из уроков. Можно добавить слово самому или отметить флажком при чтении.'}</p>}
 {!archive&&<button className="dictionary-mastered-link" onClick={()=>{Archive(true);Q('');window.scrollTo({top:0,behavior:'auto'})}}>Изученные слова · архив <span>{archived.length}</span><span aria-hidden="true">›</span></button>}
 </>;
}
