// Cover for episode 30 "Carnegie's Daughter" (adult documentary look): her 1904 cabinet-card portrait (archive), the re-created $2,000,000 note
// with Carnegie's signature + FORGED stamp, headline "SHE FAKED BEING / CARNEGIE'S DAUGHTER" (key words on a red strip), small date tag.
// Everything inside y 240..1680, clear of the right-hand buttons. node cover.js
const { createCanvas } = require('@napi-rs/canvas'); const fs = require('fs'), path = require('path');
const E = require('./episode.js'); const { W, H, F } = E;
(async () => { await E.load(); const cv = createCanvas(W, H), x = cv.getContext('2d');
  E.table(x); E.photo(x, E.CAS, W / 2 - 40, 900, 900, -0.03, 1, 'grayscale(1) contrast(1.2) brightness(0.88) sepia(0.32)', true, [0, 0, E.CAS.width, E.CAS.height * 0.86]);
  x.save(); x.translate(560, 1330); x.rotate(0.06); E.note(x, 0.92); x.restore(); E.stamp(x, 'FORGED', 760, 1440, 100, -0.14, 1); E.shadeTopBottom(x, 0.6);
  x.save(); x.translate(W / 2, 330); x.rotate(-0.02); x.shadowColor = 'rgba(0,0,0,0.6)'; x.shadowBlur = 30;
  x.fillStyle = '#F2EDE4'; x.fillRect(-380, -95, 760, 150); x.fillStyle = '#C8231A'; x.fillRect(-490, 85, 980, 165); x.shadowColor = 'transparent';
  x.textAlign = 'center'; E.fit(x, 'SHE FAKED BEING', 104, 700); x.fillStyle = '#171717'; x.fillText('SHE FAKED BEING', 0, 18);
  E.fit(x, "CARNEGIE'S DAUGHTER", 112, 930); x.fillStyle = '#F2EDE4'; x.fillText("CARNEGIE'S DAUGHTER", 0, 208); x.restore();
  E.tag(x, 'CLEVELAND, OHIO · 1904', 90, 1600, 1, { size: 38 });
  x.save(); x.font = `600 22px ${F}`; x.fillStyle = 'rgba(242,237,228,0.7)'; x.textAlign = 'left'; x.fillText('PHOTO: CASSIE L. CHADWICK, 1904 (ARCHIVE) · NOTE RE-CREATED', 90, 1665); x.restore();
  E.vignette(x, 0.5); E.grain(x, 0.3, 0.07);
  fs.writeFileSync(path.join(__dirname, 'carnegies_daughter_cover.png'), cv.toBuffer('image/png')); console.log('cover ok'); })();
