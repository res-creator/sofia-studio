import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C, FONT, appear, prog, Vignette, Grain, ws, fmt } from '../lib';
import { toOld } from '../lib';

type S = { t: number; start: number; dur: number };
const Dark: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #FFFFFF 0%, ${C.card} 60%, #EDE7DB 100%)` }}>{children}<Vignette o={0.5} /><Grain o={0.06} /></AbsoluteFill>
);

// Shot 8: 12:30 p.m.
export const TimeCard: React.FC<S> = ({ t, start: start0 }) => {
  const start = toOld(start0); const a = toOld(t + start0);
  const o = appear(t, 0.05, 0.5);
  const sweep = prog(a, ws(69), ws(70) + 0.8);
  return (
    <Dark>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: C.text }}>
        <div style={{ fontSize: 26, letterSpacing: 8, fontWeight: 600, color: C.dim, opacity: o, marginBottom: 8 }}>JANUARY 15, 1919</div>
        <div style={{ fontSize: 230, fontWeight: 800, letterSpacing: -6, lineHeight: 1, opacity: o, transform: `scale(${1 + 0.03 * (t / 2.2)})`, fontVariantNumeric: 'tabular-nums' }}>
          12:30 <span style={{ fontSize: 110, letterSpacing: -2, color: C.amberHi }}>p.m.</span>
        </div>
        <div style={{ width: 640, height: 3, background: C.line, marginTop: 40 }}>
          <div style={{ width: `${sweep * 100}%`, height: 3, background: C.amber }} />
        </div>
      </AbsoluteFill>
    </Dark>
  );
};

// Shot 16: casualties
export const Casualties: React.FC<S> = ({ t, start: start0 }) => {
  const start = toOld(start0); const a = toOld(t + start0);
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
        <div style={{ width: 2, height: 360, background: C.line, opacity: appear(a, ws(121) - 0.3) }} />
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
export const BlameCard: React.FC<S> = ({ t, start: start0 }) => {
  const start = toOld(start0); const a = toOld(t + start0);
  const words = ['The', 'company', 'blamed', 'anarchists.'];
  const at = [ws(136) - 0.15, ws(136) + 0.05, ws(138) - 0.1, ws(139) - 0.1];
  return (
    <Dark>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: C.text }}>
        <div style={{ padding: '56px 80px', borderTop: `3px solid ${C.text}`, borderBottom: `1px solid ${C.line}`, transform: `scale(${1 + 0.025 * (t / 3)})` }}>
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

// Shot 19: chapter / title card — light background, the 1919 panorama as a framed B&W print
export const TitleCard: React.FC<S> = ({ t, start: start0, dur }) => {
  const start = toOld(start0); const a = toOld(t + start0);
  const p = t / dur;
  const pO = appear(t, 0.0, 0.8);
  const tO = appear(a, ws(146) - 0.2, 0.8);
  const sO = appear(a, ws(150), 0.8);
  const out = 1 - prog(t, dur - 1.2, dur - 0.1);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #FFFFFF 0%, ${C.card} 60%, #EDE7DB 100%)` }}>
      <AbsoluteFill style={{ opacity: out, alignItems: 'center', fontFamily: FONT, color: C.text, textAlign: 'center' }}>
        <div style={{ marginTop: 96, width: 1280, height: 470, overflow: 'hidden', border: '10px solid #FFFFFF', boxShadow: '0 14px 40px rgba(28,27,25,0.2)', opacity: pO }}>
          <Img src={staticFile('img/panorama.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.08 + 0.07 * p}) translateY(${-2 + 3 * p}%)`, filter: 'grayscale(1) contrast(1.05)' }} />
        </div>
        <div style={{ width: 90 + 260 * tO, height: 4, background: C.amber, marginTop: 56, marginBottom: 34, opacity: tO }} />
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: 7, opacity: tO, transform: `translateY(${(1 - tO) * 12}px)` }}>THE GREAT MOLASSES FLOOD</div>
        <div style={{ fontSize: 44, fontWeight: 400, letterSpacing: 0.5, color: C.dim, marginTop: 22, opacity: sO }}>The warnings nobody wanted to hear</div>
      </AbsoluteFill>
      <Grain o={0.05} />
    </AbsoluteFill>
  );
};
