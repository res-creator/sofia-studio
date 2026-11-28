// «Мысленный эксперимент» — «Размеры стран»: Gerard Mercator on the light table — his portrait (Frans Hogenberg), sheet 1 of 14
// of his 1569 wall map (BnF copy) and the title page of the 1595 «Atlas». Adapted from ru_geo/lemo/us_lt_hudf (Archive Light
// Table, Lemo-Opuscar demo engine). World units = texture px of the map sheet (k = 1); the portrait and the atlas page lie at
// smaller scales. One camera; three loupe landings: the dedication line «… Gerardus Mercator dedicabat» (push in), the rhumb
// lines on the sea (no push), the word ATLAS on the 1595 title page (push in); then a pull back to the whole table.
// Picture: a WebGL2 fragment shader; marks and labels on a 2D canvas above it. No text in the bottom 250 px.
import { HIT, DUR } from './timeline.js';

const W = 1920, H = 1080;
const ORANGE = '#ff5a1f', PAPER = 'rgba(250,250,247,0.97)', PAPER2 = 'rgba(250,250,247,0.72)';

// ---------------- helpers ----------------
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const ss = x => x * x * (3 - 2 * x);
const eo = x => 1 - Math.pow(1 - x, 3);
const lerp = (a, b, x) => a + (b - a) * x;
function track(keys) {                              // monotone cubic (Fritsch–Carlson), [t, v]
  const n = keys.length, d = [], m = [];
  for (let i = 0; i < n - 1; i++) d.push((keys[i + 1][1] - keys[i][1]) / (keys[i + 1][0] - keys[i][0]));
  for (let i = 0; i < n; i++) m.push(i === 0 || i === n - 1 ? 0 : (d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
  }
  return t => {
    if (t <= keys[0][0]) return keys[0][1];
    if (t >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 0; while (t > keys[i + 1][0]) i++;
    const h = keys[i + 1][0] - keys[i][0], u = (t - keys[i][0]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * keys[i][1] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * keys[i + 1][1] + (u3 - u2) * h * m[i + 1];
  };
}
const track2 = keys => { const x = track(keys.map(k => [k[0], k[1][0]])), y = track(keys.map(k => [k[0], k[1][1]])); return t => [x(t), y(t)]; };
const rot = (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [c * v[0] - s * v[1], s * v[0] + c * v[1]]; };


// ---------------- the table ----------------
const IT = {
  po: { c: [-1720, -110], r: 1.6, k: 0.55, size: [2000, 2620] },   // portrait engraving (1920×2540 scan + 40 px margin)
  mp: { c: [0, 0], r: -0.5, k: 1.0, size: [1825, 2525] },          // 1569 map, sheet 1 (scan cropped to the sheet: x 95…, y 50…)
  at: { c: [1830, 40], r: -1.1, k: 0.72, size: [2000, 3303] },     // 1595 «Atlas» title page (1920×3223 scan + 40 px margin)
};
const toW = (it, p) => { const o = rot([(p[0] - it.size[0] / 2) * it.k, (p[1] - it.size[1] / 2) * it.k], it.r * Math.PI / 180); return [it.c[0] + o[0], it.c[1] + o[1]]; };
const P = p => toW(IT.po, [p[0] + 40, p[1] + 40]);     // portrait scan px -> world
const M = p => toW(IT.mp, [p[0] - 95, p[1] - 50]);     // map scan px (archive/img/mercator_1569_map.jpg) -> world
const A = p => toW(IT.at, [p[0] + 40, p[1] + 40]);     // atlas scan px -> world
const D2R = Math.PI / 180;

// points on the scans (scan px, measured on the files)
const SIG = M([1511, 1199]);                 // the dedication line «atq; perfectum Gerardus Mercator dedicabat» (x 1267–1756)
const SIG_NAME = [[1438, 1215], [1638, 1215]];  // underline under «Gerardus Mercator»
const RH = M([300, 2488]);                   // rhumb lines on the sea below the coast (Quivira), sheet bottom-left
const ATL = A([942, 1972]);                  // the word ATLAS on the title page (x 735–1150, y 1945–2000)
const PO_NAME = [[240, 2274], [695, 2274]];  // underline under «GERARDI MERCATORIS» on the portrait's plate
const PO_FACE = [932, 706];
const MAG = 2.4;

// ---------------- camera ----------------
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const V_PO = [IT.po.c[0] + 470, -20], V_MP = [430, -170], V_RH = add(RH, [433, -233]), V_AT = [2190, 60], V_ALL = [140, 0];
const CAM = [
  // t, centre, zoom, roll (deg)
  [0.0, add(V_PO, [-12, 4]), 0.61, -0.6],
  [HIT.glide, add(V_PO, [14, 0]), 0.62, -0.4],
  [HIT.mapAt, V_MP, 0.42, 0.2],
  [HIT.push1, add(V_MP, [10, 6]), 0.425, 0.3],
  [HIT.push1End, SIG, 3.6, 0.5],
  [HIT.rise1, SIG, 3.6, 0.5],
  [HIT.lift1 + 0.15, add(V_MP, [0, -10]), 0.42, 0.1],
  [13.0, [250, 420], 0.47, -0.1],
  [HIT.drop2, V_RH, 0.6, -0.2],
  [HIT.lift2, add(V_RH, [12, 0]), 0.6, -0.2],
  [HIT.atlasAt, V_AT, 0.40, -0.5],
  [HIT.push3, add(V_AT, [8, 4]), 0.40, -0.3],
  [HIT.push3End, ATL, 3.6, 1.1],
  [HIT.rise3, ATL, 3.6, 1.1],
  [HIT.lift3 + 0.1, [1600, 40], 0.40, 0.2],
  [HIT.back, V_ALL, 0.37, 0.0],
  [DUR, add(V_ALL, [0, 4]), 0.372, 0.1],
];
const camC = track2(CAM.map(k => [k[0], k[1]]));
const camLZ = track(CAM.map(k => [k[0], Math.log(k[2])]));
const camR = track(CAM.map(k => [k[0], k[3]]));
const camAt = t => ({ c: camC(t), z: Math.exp(camLZ(t)), th: camR(t) * D2R });
function w2s(w, cam) { const d = rot([(w[0] - cam.c[0]) * cam.z, (w[1] - cam.c[1]) * cam.z], cam.th); return [W / 2 + d[0], H / 2 + d[1]]; }

// ---------------- the loupe ----------------
const phys = t => camAt(t).z * MAG;
const EP = [
  { d: HIT.drop1, l: HIT.lift1, p: SIG, rw: 330,
    push: { t0: HIT.push1, t1: HIT.push1End, r: HIT.rise1, S: 1.9, ic: add(SIG, [137, -10]) },   // ≤ 1.9 screen px per scan px
    band: { c: SIG, hw: 258, hh: 20, rot: IT.mp.r * D2R, t0: HIT.sig } },
  { d: HIT.drop2, l: HIT.lift2, p: RH, rw: 250 },
  { d: HIT.drop3, l: HIT.lift3, p: ATL, rw: 330,
    push: { t0: HIT.push3, t1: HIT.push3End, r: HIT.rise3, S: 2.6, ic: add(ATL, [92, 27]) },     // 2.6 × 0.72 ≈ 1.9 px per scan px
    band: { c: ATL, hw: 164, hh: 30, rot: IT.at.r * D2R, t0: HIT.atl } },
];
for (const e of EP) if (e.push) {
  const q = e.push;
  q.St = track([[q.t0, phys(q.t0)], [q.t1, q.S], [q.r, q.S * 1.04], [e.l, phys(e.l)]]);
  q.Ct = track2([[q.t0, e.p], [q.t1, q.ic], [q.r, q.ic], [e.l, e.p]]);
}

function shot(t) {
  const cam = camAt(t);
  const st = { cam, t, on: 0, A: 0, lift: 1, ls: [0, 0], R: 0, S: 1, ic: [0, 0], k: 0.16, ep: null, band: [0, 0, 0, 0], bandA: [0, 0] };
  const e = EP.find(e => t >= e.d - 0.4 && t <= e.l + 0.4);
  if (e) {
    const inn = seg(t, e.d - 0.4, e.d), out = seg(t, e.l, e.l + 0.4);
    st.on = 1; st.ep = e; st.A = eo(inn) * (1 - ss(out)); st.lift = 1 + 0.35 * (1 - eo(inn)) + 0.35 * eo(out);
    st.ls = w2s(e.p, cam); st.R = e.rw * cam.z * st.lift;
    const q = e.push;
    if (!q || t < q.t0 || t > e.l) { st.S = cam.z * MAG * st.lift; st.ic = e.p; }
    else { st.S = q.St(t); st.ic = q.Ct(t); }
    if (q) st.k = 0.16 * (1 - ss(seg(t, q.t0 + 0.25, q.t1 - 0.1))) + 0.16 * ss(seg(t, q.r + 0.3, e.l));
    if (e.band) {
      const b = e.band, kb = ss(seg(t, b.t0, b.t0 + 0.5)) * (1 - ss(seg(t, q.r - 0.1, q.r + 0.3)));
      st.band = [b.c[0], b.c[1], b.hw, b.hh]; st.bandA = [b.rot, kb];
    }
  }
  return st;
}
// inside the lens: world point -> screen
function int2s(w, st) { const r = rot([(w[0] - st.ic[0]) * st.S, (w[1] - st.ic[1]) * st.S], st.cam.th); return [st.ls[0] + r[0], st.ls[1] + r[1]]; }

// ---------------- WebGL ----------------
const cv = document.getElementById('gl');
const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
const ov = document.getElementById('ov').getContext('2d');
const VS = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
const FS = `#version 300 es
precision highp float;
uniform sampler2D tPo, tMp, tAt;
uniform vec4 uPo, uMp, uAt;                     // centre.xy, rotation (rad), world per texel
uniform vec2 uCam; uniform float uZ, uRot, uT, uLight;
uniform vec2 uLensC; uniform float uLensR, uLensOn, uLensA, uLift;
uniform vec2 uIntC; uniform float uS, uK;
uniform vec4 uBand; uniform vec2 uBandA;        // lit line: centre.xy, half size (world) · object rotation, strength
out vec4 o;
float h21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
vec2 rot(vec2 v, float a){ float c=cos(a), s=sin(a); return vec2(c*v.x-s*v.y, s*v.x+c*v.y); }
vec4 tg(sampler2D t, vec2 uv, float fpx){ vec2 sz = vec2(textureSize(t, 0)); vec2 f = vec2(fpx)/sz; return textureGrad(t, uv, vec2(f.x, 0.), vec2(0., f.y)); }
vec2 itemUV(vec4 it, sampler2D t, vec2 w){ vec2 sz = vec2(textureSize(t, 0)); return (rot(w - it.xy, -it.z)/it.w + sz*0.5)/sz; }
bool inside(vec2 uv){ return uv.x > 0. && uv.y > 0. && uv.x < 1. && uv.y < 1.; }
vec3 lightTable(vec2 w){
  vec2 lo = vec2(-3100., -1800.), hi = vec2(5200., 2600.);
  vec2 d = min(w - lo, hi - w); float e = min(d.x, d.y);
  vec2 cd = (w - vec2(300., 150.)) / vec2(6200., 3800.);
  float L = (1. - 0.14*dot(cd, cd)) + (vn(w*0.035) - 0.5)*0.010 + (vn(w*0.005) - 0.5)*0.012;
  vec3 lit = vec3(0.968, 0.976, 0.986)*L*uLight + vec3(0.035, 0.037, 0.04)*(1. - uLight);
  vec3 frame = vec3(0.33, 0.34, 0.35) + 0.05*vn(vec2(w.x*0.006, w.y*1.2)) - 0.14*smoothstep(0., 80., e + 80.);
  vec3 desk = vec3(0.055, 0.058, 0.062) + 0.012*vn(w*0.009);
  return e > 0. ? lit : (e > -80. ? frame : desk);
}
float speck(vec2 p, float cell, float thr){
  vec2 g = floor(p/cell), f = p/cell - g;
  if (h21(g) < thr) return 0.;
  vec2 c = vec2(.2) + .6*vec2(h21(g+3.1), h21(g+7.7)); float r = .05 + .12*h21(g+1.3);
  return smoothstep(r, r*.35, length(f - c));
}
// one print on the table: backlit paper, colour is transmission; warm glow and a cut line at the edge
void print1(inout vec3 col, vec3 L, vec4 it, sampler2D t, vec2 w, float fp){
  vec2 u = itemUV(it, t, w);
  if (!inside(u)) return;
  vec2 sz = vec2(textureSize(t, 0)), px = u*sz;
  vec3 tex = tg(t, u, fp/it.w).rgb;
  col = L * tex * 1.02 + vec3(0.02)*(1. - uLight);
  float e = min(min(px.x, px.y), min(sz.x - px.x, sz.y - px.y))*it.w;
  col += vec3(0.05, 0.035, 0.012)*exp(-e/5.)*uLight;
  col *= 1. - 0.10*smoothstep(1.5, 0., e);
}
vec3 scene(vec2 w, float fp, float inl){
  vec3 L = lightTable(w), col = L;
  print1(col, L, uPo, tPo, w, fp);
  print1(col, L, uMp, tMp, w, fp);
  print1(col, L, uAt, tAt, w, fp);
  if (inl > .5 && uBandA.y > 0.){                      // the line lights up: brighter paper, darker ink; the rest dims
    vec2 q = abs(rot(w - uBand.xy, -uBandA.x)) - uBand.zw;
    float inb = smoothstep(6., -2., max(q.x, q.y));
    vec3 lit = clamp((col - 0.55)*1.18 + 0.60, 0., 1.);
    vec3 dim = mix(col, L*0.90, 0.50);
    col = mix(col, mix(dim, lit, inb), uBandA.y);
  }
  float dd = speck(w, 30., 0.955)*0.5 + speck(w + 11., 9., 0.975)*0.35;
  col *= 1. - dd*0.35;
  return col;
}
void main(){
  vec2 s = vec2(gl_FragCoord.x, 1080. - gl_FragCoord.y);
  vec2 w = uCam + rot(s - vec2(960., 540.), -uRot) / uZ;
  vec2 dl = s - uLensC; float r = length(dl), rho = r / max(uLensR, 1.);
  vec3 table = scene(w, 1. / uZ, 0.);
  vec3 col = table;
  if (uLensOn > .5){
    vec2 sd = s - (uLensC + vec2(26., 34.)*(uLift - 1.)*uLensR/120.);
    float sr = length(sd)/uLensR;
    vec3 under = table * (1. - 0.22*(uLift - 1.)/0.35*uLensA*smoothstep(1.55, 1.05, sr));
    vec3 lc;
    if (rho < 1.0){
      vec3 c3;
      for (int i=0;i<3;i++){
        float k = uK*(1. + float(i-1)*0.10);
        vec2 q = dl / (1. + k*rho*rho) * (1. - float(i-1)*0.004*uK/0.16);
        vec2 wi = uIntC + rot(q, -uRot) / uS;
        c3[i] = scene(wi, 1. / uS, 1.)[i];
      }
      lc = c3;
      float rimw = uK/0.16;
      lc *= 1. - 0.30*smoothstep(0.78, 1.0, rho)*rimw;
      vec2 hp = dl/uLensR - vec2(-0.38, -0.46); lc += vec3(0.06)*exp(-dot(hp,hp)*7.)*rimw;
      vec2 hp2 = dl/uLensR - vec2(0.42, 0.50); lc += vec3(0.025)*exp(-dot(hp2,hp2)*14.)*rimw;
    } else if (rho < 1.065){
      float u = (rho - 1.0)/0.065; vec2 nd = dl / max(r, 1.);
      float lit = max(0., dot(nd, normalize(vec2(-0.55, -0.83))));
      float bev = exp(-pow((u - 0.18)/0.09, 2.))*0.9 + exp(-pow((u - 0.85)/0.07, 2.))*0.5;
      lc = vec3(0.040, 0.042, 0.046) + vec3(0.62, 0.64, 0.66)*pow(lit, 5.)*bev + 0.05*bev + vn(vec2(atan(dl.y, dl.x)*180., u*4.))*0.02;
    } else if (rho < 1.30){
      float u = (rho - 1.065)/0.235;
      vec2 s2 = uLensC + dl*(0.955 + 0.045*u);
      vec2 w2 = uCam + rot(s2 - vec2(960., 540.), -uRot) / uZ;
      lc = scene(w2, 1. / uZ, 0.)*0.93 + 0.035*uLight;
      lc *= 1. - 0.45*exp(-pow(u/0.05, 2.));
      lc += vec3(0.20, 0.21, 0.22)*exp(-pow((u - 0.93)/0.035, 2.))*uLight;
      lc *= 1. - 0.25*exp(-pow((u - 1.0)/0.015, 2.));
    } else {
      lc = under * (1. - (0.07*exp(-pow((rho - 1.31)/0.05, 2.)) + 0.03*exp(-pow((rho - 1.3)/0.25, 2.)))*(2. - uLift));
    }
    col = mix(under, lc, uLensA);
  }
  vec2 sv = (s - vec2(960., 540.)) / vec2(1100., 760.);
  col *= 1. - 0.10*dot(sv, sv);
  float g = h21(s + fract(uT*30.*0.6180339)*vec2(311.7, 217.3)) - 0.5;
  col += g*0.02;
  o = vec4(clamp(col, 0., 1.), 1.);
}`;
function shd(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
const prog = gl.createProgram();
gl.attachShader(prog, shd(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, shd(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
gl.useProgram(prog);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const aLoc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(aLoc); gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
const U = n => gl.getUniformLocation(prog, n);
function tex(unit, src) {
  const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const ext = gl.getExtension('EXT_texture_filter_anisotropic'); if (ext) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 8);
  return t;
}
const img = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('missing ' + src)); i.src = src; });

// ---------------- overlay ----------------
let TXT = [];                                       // text registry (id, text, box) for checks
function text(c, id, s, x, y, font, color, opt = {}) {
  c.font = font; c.fillStyle = color; c.textBaseline = 'alphabetic'; c.textAlign = opt.align || 'left';
  c.fillText(s, x, y);
  if (id && c.globalAlpha > 0.6) {
    const m = c.measureText(s), wdt = m.width, x0 = opt.align === 'right' ? x - wdt : opt.align === 'center' ? x - wdt / 2 : x;
    TXT.push({ id, text: s, x0, y0: y - m.actualBoundingBoxAscent, x1: x0 + wdt, y1: y + m.actualBoundingBoxDescent });
  }
  c.textAlign = 'left';
}
function ring(c, p, r, k, lw = 2.2, col = ORANGE) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.arc(p[0], p[1], r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); c.stroke(); }
function dot(c, p, r = 3, col = ORANGE) { c.fillStyle = col; c.beginPath(); c.arc(p[0], p[1], r, 0, Math.PI * 2); c.fill(); }
function plate(c, x, y, w, h, a = 1) { c.fillStyle = `rgba(14,15,17,${0.78 * a})`; c.beginPath(); c.roundRect(x, y, w, h, 3); c.fill(); }

// an anchored label: dot and ring on the object, a leader up (rise) and sideways (dir = +1 right, -1 left), a caption plate
function label(c, t, t0, tOut, id, a, rise, dir, lines) {
  const k = seg(t, t0, t0 + 0.45), out = seg(t, tOut, tOut + 0.3); if (k <= 0 || out >= 1) return;
  c.save(); c.globalAlpha = 1 - out;
  const pr = 9 * eo(seg(t, t0, t0 + 0.25)); ring(c, a, pr, 1, 2); dot(c, a, 3.2);
  const b = [a[0], a[1] - rise], lk = eo(seg(t, t0 + 0.08, t0 + 0.35));
  c.strokeStyle = ORANGE; c.lineWidth = 2;
  c.beginPath(); c.moveTo(a[0], a[1] - pr * Math.sign(rise || 1)); c.lineTo(a[0], lerp(a[1] - pr * Math.sign(rise || 1), b[1], lk)); c.stroke();
  const hk = eo(seg(t, t0 + 0.3, t0 + 0.45)), e = [b[0] + dir * 34 * hk, b[1]];
  if (hk > 0) { c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.stroke(); }
  const tk = eo(seg(t, t0 + 0.35, t0 + 0.8));
  if (tk > 0) {
    const pad = 18, gap = 8; let wmax = 0, hsum = 0; const sz = [];
    for (const [f, , s] of lines) { c.font = f; wmax = Math.max(wmax, c.measureText(s).width); const px = parseFloat(f.split(' ')[1]); sz.push(px); hsum += px * 1.12; }
    hsum += gap * (lines.length - 1);
    const pw = wmax + pad * 2, ph = hsum + pad * 2 - 6;
    const x0 = dir > 0 ? e[0] + 4 : e[0] - 4 - pw, y0 = b[1] - ph / 2;
    c.save(); c.beginPath(); dir > 0 ? c.rect(x0, y0 - 4, pw * tk, ph + 8) : c.rect(x0 + pw * (1 - tk), y0 - 4, pw * tk, ph + 8); c.clip();
    plate(c, x0, y0, pw, ph);
    let y = y0 + pad - 4;
    lines.forEach(([f, col, s], i) => { y += sz[i] * 0.98; text(c, tk >= 1 ? `${id}${i}` : null, s, x0 + pad, y, f, col); y += sz[i] * 0.14 + gap; });
    c.restore();
  }
  c.restore();
}
// a screen-fixed reading card: a leader from p0 (an anchor on the object) to the card's left edge, then the plate wipes in;
// body(c, x, y, k) draws the contents (k = 1 once the wipe is done)
function card(c, t, t0, tOut, x, y, w, h, p0, body) {
  const k0 = seg(t, t0, t0 + 0.4), out = seg(t, tOut, tOut + 0.35); if (k0 <= 0 || out >= 1) return;
  c.save(); c.globalAlpha = 1 - out;
  if (p0) {
    const k = eo(k0), e = [x, y + h * 0.5];
    c.strokeStyle = ORANGE; c.lineWidth = 2; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(lerp(p0[0], e[0], k), lerp(p0[1], e[1], k)); c.stroke();
    dot(c, p0, 3.2);
  }
  const ck = eo(seg(t, t0 + 0.2, t0 + 0.6));
  if (ck > 0) {
    c.save(); c.beginPath(); c.rect(x - 2, y - 4, (w + 4) * ck, h + 8); c.clip();
    plate(c, x, y, w, h); c.fillStyle = ORANGE; c.fillRect(x, y, 3, h);
    body(c, x, y, ck >= 1 ? 1 : 0);
    c.restore();
  }
  c.restore();
}
// a line inside a card that wipes in at its own time
function line(c, t, t0, id, s, x, y, font, col, live) {
  const k = eo(seg(t, t0, t0 + 0.4)); if (k <= 0) return;
  c.save(); c.font = font; const wdt = c.measureText(s).width;
  c.beginPath(); c.rect(x - 2, y - 140, (wdt + 6) * k, 180); c.clip();
  text(c, live && k >= 1 ? id : null, s, x, y, font, col); c.restore();
}

// a line drawn on (from a to b) with an eased progress k
function stroke(c, a, b, k, lw = 2.4) { if (k <= 0) return; c.strokeStyle = ORANGE; c.lineWidth = lw; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(lerp(a[0], b[0], k), lerp(a[1], b[1], k)); c.stroke(); }

function overlay(t, st) {
  const c = ov; TXT = [];
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
  const cam = st.cam;
  const sP = p => w2s(P(p), cam), sM = p => w2s(M(p), cam), sA = p => w2s(A(p), cam);

  // ---- 1. the man: «Герард Меркатор», his name underlined on the portrait's plate
  if (t < HIT.glide + 0.8) {
    const out = seg(t, HIT.glide + 0.2, HIT.glide + 0.5);
    c.save(); c.globalAlpha = 1 - out;
    stroke(c, sP(PO_NAME[0]), sP(PO_NAME[1]), eo(seg(t, HIT.nameLine, HIT.nameLine + 0.45)), 3);
    c.restore();
  }
  card(c, t, HIT.name, HIT.glide + 0.2, 1120, 250, 590, 200, sP(PO_NAME[1]), (c, x, y, live) => {
    line(c, t, HIT.name + 0.2, 'n0', 'звали того человека', x + 28, y + 52, '400 28px PS', PAPER2, live);
    line(c, t, HIT.nameLand, 'n1', 'Герард Меркатор', x + 26, y + 140, '600 60px SS', PAPER, live);
  });

  // ---- 2. the 1569 wall map: what it is, the year, where he lived
  const X = 1270;
  card(c, t, HIT.map, HIT.title - 0.3, X, 110, 590, 340, t < HIT.push1 + 0.25 ? sM([1915, 640]) : null, (c, x, y, live) => {
    line(c, t, HIT.map + 0.2, 'm0', 'большая настенная карта мира', x + 28, y + 52, '500 30px PS', PAPER, live);
    line(c, t, HIT.sheet, 'm1', 'на столе — лист 1 из 14', x + 28, y + 92, '500 22px PM', PAPER2, live);
    const kk = seg(t, HIT.year, HIT.yearLand);
    if (kk > 0) {
      const n = Math.round(lerp(1500, 1569, eo(kk)));
      text(c, live && n === 1569 ? 'm2' : null, String(n), x + 24, y + 214, '500 112px PM', ORANGE);
      line(c, t, HIT.year + 0.3, 'm3', 'год', x + 330, y + 208, '500 40px PS', PAPER, live);
    }
    line(c, t, HIT.duis, 'm4', 'уже живя в Дуйсбурге', x + 28, y + 296, '500 34px PS', PAPER, live);
  });

  // ---- 3. inside the lens on the dedication: «… Gerardus Mercator dedicabat» — his name on the map
  if (st.ep === EP[0] && t > HIT.sig - 0.1) {
    const rOut = seg(t, HIT.rise1 - 0.1, HIT.rise1 + 0.25);
    c.save(); c.globalAlpha = 1 - rOut;
    const a = int2s(M(SIG_NAME[0]), st), b = int2s(M(SIG_NAME[1]), st);
    stroke(c, a, b, eo(seg(t, HIT.sig, HIT.sig + 0.4)), 3);
    c.restore();
    const top = int2s(M([1538, 1186]), st);
    label(c, t, HIT.sigLbl, HIT.rise1 - 0.1, 'sig', top, 135, -1, [['600 46px SS', PAPER, 'Герард Меркатор']]);
  }

  // ---- 4. the long Latin title: «исправленная для пользы мореплавателей»
  card(c, t, HIT.title, HIT.lift2 + 0.1, X, 110, 600, 262, null, (c, x, y, live) => {
    line(c, t, HIT.title + 0.2, 'q0', 'в её длинном латинском названии', x + 28, y + 50, '400 28px PS', PAPER2, live);
    line(c, t, HIT.title2, 'q1', 'есть слова', x + 28, y + 90, '400 28px PS', PAPER2, live);
    line(c, t, HIT.quote, 'q2', '«исправленная для пользы', x + 26, y + 164, '500 42px PS', ORANGE, live);
    line(c, t, HIT.quote2, 'q3', 'мореплавателей»', x + 26, y + 222, '500 42px PS', ORANGE, live);
  });

  // ---- 5. the loupe on the sea's rhumb lines: not for school — for the navigator
  if (st.ep === EP[1]) {
    const ang = -0.45, p0 = [st.ls[0] + Math.cos(ang) * st.R * 1.31, st.ls[1] + Math.sin(ang) * st.R * 1.31];
    card(c, t, HIT.school, HIT.lift2 + 0.1, X, 410, 600, 172, p0, (c, x, y, live) => {
      line(c, t, HIT.school + 0.2, 'k0', 'это была карта не для школы,', x + 28, y + 52, '500 30px PS', PAPER, live);
      line(c, t, HIT.nav, 'k1', 'а для штурмана', x + 26, y + 136, '500 58px PS', ORANGE, live);
    });
  }

  // ---- 6. 1595, after his death: his work «Atlas»
  const XA = 1230;
  card(c, t, HIT.y95, HIT.rise3 + 0.1, XA, 100, 590, 290, t < HIT.push3 + 0.25 ? sA([1935, 900]) : null, (c, x, y, live) => {
    const kk = seg(t, HIT.y95 + 0.15, HIT.y95Land);
    if (kk > 0) {
      const n = Math.round(lerp(1500, 1595, eo(kk)));
      text(c, live && n === 1595 ? 'a0' : null, String(n), x + 24, y + 124, '500 112px PM', ORANGE);
      line(c, t, HIT.y95 + 0.45, 'a1', 'год', x + 330, y + 118, '500 40px PS', PAPER, live);
    }
    line(c, t, HIT.death, 'a2', 'уже после его смерти', x + 28, y + 196, '500 34px PS', PAPER, live);
    line(c, t, HIT.work, 'a3', 'вышел его труд', x + 28, y + 250, '500 34px PS', PAPER, live);
  });
  if (st.ep === EP[2] && t > HIT.atl - 0.1) {
    const rOut = seg(t, HIT.rise3 - 0.1, HIT.rise3 + 0.25);
    c.save(); c.globalAlpha = 1 - rOut;
    stroke(c, int2s(A([735, 2006]), st), int2s(A([1150, 2006]), st), eo(seg(t, HIT.atl, HIT.atl + 0.45)), 3.2);
    c.restore();
    label(c, t, HIT.atlLbl, HIT.rise3 - 0.1, 'atl', int2s(A([942, 1938]), st), 150, -1, [['600 64px SS', PAPER, '«Атлас»']]);
  }
  card(c, t, HIT.word, HIT.rise3 + 0.1, XA, 420, 590, 172, null, (c, x, y, live) => {
    line(c, t, HIT.word + 0.2, 'w0', 'так слово, знакомое каждому', x + 28, y + 52, '500 30px PS', PAPER, live);
    line(c, t, HIT.school2, 'w1', 'по школьным атласам', x + 26, y + 132, '500 46px PS', ORANGE, live);
  });

  // ---- 7. the whole table: from the word on the title page back to the man
  if (t > HIT.arc) {
    const a = sA([942, 2016]), b = sP([470, 2290]), m = w2s([0, 1000], cam);
    const k = eo(seg(t, HIT.arc, HIT.arc + 0.8));
    stroke(c, sA([735, 2016]), sA([1150, 2016]), eo(seg(t, HIT.arc - 0.3, HIT.arc)), 2.6);
    c.save(); c.strokeStyle = ORANGE; c.lineWidth = 2.2; c.setLineDash([8, 7]); c.beginPath();
    const N = 48; for (let i = 0; i <= N * k; i++) { const u = i / N, v = 1 - u;
      const p = [v * v * a[0] + 2 * u * v * m[0] + u * u * b[0], v * v * a[1] + 2 * u * v * m[1] + u * u * b[1]];
      i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }
    c.stroke(); c.restore();
    stroke(c, sP(PO_NAME[0]), sP(PO_NAME[1]), eo(seg(t, HIT.arc + 0.6, HIT.arc + 1.0)), 2.6);
  }
  card(c, t, HIT.man, 99, 545, 60, 700, 156, sP(PO_FACE), (c, x, y, live) => {
    line(c, t, HIT.man + 0.2, 'f0', 'связано с тем самым человеком,', x + 28, y + 52, '500 32px PS', PAPER, live);
    line(c, t, HIT.man2, 'f1', 'который растянул Гренландию', x + 26, y + 120, '500 42px PS', ORANGE, live);
  });
}

// ---------------- page contract ----------------
function setU(st, t) {
  const cam = st.cam;
  gl.uniform2f(U('uCam'), ...cam.c); gl.uniform1f(U('uZ'), cam.z); gl.uniform1f(U('uRot'), cam.th); gl.uniform1f(U('uT'), t);
  const fl = t < 0.17 ? 0.0 : t < 0.3 ? 0.55 : t < 0.42 ? 0.08 : t < 0.55 ? 0.8 : t < HIT.lightOn ? 0.45 : 1.0;
  gl.uniform1f(U('uLight'), fl);
  gl.uniform2f(U('uLensC'), ...st.ls); gl.uniform1f(U('uLensR'), st.R); gl.uniform1f(U('uLensOn'), st.on); gl.uniform1f(U('uLensA'), st.A); gl.uniform1f(U('uLift'), st.lift);
  gl.uniform2f(U('uIntC'), ...st.ic); gl.uniform1f(U('uS'), st.S); gl.uniform1f(U('uK'), st.k);
  gl.uniform4f(U('uBand'), ...st.band); gl.uniform2f(U('uBandA'), ...st.bandA);
}
window.DUR = DUR;
window.render = t => {
  const st = shot(t);
  gl.viewport(0, 0, W, H); setU(st, t);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  overlay(t, st);
  gl.finish();
};
window.TEXTS = t => { window.render(t); return TXT; };
async function load() {
  for (const f of ['500 20px PM', '400 20px PS', '500 20px PS', '600 20px SS']) await document.fonts.load(f, 'Ая');
  const ims = await Promise.all(['portrait', 'map1569', 'atlas1595'].map(n => img(`assets/tex/${n}.jpg`)));
  [['tPo', 'uPo', IT.po], ['tMp', 'uMp', IT.mp], ['tAt', 'uAt', IT.at]].forEach(([tn, un, it], i) => {
    tex(i, ims[i]); gl.uniform1i(U(tn), i);
    gl.uniform4f(U(un), it.c[0], it.c[1], it.r * D2R, it.k);
  });
}
load().then(() => { window.render(0); window.READY = true; });
