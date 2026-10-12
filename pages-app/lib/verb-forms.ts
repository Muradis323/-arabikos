import {words,isWordLearned,type Progress} from './course';
export type VerbForm={ar:string;ru:string;tense:string};
export function formsFor(id:number):VerbForm[]{const word=words[id];return word?.kind==='verb'?[{ar:word.ar,ru:word.ru,tense:word.ru.startsWith('она ')?'Прошедшее · она':word.ru.startsWith('они ')?'Прошедшее · они':'Прошедшее · он'}]:[]}
export const practicedVerbs=(progress:Progress|number[])=>words.filter(w=>w.kind==='verb'&&(Array.isArray(progress)?progress.includes(w.lesson):isWordLearned(progress,w.id)));
