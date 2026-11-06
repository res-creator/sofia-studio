// Chapter 5 · The Outsider (2004–2005): the CEO box changes hands (family line -> outsider, age 35) -> survival checklist -> Legoland sold (photo + map of
// four parks, 70/30) -> elements cut 14,000 -> ~7,000 -> the same few pieces build police station, fire truck, race car -> retailers' calendar ->
// adult fans: the 1998 robot brick (photo), not sued, 2005 convention -> back in profit: three results 2003/2004/2005.
const D = require('./doc.js'); const { E, W, H, clamp, lerp, ss, ease, hash, Scene, U, BH, brick, oddPiece, camera, render, C, PAL, IMG, HAS, cred, photo, print, credit, plate, LIGHT, DARK, studio, paper, fade, stamp, doc, map, pin, arc, card, house } = D;
D.segment(module, { chapter: 'c5_outsider', build: ({ at, L, T, fx }) => {
  const t = { oct: at('o1', 'October'), stepped: at('o1', 'stepped'), outside: at('o1', 'outside'), first: at('o1', 'first'), young: at('o1', 'young'), name: at('o1', 'Knudstorp'), thirty: at('o1', 'thirty'),
    three: at('o2', 'three'), goal: at('o2', 'goal'), survival: at('o2', 'survival'), cash: at('o2', 'cash'), cut: at('o2', 'cut'),
    backed: at('o3', 'backed'), legoland: at('o3', 'Legoland'), y68: at('o3', '1968'), y05: at('o3', '2005'), seventy: at('o3', 'seventy'), four: at('o3', 'four'), blackstone: at('o3', 'Blackstone'), euros: at('o3', 'euros'),
    pieces: at('o4', 'pieces'), existed: at('o4', 'existed'), half: at('o4', 'half'), seven: at('o4', 'seven'),
    fewer: at('o5', 'fewer'), police: at('o5', 'police'), fire: at('o5', 'fire'), race: at('o5', 'race'),
    retailers: at('o6', 'retailers'), unfocused: at('o6', 'unfocused'), planned: at('o6', 'planned'),
    fans: at('o7', 'fans'), adults: at('o7', 'adults'), y98: at('o7', '1998'), student: at('o7', 'student'), robot: at('o7', 'robot'), sue: at('o7', 'sue'), y2005: at('o7', '2005'), convention: at('o7', 'convention'),
    worked: at('o8', 'worked'), profit: at('o8', 'profit'), five: at('o8', 'five') };
  fx('thump', 0.6, 0.5); fx('click', 1.0, 0.7);
  fx('slideup', t.stepped, 0.4); fx('snip', t.outside, 0.5); fx('ding', t.name, 0.4); fx('stamp', t.thirty, 0.5);
  fx('paper', L.o2, 0.4); for (const x of [t.survival, t.cash, t.cut]) fx('tick', x, 0.6); fx('snip', t.cut + 0.3, 0.5);
  fx('shutter', t.legoland - 0.2, 0.5); fx('pop', t.four, 0.5); fx('stamp', t.seventy, 0.5); fx('kaching', t.euros, 0.5);
  fx('whoosh', L.o4 - 0.2, 0.4); for (let i = 0; i < 20; i++) fx('flutter', t.half + i * 0.06, 0.15); fx('stamp', t.seven, 0.5);
  for (let i = 0; i < 18; i++) fx('click', t.fewer + i * 0.2, 0.3);
  fx('paper', t.retailers, 0.4); fx('tear', t.unfocused, 0.3); for (let i = 0; i < 8; i++) fx('tap', t.planned + i * 0.12, 0.3);
  fx('murmur', t.fans, 0.3); fx('shutter', t.robot - 0.2, 0.5); fx('stamp', t.sue + 0.2, 0.5); fx('applause', t.convention, 0.4);
  fx('rise', t.worked, 0.5); fx('kaching', t.profit, 0.6); fx('crowdcheer', t.five + 0.3, 0.2);
  const S = [];
  S.push({ t0: 0, card: 1, fn: (ctx, g, lt) => card(ctx, lt, 5, 'The Outsider', '2004 — 2005', { c0: '#1d3a2c', c1: '#08130d', acc: '#9EE09E' }) });
  // 1 · October 2004: the family line breaks — the CEO box goes to an outsider
  S.push({ t0: L.o1 - 0.2, fn: (ctx, g, lt) => { ctx.fillStyle = '#14202a'; ctx.fillRect(0, 0, W, H);
    const fam = [['OLE KIRK CHRISTIANSEN', 'FOUNDER'], ['GODTFRED KIRK CHRISTIANSEN', 'SON'], ['KJELD KIRK KRISTIANSEN', 'GRANDSON · CEO 1979–2004']];
    fam.forEach(([n, y], i) => { const a = ss((lt - 0.1 - i * 0.25) / 0.4), x = 160, yy = 230 + i * 190; plate(ctx, n, x, yy, a * (i === 2 ? 1 - 0.5 * ss((g - t.stepped) / 0.5) : 0.8), { size: 40, bar: '#E3B341' }); plate(ctx, y, x, yy + 64, a * 0.85, { size: 26 });
      if (i) { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#E3B341'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(150, yy - 120); ctx.lineTo(150, yy - 30); ctx.stroke(); ctx.restore(); } });
    // break in the family line
    const br = ss((g - t.outside) / 0.4); if (br > 0) { ctx.save(); ctx.strokeStyle = '#ff6a55'; ctx.lineWidth = 6; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.moveTo(150, 700); ctx.lineTo(150, 700 + 130 * br); ctx.stroke(); ctx.restore(); }
    const k = ss((g - t.young) / 0.5); if (k > 0) { plate(ctx, 'JØRGEN VIG KNUDSTORP', 160, 860, k, { size: 52, bg: 'rgba(227,179,65,0.96)', col: '#141414' }); plate(ctx, 'CEO FROM OCTOBER 2004 · FIRST OUTSIDE THE FAMILY', 160, 940, k, { size: 28 });
      if (HAS('knud')) { ctx.save(); ctx.globalAlpha = k; print(ctx, IMG.knud, 1400, 520, 520, 0.02, { foot: 40 }); ctx.restore(); credit(ctx, cred('knud') + ' · photo 2010, event 2004', k); } }
    plate(ctx, 'AGE 35', 1400, 940, ss((g - t.thirty) / 0.3), { size: 64, align: 'center', bg: 'rgba(201,26,20,0.95)' }); } });
  // 2 · survival first: a checklist on a clipboard
  S.push({ t0: L.o2 - 0.2, light: 1, fn: (ctx, g, lt) => { paper(ctx, '#d9d3c7');
    ctx.save(); ctx.translate(W / 2, H / 2 + 20); ctx.rotate(-0.02); ctx.fillStyle = '#7a5a36'; ctx.fillRect(-420, -480, 840, 980); ctx.fillStyle = '#fbf8f0'; ctx.fillRect(-380, -420, 760, 890); ctx.fillStyle = '#9aa0a6'; ctx.fillRect(-120, -500, 240, 70);
    ctx.fillStyle = '#1f1f1f'; ctx.font = `900 54px ${E.F}`; ctx.fillText('FIRST GOAL', -330, -320);
    const items = [['NOT GROWTH', t.goal, false], ['SURVIVAL', t.survival, true], ['GET CASH UNDER CONTROL', t.cash, true], ['CUT WHAT WE CAN’T AFFORD', t.cut, true]];
    items.forEach(([s, t0, ok], i) => { const a = ss((g - t0) / 0.3), y = -200 + i * 150; ctx.globalAlpha = a; ctx.strokeStyle = '#1f1f1f'; ctx.lineWidth = 5; ctx.strokeRect(-330, y - 36, 60, 60);
      ctx.fillStyle = ok ? '#1f1f1f' : '#9a8f80'; ctx.font = `800 46px ${E.F}`; ctx.fillText(s, -240, y + 10); if (ok) { ctx.strokeStyle = '#237841'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-322, y - 4); ctx.lineTo(-300, y + 20); ctx.lineTo(-262, y - 40); ctx.stroke(); }
      else { ctx.strokeStyle = '#C91A14'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-250, y - 2); ctx.lineTo(80, y - 2); ctx.stroke(); } ctx.globalAlpha = 1; });
    ctx.restore(); plate(ctx, '3 YEARS STUDYING HOW LEGO MADE AND LOST MONEY', W / 2, 1030, ss((g - t.three) / 0.3), { size: 34, align: 'center' }); } });
  // 3 · the family backs him; Legoland is sold: photo -> four parks on a map, 70 % -> Blackstone, €375M
  S.push({ t0: L.o3 - 0.2, beats: [t.y05 - 0.2], fn: (ctx, g, lt) => {
    if (g < t.y05 - 0.2) { if (HAS('legoland')) { photo(ctx, IMG.legoland, lt / 9, { z0: 1.05, z1: 1.2 }); credit(ctx, cred('legoland') + ' · park opened 1968', 1); } else { paper(ctx, '#cfe0d4'); ctx.save(); ctx.translate(W / 2 + 200, H / 2 + 60); ctx.rotate(-0.05); ctx.fillStyle = '#fff8e8'; ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 30; ctx.fillRect(-420, -200, 840, 400); ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#C91A14'; ctx.lineWidth = 6; ctx.setLineDash([16, 10]); ctx.beginPath(); ctx.moveTo(220, -200); ctx.lineTo(220, 200); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#C91A14'; ctx.font = `900 76px ${E.F}`; ctx.fillText('LEGOLAND', -380, -60);
        ctx.fillStyle = '#1f1f1f'; ctx.font = `800 40px ${E.F}`; ctx.fillText('BILLUND · DENMARK', -380, 10); ctx.font = `700 30px ${E.F}`; ctx.fillText('ADMIT ONE', -380, 120); ctx.save(); ctx.translate(320, 0); ctx.rotate(-Math.PI / 2); ctx.font = `900 40px ${E.F}`; ctx.fillText('1968', -50, 14); ctx.restore(); ctx.restore(); }
      plate(ctx, 'THE FAMILY STAYS AS OWNER — AND BACKS HIM', 120, 140, ss((g - t.backed) / 0.3) * (1 - ss((g - t.legoland) / 0.3)), { size: 46 });
      plate(ctx, 'LEGOLAND BILLUND', 120, 140, ss((g - t.legoland) / 0.3), { size: 62, bar: '#E3B341' }); plate(ctx, 'OPENED BY THE FAMILY IN 1968', 120, 230, ss((g - t.y68) / 0.3), { size: 40 }); return; }
    const to = map(ctx, -45, 45, 12, {}, { sea: '#c4d6db', land: '#e6dcc6' }), parks = [['BILLUND', 9.12, 55.73], ['WINDSOR', -0.65, 51.46], ['GÜNZBURG', 10.3, 48.44], ['CARLSBAD', -117.31, 33.13]];
    parks.forEach(([n, lo, la], i) => { const [x, y] = to(lo, la), a = clamp((g - t.four + 0.2 - i * 0.2) / 0.4); pin(ctx, x, y, a); plate(ctx, n, x + 24, y - 40, ss(a), { size: 26 }); });
    const p = ss((g - t.seventy) / 0.6), cx = 1620, cy = 800, R = 170; if (p > 0) { ctx.save(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, R + 14, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#1f1f1f'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + 6.283 * 0.7 * p); ctx.fill(); ctx.fillStyle = '#C91A14'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, -Math.PI / 2 + 6.283 * 0.7, -Math.PI / 2 + 6.283); ctx.fill(); ctx.restore();
      plate(ctx, '70% → BLACKSTONE', cx, cy - R - 60, p, { size: 40, align: 'center' }); plate(ctx, 'LEGO KEEPS 30%', cx, cy + R + 56, p, { size: 30, align: 'center', bg: 'rgba(201,26,20,0.95)' }); }
    plate(ctx, '2005 · FOUR LEGOLAND PARKS SOLD', 120, 140, ss((g - t.y05) / 0.3), { size: 50, bar: '#C91A14' }); plate(ctx, '€375 MILLION', 120, 240, ss((g - t.euros) / 0.3), { size: 70, bg: 'rgba(20,20,22,0.88)' }); } });
  // 4 · the pieces: about 14,000 -> about 7,000 (the tile field from chapter 3 halves)
  S.push({ t0: L.o4 - 0.2, light: 1, fn: (ctx, g, lt) => { paper(ctx, '#ece6da');
    const u = ease.inOut(clamp((g - t.half + 0.3) / 1.6)), n = Math.round(lerp(14000, 7000, u)), cols = 160, cell = 11, x0 = 80, y0 = 260;
    for (let i = 0; i < 14000; i++) { const c = i % cols, r = Math.floor(i / cols); if (r > 66) break; const keep = hash(i * 1.37) > 0.46 || i < 3000; const a = keep ? 1 : 1 - u;
      if (a <= 0.02) continue; ctx.globalAlpha = a; ctx.fillStyle = keep ? '#237841' : '#C91A14'; ctx.fillRect(x0 + c * cell, y0 + r * cell, cell - 2, cell - 2); } ctx.globalAlpha = 1;
    plate(ctx, `${(Math.round(n / 100) * 100).toLocaleString('en-US')} DIFFERENT ELEMENTS`, 80, 140, 1, { size: 60, bar: '#237841' });
    plate(ctx, 'DESIGNERS WORK WITH WHAT ALREADY EXISTS', 80, 220, ss((g - t.existed) / 0.3), { size: 36 }); plate(ctx, 'CUT ROUGHLY IN HALF', W - 80, 990, ss((g - t.half) / 0.3), { size: 50, align: 'right', bg: 'rgba(35,120,65,0.95)' }); plate(ctx, 'SOURCE: INGENIØREN (2006) · ROBERTSON, BRICK BY BRICK (2013)', 80, 1040, 1, { size: 22, bg: 'rgba(0,0,0,0.5)' }); } });
  // 5 · with fewer pieces: the same classic bricks build a police station, a fire truck, a race car
  S.push({ t0: L.o5 - 0.2, light: 1, fn: (ctx, g, lt) => { studio(ctx, '#eef3f6', '#e2e9ee', '#c6d1d8');
    const cam = camera([lerp(-60, 60, ss(lt / 7)), 150, 440], [-10, 16, 0], 38), sc = new Scene(); sc.box({ x: -300, y: -2, z: -140 }, 600, 2, 280, [200, 205, 210], { ground: 1, edge: 0 });
    const build = (x0, z0, plan, t0) => plan.forEach(([x, y, z, col, nx, nz], i) => { const u = clamp((g - t0 - i * 0.12) / 0.3); if (u <= 0) return; brick(sc, { x: x0 + x, y: y * BH + (1 - ease.out(u)) * 60, z: z0 + z }, nx || 4, nz || 2, col, { seg: 8 }); });
    const POL = [[0, 0, 0, C.white], [32, 0, 0, C.white], [0, 1, 0, C.blue], [32, 1, 0, C.blue], [0, 2, 0, C.white], [32, 2, 0, C.white], [8, 3, 0, C.black, 4, 2], [16, 4, 0, C.blue, 2, 2]];
    const FIRE = [[0, 0, 0, C.black, 6, 2], [0, 1, 0, C.red, 6, 2], [32, 2, 0, C.red, 2, 2], [0, 2, 0, C.white, 4, 2], [8, 3, 0, C.red, 2, 2]];
    const CAR = [[0, 0, 0, C.black, 4, 2], [0, 1, 0, C.yellow, 4, 2], [8, 2, 0, C.yellow, 2, 2]];
    build(-220, -40, POL, L.o5 + 0.2); build(-20, 20, FIRE, Math.min(t.fire - 0.3, L.o5 + 1.3)); build(160, -10, CAR, Math.min(t.race - 0.3, L.o5 + 2.2)); sc.shadow(-180, 0, -32, 50, 0.3); sc.shadow(10, 0, 28, 40, 0.3); sc.shadow(176, 0, -2, 30, 0.3);
    render(ctx, sc, cam, LIGHT);
    plate(ctx, 'FEWER PIECES, USED AGAIN AND AGAIN', 120, 140, ss((lt - 0.1) / 0.3), { size: 50, bar: '#0057A8' });
    [['POLICE STATIONS', t.police], ['FIRE TRUCKS', t.fire], ['RACE CARS', t.race]].forEach(([s, t0], i) => plate(ctx, s, 160 + i * 560, 990, ss((g - t0) / 0.3), { size: 42 })); } });
  // 6 · the retailers: a year planner fills with their slots; "unfocused / self-centered" crossed out
  S.push({ t0: L.o6 - 0.2, light: 1, fn: (ctx, g, lt) => { paper(ctx, '#f1ece2');
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'], x0 = 140, y0 = 380, cw = 136;
    months.forEach((m, i) => { ctx.fillStyle = '#fff'; ctx.fillRect(x0 + i * cw, y0, cw - 8, 460); ctx.fillStyle = '#1f1f1f'; ctx.font = `800 28px ${E.F}`; ctx.fillText(m, x0 + i * cw + 30, y0 + 44);
      for (let k = 0; k < 3; k++) { const a = ss((g - t.planned - (i * 3 + k) * 0.05) / 0.3); if (a <= 0) continue; ctx.globalAlpha = a; ctx.fillStyle = ['#0057A8', '#C91A14', '#237841'][k]; ctx.fillRect(x0 + i * cw + 10, y0 + 80 + k * 120 + (i % 2) * 20, cw - 28, 80); ctx.globalAlpha = 1; } });
    const q = ss((g - t.unfocused) / 0.3); plate(ctx, '"UNFOCUSED"', 220, 230, q, { size: 46, bg: 'rgba(20,20,22,0.85)' }); plate(ctx, '"SELF-CENTERED"', 700, 230, q, { size: 46, bg: 'rgba(20,20,22,0.85)' });
    const x = ss((g - t.planned) / 0.4); if (x > 0) { ctx.save(); ctx.strokeStyle = '#C91A14'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(190, 230); ctx.lineTo(190 + 900 * x, 230); ctx.stroke(); ctx.restore(); }
    plate(ctx, 'WHAT THE BIG RETAILERS SAID ABOUT LEGO', 120, 120, ss((g - t.retailers) / 0.3), { size: 40 }); plate(ctx, 'NOW THE YEAR IS PLANNED AROUND THEM', W - 140, 960, ss((g - t.planned) / 0.3), { size: 44, align: 'right', bg: 'rgba(0,87,168,0.95)' }); } });
  // 7 · adult fans: 1998 robot brick (photo, 2006), cracked open and published, not sued -> 2005 fan convention
  S.push({ t0: L.o7 - 0.2, beats: [t.y2005 - 0.2], fn: (ctx, g, lt) => { ctx.fillStyle = '#121a22'; ctx.fillRect(0, 0, W, H);
    if (g < t.y2005 - 0.2) { if (HAS('rcx')) { photo(ctx, IMG.rcx, (g - L.o7) / 12, { rect: [W * 0.42, 0, W * 0.58, H], z0: 1.05, z1: 1.25 }); credit(ctx, cred('rcx') + ' · the robot brick, launched 1998', 1); }
      else { const cam = camera([60, 70, 150], [0, 14, 0], 36), sc = new Scene(); const X = 0; sc.box({ x: -36, y: 0, z: -24 }, 72, 30, 48, [200, 196, 60], {}); sc.box({ x: -30, y: 30, z: -20 }, 60, 6, 40, [70, 72, 78], {});
        sc.box({ x: -16, y: 36.2, z: -8 }, 32, 0.6, 16, [140, 170, 140], { emissive: 0.9 }); for (const [x, z] of [[-24, -16], [0, -16], [24, -16], [-24, 16], [0, 16], [24, 16]]) sc.box({ x: x - 6, y: 30, z: z - 3 }, 12, 6.5, 6, [60, 60, 66], {});
        for (let i = 0; i < 4; i++) for (let k = 0; k < 2; k++) sc.cyl({ x: 0, y: 0, z: 0 }, -27 + i * 18, 36, -14 + k * 28, 2.4, 1.8, [200, 196, 60], 10, {}); sc.shadow(0, 0, 0, 50, 0.4);
        ctx.save(); ctx.translate(360, 40); render(ctx, sc, cam, Object.assign({}, DARK, { amb: 0.45 })); ctx.restore(); plate(ctx, 'THE ROBOT BRICK (1998) · ILLUSTRATION', W - 120, 1000, 1, { size: 24, align: 'right' }); }
      // a 1998 web page (generic), the internals published
      const a = ss((g - t.student) / 0.4); if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.translate(120, 380); ctx.fillStyle = '#c0c0c0'; ctx.fillRect(0, 0, 620, 520); ctx.fillStyle = '#000080'; ctx.fillRect(0, 0, 620, 36); ctx.fillStyle = '#fff'; ctx.font = `700 22px ${E.F}`; ctx.fillText('robot brick — internals (1998)', 12, 25);
        ctx.fillStyle = '#fff'; ctx.fillRect(14, 50, 592, 456); ctx.strokeStyle = '#2d6a2d'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { ctx.strokeRect(40 + (i % 3) * 180, 90 + Math.floor(i / 3) * 170, 130, 110); ctx.beginPath(); ctx.moveTo(105 + (i % 3) * 180, 200 + Math.floor(i / 3) * 170); ctx.lineTo(105 + (i % 3) * 180, 260 + Math.floor(i / 3) * 170); ctx.stroke(); } ctx.restore(); }
      plate(ctx, 'ADULT FANS', 120, 140, ss((g - t.adults) / 0.3), { size: 62, bar: '#9EE09E' }); plate(ctx, '1998 · A STUDENT CRACKS OPEN THE NEW ROBOT BRICK', 120, 230, ss((g - t.student) / 0.3), { size: 34 });
      stamp(ctx, 'NOT SUED', 560, 940, ss((g - t.sue) / 0.25), -0.12, 80, '35,120,65'); return; }
    // the 2005 fan convention: tables of big builds (code), badge
    studio(ctx, '#2b2f3a', '#1d2029', '#111318'); const cam = camera([lerp(-120, 80, ss((g - t.y2005) / 5)), 110, 330], [0, 20, -60], 40), sc = new Scene();
    for (let r = 0; r < 3; r++) { sc.box({ x: -280, y: 0, z: -r * 120 - 40 }, 560, 22, 60, [40, 60, 110], {}); for (let k = 0; k < 6; k++) { const x = -250 + k * 95, z = -r * 120 - 20, hh = 2 + Math.floor(hash(r * 7 + k) * 5);
        for (let l = 0; l < hh; l++) brick(sc, { x: x - 16, y: 22 + l * BH, z: z - 8 }, 4, 2, PAL[(r * 3 + k + l) % 8], { seg: 6, studs: l === hh - 1 }); } }
    render(ctx, sc, cam, Object.assign({}, DARK, { fogCol: [20, 22, 30], fogFar: 1100, amb: 0.4 }));
    plate(ctx, '2005 · A FAN CONVENTION', 120, 140, ss((g - t.y2005) / 0.3), { size: 56, bar: '#9EE09E' }); plate(ctx, 'THE NEW CEO GOES HIMSELF', 120, 230, ss((g - t.convention) / 0.3), { size: 40 }); } });
  // 8 · it worked faster than expected: 2003 / 2004 / 2005 results
  S.push({ t0: L.o8 - 0.2, light: 1, fn: (ctx, g, lt) => { paper(ctx, '#f2ece2');
    const y0 = 600, sc = 150, bars = [['2003', -1.4, 'PRE-TAX', L.o8], ['2004', -1.93, 'NET', L.o8 + 0.4], ['2005', 0.505, 'NET', t.profit]];
    ctx.fillStyle = '#2a2016'; ctx.fillRect(300, y0, 1320, 4);
    bars.forEach(([y, v, k, t0], i) => { const u = ease.out(clamp((g - t0) / 0.6)), x = 420 + i * 440, h = v * sc * u; ctx.fillStyle = v < 0 ? '#C91A14' : '#237841'; ctx.fillRect(x, v < 0 ? y0 : y0 - h, 220, Math.abs(h));
      plate(ctx, y, x + 110, v < 0 ? y0 - 50 : y0 + 50, 1, { size: 40, align: 'center', bg: 'none', col: '#2a2016' }); plate(ctx, `${v < 0 ? '−' : '+'}DKK ${Math.abs(v) < 1 ? Math.round(Math.abs(v) * 1000) + 'M' : Math.abs(v).toFixed(v === -1.93 ? 2 : 1) + ' BN'}`, x + 110, v < 0 ? y0 - h + 50 : y0 - h - 50, u, { size: 36, align: 'center', bg: v < 0 ? 'rgba(201,26,20,0.95)' : 'rgba(35,120,65,0.95)' });
      plate(ctx, k, x + 110, v < 0 ? y0 - h + 110 : y0 - h - 110, u * 0.9, { size: 22, align: 'center', bg: 'none', col: '#5a4a30' }); });
    plate(ctx, '2005: BACK IN PROFIT', 120, 140, ss((g - t.profit) / 0.3), { size: 60, bar: '#237841' }); plate(ctx, 'FASTER THAN ALMOST ANYONE EXPECTED', 120, 230, ss((g - t.worked) / 0.3), { size: 36 }); } });
  return S; } });
