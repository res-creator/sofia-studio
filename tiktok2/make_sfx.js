const TL = require('./timeline.json'); const SCN = require('./scenes'); const out = [];
for (const S of TL.scenes) { if (!SCN[S.id]) continue; for (const [mk, off, name] of SCN[S.id].sfx || []) { const t = S.marks[mk] !== undefined ? S.marks[mk] : (TL.lines.find(l => l.id === mk) || {}).t0; if (t === undefined) { console.error('missing mark', S.id, mk); continue; } out.push({ t: t + off, name }); }
  if (SCN[S.id].sfxAt) out.push(...SCN[S.id].sfxAt()); if (S.id !== 'hook' && S.id !== 'a1') out.push({ t: S.t0 - 0.2, name: 'whoosh', g: 1 }); }
require('fs').writeFileSync(__dirname + '/sfx.json', JSON.stringify(out)); console.log(out.length, 'sfx');
