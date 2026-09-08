import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
export default function Tilt({children,className='',max=10}:{children:React.ReactNode;className?:string;max?:number}){
const ref=useRef<HTMLDivElement>(null);
const x=useMotionValue(.5);const y=useMotionValue(.5);
const rotateX=useSpring(useTransform(y,[0,1],[max,-max]),{stiffness:220,damping:20});
const rotateY=useSpring(useTransform(x,[0,1],[-max,max]),{stiffness:220,damping:20});
function move(e:React.MouseEvent){const r=ref.current?.getBoundingClientRect();if(!r)return;x.set((e.clientX-r.left)/r.width);y.set((e.clientY-r.top)/r.height)}
function leave(){x.set(.5);y.set(.5)}
return (<div className="tilt-scene"><motion.div ref={ref} onMouseMove={move} onMouseLeave={leave} style={{rotateX,rotateY}} className={`tilt-3d ${className}`}>{children}</motion.div></div>);
}
const FACES=['🧠','⚡','🔮','🎲','⭐','👑'];
const POS=['rotateY(0deg) translateZ(38px)','rotateY(90deg) translateZ(38px)','rotateY(180deg) translateZ(38px)','rotateY(-90deg) translateZ(38px)','rotateX(90deg) translateZ(38px)','rotateX(-90deg) translateZ(38px)'];
export function Dice3D(){
return (<div className="cube-scene float-slow" aria-hidden><div className="cube">{FACES.map((f,i)=>(<div key={i} className="cube-face" style={{transform:POS[i]}}>{f}</div>))}</div></div>);
}
