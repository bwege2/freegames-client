// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/MissionaryMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * The message sent when a missionary establishes/denounces a mission.
 */
export class MissionaryMessage extends AttributeMessage {
  static readonly TAG: string = 'missionary';
  static readonly DENOUNCE_TAG: string = 'denounce';
  static readonly DIRECTION_TAG: string = 'direction';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code MissionaryMessage} with the
   * supplied name.
   *
   * @param unit The missionary {@code Unit}.
   * @param direction The {@code Direction} to the settlement.
   * @param denounce True if this is a denunciation.
   */
  _MissionaryMessage$Unit$Direction$boolean(unit: Unit, direction: Direction, denounce: boolean): this {
    this._AttributeMessage$String$StringArr(MissionaryMessage.TAG, [MissionaryMessage.UNIT_TAG, unit.getId(), MissionaryMessage.DIRECTION_TAG, $J.str(direction), MissionaryMessage.DENOUNCE_TAG, String(denounce)]);
    return this;
  }
  /**
   * Create a new {@code LoadGoodsMessage} from a stream.
   *
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _MissionaryMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(MissionaryMessage.TAG, xr, [MissionaryMessage.UNIT_TAG, MissionaryMessage.DIRECTION_TAG, MissionaryMessage.DENOUNCE_TAG]);
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
    let unitId = this.getStringAttribute(MissionaryMessage.UNIT_TAG);
    let directionString = this.getStringAttribute(MissionaryMessage.DIRECTION_TAG);
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
    let missionary = is$.getMissionary();
    let denounce = this.getBooleanAttribute(MissionaryMessage.DENOUNCE_TAG, false);
    if (denounce) {
      if (missionary == null) {
        return serverPlayer.clientError$String('Denouncing an empty mission at: ' + is$.getId());
      } else if (missionary.getOwner() === serverPlayer) {
        return serverPlayer.clientError$String('Denouncing our own missionary at: ' + is$.getId());
      } else if (!unit.hasAbility$String(Ability.DENOUNCE_HERESY)) {
        return serverPlayer.clientError$String('Unit lacks denouncement ability: ' + unitId);
      }
    } else {
      if (missionary != null) {
        return serverPlayer.clientError$String('Establishing extra mission at: ' + is$.getId());
      } else if (!unit.hasAbility$String(Ability.ESTABLISH_MISSION)) {
        return serverPlayer.clientError$String('Unit lacks establish mission ability: ' + unitId);
      }
    }
    let type$ = unit.getMoveType$Tile(is$.getTile$());
    if (type$ !== Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_MISSIONARY) {
      return serverPlayer.clientError$String('Unable to enter ' + is$.getName() + ': ' + type$.whyIllegal());
    }
    return (denounce) ? this.igc$FreeColServer(freeColServer).denounceMission(serverPlayer, unit, is$) : this.igc$FreeColServer(freeColServer).establishMission(serverPlayer, unit, is$);
  }
}

$J.define(MissionaryMessage, 'net.sf.freecol.common.networking.MissionaryMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_MissionaryMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Direction,boolean': '_MissionaryMessage$Unit$Direction$boolean' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
  ServerUnit = $J.load('net.sf.freecol.server.model.ServerUnit');
});
