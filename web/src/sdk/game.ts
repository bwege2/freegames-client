// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// The game contract (docs/GAME-INTEGRATION.md): what a game folder web/games/<id>/ provides and what
// the website hands a game when the player clicks Play.
import type { GameClient } from './net/client.ts';
import type { Rooms, RoundStart } from './rooms.ts';
import type { Storage } from './storage.ts';
import type { Scores } from './scores.ts';
import type { LobbyOptions } from './lobby.ts';

/**
 * The genres a game.json may name: the Genre column of Wikipedia's "Open engine and free data" table
 * (docs/RESEARCH.md), spelled out. A game names one or more.
 */
export const GENRES = [
  'Adventure', 'Arcade', 'Artillery', 'Game creation', 'Pinball', 'Programming', 'Puzzle', 'Roguelike',
  'Role-playing', 'Side-scroller', 'Software toy', 'Survival horror', 'Text adventure', 'Turn-based strategy',
] as const;
export type Genre = typeof GENRES[number];

/** How a game can be played: alone (or against the computer), two or more on one computer, online. */
export const PLAY_MODES = ['single', 'multi', 'online'] as const;
export type PlayMode = typeof PLAY_MODES[number];

/** web/games/<id>/game.json */
export interface GameManifest {
  /** = the folder name, the server's game id, protocol/games/<id>.capnp */
  id: string;
  title: string;
  /** one line for the game list */
  tagline: string;
  /** short paragraphs for the game page */
  summary: string[];
  original: {
    author: string;
    year: number;
    /** what it ran on: "Apple II", "BASIC", "C/SDL (Linux, Windows)" */
    platform: string;
    /** the reference version this port follows */
    version: string;
    license: string;
    /** size of the original's package (docs/RESEARCH.md) */
    packageBytes: number;
    /** where the original comes from */
    url: string;
  };
  /** "1", "2 (on one computer or online)" */
  players: string;
  /** for the list's genre filter */
  genres: Genre[];
  /** for the list's players filter: what `players` says, as values */
  modes: PlayMode[];
  /** the day the port went live on the website (YYYY-MM-DD), for "Newest added"; absent until then */
  added?: string;
  controls: { input: string; action: string }[];
  /** images in web/games/<id>/screenshots/ (of the port); the first is the thumbnail */
  screenshots: { file: string; caption: string }[];
  /** false: reachable by its link only (the example game) */
  listed?: boolean;
  /**
   * files of the game's folder it loads only later, while playing (globs: "assets/music/**"): Play does not
   * download them before the start (scripts/downloads.mjs)
   */
  lazyAssets?: string[];
}

/** What a game gets from the website (web/src/site/player.ts creates it). */
export interface GameContext {
  manifest: GameManifest;
  /** Aborted when the game stops: pass it to addEventListener(..., { signal }), fetch, timers. */
  signal: AbortSignal;
  /** Started by the Play click (browsers allow sound only after a gesture); closed when the game stops. */
  audio: AudioContext;
  /** This game's connection to the server; it connects on first use (rooms, storage, scores do that). */
  net: GameClient;
  rooms: Rooms;
  storage: Storage;
  scores: Scores;
  /** Shows the shared lobby inside `host`; resolves when a round starts, rejects if the player cancels. */
  lobby(host: HTMLElement, options?: LobbyOptions): Promise<RoundStart>;
  /**
   * requestAnimationFrame loop that ends with the game, or earlier with `signal` (a screen of the
   * game that closes): cb(time ms, ms since the last frame).
   */
  frame(cb: (time: number, dt: number) => void, signal?: AbortSignal): void;
  /** Leave the game (the original's "quit"): back to the game page. */
  exit(): void;
}

/** A running game. stop() must end everything it started that `signal` does not end by itself. */
export interface GameInstance {
  stop(): void | Promise<void>;
}

/** web/games/<id>/src/index.ts exports `start` of this type. `host` fills the window below the website's bar. */
export type StartGame = (host: HTMLElement, ctx: GameContext) => GameInstance | Promise<GameInstance>;
