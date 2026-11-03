// RECONSTRUCTION (simplified, not to scale) of the May 18, 1980 sequence, after USGS descriptions
// (USGS CVO "1980 Cataclysmic Eruption"; Lipman & Mullineaux eds., USGS Prof. Paper 1250, 1981):
//  stage 0  cone with a cryptodome (magma) intruded into the north flank; the flank bulges outward
//  stage 1  8:32 a.m. — an M5.1 earthquake; the bulge and summit fail and slide north (debris avalanche)
//  stage 2  the slide removes the rock that confined the cryptodome — the pressurized magma/gas decompresses: lateral blast to the north
//  stage 3  minutes later the eruption turns vertical: a Plinian column from the new crater, for hours
// Geometry, speeds and sizes are schematic.
import React from 'react';
import { AbsoluteFill, interpolate, Easing } from 'remotion';
import { SANS, INK, ACC, RED, BG } from './kit';
const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const k = (t: number, a: number, d: number) => interpolate(t, [a, a + d], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
const lin = (t: number, a: number, d: number) => interpolate(t, [a, a + d], [0, 1], clamp);
const G = 880; // ground line
// north is to the RIGHT
const cone = (bulge: number) => `M120,${G} L520,${G - 250} L760,${G - 520} L860,${G - 610} L960,${G - 600} ` +
  `C${1020 + 60 * bulge},${G - 520 - 10 * bulge} ${1110 + 90 * bulge},${G - 430} ${1200 + 40 * bulge},${G - 330} L1420,${G - 140} L1760,${G} Z`;
const after = `M120,${G} L520,${G - 250} L760,${G - 470} L820,${G - 500} L860,${G - 440} C900,${G - 330} 960,${G - 300} 1010,${G - 300} L1180,${G - 250} L1420,${G - 130} L1760,${G} Z`;
// the failing north part (bulge + summit) above a slip surface
const slide = (bulge: number) => `M840,${G - 600} L960,${G - 600} C${1020 + 60 * bulge},${G - 520 - 10 * bulge} ${1110 + 90 * bulge},${G - 430} ${1200 + 40 * bulge},${G - 330} L1250,${G - 280} ` +
  `C1150,${G - 280} 1010,${G - 300} 900,${G - 420} Z`;
export const Recon: React.FC<{ t: number; s: number[] }> = ({ t, s }) => {
  // s = [start of stage1, stage2, stage3] (local seconds)
  const b = k(t, 0, 2.5);                       // bulge grows during stage 0
  const q1 = k(t, s[0] + 0.4, 2.6);             // slide motion
  const q2 = k(t, s[1], 2.4);                   // blast expansion
  const q3 = k(t, s[2], 3.0);                   // vertical column
  const shake = t > s[0] && t < s[0] + 0.5 ? Math.sin(t * 80) * 4 : 0;
  const stage = t < s[0] ? 0 : t < s[1] ? 1 : t < s[2] ? 2 : 3;
  const caps = [
    ['BEFORE MAY 18', 'Magma pushed into the north flank (a “cryptodome”). The flank bulged outward.'],
    ['8:32 A.M. · M5.1 EARTHQUAKE', 'The bulge and the summit break away and slide north: the largest landslide in recorded history.'],
    ['SECONDS LATER', 'With the rock that confined it gone, the pressurized magma and gas expand at once — sideways, to the north.'],
    ['MINUTES LATER', 'The eruption turns upward: an ash column rises from the new crater and lasts for hours.'],
  ];
  const slideX = 520 * q1, slideY = 230 * q1, rot = 14 * q1;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="rock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8E8C86" /><stop offset="1" stopColor="#4A4945" /></linearGradient>
          <radialGradient id="mag" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stopColor="#FFB347" /><stop offset="1" stopColor="#C2461C" /></radialGradient>
          <radialGradient id="blast" cx="0.3" cy="0.5" r="0.7"><stop offset="0" stopColor="#9A8E80" stopOpacity="0.95" /><stop offset="1" stopColor="#5A534C" stopOpacity="0.85" /></radialGradient>
        </defs>
        <g transform={`translate(${shake},0)`}>
          {/* ground */}
          <rect x={0} y={G} width={1920} height={200} fill="#2B2A27" />
          {/* body of the cone */}
          <path d={q1 < 0.02 ? cone(b) : after} fill="url(#rock)" />
          {q1 < 0.02 && <path d={`M760,${G - 520} L860,${G - 610} L960,${G - 600} L1010,${G - 545} L740,${G - 505} Z`} fill="#D9D7D0" opacity={0.85} />}
          {/* original outline (dashed) for comparison */}
          {b > 0.05 && <path d={cone(0)} fill="none" stroke={INK} strokeWidth={2} strokeDasharray="10 8" opacity={0.5 * (1 - q1)} />}
          {/* conduit + cryptodome */}
          <path d={`M880,${G + 120} C890,${G - 80} 930,${G - 220} 990,${G - 330}`} stroke="url(#mag)" strokeWidth={46} fill="none" opacity={0.9} />
          <ellipse cx={1040 + 30 * b} cy={G - 370} rx={95 + 25 * b} ry={70 + 10 * b} fill="url(#mag)" opacity={0.95 * (1 - q2 * 0.6)} />
          {/* sliding mass */}
          {t > s[0] && <g transform={`translate(${slideX},${slideY}) rotate(${rot},1050,${G - 420})`} opacity={1 - lin(t, s[0] + 2.2, 1.2)}>
            <path d={slide(1)} fill="#7A7872" stroke="#2B2A27" strokeWidth={3} />
            <path d={`M900,${G - 500} L1150,${G - 380}`} stroke="#2B2A27" strokeWidth={3} />
          </g>}
          {/* debris avalanche spread on the valley floor */}
          {t > s[0] + 1.4 && <path d={`M1250,${G} Q1500,${G - 60 * lin(t, s[0] + 1.4, 1.6)} ${1300 + 560 * lin(t, s[0] + 1.4, 2)},${G} Z`} fill="#6D6A63" />}
          {/* lateral blast */}
          {q2 > 0 && [0, 1, 2, 3].map((i) => {
            const r = 60 + 520 * q2 * (1 - i * 0.12); const cx = 1060 + 560 * q2 * (1 - i * 0.1);
            return <ellipse key={i} cx={cx} cy={G - 240 + i * 30} rx={r} ry={r * 0.45} fill="url(#blast)" opacity={0.75 - i * 0.12} />;
          })}
          {q2 > 0.15 && <g opacity={k(t, s[1] + 0.4, 0.5)}><line x1={1150} y1={G - 470} x2={1640} y2={G - 470} stroke={RED} strokeWidth={8} /><path d={`M1640,${G - 490} L1690,${G - 470} L1640,${G - 450} Z`} fill={RED} /></g>}
          {/* vertical column */}
          {q3 > 0 && <g>
            <path d={`M930,${G - 470} C${900 - 60 * q3},${G - 470 - 400 * q3} ${860 - 120 * q3},${G - 470 - 560 * q3} 880,${G - 470 - 640 * q3} L1000,${G - 470 - 640 * q3} C${1060 + 120 * q3},${G - 470 - 560 * q3} ${1020 + 60 * q3},${G - 470 - 400 * q3} 1000,${G - 470} Z`} fill="#7D776F" opacity={0.92} />
            {q3 > 0.5 && <ellipse cx={940} cy={G - 470 - 640 * q3} rx={260 * q3} ry={70 * q3} fill="#7D776F" opacity={0.85} />}
          </g>}
          {/* labels */}
          {stage === 0 && <g opacity={k(t, 0.6, 0.5)}><line x1={1110} y1={G - 370} x2={1330} y2={G - 560} stroke={ACC} strokeWidth={3} /><text x={1340} y={G - 570} fill={ACC} fontFamily={SANS} fontWeight={700} fontSize={32}>CRYPTODOME</text>
            <text x={1140} y={G - 640} fill={INK} fontFamily={SANS} fontWeight={600} fontSize={28} opacity={0.8}>BULGE (dashed: original slope)</text></g>}
          {stage >= 2 && <text x={1700} y={G - 470 + 12} fill={RED} fontFamily={SANS} fontWeight={800} fontSize={34}>BLAST</text>}
          {stage === 1 && <text x={1500} y={G - 40} fill={INK} fontFamily={SANS} fontWeight={700} fontSize={30} opacity={k(t, s[0] + 1.6, 0.5)}>DEBRIS AVALANCHE</text>}
          <text x={1820} y={G + 60} fill={INK} fontFamily={SANS} fontWeight={700} fontSize={28} textAnchor="end" opacity={0.7}>NORTH →</text>
          <text x={100} y={G + 60} fill={INK} fontFamily={SANS} fontWeight={700} fontSize={28} opacity={0.7}>← SOUTH</text>
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 90, top: 70, width: 1100 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: ACC, letterSpacing: 2 }}>{caps[stage][0]}</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 34, color: INK, marginTop: 10, lineHeight: 1.3 }}>{caps[stage][1]}</div>
      </div>
      <div style={{ position: 'absolute', right: 70, top: 76, fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: 'rgba(242,239,233,0.8)' }}>RECONSTRUCTION · SIMPLIFIED, NOT TO SCALE</div>
    </AbsoluteFill>
  );
};
