// PLACEHOLDER sprites drawn from palette rectangles. Replaced by recolored
// Kenney Tiny Farm PNGs (see tools/recolor.py) once assets/ is populated.
import { PALETTE as P } from './data.js';
const r=(c,x,y,w,h,col,col2)=>{ c.fillStyle=col; c.fillRect(x,y,w,h); };
export const draw={
  chicken(c,x,y){ r(c,x-6,y-8,12,10,P.beige); r(c,x+4,y-12,6,6,P.beige); r(c,x+8,y-10,3,2,P.rosyBrown); r(c,x+6,y-14,2,3,P.amaranth); r(c,x-3,y+2,2,4,P.pomelo); r(c,x+2,y+2,2,4,P.pomelo); },
  sheep(c,x,y){ r(c,x-10,y-12,20,14,P.chalk); r(c,x+8,y-10,8,8,P.pomelo); r(c,x-7,y+2,3,6,P.pomelo); r(c,x+5,y+2,3,6,P.pomelo); },
  cow(c,x,y){ r(c,x-12,y-14,24,16,P.beige); r(c,x-6,y-12,7,6,P.darkGreen); r(c,x+10,y-12,9,9,P.beige); r(c,x+14,y-6,5,4,P.rosyBrown); r(c,x-9,y+2,3,6,P.pomelo); r(c,x+6,y+2,3,6,P.pomelo); },
  bubble(c,x,y,item){ r(c,x-7,y-7,14,14,P.beige); r(c,x-6,y-6,12,12,P.chalk);
    c.fillStyle={egg:P.beige,milk:P.brook,wool:P.pink}[item]; c.fillRect(x-3,y-3,6,6); },
};
