# Core War: license and credits

**Core War** was devised by **A. K. Dewdney** and **D. G. Jones** (Scientific American, "Computer
Recreations", May 1984). The rules this port plays are the ICWS'88 standard and the ICWS'94 draft.

**pMARS** 0.9.5, the portable Memory Array Redcode Simulator:
Copyright (C) 1993-2025 Albert Ma, Na'ndor Sieben, Stefan Strack and Mintardjo Wangsaw (Wangsawidjaja).
Its debugger cdb and its expression evaluator are by Stefan Strack (`cdb.c`, `eval.c`). Martin
Maierhofer contributed the X-Windows display. Ken Espiritu optimized `sim.c`. Ilmari Karonen added
`-P`, and Joonas Pihlaja the read/write limits and `-A`. John Metcalf released 0.9.5 (2026). The
package's `AUTHORS` and `ChangeLog` name everyone.

> This program is free software; you can redistribute it and/or modify it under the terms of the GNU
> General Public License as published by the Free Software Foundation; either version 2 of the
> License, or (at your option) any later version.
>
> This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
> even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General
> Public License for more details.

The full text of the GNU General Public License, version 2, is the package's `COPYING`
(`re/corewar/fetch.sh` downloads the package) and https://www.gnu.org/licenses/old-licenses/gpl-2.0.html.

**This port** is a modified version of pMARS. It is a TypeScript translation of its C sources by the
freegames project (`src/`, the server module `server/.../games/corewar/`, the schema
`protocol/games/corewar.capnp`), and it is distributed under the same license, GPL-2.0-or-later.

**Data from the package** (unchanged):
* `assets/warriors/artofcorewar.red`, `excalibur.red`, `forgottenloreii.red`, `sonofvain.red`,
  `sunset.red` and `validate.red` are the package's example warriors, by their `;author`s: The Art of
  CoreWar by Fluffy/Sascha Zapf, Excalibur by inversed, Forgotten Lore II and Sunset by David Moore,
  Son of Vain by Oversby/Pihlaja, Validate 1.1R by Stefan Strack.
* `assets/config/*.opt` and `*.mac` are the package's option files (the KotH hills) and cdb macro files.

**Warriors of the port's tests**: `assets/warriors/imp.red` and `dwarf.red` (A. K. Dewdney's classics,
written down anew), `paper.red`, `scanner.red`, `stone.red` and `switcher.red`, and everything in
`test/warriors/` that does not come from the package. They were written for this port and are under the
same license.
