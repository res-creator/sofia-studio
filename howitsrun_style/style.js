// How It's Run — shared look (taken from the style references emu_ep12 "The Great Emu War" and lawnchair_ep17 "The Man Who Flew
// in a Lawn Chair"): canvas size, palette, fonts, text helpers, camera, paper plates (labels, frame-0 headline, honesty stamp,
// rubber stamps, calendar card, paper document), the subtitle settings and the end-of-video question card.
// Use it from an episode as:  const ST = require('../howitsrun_style/style');
const { GlobalFonts } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const { C, F, clamp, lerp, seg, E, rr } = K;
const { INK, px } = R;
try { GlobalFonts.registerFromPath('/usr/share/fonts/truetype/freefont/FreeMonoBold.ttf', 'TypeW'); } catch (e) {}
try { GlobalFonts.registerFromPath('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', 'Emoji'); } catch (e) {}

// WIDE mode (YouTube long-form, 16:9): run with HIR_WIDE=1 → 1920x1080; default is the vertical 1080x1920 for Shorts/TikTok.
const WIDE = process.env.HIR_WIDE === '1';
const W = WIDE ? 1920 : 1080, H = WIDE ? 1080 : 1920, FPS = 30;
// ---------- palette (channel colours + the scene colours used in the two reference episodes) ----------
const PAL = {
  cream: '#FFFDF8', paper: '#F7F5F0', ink: INK, red: C.red, yellow: C.yellow, blue: '#4D8DFF', navy: '#2E3A59', green: '#2FA37E',
  // sky / day (lawnchair): top -> horizon
  skyTop: '#7FB6F2', skyLow: '#DDF0FF', cloud: '#F4F9FF', lawn: '#7CC27A', hills: '#9DB8A0',
  // warm outback (emu): sky -> horizon -> ground
  warmSky: '#F2CF8E', warmLow: '#F9EBCB', dirt: '#C98E5F', dirtLight: '#D9B57A', wheat: '#E8C25A',
  // interiors
  wallWarm: '#EFE3CB', wallCool: '#DCE6EE', floorWood: '#B98A5A', floorTile: '#E9E3D3', wood: '#8A5A34',
};
const FONT = { black: F.black, xb: F.xb, type: 'TypeW, monospace', emoji: 'Emoji' };
const RIM = { day: { dir: [-1, -0.4], color: '#FFF6E0', w: 8, a: 0.9 }, cool: { dir: [1, -0.3], color: '#D8F0FF', w: 7, a: 0.8 } };

// ---------- text ----------
const txt = (ctx, s, x, y, size, col, align = 'center', font = F.black) => { ctx.font = `${size}px ${font}`; ctx.textAlign = align; ctx.fillStyle = col; ctx.fillText(s, x, y); };
function fitTxt(ctx, s, x, y, size, col, maxW, align = 'center', font = F.black) { ctx.font = `${size}px ${font}`; const w = ctx.measureText(s).width; if (w > maxW) size *= maxW / w; txt(ctx, s, x, y, size, col, align, font); return size; }

// ---------- camera & timing helpers ----------
function layer(ctx, c, d, fn) { ctx.save(); ctx.translate(W / 2 + (c.shx || 0) * d, H / 2 + (c.shy || 0) * d); ctx.rotate((c.r || 0) * d); const z = Math.pow(c.z, d); ctx.scale(z, z); ctx.translate(-c.x * d, -c.y * d); fn(ctx); ctx.restore(); }
// cam([[t, x, y, z, r], ...], localTime): eased keys + a slow breath
function cam(keys, lt) {
  let c; if (lt <= keys[0][0]) c = keys[0]; else if (lt >= keys[keys.length - 1][0]) c = keys[keys.length - 1];
  else for (let i = 1; i < keys.length; i++) if (lt < keys[i][0]) { const a = keys[i - 1], b = keys[i], u = E.inOut(seg(lt, a[0], b[0])); c = [lt, lerp(a[1], b[1], u), lerp(a[2], b[2], u), Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u)), lerp(a[4] || 0, b[4] || 0, u)]; break; }
  return { x: c[1] + Math.sin(lt * 0.9) * 4 / c[3], y: c[2] + Math.cos(lt * 0.7) * 3 / c[3], z: c[3], r: (c[4] || 0) + Math.sin(lt * 0.6) * 0.003 };
}
const shake = (t, t0, a = 14) => (t > t0 && t < t0 + 0.35) ? Math.sin((t - t0) * 70) * a * (1 - seg(t, t0, t0 + 0.35)) : 0;
const pop = (t, t0, d = 0.3, s = 2.2) => t < t0 ? 0 : E.back(seg(t, t0, t0 + d), s);
const blink = (t, p = 3.3, o = 0) => ((t + o) % p) > p - 0.11 ? 1 : 0;
const bg = (ctx, col) => { ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); };

// ---------- paper plates ----------
// label: a white (or coloured) paper strip with black text; u = pop scale 0..1; o: size, col, fg, rot, maxW, arrow (-1|1 points down-left/right)
function label(ctx, s, x, y, u, o = {}) {
  if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.03); ctx.scale(u, u); const size = o.size || 56;
  ctx.font = `${size}px ${F.black}`; const w = Math.min(ctx.measureText(s).width + 50, o.maxW || 980);
  CL.cutout(ctx, () => rr(ctx, -w / 2, -size * 0.85, w, size * 1.35, 12), o.col || PAL.cream, { elev: 1.4 }); fitTxt(ctx, s, 0, size * 0.28, size, o.fg || INK, w - 40);
  if (o.arrow) { ctx.fillStyle = o.col || PAL.cream; const ax = o.arrowX || 0; ctx.beginPath(); ctx.moveTo(ax - 22, size * 0.5); ctx.lineTo(ax + 22, size * 0.5); ctx.lineTo(ax + o.arrow * 30, size * 1.25); ctx.closePath(); ctx.fill(); ctx.lineWidth = px(ctx, 4); ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.restore();
}
// honesty / place stamp: small black plate with yellow text at the top of the 3:4 crop (always on). e.g. 'REAL STORY · RE-ENACTMENT', 'UK · 1992'
function stampLabel(ctx, s = 'REAL STORY · RE-ENACTMENT', y = WIDE ? 56 : 262) {
  ctx.save(); ctx.translate(W / 2, y); ctx.font = `28px ${F.black}`; const w = ctx.measureText(s).width + 40;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -26, w, 50, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 10, 28, C.yellow); ctx.restore();
}
// frame-0 headline, "A vs. B" form (emu: ARMY vs. 20,000 EMUS): B sits on a red strip. a = alpha
function headlineVs(ctx, A, B, a = 1, y = WIDE ? 200 : 420) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(W / 2, y); ctx.rotate(-0.02);
  let HS = 80; ctx.font = `${HS}px ${F.black}`; let wa = ctx.measureText(A).width, wv = ctx.measureText(' vs. ').width, we = ctx.measureText(B).width + 28;
  const k = Math.min(1, 960 / (wa + wv + we + 70)); ctx.scale(k, k);
  const x0 = -(wa + wv + we) / 2, cw = wa + wv + we + 70;
  CL.cutout(ctx, () => rr(ctx, -cw / 2, -84, cw, 124, 18), PAL.cream, { elev: 1.6 });
  txt(ctx, A, x0, 6, HS, INK, 'left'); txt(ctx, ' vs. ', x0 + wa, 6, HS, '#6A6A68', 'left');
  ctx.save(); ctx.translate(x0 + wa + wv + we / 2, -22); CL.cutout(ctx, () => rr(ctx, -we / 2, -56, we, 88, 12), C.red, { elev: 0.8 }); txt(ctx, B, 0, 28, HS, PAL.cream); ctx.restore();
  ctx.restore();
}
// frame-0 headline, two-line form (lawnchair: THE MAN WHO FLEW / IN A LAWN CHAIR): line 2 on a red strip
function headline2(ctx, l1, l2, a = 1, y = WIDE ? 170 : 400) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(W / 2, y);
  CL.cutout(ctx, () => rr(ctx, -440, -70, 880, 118, 16), PAL.cream, { elev: 1.4 }); fitTxt(ctx, l1, 0, 14, 70, INK, 820);
  ctx.translate(0, 124); ctx.rotate(0.025); CL.cutout(ctx, () => rr(ctx, -400, -62, 800, 110, 14), C.red, { elev: 1.2 }); fitTxt(ctx, l2, 0, 24, 78, PAL.cream, 740);
  ctx.restore();
}
// rubber-stamp word (red outline box) that lands with u 0..1, centre (0, 0)
function stampWord(ctx, s, size, u, col = C.red, rot = -0.12) {
  if (u <= 0) return; ctx.save(); ctx.rotate(rot); const k = lerp(1.8, 1, E.out(clamp(u * 1.6))); ctx.scale(k, k); ctx.globalAlpha *= clamp(u * 3) * 0.95;
  ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(s).width + size * 0.7; ctx.strokeStyle = col; ctx.lineWidth = size * 0.12; rr(ctx, -w / 2, -size * 0.78, w, size * 1.28, size * 0.16); ctx.stroke();
  txt(ctx, s, 0, size * 0.34, size, col); ctx.restore();
}
// big red X (struck out), radius r, u 0..1
function bigX(ctx, r, u) { if (u <= 0) return; ctx.save(); const s = E.back(clamp(u), 2); ctx.scale(s, s); ctx.lineCap = 'round';
  for (const [a, b] of [[[-r, -r], [r, r]], [[r, -r], [-r, r]]]) { ctx.lineWidth = r * 0.34; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); ctx.lineWidth = r * 0.24; ctx.strokeStyle = C.red; ctx.stroke(); } ctx.restore(); }
// calendar card (red header + big word), centred
function calCard(ctx, top, big, o = {}) {
  const w = o.w || 420, h = o.h || 380;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 18), PAL.cream, { elev: o.elev ?? 1.8 });
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 18); ctx.clip(); ctx.fillStyle = C.red; ctx.fillRect(-w / 2, -h / 2, w, h * 0.27); ctx.restore();
  rr(ctx, -w / 2, -h / 2, w, h, 18); ctx.lineWidth = px(ctx, 5); ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2 + h * 0.27); ctx.lineTo(w / 2, -h / 2 + h * 0.27); ctx.stroke();
  for (const sx of [-1, 1]) { rr(ctx, sx * w * 0.28 - 10, -h / 2 - 26, 20, 50, 8); R.fillStroke(ctx, '#B9BEC2', 4); }
  fitTxt(ctx, top, 0, -h / 2 + h * 0.19, h * 0.15, PAL.cream, w - 50); fitTxt(ctx, big, 0, h * 0.27, o.bigSize || h * 0.42, INK, w - 50);
}
// paper document: typewriter title + lines [[label, value, u], ...] with the values on coloured plates (emu "REPORT")
function report(ctx, title, sub, lines, o = {}) {
  const w = o.w || 820, h = o.h || 900;
  ctx.save(); ctx.rotate(o.rot ?? -0.02); CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 8), '#FBF6EA', { elev: 1.8 });
  ctx.strokeStyle = 'rgba(80,110,160,0.2)'; ctx.lineWidth = 2; for (let y = -h / 2 + 200; y < h / 2 - 20; y += 50) { ctx.beginPath(); ctx.moveTo(-w / 2 + 30, y); ctx.lineTo(w / 2 - 30, y); ctx.stroke(); }
  fitTxt(ctx, title, 0, -h / 2 + 90, 70, INK, w - 80, 'center', FONT.type); if (sub) fitTxt(ctx, sub, 0, -h / 2 + 150, 34, '#4A4A48', w - 80, 'center', FONT.type);
  lines.forEach(([a, b, u], i) => { if (u <= 0) return; const y = -h / 2 + 300 + i * 190; ctx.save(); ctx.globalAlpha *= clamp(u * 3);
    fitTxt(ctx, a, -w / 2 + 50, y, 46, INK, w * 0.55, 'left', FONT.type);
    ctx.translate(w / 2 - 170, y - 16); const s = E.back(clamp(u), 2.2); ctx.scale(s, s); ctx.rotate(-0.04);
    ctx.font = `92px ${F.black}`; const ww = ctx.measureText(b).width + 40; CL.cutout(ctx, () => rr(ctx, -ww / 2, -64, ww, 112, 12), i === 0 ? C.red : C.yellow, { elev: 1.2 }); txt(ctx, b, 0, 32, 92, i === 0 ? PAL.cream : INK); ctx.restore(); });
  if (o.note) fitTxt(ctx, o.note, 0, h / 2 - 50, 30, '#6A6A68', w - 80, 'center', FONT.type);
  ctx.restore();
}
// the end-of-video question card (held >= 2 s, no voice): l1 = line or [lines], l2 on the red strip, u = pop 0..1, o.arrow: drawn arrow instead of the emoji
function questionCard(ctx, t, l1, l2, u, o = {}) {
  if (u <= 0) return; ctx.save(); ctx.translate(W / 2, o.y ?? 520); ctx.rotate(-0.02); ctx.scale(u, u);
  CL.cutout(ctx, () => rr(ctx, -470, -230, 940, 460, 30), PAL.cream, { elev: 2.2 });
  const ls = Array.isArray(l1) ? l1 : [l1]; ls.forEach((s, i) => fitTxt(ctx, s, 0, -120 + i * 86, 74, INK, 860));
  ctx.save(); ctx.translate(0, -120 + ls.length * 86 + 20); ctx.rotate(0.02); CL.cutout(ctx, () => rr(ctx, -410, -70, 820, 120, 16), C.red, { elev: 1.4 }); fitTxt(ctx, l2, 0, 22, 76, PAL.cream, 760); ctx.restore();
  const b = Math.sin(t * 7) * 10;
  if (o.arrow) { ctx.save(); ctx.translate(0, 190 + b); CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-34, -60); ctx.lineTo(34, -60); ctx.lineTo(34, 0); ctx.lineTo(80, 0); ctx.lineTo(0, 80); ctx.lineTo(-80, 0); ctx.lineTo(-34, 0); ctx.closePath(); }, C.yellow, { elev: 1.4 }); ctx.restore(); }   // a drawn paper arrow pointing at the comments
  else { ctx.font = `110px ${FONT.emoji}`; ctx.textAlign = 'center'; ctx.fillText('👇', 0, 215 + b); }
  ctx.restore();
}
// paper texture over the whole frame (both reference episodes): multiply, alpha 0.26
let TEX = null;
function paper(ctx) { if (!TEX) TEX = K.paperTexture(W, H); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(TEX, 0, 0); ctx.restore(); }
// subtitles: mcd_ep1/engine.js drawSubtitles with these options (+ highlight words per episode)
const SUBS = WIDE ? { y: 985, size: 52, maxW: 1400, x: 960 } : { y: 1565, size: 62, maxW: 820, x: 540 };
// colour grade presets used: 'day' (sky scenes), 'golden' (warm outdoor), 'office' (interiors); vignette 0.15–0.26
const grade = (ctx, preset = 'day', v = 0.2) => LT.grade(ctx, preset, { vignette: v });

module.exports = { WIDE, W, H, FPS, PAL, FONT, RIM, txt, fitTxt, layer, cam, shake, pop, blink, bg, label, stampLabel, headlineVs, headline2, stampWord, bigX, calCard, report, questionCard, paper, SUBS, grade };
