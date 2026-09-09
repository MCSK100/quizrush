import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CATEGORIES } from '../data/categories';
import { iconFor } from '../components/SetupForm';
import { CAT_IMAGES } from '../components/landing/CategoryExplorer';
export default function Categories(){
return (<div className="mx-auto max-w-6xl px-4 py-10">
<div className="inline-flex rounded-full bg-white px-4 py-1.5 text-[11px] font-extrabold tracking-[0.18em] text-grape shadow-sticker-sm" style={{ border: '1px solid rgba(120,100,180,0.10)' }}>CATEGORIES</div>
<h1 className="font-display mt-3 text-3xl tracking-tight text-ink sm:text-4xl">All <span className="qr-gradient-text">playgrounds.</span></h1>
<p className="mt-2 text-sm font-medium text-muted">{CATEGORIES.length} worlds. Master them all.</p>
<div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
{CATEGORIES.map((c,i)=>(<motion.div key={c.id} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-30px'}} transition={{delay:(i%4)*0.06,duration:0.45}}>
<Link to={`/solo?cat=${c.id}`} className="group relative block min-w-0 overflow-hidden rounded-[22px] bg-white shadow-sticker-sm transition-transform duration-300 hover:-translate-y-1.5" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
<div className="relative h-32 overflow-hidden">
<img src={CAT_IMAGES[c.id] ?? `https://picsum.photos/seed/${c.id}/600/300`} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
<div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
</div>
<span className="relative block p-4"><span className="-mt-10 mb-2 grid h-11 w-11 place-items-center rounded-2xl bg-white text-2xl shadow-soft transition-transform group-hover:scale-110" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>{iconFor(c.icon)}</span>
<span className="font-display mt-1 block text-[17px] text-ink">{c.name}</span>
<span className="mt-1 block text-xs font-medium text-muted">{c.description}</span>
<span className="font-num mt-2 block text-[11px] font-bold text-electric">{c.count} QUESTIONS →</span></span></Link></motion.div>))}
</div></div>);
}
