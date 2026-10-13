import {words,isWordLearned,type Progress} from './course';
export type VerbForm={ar:string;ru:string;tense:string};
// Explicit conjugations for the roots introduced in the current Madinah vocabulary.
const forms:Record<string,VerbForm[]>={
 go:[
 {ar:'ذَهَبَ',ru:'Он пошёл',tense:'Прошедшее · он'},
 {ar:'ذَهَبْتُ',ru:'Я пошёл',tense:'Прошедшее · я (муж.)'},
 {ar:'ذَهَبَتْ',ru:'Она пошла',tense:'Прошедшее · она'},
 {ar:'أَذْهَبُ',ru:'Я иду',tense:'Настоящее · я'},
 {ar:'يَذْهَبُ',ru:'Он идёт',tense:'Настоящее · он'},
 {ar:'تَذْهَبُ',ru:'Она идёт',tense:'Настоящее · она'},
 {ar:'نَذْهَبُ',ru:'Мы идём',tense:'Настоящее · мы'},
 {ar:'سَأَذْهَبُ',ru:'Я пойду',tense:'Будущее · я'},
 {ar:'سَيَذْهَبُ',ru:'Он пойдёт',tense:'Будущее · он'}],
 out:[
 {ar:'خَرَجَ',ru:'Он вышел',tense:'Прошедшее · он'},
 {ar:'خَرَجْتُ',ru:'Я вышел',tense:'Прошедшее · я (муж.)'},
 {ar:'خَرَجَتْ',ru:'Она вышла',tense:'Прошедшее · она'},
 {ar:'أَخْرُجُ',ru:'Я выхожу',tense:'Настоящее · я'},
 {ar:'يَخْرُجُ',ru:'Он выходит',tense:'Настоящее · он'},
 {ar:'تَخْرُجُ',ru:'Она выходит',tense:'Настоящее · она'},
 {ar:'نَخْرُجُ',ru:'Мы выходим',tense:'Настоящее · мы'},
 {ar:'سَأَخْرُجُ',ru:'Я выйду',tense:'Будущее · я'},
 {ar:'سَيَخْرُجُ',ru:'Он выйдет',tense:'Будущее · он'}]
};
const roots:Record<string,string>={go:'go',wentF:'go',wentMpl:'go',wentFpl:'go',out:'out',outF:'out',outMpl:'out',outFpl:'out'};
export function formsFor(id:number):VerbForm[]{return forms[roots[words[id]?.key]]??[]}
export const practicedVerbs=(progress:Progress|number[])=>words.filter(w=>w.kind==='verb'&&formsFor(w.id).length&&(Array.isArray(progress)?progress.includes(w.lesson):isWordLearned(progress,w.id))).filter((w,i,all)=>all.findIndex(v=>roots[v.key]===roots[w.key])===i);
