// Port of src/main.cc and src/components.cc of GNU Chess 6.3.0: the process. Its main thread runs the
// frontend's loop; an input thread reads the player's lines; the adapter thread translates between the
// frontend (xboard) and the engine (UCI); the engine thread searches. They talk through pipes.
//
// Here the frontend, the input thread and the adapter share the JavaScript thread and are scheduled by
// `run()`: whenever something happened, it lets the engine (if it runs in this thread), then the
// adapter, then the frontend work until none of them has anything left to do, in that order of
// priority, as the adapter and the engine answer within microseconds while the frontend's loop sleeps
// 100 µs per turn. The engine runs here (tests) or in a Web Worker (the browser): see EngineLink.
import { sprintf, srand } from './libc.ts';
import type { AdapterHost, Clock, Files } from './host.ts';
import {
  ENDED, HARD, MANUAL, POST, QUIT, THINK, UCI, XBOARD, g, MoveLimit, TimeLimit, ExchCnt, cboard, Mvboard, Game,
  newGameRec, board, clearBoard, TreePtr,
} from './frontend/common.ts';
import { Initialize } from './frontend/init.ts';
import { stdio, stdoutStream, printf } from './frontend/stdio.ts';
import { NextEngineCmd, NextUserCmd, ReadFromEngine, ReadFromUser, SendToEngine, engineReset, fe, pipes, type Wait } from './frontend/engine.ts';
import { input_line, input_reading, input_start, input_wakeup, inputHost, inputReset } from './frontend/input.ts';
import { cmd_usage, cmd_version, cmdReset } from './frontend/cmd.ts';
import { lexReset } from './frontend/lexpgn.ts';
import { playersReset } from './frontend/players.ts';
import { epdReset, Crash } from './frontend/epd.ts';
import { localtimeHook } from './frontend/pgn.ts';
import { main_adapter, adapter_engine_data, adapter_frontend_data } from './adapter/main.ts';

/** The engine thread, as the process reaches it: its pipe from the adapter and its pipe back. */
export interface EngineLink {
  /** InitEngine(): start the thread; out() gets what it writes to the adapter, quit() its set_engine_to_quit() */
  start(out: (data: string) => void, quit: () => void): void;
  /** write() on pipefd_a2e */
  write(data: string): void;
  /** an engine in this JavaScript thread does one step of work (one line); false when it has none */
  step?(): boolean;
  /** pthread_cancel: the program ends */
  stop(): void;
}

export interface ProcessHost {
  /** what the program writes to stdout and stderr (byte strings) */
  stdout(s: string): void;
  stderr(s: string): void;
  /** the input thread waits for a line (fgets on stdin): answer with GnuChess.input() */
  readLine(): void;
  /** the program has ended with this status */
  exit(code: number): void;
  files: Files;
  clock: Clock;
  getenv(name: string): string | undefined;
  /** localtime(): [year, month 0-11, day] of a time(); the browser's own time zone when not given */
  localtime?: (secs: number) => [number, number, number];
  engine: EngineLink;
}

export class GnuChess {
  private readonly host: ProcessHost;
  /** pending data in pipefd_f2a and pipefd_e2a, not yet read by the adapter */
  private f2a = '';
  private e2a = '';
  private adapterStarted = false;
  private engineQuit = false;
  private frontend: Generator<Wait, void, void> | null = null;
  private frontendWait: Wait = 'idle';
  private running = false;
  private ended = false;
  /** the program has ended (exit status) */
  status: number | null = null;
  /** the adapter called exit() while the input thread waited in fgets() */
  private pendingExit: number | null = null;

  constructor(host: ProcessHost) {
    this.host = host;
  }

  /** main(argc, argv) */
  start(argv: string[] = []): void {
    const host = this.host;
    resetFrontend();
    stdio.stdout = (s) => host.stdout(s);
    stdio.stderr = (s) => host.stderr(s);
    stdio.files = host.files;
    stdio.clock = host.clock;
    if (host.localtime) localtimeHook.fn = host.localtime;
    pipes.toAdapter = (data) => {
      this.f2a += data;
    };
    pipes.wakeup = () => input_wakeup();
    inputHost.readLine = () => host.readLine();

    // getopt_long(argc, argv, "qehmpvxgM:ua:", ...)
    let opt_help = 0, opt_version = 0, opt_post = 0, opt_xboard = 0, opt_memory = 0;
    let opt_easy = 0, opt_manual = 0, opt_quiet = 0, opt_uci = 0, opt_graphic = 0;
    let opt_addbook = '';
    const args = parseArgs(argv);
    for (const [c, optarg] of args.opts) {
      switch (c) {
        case 'v': opt_version = 1; break;
        case 'h': opt_help = 1; break;
        case 'q': opt_quiet = 1; break;
        case 'x': opt_xboard = 1; break;
        case 'p': opt_post = 1; break;
        case 'e': opt_easy = 1; break;
        case 'g': opt_graphic = 1; break;
        case 'm': opt_manual = 1; break;
        case 'M': {
          if (optarg === null) {
            opt_help = 1;
            break;
          }
          const m = /^[+-]?\d+$/.exec(optarg.trim() === optarg ? optarg : '');
          if (!m) {
            printf('Memory out of range or invalid.\n');
            return this.exit(1);
          }
          opt_memory = parseInt(optarg, 10) | 0;
          break;
        }
        case '?':
          opt_help = 1;
          break;
        case 'u': opt_uci = 1; break;
        case 'a':
          if (optarg === null) {
            opt_help = 1;
            break;
          }
          if (optarg.length > 128) {
            printf('File name is too long (max = %d).\n', 128);
            return this.exit(1);
          }
          opt_addbook = optarg;
          break;
      }
    }
    for (const e of args.errors) host.stderr(e);

    /* Initialize random number generator */
    srand(host.clock.time());

    /* initialize control flags */
    g.flags = 0;
    /* output for thinking */
    g.ofp = stdoutStream;

    /* Handle old style command line options */
    for (const a of argv) {
      if (a === 'xboard') g.flags |= XBOARD;
      else if (a === 'post') g.flags |= POST;
    }
    if (opt_xboard === 1) g.flags |= XBOARD;
    if (opt_uci === 1) g.flags |= UCI;
    if (opt_post === 1) g.flags |= POST;
    if (opt_manual === 1) g.flags |= MANUAL;

    /* If the version option was specified we can exit here */
    if (opt_version === 1) {
      cmd_version();
      return this.exit(0);
    }

    if (!opt_quiet) {
      if (!(g.flags & XBOARD)) printf('%s\n', 'GNU Chess');
      else printf('Chess\n');
    }

    /* If a usage statement is required output it here */
    if (opt_help === 1) {
      cmd_usage();
      return this.exit(1); /* Maybe an error if due to bad arguments. */
    }

    Initialize();

    const rest = (): void => {
      /* Compile book if the addbook option was specified. Ignore any other options. */
      if (opt_addbook.length > 0) SendToEngine(sprintf('book add %s\nquit', opt_addbook));
      if (opt_easy === 0) g.flags |= HARD;
      else SendToEngine('easy');
      if (opt_memory > 0) SendToEngine(sprintf('memory %d', opt_memory));
      if (opt_post === 1) {
        g.flags |= POST;
        SendToEngine('post');
      }
      if (opt_manual === 1) {
        g.flags |= MANUAL;
        SendToEngine('force');
      }
      if (argv.length > 0) {
        for (const a of argv) {
          if (a === 'xboard') g.flags |= XBOARD;
          else if (a === 'post') g.flags |= POST;
        }
        if (opt_graphic === 1) g.graphicmodeoutput = 1;
      }
      g.bookfirstlast = 3;
      if (g.flags & UCI) {
        this.f2a = ''; // nobody reads the frontend's pipe without the adapter
        this.host.readLine();
      } else {
        this.frontend = mainLoop(this);
        this.run();
      }
    };

    if (!(g.flags & UCI)) {
      /* Initialize the frontend: its input thread prompts at once */
      input_start();
      /* Initialize the adapter, which in turn initializes the engine; main() waits until it is ready */
      this.startEngine();
      this.guard(() => main_adapter(this.adapterHost(rest)));
      this.run();
    } else {
      /* Initialize the engine only; no adapter */
      this.startEngine();
      rest();
    }
  }

  /** the input thread's line (with its '\n'), or null at end of input (^D) */
  input(line: string | null): void {
    if (this.ended) return;
    if (g.flags & UCI) {
      this.uciInput(line);
      return;
    }
    // exit() from the adapter thread can finish once this fgets() has returned and unlocked stdin
    const exiting = this.pendingExit;
    input_line(line);
    this.run();
    if (exiting !== null) this.exit(exiting);
  }

  /**
   * exit() called by the adapter thread (a second fatal error). glibc's exit() flushes stdin too and so
   * waits for its lock, which the input thread holds while it waits in fgets(): the program ends only
   * after the next line has been read, and the main thread handles that line meanwhile.
   */
  private adapterExit(code: number): void {
    if (input_reading()) this.pendingExit = code;
    else this.exit(code);
  }

  /** whether the program waits for the player (its input thread is reading) and has nothing else to do */
  get waitingForInput(): boolean {
    return !this.ended && input_reading() && !this.busy();
  }

  /** the engine thread wrote this to the adapter (worker links call this) */
  fromEngine(data: string): void {
    this.e2a += data;
    this.run();
  }

  private startEngine(): void {
    this.host.engine.start(
      // without the adapter (UCI mode) the engine's output goes to stdout (ForwardEngineOutputToUser)
      (data) => (g.flags & UCI ? this.host.stdout(data) : this.fromEngine(data)),
      () => {
        this.engineQuit = true;
        this.run();
      },
    );
  }

  private adapterHost(initialized: () => void): AdapterHost & { stdout(s: string): void } {
    const host = this.host;
    return {
      toFrontend: (data) => {
        pipes.a2f += data;
      },
      toEngine: (data) => host.engine.write(data),
      stderr: (s) => host.stderr(s),
      initialized: () => {
        this.adapterStarted = true;
        initialized();
      },
      stdout: (s) => host.stdout(s),
      exit: (code) => this.adapterExit(code),
      getenv: (name) => host.getenv(name),
      files: host.files,
      clock: host.clock,
    };
  }

  /** whether a thread of this JavaScript thread has work */
  private busy(): boolean {
    if (this.f2a.length > 0 || this.e2a.length > 0) return true;
    return this.frontendReady();
  }

  private frontendReady(): boolean {
    if (!this.frontend) return false;
    if (g.flags & QUIT || this.engineQuit) return true;
    if (this.frontendWait === 'engine') return pipes.a2f.length > 0 || fe.engineinputbuf.includes('\n');
    if (pipes.i2f.length > 0 || pipes.a2f.length > 0) return true;
    if (fe.userinputbuf.includes('\n') || fe.engineinputbuf.includes('\n')) return true;
    if (g.flags & THINK && !(g.flags & MANUAL) && !(g.flags & ENDED)) return true;
    return false;
  }

  /** runs fn, ending the program if it exits or crashes */
  private guard(fn: () => void): void {
    try {
      fn();
    } catch (e) {
      if (e instanceof ProcessExit) this.exit(e.code);
      else if (e instanceof Crash) {
        this.host.stderr('Segmentation fault\n');
        this.exit(139);
      } else throw e;
    }
  }

  /** run the threads of this JavaScript thread until none has anything to do */
  run(): void {
    if (this.running || this.ended) return;
    this.running = true;
    try {
      for (;;) {
        if (this.ended) break;
        const engine = this.host.engine;
        if (engine.step && engine.step()) continue;
        if (this.f2a.length > 0 && !(g.flags & UCI)) {
          const data = this.f2a;
          this.f2a = '';
          adapter_frontend_data(data);
          continue;
        }
        if (this.e2a.length > 0) {
          const data = this.e2a;
          this.e2a = '';
          adapter_engine_data(data);
          continue;
        }
        if (this.frontendReady()) {
          const r = this.frontend!.next();
          if (r.done) {
            this.frontend = null;
            this.exit(0);
            break;
          }
          this.frontendWait = r.value;
          continue;
        }
        break;
      }
    } catch (e) {
      if (e instanceof ProcessExit) {
        this.exit(e.code);
      } else if (e instanceof Crash) {
        this.host.stderr('Segmentation fault\n');
        this.exit(139);
      } else {
        this.running = false;
        throw e;
      }
    }
    this.running = false;
  }

  /** whether the adapter has finished starting (the engine answered "uci") */
  get adapterReady(): boolean {
    return this.adapterStarted;
  }

  get engineQuitting(): boolean {
    return this.engineQuit;
  }

  /** UCI mode (-u): the main loop forwards stdin to the engine and the engine's output to stdout */
  private uciInput(line: string | null): void {
    // ForwardUserInputToEngine(): read() of what was typed (here: one line), plus a '\n'
    const data = (line ?? '') + '\n';
    if (line === null || data === 'quit\n' || data === 'quit\n\n') g.flags |= QUIT;
    this.host.engine.write(data);
    this.run();
    if (g.flags & QUIT) this.exit(0);
    else this.host.readLine();
  }

  /** the program ends: the threads are cancelled */
  exit(code: number): void {
    if (this.ended) return;
    this.ended = true;
    this.status = code;
    this.host.engine.stop();
    this.host.exit(code);
  }
}

/** exit() from inside the program (the adapter's my_fatal, ...) */
export class ProcessExit extends Error {
  code: number;
  constructor(code: number) {
    super(`exit ${code}`);
    this.code = code;
  }
}

/** The main loop of main(): it runs as a generator so that it can wait (solve) without blocking the page. */
function* mainLoop(proc: GnuChess): Generator<Wait, void, void> {
  if (g.flags & UCI) {
    // ForwardEngineOutputToUser() is the engine's output going to stdout (see uci mode in start())
    return;
  }
  while (!(g.flags & QUIT)) {
    /* Check if there is a new command from the user */
    yield* NextUserCmd();
    /* Show thinking message */
    if (g.flags & THINK && !(g.flags & MANUAL) && !(g.flags & ENDED)) {
      if (!(g.flags & XBOARD)) printf('Thinking...\n');
      g.flags &= ~THINK;
    }
    /* Check if there is a new command from the engine */
    NextEngineCmd();
    /* Check if user input ready for reading. If so, store it in a buffer. */
    ReadFromUser();
    /* Check if engine input ready for reading. If so, store it in a buffer. */
    ReadFromEngine();
    /* Check if engine thread is flagged to quit */
    if (proc.engineQuitting) break;
    /* Avoid using 100% CPU */
    yield 'idle';
  }
}

/** getopt_long() for "qehmpvxgM:ua:" and its long options: the options in order, and getopt's messages */
function parseArgs(argv: string[]): { opts: [string, string | null][]; errors: string[] } {
  const longs: Record<string, [string, boolean]> = {
    memory: ['M', true], version: ['v', false], quiet: ['q', false], silent: ['q', false], help: ['h', false],
    xboard: ['x', false], post: ['p', false], easy: ['e', false], manual: ['m', false], uci: ['u', false],
    addbook: ['a', true], graphic: ['g', false],
  };
  const withArg = new Set(['M', 'a']);
  const known = new Set('qehmpvxgMua'.split(''));
  const opts: [string, string | null][] = [];
  const errors: string[] = [];
  const prog = 'gnuchess';
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--') break;
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      const name = a.slice(2, eq < 0 ? undefined : eq);
      const matches = Object.keys(longs).filter((k) => k.startsWith(name));
      const exact = longs[name] ? name : matches.length === 1 ? matches[0] : null;
      if (!exact) {
        errors.push(matches.length > 1 ? `${prog}: option '${a}' is ambiguous\n` : `${prog}: unrecognized option '${a}'\n`);
        opts.push(['?', null]);
        continue;
      }
      const [c, needs] = longs[exact];
      if (needs) {
        if (eq >= 0) opts.push([c, a.slice(eq + 1)]);
        else if (i + 1 < argv.length) opts.push([c, argv[++i]]);
        else {
          errors.push(`${prog}: option '--${exact}' requires an argument\n`);
          opts.push(['?', null]);
        }
      } else if (eq >= 0) {
        errors.push(`${prog}: option '--${exact}' doesn't allow an argument\n`);
        opts.push(['?', null]);
      } else opts.push([c, null]);
    } else if (a.startsWith('-') && a.length > 1) {
      for (let j = 1; j < a.length; j++) {
        const c = a[j];
        if (!known.has(c)) {
          errors.push(`${prog}: invalid option -- '${c}'\n`);
          opts.push(['?', null]);
          continue;
        }
        if (withArg.has(c)) {
          if (j + 1 < a.length) opts.push([c, a.slice(j + 1)]);
          else if (i + 1 < argv.length) opts.push([c, argv[++i]]);
          else {
            errors.push(`${prog}: option requires an argument -- '${c}'\n`);
            opts.push(['?', null]);
          }
          break;
        }
        opts.push([c, null]);
      }
    }
  }
  return { opts, errors };
}

/** every frontend module's state as a fresh process has it */
function resetFrontend(): void {
  engineReset();
  inputReset();
  cmdReset();
  lexReset();
  playersReset();
  epdReset();
  pipes.i2f = '';
  pipes.a2f = '';
  g.GameCnt = g.RealGameCnt = g.RealSide = g.computer = 0;
  g.flags = g.preanalyze_flags = 0;
  g.HashKey = g.PawnHashKey = 0n;
  g.Game50 = g.GenCnt = 0;
  g.SANmv = g.id = g.solution = '';
  g.SearchTime = g.TCMove = g.TCinc = g.TCTime = g.phase = 0;
  g.bookfirstlast = g.graphicmodeoutput = g.coords = g.pgnloaded = g.pgncnt = 0;
  g.myrating = g.opprating = 0;
  g.name = '';
  g.computerplays = g.n = 0;
  MoveLimit[0] = MoveLimit[1] = 0;
  TimeLimit[0] = TimeLimit[1] = 0;
  ExchCnt[0] = ExchCnt[1] = 0;
  cboard.fill(0);
  Mvboard.fill(0);
  TreePtr.fill(0);
  for (let i = 0; i < Game.length; i++) Game[i] = newGameRec();
  clearBoard(board);
}
