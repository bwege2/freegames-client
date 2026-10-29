// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/VacantPlayersMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Message$MessagePriority, CollectionUtils;

/**
 * The message sent to discover vacant players in a game.
 */
export class VacantPlayersMessage extends AttributeMessage {
  static readonly TAG: string = 'vacantPlayers';
  /**
   * Create a new {@code VacantPlayersMessage}.
   */
  _VacantPlayersMessage$(): this {
    this._AttributeMessage$String(VacantPlayersMessage.TAG);
    return this;
  }
  /**
   * Create a new {@code VacantPlayersMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to (null here).
   * @param xr The {@code FreeColXMLReader} to read from.
   */
  _VacantPlayersMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$Map(VacantPlayersMessage.TAG, xr.getArrayAttributeMap());
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
  clientHandler(freeColClient: FreeColClient): void {
    let vacant = this.getVacantPlayers();
    freeColClient.setVacantPlayerNames(vacant);
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    return this.pgc$FreeColServer(freeColServer).vacantPlayers();
  }
  /**
   * Get the vacant players.
   *
   * @return A list of vacant code player identifiers.
   */
  getVacantPlayers(): List<string> {
    return this.getArrayAttributes();
  }
  /**
   * Set the vacant players in this message from a given game.
   *
   * @param game The {@code Game} to find players in.
   * @return This message.
   */
  setVacantPlayers(game: Game): VacantPlayersMessage {
    if (game == null) {
      return this;
    }
    let vacantPred = (p) => !p.isREF() && (p.isAI() || !p.isConnected());
    this.setArrayAttributes$List(CollectionUtils.transform$Stream$Predicate$Function(game.getLiveEuropeanPlayers([]), vacantPred, ($p0) => $p0.getNationId()));
    return this;
  }
}

$J.define(VacantPlayersMessage, 'net.sf.freecol.common.networking.VacantPlayersMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_VacantPlayersMessage$Game$FreeColXMLReader', '': '_VacantPlayersMessage$' }, returns: { 'getVacantPlayers': 'java.util.List', 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
