// Chapter 7 · It Still Fits (after 2008): growth ≈ +25 %/yr -> 2014: the movie (≈ $470M) and No. 1 toy maker (H1 2014) -> the whole story as a chain
// of falling dominoes -> the oldest idea: fewer pieces, used again and again (the 1955 town returns) -> 1958 bricks (archive photo) -> a new brick
// clicks onto an old one -> end card.
const D = require('./doc.js'); const { E, W, H, clamp, lerp, ss, ease, hash, Scene, U, BH, brick, oddPiece, camera, render, C, PAL, IMG, HAS, cred, photo, print, credit, plate, LIGHT, DARK, studio, paper, fade, stamp, doc, map, arc, card, house } = D;
D.segment(module, { chapter: 'c7_stillfits', build: ({ at, L, T, fx }) => {
  const t = { quarter: at('a1', 'quarter'), y14: at('a2', '2014'), movie: at('a2', 'movie'), half: at('a2', 'half'), first: at('a2', 'first'), passed: at('a2', 'passed'), biggest: at('a2', 'biggest'),
    what: at('a3', 'what'), not: at('a3', 'Not'), market: at('a3', 'changing'), doing: at('a3', 'Doing'), once: at('a3', 'once'), hid: at('a3', 'hid'), stopped: at('a3', 'stopped'), left: at('a3', 'left'),
    way: at('a4', 'way'), oldest: at('a4', 'oldest'), fewer: at('a4', 'Fewer'), again: at('a4', 'again'),
    through: at('a5', 'through'), copies: at('a5', 'copies'), losses: at('a5', 'losses'), movies5: at('a5', 'movies'), rescue: at('a5', 'rescue'), never: at('a5', 'never'), today: at('a5', 'today'), clicks: at('a5', 'clicks'), y58: at('a5', '1958'),
    bricks: at('a6', 'bricks'), company: at('a6', 'company') };
  const END = T - 5.2;
  fx('thump', 0.6, 0.5); fx('click', 1.0, 0.7);
  for (let i = 0; i < 5; i++) fx('rise', L.a1 + 0.2 + i * 0.6, 0.3); fx('rev', t.movie - 0.3, 0.3); fx('kaching', t.half, 0.5); fx('rise', t.passed - 0.3, 0.5); fx('stamp', t.biggest, 0.6);
  [t.market, t.doing, t.once, t.hid, t.stopped].forEach((x, i) => fx('thump', x + 0.2, 0.45)); fx('heartbeat', t.left, 0.4);
  for (let i = 0; i < 12; i++) fx('click', t.fewer + i * 0.2, 0.3); fx('sparkle', t.again, 0.4);
  [t.copies, t.losses, t.movies5, t.rescue].forEach(x => fx('flip', x, 0.3)); fx('shutter', t.today - 0.4, 0.4); fx('click', t.clicks + 0.2, 1.0); fx('sparkle', t.clicks + 0.25, 0.4); fx('thump', END, 0.3);
  const S = [];
  S.push({ t0: 0, card: 1, fn: (ctx, g, lt) => card(ctx, lt, 7, 'It Still Fits', 'After 2008', { c0: '#2a2112', c1: '#0e0b06', acc: '#E3B341' }) });
  // 1 · growth: five years, about a quarter a year (index bars, compounding)
  S.push({ t0: L.a1 - 0.2, light: 1, fn: (ctx, g, lt) => { paper(ctx, '#eef3ea');
    const yrs = [2008, 2009, 2010, 2011, 2012, 2013], y0 = 900, x0 = 300; yrs.forEach((y, i) => { const v = Math.pow(1.24, i), u = ease.out(clamp((g - L.a1 - i * 0.35) / 0.5)), h = 180 * v * u;
      ctx.fillStyle = i ? '#237841' : '#9a8f80'; ctx.fillRect(x0 + i * 230, y0 - h, 150, h); plate(ctx, String(y), x0 + i * 230 + 75, y0 + 40, 1, { size: 32, align: 'center', bg: 'none', col: '#2a2016' }); });
    plate(ctx, 'SALES ≈ +25% A YEAR, FIVE YEARS IN A ROW', 120, 140, ss((g - t.quarter) / 0.3), { size: 50, bar: '#237841' }); plate(ctx, 'INDEX · ROUNDED (≈ 24% A YEAR, 2008–2013)', 120, 220, 1, { size: 30, bg: 'none', col: '#5a4a30' }); } });
  // 2 · 2014: a movie ticket (≈ $470M) -> two towers: LEGO passes Mattel (H1 2014)
  S.push({ t0: L.a2 - 0.2, beats: [t.first - 0.2], fn: (ctx, g, lt) => {
    if (g < t.first - 0.2) { ctx.fillStyle = '#1a1420'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.translate(W / 2, H / 2 + 20); ctx.rotate(-0.06 + Math.sin(lt) * 0.01); ctx.fillStyle = '#f4e6c8'; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 50; ctx.fillRect(-560, -220, 1120, 440); ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#C91A14'; ctx.lineWidth = 6; ctx.setLineDash([16, 10]); ctx.beginPath(); ctx.moveTo(300, -220); ctx.lineTo(300, 220); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#1f1f1f'; ctx.font = `900 64px ${E.F}`; ctx.fillText('A MOVIE MADE OF', -500, -90); ctx.fillText('LEGO BRICKS', -500, -10); ctx.font = `700 34px ${E.F}`; ctx.fillText('CINEMA · 2014', -500, 90);
      ctx.save(); ctx.translate(420, 0); ctx.rotate(-Math.PI / 2); ctx.font = `900 54px ${E.F}`; ctx.fillText('ADMIT 1', -110, 18); ctx.restore(); ctx.restore();
      plate(ctx, '≈ $470 MILLION AT THE BOX OFFICE', W / 2, 920, ss((g - t.half) / 0.3), { size: 56, align: 'center', bg: 'rgba(227,179,65,0.96)', col: '#141414' }); plate(ctx, 'WORLDWIDE · SOURCE: BOX OFFICE MOJO', 80, 1040, ss((g - t.half) / 0.3), { size: 22, bg: 'rgba(0,0,0,0.5)' }); return; }
    if (HAS('mattel')) { photo(ctx, IMG.mattel, (g - t.first) / 6, { z0: 1.1, z1: 1.2, filter: 'brightness(0.45) saturate(0.6) blur(2px)' }); credit(ctx, cred('mattel') + ' · Mattel HQ, El Segundo', 1); } else { studio(ctx, '#2c3340', '#1d222b', '#11141a'); }
    const u = ease.inOut(clamp((g - t.passed + 0.6) / 1.6)), cam = camera([0, 120, 420], [0, 80, 0], 40), sc = new Scene(), hl = Math.round(lerp(9, 15, u)), hm = 13;
    for (let l = 0; l < hl; l++) brick(sc, { x: -110, y: l * BH, z: -8 }, 4, 2, [C.red, C.yellow, C.blue, C.white][l % 4], { seg: 8 }); for (let l = 0; l < hm; l++) brick(sc, { x: 70, y: l * BH, z: -8 }, 4, 2, [150, 150, 154], { seg: 8 });
    render(ctx, sc, cam, Object.assign({}, DARK, { amb: 0.5, fogFar: 2000 })); const P = (x, y) => { const v = E.V.sub([x, y, 0], cam.pos), z = E.V.dot(v, cam.f); return [W / 2 + E.V.dot(v, cam.r) / z * cam.F, H / 2 - E.V.dot(v, cam.u) / z * cam.F]; };
    const [lx, ly] = P(-94, -10), [mx, my] = P(86, -10); plate(ctx, 'LEGO', lx, ly + 40, 1, { size: 40, align: 'center', bg: 'rgba(201,26,20,0.95)' }); plate(ctx, 'MATTEL', mx, my + 40, 1, { size: 40, align: 'center' });
    plate(ctx, 'BY SALES · SOURCE: FORTUNE, SEPT 2014', 80, 1040, ss((g - t.biggest) / 0.3), { size: 22, bg: 'rgba(0,0,0,0.5)' }); plate(ctx, 'FIRST HALF OF 2014', 120, 140, ss((g - t.first) / 0.3), { size: 44, bar: '#E3B341' }); plate(ctx, "No. 1 TOY COMPANY IN THE WORLD", 120, 230, ss((g - t.biggest) / 0.3), { size: 50, bg: 'rgba(201,26,20,0.95)' }); } });
  // 3 · the chain: five dominoes fall into each other
  S.push({ t0: L.a3 - 0.2, light: 1, fn: (ctx, g, lt) => { studio(ctx, '#f2ede4', '#e5ddd0', '#c9bda8');
    const steps = [['A CHANGING MARKET', t.market], ['DO MORE', t.doing], ['PIECES USED ONCE', t.once], ['MOVIES HIDE THE COST', t.hid], ['MOVIES STOP', t.stopped]];
    const cam = camera([0, 120, 440], [0, 30, 0], 40), sc = new Scene(); steps.forEach(([s, t0], i) => { const fall = ease.in(clamp((g - (steps[i + 1] ? steps[i + 1][1] : t.left) + 0.15) / 0.35)) * 1.15;
      const x = -220 + i * 110; sc.box({ x, y: 0, z: -24, roll: -fall }, 22, 80, 48, i === 4 ? C.red : [236, 230, 218], {}); sc.shadow(x + 11, 0, 0, 34, 0.3); });
    const P = render(ctx, sc, cam, LIGHT);
    steps.forEach(([s, t0], i) => { const p = P([-209 + i * 110, 0, 0]); plate(ctx, (i + 1) + ' · ' + s, p[0], 860 + (i % 2) * 70, ss((g - t0) / 0.25), { size: 32, align: 'center', bg: i === 4 ? 'rgba(201,26,20,0.95)' : 'rgba(14,14,16,0.85)' }); });
    plate(ctx, 'WHAT NEARLY DESTROYED LEGO?', 120, 130, ss((g - t.what + 0.2) / 0.3), { size: 52 }); plate(ctx, 'NOT ONE BAD DECISION — A CHAIN', 120, 220, ss((g - t.not) / 0.3), { size: 40, bar: '#C91A14' });
    plate(ctx, 'ONLY THE COST WAS LEFT', W - 120, 130, ss((g - t.left) / 0.3), { size: 48, align: 'right', bg: 'rgba(201,26,20,0.95)' }); } });
  // 4 · the oldest idea: the 1955 town returns, built from a few piece types
  S.push({ t0: L.a4 - 0.2, light: 1, fn: (ctx, g, lt) => { studio(ctx, '#f3ede1', '#e7decb', '#cdbf9f');
    const cam = camera([lerp(-40, 60, ss(lt / 8)), 230, 420], [0, 0, -10], 38), sc = new Scene();
    sc.box({ x: -200, y: -2, z: -140 }, 400, 2, 280, [214, 206, 188], { edge: 0.4, ground: 1 }); for (let i = -2; i <= 2; i++) { sc.box({ x: -200, y: 0.1, z: i * 60 - 8 }, 400, 0.4, 16, [120, 120, 124], { edge: 0, ground: 1, layer: 1 }); sc.box({ x: i * 80 - 8, y: 0.12, z: -140 }, 16, 0.4, 280, [120, 120, 124], { edge: 0, ground: 1, layer: 1 }); }
    const HS = [[-120, -100, C.red], [-40, -100, C.white], [40, -100, C.yellow], [120, -100, C.blue], [-120, -20, C.yellow], [-40, -20, C.red], [40, -20, C.white], [120, -20, C.red], [-120, 60, C.blue], [-40, 60, C.white], [40, 60, C.red], [120, 60, C.yellow]];
    const n = clamp((g - t.fewer + 0.2) / 2.4) * HS.length; HS.forEach(([x, z, col], i) => { if (i >= n) return; const f = clamp(n - i); D.house(sc, x, (1 - ease.out(f)) * 40, z, col); sc.shadow(x, 0, z, 30, 0.3); });
    render(ctx, sc, cam, Object.assign({}, LIGHT, { fogFar: 3200 }));
    plate(ctx, 'REMEMBER THE 1955 TOWN PLAN?', 120, 140, ss((g - L.a4) / 0.3) * (1 - ss((g - t.oldest + 0.3) / 0.3)), { size: 46 }); plate(ctx, 'THE WAY OUT: THE OLDEST IDEA', 120, 140, ss((g - t.oldest) / 0.3), { size: 52, bar: '#C91A14' }); plate(ctx, 'FEWER PIECES, USED AGAIN AND AGAIN', 120, 230, ss((g - t.fewer) / 0.3), { size: 42 }); } });
  // 5 · through all of it: four quick cards -> the 1958 bricks (archive photo) -> today's brick clicks onto a 1958 brick
  S.push({ t0: L.a5 - 0.2, beats: [t.never - 0.1, ...(HAS('bricks58') ? [t.today - 0.3] : [])], fn: (ctx, g, lt) => {
    if (g < t.never - 0.1) { ctx.fillStyle = '#121418'; ctx.fillRect(0, 0, W, H); [['THE COPIES', t.copies], ['THE LOSSES', t.losses], ['THE MOVIES', t.movies5], ['THE RESCUE', t.rescue]].forEach(([s, t0], i) => plate(ctx, s, 240 + i * 400, 540, ss((g - t0) / 0.2), { size: 44, align: 'center', bg: i % 2 ? 'rgba(201,26,20,0.95)' : 'rgba(60,64,72,0.95)' })); plate(ctx, 'THROUGH ALL OF IT', W / 2, 300, ss((g - L.a5) / 0.3), { size: 56, align: 'center', bg: 'none' }); return; }
    if (HAS('bricks58') && g < t.today - 0.3) { { photo(ctx, IMG.bricks58, (g - t.never) / 2, { z0: 1.1, z1: 1.22 }); credit(ctx, cred('bricks58') + ' · the first patented bricks, 1958', 1); }
      plate(ctx, 'ONE THING NEVER CHANGED', W / 2, 140, ss((g - t.never) / 0.3), { size: 56, align: 'center' }); return; }
    // macro: a new bright brick lowers onto a worn 1958 brick
    studio(ctx, '#f6ecdc', '#e9dbc0', '#c7a97e'); const cam = camera([lerp(70, 50, ss((g - t.today) / 3)), 34, lerp(120, 100, ss((g - t.today) / 3))], [0, 10, 0], 34), sc = new Scene();
    brick(sc, { x: -16, y: 0, z: -8 }, 4, 2, [176, 52, 40]); const u = ease.in(clamp((g - t.clicks + 0.35) / 0.4)); brick(sc, { x: -16, y: lerp(BH + 22, BH, u), z: -8 }, 4, 2, C.red); sc.shadow(0, 0, 0, 30, 0.45);
    render(ctx, sc, cam, Object.assign({}, LIGHT, { warm: 0.06 }));
    if (u >= 1) E.glow(ctx, W / 2, H / 2 - 40, 400, 'rgba(255,220,160,1)', 0.25 * (1 - clamp((g - t.clicks - 0.3) / 1.5)));
    if (!HAS('bricks58')) plate(ctx, 'ONE THING NEVER CHANGED', W / 2, 960, ss((g - t.never) / 0.3) * (1 - ss((g - t.today + 0.2) / 0.3)), { size: 56, align: 'center' });
    plate(ctx, 'TODAY', 1400, 360, ss((g - t.today) / 0.3), { size: 48 }); plate(ctx, '1958', 1400, 760, ss((g - t.y58) / 0.3), { size: 48, bg: 'rgba(201,26,20,0.95)' }); } });
  // 6 · the last line over the two bricks, then the end card
  S.push({ t0: L.a6 - 0.15, light: 1, cut: 'hard', fn: (ctx, g, lt) => { studio(ctx, '#f6ecdc', '#e9dbc0', '#c7a97e'); const cam = camera([lerp(50, 90, ss(lt / 5)), lerp(34, 55, ss(lt / 5)), lerp(100, 160, ss(lt / 5))], [0, 10, 0], 34), sc = new Scene();
    brick(sc, { x: -16, y: 0, z: -8 }, 4, 2, [176, 52, 40]); brick(sc, { x: -16, y: BH, z: -8 }, 4, 2, C.red); sc.shadow(0, 0, 0, 30, 0.45); render(ctx, sc, cam, LIGHT);
    plate(ctx, 'THE BRICKS NEVER STOPPED FITTING TOGETHER.', W / 2, 160, ss((g - t.bricks) / 0.4), { size: 50, align: 'center' }); plate(ctx, 'FOR A FEW YEARS, THE COMPANY DID.', W / 2, 950, ss((g - t.company) / 0.4), { size: 56, align: 'center', bg: 'rgba(201,26,20,0.95)' }); } });
  S.push({ t0: END, fn: (ctx, g, lt) => { ctx.fillStyle = '#121418'; ctx.fillRect(0, 0, W, H); E.type(ctx, 'What toy did YOU grow up with?', W / 2, 500, lt - 0.3, { size: 92, weight: 900 });
    const a = ss((lt - 0.9) / 0.4); ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#E3B341'; ctx.lineWidth = 12; ctx.lineCap = 'round'; const y = 620 + Math.sin(lt * 4) * 10; ctx.beginPath(); ctx.moveTo(W / 2, y); ctx.lineTo(W / 2, y + 150); ctx.moveTo(W / 2 - 44, y + 106); ctx.lineTo(W / 2, y + 150); ctx.lineTo(W / 2 + 44, y + 106); ctx.stroke(); ctx.restore();
    fade(ctx, ss((lt - 4.4) / 0.8)); } });
  return S; } });
