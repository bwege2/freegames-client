# License and credits

## NetHack 3.6.7

This port is a translation of NetHack 3.6.7 (<https://www.nethack.org/>, the source release
`nethack-367-src.tgz`) into TypeScript, and is distributed, like NetHack, under the **NetHack General
Public License** (NGPL), whose full text follows. Its data (`assets/nhdat`, `license`, `symbols`,
`sysconf`) is NetHack's own, made from the release's `dat/` by its own `makedefs`, `lev_comp`,
`dgn_comp` and `dlb`. The source code of this port (the translated program, its runtime and the tools
that made it, which are in the repository's `re/nethack/`) is part of the source archive offered on the
website's "Licenses & source" page, as the license asks.

    NetHack 3.6  Copyright (c) Stichting Mathematisch Centrum, Amsterdam, 1985.
                 NetHack may be freely redistributed.  See license for details.

Changes from the original are listed in `README.md` (this folder).

```
                    NETHACK GENERAL PUBLIC LICENSE
                    (Copyright 1989 M. Stephenson)

               (Based on the BISON general public license,
                   copyright 1988 Richard M. Stallman)

 Everyone is permitted to copy and distribute verbatim copies of this
 license, but changing it is not allowed.  You can also use this wording to
 make the terms for other programs.

  The license agreements of most software companies keep you at the mercy of
those companies.  By contrast, our general public license is intended to give
everyone the right to share NetHack.  To make sure that you get the rights we
want you to have, we need to make restrictions that forbid anyone to deny you
these rights or to ask you to surrender the rights.  Hence this license
agreement.

  Specifically, we want to make sure that you have the right to give away
copies of NetHack, that you receive source code or else can get it if you
want it, that you can change NetHack or use pieces of it in new free
programs, and that you know you can do these things.

  To make sure that everyone has such rights, we have to forbid you to
deprive anyone else of these rights.  For example, if you distribute copies
of NetHack, you must give the recipients all the rights that you have.  You
must make sure that they, too, receive or can get the source code.  And you
must tell them their rights.

  Also, for our own protection, we must make certain that everyone finds out
that there is no warranty for NetHack.  If NetHack is modified by someone
else and passed on, we want its recipients to know that what they have is
not what we distributed.

  Therefore we (Mike Stephenson and other holders of NetHack copyrights) make
the following terms which say what you must do to be allowed to distribute or
change NetHack.


                        COPYING POLICIES

  1. You may copy and distribute verbatim copies of NetHack source code as
you receive it, in any medium, provided that you keep intact the notices on
all files that refer to copyrights, to this License Agreement, and to the
absence of any warranty; and give any other recipients of the NetHack
program a copy of this License Agreement along with the program.

  2. You may modify your copy or copies of NetHack or any portion of it, and
copy and distribute such modifications under the terms of Paragraph 1 above
(including distributing this License Agreement), provided that you also do the
following:

    a) cause the modified files to carry prominent notices stating that you
    changed the files and the date of any change; and

    b) cause the whole of any work that you distribute or publish, that in
    whole or in part contains or is a derivative of NetHack or any part
    thereof, to be licensed at no charge to all third parties on terms
    identical to those contained in this License Agreement (except that you
    may choose to grant more extensive warranty protection to some or all
    third parties, at your option)

    c) You may charge a distribution fee for the physical act of
    transferring a copy, and you may at your option offer warranty protection
    in exchange for a fee.

  3. You may copy and distribute NetHack (or a portion or derivative of it,
under Paragraph 2) in object code or executable form under the terms of
Paragraphs 1 and 2 above provided that you also do one of the following:

    a) accompany it with the complete machine-readable source code, which
    must be distributed under the terms of Paragraphs 1 and 2 above; or,

    b) accompany it with full information as to how to obtain the complete
    machine-readable source code from an appropriate archive site.  (This
    alternative is allowed only for noncommercial distribution.)

For these purposes, complete source code means either the full source
distribution as originally released over Usenet or updated copies of the
files in this distribution used to create the object code or executable.

  4. You may not copy, sublicense, distribute or transfer NetHack except as
expressly provided under this License Agreement.  Any attempt otherwise to
copy, sublicense, distribute or transfer NetHack is void and your rights to
use the program under this License agreement shall be automatically
terminated.  However, parties who have received computer software programs
from you with this License Agreement will not have their licenses terminated
so long as such parties remain in full compliance.


Stated plainly:  You are permitted to modify NetHack, or otherwise use parts
of NetHack, provided that you comply with the conditions specified above;
in particular, your modified NetHack or program containing parts of NetHack
must remain freely available as provided in this License Agreement.  In
other words, go ahead and share NetHack, but don't try to stop anyone else
from sharing it farther.
```

## Credits

NetHack grew out of **Hack** (1982), written by **Jay Fenlason** with Kenny Woodland, Mike Thome and
Jon Payne, and developed further by **Andries Brouwer** at the Stichting Mathematisch Centrum in
Amsterdam (Hack 1.0, 1984/85). **Don G. Kneller** ported it to the PC, and **Mike Stephenson** merged
the versions into **NetHack 1.4** (1987), working with **Izchak Miller** and **Janet Walz**; this was
the start of the **NetHack Development Team** (the DevTeam), which has written every version since.

The DevTeam of NetHack 3.6 (the Guidebook, "History"): Warwick Allison, Michael Allison, Ken Arromdee,
David Cohrs, Jessie Collet, Pasi Kallinen, Ken Lorber, Dean Luick, Patric Mueller, Pat Rankin, Derek S.
Ray, Alex Smith, Mike Stephenson, Janet Walz and Paul Winner, with Sean Hunt at the start of 3.6 and
Bart House from 3.6.2, helped by Steve VanDevender, Kevin Smolkowski and many others who reported bugs
and contributed ideas. The Guidebook and the file
`doc/fixes36.*` of the release name everyone who contributed.

The random number generator (ISAAC64, `src/rt/rng.ts`) follows `src/isaac64.c` of the release: by
Timothy B. Terriberry after the public domain ISAAC of Robert J. Jenkins Jr., itself released under
CC0 (public domain).

The tribute to Terry Pratchett and the passages from his Discworld novels (`tribute` in nhdat) are part
of NetHack 3.6 as released.

The translation to TypeScript, the runtime that stands in for the C library and the terminal, and the
browser integration were written for this website (see `README.md`); they are under the NGPL like the
rest of the port.
