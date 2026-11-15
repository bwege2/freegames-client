// Runs the translated program once, as a new process: every global set to its initial value, the files
// given as its working directory, the command line given, until exit() or the end of main().
import { initGlobals } from './game/init.ts';
import { main } from './game/main.ts';
import { rogueMain } from './game/RogueMain.ts';
import { installConsole } from './rt/brogue.ts';
import { cstr } from './rt/cstring.ts';
import { fsFiles, fsReset, termTake } from './rt/fs.ts';
import { Exit, setPlatform, type Platform } from './rt/platform.ts';
import { Ptr } from './rt/ptr.ts';
import { resetSys } from './rt/sys.ts';

export interface RunResult {
  status: number;
  /** the working directory's files when the program ended */
  files: Map<string, Uint8Array>;
  /** standard output */
  stdout: string;
}

export async function runBrogue(platform: Platform, args: string[], files: Map<string, Uint8Array>): Promise<RunResult> {
  setPlatform(platform);
  resetSys();
  fsReset(files);
  termTake();
  initGlobals();
  installConsole(rogueMain);
  const argv = ['brogue', ...args].map((a) => cstr(a));
  argv.push(null as any);
  let status: number;
  try {
    status = await main(args.length + 1, new Ptr(argv, 0));
  } catch (e) {
    if (!(e instanceof Exit)) throw e;
    status = e.status;
  }
  return { status, files: fsFiles(), stdout: bytesText(termTake()) };
}

export function bytesText(b: number[]): string {
  let s = '';
  for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode(...b.slice(i, i + 8192));
  return s;
}
