import {nawawiHadiths} from './nawawi-book';
export const NAWAWI_BOOK_ID='nawawi-forty-v1';
export type NawawiPage={hadith:typeof nawawiHadiths[number];start:number;end:number;part:number};
/** Word offsets stay stable across screen sizes; a desktop spread shows two leaves. */
export function paginateNawawi(hadiths=nawawiHadiths,limit=42):NawawiPage[]{
 const pages:NawawiPage[]=[];
 for(const hadith of hadiths){
  let start=0,part=0;
  while(start<hadith.tokens.length){
   let end=Math.min(start+limit,hadith.tokens.length);
   if(end<hadith.tokens.length){for(let i=end-1;i>=start+Math.floor(limit*.6);i--){if(/[،؛.؟!»]/.test(hadith.tokens[i].ar)){end=i+1;break}}}
   pages.push({hadith,start,end,part:part++});start=end;
  }
 }
 return pages;
}
export const nawawiPages=paginateNawawi();
export const clampBookPage=(page:number)=>Math.max(0,Math.min(nawawiPages.length-1,Math.trunc(page)||0));
