// «Читаем по цепочке» in the 3D house style (skill animated-3d-story-video, adapted to our cast and approved script):
// procedural 3D locations with ink outlines + toon shading, 2D cartoon characters standing inside, camera always moving with eased pushes,
// labels painted inside the world (board, signs, desk tents, paper), 0.25 s cream dip at location changes. Lower-third captions kept (owner's rule for the channel).
import * as THREE from './node_modules/three/build/three.module.js';
const TL = await (await fetch('timeline.json')).json();
const W = 1080, H = 1920, INK = 0x351f22, INKS = '#351f22';
const renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
renderer.setSize(W, H); renderer.setPixelRatio(1); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace;
const out = document.createElement('canvas'); out.width = W; out.height = H; const og = out.getContext('2d'); document.body.appendChild(out);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0xf1e2bf); scene.fog = new THREE.Fog(0xf1e2bf, 16, 40);
const camera = new THREE.PerspectiveCamera(50, W / H, .05, 80);

// ---------------- kit ----------------
const grad = (() => { const c = document.createElement('canvas'); c.width = 3; c.height = 1; const x = c.getContext('2d'); ['#bdb6b2', '#e0dcd8', '#ffffff'].forEach((col, i) => { x.fillStyle = col; x.fillRect(i, 0, 1, 1); }); const t = new THREE.CanvasTexture(c); t.minFilter = t.magFilter = THREE.NearestFilter; return t; })();
const toon = (color, map) => new THREE.MeshToonMaterial({color, gradientMap: grad, map: map || null});
const lineMat = new THREE.LineBasicMaterial({color: INK});
function ink(m) { m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 30), lineMat)); m.castShadow = true; m.receiveShadow = true; return m; }
const G = new THREE.Group(); scene.add(G); let root = G;
function at(group, fn) { const prev = root; root = group; fn(); root = prev; }
function box(w, h, d, color, x, y, z, map) { const m = ink(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(map ? 0xffffff : color, map))); m.position.set(x, y, z); root.add(m); return m; }
function cyl(r, h, color, x, y, z, seg = 16) { const m = ink(new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), toon(color))); m.position.set(x, y, z); root.add(m); return m; }
function plane(w, h, map, x, y, z, ry = 0, basic = false) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic ? new THREE.MeshBasicMaterial({map, transparent: true}) : toon(0xffffff, map)); m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; root.add(m); return m; }
function paint(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.redraw = f => { f(c.getContext('2d'), c); t.needsUpdate = true; }; if (fn) t.redraw(fn); return t; }
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const wear = (x, w, h, n, col) => { for (let i = 0; i < n; i++) { x.fillStyle = col; x.globalAlpha = .06 + rnd() * .07; x.beginPath(); x.ellipse(rnd() * w, rnd() * h, 4 + rnd() * 26, 3 + rnd() * 12, rnd() * 3, 0, 7); x.fill(); } x.globalAlpha = 1; };
const HW = '"Neucha", cursive', BOLD = '"NunitoB", sans-serif';

// ---------------- sprites (2D characters) ----------------
const loader = new THREE.TextureLoader(), TEX = {};
const tex = n => { if (!TEX[n]) { TEX[n] = loader.load(`sprites/${n}.png`); TEX[n].colorSpace = THREE.SRGBColorSpace; } return TEX[n]; };
function sprite(name, h, aspect, x, y, z, shadow = true) { const t = tex(name), mat = new THREE.MeshBasicMaterial({map: t, transparent: true, alphaTest: .5, side: THREE.DoubleSide});
  const m = new THREE.Mesh(new THREE.PlaneGeometry(h * aspect, h), mat); m.position.set(x, y + h / 2, z); m.castShadow = true; m.customDepthMaterial = new THREE.MeshDepthMaterial({depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: .5}); root.add(m);
  m.base = y; m.h = h; m.set = n => { const tt = tex(n); if (m.material.map !== tt) { m.material.map = tt; m.customDepthMaterial.map = tt; } };
  if (shadow) { const sh = new THREE.Mesh(new THREE.CircleGeometry(h * aspect * .33, 24), new THREE.MeshBasicMaterial({color: INK, transparent: true, opacity: .16, depthWrite: false})); sh.rotation.x = -Math.PI / 2; sh.position.set(x, .006, z + .02); root.add(sh); m.sh = sh; }
  return m; }
// preload every sprite we use
(await (await fetch('sprites/list.json')).json()).forEach(tex);

// ================= LOCATION A: classroom (x = 0) =================
const A = new THREE.Group(); scene.add(A);
const RW = 9, RH = 5.4, RD = 12;
const wallTex = paint(1024, 512, x => { x.fillStyle = '#f2e3c0'; x.fillRect(0, 0, 1024, 512); x.fillStyle = '#e8d4a8'; for (let i = 0; i < 1024; i += 64) x.fillRect(i, 0, 28, 512);
  x.fillStyle = '#8fb9a4'; x.fillRect(0, 400, 1024, 112); x.fillStyle = '#7aa892'; x.fillRect(0, 400, 1024, 9); wear(x, 1024, 512, 10, '#b89a70'); });
const floorTex = paint(1024, 1024, x => { x.fillStyle = '#d9a46c'; x.fillRect(0, 0, 1024, 1024); x.strokeStyle = 'rgba(120,70,30,0.42)'; x.lineWidth = 3; for (let i = 0; i < 1024; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 1024); x.stroke(); }
  for (let i = 0; i < 40; i++) { const px = Math.floor(rnd() * 16) * 64, py = rnd() * 1024; x.beginPath(); x.moveTo(px, py); x.lineTo(px + 64, py); x.stroke(); } wear(x, 1024, 1024, 60, '#9a6a3a'); });
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(3, 4);
// board + paper live textures
const boardTex = paint(1024, 560); const BOARD = {};
function board(kind) { if (BOARD.k === kind) return; BOARD.k = kind; boardTex.redraw((x) => { x.fillStyle = '#355f50'; x.fillRect(0, 0, 1024, 560); x.globalAlpha = .1; x.fillStyle = '#fff'; for (const [a, b, c] of [[260, 140, 220], [640, 380, 260], [420, 470, 320]]) { x.beginPath(); x.ellipse(a, b, c, 40, 0, 0, 7); x.fill(); } x.globalAlpha = 1;
  x.fillStyle = '#eef3e8'; x.textAlign = 'center'; x.textBaseline = 'middle'; const f = s => x.font = `${s}px ${HW}`;
  if (kind === 'duty') { f(80); x.textAlign = 'left'; x.fillText('Who is on duty?', 60, 200); f(52); x.fillText('Дежурный: ______', 60, 330); }
  else if (kind === 'boss') { f(118); x.fillStyle = '#ffd84a'; x.fillText('thoroughly', 512, 300); x.fillStyle = '#eef3e8'; f(50); x.fillText('Paragraph 6', 512, 110); }
  else if (kind === 'gh') { f(104); const parts = [['thorou', '#eef3e8'], ['gh', '#8fa59a'], ['ly', '#eef3e8']]; let w = 0; parts.forEach(([s]) => w += x.measureText(s).width); let px = 512 - w / 2; x.textAlign = 'left';
    parts.forEach(([s, c]) => { x.fillStyle = c; x.fillText(s, px, 260); const ww = x.measureText(s).width; if (s === 'gh') { x.strokeStyle = '#ff6a5a'; x.lineWidth = 8; x.beginPath(); x.moveTo(px - 4, 262); x.lineTo(px + ww + 4, 262); x.stroke(); x.fillStyle = '#ffd84a'; f(48); x.textAlign = 'center'; x.fillText('тсс…', px + ww / 2, 160); f(104); x.textAlign = 'left'; } px += ww; });
    x.textAlign = 'center'; f(46); x.fillStyle = '#eef3e8'; x.fillText('gh — не читается', 512, 390); x.fillText('th — язык', 512, 450); x.fillText('между зубами', 512, 505); }
  else if (kind === 'mean') { f(100); x.fillStyle = '#ffd84a'; x.fillText('thoroughly', 512, 170); f(60); x.fillStyle = '#eef3e8'; x.fillText('«ТхА-рэ-ли»', 512, 290); f(80); x.fillText('= тщательно', 512, 410); }
  else { f(64); x.fillText('21 ноября', 512, 120); x.fillText('Classwork', 512, 205); x.textAlign = 'left'; x.fillText('Reading, p. 42', 110, 330); } }); }
board('day');
let flyTent, hostSign, tents = [], nameTents = [], balloon, heroBook, heroPaper, chalkHand;
at(A, () => {
  const back = plane(RW, RH, wallTex, 0, RH / 2, 0); const rear = plane(RW, RH, wallTex, 0, RH / 2, RD, Math.PI);
  for (const s of [-1, 1]) plane(RD, RH, wallTex, s * RW / 2, RH / 2, RD / 2, -s * Math.PI / 2);
  const fl = plane(RW, RD, floorTex, 0, 0, RD / 2); fl.rotation.x = -Math.PI / 2;
  const ce = plane(RW, RD, null, 0, RH, RD / 2); ce.rotation.x = Math.PI / 2; ce.material.color.set(0xfbf4e4);
  box(RW, .12, .04, 0x9a6a3a, 0, .06, .02); box(RW, .12, .04, 0x9a6a3a, 0, .06, RD - .02);
  // board
  box(3.9, 2.0, .08, 0x9a6a3a, -1.4, 2.0, .05); box(3.7, 1.8, .06, 0xffffff, -1.4, 2.0, .1, boardTex); box(3.8, .06, .16, 0x8a5a2e, -1.4, 1.06, .14); box(.22, .05, .05, 0xffffff, -2.6, 1.11, .16);
  cyl(.26, .06, 0xffffff, -1.4, 3.35, .05, 32).rotation.x = Math.PI / 2; box(.03, .17, .02, INK, -1.4, 3.41, .1); box(.12, .03, .02, INK, -1.35, 3.35, .1);
  // door + EXIT sign
  box(1.16, 2.3, .1, 0x9a6a3a, 3.2, 1.15, .05); box(1.0, 2.18, .08, 0xc98f55, 3.2, 1.1, .1); box(.7, .8, .03, 0xc28650, 3.2, 1.62, .15); box(.7, .8, .03, 0xc28650, 3.2, .62, .15);
  cyl(.05, .04, 0xd8d8de, 2.82, 1.1, .17).rotation.x = Math.PI / 2; box(.22, .04, .04, 0xd8d8de, 2.92, 1.1, .2);
  box(.62, .24, .06, 0x2f9a5a, 3.2, 2.52, .08, paint(256, 100, x => { x.fillStyle = '#2f9a5a'; x.fillRect(0, 0, 256, 100); x.fillStyle = '#fff'; x.font = `64px ${BOLD}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('EXIT', 128, 54); }));
  // window on the left wall
  const winTex = paint(512, 640, x => { x.fillStyle = '#cfe6f0'; x.fillRect(0, 0, 512, 640); x.fillStyle = '#9ccc6a'; for (const [a, b, r] of [[200, 330, 150], [330, 300, 130], [260, 200, 120]]) { x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); } x.fillStyle = '#7a5a3a'; x.fillRect(250, 420, 30, 220); });
  box(.08, 1.6, 1.3, 0xffffff, -RW / 2 + .05, 2.0, 4.2); plane(1.1, 1.4, winTex, -RW / 2 + .1, 2.0, 4.2, Math.PI / 2, true); box(.06, 1.5, .05, 0xffffff, -RW / 2 + .12, 2.0, 4.2); box(.06, .05, 1.2, 0xffffff, -RW / 2 + .12, 2.0, 4.2); box(.2, .05, 1.4, 0xffffff, -RW / 2 + .15, 1.18, 4.2);
  box(.08, 1.6, 1.3, 0xffffff, -RW / 2 + .05, 2.0, 7.4); plane(1.1, 1.4, winTex, -RW / 2 + .1, 2.0, 7.4, Math.PI / 2, true); box(.2, .05, 1.4, 0xffffff, -RW / 2 + .15, 1.18, 7.4);
  // rear wall: English alphabet poster, map, bookcase, the hostage sign
  plane(1.0, 1.3, paint(400, 520, x => { x.fillStyle = '#fff6d8'; x.fillRect(0, 0, 400, 520); ['ABCDEF', 'GHIJKL', 'MNOPQR', 'STUVWX', 'YZ'].forEach((r, i) => { x.fillStyle = ['#e05030', '#3a6ad0', '#2f9a5a', '#8a4ad0', '#e05030'][i]; x.font = `70px ${BOLD}`; x.textAlign = 'center'; x.fillText(r, 200, 90 + i * 95); }); x.strokeStyle = INKS; x.lineWidth = 8; x.strokeRect(4, 4, 392, 512); }), 1.0, 2.4, RD - .03, Math.PI);
  plane(1.8, 1.2, paint(600, 400, x => { x.fillStyle = '#a8d4f0'; x.fillRect(0, 0, 600, 400); x.fillStyle = '#7ac070'; for (const [a, b, rx, ry] of [[150, 160, 110, 80], [380, 140, 140, 70], [420, 300, 60, 70]]) { x.beginPath(); x.ellipse(a, b, rx, ry, 0, 0, 7); x.fill(); } x.strokeStyle = '#fff'; x.lineWidth = 20; x.strokeRect(0, 0, 600, 400); x.strokeStyle = INKS; x.lineWidth = 6; x.strokeRect(3, 3, 594, 394); }), -1.4, 2.4, RD - .03, Math.PI);
  box(1.2, 2.2, .4, 0xb07a42, 3.4, 1.1, RD - .25); for (let i = 0; i < 4; i++) { box(1.1, .04, .36, 0x8a5a2e, 3.4, .3 + i * .5, RD - .25); for (let k = 0; k < 5; k++) box(.1, .36, .26, [0xe05030, 0x3a6ad0, 0xf0b030, 0x7a5ad0, 0x4cae6a][(k + i) % 5], 3.0 + k * .16, .5 + i * .5, RD - .28); }
  hostSign = box(3.4, .85, .08, 0x1a1a22, 0, 3.2, RD - .1, paint(800, 200, x => { x.fillStyle = '#1a1a22'; x.fillRect(0, 0, 800, 200); x.fillStyle = '#ff4040'; x.font = `84px ${BOLD}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ЗАЛОЖНИКИ: 27', 400, 104); })); hostSign.rotation.y = Math.PI; hostSign.visible = false;
  // teacher's desk
  box(2.0, .08, .9, 0xd39a5c, -.9, .78, 1.3); box(1.9, .7, .06, 0xb07a42, -.9, .4, 1.72); for (const sx of [-1, 1]) box(.06, .74, .8, 0xb07a42, -.9 + sx * .9, .37, 1.3);
  box(.34, .07, .25, 0xe05a3a, -1.55, .855, 1.25); box(.3, .07, .23, 0xf0b030, -1.53, .925, 1.25); box(.32, .07, .24, 0x3a6ad0, -1.56, .995, 1.25);
  cyl(.09, .16, 0xc8664a, -1.15, .9, 1.2); for (let i = -2; i <= 2; i++) { const l = ink(new THREE.Mesh(new THREE.SphereGeometry(.05, 10, 8), toon(0x4cae6a))); l.scale.set(.8, 3.2, .8); l.position.set(-1.15 + i * .04, 1.12, 1.2); l.rotation.z = i * .3; A.add(l); }
  cyl(.012, .2, INK, -.15, .9, 1.25); const gl = ink(new THREE.Mesh(new THREE.SphereGeometry(.15, 24, 16), toon(0x4ab0e0, paint(256, 128, x => { x.fillStyle = '#4ab0e0'; x.fillRect(0, 0, 256, 128); x.fillStyle = '#7ac070'; for (const [a, b, r] of [[50, 50, 26], [130, 70, 34], [200, 40, 20]]) { x.beginPath(); x.ellipse(a, b, r, r * .7, 0, 0, 7); x.fill(); } })))); gl.position.set(-.15, 1.13, 1.25); A.add(gl);
  box(.5, .04, .34, 0xffffff, -.65, .84, 1.3);
});
// student desks/chairs and seats
const SEATS = [];
function studentDesk(x, z) { at(A, () => { box(1.3, .05, .55, 0xe6b47a, x, .74, z); box(1.26, .35, .04, 0xb07a42, x, .55, z - .25); for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(.022, .72, 0x5a5f6a, x + sx * .58, .36, z + sz * .22, 8); }); }
function chair(x, z) { at(A, () => { box(.44, .04, .4, 0xa8703c, x, .45, z); box(.44, .3, .04, 0xa8703c, x, .72, z + .2); for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(.016, .45, 0x8a8f9a, x + sx * .18, .225, z + sz * .17, 8); }); }
const LAYOUT = [[3.0, -.8, ['lena', 'kid2']], [3.0, .8, ['kid1', 'sasha']], [4.6, -.8, ['kid3', null]], [4.6, .8, [null, null]], [6.2, .8, ['hero', 'vova']], [6.2, -.8, [null, null]]];
LAYOUT.forEach(([z, x, who]) => { studentDesk(x, z); [-1, 1].forEach((s, i) => { const sx = x + s * .3; chair(sx, z + .45); if (!who[i]) return; const id = who[i].replace('b', '');
  at(A, () => { const sp = sprite(`back_${id}`, 1.06, 420 / 760, sx, .4, z + .32, false); sp.who = id; sp.z0 = z; SEATS.push(sp); }); }); });
const seat = id => SEATS.find(s => s.who === id);
// desk tents for the paragraph chain + name cards (in-world labels)
function tent(label, x, z, col = '#ffffff') { const t = paint(256, 160); const m = box(.34, .2, .02, 0xffffff, x, .86, z - .2, t); m.rotation.x = -.25; m.lab = l => t.redraw(c => { c.fillStyle = col; c.fillRect(0, 0, 256, 160); c.fillStyle = l.length > 2 ? '#c0283a' : INKS; c.font = `${l.length > 3 ? 70 : 110}px ${BOLD}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(l, 128, 86); }); m.lab(label); m.visible = false; return m; }
at(A, () => { tents = [['lena', 1], ['kid3', 2], ['vova', 3], ['sasha', 4], ['hero', 5]].map(([id, n]) => { const s = seat(id); const t = tent(String(n), s.position.x, s.z0); t.who = id; return t; });
  flyTent = tent('5', 0, 0, '#ffe066'); flyTent.lab('5');
  nameTents = [['hero', 'MICHAEL'], ['vova', 'BOB']].map(([id, n]) => { const s = seat(id); return tent(n, s.position.x, s.z0, '#fffbe8'); });
  heroBook = box(.36, .03, .26, 0x3a6ad0, seat('hero').position.x, .78, 6.2 - .08, paint(256, 180, x => { x.fillStyle = '#3a6ad0'; x.fillRect(0, 0, 256, 180); x.fillStyle = '#fff'; x.font = `40px ${BOLD}`; x.textAlign = 'center'; x.fillText('ENGLISH', 128, 100); })); heroBook.visible = false;
  heroPaper = plane(.28, .37, paint(420, 560, x => { x.fillStyle = '#fffdf5'; x.fillRect(0, 0, 420, 560); x.fillStyle = '#c0283a'; x.font = `44px ${HW}`; x.textAlign = 'center'; x.fillText('Paragraph 5', 210, 70); x.fillStyle = INKS; x.font = `38px ${HW}`; ['London is the capital', 'of Great Britain.', 'It is a very big', 'and beautiful city…'].forEach((s, i) => x.fillText(s, 210, 160 + i * 70)); x.strokeStyle = INKS; x.lineWidth = 6; x.strokeRect(3, 3, 414, 554); }), 0, 0, 0, Math.PI, true); heroPaper.visible = false;
  const bt = paint(256, 256, x => { const gr = x.createRadialGradient(100, 90, 10, 128, 128, 128); gr.addColorStop(0, '#ff6a6a'); gr.addColorStop(1, '#c0283a'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); x.fillStyle = '#fff'; x.font = `150px ${BOLD}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('5', 128, 136); });
  balloon = new THREE.Group(); const ball = ink(new THREE.Mesh(new THREE.SphereGeometry(.2, 32, 24), toon(0xffffff, bt))); ball.scale.y = 1.15; ball.rotation.y = Math.PI; balloon.add(ball);
  const str = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -.23, 0), new THREE.Vector3(.04, -.6, 0), new THREE.Vector3(-.02, -1.0, 0)]), lineMat); balloon.add(str); A.add(balloon); balloon.visible = false; });
// standing people in the classroom
let teacher, vovaBoard;
at(A, () => { teacher = sprite('teacher_smug_m0', 1.82, 640 / 1560, .05, 0, 2.0); vovaBoard = sprite('vova_wipe_m0', 1.57, 640 / 1560, -2.55, 0, .7); vovaBoard.visible = false; vovaBoard.sh.visible = false; });

// ================= LOCATION B: desk top for paper inserts (x = 40) =================
const B = new THREE.Group(); B.position.x = 40; scene.add(B);
const paperTex = paint(840, 1180); let PAPER = null;
at(B, () => { const top = box(4, .1, 6, 0xc8925a, 0, -.05, 0, paint(512, 768, x => { x.fillStyle = '#c8925a'; x.fillRect(0, 0, 512, 768); x.strokeStyle = 'rgba(90,55,25,0.3)'; x.lineWidth = 3; for (let y = 0; y < 768; y += 90) { x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(170, y + 20, 340, y - 20, 512, y + 10); x.stroke(); } wear(x, 512, 768, 30, '#6a4a2a'); }));
  const p = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.97), toon(0xffffff, paperTex)); p.rotation.x = -Math.PI / 2; p.rotation.z = .03; p.position.set(0, .006, 0); p.receiveShadow = true; B.add(p);
  const ruler = box(1.5, .015, .16, 0xf2dc8a, -.1, .01, 1.25, paint(600, 64, x => { x.fillStyle = '#f2dc8a'; x.fillRect(0, 0, 600, 64); x.strokeStyle = INKS; x.lineWidth = 2; for (let i = 0; i <= 50; i++) { x.beginPath(); x.moveTo(10 + i * 11.6, 0); x.lineTo(10 + i * 11.6, i % 5 ? 14 : 26); x.stroke(); } x.fillStyle = INKS; x.font = `20px ${BOLD}`; [10, 20, 30, 40].forEach(n => x.fillText(String(n), n * 11.6, 54)); })); ruler.rotation.y = -.05;
  const pen = cyl(.025, .7, 0x2f6ad0, .9, .03, -.3, 12); pen.rotation.z = Math.PI / 2; pen.rotation.y = .6;
  const eraser = box(.18, .06, .1, 0xff8aa0, -.85, .03, -.9); });
function paper(kind) { if (PAPER === kind) return; PAPER = kind; paperTex.redraw((x) => { const W2 = 840, H2 = 1180; x.fillStyle = '#ffffff'; x.fillRect(0, 0, W2, H2); x.strokeStyle = '#b8d0ec'; x.lineWidth = 2;
  for (let y = 40; y < H2; y += 40) { x.beginPath(); x.moveTo(0, y); x.lineTo(W2, y); x.stroke(); } if (kind !== 'end') for (let xx = 40; xx < W2; xx += 40) { x.beginPath(); x.moveTo(xx, 0); x.lineTo(xx, H2); x.stroke(); }
  x.strokeStyle = '#e05050'; x.beginPath(); x.moveTo(W2 - 70, 0); x.lineTo(W2 - 70, H2); x.stroke(); x.strokeStyle = INKS; x.lineWidth = 6; x.strokeRect(3, 3, W2 - 6, H2 - 6);
  const t = (s, X, Y, sz, c = '#1f3a8a', al = 'left') => { x.font = `${sz}px ${HW}`; x.fillStyle = c; x.textAlign = al; x.textBaseline = 'middle'; x.fillText(s, X, Y); };
  if (kind === 'math') { t('Задача', 80, 110, 70); t('Учеников в классе — 27', 80, 220, 50); t('Абзацев в тексте — 6', 80, 320, 50); t('Я сижу — пятым', 80, 420, 50); t('Решение', 80, 560, 70); t('27 - Вова (болеет?) …', 80, 670, 50); t('Мой абзац — № 5', 80, 810, 66, '#c0283a');
    x.strokeStyle = '#c0283a'; x.lineWidth = 6; x.beginPath(); x.ellipse(300, 810, 270, 62, -.02, 0, 7); x.stroke(); }
  if (kind === 'map') { t('План Саши', 80, 100, 76); x.strokeStyle = '#1f3a8a'; x.lineWidth = 4; x.beginPath(); x.moveTo(80, 150); x.lineTo(480, 150); x.stroke();
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { x.lineWidth = 5; x.strokeRect(110 + c * 220, 230 + r * 170, 170, 80); } t('Вова', 415, 440, 52, '#c0283a', 'center'); x.strokeStyle = '#c0283a'; x.lineWidth = 6; x.beginPath(); x.ellipse(415, 440, 140, 74, 0, 0, 7); x.stroke(); t('опасно!', 580, 340, 44, '#c0283a');
    t('Вова читает', 80, 820, 52); t('за двоих — значит, учу', 80, 900, 52); t('на один дальше', 80, 990, 62, '#c0283a'); }
  if (kind === 'end') { t('Как говорят на самом деле', 420, 100, 62, '#c0283a', 'center');
    [['May I go out?', 'Can I go to the bathroom?', 'Можно выйти?'], ['on duty', 'на дежурстве', 'врач, полиция, охрана'], ['thoroughly', '«ТхА-рэ-ли»', 'тщательно, gh не читается']].forEach(([a, b, c], i) => { const y = 240 + i * 270;
      t(a, 420, y, i ? 64 : 50, i ? '#1f3a8a' : '#999999', 'center'); if (!i) { x.font = `50px ${HW}`; const w = x.measureText(a).width; x.strokeStyle = '#e03030'; x.lineWidth = 4; x.beginPath(); x.moveTo(420 - w / 2, y); x.lineTo(420 + w / 2, y); x.stroke(); }
      t(b, 420, y + 78, 60, i ? '#1f3a8a' : '#2f8a4a', 'center'); t(c, 420, y + 146, 44, '#555555', 'center'); });
    x.fillStyle = '#ffd23f'; x.beginPath(); x.roundRect(220, 1030, 400, 96, 48); x.fill(); x.strokeStyle = INKS; x.lineWidth = 6; x.stroke(); x.font = `52px ${BOLD}`; x.fillStyle = INKS; x.textAlign = 'center'; x.fillText('ПОДПИШИСЬ', 420, 1080); } }); }

// ================= LOCATION C: assembly hall with a podium (x = 80) =================
const C = new THREE.Group(); C.position.x = 80; scene.add(C);
let sashaPod, heroPod, confetti = [];
at(C, () => { const wt = paint(512, 512, x => { x.fillStyle = '#3a3a68'; x.fillRect(0, 0, 512, 512); x.fillStyle = '#44447a'; for (let i = 0; i < 512; i += 64) x.fillRect(i, 0, 26, 512); });
  plane(12, 7, wt, 0, 3.5, 0); for (const s of [-1, 1]) plane(10, 7, wt, s * 6, 3.5, 5, -s * Math.PI / 2);
  const fl = plane(12, 10, paint(512, 512, x => { x.fillStyle = '#6a4a8a'; x.fillRect(0, 0, 512, 512); x.strokeStyle = 'rgba(0,0,0,0.2)'; x.lineWidth = 3; for (let i = 0; i < 512; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.stroke(); } }), 0, 0, 5); fl.rotation.x = -Math.PI / 2;
  // curtains with folds
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) cyl(.18, 6.6, k % 2 ? 0xa01828 : 0xc0283a, s * (2.6 + k * .32), 3.3, .3, 12);
  box(5.0, .6, .1, 0xc0283a, 0, 6.4, .35);
  box(2.4, .5, .1, 0xffd23f, 0, 4.6, .2, paint(600, 130, x => { x.fillStyle = '#ffd23f'; x.fillRect(0, 0, 600, 130); x.fillStyle = INKS; x.font = `78px ${BOLD}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ЛУЧШИЙ ЧТЕЦ', 300, 70); }));
  // podium 1-2-3
  box(1.0, .9, .8, 0xf0c040, 0, .45, 2.0, paint(256, 256, x => { x.fillStyle = '#f0c040'; x.fillRect(0, 0, 256, 256); x.fillStyle = INKS; x.font = `180px ${BOLD}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('1', 128, 140); }));
  box(1.0, .6, .8, 0xc8ccd8, -1.0, .3, 2.0); box(1.0, .4, .8, 0xd89a5a, 1.0, .2, 2.0);
  sashaPod = sprite('sasha_win_m0', 1.63, 640 / 1560, 0, .9, 2.1); heroPod = sprite('hero_sad_m0', 1.63, 640 / 1560, 1.0, 0, 3.0);
  const cols = [0xffd23f, 0xe03050, 0x4ab0e0, 0x7ad060]; for (let i = 0; i < 60; i++) { const c = new THREE.Mesh(new THREE.PlaneGeometry(.06, .1), new THREE.MeshBasicMaterial({color: cols[i % 4], side: THREE.DoubleSide})); c.userData = {x: (rnd() - .5) * 5, z: 1 + rnd() * 3.5, s: .3 + rnd() * .6, p: rnd() * 10}; C.add(c); confetti.push(c); } });

// ================= LOCATION D: corridor with lockers (x = 120) =================
const D = new THREE.Group(); D.position.x = 120; scene.add(D);
let heroCor, sashaCor;
at(D, () => { const wt = paint(512, 512, x => { x.fillStyle = '#e8e0d0'; x.fillRect(0, 0, 512, 512); x.fillStyle = '#c8d4c0'; x.fillRect(0, 380, 512, 132); wear(x, 512, 512, 8, '#a89a80'); });
  plane(14, 4, wt, 0, 2, 0); const fl = plane(14, 8, paint(512, 512, x => { x.fillStyle = '#c9ced6'; x.fillRect(0, 0, 512, 512); x.strokeStyle = 'rgba(60,60,80,0.25)'; x.lineWidth = 3; for (let i = 0; i < 512; i += 85) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(512, i); x.stroke(); } }), 0, 0, 4); fl.rotation.x = -Math.PI / 2;
  const ce = plane(14, 8, null, 0, 4, 4); ce.rotation.x = Math.PI / 2;
  for (let i = -6; i <= 6; i++) { const L = box(.6, 1.9, .5, [0x6a8ab8, 0x5a7aa8][(i + 20) % 2], i * .62, .95, .26); box(.36, .05, .02, 0xd0d8e8, i * .62, 1.55, .52); box(.36, .05, .02, 0xd0d8e8, i * .62, 1.45, .52); box(.04, .14, .03, 0xd0d8e8, i * .62 + .2, 1.0, .52); }
  box(1.2, .5, .06, 0xffffff, -2.2, 2.6, .05, paint(400, 160, x => { x.fillStyle = '#fff'; x.fillRect(0, 0, 400, 160); x.fillStyle = '#2f4a7a'; x.font = `58px ${BOLD}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('КАБИНЕТ 7', 200, 84); }));
  for (const lx of [-3, 0, 3]) box(.8, .06, .3, 0xfffbe8, lx, 3.96, 3);
  heroCor = sprite('hero_shrug_m0', 1.63, 640 / 1560, -.55, 0, 2.2); sashaCor = sprite('sasha_stand_m0', 1.68, 640 / 1560, .6, 0, 2.2); });

// ---------------- light ----------------
const hemi = new THREE.HemisphereLight(0xfff3e0, 0xb89070, 1.25); scene.add(hemi);
const key = new THREE.DirectionalLight(0xffe2b8, 1.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, {left: -7, right: 7, top: 7, bottom: -3, near: 1, far: 40}); key.shadow.radius = 4; key.shadow.bias = -.0008; scene.add(key); scene.add(key.target);
const LOC = {A: {x: 0, fog: 0xf1e2bf, key: 0xffe2b8}, B: {x: 40, fog: 0xe8d8b8, key: 0xfff0d8}, C: {x: 80, fog: 0x2a2a50, key: 0xfff0c0}, D: {x: 120, fog: 0xe8e0d0, key: 0xfff4e4}};

// ---------------- shots: camera path per shot (world coords relative to the location) ----------------
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const BACKTEACH = [V(-.45, 1.5, 6.4), V(-.3, 1.3, 0)], TEACHCU = [V(.05, 1.5, 3.9), V(.05, 1.45, 1.9)];
const HEROCU = [V(.5, 1.2, 5.45), V(.5, 1.0, 8)];
const S = { // kind: [loc, [from pos, from look], [to pos, to look]]
  CLASS: ['A', [V(.3, 1.7, 1.45), V(.1, .85, 8)], [V(.3, 1.6, 2.0), V(.1, .85, 8)], 0, 66],
  TEACH: ['A', BACKTEACH, [V(-.4, 1.48, 5.6), V(-.3, 1.33, 0)]],
  CHORUS: ['A', [V(0, 1.55, 1.0), V(0, .95, 8)], [V(0, 1.5, 1.6), V(0, .95, 8)], 0, 60],
  HOSTAGE: ['A', [V(0, 1.8, .35), V(0, 2.2, 12)], [V(0, 1.8, .9), V(0, 2.3, 12)], 0, 62],
  NAMES: ['A', [V(.8, 1.3, 5.35), V(.8, .95, 8)], [V(.8, 1.28, 5.6), V(.8, .95, 8)], 0, 62],
  AUTO: ['A', HEROCU, [V(.5, 1.18, 5.65), V(.5, 1.0, 8)]],
  BOARD: ['A', [V(-2.0, 1.5, 4.4), V(-2.2, 1.4, 0)], [V(-2.05, 1.5, 3.8), V(-2.25, 1.45, 0)]],
  MATH: ['B', [V(0, 2.8, .62), V(0, 0, .38)], [V(0, 2.5, .6), V(0, 0, .36)]],
  ANTHEM: ['A', [V(.5, 1.2, 5.4), V(.5, 1.0, 8)], [V(.5, 1.18, 5.62), V(.5, 1.0, 8)]],
  SLEEP: ['A', [V(.5, 1.18, 5.6), V(.5, 1.0, 8)], [V(.5, 1.17, 5.75), V(.5, 1.0, 8)]],
  CHAIN: ['A', [V(0, 2.5, .4), V(.1, .7, 6)], [V(.05, 2.35, 1.0), V(.1, .7, 6)], 0, 66],
  BALLOON: ['A', [V(.75, 2.3, 1.2), V(.8, .15, 5.2)], [V(.75, 2.2, 1.7), V(.8, .15, 5.2)], 0, 62],
  BOSS: ['A', [V(-1.4, 2.0, 7.0), V(-1.4, 2.0, 0)], [V(-1.4, 2.0, 5.0), V(-1.4, 2.0, 0)], .5],
  STRUGGLE: ['A', HEROCU, [V(.5, 1.18, 5.65), V(.5, .98, 8)]],
  SPIES: ['A', [V(-1.4, 2.0, 4.9), V(-1.4, 2.0, 0)], [V(-1.4, 2.0, 4.4), V(-1.4, 2.0, 0)]],
  EXIT: ['A', [V(-.3, 1.5, 9.2), V(2.4, 1.25, 0)], [V(-.2, 1.45, 8.5), V(2.6, 1.25, 0)]],
  PODIUM: ['C', [V(.4, 1.45, 6.8), V(.45, 1.25, 0)], [V(.4, 1.43, 6.2), V(.45, 1.25, 0)]],
  CORRIDOR: ['D', [V(0, 1.4, 6.3), V(0, 1.15, 0)], [V(.05, 1.38, 5.6), V(0, 1.15, 0)]],
  MAP: ['B', [V(0, 2.8, .62), V(0, 0, .38)], [V(0, 2.5, .6), V(0, 0, .36)]],
  MEANING: ['A', [V(-1.4, 2.0, 4.9), V(-1.4, 2.0, 0)], [V(-1.4, 2.0, 4.3), V(-1.4, 2.0, 0)]],
  END: ['B', [V(0, 2.75, .3), V(0, 0, -.02)], [V(0, 2.6, .28), V(0, 0, -.02)]],
};
// second corridor shot: quick push to Sasha's face
const SPECIAL = {CORRIDOR2: ['D', [V(0, 1.38, 5.6), V(0, 1.15, 0)], [V(.6, 1.45, 3.7), V(.6, 1.42, 2.2)], .45], TEACH_NEXT: ['A', BACKTEACH, TEACHCU, .45]};
const SH = TL.SH.map(([at, kind], i) => { let k = kind; if (kind === 'CORRIDOR' && TL.SH[i - 1][1] === 'CORRIDOR') k = 'CORRIDOR2'; const tLine = TL.lines.t4; if (kind === 'TEACH' && Math.abs(at - tLine.at) < .2) k = 'TEACH_NEXT';
  return {at, end: i + 1 < TL.SH.length ? TL.SH[i + 1][0] : TL.TOTAL, kind, k, def: SPECIAL[k] || S[kind]}; });
SH.forEach((s, i) => { s.loc = s.def[0]; s.dip = i > 0 && SH[i - 1].def[0] !== s.loc; });

// monotone cubic time warp from the skill (zero speed at the ends)
function warpU(T, t) { const n = T.length; if (t <= T[0]) return 0; if (t >= T[n - 1]) return 1;
  const sec = []; for (let i = 0; i < n - 1; i++) sec.push((1 / (n - 1)) / (T[i + 1] - T[i])); const m = [0]; for (let i = 1; i < n - 1; i++) m.push(2 * sec[i - 1] * sec[i] / (sec[i - 1] + sec[i])); m.push(0);
  let i = 0; while (t > T[i + 1]) i++; const h = T[i + 1] - T[i], x = (t - T[i]) / h, x2 = x * x, x3 = x2 * x;
  return (2 * x3 - 3 * x2 + 1) * (i / (n - 1)) + (x3 - 2 * x2 + x) * h * m[i] + (-2 * x3 + 3 * x2) * ((i + 1) / (n - 1)) + (x3 - x2) * h * m[i + 1]; }

// ---------------- performance helpers ----------------
const L = TL.lines, inW = (t, a, b) => t >= a && t < b;
const talk = (ids, t) => { for (const id of ids) { const l = L[id]; if (l && t >= l.at && t < l.end) { const i = Math.floor((t - l.at) * 30); return ((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2; } } return 0; };
const mf = v => v > .55 ? 2 : v > .15 ? 1 : 0;
const TEACH_IDS = Object.keys(L).filter(k => k[0] === 't'), HERO_IDS = ['h1', 'h2', 'h3'];
const blink = (t, s) => ((t + s * 1.3) % (3.3 + s * .4)) < .12;

// ---------------- captions (lower third) + dip + vignette, on the 2D output canvas ----------------
function captions(t) { let cur = null; for (const id in L) { const l = L[id]; if (id !== 'n15' && inW(t, l.at, l.end + .2) && (!cur || l.at > L[cur].at)) cur = id; } if (!cur) return;
  const l = L[cur]; let c = l.ch[0]; for (const q of l.ch) if (t - l.at >= q.s - .03) c = q; const en = /[A-Za-z]/.test(c.txt), pop = 1 + .1 * Math.max(0, 1 - (t - l.at - c.s) / .1);
  const bold = (s, y, size, fill) => { og.font = `${size}px ${BOLD}`; let f = size; while (og.measureText(s).width > 980 && f > 40) { f -= 4; og.font = `${f}px ${BOLD}`; } og.textAlign = 'center'; og.textBaseline = 'middle'; og.lineJoin = 'round'; og.lineWidth = f * .24; og.strokeStyle = '#000'; og.strokeText(s, 0, y); og.fillStyle = fill; og.fillText(s, 0, y); };
  og.save(); og.translate(540, 1560); og.scale(pop, pop); bold(c.txt, 0, 76, en ? '#ffd23f' : '#ffffff'); og.restore();
  if (TL.TR[cur] && en) { og.save(); og.translate(540, 1644); bold(TL.TR[cur], 0, 46, '#bfe9ff'); og.restore(); } }

// ---------------- frame ----------------
window.renderAt = t => {
  let sh = SH[0]; for (const s of SH) if (t >= s.at) sh = s; const k = sh.kind, loc = LOC[sh.loc], d = sh.def;
  // camera: eased path; fast shots finish their push in d[3] seconds
  // moderate camera (owner's note): no quick punches; every shot drifts only ~35% of its planned path, every 3rd shot holds still
  const dur = sh.end - sh.at, idx = SH.indexOf(sh), amt = idx % 3 === 2 ? 0 : .35, u = amt * warpU([sh.at, sh.at + dur / 2, sh.at + dur], t);
  const pos = new THREE.Vector3().lerpVectors(d[1][0], d[2][0], u), look = new THREE.Vector3().lerpVectors(d[1][1], d[2][1], u);
  pos.x += loc.x; look.x += loc.x; camera.position.copy(pos); camera.up.set(0, sh.loc === 'B' ? 0 : 1, sh.loc === 'B' ? -1 : 0); camera.lookAt(look); const fov = d[4] || 50; if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
  scene.fog.color.set(loc.fog); scene.background.set(loc.fog); key.color.set(loc.key); key.position.set(loc.x - 5, 7, 9); key.target.position.set(loc.x, 0, 3);
  key.intensity = k === 'HOSTAGE' ? .7 : k === 'SLEEP' ? .5 : 1.6; hemi.intensity = k === 'HOSTAGE' ? .8 : k === 'SLEEP' ? .7 : 1.25; hemi.color.set(k === 'SLEEP' ? 0xa8b8ff : 0xfff3e0);
  // board + paper content
  board(k === 'BOARD' ? 'duty' : k === 'BOSS' ? 'boss' : k === 'SPIES' ? 'gh' : k === 'MEANING' ? 'mean' : 'day');
  if (sh.loc === 'B') paper(k === 'MATH' ? 'math' : k === 'MAP' ? 'map' : 'end');
  hostSign.visible = k === 'HOSTAGE';
  // teacher
  const tm = mf(talk(TEACH_IDS, t)), tMood = inW(t, L.t4.at, L.t4.end + .3) ? 'angry' : inW(t, L.t5.at, L.t5.end + .3) ? 'pain' : t >= L.t6.at ? 'sweet' : 'smug';
  teacher.set(`teacher_${tMood}_m${tm}`);
  vovaBoard.visible = k === 'BOARD'; vovaBoard.set(`vova_wipe_m0`); if (vovaBoard.visible) vovaBoard.position.x = -2.55 + Math.sin(t * 6) * .03;
  // students: front texture when the camera is in front of them (near the board), back texture otherwise
  const front = camera.position.z < 2.6 && sh.loc === 'A' && k !== 'BOARD' && !['TEACH', 'BOSS', 'SPIES', 'MEANING', 'EXIT'].includes(k) || ['AUTO', 'NAMES', 'ANTHEM', 'SLEEP', 'BALLOON', 'STRUGGLE'].includes(k);
  const chorus = mf(talk(['c1'], t)), hm = mf(talk(HERO_IDS, t));
  SEATS.forEach((s, i) => { const id = s.who; s.rotation.y = front ? Math.PI : 0; s.scale.set(front ? (560 / 640) / (420 / 760) * .83 : 1, front ? .83 : 1, 1);
    s.position.y = (front ? .52 : .4) + s.h * s.scale.y / 2 + Math.sin(t * 1.6 + i) * .004; s.position.z = front ? s.z0 + .38 : s.z0 + .32;
    if (!front) { s.set(id === 'hero' && k === 'EXIT' && t >= L.h3.at - .2 ? 'back_hero_raise' : `back_${id}`); return; }
    let n = `${id}_n`;
    if (k === 'CHORUS') n = `${id}_bored`; if (k === 'HOSTAGE') n = `${id}_sad`; if (k === 'CHAIN' && id === 'hero' && t > L.n7.at + (L.n7.end - L.n7.at) * .62) n = 'hero_sweat';
    if (id === 'hero') { if (k === 'AUTO') n = 'hero_o'; if (k === 'NAMES') n = 'hero_n'; if (k === 'ANTHEM') n = 'hero_proud'; if (k === 'SLEEP') n = 'hero_sleep'; if (k === 'BALLOON') n = 'hero_sad'; if (k === 'STRUGGLE') n = 'hero_hold'; }
    if (id === 'vova' && (k === 'AUTO' || k === 'NAMES')) n = 'vova_o';
    const mi = k === 'CHORUS' ? Math.min(2, chorus + (i % 2 && chorus ? 0 : 0)) : id === 'hero' ? hm : 0; s.set(`${n}_m${mi}`); });
  teacher.visible = !front && k !== 'BOARD'; if (teacher.sh) teacher.sh.visible = teacher.visible;
  tents.forEach(tn => { tn.visible = k === 'CHAIN' || k === 'BALLOON'; if (k === 'BALLOON' && (tn.who === 'lena' || tn.who === 'kid3' || tn.who === 'vova')) tn.visible = false; if (!tn.visible) return; const after = t > L.n7.at + (L.n7.end - L.n7.at) * .62 || k === 'BALLOON'; const lab = {lena: '1', kid3: '2', vova: after ? '3+4' : '3', sasha: after ? '5' : '4', hero: after ? '6' : '5'}[tn.who];
    if (tn.cur !== lab) { tn.cur = lab; tn.lab(lab); } tn.rotation.y = Math.PI; });
  nameTents.forEach(tn => { tn.visible = k === 'NAMES'; tn.rotation.y = Math.PI; });
  const hs = seat('hero'); heroBook.visible = k === 'STRUGGLE'; heroBook.position.set(hs.position.x, .79, hs.z0 + .05); heroBook.rotation.y = Math.PI;
  heroPaper.visible = k === 'ANTHEM' || k === 'SLEEP'; heroPaper.position.set(hs.position.x, .8, hs.z0 + .22); heroPaper.rotation.set(-.6, Math.PI, 0);
  balloon.visible = false; if (k === 'BALLOON') { const fu = Math.min(1, Math.max(0, (t - sh.at - .3) / 1.6)), e = fu * fu * (3 - 2 * fu), ss = seat('sasha'), a = new THREE.Vector3(hs.position.x, .86, hs.z0 - .2), b = new THREE.Vector3(ss.position.x, .86, ss.z0 - .2);
    flyTent.visible = fu < 1; flyTent.position.lerpVectors(a, b, e); flyTent.position.y += Math.sin(e * Math.PI) * .9; flyTent.rotation.set(-.25, Math.PI + e * Math.PI * 2, 0);
    tents.find(q => q.who === 'sasha').visible = fu >= 1; const ht = tents.find(q => q.who === 'hero'); ht.visible = t > sh.at + .3; if (ht.cur !== '6') { ht.cur = '6'; ht.lab('6'); } } else flyTent.visible = false;
  if (false) { const bu = Math.max(0, (t - sh.at) / (sh.end - sh.at)); balloon.position.set(hs.position.x + .32 + bu * .1, 1.15 + bu * bu * 2.2, hs.z0 + .3); balloon.rotation.z = Math.sin(t * 2) * .12; }
  // other locations
  sashaPod.set(`sasha_win_m0`); heroPod.set('hero_sad_m0');
  confetti.forEach(c => { const q = c.userData, y = 5.5 - ((t * q.s + q.p) % 5.5); c.position.set(q.x + Math.sin(t + q.p) * .2, y, q.z); c.rotation.set(t * 3 + q.p, t * 2, 0); });
  const sm = mf(talk(['s1'], t)); sashaCor.set(`sasha_stand_m${sm}`); heroCor.set('hero_shrug_m0');
  [teacher, sashaCor, heroCor, sashaPod].forEach((m, i) => { m.position.y = m.base + m.h / 2 + Math.abs(Math.sin(t * 2 + i)) * .008; });
  for (const m of [teacher, vovaBoard, sashaPod, heroPod, sashaCor, heroCor]) { const wp = new THREE.Vector3(); m.getWorldPosition(wp); m.rotation.y = Math.max(-.7, Math.min(.7, Math.atan2(camera.position.x - wp.x, camera.position.z - wp.z))); }
  renderer.render(scene, camera);
  // 2D pass: image, vignette, location dip, captions
  og.setTransform(1, 0, 0, 1, 0, 0); og.drawImage(renderer.domElement, 0, 0);
  const v = og.createRadialGradient(W / 2, H * .45, 650, W / 2, H * .45, 1250); v.addColorStop(0, 'rgba(40,20,30,0)'); v.addColorStop(1, 'rgba(40,20,30,0.2)'); og.fillStyle = v; og.fillRect(0, 0, W, H);
  if (sh.dip && t - sh.at < .25) { og.fillStyle = `rgba(246,236,214,${1 - (t - sh.at) / .25})`; og.fillRect(0, 0, W, H); }
  const nxt = SH[SH.indexOf(sh) + 1]; if (nxt && nxt.dip && nxt.at - t < .15) { og.fillStyle = `rgba(246,236,214,${1 - (nxt.at - t) / .15})`; og.fillRect(0, 0, W, H); }
  if (k !== 'END') captions(t);
  return true; };
window.TOTAL = TL.TOTAL;
window.ready = new Promise(r => { let done = false; THREE.DefaultLoadingManager.onLoad = () => { if (!done) { done = true; setTimeout(() => r(true), 300); } }; setTimeout(() => r(true), 8000); });
