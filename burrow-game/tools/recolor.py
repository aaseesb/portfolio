#!/usr/bin/env python3
"""Recolor Kenney Tiny Farm PNGs to the Moss & Marigold palette.
Usage: python3 -I tools/recolor.py <input_dir> <output_dir>
Each opaque pixel maps to the nearest palette color by luminance-weighted
hue shift: greens -> moss family, warm/yellow -> cream/chalk, red/orange -> rose,
shadows -> dark green. Alpha is preserved."""
import sys, os, colorsys
from PIL import Image
PAL = ["0A3323","105666","839959","AABAAE","9F9679","F7F4D5","E3D6BF","D3968C","B5728A","933B5B",
       "2F5A3A","5E7A45","C9D3A8","6B5B45","3E2A2A","FFFFFF"]
PAL = [tuple(int(h[i:i+2],16) for i in (0,2,4)) for h in PAL]
def near(p):
    return min(PAL, key=lambda q: sum((a-b)**2*w for a,b,w in zip(p,q,(.3,.59,.11))))
def main(src, dst):
    os.makedirs(dst, exist_ok=True)
    for f in sorted(os.listdir(src)):
        if not f.endswith(".png"): continue
        im = Image.open(os.path.join(src,f)).convert("RGBA"); px = im.load()
        for y in range(im.height):
            for x in range(im.width):
                r,g,b,a = px[x,y]
                if a: px[x,y] = (*near((r,g,b)), a)
        im.save(os.path.join(dst,f))
if __name__ == "__main__": main(*sys.argv[1:3])
