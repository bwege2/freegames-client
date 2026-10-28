# Worms?: license and credits

**The original game**: Worms?, Copyright (C) 1983 David S. Maynard, published by Electronic Arts for
the Atari 8-bit computers and the Commodore 64. The Commodore 64 version is by David S. Maynard and
Steven Hayes. Maynard released the Forth source code of both versions; Kay Savetz published it,
from the original floppy disks, at https://github.com/savetz/worms under the MIT license:

> MIT License
>
> Copyright (c) 2021 Kay Savetz
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
> associated documentation files (the "Software"), to deal in the Software without restriction,
> including without limitation the rights to use, copy, modify, merge, publish, distribute,
> sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or
> substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
> NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
> NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
> OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
> CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

The game's data (the worm trail characters, the cursor pictures and masks, the note table, the
texts) is in its source and is copied from there into `src/data.ts`.

**This port** (`src/`, `test/`, `re/worms/`, `protocol/games/worms.capnp` and the server module
`server/.../games/worms/` in this repository) is a translation of that source by the freegames
project, under the same MIT license (the notice above). The online play is new in this port.

**The character set** (`assets/chargen.bin`): the program copies the Commodore 64's character ROM,
which is Commodore's. In its place the port uses the free C64-compatible character set of the MEGA65
Open ROMs (https://github.com/MEGA65/open-roms, `bin/chargen_openroms.rom`, its first 2 KiB
unchanged), Copyright (C) 2019 Paul Gardner-Stephen, 2019-2021 Roman Standzikowski (FeralChild64),
under the GNU Lesser General Public License, version 3 or (at your option) any later version
(https://www.gnu.org/licenses/lgpl-3.0.html). `re/worms/fetch.sh` downloads it and writes the file.

**Other parts**: the colours are Philip "Pepto" Timmermann's "Colodore" palette of the VIC-II. The
tests run the original on a 6502 core (`test/cpu6502.ts`) written for this repository's Pinball
Construction Set port, under the same MIT license as this port, and rebuild the Forth system under
the game on the model of fig-FORTH 1.1 for the 6502 (W. F. Ragsdale, Forth Interest Group, public
domain).
