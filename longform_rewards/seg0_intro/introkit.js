// Long-form "When Paying People Backfired" — cold-open kit (16:9): the six chapter icon cards (rat · vacuum · pudding cup · bank · car plate · emu),
// the number counter on the wall, the rule card and the "thing you wanted" target. Props of earlier episodes are used read-only:
// rats_ep26 (rat), hoover_ep19 (vacuum, plain-text name only), pudding_ep18 (cup prop only, drawn small on a card), emu_ep12 (emu).
const K = require('../../tests/mcd_collage/kit');
const R = require('../../hirkit/rig');
const CL = require('../../hirkit/collage');
const ST = require('../../howitsrun_style/style');
const HK = require('../seg1_hanoi/hanoikit');
const EK = require('../../emu_ep12/emukit');
const HV = require('../../hoover_ep19/hoovkit');
const PD = require('../../pudding_ep18/pudkit');
const { S } = HK;
const { C, F, clamp, lerp, E, rr, hash } = K;
const { INK, fillStroke, ell, px, tube, shade } = R;
const { PAL, txt, fitTxt } = ST;

// ---------- small icons (centred on (0,0), about 200 px) ----------
function bankIcon(ctx) {
  SE_poly(ctx, [[-120, -60], [0, -130], [120, -60]], '#E9E1CE');
  rr(ctx, -110, -62, 220, 18, 4); fillStroke(ctx, '#D8CFBC', 4);
  for (let i = 0; i < 4; i++) { rr(ctx, -92 + i * 56, -44, 30, 120, 4); fillStroke(ctx, '#F4F1E8', 4); }
  rr(ctx, -125, 76, 250, 22, 4); fillStroke(ctx, '#D8CFBC', 4);
  fitTxt(ctx, '$', 0, -72, 40, '#2E3A59', 60);
}
function SE_poly(ctx, pts, fill, lw = 5) { ctx.beginPath(); ctx.moveTo(...pts[0]); for (const p of pts.slice(1)) ctx.lineTo(...p); ctx.closePath(); fillStroke(ctx, fill, lw); }
function carIcon(ctx, t = 0) {
  ctx.save(); ctx.translate(0, -30);
  ctx.beginPath(); ctx.moveTo(-130, 20); ctx.lineTo(-120, -20); ctx.quadraticCurveTo(-80, -26, -60, -60); ctx.lineTo(50, -60); ctx.quadraticCurveTo(80, -26, 125, -18); ctx.lineTo(132, 20); ctx.closePath(); fillStroke(ctx, '#4D8DFF', 5);
  rr(ctx, -52, -52, 46, 30, 4); fillStroke(ctx, '#BFE0FA', 3.5); rr(ctx, 2, -52, 46, 30, 4); fillStroke(ctx, '#BFE0FA', 3.5);
  for (const x of [-75, 75]) { ell(ctx, x, 24, 26, 26); fillStroke(ctx, '#2A2A2E', 4); ell(ctx, x, 24, 10, 10); fillStroke(ctx, '#B9BEC2', 3); }
  ctx.restore();
  ctx.save(); ctx.translate(0, 70); ctx.rotate(-0.03); rr(ctx, -105, -32, 210, 64, 8); fillStroke(ctx, '#FFFDF8', 5); rr(ctx, -95, -24, 190, 12, 3); ctx.fillStyle = PAL.green; ctx.fill(); fitTxt(ctx, '123·ABC', 0, 22, 34, INK, 180); ctx.restore();
}
function iconOf(ctx, kind, t) {
  ctx.save();
  if (kind === 'rat') { ctx.translate(-10, 40); S.rat(ctx, { s: 0.75, look: [0.6, 0], phase: t * 4 }); }
  else if (kind === 'vacuum') { ctx.translate(0, 110); ctx.rotate(0.08); HV.vacuum(ctx, 0.5); }
  else if (kind === 'pudding') { ctx.translate(0, 60); PD.cup(ctx, 1.7, { seed: 3 }); }
  else if (kind === 'bank') { ctx.translate(0, 10); bankIcon(ctx); }
  else if (kind === 'plate') { carIcon(ctx, t); }
  else if (kind === 'emu') { ctx.translate(-20, 150); ctx.scale(0.42, 0.42); EK.emu(ctx, { stride: 0, phase: t * 3, look: [1, 0] }); }
  ctx.restore();
}
// a chapter icon card (w 260 x h 330): icon on top, caption below; u = fly-in 0..1 (from below, with a spin), dim 0..1
function iconCard(ctx, kind, caption, t, u, o = {}) {
  if (u <= 0) return; ctx.save();
  const k = E.out(clamp(u)); ctx.translate(0, (1 - k) * 700); ctx.rotate((1 - k) * 0.6 * (o.dir || 1) + (o.rot || 0)); const sc = E.back(clamp(u), 1.6); ctx.scale(sc, sc);
  const w = 260, h = 330;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 18), PAL.cream, { elev: 1.8 });
  ctx.save(); rr(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, 220, 12); ctx.clip(); ctx.fillStyle = o.bg || '#E9DFC8'; ctx.fillRect(-w / 2, -h / 2, w, 240);
  ctx.translate(0, -h / 2 + 124); ctx.scale(0.62 * (o.iconScale || 1), 0.62 * (o.iconScale || 1)); iconOf(ctx, kind, t); ctx.restore();
  rr(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, 220, 12); ctx.lineWidth = px(ctx, 4); ctx.strokeStyle = INK; ctx.stroke();
  fitTxt(ctx, caption, 0, h / 2 - 34, 40, INK, w - 30);
  if (o.dim) { ctx.fillStyle = `rgba(40,40,46,${0.45 * o.dim})`; rr(ctx, -w / 2, -h / 2, w, h, 18); ctx.fill(); }
  ctx.restore();
}

// ---------- the number counter on the wall (5 flip digits), centre (0,0), 760 x 280 ----------
function counter(ctx, value, t, o = {}) {
  const s = String(Math.max(0, Math.floor(value))).padStart(5, '0').slice(-5);
  CL.cutout(ctx, () => rr(ctx, -380, -140, 760, 280, 22), '#2A2E38', { elev: 1.8 });
  fitTxt(ctx, o.title || 'THE NUMBER', 0, -92, 34, C.yellow, 600);
  for (let i = 0; i < 5; i++) { const x = -280 + i * 140; rr(ctx, x - 58, -62, 116, 170, 12); fillStroke(ctx, '#FFFDF8', 4);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 58, 23); ctx.lineTo(x + 58, 23); ctx.stroke();
    txt(ctx, s[i], x, 66, 130, INK); }
  // coin slot on top
  rr(ctx, -70, -150, 140, 22, 8); fillStroke(ctx, '#171717', 3);
}
// a target (the thing you actually wanted), centre (0,0), radius r
function target(ctx, r) {
  for (let i = 0; i < 4; i++) { ell(ctx, 0, 0, r * (1 - i * 0.24), r * (1 - i * 0.24)); fillStroke(ctx, i % 2 ? PAL.cream : C.red, 5); }
  ctx.save(); ctx.rotate(-0.7); tube(ctx, [[0, 0], [0, -r * 1.3]], 10, '#8A5A34', 3.5); SE_poly(ctx, [[0, -r * 1.3 - 10], [-22, -r * 1.3 + 30], [22, -r * 1.3 + 30]], C.yellow, 3.5); ctx.restore();
}
// a plain paper card with text lines, centred, w x h; u pop
function card(ctx, w, h, u, draw, o = {}) {
  if (u <= 0) return; ctx.save(); const k = E.back(clamp(u), 1.8); ctx.scale(k, k); ctx.rotate(o.rot ?? -0.02);
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 20), o.col || PAL.cream, { elev: 2 }); draw(ctx); ctx.restore();
}

module.exports = { iconCard, iconOf, counter, target, card, bankIcon, carIcon };
