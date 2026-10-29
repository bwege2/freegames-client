// The server worker (re/freecol/NOTES.md, "The client"): FreeCol's servers and their AI players, as the
// original runs them in threads of its own beside the client. It handles what the client worker sends
// (server/host.ts) when woken, and writes back into shared memory, where the client finds it even while it
// waits. It blocks only where the original's server waits for a client's reply (Object.wait in
// NetworkReplyObject), and takes in what the client sends meanwhile. Online (server/lockstep.ts), it runs the
// round's game in lockstep with the other players' browsers.
import * as fc from '../../freecol.ts';
import { $J, vfs } from '../../jre/index.ts';
import { Ring } from '../ring.ts';
import { ServerHost } from '../server/host.ts';
import { Lockstep, type OnlineInit, type Out, type Entry } from '../server/lockstep.ts';
import { installReceiving } from '../receiving.ts';
import { indexProvider, type FileIndex } from './files.ts';

export type ServerInit = {
  files: FileIndex;
  locale: string;
  toClient: SharedArrayBuffer;
  bell: SharedArrayBuffer;
  fromClient: SharedArrayBuffer;
  serverBell: SharedArrayBuffer;
  /** online play: the round */
  online?: OnlineInit;
};

export type ServerPlatform = {
  load: (url: string) => Uint8Array | null;
  /** online play: what goes to the server module (the page sends it) */
  send?: (m: Out) => void;
};

export type ServerWorker = {
  /** the client worker wrote into the ring */
  ping: () => void;
  /** online play: an entry of the round, in any order (applied in theirs) */
  entry: (e: Entry) => void;
  /** online play, a seat that came back: entries before this index were its earlier session's */
  liveFrom: (index: number) => void;
};

/** Sets the server worker up. */
export function runServer(init: ServerInit, platform: ServerPlatform): ServerWorker {
  vfs.provider = indexProvider(init.files, platform.load);
  $J.properties.set('user.name', 'player');
  installReceiving(fc.java);
  fc.bootFreeCol(init.locale);
  const host = new ServerHost(fc, new Ring(init.toClient, init.bell), new Ring(init.fromClient, init.serverBell));
  // Object.wait/notify on the server: a wait takes in the client's messages until it is notified
  const notified = new Map<any, number>();
  $J.threads = {
    monitorWait(o: any, ms?: number) {
      const gen = notified.get(o) ?? 0;
      host.waitUntil(() => (notified.get(o) ?? 0) !== gen, ms);
    },
    monitorNotify(o: any, _all: boolean) {
      notified.set(o, (notified.get(o) ?? 0) + 1);
    },
    // as without threads: no waiting and no other threads to wait for
    isAlive: () => false,
    join() {},
    sleep() {},
    park() {},
    unpark() {},
    parkForever: () => ({ $parked: true }),
  };
  if (init.online) {
    host.lockstep = new Lockstep(fc, init.online, (m) => platform.send?.(m), () => {});
    host.lockstep.start();
  }
  return {
    ping: () => {
      host.drain();
    },
    entry: (e: Entry) => host.lockstep?.entry(e),
    liveFrom: (index: number) => {
      if (host.lockstep) host.lockstep.liveFrom = index;
    },
  };
}
