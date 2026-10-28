// The shared lobby screen for online multiplayer, so every game's online mode works the same way:
// your name, the open rooms (join), a new room (create), then the room itself (seats, ready, start).
// Resolves with the round once the host starts it. Plain DOM; it styles itself (fg-lobby-*).
import type { Rooms, RoomState, RoundStart } from './rooms.ts';
import { playerName, ServerError } from './net/client.ts';

export interface LobbyOptions {
  /** heading, e.g. "Ballerburg online" */
  title?: string;
  /** seat choices for a new room; default: only the game's maximum */
  seats?: { min: number; max: number; default?: number };
  /** names of the seats ("White", "Black"), shown next to the players */
  seatNames?: string[];
  /** the game's options for a new room (its own schema) */
  options?: () => Uint8Array;
  /**
   * The game's rounds keep running while players come and go: the list also shows running rooms and
   * joining one puts you in the running round (the game gets `started` and its `joined` events).
   */
  dropIn?: boolean;
}

const CSS = `
.fg-lobby { box-sizing: border-box; max-width: 34rem; margin: 2rem auto; padding: 1.25rem 1.5rem; font: 15px/1.45 system-ui, sans-serif;
  color: #1d2125; background: #fff; border-radius: 10px; box-shadow: 0 2px 16px rgb(0 0 0 / .25); }
.fg-lobby h2 { margin: 0 0 .75rem; font-size: 1.25rem; }
.fg-lobby h3 { margin: 1.1rem 0 .4rem; font-size: .95rem; text-transform: uppercase; letter-spacing: .04em; color: #5b6570; }
.fg-lobby label { display: flex; gap: .5rem; align-items: center; margin: .3rem 0; }
.fg-lobby input, .fg-lobby select { font: inherit; padding: .3rem .45rem; border: 1px solid #b8c0c8; border-radius: 6px; min-width: 0; }
.fg-lobby input[type=text], .fg-lobby input[type=password] { flex: 1; }
.fg-lobby button { font: inherit; padding: .35rem .9rem; border: 1px solid #2f6fdf; background: #2f6fdf; color: #fff; border-radius: 6px; cursor: pointer; }
.fg-lobby button.fg-lobby-quiet { background: transparent; color: #2f6fdf; }
.fg-lobby button:disabled { opacity: .45; cursor: default; }
.fg-lobby ul { list-style: none; margin: 0; padding: 0; }
.fg-lobby li { display: flex; align-items: center; gap: .6rem; padding: .4rem 0; border-bottom: 1px solid #e6e9ec; }
.fg-lobby li > span:first-child { flex: 1; }
.fg-lobby .fg-lobby-muted { color: #6b7580; }
.fg-lobby li.fg-lobby-mine { font-weight: 600; }
.fg-lobby .fg-lobby-error { color: #b3261e; min-height: 1.4em; margin: .5rem 0 0; }
.fg-lobby .fg-lobby-row { display: flex; gap: .5rem; flex-wrap: wrap; margin-top: .9rem; }
`;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...kids: (Node | string)[]): HTMLElementTagNameMap[K] {
  const e = Object.assign(document.createElement(tag), props);
  e.append(...kids);
  return e;
}

/**
 * The rooms the lobby offers: first the running ones you are still seated in (to rejoin after a reload),
 * then free rooms, and running ones when the game's rounds take drop-ins.
 */
export function joinableRooms(all: RoomState[], dropIn: boolean, mine: (r: RoomState) => boolean = () => false): RoomState[] {
  const yours = all.filter(mine);
  return [...yours, ...all.filter((r) => !mine(r) && (dropIn || !r.started) && r.seats.length < r.maxSeats)];
}

/** Shows the lobby in `host` (replacing its content) until a round starts or the player cancels. */
export function openLobby(host: HTMLElement, rooms: Rooms, o: LobbyOptions = {}, signal?: AbortSignal): Promise<RoundStart> {
  if (!document.getElementById('fg-lobby-css')) document.head.append(el('style', { id: 'fg-lobby-css', textContent: CSS }));
  const box = el('div', { className: 'fg-lobby' });
  host.replaceChildren(box);
  const off: (() => void)[] = [];
  let timer: ReturnType<typeof setInterval> | undefined;

  return new Promise<RoundStart>((resolve, reject) => {
    const done = (fn: () => void) => {
      clearInterval(timer);
      for (const f of off.splice(0)) f();
      box.remove();
      fn();
    };
    const cancel = () => done(() => {
      rooms.leave();
      reject(new Error('cancelled'));
    });
    signal?.addEventListener('abort', cancel, { once: true });
    const errorLine = el('p', { className: 'fg-lobby-error' });
    const fail = (e: unknown) => { errorLine.textContent = e instanceof ServerError || e instanceof Error ? e.message : String(e); };

    off.push(rooms.on('started', (r) => done(() => resolve(r))));
    off.push(rooms.on('update', (r) => showRoom(r)));
    off.push(rooms.on('closed', (c) => { if (c.reason !== 'left') fail(`Room closed: ${c.reason}`); showList(); }));

    // ---------------------------------------------------------------- the room list
    function showList(): void {
      clearInterval(timer);
      const name = el('input', { type: 'text', value: playerName(), maxLength: 24, placeholder: 'Your name' });
      let renaming: Promise<void> = Promise.resolve();
      name.addEventListener('change', () => { renaming = rooms.net.rename(name.value).catch(fail); });
      const list = el('ul');
      const refresh = async () => {
        await renaming;
        try {
          const all = await rooms.list();
          const open = joinableRooms(all, !!o.dropIn, (r) => rooms.isMine(r));
          list.replaceChildren(...(open.length ? open.map(roomRow) : [el('li', {}, el('span', { className: 'fg-lobby-muted', textContent: 'No open rooms yet: create one.' }))]));
        } catch (e) { fail(e); }
      };
      const roomRow = (r: RoomState) => {
        const mine = rooms.isMine(r);
        const join = el('button', { textContent: mine ? 'Rejoin' : 'Join' });
        join.onclick = async () => {
          await renaming;
          let pw = '';
          if (r.locked && !mine) {
            pw = window.prompt(`Password for "${r.name}"`) ?? '';
            if (!pw) return;
          }
          try { await rooms.join(r.id, pw); } catch (e) { fail(e); }
        };
        return el('li', { className: mine ? 'fg-lobby-mine' : '' }, el('span', {}, `${r.name}${r.locked ? ' 🔒' : ''}${mine ? ' (your game)' : r.started ? ' (running)' : ''}`),
          el('span', { className: 'fg-lobby-muted', textContent: `${r.seats.length}/${r.maxSeats}` }), join);
      };

      const roomName = el('input', { type: 'text', maxLength: 32, placeholder: 'Room name' });
      const password = el('input', { type: 'password', maxLength: 32, placeholder: 'Password (optional)' });
      const seats = el('select');
      const min = o.seats?.min ?? 0, max = o.seats?.max ?? 0;
      if (max > 0) for (let n = min; n <= max; n++) seats.append(el('option', { value: String(n), textContent: `${n} players`, selected: n === (o.seats?.default ?? max) }));
      const create = el('button', { textContent: 'Create room' });
      create.onclick = async () => {
        await renaming;
        try {
          await rooms.create({
            name: roomName.value.trim() || `${name.value.trim() || 'My'}'s room`,
            maxSeats: max > 0 ? Number(seats.value) : 0,
            password: password.value,
            options: o.options?.(),
          });
        } catch (e) { fail(e); }
      };
      const back = el('button', { className: 'fg-lobby-quiet', textContent: 'Cancel' });
      back.onclick = cancel;

      box.replaceChildren(
        el('h2', { textContent: o.title ?? 'Play online' }),
        el('label', {}, 'Name', name),
        el('h3', { textContent: 'Open rooms' }), list,
        el('h3', { textContent: 'New room' }),
        el('label', {}, roomName),
        ...(max > 0 && max > min ? [el('label', {}, seats)] : []),
        el('label', {}, password),
        el('div', { className: 'fg-lobby-row' }, create, back),
        errorLine);
      void refresh();
      timer = setInterval(refresh, 3000);
    }

    // ---------------------------------------------------------------- inside a room
    function showRoom(r: RoomState): void {
      clearInterval(timer);
      errorLine.textContent = '';
      const me = r.seats.find((s) => s.seat === r.you);
      const isHost = r.host === r.you;
      const seatsList = el('ul');
      for (let i = 0; i < r.maxSeats; i++) {
        const s = r.seats.find((x) => x.seat === i);
        const label = o.seatNames?.[i] ?? `Seat ${i + 1}`;
        seatsList.append(el('li', {},
          el('span', {}, `${label}: `, s ? `${s.name}${s.seat === r.you ? ' (you)' : ''}` : el('span', { className: 'fg-lobby-muted', textContent: 'free' })),
          el('span', { className: 'fg-lobby-muted', textContent: !s ? '' : s.seat === r.host ? 'host' : !s.connected ? 'away' : s.ready ? 'ready ✓' : 'not ready' })));
      }
      const row = el('div', { className: 'fg-lobby-row' });
      if (isHost) {
        const others = r.seats.filter((s) => s.seat !== r.host);
        const start = el('button', { textContent: 'Start', disabled: r.seats.length < (o.seats?.min ?? 1) || others.some((s) => !s.ready) });
        start.onclick = async () => { try { await rooms.start(); } catch (e) { fail(e); } };
        row.append(start);
      } else {
        const ready = el('button', { textContent: me?.ready ? 'Not ready' : 'Ready' });
        ready.onclick = () => rooms.ready(!me?.ready);
        row.append(ready);
      }
      const leave = el('button', { className: 'fg-lobby-quiet', textContent: 'Leave room' });
      leave.onclick = () => { rooms.leave(); showList(); };
      row.append(leave);
      box.replaceChildren(
        el('h2', { textContent: r.name }),
        el('p', { className: 'fg-lobby-muted', textContent: isHost ? 'Start when everybody is ready.' : 'The host starts the game when everybody is ready.' }),
        seatsList, row, errorLine);
    }

    if (rooms.room) showRoom(rooms.room);
    else showList();
  });
}
