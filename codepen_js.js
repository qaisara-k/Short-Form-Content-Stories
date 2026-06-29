// ══════════ VERTICAL SWIPE NAVIGATION ══════════
const SCREENS=['sv','sa','st'];
let curScr=0,scrAnim=false;

function go(i){
  if(i===curScr||scrAnim) return;
  scrAnim=true;
  const dir=i>curScr?1:-1;
  const outEl=document.getElementById(SCREENS[curScr]);
  const inEl=document.getElementById(SCREENS[i]);
  inEl.style.transition='none';
  inEl.style.transform=dir>0?'translateY(100%)':'translateY(-100%)';
  void inEl.offsetWidth;
  inEl.style.transition='transform 0.44s cubic-bezier(0.25,1,0.5,1)';
  outEl.style.transition='transform 0.44s cubic-bezier(0.25,1,0.5,1)';
  inEl.style.transform='translateY(0)';
  outEl.style.transform=dir>0?'translateY(-100%)':'translateY(100%)';
  setTimeout(()=>{
    outEl.style.transition='none';
    outEl.classList.remove('on');
    outEl.style.transform=dir>0?'translateY(100%)':'translateY(-100%)';
    inEl.classList.add('on');inEl.style.transform='';inEl.style.transition='';
    curScr=i;scrAnim=false;
    if(i===0) enterVideo();
    if(i===1){buildBars();enterAudio();}
    if(i===2) enterQuote();
    snd.swipe();
  },460);
}

// vertical swipe on phone
(function(){
  const phone=document.querySelector('.phone');
  let sy=0,sx=0,sdy=0,sdx=0,sDrg=false;
  phone.addEventListener('touchstart',e=>{sy=e.touches[0].clientY;sx=e.touches[0].clientX;sdy=0;sdx=0;sDrg=true;},{passive:true});
  phone.addEventListener('touchmove',e=>{if(!sDrg)return;sdy=e.touches[0].clientY-sy;sdx=Math.abs(e.touches[0].clientX-sx);},{passive:true});
  phone.addEventListener('touchend',()=>{
    if(!sDrg)return;sDrg=false;
    if(Math.abs(sdy)>60&&Math.abs(sdy)>sdx*1.5){
      if(sdy<0&&curScr<2)go(curScr+1);
      if(sdy>0&&curScr>0)go(curScr-1);
    }
  },{passive:true});
  // desktop mouse
  let my=0,mx=0,mdy=0,mdx=0,mDrg=false;
  phone.addEventListener('mousedown',e=>{
    if(e.target.closest('.vplay,.bbar,.xbtn,.qwrap,.awrap,.vhud,.sheet,.ibtn'))return;
    my=e.clientY;mx=e.clientX;mdy=0;mdx=0;mDrg=true;
  });
  window.addEventListener('mousemove',e=>{if(!mDrg)return;mdy=e.clientY-my;mdx=Math.abs(e.clientX-mx);});
  window.addEventListener('mouseup',()=>{
    if(!mDrg)return;mDrg=false;
    if(Math.abs(mdy)>60&&Math.abs(mdy)>mdx*1.5){
      if(mdy<0&&curScr<2)go(curScr+1);
      if(mdy>0&&curScr>0)go(curScr-1);
    }
  });
})();

// ══════════ GENERIC ══════════
function btnPress(el){el.style.transform='scale(0.85)';setTimeout(()=>el.style.transform='',180);}

const SC=['#ff6b21','#ffaa44','#ffd080','#ff3b6b','#fff','#ffbc85'];
const liked={v:false,a:false,t:false};

function doHeart(id){
  liked[id]=!liked[id];
  const hl=document.getElementById(id+'hl');
  const ibtn=document.getElementById(id+'ibtn');
  if(liked[id]){
    ibtn.classList.add('liked');
    hl.style.opacity='1';
    // re-trigger bounce animation
    hl.style.animation='none';void hl.offsetWidth;
    hl.style.animation='heartPop 0.38s cubic-bezier(0.34,1.56,0.64,1) forwards';
    snd.heart();
  } else {
    ibtn.classList.remove('liked');
    hl.style.opacity='0';
    snd.heartOff();
  }
}

// ══════════ ENTRANCE ANIMATIONS ══════════
function enterVideo(){
  const btn=document.getElementById('vp');
  btn.style.opacity='0';btn.style.transform='translate(-50%,-50%) scale(0.8)';
  setTimeout(()=>{
    btn.style.transition='opacity 0.38s ease,transform 0.38s cubic-bezier(0.34,1.56,0.64,1)';
    btn.style.opacity='1';btn.style.transform='translate(-50%,-50%) scale(1)';
    setTimeout(()=>btn.style.transition='',420);
  },100);
}
function enterAudio(){
  // stagger in the centre content items only
  const items=document.querySelectorAll('.atop > *, .atbtn');
  items.forEach((el,i)=>{
    el.style.opacity='0';el.style.transform='translateY(12px)';
    setTimeout(()=>{
      el.style.transition='opacity 0.4s ease,transform 0.4s cubic-bezier(0.22,1,0.36,1)';
      el.style.opacity='1';el.style.transform='';
      setTimeout(()=>el.style.transition='',440);
    },80+i*80);
  });
  // bars grow up
  const bars=document.querySelectorAll('#abars .abar');
  bars.forEach((b,i)=>{
    b.style.transformOrigin='bottom';b.style.transform='scaleY(0)';b.style.opacity='0';
    setTimeout(()=>{
      b.style.transition='transform 0.35s cubic-bezier(0.22,1,0.36,1),opacity 0.25s';
      b.style.transform='scaleY(1)';b.style.opacity='1';
      setTimeout(()=>{b.style.transition='';startPulse();},380);
    },50+i*7);
  });
}
function enterQuote(){
  const qc=document.getElementById('qcard');
  qc.style.opacity='0';
  qc.style.transform='translateY(16px)';
  setTimeout(()=>{
    qc.style.transition='opacity 0.42s ease,transform 0.42s cubic-bezier(0.22,1,0.36,1)';
    qc.style.opacity='1';
    qc.style.transform='translateX(0)';
    setTimeout(()=>qc.style.transition='',450);
  },120);
  startWaterRipple();
}
enterVideo();
document.getElementById('sa').style.transform='translateY(100%)';
document.getElementById('st').style.transform='translateY(100%)';

// ══════════ VIDEO ══════════
let vOn=false,vProg=32,vTmr=null,vHideTmr=null,vTotSec=60;
let vScrub=false,vHoldTmr=null,vScrubX=0,vLastDx=0;

const SCRUB_EMOJIS_FWD=[];
const SCRUB_EMOJIS_BWD=[];

function vTog(){
  vOn=!vOn;
  document.getElementById('vpi').style.display=vOn?'none':'block';
  document.getElementById('vpause').style.display=vOn?'block':'none';
  const btn=document.getElementById('vp');
  btn.style.transform='translate(-50%,-50%) scale(0.89)';
  setTimeout(()=>btn.style.transform='',160);
  const ti=document.getElementById('vtimg');
  if(vOn){
    vTmr=setInterval(()=>{vProg=Math.min(vProg+100/vTotSec/10,100);vDraw();if(vProg>=100)clearInterval(vTmr);},100);
    clearTimeout(vHideTmr);vHideTmr=setTimeout(()=>btn.classList.add('hidden'),400);
    ti.classList.add('playing');
    snd.play();
  } else {
    clearInterval(vTmr);clearTimeout(vHideTmr);btn.classList.remove('hidden');ti.classList.remove('playing');
    snd.pause();
  }
}
function vDraw(){
  document.getElementById('vfill').style.width=vProg+'%';
  const knob=document.getElementById('vknob');
  knob.style.left=vProg+'%';
  const s=Math.round(vProg/100*vTotSec),m=Math.floor(s/60),sec=s%60;
  document.getElementById('vts').innerHTML=(m<10?'0':'')+m+':'+(sec<10?'0':'')+sec+' <span>/ 01:00</span>';
}
function vUpdateEmoji(dx){
  const emoji=dx>0?'⏩':'⏪';
  const knob=document.getElementById('vknob');
  if(knob.textContent!==emoji){
    knob.textContent=emoji;
    knob.style.animation='none';void knob.offsetWidth;
    knob.style.animation='knobPop 0.22s cubic-bezier(0.34,1.56,0.64,1)';
  }
}
vDraw();

// tap to show play
document.getElementById('sv').addEventListener('click',function(e){
  if(e.target.closest('.bbar,.xbtn,.vplay,.vhud'))return;
  if(!vOn)return;
  const btn=document.getElementById('vp');
  clearTimeout(vHideTmr);btn.classList.remove('hidden');
  vHideTmr=setTimeout(()=>btn.classList.add('hidden'),2000);
});
// hold + drag to scrub
const svEl=document.getElementById('sv');
svEl.addEventListener('mousedown',vHDn);svEl.addEventListener('touchstart',vHDn,{passive:true});
svEl.addEventListener('mousemove',vHMv);svEl.addEventListener('touchmove',vHMv,{passive:true});
svEl.addEventListener('mouseup',vHUp);svEl.addEventListener('touchend',vHUp);
function vHDn(e){
  if(e.target.closest('.vplay,.bbar,.xbtn'))return;
  vScrubX=e.touches?e.touches[0].clientX:e.clientX;
  // 1. Increased threshold to 350ms to prevent accidental triggers
  vHoldTmr=setTimeout(()=>{vScrub=true;document.getElementById('vhud').classList.add('show');},350);
}
function vHMv(e){
  if(!vScrub)return;
  const x=e.touches?e.touches[0].clientX:e.clientX;
  const dx=x-vScrubX;vLastDx=dx;vScrubX=x;
  const prev=vProg;
  vProg=Math.max(0,Math.min(100,vProg+dx*0.15));

  // 2. Edge resistance — elastic stretch + heavy haptic at limits
  const fill=document.getElementById('vfill');
  const track=document.getElementById('vtrack');
  if(vProg<=0||vProg>=100){
    // elastic visual: stretch the fill beyond bounds
    const overDrag=Math.abs(dx)*0.4;
    const stretchDir=vProg<=0?-1:1;
    track.style.transform=`scaleX(${1+overDrag/300}) translateX(${stretchDir*overDrag*0.3}px)`;
    track.style.transition='none';
    // heavy haptic clunk
    if(navigator.vibrate) navigator.vibrate([30,10,30]);
    snd.edgeHit();
  } else {
    track.style.transform='';
    track.style.transition='transform 0.2s cubic-bezier(0.34,1.56,0.64,1)';
  }
  vDraw();
}
function vHUp(){
  clearTimeout(vHoldTmr);
  if(vScrub){
    vScrub=false;
    // snap track back if stretched
    const track=document.getElementById('vtrack');
    track.style.transition='transform 0.3s cubic-bezier(0.34,1.56,0.64,1)';
    track.style.transform='';
    setTimeout(()=>document.getElementById('vhud').classList.remove('show'),1200);
  }
}

// ══════════ AUDIO ══════════
let aProg=40,aTotSec=60;
const BH=[14,22,38,18,46,28,52,24,34,56,40,16,50,32,20,46,54,34,14,42,26,56,22,40,12,34,24,50,42,16,48,36,26,18,46,14,52,28,40,58,20,44,32,12,24,50,36,16,46,30,56,18,42,32,14,26,52,42,22,38,12,20,50,34,18,46,26,54,38,16,44,12,24,56,22,38,50,20,44,14,36,48,26,16,54,36,22];
let pulseActive=false,pulseTimers=[];

function buildBars(){
  const c=document.getElementById('abars');
  if(c.children.length)return;
  BH.forEach(h=>{
    const b=document.createElement('div');b.className='abar';
    b.style.height=h+'px';c.appendChild(b);
  });
}
buildBars();

function updBars(){
  const bars=[...document.querySelectorAll('#abars .abar')];
  const idx=Math.floor(bars.length*aProg/100);
  bars.forEach((b,i)=>{
    b.classList.remove('played','pulse');
    if(i<idx){
      b.classList.add('played');
    }
    // all bars breathe when active
    if(pulseActive){
      b.classList.add('pulse');
      b.style.setProperty('--dur',(0.7+Math.random()*0.9).toFixed(2)+'s');
      b.style.setProperty('--dly',(Math.random()*0.6).toFixed(2)+'s');
    }
  });
  // live timeline — capped at 59s so left never reaches right (01:00)
  const totalSec=60;
  const rawSec=Math.floor(aProg/100*totalSec);
  const s=Math.min(rawSec,59),m=Math.floor(s/60),sec=s%60;
  document.getElementById('aelapsed').textContent=(m<10?'0':'')+m+':'+(sec<10?'0':'')+sec;
}

function startPulse(){
  if(pulseActive)return;
  pulseActive=true;updBars();
}

// waveform drag
let awDrg=false,awX0=0,awP0=0,awLastBarIdx=-1;
function awDn(e){
  awDrg=true;awX0=e.touches?e.touches[0].clientX:e.clientX;awP0=aProg;
  awLastBarIdx=Math.floor(BH.length*aProg/100);
  document.getElementById('ats').classList.add('show');
  window.addEventListener('mousemove',awMv);window.addEventListener('mouseup',awUp);
  window.addEventListener('touchmove',awMv,{passive:true});window.addEventListener('touchend',awUp);
}
function awMv(e){
  if(!awDrg)return;
  const x=(e.touches?e.touches[0].clientX:e.clientX)-awX0;
  aProg=Math.max(0,Math.min(100,awP0+x*0.35));updBars();
  const totalSec=60;
  const rawSec=Math.floor(aProg/100*totalSec);
  const s=Math.min(rawSec,59);
  document.getElementById('ats').innerHTML=Math.floor(s/60)+':'+(s%60<10?'0':'')+(s%60)+' <span>/ 01:00</span>';
  // 3. Haptic tick for every bar finger crosses (zipper texture)
  const curBarIdx=Math.floor(BH.length*aProg/100);
  if(curBarIdx!==awLastBarIdx){
    if(navigator.vibrate) navigator.vibrate(2); // tiny 2ms tick
    snd.scrubTick();
    awLastBarIdx=curBarIdx;
  }
}
function awUp(){
  awDrg=false;
  window.removeEventListener('mousemove',awMv);window.removeEventListener('mouseup',awUp);
  window.removeEventListener('touchmove',awMv);window.removeEventListener('touchend',awUp);
  setTimeout(()=>document.getElementById('ats').classList.remove('show'),1400);
}
updBars();

function showSheet(){document.getElementById('sheet').classList.remove('hide');}
function hideSheet(){document.getElementById('sheet').classList.add('hide');}

// ══════════ BACKGROUND LIGHT SHIMMER (quote screen) ══════════
function startWaterRipple(){
  const canvas=document.getElementById('wcanvas');
  const ctx=canvas.getContext('2d');
  const W=375,H=812;

  const HUES=[
    `rgba(255,220,160,`, // warm gold
    `rgba(180,220,255,`, // cool blue
    `rgba(255,255,255,`, // white
    `rgba(220,180,255,`, // soft purple
    `rgba(160,240,200,`, // mint
  ];

  const circles=Array.from({length:12},()=>({
    x:Math.random()*W,
    y:Math.random()*H,
    r:60+Math.random()*110,
    speed:0.18+Math.random()*0.28,
    opacity:0.16+Math.random()*0.28,
    drift:(Math.random()-0.5)*0.05,
    hue:HUES[Math.floor(Math.random()*HUES.length)],
  }));

  function draw(){
    ctx.clearRect(0,0,W,H);
    for(const c of circles){
      c.y-=c.speed;
      c.x+=c.drift;
      if(c.y<-c.r*2){c.y=H+c.r;c.x=Math.random()*W;}
      // fade in at bottom, fade out at top
      const fade=Math.min(1,Math.min((H-c.y)/120,(c.y+c.r*2)/(c.r*2)));
      const a=c.opacity*fade;
      const grad=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,c.r);
      grad.addColorStop(0,   c.hue+a+')');
      grad.addColorStop(0.45,c.hue+(a*0.45)+')');
      grad.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(c.x,c.y,c.r,0,Math.PI*2);
      ctx.fillStyle=grad;
      ctx.fill();
    }
    animId=requestAnimationFrame(draw);
  }
  let animId=requestAnimationFrame(draw);
  window._waterCleanup=()=>cancelAnimationFrame(animId);
}

// cleanup water when navigating away
const _origGo=go;
window.go=function(i){
  if(curScr===2&&window._waterCleanup){window._waterCleanup();window._waterCleanup=null;}
  _origGo(i);
};

// ══════════ QUOTE SWIPE ══════════
const QS=[
  {l:'Insight 1 of 3',t:'" If you are irritated by every rub, how will you ever be polished?"',a:'RUMI',s:'The transformation of You'},
  {l:'Insight 2 of 3',t:'"Procrastination is a learned tendency. That is something to celebrate."',a:'Eric Jaffe',s:'Change your language, change your life'},
  {l:'Insight 3 of 3',t:'"Start by substituting new thoughts for those that prevent you from changing."',a:'Joseph Ferrari',s:'The transformation of You'},
];
let qi=0,qAnm=false,qDrg=false,qX=0,qX0=0;
const qwrap=document.getElementById('qwrap');
const qcard=document.getElementById('qcard');

qwrap.addEventListener('mousedown',qDn);
qwrap.addEventListener('touchstart',qDn,{passive:true});

function qDn(e){
  if(qAnm)return;
  qDrg=true;qX0=e.touches?e.touches[0].clientX:e.clientX;qX=0;
  qcard.style.transition='none';
  window.addEventListener('mousemove',qMv);window.addEventListener('mouseup',qUp);
  window.addEventListener('touchmove',qMv,{passive:true});window.addEventListener('touchend',qUp);
}
function qMv(e){
  if(!qDrg)return;
  qX=(e.touches?e.touches[0].clientX:e.clientX)-qX0;
  const rot=qX*0.05;
  qcard.style.transform=`translateX(${qX}px) rotate(${rot}deg)`;
  qcard.style.opacity=String(Math.max(0,1-Math.abs(qX)/200));
}
function qUp(){
  if(!qDrg)return;qDrg=false;
  window.removeEventListener('mousemove',qMv);window.removeEventListener('mouseup',qUp);
  window.removeEventListener('touchmove',qMv);window.removeEventListener('touchend',qUp);
  Math.abs(qX)>55?qSwipe(qX<0?1:-1):qSnap();
}
function qSnap(){
  qcard.style.transition='transform 0.36s cubic-bezier(0.34,1.56,0.64,1),opacity 0.22s';
  qcard.style.transform='translateX(0) rotate(0deg)';
  qcard.style.opacity='1';
  setTimeout(()=>qcard.style.transition='',380);
}
function qSwipe(dir){
  qAnm=true;
  snd.quotePage();
  snd.paperTear(); // sharp tear snap as card commits to flying off
  // fly off
  qcard.style.transition='transform 0.28s cubic-bezier(0.4,0,1,0.6),opacity 0.22s';
  qcard.style.transform=`translateX(${dir<0?-420:420}px) rotate(${dir<0?-12:12}deg)`;
  qcard.style.opacity='0';
  setTimeout(()=>{
    qi=(qi+dir+QS.length)%QS.length;
    const d=QS[qi];
    document.getElementById('qlbl').textContent=d.l;
    document.getElementById('qtxt').textContent=d.t;
    document.getElementById('qauthor').textContent=d.a;
    document.getElementById('qsrc').textContent=d.s;
    document.getElementById('qsavebtn').classList.remove('saved');
    
    
    [0,1,2].forEach(i=>{const el=document.getElementById('d'+i);if(el){el.style.background=i===qi%3?'white':'rgba(255,255,255,0.35)';}});
    // enter from opposite side
    qcard.style.transition='none';
    qcard.style.transform=`translateX(${dir<0?380:-380}px) rotate(${dir<0?8:-8}deg)`;
    qcard.style.opacity='0';
    void qcard.offsetWidth;
    qcard.style.transition='transform 0.36s cubic-bezier(0.22,1,0.36,1),opacity 0.26s';
    qcard.style.transform='translateX(0) rotate(0deg)';
    qcard.style.opacity='1';
    setTimeout(()=>{qcard.style.transition='';qAnm=false;},380);
  },300);
}

// Save quote — wax seal stamp effect
function saveQuote(e){
  const btn=document.getElementById('qsavebtn');
  btn.classList.toggle('saved');
  snd.save();
  // ripple from tap point
  const r=btn.getBoundingClientRect();
  const x=e.clientX-r.left,y=e.clientY-r.top;
  const rip=document.createElement('span');
  rip.style.cssText=`position:absolute;left:${x}px;top:${y}px;width:0;height:0;border-radius:50%;
    background:rgba(255,154,92,0.3);transform:translate(-50%,-50%);pointer-events:none;z-index:10;
    animation:saveRipple 0.55s ease-out forwards;`;
  btn.style.position='relative';btn.style.overflow='hidden';
  btn.appendChild(rip);
  setTimeout(()=>rip.remove(),600);
  if(!document.getElementById('rkf')){
    const s=document.createElement('style');s.id='rkf';
    s.textContent='@keyframes saveRipple{0%{width:0;height:0;opacity:0.5}100%{width:300px;height:300px;opacity:0}}';
    document.head.appendChild(s);
  }
}

// ══════════ SOUND ENGINE ══════════
const snd=(function(){
  let ctx=null;
  function ac(){
    if(!ctx) ctx=new(window.AudioContext||window.webkitAudioContext)();
    if(ctx.state==='suspended') ctx.resume();
    return ctx;
  }
  function tone(freq,type,vol,attack,decay,delay=0){
    const c=ac(),o=c.createOscillator(),g=c.createGain();
    o.connect(g);g.connect(c.destination);
    o.type=type;o.frequency.setValueAtTime(freq,c.currentTime+delay);
    g.gain.setValueAtTime(0,c.currentTime+delay);
    g.gain.linearRampToValueAtTime(vol,c.currentTime+delay+attack);
    g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+delay+attack+decay);
    o.start(c.currentTime+delay);o.stop(c.currentTime+delay+attack+decay+0.05);
  }
  function noise(vol,dur,delay=0,freq=2200,q=0.7){
    const c=ac();
    const buf=c.createBuffer(1,c.sampleRate*dur,c.sampleRate);
    const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    const src=c.createBufferSource(),g=c.createGain();
    const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=freq;f.Q.value=q;
    src.connect(f);f.connect(g);g.connect(c.destination);
    g.gain.setValueAtTime(0,c.currentTime+delay);
    g.gain.linearRampToValueAtTime(vol,c.currentTime+delay+0.008);
    g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+delay+dur);
    src.start(c.currentTime+delay);src.stop(c.currentTime+delay+dur+0.02);
  }
  return{
    // Screen swipe
    swipe(){noise(0.1,0.16);tone(160,'sine',0.035,0.01,0.14);},
    // Video play — ascending
    play() {tone(520,'sine',0.08,0.005,0.07);tone(380,'sine',0.04,0.005,0.09,0.04);},
    // 4. Video pause — descending mirror
    pause(){tone(380,'sine',0.07,0.005,0.09);tone(520,'sine',0.04,0.005,0.07,0.05);},
    // Heart like — ascending warm chime
    heart(){tone(660,'sine',0.11,0.008,0.28);tone(880,'sine',0.07,0.008,0.26,0.08);},
    // 4. Heart unlike — descending mirror
    heartOff(){tone(880,'sine',0.08,0.008,0.22);tone(660,'sine',0.05,0.008,0.25,0.07);},
    // Quote page turn
    quotePage(){noise(0.05,0.1);tone(240,'sine',0.025,0.008,0.09);},
    // 6. Paper tear — sharp high-pass noise burst
    paperTear(){noise(0.22,0.07,0,7000,0.4);noise(0.1,0.12,0.04,3000,0.5);},
    // Save quote — rising confirmation
    save() {tone(528,'sine',0.09,0.01,0.18);tone(660,'sine',0.06,0.01,0.18,0.1);tone(792,'sine',0.04,0.01,0.2,0.2);},
    // 5. Wax seal — heavy thud + crunch + release
    waxSeal(){
      // deep thud
      tone(80,'sine',0.3,0.005,0.18);
      tone(60,'sine',0.2,0.005,0.22,0.02);
      // wax crunch — low rumble noise
      noise(0.18,0.14,0,200,0.3);
      // crisp release tick
      noise(0.08,0.04,0.22,4000,0.6);
    },
    // 2. Edge hit — dull thud at scrub limits
    edgeHit(){tone(120,'sine',0.12,0.003,0.08);noise(0.06,0.05,0,400,0.4);},
    // 3. Audio scrub tick — tiny high tick per bar
    scrubTick(){tone(900,'sine',0.018,0.002,0.025);},
  };
})();