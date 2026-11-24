# 0 A.D.: license and credits

This port is made from **0 A.D. 0.28.0 “Boiorix”** (Wildfire Games; Release 28, published
2026-02-18), tag `v0.28.0`, commit `a2cae4d69f816e9e9d7eecb6bf88f762afc0c90d`. The reference
archives, their sizes and SHA-256 sums are in `re/0ad/fetch.sh` and `re/0ad/NOTES.md`; no original
archive or unpacked tree is committed.

**Verdict.** The port's own TypeScript, tests and tools are **GPL-3.0-or-later**, the website's
licence (`web/LICENSE.md`). The game's code and non-art data are **GPL-2.0-or-later**. Its art is
**CC BY-SA 3.0 Unported** and is shipped as a **separate work beside the code (aggregation), not
relicensed under the GPL**. This is the same arrangement the operator approved for Lugaru (variant
B, 2026-11-21) and used for C-Dogs. The map, templates and simulation data that live outside
`art/` are GPL-2.0-or-later, which combines with the GPL-3.0 port. **No shipped file is under a
NonCommercial or NoDerivatives term.**

## The reference

* **Game:** *0 A.D.* (Wildfire Games), <https://play0ad.com/>; engine *Pyrogenesis*.
* **Reference release:** **0.28.0 “Boiorix”**, tag `v0.28.0`, commit
  `a2cae4d69f816e9e9d7eecb6bf88f762afc0c90d`.
* **Archives:**
  * `0ad-0.28.0-unix-build.tar.xz`, 164,975,536 bytes, SHA-256
    `27e217755ef76a922fe58dbf593d96e54b6ed2375d23f548c35619aa6bd5a42a`;
  * `0ad-0.28.0-unix-data.tar.xz`, 1,415,012,652 bytes, SHA-256
    `e844b30ae2102c47e0a4fff2f0e0ef05ba0cebb1890aa72276fa12457c39526f`.
  Both are the official downloads from <https://releases.wildfiregames.com/>. `re/0ad/fetch.sh`
  downloads and verifies them; `re/0ad/tools/assets.py` builds the shipped subset.
* **Licence files in the reference:** `LICENSE.md`, `license_gpl-2.0.txt`,
  `license_lgpl-2.1.txt`, `license_mit.txt`, `binaries/data/mods/public/art/LICENSE.txt`,
  `binaries/data/mods/public/audio/LICENSE.txt`, the engine mod's `art/LICENSE.txt`,
  `fonts/FreeFont-LICENSE.txt` and `fonts/LibBiolinum-LICENSE.txt`.

## The code: GPL-2.0-or-later

`source/` is the GPL-2.0-or-later engine (the GPL header is in every engine file). It was read as
the reference and translated to TypeScript; no C++ is compiled, linked or copied. The port's
TypeScript is a new implementation of the rules and formats, not the original program.

| Code in the reference | Licence | Used by the port? |
| --- | --- | --- |
| `source/` (Pyrogenesis engine) | **GPL-2.0-or-later** | read as the reference |
| `source/lib/`, `source/third_party/*` (MIT, zlib, ISC, BSD, MPL, Apache, …) | their own permissive licences | not shipped |
| `binaries/data/simulation/` (JS components, helpers, AI, data JSON) | **GPL-2.0-or-later** | read as the reference for formulas and values |
| `binaries/data/gui/`, `l10n/`, `config/`, `shaders/` | **GPL-2.0-or-later** | not shipped (the HUD is new CSS) |

## The data: GPL-2.0-or-later

The release's `LICENSE.md` makes everything under `binaries/data/` GPL-2.0-or-later unless a more
specific directory rule applies. The shipped map and templates fall under that rule:

| Shipped data | Files | Bytes | Source | Licence |
| --- | ---: | ---: | --- | --- |
| map scenario + PMP | 2 | 1,253,644 | `maps/skirmishes/farmland_2p.{xml,pmp}` | **GPL-2.0-or-later** |
| entity templates (with parents/mixins) | 53 | 61,783 | `simulation/templates/**` | **GPL-2.0-or-later** |

These files are unchanged copies of the release (the XMLs are parsed directly). They are
aggregated with the GPL-3.0-or-later port; GPL-2.0-or-later code can be combined with GPL-3.0.

`maps/random/LICENSE.txt` records the NASA Blue Marble (public domain) and OSM-derived heightmaps;
the slice uses a fixed skirmish map and ships none of the random-map material.

## The art: CC BY-SA 3.0 Unported

`binaries/data/mods/public/art/LICENSE.txt` (2009; the engine-mod copy says 2014) is the blanket
grant:

> The files in this directory are Copyright (C) 2009 Wildfire Games.
>
> These files are licensed under the Creative Commons Attribution-Share Alike 3.0
> (CC-by-sa) license, available at http://creativecommons.org/licenses/by-sa/3.0/
>
> Briefly, this means:
>
> * You may use, modify and distribute these files, for commercial and non-commercial purposes.
> * If you distribute one of these files, you must include attribution (e.g. in the credits screen
>   of a game or a video, or in a text file accompanying the files). The attribution must include:
>   * A link to http://creativecommons.org/licenses/by-sa/3.0/
>   * The name “Wildfire Games” as the original author
>   * A link to http://www.wildfiregames.com/
> * If you distribute one of these files, you must release it (and any modifications you have made
>   to it) under the CC-by-sa license.

The important consequence is the ShareAlike term: the art is **not relicensed under the GPL**;
modified/converted copies of those files stay CC BY-SA 3.0 and carry the attribution above. The
port therefore treats the art as an aggregated work beside the GPL-3.0 code, exactly as Lugaru
does with Wolfire's CC BY-SA 3.0 data.

`art/LICENSE.txt` adds a special permission for part of the texture set:

> Some of the files in the "textures/" directory are derived from materials provided by CGTextures
> (http://www.cgtextures.com/). The original materials are the property of CGTextures or its
> contributors. Special permission has been granted by CGTextures to distribute these derived
> textures as CC-BY-SA. (This has no effect on the standard licensing of CGTextures materials, or
> on any other work derived from them.)
>
> All CGTextures materials have been altered from their original form.

The port ships only the derived textures that are part of the 0 A.D. release, never the CGTextures
originals.

### What art is shipped

All of the following are from `binaries/data/mods/public/art/` (or the engine mod's `art/` for the
default sky), attributed to **Wildfire Games and the 0 A.D. contributors**, **CC BY-SA 3.0**.
Every file's original path, size and SHA-256 is in `web/games/0ad/assets/MANIFEST.json`.

| Shipped art | Files | Bytes | Conversion |
| --- | ---: | ---: | --- |
| actor and prop XML | 109 | 115,562 | unchanged text |
| PMD meshes | 147 | 9,280,781 | unchanged original `.dae.cached.pmd` |
| PSA animations | 68 | 4,979,828 | unchanged original `.dae.cached.psa` |
| actor textures | 70 | 14,611,002 | DDS/PNG → lossless WebP |
| terrain textures | 23 | 2,583,468 | DDS → lossless WebP, 512² → 256² (64 px/m) |
| sky cube faces (`default`) | 5 | 73,572 | DDS → lossless WebP, from the engine mod |
| portrait/resource icons | 23 | 552,567 | DDS → PNG; unit portraits keep their civ folder |
| Athenians' emblem (favicon source) | 1 | 126,453 | DDS → PNG, 256² |
| HUD fonts + licences | 4 | 2,223,606 | copied, not modified |
| **total art (including the four font files)** | **450** | **34,546,839** | |
| **total data** | **66** | **1,322,848** | |
| **total shipped** | **516** | **35,869,687** | |

No audio or music is shipped in this slice, so there is no CC BY-SA audio here.

### Deliberately not shipped

* **Audio and music:** the release's 1,098 sound files and 61 music tracks are not used; the slice
  has no sound. (Recorded for a later round: `audio/` is CC BY-SA 3.0 and the credits are in
  `gui/credits/texts/audio.json`.)
* **Other art:** all other maps, the other twelve civilisations, the campaign art, portraits for
  units and buildings outside the shipped subset, particle effects, decals, projectile models, water
  textures and the rest of the 2.2 GB texture tree. The port draws no audio, music, shadows or
  particle effects.
* **Fonts:** only the HUD's FreeSans and Linux Biolinum faces and their licence files are shipped
  (see below). CJK Source Han Sans, DejaVu, FreeMono and the other engine-mod fonts are not.
* **Shaders:** the GLSL/SPIR-V shader tree is not shipped; the port uses three.js shaders.
* **Localisations:** the 432 `.po`/`.pot` files are GPL data but not needed; the HUD is English.
* **Lobby terms:** `gui/prelobby/common/terms/` and 0 A.D.'s own online-lobby terms are not shipped;
  the port's online 1v1 uses the website's shared lobby, not 0 A.D.'s lobby.
* **The original archives** (`re/0ad/orig/`) and unpacked trees (`re/0ad/work/`) are gitignored and
  never committed.

## The engine-mod fonts

| Font files | Licence | Shipped? |
| --- | --- | --- |
| `FreeSans.ttf` | **GPL-3.0-or-later with the GNU FreeFont font exception** (`FreeFont-LICENSE.txt`) | yes, the HUD's sans face |
| `LinBiolinum_Rah.ttf` | **GPL-3.0-or-later with the Libertine/Biolinum font exception** (`LibBiolinum-LICENSE.txt`) | yes, the menu/title face |
| `DejaVuSansMono.ttf`, `DejaVuSans.ttf` | Bitstream Vera/DejaVu licence | no |
| `SourceHanSans*.otf` | SIL OFL 1.1 | no (CJK only) |

The font exception permits embedding the unmodified fonts; the files are not modified. The two
licence files are copied beside the fonts in `assets/fonts/`.

## The port's own work

The TypeScript in `web/games/0ad/src/`, the tests in `web/games/0ad/test/`, the tools in
`re/0ad/tools/` and the port's shaders and CSS are by the freegames project and are licensed
**GPL-3.0-or-later**, the website's licence (`web/LICENSE.md`). The port is altered source, not the
original program. It aggregates the CC BY-SA 3.0 art beside the GPL-3.0 code; the two licences stay
separate.

## Favicon

`web/icons/0ad.png` (48×48) and `web/icons/0ad-180.png` (180×180) are drawn by
`web/scripts/icons.py` (`i_0ad`) from the Athenians' emblem,
`art/textures/ui/session/portraits/emblems/emblem_athenians.png` (Wildfire Games, **CC BY-SA
3.0**), kept as `assets/icon-source.png`. They are an adaptation of that artwork and stay under
**CC BY-SA 3.0**, attributed to Wildfire Games.

## Attribution

> **0 A.D.** © Wildfire Games and the 0 A.D. contributors.
> Art: **CC BY-SA 3.0 Unported**, <https://creativecommons.org/licenses/by-sa/3.0/>,
> <https://www.wildfiregames.com/>. Changes made for this port: assets are copied and, where
> needed, converted losslessly (DDS → WebP/PNG; PMD/PSA kept unchanged; terrain 512² → 256²).
> The conversion is a modification under the CC BY-SA and stays CC BY-SA 3.0.
> Map credits: the 0 A.D. map makers listed in `gui/credits/texts/maps.json`.
> Code and non-art data: **GPL-2.0-or-later**; this port's code: **GPL-3.0-or-later**.

## How the licence was checked

The full command log, hashes and file inventory are in `re/0ad/NOTES.md`. In short:

* both archives were downloaded from the official release server and their SHA-256 sums were
  verified; the release's `LICENSE.md` was read against the extracted tree;
* every shipped file is classified by its prefix: `public/art` → CC BY-SA 3.0;
  `public/simulation/templates` and `public/maps` → GPL-2.0-or-later; engine `mod/art` (the
  default sky) → CC BY-SA 3.0; engine `mod/fonts` → their font licences. No file outside these
  groups is shipped;
* the `assets/MANIFEST.json` records each source file, size and SHA-256; `test/assets.test.ts`
  checks the split and the hashes at test time;
* CC BY-SA 3.0 is not one-way GPLv3-compatible for adaptations (checked at
  <https://creativecommons.org/share-your-work/licensing-considerations/compatible-licenses/>),
  which is why the art is aggregated beside the GPL code rather than merged into it. The Lugaru
  variant-B decision (2026-11-21) is the project precedent.
