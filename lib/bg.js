// Static backgrounds, rendered once at 2x into offscreen canvases (world = 1080x1920).
const { createCanvas } = require('@napi-rs/canvas');
const { OL, paint, line, curve, roundRect, hash } = require('./draw');
const F = require('./fonts');

const RES = 1.5, X0 = -900, WW = 2880;
function mk(fn) { const c = createCanvas(WW * RES, 1920 * RES), x = c.getContext('2d'); x.scale(RES, RES); x.translate(-X0, 0); fn(x); return c; }

function wallpaper(x, base, dot, step = 70) {
  x.fillStyle = base; x.fillRect(X0, 0, WW, 1920);
  x.fillStyle = dot;
  for (let yy = 0; yy < 1920; yy += step) for (let xx = X0; xx < X0 + WW + step; xx += step) {
    const o = ((yy / step) % 2) * step / 2; x.save(); x.translate(xx + o, yy); x.rotate(Math.PI / 4); x.fillRect(-6, -6, 12, 12); x.restore();
  }
}
function vgrad(x, y0, y1, a, b) { const g = x.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
function floorTiles(x, y0, a, b, vp = 540) {
  x.fillStyle = a; x.fillRect(X0, y0, WW, 1920 - y0);
  // perspective checker
  const rows = 9; let yPrev = y0;
  for (let r = 0; r < rows; r++) {
    const yA = y0 + Math.pow(r / rows, 1.6) * (1920 - y0), yB = y0 + Math.pow((r + 1) / rows, 1.6) * (1920 - y0);
    for (let c = -30; c < 30; c++) {
      if ((r + c) % 2 === 0) continue;
      const wA = 90 + r * 18, wB = 90 + (r + 1) * 18;
      x.beginPath(); x.moveTo(vp + c * wA, yA); x.lineTo(vp + (c + 1) * wA, yA); x.lineTo(vp + (c + 1) * wB, yB); x.lineTo(vp + c * wB, yB); x.closePath();
      x.fillStyle = b; x.fill();
    }
    yPrev = yB;
  }
  const g = x.createLinearGradient(0, y0, 0, y0 + 160); g.addColorStop(0, 'rgba(0,0,0,0.22)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(X0, y0, WW, 160);
  line(x, [[X0, y0], [X0 + WW, y0]], 6, OL);
}
function windowSun(x, X, Y, w, h) {
  paint(x, c => roundRect(c, X - 16, Y - 16, w + 32, h + 32, 18), '#FFFFFF', { lw: 6 });
  x.save(); x.beginPath(); roundRect(x, X, Y, w, h, 8); x.clip();
  x.fillStyle = vgrad(x, Y, Y + h, '#7EC8F5', '#CDEBFF'); x.fillRect(X, Y, w, h);
  x.beginPath(); x.arc(X + w * 0.7, Y + h * 0.3, 60, 0, 7); x.fillStyle = '#FFE680'; x.fill();
  x.globalAlpha = 0.9; x.fillStyle = '#fff';
  for (const [a, b, s] of [[0.25, 0.5, 1], [0.6, 0.72, 0.8]]) { x.beginPath(); x.ellipse(X + w * a, Y + h * b, 70 * s, 26 * s, 0, 0, 7); x.ellipse(X + w * a + 40 * s, Y + h * b - 18 * s, 44 * s, 30 * s, 0, 0, 7); x.fill(); }
  x.globalAlpha = 1; x.fillStyle = '#7FB86A'; x.beginPath(); x.ellipse(X + w / 2, Y + h + 40, w * 0.8, 110, 0, 0, 7); x.fill();
  x.restore();
  line(x, [[X + w / 2, Y], [X + w / 2, Y + h]], 12, '#FFFFFF'); line(x, [[X, Y + h / 2], [X + w, Y + h / 2]], 12, '#FFFFFF');
  x.save(); x.beginPath(); roundRect(x, X, Y, w, h, 8); x.lineWidth = 5; x.strokeStyle = OL; x.stroke(); x.restore();
}
function plant(x, X, Y, s = 1) {
  x.save(); x.translate(X, Y); x.scale(s, s);
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.32; x.save(); x.rotate(a + Math.PI / 2);
    paint(x, c => { c.moveTo(0, 0); c.quadraticCurveTo(30, -70, 0, -150 - (i % 2) * 30); c.quadraticCurveTo(-30, -70, 0, 0); c.closePath(); }, i % 2 ? '#5FAE57' : '#4C9547', { lw: 4.5 }); x.restore(); }
  paint(x, c => { c.moveTo(-60, -10); c.lineTo(60, -10); c.lineTo(46, 90); c.lineTo(-46, 90); c.closePath(); }, '#E9785A', { shade: '#C95D42', sx: 10, sy: 0, lw: 5 });
  x.restore();
}
function calendar(x, X, Y) {
  paint(x, c => roundRect(c, X, Y, 170, 190, 14), '#FFFFFF', { lw: 5 });
  paint(x, c => roundRect(c, X, Y, 170, 56, 14), '#E5484D', { lw: 5 });
  x.fillStyle = '#fff'; x.font = '700 34px ' + F.EN; x.textAlign = 'center'; x.fillText('SAT', X + 85, Y + 42);
  x.fillStyle = OL; x.font = '700 96px ' + F.EN; x.fillText('12', X + 85, Y + 160);
  for (const dx of [40, 130]) { x.beginPath(); x.arc(X + dx, Y + 6, 9, 0, 7); x.fillStyle = '#888'; x.fill(); }
}

const kitchen = () => mk(x => {
  wallpaper(x, '#FFF1DC', '#F7DFC0');
  windowSun(x, 90, 380, 380, 440);
  // curtains
  for (const s of [-1, 1]) paint(x, c => { const X = s < 0 ? 70 : 490; c.moveTo(X - 10, 340); c.lineTo(X + 10 + (s < 0 ? 70 : -70) + 10 * s, 340); c.bezierCurveTo(X + s * -60 + 60 * (s < 0 ? 1 : -1), 600, X + (s < 0 ? 40 : -40), 760, X + (s < 0 ? 70 : -70), 880); c.lineTo(X - 10, 880); c.closePath(); }, '#F49E7E', { shade: '#DD7E5E', sx: 6, sy: 0, lw: 5 });
  paint(x, c => roundRect(c, 40, 322, 520, 24, 10), '#B07A50', { lw: 5 });
  calendar(x, 160, 960);
  // right side: window 2 + plant + chair
  windowSun(x, 1240, 420, 360, 420); plant(x, 1700, 1440, 1.1);
  paint(x, c => roundRect(c, 1200, 1250, 260, 30, 10), '#B07A50', { lw: 5 }); line(x, [[1230, 1280], [1230, 1520]], 14, OL); line(x, [[1430, 1280], [1430, 1520]], 14, OL);
  // shelf with jars
  paint(x, c => roundRect(c, 40, 1180, 520, 22, 8), '#B07A50', { lw: 5 });
  [[90, '#F5C04A'], [180, '#8CC9E8'], [270, '#F08C8C'], [360, '#B5DA8E']].forEach(([X, col]) => {
    paint(x, c => roundRect(c, X, 1080, 66, 100, 14), col, { shade: 'rgba(0,0,0,0.12)', sx: 8, sy: 0, lw: 5 });
    paint(x, c => roundRect(c, X - 4, 1066, 74, 22, 8), '#fff', { lw: 5 });
  });
  plant(x, 480, 1090, 0.7);
  // counter
  paint(x, c => roundRect(c, -920, 1290, 1540, 230, 0), '#C98B5B', { shade: '#A86F44', sx: 0, sy: -30 });
  paint(x, c => roundRect(c, -930, 1270, 1560, 40, 12), '#EDE3D6', { lw: 6 });
  // stove + upper cabinets on the far left
  paint(x, c => roundRect(c, -700, 1180, 300, 90, 10), '#3a3f4a', { lw: 6 }); for (const X of [-640, -520]) paint(x, c => c.ellipse(X, 1222, 46, 16, 0, 0, 7), '#5b6170', { lw: 4 });
  for (const X of [-860, -600, -340]) { paint(x, c => roundRect(c, X, 300, 240, 300, 16), '#D89A69', { shade: '#B87A4A', sx: 12, sy: 0 }); paint(x, c => roundRect(c, X + 100, 540, 40, 12, 6), '#7A5133', { lw: 3 }); }
  for (const X of [-880, -590, -270, 30, 320]) { paint(x, c => roundRect(c, X, 1330, 260, 160, 12), '#D89A69', { lw: 5 }); paint(x, c => roundRect(c, X + 110, 1350, 40, 12, 6), '#7A5133', { lw: 3 }); }
  floorTiles(x, 1520, '#F3E7D3', '#E2CDB0');
  // ceiling
  x.fillStyle = '#F7E6CC'; x.fillRect(X0, 0, WW, 110); line(x, [[X0, 110], [X0 + WW, 110]], 6, OL);
  line(x, [[300, 110], [300, 190]], 6, OL);
  paint(x, c => { c.moveTo(230, 250); c.quadraticCurveTo(300, 150, 370, 250); c.closePath(); }, '#7FB86A', { lw: 6 });
});

const topdown = () => mk(x => {
  x.fillStyle = '#F3E7D3'; x.fillRect(X0, 0, WW, 1920);
  for (let r = 0; r < 20; r++) for (let c = -9; c < 19; c++) if ((r + c) % 2) { x.fillStyle = '#E2CDB0'; x.fillRect(c * 110 - 40, r * 110 - 30, 110, 110); }
  x.globalAlpha = 0.25; for (let i = 0; i < 40; i++) { x.fillStyle = '#C9B08F'; x.beginPath(); x.arc(X0 + hash(i) * WW, hash(i + 9) * 1920, 4, 0, 7); x.fill(); } x.globalAlpha = 1;
});

const bathroom = () => mk(x => {
  x.fillStyle = '#DDF3EC'; x.fillRect(X0, 0, WW, 1920);
  x.strokeStyle = '#B9E0D4'; x.lineWidth = 4;
  for (let y = 700; y < 1520; y += 80) { x.beginPath(); x.moveTo(X0, y); x.lineTo(X0 + WW, y); x.stroke(); }
  for (let y = 700; y < 1520; y += 80) for (let X = X0 + ((y / 80) % 2) * 40; X < X0 + WW; X += 80) { x.beginPath(); x.moveTo(X, y); x.lineTo(X, y + 80); x.stroke(); }
  x.fillStyle = '#C5EADF'; x.fillRect(X0, 680, WW, 24); line(x, [[X0, 680], [X0 + WW, 680]], 5, OL);
  // bathtub + towel rack on the far right, toilet-free cabinet on the left
  paint(x, c => roundRect(c, 1120, 1240, 760, 280, 60), '#FFFFFF', { shade: '#DCE6EA', sx: 20, sy: 0 }); paint(x, c => roundRect(c, 1100, 1220, 800, 50, 25), '#FFFFFF', { lw: 6 });
  for (let i = 0; i < 5; i++) paint(x, c => c.arc(1300 + i * 120, 1215, 40, Math.PI, 0), '#FFFFFF', { lw: 4 });
  paint(x, c => roundRect(c, -700, 900, 380, 600, 20), '#F7E1B5', { shade: '#DBC08F', sx: 14, sy: 0 }); line(x, [[-510, 920], [-510, 1480]], 5, OL);
  paint(x, c => roundRect(c, -620, 760, 200, 26, 10), '#C8D3D9', { lw: 5 }); paint(x, c => roundRect(c, -600, 786, 70, 160, 10), '#FFC0CF', { lw: 5 }); paint(x, c => roundRect(c, -510, 786, 70, 130, 10), '#9AD0F5', { lw: 5 });
  // mirror
  paint(x, c => c.ellipse(330, 560, 190, 240, 0, 0, 7), '#F7E1B5', { lw: 6 });
  x.save(); x.beginPath(); x.ellipse(330, 560, 160, 210, 0, 0, 7); x.clip(); x.fillStyle = vgrad(x, 350, 770, '#CFEFFF', '#9FD3EE'); x.fillRect(150, 340, 400, 440);
  x.globalAlpha = 0.6; x.fillStyle = '#fff'; x.save(); x.translate(260, 470); x.rotate(-0.6); x.fillRect(-12, -120, 24, 240); x.fillRect(30, -80, 12, 170); x.restore(); x.restore();
  x.save(); x.beginPath(); x.ellipse(330, 560, 160, 210, 0, 0, 7); x.lineWidth = 6; x.strokeStyle = OL; x.stroke(); x.restore();
  // shelf + cup with toothbrushes
  paint(x, c => roundRect(c, 150, 860, 360, 20, 8), '#FFFFFF', { lw: 5 });
  paint(x, c => roundRect(c, 200, 780, 70, 80, 14), '#FF9EB1', { lw: 5 });
  line(x, [[220, 790], [205, 720]], 12, OL); line(x, [[220, 790], [205, 720]], 6, '#5BB8F0');
  line(x, [[250, 790], [262, 724]], 12, OL); line(x, [[250, 790], [262, 724]], 6, '#FFD54A');
  paint(x, c => roundRect(c, 380, 790, 60, 70, 12), '#FFFFFF', { lw: 5 });
  // sink
  paint(x, c => { c.moveTo(150, 1040); c.lineTo(510, 1040); c.bezierCurveTo(510, 1170, 410, 1210, 330, 1210); c.bezierCurveTo(250, 1210, 150, 1170, 150, 1040); c.closePath(); }, '#FFFFFF', { shade: '#DCE6EA', sx: 14, sy: 0 });
  paint(x, c => roundRect(c, 290, 1200, 80, 320, 10), '#FFFFFF', { shade: '#DCE6EA', sx: 14, sy: 0 });
  paint(x, c => roundRect(c, 300, 990, 60, 50, 10), '#C8D3D9', { lw: 5 });
  paint(x, c => roundRect(c, 318, 960, 90, 30, 12), '#C8D3D9', { lw: 5 });
  // shower area on right: curtain rail + curtain (left part)
  paint(x, c => roundRect(c, 600, 250, 560, 20, 8), '#C8D3D9', { lw: 5 });
  for (let i = 0; i < 4; i++) paint(x, c => { const X = 610 + i * 40; c.moveTo(X, 270); c.lineTo(X + 40, 270); c.bezierCurveTo(X + 60, 800, X + 30, 1200, X + 44, 1520); c.lineTo(X + 4, 1520); c.bezierCurveTo(X - 10, 1200, X + 20, 800, X, 270); c.closePath(); }, i % 2 ? '#FFD0DB' : '#FFC0CF', { lw: 4.5 });
  floorTiles(x, 1520, '#F2F7F7', '#D7E7EA');
  // bathmat
  paint(x, c => c.ellipse(420, 1640, 230, 60, 0, 0, 7), '#9AD0F5', { lw: 5 });
});

const bedroom = () => mk(x => {
  wallpaper(x, '#ECE6FF', '#DDD3FA', 80);
  // bed (left)
  paint(x, c => roundRect(c, -820, 1180, 760, 340, 30), '#F7A7C0', { shade: '#E07FA0', sx: 0, sy: -20 }); paint(x, c => roundRect(c, -860, 980, 60, 540, 20), '#B98A63', { lw: 6 }); paint(x, c => roundRect(c, -790, 1110, 220, 110, 40), '#FFFFFF', { lw: 6 });
  windowSun(x, 1260, 420, 400, 460); plant(x, 1600, 1440, 1.0);
  // wardrobe
  paint(x, c => roundRect(c, 600, 380, 420, 1150, 22), '#B98A63', { shade: '#956946', sx: 18, sy: 0 });
  line(x, [[810, 400], [810, 1510]], 6, OL);
  for (const X of [780, 840]) paint(x, c => roundRect(c, X - 8, 900, 16, 90, 8), '#F2C14E', { lw: 4 });
  // poster
  paint(x, c => roundRect(c, 110, 420, 360, 470, 10), '#FFF6E8', { lw: 6 });
  x.fillStyle = '#E5484D'; x.font = '700 70px ' + F.EN; x.textAlign = 'center'; x.fillText('I', 230, 560); paint(x, c => { const X = 320, Y = 535; c.moveTo(X, Y + 28); c.bezierCurveTo(X - 46, Y - 6, X - 22, Y - 40, X, Y - 16); c.bezierCurveTo(X + 22, Y - 40, X + 46, Y - 6, X, Y + 28); c.closePath(); }, '#E5484D', { lw: 5 });
  x.fillStyle = OL; x.font = '700 64px ' + F.EN; x.fillText('ENGLISH', 290, 650);
  x.font = '600 34px ' + F.EN; x.fillStyle = '#7A5CC9'; x.fillText('(and sleep)', 290, 720);
  // lamp
  line(x, [[200, 1000], [200, 1300]], 10, OL);
  paint(x, c => { c.moveTo(130, 1000); c.lineTo(270, 1000); c.lineTo(240, 920); c.lineTo(160, 920); c.closePath(); }, '#FFCF6E', { lw: 5 });
  paint(x, c => roundRect(c, 120, 1300, 160, 220, 12), '#C9A27E', { lw: 5 });
  floorTiles(x, 1520, '#D7B98F', '#CDAE84');
  // rug
  paint(x, c => c.ellipse(540, 1700, 380, 100, 0, 0, 7), '#F7A7C0', { lw: 6 });
  x.save(); x.beginPath(); x.ellipse(540, 1700, 300, 70, 0, 0, 7); x.lineWidth = 6; x.strokeStyle = '#FFFFFF'; x.setLineDash([18, 14]); x.stroke(); x.restore();
});

const hallway = () => mk(x => {
  wallpaper(x, '#FFE9D6', '#F8D6B6', 90);
  // door frame + door is a prop; frame here
  paint(x, c => roundRect(c, 300, 420, 480, 1110, 10), '#8A5A3C', { lw: 6 });
  x.fillStyle = '#2A1B16'; x.fillRect(330, 450, 420, 1080);
  // coat rack
  line(x, [[120, 600], [120, 1520]], 14, OL); line(x, [[120, 600], [120, 1520]], 6, '#A0704C');
  paint(x, c => { c.moveTo(80, 760); c.bezierCurveTo(60, 900, 70, 1050, 110, 1100); c.lineTo(170, 1100); c.bezierCurveTo(190, 1000, 180, 860, 160, 760); c.closePath(); }, '#5B8DD6', { lw: 5 });
  paint(x, c => c.ellipse(120, 640, 60, 26, 0, 0, 7), '#E5484D', { lw: 5 });
  paint(x, c => roundRect(c, -600, 520, 300, 420, 150), '#F7E1B5', { lw: 6 }); x.save(); x.beginPath(); roundRect(x, -570, 550, 240, 360, 120); x.fillStyle = '#BEE3F5'; x.fill(); x.restore();
  paint(x, c => roundRect(c, -700, 1380, 500, 140, 14), '#B98A63', { lw: 6 }); for (let i = 0; i < 4; i++) paint(x, c => c.ellipse(-620 + i * 115, 1370, 46, 20, 0, 0, 7), ['#E5484D', '#5BB8F0', '#FFD54A', '#7FC97A'][i], { lw: 5 });
  plant(x, 1400, 1440, 1.1); windowSun(x, 1250, 500, 320, 380);
  // big calendar
  paint(x, c => roundRect(c, 840, 560, 200, 230, 16), '#FFFFFF', { lw: 6 });
  paint(x, c => roundRect(c, 840, 560, 200, 66, 16), '#E5484D', { lw: 6 });
  x.fillStyle = '#fff'; x.font = '700 40px ' + F.EN; x.textAlign = 'center'; x.fillText('SAT', 940, 610);
  x.fillStyle = OL; x.font = '700 110px ' + F.EN; x.fillText('12', 940, 750);
  floorTiles(x, 1520, '#E9D3B8', '#D9BE9E');
  paint(x, c => roundRect(c, 340, 1540, 400, 70, 20), '#7FBF7A', { lw: 5 });
  x.fillStyle = '#fff'; x.font = '700 40px ' + F.EN; x.fillText('HELLO', 540, 1590);
});

module.exports = { kitchen, bathroom, bedroom, hallway, topdown, RES, X0, WW };
