// Online play: where the moves of a turn come from. Locally (`moves` null) the game is the original.
// Online, every decision a player makes in a turn (the "Done" button, a cannon's angle and powder and
// whether to fire, an audience with the king, the market and its buttons, a brick) is a Move: the
// player's own client makes it with the original's dialogs and commits it (sends it to everyone and
// waits until the server relays it back, in the server's order); the other client receives it and
// carries it out with the same code. online.ts implements it.

export type Move =
  | { kind: 'done' }
  | { kind: 'cannon'; k: number; w: number; p: number; fire: boolean }
  | { kind: 'king' }
  | { kind: 'market' }
  | { kind: 'marketButton'; button: number }
  | { kind: 'brick'; x: number; y: number }
  | { kind: 'bricksDone' };

/** where the game waits for a move: the turn's click, the market dialog, laying bricks */
export type MoveContext = 'turn' | 'market' | 'bricks';

export interface Moves {
  /** the moves of the castle `n` come from the server (the opponent's, or the replay of the round so far) */
  remote(n: number): boolean;
  /** the next move for this context (others are dropped); null: the program ends. A move that ends the
   *  turn (done, a shot) arriving inside the market or while laying bricks throws TurnEnd. */
  next(ctx: MoveContext): Promise<Move | null>;
  /** our own move: send it and wait until the server relays it back */
  commit(m: Move): Promise<void>;
  /** the game is over (ein_zug's end code): tell the server */
  gameOver(end: number): void;
  /** the Esc key: online there are no settings; it asks whether to leave */
  escape(): Promise<number>;
}

export let moves: Moves | null = null;

export function setMoves(m: Moves | null): void {
  moves = m;
}

/** a turn-ending move of the opponent that arrived inside the market or while laying bricks */
export class TurnEnd extends Error {
  readonly move: Move;
  constructor(move: Move) {
    super('turn end');
    this.move = move;
  }
}
