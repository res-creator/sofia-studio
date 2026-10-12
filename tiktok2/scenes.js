// TikTok pilot scenes (1080x1920): pink cafe, Lena (hoodie girl) + Cookie the cat waiter. Level ladder A1 / B1 / C2.
const { TL, mk, talk, life, clamp, lerp, ease, noise1 } = require('./engine');
const { drawCrew } = require('../lib/crew');
const { drawCat } = require('./cat');
const { OL, paint, line, curve, roundRect, hash } = require('../lib/draw');
const U = require('../lib/ui');
const F = require('../lib/fonts');
const GS = require('../lib/anim/gestures');
const W = 1080, H = 1920;
const L = id => TL.lines.find(l => l.id === id);
const PINK = '#F26DA8', PINK_L = '#FBE6EC', GREEN = '#3DAA6E', RED = '#E5484D', BROWN = '#3A221D';
const LV = { A1: { col: '#7BC96F', dark: '#4E9A44', name: 'BEGINNER' }, B1: { col: '#FFA23C', dark: '#D4801F', name: 'INTERMEDIATE' }, C2: { col: '#9B6BFF', dark: '#7448D6', name: 'MASTER' } };
const W2 = (t, a, b) => GS.win(t, a, b, 0.2);
const txt = (c, s, x, y, size, fill, o = {}) => U.textOutlined(c, s, x, y, size, fill, Object.assign({ f: F.RU, w: 800 }, o));

// ---- shared pieces
function stripes(ctx, a = PINK_L, b = '#F8D3E1') {
  ctx.fillStyle = a; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.fillStyle = b;
  for (let i = -20; i < 40; i++) { ctx.beginPath(); ctx.moveTo(i * 120, 0); ctx.lineTo(i * 120 + 60, 0); ctx.lineTo(i * 120 + 60 + H * 0.6, H); ctx.lineTo(i * 120 + H * 0.6, H); ctx.closePath(); ctx.fill(); } ctx.restore();
}
function cafe(ctx, t) {
  stripes(ctx, '#FFF1D8', '#FBE4BE');
  // shelf + window + menu
  paint(ctx, c => roundRect(c, 70, 250, 330, 380, 20), '#BFE4FA', { lw: 8 }); line(ctx, [[235, 250], [235, 630]], 6, '#fff'); line(ctx, [[70, 440], [400, 440]], 6, '#fff');
  paint(ctx, c => roundRect(c, 640, 260, 360, 300, 16), '#2B3A55', { lw: 8 });
  txt(ctx, 'MENU', 820, 330, 54, '#FFD23F', { olw: 0 }); for (let i = 0; i < 4; i++) { line(ctx, [[690, 380 + i * 42], [950, 380 + i * 42]], 6, 'rgba(255,255,255,0.7)'); }
  // counter
  paint(ctx, c => c.rect(0, 1180, W, 760), '#C98A5A', { shade: '#A86B3E', sx: 0, sy: -14, lw: 9 });
  paint(ctx, c => c.rect(0, 1160, W, 44), '#F2D6A8', { lw: 8 });
  for (let i = 0; i < 6; i++) line(ctx, [[i * 220 + 40, 1204], [i * 220 + 40, 1920]], 4, 'rgba(58,34,29,0.18)');
}
function levelBar(ctx, cur, alpha = 1) {
  const L6 = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], pw = 118, gap = 14, x0 = (W - (pw * 6 + gap * 5)) / 2;
  ctx.save(); ctx.globalAlpha = alpha;
  L6.forEach((lv, i) => {
    const on = lv === cur, x = x0 + i * (pw + gap), col = LV[lv] ? LV[lv].col : (lv[0] === 'A' ? '#7BC96F' : lv[0] === 'B' ? '#FFA23C' : '#9B6BFF');
    paint(ctx, c => roundRect(c, x, 58, pw, 54, 27), on ? col : '#FFFFFF', { lw: 6 });
    txt(ctx, lv, x + pw / 2, 97, 34, on ? '#fff' : '#8A7A74', { olw: on ? 6 : 0, ol: on });
  });
  ctx.restore();
}
function watermark(ctx) { ctx.save(); ctx.globalAlpha = 0.75; ctx.font = `700 30px ${F.RU}`; ctx.fillStyle = '#6A4A44'; ctx.textAlign = 'center'; ctx.fillText('@speak_in_english', W / 2, 1768); ctx.restore(); }
// word-synced caption (3-word chunks, active word yellow) — narrator
function caption(ctx, words, t, y = 1400) {
  if (!words || !words.length) return;
  const G = 3, groups = []; for (let i = 0; i < words.length; i += G) groups.push(words.slice(i, i + G));
  let gi = 0; groups.forEach((g, i) => { if (t >= g[0].t0 - 0.05) gi = i; });
  const g = groups[gi], text = g.map(w => w.w).join(' ');
  ctx.save(); ctx.font = `800 70px ${F.RU}`; const tw = ctx.measureText(text).width, sc = Math.min(1, 940 / tw);
  const k = ease.back(clamp((t - g[0].t0 + 0.05) / 0.15)); ctx.translate(W / 2, y); ctx.scale(sc * (0.85 + 0.15 * k), sc * (0.85 + 0.15 * k));
  let x = -tw / 2; ctx.textAlign = 'left';
  g.forEach((w, i) => {
    const s = w.w + (i < g.length - 1 ? ' ' : ''), act = t >= w.t0 && t < w.t1 + 0.1;
    ctx.lineWidth = 16; ctx.strokeStyle = BROWN; ctx.lineJoin = 'round'; ctx.strokeText(s, x, 0); ctx.fillStyle = act ? '#FFD23F' : '#FFFFFF'; ctx.fillText(s, x, 0); x += ctx.measureText(s).width;
  });
  ctx.restore();
}
// white dialogue card: english typed word by word, Russian gloss
const GLOSS = { l01: 'Дайте деньги, пожалуйста!', c01: 'Деньги? ...А! Ладно. Держи.', l02: 'Можно нам счёт, пожалуйста?', c02: 'Конечно! Вот, пожалуйста.',
  l03: 'Позвольте мне простить мою дерзость, но не затруднит ли вас выдать мне вознаграждение?', c03: '...Простите? Хотите десерт?' };
function dialogueCard(ctx, id, t, who, name) {
  const Ln = L(id); if (!Ln) return; const k = ease.back(clamp((t - Ln.t0 + 0.05) / 0.2)); if (k <= 0) return;
  const shown = Ln.words.filter(w => t >= w.t0 - 0.02);
  const full = Ln.words.map(w => w.w).join(' '), cur = shown.map(w => w.w).join(' ');
  ctx.save(); ctx.translate(W / 2, 330); ctx.scale(k, k);
  paint(ctx, c => roundRect(c, -460, -150, 920, 320, 36), '#FFFFFF', { lw: 8 });
  if (name) { paint(ctx, c => roundRect(c, 250, -176, 200, 52, 26), PINK, { lw: 6 }); txt(ctx, name, 350, -138, 32, '#fff', { olw: 6 }); }
  ctx.textAlign = 'left'; let fs = 64; ctx.font = `800 ${fs}px ${F.RU}`;
  const lines = wrap(ctx, full, 860, fs); const fit = lines.length > 3 ? 46 : lines.length > 2 ? 54 : fs; ctx.font = `800 ${fit}px ${F.RU}`;
  const ll = wrap(ctx, full, 860, fit), cl = wrap(ctx, cur, 860, fit); ctx.fillStyle = BROWN;
  ll.forEach((s, i) => { const part = (cl[i] || ''); ctx.fillText(part, -420, -86 + i * (fit * 1.15)); });
  if (GLOSS[id]) { ctx.font = `700 34px ${F.RU}`; ctx.fillStyle = '#E04A8A'; const gl = wrap(ctx, GLOSS[id], 860, 34); gl.slice(0, 3).forEach((s, i) => ctx.fillText(s, -420, 60 + i * 40 + (ll.length - 1) * fit * 0.5)); }
  ctx.restore();
}
function wrap(ctx, s, maxW, fs) { const ws = s.split(' ').filter(Boolean), out = []; let cur = ''; for (const w of ws) { const t2 = cur ? cur + ' ' + w : w; if (ctx.measureText(t2).width > maxW && cur) { out.push(cur); cur = w; } else cur = t2; } if (cur) out.push(cur); return out; }
// lesson card: tab + (✖ strikethrough) + (✔ correct) + gloss
function lessonCard(ctx, k0, tab, bad, good, gloss, extra) {
  const k = ease.back(clamp(k0)); if (k <= 0) return;
  ctx.save(); ctx.translate(W / 2, 360); ctx.scale(k, k);
  paint(ctx, c => roundRect(c, -470, -190, 940, 440, 36), '#FFFFFF', { lw: 8 });
  paint(ctx, c => roundRect(c, -450, -224, 250, 52, 26), LV[tab].col, { lw: 6 }); txt(ctx, tab + ' · УРОК', -325, -186, 30, '#fff', { olw: 6 });
  let y = -110;
  const fitText = (s, size, w) => { ctx.font = `800 ${size}px ${F.RU}`; while (ctx.measureText(s).width > w && size > 24) { size -= 2; ctx.font = `800 ${size}px ${F.RU}`; } return size; };
  if (bad) {
    paint(ctx, c => c.arc(-405, y + 4, 26, 0, 7), RED, { lw: 4 }); line(ctx, [[-416, y - 7], [-394, y + 15]], 6, '#fff'); line(ctx, [[-394, y - 7], [-416, y + 15]], 6, '#fff');
    const sz = fitText(bad, 50, 780); ctx.textAlign = 'left'; ctx.fillStyle = '#7A6A64'; ctx.fillText(bad, -360, y + 18); const tw = ctx.measureText(bad).width; line(ctx, [[-360, y + 2], [-360 + tw, y + 2]], 6, RED);
    ctx.font = `700 28px ${F.RU}`; ctx.fillStyle = '#E04A8A'; ctx.fillText(gloss[0], -360, y + 58); y += 150;
  }
  if (good) {
    paint(ctx, c => c.arc(-405, y + 4, 26, 0, 7), GREEN, { lw: 4 }); line(ctx, [[-418, y + 4], [-408, y + 14], [-390, y - 8]], 7, '#fff');
    const sz = fitText(good, 56, 780); ctx.textAlign = 'left'; ctx.fillStyle = BROWN; ctx.fillText(good, -360, y + 20);
    ctx.font = `700 30px ${F.RU}`; ctx.fillStyle = '#E04A8A'; ctx.fillText(gloss[1] || '', -360, y + 66);
    if (extra) { paint(ctx, c => roundRect(c, -360, y + 90, 560, 48, 24), '#FFE9F2', { lw: 4 }); ctx.font = `700 28px ${F.RU}`; ctx.fillStyle = BROWN; ctx.textAlign = 'center'; ctx.fillText(extra, -80, y + 124); }
  }
  ctx.restore();
}
function splash(ctx, lv, k, t) { // level splash: green/orange/purple sunburst + giant level
  const a = clamp(k * 6), o = 1 - clamp((k - 0.88) / 0.12); if (a <= 0 || o <= 0) return;
  ctx.save(); ctx.globalAlpha = Math.min(a, o); ctx.fillStyle = LV[lv].col; ctx.fillRect(0, 0, W, H);
  ctx.translate(W / 2, H / 2); ctx.rotate(t * 0.4); for (let i = 0; i < 18; i++) { ctx.rotate(Math.PI / 9); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1800, -140); ctx.lineTo(1800, 140); ctx.closePath(); ctx.fillStyle = i % 2 ? LV[lv].dark : LV[lv].col; ctx.globalAlpha = 0.35 * Math.min(a, o); ctx.fill(); }
  ctx.restore(); ctx.save(); ctx.globalAlpha = Math.min(a, o); const s = ease.back(clamp(k * 3.2)); ctx.translate(W / 2, H / 2 - 20); ctx.rotate(-0.05); ctx.scale(s, s);
  txt(ctx, 'уровень', 0, -190, 56, '#FFFFFF', { olw: 0 }); txt(ctx, lv, 0, 110, 330, '#FFFFFF', { olw: 40 }); txt(ctx, LV[lv].name, 0, 220, 64, 'rgba(255,255,255,0.8)', { olw: 0 }); ctx.restore();
}
function burst(ctx, X, Y, s, k, col = '#FFD23F', rot = -0.08, size = 1) { require('../lib/props').burst(ctx, X, Y, s, k, col, rot, size); }

// ---- characters
const LENA = { x: 270, hip: 1330, s: 1.3 }, CAT = { x: 830, y: 930, s: 1.2 };
function lena(ctx, t, pose, seed = 3) {
  const lf = life(t, seed), lvl = talk('lena', t), p = Object.assign({}, pose);
  p.blink = Math.max(p.blink || 0, lf.blink); p.bob = (p.bob || 0) + lf.bob;
  const m = Object.assign({ open: 0, smile: 0.5, w: 1 }, pose.mouth || {}); if (lvl > 0.02) { m.open = Math.max(m.open, clamp(lvl * 0.7)); }
  p.mouth = m; p.tilt = (p.tilt || 0) + Math.sin(t * 0.9 + seed) * 0.012 + (lvl > 0.05 ? noise1(t * 1.5 + 3) * 0.03 : 0);
  drawCrew(ctx, LENA.x + (pose.dx || 0), LENA.hip + (pose.dy || 0), LENA.s, p, 'lena');
}
function cat(ctx, t, pose, seed = 5) {
  const lf = life(t, seed), lvl = talk('cat', t), p = Object.assign({}, pose);
  p.blink = Math.max(p.blink || 0, lf.blink); p.mouth = Math.max(pose.mouth || 0, clamp(lvl * 1.1)); p.tilt = (p.tilt || 0) + Math.sin(t * 0.8 + seed) * 0.015;
  p.ears = Math.sin(t * 3 + seed) * 0.25 + (pose.ears || 0);
  drawCat(ctx, CAT.x + (pose.dx || 0), CAT.y + (pose.dy || 0) + Math.sin(t * 2) * 3, CAT.s, p);
}
const bill = (c, X, Y, s = 1, rot = 0, col = '#6FCF7F') => { c.save(); c.translate(X, Y); c.rotate(rot); c.scale(s, s); paint(c, q => roundRect(q, -70, -34, 140, 68, 8), col, { shade: '#4EAF60', sx: 3, sy: 3, lw: 5 }); c.beginPath(); c.arc(0, 0, 20, 0, 7); c.lineWidth = 4; c.strokeStyle = '#2E7D40'; c.stroke(); txt(c, '$', 0, 11, 30, '#2E7D40', { olw: 0 }); c.restore(); };
const receipt = (c, X, Y, s = 1, rot = 0) => { c.save(); c.translate(X, Y); c.rotate(rot); c.scale(s, s); paint(c, q => roundRect(q, -62, -80, 124, 160, 8), '#FFFFFF', { shade: '#EFE6D8', sx: 4, sy: 4, lw: 6 }); txt(c, 'BILL', 0, -42, 28, RED, { olw: 0 }); for (let i = 0; i < 4; i++) line(c, [[-40, -10 + i * 24], [40, -10 + i * 24]], 5, '#B9A99A'); c.restore(); };
const cake = (c, X, Y, s = 1) => { c.save(); c.translate(X, Y); c.scale(s, s); paint(c, q => q.ellipse(0, 0, 100, 26, 0, 0, 7), '#FFFFFF', { lw: 6 }); paint(c, q => roundRect(q, -70, -90, 140, 90, 18), '#F7C2D8', { shade: '#E3A0BC', sx: 0, sy: -8, lw: 6 }); paint(c, q => roundRect(q, -70, -90, 140, 28, 14), '#FFFFFF', { lw: 5 }); line(c, [[0, -92], [0, -130]], 6, '#7ED0F2'); paint(c, q => q.ellipse(0, -144, 8, 14, 0, 0, 7), '#FFB020', { lw: 4 }); c.fillStyle = '#E5484D'; c.beginPath(); c.arc(40, -96, 12, 0, 7); c.fill(); c.restore(); };
function tray(c, X, Y, s = 1) { c.save(); c.translate(X, Y); c.scale(s, s); paint(c, q => q.ellipse(0, 0, 130, 22, 0, 0, 7), '#C9D1DC', { shade: '#9DA7B6', sx: 0, sy: -5, lw: 6 }); c.restore(); }

// =========================================================== scenes
const hook = (() => {
  const { m } = mk('hook'), Ln = L('n01');
  const wt = i => Ln.words[Math.min(i, Ln.words.length - 1)].t0;
  return {
    sfx: [['n01', 0, 'whoosh'], ['n01', 5.2, 'quizjingle']],
    draw(ctx, t) {
      stripes(ctx);
      // title words pop in sync with the voice
      const lines = [['КАК ТЫ', 0], ['ПРОСИШЬ', 2], ['СЧЁТ', 3], ['В КАФЕ', 4], ['НА АНГЛИЙСКОМ?', 6]];
      lines.forEach(([s, wi], i) => { const k = ease.back(clamp((t - wt(Math.min(wi, Ln.words.length - 1))) / 0.25)); if (k <= 0) return; ctx.save(); ctx.translate(W / 2, 330 + i * 120); ctx.scale(k, k); txt(ctx, s, 0, 0, s.length > 9 ? 84 : 108, s === 'СЧЁТ' ? PINK : BROWN, { olw: s === 'СЧЁТ' ? 22 : 0, olc: '#fff', ol: s === 'СЧЁТ' }); ctx.restore(); });
      const k2 = ease.back(clamp((t - wt(Math.max(0, Ln.words.length - 3))) / 0.3)); if (k2 > 0) { ctx.save(); ctx.translate(W / 2, 1010); ctx.scale(k2, k2); ctx.rotate(-0.03); paint(ctx, c => roundRect(c, -400, -60, 800, 120, 40), PINK, { lw: 8 }); txt(ctx, 'ПО ФРАЗЕ ВИДНО УРОВЕНЬ', 0, 20, 52, '#fff', { olw: 8 }); ctx.restore(); }
      // characters bottom: Lena waves, cat rolls a bill
      ctx.save(); ctx.translate(0, 700); ctx.scale(0.8, 0.8);
      cafe2(ctx);
      lena(ctx, t, { turn: 0.1, look: [0.6, 0], mouth: { smile: 0.9 }, ...GS.compose(t, 3, 'c', [{ k: W2(t, 0.5, 5), g: k => GS.wave(1, k, t, 0, 'c') }]) });
      cat(ctx, t, { glasses: true, look: -0.5 });
      ctx.restore();
      watermark(ctx);
    },
  };
  function cafe2(c) { /* small counter strip for the hook */ paint(c, q => q.rect(-100, 1180, W + 200, 760), '#C98A5A', { lw: 9 }); paint(c, q => q.rect(-100, 1160, W + 200, 44), '#F2D6A8', { lw: 8 }); }
})();

function levelScene(id, lv, o) {
  const { m, S } = mk(id);
  const spl = () => m('splash'), splEnd = () => m(o.nar1 + '_end');
  const lensStart = L(o.lena).t0;
  return {
    sfx: [['splash', 0, 'whoosh'], ['splash', 0.15, 'pop'], ...o.sfx],
    sfxAt: o.sfxAt ? o.sfxAt : () => [],
    draw(ctx, t) {
      cafe(ctx, t);
      const punch = 1 + 0.025 * Math.max(0, 1 - Math.abs(((t - lensStart) % 100)) * 3);
      ctx.save(); ctx.translate(W / 2, H / 2); const z = 1 + 0.03 * ease.out(clamp((t - spl()) / 12)); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
      o.world(ctx, t, m);
      ctx.restore();
      levelBar(ctx, lv);
      // dialogue cards while the characters speak
      const lenaOn = t >= L(o.lena).t0 - 0.05 && t < L(o.cat).t0 - 0.05, catOn = t >= L(o.cat).t0 - 0.05 && t < L(o.nar2).t0 - 0.05;
      if (lenaOn || (t >= L(o.lena).t0 && t < L(o.cat).t0)) dialogueCard(ctx, o.lena, t, 'lena', null);
      if (catOn) dialogueCard(ctx, o.cat, t, 'cat', 'COOKIE');
      // lesson card + verdict caption
      if (t >= L(o.nar2).t0 - 0.05) { o.lesson(ctx, clamp((t - L(o.nar2).t0 + 0.05) / 0.25)); caption(ctx, L(o.nar2).words, t, 1420); }
      splash(ctx, lv, clamp((t - spl()) / (L(o.nar1).t1 - spl() + 0.25)), t);
      watermark(ctx);
    },
  };
}
const a1 = levelScene('a1', 'A1', {
  nar1: 'n02', lena: 'l01', cat: 'c01', nar2: 'n03',
  sfx: [['cash', 0, 'cash'], ['cash', 0.12, 'cash'], ['cash', 0.7, 'sparkle']],
  lesson: (ctx, k) => lessonCard(ctx, k, 'A1', 'Money, please!', null, ['звучит как «дайте деньги!»']),
  world(ctx, t, m) {
    const cash = clamp((t - m('cash')) / 0.8), got = t >= m('cash') + 0.8, happy = got;
    const gt = L('l01');
    lena(ctx, t, { turn: 0.15, look: [0.7, 0], wide: t >= m('cash') && t < m('cash') + 0.9 ? 0.8 : 0, brow: { l: 0.4, r: 0.4 }, mouth: { smile: happy ? 1 : 0.6 },
      ...GS.compose(t, 3, 'c', [{ k: W2(t, gt.t0, gt.t1 + 0.4), g: k => GS.reachOut(1, k, t, 0, 'c') }, { k: W2(t, m('cash') + 0.7, m('cash') + 3.4), g: k => GS.raise(-1, k, t, 0, 'c', 120) }]) });
    cat(ctx, t, { look: -0.5, brow: t >= L('c01').t0 && t < m('cash') ? 0.8 : 0, glasses: false });
    // cash stack flutters from the cat's vest to Lena
    if (cash > 0) for (let i = 0; i < 7; i++) { const u = clamp(cash * 1.3 - i * 0.08), e = ease.out(u); if (u <= 0) continue; bill(ctx, lerp(CAT.x, LENA.x + 190, e) + Math.sin(u * 8 + i) * 18, lerp(1080, 960 + (i % 3) * 40, e) - Math.sin(u * Math.PI) * 150, 0.9, Math.sin(u * 6 + i) * 0.6); }
    if (got) for (let i = 0; i < 3; i++) bill(ctx, LENA.x - 270 + Math.sin(t * 3 + i) * 8, 800 - i * 26, 0.8, 0.2 - i * 0.1);
    if (t >= m('cash') && t < m('cash') + 1.2) burst(ctx, 800, 1010, '$$$', clamp((t - m('cash')) / 1.1), '#FFD23F', 0.06, 0.55);
  },
});
const b1 = levelScene('b1', 'B1', {
  nar1: 'n04', lena: 'l02', cat: 'c02', nar2: 'n05',
  sfx: [['bill', 0, 'flip'], ['bill', 0.5, 'ding'], ['n05', 0.5, 'correct']],
  lesson: (ctx, k) => lessonCard(ctx, k, 'B1', null, 'Could we have the bill, please?', ['', '= Можно нам счёт, пожалуйста?'], 'bill (UK) = check (US)'),
  world(ctx, t, m) {
    const r = clamp((t - m('bill')) / 0.8), e = ease.out(r);
    const l = L('l02');
    lena(ctx, t, { turn: 0.15, look: [0.7, 0], mouth: { smile: 0.8 }, ...GS.compose(t, 3, 'c', [{ k: W2(t, l.t0, l.t1 + 0.5), g: k => GS.hold(1, k, t, 0, 'c') }, { k: W2(t, m('bill') + 0.4, m('bill') + 3), g: k => GS.reachOut(1, k, t, 0, 'c') }]) });
    cat(ctx, t, { look: -0.5, mouth: 0 });
    if (r > 0) { tray(ctx, lerp(CAT.x, LENA.x + 230, e), lerp(1135, 1135, e), 1); receipt(ctx, lerp(CAT.x, LENA.x + 230, e), lerp(1135, 1100, e) - 26, 0.9, lerp(0.4, -0.1, e)); }
    if (t >= m('bill') + 0.5 && t < m('bill') + 1.7) burst(ctx, 800, 1010, 'DING!', clamp((t - m('bill') - 0.5) / 1.1), '#7ED8A0', 0.05, 0.5);
  },
});
const c2 = levelScene('c2', 'C2', {
  nar1: 'n06', lena: 'l03', cat: 'c03', nar2: 'n07',
  sfx: [['cake', 0, 'pop'], ['cake', 0.3, 'ding'], ['cake', 0.9, 'sadhonk']],
  lesson: (ctx, k) => lessonCard(ctx, k, 'C2', 'I trust you shall forgive my impertinence...', 'Can I have the bill, please?', ['красиво, но никто не понял', '= Можно счёт, пожалуйста?']),
  world(ctx, t, m) {
    const l = L('l03'), sad = t >= m('cake');
    lena(ctx, t, { turn: 0.05, tilt: -0.07, look: [0.4, -0.5], sleepy: sad ? 0.9 : 0.35, brow: { l: -0.2, r: 0.5 }, mouth: { smile: sad ? -0.4 : 0.25 },
      ...GS.compose(t, 3, 'c', [{ k: W2(t, l.t0, l.t1 + 0.3), g: k => GS.raise(1, k, t, 0, 'c', 110) }, { k: sad ? 1 : 0, g: k => GS.shrug(t, k, 0, 'c') }]) });
    // monocle + chain
    ctx.save(); ctx.translate(LENA.x + 34 * LENA.s, LENA.hip - 521 * LENA.s); ctx.beginPath(); ctx.arc(0, 0, 40, 0, 7); ctx.lineWidth = 7; ctx.strokeStyle = '#C79A2A'; ctx.stroke(); line(ctx, [[30, 30], [50, 200]], 4, '#C79A2A'); ctx.restore();
    cat(ctx, t, { look: -0.4, brow: -0.5, tilt: t >= L('c03').t0 ? 0.07 : 0, ears: t >= L('c03').t0 ? 0.6 : 0 });
    const r = clamp((t - m('cake')) / 0.5); if (r > 0) cake(ctx, lerp(CAT.x, LENA.x + 240, ease.out(r)), 1135 - Math.sin(r * Math.PI) * 120, 1.05);
    if (t >= m('cake') && t < m('cake') + 1.3) burst(ctx, 800, 1010, 'ТОРТ?!', clamp((t - m('cake')) / 1.2), '#FF9ACB', 0.05, 0.55);
  },
});
const outro = (() => {
  const { m, t1 } = mk('outro'), Ln = L('n08'), s0 = Ln.t0;
  return {
    sfx: [['n08', 0, 'quizjingle'], ['end', 0, 'sparkle']],
    sfxAt: () => [0, 1, 2].map(i => ({ t: s0 + 1.0 + i * 0.5, name: 'pop', g: 0.7 })),
    draw(ctx, t) {
      stripes(ctx);
      txt(ctx, 'А КАК ТЫ', W / 2, 250, 100, BROWN, { olw: 0 }); txt(ctx, 'ПРОСИШЬ?', W / 2, 370, 110, PINK, { olw: 22, olc: '#fff' });
      const items = [['Money, please!', 'A1', 0, true], ['Could we have the bill, please?', 'B1', 1, false], ['Can I have the bill, please?', 'C2', 2, false]];
      items.forEach(([s, lv, i, bad]) => { const k = ease.back(clamp((t - s0 - 1.2 - i * 0.5) / 0.3)); if (k <= 0) return; ctx.save(); ctx.translate(W / 2, 560 + i * 120); ctx.scale(k, k);
        paint(ctx, c => roundRect(c, -440, -48, 880, 96, 48), i === 1 ? '#FFD1E5' : '#FFFFFF', { lw: 7 }); paint(ctx, c => roundRect(c, -430, -38, 90, 76, 38), LV[lv].col, { lw: 5 }); txt(ctx, lv, -385, 14, 36, '#fff', { olw: 6 });
        ctx.font = `800 38px ${F.RU}`; ctx.fillStyle = bad ? '#8A7A74' : BROWN; ctx.textAlign = 'left'; ctx.fillText(s, -320, 14); if (bad) { const tw = ctx.measureText(s).width; line(ctx, [[-320, 4], [-320 + tw, 4]], 5, RED); } ctx.restore(); });
      const ck = ease.back(clamp((t - s0 - 2.8) / 0.3)); if (ck > 0) { ctx.save(); ctx.translate(W / 2, 960); ctx.scale(ck, ck); txt(ctx, 'ПИШИ В КОММЕНТЫ', 0, 0, 56, BROWN, { olw: 0 }); paint(ctx, c => { c.moveTo(-26, 30); c.lineTo(26, 30); c.lineTo(0, 62); c.closePath(); }, PINK, { lw: 5 }); ctx.restore(); }
      const bk = ease.back(clamp((t - s0 - 3.6) / 0.3)); if (bk > 0) { const pressed = t > m('end'); ctx.save(); ctx.translate(W / 2, 1090); ctx.scale(bk, bk); paint(ctx, c => roundRect(c, -260, -64, 520, 128, 64), pressed ? '#9C8A82' : GREEN, { lw: 8 }); txt(ctx, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 18, 56, '#fff', { olw: 9 }); ctx.restore(); U.tapCursor(ctx, lerp(760, 560, ease.out(clamp((t - s0 - 4) / 0.5))), lerp(1260, 1120, ease.out(clamp((t - s0 - 4) / 0.5))), 1, clamp((t - m('end') + 0.2) / 0.2)); }
      ctx.save(); ctx.translate(0, 930); ctx.scale(0.7, 0.7); paint(ctx, c => c.rect(-100, 1180, W + 200, 760), '#C98A5A', { lw: 9 }); paint(ctx, c => c.rect(-100, 1160, W + 200, 44), '#F2D6A8', { lw: 8 });
      lena(ctx, t, { turn: 0.1, mouth: { smile: 1 }, look: [0, 0], ...GS.compose(t, 3, 'c', [{ k: 1, g: k => GS.raise(1, k, t, 0, 'c', 150) }]) }); cat(ctx, t, { glasses: true, look: -0.3 }); ctx.restore();
      if (t > t1 - 0.4) { ctx.fillStyle = `rgba(0,0,0,${clamp((t - t1 + 0.4) / 0.4)})`; ctx.fillRect(0, 0, W, H); }
      watermark(ctx);
    },
  };
})();
module.exports = { hook, a1, b1, c2, outro };
