# Hunt the Wumpus (port)

Gregory Yob's 1973 BASIC game, ported from the Creative Computing listing (`re/wumpus/`), on the SDK's
teletype: 72 columns, paper-coloured, upper case.

## Controls

Type your answer and press Enter, as on the teletype: `Y`/`N`, `S` (shoot) or `M` (move), room numbers.
Backspace corrects a typo before Enter (Ctrl+U clears the line).

## Deviations the browser forces

* **Leaving**: the website's Back button (the original ran until the operator pressed BREAK).
* **Capitals**: typed letters print in capitals, as on the ASR-33, which had no lower case.
* **Speed**: output appears at once, not at the teletype's 10 characters per second.
* **Bad numbers**: something that is not a number, where one is asked for, is asked for again with `?`.
  The HP 2000's own message for bad input is not known to us.
* **Random numbers**: the browser's generator, not the HP 2000's; every game deals a new cave.

The texts are the 1975 listing's, corrected where the published sample run shows what the program
printed (`re/wumpus/NOTES.md`); numbers are printed in the HP 2000's 6-character fields, as in that run.
