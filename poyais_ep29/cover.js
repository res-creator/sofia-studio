// Cover for episode 29 "The Country That Didn't Exist" (adult documentary look): the archive Bank of Poyais dollar note, a red DOESN'T EXIST stamp,
// headline "HE SOLD A / FAKE COUNTRY" (key words on a red strip), small date tag. Everything inside y 240..1680, clear of the right-hand buttons. node cover.js
const { createCanvas } = require('@napi-rs/canvas'); const fs = require('fs'), path = require('path');
const E = require('./episode.js'); const { W, H, F } = E;
(async () => { await E.load(); const cv = createCanvas(W, H), x = cv.getContext('2d');
  E.table(x); E.noteAt(x, 0.47, 0.5, W / 2, 1040, 1450, -0.07); E.shadeTopBottom(x, 0.85);
  x.save(); x.translate(W / 2, 420); x.rotate(-0.02); x.shadowColor = 'rgba(0,0,0,0.6)'; x.shadowBlur = 30;
  x.fillStyle = '#F2EDE4'; x.fillRect(-330, -95, 660, 150); x.fillStyle = '#C8231A'; x.fillRect(-470, 85, 940, 165); x.shadowColor = 'transparent';
  x.textAlign = 'center'; E.fit(x, 'HE SOLD A', 112, 600); x.fillStyle = '#171717'; x.fillText('HE SOLD A', 0, 20);
  E.fit(x, 'FAKE COUNTRY', 124, 880); x.fillStyle = '#F2EDE4'; x.fillText('FAKE COUNTRY', 0, 212); x.restore();
  E.stamp(x, "DOESN'T EXIST", 520, 1080, 120, -0.16, 1);
  E.tag(x, 'LONDON · 1822', 90, 1520, 1, { size: 40 });
  x.save(); x.font = `600 22px ${F}`; x.fillStyle = 'rgba(242,237,228,0.7)'; x.textAlign = 'left'; x.fillText('BANK OF POYAIS NOTE, 1820s (ARCHIVE)', 90, 1610); x.restore();
  E.vignette(x, 0.55); E.grain(x, 0.3, 0.07);
  fs.writeFileSync(path.join(__dirname, 'the_country_that_didnt_exist_cover.png'), cv.toBuffer('image/png')); console.log('cover ok'); })();
