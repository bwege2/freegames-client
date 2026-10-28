// A scripted player for the construction set: it steers the joystick (paddles 0 and 1) towards the
// next point, presses and lets go of the buttons and types keys, all from the machine's RAM (the
// cursor at $82-$84), so the original and the port get the same inputs as long as they agree.

export type Act =
  | { to: [number, number] }
  | { press: 0 | 1 }
  | { release: 0 | 1 }
  | { key: string | number }
  /** let the program run on: so many WAITs */
  | { waits: number }
  /** so many input reads */
  | { polls: number };

/** the paddle value for a joystick deflection that moves the cursor `d` pixels this way */
function paddle(d: number): number {
  // LOGLO/LOGHI by paddle/16: -5, -2, -1.5, -1, -.5, -.125, 0, 0, 0, 0, .125, .5, 1, 1.5, 2, 5
  const a = Math.abs(d);
  let i = a >= 10 ? 15 : a >= 4 ? 14 : a >= 2 ? 12 : a >= 1 ? 11 : 8;
  if (d < 0 && i !== 8) i = 15 - i;
  return i * 16 + 8;
}

export class Robot {
  inputs = { btn0: 0, btn1: 0, pdl0: 128, pdl1: 128 };
  key = 0;
  i = 0;
  private count = 0;
  readonly acts: Act[];
  private readonly ram: () => Uint8Array;
  /** set when all acts are done */
  done = false;

  constructor(acts: Act[], ram: () => Uint8Array) {
    this.acts = acts;
    this.ram = ram;
  }

  private cursor(): [number, number] {
    const m = this.ram();
    return [m[0x83] * 7 + m[0x84], m[0x82]];
  }

  private step(kind: 'poll' | 'wait'): void {
    for (;;) {
      if (this.i >= this.acts.length) {
        this.done = true;
        this.inputs.pdl0 = 128;
        this.inputs.pdl1 = 128;
        return;
      }
      const a = this.acts[this.i];
      if ('to' in a) {
        const [x, y] = this.cursor();
        const dx = a.to[0] - x;
        const dy = a.to[1] - y;
        if (dx === 0 && dy === 0) {
          this.inputs.pdl0 = 128;
          this.inputs.pdl1 = 128;
          this.next();
          continue;
        }
        this.inputs.pdl0 = paddle(dx);
        this.inputs.pdl1 = paddle(dy);
        // give up on a point the cursor cannot reach (a clamp) after a while
        if (kind === 'poll' && ++this.count > 4000) this.next();
        return;
      }
      if ('press' in a || 'release' in a) {
        const b = 'press' in a ? a.press : a.release;
        const v = 'press' in a ? 0x80 : 0;
        if (b === 0) this.inputs.btn0 = v;
        else this.inputs.btn1 = v;
        this.next();
        this.acts.splice(this.i, 0, { polls: 12 });
        continue;
      }
      if ('key' in a) {
        this.key = typeof a.key === 'number' ? a.key : a.key.toUpperCase().charCodeAt(0) | 0x80;
        this.next();
        this.acts.splice(this.i, 0, { polls: 20 });
        continue;
      }
      if ('waits' in a) {
        if (kind === 'wait' && ++this.count >= a.waits) this.next();
        return;
      }
      if (kind === 'poll' && ++this.count >= a.polls) this.next();
      return;
    }
  }

  private next(): void {
    this.i++;
    this.count = 0;
  }

  wait(_waits: number): void {
    this.step('wait');
  }

  poll(_polls: number, _waits: number): void {
    this.step('poll');
  }
}
