// The example game (not listed): a dice race that uses every part of the SDK the way a port should.
// Read it next to docs/GAME-INTEGRATION.md and the server module (server/.../games/example/).
//  * lobby + rooms: ctx.lobby() for the online room, RoundStart.seed for anything random on clients
//  * relay: game messages are packed messages of protocol/games/example.capnp (packGame/unpackGame);
//    "roll" goes to the server module, which rolls and broadcasts; chat goes to the others; the pointer
//    is unreliable (superseded by the next one)
//  * the round ends when the server module says so (RoomFinished with Results)
//  * storage: the player's "stats" file; scores: the shared "fewest-rolls" table, checked by the module
//  * cleanup: listeners use ctx.signal, the animation uses ctx.frame, so stop() has little to do
import { packGame, unpackGame, playerName, SERVER_SEAT, type StartGame, type GameContext, type RoundStart } from '../../../src/sdk/index.ts';
import { Msg, Options, Results, Stats } from './proto/example.ts';
import { teletypeDemo, pixelDemo } from './demos.ts';

const TARGET = 20;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...kids: (Node | string)[]): HTMLElementTagNameMap[K] {
  const e = Object.assign(document.createElement(tag), props);
  e.append(...kids);
  return e;
}

const css = `
.ex { height: 100%; display: grid; place-items: center; font: 16px/1.5 system-ui, sans-serif; color: #e8e8e8; background: #10301f; }
.ex-box { min-width: 20rem; max-width: 34rem; padding: 1.5rem; border-radius: 10px; background: #183f2b; }
.ex button { font: inherit; padding: .4rem 1rem; margin: .25rem .25rem 0 0; border-radius: 6px; border: 0; background: #f2c14e; color: #222; cursor: pointer; }
.ex table { border-collapse: collapse; margin: .75rem 0; width: 100%; }
.ex td { padding: .2rem .5rem; border-bottom: 1px solid #2c5a41; }
.ex .ex-die { font-size: 3rem; line-height: 1; display: inline-block; }
.ex .ex-muted { color: #9fbfae; font-size: .85rem; }
.ex .ex-pointer { position: absolute; width: 10px; height: 10px; margin: -5px; border-radius: 50%; background: #f2c14e; pointer-events: none; }
`;

async function loadStats(ctx: GameContext): Promise<{ rounds: number; wins: number }> {
  const f = await ctx.storage.get('stats');
  if (!f) return { rounds: 0, wins: 0 };
  try {
    const s = unpackGame(Stats, f);
    return { rounds: s.rounds, wins: s.wins };
  } catch {
    return { rounds: 0, wins: 0 };
  }
}

export const start: StartGame = (host, ctx) => {
  host.append(el('style', { textContent: css }));
  const root = el('div', { className: 'ex' });
  host.append(root);
  const debug = window as unknown as { __exampleFrames?: number };
  debug.__exampleFrames = 0;

  function menu(note = ''): void {
    const play = el('button', { textContent: 'Race online' });
    play.onclick = () => void online();
    // the SDK's terminal and pixel screen, for ports of text and pixel games: in the game's own host,
    // as a port uses them
    const demo = (run: (host: HTMLElement, ctx: GameContext) => Promise<void>) => async () => {
      root.style.display = 'none';
      await run(host, ctx).catch(() => { /* stopped */ });
      root.style.display = '';
      if (!ctx.signal.aborted) menu();
    };
    const tty = el('button', { textContent: 'Terminal' });
    tty.onclick = demo(teletypeDemo);
    const pixels = el('button', { textContent: 'Pixel screen' });
    pixels.onclick = demo(pixelDemo);
    const stats = el('p', { className: 'ex-muted', textContent: '…' });
    root.replaceChildren(el('div', { className: 'ex-box' },
      el('h2', { textContent: 'Dice race' }),
      el('p', { textContent: `First to ${TARGET} points wins. The server rolls the dice.` }),
      note ? el('p', { textContent: note }) : '',
      play, tty, pixels, stats));
    loadStats(ctx).then((s) => { stats.textContent = `Your rounds: ${s.rounds}, wins: ${s.wins}`; }, () => { stats.textContent = 'offline'; });
  }

  async function online(): Promise<void> {
    let round: RoundStart;
    try {
      round = await ctx.lobby(root, {
        title: 'Dice race online',
        seats: { min: 1, max: 4, default: 2 },
        options: () => packGame(Options, (o) => { o.target = TARGET; }),
      });
    } catch {
      menu();
      return;
    }
    race(round);
  }

  function race(round: RoundStart): void {
    const totals = new Map<number, number>();
    const die = el('span', { className: 'ex-die', textContent: '⚀' });
    const rows = new Map<number, HTMLTableCellElement>();
    const table = el('table');
    for (const s of round.seats) {
      const cell = el('td', { textContent: '0' });
      rows.set(s.seat, cell);
      table.append(el('tr', {}, el('td', { textContent: `${s.name}${s.seat === round.you ? ' (you)' : ''}` }), cell));
    }
    const rollButton = el('button', { textContent: 'Roll' });
    rollButton.onclick = () => ctx.rooms.send(packGame(Msg, (m) => { m.roll = true; }), 'server');
    const chatInput = el('input', { placeholder: 'Say something', maxLength: 80 });
    const chatLog = el('div', { className: 'ex-muted' });
    chatInput.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || !chatInput.value.trim()) return;
      const text = chatInput.value.trim();
      ctx.rooms.send(packGame(Msg, (m) => { m.chat = text; }), 'others');
      chatLog.prepend(el('div', { textContent: `you: ${text}` }));
      chatInput.value = '';
    }, { signal: ctx.signal });
    const status = el('p', { className: 'ex-muted' });
    const box = el('div', { className: 'ex-box' }, el('h2', { textContent: `Race to ${TARGET}` }), die, table, rollButton, chatInput, chatLog, status);
    box.style.position = 'relative';
    root.replaceChildren(box);

    // the pointer: unreliable, at most every 50 ms
    const pointers = new Map<number, HTMLElement>();
    let lastPointer = 0;
    box.addEventListener('pointermove', (e) => {
      if (e.timeStamp - lastPointer < 50) return;
      lastPointer = e.timeStamp;
      const r = box.getBoundingClientRect();
      ctx.rooms.send(packGame(Msg, (m) => { const p = m._initPointer(); p.x = (e.clientX - r.left) / r.width; p.y = (e.clientY - r.top) / r.height; }), 'others', false);
    }, { signal: ctx.signal });

    let spin = 0;
    ctx.frame((_t, dt) => {
      debug.__exampleFrames!++;
      if (spin > 0) {
        spin -= dt;
        die.textContent = '⚀⚁⚂⚃⚄⚅'[Math.floor(Math.random() * 6)];
      }
      status.textContent = `${ctx.net.transport ?? 'offline'} · ${Math.round(ctx.net.rtt)} ms`;
    });

    const offMessage = ctx.rooms.on('message', (msg) => {
      let m: Msg;
      try { m = unpackGame(Msg, msg.data); } catch { return; } // a peer may send garbage
      if (m._isRolled && msg.from === SERVER_SEAT) {
        const r = m.rolled;
        totals.set(r.seat, r.total);
        rows.get(r.seat)!.textContent = String(r.total);
        spin = 300;
        setTimeout(() => { die.textContent = '⚀⚁⚂⚃⚄⚅'[r.value - 1]; }, 320);
      } else if (m._isChat) {
        const who = round.seats.find((s) => s.seat === msg.from)?.name ?? '?';
        chatLog.prepend(el('div', { textContent: `${who}: ${m.chat}` }));
      } else if (m._isPointer) {
        let dot = pointers.get(msg.from);
        if (!dot) box.append((dot = el('span', { className: 'ex-pointer' })));
        pointers.set(msg.from, dot);
        dot.style.left = `${m.pointer.x * 100}%`;
        dot.style.top = `${m.pointer.y * 100}%`;
      }
    });
    const offFinished = ctx.rooms.on('finished', (f) => {
      offMessage();
      offFinished();
      void finished(round, f.results);
    });
    ctx.signal.addEventListener('abort', () => { offMessage(); offFinished(); }, { once: true });
  }

  async function finished(round: RoundStart, data: Uint8Array): Promise<void> {
    const res = unpackGame(Results, data);
    const won = res.winner === round.you;
    const winner = round.seats.find((s) => s.seat === res.winner)?.name ?? '?';
    const stats = await loadStats(ctx);
    stats.rounds++;
    if (won) stats.wins++;
    await ctx.storage.put('stats', packGame(Stats, (s) => { s.rounds = stats.rounds; s.wins = stats.wins; }));
    let note = `${winner} won in ${res.rolls} rolls.`;
    if (won) {
      const t = await ctx.scores.submit('fewest-rolls', res.rolls, playerName() || 'Player');
      note += t.rank ? ` That is place ${t.rank} in the table of fewest rolls.` : ' It did not make the table of fewest rolls.';
    }
    ctx.rooms.leave();
    menu(note);
  }

  menu();
  return {
    stop() {
      // listeners (ctx.signal), the animation (ctx.frame), the connection and the audio end by themselves
      root.remove();
    },
  };
};
