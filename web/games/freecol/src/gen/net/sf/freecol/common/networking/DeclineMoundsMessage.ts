// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/DeclineMoundsMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception, JString } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let LostCityRumour$RumourType, Unit, Message$MessagePriority;

/**
 * The message sent when declining to investigate strange mounds.
 */
export class DeclineMoundsMessage extends AttributeMessage {
  static readonly TAG: string = 'declineMounds';
  static readonly DIRECTION_TAG: string = 'direction';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code DeclineMoundsMessage} with the
   * supplied unit and direction.
   *
   * @param unit The {@code Unit} that is exploring.
   * @param direction The {@code Direction} the unit is looking.
   */
  _DeclineMoundsMessage$Unit$Direction(unit: Unit, direction: Direction): this {
    this._AttributeMessage$String$StringArr(DeclineMoundsMessage.TAG, [DeclineMoundsMessage.UNIT_TAG, unit.getId(), DeclineMoundsMessage.DIRECTION_TAG, $J.str(direction)]);
    return this;
  }
  /**
   * Create a new {@code DeclineMoundsMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _DeclineMoundsMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(DeclineMoundsMessage.TAG, xr, [DeclineMoundsMessage.UNIT_TAG, DeclineMoundsMessage.DIRECTION_TAG]);
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
    let unitId = this.getStringAttribute(DeclineMoundsMessage.UNIT_TAG);
    let directionString = this.getStringAttribute(DeclineMoundsMessage.DIRECTION_TAG);
    let unit: Unit;
    try {
      unit = serverPlayer.getOurFreeColGameObject(unitId, $J.cls(Unit));
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e0;
      }
    }
    let tile: Tile;
    try {
      tile = unit.getNeighbourTile(directionString);
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e1;
      }
    }
    let rumour = tile.getLostCityRumour();
    if (rumour == null || rumour.getType() !== LostCityRumour$RumourType.MOUNDS) {
      return serverPlayer.clientError$String('No mounds rumour on tile: ' + tile.getId());
    }
    return this.igc$FreeColServer(freeColServer).declineMounds(serverPlayer, tile);
  }
}

$J.define(DeclineMoundsMessage, 'net.sf.freecol.common.networking.DeclineMoundsMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_DeclineMoundsMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Direction': '_DeclineMoundsMessage$Unit$Direction' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  LostCityRumour$RumourType = $J.load('net.sf.freecol.common.model.LostCityRumour$RumourType');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
