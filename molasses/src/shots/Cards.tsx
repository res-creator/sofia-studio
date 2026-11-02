import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C, FONT, appear, prog, Vignette, Grain, ws, fmt } from '../lib';

type S = { t: number; start: number; dur: number };
const Dark: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #17171A 0%, ${C.card} 55%, #070708 100%)` }}>{children}<Vignette o={0.5} /><Grain o={0.06} /></AbsoluteFill>
);

// Shot 8: 12:30 p.m.
export const TimeCard: React.FC<S> = ({ t, start }) => {
  const a = t + start;
  const o = appear(t, 0.05, 0.5);
  const sweep = prog(a, ws(69), ws(70) + 0.8);
  return (
    <Dark>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: C.text }}>
        <div style={{ fontSize: 26, letterSpacing: 8, fontWeight: 600, color: C.dim, opacity: o, marginBottom: 8 }}>JANUARY 15, 1919</div>
        <div style={{ fontSize: 230, fontWeight: 800, letterSpacing: -6, lineHeight: 1, opacity: o, transform: `scale(${1 + 0.03 * (t / 2.2)})`, fontVariantNumeric: 'tabular-nums' }}>
          12:30 <span style={{ fontSize: 110, letterSpacing: -2, color: C.amberHi }}>p.m.</span>
        </div>
        <div style={{ width: 640, height: 3, background: 'rgba(244,241,234,0.15)', marginTop: 40 }}>
          <div style={{ width: `${sweep * 100}%`, height: 3, background: C.amber }} />
        </div>
      </AbsoluteFill>
    </Dark>
  );
};

// Shot 16: casualties
export const Casualties: React.FC<S> = ({ t, start }) => {
  const a = t + start;
  const d = prog(a, ws(117) - 0.1, ws(117) + 0.9);
  const i = prog(a, ws(121) - 0.05, ws(125) + 0.3);
  const Col: React.FC<{ n: string; label: string; o: number }> = ({ n, label, o }) => (
    <div style={{ width: 620, textAlign: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
      <div style={{ fontSize: 240, fontWeight: 800, letterSpacing: -8, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{n}</div>
      <div style={{ width: 120, height: 4, background: C.amber, margin: '26px auto 22px' }} />
      <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: 10, textTransform: 'uppercase', color: C.dim }}>{label}</div>
    </div>
  );
  return (
    <Dark>
      <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 80, fontFamily: FONT, color: C.text }}>
        <Col n={fmt(21 * d)} label="dead" o={appear(a, ws(117) - 0.15, 0.4)} />
        <div style={{ width: 2, height: 360, background: 'rgba(244,241,234,0.14)', opacity: appear(a, ws(121) - 0.3) }} />
        <Col n={'~' + fmt(150 * i)} label="injured" o={appear(a, ws(121) - 0.1, 0.4)} />
      </AbsoluteFill>
    </Dark>
  );
};

// Shot 17: who owned the tank
export const OwnerCard: React.FC<S> = ({ t }) => (
  <Dark>
    <AbsoluteFill style={{ justifyContent: 'center', paddingLeft: 200, fontFamily: FONT, color: C.text }}>
      <div style={{ fontSize: 24, letterSpacing: 6, fontWeight: 600, color: C.amberHi, opacity: appear(t, 0.05) }}>THE TANK’S OWNER</div>
      <div style={{ fontSize: 92, fontWeight: 800, letterSpacing: -2, marginTop: 18, opacity: appear(t, 0.2), transform: `translateX(${(1 - appear(t, 0.2, 0.6)) * -16}px)` }}>Purity Distilling Company</div>
      <div style={{ fontSize: 40, fontWeight: 400, color: C.dim, marginTop: 22, opacity: appear(t, 0.8) }}>
        owned since 1917 by <span style={{ color: C.text, fontWeight: 600 }}>United States Industrial Alcohol</span> (USIA)
      </div>
    </AbsoluteFill>
  </Dark>
);

// Shot 18: headline card
export const BlameCard: React.FC<S> = ({ t, start }) => {
  const a = t + start;
  const words = ['The', 'company', 'blamed', 'anarchists.'];
  const at = [ws(136) - 0.15, ws(136) + 0.05, ws(138) - 0.1, ws(139) - 0.1];
  return (
    <Dark>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: C.text }}>
        <div style={{ padding: '56px 80px', borderTop: `3px solid ${C.text}`, borderBottom: `1px solid rgba(244,241,234,0.4)`, transform: `scale(${1 + 0.025 * (t / 3)})` }}>
          <div style={{ fontSize: 22, letterSpacing: 6, fontWeight: 600, color: C.amberHi, marginBottom: 22, opacity: appear(t, 0.05) }}>USIA’S EXPLANATION</div>
          <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: -2.5, lineHeight: 1.05 }}>
            {words.map((w, i) => (
              <span key={i} style={{ opacity: appear(a, at[i], 0.35), color: i === 3 ? C.amberHi : C.text }}>{w}{i < 3 ? ' ' : ''}</span>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </Dark>
  );
};

// Shot 19: chapter / title card over the darkened panorama
export const TitleCard: React.FC<S> = ({ t, start, dur }) => {
  const a = t + start;
  const p = t / dur;
  const tO = appear(a, ws(146) - 0.2, 0.8);
  const sO = appear(a, ws(150), 0.8);
  const out = 1 - prog(t, dur - 1.4, dur - 0.1);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <AbsoluteFill style={{ opacity: out }}>
        <Img src={staticFile('img/panorama.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.12 + 0.06 * p}) translateY(${-1 + 2 * p}%)`, filter: 'grayscale(1) sepia(0.3) brightness(0.32) blur(1.5px)' }} />
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2), rgba(0,0,0,0.85) 90%)' }} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: C.text, textAlign: 'center' }}>
          <div style={{ width: 90 + 260 * tO, height: 3, background: C.amber, marginBottom: 44, opacity: tO }} />
          <div style={{ fontSize: 100, fontWeight: 800, letterSpacing: 8, opacity: tO, transform: `translateY(${(1 - tO) * 12}px)` }}>THE GREAT MOLASSES FLOOD</div>
          <div style={{ fontSize: 46, fontWeight: 400, letterSpacing: 1, color: C.dim, marginTop: 30, opacity: sO }}>The warnings nobody wanted to hear</div>
        </AbsoluteFill>
        <Grain o={0.06} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
