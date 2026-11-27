const mod = await import('./film.js');
await document.fonts.load('700 40px CV', 'Аб12'); await document.fonts.load('400 40px PM', 'Аб12');
const F = await mod.build();
const ctx = document.getElementById('c').getContext('2d');
window.DUR = F.dur; window.EV = F.ev;
window.render = t => F.render(ctx, t);
window.READY = true;
