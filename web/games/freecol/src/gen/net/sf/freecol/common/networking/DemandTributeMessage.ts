// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/DemandTributeMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Ability, Unit, Unit$MoveType, Message$MessagePriority;

/**
 * The message sent when demanding tribute from a native settlement.
 */
export class DemandTributeMessage extends AttributeMessage {
  static readonly TAG: string = 'demandTribute';
  static readonly DIRECTION_TAG: string = 'direction';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code DemandTributeMessage} with the
   * supplied unit and direction.
   *
   * @param unit The {@code Unit} that is demanding.
   * @param direction The {@code Direction} the unit is looking.
   */
  _DemandTributeMessage$Unit$Direction(unit: Unit, direction: Direction): this {
    this._AttributeMessage$String$StringArr(DemandTributeMessage.TAG, [DemandTributeMessage.UNIT_TAG, unit.getId(), DemandTributeMessage.DIRECTION_TAG, $J.str(direction)]);
    return this;
  }
  /**
   * Create a new {@code DemandTributeMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _DemandTributeMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(DemandTributeMessage.TAG, xr, [DemandTributeMessage.UNIT_TAG, DemandTributeMessage.DIRECTION_TAG]);
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
    let unitId = this.getStringAttribute(DemandTributeMessage.UNIT_TAG);
    let directionString = this.getStringAttribute(DemandTributeMessage.DIRECTION_TAG);
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
    if (unit.isArmed() || unit.hasAbility$String(Ability.DEMAND_TRIBUTE)) {
    } else {
      return serverPlayer.clientError$String('Unit is neither armed nor able to demand tribute: ' + unitId);
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
    let is$ = tile.getIndianSettlement();
    if (is$ == null) {
      return serverPlayer.clientError$String('There is native settlement at: ' + tile.getId());
    }
    let type$ = unit.getMoveType$Tile(tile);
    if (type$ !== Unit$MoveType.ATTACK_SETTLEMENT && type$ !== Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_SCOUT) {
      return serverPlayer.clientError$String('Unable to demand tribute at: ' + is$.getName() + ': ' + type$.whyIllegal());
    }
    return this.igc$FreeColServer(freeColServer).demandTribute(serverPlayer, unit, is$);
  }
}

$J.define(DemandTributeMessage, 'net.sf.freecol.common.networking.DemandTributeMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_DemandTributeMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Direction': '_DemandTributeMessage$Unit$Direction' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
