// Block -> scene function. Group modules hold several blocks; their cues/music are attached to the first block only.
const groups = ['a', 'b', 'c', 'd', 'e'].map(g => { try { return require('./' + g); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; return null; } }).filter(Boolean);
const out = {};
for (const g of groups) { const blocks = Object.keys(g).filter(k => /^s\d\d$/.test(k)); blocks.forEach((b, i) => { out[b] = { draw: g[b], capTop: () => false, cues: i === 0 ? g.cues : null, music: i === 0 ? g.music : null }; }); }
module.exports = out;
