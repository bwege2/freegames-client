// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/control/ClientInputHandler.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColClientHolder } from './FreeColClientHolder.ts';

let Message;

/**
 * Message handler implementation for the client side.
 */
export class ClientInputHandler extends FreeColClientHolder {
  static logger: Logger = null;
  /**
   * The constructor to use.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ClientInputHandler(freeColClient: FreeColClient): this {
    this._FreeColClientHolder(freeColClient);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  handle(connection: Connection, message: Message): Message {
    message.clientHandler(this.getFreeColClient());
    return null;
  }
  /**
   * {@inheritDoc}
   */
  read(connection: Connection): Message {
    return Message.read(this.getGame(), connection.getFreeColXMLReader());
  }
  static $clinit() {
    ClientInputHandler.logger = Logger.getLogger($J.cls(ClientInputHandler).getName());
  }
}

$J.define(ClientInputHandler, 'net.sf.freecol.client.control.ClientInputHandler', { kind: 'class', ifaces: ['net.sf.freecol.common.networking.MessageHandler'], sup: 'net.sf.freecol.client.control.FreeColClientHolder', ctors: { 'net.sf.freecol.client.FreeColClient': '_ClientInputHandler' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Message = $J.load('net.sf.freecol.common.networking.Message');
});
