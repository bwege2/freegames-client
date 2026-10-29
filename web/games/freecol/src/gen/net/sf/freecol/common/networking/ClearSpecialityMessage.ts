// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/ClearSpecialityMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * The message sent when clearing a unit speciality.
 */
export class ClearSpecialityMessage extends AttributeMessage {
  static readonly TAG: string = 'clearSpeciality';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code ClearSpecialityMessage} with the
   * supplied unit.
   *
   * @param unit The {@code Unit} to clear.
   */
  _ClearSpecialityMessage$Unit(unit: Unit): this {
    this._AttributeMessage$String$StringArr(ClearSpecialityMessage.TAG, [ClearSpecialityMessage.UNIT_TAG, unit.getId()]);
    return this;
  }
  /**
   * Create a new {@code ClearSpecialityMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _ClearSpecialityMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(ClearSpecialityMessage.TAG, xr, [ClearSpecialityMessage.UNIT_TAG]);
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
    let unitId = this.getStringAttribute(ClearSpecialityMessage.UNIT_TAG);
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
    return this.igc$FreeColServer(freeColServer).clearSpeciality(serverPlayer, unit);
  }
}

$J.define(ClearSpecialityMessage, 'net.sf.freecol.common.networking.ClearSpecialityMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_ClearSpecialityMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit': '_ClearSpecialityMessage$Unit' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
