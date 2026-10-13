import {words,isWordLearned,type Progress} from './course';
export const quranPassages=[
 {id:'52:4',title:'Ат-Тур · 52:4',tokens:['وَالْبَيْتِ','الْمَعْمُورِ'],ru:'Клянусь домом наполненным (храмом на седьмом небе)!',keys:['and','theHouse'],note:'Знакомое слово: الْبَيْت — дом. Новое: الْمَعْمُور — наполненный, посещаемый. وَ здесь выражает клятву, а не «и». После него: وَالْبَيْتِ. Разберите это значение перед заданием.',source:'https://quran.com/ru/гора/4/translations/quran.ru.kuliev'},
 {id:'98:3',title:'Аль-Баййина · 98:3',tokens:['فِيهَا','كُتُبٌ','قَيِّمَةٌ'],ru:'В них содержатся правдивые Писания.',keys:['in','she','booksPl'],note:'Знакомые основы: فِي — в, كُتُب — книги. Здесь كُتُب означает Писания. Новое: قَيِّمَة — правдивые; فِيهَا — в них (в свитках из предыдущего аята). Сначала прочитайте аят целиком и разберите эти значения.',source:'https://quran.com/ru/ясное-знамение/3/translations/quran.ru.kuliev'}
];
export type QuranPassage=typeof quranPassages[number];
export function missingQuranWords(p:Progress,verse:QuranPassage){return verse.keys.map(key=>words.find(w=>w.key===key)!).filter(w=>!isWordLearned(p,w.id))}
