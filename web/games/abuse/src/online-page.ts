// Online play, the page's side. The main menu's networking icon (the original's net_configuration
// dialogs: start a server with its options, or join a game found on the network) opens the website's
// lobby here, with the server's options (the level set and the kills to win) for a new room. When a
// round starts, the game starts again in network mode (as the original restarted its engine after the
// dialog) and the room's messages go to it. When the round ends or the room is left, it starts again
// for one player.
import { packGame, unpackGame, type GameContext, type RoundStart } from '../../../src/sdk/index.ts';
import * as P from './proto/abuse.ts';
import type { NetFromWorker, NetToWorker, OnlineConfig } from './online.ts';

export interface OnlineHost {
  /** a message to the program */
  send(m: NetToWorker): void;
  /** starts the program again: online with this configuration, or for one player (null) */
  relaunch(online: OnlineConfig | null, message?: string): void;
}

const CSS = `
.abuse-net { position: absolute; inset: 0; overflow: auto; background: rgb(0 0 0 / .75); z-index: 2; }
.abuse-net .abuse-opts { max-width: 34rem; margin: 2rem auto 0; padding: .9rem 1.5rem; border-radius: 10px;
  background: #fff; color: #1d2125; font: 15px/1.45 system-ui, sans-serif; display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
.abuse-net .abuse-opts select, .abuse-net .abuse-opts input { font: inherit; padding: .2rem .4rem; }
.abuse-net .abuse-opts input { width: 4em; }
.abuse-net .fg-lobby { margin-top: 1rem; }
`;

export class OnlinePage {
  private readonly host: HTMLElement;
  private readonly ctx: GameContext;
  private readonly owner: OnlineHost;
  private overlay: HTMLDivElement | null = null;
  /** the running online round (the program plays it) */
  private round: RoundStart | null = null;
  /** sync values of the clients' ticks, for the end-to-end test: tick -> make_sync() */
  readonly syncs = new Map<number, number>();
  private subscribed = false;

  constructor(host: HTMLElement, ctx: GameContext, owner: OnlineHost) {
    this.host = host;
    this.ctx = ctx;
    this.owner = owner;
  }

  online(): RoundStart | null { return this.round; }

  /** keys go to the lobby's fields while it is open */
  typing(): boolean { return this.overlay !== null; }

  fromWorker(m: NetFromWorker): void {
    switch (m.t) {
      case 'send':
        if (this.round) this.ctx.rooms.send(m.data, m.to);
        break;
      case 'tick':
        this.syncs.set(m.tick, m.sync);
        if (this.syncs.size > 400) this.syncs.delete(this.syncs.keys().next().value!);
        break;
      case 'menu':
        if (this.round) this.leave('You left the online game.');
        else void this.lobby();
        break;
    }
  }

  private subscribe(): void {
    if (this.subscribed) return;
    this.subscribed = true;
    const rooms = this.ctx.rooms;
    rooms.on('message', (g) => {
      if (this.round) this.owner.send({ t: 'msg', from: g.from, data: g.data });
    });
    rooms.on('started', (r) => {
      if (this.round && r.rejoined) this.owner.send({ t: 'resume' });
    });
    rooms.on('finished', (f) => {
      if (this.round) this.end(f.stopped ? `The online game was stopped: ${f.stopped}` : 'The online game is over.');
    });
    rooms.on('closed', (c) => {
      if (this.round) this.end(`The online game ended (${c.reason}).`);
    });
  }

  private async lobby(): Promise<void> {
    if (this.overlay) return;
    this.subscribe();
    if (!document.getElementById('abuse-net-css')) {
      const st = document.createElement('style');
      st.id = 'abuse-net-css';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    const o = document.createElement('div');
    o.className = 'abuse-net';
    const opts = document.createElement('div');
    opts.className = 'abuse-opts';
    opts.innerHTML = '<b>Deathmatch</b><label>Levels <select class="abuse-size"><option value="2">small (2 players)</option>' +
      '<option value="4">medium (4)</option><option value="8">large (8)</option></select></label>' +
      '<label>Kills to win <input class="abuse-kills" type="number" min="1" max="99" value="25"></label>';
    const box = document.createElement('div');
    o.append(opts, box);
    this.host.appendChild(o);
    this.overlay = o;
    const size = opts.querySelector<HTMLSelectElement>('.abuse-size')!;
    const kills = opts.querySelector<HTMLInputElement>('.abuse-kills')!;
    try {
      const round = await this.ctx.lobby(box, {
        title: 'Abuse online',
        seats: { min: 2, max: 8, default: 8 },
        options: () => packGame(P.Options, (x) => {
          x.levelSize = +size.value;
          x.kills = Math.max(1, Math.min(99, Math.trunc(+kills.value) || 25));
        }),
      });
      this.close();
      this.start(round);
    } catch {
      this.close();
      this.owner.send({ t: 'dialogDone' });
    }
  }

  private close(): void {
    this.overlay?.remove();
    this.overlay = null;
    this.host.focus();
  }

  private start(r: RoundStart): void {
    let levelSize = 2, kills = 25;
    try {
      if (r.options.length) {
        const o = unpackGame(P.Options, r.options);
        levelSize = o.levelSize;
        kills = o.kills;
      }
    } catch {
      // the module accepted them; defaults otherwise
    }
    const names: string[] = [];
    for (const s of r.seats) names[s.seat] = (s.name || `player ${s.seat}`).replace(/[^\x20-\x7e]/g, '?');
    for (let i = 0; i < names.length; i++) names[i] ??= '';
    this.round = r;
    this.syncs.clear();
    this.owner.relaunch({
      seat: r.you, names, seed: Number(BigInt.asUintN(31, r.seed)), levelSize, kills,
      gameName: this.ctx.rooms.room?.name ?? 'Abuse',
    });
  }

  private leave(message: string): void {
    this.ctx.rooms.leave();
    this.end(message);
  }

  private end(message: string): void {
    this.round = null;
    this.owner.relaunch(null, message);
  }

  stop(): void {
    this.overlay?.remove();
  }
}
