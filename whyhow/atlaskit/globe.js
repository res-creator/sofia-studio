// Orthographic globe from Natural Earth (public domain). globe(ctx, t, d, p): p.lon/p.lat/p.R keyframes, pins, arctic circle, graticule.
const fs = require('fs'), path = require('path');
const K = require('./core');
const { W, H, C, F, key, text, chip, hexA, clamp, seg, E } = K;
const D = path.join(__dirname, 'data');
const rad = Math.PI / 180;
function loadPolys(file) {
  const g = JSON.parse(fs.readFileSync(path.join(D, file))); const out = [];
  for (const f of g.features) { const gm = f.geometry; if (!gm) continue;
    const polys = gm.type === 'Polygon' ? [gm.coordinates] : gm.type === 'MultiPolygon' ? gm.coordinates : [];
    for (const p of polys) out.push(p.map(r => r.map(([x, y]) => [x * rad, y * rad]))); }
  return out;
}
let LAND = null, LAND110 = null, CTRY = null, LAKES = null;
function data() { if (!LAND) { LAND = loadPolys('ne_50m_land.geojson'); LAND110 = loadPolys('ne_110m_land.geojson'); CTRY = loadPolys('ne_50m_admin_0_countries.geojson'); LAKES = loadPolys('ne_50m_lakes.geojson'); } }
function proj(lon0, lat0, R, cx, cy) {
  const s0 = Math.sin(lat0), c0 = Math.cos(lat0);
  return (lon, lat) => { const cl = Math.cos(lat), dl = lon - lon0, cd = Math.cos(dl);
    const cosc = s0 * Math.sin(lat) + c0 * cl * cd; const x = R * cl * Math.sin(dl), y = R * (c0 * Math.sin(lat) - s0 * cl * cd);
    if (cosc < 0) { const n = Math.hypot(x, y) || 1; return [cx + x / n * R, cy - y / n * R, false]; }
    return [cx + x, cy - y, true]; };
}
function drawPolys(ctx, P, polys, fill, stroke, lw, minVisible) {
  ctx.beginPath();
  for (const poly of polys) for (const ring of poly) {
    let vis = 0; const pts = ring.map(([lo, la]) => { const q = P(lo, la); if (q[2]) vis++; return q; });
    if (vis < (minVisible || 1)) continue;
    ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath();
  }
  if (fill) { ctx.fillStyle = fill; ctx.fill('evenodd'); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
}
function line(ctx, P, pts) { ctx.beginPath(); let pen = false; for (const [lo, la] of pts) { const q = P(lo * rad, la * rad); if (!q[2]) { pen = false; continue; } if (!pen) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]); pen = true; } ctx.stroke(); }
function globe(ctx, t, d, p) {
  data(); const lon0 = key(p.lon, t) * rad, lat0 = key(p.lat, t) * rad, R = key(p.R, t); const cx = W / 2 + (p.dx ? key(p.dx, t) : 0), cy = H / 2 + (p.dy ? key(p.dy, t) : 0);
  const P = proj(lon0, lat0, R, cx, cy);
  // space bg
  ctx.fillStyle = '#060B16'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 160; i++) { ctx.fillStyle = `rgba(255,255,255,${0.15 + K.hash(i) * 0.5})`; ctx.fillRect(K.hash(i + 1) * W, K.hash(i + 2) * H, 1.6, 1.6); }
  // atmosphere glow + ocean
  const g = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.12); g.addColorStop(0, hexA(C.ice, 0.35)); g.addColorStop(1, hexA(C.ice, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.12, 0, 7); ctx.fill();
  const og = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R); og.addColorStop(0, '#173058'); og.addColorStop(1, '#0A1730');
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = og; ctx.fill(); ctx.clip();
  // graticule
  ctx.strokeStyle = hexA(C.iceL, 0.13); ctx.lineWidth = 1;
  for (let la = -80; la <= 80; la += 10) line(ctx, P, Array.from({ length: 181 }, (_, i) => [-180 + i * 2, la]));
  for (let lo = -180; lo < 180; lo += 15) line(ctx, P, Array.from({ length: 91 }, (_, i) => [lo, -90 + i * 2]));
  const land = R < 900 ? LAND110 : LAND;
  drawPolys(ctx, P, land, C.land, null, 0, 2);
  if (R > 700) drawPolys(ctx, P, LAKES, '#122648', null, 0, 2);
  if (p.borders !== false && R > 500) drawPolys(ctx, P, CTRY, null, hexA(C.border, 0.6), R > 3000 ? 1.6 : 1, 2);
  // highlight a country (by drawing its outline brighter) — p.hl = polygon index list not needed; Russia highlight via bbox filter
  if (p.arctic) { const a = clamp(key(p.arctic, t)); if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([14, 10]); ctx.strokeStyle = C.iceL; ctx.lineWidth = 3;
    line(ctx, P, Array.from({ length: 361 }, (_, i) => [-180 + i, 66.56])); ctx.setLineDash([]); ctx.restore(); } }
  // shading of the sphere
  const sh = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.2, cx, cy, R * 1.02); sh.addColorStop(0, 'rgba(255,255,255,0.06)'); sh.addColorStop(0.7, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = sh; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R); ctx.restore();
  if (p.arctic && p.arcticLabel) { const a = clamp(key(p.arctic, t)); const q = P(p.arcticLabel[0] * rad, 66.56 * rad); if (q[2] && a > 0) text(ctx, 'ARCTIC CIRCLE', q[0] + 10, q[1] - 12, { size: 24, font: F.monoB, color: C.iceL, alpha: a, shadow: 8 }); }
  // pins
  for (const pin of p.pins || []) { const a = clamp(seg(t, pin.at || 0, (pin.at || 0) + 0.6)); if (a <= 0) continue; const q = P(pin.lon * rad, pin.lat * rad); if (!q[2]) continue;
    const pulse = (t * 0.8) % 1; ctx.save(); ctx.strokeStyle = hexA(pin.color || C.yellow, (1 - pulse) * a); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(q[0], q[1], 10 + pulse * 40, 0, 7); ctx.stroke();
    ctx.fillStyle = pin.color || C.yellow; ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(q[0], q[1], pin.small ? 7 : 11, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.navy; ctx.stroke(); ctx.restore();
    if (pin.label) { const lx = q[0] + (pin.lx || 26), ly = q[1] + (pin.ly || -18); const s = E.back(clamp(seg(t, pin.at || 0, (pin.at || 0) + 0.5)));
      ctx.save(); ctx.translate(lx, ly); ctx.scale(s, s); chip(ctx, pin.label, 0, 0, { size: pin.size || 46, align: pin.align }); if (pin.sub) text(ctx, pin.sub, pin.align === 'right' ? -8 : 8, 46, { size: 22, font: F.monoB, color: C.cream, shadow: 8, align: pin.align === 'right' ? 'right' : 'left' }); ctx.restore(); } }
  // optional distance bracket between two lat lines along a meridian
  if (p.bracket) { const b = p.bracket, a = clamp(seg(t, b.at, b.at + 0.8)); if (a > 0) { const q0 = P(b.lon * rad, b.lat0 * rad), q1 = P(b.lon * rad, (b.lat0 + (b.lat1 - b.lat0) * a) * rad);
    ctx.save(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]); ctx.stroke(); ctx.restore();
    if (a >= 1) text(ctx, b.label, (q0[0] + q1[0]) / 2 + 22, (q0[1] + q1[1]) / 2 + 10, { size: 34, font: F.head, color: C.yellow, shadow: 10, alpha: clamp(seg(t, b.at + 0.8, b.at + 1.2)) }); } }
}
module.exports = { globe };
