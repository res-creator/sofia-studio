// «Мысленный эксперимент» — «Размер Вселенной»: the Pale Blue Dot (Voyager 1, 14 Feb 1990) on the light table.
// Adapted from ru_geo/lemo/bh_otis (Archive Light Table, Lemo-Opuscar demo engine). World units = texture px of the print
// (NASA/JPL PIA23645 at 3200 px on a 40 px paper margin). One camera, one loupe that lands on the light band, slides down it,
// and pushes in to find the dot. Picture: a WebGL2 fragment shader; marks and labels on a 2D canvas above it.
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
const IT = { pr: { c: [0, 0], r: 0.8, k: 1, size: [3280, 3246] } };   // the print (3200×3166 image + 40 px margin)
const toW = (it, p) => { const o = rot([(p[0] - it.size[0] / 2) * it.k, (p[1] - it.size[1] / 2) * it.k], it.r * Math.PI / 180); return [it.c[0] + o[0], it.c[1] + o[1]]; };
const O = p => toW(IT.pr, [p[0] + 40, p[1] + 40]);                    // image px -> world

// points on the photograph (image px, measured on the file: brightest pixel of the dot, ridge of the light band)
const P_DOT = [1902, 1645];
const bandX = y => 2073 - 0.165 * (y - 660);                           // the scattered-light band (the "sunbeam")
const LW0 = O([bandX(1090), 1090]), LW1 = O([bandX(1370), 1370]);       // the loupe lands on the band, slides down it
const LENS_RW = 480, MAG = 2.0, R_DOT = 30;                             // lens radius (world), magnification, dot ring (screen px)

// ---------------- camera ----------------
const WIDE = [600, 30];
const CAM = [
  // t, centre, zoom, roll (deg)
  [0.0, WIDE, 0.30, -1.0],
  [HIT.drop, [LW0[0] + 560, LW0[1] + 190], 0.42, 0.3],
  [HIT.push, [LW1[0] + 540, LW1[1] + 180], 0.44, 0.6],
  [HIT.pushEnd, LW1, 3.3, 0.6],
  [HIT.rise, LW1, 3.3, 0.6],
  [HIT.lift + 0.15, [262, 86], 0.305, 0.2],
  [DUR, [250, 80], 0.30, 0.1],
];
const camC = track2(CAM.map(k => [k[0], k[1]]));
const camLZ = track(CAM.map(k => [k[0], Math.log(k[2])]));
const camR = track(CAM.map(k => [k[0], k[3]]));
const camAt = t => ({ c: camC(t), z: Math.exp(camLZ(t)), th: camR(t) * Math.PI / 180 });
function w2s(w, cam) { const d = rot([(w[0] - cam.c[0]) * cam.z, (w[1] - cam.c[1]) * cam.z], cam.th); return [W / 2 + d[0], H / 2 + d[1]]; }

// ---------------- the loupe ----------------
// on the table the loupe slides down the band (lw); inside, scale S (screen px per world unit) and centre ic are tracks
// that start and end at the physical loupe
const lwT = track2([[HIT.drop, LW0], [HIT.drop + 0.6, LW0], [HIT.push - 0.1, LW1]]);
const phys = t => camAt(t).z * MAG;
const DOTC = O([P_DOT[0], P_DOT[1] + 28]);                              // the dot sits a little above the frame centre
const MID = O([bandX(1520), 1520]);
const DV = {
  S: track([[HIT.push, phys(HIT.push)], [HIT.pushEnd, 1.55], [HIT.find, 1.6], [HIT.found, 2.4], [HIT.rise, 2.9], [HIT.lift, phys(HIT.lift)]]),
  C: track2([[HIT.push, LW1], [HIT.pushEnd, LW1], [HIT.find, MID], [HIT.found, DOTC], [HIT.rise, DOTC], [HIT.lift, LW1]]),
};

function shot(t) {
  const cam = camAt(t);
  const st = { cam, t, on: 0, A: 0, lift: 1, ls: [0, 0], R: 0, S: 1, ic: [0, 0], k: 0.16, spot: [0, 0, 0, 0] };
  if (t >= HIT.drop - 0.4 && t <= HIT.lift + 0.4) {
    const inn = seg(t, HIT.drop - 0.4, HIT.drop), out = seg(t, HIT.lift, HIT.lift + 0.4);
    st.on = 1; st.A = eo(inn) * (1 - ss(out)); st.lift = 1 + 0.35 * (1 - eo(inn)) + 0.35 * eo(out);
    const lw = t < HIT.push ? lwT(t) : LW1;
    st.ls = w2s(lw, cam); st.R = LENS_RW * cam.z * st.lift;
    if (t < HIT.push) { st.S = cam.z * MAG * st.lift; st.ic = lw; }
    else if (t > HIT.lift) { st.S = cam.z * MAG * st.lift; st.ic = LW1; }
    else { st.S = DV.S(t); st.ic = DV.C(t); }
    st.k = 0.16 * (1 - ss(seg(t, HIT.push + 0.25, HIT.pushEnd - 0.1))) + 0.16 * ss(seg(t, HIT.rise + 0.3, HIT.lift));
  }
  // a soft spotlight on the dot while it is ringed
  const sp = ss(seg(t, HIT.ring, HIT.ring + 0.6)) * (1 - ss(seg(t, HIT.rise - 0.1, HIT.rise + 0.4)));
  if (sp > 0 && st.on) { const p = int2s(O(P_DOT), st); st.spot = [p[0], p[1], 260, sp * 0.6]; }
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
uniform sampler2D tPr;
uniform vec4 uPr;                          // centre.xy, rotation (rad), world per texel
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
  vec2 lo = vec2(-4200., -2700.), hi = vec2(4200., 2700.);
  vec2 d = min(w - lo, hi - w); float e = min(d.x, d.y);
  vec2 cd = w / vec2(5400., 3600.);
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
  vec2 u = itemUV(uPr, tPr, w);
  if (inside(u)){
    vec2 sz = vec2(textureSize(tPr, 0)), px = u*sz;
    vec3 tex = tg(tPr, u, fp/uPr.w).rgb;
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
  const cam = st.cam;
  const X = 1330, CW = 470;

  // ---- reading 1: the date of the frame, pinned to the print's top-right corner
  {
    const corner = w2s(O([3200, 1000]), cam);              // the print's right edge
    card(c, t, HIT.date, HIT.push - 0.1, X, 110, CW, 330, corner, (c, x, y, live) => {
      line(c, t, HIT.date + 0.2, 'd0', 'дата снимка', x + 28, y + 48, '400 26px PS', PAPER2, live);
      line(c, t, HIT.date + 0.35, 'd1', '14 февраля', x + 26, y + 128, '500 58px PM', PAPER, live);
      if (t >= HIT.yearGo) {
        const yr = Math.round(lerp(1900, 1990, eo(seg(t, HIT.yearGo, HIT.year))));
        line(c, t, HIT.yearGo, yr === 1990 ? 'd2' : null, String(yr), x + 22, y + 250, '500 112px PM', ORANGE, live);
      }
      line(c, t, HIT.voy, 'd3', '«Вояджер»', x + 28, y + 304, '500 30px PS', PAPER, live);
    });
  }

  // ---- reading 2: the distance, from the loupe's rim
  if (st.on && t < HIT.pushEnd) {
    const ang = 0.15, p0 = [st.ls[0] + Math.cos(ang) * st.R * 1.31, st.ls[1] + Math.sin(ang) * st.R * 1.31];
    card(c, t, HIT.dist, HIT.push - 0.1, X, 480, CW, 210, p0, (c, x, y, live) => {
      const n = Math.round(lerp(0, 6, eo(seg(t, HIT.dist + 0.2, HIT.distLand))));
      text(c, live && n === 6 ? 'k0' : null, String(n), x + 24, y + 122, '500 112px PM', ORANGE);
      line(c, t, HIT.dist + 0.3, 'k1', 'млрд км', x + 112, y + 118, '500 46px PS', PAPER, live);
      line(c, t, HIT.sun, 'k2', 'от Солнца', x + 28, y + 176, '500 32px PS', PAPER, live);
    });
  }

  // ---- inside the lens: the dot
  if (st.on && t > HIT.push + 0.4 && t < HIT.rise + 0.6) {
    const p = int2s(O(P_DOT), st);
    const rk = eo(seg(t, HIT.ring, HIT.ring + 0.55)), rOut = seg(t, HIT.rise + 0.1, HIT.rise + 0.4);
    if (rk > 0 && rOut < 1) {
      c.save(); c.globalAlpha = 1 - rOut; ring(c, p, R_DOT, rk, 3); c.restore();
      const a1 = [p[0] + Math.cos(-2.5) * R_DOT, p[1] + Math.sin(-2.5) * R_DOT];
      label(c, t, HIT.earth, HIT.rise + 0.1, 'earth', a1, 150, -1, [['600 58px SS', PAPER, 'Земля']]);
      const a2 = [p[0] + Math.cos(-0.15) * R_DOT, p[1] + Math.sin(-0.15) * R_DOT];
      label(c, t, HIT.pixel, HIT.rise + 0.1, 'px', a2, 45, 1, [['500 36px PS', PAPER, 'меньше одного пикселя']]);
    }
  }

  // ---- back on the table: the whole print, a ring on the dot, the band named
  if (t > HIT.tableRing - 0.1) {
    const k = eo(seg(t, HIT.tableRing, HIT.tableRing + 0.45));
    const p = w2s(O(P_DOT), cam);
    ring(c, p, 20, k, 2.4);
    label(c, t, HIT.tableEarth, 99, 'te', [p[0] + Math.cos(-2.3) * 20, p[1] + Math.sin(-2.3) * 20], 110, -1, [['500 34px PS', PAPER, 'Земля']]);
    const b = w2s(O([bandX(620), 620]), cam);
    label(c, t, HIT.band, 99, 'band', b, 70, 1, [['500 34px PS', PAPER, 'луч света']]);
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
  const im = await img('assets/tex/pbd.jpg');
  tex(0, im); gl.uniform1i(U('tPr'), 0);
  gl.uniform4f(U('uPr'), IT.pr.c[0], IT.pr.c[1], IT.pr.r * Math.PI / 180, IT.pr.k);
}
load().then(() => { window.render(0); window.READY = true; });
