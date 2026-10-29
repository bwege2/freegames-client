// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/FountainOfYouthMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * The message that contains a fountainOfYouth string.
 */
export class FountainOfYouthMessage extends AttributeMessage {
  static readonly TAG: string = 'fountainOfYouth';
  static readonly MIGRANTS_TAG: string = 'migrants';
  /**
   * Create a new {@code FountainOfYouthMessage}.
   *
   * @param migrants The number of new migrants on the docks.
   */
  _FountainOfYouthMessage$int(migrants: number): this {
    this._AttributeMessage$String$StringArr(FountainOfYouthMessage.TAG, [FountainOfYouthMessage.MIGRANTS_TAG, String(migrants)]);
    return this;
  }
  /**
   * Create a new {@code FountainOfYouthMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _FountainOfYouthMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(FountainOfYouthMessage.TAG, xr, [FountainOfYouthMessage.MIGRANTS_TAG]);
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
    let n = this.getMigrants();
    aiPlayer.fountainOfYouthHandler(n);
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let n = this.getMigrants();
    if (n <= 0) {
      Message.logger.warning('Invalid migrants attribute: ' + n);
      return;
    }
    this.igc$FreeColClient(freeColClient).fountainOfYouthHandler(n);
    this.clientGeneric(freeColClient);
  }
  /**
   * Get the number of migrants.
   *
   * @return The number of migrants.
   */
  getMigrants(): number {
    return this.getIntegerAttribute(FountainOfYouthMessage.MIGRANTS_TAG, -1);
  }
}

$J.define(FountainOfYouthMessage, 'net.sf.freecol.common.networking.FountainOfYouthMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_FountainOfYouthMessage$Game$FreeColXMLReader', 'int': '_FountainOfYouthMessage$int' }, returns: { 'getMigrants': 'int', 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Message = $J.load('net.sf.freecol.common.networking.Message');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
