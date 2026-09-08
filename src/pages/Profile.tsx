import { Link } from 'react-router-dom';
import { loadProfile } from '../stores/app';
import { fmt } from '../services/engine';
export default function Profile(){
const p=loadProfile() as {games?:number;wins?:number;totalScore?:number;totalCorrect?:number;totalQ?:number;history?:number[];cats?:Record<string,number>};
const games=p.games||0;const acc=p.totalQ?Math.round((p.totalCorrect||0)/p.totalQ*100):0;
const fav=Object.entries(p.cats||{}).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—';
const hist=p.history||[];
return (<div className="mx-auto max-w-3xl px-4 py-8">
<h1 className="text-3xl font-black">Your <span className="text-neon">Stats</span></h1>
{games===0?(<div className="mt-6 rounded-xl border border-[#2D1B4E]/10 bg-white/80 p-8 text-center"><p className="font-black">No battles yet.</p><p className="text-sm text-muted">Your next quiz battle starts now.</p><Link to="/solo" className="btn-press mt-4 inline-block rounded-lg bg-neon px-6 py-3 font-black text-white">PLAY SOLO</Link></div>):
(<><div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
{[[String(games),'GAMES'],[String(p.wins||0),'WINS'],[fmt(Math.round((p.totalScore||0)/games)),'AVG SCORE'],[acc+'%','ACCURACY']].map(([v,l])=>(<div key={l} className="rounded-xl border border-[#2D1B4E]/10 bg-white/80 p-4 text-center"><div className="font-num text-2xl font-black text-neon">{v}</div><div className="text-[10px] tracking-widest text-muted">{l}</div></div>))}
</div>
<div className="mt-3 rounded-xl border border-[#2D1B4E]/10 bg-white/80 p-4"><div className="text-xs font-black tracking-widest text-muted">FAVORITE ARENA · {String(fav).toUpperCase()}</div>
<div className="mt-3 flex h-20 items-end gap-1.5">{hist.map((h,i)=>(<div key={i} title={String(h)} className="flex-1 rounded-sm bg-neon/70" style={{height:`${Math.max(8,Math.min(100,h/120))}%`}}/>))}<span className="sr-only">Performance chart</span></div></div>
</>)}
</div>);
}
