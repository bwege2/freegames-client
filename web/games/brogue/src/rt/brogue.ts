// What the translated program takes from its platform layer (src/platform/ of Brogue CE): the console
// (struct brogueConsole, here the one main.c picks when no other platform is compiled in, nullConsole,
// which passes everything to the Platform) and the directory listing (platformdependent.c's listFiles,
// over the in-memory file system).
import { struct_brogueConsole, struct_fileEntry, struct_tm } from '../game/structs.ts';
import { cstr, jstr } from './cstring.ts';
import { R, fsList } from './fs.ts';
import { platform } from './platform.ts';
import { $sarr, P, Ptr } from './ptr.ts';
import { exit, localtime } from './sys.ts';

export function makeNullConsole(rogueMain: () => Promise<number>): struct_brogueConsole {
  return struct_brogueConsole.$of(
    async () => exit(await rogueMain()),
    (ms: number, behavior: any) => platform().pauseForMilliseconds(ms, !!behavior.interuptForMouseMove).then((b) => (b ? 1 : 0)),
    (ev: any, textInput: number, colorsDance: number) => platform().nextKeyOrMouseEvent(ev, !!textInput, !!colorsDance),
    (g: number, x: number, y: number, fr: number, fg: number, fb: number, br: number, bg: number, bb: number) =>
      platform().plotChar(g, x, y, fr, fg, fb, br, bg, bb),
    null,
    (m: number) => (platform().modifierHeld(m) ? 1 : 0),
    (id: number, d1: number, d2: number, s1: Ptr | null, s2: Ptr | null) =>
      platform().notifyEvent?.(id, d1, d2, s1 ? jstr(s1) : '', s2 ? jstr(s2) : ''),
    platform().takeScreenshot ? () => (platform().takeScreenshot!() ? 1 : 0) : null,
    platform().setGraphicsMode ? (mode: number) => platform().setGraphicsMode!(mode) : null,
  );
}

export function installConsole(rogueMain: () => Promise<number>): void {
  R.nullConsole = makeNullConsole(rogueMain);
}

/** listFiles(&count, &namebuffer): the files of "./" with their modification times */
export function listFiles(fileCount: Ptr, namebuffer: Ptr): struct_fileEntry | null {
  const list = fsList().filter((f) => !f.path.includes('/'));
  if (!list.length) {
    fileCount.a[fileCount.o] = 0;
    namebuffer.a[namebuffer.o] = null;
    return null;
  }
  const files = $sarr(struct_fileEntry, list.length);
  list.forEach((f, i) => {
    files[i].path = cstr(f.path);
    const tm = localtime(P([f.mtime], 0));
    const d = new struct_tm();
    Object.assign(d, tm);
    files[i].date.$cp(d);
  });
  fileCount.a[fileCount.o] = list.length;
  namebuffer.a[namebuffer.o] = null;
  return files[0];
}
