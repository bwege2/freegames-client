# Pingus: license and credits

**Game, graphics, levels, sounds, music**: Pingus 0.7.6 (2011), Copyright (C) 1998-2011 Ingo Ruhnke
<grumbel@gmail.com> and the Pingus contributors, under the **GNU General Public License, version 3 or (at your
option) any later version** (the release's `COPYING`; the source files say "version 3 of the License, or (at your
option) any later version"). Some files carry their own compatible terms: the levels are marked GPL-2.0-or-later
or GPL-3.0-or-later in their files and in Debian's copyright file, the s-expression parser (`src/lisp/`) and
`external/tinygettext` are GPL-2.0-or-later, a few math and command-line files are ClanLib's zlib license and
`src/win32/uce_dirent.*` is MIT; none of them is part of what this port ships except the level files.

The data the port uses comes from the release unchanged (`re/pingus/assets.py` copies it):

| Data | Author (the release's AUTHORS and credits) | License |
| --- | --- | --- |
| Levels (`levels/`), level sets, worldmap, stories, prefabs | Ingo Ruhnke, Craig Timpany, Tom Flavel, Michael Wand, Jens Henrik Goebbert, Josh Dye, Rafael Zanella, Gabriel Rota and others | GPL-2.0-or-later / GPL-3.0-or-later (as the files and Debian's copyright say) |
| Graphics (`images/`) | Ingo Ruhnke, Joel Fauche, Stefan Stiasny, Craig Timpany, Michael Mestre, Alan Tennent, Mark Collinson, Tom Flavel, David M. Turner and others | GPL-3.0-or-later (the release's license) |
| Sounds (`sounds/*.wav`) | the Pingus team | GPL-3.0-or-later |
| Music (`music/*.it`) | Joseph Toscano (pingus-*.it), H. Matthew Smith (gd-*.it), Robbie Ferguson and others (pingus.credits: "Music") | GPL-3.0-or-later (part of the release; Debian and Fedora ship it under the release's license) |
| Fonts (`images/fonts/chalk-*`, `pingus-small-20px`) | bitmap glyphs the Pingus team rendered from "ExpletiveDeletedEnhanced.ttf" (data/images/fonts/README) | GPL-3.0-or-later as part of the release; see the note below |

**Not shipped**: the CJK glyph images of the fonts (`*-cjk-*.png`), which the release's README says were rendered
from AR PL UKai (`ukai.ttc`, Arphic Public License, which is not GPL-compatible); the port shows the game in
English and does not need them. The editor's font (`verdana11`) is not used either. Pingus 0.7.6's music README
lists Ogg files from Jamendo (CC BY-SA 3.0) that are not in the release; they are not used.

**Note on the fonts**: the release does not say where "ExpletiveDeletedEnhanced.ttf", the TrueType font the chalk
and pingus-small bitmap fonts were rendered from, came from or under which license it was. The bitmap images are
part of the GPL release by its copyright holder and Debian (main) and Fedora distribute them under the release's
license. Should that font turn out not to be free, these images (and only they) would have to be replaced.

**This is an altered version**: a TypeScript port by the freegames project (`src/`) of Pingus 0.7.6's C++ source,
under GPL-3.0-or-later. The source of the original: https://github.com/Pingus/pingus (tag v0.7.6) and the
release tarball that `re/pingus/fetch.sh` downloads.

## Favicon

The favicon of the game's page (`web/icons/pingus.png`, 48x48, and `web/icons/pingus-180.png`, 180x180; drawn by
`web/scripts/icons.py`) is the game's own icon, `data/images/icons/pingus-icon.png` (48x48) and
`pingus-icon.svg` (the large one) of the release (GPL-3.0-or-later), placed on a grey rounded square.
