// Cover for episode 27: "2 PIZZAS / = 10,000 BTC" — one hero: the two pizza boxes on the scale against a pile of bitcoins, the price tag,
// in the channel style (howitsrun_style/). COVERS.md: headline in the 3:4 crop (y 240..1680), clear of the caption area and the buttons.
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const ST = require('../howitsrun_style/style');
const SH = require('./episode.js').SH;
const cv = createCanvas(ST.W, ST.H), ctx = cv.getContext('2d');
const A = SH.find(s => s.id === 'A1 scale'); A.draw(ctx, 1.2, 1.2);   // the frame-0 set (tag already landed), drawn without subtitles
ST.headline2(ctx, '2 PIZZAS', '= 10,000 BTC', 1, 500);
ST.label(ctx, 'TRUE STORY · 2010', ST.W / 2, 300, 1, { size: 36, col: '#171717', fg: '#FFC857', rot: 0 });
ST.label(ctx, 'AT THE PEAK: $1.26 BILLION', ST.W / 2, 1560, 1, { size: 58, col: '#FFC857', rot: -0.02 });
ST.paper(ctx);
fs.writeFileSync(`${__dirname}/bitcoin_pizza_cover.png`, cv.toBuffer('image/png')); console.log('cover ok');
