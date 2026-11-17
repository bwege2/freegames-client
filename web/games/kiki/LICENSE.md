# kiki the nano bot: license and credits

**Game (C++ and Python code), levels, 3D models, font, colour schemes, texts, translations, icon**: kiki the nano
bot 1.0.2 (2006), by Thorsten Kohnhorst ("monsterkodi", monsterkodi@users.sourceforge.net) and contributors,
**released into the public domain**. The source package (`kiki-1.0.2-src.tgz`, SourceForge project "kiki", whose
declared license is "Public Domain") has no license file of its own; the author confirmed the status to Debian
(debian/copyright of the package `kiki-the-nano-bot`, mail of 13 May 2008: "yes, Kiki the nano bot is in the Public
Domain."). Debian ships the game, its levels and data in `main` on that basis.

What the port uses, and under which terms:

| Asset group | From | Author | License |
| --- | --- | --- | --- |
| Game logic (C++: `src/base`, `src/world`, `src/items`, `src/bots`, `src/gui`; kodilib) | translated to TypeScript (`src/engine/`) | Thorsten Kohnhorst | public domain |
| Menus, world builder, highscore and setup (Python: `py/*.py`) | translated to TypeScript (`src/pyworld.ts`) | Thorsten Kohnhorst | public domain |
| Levels (`py/levels/*.py`, 50 levels) | translated statement by statement (`src/data/levels.gen.ts`, by `re/kiki/tools/levels.py`) | Thorsten Kohnhorst; Michael Abel (blocks, borg, circuit, conductor, cube, edge, entropy, flower, gamma, machine, maze, mesh, mini, neutron, nice, plate, pool, random, sandbox, slick, throw, walls), Niko Boehm (captured), Ben Griffin (towers) | public domain (contributed to and published in the public-domain package; credited in the game's About menu) |
| Par moves (`py/kiki.hsc`) | `src/data/hsc.gen.ts` | Thorsten Kohnhorst, Michael Abel | public domain |
| 3D models (`src/bots/body.h`, `tire.h`, `src/items/gear.h`, `valve.h`, `generator.h`, `motor.h`, `cylinder.h`, `kolben.h`, `wire.h`) | converted losslessly (`src/data/models.gen.ts`, by `re/kiki/tools/models.py`) | Thorsten Kohnhorst | public domain |
| Font (the vector glyphs of `src/gui/KikiCharacter.cpp`) | converted losslessly (`src/data/models.gen.ts`) | Thorsten Kohnhorst | public domain |
| Colour schemes (`py/colors.py`) | `src/data/schemes.gen.ts` | Thorsten Kohnhorst, Michael Abel | public domain |
| Texts and translations (`py/lang/*.py`) | `src/data/lang.gen.ts` | Thorsten Kohnhorst; Arthur Langereis (Dutch), 3ARRANO.com (Euskara), F.C.Covett (Portuguese), jay traveller (Spanish), Ivan aka Fenris (Swedish) | public domain (part of the package) |
| Textures | none: the one texture (the glow of lights, wires and fumes) is computed by the code (`KikiWorld::initializeTextures`) | Thorsten Kohnhorst | public domain |
| Music | none: 1.0.2's source package has no music (the code looks for a `title_song.mp3` the package does not contain) | | |
| **Sound effects** (`assets/sound/*.wav`) | **replaced**, see below | the freegames project | **CC0 1.0** |

## Replaced: the sound effects

The original's 28 sound effects (`sound/*.wav`) are not the author's work: the package's `Thanks.txt` says that
Carlos Camacho (the organiser of the uDevGame contest at iDevGames) "provided the sounds that are used in the game",
and the files' own metadata name an engineer "Ariko Shimafa" (Sound Forge 4.0, 2000) and GoldWave. Neither the
package nor iDevGames states a license for them, so the author's public-domain statement cannot be taken to cover
them, and their use is not shown to be free (commercial use, compatibility with GPL-3.0).

The port therefore ships **new sound effects, made for this port** by `re/kiki/tools/sounds.py` (synthesized from
oscillators, sweeps and seeded noise; no samples of the original or of anyone else are used). Author: the
freegames project. License: **CC0 1.0 Universal** (public domain dedication,
https://creativecommons.org/publicdomain/zero/1.0/). Each replacement keeps the original's file name and format
(RIFF WAVE PCM with the original's sample rate, bit depth and channel count) and about its length:

atom_digest.wav, bomb_explode.wav, bomb_splitter.wav, bot_death.wav, bot_health_alert.wav, bot_jump.wav,
bot_land.wav, bot_move.wav, bot_no_energy.wav, bullet_hit_mutant.wav, bullet_hit_object.wav,
bullet_hit_player.wav, bullet_hit_wall.wav, bullet_shot.wav, gate_close.wav, gate_open.wav, gate_warp.wav,
gear_off.wav, gear_on.wav, generator_off.wav, generator_on.wav, menu_abort.wav, menu_fade.wav, menu_item.wav,
menu_select.wav, stone_land.wav, stone_move.wav, switch_on.wav.

Which sound plays when, and how loud, is the original's (`KikiSound.cpp`). The original's sounds can be put back
under the same names should their license become known.

**This is an altered version**: a TypeScript port by the freegames project (`src/`) of kiki 1.0.2's C++ and Python
source; the port's code is under the website's license (GPL-3.0-or-later, `web/LICENSE.md`). The source of the
original: https://sourceforge.net/projects/kiki/files/ (`kiki-1.0.2-src.tgz`, which `re/kiki/fetch.sh`
downloads).

## Favicon

The favicon of the game's page (`web/icons/kiki.png`, 48x48, and `web/icons/kiki-180.png`, 180x180; drawn by
`web/scripts/icons.py`) is the game's own icon, kiki the bot (`win32-vc/kiki.ico`, 32x32, public domain), scaled
up pixel for pixel on a dark grey rounded square.
