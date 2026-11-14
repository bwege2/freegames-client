# PokerTH: license check (step 1 of the port)

Checked on 2026-11-14, before any porting. Question: may the code and **every** asset the port takes from
the original be used commercially, and are they compatible with GPL-3.0 (no NC, no ND)?

## Reference version: PokerTH 1.1.2

The port follows **PokerTH 1.1.2** (2017, tag `v1.1.2` of https://github.com/pokerth/pokerth, commit
`2ca2e941a616c200e3ec81243ad0ed4243b3030e`, `re/pokerth/fetch.sh`): the last release of the classic Qt Widgets
client, and the version Debian has shipped in **main** for years (bullseye, bookworm, trixie: 1.1.2), which
means Debian's FTP masters checked every file of it against the DFSG. Debian's `debian/copyright` for 1.1.2
(https://sources.debian.org/data/main/p/pokerth/1.1.2-3/debian/copyright) lists the license of each data file;
the upstream `data/data-copyright.txt` names the sources. Both agree with the table below.

The current upstream (2.x, QML client, `master` of 2026-11-12) is **not** the reference, see the end of this file.

## Result per asset group (PokerTH 1.1.2)

| Group | Files | Author / source | License | Commercial use, GPL-3.0 compatible? |
| --- | --- | --- | --- | --- |
| Program code | `src/` (engine, AI, GUI, network) | Felix Hammer, Florian Thauer, Lothar May, PokerTH team | **AGPL-3.0-or-later** with an OpenSSL linking exception | yes. AGPL-3.0 and GPL-3.0 may be combined (GPL-3.0 §13 / AGPL-3.0 §13). The port is a translation, so it is **AGPL-3.0-or-later** itself: the site must offer its source to everyone who plays it over the network (AGPL §13). The browser code is in the public source repository already (`web/games/pokerth`); see "The server" below. |
| Card deck (default) | `data/gfx/cards/default/0.png`–`51.png` | Wikimedia Commons user Xiong (2005–2007), "Poker (cards deck)" | GFDL-1.2-or-later **or public domain** (Debian) | yes: used under the public-domain option |
| Card backs | `data/gfx/cards/default/flipside.png`, `flipside_tux.png` | PokerTH team; Tux by Larry Ewing, made with The GIMP | AGPL-3.0 (Debian `Files: *`); Tux: "Permission to use and/or modify this image is granted provided you acknowledge me lewing@isc.tamu.edu and The GIMP if someone asks" | yes, with the Tux credit (in the port's LICENSE.md) |
| Table graphics (default style) | `data/gfx/gui/table/default/*` (table, pucks, card holders, action buttons, seat frames, hand ranking) | PokerTH team (style XML: "PokerTH Development Team") | AGPL-3.0 (Debian `Files: *`) | yes |
| Action labels | `data/gfx/gui/misc/actionpics/action_*.png` | PokerTH team | AGPL-3.0 (`Files: *`) | yes |
| Sounds | `data/sounds/default/yourturn.wav`, `lobbychatnotify.wav` | Olivier Goffart, KDE knotify (KDE_Beep_Connect.ogg, KDE_Beep.ogg) | GPL-2.0-or-later | yes ("or later" → GPL-3.0) |
| | `onlinegameready.wav` | Yves Jans (kde-look.org "kJazz") | GPL, any version | yes |
| | `allin.wav`, `bet.wav`, `raise.wav`, `check.wav`, `call.wav`, `dealtwocards.wav` | pokerth.net user doc_dos | BSD-3-Clause | yes |
| | `blinds_raises_level1-3.wav` | freesound.org user rj10328 (on samples by bertrof and justinbw) | CC BY 3.0 | yes (attribution; no NC, no ND). Shipped as separate media files next to the AGPL program, with credit. |
| | `fold.wav`, `playerconnected.wav` | PokerTH team | AGPL-3.0 (`Files: *`) | yes |
| Font | `data/fonts/DejaVuSans-Bold.ttf` | Bitstream Vera / DejaVu | Bitstream Vera license (free, commercial use allowed; modified fonts must be renamed) | yes, used unchanged |
| Avatars | `data/gfx/avatars/default/misc/*` (ZeiZei), `people/*` (friends and family; 13 Wikimedia Commons paintings and photos) | see left | BSD-3-Clause; public domain (Commons) | yes. **Not used by the port**: in 1.1.2 the computer opponents have no avatar unless the player picks one, and photos of private persons are not needed. |
| Table style "danuxi1" | `data/gfx/gui/table/danuxi1/*` | Daniel Hammer | GPL-2.0-or-later | yes; not used (the port has the default style only) |
| Translations | `ts/*.ts`, `data/translations/*` | translators | AGPL-3.0 | yes; the port is English only |
| GUI icons | `src/gui/qt/resources/gfx/*` (Oxygen/Crystal-style icons) | various | AGPL-3.0 per Debian `Files: *` | not used (the port draws its own buttons with text) |
| Third-party libraries | Qt (LGPL), Boost (BSL-1.0), protobuf (BSD), websocket++ (BSD/Zlib/Expat), SQLite (public domain), OpenSSL | | | not used: the port is TypeScript and uses only this site's SDK (capnp-es) |

**Result: every asset the port uses is free, allows commercial use and is compatible with GPL-3.0
(AGPL-3.0, GPL-2.0+, GPL any, BSD-3-Clause, CC BY 3.0, public domain, Bitstream Vera). Nothing NC, nothing ND.
The port may go ahead.**

## The server: AGPL-3.0 §13

The port itself (browser code) is AGPL-3.0-or-later and lies in the public source repository like every game.
This site's game server is not published (`web/scripts/source-paths.mjs`, `NEVER`). A server module that is a
translation of PokerTH's engine (`LocalHand`, `LocalBoard`, `CardsValue` in Java) would be an AGPL work that
users interact with over the network, and its source would have to be offered to them. So the server module
`server/.../games/pokerth/` is **not** derived from PokerTH's code: it is a small, generic card dealer written
for this site (shuffle a 52-card deck with the server's own random numbers, hand each seat its two cards, show
board and hole cards when all seats ask for the same step, gate idle-timeout claims). It contains no rule of
Texas Hold'em and nothing of PokerTH's source; the rules run in the AGPL client code on every player's machine.

## Not the reference: PokerTH 2.x (current upstream)

The 2.x line (QML client) adds themes that are not all free or not clearly licensed, so it was not used:

* `data/gfx/qml/backside/star_trek/backside.svg`: "https://icons8.com (icon 'Next Generation Badge')": the Icons8
  license is not a free license (link required, no redistribution as icons), and Star Trek is a trademark.
* `data/gfx/qml/cards/lemming/*`: "(c) lemming (2021)", no license named.
* `data/gfx/qml/cards/discworld/*`, `backside/discworld`: AI-generated, "motifs inspired by Terry Pratchett's
  Discworld" (trademark / derivative questions), no license named.
* Several tables (`disco`, `discworld`, `greencasino`, `ivoire-chene`, `matrix`, `pirates`, `saloon`,
  `star_trek`): "generated with ChatGPT (OpenAI)", no license named; others (`tripsixes`, `wanted`, `xanax`,
  `bella_union_4c`, `nobus_*`, `mute*`, `teal`) are not listed in `data-copyright.txt` at all.

None of these files exists in 1.1.2, and the port uses none of them.
