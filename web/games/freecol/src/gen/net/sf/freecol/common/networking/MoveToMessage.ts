// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/MoveToMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * The message sent when moving a unit across the high seas.
 */
export class MoveToMessage extends AttributeMessage {
  static readonly TAG: string = 'moveTo';
  static readonly DESTINATION_TAG: string = 'destination';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code MoveToMessage} for the supplied unit
   * and destination.
   *
   * @param unit The {@code Unit} to move.
   * @param destination The {@code Location} to move to.
   */
  _MoveToMessage$Unit$Location(unit: Unit, destination: Location): this {
    this._AttributeMessage$String$StringArr(MoveToMessage.TAG, [MoveToMessage.UNIT_TAG, unit.getId(), MoveToMessage.DESTINATION_TAG, destination.getId()]);
    return this;
  }
  /**
   * Create a new {@code MoveToMessage} from a stream.
   *
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _MoveToMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(MoveToMessage.TAG, xr, [MoveToMessage.UNIT_TAG, MoveToMessage.DESTINATION_TAG]);
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
    let game = serverPlayer.getGame();
    let unitId = this.getStringAttribute(MoveToMessage.UNIT_TAG);
    let destinationId = this.getStringAttribute(MoveToMessage.DESTINATION_TAG);
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
    let destination = game.findFreeColLocation(destinationId);
    if (destination == null) {
      return serverPlayer.clientError$String('Not a location: ' + destinationId);
    }
    return this.igc$FreeColServer(freeColServer).moveTo(serverPlayer, unit, destination);
  }
}

$J.define(MoveToMessage, 'net.sf.freecol.common.networking.MoveToMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_MoveToMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Location': '_MoveToMessage$Unit$Location' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
