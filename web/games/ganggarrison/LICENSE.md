# Gang Garrison 2: licence and provenance assessment

**Verdict: BLOCKED. Nothing of Gang Garrison 2 is ported or shipped.**

The code is free software: the repository is under the Mozilla Public License 2.0, which allows
commercial use and is compatible with GPL-3.0+ (MPL-2.0 §3.3, secondary licence "GNU General Public
License, Version 2.0 ... or any later versions"). The **assets are not free for our purposes**. The
game is, in its own words, "A Team Fortress 2 Demake"; its nine classes, their sprites and weapons and
several of its maps are taken from Valve's Team Fortress 2, two of its shipped music tracks are 8-bit
covers of Valve's soundtrack, and its secret class reproduces Quote/Curly from Cave Story. Those rights are not Faucet Software's to grant
under the MPL, and the game also uses Valve's "Team Fortress" trademark in its own description. The
project ships only games whose code and every asset are free for any use including commercial,
compatible with GPL-3.0+, and without trademark problems; a dependency on Valve's art or trademarks is
an explicit blocker. A 1:1 port cannot avoid that dependency, and a from-scratch replacement of the
classes, art, maps and music would no longer be a port of Gang Garrison 2.

This file is an assessment, not a licence grant. It records what was checked and why the game is not
shipped. The research notes, commands and raw comparison numbers are in `re/ganggarrison/NOTES.md`.

## 1. The reference release

* **Game:** Gang Garrison 2, version **2.9.2** (`Source/gg2/Constants.xml`: `VERSION` = `29200`,
  `GAME_VERSION_STRING` = `"v2.9.2"`; `Source/gg2/Global Game Settings.xml`: `<version>2.9.2</version>`).
* **Reference:** tag **`V2.9.2`**, commit `2bd4d139226e8d16328bf69f901274e70ebb8f5b`
  (2019-04-01, "Release preparations"), in
  <https://github.com/Gang-Garrison-2/Gang-Garrison-2>. The repository has the `V2.9.2` tag but no
  GitHub releases (the releases page is empty); the website offers 2.9.2 as the current download
  (<https://www.ganggarrison.com/downloads.html>). I also checked the current `master` commit
  `08a8c0d46ab452a77c4c8aef01d7c4194f7809ee` (2026-10-31), 66 files after the tag with the same
  version constants; `Music/`, the maps, the character sprites and the sounds are unchanged, and the
  class names and `License.txt` are unchanged, so the findings are the same at both.
* **Build:** a GameMaker 8 project split into XML (`Source/GitToGmk.bat` and `GmkToGit.bat` at the
  tag; the later master adds `Source/build.sh`, which requires GameMaker 8, `gmksplit.jar` and
  `gm8x_fix.exe` under Wine). The plan's note that later versions moved to a free engine is not
  supported by 2.9.2: the reference is the GameMaker version. This is **not itself the blocker** — a
  browser port rebuilds the engine in TypeScript, and the GML game code is MPL-2.0 — but it means the
  reference is a proprietary-engine project, not a free-engine one.
* **Size of the checked tree (tag):** 5,236 sprite PNGs (24 MB), 45 sound WAVs (4.5 MB), 8 music WAVs
  (14 MB), 22 map PNGs (1.4 MB), 955 object files and 328 GML scripts. `master` adds one object file
  and three GML scripts. `re/ganggarrison/NOTES.md` has the exact commands and counts.

## 2. The code: MPL-2.0 — passes

`License.txt` (the whole file):

> This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
> the MPL was not distributed with this file, You can obtain one at
> http://mozilla.org/MPL/2.0/.
>
> The content of the Extensions folder is covered by the licenses of the respective extensions.

`Readme.txt` (2.9.2), "Credits and Information":

> License:
> Copyright (C) 2008-2018 Faucet Software
> http://www.ganggarrison.com
>
> This game is open source under the terms of the Mozilla Public License, v. 2.0.
> If the source code has not been included along with the game, you can download it at
> http://www.ganggarrison.com.

The MPL-2.0 text in the repository (`MPL-2.0.txt`) is the Mozilla Public License 2.0. It allows
commercial use and redistribution; §1.12 defines "Secondary License" as "either the GNU General Public
License, Version 2.0, the GNU Lesser General Public License, Version 2.1, the GNU Affero General
Public License, Version 3.0, or any later versions of those licenses", and §3.3 permits distributing
the covered software under a secondary licence when it is not marked "Incompatible With Secondary
Licenses". The repository carries no Exhibit B notice, so MPL-2.0 here is GPL-3.0+-compatible (GPL
2.0-or-later is a secondary licence, and GPL-3.0 is a later version).

**Consequence for a port:** a TypeScript translation of the GML is a modified version of MPL-covered
code. It would have to keep the MPL notice and be marked as altered; that is compatible with this
project (the port can be MPL-2.0, and the combined work can be distributed under GPL-3.0+ through
§3.3). The code, as code, passes the project's test.

Third-party code in the tree:

| Path | Licence | Status |
| --- | --- | --- |
| `Source/gg2/Scripts/Faucet HTTP/**` | ISC (headers: "Copyright (c) 2013-2015, Andrea Faulds") | free; not needed in a browser port (the SDK client replaces it) |
| `Extensions/Faucet Networking*.gex` (v1.7.1 at the tag, v1.8 on master) | ISC, per `Readme.txt` ("the Faucet Networking extension by MedO, which is available under the terms of the ISC license") | Windows GameMaker extension; not shipped/needed |
| `Extensions/Faucet Forwarding V1.1.gex` | BSD / libminiupnp, per `Readme.txt` | Windows GameMaker extension; not shipped/needed |
| `Source/gg2/Included Files/7za.exe` | GNU LGPL with BSD parts (`7zip.license.txt`) | Windows binary; not shipped/needed |
| `Extensions/GG2DLL/**`, `Extensions/GG2DLLext/**` | **no licence file or header** | a code-level gap in the original; not shipped/needed (it is a libpng/zlib DLL) |
| `Source/gg2/Sprites/...`, `Sounds/...`, `Music/...`, maps | only the repository-wide MPL notice; no per-file licence | see §3: the MPL notice cannot cover third-party rights |

The `Extensions` folder is expressly excluded from the MPL notice, and `GG2DLL` has no stated licence.
That is a defect of the original, but it is not the decisive blocker: none of those Windows binaries
is needed by a browser port.

## 3. The assets: fails

### 3.1 The nine classes are Team Fortress 2's

The repository's own object and sprite names are Valve's class names:

| Source object / sprite folder | In-game name (`Scripts/Misc/classname.gml`) | TF2 class |
| --- | --- | --- |
| `Objects/Characters/Scout.xml`, `Sprites/Characters/Scout/**` | "Runner" (`CLASS_SCOUT`) | Scout |
| `Objects/Characters/Soldier.xml`, `Sprites/Characters/Soldier/**` | "Rocketman" (`CLASS_SOLDIER`) | Soldier |
| `Objects/Characters/Sniper.xml`, `Sprites/Characters/Sniper/**` | "Rifleman" (`CLASS_SNIPER`) | Sniper |
| `Objects/Characters/Demoman.xml`, `Sprites/Characters/Demoman/**` | "Detonator" (`CLASS_DEMOMAN`) | Demoman |
| `Objects/Characters/Medic.xml`, `Sprites/Characters/Medic/**` | "Healer" (`CLASS_MEDIC`) | Medic |
| `Objects/Characters/Engineer.xml`, `Sprites/Characters/Engineer/**` | "Constructor" (`CLASS_ENGINEER`) | Engineer |
| `Objects/Characters/Heavy.xml`, `Sprites/Characters/Heavy/**` | "Overweight" (`CLASS_HEAVY`) | Heavy |
| `Objects/Characters/Spy.xml`, `Sprites/Characters/Spy/**` | "Infiltrator" (`CLASS_SPY`) | Spy |
| `Objects/Characters/Pyro.xml`, `Sprites/Characters/Pyro/**` | "Firebug" (`CLASS_PYRO`) | Pyro |
| `Objects/Characters/Quote.xml`, `Sprites/Characters/Querly/**` | "Querly" (`CLASS_QUOTE`) | (Cave Story; see §3.4) |

`Scripts/Misc/initCharacterSpritePrefixes.gml` (2.9.2) lists the sprite prefixes directly:

```
global.characterSpriteClassPrefixes[CLASS_SCOUT] = "Scout";
global.characterSpriteClassPrefixes[CLASS_SOLDIER] = "Soldier";
global.characterSpriteClassPrefixes[CLASS_SNIPER] = "Sniper";
global.characterSpriteClassPrefixes[CLASS_DEMOMAN] = "Demoman";
global.characterSpriteClassPrefixes[CLASS_MEDIC] = "Medic";
global.characterSpriteClassPrefixes[CLASS_ENGINEER] = "Engineer";
global.characterSpriteClassPrefixes[CLASS_HEAVY] = "Heavy";
global.characterSpriteClassPrefixes[CLASS_SPY] = "Spy";
global.characterSpriteClassPrefixes[CLASS_PYRO] = "Pyro";
global.characterSpriteClassPrefixes[CLASS_QUOTE] = "Querly";
```

The sprite folders contain 722 PNGs: RED and BLU versions of stand, run, jump, lean, taunt, dead,
intel-carry, head and class-select frames. They are hand-drawn 8-bit renditions, credited to GG2's
artists, but they are unmistakably the TF2 characters: the Scout's cap and red shirt, the Heavy's
build and minigun, the Medic's coat, the Spy's balaclava, the Engineer's hard hat and goggles, the
Sniper's hat, the Demoman's eye patch, the Pyro's mask, the Soldier's helmet. The weapons follow the
same pattern (`Sprites/Weapons/Scattergun*`, `Rocketlauncher*`, `Minigun*`, `Medigun*`, `Revolver*`,
`Rifle*`, `Shotgun*`, `Flamethrower*`, `Minegun*`, `Blade*`).

The game says so itself:

`Readme.txt` (2.9.2), line 7:

> A Team Fortress 2 Demake

`Readme.txt` (2.9.2), "Credits and Information":

> This is a demake of Team Fortress 2 by Valve Software. All likenesses and similarities
> are intended as a respectful homage.

The official website, home page (<https://www.ganggarrison.com/>):

> Gang Garrison 2 is a free multiplayer 'demake' of Valve's Team Fortress 2. With all 9 classes, many
> different TF2-inspired environments, and fast-paced, team-based, multiplayer gameplay, GG2 is the
> premier TF2 tribute.

The official "About" page (<https://www.ganggarrison.com/about.html>):

> With all 9 classes, many different TF2-inspired environments, and fast-paced, team-based,
> multiplayer gameplay represented, GG2 is the premier TF2 tribute/parody/alternative.

> ... TF2 maps reimagined in 2D as well as a multitude of maps with all sorts of different looks and
> settings ...

**Why this blocks:** copyright protects the specific expression of a character, not the idea of a
"scout" or a "medic". A recognisable 8-bit drawing of the Scout, the Heavy, the Spy and the others is
a derivative work of Valve's character designs, even though the pixels were drawn by GG2's artists.
Faucet Software can license its own pixels, not Valve's characters. The MPL notice therefore does not
make the sprites free for commercial use. The game's own "all likenesses ... are intended as a
respectful homage" is an acknowledgement that the likenesses are Valve's.

### 3.2 The music: two shipped tracks are 8-bit covers of Valve's TF2 soundtrack

The official download page (<https://www.ganggarrison.com/downloads.html>) offers these tracks under
"Music":

* "Father of Syn - Gang Garrison II"
* "Father of Syn - Gang Garrison II (In-Game)"
* "Scoot - Gang Garrison Rocket Jump Waltz"
* "Elkondo - Petite Chou-Fleur (8-bit)"
* "Elkondo - Right Behind You (8-bit)"

The first two are GG2 originals (the "Father of Syn" tracks; Synnah is one of the credited
composers). The last three are 8-bit versions of tracks from *Team Fortress 2 Official Soundtrack*:

The TF2 Wiki (<https://wiki.teamfortress.com/wiki/Team_Fortress_2_Official_Soundtrack>) says:

> ***Team Fortress 2 Official Soundtrack*** is a soundtrack album composed by Valve sound director
> Mike Morasky and performed by the Valve Studio Orchestra.

Its track list includes:

| No. | Composer | Name | Length |
| --- | --- | --- | --- |
| 3. | Mike Morasky | Rocket Jump Waltz | 0:37 |
| 6. | Mike Morasky | Right Behind You | 1:40 |
| 7. | Mike Morasky | Petite Chou-Fleur | 1:42 |

The shipped `Music/` folder is part of the repository (the master's `Source/build.sh` copies it into
the build with `cp -r ../Music build/Music`) and contains 8 WAVs. I matched them to the site downloads
by duration and by chroma/DTW comparison (the method and the full numbers are in
`re/ganggarrison/NOTES.md`):

| File | Duration | Identification | Verdict |
| --- | --- | --- | --- |
| `Music/menumusic1.wav` | 67.4 s | "Father of Syn - Gang Garrison II" (site MP3 68.4 s; DTW 0.028) | GG2 original (Synnah); MPL notice only |
| `Music/ingamemusic.wav` | 83.5 s | "Father of Syn - Gang Garrison II (In-Game)" (site MP3 83.5 s; DTW 0.018) | GG2 original (Synnah); MPL notice only |
| `Music/menumusic2.wav` | 38.3 s | "Scoot - Gang Garrison Rocket Jump Waltz" (site MP3 38.374 s; DTW 0.044, next best 0.202) — a cover of Mike Morasky's "Rocket Jump Waltz" (0:37) | **BLOCK** |
| `Music/menumusic3.wav` | 103.4 s | "Elkondo - Petite Chou-Fleur (8-bit)" (site MP3 103.428 s; DTW 0.012, next best 0.140) — a cover of Mike Morasky's "Petite Chou-Fleur" (1:42) | **BLOCK** |
| `Music/menumusic4.wav` | 100.0 s | unidentified; no per-file credit | unknown |
| `Music/menumusic5.wav` | 100.0 s | unidentified; no per-file credit | unknown |
| `Music/menumusic6.wav` | 160.0 s | unidentified; no per-file credit | unknown |
| `Music/faucetmusic.wav` | 7.7 s | short GG2/Faucet jingle | probably original; no per-file grant |

The site also distributes "Elkondo - Right Behind You (8-bit)" (90.0 s), an 8-bit version of Mike
Morasky's "Right Behind You" (1:40). I could not match that 90 s edit to one of the two unlabelled
100.0 s WAVs, so I do not claim which file it is; the public distribution of the 8-bit cover is itself
a TF2-derived track.

**Why this blocks:** an 8-bit arrangement of "Rocket Jump Waltz" or "Petite Chou-Fleur" is a derivative
work of Mike Morasky's composition. Elkondo's and Scoot's arrangement copyright does not replace
Valve's rights in the underlying music. The MPL notice from Faucet Software cannot license Valve's
compositions. Valve's public fan-content policy is not a licence for this: its Video Policy
(<https://store.steampowered.com/video_policy>) permits non-commercial videos and says, "We're not
fine with taking assets from our games (e.g. voice, music, items) and distributing those separately."

### 3.3 The maps: several are 2D remakes of TF2 maps

The 22 PNGs in `Source/gg2/Included Files/` are GG2 maps (a PNG with a `zTXt` chunk named "Gang
Garrison 2 Level Data"; the chunk decompresses to the `{ENTITIES}`/`{WALKMASK}` text format). The
`Readme.txt` (2.9.2) lists 20 official maps with their authors. The map names and the official description
make the TF2 origin clear:

| Map | Author (README) | TF2 counterpart | Status |
| --- | --- | --- | --- |
| `ctf_2dfort.png` | Vaati | 2Fort | TF2 map remake |
| `ctf_oldfort.png` | (not in the official list) | 2Fort (older map file) | likely TF2 remake |
| `ctf_classicwell.png` | fishmatt | Well | TF2 map remake |
| `cp_egypt.png` | Tarzan | Egypt | TF2 map remake |
| `arena_lumberyard.png` | Faust | Lumberyard | TF2 map remake |
| `koth_harvest.png` | Wherewolf | Harvest | TF2 map remake |
| `ctf_avanti.png` | Teeferbone and Wareya | Avanti | TF2 map remake |
| `ctf_orange.png` | king metroid | Orange (TF2 community map style) | TF2-derived name/style; layout not compared — unclear |
| `ctf_truefort.png` | fishmatt | (2Fort-inspired name) | TF2-inspired name; layout not compared — unclear |
| `ctf_conflict.png` | agh | — | GG2 original layout |
| `ctf_waterway.png` | Taters | — | GG2 original layout |
| `cp_dirtbowl.png` | Vaati | — | GG2 original layout |
| `arena_montane.png` | Taters and agh | — | GG2 original layout |
| `gen_destroy.png` | agh | — | GG2 original layout (Generator mode is GG2's) |
| `koth_valley.png` | agh | — | GG2 original layout |
| `koth_corinth.png` | BassieEnAdrian and McGenio | — | GG2 original layout |
| `dkoth_atalia.png` | Wareya | — | GG2 original layout (DKotH is GG2's) |
| `dkoth_sixties.png` | Ozoh | — | GG2 original layout |
| `tdm_mantic.png` | Wareya | — | GG2 original layout |
| `koth_gallery.png` | Heenok | — | GG2 original layout |
| `ctf_eiger.png` | kildau | — | GG2 original layout |
| `gg_debug.png` | (test map) | — | GG2 original |

The official site states the intent: "TF2 maps reimagined in 2D as well as a multitude of maps with all
sorts of different looks and settings" (<https://www.ganggarrison.com/about.html>). The map data uses
TF2's game-mode vocabulary (`redintel`, `blueintel`, `KothControlPoint`, `CapturePoint`, `medCabinet`,
`GeneratorRed`, `GeneratorBlue`).

**Why this blocks:** a 2D reconstruction of 2Fort, Well, Egypt, Lumberyard, Harvest or Avanti
reproduces the recognisable layout of a TF2 map. The community authors' MPL grant covers their own
drawing, not the underlying TF2 map design (Valve's or the original mapper's). Shipping only the
GG2-original maps would avoid this part of the problem, but not the classes or the music.
`ctf_orange` and `ctf_truefort` are TF2-derived names whose layouts I did not compare; they are
marked "unclear" rather than "block" above.

### 3.4 The secret class: Quote/Curly from Cave Story

`Scripts/Misc/classname.gml` returns "Querly" for `CLASS_QUOTE`; `Scripts/Rewards/initRewards.gml`
says:

> // Introducing the first ever Quote/Curly class reward

and `Scripts/Gear/Gear Init/initCape.gml`:

> gearSpecClassOverlay(gearSpec, CLASS_QUOTE, -1, -1, 0); // No cape for Querly (Curly's hair gets in
> the way, among other things)

The 56 PNGs in `Sprites/Characters/Querly/` and the `CurlyHaxxyStatueS` reward are renditions of
Quote/Curly, the protagonists of *Cave Story*. *Cave Story* was developed by Daisuke "Pixel" Amaya
(<https://en.wikipedia.org/wiki/Cave_Story>), and its copyright status is not a free licence:

> Despite the freeware nature of the game's initial release, official rereleases by Nicalis (since
> taking over its publishing for major platforms) have caused ambiguity regarding the usage of
> *Cave Story*'s copyright and assets. Further confusion has been caused by cease and desist letters
> as well as DMCA actions against fan projects using the game's assets as well as its decompiled
> codebase.

GG2's `Readme.txt` even puns on it: "There is totally no secret character to speak of. None. And you
can *Quote* us on that."

**Why this blocks:** freeware is not a licence to redistribute the characters or art; there is no
grant from Amaya or Nicalis in the repository. This is an independent third-party dependency, on top
of TF2.

### 3.5 Sounds

`Source/gg2/Sounds/` has 45 WAVs (0.05–9.1 s each; 16-bit PCM, mixed 8/16/22.05/44.1/48 kHz). The
credits in `Readme.txt` are:

> Sound & Music:
> Synnah, Scoot, and Elkondo

The names are GG2's own (`BladeSnd`, `ChaingunSnd`, `FlamethrowerSnd`, `MedigunSnd`, `MinegunSnd`,
`RocketSnd`, `ShotgunSnd`, `SniperSnd`, `UberStartSnd`, `UberChargedSnd`, `UberEndSnd`, `UberIdleSnd`,
`SentryAlert`, `SentryBuildSnd`, `SentryIdle`, `DominationSnd`, `RevengeSnd`, `IntelGetSnd`, ...). I
found no evidence that any of them is a ripped TF2 sound (they are short effects, not the longer TF2
voice lines or music), and the credits attribute them to GG2's composers. But the repository gives no
per-file authorship or licence statement, so I cannot verify each one. This is a provenance gap, not
the decisive blocker; a port would still need every file cleared.

### 3.6 Fonts

`Source/gg2/Fonts/` contains only `_resources.list.xml`; there is no font file. The game uses
GameMaker's built-in font. Nothing to license here. A browser port would use a free font of its own.

### 3.7 Hats, gear and rewards

`Sprites/Alternative Sprites/` has 2,319 PNGs: Haxxy and Raybanns badges, bobble hats, a crown, a cape,
party and Xmas variants, tombstones, ghosts, and `CurlyHaxxyStatueS`. The Haxxy/Raybanns awards are
GG2's own community awards (the scripts name them), and the generic hats (top hat, monocle, crown,
party hat, cape) are GG2's own drawings. But they are drawn on the TF2-derived character rigs and
include the Cave Story statue, so they inherit the same problem. They are not independently licensed
either.

### 3.8 Backgrounds, HUD, props

`Source/gg2/Backgrounds/` (22 files), `Sprites/HUDs/` (971 PNGs, including
`PortraitAnimations/*PortraitAnimationS*` and the class/team select
screen), `Sprites/MapElements/` (128), `Sprites/InGameElements/` (250), `Sprites/GameElements/` (271),
`Sprites/Projectiles/` (37) and `Sprites/Obstacles/` (30) are GG2's own pixel art, but they depict the
TF2 HUD, class portraits, weapons, intel, control points, med cabinets and the like. The
`Backgrounds/GameElements/MenuBackground1.png` shows two of the game's characters. They are part of
the same derivative work.

### 3.9 Texts and names

The prose (`Readme.txt`, `How To Play.txt`; `master` adds `Readme.md`) is GG2's own and
MPL-licensed, but it names
"Team Fortress 2", "TF2", the nine classes' TF2 names and the TF2 game modes. The in-game renamed
classes ("Runner", "Firebug", ...) are a thin layer over the same characters; the source constants
(`CLASS_SCOUT`, `CLASS_SOLDIER`, ...), object files and sprite folders keep the TF2 names. Terms such
as "UberCharge" (GG2's "Superburst"), "Manvich" (TF2's "Sandvich"), "RED"/"BLU", "intel" and "control
point" come from TF2. Game rules as such are not copyrightable, but the names and the presentation are
part of the same dependency.

## 4. Trademark

Valve's legal page (<https://store.steampowered.com/legal/>) lists its marks:

> © 2026 Valve Corporation. All rights reserved. Valve, the Valve logo, Half-Life, the Half-Life logo,
> the Lambda logo, Steam, the Steam logo, Team Fortress, the Team Fortress logo, Opposing Force,
> Day of Defeat, the Day of Defeat logo, Counter-Strike, the Counter-Strike logo, Source, the Source
> logo, Counter-Strike: Condition Zero, Portal, the Portal logo, Dota, the Dota 2 logo, and Defense of
> the Ancients are trademarks and/or registered trademarks of Valve Corporation.

The game's own front page calls itself a "demake of Valve's Team Fortress 2", "the premier TF2
tribute", and the README's subtitle is "A Team Fortress 2 Demake". The game uses RED and BLU, the nine
TF2 classes and TF2 map names. That is not a passing nominative reference in a compatibility notice;
the TF2 identity is the product.

The project's rule is stricter than "arguably fair use": it ships only games "without trademark
problems". Even if a nominative or parody defence were available, the project does not rely on
defences; it needs a licence. There is no licence from Valve for the marks or the characters.

## 5. Why a 1:1 port cannot fix this

The porting rule is 1:1: "Same rules, numbers, timing, randomness, levels, texts, graphics, sounds,
controls and menus as the reference version" (`AGENTS.md`). A 1:1 port of Gang Garrison 2 must
reproduce the nine TF2-derived classes, their sprites, the TF2-derived maps and the 8-bit TF2 music.
Replacing those with original designs would be a different game, not a port of Gang Garrison 2. There
is no subset that is both 1:1 and free:

* Keeping the classes/art/maps → Valve's copyright in the characters and maps.
* Keeping the music → Valve's copyright in Mike Morasky's compositions.
* Keeping the secret class → Studio Pixel/Nicalis's rights in Quote/Curly.
* Keeping the "TF2 demake" branding → Valve's trademark.
* Dropping any of them → not 1:1.

A non-commercial release would not help: the project requires commercial use, and Valve's video policy
is non-commercial and still forbids distributing the assets separately. A "free fan game" is a
tolerance-based position, not a licence, and this project ships only licensed games.

The only ways forward would be a written licence from Valve for the Team Fortress 2 characters, art,
music and marks, plus a licence from Studio Pixel/Nicalis for Quote/Curly. Neither exists in the
repository, and the project does not negotiate per-game licences. **Therefore: no port, no
`game.json`, no `fetch.sh`, no screenshots, no icon, no tests.**

## 6. File-by-file assessment

Counts from the 2.9.2 tree (`find`/`du`; full commands in `re/ganggarrison/NOTES.md`):

| Path | Contents | Licence / provenance | Verdict |
| --- | --- | --- | --- |
| `License.txt` | MPL-2.0 notice; excludes `Extensions` | MPL-2.0 | code licence, passes |
| `MPL-2.0.txt` | MPL 2.0 text | MPL-2.0 | passes |
| `Source/gg2/Objects/**` (955 files at the tag) | GML objects: characters, weapons, projectiles, game modes, menus, networking | MPL-2.0; names/constants are TF2's | code passes; names are part of the TF2 dependency |
| `Source/gg2/Scripts/**` (328 GML at the tag) | GML logic: physics, damage, classes, maps, server, lobby, UI | MPL-2.0; `Scripts/Faucet HTTP/**` ISC | code passes |
| `Source/gg2/Rooms/**`, `Paths/**`, `Time Lines/**`, `Constants.xml`, `*.xml` | GameMaker resources and settings | MPL-2.0 | code passes |
| `Source/gg2/Sprites/Characters/Scout/**` (64 PNG) | RED/BLU Scout frames | GG2 art, derivative of Valve's Scout | **BLOCK** |
| `Source/gg2/Sprites/Characters/Soldier/**` (72 PNG) | RED/BLU Soldier frames | derivative of Valve's Soldier | **BLOCK** |
| `Source/gg2/Sprites/Characters/Pyro/**` (60 PNG) | RED/BLU Pyro frames | derivative of Valve's Pyro | **BLOCK** |
| `Source/gg2/Sprites/Characters/Demoman/**` (62 PNG) | RED/BLU Demoman frames | derivative of Valve's Demoman | **BLOCK** |
| `Source/gg2/Sprites/Characters/Heavy/**` (136 PNG) | RED/BLU Heavy frames, including eating | derivative of Valve's Heavy | **BLOCK** |
| `Source/gg2/Sprites/Characters/Engineer/**` (66 PNG) | RED/BLU Engineer frames | derivative of Valve's Engineer | **BLOCK** |
| `Source/gg2/Sprites/Characters/Medic/**` (64 PNG) | RED/BLU Medic frames | derivative of Valve's Medic | **BLOCK** |
| `Source/gg2/Sprites/Characters/Sniper/**` (74 PNG) | RED/BLU Sniper frames | derivative of Valve's Sniper | **BLOCK** |
| `Source/gg2/Sprites/Characters/Spy/**` (68 PNG) | RED/BLU Spy frames, backstab, disguise | derivative of Valve's Spy | **BLOCK** |
| `Source/gg2/Sprites/Characters/Querly/**` (56 PNG) | secret class | Quote/Curly from Cave Story | **BLOCK** |
| `Source/gg2/Sprites/Weapons/**` (500 PNG) | Scattergun, rocket launcher, minigun, medigun, revolver, rifle, shotgun, flamethrower, minegun, knife | GG2 art of TF2 weapons | **BLOCK** |
| `Source/gg2/Sprites/HUDs/**` (971 PNG) | HUD, class portraits, class/team select, kill icons, scoreboard, lobby, menus | GG2 art of the TF2 HUD | **BLOCK** (derivative) |
| `Source/gg2/Sprites/Alternative Sprites/**` (2,319 PNG) | Haxxy/Raybanns awards, hats, capes, party/Xmas, statues | GG2 art on TF2 rigs; includes the Curly statue | **BLOCK** (derivative) |
| `Source/gg2/Sprites/MapElements/**` (128 PNG) | intel, control points, med cabinets, spawn doors, props | GG2 art of TF2 map elements | **BLOCK** (derivative) |
| `Source/gg2/Sprites/Projectiles/**` (37 PNG) | rockets, mines, needles, flares, bullets | GG2 art | derivative of TF2 weapons; part of the same work |
| `Source/gg2/Sprites/InGameElements/**` (250 PNG) | effects, notifications, particles | GG2 art | part of the same work |
| `Source/gg2/Sprites/GameElements/**` (271 PNG) | menus, lobby, splash | GG2 art | part of the same work |
| `Source/gg2/Sprites/Obstacles/**` (30 PNG) | map obstacles | GG2 art | part of the same work |
| `Source/gg2/Sprites/Updater/**` (3 PNG), `DevMessagesCheckerS` (4 PNG) | updater/debug | GG2 art | not needed |
| `Source/gg2/Backgrounds/**` (22 files) | menu/splash/updater backgrounds | GG2 art; one shows the characters | part of the same work |
| `Source/gg2/Sounds/**` (45 WAV) | weapon, class, HUD and game-mode effects | credited to Synnah/Scoot/Elkondo; no per-file licence | provenance gap; not the decisive blocker |
| `Music/faucetmusic.wav` | 7.7 s jingle | GG2/Faucet | probably original; no per-file grant |
| `Music/menumusic1.wav` | 67.4 s | "Father of Syn" (Synnah) | original; MPL notice only |
| `Music/ingamemusic.wav` | 83.5 s | "Father of Syn (In-Game)" (Synnah) | original; MPL notice only |
| `Music/menumusic2.wav` | 38.3 s | 8-bit "Rocket Jump Waltz" (Mike Morasky) | **BLOCK** |
| `Music/menumusic3.wav` | 103.4 s | 8-bit "Petite Chou-Fleur" (Mike Morasky) | **BLOCK** |
| `Music/menumusic4.wav` | 100.0 s | unidentified | unknown; needs provenance |
| `Music/menumusic5.wav` | 100.0 s | unidentified | unknown; needs provenance |
| `Music/menumusic6.wav` | 160.0 s | unidentified | unknown; needs provenance |
| `Source/gg2/Included Files/ctf_2dfort.png` | map | 2Fort remake | **BLOCK** |
| `Source/gg2/Included Files/ctf_oldfort.png` | map | 2Fort-derived name; older map file | likely TF2 remake |
| `Source/gg2/Included Files/ctf_classicwell.png` | map | Well remake | **BLOCK** |
| `Source/gg2/Included Files/cp_egypt.png` | map | Egypt remake | **BLOCK** |
| `Source/gg2/Included Files/arena_lumberyard.png` | map | Lumberyard remake | **BLOCK** |
| `Source/gg2/Included Files/koth_harvest.png` | map | Harvest remake | **BLOCK** |
| `Source/gg2/Included Files/ctf_avanti.png` | map | Avanti remake | **BLOCK** |
| `Source/gg2/Included Files/ctf_orange.png` | map | Orange-style name; layout not individually compared | unclear |
| `Source/gg2/Included Files/ctf_truefort.png` | map | 2Fort-inspired name; layout not individually compared | unclear |
| `Source/gg2/Included Files/ctf_conflict.png` | map | GG2 original | OK if the map data is MPL (it is) |
| `Source/gg2/Included Files/ctf_waterway.png` | map | GG2 original | OK |
| `Source/gg2/Included Files/cp_dirtbowl.png` | map | GG2 original | OK |
| `Source/gg2/Included Files/arena_montane.png` | map | GG2 original | OK |
| `Source/gg2/Included Files/gen_destroy.png` | map | GG2 original (Generator) | OK |
| `Source/gg2/Included Files/koth_valley.png` | map | GG2 original | OK |
| `Source/gg2/Included Files/koth_corinth.png` | map | GG2 original | OK |
| `Source/gg2/Included Files/dkoth_atalia.png` | map | GG2 original (DKotH) | OK |
| `Source/gg2/Included Files/dkoth_sixties.png` | map | GG2 original (DKotH) | OK |
| `Source/gg2/Included Files/tdm_mantic.png` | map | GG2 original | OK |
| `Source/gg2/Included Files/koth_gallery.png` | map | GG2 original | OK |
| `Source/gg2/Included Files/ctf_eiger.png` | map | GG2 original | OK |
| `Source/gg2/Included Files/gg_debug.png` | test map | GG2 original | not needed |
| `Source/gg2/Fonts/_resources.list.xml` | empty font list | no font shipped | nothing to license |
| `Source/gg2/Included Files/7za.exe` | 7-Zip binary | LGPL + BSD | free, not needed |
| `Extensions/*.gex`, `Extensions/GG2DLL*` | GameMaker extensions | ISC/BSD, except GG2DLL (no licence) | not needed in a browser port; GG2DLL is a gap |
| `Source/gg2/game icon.ico`, `Source/gg2/loading image.png` | GG2 icon/loading art | GG2 art (MPL at best) | not needed for the blocked port |
| `Readme.txt`, `How To Play.txt`, `sampleMapRotation.txt` (master adds `Readme.md`) | GG2 prose | MPL-2.0 | text OK; names TF2 |
| `7zip.license.txt`, `miniupnp.license.txt` | third-party licences | LGPL/BSD | free |

## 7. Sources

* Repository: <https://github.com/Gang-Garrison-2/Gang-Garrison-2> — tag `V2.9.2`
  (`2bd4d139226e8d16328bf69f901274e70ebb8f5b`, 2019-04-01) and current `master`
  (`08a8c0d46ab452a77c4c8aef01d7c4194f7809ee`, 2026-10-31); `License.txt`, `Readme.txt`,
  `MPL-2.0.txt`, `Source/gg2/Constants.xml`, `Source/gg2/Scripts/Misc/classname.gml`,
  `Source/gg2/Scripts/Misc/initCharacterSpritePrefixes.gml`,
  `Source/gg2/Scripts/Rewards/initRewards.gml`, `Source/gg2/Scripts/Gear/Gear Init/initCape.gml`.
* Assets repository (music, original format): <https://github.com/Gang-Garrison-2/Gang-Garrison-2-Assets>.
* Official website: <https://www.ganggarrison.com/> (home), <https://www.ganggarrison.com/about.html>,
  <https://www.ganggarrison.com/downloads.html>.
* MPL 2.0: <https://www.mozilla.org/en-US/MPL/2.0/> and the repository's `MPL-2.0.txt`.
* Valve legal/trademark page: <https://store.steampowered.com/legal/>.
* Valve Video Policy: <https://store.steampowered.com/video_policy>.
* *Team Fortress 2 Official Soundtrack*: <https://wiki.teamfortress.com/wiki/Team_Fortress_2_Official_Soundtrack>;
  the individual track pages for "Rocket Jump Waltz", "Right Behind You" and "Petite Chou-Fleur".
* *Cave Story*: <https://en.wikipedia.org/wiki/Cave_Story> (developer Studio Pixel / Daisuke "Pixel"
  Amaya; the "Legal issues" section quotes the Nicalis take-downs).
* Faucet Networking: <https://github.com/Medo42/Faucet-Networking-Extension> (ISC).
* Faucet HTTP: <https://github.com/TazeTSchnitzel/Faucet-HTTP-Extension> (ISC).
* Faucet Forwarding: <https://github.com/nagn/Faucet-Forwarding> (BSD/miniupnp).

## 8. Conclusion

**BLOCKED.** Gang Garrison 2 2.9.2 is a free-software *codebase* wrapped around a Team Fortress 2
demake: Valve's nine classes and their visual designs, TF2 map designs, Valve's music (two shipped
8-bit covers), Valve's "Team Fortress" mark, plus Cave Story's Quote/Curly. The MPL-2.0 grant covers
Faucet Software's code and its artists' original pixels, not the third-party rights the game depends
on. The project's rule — every asset free for any use including commercial, GPL-3.0+-compatible, and
without trademark problems — is not met, and a 1:1 port cannot meet it. Nothing was ported; nothing
from the original is shipped.
