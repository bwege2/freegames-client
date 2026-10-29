// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/NewLandNameMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Unit, Message$MessagePriority;

/**
 * The message sent when naming a new land.
 */
export class NewLandNameMessage extends AttributeMessage {
  static readonly TAG: string = 'newLandName';
  static readonly NEW_LAND_NAME_TAG: string = 'newLandName';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code NewLandNameMessage} with the
   * supplied name.
   *
   * @param unit The {@code Unit} that has come ashore.
   * @param newLandName The new land name.
   */
  _NewLandNameMessage$Unit$String(unit: Unit, newLandName: string): this {
    this._AttributeMessage$String$StringArr(NewLandNameMessage.TAG, [NewLandNameMessage.UNIT_TAG, unit.getId(), NewLandNameMessage.NEW_LAND_NAME_TAG, newLandName]);
    return this;
  }
  /**
   * Create a new {@code NewLandNameMessage} from a stream.
   *
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _NewLandNameMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(NewLandNameMessage.TAG, xr, [NewLandNameMessage.UNIT_TAG, NewLandNameMessage.NEW_LAND_NAME_TAG]);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.LATE;
  }
  /**
   * {@inheritDoc}
   */
  aiHandler(freeColServer: FreeColServer, aiPlayer: AIPlayer): void {
    let unit = this.getUnit(aiPlayer.getPlayer());
    let name = this.getNewLandName();
    aiPlayer.newLandNameHandler(unit, name);
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let unit = this.getUnit(freeColClient.getMyPlayer());
    let defaultName = this.getNewLandName();
    if (defaultName == null || !unit.hasTile()) {
      return;
    }
    this.igc$FreeColClient(freeColClient).newLandNameHandler(unit, defaultName);
    this.clientGeneric(freeColClient);
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let unit: Unit;
    try {
      unit = this.getUnit(serverPlayer);
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
      return serverPlayer.clientError$String('Unit is not on the map: ' + unit.getId());
    } else if (!tile.isLand()) {
      return serverPlayer.clientError$String('Unit is not in the new world: ' + unit.getId());
    }
    let newLandName = this.getNewLandName();
    if (newLandName == null || (newLandName.length === 0)) {
      return serverPlayer.clientError$String('Empty new land name');
    }
    return this.igc$FreeColServer(freeColServer).setNewLandName(serverPlayer, unit, newLandName);
  }
  /**
   * Public accessor for the unit.
   *
   * @param player The {@code Player} who owns the unit.
   * @return The {@code Unit} of this message.
   */
  getUnit(player: Player): Unit {
    return player.getOurFreeColGameObject(this.getStringAttribute(NewLandNameMessage.UNIT_TAG), $J.cls(Unit));
  }
  /**
   * Public accessor for the new land name.
   *
   * @return The new land name of this message.
   */
  getNewLandName(): string {
    return this.getStringAttribute(NewLandNameMessage.NEW_LAND_NAME_TAG);
  }
}

$J.define(NewLandNameMessage, 'net.sf.freecol.common.networking.NewLandNameMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_NewLandNameMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,java.lang.String': '_NewLandNameMessage$Unit$String' }, returns: { 'getNewLandName': 'java.lang.String', 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
