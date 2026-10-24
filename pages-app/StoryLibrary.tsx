import {BookReader} from './BookReader';
// Keep the existing route and progress container when replacing the reading material.
export function StoryLibrary(props:Parameters<typeof BookReader>[0]){return <BookReader {...props}/>}
