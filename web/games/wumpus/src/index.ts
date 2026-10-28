// Hunt the Wumpus on the website: the ported program (game.ts) on the SDK's teletype, 72 columns like
// the Teletype ASR-33 it was played on, which had no lower case: typed letters print in capitals.
import { Teletype, type StartGame } from '../../../src/sdk/index.ts';
import { wumpus } from './game.ts';

export const start: StartGame = (host, ctx) => {
  const tty = new Teletype(host, { cols: 72, rows: 24, foreground: '#1c1b19', background: '#f2eee3' }, ctx.signal);
  const upper = (s: string) => s.toUpperCase();
  wumpus({
    print: (s) => tty.write(s),
    input: () => tty.readLine({ transform: upper, maxLength: 72 }),
    rnd: Math.random,
  }).catch(() => { /* the game stopped: its pending input was cancelled */ });
  return {
    stop() {
      // the teletype, its listeners and the waiting input end with ctx.signal
    },
  };
};
