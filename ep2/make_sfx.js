// Collects sound-effect cues for episode 2: scene sfx marks, scene sfxAt(), phrase-card chimes, your-turn ding, scene transitions.
const TL = require('./timeline.json'); const SCN = require('./scenes');
const TRANS = { title: 'cut', wait: 'whip', exam: 'whip', exam2: 'cut', diag: 'cut', outside: 'whip', recap: 'fade', quiz: 'iris', outro: 'whip' };
const out = [];
for (const S of TL.scenes) {
  for (const [mk, off, name] of SCN[S.id].sfx || []) { const t = S.marks[mk]; if (t === undefined) { console.error('missing mark', S.id, mk); continue; } out.push({ t: t + off, name }); }
  if (SCN[S.id].sfxAt) out.push(...SCN[S.id].sfxAt());
  const tr = TRANS[S.id]; if (tr && tr !== 'cut' && tr !== 'fade') out.push({ t: S.t0 - 0.22, name: 'whoosh', g: 1 });
}
for (const p of TL.phrases) { const L = TL.lines.find(l => l.id === p.line); const w = L.words[Math.min(p.word, L.words.length - 1)]; out.push({ t: (w ? w.t0 : L.t0), name: 'card' }); }
for (const tr of TL.turns) out.push({ t: tr.t0, name: 'ding' });
require('fs').writeFileSync(__dirname + '/sfx.json', JSON.stringify(out));
console.log(out.length, 'sfx');
