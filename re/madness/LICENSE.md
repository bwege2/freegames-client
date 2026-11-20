# Madness Interactive Reloaded: licence check

Reference: **Madness Interactive Reloaded 0.51.1-beta** by Studio Minus, the git tag `v0.51.1-beta` of
https://github.com/studio-minus/madness-interactive-reloaded (commit `8d2da4dd5ecd041884ba7cc57ab1ba1e09c73d0e`,
released 2025-01-17), fetched by `fetch.sh`. Checked 2026-11-16.

The repository has one licence file, `LICENSE`: the **GNU General Public License version 3**, and no file, README
line or source header offers "or any later version". It is GPL-3.0 **only**, and it covers the whole repository,
code and data alike; there is no separate asset licence, and no file in the repository says that any part is under
other terms, except `src/MadnessInteractiveReloaded/NOTICE.txt`, which lists the code libraries it builds on
(OpenTK, Newtonsoft.Json, FastNoise Lite: MIT; SixLabors ImageSharp: Apache-2.0). A port of the code and a
redistribution of the assets must therefore be GPL-3.0, not GPL-3.0-or-later. Wikipedia's list of
open-source games gives "GPL-3.0-or-later / CC BY 3.0"; the repository itself says GPL-3.0 for everything. The engine,
Walgelijk (https://github.com/mestiez/Walgelijk, by the same authors), is GPL-3.0 as well.

| Part | Where (in MIR's `base/`) | Licence | Commercial use | GPL-3.0 | In the port |
| --- | --- | --- | --- | --- | --- |
| Game code (C#) | `src/MadnessInteractiveReloaded/**/*.cs` | GPL-3.0 (only) | yes | yes | translated (`web/games/madness/src/`) |
| Engine code (Walgelijk: Utilities, Curve, Easings, Transform, physics queries) | Walgelijk repository | GPL-3.0 | yes | yes | translated |
| FastNoise Lite (noise used for the animation and the AI) | Walgelijk `Shared/FastNoiseLite.cs` | MIT | yes | yes | translated (`src/engine/noise.ts`) |
| Data: animations, stats, looks, armour, weapons, melee sequences, factions, campaigns, levels, convars, locale | `data/`, `locale/` | GPL-3.0 | yes | yes | unchanged |
| Graphics: bodies, apparel, weapons, backgrounds, effects, decals, props, UI | `textures/` | GPL-3.0 (art by Dikkiedik and Koof, `data/credits.txt`) | yes | yes | unchanged (PNG, QOI) |
| Sound effects | `sounds/` (firearms, impacts, punches, swords, doors, UI ...) | GPL-3.0 | yes | yes | unchanged (WAV, OGG) |
| Music | `sounds/music/Lothyde/` (original soundtrack by Lothyde), the other tracks of `sounds/music/` ("additional music by Cheshyre, API, and mmodule", `data/credits.txt`; no per-file credits) | GPL-3.0 | yes | yes | unchanged (OGG) |
| Font Inter | `fonts/inter.wf` (an atlas rendered from Inter) | SIL OFL 1.1 (The Inter Project Authors) | yes | yes (separate font, FSF: free) | unchanged; OFL text added |
| Font Oxanium | `fonts/oxanium.wf` | SIL OFL 1.1 (The Oxanium Project Authors) | yes | yes | unchanged; OFL text added |
| Font Impact | `fonts/impact.wf` | **not free**: Impact (Geoffrey Lee, Stephenson Blake; today Monotype), proprietary, licensed with Windows | no | no | **replaced** |
| Font Toxigenesis | `fonts/toxigenesis.wf` | **not free**: Typodermic Fonts (Ray Larabie), proprietary licence (free of charge, but no permission to modify it or pass it on under the GPL) | no | no | **replaced** |
| Fonts Cascadia Mono, Roboto Mono, Tipografia | `fonts/` | Cascadia and Roboto Mono: SIL OFL / Apache-2.0; Tipografia: not stated (debug and editor text) | | | not used, not shipped |
| Cutscene videos | `video/` (MP4) | GPL-3.0 | yes | yes | unchanged |
| Shaders | `shaders/` (GLSL) | GPL-3.0 | yes | yes | unchanged (not run: the port has its own WebGL shaders) |
| .NET `System.Random` (seeded: Knuth's subtractive generator, `Net5CompatSeedImpl`) | dotnet/runtime | MIT | yes | yes | translated (`src/engine/dotnet-random.ts`) |

## Replacements

Both are made by `tools/make-wf.py` from the font file into MIR's own `.wf` format (a zip of `meta.json` and
`atlas.png`), under the original file names:

* `fonts/impact.wf` ← **Anton** Regular (`Anton-Regular.ttf`, sha256 `a4ba3a92…ab947cab`), Copyright 2020 The Anton
  Project Authors (https://github.com/googlefonts/AntonFont), **SIL Open Font License 1.1**, from
  https://github.com/google/fonts/tree/main/ofl/anton. A condensed sans like Impact.
* `fonts/toxigenesis.wf` ← **Russo One** Regular (`RussoOne-Regular.ttf`, sha256 `bc0abcc6…148d09df`), Copyright
  (c) 2011-2012 Jovanny Lemonad, Reserved Font Name "Russo", **SIL Open Font License 1.1**, from
  https://github.com/google/fonts/tree/main/ofl/russoone. A heavy technical display face like Toxigenesis.

The SIL OFL 1.1 allows commercial use, embedding and redistribution with software; the FSF lists it as a free
licence (a font distributed beside GPL software is a separate work). The licence texts ship with the fonts
(`web/games/madness/assets/fonts/OFL-*.txt`).

## The files the port ships

Checked on 2026-11-20 against the checkout of commit `8d2da4d`: the port's `assets/` holds **2,353 files**,
of which **2,347 are byte-identical** to the same path under `src/MadnessInteractiveReloaded/base/` (SHA-256
compared one by one), **2 are replacements** (`fonts/impact.wf`, `fonts/toxigenesis.wf`: the originals are not
free) and **4 are added licence texts** (the OFL texts of the four fonts). The complete file-by-file list with
sizes, hashes, sources and licences is `web/games/madness/ASSET-MANIFEST.csv`, regenerated by
`tools/manifest.py`. There is no NC or ND file among them; the only non-GPL files are the four `.wf` fonts and their four OFL
licence texts in `assets/fonts/` (eight files), and the OFL 1.1 is GPL-compatible (a font is a separate work;
the FSF lists it as free).

The music is the part with the least per-file paperwork: the repository credits Lothyde for the original
soundtrack and Cheshyre, API and mmodule for additional music, but gives no per-track or per-file licence. The
tracks are part of the GPL-3.0 repository, so its publisher distributes them under that licence; nothing in the
repository suggests NC or ND terms. The same holds for the 256 sound effects, which have no individual credits
at all. The port can therefore ship them on the repository's terms, which is all that can be checked from the
reference.

## Notes

* MIR is a fan game "based on Madness Interactive by Flecko (Max Abernethy) and Madness Combat by Krinkels"
  (`data/credits.txt`). Its graphics, sounds and music are Studio Minus's own and released under the GPL-3.0; the
  names and the look of the Madness Combat characters come from Krinkels' series, which is not under a free licence.
  That is a trademark and character question, not a copyright licence of the files, and it is the same for MIR's own
  distribution.
* The repository does not credit the origin of every sound effect (no per-file credits). Everything in it is
  published under the GPL-3.0 by its authors; that cannot be checked further from the source.
