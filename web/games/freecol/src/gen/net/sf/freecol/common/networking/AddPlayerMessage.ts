// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/AddPlayerMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { ObjectMessage } from './ObjectMessage.ts';

let FreeColXMLReader$ReadScope, FreeColXMLWriter$WriteScope, Player, Message$MessagePriority;

/**
 * The message sent to add or update players to the game.
 */
export class AddPlayerMessage extends ObjectMessage {
  static readonly TAG: string = 'addPlayer';
  /**
   * The player to specialize the players for.
   */
  destination: Player = null;
  /**
   * Create a new {@code AddPlayerMessage}.
   *
   * @param destination An optional {@code Player} that will see this message.
   * @param players A list of {@code Player}s to add.
   */
  _AddPlayerMessage$Player$List(destination: Player, players: List<Player>): this {
    this._ObjectMessage$String(AddPlayerMessage.TAG);
    this.destination = destination;
    this.appendChildren(players);
    return this;
  }
  /**
   * Create a new {@code AddPlayerMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _AddPlayerMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._ObjectMessage$String(AddPlayerMessage.TAG);
    this.destination = null;
    let rs = xr.replaceScope(FreeColXMLReader$ReadScope.NOINTERN);
    let players = new ArrayList();
    try {
      while (xr.moreTags()) {
        let tag = xr.getLocalName();
        if ($J.equals(Player.TAG, tag)) {
          let p = xr.readFreeColObject$Game$Class(game, $J.cls(Player));
          if (p != null) {
            players.add(p);
          }
        } else {
          this.expected(Player.TAG, tag);
        }
        xr.expectTag(tag);
      }
      xr.expectTag(AddPlayerMessage.TAG);
    } finally {
      xr.replaceScope(rs);
    }
    this.appendChildren(players);
    return this;
  }
  /**
   * Get the attached players.
   *
   * @return The list of {@code Player}s to add.
   */
  getPlayers(): List<Player> {
    return this.getChildren$Class($J.cls(Player));
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.ADDPLAYER;
  }
  /**
   * {@inheritDoc}
   */
  toXML(xw: FreeColXMLWriter): void {
    let ws = null;
    if (this.destination != null) {
      ws = xw.replaceScope(FreeColXMLWriter$WriteScope.toClient(this.destination));
    }
    super.toXML(xw);
    if (this.destination != null) {
      xw.replaceScope(ws);
    }
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
    let players = this.getPlayers();
    if (freeColClient.isInGame()) {
      this.igc$FreeColClient(freeColClient).addPlayerHandler(players);
    } else {
      this.pgc$FreeColClient(freeColClient).addPlayerHandler(players);
    }
  }
}

$J.define(AddPlayerMessage, 'net.sf.freecol.common.networking.AddPlayerMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.ObjectMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_AddPlayerMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Player,java.util.List': '_AddPlayerMessage$Player$List' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority', 'getPlayers': 'java.util.List' } });
$J.module(() => {
  FreeColXMLReader$ReadScope = $J.load('net.sf.freecol.common.io.FreeColXMLReader$ReadScope');
  FreeColXMLWriter$WriteScope = $J.load('net.sf.freecol.common.io.FreeColXMLWriter$WriteScope');
  Player = $J.load('net.sf.freecol.common.model.Player');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
