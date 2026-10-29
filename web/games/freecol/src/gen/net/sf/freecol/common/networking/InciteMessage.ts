// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/InciteMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception, JString } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let IndianSettlement, Player, Unit, Unit$MoveType, Message$MessagePriority;

/**
 * The message sent when inciting a native settlement.
 */
export class InciteMessage extends AttributeMessage {
  static readonly TAG: string = 'incite';
  static readonly ENEMY_TAG: string = 'enemy';
  static readonly GOLD_TAG: string = 'gold';
  static readonly SETTLEMENT_TAG: string = 'settlement';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code InciteMessage} with the
   * supplied name.
   *
   * @param unit The inciting {@code Unit}.
   * @param is The {@code IndianSettlement} to incite.
   * @param enemy The enemy {@code Player}.
   * @param gold The amount of gold in the bribe (negative for the
   *             initial inquiry).
   */
  _InciteMessage$Unit$IndianSettlement$Player$int(unit: Unit, is$: IndianSettlement, enemy: Player, gold: number): this {
    this._AttributeMessage$String$StringArr(InciteMessage.TAG, [InciteMessage.UNIT_TAG, unit.getId(), InciteMessage.SETTLEMENT_TAG, is$.getId(), InciteMessage.ENEMY_TAG, enemy.getId(), InciteMessage.GOLD_TAG, String(gold)]);
    return this;
  }
  /**
   * Create a new {@code InciteMessage} from a stream.
   *
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _InciteMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(InciteMessage.TAG, xr, [InciteMessage.UNIT_TAG, InciteMessage.SETTLEMENT_TAG, InciteMessage.ENEMY_TAG, InciteMessage.GOLD_TAG]);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  currentPlayerMessage(): boolean {
    return true;
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
    let game = freeColClient.getGame();
    let player = freeColClient.getMyPlayer();
    let unit = this.getUnit(player);
    let is$ = this.getSettlement(unit);
    let enemy = this.getEnemy(game);
    let gold = this.getGold();
    this.igc$FreeColClient(freeColClient).inciteHandler(unit, is$, enemy, gold);
    this.clientGeneric(freeColClient);
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let game = freeColServer.getGame();
    let unit: ServerUnit;
    try {
      unit = this.getUnit(serverPlayer);
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e0;
      }
    }
    let is$: IndianSettlement;
    try {
      is$ = this.getSettlement(unit);
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e1;
      }
    }
    let type$: Unit$MoveType;
    let enemy = this.getEnemy(game);
    if (enemy == null) {
      return serverPlayer.clientError$String('Not a player: ' + this.getStringAttribute(InciteMessage.ENEMY_TAG));
    } else if (enemy === serverPlayer) {
      return serverPlayer.clientError$String('Inciting against oneself!');
    } else if (!enemy.isEuropean()) {
      return serverPlayer.clientError$String('Inciting against non-European!');
    } else if ((type$ = unit.getMoveType$Tile(is$.getTile$())) !== Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_MISSIONARY) {
      return serverPlayer.clientError$String('Unable to enter ' + is$.getName() + ': ' + type$.whyIllegal());
    }
    let gold = this.getGold();
    return this.igc$FreeColServer(freeColServer).incite(serverPlayer, unit, is$, enemy, gold);
  }
  getUnit(player: Player): Unit {
    return player.getOurFreeColGameObject(this.getStringAttribute(InciteMessage.UNIT_TAG), $J.cls(Unit));
  }
  getSettlement(unit: Unit): IndianSettlement {
    return unit.getAdjacentSettlement(this.getStringAttribute(InciteMessage.SETTLEMENT_TAG), $J.cls(IndianSettlement));
  }
  getEnemy(game: Game): Player {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(InciteMessage.ENEMY_TAG), $J.cls(Player));
  }
  getGold(): number {
    return this.getIntegerAttribute(InciteMessage.GOLD_TAG, -1);
  }
}

$J.define(InciteMessage, 'net.sf.freecol.common.networking.InciteMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_InciteMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.IndianSettlement,net.sf.freecol.common.model.Player,int': '_InciteMessage$Unit$IndianSettlement$Player$int' }, returns: { 'getGold': 'int', 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  Player = $J.load('net.sf.freecol.common.model.Player');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
