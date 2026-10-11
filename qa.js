require('./lib/fonts');const {createCanvas}=require('@napi-rs/canvas');const {execFileSync}=require('child_process');
const T=require('./ep/timeline.json').T;const step=+process.argv[2]||2, off=+process.argv[3]||0.5;
const ts=[];for(let t=off;t<T;t+=step)ts.push(+t.toFixed(2));
for(let i=0;i<ts.length;i+=20){const part=ts.slice(i,i+20);
 // reuse render.js 'still' (4 cols)
 execFileSync('node',['ep/render.js','still',part.join(','),`prev/qa_${String(i/20).padStart(2,'0')}.png`]);}
console.log(ts.length);
