# License and credits

## Umoria 5.7.15

This port is a translation of Umoria 5.7.15 (<https://github.com/dungeons-of-moria/umoria>, tag
v5.7.15) into TypeScript and is distributed, like Umoria, under the **GNU General Public License,
version 3 or (at your option) any later version** (GPL-3.0-or-later):
<https://www.gnu.org/licenses/gpl-3.0.html>. The package's `LICENSE` has the full text.

    Copyright (c) 1981-86 Robert A. Koeneke
    Copyright (c) 1987-94 James E. Wilson

    This program is free software: you can redistribute it and/or modify it under the terms of the GNU
    General Public License as published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
    even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
    General Public License for more details.

In 2008 Moria and Umoria were re-licensed under the GNU GPL (version 3.0 or later); the earlier parts
were under GPL v2 (see the package's `AUTHORS`).

### Authors (from the package's AUTHORS)

- **Robert Alan Koeneke** [-RAK-]: created Moria (VMS Pascal, 1981-86).
- **James E. Wilson** [-JEW-]: took the VMS Moria sources and created Umoria (C, 1987-94).
- **Michael R. Cook** [-MRC-]: the Umoria restoration project and the C++ refactoring of 5.7.x.
- **David J. Grabiner** [-DJG-]: maintainer; large items in chests.
- **Jimmey Wayne Todd Jr.** [-JWT-]: character generation and adjustments, total points, the character
  record, saving and loading, the score file.
- **Christopher J. Stuart** [-CJS-]: monster recall, options, the inventory, running.
- **D. G. Kneller**: the MS-DOS port, the reduced map display.
- and everyone else the package's `AUTHORS` lists: ports to the Macintosh, Atari ST, Amiga and other
  systems, bug fixes and features from 1983 to 2021.

### What the port uses

- The program's logic and every table: monsters, objects, spells and prayers, races, classes and
  backgrounds, stores and their owners, the shopkeepers' speeches, monster memories (`src/data_*.ts`,
  from `src/data_*.cpp`).
- The text files the program reads at run time (`assets/data/`): `help.txt`, `rl_help.txt`,
  `help_wizard.txt`, `rl_help_wizard.txt`, `welcome.txt`, `death_tomb.txt`, `death_royal.txt`, and
  `splash.txt` and `versions.txt`, which CMake writes from their `.in` files with the version (5.7.15)
  and the release date (2021-06-02), as `re/moria/oracle/build.sh` does.

## The port

Copyright the freegames contributors, under the same license (GPL-3.0-or-later). The terminal it runs
in is the website's `TextScreen` (`web/src/sdk/terminal.ts`).
