# Lugaru: license and credits

**Approved by the operator on 2026-11-21 — variant B.** The game code is **GPL-2.0-or-later**; the
port's code is **GPL-3.0-or-later**; the Wolfire game data is **CC BY-SA 3.0**, shipped as a
separate work beside the code (aggregation), not relicensed under the GPL. The operator's decision
is recorded in `docs/SPIELEPLAN.md` (commit `374cdbba`, “Lugaru is approved (variant B: no music, no
Temple campaign, no font, no HD pack)”). This port follows that decision.

The data is the original's, copied unchanged (or converted losslessly to JSON metadata) by
`re/lugaru/fetch.sh` and `re/lugaru/tools/assets.py`. Nothing in `assets/` is taken from the
commercial Lugaru HD package beyond the base files in the pinned open-source tree. There is no
NonCommercial or NoDerivatives term in what is shipped.

## The reference

* **Game:** *Lugaru: The Rabbit's Foot* (Wolfire Games, 2005; *Lugaru HD*, 2010).
* **Reference version:** `WolfireGames/lugaru`, branch `master`, commit
  `6a58b62858d9c3c3630abf00bf43075f65a09d38` (2020-09-29), CMake **1.3.0-dev**. The archive is
  `https://codeload.github.com/WolfireGames/lugaru/tar.gz/6a58b62858d9c3c3630abf00bf43075f65a09d38`,
  36,004,161 bytes, SHA-256
  `40cddfc07e81e8c37ea770dce75e51565a56c3cb43de610b1ee0532e0de2282d`. It is downloaded by
  `re/lugaru/fetch.sh` into `re/lugaru/orig/` (gitignored) and never committed.
* **License files in the reference:** `COPYING.txt` (GNU GPL v2), `CONTENT-LICENSE.txt` (asset
  licenses), `README.md`, the GPL headers in `Source/*`, and the commit history used below.

## The code: GPL-2.0-or-later

Every engine source file starts with:

> Lugaru is free software; you can redistribute it and/or modify
> it under the terms of the GNU General Public License as published by
> the Free Software Foundation; either version 2 of the License, or
> (at your option) any later version.

`Source/main.cpp` prints “Licensed under the GPL 2.0+ and CC-BY-SA 3.0 and 4.0 licenses.” The only
non-GPL source file is `Source/Thirdparty/optionparser.h` (The Lean Mean C++ Option Parser,
Copyright (C) 2012 Matthias S. Benkmann; MIT-style permission notice, GPL-compatible). The port
does not ship or translate the C++ code; it is a new TypeScript implementation of the game rules.

## The data: Wolfire CC BY-SA 3.0

### Current grant

`CONTENT-LICENSE.txt` at the reference commit says:

> ## Wolfire assets (CC-BY-SA 3.0 Unported)
>
> All assets from the original Lugaru game (including Lugaru HD assets)
> are distributed under the Creative Commons Attribution-Share Alike license
> in version 3.0 Unported (CC-BY-SA 3.0 Unported):
> http://creativecommons.org/licenses/by-sa/3.0/
>
> Attribution to Wolfire Games: http://www.wolfire.com
>
> Those assets are all the files in the `Data` folder, except from the
> ones listed below with different licenses or credits.

The grant comes from Wolfire itself: on **2016-11-21** David Rosen
(`<david@wolfire.com>`, Wolfire Games) committed
`51203b531b2054a8a7c40356e2108a5ec7b9f366` — *“Relicensing all Wolfire Lugaru assets to CC-BY-SA
3.0.”* It supersedes the earlier non-commercial terms for the Wolfire-owned assets. CC BY-SA 3.0
allows commercial use, modification and redistribution with attribution and ShareAlike.

### The historic terms (for the record)

The 2010 release said the assets *“can be redistributed for free, but cannot be resold without our
permission”* and *“the game data is not under the GPL, and forbids commercial redistribution”*
(Wolfire blog, 2010-05-11). The 2010 `CONTENT-LICENSE.txt` said:

> Wolfire has allowed the data to be freely redistributed for non commercial purposes, but it is
> forbidden to use in any revenue generating works.

Those terms were replaced by the 2016 CC BY-SA 3.0 grant above. The operator's variant-B decision
is what lets this site ship the CC BY-SA 3.0 data as a separate work: **code and data are
aggregated, not combined**; the data is not relicensed under the GPL. CC BY-SA 3.0 is not
GPL-3.0-compatible for adaptations, so the two licenses stay separate and the data keeps its own
attribution/ShareAlike terms.

### What is shipped

Everything below is unchanged from `Data/` (or a lossless conversion) and **CC BY-SA 3.0**,
attributed to **Wolfire Games** (`http://www.wolfire.com`). The port ships the base 2005 set; the
largest terrain textures are 1024×1024 and the character skins 512×512. No separate 2048 HD pack is
present or copied.

| Assets | Files | Notes |
| --- | ---: | --- |
| `assets/Models/*.solid` | 37 | Body, Wolf, BodyLow, WolfLow, Box, Rock, TreeTrunk, Leaves, Bush, Sword, Staff, ThrowingKnife, Belt, … |
| `assets/Skeleton/*` | 5 | BasicFigure, BasicFigureLow, BasicFigureWolf, BasicFigureWolfLow, RabbitBelt |
| `assets/Animations/*` | 109 | 110 loadable animation ids from `Animation.def` (frontflipanim reuses Flip) |
| `assets/Textures/**` | 124 | terrain, skyboxes, fur, clothing, weapons, UI, logo, all base-set textures |
| `assets/Sounds/*.ogg` | 66 | footsteps, impacts, weapons, animals, ambience; **no music** |
| `assets/Maps/Lugaru*.json`, `map*.json`, `tutorial.json` | 46 | the Wolfire main campaign (27), challenge maps (14) and tutorial |
| `assets/Campaigns/main.txt` | 1 | the 27-level campaign definition |
| `assets/Dialogues/*.txt` | 43 | the original dialogue texts |
| `assets/HeightMap.png` | 1 | the 256×256 terrain heightmap |
| generated metadata | 4 | `heightmap.json` (red channel in the original indexing), `animations.json` (Animation.def), `campaign.json` (main.txt), `manifest.json` |

Total: **435 data files, 34,052,842 bytes** in `web/games/lugaru/assets/` (the manifest records
each file and size; the directory also holds `manifest.json` itself). The original files are copied byte for byte; the four generated JSON files are
lossless conversions of the original PNG, `Animation.def` and `main.txt` (they add no new game
content).

### Deliberately not shipped (variant B)

* **Music:** `Data/Sounds/Music1Desert.ogg`, `Music1Grass.ogg`, `Music1Snow.ogg`, `Music2.ogg`,
  `Music3.ogg`. Their provenance is undocumented in the reference (embedded titles/MP3 transcode
  comments, no composer credit); the operator decided not to ship them. The game runs without music.
* **Temple campaign:** `Data/Campaigns/temple.txt`, `Data/Maps/sven*`, `Data/Textures/DesertCl.png`,
  `GiTop.png`, `GiTeared.png`, `GiBottom.png`, `Mask.png`, `temple/World.png`, and the four
  `Data/Textures/ClFeng.png`, `ClHuo.png`, `ClShan.png`, `ClShui.png` made with the AR PL UKai font
  (Arphic Public License). The port contains the Wolfire main campaign only.
* **Console font:** `Data/Textures/FontMono.png`, a bitmap of Liberation Mono under the SIL Open
  Font License 1.1. The port has no console; any console text would use a browser font.
* **HD texture pack:** no separate 2048 HD pack is copied. If the reference tree were found to mix
  HD-only files, they would have to be excluded; the tree used here contains the base set only
  (the `Fur2.png` added in the OSS tree is the base black-fur texture restored by the project).
* **Community campaigns:** Empire (Jendraz) and Seven Tasks (Philtron R.) are not copied. Their
  licenses (CC BY-SA 4.0) are compatible with the Wolfire set but they are outside the operator's
  “original Wolfire campaign(s) only” scope.

No `Cl*.png`, `FontMono.png`, `Music*.ogg`, `sven*`, `jendraz*`, `task*`, `temple/` or `empire/`
file is in `assets/`; `re/lugaru/tools/assets.py` checks this after copying.

## The port's code

The TypeScript in `web/games/lugaru/src/`, the tests and the tools in `re/lugaru/` are by the
freegames project and are licensed **GPL-3.0-or-later**, the website's license (`web/LICENSE.md`).
The port is altered source, not the original program. It combines with the website/SDK under the
GPL-3.0+ terms; the CC BY-SA 3.0 data stays separate and keeps its own license.

## Favicon

`web/icons/lugaru.png` (48×48) and `web/icons/lugaru-180.png` (180×180) are drawn by
`web/scripts/icons.py` (`i_lugaru`) from the game's own red/gold `Lugaru HD` logo,
`Data/Textures/Lugaru.png` (Wolfire, **CC BY-SA 3.0**), cropped to the “L” on a dark ember tile.
They are an adaptation of that artwork and stay under **CC BY-SA 3.0**, attributed to Wolfire Games.

## How the license was checked

The full command log, hashes and file inventory are in `re/lugaru/NOTES.md`. In short: the pinned
tree was cloned, `CONTENT-LICENSE.txt` and the 2010/2016 commits were read, every file group in
`Data/` was classified against the blanket Wolfire grant and the exception lists, and the
CC BY-SA 3.0 compatibility statement was checked at
<https://creativecommons.org/share-your-work/licensing-considerations/compatible-licenses/> (only
CC BY-SA 4.0 is one-way GPLv3-compatible; CC BY-SA 3.0 is not). The operator's decision resolves
that by treating the data as a separate work. No original archive or extracted asset is committed
outside the `assets/` copies listed above.
