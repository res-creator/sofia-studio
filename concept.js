const F=require('./lib/fonts');
const {createCanvas}=require('@napi-rs/canvas');const {drawSofia}=require('./lib/sofia');const {drawGus}=require('./lib/gus');const {paint,roundRect}=require('./lib/draw');
const W=1600,H=1640,c=createCanvas(W,H),x=c.getContext('2d');
const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#FFF6E6');g.addColorStop(1,'#FFE7D1');x.fillStyle=g;x.fillRect(0,0,W,H);
x.globalAlpha=0.5;for(const [a,b,r,col] of [[200,300,260,'#FFD9B8'],[1350,250,220,'#E3F0D2'],[1400,1200,300,'#FFD6DE'],[150,1250,240,'#E3F0D2']]){x.beginPath();x.arc(a,b,r,0,7);x.fillStyle=col;x.fill();}x.globalAlpha=1;
x.fillStyle='#3a221d';x.font='700 96px '+F.EN;x.textAlign='center';x.fillText('SOFIA',W/2,120);
x.font='800 34px '+F.RU;x.fillStyle='#8a5a3c';x.fillText('Easy English · новая София',W/2,170);
// main variant A
drawSofia(x,430,790,0.92,{armR:[235,-390],handR:'open',mouth:{open:0.45,smile:0.9},look:[0.2,0],brow:{l:0.3,r:0.4}});
// variant B
drawSofia(x,1000,820,0.78,{hair:'long',glasses:false,outfit:'blouse',turn:-0.25,mouth:{smile:0.7},armL:[-40,-60],armR:[40,-60],handL:'mitten',handR:'mitten'});
// Gus
drawGus(x,1380,1030,0.78,{lids:0.6,look:-1,face:-1});
const label=(t,s,cx,y)=>{x.font='800 34px '+F.RU;x.fillStyle='#3a221d';x.fillText(t,cx,y);x.font='700 24px '+F.RU;x.fillStyle='#8a5a3c';s.split('\n').forEach((l,i)=>x.fillText(l,cx,y+34+i*30));};
label('Вариант А (основной)','пучок с карандашом, очки,\nгорчичный свитер — смешная и живая',430,1120);
label('Вариант Б','длинные волосы,\nближе к старой Софии',1000,1120);
label('Гус','сосед-гусь в галстуке,\nвсегда недоволен',1380,1120);
// expressions row
x.font='700 44px '+F.EN;x.fillStyle='#3a221d';x.fillText('Эмоции',W/2,1250);
const ex=[['смеётся',{happyEyes:1,mouth:{open:0.8,smile:1},blush:1,tilt:0.12}],['в шоке',{wide:1,brow:{l:1,r:1},mouth:{o:1},hairMess:0.6}],['злится',{brow:{angry:1},mouth:{open:0.3,smile:-0.8,teeth:1},look:[0.4,0.2]}],['сонная',{sleepy:1,blink:0.75,mouth:{smile:-0.1},outfit:'pajama',mask:true,hairMess:1,tilt:-0.15}],['хитрая',{turn:0.35,look:[1,0],brow:{l:-0.3,r:0.6},mouth:{smile:0.9,w:0.8}}]];
ex.forEach(([n,p],i)=>{const cx=200+i*300,cy=1430;x.save();x.beginPath();x.arc(cx,cy-20,125,0,7);x.fillStyle='#FFFFFF';x.fill();x.lineWidth=6;x.strokeStyle='#3a221d';x.stroke();x.clip();drawSofia(x,cx,cy+255,0.56,Object.assign({legs:'none'},p));x.restore();x.font='800 28px '+F.RU;x.fillStyle='#3a221d';x.fillText(n,cx,cy+148);});
require('fs').writeFileSync('sofia_concept.png',c.toBuffer('image/png'));
