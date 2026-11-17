# No Gravity: license and credits

**No Gravity** is by **realtech VR**: programming Stéphane Denis, graphics and design Romuald
Genevois, music and sounds Philippe Meisburger and Alexandre Liverneaux, Linux/SDL port Matt
Williams (credits of the game, `voix/e_credit.txt`, and of its `README.TXT`). The reference for this
port is release **2.0** of 15 February 2006 (`rt-nogravity-2.0.x86.package` from SourceForge, sha256
`0d38af8204b157ed84e6aab2a1c930b1798c693c99c46afca26e278b6af39c44`, with its data archive
`NOGRAVITY.RMX`, sha256 `e4fe94a5187803de7c9b9dec58b78edda02b159bfff6f71c3cc5d1e117d21b76`) and the
source code in the project's CVS repository (`re/nogravity/fetch.sh`). The licence check of every
part is `re/nogravity/LICENSE.md`.

```
Copyright (C) 1996, 2005 - realtech VR
No Gravity is free software; you can redistribute it and/or modify it under the terms of the GNU
General Public License as published by the Free Software Foundation; either version 2 of the
License, or (at your option) any later version.
```

realtech VR on the game data of release 2.0: "No Gravity is free of charge, covered under the GPL
license(*)" — "(*) Source code and game data are both covered under GPL."
(`http://www.nogravitythegame.com/classic/download.html`, archived 2008 at
`https://web.archive.org/web/20080906230635/http://www.nogravitythegame.com:80/classic/download.html`).

| Part | In this folder | Copyright | License |
| --- | --- | --- | --- |
| Game code (`src/*.c`, ported in `src/game/`) and engine (`rlx32/`, the parts the game needs ported in `src/v3x/`, `src/gx/`, `src/sys/`) | | 1996-2005 realtech VR | GPL-2.0-or-later |
| 3D scenes and models (`ep_*/*.vmx`), textures and palettes (`ep_*/*.png`, `*.act`) | `assets/ep_1` ... `assets/ep_5` (unchanged) | 1996-2006 realtech VR | GPL (realtech VR's statement above) |
| Mission scripts, mission texts, languages, lists (`cmx/`, `voix/*.msg`, `voix/*.txt`, `*.lst`) | `assets/cmx`, `assets/voix`, `assets/anim/anim.lst` (unchanged) | realtech VR | GPL |
| Pictures, sprite fonts, HUD (`menu/`, `int/`, `brief/`), animations (`*.flc`) | `assets/menu`, `assets/int`, `assets/brief`, `assets/anim` (unchanged) | realtech VR | GPL |
| Sounds (`voix/*.wav`) and music (`music/*.ogg`) | `assets/voix`, `assets/music` (unchanged) | Philippe Meisburger, Alexandre Liverneaux / realtech VR | GPL |
| Demo recordings (`menu/record*.dem`) | `assets/menu` (unchanged) | realtech VR | GPL |

No file of the original was replaced: all of its code and data are free (`re/nogravity/LICENSE.md`).
Files of the archive the game never loads are left out (the editor's `*.bak` backups, an unused copy
of stage 42, a BeOS description file and the old `demo*.dem` recordings, which the game reads only when
the `record*.dem` files are missing).

## Favicon

`web/icons/nogravity.png` and `nogravity-180.png` show the game's logo, cut from the menu picture
`assets/menu/lit_mn01.png` (realtech VR, GPL), on a tile drawn by `web/scripts/icons.py`.

## This port

The TypeScript in `src/`, the tests in `test/` and the tools in `re/nogravity/` are by the freegames
project, a modified version of No Gravity: every file says so in its header. It is distributed under
the GNU General Public License, version 3 or later (`public/licenses/GPL-3.0.txt`), as the original's
"or (at your option) any later version" allows. The name "No Gravity" is a trademark of realtech VR;
it is used to say which game this port follows, not to suggest that realtech VR endorses it.
