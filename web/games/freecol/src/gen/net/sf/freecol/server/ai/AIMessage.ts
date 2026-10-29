// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/AIMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';

/**
 * Wrapper class for AI message handling.
 */
export class AIMessage extends JObject {
  _AIMessage(): this {
    return this;
  }
  /**
   * An AIUnit attacks in the given direction.
   *
   * @param aiUnit The {@code AIUnit} to attack with.
   * @param direction The {@code Direction} to attack in.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askAttack(aiUnit: AIUnit, direction: Direction): boolean {
    return aiUnit.getAIOwner().askServer().attack(aiUnit.getUnit(), direction);
  }
  /**
   * An AIUnit attacks the given target with a ranged attack.
   *
   * @param aiUnit The {@code AIUnit} to attack with.
   * @param target The target {@code Tile} of the attack. 
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askAttackRanged(aiUnit: AIUnit, target: Tile): boolean {
    return aiUnit.getAIOwner().askServer().attackRanged(aiUnit.getUnit(), target);
  }
  /**
   * An AIUnit builds a colony.
   *
   * @param aiUnit The {@code AIUnit} to build the colony.
   * @param name The name of the colony.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askBuildColony(aiUnit: AIUnit, name: string): boolean {
    return aiUnit.getAIOwner().askServer().buildColony(name, aiUnit.getUnit());
  }
  /**
   * An AIUnit cashes in.
   *
   * @param aiUnit The {@code AIUnit} cashing in.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askCashInTreasureTrain(aiUnit: AIUnit): boolean {
    return aiUnit.getAIOwner().askServer().cashInTreasureTrain(aiUnit.getUnit());
  }
  /**
   * An AIUnit changes state.
   *
   * @param aiUnit The {@code AIUnit} to change the state of.
   * @param state The new {@code UnitState}.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askChangeState(aiUnit: AIUnit, state: Unit$UnitState): boolean {
    return aiUnit.getAIOwner().askServer().changeState(aiUnit.getUnit(), state);
  }
  /**
   * An AIUnit changes its work type.
   *
   * @param aiUnit The {@code AIUnit} to change the work type of.
   * @param type The {@code GoodsType} to produce.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askChangeWorkType(aiUnit: AIUnit, type$: GoodsType): boolean {
    return aiUnit.getAIOwner().askServer().changeWorkType(aiUnit.getUnit(), type$);
  }
  /**
   * An AIUnit changes its work improvement type.
   *
   * @param aiUnit The {@code AIUnit} to change the work type of.
   * @param type The {@code TileImprovementType} to produce.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askChangeWorkImprovementType(aiUnit: AIUnit, type$: TileImprovementType): boolean {
    return aiUnit.getAIOwner().askServer().changeWorkImprovementType(aiUnit.getUnit(), type$);
  }
  /**
   * Choose a founding father for an AI player.
   *
   * @param aiPlayer The {@code AIPlayer} that is choosing.
   * @param fathers A list of {@code FoundingFather}s to choose from.
   * @param father The {@code FoundingFather} that has been chosen.
   * @return True if the message was sent.
   */
  static askChooseFoundingFather(aiPlayer: AIPlayer, fathers: List<FoundingFather>, father: FoundingFather): boolean {
    return aiPlayer.askServer().chooseFoundingFather(fathers, father);
  }
  /**
   * Claims a tile for a colony.
   *
   * @param tile The {@code Tile} to claim.
   * @param aic The {@code AIColony} that is claiming.
   * @param price The price to pay.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askClaimLand$Tile$AIColony$int(tile: Tile, aic: AIColony, price: number): boolean {
    return aic.getAIOwner().askServer().claimTile(tile, aic.getColony(), price);
  }
  /**
   * Claims a tile.
   *
   * @param tile The {@code Tile} to claim.
   * @param aiUnit The {@code AIUnit} that is claiming.
   * @param price The price to pay.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askClaimLand$Tile$AIUnit$int(tile: Tile, aiUnit: AIUnit, price: number): boolean {
    return aiUnit.getAIOwner().askServer().claimTile(tile, aiUnit.getUnit(), price);
  }
  /**
   * Clears the speciality of a unit.
   *
   * @param aiUnit The {@code AIUnit} to clear.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askClearSpeciality(aiUnit: AIUnit): boolean {
    return aiUnit.getAIOwner().askServer().clearSpeciality(aiUnit.getUnit());
  }
  /**
   * Do some diplomacy.
   *
   * @param aiPlayer The {@code AIPlayer} being diplomatic.
   * @param our Our object ({@code Unit} or {@code Colony})
   *     conducting the diplomacy.
   * @param other The other object ({@code Unit} or {@code Colony})
   *     to negotiate with.
   * @param dt The {@code DiplomaticTrade} agreement to propose.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askDiplomacy(aiPlayer: AIPlayer, our: FreeColGameObject, other: FreeColGameObject, dt: DiplomaticTrade): boolean {
    return aiPlayer.askServer().diplomacy(our, other, dt);
  }
  /**
   * An AIUnit disbands.
   *
   * @param aiUnit The {@code AIUnit} to disband.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askDisband(aiUnit: AIUnit): boolean {
    return aiUnit.getAIOwner().askServer().disbandUnit(aiUnit.getUnit());
  }
  /**
   * An AIUnit disembarks.
   *
   * @param aiUnit The {@code AIUnit} disembarking.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askDisembark(aiUnit: AIUnit): boolean {
    return aiUnit.getAIOwner().askServer().disembark(aiUnit.getUnit());
  }
  /**
   * An AIUnit embarks.
   *
   * @param aiUnit The {@code AIUnit} carrier.
   * @param unit The {@code Unit} that is embarking.
   * @param direction The {@code Direction} to embark in (may be null).
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askEmbark(aiUnit: AIUnit, unit: Unit, direction: Direction): boolean {
    return aiUnit.getAIOwner().askServer().embark(unit, aiUnit.getUnit(), direction);
  }
  /**
   * A unit in Europe emigrates.
   *
   * @param aiPlayer The {@code AIPlayer} requiring emigration.
   * @param slot The slot to emigrate from.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askEmigrate(aiPlayer: AIPlayer, slot: number): boolean {
    return aiPlayer.askServer().emigrate(slot);
  }
  /**
   * Ends the player turn.
   *
   * @param aiPlayer The {@code AIPlayer} ending the turn.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askEndTurn(aiPlayer: AIPlayer): boolean {
    return aiPlayer.askServer().endTurn();
  }
  /**
   * Change the role of a unit.
   *
   * @param aiUnit The {@code AIUnit} to equip.
   * @param role The {@code Role} to equip for.
   * @param roleCount The role count.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askEquipForRole(aiUnit: AIUnit, role: Role, roleCount: number): boolean {
    return aiUnit.getAIOwner().askServer().equipUnitForRole(aiUnit.getUnit(), role, roleCount);
  }
  /**
   * Establishes a mission in the given direction.
   *
   * @param aiUnit The {@code AIUnit} establishing the mission.
   * @param direction The {@code Direction} to move the unit.
   * @param denounce Is this a denunciation?
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askEstablishMission(aiUnit: AIUnit, direction: Direction, denounce: boolean): boolean {
    return aiUnit.getAIOwner().askServer().missionary(aiUnit.getUnit(), direction, denounce);
  }
  /**
   * Handle a first contact.
   *
   * @param aiPlayer The {@code AIPlayer} being contacted.
   * @param contactor The contacting {@code Player}.
   * @param contactee The contacted {@code Player}.
   * @param tile The contact {@code Tile}.
   * @param ack The treaty acceptance state.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askFirstContact(aiPlayer: AIPlayer, contactor: Player, contactee: Player, tile: Tile, ack: boolean): boolean {
    return aiPlayer.askServer().firstContact(contactor, contactee, tile, ack);
  }
  /**
   * Makes demands to a colony.  One and only one of goods or gold is valid.
   *
   * @param aiPlayer The {@code AIPlayer} that is demanding or responding.
   * @param unit The {@code Unit} that is demanding.
   * @param colony The {@code Colony} to demand of.
   * @param type The {@code GoodsType} to demand.
   * @param amount The amount of goods to demand.
   * @param result Null if this is the initial demand, true/false if this
   *     is a response.
   * @return True if the message was sent, a non-error reply returned, and
   *     the demand was accepted.
   */
  static askIndianDemand(aiPlayer: AIPlayer, unit: Unit, colony: Colony, type$: GoodsType, amount: number, result: Constants$IndianDemandAction): boolean {
    return aiPlayer.askServer().indianDemand(unit, colony, type$, amount, result);
  }
  /**
   * An AI unit loads some cargo.
   *
   * @param loc The {@code Location} where the goods are.
   * @param type The {@code GoodsType} to load.
   * @param amount The amount of goods to load.
   * @param aiUnit The {@code AIUnit} that is loading.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askLoadGoods(loc: Location, type$: GoodsType, amount: number, aiUnit: AIUnit): boolean {
    return aiUnit.getAIOwner().askServer().loadGoods(loc, type$, amount, aiUnit.getUnit());
  }
  /**
   * An AI unit loots some cargo.
   *
   * @param aiUnit The {@code AIUnit} that is looting.
   * @param defenderId The object identifier of the defending unit.
   * @param goods A list of {@code Goods} to loot.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askLoot(aiUnit: AIUnit, defenderId: string, goods: List<Goods>): boolean {
    return aiUnit.getAIOwner().askServer().loot(aiUnit.getUnit(), defenderId, goods);
  }
  /**
   * Handle answering the monarch.
   *
   * @param aiPlayer The {@code AIPlayer} that is responding.
   * @param action The {@code MonarchAction} responded to.
   * @param accept Whether the action is accepted or not.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askMonarchAction(aiPlayer: AIPlayer, action: Monarch$MonarchAction, accept: boolean): boolean {
    return aiPlayer.askServer().answerMonarch(action, accept);
  }
  /**
   * Moves an AIUnit in the given direction.
   *
   * @param aiUnit The {@code AIUnit} to move.
   * @param direction The {@code Direction} to move the unit.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askMove(aiUnit: AIUnit, direction: Direction): boolean {
    return aiUnit.getAIOwner().askServer().move(aiUnit.getUnit(), direction);
  }
  /**
   * Moves an AIUnit across the high seas.
   *
   * @param aiUnit The {@code AIUnit} to move.
   * @param destination The {@code Location} to move to.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askMoveTo(aiUnit: AIUnit, destination: Location): boolean {
    return aiUnit.getAIOwner().askServer().moveTo(aiUnit.getUnit(), destination);
  }
  /**
   * Gets a nation summary for a player.
   *
   * @param owner The {@code AIPlayer} making the inquiry.
   * @param player The {@code Player} to summarize.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askNationSummary(owner: AIPlayer, player: Player): boolean {
    return owner.askServer().nationSummary(owner.getPlayer(), player);
  }
  /**
   * A native AIUnit delivers a gift to a colony.
   *
   * @param aiUnit The {@code AIUnit} delivering the gift.
   * @param colony The {@code Colony} to give to.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askNativeGift(aiUnit: AIUnit, colony: Colony): boolean {
    return aiUnit.getAIOwner().askServer().nativeGift(aiUnit.getUnit(), colony);
  }
  /**
   * Respond to a native trade offer.
   *
   * @param aiPlayer The {@code AIPlayer} that is trading.
   * @param action The {@code NativeTradeAction} to take.
   * @param nt The proposed {@code NativeTrade}.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askNativeTrade(aiPlayer: AIPlayer, action: NativeTrade$NativeTradeAction, nt: NativeTrade): boolean {
    return aiPlayer.askServer().nativeTrade(action, nt);
  }
  /**
   * Response to discovering the new world.
   *
   * @param aiPlayer The discovering {@code AIPlayer}.
   * @param unit The {@code Unit} that made the discovery.
   * @param name The new land name.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askNewLandName(aiPlayer: AIPlayer, unit: Unit, name: string): boolean {
    return aiPlayer.askServer().newLandName(unit, name);
  }
  /**
   * Response to discovering a new region.
   *
   * @param aiPlayer The discovering {@code AIPlayer}.
   * @param region The {@code Region} that was discovered.
   * @param tile The {@code Tile} of discovery.
   * @param unit The {@code Unit} that was discovering.
   * @param name The new region name.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askNewRegionName(aiPlayer: AIPlayer, region: Region, tile: Tile, unit: Unit, name: string): boolean {
    return aiPlayer.askServer().newRegionName(region, tile, unit, name);
  }
  /**
   * An AIUnit is put outside a colony.
   *
   * @param aiUnit The {@code AIUnit} to put out.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askPutOutsideColony(aiUnit: AIUnit): boolean {
    return aiUnit.getAIOwner().askServer().putOutsideColony(aiUnit.getUnit());
  }
  /**
   * Rearrange an AI colony.
   *
   * @param aiColony The {@code AIColony} to rearrange.
   * @param workers A list of worker {@code Unit}s that may change.
   * @param scratch A copy of the underlying {@code Colony} with the
   *     workers arranged as required.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askRearrangeColony(aiColony: AIColony, workers: List<Unit>, scratch: Colony): boolean {
    return aiColony.getAIOwner().askServer().rearrangeColony(aiColony.getColony(), workers, scratch);
  }
  /**
   * An AI unit speaks to the chief of a native settlement.
   *
   * @param aiUnit The {@code AIUnit} that is scouting.
   * @param is The {@code IndianSettlement} to scout.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askScoutSpeakToChief(aiUnit: AIUnit, is$: IndianSettlement): boolean {
    return aiUnit.getAIOwner().askServer().scoutSpeakToChief(aiUnit.getUnit(), is$);
  }
  /**
   * Set the build queue in a colony.
   *
   * @param aiColony The {@code AIColony} that is building.
   * @param queue The list of {@code BuildableType}s to build.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askSetBuildQueue(aiColony: AIColony, queue: List<BuildableType>): boolean {
    return aiColony.getAIOwner().askServer().setBuildQueue(aiColony.getColony(), queue);
  }
  /**
   * Train unit in Europe.
   *
   * @param aiPlayer The {@code AIPlayer} requiring training.
   * @param type The {@code UnitType} to train.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askTrainUnitInEurope(aiPlayer: AIPlayer, type$: UnitType): boolean {
    return aiPlayer.askServer().trainUnitInEurope(type$);
  }
  /**
   * An AI unit unloads some cargo.
   *
   * @param type The {@code GoodsType} to unload.
   * @param amount The amount of goods to unload.
   * @param aiUnit The {@code AIUnit} that is unloading.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askUnloadGoods(type$: GoodsType, amount: number, aiUnit: AIUnit): boolean {
    return aiUnit.getAIOwner().askServer().unloadGoods(type$, amount, aiUnit.getUnit());
  }
  /**
   * Set a unit to work in a work location.
   *
   * @param aiUnit The {@code AIUnit} to work.
   * @param workLocation The {@code WorkLocation} to work in.
   * @return True if the message was sent, and a non-error reply returned.
   */
  static askWork(aiUnit: AIUnit, workLocation: WorkLocation): boolean {
    return aiUnit.getAIOwner().askServer().work(aiUnit.getUnit(), workLocation);
  }
}

$J.define(AIMessage, 'net.sf.freecol.server.ai.AIMessage', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_AIMessage' }, meths: { 'askClaimLand(net.sf.freecol.common.model.Tile,net.sf.freecol.server.ai.AIUnit,int)': 'askClaimLand$Tile$AIUnit$int', 'askClaimLand(net.sf.freecol.common.model.Tile,net.sf.freecol.server.ai.AIColony,int)': 'askClaimLand$Tile$AIColony$int' } });
