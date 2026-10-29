// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/LootCargoMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Exception } from '../../../../../../jre/index.ts';
import { ObjectMessage } from './ObjectMessage.ts';

let Goods, Unit, Message$MessagePriority;

/**
 * The message sent when looting cargo.
 */
export class LootCargoMessage extends ObjectMessage {
  static readonly TAG: string = 'lootCargo';
  static readonly LOSER_TAG: string = 'loser';
  static readonly WINNER_TAG: string = 'winner';
  /**
   * Create a new {@code LootCargoMessage}.
   *
   * @param winner The {@code Unit} that is looting.
   * @param loserId The identifier of the {@code Unit} that is looted.
   * @param goods The {@code AbstractGoods} to loot.
   */
  _LootCargoMessage$Unit$String$List(winner: Unit, loserId: string, goods: List<Goods>): this {
    this._ObjectMessage$String$StringArr(LootCargoMessage.TAG, [LootCargoMessage.WINNER_TAG, winner.getId(), LootCargoMessage.LOSER_TAG, loserId]);
    this.appendChildren(goods);
    return this;
  }
  /**
   * Create a new {@code LootCargoMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _LootCargoMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._ObjectMessage$String$FreeColXMLReader$StringArr(LootCargoMessage.TAG, xr, [LootCargoMessage.WINNER_TAG, LootCargoMessage.LOSER_TAG]);
    let goods = new ArrayList();
    while (xr.moreTags()) {
      let tag = xr.getLocalName();
      if ($J.equals(Goods.TAG, tag)) {
        let g = xr.readFreeColObject$Game$Class(game, $J.cls(Goods));
        if (g != null) {
          goods.add(g);
        }
      } else {
        this.expected(Goods.TAG, tag);
      }
      xr.expectTag(tag);
    }
    xr.expectTag(LootCargoMessage.TAG);
    this.appendChildren(goods);
    return this;
  }
  /**
   * Accessor for the winning unit.
   *
   * @param game The {@code Game} to look for the unit in.
   * @return The winner unit.
   */
  getWinner(game: Game): Unit {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(LootCargoMessage.WINNER_TAG), $J.cls(Unit));
  }
  /**
   * Accessor for the losing unit identifier.
   *
   * @return The loser unit object Identifier.
   */
  getLoserId(): string {
    return this.getStringAttribute(LootCargoMessage.LOSER_TAG);
  }
  /**
   * Accessor for the goods to loot.
   *
   * @return The goods to loot.
   */
  getGoods(): List<Goods> {
    return this.getChildren$Class($J.cls(Goods));
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
    let game = freeColServer.getGame();
    let winner = this.getWinner(game);
    let initialGoods = this.getGoods();
    let loserId = this.getLoserId();
    aiPlayer.lootCargoHandler(winner, initialGoods, loserId);
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let game = freeColClient.getGame();
    let unit = this.getWinner(game);
    let loserId = this.getLoserId();
    let goods = this.getGoods();
    if (unit == null) {
      return;
    }
    this.igc$FreeColClient(freeColClient).lootCargoHandler(unit, goods, loserId);
    this.clientGeneric(freeColClient);
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let game = freeColServer.getGame();
    let winner: Unit;
    try {
      winner = this.getWinner(game);
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e0;
      }
    }
    return this.igc$FreeColServer(freeColServer).lootCargo(serverPlayer, winner, this.getLoserId(), this.getGoods());
  }
}

$J.define(LootCargoMessage, 'net.sf.freecol.common.networking.LootCargoMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.ObjectMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_LootCargoMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,java.lang.String,java.util.List': '_LootCargoMessage$Unit$String$List' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority', 'getGoods': 'java.util.List', 'getLoserId': 'java.lang.String' } });
$J.module(() => {
  Goods = $J.load('net.sf.freecol.common.model.Goods');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
