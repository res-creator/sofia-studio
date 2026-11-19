// shots/01_open.js — cold open: the station at night (3D establishing) and the lit window (2D).
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, glow } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { station } from '../sets/station.js';
import { label, lt } from '../lib.js';

// s01 — 3D fly-in over the pine forest towards the station
registerShot('s01', {
  kind: '3d',
  init(T) {
    const M = mood('night');
    const st = T.stage({ mood: 'night', fov: V(38, 55), fog: [25, 90], keyPos: [-12, 16, 10], keyIntensity: 2.0, ambient: 1.3 });
    st.add(T.ground(200, 200, M.dark));
    const { THREE } = T; for (const [x, z, i] of [[-1, 4, 30], [4, 4, 22], [8.6, 3, 26]]) { const pl = new THREE.PointLight(M.practical, i, 14, 1.6); pl.position.set(x, x > 8 ? 3.8 : 2.2, z); st.add(pl); }
    // concrete building with lit windows
    st.add(T.box(14, 3.2, 6, M.wall, 0, 1.6, -2));
    st.add(T.box(14.6, 0.3, 6.6, '#1a1c2e', 0, 3.3, -2));
    for (const [x, lit] of [[-5.4, 0], [-3.4, 0], [-1.2, 1], [1.2, 1], [3.4, 0], [5.4, 1]]) { const w = T.windowPane(1.4, 1.1, { glowColor: M.practical, cols: 2, rows: 1, power: lit ? 0.9 : 0.0, lit: !!lit, interior: true }); w.position.set(x, 2.0, 1.02); st.add(w); }
    // mast + dish
    st.add(T.cyl(0.12, 0.18, 12, '#1a1c2e', 9, 6, -4, 6));
    const dish = T.cyl(1.6, 0.3, 0.6, '#2c3050', 9, 12.2, -4, 18); dish.rotation.x = -0.9; st.add(dish);
    const beacon = T.sphere(0.18, T.basic('#ff5a4a'), 9, 12.9, -4); st.add(beacon);
    // moon
    const moon = T.sphere(2.2, T.basic('#e8ecff'), -30, 26, -70); st.add(moon);
    // pine forest
    const r = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
    for (let i = 0; i < 140; i++) { const a = r(i) * Math.PI * 2, d = 11 + r(i + 400) * 45; const x = Math.cos(a) * d, z = Math.sin(a) * d - 6; if (z > -1 && x > -26 && x < 12) continue; st.add(T.pine3D(x, z, 1.4 + r(i + 900) * 1.4, '#0d1020')); }
    // lamp post light
    st.add(T.cyl(0.06, 0.08, 4, '#15121c', 8.6, 2, 2));
    const moonL = new THREE.DirectionalLight('#9fb0ff', 0.8); moonL.position.set(-20, 20, 30); st.add(moonL);
    st.add(T.sphere(0.22, T.basic('#ffe2b0'), 8.6, 4.05, 2));
    return { stage: st, beacon };
  },
  draw(s, t, info, T) {
    s.beacon.visible = Math.sin(t * 3) > -0.3;
    T.dolly(s.stage.camera, t, [[0, { pos: [-14, 9, 30], look: [0, 3, -2] }], [info.dur, { pos: [-6, 4.5, 17], look: [1, 2.5, -2] }]]);
  },
  overlay(g, t, info) {
    FX.stars(g, t, { count: 90, area: [0, 0, E.W, E.H * 0.22], seed: 7 });
    const a1 = ease.out(prog(t, lt(info, 'сентября', 0.8) - 0.2, lt(info, 'сентября', 0.8) + 0.3)) * clamp((info.dur - t) / 0.4);
    const a2 = ease.out(prog(t, lt(info, 'тысяча', 1.7), lt(info, 'тысяча', 1.7) + 0.5)) * clamp((info.dur - t) / 0.4);
    label(g, '26 СЕНТЯБРЯ', V(170, 90), E.H * V(0.32, 0.25), { size: V(64, 66), align: 'left', a: a1, color: S().ui.cream, spacing: 6 });
    label(g, '1983', V(172, 92), E.H * V(0.32, 0.25) + V(82, 86), { size: V(96, 100), align: 'left', a: a2, color: S().ui.gold, spacing: 10, glow: 26 });
  },
});

// s02 — "ночью, под Москвой."  the lit window with a silhouette inside, blurred pines in front
registerShot('s02', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.25 + 0.08 * k, x: -60 + 40 * k, y: 40 };
  const { GY, M } = station(g, t, cam, { silhouette: true });
  blurLayer(g, 12, (g) => { for (const [x, s] of [[120, 2.4], [330, 1.8], [E.W - 160, 2.6]]) FX.pine(g, x, E.H + 60, s, '#05060c'); }, cam, 1.7);
  FX.dust(g, t, { count: 40, color: '#c9d4ff', a: 0.25 });
  const a = ease.out(prog(t, lt(info, 'под', 1.0) - 0.1, lt(info, 'под', 1.0) + 0.4)) * clamp((info.dur - t) / 0.4);
  label(g, 'ПОД МОСКВОЙ', E.W - V(170, 90), E.H * V(0.2, 0.2), { size: V(46, 50), align: 'right', a, spacing: 8 });
  label(g, 'НОЧЬ · 00:15', E.W - V(172, 92), E.H * V(0.2, 0.2) + 60, { size: V(28, 32), align: 'right', a: a * 0.85, color: S().ui.gold, spacing: 6 });
} });
