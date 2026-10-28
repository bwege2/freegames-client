// COW as a process: a new run of the translated client (cow/) with its command line, its files and its
// platform (the browser's or the replay test's). One at a time: the runtime's state is the process's.
import { main } from './cow/main.ts';
import { initGlobals } from './cow/init.ts';
import { Ptr, resetLiterals } from './rt/ptr.ts';
import { cstr } from './rt/cstring.ts';
import { fsReset } from './rt/fs.ts';
import { exit, resetSys, srandom } from './rt/sys.ts';
import { resetX11 } from './rt/x11.ts';
import { resetImlib } from './rt/imlib.ts';
import { Exit, setPlatform, type Platform } from './rt/platform.ts';

/** runs COW until it exits; resolves with its exit status (rejects if it fails) */
export async function runCow(platform: Platform, argv: string[], files: Map<string, Uint8Array>): Promise<number> {
  setPlatform(platform);
  resetLiterals();
  resetSys();
  srandom(1);
  fsReset(files);
  resetX11();
  resetImlib();
  initGlobals();
  const args = new Ptr([...argv.map((a) => cstr(a)), null], 0);
  try {
    const status = await main(argv.length, args);
    exit(status);
  } catch (e) {
    if (e instanceof Exit) return e.status;
    throw e;
  }
}
