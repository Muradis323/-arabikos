import {type ReadingProgress} from './course';
export type BookToken={ar:string;ru?:string};
import {readingWordKey,dictionaryReadingKey} from './word-key';
export function existingReadingWord(reading:ReadingProgress,ar:string){const key=dictionaryReadingKey(ar);return Object.entries(reading.cards).find(([,card])=>dictionaryReadingKey(card.ar)===key)?.[0]}
export function addReadingWord(reading:ReadingProgress,word:BookToken):ReadingProgress{
 if(!word.ru||!readingWordKey(word.ar)||existingReadingWord(reading,word.ar))return reading;
 return {...reading,cards:{...reading.cards,[word.ar]:{ar:word.ar,ru:word.ru,level:0,due:0,seen:0}}};
}
