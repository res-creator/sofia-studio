// "The Match King" — the edit, v2 (after the critique): a stronger hook, a new picture every 3–5 s (wide set → close-up → insert),
// fewer map repeats, Kreuger acting with blended poses / head turns / looks / walking, three caption styles, archive Time cover.
// node film.js still t1,t2,… out.png | frame t out.png | video out.mp4 [f0 f1]
const fs = require('fs'), { spawn } = require('child_process');
const P = require('./lib/par.js'), A = require('./lib/sets.js'), B = require('./lib/sets2.js'), C = require('./lib/sets3.js'), I = require('./lib/inserts.js'), K = require('./lib/kreuger.js');
const TL = require('./timeline.js'); const { L, E, at, cards, T } = TL;
const { W, H, clamp, lerp, ss, eo, back, createCanvas, plate, source } = P;
const S = Object.assign({}, A, B, C, I);
// ---------------- acting: keyframes [[t, {pose, expr, look, turn, tilt, …}], …] in GLOBAL time → a smooth puppet state ----------------
function act(base, keys) { return g => { let i = keys.findLastIndex(k => g >= k[0]); const cur = i >= 0 ? keys[i][1] : {}, prev = i > 0 ? keys[i - 1][1] : cur, u = i >= 0 ? ss((g - keys[i][0]) / 0.45) : 1;
  const o = Object.assign({}, base, prev, cur); o.pose = prev.pose || base.pose || 'rest'; o.pose2 = cur.pose || o.pose; o.poseMix = u;
  for (const k of ['turn', 'tilt']) o[k] = lerp(prev[k] ?? base[k] ?? 0, cur[k] ?? base[k] ?? 0, u) + (k === 'tilt' ? Math.sin(g * 0.9) * 0.025 : 0);
  const la = prev.look || base.look || [0, 0], lb = cur.look || base.look || [0, 0]; o.look = [lerp(la[0], lb[0], u) + Math.sin(g * 0.37) * 0.15, lerp(la[1], lb[1], u)];
  const bp = (g + 0.7) % 3.4; o.blink = bp < 0.13 ? Math.sin(bp / 0.13 * Math.PI) : (i >= 0 && g - keys[i][0] < 0.12 ? 0.8 : 0); return o; }; }
// ---------------- captions: plate (top-left bar), date tag (bottom-left typewriter), big number (counting up), stamp ----------------
const cap = (s, t0, t1, o = {}) => ({ t0, t1, fn: (ctx, g, a) => plate(ctx, s, o.x ?? 120, o.y ?? 150, a, Object.assign({ size: 54, bar: '#e3a83a' }, o)) });
const src = (s, t0, t1) => ({ t0, t1, fn: (ctx, g, a) => source(ctx, s, a) });
const date = (s, t0, t1) => ({ t0, t1, fn: (ctx, g, a) => { const n = Math.floor(clamp((g - t0) / 0.8) * s.length); ctx.save(); ctx.globalAlpha = clamp(a * 2); ctx.font = `700 40px "DejaVu Sans Mono", monospace`;
  const w = ctx.measureText(s).width; ctx.fillStyle = 'rgba(243,234,214,0.92)'; ctx.fillRect(100, H - 170, w + 44, 64); ctx.fillStyle = '#1b1410'; ctx.textBaseline = 'middle'; ctx.fillText(s.slice(0, n), 122, H - 137); ctx.restore(); } });
const num = (pre, v, suf, t0, t1, o = {}) => ({ t0, t1, fn: (ctx, g, a) => { const u = eo((g - t0) / 1.0), val = v * u, txt = pre + (o.dec ? val.toFixed(o.dec) : Math.round(val).toLocaleString('en-US')) + suf;
  plate(ctx, txt, o.x ?? W / 2, o.y ?? 520, a, { size: o.size || 130, align: 'center', bg: 'rgba(12,9,7,0.72)', col: o.col || '#f2c230' }); if (o.sub) plate(ctx, o.sub, o.x ?? W / 2, (o.y ?? 520) + 118, a, { size: 38, align: 'center', bg: 'rgba(12,9,7,0.72)' }); } });
const stamp = (s, t0, t1, o = {}) => ({ t0, t1, fn: (ctx, g, a) => { const k = back(clamp((g - t0) / 0.3)); ctx.save(); ctx.translate(o.x ?? W / 2, o.y ?? 540); ctx.rotate(o.rot ?? -0.12); ctx.scale(2 - k, 2 - k); ctx.globalAlpha = clamp(a) * 0.92;
  ctx.font = `900 ${o.size || 96}px ${P.F}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const w = ctx.measureText(s).width + 60; ctx.strokeStyle = '#c0281c'; ctx.lineWidth = 10; ctx.strokeRect(-w / 2, -(o.size || 96) * 0.75, w, (o.size || 96) * 1.5); ctx.fillStyle = '#c0281c'; ctx.fillText(s, 0, 6); ctx.restore(); } });
const quote = (s, by, t0, t1, y = 880) => ({ t0, t1, fn: (ctx, g, a) => { const words = s.split(' '), lines = []; let cur = '';   // wrap at ≈ 40 characters
  for (const w of words) { if ((cur + ' ' + w).trim().length > 40 && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); } lines.push(cur);
  const y0 = y - (lines.length - 1) * 70; lines.forEach((l, i) => plate(ctx, l, W / 2, y0 + i * 70, a, { size: 46, align: 'center', bg: 'rgba(15,10,8,0.85)', font: P.SERIF, weight: 700 }));
  plate(ctx, by, W / 2, y + 84, a, { size: 26, align: 'center', bg: 'rgba(15,10,8,0.85)', col: '#e3a83a' }); } });
const matchProp = (ctx, g) => { ctx.save(); ctx.rotate(-0.25); ctx.fillStyle = '#e8c88f'; ctx.fillRect(-3, -70, 6, 80); ctx.fillStyle = '#9b1d1d'; ctx.beginPath(); ctx.ellipse(0, -72, 6, 8, 0, 0, 7); ctx.fill(); P.flame(ctx, 0, -76, 0.55, g); ctx.restore(); };
const penProp = ctx => { ctx.save(); ctx.rotate(0.5); ctx.fillStyle = '#16120f'; ctx.fillRect(-3, 10, 6, 60); ctx.fillStyle = '#d8b45a'; ctx.fillRect(-3, 10, 6, 8); ctx.restore(); };
const drawings = c => { c.save(); c.rotate(1.2); c.fillStyle = '#e9e4d4'; c.fillRect(-12, -60, 24, 150); c.strokeStyle = '#7a8aa0'; c.lineWidth = 2; c.strokeRect(-12, -60, 24, 150); c.restore(); };
const KING = { age: 'king' }, YOUNG = { age: 'young' };
const shots = [];
const shot = (t0, set, o, tr = 'fade', over = []) => shots.push({ t0, set, o: typeof o === 'function' ? o : () => o || {}, tr, over });
const K_ = (base, keys) => { const f = act(base, keys); return g => f(g); };
// local helper: maproom flow/pin times are local to the shot → pass global times through rel()
const rel = (g, gl) => t => t - g + gl;
// ======================= COLD OPEN =======================
shot(0, 'strike', { at: 0.9 }, 'cut');
shot(L.h1 - 0.2, 'room', (gl, g) => ({ burn: () => 1, cam: [[0, 120, 40, 1.35, 1.0], [6, 0, 0, 1.1, 1.0]] }), 'fade', [date('PARIS · 12 MARCH 1932', L.h1 + 0.3, E.h1)]);
shot(at('h1', 'one') - 0.15, 'archive', { dur: 5 }, 'flash', [cap('ONE OF THE MOST POWERFUL MEN IN BUSINESS', at('h1', 'one'), at('h1', 'police'), { size: 42 })]);
shot(at('h1', 'police') - 0.2, 'paris', { date: false, cam: [[0, 0, 160, 1.15, 1.3], [4, 40, 60, 1.25, 1.3]] }, 'whip', [stamp('SUICIDE', at('h1', 'suicide'), E.h1 + 0.3, { x: 1400, y: 300, size: 80 })]);
const kH2 = K_(Object.assign({}, KING), [[L.h2, { pose: 'rest', expr: 'cold', look: [0.6, 0], turn: 0.3 }], [at('h2', 'companies'), { look: [0, 0.2], turn: 0 }]]);
shot(L.h2 - 0.2, 'closeup', (gl, g) => ({ k: kH2(g), bg: ['#3a2618', '#140c08'] }), 'zoom', [cap('IVAR KREUGER', at('h2', 'Ivar'), at('h2', 'companies'), { size: 64 })]);
shot(at('h2', 'companies') - 0.15, 'factory', { cam: [[0, 0, 0, 1.3, 1.0], [5, 160, -30, 1.1, 1.0]] }, 'whip', [num('≈ ', 2, '/3', at('h2', 'two'), at('h2', 'He'), { sub: "OF THE WORLD'S MATCHES" })]);
shot(at('h2', 'He') - 0.15, 'maproom', (gl, g) => ({ flows: ['Paris', 'Berlin', 'Warsaw', 'Budapest', 'Athens', 'Bucharest', 'Riga', 'Ankara', 'Belgrade'].map((c, i) => ['Stockholm', c, i * 0.12, 0.9, '#e3a83a', 80 + i * 10]), cam: [[0, 330, -40, 1.2, 1.25], [6, 380, -60, 1.3, 1.25]] }), 'zoom',
  [num('≈ $', 400, ' MILLION', at('h2', 'four'), E.h2 + 0.3, { sub: 'LENT TO ≈ 15 GOVERNMENTS', y: 480 })]);
shot(L.h3 - 0.2, 'doc', { kind: 'ledger', markAt: 0.6 }, 'fade', [stamp('NEVER EXISTED', at('h3', 'never'), at('h3', 'About'), { size: 90 })]);
shot(at('h3', 'About') - 0.15, 'accountants', (gl, g) => ({ crumble: () => clamp((g - at('h3', 'never', 1)) / 1.2) }), 'whip', [num('≈ $', 250, ' MILLION', at('h3', 'two'), E.h3 + 0.2, { sub: 'OF ASSETS THAT NEVER EXISTED', col: '#ff6a5a' })]);
const kH4 = K_(Object.assign({}, KING, { rim: '200,210,255' }), [[L.h4, { pose: 'rest', expr: 'cold' }], [L.h4 + 1.5, { pose: 'open', expr: 'smile', turn: -0.2 }]]);
shot(L.h4 - 0.2, 'penthouse', (gl, g) => ({ date: false, k: kH4(g) }), 'fade', [cap('BANKS · INVESTORS · WHOLE COUNTRIES', at('h4', 'banks'), at('h4', 'It'), { size: 44 })]);
shot(at('h4', 'It') - 0.15, 'factory', { cam: [[0, 200, -40, 1.45, 1.0], [5, 0, 0, 1.25, 1.0]] }, 'whip');
shot(at('h4', 'And', 1) - 0.1, 'strike', { at: 0.6, lab: 'SÄKERHETS-TÄNDSTICKOR' }, 'cut');
// ======================= 1 · THE ENGINEER =======================
shot(L.k1 - 0.1, 'kalmar', {}, 'iris', [date('KALMAR, SWEDEN · 1880', at('k1', 'born'), E.k1)]);
const kK1 = K_(Object.assign({}, YOUNG), [[at('k1', 'twenty') - 0.5, { pose: 'rest', expr: 'smile', look: [1, 0], legs: 'walk' }]]);
shot(at('k1', 'He') - 0.15, 'closeup', (gl, g) => ({ k: Object.assign(K_(Object.assign({}, YOUNG), [[0, { pose: 'hold', expr: 'smile', look: [0.5, -0.3], turn: 0.2, prop: drawings }]])(g)), bg: ['#5a6a7a', '#2a3440'], bokeh: '220,230,255', grade: 'cold' }), 'fade', [cap('ENGINEERING · STOCKHOLM', at('k1', 'studied'), at('k1', 'twenty'), { size: 44 })]);
shot(at('k1', 'twenty') - 0.2, 'kalmar', (gl, g) => ({ k: Object.assign(kK1(g), { walk: g * 0.9 }), kx: lerp(700, 1350, ss(gl / 4)), cam: [[0, 100, 0, 1.15, 1.4], [4, 260, 0, 1.2, 1.4]] }), 'whip');
const kK2 = K_(Object.assign({}, YOUNG, { prop: drawings }), [[L.k2, { pose: 'hold', expr: 'smile', look: [-0.5, -0.6], turn: -0.2 }], [at('k2', 'as') , { look: [0.6, -0.8], turn: 0.25 }]]);
shot(L.k2 - 0.2, 'newyork', (gl, g) => ({ date: false, k: kK2(g) }), 'whip', [date('NEW YORK · EARLY 1900s', L.k2 + 0.4, at('k2', 'According'))]);
shot(at('k2', 'According') - 0.15, 'closeup', (gl, g) => ({ k: kK2(g), bg: ['#c4644a', '#2c2a4a'], bokeh: '255,200,120' }), 'fade', [cap('THE FLATIRON', at('k2', 'Flatiron'), E.k2), src('SOURCE: FORTUNE, MAY 1933', at('k2', 'Fortune'), E.k2)]);
const kK3 = K_(Object.assign({}, YOUNG), [[L.k3, { pose: 'rest', expr: 'smile' }], [at('k3', 'They'), { pose: 'open', expr: 'smile', turn: 0.3 }], [at('k3', 'stadium') - 0.4, { pose: 'point', look: [1, -0.5], turn: 0.4 }]]);
shot(L.k3 - 0.2, 'stadium', (gl, g) => ({ date: false, k: kK3(g), cam: gl < 6 ? [[0, -260, 0, 1.0, 1.0], [6, -100, 0, 1.05, 1.0]] : [[0, -100, 0, 1.25, 1.0], [14, 100, 0, 1.3, 1.0]] }), 'whip',
  [cap('1908 · KREUGER & TOLL', at('k3', '1908'), at('k3', 'They')), cap('REINFORCED CONCRETE', at('k3', 'concrete') - 0.3, at('k3', 'Their')), date('STOCKHOLM OLYMPICS · 1912', at('k3', 'stadium'), E.k3 + 0.3)]);
shot(L.k4 - 0.2, 'closeup', (gl, g) => ({ k: K_(Object.assign({}, YOUNG), [[L.k4, { pose: 'rest', expr: 'neutral', look: [-0.6, 0], turn: -0.3 }], [at('k4', 'He'), { expr: 'cold', look: [0, 0.3], turn: 0 }]])(g), bg: ['#4a3020', '#1e140c'] }), 'fade');
shot(at('k4', 'Matches') - 0.5, 'strike', { at: 0.55 }, 'cut');
// ======================= 2 · THE MATCH TRUST =======================
shot(L.t1 - 0.1, 'factory', { cam: [[0, 200, -40, 1.4, 1.0], [6, 0, 0, 1.1, 1.0]] }, 'iris', [cap('EVERY HOME · EVERY DAY', at('t1', 'everyone'), at('t1', 'Sell'))]);
shot(at('t1', 'Sell') - 0.15, 'factory', { cam: [[0, -300, 120, 1.6, 1.0], [5, 300, 120, 1.6, 1.0]] }, 'whip', [cap('SELL ENOUGH OF THEM, EVERYWHERE', at('t1', 'Sell'), E.t1 + 0.3, { size: 50 }), cap('A TINY PROFIT ON EACH', at('t1', 'tiny'), E.t1 + 0.3, { y: 250, size: 42, bar: null })]);
const kT2 = K_(Object.assign({}, KING), [[L.t2, { pose: 'rest', expr: 'cold', legs: 'walk' }], [at('t2', '1917'), { pose: 'open', expr: 'smile', legs: 'stand', turn: 0.2 }]]);
shot(L.t2 - 0.2, 'factory', (gl, g) => ({ k: Object.assign(kT2(g), { walk: g * 0.8 }), kx: lerp(1700, 1200, ss(gl / 4)) }), 'whip', [date('1913 · BUYING UP THE FACTORIES', at('t2', '1913'), at('t2', '1917'))]);
shot(at('t2', '1917') - 0.2, 'closeup', (gl, g) => ({ k: kT2(g) }), 'zoom', [cap('1917 · SWEDISH MATCH', at('t2', '1917'), E.t2, { size: 64 }), cap('PRESIDENT: IVAR KREUGER', at('t2', 'president'), E.t2, { y: 250, size: 40, bar: null })]);
shot(L.t3 - 0.2, 'maproom', (gl, g) => { const r = rel(g, gl); return { flows: [['Stockholm', 'Boston', r(at('t3', 'Boston')), 1.4, '#e3a83a', 260]], pins: [['Boston', r(at('t3', 'Boston')), 'BOSTON · LEE, HIGGINSON & CO.']], cam: [[0, -200, 0, 1.1, 1.25], [12, -100, 0, 1.15, 1.25]] }; }, 'zoom', [date('1923', at('t3', '1923'), at('t3', 'International'))]);
shot(at('t3', 'International') - 0.15, 'doc', { kind: 'certificate' }, 'whip', [cap('INTERNATIONAL MATCH CORPORATION · USA', at('t3', 'International'), E.t3, { size: 44 })]);
shot(L.t4 - 0.2, 'maproom', (gl, g) => ({ flows: [0, 1, 2].map(i => ['New York', 'Stockholm', 0.3 + i * 0.4, 1.6, '#e3a83a', 260 + i * 40]), cam: [[0, 0, 0, 1.0, 1.25], [8, 120, 0, 1.08, 1.25]] }), 'fade',
  [num('≈ $', 250, ' MILLION', at('t4', 'two'), at('t4', 'They', 1), { sub: 'FROM AMERICAN INVESTORS' }), src('SOURCE: FORTUNE, MAY 1933', at('t4', 'two'), at('t4', 'They', 1))]);
shot(at('t4', 'They', 1) - 0.15, 'closeup', (gl, g) => ({ k: K_(Object.assign({}, KING), [[0, { pose: 'open', expr: 'smile', turn: -0.2, look: [-0.4, 0] }]])(g) }), 'fade', [cap('AMONG THE MOST WIDELY HELD SECURITIES IN THE WORLD', at('t4', 'most'), E.t4 + 0.3, { size: 38 })]);
// ======================= 3 · MATCHES FOR MONEY =======================
const kM1 = K_(Object.assign({}, KING, { legs: false }), [[L.m1, { pose: 'open', expr: 'smile', turn: -0.2 }], [at('m1', 'return'), { pose: 'hand', expr: 'cold', turn: 0.2 }]]);
shot(L.m1 - 0.1, 'hall', (gl, g) => ({ k: kM1(g) }), 'iris', [cap('AFTER THE WAR: GOVERNMENTS ARE BROKE', at('m1', 'many'), (at('m1', 'lend') - 0.35), { size: 44 })]);
shot((at('m1', 'lend') - 0.35) - 0.15, 'closeup', (gl, g) => ({ k: kM1(g), bg: ['#6e5a44', '#2a2018'], window: '#e9d8b0' }), 'fade', [cap('A LOAN  ⇄  A MATCH MONOPOLY', at('m1', 'return'), E.m1, { size: 50 })]);
shot(L.m2 - 0.2, 'maproom', (gl, g) => { const r = rel(g, gl); return { pins: [['Warsaw', r(at('m2', 'Poland')), 'POLAND · 1925 · $6 M', -110], ['Paris', r(at('m2', 'France')), 'FRANCE · 1927 · $75 M'], ['Berlin', r(at('m2', 'Germany')), 'GERMANY · 1929 · $125 M']],
  flows: [['Stockholm', 'Warsaw', r(at('m2', 'Poland')), 0.8, '#e3a83a', 60], ['Stockholm', 'Paris', r(at('m2', 'France')), 0.8, '#e3a83a', 120], ['Stockholm', 'Berlin', r(at('m2', 'Germany')), 0.8, '#e3a83a', 60]],
  cam: [[0, 380, -60, 1.3, 1.25], [r(at('m2', 'Germany')), 420, -40, 1.42, 1.25], [r(at('m2', 'Germany')) + 3, 520, -120, 1.9, 1.25]] }; }, 'zoom', [src('SOURCE: TIME, 21 MARCH 1932', at('m2', 'Poland'), E.m2)]);
shot(at('m2', 'In', 3) - 0.15, 'factory', { cam: [[0, 0, 0, 1.2, 1.0], [5, 100, 0, 1.3, 1.0]] }, 'whip', [stamp('NO RUSSIAN MATCHES', at('m2', 'Russian'), E.m2 + 0.4, { size: 70 })]);
shot(L.m2b - 0.2, 'maproom', (gl, g) => { const r = rel(g, gl), s = r(at('m2b', 'Much')); return { flows: [['New York', 'Stockholm', s, 1.4, '#e3a83a', 300]], cam: [[0, 100, 0, 1.0, 1.25], [6, 160, 0, 1.06, 1.25]] }; }, 'fade', [cap('WHERE DID THE MONEY COME FROM?', at('m2b', 'where'), at('m2b', 'To'), { size: 46 })]);
shot(at('m2b', 'To') - 0.15, 'doc', { kind: 'certificate', title: 'INTERNATIONAL MATCH', sub: 'CORPORATION · BOND · NEW YORK', big: 'BOND' }, 'whip', [num('$', 50, ' MILLION', at('m2b', 'fifty'), at('m2b', 'Money', 1), { sub: 'OF BONDS SOLD IN THE US', y: 470 })]);
shot(at('m2b', 'Money', 1) - 0.15, 'maproom', (gl, g) => { const r = rel(g, gl), c = r(at('m2b', 'Money', 1)); return { flows: [['New York', 'Stockholm', c, 1.2, '#e3a83a', 300], ['Stockholm', 'Paris', c + 1.0, 0.9, '#e3a83a', 120], ['Paris', 'New York', c + 2.2, 1.4, '#57a06a', -200]], cam: [[0, 100, 0, 1.0, 1.25], [8, 200, 0, 1.06, 1.25]] }; }, 'fade',
  [stamp('A PERFECT CIRCLE', at('m2b', 'circle') - 0.2, E.m2b + 0.4, { size: 70, rot: -0.06, col: '#c0281c' })]);
shot(L.m3 - 0.2, 'maproom', (gl, g) => { const n = ['Athens', 'Budapest', 'Belgrade', 'Bucharest', 'Riga', 'Ankara']; return { pins: [['Warsaw', -10], ['Paris', -10], ['Berlin', -10]].concat(n.map((c, i) => [c, i * 0.42 + 0.1])), cam: [[0, 420, -40, 1.35, 1.25], [5, 380, 0, 1.25, 1.25]] }; }, 'cut');
shot(at('m3', 'By') - 0.15, 'closeup', (gl, g) => ({ k: K_(Object.assign({}, KING), [[0, { pose: 'count', expr: 'cold', look: [0, 0.6] }]])(g) }), 'whip', [num('≈ $', 400, ' MILLION', at('m3', 'four'), E.m3 + 0.3, { sub: '≈ 15 GOVERNMENTS', y: 300, x: 520, size: 100 })]);
shot(L.m4 - 0.2, 'maproom', (gl, g) => ({ pins: ['Warsaw', 'Paris', 'Berlin', 'Athens', 'Budapest', 'Belgrade', 'Bucharest', 'Riga', 'Ankara'].map(c => [c, -10]), matchFill: () => ss((g - L.m4) / 5) }), 'fade',
  [num('≈ ', 60, ' %', at('m4', 'sixty'), at('m4', 'Other'), { sub: 'OF WORLD MATCH PRODUCTION · 33 COUNTRIES · 1930', y: 460 }), src('SOURCE: SWEDISH MATCH', at('m4', 'sixty'), E.m4)]);
shot(at('m4', 'Other') - 0.15, 'factory', { cam: [[0, -100, 0, 1.0, 1.0], [4, 100, 0, 1.08, 1.0]] }, 'whip');
shot(L.m5 - 0.2, 'hall', (gl, g) => ({ k: K_(Object.assign({}, KING, { legs: false }), [[0, { pose: 'open', expr: 'smile' }]])(g), cam: [[0, 0, 0, 1.0, 1.0], [6, 80, 40, 1.2, 1.0]] }), 'fade');
shot(at('m5', 'That') - 0.15, 'closeup', (gl, g) => ({ k: K_(Object.assign({}, KING), [[0, { pose: 'rest', expr: 'smile', look: [0, 0] }], [at('m5', 'Trust') - 0.3, { expr: 'cold', look: [0, 0.1] }]])(g), bg: ['#2a1a10', '#0c0806'] }), 'zoom',
  [{ t0: at('m5', 'Trust'), t1: E.m5 + 0.8, fn: (ctx, g, a) => plate(ctx, 'TRUST', W / 2, 900, a, { size: 140, align: 'center', bg: 'rgba(15,10,8,0.75)', col: '#f2c230' }) }]);
// ======================= 4 · THE MATCH PALACE =======================
shot(L.p1 - 0.1, 'palace', (gl, g) => ({ k: Object.assign(K_(Object.assign({}, KING), [[0, { pose: 'rest', legs: 'walk' }]])(g), { walk: g * 0.8 }), kx: lerp(1700, 1250, ss(gl / 6)) }), 'iris', [date('STOCKHOLM · 1928', L.p1 + 0.4, E.p1 + 0.4)]);
shot(L.p2 - 0.2, 'penthouse', (gl, g) => ({ date: false, k: K_(Object.assign({}, KING, { rim: '200,210,255' }), [[0, { pose: 'rest', expr: 'cold', turn: -0.3, look: [-0.8, 0] }]])(g) }), 'whip', [date('PARK AVENUE, NEW YORK', L.p2 + 0.2, (at('p2', 'twenty') - 0.3))]);
shot((at('p2', 'twenty') - 0.3) - 0.15, 'palace', (gl, g) => ({ office: 1, k: K_(Object.assign({}, KING, { legs: false }), [[0, { pose: 'open', expr: 'smile' }]])(g), cam: [[0, 0, 0, 1.2, 1.0], [5, 0, 20, 1.3, 1.0]] }), 'whip', [cap('PARIS · BERLIN · STOCKHOLM · A PRIVATE ISLAND', (at('p2', 'twenty') - 0.3), E.p2 + 0.3, { size: 40 })]);
shot(L.p3 - 0.2, 'archive', { dur: 6 }, 'zoom');
shot(at('p3', 'It') - 0.15, 'newsstand', { crash: 1 }, 'flash', [stamp('WALL STREET CRASH', at('p3', 'Wall'), E.p3 + 0.5, { size: 72, y: 300 })]);
shot(L.p4 - 0.2, 'hall', (gl, g) => ({ k: K_(Object.assign({}, KING, { legs: false }), [[0, { pose: 'rest', expr: 'smile', turn: -0.2 }]])(g) }), 'fade', [cap('NOBODY CHECKED HIS NUMBERS', at('p4', 'nobody'), at('p4', 'As', 1), { size: 46 })]);
shot(at('p4', 'As', 1) - 0.15, 'closeup', (gl, g) => ({ k: K_(Object.assign({}, KING), [[0, { pose: 'rest', expr: 'smile', look: [0.3, 0] }]])(g), ky: 680 }), 'fade', [quote('"TO ACCEPT A SWEDISH AUDIT OF THE GREATEST SWEDE"', 'TIME, 18 APRIL 1932', at('p4', 'to'), E.p4 + 0.3)]);
shot(L.p5 - 0.2, 'palace', (gl, g) => ({ office: 1, k: K_(Object.assign({}, KING, { legs: false }), [[0, { pose: 'rest', expr: 'cold' }], [at('p5', 'mostly'), { pose: 'open', expr: 'smile' }]])(g), cam: [[0, 0, -60, 1.1, 1.0], [6, 0, 40, 1.25, 1.0]] }), 'fade', [num('≈ $', 50000, '', at('p5', 'fifty'), at('p5', 'controlled'), { sub: 'OF VOTING SHARES · MOSTLY HIS', size: 100, y: 300, x: 1400 })]);
shot(at('p5', 'controlled') - 0.15, 'doc', { kind: 'certificate', title: 'KREUGER & TOLL', sub: 'STOCKHOLM · VOTING SHARES', big: 'CLASS A' }, 'whip', [num('> $', 1, ' BILLION', at('p5', 'billion') - 0.3, E.p5 + 0.4, { sub: 'OF COMPANIES UNDER HIS CONTROL', y: 520 })]);
// ======================= 5 · THE TRICK =======================
shot(L.r1 - 0.1, 'hourglass', { dur: E.r1 - L.r1 }, 'iris', [cap('GOVERNMENTS PAY BACK OVER DECADES', at('r1', 'government'), at('r1', 'But'), { size: 44, bar: '#57a06a' }), cap('INVESTORS WANT DIVIDENDS EVERY YEAR', at('r1', 'But'), E.r1 + 0.3, { size: 44, bar: '#c0281c' })]);
shot(L.r2 - 0.2, 'coins', {}, 'fade', [src('SOURCE: KREUGER & TOLL RECORDS, PRINCETON UNIVERSITY LIBRARY', at('r2', 'dividends'), E.r2)]);
shot(at('r2', 'new') - 0.15, 'maproom', (gl, g) => ({ flows: [0, 1, 2].map(i => ['New York', 'Stockholm', i * 0.4, 1.2, '#c0281c', 280 + i * 30]).concat([0, 1].map(i => ['Stockholm', 'Boston', 0.8 + i * 0.5, 1.2, '#c0281c', -160 - i * 30])), cam: [[0, 0, 0, 1.0, 1.25], [6, 100, 0, 1.06, 1.25]] }), 'fade', [cap('NEW MONEY PAYS THE OLD', at('r2', 'new'), E.r2 + 0.3, { bar: '#c0281c' })]);
shot(L.r3 - 0.2, 'maze', {}, 'zoom', [date('LIECHTENSTEIN · NETHERLANDS · SHELL COMPANIES', at('r3', 'Liechtenstein'), E.r3)]);
const kR4 = K_(Object.assign({}, KING, { legs: false }), [[L.r4, { pose: 'rest', expr: 'cold', look: [0, 0.4] }], [at('r4', 'In') , { pose: 'sign', expr: 'cold', look: [0, 1], prop: penProp, write: 1 }]]);
shot(L.r4 - 0.2, 'nightoffice', (gl, g) => ({ k: kR4(g) }), 'fade', [cap('WHEN HE NEEDED COLLATERAL, HE MADE IT', L.r4 + 0.3, at('r4', 'forged'), { size: 42, bar: '#c0281c' })]);
shot(at('r4', 'forged') - 0.15, 'doc', { kind: 'bond', signAt: 0.4 }, 'zoom', [cap('FORGED SIGNATURES OF ITALIAN OFFICIALS', at('r4', 'forged'), at('r4', 'printed'), { size: 42, bar: '#c0281c' })]);
shot(at('r4', 'printed') - 0.15, 'nightoffice', { cam: [[0, 300, -60, 1.6, 1.0], [5, 380, -60, 1.75, 1.0]] }, 'whip', [num('≈ $', 100, ' MILLION', at('r4', 'Fake') , E.r4 + 0.3, { sub: 'OF FAKE BONDS', col: '#ff6a5a', y: 300, x: 700 })]);
shot(L.r5 - 0.2, 'closeup', (gl, g) => ({ k: K_(Object.assign({}, KING), [[0, { pose: 'rest', expr: 'cold' }], [at('r5', 'Then'), { pose: 'chin', expr: 'worried', look: [-0.6, 0.3] }]])(g), bg: ['#141a2c', '#06080e'], bokeh: '120,140,200', grade: 'cold' }), 'fade');
// ======================= 6 · OUT OF MATCHES =======================
shot(L.c1 - 0.1, 'newsstand', { crash: 1 }, 'iris', [date('1929 → 1931', L.c1 + 0.3, at('c1', 'Kreuger'))]);
shot(at('c1', 'Kreuger') - 0.15, 'closeup', (gl, g) => ({ k: K_(Object.assign({}, KING), [[0, { pose: 'chin', expr: 'worried', look: [0.5, 0.2] }]])(g), bg: ['#3a3a40', '#141418'], grade: 'grey' }), 'fade',
  [num('SEK ', 800, ' MILLION', at('c1', 'eight'), E.c1 + 0.3, { sub: '≈ 1/10 OF SWEDEN’S ECONOMY', y: 300, x: 520, size: 100 }), src('SOURCE: SVERIGES RIKSBANK', at('c1', 'eight'), E.c1)]);
shot(L.c2 - 0.2, 'palace', (gl, g) => ({ office: 1, k: K_(Object.assign({}, KING, { legs: false }), [[0, { pose: 'rest', expr: 'serious' }], [at('c2', 'discovered'), { pose: 'chin', expr: 'worried' }]])(g) }), 'fade', [date('ERICSSON → ITT · 1931', at('c2', 'Ericsson'), at('c2', 'demanded'))]);
shot(at('c2', 'demanded') - 0.4, 'doc', { kind: 'telegram', typeDur: 3 }, 'whip', [stamp('$11,000,000', at('c2', 'eleven'), E.c2 + 0.4, { size: 80, y: 820, x: 1300 })]);
shot(L.c3 - 0.2, 'room', (gl, g) => ({ burn: () => clamp((g - L.c3) / (E.c3 - L.c3 + 1)), lit: () => 1 - clamp((g - E.c3) / 0.6), cam: [[0, 0, 0, 1.0, 1.0], [8, -160, 60, 1.4, 1.0]] }), 'fade', [date('PARIS · 12 MARCH 1932', L.c3 + 0.3, E.c3)]);
shot(L.c4 - 0.2, 'paris', { date: false, cam: [[0, 40, -120, 1.25, 1.3], [12, 0, 160, 1.0, 1.3]] }, 'fade', [cap('OFFICIALLY: SUICIDE', at('c4', 'Officially'), E.c4, { bar: '#5a6470' }), cap('MURDER: NEVER PROVEN', at('c4', 'never'), E.c4, { y: 250, size: 44, bar: '#5a6470' })]);
shot(L.c5 - 0.2, 'exchange', {}, 'whip', [stamp('CLOSED', at('c5', 'shut'), at('c5', 'Swedish'), { size: 100, y: 400 })]);
shot(at('c5', 'Swedish') - 0.15, 'hall', { cam: [[0, 0, 0, 1.0, 1.0], [5, 0, 30, 1.15, 1.0]] }, 'fade', [cap('THE GOVERNMENT STEPS IN', at('c5', 'government'), E.c5 + 0.3)]);
// ======================= 7 · THE BOOKS =======================
shot(L.a1 - 0.1, 'accountants', (gl, g) => ({ crumble: () => clamp((g - at('a1', 'childish')) / 1.5) }), 'iris', [date('PRICE WATERHOUSE · 1932', L.a1 + 0.3, at('a1', 'Its'))]);
shot(at('a1', 'Its') - 0.15, 'doc', { kind: 'ledger', markAt: 0.3 }, 'fade', [quote('"SO CHILDISH THAT ANYONE WITH A RUDIMENTARY KNOWLEDGE OF BOOKKEEPING COULD SEE IT"', 'PRICE WATERHOUSE, 1932 · VIA FORTUNE, 1933', at('a1', 'manipulations'), E.a1 + 0.4, 860)]);
shot(L.a2 - 0.2, 'accountants', {}, 'fade', [{ t0: L.a2, t1: at('a2', 'Along'), fn: (ctx, g, a) => { const u1 = ss((g - at('a2', 'three')) / 0.8), u2 = ss((g - at('a2', 'forty')) / 0.8); ctx.save(); ctx.globalAlpha = clamp(a * 2); ctx.fillStyle = 'rgba(12,10,8,0.82)'; ctx.fillRect(240, 160, 900, 620);
    ctx.fillStyle = '#e3a83a'; ctx.fillRect(360, 700 - 460 * u1, 220, 460 * u1); ctx.fillStyle = '#b8231b'; ctx.fillRect(760, 700 - 61 * u2, 220, 61 * u2); ctx.restore();
    plate(ctx, '> $300 M REPORTED', 470, 740, u1, { size: 32, align: 'center', bg: 'none' }); plate(ctx, '≈ $40 M REAL', 870, 740, u2, { size: 32, align: 'center', bg: 'none', col: '#ff8a7a' }); plate(ctx, 'PROFITS · 14 YEARS', 690, 210, a, { size: 34, align: 'center', bg: 'none', col: '#e3a83a' }); } },
  src('SOURCE: TIME, 23 JANUARY 1933', at('a2', 'three'), E.a2)]);
shot(at('a2', 'Along') - 0.15, 'coins', {}, 'whip', [cap('$560 M FROM INVESTORS · $164 M FROM BANKS', at('a2', 'Along'), E.a2 + 0.3, { size: 42 })]);
shot(L.a3 - 0.2, 'nightoffice', { cam: [[0, 0, 0, 1.0, 1.0], [6, 0, 0, 1.15, 1.0]] }, 'fade', [stamp('BANKRUPT', at('a3', 'bankrupt'), at('a3', 'When'), { size: 110 }), cap('LARGEST BANKRUPTCY ON RECORD', at('a3', 'largest'), at('a3', 'When'), { y: 900, size: 44 })]);
shot(at('a3', 'When') - 0.15, 'doc', { kind: 'ledger', markAt: 0 }, 'whip', [num('< $', 10000, '', at('a3', 'ten'), at('a3', 'Creditors'), { sub: 'IN CASH', col: '#ff6a5a' }), num('', 32, '¢', at('a3', 'thirty'), E.a3 + 0.4, { sub: 'ON THE DOLLAR FOR CREDITORS', y: 520 }), src('SOURCE: TIME, 5 NOVEMBER 1945', at('a3', 'ten'), E.a3)]);
shot(L.a4 - 0.2, 'exchange', { cam: [[0, 0, -40, 1.1, 1.2], [5, 0, 40, 1.2, 1.2]] }, 'fade', [cap('SWEDEN: THE PRIME MINISTER RESIGNS', at('a4', 'Sweden'), at('a4', 'Washington'), { size: 46 })]);
shot(at('a4', 'Washington') - 0.15, 'senate', { date: false }, 'whip', [date('WASHINGTON · SENATE HEARINGS · JANUARY 1933', at('a4', 'Washington'), at('a4', '1933')), cap('SECURITIES ACTS 1933 · 1934', at('a4', '1933'), E.a4 + 0.3), cap('INDEPENDENT AUDITS', at('a4', 'independent'), E.a4 + 0.3, { y: 250, size: 44 })]);
// ======================= ENDING =======================
shot(L.e1 - 0.3, 'factory', { cam: [[0, -100, 0, 1.0, 1.0], [8, 100, 0, 1.1, 1.0]] }, 'fade', [cap('THE FACTORIES WERE REAL', at('e1', 'factories'), at('e1', 'His'))]);
shot(at('e1', 'His') - 0.15, 'maproom', (gl, g) => ({ pins: [['Berlin', 0.2, 'GERMANY KEPT PAYING']], cam: [[0, 420, -60, 1.45, 1.25], [5, 440, -60, 1.55, 1.25]] }), 'whip');
shot(at('e1', 'Swedish') - 0.3, 'today', { lit: () => 1 }, 'flash', [num('≈ $', 16, ' BILLION', at('e1', 'sixteen'), E.e1 + 0.3, { sub: 'SWEDISH MATCH, SOLD IN 2022', y: 300 }), src('SOURCE: PHILIP MORRIS INTERNATIONAL, FORM 10-K 2022', at('e1', '2022'), E.e1)]);
shot(L.e1b - 0.2, 'today', (gl, g) => ({ lit: () => 1, ghost: () => ss((g - L.e1b) / 2) * (1 - ss((g - E.e1b + 1) / 1)) }), 'fade', [quote('"THE FATHER OF TODAY’S FINANCIAL MARKET"', 'FRANK PARTNOY, 2009 · "A DUBIOUS HONOR"', at('e1b', 'father'), E.e1b, 260)]);
shot(L.e2 - 0.2, 'today', { lit: () => 1, cam: [[0, 0, 0, 1.25, 1.0], [5, 0, 0, 1.4, 1.0]] }, 'fade', [{ t0: at('e2', 'matches'), t1: E.e2 + 1.2, fn: (ctx, g, a) => { plate(ctx, 'THE MATCHES WERE REAL.', 120, 300, a, { size: 70, bg: 'none' }); plate(ctx, 'THE MONEY WASN’T.', 120, 400, ss((g - at('e2', 'money')) / 0.4), { size: 70, bg: 'none', col: '#f2c230' }); } }]);
shot(T - 3.6, 'end', {}, 'fade');
shots.sort((p, q) => p.t0 - q.t0);
// ---------------- chapter cards & end card ----------------
function card(ctx, c, lt) { ctx.fillStyle = '#0c0a09'; ctx.fillRect(0, 0, W, H); const burnt = c.n / 8, len = 240 * (1 - burnt * 0.8), mx = W / 2, my = 1000;
  ctx.save(); ctx.translate(mx, my); ctx.fillStyle = '#e8c88f'; ctx.fillRect(-7, -len, 14, len); ctx.fillStyle = '#2a1a12'; ctx.fillRect(-7, -len - 6, 14, 8); ctx.restore();
  const lit = ss((lt - 0.35) / 0.25); if (lit > 0) { P.flame(ctx, mx, my - len - 4, 1.4, lt, lit); P.glow(ctx, mx, my - len - 60, 700, '255,170,80', 0.35 * lit); }
  plate(ctx, `CHAPTER ${c.n}`, W / 2, 250, ss((lt - 0.5) / 0.3), { size: 30, align: 'center', bg: 'none', col: '#e3a83a' });
  plate(ctx, c.title, W / 2, 360, ss((lt - 0.6) / 0.35), { size: 110, align: 'center', bg: 'none' }); if (c.years) plate(ctx, c.years, W / 2, 470, ss((lt - 0.9) / 0.3), { size: 44, align: 'center', bg: 'none', col: '#cdbb9b' });
  P.grain(ctx, lt, 0.05); }
function endCard(ctx, lt) { ctx.fillStyle = '#0c0a09'; ctx.fillRect(0, 0, W, H); plate(ctx, 'Would YOU have trusted him?', W / 2, 470, ss(lt / 0.4), { size: 92, align: 'center', bg: 'none', font: P.F });
  const a = ss((lt - 0.8) / 0.4), y = 600 + Math.sin(lt * 4) * 10; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#f2c230'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(W / 2, y); ctx.lineTo(W / 2, y + 150); ctx.moveTo(W / 2 - 44, y + 106); ctx.lineTo(W / 2, y + 150); ctx.lineTo(W / 2 + 44, y + 106); ctx.stroke(); ctx.restore(); }
// ---------------- compositing with transitions ----------------
const CA = createCanvas(W, H), CB = createCanvas(W, H);
function drawShot(cv, sh, g) { const x = cv.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.filter = 'none'; x.globalCompositeOperation = 'source-over';
  if (sh.set === 'end') { endCard(x, g - sh.t0); return; } const gl = g - sh.t0; S[sh.set](x, gl, sh.o(gl, g));
  for (const ov of sh.over) { if (g < ov.t0 - 0.05 || g > ov.t1 + 0.5) continue; const a = ss((g - ov.t0) / 0.35) * (1 - ss((g - ov.t1) / 0.35)); if (a > 0) ov.fn(x, g, a); } }
// ---------------- energy layer: every shot slowly pushes in (alternating direction), handheld drift, a punch-in + shake on every number / stamp / big caption ----------------
const OC = createCanvas(W, H), OX = OC.getContext('2d');
const HITS = []; for (const sh of shots) for (const ov of sh.over) HITS.push(ov.t0); HITS.sort((a, b) => a - b);
function frame(ctx, g) { frame0(OX, g); const i = shots.findLastIndex(s => g >= s.t0), sh = shots[Math.max(0, i)], nx = shots[i + 1] ? shots[i + 1].t0 : T, u = clamp((g - sh.t0) / Math.max(1, nx - sh.t0));
  const inCard = cards.some(c => g >= c.t0 && g < c.t1); let sc = 1.015 + (i % 2 ? lerp(0.05, 0, u) : lerp(0, 0.05, u)), dx = Math.sin(g * 0.7) * 10 + Math.sin(g * 1.9) * 4, dy = Math.cos(g * 0.6) * 7 + Math.sin(g * 2.3) * 3;
  for (const h of HITS) { const d = g - h; if (d >= 0 && d < 0.6) { const e = Math.exp(-d * 7); sc += 0.035 * e; dx += Math.sin(d * 70) * 10 * e; dy += Math.cos(d * 60) * 7 * e; } }
  if (inCard) { sc = 1; dx = dy = 0; }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.translate(W / 2 + dx, H / 2 + dy); ctx.scale(sc, sc); ctx.drawImage(OC, -W / 2, -H / 2); ctx.restore(); }
function frame0(ctx, g) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  const c = cards.find(c => g >= c.t0 && g < c.t1); if (c) { card(ctx, c, g - c.t0); const f = 1 - ss((c.t1 - g) / 0.3); if (f > 0) { ctx.fillStyle = `rgba(0,0,0,${0})`; } return; }
  let i = shots.findLastIndex(s => g >= s.t0); if (i < 0) i = 0; const sh = shots[i], lt = g - sh.t0; drawShot(CA, sh, g);
  const TR = sh.tr === 'cut' ? 0 : sh.tr === 'whip' ? 0.28 : 0.4; const prevCard = cards.find(c => Math.abs(c.t1 - sh.t0) < 0.6);
  if (i > 0 && lt < TR && !prevCard) { const pv = shots[i - 1]; drawShot(CB, pv, g); const p = ss(lt / TR);
    if (sh.tr === 'whip') { const d = i % 2 ? 1 : -1; for (let j = 0; j < 5; j++) { const sp = (j / 4 - 0.5) * 60 * Math.sin(p * Math.PI); ctx.globalAlpha = 0.3; ctx.drawImage(CB, -d * W * p + sp, 0); ctx.drawImage(CA, d * W * (1 - p) + sp, 0); } ctx.globalAlpha = 1; }
    else if (sh.tr === 'zoom') { ctx.drawImage(CB, 0, 0); ctx.save(); ctx.globalAlpha = p; const z = lerp(1.25, 1, p); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); ctx.drawImage(CA, 0, 0); ctx.restore(); }
    else if (sh.tr === 'flash') { ctx.drawImage(p < 0.5 ? CB : CA, 0, 0); ctx.fillStyle = `rgba(255,248,235,${Math.sin(p * Math.PI) * 0.85})`; ctx.fillRect(0, 0, W, H); }
    else if (sh.tr === 'iris') { ctx.drawImage(CB, 0, 0); ctx.save(); ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.max(1, Math.hypot(W, H) / 2 * p), 0, 7); ctx.clip(); ctx.drawImage(CA, 0, 0); ctx.restore(); }
    else { ctx.drawImage(CB, 0, 0); ctx.globalAlpha = p; ctx.drawImage(CA, 0, 0); ctx.globalAlpha = 1; } }
  else if (prevCard && lt < 0.6) { ctx.drawImage(CA, 0, 0); ctx.fillStyle = `rgba(12,10,9,${1 - ss(lt / 0.6)})`; ctx.fillRect(0, 0, W, H); }
  else ctx.drawImage(CA, 0, 0);
  // fade to the card / to the end
  const nc = cards.find(c => c.t0 > g && c.t0 - g < 0.4); if (nc) { ctx.fillStyle = `rgba(12,10,9,${1 - (nc.t0 - g) / 0.4})`; ctx.fillRect(0, 0, W, H); } }
module.exports = { frame, shots, T };
if (require.main === module) (async () => { await I.ready(); const [mode, a1, a2, a3] = process.argv.slice(2); const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  if (mode === 'T') return console.log(T);
  if (mode === 'frame') { frame(ctx, +a1); return fs.writeFileSync(a2, cv.toBuffer('image/png')); }
  if (mode === 'still') { const ts = a1.split(',').map(Number), sh = createCanvas(640 * 3, 360 * Math.ceil(ts.length / 3)), c2 = sh.getContext('2d');
    ts.forEach((t, i) => { frame(ctx, t); c2.drawImage(cv, (i % 3) * 640, Math.floor(i / 3) * 360, 640, 360); c2.fillStyle = '#ff3030'; c2.font = '22px sans-serif'; c2.fillText(t.toFixed(1), (i % 3) * 640 + 8, Math.floor(i / 3) * 360 + 26); });
    return fs.writeFileSync(a2, sh.toBuffer('image/png')); }
  if (mode === 'video') { const f0 = +(a2 || 0), f1 = +(a3 || Math.round(T * 30)); const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = f0; f < f1; f++) { frame(ctx, f / 30); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise(r => ff.stdin.once('drain', r)); if ((f - f0) % 300 === 0) process.stderr.write(`${f}/${f1}\n`); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); } })();
