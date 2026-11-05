// BOP visual test (45–60 s): orientation → real object → schematic → how it should work → what happened → deadman → CSB failure mechanism → whole system.
import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate } from 'remotion';
import T from './data/boptest.json';
import { FPS, BG, INK, pe } from './kit';
import { SystemView, PhotoView, StackView, BsrClose, Headline, Badge, Footer, ease, PHOTO_BOX } from './bopscene';
const LN = T.lines as Record<string, { s: number; e: number; words: { w: string; s: number }[] }>;
const W = (id: string, w: string, nth = 0) => { const h = LN[id].words.filter((x) => x.w.toLowerCase().replace(/[^a-z0-9'-]/g, '').startsWith(w.toLowerCase())); if (!h[nth]) throw new Error(`cue ${id}/${w}`); return h[nth].s; };
const E = T.events as Record<string, { at: number; dur: number }>;
export const BOPTEST_DUR = T.duration as number;
const BLUE = '#7FC4E0', RED = '#E0533A';
// cue times
const c = {
  zoomIn: 1.4, photo: 2.6, outline: 3.3, morph: 4.3, sect: 5.0,
  blind: W('b39t', 'blind'), blades: W('b39t', 'blades'), cut: W('b39t', 'cut'), seal: W('b39t', 'seal'), freed: W('b39t', 'freed'),
  lights: W('b39t', 'lights'), notdisc: W('b39t', 'not'),
  b40: LN.b40.s, deadman: W('b40', 'deadman'), power: W('b40', 'power'), comm: W('b40', 'communication'), hyd: W('b40', 'hydraulic'), after: W('b40', 'After'), were: W('b40', 'were'),
  b41: LN.b41.s, csb: W('b41', 'Chemical'), fire: W('b41', 'fire'), drill: W('b41', 'drill'), buckled: W('b41', 'buckled'), bladesR: W('b41', 'blades'), seal2: W('b41', 'seal'),
  tail: E.tail.at,
};
const Tabs: React.FC<{ t: number; at: number; active: number }> = ({ t, at, active }) => (
  <div style={{ position: 'absolute', left: 80, bottom: 90, display: 'flex', gap: 14, opacity: ease(t, at, 0.4) }}>
    {['CHEMICAL SAFETY BOARD', 'JOINT INVESTIGATION / DNV'].map((n, i) => (
      <div key={n} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 24, letterSpacing: 2, padding: '10px 18px', borderRadius: 6, border: `3px solid ${i === active ? '#E8A33D' : 'rgba(242,239,233,0.3)'}`, color: i === active ? '#E8A33D' : 'rgba(242,239,233,0.45)', background: 'rgba(8,9,10,0.75)' }}>{n}</div>
    ))}
  </div>
);
const Scene: React.FC<{ t: number }> = ({ t }) => {
  // ---- 0–5 s: whole system → zoom into the BOP → the real object → outline → the schematic in the same place
  if (t < c.sect + 0.6) {
    const z = ease(t, c.zoomIn, 1.4);
    const ph = ease(t, c.photo, 0.6); const mo = ease(t, c.morph, 0.9);
    const B = PHOTO_BOX; const from = { x: B.x + B.w / 2, y: B.y + B.h / 2 + 20, k: B.h / 800 }; const to = { x: 1240, y: 560, k: 1.08 };
    const place = { x: interpolate(mo, [0, 1], [from.x, to.x]), y: interpolate(mo, [0, 1], [from.y, to.y]), k: interpolate(mo, [0, 1], [from.k, to.k]) };
    return (<AbsoluteFill>
      <SystemView t={t} zoom={z} caption={<Headline t={t} at={0.2} out={c.zoomIn + 0.4} bottom big="5,000 FEET DOWN" small="The blowout preventer sat on the seafloor, on top of the well." />} />
      <AbsoluteFill style={{ opacity: ph * (1 - 0.75 * mo) }}><PhotoView t={t} outlineAt={c.outline} /></AbsoluteFill>
      <AbsoluteFill style={{ opacity: ease(t, c.morph, 0.5) }}><AbsoluteFill style={{ background: `rgba(11,12,13,${0.85 * mo})` }} />
        <StackView t={t} place={place} s={{ mode: 'should', hl: 0, labels: mo }} /></AbsoluteFill>
    </AbsoluteFill>);
  }
  // ---- b39t: how it was meant to work (cyan) — the blades, then the disconnect
  if (t < c.blades - 0.1) return (<AbsoluteFill style={{ background: BG }}>
    <StackView t={t} s={{ mode: 'should', hl: ease(t, c.blind - 0.2, 0.5), flow: 0 }} />
    <Badge t={t} at={c.sect} text="HOW IT WAS MEANT TO WORK" color={BLUE} />
    <Headline t={t} at={c.blind - 0.2} big="EMERGENCY DISCONNECT" small="Close the blind shear ram, then release the rig." color={BLUE} />
    <Footer /></AbsoluteFill>);
  if (t < c.freed - 0.2) return (<AbsoluteFill>
    <BsrClose t={t} mode="should" close={ease(t, c.cut - 0.2, 1.6)} buckle={0} flow={1} />
    <Badge t={t} at={c.blades - 0.1} text="HOW IT WAS MEANT TO WORK" color={BLUE} />
    <Headline t={t} at={c.blades} big="CUT THE PIPE, SEAL THE WELL" color={BLUE} /></AbsoluteFill>);
  if (t < c.lights - 0.1) return (<AbsoluteFill style={{ background: BG }}>
    <StackView t={t} s={{ mode: 'should', hl: 1, lift: ease(t, c.freed, 1.4), flow: 0 }} />
    <Badge t={t} at={c.freed - 0.2} text="HOW IT WAS MEANT TO WORK" color={BLUE} />
    <Headline t={t} at={c.freed} big="RELEASE THE RIG" small="The upper package and riser unlatch and lift away." color={BLUE} />
    <Footer /></AbsoluteFill>);
  // ---- what happened: the button was pressed, nothing disconnected; the well kept flowing
  if (t < c.b40 + 0.6) return (<AbsoluteFill style={{ background: BG }}>
    <StackView t={t} s={{ mode: 'real', hl: 0.4, flow: ease(t, c.lights, 0.8) }} />
    <Badge t={t} at={c.lights} text="WHAT HAPPENED" color={RED} />
    <Headline t={t} at={c.lights} big="ABOUT 9:52–9:56 P.M." small="The button was pressed. Panel lights changed." color={INK} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', opacity: ease(t, c.notdisc, 0.4) }}>
      <span style={{ fontFamily: "'Bebas', Inter, sans-serif", fontSize: 110, color: RED, background: 'rgba(8,9,10,0.8)', padding: '4px 30px', letterSpacing: 3 }}>NO DISCONNECT</span>
    </div>
    <Footer /></AbsoluteFill>);
  // ---- b40: the deadman — pods, three supply lines, lines cut, the backup should now act
  if (t < c.drill - 0.2) {
    const csb = t >= c.csb - 0.2;
    return (<AbsoluteFill style={{ background: BG }}>
      <StackView t={t} s={{ mode: 'real', hl: csb ? 1 : ease(t, c.were, 0.6), flow: 1, pods: ease(t, c.deadman - 0.3, 0.6),
        lines: [ease(t, c.power - 0.1, 0.4), ease(t, c.comm - 0.1, 0.4), ease(t, c.hyd - 0.1, 0.4)], cut: ease(t, c.after, 0.5), signal: csb ? ease(t, c.fire, 1.0) : 0 }} />
      {!csb && <>
        <Headline t={t} at={c.deadman - 0.3} out={c.after - 0.3} big="THE DEADMAN" small="An automatic backup in two control pods" />
        <Headline t={t} at={c.after} big="AFTER THE EXPLOSIONS" small="Power, communication and hydraulics from the rig: lost" color={RED} />
        <div style={{ position: 'absolute', left: 1700, top: 300, opacity: ease(t, c.power - 0.1, 0.4) * (1 - ease(t, c.after, 0.4)) }}>
          {['POWER', 'COMMUNICATION', 'HYDRAULICS'].map((n, i) => <div key={n} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 24, color: ['#D8A13A', BLUE, INK][i], opacity: ease(t, [c.power, c.comm, c.hyd][i] - 0.1, 0.4), marginBottom: 6 }}>{n}</div>)}
        </div>
      </>}
      {csb && <>
        <Tabs t={t} at={c.b41} active={t >= c.csb - 0.2 ? 0 : -1} />
        <Headline t={t} at={c.csb - 0.2} big="THE DEADMAN MOST LIKELY FIRED" small="Chemical Safety Board, 2014–2016" />
      </>}
      {t >= c.b41 && !csb && <Tabs t={t} at={c.b41} active={-1} />}
      <Footer /></AbsoluteFill>);
  }
  // ---- b41: the failure mechanism (CSB): buckled pipe, blades catch it at the edge, a gap stays open
  if (t < c.tail) return (<AbsoluteFill>
    <BsrClose t={t} mode="real" close={ease(t, c.bladesR - 0.1, 1.4)} buckle={ease(t, c.buckled - 0.2, 1.4)} flow={1} gapLabel={ease(t, c.seal2 - 0.3, 0.5)} />
    <Tabs t={t} at={c.drill - 0.2} active={0} />
    <Headline t={t} at={c.drill - 0.2} big="WHAT STOPPED THE BLADES" small="The drill pipe had buckled and been pushed off center." />
  </AbsoluteFill>);
  // ---- tail: back to the whole system — the well was not sealed
  const z = 1 - ease(t, c.tail, 2.2);
  return (<AbsoluteFill>
    <SystemView t={t} zoom={z} flow={1} caption={<Headline t={t} at={c.tail + 1.4} bottom big="THE WELL WAS NOT SEALED" small="Oil and gas flowed into the Gulf for 87 days." color={RED} />} />
  </AbsoluteFill>);
};
export const BopTest: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (<AbsoluteFill style={{ background: BG }}>
    <Scene t={t} />
    <AbsoluteFill style={{ background: BG, opacity: 1 - pe(t, 0, 0.4) }} />
    <Audio src={staticFile('audio/boptest_mix.wav')} />
  </AbsoluteFill>);
};
