// atlaskit scenes, set 6: three reference looks for How It's Run tests.
//  B1M look      -> b1mfoot (footage/photo + thin elegant lower-third / title), handled via overlay type 'b1m'
//  Wendover look -> flatmap (flat beige/blue map, clean dark labels, moving dot along a route), wcard (clean white card)
//  J. Harris look-> papermap (paper texture map, red marker route, typewriter labels), cutouts (taped photo prints on paper), grain
const fs = require('fs'), path = require('path');
const K = require('./core');
const { W, H, C, F, clamp, lerp, seg, E, hexA, rr, text, IMG, cover, vignette, fmtNum, createCanvas } = K;
const ease = E.inOut, eout = E.out, rad = Math.PI / 180;

// ---------- geo ----------
let LAND = null, CTRY = null;
function geo() { if (LAND) return; const rd = f => { const g = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', f))); const o = [];
  for (const ft of g.features) { const gm = ft.geometry; if (!gm) continue; const ps = gm.type === 'Polygon' ? [gm.coordinates] : gm.type === 'MultiPolygon' ? gm.coordinates : []; for (const p of ps) o.push(p); } return o; };
  LAND = rd('ne_50m_land.geojson'); CTRY = rd('ne_50m_admin_0_countries.geojson'); }
// local mercator-ish projection: centre lon/lat, scale = px per degree
const projF = (lon0, lat0, s) => (lon, lat) => [W / 2 + (lon - lon0) * s * Math.cos(lat0 * rad), H / 2 - (lat - lat0) * s];
function polys(ctx, P, list, jitter) {
  ctx.beginPath();
  for (const poly of list) for (const ring of poly) { let first = true, k = 0;
    for (const [lo, la] of ring) { let [x, y] = P(lo, la); if (jitter) { x += Math.sin(k * 1.7) * jitter; y += Math.cos(k * 2.3) * jitter; } k++;
      if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y); } ctx.closePath(); }
}
const kf = (v, t) => Array.isArray(v) ? K.key(v, t) : v;

// ---------- textures ----------
let PAPER = null, GRAIN = [];
function paperTex() { if (PAPER) return PAPER; const cv = createCanvas(W, H), c = cv.getContext('2d'); c.fillStyle = '#EDE3CF'; c.fillRect(0, 0, W, H);
  const img = c.getImageData(0, 0, W, H), d = img.data; for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * 18; d[i] += n; d[i + 1] += n; d[i + 2] += n * 0.8; } c.putImageData(img, 0, 0);
  c.globalAlpha = 0.06; c.strokeStyle = '#8A7A5A'; for (let i = 0; i < 900; i++) { const x = Math.random() * W, y = Math.random() * H, a = Math.random() * 6.28, l = 10 + Math.random() * 40; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
  c.globalAlpha = 1; const g = c.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 1.0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(70,50,20,0.28)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  PAPER = cv; return cv; }
function grain(ctx, t, a = 0.07) { if (!GRAIN.length) for (let k = 0; k < 4; k++) { const cv = createCanvas(480, 270), c = cv.getContext('2d'), im = c.createImageData(480, 270);
    for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } c.putImageData(im, 0, 0); GRAIN.push(cv); }
  ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'overlay'; ctx.drawImage(GRAIN[Math.floor(t * 24) % 4], 0, 0, W, H); ctx.restore(); }

// ---------- Wendover-style flat map ----------
// p: lon,lat,s (keyframes ok), pins [{lon,lat,label,at}], routes [{pts:[[lon,lat]..], at, dur, color}], title {text, at}, mover {route idx}
function flatmap(ctx, t, d, p) {
  geo(); const P = projF(kf(p.lon, t), kf(p.lat, t), kf(p.s, t));
  ctx.fillStyle = p.water || '#BCD6E0'; ctx.fillRect(0, 0, W, H);
  polys(ctx, P, LAND); ctx.fillStyle = p.land || '#F3EBDA'; ctx.fill('evenodd');
  polys(ctx, P, CTRY); ctx.strokeStyle = 'rgba(120,105,80,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
  polys(ctx, P, LAND); ctx.strokeStyle = 'rgba(90,120,135,0.55)'; ctx.lineWidth = 2; ctx.stroke();
  for (const r of p.routes || []) drawRoute(ctx, P, r, t, { color: r.color || '#E4572E', w: 7, glow: false, dash: false });
  for (const pin of p.pins || []) { const a = eout(clamp(seg(t, pin.at || 0, (pin.at || 0) + 0.5))); if (a <= 0) continue; const [x, y] = P(pin.lon, pin.lat);
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#2B2D33'; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill(); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3; ctx.stroke();
    text(ctx, pin.label, x + (pin.dx || 22), y + (pin.dy || 10), { size: pin.size || 40, font: F.bold, color: '#2B2D33', align: pin.align || 'left' }); ctx.restore(); }
  if (p.title) wTitle(ctx, t, p.title);
  if (p.source) text(ctx, p.source, W - 40, H - 30, { size: 20, font: F.reg, align: 'right', color: 'rgba(40,40,40,0.55)' });
}
function wTitle(ctx, t, o) { const a = eout(clamp(seg(t, o.at || 0, (o.at || 0) + 0.5))); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; const w = K.measure(ctx, o.text, o.size || 54, F.bold) + 60; ctx.fillStyle = 'rgba(255,255,255,0.92)'; rr(ctx, (o.x || 80) - 30, (o.y || 140) - (o.size || 54) - 14, w, (o.size || 54) + 40, 8); ctx.fill();
  text(ctx, o.text, o.x || 80, o.y || 140, { size: o.size || 54, font: F.bold, color: '#2B2D33' }); ctx.restore(); }
// clean white card with one big number (Wendover)
function wcard(ctx, t, d, p) {
  ctx.fillStyle = p.bg || '#F3EBDA'; ctx.fillRect(0, 0, W, H);
  const u = eout(clamp(seg(t, 0.1, 0.8)));
  if (p.head) text(ctx, p.head, W / 2, 330, { size: 46, font: F.bold, align: 'center', color: hexA('#2B2D33', u) });
  if (p.big) text(ctx, p.big, W / 2, 560 + (1 - u) * 20, { size: p.bigSize || 200, font: F.head, align: 'center', color: p.color || '#E4572E', alpha: u });
  if (p.sub) { const a = eout(clamp(seg(t, 0.6, 1.2))); text(ctx, p.sub, W / 2, 680, { size: 44, font: F.bold, align: 'center', color: hexA('#2B2D33', a) }); }
  if (p.source) text(ctx, p.source, W / 2, H - 50, { size: 22, font: F.reg, align: 'center', color: 'rgba(40,40,40,0.55)' });
}
// ---------- J. Harris-style paper map ----------
function papermap(ctx, t, d, p) {
  geo(); ctx.drawImage(paperTex(), 0, 0); const P = projF(kf(p.lon, t), kf(p.lat, t), kf(p.s, t));
  polys(ctx, P, LAND, 0.6); ctx.fillStyle = 'rgba(214,196,158,0.85)'; ctx.fill('evenodd');
  ctx.save(); ctx.globalAlpha = 0.18; ctx.strokeStyle = '#5A4A30'; ctx.lineWidth = 1; for (let i = -20; i < 60; i++) { ctx.beginPath(); ctx.moveTo(i * 40, 0); ctx.lineTo(i * 40 - 400, H); ctx.stroke(); } ctx.restore(); // hatch over everything (paper print feel)
  polys(ctx, P, LAND, 0.8); ctx.strokeStyle = '#4A3B26'; ctx.lineWidth = 2.2; ctx.stroke();
  for (const r of p.routes || []) drawRoute(ctx, P, r, t, { color: '#C8302A', w: 9, rough: true });
  for (const pin of p.pins || []) { const a = eout(clamp(seg(t, pin.at || 0, (pin.at || 0) + 0.5))); if (a <= 0) continue; const [x, y] = P(pin.lon, pin.lat);
    // red marker circle drawn on
    const u = ease(clamp(seg(t, pin.at || 0, (pin.at || 0) + 0.7))); ctx.save(); ctx.strokeStyle = '#C8302A'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(x, y, 46, 38, -0.2, 0, 6.6 * u); ctx.stroke(); ctx.restore();
    stamp(ctx, pin.label, x + (pin.dx || 60), y + (pin.dy || -40), a, pin.rot || -0.03); }
  if (p.title) { const a = eout(clamp(seg(t, p.title.at || 0, (p.title.at || 0) + 0.5))); if (a > 0) typed(ctx, p.title.text, p.title.x || 120, p.title.y || 170, t - (p.title.at || 0), p.title.size || 92); }
  vignette(ctx, 0.35); grain(ctx, t, 0.08);
}
function stamp(ctx, s, x, y, a, rot) { ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot || 0); const w = K.measure(ctx, s, 34, F.monoB) + 30;
  ctx.fillStyle = 'rgba(250,245,232,0.95)'; ctx.fillRect(-12, -40, w, 54); ctx.strokeStyle = '#2E2A22'; ctx.lineWidth = 2; ctx.strokeRect(-12, -40, w, 54);
  text(ctx, s, 3, 0, { size: 34, font: F.monoB, color: '#2E2A22' }); ctx.restore(); }
// typewriter text with marker highlight behind
function typed(ctx, s, x, y, tt, size) { const n = Math.floor(clamp(tt / 0.04 / s.length) * s.length); const sub = s.slice(0, n); if (!sub) return;
  const w = K.measure(ctx, sub, size, F.monoB); ctx.save(); ctx.fillStyle = 'rgba(244,201,62,0.85)'; ctx.beginPath(); ctx.moveTo(x - 14, y + 12); ctx.lineTo(x + w + 14, y + 6); ctx.lineTo(x + w + 10, y - size * 0.78); ctx.lineTo(x - 10, y - size * 0.74); ctx.closePath(); ctx.fill(); ctx.restore();
  text(ctx, sub, x, y, { size, font: F.monoB, color: '#1F1B14' }); }
// taped photo prints sliding onto paper: p.cards [{img, x, y, w, rot, at, caption}], p.headline {text, at}
function cutouts(ctx, t, d, p) {
  ctx.drawImage(paperTex(), 0, 0);
  for (const c of p.cards || []) { const u = eout(clamp(seg(t, c.at || 0, (c.at || 0) + 0.6))); if (u <= 0) continue; const img = IMG[c.img]; const w = c.w || 760, h = w * (c.ar || 0.62);
    ctx.save(); ctx.translate(c.x + (1 - u) * (c.fromX || 0), c.y + (1 - u) * (c.fromY || 80)); ctx.rotate((c.rot || 0) + (1 - u) * 0.04); ctx.globalAlpha = Math.min(1, u * 1.5);
    ctx.shadowColor = 'rgba(40,25,5,0.45)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; ctx.fillStyle = '#FBF8F0'; ctx.fillRect(-w / 2 - 16, -h / 2 - 16, w + 32, h + 32 + (c.caption ? 50 : 0)); ctx.shadowColor = 'transparent';
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip(); const z = lerp(1.05, 1.14, ease(clamp(t / Math.max(d, 0.1)))); cover(ctx, img, z, 0.5, 0.5, [-w / 2, -h / 2, w, h]); ctx.restore();
    if (c.caption) text(ctx, c.caption, -w / 2, h / 2 + 44, { size: 26, font: F.monoB, color: '#2E2A22' });
    ctx.fillStyle = 'rgba(235,222,190,0.75)'; ctx.save(); ctx.rotate(-0.08); ctx.fillRect(-70, -h / 2 - 34, 140, 40); ctx.restore(); ctx.restore(); }
  if (p.headline) { const a = clamp(seg(t, p.headline.at || 0, (p.headline.at || 0) + 0.1)); if (a > 0) typed(ctx, p.headline.text, p.headline.x || 120, p.headline.y || 1000, t - (p.headline.at || 0), p.headline.size || 104); }
  vignette(ctx, 0.3); grain(ctx, t, 0.08);
}
function drawRoute(ctx, P, r, t, o) { const u = ease(clamp(seg(t, r.at || 0, (r.at || 0) + (r.dur || 1.5)))); if (u <= 0) return; const pts = r.pts.map(([lo, la]) => P(lo, la));
  let tot = 0; const L = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(l); tot += l; }
  let rem = tot * u, head = pts[0]; ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = o.color; ctx.lineWidth = o.w; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length && rem > 0; i++) { const f = Math.min(1, rem / L[i - 1]); const x = lerp(pts[i - 1][0], pts[i][0], f), y = lerp(pts[i - 1][1], pts[i][1], f); ctx.lineTo(x + (o.rough ? Math.sin(i * 3) * 1.5 : 0), y); head = [x, y]; rem -= L[i - 1]; }
  ctx.stroke(); ctx.fillStyle = o.color; ctx.beginPath(); ctx.arc(head[0], head[1], o.w * 1.4, 0, 7); ctx.fill(); ctx.restore();
  if (r.label && u > 0.95) text(ctx, r.label, head[0] + 20, head[1] + 50, { size: 34, font: o.rough ? F.monoB : F.bold, color: o.rough ? '#1F1B14' : '#2B2D33' }); }

// ---------- B1M-style overlay (on footage): thin location tag + clean title ----------
// overlay o = {type:'b1m', text, sub, at, mode:'tag'|'title'}
function b1m(ctx, t, o) { const a = eout(clamp(seg(t, o.at || 0, (o.at || 0) + 0.7))); if (a <= 0) return; const out = o.until ? 1 - clamp(seg(t, o.until - 0.4, o.until)) : 1; const al = a * out;
  ctx.save(); ctx.globalAlpha = al;
  if (o.mode === 'title') { const g = ctx.createLinearGradient(0, H * 0.35, 0, H * 0.75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    text(ctx, o.text, W / 2, H / 2 + 20 - (1 - a) * 12, { size: o.size || 92, font: F.bold, align: 'center', color: '#FFFFFF', ls: 6, shadow: 16 });
    if (o.sub) text(ctx, o.sub, W / 2, H / 2 + 90, { size: 34, font: F.reg, align: 'center', color: 'rgba(255,255,255,0.85)', ls: 4 });
  } else { const x = 110, y = H - 150; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y - 52, 4, 74 * a);
    text(ctx, o.text, x + 26 - (1 - a) * 16, y, { size: o.size || 46, font: F.bold, color: '#FFFFFF', ls: 3, shadow: 14 });
    if (o.sub) text(ctx, o.sub, x + 26 - (1 - a) * 16, y + 40, { size: 28, font: F.reg, color: 'rgba(255,255,255,0.85)', ls: 2, shadow: 10 }); }
  ctx.restore(); }

module.exports = { flatmap, wcard, papermap, cutouts, b1m, grain };
