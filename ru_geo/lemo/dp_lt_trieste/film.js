// «Мысленный эксперимент» — «Отдалённые места»: the Challenger Deep on the light table — the bathyscaphe «Trieste» over the
// Mariana Trench before the 1960 dive (US Navy photo NH 96797) and HMS Challenger (engraving, The Illustrated London News, 1872).
// Adapted from ru_geo/lemo/cs_lt_merc (Archive Light Table, Lemo-Opuscar demo engine). World units = texture px of the Trieste
// print (k = 1); the engraving lies at k = 0.95. One camera; three loupe landings: the «TRIESTE» sign on the tower (push in),
// the sea below the hull (no push), the hull of the Challenger (push in); then a pull back to the whole table.
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
  tr: { c: [0, 0], r: -0.6, k: 1.0, size: [2000, 1508] },          // Trieste photo (1920×1428 scan + 40 px margin)
  ch: { c: [2190, 60], r: 0.9, k: 0.95, size: [2000, 1396] },      // Challenger engraving (1920×1316 scan + 40 px margin)
};
const toW = (it, p) => { const o = rot([(p[0] - it.size[0] / 2) * it.k, (p[1] - it.size[1] / 2) * it.k], it.r * Math.PI / 180); return [it.c[0] + o[0], it.c[1] + o[1]]; };
const T = p => toW(IT.tr, [p[0] + 40, p[1] + 40]);     // Trieste scan px (archive/img/trieste_1960.jpg) -> world
const C = p => toW(IT.ch, [p[0] + 40, p[1] + 40]);     // Challenger scan px (archive/img/hms_challenger.jpg) -> world
const D2R = Math.PI / 180;

// points on the scans (scan px, measured on the files)
const SIGN = T([972, 692]);                  // the «TRIESTE» sign on the tower (x 952–992, y 685–700)
const SIGN_UL = [[948, 707], [996, 707]];    // underline under it
const SEA = T([560, 1030]);                  // open sea below the hull, foreground
const HULL = C([1000, 1000]);                // the hull amidships, below the funnel
const MAG = 2.4;

// ---------------- camera ----------------
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const V_TR = [516, 20], V_CH = [IT.ch.c[0] + 516, 40], V_ALL = [1100, -110];
const CAM = [
  // t, centre, zoom, roll (deg)
  [0.0, add(V_TR, [-12, 4]), 0.61, -0.6],
  [HIT.push1, add(V_TR, [8, 2]), 0.615, -0.4],
  [HIT.push1End, SIGN, 3.6, -0.3],
  [HIT.rise1, SIGN, 3.6, -0.3],
  [HIT.lift1 + 0.15, add(V_TR, [0, -10]), 0.62, -0.2],
  [HIT.lift2, add(V_TR, [14, 6]), 0.625, 0.0],
  [HIT.chAt, V_CH, 0.62, 0.4],
  [HIT.push3, add(V_CH, [10, 4]), 0.622, 0.5],
  [HIT.push3End, HULL, 3.6, 0.9],
  [HIT.rise3, HULL, 3.6, 0.9],
  [HIT.lift3 + 0.1, add(V_CH, [-260, -50]), 0.50, 0.4],
  [HIT.back, V_ALL, 0.40, 0.0],
  [DUR, add(V_ALL, [0, 4]), 0.402, 0.1],
];
const camC = track2(CAM.map(k => [k[0], k[1]]));
const camLZ = track(CAM.map(k => [k[0], Math.log(k[2])]));
const camR = track(CAM.map(k => [k[0], k[3]]));
const camAt = t => ({ c: camC(t), z: Math.exp(camLZ(t)), th: camR(t) * D2R });
function w2s(w, cam) { const d = rot([(w[0] - cam.c[0]) * cam.z, (w[1] - cam.c[1]) * cam.z], cam.th); return [W / 2 + d[0], H / 2 + d[1]]; }

// ---------------- the loupe ----------------
const phys = t => camAt(t).z * MAG;
const EP = [
  { d: HIT.drop1, l: HIT.lift1, p: SIGN, rw: 300,
    push: { t0: HIT.push1, t1: HIT.push1End, r: HIT.rise1, S: 1.9, ic: add(SIGN, [189, -21]) },   // 1.9 screen px per scan px
    band: { c: SIGN, hw: 27, hh: 11, rot: IT.tr.r * D2R, t0: HIT.sign, amt: 0.55 } },
  { d: HIT.drop2, l: HIT.lift2, p: SEA, rw: 250 },
  { d: HIT.drop3, l: HIT.lift3, p: HULL, rw: 320,
    push: { t0: HIT.push3, t1: HIT.push3End, r: HIT.rise3, S: 2.0, ic: add(HULL, [70, -40]) },    // 2.0 × 0.95 ≈ 1.9 px per scan px
    band: { c: C([1075, 1015]), hw: 480 * 0.95, hh: 80 * 0.95, rot: IT.ch.r * D2R, t0: HIT.hull, amt: 0.75 } },
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
      const b = e.band, kb = b.amt * ss(seg(t, b.t0, b.t0 + 0.5)) * (1 - ss(seg(t, q.r - 0.1, q.r + 0.3)));
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
uniform sampler2D tTr, tCh;
uniform vec4 uTr, uCh;                          // centre.xy, rotation (rad), world per texel
uniform vec2 uCam; uniform float uZ, uRot, uT, uLight;
uniform vec2 uLensC; uniform float uLensR, uLensOn, uLensA, uLift;
uniform vec2 uIntC; uniform float uS, uK;
uniform vec4 uBand; uniform vec2 uBandA;        // lit band: centre.xy, half size (world) · object rotation, strength
out vec4 o;
float h21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
vec2 rot(vec2 v, float a){ float c=cos(a), s=sin(a); return vec2(c*v.x-s*v.y, s*v.x+c*v.y); }
vec4 tg(sampler2D t, vec2 uv, float fpx){ vec2 sz = vec2(textureSize(t, 0)); vec2 f = vec2(fpx)/sz; return textureGrad(t, uv, vec2(f.x, 0.), vec2(0., f.y)); }
vec2 itemUV(vec4 it, sampler2D t, vec2 w){ vec2 sz = vec2(textureSize(t, 0)); return (rot(w - it.xy, -it.z)/it.w + sz*0.5)/sz; }
bool inside(vec2 uv){ return uv.x > 0. && uv.y > 0. && uv.x < 1. && uv.y < 1.; }
vec3 lightTable(vec2 w){
  vec2 lo = vec2(-2700., -1750.), hi = vec2(4900., 1950.);
  vec2 d = min(w - lo, hi - w); float e = min(d.x, d.y);
  vec2 cd = (w - vec2(1100., 0.)) / vec2(5600., 3400.);
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
  print1(col, L, uTr, tTr, w, fp);
  print1(col, L, uCh, tCh, w, fp);
  if (inl > .5 && uBandA.y > 0.){                      // the band lights up: brighter paper, darker ink; the rest dims
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
// a card height that grows as its lines arrive: steps [[t, h], ...] eased over 0.35 s each
const grow = (t, steps) => steps.reduce((h, [t0, h1], i) => i ? lerp(h, h1, ss(seg(t, t0 - 0.1, t0 + 0.25))) : h1, 0);
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
  const sT = p => w2s(T(p), cam), sC = p => w2s(C(p), cam);

  // ---- 1. people have been down there: 1960 · 2012 · 2019 · and later — only a handful
  const X = 1270;
  card(c, t, HIT.people, HIT.lift2 + 0.1, X, 110, 590, grow(t, [[0, 84], [HIT.y60, 190], [HIT.y12, 288], [HIT.y19, 386], [HIT.few, 510]]), t < HIT.push1 + 0.25 ? sT([1560, 770]) : null, (c, x, y, live) => {
    line(c, t, HIT.people + 0.2, 'p0', 'люди там бывали:', x + 28, y + 52, '400 30px PS', PAPER2, live);
    const kk = seg(t, HIT.y60, HIT.y60Land);
    if (kk > 0) {
      const n = Math.round(lerp(1900, 1960, eo(kk)));
      text(c, live && n === 1960 ? 'p1' : null, String(n), x + 24, y + 158, '500 96px PM', ORANGE);
    }
    line(c, t, HIT.y12, 'p2', '2012', x + 24, y + 256, '500 96px PM', ORANGE, live);
    line(c, t, HIT.y19, 'p3', '2019', x + 24, y + 354, '500 96px PM', ORANGE, live);
    line(c, t, HIT.later, 'p4', 'и позже', x + 300, y + 346, '500 36px PS', PAPER, live);
    line(c, t, HIT.few, 'p5', 'но спускались', x + 28, y + 424, '400 30px PS', PAPER2, live);
    line(c, t, HIT.few2, 'p6', 'считаные единицы', x + 26, y + 482, '500 46px PS', ORANGE, live);
  });

  // ---- 2. inside the lens on the tower: the «TRIESTE» sign
  if (st.ep === EP[0] && t > HIT.sign - 0.1) {
    const rOut = seg(t, HIT.rise1 - 0.1, HIT.rise1 + 0.25);
    c.save(); c.globalAlpha = 1 - rOut;
    stroke(c, int2s(T(SIGN_UL[0]), st), int2s(T(SIGN_UL[1]), st), eo(seg(t, HIT.sign, HIT.sign + 0.4)), 3);
    c.restore();
    label(c, t, HIT.signLbl, HIT.rise1 - 0.1, 'tr', int2s(T([972, 662]), st), 150, -1, [['600 46px SS', PAPER, 'батискаф «Триест»']]);
  }

  // ---- 3. the name: after the British ship «Challenger»
  const XB = 1230;
  card(c, t, HIT.name, 21.5, XB, 100, 600, grow(t, [[0, 80], [HIT.name2, 150]]), t < HIT.push3 + 0.25 ? sC([1560, 640]) : null, (c, x, y, live) => {
    line(c, t, HIT.name + 0.2, 'b0', 'название впадине дали', x + 28, y + 52, '400 30px PS', PAPER2, live);
    line(c, t, HIT.name2, 'b1', 'по британскому кораблю', x + 28, y + 112, '500 40px PS', PAPER, live);
  });
  if (st.ep === EP[2] && t > HIT.hull - 0.1) {
    const rOut = seg(t, HIT.rise3 - 0.1, HIT.rise3 + 0.25);
    c.save(); c.globalAlpha = 1 - rOut;
    stroke(c, int2s(C([600, 1092]), st), int2s(C([1530, 1080]), st), eo(seg(t, HIT.hull, HIT.hull + 0.6)), 3);
    c.restore();
    label(c, t, HIT.ship, HIT.rise3 - 0.1, 'ch', int2s(C([985, 945]), st), 170, -1, [['600 46px SS', PAPER, 'корабль «Челленджер»']]);
  }
  // ---- 4. its crew first measured the depth here — in 1875
  card(c, t, HIT.crew, 21.5, XB, 290, 600, grow(t, [[0, 78], [HIT.crew2, 128], [HIT.y75, 280]]), null, (c, x, y, live) => {
    line(c, t, HIT.crew + 0.2, 'c0', 'его экипаж впервые', x + 28, y + 52, '500 32px PS', PAPER, live);
    line(c, t, HIT.crew2, 'c1', 'измерил здесь глубину', x + 28, y + 100, '500 32px PS', PAPER, live);
    const kk = seg(t, HIT.y75, HIT.y75Land);
    if (kk > 0) {
      const n = Math.round(lerp(1800, 1875, eo(kk)));
      text(c, live && n === 1875 ? 'c2' : null, String(n), x + 24, y + 232, '500 112px PM', ORANGE);
      line(c, t, HIT.y75 + 0.3, 'c3', 'год', x + 330, y + 226, '500 40px PS', PAPER, live);
    }
  });

  // ---- 5. the whole table: down and up equally empty, only differently
  card(c, t, HIT.up, 99, 90, 56, 720, grow(t, [[0, 84], [HIT.up2, 160]]), null, (c, x, y, live) => {
    line(c, t, HIT.up + 0.2, 'u0', 'вниз и вверх одинаково безлюдно,', x + 28, y + 54, '500 34px PS', PAPER, live);
    line(c, t, HIT.up2, 'u1', 'только по-разному', x + 26, y + 124, '500 48px PS', ORANGE, live);
  });
  if (t > HIT.tags - 0.1) {
    label(c, t, HIT.tags, 99, 'it', sT([972, 650]), 120, 1, [['500 28px PS', PAPER, 'батискаф «Триест»'], ['500 30px PM', ORANGE, '1960']]);
    label(c, t, HIT.tags + 0.25, 99, 'ic', sC([1000, 860]), 150, 1, [['500 28px PS', PAPER, 'корабль «Челленджер»'], ['500 30px PM', ORANGE, '1875']]);
  }
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
  const ims = await Promise.all(['trieste', 'challenger'].map(n => img(`assets/tex/${n}.jpg`)));
  [['tTr', 'uTr', IT.tr], ['tCh', 'uCh', IT.ch]].forEach(([tn, un, it], i) => {
    tex(i, ims[i]); gl.uniform1i(U(tn), i);
    gl.uniform4f(U(un), it.c[0], it.c[1], it.r * D2R, it.k);
  });
}
load().then(() => { window.render(0); window.READY = true; });
