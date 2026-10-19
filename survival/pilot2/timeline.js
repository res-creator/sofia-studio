// Builds timeline.json from script.json: line times (gap before each line), word timings, scene spans. node timeline.js
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const D = __dirname, S = JSON.parse(fs.readFileSync(D + '/script.json'));
const SRC = { pilot: '../vo', cruise: '../cruise/vo', new: 'vo' };
let t = 0.6; const lines = [];
for (const [id, who, scene, text, src, gap] of S.lines) {
  t += gap;
  const f = path.join(D, SRC[src], id + '.mp3'), a = JSON.parse(fs.readFileSync(f.slice(0, -4) + '.align.json'));
  const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString();
  const words = []; let cur = '', ws = 0, we = 0;
  a.characters.forEach((c, i) => { if (/\s/.test(c)) { if (cur) words.push({ w: cur, t0: t + ws, t1: t + we }); cur = ''; return; } if (!cur) ws = a.character_start_times_seconds[i]; cur += c; we = a.character_end_times_seconds[i]; });
  if (cur) words.push({ w: cur, t0: t + ws, t1: t + we });
  const end = a.character_end_times_seconds[a.character_end_times_seconds.length - 1];
  lines.push({ id, who, scene, text, file: path.relative(D, f), t0: t, t1: t + end, words });
  t += Math.min(dur, end + 0.25);
}
const T = t + 7.0, scenes = [], LATE = new Set(['night1']);   // LATE: the previous scene keeps playing through the gap
for (const L of lines) if (!scenes.length || scenes[scenes.length - 1].id !== L.scene) scenes.push({ id: L.scene, t0: !scenes.length ? 0 : LATE.has(L.scene) ? L.t0 - 0.6 : Math.min(L.t0 - 0.3, lines[lines.indexOf(L) - 1].t1 + 0.4) });
scenes.forEach((s, i) => { s.t1 = i + 1 < scenes.length ? scenes[i + 1].t0 : T; });
fs.writeFileSync(D + '/timeline.json', JSON.stringify({ fps: 30, T, lines, scenes }, null, 1));
console.log('T =', T.toFixed(1), (T / 60).toFixed(2) + ' min'); for (const s of scenes) console.log(s.id.padEnd(8), s.t0.toFixed(1), (s.t1 - s.t0).toFixed(1));
