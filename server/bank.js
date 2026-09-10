// Offline fallback bank — used ONLY when all AI providers fail (or no keys set).
// Guarantees a room/solo game can always start. Shape matches normalize() output.
let n = 0;
function q(category, difficulty, question, options, correctAnswer, explanation) {
  return {
    id: `bank-${Date.now()}-${n++}`,
    category, difficulty, question, options, correctAnswer,
    explanation: explanation || '',
  };
}

// [category, difficulty, question, options[4], correctIdx, explanation]
const RAW = [
['mixed','easy','Which planet is known as the Red Planet?',['Mars','Venus','Jupiter','Mercury'],0,'Mars looks red due to iron oxide dust.'],
['mixed','easy','How many days are there in a leap year?',['366','365','364','367'],0,'Leap years add Feb 29.'],
['mixed','medium','Which ocean is the largest on Earth?',['Pacific','Atlantic','Indian','Arctic'],0,'The Pacific covers about a third of Earth.'],
['mixed','medium','Which instrument measures temperature?',['Thermometer','Barometer','Speedometer','Odometer'],0,'Thermo = heat.'],
['mixed','easy','How many legs does a spider have?',['8','6','10','4'],0,'Spiders are arachnids with 8 legs.'],
['mixed','hard','Which element has the chemical symbol Au?',['Gold','Silver','Argon','Aluminium'],0,'Au comes from Latin aurum.'],
['sports','easy','How many players does a cricket team field at a time?',['11','9','10','12'],0,'A cricket side has 11 players.'],
['sports','medium','In football, how many points is a win worth in most leagues?',['3','2','1','4'],0,'Three points for a win.'],
['sports','medium','The Olympics are held every how many years?',['4','2','5','3'],0,'Summer and Winter alternate every 2, each every 4.'],
['sports','hard','How many Grand Slam tennis tournaments are held each year?',['4','3','5','2'],0,'Australian, French, Wimbledon, US Open.'],
['sports','easy','In basketball, how many points is a free throw worth?',['1','2','3','4'],0,'One point per free throw.'],
['history','easy','Which monument in Agra was built by Shah Jahan?',['Taj Mahal','Red Fort','Qutub Minar','Gateway of India'],0,'It houses the tomb of Mumtaz Mahal.'],
['history','medium','In which year did India gain independence?',['1947','1950','1935','1962'],0,'15 August 1947.'],
['history','hard','The Chola dynasty was famous for ruling which region?',['South India','North India','Bengal','Kashmir'],0,'The Cholas ruled Tamilakam and beyond.'],
['history','medium','Who was the first President of India?',['Rajendra Prasad','Jawaharlal Nehru','Sardar Patel','S. Radhakrishnan'],0,'Rajendra Prasad took office in 1950.'],
['history','easy','The Great Wall is located in which country?',['China','Japan','Egypt','Greece'],0,'It stretches across northern China.'],
['science','easy','What is H2O commonly known as?',['Water','Salt','Oxygen','Hydrogen'],0,'Two hydrogen, one oxygen.'],
['science','medium','Which gas do plants absorb for photosynthesis?',['Carbon dioxide','Oxygen','Nitrogen','Helium'],0,'Plants take in CO2 and release oxygen.'],
['science','hard','What force keeps planets in orbit around the Sun?',['Gravity','Magnetism','Friction','Tension'],0,'Gravity governs orbital motion.'],
['science','easy','How many bones are in the adult human body?',['206','196','216','186'],0,'Adults have 206 bones.'],
['science','medium','Which planet is closest to the Sun?',['Mercury','Venus','Earth','Mars'],0,'Mercury orbits fastest and closest.'],
['geography','easy','What is the capital of France?',['Paris','Rome','Madrid','Berlin'],0,'Paris is the capital.'],
['geography','medium','Which is the longest river in the world?',['Nile','Amazon','Ganges','Mississippi'],0,'The Nile runs about 6,650 km.'],
['geography','medium','Mount Everest lies on the border of Nepal and which region?',['Tibet','Bhutan','Sikkim','Ladakh'],0,'Everest sits on the Nepal–Tibet border.'],
['geography','hard','Which desert is the largest hot desert on Earth?',['Sahara','Gobi','Thar','Kalahari'],0,'The Sahara spans North Africa.'],
['geography','easy','Which continent is Australia part of for most quizzes?',['Oceania','Asia','Europe','Africa'],0,'Australia sits in Oceania.'],
['tech','easy','What does CPU stand for?',['Central Processing Unit','Computer Personal Unit','Central Program Utility','Core Processing Utility'],0,'The CPU executes instructions.'],
['tech','medium','Which company created the Android operating system?',['Google','Apple','Microsoft','Samsung'],0,'Google acquired Android in 2005.'],
['tech','hard','What does RAM stand for?',['Random Access Memory','Rapid Access Machine','Read And Modify','Run All Memory'],0,'RAM is short-term working memory.'],
['tech','easy','Which key combination is commonly used to copy?',['Ctrl+C','Ctrl+V','Ctrl+X','Ctrl+Z'],0,'Ctrl+C copies, Ctrl+V pastes.'],
['tech','medium','What does AI stand for?',['Artificial Intelligence','Automatic Internet','Advanced Interface','Applied Innovation'],0,'AI mimics intelligent behaviour.'],
['movies','easy','Who directed the movie Titanic (1997)?',['James Cameron','Steven Spielberg','Christopher Nolan','Rajkumar Hirani'],0,'Cameron directed Titanic.'],
['movies','medium','Which film won the Oscar for Best Picture in 2020 (for 2019)?',['Parasite','1917','Joker','Avengers: Endgame'],0,'Parasite made history for Korea.'],
['movies','hard','Which actor played Jack in Titanic?',['Leonardo DiCaprio','Brad Pitt','Tom Cruise','Matt Damon'],0,'DiCaprio played Jack Dawson.'],
['movies','medium','RRR was directed by whom?',['S. S. Rajamouli','Mani Ratnam','Shankar','Lokesh Kanagaraj'],0,'Rajamouli directed RRR.'],
['movies','easy','Which superhero is known as the Dark Knight?',['Batman','Superman','Spider-Man','Iron Man'],0,'Batman is the Dark Knight.'],
['music','easy','How many strings does a standard guitar have?',['6','4','5','7'],0,'Standard guitars have 6 strings.'],
['music','medium','Which Indian maestro is known as the Mozart of Madras?',['A. R. Rahman','Ilaiyaraaja','M. S. Subbulakshmi','Zakir Hussain'],0,'Rahman earned that nickname early.'],
['music','hard','A grand piano typically has how many keys?',['88','76','96','64'],0,'52 white + 36 black = 88.'],
['music','easy','Which band performed the song Hey Jude?',['The Beatles','Queen','Coldplay','ABBA'],0,'Hey Jude is a Beatles classic.'],
['music','medium','How many beats are in a whole note in 4/4 time?',['4','2','1','8'],0,'A semibreve lasts four beats.'],
['kids','easy','What colour do you get by mixing blue and yellow?',['Green','Orange','Purple','Brown'],0,'Blue + yellow = green.'],
['kids','easy','How many days are there in a week?',['7','5','6','8'],0,'Seven days in a week.'],
['kids','easy','Which animal says moo?',['Cow','Dog','Cat','Horse'],0,'Cows moo.'],
['kids','easy','What is 2 + 3?',['5','4','6','7'],0,'2 + 3 = 5.'],
['kids','medium','Which shape has three sides?',['Triangle','Square','Circle','Pentagon'],0,'Triangles have three sides.'],
['tamil','easy','What is the capital of Tamil Nadu?',['Chennai','Madurai','Coimbatore','Trichy'],0,'Chennai is the capital.'],
['tamil','medium','Which festival is known as the festival of lights in Tamil Nadu?',['Deepavali','Pongal','Navratri','Holi'],0,'Deepavali is the festival of lights.'],
['tamil','medium','The Brihadeeswara Temple is located in which city?',['Thanjavur','Madurai','Kanchipuram','Chidambaram'],0,'Raja Raja Chola built it in Thanjavur.'],
['tamil','hard','Silappathikaram was written by whom?',['Ilango Adigal','Thiruvalluvar','Kambar','Avvaiyar'],0,'Ilango Adigal authored Silappathikaram.'],
['tamil','easy','Pongal is primarily a festival celebrating what?',['Harvest','New Year','Victory','Monsoon'],0,'Pongal thanks the Sun for the harvest.'],
['gk','easy','Which is the national bird of India?',['Peacock','Parrot','Eagle','Swan'],0,'The peacock is Indias national bird.'],
['gk','medium','How many states are there in India (as of 2024)?',['28','29','27','30'],0,'India has 28 states.'],
['gk','hard','Which is the smallest continent by land area?',['Australia','Europe','Antarctica','South America'],0,'Australia is the smallest continent.'],
['gk','easy','Which direction does the Sun rise from?',['East','West','North','South'],0,'The Sun rises in the east.'],
['gk','medium','How many colours are there in a rainbow?',['7','6','8','5'],0,'Seven colours: VIBGYOR.'],
['maths','easy','What is 7 × 8?',['56','54','48','63'],0,'7 × 8 = 56.'],
['maths','medium','What is the square root of 144?',['12','14','11','16'],0,'12 × 12 = 144.'],
['maths','hard','What is 15% of 200?',['30','25','35','20'],0,'0.15 × 200 = 30.'],
['maths','easy','What is 100 − 47?',['53','52','57','43'],0,'100 − 47 = 53.'],
['maths','medium','Next prime after 7 is what?',['11','9','10','13'],0,'11 is the next prime after 7.'],
['literature','easy','Who wrote Romeo and Juliet?',['William Shakespeare','Charles Dickens','Jane Austen','Mark Twain'],0,'Shakespeare wrote the tragedy.'],
['literature','medium','Thirukkural was written by whom?',['Thiruvalluvar','Kambar','Bharathiyar','Avvaiyar'],0,'Thiruvalluvar authored the couplets.'],
['literature','hard','Who wrote the novel Ponniyin Selvan?',['Kalki Krishnamurthy','Sujatha','Jayakanthan','Pudhumaipithan'],0,'Kalki wrote the Chola epic.'],
['literature','easy','Which book features Harry Potter?',['Harry Potter and the Philosophers Stone','The Hobbit','Matilda','The BFG'],0,'It is the first Harry Potter book.'],
['literature','medium','Who wrote Gitanjali?',['Rabindranath Tagore','Sarojini Naidu','Premchand','Bankim Chandra'],0,'Tagore won the Nobel for Gitanjali.'],
['animals','easy','Which is the largest land animal?',['African Elephant','Giraffe','Hippo','Rhino'],0,'African elephants are the largest.'],
['animals','medium','A group of wolves is called what?',['Pack','Herd','Flock','School'],0,'Wolves travel in packs.'],
['animals','hard','Which bird cannot fly but swims well?',['Penguin','Ostrich','Kiwi','Emu'],0,'Penguins are flightless swimmers.'],
['animals','easy','How many legs does an insect have?',['6','8','4','10'],0,'Insects have six legs.'],
['animals','medium','Which animal is known as the ship of the desert?',['Camel','Horse','Donkey','Elephant'],0,'Camels cross deserts with ease.'],
['space','easy','Which planet has prominent rings?',['Saturn','Mars','Venus','Mercury'],0,'Saturns rings are the most famous.'],
['space','medium','Who was the first person to walk on the Moon?',['Neil Armstrong','Buzz Aldrin','Yuri Gagarin','Michael Collins'],0,'Armstrong stepped out in 1969.'],
['space','hard','Which Indian mission reached Mars on its first attempt?',['Mangalyaan','Chandrayaan-1','Gaganyaan','Chandrayaan-2'],0,'Mangalyaan succeeded in 2014.'],
['space','easy','The Sun is primarily made of which gas?',['Hydrogen','Oxygen','Nitrogen','Carbon dioxide'],0,'The Sun is mostly hydrogen.'],
['space','medium','Which planet is known as Earths twin?',['Venus','Mars','Jupiter','Mercury'],0,'Venus matches Earth in size.'],
['gaming','easy','In chess, how does the knight move?',['L-shape','Diagonal','Straight','Two squares any way'],0,'Knights move in an L-shape.'],
['gaming','medium','Which game features a character named Mario?',['Super Mario Bros','Sonic','Pac-Man','Tetris'],0,'Mario debuted with Nintendo.'],
['gaming','hard','How many squares are on a standard chessboard?',['64','72','48','81'],0,'An 8×8 board has 64 squares.'],
['gaming','easy','Which of these is a battle-royale game?',['Free Fire','Chess','Carrom','Ludo'],0,'Free Fire is battle-royale.'],
['gaming','medium','What does NPC stand for in games?',['Non-Playable Character','New Player Challenge','Next Play_checkpoint','No Play Control'],0,'NPCs are computer-controlled.'],
['world','easy','Which country is famous for the Eiffel Tower?',['France','Italy','Spain','Germany'],0,'The Eiffel Tower is in Paris.'],
['world','medium','Sushi is a traditional dish from which country?',['Japan','China','Thailand','Korea'],0,'Sushi comes from Japan.'],
['world','hard','Which country has the largest population?',['India','China','USA','Indonesia'],0,'India passed China in 2023.'],
['world','easy','The Great Pyramid of Giza is in which country?',['Egypt','Mexico','Peru','Sudan'],0,'Giza is in Egypt.'],
['world','medium','Which festival is celebrated in Brazil with parades?',['Carnival','Diwali','Oktoberfest','Songkran'],0,'Rio Carnival is world-famous.'],
['india','easy','Which is the national currency of India?',['Rupee','Dollar','Euro','Yen'],0,'The rupee (INR) is the currency.'],
['india','medium','Which city is known as the Pink City?',['Jaipur','Jodhpur','Udaipur','Agra'],0,'Jaipur is the Pink City.'],
['india','hard','Which is the longest river entirely within India?',['Ganga','Yamuna','Godavari','Narmada'],0,'The Ganga runs about 2,525 km.'],
['india','easy','How many players are on a kabaddi team on court?',['7','6','5','11'],0,'Seven players per side.'],
['india','medium','Which monument is in Delhi and was a Mughal residence?',['Red Fort','Taj Mahal','Charminar','Mysore Palace'],0,'Delhis Red Fort housed Mughal emperors.'],
];

// Supplemental static pool — extends coverage so 20–40 question games stay on-topic.
const RAW2 = [
['sports','medium','Which country won the first Cricket World Cup in 1975?',['West Indies','Australia','England','India'],0,'West Indies beat Australia in 1975.'],
['sports','easy','How many rings are on the Olympic flag?',['5','4','6','7'],0,'Five rings for five continents.'],
['sports','hard','In tennis, a score of zero is called what?',['Love','Duck','Nil','Blank'],0,'Love means zero in tennis.'],
['sports','medium','Which Indian cricketer is known as the Master Blaster?',['Sachin Tendulkar','Virat Kohli','MS Dhoni','Rahul Dravid'],0,'Tendulkar earned that title.'],
['sports','easy','How long is a standard football match (regulation)?',['90 minutes','80 minutes','100 minutes','60 minutes'],0,'Two 45-minute halves.'],
['sports','medium','In which sport is the term checkmate used?',['Chess','Carrom','Boxing','Swimming'],0,'Checkmate ends a chess game.'],
['history','medium','The Mauryan emperor Ashoka ruled in which century BCE?',['3rd','5th','2nd','6th'],0,'Ashoka ruled circa 268–232 BCE.'],
['history','hard','Which empire built the Colosseum in Rome?',['Roman Empire','Ottoman Empire','Persian Empire','Mongol Empire'],0,'Built under Vespasian and Titus.'],
['history','easy','Who was the first Prime Minister of India?',['Jawaharlal Nehru','Sardar Patel','Rajendra Prasad','Lal Bahadur Shastri'],0,'Nehru took office in 1947.'],
['history','medium','The French Revolution began in which year?',['1789','1776','1804','1815'],0,'1789: fall of the Bastille.'],
['history','hard','Vijayanagara Empires capital Hampi is in which state?',['Karnataka','Tamil Nadu','Andhra Pradesh','Kerala'],0,'Hampi lies in Karnataka.'],
['history','easy','Which ship famously sank in 1912?',['Titanic','Queen Mary','Mayflower','Bismarck'],0,'Titanic sank in April 1912.'],
['india','medium','Which river flows through Delhi?',['Yamuna','Ganga','Saraswati','Chambal'],0,'The Yamuna flows past Delhi.'],
['india','hard','How many union territories does India have (as of 2024)?',['8','7','9','6'],0,'India has 8 union territories.'],
['india','easy','Which festival marks the harvest in Punjab?',['Baisakhi','Diwali','Holi','Eid'],0,'Baisakhi celebrates the harvest.'],
['india','medium','The Gateway of India is in which city?',['Mumbai','Chennai','Kolkata','Delhi'],0,'It stands in Mumbai harbour.'],
['india','hard','Who composed Indias national anthem?',['Rabindranath Tagore','Bankim Chandra','Subhas Bose','Sarojini Naidu'],0,'Tagore wrote Jana Gana Mana.'],
['india','easy','Which animal is Indias national animal?',['Bengal Tiger','Lion','Elephant','Leopard'],0,'The Bengal tiger is the national animal.'],
['tamil','medium','Which river is called the lifeline of Tamil Nadu agriculture?',['Kaveri','Vaigai','Thamirabarani','Palar'],0,'The Kaveri waters the delta.'],
['tamil','hard','Which Tamil poet wrote Thiruvasagam?',['Manickavasagar','Thiruvalluvar','Kambar','Bharathiyar'],0,'Manickavasagar composed it.'],
['tamil','easy','Madurai is famous for which temple?',['Meenakshi Temple','Brihadeeswara Temple','Ramanathaswamy Temple','Kapaleeshwarar Temple'],0,'Meenakshi Temple is in Madurai.'],
['tamil','medium','Jallikattu is traditionally held during which festival?',['Pongal','Deepavali','Thaipusam','Aadi Perukku'],0,'Jallikattu runs at Pongal time.'],
['tamil','hard','The Chola bronze Nataraja depicts which god?',['Shiva','Vishnu','Murugan','Ganesha'],0,'Nataraja is Shiva as dancer.'],
['tamil','medium','Which city is known as the textile city of Tamil Nadu?',['Coimbatore','Salem','Erode','Tiruppur'],0,'Coimbatore leads in textiles.'],
['tamil','easy','How many letters are in the Tamil alphabet (uyir+mei+uyirmei)?',['247','216','264','196'],0,'12 + 18 + 216 + 1 = 247.'],
['tamil','hard','Thanjavur painting originated under which dynasty?',['Maratha','Chola','Pandya','Pallava'],0,'It flourished under Thanjavur Marathas.'],
['geography','medium','Which is the smallest country in the world?',['Vatican City','Monaco','Maldives','Singapore'],0,'Vatican City is the smallest.'],
['geography','hard','Through which country does the equator NOT pass?',['India','Brazil','Kenya','Indonesia'],0,'The equator misses India.'],
['geography','easy','Which is the largest island in the world?',['Greenland','Madagascar','Borneo','Sumatra'],0,'Greenland is the largest island.'],
['geography','medium','The Danube river flows into which sea?',['Black Sea','Mediterranean Sea','North Sea','Caspian Sea'],0,'The Danube ends in the Black Sea.'],
['science','medium','What is the boiling point of water at sea level?',['100°C','90°C','110°C','120°C'],0,'Water boils at 100°C.'],
['science','easy','Which part of the cell contains DNA?',['Nucleus','Ribosome','Membrane','Vacuole'],0,'DNA sits in the nucleus.'],
['science','hard','What is the speed of light approximately?',['300,000 km/s','150,000 km/s','30,000 km/s','3,000,000 km/s'],0,'About 3 × 10^8 m/s.'],
['science','medium','Which vitamin is made by sunlight on skin?',['Vitamin D','Vitamin C','Vitamin A','Vitamin B12'],0,'Sunlight triggers vitamin D.'],
['science','easy','How many planets are in our solar system?',['8','7','9','10'],0,'Eight since Pluto was reclassified.'],
['science','hard','Which blood cells carry oxygen?',['Red blood cells','White blood cells','Platelets','Plasma cells'],0,'Red cells carry haemoglobin.'],
['gk','medium','Which is the largest democracy in the world?',['India','USA','Indonesia','Brazil'],0,'India is the largest democracy.'],
['gk','easy','How many senses do humans traditionally have?',['5','4','6','7'],0,'Sight, hearing, smell, taste, touch.'],
['gk','hard','Which year did humans first land on the Moon?',['1969','1972','1965','1975'],0,'Apollo 11 landed in 1969.'],
['gk','medium','Which is the fastest land animal?',['Cheetah','Lion','Horse','Greyhound'],0,'Cheetahs reach ~110 km/h.'],
['gk','easy','What do bees make?',['Honey','Silk','Wax paper','Nectar cups'],0,'Bees make honey.'],
['gk','hard','Which language has the most native speakers?',['Mandarin Chinese','English','Hindi','Spanish'],0,'Mandarin leads natively.'],
['world','medium','The Opera House is a landmark of which city?',['Sydney','London','Vienna','New York'],0,'Sydney Opera House, Australia.'],
['world','hard','Which country invented paper?',['China','Egypt','Greece','India'],0,'Paper was invented in China.'],
['world','easy','Which country is home to kangaroos?',['Australia','New Zealand','South Africa','Brazil'],0,'Kangaroos are Australian.'],
['world','medium','Oktoberfest is celebrated in which country?',['Germany','France','Belgium','Austria'],0,'Oktoberfest began in Munich.'],
['world','hard','Which is the only continent without a desert?',['Europe','Asia','Africa','Australia'],0,'Europe has no true desert.'],
['movies','medium','Which movie features the song Naatu Naatu?',['RRR','Baahubali','Pushpa','KGF'],0,'Naatu Naatu won an Oscar.'],
['movies','hard','Who played the Joker in The Dark Knight?',['Heath Ledger','Joaquin Phoenix','Jack Nicholson','Jared Leto'],0,'Ledger won a posthumous Oscar.'],
['movies','easy','Sholay was released in which decade?',['1970s','1980s','1960s','1990s'],0,'Sholay released in 1975.'],
['movies','medium','Which animated film features Elsa?',['Frozen','Moana','Tangled','Brave'],0,'Elsa is in Frozen.'],
['music','medium','The veena is an instrument from which country?',['India','Greece','Egypt','Spain'],0,'The veena is Indian classical.'],
['music','hard','How many symphonies did Beethoven compose?',['9','5','7','12'],0,'Beethoven wrote nine symphonies.'],
['music','easy','Which instrument has black and white keys?',['Piano','Guitar','Flute','Drums'],0,'Pianos have black and white keys.'],
['gaming','medium','Which company makes the PlayStation?',['Sony','Microsoft','Nintendo','Sega'],0,'Sony makes PlayStation.'],
['gaming','hard','Minecraft was originally created by whom?',['Markus Persson','Gabe Newell','Shigeru Miyamoto','Tim Sweeney'],0,'Notch (Persson) created it.'],
['gaming','easy','How many pieces does each chess player start with?',['16','12','20','8'],0,'Sixteen pieces per side.'],
['gaming','medium','PUBG stands for PlayerUnknowns what?',['Battlegrounds','BattleGround','Battleground','BattlesGround'],0,'PlayerUnknowns Battlegrounds.'],
['literature','medium','Who wrote The Jungle Book?',['Rudyard Kipling','Enid Blyton','Roald Dahl','Ruskin Bond'],0,'Kipling wrote Mowglis tales.'],
['literature','hard','Malgudi Days was created by whom?',['R. K. Narayan','Mulk Raj Anand','Khushwant Singh','Ruskin Bond'],0,'Narayan invented Malgudi.'],
['literature','easy','Who wrote Cinderella (famous version)?',['Charles Perrault','Hans Andersen','Grimm Brothers','Aesop'],0,'Perraults 1697 version is famous.'],
['animals','medium','How long is an elephants pregnancy (approx)?',['22 months','9 months','12 months','18 months'],0,'About 22 months, longest of land animals.'],
['animals','hard','A group of crows is called what?',['Murder','Flock','Pack','Herd'],0,'A group of crows: a murder.'],
['animals','easy','Which animal carries its baby in a pouch?',['Kangaroo','Cow','Horse','Goat'],0,'Kangaroos are marsupials.'],
['animals','medium','Which is the tallest bird?',['Ostrich','Emu','Penguin','Flamingo'],0,'Ostriches are the tallest birds.'],
['space','medium','How long does Earth take to orbit the Sun?',['1 year','1 day','1 month','6 months'],0,'About 365.25 days.'],
['space','hard','Which planet has the most moons (2024 count)?',['Saturn','Jupiter','Uranus','Neptune'],0,'Saturn passed 140 known moons.'],
['space','easy','What is the name of our galaxy?',['Milky Way','Andromeda','Triangulum','Whirlpool'],0,'We live in the Milky Way.'],
['space','medium','Which was Indias first satellite?',['Aryabhata','Rohini','Bhaskara','INSAT-1A'],0,'Aryabhata launched in 1975.'],
['kids','easy','What colour is a banana?',['Yellow','Red','Blue','Purple'],0,'Bananas are yellow.'],
['kids','medium','How many wheels does a car usually have?',['4','3','6','2'],0,'Cars usually have 4 wheels.'],
['kids','easy','Which animal gives us milk?',['Cow','Tiger','Lion','Bear'],0,'Cows give milk.'],
['tech','medium','What does USB stand for?',['Universal Serial Bus','United System Board','Ultra Speed Bandwidth','Unified Signal Base'],0,'Universal Serial Bus.'],
['tech','hard','Which year was the World Wide Web made public?',['1991','1989','1995','1983'],0,'Tim Berners-Lee opened it in 1991.'],
['tech','easy','What is the full form of Wi-Fi?',['Wireless Fidelity','Wide Fiber','Wired Fire','Wave Finder'],0,'Wireless Fidelity (common expansion).'],
['tech','medium','Which storage is fastest for apps?',['SSD','HDD','CD','Floppy'],0,'SSDs beat spinning disks.'],
];

const ALL_RAW = [...RAW, ...RAW2];

function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function shuffleInPlace(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- seeded RNG for generative pools ---------- */
let genSeed = (Date.now() % 2147483646) + 1;
function rnd() {
  genSeed |= 0; genSeed = (genSeed + 0x6D2B79F5) | 0;
  let t = Math.imul(genSeed ^ (genSeed >>> 15), 1 | genSeed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }

function mkQ(category, difficulty, question, correct, distractors, explanation) {
  const set = new Set([String(correct)]);
  const rest = [];
  for (const d of [...distractors].sort(() => rnd() - 0.5)) {
    const s = String(d);
    if (!set.has(s) && rest.length < 3) { set.add(s); rest.push(s); }
  }
  let nudge = 1;
  while (rest.length < 3) {
    for (const s of [String(Number(correct) + nudge), String(Number(correct) - nudge), `${correct} ?`]) {
      if (!set.has(s) && rest.length < 3) { set.add(s); rest.push(s); }
    }
    nudge++;
  }
  const options = shuffle([String(correct), ...rest]);
  return q(category, difficulty, question, options, options.indexOf(String(correct)), explanation);
}

/* ---------- generative maths: effectively unlimited unique questions ---------- */
function genMaths(k, difficulty = 'mixed') {
  const out = [];
  let guard = 0;
  while (out.length < k && guard++ < k * 30 + 100) {
    const tier = difficulty === 'mixed' ? ['easy', 'medium', 'hard'][ri(0, 2)] : difficulty;
    const kind = rnd();
    let item = null;
    if (tier === 'easy') {
      if (kind < 0.4) { const a = ri(2, 999); const b = ri(2, 999); item = ['easy', `What is ${a} + ${b}?`, a + b, [a + b + 1, a + b - 1, a + b + 10, a + b + 2, a + b - 10], `${a} + ${b} = ${a + b}.`]; }
      else if (kind < 0.7) { const a = ri(10, 999); const b = ri(2, a - 1); item = ['easy', `What is ${a} − ${b}?`, a - b, [a - b + 1, a - b - 1, a - b + 10, a - b + 2], `${a} − ${b} = ${a - b}.`]; }
      else { const a = ri(2, 99); const b = ri(2, 12); item = ['easy', `What is ${a} × ${b}?`, a * b, [a * b + a, a * b - b, a * b + 2, a * b + 10, a * b - 2], `${a} × ${b} = ${a * b}.`]; }
    } else if (tier === 'medium') {
      if (kind < 0.25) { const a = ri(12, 199); const b = ri(3, 19); item = ['medium', `What is ${a} × ${b}?`, a * b, [a * b + a, a * b - b, a * b + 10, a * b + 100], `${a} × ${b} = ${a * b}.`]; }
      else if (kind < 0.45) { const a = ri(13, 199); item = ['medium', `What is ${a}²?`, a * a, [a * a + a, a * a - a, (a + 1) * (a + 1), a * a + 10], `${a} × ${a} = ${a * a}.`]; }
      else if (kind < 0.65) { const base = ri(2, 50) * 20; const p = [5, 10, 15, 20, 25, 50][ri(0, 5)]; const ans = (base * p) / 100; item = ['medium', `What is ${p}% of ${base}?`, ans, [ans + 5, ans - 5, ans + 10, ans * 2, ans + 1], `${p}% of ${base} = ${ans}.`]; }
      else if (kind < 0.85) { const b = ri(2, 99); const c = b + ri(2, 199); item = ['medium', `What number added to ${b} gives ${c}?`, c - b, [c - b + 1, c - b - 1, c - b + 10, c], `${c} − ${b} = ${c - b}.`]; }
      else { const a = ri(2, 12); const b = ri(2, 12); const c = ri(2, 20); const ans = a + b * c; item = ['medium', `What is ${a} + ${b} × ${c}?`, ans, [a + b + c, (a + b) * c, ans + c, ans + 2], `Multiply first: ${b} × ${c} = ${b * c}, then + ${a} = ${ans}.`]; }
    } else {
      if (kind < 0.25) { const a = ri(11, 99); const b = ri(11, 49); item = ['hard', `What is ${a} × ${b}?`, a * b, [a * b + a, a * b - b, a * b + 100, a * b + 10], `${a} × ${b} = ${a * b}.`]; }
      else if (kind < 0.45) { const a = ri(4, 40); const ans = a * a * a; item = ['hard', `What is ${a}³?`, ans, [a * a, ans + a, ans - a, (a + 1) ** 3], `${a}³ = ${ans}.`]; }
      else if (kind < 0.65) { const s = ri(2, 199); const d = ri(2, 49); const t4 = s + d * 3; item = ['hard', `Next number: ${s}, ${s + d}, ${s + d * 2}, ${t4}, …?`, t4 + d, [t4 + 1, t4 + d + 1, t4 - d, t4 + 2 * d], `Arithmetic sequence, step ${d}.`]; }
      else if (kind < 0.85) { const a = ri(2, 30); const b = ri(2, 30); const g = gcd(a, b); const l = (a * b) / g; item = ['hard', `What is the LCM of ${a} and ${b}?`, l, [a * b, Math.max(a, b), l + a, l + b], `LCM(${a}, ${b}) = ${l}.`]; }
      else { const a = ri(11, 199); const d = ri(1, 49); const b = a + 2 * d; const avg = a + d; item = ['hard', `What is the average of ${a} and ${b}?`, avg, [avg + 1, avg - 1, a + b, avg + 5], `(${a} + ${b}) ÷ 2 = ${avg}.`]; }
    }
    if (item) out.push(mkQ('maths', item[0], item[1], item[2], item[3], item[4]));
  }
  return out;
}
function gcd(a, b) { return b ? gcd(b, a % b) : a; }

/* ---------- generative geography: country × template combos ---------- */
const COUNTRIES = [
['India','New Delhi','Asia'],['France','Paris','Europe'],['Japan','Tokyo','Asia'],['Brazil','Brasília','South America'],
['Egypt','Cairo','Africa'],['Canada','Ottawa','North America'],['Australia','Canberra','Oceania'],['Germany','Berlin','Europe'],
['Italy','Rome','Europe'],['Spain','Madrid','Europe'],['China','Beijing','Asia'],['Russia','Moscow','Europe'],
['South Africa','Pretoria','Africa'],['Mexico','Mexico City','North America'],['Argentina','Buenos Aires','South America'],
['United Kingdom','London','Europe'],['South Korea','Seoul','Asia'],['Thailand','Bangkok','Asia'],['Turkey','Ankara','Asia'],
['Greece','Athens','Europe'],['Portugal','Lisbon','Europe'],['Netherlands','Amsterdam','Europe'],['Sweden','Stockholm','Europe'],
['Norway','Oslo','Europe'],['Finland','Helsinki','Europe'],['Poland','Warsaw','Europe'],['Ukraine','Kyiv','Europe'],
['Saudi Arabia','Riyadh','Asia'],['UAE','Abu Dhabi','Asia'],['Israel','Jerusalem','Asia'],['Iran','Tehran','Asia'],
['Pakistan','Islamabad','Asia'],['Bangladesh','Dhaka','Asia'],['Sri Lanka','Sri Jayawardenepura Kotte','Asia'],['Nepal','Kathmandu','Asia'],
['Indonesia','Jakarta','Asia'],['Malaysia','Kuala Lumpur','Asia'],['Singapore','Singapore','Asia'],['Vietnam','Hanoi','Asia'],
['Philippines','Manila','Asia'],['New Zealand','Wellington','Oceania'],['Fiji','Suva','Oceania'],['Kenya','Nairobi','Africa'],
['Nigeria','Abuja','Africa'],['Ethiopia','Addis Ababa','Africa'],['Ghana','Accra','Africa'],['Morocco','Rabat','Africa'],
['Algeria','Algiers','Africa'],['Peru','Lima','South America'],['Chile','Santiago','South America'],['Colombia','Bogotá','South America'],
['Venezuela','Caracas','South America'],['Cuba','Havana','North America'],['Jamaica','Kingston','North America'],['USA','Washington, D.C.','North America'],
['Ireland','Dublin','Europe'],['Belgium','Brussels','Europe'],['Austria','Vienna','Europe'],['Switzerland','Bern','Europe'],
['Denmark','Copenhagen','Europe'],['Czechia','Prague','Europe'],['Hungary','Budapest','Europe'],['Romania','Bucharest','Europe'],
['Vietnam','Hanoi','Asia'],['Mongolia','Ulaanbaatar','Asia'],['Kazakhstan','Astana','Asia'],['Uzbekistan','Tashkent','Asia'],
['Afghanistan','Kabul','Asia'],['Myanmar','Naypyidaw','Asia'],['Cambodia','Phnom Penh','Asia'],['Laos','Vientiane','Asia'],
['Senegal','Dakar','Africa'],['Tanzania','Dodoma','Africa'],['Uganda','Kampala','Africa'],['Zimbabwe','Harare','Africa'],
['Iceland','Reykjavik','Europe'],['Croatia','Zagreb','Europe'],['Serbia','Belgrade','Europe'],['Bulgaria','Sofia','Europe'],
['Ecuador','Quito','South America'],['Bolivia','Sucre','South America'],['Paraguay','Asunción','South America'],['Uruguay','Montevideo','South America'],
];
function genGeo(k) {
  const out = [];
  let guard = 0;
  const caps = COUNTRIES.map((c) => c[1]);
  const names = COUNTRIES.map((c) => c[0]);
  while (out.length < k && guard++ < k * 30 + 100) {
    const i = ri(0, COUNTRIES.length - 1);
    const [name, cap, cont] = COUNTRIES[i];
    const t = rnd();
    if (t < 0.45) {
      const others = pickOthers(caps, cap, 5);
      out.push(mkQ('geography', 'medium', `What is the capital of ${name}?`, cap, others, `${cap} is the capital of ${name}.`));
    } else if (t < 0.8) {
      const others = pickOthers(names, name, 5);
      out.push(mkQ('geography', 'medium', `${cap} is the capital of which country?`, name, others, `${cap} is the capital of ${name}.`));
    } else {
      const conts = ['Asia', 'Europe', 'Africa', 'North America', 'South America', 'Oceania'].filter((c) => c !== cont);
      out.push(mkQ('geography', 'easy', `Which continent is ${name} in?`, cont, conts.slice(0, 4), `${name} is in ${cont}.`));
    }
  }
  return out;
}
function pickOthers(arr, exclude, k) {
  const pool = arr.filter((x) => x !== exclude);
  const out = [];
  while (pool.length && out.length < k) out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  return out;
}

/* ---------- generative science: elements × template combos ---------- */
const ELEMENTS = [
['Hydrogen','H',1],['Helium','He',2],['Lithium','Li',3],['Carbon','C',6],['Nitrogen','N',7],['Oxygen','O',8],
['Sodium','Na',11],['Magnesium','Mg',12],['Aluminium','Al',13],['Silicon','Si',14],['Phosphorus','P',15],['Sulfur','S',16],
['Chlorine','Cl',17],['Potassium','K',19],['Calcium','Ca',20],['Iron','Fe',26],['Copper','Cu',29],['Zinc','Zn',30],
['Silver','Ag',47],['Tin','Sn',50],['Gold','Au',79],['Mercury','Hg',80],['Lead','Pb',82],['Neon','Ne',10],
['Argon','Ar',18],['Fluorine','F',9],['Bromine','Br',35],['Iodine','I',53],['Nickel','Ni',28],['Platinum','Pt',78],
['Uranium','U',92],['Tungsten','W',74],['Titanium','Ti',22],['Chromium','Cr',24],['Manganese','Mn',25],['Cobalt','Co',27],
];
function genScience(k) {
  const out = [];
  let guard = 0;
  while (out.length < k && guard++ < k * 30 + 100) {
    const [name, sym, num] = ELEMENTS[ri(0, ELEMENTS.length - 1)];
    const t = rnd();
    if (t < 0.4) {
      const others = pickOthers(ELEMENTS.map((e) => e[1]), sym, 5);
      out.push(mkQ('science', 'medium', `What is the chemical symbol for ${name}?`, sym, others, `${name} = ${sym}.`));
    } else if (t < 0.7) {
      const others = pickOthers(ELEMENTS.map((e) => e[0]), name, 5);
      out.push(mkQ('science', 'medium', `${sym} is the symbol of which element?`, name, others, `${sym} = ${name}.`));
    } else {
      const near = [num + 1, num - 1, num + 2, num - 2, num + 5, num + 10].filter((x) => x > 0 && x !== num);
      out.push(mkQ('science', 'hard', `What is the atomic number of ${name}?`, num, near, `${name} has atomic number ${num}.`));
    }
  }
  return out;
}

// Convert an MCQ bank item to True/False: half the time assert the truth,
// half the time assert a wrong option.
function toTF(item, idx) {
  const useTruth = idx % 2 === 0;
  const statement = useTruth
    ? `${item.question} — ${item.options[item.correctAnswer]}.`
    : `${item.question} — ${item.options[(item.correctAnswer + 1) % item.options.length]}.`;
  return {
    id: `bank-${Date.now()}-${n++}`,
    category: item.category,
    difficulty: item.difficulty,
    question: `${statement} True or false?`,
    options: ['True', 'False'],
    correctAnswer: useTruth ? 0 : 1,
    explanation: item.explanation,
  };
}

/* ---------- cross-game no-repeat memory (LRU, 20000 keys ≈ 500+ games) ---------- */
const servedKeys = new Set();
function keyOf(it) { return `${it.category}|${it.question}`; }
function markServed(items) {
  for (const it of items) servedKeys.add(keyOf(it));
  while (servedKeys.size > 20000) {
    const first = servedKeys.values().next().value;
    servedKeys.delete(first);
  }
}

function genFor(cat, k, difficulty) {
  if (cat === 'maths') return genMaths(k, difficulty);
  if (cat === 'geography') return genGeo(k);
  if (cat === 'science') return genScience(k);
  return [];
}

export function bankQuestions({ category = 'mixed', count = 10, questionType = 'mcq', difficulty = 'mixed' } = {}) {
  const cat = String(category || 'mixed').toLowerCase();
  const want = Math.max(3, Math.min(40, Number(count) || 10));
  const diff = ['easy', 'medium', 'hard', 'mixed'].includes(String(difficulty).toLowerCase()) ? String(difficulty).toLowerCase() : 'mixed';
  const staticPool = ALL_RAW.filter((r) => r[0] === cat);
  const mixedPool = ALL_RAW.filter((r) => r[0] === 'mixed' || r[0] === 'gk');
  const firstPool = cat === 'custom' ? mixedPool : staticPool.length >= 3 ? staticPool : [...staticPool, ...mixedPool];
  const candidates = [];
  for (const r of shuffle(firstPool)) candidates.push(q(cat === 'custom' ? 'mixed' : r[0], r[1], r[2], [...r[3]], r[4], r[5]));
  // Over-request generative pools 3x: collisions get filtered by the LRU,
  // and this keeps maths/geo/science games from eating other categories' static pools.
  for (const g of genFor(cat === 'custom' ? 'mixed' : cat, want * 3 + 20, diff)) candidates.push(g);
  for (const r of shuffle(mixedPool)) candidates.push(q(r[0], r[1], r[2], [...r[3]], r[4], r[5]));
  for (const r of shuffle(ALL_RAW)) candidates.push(q(r[0], r[1], r[2], [...r[3]], r[4], r[5]));
  // Prefer questions never served before (also de-dupes within this game).
  // If the whole pool is exhausted, reshuffle so consecutive games don't align.
  const picked = [];
  const local = new Set();
  const order = [...candidates];
  for (const pass of [false, true]) {
    if (pass) shuffleInPlace(order);
    for (const c of order) {
      if (picked.length >= want) break;
      const k = keyOf(c);
      if (local.has(k)) continue;
      if (!pass && servedKeys.has(k)) continue;
      local.add(k);
      picked.push(c);
    }
    if (picked.length >= want) break;
  }
  markServed(picked);
  const qt = String(questionType).toLowerCase();
  if (qt === 'tf') return { questions: picked.map(toTF), provider: 'bank' };
  if (qt === 'mixed') return { questions: picked.map((it, i) => (i % 2 === 1 ? toTF(it, i) : it)), provider: 'bank' };
  return { questions: picked, provider: 'bank' };
}

export function bankStats() {
  const cats = {};
  for (const r of ALL_RAW) cats[r[0]] = (cats[r[0]] || 0) + 1;
  return { static: ALL_RAW.length, generative: 'maths/geography/science unlimited', perCategory: cats, recentServed: servedKeys.size };
}
