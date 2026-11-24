# OpenClonk: license and credits

This port is made from **OpenClonk** (https://www.openclonk.org/), master `36de799544af0459014ea088867fe263779a8bdd`
(2026-04-28, version 9.0 alpha), the source archive of that commit from https://github.com/openclonk/openclonk
(`re/openclonk/fetch.sh`).

## Trademark

**'Clonk' is a registered trademark of Matthes Bender.** The original's `TRADEMARK` file, which must be
included with it:

```
'Clonk' is a registered trademark of Matthes Bender. It may be used within
software products which are using source code or game content as made public
on the Clonk website (or derived from such) with the following limitations:

If the word 'Clonk' is used as the name of anything in your software product
then you must include the following notice in a suitable place (e.g. credits
screen): 'Clonk' is a registered trademark of Matthes Bender.

If the title of your software product contains the word 'Clonk' then you must
PREFIX the word with an added name of your choosing, e.g. 'MyClonk' or
'PortableClonk' and you must include the trademark notice above in a suitable
place (e.g. credits screen or splash screen).

If you are making your source code or game content available to other parties
in a way which allows adaptation you must include a copy of this license along
with any other applicable licenses.
```

## The engine: ISC

```
Copyright (c) 1998-2000, Matthes Bender
Copyright (c) 2001-2009, RedWolf Design GmbH, http://www.clonk.de
Copyright (c) 2009-2016, The OpenClonk Team and contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

The authors of the engine are named in its `COPYING` file and in each source file; the scripts of the game
content (C4Script) are ISC as well, their authors are named in the scripts (`planet/AUTHORS`; where none is
named: The OpenClonk Project).

The engine's random generator is **PCG** (`thirdparty/pcg`, Copyright 2014 Melissa O'Neill
<oneill@pcg-random.org>, Apache License 2.0, https://www.apache.org/licenses/LICENSE-2.0); its translation is in
`src/rt/random.ts`.

## The game content: CC BY 3.0 and CC0

The content (`planet/`: graphics, models, sounds, music, maps, texts) is licensed under the **Creative Commons
Attribution 3.0 Unported** license (https://creativecommons.org/licenses/by/3.0/; `planet/COPYING`). Its
authors are listed in `planet/AUTHORS` and in the `Authors.txt`/`authors.txt` files of the content folders; these
files ship with the content. Music: Martin Strohmeier (K-Pone), CC BY 3.0. Material textures: Matthi, MimmoO,
Nachtfalter, Newton, RedWolf Design, Win, CC BY 3.0. Sounds: the authors in `Sound.ocg/authors.txt`, most of them
adapted from freesound.org under CC0, CC BY 3.0 or CC BY 4.0 (each source page read on 13.11.2026). The content is
used as it is, packed by the original's own `c4group` tool (`re/openclonk/tools/pack.sh`).

Further notes from the content's own credits: the rope texture of `Decoration.ocd/Room.ocd/WoodenSign.ocd` is
used "with special permission for use in OpenClonk under CC BY 3.0"; the texture of
`Items.ocd/Tools.ocd/Lantern.ocd` is from Image*After, "relicensed to CC-BY"; `Icons.ocd/Number.ocd` was drawn
with the fonts Webly Sleek and Blender BFont; `Graphics.ocg/ControllerIcons.png` by Nicolae Berbece is CC0;
`Icons.ocd/Skull.ocd` is from Pixabay (Clker-Free-Vector-Images), named CC0 by the original.

## Non-commercial files

Four files of the original come from sources that are **non-commercial today** (checked 13.11.2026):

| File | Source | Licence the source shows |
| --- | --- | --- |
| `Sound.ocg/Environment.ocg/WindLoop.ogg` | "wind.wav" by ERH, https://freesound.org/people/ERH/sounds/34338/ | CC BY-NC 4.0 |
| `Sound.ocg/Hits.ocg/Materials.ocg/Glass.ocg/GlassShatter.ogg` | "breaking_a_bottle_no2.wav" by Connum, https://freesound.org/people/Connum/sounds/66520/ | CC BY-NC 4.0 |
| `Graphics.ocg/StartupDlgPaper.png`, `Graphics.ocg/StartupPlrPropBG.png` | "old crackly parchment texture" by Teeth-Man, https://www.deviantart.com/teeth-man/art/old-crackly-parchment-texture-62016461 | CC BY-SA 3.0 badge; the artist's text: free to use "non-commerically, unless express permission is given", with credit and a link back |

They are **not shipped**: the shipped build sets **`NONCOMMERCIAL_FILES`** in `src/settings.ts` to `false`, so they are
neither built nor committed (`re/openclonk/tools/pack.sh` keeps them out of the packed groups) and the game runs without
them (`README.md`). The operator's decision of 14.11.2026 keeps the setting as the mechanism: set to `true` (for a
non-commercial build) the four files are part of the game unchanged, and `pack.sh` writes them beside the groups; the
tests run both states. The site's rule is that every asset it ships is free for any use, commercial use included, and
these four are not: CC BY-NC 4.0 for the two sounds and the artist's non-commercial terms for the two images. None of the
four is in `web/games/openclonk/assets` or in a build of the site.

The original does not open its start menu without the two parchment images, so with the setting off the page puts plain
images of the same sizes in their place, made by the page in one colour of its own choice (light sand, RGBA d8c8a4ff;
`src/app.ts` PARCHMENT_STANDINS): nothing of Teeth-Man's texture is used.

## This port: GPL-3.0-or-later

The port is a derivative work of OpenClonk: the engine's C++ source translated to TypeScript by a translator
written for it (`re/openclonk/tools/cpp2ts`; the translations are `src/sim/` and `src/aul/`), with a runtime for
what the translated code needs from C++ and its library (`src/rt/`). The port's code is licensed under the **GNU
General Public License, version 3 or (at your option) any later version**
(https://www.gnu.org/licenses/gpl-3.0.html), with the ISC and Apache-2.0 notices above kept for the code it is
made from. This program comes with ABSOLUTELY NO WARRANTY. The source of the port, the translator and the test
oracles are in this site's source archive ("Licenses & source").

## The content in this folder

`assets/` holds the original's content groups packed by the original's own `c4group` tool
(`re/openclonk/tools/pack.sh --out web/games/openclonk/assets`): `Graphics.ocg`, `Material.ocg`, `Sound.ocg`,
`System.ocg`, `Objects.ocd`, `Decoration.ocd`, `Music.ocg` and the six scenario folders (`Arena.ocf`, `Parkour.ocf`,
`Defense.ocf`, `Missions.ocf`, `Tutorials.ocf`, `Worlds.ocf`). They are the original's files, unchanged except that the
four non-commercial files above are left out (a copy of the groups without them), under the licences above. The groups
are committed so that a clean checkout builds; `pack.sh` rebuilds them byte for byte from the reference source.

## Favicon

`web/icons/openclonk.png` (48x48) and `web/icons/openclonk-180.png` (180x180), drawn by `web/scripts/icons.py`
(`i_openclonk`), are the clonk's portrait from the content, `Objects.ocd/Clonk.ocd/GraphicsPortrait.png` (64x64), on a
tile of the game's earth brown. The portrait is part of the content under CC BY 3.0 (`LICENSE.md` above,
`planet/AUTHORS`); nothing else of the original is used in the icons.
