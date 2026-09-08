import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { sound } from '../services/engine';
import { useRoom } from '../stores/app';
export default function RoomResults(){
const {roomCode}=useParams();const room=useRoom(s=>s.room);
useEffect(()=>{sound.play('fanfare')},[]);
const data=useMemo(()=>{try{return JSON.parse(sessionStorage.getItem('qr-room-result')||'null')}catch{return null}},[]);
const rows=[...(room?.players??[])].sort((a,b)=>b.score-a.score);
const meScore=data?.me??rows.find(r=>r.id==='me')?.score??0;
const myRank=rows.findIndex(r=>r.id==='me')+1||2;
return (<div className="mx-auto max-w-xl px-4 py-10 text-center">
<motion.div initial={{scale:.5,opacity:0}} animate={{scale:1,opacity:1}} className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-warn text-white"><Trophy size={36} strokeWidth={2.5}/></motion.div>
<h1 className="mt-4 text-4xl font-black">{myRank===1?'YOU WIN! 🏆':'YOU BEAT '+(Math.max(0,rows.length-myRank))+' PLAYERS'}</h1>
<p className="font-num mt-2 text-5xl font-black text-neon">{meScore.toLocaleString()}</p>
<div className="mt-6 rounded-xl border border-[#2D1B4E]/10 bg-white/80 p-3 text-left">
{rows.slice(0,8).map((p,i)=>(<motion.div layout key={p.id} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${i===0?'bg-warn/10 border border-warn/40':p.id==='me'?'bg-[#EDE9FE] border border-neon/40':'border border-transparent'}`}>
<span className="font-num w-6 font-black">{i+1}</span><span className="text-xl">{p.avatar}</span><span className="flex-1 font-bold">{p.id==='me'?'You':p.name}</span><span className="font-num font-bold">{p.score.toLocaleString()}</span></motion.div>))}
</div>
<div className="mt-4 flex gap-2"><Link to={`/room/${roomCode}/play`} className="btn-press flex-1 rounded-lg bg-neon py-3.5 text-center font-black text-white">PLAY AGAIN</Link><Link to="/" className="btn-press flex-1 rounded-lg border border-[#2D1B4E]/15 py-3.5 text-center font-black">HOME</Link></div>
</div>);
}
