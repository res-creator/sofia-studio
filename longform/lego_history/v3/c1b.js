// Chapter 1, second half (c3–c6): 1954 "no system" -> the System of Play (1955) -> the clutch + 1958 patent -> 1960 fire -> the two ideas.
const D = require('./doc.js'); const { E, W, H, clamp, lerp, ss, ease, hash, Scene, U, BH, brick, oddPiece, camera, render, C, PAL, IMG, HAS, cred, photo, print, credit, plate, LIGHT, DARK, studio, paper, fade, stamp, doc } = D;
const toyCols = [C.yellow, C.red, C.blue, C.green];
D.segment(module, { chapter: 'c1_system', from: 31.06, build: ({ at, L, T, fx }) => {
  const t = { y54: at('c3', '1954'), son: at('c3', 'son'), complain: at('c3', 'complain'), nothing: at('c3', 'Nothing'), so: at('c3', 'So', 1), town: at('c3', 'town'), every: at('c3', 'every'), adds: at('c3', 'adds'), launched: at('c3', 'launched'), year: at('c3', 'year'),
    problem: at('c4', 'problem'), hold: at('c4', 'hold'), tubes: at('c4', 'tubes'), y58: at('c4', '1958'), patent: at('c4', 'patent'), locked: at('c4', 'locked'),
    two: at('c5', 'Two'), fire: at('c5', 'fire'), wooden: at('c5', 'wooden'), rebuild: at('c5', 'rebuild'), focused: at('c5', 'focused'),
    keep: at('c6', 'Keep'), system: at('c6', 'system'), same: at('c6', 'same'), after: at('c6', 'after'), stronger: at('c6', 'stronger'), less: at('c6', 'less'), four: at('c6', 'Four'), forget: at('c6', 'forget') };
  // sfx
  fx('shutter', L.c3 - 0.2, 0.5); fx('murmur', t.complain - 0.2, 0.25); for (let i = 0; i < 5; i++) fx('tap', t.nothing + i * 0.18, 0.35);
  fx('whoosh', t.so - 0.15, 0.5); fx('paper', t.so + 0.1, 0.5); for (let i = 0; i < 18; i++) fx('click', t.town + i * 0.22, 0.28); fx('slideup', t.adds - 0.1, 0.4); fx('stamp', t.launched + 0.3, 0.6);
  fx('whoosh', L.c4 - 0.2, 0.4); fx('slidedown', t.hold, 0.5); fx('scan', t.tubes - 0.1, 0.4); fx('paper', t.y58 - 0.2, 0.6); fx('stamp', t.patent + 0.2, 0.7); fx('click', t.locked, 1.0);
  fx('rumble', t.two, 0.5); fx('boom', t.fire, 0.5); fx('wind', t.fire + 0.6, 0.5); fx('rumble2', t.fire + 1.6, 0.4); fx('wind', t.focused - 0.6, 0.25); for (let i = 0; i < 6; i++) fx('click', t.focused + 0.1 + i * 0.22, 0.35);
  fx('whoosh', L.c6 - 0.2, 0.4); for (let i = 0; i < 12; i++) fx('click', t.same + i * 0.28, 0.25); fx('puff', t.less, 0.4); fx('heartbeat', t.four, 0.5); fx('wind', t.forget, 0.35);
  const S = [];
  // 1 · Godtfred, 1954 (archive photo 1950), the buyer's complaint
  S.push({ t0: L.c3 - 0.25, light: 0, fn: (ctx, g, lt) => {
    if (HAS('godtfred')) { ctx.fillStyle = '#222'; ctx.fillRect(0, 0, W, H); photo(ctx, IMG.godtfred, lt / 6, { z0: 1.6, z1: 1.7, filter: 'blur(26px) brightness(0.45) sepia(0.5)' });
      print(ctx, IMG.godtfred, 1360, 520, 520, 0.03, { filter: 'sepia(0.3) contrast(1.05)', foot: 40 }); credit(ctx, cred('godtfred') + ' · photo 1950, event 1954', ss((lt - 0.4) / 0.4)); }
    else { paper(ctx, '#e9e1d0'); // fallback without the 1950 photo: an archive index card
      doc(ctx, 1320, 520, 640, 760, 0.03, { title: 'LEGO · BILLUND', tsize: 40, n: 12, seed: 3, draw: (c, w, h) => { c.fillStyle = '#C91A14'; c.font = `900 64px ${E.F}`; c.fillText('1954', -w / 2 + 40, h / 2 - 80); } });
      ctx.fillStyle = 'rgba(0,0,0,0)'; }
    E.type(ctx, '1954', 140, 300, g - t.y54, { size: 170, align: 'left', col: HAS('godtfred') ? '#E3B341' : '#C91A14' });
    plate(ctx, 'GODTFRED KIRK CHRISTIANSEN', 140, 470, ss((g - t.son) / 0.35), { size: 50, bar: '#E3B341' });
    plate(ctx, "OLE KIRK'S SON", 140, 555, ss((g - t.son - 0.2) / 0.35), { size: 36 });
    plate(ctx, '"TOYS HAVE NO SYSTEM"', 140, 700, ss((g - t.complain) / 0.35), { size: 56, bg: 'rgba(201,26,20,0.92)' });
    plate(ctx, '— A TOY BUYER, ACCORDING TO LEGO\'S OWN HISTORY', 140, 790, ss((g - t.complain - 0.3) / 0.35), { size: 28 }); } });
  // 2 · nothing connects: toys of different kinds bump and roll apart on a play mat (light)
  S.push({ t0: t.nothing - 0.2, light: 1, fn: (ctx, g, lt) => { studio(ctx, '#f4efe4', '#e9e0cf', '#d2c4aa');
    const cam = camera([0, 150, 260], [0, 0, 0], 40), sc = new Scene();
    const items = [[-90, 0, 'duck'], [-20, 40, 'ball'], [60, -10, 'truck'], [110, 50, 'blocks'], [-60, -60, 'top'], [20, -70, 'cart']];
    items.forEach(([x, z, k], i) => { const sp = Math.sin(lt * 2 + i) * 6, X = x + sp * (i % 2 ? 1 : -1), Z = z + Math.cos(lt * 1.6 + i) * 4; sc.shadow(X, 0, Z, 22, 0.35);
      if (k === 'duck') { sc.prism({ x: X, y: 0, z: Z, yaw: lt * 0.3 }, [[-18, -8], [16, -8], [20, 0], [16, 8], [-18, 8]], 4, 14, C.yellow, {}); sc.box({ x: X + 4, y: 18, z: Z - 6 }, 12, 14, 12, C.yellow, {}); }
      if (k === 'ball') sc.cyl({ x: X, y: 0, z: Z }, 0, 0, 0, 14, 22, C.red, 16, {});
      if (k === 'truck') { sc.box({ x: X - 20, y: 4, z: Z - 10 }, 30, 14, 20, C.blue, {}); sc.box({ x: X + 10, y: 4, z: Z - 10 }, 12, 20, 20, C.red, {}); }
      if (k === 'blocks') { sc.box({ x: X, y: 0, z: Z, yaw: 0.4 }, 16, 16, 16, C.green, {}); sc.box({ x: X + 4, y: 16, z: Z + 2, yaw: 0.9 }, 14, 14, 14, C.orange, {}); }
      if (k === 'top') sc.cyl({ x: X, y: 0, z: Z }, 0, 0, 0, 12, 10, C.purple, 12, {});
      if (k === 'cart') { sc.box({ x: X - 12, y: 6, z: Z - 8 }, 24, 10, 16, C.tan, {}); } });
    render(ctx, sc, cam, LIGHT);
    // dashed "no connection" marks between items
    ctx.save(); ctx.strokeStyle = 'rgba(201,26,20,0.85)'; ctx.lineWidth = 5; ctx.setLineDash([14, 12]); [[520, 520, 760, 420], [900, 470, 1180, 560], [1220, 420, 1420, 500]].forEach(([a, b, c, d], i) => { const u = ss((lt - 0.2 - i * 0.25) / 0.4); if (u <= 0) return;
      ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(lerp(a, c, u), lerp(b, d, u)); ctx.stroke(); const mx = (a + c) / 2, my = (b + d) / 2; if (u >= 1) { ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(mx - 16, my - 16); ctx.lineTo(mx + 16, my + 16); ctx.moveTo(mx + 16, my - 16); ctx.lineTo(mx - 16, my + 16); ctx.stroke(); ctx.setLineDash([14, 12]); } }); ctx.restore();
    plate(ctx, 'NOTHING CONNECTED TO ANYTHING ELSE', W / 2, 150, ss((lt - 0.1) / 0.3), { size: 56, align: 'center' }); } });
  // 3 · the System: a town plan (paper street grid) where every new set adds to the last — sets 1, 2, 3 slide in and join the same town
  S.push({ t0: t.so - 0.15, light: 1, fn: (ctx, g, lt) => { studio(ctx, '#f3ede1', '#e7decb', '#cdbf9f');
    const rise = ss((g - t.every) / 2.5), cam = camera([lerp(0, 90, rise), lerp(300, 230, rise), lerp(420, 400, rise)], [0, 0, -10], 38), sc = new Scene();
    // town plan mat
    sc.box({ x: -200, y: -2, z: -140 }, 400, 2, 280, [214, 206, 188], { edge: 0.4, ground: 1 });
    for (let i = -2; i <= 2; i++) { sc.box({ x: -200, y: 0.1, z: i * 60 - 8 }, 400, 0.4, 16, [120, 120, 124], { edge: 0, ground: 1, layer: 1 }); sc.box({ x: i * 80 - 8, y: 0.12, z: -140 }, 16, 0.4, 280, [120, 120, 124], { edge: 0, ground: 1, layer: 1 }); }
    // houses built from classic bricks, set by set
    const HOUSES = [[-120, -100, C.red], [-40, -100, C.white], [40, -100, C.yellow], [120, -100, C.blue], [-120, -20, C.yellow], [-40, -20, C.red], [40, -20, C.white], [120, -20, C.red], [-120, 60, C.blue], [-40, 60, C.white], [40, 60, C.red], [120, 60, C.yellow]];
    const n = clamp((g - t.town) / (t.launched - t.town)) * HOUSES.length;
    HOUSES.forEach(([x, z, col], i) => { if (i > n) return; const f = clamp(n - i), drop = (1 - ease.out(f)) * 80;
      D.house(sc, x, drop, z, col);
      sc.shadow(x, 0, z, 30, 0.3); });
    render(ctx, sc, cam, Object.assign({}, LIGHT, { fogFar: 3200 }));
    const set = Math.min(3, Math.floor(clamp((g - t.adds + 0.6) / 1.6) * 3 + (g > t.adds - 0.6 ? 1 : 0)));
    for (let k = 0; k < set; k++) plate(ctx, `SET ${k + 1}`, 120 + k * 200, 980, 1, { size: 44, bg: ['rgba(201,26,20,0.92)', 'rgba(0,87,168,0.92)', 'rgba(35,120,65,0.92)'][k] });
    plate(ctx, 'EVERY PIECE FITS EVERY OTHER PIECE', W / 2, 150, ss((g - t.every) / 0.3) * (1 - ss((g - t.launched + 0.1) / 0.3)), { size: 52, align: 'center' });
    E.type(ctx, '1955', W - 150, 300, g - t.launched - 0.1, { size: 170, align: 'right', col: '#C91A14' }); plate(ctx, 'THE LEGO SYSTEM OF PLAY', W - 150, 380, ss((g - t.launched - 0.3) / 0.3), { size: 40, align: 'right' }); } });
  // 4 · the problem: bricks slip apart (cutaway) -> tubes appear -> locked
  S.push({ t0: L.c4 - 0.2, light: 1, fn: (ctx, g, lt) => { studio(ctx);
    const cam = camera([60, 40, 118], [6, 12, 0], 36), sc = new Scene(); sc.shadow(0, 0, 0, 30, 0.35);
    const slip = g < t.tubes ? ss((g - t.hold) / 0.9) : 0, lock = ss((g - t.locked + 0.35) / 0.35);
    brick(sc, { x: 0, y: 0, z: 0 }, 4, 2, C.red);
    const yTop = g < t.tubes ? BH + slip * 8 : lerp(BH + 26, BH, ease.in(lock)); brick(sc, { x: g < t.tubes ? slip * 26 : 0, y: yTop, z: 0, roll: slip * 0.35 }, 4, 2, C.white);
    render(ctx, sc, cam, LIGHT);
    // x-ray inset: underside with tubes
    const xr = ss((g - t.tubes + 0.1) / 0.4) * (1 - ss((g - t.y58 + 0.4) / 0.3)); if (xr > 0) { ctx.save(); ctx.globalAlpha = xr; ctx.fillStyle = 'rgba(14,30,52,0.92)'; ctx.fillRect(1180, 200, 600, 420);
      ctx.strokeStyle = '#7cc4ff'; ctx.lineWidth = 4; ctx.strokeRect(1250, 300, 460, 200); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(1365 + i * 115, 400, 38, 0, 6.283); ctx.stroke(); }
      ctx.fillStyle = '#7cc4ff'; ctx.font = `800 30px ${E.F}`; ctx.fillText('UNDERSIDE: NEW TUBES', 1250, 260); ctx.restore(); }
    plate(ctx, "THE BRICKS DIDN'T HOLD", 140, 150, ss((g - t.hold) / 0.3) * (1 - ss((g - t.tubes) / 0.3)), { size: 54, bg: 'rgba(201,26,20,0.92)' });
    plate(ctx, 'GODTFRED ADDS TUBES UNDERNEATH', 140, 150, ss((g - t.tubes) / 0.3), { size: 50 }); } });
  // 5 · the 1958 patent (real document) — scanner sweep + highlight
  S.push({ t0: t.y58 - 0.35, light: 1, fn: (ctx, g, lt) => { paper(ctx, '#e6dfd0');
    const im = IMG.patent1, z = lerp(1.0, 1.18, ss(lt / 4)), w = 820 * z, h = w * im.height / im.width;
    ctx.save(); ctx.translate(W / 2 - 160, H / 2 + 40 + (1 - z) * 200); ctx.rotate(-0.02); ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; ctx.fillStyle = '#fff'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowColor = 'transparent';
    ctx.drawImage(im, -w / 2, -h / 2, w, h);
    const sw = ((lt * 0.6) % 1.2) - 0.1; const gy = -h / 2 + sw * h; const gr = ctx.createLinearGradient(0, gy - 40, 0, gy + 40); gr.addColorStop(0, 'rgba(80,170,255,0)'); gr.addColorStop(0.5, 'rgba(80,170,255,0.25)'); gr.addColorStop(1, 'rgba(80,170,255,0)'); ctx.fillStyle = gr; ctx.fillRect(-w / 2, gy - 40, w, 80);
    const hl = ss((g - t.locked + 0.2) / 0.4); if (hl > 0) { ctx.strokeStyle = `rgba(201,26,20,${hl})`; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(-w * 0.18, -h * 0.07, w * 0.26, h * 0.12, 0, 0, 6.283 * hl); ctx.stroke(); }
    ctx.restore();
    E.type(ctx, '1958', W - 120, 280, g - t.y58, { size: 170, align: 'right', col: '#C91A14' });
    plate(ctx, 'PATENT FILED', W - 120, 360, ss((g - t.patent) / 0.3), { size: 46, align: 'right' }); plate(ctx, 'DENMARK, 28 JAN 1958', W - 120, 430, ss((g - t.patent - 0.2) / 0.3), { size: 32, align: 'right' });
    stamp(ctx, 'NOW EVERY BRICK LOCKS', W - 420, 700, ss((g - t.locked) / 0.25), -0.1, 46);
    credit(ctx, 'US Patent 3,005,282 (filed in the US 28 Jul 1958, granted 1961) · public domain', ss((lt - 0.3) / 0.4)); } });
  // 6 · 1960: fire in the wooden-toy warehouse (night) -> morning: only bricks remain
  S.push({ t0: L.c5 - 0.25, beats: [t.rebuild - 0.2], light: 0, fn: (ctx, g, lt) => {
    if (g < t.rebuild - 0.2) { ctx.fillStyle = '#0b0d14'; ctx.fillRect(0, 0, W, H);
      const cam = camera([0, 60, 300], [0, 40, 0], 42), sc = new Scene(), burn = ss((g - t.fire + 0.3) / 1.5);
      // a shelf of wooden toys (the warehouse), consumed from the left
      for (let r = 0; r < 3; r++) { sc.box({ x: -220, y: r * 50, z: -30 }, 440, 4, 60, [90, 60, 36], { edge: 0.5 }); for (let i = 0; i < 9; i++) { const x = -200 + i * 48, id = r * 9 + i, gone = burn * 1.3 - (i / 9) * 0.9 > hash(id) * 0.3;
          if (gone) continue; sc.box({ x, y: r * 50 + 4, z: -10 }, 28, 18 + hash(id) * 14, 24, [180 - hash(id) * 40, 130, 80], { edge: 0.6 }); } }
      render(ctx, sc, cam, { fogCol: [11, 13, 20], fogNear: 200, fogFar: 900, amb: 0.25 + burn * 0.25, warm: burn * 0.4 });
      // flames: irregular tongues rising from the burning shelves + smoke
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.filter = 'blur(8px)';
      for (let i = 0; i < 26; i++) { const h = hash(i * 4.1), x = 260 + h * 1400 + Math.sin(g * 2 + i) * 14, fl = 0.6 + 0.4 * Math.sin(g * (7 + h * 7) + i * 1.7), hh = (200 + hash(i * 2.2) * 420) * fl * burn;
        const y0 = 760 - hash(i * 5.5) * 260, gr = ctx.createLinearGradient(0, y0 - hh, 0, y0); gr.addColorStop(0, 'rgba(255,60,10,0)'); gr.addColorStop(0.45, 'rgba(255,120,30,0.55)'); gr.addColorStop(1, 'rgba(255,230,150,0.75)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x - 50, y0); ctx.quadraticCurveTo(x - 60 + Math.sin(g * 5 + i) * 20, y0 - hh * 0.6, x + Math.sin(g * 4 + i) * 30, y0 - hh); ctx.quadraticCurveTo(x + 60, y0 - hh * 0.5, x + 50, y0); ctx.fill(); }
      ctx.filter = 'none'; for (let i = 0; i < 90; i++) { const h = hash(i * 3.7), ph = (g * (0.3 + h * 0.3) + h) % 1; ctx.fillStyle = `rgba(255,${160 + 80 * h | 0},70,${(1 - ph) * burn})`; ctx.fillRect(250 + hash(i * 1.3) * 1400, H - 200 - ph * 760, 3, 3); }
      ctx.restore(); ctx.save(); ctx.filter = 'blur(22px)'; for (let i = 0; i < 10; i++) { const ph = (g * 0.08 + i / 10) % 1; ctx.fillStyle = `rgba(20,18,22,${0.5 * Math.sin(ph * Math.PI) * burn})`; ctx.beginPath(); ctx.arc(300 + hash(i) * 1300 + ph * 120, 500 - ph * 500, 120 + ph * 160, 0, 6.283); ctx.fill(); } ctx.restore();
      E.type(ctx, '1960', 140, 220, g - t.two, { size: 150, align: 'left', col: '#ff9a4a' }); plate(ctx, 'THE WOODEN-TOY WAREHOUSE BURNS', 140, 320, ss((g - t.wooden) / 0.35), { size: 44 }); return; }
    // morning: the workbench, only bricks
    studio(ctx, '#f6e7cf', '#ecd6b2', '#c9a77a'); const lt2 = g - t.rebuild + 0.2, cam = camera([lerp(-40, 30, ss(lt2 / 5)), 70, 190], [0, 6, 0], 38), sc = new Scene();
    sc.box({ x: -300, y: -14, z: -100 }, 600, 14, 200, C.wood, { edge: 0.4 });
    const cols = [C.red, C.yellow, C.blue, C.white, C.red, C.green, C.black, C.yellow]; for (let i = 0; i < 8; i++) { const u = clamp((g - t.rebuild + 0.1 - i * 0.28) / 0.3); if (u <= 0) continue;
      const x = -110 + (i % 4) * 60, z = Math.floor(i / 4) * 50 - 25; brick(sc, { x, y: (1 - ease.out(u)) * 60, z, yaw: hash(i) * 0.5 }, 4, 2, cols[i], { seg: 10 }); sc.shadow(x + 16, 0, z + 8, 22, 0.3); }
    render(ctx, sc, cam, Object.assign({}, LIGHT, { warm: 0.08 }));
    plate(ctx, "LEGO DIDN'T REBUILD THE WOODEN TOYS", 140, 150, ss((lt2 - 0.1) / 0.3), { size: 46 }); plate(ctx, 'IT FOCUSED ON THE BRICKS', 140, 240, ss((g - t.focused) / 0.3), { size: 56, bg: 'rgba(201,26,20,0.92)' }); } });
  // 7 · the two ideas (two cards) -> four decades later
  S.push({ t0: L.c6 - 0.2, light: 1, fn: (ctx, g, lt) => { const late = ss((g - t.four) / 1.6);
    studio(ctx, '#efe9df', '#e3dbcd', '#c9bfae');
    // card 1: ONE SYSTEM — the same 6 bricks rebuild: house -> car -> tower
    const panel = (x0, title, a, draw) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#fffaf2'; ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16; ctx.fillRect(x0, 210, 780, 640); ctx.shadowColor = 'transparent';
      draw(x0); ctx.fillStyle = '#1e1e1e'; ctx.font = `900 46px ${E.F}`; ctx.fillText(title, x0 + 40, 280); ctx.restore(); };
    panel(140, '1 · ONE SYSTEM', ss((g - t.keep) / 0.4), x0 => { const cam = camera([0, 70, 190], [0, 14, 0], 38), sc = new Scene(), ph = Math.floor(clamp((g - t.same) / 1.0) * 3) % 3;
      const SH = [[[-16, 0, 0], [16, 0, 0], [-16, 9.6, 0], [16, 9.6, 0], [0, 19.2, 0], [0, 28.8, 0]], [[-32, 0, 0], [0, 0, 0], [32, 0, 0], [-16, 9.6, 0], [16, 9.6, 0], [0, 19.2, 0]], [[0, 0, 0], [0, 9.6, 0], [0, 19.2, 0], [0, 28.8, 0], [0, 38.4, 0], [0, 48, 0]]][ph];
      const cols = [C.red, C.blue, C.yellow, C.white, C.red, C.green]; SH.forEach(([x, y, z], i) => brick(sc, { x: x - 16, y, z: z - 8 }, 4, 2, cols[i], { seg: 10 })); sc.shadow(0, 0, 0, 40, 0.3);
      ctx.save(); ctx.beginPath(); ctx.rect(x0, 300, 780, 540); ctx.clip(); ctx.translate(x0 + 390 - W / 2, 590 - H / 2); render(ctx, sc, cam, LIGHT); ctx.restore();
      ctx.fillStyle = '#5a4a30'; ctx.font = `700 32px ${E.F}`; ctx.fillText('THE SAME PIECES, SET AFTER SET', x0 + 40, 820); });
    panel(1000, '2 · DO LESS', ss((g - t.stronger + 0.4) / 0.4), x0 => { ctx.fillStyle = '#c9b48f'; for (let i = 0; i < 6; i++) { const gone = ss((g - t.less - i * 0.08) / 0.4); ctx.globalAlpha = 1 - gone * 0.9; ctx.fillRect(x0 + 60 + i * 115, 420, 90, 90); } ctx.globalAlpha = 1;
      ctx.fillStyle = '#C91A14'; ctx.fillRect(x0 + 300, 560, 180, 90); ctx.fillStyle = '#5a4a30'; ctx.font = `700 32px ${E.F}`; ctx.fillText('STRONGER BY DOING LESS', x0 + 40, 820); });
    fade(ctx, late * 0.55, '20,20,24'); if (late > 0) { ctx.save(); ctx.globalAlpha = late; ctx.strokeStyle = '#C91A14'; ctx.lineWidth = 10; [[140, 920], [1000, 1780]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(a, 220); ctx.lineTo(a + (b - a) * ss((g - t.forget) / 0.6), 840); ctx.stroke(); }); ctx.restore(); }
    plate(ctx, 'FOUR DECADES LATER, LEGO WOULD FORGET BOTH', W / 2, 980, late, { size: 50, align: 'center', bg: 'rgba(201,26,20,0.92)' }); } });
  return S; } });
