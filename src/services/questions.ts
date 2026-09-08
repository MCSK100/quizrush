import type { Question, QuizConfig } from '../types';
import { SEED_QUESTIONS } from '../data/questions';
export function shuffle<T>(arr:T[]):T[]{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
export function validateQuestion(q:unknown):q is Question{
if(!q||typeof q!=='object')return false;const o=q as Record<string,unknown>;
if(typeof o.question!=='string'||!o.question.trim())return false;
if(!Array.isArray(o.options)||o.options.length!==4)return false;
if((o.options as unknown[]).some(x=>typeof x!=='string'||!(x as string).trim()))return false;
if(new Set((o.options as string[]).map(s=>s.trim().toLowerCase())).size!==4)return false;
if(typeof o.correctAnswer!=='number'||o.correctAnswer<0||o.correctAnswer>3)return false;
return true;
}
let n=0;
function fallbackQuestions(cfg:QuizConfig):Question[]{
let pool=SEED_QUESTIONS.filter(q=>cfg.category==='mixed'||cfg.category==='all'?true:q.category===cfg.category||(cfg.category==='gk'&&q.category==='gk'));
if(cfg.difficulty!=='mixed')pool=pool.filter(q=>q.difficulty===cfg.difficulty);
if(!pool.length)pool=[...SEED_QUESTIONS];
let out=shuffle(pool);
while(out.length<cfg.count){out=[...out,...shuffle(pool)]}
out=out.slice(0,cfg.count).map(q=>({...q,id:q.id+`#${n++}`}));
if(cfg.randomizeA!==false){out=out.map(q=>{const order=shuffle([0,1,2,3]);const opts=order.map(i=>q.options[i]) as [string,string,string,string];const correct=order.indexOf(q.correctAnswer);return {...q,options:opts,correctAnswer:correct}})}
return out;
}
function coerceIndex(v:unknown):number{
if(typeof v==='number'&&v>=0&&v<=3)return v;
if(typeof v==='number'&&v>=1&&v<=4)return v-1;
if(typeof v==='string'){const t=v.trim().toUpperCase();const li='ABCD'.indexOf(t);if(li>=0)return li;const num=parseInt(t,10);if(num>=1&&num<=4)return num-1}
return -1;
}
function normalize(raw:unknown,cat:string):Question|null{
if(!raw||typeof raw!=='object')return null;const o=raw as Record<string,unknown>;
const options=Array.isArray(o.options)?o.options.map(String):[];
if(options.length!==4)return null;
const correct=coerceIndex(o.correctAnswer ?? o.answer ?? o.correct);
if(correct<0)return null;
const diff=String(o.difficulty||'medium').toLowerCase();
return {id:`ai-${Date.now()}-${n++}`,category:cat,difficulty:(['easy','medium','hard'].includes(diff)?diff:'medium') as Question['difficulty'],
question:String(o.question||'').trim(),options:options as [string,string,string,string],correctAnswer:correct,
explanation:String(o.explanation||''),language:o.language?String(o.language):undefined};
}
export const GEMINI_KEY_STORE = 'qr-gemini-key';
export function storedGeminiKey(): string {
  try {
    return (localStorage.getItem(GEMINI_KEY_STORE) || '').trim();
  } catch {
    return '';
  }
}
export function geminiKeyActive(): boolean {
  const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;
  return Boolean((env.VITE_GEMINI_API_KEY || '').trim() || storedGeminiKey());
}
async function geminiQuestions(cfg:QuizConfig,key:string):Promise<Question[]|null>{
const ctrl=new AbortController();const t=setTimeout(()=>ctrl.abort(),20000);
try{
const catLabel=cfg.category==='mixed'?'mixed general knowledge':cfg.category;
const tamil=cfg.category==='tamil'?' Write questions AND options in Tamil (தமிழ்).':'';
const prompt=`Generate exactly ${cfg.count} ${cfg.difficulty==='mixed'?'mixed-difficulty':cfg.difficulty} multiple-choice quiz questions about ${catLabel}.${tamil} Return ONLY a JSON array, no markdown. Each item: {"question":string,"options":[exactly 4 distinct strings],"correctAnswer":0-3 index of the correct option,"explanation":one short sentence}. Rules: exactly 4 options, exactly 1 correct, no duplicates, family-friendly, factually correct.`;
const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,{
method:'POST',signal:ctrl.signal,headers:{'Content-Type':'application/json'},
body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:'application/json',temperature:0.9,maxOutputTokens:6000}})});
if(!res.ok)return null;
const data=await res.json();
const text=(data?.candidates?.[0]?.content?.parts||[]).map((p:{text?:string})=>p.text||'').join('');
if(!text.trim())return null;
let parsed:unknown;try{parsed=JSON.parse(text)}catch{const m=text.match(/\[[\s\S]*\]/);if(!m)return null;try{parsed=JSON.parse(m[0])}catch{return null}}
const arr=Array.isArray(parsed)?parsed:(parsed as {questions?:unknown[]}).questions;
if(!Array.isArray(arr))return null;
return arr.map(r=>normalize(r,cfg.category)).filter((q):q is Question=>!!q&&validateQuestion(q)).slice(0,cfg.count);
}catch{return null}finally{clearTimeout(t)}
}
export async function generateQuestions(cfg:QuizConfig):Promise<{questions:Question[];source:'ai'|'demo'}>{
const endpoint=(import.meta as unknown as {env:Record<string,string|undefined>}).env.VITE_AI_ENDPOINT;
if(endpoint){
try{
const ctrl=new AbortController();const t=setTimeout(()=>ctrl.abort(),20000);
const res=await fetch(endpoint,{method:'POST',signal:ctrl.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({category:cfg.category,count:cfg.count,difficulty:cfg.difficulty})});
clearTimeout(t);
if(res.ok){
const data=await res.json();
const arr=Array.isArray(data)?data:data.questions;
if(Array.isArray(arr)){
const out=arr.map((r:unknown)=>normalize(r,cfg.category)).filter((q):q is Question=>!!q&&validateQuestion(q)).slice(0,cfg.count);
if(out.length>=Math.min(3,cfg.count))return {questions:out,source:'ai'};
}
}
}catch{/* fall through to key/demos */}
}
const envKey = (import.meta as unknown as { env: Record<string, string | undefined> }).env.VITE_GEMINI_API_KEY;
const key = (envKey || '').trim() || storedGeminiKey();
if(key){
const ai=await geminiQuestions(cfg,key);
if(ai&&ai.length>=Math.min(3,cfg.count)){
let out=ai;
if(cfg.randomizeA!==false){out=out.map(q=>{const order=shuffle([0,1,2,3]);return {...q,options:order.map(i=>q.options[i]) as [string,string,string,string],correctAnswer:order.indexOf(q.correctAnswer)}})}
return {questions:out,source:'ai'};
}
}
await new Promise(r=>setTimeout(r,600));
return {questions:fallbackQuestions(cfg),source:'demo'};
}
