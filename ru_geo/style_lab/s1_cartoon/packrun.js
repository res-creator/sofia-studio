const { chromium } = require('playwright'); const fs = require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://'+__dirname+'/scene.html');await p.waitForFunction(()=>window.READY,null,{timeout:120000});
const sp=[];for(let a=-75;a<=90;a+=15)sp.push(a);
let best=null;
for (const [ov,sea] of [[3,5],[2.5,6],[4,6],[3,8]]) {
  const r=await p.evaluate(([sp,ov,sea])=>{const k=pack(1.5,sp,ov,sea);return {k,cov:window.PACK_COV};},[sp,ov,sea]);
  console.log(ov,sea,r.cov.toFixed(3)); r.ov=ov; r.sea=sea;
  r.score = r.cov; if(!best||r.cov>best.cov) best=r;
  fs.writeFileSync(__dirname+`/raw/pack_${ov}_${sea}.js`,'window.PACKED='+JSON.stringify(r.k)+';');
}
await b.close();})();
