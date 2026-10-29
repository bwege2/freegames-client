// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/AttackRangedMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let Tile, Unit, Message$MessagePriority;

/**
 * The message sent when attacking.
 */
export class AttackRangedMessage extends AttributeMessage {
  static readonly TAG: string = 'attackRanged';
  static readonly UNIT_TAG: string = 'unit';
  static readonly TARGET_TAG: string = 'target';
  /**
   * Create a new {@code AttackMessage} for the supplied unit and
   * direction.
   *
   * @param unit The {@code Unit} attacking.
   * @param target The targeted {@code Tile} of the attack.
   */
  _AttackRangedMessage$Unit$Tile(unit: Unit, target: Tile): this {
    this._AttributeMessage$String$StringArr(AttackRangedMessage.TAG, [AttackRangedMessage.UNIT_TAG, unit.getId(), AttackRangedMessage.TARGET_TAG, target.getId()]);
    return this;
  }
  /**
   * Create a new {@code AttackMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _AttackRangedMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(AttackRangedMessage.TAG, xr, [AttackRangedMessage.UNIT_TAG, AttackRangedMessage.TARGET_TAG]);
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
    let unitId = this.getStringAttribute(AttackRangedMessage.UNIT_TAG);
    let targetId = this.getStringAttribute(AttackRangedMessage.TARGET_TAG);
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
      tile = freeColServer.getGame().getFreeColGameObject$String$Class(targetId, $J.cls(Tile));
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e1;
      }
    }
    if (unit.canAttackRanged(tile)) {
    } else {
      return serverPlayer.clientError$String('Illegal ranged attack for: ' + unitId + ' from: ' + unit.getLocation().getId() + ' to: ' + tile.getId());
    }
    let defender = tile.getDefendingUnit(unit);
    if (defender == null) {
      return serverPlayer.clientError$String('Could not find defender in tile: ' + tile.getId() + ' from: ' + unit.getLocation().getId());
    }
    return this.igc$FreeColServer(freeColServer).combat(serverPlayer, unit, defender, null);
  }
}

$J.define(AttackRangedMessage, 'net.sf.freecol.common.networking.AttackRangedMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_AttackRangedMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Tile': '_AttackRangedMessage$Unit$Tile' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
