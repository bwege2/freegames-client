# HyperRogue

A port of **HyperRogue 13.1o** (Zeno Rogue, C++, GPL-2.0-or-later) to TypeScript, translated line by line.
`PORTING.md` has the conventions and the package plan, `MODULES.md` which C++ file became which module, and
`re/hyperrogue/NOTES.md` how the port is checked against the original (a headless build of the original as an
oracle).

## State

**Stage 1 (done): the game's rules in the standard geometry.** The {7,3} hyperbolic tiling the game starts in,
every land of the normal game and its generation (land unlocking, big structures, barriers, the complex lands,
Eclectic City's wave function collapse), monsters and their moves, attacks, the player's moves, all items and
orbs, Yendor, tactics and Orb Strategy, hardcore, the score file and saving/loading a game. 27 oracle scenarios
(every land of the normal game, the orbs, the modes, deaths, save and load) match the original's state turn by
turn: the cells around the player (land, wall, monster, item, direction, hit points, stun, land parameter,
flags), items, kills, turn count and messages.

The browser start (`src/index.ts`, package U3) runs the desktop original's start (`hyper_main`: initAll, the
start menu, then the map) and its main loop, one `mainloopiter` per animation frame; keys, mouse and wheel are
the original's (control.cpp). The start menu, the main menu's menus, the world overview, the special modes, help
(F1, right click, the land/monster/item help), the message log, the local high scores, the inventory of the Orb
Strategy mode and the cheat menu are the original's (package U2); the settings screens are package U4's, and
the screens of stage-3 features (other geometries, the editors, shmup, racing, the tour) do nothing visible yet.

**Stage 2 (done, `PORTING-STAGE2.md`): graphics and interface.** The game is playable on the website. The
projection models of the 2D game, the shapes and floor shapes, the drawing of cells, walls, monsters, items and the
player, animations, HUD and messages, menus, help, the settings screens, keyboard and mouse; the score file, the
saved game and the configuration in the player's account storage; the original's fonts. 17 drawing and screen
scenarios compare the port's picture with the original's own SVG screenshots (made headless) element by element,
with exact font metrics: the start view, several lands, monsters, the window with HUD and messages, the menus,
help, scores and settings screens; the configuration file is checked the same way.

**Stage 3: the rest** — the other geometries (Euclidean, spherical, Archimedean, Goldberg, irregular, binary
tilings, 3D and nonisotropic spaces, quotients), local multiplayer (the turn-based mode is done, see below) and
shmup, the map editor, the translations.

*Music and sounds (stage 3, done):* sound.cpp is ported (`src/sound.ts`), with the parts of SDL_mixer it uses on
the website's Web Audio context (`src/sdlmixer.ts`). The original's 17 music tracks (`assets/music/`, 59.6 MB)
and 84 sound effects (`assets/sounds/`, 2.2 MB, with `credits.txt`) are shipped unchanged and are loaded only when
a land or a sound first needs them (`lazyAssets`: Play does not wait for them). The music of each land comes from
the original's `hyperrogue-music.txt`, read as the original reads it (`*/` paths, `LAST`, `L=`, comments; its
license text is added to the help screen as in the original); handlemusic fades between the lands' tracks with the
original's timing (2 s to a new track, 0.5 s back to a track already started, from where it stopped; 3 s on
resetmusic), "music_reset", the out-of-focus silence and "play music when out of focus"; playSound and
playSeenSound play the original's sounds at effvolume × vol / 100 (SDL_mixer's 0-128, linear) on 16 channels;
the music and sound volume settings act at once. `test/sound.test.ts` checks the music list, the land → track
mapping and the fade and volume arithmetic with a fake audio context.

*Translations (stage 3, done):* language.cpp is ported completely (`src/language.ts`): XLAT in all nine
languages (English, Polish, Turkish, Czech, Russian, German, Brazilian Portuguese, French, Chinese) with each
language's grammar (genderrep's gender codes with choose2/3/4, the cases of parrep, the player's gender, French
elision and proper/plural nouns, German articles, Portuguese contractions, Chinese measure words, the English
"the"/plural flags), XLAT1, XLATN, XLAT1_to/XLAT1_acc (the Chinese glyphs of "Chinese ASCII"), the hash-table
lookup with the original's `hashval`. The data is made as the original's build makes it
(`re/hyperrogue/tools/gen-language.sh`: langen.cpp writes language-data.cpp, a script turns it into
`src/language-data.ts`, 16 KB, always loaded, and `src/lang/<code>.ts`, one module per language, 50-290 KB, 540
KB gzipped in all, loaded when the language is first used). The language menu with each language's completeness,
`-lang` and the `language` setting, the translators' credits line, Noto Sans for Chinese (set_cfont;
`assets/fonts/NotoSans-Regular.ttf`, loaded only when needed) are the original's. Text widths stay exact: the
metrics tables have the translations' characters (Cyrillic, the diacritics; Noto Sans with 2088 characters
including the Chinese ones, its kerning and ligatures). Oracle scenarios: `lang-xlat-*` (every sentence with a
%-code, with nouns of every gender, in each language, and every noun's forms), `lang-screens-*` (HUD, game menu,
settings, language menu, help in seven languages), `lang-game-*` (games started with `-lang`).

**Stage 3, local multiplayer (turn-based)**: the original's 2-7 players at one keyboard, with their keys, menus
and drawing (`src/multi.ts`); 7 oracle scenarios with 2, 3 and 4 players match the original every turn.
Split screen and shmup (the real-time mode) are not ported yet.

**Stage 3, online play (a deviation: the original has only local multiplayer)**: 2-7 players, each in their own
browser, play the turn-based multiplayer mode together (`ONLINE.md`). "online multiplayer" in the start menu (N)
or in the multiplayer menu (special modes) chooses the starting land (Icy Land, Crossroads, Desert, Living Cave,
Jungle, Alchemist Lab), hardcore, the Orb Strategy mode and a time limit per turn, then opens the website's lobby;
seat n plays player n (the original's colours and characters). Every browser runs the same game from the round's
seed in deterministic lockstep: each player chooses a move with the single-player controls (keys, numpad, vi keys,
mouse, a ranged Orb aimed with the mouse or T), the move goes to everyone, and when all players have chosen, every
browser plays the round as the original's multiplayer mode plays it at one keyboard (`multi_alldecided`: the crash
check, all players' moves, the monsters). A line at the top says the round and whom it waits for. The server
(`server/.../games/hyperrogue/HyperrogueModule.java`) passes on one decision per seat and round, decides "wait" for
a seat that runs out of time, tells everyone when a seat leaves, sends a reloaded page every decision so far (it
replays the game and plays on), compares the hashes of the browsers' games every 8 rounds (a difference stops the
round) and ends the round when every browser reports the same end (the players' treasures, kills and deaths, and
the gold). `test/online.test.ts` runs two to four browsers as worker threads with a stand-in for the server and
checks that their games stay equal round by round (one drawing frames, one after a single-player game, a player
leaving, a page coming back, a changed game caught by the hashes); the server's tests and the site's end-to-end
test (two and three browsers through the real lobby and server, a reload in the middle) check the rest.

**Stage 3, the other geometries (package G1 done; plan in `PORTING-GEOMETRIES.md`)**: the Euclidean hex and
square grids with their quotients (tori, Klein bottles, cylinders, Möbius bands), the spherical and elliptic
tilings, the other regular hyperbolic tilings ({8,3}, {5,4}, {6,4}, ...), the hyperbolic quotient spaces (Zebra,
Klein quartic, Bolza, Macbeath, Bring, field quotients, ...), each pure or bitruncated, and the geometry experiments
menu that chooses them (`-geo`, `-7`, `-t2` on the command line). 13 game scenarios, 6 drawing scenarios and a menu
scenario match the original exactly. Goldberg and the other variations, irregular, Archimedean, binary and aperiodic
tilings, tessellation files and all 3D geometries are the next packages.

## Deviations so far

* Geometry experiments (stage 3): the menus list every geometry and variation of the original, but those of
  packages not ported yet (see `PORTING-GEOMETRIES.md`: Goldberg variations, irregular, Archimedean, binary and
  aperiodic tilings, crystals, tessellation files, fake curvature, 3D and nonisotropic spaces, the hypersian rug,
  the fundamental-domain view, the canvas patterns) answer "not available in this version yet" and keep the current
  game.

* Code that belongs to later stages is reached through stub modules marked `// STAGE1-STUB` or throwing
  NotPorted; the standard game's rules never reach them.
* Music and sounds (stage 3): the browser loads files asynchronously where SDL_mixer loads them at once: a
  land's track starts (with its fade-in) when the browser can play it, and a sound that is played for the first
  time starts when it is decoded (a fraction of a second later). Music streams through an `<audio>` element (as
  SDL_mixer streams it), the sounds are decoded whole; fades are linear ramps on the AudioContext's clock where
  SDL_mixer steps them once per audio buffer (46 ms). A browser that cannot play Ogg Vorbis (older Safari) or
  refuses to start an `<audio>` element stays silent instead of failing. The original's "freeing music" memory
  messages go to the console. Like the original, the music fades out when the mouse leaves the game's area
  (`outoffocus`, unless "play music when out of focus" is on); a hidden tab is not out of focus (the browser
  stops the frames there, so the music goes on).
* Files the original reads and writes (score file, saved game, configuration) go to an in-memory file system
  (`src/cfile.ts`) in the original's formats, read from and written back to account storage.
* Online play is an addition of the port (the original has only local multiplayer at one computer). Its
  differences to the original's local multiplayer mode: each player plays with the single-player controls
  (the original's per-player key sets are for one keyboard); a room may set a time limit per turn (30, 60 or
  120 s; the original waits for every player), after which the player waits that turn; a player whose page
  leaves the room leaves the game (as the original's "leave the game" key, and is not revived); the game starts
  in the standard mode with the room's options (no saved game, no cheats, the blade as the weapon, as the
  original's multiplayer menu sets it), and a restart or a mode change from a menu leaves the online game. The
  cheat menu and anything else that changes one browser's game alone make the games differ, and the hashes stop
  the round. Marking a mine (M) is off online.
  The online game is not recorded in a shared score table (the original keeps none for multiplayer).
* Online mode: drawing changes no game state there, which differs from the original
  in three places: drawing uses random generators of its own (the original draws its particles with the game's
  glibc `rand()`, which also names Camelot's knights), cells outside the players' range are drawn with the tide or
  lava of their last turn in range (the original applies the tides to every drawn cell), and mirror images are
  drawn only once the rules have built the Mirror Land around them. Local games are unchanged.
* Pointer-ordered containers order by creation instead of by address; this only reorders the two monster names
  in one end-screen message ("pinched by ...").
* `Math.*` may differ from glibc in the last bit; no game decision of the standard geometry depends on it in
  the scenarios (NOTES lists where it could).
* Crossbow mode and mouse targeting of ranged orbs are ported but not covered by the oracle yet.
* Drawing (stage 2): the browser draws the original's software-renderer path (OpenGL off) on a canvas
  (`src/sdlgfx.ts` stands in for SDL_gfx): the same int-pixel polygons and colours, but the canvas antialiases
  fills and lines (SDL_gfx draws aliased scanline spans) and has no anaglyph / side-by-side modes yet.
* Text (stage 2): the layout measures text exactly as the original's SDL_ttf does (`src/fontmetrics.ts`, a metrics
  table of DejaVuSans-Bold.ttf from the original's libraries), but the browser rasterizes the glyphs (canvas
  `fillText` with the same TTF at the same place and size, kerning and ligatures off as in the original): the
  pixels differ slightly from FreeType's hinted rendering. The other fonts of the configuration (DejaVu Sans, CMU
  Sans Serif, OpenDyslexic3) are drawn with their own face but measured with DejaVu Sans Bold's metrics; Noto Sans
  (the Chinese font, stage 3) has its own exact table (`src/fontmetrics-noto.ts`, with the kerning and ligatures
  HarfBuzz applies to it). Characters a font's table lacks are measured as the missing-glyph box (no text of the
  game has one: the tables have every character of the English texts and of the translations). The texts the original ORs into the window in red and
  cyan (`displaystr` with a shift: the inventory screen of the Orb Strategy mode, without OpenGL) are drawn with the
  canvas's additive blending.
* Translations (stage 3): a language's data arrives asynchronously (one module per language, 50-290 KB; Noto
  Sans and its metrics for Chinese, 17 MB and 190 KB gzipped). The configured language (and for Chinese the font)
  is loaded before the start; a language chosen later shows English text for the moment until its data has
  arrived (a fraction of a second), and the language menu shows a language's name as "EN" until then. Texts built
  in that moment (a message) stay English. Until Noto Sans has arrived, Chinese text is drawn with the browser's
  sans-serif. Turkish: the original 13.1o crashes (a segmentation fault in language.cpp `parrep`, which reads the
  noun table even when a parameter is no noun, e.g. a number) at the first drawing of the HUD in Turkish; the port
  uses the parameter as it is there, as the other languages do (NOTES.md). The table lookup by hash finds, as in the
  original, an entry whose hash equals that of a text that is not in the table; where that entry has no
  translation in the language, the original shows the entry's English key and the port the text itself (only on
  such a hash collision).
* The colour cycle of a Friendly Ghost starts from the cell's creation serial instead of its address
  (colors.cpp `fghostcolor`); so does the up-and-down bobbing of flying monsters (graph-monster.cpp `VBIRD`:
  eagles, bats, butterflies, ... with spatial monsters on). In the original both depend on where the allocator
  put the cell, so they differ between runs there too.
* The window (stage 2): the game's window is the page's area below the site's bar, in device pixels; it follows
  the page's size (the original's resize handling runs on every change). The window size and full screen
  settings have no effect (full screen is the site's button), and the software renderer is always used (OpenGL
  off).
* Files (stage 2): the score file with the saved game (`hyperrogue.log`) and the configuration
  (`hyperrogue.ini`) are the player's files in the website's account storage, in the original's formats. The
  storage holds 512 KiB per file: when the score file grows beyond that, the oldest entries are dropped when it
  is stored (never the last one, which holds the saved game); a game adds about 1-2 KB. Leaving the game (the
  site's Back) is the original's quit: the game is recorded, or saved with an Orb of Safety. Closing the tab
  instead loses what was not stored yet.
* Keys (stage 2): SDL2 keycodes come from the browser's keys (letters as the layout types them, digits and
  punctuation by position, the numpad as numpad keys whatever NumLock says, as SDL2 does). F11 and F12 stay the
  browser's; the browser keeps Ctrl+W, Ctrl+T and Ctrl+N (no HyperRogue command uses them). The waiting for
  events when a frame is early (`SDL_WaitEventTimeout`) becomes a poll: the browser cannot wait.
* The mouse leaving the canvas is the original's "mouse left the window" (`outoffocus`): the map is not redrawn
  until it comes back, as in the original.
* Settings (stage 2, package U4): every settings screen of the 2D game is the original's (config.cpp, models.cpp's
  menus), and "save the current config" writes `hyperrogue.ini` in the original's format (`name=value`, the
  values that differ from the defaults, sorted by name). Differences:
  * Parameters of features that are not ported yet are not known to the port (line patterns, rulers, apeirogons,
    hats, Euclidean and 3D embeddings, the rug's own settings, crystals, textures, irregular tilings, Solv/Nil/
    product settings, Archimedean symbols, animations, the canvas colourings, the tour, the sky, screenshots,
    the history mode): a `hyperrogue.ini` from the desktop game
    loads, but such lines are skipped with the original's "unknown config variable" warning and are not written
    back. "find a setting" lists fewer settings for the same reason.
  * Shown, but without effect in the browser: the window and full screen settings, vsync, the font files of the
    TTF/OTF font options (the browser cannot open a font file), the
    joystick settings, "resizable window". "openGL mode" is hidden, as the original hides it when only one
    renderer exists (the port draws with the software renderer); "apply changes" may show in the screen settings
    for that reason and does nothing harmful.
  * The model list leaves out the projections the port does not draw yet (polygonal, polynomial, formula,
    spiral, the Lie and relativistic models). "3D configuration", "history mode", "hypersian rug mode", the
    variations and geometry menus, the old style joystick configuration (no joysticks in the browser), and
    "toggle full 3D graphics" are stage 3: their screens close at once or the
    item does nothing. The map font scale dialog has no radar preview.
