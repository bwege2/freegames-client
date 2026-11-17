# X-Moto: license and credits

**X-Moto** was started by **Rasmus Neckelmann** in 2005 and developed by **Nicolas Adenis-Lamarre**,
**Emmanuel Gorse**, **Jens Erler** and the X-Moto development team. The reference for this port is
**X-Moto 0.6.3**, the source archive of the `v0.6.3` tag at https://github.com/xmoto/xmoto
(`xmoto-0.6.3.tar.gz`, sha256 `64cb29934660456ec82cebdaa0d3d273a862e10760e8ee80443928d317242484`,
downloaded by `re/xmoto/fetch.sh`).

```
XMOTO is free software; you can redistribute it and/or modify it under the terms of the GNU General
Public License as published by the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.
Copyright: 2005-2006 Rasmus Neckelmann, 2006-2014 Nicolas Adenis-Lamarre, 2007-2011 Emmanuel Gorse,
2009-2010 Jens Erler, 2005-2025 X-Moto Development Team
```

## The data in `assets/`, by group

The release's `COPYING` is the GPL version 2; its source files carry the "version 2 or (at your
option) any later version" notice, and the data in `bin/` is shipped under the same terms
(Debian's `debian/copyright` for xmoto 0.6.3+repack-1 covers every file, data included, with
`Files: *  License: GPL-2+`; Debian ships it in `main`, Fedora as `GPL-2.0-or-later`). All of it
allows commercial use and modification and is compatible with the GPL version 3.

| Group | Files | Authors | License |
| --- | --- | --- | --- |
| Levels | `levels.json.gz`: the 307 `.lvl` levels and 3 `.lvs` tutorial scripts of `bin/package.lst`, packed unchanged | the level authors named in each file (`<author>`), collected by the X-Moto team | GPL-2.0-or-later |
| Physics | `Physics/original.xml` | X-Moto team | GPL-2.0-or-later |
| Theme | `Themes/original.xml` (the default theme "Classic") | X-Moto team | GPL-2.0-or-later |
| Block textures | `Textures/Textures/*` | X-Moto team and the contributors of the X-Moto texture collection (the `_NNN` numbers are its ids) | GPL-2.0-or-later |
| Sprites, animations | `Textures/Anims/*`, `Textures/Effects/*`, `Textures/Misc/*` | X-Moto team and contributors; the Tux sprites derive from Larry Ewing's Tux ("Permission to use and/or modify this image is granted provided you acknowledge me lewing@isc.tamu.edu and The GIMP if someone asks") | GPL-2.0-or-later |
| Bike and rider | `Textures/Riders/*` | X-Moto team | GPL-2.0-or-later |
| User interface | `Textures/UI/*` (title screen, menu pieces) | X-Moto team | GPL-2.0-or-later |
| Sounds | `Textures/Sounds/*` (engine, strawberry, crash, finish, buttons) | X-Moto team | GPL-2.0-or-later |
| Music | `Textures/Musics/menu.ogg` ("Trackdead"), `ridealong.ogg`, `legolodio.ogg`, `MadeiraStew.ogg` by **Jens Erler** (named in the files' tags); `batcave.ogg`, `speeditup.ogg` (no author in the files) | Jens Erler, X-Moto team | GPL-2.0-or-later |
| Fonts | `Textures/Fonts/DejaVuSans.ttf`, `DejaVuSansMono.ttf` | Bitstream, Inc. (Bitstream Vera), DejaVu changes public domain | Bitstream Vera Fonts License (free, commercial use and modification allowed; the font is used, not linked) |

No asset had to be replaced. Two changes are made on the way, both lossless for the game:

* `foxrun.ogg` (Cubulo, 2009) belongs to the release's second theme ("modern") only and is not
  copied, nor is `Themes/modern.xml`.
* The JPEG textures lose their embedded ICC colour profiles (`re/xmoto/tools/strip-icc.mjs`, the
  pixel data is untouched): the original loads its textures without colour management, and three
  of the profiles (Apple's "Generic RGB", "all rights reserved") are not free data. Some JPEGs keep
  camera EXIF fields (`Asphalt1_197.jpg` has "Copyright 1,2000"), which name no owner and are not
  read.

## This port

The TypeScript port in `src/`, the oracle in `re/xmoto/oracle/` and the tools in `re/xmoto/tools/`
are by the freegames project and are licensed **GPL-2.0-or-later**, the same terms as the original.
The website and game SDK are GPL-3.0-or-later with an additional permission under section 7
(`web/LICENSE.md`); the original here is GPL-2.0-or-later, so no exception is needed. The port is
altered source, not the original program.

Translated into the port, with their own terms (all GPL-compatible):

* **Open Dynamics Engine** (X-Moto's `vendor/ode`), the parts the bike uses, in `src/ode.ts`:
  Copyright (C) 2001-2003 Russell L. Smith, 2008 Oleh Derevenko; LGPL-2.1-or-later **or**
  BSD-3-Clause (used here under the BSD terms: "Redistribution and use in source and binary forms,
  with or without modification, are permitted provided that the following conditions are met:
  1. Redistributions of source code must retain the copyright notice, this list of conditions and
  the following disclaimer. 2. Redistributions in binary form must reproduce the copyright notice,
  this list of conditions and the following disclaimer in the documentation and/or other materials
  provided with the distribution. 3. The name of the author may not be used to endorse or promote
  products derived from this software without specific prior written permission. THIS SOFTWARE IS
  PROVIDED BY THE AUTHOR "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES ... ARE DISCLAIMED.").
* **musl libc 1.2.5** `sin`, `cos`, `atan`, `atan2` (`src/math/`), in `src/xmath.ts`: Copyright ©
  2005-2020 Rich Felker et al., MIT license ("Permission is hereby granted, free of charge, to any
  person obtaining a copy of this software ... The above copyright notice and this permission
  notice shall be included in all copies or substantial portions of the Software."); derived from
  FreeBSD's fdlibm, Copyright (C) 1993 by Sun Microsystems, Inc. "Developed at SunSoft, a Sun
  Microsystems, Inc. business. Permission to use, copy, modify, and distribute this software is
  freely granted, provided that this notice is preserved."

Used as a library: **fengari 0.1.5** (the Lua 5.3 interpreter in JavaScript that runs the levels'
scripts), Copyright © 2017-2019 Benoit Giannangeli, Daurnimator, © 1994-2017 Lua.org, PUC-Rio,
MIT license (in `web/package.json`).

The GNU GPL version 2 is served as `public/licenses/GPL-2.0.txt` on this site.

## Favicon

The favicon of the game's page (`web/icons/xmoto.png`, 48x48, and `web/icons/xmoto-180.png`,
180x180; drawn by `web/scripts/icons.py`) is X-Moto's own icon `extra/xmoto.png` of the 0.6.3 source
(GPL-2.0-or-later, above), the "X" and the wheel, on a night-blue rounded square.
