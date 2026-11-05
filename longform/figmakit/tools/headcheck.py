# Check that the expression heads of a character are pixel-aligned (they are swapped in animation, so a shift = a visible jump).
# Prints the shift of every head vs head_neutral; |shift| <= 1.5 px is OK, more -> regenerate the sheet or shift the PNG.
# Usage: python3 headcheck.py assets/characters/<name>
import sys, glob, os, cv2
d = sys.argv[1]; base = cv2.cvtColor(cv2.imread(f'{d}/head_neutral.png')[..., :3], cv2.COLOR_BGR2GRAY).astype('float32')
for f in sorted(glob.glob(f'{d}/head_*.png')):
    g = cv2.cvtColor(cv2.imread(f)[..., :3], cv2.COLOR_BGR2GRAY).astype('float32'); h = min(g.shape[0], base.shape[0]); w = min(g.shape[1], base.shape[1])
    (dx, dy), r = cv2.phaseCorrelate(base[:h, :w], g[:h, :w]); ok = abs(dx) <= 1.5 and abs(dy) <= 1.5
    print(f'{os.path.basename(f):24s} shift {dx:+.1f},{dy:+.1f}  {"OK" if ok else "FIX"}')
