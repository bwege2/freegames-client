# SuperTux 0.6.3: license and credits

**SuperTux** is by the **SuperTux Team** (originally Bill Kendrick, Ingo Ruhnke and Matthias Braun; the
0.6.x team includes Tobias Markus, Carsten Wirtz, Kai Alex Jockers, Daniel Ward, Semphris and many
others). The game is **GPL-3.0-or-later**; its data mixes the free licences listed below. This port
follows the release archive `SuperTux-v0.6.3-Source.tar.gz` (182,065,428 bytes, sha256
`f7940e6009c40226eb34ebab8ffb0e3a894892d891a07b35d0e5762dd41c79f6`), downloaded by
`re/supertux/fetch.sh` from <https://github.com/SuperTux/supertux/releases/tag/v0.6.3>. The archive
contains both the C++ source and the complete `data/` directory, so code and assets come from the same
pinned file.

The licences named below are the SPDX licences; the CC licences are at
<https://creativecommons.org/licenses/by-sa/4.0/> and <https://creativecommons.org/licenses/by/3.0/> (and
their 3.0 SA variant). The GPL texts are the website's `web/LICENSE.md` and the SuperTux archive's
`LICENSE.txt`.

Every asset below is copied **unchanged** from that archive by
`re/supertux/tools/build-assets.py` (the `.stl`/`.stwm` levels, `.sprite`/`.strf` definitions and
`.stf` fonts are parsed by the port at runtime; no artwork is redrawn). Nothing here is NC or ND.

## The game, its levels and its data

| Asset group | From | Author | License |
| --- | --- | --- | --- |
| Game code (C++ reference for the port) | `src/` | SuperTux Team | **GPL-3.0-or-later** |
| The port's TypeScript (engine, levels, UI, tests) | `web/games/supertux/src/` | the freegames project | **GPL-3.0-or-later**, the website's license (`web/LICENSE.md`) |
| Icy Island levels, 27 files (`assets/levels/world1/*.stl`) | `data/levels/world1/` | SuperTux Team; the file's own `(author ...)` field | **GPL-2.0-or-later / CC-BY-SA-3.0**, dual; this port uses them under GPL-2.0-or-later (which can be combined with the GPL-3.0-or-later code) |
| `between_glaciers.stl`, `crystal_mine.stl`, `castle_cutscene.stl` and the worldmap `worldmap.stwm` | `data/levels/world1/` | Carsten Wirtz | **CC-BY-SA-4.0 International**; CC-BY-SA-4.0 is one-way compatible with GPLv3, and these four files stay under CC-BY-SA-4.0 with attribution here |
| Tilemaps, tilesets (`images/tiles.strf`, `images/ice_world.strf`), sprites (`.sprite`), backgrounds, decals and particles under `assets/images/` | `data/images/` | SuperTux Team; see `data/AUTHORS` for the per-file credits | **GPL-3.0-or-later** as part of SuperTux's data (Debian's `debian/copyright` lists `Files: *` as GPL-3+, with the exceptions below) |
| Backgrounds by Jason Lavallée (`arcticskies/*`, `bluemountain/*`, `nightsky/*`, `arctic_bridge/*`, `forest/*`, `ice_cave/*`, `block_snow/*`, `cloud_mountains/*`) | `data/images/background/` | Jason Lavallée | dual **GPL-2.0-or-later / CC-BY-SA**; used here under GPL-2.0-or-later |
| `images/objects/explosion/explosion-*.png` | `data/images/objects/explosion/` | Bleed (remusprites), via OpenGameArt | **CC-BY-3.0**, attribution as in `data/AUTHORS`; used unchanged |
| Tux and the penguin artwork | `data/images/creatures/tux/`, `data/images/engine/`, `data/images/worldmap/` | SuperTux Team; Tux the penguin by **Larry Ewing** | GPL-3.0-or-later; the Tux mascot's own license permits use and modification with the copyright notice retained |
| `images/engine/icons/supertux-256x256.png` (also the favicon source) | `data/images/engine/icons/` | SuperTux Team | GPL-3.0-or-later (part of the data) |
| Bitmap fonts `fonts/white.stf`, `fonts/andale12.stf` and `images/engine/fonts/{white,shadow,andale12,andale12-shadow}.png` | `data/fonts/`, `data/images/engine/fonts/` | SuperTux Team | **GPL-3.0-or-later**. The TTF fonts in `data/fonts/` (Dekko, Nanum, Roboto, Varela, Noto, SuperTux-Medium) are **not used**: they are OFL/Apache-2.0, which are not GPL-compatible; the port draws its menus and HUD with the original's own bitmap fonts instead. |

## Music

All music in SuperTux is by **Marek "Wansti" Moeckel** and other contributors, licensed
**GPL-2.0-or-later** (some also CC-BY-SA; this port uses the GPL option). The tracks the port ships are
the ones the Icy Island levels and the worldmap name:

| Track | Author | License |
| --- | --- | --- |
| `antarctic/voc-daytime`, `voc-daytime2`, `voc-night`, `voc-dark`, `voc-boss`, `bossattack`, `arctic_breeze`, `arctic_cave`, `cave`, `salcon`, `chipdisko` | Marek Moeckel; `chipdisko` is "Mortimer's Chipdisko" by Lukas Nystrand (Mortimer Twang), `salcon` a remix with permission | GPL-2.0-or-later / CC-BY-SA; **GPL-2.0-or-later** used here |
| `antarctic/jewels` | cynicmusic/congusbongus (OpenGameArt) | CC-BY-3.0 / CC-BY-SA-3.0 / **GPL-3.0**; the GPL-3.0 option is used |
| `antarctic/airship_remix` | remaxim (OpenGameArt), explicit permission for CC-BY-SA and GPL-2.0+ | **GPL-2.0-or-later** |
| `castle/fortress`, `misc/intro` | Marek Moeckel | **GPL-2.0-or-later** |

The original `data/AUTHORS` has the complete list and the per-track notes (including additional
CC-BY-SA-4.0 tracks that this port does not ship).

## Sounds

The port ships the original `data/sounds/` sound files (78; the directory also has `normalize.sh`) except one. Per `data/AUTHORS`,
they are self-made by the SuperTux Team or contributed under GPL/CC0/CC-BY; Debian's copyright lists
the sound directory as GPL-3.0-or-later. The contributors named there include Wolfgang Becker, Matthias
Braun, Ricardo Cruz, Marianne Gagnon, Stephen Groundwater, Nathan McCoy, Marek Moeckel, Paulo Morfeo,
Christoph Sommer, Yaniel, Bastian Zapf, Daniel Alston, Mathilda Edmunds, `soundscalpel.com` and
`blastwavefx.com`; the few freesound files are CC0. All are free for commercial use and compatible
with GPL-3.0+ (dual-licensed ones are used under GPL).

**Excluded:** `sounds/splash.ogg`. It is CC-BY-SA-3.0 only, which is not compatible with GPL-3.0+; the
port uses the original's `sounds/splash.wav` (CC-BY, `soundscalpel.com`) for entering water instead.

## This port

The TypeScript engine, the level/asset readers, the menus, the co-op mode and the tests are an altered
version by the freegames project, released under **GPL-3.0-or-later**. The original game code is not
included in the port; `re/supertux/` only holds the fetch/build scripts, the oracle used to check the
physics, and the notes. The reference archive itself is never committed.

The port changes the original in these visible ways (also listed in `README.md`): the story cutscenes
are shortened, the worldmap is presented as a level map rather than the original's tile-by-tile
walking, local two-player co-op is added, and the save file is JSON in the account storage instead of
the original's binary savegame.

## Favicon

The favicon of the game's page (`web/icons/supertux.png`, 48×48, and `web/icons/supertux-180.png`,
180×180; drawn by `web/scripts/icons.py`) is SuperTux's own icon
(`data/images/engine/icons/supertux-256x256.png`, GPL-3.0-or-later, Tux by Larry Ewing), scaled on a
rounded ice-blue tile we drew.
