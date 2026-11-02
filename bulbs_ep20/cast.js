// Episode 20 "The lightbulb cartel" (Phoebus, Geneva 1924) — cast in the channel style (howitsrun_style/): generic re-enactment people, no likenesses.
// Three cartel executives (thin men in 1920s suits, one accessory each), the Swiss test-lab technician, the factory owner who pays the fine,
// the shop clerk and the customer we follow (she buys bulbs, reads at home under one).
const R = require('../hirkit/rig');
const P = require('../howitsrun_style/people');
const C = { red: '#E63946', yellow: '#FFC857' };
// ---------- the cartel executives (dark suits, white shirts; identity = one accessory each) ----------
const EXEC_A = { ...P.LOOKS.office, skin: '#F0C3A2', hair: '#6A6A68', top: '#3A3F4A', cuff: '#2E323B', shirt: '#FFFDF8', pants: '#3A3F4A', shoes: '#171717', brow: '#4A4A48' };   // grey suit + moustache
const EXEC_B = { ...P.LOOKS.office, skin: '#E8B48F', hair: '#C9A15A', top: '#2E3A59', cuff: '#24304A', shirt: '#FFFDF8', pants: '#2E3A59', shoes: '#171717', brow: '#8A6A3A', glasses: 1 }; // navy suit + round glasses
const EXEC_C = { ...P.LOOKS.office, skin: '#E3B08C', hair: '#2A1E16', top: '#5A4636', cuff: '#4A382A', shirt: '#FFFDF8', pants: '#5A4636', shoes: '#3A2414', brow: '#2A1A10' };     // brown suit + hat
const ACC_A = { stache: '#5A5A58', tie: '#7A1E2A' }, ACC_B = { tie: C.red }, ACC_C = { tie: '#2E5A3A', hat: ['#3A3A3E', '#171717'] };
// ---------- the others ----------
const TECH = { skin: '#F0C3A2', hair: '#B8B8BE', hairStyle: 'short', top: '#F4F1E8', cuff: '#E1DDD2', shirt: '#BFD4F2', pants: '#4A4F57', shoes: '#171717', iris: '#3A2414', brow: '#8A8A90', glasses: 1 }; // white lab coat
const OWNER = { skin: '#D9A27E', hair: '#3A2416', hairStyle: 'short', top: '#7A5A3A', cuff: '#5A4026', shirt: '#F4EEDF', pants: '#4A4F57', shoes: '#3A2414', iris: '#3A2414', brow: '#2A1A10' }; // factory owner, brown waistcoat + cap
const ACC_OWNER = { cap: ['#5A4A3A', null] };
const CLERK = { skin: '#E8B48F', hair: '#7A4A2A', hairStyle: 'short', top: '#8A9A7A', cuff: '#6E7C5E', shirt: '#FFFDF8', pants: '#3A3A44', shoes: '#171717', iris: '#3A2414', brow: '#5A3418' }; // shop clerk + bow tie (tie)
const CUSTOMER = { skin: '#EBC09C', hair: '#3A2414', hairStyle: 'bun', top: '#2F8C8A', cuff: '#25706E', pants: '#3A3F5A', shoes: '#5A2A2A', sole: '#2E2018', iris: '#3A2414', brow: '#2A1A10', lashes: 1, lips: '#B2524A' }; // teal coat
const FACE = (n, look = [1, 0], b = 0) => R.expr(n, { look, blink: b });
module.exports = { EXEC_A, EXEC_B, EXEC_C, ACC_A, ACC_B, ACC_C, TECH, OWNER, ACC_OWNER, CLERK, CUSTOMER, FACE };
