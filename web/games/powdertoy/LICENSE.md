# The Powder Toy: license and credits

**The Powder Toy** was designed by **Stanislaw K Skowronek** (after Hardcore Dangerous Two's Powder Game) and is
developed by **Simon Robertshaw** and the Powder Toy contributors (Skresanov Savely, Pilihp64, Catelite, Victoria
Hoyle, Nathan Cousins, jacksonmj, Felix Wallin, Lieuwe Mosch, Anthony Boot, Me4502, MaksProg, jacob1, mniip,
LBPHacker and the GitHub contributors listed in the original's `resources/credits.json`).

This port uses **The Powder Toy v100.1.400** as its reference: the source archive of the GitHub tag
`v100.1.400` (`The-Powder-Toy-100.1.400.tar.gz`, sha256
`75cd971e1b2d6789f9e35b75926b76d037a564ad9291fa852ad9996c8ac40c96`, fetched by `re/powdertoy/fetch.sh`; not
committed).

## The original's licenses

* The game's source code is licensed under the **GNU General Public License version 3**
  (`LICENSE` in the original; <https://www.gnu.org/licenses/gpl-3.0.html>). Its source files carry no other
  terms.
* The game has no separate data: elements, walls, tools, menus and texts are part of the source. Its one data
  file, the bitmap font `resources/font.bz2`, is part of the GPL-3.0 source; its Korean glyphs come from the
  **Mallangche** font by JammPark (MIT License, <https://github.com/JammPark/Mallangche>).
* The game has no sound or music.
* Third-party code the original links (bzip2, FFTW, JsonCpp, libcurl, libpng, Lua/LuaJIT, mbedtls, SDL) is not
  part of this port; the port has its own bzip2 coder and FFT in TypeScript.

Nothing the port ships is non-commercial, no-derivatives or otherwise not free.

## This port

The TypeScript port in `src/` (a translation of the original's C++ source), the tools in `re/powdertoy/` and the
tests are by the freegames project and are licensed **GPL-3.0** like the original (version 3 only, as the
original states no "or later"). It is a modified version of The Powder Toy: it runs in the browser, keeps saves and
stamps in the website's account storage and has no online save browser, Lua console or update checks
(`README.md` lists every deviation). The website and game SDK are GPL-3.0-or-later with an additional permission
under section 7 (`web/LICENSE.md`); the game code and its asset keep their license above.

`assets/font.bin` is the original's `resources/font.bz2`, decompressed (lossless, same bytes) by
`re/powdertoy/tools/build-font.py`.

## Favicon

The favicon of the game's page (`web/icons/powdertoy.png`, 48x48, and `web/icons/powdertoy-180.png`, 180x180;
drawn by `web/scripts/icons.py`) is the original's own program icon, `resources/icon_exe.svg` of the source
(GPL-3.0, above), rasterised and placed on a dark tile we drew.
