import {adhkarBook} from './adhkar-book';
export type ReadingBlock=(typeof adhkarBook.blocks)[number];
export type PageFragment={block:ReadingBlock;start:number;end:number;continued:boolean};
export type ReadingPage={fragments:PageFragment[]};
const wordCount=(b:ReadingBlock,start=0,end=b.tokens.length)=>b.tokens.slice(start,end).filter(t=>'ru' in t).length;
/** Keep verses and their introductions/references together. Long prose breaks at punctuation. */
export function makeReadingPages(blocks:ReadingBlock[],limit=52):ReadingPage[]{
 const units:PageFragment[][]=[];
 for(let i=0;i<blocks.length;i++){
  const b=blocks[i];
  if(b.kind==='title'){const cover=[{block:b,start:0,end:b.tokens.length,continued:false}];while(blocks[i+1]?.kind==='byline'){const next=blocks[++i];cover.push({block:next,start:0,end:next.tokens.length,continued:false})}units.push(cover);continue}
  if(b.kind==='heading'||(blocks[i+1]?.kind==='verse'&&wordCount(b)<8)){
   const group=[{block:b,start:0,end:b.tokens.length,continued:false}];
   if(b.kind==='heading'&&blocks[i+1]?.kind==='body'){const next=blocks[++i];group.push({block:next,start:0,end:next.tokens.length,continued:false})}
   if(blocks[i+1]?.kind==='verse'){const next=blocks[++i];group.push({block:next,start:0,end:next.tokens.length,continued:false});if(blocks[i+1]?.kind==='note'){const note=blocks[++i];group.push({block:note,start:0,end:note.tokens.length,continued:false})}}
   units.push(group);continue;
  }
  let start=0,count=0;
  for(let j=0;j<b.tokens.length;j++){
   if('ru' in b.tokens[j])count++;
   if(count>=limit-16&&/[،؛؟.!]/.test(b.tokens[j].ar)&&j<b.tokens.length-1){units.push([{block:b,start,end:j+1,continued:start>0}]);start=j+1;count=0}
  }
  if(start<b.tokens.length)units.push([{block:b,start,end:b.tokens.length,continued:start>0}]);
 }
 const pages:ReadingPage[]=[];let fragments:PageFragment[]=[],count=0;
 const finish=()=>{if(fragments.length)pages.push({fragments});fragments=[];count=0};
 for(const unit of units){const cover=unit[0].block.kind==='title',n=unit.reduce((sum,f)=>sum+wordCount(f.block,f.start,f.end),0);if(cover||count+n>limit)finish();fragments.push(...unit);count+=n;if(cover)finish()}
 finish();return pages;
}
export const readingPages=makeReadingPages(adhkarBook.blocks);
export const pageTurn=(current:number,delta:number,count:number)=>Math.max(0,Math.min(count-1,current+delta));
export const swipePageDelta=(dx:number,dy:number)=>Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4?(dx<0?1:-1):0;
