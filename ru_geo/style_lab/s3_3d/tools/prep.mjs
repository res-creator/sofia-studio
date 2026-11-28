// Geodata for the clip: Natural Earth 1:50m (world-atlas@2 countries-50m, public domain) → data/geo.json
// Three groups dissolved with topojson.merge (shared borders removed): Africa (continent incl. Madagascar), Greenland, the rest
// (no Antarctica). Rings stay in lon/lat; simplified (Douglas–Peucker) in Mercator map units (map width 36) so the page
// can reproject Greenland every frame. Prints spherical areas as a check (Africa ≈ 30.3 M km², Greenland ≈ 2.17 M km²).
// usage: node tools/prep.mjs   (from the s3_3d folder)
import fs from 'fs'; import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const topo = require('topojson-client'); const T = require('world-atlas/countries-50m.json');
const AF = ['Zimbabwe', 'Zambia', 'Uganda', 'Tunisia', 'Togo', 'Tanzania', 'eSwatini', 'S. Sudan', 'Sudan', 'South Africa', 'Somalia', 'Somaliland',
  'Sierra Leone', 'Senegal', 'Rwanda', 'Nigeria', 'Niger', 'Namibia', 'Mozambique', 'Morocco', 'W. Sahara', 'Mauritania', 'Mali', 'Malawi',
  'Madagascar', 'Libya', 'Liberia', 'Lesotho', 'Kenya', 'Guinea-Bissau', 'Guinea', 'Ghana', 'Gambia', 'Gabon', 'Ethiopia', 'Eritrea', 'Eq. Guinea',
  'Egypt', 'Djibouti', "Côte d'Ivoire", 'Dem. Rep. Congo', 'Congo', 'Chad', 'Central African Rep.', 'Cameroon', 'Burundi', 'Burkina Faso',
  'Botswana', 'Benin', 'Angola', 'Algeria'];
const SKIP = ['Antarctica', 'Fr. S. Antarctic Lands', 'S. Geo. and the Is.', 'Heard I. and McDonald Is.', 'Greenland'];
const G = T.objects.countries.geometries;
const merge = f => topo.merge(T, G.filter(f));
const K = 36 / (2 * Math.PI), D = Math.PI / 180;
const mx = p => [p[0] * D * K, Math.log(Math.tan(Math.PI / 4 + Math.max(-85, Math.min(85, p[1])) * D / 2)) * K];
function dp(P, eps) {   // on lon/lat points, distance measured in Mercator units
  if (P.length < 4) return P;
  const M = P.map(mx), keep = new Uint8Array(P.length); keep[0] = keep[P.length - 1] = 1;
  let f = 0, fd = -1; for (let i = 1; i < P.length; i++) { const d = Math.hypot(M[i][0] - M[0][0], M[i][1] - M[0][1]); if (d > fd) { fd = d; f = i; } }
  keep[f] = 1; const st = [[0, f], [f, P.length - 1]];   // closed ring: split at the point farthest from the start
  while (st.length) {
    const [a, b] = st.pop(); let dm = 0, im = -1;
    const [ax, ay] = M[a], [bx, by] = M[b], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1e-9;
    for (let i = a + 1; i < b; i++) { const d = Math.abs((M[i][0] - ax) * dy - (M[i][1] - ay) * dx) / L; if (d > dm) { dm = d; im = i; } }
    if (dm > eps) { keep[im] = 1; st.push([a, im], [im, b]); }
  }
  return P.filter((_, i) => keep[i]);
}
const marea = R => { const M = R.map(mx); let s = 0; for (let i = 0; i < M.length - 1; i++) s += M[i][0] * M[i + 1][1] - M[i + 1][0] * M[i][1]; return Math.abs(s) / 2; };
// spherical polygon area (km²), ring in lon/lat (d3-style formula, exact for small edges)
function sarea(R) {
  let s = 0; const r = 6371.0088;
  for (let i = 0; i < R.length - 1; i++) { const [l1, p1] = R[i], [l2, p2] = R[i + 1]; s += (l2 - l1) * D * (2 + Math.sin(p1 * D) + Math.sin(p2 * D)); }
  return Math.abs(s) * r * r / 2;
}
// a ring that crosses the antimeridian (Chukotka, Wrangel): unwrap to lon > 180, then cut into the part west of 180°
// and the part east of it (shifted by −360), Sutherland–Hodgman against the line lon = 180
function clipHalf(R, keepWest) {
  const ins = p => keepWest ? p[0] <= 180 : p[0] >= 180, out = [];
  for (let i = 0; i < R.length - 1; i++) {
    const a = R[i], b = R[i + 1], ia = ins(a), ib = ins(b);
    if (ia) out.push(a);
    if (ia !== ib) { const t = (180 - a[0]) / (b[0] - a[0]); out.push([180, a[1] + t * (b[1] - a[1])]); }
  }
  if (out.length) out.push(out[0]);
  return out;
}
function splitDateline(polys) {
  const res = [];
  for (const poly of polys) {
    const outer = poly[0];
    let j = false; for (let k = 1; k < outer.length; k++) if (Math.abs(outer[k][0] - outer[k - 1][0]) > 180) j = true;
    if (!j) { res.push(poly); continue; }
    const U = outer.map(p => p[0] < -100 ? [p[0] + 360, p[1]] : p);
    const w = clipHalf(U, true), e = clipHalf(U, false).map(p => [p[0] - 360, p[1]]);
    if (w.length > 3) res.push([w, ...poly.slice(1)]);
    if (e.length > 3) res.push([e]);
  }
  return res;
}
function group(geom, eps, minA) {
  const out = []; let A = 0;
  for (const poly of splitDateline(geom.coordinates)) {
    A += sarea(poly[0]) - poly.slice(1).reduce((s, h) => s + sarea(h), 0);
    if (marea(poly[0]) < minA) continue;
    const rings = poly.map(r => dp(r, eps)).filter((r, i) => r.length >= 4 && (i === 0 || marea(r) > minA * 2));
    if (rings.length) out.push(rings.map(r => r.map(p => [+p[0].toFixed(3), +p[1].toFixed(3)])));
  }
  return { polys: out, area: A };
}

const af = group(merge(g => AF.includes(g.properties.name)), .008, .004);
const gl = group(merge(g => g.properties.name === 'Greenland'), .008, .003);
const rest = group(merge(g => !AF.includes(g.properties.name) && !SKIP.includes(g.properties.name)), .022, .012);
const n = g => g.polys.reduce((s, p) => s + p.reduce((t, r) => t + r.length, 0), 0);
console.log(`Africa ${(af.area / 1e6).toFixed(2)} M km² (${af.polys.length} polys, ${n(af)} pts); Greenland ${(gl.area / 1e6).toFixed(3)} M km² (${gl.polys.length}, ${n(gl)}); ` +
  `rest ${rest.polys.length} polys ${n(rest)} pts; ratio ${(af.area / gl.area).toFixed(2)}`);
fs.mkdirSync('data', { recursive: true });
// a calm outline of Greenland's main island for the dashed footprint (fjords smoothed away)
const glMain = merge(g => g.properties.name === 'Greenland').coordinates.map(p => p[0]).sort((a, b) => marea(b) - marea(a))[0];
const outline = dp(glMain, .09).map(p => [+p[0].toFixed(3), +p[1].toFixed(3)]);
fs.writeFileSync('data/geo.json', JSON.stringify({ greenlandOutline: outline, africa: af.polys, greenland: gl.polys, rest: rest.polys, areaAfrica: af.area, areaGreenland: gl.area }));
