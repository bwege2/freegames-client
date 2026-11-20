# License and trademark check: DRL (Doom, the Roguelike) 0.10.0e

**Verdict: blocked. This game is not ported and must not be added to freegames.stream.**

DRL's *code* is free software (GPL-2.0) and its *tiles* are free cultural works (CC BY-SA 4.0), but the
reference release is not free as a whole, and the game is built on id Software's Doom:

1. **NonCommercial music.** Ten tracks by Simon Volpert in the high-quality package carry
   `Creative Commons BY-NC-SA` in their own ID3 tags (comment, copyright and license fields). The ticket's
   rule is explicit: a NonCommercial term is a blocker. The low-quality package does not remove the problem:
   nine of the ten tracks appear as MIDI files with no licence statement at all, and 22 of its 31 tracks are
   id Software's.
2. **id Software's audio.** The low-quality package ships 90 `ds*.wav` sound effects with Doom's lump names,
   and the game's own credits say: "Original MIDI tracks and sound effects are of course by Id Software."
   22 of the 31 MIDI files are Doom's tracks; several embed the string `DOOM (c) 1993,1994 by id software`.
3. **No free licence for the high-quality audio.** The Sonic Clang/Thumpmonk remixes and Per Kristian
   Risvik's sound recreations are "used with permission" — permission for DRL, not a licence to anyone else.
4. **Unresolved Doom trademark and character rights.** Monsters (cacodemon, cyberdemon, spider mastermind,
   ...), weapons (BFG 9000, plasma rifle, ...), levels (Phobos Anomaly, Tower of Babel, Dis, ...) and the story
   (UAC, Phobos, Deimos, "The Shores of Hell", "Inferno") are id Software's. DRL's GPL/CC grants come from
   Kornel Kisielewicz, Derek Yu and Łukasz Śliwiński; they cannot license id's rights. The author's own README
   calls the game `"That Trademark", the Roguelike`.
5. **An extra restriction.** The release's manual and `disclaim.hlp` say: "This game is Freeware but with some
   limitations. Re-distribution ... is allowed as long as the author is informed." That is a further
   restriction on top of the GPL, which the GPL forbids, and it is not "free for any use".

A 1:1 port cannot avoid this by dropping the sound or renaming a few monsters: the audio is part of the
reference, and the Doom content is the game. The ticket is stopped at step 1, as instructed. **No port code, no
asset, no `game.json`, no favicon and no screenshot was made; this folder contains only this assessment.**

## The reference

| | |
| --- | --- |
| Game | DRL, a.k.a. "Doom, the Roguelike" / DoomRL, by Kornel Kisielewicz (ChaosForge) |
| Reference version | **0.10.0e**, the current open-source release (2025-08-22) |
| Source | <https://github.com/chaosforgeorg/drl>, tag `0_10_0e`, commit `13f010c87e0ac4c585d43e8ca48fea881acbd472` |
| Release (HQ) | `drl-linux-0100.tar.gz`, 103 MB, sha-256 `367ca7ba3074cff4de429cafb76bfd023685e3a5b3d70fd80f6540368879c1d9` |
| Release (LQ) | `drl-linux-0100-lq.tar.gz`, 7.5 MB, sha-256 `20b2572b05e6ef4ac100fd557e2b2f0b58e14279b13012dda323df890f3f89a2` |
| Downloads | <https://drl.chaosforge.org/downloads> (file ids 49 and 48) |

The source repository does **not** contain the audio. Its README says:

> You will also probably need the binary files of the full game downloadable from
> <http://drl.chaosforge.org/> (in particular the sound, soundhq, music and mp3 folder contents, and the
> premade drl.wad and core.wad if you don't want to create it yourself).

So the complete reference game is the binary release, and the binary release is where the non-free audio is.
The source tag alone is not a complete free game.

The 0.9.9.7 era is explicitly named **DoomRL** in the project's own `bin/unix_notes.txt` ("Known issues with
Unix (Linux, FreeBSD) DoomRL versions"), and the current art dates from that release. Renaming the game to DRL
in 0.10.0 did not replace the content.

## The licences the project states

The source repository has two free-licence files and one installer disclaimer; the binary packages have no
licence file at all.

### Code: `LICENSE`, GPL version 2

`LICENSE` is the text of the **GNU General Public License, version 2** (339 lines, sha-256
`db296f2f7f35bca3a174efb0eb392b3b17bd94b341851429a3dff411b1c2fc73`). The README says:

> All code is (C) 2003-2025 Kornel Kisielewicz
>
> Code is distributed under the GPL 2.0 license (see LICENSE file in this folder)

There is no "or any later version" in the README, and the individual `src/*.pas` files carry only a copyright
line, no licence header. On the face of the files this is **GPL-2.0-only**. The website's additional
permission (`web/LICENSE.md`) allows a game port under "the GNU General Public License version 2 only", so the
*code licence alone* would not stop a port. It is not the blocker.

### Art: `bin/data/drl/graphics/LICENSE`, CC BY-SA 4.0

The graphics folder contains the **Creative Commons Attribution-ShareAlike 4.0 International** legal code
(20,132 bytes, sha-256 `bae5ccc863235f984a52c07d011e48a86c0c12f923be2dedd8624c7abdc22c6c`). The README says:

> Original art and sprites (0.9.9.7) by Derek Yu, (C) 2003-2025, licensed under CC BY-SA 4.0. Modified
> version and additions (0.9.9.8+) by Łukasz Śliwiński, (C) 2025, licensed under CC BY-SA 4.0.
>
> All art is distributed under the CC-BY-SA 4.0 license (see LICENSE file in bin/data/drl/graphics).

CC BY-SA 4.0 is a free licence: it allows commercial use, modification and redistribution, and Creative
Commons declares it one-way compatible with GPLv3. The *licence* is acceptable for this site. What it does not
do is give anyone rights in the Doom characters the pictures depict; see "The Doom question" below.

### Audio and fonts: no licence at all

There is no licence file for `bin/data/drlhq/` or `bin/data/drllq/`. The audio folders contain only
`!readme.txt` files that say the files are "needed to run the game" and are "downloadable from
<http://drl.chaosforge.org/>". There is no grant of any kind. The font folder has no licence or attribution
either.

## File-by-file check

"Port" below would mean the file (or a lossless copy of its data) is in `web/games/drl/` or its content was
translated into it. Nothing was ported.

| Path in the reference | What it is | Licence as stated | Assessment |
| --- | --- | --- | --- |
| `LICENSE` | GPL v2 legal text | GPL-2.0 (README: "GPL 2.0") | free code; not the blocker |
| `src/*.pas` (51 files), `src/*.inc`, `*.lpi`, `*.rc`, `*.ico`, `*.manifest` | engine, SDL platform, UI, save/high-score code | GPL-2.0 (README; no per-file header, no "or later") | free code; a translation would be GPL-2.0-only, which the site's additional permission covers |
| `bin/data/core/*.lua` (15 files) | core rules, dungeon generation, things, items, UI, mortem | GPL-2.0 ("All code") | free code; translated logic would be GPL-2.0-only |
| `bin/data/drl/*.lua` (21 files) | game rules: beings, plot, sprites, traits, ranks, missiles, rooms, AI, assemblies | GPL-2.0 ("All code") | free code, but the data names and describes Doom's creatures, items and levels |
| `bin/data/drl/items/*.lua` (3 files) | weapon, item and unique-item definitions | GPL-2.0 | free code, but the arsenal is Doom's (BFG 9000, plasma rifle, ...) |
| `bin/data/drl/levels/*.lua` (24 files) | special levels and their layouts | GPL-2.0 | free code, but many are Doom's levels by name and design |
| `bin/data/drl/graphics/*.png` (32 files) + `LICENSE` | monster, weapon, item, marine, decoration, level, FX, logo and background tiles | **CC BY-SA 4.0** (`bin/data/drl/graphics/LICENSE`; README credits Derek Yu and Łukasz Śliwiński) | free licence, but the pictures depict id's monsters, weapons and marine; CC only covers the artists' drawings, not id's characters; `logo.png` imitates the Doom logo's style |
| `bin/data/drl/ascii/*.asc` (22 files) | ASCII art of the same monsters | GPL-2.0 (part of the code/data tree; no separate art licence) | original ASCII art, but the same Doom character issue |
| `bin/data/drl/fonts/font10x19.png`, `fonts/default` | bitmap font sheet and its size config | **no licence or attribution found** | unresolved; see "Fonts" below |
| `bin/data/drl/help/*` (10 files, including `drl.txt`) | help, intro, keys, credits, disclaimer, manual source | GPL-2.0 (part of the code/data tree) | the story is adapted from Doom; the disclaimer is a non-free restriction |
| `bin/data/drlhq/music/*.mp3` (21 files) | high-quality soundtrack | 11 Doom covers (Sonic Clang/Thumpmonk, "used with permission"), 10 Simon Volpert tracks tagged **CC BY-NC-SA** | **blocker: NonCommercial** |
| `bin/data/drllq/music/*.mid` (31 files) | low-quality soundtrack | 22 Doom MIDI tracks (embedded id copyright) + 9 Simon Volpert tracks with no licence | **blocker: id copyright / no licence** |
| `bin/data/drlhq/sound/*.wav` (91 files) | high-quality sound effects | "recreation ... used with permission" (Per Kristian Risvik) | **blocker: derivative of id's sounds, no free licence** |
| `bin/data/drllq/sound/*.wav` (90 files) | low-quality sound effects | id Software's Doom sound effects (credits) | **blocker: id copyright** |
| `bin/data/drlhq/audio.lua`, `bin/data/drllq/audio.lua` | soundtrack/sound-effect mapping | GPL-2.0 code; the comments state the provenance | evidence, not a licence for the audio |
| `bin/data/drl/help/disclaim.hlp`, `manual.txt` § Disclaimer, `install/install_license.txt` | "Freeware" notice (help file, manual, Windows installer licence page) | "Freeware but with some limitations. Re-distribution ... is allowed as long as the author is informed" | **blocker: extra restriction incompatible with the GPL** |
| `ext/linux/libfmod.so`, `ext/windows/fmod64.dll` | FMOD audio library | proprietary, no licence file in the repository | the source tree is not wholly free; a browser port could avoid FMOD, but the release still ships it |
| `ext/linux/libsteam_api.so`, `ext/windows/steam_api64.dll` | Steamworks library | proprietary, no licence file | same |
| `ext/windows/lua5.1.dll`, `lua5.1.exe` | Lua 5.1 | MIT (Lua's licence), no licence file in `ext/` | probably free, but unstated |
| `old/*` | old DoomRL code and assets (`doom.png`, `spritesheet*.png`, `message.png`, old `.pas` files) | no licence statement | not used by the current game; unresolved |
| `bin/modules/classic.module/*` | "Classic Mode" episode module | GPL-2.0 (same source tree) | its boss is the Cyberdemon; same IP issue |
| `drl-linux-0100.tar.gz`, `drl-linux-0100-lq.tar.gz` | complete binary releases | **no `LICENSE`, `COPYING` or `README` licence file** | licence texts are not shipped with the binaries |

### The files in each group

`bin/data/drl/graphics/*.png` (32):

```
background.png  cursor.png  dguy.png  dguy_emissive.png  dguy_mask.png  dguy_shadow.png
doors_and_decorations.png  doors_and_decorations_emissive.png  doors_and_decorations_mask.png
doors_and_decorations_shadow.png  enemies.png  enemies_big.png  enemies_big_emissive.png
enemies_big_shadow.png  enemies_emissive.png  enemies_shadow.png  fx.png  fx_emissive.png
fx_mask.png  guns_and_pickups.png  guns_and_pickups_emissive.png  guns_and_pickups_mask.png
guns_and_pickups_shadow.png  levels.png  levels_emissive.png  levels_mask.png  logo.png
low_life_glow.png  lut_berserk.png  lut_clear.png  lut_enviro.png  lut_iddqd.png
```

`bin/data/drl/ascii/*.asc` (22):

```
angel.asc  arachno.asc  arch.asc  barmor.asc  baron.asc  cacodemon.asc  captain.asc
commando.asc  cyberdemon.asc  demon.asc  former.asc  garmor.asc  imp.asc  knight.asc
logo.asc  lostsoul.asc  mancubus.asc  pain.asc  player.asc  rarmor.asc  revenant.asc
sergeant.asc
```

`bin/data/drl/levels/*.lua` (24):

```
abyssal.lua  arena.lua  armory.lua  asmosden.lua  boss.lua  carnage.lua
centralprocessing.lua  chained.lua  containment.lua  deimoslab.lua  fortress.lua
house.lua  intro.lua  lavapits.lua  limbo.lua  milibase.lua  mortuary.lua
mterebus.lua  phoboslab.lua  skulls.lua  spider.lua  toxinrefinery.lua  vaults.lua
wall.lua
```

`bin/data/core/*.lua` (15):

```
aitk.lua  being.lua  blueprints.lua  commands.lua  constants.lua  functions.lua
generator.lua  item.lua  level.lua  main.lua  meta.lua  mortem.lua  player.lua
thing.lua  ui.lua
```

`bin/data/drl/*.lua` (21):

```
affects.lua  ai.lua  archi.lua  assemblies.lua  awards.lua  beings.lua  cells.lua
challenge.lua  difficulty.lua  events.lua  generator.lua  generators.lua  klass.lua
main.lua  meta.lua  missiles.lua  plot.lua  ranks.lua  rooms.lua  sprites.lua
traits.lua
```

`bin/data/drl/help/` (10):

```
credits.hlp  disclaim.hlp  drl.txt  feedback.hlp  gamepad.hlp  intro.hlp  keys.hlp
make_manual.lua  mouse.hlp  start.hlp
```

`bin/data/drllq/sound/*.wav` (90):

```
dsbarexp.wav  dsbdcls.wav  dsbdopn.wav  dsbfg.wav  dsbgact.wav  dsbgdth1.wav
dsbgdth2.wav  dsbgsit1.wav  dsbgsit2.wav  dsbrsdth.wav  dsbrssit.wav  dsbspact.wav
dsbspdth.wav  dsbspwlk.wav  dscacdth.wav  dscacsit.wav  dsclaw.wav  dscybdth.wav
dscybsit.wav  dsdmact.wav  dsdmpain.wav  dsdorcls.wav  dsdoropn.wav  dsdshtgn.wav
dsfirsht.wav  dsfirxpl.wav  dsgetpow.wav  dshoof.wav  dsitemup.wav  dsitmbk.wav
dskntdth.wav  dskntsit.wav  dsmanatk.wav  dsmandth.wav  dsmansit.wav  dsmetal.wav
dsmnpain.wav  dsnoway.wav  dsoof.wav  dspdiehi.wav  dspedth.wav  dspepain.wav
dspesit.wav  dspistol.wav  dsplasma.wav  dspldeth.wav  dsplpain.wav  dspodth1.wav
dspodth2.wav  dspodth3.wav  dspopain.wav  dsposact.wav  dsposit1.wav  dsposit2.wav
dsposit3.wav  dspstart.wav  dspstop.wav  dspunch.wav  dsrlaunc.wav  dsrxplod.wav
dssawful.wav  dssawhit.wav  dssawidl.wav  dssawup.wav  dssgcock.wav  dssgtatk.wav
dssgtdth.wav  dssgtsit.wav  dsshotgn.wav  dsskeact.wav  dsskeatk.wav  dsskedth.wav
dsskepch.wav  dsskesit.wav  dssklatk.wav  dsskldth.wav  dsslop.wav  dsspidth.wav
dsspisit.wav  dsstnmov.wav  dsswtchn.wav  dsswtchx.wav  dstelept.wav  dstink.wav
dsvilact.wav  dsvilatk.wav  dsvildth.wav  dsvilsit.wav  dsvipain.wav  dswpnup.wav
```

`bin/data/drlhq/sound/*.wav` (91): the same 90 names plus `dxbarexp.wav`.

`bin/data/drllq/music/*.mid` (31):

```
00 - inter.mid  0  - intro.mid  11 - hangar.mid  12 - nuclear plant.mid
13 - toxin refinery.mid  14 - command control.mid  15 - phobos lab.mid
16 - central processing.mid  17 - computer station.mid  18 - phobos anomaly.mid
19 - military base.mid  22 - containment area.mid  24 - deimos lab.mid
26 - halls of the damned.mid  27 - spawning vats.mid  28 - tower of babel.mid
29 - fortress of mystery.mid  32 - slough of despair.mid  33 - pandemonium.mid
38 - dis.mid  98 - victory.mid  99 - bunny.mid
dark_secrets.mid  final_showdown.mid  hells_weapons.mid  of_skull_and_bone.mid
rage.mid  something_wicked.mid  the_brick_song.mid  too_hot_down_here.mid
unholy_cathedral.mid
```

`bin/data/drlhq/music/*.mp3` (21):

```
cde1m1.mp3  cde1m2.mp3  cde1m3.mp3  cde1m4.mp3  cde1m5.mp3  cde1m6.mp3
cde1m7.mp3  cde1m8.mp3  cde1m9.mp3  d1end.mp3  d1readme.mp3
dark_secrets.mp3  d_the_roguelike.mp3  final_showdown.mp3  hells_weapons.mp3
of_skull_and_bone.mp3  rage.mp3  something_wicked.mp3  the_brick_song.mp3
too_hot_down_here.mp3  unholy_cathedral.mp3
```

## The Doom question

### Names, creatures and items taken from Doom

The game's own data is the evidence; these are not inferences from screenshots.

**Monsters** — `bin/data/drl/beings.lua` registers, among others:

- `former human`, `former sergeant`, `former captain`, `former commando` — Doom's zombieman, shotgun guy,
  chaingunner and commando;
- `imp`, `demon`, `lost soul`, `cacodemon`, `hell knight`, `baron of hell`, `arachnotron`, `pain elemental`,
  `revenant`, `mancubus`, `arch-vile` — Doom/Doom II monsters;
- `Cyberdemon`, `Spider Mastermind` — Doom's boss monsters (with `Cyberdemon's Head` and `Mastermind's Brain`
  as items);
- `nightmare` variants of the same list — Doom's "nightmare" difficulty is the model;
- `John Carmack` — a boss named after id Software's co-founder.

DRL does add original monsters (`bruiser brother`, `shambler`, `lava elemental`, `agony elemental`, `Angel of
Death`, `Apostle`). Those additions do not make the rest original: the bestiary, the boss pair and the
progression are Doom's.

**Weapons and items** — `bin/data/drl/items/items.lua` and `eitems.lua`:

- `pistol`, `shotgun`, `double shotgun`, `chaingun`, `rocket launcher`, `plasma rifle`, `chainsaw`,
  `BFG 9000` (and `nuclear BFG 9000`, `BFG 10K`) — Doom's arsenal;
- `small med-pack`, `large med-pack`, `Berserk Pack`, `Supercharge Globe` (soulsphere), `Megasphere`,
  `Invulnerability Globe`, `Computer Map`, `Backpack`, `green armor`, `blue armor`, `red armor`, `armor shard`
  — Doom's pickups.

**Levels** — `bin/data/drl/levels/*.lua` and `boss.lua`:

- `Phobos Anomaly`, `Tower of Babel`, `Dis` (`boss.lua`);
- `Phobos Lab`, `Deimos Lab`, `Containment Area`, `Military Base`, `Toxin Refinery`, `Central Processing`,
  `City of Skulls`, `The Lava Pits`, `Limbo`, `Mt. Erebus`, `Unholy Cathedral`;
- the episode names and the level order follow Doom's *Knee-Deep in the Dead*, *The Shores of Hell* and
  *Inferno*.

**Story and text** — `bin/data/drl/plot.lua` and `help/intro.hlp`:

> The trip was long -- you thought it would never end. But hell, a marine's job is rarely interesting. You
> hate the UAC -- nothing ever happens here. Now you've got to sit around and wait for your squadmates, who
> are supposed to check out what happened on Phobos.

> It stinks like rotten meat but it looks like the lost Deimos base. Looks like you're stuck on The Shores of
> Hell. And the only way out is through...

> The hideous Cyberdemon lord that ruled the lost Deimos moon base has been slain and you are triumphant!

> Now, it's on to the final chapter of DRL -- Inferno!

> John Carmack is dead.

> DRL II : Hell on Earth!

The intro help says:

> DRL is inspired by a famous 1993 FPS hellish shooter. You're the sole surviving marine from a squad sent to
> investigate a distress call from the moonbase of Phobos.

The skill levels in `help/start.hlp` are Doom's: `"I'm too young to die"`, `"Hey, Not Too Rough"`, `"Hurt Me
Plenty"`, `"Ultra-Violence"`, `"Nightmare!"`.

**Art** — `bin/data/drl/graphics/` contains `enemies.png` (the Doom bestiary), `guns_and_pickups.png` (the
Doom arsenal), `dguy.png` (the Doom marine), `doors_and_decorations.png`, `levels.png`, `fx.png`, and
`logo.png` in a Doom-like blue/yellow metal style. The pixels are by Derek Yu and Łukasz Śliwiński, but the
subjects are id's characters and items. A drawing made from scratch of a copyrighted character is still a
derivative work of that character; the CC BY-SA 4.0 grant covers the artist's expression, not the character.

### Are these id Software's?

Yes.

- **Doom is id Software's.** id's own site describes "id Software's iconic brands such as Wolfenstein®,
  **DOOM®**, QUAKE® and RAGE®" (<https://www.idsoftware.com/en>). ZeniMax Media's trademark list names
  `DOOM`, `DOOM Stylized`, `DOOM II`, `DOOM 3`, `DOOM Eternal` and others
  (<https://assets.ctfassets.net/rporu91m20dc/7yAfa9otgVTFoJFvcyigmj/34b086699b7ac719f6a1e917540fa493/Zenimax_Trademarks_-_Effective_January_2024.pdf>).
  The USPTO registration for `DOOM` (no. 2,050,083, first use 1993-12-10) is owned by id Software/ZeniMax.
- **The Doom source-code release covers the engine, not the data.** id's release says: "The DOOM source code is
  released for your non-profit use. **You still need real DOOM data to work with this code.**" The repository
  now adds "Copyright (c) ZeniMax Media Inc. Licensed under the GNU General Public License 2.0." — the GPL is
  for the source, not for the WADs' art, sounds, music or level names
  (<https://github.com/id-Software/DOOM>).
- **The DRL credits say the audio is id's.** "Original MIDI tracks and sound effects are of course by Id
  Software." That is the game's own statement, not our guess.
- **The author treats the IP as an unresolved dependency.** The README's first line is "DRL a.k.a. **\"That
  Trademark\"**, the Roguelike". The announcement of the commercial successor says Jupiter Hell is "Still
  random, still turn-based, still grid-based but with a modern coat of paint and **lacking a certain IP :P**"
  (<https://drl.chaosforge.org/articles/39/jupiter-hell-spiritual-successor-to-drl-is-now-on-steam-early-access>).
  Renaming DoomRL to DRL and moving the commercial successor to the Jupiter Hell universe is consistent with
  an author who knows the Doom IP is not licensed.

### Does DRL's own licence cover it?

No.

- The GPL-2.0 and CC BY-SA 4.0 grants are from Kornel Kisielewicz, Derek Yu and Łukasz Śliwiński. They can
  license their own code and drawings; they cannot license id's characters, sounds, music, level names or
  trademarks.
- The credits distinguish three different permissions: id's original MIDI and sounds ("by Id Software"),
  Sonic Clang's remixes ("used with permission"), and Per Kristian Risvik's recreations ("used with
  permission"). "Used with permission" is a permission granted to ChaosForge for DRL; it is not a free
  licence, and it does not travel to a third-party port.
- The CC BY-SA 4.0 file covers "all art" in `bin/data/drl/graphics`, but it does not mention Doom, id or the
  characters. A licence cannot grant more than the licensor owns.
- The release's own manual repeats the non-free disclaimer (below), which contradicts the GPL and shows the
  project did not intend a clean free-software grant for the whole package.

## The decisive non-free terms

### 1. The ten Simon Volpert tracks are CC BY-NC-SA

The high-quality package's ID3 tags say so themselves. `ffprobe` on all ten tracks:

```
dark_secrets.mp3       comment=Creative Commons BY-NC-SA; track version 1
                       copyright=Creative Commons BY-NC-SA
d_the_roguelike.mp3    comment=Creative Commons BY-NC-SA; track version 2
                       copyright=Creative Commons BY-NC-SA
final_showdown.mp3     comment=Creative Commons BY-NC-SA; track version 3
                       copyright=Creative Commons BY-NC-SA
hells_weapons.mp3      comment=Creative Commons BY-NC-SA; track version 1
                       copyright=Creative Commons BY-NC-SA
of_skull_and_bone.mp3  comment=Creative Commons BY-NC-SA; track version 1
                       copyright=Creative Commons BY-NC-SA
rage.mp3               comment=Creative Commons BY-NC-SA; track version 1
                       copyright=Creative Commons BY-NC-SA
something_wicked.mp3   comment=Creative Commons BY-NC-SA; track version 1
                       copyright=Creative Commons BY-NC-SA
the_brick_song.mp3     comment=Creative Commons BY-NC-SA; track version 1
                       copyright=Creative Commons BY-NC-SA
too_hot_down_here.mp3  comment=Creative Commons BY-NC-SA; track version 1
                       copyright=Creative Commons BY-NC-SA
unholy_cathedral.mp3   comment=Creative Commons BY-NC-SA; track version 2
                       copyright=Creative Commons BY-NC-SA
```

Their album tag is `Doom the Roguelike: The Album`, artist `Simon Volpert`. The game's credits only say "Big
thanks to Simon Volpert for the DRL special level music tracks" — thanks, not a free licence. The low-quality
package uses MIDI versions of nine of the ten tracks (`dark_secrets.mid`, `final_showdown.mid`, ...; the
theme, `d_the_roguelike`, is HQ-only) with no licence metadata; that is not a grant either.

**NonCommercial is a blocker by the ticket's rule. This alone decides the ticket.**

### 2. The low-quality sound effects are id Software's Doom sounds

The LQ package has 90 WAV files whose names are Doom's sound lump names (`DSBFG`, `DSCACDTH`, `DSCYBDTH`,
`DSDSHTGN`, `DSPISTOL`, `DSSHOTGN`, `DSSAWFUL`, `DSOOF`, ...). They are mono 8-bit PCM, mostly 11,025 Hz
(one, `dsitmbk.wav`, is 22,050 Hz), the format of the original Doom sounds. The credits say:

> Original MIDI tracks and sound effects are of course by Id Software.

22 of the 31 MIDI files are Doom's music (the other nine are Simon Volpert's, with no licence statement).
`strings "11 - hangar.mid"` gives:

```
-(c) 1994 by <IRC:#doom:just_joe> Productions.
)MUS2MIDI v0.9 - joakim.erdfelt@swsbbs.com
)prelim DEU Music/Sound project for 'DOOM'
#DEU (c) 1993,1994 by Rapha
l Quinet
!DOOM (c) 1993,1994 by id software
```

`18 - phobos anomaly.mid`, `28 - tower of babel.mid` and most of the others carry the same string. The file
names are Doom's level names (`11 - hangar`, `18 - phobos anomaly`, `28 - tower of babel`, `38 - dis`), and
their durations match Doom's tracks. These are direct copies/format conversions of id's music, not new
compositions.

### 3. The high-quality audio is "used with permission", not freely licensed

`bin/data/drl/help/credits.hlp`:

> High quality remixes of the original D music used in the graphical version are a courtesy of Sonic Clang (
> <http://sonicclang.ringdev.com/> ) used with permission.
>
> High quality recreation of the original D sounds used in the graphical version is a courtesy of Per
> Kristian Risvik ( <http://www.perkristian.net> ) used with permission.
>
> Original MIDI tracks and sound effects are of course by Id Software.

The MP3 tags confirm the provenance:

```
cde1m1.mp3:  comment=E1M1 remade by Sonic Clang (Brian Kline)
             album=Classic Doom 3
             artist=Sonic Clang
             title=E1M1
cde1m9.mp3:  comment=E1M9 remade by Thumpmonk (Brian Gocher)
             album=Classic Doom 3
             artist=Thumpmonk
d1end.mp3:   title=Track 30
             artist=Unknown
             comment=Created by Grip
d1readme.mp3: title=Track 20
             artist=Unknown
             comment=Created by Grip
```

`cde1m1`..`cde1m9` are covers of Doom's E1M1..E1M9; `d1end` and `d1readme` are Doom's ending/readme tracks.
Sonic Clang's and Thumpmonk's permission was for DRL, and a remix is a derivative of id's composition; neither
is a free licence for a third-party port.

### 4. The "Freeware" disclaimer adds a restriction

`bin/data/drl/help/disclaim.hlp` and `manual.txt` (lines 540–543) say:

> This game is Freeware but with some limitations. Re-distribution (cd-magazines, other websites) etc. is
> allowed as long as the author is informed (admin@chaosforge.org). If you wish to include it in a printed
> magazine, I'd be happy to receive a complementary copy in return.

The same text is `install/install_license.txt`, the licence page of the Windows installer, so the condition is
presented to every installer user, not buried in a help file. That is an extra condition on redistribution
("as long as the author is informed"). GPL version 2, section 6 forbids imposing further restrictions on
recipients, and the site's rule requires every asset to be free for any use including commercial. The
disclaimer is repeated in the binary package's `manual.txt`, so it is not a stale file that only the source
tree carries.

### 5. Other unresolved assets

- **Fonts.** `bin/data/drl/fonts/font10x19.png` (320×133, 10×19 glyphs) and `fonts/default` have no licence,
  no attribution and no mention in the credits. `old/doom.png` is an older 512×512 code-page font sheet from
  the DoomRL era; its provenance is also unstated. A bitmap font is a copyrightable picture in many
  jurisdictions. We cannot call the font free.
- **The release package has no licence file.** Neither tarball contains `LICENSE`, `COPYING` or a GPL/CC
  licence file; the manual only repeats the non-free disclaimer. A redistributor of the binary release does
  not receive the GPL/CC terms with it.
- **FMOD and Steamworks binaries.** `ext/linux/libfmod.so`, `ext/windows/fmod64.dll`, `libsteam_api.so` and
  `steam_api64.dll` are proprietary binaries with no licence text in the repository. The engine can use FMOD
  or SDL audio, and a browser port would avoid them, but the source tree as distributed is not wholly free
  software.
- **The logo.** `logo.png` is a Doom-style "DRL" logo (blue/yellow metal panels, heavy bevelled letters)
  evoking id's `DOOM` logo/trade dress. Even if the drawing is original, using it as the game's mark next to
  Doom's creatures and levels increases the trademark/affiliation risk.
- **A real person as a boss.** `bin/data/drl/beings.lua` has `John Carmack` as the final boss and
  `plot.lua` says "John Carmack is dead." No publicity or personality rights are granted by the GPL/CC
  licences.

## Secondary licence problems

These are not needed for the verdict, but they would also need answers before a port:

1. **GPL-2.0-only code plus CC BY-SA 4.0 art.** Creative Commons declares CC BY-SA 4.0 compatible with
   GPLv3, not with GPLv2. The README says "GPL 2.0", the LICENSE is the GPLv2 text, and no file says "or any
   later version". The original's own code/art combination therefore has an unresolved version question. The
   site's additional permission would cover a GPL-2.0-only *port*, but not a relicensing of the art.
2. **The CC BY-SA 4.0 art is share-alike.** A port that uses or modifies the tiles must put the modified art
   under CC BY-SA 4.0 and credit Derek Yu and Łukasz Śliwiński. That is workable, but it is a condition the
   port's `LICENSE.md` would have to meet; it is not a reason to skip the attribution.
3. **The font and the legacy assets** have no provenance, as above.

## Why a 1:1 port cannot avoid this

- The reference is the released game, and its soundtrack is part of the game. A port with no music, or with
  different music, is not 1:1.
- The game's identity is Doom's: the bestiary, the weapons, the levels, the story, the skill names and the
  art. Removing or renaming all of that would produce a different game, not a port of DRL. The ticket asks for
  a 1:1 port of DRL, so that is out of scope.
- The code is the only clean part, and even the code is GPL-2.0-only and depends on the Doom-derived data for
  its meaning. Translating it without the data would be an engine, not the game.

## What would unblock it

All of the following would be needed, and none is available:

1. A written licence from id Software/ZeniMax Media for the Doom characters, names, levels, story, sounds and
   music used by DRL — or a new game that does not use them.
2. A free licence (or replacement) for Simon Volpert's ten tracks; the current terms are CC BY-NC-SA.
3. A free licence for Sonic Clang's/Thumpmonk's remixes and Per Kristian Risvik's sound recreations, extending
   the permission beyond DRL.
4. A licence or replacement for the bitmap font.
5. Removal of the "Freeware ... as long as the author is informed" restriction.
6. A resolution of the GPL-2.0-only/CC BY-SA 4.0 version question.

Until then the game cannot be shipped, and the correct action is to stop before any code or asset is copied.

## Sources

- Source repository: <https://github.com/chaosforgeorg/drl> (tag `0_10_0e`, commit
  `13f010c87e0ac4c585d43e8ca48fea881acbd472`).
- README: <https://github.com/chaosforgeorg/drl/blob/0_10_0e/README.md>.
- Code licence: <https://github.com/chaosforgeorg/drl/blob/0_10_0e/LICENSE>.
- Art licence: <https://github.com/chaosforgeorg/drl/blob/0_10_0e/bin/data/drl/graphics/LICENSE>.
- Credits: <https://github.com/chaosforgeorg/drl/blob/0_10_0e/bin/data/drl/help/credits.hlp>.
- Disclaimer: <https://github.com/chaosforgeorg/drl/blob/0_10_0e/bin/data/drl/help/disclaim.hlp> and
  <https://github.com/chaosforgeorg/drl/blob/0_10_0e/install/install_license.txt>.
- Manual: <https://github.com/chaosforgeorg/drl/blob/0_10_0e/bin/manual.txt>.
- Story: <https://github.com/chaosforgeorg/drl/blob/0_10_0e/bin/data/drl/plot.lua>.
- Intro: <https://github.com/chaosforgeorg/drl/blob/0_10_0e/bin/data/drl/help/intro.hlp>.
- Monster table: <https://github.com/chaosforgeorg/drl/blob/0_10_0e/bin/data/drl/beings.lua>.
- Item tables: <https://github.com/chaosforgeorg/drl/blob/0_10_0e/bin/data/drl/items/items.lua> and
  <https://github.com/chaosforgeorg/drl/blob/0_10_0e/bin/data/drl/items/eitems.lua>.
- Level table: <https://github.com/chaosforgeorg/drl/blob/0_10_0e/bin/data/drl/levels/boss.lua> and the
  other files in `bin/data/drl/levels/`.
- Downloads: <https://drl.chaosforge.org/downloads>.
- The release packages: <https://drl.chaosforge.org/file_download/49/drl-linux-0100.tar.gz> and
  <https://drl.chaosforge.org/file_download/48/drl-linux-0100-lq.tar.gz>.
- id's brands: <https://www.idsoftware.com/en>.
- ZeniMax trademark list:
  <https://assets.ctfassets.net/rporu91m20dc/7yAfa9otgVTFoJFvcyigmj/34b086699b7ac719f6a1e917540fa493/Zenimax_Trademarks_-_Effective_January_2024.pdf>.
- Doom source release (engine only, not the data): <https://github.com/id-Software/DOOM>.
- Creative Commons BY-SA 4.0: <https://creativecommons.org/licenses/by-sa/4.0/legalcode>.
- Creative Commons compatibility:
  <https://creativecommons.org/share-your-work/licensing-considerations/compatible-licenses/>.
- GNU GPL version 2: <https://www.gnu.org/licenses/old-licenses/gpl-2.0.html>.
- GNU GPL version 3: <https://www.gnu.org/licenses/gpl-3.0.html>.
