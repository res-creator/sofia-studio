// node ourcast/sheet.js out.png -> 4 frames: wide shot + close-ups with different moods
const K = require('./hand_kit'); const { heroine, tom } = require('./cast');
const W = 1080, H = 1920, frames = [
  { cam: { z: 1, cx: 540, cy: 960 }, a: { pose: 'presentL', mood: 'happy', mouth: 0 }, t: { pose: 'hips', mood: 'neutral', mouth: 0 } },
  { cam: { z: 1.6, cx: 740, cy: 1060 }, a: { pose: 'pointL', mood: 'neutral', mouth: 0.6 }, t: { pose: 'down', mood: 'neutral' } },
  { cam: { z: 1.6, cx: 340, cy: 1040 }, a: { pose: 'down', mood: 'neutral' }, t: { pose: 'head', mood: 'surprised', mouth: 0.5 } },
  { cam: { z: 1.6, cx: 740, cy: 1060 }, a: { pose: 'cross', mood: 'smug', mouth: 0 }, t: { pose: 'down', mood: 'neutral' } },
  { cam: { z: 1.6, cx: 340, cy: 1040 }, a: { pose: 'down', mood: 'neutral' }, t: { pose: 'shrug', mood: 'angry', mouth: 0.3 } }];
const cv = K.createCanvas(W, H), g = cv.getContext('2d'); K.setG(g);
const sheet = K.createCanvas(frames.length * 540, 960), sg = sheet.getContext('2d');
frames.forEach((f, i) => {
  g.setTransform(1, 0, 0, 1, 0, 0); g.translate(W / 2, H / 2); g.scale(f.cam.z, f.cam.z); g.translate(-f.cam.cx, -f.cam.cy);
  K.room(0); tom({ x: 340, ...f.t }); heroine({ x: 740, ...f.a });
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(K.PAPER, 0, 0);
  const v = g.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1200); v.addColorStop(0, 'rgba(40,20,10,0)'); v.addColorStop(1, 'rgba(40,20,10,0.12)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  sg.drawImage(cv, i * 540, 0, 540, 960); if (i === 0) require('fs').writeFileSync(process.argv[2].replace('.png', '_wide.png'), cv.toBuffer('image/png')); });
require('fs').writeFileSync(process.argv[2], sheet.toBuffer('image/png')); console.log('ok');
