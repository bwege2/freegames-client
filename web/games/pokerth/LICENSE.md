# PokerTH: license and credits

This port is made from **PokerTH 1.1.2** (2017; https://www.pokerth.net/, https://github.com/pokerth/pokerth,
tag `v1.1.2`, `re/pokerth/fetch.sh`). The license check of the code and of every asset is
`re/pokerth/LICENSE.md`.

```
Copyright (C) 2006-2017 Felix Hammer, Florian Thauer, Lothar May and the PokerTH development team

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero
General Public License as published by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
```

The original grants an additional permission for linking with OpenSSL; the port does not use OpenSSL.

## This port: AGPL-3.0-or-later

The port's code (`src/`, `test/`) is a translation of PokerTH's C++ source to TypeScript and is licensed
under the **GNU Affero General Public License, version 3 or (at your option) any later version**
(https://www.gnu.org/licenses/agpl-3.0.html). As AGPL-3.0 section 13 asks of a program that people use over
a network, its complete source is offered to every player: it is in this site's public source repository
("Licenses & source", the folder `web/games/pokerth`, and `re/pokerth` for the oracle and the asset script).
What the port changed is listed in `README.md`. This program comes with ABSOLUTELY NO WARRANTY.

The server module that deals the cards online (`PokerthModule.java`) is not derived from PokerTH's code: it
knows no rule of poker (it shuffles, hands out and shows cards when asked).

## The data (`assets/`, copied unchanged by `re/pokerth/tools/assets.sh`)

* **Card deck** `cards/0.png`–`51.png` (`gfx/cards/default/`): by Wikimedia Commons user Xiong, "Poker (cards
  deck)", GFDL-1.2-or-later or public domain; used under the public-domain option.
* **Card back** `cards/flipside.png`, **table** `table/*` (`gfx/gui/table/default/`: table, pucks, card holders,
  action buttons, seat frames, hand ranking, tool box) and the **action labels** `misc/action_*.png`
  (`gfx/gui/misc/actionpics/`) and the start window's background `misc/startwindowbg10_desktop.png`: the PokerTH
  development team, AGPL-3.0-or-later (part of the program, Debian `debian/copyright` "Files: *").
* **Sounds** (`sounds/default/`): `yourturn.wav`, `lobbychatnotify.wav` by Olivier Goffart (KDE knotify),
  GPL-2.0-or-later; `onlinegameready.wav` by Yves Jans (kJazz, kde-look.org), GPL; `allin.wav`, `bet.wav`,
  `raise.wav`, `check.wav`, `call.wav`, `dealtwocards.wav` recorded by pokerth.net user doc_dos, BSD-3-Clause;
  `blinds_raises_level1-3.wav` by freesound.org user rj10328 (made from samples by bertrof and justinbw),
  **CC BY 3.0** (https://creativecommons.org/licenses/by/3.0/); `fold.wav`, `playerconnected.wav` the PokerTH
  team, AGPL-3.0-or-later.
* **Font** `fonts/DejaVuSans-Bold.ttf`: DejaVu Sans Bold 2.34, Bitstream Vera Fonts copyright (c) 2003 by
  Bitstream, Inc. (free to use, copy and distribute; a modified font must be renamed); DejaVu changes are in
  the public domain. Used unchanged.

BSD-3-Clause (doc_dos's sounds): Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the copyright notice, this list of conditions and the following
disclaimer are retained; neither the name of the author nor the names of contributors may be used to
endorse or promote products derived from this software without specific prior written permission. THIS
SOFTWARE IS PROVIDED "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES ARE DISCLAIMED.

## Favicon

The favicon of the game's page (`web/icons/pokerth.png`, 48x48, and `web/icons/pokerth-180.png`, 180x180;
drawn by `web/scripts/icons.py`) is the PokerTH chip of the default table style (`gfx/gui/table/default/
genereticAvatar.png`, AGPL-3.0-or-later, above) on a green rounded square.
