// How It's Run — 6 TikTok photo carousels (K1–K6 from the owner's 2-week plan, Nov 2026), in the channel style (howitsrun_style/).
// One slide = one idea + one picture: a thin full-body profile person in a real place, one big prop, the text on paper plates.
// Slide 1 = big headline + character, last slide = the question with a drawn arrow. 1080x1920 PNG.
// Usage: node carousels.js [K1..K6]   → carousels_nov/<k>_<slug>/01.png …
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const CL = require('../hirkit/collage');
const ST = require('../howitsrun_style/style');
const P = require('../howitsrun_style/people');
const SE = require('../howitsrun_style/sets');
const { C, F, rr, hash, lerp } = K;
const { INK, fillStroke, ell, tube, px } = R;
const { W, H, PAL, txt, fitTxt } = ST;

// ---------- cast (generic) ----------
const SHOPPER = { ...P.LOOKS.casual, skin: '#EBC09C', hair: '#7A4A2A', top: '#3E8C6E', cuff: '#2F7058', pants: '#4A5578', zip: 1 };
const WOMAN = { skin: '#C98E66', hair: '#2A1A10', hairStyle: 'bun', top: '#B5304A', cuff: '#962840', shirt: '#FFFDF8', pants: '#2E3A59', shoes: '#171717', iris: '#3A2414', brow: '#2A1A10', lashes: 1, lips: '#8A3A3A' };
const STUDENT = { skin: '#F0C3A2', hair: '#D9B26A', hairStyle: 'long', top: '#4D8DFF', cuff: '#3E74D0', pants: '#3A3A44', shoes: '#F4F1E8', sole: '#C9C1B1', iris: '#3E6A8A', brow: '#9A7A3A', lashes: 1, lips: '#B2524A' };
const GAMBLER = { ...P.LOOKS.office, skin: '#8D5A3C', hair: '#1E1612', top: '#2E3A59', cuff: '#24304A', pants: '#2E3A59', brow: '#1E1612' };
const TRAVELER = { ...P.LOOKS.casual, skin: '#E8B48F', hair: '#3A2416', top: '#D9A43B', cuff: '#B88A2E', pants: '#3E4F78', glasses: 1 };
const F_ = (n, look = [1, 0]) => R.expr(n, { look });

// ---------- props (centred, base at 0 unless noted) ----------
const plate = (ctx, s, x, y, size, col = PAL.cream, fg = INK, maxW = 900, rot = -0.02) => ST.label(ctx, s, x, y, 1, { size, col, fg, rot, maxW });
function priceTag(ctx, s, col = C.yellow, sc = 1) { ctx.save(); ctx.scale(sc, sc); CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-150, -80); ctx.lineTo(170, -80); ctx.lineTo(170, 80); ctx.lineTo(-150, 80); ctx.lineTo(-210, 0); ctx.closePath(); }, col, { elev: 1.4 }); ell(ctx, -165, 0, 14, 14); ctx.fillStyle = PAL.cream; ctx.fill(); ctx.lineWidth = px(ctx, 3); ctx.strokeStyle = INK; ctx.stroke(); fitTxt(ctx, s, 10, 34, 96, INK, 300); ctx.restore(); }
function shelf(ctx, w, rows, item) { const rh = 230; CL.cutout(ctx, () => rr(ctx, -w / 2, -rows * rh - 60, w, rows * rh + 60, 10), '#E9E1CE', { elev: 1 }); for (let r = 0; r < rows; r++) { const y = -r * rh - 40; for (let i = 0; i < Math.floor(w / 150); i++) { ctx.save(); ctx.translate(-w / 2 + 75 + i * 150, y); item(ctx, r, i); ctx.restore(); } rr(ctx, -w / 2 - 6, y, w + 12, 26, 4); fillStroke(ctx, '#D8D2C2', 4); } }
const box = (col, lab) => (ctx) => { CL.cutout(ctx, () => rr(ctx, -55, -150, 110, 150, 8), col, { elev: 0.8, tex: 0.3 }); if (lab) fitTxt(ctx, lab, 0, -70, 26, PAL.cream, 96); };
function milk(ctx, s = 1) { ctx.save(); ctx.scale(s, s); SE.poly(ctx, [[-70, 0], [70, 0], [70, -220], [40, -280], [-40, -280], [-70, -220]], '#FFFDF8', 5); rr(ctx, -30, -320, 60, 44, 6); fillStroke(ctx, '#4D8DFF', 4); ctx.fillStyle = '#4D8DFF'; ctx.fillRect(-68, -160, 136, 60); fitTxt(ctx, 'MILK', 0, -118, 40, PAL.cream, 120); ctx.restore(); }
function candy(ctx, s = 1) { ctx.save(); ctx.scale(s, s); for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(-120 + i * 120, 0); rr(ctx, -50, -130, 100, 130, 10); fillStroke(ctx, [C.red, C.yellow, '#8A5A34'][i], 5); fitTxt(ctx, 'CANDY', 0, -56, 24, i === 1 ? INK : PAL.cream, 86); ctx.restore(); } ctx.restore(); }
function cart(ctx, s = 1, load = 0.3) { ctx.save(); ctx.scale(s, s); const ch = '#C9CED6'; ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 12); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-200, -40); ctx.lineTo(220, -40); ctx.moveTo(-200, -40); ctx.lineTo(-250, -470); ctx.stroke(); ctx.strokeStyle = ch; ctx.lineWidth = px(ctx, 7); ctx.stroke();
  for (const x of [-180, 200]) { ell(ctx, x, -18, 22, 22); fillStroke(ctx, '#2A2A2E', 4); }
  const bask = () => { ctx.beginPath(); ctx.moveTo(-230, -460); ctx.lineTo(290, -460); ctx.lineTo(260, -190); ctx.lineTo(-200, -190); ctx.closePath(); };
  bask(); ctx.fillStyle = 'rgba(80,88,98,0.15)'; ctx.fill(); for (let i = 0; i < Math.round(load * 6); i++) { ctx.save(); ctx.translate(-150 + i * 70, -190); box(['#4D8DFF', C.red, '#2FA37E', C.yellow][i % 4])(ctx); ctx.restore(); }
  ctx.save(); bask(); ctx.clip(); ctx.strokeStyle = ch; ctx.lineWidth = px(ctx, 4); for (let x = -260; x < 320; x += 34) { ctx.beginPath(); ctx.moveTo(x, -460); ctx.lineTo(x - 30, -190); ctx.stroke(); } for (let y = -426; y < -190; y += 40) { ctx.beginPath(); ctx.moveTo(-260, y); ctx.lineTo(320, y); ctx.stroke(); } ctx.restore();
  bask(); ctx.lineWidth = px(ctx, 7); ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
function note(ctx, s = 1) { ctx.save(); ctx.scale(s, s); ctx.fillStyle = INK; ell(ctx, -40, 0, 40, 30, -0.4); ctx.fill(); ell(ctx, 90, -30, 40, 30, -0.4); ctx.fill(); ctx.fillRect(-6, -220, 14, 220); ctx.fillRect(122, -250, 14, 220); SE.poly(ctx, [[-6, -220], [136, -250], [136, -200], [-6, -170]], INK, 0); ctx.restore(); }
function phone(ctx, draw, s = 1) { ctx.save(); ctx.scale(s, s); CL.cutout(ctx, () => rr(ctx, -200, -360, 400, 720, 48), '#1C1C22', { elev: 2 }); ctx.save(); rr(ctx, -180, -330, 360, 660, 32); ctx.fillStyle = '#F7F5F0'; ctx.fill(); ctx.clip(); draw(ctx); ctx.restore(); ctx.restore(); }
function card(ctx, s = 1) { ctx.save(); ctx.scale(s, s); CL.cutout(ctx, () => rr(ctx, -200, -125, 400, 250, 22), '#2E3A59', { elev: 1.6 }); rr(ctx, -150, -60, 70, 54, 8); fillStroke(ctx, C.yellow, 3); txt(ctx, '•••• •••• •••• 1234', 0, 60, 34, PAL.cream); ctx.restore(); }
function chips(ctx, s = 1) { ctx.save(); ctx.scale(s, s); for (let i = 0; i < 5; i++) for (let j = 0; j < 4 - (i % 2); j++) { const x = -160 + i * 80, y = -j * 26; ell(ctx, x, y, 44, 16); fillStroke(ctx, [C.red, '#2FA37E', '#2E3A59', C.yellow, '#FFFDF8'][(i + j) % 5], 4); } ctx.restore(); }
function clock(ctx, r = 120, crossed = true) { ell(ctx, 0, 0, r, r); fillStroke(ctx, '#FFFDF8', 7); for (let i = 0; i < 12; i++) { ctx.save(); ctx.rotate(i / 12 * Math.PI * 2); ctx.fillStyle = INK; ctx.fillRect(-4, -r * 0.9, 8, r * 0.14); ctx.restore(); } ctx.strokeStyle = INK; ctx.lineWidth = r * 0.06; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * 0.6); ctx.moveTo(0, 0); ctx.lineTo(r * 0.4, 0); ctx.stroke(); if (crossed) ST.bigX(ctx, r * 1.05, 1); }
function cocktail(ctx, s = 1) { ctx.save(); ctx.scale(s, s); SE.poly(ctx, [[-90, -200], [90, -200], [0, -80]], '#9FD8E8', 5); tube(ctx, [[0, -80], [0, 0]], 12, '#C9CED6', 4); ell(ctx, 0, 0, 60, 12); fillStroke(ctx, '#C9CED6', 4); ell(ctx, 40, -200, 24, 24); fillStroke(ctx, C.red, 4); fitTxt(ctx, 'FREE', 0, 60, 40, C.red, 160); ctx.restore(); }
function exitSign(ctx, s = 1, faded = true) { ctx.save(); ctx.scale(s, s); ctx.globalAlpha *= faded ? 0.45 : 1; CL.cutout(ctx, () => rr(ctx, -160, -70, 320, 140, 12), '#2FA37E', { elev: 1 }); txt(ctx, 'EXIT', 0, 30, 90, PAL.cream); ctx.restore(); }
function envelopeIcon(ctx, s = 1, crossed = false) { ctx.save(); ctx.scale(s, s); rr(ctx, -170, -110, 340, 220, 16); fillStroke(ctx, '#F4EEDF', 6); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.beginPath(); ctx.moveTo(-170, -110); ctx.lineTo(0, 20); ctx.lineTo(170, -110); ctx.stroke(); txt(ctx, 'TRIAL ENDS SOON', 0, 80, 26, C.red); if (crossed) ST.bigX(ctx, 150, 1); ctx.restore(); }
function plane(ctx, s = 1, col = '#4D8DFF') { ctx.save(); ctx.scale(s, s); rr(ctx, -300, -40, 600, 80, 40); fillStroke(ctx, '#FFFDF8', 5); SE.poly(ctx, [[-60, 10], [-170, 150], [-110, 150], [40, 10]], col, 5); SE.poly(ctx, [[-300, -20], [-330, -130], [-270, -130], [-210, -30]], col, 5); for (let i = 0; i < 8; i++) { ell(ctx, -200 + i * 50, -10, 9, 11); fillStroke(ctx, '#BFE0FA', 3); } ctx.restore(); }
function seatMap(ctx, sold) { const groups = [['$89', '#2FA37E'], ['$129', C.yellow], ['$189', C.red]]; groups.forEach(([p, col], g) => { for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { const x = -330 + i * 70 + (i > 1 ? 40 : 0), y = -260 + (g * 3 + r) * 64; rr(ctx, x, y, 56, 50, 10); fillStroke(ctx, g < sold ? '#B9B1A3' : col, 3.5); } fitTxt(ctx, g < sold ? 'SOLD OUT' : p, 180, -200 + g * 192, 46, g < sold ? '#8A8A8A' : INK, 260); }); }
function gasSign(ctx) { CL.cutout(ctx, () => rr(ctx, -260, -330, 520, 330, 16), '#2E3A59', { elev: 1.6 }); txt(ctx, 'GAS', 0, -250, 60, PAL.cream); rr(ctx, -220, -210, 440, 170, 12); ctx.fillStyle = '#10261C'; ctx.fill(); txt(ctx, '$3.49', -30, -95, 110, C.yellow); txt(ctx, '9', 175, -150, 54, C.yellow); txt(ctx, '10', 175, -88, 40, C.yellow); ctx.fillStyle = C.yellow; ctx.fillRect(150, -136, 50, 5); tube(ctx, [[0, 0], [0, 260]], 30, '#5A606B', 5); }
function tvAd(ctx, s = 1) { ctx.save(); ctx.scale(s, s); CL.cutout(ctx, () => rr(ctx, -260, -180, 520, 360, 20), '#2A2A30', { elev: 1.4 }); rr(ctx, -230, -150, 460, 300, 10); ctx.fillStyle = C.yellow; ctx.fill(); txt(ctx, 'AD', 0, 40, 140, INK); ctx.restore(); }
function bars(ctx, vals) { vals.forEach((v, i) => { rr(ctx, -200 + i * 110, -v, 80, v, 8); fillStroke(ctx, ['#2FA37E', C.yellow, C.red, '#4D8DFF'][i % 4], 4); }); }

// ---------- slide frame ----------
// sc: { bg: (ctx, t) world set at floor y=0 drawn via layer, cam: {x,y,z}, person: [L, x, s, facing, P, acc], prop: (ctx)=> screen-space, text: [lines], big }
function slide(n, total, title, sc) {
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  ST.layer(ctx, sc.cam || { x: 0, y: -500, z: 1.15 }, 1, w => { sc.bg(w); if (sc.person) { const [L, x, s, f, Pp, acc] = sc.person; P.person(w, x, 0, s, f, L, Pp || {}, acc || {}); } if (sc.world) sc.world(w); });
  if (sc.prop) sc.prop(ctx);
  ST.grade(ctx, sc.grade || 'day', 0.18);
  // text plates (top, inside the 3:4 crop)
  ST.stampLabel(ctx, `HOW IT'S RUN · ${title}`, 262);
  const lines = sc.text || []; lines.forEach((l, i) => { const big = i === 0 && sc.big; plate(ctx, l, W / 2, 400 + i * (big ? 130 : 105), big ? 92 : 62, i === 0 && sc.red ? C.red : PAL.cream, i === 0 && sc.red ? PAL.cream : INK, 980, i % 2 ? 0.02 : -0.02); });
  if (sc.question) ST.questionCard(ctx, 0.3, sc.question[0], sc.question[1], 1, { arrow: true, y: 450 });
  // slide counter
  ctx.save(); ctx.translate(W / 2, 1450); ctx.font = `30px ${F.black}`; const s = `${n} / ${total}`, w = ctx.measureText(s).width + 36; CL.cutout(ctx, () => rr(ctx, -w / 2, -26, w, 48, 10), '#171717', { elev: 0.6, tex: 0 }); txt(ctx, s, 0, 10, 30, PAL.cream); ctx.restore();
  ST.paper(ctx);
  return cv;
}
// backgrounds
const store = (w) => { SE.room(w, 0, { wall: '#EFE8D8', floor: 'tile' }); w.save(); w.translate(-700, 0); shelf(w, 700, 3, (c, r, i) => box(['#4D8DFF', C.red, '#2FA37E', C.yellow, '#8A5A34'][(r + i) % 5])(c)); w.restore(); };
const street = (w) => { SE.sky(w, 0, { clouds: 2 }); SE.ground(w, 'road'); SE.houses(w, -1800, 8); };
const homeRoom = (w) => SE.room(w, 0, { wall: '#DCE6EE', floor: 'wood', window: 600 });
const casino = (w) => { SE.room(w, 0, { wall: '#5A1E2A', floor: 'carpet', carpet: '#7A2A3A' }); for (let i = 0; i < 9; i++) { R.ell(w, -1400 + i * 350, -1300, 40, 40); w.fillStyle = 'rgba(255,220,120,0.9)'; w.fill(); } w.save(); w.translate(500, 0); rr(w, -350, -300, 700, 60, 30); fillStroke(w, '#2F7A4A', 5); rr(w, -330, -240, 660, 240, 10); fillStroke(w, '#5A3A22', 5); w.restore(); };
const airport = (w) => { SE.sky(w, 0, { clouds: 3, hills: false }); w.fillStyle = '#B9C2C9'; w.fillRect(-4000, -120, 8000, 120); w.fillStyle = '#8E959E'; w.fillRect(-4000, 0, 8000, 2000); };

// ---------- the 6 carousels ----------
const CAR = {
  K1: { slug: 'supermarket_tricks', title: 'SUPERMARKETS', slides: [
    { big: true, red: true, text: ['6 SUPERMARKET TRICKS', 'They want you to spend more. Here\'s how.'], bg: store, person: [SHOPPER, -260, 1.2, 1, { face: F_('surprised') }], world: w => { w.save(); w.translate(260, 0); cart(w, 0.9, 0.8); w.restore(); } },
    { text: ['Milk is at the back —', 'so you walk past everything else.'], bg: store, person: [SHOPPER, -150, 1.0, 1, { ...R.walk(1), face: F_('tired') }], world: w => { w.save(); w.translate(330, -330); milk(w, 1.2); w.restore(); } },
    { text: ['Expensive brands sit at eye level.', 'Cheaper ones are lower.'], bg: store, person: [WOMAN, -290, 1.2, 1, { face: F_('thinking', [1, -0.2]) }], prop: c => { c.save(); c.translate(720, 760); priceTag(c, '$6.99', C.red, 0.8); c.restore(); c.save(); c.translate(720, 1240); priceTag(c, '$2.49', '#2FA37E', 0.8); c.restore(); } },
    { text: ['Candy waits at the checkout —', 'while you stand in line.'], bg: store, person: [SHOPPER, -300, 1.2, 1, { face: F_('squint', [1, 0.3]) }], world: w => { w.save(); w.translate(200, -300); candy(w, 1.1); w.restore(); } },
    { text: ['Carts keep getting bigger.', 'A half-empty cart feels like "not enough".'], bg: store, person: [SHOPPER, -420, 1.15, 1, { face: F_('worried') }], world: w => { w.save(); w.translate(160, 0); cart(w, 1.2, 0.3); w.restore(); } },
    { text: ['Slow music = you walk slower', '= you buy more.'], bg: store, person: [WOMAN, -200, 1.15, 1, { ...R.walk(0.5), face: F_('smile') }], prop: c => { c.save(); c.translate(760, 900); note(c, 1.1); c.restore(); } },
    { question: [['WHICH TRICK'], 'GOT YOU?'], bg: store, person: [SHOPPER, 0, 0.8, 1, { face: F_('skeptical', [0, 0]) }], cam: { x: 0, y: -400, z: 1.05 } } ] },
  K2: { slug: 'why_prices_end_in_99', title: 'PRICES', slides: [
    { big: true, red: true, text: ['$9.99 IS NOT $10.', 'Your brain thinks so too.'], bg: store, person: [WOMAN, -290, 1.25, 1, { face: F_('surprised') }], prop: c => { c.save(); c.translate(720, 980); c.rotate(-0.08); priceTag(c, '$9.99'); c.restore(); } },
    { text: ['We read left to right:', '"9" feels much cheaper than "10".'], bg: store, prop: c => { c.save(); c.translate(320, 1000); priceTag(c, '$9.99', '#2FA37E', 0.9); c.restore(); c.save(); c.translate(780, 1000); priceTag(c, '$10.00', C.red, 0.9); c.restore(); }, person: [SHOPPER, -60, 1.0, 1, { face: F_('thinking', [1, -0.4]) }], cam: { x: 0, y: -260, z: 0.95 } },
    { text: ['That\'s why almost no store', 'uses round prices.'], bg: store, person: [SHOPPER, -290, 1.1, 1, { face: F_('smug') }], prop: c => { ['$4.99', '$19.99', '$0.99'].forEach((p, i) => { c.save(); c.translate(690 + (i % 2) * 120, 820 + i * 190); c.rotate((i - 1) * 0.06); priceTag(c, p, C.yellow, 0.6); c.restore(); }); } },
    { text: ['Gas stations go further:', '$3.49 9/10'], bg: street, person: [SHOPPER, -420, 1.15, 1, { face: F_('squint') }], world: w => { w.save(); w.translate(150, -380); w.scale(0.85, 0.85); gasSign(w); w.restore(); } },
    { text: ['Round prices ($100) are used for luxury —', 'to feel "premium".'], bg: homeRoom, person: [WOMAN, -290, 1.2, 1, { face: F_('smug', [1, -0.2]) }], prop: c => { c.save(); c.translate(720, 980); priceTag(c, '$100', '#FFFDF8', 0.9); c.restore(); } },
    { question: [['WOULD YOU NOTICE'], 'THE EXTRA 1 CENT?'], bg: store, person: [WOMAN, 0, 0.8, 1, { face: F_('skeptical', [0, 0]) }], cam: { x: 0, y: -400, z: 1.05 } } ] },
  K3: { slug: 'how_free_apps_make_money', title: 'FREE APPS', slides: [
    { big: true, red: true, text: ['THE APP IS FREE.', 'So who\'s paying?'], bg: homeRoom, person: [STUDENT, -330, 1.25, 1, { face: F_('surprised', [1, -0.2]) }], prop: c => { c.save(); c.translate(700, 1000); phone(c, g => { txt(g, 'FREE', 0, 30, 120, '#2FA37E'); txt(g, 'INSTALL', 0, 160, 50, INK); }, 0.9); c.restore(); } },
    { text: ['Ads —', 'your attention is the product.'], bg: homeRoom, person: [STUDENT, -360, 1.2, 1, { face: F_('tired', [1, 0.1]) }], prop: c => { c.save(); c.translate(700, 980); tvAd(c, 0.9); c.restore(); } },
    { text: ['Your data —', 'what you like, where you go.'], bg: street, person: [STUDENT, -290, 1.15, 1, { ...R.walk(1.5), face: F_('neutral') }], prop: c => { c.save(); c.translate(720, 960); phone(c, g => { for (let i = 0; i < 6; i++) { R.ell(g, -100 + (i % 3) * 100, -120 + Math.floor(i / 3) * 160, 30, 30); g.fillStyle = C.red; g.fill(); } txt(g, 'LOCATION · LIKES', 0, 220, 30, INK); }, 0.8); c.restore(); } },
    { text: ['In-app purchases —', 'small payments add up.'], bg: homeRoom, person: [STUDENT, -290, 1.2, 1, { face: F_('worried') }], prop: c => { c.save(); c.translate(700, 1150); bars(c, [80, 160, 260, 380]); txt(c, '$0.99 + $0.99 + $0.99…', 0, 70, 44, INK); c.restore(); } },
    { text: ['"Free trial"', '→ paid subscription.'], bg: homeRoom, person: [STUDENT, -290, 1.2, 1, { face: F_('shocked') }], prop: c => { c.save(); c.translate(720, 1000); card(c, 1.1); c.restore(); } },
    { question: [['WHICH FREE APP'], 'DO YOU USE THE MOST?'], bg: homeRoom, person: [STUDENT, 0, 0.8, 1, { face: F_('smile', [0, 0]) }], cam: { x: 0, y: -400, z: 1.05 } } ] },
  K4: { slug: 'why_casinos_have_no_clocks', title: 'CASINOS', grade: 'office', slides: [
    { big: true, red: true, text: ['NO CLOCKS IN CASINOS', 'They don\'t want you to know the time.'], bg: casino, person: [GAMBLER, -290, 1.2, 1, { face: F_('thinking', [1, -0.5]) }], prop: c => { c.save(); c.translate(760, 900); clock(c, 140); c.restore(); } },
    { text: ['No clocks,', 'often no windows.'], bg: casino, person: [GAMBLER, -300, 1.15, 1, { ...R.walk(2), face: F_('neutral') }], prop: c => { c.save(); c.translate(760, 980); clock(c, 110); c.restore(); } },
    { text: ['Chips instead of cash —', 'it doesn\'t feel like money.'], bg: casino, person: [GAMBLER, -290, 1.15, 1, { face: F_('grin') }], world: w => { w.save(); w.translate(260, -300); chips(w, 1.0); w.restore(); } },
    { text: ['Free drinks', 'keep you at the table.'], bg: casino, person: [GAMBLER, -290, 1.15, 1, { face: F_('smile') }], world: w => { w.save(); w.translate(260, -300); cocktail(w, 1.0); w.restore(); } },
    { text: ['Exits are hard to find', 'on purpose.'], bg: casino, person: [GAMBLER, -150, 1.15, -1, { face: F_('worried', [1, -0.3]) }], prop: c => { c.save(); c.translate(760, 820); exitSign(c, 0.9); c.restore(); } },
    { question: [['HAVE YOU EVER LOST'], 'TRACK OF TIME?'], bg: casino, person: [GAMBLER, 0, 0.8, 1, { face: F_('skeptical', [0, 0]) }], cam: { x: 0, y: -400, z: 1.05 } } ] },
  K5: { slug: 'free_trial_traps', title: 'FREE TRIALS', slides: [
    { big: true, red: true, text: ['"FREE FOR 7 DAYS"', 'is rarely free.'], bg: homeRoom, person: [WOMAN, -290, 1.2, 1, { face: F_('skeptical', [1, -0.1]) }], prop: c => { c.save(); c.translate(720, 1000); phone(c, g => { txt(g, '7 DAYS', 0, -10, 90, '#2FA37E'); txt(g, 'FREE', 0, 90, 80, INK); }, 0.85); c.restore(); } },
    { text: ['They ask for your card', '"just to check".'], bg: homeRoom, person: [WOMAN, -290, 1.2, 1, { face: F_('worried') }], prop: c => { c.save(); c.translate(720, 1000); card(c, 1.1); c.restore(); } },
    { text: ['The reminder email', 'never comes.'], bg: homeRoom, person: [WOMAN, -290, 1.2, 1, { face: F_('neutral') }], prop: c => { c.save(); c.translate(720, 980); envelopeIcon(c, 1, true); c.restore(); } },
    { text: ['Canceling takes 5 clicks —', 'signing up took 1.'], bg: homeRoom, person: [WOMAN, -290, 1.2, 1, { face: F_('tired') }], prop: c => { c.save(); c.translate(720, 1150); bars(c, [60, 330]); txt(c, '1 vs 5', 0, 70, 50, INK); c.restore(); } },
    { text: ['Tip: cancel right after you sign up.', 'Most trials keep working until the end.'], bg: homeRoom, person: [WOMAN, -290, 1.2, 1, { face: F_('smile'), armN: { hand: [150, -380], grip: 'point' } }], prop: c => { c.save(); c.translate(760, 1000); ST.stampWord(c, 'CANCEL', 110, 1, '#2FA37E', -0.1); c.restore(); } },
    { question: [['WHAT SUBSCRIPTION'], 'DID YOU FORGET ABOUT?'], bg: homeRoom, person: [WOMAN, 0, 0.8, 1, { face: F_('skeptical', [0, 0]) }], cam: { x: 0, y: -400, z: 1.05 } } ] },
  K6: { slug: 'why_flight_prices_change', title: 'FLIGHTS', slides: [
    { big: true, red: true, text: ['ONE HOUR LATER: +$80', 'You checked a flight. Then it jumped.'], bg: airport, person: [TRAVELER, -290, 1.2, 1, { face: F_('shocked') }], prop: c => { c.save(); c.translate(720, 980); phone(c, g => { txt(g, '$209', 0, -40, 100, INK); g.strokeStyle = C.red; g.lineWidth = 10; g.beginPath(); g.moveTo(-110, -70); g.lineTo(110, -70); g.stroke(); txt(g, '$289', 0, 100, 110, C.red); }, 0.85); c.restore(); } },
    { text: ['Seats are sold in price groups —', 'cheap seats run out first.'], bg: airport, prop: c => { c.save(); c.translate(560, 1050); seatMap(c, 0); c.restore(); } },
    { text: ['When a group sells out,', 'the price jumps.'], bg: airport, prop: c => { c.save(); c.translate(560, 1050); seatMap(c, 1); c.restore(); } },
    { text: ['Incognito mode?', 'Mostly a myth.'], bg: homeRoom, person: [TRAVELER, -290, 1.2, 1, { face: F_('skeptical') }], prop: c => { c.save(); c.translate(720, 1000); phone(c, g => { g.fillStyle = '#2A2A30'; g.fillRect(-180, -330, 360, 660); txt(g, 'INCOGNITO', 0, 20, 50, PAL.cream); }, 0.85); c.restore(); c.save(); c.translate(720, 1000); ST.stampWord(c, 'MYTH', 90, 1); c.restore(); } },
    { text: ['Prices change with demand,', 'dates and time to departure.'], bg: airport, person: [TRAVELER, -290, 1.15, 1, { ...R.walk(1), face: F_('thinking') }], world: w => { w.save(); w.translate(200, -700); plane(w, 0.7); w.restore(); } },
    { question: [['WHAT\'S THE CHEAPEST'], 'FLIGHT YOU EVER FOUND?'], bg: airport, person: [TRAVELER, 0, 0.8, 1, { face: F_('grin', [0, 0]) }], cam: { x: 0, y: -400, z: 1.05 } } ] },
};

const want = process.argv.slice(2); const keys = want.length ? want : Object.keys(CAR);
for (const k of keys) { const c = CAR[k], dir = `${__dirname}/${k}_${c.slug}`; fs.mkdirSync(dir, { recursive: true });
  c.slides.forEach((s, i) => { const cv = slide(i + 1, c.slides.length, c.title, { grade: c.grade, ...s }); fs.writeFileSync(`${dir}/${String(i + 1).padStart(2, '0')}.png`, cv.toBuffer('image/png')); });
  console.log(k, c.slides.length, 'slides →', dir); }
