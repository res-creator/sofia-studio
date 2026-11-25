// «Давай замуж!» episode 1 (parts 1 and 2), studio Б, toon v4. Cast + seating helpers come from sheet.js.
// PART=1|2 node render.js still t1,t2 | clip a:b out.mp4 | srt | cover | info | smoothcheck | armaudit | textaudit | sheet
const fs = require('fs'), {spawn} = require('child_process'), {createCanvas} = require('@napi-rs/canvas');
const src = fs.readFileSync(`${__dirname}/sheet.js`, 'utf8'), cutAt = src.indexOf('// ---------- layout ----------');
const HX = new Function('require', '__dirname', src.slice(0, cutAt) + `
return {setG: v => { g = v; }, T, P, fsx, ell, rr, ln, body, chair, seat, LAP, backPerson, petrovich, pearls, shawl, shade, HIP, SEAT_H, ZH, EL, ZV, BR, MK, JS, RY, crystalBall, tarot, laptop, kale, phone, watch, pearlsFx, shawlFx};`)(require, __dirname);
const {T, P, fsx, ell, rr, ln, body, chair, seat, backPerson, petrovich, pearls, shawl, pearlsFx, shawlFx, shade, HIP, SEAT_H, ZH, EL, ZV, BR, MK, JS, RY, laptop, kale, phone, watch} = HX;
const PART = +(process.env.PART || 1), TL = require(`./timeline${PART}.json`), L = TL.L, BY = Object.fromEntries(L.map(l => [l.id, l]));
if (PART === 1) TL.CRASH = 2.5;   // teaser: the crypto chart falls in the third teaser shot
const W = 1080, H = 1920, FPS = 30, INK = '#2a2230', FONT = 'NBL, NBC', VW = 1080, VH = 1920, FL = 860;
const cv = createCanvas(W, H); let g = cv.getContext('2d'); HX.setG(g);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = v => { v = clamp(v); return v * v * (3 - 2 * v); }, lerp = (a, b, k) => a + (b - a) * k;
const P01 = (t, a, d) => clamp((t - a) / d), spr = (x, d = 7, f = 9) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-d * x) * Math.cos(f * x), ei = x => x * x * x;
const fit = (str, x, y, w, h, maxS, col, o = {}) => T.fitText(g, str, {x: x - w / 2, y: y - h / 2, w, h}, {maxSize: maxS, color: col, pad: o.pad ?? 5, lines: o.lines || 1, font: FONT, minSize: 6});
let TEXTLOG = null; const fitLog = (str, x, y, w, h, maxS, col, o = {}) => { const s = fit(str, x, y, w, h, maxS, col, o); if (TEXTLOG) TEXTLOG.push([str, s, o.lines || 1, w, h]); return s; };
const at = (id, u) => BY[id].at + (BY[id].end - BY[id].at) * u;
const poly = (pts, fill, lw = 7) => { P(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); fsx(fill, lw); };
const add = (a, b) => [a[0] + b[0], a[1] + b[1]], lrp = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
function heart(hx, hy, s, col) { P(); g.moveTo(hx, hy + 22 * s); g.bezierCurveTo(hx - 40 * s, hy - 6 * s, hx - 20 * s, hy - 34 * s, hx, hy - 14 * s); g.bezierCurveTo(hx + 20 * s, hy - 34 * s, hx + 40 * s, hy - 6 * s, hx, hy + 22 * s); fsx(col, 4); }

// ---------- draw recorder for accaudit: faces (jaw boxes) and everything drawn after them, mapped to screen ----------
let REC = null;
function recBox(k, x0, y0, x1, y1, extra = {}) { if (!REC) return; const m = g.getTransform(), P2 = (x, y) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f], a = P2(x0, y0), b = P2(x1, y1);
  REC.push({k, x0: Math.min(a[0], b[0]), y0: Math.min(a[1], b[1]), x1: Math.max(a[0], b[0]), y1: Math.max(a[1], b[1]), n: REC.length, ...extra}); }
function recFace(who, x, by, sc, mouth) { const hy = by - 1062 * sc, hw = 152 * 1.2 * sc; recBox('face', x - hw, hy - 165 * 1.2 * sc, x + hw, hy + 176 * 1.2 * sc, {who});   // whole head
  recBox('jaw', x - hw * .85, hy + 40 * 1.2 * sc, x + hw * .85, hy + 176 * 1.2 * sc, {who, talk: mouth > .05}); }
const recProp = (name, x0, y0, x1, y1) => recBox('prop', x0, y0, x1, y1, {name});
const recText = (name, x0, y0, x1, y1) => recBox('text', x0, y0, x1, y1, {name});
// ---------- studio Б ----------
const HY = 1100, HS = .3, HOSTX = {e: 380, z: 545, s: 710}, BX = 190, BYF = 1580, BS = .36, SOFA = 800, GS = .32, GX = {m: 640, j: 800, r: 960}, STAND = [560, 1340], STS = .32;
const DESK = [[255, HY - 470 * HS], [800, HY - 470 * HS], [800, HY + 40], [255, HY + 40]], DTOP = HY - 470 * HS;
function room() { g.fillStyle = '#5a2a6a'; g.fillRect(-400, -400, VW + 800, FL + 400); for (let k = 0; k < 9; k++) { g.fillStyle = k % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'; g.fillRect(k * VW / 9, 0, VW / 9, FL); }
  for (let k = 0; k < 4; k++) { g.save(); g.globalAlpha = .1; P(); const bx = VW * (.12 + k * .25); g.moveTo(bx, 0); g.lineTo(bx - 90, FL); g.lineTo(bx + 90, FL); g.closePath(); g.fillStyle = '#fff6c0'; g.fill(); g.restore(); }
  g.fillStyle = '#e88ab0'; g.fillRect(-400, FL, VW + 800, VH - FL + 400); g.fillStyle = '#d9739e'; g.fillRect(-400, FL, VW + 800, 16); for (let k = 1; k < 7; k++) ln([[-400, FL + k * 150 + k * k * 6], [VW + 400, FL + k * 150 + k * k * 6]], 3, 'rgba(160,60,110,.18)'); }
function sign(t) { const cx = 540, y = 70, w = 760, h = w * .2, x = cx - w / 2; rr(x, y, w, h, h / 2.4, '#ff4f8f', 7); for (let k = 0; k < 16; k++) ell(x + w * .06 + k * w * .88 / 15, y + 10, 6, 6, (Math.floor(t * 4) + k) % 3 ? '#fff3a0' : '#ffd23f', 2); fitLog('ДАВАЙ ЗАМУЖ!', cx, y + h * .55, w * .9, h * .78, 200, '#ffffff', {pad: 4}); }
function door(t) { const cx = 110, w = 170, h = w * 1.6, x = cx - w / 2, y = FL - h; rr(x - 16, y - 16, w + 32, h + 16, 20, '#f2d06a'); rr(x, y, w, h, 12, '#3a1a4a', 5);
  const open = doorOpen(t); if (open > 0) { g.save(); g.globalAlpha = open; g.fillStyle = '#fff0c8'; g.fillRect(x + 8, y + 8, w - 16, h - 8); g.restore(); }
  heart(cx, y - 46, 1.9, '#ff4f8f'); }
function desk(t) { const [TL0, TR, BR, BL] = DESK, d = [28, -28]; recProp('desk', 255, DTOP - 28, 828, HY + 60); poly([add(BL, [-14, 0]), add(BR, [14, 0]), add(BR, [14, 20]), add(BL, [-14, 20])], '#4a2050', 6);
  poly([TR, add(TR, d), add(BR, d), BR], '#a82848'); poly([TL0, TR, BR, BL], '#c8325a'); poly([TL0, TR, add(TR, d), add(TL0, d)], '#e9bb34', 6);
  for (let k = 0; k < 4; k++) { const u = (k + .5) / 4, p = lrp(lrp(TL0, TR, u), lrp(BL, BR, u), .52); heart(p[0], p[1], 1.15, '#ffd0e0'); } }
function deskProps(t) { // crystal ball in front of Звездана, ficus at the right end (slides away from Josh in part 2)
  const bx = 806, by = DTOP - 6, r = 32, glow = PART === 1 ? clamp(1 - Math.abs(t - TL.BALL - .8) / 1.2) : TL.BALL0 ? clamp((t - TL.BALL0) / .4) * (t < TL.BALL0 + 3.4 ? 1 : 0) : 0;
  recProp('ball', bx - r * 1.4, by - r * 2.4, bx + r * 1.4, by + 10); ell(bx, by, r * .8, r * .3, '#d4a82a', 5); if (glow > 0) { g.save(); g.globalAlpha = glow * .5; ell(bx, by - r, r * 1.35, r * 1.35, '#fff0a0', 0); g.restore(); }
  ell(bx, by - r, r, r, '#b9e6ff', 6); ell(bx - 6, by - r - 4, r * .55, r * .55, '#d8c4ff', 0); ell(bx - 12, by - r - 14, 7, 5, 'rgba(255,255,255,.9)', 0);
  if (PART === 2 && TL.BALL0 && t >= TL.BALL0 && t < TL.BALL0 + 3.4) fitLog('0', bx, by - r, r * 1.3, r * 1.3, 60, '#c0283a', {pad: 1});
  const hugK = PART === 2 && TL.FICUS ? ease(P01(t, TL.FICUS, .4)) * (1 - ease(P01(t, BY.s8.end + .3, .4))) : 0, fx = lerp(880, 820, hugK), fy = lerp(HY + 30, DTOP + 10, hugK);   // Звездана pulls her ficus close and hugs it
  const fk = lerp(1, .55, hugK); recProp('ficus', fx - 90 * fk, fy - 230 * fk, fx + 90 * fk, fy); g.save(); g.translate(fx, fy); g.scale(fk, fk); g.translate(-fx, -fy);
  rr(fx - 34, fy - 70, 68, 70, 10, '#c0703a', 5); ln([[fx, fy - 70], [fx, fy - 170]], 7, '#6a4a2a'); for (const [a, l] of [[-2.4, 70], [-1.9, 84], [-1.3, 84], [-.8, 70], [-2.8, 56], [-.3, 56]]) { const ex = fx + Math.cos(a) * l, ey = fy - 170 + Math.sin(a) * l * .8 + 40; ln([[fx, fy - 150], [ex, ey]], 5, '#2f6a2a'); ell(ex, ey, 22, 13, '#4f9e3f', 4); } g.restore(); }
function plantStand(t) { const x = 312, y = 1470; recProp('plant', x - 110, y - 330, x + 110, y); rr(x - 26, y - 150, 52, 150, 8, '#f2d06a', 5); rr(x - 44, y - 170, 88, 26, 8, '#e9bb34', 5); rr(x - 30, y - 230, 60, 62, 10, '#ffffff', 5);
  const bitten = PART === 2 && t >= TL.NIBBLE; for (const [a, l, k] of [[-2.2, 70, 0], [-1.6, 84, 1], [-1.0, 70, 2], [-2.7, 56, 3], [-.5, 56, 4]]) { if (bitten && k === 4) continue; const ex = x + Math.cos(a) * l, ey = y - 228 + Math.sin(a) * l; ln([[x, y - 226], [ex, ey]], 5, '#2f6a2a'); ell(ex, ey, 22, 13, k % 2 ? '#5fb04a' : '#4f9e3f', 4); }
  if (!bitten || true) { ell(x - 20, y - 300, 22, 22, '#ff7aa8', 5); ell(x + 18, y - 296, 18, 18, '#ffb0c8', 5); } }
function sofaSide() { body(SOFA, BYF, GS, () => poly([[-560, -SEAT_H - 380], [-660, -SEAT_H - 300], [-660, -40], [-560, 0]], shade('#3a6aa8', .75), 6)); }
function armchair34(x, y, sc, col) { body(x, y, sc, () => poly([[-205, -SEAT_H - 410], [-285, -SEAT_H - 360], [-285, -SEAT_H + 90], [-205, -SEAT_H + 110]], shade(col, .75), 6)); chair(x, y, sc, 420, col); }
const AUD = [['#6a4a8a', '#3a2a20'], ['#3a6a8a', '#7a5030', 'long'], ['#8a4a5a', '#2a1f1a'], ['#4a7a5a', '#c9a060', 'bun'], ['#6a5a8a', '#5a3a2a']], AUDX = [95, 300, 505, 710, 915], PETRO = 1;
function audience(t) { recProp('audience', 0, VH + 40 - 640 * .5, VW, VH); AUDX.forEach((x, k) => { if (k === PETRO) { const r = PART === 2 && t >= TL.RUSTLE && t < TL.RUSTLE + .5 ? Math.sin(t * 60) * 3 : 0; g.save(); g.translate(r, 0); petrovich(x, VH + 40, .5); g.restore(); return; } const c = AUD[k]; backPerson(x, VH + 40, .5, {top: c[0], hair: c[1], long: c[2] === 'long', bun: c[2] === 'bun'}); }); }

// ---------- who speaks / talk ----------
const lineFor = (who, t) => { for (const l of L) if (l.who === who && t >= l.at - .05 && t < l.end + .3) return l; return null; };
const speakerAt = t => { for (const l of L) if (t >= l.at - .05 && t < l.end + .05) return l.who; return null; };
const blinkAt = (t, s) => ((t + s * 1.37) % (3.1 + s * .43)) < .11;
const SEED = {e: 1, z: 2, s: 3, b: 4, m: 5, j: 6, r: 7};
function talkSt(who, t) { const l = lineFor(who, t); if (!l) return {mouth: 0, round: .5, nod: 0, talking: false}; const s = T.talk(l, t, SEED[who]); if (l.id === 'r3' && t >= TL.BLEEP[0] && t < TL.BLEEP[0] + TL.BLEEP[1]) s.mouth = .85; return {...s, talking: true}; }
// where everyone is (world) — for the look direction
const POS = () => ({e: HOSTX.e, z: HOSTX.z, s: HOSTX.s, b: BX, m: grooms(NOW).m.x, j: grooms(NOW).j.x, r: grooms(NOW).r.x, p: AUDX[PETRO]});
let NOW = 0;
function lookFor(who, t, x) { const sp = speakerAt(t); if (sp && sp !== who) { const px = POS()[sp]; return clamp((px - x) / 300, -1, 1) * .9; } return .25 * Math.sin(t * .7 + SEED[who]); }
// mood plans: [lineId, [[fraction, mood], ...]] for the speaker; reactions for listeners
const MP = {e1: [[0, 'proud']], z1: [[0, 'grin']], e2: [[0, 'smug']], z2: [[0, 'smugside']], s1: [[0, 'dreamy']], oy_e: [[0, 'eyeroll']], oy_z: [[0, 'eyeroll']],
  e3: [[0, 'kind']], e4: [[0, 'sad']], e5: [[0, 'kind']], z3: [[0, 'smugside']], s2: [[0, 'dreamy']], b1: [[0, 'grin']], b2: [[0, 'sad']], b3: [[0, 'sad']], z4: [[0, 'smug']],
  e6: [[0, 'proud']], e7: [[0, 'kind']], b4: [[0, 'flirty']], z5: [[0, 'worried'], [.45, 'smugside']], e8: [[0, 'angry']], z6: [[0, 'surprised']], e9: [[0, 'flat']], b5: [[0, 'dreamy']], z7: [[0, 'eyeroll'], [.5, 'smugside']], e10: [[0, 'laugh']],
  s3: [[0, 'dreamy']], z8: [[0, 'smug'], [.6, 'laugh']], s4: [[0, 'sad']], z9: [[0, 'smugside']], e11: [[0, 'proud']], z10: [[0, 'smugside']], e12: [[0, 'flat']], z11: [[0, 'smug']],
  m1: [[0, 'grin']], z12: [[0, 'smugside']], m2: [[0, 'angry']], e13: [[0, 'flat']], m3: [[0, 'worried']], e14: [[0, 'angry']], m4: [[0, 'worried']], z13: [[0, 'smug']], s5: [[0, 'dreamy']], m5: [[0, 'proud']],
  s6: [[0, 'sleepy']], z14: [[0, 'smugside']], s7: [[0, 'angry']], z15: [[0, 'smug']], e15: [[0, 'disgusted']],
  e16: [[0, 'disgusted']], j1: [[0, 'grin']], b6: [[0, 'surprised']], z16: [[0, 'smugside']], e17: [[0, 'flat']], j2: [[0, 'kind']], e18: [[0, 'angry']], z17: [[0, 'laugh']], s8: [[0, 'worried']],
  r1: [[0, 'proud']], z18: [[0, 'flirty']], e19: [[0, 'angry']], z19: [[0, 'surprised']], e20: [[0, 'flat']], r2: [[0, 'smug']], r3: [[0, 'shocked']], r4: [[0, 'sad']], z20: [[0, 'smugside'], [.6, 'laugh']],
  s9: [[0, 'sad']], e21: [[0, 'surprised']], s10: [[0, 'worried']], e22: [[0, 'flat']], z21: [[0, 'proud']], z22: [[0, 'smugside']], hey_m: [[0, 'angry']], hey_j: [[0, 'angry']], hey_r: [[0, 'angry']], s11: [[0, 'dreamy']],
  e23: [[0, 'proud']], b7: [[0, 'sad']], m6: [[0, 'worried']], j3: [[0, 'kind']], r5: [[0, 'grin']], z23: [[0, 'kind']], z24: [[0, 'grin']], p1: [], b8: [[0, 'flirty']], s12: [[0, 'dreamy']], z25: [[0, 'angry']],
  e24: [[0, 'proud']], z26: [[0, 'grin'], [.55, 'flirty']], e25: [[0, 'angry']], z27: [[0, 'smug']], z28: [[0, 'grin']]};
const inW = (t, a, d) => a != null && t >= a && t < a + d;
function moodFn(who) { return t => { const l = lineFor(who, t); if (l && MP[l.id] && MP[l.id].length) { const u = (t - l.at) / (l.end - l.at); let m = MP[l.id][0][1]; for (const [f, mm] of MP[l.id]) if (u >= f) m = mm; return m; }
  if (who === 'e') { if (PART === 1 && inW(t, TL.CARDLAUGH, 2.5)) return 'laugh'; if (PART === 2 && (inW(t, TL.NIBBLE, .9) || inW(t, TL.CRASH, 2.2))) return 'shocked'; if (PART === 2 && inW(t, TL.HAIR, 1.5)) return 'eyeroll'; }
  if (who === 'z') { if (PART === 2 && inW(t, TL.TURN_Z - 1, 1)) return 'kind'; if (PART === 2 && inW(t, TL.GLANCE && TL.GLANCE[0], 1.6)) return 'eyeroll'; }
  if (who === 's' && PART === 2 && inW(t, TL.GLANCE && TL.GLANCE[0], 1.6)) return 'worried';
  if ('mjr'.includes(who) && PART === 2) { if (inW(t, TL.POINT_G, BY.hey_m.at - TL.POINT_G)) return 'sad'; if (inW(t, TL.GROOM_BOO, 1.4)) return 'sad'; if (inW(t, TL.DRUM[0], TL.CRY[0] - TL.DRUM[0])) return 'worried'; if (inW(t, TL.CRY[0], 2.4)) return 'worried'; }
  if (who === 'b') { if (PART === 2 && inW(t, TL.CRY[0], TL.PEEK_B - TL.CRY[0])) return 'sad'; if (PART === 2 && inW(t, TL.PEEK_B, TL.HORROR - TL.PEEK_B)) return 'flirty'; if (PART === 1 && inW(t, TL.LEAN_AWAY, 1.5)) return 'proud'; }
  return who === 'z' ? 'smug' : who === 's' ? 'dreamy' : who === 'e' ? 'flat' : 'neutral'; }; }
const MOODF = Object.fromEntries('ezsbmjr'.split('').map(w => [w, moodFn(w)]));

// ---------- gestures: arms in body coords, eased with anticipation ----------
const LAPA = s => [[s * 86, -860], [s * 130, -720], [s * 64, -585]];
const GEST = {
  wave: s => s > 0 ? [[86, -860], [215, -930], [235, -1080]] : LAPA(s),           // raised hand stays on its own (right) side
  nails: s => s > 0 ? [[86, -860], [220, -880], [215, -1030]] : LAPA(s),
  pearls: s => s > 0 ? [[86, -860], [150, -760], [52, -840]] : LAPA(s),           // pearl clutch on her own side of the chest
  card: s => s > 0 ? [[86, -860], [230, -820], [240, -960]] : LAPA(s),
  laptop: s => [[s * 86, -860], [s * 160, -720], [s * 112, -640]],
  kaleOut: s => s > 0 ? [[86, -860], [250, -760], [300, -800]] : [[-86, -860], [-102, -720], [-110, -580]],
  phoneUp: s => s > 0 ? [[86, -860], [250, -780], [280, -880]] : [[-86, -860], [-160, -740], [-86, -640]],
  shrug: s => [[s * 86, -860], [s * 160, -770], [s * 210, -850]],
  standDown: s => [[s * 86, -860], [s * 102, -720], [s * 110, -580]],
  point: s => s > 0 ? [[86, -860], [200, -820], [300, -860]] : LAPA(s),
  slap: s => s > 0 ? [[86, -860], [240, -760], [400, -690]] : LAPA(s),            // Эльвира's hand lands on Жанна's hand on the desk top (hand to hand, low)
  deskhand: s => s < 0 ? [[-86, -860], [-170, -760], [-150, -690]] : LAPA(s),        // Жанна's left hand rests on the desk top            // Эльвира's hand lands on Жанна's hand on the desk (hand to hand, low)
  cardE: s => s > 0 ? [[86, -860], [235, -780], [262, -890]] : LAPA(s),           // card held beside the chin, outside the face
  fan: s => s > 0 ? [[86, -860], [215, -840], [230, -985]] : LAPA(s),             // waves a hand beside her face (own side)
  hair: s => s > 0 ? [[86, -860], [235, -1000], [215, -1170]] : LAPA(s),           // fixes her bouffant (own side, above the ear)
  hug: s => s > 0 ? [[86, -860], [210, -760], [280, -690]] : [[-86, -860], [-60, -740], [170, -700]],   // hugs the ficus at her right
  cry: s => [[s * 86, -860], [s * 150, -900], [s * 58, -1060]],                    // both palms on her face (crying)
  peek: s => [[s * 86, -860], [s * 155, -870], [s * 62, -940]],                    // hands lowered to the chin: peeks
};
function gestureAt(who, t) {   // gesture name for a time (seated hosts / bride)
  const l = lineFor(who, t), id = l && l.id;
  if (who === 'z') { if (PART === 1 && inW(t, TL.SLAP - .8, 1.6)) return 'deskhand'; if (id === 'z1' || id === 'z28') return 'wave'; if (id === 'z6' || id === 'z13' || id === 'z20' || (PART === 2 && inW(t, TL.POINT_G, BY.z22.end - TL.POINT_G))) return 'point'; if (PART === 2 && inW(t, TL.HAIR, BY.z18.end - TL.HAIR + .2)) return 'hair'; }
  if (who === 'b') { if (id === 'b4') return 'nails'; if (PART === 2 && inW(t, TL.CRY[0], TL.PEEK_B - TL.CRY[0] - .3)) return 'cry'; if (PART === 2 && inW(t, TL.PEEK_B - .3, 1.4)) return 'peek'; }
  if (who === 'e') { if (PART === 1 && inW(t, TL.SLAP - .35, .85)) return 'slap'; if (PART === 1 && inW(t, TL.CARDLAUGH, BY.e10.end - TL.CARDLAUGH + .3)) return 'cardE'; if (id === 'e16' || id === 'e15') return 'fan';
    if (PART === 2 && (inW(t, TL.NIBBLE + .2, 1.6) || inW(t, TL.CRASH + .4, 1.8))) return 'pearls'; }
  if (who === 's') { if (PART === 1 && t >= TL.TAROT_KING - .4 && t < BY.z8.at + .6) return 'card'; if (PART === 2 && t >= TL.TAROT_MARRIED - .4 && t < BY.z25.at + .4) return 'card'; if (PART === 2 && inW(t, TL.FICUS, BY.s8.end - TL.FICUS + .4)) return 'hug'; }
  return 'lap'; }
const gestFn = n => n === 'lap' ? LAPA : GEST[n];
function armsFor(who, t, base = gestureAt) { const cur = base(who, t); let prev = cur, d0 = 1;   // blend from the previous gesture over .35 s; anticipation: hand dips 18 units first
  for (let d = .02; d <= .4; d += .02) { const p = base(who, t - d); if (p !== cur) { prev = p; d0 = d / .4; break; } }
  const A = gestFn(prev), B = gestFn(cur), k = ease(d0), dip = prev !== cur ? Math.sin(Math.PI * clamp(d0 / .45)) * 18 : 0;
  const breath = Math.sin(t * 2.1 + SEED[who]) * 2;
  return {name: cur, k, fn: s => { const a = A(s), b = B(s); return a.map((p, i) => [lerp(p[0], b[i][0], k), lerp(p[1], b[i][1], k) + (i === 2 ? dip : 0) + (i ? breath : 0)]); }}; }

// ---------- people ----------
const DEF = {e: EL, z: ZH, s: ZV, b: BR, m: MK, j: JS, r: RY};
function stOf(who, t, x) { const md = T.moodAt(MOODF[who], t), ts = talkSt(who, t); return {mood: md.mood, moodFrom: md.moodFrom, moodK: md.moodK, blink: blinkAt(t, SEED[who]) || md.blink, mouth: ts.mouth, round: ts.round, nod: ts.nod, talking: ts.talking, t,
  look: who === 'z' && PART === 2 && TL.HORROR && t >= TL.HORROR - .1 && t < BY.z25.end ? lerp(.9, -.9, ease(P01(t, TL.HORROR, 1.4))) : who === 'z' && PART === 2 && inW(t, TL.TURN_Z, 1.6) ? .95 : lookFor(who, t, x), tilt: .02 * Math.sin(t * .9 + SEED[who]),
  lean: who === 'z' ? (PART === 1 ? .07 * ease(P01(t, TL.LEAN_AWAY, .4)) * (1 - ease(P01(t, TL.SLAP + 1.2, .5))) : -.05 * ease(P01(t, TL.LEAN_BACK, .4)) * (1 - ease(P01(t, BY.z20.end + .8, .6)))) : 0}; }
const ARMS = {}, NECK = {e: pearlsFx, s: shawlFx};
const SEATED_HOSTS = 'zse';   // Эльвира drawn last: her slap lands on top of Жанна's hand
function seated(who, x, y, sc, t, o = {}) { const a = armsFor(who, t); const st = stOf(who, t, x), skipArms = OVER[a.name] && a.k >= .35 ? OVER[a.name] : null; const hands = o.hands || {1: a.name === 'nails' || a.name === 'wave' ? 'open' : a.name === 'card' ? 'none' : a.name === 'point' ? 'point' : 'open', '-1': 'open'};
  ARMS[who] = {a, x, y: y + (HIP - SEAT_H) * sc, sc, lean: st.lean || 0};
  seat(DEF[who], x, y, sc, {...st, arms: a.fn, ik: false, front: true, hands, skipArms, neckFx: NECK[who], ...o.st});
  const by = y + (HIP - SEAT_H) * sc; recFace(who, x, by, sc, st.mouth);
  if (a.name === 'cry' || a.name === 'peek' || (a.name === 'hair' && a.k > .3)) { body(x, by, sc, () => { for (const sd of (a.name === 'hair' ? [1] : [-1, 1])) T.drawArm(g, DEF[who], sd, T.solveArm(a.fn(sd)[0], a.fn(sd)[2], a.fn(sd)[1], sd, 0), null, 'open'); }); }
  return by; }
const hpos = (who, s) => { const A = ARMS[who], p = A.a.fn(s); return [A.x + p[2][0] * A.sc, A.y + p[2][1] * A.sc, Math.atan2(p[2][1] - p[1][1], p[2][0] - p[1][0])]; };
// grooms: where they are at time t: off | walk | stand | seat
const WALK_A = [-70, 1165];   // grooms enter from the door side (left) and cross the stage sideways to their spot
const ENTER = {m: TL.ENTER_M, j: TL.ENTER_J, r: TL.ENTER_R}, SIT = {j: TL.FICUS, r: BY.e22 && BY.e22.at - .1};
function gState(w, t) { if (PART === 2 && w === 'm') return 'seat'; const E = ENTER[w]; if (!E) return 'off'; if (t < E[0]) return w === 'j' && PART === 2 ? 'off' : 'off'; if (t < E[0] + E[1]) return 'walk'; if (SIT[w] != null && t >= SIT[w]) return 'seat'; return 'stand'; }
function grooms(t) { const o = {}; for (const w of 'mjr') { const s = gState(w, t); let x = GX[w], y = BYF, sc = GS;
    if (s === 'walk') { const wp = T.walkPose(t, ENTER[w][0], ENTER[w][1], WALK_A, STAND, .3, STS); x = wp.x; y = wp.y; sc = wp.s; o[w] = {s, x, y, sc, wp}; continue; }
    if (s === 'stand') { x = STAND[0]; y = STAND[1]; sc = STS; } o[w] = {s, x, y, sc}; } return o; }
function standGest(w, t) { if (w === 'm') return 'laptop'; if (w === 'j') return PART === 2 && t >= TL.GIVE_KALE ? 'standDown' : 'kaleOut'; if (w === 'r') return 'phoneUp'; return 'standDown'; }
function drawGroom(w, t, G) { const q = G[w]; if (q.s === 'off') return; const def = DEF[w];
  if (q.s === 'seat') { const props = w === 'm' ? 'laptopLap' : w === 'j' ? null : 'phoneLap'; seated(w, q.x, q.y, q.sc, t, {hands: {1: props ? 'fist' : 'open', '-1': props === 'laptopLap' ? 'fist' : 'open'}});
    if (props === 'laptopLap') { body(q.x, q.y + (HIP - SEAT_H) * q.sc, q.sc, () => {}); laptop(q.x, q.y + (HIP - SEAT_H) * q.sc - 560 * q.sc, q.sc * .8); }
    if (props === 'phoneLap') { const [hx, hy, a] = hpos(w, 1); phone(hx, hy - 30 * q.sc, q.sc * .8, .2); T.drawHand(g, 'fist', hx, hy, a, q.sc, def.pal.skin, null, 1, 22); }
    return; }
  const wp = q.wp, bob = wp ? wp.bob * q.sc : 0, gn = q.s === 'walk' ? (w === 'm' ? 'laptop' : w === 'j' ? 'kaleOut' : 'phoneUp') : standGest(w, t);
  const st = stOf(w, t, q.x), fn = GEST[gn], free = gn === 'laptop' ? 0 : -1;   // the hand that is not holding a prop swings with the walk (opposite to its leg)
  const pts = s => { const f = fn(s), sw = wp && s === free ? wp.swing[s] : 0; return f.map((p, i) => [p[0] + (i === 2 ? sw * 70 : i === 1 ? sw * 30 : 0), p[1] + (i ? Math.sin(t * 2.1 + SEED[w]) * 2 : 0) - (i === 2 ? Math.abs(sw) * 18 : 0)]); };
  const holdR = gn === 'kaleOut' || gn === 'phoneUp', holdBoth = gn === 'laptop';
  recFace(w, q.x, q.y + bob, q.sc, st.mouth); T.draw(g, {...def, x: q.x, y: q.y + bob, s: q.sc, ...st, walk: wp ? wp.walk : null, walkDir: wp ? wp.walkDir : 0, lean: wp ? wp.lean : 0, arms: pts, ik: true, front: holdBoth, hands: {1: holdR || holdBoth ? 'none' : 'open', '-1': holdBoth ? 'none' : 'open'}});
  const hp = s => { const p = T.solveArm(pts(s)[0], pts(s)[2], pts(s)[1], s, 0); return [q.x + p[2][0] * q.sc, q.y + bob + p[2][1] * q.sc, Math.atan2(p[2][1] - p[1][1], p[2][0] - p[1][0]), p]; };
  if (gn === 'laptop') { recProp('laptop', q.x - 130 * q.sc, q.y + bob - 800 * q.sc, q.x + 130 * q.sc, q.y + bob - 620 * q.sc); laptop(q.x, q.y + bob - 650 * q.sc, q.sc); for (const s of [-1, 1]) { const [hx, hy, a] = hp(s); T.drawHand(g, 'fist', hx, hy, a, q.sc, def.pal.skin, null, s, 22); } }
  if (gn === 'kaleOut') { const [hx, hy, a] = hp(1); recProp('kale', hx - 80 * q.sc, hy - 240 * q.sc, hx + 80 * q.sc, hy + 50 * q.sc); kale(hx, hy - 10 * q.sc, q.sc); T.drawHand(g, 'fist', hx, hy, a, q.sc, def.pal.skin, null, 1, 22); }
  if (gn === 'phoneUp') { const [hx, hy, a, p] = hp(1); recProp('phone', hx - 50 * q.sc, hy - 145 * q.sc, hx + 56 * q.sc, hy + 25 * q.sc); phoneCrash(hx + 6 * q.sc, hy - 60 * q.sc, q.sc, t); T.drawHand(g, 'fist', hx, hy, a, q.sc, def.pal.skin, null, 1, 22);
    const wr = [q.x + lerp(p[1][0], p[2][0], .78) * q.sc, q.y + bob + lerp(p[1][1], p[2][1], .78) * q.sc]; watch(wr[0], wr[1], q.sc, a + Math.PI / 2); }
  if (w === 'j' && PART === 2 && t >= TL.NIBBLE && t < TL.NIBBLE + 1.4) { const [hx, hy] = hp(-1); ell(hx + 10 * q.sc, hy - 30 * q.sc, 22 * q.sc, 13 * q.sc, '#4f9e3f', 4); } }
// Ryan's phone: the chart line falls during CRASH
function phoneCrash(x, y, sc, t) { const u = TL.CRASH != null ? ease(P01(t, TL.CRASH + .3, .7)) : 0; g.save(); g.translate(x, y); g.rotate(.1); const w = 90 * sc, h = 160 * sc; rr(-w / 2, -h / 2, w, h, 14 * sc, '#1a1a22', 6 * sc); rr(-w / 2 + 7 * sc, -h / 2 + 12 * sc, w - 14 * sc, h - 24 * sc, 6 * sc, '#ffffff', 0);
  const bx = -w / 2 + 12 * sc, by = -h / 2 + 90 * sc, pts = [[0, 0], [16, -20], [30, -12], [46, -40], [64, -60]].map(([a, b], i) => [bx + a * sc, by + lerp(b, i < 2 ? b : 60 - i * 4, u) * sc]);
  ln(pts, 6 * sc, u > .3 ? '#e0303a' : '#2fbf5a'); if (sc >= .29) fitLog(u > .3 ? '-99%' : '+12%', 0, -h / 2 + 30 * sc, w - 16 * sc, 30 * sc, 28 * sc, u > .3 ? '#e0303a' : '#2fbf5a', {pad: 2}); g.restore(); }
function doorOpen(t) { for (const w of 'mjr') { const E = ENTER[w]; if (E && t >= E[0] - .3 && t < E[0] + .9) return Math.sin(Math.PI * P01(t, E[0] - .3, 1.2)) * .9; } if (TL.KALE_PEEK != null && (PART === 1 ? t >= TL.KALE_PEEK : t < TL.ENTER_J[0])) return .6; return 0; }
function kalePeek(t) { if ((PART === 1 ? t >= TL.KALE_PEEK : t < TL.ENTER_J[0])) recProp('kalePeek', 40, FL - 320, 200, FL); const show = PART === 1 ? t >= TL.KALE_PEEK : t < TL.ENTER_J[0]; if (!show) return; const u = PART === 1 ? spr(P01(t, TL.KALE_PEEK, .6)) : 1; g.save(); g.translate(110 + 40 * (1 - u), FL - 120); g.scale(.9 * u + .01, .9 * u + .01); kale(0, 60, 1.1); g.restore(); }

// ---------- the studio ----------
function studio(t, LY = {hosts: 1, fg: 1, aud: 1}) { NOW = t; room(); sign(t); door(t); kalePeek(t);
  if (LY.hosts !== 0) for (const w of 'ezs') chair(HOSTX[w], HY, HS, 400, '#7a3a8a');
  if (LY.hosts !== 0) for (const w of SEATED_HOSTS) seated(w, HOSTX[w], HY, HS, t); desk(t); if (LY.hosts !== 0) overDesk(t); deskProps(t); if (!LY.fg) { cardProp(t); return; }
  cardProp(t); const G0 = grooms(t); for (const w of 'mjr') if ((G0[w].s === 'walk' || G0[w].s === 'stand') && G0[w].y < 1470) drawGroom(w, t, G0);   // depth order: people behind the plant / bride are drawn first
  if (LY.plant !== 0) plantStand(t);
  if (LY.bride !== 0) { armchair34(BX, BYF, BS, '#f2a0c0'); bride(t); if (PART === 2 && t >= TL.GIVE_KALE) kale(BX + 40, BYF - 420 * BS, BS * .8); }
  const G = grooms(t); sofaSide(); chair(SOFA, BYF, GS, 1560, '#3a6aa8', 'sofa'); for (const w of 'mjr') if (G[w].s === 'seat' && LY.seatedG !== 0) drawGroom(w, t, G);
  for (const w of 'mjr') if ((G[w].s === 'walk' || G[w].s === 'stand') && G[w].y >= 1470) drawGroom(w, t, G);
  if (LY.aud) audience(t); }
// Бриттани: part 1 — not there until «Встречайте — Бриттани!», walks in from the left, sits (the cut hides the sit)
const B_WALK = 3.2, B_A = [-150, 1560];
function brideState(t) { if (PART === 2 || !TL.ENTER_B) return 'seat'; if (t < TL.ENTER_B[0] + .3) return 'off'; if (t < TL.ENTER_B[0] + .3 + B_WALK) return 'walk'; return 'seat'; }
function bride(t) { const s = brideState(t); if (s === 'off') return; if (s === 'seat') { seated('b', BX, BYF, BS, t); return; }
  const wp = T.walkPose(t, TL.ENTER_B[0] + .3, B_WALK, B_A, [BX, BYF], BS, BS), st = stOf('b', t, wp.x), bob = wp.bob * wp.s;
  const pts = sd => { const f = sd > 0 ? GEST.wave(1) : [[-86, -860], [-102, -720], [-110, -580]], sw = sd < 0 ? wp.swing[sd] : 0; return f.map((p, i) => [p[0] + (i === 2 ? sw * 70 : i === 1 ? sw * 30 : 0), p[1] - (i === 2 ? Math.abs(sw) * 18 : 0)]); };
  recFace('b', wp.x, wp.y + bob, wp.s, st.mouth); T.draw(g, {...BR, x: wp.x, y: wp.y + bob, s: wp.s, ...st, mood: 'grin', walk: wp.walk, walkDir: wp.walkDir, lean: wp.lean, arms: pts, ik: true, hands: {1: 'open', '-1': 'open'}}); }
// arms that rest / act ON the desk top are drawn again after the desk (the desk would hide them)
const OVER = {deskhand: [-1], slap: [1], hug: [-1, 1], cardE: [1]};
function overDesk(t) { for (const w of SEATED_HOSTS) { const A = ARMS[w]; if (!A || !OVER[A.a.name] || A.a.k < .35) continue;
    g.save(); g.translate(A.x, A.y); g.rotate(A.lean); g.translate(-A.x, -A.y); body(A.x, A.y, A.sc, () => { for (const sd of OVER[A.a.name]) T.drawArm(g, DEF[w], sd, A.a.fn(sd), null, A.a.name === 'cardE' ? 'fist' : 'open'); }); g.restore();
    if (A.a.name === 'cardE') { const [hx, hy] = hpos(w, 1); g.save(); g.translate(hx + 4, hy - 34 * A.sc); g.rotate(.12); recProp('cardE', -40 * A.sc, -60 * A.sc, 40 * A.sc, 60 * A.sc); rr(-70 * A.sc, -100 * A.sc, 140 * A.sc, 200 * A.sc, 10 * A.sc, '#ffffff', 5 * A.sc); for (let k = 0; k < 4; k++) ln([[-45 * A.sc, (-60 + k * 30) * A.sc], [45 * A.sc, (-60 + k * 30) * A.sc]], 4 * A.sc, '#b8b0c8'); g.restore(); } } }
function cardProp(t) { if (ARMS.s && gestureAt('s', t) === 'card' && ARMS.s.a.k > .85) { const [hx, hy, a] = hpos('s', 1); const lab = PART === 1 ? 'THE KING' : 'MARRIED'; tarotCard(hx + 6 * HS, hy - 150 * HS, HS * 1.15, lab, PART === 2); T.drawHand(g, 'fist', hx, hy, a, HS, ZV.pal.skin, ZV.nails, 1, 22); } }
function tarotCard(x, y, sc, label, paper) { recProp('tarot', x - 70 * sc, y - 105 * sc, x + 70 * sc, y + 105 * sc); g.save(); g.translate(x, y); g.rotate(.08); const w = 120 * sc, h = 190 * sc; rr(-w / 2, -h / 2, w, h, 10 * sc, '#2a1a4a', 6 * sc); rr(-w / 2 + 8 * sc, -h / 2 + 8 * sc, w - 16 * sc, h - 16 * sc, 6 * sc, '#f6e8c0', 3 * sc);
  if (paper) { rr(-34 * sc, -h * .32, 68 * sc, 50 * sc, 3 * sc, '#efe9d8', 3 * sc); for (let k = 0; k < 3; k++) ln([[-26 * sc, -h * .26 + k * 12 * sc], [26 * sc, -h * .26 + k * 12 * sc]], 2 * sc, '#9a9488'); }
  else { poly([[-30 * sc, -h * .1], [-30 * sc, -h * .3], [-15 * sc, -h * .2], [0, -h * .34], [15 * sc, -h * .2], [30 * sc, -h * .3], [30 * sc, -h * .1]], '#f2c820', 3 * sc); }
  fitLog(label, 0, h * .22, w - 24 * sc, 46 * sc, 40 * sc, '#2a1a4a', {pad: 2}); g.restore(); }

// ---------- video card (Brittany's apartment) ----------
function videoCard(t, phoneUI) { const u = t - TL.CARD; g.fillStyle = '#ffd6e4'; g.fillRect(0, 0, W, H); for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? '#ffcadb' : '#ffd6e4'; g.fillRect(k * 135, 0, 135, 1400); }
  rr(600, 260, 400, 520, 16, '#bfe4ff'); for (const [x, w2, h2] of [[620, 70, 260], [700, 60, 360], [770, 90, 220], [870, 70, 320], [940, 50, 200]]) rr(x, 780 - h2, w2, h2, 4, '#6a7aa8', 4); ln([[800, 260], [800, 780]], 8); ln([[600, 520], [1000, 520]], 8);   // window: Brooklyn
  g.fillStyle = '#d9a1b8'; g.fillRect(0, 1400, W, 520); rr(90, 330, 300, 240, 10, '#e9bb34', 7); rr(110, 350, 260, 200, 6, '#ffffff', 4);   // photo frame: her half + torn edge + the cat
  ell(170, 470, 34, 34, '#f6d0b8', 4); ln([[250, 352], [236, 400], [258, 450], [240, 500], [256, 548]], 5); ell(320, 500, 34, 26, '#f2a54a', 4); poly([[296, 482], [304, 458], [314, 478]], '#f2a54a', 4); poly([[326, 478], [336, 458], [344, 482]], '#f2a54a', 4);
  const sc = .62, x = 520, y = 1990; const st = stOf('b', t, x), fn = s => s > 0 ? [[86, -860], [230, -760], [270, -700]] : [[-86, -860], [-102, -720], [-110, -580]];
  recFace('b', x, y, sc, st.mouth); T.draw(g, {...BR, x, y, s: sc, ...st, look: BY.b2 && t >= BY.b2.at - .1 ? .7 : 0, arms: fn, ik: true, hands: {1: 'none', '-1': 'open'}});
  const p = T.solveArm(fn(1)[0], fn(1)[2], fn(1)[1], 1, 0), hx = x + p[2][0] * sc, hy = y + p[2][1] * sc;   // wine glass
  recProp('glass', hx - 40, hy - 140, hx + 44, hy + 10); g.save(); g.translate(hx + 4, hy - 70); P(); g.moveTo(-36, -60); g.quadraticCurveTo(-36, 10, 0, 14); g.quadraticCurveTo(36, 10, 36, -60); g.closePath(); fsx('rgba(255,255,255,.75)', 5); P(); g.moveTo(-30, -20); g.quadraticCurveTo(0, 12, 30, -20); g.closePath(); fsx('#c0283a', 0); ln([[0, 14], [0, 70]], 6); g.restore();
  T.drawHand(g, 'fist', hx, hy, Math.atan2(p[2][1] - p[1][1], p[2][0] - p[1][0]), sc, BR.pal.skin, BR.nails, 1, 22);
  // TV frame: REC + tag (top corner, away from her face)
  if (phoneUI) return; g.lineWidth = 18; g.strokeStyle = '#2a2230'; g.strokeRect(9, 9, W - 18, H - 18); ell(70, 76, 14, 14, u % 1 < .6 ? '#e0303a' : '#ffd6e4', 0); fitLog('ВИДЕО-ВИЗИТКА', 260, 76, 320, 56, 40, '#2a2230', {pad: 4}); }

// ---------- shots (v2 re-edit: reference-style shot vocabulary) ----------
// world shots: WIDE HOSTS GROOMS DOOR PETRO, CU_<who>, MCU_<who>, ECU_<who> (eyes), PUSH_<who> (push-in from MCU to CU on a punchline)
// screen composites: INS_laptop INS_kale INS_chart INS_tarot INS_paper INS_clock INS_ball INS_photo, OTS_b (bride's shoulder -> groom),
// OTS_g (groom's shoulder -> hosts), STAGED_b (bride in front, grooms react behind), NEWS (crypto crash), INTERRO (interrogation), ASTRO (forecast), PHONEVID (video card)
const SCW = {e: HS, z: HS, s: HS, b: BS};
function headW(who, t) { if (who in HOSTX) return [HOSTX[who], HY + (HIP - SEAT_H) * HS - 1062 * HS, HS]; if (who === 'b') return [BX, BYF + (HIP - SEAT_H) * BS - 1062 * BS, BS];
  const q = grooms(t)[who]; return q.s === 'seat' ? [q.x, q.y + (HIP - SEAT_H) * q.sc - 1062 * q.sc, q.sc] : [q.x, q.y - 1062 * q.sc, q.sc]; }
const camCU = (who, t, k = .9) => { const [x, y, sc] = headW(who, t); return {z: k / sc, x, y: y + 117 * sc * (.9 / k)}; };
const camECU = (who, t) => { const [x, y, sc] = headW(who, t); return {z: 3.3 / sc, x, y: y - 20 * sc}; };
const CAMS = {WIDE: () => ({z: 1, x: 540, y: 960}), HOSTS: () => ({z: 1.95, x: 545, y: 900}), GROOMS: () => ({z: 1.55, x: 800, y: 1330}), EZ: () => ({z: 2.6, x: 462, y: 905}), ZS: () => ({z: 2.6, x: 628, y: 905}), JOSHPLANT: () => ({z: 1.75, x: 450, y: 1140}),
  DOOR: () => ({z: 2.2, x: 200, y: 720}), PETRO: () => ({z: 2.0, x: AUDX[PETRO], y: VH + 40 - 260 * .5 - 300}), END: () => ({z: 1.95, x: 545, y: 900})};
const s0 = id => BY[id].at - .08, wd = (id, key, d = .3) => { const w = (BY[id].words || []).find(x => x[2].toLowerCase().includes(key.toLowerCase())); return w ? w[0] - .1 : at(id, d); };
// [start, kind, who/arg, extra]
const ent = (k, d = 0) => TL[k][0] + d, lg = (id, d = .15) => BY[id].end + d;   // a crowd reaction right after a line
const PLAN = PART === 1 ? [
  [0, 'INS_laptop'], [1.25, 'INS_kale'], [2.5, 'INS_chart'], [TL.OPEN - .05, 'WIDE'], [at('e1', .45), 'MCU', 'e'], [s0('z1'), 'PUSH', 'z', wd('z1', 'хай', .6)], [TL.AP1 - .1, 'HOSTS'],
  [s0('e2'), 'EZ'], [s0('z2'), 'CU', 'z'], [s0('s1'), 'MCU', 's'], [at('s1', .5), 'CU', 's'], [TL.OY - .08, 'EZ'], [TL.L_OY + .3, 'WIDE'],
  [TL.DIM, 'MCU', 'e'], [at('e3', .45), 'CU', 'e'], [s0('e4'), 'ECU', 'e'], [lg('e4'), 'WIDE'], [s0('e5'), 'MCU', 'e'], [at('e5', .5), 'CU', 'e'], [s0('z3'), 'ZS'], [s0('s2'), 'CU', 's'],
  [TL.CARD, 'PHONEVID', 0], [at('b1', .5), 'PHONEVID', 1], [s0('b2'), 'PHONEVID', 1], [TL.PHOTO - .1, 'INS_photo'],
  [s0('z4'), 'ZS'], [s0('e6'), 'MCU', 'e'], [ent('ENTER_B'), 'WIDE'], [ent('ENTER_B', .3 + B_WALK), 'CU', 'b'],
  [s0('e7'), 'MCU', 'e'], [s0('b4'), 'CU', 'b'], [s0('z5'), 'PUSH', 'z', wd('z5', 'ногтями', .6)], [at('z5', .8), 'CU', 'b'], [TL.SLAP - .5, 'EZ'], [s0('z6'), 'CU', 'z'],
  [s0('e9'), 'MCU', 'e'], [s0('b5'), 'CU', 'b'], [s0('z7'), 'PUSH', 'z', wd('z7', 'выбери', .7)], [TL.CARDLAUGH, 'CU', 'e'],
  [s0('s3'), 'ASTRO', 'leo'], [TL.TAROT_KING - .1, 'INS_tarot', 'king'], [lg('s3'), 'WIDE'], [s0('z8'), 'PUSH', 'z', wd('z8', 'бургер', .7)], [lg('z8'), 'HOSTS'], [s0('s4'), 'CU', 's'], [s0('z9'), 'CU', 'z'],
  [s0('e11'), 'HOSTS'], [ent('ENTER_M'), 'WIDE'], [ent('ENTER_M', 2.6), 'WALK', 'm'], [s0('z10'), 'EZ'], [s0('e12'), 'MCU', 'e'], [s0('z11'), 'CU', 'z'], [s0('m1'), 'CU', 'm'], [at('m1', .5), 'INS_laptop'], [s0('z12'), 'PUSH', 'z', wd('z12', 'безработ', .5)],
  [lg('z12'), 'ECU', 'm'], [s0('m2'), 'CU', 'm'], [s0('e13'), 'MCU', 'e'], [s0('m3'), 'CU', 'm'], [TL.INTERRO, 'INTERRO'], [TL.GULP - .1, 'INTERRO', 'close'],
  [s0('z13'), 'PUSH', 'z', wd('z13', 'ноль', .6)], [lg('z13'), 'WIDE'], [s0('s5'), 'ASTRO', 'ask'], [s0('m5'), 'CU', 'm'], [s0('s6'), 'ASTRO', 'aquarius'], [s0('z14'), 'PUSH', 'z', at('z14', .45)],
  [s0('s7'), 'CU', 's'], [s0('z15'), 'CU', 'z'], [lg('z15'), 'HOSTS'], [TL.SMOKE, 'WIDE'], [TL.KALE_PEEK, 'DOOR']]
 : [
  [0, 'MCU', 'e'], [ent('ENTER_J'), 'WIDE'], [ent('ENTER_J', 2.6), 'WALK', 'j'], [s0('j1'), 'CU', 'j'], [wd('j1', 'brought', .6) - .15, 'INS_kale'], [s0('b6'), 'CU', 'b'],
  [s0('z16'), 'PUSH', 'z', wd('z16', 'салат', .7)], [lg('z16'), 'HOSTS'], [s0('e17'), 'MCU', 'e'], [s0('j2'), 'JOSHPLANT'], [s0('e18'), 'PUSH', 'e', BY.e18.at],
  [lg('e18', .3), 'WIDE'], [TL.DESKLAUGH, 'CU', 'z'], [TL.FICUS, 'MCU', 's'], [at('s8', .5), 'CU', 's'], [ent('ENTER_R'), 'WIDE'], [ent('ENTER_R', 2.6), 'WALK', 'r'], [s0('r1'), 'CU', 'r'], [lg('r1'), 'WIDE'],
  [TL.HAIR, 'CU', 'z'], [s0('e19'), 'EZ'], [s0('e20'), 'MCU', 'e'], [s0('r2'), 'CU', 'r'], [at('r2', .9), 'INS_chart'], [TL.BLEEP[0] - .04, 'NEWS'],
  [s0('r4'), 'CU', 'r'], [TL.LEAN_BACK, 'PUSH', 'z', wd('z20', 'первый', .6)], [lg('z20'), 'HOSTS'], [s0('s9'), 'ASTRO', 'mercury'], [s0('e21'), 'MCU', 'e'], [s0('s10'), 'CU', 's'], [TL.GLANCE[0], 'HOSTS'],
  [s0('e22'), 'MCU', 'e'], [s0('z21'), 'MCU', 'z'], [at('z21', .5), 'PUSH', 'z', at('z21', .55)], [TL.POINT_G, 'GROOMS'], [lg('z22', .1), 'HOSTS'], [TL.HEY - .05, 'GROOMS'], [s0('s11'), 'ASTRO', 'zero'], [at('s11', .62), 'INS_ball'], [TL.GROOM_BOO, 'GROOMS'],
  [TL.STAND_E, 'MCU', 'e'], [TL.DRUM[0], 'CU', 'b'], [TL.DRUM[0] + 1.3, 'GROOMS'], [s0('b7'), 'CU', 'b'], [s0('m6'), 'CU', 'm'], [s0('j3'), 'CU', 'j'], [s0('r5'), 'CU', 'r'], [TL.CRY[0], 'CU', 'b'],
  [TL.COLD[0], 'INS_clock'], [s0('z23'), 'MCU', 'z'], [s0('z24'), 'PUSH', 'z', BY.z24.at], [TL.RUSTLE, 'INS_paper'], [lg('p1', .6), 'WIDE'], [TL.PEEK_B - .1, 'CU', 'b'], [TL.TAROT_MARRIED, 'INS_tarot', 'married'],
  [TL.HORROR, 'PUSH', 'z', at('z25', .45)], [lg('z25'), 'HOSTS'], [s0('e24'), 'MCU', 'e'], [at('e24', .5), 'CU', 'e'], [TL.WINK, 'CU', 'z'], [at('z26', .5), 'PUSH', 'z', at('z26', .55)], [s0('e25'), 'EZ'], [s0('z27'), 'CU', 'z'], [s0('z28'), 'HOSTS'], [TL.END, 'END']];
const SHOTS = PLAN.map(([a, k, who, x], i, arr) => ({a, k, who, x, end: arr[i + 1] ? arr[i + 1][0] : TL.TOTAL, i}));
const SHAKE = PART === 2 ? [TL.BLEEP[0], .5] : null;   // shake on one word only: the bleep
function shotAt(t) { let s = SHOTS[0]; for (const q of SHOTS) if (t >= q.a) s = q; return s; }
function worldCam(sh, t) { const u = clamp((t - sh.a) / (sh.end - sh.a));
  switch (sh.k) { case 'CU': return camCU(sh.who, t); case 'MCU': return camCU(sh.who, t, .62); case 'ECU': return camECU(sh.who, t);
    case 'PUSH': { const k = ease(P01(t, sh.x, .45)); const A = camCU(sh.who, t, .62), B = camCU(sh.who, t, 1.15); return {z: lerp(A.z, B.z, k), x: lerp(A.x, B.x, k), y: lerp(A.y, B.y, k)}; }
    case 'OTS_b': { const [x, y, sc] = headW(sh.who, t); return {z: .62 / sc, x: x + 60 * sc, y: y + 330 * sc}; }
    case 'WALK': { const [x, y, sc] = headW(sh.who, t); return {z: 1.0 / sc, x, y: y + 470 * sc}; }   // groom walking in, full figure, nobody in front
    case 'OTS_g': return CAMS.HOSTS(); case 'STAGED_b': return {z: 1.35, x: 700, y: 1310};
    case 'NEWS': { const [x, y, sc] = headW('r', t); const z = lerp(.75, 1.15, ease(u)) / sc; return {z, x: x + 40 * sc, y: y + 200 * sc}; }
    default: return CAMS[sh.k] ? CAMS[sh.k]() : CAMS.WIDE(); } }
function camAt(t) { const sh = shotAt(t); const c = worldCam(sh, t); const cold = sh.k === 'PETRO'; let z = c.z * (sh.k === 'PUSH' || sh.k === 'NEWS' || sh.k === 'ECU' ? 1 : 1 + (cold ? .06 : .02) * ease(clamp((t - sh.a) / (sh.end - sh.a)))), sx = 0, sy = 0;
  if (SHAKE && t >= SHAKE[0] && t < SHAKE[0] + .6) { const v = t - SHAKE[0]; sx = 14 * Math.exp(-6 * v) * Math.sin(v * 70); sy = 10 * Math.exp(-6 * v) * Math.cos(v * 61); }
  const hw = 540 / z, hh = 960 / z, free = /ECU|PUSH|NEWS|OTS_b|WALK|CU|MCU/.test(sh.k); return {z, x: (free ? c.x : clamp(c.x, hw, VW - hw)) + sx / z, y: (free ? c.y : clamp(c.y, hh, VH - hh)) + sy / z, sh}; }
function teaseGroom(t) { return null; }
// ---------- captions (owner's style) ----------
const RUNG = new Set(['хай', 'гёрлз', 'скэрд', 'смарт', 'рич', 'энд', 'кайнд', 'кинг', 'бургер-кинг', 'депендс', 'онли', 'плэнтс', 'бьютифул', 'бай']);
const isEn = w => { const x = w.replace(/[«»"?!.,…—:*]/g, '').toLowerCase(); return /[a-z]/i.test(x) || RUNG.has(x) || x.split('-').some(p => RUNG.has(p)); };
const SPL = {b1: [["Hi! I'm Brittany, thirty-two, nail artist from Brooklyn.", 'Привет! Я Бриттани, 32 года, мастер маникюра из Бруклина.']], b2: [['My ex left me… for my best friend.', 'Бывший ушёл от меня… к лучшей подруге.']],
  b3: [['…And her cat.', '…И её коту.']], b4: [['Men are scared of me.', 'Мужчины меня боятся.']], b5: [['Smart, rich and kind.', 'Умного, богатого и доброго.']], b6: [['…Thanks?', '…Спасибо?']],
  b7: [['I choose… the one who can pay for dinner.', 'Я выбираю… того, кто заплатит за ужин.']], b8: [['Oh?', 'О?']],
  m1: [["Hi! I'm Mike. I'm a freelancer — I'm my own boss!", 'Привет! Я Майк. Я фрилансер — сам себе начальник!']], m2: [['Hey!', 'Эй!']], m3: [['Uh…', 'Ну…']], m4: [['Well… it depends.', 'Ну… по-разному.']], m5: [['Aquarius.', 'Водолей.']],
  m6: [['Can we split it?', 'А можно пополам?']], j1: [["Hi! I'm Josh. I'm vegan.", 'Привет! Я Джош. Я веган.'], ['I brought you kale!', 'Принёс тебе кейл!']], j2: [['Only plants.', 'Только растения.']], j3: [["Only if it's a salad bar.", 'Только если это салат-бар.']],
  r1: [["I'm Ryan. Crypto investor.", 'Я Райан. Крипто-инвестор.'], ["I'm a millionaire!", 'Я миллионер!']], r2: [['Well… on paper.', 'Ну… на бумаге.']], r3: [['Oh sh—*', '']], r4: [['Okay… I WAS a millionaire.', 'Ладно… Я БЫЛ миллионером.']],
  r5: [['Do you accept crypto?', 'А криптой можно?']], s5: [["What's your sign?", 'Какой у тебя знак?']], s9: [['Mercury is in retrograde.', 'Меркурий ретроградный.'], ['Never trust crypto in retrograde.', 'Не верь крипте при ретрограде.']],
  s12: [["The stars say… he's married.", 'Звёзды говорят… он женат.']], hey_m: [['Hey!', 'Эй!']], hey_j: [['Hey!', 'Эй!']], hey_r: [['Hey!', 'Эй!']], p1: [['Угу.', '']]};
const RUS = {s1: ['Девочки… не ссорьтесь. У вас обеих Луна в Скорпионе.'], e1: ['Добрый вечер! В эфире «Давай замуж!».', 'С вами я — Эльвира…'], e24: ['Это было «Давай замуж!».', 'А кого бы выбрали вы? Пишите в комментариях!'],
  s3: ['Бриттани, вы Лев.', 'Brittany, you are a Leo…', 'A Leo needs… a king.'], s8: ['Дева. Pure… and always hungry.', 'Чистый… и вечно голодный.'], s11: ['The stars say… compatibility zero.', 'Совместимость ноль.']};
function chunks(l) { const end = l.id === 'r3' ? TL.BLEEP[0] + TL.BLEEP[1] : l.end;
  if (RUS[l.id]) { const Pp = RUS[l.id], n = Pp.reduce((a, c) => a + c.length, 0); let acc = 0; return Pp.map(sx => { const a = l.at + (end - l.at) * acc / n; acc += sx.length; return {s: sx, tr: '', a, b: l.at + (end - l.at) * acc / n, id: l.id}; }); }
  if (SPL[l.id]) { const Pp = SPL[l.id], n = Pp.reduce((a, c) => a + c[0].length, 0); let acc = 0; return Pp.map(([s, tr]) => { const a = l.at + (end - l.at) * acc / n; acc += s.length; return {s, tr, a, b: l.at + (end - l.at) * acc / n, id: l.id}; }); }
  const parts = [].concat(...l.text.match(/[^.!?…]+[.!?…]*/g).map(x => x.trim()).filter(Boolean).map(p => p.length > 36 && p.includes(',') ? p.split(/(?<=[,:])\s+/) : [p])); const out = []; let cur = '';
  for (const p of parts) { if ((cur + ' ' + p).trim().length > 36 && cur) { out.push(cur); cur = p; } else cur = (cur + ' ' + p).trim(); } if (cur) out.push(cur);
  for (let i = 0; i < out.length; i++) { const n0 = out.reduce((a, c) => a + c.length, 0); if (out.length > 1 && out[i].length / n0 * (end - l.at) < 1.25) { const j = i < out.length - 1 ? i : i - 1; out.splice(j, 2, out[j] + ' ' + out[j + 1]); i = -1; } }
  const n = out.reduce((a, c) => a + c.length, 0); let acc = 0;
  const ws = l.words || [], wc = out.map(c => c.split(' ').length); let wi = 0;
  return out.map((c, k) => { let a = l.at + (end - l.at) * acc / n; if (ws.length === wc.reduce((x, y) => x + y, 0) && k > 0) a = ws[wi][0] - .04; wi += wc[k]; acc += c.length; return {s: c, a, b: 0, id: l.id}; }).map((c, k, arr) => ({...c, b: arr[k + 1] ? arr[k + 1].a : end})); }
const CHORUS_SKIP = new Set(['oy_e', 'hey_m', 'hey_j']), FLAT = [].concat(...L.filter(l => !CHORUS_SKIP.has(l.id)).map(l => l.id === 'hey_r' && BY.hey_m ? {...l, at: BY.hey_m.at} : l).map(chunks)); FLAT.forEach((c, i) => { const nx = FLAT[i + 1], lim = nx ? nx.a - .04 : c.b + 1.2; c.hold = Math.max(c.b, Math.min(c.a + 1.25, lim)); if (!nx || nx.id !== c.id) c.hold = Math.max(c.hold, Math.min(c.b + .3, lim)); });
function measureW(words) { const sp = g.measureText(' ').width; return words.reduce((a, w) => a + g.measureText(w).width, 0) + sp * (words.length - 1); }
function drawWords(words, y, size, colFn) { g.font = `${size}px ${FONT}`; const sp = g.measureText(' ').width, tw = measureW(words); let x = 540 - tw / 2; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  words.forEach(w => { const ww = g.measureText(w).width; g.lineWidth = size * .24; g.strokeStyle = '#000'; g.strokeText(w, x, y); g.fillStyle = colFn(w); g.fillText(w, x, y); x += ww + sp; }); }
// one line if it fits at >= 56 px, else two balanced lines (whole phrase still pops in at once); returns the y below the block
function outlinedWords(words, y, size0, colFn, minOne = 56) { let size = size0; g.font = `${size}px ${FONT}`; let tw = measureW(words); while (tw > 990 && size > minOne) { size -= 2; g.font = `${size}px ${FONT}`; tw = measureW(words); }
  if (tw <= 990 || words.length < 3) { while (tw > 990 && size > 24) { size -= 2; g.font = `${size}px ${FONT}`; tw = measureW(words); } if (TEXTLOG) TEXTLOG.push([words.join(' '), size, 1, 990, size * 1.4, tw <= 990]); drawWords(words, y, size, colFn); return y + size * .6; }
  let best = 1, bd = 1e9; size = size0; g.font = `${size}px ${FONT}`; for (let k = 1; k < words.length; k++) { const d = Math.abs(measureW(words.slice(0, k)) - measureW(words.slice(k))); if (d < bd) { bd = d; best = k; } }
  const A = words.slice(0, best), B = words.slice(best); let mw = () => Math.max(measureW(A), measureW(B)); while (mw() > 990 && size > 30) { size -= 2; g.font = `${size}px ${FONT}`; }
  if (TEXTLOG) TEXTLOG.push([words.join(' '), size, 2, 990, size * 2.6, mw() <= 990]); const y0 = y - size * .5; drawWords(A, y0, size, colFn); drawWords(B, y0 + size * 1.1, size, colFn); return y0 + size * 1.7; }
function curChunk(t) { let cur = null; for (const c of FLAT) if (t >= c.a - .02 && t < c.hold) cur = c; return cur; }
function caption(t) { const cur = curChunk(t); if (!cur) return; const pop = 1 + .08 * clamp(1 - (t - cur.a) / .12); g.save(); g.translate(540, 1660); g.scale(pop, pop); g.translate(-540, -1660);
  recText('caption', 40, 1650 - 70, 1040, 1800); const en = SPL[cur.id] != null; const yb = outlinedWords(cur.s.split(' '), 1650, 68, w => en ? '#ffd23f' : isEn(w) ? '#ffd23f' : '#ffffff'); g.restore(); if (cur.tr) outlinedWords(cur.tr.split(' '), Math.max(1740, yb + 34), 44, () => '#ffffff', 34); }
// chips tied to the spoken word
const GLOSS = PART === 1 ? [['z5', 'Скэрд', 'scared', 'напуганный'], ['s3', 'Leo', 'Leo', 'Лев (знак зодиака)'], ['z8', 'Кинг', 'king', 'король'], ['z12', 'Фрилансер', 'freelancer', 'фрилансер'], ['z13', 'Депендс', 'it depends', 'смотря как, по-разному'], ['s5', 'sign', 'sign', 'знак зодиака']]
  : [['j1', 'kale', 'kale', 'капуста кейл'], ['z17', 'плэнтс', 'plants', 'растения'], ['r2', 'paper', 'on paper', 'на бумаге'], ['BLEEP', '', 'Oh shoot!', 'Ой, блин! (приличный вариант)'], ['s9', 'Mercury', 'Mercury retrograde', 'ретроградный Меркурий'], ['s11', 'compatibility', 'compatibility', 'совместимость'], ['m6', 'split', 'split', 'разделить пополам'], ['z26', 'бьютифул', 'beautiful', 'красивый']];
const CHIPS = []; { let prev = -1; for (const [id, key, en, ru] of GLOSS) { let a; if (id === 'BLEEP') a = TL.BLEEP[0] + TL.BLEEP[1] + .05; else { const l = BY[id], w = (l.words || []).find(x => x[2].toLowerCase().replace(/[^a-zа-яё-]/gi, '').startsWith(key.toLowerCase().replace(/[^a-zа-яё-]/gi, '').slice(0, 5))); a = w ? w[0] : l.at + .2; }
    a = Math.max(a - .08, prev + .05); const b = a + 1.7; CHIPS.push({a, b, en, ru}); prev = b; } }
function chip(t) { let c = null; for (const q of CHIPS) if (t >= q.a && t < q.b) c = q; if (!c) return; const k = ease((t - c.a) / .15) * (1 - ease((t - c.b + .12) / .12)), w1 = c.en, w2 = ' — ' + c.ru;
  let f = 42; g.font = `${f}px ${FONT}`; const tot = () => g.measureText(w1).width + g.measureText(w2).width; while (tot() > 920) { f -= 2; g.font = `${f}px ${FONT}`; } const tw = tot(), w = tw + 56; if (TEXTLOG) TEXTLOG.push([w1 + w2, f, 1, 976, 72, tw <= 920]);
  recText('chip', 540 - w / 2, 1516, 540 + w / 2, 1590); g.save(); g.globalAlpha = k; g.translate(540, 1556 + (1 - k) * 16); g.rotate(-.015); rr(-w / 2 + 6, -34, w, 72, 20, 'rgba(42,34,48,0.35)', 0); rr(-w / 2, -40, w, 72, 20, '#fffaf0', 5);
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#d63a8a'; g.fillText(w1, -tw / 2, -3); g.fillStyle = INK; g.fillText(w2, -tw / 2 + g.measureText(w1).width, -3); g.restore(); }
function plate(t, a, b, l1, l2, y = 1560) { if (t < a || t >= b) return; const ui = P01(t, a, .4), uo = P01(t, b - .3, .3), sp = spr(ui, 6, 10), al = clamp(ui * 5) * (1 - ei(clamp((uo - .35) / .65)));
  recText('plate', 100, y - 130, 980, y + 130); g.save(); g.globalAlpha = al; g.translate(540, y); g.rotate(-.02 - .06 * (1 - sp)); const s = .62 + .38 * sp; g.scale(s, s); rr(-440, -130, 880, 260, 34, '#fffaf0', 9); fitLog(l1, 0, -50, 840, 100, 74, INK); fitLog(l2, 0, 52, 840, 100, 80, '#d63a8a'); g.restore(); }
function censor(t) { if (PART !== 2 || t < TL.BLEEP[0] - .02 || t >= TL.BLEEP[0] + 1.4) return; const c = camAt(t), hs = (STAND[0] - c.x) * c.z + 540, half = 152 * 1.2 * STS * c.z, hx = hs - half - 190, hy = (STAND[1] - 1062 * STS - 60 - c.y) * c.z + 960, k = spr(P01(t, TL.BLEEP[0], .3));   // beside the head (left of it), never on the face
  recText('censor', hx + 60 - 95, hy - 50, hx + 60 + 95, hy + 50); g.save(); g.translate(hx + 60, hy); g.rotate(.12); g.scale(k, k); rr(-95, -48, 190, 96, 22, '#2a2230', 6, '#ffffff'); fitLog('#@$%!', 0, 0, 170, 80, 56, '#ffd23f', {pad: 4}); poly([[-60, 44], [-84, 80], [-30, 46]], '#2a2230', 0); g.restore(); }
function endCard(t) { const k = ease((t - TL.END) / .35); g.fillStyle = `rgba(30,20,30,${.55 * k})`; g.fillRect(0, 0, W, H); g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 80);
  rr(60, 170, 960, 1540, 44, '#fffaf0', 8); fitLog('ПЕРЕВОДИМ ЖАННУ', 540, 270, 900, 90, 66, '#d63a8a');
  const R = [['SCARED', 'напуганный'], ['FREELANCER', 'фрилансер'], ['IT DEPENDS', 'смотря как, по-разному'], ['PLANTS', 'растения'], ['ON PAPER', 'на бумаге'], ['OH SHOOT!', 'ой, блин! (приличный вариант)'], ['SPLIT', 'разделить пополам'], ['COMPATIBILITY', 'совместимость']];
  R.forEach(([en, ru], i) => { const y = 390 + i * 135; fitLog(en, 540, y, 900, 66, 58, '#1f3a8a'); fitLog(ru, 540, y + 56, 900, 48, 40, '#c0283a'); });
  fitLog('А кого бы выбрали вы?', 540, 1500, 900, 70, 56, '#d63a8a'); fitLog('Пишите в комментариях!', 540, 1580, 900, 64, 46, INK); g.restore(); }

// ---------- frame ----------
let COVER = 0;
const layerFor = k => /^(CU|MCU|ECU|PUSH)$/.test(k) ? null : k === 'HOSTS' || k === 'END' || k === 'OTS_g' || k === 'EZ' || k === 'ZS' ? {fg: 0} : k === 'NEWS' ? {hosts: 0, fg: 1, aud: 0, seatedG: 0} : k === 'WALK' ? {hosts: 1, fg: 1, aud: 0, bride: 0, plant: 0, seatedG: 0} : k === 'GROOMS' || k === 'OTS_b' || k === 'STAGED_b' ? {hosts: 1, fg: 1, aud: 0} : {hosts: 1, fg: 1, aud: 1};
function worldPass(t, c, LY) { g.save(); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); studio(t, LY); g.restore(); }
function frame(t) { const c = COVER && PART === 2 && !process.env.COVER_T ? {z: 2.1, x: 600, y: 1170, sh: shotAt(t)} : camAt(t), sh = c.sh, k = sh.k; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#2a2230'; g.fillRect(0, 0, W, H);
  if (COVER && PART === 2 && !process.env.COVER_T) worldPass(t, c, {hosts: 0, fg: 1, aud: 1});
  else if (k === 'PHONEVID') phoneVideo(t, sh);
  else if (k.startsWith('INS_')) insert(k.slice(4), t, sh);
  else if (k === 'INTERRO') interrogation(t, sh);
  else if (k === 'ASTRO') astro(t, sh);
  else { let LY = layerFor(k); if (!LY) { const who = sh.who, host = 'ezs'.includes(who), standing = 'mjr'.includes(who) && grooms(t)[who].s !== 'seat'; LY = host ? {fg: 0} : {hosts: 1, fg: 1, aud: 0, seatedG: standing ? 0 : 1}; }
    worldPass(t, c, LY); if (PART === 1 && TL.DIM != null && t >= TL.DIM && t < TL.DIMEND + .4) { const k2 = Math.min(ease(P01(t, TL.DIM, .6)), 1 - ease(P01(t, TL.DIMEND, .4))), vg = g.createRadialGradient(540, 760, 200, 540, 960, 1100); vg.addColorStop(0, `rgba(20,8,30,${.1 * k2})`); vg.addColorStop(1, `rgba(20,8,30,${.62 * k2})`); g.fillStyle = vg; g.fillRect(0, 0, W, H); }
    if (k === 'OTS_b') otsBride(t); if (k === 'OTS_g') otsGroom(t, sh.who); if (k === 'STAGED_b') stagedBride(t); if (k === 'NEWS') newsOverlay(t, sh); }
  const v = g.createRadialGradient(W / 2, H * .45, 650, W / 2, H * .45, 1250); v.addColorStop(0, 'rgba(30,15,30,0)'); v.addColorStop(1, 'rgba(30,15,30,0.14)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (process.env.NOCAP || COVER) return;
  if (PART === 1) plate(t, 0, TL.OPEN - .05, 'СЕГОДНЯ', 'В ПРОГРАММЕ'); if (PART === 1) plate(t, TL.PART2[0], TL.TOTAL + 1, 'ПРОДОЛЖЕНИЕ', 'ЧАСТЬ 2');
  profileCard(t);
  if (k === 'END') endCard(t); else if (k !== 'ECU') { censor(t); chip(t); caption(t); } }
// grooms' profile cards slide in at the top on their entrance (like the reference's comment cards)
const PROFILE = {m: ['ЖЕНИХ №1 · МАЙК', 'фрилансер · 29 лет · Водолей', '#8a93a0'], j: ['ЖЕНИХ №2 · ДЖОШ', 'веган · 27 лет · Дева', '#9ac07a'], r: ['ЖЕНИХ №3 · РАЙАН', 'крипто-инвестор · 31 год · Телец', '#26315e']};
function profileCard(t) { if (shotAt(t).k !== 'WIDE') return; for (const w of 'mjr') { const E = ENTER[w]; if (!E || t < E[0] || t >= E[0] + E[1] + .1) continue; const ui = P01(t, E[0], .35), uo = P01(t, E[0] + E[1] - .2, .3), y = 150 - 300 * (1 - ease(ui)) - 300 * ei(uo);
    recText('profile', 70, y - 80, 1010, y + 80); g.save(); g.translate(0, y); rr(70, -80, 940, 160, 26, '#ffffff', 5); ell(160, 0, 54, 54, PROFILE[w][2], 5); fitLog(PROFILE[w][0], 600, -26, 760, 60, 50, INK); fitLog(PROFILE[w][1], 600, 34, 760, 48, 38, '#6a5a70'); g.restore(); } }
// ---- full-screen inserts ----
function bgBands(c1, c2) { g.fillStyle = c1; g.fillRect(0, 0, W, H); for (let k = 0; k < 12; k++) { g.fillStyle = k % 2 ? c2 : c1; g.fillRect(k * W / 12, 0, W / 12, H); } }
function stars(t, n = 70, col = '#fff6c0') { for (let i = 0; i < n; i++) { const x = (Math.sin(i * 91.7) * .5 + .5) * W, y = (Math.sin(i * 47.3 + 1) * .5 + .5) * H, r = 2 + 3 * ((Math.sin(i * 13.1 + t * 3) + 1) / 2); ell(x, y, r, r, col, 0); } }
function insert(kind, t, sh) { const u = t - sh.a;
  if (kind === 'laptop') { bgBands('#5a2a6a', '#62306f'); g.save(); g.translate(540, 1080 + 10 * Math.sin(u * 2)); laptop(0, 0, 3.4); g.restore(); const s = 3.4 * .32 / .32;
    for (const sd of [-1, 1]) T.drawHand(g, 'fist', 540 + sd * 410, 1060, sd > 0 ? Math.PI : 0, 2.6, MK.pal.skin, null, sd, 22); ell(780, 640, 10, 10, '#ffffff', 3); }
  if (kind === 'kale') { bgBands('#ffd6e4', '#ffcadb'); const k = spr(P01(t, sh.a, .5)); g.save(); g.translate(540, 1100); g.scale(k, k); kale(0, 0, 3.2); g.restore(); T.drawHand(g, 'fist', 540, 1100, -Math.PI / 2, 3, JS.pal.skin, null, 1, 22); for (let i = 0; i < 5; i++) { const a = u * 2 + i * 1.3; star5(540 + Math.cos(a) * 380, 700 + Math.sin(a) * 260, 18); } }
  if (kind === 'chart') { const tc = PART === 1 ? 2.5 : TL.CRASH; g.fillStyle = '#101018'; g.fillRect(0, 0, W, H); const fall = ease(P01(t, tc + .3, .7)); g.save(); g.translate(540 + (fall > 0 && fall < 1 ? Math.sin(t * 80) * 6 : 0), 960); g.scale(6.2, 6.2); phoneCrash(0, 0, 1, t); g.restore();
    if (fall > .3) { g.save(); g.globalAlpha = .18 * (Math.sin(t * 30) > 0 ? 1 : 0); g.fillStyle = '#ff2030'; g.fillRect(0, 0, W, H); g.restore(); } }
  if (kind === 'tarot') { g.fillStyle = '#1a1438'; g.fillRect(0, 0, W, H); stars(t); const k = spr(P01(t, sh.a, .5)); g.save(); g.translate(540, 900); g.rotate((1 - k) * .4); g.scale(k, k); tarotCard(0, 0, 4.6, sh.who === 'married' ? 'MARRIED' : 'THE KING', sh.who === 'married'); g.restore(); }
  if (kind === 'paper') { bgBands('#3a2a4a', '#43304f'); const sh2 = t >= TL.RUSTLE && t < TL.RUSTLE + .5 ? Math.sin(t * 60) * 6 : 0; g.save(); g.translate(540 + sh2, 900); g.rotate(-.03);
      rr(-470, -560, 940, 1020, 10, '#efe9d8', 8); ln([[0, -560], [0, 460]], 5); fitLog('BRIGHTON POST', -235, -480, 420, 90, 70, INK); fitLog('КУРС ДОЛЛАРА', 235, -480, 420, 90, 60, INK);
      rr(-430, -390, 400, 260, 6, '#c9d6e6', 5); for (let i = 0; i < 9; i++) { ln([[-430, -90 + i * 50], [-30, -90 + i * 50]], 6, '#9a9488'); ln([[30, -390 + i * 50], [430, -390 + i * 50]], 6, '#9a9488'); } fitLog('$ = ?', 235, 200, 360, 160, 140, '#c0283a'); g.restore();
    for (const sd of [-1, 1]) T.drawHand(g, 'fist', 540 + sd * 480 + sh2, 760, sd > 0 ? Math.PI : 0, 2.4, '#e8b896', null, sd, 22); }
  if (kind === 'clock') { bgBands('#5a2a6a', '#62306f'); const tick = Math.floor(u * 2) / 2; ell(540, 900, 330, 330, '#fffaf0', 12); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ln([[540 + Math.cos(a) * 270, 900 + Math.sin(a) * 270], [540 + Math.cos(a) * 305, 900 + Math.sin(a) * 305]], i % 3 ? 8 : 16); }
    const am = -Math.PI / 2 + (7 + tick) / 60 * Math.PI * 2; ln([[540, 900], [540 + Math.cos(am) * 240, 900 + Math.sin(am) * 240]], 16); ln([[540, 900], [540 + Math.cos(-Math.PI / 2 + 2.5) * 160, 900 + Math.sin(-Math.PI / 2 + 2.5) * 160]], 22); const as = -Math.PI / 2 + tick * 6 / 60 * Math.PI * 2 * 5; ln([[540, 900], [540 + Math.cos(as) * 260, 900 + Math.sin(as) * 260]], 6, '#d63a3a'); ell(540, 900, 22, 22, INK, 0); }
  if (kind === 'ball') { g.fillStyle = '#1a1438'; g.fillRect(0, 0, W, H); stars(t); const zero = PART === 2; g.save(); g.globalAlpha = .35 + .2 * Math.sin(t * 6); ell(540, 860, 420, 420, '#fff0a0', 0); g.restore(); ell(540, 1260, 240, 70, '#d4a82a', 8); ell(540, 860, 330, 330, '#b9e6ff', 10); ell(500, 820, 190, 190, '#d8c4ff', 0); ell(420, 720, 60, 40, 'rgba(255,255,255,.9)', 0);
    if (zero) fitLog('0', 540, 860, 360, 360, 360, '#c0283a', {pad: 4}); else for (let i = 0; i < 7; i++) star5(540 + Math.cos(t * 1.5 + i) * 200, 860 + Math.sin(t * 1.5 + i) * 200, 22); }
  if (kind === 'photo') { bgBands('#ffd6e4', '#ffcadb'); g.save(); g.translate(540, 900); g.rotate(-.04); rr(-420, -340, 840, 680, 20, '#e9bb34', 10); rr(-370, -290, 740, 580, 10, '#ffffff', 6); ell(-180, -20, 150, 150, BR.pal.skin, 6); ell(-230, -40, 16, 22, INK, 0); ell(-130, -40, 16, 22, INK, 0);
    ln([[30, -290], [-10, -150], [40, -20], [-5, 120], [30, 290]], 10); const k = spr(P01(t, sh.a + .2, .5)); g.save(); g.translate(220, 60); g.scale(k, k); ell(0, 40, 140, 110, '#f2a54a', 8); poly([[-110, -20], [-80, -130], [-30, -40]], '#f2a54a', 8); poly([[30, -40], [80, -130], [110, -20]], '#f2a54a', 8); ell(-45, 20, 14, 18, INK, 0); ell(45, 20, 14, 18, INK, 0); g.restore(); g.restore(); } }
function star5(x, y, r) { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * .45 : r; p.push([x + Math.cos(a) * rr2, y + Math.sin(a) * rr2]); } poly(p, '#ffd23f', 4); }
// ---- over the shoulder / staging ----
function otsBride() { g.save(); P(); g.ellipse(150, 1560, 330, 390, -.15, 0, 7); fsx('#3a2418', 9); P(); g.ellipse(120, 2050, 420, 200, 0, 0, 7); fsx('#f27ab0', 9); ell(330, 1250, 26, 40, '#f2c820', 6); g.restore(); }
function otsGroom(t, w) { const col = {m: '#7a5030', j: '#8a6a3a', r: '#2a1f1a'}[w], top = {m: '#8a93a0', j: '#efe3c8', r: '#26315e'}[w]; P(); g.ellipse(860, 1930, 520, 260, 0, 0, 7); fsx(top, 9); if (w === 'r') { poly([[800, 1700], [860, 1700], [850, 1900], [810, 1900]], '#ffffff', 6); } ell(600, 1640, 40, 60, '#f1c6a2', 7); P(); g.ellipse(860, 1600, 280, 320, .1, 0, 7); fsx(col, 9); P(); g.moveTo(640, 1520); g.quadraticCurveTo(860, 1380, 1080, 1500); g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 12; g.stroke();
  if (w === 'm') for (let i = 0; i < 9; i++) ell(640 + i * 55, 1330 + (i % 2) * 30, 70, 60, col, 7); if (w === 'j') { ell(860, 1260, 90, 80, col, 8); ln([[810, 1320], [910, 1320]], 14, '#3a8a4a'); } }
function stagedBride(t) { const sc = .78, x = 200, y = 900 + 1062 * sc - 140 * sc; recBox('noop', 0, 0, 0, 0); chair(x, y, sc, 420, '#f2a0c0'); seated('b', x, y, sc, t, {}); }
// ---- genre cutaways ----
function newsOverlay(t, sh) { g.fillStyle = '#d42a3a'; g.fillRect(0, 150, W, 96); ln([[0, 150], [W, 150]], 6, '#ffffff'); recText('news-banner', 0, 150, W, 246); fitLog('СРОЧНЫЕ НОВОСТИ', 380, 198, 680, 80, 60, '#ffffff'); rr(760, 164, 280, 66, 12, '#ffffff', 0); fitLog('LIVE', 900, 197, 260, 60, 44, '#d42a3a');
  const k = spr(P01(t, sh.a + .2, .5)); g.save(); g.translate(880, 470); g.rotate(.08); g.scale(k, k); recText('news-photo', -150, -170, 150, 190); rr(-150, -170, 300, 360, 8, '#ffffff', 6); rr(-125, -145, 250, 240, 4, '#101018', 0); g.save(); g.translate(0, -25); g.scale(1.3, 1.3); phoneCrash(0, 0, 1, TL.CRASH + 2); g.restore(); fitLog('КОМПРОМАТ', 0, 140, 270, 60, 44, '#d42a3a'); g.restore();
  recText('news-lower', 0, 1430, W, 1530); g.fillStyle = '#101018'; g.fillRect(0, 1430, W, 100); g.fillStyle = '#d42a3a'; g.fillRect(0, 1430, 230, 100); fitLog('BREAKING', 115, 1480, 210, 80, 44, '#ffffff'); fitLog('КРИПТА РУХНУЛА', 650, 1480, 800, 80, 60, '#ffffff'); }
function interrogation(t, sh) { const zc = sh.who === 'close' ? 1.7 : 1; g.save(); g.translate(540, 960); g.scale(zc, zc); g.translate(-540, -960 + (zc > 1 ? 40 : 0)); interroScene(t); g.restore(); }
function interroScene(t) { g.fillStyle = '#12121e'; g.fillRect(0, 0, W, H); const sw = Math.sin(t * 1.6) * 30; ln([[540, 0], [540 + sw * .3, 300]], 6, '#3a3a4a'); g.save(); g.globalAlpha = .22; P(); g.moveTo(540 + sw * .3 - 70, 330); g.lineTo(540 + sw * .3 + 70, 330); g.lineTo(940 + sw, 1500); g.lineTo(140 + sw, 1500); g.closePath(); g.fillStyle = '#fff3c0'; g.fill(); g.restore();
  P(); g.moveTo(540 + sw * .3 - 110, 330); g.lineTo(540 + sw * .3 + 110, 330); g.lineTo(540 + sw * .3 + 50, 270); g.lineTo(540 + sw * .3 - 50, 270); g.closePath(); fsx('#2a2a3a', 6); ell(540 + sw * .3, 336, 40, 16, '#fff6c0', 4);
  const sc = .95, x = 540, y = 820 + 1062 * sc - 140 * sc; g.save(); chair(x, y, sc, 380, '#3a3a4a'); const st = stOf('m', t, x); seat(MK, x, y, sc, {...st, mood: lineFor('m', t) ? 'worried' : 'worried', sweat: true, arms: LAPA, ik: false, front: true, hands: {1: 'fist', '-1': 'fist'}}); recFace('m', x, y + (HIP - SEAT_H) * sc, sc, st.mouth); g.restore();
  const ty = y - 420 * sc + 20; rr(60, ty, 960, 70, 10, '#4a3a2a', 6); g.fillStyle = '#3a2a1a'; g.fillRect(100, ty + 70, 880, 700); ln([[100, ty + 70], [100, ty + 770]], 6); ln([[980, ty + 70], [980, ty + 770]], 6); rr(760, ty - 70, 140, 80, 10, '#e9e4d8', 5);
  const vg = g.createRadialGradient(540, 900, 300, 540, 900, 1100); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)'); g.fillStyle = vg; g.fillRect(0, 0, W, H); }
const SIGNS = {leo: ['LEO', 'ЛЕВ', [[-180, 40], [-90, -40], [0, -60], [80, -10], [60, 80], [150, 120]]], aquarius: ['AQUARIUS', 'ВОДОЛЕЙ', [[-200, 0], [-120, -60], [-40, 0], [40, -60], [120, 0], [200, -60]]],
  virgo: ['VIRGO', 'ДЕВА', [[-180, -60], [-100, 0], [-20, -40], [60, 30], [140, -10], [180, 90]]], mercury: ['MERCURY RETRO', 'МЕРКУРИЙ', null], zero: ['COMPATIBILITY', 'СОВМЕСТИМОСТЬ', null], ask: ['YOUR SIGN?', 'ТВОЙ ЗНАК?', null]};
function astro(t, sh) { g.fillStyle = '#16123a'; g.fillRect(0, 0, W, H); g.fillStyle = '#211a52'; g.fillRect(0, 0, W, 640); stars(t, 90); const S = SIGNS[sh.who] || SIGNS.ask;
  recText('astro-title', 240, 90, 840, 190); rr(240, 90, 600, 100, 50, '#7a3ad0', 6); fitLog('АСТРОПРОГНОЗ', 540, 140, 560, 80, 60, '#ffd23f');
  const k = ease(P01(t, sh.a, .6)); if (S[2]) { const pts = S[2].map(([x, y]) => [540 + x, 400 + y]); g.save(); g.globalAlpha = k; ln(pts.slice(0, Math.max(2, Math.ceil(pts.length * k))), 4, '#fff6c0'); g.restore(); pts.forEach(p => star5(p[0], p[1], 16)); }
  else if (sh.who === 'mercury') { ell(540, 400, 80, 80, '#c9c4d0', 6); g.save(); g.lineWidth = 8; g.strokeStyle = '#ff7aa8'; P(); g.arc(540, 400, 140, Math.PI * .2, Math.PI * 1.6); g.stroke(); g.restore(); poly([[540 + 140 * Math.cos(Math.PI * .2) - 20, 400 + 140 * Math.sin(Math.PI * .2) - 30], [540 + 140 * Math.cos(Math.PI * .2) + 30, 400 + 140 * Math.sin(Math.PI * .2) - 10], [540 + 140 * Math.cos(Math.PI * .2) - 10, 400 + 140 * Math.sin(Math.PI * .2) + 30]], '#ff7aa8', 4); }
  else if (sh.who === 'zero') { for (const sd of [-1, 1]) { g.save(); g.translate(540 + sd * 90 + sd * 40 * k, 400); g.rotate(sd * .3 * k); heart(0, 0, 3.2, '#ff4f8f'); g.restore(); } }
  else { fitLog('?', 540, 400, 200, 200, 200, '#ffd23f'); }
  recText('astro-sign', 240, 520, 840, 600); fitLog(`${S[0]} · ${S[1]}`, 540, 560, 600, 70, 54, '#ffffff');
  // Звездана in a gold oval portrait
  g.save(); P(); g.ellipse(540, 1010, 300, 360, 0, 0, 7); g.fillStyle = '#2a1f5a'; g.fill(); g.clip(); const sc = .9, x = 540, y = 930 + 1062 * sc - 140 * sc; ARMS.s = undefined; seated('s', x, y, sc, t); g.restore(); P(); g.ellipse(540, 1010, 300, 360, 0, 0, 7); g.strokeStyle = '#e9bb34'; g.lineWidth = 16; g.stroke(); }
function phoneVideo(t, sh) { const zoom = sh.who ? 1.18 : 1; g.save(); g.translate(540, 960); g.scale(zoom, zoom); g.translate(-540, -960 - (zoom > 1 ? 120 : 0)); videoCard(t, true); g.restore();
  // phone-camera UI instead of the TV frame (status bar, REC, handle, hearts)
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, 90); fitLog('9:41', 90, 45, 140, 60, 40, '#ffffff'); rr(920, 26, 90, 40, 10, null, 5, '#ffffff'); rr(926, 32, 60, 28, 6, '#ffffff', 0); recText('phone-ui', 0, 0, W, 90);
  ell(80, 150, 16, 16, (t * 2) % 2 < 1.2 ? '#ff3040' : 'rgba(0,0,0,0)', 0); fitLog('REC', 150, 150, 100, 50, 38, '#ffffff'); recText('rec', 50, 120, 220, 180);
  for (let i = 0; i < 4; i++) { const u = ((t - TL.CARD) * .6 + i * .25) % 1; heart(990 + Math.sin(u * 9 + i) * 18, 1400 - u * 600, 1.2 + i * .1, '#ff4f8f'); }
  recText('handle', 40, 1500, 520, 1560); rr(40, 1500, 480, 60, 30, 'rgba(0,0,0,.4)', 0); fitLog('@brittany.nails', 280, 1530, 440, 54, 40, '#ffffff'); }
// ---------- modes ----------
const [mode, arg, outName] = process.argv.slice(2);
if (mode === 'still') { fs.mkdirSync('out/st', {recursive: true}); for (const t of arg.split(',')) { frame(+t); fs.writeFileSync(`out/st/p${PART}_${t}.png`, cv.toBuffer('image/png')); } }
else if (mode === 'clip') { const [a, b] = arg.split(':').map(Number), F0 = Math.round(a * FPS), F1 = Math.round(Math.min(b, TL.TOTAL) * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', outName]);
  (async () => { for (let i = F0; i < F1; i++) { frame(i / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); ff.on('close', c => console.log('done', c)); })(); }
else if (mode === 'cover') { COVER = 1; const t = process.env.COVER_T ? +process.env.COVER_T : PART === 1 ? BY.z7.at + .8 : TL.CRASH + 1.2; frame(t); const src2 = createCanvas(W, H); src2.getContext('2d').drawImage(cv, 0, 0); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(src2, 0, 0);
  g.save(); g.translate(540, 300); g.rotate(-.02); rr(-460, -175, 920, 350, 34, '#fffaf0', 9); fitLog('ДАВАЙ ЗАМУЖ!', 0, -70, 860, 120, 110, '#d63a8a'); fitLog(process.env.COVER_SUB || (PART === 1 ? 'ЧАСТЬ 1: ЖЕНИХ-ФРИЛАНСЕР' : 'ЧАСТЬ 2: ВЕГАН И КРИПТО'), 0, 62, 860, 110, 70, INK); g.restore();
  fs.mkdirSync('final', {recursive: true}); fs.writeFileSync(process.env.COVER_OUT || `final/cover${PART}.png`, cv.toBuffer('image/png')); }
else if (mode === 'srt') { const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const c of FLAT) out += `${++n}\n${ts(c.a)} --> ${ts(c.hold)}\n${c.s}${c.tr ? '\n' + c.tr : ''}\n\n`; fs.mkdirSync('final', {recursive: true}); fs.writeFileSync(`final/part${PART}.srt`, out); }
else if (mode === 'info') { let bad = 0; for (const c of FLAT) { const d = c.hold - c.a; if (d < 1.2) bad++; console.log('CAP', c.id, c.a.toFixed(2), d.toFixed(2), c.s, '|', c.tr || ''); }
  for (const q of CHIPS) { console.log('CHIP', q.a.toFixed(2), (q.b - q.a).toFixed(2), q.en); } for (const s of SHOTS) { const d = s.end - s.a; if (d < 1.2) bad++; console.log('SH', s.i, s.a.toFixed(2), d.toFixed(2), s.k, s.who || ''); } console.log('TOTAL', TL.TOTAL, 'items < 1.2 s:', bad); }
else if (mode === 'smoothcheck') { let n = 0, big = 0, worst = 0, dips = 0, dur = 0;
  for (const l of L) { if (l.who === 'p') continue; const M = []; for (let t = l.at - .1; t < l.end + .3; t += 1 / FPS) M.push(T.talk(l, t).mouth); dur += l.end - l.at;
    for (let i = 1; i < M.length; i++) { const d = Math.abs(M[i] - M[i - 1]), onset = M[i - 1] < .12 && M[i] > M[i - 1]; n++; if (d > .151 && !onset) { big++; worst = Math.max(worst, d); } }
    let hi = 0, lo = 1, down = false; for (const m of M) { if (!down) { if (m > hi) hi = m; if (hi - m >= .2) { down = true; lo = m; } } else { if (m < lo) lo = m; if (m - lo >= .2) { dips++; down = false; hi = m; } } } }
  console.log(`part ${PART}: frames ${n}, non-onset jumps >15%: ${big} (${(100 * big / n).toFixed(1)}%), worst ${worst.toFixed(3)}, visible syllable dips/s ${(dips / dur).toFixed(2)}`); }
else if (mode === 'armaudit') { const bad = {}; for (let t = 0; t < TL.TOTAL; t += 1 / FPS) { NOW = t; for (const w of 'ezsb') { const a = armsFor(w, t); for (const s of [-1, 1]) { const p = a.fn(s); if (p[2][1] < -880 && p[2][0] * s < 40) (bad[w + ' ' + a.name] = bad[w + ' ' + a.name] || []).push(+t.toFixed(2)); if (p[1][0] * s < 0) (bad['elbow ' + w] = bad['elbow ' + w] || []).push(+t.toFixed(2)); } } }
  for (const [k, v] of Object.entries(bad)) console.log(k, v.length, 'frames', v[0], '…', v[v.length - 1]); if (!Object.keys(bad).length) console.log(`part ${PART}: no crossing`); }
else if (mode === 'textaudit') { let n = 0, bad = 0; for (let t = 0; t < TL.TOTAL; t += .25) { TEXTLOG = []; frame(t); for (const r of TEXTLOG) { n++; const [s, size, lines, w, h, ok] = r; let over = ok === false; if (ok === undefined) { g.font = `${size}px ${FONT}`; over = g.measureText(s).width > w + .5 && lines === 1; } if (over) { bad++; if (bad < 12) console.log('OVER', t.toFixed(2), s, size); } } } console.log(`part ${PART}: ${n} text draws, ${bad} overflowing`); }
else if (mode === 'accaudit') { // every speaking frame: nothing drawn after a face may cover its open mouth/jaw; no text/plate/chip over any visible face
  const ov = (a, b) => Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) > 4 && Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) > 4, onScreen = f => f.x1 > 0 && f.x0 < W && f.y1 > 0 && f.y0 < H && f.x1 - f.x0 > 40;
  let frames = 0, talkFrames = 0; const bad = {};
  for (let i = 0; i < Math.round(TL.TOTAL * FPS); i += 2) { const t = i / FPS; REC = []; frame(t); frames++; const R = REC; REC = null; const sh = shotAt(t); if (sh.k === 'END') continue;
    for (const j of R.filter(r => r.k === 'jaw' && r.talk)) { talkFrames++; for (const p of R) if (p.k === 'prop' && p.n > j.n && ov(j, p)) { const key = `jaw ${j.who} under ${p.name}`; (bad[key] = bad[key] || []).push(+t.toFixed(2)); } }
    for (const f of R.filter(r => r.k === 'face' && onScreen(r))) for (const x of R) if (x.k === 'text' && ov(f, x)) { const key = `${x.name} over face ${f.who}`; (bad[key] = bad[key] || []).push(+t.toFixed(2)); } }
  for (const [k, v] of Object.entries(bad)) console.log(k, v.length, 'frames', v.slice(0, 6).join(' '), v.length > 6 ? '…' : '');
  console.log(`part ${PART}: ${frames} frames checked, ${talkFrames} speaking-face frames, ${Object.values(bad).reduce((a, v) => a + v.length, 0)} problems`); }
else if (mode === 'walktest') { // 8 frames 0.08 s apart from the real entrance framing (WIDE) + silhouette strip
  const w = arg || 'm', E = ENTER[w], N = 8, cropW = 420, cropH = 640, sc2 = .78, cw = cropW * sc2, chh = cropH * sc2, out = createCanvas(cw * N, chh * 2 + 140), og = out.getContext('2d'); og.fillStyle = '#fbf3f6'; og.fillRect(0, 0, out.width, out.height);
  const t0 = E[0] + 3.2, sil = createCanvas(W, H), sgc = sil.getContext('2d');
  for (let i = 0; i < N; i++) { const t = t0 + i * .08; g.setTransform(1, 0, 0, 1, 0, 0); worldPass(t, CAMS.WIDE(), {hosts: 1, fg: 1, aud: 1}); const wp = T.walkPose(t, E[0], E[1], WALK_A, STAND, .3, STS), cx = Math.round(wp.x - cropW / 2 + 20), cy = Math.round(wp.y - cropH + 60);
    // fixed crop for all 8 frames (taken from the middle frame) so planted feet can be compared
    const mid = T.walkPose(t0 + 3.5 * .08, E[0], E[1], WALK_A, STAND, .3, STS), fx = Math.round(mid.x - cropW / 2), fy = Math.round(mid.y - cropH + 60);
    og.drawImage(cv, fx, fy, cropW, cropH, i * cw, 40, cw, chh);
    // silhouette: the groom alone, solid black
    const keepG = g; g = sgc; HX.setG(g); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); const G = {m: {s: 'off'}, j: {s: 'off'}, r: {s: 'off'}}; G[w] = {s: 'walk', x: wp.x, y: wp.y, sc: wp.s, wp}; drawGroom(w, t, G);
    g.globalCompositeOperation = 'source-in'; g.fillStyle = '#111'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; g = keepG; HX.setG(g);
    og.fillStyle = '#ffffff'; og.fillRect(i * cw, 40 + chh + 60, cw, chh); og.drawImage(sil, fx, fy, cropW, cropH, i * cw, 40 + chh + 60, cw, chh); og.strokeStyle = '#ccc'; og.strokeRect(i * cw, 40 + chh + 60, cw, chh);
    og.fillStyle = INK; og.font = '24px NBL, NBC'; og.fillText(`+${(i * .08).toFixed(2)} с`, i * cw + 10, 28); }
  og.font = '24px NBL, NBC'; og.fillStyle = INK; og.fillText('Кадр общего плана входа (фиксированное окно) и силуэт: ритм шагов. Опорная стопа стоит, колено поднимается на проходе.', 10, 40 + chh + 40);
  fs.writeFileSync('walk_test.png', out.toBuffer('image/png')); }
else if (mode === 'sheet') { const N = 16, k = .25, cols = 4, sc2 = createCanvas(W * k * cols, H * k * N / cols), sg = sc2.getContext('2d'); for (let i = 0; i < N; i++) { const t = (i + .5) * TL.TOTAL / N; frame(t); sg.drawImage(cv, (i % cols) * W * k, Math.floor(i / cols) * H * k, W * k, H * k); sg.fillStyle = '#fff'; sg.font = '28px NBL'; sg.fillText(t.toFixed(1) + 's', (i % cols) * W * k + 10, Math.floor(i / cols) * H * k + 34); }
  fs.mkdirSync('final', {recursive: true}); fs.writeFileSync(`final/contact_sheet${PART}.png`, sc2.toBuffer('image/png')); }
