// STAGE 1 motion check (not a release): Alex walks across the room and gestures, Tony walks the other way.
// node mafia_motion_test.js 0 210 out.mp4 | 0 0 --png=30,60,...
const H = require('./hq'); const E = require('./engine_v2'); const A = require('./act'); const FXF = require('./faces_plus'); const PF = require('./props_fx');
const S = require('./mafia_set'); const { CAST, G } = S;
const W = 1920, HH = 1080, FPS = 30, DUR = 7;
const finger = { alex: PF.finger(CAST.alex), tony: PF.finger(CAST.tony) };
const poseAlex = A.poser(CAST.alex, G.alex, { items: { finger: finger.alex, book: S.notebookItem(0), bookOpen: S.notebookItem(1, 1) } });
const poseTony = A.poser(CAST.tony, G.tony, { items: { finger: finger.tony } });
function draw(c, cfg, st, x, y = 0) { c.save(); c.translate(x, y); const r = H.human(c, cfg, st); c.restore(); return r; }

function alexState(t) {
  const g = G.alex, wk = A.walk(CAST.alex, [{ t0: 0.2, t1: 3.4, x0: 1500, x1: 300 }], t, {});
  const book = g2 => ({ x: -g2.sw * 0.3, y: g2.ySh + g2.h * 0.17, item: 'book' });
  const keys = [[0, g2 => ({ ...A.GEST.rest(g2), L: book(g2) })],
    [3.5, g2 => ({ ...A.GEST.point(g2), L: book(g2) }), 0.28, 'back'],
    [4.6, g2 => ({ ...A.GEST.spread(g2) }), 0.35],
    [5.5, 'shrug', 0.3], [6.2, g2 => ({ ...A.GEST.pointUp(g2), L: book(g2) }), 0.3, 'back']];
  const P = poseAlex(t, keys, { swing: wk.moving ? (side) => side > 0 ? A.swingArm(wk, g)(side) : 0 : null });
  const talk = A.flap(t, (t > 3.6 && t < 4.4) || (t > 4.7 && t < 5.4) || (t > 6.3 && t < 6.9), 1);
  const st = { t, ...wk.st, armL: P.armL, armR: P.armR, items: P.items, tilt: P.tilt + (wk.moving ? 0 : A.key(t, [[3.4, 0], [3.7, -0.04], [4.2, 0]])),
    mood: t > 5.5 && t < 6.2 ? 'worried' : 'happy', turn: wk.moving ? wk.dir * 0.4 : A.key(t, [[3.4, -0.4], [3.8, -0.15]]), look: wk.moving ? wk.dir : -0.5, talk,
    mouthFn: talk < 0.05 && t > 4.6 && t < 5.5 ? FXF.bigSmile(1) : null };
  return { x: wk.x, st };
}
function tonyState(t) {
  const g = G.tony, wk = A.walk(CAST.tony, [{ t0: 1.0, t1: 4.2, x0: -1500, x1: -200 }], t, {});
  const P = poseTony(t, [[0, 'rest'], [4.4, 'cross', 0.45]], { swing: A.swingArm(wk, g) });
  const st = { t, ...wk.st, armL: P.armL, armR: P.armR, items: P.items, armsFirst: false, mood: t > 4.4 ? 'skeptical' : 'neutral', turn: wk.moving ? wk.dir * 0.4 : 0.3, look: wk.moving ? wk.dir : 0.8 };
  return { x: wk.x, st };
}
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, W, HH);
  const cam = { x: 200, y: -820, z: 0.42 };
  c.save(); c.translate(W / 2, HH / 2); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y);
  S.drawBackground(c);
  const T = tonyState(t), Al = alexState(t);
  draw(c, CAST.tony, T.st, T.x); draw(c, CAST.alex, Al.st, Al.x);
  c.restore();
  H.vignette(c, W, HH, 0.22);
  c.font = '26px Nun9'; c.fillStyle = 'rgba(0,0,0,.55)'; H.rr(c, 24, HH - 64, 360, 40, 20); c.fill(); c.fillStyle = '#fff'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(`MOTION TEST · ${t.toFixed(2)} s`, 44, HH - 44);
}
E.run('mafia_motion_test', DUR * FPS, renderFrame, W, HH);
