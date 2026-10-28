// Two people play each other online in GNU Chess's manual mode (`gnuchess -m`: the program only checks
// and records the moves, as when two people share it at one terminal). Each player runs the program;
// seat 0 plays White, seat 1 Black. A move the player types is checked by the program's own move
// reader (ValidateMove, without printing) and sent to the server (protocol/games/gnuchess.capnp); the
// server module keeps the game and sends every move it takes to both. Only then is the line typed into
// the program, the player's own as they typed it, the opponent's in coordinates (e7e5): both programs
// see the same game. While the game runs, the commands that would change the game on one side only
// (new, undo, setboard, load, go, ...) are refused; resign and draw (offer, or accept an offer) are
// the online game's own (README). The round ends when the module says so (mate, stalemate, the
// adapter's draw rules, a resignation, an agreed draw, a player leaving).
import { packGame, unpackGame, SERVER_SEAT, type GameMessage, type RoundStart } from '../../../src/sdk/index.ts';
import { Msg, Results, Outcome, Reason, Promotion } from './proto/gnuchess.ts';
import { FROMSQ, PROMOTEPIECE, TOSQ, Tree, algbr, board, g } from './frontend/common.ts';
import { ValidateMove } from './frontend/move.ts';
import { stdio } from './frontend/stdio.ts';
import { commandNames } from './frontend/cmd.ts';
import type { ChessPage } from './index.ts';

/** the program's commands that would change the game on this side only */
const REFUSED = new Set([
  'new', 'undo', 'remove', 'setboard', 'load', 'epdload', 'pgnload', 'pgnreplay', 'next', 'n', 'previous', 'p',
  'first', 'last', 'go', 'white', 'black', 'switch', 'edit', 'xboard', 'analyze', 'solve', 'solveepd', 'usermove', '?', 'exit',
]);
const COMMANDS = new Set(commandNames);

const PROMO_LETTER = ['', 'n', 'b', 'r', 'q'];

interface ServerMove {
  ply: number;
  from: number;
  to: number;
  promotion: number;
}

export class OnlineGame {
  private readonly page: ChessPage;
  readonly round: RoundStart;
  /** 0 White, 1 Black (the frontend's colours) */
  private readonly colour: number;
  private readonly opponent: string;
  /** the moves the server has taken (and that went into the program, or are waiting to) */
  private plies = 0;
  /** lines to type into the program (the opponent's moves, a game coming back; echo: shown as typed) */
  private queue: { line: string; echo: boolean }[] = [];
  /** the player's move, sent to the server, typed once the server takes it */
  private pending: { line: string; move: ServerMove } | null = null;
  private pendingTimer: ReturnType<typeof setTimeout> | null = null;
  private over = false;
  private off: (() => void)[] = [];
  private done: ((again: boolean) => void) | null = null;
  private retry: (() => void) | null = null;

  constructor(page: ChessPage, round: RoundStart) {
    this.page = page;
    this.round = round;
    this.colour = round.you === 0 ? 0 : 1;
    this.opponent = round.seats.find((s) => s.seat !== round.you)?.name ?? 'your opponent';
  }

  /** the round, until it is over and the player chose: true = another round (the lobby), false = leave */
  play(): Promise<boolean> {
    const rooms = this.page.ctx.rooms;
    const take = (m: GameMessage): void => {
      if (m.from !== SERVER_SEAT) return;
      let msg: Msg;
      try {
        msg = unpackGame(Msg, m.data);
      } catch {
        return;
      }
      this.fromServer(msg);
    };
    this.off.push(rooms.on('message', take));
    for (const m of this.page.takeEarly()) take(m);
    // back in a running game (a reload, a dropped connection): the game so far
    const askHistory = (): void => rooms.send(packGame(Msg, (m) => {
      m.historyRequest = true;
    }), 'server');
    if (this.round.rejoined) askHistory();
    this.off.push(rooms.on('started', (r) => {
      if (r.round === this.round.round && r.rejoined) askHistory();
    }));
    this.off.push(rooms.on('finished', (f) => this.finished(f.results)));
    this.off.push(rooms.on('closed', () => this.end(false)));
    const you = this.colour === 0 ? 'White' : 'Black';
    this.page.status.textContent = `Online: you play ${you} against ${this.opponent}.`;
    this.page.terminal.write(`\n[Online game against ${this.opponent}: you play ${you}. Type your moves as in GNU Chess; resign, draw (to offer or accept a draw) and quit (to leave) as well.]\n`);
    this.page.run(['-m'], { online: this });
    return new Promise((resolve) => {
      this.done = resolve;
    });
  }

  /** the next line the online game types into the program, if any */
  nextLine(): { line: string; echo: boolean } | undefined {
    return this.queue.shift();
  }

  /** the player typed a line: deliver() gives a line to the program, again() reads another one */
  typed(line: string, deliver: (l: string) => void, again: () => void): void {
    const t = line.trim();
    const word = t.split(/\s+/)[0] ?? '';
    if (this.over) {
      deliver(line);
      return;
    }
    if (word === 'resign') {
      this.page.ctx.rooms.send(packGame(Msg, (m) => {
        m.resign = true;
      }), 'server');
      again();
      return;
    }
    if (word === 'draw') {
      this.page.ctx.rooms.send(packGame(Msg, (m) => {
        m.drawOffer = true;
      }), 'server');
      again();
      return;
    }
    if (word === 'quit') {
      // leaving the room ends the round: the opponent wins
      this.page.ctx.rooms.leave();
      this.end(false);
      return;
    }
    if (REFUSED.has(word)) {
      this.say(`${word}: not in an online game.`);
      again();
      return;
    }
    if (COMMANDS.has(word) || t === '') {
      deliver(line);
      return;
    }
    // a move: only on the player's turn
    if (board.side !== this.colour) {
      this.say('It is not your move.');
      again();
      return;
    }
    // the program's own reader decides whether it is one, without printing anything
    const out = stdio.stdout;
    stdio.stdout = () => {};
    let ptr = -1;
    try {
      ptr = ValidateMove(t);
    } finally {
      stdio.stdout = out;
    }
    if (ptr === -1) {
      deliver(line); // the program says what is wrong with it
      return;
    }
    const mv = Tree.move[ptr];
    const promo = PROMOTEPIECE(mv);
    const move: ServerMove = { ply: g.GameCnt + 1, from: FROMSQ(mv), to: TOSQ(mv), promotion: promo ? promo - 1 : 0 };
    this.pending = { line, move };
    this.retry = again;
    this.page.ctx.rooms.send(packGame(Msg, (m) => {
      const x = m._initMove();
      x.ply = move.ply;
      x.from = move.from;
      x.to = move.to;
      x.promotion = move.promotion as Promotion;
    }), 'server');
    this.pendingTimer = setTimeout(() => {
      if (!this.pending) return;
      this.pending = null;
      this.say('The server did not take the move.');
      this.retry?.();
    }, 15000);
  }

  private say(text: string): void {
    this.page.terminal.write(`[${text}]\n`);
    // the program's prompt again: the line it waits for is still to come
    this.page.terminal.writeBytes(`${g.RealSide ? 'Black' : 'White'} (${Math.trunc((g.RealGameCnt + 1) / 2) + 1}) : `);
  }

  private fromServer(msg: Msg): void {
    if (msg._isMove) {
      const m = msg.move;
      this.serverMove({ ply: m.ply, from: m.from, to: m.to, promotion: m.promotion as number });
    } else if (msg._isDrawOffered) {
      const seat = msg.drawOffered;
      this.say(seat === this.round.you ? 'You offer a draw.' : `${this.opponent} offers a draw: type draw to accept it.`);
    } else if (msg._isHistory) {
      const h = msg.history;
      for (let i = 0; i < h.moves.length; i++) {
        const m = h.moves.get(i);
        this.serverMove({ ply: m.ply, from: m.from, to: m.to, promotion: m.promotion as number });
      }
      if (h.drawOffer !== 255) {
        this.say(h.drawOffer === this.round.you ? 'You offered a draw.' : `${this.opponent} offers a draw: type draw to accept it.`);
      }
    }
  }

  private serverMove(m: ServerMove): void {
    if (m.ply !== this.plies) return; // one we have (a history after a reconnect)
    this.plies++;
    const p = this.pending;
    if (p && p.move.ply === m.ply && p.move.from === m.from && p.move.to === m.to && p.move.promotion === m.promotion) {
      // ours, taken: now it goes into the program as typed
      this.pending = null;
      if (this.pendingTimer) clearTimeout(this.pendingTimer);
      this.queue.push({ line: p.line, echo: false }); // the terminal showed it when it was typed
      this.page.interrupt();
      this.kick();
      return;
    }
    this.pending = null;
    this.queue.push({ line: algbr[m.from] + algbr[m.to] + (PROMO_LETTER[m.promotion] ?? ''), echo: true });
    this.page.interrupt();
    this.kick();
  }

  /** a line waits: if the program waits for one and no read is open (our move was pending), start it */
  private kick(): void {
    if (this.retry && this.queue.length) {
      const r = this.retry;
      this.retry = null;
      r();
    }
  }

  private finished(data: Uint8Array): void {
    let text = 'The game is over.';
    try {
      const r = unpackGame(Results, data);
      const score = r.outcome === Outcome.WHITE_WINS ? '1-0' : r.outcome === Outcome.BLACK_WINS ? '0-1' : '1/2-1/2';
      const loser = r.outcome === Outcome.WHITE_WINS ? 'Black' : 'White';
      switch (r.reason) {
        case Reason.RESIGNATION: text = `${score} {${loser} resigns}`; break;
        case Reason.AGREEMENT: text = `${score} {Draw by agreement}`; break;
        case Reason.LEFT: text = `${score} {${loser} left the game}`; break;
        case Reason.CHECKMATE: text = `${score} {${loser === 'Black' ? 'White' : 'Black'} mates}`; break;
        case Reason.STALEMATE: text = `${score} {Stalemate}`; break;
        case Reason.FIFTY_MOVES: text = `${score} {Draw by fifty-move rule}`; break;
        case Reason.REPETITION: text = `${score} {Draw by repetition}`; break;
        case Reason.MATERIAL: text = `${score} {Draw by insufficient material}`; break;
      }
    } catch {
      /* the text above */
    }
    this.over = true;
    this.page.terminal.write(`\n[Game over: ${text}. The board is yours now (pgnsave FILE keeps the game).]\n`);
    this.page.status.textContent = `Game over: ${text}`;
    const again = Object.assign(document.createElement('button'), { textContent: 'Play again' });
    const leave = Object.assign(document.createElement('button'), { textContent: 'Leave' });
    again.addEventListener('click', () => this.end(true), { signal: this.page.ctx.signal });
    leave.addEventListener('click', () => {
      this.page.ctx.rooms.leave();
      this.end(false);
    }, { signal: this.page.ctx.signal });
    this.page.status.append(' ', again, ' ', leave);
  }

  /** the program ended (quit) */
  programEnded(_code: number): void {
    if (!this.over) this.page.ctx.rooms.leave();
    this.end(false);
  }

  private end(again: boolean): void {
    const d = this.done;
    this.done = null;
    this.close();
    d?.(again);
  }

  close(): void {
    for (const f of this.off.splice(0)) f();
    if (this.pendingTimer) clearTimeout(this.pendingTimer);
    this.pendingTimer = null;
  }
}
