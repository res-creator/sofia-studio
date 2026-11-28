// Build data.js: land, Africa (dissolved), Greenland, and 14 equal-area cells in Africa (k-means on the sphere).
import fs from 'fs'; import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const topo = require('topojson-client'); const d3 = require('d3-geo');
const w = JSON.parse(fs.readFileSync(new URL('../node_modules/world-atlas/countries-50m.json', import.meta.url)));
const AF = '012 024 204 072 854 108 120 140 148 180 178 262 818 226 232 231 266 270 288 324 624 384 404 426 430 434 450 454 466 478 504 508 516 562 566 646 686 694 706 710 728 729 748 834 768 788 800 732 894 716 132 174 678'.split(' ');
const geoms = w.objects.countries.geometries;
const afG = geoms.filter(g => AF.includes(g.id) || g.properties.name === 'Somaliland');
const africa = topo.merge(w, afG);
const greenland = topo.feature(w, geoms.find(g => g.id === '304')).geometry;
const land = topo.feature(w, w.objects.land);
const R = 6371.0088;
const aA = d3.geoArea(africa) * R * R, aG = d3.geoArea(greenland) * R * R;
console.log('Africa', (aA / 1e6).toFixed(2), 'M km2; Greenland', (aG / 1e6).toFixed(3), 'ratio', (aA / aG).toFixed(2));
// k-means on sphere: uniform samples inside Africa
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pts = [];
while (pts.length < 6000) {
  const lon = -20 + 75 * rnd(), z = Math.sin(-36 * Math.PI / 180) + (Math.sin(38 * Math.PI / 180) - Math.sin(-36 * Math.PI / 180)) * rnd();
  const lat = Math.asin(z) * 180 / Math.PI;
  if (d3.geoContains(africa, [lon, lat])) pts.push([lon, lat]);
}
const v = ([lo, la]) => { const a = lo * Math.PI / 180, b = la * Math.PI / 180; return [Math.cos(b) * Math.cos(a), Math.cos(b) * Math.sin(a), Math.sin(b)]; };
const ll = (p) => { const n = Math.hypot(...p); return [Math.atan2(p[1], p[0]) * 180 / Math.PI, Math.asin(p[2] / n) * 180 / Math.PI]; };
const P = pts.map(v); let C = P.filter((_, i) => i % 431 === 0).slice(0, 14);
for (let it = 0; it < 60; it++) {
  const S = C.map(() => [0, 0, 0, 0]);
  for (const p of P) { let bi = 0, bd = -2; C.forEach((c, i) => { const d = c[0] * p[0] + c[1] * p[1] + c[2] * p[2]; if (d > bd) { bd = d; bi = i; } }); const s = S[bi]; s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3]++; }
  C = S.map(s => [s[0] / s[3], s[1] / s[3], s[2] / s[3]]);
}
let cells = C.map(ll);
// make sure each centre is on land (else pull toward nearest sample)
cells = cells.map(c => d3.geoContains(africa, c) ? c : pts.reduce((b, p) => d3.geoDistance(p, c) < d3.geoDistance(b, c) ? p : b));
const gc = d3.geoCentroid(greenland);
// order: first = closest to (20,4); then sweep in reading order (north->south, west->east) for the counter
const first = cells.reduce((b, c) => d3.geoDistance(c, [22, -1]) < d3.geoDistance(b, [22, -1]) ? c : b);
const rest = cells.filter(c => c !== first).sort((a, b) => (Math.round(-a[1] / 9) - Math.round(-b[1] / 9)) || a[0] - b[0]);
cells = [first, ...rest];
console.log('greenland centroid', gc, 'cells', cells.map(c => c.map(x => x.toFixed(1)).join(',')).join(' | '));
const r = (g) => JSON.parse(JSON.stringify(g, (k, x) => typeof x === 'number' ? Math.round(x * 1000) / 1000 : x));
fs.writeFileSync(new URL('./data.js', import.meta.url), 'window.GEO=' + JSON.stringify({ land: r(land), africa: r(africa), greenland: r(greenland), gc, cells, areaAfrica: aA, areaGreenland: aG }) + ';');
