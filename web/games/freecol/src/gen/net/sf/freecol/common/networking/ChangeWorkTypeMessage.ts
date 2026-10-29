// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/ChangeWorkTypeMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Unit, Message$MessagePriority;

/**
 * The message sent when changing the work type of a unit.
 */
export class ChangeWorkTypeMessage extends AttributeMessage {
  static readonly TAG: string = 'changeWorkType';
  static readonly UNIT_TAG: string = 'unit';
  static readonly WORK_TYPE_TAG: string = 'workType';
  /**
   * Create a new {@code ChangeWorkTypeMessage} with the
   * supplied unit and produce.
   *
   * @param unit The {@code Unit} that is working.
   * @param workType The {@code GoodsType} to produce.
   */
  _ChangeWorkTypeMessage$Unit$GoodsType(unit: Unit, workType: GoodsType): this {
    this._AttributeMessage$String$StringArr(ChangeWorkTypeMessage.TAG, [ChangeWorkTypeMessage.UNIT_TAG, unit.getId(), ChangeWorkTypeMessage.WORK_TYPE_TAG, workType.getId()]);
    return this;
  }
  /**
   * Create a new {@code ChangeWorkTypeMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _ChangeWorkTypeMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(ChangeWorkTypeMessage.TAG, xr, [ChangeWorkTypeMessage.UNIT_TAG, ChangeWorkTypeMessage.WORK_TYPE_TAG]);
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
    let spec = freeColServer.getSpecification();
    let unitId = this.getStringAttribute(ChangeWorkTypeMessage.UNIT_TAG);
    let workTypeId = this.getStringAttribute(ChangeWorkTypeMessage.WORK_TYPE_TAG);
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
    let type$ = spec.getGoodsType(workTypeId);
    if (type$ == null) {
      return serverPlayer.clientError$String('Not a goods type: ' + workTypeId);
    }
    return this.igc$FreeColServer(freeColServer).changeWorkType(serverPlayer, unit, type$);
  }
}

$J.define(ChangeWorkTypeMessage, 'net.sf.freecol.common.networking.ChangeWorkTypeMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_ChangeWorkTypeMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.GoodsType': '_ChangeWorkTypeMessage$Unit$GoodsType' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
