// Chapter 3 · Beyond the Brick (1998–2002): the turnaround plan -> LEGO branches out (parks, clothes, games, TV, licences) -> early success (licensed sets,
// Bionicle) -> Knudstorp joins the strategy team (org chart) -> designers invent pieces & colours -> each piece = mold + bin + schedule; 6,000 -> 12,000+
// -> it still fits, but it's used once -> toys that hardly need building, Galidor flops -> the movies hid the cracks.
const D = require('./doc.js'); const { E, W, H, clamp, lerp, ss, ease, hash, Scene, U, BH, brick, oddPiece, camera, render, C, PAL, IMG, HAS, cred, photo, print, credit, plate, LIGHT, DARK, studio, paper, fade, stamp, doc, map, arc, card, house } = D;
const OCOL = n => PAL[(n * 5 + 3) % PAL.length];
function icon(ctx, kind, x, y, s, col = '#1f1f1f') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (kind === 'park') { ctx.beginPath(); ctx.arc(0, -10, 34, 0, 6.283); ctx.stroke(); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(Math.cos(a) * 34, -10 + Math.sin(a) * 34); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-26, 40); ctx.lineTo(0, -10); ctx.lineTo(26, 40); ctx.stroke(); }
  if (kind === 'shirt') { ctx.beginPath(); ctx.moveTo(-34, -30); ctx.lineTo(-14, -40); ctx.quadraticCurveTo(0, -28, 14, -40); ctx.lineTo(34, -30); ctx.lineTo(44, -6); ctx.lineTo(28, 0); ctx.lineTo(28, 40); ctx.lineTo(-28, 40); ctx.lineTo(-28, 0); ctx.lineTo(-44, -6); ctx.closePath(); ctx.stroke(); }
  if (kind === 'game') { ctx.beginPath(); ctx.roundRect(-44, -22, 88, 46, 22); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(-10, 0); ctx.moveTo(-18, -8); ctx.lineTo(-18, 8); ctx.stroke(); ctx.beginPath(); ctx.arc(16, -4, 5, 0, 6.283); ctx.arc(28, 6, 5, 0, 6.283); ctx.fill(); }
  if (kind === 'tv') { ctx.beginPath(); ctx.roundRect(-44, -32, 88, 60, 8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-16, -48); ctx.lineTo(0, -32); ctx.lineTo(16, -48); ctx.stroke(); }
  if (kind === 'film') { ctx.beginPath(); ctx.arc(0, 0, 40, 0, 6.283); ctx.stroke(); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; ctx.beginPath(); ctx.arc(Math.cos(a) * 20, Math.sin(a) * 20, 8, 0, 6.283); ctx.fill(); } }
  if (kind === 'brick') { ctx.fillStyle = '#C91A14'; ctx.fillRect(-44, -18, 88, 40); for (let i = 0; i < 4; i++) ctx.fillRect(-38 + i * 22, -28, 14, 12); }
  ctx.restore(); }
D.segment(module, { chapter: 'c3_beyond', build: ({ at, L, T, fx }) => {
  const t = { plougmann: at('b1', 'Poul'), diagnosis: at('b1', 'diagnosis'), children: at('b1', 'children'), maybe: at('b1', 'Maybe'),
    more: at('b2', 'more'), parks: at('b2', 'Theme'), clothing: at('b2', 'Clothing'), games: at('b2', 'Video'), tv: at('b2', 'Television'), other: at('b2', 'other'), sw: at('b2', 'Star'), hp: at('b2', 'Harry'),
    brilliant: at('b3', 'brilliant'), sold: at('b3', 'sold'), bionicle: at('b3', 'Bionicle'), hit: at('b3', 'hit'),
    y01: at('b4', '2001'), mck: at('b4', 'McKinsey'), strategy: at('b4', 'strategy'), name: at('b4', 'name'), one: at('b4', 'one'), inside: at('b4', 'inside'),
    nobody: at('b5', 'nobody'), free: at('b5', 'free'), pieces: at('b5', 'pieces'), special: at('b5', 'special'), color: at('b5', 'color'),
    mold: at('b6', 'mold'), bin: at('b6', 'bin'), schedule: at('b6', 'schedule'), six: at('b6', 'six'), twelve: at('b6', 'twelve'), nine: at('b6', 'nine'), justone: at('b6', 'just'),
    clicked: at('b7', 'clicked'), never: at('b7', 'never'), once: at('b7', 'once'), molded: at('b7', 'molded'), stored: at('b7', 'stored'), tracked: at('b7', 'tracked'),
    hardly: at('b8', 'hardly'), explore: at('b8', 'Explore'), jack: at('b8', 'Jack'), minutes: at('b8', 'minutes'), galidor: at('b8', 'Galidor'), show: at('b8', 'show'), game: at('b8', 'game'), fast: at('b8', 'fast'), flopped: at('b8', 'flopped'),
    scream: at('b9', 'scream'), movies: at('b9', 'movies'), y99: at('b9', '1999'), y02: at('b9', '2002'), hp2: at('b9', 'Harry'), each: at('b9', 'Each'), cracks: at('b9', 'cracks') };
  fx('thump', 0.6, 0.5); fx('click', 1.0, 0.7);
  fx('paper', L.b1, 0.5); fx('flip', t.plougmann, 0.4); fx('flip', t.diagnosis, 0.4); fx('tick', t.children, 0.4); fx('tick', t.children + 0.5, 0.4); fx('flip', t.maybe, 0.4);
  fx('whoosh', L.b2 - 0.2, 0.4); [t.parks, t.clothing, t.games, t.tv].forEach(x => { fx('pop', x, 0.6); fx('whoosh', x - 0.1, 0.25); }); fx('rev', t.sw - 0.2, 0.3); fx('stamp', t.sw + 0.4, 0.4); fx('stamp', t.hp + 0.3, 0.4);
  fx('rise', t.brilliant - 0.2, 0.5); fx('kaching', t.sold, 0.5); fx('shutter', t.bionicle - 0.2, 0.5); fx('stamp', t.hit, 0.5);
  fx('whoosh', L.b4 - 0.2, 0.4); for (let i = 0; i < 10; i++) fx('tap', L.b4 + 0.3 + i * 0.08, 0.2); fx('shutter', t.name - 0.2, 0.5); fx('ding', t.inside, 0.3);
  fx('whoosh', L.b5 - 0.2, 0.4); for (let i = 0; i < 8; i++) fx('pop', t.pieces + i * 0.3, 0.35); fx('sparkle', t.color, 0.4);
  fx('clank', t.mold, 0.6); fx('slidedown', t.bin, 0.5); fx('print', t.schedule, 0.4); for (let i = 0; i < 30; i++) fx('tick', t.six + i * 0.12, 0.18); fx('stamp', t.justone + 0.2, 0.6);
  fx('click', t.clicked + 0.1, 1.0); fx('ding', t.never, 0.3); fx('clank', t.molded, 0.5); fx('slidedown', t.stored, 0.4); fx('paper', t.tracked, 0.5); for (let i = 0; i < 20; i++) fx('tick', t.tracked + 0.5 + i * 0.05, 0.15);
  fx('whoosh', L.b8 - 0.2, 0.4); fx('boing', t.explore, 0.4); fx('snap', t.minutes, 0.5); fx('tvon', t.show, 0.4); fx('blip', t.game, 0.4); fx('pop', t.fast, 0.4); fx('fall', t.flopped - 0.5, 0.5); fx('thump', t.flopped, 0.6);
  fx('rev', t.movies - 0.2, 0.4); for (const x of [t.y99, t.y02, t.hp2]) fx('kaching', x, 0.35); fx('rumble', t.cracks, 0.5);
  const S = [];
  S.push({ t0: 0, fn: (ctx, g, lt) => card(ctx, lt, 3, 'Beyond the Brick', '1998 — 2002', { c0: '#3a1d2a', c1: '#140a10', acc: '#ff8a6a' }) });
  // 1 · the turnaround plan (binder pages flip): the diagnosis
  S.push({ t0: L.b1 - 0.2, light: 1, fn: (ctx, g, lt) => { paper(ctx, '#d8d2c6');
    const pages = [['THE PLAN · 1998', 'A TURNAROUND MANAGER: POUL PLOUGMANN', t.plougmann], ['DIAGNOSIS', 'CHILDREN ARE CHANGING FASTER THAN LEGO', t.diagnosis], ['QUESTION', 'IS A BOX OF BRICKS STILL ENOUGH?', t.maybe]];
    let k = 0; pages.forEach((p, i) => { if (g > p[2] - 0.4) k = i; });
    for (let i = pages.length - 1; i >= 0; i--) { if (i < k) continue; const flip = i === k ? 0 : 0; const off = (i - k) * 14;
      doc(ctx, 960 + off, 560 + off, 1100, 720, -0.015, { lines: true, n: 8, seed: i + 1, title: pages[i][0], tsize: 56, tcol: '#C91A14', draw: (c, w, h) => { c.fillStyle = '#1f1f1f'; c.font = `900 60px ${E.F}`; const ws = pages[i][1].split(' '); let l1 = '', l2 = ''; for (const wd of ws) { if (!l2 && c.measureText(l1 + ' ' + wd).width < w - 80) l1 = (l1 ? l1 + ' ' : '') + wd; else l2 = (l2 ? l2 + ' ' : '') + wd; } c.fillText(l1, -w / 2 + 40, h / 2 - 170); c.fillText(l2, -w / 2 + 40, h / 2 - 95); } }); }
    // a clock (children change faster) ticking on the desk
    const a = ss((g - t.children) / 0.3); if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.translate(1620, 860); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 90, 0, 6.283); ctx.fill(); ctx.strokeStyle = '#1f1f1f'; ctx.lineWidth = 6; ctx.stroke();
      ctx.rotate(g * 6); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -70); ctx.stroke(); ctx.restore(); } } });
  // 2 · branching out: a business map — the brick in the centre, new businesses sprout around it
  S.push({ t0: L.b2 - 0.2, light: 1, fn: (ctx, g, lt) => { paper(ctx, '#f3eee4');
    const cx = 960, cy = 560; const nodes = [['THEME PARKS', 'park', -560, -230, t.parks], ['CLOTHING', 'shirt', 560, -230, t.clothing], ['VIDEO GAMES', 'game', -560, 230, t.games], ['TELEVISION', 'tv', 560, 230, t.tv],
      ['STAR WARS · 1999', 'film', -230, 300, t.sw], ['HARRY POTTER · 2001', 'film', 230, 300, t.hp]];
    nodes.forEach(([lab, ic, dx, dy, t0]) => { const u = ease.out(clamp((g - t0 + 0.1) / 0.5)); if (u <= 0) return; arc(ctx, cx, cy, cx + dx * u, cy + dy * u, 40, 1, '#C91A14', 5, false);
      ctx.save(); ctx.globalAlpha = u; ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(cx + dx, cy + dy, 86, 0, 6.283); ctx.fill(); ctx.restore();
      icon(ctx, ic, cx + dx, cy + dy - 6, u); plate(ctx, lab, cx + dx, cy + dy + 128, u, { size: 30, align: 'center' }); });
    ctx.save(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, 110, 0, 6.283); ctx.fill(); ctx.restore(); icon(ctx, 'brick', cx, cy, 1.6);
    plate(ctx, 'MORE THAN A BRICK COMPANY', W / 2, 110, ss((g - t.more) / 0.3), { size: 52, align: 'center', bar: '#C91A14' });
    plate(ctx, "OTHER PEOPLE'S WORLDS", W / 2, 200, ss((g - t.other) / 0.3), { size: 40, align: 'center', bg: 'rgba(201,26,20,0.92)' });
    if (HAS('legoland') && g > t.parks && g < t.clothing + 0.2) { const u = ss((g - t.parks) / 0.3); ctx.save(); ctx.globalAlpha = u; print(ctx, IMG.legoland, 520, 300, 360, -0.05, { foot: 20 }); ctx.restore(); credit(ctx, cred('legoland') + ' · Legoland Billund (opened 1968)', u); } } });
  // 3 · it looked brilliant: licensed sets fly off the shelves (sales bars) -> Bionicle (photo of a 2002 set)
  S.push({ t0: L.b3 - 0.2, light: 1, fn: (ctx, g, lt) => { studio(ctx, '#f4efe6', '#e8e0d1', '#d1c4ac');
    if (g < t.bionicle - 0.2) { // a store shelf of licensed sets empties out (no invented numbers)
      const cols = 8, rows = 4; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const i = r * cols + c, gone = ss((g - t.sold + 0.2 - hash(i * 3.3) * 1.6) / 0.25), x = 260 + c * 180, y = 300 + r * 170;
        ctx.fillStyle = '#8a7a66'; ctx.fillRect(220, y + 70, 1480, 10);
        if (gone < 1) { ctx.save(); ctx.globalAlpha = 1 - gone; ctx.translate(x + gone * 60, y - gone * 80); ctx.fillStyle = ['#2b3a55', '#5b2a2a', '#2b4a3a'][i % 3]; ctx.fillRect(0, 0, 140, 70); ctx.fillStyle = '#E3B341'; ctx.fillRect(10, 10, 60, 10); ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(80, 10, 50, 50); ctx.restore(); } }
      plate(ctx, 'LICENSED SETS SELL ENORMOUSLY', W / 2, 140, ss((g - t.brilliant) / 0.3), { size: 52, align: 'center', bar: '#C91A14' }); stamp(ctx, 'SOLD OUT', 1500, 900, ss((g - t.sold - 1.0) / 0.3), -0.1, 70); return; }
    if (HAS('bionicle')) { photo(ctx, IMG.bionicle, (g - t.bionicle) / 3, { z0: 1.05, z1: 1.2 }); credit(ctx, cred('bionicle') + ' · a 2002 set', 1); }
    else { const cam = camera([0, 50, 160], [0, 30, 0], 40), sc = new Scene(); for (let k = 0; k < 6; k++) oddPiece(sc, { x: (k - 2.5) * 30, y: 10 + Math.sin(g * 2 + k) * 4, z: 0, yaw: g + k, s: 1.6 }, k, OCOL(k)); render(ctx, sc, cam, LIGHT); }
    plate(ctx, 'BIONICLE (FROM 2001)', 140, 150, ss((g - t.bionicle) / 0.3), { size: 56, bar: '#E3B341' }); stamp(ctx, 'A HIT', 1550, 260, ss((g - t.hit) / 0.25), -0.12, 70); } });
  // 4 · 2001: an org chart — one small box in strategy lights up: Knudstorp
  S.push({ t0: L.b4 - 0.2, fn: (ctx, g, lt) => { ctx.fillStyle = '#16202c'; ctx.fillRect(0, 0, W, H);
    const z = lerp(1, 1.9, ease.inOut(clamp((g - t.name + 0.5) / 2))), fx_ = lerp(W / 2, 1540, ease.inOut(clamp((g - t.name + 0.5) / 2))), fy = lerp(H / 2, 760, ease.inOut(clamp((g - t.name + 0.5) / 2)));
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-fx_, -fy);
    const box = (x, y, w, h, lab, hi) => { ctx.fillStyle = hi ? '#E3B341' : 'rgba(244,239,230,0.12)'; ctx.fillRect(x - w / 2, y - h / 2, w, h); ctx.strokeStyle = 'rgba(244,239,230,0.4)'; ctx.lineWidth = 2; ctx.strokeRect(x - w / 2, y - h / 2, w, h);
      ctx.fillStyle = hi ? '#1a1a1a' : 'rgba(244,239,230,0.7)'; ctx.font = `700 18px ${E.F}`; ctx.textAlign = 'center'; ctx.fillText(lab, x, y + 6); ctx.textAlign = 'left'; };
    const n = clamp((lt - 0.1) / 1.2);
    box(960, 160, 260, 60, 'CEO', 0); const L2 = ['FINANCE', 'MARKETING', 'PRODUCTION', 'DESIGN', 'STRATEGY', 'SALES']; L2.forEach((s, i) => { if (i / 6 > n) return; const x = 260 + i * 280; ctx.strokeStyle = 'rgba(244,239,230,0.3)'; ctx.beginPath(); ctx.moveTo(960, 190); ctx.lineTo(x, 300); ctx.stroke(); box(x, 330, 220, 56, s, 0);
      for (let k = 0; k < 4; k++) { const hi = s === 'STRATEGY' && k === 2 && g > t.y01; box(x, 450 + k * 100, 180, 60, hi ? '2001' : '', hi); } });
    ctx.restore();
    if (g > t.name - 0.3 && HAS('knud')) { const u = ss((g - t.name + 0.3) / 0.4); ctx.save(); ctx.globalAlpha = u; print(ctx, IMG.knud, 1380, 560, 420, 0.03, { foot: 30 }); ctx.restore(); credit(ctx, cred('knud') + ' · photo 2010, event 2001', u); }
    plate(ctx, '2001 · A YOUNG ECONOMIST FROM McKINSEY', 120, 130, ss((g - t.y01) / 0.3), { size: 44, bar: '#E3B341' }); plate(ctx, 'INTO THE STRATEGY DEPARTMENT', 120, 210, ss((g - t.strategy) / 0.3), { size: 36 });
    plate(ctx, 'JØRGEN VIG KNUDSTORP', 120, 900, ss((g - t.name) / 0.3), { size: 60, bg: 'rgba(227,179,65,0.95)', col: '#141414' }); plate(ctx, 'WATCHING THE PLAN FROM THE INSIDE', 120, 990, ss((g - t.inside) / 0.3), { size: 36 }); } });
  // 5 · designers invent: a light table — sketches become pieces; colour swatches multiply
  S.push({ t0: L.b5 - 0.2, light: 1, fn: (ctx, g, lt) => { ctx.fillStyle = '#eef2f5'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.strokeStyle = 'rgba(0,87,168,0.12)'; ctx.lineWidth = 1; for (let i = 0; i < W; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); } for (let i = 0; i < H; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke(); } ctx.restore();
    const n = Math.floor(clamp((g - t.pieces + 0.3) / 3) * 12);
    const cam = camera([0, 240, 330], [0, 0, 0], 40), sc = new Scene(); for (let i = 0; i < n; i++) { const x = -220 + (i % 6) * 88, z = Math.floor(i / 6) * 100 - 50; oddPiece(sc, { x, y: 0, z, yaw: 0.4 + i, s: 1.3 }, i, OCOL(i + 2)); sc.shadow(x, 0, z, 26, 0.25); }
    ctx.save(); ctx.translate(-120, 40); render(ctx, sc, cam, LIGHT); ctx.restore();
    // pencil sketch outlines for the next pieces
    for (let i = n; i < 12; i++) { const x = 260 + (i % 6) * 150, y = 470 + Math.floor(i / 6) * 200; ctx.save(); ctx.strokeStyle = 'rgba(0,87,168,0.5)'; ctx.setLineDash([8, 8]); ctx.lineWidth = 3; ctx.strokeRect(x - 50, y - 30, 100, 60); ctx.restore(); }
    // colour swatch fan (right)
    const nc = Math.floor(clamp((g - t.color + 0.4) / 1.4) * 36) + 4; for (let i = 0; i < nc; i++) { ctx.save(); ctx.translate(1500, 980); ctx.rotate(-1.55 + i * 0.035); ctx.fillStyle = `hsl(${(i * 37) % 360},70%,${45 + (i % 3) * 10}%)`; ctx.fillRect(0, -22, 440, 44); ctx.restore(); }
    plate(ctx, 'DESIGNERS WERE FREE TO INVENT', 120, 130, ss((g - t.free) / 0.3), { size: 50, bar: '#0057A8' }); plate(ctx, 'A SPECIAL PIECE FOR THIS SET…', 120, 220, ss((g - t.special) / 0.3), { size: 38 });
    plate(ctx, '…A NEW COLOR FOR THAT ONE', 1240, 520, ss((g - t.color) / 0.3), { size: 38 }); } });
  // 6 · the cost chain: piece -> steel mold -> bin -> schedule line; then 6,000 -> 12,000+ tiles; 9 in 10 used in one set
  S.push({ t0: t.mold - 0.5, light: 1, fn: (ctx, g, lt) => { paper(ctx, '#ece6da');
    if (g < t.six - 0.2) { const steps = [['NEW PIECE', t.mold - 0.4], ['STEEL MOLD', t.mold], ['WAREHOUSE BIN', t.bin], ['FACTORY SCHEDULE', t.schedule]];
      steps.forEach(([s, t0], i) => { const u = ease.out(clamp((g - t0) / 0.4)); if (u <= 0) return; const x = 260 + i * 470, y = 520;
        ctx.save(); ctx.globalAlpha = u; ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 24; ctx.fillRect(x - 170, y - 170, 340, 340); ctx.restore();
        if (i === 0) { const cam = camera([0, 40, 110], [0, 8, 0], 40), sc = new Scene(); oddPiece(sc, { x: 0, y: 0, z: 0, yaw: g, s: 1.4 }, 3, C.purple); ctx.save(); ctx.translate(x - W / 2, y - H / 2); render(ctx, sc, cam, LIGHT); ctx.restore(); }
        if (i === 1) { ctx.fillStyle = '#8a9096'; ctx.fillRect(x - 110, y - 80, 220, 160); ctx.fillStyle = '#5b6066'; ctx.fillRect(x - 60, y - 30, 120, 60); ctx.fillStyle = '#b8bec4'; for (let k = 0; k < 4; k++) ctx.fillRect(x - 100 + k * 64, y - 76, 8, 152); }
        if (i === 2) { if (HAS('wall')) { ctx.save(); ctx.beginPath(); ctx.rect(x - 150, y - 150, 300, 300); ctx.clip(); photo(ctx, IMG.wall, lt / 6, { rect: [x - 150, y - 150, 300, 300], z0: 1.2, z1: 1.3 }); ctx.restore(); }
          else { ctx.fillStyle = '#7d8896'; ctx.fillRect(x - 120, y - 60, 240, 140); ctx.fillStyle = '#5d6876'; ctx.fillRect(x - 120, y - 60, 240, 24); } }
        if (i === 3) { for (let k = 0; k < 7; k++) { ctx.fillStyle = k === 6 ? '#C91A14' : '#9aa3ad'; ctx.fillRect(x - 130 + (k * 37) % 120, y - 120 + k * 36, 80 + (k * 53) % 110, 22); } }
        plate(ctx, s, x, y + 230, u, { size: 34, align: 'center' }); if (i) arc(ctx, x - 300, y, x - 180, y, 0, u, '#C91A14', 6); });
      return; }
    // the tile field: each tile = one different element type
    const nTot = Math.floor(lerp(6000, 12400, ease.inOut(clamp((g - t.six - 0.4) / (t.twelve - t.six + 0.6)))));
    const cols = 160, cell = 11, x0 = 80, y0 = 260, show = Math.floor(nTot / 1.0); ctx.save();
    for (let i = 0; i < 12800; i += 1) { if (i >= show) break; const c = i % cols, r = Math.floor(i / cols); if (r > 66) break; const one = hash(i * 1.37) < 0.9 && i >= 3000;
      ctx.fillStyle = g > t.nine - 0.1 ? (one ? `rgba(201,26,20,${0.35 + 0.6 * ss((g - t.nine) / 0.8)})` : '#237841') : `hsl(${(i * 47) % 360},55%,55%)`; ctx.fillRect(x0 + c * cell, y0 + r * cell, cell - 2, cell - 2); }
    ctx.restore();
    plate(ctx, `${(Math.round(nTot / 100) * 100).toLocaleString('en-US')} DIFFERENT ELEMENTS`, 80, 140, 1, { size: 60, bar: '#C91A14' });
    plate(ctx, 'LATE 1990s: ≈ 6,000  →  A FEW YEARS LATER: 12,000+', 80, 220, ss((g - t.twelve) / 0.3), { size: 34 });
    plate(ctx, '≈ 9 IN 10 NEW PIECES: USED IN ONE SET', W - 80, 990, ss((g - t.nine) / 0.3), { size: 44, align: 'right', bg: 'rgba(201,26,20,0.95)' }); } });
  // 7 · it still fits (green check) — but each piece needs its own mold, bin and ledger line; repeated hundreds of times
  S.push({ t0: L.b7 - 0.2, light: 1, fn: (ctx, g, lt) => { studio(ctx);
    const pull = ss((g - t.once) / 2.4), cam = camera([lerp(60, 160, pull), lerp(36, 220, pull), lerp(110, 420, pull)], [lerp(0, 60, pull), lerp(10, 0, pull), 0], 38), sc = new Scene();
    const reps = Math.floor(lerp(1, 48, pull)); for (let k = 0; k < reps; k++) { const x = (k % 8) * 70, z = Math.floor(k / 8) * 60 - (k ? 0 : 0); const X = k ? x - 40 : 0, Z = k ? -z - 40 : 0;
      brick(sc, { x: X - 16, y: 0, z: Z - 8 }, 4, 2, C.red, { seg: 8 }); const drop = k ? 0 : (1 - ease.in(clamp((g - t.clicked + 0.3) / 0.35))) * 40; oddPiece(sc, { x: X, y: BH + drop, z: Z, yaw: 0.5, s: 0.9 }, 3 + k, OCOL(k + 1)); sc.shadow(X, 0, Z, 24, 0.3);
      if (g > t.molded || k) sc.box({ x: X + 22, y: 0, z: Z - 10 }, 14, 14, 20, [138, 144, 150], {}); if (g > t.stored || k) sc.box({ x: X - 36, y: 0, z: Z - 10 }, 16, 12, 20, [96, 110, 128], {}); }
    render(ctx, sc, cam, LIGHT);
    if (g > t.clicked && g < t.once + 0.2) { ctx.save(); ctx.globalAlpha = ss((g - t.clicked - 0.1) / 0.3); ctx.strokeStyle = '#237841'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(1460, 300); ctx.lineTo(1530, 370); ctx.lineTo(1680, 210); ctx.stroke(); ctx.restore(); }
    plate(ctx, 'IT STILL FITS', 120, 140, ss((g - t.clicked) / 0.3) * (1 - ss((g - t.once) / 0.3)), { size: 70, bg: 'rgba(35,120,65,0.95)' });
    plate(ctx, 'BUT NEEDED JUST ONCE', 120, 140, ss((g - t.once) / 0.3), { size: 70, bg: 'rgba(201,26,20,0.95)' });
    [['MOLDED', t.molded], ['STORED', t.stored], ['TRACKED', t.tracked]].forEach(([s, t0], i) => plate(ctx, s, 120 + i * 300, 990, ss((g - t0) / 0.25), { size: 44 })); } });
  // 8 · toys that hardly needed building: build-time meter; Galidor's media web collapses
  S.push({ t0: L.b8 - 0.2, light: 1, fn: (ctx, g, lt) => { paper(ctx, '#f2ece2');
    if (g < t.galidor - 0.2) { const rows = [['CLASSIC SET', 1.0, '#237841', L.b8], ['EXPLORE (TODDLERS)', 0.25, '#E4701C', t.explore], ['JACK STONE', 0.12, '#C91A14', t.jack]];
      plate(ctx, 'HOW MUCH BUILDING?', 120, 140, ss((lt - 0.1) / 0.3), { size: 54, bar: '#C91A14' });
      rows.forEach(([lab, v, col, t0], i) => { const u = ease.out(clamp((g - t0) / 0.6)); const y = 330 + i * 200; plate(ctx, lab, 120, y, ss((g - t0) / 0.3), { size: 40, bg: 'none', col: '#2a2016' });
        ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(120, y + 40, 1500, 60); ctx.fillStyle = col; ctx.fillRect(120, y + 40, 1500 * v * u, 60); });
      plate(ctx, 'SNAPS TOGETHER IN MINUTES', 1620, 800, ss((g - t.minutes) / 0.3), { size: 40, align: 'right', bg: 'rgba(201,26,20,0.92)' }); plate(ctx, 'ILLUSTRATIVE', 120, 1000, 1, { size: 22, bg: 'none', col: '#5a4a30' }); return; }
    const cx = 960, cy = 560, fall = ss((g - t.flopped + 0.2) / 0.8), nodes = [['TV SHOW', 'tv', -440, -160, t.show], ['VIDEO GAME', 'game', 440, -160, t.game], ['FAST-FOOD TIE-IN', 'shirt', 0, 300, t.fast]];
    nodes.forEach(([lab, ic, dx, dy, t0]) => { const u = ease.out(clamp((g - t0) / 0.4)); if (u <= 0) return; const fy = fall * (300 + Math.abs(dx)), fr = fall * 0.6 * Math.sign(dx || 1);
      ctx.save(); ctx.translate(0, fy); arc(ctx, cx, cy, cx + dx, cy + dy, 30, u * (1 - fall), '#1f1f1f', 4, false); ctx.restore();
      ctx.save(); ctx.translate(cx + dx, cy + dy + fy); ctx.rotate(fr); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 80, 0, 6.283); ctx.fill(); icon(ctx, ic, 0, 0, u); ctx.restore(); plate(ctx, lab, cx + dx, cy + dy + 120 + fy, u * (1 - fall), { size: 30, align: 'center' }); });
    ctx.save(); ctx.translate(cx, cy + fall * 200); ctx.rotate(fall * 0.4); ctx.fillStyle = '#E4701C'; ctx.beginPath(); ctx.roundRect(-70, -110, 140, 220, 20); ctx.fill(); ctx.fillStyle = '#b0b8c0'; ctx.beginPath(); ctx.arc(0, -150, 46, 0, 6.283); ctx.fill(); ctx.restore();
    plate(ctx, 'GALIDOR · 2002', 120, 140, ss((g - t.galidor) / 0.3), { size: 56, bar: '#E4701C' }); plate(ctx, 'A BUILDABLE ACTION FIGURE', 120, 225, ss((g - t.galidor - 0.3) / 0.3), { size: 36 });
    stamp(ctx, 'FLOPPED', 1450, 820, ss((g - t.flopped) / 0.25), -0.15, 90); } });
  // 9 · why didn't the numbers scream? the movies: sales line with film-release spikes; underneath, the cost cracks hidden behind a screen
  S.push({ t0: L.b9 - 0.2, fn: (ctx, g, lt) => { ctx.fillStyle = '#121820'; ctx.fillRect(0, 0, W, H);
    const x0 = 160, x1 = 1760, y0 = 700, yrs = [1998, 1999, 2000, 2001, 2002], xs = i => lerp(x0, x1, i / 4);
    ctx.strokeStyle = 'rgba(244,239,230,0.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke(); yrs.forEach((y, i) => plate(ctx, String(y), xs(i), y0 + 50, 1, { size: 32, align: 'center', bg: 'none' }));
    const films = [[1, 'STAR WARS', t.y99], [3, 'HARRY POTTER', t.hp2], [4, 'STAR WARS · HP', t.y02]]; const u = clamp((g - t.movies + 0.3) / 3.2);
    ctx.save(); ctx.strokeStyle = '#E3B341'; ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.beginPath(); for (let i = 0; i <= 200 * u; i++) { const v = i / 200, x = lerp(x0, x1, v); let y = y0 - 220;
      for (const [k] of films) y -= 170 * Math.exp(-Math.pow((v - k / 4) * 14, 2)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();
    films.forEach(([k, lab, t0]) => { const a = ss((g - t0) / 0.3); if (a <= 0) return; icon(ctx, 'film', xs(k), 220, a, '#E3B341'); plate(ctx, lab, xs(k), 300, a, { size: 26, align: 'center' }); });
    // the cracks (rising costs) under a "screen"
    const cr = ss((g - t.cracks + 0.4) / 0.8); ctx.save(); ctx.strokeStyle = `rgba(255,90,70,${0.25 + 0.75 * cr})`; ctx.lineWidth = 4; for (let i = 0; i < 9; i++) { let x = x0 + i * 190, y = y0 + 110; ctx.beginPath(); ctx.moveTo(x, y); for (let j = 0; j < 8; j++) { x += (hash(i * 9 + j) - 0.5) * 60; y += 30; ctx.lineTo(x, y); } ctx.stroke(); } ctx.restore();
    ctx.fillStyle = `rgba(18,24,32,${0.85 * (1 - cr)})`; ctx.fillRect(x0, y0 + 90, x1 - x0, 300);
    plate(ctx, "WHY DIDN'T THE NUMBERS SCREAM?", 120, 120, ss((g - L.b9) / 0.3) * (1 - ss((g - t.movies) / 0.3)), { size: 52 }); plate(ctx, 'THE MOVIES SOLD BOXES', 120, 120, ss((g - t.movies) / 0.3), { size: 52, bar: '#E3B341' });
    plate(ctx, '…AND COVERED THE CRACKS', W - 120, 1000, cr, { size: 48, align: 'right', bg: 'rgba(201,26,20,0.95)' }); plate(ctx, 'ILLUSTRATIVE · FILM YEARS ARE REAL', x0, y0 + 110, 1 - cr, { size: 22, bg: 'none', col: 'rgba(244,239,230,0.6)' }); } });
  return S; } });
