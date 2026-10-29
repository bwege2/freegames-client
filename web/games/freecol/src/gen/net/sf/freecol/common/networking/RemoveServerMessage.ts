// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/RemoveServerMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { ServerInfoMessage } from './ServerInfoMessage.ts';

/**
 * The message sent to remove a server from the meta-server.
 */
export class RemoveServerMessage extends ServerInfoMessage {
  static readonly TAG: string = 'removeServer';
  /**
   * Create a new {@code RemoveServerMessage}.
   *
   * @param si The {@code ServerInfo} describing the server to remove.
   */
  _RemoveServerMessage$ServerInfo(si: ServerInfo): this {
    this._ServerInfoMessage$String$ServerInfo(RemoveServerMessage.TAG, si);
    return this;
  }
  /**
   * Create a new {@code RemoveServerMessage} from a stream.
   *
   * @param game The {@code Game}, which is null and ignored.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _RemoveServerMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._ServerInfoMessage$String$Game$FreeColXMLReader(RemoveServerMessage.TAG, game, xr);
    return this;
  }
}

$J.define(RemoveServerMessage, 'net.sf.freecol.common.networking.RemoveServerMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.ServerInfoMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_RemoveServerMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.metaserver.ServerInfo': '_RemoveServerMessage$ServerInfo' } });
