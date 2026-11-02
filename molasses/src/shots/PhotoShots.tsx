import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C, FONT, appear, prog, Tag, Caption, Arrow, Photo, KB, Vignette, Grain, ws } from '../lib';
import { toOld } from '../lib';

// map a point given in "cover-fitted, untransformed" screen px through the Ken Burns transform
const kbPt = (px: number, py: number, kb: KB, p: number) => {
  const s = kb.s0 + (kb.s1 - kb.s0) * p, x = kb.x0 + (kb.x1 - kb.x0) * p, y = kb.y0 + (kb.y1 - kb.y0) * p;
  return [960 + (px - 960) * s + (x * 1920) / 100, 540 + (py - 540) * s + (y * 1080) / 100];
};

type PS = { t: number; start: number; dur: number };
const PD = 'Public domain';

// Shot 6: the tank before 1919, "LEAKING SINCE 1915", graphic streaks
export const TankLeak: React.FC<PS> = ({ t, start: start0, dur }) => {
  const start = toOld(start0); const a = toOld(t + start0);
  const s = 1 + 0.035 * (t / dur);
  const L = 460, T = 70, Wd = 1000, Hd = 784;
  const tx0 = L + 0.55 * Wd, tx1 = L + 0.95 * Wd, ty = T + 0.305 * Hd;
  const leak = appear(a, ws(52) - 0.1, 0.5);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: 'absolute', left: L, top: T, width: Wd, height: Hd, transform: `scale(${s})`, transformOrigin: '70% 40%', boxShadow: '0 14px 40px rgba(28,27,25,0.22)', border: '10px solid #FFFFFF' }}>
        <Img src={staticFile('img/tank_before.jpg')} style={{ width: '100%', height: '100%', filter: 'grayscale(1) contrast(1.05)' }} />
        <svg width={Wd} height={Hd} style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 9 }).map((_, i) => {
            const x = tx0 - L + ((tx1 - tx0) * (i + 0.5)) / 9 + (i % 2) * 6;
            const g = prog(a, ws(52) + i * 0.12, ws(52) + 1.3 + i * 0.12);
            const len = 60 + ((i * 29) % 4) * 16;
            return <path key={i} d={`M${x},${ty - T + 6} q 3,${len * 0.5 * g} 0,${len * g}`} stroke="#9A5A14" strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.9} />;
          })}
        </svg>
      </div>
      <div style={{ position: 'absolute', left: 80, top: 330, fontFamily: FONT, color: C.text, opacity: leak, transform: `translateY(${(1 - leak) * 10}px)` }}>
        <div style={{ fontSize: 22, letterSpacing: 5, fontWeight: 600, color: C.amberHi }}>LEAKING</div>
        <div style={{ fontSize: 22, letterSpacing: 5, fontWeight: 600, color: C.amberHi }}>SINCE</div>
        <div style={{ fontSize: 118, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }}>1915</div>
      </div>
      <Caption t={t} at={0.3} text="The molasses tank on Commercial Street, before 1919 (exact date unknown)" source={`Photo: The Bostonian Society, via Wikimedia Commons · ${PD}`} maxW={980} />
      <Tag t={t} at={ws(52) - start}>Streaks: graphic overlay</Tag>
      <Vignette o={0.5} />
      <Grain o={0.05} />
    </AbsoluteFill>
  );
};

// generic archival photo shot with caption + optional arrow
export const ArchivePhoto: React.FC<PS & { src: string; kb: KB; text: string; source: string; arrow?: { px: number; py: number; dx: number; dy: number; at: number; label?: string }; capAt?: number }> = ({ t, dur, src, kb, text, source, arrow, capAt = 0.2 }) => {
  const p = Math.min(1, Math.max(0, t / dur));
  let ar = null;
  if (arrow) {
    const [x2, y2] = kbPt(arrow.px, arrow.py, kb, p);
    ar = <Arrow x1={x2 + arrow.dx} y1={y2 + arrow.dy} x2={x2} y2={y2} t={t} at={arrow.at} label={arrow.label} lx={x2 + arrow.dx + (arrow.dx > 0 ? 8 : 8)} ly={y2 + arrow.dy + (arrow.dy > 0 ? 34 : -14)} anchor={arrow.dx < 0 ? 'end' : 'start'} />;
  }
  return (
    <AbsoluteFill>
      <Photo src={src} t={t} dur={dur} kb={kb} />
      <Vignette o={0.7} />
      {ar}
      <Caption t={t} at={capAt} text={text} source={source} />
      <Grain o={0.06} />
    </AbsoluteFill>
  );
};

// Shot 10: Boston Post clipping (headline only)
export const PostClip: React.FC<PS> = ({ t, dur }) => {
  const s = 1.0 + 0.05 * (t / dur);
  return (
    <AbsoluteFill style={{ background: C.card }}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 1500, height: 408, overflow: 'hidden', transform: `scale(${s}) rotate(-0.8deg)`, boxShadow: '0 18px 50px rgba(28,27,25,0.22)', marginTop: -80 }}>
          <Img src={staticFile('img/boston_post.jpg')} style={{ width: 1500, display: 'block', filter: 'grayscale(1) contrast(1.08)' }} />
        </div>
      </AbsoluteFill>
      <Caption t={t} at={0.2} text="The Boston Post, January 16, 1919" source={`Via Wikimedia Commons · ${PD}`} />
      <Vignette o={0.6} />
      <Grain o={0.06} />
    </AbsoluteFill>
  );
};

export { PD };
