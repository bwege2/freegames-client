// OpenClonk online (protocol/games/openclonk.capnp, server/.../games/openclonk/OpenclonkModule.java): the original's
// network game in lockstep through the site's rooms. The server module is the host in central mode
// (C4GameControlNetwork, CNM_Central): every browser sends its control for each control tick, the module sends
// everyone the tick's complete control in client ID order, and every browser executes it at the tick's frame.
// This module packs and reads the schema's messages with the SDK; the browser's side of the round is the original's control
// queue in network mode with src/net.ts in C4Network2's place.
import { packGame, unpackGame, bytes, setData, type RoundStart, type Rooms } from '../../../src/sdk/index.ts';
import {
  Msg, Options, Mode, Results, Reason, SeatEventKind,
  type Tick as TickStruct, type SyncCheck as SyncCheckStruct, type RoundResults as RoundResultsStruct,
} from './proto/openclonk.ts';

/** C4SyncCheckRate: a sync check after every 100 frames */
export const SYNC_RATE = 100;
/** Config.Network.ControlRate's default, and C4MaxControlRate */
export const DEFAULT_CONTROL_RATE = 3, MAX_CONTROL_RATE = 20;
/** Config.Network.AsyncMaxWait's default (frames) */
export const DEFAULT_ASYNC_MAX_WAIT = 2;
/** the module's limit on one seat's control for a tick */
export const CONTROL_BYTES = 32 * 1024;

/** A seat's client ID (C4ClientIDStart = 1 for seat 0): what its control packets' iByClient must be. */
export const clientId = (seat: number): number => seat + 1;

/** C4Game::RandomSeed (an int32) from the round's seed, the same in every browser. */
export const randomSeed = (round: RoundStart): number => Number(BigInt.asIntN(32, round.seed));

export type ControlMode = 'central' | 'async';

/** The room options (C4GameParameters, Config.Network). */
export interface OnlineOptions {
  /** "Missions.ocf/AcidDrilling.ocs" */
  scenario: string;
  /** frames per control tick, 1..20 */
  controlRate: number;
  /** 0: the scenario's MaxPlayer */
  maxPlayers: number;
  mode: ControlMode;
  /** frames a tick waits for a late seat in async mode */
  asyncMaxWait: number;
}

export type SeatEventName = 'join' | 'deactivate' | 'activate' | 'remove';
const EVENTS: readonly SeatEventName[] = ['join', 'deactivate', 'activate', 'remove'];

/** What the host does to a seat's client (C4ControlClientJoin / ClientUpdate / ClientRemove). */
export interface SeatEvent {
  seat: number;
  kind: SeatEventName;
}

/** One seat's control in a tick: a C4Control in StdCompilerBinWrite form, whose packets are client seat + 1's. */
export interface SeatControl {
  seat: number;
  /** the tick the seat sent it for (below the tick's own when it came late) */
  tick: number;
  ctrl: Uint8Array;
}

/** A control tick's complete control: the host's events first, then the seats' control in seat order. */
export interface TickControl {
  tick: number;
  events: SeatEvent[];
  controls: SeatControl[];
}

/** C4ControlSyncCheck's values (and the port's own hash, 0n for none). */
export interface SyncCheck {
  frame: number;
  controlTick: number;
  randomCount: number;
  allCrewPosX: number;
  pxsCount: number;
  massMoverIndex: number;
  objectCount: number;
  objectEnumerationIndex: number;
  sectShapeSum: number;
  hash: bigint;
}

export interface PlayerResult {
  id: number;
  /** 255: none (a script player) */
  seat: number;
  name: string;
  won: boolean;
  totalPlayingTime: number;
  scoreOld: number;
  scoreNew: number;
}

/** C4RoundResults as C4Game::Evaluate leaves it. */
export interface RoundResultsData {
  frame: number;
  playingTime: number;
  goals: string[];
  fulfilledGoals: string[];
  players: PlayerResult[];
}

/** What a newcomer needs before it may play (the module's JoinState). */
export interface JoinState {
  seat: number;
  /** ticks in the history sent with this state */
  total: number;
  /** the first tick it may send control for after the check */
  resume: number;
  /** the check's frame, -1 while the module has no reference check yet */
  frame: number;
  check: SyncCheck;
  checkSeat: number;
}

/** What the module sends. */
export type ServerMsg =
  | { t: 'tick'; tick: TickControl }
  | { t: 'history'; start: number; total: number; resume: number; ticks: TickControl[] }
  | { t: 'joinState'; state: JoinState }
  | { t: 'joinResult'; result: JoinResult }
  | { t: 'desync'; frame: number; seat: number; check: SyncCheck; other: number; otherCheck: SyncCheck };

export interface JoinResult {
  seat: number;
  ok: boolean;
  reason: string;
}

/** How the round ended (RoomFinished.results). */
export interface Outcome {
  reason: 'evaluated' | 'disagreed' | 'desync' | 'limit';
  frame: number;
  /** evaluated: what every remaining seat reported */
  results: RoundResultsData | null;
}

// ---------------------------------------------------------------------------------------------------- the messages

export function packOptions(o: Partial<OnlineOptions> & { scenario: string }): Uint8Array {
  return packGame(Options, (m) => {
    m.scenario = o.scenario;
    m.controlRate = o.controlRate ?? DEFAULT_CONTROL_RATE;
    m.maxPlayers = o.maxPlayers ?? 0;
    m.mode = o.mode === 'async' ? Mode.ASYNC : Mode.CENTRAL;
    m.asyncMaxWait = o.asyncMaxWait ?? DEFAULT_ASYNC_MAX_WAIT;
  });
}

/** The round's options as the module uses them (its defaults for 0). */
export function readOptions(data: Uint8Array): OnlineOptions {
  const o = unpackGame(Options, data);
  return {
    scenario: o.scenario,
    controlRate: o.controlRate || DEFAULT_CONTROL_RATE,
    maxPlayers: o.maxPlayers,
    mode: o.mode === Mode.ASYNC ? 'async' : 'central',
    asyncMaxWait: o.asyncMaxWait || DEFAULT_ASYNC_MAX_WAIT,
  };
}

/** C4GameControlNetwork::DoInput: this browser's control for a tick. */
export function packControl(tick: number, ctrl: Uint8Array): Uint8Array {
  return packGame(Msg, (m) => {
    const c = m._initControl();
    c.tick = tick;
    setData((n) => c._initCtrl(n), ctrl);
  });
}

function fillCheck(b: SyncCheckStruct, c: SyncCheck): void {
  b.frame = c.frame;
  b.controlTick = c.controlTick;
  b.randomCount = c.randomCount;
  b.allCrewPosX = c.allCrewPosX;
  b.pxsCount = c.pxsCount;
  b.massMoverIndex = c.massMoverIndex;
  b.objectCount = c.objectCount;
  b.objectEnumerationIndex = c.objectEnumerationIndex;
  b.sectShapeSum = c.sectShapeSum;
  b.hash = BigInt.asUintN(64, c.hash);
}

function readCheck(r: SyncCheckStruct): SyncCheck {
  return {
    frame: r.frame, controlTick: r.controlTick, randomCount: r.randomCount, allCrewPosX: r.allCrewPosX,
    pxsCount: r.pxsCount, massMoverIndex: r.massMoverIndex, objectCount: r.objectCount,
    objectEnumerationIndex: r.objectEnumerationIndex, sectShapeSum: r.sectShapeSum, hash: r.hash,
  };
}

export function packSyncCheck(c: SyncCheck): Uint8Array {
  return packGame(Msg, (m) => fillCheck(m._initSyncCheck(), c));
}

/** The module's JoinState for a newcomer. */
export function packJoinState(s: JoinState): Uint8Array {
  return packGame(Msg, (m) => {
    const j = m._initJoinState();
    j.seat = s.seat;
    j.total = s.total;
    j.resume = s.resume;
    j.frame = s.frame;
    fillCheck(j._initCheck(), s.check);
    j.checkSeat = s.checkSeat;
  });
}

/** A newcomer's own check after replaying the history. */
export function packJoinCheck(frame: number, c: SyncCheck): Uint8Array {
  return packGame(Msg, (m) => {
    const j = m._initJoinCheck();
    j.frame = frame;
    fillCheck(j._initCheck(), c);
  });
}

/** The module's answer to a JoinCheck. */
export function packJoinResult(r: JoinResult): Uint8Array {
  return packGame(Msg, (m) => {
    const j = m._initJoinResult();
    j.seat = r.seat;
    j.ok = r.ok;
    j.reason = r.reason.slice(0, 128);
  });
}

function fillResults(b: RoundResultsStruct, r: RoundResultsData): void {
  b.frame = r.frame;
  b.playingTime = r.playingTime;
  const goals = b._initGoals(r.goals.length);
  r.goals.forEach((g, i) => goals.set(i, g));
  const done = b._initFulfilledGoals(r.fulfilledGoals.length);
  r.fulfilledGoals.forEach((g, i) => done.set(i, g));
  const players = b._initPlayers(r.players.length);
  r.players.forEach((p, i) => {
    const q = players.get(i);
    q.id = p.id;
    q.seat = p.seat;
    q.name = p.name;
    q.won = p.won;
    q.totalPlayingTime = p.totalPlayingTime;
    q.scoreOld = p.scoreOld;
    q.scoreNew = p.scoreNew;
  });
}

function readRoundResults(r: RoundResultsStruct): RoundResultsData {
  const players: PlayerResult[] = [];
  for (let i = 0; i < r.players.length; i++) {
    const p = r.players.get(i);
    players.push({ id: p.id, seat: p.seat, name: p.name, won: p.won, totalPlayingTime: p.totalPlayingTime, scoreOld: p.scoreOld, scoreNew: p.scoreNew });
  }
  const texts = (l: { length: number; get(i: number): string }) => Array.from({ length: l.length }, (_, i) => l.get(i));
  return { frame: r.frame, playingTime: r.playingTime, goals: texts(r.goals), fulfilledGoals: texts(r.fulfilledGoals), players };
}

/** The round's evaluation, for the module (C4Game::Evaluate). */
export function packRoundResults(r: RoundResultsData): Uint8Array {
  return packGame(Msg, (m) => fillResults(m._initRoundResults(), r));
}

function fillTick(b: TickStruct, t: TickControl): void {
  b.tick = t.tick;
  const ev = b._initEvents(t.events.length);
  t.events.forEach((e, i) => {
    ev.get(i).seat = e.seat;
    ev.get(i).kind = SeatEventKind[e.kind.toUpperCase() as keyof typeof SeatEventKind];
  });
  const cs = b._initControls(t.controls.length);
  t.controls.forEach((c, i) => {
    const x = cs.get(i);
    x.seat = c.seat;
    x.tick = c.tick;
    setData((n) => x._initCtrl(n), c.ctrl);
  });
}

function readTick(r: TickStruct): TickControl {
  const events: SeatEvent[] = [];
  for (let i = 0; i < r.events.length; i++) {
    const e = r.events.get(i);
    const kind = EVENTS[e.kind];
    if (kind) events.push({ seat: e.seat, kind });
  }
  const controls: SeatControl[] = [];
  for (let i = 0; i < r.controls.length; i++) {
    const c = r.controls.get(i);
    controls.push({ seat: c.seat, tick: c.tick, ctrl: bytes(c.ctrl) });
  }
  return { tick: r.tick, events, controls };
}

/** What the module sends, packed (the module's side, for tests and tools). */
export function packServerMsg(s: ServerMsg): Uint8Array {
  return packGame(Msg, (m) => {
    if (s.t === 'tick') fillTick(m._initTick(), s.tick);
    else if (s.t === 'history') {
      const h = m._initHistory();
      h.start = s.start;
      h.total = s.total;
      h.resume = s.resume;
      const l = h._initTicks(s.ticks.length);
      s.ticks.forEach((t, i) => fillTick(l.get(i), t));
    } else if (s.t === 'joinState') {
      const j = m._initJoinState();
      j.seat = s.state.seat; j.total = s.state.total; j.resume = s.state.resume; j.frame = s.state.frame;
      fillCheck(j._initCheck(), s.state.check); j.checkSeat = s.state.checkSeat;
    } else if (s.t === 'joinResult') {
      const j = m._initJoinResult();
      j.seat = s.result.seat; j.ok = s.result.ok; j.reason = s.result.reason;
    } else {
      const d = m._initDesync();
      d.frame = s.frame;
      d.seat = s.seat;
      fillCheck(d._initCheck(), s.check);
      d.other = s.other;
      fillCheck(d._initOtherCheck(), s.otherCheck);
    }
  });
}

/** A message from the module, or null (garbage, or what a browser sends). */
export function readServerMsg(data: Uint8Array): ServerMsg | null {
  let m: Msg;
  try {
    m = unpackGame(Msg, data);
    if (m._isTick) return { t: 'tick', tick: readTick(m.tick) };
    if (m._isHistory) {
      const h = m.history;
      const ticks: TickControl[] = [];
      for (let i = 0; i < h.ticks.length; i++) ticks.push(readTick(h.ticks.get(i)));
      return { t: 'history', start: h.start, total: h.total, resume: h.resume, ticks };
    }
    if (m._isJoinState) {
      const j = m.joinState;
      return { t: 'joinState', state: {
        seat: j.seat, total: j.total, resume: j.resume, frame: j.frame, check: readCheck(j.check), checkSeat: j.checkSeat,
      } };
    }
    if (m._isJoinResult) {
      const j = m.joinResult;
      return { t: 'joinResult', result: { seat: j.seat, ok: j.ok, reason: j.reason } };
    }
    if (m._isDesync) {
      const d = m.desync;
      return { t: 'desync', frame: d.frame, seat: d.seat, check: readCheck(d.check), other: d.other, otherCheck: readCheck(d.otherCheck) };
    }
  } catch {
    return null;
  }
  return null;
}

const REASONS: readonly Outcome['reason'][] = ['evaluated', 'disagreed', 'desync', 'limit'];

/** RoomFinished.results, or null if they are not the module's. */
export function readResults(data: Uint8Array): Outcome | null {
  try {
    const r = unpackGame(Results, data);
    const reason = REASONS[r.reason];
    if (!reason) return null;
    return { reason, frame: r.frame, results: r.reason === Reason.EVALUATED && r._hasResults() ? readRoundResults(r.results) : null };
  } catch {
    return null;
  }
}

/** Results as the module writes them (tests). */
export function packResults(o: Outcome): Uint8Array {
  return packGame(Results, (r) => {
    r.reason = REASONS.indexOf(o.reason) as Reason;
    r.frame = o.frame;
    if (o.results) fillResults(r._initResults(), o.results);
  });
}

// ------------------------------------------------------------------------------------------------------ the rooms

/** The part of `ctx.rooms` the online game uses (src/net.ts). */
export type RoomsLike = Pick<Rooms, 'send' | 'on'>;
