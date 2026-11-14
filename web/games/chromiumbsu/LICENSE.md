# Chromium B.S.U.: license and credits

**Chromium B.S.U.** was written by **Mark B. Allan** (The Reptile Labour Project, 2000). The reference
for this port is release **0.9.16.1** (Debian's `chromium-bsu_0.9.16.1.orig.tar.gz`, sha256
`a1c141a34d19a59607ae81166a19864eb8c84cf86b155462fed31a6d56e1624a`, `re/chromiumbsu/fetch.sh`). The
licence check of every part is `re/chromiumbsu/LICENSE.md`.

```
Copyright (c) 2000 Mark B. Allan. All rights reserved.
Copyright (c) 2008 Tristan Heaven; 2008-2009 Paul Wise; and the contributors in AUTHORS
"Chromium B.S.U." is free software; you can redistribute it and/or use it and/or modify it under
the terms of the "Clarified Artistic License"
```

Contributors (`AUTHORS`): Max Horn and Darrell Walisser (Mac); Sven M. Hallberg, Torbjörn Andersson,
Paul Wise, Sam Hocevar, Alwyn Berkeley, Philipp Thomas, Ales Nosek, Colin Leroy, Peter Joseph, Mike
Furr, Brandon Barnes, Siegfried-Angel Gevatter Pujals, Alan Woodland, James Gregory, Dmitry Marakasov,
Nille Kungen, Tristan Heaven, Bertrand Coconnier.

| Part | In this folder | Copyright | License |
| --- | --- | --- | --- |
| Game code (ported in `src/game/`) and the 3D title letters (`assets/title.bin`, converted from `src/textGeometry*.cpp`) | | Mark B. Allan and contributors | Clarified Artistic License (below) |
| Textures | `assets/png/` (unchanged) | Mark B. Allan | Clarified Artistic License |
| Sounds and music | `assets/wav/` (unchanged; `assets/wav/license.txt`) | 2008 Brian Redfern | MIT/Expat (below) |
| Font Gothic Uralic Bold | `assets/font/GOTHUB__.TTF` (unchanged; `assets/font/license.txt`) | 1999 URW++ Design & Development; Cyrillic glyphs 2001-2002 Valek Filippov; 2004 Esa Anttikoski | GNU GPL version 2 or later |
| `src/libm.ts`: glibc's `sin`/`cos` (sysdeps/ieee754/dbl-64/s_sin.c and sincostab.c, translated) | | 2001-2024 Free Software Foundation, Inc. (IBM Accurate Mathematical Library) | LGPL-2.1-or-later, used here under the GPL-3.0-or-later |

## This port

The TypeScript in `src/`, the tests in `test/` and the tools in `re/chromiumbsu/` are by the freegames
project, a modified version of Chromium B.S.U. under section 3 of the Clarified Artistic License:
every changed file says so in its header, the modifications are freely available (the website's
public source, "Licenses & source"), and the program is not the Standard Version: it runs in a web
browser as "Chromium B.S.U." on freegames.stream, its differences are listed in `README.md`, and the
Standard Version is available from https://sourceforge.net/projects/chromium-bsu/ and Debian's
`chromium-bsu` package. The port is distributed under the GNU General Public License, version 3 or
later (`public/licenses/GPL-3.0.txt`), which the Clarified Artistic License allows (the FSF lists it as
compatible with the GPL); the original's notices above stay with it. The name "Chromium B.S.U." and
its authors' names are used to credit the original, not to endorse this port.

The website and game SDK are GPL-3.0-or-later (`web/LICENSE.md`).

## The Clarified Artistic License

```
                  The Clarified Artistic License

Preamble

The intent of this document is to state the conditions under which a
Package may be copied, such that the Copyright Holder maintains some
semblance of artistic control over the development of the package, while
giving the users of the package the right to use and distribute the
Package in a more-or-less customary fashion, plus the right to make
reasonable modifications.

Definitions:

    "Package" refers to the collection of files distributed by the
    Copyright Holder, and derivatives of that collection of files
    created through textual modification.

    "Standard Version" refers to such a Package if it has not been
    modified, or has been modified in accordance with the wishes of the
    Copyright Holder as specified below.

    "Copyright Holder" is whoever is named in the copyright or
    copyrights for the package.

    "You" is you, if you're thinking about copying or distributing this
    Package.

    "Distribution fee" is a fee you charge for providing a copy of this
    Package to another party.

    "Freely Available" means that no fee is charged for the right to use
    the item, though there may be fees involved in handling the item.
    It also means that recipients of the item may redistribute it under
    the same conditions they received it.

1. You may make and give away verbatim copies of the source form of the
Standard Version of this Package without restriction, provided that you
duplicate all of the original copyright notices and associated
disclaimers.

2. You may apply bug fixes, portability fixes and other modifications
derived from the Public Domain, or those made Freely Available, or from
the Copyright Holder.  A Package modified in such a way shall still be
considered the Standard Version.

3. You may otherwise modify your copy of this Package in any way,
provided that you insert a prominent notice in each changed file stating
how and when you changed that file, and provided that you do at least
ONE of the following:

    a) place your modifications in the Public Domain or otherwise make
    them Freely Available, such as by posting said modifications to
    Usenet or an equivalent medium, or placing the modifications on a
    major network archive site allowing unrestricted access to them, or
    by allowing the Copyright Holder to include your modifications in
    the Standard Version of the Package.

    b) use the modified Package only within your corporation or
    organization.

    c) rename any non-standard executables so the names do not conflict
    with standard executables, which must also be provided, and provide
    a separate manual page for each non-standard executable that clearly
    documents how it differs from the Standard Version.

    d) make other distribution arrangements with the Copyright Holder.

    e) permit and encourge anyone who receives a copy of the modified
    Package permission to make your modifications Freely Available in
    some specific way.


4. You may distribute the programs of this Package in object code or
executable form, provided that you do at least ONE of the following:

    a) distribute a Standard Version of the executables and library
    files, together with instructions (in the manual page or equivalent)
    on where to get the Standard Version.

    b) accompany the distribution with the machine-readable source of
    the Package with your modifications.

    c) give non-standard executables non-standard names, and clearly
    document the differences in manual pages (or equivalent), together
    with instructions on where to get the Standard Version.

    d) make other distribution arrangements with the Copyright Holder.

    e) offer the machine-readable source of the Package, with your
    modifications, by mail order.


5. You may charge a distribution fee for any distribution of this
Package. If you offer support for this Package, you may charge any fee
you choose for that support.  You may not charge a license fee for the
right to use this Package itself.  You may distribute this Package in
aggregate with other (possibly commercial and possibly nonfree) programs
as part of a larger (possibly commercial and possibly nonfree) software
distribution, and charge license fees for other parts of that software
distribution, provided that you do not advertise this Package as a
product of your own. If the Package includes an interpreter, You may
embed this Package's interpreter within an executable of yours (by
linking); this shall be construed as a mere form of aggregation,
provided that the complete Standard Version of the interpreter is so
embedded.

6. The scripts and library files supplied as input to or produced as
output from the programs of this Package do not automatically fall under
the copyright of this Package, but belong to whoever generated them, and
may be sold commercially, and may be aggregated with this Package.  If
such scripts or library files are aggregated with this Package via the
so-called "undump" or "unexec" methods of producing a binary executable
image, then distribution of such an image shall neither be construed as
a distribution of this Package nor shall it fall under the restrictions
of Paragraphs 3 and 4, provided that you do not represent such an
executable image as a Standard Version of this Package.

7. C subroutines (or comparably compiled subroutines in other languages)
supplied by you and linked into this Package in order to emulate
subroutines and variables of the language defined by this Package shall
not be considered part of this Package, but are the equivalent of input
as in Paragraph 6, provided these subroutines do not change the language
in any way that would cause it to fail the regression tests for the
language.

8. Aggregation of the Standard Version of the Package with a commercial
distribution is always permitted provided that the use of this Package
is embedded; that is, when no overt attempt is made to make this
Package's interfaces visible to the end user of the commercial
distribution. Such use shall not be construed as a distribution of this
Package.

9. The name of the Copyright Holder may not be used to endorse or
promote products derived from this software without specific prior
written permission.

10. THIS PACKAGE IS PROVIDED "AS IS" AND WITHOUT ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF
MERCHANTIBILITY AND FITNESS FOR A PARTICULAR PURPOSE.

                            The End
```

## The sounds and music (MIT/Expat)

```
Copyright 2008 Brian Redfern

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
```

## The font (GPL-2.0-or-later)

```
Copyright 1999 by URW++ Design & Development; Cyrillic glyphs added by Valek Filippov 2001-2002.
Modified by Esa Anttikoski, 2004. Gothic Uralic Bold.
This program is free software; you can redistribute it and/or modify it under the terms of the GNU
General Public License as published by the Free Software Foundation; either version 2 of the
License, or (at your option) any later version.
```

The GNU GPL version 2 is served as `public/licenses/GPL-2.0.txt` on this site.

## Favicon

The favicon of the game's page (`web/icons/chromiumbsu.png`, 48x48, and `web/icons/chromiumbsu-180.png`,
180x180; drawn by `web/scripts/icons.py`) is the original's ship texture `assets/png/hero.png`, which
the original also uses as its window icon (Clarified Artistic License, above), on a dark tile.
