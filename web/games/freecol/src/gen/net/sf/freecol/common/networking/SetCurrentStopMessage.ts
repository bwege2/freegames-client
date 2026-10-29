// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/SetCurrentStopMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception, JString, NumberFormatException } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let Message$MessagePriority, ServerUnit;

/**
 * The message sent updating a unit's current stop.
 */
export class SetCurrentStopMessage extends AttributeMessage {
  static readonly TAG: string = 'setCurrentStop';
  static readonly INDEX_TAG: string = 'index';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code SetCurrentStopMessage} for the
   * supplied unit.
   *
   * @param unit A {@code Unit} whose stop is to be setd.
   * @param index The stop index.
   */
  _SetCurrentStopMessage$Unit$int(unit: Unit, index: number): this {
    this._AttributeMessage$String$StringArr(SetCurrentStopMessage.TAG, [SetCurrentStopMessage.UNIT_TAG, unit.getId(), SetCurrentStopMessage.INDEX_TAG, String(index)]);
    return this;
  }
  /**
   * Create a new {@code SetCurrentStopMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to (null here).
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _SetCurrentStopMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(SetCurrentStopMessage.TAG, xr, [SetCurrentStopMessage.UNIT_TAG, SetCurrentStopMessage.INDEX_TAG]);
    return this;
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
    let unitId = this.getStringAttribute(SetCurrentStopMessage.UNIT_TAG);
    let indexString = this.getStringAttribute(SetCurrentStopMessage.INDEX_TAG);
    let serverUnit: ServerUnit;
    try {
      serverUnit = serverPlayer.getOurFreeColGameObject(unitId, $J.cls(ServerUnit));
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e0;
      }
    }
    let tr = serverUnit.getTradeRoute();
    if (tr == null) {
      return serverPlayer.clientError$String('Unit has no trade route: ' + unitId);
    }
    let count: number;
    try {
      count = $J.parseInt(indexString);
    } catch ($e1) {
      if ($J.isa($e1, NumberFormatException)) {
        let nfe = $J.exc($e1);
        return serverPlayer.clientError$String('Stop index is not an integer: ' + indexString);
      } else {
        throw $e1;
      }
    }
    if (count < 0 || count >= tr.getStopCount()) {
      return serverPlayer.clientError$String('Invalid stop index: ' + indexString);
    }
    return this.igc$FreeColServer(freeColServer).setCurrentStop(serverPlayer, serverUnit, count);
  }
}

$J.define(SetCurrentStopMessage, 'net.sf.freecol.common.networking.SetCurrentStopMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_SetCurrentStopMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,int': '_SetCurrentStopMessage$Unit$int' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
  ServerUnit = $J.load('net.sf.freecol.server.model.ServerUnit');
});
