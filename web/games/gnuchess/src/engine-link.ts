// The engine thread when it runs in the same JavaScript thread as the rest of the program (the tests,
// and the inside of the browser's engine worker): the pipe from the adapter is a queue of lines that
// the engine handles one per step(); during a search it sees the lines that are already waiting, as
// Fruit's input_available() sees its pipe.
import type { EngineLink } from './main.ts';
import type { Clock, EngineHost, Files } from './host.ts';
import { main_engine } from './engine/main.ts';
import { loop_step } from './engine/protocol.ts';
import { EngineFatal } from './engine/util.ts';

export class InProcessEngine implements EngineLink {
  private readonly files: Files;
  private readonly clock: Clock;
  private readonly stderr: (s: string) => void;
  private lines: string[] = [];
  private partial = '';
  private started = false;

  constructor(files: Files, clock: Clock, stderr: (s: string) => void = () => {}) {
    this.files = files;
    this.clock = clock;
    this.stderr = stderr;
  }

  start(out: (data: string) => void, quit: () => void): void {
    const host: EngineHost = {
      send: (line) => out(line + '\n'),
      inputAvailable: () => this.lines.length > 0,
      getLine: () => this.lines.shift() ?? null,
      quit,
      files: this.files,
      clock: this.clock,
      stderr: this.stderr,
    };
    main_engine(host);
    this.started = true;
  }

  write(data: string): void {
    const all = this.partial + data;
    const parts = all.split('\n');
    this.partial = parts.pop() ?? '';
    // my_file_read_line(): CRs are removed
    for (const p of parts) this.lines.push(p.replace(/\r/g, ''));
  }

  step(): boolean {
    if (!this.started || this.lines.length === 0) return false;
    try {
      loop_step(this.lines.shift()!);
    } catch (e) {
      // my_fatal(): the message is out and the program is told to quit; the thread does no more
      if (!(e instanceof EngineFatal)) throw e;
      this.started = false;
      this.lines = [];
    }
    return true;
  }

  /** lines the adapter sent that the engine has not read yet */
  get pending(): number {
    return this.lines.length;
  }

  /** the next line the engine will read */
  peek(): string | undefined {
    return this.lines[0];
  }

  /** drops the next line unread */
  skip(): void {
    this.lines.shift();
  }

  /** replaces the next line */
  replaceNext(line: string): void {
    if (this.lines.length) this.lines[0] = line;
  }

  stop(): void {
    this.started = false;
    this.lines = [];
  }
}
