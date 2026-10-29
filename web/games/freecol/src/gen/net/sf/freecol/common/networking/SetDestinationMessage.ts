// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/SetDestinationMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * The message sent when the client requests setting a unit destination.
 */
export class SetDestinationMessage extends AttributeMessage {
  static readonly TAG: string = 'setDestination';
  static readonly DESTINATION_TAG: string = 'destination';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code SetDestinationMessage} with the supplied unit
   * and destination.
   *
   * @param unit The {@code Unit} whose destination is to be set
   * @param destination The destination to set (may be null)
   */
  _SetDestinationMessage$Unit$Location(unit: Unit, destination: Location): this {
    this._AttributeMessage$String$StringArr(SetDestinationMessage.TAG, [SetDestinationMessage.UNIT_TAG, unit.getId(), SetDestinationMessage.DESTINATION_TAG, ((destination == null) ? null : destination.getId())]);
    return this;
  }
  /**
   * Create a new {@code SetDestinationMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to (null here).
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _SetDestinationMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(SetDestinationMessage.TAG, xr, [SetDestinationMessage.UNIT_TAG, SetDestinationMessage.DESTINATION_TAG]);
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
    let game = freeColServer.getGame();
    let unitId = this.getStringAttribute(SetDestinationMessage.UNIT_TAG);
    let destinationId = this.getStringAttribute(SetDestinationMessage.DESTINATION_TAG);
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
    let destination = (destinationId == null) ? null : game.findFreeColLocation(destinationId);
    return this.igc$FreeColServer(freeColServer).setDestination(serverPlayer, unit, destination);
  }
}

$J.define(SetDestinationMessage, 'net.sf.freecol.common.networking.SetDestinationMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_SetDestinationMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Location': '_SetDestinationMessage$Unit$Location' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
