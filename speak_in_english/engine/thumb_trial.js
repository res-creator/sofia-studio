// YouTube cover for THE TRIAL (1280x720): node thumb_trial.js out.png
// Built from the episode's own drawing code (courtroom, heroine, Homey, flamingo) — same look as the video.
const fs = require('fs'), path = require('path'); const E = require('./engine_v2'); E.run = () => {};
const src = fs.readFileSync('trial.js', 'utf8') + '\nmodule.exports = { BGB, BX0, BY0, BW, BH, HER, G, herState, homey, flamingo, pizzaBox, human, UI, C, txt };';
const m = new module.constructor(); m.paths = module.paths; m._compile(src, path.resolve('trial.js'));
const { BGB, BX0, BY0, BW, BH, HER, G, homey, flamingo, pizzaBox, human, UI, C } = m.exports; const { reach } = require('./pose'); const Hq = require('./hq');
const cv = Hq.createCanvas(1920, 1080), c = cv.getContext('2d');
// background: the courtroom behind the bench, softly blurred
c.save(); c.filter = 'blur(6px)'; c.translate(960, 540); c.scale(0.55, 0.55); c.translate(300, 1900); c.drawImage(BGB, BX0, BY0, BW, BH); c.restore(); c.filter = 'none';
c.fillStyle = 'rgba(30,18,30,.25)'; c.fillRect(0, 0, 1920, 1080);
// evidence on the right: giant flamingo, pizza tower, Homey in the evidence bag
c.save(); c.translate(1640, 1090); c.scale(0.44, 0.44); flamingo(c, 0, 0, 1, 0.3); c.restore();
for (let i = 0; i < 8; i++) pizzaBox(c, 1080, 1075 - i * 40, 1.0);
homey(c, 1390, 1070, 1.0, 1, true, 0.2);
// heroine, big, shocked, hands up
const g = G.her, st = { t: 0.4, talk: 0.6, mood: 'shock', turn: 0.15, look: 0.3, armL: reach(g, -1, -g.sw * 1.5, g.ySh - 200), armR: reach(g, 1, g.sw * 1.5, g.ySh - 200) };
c.save(); c.translate(470, 1560); c.scale(0.85, 0.85); human(c, HER, st); c.restore();
// title
const big = (s, x, y, sz, fill, rot) => { c.save(); c.translate(x, y); c.rotate(rot); c.font = `${sz}px Unb9`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.strokeStyle = C.oliveD; c.lineWidth = sz * 0.22; c.strokeText(s, 0, 0); c.fillStyle = fill; c.fillText(s, 0, 0); c.restore(); };
big('40 ПИЦЦ?!', 1240, 190, 160, C.pink, -0.05);
c.save(); c.translate(1260, 345); c.rotate(-0.05); c.fillStyle = C.cream; Hq.rr(c, -330, -62, 660, 124, 30); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 8; Hq.rr(c, -330, -62, 660, 124, 30); c.stroke();
c.font = '74px Unb9'; c.fillStyle = C.oliveD; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('МЕНЯ СУДЯТ', 0, 4); c.restore();
c.save(); c.translate(60, 60); c.fillStyle = '#E0474C'; Hq.rr(c, 0, 0, 420, 100, 50); c.fill(); c.strokeStyle = '#FFFFFF'; c.lineWidth = 6; c.stroke(); c.font = '58px Unb9'; c.fillStyle = '#FFFFFF'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('£1,240', 210, 54); c.restore();
Hq.vignette(c, 1920, 1080, 0.3);
const out = Hq.createCanvas(1280, 720), o = out.getContext('2d'); o.drawImage(cv, 0, 0, 1280, 720);
fs.writeFileSync(process.argv[2], out.toBuffer('image/png')); console.log('cover ->', process.argv[2]);
