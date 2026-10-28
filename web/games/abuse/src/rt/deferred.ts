// Work the original does inside a Lisp call but that waits (palette fades, Timer::WaitMs) and so cannot
// run inside the port's synchronous interpreter. The function called from Lisp does everything that
// changes game state at the original's point and defers the waiting part (with the drawing that must
// come after a fade); the main loop awaits run_deferred() after the tick and before it draws the next
// frame, so the screens appear in the original's order and at its times. The game state the deferred
// frames belong to is the one of the moment the original drew them, in the middle of the tick: it is
// kept with the task (`during`), for the tests that compare each frame's state with the original's.
import { state_line } from './state.ts';

interface Task { run: () => Promise<void>; state: string }
const deferred: Task[] = [];

/** the game state of the frames being drawn by a deferred task, or null */
export const during = { state: null as string | null };

/** queues the waiting part of a Lisp call; the state is the one at the call */
export function defer(run: () => Promise<void>): void {
  deferred.push({ run, state: state_line() });
}

/** runs the queued tasks in the order they were queued, one after another, and empties the queue */
export async function run_deferred(): Promise<void> {
  while (deferred.length) {
    const task = deferred.shift()!;
    during.state = task.state;
    try {
      await task.run();
    } finally {
      during.state = null;
    }
  }
}
