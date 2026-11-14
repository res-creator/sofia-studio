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
  registerShot(s.id, def);
}
