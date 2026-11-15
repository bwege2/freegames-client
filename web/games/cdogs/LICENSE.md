# C-Dogs: license and credits

This port is made from **C-Dogs SDL 2.5.0** (2026-10-16), https://github.com/cxong/cdogs-sdl (tag `2.5.0`,
`re/cdogs/fetch.sh`), the maintained SDL version of Ronny Wester's C-Dogs (1997–2002), ported to SDL by
Jeremy Chin and Lucas Martin-King and developed since by Cong Xu and contributors.

* The game's code is translated to TypeScript in `src/` (altered: a port; `README.md` lists every deviation).
* The data in `assets/` is the original's, unchanged (PNG pictures, OGG/WAV/MP3 sounds, OGG music, the JSON
  data files and campaigns), copied by `re/cdogs/tools/assets.sh` from the release tree. Only the files listed
  as shipped below are copied.

The whole port, as a work, is distributed under the **GNU General Public License, version 3 or later**
(the website's license), which the original's code licenses allow (GPL-2.0-or-later, BSD-2-Clause, zlib,
WTFPL). The data keeps its own licenses (CC0, CC BY 3.0/4.0, CC BY-SA 3.0/4.0, OGA-BY 3.0); every one of
them allows redistribution and changes for any purpose, commercial included. **No asset of the port is under
a NonCommercial (NC) or NoDerivatives (ND) license.**

## How this was checked

Every file of the release tree outside `src/` was looked at (2026-11-14), package by package: the repository's
`README.md` ("License"), `COPYING`, `doc/README_DATA.md`, `doc/CREDITS`, `doc/AUTHORS`, `graphics/LICENSE.md`,
`graphics/originals.txt`, every `license.txt`, `LICENSE.txt`, `LICENSE.md`, `licenses.txt`, `src.txt`,
`README*` in the data trees, and the attribution file (`<name>.txt`) next to every sound, song and picture
that has one; each campaign's `campaign.json` (title, author). `re/cdogs/tools/credits.py` collects all
attribution files of the shipped trees (296 files) and checks that each names a free license; a search of the
data trees for "by-nc", "by-nd", "noncommercial" and "noderiv" finds nothing but Ronny Wester's
correspondence in `doc/README_DATA.md` (where he first considered CC BY-NC and then chose CC BY). The code was
checked file by file by its header (`src/`).

## The code

| Files | License | Used? |
| --- | --- | --- |
| `src/` (the game: `src/*.c`, `src/cdogs/*.c`, `src/cdogs/draw`, `src/cdogs/hud`, `src/cdogs/collision/collision.c`; headers "Copyright (C) 1995 Ronny Wester, (C) 2003 Jeremy Chin, (C) 2003-2007 Lucas Martin-King, (C) 2013-… Cong Xu", "either version 2 of the License, or (at your option) any later version"; `COPYING`, `doc/COPYING.GPL`) | **GPL-2.0-or-later** | translated to TypeScript |
| the files of Cong Xu that say so in their header ("Redistribution and use in source and binary forms … are permitted", `doc/COPYING.BSD`), e.g. `actor_fire.c`, `ai_coop.c`, `map_cave.c`, `collision/minkowski_hex.c`, `draw/*.c`, `hud/*.c`, `pic_manager.c`, `weapon_class.c` | **BSD-2-Clause** | translated to TypeScript; the notice is kept below |
| `src/cdogs/AStar.c` (Sean Heber 2012, Cong Xu 2013) | **BSD-3-Clause** | translated to TypeScript; the notice is kept below |
| `src/cdogs/mathc/` (Felipe Ferreira da Silva) | **zlib** | the vector functions the game uses are translated |
| `src/cdogs/aheasing/` (Auerhaus Development) | **WTFPL 2** | the easing functions the game uses are translated |
| `src/cdogs/c_hashmap`, `yajl`, `json`, `stb`, `tinydir`, `rlutil`, `nuklear`, `XGetopt.c`, `SDL_JoystickButtonNames` | BSD / MIT / ISC / zlib / WTFPL / public domain | not used: the browser has maps, JSON, PNG decoding and the Gamepad API |
| `src/cdogs/enet/` (MIT), `src/proto/` (nanopb, zlib; the network messages) | MIT / zlib | not used: online play goes through this site's server (`README.md`) |
| `src/cdogs/cwolfmap/` (Wolfenstein 3D / Doom data readers; `fmopl.c` under `doc/license-mame.txt`) | BSD-2-Clause / MAME license | not used: it only reads data of Wolfenstein 3D and Doom that the player has to own; the port does not include those games |
| `src/cdogsed/` (the campaign editor) | GPL-2.0-or-later / BSD-2-Clause | not ported (`README.md`) |

## The data, package by package

| Package (paths in the release tree) | Author(s) and source | License | Shipped? |
| --- | --- | --- | --- |
| Original C-Dogs graphics: every file and folder listed in `graphics/originals.txt` (barrels, boxes, furniture, trees, the character body/death sprites, the 21 original heads, knife and blaster sprites, the original door, exit, key, tile and wall sets, blood and spark particles, `logo.png`, …) and the hats/hair/glasses listed in `graphics/chars/license.txt` as extracted from or derived from them | Ronny Wester; relicensed by him on 2016-04-13 (`doc/README_DATA.md`) | **CC BY 3.0** | yes |
| All other pictures in `graphics/` without an attribution file of their own (Cong Xu's new art: the HUD, new heads, bodies rendered from his Blender files, new doors/keys/tiles/walls, `font.png` with `font.json`) | Cong Xu (`graphics/LICENSE.md`: "Unless otherwise specified, all artwork is licensed CC0") | **CC0 1.0** | yes |
| Pictures in `graphics/` with an attribution file (`<name>.txt`, `src.txt`, a folder's `LICENSE.txt`/`license.txt`): third-party art from OpenGameArt.org adapted by Cong Xu (AngryMeteor.com, OceansDream, Buch, jestan, Redshrike, Daniel Cook, Lanea Zimmerman, Zush Design, Wind astella, Spiney, Sharm, JROB774, Master484, Tatermand, GrafxKid, Skorpio, …) | as named in each file (list below) | **CC0**, **CC BY 3.0/4.0**, **CC BY-SA 3.0/4.0**, **OGA-BY 3.0**; files offered under several licenses (some also GPL-2.0/3.0) are used under CC BY / CC BY-SA | yes |
| `graphics/editor/` (the editor's icons) | Cong Xu | CC0 1.0 | no (no editor) |
| `graphics/cdogs_icon.bmp` | Cong Xu, from Ronny Wester's art | CC BY 3.0 | no; the favicon (below) is drawn from `graphics/logo.png`'s colours only |
| Sound effects `sounds/` (every `.ogg`/`.wav`/`.mp3`, the folders `bang`, `boom`, `chars/alert/*`, `chars/die/*`, `explosion`, `footsteps/*`, `hits/*`, `ricochet`, `slide`): recorded or adapted from freesound.org and OpenGameArt.org | as named in each attribution file (list below); `menu_*.ogg` from `menu.txt`, `map_open/close.ogg` from `map_open_close.txt` | **CC0**, **CC BY 3.0/4.0** | yes. The original C-Dogs sound effects (which Ronny Wester said he had sampled from films, `doc/README_DATA.md`) are **not** in 2.5.0: all of its sounds are these free replacements |
| Music `music/menu`, `music/briefing`, `music/game`, `music/victory`, `music/lose`, `music/end` (12 OGG songs) | as named in each `<song>.txt` (list below): Battle_2, Metamorphosis ver. 2 (VocalMix), space_0, A Really Tense Moment, Futuristic junk, red_doors2, Space Dimensions 8bit, low-fi, Party Sector, CrashedShip, Epic Fall, The 9th Circle | **CC0**, **CC BY 3.0/4.0**, **OGA-BY 3.0** | yes (loaded while playing) |
| `data/guns.json`, `bullets.json`, `ammo.json`, `pickups.json`, `particles.json`, `map_objects.json`, `character_classes.json`, `prefixes.txt`, `suffixes.txt`, `suffixnames.txt` (the game's rules: weapons, bullets, ammo, pickups, particles, map objects, character classes; the name generator's word lists) | Cong Xu and contributors (gun descriptions by Wuzzy, `doc/CREDITS`) | CC0 1.0 (`README.md`: "New data is licensed as CC0 if not specified") | yes |
| `data/gamecontrollerdb.txt`, `gamecontrollerbuttondb.txt` (SDL controller mappings) | SDL_GameControllerDB contributors | zlib | no: the browser's Gamepad API maps controllers itself |
| `data/.wolf3d/` (C-Dogs pictures and sounds for playing Wolfenstein 3D / Spear of Destiny / Super 3-D Noah's Ark maps) | Cong Xu and third parties | CC0 / CC BY | no: only used together with those games' own data |
| Campaigns by Ronny Wester: `missions/ogre.cdogscpn` (Ogre Rampage), `bem.cdogscpn` (Bug-Eyed Monsters), `zombie.cdogscpn` (Chambers of the deceased), `terror.cdogscpn` (The Brotherhood of Anarchy and Death), `distress.cdogscpn` (Distress call from scientific outpost), and the dogfights `dogfights/cubicle.cdogscpn` (Cubicle wars), `dogfights/dungeon.cdogscpn` (Dogfight in the dungeon) | Ronny Wester (author field of each `campaign.json`; `doc/README_DATA.md`) | **CC BY 3.0** | yes |
| `missions/cyberdogs.cdogscpn` (Cyberdogs) | Ronny Wester & Cong Xu; `graphics/LICENSE.txt` ("Images extracted from Cyberdogs", CC BY 3.0), `graphics/chars/guns/chaingun.txt` (AngryMeteor.com, CC BY 3.0), `sounds/1up.txt` (phoenix1291, CC0) | **CC BY 3.0** / CC0 | yes |
| Campaigns by Sauer2: `missions/ai_insurgency.cdogscpn`, `antares3consp.cdogscpn`, `devhell.cdogscpn`, `harmful_crysalis.cdogscpn`, `most_classified_enemy.cdogscpn`, `spacepirates.cdogscpn`, and the dogfight `dogfights/spells_n_spikes.cdogscpn` | Sauer2; each folder's `LICENSE.md` | **CC0 1.0**; their adapted pictures and sounds as named in their own `.txt` (CC0 / CC BY 3.0/4.0) | yes |
| `missions/ai_insurgency_2.cdogscpn` (AI Insurgency II) and `dogfights/temple_of_carnage.cdogscpn` (Temple of Carnage) | Sauer2; no license file of their own, so the repository's default (`README.md`: "New data is licensed as CC0 if not specified"); their adapted pictures as named in their `.txt` (Janna CC0, AngryMeteor.com CC BY 3.0, Jordan Irwin CC BY 3.0) | **CC0 1.0** / CC BY 3.0 | yes |
| `missions/graveintent.cdogscpn` (Grave Intent) | clovehoof; its `LICENSE.md` | **CC0 1.0** | yes |
| `missions/Sand.cdogscpn` (Sand) | Cong Xu (CC0 default); its third-party pictures and sounds as named in their `.txt` (ZigWin CC BY-SA 3.0, Nem_ CC BY-SA 3.0, AngryMeteor.com, Clint Bellanger CC BY 3.0, Master484, gprosser, humanoide7000, maurosama, Mixedupmoviestuff CC0, morganpurkis CC BY 3.0) | **CC0** / CC BY 3.0 / CC BY-SA 3.0 | yes |
| The songs `missions/devhell1.xm`, `missions/devhell2.ogg`, `missions/graveintent1.xm` (named by the Development Hell and Grave Intent missions) | not stated anywhere | **unknown** | **no**: those missions play the game's own music instead (`README.md`) |
| `missions/WOLF3D/` (Wolfenstein 3D shareware episode 1, id Software / Apogee, `VENDOR.DOC`) | id Software, Apogee | proprietary shareware licence: no modification, no bundling without written permission | **no** (not free) |
| `missions/doom.cdogscpn`, `dogfights/doom_e1m1.cdogscpn`, `dogfights/dwango5_map01.cdogscpn`, `dogfights/map07.cdogscpn`, `dogfights/de_dust.cdogscpn` (recreations of levels of Doom, Doom II, Dwango 5 and Counter-Strike) | Cong Xu; the pictures and sounds in them are free (their `.txt` / `licenses.txt`), but the level designs and names are taken from those commercial games, whose rights holders never licensed them | level designs: **not licensed** | **no** |
| `missions/custom/techdemo/*` (developer test campaigns: Fun with Guns, Sound Test, Spawner Test, …) and `missions/custom/Wuzzy/gungame.cdogscpn` (Gun Game) | Cong Xu; Wuzzy | CC0 default, but several of their sounds (`funwithguns`' `.wav` files, all of Gun Game's sounds) have no attribution or license statement | **no** |
| `doc/CREDITS` (the credits the main menu shows, `credits.c`) | Cong Xu and contributors | GPL-2.0-or-later (with the code) | yes |
| `doc/original_readme.txt` (C-Dogs 1.x's manual) | Ronny Wester | CC BY 3.0 (with the data) | no; the port's `README.md` describes the game |

Everything shipped may be redistributed and changed for any purpose: CC0 needs nothing, CC BY / OGA-BY need
the credit given here (author, title, source, license, and that files were adapted), CC BY-SA additionally
keeps the license for adapted files (the port does not change any of them).

## Notices of the translated code

C-Dogs SDL, GPL-2.0-or-later parts:

```
C-Dogs SDL
A port of the legendary (and fun) action/arcade cdogs.
Copyright (C) 1995 Ronny Wester
Copyright (C) 2003 Jeremy Chin
Copyright (C) 2003-2007 Lucas Martin-King
Copyright (c) 2013-2026 Cong Xu

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.
```

C-Dogs SDL, BSD-2-Clause parts:

```
Copyright (c) 2013-2026 Cong Xu
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation
and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
```

`AStar.c` (BSD-3-Clause): "Copyright (c) 2012, Sean Heber. All rights reserved. Copyright (c) 2013, Cong Xu.
All rights reserved." with the same conditions as above plus: "Neither the name of Sean Heber nor the names
of its contributors may be used to endorse or promote products derived from this software without specific
prior written permission."

`mathc` (zlib): "Copyright (C) 2016 Felipe Ferreira da Silva. This software is provided 'as-is', without any
express or implied warranty. … Altered source versions must be plainly marked as such, and must not be
misrepresented as being the original software." (the TypeScript translation is such an altered version).

`aheasing/easing.c`: "Copyright (c) 2011, Auerhaus Development, LLC. This program is free software. It comes
without any warranty, to the extent permitted by applicable law. You can redistribute it and/or modify it
under the terms of the Do What The Fuck You Want To Public License, Version 2, as published by Sam Hocevar."

## Credits of the original

From `doc/CREDITS` and `doc/AUTHORS`: Ronny Wester (design, code and the original graphics), Jeremy Chin and
Lucas Martin-King (the SDL port), Cong Xu (C-Dogs SDL, new features and art), Zombie (Campaign Dogs), Tobias
Johansson, Clemens Hackenberg, David Knight, Justin Jacobs, Wuzzy (gun descriptions), Vadim Barkov, meZee.
Campaign authors: Ronny Wester, Sauer2, clovehoof, Cong Xu.

## Credits, file by file

Every attribution file of the shipped data, unchanged (written by `re/cdogs/tools/credits.py`). The files
without one are Ronny Wester's (CC BY 3.0, `graphics/originals.txt`) or Cong Xu's (CC0), as above.

* `graphics/armor.txt`: Derived from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/bag.txt`: Derived from Various inventory 24 pixel icon set by OceansDream (http://oceansdream.deviantart.com/art/Pixel-Icons-available-for-use-121152370) http://opengameart.org/content/various-inventory-24-pixel-icon-set http://creativecommons.org/licenses/by/3.0/ http://creativecommons.org/licenses/by-sa/3.0/
* `graphics/bd.txt`: Derived from Tango Desktop Icons by Tango Desktop Project (http://tango.freedesktop.org/) http://opengameart.org/content/tango-desktop-icons http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/biogun.txt`: Derived from Various inventory 24 pixel icon set by OceansDream https://opengameart.org/content/various-inventory-24-pixel-icon-set http://creativecommons.org/licenses/by/3.0/ http://creativecommons.org/licenses/by-sa/3.0/
* `graphics/bones.txt`: Adapted from Dungeon Tileset By Calciumtrice https://opengameart.org/content/dungeon-tileset-1 http://creativecommons.org/licenses/by/3.0/
* `graphics/bones2.txt`: Adapted from [LPC] Dungeon Elements By Sharm and William.Thompsonj https://opengameart.org/content/lpc-dungeon-elements http://opengameart.org/content/oga-by-30-faq https://creativecommons.org/licenses/by/4.0/
* `graphics/bones3.txt`: BrowserQuest Sprites and Tiles Guillaume Lecollinet CC-BY-SA 3.0 http://opengameart.org/content/browserquest-sprites-and-tiles
* `graphics/bookshelf2.txt`: Adapted from 16x16 indoor rpg tileset: the baseline By Stephen Challener (Redshrike). Commissioned by OpenGameArt.org http://opengameart.org/content/16x16-indoor-rpg-tileset-the-baseline http://creativecommons.org/licenses/by/3.0/ http://opengameart.org/content/oga-by-30-faq
* `graphics/bottle2.txt`: Derived from RPG item set by Jetrel http://opengameart.org/content/rpg-item-set http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/box3.txt`: Adapted from Sci-Fi Object Set by Janna http://opengameart.org/content/sci-fi-object-set http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/box3_gas_16x21.txt`: Adapted from Sci-Fi Object Set by Janna http://opengameart.org/content/sci-fi-object-set http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/box3_gray.txt`: Adapted from Sci-Fi Object Set by Janna http://opengameart.org/content/sci-fi-object-set http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/box3_green.txt`: Adapted from Sci-Fi Object Set by Janna http://opengameart.org/content/sci-fi-object-set http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/box3_red.txt`: Adapted from Sci-Fi Object Set by Janna http://opengameart.org/content/sci-fi-object-set http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/browny_gun.txt`: Adapted from Various inventory 24 pixel icon set By OceansDream http://opengameart.org/content/various-inventory-24-pixel-icon-set http://creativecommons.org/licenses/by/3.0/
* `graphics/bullet_pickup.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/cabinet_server.txt`: Adapted from Sci-Fi Object Set by Janna http://opengameart.org/content/sci-fi-object-set http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/chainsaw.txt`: 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/chair_dining.txt`: Roguelike Dungeon/World Tiles by Joe Williamson (@JoeCreates) https://opengameart.org/content/roguelike-dungeonworld-tiles http://creativecommons.org/licenses/by-sa/3.0/
* `graphics/chair_task.txt`: Adapted from Office Furniture - 64 x 128 Isometric by extradave http://opengameart.org/content/office-furniture-64-x-128-isometric http://creativecommons.org/licenses/by/3.0/
* `graphics/chemo_gun.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/chip1.txt`: Derived from Tango Desktop Icons by Tango Desktop Project (http://tango.freedesktop.org/) http://opengameart.org/content/tango-desktop-icons http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/chip2.txt`: Derived from Tango Desktop Icons by Tango Desktop Project (http://tango.freedesktop.org/) http://opengameart.org/content/tango-desktop-icons http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/chip3.txt`: Derived from Tango Desktop Icons by Tango Desktop Project (http://tango.freedesktop.org/) http://opengameart.org/content/tango-desktop-icons http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/circuit.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/confusion_grenade.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/crate.txt`: Adapted from Dawnblocker Ortho by Buch http://opengameart.org/content/dawnblocker-ortho http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/crate2.txt`: Adapted from Dawnblocker Ortho by Buch http://opengameart.org/content/dawnblocker-ortho http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/drain1.txt`: Derived from metal grate texture by Luke.RUSTLTD http://opengameart.org/content/metal-grate-texture http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/drain2.txt`: Derived from Weathered Metal Grates by leeor_net http://opengameart.org/content/weathered-metal-grates http://creativecommons.org/licenses/by/3.0/
* `graphics/dynamite_active_16x16.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/dynamite_pickup.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/egg2.txt`: Adapted from 3X UPDATED 32x32 Scifi Roguelike Enemies By Stephen "Redshrike" Challener http://opengameart.org/content/3x-updated-32x32-scifi-roguelike-enemies http://creativecommons.org/licenses/by/3.0/ http://opengameart.org/content/oga-by-30-faq
* `graphics/fan_16x12.txt`: Derived from Cyberdog fan tiles by Ronny Wester http://creativecommons.org/licenses/by/3.0/
* `graphics/fireball.txt`: Derived from Animated Sprites and Textures by Spiney http://opengameart.org/content/animated-sprites-and-textures Licenses: http://creativecommons.org/licenses/by/3.0/ http://creativecommons.org/licenses/by-sa/3.0/ http://www.gnu.org/licenses/gpl-3.0.html http://www.gnu.org/licenses/old-licenses/gpl-2.0.html http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/fireball_green.txt`: Derived from Animated Sprites and Textures by Spiney http://opengameart.org/content/animated-sprites-and-textures Licenses: http://creativecommons.org/licenses/by/3.0/ http://creativecommons.org/licenses/by-sa/3.0/ http://www.gnu.org/licenses/gpl-3.0.html http://www.gnu.org/licenses/old-licenses/gpl-2.0.html http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/fireball_green_hit.txt`: Derived from Animated Sprites and Textures by Spiney http://opengameart.org/content/animated-sprites-and-textures Licenses: http://creativecommons.org/licenses/by/3.0/ http://creativecommons.org/licenses/by-sa/3.0/ http://www.gnu.org/licenses/gpl-3.0.html http://www.gnu.org/licenses/old-licenses/gpl-2.0.html http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/fireball_hit.txt`: Derived from Animated Sprites and Textures by Spiney http://opengameart.org/content/animated-sprites-and-textures Licenses: http://creativecommons.org/licenses/by/3.0/ http://creativecommons.org/licenses/by-sa/3.0/ http://www.gnu.org/licenses/gpl-3.0.html http://www.gnu.org/licenses/old-licenses/gpl-2.0.html http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/flamer.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/floor_console.txt`: Adapted from Kyrodian Legends Overworld Props By Midi https://web.archive.org/web/20150319200042/http://opengameart.org/content/kyrodian-legends-overworld-props http://creativecommons.org/licenses/by/3.0/
* `graphics/flower.txt`: Adapted from LPC: Interior Castle Tiles by Lanea Zimmerman http://opengameart.org/content/lpc-interior-castle-tiles http://creativecommons.org/licenses/by/3.0/
* `graphics/folder2.txt`: Derived from Tango Desktop Icons by Tango Desktop Project (http://tango.freedesktop.org/) http://opengameart.org/content/tango-desktop-icons http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/frag_grenade_pickup.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/gas_grenade_pickup.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/gas_tank.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/gibs.txt`: Adapted from Misc. Dark Fantasy Scenery Sprites by Gwes http://opengameart.org/content/misc-dark-fantasy-scenery-sprites http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/grenade_pickup.txt`: Adapted from Various inventory 24 pixel icon set by OceansDream http://opengameart.org/content/various-inventory-24-pixel-icon-set http://creativecommons.org/licenses/by/3.0/ http://creativecommons.org/licenses/by-sa/3.0/
* `graphics/health.txt`: Adapted from Various inventory 24 pixel icon set By OceansDream http://opengameart.org/content/various-inventory-24-pixel-icon-set http://creativecommons.org/licenses/by/3.0/
* `graphics/heart.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/heatseeker.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/jail_cell.txt`: Adapted from Tiny 16: Basic By Lanea Zimmerman https://opengameart.org/content/tiny-16-basic http://opengameart.org/content/oga-by-30-faq
* `graphics/jail_cell_skeleton.txt`: Adapted from Tiny 16: Basic By Lanea Zimmerman https://opengameart.org/content/tiny-16-basic http://opengameart.org/content/oga-by-30-faq
* `graphics/knife.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/launcher.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/machine_gun.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/map.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/mine_pickup.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/molotov_pickup.txt`: Adapted from Molotov Cocktail by OpenClips http://pixabay.com/en/molotov-cocktail-bottle-explosive-157193/ http://creativecommons.org/publicdomain/zero/1.0/deed.en
* `graphics/paper2.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/peashooter.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/petrifier.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/pistol.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/plant_brown.txt`: Adapted from [16x16] Indoor RPG Tileset by armisius https://opengameart.org/content/16x16-indoor-rpg-tileset http://creativecommons.org/licenses/by/3.0/
* `graphics/plasma_globe.txt`: Derived from Tango Desktop Icons by Tango Desktop Project (http://tango.freedesktop.org/) http://opengameart.org/content/tango-desktop-icons http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/powergun.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/pulse_rifle.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/radio2.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/rapid_11x11.png.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/rocket2.txt`: Adapted from Rocket By JM.Atencia http://opengameart.org/content/rocket http://creativecommons.org/licenses/by/3.0/
* `graphics/rockets.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/rod.txt`: Adapted from Kyrodian Legends Overworld Props By Midi https://web.archive.org/web/20150319200042/http://opengameart.org/content/kyrodian-legends-overworld-props http://creativecommons.org/licenses/by/3.0/
* `graphics/rod_light.txt`: Adapted from Kyrodian Legends Overworld Props By Midi https://web.archive.org/web/20150319200042/http://opengameart.org/content/kyrodian-legends-overworld-props http://creativecommons.org/licenses/by/3.0/
* `graphics/safe2.txt`: Adapted from Sci-Fi Object Set by Janna http://opengameart.org/content/sci-fi-object-set http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/shells.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/ship_picture.txt`: Adapted from 16*16 Ship Collection by Master484 https://opengameart.org/content/1616-ship-collection http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/shotgun.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/skull2.txt`: Adapted from Misc. Dark Fantasy Scenery Sprites by Gwes http://opengameart.org/content/misc-dark-fantasy-scenery-sprites http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/sniper.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/spawn_pad.txt`: Adapted from Sci-Fi Object Set by Janna http://opengameart.org/content/sci-fi-object-set http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/starmap.txt`: Derived from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/statue_behemoth.txt`: Adapted from Misc. Dark Fantasy Scenery Sprites by Gwes http://opengameart.org/content/misc-dark-fantasy-scenery-sprites http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/swarmer_gun.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/table.png.txt`: Adapted from Kyrodian Legends Overworld Props By Midi https://web.archive.org/web/20150319200042/http://opengameart.org/content/kyrodian-legends-overworld-props http://creativecommons.org/licenses/by/3.0/
* `graphics/table_and_chairs.txt`: Adapted from Tables and Stools By Jordan Irwin http://opengameart.org/content/tables-and-stools http://creativecommons.org/licenses/by/3.0/ Roguelike Dungeon/World Tiles by Joe Williamson (@JoeCreates) https://opengameart.org/content/roguelike-dungeonworld-tiles http://creativecommons.org/licenses/by-sa/3.0/
* `graphics/table_plastic.txt`: Adapted from Tables and Stools By Jordan Irwin http://opengameart.org/content/tables-and-stools http://creativecommons.org/licenses/by/3.0/
* `graphics/table_plastic_lab.txt`: Adapted from Tables and Stools By Jordan Irwin http://opengameart.org/content/tables-and-stools http://creativecommons.org/licenses/by/3.0/ RPG item set By Jetrel http://opengameart.org/content/rpg-item-set http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/table_wood_round.txt`: Adapted from Tables and Stools By Jordan Irwin http://opengameart.org/content/tables-and-stools http://creativecommons.org/licenses/by/3.0/
* `graphics/table_wood_round_candle.txt`: Adapted from Tables and Stools By Jordan Irwin http://opengameart.org/content/tables-and-stools http://creativecommons.org/licenses/by/3.0/
* `graphics/table_wood_round_clothed.txt`: Adapted from Tables and Stools By Jordan Irwin http://opengameart.org/content/tables-and-stools http://creativecommons.org/licenses/by/3.0/
* `graphics/table_wood_round_terminal.txt`: Adapted from Tables and Stools By Jordan Irwin http://opengameart.org/content/tables-and-stools http://creativecommons.org/licenses/by/3.0/ Kyrodian Legends Overworld Props By Midi https://web.archive.org/web/20150319200042/http://opengameart.org/content/kyrodian-legends-overworld-props http://creativecommons.org/licenses/by/3.0/
* `graphics/wall_chart.txt`: Adapted from Sci-Fi Facility Asset Pack by HaywardMorihara Pixel art by https://murphysdad.itch.io/ https://opengameart.org/content/sci-fi-facility-asset-pack http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/wall_goo2.txt`: Adapted from [LPC] Dungeon Elements by Sharm and William.Thompsonj http://opengameart.org/content/lpc-dungeon-elements http://creativecommons.org/licenses/by/3.0/ http://www.gnu.org/licenses/gpl-3.0.html http://www.gnu.org/licenses/old-licenses/gpl-2.0.html http://opengameart.org/content/oga-by-30-faq
* `graphics/wall_nuke_sign.txt`: Adapted from Sci-Fi Facility Asset Pack by HaywardMorihara Pixel art by https://murphysdad.itch.io/ https://opengameart.org/content/sci-fi-facility-asset-pack http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/wall_skull2.txt`: Adapted from Misc. Dark Fantasy Scenery Sprites by Gwes http://opengameart.org/content/misc-dark-fantasy-scenery-sprites http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/wscreen1.txt`: By sauer2 http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/wscreen2.txt`: By sauer2 http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/chars/explosion.txt`: Pixel Explosion (12 Frames) by JROB774 https://opengameart.org/content/pixel-explosion-12-frames http://creativecommons.org/licenses/by/3.0/
* `graphics/chars/bodies/base/src.txt`: Adapted from Sprite Base Model by Wind astella http://opengameart.org/content/sprite-base-model http://creativecommons.org/licenses/by/3.0/
* `graphics/chars/bodies/big/src.txt`: Adapted from Sprite Base Model by Wind astella http://opengameart.org/content/sprite-base-model http://creativecommons.org/licenses/by/3.0/
* `graphics/chars/bodies/big_skinny/src.txt`: Adapted from Sprite Base Model by Wind astella http://opengameart.org/content/sprite-base-model http://creativecommons.org/licenses/by/3.0/
* `graphics/chars/bodies/big_soldier/src.txt`: Adapted from Sprite Base Model by Wind astella http://opengameart.org/content/sprite-base-model http://creativecommons.org/licenses/by/3.0/
* `graphics/chars/bodies/dog/src.txt`: Adapted from Animated Animales Low Poly by quaternius https://opengameart.org/content/animated-animales-low-poly http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/chars/bodies/mech/src.txt`: Adapted from Sprite Base Model by Wind astella http://opengameart.org/content/sprite-base-model http://creativecommons.org/licenses/by/3.0/
* `graphics/chars/bodies/skinny/src.txt`: Adapted from Sprite Base Model by Wind astella http://opengameart.org/content/sprite-base-model http://creativecommons.org/licenses/by/3.0/
* `graphics/chars/bodies/soldier/src.txt`: Adapted from Sprite Base Model by Wind astella http://opengameart.org/content/sprite-base-model http://creativecommons.org/licenses/by/3.0/
* `graphics/chars/guns/chaingun.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/chars/guns/quad_chaingun.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/chars/heads/skull.txt`: By anonymous https://creativecommons.org/publicdomain/zero/1.0/
* `graphics/door/alien2/base/LICENSE.txt`: Adapted from Alien Breed (esque) Top-Down Tilesheet by ZiNGOT (www.zingot.com) http://opengameart.org/content/alien-breed-esque-top-down-tilesheet http://creativecommons.org/licenses/by/3.0/
* `graphics/door/dungeon2/base/LICENSE.txt`: Adapted from Spooky Castle Tileset by Buch http://opengameart.org/content/spooky-castle-tileset http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/door/tech/base/LICENSE.txt`: Adapted from Sci-fi Interior tiles by Buch http://opengameart.org/content/sci-fi-interior-tiles http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/exits/plate2/LICENSE.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/hud/arrow.txt`: Adapted from RetroPixel Icons V1 (9x9) By Anton Revin https://opengameart.org/content/retropixel-icons-v1-9x9 http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/hud/license.txt`: Derived from Unfinished user interfaces by Buch (https://opengameart.org/users/buch) https://opengameart.org/content/unfinished-user-interfaces http://creativecommons.org/publicdomain/zero/1.0/ And Hard Vacuum: IntfcBuy By Daniel Cook (http://lostgarden.com/) https://opengameart.org/content/hard-vacuum-intfcbuy http://creativecommons.org/licenses/by/3.0/
* `graphics/hud/objective_collect.txt`: Derived from Roguelike/RPG Icons by Joe Williamson (@JoeCreates) https://opengameart.org/content/roguelikerpg-icons http://creativecommons.org/licenses/by-sa/3.0/
* `graphics/keys/chip/LICENSE.txt`: Adapted from Various inventory 24 pixel icon set by OceansDream http://opengameart.org/content/various-inventory-24-pixel-icon-set http://creativecommons.org/licenses/by/3.0/
* `graphics/particles/beam.txt`: Derived from Sci-Fi / Space: Simple bullets by Bonsaiheldin https://opengameart.org/content/sci-fi-space-simple-bullets http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/particles/beam_bright.txt`: Adapted from Space Ship Construction Kit By Skorpio http://opengameart.org/content/space-ship-construction-kit Muzzle_flashes.zip Bullet http://creativecommons.org/licenses/by-sa/3.0/
* `graphics/particles/boom_16x16.txt`: Adapted from Explosion Sheet by StumpyStrust http://opengameart.org/content/explosion-sheet http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/particles/cells.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/particles/confusion_stars.txt`: Adapted from I ARE SPACESHIP (16x16 space sprites) by bart https://opengameart.org/content/i-are-spaceship-16x16-space-sprites http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/particles/explosion_small_34x34.txt`: Adapted from Explosion Set 1 (M484 Games) By Master484 http://opengameart.org/content/explosion-set-1-m484-games http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/particles/health_plus.txt`: Adapted from RetroPixel Icons V1 (9x9) By Anton Revin https://opengameart.org/content/retropixel-icons-v1-9x9 http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/particles/ice_sparkle.txt`: Adapted from I ARE SPACESHIP (16x16 space sprites) By bart https://opengameart.org/content/i-are-spaceship-16x16-space-sprites http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/particles/mini_cells.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `graphics/particles/muzzle_flash.txt`: Adapted from Space Ship Construction Kit By Skorpio http://opengameart.org/content/space-ship-construction-kit Muzzle_flashes.zip Muzzleflash 3 http://creativecommons.org/licenses/by-sa/3.0/
* `graphics/particles/muzzle_flash_big.txt`: Adapted from Space Ship Construction Kit By Skorpio http://opengameart.org/content/space-ship-construction-kit Muzzle_flashes.zip Layer 13 http://creativecommons.org/licenses/by-sa/3.0/
* `graphics/particles/smoke_trail.txt`: Adapted from Items and elements By GrafxKid https://opengameart.org/content/items-and-elements http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/particles/smoke_trail_small.txt`: Adapted from Items and elements By GrafxKid https://opengameart.org/content/items-and-elements http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/particles/spark.txt`: Adapted from Explosion Sheet by StumpyStrust http://opengameart.org/content/explosion-sheet http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/particles/trail.txt`: Adapted from 2D Shooter Effects (Alpha version) By Tatermand https://opengameart.org/content/2d-shooter-effects-alpha-version http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/particles/wave_11x11.txt`: Derived from Bullet Collection 2 (M484 Games) by Master484 (http://m484games.ucoz.com/) https://opengameart.org/content/bullet-collection-2-m484-games http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/tile/biggrid2/LICENSE.txt`: Derived from 16x16 Square Block Variations By etqws3 http://opengameart.org/content/16x16-square-block-variations http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/tile/cobble/LICENSE.txt`: Derived from 16x16 pixel art dungeon wall and cobblestone floor tiles By Daniel Siegmund and commissioned by OpenGameArt.org (http://opengameart.org) http://opengameart.org/content/16x16-pixel-art-dungeon-wall-and-cobblestone-floor-tiles http://creativecommons.org/licenses/by/3.0/
* `graphics/tile/grate/LICENSE.txt`: Derived from Inca Tileset by Matriax https://opengameart.org/content/inca-tileset http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/tile/metal/LICENSE.txt`: Derived from Futuristic Industrial Technical Tileset by bitbotzgames https://opengameart.org/content/futuristic-industrial-technical-tileset http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/tile/recessed2/LICENSE.txt`: Derived from Sci-fi platformer tiles (32x32) By bart http://opengameart.org/content/sci-fi-platformer-tiles-32x32 http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/tile/smallsquare2/LICENSE.txt`: Derived from 16x16 Square Block Variations By etqws3 http://opengameart.org/content/16x16-square-block-variations http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/tile/water/LICENSE.txt`: Derived from Pixel Texture Pack By jestan https://opengameart.org/content/pixel-texture-pack https://creativecommons.org/licenses/by/4.0/ http://creativecommons.org/licenses/by-sa/4.0/
* `graphics/tile/wood2/LICENSE.txt`: Derived from 16x16 Tiles By Ogrebane http://opengameart.org/content/16x16-tiles http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/wall/brick2/LICENSE.txt`: Derived from Dawnblocker Ortho By Buch http://opengameart.org/content/dawnblocker-ortho http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/wall/bunker/LICENSE.txt`: Derived from Basic 32x32 sci-fi tiles for roguelike by Stephen Challener (Redshrike) and Daniel Cook, hosted by OpenGameArt.org http://opengameart.org/content/basic-32x32-sci-fi-tiles-for-roguelike http://creativecommons.org/licenses/by/3.0/ http://opengameart.org/content/oga-by-30-faq Colored Metal tiles 1b by sgtcrispy http://opengameart.org/content/colored-metal-tiles-1b http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/wall/carbon2/LICENSE.txt`: Derived from Extension for Dawnblocker Ortho By rubberduck http://opengameart.org/content/extension-for-dawnblocker-ortho http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/wall/cobble/LICENSE.txt`: Derived from RPG Indoor Tileset: Expansion 1 By Redshrike https://opengameart.org/content/rpg-indoor-tileset-expansion-1 http://opengameart.org/content/oga-by-30-faq
* `graphics/wall/colony/LICENSE.txt`: Derived from Colony Sim Extended Version By rubberduck https://opengameart.org/content/colony-sim-extended-version http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/wall/greenstain/LICENSE.txt`: Derived from Basic 32x32 sci-fi tiles for roguelike by Stephen Challener (Redshrike) and Daniel Cook, hosted by OpenGameArt.org http://opengameart.org/content/basic-32x32-sci-fi-tiles-for-roguelike Licenses: http://creativecommons.org/licenses/by/3.0/ http://opengameart.org/content/oga-by-30-faq
* `graphics/wall/hightech/LICENSE.txt`: Derived from Pixel Texture Pack by jestan https://opengameart.org/content/pixel-texture-pack http://creativecommons.org/licenses/by/4.0/ http://creativecommons.org/licenses/by/3.0/ http://creativecommons.org/licenses/by-sa/4.0/ http://creativecommons.org/licenses/by-sa/3.0/
* `graphics/wall/panel/LICENSE.txt`: Derived from 190+ Pixel Art Assets (Sci-fi & Forest) by Gabsond https://opengameart.org/content/190-pixel-art-assets-sci-fi-forest http://creativecommons.org/publicdomain/zero/1.0/
* `graphics/wall/rock/LICENSE.txt`: Derived from Tiny 16: Basic by Lanea Zimmerman http://opengameart.org/content/tiny-16-basic http://creativecommons.org/licenses/by/3.0/ http://opengameart.org/content/oga-by-30-faq
* `graphics/wall/stone2/LICENSE.txt`: Derived from Pixel Blocks by Zush Design https://opengameart.org/content/pixel-blocks https://creativecommons.org/licenses/by/4.0/
* `graphics/wall/support/LICENSE.txt`: Derived from Pixel Texture Pack by jestan https://opengameart.org/content/pixel-texture-pack http://creativecommons.org/licenses/by/4.0/ http://creativecommons.org/licenses/by/3.0/ http://creativecommons.org/licenses/by-sa/4.0/ http://creativecommons.org/licenses/by-sa/3.0/
* `graphics/wall/techwall/LICENSE.txt`: Derived from Pixel Texture Pack by jestan https://opengameart.org/content/pixel-texture-pack http://creativecommons.org/licenses/by/4.0/ http://creativecommons.org/licenses/by/3.0/ http://creativecommons.org/licenses/by-sa/4.0/ http://creativecommons.org/licenses/by-sa/3.0/
* `sounds/ammo_low.txt`: Derived alert.wav by Corsica_S http://freesound.org/people/Corsica_S/sounds/156453/ http://creativecommons.org/licenses/by/4.0/
* `sounds/ammo_none.txt`: Derived from Error.wav by Autistic Lucario http://freesound.org/people/Autistic%20Lucario/sounds/142608/ http://creativecommons.org/licenses/by/4.0/ GunSLide.wav by RazzDaSpazz http://freesound.org/people/RazzDaSpazz/sounds/155174/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/bottle_pop.txt`: Adapted from HOUSE-BOTTLE01-POP-CORK.wav by kantouth http://freesound.org/people/kantouth/sounds/106728/ http://creativecommons.org/licenses/by/4.0/
* `sounds/bounce.txt`: Derived from pluck_can 09.wav by Ayavaron http://freesound.org/people/Ayavaron/sounds/126501/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/bullet_pickup.txt`: Derived from camera click_NIKON.wav by Snapper4298 http://freesound.org/people/Snapper4298/sounds/178186/ http://creativecommons.org/licenses/by/4.0/
* `sounds/cells_pickup.txt`: Derived from Transit Crystal Charge by crashoverride61088 http://freesound.org/people/crashoverride61088/sounds/193622/ http://creativecommons.org/publicdomain/zero/1.0/ and clicks_lamp.wav by jennerallydrawing http://freesound.org/people/jennerallydrawing/sounds/251452/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/chainsaw.txt`: Chainsaw gasoline-powered.wav by aoristos http://freesound.org/people/aoristos/sounds/235795/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/chainsaw_switch.txt`: Adapted from 8 Chainsaw Pulls.wav by Stefan021 https://freesound.org/people/Stefan021/sounds/431740/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/click.txt`: Derived from Stapler_Hands_05.wav by Simon_Lacelle http://freesound.org/people/Simon_Lacelle/sounds/67352/ http://creativecommons.org/licenses/by/4.0/
* `sounds/door.txt`: Derived from Slide by jberkuta14 https://www.freesound.org/people/jberkuta14/sounds/134894/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/door_close.txt`: Derived from Slide by jberkuta14 https://www.freesound.org/people/jberkuta14/sounds/134894/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/explosion_small.txt`: Derived from Huge Explosion by unfa https://www.freesound.org/people/unfa/sounds/259300/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/fireball.txt`: Derived from JM_FX_Fireball 01.wav by Julien Matthey http://freesound.org/people/Julien%20Matthey/sounds/105016/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/flamer.txt`: Derived from Flames 2 by shastrocks https://www.freesound.org/people/shastrocks/sounds/182119/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/flamer_switch.txt`: Derived from Kitchen_Hob_Burner_Gas_Fire_Flame_Ignition_Cooking.wav by tompallant https://www.freesound.org/people/tompallant/sounds/260448/ http://creativecommons.org/publicdomain/zero/1.0/ openning can.wav by Nic3_one https://www.freesound.org/people/Nic3_one/sounds/166546/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/fusion.txt`: Derived from JM_NOIZ_Laser 01.wav by Julien Matthey https://www.freesound.org/people/Julien%20Matthey/sounds/268344/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/gas_leak.txt`: Derived from Décompression.wav by davidou https://www.freesound.org/people/davidou/sounds/88495/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/gas_tank_pickup.txt`: Derived from pbr_can 09.wav by Ayavaron http://freesound.org/people/Ayavaron/sounds/126478/ http://creativecommons.org/publicdomain/zero/1.0/ and fizzy water bottle open 001.WAV by uwesoundboiz http://freesound.org/people/uwesoundboiz/sounds/60385/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/glass_break.txt`: Derived from Breaking Bottle by spookymodem https://opengameart.org/content/breaking-bottle http://creativecommons.org/licenses/by/3.0/
* `sounds/grenade_pickup.txt`: Derived from rocks fall with leaf rustle 3.wav by Halleck http://freesound.org/people/Halleck/sounds/121705/ http://creativecommons.org/licenses/by/4.0/ and Canvas Tent 3.wav by kevinkace http://freesound.org/people/kevinkace/sounds/66775/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/hahaha.txt`: Derived from Evil Laughs Demonic Echos.mp3 by teqstudios https://www.freesound.org/people/teqstudios/sounds/118703/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/headshot.txt`: Derived from metal tube 4.ogg by adharca https://freesound.org/people/adharca/sounds/278173/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/health.txt`: Derived from beeps-5.wav by Greencouch http://freesound.org/people/Greencouch/sounds/124905/ http://creativecommons.org/licenses/by/3.0/
* `sounds/heatseeker_switch.txt`: Derived from HefterLocher.wav by Mortifreshman http://freesound.org/people/Mortifreshman/sounds/246518/ http://creativecommons.org/publicdomain/zero/1.0/ missile_launch_2.wav by smcameron http://freesound.org/people/smcameron/sounds/51468/ http://creativecommons.org/licenses/by/3.0/
* `sounds/key.txt`: Derived from Keys 06.wav by LG http://freesound.org/people/LG/sounds/73093/ http://creativecommons.org/licenses/by/4.0/
* `sounds/knife_switch.txt`: Derived from dagger_drawn2.wav by freefire66 https://www.freesound.org/people/freefire66/sounds/175953/ http://creativecommons.org/publicdomain/zero/1.0/ sheath_sword.wav by Qat https://www.freesound.org/people/Qat/sounds/107590/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/knuckles.txt`: Derived from knuckles cracking by borq1 https://freesound.org/people/borq1/sounds/475965/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/laserpew.txt`: Pew Laser fire Sound by sketcherskt https://opengameart.org/content/pew-laser-fire-sound http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/launch.txt`: Adapted from semtex grenade.wav by superfreq http://freesound.org/people/superfreq/sounds/191583/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/launcher_switch.txt`: Derived from HefterLocher.wav by Mortifreshman http://freesound.org/people/Mortifreshman/sounds/246518/ http://creativecommons.org/publicdomain/zero/1.0/ vault.aiff by franzzle http://freesound.org/people/franzzle/sounds/184843/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/life.txt`: Adapted from Alert (1) by Beetlemuse https://freesound.org/people/Beetlemuse/sounds/529626/ https://creativecommons.org/licenses/by/4.0/ And Powerup 08.wav By MATRIXXX_ https://freesound.org/people/MATRIXXX_/sounds/523648/ https://creativecommons.org/publicdomain/zero/1.0/
* `sounds/lmg.txt`: Light Machine Gun by KuraiWolf https://opengameart.org/content/light-machine-gun https://creativecommons.org/licenses/by/4.0/
* `sounds/map_open_close.txt`: Derived from Oblivion drone sounds » 07-confirmation.wav https://www.freesound.org/people/drzhnn/sounds/199940/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/menu.txt`: menu_back menu_enter menu_error menu_start menu_switch Derived from Hi-Tech Button Sound Pack I (Non Themed) by Circlerun https://opengameart.org/content/hi-tech-button-sound-pack-i-non-themed http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/mg.txt`: Derived from Sniper Shot by LeMudCrab https://www.freesound.org/people/LeMudCrab/sounds/163460/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/mg_switch.txt`: Derived from AR15 Various Sounds by wadaltmon https://www.freesound.org/people/wadaltmon/sounds/263513/ http://creativecommons.org/publicdomain/zero/1.0/ Steel chain hard clicking by ani_music https://www.freesound.org/people/ani_music/sounds/167916/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/mine_arm.txt`: Derived from Radio Beep by Kijadzel http://freesound.org/people/Kijadzel/sounds/170608/ http://creativecommons.org/licenses/by/3.0/
* `sounds/mine_switch.txt`: Derived from Radio Beep by Kijadzel http://freesound.org/people/Kijadzel/sounds/170608/ http://creativecommons.org/licenses/by/3.0/
* `sounds/mine_trigger.txt`: Derived from Radio Beep by Kijadzel http://freesound.org/people/Kijadzel/sounds/170608/ http://creativecommons.org/licenses/by/3.0/
* `sounds/mini_cells_pickup.txt`: Derived from Transit Crystal Charge by crashoverride61088 http://freesound.org/people/crashoverride61088/sounds/193622/ http://creativecommons.org/publicdomain/zero/1.0/ and clicks_lamp.wav by jennerallydrawing http://freesound.org/people/jennerallydrawing/sounds/251452/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/mission_complete.txt`: Derived from UI and Item sound effect Jingles Sample 2 by ViRiX Dreamcore soundcloud.com/virix https://opengameart.org/content/ui-and-item-sound-effect-jingles-sample-2 http://creativecommons.org/licenses/by/3.0/
* `sounds/molotov_pickup.txt`: Derived from flasks.mp3 by j1987 http://freesound.org/people/j1987/sounds/94987/ http://creativecommons.org/publicdomain/zero/1.0/ and Waterbottle, grab, squeeze.wav by MentalSanityOff http://freesound.org/people/MentalSanityOff/sounds/153557/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/monster-2.txt`: Derived from Monster Sound Effects Pack by Ogrebane http://opengameart.org/content/monster-sound-effects-pack http://creativecommons.org/publicdomain/zero/1.0/ and Bloody Blade 2.wav by Kreastricon62 https://freesound.org/people/Kreastricon62/sounds/323525/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/package_pickup.txt`: Bone, Fall, Ledge Climbing, Impact (Yo Frankie!) by Blender Foundation CC-BY 3.0 http://opengameart.org/content/bone-fall-ledge-climbing-impact-yo-frankie http://creativecommons.org/licenses/by/3.0/
* `sounds/package_r.txt`: Derived from picking_up_DVDs.wav by daboy291 https://freesound.org/people/daboy291/sounds/138078/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/pickup.txt`: Derived from picking_up_DVDs.wav by daboy291 https://www.freesound.org/people/daboy291/sounds/138078/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/pistol.txt`: Derived from Chaingun, pistol, rifle, shotgun shots by Michel Baradari http://opengameart.org/content/chaingun-pistol-rifle-shotgun-shots http://creativecommons.org/licenses/by/3.0/
* `sounds/pistol_switch.txt`: Derived from GunSLide.wav by RazzDaSpazz http://freesound.org/people/RazzDaSpazz/sounds/155174/ http://creativecommons.org/publicdomain/zero/1.0/ Beretta M9 slide release by vabadus http://freesound.org/people/vabadus/sounds/151067/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/powergun.txt`: Derived from fusion-gun_flash0_by_OnlyTheGhosts.wav by OnlyTheGhosts https://www.freesound.org/people/OnlyTheGhosts/sounds/251431/ http://creativecommons.org/licenses/by/4.0/
* `sounds/powergun_r.txt`: Derived from gunfiddle.wav by j1987 https://www.freesound.org/people/j1987/sounds/107795/ http://creativecommons.org/publicdomain/zero/1.0/ JM_NOIZ_Buzz 01 - Neon Light.wav by Julien Matthey https://www.freesound.org/people/Julien%20Matthey/sounds/118340/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/powergun_switch.txt`: Derived from Desert Eagle Reload [Air Soft].mp3 by TheRichardGamer https://www.freesound.org/people/TheRichardGamer/sounds/172970/ http://creativecommons.org/publicdomain/zero/1.0/ Transit Crystal Charge by crashoverride61088 http://freesound.org/people/crashoverride61088/sounds/193622/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/pulse.txt`: Derived from possiblelazer.wav by aust_paul http://freesound.org/people/aust_paul/sounds/30935/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/pulse_switch.txt`: Derived from Camera Shutter by roachpowder https://www.freesound.org/people/roachpowder/sounds/170229/ http://creativecommons.org/publicdomain/zero/1.0/ car alarm lights switched on beeps.wav by RutgerMuller https://www.freesound.org/people/RutgerMuller/sounds/50886/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/rescue.txt`: hint.wav https://www.freesound.org/people/dland/sounds/320181/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/rocket_launch.txt`: 4 projectile launches by Michel Baradari http://opengameart.org/content/4-projectile-launches http://creativecommons.org/licenses/by/3.0/
* `sounds/shells_pickup.txt`: Derived from Shotgun shell ejection.aif by JohnDelayniKIng http://freesound.org/people/JohnDelayniKIng/sounds/147261/ http://creativecommons.org/publicdomain/zero/1.0/ and shotgun sounds by lensflare8642 http://freesound.org/people/lensflare8642/sounds/145209/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/shotgun.txt`: Derived from SPAS-12 by duesto https://www.freesound.org/people/duesto/sounds/156904/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/shotgun_r.txt`: Derived from Shotgun Cock Reload Layered (Powerful) by Paul368 https://www.freesound.org/people/Paul368/sounds/200966/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/show_map.txt`: Derived from 9 sci-fi computer sounds and beeps by Michel Baradari https://opengameart.org/content/9-sci-fi-computer-sounds-and-beeps http://creativecommons.org/licenses/by/3.0/
* `sounds/spawn.txt`: Derived from Ambient power chord (E2) by Khoon http://freesound.org/people/Khoon/sounds/168741/ http://creativecommons.org/publicdomain/zero/1.0/ and teleport by fins http://freesound.org/people/fins/sounds/172207/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/spawn_item.txt`: alien_phaser.R.wav by torn.rugged.audio.35 http://freesound.org/people/torn.rugged.audio.35/sounds/45935/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/swarmer.txt`: Derived from Jet_Whoosh.WAV by Benboncan http://freesound.org/people/Benboncan/sounds/167563/ http://creativecommons.org/licenses/by/3.0/
* `sounds/swarmer_switch.txt`: Derived from HefterLocher.wav by Mortifreshman http://freesound.org/people/Mortifreshman/sounds/246518/ http://creativecommons.org/publicdomain/zero/1.0/ typewriter-olivetti-lettra-22.wav by keithpeter http://freesound.org/people/keithpeter/sounds/123344/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/swell.txt`: Derived from missile_launch_2.wav by smcameron http://freesound.org/people/smcameron/sounds/51468/ http://creativecommons.org/licenses/by/3.0/
* `sounds/switch.txt`: Adapted from Weapon Cock by thecluegeek https://www.freesound.org/people/thecluegeek/sounds/141364/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/victory.txt`: Derived from VICTORY CRY REVERB 2.wav by chripei http://freesound.org/people/chripei/sounds/165491/ http://creativecommons.org/licenses/by/3.0/
* `sounds/whistle.txt`: Derived from Thats correct.mp3 by cityrocker https://www.freesound.org/people/cityrocker/sounds/121342/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/bang/license.txt`: Derived from Synthesized explosion by Iwan Gabovitch http://opengameart.org/content/synthesized-explosion http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/boom/license.txt`: Derived from Synthesized_Explosion_01.wav by RSilveira_88 http://freesound.org/people/RSilveira_88/sounds/216278/ http://creativecommons.org/licenses/by/4.0/
* `sounds/chars/alert/alien/license.txt`: 0 1 Small pest alien/creature http://opengameart.org/content/small-pest-aliencreature http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/chars/alert/dog/license.txt`: Mr Dog_01.wav https://freesound.org/people/apolloaiello/sounds/276267/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/chars/alert/man/license.txt`: 0 Huh? - Vocal https://freesound.org/people/davdud101/sounds/150505/ http://creativecommons.org/publicdomain/zero/1.0/ 1 Huh_male.wav https://freesound.org/people/Adam_N/sounds/166129/ http://creativecommons.org/publicdomain/zero/1.0/ 2 "Huh?" type sound - Bewildered Male https://freesound.org/people/Iceofdoom/sounds/411086/ http://creativecommons.org/licenses/by/4.0/ 3 Huh Eh Man https://freesound.org/people/dersuperanton/sounds/437649/ http://creativecommons.org/licenses/by/3.0/
* `sounds/chars/alert/mech/license.txt`: Derived from mover stop.wav by dingus23 https://freesound.org/people/dingus23/sounds/436385/ http://creativecommons.org/licenses/by/4.0/ robot, machinery » Estlack_liftB_1.aif by estlacksensory https://freesound.org/people/estlacksensory/sounds/118715/ http://creativecommons.org/licenses/by/3.0/
* `sounds/chars/alert/ogre/license.txt`: 0 1 15 monster grunt/pain/death sounds http://opengameart.org/content/15-monster-gruntpaindeath-sounds http://creativecommons.org/licenses/by/3.0/
* `sounds/chars/alert/woman/license.txt`: 0 huh - Surprised and curious https://freesound.org/people/jburunet/sounds/460922/ http://creativecommons.org/publicdomain/zero/1.0/ 1 Eh?.mp3 https://freesound.org/people/mariallinas/sounds/222652/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/chars/alert/zombie/license.txt`: 0 1 2 3 4 Zombies Sound Pack http://opengameart.org/content/zombies-sound-pack http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/chars/die/alien/license.txt`: 0 1 2 Small pest alien/creature http://opengameart.org/content/small-pest-aliencreature http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/chars/die/dog/license.txt`: 0 4_Beagle_Whining_Room_M https://freesound.org/people/16G_Panska_Dolezal_Stepan/sounds/498703/ http://creativecommons.org/publicdomain/zero/1.0/ 1 Dog Whine 1.wav https://freesound.org/people/esperri/sounds/118966/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/chars/die/man/license.txt`: 0 Helmut Scream http://freesound.org/people/creativeheroes/sounds/84353/ http://creativecommons.org/licenses/by/4.0/ 1, 2 Male_Thijs_loud_scream http://freesound.org/people/thanvannispen/sounds/9432/ http://creativecommons.org/licenses/by/4.0/ 3 - 7 human male scream multi http://freesound.org/people/JohnsonBrandEditing/sounds/173944/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/chars/die/mech/license.txt`: Robotic mechanic step sounds by Lee Barkovich https://opengameart.org/content/robotic-mechanic-step-sounds http://creativecommons.org/licenses/by/3.0/
* `sounds/chars/die/ogre/license.txt`: 0 1 2 3 15 monster grunt/pain/death sounds http://opengameart.org/content/15-monster-gruntpaindeath-sounds http://creativecommons.org/licenses/by/3.0/
* `sounds/chars/die/woman/license.txt`: 0 women_scream_AAA.aiff https://www.freesound.org/people/thanvannispen/sounds/9429/ http://creativecommons.org/licenses/by/4.0/ 1 Girl_Two_Screams.wav https://www.freesound.org/people/tcrocker68/sounds/235595/ http://creativecommons.org/publicdomain/zero/1.0/ 2 Girl_Scream.wav https://www.freesound.org/people/tcrocker68/sounds/235592/ http://creativecommons.org/publicdomain/zero/1.0/ 3 pandoramachineannalisaloefflerscreams_03.flac https://www.freesound.org/people/pushkin/sounds/241591/ http://creativecommons.org/publicdomain/zero/1.0/ 4 WomanScream.wav https://www.freesound.org/people/Archeos/sounds/261419/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/chars/die/zombie/license.txt`: 0 1 2 3 4 5 Zombies Sound Pack http://opengameart.org/content/zombies-sound-pack http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/explosion/license.txt`: Derived from cannon_boom7.wav by ReadeOnly http://freesound.org/people/ReadeOnly/sounds/186951/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/footsteps/bones/license.txt`: Derived from bone shell by blukotek https://freesound.org/people/blukotek/sounds/249319/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/footsteps/boots/license.txt`: Derived from footstep-concrete.wav by swuing http://www.freesound.org/people/swuing/sounds/38873/ http://creativecommons.org/licenses/by/3.0/
* `sounds/footsteps/dog/license.txt`: Derived from Wolf run.wav by sabotovat https://freesound.org/people/sabotovat/sounds/414350/ http://creativecommons.org/licenses/by/3.0/
* `sounds/footsteps/grass/license.txt`: Derived from footstep-grass.wav by swuing https://freesound.org/people/swuing/sounds/38874/ http://creativecommons.org/licenses/by/3.0/
* `sounds/footsteps/gravel/license.txt`: Derived from Pack: Gravel Footsteps by Ali_6868 https://freesound.org/people/Ali_6868/packs/21608/ https://creativecommons.org/publicdomain/zero/1.0/
* `sounds/footsteps/mech/license.txt`: Derived from Robotic mechanic step sounds by Lee Barkovich http://www.archive.org/details/Berklee44Barkovich http://creativecommons.org/licenses/by/3.0/
* `sounds/footsteps/metal/license.txt`: Derived from fboots on aluminum ladder 01 by Eelke https://freesound.org/people/Eelke/sounds/462598/ http://creativecommons.org/licenses/by/4.0/
* `sounds/footsteps/tile/license.txt`: Derived from footstep-concrete.wav by swuing http://www.freesound.org/people/swuing/sounds/38873/ And Squeaky footstep.wav from ceberation https://freesound.org/people/ceberation/sounds/235524/ http://creativecommons.org/licenses/by/3.0/
* `sounds/footsteps/water/license.txt`: Derived from Water Footsteps by EminYILDIRIM https://freesound.org/people/EminYILDIRIM/sounds/608663/ http://creativecommons.org/licenses/by/4.0/ And footstep-concrete.wav by swuing http://www.freesound.org/people/swuing/sounds/38873/ http://creativecommons.org/licenses/by/3.0/
* `sounds/footsteps/wood/license.txt`: Derived from footstep-wood.wav by swuing https://freesound.org/people/swuing/sounds/38876/ http://creativecommons.org/licenses/by/3.0/
* `sounds/hits/dog_growl/license.txt`: Derived from Dogs growling.wav by juskiddink https://freesound.org/people/juskiddink/sounds/121565/ http://creativecommons.org/licenses/by/3.0/
* `sounds/hits/fire/license.txt`: Derived from gas_fire_catch.wav by themfish http://www.freesound.org/people/themfish/sounds/45809/ http://creativecommons.org/licenses/by/4.0/
* `sounds/hits/flesh/license.txt`: Derived from Bullet_Impact_3 by toxicwafflezz http://www.freesound.org/people/toxicwafflezz/sounds/150839/ http://creativecommons.org/licenses/by/3.0/
* `sounds/hits/gas/license.txt`: Derived from Wind, hit, time morph by qubodup https://opengameart.org/content/wind-hit-time-morph http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/hits/hard/license.txt`: Derived from Bullet_Flyby_2.wav by kMoon http://www.freesound.org/people/kMoon/sounds/90782/ http://creativecommons.org/licenses/by/3.0/
* `sounds/hits/knife_flesh/license.txt`: Derived from 1_Knife_Slash_A.wav by lmbubec http://www.freesound.org/people/lmbubec/sounds/118792/ http://creativecommons.org/publicdomain/zero/1.0/ Zombie Flesh Bites by MrPokephile http://www.freesound.org/people/MrPokephile/sounds/155973/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/hits/knife_hard/license.txt`: Derived from Door Knock.wav by geoffbarkman http://www.freesound.org/people/geoffbarkman/sounds/53442/ http://creativecommons.org/licenses/by/4.0/
* `sounds/hits/petrify/license.txt`: Derived from Crackling Plastic by PaulBannisterAudio http://www.freesound.org/people/PaulBannisterAudio/sounds/133765/ http://creativecommons.org/licenses/by/3.0/
* `sounds/ricochet/license.txt`: Derived from incoming Ricochets .wav by rakurka http://freesound.org/people/rakurka/sounds/187533/ http://creativecommons.org/publicdomain/zero/1.0/
* `sounds/slide/license.txt`: Derived from Sand paper rub.mp3 by orginaljun orginaljun.deviantart.com http://freesound.org/people/orginaljun/sounds/157832/ http://creativecommons.org/licenses/by/3.0/
* `music/briefing/A Really Tense Moment FULL.txt`: Dynamic Action Music Pack ViRiX soundcloud.com/virix https://opengameart.org/content/dynamic-action-music-pack http://creativecommons.org/licenses/by/3.0/
* `music/briefing/Futuristic_junk.txt`: Futuristic_junk Alexandr Zhelanov https://soundcloud.com/alexandr-zhelanov https://opengameart.org/content/futuristicjunk http://creativecommons.org/licenses/by/3.0/
* `music/end/The 9th Circle V2.txt`: The 9th Circle Joth https://opengameart.org/content/the-9th-circle http://creativecommons.org/publicdomain/zero/1.0/
* `music/game/red_doors2.txt`: Red Doors v2.0 Matthew Pablo http://www.matthewpablo.com http://opengameart.org/content/red-doors-v20 http://creativecommons.org/licenses/by/3.0/
* `music/game/space_dimensions_8bit.txt`: Space Dimensions (8bit/Retro Version) Matthew Pablo http://www.matthewpablo.com http://opengameart.org/content/space-dimensions-8bitretro-version http://creativecommons.org/licenses/by/3.0/
* `music/lose/CrashedShip.txt`: Reencoded from Sci-Fi Ambient - Crashed Ship by Ted Kerr https://opengameart.org/content/sci-fi-ambient-crashed-ship http://creativecommons.org/licenses/by/3.0/
* `music/lose/Epic Fall.txt`: Reencoded from Epic Fall by Alexandr Zhelanov Alexandr Zhelanov https://soundcloud.com/alexandr-zhelanov https://opengameart.org/content/epic-fall http://creativecommons.org/licenses/by/3.0/
* `music/menu/Battle_2.txt`: Reencoded from Post Apocalyptic and CyberPunk Melodies by Alexandr Zhelanov Alexandr Zhelanov https://soundcloud.com/alexandr-zhelanov https://opengameart.org/content/post-apocalyptic-and-cyberpunk-melodies https://creativecommons.org/licenses/by/4.0/
* `music/menu/metamorphosis2.txt`: Reencoded from Metamorphosis ver. 2 by VocalMix http://opengameart.org/content/metamorphosis-ver-2 http://opengameart.org/content/oga-by-30-faq
* `music/menu/space_0.ogg.txt`: Reencoded from Space by Alexandr Zhelanov http://opengameart.org/content/space-1 http://creativecommons.org/licenses/by/3.0/
* `music/victory/Party Sector.txt`: Reencoded from Party Sector by Joth Joth https://soundcloud.com/user-215083110 https://opengameart.org/content/party-sector http://creativecommons.org/publicdomain/zero/1.0/
* `music/victory/low-fi.txt`: Reencoded from low-fi by Alexandr Zhelanov https://soundcloud.com/alexandr-zhelanov https://opengameart.org/content/low-fi http://creativecommons.org/licenses/by/3.0/
* `missions/Sand.cdogscpn/graphics/khanjali.txt`: Derived from 8 Bit Items by ZigWin https://opengameart.org/content/8-bit-items http://creativecommons.org/licenses/by-sa/3.0/
* `missions/Sand.cdogscpn/graphics/lasergun.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `missions/Sand.cdogscpn/graphics/projection_13x13.txt`: Adapted from Bullet Collection 2 (M484 Games) by Master484 https://opengameart.org/content/bullet-collection-2-m484-games http://creativecommons.org/publicdomain/zero/1.0/
* `missions/Sand.cdogscpn/graphics/projector.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `missions/Sand.cdogscpn/graphics/spark_spray.txt`: Derived from Sparks (Fire, Ice, Blood) by Clint Bellanger https://opengameart.org/content/sparks-fire-ice-blood http://creativecommons.org/licenses/by/3.0/
* `missions/Sand.cdogscpn/graphics/wurmtooth.txt`: Derived from Tooth of an Animal by Nem_ https://opengameart.org/content/tooth-of-an-animal http://creativecommons.org/licenses/by-sa/3.0/ http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
* `missions/Sand.cdogscpn/sounds/inkvine.txt`: Derived from Footsteps » Sludge Footsteps 1.wav by morganpurkis https://www.freesound.org/people/morganpurkis/sounds/384658/ http://creativecommons.org/licenses/by/3.0/
* `missions/Sand.cdogscpn/sounds/inkvine_r.txt`: Derived from Cocking M16.aif by maurosama http://freesound.org/people/maurosama/sounds/133814/ http://creativecommons.org/publicdomain/zero/1.0/
* `missions/Sand.cdogscpn/sounds/projector.txt`: Derived from Sci-fi gun shot x6 by humanoide7000 http://freesound.org/people/humanoide7000/sounds/330293/ http://creativecommons.org/publicdomain/zero/1.0/
* `missions/Sand.cdogscpn/sounds/splat.txt`: splat.ogg by gprosser https://www.freesound.org/people/gprosser/sounds/360942/ http://creativecommons.org/publicdomain/zero/1.0/
* `missions/Sand.cdogscpn/sounds/wurmtooth_flesh.txt`: Adapted from Knife Stab.wav by Mixedupmoviestuff https://www.freesound.org/people/Mixedupmoviestuff/sounds/179222/ http://creativecommons.org/publicdomain/zero/1.0/ PUNCH-BOXING-04.wav by newagesoup https://www.freesound.org/people/newagesoup/sounds/348241/ http://creativecommons.org/publicdomain/zero/1.0/
* `missions/ai_insurgency.cdogscpn/graphics/box3_blink.txt`: Adapted from Sci-Fi Object Set by Janna http://opengameart.org/content/sci-fi-object-set http://creativecommons.org/publicdomain/zero/1.0/
* `missions/ai_insurgency.cdogscpn/graphics/server_blink.txt`: Adapted from Sci-Fi Object Set by Janna http://opengameart.org/content/sci-fi-object-set http://creativecommons.org/publicdomain/zero/1.0/
* `missions/ai_insurgency_2.cdogscpn/graphics/box3_blink.txt`: Adapted from Sci-Fi Object Set by Janna http://opengameart.org/content/sci-fi-object-set http://creativecommons.org/publicdomain/zero/1.0/
* `missions/ai_insurgency_2.cdogscpn/graphics/circuit3.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `missions/ai_insurgency_2.cdogscpn/graphics/server_blink.txt`: Adapted from Sci-Fi Object Set by Janna http://opengameart.org/content/sci-fi-object-set http://creativecommons.org/publicdomain/zero/1.0/
* `missions/ai_insurgency_2.cdogscpn/graphics/table_plastic_computer.txt`: Adapted from Tables and Stools By Jordan Irwin http://opengameart.org/content/tables-and-stools http://creativecommons.org/licenses/by/3.0/ Kyrodian Legends Overworld Props By Midi https://web.archive.org/web/20150319200042/http://opengameart.org/content/kyrodian-legends-overworld-props http://creativecommons.org/licenses/by/3.0/
* `missions/cyberdogs.cdogscpn/graphics/LICENSE.txt`: Images extracted from Cyberdogs By Ronny Wester http://creativecommons.org/licenses/by/3.0/
* `missions/cyberdogs.cdogscpn/graphics/chars/guns/chaingun.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `missions/cyberdogs.cdogscpn/sounds/1up.txt`: Derived from SFX: The Ultimate 2017 16 bit Mini pack By phoenix1291 https://opengameart.org/content/sfx-the-ultimate-2017-16-bit-mini-pack http://creativecommons.org/publicdomain/zero/1.0/
* `missions/harmful_crysalis.cdogscpn/graphics/box3_blink.txt`: Adapted from Sci-Fi Object Set by Janna http://opengameart.org/content/sci-fi-object-set http://creativecommons.org/publicdomain/zero/1.0/
* `missions/harmful_crysalis.cdogscpn/graphics/cryo_gun.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/
* `missions/harmful_crysalis.cdogscpn/graphics/rapidr_11x11.png.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/ Modified by Sauer2
* `missions/harmful_crysalis.cdogscpn/graphics/server_blink.txt`: Adapted from Sci-Fi Object Set by Janna http://opengameart.org/content/sci-fi-object-set http://creativecommons.org/publicdomain/zero/1.0/
* `missions/harmful_crysalis.cdogscpn/graphics/table_plastic_computer.txt`: Adapted from Tables and Stools By Jordan Irwin http://opengameart.org/content/tables-and-stools http://creativecommons.org/licenses/by/3.0/ Kyrodian Legends Overworld Props By Midi https://web.archive.org/web/20150319200042/http://opengameart.org/content/kyrodian-legends-overworld-props http://creativecommons.org/licenses/by/3.0/
* `missions/harmful_crysalis.cdogscpn/sounds/laser_burn.txt`: Adapted from Fire Loop by qubodup https://opengameart.org/content/fire-loop http://creativecommons.org/licenses/by/3.0/
* `missions/spacepirates.cdogscpn/graphics/bio_grenade.txt`: Adapted from C-Dogs data by Ronny Wester https://creativecommons.org/licenses/by/4.0/
* `missions/spacepirates.cdogscpn/graphics/rapidr_11x11.png.txt`: Adapted from 140 Military Icons Set (fixed) by AngryMeteor.com https://opengameart.org/content/140-military-icons-set-fixed http://creativecommons.org/licenses/by/3.0/ Modified by Sauer2

## Favicon

The favicon of the game's page (`web/icons/cdogs.png`, 48x48, and `web/icons/cdogs-180.png`, 180x180) is
drawn by `web/scripts/icons.py` from the game's own `graphics/logo.png` (Ronny Wester, CC BY 3.0, credited
above).
