# Figma AI generation budget — How LEGO Almost Destroyed Itself (see production_plan.md §3).
# Re-used assets (already in assets/) cost 0. Add ~15 % for retries (bad alignment, unwanted text in the image).
FILM = {
    'main characters (new)':      (4, 2),   # (count, generations each): 1 heads sheet + 1 body sheet
    'secondary pose sheets':      (5, 1),   # 2 characters x 2 poses per sheet
    'locations / camera set-ups': (17, 1),  # empty plates; 1 per distinct place or framing
    'establishing wides':         (0, 1),   # wide shots of a place with crowds drawn in
    'prop sheets':                (4, 1),   # 6 props per sheet
    'thumbnail':                  (1, 1),
}
total = 0
for k, (n, g) in FILM.items(): total += n * g; print(f'{k:30s} {n:3d} x {g} = {n * g:3d}')
retry = round(total * 0.15); print(f'{"retries (~15 %)":30s} {"":9s}{retry:3d}\nTOTAL ≈ {total + retry} Figma generations')
