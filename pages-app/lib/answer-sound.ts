let context:AudioContext|undefined;
export function playAnswerSound(correct:boolean){
 try{
  context??=new AudioContext();
  if(context.state==='suspended')void context.resume().catch(()=>{});
  const now=context.currentTime;
  const notes=correct?[660,880]:[260,195];
  notes.forEach((frequency,i)=>{
   const oscillator=context!.createOscillator(),gain=context!.createGain(),start=now+i*.075;
   oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,start);
   gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.09,start+.01);gain.gain.exponentialRampToValueAtTime(.001,start+.13);
   oscillator.connect(gain);gain.connect(context!.destination);oscillator.start(start);oscillator.stop(start+.15);
  });
 }catch{/* Sound is optional: learning must never depend on audio support. */}
}
