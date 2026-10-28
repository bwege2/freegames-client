# Biniax (port)

Jordan Tuzsuzov's Biniax 1.2 (2005, "Biniax-Classic"), ported from its C source (`re/biniax/`): the
640×480 screen on the SDK's pixel screen, a game step every 60 ms as in the original.

## Controls

* **Arrow keys**: move, or choose in the menu (Continue, New, Quit).
* **Space** or **Enter**: select in the menu; during a game, back to the menu (the game is saved;
  Continue picks it up); after game over, back to the menu.
* **Esc**: during a game, back to the menu (saved).

As in the original, keys are remembered until the game reads them: arrows pressed after the game is
over move the menu's choice when the menu comes back, and Esc pressed in the menu ends the next game
at once.

## Deviations the browser forces

* **Files**: `autosave.bnx` and `hiscore.bnx`, in the original's binary format, are in the player's
  storage on the server instead of next to the program.
* **Leaving**: the website's Back during a game saves it as Esc would (the original could only be
  left through Quit).
* **Sound**: the WAVs are played by the browser at its own rate; SDL_mixer resampled them to 22000 Hz.
* **Menu timing**: the menu takes each key as it comes and is drawn every frame (the original polled
  and drew it every millisecond).

Version 1.2 has one way to play: the field scrolls with time, faster as the score grows. (The
ticket's "two modes" were Biniax 2's.)
