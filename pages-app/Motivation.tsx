import {useEffect,useState} from 'react';
export const reminders=[
 {text:'Господи, увеличь мои знания.',source:'Коран · Та Ха, 20:114',kind:'Смысл отрывка аята',url:'https://quran.com/20/114'},
 {text:'Поистине, вместе с трудностью приходит облегчение.',source:'Коран · Аш-Шарх, 94:5',kind:'Смысл аята',url:'https://quran.com/94/5'},
 {text:'Аллах не возлагает на душу сверх её возможностей.',source:'Коран · Аль-Бакара, 2:286',kind:'Смысл отрывка аята',url:'https://quran.com/2/286'},
 {text:'Самые любимые Аллахом дела — постоянные, пусть даже малые.',source:'Сахих аль-Бухари · 6464',kind:'Смысл отрывка хадиса',url:'https://sunnah.com/bukhari:6464'},
 {text:'Кто идёт путём в поисках знания, тому Аллах облегчает путь в Рай.',source:'Сахих Муслим · 2699а',kind:'Смысл отрывка хадиса',url:'https://sunnah.com/muslim:2699a'},
 {text:'Лучший из вас — тот, кто изучает Коран и обучает ему.',source:'Сахих аль-Бухари · 5027',kind:'Смысл хадиса',url:'https://sunnah.com/bukhari:5027'}
];
export function nextReminder(current:number,random=Math.random()){return (current+1+Math.floor(random*(reminders.length-1)))%reminders.length;}
export function Motivation(){
 const [index,I]=useState(()=>Math.floor(Math.random()*reminders.length));
 useEffect(()=>{const timer=setInterval(()=>{if(!document.hidden)I(i=>nextReminder(i))},45000);return()=>clearInterval(timer)},[]);
 const item=reminders[index];
 return <aside className="motivation"><span className="eyebrow">{item.kind}</span><blockquote key={index}>{item.text}</blockquote><a href={item.url} target="_blank" rel="noreferrer">{item.source}</a></aside>;
}
