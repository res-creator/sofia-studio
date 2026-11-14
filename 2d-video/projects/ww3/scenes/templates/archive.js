// templates/archive.js — placeholder for real archive footage (ru_geo/ww3/archive.json). The renderer draws a dark
// "film window" + the caption plate; at assembly the clip is overlaid INTO the window rect (ffmpeg overlay,
// scale to fit the rect; the plate and credit sit below the window, so they stay visible).
// Window geometry (logical 1920×1080; multiply by output/1920): aspect "16:9" → x 231, y 90, w 1458, h 820;
// aspect "4:3" → x 413, y 90, w 1093, h 820. The caption plate sits under the window (y≈965), above the 'wide' bars.
// Test footage MUST carry the plate «ИСПЫТАНИЕ, ГОД, МЕСТО» (params.caption), stills say what they are.
import { E, V, S, layer, ease, prog, clamp, rr, glow, alpha, text, FONTS, linGrad } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { tpl } from './_registry.js';
import { showAt, plate, source } from '../lib.js';

export function archiveRect(aspect = '16:9') {
  const h = V(820, 1100), w = aspect === '4:3' ? h * 4 / 3 : aspect === '1:1' ? h : Math.min(E.W - V(320, 0), h * 16 / 9);
  return { x: Math.round((E.W - w) / 2), y: V(90, 300), w: Math.round(w), h: aspect === '16:9' ? Math.round(w * 9 / 16) : h };
}
tpl('archive', 'Archive clip window. params: clip (archive.json id), from (s), aspect (16:9|4:3), caption («ИСПЫТАНИЕ, 1962, ТИХИЙ ОКЕАН»), credit («NARA · общественное достояние»), still (bool: a still image card — slow Ken Burns at assembly)', {
  draw(g, t, info) {
    const r = archiveRect(info.aspect || '16:9'), ui = S().ui;
    g.fillStyle = '#040508'; g.fillRect(0, 0, E.W, E.H);
    if (!info.overlayOnly) {
      g.fillStyle = linGrad(g, 0, r.y, 0, r.y + r.h, ['#11141e', '#0a0c12']); g.fillRect(r.x, r.y, r.w, r.h);
      g.strokeStyle = alpha(ui.cream, 0.15); g.lineWidth = 2; g.strokeRect(r.x - 6, r.y - 6, r.w + 12, r.h + 12);
      text(g, `АРХИВ: ${info.clip || '—'}${info.from != null ? ` @ ${info.from} с` : ''}`, E.W / 2, r.y + r.h / 2, { size: 38, color: alpha(ui.cream, 0.35), font: FONTS.ui, weight: 900, spacing: 3 });
      FX.dust(g, t, { count: 30, color: '#ffffff', a: 0.1 });
    }
    plate(g, info.caption, showAt(t, 0.3, info.dur), { y: E.H - V(115, 220), x: r.x });
    source(g, info.credit, showAt(t, 0.6, info.dur), { y: E.H - V(115, 220), x: r.x + r.w });
  } });
