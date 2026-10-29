// Debugging aids of the test workers: FREECOL_LOG=1 prints every log record (else warnings and worse),
// FREECOL_TRACE=Class#method,... prints what those methods throw, and calls with FREECOL_TRACE_CALLS=1.
import fs from 'node:fs';
import { java } from '../../src/freecol.ts';

/** Prints at once (a worker's console is flushed only when its event loop runs, and the client worker blocks). */
const say = (...a: any[]) => fs.writeSync(1, a.join(' ') + '\n');

export const log = (r: any) => {
  if (r.level.intValue() >= (process.env.FREECOL_LOG ? 0 : 900)) {
    say('LOG', r.level.getName(), r.loggerName, r.message, r.thrown ? r.thrown.toString() + '\n' + (r.thrown.$stack ?? '') : '');
  }
};

export function installTraces(who: string) {
  for (const [cls, m] of (process.env.FREECOL_TRACE ?? '').split(',').filter(Boolean).map((s) => s.split('#'))) {
    let C: any;
    try {
      C = java(cls);
    } catch {
      continue;
    }
    const orig = C.prototype[m];
    if (typeof orig !== 'function') continue;
    C.prototype[m] = function (...a: any[]) {
      if (process.env.FREECOL_TRACE_CALLS) say('CALL', who, cls, m, process.env.FREECOL_TRACE_STACK ? new Error().stack : '');
      try {
        return orig.apply(this, a);
      } catch (e: any) {
        say('TRACE', who, cls, m, e?.toString?.(), e?.$stack ?? e?.stack);
        throw e;
      }
    };
  }
}

/** The worker's console, written at once. */
export function syncConsole() {
  console.log = console.info = console.warn = console.error = (...a: any[]) => say(...a.map((x) => (typeof x === 'string' ? x : String(x))));
}
