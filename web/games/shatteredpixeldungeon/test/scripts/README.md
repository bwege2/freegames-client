Scripts of the gameplay oracle (`re/shatteredpixeldungeon/oracle/src/freegames/spd/Oracle.java`, `play`): commands
separated by white space, `kN` a key press and release (libGDX key code: 19 up, 20 down, 21 left, 22 right, 45 Q
attack, 62 space, 8/9 quickslots 1/2, 38 J journal, 111 Escape), `cN` a tap on cell N, `fN` N frames.

- `explore.txt`: seed 12345, warrior: the first room, the guidebook, the journal, then east and south through
  the corridors (two rats fought by walking into them).
- `descend.txt`: `explore.txt`, then into the exit room, a crystal key picked up, a rat fought (Q), quickslot 1
  (throwing stones) and 2 (the waterskin: "Your waterskin is empty!"), down the stairs to floor 2, a rest.
- `resume.txt`: seed 12345, warrior: the start of `explore.txt`, then `r30` (to the title as the game menu's "Main
  menu" does, saving, 30 frames there, "Continue"), more steps, `r10`, more steps.
- `save.txt` and `load.txt` (`saves.test.ts`): `save.txt` plays and ends with `q` (saved, the saved files printed
  as `file NAME BASE64`); `load.txt` starts with `C` ("Continue" from the title) and is run in a new process after
  those `file` lines.
- `mage.txt`: seed 12345, mage: the guidebook, a sleeping rat zapped twice with the staff (quickslot 1 and a
  tap), more rats fought on the way to the exit, down to floor 2 with 1 HP left.
