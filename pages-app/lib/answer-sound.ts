let context:AudioContext|undefined;
export function playAnswerSound(correct:boolean){
 try{
  context??=new AudioContext();
  if(context.state==='suspended')void context.resume().catch(()=>{});
  const now=context.currentTime;
  // Quiet, rounded bell notes; no buzzer or abrupt cutoff.
  const notes=correct?[523.25,659.25,783.99]:[349.23,329.63];
  notes.forEach((frequency,i)=>{
   const oscillator=context!.createOscillator(),gain=context!.createGain(),start=now+i*(correct?.085:.11);
   oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,start);
   gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(correct?.045:.035,start+.025);gain.gain.exponentialRampToValueAtTime(.0001,start+.38);
   oscillator.connect(gain);gain.connect(context!.destination);oscillator.start(start);oscillator.stop(start+.42);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};
  });
 }catch{/* Audio must never interrupt a lesson. */}
}
