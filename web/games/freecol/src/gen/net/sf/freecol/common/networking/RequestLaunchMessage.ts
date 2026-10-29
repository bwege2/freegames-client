// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/RequestLaunchMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * A trivial message to inform the server that a client is ready to launch.
 */
export class RequestLaunchMessage extends TrivialMessage {
  static readonly TAG: string = 'requestLaunch';
  /**
   * Create a new {@code RequestLaunchMessage}.
   */
  _RequestLaunchMessage$(): this {
    this._TrivialMessage$String(RequestLaunchMessage.TAG);
    return this;
  }
  /**
   * Create a new {@code RequestLaunchMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _RequestLaunchMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._TrivialMessage$String$Game$FreeColXMLReader(RequestLaunchMessage.TAG, game, xr);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    return this.pgc$FreeColServer(freeColServer).requestLaunch(serverPlayer);
  }
}

$J.define(RequestLaunchMessage, 'net.sf.freecol.common.networking.RequestLaunchMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.TrivialMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_RequestLaunchMessage$Game$FreeColXMLReader', '': '_RequestLaunchMessage$' } });
