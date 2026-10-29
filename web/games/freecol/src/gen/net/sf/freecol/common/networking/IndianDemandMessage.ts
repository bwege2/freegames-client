// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/IndianDemandMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception, JString, RuntimeException } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let Colony, Constants$IndianDemandAction, Unit, Message, Message$MessagePriority;

/**
 * The message sent to resolve natives making demands of a colony.
 */
export class IndianDemandMessage extends AttributeMessage {
  static readonly TAG: string = 'indianDemand';
  static readonly AMOUNT_TAG: string = 'amount';
  static readonly COLONY_TAG: string = 'colony';
  static readonly RESULT_TAG: string = 'result';
  static readonly TYPE_TAG: string = 'type';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code IndianDemandMessage} with the
   * supplied unit, colony and demands.
   *
   * @param unit The {@code Unit} that is demanding.
   * @param colony The {@code Colony} being demanded of.
   * @param type The {@code GoodsType} being demanded.
   * @param amount The amount of goods being demanded.
   */
  _IndianDemandMessage$Unit$Colony$GoodsType$int(unit: Unit, colony: Colony, type$: GoodsType, amount: number): this {
    this._AttributeMessage$String$StringArr(IndianDemandMessage.TAG, [IndianDemandMessage.UNIT_TAG, unit.getId(), IndianDemandMessage.COLONY_TAG, colony.getId(), IndianDemandMessage.TYPE_TAG, (type$ == null) ? null : type$.getId(), IndianDemandMessage.AMOUNT_TAG, String(amount)]);
    return this;
  }
  /**
   * Create a new {@code IndianDemandMessage} from a stream.
   *
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _IndianDemandMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(IndianDemandMessage.TAG, xr, [IndianDemandMessage.UNIT_TAG, IndianDemandMessage.COLONY_TAG, IndianDemandMessage.TYPE_TAG, IndianDemandMessage.AMOUNT_TAG, IndianDemandMessage.RESULT_TAG]);
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
  aiHandler(freeColServer: FreeColServer, aiPlayer: AIPlayer): void {
    let game = freeColServer.getGame();
    let unit = this.getUnit(game);
    let colony = this.getColony(game);
    let type$ = this.getType$Game(game);
    let amount = this.getAmount();
    let initialResult = this.getResult();
    aiPlayer.indianDemandHandler(unit, colony, type$, amount, initialResult);
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let game = freeColClient.getGame();
    let player = freeColClient.getMyPlayer();
    let unit = this.getUnit(game);
    let colony = this.getColony(game);
    let goodsType = this.getType$Game(game);
    let amount = this.getAmount();
    if (unit == null) {
      Message.logger.warning('IndianDemand with null unit.');
      return;
    }
    if (colony == null) {
      Message.logger.warning('IndianDemand with null colony');
      return;
    } else if (!player.owns(colony)) {
      throw new RuntimeException('Demand to anothers colony: ' + $J.str(colony));
    }
    this.igc$FreeColClient(freeColClient).indianDemandHandler(unit, colony, goodsType, amount);
    this.clientGeneric(freeColClient);
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let game = freeColServer.getGame();
    let unitId = this.getStringAttribute(IndianDemandMessage.UNIT_TAG);
    let colonyId = this.getStringAttribute(IndianDemandMessage.COLONY_TAG);
    let result = this.getResult();
    let unit: Unit;
    let colony: Colony;
    try {
      if (serverPlayer.isIndian()) {
        unit = serverPlayer.getOurFreeColGameObject(unitId, $J.cls(Unit));
        if (unit.getMovesLeft() <= 0) {
          return serverPlayer.clientError$String('Unit has no moves left: ' + unitId);
        }
        colony = unit.getAdjacentSettlement(colonyId, $J.cls(Colony));
        if (result !== Constants$IndianDemandAction.INDIAN_DEMAND_DONE) {
          return serverPlayer.clientError$String('Result in demand: ' + serverPlayer.getId() + ' ' + $J.str(result));
        }
      } else {
        unit = game.getFreeColGameObject$String$Class(unitId, $J.cls(Unit));
        if (unit == null) {
          return serverPlayer.clientError$String('Not a unit: ' + unitId);
        }
        colony = serverPlayer.getOurFreeColGameObject(colonyId, $J.cls(Colony));
        if (result == null) {
          return serverPlayer.clientError$String('No result in demand response: ' + serverPlayer.getId());
        }
      }
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e0;
      }
    }
    let amount = this.getAmount();
    if (amount <= 0) {
      return serverPlayer.clientError$String('Bad amount: ' + amount);
    }
    return this.igc$FreeColServer(freeColServer).indianDemand(serverPlayer, unit, colony, this.getType$Game(game), amount, result);
  }
  /**
   * Client-side convenience function to get the unit in this message.
   *
   * @param game The {@code Game} to look for the unit in.
   * @return The {@code Unit} found.
   */
  getUnit(game: Game): Unit {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(IndianDemandMessage.UNIT_TAG), $J.cls(Unit));
  }
  /**
   * Client-side convenience function to get the colony in this message.
   *
   * @param game The {@code Game} to look for the colony in.
   * @return The {@code Colony} found.
   */
  getColony(game: Game): Colony {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(IndianDemandMessage.COLONY_TAG), $J.cls(Colony));
  }
  /**
   * Client-side convenience function to get the goods type in this message.
   *
   * @param game The {@code Game} to look for the goods type in.
   * @return The {@code GoodsType} found.
   */
  getType$Game(game: Game): GoodsType {
    let typeId = this.getStringAttribute(IndianDemandMessage.TYPE_TAG);
    return (typeId == null) ? null : game.getSpecification().getGoodsType(typeId);
  }
  /**
   * Client-side convenience function to get the gold in this message.
   *
   * @return The amount of gold specified by this message, or -1 if
   *     none or invalid.
   */
  getAmount(): number {
    return this.getIntegerAttribute(IndianDemandMessage.AMOUNT_TAG, -1);
  }
  /**
   * Client-side convenience function to set the result of this message.
   *
   * @return The result of this demand.
   */
  getResult(): Constants$IndianDemandAction {
    return this.getEnumAttribute(IndianDemandMessage.RESULT_TAG, $J.cls(Constants$IndianDemandAction), Constants$IndianDemandAction.INDIAN_DEMAND_DONE);
  }
  /**
   * Client-side convenience function to set the result of this message.
   *
   * @param result The new result of this demand.
   * @return This message.
   */
  setResult(result: Constants$IndianDemandAction): IndianDemandMessage {
    this.setEnumAttribute(IndianDemandMessage.RESULT_TAG, result);
    return this;
  }
}

$J.define(IndianDemandMessage, 'net.sf.freecol.common.networking.IndianDemandMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_IndianDemandMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Colony,net.sf.freecol.common.model.GoodsType,int': '_IndianDemandMessage$Unit$Colony$GoodsType$int' }, returns: { 'getResult': 'net.sf.freecol.common.model.Constants$IndianDemandAction', 'getAmount': 'int', 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' }, meths: { 'getType(net.sf.freecol.common.model.Game)': 'getType$Game' } });
$J.module(() => {
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Constants$IndianDemandAction = $J.load('net.sf.freecol.common.model.Constants$IndianDemandAction');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message = $J.load('net.sf.freecol.common.networking.Message');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
