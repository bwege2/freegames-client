# Worms? (port)

David S. Maynard's Worms? (Electronic Arts, 1983) in its Commodore 64 version, translated word by
word from its EA FORTH source (the source disk "MASTER OCT. 9, 1983. COMMODORE 64 FINAL" of
savetz/worms, `re/worms/`). `src/worms.ts` has one method for every Forth word the disk's load screen
compiles, on a model of the C64 the program wrote to (`src/machine.ts`): screen and colour RAM, the
character set it builds, the sprites, the SID's registers, the KERNAL's screen editor and keyboard
buffer (`src/kernal.ts`). `src/vic.ts` draws what the VIC-II shows of that memory, `src/sid.ts` plays
the SID's three voices from the register writes. Neither runs any of the program.

The tests (`test/oracle.test.ts`) compile the original screens from the disk with a rebuilt EA FORTH
and run them on a 6502 core, then play the same scenarios on the port: the demonstration, a full game
with a player teaching a worm, the menu with saving and loading worms, pause, speed and F1. At every
move the grid, the worms (all 88 bytes of each), the scores, the random seed, the screen, its colours,
the sprites and every SID register write are the same. `re/worms/NOTES.md` has what was learnt.

## Controls

The keys of the original:

* **F7**: start a game. At the start the computer's worms give a demonstration; F7 ends it and shows
  the menu.
* **F5**: select the next worm (the bar under it).
* **F3**: change the selected worm: none (`--------`), **NEW** (a player teaches it from nothing),
  **AUTO** (the computer chooses), **WILD** (random moves from the start), or the worm as it is,
  shown by its name: a worm that played keeps what it learnt ("SAME"), or one you loaded.
* When a worm meets a situation it does not know, the game stops, the bar shows whose it is and a
  line grows from its head along a free path. **Space** turns it to the next free path,
  **Return** (or any other key) takes it. The worm will always go that way in that situation.
* **0–9**: speed, 9 the fastest, 0 the slowest.
* **Esc** (RUN/STOP): pause; Esc again goes on.
* **F1**, **F3**, **F5** or **F7** during a game end it. F1 starts the program over (new worms, the
  demonstration again).
* In the menu: **L** loads a worm into the selected one, **S** saves the selected worm under a name
  (up to four characters, then Return), **U** updates its file under its name, **?** shows the
  commands. Each asks to confirm with Return.

Beside the picture: **Online game**, and the C64 keys a touch screen does not have (F1, F3, F5, F7,
RUN/STOP, SPACE, RETURN).

A worm scores a point for every point of the grid whose last path it eats. A worm that comes to a
point with no path left dies. When all worms are dead, each worm's points are shown in its colour.

## Online play (not in the original)

* **Online game** opens the lobby: a room for up to four players. Seat 1 plays the green worm, seat 2
  red, seat 3 blue, seat 4 purple. The room's creator chooses what the other worms are: the
  computer's (AUTO), WILD, or none.
* Each player brings the worm selected in the menu: a worm that has learnt something (shown with its
  name) brings what it knows, any other starts NEW.
* Every browser plays the same game from the round's seed. When a player's worm asks where to go,
  that player answers (Space, Return) and the answer goes to everyone through the server, which
  plays the game too and takes only the answer the game is waiting for, from that worm's player. The
  others see the worm's bar and that line while they wait.
* A player who leaves (the button again, or closing the page) hands their worm to the computer; a
  player whose connection drops gets the game so far from the server and catches up. The computer
  also takes over the worm of a player who stays connected but does not answer for five minutes, and
  plays the worm of a seat whose client did not send one within a minute of the start.
* The speed keys and the pause are your own. When the game ends, the room ends with the scores the
  server counted, and your worms stay as they played: save the one you taught with S.

## Deviations the browser forces

* **Character set**: the program copies the C64's character ROM into RAM and builds its own
  characters from it (the worm trails, the double-width letters and digits). The ROM is Commodore's;
  the port copies the free C64-compatible character set of the MEGA65 Open ROMs instead, so letters
  and digits look a little different. The trail characters are the original's.
* **Random numbers**: the original's RAND adds the VIC's raster line register to a seed. That is
  wherever the beam is at that cycle, in effect a random byte. The port reads a raster line from a
  seeded generator instead (the same distribution over an NTSC frame's 263 lines), so that an online
  round, and the tests, play the same game on every machine.
* **Time**: the port runs the program's words instantly and then spends the time the original's 6502
  took for them (measured on the original in the tests), so the game keeps its pace. The original's
  Forth system is lost; the times are those of a fig-FORTH kernel. A key pressed while a worm is
  being taught is read where the original reads it most of the time. On the C64, RUN/STOP or a digit
  could also be taken as the answer, depending on the cycle it came in at; in the port it is always
  the pause or the speed.
* **Disk**: worm files are your files on the server, in the C64's format (a program file: its load
  address, then the 64 moves). The original's file name is "@0:NAME.WRM"; characters the server's
  names cannot have are written _XX. "DISK ERROR: 4" means the file is not there, "DISK ERROR: 5"
  that the server cannot be reached.
* **Keys**: the C64's function keys are the PC's F1-F8 (the browser does not get them while you
  play), RUN/STOP is Esc, INST/DEL Backspace. There is no RESTORE key (the original made it do
  nothing). After an answer the original waits until the joystick's button in port 2 is let go; the
  port has no joystick, so it does not wait.
* **Picture and sound**: an NTSC C64 (60 Hz, as in the US) with a black border and background as the
  Forth system's load screen sets them; the SID's voices without the filter (the game does not use
  it) and without the chip's analogue noise.
* **Quitting**: the original has no quit; the website's Back button stops the program.
