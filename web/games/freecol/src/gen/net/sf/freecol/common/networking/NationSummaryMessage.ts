// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/NationSummaryMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { ObjectMessage } from './ObjectMessage.ts';

let NationSummary, Player, Message$MessagePriority;

/**
 * The message sent when summarizing a nation.
 */
export class NationSummaryMessage extends ObjectMessage {
  static readonly TAG: string = 'nationSummary';
  static readonly PLAYER_TAG: string = 'player';
  /**
   * Create a new {@code NationSummaryMessage} for the
   * specified player.
   *
   * @param player The {@code Player} to summarize.
   * @param nationSummary An optional {@code NationSummary} to attach.
   */
  _NationSummaryMessage$Player$NationSummary(player: Player, nationSummary: NationSummary): this {
    this._ObjectMessage$String$StringArr(NationSummaryMessage.TAG, [NationSummaryMessage.PLAYER_TAG, player.getId()]);
    this.appendChild(nationSummary);
    return this;
  }
  /**
   * Create a new {@code NationSummaryMessage} from a stream.
   *
   * @param game The {@code Game} containing the nation to summarize.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _NationSummaryMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._ObjectMessage$String$FreeColXMLReader$StringArr(NationSummaryMessage.TAG, xr, [NationSummaryMessage.PLAYER_TAG]);
    let ns = null;
    while (xr.moreTags()) {
      let tag = xr.getLocalName();
      if ($J.equals(NationSummary.TAG, tag)) {
        if (ns == null) {
          ns = xr.readFreeColObject$Game$Class(game, $J.cls(NationSummary));
        } else {
          this.expected(NationSummaryMessage.TAG, tag);
        }
      } else {
        this.expected(NationSummary.TAG, tag);
      }
      xr.expectTag(tag);
    }
    xr.expectTag(NationSummaryMessage.TAG);
    this.appendChild(ns);
    return this;
  }
  /**
   * Client side helper to get the player.
   *
   * @param game The {@code Game} to look for a player within.
   * @return The player.
   */
  getPlayer(game: Game): Player {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(NationSummaryMessage.PLAYER_TAG), $J.cls(Player));
  }
  /**
   * Client side helper to get the summary.
   *
   * @return The summary.
   */
  getNationSummary(): NationSummary {
    return this.getChild(0, $J.cls(NationSummary));
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
    let other = this.getPlayer(freeColServer.getGame());
    let ns = this.getNationSummary();
    aiPlayer.nationSummaryHandler(other, ns);
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let game = freeColClient.getGame();
    let other = this.getPlayer(game);
    let ns = this.getNationSummary();
    this.igc$FreeColClient(freeColClient).nationSummaryHandler(other, ns);
    this.clientGeneric(freeColClient);
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let game = freeColServer.getGame();
    let player = this.getPlayer(game);
    if (player == null) {
      return serverPlayer.clientError$String('Not a player: ' + this.getStringAttribute(NationSummaryMessage.PLAYER_TAG));
    } else if (player.isIndian() && !serverPlayer.hasContacted(player)) {
      return null;
    }
    return this.igc$FreeColServer(freeColServer).nationSummary(serverPlayer, player);
  }
}

$J.define(NationSummaryMessage, 'net.sf.freecol.common.networking.NationSummaryMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.ObjectMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_NationSummaryMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Player,net.sf.freecol.common.model.NationSummary': '_NationSummaryMessage$Player$NationSummary' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority', 'getNationSummary': 'net.sf.freecol.common.model.NationSummary' } });
$J.module(() => {
  NationSummary = $J.load('net.sf.freecol.common.model.NationSummary');
  Player = $J.load('net.sf.freecol.common.model.Player');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
