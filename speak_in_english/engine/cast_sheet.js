// node cast_sheet.js out.png  -> grid of every character in cast_v2.js with name + Kokoro voice
const fs = require('fs'); const H = require('./hq'); const { CAST } = require('./cast_v2'); const { geom, reach } = require('./pose');
const voices = JSON.parse(require('child_process').execSync('python3 -c "import json;from episodes_v2 import CAST;print(json.dumps(CAST))"').toString());
const names = Object.keys(CAST).filter(k => CAST[k].kind === 'human' && !['her_gym', 'her_lift', 'her_dinner', 'her_salon'].includes(k));
const cols = 6, cw = 300, ch = 560, rows = Math.ceil(names.length / cols);
const cv = H.createCanvas(cols * cw, rows * ch + 90), c = cv.getContext('2d');
c.fillStyle = '#F3EDDF'; c.fillRect(0, 0, cv.width, cv.height);
c.fillStyle = '#3E471E'; c.font = '40px Unb9'; c.textAlign = 'center'; c.fillText('CAST — cast_v2.js  (голос Kokoro из episodes_v2.py)', cv.width / 2, 58);
names.forEach((k, i) => {
  const x = (i % cols) * cw + cw / 2, y = 90 + Math.floor(i / cols) * ch; const cfg = CAST[k], g = geom(cfg);
  c.fillStyle = i % 2 ? '#FFFDF8' : '#F7F2E8'; c.fillRect(x - cw / 2 + 4, y + 4, cw - 8, ch - 8);
  const s = 400 / 1800; c.save(); c.translate(x, y + 470); c.scale(s, s);
  H.human(c, cfg, { t: 0.4, mood: 'happy', turn: 0.15, look: 0.2, armL: reach(g, -1, -g.sw * 1.05, g.ySh + 470), armR: reach(g, 1, g.sw * 1.05, g.ySh + 470) }); c.restore();
  const vk = k.startsWith('her') ? 'her' : k; const v = voices[vk];
  c.fillStyle = '#3E471E'; c.font = '30px Unb9'; c.fillText(k, x, y + 510);
  c.fillStyle = '#C23C76'; c.font = '22px Nun8'; c.fillText(v ? `${v.voice} · ${v.speed}${v.pitch ? ' · pitch ' + v.pitch : ''}` : '—', x, y + 542);
});
fs.writeFileSync(process.argv[2], cv.toBuffer('image/png')); console.log(names.length, 'characters');
