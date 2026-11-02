# Sentinel-2 L2A true-colour crops (Copernicus data via AWS Earth Search COGs) for West Maui / Lahaina
import rasterio, numpy as np, sys
from rasterio.windows import from_bounds
from rasterio.warp import transform_bounds
from PIL import Image
base = 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/4/Q/GJ/2023/{m}/{id}/TCI.tif'
scenes = {'pre': ('8', 'S2A_4QGJ_20230803_0_L2A'), 'day': ('8', 'S2B_4QGJ_20230808_0_L2A'), 'post': ('8', 'S2A_4QGJ_20230813_0_L2A')}
boxes = {'westmaui': (-156.72, 20.78, -156.46, 21.03), 'lahaina': (-156.705, 20.86, -156.655, 20.90), 'maui': (-156.72, 20.56, -155.95, 21.05)}
for sk, (m, sid) in scenes.items():
    with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR', AWS_NO_SIGN_REQUEST='YES'):
        with rasterio.open(base.format(m=m, id=sid)) as ds:
            for bk, bb in boxes.items():
                b = transform_bounds('EPSG:4326', ds.crs, *bb)
                win = from_bounds(*b, transform=ds.transform)
                out_w = int(win.width) if bk == 'lahaina' else min(int(win.width), 3000)
                arr = ds.read(window=win, out_shape=(3, int(win.height * out_w / win.width), out_w), boundless=True, fill_value=0)
                img = np.transpose(arr, (1, 2, 0)).astype(np.float32)
                img = np.clip((img / 255.0) ** 0.85 * 1.15, 0, 1)  # gentle lift
                Image.fromarray((img * 255).astype(np.uint8)).save(f'assets/raw/s2/{sk}_{bk}.png')
                print(sk, bk, img.shape, flush=True)
