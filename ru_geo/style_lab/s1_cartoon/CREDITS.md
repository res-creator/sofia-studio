# s1_cartoon — credits

- Coastlines: Natural Earth 1:50m (public domain) via the `world-atlas@2.0.2` package (countries-50m.json, ISC licence), cdn.jsdelivr.net.
- Code libraries: d3-geo 3.1.0, d3-array 3.2.4 (ISC), topojson-client 3.1.0 (ISC).
- Fonts: Unbounded (SIL OFL 1.1), Golos Text (SIL OFL 1.1), from @fontsource on cdn.jsdelivr.net.
- Everything else (illustration, textures, clouds, icebergs, animation, sound design) is our own code: scene.html, render.js, sound.py.
- Maths: Greenland is moved over the sphere (rotation of its real outline so its centroid travels along a great circle), then
  re-projected in Mercator every frame, so its shrink is the true Mercator scale change. The 14 copies are the same true-size
  outline placed at 14 points inside Africa (greedy packing). Areas from the data: Greenland 2.155 M km², Africa 29.99 M km²
  (ratio 13.9); on screen: 2,17 / 30,4 млн км² (reference values).
