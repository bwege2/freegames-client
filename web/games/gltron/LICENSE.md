# GLtron: license and credits

**GLtron 0.70final** (2003), by **Andreas Umbach** and contributors, is free software under the
GNU General Public License, version 2 or (at your option) any later version. The game data (models,
textures, sounds, music) is part of the same package and under the same license, except where the
original credits say otherwise. The reference is `gltron_0.70final.orig.tar.gz` from Debian's pool,
sha256 `e0c8ebb41a18a1f8d7302a9c2cb466f5b1dd63e9a9966c769075e6b6bdad8bb0`
(`re/gltron/fetch.sh`).

```
GLtron, a 3d lightcycle game using OpenGL
Copyright (C) 1999-2003 Andreas Umbach <marvin@dataway.ch>
GLtron is free software; you can redistribute it and/or modify it under the terms of the GNU
General Public License as published by the Free Software Foundation; either version 2 of the
License, or (at your option) any later version.
```

* **Game and code**: Andreas Umbach; the original `ChangeLog`/`README` name further contributors.
* **Models**: the lightcycle and recognizer OBJ models in `data/`, part of GLtron.
* **Art pack `default`**: the original `art/default` textures (floor, walls, trails, impact,
  skybox, logo, bitmap fonts).
* **Soundtrack**: “Revenge of Cats” by **Peter Hajba (Skaven)**, as credited in the original
  `README`; it is distributed with GLtron under the same GPL terms. The port renders the module to
  OGG; the `.it` stays in the reference download.
* **Sounds**: the original `data/game_engine`, `game_crash` and `game_recognizer` samples.

## This port

The TypeScript port in `src/` (simulation, AI, menu, three.js renderer) and the tools in
`re/gltron/` are by the freegames project and are licensed **GPL-2.0-or-later**, the same terms as
the original. The website and game SDK are GPL-3.0-or-later with an additional permission under
section 7 to combine them with GPL-2.0-only ports (`web/LICENSE.md`; the original here is
GPL-2.0-or-later, so no exception is needed). The port is altered source, not the original program.

The data in `assets/` is the original's, with the music converted:

* `art/*.png`: the original `art/default` textures, unchanged.
* `data/*.obj`, `*.mtl`, `*.ftx`, `fonts.txt`, `*.ogg`, `*.wav`: the original data, unchanged.
* `music/revenge-of-cats.ogg`: the original Impulse Tracker module rendered to OGG with ffmpeg (a
  lossy conversion; the `.it` module stays in the reference archive).

The GNU GPL version 2 is served as `public/licenses/GPL-2.0.txt` on this site and comes with the
reference archive's `COPYING`.

## Favicon

The favicon of the game's page (`web/icons/gltron.png`, 48x48, and `web/icons/gltron-180.png`, 180x180; drawn by `web/scripts/icons.py`) is the freegames project's own drawing and uses no art of the game: two glowing light-cycle trails on a grid. It is under the website's license (GPL-3.0-or-later, `web/LICENSE.md`).
