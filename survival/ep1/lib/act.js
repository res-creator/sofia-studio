// Acting helpers shared by the Ep1 scenes: walking along keyed paths (no foot slide), sitting, floor props.
const K = require('./cast'), { R, D2 } = K, { paint, line, shade } = R;
const C = require('./core'), { clamp, lerp, ease } = C;
// path: [[t, x], ...]; walks between keys at constant speed, feet locked (u = distance / stride). Returns { x, walk, moving }
function walkPath(t, path, stride = 100) {
  let dist = 0, x = path[0][1], moving = false, k = 0;
  for (let i = 1; i < path.length; i++) { const [t0, x0] = path[i - 1], [t1, x1] = path[i];
    if (t >= t1) { dist += Math.abs(x1 - x0); x = x1; continue; }
    if (t > t0) { const u = (t - t0) / (t1 - t0); x = lerp(x0, x1, u); dist += Math.abs(x - x0); moving = x1 !== x0; k = Math.sign(x1 - x0); }
    break; }
  // blend to a neutral stance when stopped: snap phase to the nearest half stride (feet together-ish)
  return { x, walk: { w: 1, u: dist / stride, stride }, moving, dir: k };
}
// facing for a path: true when moving right at time t (rig faces left)
const sitPose = (x, ground, o = {}) => Object.assign({ x, ground, hop: 150, footN: [x - 175, ground - 12], footF: [x - 150, ground - 12], lean: -0.08, crouch: 0 }, o);
// backpack lying on the floor (closed / open top)
function packFloor(ctx, x, ground, o = {}) {
  const S = D2; ctx.save(); ctx.translate(x, ground); if (o.s) ctx.scale(o.s, o.s);
  paint(ctx, S, c => c.roundRect(-80, -150, 160, 150, 34), '#5b7d3a'); paint(ctx, S, c => c.roundRect(-60, -80, 120, 64, 14), '#4c6a30');
  if (o.open) { paint(ctx, S, c => c.ellipse(0, -150, 76, 22, 0, 0, 7), '#2f3f1e'); } else paint(ctx, S, c => c.roundRect(-84, -170, 168, 44, 20), '#4c6a30');
  if (o.radio) { paint(ctx, S, c => c.rect(56, -190, 7, 34), '#222'); paint(ctx, S, c => c.roundRect(40, -160, 40, 58, 7), '#2f3136'); ctx.fillStyle = o.radioOn && Math.floor((o.t || 0) * 8) % 2 ? '#ff4b3a' : '#5a2a28'; ctx.beginPath(); ctx.arc(60, -146, 5, 0, 7); ctx.fill(); }
  ctx.restore();
}
// generic seated/standing hero with backpack defaults
function hero(ctx, h) { return K.person(ctx, K.HERO, Object.assign({ e: {} }, h), h.tag || 'hero'); }
function gary(ctx, h) { return K.person(ctx, K.GARY, Object.assign({ e: {}, neckBite: true }, h), h.tag || 'gary'); }
function sarah(ctx, h) { return K.person(ctx, K.SARAH, Object.assign({ e: {} }, h), h.tag || 'sarah'); }
// head-only close-up of a character (for inserts, reflections): draws the rig head at `at`
function headCU(ctx, ch, at, tilt, e, o = {}) { const C2 = o.gray ? Object.assign({}, ch.C, { skin: K.mix(ch.C.skin, '#9fae8e', o.gray) }) : ch.C; R.head(ctx, ch.S, C2, at, tilt, Object.assign({ t: o.t }, e)); }
// knock graphic (screen space)
function knockFx(ctx, t, t0, x, y, txt = 'KNOCK KNOCK') {
  const u = (t - t0) / 0.6; if (u < 0 || u > 1) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.12); const k = 0.6 + 0.5 * C.back(clamp(u / 0.3)); ctx.scale(k, k); ctx.globalAlpha = clamp((1 - u) / 0.25);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 8; for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 190, Math.sin(a) * 110); ctx.lineTo(Math.cos(a) * 250, Math.sin(a) * 150); ctx.stroke(); }
  C.outlined(ctx, txt, 0, 0, 120, '#ffd23f', { lw: 22, shadow: false }); ctx.restore();
}
// typed caption-style location/time tag (bottom-left)
function tag(ctx, t, t0, t1, txt) { if (t < t0 || t > t1) return; const n = Math.floor(clamp((t - t0) / 0.7) * txt.length), a = clamp((t1 - t) / 0.3);
  ctx.save(); ctx.globalAlpha = a; ctx.font = '54px Anton'; const w = ctx.measureText(txt).width; ctx.fillStyle = 'rgba(10,10,12,0.75)'; ctx.fillRect(60, 70, w + 50, 84); ctx.fillStyle = '#ffd23f'; ctx.fillRect(60, 70, 10, 84);
  ctx.fillStyle = '#f4efe4'; ctx.textBaseline = 'middle'; ctx.fillText(txt.slice(0, n), 90, 114); ctx.restore(); }
// "SUGAR?" mug; mirror=true when drawn inside a flipped character (label stays readable)
function mug(ctx, m, mirror) {
  const S = D2, s = m.s, [x, y] = m.M;
  ctx.save(); ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x + 40 * s, y, 22 * s, -Math.PI / 2, Math.PI / 2); ctx.lineWidth = 14 * s + S.lw * 2; ctx.strokeStyle = S.ink; ctx.stroke(); ctx.lineWidth = 14 * s; ctx.strokeStyle = '#f2eee4'; ctx.stroke(); ctx.restore();
  paint(ctx, S, c => c.roundRect(x - 40 * s, y - 50 * s, 80 * s, 100 * s, 12 * s), '#f2eee4');
  ctx.save(); ctx.translate(x, y); if (mirror) ctx.scale(-1, 1); ctx.fillStyle = '#d6413a'; ctx.font = `${Math.round(20 * s)}px Anton`; ctx.textAlign = 'center'; ctx.fillText('SUGAR?', mirror ? 9 * s : -9 * s, 9 * s); ctx.restore();
}
module.exports = { mug, walkPath, sitPose, packFloor, hero, gary, sarah, headCU, knockFx, tag };
