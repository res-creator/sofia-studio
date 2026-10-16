// Ep4 guest characters: Mrs. Rose (elderly lady, on the crew rig) + Biscuit (her small dog).
// Adds a 'rose' style to lib/crew.js STYLES at load time — crew.js itself stays untouched.
// drawRose(ctx, x, hipY, s, pose)  — same pose API as drawCrew (hip = floor - 280*s).
// drawDog(ctx, x, footY, s, p)     — p: { face 1|-1, bark 0..1, tail phase, look -1..1, sit }
const { OL, paint, line, curve, roundRect } = require('./draw');
const crew = require('./crew');

const SH_Y = -250;
const HAIR = '#E4E1E8', HAIR_SH = '#B9B4C2', HAIR_HI = '#FFFFFF';

function roseHairBack(ctx) {
  // round bun on top
  paint(ctx, c => c.ellipse(0, -178, 74, 58, 0, 0, 7), HAIR, { shade: HAIR_SH, sx: -8, sy: -6 });
  curve(ctx, [-40, -196], [0, -214], [40, -196], 3.5, HAIR_SH);
  curve(ctx, [-30, -170], [0, -184], [30, -170], 3.5, HAIR_SH);
}
function roseHair(ctx, o) {
  // soft curly grey hair, open forehead, curls over the ears
  paint(ctx, c => {
    c.moveTo(-160, 30);
    c.bezierCurveTo(-190, -40, -150, -150, -40, -162);
    c.bezierCurveTo(60, -172, 170, -130, 168, -20);
    c.bezierCurveTo(176, 10, 168, 34, 150, 40);
    c.bezierCurveTo(150, 0, 140, -50, 110, -80);
    c.bezierCurveTo(60, -104, 0, -96, -40, -104);
    c.bezierCurveTo(-90, -96, -126, -70, -140, -20);
    c.bezierCurveTo(-140, 0, -150, 20, -160, 30);
    c.closePath();
  }, HAIR, { shade: HAIR_SH, sx: -10, sy: -10, hi: HAIR_HI, hiA: 0.6, hiFn: c => c.ellipse(-10, -142, 70, 12, -0.1, 0, 7) });
  // curls
  for (const [x, y, r] of [[-150, 6, 26], [-158, -40, 24], [150, 4, 26], [160, -44, 24], [-110, -110, 22], [100, -116, 22]])
    curve(ctx, [x - r * 0.6, y + r * 0.2], [x, y - r * 0.9], [x + r * 0.6, y + r * 0.2], 3.5, HAIR_SH);
  // kind wrinkles: crow's feet + smile lines
  const fx = o.turn * 28;
  ctx.save(); ctx.globalAlpha = 0.45;
  for (const k of [-1, 1]) {
    const ex = k * 54 + fx * 0.85 + k * 44;
    line(ctx, [[ex, -6], [ex + k * 16, -12]], 3, '#B07A62');
    line(ctx, [[ex, 4], [ex + k * 16, 6]], 3, '#B07A62');
    curve(ctx, [fx * 1.1 + k * 44, 62], [fx * 1.1 + k * 56, 84], [fx * 1.1 + k * 48, 104], 3.5, '#B07A62');
  }
  ctx.restore();
}
function roseExtra(ctx) {
  // pearl necklace
  for (let i = -5; i <= 5; i++) {
    const x = i * 11, y = SH_Y - 14 + Math.abs(i) * -2 + (25 - i * i) * 0.9;
    paint(ctx, c => c.arc(x, y, 7, 0, 7), '#FFFDF6', { lw: 3 });
  }
  // rose brooch on the cardigan
  ctx.save(); ctx.translate(-60, SH_Y + 76);
  for (let i = 0; i < 5; i++) { ctx.save(); ctx.rotate(i * 1.2566); paint(ctx, c => c.ellipse(0, -9, 8, 10, 0, 0, 7), '#E5587A', { lw: 3 }); ctx.restore(); }
  paint(ctx, c => c.arc(0, 0, 6, 0, 7), '#B8324F', { lw: 2.5 });
  paint(ctx, c => c.ellipse(14, 12, 10, 5, 0.6, 0, 7), '#4FA36B', { lw: 2.5 });
  ctx.restore();
}

crew.STYLES.rose = {
  female: true, glasses: true, mustache: false, steth: false,
  torso: (ctx, o) => crew.STYLES.anna.torso(ctx, o), // closed cardigan (jacket rig), short
  extra: roseExtra, hair: roseHair, hairBack: roseHairBack, skirt: '#7D4E8A',
  pal: {
    hair: HAIR, hairSh: '#8E8898', hairHi: HAIR_HI, browCore: '#8E8898',
    iris: '#6E8FB8', irisDk: '#4A6890', skin: '#F6D7C3', skinSh: '#DDB09A',
    jacket: '#B9A3DA', jacketSh: '#9A84BE', shirt: '#FFFFFF', sleeve: '#B9A3DA', sleeveSh: '#9A84BE', cuff: '#FFFFFF', button: '#FFFDF6',
    pants: '#EFCDB6', pantsSh: '#D9AE96', shoe: '#6B3E52', shoeSh: '#4A2A38',
  },
};

function drawRose(ctx, x, y, s, pose) { crew.drawCrew(ctx, x, y, s, pose, 'rose'); }

// ---- Biscuit: small tan terrier on a red leash ----
function drawDog(ctx, x, y, s, p = {}) {
  const o = Object.assign({ face: 1, bark: 0, tail: 0, look: 0, sit: 0 }, p);
  const FUR = '#E3B07A', FSH = '#C08850', DK = '#8A5A34';
  ctx.save(); ctx.translate(x, y); ctx.scale(s * o.face, s);
  ctx.save(); ctx.globalAlpha = 0.18; ctx.beginPath(); ctx.ellipse(0, 4, 110, 14, 0, 0, 7); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  // tail (wags)
  ctx.save(); ctx.translate(-80, -96); ctx.rotate(-0.6 + Math.sin(o.tail) * 0.35);
  paint(ctx, c => { c.moveTo(0, 0); c.quadraticCurveTo(-14, -40, -4, -70); c.quadraticCurveTo(10, -40, 12, 0); c.closePath(); }, FUR, { lw: 5 });
  ctx.restore();
  // legs
  for (const lx of [-60, -30, 40, 66]) {
    paint(ctx, c => roundRect(c, lx - 11, -70, 22, 70, 10), lx < 0 ? FSH : FUR, { lw: 5 });
    paint(ctx, c => c.ellipse(lx + 4, -4, 16, 9, 0, 0, 7), '#FFF4E6', { lw: 4 });
  }
  // body
  paint(ctx, c => c.ellipse(0, -96, 96, 46, 0, 0, 7), FUR, { shade: FSH, sx: -6, sy: -10 });
  // collar
  paint(ctx, c => roundRect(c, 52, -138, 22, 50, 8), '#E5484D', { lw: 4 });
  paint(ctx, c => c.arc(66, -88, 8, 0, 7), '#F2C744', { lw: 3 });
  // head
  const hx = 96, hy = -150 - o.bark * 6;
  paint(ctx, c => c.ellipse(hx, hy, 50, 46, 0, 0, 7), FUR, { shade: FSH, sx: -5, sy: -6 });
  // ears
  paint(ctx, c => { c.moveTo(hx - 34, hy - 30); c.lineTo(hx - 50, hy - 80); c.lineTo(hx - 6, hy - 44); c.closePath(); }, DK, { lw: 4.5 });
  paint(ctx, c => { c.moveTo(hx + 10, hy - 42); c.lineTo(hx + 22, hy - 92); c.lineTo(hx + 40, hy - 34); c.closePath(); }, DK, { lw: 4.5 });
  // snout + jaw (opens on bark)
  ctx.save(); ctx.translate(hx + 34, hy + 14); ctx.rotate(o.bark * 0.4);
  paint(ctx, c => c.ellipse(16, 14, 26, 10, 0, 0, 7), '#FFF4E6', { lw: 4 });
  ctx.restore();
  paint(ctx, c => c.ellipse(hx + 44, hy + 6, 32, 20, -0.1, 0, 7), '#FFF4E6', { lw: 4.5 });
  paint(ctx, c => c.ellipse(hx + 72, hy - 2, 10, 8, 0, 0, 7), '#2A1A14', { lw: 0 });
  // eye
  paint(ctx, c => c.ellipse(hx + 8, hy - 12, 10, 12, 0, 0, 7), '#2A1A14', { lw: 0 });
  ctx.beginPath(); ctx.arc(hx + 5 + o.look * 2, hy - 16, 3.5, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
  // eyebrow tuft
  line(ctx, [[hx - 4, hy - 30], [hx + 18, hy - 32]], 5, DK);
  ctx.restore();
}

module.exports = { drawRose, drawDog };
