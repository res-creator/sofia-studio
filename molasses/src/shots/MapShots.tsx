import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import map from '../data/map.json';
import { C, FONT, appear, prog, Tag, Grain, Vignette, ws } from '../lib';
import { toOld } from '../lib';

// Same projection as tools/build_map.py (Web Mercator, km, origin = Boston)
const R = 6378.137;
const P0 = (lon: number, lat: number) => [R * (lon * Math.PI) / 180, -R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))];
const O = P0(-71.0589, 42.3601);
export const P = (lon: number, lat: number) => {
  const [x, y] = P0(lon, lat);
  return [x - O[0], y - O[1]];
};
type Cam = { cx: number; cy: number; w: number };
const toScreen = (c: Cam, x: number, y: number) => [((x - c.cx) / c.w) * 1920 + 960, ((y - c.cy) / c.w) * 1920 + 540];

const roadW: Record<number, number> = { 3: 3.2, 2: 1.8, 1: 0.9 };

// Static layers are memoised: the heavy path strings are built once.
const NELayer = React.memo(({ hiMA }: { hiMA: number }) => (
  <g>
    {map.states.map((s: any) => (
      <path key={s.name} d={s.d} fill={s.name === 'Massachusetts' ? `rgb(${242 - 8 * hiMA},${235 - 34 * hiMA},${221 - 64 * hiMA})` : s.country === 'CAN' ? '#ECE6DA' : '#F2EBDD'}
        stroke={s.name === 'Massachusetts' ? `rgba(199,122,26,${0.25 + 0.75 * hiMA})` : '#B8AC97'} strokeWidth={s.name === 'Massachusetts' ? 2 : 1.1} vectorEffect="non-scaling-stroke" />
    ))}
  </g>
));
const OSMLayer = React.memo(() => (
  <g>
    <path d={map.ne_land} fill="#F2EBDD" />
    {map.ne_parks.map((p: any, i: number) => <path key={i} d={p.d} fill="#D7E5C8" />)}
    <path d={map.ne_buildings} fill="#E3D8C4" stroke="#D2C4AC" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
    {map.ne_roads.map((r: any, i: number) => (
      <path key={'c' + i} d={r.d} fill="none" stroke="#CBBEA8" strokeWidth={roadW[r.k] + 1.6} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    ))}
    {map.ne_roads.map((r: any, i: number) => (
      <path key={i} d={r.d} fill="none" stroke="#FFFFFF" strokeWidth={roadW[r.k]} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    ))}
  </g>
));

const BaseMap: React.FC<{ cam: Cam; neO: number; osmO: number; hiMA?: number; children?: React.ReactNode }> = ({ cam, neO, osmO, hiMA = 0, children }) => {
  const k = 1920 / cam.w;
  return (
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, background: '#BCD8EA' }}>
      <g transform={`translate(960,540) scale(${k}) translate(${-cam.cx},${-cam.cy})`}>
        {neO > 0.001 && <g opacity={neO}><NELayer hiMA={hiMA} /></g>}
        {osmO > 0.001 && <g opacity={osmO}><OSMLayer /></g>}
        {children}
      </g>
    </svg>
  );
};

const Label: React.FC<{ x: number; y: number; text: string; o: number; size?: number; color?: string; weight?: number; spacing?: number; anchor?: string }> = ({ x, y, text, o, size = 24, color = C.dim, weight = 600, spacing = 4, anchor = 'middle' }) => (
  <text x={x} y={y} textAnchor={anchor as any} fill={color} opacity={o} fontFamily={FONT} fontWeight={weight} fontSize={size} letterSpacing={spacing}
    style={{ paintOrder: 'stroke', stroke: 'rgba(255,255,255,0.92)', strokeWidth: 7 } as any}>{text}</text>
);

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
// camera keyframes: [absTime, lon, lat, width_km]
type K = [number, number, number, number];
const camAt = (keys: K[], t: number): Cam => {
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
  const [t0, lo0, la0, w0] = keys[i];
  const [t1, lo1, la1, w1] = keys[i + 1];
  const p = prog(t, t0, t1);
  const [x0, y0] = P(lo0, la0);
  const [x1, y1] = P(lo1, la1);
  const lw = lerp(Math.log(w0), Math.log(w1), p);
  // move centre in step with zoom so the target stays steady on screen
  const zp = w0 === w1 ? p : (Math.log(w0) - lw) / (Math.log(w0) - Math.log(w1));
  return { cx: lerp(x0, x1, zp), cy: lerp(y0, y1, zp), w: Math.exp(lw) };
};

const TANK = { lon: -(71 + 3 / 60 + 25 / 3600), lat: 42 + 22 / 60 + 5 / 3600 }; // Wikipedia coordinates of the site
const Attribution: React.FC<{ extra?: string }> = ({ extra }) => (
  <div style={{ position: 'absolute', right: 64, bottom: 40, fontFamily: FONT, fontSize: 17, color: C.faint, letterSpacing: 0.3 }}>
    {extra ? extra + ' · ' : ''}Map data: Natural Earth; © OpenStreetMap contributors
  </div>
);

// ---------------- Shot 1–3: date plate over the Northeast, zoom to Boston, then the North End
export const MapIntro: React.FC<{ t: number; start: number }> = ({ t, start: start0 }) => {
  const start = toOld(start0); const a = toOld(t + start0);
  const keys: K[] = [
    [0, -71.6, 42.9, 1500],
    [6.2, -71.4, 42.7, 1250],
    [11.4, -71.06, 42.36, 160],
    [13.9, -71.058, 42.364, 6.5],
    [15.4, TANK.lon + 0.0012, TANK.lat - 0.0008, 2.7],
    [17.2, TANK.lon + 0.0012, TANK.lat - 0.0008, 2.35],
  ];
  const cam = camAt(keys, a);
  const neO = interpolate(cam.w, [22, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const osmO = interpolate(cam.w, [7, 20], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const hiMA = prog(a, 7.5, 9.0) * (1 - prog(a, 9.8, 11.0));
  const dimPlate = 1 - 0.55 * (1 - prog(a, 5.6, 6.8)); // map is dim under the plate, then brightens
  const S = (lon: number, lat: number) => { const [x, y] = P(lon, lat); return toScreen(cam, x, y); };
  const [bx, by] = S(-71.0589, 42.3601);
  const [tx, ty] = S(TANK.lon, TANK.lat);
  const wideO = 1 - prog(a, 9.5, 10.8);
  const stateLabels: [string, number, number][] = [['NEW YORK', -75.3, 43.0], ['VERMONT', -72.7, 44.1], ['NEW HAMPSHIRE', -71.6, 43.7], ['MAINE', -69.2, 45.3], ['CONNECTICUT', -72.7, 41.62], ['RHODE ISLAND', -71.5, 41.4]];
  // Commercial Street drawing
  const cs = map.commercial_pts as number[][];
  const csP = prog(a, ws(26) - 0.1, ws(26) + 1.1);
  const csN = Math.max(2, Math.round(cs.length * csP));
  const csD = 'M' + cs.slice(0, csN).map((q) => toScreen(cam, q[0], q[1]).map((v) => v.toFixed(1)).join(',')).join('L');
  const [lx, ly] = toScreen(cam, cs[Math.floor(cs.length * 0.62)][0], cs[Math.floor(cs.length * 0.62)][1]);
  const tankP = appear(a, ws(28), 0.5);
  return (
    <AbsoluteFill style={{ background: '#BCD8EA' }}>
      <AbsoluteFill style={{ opacity: dimPlate }}>
        <BaseMap cam={cam} neO={neO} osmO={osmO} hiMA={hiMA} />
        <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
          {stateLabels.map(([n, lo, la]) => { const [x, y] = S(lo, la); return <Label key={n} x={x} y={y} text={n} o={wideO * 0.8} size={20} color={C.faint} />; })}
          {(() => { const [x, y] = S(-71.9, 42.25); return <Label x={x} y={y} text="MASSACHUSETTS" o={wideO * appear(a, 7.3)} size={26} color={C.text} />; })()}
          {(() => { const [x, y] = S(-68.2, 41.6); return <Label x={x} y={y} text="Atlantic Ocean" o={wideO * 0.6} size={22} spacing={2} weight={400} color={C.faint} />; })()}
          {/* Boston point */}
          <g opacity={appear(a, 8.6) * (1 - prog(a, 13.2, 13.9))}>
            <circle cx={bx} cy={by} r={7} fill={C.amber} />
            <circle cx={bx} cy={by} r={16 + 6 * Math.sin(a * 3)} fill="none" stroke={C.amber} strokeWidth={2} opacity={0.6} />
            <Label x={bx + 28} y={by + 9} text="Boston" o={1} size={32} color={C.text} spacing={1} anchor="start" />
          </g>
          {/* North End */}
          {(() => { const [x, y] = S(-71.0545, 42.3655); return <Label x={x} y={y} text="NORTH END" o={appear(a, 13.6) * 0.9} size={30} color={C.text} spacing={8} />; })()}
          {/* Commercial Street */}
          {a > ws(26) - 0.15 && <path d={csD} fill="none" stroke={C.amber} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={0.95} />}
          <Label x={lx + 26} y={ly + 58} text="Commercial Street" o={appear(a, ws(26) + 0.3)} size={30} color={C.amberHi} spacing={1} anchor="start" />
          {/* tank marker */}
          <g opacity={tankP}>
            <circle cx={tx} cy={ty} r={26 * (0.6 + 0.4 * tankP)} fill="none" stroke={C.text} strokeWidth={3} />
            <circle cx={tx} cy={ty} r={7} fill={C.text} />
            <line x1={tx} y1={ty - 30} x2={tx} y2={ty - 92} stroke={C.text} strokeWidth={2} />
            <Label x={tx} y={ty - 104} text="Molasses tank" o={1} size={32} color={C.text} spacing={1} />
            <Label x={tx} y={ty - 140} text="PURITY DISTILLING CO." o={1} size={19} color={C.dim} spacing={3} />
          </g>
        </svg>
        <Attribution extra={a > 13.5 ? 'Present-day streets' : undefined} />
      </AbsoluteFill>
      <Vignette o={0.7} />
      {/* date plate */}
      <DatePlate t={a} />
    </AbsoluteFill>
  );
};

const DatePlate: React.FC<{ t: number }> = ({ t }) => {
  const o = appear(t, 0.5, 0.8) * (1 - prog(t, 5.6, 6.3));
  if (o <= 0) return null;
  const parts = ['January 15, 1919', '12:30 p.m.', 'Boston, Massachusetts'];
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: o }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 30, fontFamily: FONT, color: C.text, padding: '30px 54px', background: 'rgba(255,255,255,0.95)', boxShadow: '0 8px 30px rgba(28,27,25,0.15)', borderTop: `2px solid ${C.amber}`, borderBottom: `2px solid ${C.amber}` }}>
        {parts.map((p, i) => (
          <React.Fragment key={p}>
            {i > 0 && <span style={{ color: C.amber, fontSize: 40, opacity: appear(t, 0.9 + i * 0.6) }}>·</span>}
            <span style={{ fontSize: 46, fontWeight: i === 1 ? 800 : 600, letterSpacing: 0.5, opacity: appear(t, 0.8 + i * 0.6), color: i === 1 ? C.amberHi : C.text }}>{p}</span>
          </React.Fragment>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------------- Shot 11: the wave spreading over the North End
export const WaveMap: React.FC<{ t: number; start: number }> = ({ t, start: start0 }) => {
  const start = toOld(start0); const a = toOld(t + start0);
  const keys: K[] = [[start, TANK.lon + 0.0004, TANK.lat - 0.0014, 2.2], [start + 7, TANK.lon + 0.0004, TANK.lat - 0.0012, 1.85]];
  const cam = camAt(keys, a);
  const [tx, ty] = P(TANK.lon, TANK.lat);
  const g = prog(a, ws(76) - 0.2, ws(95) + 0.6, false);
  const r = 0.03 + 0.36 * Math.pow(g, 0.7);
  const [sx, sy] = toScreen(cam, tx, ty);
  const k = 1920 / cam.w;
  const n25 = appear(a, ws(82), 0.5), n35 = appear(a, ws(92), 0.5);
  return (
    <AbsoluteFill style={{ background: '#BCD8EA' }}>
      <BaseMap cam={cam} neO={0} osmO={1}>
        <defs>
          <clipPath id="land" clipPathUnits="userSpaceOnUse"><path d={map.ne_land} /></clipPath>
          <radialGradient id="wv">
            <stop offset="0%" stopColor={C.amber} stopOpacity={0.5} />
            <stop offset="78%" stopColor={C.amber} stopOpacity={0.4} />
            <stop offset="100%" stopColor={C.amber} stopOpacity={0} />
          </radialGradient>
        </defs>
        <g clipPath="url(#land)">
          {/* irregular, clearly schematic spread: a few offset lobes */}
          {[[0, 0, 1], [-0.06, 0.05, 0.8], [0.07, 0.06, 0.75], [-0.02, -0.06, 0.55]].map(([dx, dy, f], i) => (
            <circle key={i} cx={tx + dx * g} cy={ty + dy * g} r={r * f} fill="url(#wv)" />
          ))}
        </g>
      </BaseMap>
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        <circle cx={sx} cy={sy} r={8} fill={C.text} />
        <circle cx={sx} cy={sy} r={r * k} fill="none" stroke={C.amberHi} strokeWidth={2} opacity={0.5} />
        <Label x={sx} y={sy - 26} text="Tank" o={1} size={26} color={C.text} spacing={1} />
      </svg>
      <Vignette o={0.6} />
      {/* numbers */}
      <div style={{ position: 'absolute', left: 80, top: 330, fontFamily: FONT, color: C.text }}>
        <div style={{ opacity: n25, transform: `translateY(${(1 - n25) * 12}px)` }}>
          <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>~25 ft <span style={{ fontSize: 46, fontWeight: 600, color: C.dim, letterSpacing: 0 }}>high</span></div>
          <div style={{ fontSize: 24, fontWeight: 600, color: C.amberHi, letterSpacing: 3, marginTop: 12, textTransform: 'uppercase' }}>estimates vary</div>
        </div>
        <div style={{ opacity: n35, transform: `translateY(${(1 - n35) * 12}px)`, marginTop: 56 }}>
          <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>~35 <span style={{ fontSize: 46, fontWeight: 600, color: C.dim, letterSpacing: 0 }}>mph</span></div>
        </div>
      </div>
      <Tag t={t}>Reconstruction · illustrative extent</Tag>
      <Attribution extra="Present-day streets" />
      <Grain o={0.05} />
    </AbsoluteFill>
  );
};
