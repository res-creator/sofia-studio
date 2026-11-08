// REFERENCE SCENE for the approved long-form standard (= puppet test v6, rebuilt on the kit): Candler at his desk, acting on the voice.
// Copy this file to start any character scene. Voice: Coca-Cola chapter 3, line b2 ("Candler wasn't impressed ... fine."), 10 s from 14.2 s.
// Usage: node examples/candler_desk.js still 0.3,3.2,8.6 out.png | frame t out.png | video out.mp4   (picture only; mix sound separately)
const path = require('path');
const S = require('../lib/scene'), { Puppet } = require('../lib/puppet');
const CH = path.join(__dirname, '../../cocacola_history/chapters/c3_bottles');
const at = S.words(CH, 14.2), w = x => at('b2', x);                  // word times in scene seconds
const T = 10.0, tImp = w('impressed'), tMessy = w('messy'), tSoda = w('soda'), tBut = w('but'), tFine = w('fine');
// acting = a list of beats on the words
const act = Puppet.acting({
  expr: [[0, 'neutral'], [tImp - 0.15, 'skeptical'], [tSoda - 0.1, 'smile'], [tBut, 'surprised'], [tFine - 0.05, 'talk'], [tFine + 0.5, 'smile']],
  blinks: [0.7, 3.4, 6.6, 9.3],
  tilt: [[tImp - 0.1, -0.07], [tSoda, 0.06], [tBut, 0], [tFine, 0.05]],
  nods: [tImp], shrugs: [[tFine - 0.15, 1]],
  gestures: { R: [[tMessy - 0.2, tSoda - 0.15, 'point', { wag: 1, wagUntil: tMessy + 1.2 }], [tFine + 0.05, 99, 'palm']], L: [[tFine + 0.05, 99, 'palm']] },
});
const DESK = [[0, 585], [330, 537], [720, 513], [1050, 513], [1385, 553], [1414, 590], [1400, 864], [0, 864]];   // desk edge = occluder
let BG, CANDLER;
const shots = [{ t0: 0, draw(ctx, t) {
  const k = S.ss(t / T), c = { x: S.lerp(500, 470, k), y: S.lerp(420, 390, k) + (t > tFine ? -6 * Math.sin(S.clamp((t - tFine) / 0.4) * Math.PI) : 0) };
  // camera: same framing as the approved test (zoom 1.55 -> 1.85 around Candler)
  ctx.save(); ctx.translate(S.W / 2, S.H / 2); ctx.scale(1.25 * S.lerp(1.55, 1.85, k), 1.25 * S.lerp(1.55, 1.85, k)); ctx.translate(-c.x, -c.y);
  S.plate(ctx, BG); S.beams(ctx, t, 1060, -40, 0.42, 3, 0.1);
  CANDLER.draw(ctx, 468, 330, 0.5, act(t), t);
  S.reveal(ctx, BG, DESK);                                           // the desk hides his lower body
  const g = ctx.createLinearGradient(0, 470, 0, 520); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.25)'); ctx.fillStyle = g; ctx.fillRect(300, 470, 340, 50);
  ctx.restore(); S.grade(ctx, 0.06, 0.4); } }];
S.run({ module, T, shots, load: async () => { BG = await S.loadPlate('office_1899_desk');
  const dir = path.join(S.KIT, 'assets/characters/candler'); CANDLER = await Puppet.load(require(path.join(dir, 'character.js')), dir); } });
