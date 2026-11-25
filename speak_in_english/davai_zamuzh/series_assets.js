// «Давай замуж!» series v5 — new assets in our toon v4 style (flat fills, INK outlines, one soft shade).
// make(H) -> drawing functions. H = {g: () => ctx, INK, fit(str, x, y, w, h, maxS, col, o)}
module.exports = function make(H) {
  const INK = H.INK, g = () => H.g();
  const P = () => g().beginPath();
  const fsx = (fill, lw = 7) => { const c = g(); if (fill) { c.fillStyle = fill; c.fill(); } if (lw) { c.strokeStyle = INK; c.lineWidth = lw; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); } };
  const ell = (x, y, rx, ry, fill, lw = 7, rot = 0) => { P(); g().ellipse(x, y, rx, ry, rot, 0, 7); fsx(fill, lw); };
  const rr = (x, y, w, h, r, fill, lw = 7) => { P(); g().roundRect(x, y, w, h, r); fsx(fill, lw); };
  const ln = (pts, w, col = INK) => { const c = g(); P(); pts.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); };
  const poly = (pts, fill, lw = 7) => { const c = g(); P(); pts.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.closePath(); fsx(fill, lw); };
  const save = () => g().save(), restore = () => g().restore();
  const CAT = {fur: '#f0a04a', furS: '#d9822b', belly: '#ffe6c4', nose: '#e86a8a', glass: '#17151c'};
  // fluffy blob: an ellipse with a scalloped (furry) outline
  function fluff(cx, cy, rx, ry, n, fill, lw = 7, amp = .09, rot = 0) { const c = g(); P();
    for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, r = 1 + (i % 2 ? amp : -amp * .3), x = Math.cos(a) * rx * r, y = Math.sin(a) * ry * r;
      const X = cx + x * Math.cos(rot) - y * Math.sin(rot), Y = cy + x * Math.sin(rot) + y * Math.cos(rot); if (i) c.lineTo(X, Y); else c.moveTo(X, Y); } c.closePath(); fsx(fill, lw); }
  function sunglasses(cx, cy, s, side = 0) {   // black "boss" shades; side=0 front, ±1 three-quarter
    if (side === 0) { for (const k of [-1, 1]) { P(); const c = g(); c.moveTo(cx + k * 8 * s, cy - 18 * s); c.lineTo(cx + k * 62 * s, cy - 22 * s); c.quadraticCurveTo(cx + k * 66 * s, cy + 22 * s, cx + k * 36 * s, cy + 24 * s); c.quadraticCurveTo(cx + k * 6 * s, cy + 20 * s, cx + k * 8 * s, cy - 18 * s); c.closePath(); fsx(CAT.glass, 5 * s); }
      ln([[cx - 10 * s, cy - 16 * s], [cx + 10 * s, cy - 16 * s]], 6 * s, CAT.glass); for (const k of [-1, 1]) { ln([[cx + k * 62 * s, cy - 20 * s], [cx + k * 84 * s, cy - 26 * s]], 6 * s, CAT.glass); ln([[cx + k * 46 * s, cy - 12 * s], [cx + k * 30 * s, cy + 4 * s]], 4 * s, 'rgba(255,255,255,.55)'); } }
    else { P(); const c = g(); c.moveTo(cx - 30 * s * side, cy - 20 * s); c.lineTo(cx + 34 * s * side, cy - 22 * s); c.quadraticCurveTo(cx + 38 * s * side, cy + 20 * s, cx + 10 * s * side, cy + 22 * s); c.quadraticCurveTo(cx - 26 * s * side, cy + 18 * s, cx - 30 * s * side, cy - 20 * s); c.closePath(); fsx(CAT.glass, 5 * s);
      ln([[cx - 30 * s * side, cy - 20 * s], [cx - 70 * s * side, cy - 26 * s]], 6 * s, CAT.glass); ln([[cx + 16 * s * side, cy - 12 * s], [cx + 4 * s * side, cy + 4 * s]], 4 * s, 'rgba(255,255,255,.55)'); } }
  function money(x, y, s, n = 4, rot = 0) {   // cartoon cash stack: plain green bills with a paper band (no real currency)
    save(); g().translate(x, y); g().rotate(rot); for (let k = n - 1; k >= 0; k--) { rr(-90 * s + k * 3 * s, -k * 14 * s - 50 * s, 180 * s, 50 * s, 6 * s, k ? '#7cc47a' : '#9ad898', 4 * s); }
    const top = -(n - 1) * 14 * s - 50 * s; ell(0, top + 25 * s, 22 * s, 16 * s, '#c8ecc4', 3 * s); rr(-14 * s, top - 4 * s, 28 * s, 58 * s + (n - 1) * 14 * s, 3 * s, '#f2e6c8', 3 * s); restore(); }
  function catHead(x, y, s, o = {}) {   // front head, r ~ 95
    for (const k of [-1, 1]) { poly([[x + k * 40 * s, y - 70 * s], [x + k * 92 * s, y - 132 * s], [x + k * 92 * s, y - 40 * s]], CAT.fur, 6 * s); poly([[x + k * 52 * s, y - 72 * s], [x + k * 82 * s, y - 110 * s], [x + k * 82 * s, y - 58 * s]], '#f7b8a8', 0); }
    fluff(x, y, 104 * s, 88 * s, 14, CAT.fur, 7 * s, .07); fluff(x, y + 34 * s, 62 * s, 42 * s, 7, CAT.belly, 0, .05);
    for (const k of [-1, 0, 1]) ln([[x + k * 22 * s, y - 84 * s], [x + k * 18 * s, y - 58 * s]], 6 * s, CAT.furS);
    if (o.glasses !== false) sunglasses(x, y - 14 * s, s); else for (const k of [-1, 1]) { ell(x + k * 38 * s, y - 12 * s, 18 * s, 22 * s, '#a8d860', 5 * s); ell(x + k * 38 * s, y - 12 * s, 5 * s, 16 * s, INK, 0); }
    poly([[x - 11 * s, y + 18 * s], [x + 11 * s, y + 18 * s], [x, y + 30 * s]], CAT.nose, 4 * s);
    const c = g(); P(); c.moveTo(x - 22 * s, y + 40 * s); c.quadraticCurveTo(x - 10 * s, y + 52 * s, x, y + 34 * s); c.quadraticCurveTo(x + 10 * s, y + 52 * s, x + 22 * s, y + 40 * s); c.strokeStyle = INK; c.lineWidth = 5 * s; c.stroke();
    if (o.meow) ell(x, y + 56 * s, 14 * s, 12 * s, '#8a2a3a', 4 * s);
    for (const k of [-1, 1]) for (const d of [-8, 8]) ln([[x + k * 56 * s, y + 30 * s + d * s], [x + k * 128 * s, y + 22 * s + d * 2.2 * s]], 3 * s, INK); }
  // sitting cat, front view. Height ~ 400 units * s (people are 1062): floor at y.
  function catSit(x, y, s, o = {}) {
    const c = g(); P(); c.moveTo(x + 90 * s, y - 30 * s); c.bezierCurveTo(x + 230 * s, y - 40 * s, x + 220 * s, y - 220 * s, x + 150 * s, y - 250 * s); c.strokeStyle = INK; c.lineWidth = 50 * s; c.lineCap = 'round'; c.stroke(); c.strokeStyle = CAT.fur; c.lineWidth = 36 * s; c.stroke();   // tail
    fluff(x, y - 120 * s, 120 * s, 130 * s, 12, CAT.fur, 7 * s, .06); fluff(x, y - 100 * s, 62 * s, 90 * s, 8, CAT.belly, 0, .05);
    for (const k of [-1, 1]) { ell(x + k * 48 * s, y - 16 * s, 40 * s, 26 * s, CAT.fur, 6 * s); for (const d of [-12, 0, 12]) ln([[x + k * 48 * s + d * s, y - 6 * s], [x + k * 48 * s + d * s, y - 22 * s]], 3 * s); }
    if (o.money) money(x, y - 60 * s, .8 * s, 4);
    catHead(x, y - 300 * s, s, o); }
  // walking cat, side view (facing dir), money stack in the mouth. floor at y. phase 0..1 for the leg cycle
  function catWalk(x, y, s, o = {}) { const d = o.dir || 1, ph = o.phase || 0, c = g(); save(); c.translate(x, y); c.scale(d, 1);
    P(); c.moveTo(-150 * s, -170 * s); c.bezierCurveTo(-260 * s, -200 * s, -250 * s, -380 * s, -190 * s, -400 * s); c.strokeStyle = INK; c.lineWidth = 46 * s; c.lineCap = 'round'; c.stroke(); c.strokeStyle = CAT.fur; c.lineWidth = 32 * s; c.stroke();
    const leg = (lx, a) => { const fx = lx + Math.sin(a) * 34 * s, fy = -Math.max(0, Math.cos(a)) * 18 * s; ln([[lx, -120 * s], [fx, fy - 10 * s]], 46 * s, INK); ln([[lx, -120 * s], [fx, fy - 10 * s]], 32 * s, CAT.furS); ell(fx + 8 * s, fy - 8 * s, 26 * s, 16 * s, CAT.fur, 5 * s); };
    leg(-110 * s, ph * 6.28 + 3.14); leg(90 * s, ph * 6.28);
    fluff(0, -170 * s, 175 * s, 85 * s, 14, CAT.fur, 7 * s, .06); fluff(10 * s, -132 * s, 110 * s, 36 * s, 8, CAT.belly, 0, .05); for (const k of [-60, 0, 60]) ln([[k * s, -248 * s], [k * s - 10 * s, -215 * s]], 7 * s, CAT.furS);
    leg(-80 * s, ph * 6.28); leg(120 * s, ph * 6.28 + 3.14);
    const hx = 190 * s, hy = -270 * s; poly([[hx - 40 * s, hy - 60 * s], [hx - 20 * s, hy - 130 * s], [hx + 24 * s, hy - 70 * s]], CAT.fur, 6 * s);
    fluff(hx, hy, 92 * s, 82 * s, 12, CAT.fur, 7 * s, .07); fluff(hx + 40 * s, hy + 30 * s, 50 * s, 34 * s, 6, CAT.belly, 0, .05); ell(hx + 88 * s, hy + 12 * s, 9 * s, 7 * s, CAT.nose, 3 * s);
    sunglasses(hx + 40 * s, hy - 16 * s, s, 1); for (const dd of [-6, 8]) ln([[hx + 70 * s, hy + 34 * s + dd * s], [hx + 150 * s, hy + 30 * s + dd * 2 * s]], 3 * s);
    if (o.money) money(hx + 70 * s, hy + 100 * s, .7 * s, 3, .05);
    restore(); }
  function tarotCat(x, y, s, label = 'LEO') {   // tarot card: a crowned cat
    save(); g().translate(x, y); g().rotate(.05); const w = 360 * s, h = 580 * s; rr(-w / 2, -h / 2, w, h, 24 * s, '#2a1a4a', 9 * s); rr(-w / 2 + 20 * s, -h / 2 + 20 * s, w - 40 * s, h - 40 * s, 14 * s, '#f6e8c0', 5 * s);
    for (let k = 0; k < 8; k++) { const a = k / 8 * 6.28; ln([[Math.cos(a) * 60 * s, -60 * s + Math.sin(a) * 60 * s], [Math.cos(a) * 140 * s, -60 * s + Math.sin(a) * 140 * s]], 6 * s, '#f2c820'); }
    catHead(0, -40 * s, .95 * s, {glasses: false}); poly([[-70 * s, -150 * s], [-70 * s, -215 * s], [-35 * s, -180 * s], [0, -235 * s], [35 * s, -180 * s], [70 * s, -215 * s], [70 * s, -150 * s]], '#f2c820', 6 * s);
    rr(-120 * s, 150 * s, 240 * s, 74 * s, 10 * s, '#2a1a4a', 0); H.fit(label, 0, 187 * s, 220 * s, 64 * s, 56 * s, '#f6e8c0'); restore(); }
  function ballCat(x, y, s) {   // crystal ball: the cat in shades holding cash
    const r = 300 * s; ell(x, y + r * .92, r * .8, r * .26, '#d4a82a', 9 * s); rr(x - r * .7, y + r * .88, r * 1.4, r * .34, 20 * s, '#c09020', 8 * s);
    ell(x, y, r, r, '#bfe8ff', 9 * s); save(); P(); g().ellipse(x, y, r - 6 * s, r - 6 * s, 0, 0, 7); g().clip(); ell(x, y, r * .95, r * .95, 'rgba(200,170,255,.45)', 0);
    catSit(x, y + r * .95, .78 * s, {money: true}); restore(); ell(x - r * .45, y - r * .5, r * .2, r * .12, 'rgba(255,255,255,.85)', 0, -.5);
    for (const [a, b] of [[-1.1, .9], [.9, -.8], [1.2, .6]]) { const sx = x + Math.cos(a) * r * 1.2, sy = y + Math.sin(b) * r * .9; poly([[sx, sy - 24 * s], [sx + 7 * s, sy - 7 * s], [sx + 24 * s, sy], [sx + 7 * s, sy + 7 * s], [sx, sy + 24 * s], [sx - 7 * s, sy + 7 * s], [sx - 24 * s, sy], [sx - 7 * s, sy - 7 * s]], '#fff2a0', 3 * s); } }
  function detector(x, y, s, strip = 1, label = 'НОЛЬ') {   // lie detector on the desk; y = desk top. strip 0..1 = how far the paper has come out
    rr(x - 120 * s, y - 150 * s, 240 * s, 150 * s, 16 * s, '#cfc6b8', 7 * s); rr(x - 100 * s, y - 132 * s, 120 * s, 76 * s, 10 * s, '#fffaf0', 5 * s);
    const c = g(); P(); c.arc(x - 40 * s, y - 62 * s, 46 * s, Math.PI * 1.1, Math.PI * 1.9); c.strokeStyle = INK; c.lineWidth = 4 * s; c.stroke(); ln([[x - 40 * s, y - 62 * s], [x - 70 * s, y - 104 * s]], 5 * s, '#d03030');
    ell(x + 60 * s, y - 110 * s, 14 * s, 14 * s, '#ff4060', 4 * s); ell(x + 60 * s, y - 72 * s, 14 * s, 14 * s, '#60d060', 4 * s); rr(x + 30 * s, y - 40 * s, 70 * s, 14 * s, 6 * s, '#2a2230', 0);
    if (strip > 0) { const L = 380 * s * strip; save(); g().translate(x + 66 * s, y - 34 * s); g().rotate(.55); rr(0, -26 * s, L, 52 * s, 4 * s, '#ffffff', 4 * s);
      for (let k = 0; k * 18 * s < L - 10 * s; k++) ln([[k * 18 * s + 6 * s, (k % 2 ? 14 : -14) * s], [k * 18 * s + 15 * s, (k % 2 ? -14 : 14) * s]], 2 * s, '#c0c0c0');
      if (strip > .6) { g().save(); P(); g().rect(0, -26 * s, L, 52 * s); g().clip(); H.fit(label, L - 110 * s, 0, 190 * s, 46 * s, 44 * s, '#c0283a', {pad: 2}); g().restore(); } restore(); } }
  function lipstick(x, y, s, ang = -.6) { save(); g().translate(x, y); g().rotate(ang); rr(-12 * s, 0, 24 * s, 56 * s, 4 * s, '#f2c820', 4 * s); P(); g().moveTo(-10 * s, 2 * s); g().lineTo(-10 * s, -22 * s); g().lineTo(10 * s, -34 * s); g().lineTo(10 * s, 2 * s); g().closePath(); fsx('#e0306a', 4 * s); restore(); }
  function earring(x, y, s, col = '#f2c820') { rr(x - 14 * s, y, 28 * s, 34 * s, 8 * s, col, 5 * s); }
  const curlersFx = (gg, HY) => { const cols = ['#ff8ab8', '#8ad0ff', '#ffd25a', '#ff8ab8', '#8ad0ff']; [[-130, -70], [-70, -128], [0, -146], [70, -128], [130, -70]].forEach(([dx, dy], k) => { gg.save(); gg.translate(dx, HY + dy); gg.rotate(dx / 260); P(); gg.roundRect(-30, -22, 60, 44, 14); fsx(cols[k], 5); for (const q of [-12, 0, 12]) ln([[q, -18], [q, 18]], 3, 'rgba(0,0,0,.25)'); gg.restore(); }); };
  function turban(x, y, s, rot = 0) {   // the turban held up in the hands (same look as Звездана's turbanFx), centre x,y
    save(); g().translate(x, y); g().rotate(rot); g().scale(s, s); P(); const c = g(); c.moveTo(-178, 100); c.bezierCurveTo(-210, -90, -80, -160, 0, -160); c.bezierCurveTo(80, -160, 210, -90, 178, 100); c.quadraticCurveTo(0, 30, -178, 100); c.closePath(); fsx('#7a3ad0');
    for (const [a, b, c2] of [[[-170, 60], [-40, -110], [150, -60]], [[-150, -40], [20, -20], [170, 70]]]) { P(); c.moveTo(...a); c.quadraticCurveTo(...b, ...c2); c.strokeStyle = INK; c.lineWidth = 5; c.stroke(); }
    P(); c.moveTo(0, -80); c.quadraticCurveTo(30, -190, 70, -220); c.quadraticCurveTo(40, -160, 20, -70); c.closePath(); fsx('#f2c820', 5); ell(0, -10, 26, 30, '#3ac8d8', 6); restore(); }
  function startupSlide(t) {   // full-screen: Майк's laptop turned to camera, slide «ТАКСИ ДЛЯ КОТОВ»
    const c = g(); c.fillStyle = '#5a2a6a'; c.fillRect(0, 0, 1080, 1920); for (let k = 0; k < 12; k++) { c.fillStyle = k % 2 ? '#62306f' : '#5a2a6a'; c.fillRect(k * 90, 0, 90, 1920); }
    rr(70, 520, 940, 640, 34, '#2a2a34', 10); rr(110, 560, 860, 560, 14, '#fffaf0', 6); poly([[20, 1170], [1060, 1170], [1000, 1250], [80, 1250]], '#bcbcc8', 9);
    H.fit('ТАКСИ ДЛЯ КОТОВ', 540, 640, 800, 110, 96, '#d63a8a'); H.fit('стартап · инвесторы, мяу!', 540, 730, 700, 60, 46, '#6a5a70');
    rr(300, 820, 480, 170, 40, '#ffd23f', 7); rr(390, 760, 300, 90, 30, '#ffd23f', 7); rr(420, 778, 110, 60, 12, '#bfe8ff', 5); rr(550, 778, 110, 60, 12, '#bfe8ff', 5); rr(500, 730, 80, 34, 8, '#2a2230', 0); H.fit('TAXI', 540, 747, 70, 28, 24, '#ffd23f', {pad: 1});
    catHead(475, 812, .26, {}); for (const k of [380, 700]) { ell(k, 995, 50, 50, '#2a2230', 7); ell(k, 995, 20, 20, '#cfc6b8', 4); }
    H.fit('выручка: 0', 540, 1060, 500, 60, 46, '#2a2230'); }
  function coinNews(t, u = .7) {   // full-screen cartoon chart + breaking-news bar (no real exchange, no real coin)
    const c = g(); c.fillStyle = '#10142a'; c.fillRect(0, 0, 1080, 1920); for (let k = 0; k < 8; k++) ln([[80, 560 + k * 110], [1000, 560 + k * 110]], 2, 'rgba(255,255,255,.12)');
    const pts = []; for (let i = 0; i <= 40; i++) { const x = 80 + i * 23, v = i < 24 ? 600 + 40 * Math.sin(i * .9) - i * 6 : 456 + (i - 24) ** 1.7 * 18; pts.push([x, Math.min(1380, v)]); }
    const n = Math.max(2, Math.round(pts.length * u)); ln(pts.slice(0, n), 12, '#ff4060'); const [cx, cy] = pts[n - 1];
    ell(cx, cy - 10, 70, 70, '#f2c820', 8); ell(cx, cy - 10, 50, 50, '#ffde60', 4); for (const k of [-1, 1]) { ell(cx + k * 18, cy - 22, 6, 9, INK, 0); ln([[cx + k * 18, cy - 8], [cx + k * 22, cy + 8]], 4, '#5ab4ff'); } P(); g().arc(cx, cy + 22, 16, Math.PI * 1.15, Math.PI * 1.85); g().strokeStyle = INK; g().lineWidth = 5; g().stroke();
    rr(0, 1480, 1080, 220, 0, '#c0283a', 0); rr(0, 1480, 330, 220, 0, '#ffffff', 0); H.fit('СРОЧНЫЕ НОВОСТИ', 165, 1590, 300, 160, 56, '#c0283a', {lines: 2}); H.fit('МОНЕТКА УПАЛА', 705, 1590, 700, 140, 110, '#ffffff'); }
  function paperHeadline(x, y, s, text = 'ЖЕНАТ. СОВСЕМ.') {   // Петрович's raised newspaper (front page faces us)
    save(); g().translate(x, y); g().scale(s, s); rr(-300, -220, 600, 440, 10, '#efe9d8', 8); ln([[0, -220], [0, 220]], 5); H.fit('BRIGHTON POST', -150, -180, 260, 50, 40, INK);
    rr(-280, -140, 560, 120, 6, '#ffffff', 4); H.fit(text, 0, -80, 540, 110, 90, '#c0283a');
    for (let k = 0; k < 5; k++) { ln([[-270, 10 + k * 34], [-30, 10 + k * 34]], 5, '#9a9488'); ln([[30, 10 + k * 34], [270, 10 + k * 34]], 5, '#9a9488'); } restore(); }
  function petroFront(x, y, s, o = {}) {   // reverse angle: Петрович seated, FRONT view, face hidden behind the raised paper (never shown). y = floor
    save(); g().translate(x, y); g().scale(s, s);
    for (const k of [-1, 1]) { ln([[k * 70, -470], [k * 150, -330]], 96, INK); ln([[k * 70, -470], [k * 150, -330]], 80, '#2c3f8f');   // thighs toward us
      ln([[k * 150, -330], [k * 160, -50]], 84, INK); ln([[k * 150, -330], [k * 160, -50]], 68, '#2c3f8f'); ln([[k * 136, -320], [k * 146, -60]], 8, '#f4f1ea');   // shins with track stripes
      rr(k * 160 - 60, -60, 120, 60, 26, '#3a2a30', 6); }
    rr(-180, -820, 360, 400, 70, '#2c3f8f', 8); for (const k of [-1, 1]) ln([[k * 150, -780], [k * 158, -440]], 10, '#f4f1ea');
    const up = o.up || 0, py = -980 - up * 130;
    for (const k of [-1, 1]) { ln([[k * 160, -770], [k * 270, py + 80]], 70, INK); ln([[k * 160, -770], [k * 270, py + 80]], 56, '#2c3f8f'); }   // arms up to the paper
    paperHeadline(0, py, .95, o.text || 'BRIGHTON POST'); for (const k of [-1, 1]) ell(k * 288, py + 40, 36, 44, '#e8b896', 6); restore(); }
  function rewindPlate(t) { const c = g(); c.fillStyle = 'rgba(20,10,30,.35)'; c.fillRect(0, 0, 1080, 1920); for (let y = 0; y < 1920; y += 8) { c.fillStyle = 'rgba(255,255,255,.05)'; c.fillRect(0, y, 1080, 3); }
    rr(200, 380, 680, 200, 30, '#fffaf0', 8); poly([[270, 480], [330, 430], [330, 530]], '#d63a8a', 5); poly([[330, 480], [390, 430], [390, 530]], '#d63a8a', 5); H.fit('ЧУТЬ РАНЬШЕ', 625, 480, 440, 120, 90, INK); }
  function hookBar(text) { rr(40, 40, 1000, 150, 36, '#ff4f8f', 7); H.fit(text, 540, 115, 940, 130, 70, '#ffffff', {lines: 2}); }
  function namePlate(name, role, y = 1470) { const c = g(); c.font = '56px NBL, NBC'; const s = `${name} · ${role}`; let size = 56; let w; while (true) { c.font = `${size}px NBL, NBC`; w = c.measureText(s).width; if (w < 900 || size < 30) break; size -= 2; }
    rr(40, y - 50, w + 60, 100, 30, '#ffffff', 6); c.fillStyle = '#d63a8a'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(name, 70, y + 2); const nw = c.measureText(name).width; c.fillStyle = INK; c.fillText(` · ${role}`, 70 + nw, y + 2); return [40, y - 50, 100 + w, y + 50]; }
  return {cat: {sit: catSit, walk: catWalk, head: catHead}, money, sunglasses, tarotCat, ballCat, detector, lipstick, earring, curlersFx, turban, startupSlide, coinNews, paperHeadline, petroFront, rewindPlate, hookBar, namePlate, fluff};
};
