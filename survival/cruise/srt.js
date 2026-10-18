// English subtitles from the caption chunks -> out/ep1.srt
const C = require('./lib/core'), { TL } = require('./seq');
const f = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
const out = C.makeCaptions(TL).map((c, i) => `${i + 1}\n${f(c.t0)} --> ${f(c.t1)}\n${c.lines.map(l => l.map(w => w.w).join(' ')).join('\n')}\n`).join('\n');
require('fs').writeFileSync(__dirname + '/out/ep1.srt', out); console.log('srt lines', out.split('\n\n').length);
