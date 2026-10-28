// Port of src/frontend/input.cc of GNU Chess 6.3.0: the input thread. It prints the prompt and reads one
// line of the player's input (fgets, at most MAXSTR-1 bytes), sends it to the frontend and then waits
// until the frontend wakes it up (input_wakeup) for the next one. Built without readline, as the
// prompt then is the program's own. The thread is a small state machine: the process asks the
// terminal for a line (`inputHost.readLine`) and hands it back with input_line().
import { MAXSTR, QUIT, XBOARD, g } from './common.ts';
import { pipes } from './engine.ts';
import { stdio } from './stdio.ts';
import { sprintf } from '../libc.ts';

export const inputHost = {
  /** fgets(userinputstr, MAXSTR, stdin) starts: answer with input_line() */
  readLine: (): void => {},
};

const inp = {
  /** wait_for_input */
  wait_for_input: 1,
  /** where the thread is: waiting for a wakeup, reading a line, or ended */
  state: 'waiting' as 'waiting' | 'reading' | 'done',
  userinputstr: '',
};

export function inputReset(): void {
  inp.wait_for_input = 1;
  inp.state = 'waiting';
  inp.userinputstr = '';
}

/** The thread starts (InitInputThread): wait_for_input is 1, so it prompts at once. */
export function input_start(): void {
  loop();
}

/** while (!(flags & QUIT)) { wait for wait_for_input; prompt; get_line } */
function loop(): void {
  if (inp.state !== 'waiting') return;
  if (g.flags & QUIT) {
    inp.state = 'done';
    return;
  }
  let prompt = '';
  if (!(g.flags & XBOARD)) {
    if (!inp.wait_for_input) return; // pthread_cond_wait
    prompt = sprintf('%s (%d) : ', g.RealSide ? 'Black' : 'White', Math.trunc((g.RealGameCnt + 1) / 2) + 1);
  }
  // getline_standard(prompt)
  if (!(g.flags & XBOARD)) stdio.stdout(prompt);
  inp.state = 'reading';
  inputHost.readLine();
}

/** fgets() returned: the line (with its '\n', at most MAXSTR-1 bytes), or null at end of file */
export function input_line(line: string | null): void {
  if (inp.state !== 'reading') return;
  if (line === null) g.flags |= QUIT;
  else inp.userinputstr = line.slice(0, MAXSTR - 1);
  // SendToFrontend( userinputstr )
  pipes.i2f += inp.userinputstr;
  inp.wait_for_input = 0;
  inp.state = 'waiting';
  /* TODO Improve this test */
  if (inp.userinputstr.startsWith('quit')) {
    inp.state = 'done';
    return;
  }
  loop();
}

/** input_wakeup(): the frontend has handled the line; the thread may read the next one */
export function input_wakeup(): void {
  inp.wait_for_input = 1;
  loop();
}

/** whether the thread is blocked in fgets (the process uses it to know when the program waits for the player) */
export const input_reading = (): boolean => inp.state === 'reading';
