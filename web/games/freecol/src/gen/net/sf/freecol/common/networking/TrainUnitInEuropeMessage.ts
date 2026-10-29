// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/TrainUnitInEuropeMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Message$MessagePriority;

/**
 * The message sent when training a unit in Europe.
 */
export class TrainUnitInEuropeMessage extends AttributeMessage {
  static readonly TAG: string = 'trainUnitInEurope';
  static readonly UNIT_TYPE_TAG: string = 'unitType';
  /**
   * Create a new {@code TrainUnitInEuropeMessage} with the
   * supplied type.
   *
   * @param type The {@code UnitType} to train.
   */
  _TrainUnitInEuropeMessage$UnitType(type$: UnitType): this {
    this._AttributeMessage$String$StringArr(TrainUnitInEuropeMessage.TAG, [TrainUnitInEuropeMessage.UNIT_TYPE_TAG, type$.getId()]);
    return this;
  }
  /**
   * Create a new {@code TrainUnitInEuropeMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to (null here).
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _TrainUnitInEuropeMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(TrainUnitInEuropeMessage.TAG, xr, [TrainUnitInEuropeMessage.UNIT_TYPE_TAG]);
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
    let typeId = this.getStringAttribute(TrainUnitInEuropeMessage.UNIT_TYPE_TAG);
    let type$ = freeColServer.getSpecification().getUnitType(typeId);
    if (type$ == null) {
      return serverPlayer.clientError$String('Not a unit type: ' + typeId);
    }
    return this.igc$FreeColServer(freeColServer).trainUnitInEurope(serverPlayer, type$);
  }
}

$J.define(TrainUnitInEuropeMessage, 'net.sf.freecol.common.networking.TrainUnitInEuropeMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_TrainUnitInEuropeMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.UnitType': '_TrainUnitInEuropeMessage$UnitType' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
