// Arm sanity check: runs the same 2-bone IK the rigs use and flags "chicken wing" (elbow above the hand while the hand is below the shoulder)
// and over-reach. validateGesture(fn, rig, tSamples) → { frames, flagged, worst }.
const { ik } = require('../draw');
const { RIG } = require('./gestures');
function checkTarget(target, side, rig = 's') {
  const R = RIG[rig], L1 = rig === 'c' ? 125 : 118, L2 = rig === 'c' ? 118 : 112, sh = [side * R.sh[0], R.sh[1]];
  const { el, hand } = ik(sh, target, L1, L2, side), issues = [];
  // chicken wing = upper arm (nearly) horizontal/up while the forearm hangs steeply down
  if (el[1] - sh[1] < 0.4 * L1 && hand[1] - el[1] > 0.6 * L2) issues.push('chicken-wing');
  if (Math.hypot(target[0] - sh[0], target[1] - sh[1]) > L1 + L2) issues.push('over-reach');
  if (Math.abs(el[0] - sh[0]) > L1 + 1 && false) issues.push('elbow-far');
  return { el, hand, issues };
}
function validateGesture(fn, rig = 's', n = 60) {
  let flagged = 0, frames = 0; const worst = [];
  for (let i = 0; i < n; i++) { const t = i * 0.1, p = fn(t); for (const [key, side] of [['armL', -1], ['armR', 1]]) if (p[key]) { frames++; const r = checkTarget(p[key], side, rig); if (r.issues.length) { flagged++; if (worst.length < 3) worst.push({ t: +t.toFixed(1), key, issues: r.issues }); } } }
  return { frames, flagged, worst };
}
module.exports = { checkTarget, validateGesture };
