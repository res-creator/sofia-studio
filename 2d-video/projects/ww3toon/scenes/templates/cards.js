// Чёрная карточка: рукописные слова появляются по озвучке (как в референсе).
import { E, clamp } from '/engine/core.js';
import { tpl } from './_registry.js';
import * as T from '../toon.js';
tpl('card', 'Black card, handwritten words appear in sync with narration. params: text, gold:[words], size', {
  draw(g, t, info) {
    g.fillStyle = '#060606'; g.fillRect(0, 0, E.W, E.H);
    const words = info.text.split(/\s+/), size = info.size || 92; let prev = info.shot.start - 0.5;
    const times = words.map((w) => { if (/^[—–-]$/.test(w)) return null; const v = T.wt(w, prev); if (v != null && v < info.shot.end + 0.2) { prev = v; return v - info.shot.start; } return null; });
    for (let i = 0; i < times.length; i++) if (times[i] == null) times[i] = i ? times[i - 1] + 0.05 : 0;
    if (times[0] > 0.35) for (let i = 0; i < times.length; i++) times[i] -= times[0] - 0.05;
    g.save(); g.font = `700 ${size}px "${T.HAND}"`;
    const maxW = E.W * 0.74, lines = [[]]; let lw = 0;
    words.forEach((w, i) => { const ww = g.measureText(w + ' ').width; if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(i); lw += ww; });
    const lh = size * 1.18, y0 = E.H / 2 - (lines.length - 1) * lh / 2;
    lines.forEach((ln, li) => { const full = ln.map((i) => words[i]).join(' '); let x = E.W / 2 - g.measureText(full).width / 2;
      ln.forEach((i) => { const w = words[i], a = clamp((t - times[i]) / 0.12); const gold = (info.gold || []).some((q) => w.toLowerCase().includes(q));
        if (a > 0) T.hand(g, w, x, y0 + li * lh, { size, color: gold ? (info.goldCol || '#f2c037') : '#f4f1ea', align: 'left', a }); x += g.measureText(w + ' ').width; }); });
    g.restore();
  } });
