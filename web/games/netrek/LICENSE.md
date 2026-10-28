# Netrek: license and credits

This port is made from two packages of the Netrek project (https://www.netrek.org/):

* **netrek-server-vanilla 2.19.0** (2016), the "Vanilla" server: its universe (daemon), its per-player server
  (ntserv) and its robots, ported to Java in our server (`server/.../games/netrek/`);
* **netrek-client-cow 3.3.3** (2026), the COW client: translated to TypeScript in `src/`, with its ship,
  planet and explosion images (`assets/`, copied unchanged from the package's `pixmaps/` and the bitmaps in
  its sources).

Both are under the Netrek license (`include/copyright.h` of the server, `copyright.h` and `copyright2.h` of
the client), a permissive license of the MIT/HPND kind. This port is distributed under the same terms.

> Copyright (c) 1986 Chris Guthrie
>
> Permission to use, copy, modify, and distribute this software and its documentation for any purpose and
> without fee is hereby granted, provided that the above copyright notice appear in all copies and that both
> that copyright notice and this permission notice appear in supporting documentation. No representations
> are made about the suitability of this software for any purpose. It is provided "as is" without express or
> implied warranty.
>
> Copyright 1989 Kevin P. Smith, Scott Silvey
>
> ditto.
>
> Copyright 1993 (COW (BRM) authors, including but not limited to: Kevin Powell, Nick Trown, Jeff Nelson,
> Kurt Siegl): As above. Use at your own risk.
>
> Copyright 1994: As above. Hockey Lines added to COW by Nathan Doss, Michael Kantner.
>
> Copyright (c) 1993 Tedd Hadley, Heiko Wengler (short packets): ditto.

(`copyright2.h`: "Copyright 1989 Kevin P. Smith, Scott Silvey. Permission to use, copy, modify, and distribute
this software and its documentation for any purpose and without fee is hereby granted, provided that the above
copyright notice appear in all copies.")

Some files carry licenses of their own; all permissive:

* **dashboard.c, dashboard3.c** (client): Copyright (C) 1993, 1996 Lars Bernhardsson. Redistribution and
  use in source and binary forms, with or without modification, are permitted provided that the following
  conditions are met: 1. Redistributions of source code must retain the above copyright notice, this list of
  conditions and the following disclaimer. 2. Redistributions in binary form must reproduce the above
  copyright notice, this list of conditions and the following disclaimer in the documentation and/or other
  materials provided with the distribution. THIS SOFTWARE IS PROVIDED BY THE AUTHOR "AS IS" AND ANY EXPRESS OR
  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
  A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
  SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
  ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
* **random.c, setstate.c** (client) and **ntserv/random.c** (server): Copyright (c) 1983, 1993 The Regents of
  the University of California, the BSD license (its advertising clause was withdrawn by the University in
  1999). This port uses the C library's random() of the browser runtime and of Java instead of these files'
  code where the original build does not compile them.
* **tools.c** (client): copyright 1993 Kurt Siegl: "Free to use, hack, etc. Just keep these credits here."
* **helpwin.c, defwin.c** (client): 1991 Eric Mehlhaff; **macrowin.c**: 1993 Nick Trown; **cowapi.h**: 1996
  Kurt Siegl: under the package license above.

Not used, because they are under the GPL and not needed: the client's `lurk.py` and the server's
`tools/metaget.c`.

**Not included: sounds.** COW 3.3.3 plays sounds, but its release contains none: the separate sound package
(COW-Sound 3.00) has no license and contains Star Trek audio (`re/netrek/NOTES.md`). This port is silent.
Images: 3.3.3 removed the images whose use was not licensed ("finish removing Kathy Ireland imagery, no license
for use", its ChangeLog); only 3.3.3's images are used.

## Fonts

The X server in the browser (`src/xlib/fonts.ts`) draws the bitmap fonts the original's X server gives COW,
converted losslessly from X.org's BDF sources (`re/netrek/tools/bdf.sh`):

* font-misc-misc 1.1.3 (`fixed`, 6x13 and the other misc-fixed fonts): "Public domain font.  Share and enjoy."
* font-schumacher-misc 1.1.3 (`clean`):

```
Copyright 1989 Dale Schumacher, dal@syntel.mn.org
               399 Beacon Ave.
               St. Paul, MN  55104-3527

Permission to use, copy, modify, and distribute this software and
its documentation for any purpose and without fee is hereby
granted, provided that the above copyright notice appear in all
copies and that both that copyright notice and this permission
notice appear in supporting documentation, and that the name of
Dale Schumacher not be used in advertising or publicity pertaining to
distribution of the software without specific, written prior
permission.  Dale Schumacher makes no representations about the
suitability of this software for any purpose.  It is provided "as
is" without express or implied warranty.
```

## Credits

Netrek was written by Kevin P. Smith and Scott Silvey (1989), from Xtrek by Chris Guthrie (1986). The COW
client: Kevin Powell, Nick Trown, Jeff Nelson, Kurt Siegl, Lars Bernhardsson, Nathan Doss, Michael Kantner,
Eric Mehlhaff, Tedd Hadley, Heiko Wengler and many others; maintained by James Cameron (quozl) and the Netrek
developers, who also maintain the Vanilla server (its `docs/CREDITS`). Feedback to the client's authors:
cow@netrek.org.

This browser port (the client in `src/`, the server in `server/.../games/netrek/`) was made for this site in
2026 and is distributed under the license above.
