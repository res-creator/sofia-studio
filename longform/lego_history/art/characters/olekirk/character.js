// Character config: Ole Kirk Christiansen (LEGO founder), drawn as in the 1940s after his 1950s portraits
// (combed-back greying hair with a side parting, thick tortoiseshell glasses, clean-shaven, round friendly face).
// Workshop clothes: white shirt, brown knitted tie, herringbone tweed waistcoat. Made from 2 Figma AI sheets (src/), keyed with
// figmakit/tools/chroma.py, sleeve stubs removed with figmakit/tools/nostub.py (30 118 101 262 96 471). Same puppet system as candler (v6).
// All points are in each PNG's own pixels.
module.exports = {
  name: 'Ole Kirk Christiansen', era: '1930s–1950s',
  look: 'greying ash-brown hair combed back with a side parting, thick dark tortoiseshell glasses, clean-shaven, round kind face, white shirt, brown knitted tie, herringbone tweed waistcoat',
  heads: { neutral: 'head_neutral.png', blink: 'head_blink.png', smile: 'head_smile.png', talk: 'head_talk.png', worried: 'head_worried.png', surprised: 'head_surprised.png' },
  head: { pivot: [148, 383], scale: 0.76, offset: [0, 0] },          // the tie-knot point of the head PNG, drawn at the body's knot
  body: { file: 'torso.png', scale: 1.0, neck: [270, 74], shoulders: { L: [80, 112], R: [457, 112] } },
  arms: {
    L: { straight: { file: 'arm_L_down.png', top: [55, 8], elbowY: 120, rest: 0.10 },
         gestures: { palm: { file: 'arm_L_palm.png', top: [378, 8], bend: 1.70, swing: 0.12 } } },
    R: { straight: { file: 'arm_R_down.png', top: [60, 8], elbowY: 120, rest: -0.10 },
         gestures: { palm: { file: 'arm_R_palm.png', top: [48, 8], bend: -1.80, swing: -0.12 },
                     brick: { file: 'arm_R_brick.png', top: [8, 152], bend: -2.40, swing: -0.10, rest: -0.12 } } },
  },
  bendZone: 60,
};
