# Moria (Umoria 5.7.15)

The whole of Umoria 5.7.15 translated from its C++ into TypeScript, one module per source file
(`src/<name>.ts` from `src/<name>.cpp`): character creation, the town and its six stores with their
haggling, the dungeon down to the Balrog and below, every monster, object, spell and prayer, monster
memories, the original and the roguelike key sets, the help screens, wizard mode, death and the
tombstone, the score list, saving and restoring. It runs on the original's 80x24 screen
(`src/curses.ts` is the part of curses Umoria uses, with ncurses' rules for writing a window; the
website's `TextScreen` shows it).

Play starts the program as `umoria` starts in a terminal: with a saved character (your account's
`game.sav`) it restores it, otherwise it makes a new one. When the program ends (you save with ^X, quit
with ^K, or die), the page goes back to the game page, as the original went back to the shell.

The port is checked against the original: `test/sessions.test.ts` runs the sessions that the original,
built natively with the seed fixed, ran (`re/moria/oracle/`), and every screen must be the original's,
with the cursor, the state of the random generator and the bells, and so must every file the runs
leave (`game.sav`, `scores.dat`, character records) byte for byte. `re/moria/NOTES.md` has the details.

## Controls

The original's keys (`?` shows them all; `=` sets the options, among them the roguelike keys):

| Keys | What |
| --- | --- |
| 1-9 (also the numeric keypad), arrow keys, Home/End/PgUp/PgDn | move, or attack what is there; 5 stays in place |
| Shift + arrow keys, or `.` and a direction | run |
| `i` `e` `w` `t` `d` `x` | inventory, equipment, wear/wield, take off, drop, exchange weapons |
| `q` `r` `E` `a` `u` `f` | quaff, read, eat, aim a wand, use a staff, fire or throw |
| `m` `p` `b` `G` | cast a spell, pray, browse a book, learn new spells |
| `o` `c` `D` `T` `B` `j` `s` `S` | open, close, disarm, tunnel, bash, jam a door, search, search mode |
| `<` `>` | stairs up and down |
| `R` | rest (a count, or `*` until hit points and mana are full) |
| `C` `L` `M` `l` `/` `V` `v` | character sheet, locate, map, look, identify a symbol, scores, version |
| Ctrl+P, Ctrl+R | earlier messages, redraw |
| Ctrl+X | save and leave (Play restores the character) |
| Ctrl+K | quit: the character dies ("Quitting") |
| Esc, Space, Enter | leave a prompt or list, go on after `-more-`, end a line |

With the roguelike keys (option "Rogue like commands"): `h j k l y u b n` move, Shift with them runs,
Ctrl with them tunnels, and the arrow keys follow; `?` lists the rest. Control commands can also be
typed as `^` and the letter, as in the original: use that for the ones the browser keeps for itself
(Ctrl+W, wizard mode; Ctrl+T, Ctrl+N).

## Deviations the browser forces

- **Files.** The program's working directory is your account storage on the server: `game.sav` and the
  character records you write ("Character record?" with a file name) are kept there, in the original's
  formats. The storage keeps names of letters, digits, `.`, `_` and `-` only (at most 64 characters),
  64 files and 4 MiB: another name cannot be opened, and the program says so as it does when a file
  cannot be written.
- **The score file** is the server's score table, shared by everyone who plays here, as `scores.dat`
  was shared by every user of a machine. The server keeps the original's order and its rule for saved
  games (a character's "(saved)" entry is replaced by its next entry), and keeps at most 1000 entries
  (the original stopped entering below the 1000th entry but did not shorten the file). Moria is played
  alone in the browser, so the server cannot see a game happen: **single-player scores can only be
  checked for plausibility** (a race, class and sex the original allows, a level the character can
  have, points within reach, the record's text lengths; `MoriaModule.java`), and a determined cheat
  could still enter a made-up score. The "(saved)" rule also requires the same account, so that one
  player's entry never replaces another's (on the original's machine every user was uid 0).
- **Leaving without saving.** Back (or closing the page) stops the program at once; what happened since
  the last ^X is lost. The original, when its terminal hung up, read end-of-input until it made a panic
  save; the page cannot keep the program running after it is left.
- **No command line.** The page always starts `umoria` without options: there is no `-n` (a new
  character while a saved one exists: quit it with ^K first), no `-s` seed (the clock seeds the game,
  as without `-s`), no `-d` (`V` shows the scores in the game), and the save file is always `game.sav`.
- **Keys.** A terminal sends escape sequences for the arrow keys, which the original does not know; the
  port turns the arrow keys (and Home, End, PgUp, PgDn) into the direction keys of the current key set,
  with Shift into running. Other keys that send escape sequences (F1-F12, Insert, Delete, Alt with a
  key), which the original would take for ESC and then commands, and characters outside ASCII are not
  passed on. The bell is a short beep.
- **The login name** (`getlogin()`, the name a new character gets when you leave the name empty) is
  your name on this site, as far as it is printable ASCII, or `player`.
- **The clock** is the browser's: the tombstone's date and the character's birth date use its time and
  time zone.
