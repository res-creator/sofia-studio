// Episode 2 overlays. Same look as episode 1 (lib/ui.js), with:
//  - bigger, phone-readable karaoke captions + a colour per speaker (Sofia white, Gus blue, Dr. Max green)
//  - compact "NEW PHRASE" cards that float beside the speaker and never pause the story
//  - a 4-step phrase tracker (episode-1 progress bar idea, for the 4 phrases of the episode)
const { OL, paint, line, curve, roundRect, clamp, ease, lerp } = require('../lib/draw');
const F = require('../lib/fonts');
const U = require('../lib/ui');
const { ORANGE, GREEN, RED } = U;

const STYLE = {
  sofia: { bg: '#FFFFFF', on: ORANGE, past: OL, idle: '#9C8A82' },
  gus: { bg: '#2E6FD8', on: '#FFD23F', past: '#FFFFFF', idle: '#FFFFFF' },
  drmax: { bg: '#2F9466', on: '#FFE45C', past: '#FFFFFF', idle: '#FFFFFF' },
};
function caption(ctx, words, t, who = 'sofia', Y = 978, CX = 960) {
  if (!words || !words.length) return;
  const st = STYLE[who] || STYLE.sofia, FS = 76, GAP = 32, maxW = 1560, lh = 92;
  ctx.save(); ctx.font = `800 ${FS}px ${F.EN}`;
  const lines = [[]]; let w = 0;
  for (const wd of words) { const ww = ctx.measureText(wd.w).width + GAP; if (w + ww > maxW && lines[lines.length - 1].length) { lines.push([]); w = 0; } lines[lines.length - 1].push({ ...wd, ww }); w += ww; }
  let cur = 0; lines.forEach((ln, i) => { if (ln.length && t >= ln[0].t0 - 0.05) cur = i; });
  const show = lines.length <= 2 ? lines : lines.slice(Math.min(cur, lines.length - 2), Math.min(cur, lines.length - 2) + 2);
  const totalH = show.length * lh, pad = 36;
  const bw = Math.max(...show.map(l => l.reduce((a, b) => a + b.ww, 0))) + pad * 2 - GAP;
  const by = Y + 40 - totalH - 24;
  ctx.globalAlpha = 0.95;
  paint(ctx, c => roundRect(c, CX - bw / 2, by, bw, totalH + 30, 40), st.bg, { lw: 8 });
  ctx.globalAlpha = 1;
  show.forEach((ln, i) => {
    const lw = ln.reduce((a, b) => a + b.ww, 0) - GAP; let x0 = CX - lw / 2; const y = by + 15 + lh * i + 70;
    for (const wd of ln) {
      const active = t >= wd.t0 && t < wd.t1 + 0.08, past = t >= wd.t1;
      const k = active ? clamp((t - wd.t0) / 0.12) : 0;
      ctx.save(); ctx.translate(x0 + (wd.ww - GAP) / 2, y - 26); const sc = 1 + 0.05 * Math.sin(k * Math.PI) + (active ? 0.02 : 0); ctx.scale(sc, sc);
      ctx.textAlign = 'center';
      if (who !== 'sofia') { ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(30,20,15,0.35)'; ctx.lineJoin = 'round'; ctx.strokeText(wd.w, 0, 26); }
      ctx.fillStyle = active ? st.on : past ? st.past : st.idle;
      ctx.fillText(wd.w, 0, 26); ctx.restore();
      x0 += wd.ww;
    }
  });
  ctx.restore();
}

function icon(ctx, name, X, Y, s = 1) {
  ctx.save(); ctx.translate(X, Y); ctx.scale(s, s);
  if (name === 'question') {
    paint(ctx, c => { c.moveTo(-40, -30); c.quadraticCurveTo(-40, -44, -26, -44); c.lineTo(28, -44); c.quadraticCurveTo(42, -44, 42, -30); c.lineTo(42, 14); c.quadraticCurveTo(42, 28, 28, 28); c.lineTo(-6, 28); c.lineTo(-24, 46); c.lineTo(-20, 28); c.lineTo(-26, 28); c.quadraticCurveTo(-40, 28, -40, 14); c.closePath(); }, '#FFFFFF', { lw: 6 });
    U.textOutlined(ctx, '?', 2, 18, 60, ORANGE, { olw: 8 });
  } else if (name === 'tummy') {
    paint(ctx, c => c.ellipse(0, 4, 38, 40, 0, 0, 7), '#FFDCC6', { shade: '#F4B79C', sx: 6, sy: 4, lw: 6 });
    curve(ctx, [-12, 8], [0, 16], [12, 8], 5, OL);
    for (const s of [-1, 1]) line(ctx, [[s * 46, -30], [s * 56, -22], [s * 48, -12], [s * 58, -4]], 5, RED);
  } else if (name === 'point') {
    paint(ctx, c => c.arc(0, 0, 30, 0, 7), '#FFFFFF', { lw: 6 }); paint(ctx, c => c.arc(0, 0, 12, 0, 7), RED, { lw: 4 });
  } else if (name === 'smile') {
    paint(ctx, c => c.arc(0, 0, 38, 0, 7), '#FFD23F', { lw: 6 }); curve(ctx, [-18, 8], [0, 26], [18, 8], 6, OL);
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 13, -8, 5, 0, 7); ctx.fillStyle = OL; ctx.fill(); }
  } else U.icon(ctx, name, 0, 0, 1);
  ctx.restore();
}

// compact NEW PHRASE card. k: appear 0..1, out: disappear 0..1. side: 'left'|'right'
function phraseCard(ctx, cd, k, out, t, side = 'right') {
  if (k <= 0 || out >= 1) return;
  const a = ease.back(clamp(k)), o = 1 - ease.in(clamp(out)), s = 0.58 * a * o + 0.0001;
  const X = side === 'left' ? 450 : 1470, Y = 210;
  ctx.save(); ctx.translate(X + (1 - clamp(k * 1.4)) * (side === 'left' ? -260 : 260), Y); ctx.scale(s, s); ctx.rotate((side === 'left' ? 0.03 : -0.03) + Math.sin(t * 2) * 0.008);
  ctx.save(); ctx.globalAlpha = 0.25; paint(ctx, c => roundRect(c, -440 + 14, -190 + 18, 880, 380, 46), '#000', { lw: 0 }); ctx.restore();
  paint(ctx, c => roundRect(c, -440, -190, 880, 380, 46), '#FFFFFF', { lw: 8 });
  ctx.save(); ctx.beginPath(); roundRect(ctx, -440, -190, 880, 380, 46); ctx.clip(); ctx.fillStyle = GREEN; ctx.fillRect(-440, -190, 880, 92); ctx.restore();
  line(ctx, [[-440, -98], [440, -98]], 8, OL);
  U.textOutlined(ctx, 'NEW PHRASE', -390, -125, 44, '#FFFFFF', { align: 'left', olw: 8 });
  icon(ctx, cd.icon, 370, -144, 0.85);
  const fs = cd.en.length > 16 ? 86 : 100;
  U.textOutlined(ctx, cd.en, 0, 40, fs, ORANGE, { olw: 14 });
  ctx.font = '42px DejaVu Sans'; ctx.fillStyle = '#8A6A5C'; ctx.textAlign = 'center'; ctx.fillText(cd.ipa, 0, 120);
  ctx.restore();
}

// 4-phrase tracker, top-left (ep1 progress bar style)
const TRACK = ['question', 'tummy', 'point', 'smile'];
function tracker(ctx, done, t, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(36, 26); ctx.scale(0.68, 0.68);
  const y = 80, gap = 130, x0 = 110, n = TRACK.length - 1;
  paint(ctx, c => roundRect(c, x0 - 70, y - 62, gap * n + 140, 124, 62), 'rgba(255,255,255,0.88)', { lw: 6 });
  line(ctx, [[x0, y], [x0 + gap * n, y]], 10, '#E8D9CC');
  const fill = gap * Math.min(n, Math.max(0, done - 1));
  if (fill > 0) line(ctx, [[x0, y], [x0 + fill, y]], 10, GREEN);
  TRACK.forEach((nm, i) => {
    const on = done >= i + 1 - 0.01, x = x0 + i * gap;
    const pop = on ? 1 + 0.25 * Math.max(0, 1 - Math.abs(done - (i + 1)) * 3) : 1;
    paint(ctx, c => c.arc(x, y, 44 * pop, 0, 7), on ? '#FFFFFF' : '#F3EAE2', { lw: 6 });
    ctx.save(); if (!on) ctx.globalAlpha = 0.35 * alpha; icon(ctx, nm, x, y, 0.62 * pop); ctx.restore();
  });
  ctx.restore();
}

module.exports = { caption, phraseCard, tracker, icon, STYLE };
