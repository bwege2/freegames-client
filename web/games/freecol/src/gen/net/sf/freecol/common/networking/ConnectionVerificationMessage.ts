// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/ConnectionVerificationMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { AttributeMessage } from './AttributeMessage.ts';

/**
 * A verification message sent from the meta server as a reply to {@link RegisterServerMessage}.
 */
export class ConnectionVerificationMessage extends AttributeMessage {
  static readonly TAG: string = 'connectionVerification';
  static readonly CONNECTABLE_TAG: string = 'connectable';
  /**
   * Create a new {@code ConnectionVerificationMessage}.
   *
   * @param connectable {@code true}, if the server could be connected to from the meta server.
   */
  _ConnectionVerificationMessage$boolean(connectable: boolean): this {
    this._AttributeMessage$String$StringArr(ConnectionVerificationMessage.TAG, [ConnectionVerificationMessage.CONNECTABLE_TAG, String(connectable)]);
    return this;
  }
  /**
   * Create a new {@code ConnectionVerificationMessage} from a stream.
   *
   * @param game The {@code Game}, which is null and ignored.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _ConnectionVerificationMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(ConnectionVerificationMessage.TAG, xr, [ConnectionVerificationMessage.CONNECTABLE_TAG]);
    return this;
  }
  isConnectable(): boolean {
    return super.getBooleanAttribute(ConnectionVerificationMessage.CONNECTABLE_TAG, false);
  }
}

$J.define(ConnectionVerificationMessage, 'net.sf.freecol.common.networking.ConnectionVerificationMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_ConnectionVerificationMessage$Game$FreeColXMLReader', 'boolean': '_ConnectionVerificationMessage$boolean' }, returns: { 'isConnectable': 'boolean' } });
