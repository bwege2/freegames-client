// Colossal Cave Adventure on the website: Open Adventure 1.22 (main.ts and the modules of its other C
// files) runs as a process whose terminal is the SDK's teletype, 80 columns like the terminal the
// original runs in, and whose files are the player's account storage on the server.
import { Teletype, type StartGame, type Storage } from '../../../src/sdk/index.ts';
import { Exit, LINESIZE, bstr, bytes, set_host, type Host } from './advent.ts';
import { main } from './main.ts';

/** File names the server stores ([A-Za-z0-9._-]{1,64}, not "." or "..", not *.tmp); other names cannot be opened. */
export function storage_name(name: string): string | null {
  return /^[A-Za-z0-9._-]{1,64}$/.test(name) && name !== '.' && name !== '..' && !name.endsWith('.tmp') ? name : null;
}

/** The program was stopped (the player left): its pending input and file operations end with this. */
class Stopped extends Error {}

/** What the process needs from the terminal: output, and a line typed with echo (Teletype). */
export interface Terminal {
  write(s: string): void;
  readLine(o: { maxLength: number }): Promise<string>;
}

/**
 * The process: an interactive terminal (isatty(0) is true, readline shows the prompt and the typed
 * line), files in account storage, the real clock. The program's byte strings are UTF-8 on the screen
 * and from the keyboard.
 */
export function browser_host(term: Terminal, storage: Pick<Storage, 'get' | 'put'>, signal: AbortSignal): Host {
  const decoder = new TextDecoder();
  const write = (s: string) => term.write(decoder.decode(bytes(s), { stream: true }));
  const live = async <T>(p: Promise<T>): Promise<T> => {
    const v = await p;
    if (signal.aborted) throw new Stopped(); // a reply after the player left must not run the old game on
    return v;
  };
  return {
    stdout: write,
    stderr: write,
    isatty: true,
    async readline(prompt) {
      write(prompt);
      const line = await live(term.readLine({ maxLength: LINESIZE - 1 }));
      return bstr(new TextEncoder().encode(line));
    },
    fgets_stdin: async () => null, // no script arguments on the website
    async read_file(name) {
      const n = storage_name(name);
      if (n === null) return null;
      try {
        return await live(storage.get(n));
      } catch (e) {
        if (e instanceof Stopped || signal.aborted) throw new Stopped();
        return null; // the server could not be reached: the file cannot be opened
      }
    },
    async write_file(name, data) {
      const n = storage_name(name);
      if (n === null) return false;
      try {
        await live(storage.put(n, data));
        return true;
      } catch (e) {
        if (e instanceof Stopped || signal.aborted) throw new Stopped();
        return false; // refused (quota) or not reachable: the file cannot be opened
      }
    },
    time: () => Math.floor(Date.now() / 1000),
  };
}

export const start: StartGame = (host, ctx) => {
  const tty = new Teletype(host, { cols: 80, rows: 24 }, ctx.signal);
  set_host(browser_host(tty, ctx.storage, ctx.signal));
  main([]).catch(async (e) => {
    if (!(e instanceof Exit)) {
      if (!ctx.signal.aborted) console.error(e); // (stopped: the pending input was cancelled)
      return;
    }
    // The program has ended (quit, death, victory, or after a save). Its last words stay readable; a
    // key goes back to the game page, as the end of the process would leave the terminal.
    tty.write('\n[Press a key to return to the game page.]');
    try {
      while (tty.keyWaiting()) await tty.readKey(); // keys typed ahead do not count
      await tty.readKey();
      ctx.exit();
    } catch { /* stopped */ }
  });
  return {
    stop() {
      // the teletype, its listeners and the waiting input end with ctx.signal
    },
  };
};
