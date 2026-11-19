// Song pilot ("English is easy... almost"): Suno track + spoken intro/outro, hard cuts every ~1 s, old cast and café.
// node song.js start end out.mp4 | --png=f1,f2   (timeline: eps/song/timeline.json from song/build_tl.py)
// Tom (blue jumper, left) asks in Russian, our heroine (yellow cardigan, right) answers in English.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/song/timeline.json', 'utf8'));
const UI = makeUI(TL); const K = require('./ep_kit')(TL, UI);
const { talk } = K; const SG = TL.song;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const YEL = '#FFD23F', INK = '#2B2333';

// ---------------- cast (old style)
const HER = { ...BASE.her_market };
const TOM = { ...BASE.tom };
const G = { her: geom(HER), tom: geom(TOM) };
const TX = -430, AX = 430;

// ---------------- café (same as the "coffee to go" episode), counter behind both
const BX0 = -2200, BY0 = -3400, BW = 4400, BH = 4800, BS = 0.5;
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function drawShop(c) {
  c.fillStyle = '#F1E4CE'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#C9A57A'; c.fillRect(BX0, -1250, BW, 990); c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 5; for (let x = BX0; x < BX0 + BW; x += 220) { c.beginPath(); c.moveTo(x, -1250); c.lineTo(x, -260); c.stroke(); }
  c.fillStyle = '#FFFDF8'; rr(c, -1000, -2300, 760, 760, 18); c.fill(); c.fillStyle = '#BFE3F7'; rr(c, -970, -2270, 700, 700, 12); c.fill(); c.fillStyle = '#FFFDF8'; c.fillRect(-630, -2270, 20, 700);
  c.fillStyle = '#2B3A2E'; rr(c, -1200, -2500, 1160, 150, 20); c.fill(); fitTxt(c, 'COFFEE & CO.', -620, -2425, 100, '#F2C14E', 1050);
  c.fillStyle = '#8A5A36'; rr(c, 200, -2400, 1000, 1100, 18); c.fill(); c.fillStyle = '#25302A'; rr(c, 230, -2370, 940, 1040, 10); c.fill();
  fitTxt(c, 'MENU', 700, -2250, 110, '#F7F2E8', 800); ['LATTE  £3.50', 'CAPPUCCINO  £3.20', 'FLAT WHITE  £3.40', 'OAT MILK  +50p'].forEach((t, i) => fitTxt(c, t, 700, -2050 + i * 160, 64, i === 3 ? '#F2C14E' : '#F7F2E8', 860, 'Cav7'));
  c.fillStyle = '#8A5A36'; c.fillRect(-2100, -1650, 900, 36); for (let i = 0; i < 6; i++) { c.fillStyle = ['#EE5E9A', '#7FB0D8', '#F2C14E', '#7CC45A', '#E0474C', '#B9A2E6'][i]; rr(c, -2060 + i * 140, -1770, 90, 120, 14); c.fill(); }
  c.fillStyle = '#E9F2F7'; rr(c, -1900, -1050, 800, 400, 20); c.fill(); c.strokeStyle = '#9AA3B2'; c.lineWidth = 6; c.stroke(); for (let i = 0; i < 4; i++) { c.fillStyle = ['#E8A24A', '#C9473A', '#F2D27A', '#8A5A36'][i]; c.beginPath(); c.arc(-1780 + i * 200, -760, 60, Math.PI, 0); c.fill(); }
  // counter far behind the pair
  c.fillStyle = '#E9DCC6'; c.fillRect(-1500, -640, 3000, 60); c.fillStyle = '#7A4E2E'; c.fillRect(-1500, -580, 3000, 330);
  c.fillStyle = '#8A8F9A'; rr(c, 700, -960, 300, 320, 18); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, 730, -930, 240, 70, 10); c.fill();
  c.fillStyle = '#C9B896'; c.fillRect(BX0, -260, BW, 1700); c.fillStyle = 'rgba(0,0,0,.06)'; for (let y = -260; y < 1400; y += 160) for (let x = BX0 + ((y / 160) % 2) * 160; x < BX0 + BW; x += 320) c.fillRect(x, y, 160, 160);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGK = mkBG(drawShop);

// ---------------- helpers on the song timeline
const SPK = (who, t, pre = 0.05, post = 0.1) => TL.speech.find(s => s.who === who && t >= s.t - pre && t < s.t + s.d + post);
const music = t => t >= SG.off && t < SG.last_word + 0.4;
const bounce = (t, amp) => { if (!music(t)) return 0; const ph = ((t - SG.beat0) / SG.beat) % 1; return -amp * Math.pow(Math.max(0, 1 - Math.abs(ph < 0 ? ph + 1 : ph) * 2.2), 1.6); };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
const allPairs = SG.pairs.flatMap((r, ri) => r.map((p, k) => ({ ...p, ri, k })));
const pairAt = t => { let cur = null; for (const p of allPairs) if (t >= p.tr - 0.08) cur = p; return cur; };
const lineAt = t => SG.lines.find(l => t >= l.t - 0.15 && t < l.e + 0.35);
const roundEnd = ri => (SG.lines.find(l => l.r === ri) || { t: 1e9 }).t;

function herState(t) { const g = G.her, st = { t, talk: talk('her', t), mood: 'happy', turn: -0.35, look: -0.8, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  const s = SPK('her', t);
  if (t < SG.off) { st.mood = s && s.id === 'i2' ? 'smug' : 'happy'; if (s && s.id === 'i4') { st.armR = reach(g, 1, g.sw * 1.9, g.ySh - 120, { planar: true }); } }
  if (s && s.kind === 'sing') { const u = (t - s.t) * 5; st.mood = 'happy'; st.armL = reach(g, -1, -(g.sw * 1.6 + Math.sin(u) * 30), g.ySh + 60 + Math.cos(u) * 30, { planar: true }); }
  const l = lineAt(t); if (l && l.who === 'her') { st.mood = 'happy'; st.laugh = true; const u = t * 6; st.armL = reach(g, -1, -g.sw * 1.9, g.ySh - 200 + Math.sin(u) * 40, { planar: true }); st.armR = reach(g, 1, g.sw * 1.9, g.ySh - 200 + Math.cos(u) * 40, { planar: true }); }
  if (t > SG.last_word) { st.mood = 'smug'; st.laugh = false; st.armL = chest(g, -1, 0.3); st.armR = chest(g, 1, 0.3); const o = SPK('her', t); if (o && o.id === 'o3') st.mood = 'happy'; }
  return st; }
function tomState(t) { const g = G.tom, st = { t, talk: talk('tom', t), mood: 'neutral', turn: 0.35, look: 0.8, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  const s = SPK('tom', t);
  if (t < SG.off) { st.mood = 'sad'; if (s && s.id === 'i1') { st.armL = reach(g, -1, -g.hw * 0.5, g.headY + g.hh * 0.6); st.armR = reach(g, 1, g.hw * 0.5, g.headY + g.hh * 0.6); } if (s && s.id === 'i3') st.mood = 'surprised'; if (t > (TL.speech.find(x => x.id === 'i4') || {}).t) st.mood = 'surprised'; }
  else if (t < SG.last_word + 0.3) { st.mood = 'surprised'; if (s && s.kind === 'sing') { st.mood = 'neutral'; st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 60, { planar: true }); }
    const l = lineAt(t); if (l) { st.mood = 'happy'; st.laugh = l.who === 'tom'; if (l.who === 'tom') { st.armL = reach(g, -1, -g.sw * 1.9, g.ySh - 260, { planar: true }); st.armR = reach(g, 1, g.sw * 1.9, g.ySh - 260, { planar: true }); } } }
  else { st.mood = 'happy'; const o = SPK('tom', t); if (o && o.id === 'o2') { st.mood = 'skeptical'; st.armR = reach(g, 1, g.sw * 1.4, g.ySh + 100, { planar: true }); } }
  return st; }

// ---------------- world + shots (old engine camera geometry; every shot is static, cuts only)
const DRAW = { wide: ['tom', 'her'], two: ['tom', 'her'], her: ['her'], tom: ['tom'] };
function world(c, t, tag) { const who = DRAW[tag] || DRAW.wide;
  c.drawImage(BGK, BX0, BY0, BW, BH);
  if (who.includes('tom')) K.put(c, TOM, tomState(t), TX, bounce(t, 16));
  if (who.includes('her')) K.put(c, HER, herState(t), AX, bounce(t, 16)); }
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const hHY = G.her.headY, tHY = G.tom.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { WIDE: S(0, -1000, 0.5, 'wide'), TWO: S(0, fy((hHY + tHY) / 2, 0.72, 1000), 0.72, 'two'),
  HER: S(AX - 40, fy(hHY, 1.0, 1000), 1.0, 'her'), HER_CU: S(AX - 30, fy(hHY, 1.55, 1000), 1.55, 'her'),
  TOM: S(TX + 40, fy(tHY, 1.0, 1000), 1.0, 'tom'), TOM_CU: S(TX + 30, fy(tHY, 1.55, 1000), 1.55, 'tom') };
const PAIR_SHOTS = ['TOM', 'HER_CU', 'TWO', 'TOM_CU', 'HER', 'WIDE'];
function shot(t) {
  if (t < SG.off) { const s = TL.speech.find(x => x.kind === 'talk' && t >= x.t - 0.1 && t < x.t + x.d + 0.25);
    if (t < 0.25 || !s) return SH.TWO; return { i1: SH.TOM, i2: SH.HER, i3: SH.TOM_CU, i4: SH.HER_CU }[s.id] || SH.TWO; }
  const p = pairAt(t), l = lineAt(t);
  if (l) { const k = SG.lines.indexOf(l); if (l.tag === 'echo') return SH.TOM_CU;
    const half = t > (l.t + l.e) / 2; return l.tag === 'p1' ? (half ? SH.HER_CU : SH.WIDE) : (half ? SH.HER : SH.TWO); }
  if (t > SG.last_word + 0.3) { const s = TL.speech.find(x => x.kind === 'talk' && t >= x.t - 0.1 && t < x.t + x.d + 0.25);
    if (t >= SG.card - 0.1) return SH.TWO; if (!s) return SH.TWO; return { o1: SH.HER, o2: SH.TOM_CU, o3: SH.HER_CU }[s.id] || SH.TWO; }
  if (!p) return SH.WIDE;                                            // count-in
  if (p.k === 5 && t > p.te + 0.75 && t < roundEnd(p.ri) - 0.15) return SH.TOM_CU;   // "ok... and how do you say:" beat
  const n = (p.ri * 6 + p.k) % 3, ans = t >= p.te - 0.05;          // question on Tom, answer on her (cut ~0.5-1 s, as in the references)
  if (n === 0) return SH.TWO; if (n === 1) return ans ? SH.HER_CU : SH.TOM_CU; return ans ? SH.HER : SH.TOM;
}
function drawWorld(c, t, cam) { c.save(); c.translate(540, 960); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); world(c, t, cam.tag); c.restore(); }

// ---------------- text overlays (reference look: white text, dark outline, key letters yellow)
function txt(c, s, x, y, size, col = '#FFFFFF', font = 'Nun9', sw = 14, maxW = 980) { UI.textFit(c, font, size, s, maxW); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, s, x, y, col, INK, sw); }
function famWord(c, word, fam, x, y, size, k = 1) {   // "BRIGHT" with IGHT yellow
  c.save(); c.translate(x, y); c.scale(k, k); UI.textFit(c, 'Unb9', size, word, 960); c.textBaseline = 'middle'; c.textAlign = 'left';
  const i = word.indexOf(fam), a = i >= 0 ? word.slice(0, i) : word, b = i >= 0 ? fam : '', w = c.measureText(word).width; let cx = -w / 2;
  c.lineJoin = 'round'; c.lineWidth = 22; c.strokeStyle = INK; c.strokeText(word, cx, 0);
  c.fillStyle = '#FFFFFF'; c.fillText(a, cx, 0); cx += c.measureText(a).width; c.fillStyle = YEL; c.fillText(b, cx, 0); cx += c.measureText(b).width; c.fillStyle = '#FFFFFF'; c.fillText(word.slice(a.length + b.length), cx, 0);
  c.restore(); }
function karaoke(c, l, t, fam, y) {   // words appear as they are sung; family letters yellow
  const shown = l.words.filter(w => t >= w[1] - 0.06).map(w => w[0]); if (!shown.length) return;
  c.font = '84px Nun9'; const lines = UI.wrap(c, l.words.map(w => w[0]).join(' '), 940); let idx = 0;
  lines.forEach((ln, li) => { const ws = ln.split(' '); const full = c.measureText(ln).width; let x = 540 - full / 2; const yy = y + li * 100;
    ws.forEach(w => { const on = idx < shown.length; idx++; const ww = c.measureText(w + ' ').width; if (on) { c.textAlign = 'left'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 14; c.strokeStyle = INK; c.strokeText(w, x, yy);
        const low = w.toLowerCase(), f = fam.toLowerCase(), i = low.indexOf(f); if (i >= 0) { c.fillStyle = '#FFFFFF'; c.fillText(w.slice(0, i), x, yy); const xa = x + c.measureText(w.slice(0, i)).width; c.fillStyle = YEL; c.fillText(w.slice(i, i + f.length), xa, yy); c.fillStyle = '#FFFFFF'; c.fillText(w.slice(i + f.length), xa + c.measureText(w.slice(i, i + f.length)).width, yy); }
        else { c.fillStyle = '#FFFFFF'; c.fillText(w, x, yy); } } x += ww; }); });
  return y + lines.length * 100; }
function overlays(c, t) {
  // spoken lines: subtitle at the top (as in the references)
  const s = t < 0.3 ? TL.speech[0] : TL.speech.find(x => x.kind === 'talk' && t >= x.t - 0.05 && t < x.t + x.d + 0.35);
  if (s && t < SG.card - 0.05) txt(c, s.text, 540, 330, 66);
  if (t >= SG.off && t < SG.last_word + 0.4) {
    const l = lineAt(t);
    if (l) { const fam = SG.fam[l.r]; if (l.tag === 'echo') { const y2 = karaoke(c, l, t, fam, 340); }
      else { const y2 = karaoke(c, l, t, fam, 300); txt(c, SG.tr[l.r], 540, y2 + 14, 46, '#FFFFFF', 'Nun8', 10); } return; }
    const p = pairAt(t);
    if (p) { const fam = SG.fam[p.ri];
      if (p.k === 5 && t > p.te + 0.75 && t < roundEnd(p.ri) - 0.15) { txt(c, 'Ладно… а как сказать:', 540, 300, 56); c.font = '64px Nun9'; UI.wrap(c, SG.ru[p.ri], 940).forEach((ln, i) => txt(c, ln, 540, 400 + i * 80, 64, YEL)); return; }
      const qk = clamp(P(t, p.tr - 0.08, p.tr + 0.06)); if (qk > 0) { c.save(); c.globalAlpha = qk; const q = p.k === 0 ? `Как будет «${p.ru.toLowerCase()}»?` : p.ru + '?'; txt(c, q, 540, 330, 76, YEL); c.restore(); }
      if (t >= p.te - 0.06) famWord(c, p.en, fam, 540, 1500, 200, eBack(P(t, p.te - 0.06, p.te + 0.18), 1.8)); }
  }
  if (t >= SG.card - 0.05) { const k = eBack(P(t, SG.card - 0.05, SG.card + 0.3), 1.6); c.save(); c.translate(540, 1460); c.scale(k, k);
    c.fillStyle = 'rgba(43,35,51,.82)'; rr(c, -470, -170, 940, 340, 60); c.fill(); txt(c, 'ENGLISH IS', 0, -70, 96, '#FFFFFF', 'Unb9', 16, 860);
    famWord(c, 'EASY', 'EASY', 0, 40, 110); txt(c, '(почти)', 0, 125, 54, '#FFFFFF', 'Nun9', 10); c.restore(); }
}
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
  const cam = shot(t); drawWorld(c, t, cam); Hq.vignette(c, W, HH, 0.24);
  overlays(c, t); Hq.grain(c, W, HH, t, 0.04);
}
E.run('song', NF, renderFrame);
