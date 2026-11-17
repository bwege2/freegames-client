# Fish Fillets - Next Generation: license and credits

This port is made from **Fish Fillets - Next Generation 1.0.1** (2010, https://fillets.sourceforge.net/): the engine
`fillets-ng-1.0.1.tar.gz` and the data `fillets-ng-data-1.0.1.tar.gz` (`re/fishfillets/fetch.sh`; the same bytes as
Debian's `fillets-ng_1.0.1.orig.tar.gz` and `fillets-ng-data_1.0.1.orig.tar.gz`).

## The licenses, asset group by asset group

| What | Where in the port | License | Commercial use, GPL-3.0 |
| --- | --- | --- | --- |
| Engine (C++), translated to TypeScript | `src/engine/` | GPL-2.0-or-later (the header of every source file: "either version 2 of the License, or (at your option) any later version") | yes, yes |
| Levels: the level scripts, models, dialogues and their translations (Lua) | `assets/scripts.json` | GPL (the data package's `COPYING`, see below) | yes, yes |
| Graphics: rooms, objects, fish, map, menus | `assets/data/images/` | GPL (data package) | yes, yes |
| Flags of the language menu (`images/menu/flags/`) | `assets/data/images/menu/flags/` | public domain (`images/menu/flags/copyright`: SVG flags from the Sodipodi clipart, "Public domain") | yes, yes |
| Sounds and the voices (Czech, Dutch, partly English) | `assets/data/sound/` | GPL (data package) | yes, yes |
| Music (`music/*.ogg`, the loop points `*.ogg.meta`) | `assets/data/music/` | GPL (data package) | yes, yes |
| Fonts `font_menu.ttf`, `font_subtitle.ttf`, `font_console.ttf` | `assets/data/font/` | GPL-2.0-or-later (GNU FreeFont, Copyright (C) 2002 Free Software Foundation; `font/copyright`) | yes, yes |

The data package (levels, graphics, sounds, music) was released under the GNU GPL by ALTAR interactive in March 2004
together with the original game's code (the engine's `AUTHORS`: "released code and data under GNU/GPL in 03/2004"). The
package carries the text of the GPL version 2 in `COPYING` and names no version number of its own; by section 9 of
the GPL version 2 ("If the Program does not specify a version number of this License, you may choose any version ever
published by the Free Software Foundation") it may be used under the GPL version 3. Debian distributes it as GPL
version 2; read that way, the website's additional permission for GPL-2.0-only game ports (`web/LICENSE.md`) covers
the combination as it covers Frozen Bubble. No asset is under a non-commercial or no-derivatives term, and none had to
be replaced.

## Credits

* **The original Fish Fillets** (1998, Windows): ALTAR interactive (https://www.altarinteractive.com/), who released
  its code and data under the GNU GPL in 2004.
* **Fish Fillets - Next Generation**: Ivo Danihelka (the new engine), Pavel Danihelka (website, level data,
  documentation), Mirek Olšák (many new levels, undo); translations by Frederic Panico (French), Ronny Standtke
  (German), Simone Cociancich (Italian), Przemek Bojczuk (Polish), César Catrián C. (Spanish), Astrid de Wijn (Dutch),
  Damyan Ivanov (Bulgarian), Olov Gustavsson (Swedish), Marko Burjek (Slovenian), Ricardo Faria (Brazilian
  Portuguese), Leonid Myravjev (Russian) and others (the engine's `AUTHORS`, the data's credits picture
  `images/menu/credits.png`).
* **Fonts**: GNU FreeFont, Primož Peterlin and the Free Software Foundation.

## This port: GPL-2.0-or-later

The port is a derivative work of Fish Fillets - Next Generation: the engine's level logic, scripting interface, menus
and effects translated to TypeScript (`src/engine/`), a Lua 5.0 interpreter written for it (`src/lua/`, after the
language and the standard library of Lua 5.0, which is MIT-licensed; no code of Lua is included), glibc's `rand()`
(`src/glibcRand.ts`) and a PNG decoder (`src/ui/png.ts`). It is licensed under the **GNU General Public License,
version 2 or (at your option) any later version**: see `licenses/GPL-2.0.txt` and `licenses/GPL-3.0.txt` on this site.
What the port changed is listed in `README.md`. This program comes with ABSOLUTELY NO WARRANTY.

The original data is used unchanged: `assets/data/` holds the original's files byte for byte; `assets/scripts.json`
holds every `script/**/*.lua` file of the data package, its bytes as text (made by `re/fishfillets/fetch.sh`). Left
out are the HTML manual (`doc/`) and the intro film `images/menu/intro.mpg`.

## Favicon

The favicon of the game's page (`web/icons/fishfillets.png`, 48x48, and `web/icons/fishfillets-180.png`, 180x180;
drawn by `web/scripts/icons.py`) is the original's window icon `src/game/fillets.ico` (GPL-2.0-or-later, above),
placed on a blue rounded square and scaled; it is an altered version of that image.
