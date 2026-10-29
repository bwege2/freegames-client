// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/GameStateMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Message$MessagePriority, FreeColServer$ServerState;

/**
 * The message sent to check the game state.
 */
export class GameStateMessage extends AttributeMessage {
  static readonly TAG: string = 'gameState';
  static readonly STATE_TAG: string = 'state';
  /**
   * Create a new {@code GameStateMessage}.
   */
  _GameStateMessage$(): this {
    this._AttributeMessage$String(GameStateMessage.TAG);
    return this;
  }
  /**
   * Create a new {@code GameStateMessage} with a given state.
   *
   * @param serverState The {@code serverState} to send.
   */
  _GameStateMessage$ServerState(serverState: FreeColServer$ServerState): this {
    this._AttributeMessage$String(GameStateMessage.TAG);
    if (serverState != null) {
      this.setStringAttribute(GameStateMessage.STATE_TAG, serverState.toString());
    }
    return this;
  }
  /**
   * Create a new {@code GameStateMessage} from a stream.
   *
   * @param game The {@code Game} to read within (unused, no game
   *     exists at this point).
   * @param xr The {@code FreeColXMLReader} to read from.
   */
  _GameStateMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._GameStateMessage$ServerState(xr.getAttribute$String$Class$Enum(GameStateMessage.STATE_TAG, $J.cls(FreeColServer$ServerState), null));
    return this;
  }
  /**
   * Get the game state.
   *
   * @return The game state, if present.
   */
  getState(): FreeColServer$ServerState {
    return this.getEnumAttribute(GameStateMessage.STATE_TAG, $J.cls(FreeColServer$ServerState), null);
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
  clientHandler(freeColClient: FreeColClient): void {
    let state = this.getState();
    if (state != null) {
      freeColClient.setServerState(state);
    }
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    return this.igc$FreeColServer(freeColServer).gameState();
  }
}

$J.define(GameStateMessage, 'net.sf.freecol.common.networking.GameStateMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_GameStateMessage$Game$FreeColXMLReader', 'net.sf.freecol.server.FreeColServer$ServerState': '_GameStateMessage$ServerState', '': '_GameStateMessage$' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority', 'getState': 'net.sf.freecol.server.FreeColServer$ServerState' } });
$J.module(() => {
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
  FreeColServer$ServerState = $J.load('net.sf.freecol.server.FreeColServer$ServerState');
});
