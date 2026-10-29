// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/NativeGiftMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Colony, Unit, Message$MessagePriority;

/**
 * The message sent when a native delivers a gift to a Colony.
 */
export class NativeGiftMessage extends AttributeMessage {
  static readonly TAG: string = 'nativeGift';
  static readonly COLONY_TAG: string = 'colony';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code NativeGiftMessage}.
   *
   * @param unit The {@code Unit} that is trading.
   * @param colony The {@code Colony} that is trading.
   */
  _NativeGiftMessage$Unit$Colony(unit: Unit, colony: Colony): this {
    this._AttributeMessage$String$StringArr(NativeGiftMessage.TAG, [NativeGiftMessage.UNIT_TAG, unit.getId(), NativeGiftMessage.COLONY_TAG, colony.getId()]);
    return this;
  }
  /**
   * Create a new {@code NativeGiftMessage} from a stream.
   *
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _NativeGiftMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(NativeGiftMessage.TAG, xr, [NativeGiftMessage.UNIT_TAG, NativeGiftMessage.COLONY_TAG]);
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
  aiHandler(freeColServer: FreeColServer, aiPlayer: AIPlayer): void {
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let unitId = this.getStringAttribute(NativeGiftMessage.UNIT_TAG);
    let colonyId = this.getStringAttribute(NativeGiftMessage.COLONY_TAG);
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
    let colony: Colony;
    try {
      colony = unit.getAdjacentSettlement(colonyId, $J.cls(Colony));
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e1;
      }
    }
    return this.igc$FreeColServer(freeColServer).nativeGift(serverPlayer, unit, colony);
  }
}

$J.define(NativeGiftMessage, 'net.sf.freecol.common.networking.NativeGiftMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_NativeGiftMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Colony': '_NativeGiftMessage$Unit$Colony' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
