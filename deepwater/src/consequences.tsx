// What followed — short visual beats instead of one text card.
// BP plea: 14 counts incl. 11 seaman's manslaughter, $4 billion (DOJ, plea accepted Jan 29, 2013). Phase One ruling (Sept 4, 2014):
// BP grossly negligent; fault BP 67 %, Transocean 30 %, Halliburton 3 % (MDL 2179, PH1 ¶¶545, 613). Transocean: guilty plea, one CWA misdemeanor (Jan 3, 2013).
// MMS → BOEMRE (June 2010) → ONRR (Oct 1, 2010), BOEM and BSEE (Oct 2011). Well Control Rule, 81 FR 25888 (Apr 29, 2016).
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SANS, DISPLAY, INK, ACC, BG } from './kit';
import { ease } from './bopscene';
const RED = '#E0533A';
const Src: React.FC<{ s: string }> = ({ s }) => <div style={{ position: 'absolute', left: 80, bottom: 40, fontFamily: SANS, fontSize: 22, color: 'rgba(242,239,233,0.6)' }}>{s}</div>;
export const BeatPlea: React.FC<{ t: number; mansl: number; money: number }> = ({ t, mansl, money }) => (
  <AbsoluteFill style={{ background: BG }}>
    <div style={{ position: 'absolute', left: 140, top: 150, opacity: ease(t, 0.2, 0.5) }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: ACC, letterSpacing: 3 }}>BP · GUILTY PLEA · 2013</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 30, marginTop: 20 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 300, color: INK, lineHeight: 0.9 }}>14</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 52, color: INK }}>criminal counts</div>
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 50, color: RED, marginTop: 24, opacity: ease(t, mansl, 0.5) }}>11 of them: seaman’s manslaughter</div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 50, color: INK, marginTop: 18, opacity: ease(t, money, 0.5) }}>$4 billion in that case</div>
    </div>
    <Src s="U.S. Department of Justice; U.S. EPA — U.S. v. BP Exploration & Production (plea accepted Jan. 29, 2013)" />
  </AbsoluteFill>
);
export const BeatCourt: React.FC<{ t: number; tro: number }> = ({ t, tro }) => {
  const bars: [string, number][] = [['BP', 67], ['TRANSOCEAN', 30], ['HALLIBURTON', 3]];
  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ position: 'absolute', left: 140, top: 130, opacity: ease(t, 0.2, 0.5) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: ACC, letterSpacing: 3 }}>FEDERAL COURT · 2014</div>
        <div style={{ fontFamily: DISPLAY, fontSize: 150, color: INK, marginTop: 10 }}>BP: GROSSLY NEGLIGENT</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, color: 'rgba(242,239,233,0.8)', marginTop: 6 }}>Share of fault set by the court</div>
        {bars.map(([n, v], i) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', marginTop: 20, opacity: ease(t, 0.8 + i * 0.4, 0.5) }}>
            <div style={{ width: 330, fontFamily: SANS, fontWeight: 800, fontSize: 38, color: INK }}>{n}</div>
            <div style={{ height: 48, width: 14 * v * ease(t, 0.8 + i * 0.4, 1.0), background: i === 0 ? RED : '#9AA3A8', borderRadius: 4 }} />
            <div style={{ marginLeft: 18, fontFamily: SANS, fontWeight: 800, fontSize: 38, color: INK }}>{v}%</div>
          </div>
        ))}
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 36, color: INK, marginTop: 40, opacity: ease(t, tro, 0.5) }}>Transocean: guilty plea, Clean Water Act violation (2013)</div>
      </div>
      <Src s="U.S. District Court, E.D. La., MDL 2179, Phase One findings (Sept. 4, 2014); U.S. EPA (Transocean plea, Jan. 3, 2013)" />
    </AbsoluteFill>
  );
};
export const BeatRules: React.FC<{ t: number; split: number; rule: number }> = ({ t, split, rule }) => {
  const k = ease(t, split, 1.0);
  const parts: [string, string][] = [['BOEM', 'leasing'], ['BSEE', 'safety and environment'], ['ONRR', 'revenue']];
  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ position: 'absolute', left: 140, top: 120, fontFamily: SANS, fontWeight: 800, fontSize: 40, color: ACC, letterSpacing: 3, opacity: ease(t, 0.2, 0.5) }}>THE OFFSHORE REGULATOR</div>
      <div style={{ position: 'absolute', left: 140, top: 200, width: 520, height: 170, border: '4px solid #9AA3A8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: 1 - 0.6 * k }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 90, color: INK }}>MMS</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: 'rgba(242,239,233,0.8)' }}>Minerals Management Service</div>
      </div>
      {parts.map(([n, d], i) => (
        <div key={n} style={{ position: 'absolute', left: 780 + i * 360, top: 200, width: 330, height: 170, border: `4px solid ${ACC}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: k, transform: `translateX(${(1 - k) * -200}px)` }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 80, color: INK }}>{n}</div>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: 'rgba(242,239,233,0.85)' }}>{d}</div>
        </div>
      ))}
      <div style={{ position: 'absolute', left: 780, top: 390, fontFamily: SANS, fontWeight: 600, fontSize: 28, color: 'rgba(242,239,233,0.75)', opacity: k }}>Broken up in 2010–2011</div>
      <div style={{ position: 'absolute', left: 140, top: 560, opacity: ease(t, rule, 0.6) }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 130, color: INK }}>WELL CONTROL RULE · 2016</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 36, color: INK, marginTop: 4 }}>Blowout preventers · well design · real-time monitoring</div>
      </div>
      <Src s="CSB Vol. 4 and Vol. 1 (agency history); Federal Register 81 FR 25888 (Apr. 29, 2016)" />
    </AbsoluteFill>
  );
};
