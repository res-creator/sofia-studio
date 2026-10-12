// "Gus at the Airport" — Sofia Easy English, episode 3 (A1–A2). ~6:30.
// Item format as in ep1/ep2:  S(id) speech (who comes from lines.json) | W(s) wait | M(name) mark | T(phrase, dur) your-turn pause
const LINES = require('./lines.json');
const S = id => ({ say: id, who: LINES[id].who, text: LINES[id].text });
const W = s => ({ wait: s });
const M = n => ({ mark: n });
const T = (p, d = 3.2) => ({ turn: p, dur: d });

const SEQ = [
  // 1. HOME — hallway, Gus on a huge suitcase that will not close
  { id: 'home', items: [W(0.6), S('l01'), W(0.25), S('l02'), W(0.3), S('l03'), W(0.35), M('burst'), W(1.5),
    S('l04'), W(0.2), S('l05'), W(0.25), S('l06'), W(0.25), S('l07'), W(0.4), S('l08'), W(0.5)] },
  { id: 'title', items: [M('slam'), W(2.6)] },
  // 2. CHECK-IN
  { id: 'checkin', items: [W(0.7), S('l09'), W(0.35), S('e1'), W(0.3), T('Can I see your passport?'), W(0.2), S('l10'), W(0.25), S('l11'), W(0.2), S('l12'), W(0.3), M('egg'), W(1.7),
    S('l13'), W(0.2), S('l14'), W(0.35), S('l15'), W(0.4), M('weigh'), W(1.0), S('l16'), W(0.35), S('e2'), W(0.3), S('l17'), W(0.2), S('l18'), W(0.3),
    M('eat'), W(3.0), S('l19'), W(0.2), S('l20'), W(0.3), S('l21'), W(0.35), S('e6'), W(0.3), S('l22'), W(0.5)] },
  // 3. SECURITY
  { id: 'security', items: [W(0.5), S('l23'), W(0.2), S('l24'), W(0.3), S('l25'), W(0.15), S('l26'), W(0.2), M('look'), W(1.3),
    S('l27'), W(0.3), M('beep'), W(1.3), S('l28'), W(0.2), S('l29'), W(0.25), M('beep2'), W(1.1), S('l30'), W(0.2), S('l31'), W(0.25),
    S('l32'), W(0.2), M('tie'), W(1.2), S('l33'), W(0.2), S('l34'), W(0.5)] },
  // 4. CORRIDOR → toilet door → Dr. Max
  { id: 'corridor', items: [W(0.4), S('l35'), W(0.2), S('l36'), W(1.5)] },
  { id: 'wc', items: [W(0.6), S('l37'), W(0.2), S('l38'), W(0.35), S('l39'), W(0.3), M('turn'), W(1.1),
    S('l40'), W(0.35), S('e3'), W(0.3), S('l41'), W(0.2), S('l42'), W(0.2), S('l43'), W(0.3), S('l44'), W(1.6)] },
  // 5. GATE 12 — delayed
  { id: 'lounge', items: [W(0.5), M('ding'), W(0.7), S('l45'), W(0.35), S('e4'), W(0.3), S('l46'), W(0.3), T('My flight is delayed.'), W(0.2), S('l47'), W(0.2), S('l48'), W(0.2), S('l49'), W(0.25), S('l50'), W(0.3),
    M('clock'), W(3.2), S('l51'), W(0.25), S('l52'), W(0.5)] },
  // 6. ON THE PLANE
  { id: 'plane', items: [W(0.5), S('l53'), W(0.2), S('l54'), W(0.2), S('l55'), W(0.35), S('e5'), W(0.3), T('Window or aisle seat?'), W(0.2), S('l56'), W(0.2), S('l57'), W(0.2), S('l58'), W(0.4),
    M('takeoff'), W(2.2), M('gary'), W(0.4), S('l59'), W(0.25), S('l60'), W(0.4), M('cart'), W(1.0),
    S('l61'), W(0.2), S('l62'), W(0.2), S('l63'), W(0.2), S('l64'), W(0.2), S('l65'), W(0.5)] },
  // 7. MADRID — baggage claim
  { id: 'baggage', items: [W(0.4), S('l66'), W(0.3), S('l67'), W(0.3), M('belt'), W(2.4), S('l68'), W(0.3), M('open'), W(0.8), M('honk'), W(1.0),
    S('l69'), W(0.25), S('l70'), W(0.3), S('l71'), W(0.8)] },
  // RECAP — six phrases
  { id: 'recap', items: [S('l72'), W(0.4),
    M('r0'), S('r1'), W(2.3), M('r1'), S('r2'), W(2.3), M('r2'), S('r3'), W(2.3), M('r3'), S('r4'), W(2.3), M('r4'), S('r5'), W(2.3), M('r5'), S('r6'), W(2.3), M('r6'), W(0.4)] },
  { id: 'quiz', items: [S('q01'), W(0.2), M('opts'), S('q02'), M('count'), W(3.2), M('answer'), S('q03'), W(1.3)] },
  { id: 'outro', items: [S('l73'), W(0.4), S('l74'), W(0.2), M('bye'), S('l75'), W(1.0), M('endscreen'), W(20.0)] },
];

// phrase cards (NEW PHRASE): line id + word index (card pops on that word)
const PHRASES = [
  { en: 'Can I see your passport?', mean: '= asking for your travel ID', ipa: '/kən aɪ siː jɔː ˈpɑːspɔːt/', icon: 'passport', line: 'l09', word: 2, dur: 2.6, side: 'right' },
  { en: 'My bag is too heavy.', mean: '= it weighs a lot', ipa: '/maɪ bæɡ ɪz tuː ˈhevi/', icon: 'bag', line: 'l16', word: 2, dur: 2.6, side: 'right' },
  { en: 'Have a nice flight!', mean: '= said to a traveller', ipa: '/hæv ə naɪs flaɪt/', icon: 'wave', line: 'l21', word: 7, dur: 1.5, side: 'right' },
  { en: 'Where is gate 12?', mean: '= where is the door to the plane?', ipa: '/weər ɪz ɡeɪt twelv/', icon: 'gate', line: 'l40', word: 0, dur: 2.5, side: 'left' },
  { en: 'My flight is delayed.', mean: '= the plane is late', ipa: '/maɪ flaɪt ɪz dɪˈleɪd/', icon: 'delay', line: 'l45', word: 6, dur: 2.7, side: 'right' },
  { en: 'Window or aisle seat?', mean: '= by the window or the walkway?', ipa: '/ˈwɪndəʊ ɔːr aɪl siːt/', icon: 'seat', line: 'l55', word: 2, dur: 2.7, side: 'right' },
];

module.exports = { SEQ, PHRASES };
if (require.main === module) {
  const out = {}; let n = 0, k = 0;
  for (const sc of SEQ) for (const it of sc.items) if (it.say) { out[it.say] = { who: it.who, text: it.text }; n += it.text.length; k++; }
  require('fs').writeFileSync(__dirname + '/seq.json', JSON.stringify({ SEQ, PHRASES }, null, 1));
  console.log('lines', k, 'chars', n, '(lines.json has', Object.keys(LINES).length + ')');
}
