# FreeCol: license and credits

This port is made from **FreeCol 1.2.0** (2024), the latest stable release of FreeCol
(https://www.freecol.org/; the release `freecol-1.2.0.zip` and its source `freecol-1.2.0-src.zip` from the
FreeCol team's download area on SourceForge, `re/freecol/fetch.sh`).

```
Copyright (C) 2002-2024 The FreeCol Team

FreeCol is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
(at your option) any later version.
```

FreeCol is by **the FreeCol Team** (the original's `README.md` and https://www.freecol.org/ name its developers,
artists and translators). Its translations come from translatewiki.net, under the same license.

## This port: GPL-2.0-or-later

The port is a derivative work of FreeCol: its Java source translated to TypeScript by a translator written for it
(`re/freecol/tools/j2ts`; the translation is `src/gen/`), with a runtime for the parts of the Java library the
game uses (`src/jre/`) and replacements for its platform code (`src/port/`). It is licensed under the **GNU General
Public License, version 2 or (at your option) any later version**, like the original: see `licenses/GPL-2.0.txt`
on this site (https://www.gnu.org/licenses/old-licenses/gpl-2.0.html). What the port changed is listed in
`README.md`. This program comes with ABSOLUTELY NO WARRANTY.

The source code of the port, the translator and the test oracle are in this site's source archive
("Licenses & source"). The port uses **fflate** 0.8.2 (zip files; Copyright (c) 2023 Arjun Barrett, MIT License)
and **jpeg-js** 0.4.4 (JPEG images; Copyright (c) 2011 notmasteryet, and Mozilla's pdf.js authors; BSD-3-Clause).

FreeCol's user interface is Java's Swing with the Metal look and feel and MigLayout. The port translates the parts
of them that FreeCol uses, as it translates FreeCol:

- **OpenJDK 21** (the JDK's `java.desktop` sources: Swing, AWT, the Metal and Basic look and feel, Java2D's
  font and image classes; Temurin 21.0.12.1+1's `src.zip`): `src/gen/java/`, `src/gen/javax/`, `src/gen/sun/`,
  `src/gen/com/sun/`, and the JDK's Swing texts, icons and cursors in `assets/jdk/`. Copyright (c) 1995, 2023,
  Oracle and/or its affiliates; each translated file keeps its source file's copyright notice.
- **MigLayout** 5.3 (`src/gen/net/miginfocom/`): Copyright (c) 2004, Mikael Grev, MiG InfoCom AB.
  (miglayout (at) miginfocom (dot) com); BSD-3-Clause, the license in each file.

### Licenses of the port's parts

| Part | License |
| --- | --- |
| The port: the translated FreeCol code (`src/gen/net/sf/freecol/`) | GPL-2.0-or-later, as the original |
| The translated OpenJDK code (`src/gen/java/`, `javax/`, `sun/`, `com/sun/`) and `assets/jdk/` | GPL-2.0-only WITH Classpath-exception-2.0 (text below) |
| `src/jre/` files adapted from OpenJDK 21 (`src/jre/util.ts`: the hash table with its tree bins, `PriorityQueue`) | GPL-2.0-only WITH Classpath-exception-2.0 |
| The translated MigLayout (`src/gen/net/miginfocom/`) | BSD-3-Clause |
| The hand-written rest of `src/jre/`, `src/port/` and the glue (`src/index.ts`, `src/worker*.ts`, `src/freecol.ts`, ...) | GPL-2.0-or-later |
| fflate 0.8.2 | MIT |
| jpeg-js 0.4.4 | BSD-3-Clause |

The runtime's hash table and priority queue reproduce OpenJDK's `java.util.HashMap` (with its tree bins) and
`java.util.PriorityQueue` exactly, because FreeCol's results depend on their orders. That code is adapted from
OpenJDK 21 (Copyright (c) 1997, 2023, Oracle and/or its affiliates; the file keeps OpenJDK's copyright notice) and
stays under OpenJDK's license, the GNU General Public License version 2 with the Classpath Exception, as the
translated Swing and AWT do. The exception lets it be linked with independent modules whatever their licenses;
FreeCol's translated code and this website's SDK are such modules.

The Classpath Exception:

```
Linking this library statically or dynamically with other modules is making a combined work based on this
library. Thus, the terms and conditions of the GNU General Public License cover the whole combination.

As a special exception, the copyright holders of this library give you permission to link this library with
independent modules to produce an executable, regardless of the license terms of these independent modules,
and to copy and distribute the resulting executable under terms of your choice, provided that you also meet,
for each linked independent module, the terms and conditions of the license of that module. An independent
module is a module which is not derived from or based on this library. If you modify this library, you may
extend this exception to your version of the library, but you are not obligated to do so. If you do not wish
to do so, delete this exception statement from your version.
```

## The data

The game's data (rules, texts, maps, images, animations, sounds, fonts) is used unchanged from the release, under
the licenses its authors gave:

| Files (in the original's `data/`) | Author | License |
| --- | --- | --- |
| Everything not listed below | The FreeCol Team | GPL-2.0-or-later |
| `base/resources/fonts/ShadowedBlack.ttf` | Paul Lloyd ("(C) Copyright Paul Lloyd 2002") | GPL-2.0-or-later |
| `default/resources/music/default/` (el-dorado, fearless-sailors, founders, free-colonist, lost-city, rainy-day, royal-troops, settlers-routine, sunrise, tailwind, wagon-wheels) | Alexander Zhelanov | CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/) |
| `default/resources/music/default/musicbox.ogg` | Stian Grenborgen | CC BY 4.0 |
| `default/resources/images/goods/meat.png` | derived from 0 A.D.'s `action-gather-meat.png`, Wildfire Games | CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0/) |
| `default/resources/images/terrain/river/pebbles.png` | modified from "Pebbles surface", OpenGameArt.org | CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/) |
| `default/resources/images/terrain/ocean/`, the river water | zookeeper and Zabin (The Battle for Wesnoth's water animation, OpenGameArt.org) | CC0 |
| `default/resources/images/terrain/desert/` | "2048 digitally painted tileable desert sand texture", OpenGameArt.org | CC0 |
| `default/resources/images/bonus/game.png` | CDmir ("Old deer male", OpenGameArt.org) | CC0 |
| `default/resources/images/monarch/`, `default/resources/images/ui/doi.png` | Wikimedia Commons | public domain |
| `default/resources/images/ui/bg_map1.jpg`, `military.png`, `political.png`, `religious.png`, `trade.png`, `exploration.png`, `landing.png` | historical maps from the David Rumsey Map Collection (www.davidrumsey.com) | public domain (faithful reproductions of public-domain works) |
| `default/resources/sound/event/alert.ogg` | derived from "alert" by **acclivity** on Freesound, https://freesound.org/people/acclivity/sounds/32304/ | **CC BY-NC 4.0** (https://creativecommons.org/licenses/by-nc/4.0/) |

**`alert.ogg` is licensed for non-commercial use only.** This website is non-commercial. Anyone who redistributes
this game commercially must remove `alert.ogg` (the game then plays no sound for that event).

### Fonts

Java draws FreeCol's text in its logical fonts (Dialog, Serif); on the Linux desktop the original was checked on
they are **DejaVu** 2.37 (https://dejavu-fonts.github.io/), which the port uses unchanged (`assets/fonts/`,
`re/freecol/tools/fonts.sh`): Bitstream Vera fonts Copyright (c) 2003 by Bitstream, Inc., with the changes of the
DejaVu authors in the public domain; Arev fonts Copyright (c) 2006 by Tavmjong Bah. The license is in
`assets/fonts/DejaVu-LICENSE.txt`. `assets/fonts/javametrics.bin` holds the advances Java computes for these fonts
(`re/freecol/oracle/FontTable.java`).

The intro video of the original (`default/resources/video/freecol-opening.video.ogg`) is not part of this port
(`README.md`).
