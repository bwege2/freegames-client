# Tux Racer: license and credits

**Tux Racer 0.61** (1999–2001), by Jasmin F. Patry and the Sunspire Studios team, is free software
under the GNU General Public License, version 2 or (at your option) any later version. The game data
(courses, textures, models, sounds, music, fonts) is part of the same package and under the same
license. The reference is `tuxracer-0.61.tar.gz` plus `tuxracer-data-0.61.tar.gz` from SourceForge
(`re/tuxracer/fetch.sh`).

```
Tux Racer -- a Sunspire Studios Production (http://www.sunspirestudios.com)
(c) 1999-2000 Jasmin F. Patry <jfpatry@sunspirestudios.com>
"Tux Racer" is a trademark of Jasmin F. Patry
Tux Racer comes with ABSOLUTELY NO WARRANTY. This is free software, and you are welcome to
redistribute it under certain conditions. See http://www.gnu.org/copyleft/gpl.html for details.
```

* **Core development:** Patrick "Pog" Gilhuly, Eric "Monster" Hall, Rick Knowles, Vincent Ma,
  Jasmin Patry, Mark Riddell.
* **Music:** Joseph Toscano (the Impulse Tracker modules `start1`, `race1`, `race2`, `options1`,
  `wonrace1`).
* **Thanks to:** Larry Ewing, Thatcher Ulrich, Steve Baker, Ingo Ruhnke, James Barnard, Alan Levy,
  the University of Waterloo Computer Graphics Lab.
* **Contributed courses:** Julien Canet (The Downhill Fear, Jool's Big Mountain), Ingo Ruhnke
  (Ice Canyon, Ingo's Speedway, Nebula), Bill Scherer (Who Says Penguins Can't Fly?), Steve, Mathieu
  and Jerome (Sentinel Towers), David Fries (Twin Paths).

## This port

The TypeScript port in `src/`, the HTML/CSS menus and the tools in `re/tuxracer/` are by the
freegames project and are licensed **GPL-2.0-or-later**, the same terms as the original. The website
and game SDK are GPL-3.0-or-later with an additional permission under section 7 to combine them with
GPL-2.0-only ports (this one is GPL-2.0-or-later, so no exception is needed; the full text is in
`web/LICENSE.md`). The port is altered source, not the original program.

The data in `assets/` is the original's, converted for the browser:

* `courses/*/elev.bin`, `terrain.bin`, `trees.bin`: the original's SGI RGB bitmaps, losslessly
  reduced to the channels the game uses (row order preserved as the original's ImageLoad sees it).
* the other `*.rgb` files: lossless PNG.
* `music/*.ogg`: the original Impulse Tracker modules rendered with libopenmpt (a lossy conversion;
  the `.it` modules stay in the download archive of the reference).
* `sounds/*.wav`: unchanged.
* `courses.json`, `events.json`, `lights.json`, `model.json`: the original's Tcl configuration and
  course/event/scene data, extracted to JSON (`re/tuxracer/tools/extract.tcl`).

The GNU GPL version 2 is served as `licenses/GPL-2.0.txt` on this site and comes with the original's
`COPYING` in the reference download.
