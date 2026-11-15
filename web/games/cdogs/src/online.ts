// C-Dogs SDL 2.5.0, translated: online play (the original's LAN game, src/cdogs/net_client.c and
// net_server.c, mapped to the website's rooms). Every client runs the whole simulation (lockstep) from
// the room's seed; each frame every client sends its own player's command word, the server relays the
// words in order, and a client steps the game once every seat's word for that frame is in. The lobby is
// the website's shared one (the SDK's openLobby), so the original's "Choose LAN server" list becomes
// that lobby's room list. GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import { packGame, unpackGame, SERVER_SEAT, type GameContext, type GameMessage, type RoundStart } from '../../../src/sdk/index.ts';
import { ConfigGet } from './core/config.ts';
import { CampaignEntryTryLoad, CampaignLoad, type DataFS } from './core/data.ts';
import {
  GAME_EVENT_MISSION_END, GAME_EVENT_PLAYER_DATA, GameEventNew, GameEventsEnqueue, GameEventsInit, gGameEvents,
} from './core/events.ts';
import { HandleGameEvents } from './core/handle.ts';
import { MUSIC_MENU, MusicPlayFromChunk } from './core/music.ts';
import { localPlayers, PlayerDataDefault } from './core/player.ts';
import { INPUT_DEVICE_KEYBOARD } from './core/types.ts';
import { GAME_MODE_NORMAL, gCampaign, gPlayerDatas, type CampaignEntry } from './core/state.ts';
import { Msg, Msg_Which, Options, Results } from './proto/cdogs.ts';
import { GameLoopDataNew, UPDATE_RESULT_DRAW, type GameLoopData, type LoopRunner } from './ui/loop.ts';
import { ScreenLoading } from './ui/loading.ts';
import { mainMenuHooks } from './ui/mainmenu.ts';
import { CampaignAndMissionSetup } from './ui/prep.ts';
import { RunGame, runGameHooks } from './ui/rungame.ts';

/** how many frames ahead a command word travels: the one-way latency a client may have without stalling */
const INPUT_DELAY = 4;

export interface RoomOptions { campaign: string; mode: number; mission: number }

export function packOptions(o: RoomOptions): Uint8Array {
  return packGame(Options, (x) => {
    x.campaign = o.campaign;
    x.mode = o.mode;
    x.mission = o.mission;
  });
}

export function readOptions(data: Uint8Array): RoomOptions {
  try {
    const o = unpackGame(Options, data);
    return { campaign: o.campaign, mode: o.mode, mission: o.mission };
  } catch {
    return { campaign: '', mode: GAME_MODE_NORMAL, mission: 0 };
  }
}

export function encodeInput(frame: number, cmd: number): Uint8Array {
  return packGame(Msg, (m) => {
    const i = m._initInput();
    i.frame = frame;
    i.cmd = cmd;
  });
}

export function encodeDone(score: number, survived: boolean): Uint8Array {
  return packGame(Msg, (m) => {
    const d = m._initDone();
    d.score = score;
    d.survived = survived;
  });
}

/** a round that ended: the seats' numbers from the server module (Results) */
export interface SeatResult { seat: number; score: number; survived: boolean }
export function readResults(data: Uint8Array): SeatResult[] {
  const out: SeatResult[] = [];
  try {
    const r = unpackGame(Results, data);
    for (let i = 0; i < r.seats.length; i++) {
      const e = r.seats.get(i);
      out.push({ seat: e.seat, score: e.score, survived: e.survived });
    }
  } catch {
    // not ours: an empty result
  }
  return out;
}

/** what index.ts gives online.ts: the data (campaigns) and the overlay the lobby goes into */
const online = {
  fs: null as (DataFS & { url(path: string): string | null }) | null,
  ctx: null as GameContext | null,
  overlay: null as HTMLElement | null,
};

/** the frame exchange of one round (runGameHooks.online): the commands of every seat, in seat order */
export class Lockstep {
  private readonly ctx: GameContext;
  private readonly seats: number[];
  private readonly you: number;
  /** frame → (seat → cmd) */
  private readonly words = new Map<number, Map<number, number>>();
  private frame = 0;
  private sent = INPUT_DELAY - 1;
  private over = false;
  private finished = false;
  results: SeatResult[] = [];
  readonly seed: number;

  constructor(ctx: GameContext, round: RoundStart) {
    this.ctx = ctx;
    this.seats = round.seats.map((s) => s.seat).sort((a, b) => a - b);
    this.you = round.you;
    this.seed = Number(BigInt.asUintN(32, round.seed));
    // the first frames carry no words: every seat idles for the input delay's worth of frames
    for (let f = 0; f < INPUT_DELAY; f++) {
      const row = new Map<number, number>();
      for (const s of this.seats) row.set(s, 0);
      this.words.set(f, row);
    }
    ctx.rooms.on('message', (m: GameMessage) => this.message(m));
    ctx.rooms.on('finished', (f) => this.roundOver(f.results));
    ctx.rooms.on('closed', () => this.roundOver(new Uint8Array(0)));
  }

  private message(m: GameMessage): void {
    if (m.from === SERVER_SEAT || !this.seats.includes(m.from)) return;
    let msg: Msg;
    try {
      msg = unpackGame(Msg, m.data);
    } catch {
      return;
    }
    if (msg.which() !== Msg_Which.INPUT) return;
    const i = msg.input;
    // a frame this client has already stepped: every seat's word for it was in, so this one is a repeat
    if (i.frame < this.frame) return;
    // a client ahead of this one sends words for frames this client has no row for yet: keep them until
    // this client gets there (the server lets every seat send each frame once and without gaps)
    let row = this.words.get(i.frame);
    if (!row) {
      row = new Map<number, number>();
      this.words.set(i.frame, row);
    }
    row.set(m.from, i.cmd);
  }

  /** runGameHooks.online.exchange: this frame's commands of every player, or null while one is missing */
  exchange(own: number[]): number[] | null {
    if (this.over) return this.seats.map(() => 0);
    const want = this.frame + INPUT_DELAY;
    if (want > this.sent) {
      this.sent = want;
      const cmd = own[0] ?? 0;
      const row = this.words.get(want);
      if (row) row.set(this.you, cmd);
      else this.words.set(want, new Map([[this.you, cmd]]));
      this.ctx.rooms.send(encodeInput(want, cmd), 'others');
    }
    const row = this.words.get(this.frame);
    if (!row || this.seats.some((s) => row.get(s) == null)) return null;
    const out = this.seats.map((s) => row.get(s)!);
    this.words.delete(this.frame);
    this.frame++;
    return out;
  }

  /** the local game is over: tell the server, so it ends the round once every seat reported */
  ended(score: number, survived: boolean): void {
    if (this.finished) return;
    this.finished = true;
    this.ctx.rooms.send(encodeDone(Math.max(0, Math.trunc(score)), survived), 'server');
  }

  private roundOver(results: Uint8Array): void {
    if (this.over) return;
    this.over = true;
    this.results = readResults(results);
    // the others are gone (or the server ended the round): their players stand still and the game goes on
    if (!this.finished) {
      this.finished = true;
      const e = GameEventNew(GAME_EVENT_MISSION_END);
      e.u.IsQuit = true;
      GameEventsEnqueue(gGameEvents, e);
    }
  }

  get isOver(): boolean {
    return this.over;
  }
}

/** the online game (mainMenuHooks.online): the lobby, then one mission in lockstep */
export function OnlineGame(pick: { mode: number; entry: CampaignEntry }): GameLoopData {
  let round: RoundStart | null = null;
  let failed = '';
  return GameLoopDataNew({
    OnEnter: () => {
      const ctx = online.ctx!;
      const overlay = online.overlay!;
      MusicPlayFromChunk(MUSIC_MENU);
      overlay.hidden = false;
      ctx.lobby(overlay, {
        title: 'C-Dogs online',
        seats: { min: 1, max: 4, default: 2 },
        options: () => packOptions({ campaign: pick.entry.Path, mode: pick.mode, mission: 0 }),
      }).then((r) => { round = r; }, (e) => { failed = (e as Error).message || 'cancelled'; });
    },
    OnExit: () => {
      online.overlay!.hidden = true;
      online.overlay!.replaceChildren();
    },
    UpdateFunc: (l: LoopRunner) => {
      if (failed) {
        l.pop();
        return UPDATE_RESULT_DRAW;
      }
      if (!round) return UPDATE_RESULT_DRAW;
      const r = round;
      round = null;
      void startRound(r).then(
        (next) => enterRound(l, next),
        (e) => {
          console.log('[cd] online', (e as Error).stack);
          l.pop();
        });
      return UPDATE_RESULT_DRAW;
    },
    DrawFunc: () => {},
  });
}

/**
 * the lobby screen (top of the stack, the main menu below it) gives way to the round's game screen, through the
 * loading screen. The loading screen goes on top of the lobby screen and removes it when it is done, as the
 * equipment screen does offline (equip.ts): the main menu stays at the bottom of the stack and is neither drawn
 * nor entered on the way, so its OnEnter (mainMenuHooks.onMainMenu, which leaves the room) only runs when the
 * round's screens are done.
 */
export function enterRound(l: LoopRunner, next: GameLoopData): void {
  if (online.overlay) online.overlay.hidden = true;
  l.push(ScreenLoading('Starting game...', true, next, true));
}

/** the camera shake's own random generator online (xorshift32 from the room's seed, rand()'s range 0..2^31-1):
 * the shake only moves the view, and drawing from the game's rand() would change the shared simulation */
export function shakeRandom(seed: number): () => number {
  let x = (seed ^ 0x9e3779b9) >>> 0 || 1;
  return () => {
    x ^= x << 13;
    x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    return x >>> 1;
  };
}

/** the campaign of the round, the seats as the players, and the exchange the game runs on */
async function startRound(round: RoundStart): Promise<GameLoopData> {
  const ctx = online.ctx!;
  const fs = online.fs!;
  const o = readOptions(round.options);
  const entry = o.campaign ? await CampaignEntryTryLoad(fs, o.campaign, o.mode) : null;
  if (!entry) throw new Error(`campaign ${o.campaign} not found`);
  gCampaign.Entry.Mode = o.mode;
  if (!(await CampaignLoad(fs, gCampaign, entry))) throw new Error(`campaign ${o.campaign} not loaded`);
  gCampaign.IsComplete = false;
  gCampaign.IsQuit = false;
  gCampaign.MissionIndex = o.mission;
  // the same map on every client: the room's seed replaces the original's RandomSeed setting
  // (campaigns.c CampaignSeedRandom is 10 * mission + Game.RandomSeed)
  ConfigGet('Game.RandomSeed').value = Number(BigInt.asUintN(31, round.seed));
  CampaignAndMissionSetup();

  /** the players: one per seat, in seat order, named as the room shows them (the screens below the game
   * clear gPlayerDatas when they exit, so this runs when the game screen enters, before GameSimEnter) */
  const makePlayers = (): void => {
    GameEventsInit(gGameEvents);
    gPlayerDatas.length = 0;
    localPlayers.firstUID = 0;
    localPlayers.ownUIDs = new Set([round.you]);
    [...round.seats].sort((a, b) => a.seat - b.seat).forEach((s, idx) => {
      const pd = PlayerDataDefault(idx);
      pd.UID = s.seat;
      pd.Name = s.name.slice(0, 20) || `Player ${idx + 1}`;
      const e = GameEventNew(GAME_EVENT_PLAYER_DATA);
      e.u = pd;
      GameEventsEnqueue(gGameEvents, e);
    });
    HandleGameEvents(gGameEvents, null, null, null);
    // every player has a local device in the pause menu's eyes (a remote player's words come from the room)
    for (const p of gPlayerDatas) {
      p.inputDevice = INPUT_DEVICE_KEYBOARD;
      p.deviceIndex = 0;
    }
  };

  const lock = new Lockstep(ctx, round);
  runGameHooks.online = {
    beforeEnter: makePlayers,
    exchange: (own) => lock.exchange(own),
    pvpSeed: () => lock.seed,
    shakeRand: shakeRandom(lock.seed),
    ended: () => {
      const own = gPlayerDatas.find((p) => p.isOwn);
      // one mission per round: the summary ends the campaign instead of continuing it
      gCampaign.IsComplete = true;
      lock.ended(own?.Stats.Score ?? 0, !!own?.survived);
    },
  };
  return RunGame();
}

/** online through the website's rooms; index.ts calls this once the data is loaded */
export function setupOnline(ctx: GameContext, host: HTMLElement, fs: DataFS & { url(path: string): string | null }): void {
  online.ctx = ctx;
  online.fs = fs;
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'absolute', inset: '0', zIndex: '10', overflow: 'auto', background: 'rgb(0 0 0 / .55)', padding: '1rem',
  });
  overlay.hidden = true;
  host.append(overlay);
  online.overlay = overlay;
  mainMenuHooks.online = (pick) => OnlineGame(pick);
  mainMenuHooks.onMainMenu = () => {
    if (!runGameHooks.online) return;
    // back from an online mission: the room stays open for the next game, the seat is given up
    runGameHooks.online = null;
    ctx.rooms.leave();
  };
}
