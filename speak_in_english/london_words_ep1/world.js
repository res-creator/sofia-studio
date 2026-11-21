// «Первый день в Лондоне» — 3D house style (skill animated-3d-story-video, adapted): procedural toon-shaded locations with ink edges,
// 2D toon characters inside the world, moderate eased camera, in-world signs, cream dip at location changes,
// HUD: school-English meter + word cards (top), captions (lower third).
import * as THREE from './node_modules/three/build/three.module.js';
const TL = await (await fetch('timeline.json')).json();
const W = 1080, H = 1920, INK = 0x351f22, INKS = '#351f22', HW = '"Neucha", cursive', BOLD = '"NunitoB", sans-serif';
const renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
renderer.setSize(W, H); renderer.setPixelRatio(1); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace;
const out = document.createElement('canvas'); out.width = W; out.height = H; const og = out.getContext('2d'); document.body.appendChild(out);
const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xf1e2bf, 18, 45); scene.background = new THREE.Color(0xf1e2bf);
const camera = new THREE.PerspectiveCamera(50, W / H, .05, 120);

// ---------- kit ----------
const grad = (() => { const c = document.createElement('canvas'); c.width = 3; c.height = 1; const x = c.getContext('2d'); ['#bdb6b2', '#e0dcd8', '#ffffff'].forEach((col, i) => { x.fillStyle = col; x.fillRect(i, 0, 1, 1); }); const t = new THREE.CanvasTexture(c); t.minFilter = t.magFilter = THREE.NearestFilter; return t; })();
const toon = (color, map) => new THREE.MeshToonMaterial({color: map ? 0xffffff : color, gradientMap: grad, map: map || null});
const lineMat = new THREE.LineBasicMaterial({color: INK});
function ink(m) { m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 30), lineMat)); m.castShadow = true; m.receiveShadow = true; return m; }
let root = scene; const at = (g, fn) => { const p = root; root = g; fn(); root = p; };
function box(w, h, d, color, x, y, z, map) { const m = ink(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(color, map))); m.position.set(x, y, z); root.add(m); return m; }
function cyl(r, h, color, x, y, z, seg = 16, r2) { const m = ink(new THREE.Mesh(new THREE.CylinderGeometry(r, r2 ?? r, h, seg), toon(color))); m.position.set(x, y, z); root.add(m); return m; }
function plane(w, h, map, x, y, z, ry = 0, color = 0xffffff) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon(color, map)); m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; root.add(m); return m; }
function floorP(w, d, map, x, z, y = 0) { const m = plane(w, d, map, x, y, z); m.rotation.x = -Math.PI / 2; return m; }
function paint(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (fn) fn(c.getContext('2d')); t.needsUpdate = true; return t; }
let sd = 11; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
const wear = (x, w, h, n, col) => { for (let i = 0; i < n; i++) { x.fillStyle = col; x.globalAlpha = .06 + rnd() * .07; x.beginPath(); x.ellipse(rnd() * w, rnd() * h, 4 + rnd() * 24, 3 + rnd() * 10, rnd() * 3, 0, 7); x.fill(); } x.globalAlpha = 1; };
const stripes = (a, b, w = 512, h = 512) => paint(w, h, x => { x.fillStyle = a; x.fillRect(0, 0, w, h); x.fillStyle = b; for (let i = 0; i < w; i += 64) x.fillRect(i, 0, 28, h); wear(x, w, h, 10, '#8a7050'); });
const planks = (c1, c2, rep = [3, 3]) => { const t = paint(512, 512, x => { x.fillStyle = c1; x.fillRect(0, 0, 512, 512); x.strokeStyle = c2; x.lineWidth = 3; for (let i = 0; i < 512; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.stroke(); } for (let i = 0; i < 24; i++) { const px = Math.floor(rnd() * 8) * 64, py = rnd() * 512; x.beginPath(); x.moveTo(px, py); x.lineTo(px + 64, py); x.stroke(); } wear(x, 512, 512, 30, '#5a3a1a'); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); return t; };
const tiles = (c1, c2, rep = [3, 3]) => { const t = paint(512, 512, x => { x.fillStyle = c1; x.fillRect(0, 0, 512, 512); x.strokeStyle = c2; x.lineWidth = 3; for (let i = 0; i <= 512; i += 85) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(512, i); x.stroke(); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); return t; };
const sign = (w, h, bg, fg, lines, font = BOLD) => paint(w, h, x => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; lines.forEach(([s, sz, y]) => { x.font = `${sz}px ${font}`; x.fillText(s, w / 2, y); }); });

// ---------- sprites ----------
const loader = new THREE.TextureLoader(), TEX = {};
const tex = n => { if (!TEX[n]) { TEX[n] = loader.load(`sprites/${n}.png`); TEX[n].colorSpace = THREE.SRGBColorSpace; } return TEX[n]; };
(await (await fetch('sprites/list.json')).json()).forEach(tex);
const PEOPLE = [];
function person(name, h, x, z, y = 0) { const t = tex(name), mat = new THREE.MeshBasicMaterial({map: t, transparent: true, alphaTest: .5, side: THREE.DoubleSide});
  const m = new THREE.Mesh(new THREE.PlaneGeometry(h * 640 / 1560, h), mat); m.position.set(x, y + h / 2, z); m.castShadow = true; m.customDepthMaterial = new THREE.MeshDepthMaterial({depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: .5}); root.add(m);
  m.base = y; m.h = h; m.set = n => { const tt = tex(n); if (m.material.map !== tt) { m.material.map = tt; m.customDepthMaterial.map = tt; } };
  const sh = new THREE.Mesh(new THREE.CircleGeometry(h * .14, 24), new THREE.MeshBasicMaterial({color: INK, transparent: true, opacity: .16, depthWrite: false})); sh.rotation.x = -Math.PI / 2; sh.position.set(x, y + .006, z + .02); root.add(sh); m.sh = sh; PEOPLE.push(m); return m; }
const HERO_H = 1.6, ADULT_H = 1.78;

// ================= LOCATIONS =================
const LOC = {}; const mk = (k, x, fog, key) => { const g = new THREE.Group(); g.position.x = x; scene.add(g); LOC[k] = {g, x, fog, key}; return g; };

// ---- PLANE cabin (x=0) ----
let heroPlane, bookPlane;
at(mk('PLANE', 0, 0xdfe6ee, 0xfff4e4), () => {
  const wall = stripes('#eef0f2', '#e2e6ea'); plane(4, 3, wall, 0, 1.5, -1); for (const s of [-1, 1]) plane(10, 3, wall, s * 1.6, 1.5, 3, -s * Math.PI / 2);
  floorP(3.2, 10, tiles('#8a90a8', 'rgba(0,0,0,0.15)', [2, 6]), 0, 3); const ce = plane(3.2, 10, null, 0, 2.4, 3, 0, 0xf6f6f8); ce.rotation.x = Math.PI / 2;
  box(3.2, .3, 10, 0xe8eaee, 0, 2.25, 3); for (const s of [-1, 1]) box(.5, .3, 10, 0xd0d4dc, s * 1.3, 2.0, 3);
  const win = paint(256, 320, x => { const gr = x.createLinearGradient(0, 0, 0, 320); gr.addColorStop(0, '#9fd3ff'); gr.addColorStop(1, '#e8f4ff'); x.fillStyle = gr; x.fillRect(0, 0, 256, 320); x.fillStyle = '#fff'; for (const [a, b, r] of [[60, 120, 40], [100, 110, 50], [160, 200, 44], [200, 190, 34]]) { x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); }
    x.fillStyle = '#8a9a7a'; x.fillRect(0, 270, 256, 50); x.fillStyle = '#c0283a'; x.fillRect(120, 250, 8, 24); x.fillStyle = '#6a7a8a'; x.fillRect(150, 240, 10, 34); });
  for (let z = 0; z < 8; z += 1.6) { const w = box(.06, .7, .5, 0xffffff, 1.56, 1.45, z, win); w.rotation.y = 0; }
  // seats: rows facing the camera (+z)
  for (let r = 0; r < 3; r++) for (const sx of [-.85, -.4, .4, .85]) { const z = r * 1.6; box(.4, .5, .45, 0x3a5aa8, sx, .35, z); box(.4, .75, .12, 0x3a5aa8, sx, .9, z - .2); box(.38, .14, .14, 0xf2f2f2, sx, 1.3, z - .2); }
  heroPlane = person('hero_book_m0', HERO_H, 0, 3.4, 0);
  bookPlane = box(.24, .32, .04, 0x3a6ad0, 0, .9, 3.6, sign(256, 340, '#3a6ad0', '#ffffff', [['ENGLISH', 46, 110], ['5 класс', 40, 180], ['London is', 30, 250], ['the capital…', 30, 290]], BOLD));
  // the seat back in front of the hero hides his legs
  
});

// ---- BORDER booth (UK at x=40, Sheremetyevo at x=200) ----
function booth(signTex, staffSprite, extra) { const fl = tiles('#d8dce4', 'rgba(60,60,90,0.18)', [4, 4]); floorP(12, 12, fl, 0, 3); plane(12, 5, stripes('#e6e8ee', '#dcdfe8'), 0, 2.5, -1.5);
  box(2.0, .32, .06, 0x1f2f55, 0, 2.6, -1.4, signTex);
  box(2.2, 1.1, .7, 0x5a6a80, 0, .55, 0); box(2.3, .06, .8, 0xc9ced6, 0, 1.13, 0); { const gl = box(2.0, .9, .04, 0xbfe0f5, 0, 1.6, -.1); gl.material.transparent = true; gl.material.opacity = .28; gl.castShadow = false; }
  const staff = person(staffSprite, ADULT_H, 0, -.55, 0); box(.5, .03, .35, 0xffffff, .5, 1.17, .1);
  for (const s of [-1, 1]) { cyl(.04, 1, 0xb0b8c4, s * 1.8, .5, 2.2, 10); } const tape = box(3.6, .06, .02, 0x3a5aa8, 0, .95, 2.2);
  return staff; }
let officer, heroUK; at(mk('UK', 40, 0xe6e8ee, 0xfff4e4), () => {
  officer = booth(sign(800, 120, '#1f2f55', '#ffffff', [['UK BORDER', 76, 64]]), 'officer_n_m0');
  heroUK = person('hero_conf_m0', HERO_H, .1, 1.3, 0);
  for (const [i, n] of [[0, 'brit1_n_m0'], [1, 'brit3_n_m0']]) person(n, ADULT_H, -1.3 + i * .6, 3.6 + i * .7, 0); });
let guard, heroRU, granRU; at(mk('RU', 200, 0xe6eee8, 0xfff4e4), () => {
  guard = booth(sign(800, 120, '#2a5a3a', '#ffffff', [['ПАСПОРТНЫЙ КОНТРОЛЬ', 52, 64]]), 'guard_n_m0');
  box(1.6, .33, .06, 0xffffff, -1.9, 2.6, -1.45, sign(600, 120, '#ffffff', '#2a5a3a', [['ШЕРЕМЕТЬЕВО', 64, 62]]));
  heroRU = person('hero_home_m0', HERO_H, .1, 1.3, 0); granRU = person('granny_wave_m0', 1.55, -.9, 3.0, 0); });

// ---- CAFE (x=80): counter + tea corner ----
let barista, heroCafe, queueCafe = [], granTea, heroTea, teapot, cup, clock;
at(mk('CAFE', 80, 0xf2e2c8, 0xffe2b8), () => {
  plane(14, 5, stripes('#f2dcb8', '#e8cea4'), 0, 2.5, -1.5); floorP(14, 12, planks('#c98a4a', 'rgba(90,55,25,0.35)', [4, 4]), 0, 4);
  box(3.6, .92, .8, 0x7a4a2a, 0, .46, 0); box(3.7, .07, .9, 0xe3a25a, 0, .95, 0);
  box(.7, .8, .45, 0xc9ced6, -1.0, 1.52, -.4); box(.22, .25, .02, 0x2b2b33, -1.0, 1.55, -.17); cyl(.08, .12, 0xffffff, -.6, 1.18, .1); cyl(.08, .12, 0xffffff, -.42, 1.18, .1);
  box(2.6, 1.2, .05, 0x2b3a32, .6, 2.6, -1.45, sign(780, 360, '#2b3a32', '#fffaf0', [['COFFEE', 90, 80], ['tea · cake · scones', 50, 190], ['£ 2.50', 60, 290]], HW));
  clock = cyl(.28, .05, 0xffffff, -2.2, 2.9, -1.45, 32); clock.rotation.x = Math.PI / 2; const hand = box(.03, .22, .02, INK, 0, .02, 0); clock.add(hand); hand.position.set(0, .03, -.08); hand.rotation.x = -Math.PI / 2; clock.hand = hand;
  barista = person('barista_n_m0', 1.7, .3, -.5, 0); heroCafe = person('hero_talk_m0', HERO_H, -.6, 1.0, 0);
  queueCafe = [['brit1_n', 1.8], ['brit2_n', 2.5], ['brit4_n', 3.2]].map(([n, z], i) => person(n + '_m0', ADULT_H, -.8 + (i % 2 ? .25 : -.15), z, 0));
  // tea corner on the right (x +4)
  box(1.2, .06, .8, 0xe8dcc8, 4.2, .76, 1.4); cyl(.05, .72, 0x7a5a3a, 4.2, .37, 1.4, 10);
  teapot = cyl(.08, .12, 0xf4f0ff, 4.0, .85, 1.45, 20, .1); const sp = cyl(.015, .1, 0xf4f0ff, 0, 0, 0, 8); teapot.add(sp); sp.position.set(.11, .01, 0); sp.rotation.z = -1.0; const hd = new THREE.Mesh(new THREE.TorusGeometry(.045, .012, 8, 16), toon(0xf4f0ff)); hd.position.set(-.1, 0, 0); teapot.add(hd);
  cup = cyl(.04, .06, 0xffffff, 4.4, .82, 1.6, 16, .03);
  granTea = person('granny_hold_m0', 1.55, 4.0, 1.0, 0); heroTea = person('hero_proud_m0', HERO_H, 4.75, 2.05, 0);
  box(.6, 1.2, .04, 0xffffff, 3.6, 2.4, -1.45, sign(300, 600, '#fff6e0', INKS, [['LONDON', 50, 80], ['☕', 120, 300]], BOLD)); });

// ---- STREET (x=120): houses, bus stop, queue, toilet stairs ----
let granStop, heroStop, queueStop = [], heroStairs;
function house(x, w, h, wall, roof, door) { box(w, h, .5, wall, x, h / 2, -2, paint(256, 512, c => { c.fillStyle = '#' + wall.toString(16).padStart(6, '0'); c.fillRect(0, 0, 256, 512); c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 3; for (let y = 0; y < 512; y += 18) { c.beginPath(); c.moveTo(0, y); c.lineTo(256, y); c.stroke(); } wear(c, 256, 512, 10, '#3a2a2a'); }));
  for (let r = 0; r < Math.floor(h / 1.4); r++) for (let k = 0; k < 2; k++) { const wx = x - w / 4 + k * w / 2, wy = 1.6 + r * 1.4; if (r === 0 && k === 0 && door) continue; box(.62, .9, .1, 0xffffff, wx, wy, -1.72); box(.5, .78, .04, 0x9fc3e8, wx, wy, -1.66); box(.72, .08, .2, 0xffffff, wx, wy - .5, -1.66); }
  if (door) { box(.8, 1.6, .1, door, x - w / 4, .8, -1.72); cyl(.035, .04, 0xd8c060, x - w / 4 + .25, .8, -1.64).rotation.x = Math.PI / 2; }
  box(w + .1, .18, .6, roof, x, h + .09, -2); box(.3, .6, .3, roof, x + w / 3, h + .45, -2); }
at(mk('STREET', 120, 0xe8eef4, 0xfff0d8), () => {
  const sky = plane(30, 14, paint(512, 512, c => { const gr = c.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#bfdcf2'); gr.addColorStop(1, '#f4f0e0'); c.fillStyle = gr; c.fillRect(0, 0, 512, 512); c.fillStyle = 'rgba(255,255,255,0.8)'; for (const [a, b, r] of [[100, 120, 40], [140, 110, 50], [360, 160, 46]]) { c.beginPath(); c.arc(a, b, r, 0, 7); c.fill(); } }), 0, 6, -6); sky.material = new THREE.MeshBasicMaterial({map: sky.material.map});
  house(-4.4, 2.6, 5.2, 0xc86a4a, 0x5a4a5a, 0x2a3a6a); house(-1.7, 2.6, 6.0, 0xe8d8b8, 0x6a5a7a, 0xc0283a); house(1.0, 2.6, 5.4, 0xb8c8a8, 0x4a5a7a, 0x1f5a3a); house(3.7, 2.6, 6.2, 0xd8a878, 0x5a4a5a, 0x2a2a3a);
  floorP(16, 3, tiles('#c9c4d4', 'rgba(60,50,70,0.25)', [8, 2]), 0, -.3, .02); floorP(16, 10, null, 0, 5.5, 0).material.color.set(0x8a8698);
  for (let x = -7; x < 8; x += 1.2) box(.6, .02, .12, 0xffffff, x, .012, 4);
  // bus stop shelter with sign
  box(.06, 2.4, .06, 0x2b2b33, -2.6, 1.2, .9); box(.06, 2.4, .06, 0x2b2b33, -.6, 1.2, .9); box(2.2, .08, 1.0, 0xc0283a, -1.6, 2.42, .5); { const gl = box(2.0, 1.6, .03, 0xcfe6f0, -1.6, 1.4, .05); gl.material.transparent = true; gl.material.opacity = .3; gl.castShadow = false; }
  cyl(.04, 2.6, 0x2b2b33, -3.0, 1.3, 1.4, 10); const bs = box(.6, .6, .04, 0xc0283a, -3.0, 2.55, 1.42, sign(256, 256, '#c0283a', '#ffffff', [['BUS', 70, 100], ['STOP', 60, 170]]));
  // toilet entrance with stairs going up (right)
  box(1.2, .5, .06, 0x1f2f55, 3.0, 2.6, -1.66, sign(500, 200, '#1f2f55', '#ffffff', [['TOILETS ↑', 70, 104]]));
  for (let i = 0; i < 8; i++) box(1.1, .15, .3, 0xb0b0b8, 3.0, .075 + i * .15, -.2 - i * .28 + 1.6);
  for (const s of [-1, 1]) { const rail = box(.05, .05, 2.4, 0x5a5f6a, 3.0 + s * .55, .9 + .55, .4); rail.rotation.x = .48; }
  granStop = person('granny_sweet_m0', 1.55, -2.1, 1.1, 0);
  queueStop = [['brit1', -1.5, 1.6], ['brit2', -.9, 2.0], ['brit3', -.3, 2.4], ['brit4', .3, 2.8], ['brit1', .9, 3.2]].map(([n, x, z]) => { const p = person(`${n}_n_m0`, ADULT_H, x, z, 0); p.who = n; return p; });
  heroStop = person('hero_think_m0', HERO_H, 1.6, 3.0, 0); heroStairs = person('hero_run_m0', HERO_H, 3.0, 1.2, 0); });

// ---- PUB (x=160) ----
let heroPub, crowd = [], pint;
at(mk('PUB', 160, 0x3a2a24, 0xffd8a0), () => {
  plane(14, 5, stripes('#6a2a2a', '#5a2222'), 0, 2.5, -1.8); floorP(14, 12, planks('#7a4a2a', 'rgba(30,15,5,0.4)', [4, 4]), 0, 4);
  box(4.4, 1.1, .8, 0x5a3418, 0, .55, -.6); box(4.5, .08, .9, 0x8a5a2a, 0, 1.12, -.6);
  for (let i = 0; i < 4; i++) { cyl(.04, .36, 0xd8c060, -1.2 + i * .35, 1.32, -.85, 10); }
  box(3.6, .06, .3, 0x5a3418, 0, 1.9, -1.7); box(3.6, .06, .3, 0x5a3418, 0, 2.5, -1.7);
  for (let i = 0; i < 12; i++) cyl(.06, .3, [0x2f8a5a, 0x8a2a2a, 0xc8a040, 0x3a5aa8][i % 4], -1.6 + i * .29, 2.08 + (i % 2) * .6, -1.7, 10);
  box(2.4, .6, .08, 0x1a1208, 0, 3.4, -1.7, sign(800, 200, '#1a1208', '#f0c060', [['THE RED LION', 96, 104]], HW));
  for (const [x, c] of [[-4, 0xffd28a], [4, 0xffd28a]]) { const l = cyl(.18, .3, c, x, 3.2, -1.6, 16, .1); }
  heroPub = person('hero_cheers_m0', HERO_H, .3, .35, 0);
  pint = cyl(.055, .17, 0xe8b040, .52, 1.25, .4, 16, .045); cyl(.056, .03, 0xfffaf0, .52, 1.35, .4, 16);
  crowd = [['brit1', -1.6, .6], ['brit2', -1.0, 1.4], ['brit3', 1.3, 1.2], ['brit4', 1.9, .5], ['brit2', -2.2, 1.8]].map(([n, x, z]) => { const p = person(`${n}_n_m0`, ADULT_H, x, z, 0); p.who = n; return p; }); });

// ---------- light ----------
const hemi = new THREE.HemisphereLight(0xfff3e0, 0xb89070, 1.2); scene.add(hemi);
const key = new THREE.DirectionalLight(0xffe2b8, 1.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, {left: -8, right: 8, top: 8, bottom: -3, near: 1, far: 40}); key.shadow.radius = 4; key.shadow.bias = -.0008; scene.add(key); scene.add(key.target);

// ---------- shots: [location, from [pos, look], to [pos, look]] ----------
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const SHOT = {
  PLANE: ['PLANE', [V(0, 1.4, 6.2), V(0, 1.1, 3.3)], [V(0, 1.38, 5.8), V(0, 1.1, 3.3)]],
  PASS_OFF: ['UK', [V(.2, 1.6, 4.0), V(0, 1.75, -.5)], [V(.2, 1.6, 3.7), V(0, 1.75, -.5)]],
  PASS_HERO: ['UK', [V(.3, 1.3, 4.6), V(.1, 1.05, 1.3)], [V(.3, 1.3, 4.3), V(.1, 1.05, 1.3)]],
  PASS_OFF2: ['UK', [V(-.2, 1.6, 3.0), V(0, 1.6, -.5)], [V(-.2, 1.6, 2.8), V(0, 1.6, -.5)]],
  CAFE_BAR: ['CAFE', [V(.8, 1.6, 3.0), V(.3, 1.35, -.5)], [V(.75, 1.6, 2.75), V(.3, 1.35, -.5)]],
  CAFE_TALK: ['CAFE', [V(.5, 1.35, 3.0), V(-.6, 1.1, 1.0)], [V(.45, 1.35, 2.75), V(-.6, 1.1, 1.0)]],
  CAFE_QUEUE: ['CAFE', [V(1.8, 1.5, 5.4), V(-.6, 1.15, 2.2)], [V(1.7, 1.5, 5.1), V(-.6, 1.15, 2.2)]],
  STOP_GRAN: ['STREET', [V(-1.8, 1.35, 4.4), V(-2.0, 1.15, 1.1)], [V(-1.8, 1.35, 4.0), V(-2.0, 1.15, 1.1)]],
  STOP_HERO: ['STREET', [V(1.3, 1.35, 6.0), V(1.5, 1.05, 3.0)], [V(1.3, 1.35, 5.6), V(1.5, 1.05, 3.0)]],
  STOP_CUT: ['STREET', [V(-.3, 2.2, 8.6), V(-.5, 1.2, 1.5)], [V(-.3, 2.1, 8.2), V(-.5, 1.2, 1.5)]],
  STOP_STARE: ['STREET', [V(-.4, 1.6, 6.8), V(-.6, 1.4, 2.0)], [V(-.4, 1.6, 6.5), V(-.6, 1.4, 2.0)]],
  STREET_DANCE: ['STREET', [V(1.6, 1.3, 5.6), V(1.6, 1.0, 3.0)], [V(1.6, 1.3, 5.4), V(1.6, 1.0, 3.0)]],
  STOP_GRAN2: ['STREET', [V(-2.0, 1.3, 3.5), V(-2.1, 1.2, 1.1)], [V(-2.0, 1.3, 3.3), V(-2.1, 1.2, 1.1)]],
  HERO_SHOCK: ['STREET', [V(1.6, 1.32, 4.9), V(1.6, 1.2, 3.0)], [V(1.6, 1.32, 4.7), V(1.6, 1.2, 3.0)]],
  STAIRS: ['STREET', [V(2.2, 1.7, 4.6), V(3.0, 1.5, .4)], [V(2.3, 1.8, 4.3), V(3.0, 1.7, .2)]],
  TEA_GRAN: ['CAFE', [V(4.3, 1.35, 4.0), V(4.1, 1.05, 1.0)], [V(4.3, 1.35, 3.7), V(4.1, 1.05, 1.0)]],
  TEA_HERO: ['CAFE', [V(4.0, 1.3, 5.2), V(4.7, 1.05, 2.0)], [V(4.0, 1.3, 4.9), V(4.7, 1.05, 2.0)]],
  TEA_POUR: ['CAFE', [V(4.3, 1.5, 3.4), V(4.2, .95, 1.3)], [V(4.3, 1.45, 3.2), V(4.2, .95, 1.3)]],
  PUB_BAR: ['PUB', [V(.3, 1.35, 3.4), V(.3, 1.1, 0)], [V(.3, 1.35, 3.1), V(.3, 1.1, 0)]],
  PUB_CROWD: ['PUB', [V(0, 1.6, 6.6), V(0, 1.2, 0)], [V(0, 1.6, 6.0), V(0, 1.2, 0)]],
  SVO_WIDE: ['RU', [V(-.5, 1.6, 6.6), V(-.6, 1.6, -1)], [V(-.5, 1.6, 6.2), V(-.6, 1.6, -1)]],
  SVO_HERO: ['RU', [V(.3, 1.3, 4.4), V(.1, 1.05, 1.3)], [V(.3, 1.3, 4.2), V(.1, 1.05, 1.3)]],
  SVO_GUARD: ['RU', [V(-.1, 1.6, 3.0), V(0, 1.6, -.5)], [V(-.1, 1.6, 2.8), V(0, 1.6, -.5)]],
  SVO_GRAN: ['RU', [V(-.4, 1.35, 5.4), V(-.7, 1.05, 2.5)], [V(-.4, 1.35, 5.1), V(-.7, 1.05, 2.5)]],
  END: ['PUB', [V(.3, 1.35, 3.4), V(.3, 1.1, 0)], [V(.3, 1.35, 3.4), V(.3, 1.1, 0)]],
};
const SH = TL.SH.map(([at, kind], i) => ({at, end: i + 1 < TL.SH.length ? TL.SH[i + 1][0] : TL.TOTAL, kind, def: SHOT[kind], i}));
SH.forEach((s, i) => { s.dip = i > 0 && SH[i - 1].def[0] !== s.def[0]; });
function warpU(T, t) { const n = T.length; if (t <= T[0]) return 0; if (t >= T[n - 1]) return 1; const sec = []; for (let i = 0; i < n - 1; i++) sec.push((1 / (n - 1)) / (T[i + 1] - T[i]));
  const m = [0]; for (let i = 1; i < n - 1; i++) m.push(2 * sec[i - 1] * sec[i] / (sec[i - 1] + sec[i])); m.push(0); let i = 0; while (t > T[i + 1]) i++;
  const h = T[i + 1] - T[i], x = (t - T[i]) / h, x2 = x * x, x3 = x2 * x; return (2 * x3 - 3 * x2 + 1) * (i / (n - 1)) + (x3 - 2 * x2 + x) * h * m[i] + (-2 * x3 + 3 * x2) * ((i + 1) / (n - 1)) + (x3 - x2) * h * m[i + 1]; }

// ---------- performance ----------
const L = TL.lines, inW = (t, a, b) => t >= a && t < b;
const talk = (ids, t) => { for (const id of ids) { const l = L[id]; if (l && t >= l.at && t < l.end) { const i = Math.floor((t - l.at) * 30); return ((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2; } } return 0; };
const mf = v => v > .55 ? 2 : v > .15 ? 1 : 0;
const ids = who => Object.keys(L).filter(k => L[k].who === who);
const meterAt = t => { let v = 100; for (const [a, b] of TL.METER) if (t >= a) v = b; return v; };

// ---------- HUD ----------
function rrect(x, y, w, h, r, fill, stroke = INKS, lw = 6) { og.beginPath(); og.roundRect(x, y, w, h, r); og.fillStyle = fill; og.fill(); if (stroke) { og.strokeStyle = stroke; og.lineWidth = lw; og.stroke(); } }
function outlined(s, x, y, size, fill, font = BOLD, max = 980) { og.font = `${size}px ${font}`; let f = size; while (og.measureText(s).width > max && f > 34) { f -= 4; og.font = `${f}px ${font}`; } og.textAlign = 'center'; og.textBaseline = 'middle'; og.lineJoin = 'round'; og.lineWidth = f * .24; og.strokeStyle = '#000'; og.strokeText(s, x, y); og.fillStyle = fill; og.fillText(s, x, y); }
function hud(t, k) {
  if (k === 'END') return;
  // meter (top right)
  const v = meterAt(t), shown = v > 100 ? 200 : v; rrect(560, 70, 470, 96, 22, 'rgba(255,250,240,0.95)');
  og.font = `30px ${BOLD}`; og.fillStyle = INKS; og.textAlign = 'left'; og.textBaseline = 'middle'; og.fillText('Школьный английский', 584, 100);
  const bw = 300, fillW = Math.min(1, shown / 100) * bw; rrect(584, 124, bw, 26, 13, '#e8e0d0', INKS, 4); rrect(584, 124, Math.max(26, fillW), 26, 13, v > 100 ? '#2f9a5a' : v > 40 ? '#f0b030' : '#e05040', null);
  og.font = `34px ${BOLD}`; og.fillText(`${shown}%`, 900, 138);
  // word card (top centre, under the meter)
  for (const [a, b, w, m] of TL.CARDS) { if (!inW(t, a, b)) continue; const k2 = Math.min(1, (t - a) / .2, (b - t) / .2); og.save(); og.globalAlpha = Math.max(0, k2); og.translate(540, 290); og.scale(.9 + .1 * k2, .9 + .1 * k2);
    rrect(-440, -90, 880, 180, 30, '#fffaf0', INKS, 7); og.font = `74px ${BOLD}`; og.fillStyle = '#c0283a'; og.textAlign = 'center'; og.fillText(w, 0, -30); og.font = `42px ${BOLD}`; og.fillStyle = INKS; og.fillText(m, 0, 44); og.restore(); }
}
function captions(t) { let cur = null; for (const id in L) { const l = L[id]; if (id !== 'n11' && inW(t, l.at, l.end + .2) && (!cur || l.at > L[cur].at)) cur = id; } if (!cur) return;
  const l = L[cur]; let c = l.ch[0]; for (const q of l.ch) if (t - l.at >= q.s - .03) c = q; const en = /[A-Za-z]/.test(c.txt) && !/[а-яё]/i.test(c.txt), pop = 1 + .08 * Math.max(0, 1 - (t - l.at - c.s) / .1);
  og.save(); og.translate(540, 1560); og.scale(pop, pop); outlined(c.txt, 0, 0, 74, en ? '#ffd23f' : '#ffffff'); og.restore(); if (TL.TR[cur] && en) outlined(TL.TR[cur], 540, 1644, 46, '#bfe9ff'); }
function endCard(t) { const a = TL.lines.n11.at - .2, k = Math.min(1, (t - a) / .35); og.fillStyle = `rgba(30,20,20,${.55 * k})`; og.fillRect(0, 0, W, H); og.save(); og.globalAlpha = k;
  rrect(70, 250, 940, 1360, 46, '#fffaf0', INKS, 8); og.textAlign = 'center'; og.textBaseline = 'middle'; og.font = `62px ${BOLD}`; og.fillStyle = '#c0283a'; og.fillText('ПЕРВЫЙ ДЕНЬ В ЛОНДОНЕ', 540, 350);
  const rows = [['Cheers', 'спасибо / пока'], ['Alright?', 'привет · ответ: Yeah, you?'], ['Queue', 'очередь · «кью»'], ['Loo', 'туалет'], ['Fancy a…?', 'хочешь…?'], ['Love', 'бонус: «дорогуша»']];
  rows.forEach(([e, r], i) => { const q = Math.min(1, Math.max(0, (t - a - .2 - i * .12) / .25)); og.globalAlpha = k * q; og.font = `66px ${BOLD}`; og.fillStyle = '#1f3a8a'; og.fillText(e, 540, 480 + i * 170); og.font = `40px ${BOLD}`; og.fillStyle = '#555'; og.fillText(r, 540, 540 + i * 170); });
  og.globalAlpha = k; og.font = `44px ${BOLD}`; og.fillStyle = INKS; og.fillText('Какое слово сломало бы тебя первым?', 540, 1500, 900); og.restore(); }

// ---------- frame ----------
const CAMV = new THREE.Vector3();
window.renderAt = t => {
  let sh = SH[0]; for (const s of SH) if (t >= s.at) sh = s; const k = sh.kind, d = sh.def, loc = LOC[d[0]];
  const dur = sh.end - sh.at, amt = sh.i % 3 === 2 ? 0 : .5, u = amt * warpU([sh.at, sh.at + dur / 2, sh.at + dur], t);
  const pos = new THREE.Vector3().lerpVectors(d[1][0], d[2][0], u), look = new THREE.Vector3().lerpVectors(d[1][1], d[2][1], u); pos.x += loc.x; look.x += loc.x;
  camera.position.copy(pos); camera.lookAt(look); scene.fog.color.set(loc.fog); scene.background.set(loc.fog); key.color.set(loc.key); key.position.set(loc.x - 5, 7, 9); key.target.position.set(loc.x, 0, 1);
  hemi.intensity = d[0] === 'PUB' ? .9 : 1.2;
  const S2 = (m, name) => m.set(name);
  // hero by location
  const hm = mf(talk(ids('hero'), t));
  S2(heroPlane, `hero_book_m0`);
  S2(heroUK, k === 'PASS_HERO' ? 'hero_conf_m0' : 'hero_think_m0'); heroUK.visible = k === 'PASS_HERO'; heroUK.sh.visible = heroUK.visible;
  S2(officer, `officer_${k === 'PASS_OFF2' ? 'look' : 'n'}_m${mf(talk(['o1'], t))}`); if (k === 'PASS_OFF2') officer.position.x = Math.sin(t * 3) * .12; else officer.position.x = 0;
  S2(barista, `barista_${inW(t, L.b2.at - .3, 99) ? 'awk' : 'n'}_m${mf(talk(['b1', 'b2'], t))}`); S2(heroCafe, `hero_talk_m${k === 'CAFE_TALK' ? (Math.floor(t * 8) % 3) : 0}`);
  const old = k === 'CAFE_QUEUE' ? Math.min(1, (t - sh.at) / 1.2) : 0; queueCafe.forEach((p, i) => { p.set(`${['brit1', 'brit2', 'brit4'][i]}_n_m0`); p.scale.y = 1 - old * .06; });
  if (clock) clock.hand.rotation.y = k === 'CAFE_QUEUE' ? t * 25 : t * .2;
  S2(granStop, `granny_sweet_m${mf(talk(['g1', 'g2'], t))}`);
  const glare = k === 'STOP_STARE' || (k === 'STOP_CUT' && t > sh.at + .6);
  queueStop.forEach((p, i) => { p.set(`${p.who}_${glare ? 'glare' : 'n'}_m0`); });
  S2(heroStop, k === 'STREET_DANCE' ? `hero_dance_m${hm}` : k === 'HERO_SHOCK' ? 'hero_shock_m0' : k === 'STOP_STARE' ? 'hero_stare_m0' : 'hero_think_m0');
  heroStop.position.y = HERO_H / 2 + (k === 'STREET_DANCE' ? Math.abs(Math.sin(t * 12)) * .06 : 0); heroStop.visible = k !== 'STAIRS';
  // stop cut: a Brit slides into the queue ahead of the hero
  const cutK = k === 'STOP_CUT' ? Math.min(1, (t - sh.at) / .6) : (sh.i > SH.findIndex(s => s.kind === 'STOP_CUT') ? 1 : 0); queueStop[4].position.x = .9 + (1.9 - .9) * (1 - cutK) - .0; queueStop[4].position.z = 3.2 - .0;
  heroStairs.visible = k === 'STAIRS'; if (heroStairs.visible) { const q = Math.min(1, (t - sh.at) / (dur * .9)); heroStairs.position.set(3.0, q * 1.2 + HERO_H / 2, 1.6 - q * 1.9); heroStairs.set(`hero_run_m${Math.floor(t * 10) % 2}`); }
  S2(granTea, `granny_hold_m${mf(talk(['g3'], t))}`); S2(heroTea, `hero_proud_m${hm}`);
  if (teapot) teapot.rotation.z = k === 'TEA_POUR' ? -.5 * Math.min(1, (t - sh.at) / .6) : 0;
  S2(heroPub, `hero_cheers_m${hm}`); crowd.forEach((p, i) => { const ch = inW(t, L.p1.at - .1, 99); p.set(`${p.who}_${ch ? 'cheer' : 'n'}_m${ch ? 1 : 0}`); p.position.y = p.base + p.h / 2 + (ch ? Math.abs(Math.sin(t * 9 + i)) * .07 : 0); });
  S2(guard, `guard_${k === 'SVO_GUARD' ? 'look' : 'n'}_m0`); if (k === 'SVO_GUARD') guard.position.x = Math.sin(t * 3) * .12; else guard.position.x = 0;
  S2(heroRU, `hero_home_m${hm}`); heroRU.visible = k !== 'SVO_GUARD'; heroRU.sh.visible = heroRU.visible; S2(granRU, `granny_wave_m${mf(talk(['g4'], t))}`);
  // characters face the camera (yaw clamp 0.7 rad) + idle bob
  PEOPLE.forEach((m, i) => { const wp = new THREE.Vector3(); m.getWorldPosition(wp); m.rotation.y = Math.max(-.7, Math.min(.7, Math.atan2(camera.position.x - wp.x, camera.position.z - wp.z)));
    if (m !== heroStop && m !== heroStairs && !crowd.includes(m)) m.position.y = m.base + m.h / 2 + Math.abs(Math.sin(t * 2 + i)) * .006; });
  renderer.render(scene, camera);
  og.setTransform(1, 0, 0, 1, 0, 0); og.drawImage(renderer.domElement, 0, 0);
  const v = og.createRadialGradient(W / 2, H * .45, 650, W / 2, H * .45, 1250); v.addColorStop(0, 'rgba(40,20,30,0)'); v.addColorStop(1, 'rgba(40,20,30,0.18)'); og.fillStyle = v; og.fillRect(0, 0, W, H);
  if (sh.dip && t - sh.at < .25) { og.fillStyle = `rgba(246,236,214,${1 - (t - sh.at) / .25})`; og.fillRect(0, 0, W, H); }
  const nx = SH[sh.i + 1]; if (nx && nx.dip && nx.at - t < .15) { og.fillStyle = `rgba(246,236,214,${1 - (nx.at - t) / .15})`; og.fillRect(0, 0, W, H); }
  if (!window.NOCAP) { hud(t, k); if (k === 'END') endCard(t); else captions(t); }
  return true; };
window.TOTAL = TL.TOTAL;
window.ready = new Promise(r => { let done = false; THREE.DefaultLoadingManager.onLoad = () => { if (!done) { done = true; setTimeout(() => r(true), 300); } }; setTimeout(() => r(true), 8000); });
