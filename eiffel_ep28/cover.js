// Cover for episode 28 "The Man Who Sold the Eiffel Tower" (adult documentary look): the 1927 Library of Congress photo of the tower, a red SOLD stamp,
// headline "HE SOLD THE / EIFFEL TOWER" (key words on a red strip), small date tag. Everything inside y 240..1680, clear of the right-hand buttons. node cover.js
const { createCanvas } = require('@napi-rs/canvas'); const fs = require('fs'), path = require('path');
const E = require('./episode.js'); const { W, H, F } = E;
(async () => { await E.load(); const cv = createCanvas(W, H), x = cv.getContext('2d');
  E.darkBg(x); E.towerPhoto(x, 1.08, -10, 40, 'grayscale(1) contrast(1.35) brightness(0.82) sepia(0.3)'); E.shadeTopBottom(x, 0.88);
  // headline: cream plate + red strip
  x.save(); x.translate(W / 2, 400); x.rotate(-0.02); x.shadowColor = 'rgba(0,0,0,0.6)'; x.shadowBlur = 30;
  x.fillStyle = '#F2EDE4'; x.fillRect(-380, -95, 760, 150); x.fillStyle = '#C8231A'; x.fillRect(-470, 85, 940, 165); x.shadowColor = 'transparent';
  x.textAlign = 'center'; E.fit(x, 'HE SOLD THE', 112, 700); x.fillStyle = '#171717'; x.fillText('HE SOLD THE', 0, 20);
  E.fit(x, 'EIFFEL TOWER', 124, 880); x.fillStyle = '#F2EDE4'; x.fillText('EIFFEL TOWER', 0, 212); x.restore();
  E.stamp(x, 'SOLD', 520, 1120, 170, -0.18, 1);
  E.tag(x, 'PARIS · 1925', 90, 1560, 1, { size: 40 });
  x.save(); x.font = `600 22px ${F}`; x.fillStyle = 'rgba(242,237,228,0.7)'; x.textAlign = 'left'; x.fillText('PHOTO: LIBRARY OF CONGRESS, 1927', 90, 1640); x.restore();
  E.vignette(x, 0.55); E.grain(x, 0.3, 0.07);
  fs.writeFileSync(path.join(__dirname, 'the_man_who_sold_the_eiffel_tower_cover.png'), cv.toBuffer('image/png')); console.log('cover ok'); })();
