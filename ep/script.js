// "My Normal Morning Routine" — Sofia Easy English, episode 1 (A1–A2), ~3 min vertical.
// Items: {say:id, who, text} | {wait:s} | {turn:'phrase'} (your-turn pause) | {mark:'name'}
const S = (id, text, who = 'sofia') => ({ say: id, who, text });
const W = s => ({ wait: s });
const M = n => ({ mark: n });
const T = p => ({ turn: p });

const SEQ = [
  { id: 'hook', items: [M('dark'), W(0.9), M('light'), S('l01', "[excited] Hi! I'm Sofia! And this is my totally... normal... morning routine."), W(0.4), M('reveal'), W(1.4), M('gus'), S('l01b', '[deadpan] This is Gus. My best friend. He is a goose. [whispers] Don\'t ask.'), W(0.6)] },
  { id: 'wake', items: [W(0.3), M('honk'), W(1.2), S('l02', '[cheerful] Every day, I wake up at seven o\'clock.'), W(0.4), S('l03', '[sighs] In the fridge. [deadpan] Again.'), W(0.6), M('card'), S('l04', 'Wake up means... stop sleeping. Your eyes open!'), W(0.3), T('I wake up.'), W(0.2)] },
  { id: 'getup', items: [W(0.2), S('l05', '[confident] Then, I get up!'), M('slip'), W(1.4), S('l06', '[groans] ...Slowly.'), W(0.5), M('card'), S('l07', 'Wake up is your eyes. Get up... is your body!'), W(0.3), T('I get up.'), W(0.2)] },
  { id: 'teeth', items: [W(0.2), S('l08', '[happy] Next, I brush my teeth.'), W(0.5), M('taste'), S('l09', '[suspicious] Hmm. This toothpaste tastes like... [disgusted] mayonnaise?!'), W(0.4), M('gus'), W(1.3), M('card'), S('l10', 'One tooth. Two teeth. [laughs] Not tooths!'), W(0.3), T('I brush my teeth.'), W(0.2)] },
  { id: 'shower', items: [W(0.2), S('l11', '[happy] I take a shower. Every morning!'), M('sputter'), W(1.2), M('can'), W(1.0), S('l12', '[flatly] ...Thank you, Gus.'), W(0.4), M('card'), S('l13', 'We say: take a shower. Not... make a shower!'), W(0.3), T('I take a shower.'), W(0.2)] },
  { id: 'quiz', items: [S('q01', '[excited] Quick quiz! What do I do after the shower?'), W(0.2), M('opts'), S('q02', 'A: get dressed. Or B: make breakfast?'), M('count'), W(3.2), M('answer'), S('q03', '[happy] A! I get dressed. [laughs] Well... I try.'), W(0.5)] },
  { id: 'dress', items: [W(0.2), S('l14', '[excited] Now I get dressed. Fast!'), M('spin'), W(1.6), M('done'), S('l15', '[proud] Perfect. I look amazing.'), W(0.8), M('wrong'), S('l15b', '[nervous] ...Wait. Something is wrong.'), W(1.2), M('fix'), W(0.8), M('card'), S('l16', 'Get dressed means... put on your clothes. [laughs] Correctly.'), W(0.3), T('I get dressed.'), W(0.2)] },
  { id: 'toast', items: [W(0.2), S('l17', '[excited] Then I make breakfast. Toast!'), W(0.3), M('launch'), W(1.3), S('l18', '[confused] Breakfast is... on the ceiling.'), W(0.4), M('drop'), W(1.2), M('card'), S('l19', 'Remember! Make breakfast... but take a shower.'), W(0.3), T('I make breakfast.'), W(0.2)] },
  { id: 'coffee', items: [W(0.2), S('l20', '[dreamy] I always drink coffee in the morning...'), W(0.3), M('steal'), W(1.4), S('l21', '[shouting] Gus! That is MY coffee!'), M('honk'), W(1.2), M('card'), T('I drink coffee.'), W(0.2)] },
  { id: 'leave', items: [W(0.2), M('pack'), S('l22a', '[quickly] Bag. Keys. Phone. Gus. Okay!'), W(0.3), M('run'), S('l22', "[excited] At eight o'clock, I leave the house! I'm not late today!"), W(0.3), M('stop'), S('g01', 'Sofia. It is Saturday.', 'gus'), W(0.5), M('freeze'), S('l23', "[surprised] ...It's Saturday?"), W(0.6), M('back'), S('l24', '[whispers] Okay. Good night.'), W(1.0)] },
  { id: 'recap', items: [S('l25', "[cheerful] Let's repeat my morning. Say it with me!"), W(0.3),
    M('r0'), S('r1', 'I wake up.'), W(1.7), M('r1'), S('r2', 'I get up.'), W(1.7), M('r2'), S('r3', 'I brush my teeth.'), W(1.8), M('r3'), S('r4', 'I take a shower.'), W(1.4),
    M('r4'), S('r5', 'I get dressed.'), W(1.7), M('r5'), S('r6', 'I make breakfast.'), W(1.8), M('r6'), S('r7', 'I drink coffee.'), W(1.7), M('r7'), S('r8', 'I leave the house.'), W(1.6), M('r8')] },
  { id: 'outro', items: [S('l26', '[curious] What do YOU do first in the morning? Write it in the comments!'), W(0.4), M('honk'), W(0.8), S('l27', '[cheerful] See you next time. Bye!'), W(1.6)] },
];

const CARDS = {
  wake: { en: 'wake up', ipa: '/weɪk ʌp/', def: 'stop sleeping', icon: 'eye' },
  getup: { en: 'get up', ipa: '/ɡet ʌp/', def: 'leave your bed', icon: 'up', vs: ['wake up = 👀', 'get up = 🧍'] },
  teeth: { en: 'brush my teeth', ipa: '/brʌʃ maɪ tiːθ/', def: 'one tooth, two teeth', icon: 'tooth', wrong: 'tooths' },
  shower: { en: 'take a shower', ipa: '/teɪk ə ˈʃaʊər/', def: 'wash your body', icon: 'shower', wrong: 'make a shower' },
  dress: { en: 'get dressed', ipa: '/ɡet drest/', def: 'put on your clothes', icon: 'shirt' },
  toast: { en: 'make breakfast', ipa: '/meɪk ˈbrekfəst/', def: 'cook your morning food', icon: 'toast' },
  coffee: { en: 'drink coffee', ipa: '/drɪŋk ˈkɒfi/', def: 'drink — drank — drunk', icon: 'cup' },
};

module.exports = { SEQ, CARDS };
if (require.main === module) {
  let n = 0; const out = {};
  for (const sc of SEQ) for (const it of sc.items) if (it.say) { n += it.text.length; out[it.say] = { who: it.who, text: it.text }; }
  console.log('chars', n); require('fs').writeFileSync(__dirname + '/lines.json', JSON.stringify(out, null, 1));
}
if (require.main === module) require('fs').writeFileSync(__dirname + '/seq.json', JSON.stringify({ SEQ, CARDS }, null, 1));
