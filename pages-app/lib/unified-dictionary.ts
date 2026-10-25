import {dictionaryWords} from './dictionary-order';
import {dictionaryReadingKey} from './word-key';
import {setWordMastered,type Progress} from './course';
import {scheduleReview} from './repetition';
export type DictionaryEntry={key:string;ar:string;ru:string;courseIds:number[];savedKeys:string[];mastered:boolean;review:{level:number;due:number;seen:number;lastKnown?:boolean;misses?:number;spellingCleared?:boolean}};
export function unifiedDictionary(p:Progress,now=Date.now()):DictionaryEntry[]{
 const entries=new Map<string,DictionaryEntry>();
 function add(ar:string,ru:string,id?:number,saved?:string){
  const key=dictionaryReadingKey(ar),card=saved!==undefined?p.reading!.cards[saved]:undefined,r=card??p.reviews[id! ]??{level:0,due:0,seen:0},mastered=card?.mastered??p.mastered?.includes(id!)??false,old=entries.get(key);
  if(old){if(id!==undefined)old.courseIds.push(id);if(saved!==undefined)old.savedKeys.push(saved);old.mastered||=mastered;if(r.seen>old.review.seen||(r.seen===old.review.seen&&r.level>old.review.level))old.review={...r};return}
  entries.set(key,{key,ar,ru,courseIds:id!==undefined?[id]:[],savedKeys:saved!==undefined?[saved]:[],mastered,review:{...r}});
 }
 for(const w of dictionaryWords(p,now))add(w.ar,w.ru,w.id);
 for(const [key,w] of Object.entries(p.reading?.cards??{}))add(w.ar,w.ru,undefined,key);
 return [...entries.values()].sort((a,b)=>Number(a.mastered)-Number(b.mastered)||Number(b.review.due<=now)-Number(a.review.due<=now)||(a.review.due>now&&b.review.due>now?a.review.due-b.review.due:0));
}
export function moveDictionaryWord(p:Progress,key:string,mastered:boolean):Progress{
 const entry=unifiedDictionary(p).find(e=>e.key===key);if(!entry)return p;
 for(const id of entry.courseIds)p=setWordMastered(p,id,mastered);
 if(p.reading&&entry.savedKeys.length){const cards={...p.reading.cards};for(const k of entry.savedKeys)cards[k]={...cards[k],mastered};p={...p,reading:{...p.reading,cards}}}return p;
}
export function reviewDictionaryWord(p:Progress,key:string,known:boolean,now=Date.now()):Progress{
 const entry=unifiedDictionary(p,now).find(e=>e.key===key);if(!entry||entry.mastered)return p;
 const next=scheduleReview(entry.review,known,now),reviews={...p.reviews};for(const id of entry.courseIds)reviews[id]=next;
 let reading=p.reading;if(reading&&entry.savedKeys.length){const cards={...reading.cards};for(const k of entry.savedKeys)cards[k]={...cards[k],...next};reading={...reading,cards}}
 const wordErrors={...p.wordErrors};for(const id of entry.courseIds)wordErrors[id]=known?Math.max(0,(wordErrors[id]??0)-1):(wordErrors[id]??0)+1;
 return {...p,reviews,wordErrors,...(reading?{reading}:{})};
}
export function addCustomWord(p:Progress,ar:string,ru:string):Progress{
 ar=ar.trim().normalize('NFC');ru=ru.trim();if(!/^[\u0621-\u063a\u0640-\u065f\u0670\u0671\s]+$/.test(ar)||!dictionaryReadingKey(ar)||ar.length>200)throw Error('Введите арабское слово (можно с огласовками).');if(!ru||ru.length>1000)throw Error('Введите перевод до 1000 символов.');
 if(unifiedDictionary(p).some(w=>w.key===dictionaryReadingKey(ar)))throw Error('Это слово уже есть в словаре или архиве.');
 const reading=p.reading??{paragraph:0,font:34,cards:{}};if(Object.keys(reading.cards).length>=2000)throw Error('В словаре достигнут предел добавленных слов.');
 return {...p,reading:{...reading,cards:{...reading.cards,[ar]:{ar,ru,level:0,due:0,seen:0,source:'manual'}}}};
}
