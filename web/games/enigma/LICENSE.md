# Enigma: license and credits

**Game**: Enigma 1.30 (2021), Copyright (C) 2002-2021 Daniel Heck and the Enigma contributors (main developers
of the releases: Daniel Heck, Ronald Lamprecht, Andreas Lochmann, Raoul Bourquin, Thomas Bernhardt, Georg Honold,
Nobby, Petr Machata, Siegfried Fennig, Martin Hawlisch, Ralf Westram and many more; see the release's manual,
section "Credits"), under the **GNU General Public License, version 2 or (at your option) any later version**
(the release's `COPYING` and the headers of its source files, e.g. `data/api2init.lua`: "either version 2 of the
License, or (at your option) any later version"). Debian distributes the whole release (code, graphics, levels,
sounds, music) under GPL-2+ (its `debian/copyright`: `Files: *`, `License: GPL-2+`). Enigma is a free remake of
Oxyd by Meinolf Schneider and Dongleware; it contains no data of the Oxyd games.

**This port** (`src/`) is a TypeScript translation of Enigma's C++ engine and object library, run with the
original's Lua files, and is distributed as part of freegames under the **GNU General Public License, version 3
or later** (allowed by "or any later version"). It is an altered version of Enigma.

## The data the port ships, by group

`re/enigma/assets.py` copies the data from the release unchanged; the level files of a pack are bundled into one
JSON file per pack with their XML text unchanged.

| Group | Files (assets/) | Author | License |
| --- | --- | --- | --- |
| Engine data | `data/api2init.lua`, `compat.lua`, `security.lua`, `models.lua`, `models-2d.lua`, `models-32.lua`, `sound-defaults.lua`, `objects.xml` | Ronald Lamprecht, Daniel Heck, Raoul Bourquin and the Enigma team | GPL-2.0-or-later (file headers) |
| Graphics | `gfx32/*.png`, `gfx32/menu_bg.jpg`, `gfx/*.png` | Daniel Heck, Martin Hawlisch, Siegfried Fennig, Johannes Fortmann, Jennifer Robertson, Raoul Bourquin and the Enigma team | GPL-2.0-or-later (the release's license; Debian GPL-2+) |
| Levels | `levels/*.json` (1,099 levels of the Tutorial, Enigma I-XI, Esprit, Oxyd, Per.Oxyd, Oxyd Magnum, Oxyd Extra and Advent 2010 packs) and `levels/lib.json` (the level libraries they use) | each level's author as named in the file (`el:author`, `el:copyright`) | per level, see below |
| Sound effects | `sound/*.wav` except `menuok.wav` | Enigma team; `shatter.wav` from AfterStep (GPL-2+), `st-oxydopened.wav` and `boing.wav` from XBoing (Justin C. Kibell, X Consortium contrib license: free to use, copy, modify, sell), `invrotate.wav` and `st-move.wav` from LBreakout2 (Michael Speck, GPL-2+); the rest "to the best knowledge in the public domain" (`data/soundsets/enigma/README`) | GPL-2.0-or-later as part of the release / the licenses named |
| Menu music | `music/esprit.ogg`, `music/enigma_rag.ogg` | Clifford J. Tasner ("Taztunes", credited for the music in the manual) | GPL-2.0-or-later as part of the release (Debian GPL-2+) |
| Font | `fonts/DejaVuSansCondensed.ttf` | Bitstream, Inc. (Bitstream Vera), DejaVu changes in the public domain, Arev glyphs Tavmjong Bah | Bitstream Vera Fonts license (free, may be sold as part of a larger package; see the release's `ACKNOWLEDGEMENTS`) |

### Levels: the licence of every level file

Every level file names its licence (`<el:license el:type="...">`). The port only takes levels whose licence is
free, allows commercial use and is compatible with the GPL version 3:

| `el:type` in the file | Meaning | Levels | Taken |
| --- | --- | --- | --- |
| "GPL v2.0 or above" (and the typo "GPJ v2.0 or above") | GPL-2.0-or-later | 1,040 | yes |
| "Donated to Enigma under the project's license" | GPL-2.0-or-later (the project's license) | 53 | yes |
| "public domain", "public domain Sokoban level" | public domain | 6 | yes |
| "GPL version 2", "GPL v2.0" | GPL version 2 **only** (the files and the 0.92 originals say "Licensed under the GPL version 2." without "or later"): not compatible with GPL-3.0 | 284 | **no** |
| "" (empty), "see Lua code below" | no clear licence | 2 | **no** |

The counts are entries of the pack indices (a few levels appear in two packs). 1,099 entries are taken. Not taken in addition: the 142 levels for the old level API of Enigma 0.92-1.01 (the
port runs API 2 levels only), and the Sokoban, Pentomino, development and user packs.

## Replaced assets

Two files of the release have no documented free license; the port ships its own replacements under the same
names and formats, made from scratch by `re/enigma/replacements/make.py` (no material taken from anywhere):

| File | Original | Why replaced | Replacement | License of the replacement |
| --- | --- | --- | --- | --- |
| `sound/menuok.wav` (16-bit mono PCM, 22050 Hz) | from xlogical (soundsets README) | xlogical's license (its version) cannot be verified any more | a synthesized two-tone click, written by the script | CC0 1.0 (public domain), freegames project |
| `music/pentagonal_dreams.s3m` (ScreamTracker 3 module) | "Pentagonal Dreams" by Andrew "Necros" Sega | the manual only credits it; no license is given | a 3-voice pentatonic piece with synthesized instruments, written by the script | CC0 1.0 (public domain), freegames project |

## Not shipped

The in-game music (`music/game/*.ogg`, off by default in the original), the MicroHei font (the port uses
DejaVu Sans Condensed, which `models-32.lua` names as the alternative), the other graphics sets (gfx16, gfx40,
gfx48, gfx64, retro), the translations, and the Oxyd sound sets of the original's options (they need the
commercial Oxyd games' data, which Enigma does not contain).

## Lua

The port's Lua 5.1 interpreter (`src/lua/`) is the freegames project's own, written after the algorithms of Lua
5.1.4 (`ltable.c`, `lstrlib.c`, `ltablib.c`), which Enigma bundles: Copyright (C) 1994-2008 Lua.org, PUC-Rio,
MIT license:

> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
> documentation files (the "Software"), to deal in the Software without restriction, including without limitation
> the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
> to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above
> copyright notice and this permission notice shall be included in all copies or substantial portions of the
> Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.

## glibc's pow

`src/engine/pow.ts` and the tables in `src/engine/pow-data.ts` (generated by `re/enigma/powtables.py`) are a
translation of `pow` from the GNU C Library 2.44 (`sysdeps/ieee754/dbl-64/e_pow.c`, `e_pow_log_data.c`,
`e_exp_data.c`; Copyright (C) 2018-2026 Free Software Foundation, Inc.; written by Szabolcs Nagy), under the
**GNU Lesser General Public License, version 2.1 or later**, which allows its use in this GPL-3.0-or-later program.
The original calls this function for the marble's friction; the port needs its exact results.

## Favicon

The favicon of the game's page (`web/icons/enigma.png`, 48x48, and `web/icons/enigma-180.png`, 180x180; drawn by
`web/scripts/icons.py`) is made from the release's `gfx/enigma_marble.png` (Enigma team, GPL-2.0-or-later),
placed on a dark rounded square and scaled; it is an altered version of that image.
