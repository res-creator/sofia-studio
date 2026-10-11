require('./lib/fonts');
const {createCanvas}=require('@napi-rs/canvas');const BG=require('./lib/bg');const P=require('./lib/props');const {drawSofia}=require('./lib/sofia');const {drawGus}=require('./lib/gus');const U=require('./lib/ui');const {paint,roundRect,OL}=require('./lib/draw');
const W=1280,H=720,c=createCanvas(W,H),x=c.getContext('2d');
const k=BG.kitchen();
x.save();x.translate(W/2,H/2);x.scale(1.25,1.25);x.translate(-700,-1090);
x.drawImage(k,BG.X0,0,BG.WW,1920);
P.fridge(x,560,470,{open:1},cc=>drawSofia(cc,235,1120-262*0.7,0.7,{outfit:'pajama',mask:true,hairMess:1.2,wide:1,brow:{l:1,r:1},mouth:{o:1,open:0.6},armL:[-160,-330],armR:[160,-330],handL:'open',handR:'open'}));
x.restore();
// light glow from fridge
const g=x.createRadialGradient(780,380,20,840,330,520);g.addColorStop(0,'rgba(255,245,190,0.15)');g.addColorStop(1,'rgba(255,245,190,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
// darken left for text
const lg=x.createLinearGradient(0,0,640,0);lg.addColorStop(0,'rgba(40,20,10,0.55)');lg.addColorStop(1,'rgba(40,20,10,0)');x.fillStyle=lg;x.fillRect(0,0,W,H);
// Gus deadpan with toast on head, bottom-right
drawGus(x,1130,760,0.62,{face:-1,lids:0.62,look:-1});P.toast(x,1130-0.62*90,760-0.62*470-48,0.15,0.55);
// text
x.save();x.translate(330,250);x.rotate(-0.05);
U.textOutlined(x,'IN THE',0,-30,110,'#FFFFFF',{olw:22});
U.textOutlined(x,'FRIDGE?!',0,95,150,'#FFD23F',{olw:26});
x.restore();
x.save();x.translate(250,520);x.rotate(-0.03);paint(x,q=>roundRect(q,-190,-46,380,92,24),'#3DAA6E',{lw:7});U.textOutlined(x,'EASY ENGLISH',0,18,50,'#FFFFFF',{olw:9});x.restore();
x.save();x.translate(250,625);paint(x,q=>roundRect(q,-110,-38,220,76,20),'#FF7A2F',{lw:7});U.textOutlined(x,'A1–A2',0,18,50,'#FFFFFF',{olw:9});x.restore();
require('fs').writeFileSync('out/thumbnail.png',c.toBuffer('image/png'));
