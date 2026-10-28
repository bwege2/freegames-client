// Runs the port as a process: argv, stdin (not a terminal, as when the regression suite pipes a log into
// advent), stdout and stderr captured, files in a Map that stands for the working directory.
import { Exit, bstr, set_host, type Host } from '../src/advent.ts';
import { main } from '../src/main.ts';

export interface Process {
  stdout: string;
  stderr: string;
  status: number;
}

export interface Options {
  /** isatty(0): false for piped input (the suite) */
  isatty?: boolean;
  /** time(NULL) for the initial seed */
  time?: number;
}

/** advent argv... < stdin, in a directory holding `files` (written files are put there too). */
export async function advent(argv: string[], stdin: string, files: Map<string, Uint8Array>, o: Options = {}): Promise<Process> {
  let stdout = '', stderr = '';
  let pos = 0;
  const line = (keepNewline: boolean, max = Infinity): string | null => {
    if (pos >= stdin.length) return null;
    let end = stdin.indexOf('\n', pos);
    end = end < 0 ? stdin.length : end + 1;
    end = Math.min(end, pos + max);
    let s = stdin.slice(pos, end);
    pos = end;
    if (!keepNewline && s.endsWith('\n')) s = s.slice(0, -1);
    return s;
  };
  const host: Host = {
    stdout: (s) => { stdout += s; },
    stderr: (s) => { stderr += s; },
    isatty: o.isatty ?? false,
    // libedit on input that is not a terminal: no prompt, no echo
    readline: async () => line(false),
    fgets_stdin: async (n) => line(true, n - 1),
    read_file: async (name) => (name === '/dev/stdin' && !files.has(name) ? null : files.get(name) ?? null),
    // the working directory takes plain file names; "/" (savefail.log) and other paths cannot be opened for writing
    write_file: async (name, data) => {
      if (name.includes('/')) return false;
      files.set(name, data.slice());
      return true;
    },
    time: () => o.time ?? 1761400000,
  };
  set_host(host);
  let status: number;
  try {
    await main(argv);
    throw new Error('main returned');
  } catch (e) {
    if (!(e instanceof Exit)) throw e;
    status = e.status;
  }
  return { stdout, stderr, status };
}

/** A string of char codes 0-255 from bytes (the transcripts are compared as bytes) */
export { bstr };
