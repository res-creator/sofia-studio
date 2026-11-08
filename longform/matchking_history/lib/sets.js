// Parallax sets for "The Match King". Each set(ctx, g, o) draws one full frame at time g (seconds within the shot).
// o.cam: camera keys [[t, x, y, zoom, focusDepth], …] (default: a slow push-in); o.k: Kreuger state (puppet in the scene) or null; o.flows, o.pins: map data.
const P = require('./par.js'); const K = require('./kreuger.js');
const { W, H, layer, camAt, fillShade, rect, poly, blob, sky, beams, dust, smoke, rain, flame, glow, grade, vignette, grain, hash, clamp, lerp, ss, eo, back, createCanvas } = P;
const LINE = 'rgba(27,20,16,0.5)';
function matchbox(ctx, x, y, s, rot = 0, lab = 'SÄKERHETS') { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  fillShade(ctx, rect(-60, -38, 120, 76), '#f2c230', { line: LINE, y0: -40, y1: 40 }); fillShade(ctx, rect(-60, -12, 120, 24), '#b8231b', {}); fillShade(ctx, rect(-60, -38, 120, 9), '#5a3a24', {});
  ctx.fillStyle = '#fff6dc'; ctx.font = `900 15px ${P.F}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lab, 0, 1); ctx.restore(); }
// ============ S5 · MATCH FACTORY (warm industrial light, endless conveyor) ============
function factory(ctx, g, o = {}) { const cam = camAt(g, o.cam || [[0, -120, 20, 1.0, 1.0], [12, 120, -10, 1.12, 1.0]]);
  sky(ctx, [[0, '#2a1d17'], [1, '#4a3324']]);
  layer(ctx, cam, 3.2, x => { // back wall: brick with tall arched windows
    x.fillStyle = '#5b3b2a'; x.fillRect(-600, -300, 3200, 1700); x.strokeStyle = 'rgba(30,15,10,0.25)'; x.lineWidth = 2;
    for (let y = -300; y < 1400; y += 36) { x.beginPath(); x.moveTo(-600, y); x.lineTo(2600, y); x.stroke(); for (let xx = -600 + ((y / 36) % 2) * 40; xx < 2600; xx += 80) { x.beginPath(); x.moveTo(xx, y); x.lineTo(xx, y + 36); x.stroke(); } }
    for (let i = 0; i < 7; i++) { const wx = -300 + i * 380; x.fillStyle = '#f7d79a'; x.beginPath(); x.moveTo(wx, 640); x.lineTo(wx, 200); x.arc(wx + 110, 200, 110, Math.PI, 0); x.lineTo(wx + 220, 640); x.closePath(); x.fill();
      x.strokeStyle = '#3a2418'; x.lineWidth = 10; x.stroke(); x.lineWidth = 5; for (let k = 1; k < 4; k++) { x.beginPath(); x.moveTo(wx, 200 + k * 110); x.lineTo(wx + 220, 200 + k * 110); x.stroke(); } x.beginPath(); x.moveTo(wx + 110, 90); x.lineTo(wx + 110, 640); x.stroke(); } });
  beams(ctx, 1500, 0.9); beams(ctx, 700, 0.5);
  layer(ctx, cam, 1.7, x => { // machines with turning wheels and worker silhouettes
    for (let i = 0; i < 6; i++) { const mx = -200 + i * 420; fillShade(x, rect(mx, 470, 260, 300), '#3d3f45', { line: LINE, y0: 470, y1: 780 }); fillShade(x, rect(mx + 40, 420, 180, 60), '#4a4c52', { line: LINE });
      x.save(); x.translate(mx + 200, 560); x.rotate(g * 2 + i); x.strokeStyle = '#8a7c60'; x.lineWidth = 8; x.beginPath(); x.arc(0, 0, 42, 0, 7); x.stroke(); for (let k = 0; k < 6; k++) { x.rotate(1.047); x.beginPath(); x.moveTo(0, 0); x.lineTo(42, 0); x.stroke(); } x.restore();
      x.fillStyle = 'rgba(20,14,12,0.9)'; const wy = 520 + Math.sin(g * 3 + i) * 4; x.beginPath(); x.arc(mx - 30, wy - 90, 22, 0, 7); x.fill(); x.beginPath(); x.roundRect(mx - 62, wy - 66, 64, 140, 18); x.fill(); }
    smoke(x, 400, 420, g, { col: '235,225,210', a: 0.25, s: 1.2 }); smoke(x, 1250, 420, g + 1.7, { col: '235,225,210', a: 0.25, s: 1.2 }); });
  if (o.k) layer(ctx, cam, 1.05, x => K.kreuger(x, o.kx ?? 1240, o.ky ?? 420, o.ks ?? 1.15, o.k, g), { dof: 7 });
  layer(ctx, cam, 1.0, x => { // the conveyor in focus: matchboxes slide endlessly
    fillShade(x, rect(-400, 760, 2800, 50), '#2b2a2e', { line: LINE }); fillShade(x, rect(-400, 810, 2800, 300), '#3b2a20', { y0: 800, y1: 1100 });
    for (let k = 0; k < 40; k++) { x.fillStyle = '#18171a'; x.beginPath(); x.arc(-400 + k * 70 - (g * 90) % 70, 812, 10, 0, 7); x.fill(); }
    const sp = 140; for (let k = 0; k < 24; k++) { const bx = ((k * 150 + g * sp) % 3600) - 600; matchbox(x, bx, 728, 0.7, 0); } }, { dof: 7 });
  layer(ctx, cam, 0.55, x => { // near foreground: crates of matchboxes (out of focus)
    fillShade(x, rect(-260, 860, 700, 400), '#6e4a2c', { line: LINE }); for (let i = 0; i < 5; i++) matchbox(x, -160 + i * 130, 830, 1.0, (hash(i) - 0.5) * 0.3);
    fillShade(x, rect(1600, 900, 600, 300), '#5e3f26', { line: LINE }); });
  dust(ctx, g, 70); grade(ctx, 'warm', 0.8); vignette(ctx, 0.36); grain(ctx, g); }
// ============ S6 · MAP ROOM (wood panels, a big parchment map: America ↔ Europe; pins, ribbons, coin flows) ============
let MAPC = null; const LON0 = -95, LON1 = 45, LAT0 = 20, LAT1 = 66, MW = 2600, MH = 1240;
const proj = (lon, lat) => [(lon - LON0) / (LON1 - LON0) * MW, (1 - (lat - LAT0) / (LAT1 - LAT0)) * MH];
function mapCanvas() { if (MAPC) return MAPC; const topo = require('topojson-client'), wa = require('world-atlas/countries-50m.json'), FE = topo.feature(wa, wa.objects.countries).features;
  const c = createCanvas(MW, MH), x = c.getContext('2d'); x.fillStyle = '#d9c9a3'; x.fillRect(0, 0, MW, MH);
  for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(110,80,40,${hash(i) * 0.06})`; x.fillRect(hash(i * 3) * MW, hash(i * 7) * MH, 3 + hash(i * 5) * 30, 2); }
  x.strokeStyle = 'rgba(90,70,40,0.25)'; x.lineWidth = 1.5; for (let lo = -90; lo <= 40; lo += 10) { const [a] = proj(lo, 0); x.beginPath(); x.moveTo(a, 0); x.lineTo(a, MH); x.stroke(); } for (let la = 20; la <= 66; la += 10) { const [, b] = proj(0, la); x.beginPath(); x.moveTo(0, b); x.lineTo(MW, b); x.stroke(); }
  for (const f of FE) { const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates; x.beginPath();
    for (const pl of polys) for (const ring of pl) { ring.forEach(([lo, la], i) => { const [px, py] = proj(lo, la); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.closePath(); }
    x.fillStyle = '#efe3c4'; x.fill(); x.strokeStyle = 'rgba(100,70,40,0.55)'; x.lineWidth = 1.6; x.stroke(); }
  x.fillStyle = 'rgba(70,50,30,0.6)'; x.font = `italic 700 46px ${P.SERIF}`; x.fillText('ATLANTIC OCEAN', proj(-48, 38)[0], proj(-48, 38)[1]);
  MAPC = c; return c; }
const CITY = { Stockholm: [18.07, 59.33], 'New York': [-74.0, 40.7], Boston: [-71.06, 42.36], Warsaw: [21.0, 52.23], Paris: [2.35, 48.86], Berlin: [13.4, 52.52], Athens: [23.7, 37.98], Budapest: [19.04, 47.5],
  Belgrade: [20.46, 44.8], Bucharest: [26.1, 44.43], Riga: [24.1, 56.95], Quito: [-78.5, -0.2], Ankara: [32.85, 39.93], Tallinn: [24.75, 59.44], Kaunas: [23.9, 54.9], Rome: [12.5, 41.9] };
function mapPos(name, ox, oy, sc) { const [lo, la] = CITY[name]; const [px, py] = proj(lo, Math.max(la, LAT0 + 1)); return [ox + px * sc, oy + py * sc]; }
function maproom(ctx, g, o = {}) { const cam = camAt(g, o.cam || [[0, 160, 0, 1.0, 1.25], [12, 300, -30, 1.15, 1.25]]);
  sky(ctx, [[0, '#2b1e16'], [1, '#1a120d']]);
  const ox = -90, oy = 30, sc = 0.85;   // map placement in the map layer's coordinates
  layer(ctx, cam, 1.6, x => { // wood panels
    for (let i = 0; i < 14; i++) fillShade(x, rect(-700 + i * 260, -400, 250, 1900), i % 2 ? '#4a2f1f' : '#53351f', { line: 'rgba(0,0,0,0.3)', y0: -400, y1: 1500 }); fillShade(x, rect(-700, 1060, 3600, 60), '#3a2416', {}); });
  layer(ctx, cam, 1.25, x => { x.save(); x.shadowColor = 'rgba(0,0,0,0.5)'; x.shadowBlur = 40; x.drawImage(mapCanvas(), ox, oy, MW * sc, MH * sc); x.restore();
    for (const [a, b, w, h] of [[ox - 24, oy - 24, MW * sc + 48, 24], [ox - 24, oy + MH * sc, MW * sc + 48, 24], [ox - 24, oy - 24, 24, MH * sc + 48], [ox + MW * sc, oy - 24, 24, MH * sc + 48]]) fillShade(x, rect(a, b, w, h), '#5b3a22', { line: LINE });
    // flows: [from, to, t0, dur, colour, bend]
    for (const [a, b, t0, d, col, bend] of (o.flows || [])) { const [x1, y1] = mapPos(a, ox, oy, sc), [x2, y2] = mapPos(b, ox, oy, sc), u = clamp((g - t0) / d); if (u <= 0) continue;
      const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - (bend ?? 180); x.save(); x.strokeStyle = col || '#b8231b'; x.lineWidth = 7; x.setLineDash([18, 10]); x.lineDashOffset = -g * 60; x.beginPath();
      for (let k = 0; k <= 40 * u; k++) { const q = k / 40, px = (1 - q) * (1 - q) * x1 + 2 * (1 - q) * q * mx + q * q * x2, py = (1 - q) * (1 - q) * y1 + 2 * (1 - q) * q * my + q * q * y2; k ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); x.restore();
      for (let j = 0; j < 3; j++) { const q = ((g * 0.45 + j / 3) % 1) * u, px = (1 - q) * (1 - q) * x1 + 2 * (1 - q) * q * mx + q * q * x2, py = (1 - q) * (1 - q) * y1 + 2 * (1 - q) * q * my + q * q * y2;
        x.fillStyle = '#f0b72f'; x.beginPath(); x.arc(px, py, 14, 0, 7); x.fill(); x.strokeStyle = '#8a5a10'; x.lineWidth = 3; x.stroke(); } }
    for (const [n, t0, lab, dy = 0] of (o.pins || [])) { const a = back((g - t0) / 0.4); if (a <= 0) continue; const [px, py] = mapPos(n, ox, oy, sc);
      x.save(); x.translate(px, py - (1 - a) * 60); x.fillStyle = '#b8231b'; x.beginPath(); x.arc(0, -36, 18, 0, 7); x.fill(); x.beginPath(); x.moveTo(-12, -26); x.lineTo(0, 0); x.lineTo(12, -26); x.fill(); x.fillStyle = '#ffe9c0'; x.beginPath(); x.arc(-5, -40, 5, 0, 7); x.fill(); x.restore();
      if (lab) { const right = px > 1250; P.plate(x, lab, right ? px - 26 : px + 26, py - 60 + dy, clamp((g - t0 - 0.2) / 0.3), { size: 30, bg: 'rgba(30,20,12,0.85)', align: right ? 'right' : 'left' }); } }
    if (o.matchFill) { const u = clamp(o.matchFill(g)); x.save(); x.globalAlpha = 0.35 * u; x.fillStyle = '#f2c230'; x.fillRect(ox + MW * 0.55 * sc, oy, MW * 0.45 * sc * u, MH * sc); x.restore(); } }, { dof: 6 });
  if (o.k) layer(ctx, cam, 0.85, x => K.kreuger(x, o.kx ?? 1500, o.ky ?? 420, o.ks ?? 1.4, o.k, g), { dof: 6 });
  layer(ctx, cam, 0.5, x => { // foreground desk: lamp, globe, papers
    fillShade(x, rect(-300, 930, 2600, 300), '#3d2617', { y0: 930, y1: 1200 }); fillShade(x, c => { c.beginPath(); c.arc(260, 840, 110, 0, 7); }, '#c9b07a', { line: LINE }); fillShade(x, rect(250, 950, 20, 40), '#2a1a10', {});
    fillShade(x, poly([[2700, 760], [2900, 760], [2840, 660], [2760, 660]]), '#2f6a45', { line: LINE }); fillShade(x, rect(2790, 760, 20, 200), '#222', {}); glow(x, 2800, 780, 260, '255,210,140', 0.35);
    fillShade(x, poly([[900, 980], [1240, 960], [1260, 1010], [910, 1030]]), '#efe6d2', { line: LINE }); });
  dust(ctx, g, 40); grade(ctx, 'warm', 0.6); vignette(ctx, 0.4); grain(ctx, g); }
// ============ S1 · PARIS, MARCH 1932 (grey midday: a Haussmann façade, one window on the 3rd floor; the street below) ============
function paris(ctx, g, o = {}) { const cam = camAt(g, o.cam || [[0, 0, 160, 1.0, 1.3], [10, 40, -120, 1.25, 1.3]]);
  sky(ctx, [[0, '#7d8792'], [1, '#b8bcc0']]);
  layer(ctx, cam, 6, x => { for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(235,238,240,0.55)'; blob(x, ((i * 420 + g * 12) % 2600) - 300, 140 + (i % 3) * 70, 90, i * 7, 2.6); x.fill(); } });
  layer(ctx, cam, 3.4, x => { // far roofs with chimneys
    for (let i = 0; i < 18; i++) { const bx = -400 + i * 170, by = 420 + hash(i) * 90; x.fillStyle = '#6a7079'; x.fillRect(bx, by, 160, 900); x.fillStyle = '#5a5f68'; x.beginPath(); x.moveTo(bx - 6, by); x.lineTo(bx + 80, by - 60); x.lineTo(bx + 166, by); x.fill();
      x.fillStyle = '#4d525a'; x.fillRect(bx + 30, by - 70, 18, 50); x.fillRect(bx + 110, by - 60, 18, 40); } smoke(x, 300, 360, g, { col: '200,205,210', a: 0.2 }); });
  layer(ctx, cam, 1.3, x => { // the Haussmann façade: stone, balconies, windows; the 3rd-floor window is his
    fillShade(x, rect(300, -200, 1320, 1500), '#cfc4b0', { y0: -200, y1: 1300, lo: 0.25 }); fillShade(x, poly([[280, -200], [1640, -200], [1600, -320], [320, -320]]), '#5f6670', {});
    for (let fl = 0; fl < 5; fl++) for (let w = 0; w < 6; w++) { const wx = 380 + w * 205, wy = -120 + fl * 230, his = fl === 2 && w === 3;
      fillShade(x, rect(wx, wy, 110, 170), his ? '#2c2a2a' : '#3e4652', { line: 'rgba(40,30,20,0.6)', hi: 0.3 }); x.strokeStyle = '#e8e2d4'; x.lineWidth = 6; x.strokeRect(wx, wy, 110, 170); x.beginPath(); x.moveTo(wx + 55, wy); x.lineTo(wx + 55, wy + 170); x.stroke();
      fillShade(x, rect(wx - 14, wy + 166, 138, 14), '#bdb29c', {}); x.strokeStyle = '#2a2a2e'; x.lineWidth = 3; for (let k = 0; k < 8; k++) { x.beginPath(); x.moveTo(wx - 10 + k * 18, wy + 180); x.lineTo(wx - 10 + k * 18, wy + 214); x.stroke(); } x.strokeRect(wx - 14, wy + 180, 138, 34);
      if (his) { x.fillStyle = 'rgba(240,235,225,0.25)'; x.fillRect(wx + 4, wy + 4, 48, 162); } }
    for (let fl = 0; fl < 6; fl++) fillShade(x, rect(290, -136 + fl * 230 - 22, 1340, 14), '#b9ad96', {}); x.strokeStyle = 'rgba(120,105,80,0.25)'; x.lineWidth = 2; for (let y = -200; y < 1300; y += 46) { x.beginPath(); x.moveTo(300, y); x.lineTo(1620, y); x.stroke(); } });
  layer(ctx, cam, 0.9, x => { // street: wet cobbles, a gas lamp, a 1930s police car, people with umbrellas
    fillShade(x, rect(-500, 1020, 3000, 400), '#55595f', { y0: 1020, y1: 1400 }); x.strokeStyle = 'rgba(30,30,35,0.3)'; for (let i = 0; i < 40; i++) { x.beginPath(); x.moveTo(-500 + i * 80, 1020); x.lineTo(-700 + i * 90, 1400); x.stroke(); }
    fillShade(x, rect(200, 640, 14, 400), '#26282c', {}); fillShade(x, poly([[176, 600], [238, 600], [228, 650], [186, 650]]), '#2e3136', { line: LINE }); glow(x, 207, 625, 80, '255,220,160', 0.25);
    const cx = 1100 + Math.min(0, (g - 3) * 0); fillShade(x, c => { c.beginPath(); c.roundRect(cx, 900, 360, 110, 30); }, '#1d2026', { line: LINE }); fillShade(x, c => { c.beginPath(); c.roundRect(cx + 60, 850, 200, 70, 18); }, '#24282f', { line: LINE });
    for (const wx of [cx + 70, cx + 290]) { x.fillStyle = '#0f1012'; x.beginPath(); x.arc(wx, 1010, 34, 0, 7); x.fill(); }
    for (let i = 0; i < 3; i++) { const px = 520 + i * 150 + Math.sin(g * 0.8 + i) * 10; x.fillStyle = '#1b1c20'; x.beginPath(); x.roundRect(px, 900, 44, 120, 14); x.fill(); x.beginPath(); x.arc(px + 22, 885, 18, 0, 7); x.fill();
      x.fillStyle = '#121316'; x.beginPath(); x.ellipse(px + 22, 872, 28, 6, 0, 0, 7); x.fill(); x.fillRect(px + 8, 852, 28, 20); } }, { dof: 7 });
  if (o.rain) rain(ctx, g, o.rain); grade(ctx, 'grey', 0.9); grade(ctx, 'cold', 0.7); vignette(ctx, 0.42); grain(ctx, g, 0.05);
  if (o.date !== false) P.plate(ctx, 'PARIS · 12 MARCH 1932', 120, 140, clamp((g - 0.6) / 0.4), { size: 52, bar: '#b8231b' }); }
module.exports = { factory, maproom, paris, matchbox, mapPos, CITY };
