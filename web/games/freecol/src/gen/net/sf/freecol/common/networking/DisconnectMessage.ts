// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/DisconnectMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { TrivialMessage } from './TrivialMessage.ts';

/**
 * A trivial message to indicate disconnection.
 */
export class DisconnectMessage extends TrivialMessage {
  static readonly TAG: string = 'disconnect';
  /**
   * Create a new {@code DisconnectMessage}.
   */
  _DisconnectMessage$(): this {
    this._TrivialMessage$String(DisconnectMessage.TAG);
    return this;
  }
  /**
   * Create a new {@code DisconnectMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _DisconnectMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._TrivialMessage$String$Game$FreeColXMLReader(DisconnectMessage.TAG, game, xr);
    return this;
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
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    return this.igc$FreeColServer(freeColServer).disconnect(serverPlayer);
  }
}

$J.define(DisconnectMessage, 'net.sf.freecol.common.networking.DisconnectMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.TrivialMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_DisconnectMessage$Game$FreeColXMLReader', '': '_DisconnectMessage$' } });
