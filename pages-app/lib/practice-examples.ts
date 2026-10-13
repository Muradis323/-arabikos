import {words,wordId,lessonSentenceBank} from './course';
export type PracticeExample={ids:number[];ru:string;kind?:string};
export function practiceExamples(completed:number[]):PracticeExample[]{const seen=new Set<string>();return [...lessonSentenceBank.flat(),...connectedExamples].filter(e=>{if(!e.ids.every(id=>words[id]&&completed.includes(words[id].lesson)))return false;const key=e.ids.join(',');if(seen.has(key))return false;seen.add(key);return true}).sort((a,b)=>Math.max(...b.ids.map(id=>words[id].lesson))-Math.max(...a.ids.map(id=>words[id].lesson)))}
export function validatePractice(){lessonSentenceBank.forEach((bank,lesson)=>{for(const e of bank)if(!e.ids.length||!e.ru||e.ids.some(id=>!words[id]||words[id].lesson>lesson))throw Error('Invalid practice example')});return true}
validatePractice();

function shuffle<T>(items:T[]):T[]{const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}return result}
export function practiceSession(completed:number[],previousFirst?:string,selectedLesson:number|null=null):PracticeExample[]{
 const pool=practiceExamples(completed).filter(e=>e.ids.length<=10);
 if(selectedLesson!==null)return shuffle(pool.filter(e=>Math.max(...e.ids.map(id=>words[id].lesson))===selectedLesson));
 const count=new Set(completed.filter(id=>Number.isInteger(id)&&id>=0&&id<lessonSentenceBank.length)).size*5;
 if(!count)return [];
 const latest=Math.max(...completed);
 const recent=shuffle(pool.filter(e=>e.ids.some(id=>words[id].lesson===latest)));
 const first=recent.slice(0,5);
 if(first[0]?.ids.join(',')===previousFirst&&recent.length>5)first[0]=recent[5];
 const remaining=shuffle(pool.filter(e=>!first.includes(e)));
 // Include a connected conversation or story in every session when available.
 if(!first.some(e=>e.kind)){const connected=remaining.find(e=>e.kind);if(connected){if(count===5){const newest=recent.find(e=>e.kind);if(newest)first[4]=newest}else{remaining.splice(remaining.indexOf(connected),1);remaining.unshift(connected)}}}
 return [...first,...remaining].slice(0,count);
}
const connectedExamples:PracticeExample[]=[];
function connected(kind:string,keys:string[],ru:string){connectedExamples.push({kind,ids:keys.map(wordId),ru})}
for(const key of ['book','pen','key','house','mosque','chair'])connected('Диалог',['what','this','this',key],'— Что это?\n— Это '+words[wordId(key)].ru+'.');
for(const key of ['teacher','student','doctor','boy','man'])connected('Диалог',['who','this','this',key],'— Кто это?\n— Это '+words[wordId(key)].ru+'.');
connected('Диалог',['a','this','book','no','this','notebook'],'— Это книга?\n— Нет, это тетрадь.');
connected('Диалог',['where','theBook','theBook','on','deskG'],'— Где книга?\n— Книга на столе.');
connected('Диалог',['where','theTeacher','he','in','classroomG'],'— Где учитель?\n— Он в классе.');
connected('Мини-рассказ',['this','house','theHouse','large','theDoor','open'],'Это дом. Дом большой. Дверь открыта.');
connected('Мини-рассказ',['this','book','and','that','pen','theBook','new','thePen','small'],'Это книга, а то ручка. Книга новая. Ручка маленькая.');
connected('Мини-рассказ',['this','student','theStudent','in','roomG','theBook','on','deskG'],'Это студент. Студент в комнате. Книга на столе.');
// Reuse coherent lesson examples as connected exchanges: question then its complete answer.
for(const bank of lessonSentenceBank){for(const answer of bank){const location=answer.ids.indexOf(wordId('in'));if(location===1&&answer.ids.length===3){connectedExamples.push({kind:'Диалог',ids:[wordId('where'),answer.ids[0],...answer.ids],ru:'— Где '+words[answer.ids[0]].ru.replace(/:.*$/,'')+'?\n— '+answer.ru});}}}
connected('Мини-рассказ',['thisF','girl','she','in','roomG','thisF','bag','newF'],'Это девочка. Она в комнате. Это новая сумка.');
connected('Мини-рассказ',['thatF','car','theCar','newF','theBag','in','roomG','theBag','beautifulF'],'То машина. Машина новая. Сумка в комнате. Сумка красивая.');
connected('Мини-рассказ',['this','engineer','and','that','merchant','theStudent','in','classroomG','theStudent','hardworking'],'Этот — инженер, а тот — торговец. Студент в классе. Студент прилежный.');
connected('Мини-рассказ',['I','student','myFather','teacher','myBrother','engineer','myBook','on','deskG'],'Я студент. Мой отец — учитель. Мой брат — инженер. Моя книга на столе.');
connected('Диалог',['whose','theBook','theBook','toMe','myBook','new','yourBookM','old'],'— Чья книга?\n— Книга принадлежит мне. Моя книга новая. Твоя книга старая.');
connected('Мини-рассказ',['myMother','teacherF','mySister','studentF','mySister','in','roomG','myBag','on','deskG'],'Моя мать — учительница. Моя сестра — студентка. Моя сестра в комнате. Моя сумка на столе.');
connected('Диалог',['where','yourBookF','myBook','on','deskG','yourBagF','beautifulF'],'— Где твоя книга? (Обращение к женщине.)\n— Моя книга на столе. Твоя сумка красивая.');
connected('Мини-рассказ',['these','studentsPl','theyM','hardworkingPl','theyM','outMpl','from','classroomG','theyM','wentMpl','to','mosqueG'],'Это студенты. Они прилежные. Они вышли из класса. Они пошли в мечеть.');
connected('Мини-рассказ',['these','friendsPl','myBrothers','studentsPl','theyM','in','yourSchoolPlG','yourSchoolPl','largeF'],'Это друзья. Мои братья — студенты. Они в вашей школе. Ваша школа большая.');
connected('Мини-рассказ',['these','studentsFpl','theyF','hardworkingFpl','theyF','outFpl','from','classroomG','theyF','wentFpl','to','houseG'],'Это студентки. Они прилежные. Они вышли из класса. Они пошли в дом.');
connected('Мини-рассказ',['theRoomsPl','largeF','theDoorsPl','openF','theBooksPl','on','deskG','theBooksPl','newF'],'Комнаты большие. Двери открыты. Книги на столе. Книги новые.');
connected('Мини-рассказ',['these','doctorsPl','theyM','outMpl','from','mosqueG','theyM','wentMpl','to','houseG','theHouse','large'],'Это врачи. Они вышли из мечети. Они пошли в дом. Дом большой.');
connected('Диалог',['howMany','brotherAcc','toYouM','toMe','brothersTwo','myBrothers','studentsPl'],'— Сколько у тебя братьев?\n— У меня два брата. Мои братья — студенты.');
connected('Мини-рассказ',['in','classroomG','threeM','studentsPlG','theStudentsPl','hardworkingPl','theBooksPl','on','deskG','theBooksPl','newF'],'В классе три студента. Студенты прилежные. Книги на столе. Книги новые.');
connected('Мини-рассказ',['in','classroomG','fiveF','studentsFplG','theStudentsFpl','hardworkingFpl','theBooksPl','on','deskG','theWindow','openF'],'В классе пять студенток. Студентки прилежные. Книги на столе. Окно открыто.');
