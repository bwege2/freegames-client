# Liquid War: license and credits

This port is made from **Liquid War 5.6.6** (2025-11-09), https://ufoot.org/liquidwar/ (source
`liquidwar-5.6.6.tar.gz`, data from the upstream Windows zip `LW5/data/lw.dat`; `re/liquidwar/fetch.sh`).

* The code (`src/` of the original: Christian Mauduit's game, `src/allegro` replaced by this port's own
  Allegro 4.4 emulation in `web/games/liquidwar/src/al/`) is translated to TypeScript
  (`web/games/liquidwar/src/lw/`; `README.md` lists every deviation).
* The data is the original's, unchanged: `assets/lw.dat` (the upstream release's datafile: maps, maptex,
  textures, musics, sounds, fonts) and `assets/custom/` (the custom maps, textures and music of the release).

The port, as a work, is distributed under the **GNU General Public License, version 3 or later** (the
website's license). The original's code is GPL-2.0-or-later, which allows that; one texture is GPL-3.0-or-later,
which requires it. **No file of the port is under a NonCommercial (NC) or NoDerivatives (ND) license.**

## How this was checked

The source tree's `COPYING` (GPL 2), its file headers (GPL 2 or later), `ChangeLog`, `doc/xml/*.xml` (the
user levels are asked to be put "under the terms of the GNU General Public License, or at least a compatible
license"), the data directories' own texts (`data/map/*.txt`, `data/texture/*.txt`, `data/music/*`), and the
Debian package's `debian/copyright` (`Files: *`, GPL-2+) were read (2026-11-14). Re-checked independently for this branch on 2026-11-15 (COPYING, `doc/xml/copying.xml`, `authors.xml`,
`userlevels.xml`, ChangeLog, the headers of `src/` and `utils/lwmapgen/`). Every file of `assets/` is
part of the shipped datafile or of the release's `custom/` directories.

## The code

| Files | License | Used? |
| --- | --- | --- |
| `src/` of Liquid War 5.6.6 (game core, menus, GUI, maptex, network), headers "GNU General Public License, version 2 or later" | **GPL-2.0-or-later** | translated to TypeScript (`src/lw/`) |
| the port's Allegro 4.4 emulation (`src/al/`), written for this port from the Allegro 4.4.3.1 API and its documented behaviour (Allegro is gift-ware, "distribute freely, modify freely") | **written for this port**, under the port's GPL-3.0-or-later | the game's platform |
| glibc's `random()` (`src/glibc.ts`, after glibc's `random_r`, LGPL-2.1-or-later) | **LGPL-2.1-or-later** | rewritten from the algorithm; its behaviour is what the tests compare |
| the network game's server side, `server/src/main/java/net/slop/freegames/games/liquidwar/LiquidwarModule.java` (after the original's `src/srvcont.c`, `srvchan.c`: team numbering, merged keys, checksum check) and the client's `src/lw/netplay.ts`, `network.ts`, `src/page/netplay.ts` (after `netplay.c`, `network.c`, `keyexch.c`) | **GPL-2.0-or-later** (translated) | under the port's GPL-3.0-or-later |
| `utils/lwmapgen/` of the source (David Redick, the random map generator the original runs as an external program): its headers say "Released under the GNU General Public License (v2)" without "or later", i.e. **GPL-2.0-only**, which cannot be combined with the GPL-3.0-or-later texture above | GPL-2.0-only | **not used**: "Random map" is not ported (README.md) |

## The data (`assets/`)

| Files | License | Used? |
| --- | --- | --- |
| `lw.dat`: the built-in maps (`data/map/`, `data/maptex/`), textures (`data/texture/*.gimp.pcx`, imported from the GIMP in 2000 for copyright reasons, `ChangeLog` 2000-06-19), musics (`data/music/*.mid`), sounds (`data/sfx/`), fonts (`data/font/`), water (`data/water/`), backgrounds (`data/back/`) | **GPL-2.0-or-later** (the package's license; the data has no separate notice, and Debian ships it under `Files: *`) | shipped unchanged |
| `custom/map/{meditate,pacman,paille,t4}.bmp` | **GPL** (shipped with the GPL'ed package; `doc/xml/userlevels.xml` asks every contributed level to be GPL or compatible) | shipped unchanged |
| `custom/texture/bluesq.bmp`, `rust.bmp`, `warning.bmp`, `clovers.bmp` | **GPL** (as the datafile's textures) | shipped unchanged |
| `custom/texture/meditate.bmp`: the FSF's "Levitating, Meditating, Flute-playing Gnu" (gnu.org/graphics/meditate.html; drawn by the Nevrax design team as far as recalled: gnu.org refused automated requests on 2026-11-15, so author and licence wording were not re-read that day) | **GPL-3.0-or-later** (or GFDL-1.1-or-later, as the FSF offers it) | shipped unchanged; it is what makes the port GPL-3.0-or-later |
| `custom/music/colossus.mid`, and the datafile's music: composed by Tim Chadburn (`ChangeLog`) | **GPL** (part of the GPL'ed package) | shipped unchanged |
| the WAV samples (`data/sfx/`) and the bitmap fonts (`data/font/`) | **GPL** (no ownership notice of their own; Debian's `Files: *`) | shipped unchanged |

The favicon is the original's window icon (`misc/liquidwar.ico`, GPL), drawn by `web/scripts/icons.py`
(`i_liquidwar`).

## Credits

Liquid War: Christian Mauduit and the Liquid War contributors, with maps and textures by the players who sent
them (the release's `doc/xml/userlevels.xml` names them). Music by Tim Chadburn. Allegro 4.4 by Shawn Hargreaves
and the Allegro contributors; this port's Allegro is its own emulation, not Allegro.
