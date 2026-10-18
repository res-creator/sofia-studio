// Dumps every audio event of the episode (voices, sfx, music beds) with absolute times -> out/cues.json
const { TL, ORDER } = require('./seq');
const out = { T: TL.T, voices: [], sfx: [], music: [] };
for (const l of TL.list) out.voices.push({ file: `vo/${l.src}.mp3`, t: l.t0, who: l.who });
for (const b of ORDER) { const sc = require('./scenes/' + b), B = TL.blocks[b];
  for (const [f, t, v] of (sc.cues ? sc.cues(TL) : [])) out.sfx.push({ file: f.includes('.') && f.endsWith('.mp3') ? f : f + '.mp3', t, v, block: b });
  for (const [f, a, z, v] of (sc.music ? sc.music(TL) : [])) out.music.push({ file: f + '.mp3', a, b: Math.min(z, B.t1), v }); }
require('fs').writeFileSync(__dirname + '/out/cues.json', JSON.stringify(out, null, 1));
console.log('voices', out.voices.length, 'sfx', out.sfx.length, 'music', out.music.length, 'T', TL.T.toFixed(1));
