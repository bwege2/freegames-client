// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/networking/DummyConnection.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../jre/index.ts';
import { Connection } from '../../common/networking/Connection.ts';

/**
 * A dummy connection, used for AI players.
 */
export class DummyConnection extends Connection {
  static logger: Logger = null;
  /**
   * The other connection, to which outgoing requests are forwarded .
   */
  otherConnection: DummyConnection = null;
  /**
   * Sets up a dummy connection using the specified message handler.
   *
   * @param name A name for this connection.
   */
  _DummyConnection(name: string): this {
    this._Connection$String(name);
    return this;
  }
  /**
   * Gets the {@code DummyConnection} this object is connected to.
   *
   * @return The {@code DummyConnection} .
   */
  getOtherConnection(): DummyConnection {
    return this.otherConnection;
  }
  /**
   * Sets the other connection for this dummy connection.
   *
   * @param dc The {@code DummyConnection} to connect to.
   */
  setOtherConnection(dc: DummyConnection): void {
    this.otherConnection = dc;
  }
  /**
   * {@inheritDoc}
   */
  isAlive(): boolean {
    return this.otherConnection != null;
  }
  /**
   * {@inheritDoc}
   */
  close(): void {
    this.otherConnection = null;
  }
  /**
   * {@inheritDoc}
   */
  sendMessage(message: Message): void {
    let reply = this.askMessage(message, Connection.DEFAULT_REPLY_TIMEOUT);
    // assert reply == null
  }
  /**
   * {@inheritDoc}
   */
  askMessage(message: Message, timeout: number): Message {
    let other = this.getOtherConnection();
    if (other == null) {
      return null;
    }
    if (message == null) {
      return null;
    }
    this.logMessage(message, true);
    let reply = other.handle(message);
    this.logMessage(reply, false);
    return reply;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return '[DummyConnection ' + this.getName() + ']';
  }
  static $clinit() {
    DummyConnection.logger = Logger.getLogger($J.cls(DummyConnection).getName());
  }
}

$J.define(DummyConnection, 'net.sf.freecol.server.networking.DummyConnection', { kind: 'class', sup: 'net.sf.freecol.common.networking.Connection', ctors: { 'java.lang.String': '_DummyConnection' }, returns: { 'isAlive': 'boolean', 'getOtherConnection': 'net.sf.freecol.server.networking.DummyConnection' }, clinit: true, lazy: ['logger'] });
