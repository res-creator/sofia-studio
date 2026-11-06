// Chapter 2 · Too Successful (1978–1998): figures & stories -> growth (doubling) -> Kjeld -> the ground moves (patents, copies, games, big chains)
// -> "more": the catalogue triples, sales flat, costs up -> 1998 first loss, 1,000 jobs, an empty chair.
const D = require('./doc.js'); const { E, W, H, clamp, lerp, ss, ease, hash, Scene, U, BH, brick, oddPiece, camera, render, C, PAL, IMG, HAS, cred, photo, print, credit, plate, LIGHT, DARK, studio, paper, fade, stamp, doc, map, arc, card, house } = D;
// a generic little figure (cylinder head, block body) — NOT a copy of any toy design
function figure(sc, x, y, z, col, s = 1) { sc.box({ x: x - 5 * s, y, z: z - 3 * s }, 10 * s, 12 * s, 6 * s, col, {}); sc.cyl({ x, y: y + 12 * s, z }, 0, 0, 0, 4 * s, 6 * s, [244, 206, 80], 12, {}); }
D.segment(module, { chapter: 'c2_growth', build: ({ at, L, T, fx }) => {
  const t = { decades: at('g1', 'decades'), y78: at('g1', '1978'), figures: at('g1', 'figures'), story: at('g1', 'story'), fifteen: at('g1', 'fifteen'), doubled: at('g1', 'doubled'), grandson: at('g1', 'grandson'), kjeld: at('g1', 'Kjeld'),
    ground: at('g2', 'ground'), patents: at('g2', 'patents'), cheaper: at('g2', 'cheaper'), kids: at('g2', 'Kids'), video: at('g2', 'video'), chains: at('g2', 'chains'), walmart: at('g2', 'Walmart'),
    more: at('g3', 'more'), y93: at('g3', '1993'), tripled: at('g3', 'tripled'), sales: at('g3', 'Sales'), costs: at('g3', 'Costs'),
    y98: at('g4', '1998'), lost: at('g4', 'lost'), thousand: at('g4', 'thousand'), looking: at('g4', 'looking') };
  fx('thump', 0.6, 0.5); fx('click', 1.0, 0.7);
  for (let i = 0; i < 8; i++) fx('pop', t.figures + i * 0.15, 0.3); fx('sparkle', t.story, 0.4); for (let i = 0; i < 4; i++) fx('rise', t.doubled - 0.2 + i * 0.7, 0.3); fx('shutter', t.grandson - 0.3, 0.5);
  fx('rumble', t.ground, 0.5); fx('stamp', t.patents + 0.4, 0.5); for (let i = 0; i < 6; i++) fx('thump', t.cheaper + i * 0.18, 0.3); fx('tvon', t.video - 0.1, 0.5); fx('blip', t.video + 0.4, 0.3); fx('blip', t.video + 0.7, 0.3);
  fx('whoosh', t.chains - 0.3, 0.5); fx('stamp', t.walmart, 0.4);
  fx('whoosh', L.g3 - 0.2, 0.4); for (let i = 0; i < 24; i++) fx('flip', t.tripled - 0.4 + i * 0.07, 0.15); fx('slideup', t.costs, 0.5);
  fx('cut', L.g4 - 0.2, 0.4); fx('stamp', t.lost + 0.2, 0.7); fx('heartbeat', t.thousand, 0.5); fx('steps', t.looking, 0.3);
  const S = [];
  S.push({ t0: 0, card: 1, fn: (ctx, g, lt) => card(ctx, lt, 2, 'Too Successful', '1978 — 1998', { c0: '#24324a', c1: '#0e141f', acc: '#E3B341',
    deco: (c, l) => { c.save(); c.globalAlpha = 0.18; for (let i = 0; i < 12; i++) { c.fillStyle = ['#C91A14', '#F5C420', '#0057A8', '#ECEAE4'][i % 4]; c.fillRect(160 + i * 140, 820 - (i % 3) * 30 - Math.min(1, l) * 40, 110, 54); } c.restore(); } }) });
  // 1 · 1978: little figures move into the town — every set becomes a story
  S.push({ t0: L.g1 - 0.2, light: 1, fn: (ctx, g, lt) => { studio(ctx, '#e9f1f4', '#dce7ea', '#bccbd0');
    const cam = camera([lerp(-140, 60, ss(lt / 8)), 110, 240], [0, 10, -10], 38), sc = new Scene();
    sc.box({ x: -220, y: -2, z: -140 }, 440, 2, 280, [104, 160, 96], { ground: 1, edge: 0 }); sc.box({ x: -220, y: 0.2, z: -12 }, 440, 0.5, 24, [110, 110, 118], { ground: 1, layer: 1, edge: 0 });
    [[-140, -70, C.red], [-60, -80, C.yellow], [30, -75, C.white], [120, -70, C.blue], [-120, 70, C.blue], [-20, 75, C.red], [90, 70, C.yellow]].forEach(([x, z, col]) => house(sc, x, 0, z, col));
    const n = Math.floor(clamp((g - t.figures + 0.2) / 1.6) * 10);
    for (let i = 0; i < n; i++) { const walk = (g * 18 + i * 37) % 400 - 200, z = i % 2 ? -6 : 6; figure(sc, i % 2 ? walk : -walk, 0, z, [C.red, C.blue, C.green, C.yellow][i % 4], 1.1); }
    // police car + fire engine (bricks) driving
    const cx = ((g * 40) % 520) - 260; sc.box({ x: cx - 18, y: 3, z: 2 }, 36, 10, 14, C.white, {}); sc.box({ x: cx - 8, y: 13, z: 2 }, 16, 6, 14, C.blue, {});
    render(ctx, sc, cam, Object.assign({}, LIGHT, { fogCol: [220, 230, 232] }));
    E.type(ctx, '1978', 140, 240, g - t.y78, { size: 160, align: 'left', col: '#0057A8' }); plate(ctx, 'LITTLE FIGURES ARRIVE', 140, 330, ss((g - t.figures) / 0.3), { size: 48, bar: '#0057A8' });
    plate(ctx, 'EVERY SET BECOMES A STORY', 140, 420, ss((g - t.story) / 0.3), { size: 40 }); } });
  // 2 · sales roughly double every five years: stacks of bricks double, 1978 -> 1993
  S.push({ t0: t.fifteen - 0.25, light: 1, fn: (ctx, g, lt) => { studio(ctx, '#f2ede3', '#e5ddcf', '#cdc1ab');
    const cam = camera([20, 80, 250], [10, 36, 0], 40), sc = new Scene(), yrs = [1978, 1983, 1988, 1993];
    yrs.forEach((y, i) => { const hgt = Math.pow(2, i), u = clamp((g - t.doubled + 0.3 - i * 0.55) / 0.5); const lv = Math.round(hgt * 1.4 * ease.out(u)); const x = -120 + i * 85;
      for (let l = 0; l < lv; l++) brick(sc, { x: x - 16, y: l * BH, z: -8 }, 4, 2, l === lv - 1 ? C.red : C.yellow, { seg: 8 }); sc.shadow(x, 0, 0, 30, 0.3); });
    const P = render(ctx, sc, cam, LIGHT);
    yrs.forEach((y, i) => { const p = P([-120 + i * 85, -2, 30]); plate(ctx, String(y), p[0], p[1] + 40, ss((g - t.doubled + 0.3 - i * 0.55) / 0.4), { size: 40, align: 'center', bg: 'none', col: '#2a2016' });
      if (i > 0) plate(ctx, '×2', p[0], 170, ss((g - t.doubled - i * 0.55) / 0.3), { size: 46, align: 'center', bg: 'rgba(201,26,20,0.92)' }); });
    plate(ctx, 'SALES ROUGHLY DOUBLED EVERY FIVE YEARS', W / 2, 1000, ss((lt - 0.2) / 0.3), { size: 44, align: 'center' }); } });
  // 3 · the founder's grandson: Kjeld Kirk Kristiansen (archive photo 1996, St. Gallen)
  S.push({ t0: t.grandson - 0.3, fn: (ctx, g, lt) => { ctx.fillStyle = '#1b2230'; ctx.fillRect(0, 0, W, H);
    if (HAS('kjeld96')) { photo(ctx, IMG.kjeld96, lt / 4, { z0: 1.4, z1: 1.5, filter: 'blur(26px) brightness(0.5)' }); print(ctx, IMG.kjeld96, 1300, 500, 760, 0.02, { foot: 40 }); credit(ctx, cred('kjeld96') + ' · CEO 1979–2004', ss((lt - 0.3) / 0.4)); }
    else if (HAS('kjeld18')) { photo(ctx, IMG.kjeld18, lt / 4, { z0: 1.4, z1: 1.5, filter: 'blur(26px) brightness(0.5)' }); print(ctx, IMG.kjeld18, 1300, 480, 520, 0.02, { foot: 40 }); credit(ctx, cred('kjeld18') + ' · photo 2018', ss((lt - 0.3) / 0.4)); }
    else { // family-tree card (no photo yet)
      [['OLE KIRK', 'FOUNDER · 1932'], ['GODTFRED', 'SON · RUNS LEGO FROM 1957'], ['KJELD', 'GRANDSON · CEO FROM 1979']].forEach(([a, b], i) => { const u = ss((lt - 0.2 - i * 0.35) / 0.4); plate(ctx, a, 1180, 300 + i * 220, u, { size: 54, bar: '#E3B341' }); plate(ctx, b, 1180, 370 + i * 220, u, { size: 30 });
        if (i) { ctx.save(); ctx.globalAlpha = u; ctx.strokeStyle = '#E3B341'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(1160, 240 + i * 220 - 20); ctx.lineTo(1160, 240 + i * 220 + 30); ctx.stroke(); ctx.restore(); } }); }
    plate(ctx, "THE FOUNDER'S GRANDSON", 140, 300, ss((g - t.grandson) / 0.3), { size: 40 }); plate(ctx, 'KJELD KIRK KRISTIANSEN', 140, 390, ss((g - t.kjeld) / 0.3), { size: 58, bar: '#E3B341' }); } });
  // 4 · the ground moves: patents expire -> grey look-alike bricks push in
  S.push({ t0: L.g2 - 0.2, light: 1, fn: (ctx, g, lt) => { studio(ctx, '#ecebe7', '#dddbd5', '#bfbbb2');
    const [sx, sy] = g > t.ground && g < t.ground + 0.6 ? [Math.sin(g * 70) * 8 * (1 - (g - t.ground) / 0.6), Math.cos(g * 60) * 6 * (1 - (g - t.ground) / 0.6)] : [0, 0];
    ctx.save(); ctx.translate(sx, sy);
    const cam = camera([0, 90, 260], [0, 10, 0], 40), sc = new Scene();
    for (let i = 0; i < 6; i++) brick(sc, { x: -150 + (i % 3) * 40, y: Math.floor(i / 3) * BH, z: -30 + (i % 2) * 20 }, 4, 2, [C.red, C.yellow, C.blue][i % 3], { seg: 8 });
    const nc = Math.floor(clamp((g - t.cheaper) / 1.4) * 14); for (let i = 0; i < nc; i++) { const u = clamp((g - t.cheaper - i * 0.1) / 0.4), x = lerp(260, 0 + (i % 5) * 36, ease.out(u)), z = -50 + Math.floor(i / 5) * 30;
      brick(sc, { x, y: 0, z, yaw: (1 - u) * 0.6 }, 4, 2, [150, 150, 152], { seg: 8 }); }
    render(ctx, sc, cam, LIGHT);
    // the patent page slides away stamped EXPIRED
    if (HAS('patent1')) { const u = ss((g - t.patents + 0.3) / 0.4) * (1 - ss((g - t.cheaper - 0.3) / 0.4)); if (u > 0) { const pw = 380, ph = pw * IMG.patent1.height / IMG.patent1.width; ctx.save(); ctx.globalAlpha = u; ctx.translate(1450, 520); ctx.rotate(0.06); ctx.fillStyle = '#fff'; ctx.fillRect(-pw / 2, -ph / 2, pw, ph); ctx.drawImage(IMG.patent1, -pw / 2, -ph / 2, pw, ph); ctx.restore(); stamp(ctx, 'EXPIRING', 1450, 520, ss((g - t.patents - 0.1) / 0.3) * u, -0.2, 64); } }
    ctx.restore();
    plate(ctx, 'THE PATENTS RUN OUT', 140, 150, ss((g - t.patents) / 0.3), { size: 50, bar: '#C91A14' }); plate(ctx, 'CHEAPER LOOK-ALIKES', 140, 240, ss((g - t.cheaper) / 0.3), { size: 44 });
    plate(ctx, 'COPIES', 1380, 960, ss((g - t.cheaper - 0.6) / 0.3), { size: 40, align: 'center', bg: 'rgba(90,90,96,0.9)' }); } });
  // 5 · kids turn to video games: a living room at night, the TV glow (code-drawn, original pixel game)
  S.push({ t0: t.kids - 0.2, fn: (ctx, g, lt) => { ctx.fillStyle = '#121624'; ctx.fillRect(0, 0, W, H);
    const tvx = 1100, tvy = 480, tw = 620, th = 460; ctx.save(); ctx.fillStyle = '#2b2b30'; ctx.fillRect(tvx - tw / 2 - 40, tvy - th / 2 - 40, tw + 80, th + 120); ctx.fillStyle = '#0c1a10'; ctx.fillRect(tvx - tw / 2, tvy - th / 2, tw, th);
    // pixel game: a runner and blocks
    const px = 20, cols = ['#46d36b', '#f5c420', '#e8513e', '#5fb7ff']; for (let i = 0; i < 12; i++) { const x = ((i * 120 - g * 160) % (tw + 120) + tw + 120) % (tw + 120) - 60; ctx.fillStyle = cols[i % 4]; ctx.fillRect(tvx - tw / 2 + x, tvy + 120 - (i % 3) * px * 3, px * 2, px * (1 + i % 3)); }
    ctx.fillStyle = '#fff'; const jy = Math.abs(Math.sin(g * 4)) * 90; ctx.fillRect(tvx - 160, tvy + 100 - jy, px * 2, px * 3); ctx.fillStyle = 'rgba(255,255,255,0.06)'; for (let y = 0; y < th; y += 6) ctx.fillRect(tvx - tw / 2, tvy - th / 2 + y, tw, 2);
    ctx.restore(); E.glow(ctx, tvx, tvy, 900, 'rgba(90,170,255,1)', 0.22);
    // forgotten bricks on the carpet (left, in shadow)
    const cam = camera([-60, 60, 200], [-60, 6, 0], 40), sc = new Scene(); for (let i = 0; i < 7; i++) brick(sc, { x: -150 + i * 22, y: 0, z: (i % 3) * 14 - 10, yaw: i }, 4, 2, PAL[i % 6], { seg: 8 }); ctx.save(); ctx.translate(-560, 260); ctx.globalAlpha = 0.85; render(ctx, sc, cam, { fogCol: [18, 22, 36], fogNear: 120, fogFar: 600, amb: 0.2 }); ctx.restore();
    plate(ctx, 'KIDS TURN TO VIDEO GAMES EARLIER', 140, 150, ss((g - t.video + 0.2) / 0.3), { size: 46, bar: '#5fb7ff' }); } });
  // 6 · giant chains decide: a big-box store front (code), a huge cart, tiny LEGO shelf space
  S.push({ t0: t.chains - 0.3, light: 1, fn: (ctx, g, lt) => { const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#8fc3ea'); sky.addColorStop(1, '#e8f1f6'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    const cam = camera([lerp(-200, 120, ss(lt / 4.5)), 70, 520], [0, 60, 0], 46), sc = new Scene();
    sc.box({ x: -900, y: -2, z: -200 }, 1800, 2, 900, [120, 124, 130], { ground: 1, edge: 0 }); for (let i = -6; i < 7; i++) sc.box({ x: i * 120, y: 0.2, z: 60 }, 6, 0.4, 300, [240, 240, 240], { ground: 1, layer: 1, edge: 0 });
    sc.box({ x: -420, y: 0, z: -190 }, 840, 150, 120, [210, 208, 200], {}); sc.box({ x: -430, y: 150, z: -195 }, 860, 18, 130, [0, 70, 150], {}); sc.box({ x: -110, y: 0, z: -72 }, 220, 90, 4, [70, 110, 140], { emissive: 0.5 });
    for (let i = 0; i < 9; i++) sc.box({ x: -300 + i * 70, y: 0, z: 140 + (i % 3) * 40, yaw: 0.2 }, 34, 24, 18, [[200, 40, 40], [40, 80, 200], [240, 240, 240]][i % 3], {}); // parked cars
    const P = render(ctx, sc, cam, Object.assign({}, LIGHT, { fogCol: [220, 230, 236], fogFar: 4000 }));
    const sp = P([0, 159, -130]); ctx.save(); ctx.font = `900 ${Math.max(28, 16000 / Math.max(1, sp[2]))}px ${E.F}`; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('TOY SUPERSTORE', sp[0], sp[1] + 10); ctx.restore();
    plate(ctx, 'GIANT CHAINS DECIDE WHAT SELLS', 140, 150, ss((g - t.chains) / 0.3), { size: 50, bar: '#0057A8' }); plate(ctx, 'WALMART · TOYS "R" US', 140, 240, ss((g - t.walmart) / 0.3), { size: 40 }); } });
  // 7 · LEGO's answer was more: catalogue pages multiply x3; sales flat, costs rising (two clean lines)
  S.push({ t0: L.g3 - 0.2, light: 1, fn: (ctx, g, lt) => { paper(ctx, '#f1ebdf');
    const n = Math.floor(lerp(12, 36, ease.inOut(clamp((g - t.tripled + 0.5) / 1.6))));
    for (let i = 0; i < n; i++) { const c = i % 9, r = Math.floor(i / 9), x = 120 + c * 92, y = 230 + r * 120, k = hash(i);
      ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 10; ctx.fillRect(x, y, 78, 100); ctx.shadowColor = 'transparent';
      ctx.fillStyle = ['#C91A14', '#F5C420', '#0057A8', '#237841', '#E4701C', '#6E46A0'][i % 6]; ctx.fillRect(x + 8, y + 8, 62, 52); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 8, y + 68, 50 * (0.5 + k * 0.5), 8); ctx.fillRect(x + 8, y + 82, 34, 8); ctx.restore(); }
        plate(ctx, '×3 NEW TOYS FROM 1993', 120, 150, ss((g - t.tripled) / 0.3), { size: 52, bar: '#C91A14' });
    // chart (right)
    const cx = 1060, cy = 860, cw = 720, ch = 480, u1 = ss((g - t.sales + 0.2) / 0.9), u2 = ss((g - t.costs + 0.1) / 0.9);
    if (u1 > 0) { ctx.save(); ctx.strokeStyle = '#2a2016'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy - ch); ctx.lineTo(cx, cy); ctx.lineTo(cx + cw, cy); ctx.stroke(); ctx.lineCap = 'round';
      ctx.lineWidth = 12; ctx.strokeStyle = '#237841'; ctx.beginPath(); ctx.moveTo(cx, cy - 220); for (let i = 0; i <= 40 * u1; i++) ctx.lineTo(cx + i / 40 * cw, cy - 220 + Math.sin(i * 0.9) * 6); ctx.stroke();
      if (u2 > 0) { ctx.strokeStyle = '#C91A14'; ctx.beginPath(); ctx.moveTo(cx, cy - 160); for (let i = 0; i <= 40 * u2; i++) ctx.lineTo(cx + i / 40 * cw, cy - 160 - (i / 40) * 260); ctx.stroke(); } ctx.restore();
      plate(ctx, 'SALES: FLAT', cx + cw - 10, cy - 270, u1, { size: 38, align: 'right', bg: 'rgba(35,120,65,0.92)' }); plate(ctx, 'COSTS: UP', cx + cw - 10, cy - 460, u2, { size: 38, align: 'right', bg: 'rgba(201,26,20,0.92)' });
      plate(ctx, '1993 → 1998 · ILLUSTRATIVE', cx, cy + 50, u1, { size: 24, bg: 'none', col: '#5a4a30' }); } } });
  // 8 · 1998: the first loss (annual report, dark) -> 1,000 jobs -> an empty chair
  S.push({ t0: L.g4 - 0.2, beats: [t.thousand - 0.2], fn: (ctx, g, lt) => { ctx.fillStyle = '#16181d'; ctx.fillRect(0, 0, W, H);
    if (g < t.thousand - 0.2) { doc(ctx, 760, 560, 760, 900, -0.03, { title: 'ANNUAL REPORT 1998', tsize: 46, n: 16, seed: 5, draw: (c, w, h) => { c.fillStyle = '#1f1f1f'; c.font = `800 34px ${E.F}`; c.fillText('RESULT FOR THE YEAR', -w / 2 + 40, h / 2 - 170);
        c.fillStyle = '#C91A14'; c.font = `900 72px ${E.F}`; c.fillText('LOSS', -w / 2 + 40, h / 2 - 90); } });
      stamp(ctx, 'FIRST LOSS EVER', 1380, 620, ss((g - t.lost) / 0.25), -0.15, 64); E.type(ctx, '1998', W - 140, 250, g - t.y98, { size: 170, align: 'right', col: '#ff6a55' }); return; }
    // 1,000 dots (people) — a block of them dims away
    const u = ss((g - t.thousand) / 1.4); for (let i = 0; i < 1000; i++) { const c = i % 50, r = Math.floor(i / 50), x = 290 + c * 27, y = 300 + r * 27; ctx.fillStyle = hash(i * 1.3) < u ? 'rgba(90,90,96,0.4)' : '#e9e3d6'; ctx.beginPath(); ctx.arc(x, y, 9, 0, 6.283); ctx.fill(); }
    plate(ctx, '≈ 1,000 JOBS CUT', W / 2, 150, ss((g - t.thousand) / 0.3), { size: 60, align: 'center', bg: 'rgba(201,26,20,0.92)' });
    plate(ctx, 'LEGO STARTS LOOKING FOR SOMEONE TO CHANGE IT', W / 2, 960, ss((g - t.looking) / 0.3), { size: 42, align: 'center' }); } });
  return S; } });
