// Maelstrom online messages: one input byte per 30 Hz frame, the room options
// (co-op/deathmatch and the frag target) and the final report. The server
// module relays the input with the sender's seat; clients never send state.
import { packGame, unpackGame } from '../../../src/sdk/index.ts';
import { defaultInput, type InputState, type MaelstromGame } from './sim.ts';
import {
  Mode, Msg, Options, Results, Reason,
  type Msg as MsgType,
} from './proto/maelstrom.ts';

export const BUTTON = {
  thrust: 1, brake: 2, left: 4, right: 8, shield: 16, fire: 32,
} as const;

export function encodeInput(i: InputState): number {
  return (i.thrust ? BUTTON.thrust : 0) | (i.brake ? BUTTON.brake : 0)
    | (i.left ? BUTTON.left : 0) | (i.right ? BUTTON.right : 0)
    | (i.shield ? BUTTON.shield : 0) | (i.fire ? BUTTON.fire : 0);
}

export function decodeInput(n: number): InputState {
  const i = defaultInput();
  i.thrust = (n & BUTTON.thrust) !== 0;
  i.brake = (n & BUTTON.brake) !== 0;
  i.left = (n & BUTTON.left) !== 0;
  i.right = (n & BUTTON.right) !== 0;
  i.shield = (n & BUTTON.shield) !== 0;
  i.fire = (n & BUTTON.fire) !== 0;
  return i;
}

export function packOptions(mode: 'coop' | 'deathmatch', fragTarget = 10): Uint8Array {
  return packGame(Options, (o) => {
    o.mode = mode === 'deathmatch' ? Mode.DEATHMATCH : Mode.COOP;
    o.fragTarget = Math.max(1, Math.min(99, fragTarget));
  });
}

export function readOptions(data: Uint8Array): { mode: 'coop' | 'deathmatch'; fragTarget: number } {
  if (data.length === 0) return { mode: 'coop', fragTarget: 10 };
  const o = unpackGame(Options, data);
  return { mode: o.mode === Mode.DEATHMATCH ? 'deathmatch' : 'coop',
    fragTarget: o.fragTarget >= 1 ? o.fragTarget : 10 };
}

export function packInput(frame: number, buttons: number): Uint8Array {
  return packGame(Msg, (m) => {
    const i = m._initInput();
    i.frame = frame >>> 0;
    i.buttons = buttons & 0x3f;
    i.seat = 255;
  });
}

export function readInput(msg: MsgType): { seat: number; frame: number; buttons: number } | null {
  if (!msg._isInput) return null;
  const i = msg.input;
  return { seat: i.seat, frame: i.frame, buttons: i.buttons & 0x3f };
}

export function packDone(game: MaelstromGame): Uint8Array {
  return packGame(Msg, (m) => {
    const d = m._initDone();
    d.wave = game.wave;
    const scores = d._initScores(game.numPlayers);
    const frags = d._initFrags(game.numPlayers);
    game.players.forEach((p, i) => { scores.set(i, p.score); frags.set(i, p.frags); });
  });
}

export interface OnlineResults {
  mode: 'coop' | 'deathmatch';
  wave: number;
  agreed: boolean;
  scores: number[];
  frags: number[];
  reason: 'done' | 'timeout' | 'left' | 'disagreed';
}

export function readResults(data: Uint8Array): OnlineResults {
  const r = unpackGame(Results, data);
  const scores: number[] = [], frags: number[] = [];
  for (let i = 0; i < r.scores.length; i++) scores.push(r.scores.get(i));
  for (let i = 0; i < r.frags.length; i++) frags.push(r.frags.get(i));
  return { mode: r.mode === Mode.DEATHMATCH ? 'deathmatch' : 'coop', wave: r.wave,
    agreed: r.agreed, scores, frags,
    reason: r.reason === Reason.TIMEOUT ? 'timeout' : r.reason === Reason.LEFT ? 'left'
      : r.reason === Reason.DISAGREED ? 'disagreed' : 'done' };
}
