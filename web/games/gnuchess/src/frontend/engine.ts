// Port of src/frontend/engine.cc of GNU Chess 6.3.0: how the frontend talks to the adapter (and through
// it to the engine): what it sends, how it reads the answers line by line, and when it lets the input
// thread read the next command. The pipes are the process's (../main.ts): the frontend writes the
// adapter's pipe through `pipes.toAdapter`, and select()+read() on its own pipes become reads of
// `pipes.i2f` (from the input thread) and `pipes.a2f` (from the adapter).
import { BUF_SIZE, Game, MANUAL, XBOARD, board, g } from './common.ts';
import { MakeMove, SANMove, ValidateMove } from './move.ts';
import { ShowBoard } from './output.ts';
import { printf } from './stdio.ts';
import { Tree } from './common.ts';
import { sprintf } from '../libc.ts';

/** what the frontend thread waits for when it yields: its main loop's sleep, or the adapter's lines (solve) */
export type Wait = 'idle' | 'engine';

/** The frontend's ends of its pipes, set by the process */
export const pipes = {
  /** write( pipefd_f2a[1], ... ) */
  toAdapter: (_data: string): void => {},
  /** unread data in pipefd_i2f (from the input thread) */
  i2f: '',
  /** unread data in pipefd_a2f (from the adapter) */
  a2f: '',
  /** input_wakeup(): the input thread may print the prompt and read the next line (input.ts) */
  wakeup: (): void => {},
};

/** inputstr: the command being parsed */
export const fe = {
  inputstr: '',
  /** char inputstr[BUF_SIZE]: the whole buffer; what a shorter command does not overwrite stays in it */
  inputmem: '\0'.repeat(BUF_SIZE),
  /* Message to be sent to the engine */
  dataToEngine: '',
  /* Whether an answer is expected from the engine or not, as a result of a command send to it. */
  answerFromEngineExpected: false,
  /* Buffer storing the input entered by the user */
  userinputbuf: '',
  /* Buffer storing the input coming from the engine */
  engineinputbuf: '',
  /* Whether the input is a move or not (if not, it is expected to be a command). */
  userInputIsAMove: 0,
  /* Flags that the color must be changed */
  changeColor: false,
  /* Flags whether a go command must be sent after a user move. */
  autoGo: false,
};

export function engineReset(): void {
  fe.inputstr = '';
  fe.inputmem = '\0'.repeat(BUF_SIZE);
  fe.dataToEngine = '';
  fe.answerFromEngineExpected = false;
  fe.userinputbuf = '';
  fe.engineinputbuf = '';
  fe.userInputIsAMove = 0;
  fe.changeColor = false;
  fe.autoGo = false;
}

/** the frontend's parser of user input (cmd.ts), set there (it imports this module); a generator because `solve` waits for the engine */
export const parser = { parse_input: function* (): Generator<Wait, void, void> {} };

/** Sends a char string message from the frontend to the adapter/engine: the message and a '\n'. */
export function SendToEngine(msg: string): number {
  pipes.toAdapter(msg + '\n');
  return 1;
}

/** Reads what the adapter wrote into 'engineinputbuf'; returns whether there was something (select() > 0). */
export function ReadFromEngine(): number {
  if (pipes.a2f.length === 0) return 0;
  // read(pipefd_a2f[0], engineinputaux, BUF_SIZE)
  let nread = Math.min(pipes.a2f.length, BUF_SIZE);
  const data = pipes.a2f.slice(0, nread);
  pipes.a2f = pipes.a2f.slice(nread);
  const prev_len = fe.engineinputbuf.length;
  const nremaining = BUF_SIZE - prev_len - 1;
  if (nread > nremaining) {
    printf('Overflow reading engine input. Some input has been cut off.\n');
    nread = nremaining;
  }
  fe.engineinputbuf += data.slice(0, nread);
  return 1;
}

/** Reads what the input thread sent into 'userinputbuf'. */
export function ReadFromUser(): void {
  if (pipes.i2f.length === 0) return;
  let nread = Math.min(pipes.i2f.length, BUF_SIZE);
  const data = pipes.i2f.slice(0, nread);
  pipes.i2f = pipes.i2f.slice(nread);
  const prev_len = fe.userinputbuf.length;
  const nremaining = BUF_SIZE - prev_len - 1;
  if (nread > nremaining) {
    printf('Overflow reading user input. Some input has been cut off.\n');
    nread = nremaining;
  }
  fe.userinputbuf += data.slice(0, nread);
}

/** Saves in 'dataToEngine' the data to be sent to the engine. */
export function SetDataToEngine(data: string): void {
  fe.dataToEngine = data;
}

function GetDataToEngine(): boolean {
  return fe.dataToEngine !== '';
}

export function ExpectAnswerFromEngine(answerExpected: boolean | number): void {
  fe.answerFromEngineExpected = !!answerExpected;
}

function AnswerFromEngineExpected(): boolean {
  return fe.answerFromEngineExpected;
}

/** Extracts a command from the user input buffer; sends what must be sent to the engine. */
export function* NextUserCmd(): Generator<Wait, void, void> {
  if (fe.userinputbuf.length > 0) {
    const userinput = GetNextLine('user');
    if (userinput !== null) {
      fe.inputstr = userinput;
      // strcpy( inputstr, userinput )
      fe.inputmem = (userinput + '\0' + fe.inputmem.slice(userinput.length + 1)).slice(0, BUF_SIZE);
      yield* parser.parse_input();
      /* Check if command/move must be sent to engine */
      if (GetDataToEngine()) {
        SendToEngine(fe.dataToEngine);
        if (GetAutoGo() && UserInputIsAValidMove()) {
          fe.userinputbuf = 'go\n';
          SetAutoGo(false);
        }
      }
      /* Check if command was entered in manual mode */
      if (g.flags & MANUAL && UserInputIsAValidMove()) {
        g.RealGameCnt = g.GameCnt;
        g.RealSide = board.side;
      }
      /* Check if the color must be changed, e.g. after an undo command. */
      if (fe.changeColor) {
        g.RealGameCnt = g.GameCnt;
        g.RealSide = board.side;
      }
      if (!AnswerFromEngineExpected() || g.flags & MANUAL) pipes.wakeup();
    }
  }
}

/** Extracts a command from the engine input buffer. If the command is a move, the move is made. */
export function NextEngineCmd(): void {
  if (fe.engineinputbuf.length > 0) {
    const engineinput = GetNextLine('engine');
    if (engineinput !== null) {
      if (engineinput.startsWith('move')) {
        /* Input from engine is a move */
        const m = /^move\s*(\S*)/.exec(engineinput);
        const enginemovestr = m ? m[1] : '';
        const enginemove = ValidateMove(enginemovestr);
        if (enginemove === -1) {
          /* Bad move from engine */
        } else {
          SANMove(Tree.move[enginemove], 1);
          Tree.move[enginemove] = MakeMove(board.side, Tree.move[enginemove]);
          Game[g.GameCnt].SANmv = g.SANmv;
          if (!(g.flags & XBOARD)) {
            ShowBoard();
            printf('\nMy move is : %s\n', g.SANmv);
          } else {
            printf('%d. ... %s\n', Math.trunc(g.GameCnt / 2) + 1, enginemovestr);
            printf('My move is : %s\n', enginemovestr);
          }
          g.RealGameCnt = g.GameCnt;
          /* Check if the color must be changed, e.g. after a go command. */
          if (fe.changeColor) {
            g.RealGameCnt = g.GameCnt;
            g.RealSide = board.side;
          }
          pipes.wakeup();
        }
      } else {
        printf('%s', engineinput);
        if (AnswerFromEngineExpected()) pipes.wakeup();
      }
    }
  }
}

export function SetUserInputValidMove(valid: number): void {
  fe.userInputIsAMove = valid;
}

function UserInputIsAValidMove(): number {
  return fe.userInputIsAMove;
}

/**
 * Extracts a line from the buffer (fe.userinputbuf or fe.engineinputbuf); the end-of-line character is
 * kept. Returns null when the buffer has no complete line.
 */
function GetNextLine(which: 'user' | 'engine'): string | null {
  const buf = which === 'user' ? fe.userinputbuf : fe.engineinputbuf;
  const nl = buf.indexOf('\n');
  if (nl < 0) return null;
  const line = buf.slice(0, nl + 1);
  if (which === 'user') fe.userinputbuf = buf.slice(nl + 1);
  else fe.engineinputbuf = buf.slice(nl + 1);
  return line;
}

/** Gets a line from the engine buffer without removing it; null when there is no complete line */
function GetNextLineNoRemove(): string | null {
  const nl = fe.engineinputbuf.indexOf('\n');
  return nl < 0 ? null : fe.engineinputbuf.slice(0, nl + 1);
}

/** Flags whether the color must be changed, e.g. due to an undo command. */
export function ChangeColor(change: boolean | number): void {
  fe.changeColor = !!change;
}

/** Sets the autoGo flag, meaning that after a user move a go command will be sent to the engine. */
export function SetAutoGo(go: boolean | number): void {
  fe.autoGo = !!go;
}

export function GetAutoGo(): boolean {
  return fe.autoGo;
}

/** C's round() for SearchTime (a float) */
const cround = (x: number): number => (x < 0 ? -Math.round(-x) : Math.round(x));

/**
 * Solves a position given in an EPD file: sends it with "st N" and "go", prints what comes back until
 * the move, makes the move (NextEngineCmd) and returns it in SAN. The original busy-waits for the
 * adapter's lines; this generator yields until more of them arrive.
 */
export function* SolvePosition(position: string): Generator<Wait, string, void> {
  printf('\nSolve position:\n\t%s\n', position);

  /* Send position to adapter/engine. */
  let msg = 'setboard ' + position;
  msg = msg.slice(0, msg.length - 1);
  SendToEngine(msg);

  /* Set adapter/engine to analyse. */
  SendToEngine(sprintf('st %d\ngo', cround(g.SearchTime)));

  /* Read adapter/engine's answer (the move). */
  for (;;) {
    ReadFromEngine();
    const engineinput = GetNextLineNoRemove();
    if (engineinput !== null) {
      if (engineinput.startsWith('move')) break;
      GetNextLine('engine');
      printf('%s\n', engineinput);
      continue;
    }
    yield 'engine'; // sleep( 0 ): until the adapter writes more
  }
  NextEngineCmd();
  return g.SANmv;
}
