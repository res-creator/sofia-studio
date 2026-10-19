// English subtitles from the voice timings -> out/pilot_full.srt (cues of up to ~2 x 42 characters, split at sentence ends)
const TL = require('./timeline.json'), fs = require('fs');
const f = s => { const ms = Math.round(s * 1000), p = (n, k = 2) => String(n).padStart(k, '0'); return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };
const cues = [];
for (const L of TL.lines) { let cur = [];
  const flush = () => { if (!cur.length) return; const txt = cur.map(w => w.w).join(' '); cues.push({ t0: cur[0].t0, t1: cur[cur.length - 1].t1 + 0.3, txt }); cur = []; };
  L.words.forEach(w => { const len = cur.map(x => x.w).join(' ').length; if (len + w.w.length > 80) flush(); cur.push(w); if (/[.?!]$/.test(w.w) && cur.map(x => x.w).join(' ').length > 30) flush(); }); flush(); }
cues.forEach((c, i) => { if (cues[i + 1]) c.t1 = Math.min(c.t1, cues[i + 1].t0 - 0.05); });
const wrap = s => { if (s.length <= 42) return s; const m = s.lastIndexOf(' ', Math.ceil(s.length / 2) + 6); return s.slice(0, m) + '\n' + s.slice(m + 1); };
fs.writeFileSync(__dirname + '/out/pilot_full.srt', cues.map((c, i) => `${i + 1}\n${f(c.t0)} --> ${f(c.t1)}\n${wrap(c.txt)}\n`).join('\n'));
console.log('srt cues', cues.length);
