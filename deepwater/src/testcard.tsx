// The negative test in the opening: only the contradiction and the decision (owner, Nov 3). Details are in the main film.
// Readings: National Commission p. 108; CSB Vol. 3 p. 54. Time of the decision: ~7:45 (JIT) / 8:00 p.m. (Commission).
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SANS, DISPLAY, INK, ACC, BG, pe } from './kit';
const RED = '#E0533A', OK = '#7FC4E0';
const Panel: React.FC<{ x: number; title: string; value: string; vcolor: string; t: number; at: number }> = ({ x, title, value, vcolor, t, at }) => (
  <div style={{ position: 'absolute', left: x, top: 230, width: 720, height: 400, border: `4px solid ${t >= at ? vcolor : 'rgba(242,239,233,0.3)'}`, borderRadius: 18, background: '#101316', opacity: pe(t, 0.1, 0.4) }}>
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: INK, letterSpacing: 3, marginTop: 40, textAlign: 'center' }}>{title}</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: DISPLAY, fontSize: 176, color: vcolor, opacity: pe(t, at, 0.35), lineHeight: 1 }}>{value}</div>
  </div>
);
export const TestCard: React.FC<{ t: number; killAt: number; pipeAt: number; declAt: number }> = ({ t, killAt, pipeAt, declAt }) => (
  <AbsoluteFill style={{ background: BG }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 50, color: ACC, letterSpacing: 4, opacity: pe(t, 0.1, 0.4) }}>IS THE WELL SEALED? · TEST, EVENING OF APRIL 20</div>
    <Panel x={180} title="ONE LINE" value="NO FLOW" vcolor={OK} t={t} at={killAt} />
    <Panel x={1020} title="DRILL PIPE" value="1,400 psi" vcolor={RED} t={t} at={pipeAt} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: pe(t, declAt, 0.35) }}>
      <span style={{ display: 'inline-block', fontFamily: DISPLAY, fontSize: 104, color: BG, background: ACC, padding: '6px 40px', letterSpacing: 4, transform: `rotate(-2deg) scale(${1.15 - 0.15 * pe(t, declAt, 0.3)})` }}>≈ 8 P.M. · DECLARED A SUCCESS</span>
    </div>
    <div style={{ position: 'absolute', left: 70, bottom: 40, fontFamily: SANS, fontSize: 22, color: 'rgba(242,239,233,0.7)' }}>Readings: National Commission report (2011), p. 108 · time approximate (7:45–8:00 p.m.)</div>
  </AbsoluteFill>
);
