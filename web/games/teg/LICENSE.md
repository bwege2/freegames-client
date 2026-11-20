# Tenés Empanadas Graciela: license and credits

This folder is a browser port of **Tenés Empanadas Graciela (TEG) 0.13.0**, the last release of the
GTK client/server game (15 September 2024, tag `0.13.0`, commit
`41b51cb5ea6655f68ee12ec0518757870f35b672`). `re/teg/fetch.sh` downloads it from
`https://github.com/wfx/teg/archive/refs/tags/0.13.0.tar.gz` and pins it by
SHA-256 `d643e0b1b4ebe4baaceb398435517c57a67d7aaaa25dc49880d5f50750b089fc` (12,832,517 bytes).
The archive itself is never committed (`re/*/orig/` is ignored).

## The original: code

TEG was started in 1996 by Ricardo Quesada; the 0.13.0 package's source files carry
`Copyright (C) 2000–2024 Ricardo Quesada` and the contributors listed in its `PEOPLE` file.
The package is **GNU General Public License, version 2 only**:

* `COPYING` is the text of GPL version 2 (June 1991), not version 3;
* 121 of its C/C++ source files say, word for word, “you can redistribute it and/or modify it under
  the terms of the GNU General Public License as published by the Free Software Foundation; **only
  version 2 of the License**” (for example `client/main.cpp`, `common/common.cpp`, `server/play.cpp`,
  `robot/ai.cpp`);
* 13 newer helper/test files are `SPDX-License-Identifier: GPL-2.0-or-later`
  (`*_check.cpp`, `common/parser_private.h`, …);
* Debian's `debian/copyright` for `teg 0.13.0-1` records the same “only version 2 of the License”;
  GitHub's licence metadata says GPL-2.0.

The upstream `README.md` says “GNU General Public License v3 – see LICENSE”, but there is no `LICENSE`
file in the package and every source header and `COPYING` contradict it. The package as shipped is
therefore treated as **GPL-2.0-only**. No file is under a NonCommercial or NoDerivatives licence, and
no file is proprietary.

The freegames website and game SDK are GPL-3.0-or-later. `web/LICENSE.md` has an additional permission
under GPL-3.0 section 7 that expressly allows combining them with a game port licensed under “the GNU
General Public License version 2 only”, naming NetHack and Frozen Bubble, and conveying the combined
work under the port's licence. This port uses that permission, exactly as Frozen Bubble does. The port
itself is **GPL-2.0-only**; the website and SDK stay GPL-3.0-or-later.

## The original: artwork, texts, sounds

The 0.13.0 package contains no sound or music files, and no font files: the GTK client uses the
system's Pango fonts and has no audio code. All data this port uses is from the package itself; none
of it carries a separate licence, so it is distributed under the package's GPL-2.0-only terms. The
theme XML names its author and the `PEOPLE` file names Wolfgang Morawetz as the project's main artist.

| Group | Files used by the port | Source in TEG 0.13.0 | Author / licence |
| --- | --- | --- | --- |
| Board | `assets/theme/board.jpg` (640×382) | `client/themes/m2/board.jpg` | Wolfgang Morawetz (`teg_theme.xml`), GPL-2.0-only |
| 50 country overlays | `assets/theme/Africa-*.png`, `America-*.png`, `Australia-*.png`, `Europe-*.png`, `Asia-*.png`, `Southamerica-*.png` (the original files have no extension; their bytes are unchanged) | `client/themes/m2/` | Wolfgang Morawetz, GPL-2.0-only |
| Country cards | `assets/theme/tar_cannon.png`, `tar_horse.png`, `tar_infantry.png`, `tar_jocker.png` | `client/themes/m2/` | Wolfgang Morawetz, GPL-2.0-only |
| Dice | `assets/theme/dice-1.png` … `dice-6.png` | `client/themes/m2/` | Wolfgang Morawetz, GPL-2.0-only |
| Toolbar bar | `assets/theme/infobar.png` | `client/themes/m2/infobar.png` | Wolfgang Morawetz, GPL-2.0-only |
| Empanada logo (also the favicon source) | `assets/icon.png` | `client/teg_pix/teg_icono.png` | TEG artwork, GPL-2.0-only |
| Mission card | `assets/pix/objetivo.png` | `client/teg_pix/objetivo.png` | TEG artwork (Ricardo Quesada / Wolfgang Morawetz), GPL-2.0-only |
| Player colour pictures | `assets/pix/color_player_{red,yellow,blue,black,pink,green}.png` | `client/teg_pix/` | TEG artwork, GPL-2.0-only |
| Army discs | `assets/pix/disc_{red,yellow,blue,black,pink,green,grey,over}.png` | `client/teg_pix/` | TEG artwork, GPL-2.0-only |
| Theme layout | `assets/theme/theme.json` (generated from `client/themes/m2/teg_theme.xml`) | `client/themes/m2/teg_theme.xml` | Wolfgang Morawetz, GPL-2.0-only |
| Texts | country, continent and mission names; server/client messages; the English gettext strings | `common/country.cpp`, `common/cont.cpp`, `common/missions.cpp`, `common/protocol.h`, `client/`, `server/`, `robot/` | Ricardo Quesada and contributors, GPL-2.0-only |
| Rules data | the 50×50 adjacency matrix (`src/rules/data.ts`) | `common/limitrof.h` | Ricardo Quesada, GPL-2.0-only |

The **map is the world map of the TEG program**, not the Argentina board of the tabletop game
`Plan Táctico y Estratégico de la Guerra`: the software ships six themes (m2, m3, sentimental,
teg_classic, modern and draco), all with the same 50 countries of a Risk-like world. The default
theme (`m2`, the one installed unless the user chooses another) is the one this port uses, with its
own positions, so the map, continents and country names are exactly the program's.

The original's `client/themes/draco` (a Middle-earth map), `sentimental`, `m3`, `teg_classic` and
`modern` themes are **not used**. `client/gui-gnome/stock/*.svg` (toolbar symbols), `robot.xpm`,
`docs/gnome-help` (screenshots), the top-level screenshots, the `.po` translations and the XPMs are
**not used** either; they are not part of this port and their absence does not limit it. No asset of
the port is NC or ND, and no asset comes from a third party with a different licence: TEG 0.13.0 has
no such files in the groups above.

## This port

`src/` and `test/` are a TypeScript translation of the original's game rules, the robot's strategy
(`re/teg/NOTES.md` names the C++ files and functions), and a new browser user interface.
`protocol/games/teg.capnp`, `src/proto/`, the online UI in `src/ui/app.ts`, and
`server/src/main/java/net/slop/freegames/games/teg/` (the authoritative online game) are new in this
port. The port is an altered version, not the original program, and is under the **GNU General Public
License, version 2 only**, the same terms as the original; the full text is
<https://www.gnu.org/licenses/old-licenses/gpl-2.0.html>. The Java server module, though it lives in
the (not distributed) game server, is under the same licence.

The port's own UI text and the generated `theme.json` are by the freegames project and under the
same GPL-2.0-only terms. The site's shell around the game (menu bar, Back button, lobby) is the
website's GPL-3.0-or-later code, combined under the section 7 permission described above.

## Credits

* **Tenés Empanadas Graciela**: idea Sebastián Cativa Tolosa; design and implementation Ricardo
  Quesada; main artist Wolfgang Morawetz; 0.12/0.13 maintenance and C++ refactoring Rüdiger
  Ranft-Driscoll and Wolfgang Morawetz; GTK3 port Eric Romanenghi; translators and testers as listed
  in the package's `PEOPLE`. The package is dedicated to the empanada.
* **This port**: freegames project, 2026. The rules engine was checked against the original's server
  and robot (`re/teg/NOTES.md`, `test/`).

## Favicon

`web/icons/teg.png` (48×48) and `web/icons/teg-180.png` (180×180) are drawn by
`web/scripts/icons.py` (`i_teg`) from the original's empanada logo,
`client/teg_pix/teg_icono.png` (GPL-2.0-only, above), on a warm tile of the port's own colours. The
logo is copied unchanged to `web/games/teg/assets/icon.png`; the site's icon generator only scales
it. They are under the game's GPL-2.0-only licence; the tile drawing is the freegames project's.
