# Ballerburg (port)

Eckhard Kruse's Ballerburg (Atari ST, 1987) in the SDL version 1.2.3 by Thomas Huth, ported from its
C sources (`re/ballerburg/`), one TypeScript module for each C file. It uses the same 640×480 screen,
dialogs, castles (`baller.dat`), YM-2149 sound chip and music (`baller.mus`). The tests
(`test/ballerburg.test.ts`) replay scripted games on the port and on the original C program. Every
frame matches: the drawing calls, the pixels, the game state, the random numbers and the sound.

## Controls

The mouse does everything, as in the original:

* **A cannon** of your castle: the cannon dialog. Set the angle (single arrows ±1°, double arrows
  ±10°) and the powder (±1, ±3; 5 to 20). Then **OK** fires; **Cancel** keeps the setting without
  firing.
* **The treasury, the powder or the cannonball store**: the market. Here you see what the kingdom
  has, set the taxes (arrows) and buy at this round's prices. Laying bricks gives 20 bricks to put
  next to your own walls; the right mouse button stops early.
* **The king** (the throne room): an audience.
* **Done**, below the field: the turn ends without a shot.

Keys:

* **Esc**: the settings. Here you choose human or computer for each castle, the computer's
  strategy and strength, the names, the maximum rounds, and whether the king may capitulate and the
  players may build. **New game** chooses the castles.
* **T**: the table of the computer players' games against each other.
* **F**: full screen. **Q**: quit, back to the game page.

**Play online**, beside the picture, opens the shared lobby: a room for two, one castle each.

## Online play (not in the original)

* The host of a room plays the left castle, which moves first, as player 1 does in the original. The
  room keeps the host's settings from when it was created: the maximum rounds, capitulation,
  building and the two castles. The castles carry the players' lobby names.
* Both browsers run the same game from the round's seed. Every decision of a turn is sent through the
  server, which lets only the castle on turn move. The decisions are Done, a cannon's angle, powder
  and fire, an audience, the market's buttons and the bricks. The other player sees what happens:
  the shot, the purchases, the bricks. The dialogs stay on the screen of the player who opened them.
  A line beside the picture says whose turn it is.
* **Esc** in an online game asks whether to leave it; there are no settings there. If you leave,
  the other player has won.
* When a game ends, the room's lobby comes back for the next round. A player whose connection drops
  gets the round's moves from the server when they come back. Their game then replays them quickly
  and goes on.
* **Time limits** (the original had none: both players sat at one computer). If the castle on turn
  does nothing for 5 minutes while its player stays connected, the other castle wins. Any decision
  (a dialog's button, a brick, a cannon) restarts the 5 minutes. The two games end with the same
  move, and each browser reports the end to the server at once. If the second report has not come a
  minute after the first, the round ends without a winner: the server cannot tell which game is
  wrong, the one that ended or the one that did not. While a player's connection is down, neither
  limit runs: the server keeps the seat for a minute, and then the player has left.

## Deviations the browser forces

* **Random numbers**: the original never calls `srand()`, so every run starts at glibc's seed 1 and
  the first game always has the same landscape. The port does the same. In the original, the sound
  chip's noise also drew from `rand()`, on SDL's audio thread, at moments that depend on the machine.
  So after the first shot the game's random numbers were no longer reproducible. In the port, the
  noise has a generator of its own: the game's random numbers follow only the players' moves.
* **Leaving**: Q's "Yes" and the settings' **Exit program** return to the game page.
* **Full screen** (F) is the browser's full screen of the game, not a new SDL window.
* **Sound**: psg.c's emulation runs in an audio worklet at 44100 Hz, as SDL opened the device, and is
  resampled linearly to the browser's rate. Where worklets are not allowed it uses a ScriptProcessor.
* **Texts** are English. The original translates them with gettext for the system's language
  (German, Finnish, Italian, Dutch).
* **Names** are typed one character a key, as Latin-1 (the font's character set), at most 22. The
  original took the first byte of SDL's UTF-8 text input, so a non-ASCII letter came out as another
  letter. Its edit field could also write a byte past the 22-character buffer.
* **Mouse**: on a touch screen a tap is the left button. There is no right button there, so laying
  bricks only ends after the 20th brick.
* **Nothing is saved**: version 1.2.3 does not save either. Its `t_load`/`t_save` of `baller.tab`, the
  computer players' table, are switched off (`#if 1`), and the settings were never saved.
