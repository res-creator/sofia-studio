// «British is easy» — two guys at a high table in a London pub (3D toon world), cut to the Suno track.
// A = Russian guy (our hero), B = posh Brit. Phrase cards on top ("говорят / значит"), captions in the lower third.
import * as THREE from './node_modules/three/build/three.module.js';
const TL = await (await fetch('timeline.json')).json();
const W = 1080, H = 1920, INK = 0x351f22, INKS = '#351f22', HW = '"Neucha", cursive', BOLD = '"NunitoB", sans-serif';
const renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
renderer.setSize(W, H); renderer.setPixelRatio(1); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace;
const out = document.createElement('canvas'); out.width = W; out.height = H; const og = out.getContext('2d'); document.body.appendChild(out);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x3a2a24); scene.fog = new THREE.Fog(0x3a2a24, 14, 30);
const camera = new THREE.PerspectiveCamera(50, W / H, .05, 80);
const grad = (() => { const c = document.createElement('canvas'); c.width = 3; c.height = 1; const x = c.getContext('2d'); ['#bdb6b2', '#e0dcd8', '#ffffff'].forEach((col, i) => { x.fillStyle = col; x.fillRect(i, 0, 1, 1); }); const t = new THREE.CanvasTexture(c); t.minFilter = t.magFilter = THREE.NearestFilter; return t; })();
const toon = (color, map) => new THREE.MeshToonMaterial({color: map ? 0xffffff : color, gradientMap: grad, map: map || null});
const lineMat = new THREE.LineBasicMaterial({color: INK});
function ink(m) { m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 30), lineMat)); m.castShadow = true; m.receiveShadow = true; return m; }
function box(w, h, d, color, x, y, z, map) { const m = ink(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(color, map))); m.position.set(x, y, z); scene.add(m); return m; }
function cyl(r, h, color, x, y, z, seg = 16, r2) { const m = ink(new THREE.Mesh(new THREE.CylinderGeometry(r, r2 ?? r, h, seg), toon(color))); m.position.set(x, y, z); scene.add(m); return m; }
function plane(w, h, map, x, y, z, ry = 0, color = 0xffffff) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon(color, map)); m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; scene.add(m); return m; }
function paint(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; fn(c.getContext('2d')); t.needsUpdate = true; return t; }
const sign = (w, h, bg, fg, lines, font = BOLD) => paint(w, h, x => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; lines.forEach(([s, sz, y]) => { x.font = `${sz}px ${font}`; x.fillText(s, w / 2, y); }); });

// ---- pub set ----
const wall = paint(512, 512, x => { x.fillStyle = '#6a2a2a'; x.fillRect(0, 0, 512, 512); x.fillStyle = '#5a2222'; for (let i = 0; i < 512; i += 64) x.fillRect(i, 0, 28, 512); x.fillStyle = '#4a2a1a'; x.fillRect(0, 380, 512, 132); x.fillStyle = '#5a3420'; for (let i = 0; i < 512; i += 85) x.fillRect(i, 390, 70, 110); });
plane(14, 6, wall, 0, 3, -2); for (const s of [-1, 1]) plane(12, 6, wall, s * 6, 3, 4, -s * Math.PI / 2);
const fl = plane(14, 12, paint(512, 512, x => { x.fillStyle = '#7a4a2a'; x.fillRect(0, 0, 512, 512); x.strokeStyle = 'rgba(30,15,5,0.4)'; x.lineWidth = 3; for (let i = 0; i < 512; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.stroke(); } }), 0, 0, 4); fl.rotation.x = -Math.PI / 2;
// bar in the back with taps and bottles
box(5, 1.1, .7, 0x5a3418, 0, .55, -1.3); box(5.1, .08, .8, 0x8a5a2a, 0, 1.12, -1.3);
for (let i = 0; i < 5; i++) cyl(.04, .36, 0xd8c060, -1 + i * .5, 1.32, -1.5, 10);
box(4, .06, .3, 0x5a3418, 0, 1.9, -1.85); box(4, .06, .3, 0x5a3418, 0, 2.5, -1.85);
for (let i = 0; i < 14; i++) cyl(.06, .3, [0x2f8a5a, 0x8a2a2a, 0xc8a040, 0x3a5aa8][i % 4], -1.8 + i * .28, 2.08 + (i % 2) * .6, -1.85, 10);
box(2.6, .62, .08, 0x1a1208, 0, 3.35, -1.9, sign(860, 200, '#1a1208', '#f0c060', [['THE POLITE FOX', 92, 104]], HW));
box(1.3, .9, .05, 0xf6efdc, -2.6, 2.4, -1.95, sign(400, 280, '#f6efdc', INKS, [['TODAY', 52, 60], ['tea · pie · chips', 44, 140], ['£ 4.50', 50, 220]], HW));
// union jack bunting
for (let i = 0; i < 12; i++) { const t = new THREE.Mesh(new THREE.ConeGeometry(.12, .22, 3), toon([0xc0283a, 0xffffff, 0x1f3a8a][i % 3])); t.rotation.z = Math.PI; t.position.set(-3 + i * .55, 4.3 - Math.sin(i / 11 * Math.PI) * .25, -1.9); scene.add(t); }
for (const x of [-4, 4]) cyl(.2, .32, 0xffd28a, x, 3.4, -1.7, 16, .12);
// high table between them
cyl(.62, .06, 0x8a5a2a, 0, 1.08, 0.85, 32); cyl(.05, 1.05, 0x2a2a30, 0, .54, 0.85, 10); cyl(.3, .04, 0x2a2a30, 0, .02, 0.85, 20);
const cupA = cyl(.06, .16, 0xffffff, -.3, 1.19, .75, 16, .05), cupB = cyl(.06, .16, 0xffffff, .3, 1.19, .75, 16, .05);
// people
const loader = new THREE.TextureLoader(), TEX = {};
const tex = n => { if (!TEX[n]) { TEX[n] = loader.load(`sprites/${n}.png`); TEX[n].colorSpace = THREE.SRGBColorSpace; } return TEX[n]; };
(await (await fetch('sprites/list.json')).json()).forEach(tex);
function person(name, h, x, z) { const t = tex(name), mat = new THREE.MeshBasicMaterial({map: t, transparent: true, alphaTest: .5, side: THREE.DoubleSide});
  const m = new THREE.Mesh(new THREE.PlaneGeometry(h * 640 / 1560, h), mat); m.position.set(x, h / 2, z); m.castShadow = true; m.customDepthMaterial = new THREE.MeshDepthMaterial({depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: .5}); scene.add(m);
  m.h = h; m.set = n => { const tt = tex(n); if (m.material.map !== tt) { m.material.map = tt; m.customDepthMaterial.map = tt; } }; return m; }
const A = person('hero_ask_m0', 1.62, -.62, 1.25), B = person('brit_smug_m0', 1.8, .62, 1.25);
scene.add(new THREE.HemisphereLight(0xffeedd, 0x4a3020, 1.0));
const key = new THREE.DirectionalLight(0xffd8a0, 1.7); key.position.set(-4, 7, 8); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, {left: -6, right: 6, top: 6, bottom: -2, near: 1, far: 30}); key.shadow.bias = -.0008; key.shadow.radius = 4; scene.add(key); key.target.position.set(0, 0, 1); scene.add(key.target);

// ---- cameras ----
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const CAM = {WIDE: [V(0, 1.45, 5.2), V(0, 1.25, 1)], HOOK: [V(0, 1.5, 4.9), V(0, 1.3, 1)], A_MED: [V(-.45, 1.38, 3.6), V(-.6, 1.3, 1.2)], B_MED: [V(.45, 1.45, 3.6), V(.6, 1.4, 1.2)],
  OTS_A: [V(.9, 1.45, 3.7), V(-.55, 1.3, 1.2)], OTS_B: [V(-.9, 1.4, 3.7), V(.55, 1.35, 1.2)], A_CU: [V(-.62, 1.42, 2.85), V(-.62, 1.4, 1.2)], B_CU: [V(.62, 1.56, 2.8), V(.62, 1.55, 1.2)], END: [V(0, 1.45, 5.2), V(0, 1.25, 1)]};
const SH = TL.SH.map(([at, k], i) => ({at, k, end: i + 1 < TL.SH.length ? TL.SH[i + 1][0] : TL.TOTAL, i}));
const lineAt = t => { let cur = null; for (const l of TL.L) if (t >= l[0] - .05 && t < l[1] + .25) cur = l; return cur; };
const env = t => TL.env[Math.floor(t * 30)] || 0;

// ---- HUD ----
function rrect(x, y, w, h, r, fill, stroke = INKS, lw = 6) { og.beginPath(); og.roundRect(x, y, w, h, r); og.fillStyle = fill; og.fill(); if (stroke) { og.strokeStyle = stroke; og.lineWidth = lw; og.stroke(); } }
function outlined(s, x, y, size, fill) { og.font = `${size}px ${BOLD}`; let f = size; while (og.measureText(s).width > 980 && f > 34) { f -= 4; og.font = `${f}px ${BOLD}`; } og.textAlign = 'center'; og.textBaseline = 'middle'; og.lineJoin = 'round'; og.lineWidth = f * .24; og.strokeStyle = '#000'; og.strokeText(s, x, y); og.fillStyle = fill; og.fillText(s, x, y); }
function captions(t) { const l = lineAt(t); if (!l) return; const en = !/[а-яё]/i.test(l[3]); const pop = 1 + .08 * Math.max(0, 1 - (t - l[0]) / .1);
  og.save(); og.translate(540, 1560); og.scale(pop, pop); outlined(l[3], 0, 0, l[3].length > 26 ? 62 : 76, en ? '#ffd23f' : '#ffffff'); og.restore(); if (l[4]) outlined(l[4], 540, 1650, 46, '#bfe9ff'); }
function card(t) { const l = TL.L.find(q => q[5] && t >= q[0] - .05 && t < q[1] + .9); if (!l) return; const k = Math.min(1, (t - l[0] + .05) / .15); og.save(); og.globalAlpha = k; og.translate(540, 250); og.scale(.92 + .08 * k, .92 + .08 * k);
  rrect(-470, -120, 940, 240, 30, '#fffaf0', INKS, 7); og.textAlign = 'center'; og.textBaseline = 'middle';
  og.font = `30px ${BOLD}`; og.fillStyle = '#888'; og.fillText('ГОВОРЯТ', 0, -82); let f = 62; og.font = `${f}px ${BOLD}`; while (og.measureText(l[5][0]).width > 880) { f -= 4; og.font = `${f}px ${BOLD}`; } og.fillStyle = '#1f3a8a'; og.fillText(l[5][0], 0, -30);
  og.font = `30px ${BOLD}`; og.fillStyle = '#888'; og.fillText('ЗНАЧИТ', 0, 26); og.font = `54px ${BOLD}`; og.fillStyle = '#c0283a'; og.fillText(l[5][1], 0, 76); og.restore(); }
function endCard(t, a) { const k = Math.min(1, (t - a) / .35); og.fillStyle = `rgba(30,20,20,${.6 * k})`; og.fillRect(0, 0, W, H); og.save(); og.globalAlpha = k;
  rrect(50, 170, 980, 1560, 44, '#fffaf0', INKS, 8); og.textAlign = 'center'; og.textBaseline = 'middle'; og.font = `58px ${BOLD}`; og.fillStyle = '#c0283a'; og.fillText('ГОВОРЯТ → ЗНАЧИТ', 540, 260);
  const rows = TL.L.filter(l => l[5]).filter((l, i, a) => a.findIndex(q => q[5][0] === l[5][0]) === i);
  rows.forEach(([, , , , , [en, ru]], i) => { const y = 350 + i * 100; og.font = `40px ${BOLD}`; let f = 40; while (og.measureText(en).width > 900) { f -= 2; og.font = `${f}px ${BOLD}`; } og.fillStyle = '#1f3a8a'; og.fillText(en, 540, y); og.font = `32px ${BOLD}`; og.fillStyle = '#c0283a'; og.fillText(ru, 540, y + 42); });
  og.font = `42px ${BOLD}`; og.fillStyle = INKS; og.fillText('Это «да» или «нет»? Переведи в комментах', 540, 1650, 920); og.restore(); }

window.renderAt = t => {
  let sh = SH[0]; for (const s of SH) if (t >= s.at) sh = s; const c = CAM[sh.k], d = sh.end - sh.at, u = sh.i % 3 === 2 ? 0 : .15 * Math.min(1, (t - sh.at) / d);
  const pos = c[0].clone(), look = c[1].clone(); pos.lerp(look, u * .5); camera.position.copy(pos); camera.lookAt(look);
  const l = lineAt(t), who = l ? l[2] : '', m = env(t), mi = v => v > .55 ? 2 : v > .12 ? 1 : 0;
  const ta = who.includes('A') ? mi(m) : 0, tb = who.includes('B') ? mi(m) : 0;
  const inBreak = t > 49.2 && t < 61.4, heroMood = t > 57.6 && t < 61.4 ? 'shock' : inBreak ? 'angry' : t > 68 ? 'hope' : t < 9 ? 'conf' : 'ask';
  A.set(`hero_${heroMood}_m${ta}`); B.set(`brit_${t > 71 ? 'polite' : who === 'AB' || (l && l[3].startsWith('Say')) ? 'shrug' : 'smug'}_m${tb}`);
  [A, B].forEach((p, i) => { const wp = new THREE.Vector3(); p.getWorldPosition(wp); p.rotation.y = Math.max(-.6, Math.min(.6, Math.atan2(camera.position.x - wp.x, camera.position.z - wp.z))); p.position.y = p.h / 2 + Math.abs(Math.sin(t * 2.5 + i * 1.7)) * .008 + (who === 'AB' ? Math.abs(Math.sin(t * Math.PI * 152 / 60 / 2)) * .03 : 0); });
  renderer.render(scene, camera);
  og.setTransform(1, 0, 0, 1, 0, 0); og.drawImage(renderer.domElement, 0, 0);
  const v = og.createRadialGradient(W / 2, H * .45, 650, W / 2, H * .45, 1250); v.addColorStop(0, 'rgba(30,15,10,0)'); v.addColorStop(1, 'rgba(30,15,10,0.25)'); og.fillStyle = v; og.fillRect(0, 0, W, H);
  if (!window.NOCAP) { if (sh.k === 'END') endCard(t, sh.at); else { card(t); captions(t); } }
  return true; };
window.TOTAL = TL.TOTAL;
window.ready = new Promise(r => { let done = false; THREE.DefaultLoadingManager.onLoad = () => { if (!done) { done = true; setTimeout(() => r(true), 300); } }; setTimeout(() => r(true), 8000); });
