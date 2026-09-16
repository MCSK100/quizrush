import type { Question, QuizConfig } from '../types';

// Offline backup pool — mirrors server/bank.js logic in a compact form.
// Used ONLY when the AI endpoint is unreachable / fails / returns invalid data,
// so a quiz can ALWAYS start. Category + difficulty + language are honored;
// other categories are NEVER injected (that was the "category ignored" bug).

let n = 0;
function mk(category: string, difficulty: Question['difficulty'], question: string, options: string[], correctAnswer: number, explanation: string, language = 'en'): Question {
  const opts = [...options];
  const ans = opts[correctAnswer];
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return { id: `bank-${Date.now()}-${n++}`, category, difficulty, question, options: opts, correctAnswer: opts.indexOf(ans), explanation, language };
}

type Row = [string, Question['difficulty'], string, [string, string, string, string], number, string];
// [category, difficulty, question, options, correctIdx, explanation]
const EN: Row[] = [
['mixed','easy','Which planet is known as the Red Planet?',['Mars','Venus','Jupiter','Mercury'],0,'Mars looks red due to iron oxide dust.'],
['mixed','easy','How many days are there in a leap year?',['366','365','364','367'],0,'Leap years add Feb 29.'],
['mixed','medium','Which ocean is the largest on Earth?',['Pacific','Atlantic','Indian','Arctic'],0,'The Pacific covers about a third of Earth.'],
['mixed','easy','How many legs does a spider have?',['8','6','10','4'],0,'Spiders are arachnids with 8 legs.'],
['mixed','hard','Which element has the chemical symbol Au?',['Gold','Silver','Argon','Aluminium'],0,'Au comes from Latin aurum.'],
['mixed','medium','Which instrument measures temperature?',['Thermometer','Barometer','Speedometer','Odometer'],0,'Thermo = heat.'],
['sports','easy','How many players does a cricket team field at a time?',['11','9','10','12'],0,'A cricket side has 11 players.'],
['sports','medium','The Olympics are held every how many years?',['4','2','5','3'],0,'Each games every 4 years.'],
['sports','hard','How many Grand Slam tennis tournaments are held each year?',['4','3','5','2'],0,'Australian, French, Wimbledon, US Open.'],
['sports','easy','How many rings are on the Olympic flag?',['5','4','6','7'],0,'Five rings for five continents.'],
['sports','medium','Which country won the first Cricket World Cup in 1975?',['West Indies','Australia','England','India'],0,'West Indies beat Australia in 1975.'],
['sports','easy','How long is a standard football match (regulation)?',['90 minutes','80 minutes','100 minutes','60 minutes'],0,'Two 45-minute halves.'],
['history','easy','Which monument in Agra was built by Shah Jahan?',['Taj Mahal','Red Fort','Qutub Minar','Gateway of India'],0,'It houses the tomb of Mumtaz Mahal.'],
['history','medium','In which year did India gain independence?',['1947','1950','1935','1962'],0,'15 August 1947.'],
['history','hard','The Chola dynasty was famous for ruling which region?',['South India','North India','Bengal','Kashmir'],0,'The Cholas ruled Tamilakam and beyond.'],
['history','easy','Who was the first Prime Minister of India?',['Jawaharlal Nehru','Sardar Patel','Rajendra Prasad','Lal Bahadur Shastri'],0,'Nehru took office in 1947.'],
['history','medium','The French Revolution began in which year?',['1789','1776','1804','1815'],0,'1789: fall of the Bastille.'],
['history','hard','Which empire built the Colosseum in Rome?',['Roman Empire','Ottoman Empire','Persian Empire','Mongol Empire'],0,'Built under Vespasian and Titus.'],
['science','easy','What is H2O commonly known as?',['Water','Salt','Oxygen','Hydrogen'],0,'Two hydrogen, one oxygen.'],
['science','medium','Which gas do plants absorb for photosynthesis?',['Carbon dioxide','Oxygen','Nitrogen','Helium'],0,'Plants take in CO2.'],
['science','hard','What force keeps planets in orbit around the Sun?',['Gravity','Magnetism','Friction','Tension'],0,'Gravity governs orbital motion.'],
['science','easy','How many bones are in the adult human body?',['206','196','216','186'],0,'Adults have 206 bones.'],
['science','medium','Which planet is closest to the Sun?',['Mercury','Venus','Earth','Mars'],0,'Mercury orbits closest.'],
['science','hard','What is the speed of light approximately?',['300,000 km/s','150,000 km/s','30,000 km/s','3,000,000 km/s'],0,'About 3 x 10^8 m/s.'],
['geography','easy','What is the capital of France?',['Paris','Rome','Madrid','Berlin'],0,'Paris is the capital.'],
['geography','medium','Which is the longest river in the world?',['Nile','Amazon','Ganges','Mississippi'],0,'The Nile runs about 6,650 km.'],
['geography','hard','Which desert is the largest hot desert on Earth?',['Sahara','Gobi','Thar','Kalahari'],0,'The Sahara spans North Africa.'],
['geography','easy','Which is the largest island in the world?',['Greenland','Madagascar','Borneo','Sumatra'],0,'Greenland is the largest island.'],
['geography','medium','Which is the smallest country in the world?',['Vatican City','Monaco','Maldives','Singapore'],0,'Vatican City is the smallest.'],
['tech','easy','What does CPU stand for?',['Central Processing Unit','Computer Personal Unit','Central Program Utility','Core Processing Utility'],0,'The CPU executes instructions.'],
['tech','medium','What does AI stand for?',['Artificial Intelligence','Automatic Internet','Advanced Interface','Applied Innovation'],0,'AI mimics intelligent behaviour.'],
['tech','hard','What does RAM stand for?',['Random Access Memory','Rapid Access Machine','Read And Modify','Run All Memory'],0,'RAM is short-term memory.'],
['tech','easy','Which key combination is commonly used to copy?',['Ctrl+C','Ctrl+V','Ctrl+X','Ctrl+Z'],0,'Ctrl+C copies, Ctrl+V pastes.'],
['tech','medium','What does USB stand for?',['Universal Serial Bus','United System Board','Ultra Speed Bandwidth','Unified Signal Base'],0,'Universal Serial Bus.'],
['movies','easy','Who directed the movie Titanic (1997)?',['James Cameron','Steven Spielberg','Christopher Nolan','Rajkumar Hirani'],0,'Cameron directed Titanic.'],
['movies','medium','RRR was directed by whom?',['S. S. Rajamouli','Mani Ratnam','Shankar','Lokesh Kanagaraj'],0,'Rajamouli directed RRR.'],
['movies','hard','Who played the Joker in The Dark Knight?',['Heath Ledger','Joaquin Phoenix','Jack Nicholson','Jared Leto'],0,'Ledger won a posthumous Oscar.'],
['movies','easy','Which superhero is known as the Dark Knight?',['Batman','Superman','Spider-Man','Iron Man'],0,'Batman is the Dark Knight.'],
['music','easy','How many strings does a standard guitar have?',['6','4','5','7'],0,'Standard guitars have 6 strings.'],
['music','medium','Which Indian maestro is known as the Mozart of Madras?',['A. R. Rahman','Ilaiyaraaja','M. S. Subbulakshmi','Zakir Hussain'],0,'Rahman earned that nickname early.'],
['music','hard','A grand piano typically has how many keys?',['88','76','96','64'],0,'52 white + 36 black = 88.'],
['music','easy','Which instrument has black and white keys?',['Piano','Guitar','Flute','Drums'],0,'Pianos have black and white keys.'],
['kids','easy','What colour do you get by mixing blue and yellow?',['Green','Orange','Purple','Brown'],0,'Blue + yellow = green.'],
['kids','easy','How many days are there in a week?',['7','5','6','8'],0,'Seven days in a week.'],
['kids','easy','Which animal says moo?',['Cow','Dog','Cat','Horse'],0,'Cows moo.'],
['kids','easy','What is 2 + 3?',['5','4','6','7'],0,'2 + 3 = 5.'],
['kids','medium','Which shape has three sides?',['Triangle','Square','Circle','Pentagon'],0,'Triangles have three sides.'],
['tamil','easy','What is the capital of Tamil Nadu?',['Chennai','Madurai','Coimbatore','Trichy'],0,'Chennai is the capital.'],
['tamil','medium','The Brihadeeswara Temple is located in which city?',['Thanjavur','Madurai','Kanchipuram','Chidambaram'],0,'Raja Raja Chola built it in Thanjavur.'],
['tamil','hard','Silappathikaram was written by whom?',['Ilango Adigal','Thiruvalluvar','Kambar','Avvaiyar'],0,'Ilango Adigal authored Silappathikaram.'],
['tamil','easy','Pongal is primarily a festival celebrating what?',['Harvest','New Year','Victory','Monsoon'],0,'Pongal thanks the Sun for the harvest.'],
['tamil','medium','Which river is called the lifeline of Tamil Nadu agriculture?',['Kaveri','Vaigai','Thamirabarani','Palar'],0,'The Kaveri waters the delta.'],
['gk','easy','Which is the national bird of India?',['Peacock','Parrot','Eagle','Swan'],0,'The peacock is Indias national bird.'],
['gk','medium','How many colours are there in a rainbow?',['7','6','8','5'],0,'Seven colours: VIBGYOR.'],
['gk','hard','Which is the smallest continent by land area?',['Australia','Europe','Antarctica','South America'],0,'Australia is the smallest continent.'],
['gk','easy','Which direction does the Sun rise from?',['East','West','North','South'],0,'The Sun rises in the east.'],
['maths','easy','What is 7 x 8?',['56','54','48','63'],0,'7 x 8 = 56.'],
['maths','medium','What is the square root of 144?',['12','14','11','16'],0,'12 x 12 = 144.'],
['maths','hard','What is 15% of 200?',['30','25','35','20'],0,'0.15 x 200 = 30.'],
['maths','easy','What is 100 - 47?',['53','52','57','43'],0,'100 - 47 = 53.'],
['literature','easy','Who wrote Romeo and Juliet?',['William Shakespeare','Charles Dickens','Jane Austen','Mark Twain'],0,'Shakespeare wrote the tragedy.'],
['literature','medium','Thirukkural was written by whom?',['Thiruvalluvar','Kambar','Bharathiyar','Avvaiyar'],0,'Thiruvalluvar authored the couplets.'],
['literature','hard','Who wrote the novel Ponniyin Selvan?',['Kalki Krishnamurthy','Sujatha','Jayakanthan','Pudhumaipithan'],0,'Kalki wrote the Chola epic.'],
['animals','easy','Which is the largest land animal?',['African Elephant','Giraffe','Hippo','Rhino'],0,'African elephants are the largest.'],
['animals','medium','A group of wolves is called what?',['Pack','Herd','Flock','School'],0,'Wolves travel in packs.'],
['animals','hard','Which bird cannot fly but swims well?',['Penguin','Ostrich','Kiwi','Emu'],0,'Penguins are flightless swimmers.'],
['animals','easy','How many legs does an insect have?',['6','8','4','10'],0,'Insects have six legs.'],
['space','easy','Which planet has prominent rings?',['Saturn','Mars','Venus','Mercury'],0,'Saturns rings are the most famous.'],
['space','medium','Who was the first person to walk on the Moon?',['Neil Armstrong','Buzz Aldrin','Yuri Gagarin','Michael Collins'],0,'Armstrong stepped out in 1969.'],
['space','hard','Which Indian mission reached Mars on its first attempt?',['Mangalyaan','Chandrayaan-1','Gaganyaan','Chandrayaan-2'],0,'Mangalyaan succeeded in 2014.'],
['space','easy','The Sun is primarily made of which gas?',['Hydrogen','Oxygen','Nitrogen','Carbon dioxide'],0,'The Sun is mostly hydrogen.'],
['gaming','easy','In chess, how does the knight move?',['L-shape','Diagonal','Straight','Two squares any way'],0,'Knights move in an L-shape.'],
['gaming','medium','Which company makes the PlayStation?',['Sony','Microsoft','Nintendo','Sega'],0,'Sony makes PlayStation.'],
['gaming','hard','How many squares are on a standard chessboard?',['64','72','48','81'],0,'An 8x8 board has 64 squares.'],
['gaming','easy','How many pieces does each chess player start with?',['16','12','20','8'],0,'Sixteen pieces per side.'],
['world','easy','Which country is famous for the Eiffel Tower?',['France','Italy','Spain','Germany'],0,'The Eiffel Tower is in Paris.'],
['world','medium','Sushi is a traditional dish from which country?',['Japan','China','Thailand','Korea'],0,'Sushi comes from Japan.'],
['world','hard','Which country has the largest population?',['India','China','USA','Indonesia'],0,'India passed China in 2023.'],
['world','easy','The Great Pyramid of Giza is in which country?',['Egypt','Mexico','Peru','Sudan'],0,'Giza is in Egypt.'],
['india','easy','Which is the national currency of India?',['Rupee','Dollar','Euro','Yen'],0,'The rupee (INR) is the currency.'],
['india','medium','Which city is known as the Pink City?',['Jaipur','Jodhpur','Udaipur','Agra'],0,'Jaipur is the Pink City.'],
['india','hard','Which is the longest river entirely within India?',['Ganga','Yamuna','Godavari','Narmada'],0,'The Ganga runs about 2,525 km.'],
['india','easy','How many players are on a kabaddi team on court?',['7','6','5','11'],0,'Seven players per side.'],
['japanese','easy','「ねこ」の意味は何ですか？ (What does “ねこ” mean?)',['Cat','Dog','Bird','Fish'],0,'ねこ (neko) means cat.'],
['japanese','easy','「みず」の意味は何ですか？ (What does “みず” mean?)',['Water','Fire','Rice','Milk'],0,'みず (mizu) means water.'],
['japanese','easy','「いぬ」の意味は何ですか？ (What does “いぬ” mean?)',['Dog','Cat','Horse','Cow'],0,'いぬ (inu) means dog.'],
['japanese','easy','「おはよう」の意味は何ですか？ (What does “おはよう” mean?)',['Good morning','Good night','Thank you','Goodbye'],0,'おはよう (ohayou) means good morning.'],
['japanese','easy','「ほん」の意味は何ですか？ (What does “ほん” mean?)',['Book','Pen','Desk','Bag'],0,'ほん (hon) means book.'],
];

const TA: Row[] = [
['mixed','easy','சிவப்பு கிரகம் என்று அழைக்கப்படுவது எது?',['செவ்வாய்','வெள்ளி','வியாழன்','புதன்'],0,'செவ்வாய் சிவப்பாகத் தெரிகிறது.'],
['mixed','easy','லீப் ஆண்டில் எத்தனை நாட்கள்?',['366','365','364','367'],0,'பிப்ரவரி 29 சேரும்.'],
['mixed','easy','சிலந்திக்கு எத்தனை கால்கள்?',['8','6','10','4'],0,'சிலந்திகளுக்கு 8 கால்கள்.'],
['sports','easy','கிரிக்கெட் அணியில் களமிறங்கும் வீரர்கள் எத்தனை?',['11','9','10','12'],0,'11 வீரர்கள்.'],
['history','medium','இந்தியா எந்த ஆண்டு சுதந்திரம் பெற்றது?',['1947','1950','1935','1962'],0,'15 ஆகஸ்ட் 1947.'],
['science','easy','H2O என்பது பொதுவாக எது?',['நீர்','உப்பு','ஆக்சிஜன்','ஹைட்ரஜன்'],0,'H2O என்பது நீர்.'],
['geography','easy','பிரான்ஸ் தலைநகரம் எது?',['பாரிஸ்','ரோம்','மாட்ரிட்','பெர்லின்'],0,'பாரிஸ் தலைநகரம்.'],
['tamil','easy','தமிழ்நாட்டின் தலைநகரம் எது?',['சென்னை','மதுரை','கோவை','திருச்சி'],0,'சென்னை தலைநகரம்.'],
['tamil','medium','தஞ்சை பெரிய கோவில் எந்த நகரில் உள்ளது?',['தஞ்சாவூர்','மதுரை','காஞ்சிபுரம்','சிதம்பரம்'],0,'ராஜராஜ சோழன் கட்டினார்.'],
['tamil','hard','சிலப்பதிகாரம் எழுதியவர் யார்?',['இளங்கோ அடிகள்','திருவள்ளுவர்','கம்பர்','ஔவையார்'],0,'இளங்கோ அடிகள்.'],
['gk','easy','இந்தியாவின் தேசியப் பறவை எது?',['மயில்','கிளி','கழுகு','அன்னம்'],0,'மயில் தேசியப் பறவை.'],
['maths','easy','7 × 8 எவ்வளவு?',['56','54','48','63'],0,'7 × 8 = 56.'],
['india','easy','இந்தியாவின் தேசிய நாணயம் எது?',['ரூபாய்','டாலர்','யூரோ','யென்'],0,'ரூபாய் நாணயம்.'],
['kids','easy','2 + 3 எவ்வளவு?',['5','4','6','7'],0,'2 + 3 = 5.'],
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function genMaths(k: number, diff: string): Question[] {
  const out: Question[] = [];
  let guard = 0;
  while (out.length < k && guard++ < k * 20 + 60) {
    const tier = diff === 'mixed' ? ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] : diff;
    const a = 2 + Math.floor(Math.random() * 200);
    const b = 2 + Math.floor(Math.random() * 200);
    if (tier === 'easy') out.push(mk('maths', 'easy', `What is ${a} + ${b}?`, [`${a + b}`, `${a + b + 1}`, `${a + b - 1}`, `${a + b + 2}`], 0, `${a} + ${b} = ${a + b}.`));
    else if (tier === 'medium') out.push(mk('maths', 'medium', `What is ${a} × ${Math.min(b, 19)}?`, [`${a * Math.min(b, 19)}`, `${a * Math.min(b, 19) + a}`, `${a * Math.min(b, 19) - a}`, `${a * Math.min(b, 19) + 10}`], 0, 'Multiply carefully.'));
    else out.push(mk('maths', 'hard', `What is ${a} × ${b}?`, [`${a * b}`, `${a * b + a}`, `${a * b - b}`, `${a * b + 100}`], 0, `${a} × ${b} = ${a * b}.`));
  }
  return out;
}

const COUNTRIES: [string, string][] = [
  ['India', 'New Delhi'], ['France', 'Paris'], ['Japan', 'Tokyo'], ['Brazil', 'Brasília'],
  ['Egypt', 'Cairo'], ['Canada', 'Ottawa'], ['Australia', 'Canberra'], ['Germany', 'Berlin'],
  ['Italy', 'Rome'], ['Spain', 'Madrid'], ['China', 'Beijing'], ['USA', 'Washington, D.C.'],
  ['UK', 'London'], ['South Korea', 'Seoul'], ['Thailand', 'Bangkok'], ['Greece', 'Athens'],
];
function genGeo(k: number): Question[] {
  const out: Question[] = [];
  let guard = 0;
  while (out.length < k && guard++ < k * 20 + 60) {
    const [name, cap] = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    const others = shuffle(COUNTRIES.map((c) => c[1]).filter((c) => c !== cap)).slice(0, 3);
    out.push(mk('geography', 'medium', `What is the capital of ${name}?`, [cap, ...others], 0, `${cap} is the capital of ${name}.`));
  }
  return out;
}

const ELEMENTS: [string, string][] = [
  ['Hydrogen', 'H'], ['Helium', 'He'], ['Carbon', 'C'], ['Oxygen', 'O'],
  ['Sodium', 'Na'], ['Iron', 'Fe'], ['Gold', 'Au'], ['Silver', 'Ag'],
];
function genScience(k: number): Question[] {
  const out: Question[] = [];
  let guard = 0;
  while (out.length < k && guard++ < k * 20 + 60) {
    const [name, sym] = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
    const others = shuffle(ELEMENTS.map((e) => e[1]).filter((s) => s !== sym)).slice(0, 3);
    out.push(mk('science', 'medium', `What is the chemical symbol for ${name}?`, [sym, ...others], 0, `${name} = ${sym}.`));
  }
  return out;
}

function toTF(q: Question, i: number): Question {
  const truth = i % 2 === 0;
  const isTa = q.language === 'ta';
  const stmt = truth ? `${q.question} — ${q.options[q.correctAnswer]}.` : `${q.question} — ${q.options[(q.correctAnswer + 1) % q.options.length]}.`;
  return { ...q, id: `${q.id}-tf${i}`, question: isTa ? `${stmt} சரியா தவறா?` : `${stmt} True or false?`, options: isTa ? ['சரி', 'தவறு'] : ['True', 'False'], correctAnswer: truth ? 0 : 1 };
}

export function getBackupQuestions(cfg: QuizConfig): Question[] {
  const cat = (cfg.category || 'mixed').toLowerCase();
  const want = Math.min(40, Math.max(3, Number(cfg.count) || 10));
  const diff = ['easy', 'medium', 'hard'].includes(String(cfg.difficulty)) ? String(cfg.difficulty) : 'mixed';
  const lang = cfg.language === 'ta' || cfg.language === 'both' ? cfg.language : 'en';
  const qtype = cfg.questionType || 'mcq';
  const label = cat === 'custom' ? 'mixed' : cat;

  const build = (rows: Row[], l: string): Question[] => {
    const match: Question[] = [];
    const rest: Question[] = [];
    for (const r of shuffle(rows)) {
      const own = r[0] === cat || cat === 'custom';
      const q = mk(own ? label : r[0], r[1], r[2], [...r[3]], r[4], r[5], l);
      (diff === 'mixed' || r[1] === diff ? match : rest).push(q);
    }
    return [...match, ...shuffle(rest)];
  };

  const enCat = EN.filter((r) => r[0] === cat);
  const enNeutral = EN.filter((r) => r[0] === 'mixed' || r[0] === 'gk');
  const taCat = TA.filter((r) => r[0] === cat);
  const taNeutral = TA.filter((r) => r[0] !== cat);

  let pool: Question[] = [];
  if (lang === 'en') {
    pool = [...build(enCat, 'en')];
    if (cat === 'maths') pool.push(...genMaths(want * 3, diff));
    if (cat === 'geography') pool.push(...genGeo(want * 3));
    if (cat === 'science') pool.push(...genScience(want * 3));
    if (pool.length < want * 2) pool.push(...build(enNeutral, 'en'));
  } else if (lang === 'ta') {
    pool = [...build(taCat, 'ta'), ...build(taNeutral, 'ta')];
    if (pool.length < want) pool.push(...build(enCat, 'en'));
    if (pool.length < want) pool.push(...build(enNeutral, 'en'));
  } else {
    const ta = [...build(taCat, 'ta'), ...build(taNeutral, 'ta')];
    const en = [...build(enCat, 'en')];
    const m = Math.max(ta.length, en.length);
    for (let i = 0; i < m; i++) {
      if (i < ta.length) pool.push(ta[i]);
      if (i < en.length) pool.push(en[i]);
    }
    if (pool.length < want) pool.push(...build(enNeutral, 'en'));
  }

  // Unique within quiz (first occurrence wins).
  const seen = new Set<string>();
  const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9\u0b80-\u0bff]+/g, ' ').trim();
  const unique = pool.filter((q) => {
    const k = `${q.category}|${key(q.question)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, want);

  if (qtype === 'tf') return unique.map(toTF);
  if (qtype === 'mixed') return unique.map((q, i) => (i % 2 === 1 ? toTF(q, i) : q));
  return unique;
}
