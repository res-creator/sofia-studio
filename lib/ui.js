const { OL, paint, line, curve, roundRect, clamp, ease, lerp } = require('./draw');
const F = require('./fonts');
const ORANGE = '#FF7A2F', GREEN = '#3DAA6E', RED = '#E5484D', CREAM = '#FFF6E6';

function icon(ctx, name, X, Y, s = 1) {
  ctx.save(); ctx.translate(X, Y); ctx.scale(s, s);
  switch (name) {
    case 'eye': paint(ctx, c => { c.moveTo(-40, 0); c.quadraticCurveTo(0, -38, 40, 0); c.quadraticCurveTo(0, 38, -40, 0); c.closePath(); }, '#fff', { lw: 6 }); paint(ctx, c => c.arc(0, 0, 14, 0, 7), GREEN, { lw: 5 }); break;
    case 'up': paint(ctx, c => { c.moveTo(0, -40); c.lineTo(34, 0); c.lineTo(14, 0); c.lineTo(14, 38); c.lineTo(-14, 38); c.lineTo(-14, 0); c.lineTo(-34, 0); c.closePath(); }, ORANGE, { lw: 6 }); break;
    case 'tooth': paint(ctx, c => { c.moveTo(-30, -30); c.bezierCurveTo(-10, -42, 10, -42, 30, -30); c.bezierCurveTo(40, 0, 24, 10, 18, 40); c.quadraticCurveTo(10, 46, 4, 20); c.quadraticCurveTo(0, 12, -4, 20); c.quadraticCurveTo(-10, 46, -18, 40); c.bezierCurveTo(-24, 10, -40, 0, -30, -30); c.closePath(); }, '#fff', { lw: 6 }); break;
    case 'shower': paint(ctx, c => { c.moveTo(0, -42); c.bezierCurveTo(30, -4, 30, 34, 0, 36); c.bezierCurveTo(-30, 34, -30, -4, 0, -42); c.closePath(); }, '#7CCBFA', { lw: 6 }); break;
    case 'shirt': paint(ctx, c => { c.moveTo(-18, -36); c.lineTo(-44, -16); c.lineTo(-30, 2); c.lineTo(-22, -4); c.lineTo(-22, 36); c.lineTo(22, 36); c.lineTo(22, -4); c.lineTo(30, 2); c.lineTo(44, -16); c.lineTo(18, -36); c.quadraticCurveTo(0, -24, -18, -36); c.closePath(); }, '#F4B63F', { lw: 6 }); break;
    case 'toast': paint(ctx, c => { c.moveTo(-30, 36); c.lineTo(-30, -10); c.bezierCurveTo(-46, -48, 46, -48, 30, -10); c.lineTo(30, 36); c.closePath(); }, '#F6D598', { lw: 6 }); break;
    case 'cup': paint(ctx, c => roundRect(c, -30, -30, 52, 62, 10), '#FF8FA6', { lw: 6 }); ctx.beginPath(); ctx.arc(26, 0, 14, -1.4, 1.4); ctx.lineWidth = 7; ctx.strokeStyle = OL; ctx.stroke(); break;
    case 'door': paint(ctx, c => roundRect(c, -26, -40, 52, 80, 6), RED, { lw: 6 }); paint(ctx, c => c.arc(14, 4, 5, 0, 7), '#F2C14E', { lw: 3 }); break;
    case 'mic': paint(ctx, c => roundRect(c, -16, -40, 32, 54, 16), '#fff', { lw: 6 }); curve(ctx, [-28, 0], [0, 40], [28, 0], 6, OL); line(ctx, [[0, 20], [0, 40]], 6, OL); break;
  }
  ctx.restore();
}

function textOutlined(ctx, txt, X, Y, size, fill, o = {}) {
  ctx.save(); ctx.font = `${o.w || 700} ${size}px ${o.f || F.EN}`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'alphabetic';
  if (o.ol !== false) { ctx.lineWidth = o.olw || size * 0.18; ctx.strokeStyle = o.olc || OL; ctx.lineJoin = 'round'; ctx.strokeText(txt, X, Y); }
  ctx.fillStyle = fill; ctx.fillText(txt, X, Y); ctx.restore();
}

// karaoke caption: words [{w,t0,t1}], t current time (absolute)
function caption(ctx, words, t, Y = 975, who = 'sofia', CX = 960) {
  if (!words || !words.length) return;
  ctx.save(); ctx.font = '700 58px ' + F.EN;
  // wrap into lines of max width
  const maxW = 1250, lines = [[]]; let w = 0;
  const GAP = 22; for (const wd of words) { const ww = ctx.measureText(wd.w).width + GAP; if (w + ww > maxW && lines[lines.length - 1].length) { lines.push([]); w = 0; } lines[lines.length - 1].push({ ...wd, ww }); w += ww; }
  // show only the line containing the current word (two lines max)
  let cur = 0; lines.forEach((ln, i) => { if (ln.length && t >= ln[0].t0 - 0.05) cur = i; });
  const show = lines.slice(Math.max(0, cur - (lines.length > 2 ? 0 : 1)), Math.max(0, cur - (lines.length > 2 ? 0 : 1)) + 2);
  const lh = 74, totalH = show.length * lh;
  const pad = 30; const bw = Math.max(...show.map(l => l.reduce((a, b) => a + b.ww, 0))) + pad * 2;
  const by = Y - totalH / 2 - 20;
  ctx.globalAlpha = 0.92;
  paint(ctx, c => roundRect(c, CX - bw / 2, by, bw, totalH + 30, 34), who === 'gus' ? '#2E6FD8' : '#FFFFFF', { lw: 7 });
  ctx.globalAlpha = 1;
  show.forEach((ln, i) => {
    const lw = ln.reduce((a, b) => a + b.ww, 0); let x0 = CX - lw / 2; const y = by + 15 + lh * i + 56;
    for (const wd of ln) {
      const active = t >= wd.t0 && t < wd.t1 + 0.08, past = t >= wd.t1;
      const k = active ? clamp((t - wd.t0) / 0.12) : 0;
      ctx.save(); ctx.translate(x0 + (wd.ww - GAP) / 2, y - 22); const sc = 1 + 0.08 * Math.sin(k * Math.PI) + (active ? 0.03 : 0); ctx.scale(sc, sc);
      ctx.textAlign = 'center';
      ctx.fillStyle = who === 'gus' ? (active ? '#FFD23F' : '#FFFFFF') : active ? ORANGE : past ? OL : '#9C8A82';
      ctx.fillText(wd.w, 0, 22); ctx.restore();
      x0 += wd.ww;
    }
  });
  ctx.restore();
}

// vocab card. k: 0..1 appear progress, out: 0..1 disappear
function card(ctx, cd, k, out, t) {
  if (k <= 0 || out >= 1) return;
  const a = ease.back(clamp(k)), o = 1 - ease.in(clamp(out));
  ctx.save(); ctx.translate(1420, 228); ctx.scale(0.62 * a * o + 0.0001, 0.62 * a * o + 0.0001); ctx.rotate(-0.025 + Math.sin(t * 2) * 0.008);
  ctx.save(); ctx.globalAlpha = 0.25; paint(ctx, c => roundRect(c, -440 + 14, -230 + 18, 880, 460, 46), '#000', { lw: 0 }); ctx.restore();
  paint(ctx, c => roundRect(c, -440, -230, 880, 460, 46), '#FFFFFF', { lw: 8 });
  ctx.save(); ctx.beginPath(); roundRect(ctx, -440, -230, 880, 460, 46); ctx.clip(); ctx.fillStyle = GREEN; ctx.fillRect(-440, -230, 880, 92); ctx.restore();
  line(ctx, [[-440, -138], [440, -138]], 8, OL);
  textOutlined(ctx, 'NEW PHRASE', -390, -165, 44, '#FFFFFF', { align: 'left', olw: 8 });
  icon(ctx, cd.icon, 370, -184, 0.85);
  textOutlined(ctx, cd.en, 0, -20, cd.en.length > 12 ? 92 : 112, ORANGE, { olw: 14 });
  ctx.font = '40px DejaVu Sans'; ctx.fillStyle = '#8A6A5C'; ctx.textAlign = 'center'; ctx.fillText(cd.ipa, 0, 40);
  ctx.font = '700 50px ' + F.EN; ctx.fillStyle = OL; ctx.fillText('= ' + cd.def, 0, 120);
  if (cd.wrong) {
    const wk = clamp((k - 0.5) * 2);
    if (wk > 0) {
      ctx.save(); ctx.translate(250, 220); ctx.rotate(0.06); ctx.scale(ease.back(wk), ease.back(wk));
      paint(ctx, c => roundRect(c, -210, -46, 420, 92, 24), '#FFE3E3', { lw: 6 });
      ctx.font = '700 44px ' + F.EN; ctx.fillStyle = RED; ctx.textAlign = 'center'; ctx.fillText(cd.wrong, 0, 16);
      line(ctx, [[-150, 0], [170, 0]], 7, RED);
      ctx.restore();
    }
  }
  ctx.restore();
}

// your turn: shows phrase + countdown ring. k = progress 0..1 across the pause
function yourTurn(ctx, phrase, k, t) {
  if (k <= 0 || k >= 1) return;
  const inn = ease.back(clamp(k / 0.15)), out = 1 - ease.in(clamp((k - 0.9) / 0.1));
  const s = inn * out * 0.8;
  ctx.save(); ctx.translate(960, 900); ctx.scale(s, s);
  paint(ctx, c => roundRect(c, -420, -150, 840, 300, 50), ORANGE, { lw: 8 });
  textOutlined(ctx, 'YOUR TURN!', 40, -60, 64, '#FFFFFF', { olw: 12 });
  textOutlined(ctx, phrase, 40, 60, phrase.length > 14 ? 70 : 84, '#FFFFFF', { olw: 13 });
  // ring timer + mic
  ctx.save(); ctx.translate(-330, 0);
  paint(ctx, c => c.arc(0, 0, 66, 0, 7), '#FFFFFF', { lw: 7 });
  ctx.beginPath(); ctx.arc(0, 0, 54, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp((k - 0.1) / 0.8)); ctx.lineWidth = 14; ctx.strokeStyle = GREEN; ctx.lineCap = 'round'; ctx.stroke();
  icon(ctx, 'mic', 0, 2, 0.8 + 0.08 * Math.sin(t * 14));
  ctx.restore();
  ctx.restore();
}

const STEPS = ['eye', 'up', 'tooth', 'shower', 'shirt', 'toast', 'cup', 'door'];
function progress(ctx, done, t, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(40, 30); ctx.scale(0.55, 0.55);
  const y = 80, gap = 118, x0 = 70 + 40;
  paint(ctx, c => roundRect(c, x0 - 70, y - 62, gap * 7 + 140, 124, 62), 'rgba(255,255,255,0.88)', { lw: 6 });
  line(ctx, [[x0, y], [x0 + gap * 7, y]], 10, '#E8D9CC');
  const fillTo = clamp(done) * 7;
  line(ctx, [[x0, y], [x0 + gap * Math.min(7, fillTo), y]], 10, GREEN);
  STEPS.forEach((n, i) => {
    const on = done * 7 >= i - 0.01, x = x0 + i * gap;
    const pop = on ? 1 + 0.25 * Math.max(0, 1 - Math.abs(done * 7 - i) * 3) : 1;
    paint(ctx, c => c.arc(x, y, 42 * pop, 0, 7), on ? '#FFFFFF' : '#F3EAE2', { lw: 6 });
    ctx.save(); if (!on) ctx.globalAlpha = 0.35 * alpha; icon(ctx, n, x, y, 0.62 * pop); ctx.restore();
  });
  ctx.restore();
}
function logo(ctx, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha * 0.9;
  paint(ctx, c => roundRect(c, 1540, 1010, 350, 50, 25), 'rgba(255,255,255,0.85)', { lw: 4 });
  ctx.font = '700 30px ' + F.EN; ctx.fillStyle = ORANGE; ctx.textAlign = 'left'; ctx.fillText('Sofia', 1565, 1046);
  ctx.fillStyle = OL; ctx.fillText('Easy English', 1655, 1046);
  ctx.restore();
}
function tapCursor(ctx, X, Y, s = 1, press = 0) {
  ctx.save(); ctx.translate(X, Y); ctx.scale(s * (1 - press * 0.12), s * (1 - press * 0.12));
  // arrow pointer (not a hand) to avoid any rude-looking gesture
  paint(ctx, c => { c.moveTo(0, 0); c.lineTo(0, 110); c.lineTo(28, 84); c.lineTo(50, 132); c.lineTo(70, 122); c.lineTo(48, 76); c.lineTo(86, 74); c.closePath(); }, '#FFFFFF', { lw: 8 });
  if (press > 0) { ctx.globalAlpha = 1 - press; paint(ctx, c => c.arc(0, 0, 30 + press * 60, 0, 7), 'rgba(255,255,255,0)', { lw: 6, ol: '#FFFFFF' }); }
  ctx.restore();
}
module.exports = { icon, textOutlined, caption, card, yourTurn, progress, logo, tapCursor, STEPS, ORANGE, GREEN, RED, CREAM };
