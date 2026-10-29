// Tiny procedural SFX synth (no samples, no paid generation) -> sfx.wav (44.1 kHz mono, 15 s)
const fs = require('fs'); const SR = 44100, DUR = 15, N = SR * DUR, buf = new Float32Array(N);
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647 * 2 - 1;
function add(t0, dur, fn, g = 1) { const a = Math.floor(t0 * SR), n = Math.floor(dur * SR); for (let i = 0; i < n && a + i < N; i++) buf[a + i] += fn(i / SR, i / n) * g; }
const env = (u, a = 0.02, r = 0.6) => u < a ? u / a : Math.pow(1 - (u - a) / (1 - a), 1 / r * 1.5);
const tone = (f0, f1, type = 'sin') => { let ph = 0; return (t, u) => { const f = f0 + (f1 - f0) * u; ph += f / SR; const s = type === 'sq' ? (ph % 1 < 0.5 ? 1 : -1) * 0.5 : type === 'saw' ? ((ph % 1) * 2 - 1) * 0.6 : Math.sin(ph * 2 * Math.PI); return s * env(u); }; };
const noise = (lp = 0.3) => { let y = 0; return (t, u) => { y += (rnd() - y) * lp; return y * env(u, 0.005, 0.5); }; };
const whoosh = (t0, d, up = true) => { let y = 0; add(t0, d, (t, u) => { const lp = 0.02 + 0.3 * (up ? u : 1 - u); y += (rnd() - y) * lp; return y * Math.sin(Math.PI * u) * 1.6; }, 0.6); };
const thud = (t0, g = 1) => { add(t0, 0.35, tone(120, 38), 1.0 * g); add(t0, 0.12, noise(0.25), 0.7 * g); };
const pop = (t0) => add(t0, 0.14, tone(400, 900), 0.45);
const click = (t0) => { add(t0, 0.05, noise(0.6), 0.6); add(t0, 0.06, tone(1800, 900, 'sq'), 0.2); };
// bedroom: three swipes + phone ticks
for (const t of [0.5, 1.15, 1.75, 2.3]) { whoosh(t, 0.16, true); add(t + 0.17, 0.03, tone(2400, 2000), 0.25); }
add(1.3, 0.2, tone(300, 420), 0.2); // tiny snort-laugh
whoosh(2.35, 0.6, true); add(2.4, 0.6, tone(200, 1600), 0.18); // zoom into the eye
add(2.97, 0.5, tone(90, 30), 0.9); add(2.97, 0.25, noise(0.2), 0.5); // impact into the body
// alarm: 3 short beeps + button click
click(3.5);
for (let i = 0; i < 3; i++) add(3.6 + i * 0.22, 0.14, tone(1320, 1320, 'sq'), 0.28);
for (let i = 0; i < 3; i++) add(4.0 + i * 0.0, 0, () => 0);
// cuts
for (const t of [4.03, 6.98, 8.98, 10.98, 13.28]) whoosh(t - 0.1, 0.16, false);
// slam + mug rattle + bubble
thud(4.3, 1.1); for (let i = 0; i < 5; i++) add(4.34 + i * 0.07, 0.04, tone(900 + i * 80, 700), 0.2 * (1 - i / 6));
pop(4.38); add(4.38, 0.3, tone(200, 120, 'saw'), 0.08);
// frustration grunts (low squeaks) while gesturing
for (const t of [5.0, 5.7, 6.2]) add(t, 0.18, tone(220, 160, 'saw'), 0.12);
// heart gasp-squeak + boing + panicked heartbeat
add(3.3, 0.12, tone(900, 1300), 0.2); add(4.32, 0.14, tone(700, 1500), 0.25);
add(7.05, 0.35, tone(300, 900), 0.22); pop(7.1);
for (let t = 4.5; t < 13.2; t += t < 7 ? 0.42 : 0.3) { add(t, 0.1, tone(70, 45), 0.35); add(t + 0.13, 0.1, tone(65, 42), 0.25); }
// stomach: yawn, rumble, pop, cheese stretch, bite
add(9.35, 0.9, (t, u) => Math.sin(2 * Math.PI * (160 + 90 * Math.sin(u * Math.PI)) * t) * Math.sin(Math.PI * u) * 0.35, 0.3);
for (let i = 0; i < 6; i++) add(10.55 + i * 0.07, 0.2, tone(70 + i * 6, 40), 0.55); add(10.55, 0.5, noise(0.05), 0.5);
pop(11.35); add(12.3, 0.4, tone(300, 1400), 0.12); // cheese stretch
add(12.75, 0.12, noise(0.5), 0.8); add(12.88, 0.1, noise(0.5), 0.7); add(13.0, 0.1, noise(0.5), 0.6); // crunchy bites
// reaction: slap on face, then the comedic "womp womp" sting after the pause
add(13.45, 0.08, noise(0.7), 0.9); thud(13.46, 0.5);
const womp = (t0, f0, f1) => add(t0, 0.42, (t, u) => { const f = f0 + (f1 - f0) * u; const v = 1 + 0.05 * Math.sin(t * 40); return (Math.sin(2 * Math.PI * f * t * v) * 0.7 + (((f * t) % 1) * 2 - 1) * 0.3) * Math.sin(Math.PI * Math.min(1, u * 1.1)) ; }, 0.35);
womp(14.4, 230, 215); womp(14.85 - 0.0, 215, 170);
// fade-out safety
for (let i = 0; i < N; i++) { const t = i / SR; if (t > 14.8) buf[i] *= Math.max(0, (15 - t) / 0.2); }
let peak = 0; for (const v of buf) peak = Math.max(peak, Math.abs(v)); const k = 0.85 / peak;
const out = Buffer.alloc(44 + N * 2); out.write('RIFF', 0); out.writeUInt32LE(36 + N * 2, 4); out.write('WAVEfmt ', 8); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22); out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(buf[i] * k * 32767))), 44 + i * 2);
fs.writeFileSync(__dirname + '/sfx.wav', out); console.log('sfx.wav ok, peak', peak.toFixed(2));
