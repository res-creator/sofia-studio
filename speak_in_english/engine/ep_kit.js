// Shared building blocks for per-episode renderers (additive; older episodes keep their own copies).
// Usage: const K = require('./ep_kit')(TL, UI);
const Hq = require('./hq');
const { clamp, lerp, P, eOut, eIO, eBack, human } = Hq;
module.exports = function makeKit(TL, UI) {
  const { SC, SP, C, LVCOL } = UI; const W = 1080, HH = 1920, FPS = TL.fps || 30;
  const talk = (who, t) => { let a = 0; for (const s of TL.speech) if (s.who === who && t >= s.t && t < s.t + s.d) { const i = Math.floor((t - s.t) * FPS); a = Math.max(a, s.env[Math.min(i, s.env.length - 1)] || 0); } return a; };
  const speaking = (id, t, pre = 0, post = 0) => SP[id] && t >= SP[id].t - pre && t < SP[id].t + SP[id].d + post;
  const endOf = id => SP[id].t + SP[id].d;
  const EV = k => { for (const L of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) { const e = ((SC[L] || {}).ev || {})[k]; if (e !== undefined) return e; } return 1e9; };
  const wordT = (id, w) => { const s = SP[id]; if (!s) return null; const x = s.words.find(q => q[0].toLowerCase().replace(/[«»!?.,:]/g, '').startsWith(w)); return x ? s.t + x[1] : null; };
  function put(c, cfg, st, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); const r = human(c, cfg, st); c.restore(); return { x: x + r.head.x * s, y: y + r.head.y * s, hh: r.hh * s, r }; }
  // title ribbon from cfg.hook_title at (x, y)
  function titleRibbon(c, t, x = 540, y = 470) {
    const rk2 = lerp(0.92, 1, eBack(P(t, 0.1, 0.45), 1.8)) * (1 + 0.012 * Math.sin(t * 5));
    c.save(); c.translate(x, y); c.rotate(-0.05); c.scale(rk2, rk2);
    const lines = TL.cfg.hook_title; c.fillStyle = 'rgba(0,0,0,.22)'; UI.rr(c, -500 + 10, -150 + 14, 1000, 300, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; UI.rr(c, -500, -150, 1000, 300, 30); c.fill(); c.stroke();
    c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 900); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -78); UI.textFit(c, 'Unb9', 110, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 8, C.pink, C.white, 12); UI.textFit(c, 'Unb9', 64, lines[2][0], 900); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 98);
    c.restore();
  }
  // "ПРОВЕРИМ!" stamp at the hook's stamp word
  function stamp(c, t) {
    const stT = SC.hook.stamp_t, sk = P(t, stT - 0.02, stT + 0.15);
    if (sk > 0) { const s2 = lerp(2.6, 1, eOut(sk)); c.save(); c.translate(540, 1745); c.rotate(-0.13); c.scale(s2, s2); c.globalAlpha = clamp(sk * 3); c.fillStyle = 'rgba(255,253,248,.92)'; UI.rr(c, -380, -90, 760, 180, 24); c.fill(); c.strokeStyle = C.pink; c.lineWidth = 14; UI.rr(c, -380, -90, 760, 180, 24); c.stroke(); UI.textFit(c, 'Unb9', 110, TL.cfg.stamp, 700); c.fillStyle = C.pink; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(TL.cfg.stamp, 0, 6); c.restore(); }
  }
  // speech bubbles for every on-screen line of the scene; o = { names: {who: [label, col]}, heroine: 'her', hold: {id: s} }
  function bubbles(c, t, sc, heads, proj, o = {}) {
    const l = sc.id.toLowerCase(), hero = o.heroine || 'her';
    const lineIds = TL.speech.filter(x => x.id.startsWith(l + '_') && x.who !== 'nar' && x.who !== 'tip');
    const holdFor = sp => { if (o.hold && o.hold[sp.id] !== undefined) return o.hold[sp.id]; const i = lineIds.indexOf(sp); const nx = lineIds[i + 1]; return nx ? Math.max(0.05, Math.min(0.9, nx.t - (sp.t + sp.d) - 0.25)) : 0.9; };
    for (const sp of lineIds) { const hd = heads[sp.who]; if (!hd) continue;
      if (sp.who === hero) UI.bubble(c, { ...sp, hold: holdFor(sp) }, t, proj({ x: hd.x - 30, y: hd.y - hd.hh * 1.25 }), 'left');
      else UI.bubble(c, { ...sp, hold: holdFor(sp) }, t, proj({ x: hd.x + 30, y: hd.y - hd.hh * 1.25 }), 'right', (o.names || {})[sp.who]); }
  }
  // big pop-in caption (БА-ДУМ-ТСС!, +£15 ...)
  function pop(c, t, txt, t0, t1, x, y, col = C.gold, rot = -0.08, sz = 84) { const k = eBack(P(t, t0, t0 + 0.25), 2.4) * (1 - P(t, t1, t1 + 0.3)); if (k > 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(k, k); UI.font(c, 'Unb9', sz); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, txt, 0, 0, col, C.oliveD, 16); c.restore(); } }
  // "..." during a silent beat between a and b
  function dots(c, t, a, b, y = 1450, step = 0.55) { if (t > a && t < b) { const n = Math.min(3, Math.floor((t - a) / step) + 1); c.save(); c.globalAlpha = clamp((t - a) / 0.2) * clamp((b - t) / 0.15); UI.font(c, 'Unb9', 150); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '.'.repeat(n).padEnd(3, ' '), 540, y, C.white, C.oliveD, 16); c.restore(); } }
  // outro: o = { q: [line1, line2], rows: [[lvl, phrase]], cta: [line1, line2], hero: (c, t) => draws heroine at origin, heroY: [from, to], heroS }
  function outro(c, t, o) {
    const s = SC.outro.s, u = t - s, sp = SP.outro; const { textFit, strokeText, font, rr: R } = UI;
    c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
    c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
    if (o.hero) { const hy = o.heroY || [2300, 1900]; c.save(); c.translate(o.heroX || 190, lerp(hy[0], hy[1], eBack(P(u, 0.4, 0.9), 1.4))); c.scale(o.heroS || 0.42, o.heroS || 0.42); o.hero(c, t); c.restore(); }
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const q = eBack(P(u, 0.25, 0.6), 2.2);
    c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', o.qSize || 54); strokeText(c, o.q[0], 0, -50, C.oliveD, C.white, 14); strokeText(c, o.q[1], 0, 36, C.pink, C.white, 14); c.restore();
    const k = eBack(P(u, 0.7, 1.1), 1.8), n = o.rows.length, bh = 140 + n * 115;
    if (k > 0) { c.save(); c.translate(540, 740); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.14)'; R(c, -470 + 8, -bh / 2 + 12, 940, bh, 34); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; R(c, -470, -bh / 2, 940, bh, 34); c.fill(); c.stroke();
      font(c, 'Unb9', 38); c.fillStyle = C.pink; c.textAlign = 'left'; c.fillText('ШПАРГАЛКА', -420, -bh / 2 + 45);
      o.rows.forEach(([lv, ph], i) => { const y = -bh / 2 + 150 + i * 115, kk = eBack(P(u, 1.0 + i * 0.18, 1.35 + i * 0.18), 2.2); if (kk <= 0) return; c.save(); c.translate(0, y); c.scale(kk, kk); c.fillStyle = LVCOL[lv]; R(c, -430, -34, 82, 68, 18); c.fill(); font(c, 'Unb9', 30); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(lv, -389, 3); textFit(c, 'Nun9', 46, ph, 740); c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(ph, -320, 3); c.restore(); });
      c.restore(); }
    const by = 740 + bh / 2 + 140, bk = eBack(P(u, 2.4, 2.8), 2.2);
    if (bk > 0) { c.save(); c.translate(540, by); c.scale(bk, bk); c.fillStyle = C.gold; R(c, -450, -50, 420, 100, 50); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); font(c, 'Unb9', 34); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', -240, 3);
      c.fillStyle = '#4CAF6A'; R(c, 10, -50, 440, 100, 50); c.fill(); c.strokeStyle = C.oliveD; c.stroke(); c.fillStyle = C.white; font(c, 'Unb9', 24); c.fillText(o.cta[0], 230, -12); c.fillText(o.cta[1], 230, 20); c.restore(); }
    const ak = eOut(P(t, sp.t + 1.3, sp.t + 1.6));
    if (ak > 0) { c.save(); c.globalAlpha = ak; c.translate(600, by + 140 + Math.sin(t * 7) * 8); font(c, 'Unb9', 40); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('ПИШИ В КОММЕНТЫ', 0, 0); c.fillStyle = C.pink; c.beginPath(); c.moveTo(-34, 40); c.lineTo(34, 40); c.lineTo(0, 84); c.fill(); c.restore(); }
    const subT = (wordT('outro', 'подпиш') || sp.t + 4.0) - 0.35, sy = by + 380;
    const sk = eBack(P(t, subT, subT + 0.3), 2);
    if (sk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(660, sy); const ss = sk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = pressed ? C.olive : C.pink; R(c, -250, -58, 500, 116, 58); c.fill(); font(c, 'Unb9', 42); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
      const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(920, 730, mv), lerp(sy + 180, sy + 30, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  }
  // standard overlay stack drawn after the world for a level scene
  function hud(c, t, sc) { UI.card(c, t, sc); UI.captions(c, t); UI.sparkles(c, t); Hq.grain(c, W, HH, t, 0.04); UI.levelBar(c, t, sc, 1); UI.watermark(c); UI.levelIntro(c, t, sc); UI.levelIntroNext(c, t); }
  return { talk, speaking, endOf, EV, wordT, put, titleRibbon, stamp, bubbles, pop, dots, outro, hud };
};
