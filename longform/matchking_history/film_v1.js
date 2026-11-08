// "The Match King" — the edit. Shots on the global timeline (timeline.js), each = a parallax set at its own local time + overlays timed to the voice.
// node film.js still t1,t2,… out.png | frame t out.png | video out.mp4 [f0 f1]
const fs = require('fs'), { spawn } = require('child_process');
const P = require('./lib/par.js'), A = require('./lib/sets.js'), B = require('./lib/sets2.js'), C = require('./lib/sets3.js'), K = require('./lib/kreuger.js');
const TL = require('./timeline.js'); const { L, E, at, cards, T } = TL;
const { W, H, clamp, lerp, ss, eo, back, createCanvas, plate, source } = P;
const S = Object.assign({}, A, B, C);
// ---------------- helpers ----------------
const st = (base, ...keys) => g => { let o = Object.assign({}, base); for (const [t, k] of keys) if (g >= t) Object.assign(o, k); return o; };   // pose/expr changes over time (global t)
const bigPlate = (s, x, y, t0, t1, o = {}) => ({ t0, t1, fn: (ctx, g, a) => plate(ctx, s, x, y, a, Object.assign({ size: 54 }, o)) });
const src = (s, t0, t1) => ({ t0, t1, fn: (ctx, g, a) => source(ctx, s, a) });
const quote = (s, by, t0, t1) => ({ t0, t1, fn: (ctx, g, a) => { plate(ctx, s, W / 2, 470, a, { size: 52, align: 'center', bg: 'rgba(15,10,8,0.82)', font: P.SERIF, weight: 700 }); plate(ctx, by, W / 2, 570, a, { size: 28, align: 'center', bg: 'none', col: '#e3a83a' }); } });
const matchProp = (ctx, g) => { ctx.save(); ctx.rotate(-0.25); ctx.fillStyle = '#e8c88f'; ctx.fillRect(-3, -70, 6, 80); ctx.fillStyle = '#9b1d1d'; ctx.beginPath(); ctx.ellipse(0, -72, 6, 8, 0, 0, 7); ctx.fill(); P.flame(ctx, 0, -76, 0.55, g); ctx.restore(); };
const penProp = ctx => { ctx.save(); ctx.rotate(0.5); ctx.fillStyle = '#16120f'; ctx.fillRect(-3, 10, 6, 60); ctx.fillStyle = '#d8b45a'; ctx.fillRect(-3, 10, 6, 8); ctx.restore(); };
const drawings = c => { c.save(); c.rotate(1.2); c.fillStyle = '#e9e4d4'; c.fillRect(-12, -60, 24, 150); c.strokeStyle = '#7a8aa0'; c.lineWidth = 2; c.strokeRect(-12, -60, 24, 150); c.restore(); };
const KING = { age: 'king' }, YOUNG = { age: 'young' };
// shot: { t0, set, o: (gl, g) => opts, tr: 'cut'|'fade'|'whip'|'zoom'|'flash', over: [overlays] }; a shot lasts until the next one starts
const shots = [];
const shot = (t0, set, o, tr = 'fade', over = []) => shots.push({ t0, set, o: typeof o === 'function' ? o : () => o || {}, tr, over });
// ---------------- COLD OPEN ----------------
shot(0, 'today', gl => ({ lit: g => clamp((g - 0.7) / 0.4), cam: [[0, 0, 0, 1.4, 1.0], [2.4, 0, 0, 1.25, 1.0]] }), 'cut');
shot(L.h1 - 0.2, 'paris', { date: true }, 'fade');
shot(L.h2 - 0.2, 'factory', (gl, g) => ({ k: Object.assign({}, KING, { pose: 'rest', expr: 'cold', look: [0, 0.2] }) }), 'whip', [bigPlate('IVAR KREUGER', 120, 150, at('h2', 'Ivar'), E.h2, { bar: '#e3a83a', size: 64 }), bigPlate("≈ 2/3 OF THE WORLD'S MATCHES", 120, 250, at('h2', 'two'), E.h2, { size: 44 })]);
shot(at('h2', 'He') - 0.25, 'maproom', (gl, g) => ({ flows: ['Paris', 'Berlin', 'Warsaw', 'Budapest', 'Athens', 'Bucharest', 'Riga', 'Ankara', 'Belgrade'].map((c, i) => ['Stockholm', c, i * 0.12, 0.9, '#e3a83a', 80 + i * 10]), cam: [[0, 330, -40, 1.2, 1.25], [6, 380, -60, 1.3, 1.25]] }), 'zoom',
  [bigPlate('≈ $400 MILLION → ≈ 15 GOVERNMENTS', 120, 150, at('h2', 'four'), E.h2 + 0.3, { bar: '#b8231b' })]);
shot(L.h3 - 0.2, 'accountants', (gl, g) => ({ crumble: gg => clamp((g - at('h3', 'never')) / 1.2) }), 'fade',
  [bigPlate('PROFITS: NEVER EXISTED', 120, 150, at('h3', 'never'), E.h3, { bar: '#b8231b' }), bigPlate('≈ $250 MILLION OF ASSETS: NEVER EXISTED', 120, 250, at('h3', 'two'), E.h3, { size: 42 })]);
shot(L.h4 - 0.2, 'today', { cam: [[0, 0, 0, 1.0, 1.0], [12, 0, -20, 1.35, 1.0]] }, 'fade');
// ---------------- 1 · THE ENGINEER ----------------
shot(L.k1 - 0.1, 'kalmar', (gl, g) => ({ k: g > at('k1', 'twenty') ? Object.assign({}, YOUNG, { pose: 'rest', expr: 'smile', look: [1, 0] }) : null, kx: lerp(900, 1300, ss((g - at('k1', 'twenty')) / 3)) }), 'iris',
  [bigPlate('KALMAR, SWEDEN · 1880', 120, 150, at('k1', 'born'), E.k1, { bar: '#e3a83a' })]);
shot(L.k2 - 0.2, 'newyork', (gl, g) => ({ date: false, k: Object.assign({}, YOUNG, { pose: 'hold', expr: 'smile', prop: drawings, look: [-0.5, -0.4] }) }), 'whip',
  [bigPlate('NEW YORK · EARLY 1900s', 120, 150, L.k2 + 0.4, E.k2, { bar: '#e3a83a' }), bigPlate('THE FLATIRON', 120, 250, at('k2', 'Flatiron'), E.k2, { size: 40 }), src('SOURCE: FORTUNE, MAY 1933', at('k2', 'Fortune'), E.k2)]);
shot(L.k3 - 0.2, 'stadium', (gl, g) => ({ date: false, k: Object.assign({}, YOUNG, st({ pose: 'rest', expr: 'smile' }, [at('k3', 'stadium'), { pose: 'point', look: [1, -0.5] }])(g)) }), 'whip',
  [bigPlate('1908 · KREUGER & TOLL', 120, 150, at('k3', '1908'), E.k3, { bar: '#e3a83a' }), bigPlate('STOCKHOLM OLYMPICS · 1912', 120, 250, at('k3', 'stadium'), E.k3, { size: 42 })]);
shot(L.k4 - 0.2, 'factory', (gl, g) => ({ k: Object.assign({}, YOUNG, st({ pose: 'rest', expr: 'neutral' }, [at('k4', 'Matches') - 0.3, { pose: 'match', expr: 'cold', prop: matchProp }])(g)), cam: [[0, 0, 0, 1.0, 1.0], [7, 140, -60, 1.35, 1.0]] }), 'fade');
// ---------------- 2 · THE MATCH TRUST ----------------
shot(L.t1 - 0.1, 'factory', { cam: [[0, 200, -40, 1.4, 1.0], [12, -100, 20, 1.0, 1.0]] }, 'iris', [bigPlate('EVERY HOME · EVERY DAY', 120, 150, at('t1', 'everyone'), E.t1, { bar: '#e3a83a' })]);
shot(L.t2 - 0.2, 'factory', (gl, g) => ({ k: Object.assign({}, KING, st({ pose: 'rest', expr: 'cold' }, [at('t2', 'president'), { pose: 'open', expr: 'smile' }])(g)) }), 'whip',
  [bigPlate('1913 · BUYING UP THE FACTORIES', 120, 150, at('t2', '1913'), at('t2', '1917'), { bar: '#e3a83a' }), bigPlate('1917 · SWEDISH MATCH', 120, 150, at('t2', '1917'), E.t2, { bar: '#e3a83a', size: 64 })]);
shot(L.t3 - 0.2, 'maproom', (gl, g) => ({ flows: [['Stockholm', 'Boston', at('t3', 'Boston') - g + gl, 1.4, '#e3a83a', 260]], pins: [['Boston', at('t3', 'Boston') - g + gl, 'BOSTON · LEE, HIGGINSON & CO.']], cam: [[0, -200, 0, 1.1, 1.25], [12, -100, 0, 1.15, 1.25]] }), 'zoom',
  [bigPlate('1923 · INTERNATIONAL MATCH', 120, 150, at('t3', '1923'), E.t3, { bar: '#e3a83a' })]);
shot(L.t4 - 0.2, 'maproom', (gl, g) => ({ flows: [0, 1, 2].map(i => ['New York', 'Stockholm', 0.3 + i * 0.4, 1.6, '#e3a83a', 260 + i * 40]), cam: [[0, 0, 0, 1.0, 1.25], [12, 120, 0, 1.08, 1.25]] }), 'fade',
  [bigPlate('≈ $250 MILLION FROM AMERICAN INVESTORS', 120, 150, at('t4', 'two'), E.t4, { bar: '#e3a83a' }), src('SOURCE: FORTUNE, MAY 1933', at('t4', 'two'), E.t4)]);
// ---------------- 3 · MATCHES FOR MONEY ----------------
shot(L.m1 - 0.1, 'hall', (gl, g) => ({ k: Object.assign({}, KING, { legs: false }, st({ pose: 'open', expr: 'smile' }, [at('m1', 'return'), { pose: 'sign', expr: 'serious', look: [0, 1], prop: penProp, write: 1 }])(g)), seal: g > E.m1 - 1 }), 'iris',
  [bigPlate('A LOAN  ⇄  A MATCH MONOPOLY', 120, 150, at('m1', 'lend'), E.m1, { bar: '#e3a83a' })]);
shot(L.m2 - 0.2, 'maproom', (gl, g) => ({ pins: [['Warsaw', at('m2', 'Poland') - g + gl, 'POLAND · 1925 · $6 M', -110], ['Paris', at('m2', 'France') - g + gl, 'FRANCE · 1927 · $75 M'], ['Berlin', at('m2', 'Germany') - g + gl, 'GERMANY · 1929 · $125 M']],
    flows: [['Stockholm', 'Warsaw', at('m2', 'Poland') - g + gl, 0.8, '#e3a83a', 60], ['Stockholm', 'Paris', at('m2', 'France') - g + gl, 0.8, '#e3a83a', 120], ['Stockholm', 'Berlin', at('m2', 'Germany') - g + gl, 0.8, '#e3a83a', 60]], cam: [[0, 380, -60, 1.3, 1.25], [20, 440, -60, 1.42, 1.25]] }), 'zoom',
  [bigPlate('NO RUSSIAN MATCHES IN GERMANY', 120, 150, at('m2', 'Russian'), E.m2 + 0.3, { bar: '#b8231b', size: 44 }), src('SOURCE: TIME, 21 MARCH 1932', at('m2', 'Poland'), E.m2)]);
shot(L.m2b - 0.2, 'maproom', (gl, g) => { const s = at('m2b', 'Much') - g + gl, c = at('m2b', 'Main') - g + gl; return { flows: [['New York', 'Stockholm', s, 1.4, '#e3a83a', 300], ['Stockholm', 'Paris', s + 1.2, 1.0, '#e3a83a', 120], ['Paris', 'New York', c + 1.5, 1.6, '#57a06a', -200]],
    cam: [[0, 100, 0, 1.0, 1.25], [20, 200, 0, 1.06, 1.25]] }; }, 'fade',
  [bigPlate('$50 MILLION OF BONDS SOLD IN THE US', 120, 150, at('m2b', 'fifty'), E.m2b, { bar: '#e3a83a', size: 46 }), bigPlate('A PERFECT CIRCLE', 120, 250, at('m2b', 'circle') - 0.3, E.m2b + 0.3, { size: 46, bg: 'rgba(184,35,27,0.92)' })]);
shot(L.m3 - 0.2, 'maproom', (gl, g) => { const n = ['Athens', 'Budapest', 'Belgrade', 'Bucharest', 'Riga', 'Ankara']; return { pins: [['Warsaw', -10], ['Paris', -10], ['Berlin', -10]].concat(n.map((c, i) => [c, i * 0.45 + 0.1])), cam: [[0, 420, -40, 1.35, 1.25], [12, 380, 0, 1.25, 1.25]] }; }, 'cut',
  [bigPlate('≈ $400 MILLION · ≈ 15 GOVERNMENTS', 120, 150, at('m3', '1930'), E.m3 + 0.3, { bar: '#b8231b' })]);
shot(L.m4 - 0.2, 'maproom', (gl, g) => ({ pins: ['Warsaw', 'Paris', 'Berlin', 'Athens', 'Budapest', 'Belgrade', 'Bucharest', 'Riga', 'Ankara'].map(c => [c, -10]), matchFill: () => ss((g - L.m4) / 6) }), 'fade',
  [bigPlate('1930 · ≈ 60 % OF WORLD MATCH PRODUCTION', 120, 150, at('m4', 'sixty'), E.m4, { bar: '#e3a83a', size: 46 }), bigPlate('33 COUNTRIES', 120, 250, at('m4', 'thirty'), E.m4, { size: 42 }), src('SOURCE: SWEDISH MATCH', at('m4', 'sixty'), E.m4)]);
shot(L.m5 - 0.2, 'hall', (gl, g) => ({ k: Object.assign({}, KING, { legs: false, pose: 'open', expr: 'smile' }), cam: [[0, 0, 0, 1.0, 1.0], [10, 80, 40, 1.3, 1.0]] }), 'fade',
  [{ t0: at('m5', 'Trust'), t1: E.m5 + 0.6, fn: (ctx, g, a) => plate(ctx, 'TRUST', W / 2, 520, a, { size: 150, align: 'center', bg: 'rgba(15,10,8,0.7)', col: '#f2c230' }) }]);
// ---------------- 4 · THE MATCH PALACE ----------------
shot(L.p1 - 0.1, 'palace', (gl, g) => ({ k: Object.assign({}, KING, { pose: 'rest', legs: 'walk', walk: g * 0.8 }), kx: lerp(1700, 1250, ss(gl / 6)) }), 'iris', [bigPlate('STOCKHOLM · 1928', 120, 150, L.p1 + 0.5, E.p1 + 0.3, { bar: '#e3a83a' })]);
shot(L.p2 - 0.2, 'penthouse', (gl, g) => ({ date: false, k: Object.assign({}, KING, { pose: 'rest', expr: 'cold', rim: '200,210,255' }) }), 'whip',
  [bigPlate('PARK AVENUE, NEW YORK', 120, 150, L.p2 + 0.2, E.p2, { bar: '#e3a83a' }), bigPlate('PARIS · BERLIN · STOCKHOLM · AN ISLAND', 120, 250, at('p2', 'twenty'), E.p2, { size: 40 })]);
shot(L.p3 - 0.2, 'newsstand', (gl, g) => ({}), 'whip', [bigPlate('TIME MAGAZINE COVER · 28 OCTOBER 1929', 120, 150, at('p3', 'Time'), at('p3', 'Wall'), { bar: '#e3a83a', size: 44 })]);
shot(at('p3', 'Wall') - 0.2, 'newsstand', { crash: 1 }, 'flash', [bigPlate('THE WALL STREET CRASH', 120, 150, at('p3', 'Wall'), E.p3 + 0.4, { bar: '#b8231b' })]);
shot(L.p4 - 0.2, 'palace', (gl, g) => ({ office: 1, k: Object.assign({}, KING, { legs: false, pose: 'rest', expr: 'smile' }) }), 'fade',
  [quote('"TO ACCEPT A SWEDISH AUDIT OF THE GREATEST SWEDE"', 'TIME, 18 APRIL 1932', at('p4', 'to') - 0.1, E.p4 + 0.3)]);
shot(L.p5 - 0.2, 'palace', (gl, g) => ({ office: 1, k: Object.assign({}, KING, { legs: false, pose: 'open', expr: 'cold' }), cam: [[0, 0, -60, 1.1, 1.0], [11, 0, 40, 1.3, 1.0]] }), 'fade',
  [bigPlate('≈ $50,000 OF VOTING SHARES', 120, 150, at('p5', 'fifty'), E.p5, { bar: '#e3a83a' }), bigPlate('→ CONTROL OF > $1 BILLION', 120, 250, at('p5', 'billion') - 0.2, E.p5, { size: 48, bg: 'rgba(184,35,27,0.92)' })]);
// ---------------- 5 · THE TRICK ----------------
shot(L.r1 - 0.1, 'maproom', (gl, g) => ({ flows: [['Paris', 'Stockholm', 0.5, 6, '#57a06a', 120]], cam: [[0, 380, -60, 1.3, 1.25], [10, 420, -40, 1.35, 1.25]] }), 'iris',
  [bigPlate('GOVERNMENTS: PAY BACK OVER DECADES', 120, 150, at('r1', 'government'), E.r1, { bar: '#57a06a', size: 44 }), bigPlate('INVESTORS: WANT DIVIDENDS EVERY YEAR', 120, 250, at('r1', 'investors'), E.r1, { size: 44, bg: 'rgba(184,35,27,0.92)' })]);
shot(L.r2 - 0.2, 'maproom', (gl, g) => ({ flows: [0, 1, 2].map(i => ['New York', 'Stockholm', i * 0.5, 1.4, '#b8231b', 280 + i * 30]).concat([0, 1].map(i => ['Stockholm', 'Boston', 1 + i * 0.6, 1.4, '#b8231b', -160 - i * 30])), cam: [[0, 0, 0, 1.0, 1.25], [12, 100, 0, 1.06, 1.25]] }), 'fade',
  [bigPlate('DIVIDENDS PAID FROM INVESTORS’ OWN MONEY', 120, 150, at('r2', 'dividends'), E.r2, { bar: '#b8231b', size: 46 }), src('SOURCE: KREUGER & TOLL RECORDS, PRINCETON UNIVERSITY LIBRARY', at('r2', 'dividends'), E.r2)]);
shot(L.r3 - 0.2, 'maze', {}, 'zoom');
shot(L.r4 - 0.2, 'nightoffice', (gl, g) => ({ k: Object.assign({}, KING, { legs: false, pose: 'sign', expr: 'cold', look: [0, 1], prop: penProp, write: 1 }) }), 'fade',
  [bigPlate('FORGED SIGNATURES OF ITALIAN OFFICIALS', 120, 150, at('r4', 'forged'), E.r4, { bar: '#b8231b', size: 44 }), bigPlate('≈ $100 MILLION OF FAKE BONDS', 120, 250, at('r4', 'Fake'), E.r4, { size: 46 })]);
shot(L.r5 - 0.2, 'nightoffice', (gl, g) => ({ k: Object.assign({}, KING, { legs: false, pose: 'chin', expr: 'worried', look: [-0.6, 0.3] }), cam: [[0, 0, 40, 1.25, 1.0], [8, 0, 0, 1.0, 1.0]] }), 'fade');
// ---------------- 6 · OUT OF MATCHES ----------------
shot(L.c1 - 0.1, 'newsstand', { crash: 1 }, 'iris', [bigPlate('SEK 800 MILLION FROM SWEDISH BANKS', 120, 150, at('c1', 'eight'), E.c1, { bar: '#b8231b', size: 46 }), bigPlate('≈ 1/10 OF SWEDEN’S ECONOMY', 120, 250, at('c1', 'tenth'), E.c1, { size: 46 }), src('SOURCE: SVERIGES RIKSBANK', at('c1', 'eight'), E.c1)]);
shot(L.c2 - 0.2, 'palace', (gl, g) => ({ office: 1, k: Object.assign({}, KING, { legs: false }, st({ pose: 'rest', expr: 'serious' }, [at('c2', 'discovered'), { pose: 'chin', expr: 'worried' }])(g)) }), 'fade',
  [bigPlate('ERICSSON → ITT', 120, 150, at('c2', 'Ericsson'), E.c2, { bar: '#e3a83a' }), bigPlate('ITT: RETURN $11 MILLION', 120, 250, at('c2', 'eleven'), E.c2, { size: 48, bg: 'rgba(184,35,27,0.92)' })]);
shot(L.c3 - 0.2, 'room', (gl, g) => ({ burn: gg => clamp((g - L.c3) / (E.c3 - L.c3 + 1)), lit: gg => 1 - clamp((g - E.c3) / 0.6) }), 'fade', [bigPlate('PARIS · 12 MARCH 1932', 120, 150, L.c3 + 0.3, E.c3, { bar: '#b8231b' })]);
shot(L.c4 - 0.2, 'paris', { date: false, cam: [[0, 40, -120, 1.25, 1.3], [12, 0, 160, 1.0, 1.3]] }, 'fade',
  [bigPlate('OFFICIALLY: SUICIDE', 120, 150, at('c4', 'Officially'), E.c4, { bar: '#5a6470' }), bigPlate('MURDER THEORY: NEVER PROVEN', 120, 250, at('c4', 'never'), E.c4, { size: 44 })]);
shot(L.c5 - 0.2, 'exchange', {}, 'whip', [bigPlate('STOCKHOLM STOCK EXCHANGE: CLOSED', 120, 150, at('c5', 'Stockholm'), E.c5, { bar: '#b8231b', size: 46 })]);
// ---------------- 7 · THE BOOKS ----------------
shot(L.a1 - 0.1, 'accountants', (gl, g) => ({ crumble: gg => clamp((g - at('a1', 'childish')) / 1.5) }), 'iris', [quote('"SO CHILDISH THAT ANYONE WITH A RUDIMENTARY KNOWLEDGE OF BOOKKEEPING COULD SEE IT"', 'PRICE WATERHOUSE, NOVEMBER 1932 · VIA FORTUNE, 1933', at('a1', 'manipulations'), E.a1 + 0.4)]);
shot(L.a2 - 0.2, 'accountants', {}, 'fade', [{ t0: L.a2, t1: E.a2 + 0.3, fn: (ctx, g, a) => { // two bars: reported vs real profit
    const u1 = ss((g - at('a2', 'three')) / 0.8), u2 = ss((g - at('a2', 'forty')) / 0.8); ctx.save(); ctx.globalAlpha = clamp(a * 2); ctx.fillStyle = 'rgba(12,10,8,0.82)'; ctx.fillRect(240, 160, 900, 620);
    ctx.fillStyle = '#e3a83a'; ctx.fillRect(360, 700 - 460 * u1, 220, 460 * u1); ctx.fillStyle = '#b8231b'; ctx.fillRect(760, 700 - 61 * u2, 220, 61 * u2); ctx.restore();
    plate(ctx, '> $300 M REPORTED', 470, 740, u1, { size: 32, align: 'center', bg: 'none' }); plate(ctx, '≈ $40 M REAL', 870, 740, u2, { size: 32, align: 'center', bg: 'none', col: '#ff8a7a' });
    plate(ctx, 'PROFITS · 14 YEARS', 690, 210, a, { size: 34, align: 'center', bg: 'none', col: '#e3a83a' }); } },
  bigPlate('$560 M FROM INVESTORS · $164 M FROM BANKS', 1180, 900, at('a2', 'five'), E.a2 + 0.3, { size: 36, align: 'right' }), src('SOURCE: TIME, 23 JANUARY 1933', at('a2', 'three'), E.a2)]);
shot(L.a3 - 0.2, 'nightoffice', { cam: [[0, 0, 0, 1.0, 1.0], [13, 0, 0, 1.15, 1.0]] }, 'fade',
  [bigPlate('LARGEST BANKRUPTCY ON RECORD', 120, 150, at('a3', 'largest'), E.a3, { bar: '#b8231b' }), bigPlate('< $10,000 IN CASH', 120, 250, at('a3', 'ten'), E.a3, { size: 46 }), bigPlate('32¢ ON THE DOLLAR', 120, 340, at('a3', 'thirty'), E.a3 + 0.3, { size: 46, bg: 'rgba(184,35,27,0.92)' }), src('SOURCE: TIME, 5 NOVEMBER 1945', at('a3', 'ten'), E.a3)]);
shot(L.a4 - 0.2, 'senate', { date: false }, 'whip', [bigPlate('SWEDEN: THE PRIME MINISTER RESIGNS', 120, 150, at('a4', 'Sweden'), at('a4', 'Washington'), { bar: '#e3a83a', size: 46 }), bigPlate('WASHINGTON · SENATE HEARINGS · 1933', 120, 150, at('a4', 'Washington'), E.a4, { bar: '#e3a83a', size: 46 }),
  bigPlate('SECURITIES ACTS 1933 · 1934 · INDEPENDENT AUDITS', 120, 250, at('a4', '1933'), E.a4 + 0.3, { size: 40 })]);
// ---------------- ENDING ----------------
shot(L.e1 - 0.3, 'factory', { cam: [[0, -100, 0, 1.0, 1.0], [8, 100, 0, 1.1, 1.0]] }, 'fade', [bigPlate('THE FACTORIES WERE REAL', 120, 150, at('e1', 'factories'), at('e1', 'Swedish'), { bar: '#e3a83a' })]);
shot(at('e1', 'Swedish') - 0.3, 'today', { lit: () => 1 }, 'flash', [bigPlate('2022 · SWEDISH MATCH SOLD FOR ≈ $16 BILLION', 120, 150, at('e1', '2022'), E.e1 + 0.3, { bar: '#e3a83a', size: 44 }), src('SOURCE: PHILIP MORRIS INTERNATIONAL, FORM 10-K 2022', at('e1', '2022'), E.e1)]);
shot(L.e1b - 0.2, 'today', (gl, g) => ({ lit: () => 1, ghost: () => ss((g - L.e1b) / 2) * (1 - ss((g - E.e1b + 1) / 1)) }), 'fade', [quote('"THE FATHER OF TODAY’S FINANCIAL MARKET"', 'FRANK PARTNOY, 2009 · "A DUBIOUS HONOR"', at('e1b', 'father'), E.e1b)]);
shot(L.e2 - 0.2, 'today', { lit: () => 1, cam: [[0, 0, 0, 1.25, 1.0], [5, 0, 0, 1.4, 1.0]] }, 'fade', [{ t0: at('e2', 'matches'), t1: E.e2 + 1.2, fn: (ctx, g, a) => { plate(ctx, 'THE MATCHES WERE REAL.', 120, 300, a, { size: 70, bg: 'none' }); plate(ctx, 'THE MONEY WASN’T.', 120, 400, ss((g - at('e2', 'money')) / 0.4), { size: 70, bg: 'none', col: '#f2c230' }); } }]);
shot(T - 3.6, 'end', {}, 'fade');
// ---------------- chapter cards & end card ----------------
function card(ctx, c, lt) { ctx.fillStyle = '#0c0a09'; ctx.fillRect(0, 0, W, H); const burnt = c.n / 8, len = 300 * (1 - burnt * 0.85), mx = W / 2, my = 780;
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
function frame(ctx, g) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  const c = cards.find(c => g >= c.t0 && g < c.t1); if (c) { card(ctx, c, g - c.t0); const f = 1 - ss((c.t1 - g) / 0.3); if (f > 0) { ctx.fillStyle = `rgba(0,0,0,${0})`; } return; }
  let i = shots.findLastIndex(s => g >= s.t0); if (i < 0) i = 0; const sh = shots[i], lt = g - sh.t0; drawShot(CA, sh, g);
  const TR = sh.tr === 'cut' ? 0 : sh.tr === 'whip' ? 0.35 : 0.55; const prevCard = cards.find(c => Math.abs(c.t1 - sh.t0) < 0.6);
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
if (require.main === module) (async () => { const [mode, a1, a2, a3] = process.argv.slice(2); const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  if (mode === 'T') return console.log(T);
  if (mode === 'frame') { frame(ctx, +a1); return fs.writeFileSync(a2, cv.toBuffer('image/png')); }
  if (mode === 'still') { const ts = a1.split(',').map(Number), sh = createCanvas(640 * 3, 360 * Math.ceil(ts.length / 3)), c2 = sh.getContext('2d');
    ts.forEach((t, i) => { frame(ctx, t); c2.drawImage(cv, (i % 3) * 640, Math.floor(i / 3) * 360, 640, 360); c2.fillStyle = '#ff3030'; c2.font = '22px sans-serif'; c2.fillText(t.toFixed(1), (i % 3) * 640 + 8, Math.floor(i / 3) * 360 + 26); });
    return fs.writeFileSync(a2, sh.toBuffer('image/png')); }
  if (mode === 'video') { const f0 = +(a2 || 0), f1 = +(a3 || Math.round(T * 30)); const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = f0; f < f1; f++) { frame(ctx, f / 30); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise(r => ff.stdin.once('drain', r)); if ((f - f0) % 300 === 0) process.stderr.write(`${f}/${f1}\n`); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); } })();
