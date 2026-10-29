// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/DeclareIndependenceMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let Message$MessagePriority;

/**
 * The message sent when a player declares independence.
 */
export class DeclareIndependenceMessage extends AttributeMessage {
  static readonly TAG: string = 'declareIndependence';
  static readonly COUNTRY_NAME_TAG: string = 'countryName';
  static readonly NATION_NAME_TAG: string = 'nationName';
  /**
   * Create a new {@code DeclareIndependenceMessage} with the
   * supplied name.
   *
   * @param nationName The new name for the rebelling nation.
   * @param countryName The new name for the rebelling country.
   */
  _DeclareIndependenceMessage$String$String(nationName: string, countryName: string): this {
    this._AttributeMessage$String$StringArr(DeclareIndependenceMessage.TAG, [DeclareIndependenceMessage.NATION_NAME_TAG, nationName, DeclareIndependenceMessage.COUNTRY_NAME_TAG, countryName]);
    return this;
  }
  /**
   * Create a new {@code DeclareIndependenceMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _DeclareIndependenceMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(DeclareIndependenceMessage.TAG, xr, [DeclareIndependenceMessage.NATION_NAME_TAG, DeclareIndependenceMessage.COUNTRY_NAME_TAG]);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  currentPlayerMessage(): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.NORMAL;
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let nationName = this.getStringAttribute(DeclareIndependenceMessage.NATION_NAME_TAG);
    let countryName = this.getStringAttribute(DeclareIndependenceMessage.COUNTRY_NAME_TAG);
    if (nationName == null || (nationName.length === 0)) {
      return serverPlayer.clientError$String('Empty nation name.');
    }
    if (countryName == null || (countryName.length === 0)) {
      return serverPlayer.clientError$String('Empty country name.');
    }
    let problem = serverPlayer.checkDeclareIndependence();
    if (problem != null) {
      return serverPlayer.clientError$String('Declaration blocked');
    }
    return this.igc$FreeColServer(freeColServer).declareIndependence(serverPlayer, nationName, countryName);
  }
}

$J.define(DeclareIndependenceMessage, 'net.sf.freecol.common.networking.DeclareIndependenceMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_DeclareIndependenceMessage$Game$FreeColXMLReader', 'java.lang.String,java.lang.String': '_DeclareIndependenceMessage$String$String' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
