// "Pay me back" (friend on holiday owes money) episode renderer: node repay.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/repay/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
const HER = { ...BASE.her_london, top: { type: 'hoodie', col: '#9AA3B2' }, bottom: { type: 'joggers', col: '#3B4A6A' } };
const BECKY = { ...BASE.linda, hair: { style: 'long', col: '#F2C14E' }, top: { type: 'tank', col: '#FF7A9A' } };
const G = { her: geom(HER), becky: geom(BECKY) };
const FY = 60, HERX = -280, CAMX = 60, WIN = { x: 500, y: 640, w: 560, h: 760 };
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- rainy living room (prerendered)
const BX0 = -1600, BY0 = -3000, BW = 3200, BH = 3700, BS = 0.5;
function drawRoom(c) { c.fillStyle = '#C9C4D6'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = '#B4AFC4'; c.fillRect(BX0, -600, BW, 660);
  c.fillStyle = '#FFFFFF'; c.fillRect(-1150, -2300, 760, 1000); c.fillStyle = '#6A7385'; c.fillRect(-1120, -2270, 700, 940); c.strokeStyle = 'rgba(200,215,235,.6)'; c.lineWidth = 4; for (let i = 0; i < 60; i++) { const x = -1110 + hash(i) * 680, y = -2260 + hash(i * 3) * 880; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 14, y + 50); c.stroke(); } c.fillStyle = '#FFFFFF'; c.fillRect(-780, -2270, 20, 940);
  c.fillStyle = '#8A93A2'; paint(c, q => q.e(-930, -2150, 150, 60), '#9AA3B2', { sd: 3, hd: 2, lw: 2 });
  paint(c, q => { q.m(-1500, -700); q.l(-200, -700); q.l(-200, -250); q.l(-1500, -250); q.z(); }, '#7A5BC6', { sd: 8, hd: 4, lw: 3 }); paint(c, q => { q.m(-1500, -250); q.l(-200, -250); q.l(-200, FY); q.l(-1500, FY); q.z(); }, '#6A4BB6', { sd: 6, hd: 3, lw: 3 });
  const fg = c.createLinearGradient(0, FY, 0, 700); fg.addColorStop(0, '#8A7A6A'); fg.addColorStop(1, '#6A5A4A'); c.fillStyle = fg; c.fillRect(BX0, FY, BW, BY0 + BH - FY); }
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; drawRoom(c); }

// ---------------- props
const phoneItem = ctx => { ctx.rotate(0); ctx.fillStyle = '#2B2F3A'; rr(ctx, -34, -120, 68, 120, 10); ctx.fill(); ctx.fillStyle = '#9FD8F2'; rr(ctx, -28, -112, 56, 100, 6); ctx.fill(); };
function beach(c, w, h, t, scroll = 0) { const sky = c.createLinearGradient(0, 0, 0, h * 0.55); sky.addColorStop(0, '#7CC8F2'); sky.addColorStop(1, '#CDEBFA'); c.fillStyle = sky; c.fillRect(0, 0, w, h); c.fillStyle = '#FFE08A'; c.beginPath(); c.arc(w * 0.8, h * 0.14, 50, 0, TAU); c.fill();
  c.fillStyle = '#2FA7C8'; c.fillRect(0, h * 0.45, w, h * 0.25); c.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 8; i++) { const x = ((i * 120 - scroll * 600 + t * 30) % (w + 120) + w + 120) % (w + 120) - 60; c.fillRect(x, h * 0.5 + (i % 3) * 30, 60, 6); }
  c.fillStyle = '#F2D59A'; c.fillRect(0, h * 0.7, w, h * 0.3); const px = ((40 - scroll * 900) % (w + 300) + w + 300) % (w + 300) - 100; c.fillStyle = '#8A5A3A'; c.fillRect(px, h * 0.25, 18, h * 0.47); c.fillStyle = '#3C8A4A'; for (let i = 0; i < 5; i++) { c.save(); c.translate(px + 9, h * 0.25); c.rotate(-1.4 + i * 0.7); c.beginPath(); c.ellipse(60, 0, 70, 16, 0, 0, TAU); c.fill(); c.restore(); } }
function cocktail(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => { q.m(-70, -200); q.l(70, -200); q.l(30, -60); q.l(-30, -60); q.z(); }, '#FF9A3C', { sd: 4, hd: 2, lw: 3 }); c.fillStyle = '#E9EEF2'; c.fillRect(-6, -60, 12, 60); c.fillRect(-40, -4, 80, 8); c.strokeStyle = '#E0474C'; c.lineWidth = 6; c.beginPath(); c.moveTo(20, -200); c.lineTo(60, -300); c.stroke(); paint(c, q => { q.m(-80, -230); q.q(-20, -310, 50, -250); q.z(); }, '#4CAF6A', { sd: 2, hd: 1, lw: 3 }); c.restore(); }
function jetski(c, w, h, t) { c.save(); c.translate(w * 0.5, h * 0.68 + Math.sin(t * 9) * 8); paint(c, q => { q.m(-230, 0); q.l(220, 0); q.q(260, -40, 200, -70); q.l(-180, -70); q.z(); }, '#F2C14E', { sd: 5, hd: 3, lw: 3 }); c.fillStyle = '#E0474C'; c.fillRect(-120, -110, 160, 40); c.fillStyle = '#FFFFFF'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-260 - i * 40, -10 + Math.sin(t * 10 + i) * 10, 18 - i * 2, 0, TAU); c.fill(); } c.restore(); }
function beckyCall(c, t, L) { // video call window in screen space
  const show = !['hook', 'outro'].includes(L); if (!show) return null;
  const k = L === 'A1' ? eBack(P(t, SC.A1.s + 0.2, SC.A1.s + 0.6), 1.6) : 1; const st = beckyState(t, L), jet = L === 'B1' && t > ev('jetski');
  const shakeX = jet ? Math.sin(t * 40) * 6 : 0;
  K.callWindow(c, WIN.x + shakeX, WIN.y, WIN.w, WIN.h, 'BECKY · IBIZA', '#FF7A9A', k, (cc, ww, hh) => {
    beach(cc, ww, hh, t, jet ? P(t, ev('jetski'), ev('jetski') + 3) : 0);
    cc.save(); cc.translate(ww / 2 + (jet ? -20 : 0), hh + 500 - (jet ? 120 : 0)); cc.scale(0.7, 0.7); Hq.human(cc, BECKY, st);
    if (L === 'A1' && t > ev('cocktail')) cocktail(cc, -G.becky.sw * 1.3, -1050, 1.4 * eBack(P(t, ev('cocktail'), ev('cocktail') + 0.3), 1.6));
    cc.restore();
    if (jet) jetski(cc, ww, hh + 120, t);
    if (L === 'B2' && t > ev('static')) { const n = (t * 30) | 0; for (let i = 0; i < 40; i++) { cc.fillStyle = `rgba(${hash(i + n) > 0.5 ? 255 : 30},${hash(i + n) > 0.5 ? 255 : 30},${hash(i + n) > 0.5 ? 255 : 30},.5)`; cc.fillRect(0, hash(i * 7 + n) * hh, ww, 6 + hash(i * 3 + n) * 14); } }
    if (L === 'B2' && t > SP.b2_x.t + 1.2 && t < ev('static') + 1.4) txt(cc, 'kshhh!', ww / 2, 160, 60, '#FFFFFF');
  });
  if (L === 'B2' && t > ev('static') + 1.2 && t < SP.b2_tip.t) { c.save(); c.fillStyle = 'rgba(30,30,40,.85)'; rr(c, WIN.x + 12, WIN.y + 12, WIN.w - 24, WIN.h - 24, 22); c.fill(); txt(c, 'CALL ENDED', WIN.x + WIN.w / 2, WIN.y + WIN.h / 2, 48, '#E0474C'); c.restore(); }
  return { x: WIN.x + WIN.w / 2, y: WIN.y + 10 };
}
function beckyState(t, L) { const g = G.becky, st = { t, talk: talk('becky', t), mood: 'happy', turn: 0, look: 0, armL: reach(g, -1, -g.sw * 1.4, g.ySh + 200), armR: reach(g, 1, g.sw * 1.4, g.ySh - 260), glasses: true };
  st.front = (cc, gg) => { paint(cc, q => q.e(gg.head.x, gg.head.y - g.hh * 0.75, g.hw * 1.9, g.hh * 0.32), '#F7E3A8', { sd: 4, hd: 2, lw: 3 }); paint(cc, q => q.e(gg.head.x, gg.head.y - g.hh * 0.95, g.hw * 1.0, g.hh * 0.45), '#F7E3A8', { sd: 4, hd: 2, lw: 3 }); cc.fillStyle = '#FF7A9A'; cc.fillRect(gg.head.x - g.hw * 1.0, gg.head.y - g.hh * 0.85, g.hw * 2, 14); cc.fillStyle = '#2B2F3A'; for (const s of [-1, 1]) { cc.beginPath(); cc.ellipse(gg.head.x + s * g.hw * 0.42, gg.head.y + g.hh * 0.02, g.hw * 0.3, g.hh * 0.2, 0, 0, TAU); cc.fill(); } cc.fillRect(gg.head.x - g.hw * 0.15, gg.head.y - 4, g.hw * 0.3, 6); };
  if (L === 'A1' && t > ev('cocktail')) { st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 60); }
  if (L === 'A2' && t > ev('postcard') - 0.5) st.mood = 'smug';
  if (L === 'B1' && t > ev('jetski')) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh + 80); st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 80); }
  if (L === 'B2' && t > SP.b2_x.t + 1.0) { st.mood = 'smug'; const u = t * 14; st.armL = reach(g, -1, -g.sw * 1.0 + Math.sin(u) * 40, g.ySh - 200); }
  if (L === 'C1' && t > ev('card') - 0.4) st.mood = 'smug';
  if (L === 'C2') { st.mood = speaking('c2_her', t) ? 'worried' : 'happy'; if (t > SP.c2_x.t) st.mood = 'smug'; if (t > ev('closed')) st.mood = 'happy'; }
  return st; }
function herState(t, L) { const g = G.her, st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.4, look: 0.9, armL: reach(g, -1, -g.sw * 0.5, g.ySh + 330), armR: reach(g, 1, g.sw * 1.1, g.ySh + 140), items: { R: phoneItem } };
  const sp = TL.speech.find(s => s.who === 'her' && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st.armL = reach(g, -1, -g.sw * 1.5 + Math.sin(u) * 20, g.ySh + 200 + Math.cos(u) * 20); }
  if (L === 'hook') st.mood = 'annoyed';
  if (L === 'A1') st.mood = t > ev('cocktail') ? 'annoyed' : 'neutral';
  if (L === 'A2') st.mood = t > ev('postcard') ? 'tired' : 'neutral';
  if (L === 'B1') st.mood = t > ev('jetski') ? 'shock' : 'neutral';
  if (L === 'B2') st.mood = t > ev('static') ? 'angry' : 'neutral';
  if (L === 'C1') st.mood = t > ev('card') ? 'surprised' : 'annoyed';
  if (L === 'C2') { st.mood = speaking('c2_her', t, 0.1) ? 'smug' : 'neutral'; if (t > SP.c2_her2.t - 0.2) { st.mood = 'skeptical'; st.lookY = 0.4; st.look = 0.4; } if (t > ev('closed')) { st.mood = 'angry'; st.squint = Math.floor(t * 5) % 4 === 0; } }
  return st; }
function world(c, t, L) { c.drawImage(BGB, BX0, BY0, BW, BH); const heads = {}; heads.her = put(c, HER, herState(t, L), HERX, FY); return heads; }
function cardBox(c, k, w, h, fn, rot = -0.03, y = 1150) { if (k <= 0) return; c.save(); c.translate(540, y); c.rotate(rot); c.scale(k * 0.92, k * 0.92); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 10, -h / 2 + 14, w, h, 30); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -w / 2, -h / 2, w, h, 30); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; rr(c, -w / 2, -h / 2, w, h, 30); c.stroke(); fn(); c.restore(); }
function giftCard(c, closed, ks) { c.save(); c.fillStyle = '#2F6AB4'; rr(c, -260, -150, 520, 300, 26); c.fill(); c.fillStyle = '#F2C14E'; c.fillRect(-260, 40, 520, 30); txt(c, 'GIFT CARD', 0, -95, 50, '#FFFFFF'); txt(c, '£200', 0, -20, 90, '#F2C14E'); txt(c, 'JET SKI SHOP', 0, 105, 36, '#FFFFFF'); if (closed) { c.save(); c.translate(0, -40); c.rotate(-0.2); c.scale(ks, ks); c.strokeStyle = '#E0474C'; c.lineWidth = 12; rr(c, -250, -70, 500, 140, 16); c.fillStyle = 'rgba(255,253,248,.85)'; c.fill(); c.stroke(); txt(c, 'PERMANENTLY', 0, -22, 44, '#E0474C'); txt(c, 'CLOSED', 0, 32, 56, '#E0474C'); c.restore(); } c.restore(); }
function cards(c, t, L) { const win = (a, b) => eBack(P(t, a, a + 0.3), 1.8) * (1 - P(t, b, b + 0.25));
  if (L === 'A2') cardBox(c, win(ev('postcard'), SP.a2_nar.t + 2.5), 600, 400, () => { c.save(); c.translate(0, 0); beach(c, 0, 0, 0); c.restore(); c.save(); c.beginPath(); rr(c, -270, -170, 540, 340, 18); c.clip(); c.translate(-270, -170); beach(c, 540, 340, t); c.restore(); c.save(); c.rotate(-0.06); UI.font(c, 'Unb9', 50); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'WISH YOU', 0, -40, '#FFFFFF', '#E0474C', 10); UI.strokeText(c, 'WERE HERE!', 0, 30, '#FFFFFF', '#E0474C', 10); c.restore(); }, 0.05, 1500);
  if (L === 'C1') { const k = win(ev('card') - 0.05, SP.c1_tip.t - 0.2); if (k > 0) { c.save(); c.translate(540, 250 + (1 - k) * -200); c.fillStyle = 'rgba(255,253,248,.97)'; rr(c, -480, -70, 960, 140, 30); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 4; rr(c, -480, -70, 960, 140, 30); c.stroke(); c.fillStyle = '#FF7A9A'; c.beginPath(); c.arc(-400, 0, 40, 0, TAU); c.fill(); txt(c, 'B', -400, 2, 40, '#FFFFFF'); txt(c, 'Becky sent you a £200 GIFT CARD', -330, -18, 34, '#2B2F3A', 'Unb9', 'left'); txt(c, 'Tap to open', -330, 28, 28, '#6A707A', 'Nun9', 'left'); c.restore(); } cardBox(c, win(ev('card') + 0.4, SP.c1_tip.t - 0.2), 600, 380, () => giftCard(c, false, 1), 0.04, 1390); }
  if (L === 'C2' && t > SP.c2_x.t + 0.6) cardBox(c, win(SP.c2_x.t + 0.6, SP.c2_nar.t + SP.c2_nar.d + 0.3), 600, 380, () => giftCard(c, t > ev('closed'), lerp(2.2, 1, eOut(P(t, ev('closed'), ev('closed') + 0.15)))), 0.04, 1390);
}
function shotFor(t) { const sc = sceneAt(t), L = sc.id, two = { x: CAMX, y: -1050, z: 0.82, r: 0 }; if (L === 'hook' || L === 'outro') return two; const u = t - sc.s; if (u < 1.15) return { ...two, z: 0.78, cut: u < 0.85 };
  if (speaking('c2_her', t, 0.2, 0.3) || TL.speech.some(s => s.who === 'her' && t >= s.t - 0.3 && t < s.t + s.d + 0.2)) return { x: CAMX - 40, y: -1150, z: 0.92, r: 0.2 };
  return two; }
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }
function feed(c, w, h, t) { c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h); const off = -eIO(P(t, 0.5, 2.6)) * 700; for (let i = 0; i < 4; i++) { const y = 30 + i * 360 + off; c.fillStyle = '#FF7A9A'; c.beginPath(); c.arc(40, y + 20, 18, 0, TAU); c.fill(); c.fillStyle = '#2B2F3A'; c.font = '22px Unb9'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('becky.sunshine', 70, y + 20); c.save(); c.beginPath(); c.rect(10, y + 50, w - 20, 240); c.clip(); c.translate(10, y + 50); beach(c, w - 20, 240, t + i); if (i === 1) cocktail(c, (w - 20) / 2, 230, 0.7); if (i === 2) jetski(c, w - 20, 240, t); c.restore(); c.fillStyle = '#E0474C'; c.font = '24px Unb9'; c.fillText((2000 + i * 731) + ' likes', 20, y + 315); c.fillStyle = '#2B2F3A'; c.font = '20px Nun9'; c.fillText(['Living my best life', 'Cocktail no. 7', 'Jet ski day!', 'Never going home'][i], 200, y + 315); } }
function drawHook(c, t) { drawWorld(c, t, 'hook', { x: CAMX, y: -1050, z: 0.82, r: 0 }); Hq.vignette(c, W, HH, 0.3); K.phone(c, 760, 1150, 0.95, (cc, w, h) => feed(cc, w, h, t), 0.05);
  if (t > 1.4) { const kk = eBack(P(t, 1.4, 1.7), 2); c.save(); c.translate(540, 1620); c.rotate(-0.05); c.scale(kk, kk); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -400 + 8, -60 + 10, 800, 120, 20); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -400, -60, 800, 120, 20); c.fill(); UI.textFit(c, 'Unb9', 56, 'ОНА ДОЛЖНА МНЕ £200', 720); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ОНА ДОЛЖНА МНЕ £200', 0, 4); c.restore(); }
  K.titleRibbon(c, t, 540, 330); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А ТЕБЕ ВОЗВРАЩАЛИ', 'ДОЛГИ?'], rows: [['A2', 'When will you pay me back?'], ['B1', 'You still owe me £200.'], ['B2', 'Could you pay me back by Friday?'], ['C1', 'I need that money back.']], cta: ['ОТПРАВЬ ТОМУ, КТО', 'ДОЛЖЕН ТЕБЕ ДЕНЕГ'], hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'smug', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 0.6, G.her.ySh + 300), armR: reach(G.her, 1, G.her.sw * 1.1, G.her.ySh + 140), items: { R: phoneItem } }, 0, 0) }); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh); Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  const win = beckyCall(c, t, sc.id);
  cards(c, t, sc.id);
  K.bubbles(c, t, sc, heads, proj, { hold: { c2_her: 0.25 } });
  if (win) { const l = sc.id.toLowerCase(); for (const sp of TL.speech.filter(x => x.who === 'becky' && x.id.startsWith(l + '_'))) UI.bubble(c, { ...sp, hold: 0.6 }, t, win, 'right', ['BECKY', '#FF7A9A']); }
  if (sc.id === 'C2') K.dots(c, t, endOf('c2_her') + 0.3, SP.c2_x.t - 0.1);
  K.hud(c, t, sc);
}
E.run('repay', NF, renderFrame);
