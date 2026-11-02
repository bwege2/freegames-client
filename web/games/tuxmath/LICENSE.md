# Tux, of Math Command: license and credits

**Tux, of Math Command 2.0.3** (2011), by the Tux4Kids project, is free software under the GNU
General Public License, version 3 or (at your option) any later version. The game data is part of the
same package and under the same license, except the font and the three newer music tracks (see
below). The reference is `tuxmath_2.0.3.orig.tar.gz` (Debian's repack of the Tux4Kids release, with
fonts), sha256 `eec49c296d41df39a6474d94ba4e3334e4c16dc180d3ea4a6defc2debfc39887`
(`re/tuxmath/fetch.sh`).

```
Tux, of Math Command
Copyright 2000-2011 Tux4Kids and contributors.
Authors: Bill Kendrick, David Bruce, Tim Holy, Brendan Luchen, Akash Gangil,
         Sam Hart, Jesse Andrews, Wenyuan Guo, Boleslaw Kulbabinski and others.
Tuxmath is free software: you can redistribute it and/or modify it under the terms of the GNU
General Public License as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
```

* **Project:** Tux4Kids, <https://sourceforge.net/projects/tuxmath/>.
* **Images**: Sam Hart, Bill Kendrick, David Bruce, Tim Holy, Linnea Holy, Kendra Swanson, Larry
  Ewing (Tux), and public-domain NASA photographs for the space backgrounds; the full per-directory
  list is `doc/README_DATA_LICENSES` in the reference archive.
* **Sounds**: Sam Hart, Bill Kendrick and public-domain sources; `tuxi.ogg` by Emmett Plant (public
  domain). The three arcade tracks are CC BY-SA 3.0: "Rush" and "Gravity" by Serberis, "On the Edge
  of the Universe" by Synthaurion (Jamendo).
* **Font**: Andika (AndikaDesRevG.ttf) by SIL International, under the SIL Open Font License 1.1
  (`assets/fonts/OFL.txt`).

## This port

The TypeScript port in `src/`, the canvas menus and the tools in `re/tuxmath/` are by the freegames
project and are licensed **GPL-3.0-or-later**, the same terms as the original. The website and game
SDK are GPL-3.0-or-later with an additional permission under section 7 (`web/LICENSE.md`). The port
is altered source, not the original program.

The data in `assets/` is the original's, copied unchanged:

* `images/`: the original PNG/JPEG art (including the menu background and the Tux frames used).
* `sounds/`: the original WAV effects, `tuxi.ogg` and the three CC BY-SA 3.0 music tracks.
* `fonts/AndikaDesRevG.ttf`: the original font, with `OFL.txt` from the original's `doc/OFL`.
* `missions/`: the original lesson and mission files (`arcade/`, `lessons/`, `campaign/`, `demo/`,
  `multiplay/`, `options/`); only the arcade and lesson files are used by this port.
* `menus/`: the original menu XML, kept as data for reference (the port draws its own menus).

The GNU GPL version 3 is served as `public/licenses/GPL-3.0.txt` on this site and comes with the
reference archive's `COPYING`/`doc/COPYING_GPL3`.

## Favicon

The favicon of the game's page (`web/icons/tuxmath.png`, 48x48, and `web/icons/tuxmath-180.png`, 180x180; drawn by `web/scripts/icons.py`) is the game's own icon, Tux with a sum: `data/images/icons/icon.png` at 48 px and `data/images/icons/tuxmath.svg` at 180 px (GPL-3.0-or-later, above), on a blue rounded square.
