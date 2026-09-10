import type { Category } from '../types';
export const CATEGORIES: Category[] = [
{id:'sports',name:'Sports',slug:'sports',description:'Football, cricket, Olympics & more',icon:'Trophy',count:240},
{id:'history',name:'History',slug:'history',description:'Empires, wars & turning points',icon:'Landmark',count:210},
{id:'science',name:'Science',slug:'science',description:'Physics, chemistry, biology',icon:'FlaskConical',count:260},
{id:'geography',name:'Geography',slug:'geography',description:'Capitals, rivers & maps',icon:'Globe',count:190},
{id:'tech',name:'Technology',slug:'tech',description:'AI, computers & internet',icon:'Cpu',count:220},
{id:'movies',name:'Movies',slug:'movies',description:'Blockbusters & classics',icon:'Clapperboard',count:180},
{id:'music',name:'Music',slug:'music',description:'Pop, rock & legends',icon:'Music',count:150},
{id:'kids',name:'Kids',slug:'kids',description:'Fun & friendly for all ages',icon:'Smile',count:120},
{id:'tamil',name:'Tamil',slug:'tamil',description:'தமிழ் — மொழி, கலை, வரலாறு',icon:'Languages',count:140},
{id:'gk',name:'General Knowledge',slug:'gk',description:'A bit of everything',icon:'Brain',count:300},
{id:'maths',name:'Mathematics',slug:'maths',description:'Numbers, logic & speed',icon:'Sigma',count:160},
{id:'literature',name:'Literature',slug:'literature',description:'Books, poets & plays',icon:'BookOpen',count:130},
{id:'animals',name:'Animals',slug:'animals',description:'Wildlife & nature',icon:'PawPrint',count:140},
{id:'space',name:'Space',slug:'space',description:'Planets, stars & missions',icon:'Rocket',count:170},
{id:'gaming',name:'Gaming',slug:'gaming',description:'Esports & classics',icon:'Gamepad2',count:150},
{id:'world',name:'World',slug:'world',description:'Cultures, flags & food',icon:'Flag',count:180},
];
const dice = (seed: string) => `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundColor=ffd5dc,ffdfbf,c0aede,b6e3f4,d1d4f9`;
export const AVATARS = ['Aria','Leo','Zara','Milo','Nova','Kai','Luna','Felix','Ivy','Omar','Ruby','Theo','Amara','Jasper','Nia','Ravi'].map(dice);
