// desktop/inp.c: keys are latched when pressed (SDL_KEYDOWN) and cleared when the game reads them, so a
// press is never lost and is read once. Space and Enter are "A", Escape is "B".
export type Key = 'up' | 'down' | 'left' | 'right' | 'a' | 'b';

export class Input {
  private readonly latched: Record<Key, boolean> = { up: false, down: false, left: false, right: false, a: false, b: false };
  /** presses since the last inpUpdate(), delivered by it */
  private pending: Key[] = [];

  /** a key went down (the browser's keydown) */
  press(k: Key): void {
    this.pending.push(k);
  }

  /** inpUpdate(): takes the events that arrived */
  update(): void {
    for (const k of this.pending) this.latched[k] = true;
    this.pending = [];
  }

  /** inpKeyX(): true once per latched press */
  take(k: Key): boolean {
    if (!this.latched[k]) return false;
    this.latched[k] = false;
    return true;
  }
}
