// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/networking/UserServerAPI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, IOException } from '../../../../../../jre/index.ts';
import { ServerAPI } from '../../common/networking/ServerAPI.ts';

let FreeCol, FreeColXMLWriter$WriteScope, Connection;

/**
 * Implementation of the ServerAPI for a player with a real connection
 * to the server.
 */
export class UserServerAPI extends ServerAPI {
  /**
   * The connection used to communicate with the server.
   */
  connection: Connection = null;
  /**
   * The last name used to login with.
   */
  name: string = null;
  /**
   * The last host connected to.
   */
  host: string = null;
  /**
   * The last port connected to.
   */
  port: number = 0;
  /**
   * The last message handler specified.
   */
  messageHandler: MessageHandler = null;
  /**
   * Create the new user wrapper for the server API.
   */
  _UserServerAPI(): this {
    this._ServerAPI();
    this.connection = null;
    this.name = null;
    this.host = null;
    this.port = -1;
    this.messageHandler = null;
    return this;
  }
  /**
   * Name accessor.
   *
   * @return The connection name.
   */
  getName(): string {
    return this.name;
  }
  /**
   * Host accessor.
   *
   * @return The connection host.
   */
  getHost(): string {
    return this.host;
  }
  /**
   * Port accessor.
   *
   * @return The connection port.
   */
  getPort(): number {
    return this.port;
  }
  /**
   * Update the connection parameters so as to allow reconnection.
   *
   * @param name The connection name.
   * @param host The host connected to.
   * @param port The port connected to.
   */
  updateParameters(name: string, host: string, port: number): void {
    this.name = name;
    this.host = host;
    this.port = port;
  }
  /**
   * A connection has been made, save it and its parameters.
   *
   * @param c The new {@code Connection}.
   */
  updateConnection(c: Connection): void {
    c.setMessageHandler(this.messageHandler);
    c.setWriteScope(FreeColXMLWriter$WriteScope.toServer());
    this.connection = c;
  }
  /**
   * Create a new connection.
   *
   * @param name The name to associate with the connection.
   * @param host The name of the host to connect to.
   * @param port The port to connect to.
   * @return The new <code>Connection</code>.
   * @exception IOException on failure to connect.
   */
  static newConnection(name: string, host: string, port: number): Connection {
    let tries: number;
    if (port < 0) {
      port = FreeCol.getServerPort();
      tries = 10;
    } else {
      tries = 1;
    }
    let conn = null;
    for (let i = tries; i > 0; i--) {
      try {
        conn = new Connection()._Connection$String$int$String(host, port, name);
        conn.startReceiving();
        break;
      } catch ($e0) {
        if ($J.isa($e0, IOException)) {
          let e = $J.exc($e0);
          if (i <= 1) {
            throw e;
          }
        } else {
          throw $e0;
        }
      }
    }
    return conn;
  }
  /**
   * {@inheritDoc}
   */
  connect(name: string, host: string, port: number): Connection {
    let c = UserServerAPI.newConnection(name, host, port);
    if (c == null) {
      return null;
    }
    this.updateConnection(c);
    this.updateParameters(name, host, port);
    return c;
  }
  /**
   * {@inheritDoc}
   */
  disconnect(): boolean {
    if (this.connection != null) {
      this.connection.disconnect();
      this.connection = null;
    }
    return true;
  }
  /**
   * {@inheritDoc}
   */
  reconnect(): Connection {
    let c = UserServerAPI.newConnection(this.getName(), this.getHost(), this.getPort());
    if (c != null) {
      this.updateConnection(c);
    }
    return c;
  }
  /**
   * {@inheritDoc}
   */
  getConnection(): Connection {
    return this.connection;
  }
  /**
   * {@inheritDoc}
   */
  setMessageHandler(mh: MessageHandler): void {
    super.setMessageHandler(mh);
    this.messageHandler = mh;
  }
}

$J.define(UserServerAPI, 'net.sf.freecol.client.networking.UserServerAPI', { kind: 'class', sup: 'net.sf.freecol.common.networking.ServerAPI', ctors: { '': '_UserServerAPI' }, returns: { 'getConnection': 'net.sf.freecol.common.networking.Connection', 'getPort': 'int', 'getHost': 'java.lang.String', 'getName': 'java.lang.String' } });
$J.module(() => {
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  FreeColXMLWriter$WriteScope = $J.load('net.sf.freecol.common.io.FreeColXMLWriter$WriteScope');
  Connection = $J.load('net.sf.freecol.common.networking.Connection');
});
