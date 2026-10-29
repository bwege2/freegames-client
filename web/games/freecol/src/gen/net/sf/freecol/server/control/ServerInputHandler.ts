// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/control/ServerInputHandler.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, RuntimeException } from '../../../../../../jre/index.ts';
import { FreeColServerHolder } from './FreeColServerHolder.ts';

let Message;

/**
 * Handles the network messages on the server side.
 */
export class ServerInputHandler extends FreeColServerHolder {
  static logger: Logger = null;
  /**
   * The constructor to use.
   *
   * @param freeColServer The main server object.
   */
  _ServerInputHandler(freeColServer: FreeColServer): this {
    this._FreeColServerHolder(freeColServer);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  handle(connection: Connection, message: Message): Message {
    let freeColServer = this.getFreeColServer();
    let serverPlayer = freeColServer.getPlayer(connection);
    if (serverPlayer == null) {
      throw new RuntimeException('No server player available: ' + $J.str(message));
    }
    let game = freeColServer.getGame();
    let current = message.currentPlayerMessage();
    let cs = (current && (game == null || serverPlayer !== game.getCurrentPlayer())) ? serverPlayer.clientError$String('Received: ' + message.getType$() + ' out of turn from player: ' + $J.str(serverPlayer.getNation())) : message.serverHandler(freeColServer, serverPlayer);
    return (cs == null) ? null : cs.build(serverPlayer);
  }
  /**
   * {@inheritDoc}
   */
  read(connection: Connection): Message {
    return Message.read(this.getGame(), connection.getFreeColXMLReader());
  }
  static $clinit() {
    ServerInputHandler.logger = Logger.getLogger($J.cls(ServerInputHandler).getName());
  }
}

$J.define(ServerInputHandler, 'net.sf.freecol.server.control.ServerInputHandler', { kind: 'class', ifaces: ['net.sf.freecol.common.networking.MessageHandler'], sup: 'net.sf.freecol.server.control.FreeColServerHolder', ctors: { 'net.sf.freecol.server.FreeColServer': '_ServerInputHandler' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Message = $J.load('net.sf.freecol.common.networking.Message');
});
