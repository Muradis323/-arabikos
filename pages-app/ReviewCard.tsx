import {type Word} from './lib/course';
export function ReviewCard({word,reverse,flip,disabled,onFlip}:{word:Word;reverse:boolean;flip:boolean;disabled:boolean;onFlip:()=>void}){
 const showArabic=reverse?flip:!flip;
 return <button className={'flashcard '+(flip?'flipped':'')} onClick={()=>{if(!disabled)onFlip()}} aria-label="Показать другую сторону карточки">
 {!flip&&<span className="eyebrow">{reverse?'ВСПОМНИТЕ АРАБСКОЕ СЛОВО':'ВСПОМНИТЕ ПЕРЕВОД'}</span>}
 {showArabic?<span className="arabic giant" lang="ar" dir="rtl">{word.ar}</span>:<strong className="flashcard-translation" lang="ru">{word.ru}</strong>}
 {!flip&&<span className="muted">Нажмите на карточку, чтобы посмотреть ответ</span>}
 </button>;
}
