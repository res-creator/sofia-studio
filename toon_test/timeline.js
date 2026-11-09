// Builds the shot timeline from the voice clips (STT word timings) and beats.
const fs = require('fs');
const D = __dirname;
const LINES = Object.fromEntries(JSON.parse(fs.readFileSync(D + '/lines.json')).map(([id, who, text]) => [id, { id, who, text }]));

// [kind, id, gapBefore, extra]
const SEQ = [
  ['beat', 'title', 0, 2.8],
  ['line', 'e1', 0.1], ['beat', 'wake', 0.1, 0.7],
  ['line', 'f1', 0], ['line', 'e2', 0.2], ['line', 'f2', 0.2], ['line', 'e3', 0.15],
  ['beat', 'disguise', 0.1, 0.9],
  ['line', 'e4', 0], ['line', 'f3', 0.2], ['line', 'e5', 0.1],
  ['beat', 'unplug', 0.1, 1.3],
  ['line', 'e6', 0.1], ['line', 'f4', 0.2], ['line', 'e7', 0.05],
  ['beat', 'lights', 0.1, 1.6],
  ['line', 'p1', 0], ['line', 'f5', 0.15], ['beat', 'icecream', 0, 0.9],
  ['line', 'e8', 0.05], ['line', 'p2', 0.15], ['line', 'e9', 0.2], ['line', 'f6', 0.15], ['beat', 'salad', 0, 0.8],
  ['line', 'e10', 0.1], ['beat', 'end', 0.2, 3.4],
];
const KEEP_LEAD = { e10: 0.2, e6: 0.3 };

let t = 0; const items = [];
for (const [kind, id, gap, extra] of SEQ) {
  t += gap;
  if (kind === 'beat') { items.push({ kind, id, t0: t, t1: t + extra }); t += extra; continue; }
  const stt = JSON.parse(fs.readFileSync(`${D}/vo/${id}.stt.json`));
  const toks = stt.words.filter(w => w.type !== 'spacing');
  const a = Math.max(0, (KEEP_LEAD[id] ?? toks[0].start) - 0.08), b = toks[toks.length - 1].end + 0.18;
  const words = toks.filter(w => w.type === 'word').map(w => ({ w: w.text, t0: t + w.start - a, t1: t + w.end - a }));
  items.push({ kind, id, who: LINES[id].who, t0: t, t1: t + (b - a), clipIn: a, clipDur: b - a, words });
  t += b - a;
}
const TL = { fps: 30, dur: t, items };
fs.writeFileSync(D + '/timeline.json', JSON.stringify(TL, null, 1));
console.log('duration', t.toFixed(2));
for (const i of items) console.log(i.kind, i.id, i.t0.toFixed(2), i.t1.toFixed(2));
