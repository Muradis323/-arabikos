export type AlphabetProgress={status:'learning'|'skipped'|'completed';passed:number[]};
export type Letter={id:number;ar:string;name:string;speech:string;sound:string;note:string;forms:string[]};
const rows=[
 ['ا','Алиф','أَلِف','ā — долгое «а»','Обозначает долгий гласный; хамза ء — отдельный знак.'],
 ['ب','Ба','بَاء','b — б',''],['ت','Та','تَاء','t — т',''],['ث','С̱а','ثَاء','th / ṯ','Кончик языка между зубами: глухой звук, как английское th в think.'],
 ['ج','Джим','جِيم','j — дж',''],['ح','Х̣а','حَاء','ḥ','Глухой гортанный звук; не обычное русское «х».'],['خ','Ха','خَاء','kh — х','Похож на русское «х», произносится глубже.'],
 ['د','Даль','دَال','d — д',''],['ذ','З̱аль','ذَال','dh / ḏ','Кончик языка между зубами: звонкий звук, как th в this.'],['ر','Ра','رَاء','r — р',''],['ز','Зай','زَاي','z — з',''],
 ['س','Син','سِين','s — с',''],['ش','Шин','شِين','sh — ш',''],['ص','С̣ад','صَاد','ṣ','Глубокое, эмфатическое «с».'],['ض','Д̣ад','ضَاد','ḍ','Глубокое, эмфатическое «д».'],
 ['ط','Т̣а','طَاء','ṭ','Глубокое, эмфатическое «т».'],['ظ','З̣а','ظَاء','ẓ','Эмфатический межзубный звонкий звук.'],['ع','Айн','عَيْن','ʿ','Звонкий гортанный звук; русского аналога нет.'],['غ','Гайн','غَيْن','gh / ġ','Звонкий заднеязычный звук; не обычное русское «г».'],
 ['ف','Фа','فَاء','f — ф',''],['ق','К̣аф','قَاف','q','Глубокое «к» у корня языка.'],['ك','Каф','كَاف','k — к',''],['ل','Лям','لَام','l — л',''],['م','Мим','مِيم','m — м',''],['ن','Нун','نُون','n — н',''],
 ['ه','Һа','هَاء','h','Лёгкий выдох, как английское h; не русское «х».'],['و','Вау','وَاو','w / ū','Губной w или долгое «у» в зависимости от огласовок.'],['ي','Йа','يَاء','y / ī','«Й» или долгое «и» в зависимости от огласовок.']
];
export const letters:Letter[]=rows.map(([ar,name,speech,sound,note],id)=>{const joins=!'ادذرزو'.includes(ar);return {id,ar,name,speech,sound,note,forms:[ar,joins?ar+'ـ':ar,joins?'ـ'+ar+'ـ':'ـ'+ar,'ـ'+ar]}});
export const positions=['Отдельно','В начале','В середине','В конце'];
export function shuffle<T>(items:T[]):T[]{const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}return result}
export function alphabetQuestion(id:number){const position=Math.floor(Math.random()*4);const ids=shuffle([id,...shuffle(letters.filter(l=>l.id!==id).map(l=>l.id)).slice(0,3)]);return {id,position,options:ids.map(optionId=>({id:optionId,ar:letters[optionId].forms[position]}))}}
export function validateAlphabet(a:AlphabetProgress){return !!a&&['learning','skipped','completed'].includes(a.status)&&Array.isArray(a.passed)&&a.passed.every(id=>Number.isInteger(id)&&id>=0&&id<28)&&new Set(a.passed).size===a.passed.length&&(a.status!=='completed'||a.passed.length===28)}
