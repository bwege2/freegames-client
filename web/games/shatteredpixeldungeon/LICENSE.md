# Shattered Pixel Dungeon: licence and credits

**Shattered Pixel Dungeon** is a game by **Evan Debenham** (Shattered Pixel). It is based on **Pixel Dungeon**
by **Oleg Dolya** (Watabou). What you play here is a port of Shattered Pixel Dungeon version 4.0.2 to the
browser, made by the freegames project.

## In short

- The game is free software. You may play it, share it, change it and even sell it, as long as you pass it on
  under the same licence, with its source code, and keep the credits below.
- The code is under the **GNU General Public License, version 3 or later** (GPL-3.0-or-later).
- The art, texts, music and sounds are under the **GPL-3.0**, and the developer also offers them under
  **Creative Commons Attribution-ShareAlike 4.0** (CC BY-SA 4.0).
- Nothing in the game is limited to non-commercial use, and nothing forbids changes.

## Who made what

| What | Who | Licence |
| --- | --- | --- |
| The game's code | Evan Debenham, Oleg Dolya | GPL-3.0-or-later |
| Texts in all languages | Evan Debenham and the community translators (via Transifex) | GPL-3.0 |
| Pixel art and splash art | Oleg Dolya (Pixel Dungeon's art), Aleksandar Komitov (dungeon and splash art), PumpkinVolt (item art), Alastair Braun (additional art), Evan Debenham | GPL-3.0 and CC BY-SA 4.0 |
| Music | Lumine (Kristjan Thomas) Haaristo; some tracks are based on Pixel Dungeon's music by Cube Code | GPL-3.0 and CC BY-SA 4.0 |
| Sound effects | Celesti, Watabou, and samples from freesound.org (listed below) | GPL-3.0 and CC BY-SA 4.0; the freesound samples under their own licences |
| The pixel font | bitmaps by Oleg Dolya, font file by Evan Debenham, with sizing and some glyphs from **Roboto** (Christian Robertson, Google, copyright Google 2014) | Apache-2.0 (the bitmaps GPL-3.0) |
| The font for Chinese, Japanese and Korean | Google (**Droid Sans**) | Apache-2.0 |
| The page's icon (the treasure chest) | the original game's own program icon | GPL-3.0-or-later |

Code © 2012-2015 Oleg Dolya (Pixel Dungeon) and © 2014-2026 Evan Debenham (Shattered Pixel Dungeon).

### Freesound samples

The original game credits these samples in its About screen, which this port shows unchanged:

```
Creative Commons Attribution License:
SFX ATTACK SWORD 001.wav by JoelAudio
Pack: Slingshots and Longbows by saturdaysoundguy
Cracking/Crunching, A.wav by InspectorJ
Extracting a sword.mp3 by Taira Komori
Pack: Uni Sound Library by timmy h123

Creative Commons Zero License:
Pack: Movie Foley: Swords by Black Snow
machine gun shot 2.flac by qubodup
m240h machine gun burst 4.flac by qubodup
Pack: Onomatopoeia by Adam N
Pack: Watermelon by lolamadeus
metal chain by Mediapaja2009
Pack: Sword Clashes Pack by JohnBuhr
Pack: Metal Clangs and Pings by wilhellboy
Pack: Stabbing Stomachs & Crushing Skulls by TheFilmLook
Sheep bleating by zachrau
Lemon,Juicy,Squeeze,Fruit.wav by Filipe Chagas
Lemon,Squeeze,Squishy,Fruit.wav by Filipe Chagas
```

Both licences (Creative Commons Attribution and Creative Commons Zero) allow commercial use and changes.

## Where the licences come from

- **The GitHub repository** of the game, [github.com/00-Evan/shattered-pixel-dungeon](https://github.com/00-Evan/shattered-pixel-dungeon)
  (version 4.0.2), holds the code and all assets together with one licence file, the GPL-3.0. No file in it
  says otherwise. The developer has confirmed on GitHub that the GPL-3.0 applies to the assets too (issue #380,
  "Asset licenses", 2020) and points anyone making their own game from it to the GPL-3.0: publish the source
  and give credit (issue #2333, 2026).
- **The developer's itch.io page** of the game,
  [shattered-pixel.itch.io/shattered-pixel-dungeon](https://shattered-pixel.itch.io/shattered-pixel-dungeon),
  states "Code license: GNU General Public License v3.0 (GPL)" and "Asset license: Creative Commons
  Attribution_ShareAlike v4.0 International". This was checked on 2026-11-09.

### One open point

The composer (Lumine Haaristo) and the sound designer (Celesti) have not published a licence statement of their
own. The free licence of the music and sounds comes from the developer, who publishes them in the GPL-3.0
repository and declares the game's assets CC BY-SA 4.0 on itch.io. The soundtrack is also sold on its own
(Steam, GOG, itch.io), which these licences allow. If a statement from the composer is ever needed, the music
can be left out: it is only loaded when a track starts, and the game runs without it, just as with music
switched off.

## This port

This port is a translation of the original's Java source to TypeScript, by the freegames project, with the
browser side written for this website. Like the original and the website, it is distributed under the **GNU
General Public License, version 3 or (at your option) any later version**.

> This program is free software: you can redistribute it and/or modify it under the terms of the GNU General
> Public License as published by the Free Software Foundation, either version 3 of the License, or (at your
> option) any later version.
>
> This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
> implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
> for more details.

The port also contains a few parts from other projects, under their own licences, all of which can be used
together with the GPL:

| Part | Licence |
| --- | --- |
| Pieces of libGDX 1.14.0 (text and font handling, gdx-freetype; Copyright 2011 See AUTHORS file, github.com/libgdx/libgdx), translated or rewritten for the port | Apache-2.0 |
| Pieces of FreeType 2.13.2 (font loading and outlines; Copyright (C) 1996-2023 by David Turner, Robert Wilhelm, and Werner Lemberg) | FreeType License |
| A hash table and priority queue adapted from OpenJDK 21 (Copyright (c) 1997, 2023, Oracle and/or its affiliates; taken from the FreeCol port on this site) | GPL-2.0 (version 2 only) with the Classpath exception (its text is in the FreeCol port's LICENSE.md) |
| fflate 0.8.2 (unpacking compressed data) | MIT |
| jpeg-js 0.4.4 (loading the splash art) | BSD-3-Clause |

The FreeType License asks for this credit: "Portions of this software are copyright © 1996-2023 The FreeType
Project (www.freetype.org). All rights reserved."

The original game uses a JSON library, **org.json**, whose licence ("The Software shall be used for Good, not
Evil.") is not a free licence. It is **not** included here: the port has its own replacement, written from
scratch and licensed GPL-3.0-or-later like the rest of the port. The original's Android, iOS and desktop
launchers, its news and update services, and libGDX as a whole are not included either.

## Licence texts

- GNU General Public License, version 3: on the website's licence page (`licenses/GPL-3.0.txt`) and at
  https://www.gnu.org/licenses/
- CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0

## Trademarks

"Shattered Pixel Dungeon" and "Pixel Dungeon" are the names of their authors' games. This port is not affiliated
with or endorsed by Shattered Pixel or Watabou.
