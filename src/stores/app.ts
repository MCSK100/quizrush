import { create } from 'zustand';
import type { Player, QuizConfig, Room } from '../types';
import { roomCode as genCode } from '../services/engine';
interface Settings{sound:boolean;setSound:(v:boolean)=>void}
export const useSettings=create<Settings>(s=>({sound:true,setSound:(sound)=>s({sound})}));
export function isBotId(id:string){return id.startsWith('bot')||id.startsWith('rbot-')}
export function withoutBots(room:Room):Room{
  if(!room.players.some(p=>isBotId(p.id)))return room;
  return {...room,players:room.players.filter(p=>!isBotId(p.id))};
}
const ROOM_KEY='qr-room';
function loadRoom():Room|null{
  try{
    if(typeof window==='undefined')return null;
    const r=JSON.parse(sessionStorage.getItem(ROOM_KEY)||'null');
    return r&&typeof r==='object'&&typeof r.code==='string'?r as Room:null;
  }catch{return null}
}
interface DemoRoom{room:Room|null;setRoom:(r:Room|null|((p:Room|null)=>Room|null))=>void}
export const useRoom=create<DemoRoom>(s=>({room:loadRoom(),setRoom:(room)=>s(prev=>{
  const next=typeof room==='function'?(room as (p:Room|null)=>Room|null)(prev.room):room;
  try{
    if(next)sessionStorage.setItem(ROOM_KEY,JSON.stringify(next));
    else sessionStorage.removeItem(ROOM_KEY);
  }catch{/* storage unavailable */}
  return {room:next};
})}));
export function newRoom(name:string,cfg:QuizConfig):Room{
const host:Player={id:'host-'+Date.now(),name,avatar:'👑',score:0,correct:0,streak:0,bestStreak:0,rank:1,ready:true,isHost:true,connected:true};
return {code:genCode(5),config:cfg,players:[host],hostId:host.id,status:'LOBBY'};
}
export function loadProfile(){try{return JSON.parse(localStorage.getItem('qr-profile')||'{}')}catch{return {}}}
export function saveProfile(p:object){localStorage.setItem('qr-profile',JSON.stringify(p))}
export function recordGame(score:number,correct:number,total:number,won:boolean,category:string){
const p=loadProfile() as {games?:number;wins?:number;totalScore?:number;totalCorrect?:number;totalQ?:number;bestStreak?:number;history?:number[];cats?:Record<string,number>};
const games=(p.games||0)+1;const history=[...(p.history||[]),score].slice(-20);
saveProfile({games,wins:(p.wins||0)+(won?1:0),totalScore:(p.totalScore||0)+score,totalCorrect:(p.totalCorrect||0)+correct,totalQ:(p.totalQ||0)+total,bestStreak:p.bestStreak||0,history,cats:{...(p.cats||{}),[category]:(p.cats?.[category]||0)+1}});
}
