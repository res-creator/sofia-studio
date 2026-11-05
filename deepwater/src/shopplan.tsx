// Where Mike Williams was at about 9:45–9:49 p.m. — RECONSTRUCTION from his own testimony (JIT hearing, July 23, 2010):
// his electronics shop sat "directly center of the rig with engines", engine 3 on his port side, engine 4 on his starboard side;
// it adjoined the engine control room (shared ventilation); it was "directly below the riser skate" that feeds the riser to the rig floor.
// Everything else about the layout is unknown here and is not drawn. Plan view, not to scale.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SANS, INK, ACC, BG } from './kit';
import { WC } from './well';
import { ease, Headline } from './bopscene';
const HC = WC.hc;
const box = (x: number, y: number, w: number, h: number, label: string, o: number, hl = 0, col = INK) => (
  <g opacity={o}>
    <rect x={x} y={y} width={w} height={h} rx={10} fill={hl ? 'rgba(232,163,61,0.16)' : '#171B1F'} stroke={hl ? ACC : 'rgba(242,239,233,0.45)'} strokeWidth={hl ? 5 : 3} />
    {label.split('\n').map((l, i, a) => <text key={i} x={x + w / 2} y={y + h / 2 + (i - (a.length - 1) / 2) * 40 + 12} fill={hl ? ACC : col} fontFamily={SANS} fontWeight={800} fontSize={34} textAnchor="middle">{l}</text>)}
  </g>
);
export const ShopPlan: React.FC<{ t: number; above?: number; ecr?: number; gas?: number; eng3?: number; route?: number; caption?: [string, string?]; capAt?: number; push?: number }> = ({ t, above = 0, ecr = 0, gas = 0, eng3 = 0, route = 0, caption, capAt = 0.3, push = 0 }) => {
  const S = { x: 760, y: 470, w: 400, h: 220 };
  return (
    <AbsoluteFill style={{ background: BG }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', transform: `scale(${1 + 0.18 * push})`, transformOrigin: '30% 55%' }}>
        {/* the unknown rest of the rig: a faint field, no walls drawn */}
        <rect x={160} y={180} width={1600} height={760} fill="none" stroke="rgba(242,239,233,0.12)" strokeWidth={2} strokeDasharray="12 12" />
        {box(S.x, S.y, S.w, S.h, 'ELECTRONICS\nSHOP', 1, 1)}
        {box(300, 470, 380, 220, 'ENGINE 3\n(PORT SIDE)', 1, eng3 > 0.5 ? 1 : 0, eng3 > 0.5 ? ACC : INK)}
        {box(1240, 470, 380, 220, 'ENGINE 4\n(STARBOARD)', 1)}
        {box(760, 240, 400, 170, 'ENGINE\nCONTROL ROOM', 1, ecr > 0.5 ? 1 : 0)}
        {/* gas reaching the engines (Commission, ch. 4) */}
        {gas > 0 && [[490, 580], [1430, 580]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={240 * gas} ry={150 * gas} fill={HC} opacity={0.22 * gas} />)}
        {/* riser skate / rig floor above the shop (side note, not a plan element) */}
        {above > 0 && <g opacity={above}>
          <text x={960} y={S.y + S.h + 56} fill={INK} fontFamily={SANS} fontWeight={700} fontSize={30} textAnchor="middle">ONE LEVEL ABOVE THE SHOP: THE RISER SKATE AND THE RIG FLOOR</text>
        </g>}
        {/* the way out: shop → engine control room → outside (route itself unknown) */}
        {route > 0 && <g opacity={route}>
          <path d={`M960,${S.y} L960,410`} stroke={ACC} strokeWidth={8} markerEnd="url(#ar)" />
          <path d={`M1160,325 L1520,325`} stroke={ACC} strokeWidth={8} strokeDasharray="16 12" markerEnd="url(#ar)" />
          <text x={1540} y={335} fill={ACC} fontFamily={SANS} fontWeight={800} fontSize={34}>OUTSIDE</text>
          <text x={1340} y={300} fill={INK} fontFamily={SANS} fontWeight={600} fontSize={24} textAnchor="middle">route unknown</text>
        </g>}
        <defs><marker id="ar" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={ACC} /></marker></defs>
      </svg>
      {caption && <Headline t={t} at={capAt} bottom big={caption[0]} small={caption[1]} />}
      <div style={{ position: 'absolute', right: 60, bottom: 34, textAlign: 'right', fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: 2, color: 'rgba(242,239,233,0.6)', lineHeight: 1.5 }}>RECONSTRUCTION FROM WILLIAMS'S TESTIMONY · PLAN VIEW<br />POSITIONS APPROXIMATE · REST OF THE RIG NOT SHOWN</div>
    </AbsoluteFill>
  );
};
