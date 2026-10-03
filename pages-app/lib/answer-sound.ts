let context:AudioContext|undefined;
const buffers=new Map<boolean,AudioBuffer>();
export function playAnswerSound(correct:boolean){
 try{
  context??=new AudioContext();
  if(context.state==='suspended')void context.resume().catch(()=>{});
  let buffer=buffers.get(correct);
  if(!buffer){
   const duration=correct?.34:.28;
   buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate);
   const samples=buffer.getChannelData(0);let smooth=0;
   for(let i=0;i<samples.length;i++){
    const t=i/samples.length;
    smooth=.65*smooth+.35*(Math.random()*2-1);
    // Filtered noise with a soft flutter envelope: turning or lightly brushing paper.
    const envelope=correct?Math.sin(Math.PI*t)**1.5*(.7+.3*Math.sin(t*23)**2):Math.sin(Math.PI*t)**2*(.4+.6*Math.sin(t*10)**2);
    samples[i]=smooth*envelope;
   }
   buffers.set(correct,buffer);
  }
  const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
  source.buffer=buffer;filter.type='bandpass';filter.frequency.value=correct?1700:950;filter.Q.value=.55;gain.gain.value=correct?.23:.18;
  source.connect(filter);filter.connect(gain);gain.connect(context.destination);source.start();
  source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect()};
 }catch{/* Audio must never interrupt a lesson. */}
}
