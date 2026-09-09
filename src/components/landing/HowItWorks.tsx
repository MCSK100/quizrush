import { motion } from 'framer-motion';
import { Plus, Users, Zap, Trophy } from 'lucide-react';
import { SectionHead } from './Sections';

const STEPS = [
  { n: '01', title: 'CREATE', desc: 'Choose category, questions and timer.', icon: <Plus size={22} />, bg: 'linear-gradient(135deg,#38BDF8,#2563EB)', soft: '#E8F4FF', glow: 'rgba(46,155,255,0.45)' },
  { n: '02', title: 'CHALLENGE', desc: 'Share your room code.', icon: <Users size={22} />, bg: 'linear-gradient(135deg,#818CF8,#6D28D9)', soft: '#ECEFFF', glow: 'rgba(109,40,217,0.40)' },
  { n: '03', title: 'PLAY', desc: 'Answer faster, score higher.', icon: <Zap size={22} />, bg: 'linear-gradient(135deg,#2E9BFF,#7C5CFF)', soft: '#EAF3FF', glow: 'rgba(46,155,255,0.45)' },
  { n: '04', title: 'WIN', desc: 'Climb the leaderboard.', icon: <Trophy size={22} />, bg: 'linear-gradient(135deg,#8B5CF6,#D946EF)', soft: '#F3E9FF', glow: 'rgba(168,85,247,0.42)' },
];

export default function HowItWorks() {
  return (
    <section className="relative mx-auto w-full min-w-0 max-w-6xl overflow-x-clip px-4 py-12 sm:px-5 sm:py-20">
      <SectionHead eyebrow="HOW IT WORKS" title={<>From lobby to legend <span className="qr-gradient-text">in seconds.</span></>} sub="A game progression, not a form. Four moves and you're playing." align="center" />
      <div className="relative mt-8 sm:mt-12">
        <svg aria-hidden className="absolute left-[12%] top-9 hidden h-10 w-[76%] lg:block" viewBox="0 0 800 40" preserveAspectRatio="none">
          <motion.path d="M10,20 C180,6 340,34 520,18 S700,8 790,20" fill="none" stroke="#C9BFF5" strokeWidth="3" strokeDasharray="1 12" strokeLinecap="round"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: 'easeOut' }} />
        </svg>
        <div className="grid grid-cols-1 gap-7 min-[480px]:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: i * 0.14, duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="relative min-w-0 text-center">
              <div className="relative mx-auto grid h-[72px] w-[72px] place-items-center rounded-[24px] text-white transition-transform duration-300 hover:scale-110 hover:-rotate-6 sm:h-[76px] sm:w-[76px] sm:rounded-[26px]" style={{ background: s.bg, boxShadow: `0 18px 36px -12px ${s.glow}` }}>
                <span aria-hidden className="absolute -inset-2 rounded-[30px] opacity-50 blur-xl" style={{ background: s.bg }} />
                <span className="relative">{s.icon}</span>
                <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-white font-display text-[12px] font-semibold text-ink shadow-soft sm:h-8 sm:w-8 sm:text-[13px]" style={{ border: '1px solid rgba(120,100,180,0.10)' }}>{s.n}</span>
              </div>
              <h3 className="font-display mt-3 text-[18px] font-semibold tracking-wide text-ink sm:mt-4 sm:text-[20px]">{s.title}</h3>
              <p className="mx-auto mt-1 max-w-[220px] text-balance text-[13.5px] font-medium leading-relaxed text-muted sm:text-[14px]">{s.desc}</p>
              {i < 3 && <span aria-hidden className="mx-auto mt-2 block text-lg leading-none text-[#C9BFF5] min-[480px]:hidden">↓</span>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
