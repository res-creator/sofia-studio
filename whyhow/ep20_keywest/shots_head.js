// EP20 Key West — real Florida Keys photos (Wikimedia Commons: Florida Keys Public Libraries, State Archives of Florida, NOAA, NASA, USFWS, CC authors) + Pixabay.
// Anything not literally the place named is labelled ILLUSTRATIVE. No AI images.
// Anything not literally the place/line named is labelled ILLUSTRATIVE. No AI images.
const fs = require('fs'), path = require('path');
const MF = JSON.parse(fs.readFileSync(path.join(__dirname, 'footage/manifest.json')));
const FT = Object.fromEntries(MF.map(x => [x.key, x]));
const assets = {}; for (const x of MF) if (x.type === 'photo' && fs.existsSync(path.join(__dirname, 'footage/' + x.key + '.jpg'))) assets[x.key] = 'footage/' + x.key + '.jpg';
const credit = k => { const f = FT[k]; if (!f || !f.attribution) return ''; if (/pixabay/i.test(f.source)) return '';
  if (/nasa|esa|gov/i.test(f.source)) return 'Image: ' + f.attribution; return (f.type === 'video' ? 'Video: ' : 'Photo: ') + f.attribution; };
const C = n => require('../atlaskit/core').C[n];
let kbi = 0;
const KB = [{ z: [1.04, 1.18], x: [0.45, 0.55] }, { z: [1.18, 1.04], x: [0.55, 0.45] }, { z: [1.05, 1.2], y: [0.55, 0.45] }, { z: [1.2, 1.06], x: [0.5, 0.5], y: [0.45, 0.55] }];
const F = (key, o = {}) => { const f = FT[key]; if (!f) throw new Error('no footage ' + key);
  if (f.type === 'video') return { scene: 'video', p: { file: 'footage/' + key + '.mp4', credit: credit(key), cold: 0, ...o } };
  return { scene: 'photo', p: { img: key, credit: credit(key), kb: KB[kbi++ % KB.length], cold: 0, ...o } }; };
const S = (scene, p = {}) => ({ scene, p });
const low = (text, w, sub) => ({ type: 'lower', text, sub, w });
const head = (text, w, y = 200, size = 96, color) => ({ type: 'head', text, w, y, size, color });
const chipC = (text, w, y, size = 56) => ({ type: 'chip', text, x: 960, y, align: 'center', size, w });
const at = (o, a) => ({ ...o, at: a });
const note = (text) => ({ type: 'note', text, x: 60, y: 70, at: 0.3 });
const Yc = '#FFC857';
const IL = 'ILLUSTRATIVE';
// V: footage with a note label; I: illustrative footage
const FB = {};
const R = (k, label) => [k, label];
const V = (k0, label0, o = {}) => { const [k, label] = R(k0, label0); return F(k, { ...o, over: [...(o.over || []), note(label)] }); };
const I = (k, label, o = {}) => V(k, label + ' · ' + IL, o);
const A = (k, label, o = {}) => V(k, label, { sfx: 'click', ...o });
const Q = (cutW, top, l1, l2, chipT, source) => S('stats', { cutW, head: top, items: [], sfx: 'boom', over: [at(head(l1, null, l2 ? 470 : 520, 88, Yc), 0.05), ...(l2 ? [at(head(l2, null, 590, 88, Yc), 0.25)] : []), ...(chipT ? [{ ...chipC(chipT, null, l2 ? 740 : 700, 44), at: 0.6 }] : [])], source });
const G = { fc: { lon: -80.48, lat: 25.45 }, kw: { lon: -81.78, lat: 24.555 }, largo: { lon: -80.44, lat: 25.09 }, isla: { lon: -80.63, lat: 24.92 }, mara: { lon: -81.09, lat: 24.71 }, stock: { lon: -81.74, lat: 24.57 }, miami: { lon: -80.19, lat: 25.77 }, havana: { lon: -82.37, lat: 23.11 } };
const PIPE = [[-80.48, 25.45], [-80.43, 25.25], [-80.44, 25.09], [-80.63, 24.92], [-80.85, 24.80], [-81.09, 24.71], [-81.2, 24.68], [-81.35, 24.67], [-81.55, 24.62], [-81.78, 24.555]];
const GL = (o = {}) => ({ relief: true, borders: true, lon: [[0, -81.2], [3, -81.1]], lat: [[0, 25.0], [3, 24.95]], R: [[0, 11000], [3, 12500]], ...o });
function build(T) {
  const out = []; const add = (t, sh, trans) => out.push({ t, scene: sh.scene, p: sh.p, trans });
  function beats(pid, list, o = {}) {
    const p = T.P[pid], ws = T.words(pid); const st = o.start != null ? o.start : p.start; const end = p.start + p.dur + (o.tail || 0);
    const cand = [st]; ws.forEach((w, i) => { if (i > 0 && /[.?!,:]$/.test(ws[i - 1].w)) cand.push(w.s - 0.1); });
    const n = list.length; const ts = [st];
    for (let k = 1; k < n; k++) { const target = st + (end - st) * k / n; let best = null;
      for (const c of cand) if (c > ts[k - 1] + 1.8 && (best == null || Math.abs(c - target) < Math.abs(best - target))) best = c;
      if (best == null || Math.abs(best - target) > 1.5) { let bw = null; for (const w of ws) if (w.s > ts[k - 1] + 1.8 && (bw == null || Math.abs(w.s - target) < Math.abs(bw - target))) bw = w.s; best = bw != null ? bw - 0.08 : target; }
      ts.push(best); }
    list.forEach((sh, k) => { if (k > 0 && sh && sh.p.cutW) { const t = T.at(pid, sh.p.cutW) - 0.35; if (t > ts[k - 1] + 1.5 && (k + 1 >= ts.length || t < ts[k + 1] - 1.5)) ts[k] = t; delete sh.p.cutW; } else if (sh) delete sh.p.cutW; });
    const durOf = k => (k + 1 < ts.length ? ts[k + 1] : end + 0.25) - ts[k];
    const cap = (v, k, keep) => Math.max(0.2, Math.min(v, durOf(k) - keep));
    const rel = (w, t0, nn) => Math.max(0.2, T.at(pid, w, nn || 1) - t0);
    list.forEach((sh, k) => { if (!sh) return; const t0 = ts[k];
      for (const ov of (sh.p.over || [])) { if (ov.w) { ov.at = rel(ov.w, t0, ov.n); delete ov.w; } if (ov.at != null && ov.type !== 'note') ov.at = cap(ov.at, k, 2.4); }
      for (const it of (sh.p.items || [])) { if (it.w) { it.at = rel(it.w, t0, it.n); delete it.w; } if (it.at != null) it.at = cap(it.at, k, 2.6); }
      for (const arr of ['bands', 'marks']) for (const it of (sh.p[arr] || [])) if (it.w) { it.at = rel(it.w, t0, it.n); delete it.w; }
      for (const kw of ['routes', 'pins', 'labels', 'zones', 'waves']) for (const it of (sh.p[kw] || [])) if (typeof it.w === 'string') { it.at = rel(it.w, t0, it.n); delete it.w; }
      add(t0, sh, 'cut'); });
  }
  const chapter = (pid, n, title) => add(T.s(pid) - 2.0, S('chapter', { n, title }), 'cut');
