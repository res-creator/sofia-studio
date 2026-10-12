// TikTok pilot: «Как попросить счёт в кафе» — level ladder A1 / B1 / C2 (Russian narrator + English dialogue).
// Item format as ep4: S(id) speech | W(s) wait | M(name) mark
const LINES = require('./lines.json');
const S = id => ({ say: id, who: LINES[id].who, text: LINES[id].text });
const W = s => ({ wait: s });
const M = n => ({ mark: n });

const SEQ = [
  { id: 'hook', items: [W(0.3), S('n01'), W(0.5)] },
  { id: 'a1', items: [M('splash'), S('n02'), W(0.45), S('l01'), W(0.25), S('c01'), M('cash'), W(1.3), S('n03'), M('card'), W(2.4)] },
  { id: 'b1', items: [M('splash'), S('n04'), W(0.45), S('l02'), W(0.25), S('c02'), M('bill'), W(1.0), S('n05'), M('card'), W(2.6)] },
  { id: 'c2', items: [M('splash'), S('n06'), W(0.45), S('l03'), W(0.3), S('c03'), M('cake'), W(1.2), S('n07'), M('card'), W(2.4)] },
  { id: 'outro', items: [S('n08'), W(0.8), M('end'), W(2.0)] },
];
module.exports = { SEQ, PHRASES: [] };
if (require.main === module) require('fs').writeFileSync(__dirname + '/seq.json', JSON.stringify({ SEQ, PHRASES: [] }, null, 1));
