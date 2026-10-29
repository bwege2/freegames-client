// FreeCol's AI players act in threads of their own (AIPlayer.invoke starts one per action), and the
// server serves them on those threads. The browser has one thread, so the port schedules them as the
// original's threads in practice run (the test oracle compares the games turn by turn):
// - an answer to the server (a name for a new region, a founding father, a reply in diplomacy) runs when
//   the server has finished the request it is busy with, before the AI asks anything else;
// - a whole turn (setCurrentPlayerHandler: startWorking, then end the turn) runs after that, once the
//   server's current work is done, as the original's turn thread runs once the previous one ended its turn.
import { $J, Thread } from '../jre/index.ts';

let turnInvoke = 0;
let depth = 0;
const answers: (() => void)[] = [];

/** Runs the queued answers, in the order the original's threads were started. */
let draining = false;
export function drainAnswers() {
  if (draining) return; // one answer at a time, in order
  draining = true;
  try {
    while (answers.length) answers.shift()!();
  } finally {
    draining = false;
  }
}

/** A request to the server from outside the AI (a human player's): the answers it causes run after it. */
export function serverRequest<T>(f: () => T): T {
  if (depth === 0) drainAnswers();
  depth++;
  try {
    return f();
  } finally {
    depth--;
    if (depth === 0) drainAnswers();
  }
}

export function installThreadModel(java: (name: string) => any) {
  const AIPlayer = java('net.sf.freecol.server.ai.AIPlayer');
  const FreeCol = java('net.sf.freecol.FreeCol');
  const DummyConnection = java('net.sf.freecol.server.networking.DummyConnection');
  const setCurrentPlayer = AIPlayer.prototype.setCurrentPlayerHandler;
  AIPlayer.prototype.setCurrentPlayerHandler = function (currentPlayer: any) {
    turnInvoke++;
    try {
      return setCurrentPlayer.call(this, currentPlayer);
    } finally {
      turnInvoke--;
    }
  };
  AIPlayer.prototype.invoke = function (runnable: any) {
    const thread = new Thread(runnable, FreeCol.SERVER_THREAD + 'AIPlayer(' + this.getPlayer().getName() + ')');
    AIPlayer.logger.finest('Started ' + $J.str(thread));
    if (turnInvoke > 0) {
      $J.startThread({ run: () => { drainAnswers(); thread.run(); drainAnswers(); } });
    } else {
      answers.push(runnable);
    }
  };
  // a request to the server: when the outermost one is done, the answers queued meanwhile get their turn
  const askMessage = DummyConnection.prototype.askMessage;
  DummyConnection.prototype.askMessage = function (...a: any[]) {
    // answers started before this request reach the server first (their threads were started first)
    if (depth === 0) drainAnswers();
    depth++;
    try {
      return askMessage.apply(this, a);
    } finally {
      depth--;
      if (depth === 0) drainAnswers();
    }
  };
}
