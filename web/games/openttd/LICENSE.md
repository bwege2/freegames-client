# OpenTTD: license and credits

This port is made from **OpenTTD 15.3** (2026-04-04), the latest stable release, with the three free
base sets the project distributes for it:

| Package | Version | Files | License |
| --- | --- | --- | --- |
| OpenTTD (code, texts, its own base graphics `media/baseset/openttd.grf`, fonts) | 15.3 | `openttd-15.3-source.tar.xz`, 8,531,992 bytes, SHA-256 `5ea21eea7d59c78a42071924ac18c6bc0116088f2e96b14cfee9369175973be7` | **GPL-2.0-only** |
| OpenGFX (base graphics) | 8.0 | `opengfx-8.0-all.zip`, 3,583,152 bytes, SHA-256 `43a0c1dabf39cb865394f3a6cc36d4da5c10ecfaaf55652043104806810903be` | **GPL-2.0-only** |
| OpenMSX (base music) | 0.4.2 | `openmsx-0.4.2-all.zip`, 140,204 bytes, SHA-256 `5a4277a2e62d87f2952ea5020dc20fb2f6ffafdccf9913fbf35ad45ee30ec762` | **GPL-2.0-only** |
| OpenSFX (base sounds) | 1.0.3 | `opensfx-1.0.3-all.zip`, 11,566,000 bytes, SHA-256 `e0a218b7dd9438e701503b0f84c25a97c1c11b7c2f025323fb19d6db16ef3759` | sounds **CC BY-SA 3.0**; other files GPL-2.0-or-later and CDDL-1.1 |
| OpenSFX source (the per-sound credit and license list) | 1.0.3 | `opensfx-1.0.3-source.tar.xz`, 9,943,616 bytes, SHA-256 `43cacb3ca2d86e5729d19c7fcf2533e1bb9c9a32a39f515cf6cbe665ec32635c` | as above |

The reference is pinned to the GitHub tag `15.3` = commit
`14ec60f248547d4d062a1160f0fc26d742319888` (2026-04-04). `re/openttd/fetch.sh` downloads all five
archives from the official OpenTTD CDN into `re/openttd/orig/` (gitignored), verifies them and unpacks
them; `re/openttd/NOTES.md` has the sizes, hashes, commands and the layout. Nothing from `orig/` is
committed.

## The code: GPL-2.0-only

OpenTTD is a free reimplementation of *Transport Tycoon Deluxe* (Chris Sawyer, 1994), started in 2004
and developed by the OpenTTD team and its contributors. Its `README.md` says:

> OpenTTD is licensed under the GNU General Public License version 2.0, but includes some 3rd party
> software under different licenses.

Every source file carries the header “OpenTTD is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by the Free Software Foundation,
version 2.” `COPYING.md` is the text of the GNU General Public License version 2 (June 1991). “Version
2” without “or later” is **GPL-2.0-only**.

The 3rd-party code inside the source archive is under its own licences and is not part of this port
(the port is a new TypeScript implementation; no C++ from the archive is compiled or shipped):

| Directory | License |
| --- | --- |
| `src/3rdparty/squirrel` (Squirrel scripting) | Zlib |
| `src/3rdparty/md5` | Zlib |
| `src/3rdparty/fmt` | MIT |
| `src/3rdparty/nlohmann` (JSON) | MIT |
| `src/3rdparty/opengl` (Khronos headers) | MIT |
| `src/3rdparty/catch2` (tests only) | Boost Software License 1.0 |
| `src/3rdparty/icu` (script run) | Unicode License |
| `src/3rdparty/monocypher` | BSD-2-Clause or CC0-1.0 |
| `src/3rdparty/openttd_social_integration_api` | MIT |
| `cmake/3rdparty/llvm/CheckAtomic.cmake` | Apache-2.0 |

None of these is non-commercial or no-derivatives.

OpenTTD's own base graphics `media/baseset/openttd.grf` (the GUI, cursors, canals, one-way roads, the
new signal and bridge sprites, 192 sprites at `SPR_OPENTTD_BASE` = 4896) is part of the source archive
and under the GPL-2.0-only above. Its TrueType fonts (`media/baseset/OpenTTD-*.ttf`) are the OpenTTD
font v0.7 by Zephyris, also **GPL-2.0-only** (`media/baseset/OpenTTD-font.md`).

## OpenGFX 8.0: GPL-2.0-only

`readme.txt` / `README.md` of the set:

> OpenGFX Graphics Base Set for OpenTTD
> Copyright (C) 2007-2016 by the OpenGFX team
>
> This program is free software; you can redistribute it and/or modify it under the terms of the GNU
> General Public License version 2 as published by the Free Software Foundation.

The set is `ogfx1_base.grf` (temperate and the bulk of all graphics), `ogfxc_arctic.grf`,
`ogfxh_tropical.grf`, `ogfxt_toyland.grf`, `ogfxi_logos.grf`, `ogfxe_extra.grf` and `opengfx.obg`
(metadata: version 9499, DOS palette, 8bpp). The team's credits are in its readme (Zuu, Zephyris,
Varivar, V453000, ... and the full list); the monospaced characters are generated from Liberation Mono,
GPL-2.0. The files are used unchanged from the release; `re/openttd/orig/opengfx-8.0/` after
`fetch.sh`. The port stores the same pixels as 8bpp index atlases in `assets/sprites/` (a
lossless format conversion, not a change of the artwork); `assets/sprites/manifest.json`
records the SHA-256 of every source GRF and atlas. The release's archive SHA-256 is the official one; note that the `[md5s]` table inside
`opengfx.obg` does not match the six GRFs it ships with (OpenTTD 15.3 itself only logs this at debug
level 0 and loads the set); the checks in `fetch.sh` use the checksums computed from this release.

## OpenMSX 0.4.2: GPL-2.0-only

`readme.txt` of the set:

> The OpenMSX music set for OpenTTD Copyright (C) 2010-2021 OpenMSX Authors (see below or in the
> source in themes.list) and is licensed under GPL v2.
>
> This program is free software; you can redistribute it and/or modify it under the terms of the GNU
> General Public License version 2 as published by the Free Software Foundation.

The set is 31 Standard MIDI files (`tttheme2.mid`, `keep_on_rolling.mid`, ... the names are in
`openmsx.obm`) and the metadata file. The authors are credited in the set's readme (Ingo von Borstel,
and the composers of the tracks it lists); the files are used unchanged.

## OpenSFX 1.0.3: sounds CC BY-SA 3.0, other files GPL-2.0-or-later / CDDL-1.1

`readme.txt` §1.1 of the set:

> OpenSFX is free software, you are allowed to freely use, copy, modify and share this, even
> commercially, as long you follow the licenses.
>
> The OpenSFX sounds are licensed under the
>     Creative Commons Attribution-ShareAlike 3.0 Unported
> license.
>
> All other files, including text files, scripts, etc. are dual-licensed under:
>     GNU General Public License version 2 (or later)
> and
>     Common Development and Distribution License 1.1.

The sound data is `opensfx.cat` (13,196,496 bytes; the concatenated WAV samples, MD5
`56edd8f20cfa7413b68b2f0fb8a27be1`, matching `opensfx.obs`); `opensfx.obs` is the set metadata
(version 7974, one catalogue file). The release does **not** carry the per-sound list; the set's own
source package does, in `src/opensfx.psfo` (downloaded by `fetch.sh`), and it is reproduced below.
It names 73 sounds: 21 under CC0 1.0, 51 under CC BY 3.0 Unported and one
(`osfx_24`, the helicopter) under CC BY-SA 3.0 Unported. The set as a whole is offered under
CC BY-SA 3.0; no sound is more restrictive than that. There is no NonCommercial and no
NoDerivatives term.

The sounds are an **aggregate component**, not part of the GPL-2.0-only code: they are shipped
unchanged beside the port under their own licences, with the attribution below, the way the site
already ships Lugaru's CC BY-SA 3.0 data beside its GPL code. CC BY-SA 3.0 is not one-way compatible
with GPL-2.0, so the sounds are not relicensed under the GPL and the port's GPL-2.0-only license does
not cover them. Each sound keeps its own licence and credit.

### OpenSFX sound credits (verbatim from `src/opensfx.psfo` of 1.0.3)

```
// "file name" internal name
"src/wav/osfx_00.wav" "Good Year". By Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_01.wav" "Bad Year". By Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_02.wav" "Splat (building docks/canals/river)". Original "splattt.mp3" by "SlykMrByches". Edited by "Wuzzy". License: Creative Commons Zero 1.0.
"src/wav/osfx_03.wav" "Factory Whistle". By Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_04.wav" "Steam train station departure". Original "steam train horn 01.wav" by "eliasheuninck". Edited by "Wuzzy". License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_05.wav" "Steam engine going in tunnel". Original "steam train horn 01.wav" by "eliasheuninck". Edited by "Wuzzy". License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_06.wav" "Ship horn". Original "ship2_bergen.aif" by Leon Milo. Edited by Wuzzy. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_07.wav" "Ferry horn". Original "msfinmarken_Bergen.aif" by Leon Milo. Edited by Wuzzy. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_08.wav" "Propeller plane start". Original "Plane Cessna start stop.wav" by "Cheeseheadburger". Edited by "Wuzzy". License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_09.wav" "Early jet take off". Original "Passenger jet departs 2.wav" by "www.digifishmusic.com". Edited by "Wuzzy". License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_10.wav" "Diesel/electric train station departure". Original "Locomotive 1 Distant horn.wav" by "patchen". Edited by Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_11.wav" "Mining machinery". Original "L'ascenseur - Elevator" by "Aldor". Edited by Janis Lukss. License: Creative Commons Attribution 3.0 Unported. Original is Public Domain.
"src/wav/osfx_12.wav" "Electric sparking". Original "JacobsLadderLong2.flac" by "Halleck". Edited by Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_13.wav" "Steam (of steam engine)". By Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_14.wav" "Level crossing". Original "RRCrossing.wav" by "Mark_Ian". Edited by "Wuzzy". License: Creative Commons Zero 1.0.
"src/wav/osfx_15.wav" "Road vehicle breakdown". Original "Dropping a large gun.wav" by "Leady". Edited by Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_16.wav" "Train/ship breakdown". Original "Dumpster_Diving.wav" by "1sticky8". Edited by "Wuzzy". License: Creative Commons Zero 1.0.
"src/wav/osfx_17.wav" "Crash". Original "crash.wav" by "sagetyrtle". Edited by Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_18.wav" "Explosion". By Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_19.wav" "Big crash". Original "crash.wav" by "sagetyrtle". Edited by Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_20.wav" "Cash till". By Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_21.wav" "Beep". By Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_22.wav" "Morse". By Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_23.wav" "Plane wheels touching ground". Original "CarStartSkidCrash.wav" by "musicmasta1". Edited by "Wuzzy". License: Creative Commons Zero 1.0.
"src/wav/osfx_24.wav" "Helicopter". Original "helicopterRaw_16sec.wav" by "lorenzosu". Edited by "Wuzzy". License: Creative Commons Attribution-ShareAlike 3.0 Unported.
"src/wav/osfx_25.wav" "Truck/old bus start, pull away". Original "file0375.mp3" by "saphix". Edited by "Wuzzy". License: Creative Commons Zero 1.0.
"src/wav/osfx_26.wav" "Truck/old bus start, pull away with horn". Original "file0375.mp3" by "saphix" and "Industrial Air Horn.wav" by "mcpable". Edited by "Wuzzy". License: Creative Commons Zero 1.0.
"src/wav/osfx_27.wav" "Modern bus start". Original "london bus approaches & leaves.wav" by "icmusic". Edited by Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_28.wav" "Old bus start". Original "t_start1.mp3" by "roscoetoon". Edited by Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_29.wav" "Applause". Original "Approx 850 - Enthusiast Audience.wav" by "lonemonk". Edited by "Wuzzy". License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_30.wav" "Oooh sound". By Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_31.wav" "Splat (terraform/non-rail builds". By Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_32.wav" "Splat (rail builds)". Original "kick_1.wav" by "jascha". Edited by "Wuzzy". License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_33.wav" "Jackhammer". Original "air hammer half close.wav" by "Bluesy1905". Cut and edited by "Wuzzy". License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_34.wav" "Unused/Nothing". Trivial empty sound file. License: Creative Commons Zero 1.0.
"src/wav/osfx_35.wav" "Modern car horn". Original "claxon.wav" by "han1". Edited by Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_36.wav" "Sheep". Original "Corner of a sheep field in summer" by David R Barnes. Edited by "Wuzzy". License: Creative Commons Zero 1.0.
"src/wav/osfx_37.wav" "Cow". Original "Cow - Moan 2 - 96kHz.wav" by "Jarred Gib". Edited by "Wuzzy". License: Creative Commons Zero 1.0.
"src/wav/osfx_38.wav" "Horse". Original "20060419.horse.neigh.wav" by "dobroide". Edited by "Wuzzy". License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_39.wav" "Building bridge". Original "in the smithy 2.wav" by "l0calh05t". Edited by "Wuzzy". License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_40.wav" "Sawmill". Original "Circular saw crosscutting.wav" by "Benboncan". Edited by "Wuzzy". License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_41.wav" "Toyland: Sugar mine (1)". Original "shaker2.wav" by "marvman". Cut and edited by "Wuzzy". License: Creative Commons Zero 1.0.
"src/wav/osfx_42.wav" "Toyland: Toy factory (1)". Original "ae_51_m.wav" by "Sedi", "vial-glass-square-cinnamon-sticks-open-02.wav" by Jan Schupke aka "Vehicle" and "whoosh06.wav" by Richard Frohlich aka "FreqMan". Edited by "Wuzzy". License: Creative Commons Attribution 3.0.
"src/wav/osfx_43.wav" "Toyland: Toy factory (2)". Original "ae_51_m.wav" by "Sedi" and "Slide Whistle, Descending, B (H1).wav" by "InspectorJ". Edited and mixed by "Wuzzy". License: Creative Commons Attribution 3.0.
"src/wav/osfx_44.wav" "Toyland: Toy factory (3)". Orignal "nnb04_maxed.wav" by "Pooleside". Edited by Richard Wheeler. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_45.wav" "Toyland: Sugar mine (2)". Original "shaker2.wav" by "marvman". Cut and edited by "Wuzzy". License: Creative Commons Zero 1.0.
"src/wav/osfx_46.wav" "Toyland: Bubble generated". "Bubble 001.wav" by "ristooooo1". Edited by "Wuzzy". License: Creative Commons Zero 1.0.
"src/wav/osfx_47.wav" "Toyland: Bubble plop". By Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_48.wav" "Toyland: Toffee quarry". Original "Metal_03.wav" by "Q.K.", "aluminum02.wav" by "Necrosensual" and "slide_whistle_down_fast_01.wav" by "joedeshon". Edited by Richard Wheeler. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_49.wav" "Toyland: Bubble slurped". "Cartoon - Slurp!.wav" by "Beviceps" and "raw_bubblingdrink5.ogg". Edited by "Wuzzy". License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_50.wav" "Unused/Nothing | {{GRF_TITLE}}". Trivial empty sound file. Tag exists to force OTTD checksum diff. License: Creative Commons Zero 1.0.
"src/wav/osfx_51.wav" "Toyland: Plastic mine". Original "bulle.wav" by "Goldy-sama" and "ELEMENTS_WATER_02_Phasin-bubbles.wav" by "suonho". Edited by Richard Wheeler. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_52.wav" "Wind". Original "wind1.wav" by "Anton". Edited by Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_53.wav" "Toyland: Road vehicle breakdown". Original "CRASH2.wav" by "NoiseCollector" and "Snare 4.wav" by "VEXST". Edited by Richard Wheeler. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_54.wav" "Lumber mill: Crashing tree". Original "A Tree Falling Down.wav" by "ecfike". Edited by "Wuzzy". License: Creative Commons Zero 1.0.
"src/wav/osfx_55.wav" "Lumber mill: Falling tree". Original "cutting_tree.wav" by "fkurz". Edited by "Wuzzy". License: Creative Commons Zero 1.0.
"src/wav/osfx_56.wav" "Lumber mill: Chainsaw". Original "CHAINSAW.wav" by "JFBSAUVE". Edited by Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_57.wav" "Heavy wind". Original "wind1.wav" by "Anton". Edited by Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_58.wav" "Toyland: Train breakdown". Original "wfl5.5_snap.wav" by Derek Murphy and "crashB.wav" by "Matias.Reccius". Edited by Richard Wheeler. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_59.wav" "Mach 1+ Jet take off". Original "Landing Jet 5 (Close).wav" by "bigpickle51". Edited by "Wuzzy". License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_60.wav" "Toyland: Comedy bus start (1)". Original "file0375.mp3" by "saphix" and "boing_raw.aif" by "cfork". Edited by Richard Wheeler. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_61.wav" "Modern jet take off". Original "5_Navy-Blue-Angels-jets_CLIP.wav" by ibisradio. Edited by "Wuzzy". License: Creative Commons Zero 1.0.
"src/wav/osfx_62.wav" "Toyland: Comedy bus start (2)". Original "file0375.mp3" by "saphix" and "Bike Horn double toot.wav" by "Stickinthemud". Edited by Richard Wheeler. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_63.wav" "Toyland: Comedy truck start (1)". Original "t_start1.mp3" by "roscoetoon" and "Squeeky ball Toy_1.L.wav" by "AGFX". Edited by Richard Wheeler. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_64.wav" "Toyland: Comedy truck start (2)". Original "london bus approaches & leaves.wav" by "icmusic" and "Boink_v3.wav" by "simon.rue". Edited by Richard Wheeler. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_65.wav" "Maglev train station departure". Original "metro.wav" by "Marec". Mixed/edited by Janis Lukss. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_66.wav" "Tropical: Bird (1)". Original "Bird Noise - 1.wav" by "SpaceJoe". Edited by "Wuzzy". License: Creative Commons Zero 1.0.
"src/wav/osfx_67.wav" "Tropical: Lion roar". Original "elaine-growl.wav" by Elaine Miller. Edited by "Wuzzy". License: Creative Commons Zero 1.0.
"src/wav/osfx_68.wav" "Tropical: Monkeys". Original "Affen schreit.mp3" by "Bidone". Edited by "Wuzzy". License: Creative Commons Zero 1.0.
"src/wav/osfx_69.wav" "Toyland: Propeller plane take off". Original "Airplane propeller.wav" by "MrVasLuk". Edited by "Wuzzy". License: Creative Commons Zero 1.0.
"src/wav/osfx_70.wav" "Toyland: Jet take off". Original "Passenger jet departs 2.wav" by "www.digifishmusic.com", "Car start and drive.mp3" by "han1" and "swosh.aif" by "man". Edited by Richard Wheeler. License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_71.wav" "Monorail train station departure". Original "Train passby (tape stop).wav" by "Metzik". Edited by "Wuzzy". License: Creative Commons Attribution 3.0 Unported.
"src/wav/osfx_72.wav" "Tropical: Bird (2)". Original "Bird Noise - 12.wav" by "SpaceJoe". Edited by "Wuzzy". License: Creative Commons Zero 1.0.
```

The licence texts are in the sets themselves (`license.txt` of OpenSFX, OpenMSX, OpenGFX) and at
<https://creativecommons.org/licenses/by-sa/3.0/> and <https://www.gnu.org/licenses/old-licenses/gpl-2.0.html>.

## This port: GPL-2.0-only

The port is a derivative work of OpenTTD: the C++ source translated to TypeScript and the game's data
(OpenGFX, OpenTTD's own base graphics and fonts, OpenMSX) used unchanged. The port's own code is
licensed under the **GNU General Public License, version 2 only**, like OpenTTD, OpenGFX and OpenMSX:
see `licenses/GPL-2.0.txt` on this site. What the port changed is listed in `README.md`. This program
comes with ABSOLUTELY NO WARRANTY.

The source code of the port, the tools that build its assets and the test oracle are in this site's
source archive ("Licenses & source"). The port is altered source, not the original program; it is not
presented as OpenTTD or as provided by the OpenTTD team.

The OpenSFX sounds (section above) are **not** GPL-2.0: they are a separate aggregate under
CC BY-SA 3.0 (with individual sounds under CC0 1.0 and CC BY 3.0), shipped unchanged with the credits
above. The port's GPL-2.0 grant does not extend to them, and their CC BY-SA 3.0 terms do not extend to
the port's code.

### Combining with this website

The website and the game SDK are **GPL-3.0-or-later**. `web/LICENSE.md` grants an additional
permission under section 7 of the GPL-3.0:

> the copyright holder permits you to combine the website and the game SDK (or modified versions of
> them) with a game port that is licensed under the NetHack General Public License or under the GNU
> General Public License version 2 only (a `games/<id>/` whose `LICENSE.md` names one of these
> licenses, such as NetHack and Frozen Bubble), and to convey the resulting combined work under the
> terms of that game port's license, provided that the source code of the website and the game SDK it
> contains is made available under those terms too.

This port names the GNU General Public License version 2 only, so the permission covers the
combination; the combined work is conveyed under GPL-2.0-only, and the website/SDK source is made
available under those terms too. The same route is used by the Frozen Bubble port
(`web/games/frozenbubble/LICENSE.md`), which is also GPL-2.0-only.

## Exact conclusion

* OpenTTD 15.3 code, its own GRF and fonts, OpenGFX 8.0 and OpenMSX 0.4.2 are **GPL-2.0-only**.
* OpenSFX 1.0.3 sounds are **CC BY-SA 3.0** as a set; individually 21 are CC0 1.0, 51 CC BY 3.0 and
  1 CC BY-SA 3.0. The other files of the set are GPL-2.0-or-later and CDDL-1.1.
* No file or package in this list has a NonCommercial or NoDerivatives term.
* The port's code and the GPL-2.0-only data are licensed **GPL-2.0-only**. The OpenSFX sounds remain a
  separate CC BY-SA 3.0 aggregate with the credits above.
* The GPL-3.0-or-later website and SDK may be combined with this GPL-2.0-only port through the
  section 7 additional permission in `web/LICENSE.md`; the combined work is conveyed under
  GPL-2.0-only. Frozen Bubble is the precedent.

## Favicon

`web/icons/openttd.png` and `web/icons/openttd-180.png` are a crop of this port's own
`screenshots/scenario-town.png` (original OpenGFX town sprites), GPL-2.0-only, like the rest of the
port's graphics.
