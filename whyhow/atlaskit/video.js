// Sequential frame reader for real footage clips: one ffmpeg process per shot, frames read in order (re-seeks if time jumps).
const { spawn } = require('child_process'); const K = require('./core');
const FB = K.W * K.H * 4;
class Reader {
  constructor(file, inPoint, rate = 1) { this.file = file; this.rate = rate; this.inPoint = inPoint; this.open(0); }
  open(start) { this.close(); this.pos = start; this.buf = []; this.len = 0; this.waiters = []; this.ended = false;
    const vf = `${this.rate !== 1 ? `setpts=PTS/${this.rate},` : ''}fps=${K.FPS},scale=${K.W}:${K.H}:force_original_aspect_ratio=increase,crop=${K.W}:${K.H}`;
    this.p = spawn('ffmpeg', ['-v', 'error', '-stream_loop', '-1', '-ss', String(Math.max(0, this.inPoint + start * this.rate)), '-i', this.file, '-an', '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { stdio: ['ignore', 'pipe', 'inherit'] });
    const proc = this.p;
    proc.stdout.on('data', d => { if (this.p !== proc) return; this.buf.push(d); this.len += d.length; this.wake(); if (this.len > FB * 6) proc.stdout.pause(); });
    proc.on('close', () => { if (this.p !== proc) return; this.ended = true; this.wake(); }); }
  wake() { const w = this.waiters; this.waiters = []; w.forEach(f => f()); }
  async take() { while (this.len < FB && !this.ended) await new Promise(r => this.waiters.push(r));
    if (this.len < FB) return null; const all = Buffer.concat(this.buf); const fr = all.subarray(0, FB); const rest = all.subarray(FB); this.buf = rest.length ? [Buffer.from(rest)] : []; this.len = rest.length;
    if (this.len < FB * 3) this.p.stdout.resume(); return fr; }
  // frame at local time t (seconds since clip in-point)
  async at(t) { const f = Math.round(t * K.FPS), cur = Math.round(this.pos * K.FPS);
    if (f < cur || f > cur + 45) this.open(f / K.FPS);
    let fr = null; while (Math.round(this.pos * K.FPS) <= f) { fr = await this.take(); this.pos += 1 / K.FPS; if (!fr) break; }
    return fr; }
  close() { if (this.p) { try { this.p.kill('SIGKILL'); } catch (e) {} this.p = null; } }
}
const R = new Map();
// fills p._cv (canvas) with the right frame for shot s at absolute time
async function prepare(s, time, epDir) {
  if (s.scene !== 'video') return; const p = s.p; const key = s._parent || s; const lt = Math.max(0, time - s.t + (s.off || 0));
  let r = R.get(key); if (!r) { r = new Reader(require('path').resolve(epDir, p.file), (p.in || 0), p.rate || 1); R.set(key, r); }
  const fr = await r.at(lt); if (!fr) return;
  if (!p._cv) p._cv = K.createCanvas(K.W, K.H); const c = p._cv.getContext('2d'); const id = c.createImageData(K.W, K.H); id.data.set(fr); c.putImageData(id, 0, 0);
}
function release(keep) { const ks = keep.map(s => s._parent || s); for (const [s, r] of R) if (!ks.includes(s)) { r.close(); R.delete(s); } }
module.exports = { prepare, release };
