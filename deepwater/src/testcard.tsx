// The negative test, as one readable card: what a sealed well should show, what the two lines showed, and the decision.
// Readings: National Commission p. 108; CSB Vol. 3 p. 54. Time of the decision: ~7:45 (JIT) / 8:00 p.m. (Commission).
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SANS, DISPLAY, INK, ACC, BG, pe } from './kit';
const RED = '#E0533A', OK = '#7FC4E0';
const Panel: React.FC<{ x: number; title: string; sub: string; value: string; vcolor: string; t: number; at: number; expectAt: number }> = ({ x, title, sub, value, vcolor, t, at, expectAt }) => (
  <div style={{ position: 'absolute', left: x, top: 250, width: 700, height: 420, border: `3px solid ${t >= at ? vcolor : 'rgba(242,239,233,0.35)'}`, borderRadius: 18, background: '#101316', opacity: pe(t, 0.2, 0.5) }}>
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, color: INK, letterSpacing: 3, marginTop: 34, textAlign: 'center' }}>{title}</div>
    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, color: 'rgba(242,239,233,0.75)', textAlign: 'center', marginTop: 6 }}>{sub}</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 40, color: 'rgba(242,239,233,0.75)', opacity: pe(t, expectAt, 0.4) * (1 - pe(t, at, 0.3)) }}>EXPECTED:<br /><span style={{ fontWeight: 800, fontSize: 64, color: INK }}>0 psi · no flow</span></div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: DISPLAY, fontSize: 150, color: vcolor, opacity: pe(t, at, 0.4), lineHeight: 1 }}>{value}</div>
  </div>
);
export const TestCard: React.FC<{ t: number; expectAt: number; killAt: number; pipeAt: number; talkAt: number; declAt: number }> = ({ t, expectAt, killAt, pipeAt, talkAt, declAt }) => (
  <AbsoluteFill style={{ background: BG }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 46, color: ACC, letterSpacing: 4, opacity: pe(t, 0.1, 0.5) }}>THE NEGATIVE PRESSURE TEST · EVENING OF APRIL 20</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 32, color: INK, opacity: pe(t, expectAt, 0.5) }}>Two lines open to the same well. A sealed well shows no pressure and no flow.</div>
    <Panel x={200} title="KILL LINE" sub="watched for 30 minutes" value="NO FLOW" vcolor={OK} t={t} at={killAt} expectAt={expectAt} />
    <Panel x={1020} title="DRILL PIPE" sub="pressure held" value="1,400 psi" vcolor={RED} t={t} at={pipeAt} expectAt={expectAt} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 720, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 36, color: INK, opacity: pe(t, talkAt, 0.5) * (1 - pe(t, declAt, 0.3)) }}>About an hour and a half of discussion</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 705, textAlign: 'center', opacity: pe(t, declAt, 0.4) }}>
      <span style={{ display: 'inline-block', fontFamily: DISPLAY, fontSize: 92, color: BG, background: ACC, padding: '6px 34px', letterSpacing: 4, transform: `rotate(-2deg) scale(${1.15 - 0.15 * pe(t, declAt, 0.3)})` }}>≈ 8 P.M. · DECLARED A SUCCESS</span>
    </div>
    <div style={{ position: 'absolute', left: 70, bottom: 40, fontFamily: SANS, fontSize: 22, color: 'rgba(242,239,233,0.7)' }}>Readings: National Commission report (2011), p. 108; U.S. Chemical Safety Board, Vol. 3 · time approximate (7:45–8:00 p.m.)</div>
  </AbsoluteFill>
);
