// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/EmbarkMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Unit, Message$MessagePriority, ServerUnit;

/**
 * The message sent when embarking.
 */
export class EmbarkMessage extends AttributeMessage {
  static readonly TAG: string = 'embark';
  static readonly CARRIER_TAG: string = 'carrier';
  static readonly DIRECTION_TAG: string = 'direction';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code EmbarkMessage} with the
   * supplied unit, carrier and optional direction.
   *
   * @param unit The {@code Unit} to embark.
   * @param carrier The carrier {@code Unit} to embark on.
   * @param direction An option direction to embark in.
   */
  _EmbarkMessage$Unit$Unit$Direction(unit: Unit, carrier: Unit, direction: Direction): this {
    this._AttributeMessage$String$StringArr(EmbarkMessage.TAG, [EmbarkMessage.UNIT_TAG, unit.getId(), EmbarkMessage.CARRIER_TAG, carrier.getId(), EmbarkMessage.DIRECTION_TAG, (direction == null) ? null : $J.str(direction)]);
    return this;
  }
  /**
   * Create a new {@code EmbarkMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _EmbarkMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(EmbarkMessage.TAG, xr, [EmbarkMessage.UNIT_TAG, EmbarkMessage.CARRIER_TAG, EmbarkMessage.DIRECTION_TAG]);
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
    let unitId = this.getStringAttribute(EmbarkMessage.UNIT_TAG);
    let carrierId = this.getStringAttribute(EmbarkMessage.CARRIER_TAG);
    let directionString = this.getStringAttribute(EmbarkMessage.DIRECTION_TAG);
    let unit: ServerUnit;
    try {
      unit = serverPlayer.getOurFreeColGameObject(unitId, $J.cls(ServerUnit));
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e0;
      }
    }
    let carrier: Unit;
    try {
      carrier = serverPlayer.getOurFreeColGameObject(carrierId, $J.cls(Unit));
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e1;
      }
    }
    let sourceLocation = unit.getLocation();
    if (directionString == null) {
      if (!carrier.isAtLocation(sourceLocation)) {
        return serverPlayer.clientError$String('Unit ' + unitId + ' at ' + sourceLocation.getId() + ' and carrier ' + carrierId + ' at ' + carrier.getLocation().getId() + ' are not co-located.');
      }
    } else {
      if (unit.getMovesLeft() <= 0) {
        return serverPlayer.clientError$String('Unit has no moves left: ' + unitId);
      }
      let destinationTile = null;
      try {
        destinationTile = unit.getNeighbourTile(directionString);
      } catch ($e2) {
        if ($J.isa($e2, Exception)) {
          let e = $J.exc($e2);
          return serverPlayer.clientError$String(e.getMessage());
        } else {
          throw $e2;
        }
      }
      if (carrier.getTile$() !== destinationTile) {
        return serverPlayer.clientError$String('Carrier: ' + carrierId + ' is not at destination tile: ' + $J.str(destinationTile));
      }
    }
    return this.igc$FreeColServer(freeColServer).embarkUnit(serverPlayer, unit, carrier);
  }
}

$J.define(EmbarkMessage, 'net.sf.freecol.common.networking.EmbarkMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_EmbarkMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Direction': '_EmbarkMessage$Unit$Unit$Direction' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
  ServerUnit = $J.load('net.sf.freecol.server.model.ServerUnit');
});
