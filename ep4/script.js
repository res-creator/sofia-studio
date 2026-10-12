// "Gus at the Hotel" — Sofia Easy English, episode 4 (A1–A2).
// Item format as ep3:  S(id) speech | W(s) wait | M(name) mark | T(phrase, dur) your-turn pause
const LINES = require('./lines.json');
const S = id => ({ say: id, who: LINES[id].who, text: LINES[id].text });
const W = s => ({ wait: s });
const M = n => ({ mark: n });
const T = (p, d = 3.2) => ({ turn: p, dur: d });

const SEQ = [
  { id: 'door', items: [W(0.7), S('l01'), W(0.3), M('spin'), S('l02'), W(0.2), S('l03'), W(0.3), S('l04'), W(0.9), M('stop'), W(1.0)] },
  { id: 'title', items: [M('slam'), W(2.6)] },
  { id: 'reception', items: [W(0.6), S('l05'), W(0.3), S('l06'), W(0.3), S('e1'), W(0.3), T('I have a reservation.'), W(0.2), S('l07'), W(0.2), S('l08'), W(0.3), S('l09'), W(0.25), S('l10'), W(0.5),
    M('booking'), W(0.2), S('l11'), W(0.3), S('l12'), W(0.2), S('l13'), W(0.4), S('l14'), W(0.3), S('e2'), W(0.3), S('l15'), W(0.4), M('eat'), W(1.6),
    S('l16'), W(0.2), S('l17'), W(0.3), S('l18'), W(0.5), S('l19'), W(0.3), S('e3'), W(0.3), S('l20'), W(0.25), S('l21'), W(0.2), S('l22'), W(0.3), S('l23'), W(0.6)] },
  { id: 'lift', items: [W(0.4), S('l24'), W(0.3), M('doors'), W(1.0), S('l25'), W(0.2), S('l26'), W(0.3), M('up'), W(2.2), M('ding'), W(1.4)] },
  { id: 'room', items: [W(0.5), S('l27'), W(0.2), S('l28'), W(0.3), S('l29'), W(0.3), S('e5'), W(0.3), T("The air conditioning doesn't work."), W(0.2), S('l30'), W(0.3),
    M('fan'), W(2.8), S('l31'), W(0.3), S('l32'), W(0.3), S('l33'), W(0.3), S('e4'), W(0.3), S('l34'), W(0.2), S('l35'), W(0.8)] },
  { id: 'breakfast', items: [W(0.5), S('l36'), W(0.2), S('l37'), W(0.4), M('clock'), W(3.0), M('open'), W(0.8), M('buffet'), W(2.6), S('l38'), W(0.2), S('l39'), W(0.2), S('l40'), W(0.7)] },
  { id: 'checkout', items: [W(0.5), S('l41'), W(0.3), S('e6'), W(0.3), S('l42'), W(0.2), S('l43'), W(0.2), S('l44'), W(0.3), S('l45'), W(0.3), M('bill'), W(0.5), S('l46'), W(0.3), S('l47'), W(0.8)] },
  { id: 'recap', items: [S('l48'), W(0.4),
    M('r0'), S('r1'), W(2.3), M('r1'), S('r2'), W(2.3), M('r2'), S('r3'), W(2.3), M('r3'), S('r4'), W(2.3), M('r4'), S('r5'), W(2.3), M('r5'), S('r6'), W(2.3), M('r6'), W(0.4)] },
  { id: 'quiz', items: [S('q01'), W(0.2), M('opts'), S('q02'), M('count'), W(3.2), M('answer'), S('q03'), W(1.3)] },
  { id: 'outro', items: [S('l49'), W(0.4), S('l50'), W(0.2), M('bye'), S('l51'), W(1.0), M('endscreen'), W(20.0)] },
];

const PHRASES = [
  { en: 'I have a reservation.', mean: '= I booked a room before', ipa: '/aɪ hæv ə ˌrezəˈveɪʃn/', icon: 'reserve', line: 'l06', word: 3, dur: 2.6, side: 'right' },
  { en: 'Can I have a key card, please?', mean: '= asking for the room key', ipa: '/kæn aɪ hæv ə kiː kɑːd pliːz/', icon: 'keycard', line: 'l14', word: 0, dur: 2.8, side: 'right' },
  { en: 'What time is breakfast?', mean: '= when is the morning meal?', ipa: '/wɒt taɪm ɪz ˈbrekfəst/', icon: 'toast', line: 'l19', word: 0, dur: 2.5, side: 'right' },
  { en: "The air conditioning doesn't work.", mean: '= it is hot, the machine is broken', ipa: '/ði eə ˌkɒndɪˈʃənɪŋ ˈdʌznt wɜːk/', icon: 'snow', line: 'l29', word: 3, dur: 2.9, side: 'left' },
  { en: "What's the Wi-Fi password?", mean: '= the secret word for the internet', ipa: '/wɒts ðə ˈwaɪ faɪ ˈpɑːswɜːd/', icon: 'wifi', line: 'l33', word: 2, dur: 2.7, side: 'right' },
  { en: 'What time is check-out?', mean: '= when do we leave the hotel?', ipa: '/wɒt taɪm ɪz ˈtʃek aʊt/', icon: 'exit', line: 'l41', word: 3, dur: 2.6, side: 'right' },
];

module.exports = { SEQ, PHRASES };
if (require.main === module) {
  const out = {}; let n = 0, k = 0;
  for (const sc of SEQ) for (const it of sc.items) if (it.say) { out[it.say] = { who: it.who, text: it.text }; n += it.text.length; k++; }
  require('fs').writeFileSync(__dirname + '/seq.json', JSON.stringify({ SEQ, PHRASES }, null, 1));
  console.log('lines', k, 'chars', n, '(lines.json has', Object.keys(LINES).length + ')');
}
