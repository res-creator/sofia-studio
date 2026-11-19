// node render.js <workdir> <out_video_noaudio.mp4> [coverTime]  : renders 1080x1920@30 frames of scene.html through ffmpeg
const {chromium}=require('playwright');const {spawn}=require('child_process');const fs=require('fs');const path=require('path');
(async()=>{const wd=process.argv[2],out=process.argv[3],cover=process.argv[4];const TL=JSON.parse(fs.readFileSync(wd+'/timeline.json'));
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+path.join(__dirname,'scene.html'));await p.evaluate(tl=>setTL(tl),TL);await p.waitForTimeout(400);
if(cover!==undefined){await p.evaluate(t=>render(t),parseFloat(cover));await p.screenshot({path:out});await b.close();return;}
const FPS=30,N=Math.ceil(TL.total*FPS);
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','17','-preset','medium',out],{stdio:['pipe','inherit','inherit']});
for(let f=0;f<N;f++){await p.evaluate(t=>render(t),f/FPS);const buf=await p.screenshot({type:'jpeg',quality:93});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(f%150===0)console.log('frame',f,'/',N);}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('done',N);})();
