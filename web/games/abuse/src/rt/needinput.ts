// A Lisp function of the original can open a dialog in the middle of a tick and wait for the player
// (the save console's (get_save_slot)). The port's interpreter cannot wait, so such a call throws
// NeedInput out of the object's AI function; level.tick() catches it, runs the dialog, and calls the
// AI function again, which then gets the player's answer at once (answers). The save console's AI
// function does nothing before it asks, so calling it again changes nothing else.
export class NeedInput extends Error {
  run: () => Promise<void>;
  constructor(run: () => Promise<void>) {
    super('the game waits for the player');
    this.run = run;
  }
}

/** answers given by dialogs, taken in order by the calls that asked for them */
export const answers: number[] = [];
