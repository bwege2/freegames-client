# Shattered Pixel Dungeon

A port of **Shattered Pixel Dungeon 4.0.2** (Evan Debenham, based on Watabou's Pixel Dungeon; Java on libGDX,
GPL-3.0-or-later) to TypeScript. The game's Java source (and the parts of libGDX it runs on: fonts, the glyph
packer) is translated by j2ts (`re/shatteredpixeldungeon/tools/translate.sh`, into `src/gen`), on a Java runtime
written for the port (`src/jre`) and libGDX's backends written for it (`src/gdx`: headless for the tests,
`src/gdx/web` for the browser). `re/shatteredpixeldungeon/NOTES.md` has the reference version, the oracle (the
original, built from its source, run headless) and how the port is checked against it.

## Playing

The game is the original's desktop version in the player's area of the page: the title screen, the six heroes,
the 26 floors, all items, talents, challenges, seeded runs, rankings, badges, the journal, the settings (with
key bindings) and the original's texts in its 23 languages, music and sounds.

Controls (the desktop version's default key bindings, `SPDAction`; all can be changed in the settings):

| Input | Action |
| --- | --- |
| Click or tap a cell | walk there, attack, open, pick up; tap the hero to search or wait |
| W A S D, arrow keys, number pad | move one cell (the number pad also diagonally) |
| Space, Numpad 5 | wait or pick up |
| I or F | inventory |
| 1–6 | quick slots |
| F1–F4 (F5) | the bags of the inventory (F5 is the browser's: see below) |
| E | examine |
| Z | rest |
| Q / Tab | attack the target / cycle targets |
| X | the action button |
| C or Enter | pick up or loot |
| R | resume what was interrupted |
| H, J | hero info, journal |
| mouse wheel, + (=) and - | zoom |
| Esc or Backspace | back: close a window, open the game menu |

## Deviations the browser forces

- **Files.** The desktop game writes its folder (`~/.local/share/.shatteredpixel/shattered-pixel-dungeon/`):
  `settings.xml`, `game1/game.dat`, `game1/depth3.dat`, ..., `rankings.dat`, `badges.dat`, `journal.dat`,
  `bones.dat`, `keybinds.dat`. Here they are the player's files in the site's storage, with the original's
  contents byte for byte (FileUtils' gzip'd JSON bundles; the settings as the LWJGL3 backend writes
  Preferences, Java's Properties XML). The site keeps 64 files of names `[A-Za-z0-9._-]` per player, and a game
  in progress is one file per floor, so a file of the top folder is stored as `f.<name>` (other characters
  as `_xx`, their hex code: `f.rankings.dat`, `f.settings.xml`) and a folder (one game slot, `game1/`) as one
  zip archive of its files, `d.game1.zip` (stored, not compressed again; unzip gives the original's files).
  The game saves when it pauses, as on the desktop; the files are written to the server shortly after they
  change and when the page is hidden or left. Before you are signed in or have saved anything the site makes
  no connection.
- **The window.** The window is the player's area of the page and follows its size; there is no minimum size
  (the desktop window is at least 720x400) and the window size and "maximized" settings of the desktop
  version are not used. The window's size is in device pixels (as a desktop window on Windows and Linux),
  so the game picks its zoom for the screen's real pixels; the display's density is 96 dpi times the
  browser's device pixel ratio (CSS's inch), from which the game derives its default zoom as on a desktop.
- **Full screen.** The desktop version goes full screen when it starts (its "Fullscreen" setting is on by
  default); in the page it starts in the player's area, which keeps the site's bar and the Back button in
  view, and the setting (or the site's "Full screen" button) puts the game's area in the browser's full screen.
  Leaving it with the browser's own means (holding Esc) turns the setting off, as the settings window then shows.
- **Keys the browser keeps**: F5 (reload; it is the original's default key for the fifth bag: rebind it in the
  settings if you use it), F11 and F12; Ctrl+W, Ctrl+T, Ctrl+N. The Windows/Super keys are `SYM`, as the
  LWJGL3 backend reports them.
- **The clipboard.** A page may read the system clipboard only with the player's permission and not at once,
  so the paste button of the seed and note windows pastes what was last copied or pasted in the page (or
  paste with Ctrl+V into the text field); copy writes the system clipboard.
- **Text fields** (the custom seed, notes, the name of a game) are the browser's own text field over the
  game's frame, in the game's font, where libGDX's TextField would be drawn. Phone keyboards and input methods
  work in it.
- **Font rendering.** The glyphs are FreeType's in size and place (the port reads the fonts' metrics as
  FreeType does), and their pixels are drawn by the browser's canvas from the same font files; antialiased
  edges of the system font (Droid Sans, for Chinese, Japanese and Korean) can differ by a shade from FreeType's.
- **The actor thread.** The original runs the game's turns on a thread of their own next to the render thread;
  the port runs them as a step function on the render thread, at the points where the original woke the
  thread (NOTES.md, "Changes for the oracle and the port"). The order and results of turns are the original's;
  a turn that waits for an animation can go on one frame later or earlier than in a real run (as the
  original's thread timing varies).
- **Loading a floor** (InterlevelScene) happens on the render thread when the scene starts instead of on a
  thread of its own, so the first frame of the fade waits for it (about 0.1 s).
- **News and updates.** The desktop release reads the developer's news feed and checks GitHub for updates;
  the port loads nothing from other sites, so the title screen has no news and no update notice (the
  original's build without those services behaves the same). Links (the about screen, the supporter page,
  the translation and feedback links) open in a new tab.
- **Texts of other languages** load when the language is chosen (the game shows English for the moment until
  they have arrived, then redraws the screen); the music is streamed when a track starts.
- **Controllers**: none (the browser port does not map the Gamepad API to libGDX's controllers).
- **Leaving.** The title screen's exit button (and a new player's Esc on the hero selection, which quits the
  desktop game) goes back to the game's page. When the page is hidden the game
  pauses, and saves, as the desktop game does when its window is minimized.
- **A crash** shows a message in the game's area instead of the original's crash dialog; the error is in the
  browser's console.
- **Identity hashes.** Every object's identity hash is 1 (as the oracle's `-XX:hashCode=2`), so a seed gives the
  levels the tests check against the original; the number in an object's default `toString` ("[I@…") is a
  per-object number instead, so that strings the game uses as keys (the gradients' texture cache) stay distinct
  as on a JVM.
- **The platform** is reported as desktop Linux (libGDX's `SharedLibraryLoader.os`): the port behaves as the
  desktop version.

There is no multiplayer, as in the original.

## Checks

`test/levels.test.ts` compares the levels the port generates with the oracle's (26 floors of several seeds and
every hero); NOTES.md lists the other tests. `e2e.mjs` plays the built site in headless Chromium (title screen,
a new game, moving with keys and taps, a save that survives a reload); `screenshots.mjs` takes the game page's
screenshots.
