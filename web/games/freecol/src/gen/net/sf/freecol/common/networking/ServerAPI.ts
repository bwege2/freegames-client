// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/ServerAPI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IOException, JObject, Level, Logger, XMLStreamException } from '../../../../../../jre/index.ts';

let FreeColException, AbandonColonyMessage, AskSkillMessage, AssignTeacherMessage, AssignTradeRouteMessage, AttackMessage, AttackRangedMessage, BuildColonyMessage, CashInTreasureTrainMessage, ChangeStateMessage, ChangeWorkImprovementTypeMessage, ChangeWorkTypeMessage, ChatMessage, ChooseFoundingFatherMessage, ClaimLandMessage, ClearSpecialityMessage, DeclareIndependenceMessage, DeclineMoundsMessage, DeleteTradeRouteMessage, DeliverGiftMessage, DemandTributeMessage, DiplomacyMessage, DisbandUnitMessage, DisembarkMessage, EmbarkMessage, EmigrateUnitMessage, EquipForRoleMessage, FirstContactMessage, HighScoresMessage, InciteMessage, IndianDemandMessage, JoinColonyMessage, LearnSkillMessage, LoadGoodsMessage, LoginMessage, LogoutMessage, LootCargoMessage, MissionaryMessage, MonarchActionMessage, MoveMessage, MoveToMessage, NationSummaryMessage, NativeGiftMessage, NativeTradeMessage, NewLandNameMessage, NewRegionNameMessage, NewTradeRouteMessage, PayArrearsMessage, PayForBuildingMessage, PutOutsideColonyMessage, ReadyMessage, RearrangeColonyMessage, RenameMessage, ScoutIndianSettlementMessage, ScoutSpeakToChiefMessage, SetAvailableMessage, SetBuildQueueMessage, SetColorMessage, SetCurrentStopMessage, SetDestinationMessage, SetGoodsLevelsMessage, SetNationMessage, SetNationTypeMessage, SpySettlementMessage, TrainUnitInEuropeMessage, TrivialMessage, UnloadGoodsMessage, UpdateGameOptionsMessage, UpdateMapGeneratorOptionsMessage, UpdateTradeRouteMessage, WorkMessage;

/**
 * The API for client/server messaging.
 */
export class ServerAPI extends JObject {
  static logger: Logger = null;
  /**
   * Creates a new {@code ServerAPI}.
   */
  _ServerAPI(): this {
    return this;
  }
  /**
   * Sets the message handler for the connection.
   *
   * @param mh The new {@code MessageHandler}.
   */
  setMessageHandler(mh: MessageHandler): void {
    let c = this.getConnection();
    if (c != null) {
      c.setMessageHandler(mh);
    }
  }
  /**
   * Convenience utility to check the connection.
   *
   * @return True if the server connection is open.
   */
  isConnected(): boolean {
    return this.getConnection() != null;
  }
  /**
   * Check the connection.
   *
   * @param operation The proposed operation.
   * @param type The proposed type of message.
   * @return The {@code Connection} if valid, or null if not.
   */
  check(operation: string, type$: string): Connection {
    let c = this.getConnection();
    if (c == null) {
      ServerAPI.logger.log(Level.WARNING, 'Not connected, did not ' + operation + ': ' + type$);
    }
    return c;
  }
  /**
   * Sends a message to the server.
   *
   * @param message The {@code Message} to send.
   * @return True if the send succeeded.
   */
  send(message: Message): boolean {
    if (message == null) {
      return true;
    }
    let c = this.check('send', message.getType$());
    if (c != null) {
      try {
        c.send(message);
        return true;
      } catch ($e0) {
        if ($J.isa($e0, FreeColException) || $J.isa($e0, IOException) || $J.isa($e0, XMLStreamException)) {
          let ex = $J.exc($e0);
          ServerAPI.logger.log(Level.WARNING, 'Failed to send', ex);
        } else {
          throw $e0;
        }
      }
    }
    return false;
  }
  /**
   * Sends the specified message to the server and processes the reply.
   *
   * In following routines we follow the convention that server I/O
   * is confined to the ask<em>foo</em>() routine, which typically
   * returns true if the server interaction succeeded, which does
   * *not* necessarily imply that the actual substance of the
   * request was allowed (e.g. a move may result in the death of a
   * unit rather than actually moving).
   *
   * @param message A {@code Message} to send.
   * @return True if the server interaction succeeded, that is, there was
   *     no I/O problem and the reply was not an error message.
   */
  ask(message: Message): boolean {
    if (message == null) {
      return true;
    }
    let c = this.check('ask', message.getType$());
    if (c != null) {
      try {
        c.request(message);
        return true;
      } catch ($e1) {
        if ($J.isa($e1, FreeColException) || $J.isa($e1, IOException) || $J.isa($e1, XMLStreamException)) {
          let ex = $J.exc($e1);
          ServerAPI.logger.log(Level.WARNING, 'Failed to ask', ex);
        } else {
          throw $e1;
        }
      }
    }
    return false;
  }
  /**
   * Server query-response to abandon a colony.
   *
   * @param colony The {@code Colony} to abandon.
   * @return True if the server interaction succeeded.
   */
  abandonColony(colony: Colony): boolean {
    return this.ask(new AbandonColonyMessage()._AbandonColonyMessage$Colony(colony));
  }
  /**
   * Server query-response to respond to a monarch offer.
   *
   * @param action The monarch action responded to.
   * @param accept Accept or reject the offer.
   * @return True if the server interaction succeeded.
   */
  answerMonarch(action: Monarch$MonarchAction, accept: boolean): boolean {
    return this.ask(new MonarchActionMessage()._MonarchActionMessage$MonarchAction$StringTemplate$String(action, null, '').setResult(accept));
  }
  /**
   * Server query-response for finding out the skill taught at a settlement.
   *
   * @param unit The {@code Unit} that is asking.
   * @param direction The direction to a settlement to ask.
   * @return True if the server interaction succeeded.
   */
  askSkill(unit: Unit, direction: Direction): boolean {
    return this.ask(new AskSkillMessage()._AskSkillMessage$Unit$Direction(unit, direction));
  }
  /**
   * Server query-response for assigning a teacher.
   *
   * @param student The student {@code Unit}.
   * @param teacher The teacher {@code Unit}.
   * @return True if the server interaction succeeded.
   */
  assignTeacher(student: Unit, teacher: Unit): boolean {
    return this.ask(new AssignTeacherMessage()._AssignTeacherMessage$Unit$Unit(student, teacher));
  }
  /**
   * Server query-response for assigning a trade route to a unit.
   *
   * @param unit The {@code Unit} to assign a trade route to.
   * @param tradeRoute The {@code TradeRoute} to assign.
   * @return True if the server interaction succeeded.
   */
  assignTradeRoute(unit: Unit, tradeRoute: TradeRoute): boolean {
    return this.ask(new AssignTradeRouteMessage()._AssignTradeRouteMessage$Unit$TradeRoute(unit, tradeRoute));
  }
  /**
   * Server query-response for attacking.
   *
   * @param unit The {@code Unit} to perform the attack.
   * @param direction The direction in which to attack.
   * @return True if the server interaction succeeded.
   */
  attack(unit: Unit, direction: Direction): boolean {
    return this.ask(new AttackMessage()._AttackMessage$Unit$Direction(unit, direction));
  }
  /**
   * Server query-response for ranged attacking.
   *
   * @param unit The {@code Unit} to perform the attack.
   * @param target The target {@code Tile} of the attack.
   * @return True if the server interaction succeeded.
   */
  attackRanged(unit: Unit, target: Tile): boolean {
    return this.ask(new AttackRangedMessage()._AttackRangedMessage$Unit$Tile(unit, target));
  }
  /**
   * Server query-response for building a colony.
   *
   * @param name The name for the colony.
   * @param unit The {@code Unit} that will build.
   * @return True if the server interaction succeeded.
   */
  buildColony(name: string, unit: Unit): boolean {
    return this.ask(new BuildColonyMessage()._BuildColonyMessage$String$Unit(name, unit));
  }
  /**
   * Server query-response to cash in a treasure train.
   *
   * @param unit The treasure train {@code Unit} to cash in.
   * @return True if the server interaction succeeded.
   */
  cashInTreasureTrain(unit: Unit): boolean {
    return this.ask(new CashInTreasureTrainMessage()._CashInTreasureTrainMessage$Unit(unit));
  }
  /**
   * Server query-response for changing unit state.
   *
   * @param unit The {@code Unit} to change the state of.
   * @param state The new {@code UnitState}.
   * @return boolean <b>true</b> if the server interaction succeeded.
   */
  changeState(unit: Unit, state: Unit$UnitState): boolean {
    return this.ask(new ChangeStateMessage()._ChangeStateMessage$Unit$UnitState(unit, state));
  }
  /**
   * Server query-response for changing work improvement type.
   *
   * @param unit The {@code Unit} to change the work type of.
   * @param type The new {@code TileImprovementType} to work on.
   * @return True if the server interaction succeeded.
   */
  changeWorkImprovementType(unit: Unit, type$: TileImprovementType): boolean {
    return this.ask(new ChangeWorkImprovementTypeMessage()._ChangeWorkImprovementTypeMessage$Unit$TileImprovementType(unit, type$));
  }
  /**
   * Server query-response for changing work type.
   *
   * @param unit The {@code Unit} to change the work type of.
   * @param workType The new {@code GoodsType} to produce.
   * @return True if the server interaction succeeded.
   */
  changeWorkType(unit: Unit, workType: GoodsType): boolean {
    return this.ask(new ChangeWorkTypeMessage()._ChangeWorkTypeMessage$Unit$GoodsType(unit, workType));
  }
  /**
   * Send a chat message (pre and in-game).
   *
   * @param player The {@code Player} to chat to.
   * @param chat The text of the message.
   * @return True if the send succeeded.
   */
  chat(player: Player, chat: string): boolean {
    return this.send(new ChatMessage()._ChatMessage$Player$String$boolean(player, chat, false));
  }
  /**
   * Send a chooseFoundingFather message.
   *
   * @param ffs A list of {@code FoundingFather}s to choose from.
   * @param ff The chosen {@code FoundingFather} (may be null).
   * @return True if the send succeeded.
   */
  chooseFoundingFather(ffs: List<FoundingFather>, ff: FoundingFather): boolean {
    return this.ask(new ChooseFoundingFatherMessage()._ChooseFoundingFatherMessage$List$FoundingFather(ffs, ff));
  }
  /**
   * Server query-response to claim a tile.
   *
   * @param tile The {@code Tile} to claim.
   * @param claimant The {@code Unit} or {@code Settlement} that is
   *     claiming the tile.
   * @param price The amount to pay.
   * @return True if the server interaction succeeded.
   */
  claimTile(tile: Tile, claimant: FreeColGameObject, price: number): boolean {
    return this.ask(new ClaimLandMessage()._ClaimLandMessage$Tile$FreeColGameObject$int(tile, claimant, price));
  }
  /**
   * Server query-response for clearing a unit speciality.
   *
   * @param unit The {@code Unit} to operate on.
   * @return True if the server interaction succeeded.
   */
  clearSpeciality(unit: Unit): boolean {
    return this.ask(new ClearSpecialityMessage()._ClearSpecialityMessage$Unit(unit));
  }
  /**
   * Server query-response to continue with a won game.
   *
   * @return True if the server interaction succeeded.
   */
  continuePlaying(): boolean {
    return this.send(TrivialMessage.continueMessage);
  }
  /**
   * Server query-response for declaring independence.
   *
   * @param nation The name for the new nation.
   * @param country The name for the new country.
   * @return True if the server interaction succeeded.
   */
  declareIndependence(nation: string, country: string): boolean {
    return this.ask(new DeclareIndependenceMessage()._DeclareIndependenceMessage$String$String(nation, country));
  }
  /**
   * Server query-response for the special case of deciding to
   * explore a rumour but then declining not to investigate the
   * strange mounds.
   *
   * @param unit The {@code Unit} that is exploring.
   * @param direction The {@code Direction} to move.
   * @return True if the server interaction succeeded.
   */
  declineMounds(unit: Unit, direction: Direction): boolean {
    return this.ask(new DeclineMoundsMessage()._DeclineMoundsMessage$Unit$Direction(unit, direction));
  }
  /**
   * Server query-response for deleting a trade route.
   *
   * @param tradeRoute The {@code TradeRoute} to delete.
   * @return True if the server interaction succeeded.
   */
  deleteTradeRoute(tradeRoute: TradeRoute): boolean {
    return this.ask(new DeleteTradeRouteMessage()._DeleteTradeRouteMessage$TradeRoute(tradeRoute));
  }
  /**
   * Server query-response to give the given goods to the natives.
   *
   * @param unit The {@code Unit} that is trading.
   * @param is The {@code IndianSettlement} that is trading.
   * @param goods The {@code Goods} to give.
   * @return True if the server interaction succeeded.
   */
  deliverGiftToSettlement(unit: Unit, is$: IndianSettlement, goods: Goods): boolean {
    return this.ask(new DeliverGiftMessage()._DeliverGiftMessage$Unit$IndianSettlement$Goods(unit, is$, goods));
  }
  /**
   * Server query-response for demanding a tribute from a native
   * settlement.
   *
   * @param unit The {@code Unit} that demands.
   * @param direction The direction to demand in.
   * @return True if the server interaction succeeded.
   */
  demandTribute(unit: Unit, direction: Direction): boolean {
    return this.ask(new DemandTributeMessage()._DemandTributeMessage$Unit$Direction(unit, direction));
  }
  /**
   * Handler server query-response for diplomatic messages.
   *
   * @param our Our object ({@code Unit} or {@code Colony})
   *     conducting the diplomacy.
   * @param other The other object ({@code Unit} or {@code Colony})
   *     to negotiate with.
   * @param dt The {@code DiplomaticTrade} agreement to propose.
   * @return The resulting agreement or null if none present.
   */
  diplomacy(our: FreeColGameObject, other: FreeColGameObject, dt: DiplomaticTrade): boolean {
    return this.ask(new DiplomacyMessage()._DiplomacyMessage$FreeColGameObject$FreeColGameObject$DiplomaticTrade(our, other, dt));
  }
  /**
   * Server query-response for disbanding a unit.
   *
   * @param unit The {@code Unit} to operate on.
   * @return True if the server interaction succeeded.
   */
  disbandUnit(unit: Unit): boolean {
    return this.ask(new DisbandUnitMessage()._DisbandUnitMessage$Unit(unit));
  }
  /**
   * Server query-response for disembarking from a carrier.
   *
   * @param unit The {@code Unit} that is disembarking.
   * @return True if the server interaction succeeded.
   */
  disembark(unit: Unit): boolean {
    return this.ask(new DisembarkMessage()._DisembarkMessage$Unit(unit));
  }
  /**
   * Server query-response for boarding a carrier.
   *
   * @param unit The {@code Unit} that is boarding.
   * @param carrier The carrier {@code Unit}.
   * @param direction An optional direction if the unit is boarding from
   *        an adjacent tile, or null if from the same tile.
   * @return True if the server interaction succeeded.
   */
  embark(unit: Unit, carrier: Unit, direction: Direction): boolean {
    return this.ask(new EmbarkMessage()._EmbarkMessage$Unit$Unit$Direction(unit, carrier, direction));
  }
  /**
   * Server query-response for emigration.
   *
   * @param slot The slot from which the unit migrates, 1-3 selects
   *             a specific one, otherwise the server will choose one.
   * @return True if the client-server interaction succeeded.
   */
  emigrate(slot: number): boolean {
    return this.ask(new EmigrateUnitMessage()._EmigrateUnitMessage$int(slot));
  }
  /**
   * Server query-response for asking for the turn to end.
   *
   * @return True if the server interaction succeeded.
   */
  endTurn(): boolean {
    return this.ask(TrivialMessage.endTurnMessage);
  }
  /**
   * Server query-response for asking to enter revenge mode (post-game).
   *
   * @return True if the server interaction succeeded.
   */
  enterRevengeMode(): boolean {
    return this.ask(TrivialMessage.enterRevengeModeMessage);
  }
  /**
   * Server query-response for equipping a unit for a role.
   *
   * @param unit The {@code Unit} to equip.
   * @param role The {@code Role} to assume.
   * @param roleCount The role count.
   * @return True if the server interaction succeeded.
   */
  equipUnitForRole(unit: Unit, role: Role, roleCount: number): boolean {
    return this.ask(new EquipForRoleMessage()._EquipForRoleMessage$Unit$Role$int(unit, role, roleCount));
  }
  /**
   * Server query-response for responding to a first contact message.
   *
   * @param player The {@code Player} making contact.
   * @param other The native {@code Player} being contacted.
   * @param tile An optional {@code Tile} to offer the player if
   *     they have made a first landing.
   * @param result Whether the initial peace treaty was accepted.
   * @return True if the server interaction succeeded.
   */
  firstContact(player: Player, other: Player, tile: Tile, result: boolean): boolean {
    return this.ask(new FirstContactMessage()._FirstContactMessage$Player$Player$Tile(player, other, tile).setResult(result));
  }
  /**
   * Server query-response for asking for the high scores list.
   *
   * @param key The high score key to query.
   * @return True if the server interaction succeeded.
   */
  getHighScores(key: string): boolean {
    return this.ask(new HighScoresMessage()._HighScoresMessage$String$List(key, null));
  }
  /**
   * Server query-response for asking for the nation summary of a player.
   *
   * @param self The {@code Player} requesting the summary.
   * @param player The {@code Player} to summarize.
   * @return True if the server interaction succeeded.
   */
  nationSummary(self: Player, player: Player): boolean {
    return this.ask(new NationSummaryMessage()._NationSummaryMessage$Player$NationSummary(player, null));
  }
  /**
   * Server query-response for inciting the natives.
   *
   * @param unit The missionary {@code Unit}.
   * @param is The {@code IndianSettlement} to incite.
   * @param enemy An enemy {@code Player}.
   * @param gold The amount of bribe, negative to enquire.
   * @return True if the server interaction succeeded.
   */
  incite(unit: Unit, is$: IndianSettlement, enemy: Player, gold: number): boolean {
    return this.ask(new InciteMessage()._InciteMessage$Unit$IndianSettlement$Player$int(unit, is$, enemy, gold));
  }
  /**
   * Makes demands to a colony.  One and only one of goods or gold is valid.
   *
   * @param unit The {@code Unit} that is demanding.
   * @param colony The {@code Colony} to demand of.
   * @param type The {@code GoodsType} to demand.
   * @param amount The amount of goods to demand.
   * @param result The result of the demand.
   * @return True if the server interaction succeeded.
   */
  indianDemand(unit: Unit, colony: Colony, type$: GoodsType, amount: number, result: Constants$IndianDemandAction): boolean {
    return this.ask(new IndianDemandMessage()._IndianDemandMessage$Unit$Colony$GoodsType$int(unit, colony, type$, amount).setResult(result));
  }
  /**
   * Server query-response for joining a colony.
   *
   * @param unit The {@code Unit} that will join.
   * @param colony The {@code Colony} to join.
   * @return True if the server interaction succeeded.
   */
  joinColony(unit: Unit, colony: Colony): boolean {
    return this.ask(new JoinColonyMessage()._JoinColonyMessage$Colony$Unit(colony, unit));
  }
  /**
   * Server query-response for learning the skill taught at a settlement.
   *
   * @param unit The {@code Unit} that is asking.
   * @param direction The direction to a settlement to ask.
   * @return True if the server interaction succeeded.
   */
  learnSkill(unit: Unit, direction: Direction): boolean {
    return this.ask(new LearnSkillMessage()._LearnSkillMessage$Unit$Direction(unit, direction));
  }
  /**
   * Server query-response for loading goods.
   *
   * @param loc The {@code Location} where the goods are.
   * @param type The {@code GoodsType} to load.
   * @param amount The amount of goods to load.
   * @param carrier The {@code Unit} to load onto.
   * @return True if the server interaction succeeded.
   */
  loadGoods(loc: Location, type$: GoodsType, amount: number, carrier: Unit): boolean {
    return this.ask(new LoadGoodsMessage()._LoadGoodsMessage$Location$GoodsType$int$Unit(loc, type$, amount, carrier));
  }
  /**
   * Server query-response for logging in a player (pre-game).
   *
   * @param userName The user name.
   * @param nationId The nationId when the client is selecting a player.
   * @param version The client version.
   * @param single True if this is a single player login.
   * @param current True if the requesting player should become the
   *     current player.
   * @return True if the server interaction succeeded.
   */
  login(userName: string, nationId: string, version: string, single: boolean, current: boolean): boolean {
    return this.ask(new LoginMessage()._LoginMessage$Player$String$String$String$ServerState$boolean$boolean$Game(null, userName, nationId, version, null, single, current, null));
  }
  /**
   * Server query-response for logging out.
   *
   * @param player The {@code Player} that has logged out.
   * @param reason The reason for logging out.
   * @return True if the server interaction succeeded.
   */
  logout(player: Player, reason: Game$LogoutReason): boolean {
    return this.ask(new LogoutMessage()._LogoutMessage$Player$LogoutReason(player, reason));
  }
  /**
   * Server query-response for looting.  Handles both an initial query and
   * the actual looting.
   *
   * @param winner The {@code Unit} that is looting.
   * @param defenderId The identifier of the defender unit (it may have sunk).
   * @param goods A list of {@code Goods}, if empty this is a query
   *     as to what is to be looted which is filled into the list,
   *     if non-empty, then the list of goods to loot.
   * @return True if the server interaction succeeded.
   */
  loot(winner: Unit, defenderId: string, goods: List<Goods>): boolean {
    return this.ask(new LootCargoMessage()._LootCargoMessage$Unit$String$List(winner, defenderId, goods));
  }
  /**
   * Server query-response for establishing/denouncing a mission.
   *
   * @param unit The missionary {@code Unit}.
   * @param direction The direction to a settlement to establish with.
   * @param denounce True if this is a denouncement.
   * @return True if the server interaction succeeded.
   */
  missionary(unit: Unit, direction: Direction, denounce: boolean): boolean {
    return this.ask(new MissionaryMessage()._MissionaryMessage$Unit$Direction$boolean(unit, direction, denounce));
  }
  /**
   * Server query-response for moving a unit.
   *
   * @param unit The {@code Unit} to move.
   * @param direction The direction to move in.
   * @return True if the server interaction succeeded.
   */
  move(unit: Unit, direction: Direction): boolean {
    return this.ask(new MoveMessage()._MoveMessage$Unit$Direction(unit, direction));
  }
  /**
   * Server query-response for moving to across the high seas.
   *
   * @param unit The {@code Unit} to move.
   * @param destination The {@code Location} to move to.
   * @return True if the server interaction succeeded.
   */
  moveTo(unit: Unit, destination: Location): boolean {
    return this.ask(new MoveToMessage()._MoveToMessage$Unit$Location(unit, destination));
  }
  /**
   * A native Unit delivers the gift it is carrying to a colony.
   *
   * @param unit The {@code Unit} delivering the gift.
   * @param colony The {@code Colony} to give to.
   * @return True if the server interaction succeeded.
   */
  nativeGift(unit: Unit, colony: Colony): boolean {
    return this.ask(new NativeGiftMessage()._NativeGiftMessage$Unit$Colony(unit, colony));
  }
  /**
   * Server query-response for naming a new land.
   *
   * @param unit The {@code Unit} that has come ashore.
   * @param name The new land name.
   * @return True if the server interaction succeeded.
   */
  newLandName(unit: Unit, name: string): boolean {
    return this.ask(new NewLandNameMessage()._NewLandNameMessage$Unit$String(unit, name));
  }
  /**
   * Server query-response for simple native trades.
   *
   * @param nt The {@code NativeTrade} underway.
   * @param action The {@code NativeTradeAction} to perform.
   * @return True if the server interaction succeeded.
   */
  nativeTrade(action: NativeTrade$NativeTradeAction, nt: NativeTrade): boolean {
    return this.ask(new NativeTradeMessage()._NativeTradeMessage$NativeTradeAction$NativeTrade(action, nt));
  }
  /**
   * Server query-response to get the session for a trade.
   *
   * @param unit The {@code Unit} that is trading.
   * @param is The {@code IndianSettlement} that is trading.
   * @return True if the server interaction succeeded.
   */
  newNativeTradeSession(unit: Unit, is$: IndianSettlement): boolean {
    return this.ask(new NativeTradeMessage()._NativeTradeMessage$Unit$IndianSettlement(unit, is$));
  }
  /**
   * Server query-response for naming a new region.
   *
   * @param region The {@code Region} that is being discovered.
   * @param tile The {@code Tile} where the region is discovered.
   * @param unit The {@code Unit} discovering the region.
   * @param name The new region name.
   * @return True if the server interaction succeeded.
   */
  newRegionName(region: Region, tile: Tile, unit: Unit, name: string): boolean {
    return this.ask(new NewRegionNameMessage()._NewRegionNameMessage$Region$Tile$Unit$String(region, tile, unit, name));
  }
  /**
   * Server query-response for creating a new trade route.
   *
   * @return True if the server interaction succeeded.
   */
  newTradeRoute(): boolean {
    return this.ask(new NewTradeRouteMessage()._NewTradeRouteMessage$TradeRoute(null));
  }
  /**
   * Server query-response for tax paying arrears.
   *
   * @param type The {@code GoodsType} to pay the arrears for.
   * @return True if the server interaction succeeded.
   */
  payArrears(type$: GoodsType): boolean {
    return this.ask(new PayArrearsMessage()._PayArrearsMessage$GoodsType(type$));
  }
  /**
   * Server query-response for paying for a building.
   *
   * @param colony The {@code Colony} that is building.
   * @return True if the server interaction succeeded.
   */
  payForBuilding(colony: Colony): boolean {
    return this.ask(new PayForBuildingMessage()._PayForBuildingMessage$Colony(colony));
  }
  /**
   * Server query-response for putting a unit outside a colony.
   *
   * @param unit The {@code Unit} to put out.
   * @return True if the server interaction succeeded.
   */
  putOutsideColony(unit: Unit): boolean {
    return this.ask(new PutOutsideColonyMessage()._PutOutsideColonyMessage$Unit(unit));
  }
  /**
   * Rearrange a colony.
   *
   * @param colony The {@code Colony} to rearrange.
   * @param workers A list of worker {@code Unit}s that may change.
   * @param scratch A copy of the underlying {@code Colony} with the
   *     workers arranged as required.
   * @return True if the server interaction succeeds.
   */
  rearrangeColony(colony: Colony, workers: List<Unit>, scratch: Colony): boolean {
    let message = new RearrangeColonyMessage()._RearrangeColonyMessage$Colony$List$Colony(colony, workers, scratch);
    return (message.isEmpty()) ? true : this.ask(message);
  }
  /**
   * Server query-response for renaming an object.
   *
   * @param object A {@code FreeColGameObject} to rename.
   * @param name The name to apply.
   * @return True if the server interaction succeeded.
   */
  rename(object$: FreeColGameObject, name: string): boolean {
    return this.ask(new RenameMessage()._RenameMessage$FreeColGameObject$String(object$, name));
  }
  /**
   * Server query-response to launch the game (pre-game).
   *
   * @return True if the server interaction succeeded.
   */
  requestLaunch(): boolean {
    return this.send(TrivialMessage.requestLaunchMessage);
  }
  /**
   * Server query-response to retire the player from the game.
   *
   * @return True if the server interaction succeeded.
   */
  retire(): boolean {
    return this.ask(TrivialMessage.retireMessage);
  }
  /**
   * Server query-response for the dialog on scouting a native
   * settlement, *before* choosing to speak to the chief, attack, et
   * al.
   *
   * @param unit The {@code Unit} that is speaking.
   * @param direction The direction to a settlement to ask.
   * @return True if the server interaction succeeded.
   */
  scoutSettlement(unit: Unit, direction: Direction): boolean {
    return this.ask(new ScoutIndianSettlementMessage()._ScoutIndianSettlementMessage$Unit$Direction(unit, direction));
  }
  /**
   * Server query-response for speaking with a native chief.
   *
   * @param unit The {@code Unit} that is speaking.
   * @param is The {@code IndianSettlement} to ask.
   * @return True if the server interaction succeeded.
   */
  scoutSpeakToChief(unit: Unit, is$: IndianSettlement): boolean {
    return this.ask(new ScoutSpeakToChiefMessage()._ScoutSpeakToChiefMessage$Unit$IndianSettlement$String(unit, is$, null));
  }
  /**
   * Server query-response to set a nation's availablility (pre-game).
   *
   * @param nation The {@code Nation} to whose availability is to be set.
   * @param state The {@code NationState} defining the availability.
   * @return True if the server interaction succeeded.
   */
  setAvailable(nation: Nation, state: NationOptions$NationState): boolean {
    return this.ask(new SetAvailableMessage()._SetAvailableMessage$Nation$NationState(nation, state));
  }
  /**
   * Server query-response for changing a build queue.
   *
   * @param colony the Colony
   * @param buildQueue the new values for the build queue
   * @return True if the server interaction succeeded.
   */
  setBuildQueue(colony: Colony, buildQueue: List<BuildableType>): boolean {
    return this.ask(new SetBuildQueueMessage()._SetBuildQueueMessage$Colony$List(colony, buildQueue));
  }
  /**
   * Server query-response to set a nation colour
   * (pre-game).
   *
   * @param nation The {@code Nation} to set the color for.
   * @param color The {@code Color} selected.
   * @return True if the server interaction succeeded.
   */
  setColor(nation: Nation, color: Color): boolean {
    return this.ask(new SetColorMessage()._SetColorMessage$Nation$Color(nation, color));
  }
  /**
   * Server query-response to set the current stop.
   *
   * @param unit The {@code Unit} whose stop is to be updated.
   * @param index The stop index.
   * @return True if the query-response succeeds.
   */
  setCurrentStop(unit: Unit, index: number): boolean {
    return this.ask(new SetCurrentStopMessage()._SetCurrentStopMessage$Unit$int(unit, index));
  }
  /**
   * Server query-response to set the destination of the given unit.
   *
   * @param unit The {@code Unit} to direct.
   * @param destination The destination {@code Location}.
   * @return True if the server interaction succeeded.
   * @see Unit#setDestination(Location)
   */
  setDestination(unit: Unit, destination: Location): boolean {
    return this.ask(new SetDestinationMessage()._SetDestinationMessage$Unit$Location(unit, destination));
  }
  /**
   * Server query-response for setting goods levels.
   *
   * @param colony The {@code Colony} where the levels are set.
   * @param data The {@code ExportData} setting.
   * @return True if the server interaction succeeded.
   */
  setGoodsLevels(colony: Colony, data: ExportData): boolean {
    return this.ask(new SetGoodsLevelsMessage()._SetGoodsLevelsMessage$Colony$ExportData(colony, data));
  }
  /**
   * Server query-response to show which nation a player has selected
   * (pre-game).
   *
   * @param nation The {@code Nation} selected.
   * @return True if the server interaction succeeded.
   */
  setNation(nation: Nation): boolean {
    return this.ask(new SetNationMessage()._SetNationMessage$Player$Nation(null, nation));
  }
  /**
   * Server query-response to show which nation type a player has selected
   * (pre-game).
   *
   * @param nationType The {@code NationType} selected.
   * @return True if the server interaction succeeded.
   */
  setNationType(nationType: NationType): boolean {
    return this.ask(new SetNationTypeMessage()._SetNationTypeMessage$Player$NationType(null, nationType));
  }
  /**
   * Server query-response for indicating that this player is ready
   * (pre-game).
   *
   * @param ready The readiness state to signal.
   * @return True if the server interaction succeeded.
   */
  setReady(ready: boolean): boolean {
    return this.send(new ReadyMessage()._ReadyMessage$Player$boolean(null, ready));
  }
  /**
   * Server query-response for spying on a colony.
   *
   * @param unit The {@code Unit} that is spying.
   * @param settlement The {@code Settlement} to spy on.
   * @return True if the client/server interaction succeeded.
   */
  spy(unit: Unit, settlement: Settlement): boolean {
    return this.ask(new SpySettlementMessage()._SpySettlementMessage$Unit$Settlement(unit, settlement));
  }
  /**
   * Server query-response for starting to skip turns.
   *
   * @return True if the server interaction succeeded.
   */
  startSkipping(): boolean {
    return this.send(TrivialMessage.endTurnMessage);
  }
  /**
   * Server query-response for training a unit in Europe.
   *
   * @param type The {@code UnitType} to train.
   * @return True if the server interaction succeeded.
   */
  trainUnitInEurope(type$: UnitType): boolean {
    return this.ask(new TrainUnitInEuropeMessage()._TrainUnitInEuropeMessage$UnitType(type$));
  }
  /**
   * Server query-response for unloading goods.
   *
   * @param type The {@code GoodsType} to unload.
   * @param amount The amount of goods to unload.
   * @param carrier The {@code Unit} to unload from.
   * @return True if the query-response succeeds.
   */
  unloadGoods(type$: GoodsType, amount: number, carrier: Unit): boolean {
    return this.ask(new UnloadGoodsMessage()._UnloadGoodsMessage$GoodsType$int$Unit(type$, amount, carrier));
  }
  /**
   * Server query-response to update the game options
   * (pre-game).
   *
   * @param gameOptions The {@code OptionGroup} containing the
   *     game options.
   * @return True if the server interaction succeeded.
   */
  updateGameOptions(gameOptions: OptionGroup): boolean {
    return this.send(new UpdateGameOptionsMessage()._UpdateGameOptionsMessage$OptionGroup(gameOptions));
  }
  /**
   * Server query-response to update the map generator options
   * (pre-game).
   *
   * @param mapOptions The {@code OptionGroup} containing the
   *     map generator options.
   * @return True if the server interaction succeeded.
   */
  updateMapGeneratorOptions(mapOptions: OptionGroup): boolean {
    return this.send(new UpdateMapGeneratorOptionsMessage()._UpdateMapGeneratorOptionsMessage$OptionGroup(mapOptions));
  }
  /**
   * Server query-response for asking for updating the trade route.
   *
   * @param route The trade route to update.
   * @return True if the server interaction succeeded.
   */
  updateTradeRoute(route: TradeRoute): boolean {
    return this.ask(new UpdateTradeRouteMessage()._UpdateTradeRouteMessage$TradeRoute(route));
  }
  /**
   * Server query-response for changing a work location.
   *
   * @param unit The {@code Unit} to change the workLocation of.
   * @param workLocation The {@code WorkLocation} to change to.
   * @return True if the server interaction succeeded.
   */
  work(unit: Unit, workLocation: WorkLocation): boolean {
    return this.ask(new WorkMessage()._WorkMessage$Unit$WorkLocation(unit, workLocation));
  }
  static $clinit() {
    ServerAPI.logger = Logger.getLogger($J.cls(ServerAPI).getName());
  }
}

$J.define(ServerAPI, 'net.sf.freecol.common.networking.ServerAPI', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_ServerAPI' }, returns: { 'isConnected': 'boolean', 'getConnection': 'net.sf.freecol.common.networking.Connection' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  AbandonColonyMessage = $J.load('net.sf.freecol.common.networking.AbandonColonyMessage');
  AskSkillMessage = $J.load('net.sf.freecol.common.networking.AskSkillMessage');
  AssignTeacherMessage = $J.load('net.sf.freecol.common.networking.AssignTeacherMessage');
  AssignTradeRouteMessage = $J.load('net.sf.freecol.common.networking.AssignTradeRouteMessage');
  AttackMessage = $J.load('net.sf.freecol.common.networking.AttackMessage');
  AttackRangedMessage = $J.load('net.sf.freecol.common.networking.AttackRangedMessage');
  BuildColonyMessage = $J.load('net.sf.freecol.common.networking.BuildColonyMessage');
  CashInTreasureTrainMessage = $J.load('net.sf.freecol.common.networking.CashInTreasureTrainMessage');
  ChangeStateMessage = $J.load('net.sf.freecol.common.networking.ChangeStateMessage');
  ChangeWorkImprovementTypeMessage = $J.load('net.sf.freecol.common.networking.ChangeWorkImprovementTypeMessage');
  ChangeWorkTypeMessage = $J.load('net.sf.freecol.common.networking.ChangeWorkTypeMessage');
  ChatMessage = $J.load('net.sf.freecol.common.networking.ChatMessage');
  ChooseFoundingFatherMessage = $J.load('net.sf.freecol.common.networking.ChooseFoundingFatherMessage');
  ClaimLandMessage = $J.load('net.sf.freecol.common.networking.ClaimLandMessage');
  ClearSpecialityMessage = $J.load('net.sf.freecol.common.networking.ClearSpecialityMessage');
  DeclareIndependenceMessage = $J.load('net.sf.freecol.common.networking.DeclareIndependenceMessage');
  DeclineMoundsMessage = $J.load('net.sf.freecol.common.networking.DeclineMoundsMessage');
  DeleteTradeRouteMessage = $J.load('net.sf.freecol.common.networking.DeleteTradeRouteMessage');
  DeliverGiftMessage = $J.load('net.sf.freecol.common.networking.DeliverGiftMessage');
  DemandTributeMessage = $J.load('net.sf.freecol.common.networking.DemandTributeMessage');
  DiplomacyMessage = $J.load('net.sf.freecol.common.networking.DiplomacyMessage');
  DisbandUnitMessage = $J.load('net.sf.freecol.common.networking.DisbandUnitMessage');
  DisembarkMessage = $J.load('net.sf.freecol.common.networking.DisembarkMessage');
  EmbarkMessage = $J.load('net.sf.freecol.common.networking.EmbarkMessage');
  EmigrateUnitMessage = $J.load('net.sf.freecol.common.networking.EmigrateUnitMessage');
  EquipForRoleMessage = $J.load('net.sf.freecol.common.networking.EquipForRoleMessage');
  FirstContactMessage = $J.load('net.sf.freecol.common.networking.FirstContactMessage');
  HighScoresMessage = $J.load('net.sf.freecol.common.networking.HighScoresMessage');
  InciteMessage = $J.load('net.sf.freecol.common.networking.InciteMessage');
  IndianDemandMessage = $J.load('net.sf.freecol.common.networking.IndianDemandMessage');
  JoinColonyMessage = $J.load('net.sf.freecol.common.networking.JoinColonyMessage');
  LearnSkillMessage = $J.load('net.sf.freecol.common.networking.LearnSkillMessage');
  LoadGoodsMessage = $J.load('net.sf.freecol.common.networking.LoadGoodsMessage');
  LoginMessage = $J.load('net.sf.freecol.common.networking.LoginMessage');
  LogoutMessage = $J.load('net.sf.freecol.common.networking.LogoutMessage');
  LootCargoMessage = $J.load('net.sf.freecol.common.networking.LootCargoMessage');
  MissionaryMessage = $J.load('net.sf.freecol.common.networking.MissionaryMessage');
  MonarchActionMessage = $J.load('net.sf.freecol.common.networking.MonarchActionMessage');
  MoveMessage = $J.load('net.sf.freecol.common.networking.MoveMessage');
  MoveToMessage = $J.load('net.sf.freecol.common.networking.MoveToMessage');
  NationSummaryMessage = $J.load('net.sf.freecol.common.networking.NationSummaryMessage');
  NativeGiftMessage = $J.load('net.sf.freecol.common.networking.NativeGiftMessage');
  NativeTradeMessage = $J.load('net.sf.freecol.common.networking.NativeTradeMessage');
  NewLandNameMessage = $J.load('net.sf.freecol.common.networking.NewLandNameMessage');
  NewRegionNameMessage = $J.load('net.sf.freecol.common.networking.NewRegionNameMessage');
  NewTradeRouteMessage = $J.load('net.sf.freecol.common.networking.NewTradeRouteMessage');
  PayArrearsMessage = $J.load('net.sf.freecol.common.networking.PayArrearsMessage');
  PayForBuildingMessage = $J.load('net.sf.freecol.common.networking.PayForBuildingMessage');
  PutOutsideColonyMessage = $J.load('net.sf.freecol.common.networking.PutOutsideColonyMessage');
  ReadyMessage = $J.load('net.sf.freecol.common.networking.ReadyMessage');
  RearrangeColonyMessage = $J.load('net.sf.freecol.common.networking.RearrangeColonyMessage');
  RenameMessage = $J.load('net.sf.freecol.common.networking.RenameMessage');
  ScoutIndianSettlementMessage = $J.load('net.sf.freecol.common.networking.ScoutIndianSettlementMessage');
  ScoutSpeakToChiefMessage = $J.load('net.sf.freecol.common.networking.ScoutSpeakToChiefMessage');
  SetAvailableMessage = $J.load('net.sf.freecol.common.networking.SetAvailableMessage');
  SetBuildQueueMessage = $J.load('net.sf.freecol.common.networking.SetBuildQueueMessage');
  SetColorMessage = $J.load('net.sf.freecol.common.networking.SetColorMessage');
  SetCurrentStopMessage = $J.load('net.sf.freecol.common.networking.SetCurrentStopMessage');
  SetDestinationMessage = $J.load('net.sf.freecol.common.networking.SetDestinationMessage');
  SetGoodsLevelsMessage = $J.load('net.sf.freecol.common.networking.SetGoodsLevelsMessage');
  SetNationMessage = $J.load('net.sf.freecol.common.networking.SetNationMessage');
  SetNationTypeMessage = $J.load('net.sf.freecol.common.networking.SetNationTypeMessage');
  SpySettlementMessage = $J.load('net.sf.freecol.common.networking.SpySettlementMessage');
  TrainUnitInEuropeMessage = $J.load('net.sf.freecol.common.networking.TrainUnitInEuropeMessage');
  TrivialMessage = $J.load('net.sf.freecol.common.networking.TrivialMessage');
  UnloadGoodsMessage = $J.load('net.sf.freecol.common.networking.UnloadGoodsMessage');
  UpdateGameOptionsMessage = $J.load('net.sf.freecol.common.networking.UpdateGameOptionsMessage');
  UpdateMapGeneratorOptionsMessage = $J.load('net.sf.freecol.common.networking.UpdateMapGeneratorOptionsMessage');
  UpdateTradeRouteMessage = $J.load('net.sf.freecol.common.networking.UpdateTradeRouteMessage');
  WorkMessage = $J.load('net.sf.freecol.common.networking.WorkMessage');
});
