// Online play on the page: "Net game" in the main menu opens the website's lobby (2 to 6 players; it
// stands for the original's server address, port, password and waiting room) over the game's screen, and
// the round then runs as the original's network game (lw/netplay.ts, page/netplay.ts) against the server
// module server/.../games/liquidwar/LiquidwarModule.java.
import type { GameContext } from '../../../../src/sdk/index.ts';
import { LOBBY_EVENTS } from '../../../../src/sdk/lobby.ts';
import { menuHooks } from '../lw/menu.ts';
import { netplay_sequence, netplayState, network_game } from '../lw/netplay.ts';

export class Online {
  private readonly ctx: GameContext;
  private readonly overlay: HTMLDivElement;
  private readonly onReturn: () => void;
  private lobbyOpen = false;

  /** onReturn: the page lets go of every key and button held when the lobby opened */
  constructor(host: HTMLElement, ctx: GameContext, onReturn: () => void = () => {}) {
    this.ctx = ctx;
    this.onReturn = onReturn;
    this.overlay = document.createElement('div');
    Object.assign(this.overlay.style, {
      position: 'absolute', inset: '0', zIndex: '10', overflow: 'auto', background: 'rgb(0 0 0 / .55)', padding: '1rem',
    });
    this.overlay.hidden = true;
    // the lobby's clicks and keys are its own, not the game's
    for (const t of LOBBY_EVENTS) this.overlay.addEventListener(t, (e) => e.stopPropagation());
    host.append(this.overlay);
  }

  /** the lobby until a round starts (true) or the player goes back (false) */
  private async enter(): Promise<boolean> {
    this.lobbyOpen = true;
    this.overlay.hidden = false;
    this.onReturn();
    try {
      await this.ctx.lobby(this.overlay, {
        title: 'Liquid War online',
        seats: { min: 2, max: 6, default: 2 },
      });
      return true;
    } catch {
      return false;
    } finally {
      this.overlay.hidden = true;
      this.overlay.replaceChildren();
      this.lobbyOpen = false;
      this.onReturn();
      (this.overlay.parentElement as HTMLElement | null)?.focus();
    }
  }

  install(): void {
    const enter = (): Promise<boolean> => this.enter();
    menuHooks.network_game = () => network_game(enter, this.ctx.rooms);
    menuHooks.netplay_sequence = () => netplay_sequence(enter, this.ctx.rooms);
  }

  /** keys go to the lobby's fields while it is open */
  typing(): boolean {
    return this.lobbyOpen;
  }

  info(): string {
    return netplayState.current?.info() ?? '';
  }

  stop(): void {
    menuHooks.network_game = null;
    menuHooks.netplay_sequence = null;
    netplayState.current = null;
  }
}
