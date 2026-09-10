import { motion } from 'framer-motion';
import type { Player } from '../types';
import { fmt } from '../services/engine';
import Avatar from './Avatar';
export function Leaderboard({players,meId,compact}:{players:Player[];meId?:string;compact?:boolean}){
const sorted=[...players].sort((a,b)=>b.score-a.score);
return (<ol className="flex flex-col gap-1.5" aria-label="Leaderboard">
{sorted.map((p,i)=>(<motion.li layout key={p.id} transition={{type:'spring',stiffness:350,damping:32}}
  className={`flex items-center gap-3 rounded-2xl border-2 px-3 ${compact?'py-1.5':'py-2.5'} ${p.id===meId?'border-neon/60 bg-[#EDE9FE] shadow-card':'border-[#2D1B4E]/10 bg-white/80'}`}>
<span className={`font-num w-7 text-center font-black ${i===0?'text-warn':i<3?'text-neon':'text-muted'}`}>{i+1}</span>
<Avatar src={p.avatar} alt={p.name} size={28} />
<span className="flex-1 truncate text-sm font-bold">{p.name}{p.isHost&&<span className="ml-2 rounded bg-royal/25 px-1.5 py-0.5 text-[10px] text-royal">HOST</span>}{p.id===meId&&<span className="ml-1 text-[10px] text-neon">YOU</span>}</span>
{p.lastDelta? <span className="font-num text-xs text-neon">+{p.lastDelta}</span>:null}
<span className="font-num text-sm font-bold">{fmt(p.score)}</span></motion.li>))}
</ol>);
}
export function RoomCodeBig({code}:{code:string}){
return (<button onClick={()=>navigator.clipboard?.writeText(code)} aria-label="Copy room code" className="btn-press rounded-2xl border-[3px] border-dashed border-neon/50 bg-white/90 px-8 py-4 text-center shadow-card hover:border-neon">
<div className="text-[11px] font-black tracking-[.3em] text-muted">JOIN CODE</div>
<div className="font-num text-5xl font-black tracking-[.15em] text-neon">{code}</div>
<div className="mt-1 text-xs text-muted">Tap to copy</div></button>);
}
