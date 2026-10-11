const TL = require('./timeline.json'); const SCN = require('./scenes');
const TRANS = { wake: 'flash', getup: 'whip', teeth: 'zoom', shower: 'whip', quiz: 'iris', dress: 'flash', toast: 'whip', coffee: 'zoom', leave: 'whip', recap: 'fade', outro: 'whip' };
const out = [];
for (const S of TL.scenes) {
  for (const [mk, off, name] of SCN[S.id].sfx || []) { const t = S.marks[mk]; if (t === undefined) { console.error('missing mark', S.id, mk); continue; } out.push({ t: t + off, name }); }
  const tr = TRANS[S.id]; if (tr && tr !== 'fade') out.push({ t: S.t0 - 0.22, name: 'whoosh', g: tr === 'whip' ? 1 : 0.7 });
}
require('fs').writeFileSync(__dirname + '/sfx.json', JSON.stringify(out));
console.log(out.length, 'sfx');
