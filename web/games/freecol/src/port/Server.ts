// FreeCol's net.sf.freecol.server.networking.Server without sockets: the server's set of connections.
// In the original, a thread accepts TCP connections; here clients and AI players are attached as
// in-memory connections (the browser has no server sockets). Same API, same names as the translated
// callers use (re/freecol/tools/j2ts conventions: init method _Server, overloads name$Types).
import { $J, JObject, Level, Logger } from '../jre/index.ts';

/** The servers listening, by port: the server worker connects clients' pipes to them (server/host.ts). */
export const listening = new Map<number, any>();

export class Server extends JObject {
  static logger: any = null;
  freeColServer: any = null;
  host: string | null = null;
  port = 0;
  running = true;
  /** In the original a HashMap keyed by sockets (identity hashes); here in the order of attachment. */
  connections: any[] = [];

  _Server(freeColServer: any, host: string, port: number): this {
    this.freeColServer = freeColServer;
    this.host = host;
    this.port = port;
    listening.set(port, freeColServer);
    return this;
  }
  getHost(): string | null {
    return this.host;
  }
  getPort(): number {
    return this.port;
  }
  getConnection(_socket: any): any {
    return null;
  }
  addDummyConnection(connection: any): void {
    if (!this.running) return;
    this.connections.push(connection);
  }
  addConnection(connection: any): void {
    if (!this.running) return;
    if (!this.connections.includes(connection)) this.connections.push(connection);
  }
  removeConnection(connection: any): void {
    const i = this.connections.indexOf(connection);
    if (i >= 0) this.connections.splice(i, 1);
  }
  setMessageHandlerToAllConnections(mh: any): void {
    for (const c of this.connections) c.setMessageHandler(mh);
  }
  sendToAll$Message$Connection(message: any, exceptConnection: any): void {
    for (const conn of this.connections.slice()) {
      if (conn === exceptConnection) continue;
      if (conn.isAlive()) {
        try {
          conn.sendMessage(message);
        } catch (ex) {
          Server.logger.log(Level.WARNING, 'Unable to send to: ' + $J.str(conn), $J.exc(ex));
        }
      } else {
        Server.logger.log(Level.INFO, 'Reap dead connection: ' + $J.str(conn));
        this.removeConnection(conn);
      }
    }
  }
  sendToAll$Message(message: any): void {
    this.sendToAll$Message$Connection(message, null);
  }
  setCommsLogging(log: boolean): void {
    for (const conn of this.connections) conn.setCommsLogging(log);
  }
  /** The original's accept loop; nothing to accept here. */
  start(): void {}
  run(): void {}
  shutdown(): void {
    this.running = false;
    if (listening.get(this.port) === this.freeColServer) listening.delete(this.port);
    for (const c of this.connections.slice()) if (c.isAlive()) c.disconnect();
    this.connections = [];
    this.freeColServer.removeFromMetaServer();
  }
  static $clinit() {
    Server.logger = Logger.getLogger('net.sf.freecol.server.networking.Server');
  }
}
$J.define(Server, 'net.sf.freecol.server.networking.Server', {
  kind: 'class', sup: 'java.lang.Thread',
  ctors: { 'net.sf.freecol.server.FreeColServer,java.lang.String,int': '_Server' },
});
Server.$clinit();
