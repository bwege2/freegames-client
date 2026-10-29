// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/control/UserConnectionHandler.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColServerHolder } from './FreeColServerHolder.ts';

let StringTemplate, ChangeSet, DisconnectMessage, LoginMessage, Message;

/**
 * Message handler for new client connections.
 */
export class UserConnectionHandler extends FreeColServerHolder {
  static logger: Logger = null;
  /**
   * Build a new user connection handler.
   *
   * @param freeColServer The main server object.
   */
  _UserConnectionHandler(freeColServer: FreeColServer): this {
    this._FreeColServerHolder(freeColServer);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  handle(connection: Connection, message: Message): Message {
    let freeColServer = this.getFreeColServer();
    let cs = null;
    switch (message.getType$()) {
      case DisconnectMessage.TAG:
        break;
      case LoginMessage.TAG:
        cs = (message).loginHandler(freeColServer, connection);
        break;
      default:
        cs = ChangeSet.clientError$Player$StringTemplate(null, StringTemplate.template$String('server.couldNotLogin'));
        break;
    }
    return (cs == null) ? null : cs.build(freeColServer.getPlayer(connection));
  }
  /**
   * {@inheritDoc}
   */
  read(connection: Connection): Message {
    return Message.read(this.getGame(), connection.getFreeColXMLReader());
  }
  static $clinit() {
    UserConnectionHandler.logger = Logger.getLogger($J.cls(UserConnectionHandler).getName());
  }
}

$J.define(UserConnectionHandler, 'net.sf.freecol.server.control.UserConnectionHandler', { kind: 'class', ifaces: ['net.sf.freecol.common.networking.MessageHandler'], sup: 'net.sf.freecol.server.control.FreeColServerHolder', ctors: { 'net.sf.freecol.server.FreeColServer': '_UserConnectionHandler' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  ChangeSet = $J.load('net.sf.freecol.common.networking.ChangeSet');
  DisconnectMessage = $J.load('net.sf.freecol.common.networking.DisconnectMessage');
  LoginMessage = $J.load('net.sf.freecol.common.networking.LoginMessage');
  Message = $J.load('net.sf.freecol.common.networking.Message');
});
