// Maps from real data: Natural Earth locator, and the USGS pre-1980 elevation model (topography ~1952, CC0).
import React from 'react';
import { AbsoluteFill, Img, staticFile, interpolate, Easing } from 'remotion';
import M from './data/maps.json';
import { SANS, INK, ACC, RED, BG, pe, SP } from './kit';
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
type Cam = { cx: number; cy: number; w: number }; // centre (image fractions) and visible width (fraction of image width)
const useCam = (t: number, dur: number, a: Cam, b: Cam) => {
  const k = interpolate(t, [0, Math.max(dur, 0.1)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin) });
  return { cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), w: lerp(a.w, b.w, k) };
};
const tx = (c: Cam, iw: number, ih: number) => { const s = 1920 / (c.w * iw); return { s, f: (x: number, y: number) => [960 + (x - c.cx) * iw * s, 540 + (y - c.cy) * ih * s] as [number, number] }; };
const Base: React.FC<{ src: string; iw: number; ih: number; c: Cam }> = ({ src, iw, ih, c }) => {
  const { s } = tx(c, iw, ih);
  return <Img src={staticFile('map/' + src)} style={{ position: 'absolute', width: iw * s, height: ih * s, left: 960 - c.cx * iw * s, top: 540 - c.cy * ih * s, maxWidth: 'none' }} />;
};
const Txt: React.FC<{ x: number; y: number; text: string; o: number; size?: number; color?: string; anchor?: 'start' | 'middle' | 'end'; weight?: number; ls?: number }> = ({ x, y, text, o, size = 30, color = INK, anchor = 'start', weight = 700, ls = 2 }) => (
  <text x={x} y={y} fill={color} opacity={o} fontFamily={SANS} fontWeight={weight} fontSize={size} letterSpacing={ls} textAnchor={anchor} style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.75)', strokeWidth: 6 }}>{text}</text>
);
const Dot: React.FC<{ x: number; y: number; o: number; r?: number; color?: string }> = ({ x, y, o, r = 11, color = ACC }) => (
  <g opacity={o}><circle cx={x} cy={y} r={r + 7} fill="none" stroke={color} strokeWidth={3} opacity={0.6} /><circle cx={x} cy={y} r={r} fill={color} stroke="#000" strokeWidth={2} /></g>
);
export const RegionMap: React.FC<SP> = ({ t, dur }) => {
  const R = M.region; const c = useCam(t, dur, { cx: 0.36, cy: 0.56, w: 0.95 }, { cx: 0.35, cy: 0.58, w: 0.62 });
  const { f } = tx(c, R.w, R.h); const p = (q: number[]) => f(q[0], q[1]);
  const [mx, my] = p(R.msh), [sx, sy] = p(R.seattle), [px, py] = p(R.portland), [wx, wy] = p(R.wa_label), [ox, oy] = p(R.or_label);
  return (
    <AbsoluteFill style={{ background: BG, overflow: 'hidden' }}>
      <Base src="region.jpg" iw={R.w} ih={R.h} c={c} />
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <Txt x={wx} y={wy} text="WASHINGTON" o={0.75} size={40} anchor="middle" ls={8} weight={600} />
        <Txt x={ox} y={oy} text="OREGON" o={0.75} size={40} anchor="middle" ls={8} weight={600} />
        <Dot x={sx} y={sy} o={pe(t, 0.2, 0.4)} r={7} color={INK} /><Txt x={sx + 22} y={sy + 10} text="Seattle" o={pe(t, 0.2, 0.4)} size={30} weight={600} ls={1} />
        <Dot x={px} y={py} o={pe(t, 0.3, 0.4)} r={7} color={INK} /><Txt x={px + 22} y={py + 10} text="Portland" o={pe(t, 0.3, 0.4)} size={30} weight={600} ls={1} />
        <Dot x={mx} y={my} o={pe(t, 0.5, 0.5)} /><Txt x={mx + 30} y={my + 11} text="MOUNT ST. HELENS" o={pe(t, 0.6, 0.5)} size={36} color={ACC} />
      </svg>
    </AbsoluteFill>
  );
};
// relief overlays: 'place' (summit, Coldwater II, 6 mi, Spirit Lake), 'flank' (north flank), 'blast' (schematic direction)
export const ReliefMap: React.FC<SP & { a: Cam; b: Cam; show: ('place' | 'flank' | 'blast')[]; ats?: Record<string, number> }> = ({ t, dur, a, b, show, ats = {} }) => {
  const R = M.relief; const c = useCam(t, dur, a, b); const { f, s } = tx(c, R.w, R.h); const p = (q: number[]) => f(q[0], q[1]);
  const [hx, hy] = p(R.summit), [cx, cy] = p(R.coldwater2), [lx, ly] = p(R.spirit_lake), [nx, ny] = p(R.north_flank);
  const at = (k: string, d: number) => pe(t, ats[k] ?? 0.3, d);
  const kPlace = show.includes('place') ? at('place', 0.6) : 0, kLine = show.includes('place') ? pe(t, (ats.place ?? 0.3) + 0.5, 1.0) : 0;
  const kFlank = show.includes('flank') ? at('flank', 0.7) : 0, kBlast = show.includes('blast') ? at('blast', 1.4) : 0;
  const ex = hx + (cx - hx) * kLine, ey = hy + (cy - hy) * kLine;
  const rpx = 1.3 / R.km_per_px / R.w * R.w * s; // ~1.3 km radius in screen px (flank highlight)
  // blast fan: from the north flank toward the north, ~6 mi long (schematic)
  const L = Math.hypot(cx - hx, cy - hy) * 1.15 * kBlast; const ang0 = Math.atan2(cy - hy, cx - hx);
  const fan = [-0.75, -0.35, 0, 0.35, 0.75].map((d) => [hx + Math.cos(ang0 + d * 0.9) * L, hy + Math.sin(ang0 + d * 0.9) * L]);
  return (
    <AbsoluteFill style={{ background: BG, overflow: 'hidden' }}>
      <Base src="relief_pre1980.jpg" iw={R.w} ih={R.h} c={c} />
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <defs><marker id="ah" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={RED} /></marker></defs>
        {kBlast > 0 && fan.map(([x, y], i) => <line key={i} x1={hx} y1={hy} x2={x} y2={y} stroke={RED} strokeWidth={i === 2 ? 9 : 6} opacity={0.85} markerEnd="url(#ah)" />)}
        {kFlank > 0 && <ellipse cx={nx} cy={ny} rx={rpx * 1.1} ry={rpx * 0.75} fill="rgba(232,163,61,0.18)" stroke={ACC} strokeWidth={4} strokeDasharray="14 10" opacity={kFlank} />}
        {kFlank > 0 && <Txt x={nx + rpx * 1.25} y={ny + 10} text="NORTH FLANK" o={kFlank} size={36} color={ACC} />}
        <Dot x={hx} y={hy} o={Math.max(kPlace, kFlank, kBlast)} r={9} color={INK} />
        <Txt x={hx + 26} y={hy + 54} text={`SUMMIT · ${R.summit_ft.toLocaleString('en-US')} FT`} o={Math.max(kPlace, kFlank)} size={28} />
        {kPlace > 0 && <line x1={hx} y1={hy} x2={ex} y2={ey} stroke={INK} strokeWidth={3} strokeDasharray="10 8" opacity={0.9} />}
        {kPlace > 0 && <Txt x={(hx + cx) / 2 - 24} y={(hy + cy) / 2} text="≈ 6 MILES" o={kLine} size={30} anchor="end" />}
        <Dot x={cx} y={cy} o={Math.max(kPlace, kBlast)} r={9} />
        <Txt x={cx - 24} y={cy - 26} text="COLDWATER II · USGS POST" o={Math.max(kPlace, kBlast)} size={30} color={ACC} anchor="middle" />
        <Txt x={lx} y={ly + 8} text="SPIRIT LAKE" o={kPlace * 0.9} size={26} anchor="middle" weight={600} />
        {/* north arrow */}
        <g opacity={0.85} transform="translate(1810,120)"><path d="M0,-40 L14,10 L0,0 L-14,10 Z" fill={INK} /><Txt x={0} y={42} text="N" o={1} size={28} anchor="middle" /></g>
      </svg>
      {kBlast > 0 && <div style={{ position: 'absolute', left: 70, top: 64, fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: RED, opacity: kBlast, textShadow: '0 2px 8px #000' }}>SCHEMATIC · DIRECTION OF THE BLAST</div>}
      <div style={{ position: 'absolute', left: 70, bottom: 56, fontFamily: SANS, fontWeight: 500, fontSize: 22, color: 'rgba(242,239,233,0.75)', textShadow: '0 2px 8px #000' }}>Terrain before 1980: USGS elevation model (doi:10.5066/P91W7C1L) · positions approximate</div>
    </AbsoluteFill>
  );
};
