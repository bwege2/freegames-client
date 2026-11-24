// The original's modal loops on the page (re/openclonk/tools/cpp2ts/config.py SUSPEND, CONVENTIONS.md "Modal loops").
//
// A modal dialog of the original waits in a message loop of its own until it is closed (C4GUI::Dialog::DoModal:
// `while (fShow) Application.ScheduleProcs();`), inside whatever function showed it; the start menu does so for its first
// player (C4StartupMainDlg::OnShown) and for its questions. A page cannot wait inside a function: the translator writes
// such loops, and every function that calls one directly, as generators. The loop yields before each wait for the next
// event, and the page resumes it on its next animation frame instead of running its own round of the main loop, as the
// original's outer loop does not run while the modal one does.
//
// A generator called from a function that does not wait (a constructor, a virtual method that only an override makes
// wait, a callback through a member function pointer, a lambda) is started here ($spawn) as a coroutine of its own: it
// runs at once up to its first wait, and if it waits, its caller goes on (the original's caller would wait with it; the
// callers that reach a modal loop so, Dialog::Show after OnShown and the GUI's callbacks, do nothing more after the
// call) and the page resumes the coroutine. Coroutines that wait one inside the other are resumed innermost first, as
// the original's nested loops run.

const GENERATOR = Object.getPrototypeOf(function* () { /* the prototype of generator objects */ }.prototype);

function isGenerator(x: unknown): x is Generator {
  return typeof x === 'object' && x !== null && Object.getPrototypeOf(Object.getPrototypeOf(x)) === GENERATOR;
}

/** coroutines that wait in a modal loop, the innermost last */
const waiting: Generator[] = [];

/** a call that may answer with a generator (a virtual method an override makes wait), in a function that waits */
export function* $co<T>(x: T | Generator<unknown, T, unknown>): Generator<unknown, T, unknown> {
  return isGenerator(x) ? yield* (x as Generator<unknown, T, unknown>) : (x as T);
}

/**
 * a call that may answer with a generator, in a function that cannot wait: runs it up to its first wait. If it waits, its
 * caller gets true: every function that waits answers nothing or a bool that says it did its work (Dialog::DoModal,
 * C4Game::Init, the scheduler's C4ApplicationGameTimer::Execute, the key callbacks' "handled"), and the scheduler takes a
 * false from a timer as an error (StdScheduler::OnError)
 */
export function $spawn<T>(x: T | Generator<unknown, T, unknown>): T {
  if (!isGenerator(x)) return x as T;
  const r = (x as Generator<unknown, T, unknown>).next();
  if (r.done) return r.value;
  waiting.push(x);
  return true as T;
}

/** whether a modal loop waits: the page resumes it instead of running its own round of the main loop */
export function coroWaiting(): number {
  return waiting.length;
}

/** resumes the innermost waiting loop for one round (its ScheduleProcs) */
export function coroResume(): void {
  const g = waiting[waiting.length - 1];
  if (!g) return;
  let r: IteratorResult<unknown>;
  try {
    r = g.next();
  } catch (e) {
    waiting.splice(waiting.lastIndexOf(g), 1);
    throw e;
  }
  if (r.done) waiting.splice(waiting.lastIndexOf(g), 1);
}

/** a new start of the engine: no loop waits */
export function coroReset(): void {
  waiting.length = 0;
}
