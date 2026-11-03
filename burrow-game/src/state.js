import { ANIMALS, MAX_OFFLINE_MS } from './data.js';
const KEY='moss-marigold-v1';

export function fresh(now=Date.now()){
  const animals={};
  for(const k in ANIMALS) animals[k]={ happiness:50, progress:0, ready:0, lastPet:0 };
  return { v:1, coins:0, items:{egg:0,milk:0,wool:0}, dishes:{}, animals, savedAt:now };
}
export function load(storage=globalThis.localStorage){
  try{ const s=JSON.parse(storage.getItem(KEY)); if(s&&s.v===1) return s; }catch{}
  return null;
}
export function save(s,storage=globalThis.localStorage,now=Date.now()){
  s.savedAt=now; try{ storage.setItem(KEY,JSON.stringify(s)); }catch{}
}
// Happier animals produce faster: 0.5x at 0 happiness, 1.5x at 100.
export const speed=h=>0.5+h/100;

// Advance simulation by dt ms (used for both live ticks and offline catch-up).
export function advance(s,dt){
  dt=Math.max(0,Math.min(dt,MAX_OFFLINE_MS));
  for(const [k,def] of Object.entries(ANIMALS)){
    const a=s.animals[k]; if(!a) continue;
    // happiness slowly decays toward 20 when neglected
    a.happiness=Math.max(20,a.happiness-dt/60000);
    if(a.ready>=def.cap){ a.progress=0; continue; }
    a.progress+=dt*speed(a.happiness);
    const n=Math.floor(a.progress/def.interval);
    if(n>0){ a.ready=Math.min(def.cap,a.ready+n); a.progress-=n*def.interval; if(a.ready>=def.cap)a.progress=0; }
  }
}
export function catchUp(s,now=Date.now()){ advance(s,now-s.savedAt); s.savedAt=now; }
export function collect(s,k){
  const a=s.animals[k], def=ANIMALS[k]; if(!a||a.ready<1) return 0;
  const n=a.ready; s.items[def.product]=(s.items[def.product]||0)+n; a.ready=0; return n;
}
export function pet(s,k,now=Date.now()){
  const a=s.animals[k]; if(now-a.lastPet<1500) return false;
  a.lastPet=now; a.happiness=Math.min(100,a.happiness+8); return true;
}
export function canCook(s,r){ return Object.entries(r.needs).every(([i,n])=>(s.items[i]||0)>=n); }
export function cook(s,r){
  if(!canCook(s,r)) return false;
  for(const [i,n] of Object.entries(r.needs)) s.items[i]-=n;
  s.coins+=r.price;
  for(const a of Object.values(s.animals)) a.happiness=Math.min(100,a.happiness+2); // fed animals feel loved
  return true;
}
