# Frozen Bubble (port)

Frozen Bubble 2.2.0 (2008, the last release of the Perl game; `re/frozenbubble/fetch.sh`) translated to
TypeScript: the program `frozen-bubble` with its network part (`src/fb/game.ts`), its C extension `c_stuff`
with the graphical effects (`src/fb/cstuff.ts`) and the level editor `FBLE.pm` (`src/fb/fble.ts`). Under it
lies the part of SDL 1.2 the game uses, translated from SDL's C source where the pixels depend on it
(`src/sdl/`: surfaces and pixel formats, the 1.2.15 blitters with their alpha rounding, SDL_image's PNG and GIF
loading, SDL_perl 2.1.2's way of handing things to Perl, the event queue with key repeat), a model of
SDL_mixer's channels and musics, SDL_Pango's text layout (metrics measured from DejaVu Sans by Pango), Perl's
`rand` (drand48) and glibc's `random`, `sin` and `cos`, so that the numbers are the same bit for bit. The
data are the original's files, unchanged (`assets/`, made by `re/frozenbubble/tools/pack.py`).

**Checked against the original.** `test/oracle.test.ts` runs Frozen Bubble 2.2.0 itself, built from source
on SDL 1.2.15 and SDL_perl 2.1.2 with a virtual clock and scripted keys and mouse (`re/frozenbubble/oracle/`),
and the port on the same sessions, and compares them frame by frame: every screen update's pixels, every
sound and music call, every text drawn, the game's state after every frame (all bubbles, launcher, next
bubbles, malus, falling and exploding bubbles, scores, how many random numbers were drawn), and the files
written to `~/.frozen-bubble`. The sessions (`test/sessions/`) play levels 1 to 3 in a row (shots aimed by
a bot, `test/bot.ts`) and level 100 to the highscore entry, random levels with chain
reaction, the multiplayer training to its highscore, two-player games with and without chain reaction
(malus both ways), the menus with every option, the key settings and the graphics levels, the demos, pause,
and the level editor (editing, saving a levelset, playing it). A port with one rule changed (the malus
count or where a bubble sticks) fails the comparison (the mutation test). `re/frozenbubble/NOTES.md` has the
oracle's build and what was learnt.

## Controls

As in the original (the keys can be changed in the menu, **Change keys**):

* **Menus:** Up and Down (or Left and Right) choose, **Return** takes. **Escape** in a game goes back to
  the menu; in the menu it leaves Frozen Bubble (back to the website).
* **One player** (and the right-hand player of two): **Left** and **Right** turn the launcher, **Up**
  shoots, **Down** points it straight up.
* **Second player** (left): **X**, **V** turn, **C** shoots, **D** points straight up.
* **Pause** pauses (Return, Space or Escape go on). **F** full screen on and off. **F11** music on and
  off, **F12** sound on and off (where the browser leaves these keys to the page).
* In random levels, the multiplayer training and two-player games the game asks for chain reaction:
  **Y** or **N**.
* **Level editor:** the mouse places bubbles of the colour picked on the right (right button: erase),
  and clicks the levelset and level commands; the keys of the original's help (F1) work too.
* **Online game:** **Return** starts a chat line (Return sends it, Escape drops it); **F1–F4** send
  your malus to one opponent, **F10** to all (when the room's creator allowed it).

## Online play

**Start net game** (and **Start LAN game**) open the website's lobby where the original listed its
game servers and their chat room. The creator of a room chooses the original's options for the game
(chain reaction, whether a game goes on when players leave, whether players may send malus to one
opponent, the victories limit) and starts it when 2 to 5 players are ready. Then everyone plays the
original's network game: each screen shows all fields, the bubbles one player bursts go as malus to the
others (or to the one they picked), and the last one with bubbles above the line wins the game; the next
game starts when everyone is ready, until someone reaches the victories limit.

The game server's part is the server's module (`server/.../games/frozenbubble/`): the original's in-game
messages (fb_net.pm's lines: angle, shot, stick, malus, chat, …) go through it in the room as Cap'n Proto
`Data` (`protocol/games/frozenbubble.capnp`). It decides who plays (ids and nicks, the original's
GAME_CAN_START), draws each game's starting bubbles (in the original the leader's client did), relays
only lines in the original's formats with the sender's own id, tells the others when a player leaves or
drops out, counts the victories from what the clients report about each game's winner and ends the room
with them (`Results`). The host cannot end a running game early.

## Differences from the original

Where the browser or the website make it necessary:

* **Files.** `~/.frozen-bubble` is the player's account storage on our server: `rc` (settings and keys),
  `highscores`, `highscores-mptrain`, `highlevelshistory`, `levels/<name>` (the editor's levelsets) and
  `records/<name>` (saved game records) are stored under the same names (with `.` for `/`). Without a
  connection nothing is saved, as on a read-only disk.
* **Leaving.** "Quit" (Escape in the menu) goes back to the website. There is no command line: the
  options `--solo`, `--level`, `--fullscreen` and the like, and the separate `frozen-bubble-editor`
  program, are not offered (the editor is reached from the menu, as in the original).
* **Network game.** The website's lobby replaces the original's list of game servers, its chat room and
  its list of open games; "LAN game" and "net game" both open it, and the nicks are the players' names on
  the website (made valid as the original's server made them: letters, digits, `-`, `_`, at most ten
  characters; a name in use gets a number). Each game's starting bubbles come from the server (the
  original's leader drew them and sent them to the others); every client, the leader too, waits for them.
  A player whose connection drops has left the game, as in the original. The server's module counts the
  victories; the game shows them as the original does. The original's latitude and longitude (its world
  map of players) are not asked for.
* **Randomness.** The game seeds its random numbers from the browser's random source instead of the time
  of day.
* **Text.** The original draws its text with SDL_Pango in the system's sans font. The port lays it out
  with the same Pango metrics (DejaVu Sans 2.37, shipped in `assets/fonts/`) and lets the browser draw the
  letters at those positions, so a letter's pixels may differ slightly from FreeType's; the tests compare
  the text, its position and its size, not the letters' pixels.
* **Sound.** The sounds and musics are the original's files, decoded by the browser; the two-player music
  (an XM module) plays through a small XM player of its own instead of SDL_mixer's MikMod. Browsers start
  sound only after the first key or click. The tests compare every mixer call, not the audio samples.
* **Full screen** uses the browser's full screen (the F key and the site's button).
* **Language.** English only (the original's translations are not used).
* **Two bugs of the original that would make the port nondeterministic are made to do what they were
  meant to:** the high score list's scrolling background takes its width from a real surface (the
  original passes a surface's address, so its width differs from run to run), and the demo's pause, which
  spins without sleeping in the original, sleeps a millisecond per turn so the page stays responsive.

## Files

* `src/fb/`: the program (game.ts), the editor (fble.ts), c_stuff (cstuff.ts), Perl's and glibc's
  numbers (rand.ts, libm.ts), Data::Dumper for the files (dumper.ts), text layout (pango.ts)
* `src/sdl/`: the SDL 1.2 emulation; `src/audio/`: Web Audio and the XM player
* `src/page/`: account storage (home.ts) and online play (online.ts); `src/index.ts`: the page
* `test/`: the oracle tests, their sessions and the aiming bot; `e2e.mjs`: the browser test
  (one player, then three players online); `screenshots.mjs`: the game page's screenshots
