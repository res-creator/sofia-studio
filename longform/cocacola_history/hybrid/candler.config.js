// Hybrid rig config for Asa Candler — the only per-character file. All art comes from the two Figma AI sheets already made for the
// puppet test (puppet_test/parts: 6 pixel-aligned expression heads + torso + 5 arm poses). Points are in each part's own pixels.
const P = `${__dirname}/parts`;   // copies of puppet_test/parts with the shoulder sockets rebuilt from the fabric (fix_joints step)
module.exports = {
  heads: { neutral: `${P}/head_neutral.png`, blink: `${P}/head_blink.png`, smile: `${P}/head_smile.png`, talk: `${P}/head_talk.png`, surprised: `${P}/head_surprised.png`, skeptical: `${P}/head_skeptical.png` },
  face: { eyes: [[103, 173], [203, 173]], eyeR: [26, 15], upperR: [64, 54], browY: 146, browR: [50, 18], mouth: [152, 290], mouthR: [104, 62], gaze: [6, 3] },
  head: { pivot: [146, 404], s: 0.74 },
  headDrop: 6,
  parts: { torso: { file: `${P}/torso.png` }, arm_L_down: { file: `${P}/arm_L_down.png` }, arm_R_down: { file: `${P}/arm_R_down.png` },
    arm_L_palm: { file: `${P}/arm_L_palm.png` }, arm_R_palm: { file: `${P}/arm_R_palm.png` }, arm_R_point: { file: `${P}/arm_R_point.png` } },
  // arms sit on the shoulder sockets (repainted in the suit colour), drawn over the jacket like real sleeves
  armsInFront: true,
  torso: { neck: [218, 34], sL: [38, 130], sR: [404, 130] },
  arms: {
    arm_L_down: { shoulder: [110, 45], elbow: [62, 232] }, arm_R_down: { shoulder: [46, 45], elbow: [98, 232] },
    arm_L_palm: { shoulder: [392, 48], elbow: [308, 248] }, arm_R_palm: { shoulder: [48, 48], elbow: [134, 248] },
    arm_R_point: { shoulder: [198, 122], elbow: [84, 318] },
  },
};
