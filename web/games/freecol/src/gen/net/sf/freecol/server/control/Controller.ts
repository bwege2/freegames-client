// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/control/Controller.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

/**
 * The control object that is responsible for making changes to the internal
 * model and for communicating with the clients.
 */
export class Controller extends FreeColServerHolder {
  static logger: Logger = null;
  /**
   * The constructor to use.
   *
   * @param freeColServer The main server object.
   */
  _Controller(freeColServer: FreeColServer): this {
    this._FreeColServerHolder(freeColServer);
    return this;
  }
  /**
   * Shut down the server (which sends a message to each client).
   */
  shutdown(): void {
    let server = this.getFreeColServer().getServer();
    if (server != null) {
      server.shutdown();
    } else {
      Controller.logger.warning('Tried to shut down a null server.');
    }
  }
  static $clinit() {
    Controller.logger = Logger.getLogger($J.cls(Controller).getName());
  }
}

$J.define(Controller, 'net.sf.freecol.server.control.Controller', { kind: 'class', sup: 'net.sf.freecol.server.control.FreeColServerHolder', ctors: { 'net.sf.freecol.server.FreeColServer': '_Controller' }, clinit: true, lazy: ['logger'] });
