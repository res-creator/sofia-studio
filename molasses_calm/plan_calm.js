// Calm documentary plan: photos with slow Ken Burns + dissolves; minimal lower-thirds (dates, names, numbers only).
// Photo entries: 'id' or {id, at:'w:word', kb, fx, fy}. Unpinned photos are spread evenly between pins.
const PHOTOS = {
  c01: ['mk61vr703', '1v53p559v', 'd217tx08j', { id: 'tank', at: 'w:Above', fx: .62, fy: .5 }],
  c02: ['5999r9360', { id: 'tank', at: 'w:Fifty', fx: .55, fy: .5 }, '9z906756h'],
  c03: ['df65zg54n', { id: 'tank', at: 'w:built', fx: .6, fy: .4 }, 'r7820n42s', { id: 'tank', at: 'w:When', kb: 'out' }, '5999r9360', { id: 'g445gm96t', at: 'w:Every' }],
  c04: ['mk61vr703', 'd217tx08j', { id: 'zs261g53p', at: 'w:gave' }, { id: '7h14dw62c', at: 'w:roar' }],
  c05: ['j67347075', '2j62s563b', '2j62s565w', '2j62s567f', 'jh347001x'],
  c06: ['2j62s5533', 'bn99df50s', 'crew', 'p841cs36t', 'rf562f99p', 'vx024q33k'],
  c07: ['sx61ht55j', '7h14dw64x', 'f1884t64n', 'jq088q501', '5m60tz46k'],
  c08: ['after', { id: 'bc389p740', at: 'w:Cleanup' }, '6q185t736', '4168bq37n'],
  c09: ['rx916w445', 'nk325m71z', 'jh347003g', '8s45th138', '34852p613'],
  c10: ['wd3791738', '2j62s5690', '2j62s555n', 'zg64xs96b'],
  c11: ['g445gm96t', { id: 'df65zg54n', at: 'w:Today' }, { id: '70798f44b', at: 'w:plaque' }, { id: 'mk61vr703', at: 'w:For' }, { id: 'r7820n42s', at: 'w:disaster' }, { id: 'g445gm96t', kb: 'out', at: 'w:hundredth' }],
  c12: ['after', '1v53p559v'],
};
// Lower-thirds: [chapter, anchor, seconds, line1, line2?]
const LT = [
  ['c01', 1.0, 6, 'January 15, 1919', 'Boston, Massachusetts'],
  ['c01', 'w:two', 5, '2.3 million gallons of molasses'],
  ['c02', 'start', 5, 'Purity Distilling Company', '529 Commercial Street, North End'],
  ['c02', 'w:Fifty', 5, '50 feet tall · 90 feet wide'],
  ['c02', 'w:Built', 4, 'Built in 1915'],
  ['c03', 'w:Amendment', 5, 'January 16, 1919', 'Eighteenth Amendment ratified'],
  ['c03', 'w:Arthur', 5, 'Arthur Jell', 'Treasurer, United States Industrial Alcohol'],
  ['c04', 'w:On', 4, 'January 14, 1919'],
  ['c04', 'w:At', 3.4, '12:30 p.m.', 'January 15, 1919'],
  ['c05', 'w:thirteen', 4, '13,000 tons'],
  ['c05', 'w:twenty-five', 4, 'Up to 25 feet high'],
  ['c05', 'w:thirty-five', 4, '35 miles per hour'],
  ['c06', 'w:Anthony', 5, 'Anthony di Stasio'],
  ['c07', 'w:one#0', 5, '116 cadets', 'Training ship Nantucket'],
  ['c07', 'w:Rescuers', 4, 'Four days of searching'],
  ['c08', 'start', 5, '21 killed', 'About 150 injured'],
  ['c09', 'w:One', 5, '119 residents', 'One of the first class-action suits in Massachusetts'],
  ['c09', 'w:Hugh', 5, 'Hugh W. Ogden', 'Court-appointed auditor'],
  ['c09', 'w:six', 5, '$628,000'],
  ['c10', 'w:In#1', 5, '2016', 'Harvard University'],
  ['c11', 'w:hundredth', 6, 'January 15, 2019', 'The 100th anniversary · 21 names read aloud'],
  ['c12', 'w:school', 4.2, 'The Great Molasses Flood', 'Boston, 1919'],
];
module.exports = { PHOTOS, LT };
