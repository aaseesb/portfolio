import { ANIMALS, RECIPES, PALETTE as P } from './data.js';
import * as S from './state.js';
import { draw } from './sprites.js';

const cv=document.getElementById('game'), c=cv.getContext('2d');
c.imageSmoothingEnabled=false;
let state=S.load()||S.fresh();
S.catchUp(state);

const $=id=>document.getElementById(id);
const recipesEl=$('recipes');
const btns=RECIPES.map(r=>{
  const b=document.createElement('button');
  b.onclick=()=>{ S.cook(state,r); refresh(); };
  recipesEl.append(b); return {r,b};
});
function refresh(){
  $('coins').textContent=`Coins: ${state.coins}`;
  $('basket').textContent=Object.entries(state.items).map(([k,v])=>`${k}: ${v}`).join('  ');
  for(const {r,b} of btns){
    const need=Object.entries(r.needs).filter(([,n])=>n>0).map(([i,n])=>`${n} ${i}`).join(' + ');
    b.textContent=`${r.name} (${need}) → ${r.price}c`; b.disabled=!S.canCook(state,r);
  }
}

function frame(){
  c.fillStyle=P.moss; c.fillRect(0,0,320,180);
  c.fillStyle=P.midnight; c.fillRect(0,0,320,60);            // sky/pond band
  c.fillStyle=P.darkGreen; c.fillRect(0,60,320,6);            // hedge
  c.fillStyle=P.pomelo; c.fillRect(20,80,280,84);             // pen floor
  c.fillStyle=P.moss; c.fillRect(24,84,272,76);
  for(const [k,def] of Object.entries(ANIMALS)){
    const a=state.animals[k], bob=Math.sin(performance.now()/400+def.x)*1.5|0;
    draw[k](c,def.x,def.y+bob);
    if(a.ready>0){ draw.bubble(c,def.x,def.y-26,def.product); c.fillStyle=P.darkGreen; c.font='8px monospace'; c.fillText('x'+a.ready,def.x+9,def.y-22); }
    // happiness bar
    c.fillStyle=P.darkGreen; c.fillRect(def.x-14,def.y+14,28,4);
    c.fillStyle=P.rosyBrown; c.fillRect(def.x-14,def.y+14,28*a.happiness/100,4);
  }
  requestAnimationFrame(frame);
}

cv.addEventListener('pointerdown',e=>{
  const rect=cv.getBoundingClientRect();
  const x=(e.clientX-rect.left)*320/rect.width, y=(e.clientY-rect.top)*180/rect.height;
  let best=null,bd=1e9;
  for(const [k,def] of Object.entries(ANIMALS)){
    const d=Math.hypot(x-def.x,y-(def.y-10)); if(d<bd){bd=d;best=k;}
  }
  if(best&&bd<26){
    const def=ANIMALS[best], onBubble=Math.abs(x-def.x)<10&&Math.abs(y-(def.y-26))<10;
    if(onBubble||state.animals[best].ready>0&&y<def.y-18) S.collect(state,best); else S.pet(state,best);
    refresh(); S.save(state);
  }
});

let last=performance.now();
setInterval(()=>{ const n=performance.now(); S.advance(state,n-last); last=n; refresh(); S.save(state); },1000);
document.addEventListener('visibilitychange',()=>{ if(document.hidden) S.save(state); else { S.catchUp(state); last=performance.now(); refresh(); }});
refresh(); frame();
