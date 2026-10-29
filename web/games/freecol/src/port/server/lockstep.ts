// Online play in the server worker: deterministic lockstep (protocol/games/freecol.capnp). Every browser runs
// the same FreeCol server (and its AI) from the round's seed. What this browser's FreeCol client sends its server
// is not handed to the server here: it goes out as commands (open a connection, a line, close it), and the
// site's server module sends every browser's commands back to everyone, in one order, as entries. Each browser
// applies the entries to its server: a seat's entries to that seat's connection, which here is a pipe to the
// client for the own seat and a stand-in for the others' (it takes what the server sends them and answers the
// server's questions at once, as FreeCol clients do: every client reply is empty). Every entry's work, the AI's
// included, is finished before the next one: the threads it starts run in order, so every browser's server
// does the same. After an entry that changed whose turn it is, the browser reports it (and with a new turn a
// hash of the saved game) for the module to compare.
import { Socket, Pipe, InetSocketAddress, InetAddress } from '../../jre/net.ts';
import { $J, Random, Collections } from '../../jre/index.ts';
import { pumpReceivers } from '../receiving.ts';

export type OnlineInit = {
  seat: number;
  /** the round's seed (a 64-bit number, as decimal) */
  seed: string;
  rules: string;
  difficulty: string;
  /** the port FreeCol's server listens on (the client connects to it) */
  port: number;
};

export type Entry = { index: number; seat: number; salt: number; kind: 'line' | 'open' | 'close' | 'drop' | 'computer'; line: Uint8Array | null };

/** What the lockstep sends out: to the module (commands, reports, the end). */
export type Out =
  | { t: 'command'; kind: 'line' | 'open' | 'close'; line?: Uint8Array }
  | { t: 'report'; index: number; turn: number; current: number; hash: bigint }
  | { t: 'over'; index: number; winner: number };

const enc = new TextEncoder();
const dec = new TextDecoder();

/** FNV-1a in two 32-bit lanes (fast on long strings), as a 64-bit hash */
export function hash64(s: string): bigint {
  let a = 0x811c9dc5, b = 0x050c5d1f;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193);
    b = Math.imul(b ^ c ^ (i & 0xff), 0x01000193);
  }
  return (BigInt(a >>> 0) << 32n) | BigInt(b >>> 0);
}

export class Lockstep {
  fc: any;
  init: OnlineInit;
  out: (m: Out) => void;
  /** reply-out: bytes to the local client on a pipe */
  toClient: (pipeId: number, bytes: Uint8Array) => void;
  server: any = null;
  seed: bigint;
  /** entries waiting for their turn (by index) */
  waiting = new Map<number, Entry>();
  next = 0;
  /** entries before this index were made by an earlier session of this browser (a seat that came back) */
  liveFrom = 0;
  /** the client's connections opened here and not yet applied (their open entry is on its way) */
  pendingLocal: Pipe[] = [];
  /** each seat's connection in the server */
  conns = new Map<number, Pipe>();
  /** the local client's pipes, by id, with the part of a line received so far */
  local = new Map<number, { pipe: Pipe; partial: string }>();
  ghostIds = 100000;
  threads: any[] = [];
  lastTurn = -1;
  lastCurrent = -2;
  ended = false;
  applying = false;

  constructor(fc: any, init: OnlineInit, out: (m: Out) => void, toClient: (pipeId: number, bytes: Uint8Array) => void) {
    this.fc = fc;
    this.init = init;
    this.out = out;
    this.toClient = toClient;
    this.seed = BigInt.asIntN(64, BigInt(init.seed));
  }

  /** The game's server, as a new network game of the round's rules, every random source from the round's seed. */
  start() {
    const fc = this.fc;
    // the threads the server starts (one per message, the AI's) run in order after each entry
    $J.startThread = (t: any) => this.threads.push(t);
    const FreeCol = fc.java('net.sf.freecol.FreeCol');
    const FreeColRules = fc.java('net.sf.freecol.common.io.FreeColRules');
    const NameCache = fc.java('net.sf.freecol.common.i18n.NameCache');
    const spec = FreeCol.loadSpecification(FreeColRules.getFreeColRulesFile(this.init.rules), null, 'model.difficulty.' + this.init.difficulty);
    // the game's UUID (in every saved game) the same in every browser
    const UUID = fc.java('java.util.UUID');
    const ids = new Random(this.seed ^ 0x75756964n);
    UUID.randomUUID = () => {
      const h = '0123456789abcdef';
      let s = '';
      for (let i = 0; i < 36; i++) s += i === 8 || i === 13 || i === 18 || i === 23 ? '-' : i === 14 ? '4' : h[ids.nextInt(16)];
      return new UUID(s);
    };
    const random = new Random(this.seed);
    const server = fc.jnew('net.sf.freecol.server.FreeColServer',
      'boolean,boolean,net.sf.freecol.common.model.Specification,java.net.InetAddress,int,java.lang.String',
      false, false, spec, null, this.init.port, null);
    server.setServerRandom(random);
    server.getInGameController().setRandom(random);
    NameCache.clearCitiesOfCibola();
    server.setGame(fc.jnew('net.sf.freecol.server.model.ServerGame', 'net.sf.freecol.common.model.Specification,java.util.Random', spec, random));
    server.setMapGenerator(fc.jnew('net.sf.freecol.server.generator.SimpleMapGenerator', 'java.util.Random', random));
    (Collections as any).r = new Random(this.seed ^ 0x5eedn);
    this.server = server;
    this.runThreads();
  }

  /** The local client opens a connection to the server: an open command; the pipe waits for its entry. */
  open(pipe: Pipe) {
    this.local.set(pipe.id, { pipe, partial: '' });
    this.pendingLocal.push(pipe);
    this.out({ t: 'command', kind: 'open' });
  }

  /** Bytes from the local client: its replies to the server go in at once, everything else out as commands. */
  data(pipeId: number, bytes: Uint8Array) {
    const l = this.local.get(pipeId);
    if (!l) return;
    l.partial += dec.decode(bytes, { stream: true });
    let i: number;
    while ((i = l.partial.indexOf('\n')) >= 0) {
      const line = l.partial.substring(0, i);
      l.partial = l.partial.substring(i + 1);
      if (line.startsWith('<reply')) {
        // an answer to this browser's server (every browser's server gets the same empty answer from the seat)
        l.pipe.receive(enc.encode(line + '\n'));
        pumpReceivers();
      } else if (line.length) {
        this.out({ t: 'command', kind: 'line', line: enc.encode(line) });
      }
    }
  }

  close(pipeId: number) {
    if (!this.local.delete(pipeId)) return;
    this.out({ t: 'command', kind: 'close' });
  }

  /** An entry from the module; entries are applied in their order, each when the previous one is done. */
  entry(e: Entry) {
    if (e.index < this.next || this.ended) return;
    this.waiting.set(e.index, e);
    if (this.applying) return; // the outer call applies it
    this.applying = true;
    try {
      for (let x = this.waiting.get(this.next); x; x = this.waiting.get(this.next)) {
        this.waiting.delete(this.next);
        this.apply(x);
        this.next++;
        this.check(x.index);
      }
    } finally {
      this.applying = false;
    }
  }

  apply(e: Entry) {
    const server = this.server;
    // the salt: nobody can know the server's next random numbers before the entry is there
    server.getServerRandom().setSeed(this.seed ^ (BigInt(e.salt >>> 0) << 20n) ^ BigInt(e.index));
    switch (e.kind) {
    case 'open': {
      this.disconnect(e.seat);
      const own = e.seat === this.init.seat && e.index >= this.liveFrom && this.pendingLocal.length > 0;
      const pipe = own ? this.pendingLocal.shift()! : this.ghost();
      this.conns.set(e.seat, pipe);
      server.addNewUserConnection(Socket.$ofPipe(pipe, new InetSocketAddress(InetAddress.getLoopbackAddress(), 40000 + e.seat)));
      break;
    }
    case 'line': {
      const pipe = this.conns.get(e.seat);
      if (pipe && !pipe.closed && e.line) {
        pipe.receive(concat(e.line, NEWLINE));
        pumpReceivers();
      }
      break;
    }
    case 'close':
    case 'drop':
      this.disconnect(e.seat);
      break;
    case 'computer': {
      const player = this.playerOf(e.seat);
      this.disconnect(e.seat);
      if (player && !player.isAI()) {
        const game = server.getGame();
        game.changeAI(player, true);
        // on turn: the computer ends it, and plays from the next turn on
        if (game.getCurrentPlayer() === player) {
          const cs = server.getInGameController().endTurn(player);
          if (cs != null) game.sendToAll(cs);
        }
      }
      break;
    }
    }
    this.runThreads();
  }

  /** A stand-in for another browser's client: it reads nothing and answers each question of the server at once. */
  ghost(): Pipe {
    const text = new TextDecoder();
    let partial = '';
    const pipe: Pipe = new Pipe(this.ghostIds++, (bytes: Uint8Array) => {
      partial += text.decode(bytes, { stream: true });
      let i: number;
      while ((i = partial.indexOf('\n')) >= 0) {
        const line = partial.substring(0, i);
        partial = partial.substring(i + 1);
        const m = /^<question[^>]*? networkReplyId="(\d+)"/.exec(line);
        if (m && !pipe.closed) pipe.receive(enc.encode('<reply networkReplyId="' + m[1] + '"/>\n'));
      }
    });
    return pipe;
  }

  disconnect(seat: number) {
    const pipe = this.conns.get(seat);
    if (!pipe) return;
    this.conns.delete(seat);
    if (!pipe.closed) {
      pipe.closed = true;
      pumpReceivers();
    }
  }

  /** the server's player on a seat's connection */
  playerOf(seat: number): any {
    const pipe = this.conns.get(seat);
    if (!pipe) return null;
    const players = this.server.getGame()?.getLivePlayerList([]);
    for (let i = 0; players && i < players.size(); i++) {
      const p = players.get(i);
      if (p.getConnection?.()?.getSocket?.()?.pipe === pipe) return p;
    }
    return null;
  }

  /** the seat whose player is on turn; 255 for a computer player or none */
  seatOf(player: any): number {
    if (player == null || player.isAI()) return 255;
    for (const [seat, pipe] of this.conns) if (player.getConnection?.()?.getSocket?.()?.pipe === pipe) return seat;
    return 255;
  }

  /** The threads the entry started, and the ones those started, in order. */
  runThreads() {
    while (this.threads.length) {
      const t = this.threads.shift();
      try {
        t.run();
      } catch (e: any) {
        if (!e?.$parked) console.warn('FreeCol server thread: ' + ((e as any)?.toString?.() ?? e));
      }
    }
  }

  /** After an entry: a report when the turn or the player on turn changed; the end of the game. */
  check(index: number) {
    const game = this.server.getGame();
    const ServerState = this.fc.java('net.sf.freecol.server.FreeColServer$ServerState');
    const inGame = this.server.getServerState() !== ServerState.PRE_GAME && this.server.getServerState() !== ServerState.LOAD_GAME;
    const turn = inGame && game?.getTurn() ? game.getTurn().getNumber() : 0;
    const current = inGame ? this.seatOf(game.getCurrentPlayer()) : 255;
    if (turn === this.lastTurn && current === this.lastCurrent) return;
    const hash = turn !== this.lastTurn && turn > 0 ? this.hash() : 0n;
    this.lastTurn = turn;
    this.lastCurrent = current;
    this.out({ t: 'report', index, turn, current, hash });
    if (inGame && !this.ended) {
      const winner = game.checkForWinner?.();
      if (winner != null || this.server.getServerState() === ServerState.END_GAME) {
        this.ended = true;
        this.out({ t: 'over', index, winner: winner == null ? 255 : this.seatOf(winner) });
      }
    }
  }

  /** a hash of the whole game as a saved game holds it */
  hash(): bigint {
    const WriteScope = this.fc.java('net.sf.freecol.common.io.FreeColXMLWriter$WriteScope');
    const ser = this.fc.jmethod('net.sf.freecol.common.model.FreeColObject', 'serialize(net.sf.freecol.common.io.FreeColXMLWriter$WriteScope)');
    const xml: string = this.server.getGame()[ser](WriteScope.toSave());
    (globalThis as any).freecolHashed?.(this.init.seat, xml); // tests: what was hashed
    return hash64(xml);
  }
}

const NEWLINE = new Uint8Array([10]);
function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const r = new Uint8Array(a.length + b.length);
  r.set(a);
  r.set(b, a.length);
  return r;
}
