# Bomberslop: license and credits

**Bomberslop is 100% made by AI** (Claude, an AI by Anthropic, working for the freegames project): all of its code
and every picture. Its base, the rules, and its sound effects come from **ClanBomber 2**:

* **ClanBomber 2.2.0** (2020-02-09), <https://www.nongnu.org/clanbomber/>, project page
  <https://savannah.nongnu.org/projects/clanbomber/>, source `clanbomber-2.2.0.tar.xz` (sha256
  `e598eb0405939bb61549d3a50bc73583ef05d45b8a1f2077160ba0592f51dff8`, from
  <https://download.savannah.nongnu.org/releases/clanbomber/>; `re/bomberslop/fetch.sh` downloads it). Its entry in
  the Open Source Game Index: <https://foss-gameindex.github.io/opensourcegameindex/games/clanbomber/index.html>.
* Code: Copyright (C) 1999-2004, 2007 Andreas Hundt, Denis Oliver Kropp; Copyright (C) 2008-2011, 2017 Rene Lopez;
  and the other ClanBomber authors (`AUTHORS`: code by Andreas Hundt, Denis Oliver Kropp, Rene Lopez, mass). Licensed
  under the **GNU General Public License, version 3 or (at your option) any later version** (`COPYING`; "License is
  now GPLv3+", `NEWS` of 2.2.0).
* Sound effects (`src/wavs`): by Andreas Hundt and Denis Oliver Kropp (1999), every file under the GPL, version 3
  or later (`src/wavs/README`, kept here as `assets/sounds/README-ClanBomber.txt`).

## What is from where

| Part | Made by | License |
| --- | --- | --- |
| `src/sim.ts`, `src/rand.ts`: the rules | a port of ClanBomber 2.2.0's code (GameObject, Bomber, Bomb, Explosion, Extra*, Disease*, MapTile*, Map, MapEntry, Bomber_Corpse, Corpse_Part, Observer, the local game of ClanBomber.cpp) into TypeScript, by AI; glibc's `rand()` algorithm (random_r.c) as the original gets it on Linux | GPL-3.0-or-later, as the original. Altered source: it is not the original program. |
| `src/` (the rest: menus, drawing, sound, online, computer players), `test/` | AI | GPL-3.0-or-later |
| `assets/sounds/*.wav` | ClanBomber 2.2.0's `src/wavs`, unchanged: break, clear, corpse_explode, crunch, deepfall, die, explode, horny, hurry_up, joint, klatsch, putbomb, schnief, splash1a, splash2a, time_over, whoosh, wow (Copyright (C) 1999 Andreas Hundt and/or Denis Oliver Kropp, per file in `README-ClanBomber.txt`) | GPL-3.0-or-later |
| `art/bomberslop.px.js` (the pictures' source), `assets/sprites.png`, `assets/sprites.json` | AI, drawn as code for pxl; nothing of ClanBomber's pictures | GPL-3.0-or-later |
| `maps/*.map` (Canteen, Conveyor, Drain, Fridge, Grease_Trap, Pantry) | AI, in the original's map format; none of the original's maps | GPL-3.0-or-later |
| `protocol/games/bomberslop.capnp`, the server module | AI | GPL-3.0-or-later (the module is part of the game server, which is not published) |

The website and game SDK are GPL-3.0-or-later with an additional permission under section 7 (`web/LICENSE.md`).

### The pictures and pxl

The pictures were drawn with **pxl** (<https://github.com/augusto-scarvalho/claude-pxl>, a fork of
<https://github.com/crsolver/claude-pxl>), a pixel-art tool and DSL made for AI agents: MIT license, Copyright (c)
2026 crsolver. pxl is used as a tool only: `art/build.sh` downloads it at commit
`2cbadb1329fa6a0449a09685e2a853c3c9dc24d2` into a cache folder and renders `art/bomberslop.px.js` with it; none of
pxl's files, library art or examples are in this repository or in the pictures. What it renders from our source is
ours.

## Favicon

The favicon of the game's page (`web/icons/bomberslop.png`, 48x48, and `web/icons/bomberslop-180.png`, 180x180;
drawn by `web/scripts/icons.py`) is Gloop, the green blob of `assets/sprites.png` (ours, above), scaled by whole
numbers on a tile in the canteen floor's colours.

## The full license texts

GNU General Public License, version 3: <https://www.gnu.org/licenses/gpl-3.0.html> (also `COPYING` in the ClanBomber
2.2.0 source and on this site's "Licenses & source" page).
