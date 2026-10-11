const { mk, talk, cam, applyCam, life, mouthFor, clamp, lerp, ease, seg, noise1 } = require('./engine');
const { drawSofia } = require('../lib/sofia');
const { drawGus } = require('../lib/gus');
const P = require('../lib/props');
const { OL, paint, line, curve, roundRect, hash } = require('../lib/draw');
const U = require('../lib/ui');
const F = require('../lib/fonts');
const BG = require('../lib/bg');

const bgs = {}; const bg = n => (bgs[n] = bgs[n] || BG[n]());
function drawBg(ctx, n) { ctx.drawImage(bg(n), BG.X0, 0, BG.WW, 1920); }

// Sofia standing on floorY; returns hip point
function sofia(ctx, x, floorY, s, pose, t, seed = 0, speak = true) {
  const lf = life(t, seed);
  const lvl = speak ? talk('sofia', t) : 0;
  const p = Object.assign({}, pose);
  p.blink = Math.max(p.blink || 0, lf.blink);
  p.bob = (p.bob || 0) + lf.bob;
  p.mouth = pose.mouthLock ? pose.mouth : mouthFor(lvl, pose.mouth || {}, t);
  if (lvl > 0.05 && !pose.noTalkHead) p.tilt = (p.tilt || 0) + noise1(t * 1.7) * 0.05;
  drawSofia(ctx, x, floorY - 262 * s, s, p);
}
function gus(ctx, x, floorY, s, p, t) {
  const lvl = talk('gus', t);
  drawGus(ctx, x, floorY, s, Object.assign({}, p, { honk: Math.max(p.honk || 0, lvl * 0.7) }));
}
const pulse = (t, a, d = 0.5) => clamp(1 - Math.abs(t - a) / d);

// ------------------------------------------------------------------ HOOK
const hook = (() => {
  const { m, k } = mk('hook');
  const FX = 560, FY = 470, SX = 795, FW = 470;
  return {
    sfx: [['light', 0, 'fridge'], ['l01', 0.2, 'pop'], ['reveal', -0.4, 'whoosh'], ['reveal', 0, 'slam'], ['gus', 0, 'waddle'], ['l01b', 4.5, 'tick']],
    draw(ctx, t) {
      const lw = m('l01'), wds = require('./timeline.json').lines.find(l => l.id === 'l01').words;
      const pull = wds[5] ? wds[5].t0 : lw + 2.5; // "normal"
      const C = cam([[0, 795, 900, 1.7, 0], [m('light'), 795, 1010, 2.9, 0, 'cut'], [lw + 0.6, 795, 1010, 2.6, 0], [pull - 0.2, 795, 1010, 2.5, 0], [pull + 0.55, 620, 1040, 1.0, 0, 'out'], [m('gus'), 600, 1040, 1.0, 0], [m('gus') + 1.4, 520, 1100, 1.08, 0], [m('l01b') + 4.6, 470, 1080, 1.35, 0], [m('l01b_end') + 0.3, 470, 1080, 1.4, 0]], t);
      ctx.save(); applyCam(ctx, C, t > pull - 0.1 && t < pull + 0.3 ? 6 : 0, t);
      drawBg(ctx, 'kitchen'); P.clock(ctx, 795, 330, 7, 0);
      const open = ease.out(k(t, 'light', 0.45));
      P.fridge(ctx, FX, FY, { open, note: true }, c => {
        const awake = t > lw + 0.15;
        const surprise = clamp(1 - (t - lw - 0.15) / 0.8);
        sofia(c, SX - FX, 1500 - FY, 0.66, {
          outfit: 'pajama', mask: true, hairMess: 0.7,
          blink: awake ? 0 : 1, sleepy: awake ? 0 : 1, wide: awake ? surprise * 0.8 : 0,
          brow: awake ? { l: 0.5 + surprise * 0.5, r: 0.6 + surprise * 0.4 } : { l: -0.2, r: -0.2 },
          mouth: awake ? { smile: 0.9 } : { smile: 0.1 },
          armL: awake ? [-150, -60 - surprise * 120] : [-30, -40], armR: awake ? [210, -360] : [30, -40], handR: awake ? 'open' : 'mitten', handL: awake ? 'open' : 'mitten',
          squash: 1 + surprise * 0.04,
        }, t, 1);
        if (!awake) P.zzz(c, SX - FX + 70, 1500 - FY - 640, t);
      });
      // Gus waddles in
      if (t > m('gus') - 0.1) {
        const wk = ease.out(k(t, 'gus', 1.5)); const gx = lerp(-900, 300, wk);
        const turnHead = clamp((t - m('l01b') - 4.3) / 0.4);
        gus(ctx, gx, 1600, 0.95, { walking: wk < 1, walk: t * 2.2, lids: 0.6, look: lerp(1, -0.2, turnHead), tie: true }, t);
        // name tag
        const tk = clamp((t - m('l01b') - 0.6) / 0.35);
        if (tk > 0) {
          ctx.save(); ctx.translate(gx - 20, 980); ctx.rotate(-0.08); ctx.scale(ease.back(tk), ease.back(tk));
          paint(ctx, c => roundRect(c, -170, -60, 340, 120, 24), '#2E6FD8', { lw: 7 });
          U.textOutlined(ctx, 'GUS', 0, 0, 62, '#fff', { olw: 10 });
          ctx.font = '700 32px ' + F.EN; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('best friend · goose', 0, 42);
          ctx.restore();
        }
      }
      ctx.restore();
      // darkness before the light
      const dk = 1 - k(t, 'light', 0.35);
      if (dk > 0) { ctx.fillStyle = `rgba(10,8,20,${0.92 * dk})`; ctx.fillRect(0, 0, 1920, 1080); }
      if (t < m('light')) { ctx.save(); applyCam(ctx, C, 0, t); ctx.fillStyle = `rgba(255,240,180,${0.6 + 0.4 * Math.sin(t * 20)})`; ctx.fillRect(FX + FW - 26, 800, 10, 600); ctx.restore(); }
      // title slam
      const sk = k(t, 'reveal', 0.35, -0.3);
      if (sk > 0 && t < m('gus') + 0.2) {
        const out = clamp((t - m('gus')) / 0.2);
        ctx.save(); ctx.translate(520, 330); const sc = lerp(2.4, 1, ease.out(sk)) * (1 - out) * 0.9; ctx.scale(sc, sc); ctx.rotate(-0.06);
        U.textOutlined(ctx, 'MY NORMAL', 0, -40, 118, '#FFFFFF', { olw: 22 });
        U.textOutlined(ctx, 'MORNING', 0, 90, 136, U.ORANGE, { olw: 24 });
        const st = clamp((t - m('reveal') - 0.25) / 0.25);
        if (st > 0) { ctx.save(); ctx.translate(210, 190); ctx.rotate(0.18); ctx.scale(lerp(2, 1, ease.out(st)), lerp(2, 1, ease.out(st))); ctx.globalAlpha = st;
          paint(ctx, c => roundRect(c, -190, -50, 380, 100, 14), 'rgba(255,255,255,0)', { lw: 9, ol: U.RED });
          U.textOutlined(ctx, '(NOT NORMAL)', 0, 20, 56, U.RED, { ol: false }); ctx.restore(); }
        ctx.restore();
      }
    },
  };
})();

// ------------------------------------------------------------------ WAKE (inside-fridge POV + wide)
const wake = (() => {
  const { m, k, t0 } = mk('wake');
  const FX = 560, FY = 470, SX = 795;
  return {
    sfx: [['honk', 0, 'honk'], ['honk', 0.05, 'boing'], ['card', 0, 'card'], ['turn', 0, 'ding']],
    progress: 1 / 8,
    draw(ctx, t) {
      const pov = t < m('l02') - 0.05;
      if (pov) {
        // POV from inside the fridge: Gus fills the doorway and HONKS
        const hk = k(t, 'honk', 0.25);
        ctx.fillStyle = '#FFF3D6'; ctx.fillRect(0, 0, 1920, 1080);
        ctx.save(); const z = 1 + hk * 0.15; ctx.translate(960, 560); ctx.scale(z, z); ctx.translate(-960, -560);
        // kitchen seen through the open door
        ctx.save(); ctx.translate(960, 540); ctx.scale(0.75, 0.75); ctx.translate(-200, -1050); drawBg(ctx, 'kitchen'); ctx.restore();
        gus(ctx, 860, 1560, 1.85, { lids: hk > 0 ? 0.05 : 0.6, honk: hk > 0 ? Math.min(1, 2 - (t - m('honk')) * 1.2) : 0, wing: hk > 0 ? 0.6 + 0.4 * Math.sin(t * 30) : 0, look: -0.6 }, t);
        ctx.restore();
        // fridge interior frame (perspective walls + shelf edges)
        ctx.fillStyle = '#E7F1F1';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(300, 130); ctx.lineTo(300, 950); ctx.lineTo(0, 1080); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(1920, 0); ctx.lineTo(1620, 130); ctx.lineTo(1620, 950); ctx.lineTo(1920, 1080); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1920, 0); ctx.lineTo(1620, 130); ctx.lineTo(300, 130); ctx.closePath(); ctx.fillStyle = '#D5E6E6'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(0, 1080); ctx.lineTo(1920, 1080); ctx.lineTo(1620, 950); ctx.lineTo(300, 950); ctx.closePath(); ctx.fill();
        for (const yy of [380, 680]) { ctx.fillStyle = 'rgba(160,200,210,0.6)'; ctx.beginPath(); ctx.moveTo(0, yy - 60); ctx.lineTo(300, yy); ctx.lineTo(300, yy + 12); ctx.lineTo(0, yy - 40); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(1920, yy - 60); ctx.lineTo(1620, yy); ctx.lineTo(1620, yy + 12); ctx.lineTo(1920, yy - 40); ctx.closePath(); ctx.fill(); }
        line(ctx, [[300, 130], [1620, 130], [1620, 950], [300, 950], [300, 130]], 8, OL);
        P.tube(ctx, 150, 880, 0.1, 'MAYO'); paint(ctx, c => roundRect(c, 1700, 700, 110, 260, 16), '#FFFFFF', { lw: 6 }); paint(ctx, c => roundRect(c, 1700, 680, 110, 40, 10), '#5BB8F0', { lw: 6 });
        const g = ctx.createRadialGradient(960, 60, 10, 960, 60, 1000); g.addColorStop(0, 'rgba(255,250,210,0.35)'); g.addColorStop(1, 'rgba(255,250,210,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
        P.burst(ctx, 1300, 300, 'HONK!', hk > 0 ? clamp((t - m('honk')) / 1.3) : 0, '#FFD23F', -0.1, 1.1);
        // 7:00 AM stamp
        const sk = clamp((t - t0) / 0.3);
        ctx.save(); ctx.translate(1660, 1000); ctx.rotate(0.08); ctx.scale(sk * 0.8, sk * 0.8);
        paint(ctx, c => roundRect(c, -170, -64, 340, 128, 26), '#2A1B16', { lw: 0 }); U.textOutlined(ctx, '7:00 AM', 0, 24, 78, '#FF6B6B', { ol: false }); ctx.restore();
        return;
      }
      const C = cam([[m('l02'), 795, 1000, 1.25, 0], [m('l03'), 795, 1000, 1.3, 0], [m('l03') + 0.6, 800, 1030, 2.2, 0, 'out'], [m('l03_end'), 800, 1030, 2.25, 0], [m('l03_end') + 0.3, 700, 1060, 1.05, 0], [m('turn') + 2.4, 700, 1060, 1.1, 0]], t);
      ctx.save(); applyCam(ctx, C, 0, t);
      drawBg(ctx, 'kitchen'); P.clock(ctx, 795, 330, 7, 0);
      const deadpan = t > m('l03') + 0.5 && t < m('l03_end') + 0.2;
      P.fridge(ctx, FX, FY, { open: 1 }, c => {
        sofia(c, SX - FX, 1500 - FY, 0.66, {
          outfit: 'pajama', mask: true, hairMess: 1,
          sleepy: deadpan ? 0.55 : 0, brow: deadpan ? { l: -0.3, r: -0.3 } : { l: 0.4, r: 0.4 },
          mouth: { smile: deadpan ? -0.2 : 0.8 }, look: deadpan ? [0, 0.1] : [0, 0],
          armL: [-150, -150], armR: t > m('card') ? [180, -300] : [150, -150], handR: t > m('card') ? 'open' : 'mitten', handL: 'mitten',
        }, t, 1);
      });
      gus(ctx, 330, 1610, 0.95, { lids: 0.6, look: 1 }, t);
      ctx.restore();
    },
  };
})();

// ------------------------------------------------------------------ GET UP (slip + top-down)
const getup = (() => {
  const { m, k } = mk('getup');
  return {
    sfx: [['slip', 0.05, 'slip'], ['slip', 0.7, 'thud'], ['l06', 0, 'tweet'], ['card', 0, 'card'], ['turn', 0, 'ding']],
    progress: 2 / 8,
    draw(ctx, t) {
      const top = t > m('slip') + 0.75;
      if (!top) {
        const C = cam([[m('l05') - 0.3, 760, 1050, 1.15, 0], [m('slip'), 700, 1080, 1.1, 0], [m('slip') + 0.5, 650, 1250, 1.4, -0.08, 'out']], t);
        ctx.save(); applyCam(ctx, C, t > m('slip') + 0.6 ? 14 : 0, t);
        drawBg(ctx, 'kitchen'); P.clock(ctx, 795, 330, 7, 2);
        P.fridge(ctx, 560, 470, { open: 1 });
        // banana peel
        ctx.save(); ctx.translate(560, 1560); paint(ctx, c => { c.moveTo(-50, 10); c.quadraticCurveTo(0, -30, 50, 10); c.quadraticCurveTo(10, 0, 30, 30); c.quadraticCurveTo(0, 0, -30, 30); c.quadraticCurveTo(-10, 0, -50, 10); c.closePath(); }, '#FFE066', { lw: 5 }); ctx.restore();
        const step = ease.inOut(clamp((t - m('l05')) / 0.9));
        const sl = clamp((t - m('slip')) / 0.7);
        let x = lerp(795, 610, step), fy = 1530, rot = 0, lift = 0;
        if (sl > 0) { rot = -ease.in(sl) * 1.6; lift = Math.sin(sl * Math.PI) * 260; x -= sl * 60; }
        ctx.save(); ctx.translate(x, fy - lift); ctx.rotate(rot); ctx.translate(-x, -fy);
        sofia(ctx, x, fy, 0.92, { outfit: 'pajama', mask: true, hairMess: 1, legs: sl > 0 ? 'stand' : 'walk', walk: t * 1.6, wide: sl, brow: sl > 0 ? { l: 1, r: 1 } : { l: 0.3, r: 0.3 }, mouth: sl > 0 ? { o: 1 } : { smile: 0.9 }, armL: sl > 0 ? [-200, -420] : [-120, -60], armR: sl > 0 ? [200, -420] : [150, -330], handR: 'fist', handL: sl > 0 ? 'open' : 'mitten' }, t, 1, sl === 0);
        ctx.restore();
        gus(ctx, 220, 1610, 0.9, { lids: 0.6, look: 1 }, t);
        ctx.restore();
        return;
      }
      // BIRD'S-EYE VIEW: Sofia flat on the floor, Gus looking down from the top
      const C = cam([[m('slip') + 0.75, 540, 1000, 1.25, 0.05], [m('l06'), 540, 1000, 1.15, 0.02], [m('card'), 540, 1060, 0.95, 0], [m('turn') + 2.4, 540, 1060, 1.0, 0]], t);
      ctx.save(); applyCam(ctx, C, t < m('slip') + 1 ? 10 : 0, t);
      drawBg(ctx, 'topdown');
      ctx.save(); ctx.translate(560, 1080); ctx.rotate(-0.45);
      sofia(ctx, 0, 330, 0.95, { outfit: 'pajama', mask: true, hairMess: 1.1, legs: 'stand', blink: t < m('l06') + 0.2 ? 1 : 0, sleepy: 0.6, brow: { worry: 1 }, mouth: { smile: -0.5 }, armL: [-230, -160], armR: [230, -160], handL: 'open', handR: 'open', look: [0, -1] }, t, 3);
      ctx.restore();
      P.stars(ctx, 540, 520, t, 150);
      // banana peel flat
      ctx.save(); ctx.translate(820, 1650); ctx.rotate(0.5); paint(ctx, c => { c.moveTo(-60, 10); c.quadraticCurveTo(0, -36, 60, 10); c.quadraticCurveTo(12, 0, 36, 40); c.quadraticCurveTo(0, 0, -36, 40); c.quadraticCurveTo(-12, 0, -60, 10); c.closePath(); }, '#FFE066', { lw: 6 }); ctx.restore();
      // Gus head peeking from the top edge
      ctx.save(); ctx.translate(1060, -330); ctx.rotate(Math.PI); gus(ctx, 0, 0, 1.5, { lids: 0.6, look: 0, tie: false }, t); ctx.restore();
      ctx.restore();
      // compare panel during the card
      const ck = k(t, 'l07', 0.4);
      if (ck > 0 && t < m('turn')) {
        ctx.save(); ctx.translate(430, 620); ctx.scale(ease.back(ck) * 0.62, ease.back(ck) * 0.62);
        for (const [i, a, b, ic] of [[-1, 'wake up', 'eyes', 'eye'], [1, 'get up', 'body', 'up']]) {
          const on = i < 0 ? t < (require('./timeline.json').lines.find(l => l.id === 'l07').t0 + 1.4) : t > (require('./timeline.json').lines.find(l => l.id === 'l07').t0 + 1.4);
          ctx.save(); ctx.translate(i * 250, 0); ctx.scale(on ? 1.08 : 0.95, on ? 1.08 : 0.95);
          paint(ctx, c => roundRect(c, -220, -150, 440, 300, 40), on ? '#FFFFFF' : '#F3EAE2', { lw: 7 });
          U.icon(ctx, ic, 0, -60, 1.3);
          U.textOutlined(ctx, a, 0, 50, 64, U.ORANGE, { olw: 11 });
          ctx.font = '700 40px ' + F.EN; ctx.fillStyle = OL; ctx.textAlign = 'center'; ctx.fillText('= your ' + b, 0, 112);
          ctx.restore();
        }
        ctx.restore();
      }
    },
  };
})();

// ------------------------------------------------------------------ TEETH
const teeth = (() => {
  const { m, k } = mk('teeth');
  return {
    sfx: [['l08', 0.5, 'squeeze'], ['taste', 0.3, 'shudder'], ['gus', 0, 'slide'], ['card', 0, 'card'], ['turn', 0, 'ding']],
    progress: 3 / 8,
    draw(ctx, t) {
      const ecu = t > m('taste') && t < m('l09_end') + 0.2;
      const C = cam([[m('l08') - 0.2, 420, 980, 1.2, 0], [m('taste'), 380, 900, 1.45, 0], [m('taste') + 0.4, 340, 860, 2.4, 0.04, 'out'], [m('l09_end') + 0.2, 340, 860, 2.55, 0.04], [m('gus'), 480, 1000, 1.15, 0, 'cut'], [m('turn') + 2.4, 480, 1000, 1.2, 0]], t);
      ctx.save(); applyCam(ctx, C, ecu && t > m('l09') + 1.6 ? 8 : 0, t);
      drawBg(ctx, 'bathroom');
      const MW = require('./timeline.json').lines.find(l => l.id === 'l09').words.find(w => /^mayo/i.test(w.w));
      const disgust = clamp((t - MW.t0 + 0.1) / 0.25) * (t < m('l09_end') + 0.8 ? 1 : 0);
      const brush = t > m('l08') + 0.3 && t < m('taste') + 0.7;
      const scrub = brush ? Math.sin(t * 26) * 9 : 0;
      sofia(ctx, 330, 1530, 0.95, {
        outfit: 'pajama', hairMess: 0.8, mask: false,
        brow: disgust ? { angry: 0.2, worry: 0.8, l: 0.5, r: -0.2 } : t > m('taste') ? { l: 0.6, r: -0.1 } : { l: 0.2, r: 0.2 },
        mouthLock: disgust > 0.3, mouth: disgust ? { bleh: true } : brush ? { open: 0.45, smile: 0.7, teeth: 1, w: 1.1 } : { smile: 0.8 },
        wide: 0, sleepy: disgust * 0.55, look: t > m('taste') && !disgust ? [0.4, 0.5] : [0, 0],
        armR: brush ? [118 + scrub, -372] : [150, -120], handR: 'fist', armsFront: brush, holdR: !brush && t > m('l08') ? (c) => { line(c, [[0, 8], [0, -96]], 20, OL); line(c, [[0, 8], [0, -96]], 11, '#5BB8F0'); paint(c, q => roundRect(q, -11, -132, 22, 40, 7), '#FFFFFF', { lw: 4 }); } : brush ? (c, s, ang) => { c.translate(-6, 6); line(c, [[0, 0], [-104, 0]], 20, OL); line(c, [[0, 0], [-104, 0]], 11, '#5BB8F0'); paint(c, q => roundRect(q, -140, -12, 40, 22, 7), '#FFFFFF', { lw: 4 }); paint(c, q => roundRect(q, -138, -24, 34, 14, 5), '#E6F4FF', { lw: 3 }); } : null,
        armL: [-160, -260], handL: 'fist', holdL: t < m('gus') ? (c) => { P.tube(c, 0, -10, 0, 'MAYO'); } : null,
        tilt: disgust ? Math.sin(t * 40) * 0.04 : 0,
      }, t, 2);
      if (t > m('gus') - 0.1) {
        const gx = lerp(1300, 820, ease.out(k(t, 'gus', 0.6)));
        gus(ctx, gx, 1610, 0.95, { face: -1, lids: 0.6, look: 0.3, hold: (c, face, H) => { c.translate(H.hx + 150, H.hy + 14); c.scale(face, 1); c.rotate(face * -Math.PI / 2); P.tube(c, 0, 60, 0, 'PASTE'); } }, t);
      }
      ctx.restore();
      if (ecu && disgust > 0.5) U.textOutlined(ctx, 'MAYO?!', 1450, 380, 150, '#FFF6D8', { olw: 24 });
    },
  };
})();

// ------------------------------------------------------------------ SHOWER
const shower = (() => {
  const { m, k } = mk('shower');
  return {
    sfx: [['l11', 0, 'shower'], ['sputter', 0, 'sputter'], ['can', 0.2, 'pour'], ['card', 0, 'card'], ['turn', 0, 'ding']],
    progress: 4 / 8,
    draw(ctx, t) {
      const C = cam([[m('l11') - 0.2, 820, 980, 1.25, 0], [m('sputter'), 820, 900, 1.6, 0], [m('can'), 820, 900, 1.6, 0], [m('can') + 0.7, 800, 560, 1.2, 0, 'out'], [m('l12') + 0.2, 800, 560, 1.2, 0], [m('l12') + 0.9, 840, 760, 1.2, 0], [m('card'), 760, 960, 1.05, 0], [m('turn') + 2.4, 760, 960, 1.1, 0]], t);
      ctx.save(); applyCam(ctx, C, 0, t);
      drawBg(ctx, 'bathroom');
      const sx = 840;
      // water from shower head until sputter, then from Gus's can
      const runHead = t < m('sputter') + 0.3 ? 1 : t < m('sputter') + 1.0 ? 0.15 : 0;
      P.showerHead(ctx, 860, 420);
      if (runHead > 0) P.water(ctx, 860, 440, t, runHead, 120, 700, 3);
      // Sofia behind the curtain: only head + shoulders above it (shower cap)
      const happy = t < m('sputter');
      const flat = t > m('can') + 0.8;
      ctx.save(); ctx.beginPath(); ctx.rect(600, 0, 480, 1060); ctx.clip();
      sofia(ctx, sx, 1530, 0.98, { outfit: 'pajama', glasses: false, hair: 'bun', happyEyes: happy && t > m('l11') + 0.3 ? 1 : 0, mouth: { smile: flat ? -0.3 : 0.9 }, sleepy: flat ? 0.6 : 0, brow: flat ? { l: -0.4, r: -0.4 } : t > m('sputter') ? { worry: 1, l: 0.4, r: 0.4 } : { l: 0.3, r: 0.3 }, look: t > m('sputter') && !flat ? [0.4, -1] : [0, 0], armL: [-120, -560], armR: [120, -560], handL: 'fist', handR: 'fist' }, t, 4);
      ctx.restore();
      // shower cap
      paint(ctx, c => { c.ellipse(sx, 1530 - 262 * 0.98 - 455 * 0.98 - 130, 200, 90, 0, Math.PI, 0); c.closePath(); }, '#FFB3C7', { lw: 6 });
      // curtain in front (lower part)
      for (let i = 0; i < 6; i++) paint(ctx, c => { const X = 600 + i * 80; c.moveTo(X, 1000); c.lineTo(X + 80, 1000); c.bezierCurveTo(X + 96, 1200, X + 70, 1400, X + 84, 1520); c.lineTo(X + 4, 1520); c.bezierCurveTo(X - 10, 1400, X + 16, 1200, X, 1000); c.closePath(); }, i % 2 ? '#FFD0DB' : '#FFC0CF', { lw: 4.5 });
      line(ctx, [[600, 1000], [1080, 1000]], 6, OL);
      // Gus on the curtain rail with a watering can
      if (t > m('can') - 0.3) {
        const ck = ease.out(k(t, 'can', 0.5, -0.3));
        const gy = lerp(-200, 268, ck);
        const pour = clamp((t - m('can') - 0.2) / 0.3);
        gus(ctx, 620, gy, 0.6, { lids: 0.6, look: 1, face: 1, hold: c => { c.translate(220, -420); P.wateringCan(c, 0, 0, pour * 0.7); } }, t);
        if (pour > 0) P.water(ctx, 620 + 0.6 * 220 + 90, gy - 0.6 * 420 + 40, t, 1, 60, 600, 7);
      }
      ctx.restore();
    },
  };
})();

// ------------------------------------------------------------------ QUIZ
const quiz = (() => {
  const { m, k } = mk('quiz');
  return {
    sfx: [['q01', 0, 'quizjingle'], ['opts', 0, 'pop'], ['opts', 0.4, 'pop'], ['count', 0, 'tick'], ['count', 1, 'tick'], ['count', 2, 'tick'], ['answer', 0, 'correct'], ['answer', 0.3, 'sadhonk']],
    progress: 4.5 / 8,
    draw(ctx, t) {
      // sunburst background
      ctx.fillStyle = '#FFE08A'; ctx.fillRect(0, 0, 1920, 1080);
      ctx.save(); ctx.translate(960, 560); ctx.rotate(t * 0.15);
      for (let i = 0; i < 20; i++) { ctx.rotate(Math.PI * 2 / 20); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-160, -1700); ctx.lineTo(160, -1700); ctx.closePath(); ctx.fillStyle = i % 2 ? '#FFD45E' : '#FFE9A8'; ctx.fill(); }
      ctx.restore();
      const qk = ease.back(clamp((t - m('q01')) / 0.4));
      ctx.save(); ctx.translate(960, 130); ctx.scale(qk, qk); ctx.rotate(-0.03);
      U.textOutlined(ctx, 'QUICK QUIZ!', 0, 0, 110, '#FFFFFF', { olw: 20 });
      ctx.restore();
      ctx.save(); ctx.globalAlpha = clamp((t - m('q01') - 0.8) / 0.3);
      paint(ctx, c => roundRect(c, 460, 180, 1000, 150, 40), '#FFFFFF', { lw: 8 });
      ctx.font = '700 60px ' + F.EN; ctx.fillStyle = OL; ctx.textAlign = 'center'; ctx.fillText('What do I do after the shower?', 960, 278);
      ctx.restore();
      const ans = t > m('answer');
      [['A', 'get dressed', 0], ['B', 'make breakfast', 0.4]].forEach(([L, txt, d], i) => {
        const ok = ease.back(clamp((t - m('opts') - d) / 0.35)); if (ok <= 0) return;
        const good = i === 0;
        const y = 470 + i * 190;
        ctx.save(); ctx.translate(960, y); const s = ok * 0.9 * (ans ? (good ? 1.08 + 0.03 * Math.sin(t * 8) : 0.9) : 1); ctx.scale(s, s);
        paint(ctx, c => roundRect(c, -420, -85, 840, 170, 44), ans ? (good ? '#7BD88F' : '#E8DCD2') : '#FFFFFF', { lw: 8 });
        paint(ctx, c => c.arc(-330, 0, 58, 0, 7), i ? '#5BB8F0' : U.ORANGE, { lw: 7 });
        U.textOutlined(ctx, L, -330, 24, 72, '#FFFFFF', { olw: 10 });
        ctx.font = '700 64px ' + F.EN; ctx.fillStyle = ans && !good ? '#A39188' : OL; ctx.textAlign = 'left'; ctx.fillText(txt, -240, 22);
        if (ans && good) { paint(ctx, c => { c.moveTo(300, 0); c.lineTo(335, 38); c.lineTo(395, -40); }, 'rgba(0,0,0,0)', { lw: 16, ol: '#1E7A3A' }); }
        ctx.restore();
      });
      if (t > m('count') && t < m('answer')) {
        const n = 3 - Math.floor(t - m('count')); const f = (t - m('count')) % 1;
        ctx.save(); ctx.translate(1560, 560); const s = 1.4 - ease.out(Math.min(1, f * 3)) * 0.4; ctx.scale(s, s);
        paint(ctx, c => c.arc(0, 0, 90, 0, 7), '#FFFFFF', { lw: 8 });
        U.textOutlined(ctx, String(Math.max(1, n)), 0, 38, 110, U.RED, { olw: 14 });
        ctx.restore();
      }
      sofia(ctx, 250, 1230, 0.72, { outfit: 'pajama', hairMess: 0.6, glasses: true, armR: [200, -400], handR: 'open', armL: [-130, -80], mouth: { smile: 0.9 }, brow: { l: 0.5, r: 0.5 }, look: [0.8, -0.4] }, t, 5);
      const sad = ans ? clamp((t - m('answer') - 0.3) / 0.4) : 0;
      gus(ctx, 1640, 1110, 0.75, { face: -1, lids: lerp(0.6, 0.8, sad), look: -0.5, neck: -sad * 0.6, hold: (c, face, H) => { c.translate(H.hx + 128, H.hy + 26); c.rotate(sad * 0.35 + Math.sin(t * 3) * 0.05); line(c, [[0, 0], [0, 40]], 5, OL); c.scale(face, 1); paint(c, q => roundRect(q, -66, 40, 132, 132, 14), '#FFFFFF', { lw: 6 }); U.textOutlined(c, 'B', 0, 140, 96, '#5BB8F0', { olw: 12 }); } }, t);
      if (ans) {
        for (let i = 0; i < 80; i++) { const ph = (t - m('answer')) * (0.5 + hash(i) * 0.5); if (ph > 2.5) continue; const x = hash(i * 3) * 1920, y = -50 + ph * 450 + hash(i * 5) * 150; ctx.save(); ctx.translate(x + Math.sin(ph * 6 + i) * 30, y); ctx.rotate(ph * 8 + i); ctx.fillStyle = ['#FF7A2F', '#3DAA6E', '#5BB8F0', '#E5484D', '#FFD23F'][i % 5]; ctx.fillRect(-10, -5, 20, 10); ctx.restore(); }
      }
    },
  };
})();

// ------------------------------------------------------------------ DRESS
const dress = (() => {
  const { m, k } = mk('dress');
  return {
    sfx: [['spin', 0, 'tornado'], ['done', 0, 'poof'], ['wrong', 0, 'record'], ['fix', 0, 'poof'], ['fix', 0.1, 'sparkle'], ['card', 0, 'card'], ['turn', 0, 'ding']],
    progress: 5 / 8,
    draw(ctx, t) {
      const C = cam([[m('l14') - 0.2, 560, 1050, 1.1, 0], [m('spin'), 560, 1050, 1.2, 0], [m('done'), 540, 1060, 1.05, 0], [m('wrong'), 540, 1060, 1.1, 0], [m('wrong') + 1.2, 560, 760, 2.4, 0.06], [m('fix'), 560, 760, 2.4, 0.06], [m('fix') + 0.3, 540, 1060, 1.05, 0, 'out'], [m('turn') + 2.4, 540, 1060, 1.1, 0]], t);
      ctx.save(); applyCam(ctx, C, t > m('spin') && t < m('done') ? 10 : 0, t);
      drawBg(ctx, 'bedroom');
      const spinning = t > m('spin') && t < m('done');
      const messed = t > m('done') && t < m('fix');
      if (spinning) {
        // dust tornado with clothes flying out
        for (let i = 0; i < 26; i++) { const a = t * 9 + i, r = 120 + (i % 5) * 40, y = 700 + (i / 26) * 800; ctx.save(); ctx.globalAlpha = 0.9; paint(ctx, c => c.ellipse(560 + Math.cos(a) * r * 0.7, y, 90 + (i % 3) * 20, 60, 0, 0, 7), i % 2 ? '#F5F0EA' : '#E9DFD3', { lw: 5 }); ctx.restore(); }
        const ft = t - m('spin');
        for (let i = 0; i < 5; i++) { const ph = (ft * 1.2 + i * 0.2) % 1; P.sweater(ctx, 560 + Math.cos(i * 2 + ft * 5) * (200 + ph * 300), 700 - ph * 500 + i * 60, ph * 8 + i, 0.6); }
        U.textOutlined(ctx, 'FAST!', 560, 520, 110, '#FFD23F', { olw: 18 });
      } else {
        const proud = t > m('l15') && t < m('wrong');
        const worry = messed && t > m('wrong');
        sofia(ctx, 560, 1540, 1.0, {
          outfit: messed ? 'mix' : t < m('spin') ? 'pajama' : 'sweater', hairMess: messed ? 1 : t < m('spin') ? 0.8 : 0,
          mouth: { smile: worry ? -0.4 : 0.9 }, brow: worry ? { worry: 1 } : proud ? { l: 0.4, r: 0.4 } : { l: 0.2, r: 0.2 }, look: worry ? [0, 1] : [0, 0],
          armL: proud ? [-90, -50] : [-150, -60], armR: proud ? [90, -50] : worry ? [60, -420] : [150, -60], handR: worry ? 'open' : 'fist', handL: 'fist',
          happyEyes: proud && t < m('l15') + 1.6 ? 1 : 0, glasses: !messed,
        }, t, 6);
        if (messed) {
          // sock on head, glasses on the bun, Gus's tie around her neck
          const hy = 1540 - 262 - 455;
          ctx.save(); ctx.translate(560 + 60, hy - 230); ctx.rotate(0.4);
          paint(ctx, c => { c.moveTo(-40, -80); c.lineTo(40, -80); c.lineTo(40, 40); c.quadraticCurveTo(40, 90, 0, 90); c.lineTo(-70, 90); c.quadraticCurveTo(-100, 60, -70, 30); c.lineTo(-40, 30); c.closePath(); }, '#7FC97A', { lw: 6 });
          for (const yy of [-60, -40]) line(ctx, [[-40, yy], [40, yy]], 6, '#FFFFFF');
          ctx.restore();
          ctx.save(); ctx.translate(560, hy - 150); ctx.scale(0.7, 0.7); ctx.beginPath(); for (const s of [-1, 1]) { ctx.moveTo(s * 62 + 54, 0); ctx.ellipse(s * 62, 0, 54, 52, 0, 0, 7); } ctx.lineWidth = 9; ctx.strokeStyle = '#2b1d1a'; ctx.stroke(); ctx.restore();
          ctx.save(); ctx.translate(560, 1540 - 262 - 250); paint(ctx, c => { c.moveTo(-16, 0); c.lineTo(16, 0); c.lineTo(22, 120); c.lineTo(0, 140); c.lineTo(-22, 120); c.closePath(); }, '#2E6FD8', { lw: 5 }); ctx.restore();
        }
        if (t > m('fix') && t < m('fix') + 0.6) { const f = (t - m('fix')) / 0.6; ctx.save(); ctx.globalAlpha = 1 - f; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; paint(ctx, c => c.arc(560 + Math.cos(a) * (150 + f * 200), 1000 + Math.sin(a) * (250 + f * 250), 50 * (1 - f) + 10, 0, 7), '#FFFFFF', { lw: 5 }); } ctx.restore(); }
      }
      // Gus watching from the wardrobe, with no tie while Sofia wears it
      gus(ctx, 900, 1620, 0.85, { face: -1, lids: messed ? 0.75 : 0.6, look: -1, tie: !messed }, t);
      ctx.restore();
    },
  };
})();

// ------------------------------------------------------------------ TOAST
const toastScene = (() => {
  const { m, k } = mk('toast');
  const TX = 300, TY = 1272;
  return {
    sfx: [['l17', 0.4, 'click'], ['launch', 0, 'spring'], ['launch', 0.65, 'thunk'], ['drop', 0.62, 'bonk'], ['card', 0, 'card'], ['turn', 0, 'ding']],
    progress: 6 / 8,
    draw(ctx, t) {
      const up = t > m('launch') + 0.4 && t < m('l18') + 0.2;
      const C = cam([[m('l17') - 0.2, 360, 1080, 1.4, 0], [m('launch'), 360, 1080, 1.45, 0], [m('launch') + 0.65, 330, 320, 1.6, -0.05, 'out'], [m('l18') - 0.1, 330, 320, 1.6, -0.05], [m('l18') + 0.5, 420, 760, 1.6, 0.05], [m('drop'), 420, 1000, 1.1, 0], [m('drop') + 0.6, 420, 1050, 1.15, 0], [m('turn') + 2.4, 420, 1050, 1.15, 0]], t);
      ctx.save(); applyCam(ctx, C, t > m('launch') + 0.6 && t < m('launch') + 0.9 ? 12 : 0, t);
      drawBg(ctx, 'kitchen'); P.clock(ctx, 795, 330, 7, 40); P.fridge(ctx, 560, 470, { open: 0, note: true });
      P.toaster(ctx, TX, TY, t > m('launch') ? 1 : t > m('l17') + 0.4 ? 0.8 : 0);
      // toast flight: launch -> stuck in the ceiling -> falls straight down onto Gus's head
      const SX = 180, CEIL = 150, GX = 99, GS = 0.9;
      const headTop = 1610 - 470 * GS - 58 * GS, REST = headTop - 52;
      const lt = t - m('launch'), dt = t - m('drop');
      let tx = TX, ty = TY - 150, tr = 0, landed = false;
      if (lt > 0) {
        const f = clamp(lt / 0.65); tx = lerp(TX, SX, f); ty = lerp(TY - 150, CEIL, ease.out(f)); tr = f * Math.PI * 4;
        if (dt > 0) { const fall = 0.62; const d = clamp(dt / fall); tx = SX; ty = lerp(CEIL, REST, d * d); tr = Math.PI * 4 + d * 0.25; // gravity
          if (dt > fall) { landed = true; const b = dt - fall; ty = REST - Math.abs(Math.sin(b * 11)) * 26 * Math.exp(-b * 6); tr = Math.PI * 4 + 0.12; } }
        if (dt < 0 && lt > 0.65) { tr = Math.PI * 4 + Math.sin((lt - 0.65) * 30) * 0.08 * Math.exp(-(lt - 0.65) * 5); } // wobble when stuck
      }
      // ceiling crack
      if (lt > 0.65) { ctx.save(); ctx.globalAlpha = dt > 0 ? 0.7 : 1; line(ctx, [[SX - 40, 112], [SX - 10, 140], [SX - 30, 162]], 5, OL); line(ctx, [[SX + 30, 112], [SX + 15, 146]], 5, OL); ctx.restore(); }
      const lookUp = t > m('launch') + 0.3 && t < m('drop') + 0.3;
      sofia(ctx, 580, 1540, 0.95, { outfit: 'sweater', look: lookUp ? [-0.7, -1] : t > m('drop') + 0.3 ? [-1, 0.1] : [0, 0], tilt: lookUp ? -0.12 : 0, brow: lookUp ? { l: 0.8, r: 0.3 } : landed ? { l: 0.6, r: 0.6 } : { l: 0.3, r: 0.3 }, mouth: landed && dt < 1.8 ? { o: 0.7 } : { smile: lookUp ? -0.1 : 0.9 }, armR: lookUp ? [150, -200] : [180, -320], armL: [-160, -170], handR: lookUp ? 'mitten' : 'open' }, t, 7);
      // Gus waddles in from the left and stops exactly under the toast
      const wk = clamp((dt + 1.7) / 1.5);
      const hit = landed ? dt - 0.62 : -1;
      const sq = hit >= 0 ? 1 - 0.07 * Math.exp(-hit * 7) * Math.cos(hit * 20) : 1;
      gus(ctx, lerp(-500, GX, ease.out(wk)), 1610, GS, { face: 1, lids: hit >= 0 && hit < 0.25 ? 1 : 0.68, look: hit >= 0 ? 0.6 : 1, walking: wk > 0 && wk < 1, walk: t * 2.2, squash: sq }, t);
      if (lt > 0) P.toast(ctx, tx, ty, tr, 1);
      ctx.restore();
    },
  };
})();

// ------------------------------------------------------------------ COFFEE
const coffee = (() => {
  const { m, k } = mk('coffee');
  return {
    sfx: [['steal', 0.2, 'slurp'], ['l21', 0, 'scratch'], ['honk', 0.1, 'honk'], ['card', 0, 'card'], ['turn', 0, 'ding']],
    progress: 7 / 8,
    draw(ctx, t) {
      const angry = t > m('l21') && t < m('card');
      const C = cam([[m('l20') - 0.2, 560, 900, 2.0, 0], [m('steal') - 0.4, 520, 900, 2.0, 0], [m('steal'), 430, 930, 1.6, 0], [m('l21'), 450, 930, 1.6, 0], [m('l21') + 0.2, 560, 860, 2.3, -0.1, 'out'], [m('honk') + 0.3, 330, 900, 2.0, 0.08, 'cut'], [m('card'), 450, 1000, 1.15, 0], [m('turn') + 2.4, 450, 1000, 1.18, 0]], t);
      ctx.save(); applyCam(ctx, C, angry ? 7 : 0, t);
      drawBg(ctx, 'kitchen'); P.clock(ctx, 795, 330, 7, 50); P.fridge(ctx, 560, 470, { open: 0, note: true });
      const dreamy = t < m('steal') + 0.9;
      const st = t - m('steal');
      const cupFull = st < 1.0 ? 1 : 0;
      const raise = dreamy ? ease.inOut(clamp((t - m('l20')) / 2.5)) : 0.4;
      const offer = st > -0.3 && st < 1.2 ? 1 : 0; // mug drifts towards Gus while she daydreams
      sofia(ctx, 620, 1540, 1.0, {
        outfit: 'sweater', happyEyes: dreamy ? 1 : 0, mouth: { smile: angry ? -0.6 : 0.9, teeth: angry ? 1 : 0 },
        brow: angry ? { angry: 1 } : { l: 0.2, r: 0.2 }, blush: dreamy ? 0.9 : 0.4, look: angry ? [-1, 0] : [0, 0], turn: angry ? -0.3 : 0,
        armL: [lerp(-150, -200, raise) - offer * 40, lerp(-200, -380, raise)], handL: 'fist', holdL: (c) => { P.mug(c, -40, 28, { full: cupFull, t, steam: cupFull, s: 0.75 }); },
        armR: angry ? [200, -420] : [140, -100], handR: angry ? 'fist' : 'mitten', squash: angry ? 1.02 : 1,
      }, t, 8);
      // Gus stands on the counter and leans in to steal the coffee
      const gx = lerp(-300, 190, ease.out(clamp((st + 1.2) / 0.8)));
      const sip = st > 0.1 && st < 1.0;
      const hk = t > m('honk') ? clamp(1.2 - (t - m('honk')) * 1.2) : 0;
      gus(ctx, gx, 1282, 1.0, { face: 1, neck: sip ? 1.4 : 0.2, lids: sip ? 1 : 0.6, look: 1, honk: hk, wing: hk * 0.7, walking: st > -1.2 && st < -0.4, walk: t * 2.4 }, t);
      ctx.restore();
      if (sip) P.burst(ctx, 1400, 300, 'SLURP', clamp(st / 1.0), '#C68B59', 0.1, 0.8);
      if (hk > 0) P.burst(ctx, 1400, 300, 'HONK!', clamp((t - m('honk')) / 1.2), '#FFD23F', -0.1, 1);
    },
  };
})();

// ------------------------------------------------------------------ LEAVE (punchline)
const leave = (() => {
  const { m, k } = mk('leave');
  return {
    sfx: [['pack', 0.4, 'pop'], ['pack', 1.0, 'pop'], ['pack', 1.6, 'pop'], ['pack', 2.2, 'honk'], ['run', 0, 'run'], ['l22', 1.0, 'door'], ['stop', 0, 'ahem'], ['freeze', 0, 'record'], ['back', 0, 'whoosh'], ['l24_end', 0.3, 'doorclose']],
    progress: 1,
    draw(ctx, t) {
      if (t > m('back')) { // smash cut: back in the fridge
        const C = cam([[m('back'), 795, 1020, 1.5, 0], [m('l24_end') + 0.8, 795, 1000, 1.9, 0]], t);
        ctx.save(); applyCam(ctx, C, 0, t);
        drawBg(ctx, 'kitchen'); P.clock(ctx, 795, 330, 8, 2);
        const close = ease.inOut(clamp((t - m('l24_end') - 0.1) / 0.5));
        P.fridge(ctx, 560, 470, { open: 1 - close }, c => sofia(c, 235, 1030, 0.66, { outfit: 'sweater', mask: true, sleepy: 0.8, blink: 0.6, mouth: { smile: 0.6 }, armR: [130, -150], armL: [-130, -150], handR: 'open' }, t, 1));
        ctx.restore();
        const blk = clamp((t - m('l24_end') - 0.5) / 0.4); if (blk > 0) { ctx.fillStyle = `rgba(10,8,20,${blk})`; ctx.fillRect(0, 0, 1920, 1080); }
        return;
      }
      const freeze = t > m('freeze');
      const tt = freeze ? m('freeze') : t;
      const C = cam([[m('pack'), 540, 1050, 1.15, 0], [m('run'), 520, 1050, 1.0, 0], [m('stop') - 0.1, 540, 1000, 1.0, 0], [m('stop'), 300, 1060, 1.9, 0.0, 'cut'], [m('g01') + 1.2, 300, 1060, 1.95, 0], [m('g01') + 1.4, 940, 680, 2.8, 0, 'out'], [m('freeze') - 0.05, 940, 680, 2.9, 0], [m('freeze'), 560, 780, 2.6, -0.1, 'cut'], [m('back'), 560, 780, 2.8, -0.1]], t);
      ctx.save(); applyCam(ctx, C, 0, t);
      drawBg(ctx, 'hallway');
      const open = ease.out(clamp((tt - m('l22') - 0.9) / 0.5));
      P.door(ctx, open, tt);
      const run = clamp((tt - m('run')) / 1.0);
      const sx = lerp(720, 540, ease.inOut(run));
      const shocked = freeze;
      sofia(ctx, sx, 1540, 0.98, {
        outfit: 'sweater', legs: run > 0 && run < 1 ? 'walk' : 'stand', walk: tt * 2.4,
        wide: shocked ? 1 : 0, brow: shocked ? { l: 1, r: 1 } : { l: 0.4, r: 0.4 }, mouth: shocked ? { o: 1 } : { smile: 0.9 },
        armR: t > m('l22') + 0.8 && !shocked ? [200, -380] : [150, -100], handR: t > m('l22') + 0.8 && !shocked ? 'open' : 'fist',
        armL: [-150, -60], handL: 'fist', holdL: c => { c.translate(0, 40); paint(c, q => roundRect(q, -50, 0, 100, 90, 16), '#8C6A4F', { lw: 5 }); },
        hairMess: shocked ? 1 : 0, look: t > m('stop') && !shocked ? [-1, 0] : [0, 0],
      }, tt, 9, !freeze);
      // packed items pop beside her
      ['Bag', 'Keys', 'Phone', 'Gus'].forEach((w, i) => {
        const pk = clamp((t - m('pack') - 0.4 - i * 0.6) / 0.25); if (pk <= 0 || t > m('run')) return;
        ctx.save(); ctx.translate(260 + i * 180, 520); ctx.scale(ease.back(pk), ease.back(pk)); paint(ctx, c => roundRect(c, -80, -50, 160, 100, 30), '#FFFFFF', { lw: 6 }); U.textOutlined(ctx, w, 0, 20, 52, U.ORANGE, { olw: 9 }); ctx.restore();
      });
      // Gus by the coat rack, then points at the calendar with his wing
      const point = t > m('g01') + 0.9;
      gus(ctx, 240, 1610, 0.95, { face: 1, lids: 0.55, look: point ? 1 : 0.4, wing: point ? 0.9 : 0, honk: 0 }, tt);
      if (t > m('g01') + 1.4) { const ck = ease.out(clamp((t - m('g01') - 1.4) / 0.4)); ctx.save(); ctx.beginPath(); ctx.ellipse(940, 680, 140 * ck + 1, 150 * ck + 1, 0, 0, 7); ctx.lineWidth = 12; ctx.strokeStyle = U.RED; ctx.stroke(); ctx.restore(); }
      ctx.restore();
      if (freeze) { // freeze frame: desaturate + vignette + label
        ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = 'hsl(0,0%,50%)'; ctx.globalAlpha = 0.85; ctx.fillRect(0, 0, 1920, 1080); ctx.restore();
        U.textOutlined(ctx, 'SATURDAY?!', 960, 200, 130, '#FFFFFF', { olw: 22 });
      }
    },
  };
})();

// ------------------------------------------------------------------ RECAP
const recap = (() => {
  const { m, k } = mk('recap');
  const LS = id => require('./timeline.json').lines.find(l => l.id === id);
  const items = [['I wake up.', 'eye'], ['I get up.', 'up'], ['I brush my teeth.', 'tooth'], ['I take a shower.', 'shower'], ['I get dressed.', 'shirt'], ['I make breakfast.', 'toast'], ['I drink coffee.', 'cup'], ['I leave the house.', 'door']];
  return {
    sfx: [['l25', 0, 'quizjingle'], ...[1, 2, 3, 4, 5, 6, 7, 8].map(i => ['r' + i, 0, 'pop'])],
    draw(ctx, t) {
      const g = ctx.createLinearGradient(0, 0, 0, 1080); g.addColorStop(0, '#FFF1DC'); g.addColorStop(1, '#FFD9C2'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
      ctx.save(); ctx.globalAlpha = 0.5; for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.arc(hash(i) * 1920, (hash(i + 3) * 1080 + t * 25 * (0.5 + hash(i))) % 1080, 30 + hash(i + 7) * 50, 0, 7); ctx.fillStyle = ['#FFE08A', '#CDEBD3', '#FFD0DB'][i % 3]; ctx.fill(); } ctx.restore();
      U.textOutlined(ctx, 'MY MORNING', 960, 120, 96, U.ORANGE, { olw: 18 });
      ctx.font = '700 40px ' + F.EN; ctx.fillStyle = OL; ctx.textAlign = 'center'; ctx.fillText('Say it with Sofia!', 960, 180);
      items.forEach(([txt, ic], i) => {
        const id = 'r' + (i + 1); const t0 = LS(id).t0;
        const ak = ease.back(clamp((t - t0 + 0.7) / 0.25)); if (ak <= 0) return;
        const nextT = i < 7 ? LS('r' + (i + 2)).t0 : LS('r8').t1 + 4;
        const active = t >= t0 - 0.7 && t < nextT - 0.7;
        const col = i < 4 ? 0 : 1, row = i % 4;
        const cx = col ? 1290 : 630, y = 290 + row * 150;
        ctx.save(); ctx.translate(cx + (1 - ak) * (col ? 700 : -700), y); ctx.scale(active ? 1.04 : 0.96, active ? 1.04 : 0.96);
        paint(ctx, c => roundRect(c, -320, -56, 640, 112, 34), active ? '#FFFFFF' : 'rgba(255,255,255,0.75)', { lw: 6 });
        paint(ctx, c => c.arc(-262, 0, 38, 0, 7), active ? U.ORANGE : '#F3EAE2', { lw: 5 });
        ctx.font = '700 38px ' + F.EN; ctx.fillStyle = active ? '#fff' : OL; ctx.textAlign = 'center'; ctx.fillText(String(i + 1), -262, 14);
        U.icon(ctx, ic, 262, 0, 0.7);
        ctx.font = `700 ${txt.length > 15 ? 44 : 50}px ` + F.EN; ctx.fillStyle = OL; ctx.textAlign = 'left'; ctx.fillText(txt, -205, 17);
        const gap0 = LS(id).t1;
        if (t > gap0 && t < nextT - 0.7) { ctx.save(); ctx.globalAlpha = 0.95; paint(ctx, c => roundRect(c, 80, -86, 190, 46, 23), U.GREEN, { lw: 4 }); ctx.font = '700 28px ' + F.EN; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('YOUR TURN', 175, -53); ctx.restore(); }
        ctx.restore();
      });
      sofia(ctx, 160, 1230, 0.72, { outfit: 'sweater', armR: [200, -380], handR: 'open', mouth: { smile: 0.9 }, look: [0.6, -0.5] }, t, 10);
      gus(ctx, 1790, 1110, 0.72, { face: -1, lids: 0.55, neck: Math.sin(t * 3) * 0.2, look: -0.6 }, t);
    },
  };
})();

// ------------------------------------------------------------------ OUTRO
const outro = (() => {
  const { m, k } = mk('outro');
  return {
    sfx: [['l26', 0.2, 'pop'], ['honk', 0, 'honk'], ['l27', 0.6, 'click']],
    draw(ctx, t) {
      ctx.save(); applyCam(ctx, cam([[m('l26'), 760, 1100, 1.1, 0], [m('l27_end') + 1.5, 740, 1100, 1.18, 0]], t), 0, t);
      drawBg(ctx, 'kitchen'); P.clock(ctx, 795, 330, 8, 30); P.fridge(ctx, 560, 470, { open: 0, note: true });
      const bye = t > m('l27');
      sofia(ctx, 400, 1540, 1.0, { outfit: 'sweater', armR: bye ? [210 + Math.sin(t * 10) * 40, -420] : [160, -150], handR: 'open', armL: [-150, -80], mouth: { smile: 0.95 }, brow: { l: 0.4, r: 0.4 } }, t, 11);
      const hk = t > m('honk') ? clamp(1.2 - (t - m('honk')) * 1.4) : 0;
      gus(ctx, 820, 1620, 0.95, { face: -1, lids: 0.55, look: -0.3, honk: hk, wing: hk }, t);
      ctx.restore();
      // comment bubble
      const ck = ease.back(clamp((t - m('l26') - 0.3) / 0.4));
      if (ck > 0) {
        ctx.save(); ctx.translate(1380, 260); ctx.scale(ck * 0.8, ck * 0.8);
        paint(ctx, c => { roundRect(c, -440, -150, 880, 300, 50); }, '#FFFFFF', { lw: 8 });
        paint(ctx, c => { c.moveTo(-120, 146); c.lineTo(-170, 230); c.lineTo(-40, 146); c.closePath(); }, '#FFFFFF', { lw: 0 });
        line(ctx, [[-120, 150], [-170, 230], [-40, 150]], 8, OL);
        ctx.font = '700 54px ' + F.EN; ctx.fillStyle = OL; ctx.textAlign = 'center'; ctx.fillText('What do YOU do first', 0, -40); ctx.fillText('in the morning?', 0, 30);
        U.textOutlined(ctx, 'Write it in the comments!', 0, 110, 46, U.ORANGE, { olw: 8 });
        ctx.restore();
      }
      if (bye) { // subscribe button + arrow tap
        const sk = ease.back(clamp((t - m('l27')) / 0.4));
        ctx.save(); ctx.translate(1420, 700); ctx.scale(sk * 0.85, sk * 0.85);
        const pressed = t > m('l27') + 0.6;
        paint(ctx, c => roundRect(c, -260, -70, 520, 140, 70), pressed ? '#9C8A82' : U.RED, { lw: 8 });
        U.textOutlined(ctx, pressed ? 'SUBSCRIBED' : 'SUBSCRIBE', 0, 22, 66, '#FFFFFF', { olw: 10 });
        ctx.restore();
        const ck2 = clamp((t - m('l27') - 0.2) / 0.4);
        U.tapCursor(ctx, lerp(1800, 1500, ease.out(ck2)), lerp(1000, 730, ease.out(ck2)), 1, clamp((t - m('l27') - 0.6) / 0.3));
      }
    },
  };
})();

module.exports = { hook, wake, getup, teeth, shower, quiz, dress, toast: toastScene, coffee, leave, recap, outro };
