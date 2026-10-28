// "Online game": the shared lobby, then one round of the room as one game of Worms? (onlinegame.ts).
// The player brings the worm selected in the menu (F5): a worm that has learned something, or was
// loaded (its name shows), brings its table; any other kind starts as NEW. While the round is played
// the button leaves it.
import type { GameContext } from '../../../src/sdk/index.ts';
import { OnlineRound, packOptions, readOptions, readResults, encodeWorm, wormOf, OTHERS, COMPUTER } from './onlinegame.ts';
import { Worms, NAME, MOVES } from './worms.ts';
import { SAME } from './data.ts';

const COLOURS = ['green', 'red', 'blue', 'purple'];

export class Online {
  private readonly ctx: GameContext;
  private readonly g: Worms;
  private readonly host: HTMLElement;
  private readonly status: (s: string) => void;
  /** the "Online game" button: it leaves the round while one is played */
  button: HTMLButtonElement | null = null;
  private round: OnlineRound | null = null;
  private overlay: HTMLElement | null = null;
  private off: (() => void)[] = [];
  private playing = false;
  private others = 2;
  private resyncs = 0;
  private left = false;

  constructor(ctx: GameContext, g: Worms, host: HTMLElement, status: (s: string) => void) {
    this.ctx = ctx;
    this.g = g;
    this.host = host;
    this.status = status;
  }

  /** for the end-to-end test */
  state() {
    return {
      round: !!this.round, playing: this.playing, you: this.round?.you ?? -1, step: this.round?.step ?? 0,
      owners: this.round?.setup?.owners ?? null, waiting: this.round?.waiting ?? null, resyncs: this.resyncs,
    };
  }

  /** while this client replays decisions the others already made, frames run as fast as they can */
  catchingUp(): boolean {
    return this.playing && !!this.round && this.round.ahead > 1;
  }

  async open(): Promise<void> {
    if (this.round) {
      this.leave('You left the online game.');
      return;
    }
    if (this.overlay) return;
    const ov = document.createElement('div');
    ov.className = 'wm-lobby';
    this.overlay = ov;
    this.host.append(ov);
    try {
      // the room's options: what the worms without a player are
      const pick = document.createElement('div');
      pick.className = 'fg-lobby';
      pick.innerHTML = '<h2>Worms? online</h2><p>Each player plays one worm and teaches it where to go. You bring the worm selected in the menu (F5): a worm that has learned (shown with its name) brings what it knows, any other starts new.</p>';
      const label = document.createElement('label');
      label.textContent = 'Worms without a player: ';
      const sel = document.createElement('select');
      for (const o of OTHERS) sel.append(new Option(o.label, String(o.kind)));
      sel.value = String(this.others);
      label.append(sel);
      const row = document.createElement('div');
      row.className = 'fg-lobby-row';
      const go = Object.assign(document.createElement('button'), { textContent: 'Rooms' });
      const cancel = Object.assign(document.createElement('button'), { textContent: 'Cancel', className: 'fg-lobby-quiet' });
      row.append(go, cancel);
      pick.append(label, row);
      ov.append(pick);
      const ok = await new Promise<boolean>((res) => {
        go.onclick = () => res(true);
        cancel.onclick = () => res(false);
      });
      if (!ok) return;
      this.others = Number(sel.value);
      pick.remove();
      const start = await this.ctx.lobby(ov, {
        title: 'Worms? online',
        seats: { min: 1, max: 4, default: 4 },
        seatNames: COLOURS.map((c) => `the ${c} worm`),
        options: () => packOptions(this.others),
      });
      this.begin(start.you, start.seed, readOptions(start.options));
    } catch {
      // cancelled
    } finally {
      ov.remove();
      this.overlay = null;
    }
  }

  private begin(you: number, seed: bigint, others: number): void {
    const rooms = this.ctx.rooms;
    const round = new OnlineRound(you, seed, (data, to) => rooms.send(data, to));
    // our worm: the one selected in the menu
    const w = this.g.sel;
    const b = this.g.w[w];
    const mine = encodeWorm(wormOf(this.g.kind(w) === SAME ? SAME : 1, b.subarray(NAME, NAME + 4), b.subarray(MOVES, MOVES + 64)));
    const sendWorm = () => rooms.send(mine, 'server');
    this.round = round;
    if (this.button) this.button.textContent = 'Leave online game';
    this.status(`Online: you play the ${COLOURS[you]} worm. Waiting for the others' worms...`);
    void others;
    round.onStart = (setup) => {
      const names = setup.owners.map((o, i) => (o === COMPUTER ? null : `${COLOURS[i]}${o === you ? ' (you)' : ''}`)).filter(Boolean);
      this.status(`Online: ${names.join(', ')}.`);
      this.playing = true;
      this.g.online = {
        setup,
        seed: round.seed,
        seats: round.seats,
        begin: () => round.begin(),
        done: () => this.finished(),
      };
    };
    this.off.push(rooms.on('message', (m) => round.receive(m.from, m.data)));
    this.off.push(rooms.on('started', (r) => {
      // back after a dropped connection: the server sends the round so far (history)
      if (r.rejoined) {
        this.resyncs++;
        this.status('Online: back; catching up...');
        if (!round.setup) sendWorm(); // the server may not have it yet (it keeps the first)
      }
    }));
    this.off.push(rooms.on('finished', (f) => {
      const r = readResults(f.results);
      if (r && !this.playing) this.status(`Online game over: ${r.scores.map((s, i) => `${COLOURS[i]} ${s}`).join(', ')}.`);
    }));
    this.off.push(rooms.on('closed', () => {
      round.offline = true;
      if (!this.playing) this.cleanup();
    }));
    sendWorm();
  }

  /** the program finished the round's game */
  private finished(): void {
    const scores = [...this.g.wscr];
    const owners = this.round?.setup?.owners ?? [];
    if (!this.left) this.status(`Online game over: ${scores.map((s, i) => (owners[i] === COMPUTER && this.g.kind(i) === 0 ? '' : `${COLOURS[i]} ${s}`)).filter(Boolean).join(', ')}.`);
    this.left = false;
    this.playing = false;
    this.ctx.rooms.leave();
    this.cleanup();
  }

  private leave(msg: string): void {
    this.left = this.playing;
    if (this.playing) this.g.leaveOnline = true;
    if (this.round) this.round.offline = true;
    this.ctx.rooms.leave();
    if (!this.playing) this.cleanup();
    this.status(msg);
  }

  private cleanup(): void {
    for (const f of this.off) f();
    this.off = [];
    this.round = null;
    if (this.button) this.button.textContent = 'Online game';
    if (!this.playing) this.g.online = null;
  }

  close(): void {
    this.overlay?.remove();
    this.cleanup();
  }
}
