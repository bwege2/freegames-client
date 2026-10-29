// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/DisembarkMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Message$MessagePriority, ServerUnit;

/**
 * The message sent when disembarking.
 */
export class DisembarkMessage extends AttributeMessage {
  static readonly TAG: string = 'disembark';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code DisembarkMessage} with the
   * supplied name.
   *
   * @param unit The {@code Unit} that is disembarking.
   */
  _DisembarkMessage$Unit(unit: Unit): this {
    this._AttributeMessage$String$StringArr(DisembarkMessage.TAG, [DisembarkMessage.UNIT_TAG, unit.getId()]);
    return this;
  }
  /**
   * Create a new {@code DisembarkMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _DisembarkMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(DisembarkMessage.TAG, xr, [DisembarkMessage.UNIT_TAG]);
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
    let unitId = this.getStringAttribute(DisembarkMessage.UNIT_TAG);
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
    return this.igc$FreeColServer(freeColServer).disembarkUnit(serverPlayer, unit);
  }
}

$J.define(DisembarkMessage, 'net.sf.freecol.common.networking.DisembarkMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_DisembarkMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit': '_DisembarkMessage$Unit' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
  ServerUnit = $J.load('net.sf.freecol.server.model.ServerUnit');
});
