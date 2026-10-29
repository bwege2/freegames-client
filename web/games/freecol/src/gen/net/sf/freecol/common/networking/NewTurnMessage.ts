// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/NewTurnMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let Message, Message$MessagePriority;

/**
 * The message sent to the clients to signal a new turn.
 */
export class NewTurnMessage extends AttributeMessage {
  static readonly TAG: string = 'newTurn';
  static readonly TURN_TAG: string = 'turn';
  /**
   * Create a new {@code NewTurnMessage} with the
   * supplied message.
   *
   * @param turn The new {@code Turn}.
   */
  _NewTurnMessage$Turn(turn: Turn): this {
    this._AttributeMessage$String$StringArr(NewTurnMessage.TAG, [NewTurnMessage.TURN_TAG, String(turn.getNumber())]);
    return this;
  }
  /**
   * Create a new {@code NewTurnMessage} from a stream.
   *
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _NewTurnMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(NewTurnMessage.TAG, xr, [NewTurnMessage.TURN_TAG]);
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
  aiHandler(freeColServer: FreeColServer, aiPlayer: AIPlayer): void {
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let turn = this.getTurnNumber();
    if (turn < 0) {
      Message.logger.warning('Invalid turn for newTurn: ' + String(turn));
      return;
    }
    this.igc$FreeColClient(freeColClient).newTurnHandler(turn);
    this.clientGeneric(freeColClient);
  }
  /**
   * Get the turn number.
   *
   * @return The turn number.
   */
  getTurnNumber(): number {
    return this.getIntegerAttribute(NewTurnMessage.TURN_TAG, 0);
  }
}

$J.define(NewTurnMessage, 'net.sf.freecol.common.networking.NewTurnMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_NewTurnMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Turn': '_NewTurnMessage$Turn' }, returns: { 'getTurnNumber': 'int', 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Message = $J.load('net.sf.freecol.common.networking.Message');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
