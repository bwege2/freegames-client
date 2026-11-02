# Sopwith: license and credits

**Sopwith** was written by **David L. Clark** at BMB Compuscience in 1984; the source was released
under the GNU General Public License. The reference for this port is **SDL Sopwith 2.9.0** by Simon
Howard and contributors, GPL-2.0-or-later, tarball
`sopwith_2.9.0.orig.tar.gz`, sha256
`93550d0cfddbdf19ef05c54e0b455999ba63da87f66d0cc371c89612ac04a0bb` (`re/sopwith/fetch.sh`).

```
Sopwith
Copyright (C) 1984, 1985, 1987 BMB Compuscience
Copyright (C) 1984-2000 David L. Clark
Copyright (C) 2001-2024 Simon Howard, Jesse Smith
This program is free software; you can redistribute it and/or modify it under the terms of the
GNU General Public License as published by the Free Software Foundation; either version 2 of the
License, or (at your option) any later version.
```

* **Game, sprites, level and PC-speaker sounds**: David L. Clark / BMB Compuscience; later C and SDL
  work by Simon Howard, Jesse Smith and the SDL Sopwith contributors.
* **Font**: the 8×8 bitmap in `src/font.h` is from SDL_gfxPrimitives 1.4 by A. Schiffler,
  LGPL-2.1-or-later; its notice is reproduced in the original header.

## This port

The TypeScript port in `src/`, the asset extractor in `re/sopwith/tools/` and the app/menu are by
the freegames project and are licensed **GPL-2.0-or-later**, the same terms as the original. The
website and game SDK are GPL-3.0-or-later with an additional permission under section 7; the
original here is GPL-2.0-or-later, so no exception is needed (`web/LICENSE.md`). The port is altered
source, not the original program.

The data in `assets/` is the original's: the `.sop` maps copied unchanged and the window icon. The
sprites and font are generated from the original C arrays by `re/sopwith/tools/build-assets.py`;
there are no image or audio assets in the original game.

The GNU GPL version 2 is served as `public/licenses/GPL-2.0.txt` on this site.
