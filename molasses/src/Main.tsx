import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import tl from './data/timeline.json';
import { C, Grain, toNew } from './lib';
import { MapIntro, WaveMap } from './shots/MapShots';
import { BlueprintShot, PaintShot, SplitShot } from './shots/Blueprint';
import { TankLeak, ArchivePhoto, PostClip, PD } from './shots/PhotoShots';
import { TimeCard, Casualties, OwnerCard, BlameCard, TitleCard } from './shots/Cards';

const FPS = 30;
type Shot = { id: string; from: number; to: number; fade?: number; el: (p: { t: number; start: number; dur: number }) => React.ReactNode };

// Shot list (absolute seconds on the narration timeline). fade = crossfade-in length (s); 0 = hard cut.
export const SHOTS: Shot[] = [
  { id: '01-03 plate+map', from: 0, to: 17.0, fade: 0, el: (p) => <MapIntro {...p} /> },
  { id: '05 blueprint', from: 17.0, to: 24.6, fade: 0.4, el: (p) => <BlueprintShot {...p} /> },
  { id: '06 tank photo', from: 24.6, to: 28.4, fade: 0.4, el: (p) => <TankLeak {...p} /> },
  { id: '07 painted brown', from: 28.4, to: 32.5, fade: 0.35, el: (p) => <PaintShot {...p} /> },
  { id: '08 12:30', from: 32.5, to: 34.6, fade: 0.3, el: (p) => <TimeCard {...p} /> },
  { id: '09 split', from: 34.6, to: 36.4, fade: 0, el: (p) => <SplitShot {...p} /> },
  { id: '10 boston post', from: 36.4, to: 38.8, fade: 0.35, el: (p) => <PostClip {...p} /> },
  { id: '11 wave map', from: 38.8, to: 45.1, fade: 0.35, el: (p) => <WaveMap {...p} /> },
  { id: '12 panorama', from: 45.1, to: 46.85, fade: 0, el: (p) => (
    <ArchivePhoto {...p} src="panorama.jpg" kb={{ s0: 1.06, s1: 1.13, x0: 0, x1: -1, y0: 5, y1: 6 }}
      text="Commercial Street after the flood. The wreck of the tank lies in the background."
      source={`Photo: Boston Public Library (Globe Newspaper Co.), Jan. 15, 1919 · ${PD}`}
      arrow={{ px: 1390, py: 200, dx: -200, dy: 190, at: 0.3, label: 'Tank wreckage' }} />) },
  { id: '13 el structure', from: 46.85, to: 49.35, fade: 0, el: (p) => (
    <ArchivePhoto {...p} src="el_structure.jpg" kb={{ s0: 1.04, s1: 1.1, x0: 1, x1: 2, y0: 3, y1: 4 }}
      text="The elevated railway on Atlantic Avenue: its steel frame bent and torn."
      source={`Photo: photographer unknown, 1919, via Wikimedia Commons · ${PD}`}
      arrow={{ px: 330, py: 420, dx: 170, dy: 150, at: 0.4, label: 'Bent girder' }} />) },
  { id: '14 streetcar', from: 49.35, to: 51.7, fade: 0, el: (p) => (
    <ArchivePhoto {...p} src="cba_031.jpg" kb={{ s0: 1.05, s1: 1.11, x0: 1.5, x1: 0.5, y0: 0, y1: 0 }}
      text="Under the elevated tracks: a stranded streetcar, a wrecked wagon, debris."
      source={`Photo: Boston Elevated Railway Co., January 1919 · City of Boston Archives · ${PD}`}
      arrow={{ px: 240, py: 470, dx: 160, dy: -150, at: 0.35, label: 'Streetcar' }} />) },
  { id: '15 rescuers', from: 51.7, to: 54.95, fade: 0, el: (p) => (
    <ArchivePhoto {...p} src="under_el.jpg" kb={{ s0: 1.04, s1: 1.12, x0: 0, x1: 0, y0: 0, y1: -2 }}
      text="Firefighters and rescuers in the wreckage under the elevated tracks."
      source={`Photo: photographer unknown, 1919, via Wikimedia Commons · ${PD}`} />) },
  { id: '16 casualties', from: 54.95, to: 59.9, fade: 0.35, el: (p) => <Casualties {...p} /> },
  { id: '17 owner', from: 59.9, to: 62.15, fade: 0.35, el: (p) => <OwnerCard {...p} /> },
  { id: '18 blame', from: 62.15, to: 65.3, fade: 0.3, el: (p) => <BlameCard {...p} /> },
  { id: '19 title', from: 65.3, to: 76.278, fade: 0.6, el: (p) => <TitleCard {...p} /> },
];

const ShotSeq: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const fadeF = Math.round((s.fade ?? 0) * FPS);
  const o = fadeF ? interpolate(f, [0, fadeF], [0, 1], { extrapolateRight: 'clamp' }) : 1;
  const dur = toNew(s.to) - toNew(s.from);
  return <AbsoluteFill style={{ opacity: o }}>{s.el({ t: f / FPS, start: toNew(s.from), dur })}</AbsoluteFill>;
};

export const Main: React.FC<{ audio?: string }> = ({ audio = 'audio/mix.wav' }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    {SHOTS.map((s, i) => {
      const next = SHOTS[i + 1];
      const tail = next ? (next.fade ?? 0) : 0; // keep this shot alive under the next one's crossfade
      const from = Math.round(toNew(s.from) * FPS);
      const to = Math.min(Math.round(tl.duration * FPS), Math.round((toNew(s.to) + tail) * FPS));
      return (
        <Sequence key={s.id} from={from} durationInFrames={Math.max(1, to - from)} name={s.id}>
          <ShotSeq s={s} />
        </Sequence>
      );
    })}
    <Grain o={0.035} />
    <Audio src={staticFile(audio)} />
  </AbsoluteFill>
);
