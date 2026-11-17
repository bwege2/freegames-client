# Fish Fillets - Next Generation (port)

Fish Fillets - Next Generation 1.0.1 (2010), the free remake of ALTAR interactive's Fish Fillets (1998), ported
from its C++ source (`re/fishfillets/fetch.sh` downloads it): the engine's level logic, scripting interface, menus
and effects in TypeScript (`src/engine/`), the original data as it is (`assets/`). The levels are Lua 5.0 scripts;
they run in a Lua 5.0 interpreter written for the port (`src/lua/`: the language, base, string with its patterns,
table and math libraries, numbers as doubles printed with `%.14g`, `math.random` on glibc's `rand()`).

One game cycle every 100 ms as in the original's TimerAgent (25 ms with Shift held): draw, count, read the input,
move the subtitles, update. A move is 15 pixels, split into the phases the fish's animation asks for.

## Controls

* **Arrow keys**: move the active fish; a fish that looks the other way turns first.
* **Space**: switch to the other fish.
* **I J K L**: move the small fish, **W A S D**: move the big fish, whichever is active.
* **Left mouse button**: on the map, start the level under the pointer, or the corner pictures (intro, exit, credits,
  options). In a level, select the fish under the pointer; held, the active fish swims to the pointer the shortest
  way. **Right mouse button** (held): the active fish moves straight towards the pointer. On a touch screen, a touch
  is the left button.
* **Minus** (held): undo, **Plus** or **=** (held): redo. **Backspace**: restart the level.
* **F2**: save the level, **F3**: load it. **F5**: show the step counter. **F6**: subtitles on/off.
  **F1**: help. **F10**: options (sound and music volume, language, language of the speech, subtitles).
* **Tab** / **Enter** on the map: select the next open level / start it.
* **Escape**: leave the level, a menu or the intro; on the map, leave the game.
* A solved level asks first (the pedometer): play it again, replay your solution, or cancel.

## Deviations the browser forces

* **Files**: what the original wrote to `~/.fillets-ng/` is in the player's storage on the server: `options.lua`
  as there; the solved levels (`solved/<level>.lua`) together in `solved.pack` and the saves (`saves/<level>.lua`)
  together in `saves.pack`, because the storage holds at most 64 files per game. Inside, each file keeps the
  original's format (`saved_moves = '...'`, `saved_models = ...`).
* **Leaving**: Exit on the map, or Escape there, goes back to the website.
* **Intro**: the intro film `images/menu/intro.mpg` is MPEG-1, which browsers do not play. The original built
  without smpeg shows the slide `script/share/demo_intro.lua` instead; the port does that.
* **Text**: the subtitles, level names, menus and the step counter use the original's TrueType fonts with the
  original's black outline, but the browser draws the glyphs (not FreeType through SDL_ttf), so the letters differ
  by a pixel here and there.
* **Sound**: sounds, voices and music are decoded by the browser (Ogg Vorbis; a browser without Ogg Vorbis stays
  silent) and load while the game runs: a voice that is not loaded yet starts late, and until it has played its
  dialogue counts as talking, as a playing channel did. 16 channels as SDL_mixer had; the music loops between the
  points of its `.ogg.meta` file as SDLMusicLooper did.
* **Pictures**: they load when first needed; a level does not start its cycles until its pictures are there.
* **Screen**: the original changed the window to the size of each room (15 pixels a field) or menu picture; the port
  does the same with its canvas and scales it to the browser window by whole numbers.
* **Language**: the default comes from the browser's language, as the original took it from the locale.
* **Keys the browser keeps**: F11 is the browser's full screen (the original toggled its own). The debug console
  (the backquote key), the log level keys (Right Alt with keypad plus/minus) and the command line options
  (`strict_rules`, `replay_level`, `worldmap`, ...) are not there.
* **Lua**: `pairs()` visits a table's array part and then its other keys in the order they were set; Lua 5.0 visits
  the other keys in the order of its hash table. Scripts that walk a table with `pairs()` and draw random numbers on
  the way (animations, idle jokes) can draw them for the objects in another order; the rules of the fish do not
  depend on it. Error messages of `error()` have no position prefix.
* **Order of equal pointers**: MarkMask::unique() sorts the objects touching a model by their address in memory;
  the port sorts them by creation order. The rules only ask whether any or all of them do something, so the result
  is the same.

Not ported: the debug console, fribidi (no right-to-left language in the data).
