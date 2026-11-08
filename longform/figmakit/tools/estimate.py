# Figma AI generation budget for one long film. Edit the numbers from the film's shot list, run: python3 tools/estimate.py
# Re-used assets (already in assets/) cost 0. Add ~15 % for retries (bad alignment, unwanted text in the image).
FILM = {
    'main characters (new)':      (3, 2),   # (count, generations each): 1 heads sheet + 1 body sheet
    'secondary pose sheets':      (3, 1),   # 2 characters x 2 poses per sheet
    'locations / camera set-ups': (14, 1),  # empty plates; 1 per distinct place or framing
    'establishing wides':         (3, 1),   # wide shots of a place with crowds drawn in
    'prop sheets':                (3, 1),   # 6 props per sheet
    'thumbnail':                  (1, 1),
}
total = 0
for k, (n, g) in FILM.items(): total += n * g; print(f'{k:30s} {n:3d} x {g} = {n * g:3d}')
retry = round(total * 0.15); print(f'{"retries (~15 %)":30s} {"":9s}{retry:3d}\nTOTAL ≈ {total + retry} Figma generations')
