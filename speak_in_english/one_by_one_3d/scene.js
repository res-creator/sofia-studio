// 3D classroom (house style from the 3D skill): painted flat-colour models with ink outlines, toon shading,
// one warm key light from the upper left, 2D cartoon characters standing inside the world, slow eased camera push.
import * as THREE from './node_modules/three/build/three.module.js';
const W = 1080, H = 1920, INK = 0x351f22;
const renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
renderer.setSize(W, H); renderer.setPixelRatio(1); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0xf1e2bf); scene.fog = new THREE.Fog(0xf1e2bf, 14, 30);
const camera = new THREE.PerspectiveCamera(50, W / H, .05, 60);

// ---------- toon material + ink ----------
const grad = (() => { const c = document.createElement('canvas'); c.width = 3; c.height = 1; const x = c.getContext('2d'); ['#b8b8b8', '#dcdcdc', '#ffffff'].forEach((col, i) => { x.fillStyle = col; x.fillRect(i, 0, 1, 1); });
  const t = new THREE.CanvasTexture(c); t.minFilter = t.magFilter = THREE.NearestFilter; return t; })();
const toon = (color, map) => new THREE.MeshToonMaterial({color, gradientMap: grad, map: map || null});
const inkHull = new THREE.MeshBasicMaterial({color: INK, side: THREE.BackSide});
function ink(mesh, k = .012) { // inverted hull + edge lines
  const hull = new THREE.Mesh(mesh.geometry, inkHull); hull.scale.setScalar(1); hull.onBeforeRender = () => {};
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 30), new THREE.LineBasicMaterial({color: INK}));
  mesh.add(e); mesh.castShadow = true; mesh.receiveShadow = true; return mesh; }
function box(w, h, d, color, x, y, z, map) { const m = ink(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(color, map))); m.position.set(x, y, z); scene.add(m); return m; }
function cyl(r, h, color, x, y, z, seg = 16) { const m = ink(new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), toon(color))); m.position.set(x, y, z); scene.add(m); return m; }
function paint(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
const wear = (x, w, h, n, col) => { for (let i = 0; i < n; i++) { x.fillStyle = col; x.globalAlpha = .08 + Math.random() * .08; x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 4 + Math.random() * 30, 3 + Math.random() * 14, Math.random() * 3, 0, 7); x.fill(); } x.globalAlpha = 1; };

// ---------- room (front of the class at z=0, camera looks toward -z) ----------
const RW = 9, RH = 5.4;
const wallTex = paint(1024, 512, x => { x.fillStyle = '#f2e3c0'; x.fillRect(0, 0, 1024, 512); x.fillStyle = '#e8d4a8'; for (let i = 0; i < 1024; i += 64) x.fillRect(i, 0, 28, 512);
  x.fillStyle = '#8fb9a4'; x.fillRect(0, 370, 1024, 142); x.fillStyle = '#7aa892'; x.fillRect(0, 370, 1024, 10); x.fillStyle = '#e2cfa4'; x.fillRect(0, 20, 1024, 10); wear(x, 1024, 512, 12, '#b89a70'); });
const back = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), toon(0xffffff, wallTex)); back.position.set(0, RH / 2, 0); back.receiveShadow = true; scene.add(back);
for (const s of [-1, 1]) { const side = new THREE.Mesh(new THREE.PlaneGeometry(14, RH), toon(0xffffff, wallTex)); side.rotation.y = -s * Math.PI / 2; side.position.set(s * RW / 2, RH / 2, 7); side.receiveShadow = true; scene.add(side); }
const floorTex = paint(1024, 1024, x => { x.fillStyle = '#d9a46c'; x.fillRect(0, 0, 1024, 1024); x.strokeStyle = 'rgba(120,70,30,0.45)'; x.lineWidth = 3; for (let i = 0; i < 1024; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 1024); x.stroke(); }
  for (let i = 0; i < 40; i++) { const px = Math.floor(Math.random() * 16) * 64, py = Math.random() * 1024; x.beginPath(); x.moveTo(px, py); x.lineTo(px + 64, py); x.stroke(); } wear(x, 1024, 1024, 80, '#9a6a3a'); });
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(3, 4);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, 16), toon(0xffffff, floorTex)); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 7); floor.receiveShadow = true; scene.add(floor);
const ceil = new THREE.Mesh(new THREE.PlaneGeometry(RW, 16), toon(0xfbf4e4)); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, RH, 7); scene.add(ceil);
// skirting + chair rail
box(RW, .12, .04, 0x9a6a3a, 0, .06, .02);

// chalkboard: frame, slate with chalk writing, ledge
const boardTex = paint(1024, 560, x => { x.fillStyle = '#355f50'; x.fillRect(0, 0, 1024, 560); x.globalAlpha = .1; x.fillStyle = '#fff'; for (const [a, b, c] of [[260, 140, 220], [640, 380, 260], [420, 470, 320]]) { x.beginPath(); x.ellipse(a, b, c, 40, 0, 0, 7); x.fill(); } x.globalAlpha = 1;
  x.fillStyle = '#eef3e8'; x.font = '64px Neucha, cursive'; x.textAlign = 'center'; x.fillText('21 ноября', 512, 140); x.fillText('Classwork', 512, 230); x.textAlign = 'left'; x.fillText('Reading, p. 42', 110, 360); });
box(3.9, 2.0, .08, 0x9a6a3a, -1.4, 2.0, .05); box(3.7, 1.8, .06, 0xffffff, -1.4, 2.0, .1, boardTex); box(3.8, .06, .16, 0x8a5a2e, -1.4, 1.06, .14); box(.22, .05, .05, 0xffffff, -2.6, 1.11, .16);
// clock
cyl(.26, .06, 0xffffff, -1.4, 3.35, .05, 32).rotation.x = Math.PI / 2;
const hand1 = box(.03, .17, .02, 0x351f22, -1.4, 3.41, .1); const hand2 = box(.12, .03, .02, 0x351f22, -1.35, 3.35, .1);
// door with panels, frame and lever handle
box(1.16, 2.3, .1, 0x9a6a3a, 3.2, 1.15, .05); const door = box(1.0, 2.18, .08, 0xc98f55, 3.2, 1.1, .1);
box(.7, .8, .03, 0xc28650, 3.2, 1.62, .15); box(.7, .8, .03, 0xc28650, 3.2, .62, .15); cyl(.05, .04, 0xd8d8de, 2.82, 1.1, .17).rotation.x = Math.PI / 2; box(.22, .04, .04, 0xd8d8de, 2.92, 1.1, .2);
// window on the left wall with a painted tree outside
const winTex = paint(512, 640, x => { x.fillStyle = '#cfe6f0'; x.fillRect(0, 0, 512, 640); x.fillStyle = '#9ccc6a'; for (const [a, b, r] of [[200, 330, 150], [330, 300, 130], [260, 200, 120]]) { x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); } x.fillStyle = '#7a5a3a'; x.fillRect(250, 420, 30, 220); });
const win = box(.08, 1.6, 1.3, 0xffffff, -RW / 2 + .05, 2.0, 4.2); const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.4), new THREE.MeshBasicMaterial({map: winTex})); glass.rotation.y = Math.PI / 2; glass.position.set(-RW / 2 + .1, 2.0, 4.2); scene.add(glass);
box(.06, 1.5, .05, 0xffffff, -RW / 2 + .12, 2.0, 4.2); box(.06, .05, 1.2, 0xffffff, -RW / 2 + .12, 2.0, 4.2); box(.2, .05, 1.4, 0xffffff, -RW / 2 + .15, 1.18, 4.2);

// teacher's desk with props
box(2.0, .08, .9, 0xd39a5c, -.9, .78, 1.3); box(1.9, .7, .06, 0xb07a42, -.9, .4, 1.72); for (const sx of [-1, 1]) box(.06, .74, .8, 0xb07a42, -.9 + sx * .9, .37, 1.3);
box(.34, .07, .25, 0xe05a3a, -1.55, .855, 1.25); box(.3, .07, .23, 0xf0b030, -1.53, .925, 1.25); box(.32, .07, .24, 0x3a6ad0, -1.56, .995, 1.25);
cyl(.09, .16, 0xc8664a, -1.15, .9, 1.2); for (let i = -2; i <= 2; i++) { const l = ink(new THREE.Mesh(new THREE.SphereGeometry(.05, 10, 8), toon(0x4cae6a))); l.scale.set(.8, 3.2, .8); l.position.set(-1.15 + i * .04, 1.12, 1.2); l.rotation.z = i * .3; scene.add(l); }
cyl(.012, .2, 0x351f22, -.15, .9, 1.25); const globe = ink(new THREE.Mesh(new THREE.SphereGeometry(.15, 24, 16), toon(0x4ab0e0, paint(256, 128, x => { x.fillStyle = '#4ab0e0'; x.fillRect(0, 0, 256, 128); x.fillStyle = '#7ac070'; for (const [a, b, r] of [[50, 50, 26], [130, 70, 34], [200, 40, 20]]) { x.beginPath(); x.ellipse(a, b, r, r * .7, 0, 0, 7); x.fill(); } }))));
globe.position.set(-.15, 1.13, 1.25); scene.add(globe);
box(.5, .04, .34, 0xffffff, -.65, .84, 1.3);

// student desks (top + front panel + metal legs) and chairs
function studentDesk(x, z) { box(1.3, .05, .55, 0xe6b47a, x, .74, z); box(1.26, .35, .04, 0xb07a42, x, .55, z - .25);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(.022, .72, 0x5a5f6a, x + sx * .58, .36, z + sz * .22, 8); }
function chair(x, z) { box(.44, .04, .4, 0xa8703c, x, .45, z); box(.44, .3, .04, 0xa8703c, x, .72, z + .2); for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(.016, .45, 0x8a8f9a, x + sx * .18, .225, z + sz * .17, 8); }
const rows = [[3.0, [-1.6, 1.6]], [3.9, [-1.3, 2.4]], [5.5, [-2.4, 1.3]]];
rows.forEach(([z, xs]) => xs.forEach(x => { studentDesk(x, z); chair(x - .3, z + .45); chair(x + .3, z + .45); }));

// ---------- 2D characters inside the world ----------
const loader = new THREE.TextureLoader();
function sprite(file, heightM, x, z, yBase = 0, aspect) { const t = loader.load(file); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(heightM * aspect, heightM), new THREE.MeshBasicMaterial({map: t, transparent: true, alphaTest: .5, side: THREE.DoubleSide}));
  m.position.set(x, yBase + heightM / 2, z); m.castShadow = true; m.customDepthMaterial = new THREE.MeshDepthMaterial({depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: .5}); scene.add(m);
  const sh = new THREE.Mesh(new THREE.CircleGeometry(heightM * aspect * .38, 24), new THREE.MeshBasicMaterial({color: 0x351f22, transparent: true, opacity: .18})); sh.rotation.x = -Math.PI / 2; sh.position.set(x, .005, z + .02); scene.add(sh); return m; }
const teacher = sprite('sprites/teacher.png', 1.68, .7, 1.95, 0, 640 / 1440);
const students = [['back_lena', -1.3, 3.5], ['back_sasha', 1.95, 3.5], ['back_vova', -1.0, 4.4], ['back_hero', 1.0, 6.0]].map(([f, x, z]) => sprite(`sprites/${f}.png`, 1.15, x, z + .32, .36, 420 / 620));

// ---------- light ----------
scene.add(new THREE.HemisphereLight(0xfff3e0, 0xb89070, 1.25));
const key = new THREE.DirectionalLight(0xffe2b8, 1.6); key.position.set(-5, 7, 8); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, {left: -6, right: 6, top: 6, bottom: -2, near: 1, far: 30}); key.shadow.radius = 4; key.shadow.bias = -.0008; scene.add(key);

// ---------- camera: eased push with a monotone cubic time warp (from the skill) ----------
function warpU(T, t) { const n = T.length; if (t <= T[0]) return 0; if (t >= T[n - 1]) return 1;
  const sec = []; for (let i = 0; i < n - 1; i++) sec.push((1 / (n - 1)) / (T[i + 1] - T[i]));
  const m = [0]; for (let i = 1; i < n - 1; i++) m.push(2 * sec[i - 1] * sec[i] / (sec[i - 1] + sec[i])); m.push(0);
  let i = 0; while (t > T[i + 1]) i++; const h = T[i + 1] - T[i], x = (t - T[i]) / h, x2 = x * x, x3 = x2 * x;
  return (2 * x3 - 3 * x2 + 1) * (i / (n - 1)) + (x3 - 2 * x2 + x) * h * m[i] + (-2 * x3 + 3 * x2) * ((i + 1) / (n - 1)) + (x3 - x2) * h * m[i + 1]; }
const PATH = [[new THREE.Vector3(.5, 1.55, 9.3), new THREE.Vector3(.1, 1.25, 0)], [new THREE.Vector3(.45, 1.5, 8.6), new THREE.Vector3(.25, 1.22, 0)], [new THREE.Vector3(.4, 1.45, 8.1), new THREE.Vector3(.4, 1.2, 0)]];
const BEATS = [0, 2.5, 5];
window.renderAt = t => { const u = warpU(BEATS, t) * (PATH.length - 1), i = Math.min(PATH.length - 2, Math.floor(u)), k = u - i;
  camera.position.lerpVectors(PATH[i][0], PATH[i + 1][0], k); const look = new THREE.Vector3().lerpVectors(PATH[i][1], PATH[i + 1][1], k); camera.lookAt(look);
  teacher.material.map = loader.cache?.[0] || teacher.material.map; teacher.position.y = 1.68 / 2 + Math.abs(Math.sin(t * 2.2)) * .01;
  students.forEach((s, j) => { s.position.y = .36 + 1.15 / 2 + Math.sin(t * 1.6 + j) * .006; });
  hand2.rotation.z = -t * .05; renderer.render(scene, camera); return true; };
window.ready = new Promise(r => { THREE.DefaultLoadingManager.onLoad = () => r(true); setTimeout(() => r(true), 4000); });
