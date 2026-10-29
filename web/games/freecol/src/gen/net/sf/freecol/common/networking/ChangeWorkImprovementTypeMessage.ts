// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/ChangeWorkImprovementTypeMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Ability, Unit, Message$MessagePriority;

/**
 * The message sent when changing a work improvement type.
 */
export class ChangeWorkImprovementTypeMessage extends AttributeMessage {
  static readonly TAG: string = 'changeWorkImprovementType';
  static readonly IMPROVEMENT_TYPE_TAG: string = 'improvementType';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code ChangeWorkImprovementTypeMessage} with the
   * supplied unit and improvement type.
   *
   * @param unit The {@code Unit} that is working.
   * @param type The new {@code TileImprovementType}.
   */
  _ChangeWorkImprovementTypeMessage$Unit$TileImprovementType(unit: Unit, type$: TileImprovementType): this {
    this._AttributeMessage$String$StringArr(ChangeWorkImprovementTypeMessage.TAG, [ChangeWorkImprovementTypeMessage.UNIT_TAG, unit.getId(), ChangeWorkImprovementTypeMessage.IMPROVEMENT_TYPE_TAG, type$.getId()]);
    return this;
  }
  /**
   * Create a new {@code ChangeWorkImprovementTypeMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _ChangeWorkImprovementTypeMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(ChangeWorkImprovementTypeMessage.TAG, xr, [ChangeWorkImprovementTypeMessage.UNIT_TAG, ChangeWorkImprovementTypeMessage.IMPROVEMENT_TYPE_TAG]);
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
    let unitId = this.getStringAttribute(ChangeWorkImprovementTypeMessage.UNIT_TAG);
    let improvementId = this.getStringAttribute(ChangeWorkImprovementTypeMessage.IMPROVEMENT_TYPE_TAG);
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
    let tile = unit.getTile$();
    if (tile == null) {
      return serverPlayer.clientError$String('Unit is not on the map: ' + unitId);
    } else if (!unit.hasAbility$String(Ability.IMPROVE_TERRAIN)) {
      return serverPlayer.clientError$String('Unit can not improve tiles: ' + unitId);
    }
    let type$ = freeColServer.getSpecification().getTileImprovementType(improvementId);
    let improvement: TileImprovement;
    if (type$ == null) {
      return serverPlayer.clientError$String('Not a tile improvement type: ' + improvementId);
    } else if (type$.isNatural()) {
      return serverPlayer.clientError$String('ImprovementType must not be natural: ' + improvementId);
    } else if (!type$.isTileTypeAllowed(tile.getType())) {
      return serverPlayer.clientError$String('ImprovementType not allowed on tile: ' + improvementId);
    } else if ((improvement = tile.getTileImprovement(type$)) == null) {
      if (!type$.isWorkerAllowed(unit)) {
        return serverPlayer.clientError$String('Unit can not create improvement: ' + improvementId);
      }
    } else {
      if (!improvement.isWorkerAllowed(unit)) {
        return serverPlayer.clientError$String('Unit can not work on improvement: ' + improvementId);
      }
    }
    return this.igc$FreeColServer(freeColServer).changeWorkImprovementType(serverPlayer, unit, type$);
  }
}

$J.define(ChangeWorkImprovementTypeMessage, 'net.sf.freecol.common.networking.ChangeWorkImprovementTypeMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_ChangeWorkImprovementTypeMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.TileImprovementType': '_ChangeWorkImprovementTypeMessage$Unit$TileImprovementType' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
