"""Prints for part 3 (NASA / ESA public domain, ru_geo/universe_size/archive/img):
  print_andromeda  andromeda.jpg (PIA04921, GALEX), centre crop that leaves out the mosaic's dark corners
  print_cmb        cmb_crop.jpg (Planck full-sky map): only the sky ellipse; the slide's caption and the inset outside it are
                   painted black (no lettering on screen)
usage: python3 -I tools/cut/prints.py <film dir>"""
import os, sys, subprocess
import numpy as np
from PIL import Image
D = sys.argv[1]; IMG = '/home/user/sofia-studio/ru_geo/universe_size/archive/img'
MP = os.path.join(D, 'kit/tools/make_print.py')
subprocess.run([sys.executable, MP, os.path.join(IMG, 'andromeda.jpg'), 'print_andromeda', '--crop', '330,330,1590,1590', '--w', '1260', '--sat', '.9'], check=True)
a = np.asarray(Image.open(os.path.join(IMG, 'cmb_crop.jpg')).convert('RGB')).astype(np.float32)
H, W = a.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]
cx, cy, rx, ry = 398.5, 192.5, 355.5, 178.0
inside = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2
alpha = np.clip((1.0 - inside) * 60, 0, 1)[..., None]
bg = np.array([14, 15, 20], np.float32)
out = a * alpha + bg * (1 - alpha)
tmp = os.path.join(D, 'out', 'cmb_masked.png'); os.makedirs(os.path.dirname(tmp), exist_ok=True)
Image.fromarray(out.astype(np.uint8)).save(tmp)
subprocess.run([sys.executable, MP, tmp, 'print_cmb', '--crop', '28,4,769,382', '--w', '741', '--sat', '.95'], check=True)
# print_newhorizons  sources/newhorizons_05pd2243.jpg (NASA KSC-05PD-2243, public domain): the New Horizons probe on its stand
#                    at Kennedy, 2005; crop leaves out the «NITROGEN» tank lettering
subprocess.run([sys.executable, MP, os.path.join(D, 'sources/newhorizons_05pd2243.jpg'), 'print_newhorizons', '--crop', '700,300,2270,1740', '--w', '1100', '--sat', '.85'], check=True)
