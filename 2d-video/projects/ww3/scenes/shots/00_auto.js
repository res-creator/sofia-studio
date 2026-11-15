// shots/00_auto.js — registers every shot in story/shots.json that names a template ("tpl").
// Shots with hand-written modules (no "tpl") are registered by their own files in this folder.
import { E, registerShot } from '/engine/core.js';
import { TPL } from '../templates/_registry.js';
import '../templates/people.js';
import '../templates/graphics.js';
import '../templates/diagrams.js';
import '../templates/archive.js';

for (const s of E.shots || []) {
  if (!s.tpl) continue;
  const def = TPL[s.tpl];
  if (!def) { console.log('UNKNOWN TEMPLATE', s.id, s.tpl); continue; }
  const off = (s.params && s.params.tOff) || 0;   // продолжение разрезанного шота: анимация не начинается заново
  registerShot(s.id, off ? { ...def, draw: (g, t, info, x) => def.draw(g, t + off, { ...info, dur: info.dur + off }, x) } : def);
}
