# Colossal Cave Adventure: license and credits

* **Game**: Will Crowther wrote the first Adventure in 1976 (FORTRAN, PDP-10, at Bolt, Beranek and
  Newman), after the Colossal Cave in Kentucky. Don Woods expanded it at the Stanford AI Lab in 1977
  (350 points). Crowther and Woods continued it until Adventure 2.5 in 1995 (430 points), the version
  this port follows.
* **Open Adventure**: Eric S. Raymond revived Adventure 2.5 in 2017 as Open Adventure, with Don
  Woods' permission to release it under the BSD 2-clause license; maintained by Eric S. Raymond and
  Jason Ninneman, with Peje Nilsson, Petr Voropaev, Aaron Traas, Ryan Sarson and the other contributors
  to <https://gitlab.com/esr/open-adventure>. This port follows release 1.22.
* **Port**: the freegames project (TypeScript, `src/`), a translation of Open Adventure 1.22's C files;
  `src/dungeon.ts` is generated from its `adventure.yaml`. `test/regress/` is Open Adventure's own
  regression suite, unchanged; `test/fixtures/` holds save files and terminal sessions made by running
  the original (`re/adventure/`).

The game, Open Adventure and this port are under the BSD 2-clause license
(SPDX-License-Identifier: BSD-2-Clause):

```
Copyright (C) 1977, 2005 by Will Crowther and Don Woods
Copyright (C) Eric S. Raymond <esr@thyrsus.com> (Open Adventure, adventure.yaml, the regression suite)

		BSD 2-Clause LICENSE

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

1. Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in the
documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```
