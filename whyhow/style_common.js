// shared helpers for the three reference-style tests (style_b1m, style_wendover, style_jh)
const fs = require('fs'), path = require('path');
module.exports = (dir, photos) => {
  const MF = JSON.parse(fs.readFileSync(path.join(dir, 'footage/manifest.json')));
  const FT = Object.fromEntries(MF.map(x => [x.key, x]));
  const assets = Object.fromEntries(photos.map(k => [k, 'footage/' + k + '.jpg']));
  const cr = k => { const f = FT[k]; return f && f.attribution && !/pixabay/i.test(f.source) ? (f.type === 'video' ? 'Video: ' : 'Photo: ') + f.attribution : ''; };
  const vid = (k, o = {}) => ({ scene: 'video', p: { file: 'footage/' + k + '.mp4', credit: cr(k), cold: 0, z0: 1.0, z1: 1.06, ...o } });
  const pho = (k, o = {}) => ({ scene: 'photo', p: { img: k, credit: cr(k), cold: 0, kb: { z: [1.04, 1.14] }, ...o } });
  return { assets, cr, vid, pho };
};
