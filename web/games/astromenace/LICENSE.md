# AstroMenace: license and credits

**AstroMenace** was made by **Mikhail Kurinnoi** and the **Viewizard** team (2007-2025). The reference
for this port is release **1.4.3** (the tag `v1.4.3` of https://github.com/viewizard/astromenace, sha256
`c16b56bfa91f0b1ac1520d09ead2a1fbb536cbd3d4f3a792a222d44bc708eab1`, `re/astromenace/fetch.sh`). The
licence check of every part is `re/astromenace/LICENSE.md`.

```
AstroMenace
Hardcore 3D space scroll-shooter with spaceship upgrade possibilities.
Copyright (C) 2006-2025 Mikhail Kurinnoi, Viewizard

AstroMenace is free software: you can redistribute it and/or modify it under the terms of the GNU
General Public License as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version.
```

| Part | In this folder | Copyright | License |
| --- | --- | --- | --- |
| Game code (ported in `src/`) | | 2007-2025 Mikhail Kurinnoi, Viewizard, and the contributors in `AUTHORS.md` of the original | GPL-3.0-or-later (`assets/GPL-3.0.txt`) |
| 2D artwork, the 3D models outside `models.pack`, textures, skyboxes, mission scripts, texts, music, sound effects, voices | `assets/` (TGA/VW2D converted to PNG losslessly, everything else unchanged) | Viewizard team: Mikhail Kurinnoi, Tatiana Savitskaya, Oleg Linkov, Egor Kurteanu; Alexander Matchugovsky, Mikhail Sirotkin, Alexander Vassilyevsky; Petra Schulten, Elena Zavalishina | GPL-3.0 |
| 3D models and textures of `models/models.pack` (fighters, aliens, pirates, buildings, vehicles, turrets) | `assets/models/` (unpacked from `models.pack`; their VW2D textures converted to PNG) | Max Shelekhov, 3drt.com | CC BY-SA 4.0 (`assets/CC-BY-SA-4.0.txt`, https://creativecommons.org/licenses/by-sa/4.0/). Changes: unpacked from the original's `models.pack` and the textures converted from VW2D to PNG |
| Planet textures `a_class4`, `clouds`, `d_class3`, `q_class2` | `assets/models/planet/` | Alex (Esgaroth) Reuter, Robert Stein | GPL-3.0 (by the author's statement in the original's `LICENSE.md`) |
| Fonts FreeMonoBold, FreeSansBold, FreeSerifBold | `assets/font/` (unchanged) | GNU FreeFont contributors | GPL-3.0-or-later with the font exception |
| Fonts Liberation Mono/Sans/Serif Bold | `assets/font/` (unchanged) | 2010 Google Corporation; 2012 Red Hat, Inc. | SIL Open Font License 1.1 (`assets/OFL-1.1.txt`) |
| Fonts Linux Biolinum, Linux Libertine (bold) | `assets/font/` (unchanged) | Philipp H. Poll | GPL with font exception, or SIL OFL 1.1 |

Credits of the original (`src/menu/menu_credits.cpp`): project leader and programming Mikhail Kurinnoi;
2D artwork Tatiana Savitskaya; 3D models Max Shelekhov (3drt.com), Oleg Linkov, Egor Kurteanu; planetary
textures Alex (Esgaroth) Reuter, Robert Stein; music Alexander Matchugovsky; sound effects Mikhail Sirotkin,
Alexander Matchugovsky, Alexander Vassilyevsky; voice Petra Schulten (de), Elena Zavalishina (en, ru);
translators Bernd Dau, Jürgen Buchmüller, Michael Lauenburger, Mikhail Kurinnoi, Jacek Fiedorowicz, Juan
Francisco Astudillo Palacios, p1p2r; community contributors Alistair Findlay, Dmitry Marakasov, Gwyn
Ciesla, Stefan Strogin, sevu; testers and special thanks as listed in the game's credits screen.

## This port

The TypeScript in `src/`, the tests in `test/` and the tools in `re/astromenace/` are by the freegames
project, a modified version of AstroMenace: every changed file says so in its header. The port is
distributed under the GNU General Public License, version 3 or later. The models of `models.pack` stay
under CC BY-SA 4.0 (attribution above). The name "AstroMenace" and its authors' names are used to credit
the original, not to endorse this port.

## Favicon

`web/icons/astromenace.png` and `astromenace-180.png` are scaled from the original's mission icon
`script/mission1_icon.tga` (GPL-3.0, Viewizard) with `web/scripts/icons.py`.
