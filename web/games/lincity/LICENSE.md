# Lincity: license and credits

This port is made from **Lincity 1.13.1** (2004), the last release of the classic Lincity, its X11 version
(https://sourceforge.net/projects/lincity/; the tarball Debian distributes as `lincity_1.13.1.orig.tar.gz`,
the SourceForge release `lincity-1.13.1.tar.gz`, `re/lincity/fetch.sh`). It is not Lincity-NG, a later
rewrite in C++.

The original's `COPYRIGHT`:

```
Lincity is copyrighted software.
Copyright (c) I J Peters 1995-1997.
Copyright (c) Greg Sharp 1997-2003.
Copyright (c) Corey Keasling 2000-2003.

You may freely copy, distribute and modify lincity under the terms of the

                       GNU GENERAL PUBLIC LICENSE

Please read the file COPYING for the GPL.
```

`COPYING` is the GNU General Public License, version 2. The notice names no version, so by section 9 of
that license any version of the GPL may be chosen; Debian distributes Lincity as GPL-2+.

* **Lincity:** I J Peters (author, 1995–1997); Greg Sharp and Corey Keasling (maintainers, 1997–2003);
  Dàvik (gettext support and the Catalan translation). The original's `Acknowledgements` thanks, among many others for ports and
  bug fixes, Mike, Fly and Jasper for icons and ideas and Warwick Allison for the solar power station
  icon.
* **The data** is part of the same package under the same license. The port uses it unchanged:
  `assets/lincity-data.bin` holds, byte for byte, `colour.pal` (the palette), `opening/` (the opening picture
  `open.tga.gz` and `icons.png`, the fonts `iso8859-1-8x8.raw`, `8x8thin`, `scrawl_w.fnt`, `scrawl_s.fnt`, the
  splash texts `text1`–`text3`, the scenes `good_times.scn` and `bad_times.scn`), `help/` (97 help pages),
  `messages/` (44 message boxes) and `icons/` (369 graphics), packed by `re/lincity/tools/pack.py`. The main
  font's own file (`iso8859-1-8x8.fnt`, the same glyphs with a header) calls it "Public domain font(?)".
* **Not used:** the Windows fonts `opening/winfont_8x8.fnt` and `winfont_16x16.fnt` (they carry a Microsoft
  notice and only the Windows build reads them), the ISO 8859-2 and alternative console fonts, the POV-Ray
  scene the opening picture was rendered from, the Catalan and Italian translations (`po/`), the network
  game (`NETWORK_ENABLE`, not built in 1.13.1) and the SVGALIB and Windows front ends.

## This port: GPL-2.0-or-later

The port is a derivative work of Lincity: the X11 program's C source translated to TypeScript (`src/lc/`, one
file per C file), with an emulation of the parts of Xlib, the C library and gzip the program uses (`src/lc/lcx11.ts`,
`src/lc/platform.ts`, `src/lc/c.ts`, `src/lc/stdio.ts`), and the page that shows its window (`src/index.ts`,
`src/worker.ts`). It is licensed under the **GNU General Public License, version 2 or (at your option) any later
version**: see `licenses/GPL-2.0.txt` on this site (https://www.gnu.org/licenses/old-licenses/gpl-2.0.html).
What the port changed is listed in `README.md`. This program comes with ABSOLUTELY NO WARRANTY.

The source code of the port, the tool that packs its data and the test oracle (`re/lincity/`) are in this
site's source archive ("Licenses & source").

* **gzip** for the saved scenes: fflate 0.8.2 (https://github.com/101arrowz/fflate), Copyright (c) 2023
  Arjun Barrett, MIT license, part of the site's bundle (its license is listed with the site's).

## The bulldozer's cursor

While the bulldozer is chosen the original shows the X cursor `XC_pirate`. The port draws the same glyphs,
`pirate` and `pirate_mask`, taken from the X.Org cursor font (`cursor.bdf` of font-cursor-misc 1.0.4,
https://xorg.freedesktop.org/releases/individual/font/), into `src/cursor.ts`. The font's notice:

```
COPYRIGHT "These ""glyphs"" are unencumbered"
```

## Favicon

The game page's icon (`web/icons/lincity.png`, `lincity-180.png`) is the original's window icon `lincity.ico`
(the Windows build's, 32x32, part of the same package, GPL), on a tile drawn by `web/scripts/icons.py`.
