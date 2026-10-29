// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/ScoutIndianSettlementMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Ability, Unit$MoveType, Message$MessagePriority, ServerUnit;

/**
 * The message sent when scouting a native settlement.
 */
export class ScoutIndianSettlementMessage extends AttributeMessage {
  static readonly TAG: string = 'scoutIndianSettlement';
  static readonly DIRECTION_TAG: string = 'direction';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code ScoutIndianSettlementMessage} with the
   * supplied unit and direction.
   *
   * @param unit The {@code Unit} that is learning.
   * @param direction The {@code Direction} the unit is looking.
   */
  _ScoutIndianSettlementMessage$Unit$Direction(unit: Unit, direction: Direction): this {
    this._AttributeMessage$String$StringArr(ScoutIndianSettlementMessage.TAG, [ScoutIndianSettlementMessage.UNIT_TAG, unit.getId(), ScoutIndianSettlementMessage.DIRECTION_TAG, $J.str(direction)]);
    return this;
  }
  /**
   * Create a new {@code ScoutIndianSettlementMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _ScoutIndianSettlementMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(ScoutIndianSettlementMessage.TAG, xr, [ScoutIndianSettlementMessage.UNIT_TAG, ScoutIndianSettlementMessage.DIRECTION_TAG]);
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
    let unitId = this.getStringAttribute(ScoutIndianSettlementMessage.UNIT_TAG);
    let directionString = this.getStringAttribute(ScoutIndianSettlementMessage.DIRECTION_TAG);
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
    if (!unit.hasAbility$String(Ability.SPEAK_WITH_CHIEF)) {
      return serverPlayer.clientError$String('Unit lacks ability to speak to chief: ' + unitId);
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
      return serverPlayer.clientError$String('There is no native settlement at: ' + tile.getId());
    }
    let type$ = unit.getMoveType$Tile(is$.getTile$());
    if (type$ !== Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_SCOUT) {
      return serverPlayer.clientError$String('Unable to enter ' + is$.getName() + ': ' + type$.whyIllegal());
    }
    return this.igc$FreeColServer(freeColServer).scoutIndianSettlement(serverPlayer, unit, is$);
  }
}

$J.define(ScoutIndianSettlementMessage, 'net.sf.freecol.common.networking.ScoutIndianSettlementMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_ScoutIndianSettlementMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Direction': '_ScoutIndianSettlementMessage$Unit$Direction' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
  ServerUnit = $J.load('net.sf.freecol.server.model.ServerUnit');
});
