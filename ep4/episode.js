// Episode 4 "Gus Gets Lost in the City" — full episode, in the approved scene-3 style:
// static backgrounds, one speaker per shot (shot / reverse shot), held poses switched on words,
// listener reactions, mouth from the real voice envelope. One world per location; a close-up is
// only a closer camera on the same world (docs/CLOSEUP_RULE.md).
// node ep4/episode.js plan | still t1,t2,.. out.png | video out.mp4 [from to] | info
require('../lib/fonts');
const { createCanvas } = require('../node_modules/@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const { drawGus } = require('../lib/gus');
const { drawSofia } = require('../lib/sofia');
const { drawRose, drawDog } = require('../lib/rose');
const { drawTom, drawDan, mapProp, phoneProp, burgerProp } = require('../lib/town');
const { OL, paint, line, curve, roundRect, clamp, lerp, ease } = require('../lib/draw');
const U = require('../lib/ui');
const U2 = require('../ep2/ui2');
const F = require('../lib/fonts');
const BO = require('./bg4'), BG_ = require('./bg_green'), BS = require('./bg_shop');
Object.assign(U2.STYLE, {
  rose: { bg: '#7D4E8A', on: '#FFD23F', past: '#FFFFFF', idle: '#FFFFFF' },
  tom: { bg: '#2F9466', on: '#FFE45C', past: '#FFFFFF', idle: '#FFFFFF' },
  dan: { bg: '#1E2E5A', on: '#FFD23F', past: '#FFFFFF', idle: '#FFFFFF' },
  phone: { bg: '#3B4656', on: '#9EE6B8', past: '#FFFFFF', idle: '#C9CDD6' },
});

const W = 1920, H = 1080, FPS = 30, GY = 965;
const VO = JSON.parse(fs.readFileSync(__dirname + '/vo/vo.json'));
const SC = { sofia: 0.44, gus: 0.56, rose: 0.44, tom: 0.44, dan: 0.46, dog: 0.42 };

// ================= pose libraries =================
const GP = { // Gus
  polite: { lids: 0.4, neck: 0.12, wing: 0.28, look: 0.4 },
  hello: { lids: 0.3, neck: 0.2, wing: 0.75, look: 0.2, flap: 0.6 },
  worried: { lids: 0.0, neck: -0.25, wing: 0.12, look: -0.3, sweat: 1 },
  worried2: { lids: 0.05, neck: -0.1, wing: 0.2, look: 0.5, sweat: 1 },
  shrug: { lids: 0.55, neck: 0.0, wing: 0.5, look: 0.2 },
  dreamy: { lids: 0.78, neck: 0.25, wing: 0.15, look: -0.2 },
  excited: { lids: 0.0, neck: 0.3, wing: 0.85, look: 0.6, flap: 1, bounce: 1 },
  eager: { lids: 0.1, neck: 0.25, wing: 0.3, look: 0.6 },
  think: { lids: 0.35, neck: -0.2, wing: 0.4, look: -0.6, count: 1 },
  shock: { lids: 0.0, neck: -0.4, wing: 0.55, look: 0.5, bounce: 0.5 },
  panic: { lids: 0.0, neck: -0.3, wing: 0.9, look: 0.0, flap: 1.2, bounce: 1, sweat: 1 },
  feet: { lids: 0.1, neck: -0.75, wing: 0.1, look: -0.4 },
  deadpan: { lids: 0.6, neck: 0.05, wing: 0.1, look: 0.4 },
  proud: { lids: 0.45, neck: 0.3, wing: 0.45, look: 0.5 },
  thanks: { lids: 0.25, neck: 0.15, wing: 0.7, look: 0.5, flap: 0.5 },
  sniff: { lids: 0.85, neck: 0.45, wing: 0.1, look: 0.8 },
  lookL: { lids: 0.1, neck: -0.05, wing: 0.15, look: -1 },
  lookR: { lids: 0.1, neck: 0.1, wing: 0.15, look: 1 },
  sorry: { lids: 0.45, neck: -0.45, wing: 0.15, look: -0.2 },
  read: { lids: 0.35, neck: -0.3, wing: 0.2, look: 0.3 },
  walk: { lids: 0.4, neck: 0.1, wing: 0.1, look: 0.4 },
  listen: { lids: 0.4, neck: 0.08, wing: 0.1, look: 0.5 },
  followL: { lids: 0.25, neck: -0.15, wing: 0.1, look: 0.1 },
  followR: { lids: 0.15, neck: 0.35, wing: 0.1, look: 1.0, nod: 0.6 },
  nodding: { lids: 0.3, neck: 0.1, wing: 0.15, look: 0.6, nod: 1 },
  unimpressed: { lids: 0.72, neck: 0.0, wing: 0.05, look: 0.5 },
  happy: { lids: 0.2, neck: 0.25, wing: 0.6, look: 0.5, bounce: 0.4 },
  chew: { lids: 0.8, neck: 0.1, wing: 0.1, look: 0.3, chew: 1 },
};
const CP = { // crew rig (Mrs. Rose, Tom, Officer Dan) — they always face screen-left
  rest: { armL: [-110, -10], armR: [110, -10], handL: 'relax', handR: 'relax', armsFront: false, browL: 0.2, browR: 0.2, smile: 0.6, surprise: 0, lean: 0 },
  clasp: { armL: [-26, -150], armR: [26, -150], handL: 'relax', handR: 'relax', armsFront: true, browL: 0.35, browR: 0.35, smile: 0.85 },
  open: { armL: [-215, -175], armR: [215, -175], handL: 'open', handR: 'open', armsFront: true, browL: 0.7, browR: 0.7, smile: 0.4 },
  chin: { armL: [-30, -150], armR: [70, -235], handL: 'relax', handR: 'relax', armsFront: true, browL: 0.55, browR: 0.1, smile: 0.2 },
  ah: { armL: [-30, -140], armR: [215, -225], handL: 'relax', handR: 'open', armsFront: true, browL: 0.9, browR: 0.9, smile: 0.9, surprise: 0.6 },
  happy: { armL: [-26, -150], armR: [26, -150], handL: 'relax', handR: 'relax', armsFront: true, browL: 0.5, browR: 0.5, smile: 1 },
  pointL: { armL: [-320, -255], armR: [60, -120], handL: 'open', handR: 'relax', armsFront: true, browL: 0.4, browR: 0.4, smile: 0.7 },
  pointLup: { armL: [-270, -400], armR: [60, -120], handL: 'open', handR: 'relax', armsFront: true, browL: 0.5, browR: 0.5, smile: 0.7 },
  pointR: { armL: [-60, -120], armR: [320, -265], handL: 'relax', handR: 'open', armsFront: true, browL: 0.4, browR: 0.4, smile: 0.75 },
  playful: { armL: [-26, -150], armR: [300, -300], handL: 'relax', handR: 'open', armsFront: true, browL: 0.7, browR: 0.3, smile: 1, lean: 0.05 },
  wave: { armL: [-26, -150], armR: [270, -470], handL: 'relax', handR: 'open', armsFront: true, browL: 0.5, browR: 0.5, smile: 1, waveHand: 1 },
  listen: { armL: [-30, -140], armR: [30, -140], handL: 'relax', handR: 'relax', armsFront: true, browL: 0.3, browR: 0.3, smile: 0.65, surprise: 0, lean: 0 },
  concern: { armL: [-30, -140], armR: [40, -190], handL: 'relax', handR: 'relax', armsFront: true, browL: 0.65, browR: 0.65, smile: 0.0, lean: -0.02 },
  sorry: { armL: [-180, -170], armR: [180, -170], handL: 'open', handR: 'open', armsFront: true, browL: 0.75, browR: 0.75, smile: 0.1, lean: -0.02 },
  amused: { armL: [-30, -140], armR: [30, -140], handL: 'relax', handR: 'relax', armsFront: true, browL: 0.55, browR: 0.25, smile: 1, lean: -0.02 },
  nodAlong: { armL: [-30, -140], armR: [30, -140], handL: 'relax', handR: 'relax', armsFront: true, browL: 0.45, browR: 0.45, smile: 0.9, nodRose: 1 },
  laugh: { armL: [-30, -140], armR: [60, -230], handL: 'relax', handR: 'relax', armsFront: true, browL: 0.6, browR: 0.6, smile: 1, squint: 0.55, mouthOpen: 0.35, lean: 0.04, laughShake: 1 },
  sigh: { armL: [-26, -150], armR: [26, -150], handL: 'relax', handR: 'relax', armsFront: true, browL: -0.1, browR: -0.1, worry: 1, smile: -0.1, shake: 1 },
  give: { armL: [-30, -140], armR: [-210, -205], handL: 'relax', handR: 'open', armsFront: true, browL: 0.45, browR: 0.45, smile: 0.9, lean: -0.03 },
  five: { armL: [-235, -320], armR: [30, -140], handL: 'open', handR: 'relax', armsFront: true, browL: 0.5, browR: 0.5, smile: 0.8 },
  deadpan: { armL: [-30, -140], armR: [30, -140], handL: 'relax', handR: 'relax', armsFront: true, browL: 0.05, browR: 0.05, smile: 0.25, squint: 0.3 },
  surprised: { armL: [-30, -140], armR: [40, -200], handL: 'relax', handR: 'relax', armsFront: true, browL: 0.95, browR: 0.95, smile: 0.3, surprise: 0.8 },
  write: { armL: [-60, -170], armR: [30, -200], handL: 'relax', handR: 'relax', armsFront: true, browL: 0.4, browR: 0.4, smile: 0.5 },
};
const SP = { // Sofia (hip origin; screen-right = +x)
  rest: { turn: 0.25, look: 0.5, bl: 0, br: 0, angry: 0, worry: 0, smile: 0.5, wide: 0, armL: [-118, -20], armR: [118, -20], handL: 'mitten', handR: 'mitten', front: 0 },
  cam: { turn: 0, look: 0, smile: 0.8, armL: [-118, -20], armR: [118, -20], handL: 'mitten', handR: 'mitten', front: 0 },
  hi: { turn: 0, look: 0, bl: 0.3, br: 0.3, smile: 1, armL: [-118, -20], armR: [180, -420], handL: 'mitten', handR: 'open', front: 1 },
  present: { turn: 0.1, look: 0.4, bl: 0.2, br: 0.2, smile: 0.9, armL: [-118, -20], armR: [220, -200], handL: 'mitten', handR: 'open', front: 1 },
  explain: { turn: 0, look: 0, bl: 0.3, br: 0.3, smile: 0.8, armL: [-190, -170], armR: [190, -170], handL: 'open', handR: 'open', front: 1 },
  excited: { turn: 0, look: 0, bl: 0.5, br: 0.5, smile: 1, wide: 0.3, armL: [-200, -430], armR: [200, -430], handL: 'open', handR: 'open', front: 1 },
  deadpan: { turn: 0.35, look: 0.9, bl: -0.3, br: -0.1, smile: 0.1, sleepy: 0.45, armL: [-150, -60], armR: [150, -60], handL: 'mitten', handR: 'mitten', front: 0 },
  hips: { turn: 0.3, look: 0.8, bl: 0.1, br: 0.4, smile: 0.4, armL: [-150, -60], armR: [150, -60], handL: 'mitten', handR: 'mitten', front: 0 },
  stern: { turn: 0.3, look: 0.8, bl: 0.2, br: 0.2, angry: 0.45, smile: 0.1, armL: [-150, -60], armR: [150, -60], handL: 'mitten', handR: 'mitten', front: 0 },
  pointL: { turn: -0.4, look: -0.9, bl: 0.5, br: 0.5, smile: 1, wide: 0.2, armL: [-230, -320], armR: [118, -20], handL: 'open', handR: 'mitten', front: 1 },
  pointR: { turn: 0.4, look: 0.9, bl: 0.5, br: 0.5, smile: 1, wide: 0.2, armL: [-118, -20], armR: [230, -320], handL: 'mitten', handR: 'open', front: 1 },
  talk: { turn: 0.3, look: 0.8, bl: 0.2, br: 0.2, smile: 0.7, armL: [-118, -20], armR: [190, -190], handL: 'mitten', handR: 'open', front: 1 },
  listen: { turn: 0.3, look: 0.8, bl: 0.1, br: 0.1, smile: 0.55, armL: [-118, -20], armR: [118, -20], handL: 'mitten', handR: 'mitten', front: 0 },
  lookL: { turn: -0.5, look: -1, bl: 0.4, br: 0.4, worry: 0.4, smile: 0.2, armL: [-118, -20], armR: [118, -20], handL: 'mitten', handR: 'mitten', front: 0 },
  lookR: { turn: 0.5, look: 1, bl: 0.4, br: 0.4, worry: 0.4, smile: 0.2, armL: [-118, -20], armR: [118, -20], handL: 'mitten', handR: 'mitten', front: 0 },
  worried: { turn: 0.2, look: 0.4, bl: 0.4, br: 0.4, worry: 1, smile: -0.4, armL: [-34, -180], armR: [34, -180], handL: 'mitten', handR: 'mitten', front: 1 },
  shock: { turn: 0, look: 0, bl: 0.8, br: 0.8, smile: -0.3, o: 0.6, wide: 1, armL: [-110, -380], armR: [110, -380], handL: 'open', handR: 'open', front: 1 },
  phone: { turn: 0.15, look: -0.3, bl: 0.4, br: 0.4, worry: 0.6, smile: 0, armL: [-118, -20], armR: [150, -425], handL: 'mitten', handR: 'fist', front: 1 },
  phoneSad: { turn: 0.15, look: 0.1, bl: 0.1, br: 0.1, worry: 1, smile: -0.4, sleepy: 0.4, armL: [-118, -20], armR: [150, -150], handL: 'mitten', handR: 'fist', front: 1 },
  wave: { turn: 0.4, look: 0.9, bl: 0.6, br: 0.6, worry: 0.3, smile: 0.5, armL: [-118, -20], armR: [210, -460], handL: 'mitten', handR: 'open', front: 1, waveHand: 1 },
  tall: { turn: 0.3, look: 0.8, bl: 0.3, br: 0.3, smile: 0.6, armL: [-118, -20], armR: [250, -420], handL: 'mitten', handR: 'open', front: 1 },
  neck: { turn: 0.3, look: 0.8, bl: 0.5, br: 0.5, smile: 0.7, armL: [-118, -20], armR: [255, -330], handL: 'mitten', handR: 'open', front: 1 },
  tie: { turn: 0.3, look: 0.8, bl: 0.4, br: 0.4, smile: 0.7, armL: [-118, -20], armR: [30, -250], handL: 'mitten', handR: 'open', front: 1 },
  confused: { turn: 0.3, look: 0.8, bl: 0.7, br: -0.1, smile: 0.2, armL: [-190, -150], armR: [190, -150], handL: 'open', handR: 'open', front: 1 },
  idea: { turn: 0.3, look: 0.8, bl: 0.7, br: 0.7, smile: 1, wide: 0.5, armL: [-118, -20], armR: [170, -380], handL: 'mitten', handR: 'open', front: 1 },
  run: { turn: 0.5, look: 1, bl: 0.6, br: 0.6, worry: 0.2, smile: 0.4, armL: [-170, -110], armR: [170, -110], handL: 'fist', handR: 'fist', front: 0 },
  relief: { turn: 0.35, look: 0.9, bl: 0.6, br: 0.6, worry: 0.5, smile: 0.8, armL: [-200, -300], armR: [200, -300], handL: 'open', handR: 'open', front: 1 },
  upset: { turn: 0.3, look: 0.9, bl: 0.3, br: 0.3, angry: 0.5, worry: 0.4, smile: -0.2, armL: [-150, -60], armR: [150, -60], handL: 'mitten', handR: 'mitten', front: 0 },
  proud: { turn: 0.3, look: 0.8, bl: 0.4, br: 0.4, smile: 1, armL: [-34, -180], armR: [34, -180], handL: 'mitten', handR: 'mitten', front: 1, happy: 1 },
  sigh: { turn: 0.3, look: 0.8, bl: -0.1, br: -0.1, worry: 0.3, smile: 0.3, sleepy: 0.5, armL: [-118, -20], armR: [118, -20], handL: 'mitten', handR: 'mitten', front: 0 },
  teach: { turn: 0.05, look: 0, bl: 0.3, br: 0.3, smile: 0.9, armL: [-118, -20], armR: [190, -230], handL: 'mitten', handR: 'open', front: 1 },
  ear: { turn: 0.05, look: 0, bl: 0.5, br: 0.5, smile: 0.9, armL: [-118, -20], armR: [175, -440], handL: 'mitten', handR: 'open', front: 1 },
};
const LIB = { gus: GP, sofia: SP, rose: CP, tom: CP, dan: CP };
const BASE = { gus: 'listen', sofia: 'listen', rose: 'listen', tom: 'listen', dan: 'listen' };

// ================= cameras =================
// close-up / two-shot cameras from character positions (same framing as the approved scene 3)
const camGus = (x, d) => [x + 88 * d, 850, 2.6];
const camHum = (x, d, y = 650) => [x + 80 * d, y, 3.0];
const camTwo = (a, b) => [(a + b) / 2, 765, 1.95];
const camMed = (x, y = 740, z = 1.7) => [x, y, z];

// ================= the script =================
// Each scene: world, cams, cast positions (track), lines (shot, keys [word, pose], cuts [word, cam], gap, extras), reactions.
// Times inside scenes are computed from the real voice durations.
const CARD = {
  help: { en: 'Can I help you?', ipa: '/kən aɪ ˈhelp juː/', icon: 'question' },
  much: { en: 'How much is it?', ipa: '/haʊ ˈmʌtʃ ɪz ɪt/', icon: 'question' },
  card: { en: 'Can I pay by card?', ipa: '/kən aɪ ˈpeɪ baɪ ˈkɑːrd/', icon: 'question' },
  phone: { en: 'Can I use your phone?', ipa: '/kən aɪ ˈjuːz jɔːr ˈfoʊn/', icon: 'question' },
  lost: { en: "I'm lost!", ipa: '/aɪm ˈlɒst/', icon: 'point' },
  helpme: { en: 'Can you help me?', ipa: '/kən juː ˈhelp miː/', icon: 'question' },
  like: { en: 'What does he look like?', ipa: '/wɒt dʌz hiː ˈlʊk laɪk/', icon: 'smile' },
  wrong: { en: 'the wrong way', ipa: '/ðə ˈrɒŋ ˈweɪ/', icon: 'point' },
};
const SCENES = [];
const S = (o) => SCENES.push(o);

// ---- 1. intro + scene 1: GREEN STREET, bus stop -> flower shop ----
const P1 = { sofia: 260, gus: 780, sofia2: 600, gus2: 1120 };
S({
  id: 'street1', world: 'green', pre: 3.7, chip: 'A FEW MINUTES EARLIER...', chipDelay: 1.75,
  cams: {
    wide: [960, 540, 1.5], est: [960, 540, 1], two: camTwo(P1.sofia, P1.gus), sofia: camHum(P1.sofia, 1), gus: camGus(P1.gus, -1), med: [560, 680, 1.45],
    two2: camTwo(P1.sofia2, P1.gus2), sofia2: camHum(P1.sofia2, 1), gus2: camGus(P1.gus2, -1), shop: [860, 640, 1.55], gusR: camGus(P1.gus2, 1),
    sign: [1850, 330, 2.4], street: [1200, 600, 1.25],
  },
  lines: [
    { id: 'i03', shot: 'med', keys: [[0, 'explain'], [9, 'present'], [14, 'explain']], cuts: [[8, 'sofia']] },
    { id: 'i04', shot: 'gus', keys: [[0, 'deadpan']], cuts: [] },
    { id: 'i05', shot: 'sofia', keys: [[0, 'deadpan']] },
    { id: 'i07', shot: 'med', keys: [[0, 'teach'], [9, 'excited']], learn: [[6, 0], [10, 1]] },
    { id: 'a01', shot: 'sofia', keys: [[0, 'talk'], [7, 'stern']], gap: 0.9 },
    { id: 'a02', shot: 'gus', keys: [[0, 'polite']] },
    { id: 'a03', shot: 'sofia', keys: [[0, 'stern'], [3, 'hips']] },
    { id: 'a04', shot: 'gus', keys: [[0, 'polite'], [4, 'proud']] },
    { id: 'a05', shot: 'sofia', keys: [[0, 'sigh']] },
    { id: 'a06', shot: 'two2', keys: [[0, 'pointL']], gap: 3.4 },
    { id: 'a07', shot: 'sofia2', keys: [[0, 'stern'], [3, 'talk']] },
    { id: 'a08', shot: 'gus2', keys: [[0, 'polite'], [3, 'proud']] },
    { id: 'a09', shot: 'gusR', keys: [[0, 'sniff']], gap: 2.6 },
    { id: 'a10', shot: 'sign', keys: [[0, 'excited']], cuts: [] },
    { id: 'a11', shot: 'gusR', keys: [[0, 'eager'], [3, 'excited']] },
    { id: 'a12', shot: 'gusR', keys: [[0, 'dreamy'], [4, 'eager']] },
  ],
  react: [['gus', 'i03', 0, 'listen'], ['gus', 'i03', 9, 'dreamy'], ['sofia', 'i04', 0, 'deadpan'], ['gus', 'i05', 0, 'unimpressed'],
    ['gus', 'a01', 7, 'nodding'], ['sofia', 'a02', 0, 'hips'], ['sofia', 'a04', 4, 'sigh'], ['gus', 'a05', 0, 'unimpressed'], ['gus', 'a06', 2, 'lookL'], ['gus', 'a07', 0, 'listen']],
  post: 3.0,
});
// ---- 2. scene 2: OAK ST, Gus alone and lost ----
const P2 = { gus: 420 };
S({
  id: 'oak2', world: 'oak', pre: 3.2, chip: 'TEN MINUTES LATER...',
  cams: { wide: [960, 540, 1], gus: camGus(P2.gus, 1), gusL: camGus(P2.gus, -1), med: [520, 700, 1.7], insert: 'phone' },
  lines: [
    { id: 'b01', shot: 'gus', keys: [[0, 'lookL'], [5, 'lookR'], [7, 'think']] },
    { id: 'b02', shot: 'gusL', keys: [[0, 'lookL'], [4, 'worried']] },
    { id: 'b03', shot: 'gus', keys: [[0, 'worried']] },
    { id: 'b04', shot: 'med', keys: [[0, 'deadpan'], [5, 'polite']], gap: 0.8 },
    { id: 'b05', shot: 'insert', keys: [[0, 'shock'], [3, 'panic']], cuts: [[3, 'gus']], gap: 0.9 },
    { id: 'b06', shot: 'wide', keys: [[0, 'panic']], card: [[1, 'lost']] },
    { id: 'b07', shot: 'gus', keys: [[0, 'worried2'], [2, 'think']], gap: 0.8 },
    { id: 'b08', shot: 'gus', keys: [[0, 'proud'], [2, 'unimpressed']] },
  ],
  react: [],
  post: 0.6,
});
// ---- 3. scene 3: OAK ST, Mrs. Rose (approved test, no end card) ----
const P3 = { gus: 760, rose: 1330, dog: 1480 };
S({
  id: 'rose3', world: 'oak', pre: 2.4, chip: null, cont: true,
  cams: { wide: [960, 540, 1], gus: [871, 850, 2.6], rose: [1226, 678, 3.0], two: [1045, 765, 1.95] },
  lines: [
    { id: 'g01', shot: 'gus', keys: [[0, 'polite']] },
    { id: 'r01', shot: 'rose', keys: [[0, 'clasp']] },
    { id: 'g02', shot: 'gus', keys: [[0, 'worried'], [4, 'worried2']] },
    { id: 'r02', shot: 'rose', keys: [[0, 'open'], [3, 'clasp'], [10, 'chin']], cuts: [[3, 'gus'], [10, 'rose']] },
    { id: 'g03', shot: 'gus', keys: [[0, 'shrug'], [3, 'dreamy']], bubble: 7 },
    { id: 'r03', shot: 'rose', keys: [[0, 'ah'], [3, 'happy']] },
    { id: 'g04', shot: 'gus', keys: [[0, 'excited'], [3, 'eager']] },
    { id: 'r04', shot: 'two', keys: [[0, 'clasp'], [2, 'pointL'], [5, 'pointLup']], dir: [[3, 0], [6, 1]] },
    { id: 'r05', shot: 'two', keys: [[0, 'pointL'], [5, 'pointR']], dir: [[2, 2], [10, 3]], gap: 0.25 },
    { id: 'g05', shot: 'two', keys: [[0, 'think']], hi: [[1, 0], [3, 1], [7, 2], [12, 3]] },
    { id: 'r06', shot: 'rose', keys: [[0, 'happy'], [2, 'clasp']], nod: [0, 2] },
    { id: 'g06', shot: 'gus', keys: [[0, 'shock'], [2, 'feet']] },
    { id: 'r07', shot: 'rose', keys: [[0, 'clasp'], [2, 'playful']], cuts: [[5, 'gus']] },
    { id: 'g07', shot: 'gus', keys: [[0, 'deadpan'], [10, 'thanks']], cuts: [[8, 'rose'], [10, 'gus']] },
    { id: 'r08', shot: 'rose', keys: [[0, 'clasp'], [3, 'wave']] },
    { id: 'g08', shot: 'wide', keys: [[0, 'walk']], gap: 2.9 },
    { id: 'g09', shot: 'wide', keys: [[0, 'walk']], gap: 0.6 },
  ],
  react: [['rose', 'g02', 0, 'concern'], ['gus', 'r02', 3, 'worried2'], ['rose', 'g03', 7, 'amused'],
    ['gus', 'r04', 0, 'listen'], ['gus', 'r04', 2, 'followL'], ['gus', 'r04', 6, 'nodding'], ['gus', 'r05', 0, 'followL'], ['gus', 'r05', 5, 'followR'],
    ['rose', 'g05', 0, 'nodAlong'], ['gus', 'r07', 5, 'unimpressed'], ['rose', 'g07', 8, 'laugh']],
  post: 5.2,
});
// ---- 4. scene 4: CORNER SHOP ----
const P4 = { gus: 860, tom: 1450 };
S({
  id: 'shop4', world: 'shop', pre: 3.4, chip: 'A FEW MINUTES LATER...',
  cams: { wide: [960, 540, 1], gus: camGus(P4.gus, 1), gusL: camGus(P4.gus, -1), tom: camHum(P4.tom, -1, 668), two: camTwo(P4.gus + 40, P4.tom), rack: [700, 640, 1.8], insert: 'map' },
  lines: [
    { id: 'd01', shot: 'gusL', keys: [[0, 'lookL'], [4, 'lookR'], [6, 'deadpan']] },
    { id: 'd02', shot: 'tom', keys: [[0, 'happy'], [1, 'open']], card: [[1, 'help']] },
    { id: 'd03', shot: 'gus', keys: [[0, 'polite'], [4, 'eager']] },
    { id: 'd04', shot: 'tom', keys: [[0, 'sorry'], [4, 'pointL']] },
    { id: 'd05', shot: 'gus', keys: [[0, 'excited'], [3, 'eager']], card: [[3, 'much']] },
    { id: 'd06', shot: 'tom', keys: [[0, 'five']] },
    { id: 'd07', shot: 'gus', keys: [[0, 'think'], [5, 'proud']], coupon: 5 },
    { id: 'd08', shot: 'tom', keys: [[0, 'sorry']] },
    { id: 'd09', shot: 'gus', keys: [[0, 'eager']], card: [[0, 'card']] },
    { id: 'd10', shot: 'tom', keys: [[0, 'happy']] },
    { id: 'd11', shot: 'gus', keys: [[0, 'shock'], [3, 'feet']] },
    { id: 'd12', shot: 'two', keys: [[0, 'deadpan'], [1, 'give']], gap: 0.9 },
    { id: 'd13', shot: 'gus', keys: [[0, 'excited'], [5, 'thanks']] },
    { id: 'd14', shot: 'tom', keys: [[0, 'happy'], [3, 'open']] },
    { id: 'd15', shot: 'gus', keys: [[0, 'eager'], [3, 'dreamy']] },
    { id: 'd16', shot: 'insert', keys: [[0, 'write']], mapk: [[0, 'here'], [4, 'green']] },
    { id: 'd17', shot: 'insert', keys: [[0, 'write']], mapk: [[4, 'route']], card: [[2, 'wrong']] },
    { id: 'd18', shot: 'gus', keys: [[0, 'deadpan']], gap: 0.6 },
    { id: 'd19', shot: 'gus', keys: [[0, 'polite'], [6, 'eager']], card: [[3, 'phone']], gap: 0.9 },
    { id: 'd20', shot: 'two', keys: [[0, 'give']] },
    { id: 'd21', shot: 'gus', keys: [[0, 'think'], [2, 'worried']], gap: 1.0 },
    { id: 'd22', shot: 'gus', keys: [[0, 'proud'], [7, 'unimpressed']] },
  ],
  react: [['tom', 'd01', 0, 'listen'], ['gus', 'd04', 4, 'lookL'], ['tom', 'd07', 5, 'amused'], ['tom', 'd11', 0, 'concern'], ['gus', 'd12', 1, 'happy'],
    ['tom', 'd18', 0, 'amused'], ['tom', 'd21', 2, 'surprised'], ['tom', 'd22', 4, 'deadpan']],
  post: 3.6,
});
// ---- 5. scene 5: GREEN STREET at the flower shop, Sofia + Officer Dan ----
const P5 = { sofia: 900, sofia2: 960, dan: 1480 };
S({
  id: 'street5', world: 'green', pre: 3.6, chip: 'MEANWHILE...',
  cams: { wide: [960, 540, 1.25], shop: [1120, 640, 1.4], sofiaA: camHum(P5.sofia, 1), two: camTwo(P5.sofia2, P5.dan), sofia: camHum(P5.sofia2, 1), dan: camHum(P5.dan, -1, 668),
    sign: [1850, 330, 2.4], twoW: [1220, 600, 1.35], call: 'call' },
  lines: [
    { id: 'e01', shot: 'shop', keys: [[0, 'excited'], [5, 'lookL'], [6, 'lookR']] },
    { id: 'e02', shot: 'sofiaA', keys: [[0, 'worried'], [3, 'upset']] },
    { id: 'e03', shot: 'call', keys: [[0, 'phone']], gap: 3.0 },
    { id: 'e04', shot: 'sofiaA', keys: [[0, 'phoneSad'], [5, 'sigh']] },
    { id: 'e05', shot: 'two', keys: [[0, 'wave'], [3, 'worried']], gap: 2.0, card: [[3, 'helpme']] },
    { id: 'e06', shot: 'dan', keys: [[0, 'listen'], [2, 'open']], card: [[2, 'like']] },
    { id: 'e07', shot: 'sofia', keys: [[0, 'tall'], [3, 'explain'], [6, 'neck'], [12, 'pointR']], desc: [[2, 0], [5, 1], [10, 2], [14, 3]] },
    { id: 'e08', shot: 'dan', keys: [[0, 'surprised']] },
    { id: 'e09', shot: 'sofia', keys: [[0, 'tie']], desc: [[6, 4]] },
    { id: 'e10', shot: 'dan', keys: [[0, 'deadpan']] },
    { id: 'e11', shot: 'sofia', keys: [[0, 'confused']] },
    { id: 'e12', shot: 'dan', keys: [[0, 'sorry'], [2, 'write']] },
    { id: 'e13', shot: 'sofia', keys: [[0, 'pointL'], [3, 'talk']] },
    { id: 'e14', shot: 'dan', keys: [[0, 'chin']] },
    { id: 'e15', shot: 'sofia', keys: [[0, 'idea'], [1, 'sigh']] },
    { id: 'e16', shot: 'dan', keys: [[0, 'pointR']], cuts: [[1, 'sign']] },
    { id: 'e17', shot: 'sofia', keys: [[0, 'excited'], [3, 'relief']], gap: 0.5 },
  ],
  react: [['dan', 'e05', 0, 'listen'], ['sofia', 'e06', 0, 'worried'], ['dan', 'e07', 6, 'surprised'], ['dan', 'e09', 3, 'deadpan'], ['sofia', 'e10', 1, 'listen'],
    ['dan', 'e11', 2, 'listen'], ['dan', 'e13', 0, 'write'], ['dan', 'e15', 2, 'amused'], ['sofia', 'e16', 0, 'idea'], ['dan', 'e17', 2, 'happy']],
  post: 2.8,
});
// ---- 6. scene 6: GREEN STREET at Big Burger, reunion ----
const P6 = { sofia: 1760, gus: 2280 };
S({
  id: 'burger6', world: 'green', pre: 1.2, chip: null,
  cams: { wide: [1920, 540, 1], gus: camGus(P6.gus, -1), sofia: camHum(P6.sofia, 1), two: camTwo(P6.sofia, P6.gus), med: [2160, 700, 1.5] },
  lines: [
    { id: 'f01', shot: 'med', keys: [[0, 'read'], [10, 'excited']], gap: 3.4, hi: [[1, 0], [4, 1], [9, 2], [10, 3]] },
    { id: 'f02', shot: 'wide', keys: [[0, 'run']], gap: 1.0 },
    { id: 'f03', shot: 'gus', keys: [[0, 'happy']] },
    { id: 'f04', shot: 'sofia', keys: [[0, 'relief'], [3, 'upset']], gap: 1.6 },
    { id: 'f05', shot: 'gus', keys: [[0, 'sorry'], [3, 'dreamy'], [7, 'shock'], [11, 'worried']] },
    { id: 'f06', shot: 'sofia', keys: [[0, 'stern']] },
    { id: 'f07', shot: 'gus', keys: [[0, 'sorry'], [3, 'proud'], [8, 'think'], [15, 'excited']] },
    { id: 'f08', shot: 'sofia', keys: [[0, 'idea'], [8, 'proud']] },
    { id: 'f09', shot: 'gus', keys: [[0, 'thanks'], [2, 'eager']], bubble: 2 },
    { id: 'f10', shot: 'sofia', keys: [[0, 'sigh'], [1, 'stern']] },
    { id: 'f11', shot: 'two', keys: [[0, 'proud'], [2, 'deadpan']], gap: 0.5 },
  ],
  react: [['sofia', 'f05', 4, 'deadpan'], ['gus', 'f06', 0, 'sorry'], ['sofia', 'f07', 8, 'listen'], ['gus', 'f08', 8, 'happy'], ['sofia', 'f09', 2, 'deadpan'], ['gus', 'f10', 2, 'nodding'], ['sofia', 'f11', 2, 'sigh']],
  post: 2.4,
});
// ---- 7. practice + outro at Big Burger ----
const THINK = 4.8; // seconds between the quiz question and the spoken answer
const PRACT = ['p01', 'p02', 'p03', 'p04', 'p05', 'p06', 'p07', 'p08', 'p09', 'p10'];
const P7 = { sofia: 1760, gus: 2280 };
{
  const lines = [{ id: 'p00', shot: 'med', keys: [[0, 'teach'], [5, 'ear'], [9, 'excited']], gap: 1.2 }];
  PRACT.forEach((id, i) => {
    lines.push({ id, shot: 'med', keys: [[0, 'teach']], gap: i ? 1.2 : 1.0, practice: { n: i + 1, pass: 1 } });
    lines.push({ id, shot: 'med', keys: [[0, 'teach']], gap: 3.4, practice: { n: i + 1, pass: 2 } });
  });
  lines.push({ id: 'p11', shot: 'quiz', keys: [[0, 'explain'], [13, 'teach']], gap: 1.4 });
  lines.push({ id: 'p12', shot: 'quiz', keys: [[0, 'teach']], gap: THINK }); // the answer, after ~4.5 s to think
  lines.push({ id: 'o01', shot: 'two', keys: [[0, 'excited'], [2, 'explain']], gap: 3.0 });
  lines.push({ id: 'o02', shot: 'gus', keys: [[0, 'proud']] });
  lines.push({ id: 'o03', shot: 'med', keys: [[0, 'teach'], [5, 'hi']], gap: 0.4, sub: 0 });
  lines.push({ id: 'o04', shot: 'gus', keys: [[0, 'hello'], [1, 'lookL'], [2, 'lookR'], [3, 'worried2']], gap: 0.4 });
  S({
    id: 'practice7', world: 'green', pre: 0.8, chip: null,
    cams: { med: [2050, 640, 1.35], two: camTwo(P7.sofia, P7.gus), gus: camGus(P7.gus, -1), quiz: [2050, 640, 1.35] },
    lines, react: [['gus', 'p00', 0, 'chew'], ['gus', 'o01', 0, 'listen'], ['sofia', 'o02', 0, 'deadpan']],
    post: 3.2,
  });
}

// ---- 0. teaser (flash-forward): Gus lost on Oak St, phone dead — the SAME moment as in scene 2, shown first ----
SCENES.unshift({
  id: 'teaser', world: 'oak', pre: 1.7, chip: null,
  cams: { lost: [760, 600, 1.3], gus: camGus(P2.gus, 1), insert: 'phone' },
  lines: [
    { id: 'b03', teaser: true, shot: 'gus', keys: [[0, 'worried']], gap: 0 },
    { id: 'b05', teaser: true, shot: 'insert', keys: [[0, 'shock'], [3, 'panic']], cuts: [[3, 'gus']], gap: 0.45 },
  ],
  react: [], post: 1.0,
});

// ================= timeline =================
const TRANS = 0.45; // dip-to-white between scenes
const LINES = [];
let t = 0;
for (const sc of SCENES) {
  sc.t0 = t; t += sc.pre; let prevWho = null; sc.lines2 = [];
  for (const Sx of sc.lines) {
    const v = VO[Sx.id]; if (!v) throw new Error('no voice for ' + Sx.id);
    t += Sx.gap !== undefined ? Sx.gap : (prevWho && prevWho !== v.who ? 0.5 : 0.35);
    const L = Object.assign({}, Sx, { who: v.who, text: v.text, t0: t, dur: v.dur, env: v.env, t1: t + v.dur, sc });
    L.words = v.words ? v.words.map(([w, a, b]) => ({ w, t0: t + a, t1: t + Math.max(a + 0.08, b) })) : wordTimes(v.text, v.env, t);
    L.wt = i => L.words[Math.min(i, L.words.length - 1)].t0;
    LINES.push(L); sc.lines2.push(L); t = L.t1; prevWho = v.who;
  }
  t += sc.post; sc.t1 = t;
}
const T = t;
function wordTimes(text, env, t0) { // fallback: spread words over voiced frames by syllable weight
  const ws = text.split(' '), syl = ws.map(w => Math.max(1, (w.toLowerCase().match(/[aeiouy]+/g) || []).length) + 0.5);
  const voiced = env.map(e => e > 0.08 ? 1 : 0.15), cum = [0]; for (const v of voiced) cum.push(cum[cum.length - 1] + v);
  const tot = cum[cum.length - 1], Sm = syl.reduce((a, b) => a + b, 0);
  const at = q => { let i = 0; while (i < cum.length - 1 && cum[i + 1] < q) i++; const f = (q - cum[i]) / (cum[i + 1] - cum[i] || 1); return t0 + (i + f) / FPS; };
  let acc = 0; return ws.map((w, i) => { const a = at(acc / Sm * tot); acc += syl[i]; const b = at(acc / Sm * tot); return { w, t0: a, t1: a + (b - a) * 0.92 }; });
}
const L_ = (id, pass) => LINES.find(l => l.id === id && !l.teaser && (!pass || (l.practice && l.practice.pass === pass))); // story lines only (the teaser re-uses b03/b05)
const wt = (id, i) => L_(id).wt(i);
const SCN = id => SCENES.find(s => s.id === id);
const sceneAt = q => SCENES.find(s => q >= s.t0 && q < s.t1) || SCENES[SCENES.length - 1];

// ================= beats (walks, entrances, props) =================
const BEAT = {};
{ // 1
  const s = SCN('street1');
  BEAT.title = [s.t0, s.t0 + 1.7]; // short title, then the "A FEW MINUTES EARLIER..." chip
  BEAT.walk1 = [L_('a05').t1 + 0.4, L_('a06').t0 - 0.3];
  BEAT.enter = [L_('a07').t1 + 0.1, L_('a07').t1 + 1.6]; // Sofia walks into the shop
  BEAT.sniff = L_('a09').t0 - 2.0;
  BEAT.gone1 = [L_('a12').t1 + 0.2, s.t1];
}
{ // 2
  const s = SCN('oak2');
  BEAT.in2 = [s.t0 + 0.4, s.t0 + 2.9];
  BEAT.phone = wt('b04', 5) - 0.1; BEAT.phoneOff = L_('b06').t0;
  BEAT.walk23 = [L_('b08').t1 + 0.5, SCN('rose3').t0 + 2.2];
}
{ // 3
  const s = SCN('rose3');
  BEAT.rw0 = L_('r08').t1 + 0.5; BEAT.rw1 = L_('g08').t0 - 0.2; BEAT.exit0 = L_('g09').t1 + 0.25; BEAT.exit1 = L_('g09').t1 + 1.6;
  BEAT.bark = BEAT.exit1 + 0.1; BEAT.sigh0 = BEAT.bark + 1.2;
}
{ // 4
  const s = SCN('shop4');
  BEAT.in4 = [s.t0 + 0.6, s.t0 + 3.2];
  BEAT.coupon = [wt('d07', 5) - 0.1, L_('d08').t1 + 0.2];
  BEAT.mapGive = wt('d12', 1) - 0.2; BEAT.mapTake = L_('d12').t1 - 0.2;
  BEAT.phoneGive = L_('d20').t0; BEAT.phoneTake = L_('d20').t1 - 0.1; BEAT.phoneBack = L_('d22').t1 + 0.5;
  BEAT.out4 = [L_('d22').t1 + 1.1, s.t1];
}
{ // 5
  const s = SCN('street5');
  BEAT.out5 = [s.t0 + 0.5, s.t0 + 1.0]; BEAT.walk5 = [s.t0 + 1.0, s.t0 + 2.6];
  BEAT.phone5 = [L_('e03').t0 - 3.0, L_('e04').t0 + 0.6]; BEAT.call0 = L_('e03').t0 - 2.4;
  BEAT.toDan = [L_('e04').t1 + 0.4, L_('e05').t0 - 0.1];
  BEAT.run5 = [L_('e17').t1 + 0.2, s.t1];
}
{ // 6
  const s = SCN('burger6');
  BEAT.gusIn6 = [s.t0 + 0.2, L_('f01').t0 + 0.3];
  BEAT.sofIn6 = [L_('f01').t1 + 0.3, L_('f02').t0 + 0.5];
  BEAT.hug = [L_('f03').t1 + 0.2, L_('f04').t0 - 0.2];
}
{ // 7
  const s = SCN('practice7');
  BEAT.p7 = s.t0; BEAT.sub = wt('o03', 0); BEAT.end = L_('o04').t1;
}

// ================= pose keys =================
const KEYS = {};
function keysFor(who) {
  if (KEYS[who]) return KEYS[who];
  const keys = [], own = LINES.filter(l => l.who === who);
  own.forEach((L, i) => {
    for (const [wi, name] of L.keys) keys.push([wi === 0 ? L.t0 - 0.25 : L.wt(wi) - 0.18, name]);
    const nx = own[i + 1]; if (!nx || nx.t0 - L.t1 > 1.0) keys.push([L.t1 + 0.45, L.practice ? 'teach' : BASE[who]]);
  });
  for (const sc of SCENES) for (const [w, id, wi, name] of sc.react) if (w === who) { const L = sc.lines2.find(l => l.id === id); keys.push([L.wt(wi) - 0.1, name]); }
  for (const [w, tt, name] of EXTRA_KEYS) if (w === who) keys.push([tt, name]);
  return KEYS[who] = keys.sort((a, b) => a[0] - b[0]);
}
const EXTRA_KEYS = [
  ['gus', 0, 'lookL'], ['gus', 0.85, 'lookR'],
  ['sofia', SCN('street1').t0, 'cam'], ['gus', SCN('street1').t0, 'polite'],
  ['sofia', BEAT.walk1[0], 'listen'], ['gus', BEAT.walk1[0], 'walk'],
  ['gus', BEAT.sniff, 'sniff'], ['gus', BEAT.gone1[0], 'dreamy'],
  ['gus', SCN('oak2').t0, 'walk'], ['gus', BEAT.in2[1], 'lookR'],
  ['rose', SCN('oak2').t0, 'rest'], ['gus', BEAT.walk23[0], 'walk'],
  ['rose', BEAT.rw0 + 1.0, 'clasp'], ['rose', BEAT.sigh0 - 0.3, 'sigh'],
  ['gus', SCN('shop4').t0, 'walk'], ['tom', SCN('shop4').t0, 'listen'], ['gus', BEAT.in4[1], 'lookL'], ['tom', BEAT.in4[0] + 0.3, 'happy'],
  ['tom', BEAT.out4[0] + 0.2, 'wave'], ['gus', BEAT.out4[0], 'walk'],
  ['sofia', SCN('street5').t0, 'excited'], ['dan', SCN('street5').t0, 'listen'], ['sofia', BEAT.phone5[0], 'phone'], ['sofia', BEAT.toDan[0], 'lookR'], ['sofia', BEAT.run5[0], 'run'],
  ['gus', SCN('burger6').t0, 'read'], ['sofia', SCN('burger6').t0, 'run'], ['sofia', BEAT.sofIn6[1] + 0.2, 'relief'], ['gus', BEAT.hug[0], 'happy'], ['sofia', BEAT.hug[0], 'relief'],
  ['sofia', BEAT.p7, 'teach'], ['gus', BEAT.p7, 'chew'], ['gus', L_('o04').t1 + 0.3, 'worried2'],
];
const easeSettle = x => { const c1 = 1.0, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
function blend(a, b, u) {
  if (typeof a === 'number' && typeof b === 'number') return lerp(a, b, u);
  if (Array.isArray(a) && Array.isArray(b)) return a.map((x, i) => lerp(x, b[i], u));
  return u < 0.5 ? (a !== undefined ? a : b) : (b !== undefined ? b : a);
}
function blendObj(A, Bo, u) { const o = {}; for (const k of new Set([...Object.keys(A), ...Object.keys(Bo)])) o[k] = blend(A[k] ?? Bo[k] ?? 0, Bo[k] ?? A[k] ?? 0, u); return o; }
function poseFor(who, q) {
  const lib = LIB[who], keys = keysFor(who); let P = lib[BASE[who]];
  for (let i = 0; i < keys.length; i++) {
    const [t0, name] = keys[i]; if (t0 > q) break;
    if (t0 < q - 40) { P = lib[name] || P; continue; } // far past: settled
    const tEnd = Math.min(q, i + 1 < keys.length ? keys[i + 1][0] : q);
    P = blendObj(P, lib[name] || lib[BASE[who]], easeSettle(clamp((tEnd - t0) / 0.32)));
  }
  return P;
}
function talkLevel(who, q) {
  for (const L of LINES) if (L.who === who && q >= L.t0 && q < L.t1) { const i = Math.floor((q - L.t0) * FPS); return clamp((L.env[i] || 0) * 1.25); }
  return 0;
}
const activeLine = q => LINES.find(l => q >= l.t0 - 0.1 && q < l.t1 + 0.4);
const blink = (q, s) => { const p = 3.3 + s * 0.41, u = (q + s * 1.7) % p; return u < 0.06 ? u / 0.06 : u < 0.14 ? 1 - (u - 0.06) / 0.08 : 0; };
const walkX = (q, [t0, t1], x0, x1, e = ease.inOut) => lerp(x0, x1, e(clamp((q - t0) / Math.max(0.01, t1 - t0))));
const inB = (q, [a, b]) => q >= a && q < b;

// ================= character placement per scene =================
// returns { who: { x, face, walking, alpha, ... } } for the characters present at time q
function cast(sc, q) {
  const C = {};
  if (sc.id === 'street1') {
    let sx = P1.sofia, gx = P1.gus, sw = false, gw = false, gface = -1, salpha = 1;
    if (q >= BEAT.walk1[0]) { sx = walkX(q, BEAT.walk1, P1.sofia, P1.sofia2); gx = walkX(q, [BEAT.walk1[0] + 0.25, BEAT.walk1[1]], P1.gus, P1.gus2); sw = inB(q, BEAT.walk1); gw = inB(q, [BEAT.walk1[0] + 0.25, BEAT.walk1[1]]); gface = gw ? 1 : -1; }
    if (q >= BEAT.enter[0]) { sx = walkX(q, [BEAT.enter[0], BEAT.enter[0] + 1.0], P1.sofia2, BG_.DOOR_FLOWERS); sw = inB(q, [BEAT.enter[0], BEAT.enter[0] + 1.0]); salpha = 1 - clamp((q - BEAT.enter[0] - 1.0) / 0.35); }
    if (q >= BEAT.sniff - 0.4) gface = 1;
    if (q >= BEAT.gone1[0]) { gx = walkX(q, [BEAT.gone1[0], BEAT.gone1[0] + 2.8], P1.gus2, 1750, ease.in); gw = true; }
    if (salpha > 0) C.sofia = { x: sx, walking: sw, alpha: salpha, back: q >= BEAT.enter[0] + 0.7 };
    C.gus = { x: gx, face: gface, walking: gw };
  } else if (sc.id === 'teaser') {
    C.gus = { x: P2.gus, face: 1 };
  } else if (sc.id === 'oak2' || sc.id === 'rose3') {
    let gx, gw = false, face = 1;
    if (sc.id === 'oak2') {
      gx = walkX(q, BEAT.in2, -180, P2.gus, ease.out); gw = inB(q, BEAT.in2);
      const b = L_('b02'); if (q >= b.t0 - 0.3 && q < b.t1 + 0.2) face = -1;
      if (q >= BEAT.walk23[0]) { gx = walkX(q, BEAT.walk23, P2.gus, P3.gus); gw = inB(q, BEAT.walk23); }
    } else {
      gx = walkX(q, BEAT.walk23, P2.gus, P3.gus); gw = inB(q, BEAT.walk23);
      if (q >= BEAT.rw0 && q < BEAT.rw1) { gx = walkX(q, [BEAT.rw0, BEAT.rw1], P3.gus, 1720); gw = q > BEAT.rw0 + 0.05 && q < BEAT.rw1 - 0.05; }
      else if (q >= BEAT.rw1 && q < BEAT.exit0) { gx = 1720; if (q >= wt('g08', 4) - 0.1 && q < wt('g08', 6) - 0.1) face = -1; }
      else if (q >= BEAT.exit0) { gx = walkX(q, [BEAT.exit0, BEAT.exit1], 1720, 2300, ease.in); gw = true; }
    }
    C.gus = { x: gx, face, walking: gw };
    C.rose = { x: P3.rose }; C.dog = { x: P3.dog };
  } else if (sc.id === 'shop4') {
    let gx = walkX(q, BEAT.in4, BS.DOOR_X, P4.gus, ease.out), gw = inB(q, BEAT.in4), face = 1;
    const d = L_('d01'); if (q < d.t1 + 0.2 && q >= BEAT.in4[1] - 0.2) face = q < d.wt(4) ? -1 : 1;
    let alpha = clamp((q - BEAT.in4[0]) / 0.3);
    if (q >= BEAT.out4[0]) { gx = walkX(q, [BEAT.out4[0], BEAT.out4[0] + 2.2], P4.gus, BS.DOOR_X); gw = true; face = -1; alpha = 1 - clamp((q - BEAT.out4[0] - 2.2) / 0.3); }
    C.gus = { x: gx, face, walking: gw, alpha };
    C.tom = { x: P4.tom };
  } else if (sc.id === 'street5') {
    let sx = BG_.DOOR_FLOWERS, sw = false, alpha = clamp((q - BEAT.out5[0]) / 0.35);
    if (q >= BEAT.walk5[0]) { sx = walkX(q, BEAT.walk5, BG_.DOOR_FLOWERS, P5.sofia); sw = inB(q, BEAT.walk5); }
    if (q >= BEAT.toDan[0]) { sx = walkX(q, BEAT.toDan, P5.sofia, P5.sofia2); sw = inB(q, BEAT.toDan); }
    if (q >= BEAT.run5[0]) { sx = walkX(q, [BEAT.run5[0], BEAT.run5[0] + 1.6], P5.sofia2, 2200, ease.in); sw = true; }
    C.sofia = { x: sx, walking: sw, alpha, flowers: true, run: q >= BEAT.run5[0] };
    C.dan = { x: P5.dan };
  } else if (sc.id === 'burger6' || sc.id === 'practice7') {
    if (sc.id === 'burger6') {
      const gx = walkX(q, BEAT.gusIn6, 3060, P6.gus, ease.out), gw = inB(q, BEAT.gusIn6);
      const sx = walkX(q, BEAT.sofIn6, 900, P6.sofia, ease.out), sw = inB(q, BEAT.sofIn6);
      C.gus = { x: gx, face: -1, walking: gw, map: true };
      if (q >= BEAT.sofIn6[0]) C.sofia = { x: sx, walking: sw, flowers: true, run: sw };
    } else {
      C.gus = { x: P7.gus, face: -1, burger: q < L_('o01').t0 };
      C.sofia = { x: P7.sofia, flowers: false };
    }
  }
  return C;
}

// ================= props =================
function bouquet(c) { // drawn upright at the hand
  for (let i = 0; i < 5; i++) { const a = -0.5 + i * 0.25; line(c, [[0, 10], [Math.sin(a) * 34, -50 - Math.cos(a) * 14]], 5, '#4FA36B'); }
  paint(c, p => { p.moveTo(-18, -14); p.lineTo(18, -14); p.lineTo(8, 34); p.lineTo(-8, 34); p.closePath(); }, '#FFF4E0', { lw: 4 });
  const cols = ['#FF5C7A', '#FFD23F', '#B07CE0', '#FF8FA3', '#FF9A2E'];
  for (let i = 0; i < 5; i++) { const a = -0.5 + i * 0.25, fx = Math.sin(a) * 38, fy = -56 - Math.cos(a) * 16;
    paint(c, p => { for (let k = 0; k < 5; k++) { const b = k * 1.2566; p.moveTo(fx + Math.cos(b) * 10 + 8, fy + Math.sin(b) * 10); p.arc(fx + Math.cos(b) * 10, fy + Math.sin(b) * 10, 8, 0, 7); } }, cols[i], { lw: 3 });
    paint(c, p => p.arc(fx, fy, 5, 0, 7), '#FFF2B8', { lw: 2 }); }
}
function coupon(c) {
  paint(c, p => roundRect(p, -60, -30, 120, 60, 6), '#FFD23F', { lw: 4.5 });
  line(c, [[-30, -30], [-30, 30]], 3, '#C93A3F');
  c.fillStyle = '#C93A3F'; c.font = `800 18px ${F.EN}`; c.textAlign = 'center'; c.fillText('BURGER', 14, -2); c.fillText('2 FOR 1', 14, 20);
}
function money(c) { // three one-dollar notes fanned
  for (let i = 0; i < 3; i++) { c.save(); c.rotate(-0.25 + i * 0.25); paint(c, p => roundRect(p, -46, -24, 92, 48, 5), '#9EE6B8', { lw: 4 }); c.fillStyle = '#2F9466'; c.font = `800 26px ${F.EN}`; c.textAlign = 'center'; c.fillText('$1', 0, 9); c.restore(); }
}

// ================= overlays =================
function sweat(c, X, Y, q) { const k = (q * 0.9) % 1; c.save(); c.globalAlpha = 1 - k; paint(c, p => { p.moveTo(X, Y + k * 40); p.quadraticCurveTo(X + 16, Y + 26 + k * 40, X, Y + 34 + k * 40); p.quadraticCurveTo(X - 16, Y + 26 + k * 40, X, Y + k * 40); p.closePath(); }, '#8FD0F7', { lw: 4 }); c.restore(); }
function thought(c, X, Y, k, q, side = 1) {
  if (k <= 0) return; const a = ease.back(clamp(k));
  c.save(); c.translate(X, Y); c.scale(a, a);
  for (const [dx, dy, r] of [[-150 * side, 150, 14], [-120 * side, 110, 22]]) paint(c, p => p.arc(dx, dy, r, 0, 7), '#FFFFFF', { lw: 5 });
  paint(c, p => { for (const [dx, dy, r] of [[-60, 0, 70], [0, -40, 80], [70, -10, 75], [40, 50, 70], [-30, 50, 66]]) { p.moveTo(dx + r, dy); p.arc(dx, dy, r, 0, 7); } }, '#FFFFFF', { lw: 6 });
  c.save(); c.beginPath(); for (const [dx, dy, r] of [[-60, 0, 64], [0, -40, 74], [70, -10, 69], [40, 50, 64], [-30, 50, 60]]) { c.moveTo(dx + r, dy); c.arc(dx, dy, r, 0, 7); } c.fillStyle = '#FFFFFF'; c.fill(); c.restore();
  burgerProp(c, 8, 6 + Math.sin(q * 3) * 4, 0.95);
  c.restore();
}
function smell(c, X, Y, q, k) { // wavy smell lines drifting left from the burger sign side
  if (k <= 0) return;
  c.save(); c.globalAlpha = 0.8 * k;
  for (let i = 0; i < 3; i++) {
    const y = Y + i * 34, ph = q * 4 + i;
    c.beginPath(); for (let s = 0; s <= 30; s++) { const x = X - s * 14, yy = y + Math.sin(ph + s * 0.5) * 9; s ? c.lineTo(x, yy) : c.moveTo(x, yy); }
    c.lineWidth = 7; c.strokeStyle = '#F2C744'; c.lineCap = 'round'; c.stroke();
  }
  c.restore();
}
function arrowIcon(c, kind, X, Y, s) {
  c.save(); c.translate(X, Y); c.scale(s, s);
  paint(c, q => q.arc(0, 0, 34, 0, 7), '#FFFFFF', { lw: 5 });
  const G = '#2F9466';
  if (kind === 'tree') { paint(c, q => q.rect(-5, 2, 10, 20), '#8A5A34', { lw: 3 }); paint(c, q => q.arc(0, -6, 17, 0, 7), '#5DBB63', { lw: 4 }); }
  else if (kind === 'dot') { paint(c, q => q.arc(0, 0, 20, 0, 7), '#FFFFFF', { lw: 0 }); }
  else if (kind.startsWith('#')) { paint(c, q => q.arc(0, 0, 20, 0, 7), kind, { lw: 4 }); }
  else if (kind === 'tall') { paint(c, q => { q.moveTo(0, -26); q.lineTo(14, -10); q.lineTo(5, -10); q.lineTo(5, 10); q.lineTo(14, 10); q.lineTo(0, 26); q.lineTo(-14, 10); q.lineTo(-5, 10); q.lineTo(-5, -10); q.lineTo(-14, -10); q.closePath(); }, G, { lw: 3.5 }); }
  else if (kind === 'neck') { c.save(); c.lineCap = 'round'; c.beginPath(); c.moveTo(-8, 22); c.bezierCurveTo(16, 6, -14, -6, 6, -18); c.lineWidth = 16; c.strokeStyle = OL; c.stroke(); c.lineWidth = 10; c.strokeStyle = '#FFFFFF'; c.stroke(); c.restore(); }
  else {
    c.rotate({ up: 0, left: -Math.PI / 2, right: Math.PI / 2 }[kind]);
    paint(c, q => { q.moveTo(0, -24); q.lineTo(18, -4); q.lineTo(7, -4); q.lineTo(7, 22); q.lineTo(-7, 22); q.lineTo(-7, -4); q.lineTo(-18, -4); q.closePath(); }, G, { lw: 4 });
  }
  c.restore();
}
// checklist panel (directions in scenes 3 + 6, the goose description in scene 5, "you will learn" in the intro)
const PANELS = {
  dir: { title: 'DIRECTIONS', col: '#2F9466', items: [['GO STRAIGHT', 'up'], ['TURN LEFT', 'left'], ['GO PAST THE PARK', 'tree'], ['ON YOUR RIGHT', 'right']] },
  desc: { title: 'MY FRIEND...', col: '#1E2E5A', items: [['IS TALL', 'tall'], ['IS WHITE', '#FFFFFF'], ['HAS A LONG NECK', 'neck'], ['HAS AN ORANGE BEAK', '#FF9A2E'], ['WEARS A BLUE TIE', '#2E6FD8']] },
  learn: { title: 'IN THIS STORY', col: '#E07B3C', items: [['ASK FOR DIRECTIONS', 'right'], ['ASK FOR HELP', 'up']] },
};
function panel(c, q, kind, side, sc) {
  const P = PANELS[kind], shown = [], hi = [];
  const key = { dir: 'dir', desc: 'desc', learn: 'learn' }[kind];
  for (const L of sc.lines2) { for (const [wi, ci] of L[key] || []) if (q >= L.wt(wi)) shown[ci] = L.wt(wi); if (kind === 'dir') for (const [wi, ci] of L.hi || []) if (q >= L.wt(wi) - 0.05) hi[ci] = L.wt(wi); }
  if (kind === 'dir' && sc.id === 'burger6') P.items.forEach((_, i) => { if (shown[i] === undefined && hi[i] !== undefined) shown[i] = hi[i] - 0.3; });
  if (!shown.some(x => x !== undefined)) return;
  const endL = kind === 'dir' ? sc.lines2.filter(l => l.hi).slice(-1)[0] : kind === 'desc' ? L_('e09') : L_('i07');
  const fade = 1 - clamp((q - endL.t1 - 0.6) / 0.35); if (fade <= 0) return;
  const Wd = 660, X = side === 'left' ? 50 : side === 'center' ? 630 : 1210, Y = 60;
  c.save(); c.globalAlpha = fade;
  const n = shown.filter(x => x !== undefined).length, h = 92 + n * 92;
  paint(c, p => roundRect(p, X, Y, Wd, h, 30), 'rgba(255,255,255,0.95)', { lw: 7 });
  c.save(); c.beginPath(); roundRect(c, X, Y, Wd, h, 30); c.clip(); c.fillStyle = P.col; c.fillRect(X, Y, Wd, 72); c.restore();
  line(c, [[X, Y + 72], [X + Wd, Y + 72]], 6, OL);
  U.textOutlined(c, P.title, X + 32, Y + 52, 40, '#FFFFFF', { align: 'left', olw: 7 });
  let row = 0;
  P.items.forEach(([label, icon], i) => {
    if (shown[i] === undefined) return;
    const k = ease.back(clamp((q - shown[i]) / 0.3)), y = Y + 72 + 50 + row * 92, on = hi[i] !== undefined; row++;
    const pop = on ? 1 + 0.12 * Math.max(0, 1 - (q - hi[i]) / 0.3) : 1;
    c.save(); c.translate(X + 60, y); c.scale(k * pop, k * pop);
    arrowIcon(c, icon, 0, 0, 1);
    U.textOutlined(c, label, 56, 17, label.length > 16 ? 40 : 46, on ? '#FF7A2F' : '#3a221d', on ? { align: 'left', olw: 8, w: 800 } : { align: 'left', ol: false, w: 800 });
    if (on) { paint(c, p => p.arc(Wd - 110, 0, 20, 0, 7), '#2F9466', { lw: 4 }); line(c, [[Wd - 120, 0], [Wd - 112, 9], [Wd - 98, -9]], 6, '#FFFFFF'); }
    c.restore();
  });
  c.restore();
}
function chip(c, q, sc) { // "TEN MINUTES LATER..." sticker at the start of a scene
  if (!sc.chip) return; const u = q - sc.t0 - (sc.chipDelay || 0); if (u < 0 || u > 3.4) return;
  const k = ease.back(clamp((u - 0.25) / 0.35)) * (1 - ease.in(clamp((u - 2.9) / 0.4)));
  if (k <= 0) return;
  c.save(); c.translate(960, 150); c.scale(k, k); c.rotate(-0.03);
  c.font = `800 64px ${F.EN}`; const w = c.measureText(sc.chip).width + 90;
  paint(c, p => roundRect(p, -w / 2, -58, w, 116, 30), '#FFD23F', { lw: 8 });
  U.textOutlined(c, sc.chip, 0, 22, 60, '#3a221d', { ol: false, w: 800 });
  c.restore();
}
function titleCard(c, q) {
  const [a, b] = BEAT.title; if (q < a || q > b + 0.4) return;
  const k = ease.back(clamp((q - a - 0.15) / 0.4)), o = 1 - clamp((q - b) / 0.3), k2 = ease.back(clamp((q - a - 0.45) / 0.35));
  c.save(); c.globalAlpha = o;
  c.save(); c.translate(960, 330); c.scale(k, k); c.rotate(-0.02);
  paint(c, p => roundRect(p, -720, -110, 1440, 220, 50), '#FFFFFF', { lw: 10 });
  U.textOutlined(c, 'GUS GETS LOST', 0, -4, 112, '#E5484D', { olw: 14 });
  U.textOutlined(c, 'IN THE CITY', 0, 84, 70, '#2E6FD8', { olw: 10 });
  c.restore();
  c.save(); c.translate(960, 520); c.scale(k2, k2);
  paint(c, p => roundRect(p, -300, -40, 600, 80, 40), '#2F9466', { lw: 7 });
  U.textOutlined(c, 'EASY ENGLISH · A1–A2', 0, 18, 44, '#FFFFFF', { olw: 7 });
  c.restore(); c.restore();
}
function phraseCards(c, q, side) {
  for (const L of LINES) for (const [wi, name] of L.card || []) {
    const t0 = L.wt(wi) - 0.15, t1 = Math.max(L.t1 + 1.2, t0 + 3.2);
    if (q >= t0 - 0.05 && q < t1 + 0.4) { c.save(); if (side === 'top') c.translate(960 - 1470, -70); U2.phraseCard(c, CARD[name], (q - t0) / 0.35, (q - t1) / 0.3, q, side === 'top' ? 'right' : side); c.restore(); }
  }
}
function phoneInsert(c, q, sc) { // full-frame insert: Gus's phone, battery empty (scene 2 and the teaser)
  const L = sc.lines2.find(l => l.id === 'b05');
  c.fillStyle = '#8FD0F7'; c.fillRect(0, 0, W, H);
  c.save(); c.globalAlpha = 0.18; c.fillStyle = '#FFFFFF'; for (let i = 0; i < 14; i++) { c.save(); c.translate(960, 540); c.rotate(i * Math.PI / 7 + q * 0.2); c.fillRect(0, -40, 1400, 80); c.restore(); } c.restore();
  const shake = q < L.wt(3) + 0.4 ? Math.sin(q * 50) * 6 * clamp((q - L.t0) / 0.2) : 0;
  c.save(); c.translate(960 + shake, 560); c.rotate(0.06);
  // wing tip holding the phone
  paint(c, p => p.ellipse(-60, 330, 260, 120, -0.2, 0, 7), '#FFFFFF', { shade: '#D9DEE6', sx: 0, sy: -14, lw: 8 });
  c.scale(5.2, 5.2); phoneProp(c, 1, 'empty'); c.restore();
  const k = ease.back(clamp((q - L.wt(3)) / 0.3));
  c.save(); c.translate(1420, 300); c.scale(k, k); c.rotate(0.08);
  U.textOutlined(c, '0%', 0, 0, 150, '#E5484D', { olw: 16 }); c.restore();
}
// One town, one map (map units, origin = map centre). Gus walks EAST along Oak St to the bank corner.
// Turn LEFT there = north, past the park to Green St and Big Burger (Mrs. Rose's way).
// Turn RIGHT = south, down to the corner shop (what Gus did).
const MAP = { oak: 200, cross: -120, green: -220, shop: [-90, 300], burger: [490, -335], bank: [-245, 100] };
function drawTownMap(c) {
  paint(c, p => roundRect(p, -760, -430, 1520, 860, 18), '#FFF6DE', { shade: '#EADBB8', sx: 14, sy: 10, lw: 8 });
  for (const x of [-253, 253]) line(c, [[x, -430], [x, 430]], 4, '#D8C79E');
  line(c, [[-700, MAP.oak], [700, MAP.oak]], 46, '#F2C744'); line(c, [[MAP.cross, 400], [MAP.cross, -400]], 46, '#F2C744'); line(c, [[MAP.cross, MAP.green], [700, MAP.green]], 46, '#F2C744');
  c.fillStyle = '#8A6A2E'; c.font = `800 34px ${F.EN}`; c.textAlign = 'center';
  c.fillText('OAK ST', -560, MAP.oak + 75); c.fillText('GREEN ST', 560, MAP.green + 75);
  paint(c, p => roundRect(p, 40, -150, 260, 300, 30), '#8ED28A', { lw: 5 }); for (const [x, y] of [[110, -60], [220, 20], [140, 80]]) paint(c, p => p.arc(x, y, 30, 0, 7), '#5DBB63', { lw: 4 });
  c.fillStyle = '#2F7A3A'; c.fillText('PARK', 170, -100);
  paint(c, p => p.rect(-330, 40, 170, 120), '#EDE3CF', { lw: 5 }); c.fillStyle = '#8A6A2E'; c.fillText('BANK', -245, 112);
  paint(c, p => p.rect(380, -400, 220, 130), '#E5484D', { lw: 5 }); c.fillStyle = '#FFFFFF'; c.font = `800 30px ${F.EN}`; c.fillText('BIG BURGER', 490, -325);
  paint(c, p => p.rect(-80, 245, 180, 110), '#2F9466', { lw: 5 }); c.fillStyle = '#FFFFFF'; c.fillText('SHOP', 10, 312);
}
function arrowHead(c, a, b, col, s = 1) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  c.save(); c.translate(b[0], b[1]); c.rotate(ang); c.scale(s, s);
  paint(c, p => { p.moveTo(22, 0); p.lineTo(-22, -24); p.lineTo(-12, 0); p.lineTo(-22, 24); p.closePath(); }, col, { lw: 5 }); c.restore();
}
function goosePin(c, x, y) { // tiny Gus head marker
  paint(c, p => p.arc(x, y, 34, 0, 7), '#FFFFFF', { lw: 5 });
  paint(c, p => { p.moveTo(x + 16, y - 2); p.lineTo(x + 50, y + 6); p.lineTo(x + 16, y + 14); p.closePath(); }, '#FF9A2E', { lw: 4 });
  c.beginPath(); c.arc(x + 8, y - 8, 5, 0, 7); c.fillStyle = OL; c.fill();
}
const WAY_LEFT = [[MAP.cross, MAP.oak], [MAP.cross, MAP.green], [MAP.burger[0] - 110, MAP.green]]; // from the bank corner
const WAY_RIGHT = [[MAP.cross, MAP.oak], [MAP.cross, MAP.shop[1] - 60]];
function mapInsert(c, q) { // full-frame insert: the free map — "you are here" (shop), Tom shows the right way
  c.fillStyle = '#E9D9B4'; c.fillRect(0, 0, W, H);
  c.save(); c.translate(960, 425); c.scale(0.86, 0.86); c.rotate(-0.02); // kept above the two-line caption
  drawTownMap(c);
  const L16 = L_('d16'), L17 = L_('d17');
  if (q >= L16.wt(0) - 0.1) { const k = ease.back(clamp((q - L16.wt(0) + 0.1) / 0.3)); c.save(); c.translate(MAP.shop[0] + 260, MAP.shop[1] + 30); c.scale(k, k);
    paint(c, p => { p.moveTo(0, 0); p.bezierCurveTo(-40, -50, -40, -100, 0, -100); p.bezierCurveTo(40, -100, 40, -50, 0, 0); p.closePath(); }, '#E5484D', { lw: 6 }); paint(c, p => p.arc(0, -66, 14, 0, 7), '#FFFFFF', { lw: 4 });
    U.textOutlined(c, 'YOU ARE HERE', 50, -40, 40, '#E5484D', { olw: 8, align: 'left' }); c.restore(); }
  if (q >= L16.wt(4) - 0.1) { const k = clamp((q - L16.wt(4) + 0.1) / 0.3); c.save(); c.globalAlpha = k; c.beginPath(); c.ellipse(420, MAP.green, 230, 56, 0, 0, 7); c.lineWidth = 8; c.strokeStyle = '#2E6FD8'; c.stroke(); c.restore(); }
  // Gus's way (red, crossed): along Oak St, RIGHT at the bank, down to the shop. The right way (green): back up, LEFT at the bank.
  if (q >= L17.wt(4) - 0.1) {
    const k2 = clamp((q - L17.wt(4) + 0.1) / 0.8);
    drawPath(c, [[-650, MAP.oak], ...WAY_RIGHT], k2, '#E5484D');
    if (k2 >= 1) { const [x, y] = [MAP.cross, MAP.oak + 100]; line(c, [[x - 26, y - 26], [x + 26, y + 26]], 12, '#E5484D'); line(c, [[x + 26, y - 26], [x - 26, y + 26]], 12, '#E5484D'); }
    const k = clamp((q - L17.wt(6)) / 1.0);
    if (k > 0) { drawPath(c, [[-650, MAP.oak], ...WAY_LEFT], k, '#2F9466'); if (k >= 1) arrowHead(c, WAY_LEFT[1], WAY_LEFT[2], '#2F9466'); }
  }
  c.restore();
}
function drawPath(c, pts, k, col) {
  let total = 0; for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  let left = total * k; c.save(); c.setLineDash([30, 18]); c.lineWidth = 14; c.strokeStyle = col; c.lineCap = 'round'; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length && left > 0; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]), u = Math.min(1, left / d); c.lineTo(lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)); left -= d; }
  c.stroke(); c.restore();
}
function practiceCard(c, q) {
  const L = activeLine(q) || LINES.find(l => l.practice && q >= l.t0 - 1.5 && q < l.t0);
  let P = null;
  for (const Lp of LINES) if (Lp.practice && Lp.practice.pass === 1) { const L2 = L_(Lp.id, 2); if (q >= Lp.t0 - 0.6 && q < L2.t1 + 0.5) P = { L1: Lp, L2 }; }
  // banner
  const p00 = L_('p00'), last = L_('p10', 2);
  if (q >= p00.t0 - 0.3 && q < last.t1 + 0.8) {
    const k = ease.back(clamp((q - p00.t0 + 0.3) / 0.4)) * (1 - clamp((q - last.t1 - 0.4) / 0.4));
    c.save(); c.translate(960, 86); c.scale(k, k);
    paint(c, p => roundRect(p, -330, -50, 660, 100, 50), '#E07B3C', { lw: 8 });
    U.textOutlined(c, 'LISTEN & REPEAT', 0, 22, 56, '#FFFFFF', { olw: 8 });
    c.restore();
  }
  if (!P) return;
  const { L1, L2 } = P, k = ease.back(clamp((q - L1.t0 + 0.6) / 0.35)) * (1 - ease.in(clamp((q - L2.t1 - 0.2) / 0.3)));
  if (k > 0) {
    c.save(); c.translate(1340, 330); c.scale(k, k); c.rotate(-0.015);
    paint(c, p => roundRect(p, -520, -130, 1040, 260, 40), '#FFFFFF', { lw: 8 });
    paint(c, p => p.arc(-450, -110, 52, 0, 7), '#2F9466', { lw: 7 });
    U.textOutlined(c, String(L1.practice.n), -450, -90, 54, '#FFFFFF', { ol: false, w: 800 });
    const txt = L1.text, fs = txt.length > 30 ? 56 : txt.length > 22 ? 66 : 80;
    U.textOutlined(c, txt, 0, 24, fs, '#E07B3C', { olw: 10 });
    U.textOutlined(c, `${L1.practice.n} / ${PRACT.length}`, 430, 100, 32, '#8A6A5C', { ol: false, w: 800 });
    c.restore();
  }
  // YOUR TURN between pass 1 and pass 2
  const a = L1.t1 + 0.15, b = L2.t0 - 0.15;
  if (q > a && q < b) U.yourTurn(c, L1.text.length > 24 ? 'Say it!' : L1.text, (q - a) / (b - a), q);
}
const QUIZ = () => { const L = L_('p11'), A = L_('p12'); return { L, A, ans: A.t0 - 0.35, mapIn: A.wt(1), end: A.t1 + 2.5 }; };
function quizCard(c, q) { // big, clear quiz card; each part lights up when Sofia says it; then ~4.5 s to think; then NO turns green
  const { L, A, ans, mapIn, end } = QUIZ(); if (q < L.t0 - 0.4 || q > end + 0.4) return;
  const dim = clamp((q - L.t0 + 0.4) / 0.3) * (1 - clamp((q - end) / 0.4));
  c.save(); c.globalAlpha = 0.62 * dim; c.fillStyle = '#1E1828'; c.fillRect(0, 0, W, H); c.restore();
  if (q > mapIn + 0.35) return; // the answer map takes over
  const o = 1 - clamp((q - mapIn) / 0.35), k = ease.back(clamp((q - L.t0 + 0.4) / 0.4));
  c.save(); c.globalAlpha = o; c.translate(960, 520); c.scale(k, k);
  const Wd = 1300, Hh = 760, X = -Wd / 2, Y = -Hh / 2;
  c.save(); c.globalAlpha = 0.3 * o; paint(c, p => roundRect(p, X + 16, Y + 20, Wd, Hh, 50), '#000', { lw: 0 }); c.restore();
  paint(c, p => roundRect(p, X, Y, Wd, Hh, 50), '#FFFFFF', { lw: 9 });
  c.save(); c.beginPath(); roundRect(c, X, Y, Wd, Hh, 50); c.clip(); c.fillStyle = '#E07B3C'; c.fillRect(X, Y, Wd, 130); c.restore();
  line(c, [[X, Y + 130], [X + Wd, Y + 130]], 8, OL);
  const now = i => q >= L.wt(i) - 0.05;
  const pulse = (a, b) => (q >= L.wt(a) - 0.05 && q < (b === undefined ? L.t1 : L.wt(b))) ? 1 + 0.04 * Math.sin(q * 9) : 1;
  // 1. header
  c.save(); c.translate(0, Y + 92); c.scale(pulse(0, 2), pulse(0, 2)); U.textOutlined(c, 'QUICK QUESTION!', 0, 0, 84, '#FFFFFF', { olw: 14, w: 800 }); c.restore();
  // 2. the situation
  if (now(2)) { const a = ease.back(clamp((q - L.wt(2)) / 0.3)); c.save(); c.translate(0, Y + 245); c.scale(a, a);
    c.font = `800 66px ${F.EN}`; const t1 = 'At the bank, Gus turned ', t2 = 'RIGHT.', w1 = c.measureText(t1).width, w2 = c.measureText(t2).width, x0 = -(w1 + w2) / 2;
    U.textOutlined(c, t1, x0, 0, 66, '#3a221d', { align: 'left', ol: false, w: 800 }); U.textOutlined(c, t2, x0 + w1, 0, 66, '#E5484D', { align: 'left', ol: false, w: 800 });
    c.restore(); }
  // 3. the question (largest)
  if (now(8)) { const a = ease.back(clamp((q - L.wt(8)) / 0.35)) * pulse(8, 11); c.save(); c.translate(0, Y + 390); c.scale(a, a);
    U.textOutlined(c, 'Was that correct?', 0, 0, 112, '#FF7A2F', { olw: 16, w: 800 }); c.restore(); }
  // answer buttons: both neutral blue while the viewer thinks; at the answer NO turns green (with a tick), YES greys out
  const shown = q >= ans;
  if (q >= L.wt(10) + 0.15) [['YES', -230], ['NO', 230]].forEach(([t, x], i) => {
    const right = t === 'NO', a = ease.back(clamp((q - L.wt(10) - 0.15 - i * 0.15) / 0.3));
    const pop = shown && right ? 1 + 0.14 * ease.back(clamp((q - ans) / 0.3)) : 1;
    c.save(); c.translate(x, Y + 520); c.scale(a * pop, a * pop); if (shown && !right) c.globalAlpha *= 0.45;
    paint(c, p => roundRect(p, -170, -55, 340, 110, 55), shown ? (right ? '#2F9466' : '#9C98A6') : '#2E6FD8', { lw: 8 });
    U.textOutlined(c, t, shown && right ? -18 : 0, 24, 66, '#FFFFFF', { olw: 10, w: 800 });
    if (shown && right) { paint(c, p => p.arc(110, 0, 30, 0, 7), '#FFFFFF', { lw: 5 }); line(c, [[96, 0], [106, 12], [126, -12]], 8, '#2F9466'); }
    c.restore(); });
  // thinking time: a countdown ring next to the buttons
  if (q >= L.t1 && q < ans) { const u = (q - L.t1) / (ans - L.t1), left = Math.ceil((ans - q) - 0.05);
    c.save(); c.translate(520, Y + 520); paint(c, p => p.arc(0, 0, 54, 0, 7), '#FFFFFF', { lw: 7 });
    c.beginPath(); c.arc(0, 0, 44, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - u)); c.lineWidth = 12; c.strokeStyle = '#FF7A2F'; c.lineCap = 'round'; c.stroke();
    U.textOutlined(c, String(Math.max(1, left)), 0, 18, 52, '#3a221d', { ol: false, w: 800 }); c.restore(); }
  // 4. call to action
  if (now(11)) { const a = ease.back(clamp((q - L.wt(11)) / 0.3)) * pulse(11); c.save(); c.translate(0, Y + 668); c.scale(a, a);
    paint(c, p => roundRect(p, -540, -48, 1080, 96, 48), '#2E6FD8', { lw: 7 });
    c.translate(-36, 0); paint(c, p => { p.moveTo(-440, -24); p.lineTo(-376, -24); p.quadraticCurveTo(-364, -24, -364, -12); p.lineTo(-364, 10); p.quadraticCurveTo(-364, 22, -376, 22); p.lineTo(-412, 22); p.lineTo(-428, 36); p.lineTo(-428, 22); p.lineTo(-440, 22); p.quadraticCurveTo(-452, 22, -452, 10); p.lineTo(-452, -12); p.quadraticCurveTo(-452, -24, -440, -24); p.closePath(); }, '#FFFFFF', { lw: 4 });
    U.textOutlined(c, 'Write your answer in the comments!', 86, 17, 50, '#FFFFFF', { olw: 9, w: 800 }); c.restore(); }
  c.restore();
}
function quizMap(c, q) { // the answer: same town map, Gus's right turn crossed out, the LEFT turn drawn in green
  const { A, mapIn, end } = QUIZ(); if (q < mapIn || q > end + 0.4) return;
  const k = ease.back(clamp((q - mapIn) / 0.4)) * (1 - ease.in(clamp((q - end) / 0.4)));
  c.save(); c.translate(960, 470); c.scale(k, k);
  paint(c, p => roundRect(p, -700, -400, 1400, 790, 46), '#FFFFFF', { lw: 9 });
  c.save(); c.beginPath(); roundRect(c, -700, -400, 1400, 790, 46); c.clip(); c.fillStyle = '#2F9466'; c.fillRect(-700, -400, 1400, 110); c.restore();
  line(c, [[-700, -290], [700, -290]], 8, OL);
  U.textOutlined(c, 'AT THE BANK: TURN LEFT', 0, -322, 70, '#FFFFFF', { olw: 12, w: 800 });
  c.save(); c.translate(0, 55); c.scale(0.76, 0.76); drawTownMap(c);
  // Gus's way: east on Oak St, RIGHT at the bank -> shop (red, crossed out)
  const k1 = clamp((q - mapIn - 0.2) / 0.6);
  c.save(); c.translate(-600, MAP.oak - 80); c.scale(1.5, 1.5); goosePin(c, 0, 0); c.restore();
  drawPath(c, [[-650, MAP.oak], ...WAY_RIGHT], k1, '#E5484D');
  if (k1 >= 1) { arrowHead(c, WAY_RIGHT[0], WAY_RIGHT[1], '#E5484D', 0.9); const [x, y] = [MAP.cross, MAP.oak + 100]; line(c, [[x - 30, y - 30], [x + 30, y + 30]], 14, '#E5484D'); line(c, [[x + 30, y - 30], [x - 30, y + 30]], 14, '#E5484D');
    U.textOutlined(c, 'RIGHT', MAP.cross - 170, MAP.oak + 125, 58, '#E5484D', { olw: 9, w: 800 }); }
  // the right way: LEFT at the bank -> past the park -> Green St -> Big Burger (green), drawn on "left"
  const k2 = clamp((q - A.wt(5) + 0.1) / 1.1);
  if (k2 > 0) { drawPath(c, WAY_LEFT, k2, '#2F9466'); if (k2 >= 1) arrowHead(c, WAY_LEFT[1], WAY_LEFT[2], '#2F9466', 1.1);
    const a = ease.back(clamp((q - A.wt(5) + 0.1) / 0.35)); c.save(); c.translate(MAP.cross - 190, MAP.oak - 330); c.scale(a, a);
    paint(c, p => roundRect(p, -120, -46, 240, 92, 46), '#2F9466', { lw: 7 }); U.textOutlined(c, 'LEFT', 0, 20, 60, '#FFFFFF', { olw: 9, w: 800 }); c.restore(); }
  c.restore(); c.restore();
}
const SUBCLICK = () => L_('o03').wt(0) + 0.35;
function bellIcon(c, s, wig) {
  c.save(); c.scale(s, s); c.rotate(wig);
  paint(c, p => { p.moveTo(-30, 24); p.quadraticCurveTo(-26, -34, 0, -36); p.quadraticCurveTo(26, -34, 30, 24); p.lineTo(38, 32); p.lineTo(-38, 32); p.closePath(); }, '#FFD23F', { lw: 6 });
  paint(c, p => p.arc(0, 40, 9, 0, 7), '#FFD23F', { lw: 5 }); paint(c, p => p.arc(0, -40, 6, 0, 7), '#FFD23F', { lw: 4 });
  c.restore();
}
function subscribe(c, q) { // big highlighted SUBSCRIBE: dim the street, button pops, cursor clicks, bell rings, sparkles
  const L = L_('o03'); const t0 = L.t0 - 0.35, tEnd = L.t1 + 1.3; if (q < t0 || q > tEnd + 0.4) return;
  const out = ease.in(clamp((q - tEnd) / 0.4)), k = ease.back(clamp((q - t0) / 0.45)) * (1 - out), click = SUBCLICK(), pressed = q >= click;
  c.save(); c.globalAlpha = 0.45 * clamp((q - t0) / 0.3) * (1 - out); c.fillStyle = '#1E1828'; c.fillRect(0, 0, W, H); c.restore();
  c.save(); c.translate(960, 330); c.scale(k, k);
  const sq = pressed ? 1 - 0.1 * Math.max(0, 1 - (q - click) / 0.15) : 1 + 0.03 * Math.sin(q * 8); c.scale(sq, sq);
  if (!pressed) { const r = (q * 1.2) % 1; c.save(); c.globalAlpha = 0.6 * (1 - r); paint(c, p => roundRect(p, -390 - r * 40, -95 - r * 40, 780 + r * 80, 190 + r * 80, 95 + r * 40), 'rgba(0,0,0,0)', { lw: 10, ol: '#FFD23F' }); c.restore(); }
  c.save(); c.globalAlpha = 0.3; paint(c, p => roundRect(p, -370, -72, 760, 170, 85), '#000', { lw: 0 }); c.restore();
  paint(c, p => roundRect(p, -380, -85, 760, 170, 85), pressed ? '#8A8A96' : '#E5484D', { lw: 9 });
  const wig = pressed ? Math.sin((q - click) * 30) * 0.35 * Math.max(0, 1 - (q - click) / 1.0) : 0;
  c.save(); c.translate(-270, 0); bellIcon(c, 1.25, wig); c.restore();
  U.textOutlined(c, pressed ? 'SUBSCRIBED' : 'SUBSCRIBE', 50, 30, 84, '#FFFFFF', { olw: 12, w: 800 });
  c.restore();
  // sparkles on click
  if (pressed && q < click + 0.8) { const u = (q - click) / 0.8; c.save(); c.translate(960, 330); c.globalAlpha = 1 - u;
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r0 = 420 * (0.55 + u * 0.6); const x = Math.cos(a) * r0, y = Math.sin(a) * r0 * 0.45;
      line(c, [[x * 0.92, y * 0.92], [x, y]], 10, ['#FFD23F', '#FFFFFF', '#FF7A2F'][i % 3]); } c.restore(); }
  // cursor arrow glides in and clicks
  const ck = ease.inOut(clamp((q - t0 - 0.2) / (click - t0 - 0.2)));
  const cx = lerp(1560, 1120, ck), cy = lerp(760, 360, ck) + (pressed ? 6 * Math.max(0, 1 - (q - click) / 0.15) : 0);
  c.save(); c.globalAlpha = 1 - out; c.translate(cx, cy); c.scale(1.6, 1.6); c.rotate(-0.35);
  paint(c, p => { p.moveTo(0, 0); p.lineTo(0, 60); p.lineTo(15, 46); p.lineTo(26, 70); p.lineTo(36, 65); p.lineTo(25, 42); p.lineTo(44, 42); p.closePath(); }, '#FFFFFF', { lw: 5 });
  c.restore();
}
function callInsert(c, q) { // full-frame insert: Sofia's phone calling Gus -> "not available"
  const L = L_('e03'), fail = q >= L.t0 - 0.1;
  c.fillStyle = '#F6B3C6'; c.fillRect(0, 0, W, H);
  c.save(); c.globalAlpha = 0.25; c.fillStyle = '#FFFFFF'; for (let i = 0; i < 14; i++) { c.save(); c.translate(960, 520); c.rotate(i * Math.PI / 7 + q * 0.15); c.fillRect(0, -40, 1400, 80); c.restore(); } c.restore();
  const shake = fail && q < L.t0 + 0.4 ? Math.sin(q * 60) * 6 : 0;
  c.save(); c.translate(960 + shake, 540); c.rotate(-0.04);
  // hand + sleeve holding the phone
  paint(c, p => roundRect(p, -170, 330, 340, 300, 60), '#F4B63F', { shade: '#D8901C', sx: 14, sy: 0, lw: 8 });
  paint(c, p => p.ellipse(0, 300, 210, 120, 0, 0, 7), '#FFDCC6', { shade: '#F4B79C', sx: 0, sy: -14, lw: 8 });
  // phone
  paint(c, p => roundRect(p, -210, -430, 420, 760, 50), '#2A2E3A', { lw: 9 });
  paint(c, p => roundRect(p, -186, -400, 372, 680, 34), fail ? '#3A2430' : '#1E3A5A', { lw: 0 });
  U.textOutlined(c, fail ? 'NOT AVAILABLE' : 'CALLING' + '...'.slice(0, 1 + Math.floor(q * 3) % 3), 0, -300, fail ? 46 : 50, fail ? '#FF8A8E' : '#FFFFFF', { ol: false, w: 800 });
  // avatar: Gus, with ringing waves
  if (!fail) for (let i = 0; i < 2; i++) { const r = ((q * 0.9 + i * 0.5) % 1); c.save(); c.globalAlpha = 0.7 * (1 - r); c.beginPath(); c.arc(0, -110, 110 + r * 90, 0, 7); c.lineWidth = 8; c.strokeStyle = '#9EE6B8'; c.stroke(); c.restore(); }
  paint(c, p => p.arc(0, -110, 110, 0, 7), fail ? '#7A7A86' : '#8FD0F7', { lw: 7 });
  c.save(); c.beginPath(); c.arc(0, -110, 106, 0, 7); c.clip();
  if (fail) c.globalAlpha = 0.55;
  paint(c, p => p.ellipse(-6, -96, 62, 58, 0, 0, 7), '#FFFFFF', { lw: 5 });
  paint(c, p => { p.moveTo(40, -100); p.bezierCurveTo(70, -98, 100, -86, 112, -78); p.quadraticCurveTo(80, -70, 38, -78); p.closePath(); }, '#FF9A2E', { lw: 4 });
  paint(c, p => p.ellipse(14, -112, 12, 14, 0, 0, 7), '#FFFFFF', { lw: 4 }); c.beginPath(); c.arc(18, -108, 6, 0, 7); c.fillStyle = '#1b1b1b'; c.fill();
  line(c, [[-2, -124], [26, -122]], 5, '#FFFFFF'); line(c, [[0, -96 + 34], [0, -10]], 70, '#FFFFFF');
  paint(c, p => { p.moveTo(-22, -40); p.lineTo(0, -28); p.lineTo(22, -40); p.lineTo(18, -18); p.lineTo(0, -26); p.lineTo(-18, -18); p.closePath(); }, '#2E6FD8', { lw: 4 });
  c.restore();
  U.textOutlined(c, 'GUS', 0, 70, 96, '#FFFFFF', { ol: false, w: 800 });
  if (fail) { const a = ease.back(clamp((q - L.t0 + 0.1) / 0.3)); c.save(); c.translate(0, 170); c.scale(a, a); line(c, [[-40, -40], [40, 40]], 18, '#E5484D'); line(c, [[40, -40], [-40, 40]], 18, '#E5484D'); c.restore(); }
  // hang-up / call button
  if (!fail) { paint(c, p => p.arc(0, 200, 48, 0, 7), '#E5484D', { lw: 5 }); paint(c, p => roundRect(p, -26, 192, 52, 16, 8), '#FFFFFF', { lw: 0 }); }
  c.restore();
}

// ================= drawing a scene =================
function drawWorldBg(x, world) { if (world === 'green') BG_.drawGreen(x); else if (world === 'oak') BO.drawWide(x); else BS.drawShop(x); }
const BGC = new Map();
const BOUNDS = { green: [0, 2880], oak: [0, 1920], shop: [-60, 1980] };
function fixCam(world, cam) { const [a, b] = BOUNDS[world], hw = 960 / cam[2] * 1.0; return [clamp(cam[0], a + hw, b - hw), Math.min(cam[1], 1080 - 540 / cam[2]), cam[2]]; }
function bgFor(world, cam) { // the SAME world rendered through this camera (outline width kept like the characters')
  const key = world + cam.join(','); if (BGC.has(key)) return BGC.get(key);
  const [cx, cy, z] = cam, R = 1.1, cv = createCanvas(Math.round(W * R), Math.round(H * R)), x = cv.getContext('2d');
  x.scale(R, R); x.translate(W / 2, H / 2); x.scale(z, z); x.translate(-cx, -cy);
  const lk = z > 1 ? 1.4 / z : 1;
  const px = new Proxy(x, { get: (t2, k) => { const v = t2[k]; return typeof v === 'function' ? v.bind(t2) : v; }, set: (t2, k, v) => { t2[k] = k === 'lineWidth' ? v * lk : v; return true; } });
  drawWorldBg(px, world);
  if (BGC.size > 60) BGC.delete(BGC.keys().next().value);
  BGC.set(key, cv); return cv;
}
function gusParams(q, g) {
  const P = poseFor('gus', q), tk = talkLevel('gus', q);
  const flap = (P.flap || 0) * Math.sin(q * 14) * 0.2, cnt = (P.count || 0) * Math.sin(q * 5) * 0.12;
  const bounce = (P.bounce || 0) * Math.abs(Math.sin(q * 7)) * 0.035, chew = (P.chew || 0) * Math.max(0, Math.sin(q * 9)) * 0.4;
  return {
    face: g.face, walking: !!g.walking, walk: q * 2.2,
    lids: Math.max(P.lids, blink(q, 2) > 0.5 ? 0.95 : 0), neck: P.neck + tk * 0.06 * Math.sin(q * 9) + (P.nod || 0) * Math.max(0, Math.sin(q * 5)) * -0.12, look: P.look,
    wing: clamp(P.wing + flap + cnt), honk: Math.max(tk * 0.95, chew), squash: 1 + bounce + Math.sin(q * 2.4) * 0.006, _sweat: P.sweat || 0,
  };
}
function crewParams(who, q, extra = {}) {
  const P = poseFor(who, q), tk = talkLevel(who, q);
  const ln = LINES.find(l => l.who === who && l.nod && q >= l.wt(l.nod[0]) && q < l.wt(l.nod[1]));
  const nod = ln ? Math.sin((q - ln.wt(ln.nod[0])) * 12) * 0.05 : 0;
  const shake = P.shake ? Math.sin(q * 9) * 0.07 : 0, nodA = (P.nodRose || 0) * Math.sin(q * 5.5) * 0.045, lau = (P.laughShake || 0) * Math.abs(Math.sin(q * 16)) * 0.025;
  const wav = P.waveHand ? Math.sin(q * 10) * 34 : 0, sd = { rose: 5, tom: 7, dan: 9 }[who];
  return Object.assign({
    turn: -0.32 + shake * 2, tilt: -0.04 + nod + nodA - lau + tk * 0.025 * Math.sin(q * 7), lean: P.lean || 0, bob: Math.sin(q * 2.1 + sd) * 3,
    look: [-0.55, P.shake ? 0.35 : 0.05], blink: Math.max(blink(q, sd), P.squint || 0), browL: P.browL, browR: P.browR, surprise: P.surprise || 0, wide: (P.surprise || 0) * 0.8,
    mouth: { open: Math.max(tk * 0.85, (P.mouthOpen || 0) * (0.7 + 0.3 * Math.abs(Math.sin(q * 16)))), smile: P.smile, w: 1 - tk * 0.15 },
    armL: P.armL, armR: [P.armR[0] + wav, P.armR[1]], handL: P.handL, handR: P.handR, armsFront: P.armsFront > 0.5 || P.armsFront === true,
  }, extra);
}
function sofiaParams(q, s) {
  const P = poseFor('sofia', q), tk = talkLevel('sofia', q);
  const wav = P.waveHand ? Math.sin(q * 10) * 30 : 0;
  const o = {
    turn: P.turn, tilt: tk * 0.03 * Math.sin(q * 7), bob: Math.sin(q * 2.0) * 3, look: [P.look, 0],
    blink: blink(q, 3), wide: P.wide || 0, sleepy: P.sleepy || 0, happyEyes: (P.happy || 0) > 0.5 && tk < 0.2 ? 1 : 0,
    brow: { l: P.bl || 0, r: P.br || 0, angry: P.angry || 0, worry: P.worry || 0 },
    mouth: { open: Math.max(tk * 0.85, (P.o || 0) * 0.5), smile: P.smile, o: P.o || 0, teeth: tk > 0.5 ? 0.3 : 0 },
    armL: P.armL, armR: [P.armR[0] + wav, P.armR[1]], handL: P.handL, handR: P.handR, armsFront: (P.front || 0) > 0.5,
    legs: s.walking ? 'walk' : 'stand', walk: q * (s.run ? 2.6 : 1.8),
  };
  if (s.back) { o.turn = -0.9; o.look = [-1, 0]; }
  if (s.walking && !s.run) { o.armL = [-118, -20]; o.armR = [118, -20]; o.armsFront = false; o.handL = o.handR = 'mitten'; }
  if (s.walking && s.run) { o.armL = [-150 + Math.sin(q * 16) * 40, -90]; o.armR = [150 - Math.sin(q * 16) * 40, -90]; }
  // props in hand
  const ph = BEAT.phone5;
  if (q >= ph[0] && q < ph[1]) { o.holdR = (c) => { c.save(); c.rotate(0.2); phoneProp(c, 1.1, 'on'); c.restore(); }; o.handR = 'fist'; }
  else if (s.flowers) o.holdL = (c) => bouquet(c);
  return o;
}
function drawCast(ctx, sc, q) {
  const C = cast(sc, q), order = [];
  // back to front: crew (behind counters etc.), dog, Sofia, Gus
  if (C.rose) drawRose(ctx, C.rose.x, GY - 280 * SC.rose, SC.rose, roseParamsFor(q));
  if (C.dog) { const bk = [0, 0.32].map(o => clamp(1 - Math.abs(q - BEAT.bark - o) / 0.12)).reduce((a, b) => Math.max(a, b));
    drawDog(ctx, C.dog.x, GY + 6, SC.dog, { face: q > BEAT.rw0 + 1.2 && q < SCN('rose3').t1 ? 1 : -1, tail: q * 9, bark: bk });
    if (bk > 0.3) U.textOutlined(ctx, 'WOOF!', C.dog.x + 60, 840, 64, '#FFD23F', { olw: 10 }); }
  if (C.tom) {
    const tp = crewParams('tom', q);
    if (q >= BEAT.mapGive && q < BEAT.mapTake) tp.holdR = (c) => { c.save(); c.rotate(0.15); mapProp(c, 1.0); c.restore(); };
    if (q >= BEAT.phoneGive && q < BEAT.phoneTake) tp.holdR = (c) => phoneProp(c, 1.0, 'on');
    if (q >= BEAT.phoneBack) {} // phone given back off screen
    drawTom(ctx, C.tom.x, GY - 280 * SC.tom, SC.tom, tp); BS.counterFront(ctx);
  }
  if (C.dan) drawDan(ctx, C.dan.x, GY - 280 * SC.dan, SC.dan, crewParams('dan', q));
  if (C.sofia) { ctx.save(); ctx.globalAlpha = C.sofia.alpha ?? 1; drawSofia(ctx, C.sofia.x, GY - 276 * SC.sofia, SC.sofia, sofiaParams(q, C.sofia)); ctx.restore(); }
  if (C.gus) {
    const g = C.gus, gp = gusParams(q, g);
    if (g.walking) { gp.lids = 0.4; gp.look = 0.4; }
    if (sc.id === 'rose3' && q >= L_('g09').t0) { gp.neck = 0.35; gp.wing = 0.5; gp.lids = 0; }
    // held props (in the beak)
    let hold = null;
    if (sc.id === 'teaser') { const tb = sc.lines2[1]; hold = (c, f, h) => { c.translate(h.hx + 120, h.hy + 46); c.rotate(0.15); c.scale(f, 1); phoneProp(c, 0.9, q < tb.wt(3) ? 'dark' : 'empty'); }; }
    if (sc.id === 'oak2' && q >= BEAT.phone && q < BEAT.phoneOff) hold = (c, f, h) => { c.translate(h.hx + 120, h.hy + 46); c.rotate(0.15); c.scale(f, 1); phoneProp(c, 0.9, q < wt('b05', 3) ? 'dark' : 'empty'); };
    if (sc.id === 'shop4' && inB(q, BEAT.coupon)) hold = (c, f, h) => { c.translate(h.hx + 130, h.hy + 50); c.rotate(0.12); c.scale(f, 1); coupon(c); };
    if (sc.id === 'shop4' && q >= BEAT.mapTake && !(q >= BEAT.phoneTake && q < BEAT.phoneBack)) hold = (c, f, h) => { c.translate(h.hx + 140, h.hy + 60); c.rotate(0.18); c.scale(f, 1); mapProp(c, 0.8); };
    if (sc.id === 'shop4' && q >= BEAT.phoneTake && q < BEAT.phoneBack) hold = (c, f, h) => { c.translate(h.hx + 120, h.hy + 46); c.rotate(0.15); c.scale(f, 1); phoneProp(c, 0.9, 'on'); };
    if (g.map) hold = (c, f, h) => { c.translate(h.hx + 140, h.hy + 60); c.rotate(0.18); c.scale(f, 1); mapProp(c, 0.8); };
    if (g.burger) hold = (c, f, h) => { c.translate(h.hx + 110, h.hy + 40); burgerProp(c, 0, 0, 0.45); };
    gp.hold = hold;
    ctx.save(); ctx.globalAlpha = g.alpha ?? 1; drawGus(ctx, g.x, GY + 10, SC.gus, gp); ctx.restore();
    // gags attached to Gus (sized in his close-up layout)
    ctx.save(); ctx.translate(g.x, GY + 10); ctx.scale(SC.gus / 1.52, SC.gus / 1.52); ctx.translate(-720, -1015);
    if (gp._sweat > 0.5) sweat(ctx, g.face > 0 ? 760 : 680, 260, q);
    for (const id of ['g03', 'f09']) { const L = L_(id); if (L.sc !== sc) continue; const tb = L.wt(L.bubble);
      const k = q >= tb - 0.1 && q < L.t1 + 0.3 ? clamp((q - tb + 0.1) / 0.25) * (1 - clamp((q - L.t1) / 0.25)) : 0;
      if (g.face > 0) thought(ctx, 1150, 250, k, q); else thought(ctx, 300, 250, k, q, -1); }
    ctx.restore();
  }
  if (sc.id === 'street1') smell(ctx, 1640, 560, q, clamp((q - BEAT.sniff + 0.6) / 0.5) * (1 - clamp((q - L_('a12').t1 - 2.5) / 0.5)));
}
function roseParamsFor(q) {
  const rp = crewParams('rose', q);
  const s3 = SCN('rose3');
  if (q > BEAT.rw0 && q < BEAT.sigh0 - 0.3 && q < s3.t1) { rp.turn = lerp(-0.3, 0.35, clamp((q - BEAT.rw0 - 1.0) / 0.6)); rp.look = [rp.turn > 0 ? 0.7 : -0.6, 0]; }
  return rp;
}

// ================= shots =================
const SHOTS = [];
for (const sc of SCENES) {
  const ev = [];
  const first = { teaser: 'lost', street1: 'est', oak2: 'wide', rose3: 'wide', shop4: 'wide', street5: 'shop', burger6: 'wide', practice7: 'med' }[sc.id];
  ev.push({ t: sc.t0, cam: first, sc });
  for (const L of sc.lines2) { ev.push({ t: L.t0 - 0.12, cam: L.shot, sc }); for (const [wi, c2] of L.cuts || []) ev.push({ t: L.wt(wi) - 0.05, cam: c2, sc }); }
  // scene-specific held shots
  const add = (t2, cam) => ev.push({ t: t2, cam, sc });
  if (sc.id === 'street1') { add(BEAT.title[1] + 0.1, 'med'); add(BEAT.walk1[0], 'street'); add(BEAT.enter[0] - 0.05, 'shop'); add(L_('a08').t1 + 0.35, 'shop'); add(BEAT.gone1[0] + 0.6, 'street'); }
  if (sc.id === 'oak2') { add(BEAT.walk23[0], 'wide'); add(L_('b08').t1 + 0.3, 'wide'); }
  if (sc.id === 'rose3') { add(BEAT.rw0 - 0.1, 'wide'); add(BEAT.sigh0, 'rose'); }
  if (sc.id === 'shop4') { add(BEAT.out4[0] - 0.1, 'wide'); add(L_('d04').wt(4) + 0.6, 'tom'); }
  if (sc.id === 'street5') { add(BEAT.call0, 'call'); add(L_('e03').t1 + 0.35, 'sofiaA'); add(BEAT.toDan[0], 'twoW'); add(BEAT.run5[0], 'wide'); }
  if (sc.id === 'burger6') { add(BEAT.hug[0], 'two'); add(L_('f11').t1 + 0.4, 'two'); }
  if (sc.id === 'practice7') { add(L_('p12').t1 + 2.7, 'two'); add(L_('o04').t1 + 0.3, 'two'); }
  ev.sort((a, b) => a.t - b.t);
  for (const e of ev) { const last = SHOTS[SHOTS.length - 1]; if (!last || last.sc !== e.sc || last.cam !== e.cam) SHOTS.push(e); }
}
SHOTS.forEach((s, i) => { s.t1 = (SHOTS[i + 1] || { t: T }).t; });
const shotAt = q => { let s = SHOTS[0]; for (const x of SHOTS) { if (x.t <= q) s = x; else break; } return s; };

function frame(ctx, q) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const s = shotAt(q), sc = s.sc, cam0 = sc.cams[s.cam] || sc.cams.wide || sc.cams.med, camv = Array.isArray(cam0) ? fixCam(sc.world, cam0) : cam0;
  if (camv === 'phone') phoneInsert(ctx, q, sc);
  else if (camv === 'map') mapInsert(ctx, q);
  else if (camv === 'call') callInsert(ctx, q);
  else {
    const push = camv[2] > 1.2 ? 1 + 0.03 * ease.inOut(clamp((q - s.t) / Math.max(0.5, s.t1 - s.t))) : 1;
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(push, push); ctx.translate(-W / 2, -H / 2);
    ctx.drawImage(bgFor(sc.world, camv), 0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(camv[2], camv[2]); ctx.translate(-camv[0], -camv[1]);
    drawCast(ctx, sc, q);
    ctx.restore(); ctx.restore();
  }
  // overlays
  const AL = activeLine(q) || LINES.find(l => q >= l.t1 && q < l.t1 + 3);
  let side2 = 'right';
  if (Array.isArray(camv) && AL) { const C = cast(sc, q), who = AL.who === 'phone' ? 'sofia' : AL.who; if (C[who]) side2 = 960 + (C[who].x - camv[0]) * camv[2] < 960 ? 'right' : 'left'; }
  const side = { gus: 'right', gusL: 'right', gus2: 'right', gusR: 'left', rose: 'left', sofia: 'left', sofia2: 'left', sofiaA: 'left', tom: 'left', dan: 'right' }[s.cam] || 'center';
  if (sc.id === 'rose3' || sc.id === 'burger6') panel(ctx, q, 'dir', side === 'center' ? (sc.id === 'burger6' ? 'left' : 'center') : side, sc);
  if (sc.id === 'street5') panel(ctx, q, 'desc', side2, sc);
  if (sc.id === 'street1') panel(ctx, q, 'learn', 'right', sc);
  phraseCards(ctx, q, camv === 'map' ? 'left' : Array.isArray(camv) && camv[2] < 2.2 ? 'top' : side2);
  if (sc.id === 'practice7') { practiceCard(ctx, q); quizCard(ctx, q); quizMap(ctx, q); subscribe(ctx, q); }
  titleCard(ctx, q); chip(ctx, q, sc);
  const L = activeLine(q); if (L && L.id !== 'p11') U2.caption(ctx, L.words, q, L.who); // the quiz card itself carries the p11 text
  // scene transitions: quick dip to white, and fade to black at the very end
  for (const x of SCENES) { if (x === SCENES[0]) continue; const d = Math.abs(q - x.t0); if (d < TRANS) { ctx.save(); ctx.globalAlpha = 1 - d / TRANS; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
  if (q < 0.5) { ctx.save(); ctx.globalAlpha = 1 - q / 0.5; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  if (q > T - 1.2) { ctx.save(); ctx.globalAlpha = clamp((q - (T - 1.2)) / 1.0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
}

// ================= audio plan (ep4/audio_ep.py) + subtitles + chapters =================
function plan() {
  const sfx = [], A = (t2, name) => sfx.push({ t: t2, name });
  for (const x of SCENES.slice(1)) A(x.t0 - 0.25, 'whoosh');
  A(BEAT.title[0] + 0.3, 'pop'); A(BEAT.title[0] + 0.9, 'pop');
  // walks
  for (const [a, b] of [BEAT.walk1, BEAT.in2, BEAT.walk23, BEAT.in4, [BEAT.out4[0], BEAT.out4[0] + 2.2], BEAT.gusIn6, [BEAT.gone1[0], BEAT.gone1[0] + 2.8], [BEAT.rw0, BEAT.rw1], [BEAT.exit0, BEAT.exit1]])
    for (let x = a; x < b - 0.3; x += 2.1) A(x, 'waddle');
  for (const [a, b] of [BEAT.walk5, BEAT.toDan, BEAT.sofIn6, [BEAT.run5[0], BEAT.run5[0] + 1.6]]) for (let x = a; x < b; x += 0.32) A(x, 'step');
  A(BEAT.enter[0] + 1.0, 'bell'); A(BEAT.out5[0], 'bell'); A(BEAT.in4[0], 'bell'); A(BEAT.out4[0] + 2.1, 'bell');
  A(BEAT.sniff, 'sniff'); A(BEAT.sniff + 0.5, 'sniff'); A(wt('a10', 0), 'ding');
  A(wt('b05', 3), 'sad'); A(SCN('teaser').lines2[1].wt(3), 'sad'); A(BEAT.bark, 'bark'); A(BEAT.bark + 0.32, 'bark'); A(L_('b06').t0, 'boing');
  A(BEAT.call0 - 0.1, 'whoosh'); A(BEAT.call0 + 0.25, 'click'); A(BEAT.call0 + 0.5, 'ring'); A(BEAT.call0 + 1.6, 'ring'); A(L_('e03').t0 - 0.25, 'beeps');
  A(BEAT.mapGive, 'pop'); A(BEAT.coupon[0], 'pop'); A(BEAT.phoneGive, 'pop'); A(BEAT.hug[0], 'pop');
  A(wt('g03', 7), 'pop'); A(wt('f09', 2), 'pop'); A(wt('d11', 3), 'boing');
  A(L_('o03').t0 - 0.45, 'whoosh'); A(L_('o03').t0 - 0.25, 'pop'); A(SUBCLICK(), 'click'); A(SUBCLICK() + 0.05, 'bellring'); A(SUBCLICK() + 0.1, 'sparkle');
  A(L_('p11').t0 - 0.3, 'whoosh'); A(wt('p11', 8), 'card'); A(wt('p11', 10) + 0.2, 'pop'); A(wt('p11', 10) + 0.35, 'pop'); A(wt('p11', 11), 'card');
  { const Q = QUIZ(); for (let x = Q.L.t1 + 0.4; x < Q.ans - 0.3; x += 1.0) A(x, 'tick'); A(Q.ans, 'ding'); A(Q.ans + 0.05, 'sparkle'); A(Q.mapIn, 'whoosh'); A(Q.A.wt(5), 'card'); }
  for (const L of LINES) {
    for (const [wi] of L.dir || []) A(L.wt(wi), 'card'); for (const [wi] of L.hi || []) A(L.wt(wi), 'tick');
    for (const [wi] of L.desc || []) A(L.wt(wi), 'card'); for (const [wi] of L.learn || []) A(L.wt(wi), 'card'); for (const [wi] of L.card || []) A(L.wt(wi) - 0.15, 'card');
    if (L.practice && L.practice.pass === 1) { A(L.t0 - 0.6, 'card'); A(L.t1 + 0.15, 'tick'); }
  }
  fs.writeFileSync(__dirname + '/plan_ep.json', JSON.stringify({ T, lines: LINES.map(l => ({ id: l.id, who: l.who, t0: l.t0 })), sfx }));
  const ts = x => { const h = Math.floor(x / 3600), m = Math.floor(x / 60) % 60, s = Math.floor(x) % 60, ms = Math.round((x % 1) * 1000); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`; };
  fs.writeFileSync(__dirname + '/sofia_ep4_en.srt', LINES.map((l, i) => `${i + 1}\n${ts(l.t0)} --> ${ts(Math.min(l.t1 + 0.3, (LINES[i + 1] || { t0: 1e9 }).t0 - 0.02))}\n${l.text}\n`).join('\n'));
  const mmss = x => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
  const CH = [['Gus is lost!', 0], ['Gus smells burgers', L_('a01').t0 - 1], ['Lost in the city', SCN('oak2').t0], ['Asking for directions', SCN('rose3').t0], ['At the corner shop', SCN('shop4').t0],
    ['Sofia asks the police', SCN('street5').t0], ['Big Burger', SCN('burger6').t0], ['Practice: listen and repeat', SCN('practice7').t0], ['Quick question', L_('p11').t0 - 1]];
  fs.writeFileSync(__dirname + '/chapters.txt', CH.map(([n, x]) => `${mmss(x)} ${n}`).join('\n') + '\n');
  console.log('T =', T.toFixed(2), 's (' + mmss(T) + '),', LINES.length, 'lines,', SHOTS.length, 'shots');
  for (const sc of SCENES) console.log(sc.id.padEnd(10), mmss(sc.t0), '-', mmss(sc.t1));
}

async function main() {
  const [mode, a, b, c2] = process.argv.slice(2);
  if (mode === 'plan' || mode === 'info') return plan();
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  if (mode === 'still') {
    const ts = a.split(',').map(Number), sc = 0.5, St = createCanvas(W, H * sc * Math.ceil(ts.length / 2)), sx = St.getContext('2d');
    ts.forEach((q, i) => { frame(ctx, q); sx.drawImage(cv, (i % 2) * W * sc, Math.floor(i / 2) * H * sc, W * sc, H * sc); });
    fs.writeFileSync(b, St.toBuffer('image/png')); return;
  }
  const f0 = Math.round((b ? +b : 0) * FPS), f1 = Math.round((c2 ? +c2 : T) * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-tune', 'animation', '-pix_fmt', 'yuv420p', a], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = f0; f < f1; f++) {
    frame(ctx, f / FPS);
    const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 300 === 0) console.log('frame', f, '/', f1);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
module.exports = { T, LINES, SCENES, SHOTS };
if (require.main === module) main();
