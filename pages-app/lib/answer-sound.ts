let context:AudioContext|undefined;
// Original synthesized cues: no downloaded or copied Duolingo assets.
export function playAnswerSound(correct:boolean,kind:'answer'|'complete'='answer'){
 try{
  context??=new AudioContext();
  if(context.state==='suspended')void context.resume().catch(()=>{});
  const now=context.currentTime;
  const notes=kind==='complete'?[523.25,659.25,783.99,1046.5]:correct?[659.25,880,1046.5]:[349.23,293.66];
  notes.forEach((frequency,i)=>{
   const start=now+i*(kind==='complete'?.105:.075),length=correct?.3:.16;
   for(const [multiple,volume] of [[1,.065],[2,.012]]){
    const oscillator=context!.createOscillator(),gain=context!.createGain();
    oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency*multiple,start);
    if(!correct)oscillator.frequency.exponentialRampToValueAtTime(frequency*multiple*.94,start+length);
    gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(volume,start+.008);gain.gain.exponentialRampToValueAtTime(.0001,start+length);
    oscillator.connect(gain);gain.connect(context!.destination);oscillator.start(start);oscillator.stop(start+length+.03);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};
   }
  });
 }catch{/* Audio never blocks learning; the existing sound switch controls all cues. */}
}
