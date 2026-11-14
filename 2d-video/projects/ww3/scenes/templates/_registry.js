// templates/_registry.js — parameterised shot templates. A shot in story/shots.json uses one with
//   { "id": "s123", "start": …, "end": …, "tpl": "petrovDesk", "params": { … }, "cues": { "phone": "трубку" } }
// Cues are words (found in timeline/words.json after the voiceover arrives, via lib.cue → lt()) or seconds into
// the shot; without words every cue falls back to a fraction of the shot length, so templates never break.
// Registration is automatic (scenes/shots/00_auto.js). `DOC[name]` = one-line description + params, for laying out shots.
export const TPL = {};
export const DOC = {};
export function tpl(name, doc, def) { TPL[name] = { kind: '2d', ...def }; DOC[name] = doc; }
