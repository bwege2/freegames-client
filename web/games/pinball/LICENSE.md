# License and credits

**Pinball Construction Set** — Bill Budge, Electronic Arts, 1983 (Apple II).

The reference version of this port is the Apple II 6502 source published by Bill Budge at
<https://github.com/billbudge/PCS_AppleII>. The parts' bitmaps (`BITMAPS.OBJ`), the Apple II title
picture (`PCSA2.PIC`) and the starting table (`TST.O`) come from the Atari 800 version's source,
published by Bill Budge at <https://github.com/billbudge/PCS_Atari800>. Both are under the MIT
license:

```
Copyright (C) 1982 Bill Budge

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

The browser port (`web/games/pinball/`) is a translation of that source and is distributed under the
same MIT license. `src/image.ts` holds what the listings assemble to, `src/assets.ts` the bitmaps, the
title picture and the starting table converted from the Atari repository's files
(`test/gen-image.ts`, `test/gen-assets.ts`).

DOS 3.3 (Apple Computer) is not part of the port: `src/fm.ts` reproduces the behaviour of its file
manager that `DISK.S` relies on, and `src/disk.ts` shows DOS's error messages.
