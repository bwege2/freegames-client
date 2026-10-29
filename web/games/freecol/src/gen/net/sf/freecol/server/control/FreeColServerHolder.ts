// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/control/FreeColServerHolder.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';

/**
 * This base class provides thread-safe access to a
 * {@link net.sf.freecol.server.FreeColServer} for several subclasses.
 */
export class FreeColServerHolder extends JObject {
  /**
   * The main server object.
   */
  freeColServer: FreeColServer = null;
  /**
   * Constructor.
   *
   * @param server The initial value for the server.
   */
  _FreeColServerHolder(server: FreeColServer): this {
    this.freeColServer = server;
    return this;
  }
  /**
   * Returns the main server object.
   *
   * @return The main server object.
   */
  getFreeColServer(): FreeColServer {
    return this.freeColServer;
  }
  /**
   * Get the game the server is operating.
   *
   * @return The current {@code ServerGame}.
   */
  getGame(): ServerGame {
    return this.freeColServer.getGame();
  }
}

$J.define(FreeColServerHolder, 'net.sf.freecol.server.control.FreeColServerHolder', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.server.FreeColServer': '_FreeColServerHolder' }, returns: { 'getGame': 'net.sf.freecol.server.model.ServerGame', 'getFreeColServer': 'net.sf.freecol.server.FreeColServer' } });
