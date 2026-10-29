// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/LearnSkillMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Unit$MoveType, Message$MessagePriority, ServerUnit;

/**
 * The message sent when learning for the skill taught at a settlement.
 */
export class LearnSkillMessage extends AttributeMessage {
  static readonly TAG: string = 'learnSkill';
  static readonly DIRECTION_TAG: string = 'direction';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code LearnSkillMessage} with the
   * supplied unit and direction.
   *
   * @param unit The {@code Unit} that is learning.
   * @param direction The {@code Direction} the unit is looking.
   */
  _LearnSkillMessage$Unit$Direction(unit: Unit, direction: Direction): this {
    this._AttributeMessage$String$StringArr(LearnSkillMessage.TAG, [LearnSkillMessage.UNIT_TAG, unit.getId(), LearnSkillMessage.DIRECTION_TAG, $J.str(direction)]);
    return this;
  }
  /**
   * Create a new {@code LearnSkillMessage} from a stream.
   *
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _LearnSkillMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(LearnSkillMessage.TAG, xr, [LearnSkillMessage.UNIT_TAG, LearnSkillMessage.DIRECTION_TAG]);
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
    let unitId = this.getStringAttribute(LearnSkillMessage.UNIT_TAG);
    let directionString = this.getStringAttribute(LearnSkillMessage.DIRECTION_TAG);
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
    let type$ = unit.getSimpleMoveType$Tile(is$.getTile$());
    if (type$ !== Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_FREE_COLONIST) {
      return serverPlayer.clientError$String('Unable to enter ' + is$.getName() + ': ' + type$.whyIllegal());
    }
    return this.igc$FreeColServer(freeColServer).learnFromIndianSettlement(serverPlayer, unit, is$);
  }
}

$J.define(LearnSkillMessage, 'net.sf.freecol.common.networking.LearnSkillMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_LearnSkillMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Direction': '_LearnSkillMessage$Unit$Direction' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
  ServerUnit = $J.load('net.sf.freecol.server.model.ServerUnit');
});
