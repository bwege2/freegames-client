# Madness Interactive Reloaded: license and credits

**Madness Interactive Reloaded** is made by **Studio Minus**: programming by zooi and duston, art and animations
by Dikkiedik and Koof, original soundtrack by Lothyde, additional music by Cheshyre, API and mmodule; contributors
Orsoniks, Orongto, Technochips and ctcl-bregis (`assets/data/credits.txt`). It is based on Madness Interactive by
Flecko (Max Abernethy) and Madness Combat by Krinkels. The reference for this port is release **0.51.1-beta**
(tag `v0.51.1-beta` of https://github.com/studio-minus/madness-interactive-reloaded, commit
`8d2da4dd5ecd041884ba7cc57ab1ba1e09c73d0e`; `re/madness/fetch.sh`). The licence check of every part and the
comparison with the reference files is `re/madness/LICENSE.md`.

```
Madness Interactive Reloaded
Copyright (C) Studio Minus
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General
Public License as published by the Free Software Foundation, version 3 (LICENSE of the repository).
```

**The original is GPL-3.0, version 3 only**: its repository has one `LICENSE` file with the text of the GNU GPL
version 3, and no file or README line offers "or any later version". The game code translated in this port is
therefore a GPL-3.0 derivative, and this folder as a whole is distributed under **GPL-3.0**, not "or later". The
website and game SDK around it are GPL-3.0-or-later (`web/LICENSE.md`); that is a separate work.

| Part | In this folder | Copyright | License |
| --- | --- | --- | --- |
| Game code (translated in `src/game/`, `src/data/`, `src/app.ts`, `src/engine/dotnet-random.ts`) | | Studio Minus | GPL-3.0 |
| .NET's `System.Random` with a seed (translated in `src/engine/dotnet-random.ts`, as the algorithm the incident mode depends on) | | .NET Foundation and contributors | MIT |
| Walgelijk engine code (translated in `src/engine/`: Utilities, Curve, Easings, TransformComponent, physics queries) | | Studio Minus (mestiez) | GPL-3.0 |
| FastNoise Lite (translated in `src/engine/noise.ts`) | | 2020 Jordan Peck and contributors | MIT (below) |
| Data: 192 animations, 250 armour pieces, 21 stats, 60 looks, 10 hand sets, 14 melee sequences, 16 presets, weapons, factions, campaigns, levels, cutscenes, arena waves, incident music list, convars | `assets/data/` (816 files, unchanged) | Studio Minus | GPL-3.0 |
| Text (English) | `assets/locale/en-GB.json` (unchanged) | Studio Minus | GPL-3.0 |
| Graphics: bodies, apparel, weapons, backgrounds, effects, decals, props, UI (1,003 PNG and 194 QOI files) | `assets/textures/` (unchanged) | Studio Minus (Dikkiedik, Koof) | GPL-3.0 |
| Sound effects | `assets/sounds/` (unchanged; WAV and OGG) | Studio Minus | GPL-3.0 |
| Music | `assets/sounds/music/` (unchanged; 17 tracks by Lothyde in `Lothyde/`, 25 other tracks; additional music by Cheshyre, API and mmodule, `assets/data/credits.txt`) | Lothyde, Cheshyre, API, mmodule, Studio Minus | GPL-3.0 |
| Cutscene videos | `assets/video/` (7 MP4 files, unchanged) | Studio Minus | GPL-3.0 |
| Shaders (GLSL, not run by the port) | `assets/shaders/` (15 files, unchanged) | Studio Minus | GPL-3.0 |
| Font Inter | `assets/fonts/inter.wf` (unchanged) | The Inter Project Authors | SIL Open Font License 1.1 (`assets/fonts/OFL-Inter.txt`) |
| Font Oxanium | `assets/fonts/oxanium.wf` (unchanged) | The Oxanium Project Authors | SIL Open Font License 1.1 (`assets/fonts/OFL-Oxanium.txt`) |
| **Replacement** for the font Impact | `assets/fonts/impact.wf`: Anton Regular, rendered into MIR's font format by `re/madness/tools/make-wf.py` | 2020 The Anton Project Authors | SIL Open Font License 1.1 (`assets/fonts/OFL-Anton.txt`); source https://github.com/google/fonts/tree/main/ofl/anton |
| **Replacement** for the font Toxigenesis | `assets/fonts/toxigenesis.wf`: Russo One Regular, rendered the same way | 2011-2012 Jovanny Lemonad (Reserved Font Name "Russo") | SIL Open Font License 1.1 (`assets/fonts/OFL-RussoOne.txt`); source https://github.com/google/fonts/tree/main/ofl/russoone |

## Asset provenance and the file-by-file manifest

`ASSET-MANIFEST.csv` lists **every one of the 2,353 files** in `assets/` with its size, SHA-256, source and
licence. It was checked on 2026-11-20 against the reference checkout of commit `8d2da4d`:

* **2,347 files are byte-identical** to `src/MadnessInteractiveReloaded/base/<same path>` of MIR 0.51.1-beta.
  Their source is that file; the repository's single GPL-3.0 `LICENSE` covers them.
* **2 files are replacements**: `fonts/impact.wf` and `fonts/toxigenesis.wf`, because MIR's originals are
  proprietary (see below). They are generated from the SIL OFL fonts named in the table.
* **4 files are added**: the OFL licence texts `fonts/OFL-Anton.txt`, `OFL-Inter.txt`, `OFL-Oxanium.txt` and
  `OFL-RussoOne.txt`, copied from Google Fonts' repository.

Nothing in `assets/` is under a non-commercial or no-derivatives licence. MIR's repository has no per-file asset
licence and no file that says a part is under other terms; everything it ships is published there under GPL-3.0.
The credits name Studio Minus's own artists (Dikkiedik, Koof) for the graphics and animations and Lothyde,
Cheshyre, API and mmodule for the music, and say the game is *based on* Madness Interactive by Flecko and
Madness Combat by Krinkels: the drawings, sounds and videos are Studio Minus's files, while the characters and
the setting come from Krinkels' series. That is an attribution and character question, not a different copyright
licence of the files, and it is the same for MIR's own distribution. The repository does not credit every sound
effect individually; as far as its `LICENSE` goes, they are GPL-3.0 too.

To check the list: `python3 -I re/madness/tools/manifest.py` rewrites it from `web/games/madness/assets/`;
`re/madness/LICENSE.md` describes the upstream comparison. The port's test `test/licence.test.ts` verifies that
the manifest covers every shipped asset and that every SHA-256 still matches.

## The two replaced fonts

MIR's `base/fonts/impact.wf` is **Impact** (Geoffrey Lee, Stephenson Blake; today Monotype), proprietary and
licensed with Windows; its `toxigenesis.wf` is **Toxigenesis** (Typodermic Fonts, Ray Larabie), free of charge but
not free software and not licensed for modification or redistribution under the GPL. Neither may ship here, so the
port renders two free fonts into MIR's `.wf` format (a zip of `meta.json` and `atlas.png`) under the original file
names and uses them at the same sizes:

* `impact.wf` ← **Anton** Regular (`Anton-Regular.ttf`, SHA-256 `a4ba3a92…ab947cab`), Copyright 2020 The Anton
  Project Authors, SIL OFL 1.1, from https://github.com/google/fonts/tree/main/ofl/anton. A condensed sans like
  Impact. Anton has no Reserved Font Name.
* `toxigenesis.wf` ← **Russo One** Regular (`RussoOne-Regular.ttf`, SHA-256 `bc0abcc6…148d09df`), Copyright
  (c) 2011-2012 Jovanny Lemonad, Reserved Font Name "Russo", SIL OFL 1.1, from
  https://github.com/google/fonts/tree/main/ofl/russoone. A heavy technical display face like Toxigenesis.

The rendered `.wf` files are modified versions of those fonts in MIR's format, and are distributed under the same
OFL 1.1 as the originals. They keep MIR's internal names (`impact`, `toxigenesis`), not the reserved name
"Russo", and the OFL texts ship beside them. The SIL OFL 1.1 allows commercial use, embedding and redistribution
with software; the FSF lists it as a free licence, and a font distributed beside GPL software is a separate work.
MIR's other fonts (Tipografia, whose licence is not stated, Cascadia Mono and Roboto Mono, for the debug console
and editors) are not used and not shipped.

## This port

The TypeScript in `src/`, the tests in `test/` and the tools in `re/madness/` are by the freegames project, a
modified version of Madness Interactive Reloaded: they are distributed under the **GNU General Public License,
version 3** (the original's licence; `public/licenses/GPL-3.0.txt`), and the source is public (the website's
"Licenses & source"). Its differences from the original are listed in `README.md`. The website and game SDK are
GPL-3.0-or-later (`web/LICENSE.md`); this game's translated code and data are GPL-3.0, as the original's licence
requires.

## FastNoise Lite (MIT)

```
MIT License

Copyright(c) 2020 Jordan Peck (jordan.me2@gmail.com)
Copyright(c) 2020 Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files(the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions :

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Favicon

The favicon of the game's page (`web/icons/madness.png`, 48x48, and `web/icons/madness-180.png`, 180x180; drawn by
`web/scripts/icons.py`) is the grunt's head, `assets/textures/bodies/default/head_right.png` (GPL-3.0, above), on a
red and black tile.
