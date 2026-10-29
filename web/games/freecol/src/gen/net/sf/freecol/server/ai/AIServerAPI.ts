// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/AIServerAPI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { ServerAPI } from '../../common/networking/ServerAPI.ts';

/**
 * Implementation of the ServerAPI for an AI without neither attached
 * GUI nor real connection to the server.
 */
export class AIServerAPI extends ServerAPI {
  /**
   * The AI player that owns this wrapper.
   */
  owner: AIPlayer = null;
  /**
   * Create the new AI wrapper for the server API.
   *
   * @param owner The {@code AIPlayer} attached to this API.
   */
  _AIServerAPI(owner: AIPlayer): this {
    this._ServerAPI();
    this.owner = owner;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getConnection(): Connection {
    return (this.owner == null) ? null : this.owner.getConnection();
  }
  /**
   * {@inheritDoc}
   */
  connect(name: string, host: string, port: number): Connection {
    return this.getConnection();
  }
  /**
   * {@inheritDoc}
   */
  disconnect(): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  reconnect(): Connection {
    return this.getConnection();
  }
}

$J.define(AIServerAPI, 'net.sf.freecol.server.ai.AIServerAPI', { kind: 'class', sup: 'net.sf.freecol.common.networking.ServerAPI', ctors: { 'net.sf.freecol.server.ai.AIPlayer': '_AIServerAPI' }, returns: { 'getConnection': 'net.sf.freecol.common.networking.Connection' } });
