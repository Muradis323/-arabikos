import {words,type Word} from './course';
export type VerbForm={ar:string;ru:string;tense:string};
export function formsFor(id:number):VerbForm[]{const word=words[id];return word?.kind==='verb'?[{ar:word.ar,ru:word.ru,tense:'Прошедшее · он'}]:[]}
export const practicedVerbs=(completed:number[])=>words.filter(w=>w.kind==='verb'&&completed.includes(w.lesson));
