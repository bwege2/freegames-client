# Maelstrom: license and credits

**Maelstrom** was created by **Ambrosia Software** in 1993. This port uses the open-source
**Maelstrom 4.0.2** by Sam Lantinga and contributors as its reference
(`maelstrom_4.0.2+ds.orig.tar.xz`, sha256
`3eb12e2c037abc89c7c1a203df19610bb1218050aafa51574259347f8fac46b4`).

The source code of Maelstrom 4.0 is released under the **zlib license**:

```
Copyright (C) 1997-2026 Sam Lantinga <slouken@libsdl.org>

This software is provided 'as-is', without any express or implied warranty. In no event will the
authors be held liable for any damages arising from the use of this software.

Permission is granted to anyone to use this software for any purpose, including commercial
applications, and to alter it and redistribute it freely, subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the
   original software. If you use this software in a product, an acknowledgment in the product
   documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being
   the original software.
3. This notice may not be removed or altered from any source distribution.
```

The artwork and animations in Maelstrom may be used under the **Creative Commons Attribution 3.0**
license (unported): <https://creativecommons.org/licenses/by/3.0/legalcode>. The original Maelstrom
artwork is by Ambrosia Software and is distributed under CC BY 3.0 with the Maelstrom 4.0.2 source. The sound
effects and music are by Ambrosia Software; no licence for them reached us, so this port ships none of them.

## This port

The TypeScript port in `src/`, the asset extractor in `re/maelstrom/tools/` and the browser menu are
by the freegames project and are licensed **zlib** (the same terms as the original source), with the
artwork under CC BY 3.0. It is altered source, not the original program. The website and game SDK
are GPL-3.0-or-later with an additional permission under section 7 (`web/LICENSE.md`); the game
code and assets keep their own licenses above.

The files under `assets/` are copied unchanged from the Maelstrom 4.0.2 `Data/` directory (with
`#` in file names replaced by `_` so a browser import can address them); the sprite tables in
`src/assets/tables.ts` are generated from `game/init.cpp` by
`re/maelstrom/tools/build-assets.py`. The original archive is not committed; fetch it with
`re/maelstrom/fetch.sh`.
