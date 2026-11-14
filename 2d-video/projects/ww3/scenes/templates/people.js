// templates/people.js — character & location templates (2D scenes). Every template: camera move, rim light,
// atmosphere, words-synced beats via cues. Params are listed in each tpl() doc string.
import { E, V, S, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, seg, circle, ring, rr, glow, alpha, shade, mix, text, FONTS, linGrad, rng } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, blendPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { tpl } from './_registry.js';
import { fig, bigHead, cue, showAt, popAt, camMove, nameplate, label, plate, source, officerCap, chairAt, redPhone, oleander, icon } from '../lib.js';
import { WHO, COL } from '../cast.js';
import { station } from '../sets/station.js';
import { control, nearDesk } from '../sets/control.js';
import { study, studyDesk } from '../sets/study.js';
import { sub, subTable, subHull } from '../sets/sub.js';
import { ocean } from '../sets/ocean.js';
import { cockpit, seatBack } from '../sets/cockpit.js';
import { bomberSky, goldsboro } from '../sets/bomber.js';
import { kitchen, kitchenTable, bedroom, newsTV } from '../sets/home.js';
import { port } from '../sets/port.js';
import { field } from '../sets/field.js';
import { tramStreet, tramCar } from '../sets/tram.js';
import { atoll } from '../sets/atoll.js';
import { lab, labDesk } from '../sets/lab.js';
import { norad } from '../sets/norad.js';
import { space } from '../sets/space.js';
import { arctic } from '../sets/arctic.js';
import { city } from '../sets/city.js';

export const SETS = { station, control, study, sub, ocean, cockpit, bomberSky, goldsboro, kitchen, bedroom, port, field, tram: tramStreet, atoll, lab, norad, space, arctic, city };
// expression timeline: "worried" | [[frac, expr, cueName?], …]
export function exprAt(info, t, spec, def = 'neutral') {
  if (!spec) return def; if (typeof spec === 'string') return spec;
  let e = def; for (const [f, ex, c] of spec) { const at = c ? cue(info, c, f) : f * info.dur; if (t >= at) e = ex; } return e;
}
const GROUNDSIT = { ...POSES.sit, hip: [0, -30], sh: [1, -104], head: [4, -138], eF: [16, -70], hF: [38, -44], eB: [10, -70], hB: [30, -44], kF: [44, -40], fF: [70, 0], kB: [40, -38], fB: [62, 0] };
const blink = (t, p = 3.1, o = 0) => ((t + o) % p) > p - 0.1;
const camOf = (info, t, def = {}) => camMove(t, info.dur, { ...def, ...(info.cam || {}) });
const rimOf = (M, dir = [0.6, -0.8], extra = {}) => ({ color: M.rim, dir, w: 4, ...extra });
function dust(g, t, info, def = { count: 50, color: '#bcd0ff', a: 0.22 }) { if (info.fx === 'none') return; if (info.fx === 'rain') FX.rain(g, t); else if (info.fx === 'snow') FX.snow(g, t); else FX.dust(g, t, def); }
function tag(g, t, info) { // optional on-screen tag: params.tag = {str, cue, kind:'plate'|'label'|'source'}
  const tg = info.tag; if (!tg) return; const a = showAt(t, cue(info, tg.cue || 'tag', tg.at ?? 0.15), info.dur);
  if (tg.kind === 'source') source(g, tg.str, a); else if (tg.kind === 'label') label(g, tg.str, E.W / 2, E.H * V(0.15, 0.2), { a, size: V(44, 48), color: S().ui.gold }); else plate(g, tg.str, a);
}

// ---------------------------------------------------------------- generic establishing shot
tpl('establish', 'Wide of any set. params: set (station|control|study|sub|ocean|cockpit|bomberSky|goldsboro|kitchen|bedroom|port|field|tram|atoll|lab|norad|space|arctic|city), setOpts{}, cam{move,z,x,y,amt}, tag{str,cue,kind}, fx (dust|rain|snow|none), figures:[{who,x(0..1),s,facing,pose,expr}]', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1 }), fn = SETS[info.set || 'station'];
    const r = fn(g, t, cam, info.setOpts || {});
    if (info.figures) layer(g, cam, 1, (g) => info.figures.forEach((f, i) => fig(g, f.who, { x: E.W * (f.x ?? 0.5), y: r.GY ?? E.H * 0.8, s: f.s ?? 1, facing: f.facing ?? 1, pose: breathe(POSES[f.pose || 'stand'], t, 1, i), expr: f.expr || 'neutral', rim: rimOf(r.M || mood('night')), blink: blink(t, 3 + i * 0.3) })));
    dust(g, t, info); tag(g, t, info);
  } });

// ---------------------------------------------------------------- Petrov in the command post
const deskPose = { ...POSES.sit, eF: [30, -120], hF: [62, -132], eB: [22, -118], hB: [52, -128] };
const standDesk = { ...POSES.stand, eF: [24, -136], hF: [52, -118], eB: [14, -134], hB: [40, -116] };
const phoneSit = { ...POSES.sit, eF: [22, -150], hF: [16, -188], eB: [22, -118], hB: [52, -128] };
const micSit = { ...POSES.sit, eF: [22, -150], hF: [16, -188], eB: [30, -128], hB: [44, -160] };     // phone in one hand, microphone in the other
const PPOSE = { sit: POSES.sit, desk: deskPose, stand: standDesk, phone: phoneSit, mic: micSit };
tpl('petrovDesk', 'Petrov in the command post. params: pose (sit|desk|stand|phone|mic or [[frac,pose,cue]]), expr spec, alarm 0..1, banner 0..1, arcs n (0–5), lift (phone 0..1 or cue "lift"), z (1 wide … 1.8 medium), empty (no Petrov: empty chair + cap on desk), ghosts:[who…] (appear at cue "ghosts"), nameplate{name,role,cue}, frozen', {
  draw(g, t, info) {
    const z = info.z ?? 1.25, cam = camOf(info, t, { move: 'push', z, x: z > 1.4 ? -120 : 30, y: z > 1.4 ? 220 : 0 });
    const alarm = info.alarm ?? 0, arcsN = info.arcs ?? 0;
    const r = control(g, t, cam, { alarm, banner: info.banner, arcs: Array.from({ length: arcsN }, (_, i) => ({ p: 0.35 + 0.05 * t + i * 0.02 })), frozen: info.frozen, crewExpr: alarm > 0 ? 'worried' : 'neutral' });
    const PX = E.W / 2 - V(260, 200), s = 1.25;
    layer(g, cam, 1, (g) => {
      const rim = { color: mix(r.M.rim, r.red, alarm * 0.5), dir: [0.6, -0.8], w: 4 };
      if (info.ghosts) { const ga = ease.out(prog(t, cue(info, 'ghosts', 0.3), cue(info, 'ghosts', 0.3) + 1.2)); const slots = [PX - V(330, 200), PX - V(520, 330), PX + V(820, 520), PX + V(1010, 650), PX + V(1200, 780)]; info.ghosts.forEach((w, i) => { const gx = slots[i % slots.length];
        g.save(); g.globalAlpha *= ga * 0.9; fig(g, w, { x: gx, y: r.GY - 20, s: 1.05, facing: i > 1 ? -1 : 1, pose: breathe(POSES.stand, t, 1, i + 4), expr: 'neutral', rim: { color: '#e8f0ff', dir: [0, -1], w: 5 }, dim: true }); g.restore(); }); }
      let pose = info.pose || 'sit'; if (Array.isArray(pose)) { const keys = pose.map(([f, p, c]) => [c ? cue(info, c, f) : f * info.dur, PPOSE[p] || POSES[p]]); pose = posesAt(t, keys); } else pose = breathe(PPOSE[pose] || POSES[pose], t, 1, 2);
      const standing = info.pose === 'stand';
      chairAt(g, PX, r.GY, s, 1, '#0d0f1c');
      if (!info.empty) fig(g, 'petrov', { x: PX + (standing ? 10 : 0), y: r.GY, s, facing: 1, pose, expr: exprAt(info, t, info.expr, alarm ? 'worried' : 'neutral'), look: info.look || [0.6, -0.4], rim, blink: !info.frozen && blink(t, 3.3) });
      const lift = info.lift != null ? (typeof info.lift === 'number' ? info.lift : ease.inOut(prog(t, cue(info, 'lift', 0.5), cue(info, 'lift', 0.5) + 0.6))) : 0;
      const d = nearDesk(g, t, r.GY, r.M, { x: PX + V(90, 70) * s, alarm, keyC: r.keyC, lift });
      if (info.empty) officerCap(g, d.x + d.w * 0.6, d.top - 26, 30, 1, {});
    });
    if (info.nameplate) nameplate(g, t, { ...info.nameplate, start: cue(info, info.nameplate.cue || 'name', 0.2), dur: info.dur, x: E.W - V(720, 600), y: E.H - V(230, 520) });
    if (alarm > 0) veil(g, r.red, 0.06 * r.pulse, 'lighter');
    dust(g, t, info, { count: 40, color: alarm ? '#ffc0b0' : '#bcd0ff', a: 0.22 }); tag(g, t, info);
  } });

// ---------------------------------------------------------------- giant face close-up (any character)
const BGS = { control: (g, t) => control(g, t, { z: 1.7, x: -200, y: -150 }, {}), sub: (g, t, o) => sub(g, t, { z: 1.4 }, o), lab: (g, t) => lab(g, t, { z: 1.5 }), study: (g, t) => study(g, t, { z: 1.5 }), kitchen: (g, t) => kitchen(g, t, { z: 1.5 }), bedroom: (g, t, o) => bedroom(g, t, { z: 1.4 }, o), norad: (g, t, o) => norad(g, t, { z: 1.5, y: -100 }, o), atoll: (g, t, o) => atoll(g, t, { z: 1.4 }, o), tram: (g, t, o) => tramStreet(g, t, { z: 1.4 }, o), station: (g, t, o) => station(g, t, { z: 1.4 }, o), cockpit: (g, t, o) => cockpit(g, t, { z: 1.2 }, o) };
tpl('bigHead', 'Giant face close-up. params: who (cast id; Shoup is never used here), bg (set name), bgOpts{}, expr spec, look [x,y], side (-1 left of frame | 0 centre | 1 right), rimColor, alarm 0..1, rings (cue "rings": soft expanding rings — decision/realisation)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.7 }), bgO = info.bgOpts || {}, red = S().ui.accent;
    blurLayer(g, 14, (g) => (BGS[info.bg || 'control'] || BGS.control)(g, t, bgO)); veil(g, '#05070e', 0.45);
    if (info.alarm) veil(g, red, 0.08 * (0.5 + 0.5 * Math.sin(t * 7)), 'lighter');
    layer(g, cam, 1, (g) => {
      const side = info.side ?? 0, cx = E.W * (0.5 + side * V(0.18, 0.08)), cy = E.H * V(0.56, 0.5), r = V(300, 320);
      const M = mood(info.bg === 'kitchen' || info.bg === 'study' || info.bg === 'sub' ? 'interiorWarm' : 'interiorCool');
      bigHead(g, info.who || 'petrov', cx, cy, r, { expr: exprAt(info, t, info.expr, 'neutral'), look: info.look || [side ? -side * 0.3 : 0.3, -0.1], rimColor: info.rimColor || (info.alarm ? mix(M.rim, red, 0.6) : M.rim), rimSide: side > 0 ? -1 : 1, blink: blink(t, 2.9) });
      const rc = cue(info, 'rings', 2); if (info.rings && t > rc) FX.rings(g, cx, cy, t - rc, { count: 2, r0: r * 1.05, r1: r * 1.6, speed: 0.8, color: '#e8f0ff', a: 0.35 });
    });
    dust(g, t, info, { count: 30, color: '#e8f0ff', a: 0.2 }); tag(g, t, info);
  } });

// ---------------------------------------------------------------- B-59: three officers at the table
const nod = (p, k) => ({ ...p, head: [p.head[0] + 4 * k, p.head[1] + 8 * k] });
const shakeHead = (p, k) => ({ ...p, head: [p.head[0] + 6 * k, p.head[1]] });
tpl('subCouncil', 'Б-59: commander, zampolit, Arkhipov at the table. params: heat 0..1, alarm 0..1, focus (all|arkhipov|commander), cues: yes1, yes2 (nods), no (Arkhipov shakes head), expr per person {subcmd, zampolit, arkhipov} specs', {
  draw(g, t, info) {
    const foc = info.focus || 'all', z = foc === 'all' ? 1.05 : 1.65, cam = camOf(info, t, { move: 'push', z, x: foc === 'arkhipov' ? 250 : foc === 'commander' ? -250 : 0, y: foc === 'all' ? 0 : 220 });
    const r = sub(g, t, cam, { heat: info.heat ?? 0.7, alarm: info.alarm ?? 0, thermo: info.thermo ?? null });
    const y1 = cue(info, 'yes1', 0.25), y2 = cue(info, 'yes2', 0.45), no = cue(info, 'no', 0.65);
    layer(g, cam, 1, (g) => {
      const GY = r.GY, CX = r.CX, rim = { color: mix(r.M.rim, r.red, (info.heat ?? 0.7) * 0.4), dir: [0, -1], w: 4 };
      const k1 = Math.sin(clamp((t - y1) / 0.9) * Math.PI * 2) * (t > y1 && t < y1 + 0.9 ? 1 : 0), k2 = Math.sin(clamp((t - y2) / 0.9) * Math.PI * 2) * (t > y2 && t < y2 + 0.9 ? 1 : 0);
      const k3 = Math.sin((t - no) * 14) * (t > no && t < no + 1.1 ? 1 - (t - no) / 1.1 : 0);
      const E2 = info.expr || {};
      fig(g, 'subcmd', { x: CX - V(330, 240), y: GY, s: 1.15, facing: 1, pose: breathe(nod(POSES.sit, k1), t, 1, 1), expr: exprAt(info, t, E2.subcmd, 'angry'), rim, blink: blink(t, 3.4) });
      fig(g, 'zampolit', { x: CX - V(20, 10), y: GY - 20, s: 1.05, facing: 1, pose: breathe(nod(POSES.sit, k2), t, 1, 2), expr: exprAt(info, t, E2.zampolit, 'nervous'), rim, dim: true, blink: blink(t, 2.8) });
      fig(g, 'arkhipov', { x: CX + V(330, 240), y: GY, s: 1.15, facing: -1, pose: breathe(shakeHead(POSES.sit, k3), t, 1, 3), expr: exprAt(info, t, E2.arkhipov, t > no ? 'determined' : 'thinking'), rim, blink: blink(t, 3.1) });
      subTable(g, GY, r.M, CX - V(260, 200), V(560, 440), { key: r.key });
    });
    if ((info.heat ?? 0.7) > 0.4) FX.dust(g, t, { count: 60, color: '#ffb090', a: 0.25 }); tag(g, t, info);
  } });
tpl('subOutside', 'Б-59 under water: ships above, training-charge flashes (cue "f1","f2","f3"), optional surfacing (surface 0..1 or cue "rise"). params: ships n, depth 0..1 (sub y), dawn, rise (bool)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'driftL', z: 1 }), rise = info.rise ? ease.inOut(prog(t, cue(info, 'rise', 0.1), info.dur)) : 0;
    const fl = info.flashes === false ? [] : [cue(info, 'f1', 0.15), cue(info, 'f2', 0.45), cue(info, 'f3', 0.7)];
    const yy = lerp(E.H * (0.45 + 0.15 * (info.depth ?? 0.5)), E.H * 0.05, rise);
    ocean(g, t, cam, { mode: 'deep', ships: info.ships ?? 3, flashes: rise ? [] : fl, sub: { x: E.W / 2 + Math.sin(t * 0.3) * 20, y: yy, s: 0.9, tilt: -0.08 * rise }, dawn: (info.dawn ?? 0) + rise * 0.6 });
    tag(g, t, info);
  } });
tpl('k19', 'Flash-back К-19: cold reactor compartment, sailors fixing pipes with their hands (crouch/reach), steam, desaturated memory tint, plate «К-19, 1961». params: n sailors (2–4), tagStr', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'roll', z: 1.1 }); const r = sub(g, t, cam, { k19: true, alarm: 0.4 });
    layer(g, cam, 1, (g) => { const n = info.n ?? 3, poses = [POSES.reach, POSES.crouch, POSES.kneel, POSES.reach];
      for (let i = 0; i < n; i++) fig(g, i === 1 ? 'arkhipov' : 'crew', { x: r.CX - V(420, 260) + i * V(300, 200), y: r.GY, s: 1.05, facing: i % 2 ? -1 : 1, pose: breathe(poses[i], t, 1.5, i), expr: 'worried', rim: { color: '#bfe3ff', dir: [0, -1], w: 4 }, blink: blink(t, 3, i) });
      for (let i = 0; i < 3; i++) { const sx = r.CX - 200 + i * 260, k = (t * 0.7 + i * 0.3) % 1; g.save(); g.globalAlpha *= 0.25 * (1 - k); g.fillStyle = '#e8f4ff'; g.beginPath(); g.ellipse(sx, r.GY - V(560, 820) + k * -120, 40 + k * 120, 20 + k * 50, 0, 0, Math.PI * 2); g.fill(); g.restore(); } });
    veil(g, '#7f9ab8', 0.18, 'color'); plate(g, info.tagStr || 'К-19, 1961', showAt(t, 0.3, info.dur));
  } });

// ---------------------------------------------------------------- bomber 1961 / 1980
tpl('cockpitCrew', 'Bomber cockpit from behind two pilots. params: warn 0..1 (or cue "warn"), hatch (cue "hatch": one pilot climbs out through the top hatch), ground (parked, crews start engines; cue "start" lights up), expr', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1 }), wc = cue(info, 'warn', 0.3), warn = info.warn ?? (info.warnCue ? clamp((t - wc) * 3) : 0);
    const r = cockpit(g, t, cam, { warn, hatch: info.hatch ? ease.out(prog(t, cue(info, 'hatch', 0.4) - 0.4, cue(info, 'hatch', 0.4))) : 0, ground: info.ground, speed: info.ground ? 0 : 1 });
    const hc = cue(info, 'hatch', 0.4), up = info.hatch ? ease.inOut(prog(t, hc, hc + 1.4)) : 0;
    layer(g, cam, 1, (g) => r.seats.forEach((sx, i) => {
      const rim = { color: mix('#ffb84a', r.red, warn * 0.6), dir: [0, -1], w: 4 }, climbing = info.hatch && i === 0;
      const pose = climbing ? blendPose(POSES.sit, POSES.pointUp, up) : info.ground && t > cue(info, 'start', 0.5) ? { ...POSES.sit, eF: [30, -150], hF: [60, -170] } : POSES.sit;
      fig(g, 'pilot', { x: sx + (climbing ? up * V(220, 140) : 0), y: r.panelY + V(80, 100) - (climbing ? up * V(420, 520) : 0), s: 1.45, facing: i ? -1 : 1, pose: breathe(pose, t, 1, i), expr: exprAt(info, t, info.expr, warn > 0.2 ? 'scared' : 'neutral'), rim, blink: blink(t, 3, i), shadow: false });
      seatBack(g, sx, r.panelY + 150, 1.3); }));
    if (warn > 0) veil(g, r.red, 0.05 * r.pulse, 'lighter'); tag(g, t, info);
  } });
tpl('bomberNight', 'Exterior night sky 1961: the jet, the tanker (tanker:true), the fuel plume growing over the shot (leak), breakup at cue "break", parachutes after it. params: tanker, leak (true), breakup (true), chutes n', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'driftR', z: 1 }), bc = cue(info, 'break', 0.5), br = info.breakup ? ease.out(prog(t, bc, bc + 2.5)) : 0;
    const chutes = info.chutes ? Array.from({ length: info.chutes }, (_, i) => ({ x: E.W * (0.3 + i * 0.12), y: E.H * 0.3 + i * 30, p: clamp((t - bc - 0.6 - i * 0.3) / 3), s: 0.4 })).filter((c) => c.p > 0) : [];
    bomberSky(g, t, cam, { plane: { x: E.W * 0.55 + t * 20, y: E.H * 0.45, s: 0.75, rot: -0.04 + br * 0.2 }, tanker: info.tanker ? 1 : 0, leak: info.leak ? clamp(0.2 + t / info.dur) : 0, breakup: br, chutes });
    tag(g, t, info);
  } });
tpl('goldsboroField', 'Fields near Goldsboro at night: a canopy hanging on a tree (cue "tree") and/or the swamp (swamp:true). params: tree (bool), swamp (bool)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1 }), tc = cue(info, 'tree', 0.2);
    goldsboro(g, t, cam, { tree: info.tree !== false ? { chute: ease.out(prog(t, tc, tc + 1.5)) } : null, swamp: info.swamp ? 1 : null });
    FX.fog(g, E.H * 0.6, 300, '#4a5080', 0.15); tag(g, t, info);
  } });

// ---------------------------------------------------------------- ordinary life
tpl('kitchenNews', 'City kitchen, TV with the news; the viewer ("вы") at the table with a phone. params: who (viewer|petrov — Petrov at home 1998, no cap), tv{head,ticker}, pose (phone|sit|stand), expr spec, lampOn', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: info.z ?? 1.1 }), r = kitchen(g, t, cam, { tv: info.tv || {}, lampOn: info.lampOn });
    layer(g, cam, 1, (g) => { const px = r.CX - V(260, 140), pose = info.pose === 'stand' ? POSES.phone : info.pose === 'sit' ? POSES.sit : { ...POSES.sit, eF: [20, -130], hF: [40, -150] };
      if (info.pose !== 'stand') chairAt(g, px, r.GY, 1.2, 1, '#120c10');
      const who = info.who === 'petrov' ? { outfit: WHO.petrov.outfit } : null;
      if (who) drawFigure(g, { ...who, x: px, y: r.GY, s: 1.2, facing: 1, pose: breathe(pose, t, 1, 1), expr: exprAt(info, t, info.expr, 'neutral'), rim: rimOf(r.M, [0.3, -1]), blink: blink(t, 3.2) });
      else fig(g, info.who || 'viewer', { x: px, y: r.GY, s: 1.2, facing: 1, pose: breathe(pose, t, 1, 1), expr: exprAt(info, t, info.expr, 'neutral'), rim: rimOf(r.M, [0.3, -1]), blink: blink(t, 3.2), prop: info.pose === 'sit' ? null : { type: 'phone', glow: '#9fd8ff' } });
      kitchenTable(g, r.GY, r.M, px + V(70, 60)); });
    blurLayer(g, 10, (g) => { g.fillStyle = '#0c0a0e'; g.beginPath(); g.ellipse(E.W * 0.08, E.H * 1.02, 260, 120, 0, 0, Math.PI * 2); g.fill(); }, cam, 1.7);
    dust(g, t, info, { count: 40, color: '#ffe2b0', a: 0.2 }); tag(g, t, info);
  } });
tpl('phoneInsert', 'Insert: a hand holds a phone. params: screen (message|subscribe|nosignal|map), str (message text), cue "press" (thumb taps the button → «ВЫ ПОДПИСАНЫ»), bg (city|kitchen)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.6 }), ui = S().ui;
    blurLayer(g, 16, (g) => (info.bg === 'kitchen' ? kitchen(g, t, { z: 1.4 }) : city(g, t, { z: 1.3 }))); veil(g, '#05070e', 0.4);
    layer(g, cam, 1, (g) => {
      const pw = V(420, 520), ph = pw * 1.9, px = E.W * V(0.62, 0.5) - pw / 2, py = E.H * V(0.56, 0.5) - ph / 2 + V(80, 0);
      seg(g, [[px + pw * 0.9, E.H + 100], [px + pw * 0.75, py + ph * 0.7]], V(120, 150), S().ink);              // hand/arm
      rr(g, px - 16, py - 16, pw + 32, ph + 32, 50); g.fillStyle = '#05060a'; g.fill(); g.strokeStyle = alpha(mood('night').rim, 0.6); g.lineWidth = 4; g.stroke();
      rr(g, px, py, pw, ph, 38); g.fillStyle = linGrad(g, 0, py, 0, py + ph, ['#16203a', '#0a1020']); g.fill(); glow(g, px + pw / 2, py + ph / 2, pw * 1.2, '#9fd8ff', 0.12);
      const mode = info.screen || 'message', pc = cue(info, 'press', 0.55);
      if (mode === 'message') { const a = popAt(t, 0.3); rr(g, px + pw * 0.2, py + ph * 0.55, pw * 0.72, ph * 0.12, 26); g.fillStyle = alpha('#3a8aff', a); g.fill();
        text(g, info.str || 'Как вы там?', px + pw * 0.56, py + ph * 0.61, { size: pw * 0.075, color: '#fff', font: FONTS.ui, weight: 800, alpha: a });
        text(g, '✓✓', px + pw * 0.86, py + ph * 0.7, { size: pw * 0.05, color: alpha('#9fd8ff', showAt(t, 0.9, info.dur)), font: FONTS.ui, weight: 900 }); }
      if (mode === 'subscribe') { const pressed = t > pc, k = popAt(t, pc, 0.3); const bw = pw * 0.76, bh = ph * 0.1, bx = px + (pw - bw) / 2, by = py + ph * 0.62;
        rr(g, bx, by, bw, bh, bh / 2); g.fillStyle = pressed ? '#3a3e52' : ui.accent; g.fill(); if (!pressed) glow(g, bx + bw / 2, by + bh / 2, bw * 0.8, ui.accent, 0.35 + 0.15 * Math.sin(t * 5));
        text(g, pressed ? 'ВЫ ПОДПИСАНЫ' : 'ПОДПИСАТЬСЯ', bx + bw / 2, by + bh / 2 + 2, { size: bh * 0.38, color: '#fff', font: FONTS.ui, weight: 900, spacing: 2 });
        circle(g, px + pw * 0.5, py + ph * 0.3, pw * 0.16, '#2a3050'); icon(g, 'tv', px + pw * 0.5, py + ph * 0.3, pw * 0.0028, alpha(ui.cream, 0.6));
        text(g, 'СКВОЗЬ СТРАНЫ', px + pw / 2, py + ph * 0.46, { size: pw * 0.07, color: ui.cream, font: FONTS.ui, weight: 900, spacing: 2 });
        const th = Math.abs(t - pc) < 0.25 ? 1 - Math.abs(t - pc) / 0.25 : 0; circle(g, bx + bw * 0.62, by + bh * 0.6 + 30 * (1 - th), 46, alpha(S().ink, 0.9 * (t < pc + 0.6 ? 1 : 0)));
        if (pressed) FX.rings(g, bx + bw * 0.62, by + bh * 0.5, t - pc, { count: 2, r0: 20, r1: 120, color: '#fff', a: 0.5 * (1 - k * 0) }); }
      if (mode === 'nosignal') text(g, 'НЕТ СЕТИ', px + pw / 2, py + ph * 0.5, { size: pw * 0.1, color: ui.accent, font: FONTS.ui, weight: 900, spacing: 3, glow: 14, glowColor: alpha(ui.accent, 0.6) });
    });
    tag(g, t, info);
  } });
tpl('bedroomCall', '1980, 3:00 a.m.: the phone rings on the nightstand, the adviser sits up (cue "wake") and answers (cue "answer"). params: expr spec', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1.1 }), wk = cue(info, 'wake', 0.3), an = cue(info, 'answer', 0.6);
    const r = bedroom(g, t, cam, { ring: t < an ? 1 : 0, lamp: ease.out(prog(t, wk, wk + 0.4)) });
    layer(g, cam, 0.95, (g) => { const up = ease.inOut(prog(t, wk, wk + 0.8)), bx = r.CX - V(240, 160);
      const pose = t > an ? { ...POSES.sit, eF: [22, -150], hF: [16, -188] } : up > 0 ? POSES.sit : POSES.lie;
      fig(g, 'adviser', { x: bx + up * 60, y: r.GY - 70, s: 1.05, facing: 1, pose: breathe(pose, t, 1, 2), rot: up > 0 ? 0 : -Math.PI / 2, expr: exprAt(info, t, info.expr, t < wk ? 'sleepy' : 'shocked'), rim: rimOf(r.M, [0.6, -0.8]), blink: t < wk, shadow: false }); });
    tag(g, t, info);
  } });

// ---------------------------------------------------------------- NORAD / Santa
tpl('noradHall', 'Air-defence hall. params: screen (map|attack|digits|santa|radar|empty), digits [[frac,"000",cue?],…], digitsLabel, second (show 2nd screen "ПУСКОВ НЕТ"), alarm (0..1 or "cue" → cue "alarm"), crewExpr, shoup (Colonel Shoup from behind at a phone in the foreground), blip', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: info.z ?? 1 }), ac = cue(info, 'alarm', 0.3);
    const alarm = info.alarm === 'cue' ? clamp((t - ac) * 2) : info.alarm ?? 0;
    let digits = '000'; if (info.digits) for (const [f, d, c] of info.digits) if (t >= (c ? cue(info, c, f) : f * info.dur)) digits = d;
    const r = norad(g, t, cam, { screen: info.screen || 'map', p: clamp(t / info.dur * 1.2), digits, digitsLabel: info.digitsLabel, alarm, crewExpr: info.crewExpr || (alarm ? 'scared' : 'neutral'), second: info.second ? 'empty' : null, blip: info.blip });
    if (info.shoup) layer(g, cam, 1.15, (g) => { fig(g, 'shoup', { x: E.W * 0.22, y: r.GY + V(160, 120), s: 1.6, facing: -1, pose: breathe({ ...POSES.stand, eF: [20, -150], hF: [14, -190] }, t, 1, 7), expr: 'smile', rim: rimOf(r.M, [0.5, -0.9]) }); });
    if (alarm) veil(g, r.red, 0.05 * r.pulse, 'lighter'); dust(g, t, info); tag(g, t, info);
  } });
tpl('santaCall', '1955 split screen: left — a kid at home with a phone (happy), right — Colonel Shoup from behind at the hot-line phone (never his face). params: expr spec for the kid; cue "smile" (Shoup leans in, rings)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.5 }), W2 = E.W / 2;
    g.save(); g.beginPath(); g.rect(0, 0, W2 - 4, E.H); g.clip(); const rk = kitchen(g, t, { ...cam, x: -W2 * 0.45, z: 1.2 }, { lampOn: true, tv: { head: 'РОЖДЕСТВО' } });
    layer(g, { ...cam, x: 0 }, 1, (g) => { fig(g, 'kid', { x: W2 * 0.5, y: rk.GY + V(60, 40), s: 2.1, facing: 1, pose: breathe(POSES.phone, t, 1, 1), expr: exprAt(info, t, info.expr, 'happy'), rim: rimOf(rk.M, [0.4, -1]), blink: blink(t, 2.7), prop: { type: 'phone', glow: '#ffd59a' } });
      FX.rings(g, W2 * 0.5 + 60, rk.GY - 280, t, { count: 2, r0: 30, r1: 120, color: '#fff1e6', a: 0.35 }); }); g.restore();
    g.save(); g.beginPath(); g.rect(W2 + 4, 0, W2, E.H); g.clip(); const rn = norad(g, t, { ...cam, x: W2 * 0.4, z: 1.25 }, { screen: 'santa', p: clamp(t / info.dur), crewExpr: 'smile' });
    layer(g, { ...cam, x: 0 }, 1, (g) => { fig(g, 'shoup', { x: W2 * 1.45, y: rn.GY + 40, s: 1.6, facing: -1, pose: breathe({ ...POSES.stand, eF: [20, -150], hF: [14, -190] }, t, 1, 2), expr: 'smile', rim: rimOf(rn.M, [0.6, -0.8]), blink: false }); }); g.restore();
    g.fillStyle = '#05060a'; g.fillRect(W2 - 4, 0, 8, E.H); tag(g, t, info);
  } });

// ---------------------------------------------------------------- money, trade, food
tpl('bankQueue', '1914: a closed bank at night («ЗАКРЫТО»), a queue of plain silhouettes shuffling towards the door. params: n (people), sign', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'driftL', z: 1 }), r = city(g, t, cam, { bank: true, old: true, bankSign: info.sign });
    layer(g, cam, 1, (g) => { const n = info.n ?? 9; for (let i = 0; i < n; i++) { const x = r.CX + V(420, 200) + i * V(120, 90) - (t * 6) % 30, w = walkPose((t * 0.4 + i * 0.37) * Math.PI * 2 * 0.3);
      fig(g, 'crew', { x, y: r.GY + 20 + (i % 2) * 10, s: 0.95 - i * 0.01, facing: -1, pose: i % 3 ? breathe(POSES.stand, t, 1, i) : w, expr: i % 2 ? 'worried' : 'nervous', rim: rimOf(r.M, [-0.6, -0.8]), blink: blink(t, 3, i), dim: i > 3 }); } });
    FX.fog(g, E.H * 0.7, 200, '#4a5080', 0.12); tag(g, t, info);
  } });
tpl('portScene', 'Sea port at dusk (tanker, cranes, grain elevator). params: stopped (0..1 or cue "stop": lights go out, cranes freeze), truck (bool: grain truck drives along the berth), nz (green hills behind = New Zealand)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'driftL', z: 1 }), sc = cue(info, 'stop', 0.5);
    port(g, t, cam, { stopped: info.stopped === 'cue' ? ease.inOut(prog(t, sc, sc + 1.2)) : info.stopped ?? 0, truck: info.truck ? clamp(t / info.dur) : null, nz: info.nz });
    FX.dust(g, t, { count: 40, color: '#ffd8b0', a: 0.15 }); tag(g, t, info);
  } });
tpl('fieldScene', 'Wheat field. params: grey 0..1 (sunless sky) or "cue" (cue "grey" fades the sun out), frost 0..1 or "cue" (cue "frost": rime spreads), tractor (bool, cue "stop" stops it), wind, elevator', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'rise', z: 1 });
    const gr = info.grey === 'cue' ? ease.inOut(prog(t, cue(info, 'grey', 0.2), cue(info, 'grey', 0.2) + 2)) : info.grey ?? 0;
    const fr = info.frost === 'cue' ? ease.out(prog(t, cue(info, 'frost', 0.3), cue(info, 'frost', 0.3) + 1.5)) : info.frost ?? 0;
    const stopAt = cue(info, 'stop', 0.6); field(g, t, cam, { grey: gr, frost: fr, wind: info.wind ?? 0.6, elevator: info.elevator, tractor: info.tractor ? clamp(Math.min(t, stopAt) / info.dur) : null });
    if (fr > 0) FX.snow(g, t, { count: Math.round(40 * fr), speed: 20 }); tag(g, t, info);
  } });

// ---------------------------------------------------------------- Hiroshima tram / today
function girlsInside(t) { return (g, wins) => wins.forEach(([x, y, w, h], i) => { if (i % 2 && i !== 3) return; drawFigure(g, { x: x + w * 0.5, y: y + h + 40, s: 0.95, facing: 1, outfit: WHO.tramgirl.outfit, pose: breathe(POSES.stand, t, 1, i), expr: i === 0 ? 'determined' : 'neutral', rim: { color: '#ffe2b0', dir: [0, -1], w: 3 }, shadow: false }); }); }
tpl('tramRide', 'Hiroshima tram on an empty street (1945) or on a bridge today (today:true). Schoolgirls inside (yellow headbands). params: today, dir (1 → right, -1 ←), speed, flowers 0..1, closeup (car fills the frame, the conductor girl at the door)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'driftL', z: info.closeup ? 1.5 : 1, y: info.closeup ? 120 : 0 });
    const r = tramStreet(g, t, cam, { today: info.today, flowers: info.flowers });
    layer(g, cam, 1, (g) => { const dir = info.dir ?? 1, sp = info.speed ?? (info.closeup ? 30 : 140), x = E.W / 2 - dir * V(500, 260) + dir * t * sp;
      tramCar(g, x, r.railY, info.today ? 0.8 : 1, t, { inside: girlsInside(t), color: info.today ? '#5a7a8a' : '#3d5a4a' });
      if (info.closeup) fig(g, 'tramgirl', { x: x + V(420, 300), y: r.railY - 10, s: 1.25, facing: -1, pose: breathe(POSES.holdFront, t, 1, 4), expr: exprAt(info, t, info.expr, 'determined'), rim: rimOf(r.M, [-0.7, -0.6]), blink: blink(t, 3) }); });
    FX.dust(g, t, { count: 60, color: '#ffe2c0', a: 0.25 }); tag(g, t, info);
  } });
tpl('oleanderBloom', 'Grey ground → sprouts push up → pink oleanders bloom (cue "bloom"). params: n flowers, warm (end in golden light)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1 }), bl = cue(info, 'bloom', 0.4), k = ease.out(prog(t, 0, bl)), b = ease.out(prog(t, bl, bl + 1.5));
    const M = mood(b > 0.3 && info.warm !== false ? 'golden' : 'storm');
    layer(g, cam, 0.1, (g) => { g.fillStyle = linGrad(g, 0, -E.H, 0, E.H, [mix('#3a3a44', M.sky[0], b), mix('#6a6064', M.sky[M.sky.length - 1], b)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); });
    layer(g, cam, 0.8, (g) => { const GY = E.H * V(0.72, 0.62); g.fillStyle = linGrad(g, 0, GY, 0, E.H, ['#3a302c', '#120e0c']); g.fillRect(-E.W, GY, E.W * 3, E.H);
      const n = info.n ?? 14, r = rng(5); for (let i = 0; i < n; i++) { const x = E.W * 0.08 + i * (E.W * 0.84 / (n - 1)) + r() * 30, h = (120 + r() * 220) * k, y = GY + 20 + r() * 80;
        seg(g, [[x, y], [x + Math.sin(t + i) * 6, y - h]], 6, '#2f5a3a'); for (let j = 0; j < 3; j++) { g.fillStyle = '#3f7a4a'; g.beginPath(); g.ellipse(x + (j % 2 ? 18 : -18), y - h * (0.35 + j * 0.2), 22 * k, 7 * k, j % 2 ? 0.5 : -0.5, 0, Math.PI * 2); g.fill(); }
        for (let j = 0; j < 3; j++) oleander(g, x + (j - 1) * 16, y - h - 8 + (j % 2) * 10, 1.4, b, i * 3 + j); }
      if (b > 0) FX.godRays(g, E.W * 0.8, -50, { count: 10, angle: Math.PI * 0.65, spread: 0.9, len: 1400, a: 0.06 * b, t }); });
    FX.dust(g, t, { count: 40, color: '#ffe2c0', a: 0.2 }); tag(g, t, info);
  } });

// ---------------------------------------------------------------- Bikini
tpl('atollGather', 'Bikini, Feb 1946: Sunday, people sitting on the grass by the church; the governor (white uniform) talks to Chief Juda (lei). params: focus (crowd|talk), cue "answer" (Juda answers: nods, rings), expr {governor, chief}', {
  draw(g, t, info) {
    const talk = info.focus === 'talk', cam = camOf(info, t, { move: 'push', z: talk ? 1.6 : 1, x: talk ? -60 : 0, y: talk ? 200 : 0 }), r = atoll(g, t, cam, {});
    const an = cue(info, 'answer', 0.55);
    layer(g, cam, 1, (g) => { const rim = rimOf(r.M, [0.7, -0.7]);
      for (let i = 0; i < 12; i++) drawFigure(g, { x: r.CX - V(700, 420) + i * V(70, 46), y: r.GY + 30 + (i % 3) * 16, s: 0.62, facing: 1, outfit: WHO.crew.outfit, pose: breathe(GROUNDSIT, t, 1, i), expr: 'neutral', rim, dim: true, blink: blink(t, 3, i) });
      const E2 = info.expr || {};
      fig(g, 'governor', { x: r.CX - V(40, 20), y: r.GY + 40, s: 1.1, facing: 1, pose: breathe(t < an ? POSES.explain : POSES.stand, t, 1, 1), expr: exprAt(info, t, E2.governor, 'neutral'), rim, blink: blink(t, 3.2) });
      const ch = { x: r.CX + V(250, 140), y: r.GY + 40, s: 1.05, facing: -1, pose: breathe(t > an ? { ...POSES.stand, head: [6, -200] } : POSES.stand, t, 1, 2), expr: exprAt(info, t, E2.chief, t > an ? 'sad' : 'thinking'), rim, blink: blink(t, 3.5) };
      const [hx, hy] = fig(g, 'chief', ch); if (t > an) FX.rings(g, hx, hy, t - an, { count: 2, r0: 40, r1: 120, a: 0.3 }); });
    FX.dust(g, t, { count: 40, color: '#fff6e0', a: 0.18 }); tag(g, t, info);
  } });
tpl('atollBoats', 'Boats with sails leave the atoll shore (progress over the shot); optional empty beach today (empty:true, boats:false), golden light. params: empty, golden', {
  draw(g, t, info) { const cam = camOf(info, t, { move: 'pull', z: 1 }); atoll(g, t, cam, { boats: info.boats === false ? null : ease.inOut(clamp(t / info.dur)), empty: info.empty, golden: info.golden ?? true }); tag(g, t, info); } });
tpl('reef', 'Under water in the crater: corals, a fish school, sharks; plate optional. params: fish n, sharks n', {
  draw(g, t, info) { const cam = camOf(info, t, { move: 'driftL', z: 1 }); ocean(g, t, cam, { mode: 'reef', fish: info.fish ?? 50, sharks: info.sharks ?? 1 }); tag(g, t, info); } });
tpl('seabedCable', 'Seabed with a thin data cable glowing; optional garden-hose comparison inset at cue "hose". params: hose (bool)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'driftR', z: 1 }); ocean(g, t, cam, { mode: 'cable', ground: 0.7 });
    if (info.hose) { const a = showAt(t, cue(info, 'hose', 0.45), info.dur), x = E.W * 0.72, y = E.H * 0.3; if (a > 0) { g.save(); g.globalAlpha *= a;
      rr(g, x - 260, y - 150, 520, 300, 20); g.fillStyle = 'rgba(8,14,24,.8)'; g.fill(); g.strokeStyle = alpha(S().ui.cream, 0.4); g.lineWidth = 2; g.stroke();
      seg(g, [[x - 220, y - 40], [x + 220, y - 40]], 16, '#0b0c10'); seg(g, [[x - 220, y - 44], [x + 220, y - 44]], 3, alpha('#9fd8e8', 0.6)); seg(g, [[x - 220, y + 50], [x + 220, y + 50]], 18, '#3f8a4a');
      label(g, 'КАБЕЛЬ', x, y - 95, { size: 28 }); label(g, 'САДОВЫЙ ШЛАНГ', x, y + 105, { size: 28 }); g.restore(); } }
    tag(g, t, info);
  } });
tpl('deadForest', 'Chernobyl: a red, dead pine stand next to a living green forest, wolves/elk silhouettes walking (animals:true). params: animals', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'driftL', z: 1 }), M = mood('golden'), GY = E.H * V(0.8, 0.68);
    layer(g, cam, 0.1, (g) => { g.fillStyle = linGrad(g, 0, 0, 0, GY, ['#4a5a7a', '#c8a080']); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H); FX.sun(g, E.W * 0.8, GY - 260, 40, '#fff3dc', M.key, 4); });
    layer(g, cam, 0.5, (g) => { for (let i = 0; i < 40; i++) { const x = -E.W * 0.3 + i * 70, red = x > E.W * 0.45; FX.pine(g, x, GY - 20 + (i % 3) * 8, 1.3 + (i % 4) * 0.15, red ? mix('#a04a22', '#3a1a10', (i % 3) * 0.2) : '#14261c'); } FX.fog(g, GY - 200, 200, '#e8c8a0', 0.15); });
    layer(g, cam, 0.8, (g) => { g.fillStyle = linGrad(g, 0, GY - 20, 0, E.H, ['#3a3022', '#100c08']); g.fillRect(-E.W, GY - 20, E.W * 3, E.H);
      if (info.animals) for (let i = 0; i < 3; i++) { const x = E.W * 0.1 + i * 160 + t * 40, y = GY + 40 + i * 12; g.fillStyle = '#0a0806'; g.beginPath(); g.ellipse(x, y - 40, 50, 20, 0, 0, Math.PI * 2); g.fill(); for (const dx of [-36, -20, 24, 38]) seg(g, [[x + dx, y - 30], [x + dx + Math.sin(t * 6 + dx + i) * 5, y]], 5, '#0a0806'); seg(g, [[x + 44, y - 46], [x + 66, y - 70]], 12, '#0a0806'); circle(g, x + 70, y - 72, 12, '#0a0806'); } });
    tag(g, t, info);
  } });

// ---------------------------------------------------------------- scientists
tpl('scientists', 'Lab / computing centre. params: mode (one|two|empty), charts [left, right] (fall|rise|flat|spectrum), cue "vanish" (one: the scientist fades away → empty chair + papers, Aleksandrov 1985), expr spec, modern (monitors instead of tape reels)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: info.z ?? 1.15 }), r = lab(g, t, cam, { modern: info.modern });
    const mode = info.mode || 'one', ch = info.charts || ['fall', 'rise'], vc = cue(info, 'vanish', 0.5), va = mode === 'empty' ? 0 : info.vanish ? 1 - ease.inOut(prog(t, vc, vc + 1.2)) : 1;
    layer(g, cam, 1, (g) => { const rim = rimOf(r.M, [0, -1]);
      const seat = (x, who, f, chart, i) => { chairAt(g, x, r.GY, 1.15, f, '#0c0e18'); if (va > 0) { g.save(); g.globalAlpha *= (i === 0 ? va : 1); fig(g, who, { x, y: r.GY, s: 1.15, facing: f, pose: breathe({ ...POSES.sit, eF: [28, -124], hF: [60, -134] }, t, 1, i), expr: exprAt(info, t, info.expr, 'thinking'), rim, blink: blink(t, 3 + i * 0.4) }); g.restore(); }
        labDesk(g, t, r.GY, r.M, f > 0 ? x + V(60, 50) : x - V(520, 450), { chart, p: clamp(t / info.dur * 1.4), color: i ? S().ui.accent : S().ui.gold }); };
      if (mode === 'two') { seat(r.CX - V(560, 340), 'sci', 1, ch[0], 0); seat(r.CX + V(560, 340), 'sci2', -1, ch[1], 1); } else seat(r.CX - V(200, 120), 'sci', 1, ch[0], 0);
      if (mode === 'empty' || info.vanish) for (let i = 0; i < 4; i++) { g.save(); g.translate(r.CX - V(120, 60) + i * 40, r.GY - 152); g.rotate(-0.1 + i * 0.07); g.fillStyle = alpha('#e9e1cf', 1 - va * 0.5); g.fillRect(-36, -4, 72, 4); g.restore(); } });
    dust(g, t, info); tag(g, t, info);
  } });

// ---------------------------------------------------------------- 1995 arctic rocket / hot line / city phone
tpl('arcticRocket', 'Aurora over snow; a small research rocket climbs from the island (cue "launch"). params: rocket (bool)', {
  draw(g, t, info) { const cam = camOf(info, t, { move: 'rise', z: 1 }), lc = cue(info, 'launch', 0.25); arctic(g, t, cam, { rocket: info.rocket === false ? null : ease.in(prog(t, lc, info.dur + 1)) }); tag(g, t, info); } });
tpl('hotline', 'Hot line: two night skylines (no names, no flags), a glowing line links them; a teletype prints a paper strip in the middle (cue "print"). params: none', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1 }), r = city(g, t, cam, { twin: true }), pc = cue(info, 'print', 0.3), p = ease.inOut(prog(t, pc, pc + 2));
    layer(g, cam, 0.6, (g) => { const [a, b] = [r.left, r.right]; seg(g, [a, [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p]], 4, alpha(S().ui.gold, 0.9)); glow(g, a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, 60, S().ui.gold, 0.6); circle(g, a[0], a[1], 10, S().ui.gold); circle(g, b[0], b[1], 10, p > 0.98 ? S().ui.gold : '#3a3a48'); });
    layer(g, cam, 1, (g) => { const x = E.W / 2, y = r.GY + V(10, 30); rr(g, x - 150, y - 120, 300, 120, 12); g.fillStyle = '#141620'; g.fill(); g.strokeStyle = alpha(r.M.rim, 0.5); g.lineWidth = 3; g.stroke();
      for (let k = 0; k < 10; k++) circle(g, x - 110 + k * 24, y - 70, 7, '#2a2c3a'); const len = 40 + p * 220; g.fillStyle = '#e9e1cf'; g.fillRect(x - 70, y - 120 - len, 140, len);
      for (let k = 0; k < Math.floor(len / 18); k++) g.fillStyle = alpha('#2a2026', 0.6), g.fillRect(x - 56, y - 132 - k * 18, 60 + ((k * 37) % 50), 4); glow(g, x, y - 60, 200, '#ffd59a', 0.15); });
    tag(g, t, info);
  } });
tpl('cityPhone', 'A silhouette with a glowing phone against the night city. params: who (viewer), expr', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1.25, y: 160 }), r = city(g, t, cam, {});
    layer(g, cam, 1, (g) => { const [hx, hy] = fig(g, info.who || 'viewer', { x: E.W * 0.4, y: r.GY, s: 1.3, facing: 1, pose: breathe(POSES.phone, t, 1, 1), expr: exprAt(info, t, info.expr, 'neutral'), rim: rimOf(r.M, [-0.5, -0.9]), blink: blink(t, 3), prop: { type: 'phone', glow: '#9fd8ff' } }); glow(g, hx + 30, hy + 30, 120, '#9fd8ff', 0.3); });
    FX.dust(g, t, { count: 40, color: '#bcd0ff', a: 0.18 }); tag(g, t, info);
  } });
