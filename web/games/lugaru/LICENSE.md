# Lugaru: license assessment — **blocked, not ported**

**Verdict: this game is a licensing blocker.** The engine code is free software under the GNU General
Public License, version 2 or (at your option) any later version, and would be compatible with the
website's GPL-3.0-or-later. The game data is the problem. Wolfire's own 2010 release terms allowed the
data to be redistributed **only for non-commercial purposes** and forbade **"any revenue generating
works"**. In 2016 Wolfire's David Rosen relicensed the Wolfire assets under **CC BY-SA 3.0**, which
does allow commercial use, but CC BY-SA 3.0 is **not compatible with GPL-3.0+**: Creative Commons
designated only CC BY-SA 4.0 as one-way GPLv3-compatible, and no non-CC license has been designated
compatible with CC BY-SA 3.0. The ticket's rule is that the code and **every asset** must be free for
commercial use **and** GPL-3.0+-compatible; the data fails the second condition. Several files also
have no clear license in the repository (the console font, the music's provenance, community textures
derived from a non-GPL font), which a 1:1 port cannot resolve from the repository alone.

Nothing was ported: this folder holds this assessment and an unlisted `game.json` stub only. The
assessment was made on 2026-11-20 from the pinned reference below. The exact commands, hashes and the
complete file inventory are in `re/lugaru/NOTES.md`.

## The reference

* **Game:** *Lugaru: The Rabbit's Foot* (Wolfire Games, first released 2005; *Lugaru HD* in 2010), a
  third-person 3D martial-arts action game by David Rosen, with rabbits and wolves, context-sensitive
  attacks, reversals and counter-reversals.
* **Reference version:** the official open-source tree **`WolfireGames/lugaru`**, branch `master`,
  commit `6a58b62858d9c3c3630abf00bf43075f65a09d38` (2020-09-29, “CI: Bump oldgcc build to CentOS 8”),
  CMake version **1.3.0-dev** (`CMakeLists.txt`: `LUGARU_VERSION_MAJOR 1`, `MINOR 3`, `PATCH 0`,
  suffix `-dev`). The same tree is the upstream of the OSS Lugaru project
  (<https://gitlab.com/osslugaru/lugaru>); the stable 1.2 release was 2017-02-11.
* **Repository:** <https://github.com/WolfireGames/lugaru>. The working clone used for this assessment
  is `/tmp/opencode/lugaru-src` (outside the repository; nothing of it is committed).
* **What it contains:** `Source/` (the C++ engine, 1,521,617 bytes), `Data/` (the complete game data,
  39,530,757 bytes, **542 files**), `Dist/`, `Docs/`, `Misc/`, `COPYING.txt`, `CONTENT-LICENSE.txt`,
  `AUTHORS`, `README.md`.
* **License files:** `COPYING.txt` (GNU GPL version 2, SHA-256
  `8177f97513213526df2cf6184d8ff986c675afb514d4e68a404010521b880643`), `CONTENT-LICENSE.txt`
  (SHA-256 `df020520630390de59394235a90a17c5d52d3b80ef76e2edf6d0690cd8b7fd7c`), `README.md`
  (SHA-256 `6f88ac4cd80534cb34effc8579ac1db2a5ab62c27e644de2deaf1eabe32d9273`).

## The code: GPL-2.0-or-later

Every engine source file starts with the same grant:

> Lugaru is free software; you can redistribute it and/or modify
> it under the terms of the GNU General Public License as published by
> the Free Software Foundation; either version 2 of the License, or
> (at your option) any later version.

`Source/main.cpp` prints it as “Licensed under the GPL 2.0+ and CC-BY-SA 3.0 and 4.0 licenses.” The
`COPYING.txt` is the GPL version 2 text. **GPL-2.0-or-later is compatible with the website's
GPL-3.0-or-later**, so the code is not the blocker.

The only third-party source file is `Source/Thirdparty/optionparser.h` (The Lean Mean C++ Option
Parser, Copyright (C) 2012 Matthias S. Benkmann), under an MIT-style permission notice (“to deal in
the Software without restriction … and/or sell copies”). It is GPL-compatible and is not a blocker.
The port would not ship the C++ code; it would translate the game rules into TypeScript.

## The data: the decisive point

### 2010–2016: the historic Lugaru data license was non-commercial

The 2010 open-sourcing announcement says, in its own words:

> The game assets are included in the snapshot, and can be redistributed for free, but cannot be
> resold without our permission.

and, in the details:

> Please note that the game data is not under the GPL, and forbids commercial redistribution.

The 2010 `CONTENT-LICENSE.txt` (commit `255ef22`, 2010-05-12) was explicit:

> All game assets and demo data (should all be in "Data" folder
> in the root of the source tree) are not under the same license
> as the engine code. Wolfire has allowed the data to be freely redistributed
> for non commercial purposes, but it is forbidden to use in any revenue
> generating works.

This is a **NonCommercial** term: free redistribution, but no commercial use. Under the ticket's rule
it is a blocker on its own. It is also why the early open-source community could not simply ship the
game data under the GPL, and why the project later had to replace or relicense assets.

### 2016: Wolfire relicensed the Wolfire assets to CC BY-SA 3.0

On **2016-11-21**, David Rosen (Wolfire Games, `<david@wolfire.com>`, GitHub `David20321`) committed
`51203b531b2054a8a7c40356e2108a5ec7b9f366` to the official repository:

> Relicensing all Wolfire Lugaru assets to CC-BY-SA 3.0

The current `CONTENT-LICENSE.txt` says:

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

This is a valid grant by the rights holder and **supersedes the historic non-commercial term for the
Wolfire-owned assets**. CC BY-SA 3.0 permits commercial use, modification and redistribution, provided
the attribution and ShareAlike terms are met. So the data is no longer NC or ND. But it is still not
GPL-3.0-compatible, which is the second half of the ticket's condition:

> Your contributions to adaptations of BY-SA 3.0 materials may only be licensed under:
> BY-SA 3.0, or a later version of the BY-SA license. … Currently, **no non-CC licenses have been
> designated as compatible with BY-SA 3.0**.
>
> — Creative Commons, “Compatible Licenses”, <https://creativecommons.org/share-your-work/licensing-considerations/compatible-licenses/>

And GPLv3 compatibility is a 4.0-only, one-way mechanism:

> **GPLv3** … was declared a “BY-SA–Compatible License” for version **4.0** on 8 October 2015. Note
> that compatibility with the GPLv3 is one-way only …

CC BY-SA 3.0 has no “or later” clause in Wolfire's grant and no GPLv3 compatibility. The bulk of the
game data is therefore under a license that is free for commercial use but **not compatible with
GPL-3.0+**, which the ticket makes a blocker. A port could not honestly call the combined work
GPL-3.0-or-later.

### The data, package by package

The table classifies all 542 files of `Data/`. “Wolfire 3.0” means the blanket Wolfire CC-BY-SA 3.0
grant above; the other rows are the exceptions named in `CONTENT-LICENSE.txt`, plus the files whose
provenance is discussed in the next section.

| Package | Files | Author / source | License | Shipped by a port? |
| --- | ---: | --- | --- | --- |
| `Data/Animations/` | 109 | Wolfire (David Rosen) | **CC-BY-SA 3.0** | yes, if ported |
| `Data/Campaigns/main.txt` | 1 | Wolfire | **CC-BY-SA 3.0** | yes |
| `Data/Campaigns/temple.txt` | 1 | Slib, *Temple* campaign | **CC-BY-SA 3.0** | yes |
| `Data/Campaigns/empire.txt` | 1 | Jendraz, *Empire* campaign | **CC-BY-SA 4.0** | yes |
| `Data/Campaigns/seventasks.txt` | 1 | Philtron R. (skraeling), *Seven Tasks* | **CC-BY-SA 4.0** | yes |
| `Data/Dialogues/` | 43 | Wolfire; the campaign dialogue texts | **CC-BY-SA 3.0** | yes |
| `Data/Maps/Lugaru*.json` (31), `map*.json` (14), `tutorial.json` (1) | 46 | Wolfire; converted from the original binary maps to JSON by Côme Chilliet (2018), a derivative | **CC-BY-SA 3.0** | yes |
| `Data/Maps/sven*.json` | 32 | Slib, *Temple* campaign | **CC-BY-SA 3.0** | yes |
| `Data/Maps/jendraz*.json` | 41 | Jendraz, *Empire* campaign | **CC-BY-SA 4.0** | yes |
| `Data/Maps/task*.json` | 18 | Philtron R., *Seven Tasks* | **CC-BY-SA 4.0** | yes |
| `Data/Models/` | 37 | Wolfire; `.solid` models | **CC-BY-SA 3.0** | yes |
| `Data/Skeleton/` | 5 | Wolfire; skeleton and animation data | **CC-BY-SA 3.0** | yes |
| `Data/Sounds/` | 71 | Wolfire; effects, ambience and the five music tracks | **CC-BY-SA 3.0** (see the music note) | yes |
| `Data/Textures/` | 136 | Wolfire, except the exceptions below | **CC-BY-SA 3.0** | mostly |
| `Data/Textures/ClFeng.png`, `ClHuo.png`, `ClShan.png`, `ClShui.png` | 4 | OSS Lugaru (Rémi Verschelde), self-made replacements for Temple assets | **CC-BY-SA 4.0** | yes, if the Temple campaign is used |
| `Data/Textures/DesertCl.png`, `GiTop.png`, `GiTeared.png`, `GiBottom.png`, `Mask.png`, `temple/World.png` | 6 | Slib, *Temple* campaign | **CC-BY-SA 3.0** | yes, if the Temple campaign is used |
| `Data/Textures/empire/World.png` | 1 | Jendraz, *Empire* campaign (the commit says “campaign, maps and custom textures”) | **CC-BY-SA 4.0**; the file is missing from the Jendraz list in `CONTENT-LICENSE.txt` | yes, if the Empire campaign is used |
| `Data/Textures/FontMono.png` | 1 | Rémi Verschelde, a bitmap of **Liberation Mono** generated with CBFG | **SIL OFL 1.1** (not in `CONTENT-LICENSE.txt`) | no: console/devtool font; the port can omit it |
| `Data/Textures/Fur2.png` | 1 | restored Lugaru HD black-fur texture (commit `9b37fdb`, “Restore Ash's black fur as intended by the author”) | **CC-BY-SA 3.0** as a Wolfire HD asset; not separately listed | yes |
| all other `Data/Textures/` files (skyboxes, fonts, fur, clothing, weapons, UI, logos) | 123 | Wolfire | **CC-BY-SA 3.0** | yes |
| **total** | **542** | | | |

The `Data/Textures/` row is the directory total; the six rows below it partition those 136 files
(123 + 4 + 6 + 1 + 1 + 1 = 136), so they are not additional files. The counts add up:
109 + 4 + 43 + 137 + 37 + 5 + 71 + 136 = 542. The 137 maps are 31 `Lugaru*` +
14 `map*` + 1 `tutorial` + 32 `sven*` + 41 `jendraz*` + 18 `task*`. The 136 textures are 116 at the
top level plus 20 in the three skybox folders (18), `temple/` (1) and `empire/` (1).

The `CONTENT-LICENSE.txt` has two path typos: it names `Data/Campaign/temple.txt` and
`Data/Campaign/seventasks.txt`, while the files are `Data/Campaigns/temple.txt` and
`Data/Campaigns/seventasks.txt`. The intent is unambiguous, but the file is not a precise per-file
inventory.

## Files whose license is not clear from the repository

These are secondary to the CC-BY-SA 3.0 blocker, but they are why a port could not simply “use the
data under CC BY-SA 3.0 and attribute Wolfire” without further work.

### The console font

`Data/Textures/FontMono.png` (31,260 bytes, SHA-256
`33d5ae38106fd15a727f17922a45446e6c5707b7ef0fd3f75e7748eca75bfb28`) was added in commit `8e4c49c`
(2017-01-03):

> The font used is Libration Mono with height 32 and some antialiasing. Bitmap font generated with
> CBFG. Liberation Mono is under the SIL Open Font License version 1.1.

Liberation Mono is under the **SIL Open Font License 1.1**, which permits commercial use but is not
GPL-compatible. The file is not listed in `CONTENT-LICENSE.txt`; the blanket “all files in `Data` are
Wolfire CC-BY-SA 3.0” statement is factually wrong for it. The port could omit the developer console
and this font, but then it is not shipping every asset of the original.

### The community Temple textures

`Data/Textures/ClFeng.png`, `ClHuo.png`, `ClShan.png` and `ClShui.png` are released as CC-BY-SA 4.0
(GPLv3-compatible), but commit `5bba986` says they were made with the **AR PL UKai TW** font under the
**Arphic Public License**. The Arphic license is a copyleft font license that the project has already
treated as not GPL-compatible in another port (Pingus). Whether the rendered glyph bitmaps are
derivatives of the font is a question the repository does not answer. They are only needed for the
optional Temple campaign; the main campaign does not use them.

### The music

`Data/Sounds/Music1Desert.ogg`, `Music1Grass.ogg`, `Music1Snow.ogg`, `Music2.ogg` and `Music3.ogg`
(5 files, 2,267,735 bytes, 206.7 seconds) are covered only by the blanket Wolfire CC-BY-SA 3.0
statement. The files themselves carry no composer credit; their Vorbis comments say:

| File | Duration | Embedded title / comment |
| --- | ---: | --- |
| `Music1Desert.ogg` | 32.05 s | `title = -Mistic Sun.mp3.AIFF`, `transcoded = mp3;64` |
| `Music1Grass.ogg` | 40.15 s | `title = ... Barren Wastelands`, `transcoded = mp3;64` |
| `Music1Snow.ogg` | 63.50 s | `title = music1`, `transcoded = mp3;64` |
| `Music2.ogg` | 28.47 s | `transcoded = mp3;160` |
| `Music3.ogg` | 42.48 s | `title = music3`, `transcoded = mp3;64` |

The titles “Mistic Sun” and “Barren Wastelands” and the MP3 transcode tags suggest production-library or
third-party source tracks, not compositions documented as Wolfire's. Wolfire's 2016 blanket relicensing
is the only evidence that they are covered; the original game's credits (not in this repository) would
be needed to confirm the composer and the rights. This is a provenance gap, not a proven NC term, but it
is another reason the data cannot be cleared from the repository alone.

### The HD texture pack

`CONTENT-LICENSE.txt` says the grant includes “Lugaru HD assets”. The HD texture pack was made by
**Tim Soret** and later included in Lugaru HD by Wolfire. The repository contains no separate permission
from Soret; it relies on Wolfire's statement that all HD assets are covered. If a port used the HD
textures, this would need confirmation. The base game's own textures (the 2005 set) are Wolfire's.

## What would unblock it

One of these is needed:

1. **A GPL-3.0-compatible grant for the data.** A written statement from Wolfire Games (and the other
   rights holders: Slib, Jendraz, Philtron R., and the music's composer if it is not Wolfire's) that the
   `Data/` files are licensed under **CC BY-SA 4.0** (one-way GPLv3-compatible), **GPL-3.0-or-later**,
   **CC0**, or another GPL-3.0-compatible license. The 2016 grant is CC BY-SA 3.0 only; it cannot be
   upgraded unilaterally.
2. **A complete free-data replacement** under GPL-3.0-compatible terms. The OSS Lugaru project's
   replacements are CC-BY-SA 4.0, but they are only a handful of textures and campaigns; the models,
   animations, sounds, main maps, dialogues and textures are still 3.0. No complete GPL-3.0-compatible
   data set was found.
3. **A project decision that separately-licensed CC-BY-SA 3.0 data is acceptable**, as some other ports
   here do with unchanged CC-BY-SA 3.0 data (Teeworlds, C-Dogs, Tux Math). That would override the
   ticket's “GPL-3.0+” condition for this game. It would still require: attribution to Wolfire Games and
   the campaign authors, ShareAlike for modified data, exclusion or clearing of `FontMono.png` and the
   AR PL UKai-derived textures, and resolution of the music's provenance. This is a human licensing
   decision, not one a port can make.

## What was checked, and how

The full command log and hashes are in `re/lugaru/NOTES.md`. In short:

```sh
mkdir -p /tmp/opencode && cd /tmp/opencode
git clone --depth 1 https://github.com/WolfireGames/lugaru lugaru-src
cd lugaru-src
git fetch --unshallow
git rev-parse HEAD                       # 6a58b62858d9c3c3630abf00bf43075f65a09d38
git show 51203b5 --format=fuller         # the 2016 relicensing by David Rosen
git show 255ef22:CONTENT-LICENSE.txt     # the 2010 non-commercial terms
git log --follow -- CONTENT-LICENSE.txt  # 255ef22 → c11d380 → 51203b5 → …
find Data -type f | wc -l                # 542
du -sb Data                              # 39,530,757
sha256sum CONTENT-LICENSE.txt COPYING.txt Data/Textures/FontMono.png \
  Data/Textures/ClFeng.png Data/Sounds/Music1Grass.ogg
ffprobe -hide_banner Data/Sounds/Music1Grass.ogg   # title/comment metadata
```

Every file of `Data/` was classified by package and by the exceptions named in `CONTENT-LICENSE.txt`;
the exceptions were checked against the commit that added them. The source headers were checked file by
file for the GPL grant; the only non-GPL source file is the MIT-licensed `optionparser.h`. No build or
run was needed for the license decision, and none was made: there is no port to compare against.

## Repository housekeeping

* `web/games/lugaru/game.json` is an unlisted (`"listed": false`) stub with no `src/index.ts`, no
  screenshots and no assets. It exists only so `web/test/catalog.test.ts` (which requires a valid
  `game.json` in every game folder) stays green. The game page shows the caveat and is not in the list.
* No original archive, data file or extracted asset is committed. The clone is in
  `/tmp/opencode/lugaru-src`.
* `re/lugaru/NOTES.md` holds the reproducible evidence and is not in `web/scripts/source-paths.mjs`:
  there is no port, so nothing from it is published (the same arrangement as the blocked Cart Life
  assessment).
