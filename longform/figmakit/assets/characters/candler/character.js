// Character config — Asa Candler (1899). Approved puppet (Nov 2026, test v6). All points are in each PNG's own pixels.
// Made from 2 Figma AI sheets (src/candler_heads.png = 6 pixel-aligned heads; src/candler_body2.png = jacket + arms), keyed with tools/chroma.py,
// sleeve stubs removed with tools/nostub.py (torso_nostub.png). Re-use in any scene: no new generations needed.
module.exports = {
  name: 'Asa Candler', era: '1890s–1910s',
  look: 'balding, short dark-brown hair at the sides, full dark-brown moustache, small round wire spectacles, charcoal three-piece suit, gold watch chain',
  heads: { neutral: 'head_neutral.png', blink: 'head_blink.png', smile: 'head_smile.png', talk: 'head_talk.png', surprised: 'head_surprised.png', skeptical: 'head_skeptical.png' },
  head: { pivot: [146, 404], scale: 0.74, offset: [0, 6] },          // neck point of the head PNG; drawn at the body's neck
  body: { file: 'torso_nostub.png', scale: 0.84, neck: [327, 30], shoulders: { L: [100, 118], R: [546, 118] } },
  // one straight arm per side (bent in code at the elbow, "bendy bone") + drawn gesture arms that fade in at the end of a bend
  arms: {
    L: { straight: { file: 'arm_L_down.png', top: [73, 14], elbowY: 172, rest: 0.16 },
         gestures: { palm: { file: 'arm_L_palm.png', top: [401, 16], bend: 1.70, swing: 0.12 } } },
    R: { straight: { file: 'arm_R_down.png', top: [67, 14], elbowY: 172, rest: -0.16 },
         gestures: { palm: { file: 'arm_R_palm.png', top: [65, 16], bend: -1.90, swing: -0.12 },
                     point: { file: 'arm_R_point.png', top: [64, 157], bend: -2.46, swing: -0.08, rest: -0.05 } } },
  },
  bendZone: 70,
};
