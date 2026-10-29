// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/WorkMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Unit, WorkLocation, Message$MessagePriority;

/**
 * The message sent to handle changes in work location.
 */
export class WorkMessage extends AttributeMessage {
  static readonly TAG: string = 'work';
  static readonly UNIT_TAG: string = 'unit';
  static readonly WORK_LOCATION_TAG: string = 'workLocation';
  /**
   * Create a new {@code WorkMessage} for the supplied unit and
   * work location.
   *
   * @param unit The {@code Unit} to change the work location of.
   * @param workLocation The {@code WorkLocation} to change to.
   */
  _WorkMessage$Unit$WorkLocation(unit: Unit, workLocation: WorkLocation): this {
    this._AttributeMessage$String$StringArr(WorkMessage.TAG, [WorkMessage.UNIT_TAG, unit.getId(), WorkMessage.WORK_LOCATION_TAG, workLocation.getId()]);
    return this;
  }
  /**
   * Create a new {@code WorkMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to (null here).
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _WorkMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(WorkMessage.TAG, xr, [WorkMessage.UNIT_TAG, WorkMessage.WORK_LOCATION_TAG]);
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
    let unitId = this.getStringAttribute(WorkMessage.UNIT_TAG);
    let workLocationId = this.getStringAttribute(WorkMessage.WORK_LOCATION_TAG);
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
    if (!unit.hasTile()) {
      return serverPlayer.clientError$String('Unit is not on the map: ' + unitId);
    }
    let colony = unit.getTile$().getColony();
    if (colony == null) {
      return serverPlayer.clientError$String('Unit is not at a colony: ' + unitId);
    }
    let workLocation = game.getFreeColGameObject$String$Class(workLocationId, $J.cls(WorkLocation));
    if (workLocation == null) {
      return serverPlayer.clientError$String('Not a work location: ' + workLocationId);
    } else if (workLocation.getColony() !== colony) {
      return serverPlayer.clientError$String('Work location is not in colony' + colony.getId() + ' where the unit is: ' + workLocationId);
    } else if (!workLocation.canAdd(unit)) {
      return serverPlayer.clientError$String('Can not add ' + $J.str(unit) + ' to ' + $J.str(workLocation) + ': ' + $J.str(workLocation.getNoAddReason(unit)));
    }
    return this.igc$FreeColServer(freeColServer).work(serverPlayer, unit, workLocation);
  }
}

$J.define(WorkMessage, 'net.sf.freecol.common.networking.WorkMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_WorkMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.WorkLocation': '_WorkMessage$Unit$WorkLocation' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  WorkLocation = $J.load('net.sf.freecol.common.model.WorkLocation');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
