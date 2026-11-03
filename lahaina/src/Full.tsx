// Full episode: hook (the approved demo, visuals only) + 10 parts. Every cut is tied to a word of the narration.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, Img } from 'remotion';
import T from './data/full.json';
import FC from './data/fclips.json';
import { C, SANS, DISPLAY, FPS, pe, lin, SP, Still, Clip, Slam, Type, Stamp, Count, Credit, Tag, Burst, Grain, Quote, Lower, Part, Vignette } from './lib';
import { Sat, LAH, Marker } from './sat';
import { Demo, SirenIcon, Embers } from './Demo';

const WORDS = T.words as { w: string; s: number; e: number; line: string }[];
const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9:]/g, '');
const W = (line: string, w: string, nth = 0) => {
  const h = WORDS.filter((x) => x.line === line && norm(x.w).startsWith(norm(w)));
  if (!h[nth]) throw new Error(`cue ${line}/${w}`);
  return h[nth].s;
};
const L = (line: string) => (T.lines as any)[line].s as number;
const LE = (line: string) => (T.lines as any)[line].e as number;
const PART = Object.fromEntries((T.parts as any[]).map((p) => [p.id, p]));

// credits
const FEMAV = 'Video: FEMA · Public domain';
const DVIDS = 'Photo: U.S. Customs and Border Protection / Glenn Fawcett · Public domain';
const USCG = 'Photo: U.S. Coast Guard · Public domain';
const NASA = 'NASA Earth Observatory · Landsat 8 (USGS) · Aug. 8, 2023, 10:25 p.m. · Public domain';
const STOCK = 'Stock footage: Mixkit';

type Shot = { at: number; el: (p: SP & { a: number }) => React.ReactNode; x?: 'cut' | 'fade' | 'zoom' | 'flash' };
const S: Shot[] = [];
const sh = (at: number, el: Shot['el'], x: Shot['x'] = 'cut') => S.push({ at, el, x });
// local time helper: absolute cue -> local seconds inside the shot
const loc = (p: { a: number; t: number }, abs: number) => abs - (p.a - p.t);
// footage helpers
// overlays passed to fema()/stock() are written with t={0}; inject the shot's real local time recursively
const inject = (node: React.ReactNode, t: number): React.ReactNode => {
  if (!React.isValidElement(node)) return node;
  const el = node as React.ReactElement<any>;
  const kids = el.props.children !== undefined ? React.Children.map(el.props.children, (c: React.ReactNode) => inject(c, t)) : undefined;
  const props: any = {};
  if ('t' in el.props) props.t = t;
  return React.cloneElement(el, props, ...(kids ?? []));
};
const fema = (n: string, extra?: React.ReactNode, cam?: any) => (p: SP & { a: number }) => {
  const c = (FC as any)[n]; const crop = c?.cap ? { s0: 1.36, s1: 1.42, y0: 13, y1: 13 } : undefined;
  return (<><Clip {...p} src={n + '.mp4'} cam={cam ?? crop} />{inject(extra, p.t)}<Credit text={FEMAV} /></>);
};
const stock = (k: string, extra?: React.ReactNode, cam?: any) => (p: SP & { a: number }) => (<><Clip {...p} src={'stock/' + k + '.mp4'} cam={cam} />{inject(extra, p.t)}<Credit text={STOCK} /></>);
const dark = (o = 0.4) => <AbsoluteFill style={{ background: `rgba(0,0,0,${o})` }} />;

// --- small graphics
const Sms: React.FC<{ t: number; at: number; from: string; text: string }> = ({ t, at, from, text }) => {
  const k = pe(t, at, 0.5);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 980, opacity: k, transform: `translateY(${(1 - k) * 40}px) scale(${0.96 + 0.04 * k})` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: C.dim, marginBottom: 14 }}>{from}</div>
        <div style={{ background: 'rgba(36,40,44,0.94)', borderRadius: 34, padding: '34px 44px', fontFamily: SANS, fontSize: 54, lineHeight: 1.25, color: C.ink, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};
const RadioLog: React.FC<{ t: number; rows: { at: number; time: string; text: string }[] }> = ({ t, rows }) => (
  <AbsoluteFill style={{ justifyContent: 'center', paddingLeft: 160 }}>
    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 6, color: C.red, marginBottom: 26 }}>POLICE RADIO LOG · AUG. 8, 2023</div>
    {rows.map((r, i) => (t < r.at ? null : (
      <div key={i} style={{ display: 'flex', gap: 40, marginBottom: 26, opacity: pe(t, r.at, 0.3) }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 84, color: C.ember, width: 230 }}>{r.time}</div>
        <Type t={t} at={r.at} text={r.text} size={52} cps={34} style={{ letterSpacing: 1, textTransform: 'none', fontWeight: 600 }} />
      </div>
    )))}
  </AbsoluteFill>
);
const SirenRow: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ display: 'flex', gap: 70 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const ok = i === 1 || i === 3; const k = pe(t, 0.15 + i * 0.18, 0.4);
        return (
          <div key={i} style={{ textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * 30}px)` }}>
            <svg width="200" height="300" viewBox="0 0 200 300"><rect x="94" y="110" width="12" height="190" fill="#3A3F44" /><rect x="30" y="40" width="140" height="80" rx="10" fill="#2A2F33" stroke={ok ? C.ember : '#555'} strokeWidth="4" />{[55, 85, 115, 145].map((x) => <circle key={x} cx={x} cy={80} r={11} fill="#1A1D20" stroke={ok ? C.ember : '#444'} strokeWidth="3" />)}{!ok && t > 1.4 && <path d="M40,30 L160,130 M160,30 L40,130" stroke={C.red} strokeWidth="8" opacity={pe(t, 1.4 + i * 0.1, 0.3)} />}</svg>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: ok ? C.ember : C.dim }}>{ok ? 'LISTED WORKING' : 'NOT WORKING'}</div>
          </div>
        );
      })}
    </div>
    <div style={{ position: 'absolute', bottom: 120, fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: C.ink, opacity: pe(t, 1.8, 0.5) }}>THE FIVE SIRENS NEAR LAHAINA · ILLUSTRATION</div>
  </AbsoluteFill>
);
const MOK = { lon: -156.6767, lat: 20.8706 }; const KAU = { lon: -156.662, lat: 20.862 }; const BANYAN = { lon: -156.6787, lat: 20.8722 };
const IGN = { lon: -156.6723, lat: 20.8806 };

// ================= PART TITLES
const title = (id: string, bg: (p: SP & { a: number }) => React.ReactNode) => sh(PART[id].title_at, (p) => (<>{bg(p)}{dark(0.55)}<Part t={p.t} n={PART[id].n} title={PART[id].title} /></>), 'fade');

// ================= P1 — THE DRY TOWN
title('p1', (p) => <Sat {...p} keys={[{ t: 0, lon: -156.40, lat: 20.82, w: 50 }, { t: p.dur, lon: -156.50, lat: 20.86, w: 36 }]} />);
sh(L('p1_01'), (p) => <Sat {...p} keys={[{ t: 0, lon: -156.62, lat: 20.90, w: 30 }, { t: p.dur, lon: LAH.lon + 0.006, lat: LAH.lat, w: 5.5 }]} labels={[{ lon: LAH.lon - 0.004, lat: LAH.lat + 0.006, text: 'LAHAINA', at: 2.2, size: 40 }]} />);
sh(L('p1_02'), stock('ancient_map', <><Stamp t={0} at={0} time="1820–1845" sub="Royal capital of the Kingdom of Hawaiʻi" /></>));
sh(W('p1_02', 'royal'), fema('f144', <Tag text="Lahaina today · historic buildings" />));
sh(L('p1_03'), fema('f143'));
sh(W('p1_03', 'tiny') - 0.2, (p) => <Sat {...p} keys={[{ t: 0, lon: MOK.lon, lat: MOK.lat, w: 3.2 }, { t: p.dur, lon: MOK.lon, lat: MOK.lat, w: 2.2 }]} overlay={(sc, k, t) => { const [x, y] = sc(MOK.lon, MOK.lat); return <Marker x={x} y={y} t={t} at={0.6} label="MOKUʻULA" color={C.ember} />; }} tag="Site of the royal island · today a park" />);
sh(L('p1_04'), stock('stream'));
sh(W('p1_04', 'through'), stock('coast_aerial'));
sh(L('p1_05'), stock('waves_burst'));
sh(W('p1_05', 'sugar') - 0.15, stock('tall_dry_grass', <Slam t={0} at={0.1} text="SUGAR" size={220} />));
sh(L('p1_06'), stock('rocky_coast'));
sh(W('p1_06', 'royal'), (p) => <Sat {...p} keys={[{ t: 0, lon: MOK.lon, lat: MOK.lat, w: 2.4 }, { t: p.dur, lon: MOK.lon, lat: MOK.lat, w: 1.8 }]} overlay={(sc, k, t) => { const [x, y] = sc(MOK.lon, MOK.lat); return <Marker x={x} y={y} t={t} at={0.2} color={C.ember} />; }} />);
sh(W('p1_06', '1919') - 0.2, (p) => (<><Sat {...p} keys={[{ t: 0, lon: MOK.lon, lat: MOK.lat, w: 1.8 }, { t: p.dur, lon: MOK.lon, lat: MOK.lat, w: 1.5 }]} />{dark(0.35)}<Stamp t={p.t} at={0.1} time="1919" sub="The pond is filled in · a baseball field" /></>));
sh(L('p1_07'), stock('tall_dry_grass'));
sh(W('p1_07', 'fifteen') - 0.3, stock('weeds_wind', <>{dark(0.35)}<Count t={0} at={0.1} to={15} d={0.7} label="inches of rain a year" /></>));
sh(L('p1_08'), fema('f027'));
sh(W('p1_08', 'wooden') - 0.1, fema('f059'));
sh(W('p1_08', 'banyan') - 0.2, fema('f014', <Stamp t={0} at={0} time="1873" sub="The banyan tree is planted" />));
sh(W('p1_08', 'acre') - 0.6, fema('f148'));
sh(L('p1_09'), stock('wind_branches'));
sh(L('p1_10'), stock('tall_dry_grass'));
sh(W('p1_10', 'African') - 0.1, stock('wind_forest'));
sh(W('p1_10', 'Guinea'), stock('weeds_wind', <Slam t={0} at={0} text="GUINEA GRASS" size={170} />));
sh(W('p1_10', 'Buffel'), stock('wind_branches', <Slam t={0} at={0} text="BUFFEL GRASS" size={170} />));
sh(W('p1_10', 'Molasses'), stock('tall_dry_grass', <Slam t={0} at={0} text="MOLASSES GRASS" size={170} />));
sh(L('p1_11'), stock('wind_high'));
sh(W('p1_11', 'burns') - 0.2, stock('flames6', <Slam t={0} at={0.6} text="20-FOOT FLAMES" size={170} color={C.ember} glow />));
sh(L('p1_12'), fema('f144'));
sh(W('p1_12', 'surrounded') - 0.2, (p) => <Sat {...p} keys={[{ t: 0, lon: LAH.lon + 0.01, lat: LAH.lat, w: 7 }, { t: p.dur, lon: LAH.lon + 0.008, lat: LAH.lat, w: 6 }]} labels={[{ lon: -156.663, lat: 20.892, text: 'DRY GRASS', at: 0.8, color: C.ember }, { lon: -156.664, lat: 20.868, text: 'DRY GRASS', at: 1.2, color: C.ember }, { lon: -156.689, lat: 20.896, text: 'DRY GRASS', at: 1.6, color: C.ember }]} />);

// ================= P2 — THE WARNINGS
title('p2', stock('smoke_bg'));
sh(L('p2_01'), stock('newspaper'));
sh(W('p2_02', 'News') - 0.1, stock('newspaper'));
sh(L('p2_02'), stock('typing', <>{dark(0.3)}<Stamp t={0} at={0} time="2014" sub="West Maui wildfire protection plan" /></>));
sh(W('p2_02', 'extreme') - 0.25, stock('flames3', <Slam t={0} at={0.1} text="EXTREME" size={240} color={C.red} glow />));
sh(L('p2_03'), stock('storm_ocean', <Stamp t={0} at={0.1} time="AUG 2018" sub="Hurricane Lane approaches" />));
sh(W('p2_03', 'Kauaʻula') - 0.3, (p) => <Sat {...p} scene="pre" keys={[{ t: 0, lon: -156.66, lat: 20.875, w: 9 }, { t: p.dur, lon: KAU.lon, lat: KAU.lat, w: 5 }]} overlay={(sc, k, t) => { const [x, y] = sc(KAU.lon, KAU.lat); return <Marker x={x} y={y} t={t} at={1.0} label="KAUAʻULA VALLEY · 2018" />; }} />);
sh(W('p2_03', 'burned') - 0.2, stock('flames2', <Count t={0} at={0.2} to={1500} d={1.0} label="acres burned in 2018" />));
sh(L('p2_04'), stock('flames4', <Slam t={0} at={0.3} text="“UNPRECEDENTED”" size={170} />));
sh(L('p2_05'), stock('office_meet'));
sh(W('p2_05', 'never'), stock('meeting2', <Slam t={0} at={0.2} text="NO REVIEW" size={220} color={C.red} />));
sh(W('p2_05', 'emergency') - 0.2, stock('typing'));
sh(L('p2_06'), stock('clock_midnight', <Slam t={0} at={0.2} text="AUGUST 2023" size={150} y={330} />));
sh(L('p2_07'), stock('storm_ocean', <Tag text="Hurricane Dora · far to the south" />));
sh(W('p2_07', 'north') - 0.2, stock('clouds_fast', <Tag text="High pressure · to the north" />));
sh(W('p2_07', 'Between'), stock('clouds_thick', <Slam t={0} at={0.6} text="A RIVER OF WIND" size={160} />));
sh(L('p2_08'), stock('storm_night', <Stamp t={0} at={0} time="AUG 7" sub="National Weather Service" />));
sh(W('p2_08', 'red'), stock('storm_night', <Slam t={0} at={0} text="RED FLAG WARNING" size={170} color={C.red} glow />, { s0: 1.2, s1: 1.3 }));
sh(W('p2_08', 'Its'), stock('wind_forest'));
sh(L('p2_09'), stock('wind_high', <Count t={0} at={0.1} to={80} d={0.8} label="mph gusts" />));

// ================= P3 — THE MORNING
title('p3', stock('clock_wall'));
sh(L('p3_01'), (p) => <Sat {...p} keys={[{ t: 0, lon: IGN.lon, lat: IGN.lat, w: 4 }, { t: p.dur, lon: IGN.lon, lat: IGN.lat, w: 2.6 }]} hwy={0.5} overlay={(sc, k, t) => { const [x, y] = sc(IGN.lon, IGN.lat); return <Marker x={x} y={y} t={t} at={1.2} label="POWER LINES DOWN" />; }} tag="Approximate location" />);
sh(W('p3_01', 'Lahainaluna') - 0.3, (p) => (<><Still {...p} src="powerlines.jpg" cam={{ s0: 1.2, s1: 1.1 }} /><Stamp t={p.t} at={0.1} time="6:34–6:37 AM" /><Credit text={DVIDS + ' · utility repairs, Aug. 18, 2023'} /></>));
sh(L('p3_02'), stock('phone_dark', <>{dark(0.3)}<Slam t={0} at={0.6} text="911" size={300} color={C.red} glow /></>));
sh(W('p3_02', 'The'), stock('sparks'));
sh(L('p3_03'), fema('f037'));
sh(W('p3_03', 'By'), fema('f038', <Stamp t={0} at={0} time="~9:00 AM" sub="Declared contained" />));
sh(L('p3_04'), fema('f036', <Stamp t={0} at={0.1} time="2:18 PM" sub="The crews leave" />));
sh(W('p3_04', 'fire') - 0.2, (p) => <Quote {...p} text="Fully contained and **extinguished.**" who="Brad Ventura" role="Maui Fire Chief · as reported, Oct. 2024" bg="charred_palm.jpg" />);
sh(L('p3_05'), stock('clock_wall', <Count t={0} at={0.2} to={34} d={0.8} label="minutes later" />));
sh(W('p3_05', 'burning'), stock('flames_burst'));
sh(W('p3_05b', 'saw') - 0.1, stock('smoke_thick'));
sh(W('p3_05b', 'called') - 0.2, stock('phone_type'));
sh(L('p3_05b'), stock('smoke_out', <Stamp t={0} at={0.1} time="~2:55 PM" sub="A small fire is reported" />));
sh(L('p3_06'), stock('smoke_thick', <Slam t={0} at={0.4} text="REKINDLE" size={240} color={C.ember} glow />));
sh(W('p3_06', 'Something'), stock('fire_wood'));
sh(L('p3_07'), stock('sparks', <Slam t={0} at={0.2} text="A SPARK?" size={170} />));
sh(W('p3_07', 'Smoldering'), fema('f157', <Slam t={0} at={0.2} text="HEAVY EQUIPMENT?" size={150} />));
sh(W('p3_07', 'Or'), stock('smoke_swirl', <Slam t={0} at={0.3} text="A BURNING ROOT?" size={150} />));
sh(L('p3_08'), stock('typing', <>{dark(0.4)}<Slam t={0} at={0.8} text="NONE RULED OUT" size={170} /></>));

// ================= P4 — THE AFTERNOON
title('p4', stock('flames5'));
sh(L('p4_01'), stock('flames1'));
sh(L('p4_02'), (p) => <Sat {...p} keys={[{ t: 0, lon: IGN.lon - 0.003, lat: IGN.lat, w: 4.5 }, { t: p.dur, lon: IGN.lon - 0.005, lat: IGN.lat - 0.001, w: 3.6 }]} hwy={0.3} labels={[{ lon: -156.666, lat: 20.886, text: 'LAHAINA BYPASS', at: 0.6, size: 30, color: C.red }]} />);
sh(W('p4_02', 'Around') - 0.1, fema('f005', <Stamp t={0} at={0} time="3:30 PM" sub="Homes on Lahainaluna Road catch fire" />));
sh(L('p4_02b'), stock('present'));
sh(W('p4_02b', 'closing') - 0.3, stock('phone_type', <>{dark(0.45)}<Sms t={0} at={0.1} from="TEXT · HERMAN ANDAYA · 3:30 PM" text="Closing Lahaina Bypass road. Fire jump over to the roadway." /></>));
sh(L('p4_03'), stock('policemen', <>{dark(0.6)}</>));
sh(W('p4_03', 'At') - 0.1, (p) => (<><Clip {...p} src="stock/night_traffic.mp4" />{dark(0.72)}<RadioLog t={p.t} rows={[{ at: 0.1, time: '3:23', text: '“I’m blocking off the Bypass headed into Lahaina…”' }, { at: loc(p, W('p4_03', 'Front')) - 0.4, time: '3:52', text: '“Front Street at a standstill.”' }]} /><Credit text={STOCK} /></>));
sh(L('p4_04'), stock('satellite_dish', <Slam t={0} at={0.4} text="NO SIGNAL" size={200} color={C.red} />));
sh(W('p4_04', 'Many'), stock('phone_scroll'));
sh(L('p4_05'), stock('phone_scroll'));
sh(W('p4_05', 'evacuation') - 0.3, stock('phone_text', <>{dark(0.45)}<Sms t={0} at={0.1} from="EMERGENCY ALERT · 4:10 PM" text="Evacuation for Kelawea Mauka." /></>));
sh(L('p4_06'), stock('typing'));
sh(W('p4_06', 'eighty') - 0.3, stock('phone_dark', <>{dark(0.45)}<Count t={0} at={0.1} to={87} d={1.0} suffix="%" label="never received a text alert" /></>));
sh(L('p4_07'), (p) => <Sat {...p} keys={[{ t: 0, lon: -156.676, lat: 20.877, w: 4.2 }, { t: p.dur, lon: -156.676, lat: 20.877, w: 3.6 }]} hwy={0} overlay={(sc, k, t) => { const [x1, y1] = sc(IGN.lon, IGN.lat); const [x2, y2] = sc(BANYAN.lon, BANYAN.lat); const q = pe(t, 1.2, 1.0); return (<><Marker x={x1} y={y1} t={t} at={0.3} label="MORNING FIRE" color={C.ember} /><line x1={x1} y1={y1} x2={x1 + (x2 - x1) * q} y2={y1 + (y2 - y1) * q} stroke={C.red} strokeWidth={5} strokeDasharray="14 10" /><Marker x={x2} y={y2} t={t} at={2.0} label="BANYAN TREE · 4:24 PM" /></>); }} />);
sh(W('p4_07', 'That'), stock('flames4', <Slam t={0} at={0.6} text="1.3 MILES" size={220} />));
sh(L('p4_07b'), stock('flames1', <Stamp t={0} at={0.1} time="4:24 PM" sub="First death reported · Mill Street" />));
sh(W('p4_07b', '4:46') - 0.25, (p) => <Sat {...p} keys={[{ t: 0, lon: LAH.lon + 0.004, lat: LAH.lat, w: 4.4 }, { t: p.dur, lon: LAH.lon + 0.004, lat: LAH.lat, w: 3.8 }]} hwy={0} burn={{ at: 0.5, d: 2.2, fill: true }} tag="Burn area: Sentinel-2, Aug. 13" />);
sh(L('p4_08'), fema('f088'));
sh(W('p4_08', 'Embers'), stock('sparks', <Embers t={0} n={40} />));
sh(L('p4_09'), stock('traffic_night_av'));
sh(L('p4_10'), stock('rain_traffic'));
sh(W('p4_10', 'Traffic'), stock('night_traffic'));
sh(W('p4_10', 'Survivors'), stock('policemen', <>{dark(0.3)}<Slam t={0} at={0.8} text="ROADS BLOCKED" size={190} color={C.red} /></>));
sh(L('p4_11'), stock('car_dash'));
sh(W('p4_11', 'Accounts') - 0.1, stock('policemen', <>{dark(0.4)}<Slam t={0} at={0.1} text="ACCOUNTS CONFLICT" size={160} /></>));
sh(L('p4_12'), fema('f019'));
sh(W('p4_12', 'people'), fema('f020', <Slam t={0} at={0.9} text="THEY LIVED" size={220} />));
sh(L('p4_12b'), (p) => <Quote {...p} text="The **gridlock** would have left us there when the **firestorm** came." who="Kim Cuevas-Reyes" role="Lahaina survivor · to the Associated Press" bg="charred_cars.jpg" />);
sh(L('p4_13'), (p) => <Quote {...p} text="Like we literally had **minutes** and one wrong turn. We would **all be dead** right now." who="Nate Baird" role="Lahaina survivor · to the Associated Press" bg="cars_ocean.jpg" />);

// ================= P5 — THE OCEAN
title('p5', stock('waves_crash'));
sh(L('p5_01'), stock('waves_aerial'));
sh(L('p5_02'), fema('f041'));
sh(L('p5_03'), fema('f045'));
sh(W('p5_03', 'Others'), (p) => (<><Burst {...p} srcs={['beach_palms.jpg', 'cars_ocean.jpg', 'waterfront_cars.jpg']} step={0.6} /><Credit text={DVIDS + ' · Aug. 17–18, 2023'} /></>));
sh(L('p5_04'), (p) => (<><Still {...p} src="cg_aerial.jpg" cam={{ s0: 1.1, s1: 1.25 }} /><Stamp t={p.t} at={0.1} time="5:45 PM" sub="The Coast Guard is told people are in the water" /><Credit text={USCG} /></>));
sh(L('p5_05'), (p) => (<><Still {...p} src="cg_sar.jpg" cam={{ s0: 1.1, s1: 1.24 }} /><Count t={p.t} at={loc(p, W('p5_05', 'seventeen')) - 0.2} to={17} d={0.6} label="pulled from the water" size={260} y={-80} /><Credit text={USCG + ' · night of Aug. 9, 2023'} /></>));
sh(W('p5_05', 'forty') - 0.2, (p) => (<><Still {...p} src="cg_sar.jpg" cam={{ s0: 1.3, s1: 1.4, x0: 4, x1: 6 }} />{dark(0.3)}<Count t={p.t} at={0} to={40} d={0.6} label="more helped ashore" size={260} /><Credit text={USCG} /></>));
sh(L('p5_06'), stock('moon', <Stamp t={0} at={0.1} time="7:19 PM" />));
sh(W('p5_06', 'only'), stock('smoke_swirl', <Slam t={0} at={0.2} text="“ONE BUSINESS”" size={180} color={C.ember} />));
sh(L('p5_07'), (p) => (<><Still {...p} src="landsat_lahaina.jpg" grade="contrast(1.15) saturate(1.15)" cam={{ s0: 1.3, s1: 1.6, x0: 8, x1: 12 }} /><Credit text={NASA} /></>));
sh(L('p5_07b'), fema('f213', <Count t={0} at={0.3} to={26} d={0.8} label="days until fully contained" />));

// ================= P6 — THE SILENT SIRENS
title('p6', (p) => (<><AbsoluteFill style={{ background: '#08090B' }} /><SirenIcon t={p.t} on={false} /></>));
sh(L('p6_01'), stock('tropical_view', <Tag text="Oʻahu" />));
sh(W('p6_01', 'He', 1), stock('present'));
sh(L('p6_01b'), stock('phone_dark', <>{dark(0.45)}<Sms t={0} at={0.3} from="TEXT · HERMAN ANDAYA · 4:03 PM" text="Should I come home?" /></>));
sh(L('p6_02'), (p) => <Sat {...p} keys={[{ t: 0, lon: -156.34, lat: 20.81, w: 52 }, { t: p.dur, lon: -156.34, lat: 20.81, w: 48 }]} dim={0.35} />);
sh(W('p6_02', 'eighty') - 0.4, (p) => (<><Sat {...p} keys={[{ t: 0, lon: -156.34, lat: 20.81, w: 48 }, { t: p.dur, lon: -156.34, lat: 20.81, w: 45 }]} dim={0.55} /><Count t={p.t} at={0.2} to={80} d={0.9} label="sirens on Maui" size={280} /></>));
sh(L('p6_03'), (p) => (<><AbsoluteFill style={{ background: '#050607' }} /><Slam t={p.t} at={loc(p, W('p6_03', 'not'))} text="0" size={520} color={C.red} glow /><Slam t={p.t} at={loc(p, W('p6_03', 'sounded'))} text="SOUNDED" size={120} y={310} /></>));
sh(L('p6_04'), (p) => <Quote {...p} at={loc(p, W('p6_04', 'answered')) + 0.3} text="I **do not.**" who="Herman Andaya" role="Maui Emergency Management Administrator · Aug. 16, 2023 · asked if he regretted it" />);
sh(L('p6_05'), (p) => <Quote {...p} at={loc(p, W('p6_05', 'We')) - 0.1} text="We just **don't use sirens for fires.**" who="Herman Andaya" role="Aug. 16, 2023" />);
sh(L('p6_06'), (p) => <Quote {...p} text="Had we sounded the siren that night, we were afraid that people would have gone **mauka**… And if that's the case then they would have gone **into the fire.**" who="Herman Andaya" role="Aug. 16, 2023" />);
sh(L('p6_07'), stock('window_sad', <>{dark(0.3)}<Stamp t={0} at={0.1} time="AUG 17" sub="Andaya resigns" /></>));
sh(L('p6_08'), stock('typing'));
sh(L('p6_09'), (p) => (<><AbsoluteFill style={{ background: '#08090B' }} /><SirenIcon t={p.t} on={false} /><Slam t={p.t} at={0.4} text="NEVER DISCUSSED" size={150} y={360} color={C.red} /></>));
sh(W('p6_09', 'They'), stock('flames2', <>{dark(0.3)}<Slam t={0} at={0.6} text="NEVER USED FOR A WILDFIRE" size={120} /></>));
sh(L('p6_10'), (p) => (<><AbsoluteFill style={{ background: '#08090B' }} /><SirenRow t={p.t} /></>));
sh(W('p6_10', 'They'), stock('satellite_dish', <Slam t={0} at={0.5} text="A FAILING CELL NETWORK" size={130} />));
sh(L('p6_11'), stock('distressed'));
sh(W('p6_11', 'But'), stock('window_sad', <Slam t={0} at={0.8} text="ONE MORE WARNING" size={150} />));

// ================= P7 — THE WATER
title('p7', stock('stream'));
sh(L('p7_01'), stock('stream'));
sh(L('p7_02'), fema('f038'));
sh(W('p7_02', 'hydrants'), fema('f037', <Slam t={0} at={0.3} text="PRESSURE DROPPING" size={160} color={C.red} />));
sh(L('p7_03'), (p) => <Quote {...p} text="There was just **no water** in the hydrants." who="Keahi Ho" role="Lahaina firefighter · August 2023" bg="old_fort.jpg" />);
sh(L('p7_04'), fema('f087'));
sh(W('p7_04', 'The'), fema('f089', <Slam t={0} at={0.2} text="THE SYSTEM WAS BLEEDING" size={130} />));
sh(L('p7_05'), fema('f050'));
sh(W('p7_05', 'Water'), fema('f051'));
sh(W('p7_05', 'pressure'), fema('f052'));
sh(L('p7_06'), stock('clouds_fast'));
sh(W('p7_06', 'helicopters') - 0.4, fema('f081', <Slam t={0} at={0.3} text="TOO WINDY TO FLY" size={160} />));
sh(L('p7_07'), stock('ff_street'));
sh(W('p7_07', 'with'), stock('ff_bigfire'));

// ================= P8 — WHO IS RESPONSIBLE
title('p8', stock('smoke_motion'));
sh(L('p8_01'), stock('smoke_bg', <Slam t={0} at={0.6} text="WHO?" size={300} />));
sh(L('p8_02'), stock('office_meet'));
sh(W('p8_02', 'It'), stock('meeting2', <Slam t={0} at={0.3} text="A SYSTEM" size={240} />));
sh(L('p8_03'), (p) => (<><Still {...p} src="powerlines.jpg" cam={{ s0: 1.25, s1: 1.12 }} /><Slam t={p.t} at={1.0} text="NO POWER SHUTOFF PLAN" size={130} /><Credit text={DVIDS} /></>));
sh(W('p8_03', 'Its'), (p) => <Quote {...p} text="Not an **appropriate fit** for Hawaii." who="Shelee Kimura" role="Hawaiian Electric CEO · to Congress, Sept. 28, 2023 · on preemptive shutoffs" />);
sh(L('p8_04'), (p) => (<><Still {...p} src="atf.jpg" cam={{ s0: 1.1, s1: 1.22 }} /><Stamp t={p.t} at={0.1} time="OCT 2, 2024" sub="Official cause report" /><Credit text={DVIDS + ' · ATF investigator, Aug. 18, 2023'} /></>));
sh(W('p8_04', 'Broken'), stock('sparks', <Slam t={0} at={0.1} text="ACCIDENTAL" size={220} />));
sh(W('p8_04', 'afternoon') - 0.15, stock('smoke_thick', <Slam t={0} at={0.6} text="SAME FIRE · REKINDLED" size={130} color={C.ember} />));
sh(L('p8_04b'), (p) => <Quote {...p} text="So, yes, I do believe they did **everything possible.**" who="Jonathan Blais" role="ATF Special Agent in Charge · Oct. 2, 2024 · on the firefighters" />);
sh(L('p8_05'), (p) => <Quote {...p} text="We **deeply regret** that our operations **contributed to the fire** that ignited in the morning." who="Hawaiian Electric" role="Statement · October 2024" />);
sh(L('p8_06'), stock('present'));
sh(W('p8_06', 'listed') - 0.1, stock('typing', <>{dark(0.4)}<Count t={0} at={0.3} to={84} d={0.8} label="findings" /></>));
sh(W('p8_06', 'no') - 0.15, stock('newspaper', <Slam t={0} at={0.1} text="NO SINGLE FACTOR" size={170} />));
sh(L('p8_06b'), (p) => <Quote {...p} text="This investigation serves as a **wake-up call** for the state and county governments to learn from the past and urgently prepare for the future." who="Anne Lopez" role="Hawaiʻi Attorney General · Sept. 13, 2024" />);
sh(L('p8_07'), stock('newspaper', <Slam t={0} at={0.1} text="WARNINGS" size={200} />));
sh(W('p8_07', 'A') - 0.1, stock('smoke_out', <Slam t={0} at={0.1} text="REKINDLE" size={200} color={C.ember} />));
sh(W('p8_07', 'Alerts'), stock('phone_scroll', <>{dark(0.3)}<Slam t={0} at={0.1} text="NO ALERTS" size={200} /></>));
sh(W('p8_07', 'Sirens'), (p) => (<><AbsoluteFill style={{ background: '#08090B' }} /><SirenIcon t={p.t} on={false} /><Slam t={p.t} at={0.1} text="SILENT SIRENS" size={150} y={360} color={C.red} /></>));
sh(W('p8_07', 'Roads'), stock('traffic_night_av', <Slam t={0} at={0.1} text="GRIDLOCK" size={200} />));
sh(W('p8_07', 'Hydrants'), fema('f036', <Slam t={0} at={0.1} text="NO PRESSURE" size={200} color={C.red} />));
sh(L('p8_08'), (p) => <Quote {...p} text="The conditions that made this tragedy possible were **years in the making.**" who="Steve Kerber" role="Fire Safety Research Institute · Sept. 13, 2024" bg="overlook.jpg" />);
sh(L('p8_09'), stock('money_count'));
sh(W('p8_09', 'agreed') - 0.2, stock('money_fall', <Slam t={0} at={0.3} text="$4 BILLION+" size={240} color={C.ember} />));
sh(L('p8_09b'), stock('storm_night', <Stamp t={0} at={0.1} time="JULY 2024" sub="Hawaiian Electric starts power shutoffs" />));
sh(W('p8_09b', 'It') - 0.1, stock('clouds_fast'));
sh(W('p8_09b', 'The', 1), stock('clouds_thick', <Slam t={0} at={0.3} text="“LAST LINE OF DEFENSE”" size={140} />));

// ================= P9 — WHAT WAS LOST
title('p9', stock('candles'));
sh(L('p9_01'), (p) => (<><Clip {...p} src="stock/candles.mp4" />{dark(0.35)}<AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: pe(p.t, 0.4, 1.0) }}><div style={{ fontFamily: DISPLAY, fontSize: 360, color: C.ink, lineHeight: 0.85 }}>102</div><div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: 10, color: C.ink, marginTop: 18 }}>LIVES</div></AbsoluteFill><Credit text={STOCK} /></>));
sh(L('p9_02'), stock('candle_hands', <>{dark(0.35)}<Slam t={0} at={0.2} text="AGES 7 TO 97" size={170} y={-60} /></>));
sh(W('p9_02', 'Most') - 0.1, stock('candles', <>{dark(0.3)}<Slam t={0} at={0.4} text="MEDIAN AGE 68" size={150} color={C.ember} /></>));
sh(L('p9_03'), fema('f022', <Count t={0} at={0.6} to={65} d={0.8} label="were trying to get out" />));
sh(W('p9_03', 'Some'), fema('f023'));
sh(W('p9_03', 'Some', 2), fema('f042'));
sh(L('p9_03b'), (p) => <Sat {...p} scene="post" keys={[{ t: 0, lon: LAH.lon + 0.002, lat: LAH.lat, w: 4.0 }, { t: p.dur, lon: LAH.lon + 0.002, lat: LAH.lat, w: 3.4 }]} burn={{ at: 0.2, d: 1.4 }} labels={[{ lon: LAH.lon - 0.004, lat: LAH.lat + 0.006, text: 'CENTRAL LAHAINA', at: 0.6 }]} tag="Aug. 13, 2023" />);
sh(L('p9_04'), (p) => (<><Sat {...p} scene="pre" keys={[{ t: 0, lon: LAH.lon + 0.004, lat: LAH.lat, w: 4.4 }, { t: p.dur, lon: LAH.lon + 0.004, lat: LAH.lat, w: 4.0 }]} wipe={{ at: 0.3, d: 2.4 }} tag="Before: Aug. 3 · After: Aug. 13, 2023" /><Count t={p.t} at={loc(p, W('p9_04', 'two')) - 0.2} to={2207} d={1.0} label="buildings damaged or destroyed" size={200} y={330} /></>));
sh(L('p9_04b'), stock('candle_hands', <>{dark(0.3)}<Count t={0} at={0.6} to={388} d={0.9} label="once listed missing" /></>));
sh(W('p9_04b', 'The'), stock('candles'));
sh(L('p9_05'), stock('window_sad', <Count t={0} at={0.3} to={7796} d={1.0} label="people sheltered in hotels" size={200} />));
// archival speech insert 1
const I1 = (T.inserts as any[])[0], I2 = (T.inserts as any[])[1];
sh(I1.at - 0.3, (p) => (<><Clip {...p} src="tom1.mp4" from={0.4} cam={{ s0: 1.0, s1: 1.04 }} /><Lower t={p.t} at={0.1} name="Tom Liu" role="Maui wildfire survivor, 82 · FEMA interview" /><Credit text={FEMAV} /></>));
sh(L('p9_06'), fema('f200'));
sh(W('p9_06', 'By'), fema('f201'));
sh(W('p9_06', 'On'), fema('f202', <Slam t={0} at={0.6} text="BARELY BEGUN" size={180} />));
sh(I2.at - 0.3, (p) => (<><Clip {...p} src="tom2.mp4" from={0.4} cam={{ s0: 1.0, s1: 1.04 }} /><Lower t={p.t} at={0.1} name="Tom Liu" role="Maui wildfire survivor, 82 · FEMA interview" /><Credit text={FEMAV} /></>));
sh(L('p9_07'), fema('f016'));
sh(W('p9_07', 'banyan') - 0.2, fema('f040'));
sh(L('p9_08'), fema('f101'));
sh(W('p9_08', 'The'), fema('f217', <Slam t={0} at={0.6} text="GROWING BACK" size={190} />));

// ================= P10 — ENDING (no title)
sh(PART.p10.title_at, stock('storm_ocean'));
sh(W('p10_01', 'freak') - 0.2, stock('clouds_fast'));
sh(L('p10_02'), stock('newspaper'));
sh(L('p10_03'), stock('tall_dry_grass'));
sh(W('p10_03', '2018') - 0.15, stock('flames2', <Stamp t={0} at={0} time="2018" />));
sh(W('p10_03', 'wind') - 0.15, stock('clouds_thick'));
sh(L('p10_04'), (p) => (<><AbsoluteFill style={{ background: '#08090B' }} /><SirenIcon t={p.t} on={false} /></>));
sh(W('p10_04', 'crews') - 0.2, fema('f038', <Stamp t={0} at={0.1} time="2:18 PM" />));
sh(W('p10_05', 'It') - 0.1, fema('f106'));
sh(L('p10_05'), (p) => <Sat {...p} scene="post" keys={[{ t: 0, lon: LAH.lon + 0.003, lat: LAH.lat, w: 3.8 }, { t: p.dur, lon: -156.62, lat: 20.87, w: 26 }]} burn={{ at: 0, d: 0.1, fill: true }} />);
sh(L('p10_06'), (p) => (<><Sat {...p} keys={[{ t: 0, lon: -156.34, lat: 20.81, w: 50 }, { t: p.dur, lon: -156.34, lat: 20.81, w: 46 }]} dim={0.6} /><Count t={p.t} at={loc(p, W('p10_06', 'eighty')) - 0.2} to={80} d={0.6} label="sirens · silent" size={300} color={C.red} /></>));
sh(L('p10_07'), (p) => (<><Still {...p} src="landsat_lahaina.jpg" grade="contrast(1.1) saturate(1.05) brightness(0.7)" cam={{ s0: 1.25, s1: 1.1 }} />{dark(0.45)}<Embers t={p.a} n={50} /><Credit text={NASA} /></>));
sh(T.end_at, (p) => (<><Still {...p} src="landsat_lahaina.jpg" grade="contrast(1.1) brightness(0.55)" cam={{ s0: 1.1, s1: 1.0 }} />{dark(0.5)}<AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}><div style={{ fontFamily: DISPLAY, fontSize: 230, color: C.ink, opacity: pe(p.t, 0.3, 1), textShadow: '0 0 60px rgba(255,122,31,0.5)' }}>LAHAINA</div><div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, letterSpacing: 12, color: C.ember, opacity: pe(p.t, 1, 0.8) }}>IN MEMORY OF THE 102</div></AbsoluteFill></>), 'fade');

S.sort((a, b) => a.at - b.at);

const ShotV: React.FC<{ s: Shot; dur: number }> = ({ s, dur }) => {
  const t = useCurrentFrame() / FPS;
  const fadeIn = s.x === 'fade' ? pe(t, 0, 0.5) : 1;
  const zoom = s.x === 'zoom' ? 1.1 - 0.1 * pe(t, 0, 0.5) : 1;
  return <AbsoluteFill style={{ opacity: fadeIn, transform: `scale(${zoom})`, background: C.bg }}>{s.el({ t, dur, a: s.at + t })}</AbsoluteFill>;
};
const HOOK_END = T.hook_end as number;
export const FULL_DUR = T.duration as number;
export const SHOT_COUNT = S.length;
export const FullEp: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0} durationInFrames={Math.round(S[0].at * FPS)}><Demo noAudio /></Sequence>
    {S.map((s, i) => {
      const end = i + 1 < S.length ? S[i + 1].at : FULL_DUR;
      const from = Math.round(s.at * FPS), to = Math.round(end * FPS);
      return <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}><ShotV s={s} dur={end - s.at} /></Sequence>;
    })}
    <Grain o={0.1} />
    <Audio src={staticFile('audio/full_mix.wav')} />
  </AbsoluteFill>
);
export { HOOK_END };
