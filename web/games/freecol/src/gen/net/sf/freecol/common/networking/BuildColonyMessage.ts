// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/BuildColonyMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Player, Unit, Message$MessagePriority;

/**
 * The message sent when the client requests building of a colony.
 */
export class BuildColonyMessage extends AttributeMessage {
  static readonly TAG: string = 'buildColony';
  static readonly NAME_TAG: string = 'name';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code BuildColonyMessage} with the supplied name
   * and building unit.
   *
   * @param colonyName The name for the new colony.
   * @param builder The {@code Unit} to do the building.
   */
  _BuildColonyMessage$String$Unit(colonyName: string, builder: Unit): this {
    this._AttributeMessage$String$StringArr(BuildColonyMessage.TAG, [BuildColonyMessage.NAME_TAG, colonyName, BuildColonyMessage.UNIT_TAG, builder.getId()]);
    return this;
  }
  /**
   * Create a new {@code BuildColonyMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _BuildColonyMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(BuildColonyMessage.TAG, xr, [BuildColonyMessage.NAME_TAG, BuildColonyMessage.UNIT_TAG]);
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
    let game = freeColServer.getGame();
    let colonyName = this.getStringAttribute(BuildColonyMessage.NAME_TAG);
    let unitId = this.getStringAttribute(BuildColonyMessage.UNIT_TAG);
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
    if (!unit.canBuildColony()) {
      return serverPlayer.clientError$String('Unit ' + unitId + ' can not build colony.');
    }
    if (colonyName == null) {
      return serverPlayer.clientError$String('Null colony name');
    } else if ($J.equals(Player.ASSIGN_SETTLEMENT_NAME, colonyName)) {
    } else if (game.getSettlementByName(colonyName) != null) {
      return serverPlayer.clientError$String('Non-unique colony name ' + colonyName);
    }
    let tile = unit.getTile$();
    if (!serverPlayer.canClaimToFoundSettlement(tile)) {
      return serverPlayer.clientError$String('Can not build colony on tile ' + $J.str(tile) + ': ' + $J.str(serverPlayer.canClaimToFoundSettlementReason(tile)));
    }
    return this.igc$FreeColServer(freeColServer).buildSettlement(serverPlayer, unit, colonyName);
  }
}

$J.define(BuildColonyMessage, 'net.sf.freecol.common.networking.BuildColonyMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_BuildColonyMessage$Game$FreeColXMLReader', 'java.lang.String,net.sf.freecol.common.model.Unit': '_BuildColonyMessage$String$Unit' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Player = $J.load('net.sf.freecol.common.model.Player');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
