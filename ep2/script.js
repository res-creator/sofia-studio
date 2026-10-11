// "Gus at the Doctor" — Sofia Easy English, episode 2 (A1–A2). Full episode (~3:00). Block 1 = hook … exam.
// Same item format as episode 1:  S(id, text, who) speech | W(s) wait | M(name) mark | T(phrase, dur) your-turn pause
// Text in [brackets] = ElevenLabs v3 direction tags (not shown in captions).
const S = (id, text, who = 'sofia') => ({ say: id, who, text });
const W = s => ({ wait: s });
const M = n => ({ mark: n });
const T = (p, d = 4.0) => ({ turn: p, dur: d });

const SEQ = [
  // HOOK — kitchen. Gus hunched at the table, five burger wrappers. Sofia comes in from the left.
  { id: 'hook', items: [M('dark'), W(0.6), M('light'), W(1.1),
    S('l01', '[worried] Gus? Are you okay?'), W(0.25),
    S('l02', '[groaning weakly] My stomach... [groans] hurts...', 'gus'), W(0.6),
    M('insert'), W(1.0),
    S('l03', '[shocked] Five burger wrappers?! [firmly] We are going to the doctor!'), W(0.2),
    S('l04', '[panicking] The doctor?! No no no!', 'gus'), W(0.45)] },
  // TITLE SLAM
  { id: 'title', items: [M('slam'), W(2.4)] },
  // WAITING ROOM — two chairs, plant, door with "Dr. Max" sign
  { id: 'wait', items: [W(1.3),
    S('l05', '[nervous] Doctors have needles!', 'gus'), W(0.25),
    S('l06', '[calm, reassuring] Doctor Max is just going to examine you.'), W(0.25),
    S('l07', '[suspicious] That is exactly what a doctor with needles would say!', 'gus'), W(0.6)] },
  // EXAM ROOM — Gus on the exam table, Sofia beside him, Dr. Max comes in through the door
  { id: 'exam', items: [W(0.5), M('door'), W(1.9),
    S('l08', '[warm] Hello! I am Doctor Max. What is the problem?', 'drmax'), W(0.35),
    S('l09', '[dramatic] My stomach hurts!', 'gus'), W(0.3),
    S('l10', '[kindly] What did you eat today?', 'drmax'), W(0.3),
    S('l11', '[slowly, guilty] One burger... two... three... four... [quietly] five burgers.', 'gus'), W(0.8),
    M('react'), W(1.8),
    S('l12', '[deadpan] Five burgers. For breakfast.'), W(0.3),
    S('l13', '[defensive] They were small burgers!', 'gus'), W(0.45),
    T('My stomach hurts.'), W(0.4)] },
  // ---------------------------------------------------------------- BLOCK 2+
  // EXAM PART 2 — same room, Dr. Max now right next to the table
  { id: 'exam2', items: [W(0.3),
    S('l14', '[politely] Open your mouth, please.', 'drmax'), W(0.25),
    M('mouth'), W(1.5),
    S('l15', '[surprised] ...That is a very big mouth.', 'drmax'), W(0.3),
    S('l16', '[laughing] It is a beak!'), W(0.3),
    S('l17', '[calmly] Now... does it hurt here?', 'drmax'), W(0.15),
    M('poke'), W(0.55),
    S('l18', '[screaming] AAAH! Yes! It hurts!', 'gus'), W(0.3),
    M('beat'), W(1.5),
    S('l19', '[deadpan] ...I did not touch you yet.', 'drmax'), W(0.5),
    M('reaction'), W(2.0),
    T('Does it hurt here?'), W(0.3)] },
  // DIAGNOSIS
  { id: 'diag', items: [W(0.3),
    S('l20', '[matter-of-fact] You ate too much. Five burgers is too much!', 'drmax'), W(0.3),
    S('l21', '[hopeful] No medicine?', 'gus'), W(0.3),
    S('l22', '[calmly] No. Drink some water and no more burgers today.', 'drmax'), W(0.35),
    S('l23', '[horrified] That sounds worse than medicine!', 'gus'), W(1.4)] },
  // OUTSIDE THE CLINIC — sunny street
  { id: 'outside', items: [W(1.0),
    S('l24', '[warmly] How do you feel?'), W(0.3),
    S('l25', '[happy] I feel better! Much better!', 'gus'), W(1.0),
    S('l26', '[whispering] ...What about pizza?', 'gus'), W(0.2),
    M('honk'), W(0.6),
    S('l27', '[exasperated, shouting] GUS!'), W(1.0)] },
  // RECAP
  { id: 'recap', items: [S('l28', "[cheerful] Let us practice! Say it with me!"), W(0.4),
    M('r0'), S('r1', "What's the problem?"), W(2.4), M('r1'), S('r2', 'My stomach hurts.'), W(2.4),
    M('r2'), S('r3', 'Does it hurt here?'), W(2.4), M('r3'), S('r4', 'I feel better!'), W(2.2), M('r4'), W(0.6)] },
  // QUIZ
  { id: 'quiz', items: [S('q01', "[excited] Quick quiz! Why does Gus's stomach hurt?"), W(0.2),
    M('opts'), S('q02', 'A: He ate too much. Or B: He has a headache.'),
    M('count'), W(3.2), M('answer'), S('q03', '[happy] A! He ate too much!'), W(1.2)] },
  // OUTRO
  { id: 'outro', items: [S('l29', '[curious] Now you try! My... blank... hurts. Write your answer in the comments!'), W(0.4),
    M('honk'), W(0.7),
    S('l30', '[cheerful] See you next time! Bye!'), W(0.2),
    S('l31', '[deadpan] Bye bye!', 'gus'), W(1.2),
    M('endscreen'), W(20.0)] }, // YouTube end screen (subscribe + next video slots)
];

// phrase cards (Ep1 "NEW PHRASE" style, smaller, never pause the story)
// at: line id + word index (card pops on that word), side: where it floats
const PHRASES = [
  { en: "What's the problem?", ipa: '/wɒts ðə ˈprɒbləm/', icon: 'question', line: 'l08', word: 5, dur: 2.3, side: 'right' },
  { en: 'My stomach hurts.', ipa: '/maɪ ˈstʌmək hɜːts/', icon: 'tummy', line: 'l09', word: 1, dur: 2.6, side: 'right' },
  { en: 'Does it hurt here?', ipa: '/dʌz ɪt hɜːt hɪə/', icon: 'point', line: 'l17', word: 1, dur: 2.4, side: 'right' },
  { en: 'I feel better.', ipa: '/aɪ fiːl ˈbetə/', icon: 'smile', line: 'l25', word: 0, dur: 2.6, side: 'right' },
];

module.exports = { SEQ, PHRASES };
if (require.main === module) {
  const out = {}; let n = 0;
  for (const sc of SEQ) for (const it of sc.items) if (it.say) { out[it.say] = { who: it.who, text: it.text }; n += it.text.length; }
  require('fs').writeFileSync(__dirname + '/lines.json', JSON.stringify(out, null, 1));
  require('fs').writeFileSync(__dirname + '/seq.json', JSON.stringify({ SEQ, PHRASES }, null, 1));
  console.log('lines', Object.keys(out).length, 'chars', n);
}
