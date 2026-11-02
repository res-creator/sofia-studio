// Generic, light-palette shot components for the full episode. All cue times are ABSOLUTE seconds
// on the full timeline (full/timeline_full.json); each component gets {t (local), start (abs), dur}.
import React from 'react';
import { AbsoluteFill, Img, staticFile, interpolate } from 'remotion';
import { C, FONT, appear, prog, Tag, Caption, Arrow, Grain, fmt, KB } from '../lib';
import { BaseMap, Label, camAt, K, P, toScreen, TANK, Attribution } from '../shots/MapShots';
import map from '../data/map.json';

export type SP = { t: number; start: number; dur: number };
const A = (p: SP) => p.t + p.start;
// the first element of a card never waits more than 0.6 s (no empty cards)
const early = (at: number, p: SP, i: number) => (i === 0 ? Math.min(at, p.start + 0.6) : at);
const BG = `radial-gradient(ellipse at 50% 42%, #FFFFFF 0%, ${C.card} 60%, #EDE7DB 100%)`;
export const Light: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = BG }) => (
  <AbsoluteFill style={{ background: bg, fontFamily: FONT, color: C.text }}>{children}<Grain o={0.05} /></AbsoluteFill>
);
const push = (p: SP, k = 0.03) => `scale(${1 + k * Math.min(1, p.t / Math.max(1, p.dur))})`;
const rise = (o: number, d = 14) => ({ opacity: o, transform: `translateY(${(1 - o) * d}px)` });
const Kicker: React.FC<{ o: number; children: React.ReactNode; color?: string }> = ({ o, children, color = C.amber }) => (
  <div style={{ fontSize: 24, letterSpacing: 6, fontWeight: 600, color, textTransform: 'uppercase', opacity: o }}>{children}</div>
);

// ---------- chapter card
export const ChapterCard: React.FC<SP & { num: number; title: string }> = (p) => {
  const o = appear(p.t, 0.1, 0.6), r = prog(p.t, 0.3, 1.4);
  return (
    <Light>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', transform: push(p, 0.025) }}>
        <Kicker o={o}>Chapter {p.num}</Kicker>
        <div style={{ width: 80 + 220 * r, height: 4, background: C.amber, margin: '30px 0 34px' }} />
        <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: 4, ...rise(appear(p.t, 0.35, 0.7)) }}>{p.title}</div>
      </AbsoluteFill>
    </Light>
  );
};

// ---------- text card: kicker + title (+ sub). lines may appear on cues
export type TLine = { text: React.ReactNode; at?: number; size?: number; weight?: number; color?: string };
export const TextCard: React.FC<SP & { kicker?: string; lines: TLine[]; align?: 'center' | 'left'; tag?: string; quote?: boolean }> = (p) => {
  const a = A(p);
  const left = p.align === 'left';
  return (
    <Light>
      <AbsoluteFill style={{ alignItems: left ? 'flex-start' : 'center', justifyContent: 'center', textAlign: left ? 'left' : 'center', padding: left ? '0 200px' : '0 160px', transform: push(p) }}>
        {p.kicker && <Kicker o={appear(p.t, 0.05)}>{p.kicker}</Kicker>}
        {p.quote && <div style={{ fontSize: 200, lineHeight: 0.6, color: C.amber, fontWeight: 800, height: 90, opacity: appear(p.t, 0.1) }}>“</div>}
        {p.lines.map((l, i) => {
          const o = appear(a, early(l.at ?? p.start + 0.15 + i * 0.25, p, i), 0.45);
          return <div key={i} style={{ fontSize: l.size ?? (i === 0 ? 84 : 44), fontWeight: l.weight ?? (i === 0 ? 800 : 400), color: l.color ?? (i === 0 ? C.text : C.dim), letterSpacing: i === 0 ? -1 : 0, lineHeight: 1.18, marginTop: i === 0 ? 22 : 18, maxWidth: 1500, ...rise(o) }}>{l.text}</div>;
        })}
      </AbsoluteFill>
      {p.tag && <Tag t={p.t}>{p.tag}</Tag>}
    </Light>
  );
};

// ---------- big number (optionally counting)
export const NumberCard: React.FC<SP & { kicker?: string; value?: string; count?: { to: number; prefix?: string; suffix?: string; at: number; d?: number }; unit?: string; label?: string; sub?: string; subAt?: number; ticks?: { n: number; at: number } }> = (p) => {
  const a = A(p);
  let v = p.value ?? '';
  if (p.count) { const k = prog(a, p.count.at, p.count.at + (p.count.d ?? 1.0)); v = (p.count.prefix ?? '') + fmt(p.count.to * k) + (p.count.suffix ?? ''); }
  return (
    <Light>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', transform: push(p) }}>
        {p.kicker && <Kicker o={appear(p.t, 0.05)}>{p.kicker}</Kicker>}
        <div style={{ fontSize: 230, fontWeight: 800, letterSpacing: -8, lineHeight: 1, marginTop: 14, fontVariantNumeric: 'tabular-nums', ...rise(appear(p.t, 0.1, 0.4)) }}>
          {v}{p.unit && <span style={{ fontSize: 100, letterSpacing: -2, color: C.amber, marginLeft: 18 }}>{p.unit}</span>}
        </div>
        {p.ticks && (
          <div style={{ display: 'flex', gap: 26, marginTop: 34 }}>
            {Array.from({ length: p.ticks.n }).map((_, i) => <div key={i} style={{ width: 46, height: 46, borderRadius: 23, border: `4px solid ${C.amber}`, background: appear(a, p.ticks!.at + i * 0.18, 0.2) > 0.5 ? C.amber : 'transparent' }} />)}
          </div>
        )}
        {p.label && <div style={{ fontSize: 48, fontWeight: 600, letterSpacing: 8, textTransform: 'uppercase', color: C.dim, marginTop: 26, ...rise(appear(p.t, 0.35)) }}>{p.label}</div>}
        {p.sub && <div style={{ fontSize: 38, color: C.dim, marginTop: 20, ...rise(appear(a, p.subAt ?? p.start + 0.7)) }}>{p.sub}</div>}
      </AbsoluteFill>
    </Light>
  );
};

// ---------- chips that appear one by one
export const ChipsCard: React.FC<SP & { kicker?: string; title?: string; chips: { text: string; at: number; x?: boolean }[]; tag?: string }> = (p) => {
  const a = A(p);
  return (
    <Light>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', transform: push(p) }}>
        {p.kicker && <Kicker o={appear(p.t, 0.05)}>{p.kicker}</Kicker>}
        {p.title && <div style={{ fontSize: 72, fontWeight: 800, marginTop: 18, letterSpacing: -1, ...rise(appear(p.t, 0.1)) }}>{p.title}</div>}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24, marginTop: 50, maxWidth: 1600 }}>
          {p.chips.map((c, i) => {
            const o = appear(a, early(c.at, p, p.title ? 1 : i), 0.35);
            return <div key={i} style={{ fontSize: 44, fontWeight: 600, padding: '22px 36px', background: '#FFFFFF', borderRadius: 8, border: `2px solid ${c.x ? C.line : C.amber}`, boxShadow: '0 6px 20px rgba(28,27,25,0.08)', color: c.x ? C.dim : C.text, textDecoration: c.x ? 'line-through' : 'none', ...rise(o, 18) }}>{c.text}</div>;
          })}
        </div>
      </AbsoluteFill>
      {p.tag && <Tag t={p.t}>{p.tag}</Tag>}
    </Light>
  );
};

// ---------- horizontal timeline
export const TimelineCard: React.FC<SP & { kicker?: string; items: { top: string; label: string; at: number; hi?: boolean }[] }> = (p) => {
  const a = A(p);
  const n = p.items.length, x0 = 380, x1 = 1540;
  const xs = p.items.map((_, i) => (n === 1 ? (x0 + x1) / 2 : x0 + ((x1 - x0) * i) / (n - 1)));
  const lineP = prog(a, early(p.items[0].at, p, 0) - 0.3, p.items[n - 1].at + 0.2);
  return (
    <Light>
      {p.kicker && <div style={{ position: 'absolute', top: 170, width: '100%', textAlign: 'center' }}><Kicker o={appear(p.t, 0.05)}>{p.kicker}</Kicker></div>}
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        <line x1={x0} y1={560} x2={x0 + (x1 - x0) * lineP} y2={560} stroke={C.text} strokeWidth={3} opacity={0.35} />
        {p.items.map((it, i) => { const o = appear(a, early(it.at, p, i), 0.35); return <circle key={i} cx={xs[i]} cy={560} r={it.hi ? 18 : 12} fill={it.hi ? C.amber : C.text} opacity={o} />; })}
      </svg>
      {p.items.map((it, i) => {
        const o = appear(a, early(it.at, p, i), 0.45);
        return (
          <div key={i} style={{ position: 'absolute', left: xs[i] - 230, width: 460, textAlign: 'center', top: 380, ...rise(o) }}>
            <div style={{ fontSize: it.hi ? 76 : 64, fontWeight: 800, color: it.hi ? C.amber : C.text, letterSpacing: -1 }}>{it.top}</div>
            <div style={{ fontSize: 34, color: C.dim, marginTop: 130, lineHeight: 1.25 }}>{it.label}</div>
          </div>
        );
      })}
    </Light>
  );
};

// ---------- flow / branch diagram: boxes with arrows
export const FlowCard: React.FC<SP & { kicker?: string; steps: { text: string; sub?: string; at: number }[]; branch?: boolean; tag?: string }> = (p) => {
  const a = A(p);
  const n = p.steps.length;
  const pos = p.branch
    ? [[480, 540], [1380, 360], [1380, 720]]
    : p.steps.map((_, i) => [n === 1 ? 960 : 300 + (1320 * i) / (n - 1), 540]);
  return (
    <Light>
      {p.kicker && <div style={{ position: 'absolute', top: 150, width: '100%', textAlign: 'center' }}><Kicker o={appear(p.t, 0.05)}>{p.kicker}</Kicker></div>}
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        {p.steps.slice(1).map((s, i) => {
          const [fx, fy] = p.branch ? pos[0] : pos[i];
          const [tx, ty] = pos[i + 1];
          const k = prog(a, s.at - 0.35, s.at);
          const sx = fx + 190, ex = tx - 190;
          const x = sx + (ex - sx) * k, y = fy + (ty - fy) * k;
          return (
            <g key={i}>
              <line x1={sx} y1={fy} x2={x} y2={y} stroke={C.amber} strokeWidth={5} strokeLinecap="round" />
              {k > 0.97 && <path d={`M${ex - 22},${ty - 14} L${ex},${ty} L${ex - 22},${ty + 14}`} fill="none" stroke={C.amber} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" transform={`rotate(${(Math.atan2(ty - fy, ex - sx) * 180) / Math.PI} ${ex} ${ty})`} />}
            </g>
          );
        })}
      </svg>
      {p.steps.map((s, i) => {
        const o = appear(a, early(s.at, p, i), 0.4);
        const [x, y] = pos[i];
        return (
          <div key={i} style={{ position: 'absolute', left: x - 180, top: y - 90, width: 360, height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: '#FFFFFF', borderRadius: 10, border: `2px solid ${i === 0 ? C.text : C.amber}`, boxShadow: '0 8px 24px rgba(28,27,25,0.08)', ...rise(o) }}>
            <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1 }}>{s.text}</div>
            {s.sub && <div style={{ fontSize: 24, color: C.dim, marginTop: 10, lineHeight: 1.2, padding: '0 14px' }}>{s.sub}</div>}
          </div>
        );
      })}
      {p.tag && <Tag t={p.t}>{p.tag}</Tag>}
    </Light>
  );
};

// ---------- kinetic words (calm: each phrase fades in on its word)
export const WordsCard: React.FC<SP & { words: { text: string; at: number; amber?: boolean }[]; size?: number }> = (p) => {
  const a = A(p);
  return (
    <Light>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: '0 34px', padding: '0 160px', transform: push(p) }}>
        {p.words.map((w, i) => <div key={i} style={{ fontSize: p.size ?? 110, fontWeight: 800, letterSpacing: -2, color: w.amber ? C.amber : C.text, ...rise(appear(a, early(w.at, p, i), 0.35), 18) }}>{w.text}</div>)}
      </AbsoluteFill>
    </Light>
  );
};

// ---------- names (memorial list)
export const NamesCard: React.FC<SP & { kicker?: string; names: { name: string; age?: string; at: number }[]; cols?: number; size?: number }> = (p) => {
  const a = A(p);
  const cols = p.cols ?? 1;
  return (
    <Light>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: push(p, 0.02) }}>
        {p.kicker && <Kicker o={appear(p.t, 0.05)}>{p.kicker}</Kicker>}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, auto)`, gap: cols > 1 ? '14px 80px' : '22px', marginTop: 40 }}>
          {p.names.map((n, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 26, ...rise(appear(a, early(n.at, p, i), 0.5), 10) }}>
              <div style={{ fontSize: p.size ?? 74, fontWeight: 600, letterSpacing: -0.5 }}>{n.name}</div>
              {n.age && <div style={{ fontSize: (p.size ?? 74) * 0.6, fontWeight: 400, color: C.amber }}>{n.age}</div>}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </Light>
  );
};

// ---------- archival photo (pure B&W, Ken Burns, white caption card, optional arrows)
const kbPt = (px: number, py: number, kb: KB, q: number) => {
  const s = kb.s0 + (kb.s1 - kb.s0) * q, x = kb.x0 + (kb.x1 - kb.x0) * q, y = kb.y0 + (kb.y1 - kb.y0) * q;
  return [960 + (px - 960) * s + (x * 1920) / 100, 540 + (py - 540) * s + (y * 1080) / 100];
};
export const PhotoShot: React.FC<SP & { src: string; kb: KB; text?: string; source: string; arrows?: { px: number; py: number; dx: number; dy: number; at: number; label?: string }[]; tag?: string }> = (p) => {
  const q = Math.min(1, Math.max(0, p.t / p.dur));
  const s = p.kb.s0 + (p.kb.s1 - p.kb.s0) * q, x = p.kb.x0 + (p.kb.x1 - p.kb.x0) * q, y = p.kb.y0 + (p.kb.y1 - p.kb.y0) * q;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: C.bg }}>
      <Img src={staticFile('img/' + p.src)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `translate(${x}%, ${y}%) scale(${s})`, filter: 'grayscale(1) contrast(1.06)' }} />
      {(p.arrows ?? []).map((ar, i) => {
        const [x2, y2] = kbPt(ar.px, ar.py, p.kb, q);
        return <Arrow key={i} x1={x2 + ar.dx} y1={y2 + ar.dy} x2={x2} y2={y2} t={A(p)} at={ar.at} label={ar.label} lx={x2 + ar.dx + 8} ly={y2 + ar.dy + (ar.dy > 0 ? 34 : -14)} anchor={ar.dx < 0 ? 'end' : 'start'} />;
      })}
      {p.text && <Caption t={p.t} at={0.25} text={p.text} source={p.source} />}
      {!p.text && <div style={{ position: 'absolute', right: 40, bottom: 28, fontFamily: FONT, fontSize: 17, color: '#fff', background: 'rgba(28,27,25,0.55)', padding: '6px 12px', borderRadius: 3 }}>{p.source}</div>}
      {p.tag && <Tag t={p.t}>{p.tag}</Tag>}
      <Grain o={0.06} />
    </AbsoluteFill>
  );
};

// framed print on light background (for small/low-res files and newspaper crops)
export const PrintShot: React.FC<SP & { src: string; crop?: [number, number, number, number]; srcW: number; srcH: number; w: number; text: string; source: string; rot?: number; overlay?: React.ReactNode; tag?: string; zoom?: number }> = (p) => {
  const [cx, cy, cw, ch] = p.crop ?? [0, 0, p.srcW, p.srcH];
  const k = p.w / cw, h = ch * k;
  const z = 1 + (p.zoom ?? 0.04) * Math.min(1, p.t / p.dur);
  return (
    <Light>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: p.w, height: h, overflow: 'hidden', position: 'relative', border: '10px solid #FFFFFF', boxShadow: '0 14px 40px rgba(28,27,25,0.2)', marginTop: -70, transform: `scale(${z}) rotate(${p.rot ?? 0}deg)`, ...rise(appear(p.t, 0.0, 0.5), 10) }}>
          <Img src={staticFile('img/' + p.src)} style={{ position: 'absolute', left: -cx * k, top: -cy * k, width: p.srcW * k, height: p.srcH * k, filter: 'grayscale(1) contrast(1.06)' }} />
          {p.overlay}
        </div>
      </AbsoluteFill>
      <Caption t={p.t} at={0.3} text={p.text} source={p.source} />
      {p.tag && <Tag t={p.t}>{p.tag}</Tag>}
    </Light>
  );
};

// ---------- maps (present-day OSM + Natural Earth), light style
const mixC = (c1: string, c2: string, k: number) => { const h = (c: string, i: number) => parseInt(c.slice(1 + 2 * i, 3 + 2 * i), 16); return 'rgb(' + [0, 1, 2].map((i) => Math.round(h(c1, i) + (h(c2, i) - h(c1, i)) * k)).join(',') + ')'; };
const LANGONE = (map.ne_parks as any[]).find((x) => x.name === 'Langone Park');
export const MapShot: React.FC<SP & { keys: K[]; markers?: { lon: number; lat: number; label: string; sub?: string; at: number }[]; texts?: { lon: number; lat: number; text: string; at: number; size?: number; color?: string }[]; commercial?: number; park?: number; west?: { at: number; label: string }; wave?: { at: number; d: number; r: number }; water?: number; note?: { text: string; at: number }; tag?: string }> = (p) => {
  const a = A(p);
  const keys = p.keys.map(([tt, lo, la, w]) => [p.start + tt, lo, la, w] as K);
  const cam = camAt(keys, a);
  const neO = interpolate(cam.w, [22, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const osmO = interpolate(cam.w, [7, 20], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const S = (lon: number, lat: number) => { const [x, y] = P(lon, lat); return toScreen(cam, x, y); };
  const cs = map.commercial_pts as number[][];
  const csP = p.commercial !== undefined ? prog(a, p.commercial, p.commercial + 1.0) : 0;
  const csD = 'M' + cs.slice(0, Math.max(2, Math.round(cs.length * csP))).map((q) => toScreen(cam, q[0], q[1]).map((v) => v.toFixed(1)).join(',')).join('L');
  const [tx, ty] = P(TANK.lon, TANK.lat);
  const k = 1920 / cam.w;
  const wv = p.wave ? prog(a, p.wave.at, p.wave.at + p.wave.d, false) : 0;
  return (
    <AbsoluteFill style={{ background: '#BCD8EA' }}>
      <BaseMap cam={cam} neO={neO} osmO={osmO} water={p.water !== undefined ? mixC('#BCD8EA', '#C8B48E', prog(a, p.water, p.water + 1.4)) : undefined}>
        {p.park !== undefined && LANGONE && <path d={LANGONE.d} fill={C.amber} opacity={0.55 * prog(a, p.park, p.park + 0.6)} stroke={C.amber} strokeWidth={2} vectorEffect="non-scaling-stroke" />}
        {p.wave && (
          <g clipPath="url(#landF)">
            <defs>
              <clipPath id="landF" clipPathUnits="userSpaceOnUse"><path d={map.ne_land} /></clipPath>
              <radialGradient id="wvF"><stop offset="0%" stopColor={C.amber} stopOpacity={0.5} /><stop offset="80%" stopColor={C.amber} stopOpacity={0.38} /><stop offset="100%" stopColor={C.amber} stopOpacity={0} /></radialGradient>
            </defs>
            {[[0, 0, 1], [-0.06, 0.05, 0.8], [0.07, 0.06, 0.75], [-0.02, -0.06, 0.55]].map(([dx, dy, f], i) => <circle key={i} cx={tx + dx * wv} cy={ty + dy * wv} r={(0.03 + p.wave!.r * Math.pow(wv, 0.7)) * f} fill="url(#wvF)" />)}
          </g>
        )}
      </BaseMap>
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        {p.commercial !== undefined && a > p.commercial - 0.1 && <path d={csD} fill="none" stroke={C.amber} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />}
        {(p.texts ?? []).map((x, i) => { const [sx, sy] = S(x.lon, x.lat); return <Label key={i} x={sx} y={sy} text={x.text} o={appear(a, x.at)} size={x.size ?? 28} color={x.color ?? C.text} spacing={x.size && x.size > 28 ? 6 : 1} />; })}
        {(p.markers ?? []).map((m, i) => {
          const [mx, my] = S(m.lon, m.lat); const o = appear(a, m.at, 0.5);
          return (
            <g key={i} opacity={o}>
              <circle cx={mx} cy={my} r={24 * (0.6 + 0.4 * o)} fill="none" stroke={C.text} strokeWidth={3} />
              <circle cx={mx} cy={my} r={7} fill={C.text} />
              <line x1={mx} y1={my - 28} x2={mx} y2={my - 88} stroke={C.text} strokeWidth={2} />
              <Label x={mx} y={my - 100} text={m.label} o={1} size={32} color={C.text} spacing={1} />
              {m.sub && <Label x={mx} y={my - 138} text={m.sub} o={1} size={19} color={C.dim} spacing={3} />}
            </g>
          );
        })}
        {p.wave && (() => { const [sx, sy] = toScreen(cam, tx, ty); return <circle cx={sx} cy={sy} r={(0.03 + p.wave.r * Math.pow(wv, 0.7)) * k} fill="none" stroke={C.amber} strokeWidth={2} opacity={0.5} />; })()}
        {p.west && (() => {
          const [sx, sy] = S(TANK.lon, TANK.lat); const q = prog(a, p.west.at, p.west.at + 1.4);
          const ex = sx - (sx - 120) * q;
          return (
            <g>
              <line x1={sx - 20} y1={sy} x2={ex} y2={sy + 40 * q} stroke={C.amber} strokeWidth={5} strokeDasharray="16 12" strokeLinecap="round" />
              {q > 0.95 && <Label x={150} y={sy + 40 - 26} text={p.west.label} o={appear(a, p.west.at + 1.2)} size={30} color={C.text} spacing={1} anchor="start" />}
            </g>
          );
        })()}
      </svg>
      {p.note && (
        <div style={{ position: 'absolute', left: 64, bottom: 60, maxWidth: 1000, background: 'rgba(255,255,255,0.95)', padding: '20px 28px', borderRadius: 4, boxShadow: '0 6px 24px rgba(28,27,25,0.12)', fontFamily: FONT, fontSize: 34, fontWeight: 600, borderLeft: `4px solid ${C.amber}`, ...rise(appear(a, p.note.at)) }}>{p.note.text}</div>
      )}
      <Attribution extra={cam.w < 20 ? 'Present-day streets' : undefined} />
      {p.tag && <Tag t={p.t}>{p.tag}</Tag>}
      <Grain o={0.04} />
    </AbsoluteFill>
  );
};
export { TANK };

// ---------- line chart (schematic, no axis numbers unless given)
export const GraphCard: React.FC<SP & { kicker: string; xl: string; yl: string; pts: [number, number][]; at: number; d?: number; labels?: { i: number; text: string; at: number; below?: boolean }[]; color?: string; tag?: string }> = (p) => {
  const a = A(p);
  const X0 = 360, X1 = 1560, Y0 = 820, Y1 = 300;
  const xy = p.pts.map(([x, y]) => [X0 + (X1 - X0) * x, Y0 - (Y0 - Y1) * y]);
  const q = prog(a, p.at, p.at + (p.d ?? 1.6));
  const n = Math.max(2, Math.ceil(xy.length * q));
  const part = xy.slice(0, n);
  const d = 'M' + part.map((v) => v.join(',')).join('L');
  return (
    <Light>
      <div style={{ position: 'absolute', top: 140, width: '100%', textAlign: 'center' }}><Kicker o={appear(p.t, 0.05)}>{p.kicker}</Kicker></div>
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.text} strokeWidth={2} opacity={0.4} />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1 - 40} stroke={C.text} strokeWidth={2} opacity={0.4} />
        <text x={X1} y={Y0 + 50} textAnchor="end" fontFamily={FONT} fontSize={28} fill={C.dim}>{p.xl}</text>
        <text x={X0 - 20} y={Y1 - 60} textAnchor="start" fontFamily={FONT} fontSize={28} fill={C.dim}>{p.yl}</text>
        <path d={d} fill="none" stroke={p.color ?? C.amber} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        {(p.labels ?? []).map((l, i) => { const [x, y] = xy[Math.min(l.i, xy.length - 1)]; const o = appear(a, l.at); return (
          <g key={i} opacity={o}><circle cx={x} cy={y} r={12} fill={p.color ?? C.amber} /><text x={x} y={l.below ? y + 66 : y - 34} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill={C.text}>{l.text}</text></g>
        ); })}
      </svg>
      {p.tag && <Tag t={p.t}>{p.tag}</Tag>}
    </Light>
  );
};

// ---------- wave height comparison (bars to scale, with a 6-ft person for scale)
export const HeightsCard: React.FC<SP & { bars: { ft: number; label: string; sub: string; at: number; hi?: boolean }[] }> = (p) => {
  const a = A(p);
  const base = 860, pxft = 13;
  return (
    <Light>
      <div style={{ position: 'absolute', top: 120, width: '100%', textAlign: 'center' }}><Kicker o={appear(p.t, 0.05)}>Height of the wave · estimates vary</Kicker></div>
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        <line x1={300} y1={base} x2={1650} y2={base} stroke={C.text} strokeWidth={3} opacity={0.5} />
        {/* person, 6 ft, for scale */}
        <g opacity={appear(p.t, 0.2)} fill={C.text}>
          <circle cx={420} cy={base - 6 * pxft + 9} r={9} />
          <rect x={412} y={base - 6 * pxft + 20} width={16} height={6 * pxft - 20} rx={6} />
        </g>
        <text x={420} y={base + 44} textAnchor="middle" fontFamily={FONT} fontSize={24} fill={C.dim} opacity={appear(p.t, 0.2)}>6 ft person</text>
        {p.bars.map((b, i) => {
          const g = prog(a, b.at, b.at + 0.7); const h = b.ft * pxft * g; const x = 640 + i * 340;
          return (
            <g key={i}>
              <rect x={x} y={base - h} width={200} height={h} fill={b.hi ? C.amber : 'rgba(199,122,26,0.35)'} />
              <text x={x + 100} y={base - h - 24} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} fill={C.text} opacity={g}>{b.label}</text>
              <text x={x + 100} y={base + 44} textAnchor="middle" fontFamily={FONT} fontSize={26} fill={C.dim} opacity={g}>{b.sub}</text>
            </g>
          );
        })}
      </svg>
      <Tag t={p.t}>Diagram · to scale</Tag>
    </Light>
  );
};
