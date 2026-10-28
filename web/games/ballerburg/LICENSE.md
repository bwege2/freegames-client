# Ballerburg: license and credits

**The original game**: Ballerburg, Copyright (C) 1987, 1989 Eckhard Kruse. It was published for the
Atari ST as public domain software, and Eckhard Kruse later released its source code to the public.
The castles (`assets/baller.dat`, partly designed by Kolja Koischwitz for Ballerburg²) and the music
(`assets/baller.mus`, made with Kruse's music editor of 1986) are his data files, copied unchanged.

**The SDL version**: Ballerburg SDL 1.2.3, Copyright (C) 2010–2025 Thomas Huth (https://baller.frama.io/),
under the GNU General Public License, version 3 or (at your option) any later version. It contains
parts under other free licenses:

* sdlgui.c and dlgAlert.c, the dialog GUI (from Hatari; Thomas Huth, Petr Stehlik), and psg.c, the
  YM-2149 sound chip emulation libpsg (Stefan Berndtsson, NoCrew; Thomas Huth): GNU GPL, version 2 or
  any later version.
* sdlgfx.c, a reduced SDL_gfxPrimitives (Andreas Schiffler): zlib license ("This software is provided
  'as-is', without any express or implied warranty. … Permission is granted to anyone to use this
  software for any purpose, including commercial applications, and to alter it and redistribute it
  freely, subject to the following restrictions: 1. The origin of this software must not be
  misrepresented … 2. Altered source versions must be plainly marked as such … 3. This notice may not
  be removed or altered from any source distribution.").
* font8x16.h, the GUI font (`assets/font8x16.bin`, its bits converted losslessly): public domain.

**This port** (`src/`, `test/`, and `re/ballerburg/` in this repository) is an altered version: a
TypeScript port of Ballerburg SDL's C sources by the freegames project. Like the SDL version, it is
under the GNU General Public License, version 3 or (at your option) any later version. The text of
the license is at https://www.gnu.org/licenses/gpl-3.0.html. `src/sdlgfx.ts` is marked as the altered
version of sdlgfx.c that it is, and keeps its notice above. `src/glibcRand.ts` reimplements the
algorithm of glibc's `rand()` (from the Passage port of this repository).

The online play (`src/online.ts`, `src/moves.ts`, `protocol/games/ballerburg.capnp`, the server
module) is new in this port, under the same license.

**Credits** (from the SDL version's doc/authors.txt): Eckhard Kruse wrote the original Ballerburg;
Thomas Huth adapted it to recent systems and maintains Ballerburg SDL; Jens Ropers wrote most of the
English texts; Stefan Berndtsson wrote the PSG emulation; Kolja Koischwitz designed additional castles;
Andreas Schiffler wrote SDL_gfxPrimitives. The SDL version is dedicated to Martina Huth.
