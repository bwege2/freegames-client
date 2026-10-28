# Abuse: license and credits

**Abuse** was made by **Crack dot Com** (Jonathan Clark, Dave Taylor and their team; the credits at the
end of the game name everyone) and published in 1996. Crack dot Com released
the game's source code and its data into the **public domain**. This port follows **Abuse 0.8** (2011),
the SDL version maintained by **Sam Hocevar**, from the release tarball `abuse-0.8.tar.gz`
(`re/abuse/fetch.sh`). Its `AUTHORS` file credits Sam Hocevar (maintainer), Anthony Kruize (SDL port),
Jeremy Scott (Win32 port), Jochen Schleu (music playback), Arto Jantunen, Michael Olson, Ed Snible, Nix,
Bob Ippolito, Joris Beugnies, Ben Hines and Julian Mayer.

The package's `COPYING` says which license each part has:

| Part of Abuse 0.8 | License |
| --- | --- |
| `src/*` (the engine, its Lisp interpreter, the game logic, the window system): Copyright (c) 1995 Crack dot Com, (c) 2005-2011 Sam Hocevar | public domain |
| `data/*` (levels, graphics, Lisp files, fonts): Copyright (c) 1995 Crack dot Com, (c) 1996-2008 Justin Cassidy ("fRaBs" levels and art) and others | public domain |
| `src/sdlport/*` (the SDL port: window, events, sound, setup): Copyright (c) 2001 Anthony Kruize, (c) 2005-2011 Sam Hocevar | GNU GPL, version 2 or later |
| `src/sdlport/hmi.cpp` (HMI to MIDI): Copyright (c) 2011 Jochen Schleu | WTFPL, version 2 |
| `src/lol/*` (the timer): Copyright (c) 2010-2011 Sam Hocevar | WTFPL, version 2 |
| `data/sfx/*`, `data/music/*`: Copyright (c) 1995 Bobby Prince | **not free**: not part of this port (below) |

The public domain notice of the source files: *"This software was released into the Public Domain. As
with most public domain software, no warranty is made or implied by Crack dot Com, by Jonathan Clark, or by
Sam Hocevar."*

## This port

The port is a TypeScript translation of Abuse 0.8's sources by the freegames project: `src/` (the
engine, the interpreter and the game logic from `src/*`, the window, events, sound layer and setup from
`src/sdlport/*`, the HMI converter from `src/sdlport/hmi.cpp`, the timer from `src/lol/timer.cpp`), with
the browser's side written for the website (`src/index.ts`, `src/worker.ts`, `src/rt/`, `src/online*.ts`),
the online module of our server and the schema `protocol/games/abuse.capnp`.

The port is distributed under the **GNU General Public License, version 3 or (at your option) any later
version**, as the website is. Its parts translated from `src/sdlport/` (`src/sdlport/video.ts`,
`event.ts`, `sound.ts`, `setup.ts`) are a modified version of GPL-2.0-or-later code and are used under its
"or any later version" option; the parts translated from public-domain and WTFPL code may be used under
those terms as well.

> This program is free software; you can redistribute it and/or modify it under the terms of the GNU
> General Public License as published by the Free Software Foundation; either version 3 of the License, or
> (at your option) any later version.
>
> This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
> the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
> License for more details.

The GNU General Public License, versions 2 and 3, are on the website's license page (`licenses/GPL-2.0.txt`,
`licenses/GPL-3.0.txt`), in the package (`COPYING.GPL`) and at https://www.gnu.org/licenses/. The WTFPL:

```
            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                    Version 2, December 2004

 Copyright (C) 2004 Sam Hocevar
  14 rue de Plaisance, 75014 Paris, France
 Everyone is permitted to copy and distribute verbatim or modified
 copies of this license document, and changing it is allowed as long
 as the name is changed.

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

  0. You just DO WHAT THE FUCK YOU WANT TO.
```

## Data

`assets/abuse-data.bin` holds the files of the package's `data/` directory, unchanged, packed and
compressed into one file by `re/abuse/tools/pack.py` (public domain, as above), without `data/sfx/` and
`data/music/`. `src/fontdata.ts` holds the two fonts compiled into the program (`src/smallfnt.cpp`,
`src/fnt6x13.cpp`, public domain), written by `re/abuse/tools/fontdata.py`.

**Sounds and music are not included.** Abuse's sound effects and music are by Bobby Prince; they are not
free (the package's `COPYING`: Bobby Prince gave Debian permission to redistribute them, nobody else). The
port plays without them, exactly as the original does when its `sfx/` directory is missing.

## Trademarks

Abuse is a trademark of its owner; this port is not affiliated with or endorsed by Crack dot Com or its
successors.
