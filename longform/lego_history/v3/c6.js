// Chapter 6 · The Fix That Broke (2006–2008): production flows out of Billund to a contract manufacturer (map arrows to Mexico, Hungary,
// Czech Republic) -> a delivery timeline where the molds arrive before the factory is ready; a set with a missing part -> 2008: production comes back;
// the lesson card (core competence).
const D = require('./doc.js'); const { E, W, H, clamp, lerp, ss, ease, hash, Scene, U, BH, brick, oddPiece, camera, render, C, PAL, IMG, HAS, cred, photo, print, credit, plate, LIGHT, DARK, studio, paper, fade, stamp, doc, map, pin, arc, card } = D;
D.segment(module, { chapter: 'c6_outsourcing', build: ({ at, L, T, fx }) => {
  const t = { mistakes: at('m1', 'mistakes'), moved: at('m1', 'moved'), flex: at('m1', 'Flextronics'), mexico: at('m1', 'Mexico'), hungary: at('m1', 'Hungary'), czech: at('m1', 'Czech'),
    smoothly: at('m2', 'smoothly'), molds: at('m2', 'Molds'), ready: at('m2', 'ready'), short: at('m2', 'short'),
    y08: at('m3', '2008'), back: at('m3', 'back'), lesson: at('m3', 'lesson'), core: at('m3', 'core'), brick: at('m3', 'brick') };
  fx('thump', 0.6, 0.5); fx('click', 1.0, 0.7);
  fx('engine', t.moved, 0.4); fx('stamp', t.flex, 0.4); for (const x of [t.mexico, t.hungary, t.czech]) { fx('whoosh', x - 0.2, 0.3); fx('pop', x, 0.5); }
  fx('brake', t.smoothly, 0.4); fx('clank', t.molds, 0.5); fx('tick', t.ready, 0.4); fx('error', t.short, 0.4);
  fx('rev', t.back - 0.3, 0.4); for (const x of [0, 0.3, 0.6]) fx('whoosh', t.back + x, 0.25); fx('ding', t.core, 0.4); fx('click', t.brick, 0.9);
  const S = [];
  S.push({ t0: 0, card: 1, fn: (ctx, g, lt) => card(ctx, lt, 6, 'The Fix That Broke', '2006 — 2008', { c0: '#3a2a12', c1: '#140e05', acc: '#E3B341' }) });
  // 1 · map: production flows out of Billund
  S.push({ t0: L.m1 - 0.2, light: 1, fn: (ctx, g, lt) => { const to = map(ctx, -40, 38, 9.5, { Mexico: '#E3B341', Hungary: '#E3B341', Czechia: '#E3B341', Denmark: '#C91A14' }, { sea: '#c9dade', land: '#e8e0cc' });
    const [bx, by] = to(9.12, 55.73); pin(ctx, bx, by, 1); plate(ctx, 'BILLUND', bx + 22, by - 44, 1, { size: 24 });
    const dest = [['MEXICO · PACKING', -100.3, 25.7, t.mexico], ['HUNGARY · MOLDING', 21.7, 47.9, t.hungary], ['CZECH REPUBLIC · MOLDING', 14.1, 50.1, t.czech]];
    dest.forEach(([n, lo, la, t0]) => { const [x, y] = to(lo, la), u = ease.inOut(clamp((g - t0 + 0.5) / 0.7)); arc(ctx, bx, by, x, y, Math.abs(x - bx) > 400 ? 260 : 80, u, '#C91A14', 6); if (u >= 1) { pin(ctx, x, y, clamp((g - t0 - 0.2) / 0.3), '#1f1f1f'); plate(ctx, n, x + 20, y + 30, 1, { size: 26, bg: 'rgba(20,20,22,0.88)' }); } });
    plate(ctx, 'A RESCUE CAN MAKE MISTAKES TOO', 120, 130, ss((g - t.mistakes) / 0.3) * (1 - ss((g - t.moved) / 0.3)), { size: 50 });
    plate(ctx, '2006 · A LARGE SHARE OF PRODUCTION MOVES OUT', 120, 130, ss((g - t.moved) / 0.3), { size: 48, bar: '#C91A14' }); plate(ctx, 'SOURCE: LEGO GROUP HISTORY', 80, 1040, ss((g - t.flex) / 0.3), { size: 22, bg: 'rgba(0,0,0,0.5)' }); plate(ctx, 'TO A CONTRACT MANUFACTURER: FLEXTRONICS', 120, 220, ss((g - t.flex) / 0.3), { size: 36 }); } });
  // 2 · it didn't go smoothly: the timeline (molds arrive before the factory is ready); a box with a gap
  S.push({ t0: L.m2 - 0.2, light: 1, fn: (ctx, g, lt) => { paper(ctx, '#efe9de');
    const x0 = 320, x1 = 1640, rows = [['FACTORY READY', '#237841', 0.55, 1.0, L.m2], ['MOLDS ARRIVE', '#C91A14', 0.18, 0.45, t.molds]];
    rows.forEach(([lab, col, a, b, t0], i) => { const y = 380 + i * 200, u = ease.out(clamp((g - t0) / 0.6)); plate(ctx, lab, x0 - 20, y + 30, 1, { size: 32, align: 'right', bg: 'none', col: '#2a2016' });
      ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(x0, y, x1 - x0, 60); ctx.fillStyle = col; ctx.fillRect(lerp(x0, x1, a), y, (b - a) * (x1 - x0) * u, 60); });
    const clash = ss((g - t.ready) / 0.4); if (clash > 0) { ctx.save(); ctx.globalAlpha = clash; ctx.strokeStyle = '#C91A14'; ctx.setLineDash([12, 10]); ctx.lineWidth = 5; const xr = lerp(x0, x1, 0.55); ctx.beginPath(); ctx.moveTo(xr, 330); ctx.lineTo(xr, 680); ctx.stroke(); ctx.restore(); plate(ctx, 'TOO EARLY', lerp(x0, x1, 0.3), 700, clash, { size: 36, align: 'center', bg: 'rgba(201,26,20,0.95)' }); }
    // a set box with an empty compartment
    const b = ss((g - t.short) / 0.4); if (b > 0) { ctx.save(); ctx.globalAlpha = b; ctx.translate(1380, 880); ctx.fillStyle = '#fff'; ctx.fillRect(-260, -110, 520, 200); for (let i = 0; i < 4; i++) { ctx.fillStyle = i === 2 ? '#e9e3d6' : ['#C91A14', '#0057A8', 0, '#F5C420'][i]; ctx.fillRect(-240 + i * 125, -90, 105, 160); }
      ctx.strokeStyle = '#C91A14'; ctx.lineWidth = 5; ctx.setLineDash([10, 8]); ctx.strokeRect(10, -90, 105, 160); ctx.restore(); plate(ctx, 'SOME PARTS RAN SHORT', 1380, 1030, b, { size: 36, align: 'center' }); }
    plate(ctx, 'IT DID NOT GO SMOOTHLY', 120, 130, ss((g - t.smoothly + 0.2) / 0.3), { size: 54, bar: '#C91A14' }); plate(ctx, 'ILLUSTRATIVE TIMELINE', 320, 290, 1, { size: 22, bg: 'none', col: '#5a4a30' }); } });
  // 3 · 2008: production comes back (arrows reverse) -> the lesson
  S.push({ t0: L.m3 - 0.2, beats: [t.lesson - 0.3], fn: (ctx, g, lt) => {
    if (g < t.lesson - 0.3) { const to = map(ctx, -40, 38, 9.5, { Denmark: '#C91A14' }, { sea: '#c9dade', land: '#e8e0cc' }); const [bx, by] = to(9.12, 55.73);
      [[-100.3, 25.7], [21.7, 47.9], [14.1, 50.1]].forEach(([lo, la], i) => { const [x, y] = to(lo, la), u = ease.inOut(clamp((g - t.back + 0.3 - i * 0.2) / 0.8)); arc(ctx, x, y, bx, by, Math.abs(x - bx) > 400 ? -260 : -80, u, '#237841', 6); });
      pin(ctx, bx, by, 1); plate(ctx, '2008 · DEAL ENDED, PRODUCTION BACK', 120, 130, ss((g - t.y08) / 0.3), { size: 50, bar: '#237841' }); return; }
    ctx.fillStyle = '#16181c'; ctx.fillRect(0, 0, W, H); const cam = camera([0, 26, 120], [0, 10, 0], 34), sc = new Scene(); brick(sc, { x: -16, y: 0, z: -8, yaw: g * 0.3 }, 4, 2, C.red); sc.shadow(0, 0, 0, 30, 0.5);
    ctx.save(); ctx.translate(420, 60); render(ctx, sc, cam, DARK); ctx.restore();
    plate(ctx, '"KNOW YOUR CORE COMPETENCE"', 120, 380, ss((g - t.core) / 0.3), { size: 58, bg: 'rgba(227,179,65,0.96)', col: '#141414' }); plate(ctx, "— LEGO'S OPERATIONS CHIEF, LATER (PARAPHRASED)", 120, 470, ss((g - t.core - 0.3) / 0.3), { size: 28 });
    plate(ctx, 'MAKING THE BRICK WAS PART OF IT', 120, 620, ss((g - t.brick + 0.3) / 0.3), { size: 50, bg: 'rgba(201,26,20,0.95)' }); } });
  return S; } });
