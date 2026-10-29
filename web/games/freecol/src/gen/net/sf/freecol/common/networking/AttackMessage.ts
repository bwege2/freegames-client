// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/AttackMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Unit, Unit$MoveType, Message$MessagePriority;

/**
 * The message sent when attacking.
 */
export class AttackMessage extends AttributeMessage {
  static readonly TAG: string = 'attack';
  static readonly DIRECTION_TAG: string = 'direction';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code AttackMessage} for the supplied unit and
   * direction.
   *
   * @param unit The {@code Unit} attacking.
   * @param direction The {@code Direction} to attack in.
   */
  _AttackMessage$Unit$Direction(unit: Unit, direction: Direction): this {
    this._AttributeMessage$String$StringArr(AttackMessage.TAG, [AttackMessage.UNIT_TAG, unit.getId(), AttackMessage.DIRECTION_TAG, $J.str(direction)]);
    return this;
  }
  /**
   * Create a new {@code AttackMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _AttackMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(AttackMessage.TAG, xr, [AttackMessage.UNIT_TAG, AttackMessage.DIRECTION_TAG]);
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
    let unitId = this.getStringAttribute(AttackMessage.UNIT_TAG);
    let directionString = this.getStringAttribute(AttackMessage.DIRECTION_TAG);
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
    if (unit.getMovesLeft() <= 0) {
      return serverPlayer.clientError$String('No moves left.');
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
    let moveType = unit.getMoveType$Tile(tile);
    if (moveType === Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_SCOUT || moveType === Unit$MoveType.ENTER_FOREIGN_COLONY_WITH_SCOUT || moveType.isAttack()) {
    } else {
      return serverPlayer.clientError$String('Illegal attack move for: ' + unitId + ' type: ' + $J.str(moveType) + ' from: ' + unit.getLocation().getId() + ' to: ' + tile.getId());
    }
    let defender = tile.getDefendingUnit(unit);
    if (defender == null) {
      return serverPlayer.clientError$String('Could not find defender in tile: ' + tile.getId() + ' from: ' + unit.getLocation().getId());
    }
    return this.igc$FreeColServer(freeColServer).combat(serverPlayer, unit, defender, null);
  }
}

$J.define(AttackMessage, 'net.sf.freecol.common.networking.AttackMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_AttackMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Direction': '_AttackMessage$Unit$Direction' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
