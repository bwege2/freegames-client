// imlib/status.cpp and imlib/guistat.cpp: the status manager (progress of loading). Before the Game
// exists it is the text one (dprintf); the Game installs the graphical one. Its nodes keep a
// time_marker (one clock reading when pushed) and update() reads the clock while no window is open;
// the window opens only after a status has lasted more than a second, where the original reads
// first->stat_win->x1() of the window it has not created yet and crashes. The port keeps the clock
// readings (they count in the oracle's virtual clock) and shows no window.
import { time_marker } from './rt/platform.ts';
import { dprintf } from './imlib/dprint.ts';

interface Node { name: string; last_update: number; last_time: time_marker | null }

class status_manager {
  gui = false;
  first: Node[] = [];

  push(name: string): void {
    this.first.unshift({ name, last_update: 0, last_time: this.gui ? new time_marker() : null });
  }

  update(percentage: number): void {
    const f = this.first[0];
    if (!f) return;
    if (this.gui) {
      // stat_win is never opened (see above): time_marker now; now.diff_time(&first->last_time) > 1
      void new time_marker();
      return;
    }
    if (this.first.length === 1 && percentage - f.last_update > 4) {
      f.last_update = percentage;
      const t = Math.trunc((percentage * 40) / 100);
      dprintf(`\r${f.name} [${'.'.repeat(t)}${' '.repeat(40 - t)}]`);
    }
  }

  pop(): void {
    if (!this.gui && this.first.length === 1) dprintf('\n');
    this.first.shift();
  }
}

export const stat_man = new status_manager();
