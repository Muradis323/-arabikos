export const readingWordKey=(ar:string)=>ar.normalize('NFKC').replace(/ٱ/g,'ا').replace(/[\u0640\u064b-\u065f\u0670]/g,'').replace(/[^\u0621-\u063a\u0641-\u064a]/g,'');
export function dictionaryReadingKey(ar:string){const key=readingWordKey(ar);return key.startsWith('ال')&&key!=='الله'?key.slice(2):key}
