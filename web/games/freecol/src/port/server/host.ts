// The server worker's side (protocol.ts): FreeCol's servers live here, as the original runs its server in
// threads of its own beside the client. The client worker asks for a server (with the rules the player
// chose, as XML), connects sockets to it (pipes) and asks it to save; the server's AI and turns run here,
// so the client stays responsive while they compute. The server waits only where the original's server
// threads wait for a client (the reply to a request it sent): then it takes in what the client sends meanwhile.
import { Socket, Pipe, InetSocketAddress, InetAddress } from '../../jre/net.ts';
import { $J, File, ByteArrayInputStream, StringWriter, vfs, Logger, Level } from '../../jre/index.ts';
import { Ring, json } from '../ring.ts';
import { S_DATA, S_CLOSE, S_REPLY, C_DATA, C_CLOSE, C_CALL, withId, u32, idOf } from '../protocol.ts';
import { pumpReceivers } from '../receiving.ts';

import { listening } from '../Server.ts';
import type { Lockstep } from './lockstep.ts';

export class ServerHost {
  toClient: Ring;
  fromClient: Ring;
  bell: Int32Array;
  pipes = new Map<number, Pipe>();
  java: (n: string) => any;
  jnew: (n: string, sig: string, ...a: any[]) => any;
  jmethod: (c: string, sig: string) => string;
  servers: any[] = [];
  /** online play (lockstep.ts): the local client's connections to the game's server go through it */
  lockstep: Lockstep | null = null;

  constructor(fc: { java: any; jnew: any; jmethod: any }, toClient: Ring, fromClient: Ring) {
    this.java = fc.java;
    this.jnew = fc.jnew;
    this.jmethod = fc.jmethod;
    this.toClient = toClient;
    this.fromClient = fromClient;
    this.bell = fromClient.bell;
  }

  /** Writes to the client, waiting while its ring is full. */
  out(type: number, body: Uint8Array) {
    while (!this.toClient.write(type, body)) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5);
  }

  reply(id: number, ok: boolean, value: any) {
    this.out(S_REPLY, json.encode(ok ? { id, ok, value } : { id, ok, error: String(value) }));
  }

  /** Handles everything the client sent; true if there was something. */
  drain(): boolean {
    let any = false;
    for (let m = this.fromClient.read(); m; m = this.fromClient.read()) {
      any = true;
      this.handle(m.type, m.body);
    }
    return any;
  }

  /** Blocks until cond() holds or ms pass, handling what the client sends meanwhile (a server thread's wait). */
  waitUntil(cond: () => boolean, ms?: number): boolean {
    const end = ms == null || ms <= 0 ? Infinity : performance.now() + ms;
    for (;;) {
      if (cond()) return true;
      const v = Atomics.load(this.bell, 0);
      if (this.drain()) continue;
      // online, another seat's stand-in answers at once (lockstep.ts): its reply is there to read
      if (this.lockstep && pumpReceivers()) continue;
      const left = end - performance.now();
      if (left <= 0) return false;
      Atomics.wait(this.bell, 0, v, Math.min(left, 100));
    }
  }

  handle(type: number, body: Uint8Array) {
    switch (type) {
    case C_DATA: {
      if (this.lockstep?.local.has(idOf(body))) {
        this.lockstep.data(idOf(body), body.slice(4));
        break;
      }
      const p = this.pipes.get(idOf(body));
      if (p) {
        p.receive(body.slice(4));
        pumpReceivers();
      }
      break;
    }
    case C_CLOSE: {
      const id = idOf(body);
      if (this.lockstep?.local.has(id)) {
        this.lockstep.close(id);
        break;
      }
      const p = this.pipes.get(id);
      if (p) {
        p.closed = true;
        this.pipes.delete(id);
        pumpReceivers();
      }
      break;
    }
    case C_CALL: {
      const m = json.decode(body);
      try {
        this.reply(m.id, true, (this as any)['op_' + m.op](m.args));
      } catch (e) {
        const x = $J.exc(e);
        Logger.getLogger('net.sf.freecol.server.FreeColServer').log(Level.WARNING, 'Server worker: ' + m.op + ' failed', x);
        this.reply(m.id, false, x?.toString?.() ?? e);
      }
      break;
    }
    }
  }

  op_connect(a: { pipe: number; host: string; port: number }) {
    const fcs = listening.get(a.port);
    if (!fcs) return false;
    const pipe = new Pipe(a.pipe, (bytes) => this.out(S_DATA, withId(a.pipe, bytes)));
    pipe.onClose = () => {
      this.out(S_CLOSE, u32(a.pipe));
      this.pipes.delete(a.pipe);
    };
    if (this.lockstep && fcs === this.lockstep.server) {
      // online: the connection opens when its entry comes (lockstep.ts)
      this.lockstep.open(pipe);
      return true;
    }
    this.pipes.set(a.pipe, pipe);
    const socket = Socket.$ofPipe(pipe, new InetSocketAddress(InetAddress.getLoopbackAddress(), 40000 + a.pipe));
    fcs.addNewUserConnection(socket);
    return true;
  }

  spec(xml: string) {
    const Specification = this.java('net.sf.freecol.common.model.Specification');
    return new Specification()[Specification.$meta.ctors['java.io.InputStream']](new ByteArrayInputStream(new TextEncoder().encode(xml)));
  }

  /** FreeColClient.startServer(publicServer, singlePlayer, spec, address, port). */
  op_startServer(a: { publicServer: boolean; singlePlayer: boolean; spec: string; port: number }) {
    const fcs = this.jnew('net.sf.freecol.server.FreeColServer',
      'boolean,boolean,net.sf.freecol.common.model.Specification,java.net.InetAddress,int,java.lang.String',
      a.publicServer, a.singlePlayer, this.spec(a.spec), null, a.port, null);
    this.servers.push(fcs);
    return { host: fcs.getHost(), port: fcs.getPort() };
  }

  /** FreeColClient.startServer(publicServer, singlePlayer, saveFile, address, port, name). */
  op_loadServer(a: { publicServer: boolean; name: string; save: number[]; port: number }) {
    const path = '/server/load-' + Date.now() + '.fsg';
    vfs.write(path, Uint8Array.from(a.save));
    const fsg = this.jnew('net.sf.freecol.common.io.FreeColSavegameFile', 'java.io.File', new File(path));
    const fcs = this.jnew('net.sf.freecol.server.FreeColServer',
      'net.sf.freecol.common.io.FreeColSavegameFile,net.sf.freecol.common.model.Specification,java.net.InetAddress,int,java.lang.String',
      fsg, null, null, a.port, a.name);
    fcs.setPublicServer(a.publicServer);
    this.servers.push(fcs);
    return { host: fcs.getHost(), port: fcs.getPort() };
  }

  find(port: number) {
    const fcs = listening.get(port);
    if (!fcs) throw new Error('no server on port ' + port);
    return fcs;
  }

  /** FreeColServer.saveGame(file, clientOptions, activeUnit): the save's bytes. */
  op_save(a: { port: number; options: string | null; activeUnit: string | null }) {
    const fcs = this.find(a.port);
    const path = '/server/save-' + Date.now() + '.fsg';
    let options = null;
    if (a.options != null) {
      const OptionGroup = this.java('net.sf.freecol.common.option.OptionGroup');
      const FreeColXMLReader = this.java('net.sf.freecol.common.io.FreeColXMLReader');
      const xr = new FreeColXMLReader()[FreeColXMLReader.$meta.ctors['java.io.InputStream']](new ByteArrayInputStream(new TextEncoder().encode(a.options)));
      xr.nextTag();
      options = new OptionGroup()[OptionGroup.$meta.ctors['net.sf.freecol.common.io.FreeColXMLReader,net.sf.freecol.common.model.Specification']](xr, fcs.getSpecification());
    }
    const unit = a.activeUnit == null ? null : fcs.getGame().getFreeColGameObject$String(a.activeUnit);
    fcs[this.jmethod('net.sf.freecol.server.FreeColServer', 'saveGame(java.io.File,net.sf.freecol.common.option.OptionGroup,net.sf.freecol.common.model.Unit)')](new File(path), options, unit);
    const bytes = vfs.read(path);
    vfs.remove(path);
    return Array.from(bytes ?? []);
  }

  op_setInitialActiveUnitId(a: { port: number; id: string }) {
    this.find(a.port).getGame().setInitialActiveUnitId(a.id);
    return true;
  }

  op_state(a: { port: number }) {
    return this.find(a.port).getServerState().name();
  }

  op_setSkippedTurns(a: { port: number; turns: number }) {
    this.find(a.port).getInGameController().setSkippedTurns(a.turns);
    return true;
  }

  op_shutdown(a: { port: number }) {
    const fcs = listening.get(a.port);
    if (fcs) fcs.getController().shutdown();
    return true;
  }
}
void StringWriter;
