# Measurement sheet: draws a pixel grid (labels in the PNG's own pixels) over one or more parts, so joint points (neck, shoulders,
# arm tops, elbow line, head pivot) can be read by eye. Usage: python3 grid.py out.png part1.png [part2.png ...]
import sys, cv2, numpy as np
out, files = sys.argv[1], sys.argv[2:]; tiles = []
for f in files:
    im = cv2.imread(f, cv2.IMREAD_UNCHANGED); a = im[..., 3:4] / 255.0 if im.shape[2] == 4 else 1; v = (im[..., :3] * a + 235 * (1 - a)).astype(np.uint8)
    for y in range(0, v.shape[0], 20): cv2.line(v, (0, y), (v.shape[1], y), (0, 0, 255) if y % 100 == 0 else (190, 190, 255), 1); cv2.putText(v, str(y), (2, y + 10), 0, 0.3, (0, 0, 255), 1)
    for x in range(0, v.shape[1], 20): cv2.line(v, (x, 0), (x, v.shape[0]), (255, 0, 0) if x % 100 == 0 else (255, 200, 200), 1)
    for x in range(0, v.shape[1], 100): cv2.putText(v, str(x), (x + 2, 10), 0, 0.35, (255, 0, 0), 1)
    cv2.putText(v, f.split('/')[-1], (4, v.shape[0] - 6), 0, 0.45, (0, 0, 0), 1); tiles.append(v)
H = max(t.shape[0] for t in tiles); row = np.hstack([np.pad(t, ((0, H - t.shape[0]), (0, 10), (0, 0)), constant_values=255) for t in tiles]); cv2.imwrite(out, row); print('ok', out)
