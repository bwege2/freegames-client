# Cart Life: license assessment — **blocked, not ported**

**Verdict: this game is a licensing blocker.** Cart Life's own license is a permissive, MIT-like license
for the code and the pixel art, but the same license **expressly excludes the music and the HOOGE font**.
The music that is in the game is under **CC BY-NC-SA**, **CC BY-NC-ND** or **all rights reserved**, and
HOOGE is a commercial font sold by its designer, "free for personal use" only. The project ships only a
game whose code **and every asset** are free for any use including commercial and compatible with
GPL-3.0+ (`AGENTS.md`, `web/LICENSE.md`). Cart Life does not meet that condition. Nothing was ported:
this folder holds this assessment and an unlisted `game.json` stub only.

The assessment was made on 2026-11-20 from the pinned reference described below. The full source and
asset inventory, hashes and commands are in `re/cartlife/NOTES.md`.

## The reference

* **Game:** *Cart Life* (Richard Hofmeier), first released 2011 for Windows, built with Adventure Game
  Studio; IGF 2013 Seumas McNally Grand Prix, Nuovo Award and Excellence in Narrative winner.
* **Reference version:** **Cart Life's Open Sores 0.1**, the 2017-06-30 community build of Hofmeier's
  2014 source release, compiled with AGS 3.4.0 (the original was AGS 3.2.1). The AGS project file is
  `cartlife/Game.agf`, `EditorVersion="3.4.0"`.
* **Provenance:** git mirror <https://github.com/gondur/cartlife_src>, branch `master`, commit
  `b82878b531a7c91950afc8e66102ef372f15d873` (2020-12-06). The same release is on SourceForge:
  <https://sourceforge.net/projects/cartlife/files/OpenSores_0.1/>, `CartLife_OS_0.1_Linux.zip`,
  92,362,455 bytes (2017-06-30). The GitHub README and the SourceForge description are by the
  maintainers; the license text is Hofmeier's.
* **Size of the working tree examined:** 349,079,566 bytes including git history; the `cartlife/` project is
  203,547,001 bytes, of which the sprite set is two RAR parts of 66,194,134 bytes and the audio cache is
  26,609,040 bytes.
* **License files:** `LICENSE.md` and `license.txt` at the repository root, byte-identical
  (SHA-256 `0d890480adb3e95c518708dc6d8df53ff05e8a5910a4895f9d5d46386c4319da`), quoted in full below.

Links: [Wikipedia](https://en.wikipedia.org/wiki/Cart_Life), [PC Gamer, 2014-03-20
"Cart Life exits Steam, goes open source"](https://www.pcgamer.com/cart-life-open-source/).

## The license, in full

> CART LIFE'S FREE LICENSE:
> Copyright (c) 2014 • Richard Hofmeier
> Permission is hereby and enthusiastically granted, free of charge, to anyone
> obtaining a copy of this software and associated documentation files (the "Software"),
> to deal in the software without restriction, including without limitation the rights to
> use, copy, modify, pervert, corrupt, manipulate, merge, publish, distribute, sublicense,
> and/or sell copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

This grant is a permissive license in the spirit of MIT/Expat: it allows commercial use, modification,
sublicensing and selling, and it is compatible with the GPL-3.0+ (it has no copyleft, NonCommercial or
NoDerivatives term). **But the same file continues with two carve-outs:**

> This doesn't include most of the music, of course, since it was composed and performed
> by people who aren't me. Please contact them for permission:
> MAT64: http://www.cervellomeccanico.com/
> POCKETMASTER: http://www.pocketmaster.ch/
> STU: http://stu.atari.org/
> LO-BAT: http://www.lo-bat.be/
>
> ALSO: This game uses the font "HOOGE" by Nicholay Dubina and Craig Kroeger, which
> I can't give you permission to use, probably. Best to ask Craig, instead.
> http://miniml.com/fonts/

These are not grants: they say explicitly that the licensor **cannot** grant rights to the music and the
font and that permission must be obtained from other people. The rest of the file is silent about them.
Under the project's rule ("code AND every asset free for any use including commercial"), that is a
blocker.

## File by file

Counts and sizes are from the pinned tree; the exact commands are in `re/cartlife/NOTES.md`.

| Part | Files in the release | Author / source | Terms | Free for any use, incl. commercial? |
| --- | --- | --- | --- | --- |
| Game code (AGS scripts) | 55 `*.asc`/`*.ash` files, 51,819 lines, 2,939,277 bytes; `Game.agf` (AGS 3.4.0 project) | Richard Hofmeier, with AGS community modules | CART LIFE'S FREE LICENSE (MIT-like) | **Yes** for Hofmeier's code. Modules: KeyboardMovement by Rui "Trovatore" Pires & strazer says "You are free to use this for any game, free or commercial"; FadingThingsNonBlocking carries an MIT text; **Parallax_ASH has no license header** (residual gap, not the decisive one). |
| Room backgrounds and animations | 39 room `*.crm` files + `_blank.crm`, 10,688,211 bytes; palette `pal.pal`, `pal2.bmp`, `preload.pcx` | Richard Hofmeier ("Drawn by Richard Hofmeier", MobyGames credits) | CART LIFE'S FREE LICENSE | **Yes** (part of the released Software; no separate terms). |
| Sprites | `acpsprset_DECOMPRESSME.part1.rar` + `part2.rar`, 66,194,134 bytes; `sprindex.dat` | Richard Hofmeier | CART LIFE'S FREE LICENSE | **Yes** (part of the released Software). |
| Texts | Dialogue and narration inside the 55 scripts, the room scripts and `Game.agf` texts | Richard Hofmeier | CART LIFE'S FREE LICENSE | **Yes**. |
| Sound effects | 98 clips in the `Sounds` folder of `Game.agf` (76 OGG + 62 WAV files in all, including the music, in `AudioCache/`; 26,609,040 bytes total audio) | No per-file credit in the release; part of the released Software | CART LIFE'S FREE LICENSE (the carve-out names only "most of the music" and HOOGE) | **Probably** covered by the grant, but no per-file provenance. Not the decisive issue. |
| Music | **40 music clips** in the `Music` folder of `Game.agf`: 35 from `Music\music1.ogg` … `music35.ogg`, 4 from `music41.ogg` … `music44.ogg`, 1 intro from `Sound\sound110.ogg`; 19,246,387 bytes, 24.5 minutes | Lo-Bat, Mat64, Pocketmaster, STU; ending-credit song "Commerce Unread" by Richard Hofmeier (MobyGames credits) | **Expressly excluded** from the Free License. The artists' own terms are **CC BY-NC-SA**, **CC BY-NC-ND** or **all rights reserved** (quotes below). | **No.** NonCommercial and NoDerivatives terms; STU's releases say "all rights reserved". |
| Font | `fonts/h.ttf` plus `agsfnt0.ttf` … `agsfnt8.ttf` (10 files, 470,480 bytes), all the same font | "hooge 05_58", ©2001 www.miniml.com, design by Craig Kroeger; MobyGames: Nikolay Dubina, Craig Kroeger | **Expressly excluded**: "which I can't give you permission to use, probably". The font is sold by its designer for **$10 each**; download sites list it as "Free for Personal Use". | **No.** Commercial use and redistribution are not granted. |
| AGS runtime / compiled build | `Compiled/Compiled.rar`, `Compiled/acsetup.cfg`, `resources/ags_shell.dll`, the two `.dmp` crash dumps | Adventure Game Studio project | AGS is a separate engine; not shipped by a browser port | Not part of a native TypeScript port. |
| Documentation images | `readmeimages/*.jpg` (4 files, 208,094 bytes) | AGS website screenshots in the release's readme | Documentation only | Not shipped. |
| Icons | `user.ico`, `setup.ico`, `template.ico` (3 files) | AGS defaults / game icon | Not separately licensed | Not used: no favicon was drawn for a game that is not ported. |

## The music: exact terms found

The release names the four artists and says to ask them. Their own publications carry the terms:

* **Pocketmaster** — the game's "Ninjamaggots" is the *Residue* track "Ninja Maggots"; Free Music
  Archive's *Residue* (2010) says: "The songs in this album are licensed under: **CC BY-NC-ND 2.0**";
  the track pages say "Attribution-Noncommercial-NoDerivatives 2.0 France License"
  (<https://freemusicarchive.org/music/Pocketmaster/Residue/>,
  <https://freemusicarchive.org/index.php/music/Pocketmaster/Residue/04_-_Wrong_Calibration/>). The later
  album *#010010* is likewise "distributed under a Creative Commons **BY-NC-ND** license"
  (<https://dahearditrecords.bandcamp.com/album/d-hr-31-010010>). Cart Life's main theme, "Joggers in
  the Park", is from the earlier self-produced *Tin Guerilla* EP, offered as a free download on
  <http://pocketmaster.ch/releases/> without a stated license.
* **Lo-Bat** — Free Music Archive biography: "All my tracks are released under the Creative commons
  license. This means you are free to download, listen, copy and spread my music as much as you want …
  **as long as you don't use it for commercial purposes** and as long as you give credit to me."
  The album *Game Boy* is "**CC BY-NC-SA**"
  (<https://freemusicarchive.org/music/Lo-Bat/bio>, <https://freemusicarchive.org/index.php/music/Lo-Bat/Game_Boy>).
  The MobyGames credits list Lo.Bat's "Big Scratch; Barabra Listen To This; Good Morning; Chip.Munk;
  Roborevolt; Sal To Mortale".
* **Mat64** — "MAT64 music is released under creative commons" (<https://www.mat64.org/>); Free Music
  Archive's *The Midnight Eclipse vol.1* is "**CC BY-NC-SA**", individual tracks
  "Attribution-Noncommercial-Share Alike 2.5 Italy License"
  (<https://freemusicarchive.org/music/MAT64/The_Midnight_Eclipse_vol1>). The game credits "In The
  Hollow Stump; CEM Master Theme; Domen279; Crystaline Caves; Noise Pulse; Commodorish".
* **STU** — the Bandcamp releases *Atari Worx 2003 - 2008*, *STream Vol. 3* and *Atari Solo* each state
  "license: **all rights reserved**" (<https://stumusic.bandcamp.com/album/atari-worx-2003-2008>,
  <https://stumusic.bandcamp.com/album/stream-vol-3>). The game credits "Elements: Fire Earth Air Water".
* **Richard Hofmeier** — the ending-credit song "Commerce Unread" is by the game's author and is
  therefore under the Free License. One free track does not clear the other 39 clips.

The credits are corroborated by the game's MobyGames page
(<https://www.mobygames.com/game/139967/cart-life/credits/windows/>):

> Music | Lo.Bat (Big Scratch; Barabra Listen To This; Good Morning; Chip.Munk; Roborevolt; Sal To
> Mortale), Mat64 (In The Hollow Stump; CEM Master Theme; Domen279; Crystaline Caves; Noise Pulse;
> Commodorish), Pocketmaster (Joggers In The Park; Urban Ratz; Come To Nothing; Robo Ghosts;
> Ninjamaggots), … STU (Elements: Fire Earth Air Water)
>
> The Ending Credits Music (and the Ending Music Credit) is "Commerce Unread" | Richard Hofmeier (by
> the game's author)

This is not optional background music that could simply be muted like Abuse's Bobby Prince tracks:
the 40 clips are 24.5 minutes of the game's soundtrack, the in-game pawnshop sells the artists' CDs
(`bLobat`, `bMat64`, `bPocket`, `bStu`) and the "Music Unlockdom" globals (200–224) are a collectible
mechanic. Removing all of it would remove a game system, not just a sound layer.

## The font: exact terms found

The font file's own name table says:

> ©2001 | www.miniml.com | design by craig kroeger
> hooge 05_58
> Hooge0558

Craig Kroeger's font page sells the Miniml fonts: "The Miniml Fonts Package includes 120 Truetype
webfonts … **Individual fonts are $10 each**"
(<https://www.craigkroeger.com/fonts/fonts>). Font download indexes describe *Hooge 05_58* as "Free for
Personal Use" (<https://font2s.com/fonts/53332/hooge_05_58.html>). Hofmeier's license says he cannot
grant permission: "which I can't give you permission to use, probably. Best to ask Craig, instead."
Without a written commercial/redistribution grant from Craig Kroeger (and Nikolay Dubina, whom
MobyGames credits), the font cannot be shipped. It is also the whole UI typeface: all ten `*.ttf` files
in the game are this one font, so there is no free font in the release to fall back on.

## Why this is a blocker and not "just omit it"

A port could legally be built from the free code and art alone, with the 40 music clips dropped and a
free lookalike font substituted. That is what the project did for Abuse (non-free Bobby Prince audio)
and Diamond Trust of London (music not in the source tree). But:

1. The ticket's rule is **"code AND every asset"** free for any use including commercial. The soundtrack
   is an asset of the reference and is under NC/ND terms; the font is an asset and is commercial. The
   condition is not met.
2. A port without them would not be **1:1**: it would lose 24.5 minutes of music, the in-game CD items
   and the Music Unlockdom mechanic, and it would change every screen's typeface. The task allows
   deviations only where the browser forces them; a licensing cut of this size is not one.
3. The excluded music is not a marginal extra: Cart Life's identity is bound up with its soundtrack
   (the main theme is Pocketmaster's "Joggers in the Park"). A silent Cart Life with a different font
   is a different product, not a port of this reference.

Therefore the license gate is failed and no port was attempted. If the rights holders grant written
permission (commercial use, modification and redistribution under GPL-3.0-compatible terms) for all 40
clips and the HOOGE font, or if a version appears with a fully free soundtrack and font, the port can
start from this assessment.

## Favicon

None. The game is not ported, so no `web/icons/cartlife.png` or `cartlife-180.png` was drawn. The game's
pixel art itself is under the Free License and could be used for an icon if the game were ever
unblocked.

## What is shipped in this folder

Only this assessment and an unlisted `game.json` stub (`"listed": false`, no `src/index.ts`, no
screenshots, no assets). The stub exists so the website's catalog test, which requires a valid
`game.json` in every `web/games/<id>/` folder, stays green; the game page shows "Coming soon" and is
reachable only by its direct link. No original code, art, music or font is committed here, and no
reference archive is committed anywhere.
