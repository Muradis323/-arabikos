import {useState} from 'react';
import {StoryReader,type Story} from './StoryReader';
import {prophetStory} from './lib/prophet-story';
import {lutStory} from './lib/lut-story';
import {type ReadingProgress} from './lib/course';
const stories:Story[]=[prophetStory,lutStory];
type Props=Parameters<typeof StoryReader>[0];
export function StoryLibrary(props:Props){
 const [id,Id]=useState<string|null>(null);
 const r=props.reading??{paragraph:0,font:34,cards:{}};
 if(!id)return <section className="story-library"><span className="eyebrow">ЧТЕНИЕ В СВОЁМ ТЕМПЕ</span><h1>Истории пророков</h1><p>Читайте, открывайте перевод слов и сохраняйте нужные в словарь.</p>{stories.map((story,i)=><button className="story-choice" key={story.id} onClick={()=>Id(story.id)}><span>0{i+1}</span><div><strong>{story.title}</strong><small>{story.paragraphs.length} абзацев · перевод каждого слова</small></div><span>→</span></button>)}</section>;
 const story=stories.find(s=>s.id===id)!;
 const paragraph=r.bookmarks?.[id]??((r.storyId??prophetStory.id)===id?r.paragraph:0);
 function change(n:ReadingProgress){props.onChange?.({...n,storyId:story.id,bookmarks:{...r.bookmarks,[r.storyId??prophetStory.id]:r.paragraph,[story.id]:n.paragraph}})}
 return <><button className="textbtn" onClick={()=>Id(null)}>← Выбрать рассказ</button><StoryReader {...props} key={id} story={story} reading={{...r,paragraph}} onChange={change}/></>;
}
