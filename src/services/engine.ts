export function calcPoints(timer:number,elapsed:number,streak:number,mode='classic'):number{
if(elapsed>=timer)return 0;
const frac=1-elapsed/timer;let speed=30;
if(frac>0.85)speed=100;else if(frac>0.5)speed=70;else speed=30;
let pts=100+speed;if(mode==='speed')pts+=Math.round(frac*50);
if(streak+1>=10)pts+=250;else if(streak+1>=5)pts+=100;else if(streak+1>=3)pts+=50;
return pts;
}
let ctx:AudioContext|null=null;let enabled=true;
function ac():AudioContext|null{try{ctx=ctx??new (window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext)();if(ctx.state==='suspended')void ctx.resume();return ctx}catch{return null}}
function tone(freq:number,at:number,dur:number,vol=.07,type:OscillatorType='sine'){
const c=ac();if(!c)return;const o=c.createOscillator();const g=c.createGain();
o.connect(g);g.connect(c.destination);o.type=type;
const t0=c.currentTime+at;o.frequency.value=freq;
g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+.015);g.gain.exponentialRampToValueAtTime(.0008,t0+dur);
o.start(t0);o.stop(t0+dur+.02);
}
export type SoundKind='click'|'count'|'go'|'reveal'|'correct'|'wrong'|'tick'|'join'|'win'|'fanfare';
const SEQ:Record<SoundKind,[number,number,number,OscillatorType?][]>={click:[[620,0,.08,'triangle']],count:[[440,0,.12]],go:[[660,0,.12],[880,.1,.25]],
reveal:[[520,0,.1,'triangle'],[780,.08,.14,'triangle']],correct:[[660,0,.12],[990,.09,.2]],wrong:[[220,0,.2,'sawtooth'],[150,.1,.25,'sawtooth']],
tick:[[1100,0,.05,'square']],join:[[520,0,.1],[660,.07,.12]],win:[[523,0,.15],[659,.12,.15],[784,.24,.3]],
fanfare:[[523,0,.14],[659,.12,.14],[784,.24,.14],[1047,.36,.4],[784,.52,.2],[1047,.64,.5]]};
export const sound={get enabled(){return enabled},toggle(){enabled=!enabled;return enabled},
play(kind:SoundKind){if(!enabled)return;try{(SEQ[kind]||SEQ.click).forEach(([f,at,d,ty])=>tone(f,at,d,undefined,ty||'sine'))}catch{}}};
export function roomCode(len=5):string{const c='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<len;i++)s+=c[Math.floor(Math.random()*c.length)];return s}
export function fmt(n:number){return n.toLocaleString('en-US')}
