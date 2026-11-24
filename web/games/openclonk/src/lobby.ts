// OpenClonk online on the game page: the original's way into a network game, with the site's rooms where the original has
// its own network dialogs (gui/C4StartupNetDlg, gui/C4GameLobby, left out).
//
// The original: the main menu's "Network game" opens the list of network games (C4StartupNetDlg), whose "Create game"
// opens the scenario selection in network mode (C4StartupScenSelDlg(fNetwork = true): Game.NetworkActive); a scenario
// started there (StartScenario: Game.fLobby, Application.OpenGame) goes through C4Game::Init into the host's lobby
// (C4Network2::DoLobby), where the others join, and the host starts the round.
// Here: "Network game" opens the scenario selection in network mode, and before C4Game::Init the site's lobby takes the
// list of games and the original's lobby together: the room list (join a room, or rejoin your running round after a
// reload), or a new room with the chosen scenario and the original's network settings (Config.Network.ControlRate,
// ControlMode, AsyncMaxWait) as the room's options. The site's lobby must come before C4Game::Init: the original's lobby
// waits inside C4Game::Init (a modal loop), and the site's lobby is the page's, not the original's GUI. When the round
// starts, C4Game::Init runs with the round's scenario as a client of the module (src/net.ts), every browser alike.
import type { GameContext } from '../../../src/sdk/index.ts';
import type { OriginalApp } from './app.ts';
import { GAME_DATA } from './app.ts';
import { RoomsNetwork, roundScenario, C4AS_StartGame } from './net.ts';
import { packOptions } from './online.ts';
import { S } from './rt/ptr.ts';

// gui/C4Startup.h C4Startup::DialogID
const SDID_ScenSelNetwork = 2;
// game/C4Application.h C4AppState
const C4AS_Game = 4;

export class OnlineGames {
  net: RoomsNetwork | null = null;
  private lobbyOpen = false;
  private readonly app: OriginalApp;
  private readonly ctx: GameContext;
  private readonly overlay: HTMLElement;
  private readonly say: (text: string) => void;

  constructor(app: OriginalApp, ctx: GameContext, overlay: HTMLElement, say: (text: string) => void) {
    this.app = app;
    this.ctx = ctx;
    this.overlay = overlay;
    this.say = say;
    const $ = app.engine;
    const main = $.C4StartupMainDlg?.prototype;
    // the main menu's "Network game": the scenario selection in network mode (the network dialog's "Create game"); the
    // list of games to join comes with the site's lobby
    if (main) main.OnNetJoinBtn = () => { $.C4Startup.Get().SwitchDialog(SDID_ScenSelNetwork, true, null); };
  }

  /** before each round of the original's main loop: false while the lobby is open (the original waits for it) */
  before(): boolean {
    const $ = this.app.engine;
    if (this.lobbyOpen) return false;
    const state = $.Application.AppState;
    if (state === C4AS_StartGame && $.Game.NetworkActive && !this.net) {
      void this.lobby();
      return false;
    }
    // the round is over and the original back in its menu: out of the room
    if (this.net && state !== C4AS_StartGame && state !== C4AS_Game) this.leave();
    return true;
  }

  /** the site's lobby, then the round's scenario as a client of the module */
  private async lobby(): Promise<void> {
    const $ = this.app.engine;
    this.lobbyOpen = true;
    let path = cString($.Game.ScenarioFilename);
    if (!path.startsWith(GAME_DATA)) {
      // the user's own scenarios and savegames are not in the other browsers' content
      this.lobbyOpen = false;
      $.Game.NetworkActive = false;
      $.Application.QuitGame();
      $.pGUI?.ShowMessage(S('Only the scenarios of the game\'s own folders can be played online.'), S('Network game'), 1, null);
      return;
    }
    path = path.slice(GAME_DATA.length);
    const cfg = $.Config.Network;
    this.overlay.hidden = false;
    try {
      const round = await this.ctx.lobby(this.overlay, {
        title: 'OpenClonk: network game',
        seats: { min: 1, max: 16, default: 2 },
        options: () => packOptions({
          scenario: path, controlRate: cfg.ControlRate, maxPlayers: 0,
          mode: cfg.ControlMode === 2 ? 'async' : 'central', asyncMaxWait: cfg.AsyncMaxWait,
        }),
      });
      if (this.ctx.signal.aborted) return;
      this.net = new RoomsNetwork({ rooms: this.ctx.rooms, round, rtt: () => this.ctx.net.rtt });
      this.app.setNetwork(this.net);
      // the round's scenario (the room joined may have another than the one chosen)
      $.Game.SetScenarioFilename(S(GAME_DATA + roundScenario(round)));
      $.Game.fLobby = true;
      this.say(round.rejoined ? 'Back in the round: catching up…' : '');
    } catch {
      // the lobby closed without a round: as when the original's lobby is aborted, back to the start menu
      $.Game.NetworkActive = false;
      $.UserAbort = true;
      $.Application.QuitGame();
    } finally {
      this.overlay.hidden = true;
      this.overlay.replaceChildren();
      this.lobbyOpen = false;
    }
  }

  /** what the page says about the round: the module's end of it */
  get outcome(): string {
    const s = this.net?.state;
    if (!s?.finished) return '';
    if (s.stopped) return `The server stopped the round: ${s.stopped}`;
    switch (s.outcome?.reason) {
      case 'evaluated': return 'Round over: every player\'s game evaluated it alike.';
      case 'disagreed': return 'Round over: the players\' evaluations differ.';
      case 'desync': return `Round over: the games went out of sync at frame ${s.outcome.frame} (Network: Synchronization loss).`;
      case 'limit': return 'Round over: it reached the server\'s limit for a round.';
      default: return 'Round over.';
    }
  }

  leave(): void {
    if (!this.net) return;
    this.net.stop();
    this.net = null;
    this.app.setNetwork(null);
    this.ctx.rooms.leave();
  }
}

function cString(a: Int8Array): string {
  let n = a.indexOf(0);
  if (n < 0) n = a.length;
  return new TextDecoder().decode(Uint8Array.from(a.subarray(0, n), (x) => x & 0xff));
}
