# Chromium B.S.U. (port)

Mark B. Allan's **Chromium B.S.U.**, release **0.9.16.1** as Debian builds it for Linux (SDL 2 window,
OpenAL sound, GLC text, SDL_image textures; `re/chromiumbsu/`). The game code (`src/game/`) is a line
by line translation of the original's C++ with its float arithmetic (every value the original keeps
in a `float` is rounded to one), its random tables made with glibc's `rand()`, its 50 frames per
second and its linked lists' order. The textures, sounds, music, the font and the menu's 3D title are
the original's files.

## Controls

* **Mouse**: moves the ship (click into the game so that it captures the pointer, as the original
  grabs it; **G** releases or captures it). **Left button**: fire. **Right button** twice: self-destruct
  (your ammunition is thrown out as power-ups for the next ship). **Middle button**: next item.
* **Arrow keys**, **keypad 1-9**: move. **Space**: fire. **Enter** twice: self-destruct. **'** or keypad **+**:
  next item. **0** / **9**: use item 0 / 1.
* **P** or **Pause**: pause. **Esc**: menu, and back. **N**: next music track (there is one). **Q**: quit
  (back to the game page).
* Menu: **up/down** choose, **left/right** change, **Enter** (or any other key) select; or the mouse:
  click an entry, its **-**/**+** buttons change it.

## What is the original's

The ship, its three guns (the always-on twin gun, and the green and blue guns that need their
ammunition), shields, super shields, repairs, damage and the push of hits; the seven enemies
(straight fighters, omni fighters, ray guns, tanks, gnats and the two bosses) with their movement,
weapons, damage and scoring; the three level time lines (`ScreenItemAdd`) made from the random tables
when a level starts, and level 4 onwards repeating them; extra lives every 50000 points and for
letting super shields pass, the super bomb after losing a ship; the explosions, gun flashes,
glitter and electric effects, the status gauges, the tips, the pause, game-over and level texts;
the menu with its chrome title, options, help messages, credits and the high-score list; the config
file `.chromium-bsu` and the high-score file `.chromium-bsu-score` in the original's text formats
(kept in your account); the frame-rate measurement and the speed adjustment it drives (with the
original's quirk that the menu and the pause make it measure 500 frames per second).

## Deviations the browser forces

* **Text**: the original draws Gothic Uralic Bold with QuesoGLC; here the same TTF is drawn by the
  browser into a glyph atlas, so glyph shapes and widths can differ slightly.
* **Time**: the game runs exactly 50 frames per second (20 ms each), the rate the original was made
  for; the frame counter in the corner therefore shows 50.0 (and 500.0 in the menu).
* **Screen size and full screen**: the menu's screen size sets the drawing resolution
  (512x384 ... 1280x960); the picture is scaled to the window in 4:3. Full screen is the browser's.
* **Mouse**: through the browser's pointer lock; leaving it with Esc can take one press of Esc.
* **Textures**: WebGL has no texture border colour; `GL_CLAMP` is clamp-to-edge.
* **sin/cos**: glibc's generic `sin`/`cos` (`src/libm.ts`). On a CPU with FMA, glibc switches to a
  variant whose results differ in the last bit now and then, so the original's trajectories differ
  slightly between machines; the port (and its test) follow the generic one.
* **Saving**: the original writes `.chromium-bsu` when it ends; the port writes it whenever a value
  in it changes, since a browser tab can close at any time. The high-score name is your name on this
  website (the original takes `$USER`).
* Not in the Linux build and not here: CD audio, a music playlist, the joystick.

## Tests

`test/chromiumbsu.test.ts` runs three scripts (`test/scripts/`) and compares, every 10 frames, a hash
chained over the complete game state and every OpenGL, text and OpenAL call with the original
(`test/golden/`, made by `re/chromiumbsu/oracle/`): the menu and all keys, a bot playing level 1
until game over and again, and a bot with its shields kept up through all three levels and both
bosses, then a game over with a high score. See `re/chromiumbsu/NOTES.md`.
