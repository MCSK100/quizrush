import { Link } from 'react-router-dom';
import { Plus, LogIn } from 'lucide-react';
export default function MultiplayerHome(){
return (<div className="mx-auto max-w-3xl px-4 py-14 text-center">
<p className="text-[11px] font-extrabold tracking-[0.24em] text-coralDeep">MULTIPLAYER · REAL-TIME</p>
<h1 className="font-display mt-3 text-4xl tracking-tight text-ink sm:text-5xl">Race your friends.<br/><span className="qr-gradient-text">Live.</span></h1>
<p className="mx-auto mt-3 max-w-md text-[15px] font-medium text-muted">Create a room, share the code, answer at the same time. Fastest brain climbs the board.</p>
<div className="mx-auto mt-8 grid max-w-lg gap-3 sm:grid-cols-2">
<Link to="/multiplayer/create" className="qr-btn-primary flex items-center justify-center gap-2 rounded-2xl py-5 font-display text-base"><Plus strokeWidth={3}/> CREATE GAME</Link>
<Link to="/multiplayer/join" className="qr-btn-ghost flex items-center justify-center gap-2 rounded-2xl py-5 font-display text-base text-ink"><LogIn size={18}/> JOIN GAME</Link>
</div>
<div className="qr-surface mx-auto mt-6 max-w-lg rounded-[24px] p-5 text-left text-sm"><b className="font-display text-ink">How a battle works</b><ol className="mt-2 flex flex-col gap-1.5 font-medium text-muted"><li>1. Host picks category, questions & timer</li><li>2. Players join with a 5-letter code</li><li>3. Countdown → everyone answers together → live leaderboard</li></ol></div>
</div>);
}
