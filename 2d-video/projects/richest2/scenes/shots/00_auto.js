// Регистрирует все шоты из story/shots.json по шаблону "tpl".
import { E, registerShot } from '/engine/core.js';
import { TPL } from '../templates/_registry.js';
import '../templates/test.js';
import '../templates/ch0.js';
for (const s of E.shots || []) { if (!s.tpl) continue; const def = TPL[s.tpl]; if (!def) { console.log('UNKNOWN TEMPLATE', s.id, s.tpl); continue; } registerShot(s.id, def); }
