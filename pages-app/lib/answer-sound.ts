let context:AudioContext|undefined;
export function playAnswerSound(correct:boolean){
 try{
  context??=new AudioContext();
  if(context.state==='suspended')void context.resume().catch(()=>{});
  const now=context.currentTime;
  // Soft rounded chime; the quieter response has no harsh buzzer.
  (correct?[587.33,783.99]:[392]).forEach((frequency,i)=>{
   const oscillator=context!.createOscillator(),gain=context!.createGain(),start=now+i*.085;
   oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,start);
   gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(correct?.035:.025,start+.02);gain.gain.exponentialRampToValueAtTime(.0001,start+.28);
   oscillator.connect(gain);gain.connect(context!.destination);oscillator.start(start);oscillator.stop(start+.32);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};
  });
 }catch{/* Audio must never interrupt a lesson. */}
}
