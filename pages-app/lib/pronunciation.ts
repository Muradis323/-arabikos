import {useEffect,useState} from 'react';
export function voiceGender(voice:Pick<SpeechSynthesisVoice,'name'>){
 const n=voice.name.toLowerCase();
 if(/female|laila|leila|salma|hoda|zeina|mariam|mouna|fatima|amina|noura|sana|zariyah/.test(n))return 'female';
 if(/male|maged|majed|tarik|hammad|naayf|ali(?:\b|neural)|omar|hamdan|ismail|bassel|fahed|jamal|moaz|saleh/.test(n))return 'male';
 return 'unknown';
}
export function arabicVoices(){return typeof window!=='undefined'&&'speechSynthesis' in window?window.speechSynthesis.getVoices().filter(v=>/^ar(?:-|$)/i.test(v.lang)):[]}
export function selectVoice(voices:SpeechSynthesisVoice[],choice:string){const exact=voices.find(v=>v.voiceURI===choice);if(exact)return exact;return voices.find(v=>voiceGender(v)===choice)||voices.find(v=>v.lang==='ar-SA')||voices[0]}
export function usePronunciation(sound:boolean,choice='auto'){
 const [voices,V]=useState<SpeechSynthesisVoice[]>([]),[message,M]=useState('');
 useEffect(()=>{if(!('speechSynthesis' in window))return;const synth=window.speechSynthesis;const update=()=>V(arabicVoices());update();synth.addEventListener('voiceschanged',update);return()=>{synth.removeEventListener('voiceschanged',update);synth.cancel()}},[]);
 useEffect(()=>{if(!sound&&'speechSynthesis' in window)window.speechSynthesis.cancel()},[sound]);
 function speak(text:string){M('');if(!sound)return;if(!('speechSynthesis' in window)){M('В этом браузере озвучка недоступна.');return}
 const voice=selectVoice(arabicVoices(),choice);if(!voice){M('На устройстве нет арабского голоса. Добавьте его в настройках озвучивания устройства.');return}
 // Use Arabic text with its vowel marks, never a transliteration or translation.
 const u=new SpeechSynthesisUtterance(text.normalize('NFC'));u.voice=voice;u.lang=voice.lang;u.rate=.85;u.pitch=1;u.volume=1;
 u.onerror=e=>{if(e.error!=='canceled'&&e.error!=='interrupted')M('Не удалось озвучить. Нажмите на слово ещё раз.')};window.speechSynthesis.cancel();window.speechSynthesis.speak(u);
 }
 return {available:voices.length>0,voices,message,speak};
}
