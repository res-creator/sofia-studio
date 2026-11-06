// Chapter 4 · The Year Without a Movie (2003–2004): an empty release calendar -> sales 11.4 -> 8.4 bn, USA ≈ −35 %, movie sets > half of the drop
// -> the hidden cost (machines and bins keep costing money) -> Jan 2004: record loss, the manager leaves, Kjeld steps in -> the "whale curve"
// (60 % of sales = 100 % of profit) -> 2004 worse: will LEGO survive?
const D = require('./doc.js'); const { E, W, H, clamp, lerp, ss, ease, hash, Scene, U, BH, brick, oddPiece, camera, render, C, PAL, IMG, HAS, cred, photo, print, credit, plate, LIGHT, DARK, studio, paper, fade, stamp, doc, map, arc, card } = D;
D.segment(module, { chapter: 'c4_nomovie', build: ({ at, L, T, fx }) => {
  const t = { y03: at('y1', '2003'), sw: at('y1', 'Star'), hp: at('y1', 'Harry'),
    fell: at('y2', 'fell'), quarter: at('y2', 'quarter'), us: at('y2', 'United'), third: at('y2', 'third'), half: at('y2', 'half'), stores: at('y2', 'stores'), less: at('y2', 'less'),
    hidden: at('y3', 'hidden'), molds: at('y3', 'molds'), paid: at('y3', 'paid'), whether: at('y3', 'whether'),
    jan: at('y4', 'January'), record: at('y4', 'record'), point: at('y4', 'point'), tax: at('y4', 'tax'), manager: at('y4', 'turnaround'), left: at('y4', 'left'), kjeld: at('y4', 'Kjeld'), himself: at('y4', 'himself'),
    finance: at('y5', 'finance'), product: at('y5', 'product'), worse: at('y5', 'worse'), sixty: at('y5', 'sixty'), all: at('y5', 'all'), everything: at('y5', 'Everything'), losing: at('y5', 'losing'), destroying: at('y5', 'destroying'),
    y04: at('y6', '2004'), real: at('y6', 'real'), independent: at('y6', 'independent'), survive: at('y6', 'survive') };
  fx('thump', 0.6, 0.5); fx('click', 1.0, 0.7);
  fx('paper', L.y1, 0.4); fx('buzz', t.sw + 0.2, 0.3); fx('buzz', t.hp + 0.2, 0.3);
  fx('slidedown', t.fell, 0.6); fx('stamp', t.quarter, 0.5); fx('pop', t.us, 0.4); fx('stamp', t.third, 0.5); fx('paper', t.stores, 0.4); fx('tear', t.less, 0.5);
  fx('factory', t.hidden, 0.45); fx('machine', t.molds, 0.35); for (let i = 0; i < 16; i++) fx('clink', t.paid + i * 0.18, 0.18);
  fx('print', t.jan - 0.2, 0.4); fx('stamp', t.record, 0.6); fx('steps', t.left, 0.35); fx('slam', t.left + 1.0, 0.35); fx('shutter', t.kjeld - 0.2, 0.5);
  fx('paper', t.finance, 0.4); fx('flip', t.product, 0.3); fx('flip', t.product + 0.4, 0.3); fx('rise', t.sixty - 0.2, 0.5); fx('fall', t.everything, 0.5); fx('gasp', t.destroying, 0.25);
  fx('heartbeat', t.y04, 0.6); fx('heartbeat', t.real, 0.6); fx('wind', t.survive, 0.5);
  const S = [];
  S.push({ t0: 0, fn: (ctx, g, lt) => card(ctx, lt, 4, 'The Year Without a Movie', '2003 — 2004', { c0: '#1a1a1a', c1: '#000', acc: '#ff6a55' }) });
  // 1 · the release calendar: films in 1999, 2001, 2002 … and an empty 2003
  S.push({ t0: L.y1 - 0.2, fn: (ctx, g, lt) => { ctx.fillStyle = '#101317'; ctx.fillRect(0, 0, W, H);
    const yrs = [1999, 2000, 2001, 2002, 2003, 2004], films = { 1999: ['STAR WARS'], 2001: ['HARRY POTTER'], 2002: ['STAR WARS', 'HARRY POTTER'], 2004: ['HARRY POTTER'] }, x0 = 170, cw = 270;
    const pan = ease.inOut(clamp((g - t.y03 + 0.4) / 1.2)); ctx.save(); ctx.translate(-pan * 90, 0);
    yrs.forEach((y, i) => { const x = x0 + i * cw, is03 = y === 2003; ctx.fillStyle = is03 ? '#2a1313' : '#1c2128'; ctx.fillRect(x, 260, cw - 20, 560); ctx.fillStyle = is03 ? '#ff6a55' : 'rgba(244,239,230,0.85)'; ctx.font = `900 54px ${E.F}`; ctx.fillText(String(y), x + 24, 330);
      (films[y] || []).forEach((f, k) => { if (y === 2004) return; ctx.fillStyle = '#E3B341'; ctx.fillRect(x + 20, 400 + k * 140, cw - 60, 110); ctx.fillStyle = '#16120a'; ctx.font = `800 24px ${E.F}`; ctx.fillText(f, x + 32, 463 + k * 140); });
      if (is03) { const a = ss((g - t.sw) / 0.3); ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([12, 10]); ctx.strokeStyle = '#ff6a55'; ctx.lineWidth = 4; ctx.strokeRect(x + 20, 400, cw - 60, 110); ctx.strokeRect(x + 20, 540, cw - 60, 110); ctx.restore();
        ctx.fillStyle = '#ff6a55'; ctx.font = `800 24px ${E.F}`; ctx.globalAlpha = ss((g - t.sw) / 0.3); ctx.fillText('NO NEW FILM', x + 36, 465); ctx.globalAlpha = ss((g - t.hp) / 0.3); ctx.fillText('NO NEW FILM', x + 36, 605); ctx.globalAlpha = 1; } });
    ctx.restore(); E.glow(ctx, x0 + 4 * cw + 115 - pan * 90, 540, 500, 'rgba(255,90,60,1)', 0.12 * pan);
    plate(ctx, 'NEW LICENSED FILMS', 120, 150, ss((lt - 0.1) / 0.3), { size: 46 }); } });
  // 2 · the drop: 11.4 bn -> 8.4 bn (two bars), USA ≈ −35 %, more than half: movie sets; stores order less
  S.push({ t0: L.y2 - 0.2, light: 1, fn: (ctx, g, lt) => { paper(ctx, '#f2ece2');
    if (g < t.stores - 0.2) { const bx = 300, by = 880, sc = 52, a1 = ease.out(clamp(lt / 0.6)), a2 = ease.out(clamp((g - t.fell) / 0.7));
      ctx.fillStyle = '#9a8f80'; ctx.fillRect(bx, by - 11.4 * sc * a1, 240, 11.4 * sc * a1); ctx.fillStyle = '#C91A14'; ctx.fillRect(bx + 340, by - 8.4 * sc * a2, 240, 8.4 * sc * a2);
      // the slice lost from movie sets (hatched)
      const h = ss((g - t.half) / 0.4); if (h > 0) { ctx.save(); ctx.globalAlpha = h; ctx.strokeStyle = '#E3B341'; ctx.lineWidth = 6; ctx.strokeRect(bx + 340, by - 11.4 * sc, 240, 3.0 * sc); for (let k = 0; k < 10; k++) { ctx.beginPath(); ctx.moveTo(bx + 340 + k * 26, by - 8.4 * sc); ctx.lineTo(bx + 340 + k * 26 + 40, by - 11.4 * sc); ctx.stroke(); } ctx.restore();
        plate(ctx, 'MORE THAN HALF OF THE DROP: MOVIE SETS', bx + 620, by - 10 * sc, h, { size: 34, bg: 'rgba(227,179,65,0.95)', col: '#141414' }); }
      plate(ctx, '2002', bx + 120, by + 44, 1, { size: 36, align: 'center', bg: 'none', col: '#2a2016' }); plate(ctx, '2003', bx + 460, by + 44, 1, { size: 36, align: 'center', bg: 'none', col: '#2a2016' });
      plate(ctx, 'DKK 11.4 BN', bx + 120, by - 11.4 * sc * a1 - 40, a1, { size: 34, align: 'center', bg: 'none', col: '#2a2016' }); plate(ctx, 'DKK 8.4 BN', bx + 460, by - 8.4 * sc * a2 - 40, a2, { size: 34, align: 'center', bg: 'none', col: '#C91A14' });
      plate(ctx, 'SALES −26%', W - 120, 300, ss((g - t.quarter) / 0.3), { size: 80, align: 'right', bg: 'rgba(201,26,20,0.95)' }); plate(ctx, 'USA ≈ −35%', W - 120, 430, ss((g - t.third) / 0.3), { size: 56, align: 'right' });
      plate(ctx, 'SOURCE: LEGO ANNUAL REPORT 2003', W - 120, 1000, 1, { size: 22, align: 'right', bg: 'none', col: '#5a4a30' }); return; }
    // stores order less: an order form with lines struck through
    doc(ctx, 960, 560, 900, 820, 0.02, { title: 'RETAIL ORDER · 2003', tsize: 46, n: 0, draw: (c, w, h) => { for (let i = 0; i < 9; i++) { const y = -h / 2 + 170 + i * 66; c.fillStyle = 'rgba(40,40,40,0.5)'; c.fillRect(-w / 2 + 40, y, 420, 10); c.fillRect(w / 2 - 200, y, 140, 10);
        const u = ss((g - t.less - i * 0.12) / 0.3); if (u > 0) { c.strokeStyle = '#C91A14'; c.lineWidth = 6; c.beginPath(); c.moveTo(-w / 2 + 30, y + 5); c.lineTo(-w / 2 + 30 + (w - 60) * u, y + 5); c.stroke(); } } } });
    plate(ctx, 'STORES THAT STOCKED UP NOW ORDER LESS', W / 2, 110, ss((g - t.stores) / 0.3), { size: 46, align: 'center' }); } });
  // 3 · the hidden cost: rows of molds that cost money every day, whether a set sells or not (meter keeps running)
  S.push({ t0: L.y3 - 0.2, fn: (ctx, g, lt) => { ctx.fillStyle = '#0f1216'; ctx.fillRect(0, 0, W, H);
    const cam = camera([lerp(-60, 60, ss(lt / 10)), 120, 360], [0, 10, -60], 40), sc = new Scene();
    for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) { const x = -260 + c * 64, z = -r * 70; sc.box({ x: x - 22, y: 0, z: z - 18 }, 44, 26, 36, [120, 126, 132], { edge: 0.6 }); sc.box({ x: x - 10, y: 26, z: z - 8 }, 20, 6, 16, [80, 86, 92], {});
      const on = Math.sin(g * 6 + c + r * 2) > 0.3; if (on) sc.box({ x: x + 14, y: 14, z: z + 18 }, 6, 6, 1, [255, 120, 60], { emissive: 1 }); }
    render(ctx, sc, cam, Object.assign({}, DARK, { fogNear: 200, fogFar: 1000 }));
    // the cost meter
    const v = Math.max(0, g - t.paid + 0.5) * 3.7; ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(1240, 760, 560, 200); ctx.fillStyle = '#ff6a55'; ctx.font = `900 70px ${E.F}`; ctx.fillText('−' + (v * 1000).toFixed(0).padStart(5, '0'), 1280, 880); ctx.fillStyle = 'rgba(244,239,230,0.7)'; ctx.font = `700 24px ${E.F}`; ctx.fillText('FIXED COSTS · ILLUSTRATIVE METER', 1280, 930); ctx.restore();
    plate(ctx, 'THE HIDDEN COST', 120, 140, ss((g - t.hidden) / 0.3), { size: 60, bar: '#ff6a55' }); plate(ctx, 'THOUSANDS OF MOLDS, BINS, PRODUCTION RUNS', 120, 230, ss((g - t.molds) / 0.3), { size: 38 });
    plate(ctx, 'PAID FOR — WHETHER A SET SOLD OR NOT', 120, 990, ss((g - t.whether) / 0.3), { size: 44, bg: 'rgba(201,26,20,0.95)' }); } });
  // 4 · January 2004: the business-page front page (generic masthead) -> the manager leaves -> Kjeld steps in (archive photo)
  S.push({ t0: L.y4 - 0.2, light: 1, fn: (ctx, g, lt) => { paper(ctx, '#dcd5c8');
    if (g < t.kjeld - 0.2) { const z = lerp(1, 1.1, ss(lt / 8)); ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.rotate(-0.02); ctx.translate(-W / 2, -H / 2);
      ctx.fillStyle = '#f7f3ea'; ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 40; ctx.fillRect(300, 70, 1320, 940); ctx.shadowColor = 'transparent'; ctx.fillStyle = '#1f1f1f'; ctx.font = `900 64px ${E.F}`; ctx.textAlign = 'center'; ctx.fillText('THE BUSINESS PAGE', W / 2, 160);
      ctx.fillRect(340, 185, 1240, 4); ctx.font = `700 24px ${E.F}`; ctx.fillText('JANUARY 2004', W / 2, 225); ctx.textAlign = 'left'; ctx.font = `900 92px ${E.F}`; const hl = ss((g - t.record + 0.2) / 0.4);
      ctx.globalAlpha = hl; ctx.fillText('LEGO: RECORD LOSS', 360, 360); ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(40,40,40,0.4)'; for (let i = 0; i < 12; i++) ctx.fillRect(360 + (i % 2) * 620, 420 + Math.floor(i / 2) * 44, 560 - hash(i) * 120, 12);
      ctx.restore(); plate(ctx, '2003: ≈ −DKK 1.4 BN BEFORE TAX', W / 2, 820, ss((g - t.point) / 0.3), { size: 64, align: 'center', bg: 'rgba(201,26,20,0.95)' });
      plate(ctx, 'THE TURNAROUND MANAGER LEAVES', W / 2, 930, ss((g - t.left) / 0.3), { size: 44, align: 'center' }); plate(ctx, 'RE-CREATED PAGE (ILLUSTRATION)', 120, 1040, 1, { size: 20, bg: 'none', col: '#5a4a30' }); return; }
    ctx.fillStyle = '#1b2230'; ctx.fillRect(0, 0, W, H); const k = HAS('kjeld96') ? 'kjeld96' : HAS('kjeld18') ? 'kjeld18' : null;
    // an office door: the nameplate changes
    const dx = k ? 380 : 960, sw = ease.inOut(clamp((g - t.kjeld) / 0.6)); ctx.save(); ctx.fillStyle = '#6b4a2e'; ctx.fillRect(dx - 260, 160, 520, 900); ctx.strokeStyle = '#4a321e'; ctx.lineWidth = 10; ctx.strokeRect(dx - 220, 220, 440, 360); ctx.strokeRect(dx - 220, 620, 440, 380);
    ctx.fillStyle = '#d9b45a'; ctx.beginPath(); ctx.arc(dx + 200, 640, 18, 0, 6.283); ctx.fill(); ctx.fillStyle = '#e9e1cc'; ctx.fillRect(dx - 200, 300, 400, 140); ctx.beginPath(); ctx.rect(dx - 200, 300, 400, 140); ctx.clip();
    ctx.fillStyle = '#1f1f1f'; ctx.textAlign = 'center'; ctx.font = `800 26px ${E.F}`; ctx.fillText('CHIEF EXECUTIVE', dx, 340 - sw * 140); ctx.font = `900 30px ${E.F}`; ctx.fillText('(VACANT)', dx, 390 - sw * 140);
    ctx.font = `800 26px ${E.F}`; ctx.fillText('DAY-TO-DAY', dx, 480 - sw * 140); ctx.font = `900 30px ${E.F}`; ctx.fillText('K. KIRK KRISTIANSEN', dx, 530 - sw * 140); ctx.restore();
    if (k) { photo(ctx, IMG[k], (g - t.kjeld) / 5, { z0: 1.4, z1: 1.5, filter: 'blur(26px) brightness(0.5)' }); print(ctx, IMG[k], 1300, 520, k === 'kjeld96' ? 760 : 520, -0.02, { foot: 40 }); credit(ctx, cred(k) + (k === 'kjeld96' ? ' · photo 1996, event 2004' : ' · photo 2018, event 2004'), 1); }
    plate(ctx, 'KJELD KIRK KRISTIANSEN', k ? 820 : 120, k ? 900 : 120, ss((g - t.kjeld) / 0.3), { size: 56, bar: '#E3B341' }); plate(ctx, 'TAKES OVER THE DAY-TO-DAY HIMSELF', k ? 820 : 120, k ? 990 : 210, ss((g - t.himself) / 0.3), { size: 40 }); } });
  // 5 · product by product: the "whale curve" — cumulative profit by product, best first: 60 % of sales already make 100 %+ of the profit, the rest drags it down
  S.push({ t0: L.y5 - 0.2, light: 1, fn: (ctx, g, lt) => { paper(ctx, '#f3eee5');
    const x0 = 220, x1 = 1700, yb = 860, yt = 260, u = clamp((g - t.product) / (t.losing - t.product + 0.8));
    const f = v => v <= 0.6 ? 1.25 * (1 - Math.pow(1 - v / 0.6, 2)) : 1.25 - 0.25 * Math.pow((v - 0.6) / 0.4, 1.4) * 1.0;   // shape only (illustrative): peaks above 100 % at 60 %, ends at 100 %
    const X = v => lerp(x0, x1, v), Y = p => yb - (yb - yt) * p / 1.3;
    ctx.strokeStyle = '#2a2016'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, yt - 20); ctx.lineTo(x0, yb); ctx.lineTo(x1 + 20, yb); ctx.stroke();
    ctx.setLineDash([10, 10]); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.moveTo(x0, Y(1)); ctx.lineTo(x1, Y(1)); ctx.stroke(); ctx.setLineDash([]);
    plate(ctx, '100% OF OPERATING PROFIT', x0 + 10, Y(1) - 30, 1, { size: 24, bg: 'none', col: '#5a4a30' });
    ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i <= 200 * u; i++) { const v = i / 200; ctx.strokeStyle = v <= 0.6 ? '#237841' : '#C91A14'; if (i) { ctx.lineTo(X(v), Y(f(v))); ctx.stroke(); ctx.beginPath(); } ctx.moveTo(X(v), Y(f(v))); }
    const m = ss((g - t.sixty) / 0.4); if (m > 0) { ctx.save(); ctx.globalAlpha = m; ctx.fillStyle = 'rgba(35,120,65,0.10)'; ctx.fillRect(x0, yt - 20, X(0.6) - x0, yb - yt + 20); ctx.setLineDash([8, 8]); ctx.strokeStyle = '#237841'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X(0.6), yt - 20); ctx.lineTo(X(0.6), yb); ctx.stroke(); ctx.restore(); }
    plate(ctx, '60% OF SALES', X(0.3), yb + 50, m, { size: 40, align: 'center', bg: 'rgba(35,120,65,0.95)' }); plate(ctx, 'MAKE ALL THE PROFIT', X(0.3), yt - 70, ss((g - t.all) / 0.3), { size: 40, align: 'center', bg: 'rgba(35,120,65,0.95)' });
    const r = ss((g - t.everything) / 0.4); if (r > 0) { ctx.save(); ctx.globalAlpha = r; ctx.fillStyle = 'rgba(201,26,20,0.08)'; ctx.fillRect(X(0.6), yt - 20, x1 - X(0.6), yb - yt + 20); ctx.restore(); }
    plate(ctx, 'EVERYTHING ELSE: LOSING MONEY', X(0.8), yb + 50, r, { size: 36, align: 'center', bg: 'rgba(201,26,20,0.95)' });
    plate(ctx, 'PRODUCTS RANKED FROM MOST TO LEAST PROFITABLE →', x0, yb + 120, ss((g - t.product) / 0.3), { size: 26, bg: 'none', col: '#5a4a30' });
    plate(ctx, 'PRODUCT BY PRODUCT', 120, 120, ss((g - t.product) / 0.3), { size: 50, bar: '#C91A14' });
    plate(ctx, '"DESTROYING VALUE SINCE 1993"', W - 120, 160, ss((g - t.destroying) / 0.3), { size: 46, align: 'right', bg: 'rgba(20,20,22,0.88)' }); plate(ctx, '— A LEGO FINANCE EXECUTIVE, LATER (CFO.com)', W - 120, 230, ss((g - t.destroying - 0.3) / 0.3), { size: 24, align: 'right' }); } });
  // 6 · 2004 worse: the cash gauge falls into the red — will LEGO survive as an independent family company?
  S.push({ t0: L.y6 - 0.2, fn: (ctx, g, lt) => { ctx.fillStyle = '#0c0d10'; ctx.fillRect(0, 0, W, H);
    const cx = W / 2, cy = 700, R = 420, ang = lerp(-0.2, -2.9, ease.inOut(clamp((g - t.y04) / 3)));
    ctx.save(); ctx.lineWidth = 60; [['#237841', -0.0, -1.0], ['#E3B341', -1.0, -2.1], ['#C91A14', -2.1, -3.14]].forEach(([c, a0, a1]) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI + Math.PI + a1, Math.PI + Math.PI + a0); ctx.stroke(); });
    ctx.restore(); ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang); ctx.fillStyle = '#f4efe6'; ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(R - 40, 0); ctx.lineTo(0, 14); ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, 26, 0, 6.283); ctx.fill(); ctx.restore();
    E.type(ctx, '2004', cx, 200, g - t.y04, { size: 120, col: '#ff6a55' }); plate(ctx, 'EVEN WORSE THAN 2003', cx, 290, ss((g - t.y04 - 0.5) / 0.3), { size: 40, align: 'center' });
    plate(ctx, 'WILL LEGO SURVIVE AS AN INDEPENDENT FAMILY COMPANY?', cx, 960, ss((g - t.real) / 0.4), { size: 46, align: 'center', bg: 'rgba(201,26,20,0.95)' }); fade(ctx, ss((g - (T - 0.6)) / 0.6)); } });
  return S; } });
