// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/CloseMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let Message$MessagePriority;

/**
 * A message sent to clients to signal that a panel should be closed.
 */
export class CloseMessage extends AttributeMessage {
  static readonly TAG: string = 'close';
  static readonly PANEL_TAG: string = 'panel';
  /**
   * Create a new {@code CloseMessage}.
   *
   * @param panel The panel name.
   */
  _CloseMessage$String(panel: string): this {
    this._AttributeMessage$String$StringArr(CloseMessage.TAG, [CloseMessage.PANEL_TAG, panel]);
    return this;
  }
  /**
   * Create a new {@code CloseMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _CloseMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(CloseMessage.TAG, xr, [CloseMessage.PANEL_TAG]);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.LAST;
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
    this.igc$FreeColClient(freeColClient).closeHandler(this.getPanel());
  }
  getPanel(): string {
    return this.getStringAttribute(CloseMessage.PANEL_TAG);
  }
}

$J.define(CloseMessage, 'net.sf.freecol.common.networking.CloseMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_CloseMessage$Game$FreeColXMLReader', 'java.lang.String': '_CloseMessage$String' }, returns: { 'getPanel': 'java.lang.String', 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
