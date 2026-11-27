// «Мысленный эксперимент» — «Размер Вселенной»: the Hubble Ultra Deep Field on the light table, Webb's first deep field beside it.
// Adapted from ru_geo/lemo/bh_otis (Archive Light Table, Lemo-Opuscar demo engine). World units = texture px of the HUDF print
// (NASA/ESA, 2300 px on a 40 px paper margin). One camera; a moon-vs-patch diagram on the table; one loupe that slides from galaxy
// to galaxy, pushes in onto the faintest red dots, rises; then rings on dot after dot; a glide to the Webb print.
// Picture: a WebGL2 fragment shader; marks and labels on a 2D canvas above it.
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
  pr: { c: [0, 0], r: -0.9, k: 1, size: [2380, 2180] },        // HUDF print (2300×2100 image + 40 px margin)
  wb: { c: [4250, 140], r: 1.6, k: 1, size: [1961, 2000] },    // Webb's first deep field (1881×1920 + margin), off frame at first
};
const toW = (it, p) => { const o = rot([(p[0] - it.size[0] / 2) * it.k, (p[1] - it.size[1] / 2) * it.k], it.r * Math.PI / 180); return [it.c[0] + o[0], it.c[1] + o[1]]; };
const O = p => toW(IT.pr, [p[0] + 40, p[1] + 40]);                    // HUDF image px -> world
const OW = p => toW(IT.wb, [p[0] + 40, p[1] + 40]);                   // Webb image px -> world

// points on the HUDF image (image px, measured on the file)
const STOP_A = [1080, 1010], STOP_B = [256, 990], STOP_C = [430, 330];  // loupe stops: an edge-on pair, a face-on spiral, the faint field
const FAR = [[340, 309], [466, 312], [507, 298]];                       // three of the faintest, reddest compact dots in that field
const FAR_C = [560, 340];                                               // lens centre for them (they sit left of centre, the card right)
const DOTS = [[1705, 1143], [312, 554], [1542, 1427], [180, 1201], [653, 289], [972, 986], [796, 750], [1190, 1072], [1914, 408],
  [1396, 213], [757, 1429], [1766, 775], [265, 993], [1208, 1601], [1122, 1341], [505, 202], [1982, 934], [1192, 269], [1027, 432],
  [789, 361], [1415, 673], [1857, 1352], [894, 1212], [1768, 470], [605, 505], [1121, 700], [1975, 1477], [1717, 1548]];  // bright local maxima, stars left out
const DOT_LBL = 18;                                                     // index in DOTS that carries «каждая точка — целая галактика»
const LENS_RW = 330, MAG = 2.4;

// the moon-vs-patch diagram on the table (world)
const MOON_C = [2110, -215], MOON_R = 455, PATCH = MOON_R * 2 / 10;    // the patch is ten times narrower than the full Moon

// ---------------- camera ----------------
const TOUR = [700, 40];
const WEBB_CAM = [IT.wb.c[0] + 430, IT.wb.c[1] + 50];
const CAM = [
  // t, centre, zoom, roll (deg)
  [0.0, [690, 60], 0.40, -0.8],
  [HIT.glide, [740, 50], 0.42, -0.3],
  [HIT.drop, TOUR, 0.50, 0.2],
  [HIT.stopA, TOUR, 0.50, 0.2],
  [HIT.stopB, [470, 40], 0.50, 0.3],
  [HIT.stopB2, [450, 40], 0.50, 0.3],
  [HIT.stopC, [O(STOP_C)[0] + 700, O(STOP_C)[1] + 330], 0.505, 0.4],
  [HIT.push, [O(STOP_C)[0] + 690, O(STOP_C)[1] + 320], 0.51, 0.5],
  [HIT.pushEnd, O(STOP_C), 3.6, 0.5],
  [HIT.rise, O(STOP_C), 3.6, 0.5],
  [HIT.lift + 0.15, [700, 60], 0.425, 0.0],
  [HIT.webbGo, [690, 55], 0.42, -0.1],
  [HIT.webbGo + 1.75, WEBB_CAM, 0.46, 0.6],
  [DUR, [WEBB_CAM[0] - 10, WEBB_CAM[1] + 4], 0.47, 0.7],
];
const camC = track2(CAM.map(k => [k[0], k[1]]));
const camLZ = track(CAM.map(k => [k[0], Math.log(k[2])]));
const camR = track(CAM.map(k => [k[0], k[3]]));
const camAt = t => ({ c: camC(t), z: Math.exp(camLZ(t)), th: camR(t) * Math.PI / 180 });
function w2s(w, cam) { const d = rot([(w[0] - cam.c[0]) * cam.z, (w[1] - cam.c[1]) * cam.z], cam.th); return [W / 2 + d[0], H / 2 + d[1]]; }

// ---------------- the loupe ----------------
const LA = O(STOP_A), LB = O(STOP_B), LC = O(STOP_C);
const lwT = track2([[HIT.drop, LA], [HIT.stopA, LA], [HIT.stopB, LB], [HIT.stopB2, LB], [HIT.stopC, LC]]);
const phys = t => camAt(t).z * MAG;
const FARW = O(FAR_C);
const DV = {
  S: track([[HIT.push, phys(HIT.push)], [HIT.pushEnd, 2.1], [HIT.far, 2.6], [HIT.rise, 2.9], [HIT.lift, phys(HIT.lift)]]),
  C: track2([[HIT.push, LC], [HIT.pushEnd - 0.4, LC], [HIT.far, FARW], [HIT.rise, FARW], [HIT.lift, LC]]),
};

function shot(t) {
  const cam = camAt(t);
  const st = { cam, t, on: 0, A: 0, lift: 1, ls: [0, 0], R: 0, S: 1, ic: [0, 0], k: 0.16, spot: [0, 0, 0, 0] };
  if (t >= HIT.drop - 0.4 && t <= HIT.lift + 0.4) {
    const inn = seg(t, HIT.drop - 0.4, HIT.drop), out = seg(t, HIT.lift, HIT.lift + 0.4);
    st.on = 1; st.A = eo(inn) * (1 - ss(out)); st.lift = 1 + 0.35 * (1 - eo(inn)) + 0.35 * eo(out);
    const lw = t < HIT.push ? lwT(t) : LC;
    st.ls = w2s(lw, cam); st.R = LENS_RW * cam.z * st.lift;
    if (t < HIT.push) { st.S = cam.z * MAG * st.lift; st.ic = lw; }
    else if (t > HIT.lift) { st.S = cam.z * MAG * st.lift; st.ic = LC; }
    else { st.S = DV.S(t); st.ic = DV.C(t); }
    st.k = 0.16 * (1 - ss(seg(t, HIT.push + 0.25, HIT.pushEnd - 0.1))) + 0.16 * ss(seg(t, HIT.rise + 0.3, HIT.lift));
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
uniform sampler2D tPr, tP2;
uniform vec4 uPr, uP2;                          // centre.xy, rotation (rad), world per texel
uniform vec2 uCam; uniform float uZ, uRot, uT, uLight;
uniform vec2 uLensC; uniform float uLensR, uLensOn, uLensA, uLift;
uniform vec2 uIntC; uniform float uS, uK;
uniform vec4 uSpot;
out vec4 o;
float h21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
vec2 rot(vec2 v, float a){ float c=cos(a), s=sin(a); return vec2(c*v.x-s*v.y, s*v.x+c*v.y); }
vec4 tg(sampler2D t, vec2 uv, float fpx){ vec2 sz = vec2(textureSize(t, 0)); vec2 f = vec2(fpx)/sz; return textureGrad(t, uv, vec2(f.x, 0.), vec2(0., f.y)); }
vec2 itemUV(vec4 it, sampler2D t, vec2 w){ vec2 sz = vec2(textureSize(t, 0)); return (rot(w - it.xy, -it.z)/it.w + sz*0.5)/sz; }
bool inside(vec2 uv){ return uv.x > 0. && uv.y > 0. && uv.x < 1. && uv.y < 1.; }
vec3 lightTable(vec2 w){
  vec2 lo = vec2(-3000., -2300.), hi = vec2(7800., 2500.);
  vec2 d = min(w - lo, hi - w); float e = min(d.x, d.y);
  vec2 cd = (w - vec2(2300., 100.)) / vec2(7000., 3600.);
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
vec3 scene(vec2 w, float fp){
  vec3 L = lightTable(w), col = L;
  vec2 u = itemUV(uPr, tPr, w), u2 = itemUV(uP2, tP2, w);
  bool i1 = inside(u), i2 = inside(u2);
  if (i1 || i2){
    vec2 sz = i1 ? vec2(textureSize(tPr, 0)) : vec2(textureSize(tP2, 0)), px = (i1 ? u : u2)*sz;
    vec3 tex = i1 ? tg(tPr, u, fp/uPr.w).rgb : tg(tP2, u2, fp/uP2.w).rgb;
    col = L * tex * 1.02 + vec3(0.02)*(1. - uLight);       // backlit print: colour is transmission
    float e = min(min(px.x, px.y), min(sz.x - px.x, sz.y - px.y));
    col += vec3(0.05, 0.035, 0.012)*exp(-e/5.)*uLight;      // warm glow at the paper edge
    col *= 1. - 0.10*smoothstep(1.5, 0., e);                // the cut edge
  }
  float dd = speck(w, 30., 0.955)*0.5 + speck(w + 11., 9., 0.975)*0.35;
  col *= 1. - dd*0.35;
  return col;
}
void main(){
  vec2 s = vec2(gl_FragCoord.x, 1080. - gl_FragCoord.y);
  vec2 w = uCam + rot(s - vec2(960., 540.), -uRot) / uZ;
  vec2 dl = s - uLensC; float r = length(dl), rho = r / max(uLensR, 1.);
  vec3 table = scene(w, 1. / uZ);
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
        c3[i] = scene(wi, 1. / uS)[i];
      }
      lc = c3;
      float rimw = uK/0.16;                                  // lens shading fades as the rim leaves the frame
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
      lc = scene(w2, 1. / uZ)*0.93 + 0.035*uLight;
      lc *= 1. - 0.45*exp(-pow(u/0.05, 2.));
      lc += vec3(0.20, 0.21, 0.22)*exp(-pow((u - 0.93)/0.035, 2.))*uLight;
      lc *= 1. - 0.25*exp(-pow((u - 1.0)/0.015, 2.));
    } else {
      lc = under * (1. - (0.07*exp(-pow((rho - 1.31)/0.05, 2.)) + 0.03*exp(-pow((rho - 1.3)/0.25, 2.)))*(2. - uLift));
    }
    col = mix(under, lc, uLensA);
  }
  if (uSpot.w > 0.){ float ds = length(s - uSpot.xy); col *= 1. - 0.38*uSpot.w*smoothstep(uSpot.z, uSpot.z + 220., ds); }
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

function overlay(t, st) {
  const c = ov; TXT = [];
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
  const cam = st.cam, z = cam.z;
  const X = 1330, CW = 550;
  const edge = p => w2s(O(p), cam);

  // ---- 1. which picture: «снимок телескопа «Хаббл»», pinned to the print's right edge
  card(c, t, HIT.hubble, HIT.patch - 0.35, X, 150, CW, 150, edge([2300, 420]), (c, x, y, live) => {
    line(c, t, HIT.hubble + 0.2, 'h0', 'снимок телескопа', x + 28, y + 50, '400 28px PS', PAPER2, live);
    line(c, t, HIT.hubble + 0.4, 'h1', '«Хаббл»', x + 26, y + 120, '600 62px SS', PAPER, live);
  });

  // ---- 2. the diagram on the table: a tiny dark patch of sky, ten times narrower than the full Moon
  if (t > HIT.patch && t < HIT.diagOut + 0.45) {
    const out = seg(t, HIT.diagOut, HIT.diagOut + 0.4);
    c.save(); c.globalAlpha = 1 - out;
    const mc = w2s(MOON_C, cam), h = PATCH * z / 2;
    const sk = eo(seg(t, HIT.patch, HIT.patch + 0.35));
    c.strokeStyle = ORANGE; c.lineWidth = 2.5; c.fillStyle = 'rgba(8,9,11,0.92)';
    c.beginPath(); c.rect(mc[0] - h * sk, mc[1] - h * sk, 2 * h * sk, 2 * h * sk); c.fill(); c.stroke();
    // the wedge: the patch opens up into the print (lines kept out of the subtitle band)
    const wk = eo(seg(t, HIT.patch + 0.2, HIT.patch + 0.75));
    if (wk > 0) {
      c.save(); c.beginPath(); c.rect(0, 0, W, 828); c.clip();
      c.lineWidth = 1.6; c.setLineDash([7, 6]);
      for (const [p, q] of [[[mc[0] - h, mc[1] - h], edge([2300, 0])], [[mc[0] - h, mc[1] + h], edge([2300, 2100])]]) {
        c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(lerp(p[0], q[0], wk), lerp(p[1], q[1], wk)); c.stroke();
      }
      c.restore();
    }
    label(c, t, HIT.patchLbl, 99, 'patch', [mc[0], mc[1] - h], mc[1] - h - 180, -1,
      [['500 34px PS', PAPER, 'крошечный тёмный'], ['500 34px PS', PAPER, 'участок неба']]);
    // the full Moon, to the same scale, and its width
    const R = MOON_R * z, mk = eo(seg(t, HIT.moon, HIT.moon + 0.6));
    if (mk > 0) {
      c.save(); c.strokeStyle = ORANGE; c.lineWidth = 2.6; c.beginPath(); c.arc(mc[0], mc[1], R, Math.PI / 2, Math.PI / 2 + Math.PI * 2 * mk); c.stroke(); c.restore();
      const dy = mc[1] + R + 34, dk = eo(seg(t, HIT.moon + 0.3, HIT.moon + 0.7));
      c.strokeStyle = ORANGE; c.lineWidth = 2; c.beginPath();
      c.moveTo(mc[0] - R * dk, dy); c.lineTo(mc[0] + R * dk, dy);
      if (dk >= 1) { c.moveTo(mc[0] - R, dy - 10); c.lineTo(mc[0] - R, dy + 10); c.moveTo(mc[0] + R, dy - 10); c.lineTo(mc[0] + R, dy + 10); }
      c.stroke();
      const tk = eo(seg(t, HIT.moonLbl, HIT.moonLbl + 0.45));
      if (tk > 0) {
        c.font = '500 32px PS'; const s = 'в 10 раз уже полной Луны', wd = c.measureText(s).width + 36;
        const x0 = mc[0] - wd / 2, y0 = dy + 16;
        c.save(); c.beginPath(); c.rect(x0 - 2, y0 - 4, (wd + 4) * tk, 64); c.clip();
        plate(c, x0, y0, wd, 54); text(c, tk >= 1 ? 'moon' : null, s, x0 + 18, y0 + 38, '500 32px PS', PAPER); c.restore();
      }
    }
    c.restore();
  }

  // ---- 3. readings: more than 11 days · almost 10 000 galaxies
  card(c, t, HIT.days, HIT.voy - 0.45, X, 150, CW, 200, edge([2300, 640]), (c, x, y, live) => {
    line(c, t, HIT.days + 0.2, 'y0', 'снимали больше', x + 28, y + 52, '500 30px PS', PAPER, live);
    const n = Math.round(lerp(0, 11, eo(seg(t, HIT.days + 0.3, HIT.daysLand))));
    text(c, live && n === 11 ? 'y1' : null, String(n), x + 24, y + 166, '500 112px PM', ORANGE);
    line(c, t, HIT.days + 0.5, 'y2', 'суток', x + 180, y + 160, '500 44px PS', PAPER, live);
  });
  if (st.on && t < HIT.push) {
    const ang = 0.2, p0 = [st.ls[0] + Math.cos(ang) * st.R * 1.31, st.ls[1] + Math.sin(ang) * st.R * 1.31];
    card(c, t, HIT.gal, HIT.voy - 0.45, X, 380, CW, 245, p0, (c, x, y, live) => {
      line(c, t, HIT.gal + 0.2, 'g0', 'на кадре почти', x + 28, y + 52, '500 30px PS', PAPER, live);
      const n = Math.round(lerp(0, 10, eo(seg(t, HIT.gal + 0.3, HIT.galLand)))) * 1000;
      const s = n >= 1000 ? `${Math.floor(n / 1000)} 000` : '0';
      text(c, live && n === 10000 ? 'g1' : null, s, x + 24, y + 160, '500 96px PM', ORANGE);
      line(c, t, HIT.gal + 0.5, 'g2', 'галактик', x + 28, y + 220, '500 42px PS', PAPER, live);
    });
  }

  // ---- 4. two records side by side: Voyager's light day · this picture's billions of years
  if (st.on && t < HIT.pushEnd) {
    card(c, t, HIT.voy, HIT.push - 0.1, X, 150, CW, 180, null, (c, x, y, live) => {
      line(c, t, HIT.voy + 0.2, 'v0', '«Вояджер» за 49 лет улетел на', x + 28, y + 52, '500 30px PS', PAPER, live);
      line(c, t, HIT.voyLight, 'v1', 'сутки света', x + 26, y + 138, '500 64px PM', ORANGE, live);
    });
    card(c, t, HIT.look, HIT.push - 0.1, X, 370, CW, 180, null, (c, x, y, live) => {
      line(c, t, HIT.look + 0.2, 'l0', 'а этот снимок смотрит на', x + 28, y + 52, '500 30px PS', PAPER, live);
      line(c, t, HIT.lookPast, 'l1', 'миллиарды лет назад', x + 26, y + 132, '500 46px PS', ORANGE, live);
    });
  }

  // ---- 5. inside the lens: the farthest galaxies, what we see of them, and when their light set out
  if (st.on && t > HIT.push + 0.4 && t < HIT.rise + 0.6) {
    const rOut = seg(t, HIT.rise + 0.1, HIT.rise + 0.4);
    const ps = FAR.map(p => int2s(O(p), st));
    c.save(); c.globalAlpha = 1 - rOut;
    ps.forEach((p, i) => { const k = eo(seg(t, HIT.far + 0.35 * i, HIT.far + 0.35 * i + 0.45)); if (k > 0) ring(c, p, 24, k, 2.8); });
    c.restore();
    label(c, t, HIT.farLbl, HIT.rise + 0.1, 'far', [ps[1][0], ps[1][1] - 24], 150, -1, [['500 40px PS', PAPER, 'самые далёкие галактики']]);
    const p0 = [ps[2][0] + 24, ps[2][1]];
    card(c, t, HIT.seen, HIT.rise + 0.1, X, 130, CW, 330, p0, (c, x, y, live) => {
      line(c, t, HIT.seen + 0.2, 's0', 'видны такими, какими были', x + 28, y + 50, '500 30px PS', PAPER, live);
      line(c, t, HIT.approx, 's1', 'примерно через', x + 28, y + 94, '500 30px PS', PAPER, live);
      line(c, t, HIT.num, 's2', '500–800', x + 24, y + 196, '500 96px PM', ORANGE, live);
      line(c, t, HIT.mln, 's3', 'млн лет', x + 28, y + 254, '500 44px PS', PAPER, live);
      line(c, t, HIT.after, 's4', 'после начала Вселенной', x + 28, y + 304, '500 32px PS', PAPER, live);
    });
    card(c, t, HIT.light, HIT.rise + 0.1, X, 490, CW + 10, 140, null, (c, x, y, live) => {
      line(c, t, HIT.light + 0.2, 'e0', 'свет этих галактик вышел в путь,', x + 28, y + 52, '500 30px PS', PAPER, live);
      line(c, t, HIT.noEarth, 'e1', 'когда Земли ещё не было', x + 26, y + 112, '500 40px PS', ORANGE, live);
    });
  }

  // ---- 6. the whole print again: a ring on dot after dot
  if (t > HIT.dots && t < HIT.webbGo + 0.6) {
    const out = seg(t, HIT.webbGo, HIT.webbGo + 0.45);
    c.save(); c.globalAlpha = 1 - out;
    DOTS.forEach((p, i) => { const k = eo(seg(t, HIT.dots + 0.075 * i, HIT.dots + 0.075 * i + 0.35)); if (k > 0) ring(c, w2s(O(p), cam), 14, k, 2.2); });
    c.restore();
    const a = w2s(O(DOTS[DOT_LBL]), cam);
    label(c, t, HIT.dotsLbl, HIT.webbGo, 'dots', [a[0], a[1] - 14], 140, 1, [['500 38px PS', PAPER, 'каждая точка — целая галактика']]);
  }

  // ---- 7. Webb's first deep field
  card(c, t, HIT.webb, 99, X, 300, CW, 200, w2s(OW([1881, 700]), cam), (c, x, y, live) => {
    line(c, t, HIT.webb + 0.2, 'w0', 'телескоп', x + 28, y + 50, '400 28px PS', PAPER2, live);
    line(c, t, HIT.webb + 0.35, 'w1', '«Уэбб»', x + 26, y + 118, '600 62px SS', PAPER, live);
    line(c, t, HIT.older, 'w2', 'увидел галактики ещё старше', x + 28, y + 174, '500 32px PS', ORANGE, live);
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
  gl.uniform4f(U('uSpot'), ...st.spot);
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
  const [im, im2] = await Promise.all([img('assets/tex/hudf.jpg'), img('assets/tex/webb.jpg')]);
  tex(0, im); gl.uniform1i(U('tPr'), 0); tex(1, im2); gl.uniform1i(U('tP2'), 1);
  gl.uniform4f(U('uPr'), IT.pr.c[0], IT.pr.c[1], IT.pr.r * Math.PI / 180, IT.pr.k);
  gl.uniform4f(U('uP2'), IT.wb.c[0], IT.wb.c[1], IT.wb.r * Math.PI / 180, IT.wb.k);
}
load().then(() => { window.render(0); window.READY = true; });
