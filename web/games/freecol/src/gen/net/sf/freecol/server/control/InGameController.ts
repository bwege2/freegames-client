// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/control/InGameController.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, Collectors, Comparator, HashMap, HashSet, IllegalStateException, JFunction, JString, Level, Logger, RuntimeException } from '../../../../../../jre/index.ts';
import { Controller } from './Controller.ts';

let FreeCol, FreeColDebugger, FreeColDebugger$DebugMode, Messages, Ability, AbstractUnit, Colony, Constants$IndianDemandAction, DiplomaticTrade$TradeStatus, Europe, Europe$MigrationType, GoodsLocation, HighScore, HistoryEvent, HistoryEvent$HistoryEventType, IndianSettlement, Map_, Market$Access, ModelMessage, ModelMessage$MessageType, Monarch$MonarchAction, Nation, NationSummary, NativeTrade$NativeTradeAction, Player, Player$PlayerType, Settlement, Stance, StringTemplate, Tension, Tension$Level, TileImprovement, TradeRoute, Unit, Unit$UnitLabelType, Unit$UnitState, UnitChangeType, UnitLocation$NoAddReason, ChangeSet, ChangeSet$See, ChatMessage, GameEndedMessage, GameStateMessage, HighScoresMessage, InciteMessage, IndianDemandMessage, LootCargoMessage, MonarchActionMessage, NationSummaryMessage, NativeTradeMessage, NewTradeRouteMessage, ScoutSpeakToChiefMessage, SetCurrentPlayerMessage, GameOptions, CollectionUtils, LogBuilder, RandomChoice, RandomUtils, StringUtils, Utils, DiplomacySession, LootSession, MonarchSession, NativeDemandSession, NativeTradeSession, ServerColony, ServerIndianSettlement, ServerPlayer$DeadCheck, ServerUnit, Session;

/**
 * The main server controller.
 */
export class InGameController extends Controller {
  static logger: Logger = null;
  static coronadoPred: Predicate<Player> = null;
  /**
   * The server random number source.
   */
  random: Random = null;
  /**
   * Debug helpers, do not serialize.
   */
  debugOnlyAITurns: number = 0;
  debugMonarchAction: Monarch$MonarchAction = null;
  debugMonarchPlayer: ServerPlayer = null;
  /**
   * The constructor to use.
   *
   * @param freeColServer The main server object.
   */
  _InGameController(freeColServer: FreeColServer): this {
    this._Controller(freeColServer);
    this.debugOnlyAITurns = 0;
    this.debugMonarchAction = null;
    this.debugMonarchPlayer = null;
    this.random = null;
    return this;
  }
  /**
   * Set the PRNG.
   *
   * @param random The new {@code Random} to use in this controller.
   */
  setRandom(random: Random): void {
    this.random = random;
  }
  /**
   * Get the timeout for this game.
   *
   * @return A timeout.
   */
  getTimeout(): number {
    let single = this.getFreeColServer().getSinglePlayer();
    return FreeCol.getTimeout(single);
  }
  /**
   * Gets the number of AI turns to skip through.
   *
   * @return The number of terms to skip.
   */
  getSkippedTurns(): number {
    return (FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.MENUS)) ? this.debugOnlyAITurns : -1;
  }
  /**
   * Sets the number of AI turns to skip through as a debug helper.
   *
   * @param turns The number of turns to skip through.
   */
  setSkippedTurns(turns: number): void {
    if (FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.MENUS)) {
      this.debugOnlyAITurns = turns;
    }
  }
  /**
   * Sets a monarch action to debug/test.
   *
   * @param serverPlayer The {@code ServerPlayer} whose monarch
   *     should act.
   * @param action The {@code MonarchAction} to be taken.
   */
  setMonarchAction(serverPlayer: ServerPlayer, action: Monarch$MonarchAction): void {
    if (FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.MENUS)) {
      this.debugMonarchPlayer = serverPlayer;
      this.debugMonarchAction = action;
    }
  }
  /**
   * Debug convenience to step the random number generator.
   *
   * @return The next random number in series, in the range 0-99.
   */
  stepRandom(): number {
    return RandomUtils.randomInt(InGameController.logger, 'step random', this.random, 100);
  }
  /**
   * Public version of csAddFoundingFather so it can be used in the
   * test code and DebugMenu.
   *
   * @param player The {@code Player} who gains a father.
   * @param father The {@code FoundingFather} to add.
   */
  addFoundingFather(player: Player, father: FoundingFather): void {
    let cs = new ChangeSet()._ChangeSet$();
    (player).csAddFoundingFather(father, this.random, cs);
    cs.addAttribute(ChangeSet$See.only(player), 'flush', $J.str(true));
    this.getGame().sendTo(player, cs);
  }
  /**
   * Public change stance and inform all routine.  Mostly used in the
   * test suite, but the AIs also call it.
   *
   * @param player The originating {@code Player}.
   * @param stance The new {@code Stance}.
   * @param other The {@code Player} wrt which the stance changes.
   * @param symmetric If true, change the otherPlayer stance as well.
   */
  changeStance(player: Player, stance: Stance, other: Player, symmetric: boolean): void {
    let cs = new ChangeSet()._ChangeSet$();
    if ((player).csChangeStance(stance, other, symmetric, cs)) {
      this.getGame().sendToAll(cs);
    }
  }
  /**
   * Change colony owner.  Public for DebugUtils.
   *
   * @param colony The {@code ServerColony} to change.
   * @param serverPlayer The {@code ServerPlayer} to change to.
   */
  debugChangeOwner$ServerColony$ServerPlayer(colony: ServerColony, serverPlayer: ServerPlayer): void {
    let cs = new ChangeSet()._ChangeSet$();
    let owner = colony.getOwner();
    colony.csChangeOwner(serverPlayer, false, null, cs);
    serverPlayer.invalidateCanSeeTiles();
    owner.invalidateCanSeeTiles();
    this.getGame().sendToAll(cs);
  }
  /**
   * Change unit owner.  Public for DebugUtils.
   *
   * @param unit The {@code ServerUnit} to change.
   * @param serverPlayer The {@code ServerPlayer} to change to.
   */
  debugChangeOwner$ServerUnit$ServerPlayer(unit: ServerUnit, serverPlayer: ServerPlayer): void {
    let owner = unit.getOwner();
    let cs = new ChangeSet()._ChangeSet$();
    (owner).csChangeOwner(unit, serverPlayer, null, null, cs);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps().always(owner), [unit.getTile$()]);
    serverPlayer.invalidateCanSeeTiles();
    owner.invalidateCanSeeTiles();
    this.getGame().sendToAll(cs);
  }
  /**
   * Apply a disaster to a colony.  Public for DebugUtils.
   *
   * @param colony The {@code Colony} to apply the disaster to.
   * @param disaster The {@code Disaster} to apply.
   * @return The number of messages generated.
   */
  debugApplyDisaster(colony: ServerColony, disaster: Disaster): number {
    let game = this.getGame();
    let owner = colony.getOwner();
    let cs = new ChangeSet()._ChangeSet$();
    let messages = (owner).csApplyDisaster(this.random, colony, disaster, cs);
    if (!messages.isEmpty()) {
      cs.addGlobalMessage(game, null, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.DISASTERS, 'model.disaster.strikes', owner).addName$String$String('%colony%', colony.getName()).addName$String$FreeColObject('%disaster%', disaster));
      for (const $it0 = messages.iterator(); $it0.hasNext(); ) {
        let message = $it0.next();
        cs.addGlobalMessage(game, null, message);
      }
      game.sendToAll(cs);
    }
    return messages.size();
  }
  /**
   * Create the Royal Expeditionary Force player corresponding to
   * a given player that is about to rebel.
   *
   * Public for the test suite.
   *
   * FIXME: this should eventually generate changes for the REF player.
   *
   * @param serverPlayer The {@code ServerPlayer} about to rebel.
   * @return The REF player.
   */
  createREFPlayer(serverPlayer: ServerPlayer): ServerPlayer {
    let refNation = serverPlayer.getNation().getREFNation();
    let monarch = serverPlayer.getMonarch();
    let refPlayer = this.getFreeColServer().makeAIPlayer(refNation);
    let europe = refPlayer.getEurope();
    let exploredPred = (t) => ((!t.isLand() || t.isCoastland() || t.getOwner() === serverPlayer) && t.isExploredBy(serverPlayer));
    let explore = new HashSet();
    this.getGame().getMap().forEachTile$Predicate$Consumer(exploredPred, (t) => explore.add(t));
    refPlayer.exploreTiles(explore);
    refPlayer.setEntryTile(null);
    Player.makeContact(serverPlayer, refPlayer);
    let exf = monarch.getExpeditionaryForce();
    if (exf.prepareToBoard(monarch.getNavalREFUnitType()) < 0) {
      InGameController.logger.warning('Unable to ensure space for the REF land units.');
    }
    let landUnits = refPlayer.createUnits(exf.getLandUnitsList(), europe, null);
    let navalUnits = refPlayer.createUnits(exf.getNavalUnitsList(), europe, this.random);
    let leftOver = refPlayer.loadShips(landUnits, navalUnits, this.random);
    if (!leftOver.isEmpty()) {
      InGameController.logger.warning('Failed to board REF units: ' + (StringUtils.join$String$Collection(' ', CollectionUtils.transform$Collection$Predicate$Function(leftOver, CollectionUtils.alwaysTrue(), ($p0) => $p0.getId()))));
    }
    return refPlayer;
  }
  /**
   * Buy goods from a native settlement.
   *
   * @param unit The {@code Unit} that is buying.
   * @param goods The {@code Goods} to buy.
   * @param price The price to pay.
   * @param sis The {@code ServerIndianSettlement} to give to.
   * @param cs A {@code ChangeSet} to update.
   */
  csBuy(unit: ServerUnit, goods: Goods, price: number, sis: ServerIndianSettlement, cs: ChangeSet): void {
    let spec = this.getGame().getSpecification();
    let alarmBonus = -$J.roundf(Math.fround(Math.fround(price * Math.fround(0.001)) * spec.getPercentage(GameOptions.ALARM_BONUS_BUY)));
    let owner = unit.getOwner();
    unit.csVisit(owner, sis, 0, cs);
    GoodsLocation.moveGoods(sis, goods.getType(), goods.getAmount(), unit);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [unit]);
    sis.getOwner().modifyGold(price);
    owner.modifyGold(-price);
    sis.csModifyAlarm(owner, alarmBonus, true, cs);
    sis.updateWantedGoods();
    let tile = sis.getTile$();
    tile.updateIndianSettlement(owner);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(owner), [tile]);
    cs.addPartial(ChangeSet$See.only(owner), owner, ['gold', String(owner.getGold())]);
    InGameController.logger.finest(owner.getSuffix$() + ' ' + $J.str(unit) + ' buys ' + $J.str(goods) + ' at ' + sis.getName() + ' for ' + price);
  }
  /**
   * Sell goods to a native settlement.
   *
   * @param unit The {@code Unit} that is selling.
   * @param goods The {@code Goods} to sell.
   * @param price The price to charge.
   * @param sis The {@code ServerIndianSettlement} to sell to.
   * @param cs A {@code ChangeSet} to update.
   */
  csSell(unit: ServerUnit, goods: Goods, price: number, sis: ServerIndianSettlement, cs: ChangeSet): void {
    let spec = this.getGame().getSpecification();
    let owner = unit.getOwner();
    let alarmBonus = -$J.roundf(Math.fround(Math.fround(price * Math.fround(0.001)) * spec.getPercentage(GameOptions.ALARM_BONUS_SELL)));
    unit.csVisit(owner, sis, 0, cs);
    GoodsLocation.moveGoods(unit, goods.getType(), goods.getAmount(), sis);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [unit]);
    sis.getOwner().modifyGold(-price);
    owner.modifyGold(price);
    sis.csModifyAlarm(owner, alarmBonus, true, cs);
    sis.updateWantedGoods();
    let tile = sis.getTile$();
    tile.updateIndianSettlement(owner);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(owner), [tile]);
    cs.addPartial(ChangeSet$See.only(owner), owner, ['gold', String(owner.getGold())]);
    cs.addSale(owner, sis, goods.getType(), $J.roundf(Math.fround(Math.fround(price) / goods.getAmount())));
    InGameController.logger.finest(owner.getSuffix$() + ' ' + $J.str(unit) + ' sells ' + $J.str(goods) + ' at ' + sis.getName() + ' for ' + price);
  }
  /**
   * Give goods to a native settlement.
   *
   * @param unit The {@code Unit} that is giving.
   * @param goods The {@code Goods} to give.
   * @param price A price that the natives might have been willing to pay.
   * @param sis The {@code ServerIndianSettlement} to give to.
   * @param cs A {@code ChangeSet} to update.
   */
  csGift(unit: ServerUnit, goods: Goods, price: number, sis: ServerIndianSettlement, cs: ChangeSet): void {
    let spec = this.getGame().getSpecification();
    let owner = unit.getOwner();
    let alarmBonus = -$J.roundf(Math.fround(Math.fround(price * Math.fround(0.001)) * spec.getPercentage(GameOptions.ALARM_BONUS_GIFT)));
    unit.csVisit(owner, sis, 0, cs);
    GoodsLocation.moveGoods(unit, goods.getType(), goods.getAmount(), sis);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [unit]);
    sis.csModifyAlarm(owner, alarmBonus, true, cs);
    sis.updateWantedGoods();
    let tile = sis.getTile$();
    tile.updateIndianSettlement(owner);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(owner), [tile]);
    InGameController.logger.finest(owner.getSuffix$() + ' ' + $J.str(unit) + ' gives ' + $J.str(goods) + ' at ' + sis.getName() + ' worth ' + price);
  }
  /**
   * Launch the REF.
   *
   * @param serverPlayer The REF {@code ServerPlayer}.
   * @param teleport If true, teleport the REF in.
   * @param cs A {@code ChangeSet} to update.
   */
  csLaunchREF(serverPlayer: ServerPlayer, teleport: boolean, cs: ChangeSet): void {
    let rebel = CollectionUtils.first$Collection(serverPlayer.getRebels());
    if (rebel != null) {
      serverPlayer.setEntryTile(rebel.getEntryTile());
    }
    if (teleport) {
      let naval = CollectionUtils.transform$Stream$Predicate(serverPlayer.getUnits(), ($p0) => $p0.isNaval());
      let seen = new HashSet(naval.size());
      for (const $it1 = naval.iterator(); $it1.hasNext(); ) {
        let u = $it1.next();
        let entry = u.getFullEntryLocation();
        u.setLocation(entry);
        u.setWorkLeft(-1);
        u.setState(Unit$UnitState.ACTIVE);
        if (seen.add(entry)) {
          cs.add$See$Collection(ChangeSet$See.only(serverPlayer), serverPlayer.exploreForUnit(u));
          cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps().except(serverPlayer), [entry]);
        }
      }
      serverPlayer.invalidateCanSeeTiles();
    } else {
      for (const $it2 = (CollectionUtils.transform$Stream$Predicate(serverPlayer.getUnits(), ($p0) => $p0.isNaval())).iterator(); $it2.hasNext(); ) {
        let u = $it2.next();
        u.setWorkLeft(1);
        u.setDestination(u.getFullEntryLocation());
        u.setLocation(u.getOwner().getHighSeas());
      }
    }
  }
  /**
   * Give independence.  Note that the REF player is granting, but
   * most of the changes happen to the newly independent player.
   * hence the special handling.
   *
   * @param serverPlayer The REF {@code ServerPlayer} that is granting.
   * @param independent The newly independent {@code Player}.
   * @param cs A {@code ChangeSet} to update.
   */
  csGiveIndependence(serverPlayer: ServerPlayer, independent: Player, cs: ChangeSet): void {
    serverPlayer.csChangeStance(Stance.PEACE, independent, true, cs);
    independent.changePlayerType(Player$PlayerType.INDEPENDENT);
    let game = this.getGame();
    let turn = game.getTurn();
    independent.setTax(0);
    independent.reinitialiseMarket();
    let h = new HistoryEvent()._HistoryEvent$Turn$HistoryEventType$Player(turn, HistoryEvent$HistoryEventType.INDEPENDENCE, independent);
    let n = CollectionUtils.count$Stream$Predicate(game.getLiveEuropeanPlayers([independent]), (p) => p.getPlayerType() === Player$PlayerType.INDEPENDENT);
    h.setScore(n);
    cs.addGlobalHistory(game, h);
    cs.addMessage(independent, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'giveIndependence.announce', independent).addStringTemplate$String$StringTemplate('%ref%', serverPlayer.getNationLabel()));
    let surrenderPred = (u) => (u.hasTile() && !u.isNaval() && !u.isOnCarrier() && (!u.hasAbility$String(Ability.REF_UNIT) || u.hasAbility$String(Ability.CAN_BE_SURRENDERED)) && serverPlayer.csChangeOwner(u, independent, UnitChangeType.CAPTURE, null, cs));
    let surrenderUnits = CollectionUtils.transform$Stream$Predicate(serverPlayer.getUnits(), surrenderPred);
    for (const $it3 = surrenderUnits.iterator(); $it3.hasNext(); ) {
      let u = $it3.next();
      u.setMovesLeft(0);
      u.setState(Unit$UnitState.ACTIVE);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps().always(serverPlayer), [u.getTile$()]);
    }
    if (!surrenderUnits.isEmpty()) {
      cs.addMessage(independent, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'giveIndependence.unitsAcquired', independent).addStringTemplate$String$StringTemplate('%units%', this.unitTemplate(', ', surrenderUnits)));
      independent.invalidateCanSeeTiles();
      serverPlayer.invalidateCanSeeTiles();
    }
    cs.addPartial(ChangeSet$See.all().except(independent), independent, ['playerType', $J.str(independent.getPlayerType())]);
    cs.addGlobalMessage(game, independent, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'giveIndependence.otherAnnounce', independent).addStringTemplate$String$StringTemplate('%nation%', independent.getNationLabel()).addStringTemplate$String$StringTemplate('%ref%', serverPlayer.getNationLabel()));
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(independent), [independent]);
    cs.add$See$Collection(ChangeSet$See.only(independent), (independent).exploreMap(true));
  }
  unitTemplate(base: string, units: List<Unit>): StringTemplate {
    let template = StringTemplate.label(base);
    for (const $it4 = units.iterator(); $it4.hasNext(); ) {
      let u = $it4.next();
      template.addStringTemplate$StringTemplate(u.getLabel$UnitLabelType(Unit$UnitLabelType.PLAIN));
    }
    return template;
  }
  /**
   * Performs a monarch action.
   *
   * Note that CHANGE_LATE is used so that these actions follow
   * setting the current player, so that it is the players turn when
   * they respond to a monarch action.
   *
   * @param serverPlayer The {@code ServerPlayer} being acted upon.
   * @param action The monarch action.
   * @param cs A {@code ChangeSet} to update.
   */
  csMonarchAction(serverPlayer: ServerPlayer, action: Monarch$MonarchAction, cs: ChangeSet): void {
    let monarch = serverPlayer.getMonarch();
    let game = this.getGame();
    let spec = game.getSpecification();
    let valid = monarch.actionIsValid(action);
    if (!valid) {
      return;
    }
    let messageId = action.getTextKey();
    let template: StringTemplate;
    let message: MonarchActionMessage;
    let monarchKey = serverPlayer.getNationId();
    {
      let taxRaise: number, goods: Goods, oldTax: number, taxLower: number, refAdditions: AbstractUnit, friends: List<Player>, friend: Player, enemies: List<Player>, enemy: Player, warSupport: List<AbstractUnit>, warGold: number, sea: boolean, support: List<AbstractUnit>, mercenaries: List<AbstractUnit>, mercPrice: number, hessians: List<AbstractUnit>, hessianPrice: number;
      switch (action) {
        case Monarch$MonarchAction.NO_ACTION:
          break;
        case Monarch$MonarchAction.RAISE_TAX_WAR:
        case Monarch$MonarchAction.RAISE_TAX_ACT:
          taxRaise = monarch.raiseTax(this.random);
          goods = serverPlayer.getMostValuableGoods();
          if (goods == null) {
            InGameController.logger.finest('Ignoring tax raise, no goods to boycott.');
            break;
          }
          template = StringTemplate.template$String(messageId).addStringTemplate$String$StringTemplate('%goods%', goods.getType().getLabel()).addAmount('%amount%', taxRaise);
          if (action === Monarch$MonarchAction.RAISE_TAX_WAR) {
            template = template.add$String$String('%nation%', Nation.getRandomNonPlayerNationNameKey(game, this.random));
          } else if (action === Monarch$MonarchAction.RAISE_TAX_ACT) {
            template = template.addAmount('%number%', RandomUtils.randomInt(InGameController.logger, 'Tax act goods', this.random, 6)).addName$String$String('%newWorld%', serverPlayer.getNewLandName());
          }
          cs.add$See$Message(ChangeSet$See.only(serverPlayer), new MonarchActionMessage()._MonarchActionMessage$MonarchAction$StringTemplate$String(action, template, monarchKey).setTax(taxRaise));
          new MonarchSession()._MonarchSession$ServerPlayer$MonarchAction$int$Goods(serverPlayer, action, taxRaise, goods).register();
          break;
        case Monarch$MonarchAction.LOWER_TAX_WAR:
        case Monarch$MonarchAction.LOWER_TAX_OTHER:
          oldTax = serverPlayer.getTax();
          taxLower = monarch.lowerTax(this.random);
          serverPlayer.csSetTax(taxLower, cs);
          template = StringTemplate.template$String(messageId).addAmount('%difference%', (oldTax - taxLower) | 0).addAmount('%newTax%', taxLower);
          if (action === Monarch$MonarchAction.LOWER_TAX_WAR) {
            template = template.add$String$String('%nation%', Nation.getRandomNonPlayerNationNameKey(game, this.random));
          } else {
            template = template.addAmount('%number%', RandomUtils.randomInt(InGameController.logger, 'Lower tax reason', this.random, 5));
          }
          cs.add$See$Message(ChangeSet$See.only(serverPlayer), new MonarchActionMessage()._MonarchActionMessage$MonarchAction$StringTemplate$String(action, template, monarchKey));
          break;
        case Monarch$MonarchAction.WAIVE_TAX:
          cs.add$See$Message(ChangeSet$See.only(serverPlayer), new MonarchActionMessage()._MonarchActionMessage$MonarchAction$StringTemplate$String(action, StringTemplate.template$String(messageId), monarchKey));
          break;
        case Monarch$MonarchAction.ADD_TO_REF:
          refAdditions = monarch.addToREF(this.random);
          if (refAdditions == null) {
            break;
          }
          template = StringTemplate.template$String(messageId).addAmount('%number%', refAdditions.getNumber()).addNamed$String$Named('%unit%', refAdditions.getType(spec));
          cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [monarch]);
          cs.add$See$Message(ChangeSet$See.only(serverPlayer), new MonarchActionMessage()._MonarchActionMessage$MonarchAction$StringTemplate$String(action, template, monarchKey));
          break;
        case Monarch$MonarchAction.DECLARE_PEACE:
          friends = monarch.collectPotentialFriends();
          if (friends.isEmpty()) {
            break;
          }
          friend = RandomUtils.getRandomMember$Logger$String$List$Random(InGameController.logger, 'Choose friend', friends, this.random);
          serverPlayer.csChangeStance(Stance.PEACE, friend, true, cs);
          cs.add$See$Message(ChangeSet$See.only(serverPlayer), new MonarchActionMessage()._MonarchActionMessage$MonarchAction$StringTemplate$String(action, StringTemplate.template$String(messageId).addStringTemplate$String$StringTemplate('%nation%', friend.getNationLabel()), monarchKey));
          break;
        case Monarch$MonarchAction.DECLARE_WAR:
          enemies = monarch.collectPotentialEnemies();
          if (enemies.isEmpty()) {
            break;
          }
          enemy = RandomUtils.getRandomMember$Logger$String$List$Random(InGameController.logger, 'Choose enemy', enemies, this.random);
          warSupport = monarch.getWarSupport(enemy, this.random);
          warGold = 0;
          if (!warSupport.isEmpty()) {
            serverPlayer.createUnits(warSupport, serverPlayer.getEurope(), this.random);
            warGold = spec.getInteger(GameOptions.WAR_SUPPORT_GOLD);
            warGold = (warGold + Math.imul(($J.idiv(warGold, 10)), ((RandomUtils.randomInt(InGameController.logger, 'War support gold', this.random, 5) - 2) | 0))) | 0;
            serverPlayer.modifyGold(warGold);
            cs.addPartial(ChangeSet$See.only(serverPlayer), serverPlayer, ['gold', String(serverPlayer.getGold()), 'score', String(serverPlayer.getScore())]);
            InGameController.logger.fine('War support v ' + enemy.getNation().getSuffix$() + ' ' + warGold + ' gold + ' + Messages.message$StringTemplate(AbstractUnit.getListLabel(', ', warSupport)));
          }
          serverPlayer.csChangeStance(Stance.WAR, enemy, true, cs);
          cs.add$See$Message(ChangeSet$See.only(serverPlayer), new MonarchActionMessage()._MonarchActionMessage$MonarchAction$StringTemplate$String(action, (StringTemplate.template$String((warSupport.isEmpty()) ? messageId : 'model.monarch.action.declareWarSupported.text')).addStringTemplate$String$StringTemplate('%nation%', enemy.getNationLabel()).addStringTemplate$String$StringTemplate('%force%', AbstractUnit.getListLabel(', ', warSupport)).addAmount('%gold%', warGold), monarchKey));
          break;
        case Monarch$MonarchAction.SUPPORT_LAND:
        case Monarch$MonarchAction.SUPPORT_SEA:
          sea = action === Monarch$MonarchAction.SUPPORT_SEA;
          support = monarch.getSupport(this.random, sea);
          if (support.isEmpty()) {
            break;
          }
          serverPlayer.createUnits(support, serverPlayer.getEurope(), this.random);
          cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [serverPlayer.getEurope()]);
          cs.add$See$Message(ChangeSet$See.only(serverPlayer), new MonarchActionMessage()._MonarchActionMessage$MonarchAction$StringTemplate$String(action, StringTemplate.template$String(messageId).addStringTemplate$String$StringTemplate('%addition%', AbstractUnit.getListLabel(', ', support)), monarchKey));
          break;
        case Monarch$MonarchAction.MONARCH_MERCENARIES:
          mercenaries = new ArrayList();
          mercPrice = monarch.loadMercenaries(this.random, mercenaries);
          if (mercPrice <= 0) {
            break;
          }
          cs.add$See$Message(ChangeSet$See.only(serverPlayer), new MonarchActionMessage()._MonarchActionMessage$MonarchAction$StringTemplate$String(action, StringTemplate.template$String(messageId).addAmount('%gold%', mercPrice).addStringTemplate$String$StringTemplate('%mercenaries%', AbstractUnit.getListLabel(', ', mercenaries)), monarchKey));
          new MonarchSession()._MonarchSession$ServerPlayer$MonarchAction$List$int(serverPlayer, action, mercenaries, mercPrice).register();
          break;
        case Monarch$MonarchAction.HESSIAN_MERCENARIES:
          hessians = new ArrayList();
          hessianPrice = monarch.loadMercenaries(this.random, hessians);
          if (hessianPrice <= 0) {
            break;
          }
          serverPlayer.csMercenaries(hessianPrice, hessians, action, this.random, cs);
          break;
        case Monarch$MonarchAction.DISPLEASURE:
        default:
          InGameController.logger.warning('Bogus action: ' + $J.str(action));
          break;
      }
    }
  }
  /**
   * Abandon a settlement.
   *
   * @param serverPlayer The {@code ServerPlayer} that is abandoning.
   * @param settlement The {@code Settlement} to abandon.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  abandonSettlement(serverPlayer: ServerPlayer, settlement: Settlement): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    if (settlement instanceof Colony) {
      serverPlayer.csLoseLocation(settlement, cs);
      cs.addHistory(serverPlayer, new HistoryEvent()._HistoryEvent$Turn$HistoryEventType$Player(this.getGame().getTurn(), HistoryEvent$HistoryEventType.ABANDON_COLONY, serverPlayer).addName$String$String('%colony%', settlement.getName()));
    }
    serverPlayer.csDisposeSettlement(settlement, cs);
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Ask about learning a skill at a native settlement.
   *
   * @param serverPlayer The {@code ServerPlayer} that is learning.
   * @param unit The {@code Unit} that is learning.
   * @param is The {@code IndianSettlement} to learn from.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  askLearnSkill(serverPlayer: ServerPlayer, unit: ServerUnit, is$: IndianSettlement): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    unit.csVisit(serverPlayer, is$, 0, cs);
    let tile = is$.getTile$();
    tile.updateIndianSettlement(serverPlayer);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [tile]);
    unit.setMovesLeft(0);
    cs.addPartial(ChangeSet$See.only(serverPlayer), unit, ['movesLeft', String(unit.getMovesLeft())]);
    return cs;
  }
  /**
   * Assign a student to a teacher.
   *
   * @param serverPlayer The {@code ServerPlayer} that owns the unit.
   * @param student The student {@code Unit}.
   * @param teacher The teacher {@code Unit}.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  assignTeacher(serverPlayer: ServerPlayer, student: Unit, teacher: Unit): ChangeSet {
    let oldStudent = teacher.getStudent();
    let oldTeacher = student.getTeacher();
    let cs = new ChangeSet()._ChangeSet$();
    if (oldTeacher != null) {
      oldTeacher.setStudent(null);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [oldTeacher]);
    }
    if (oldStudent != null) {
      oldStudent.setTeacher(null);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [oldStudent]);
    }
    teacher.setStudent(student);
    teacher.changeWorkType(null);
    student.setTeacher(teacher);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [student, teacher]);
    return cs;
  }
  /**
   * Assign a trade route to a unit.
   *
   * @param serverPlayer The {@code ServerPlayer} that owns the unit.
   * @param unit The unit {@code Unit} to assign to.
   * @param tradeRoute The {@code TradeRoute} to assign.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  assignTradeRoute(serverPlayer: ServerPlayer, unit: Unit, tradeRoute: TradeRoute): ChangeSet {
    let stop: TradeRouteStop;
    unit.setDestination((tradeRoute == null && unit.isAtSea() && (stop = unit.getStop()) != null) ? stop.getLocation() : null);
    unit.setTradeRoute(tradeRoute);
    if (tradeRoute != null) {
      let stops = tradeRoute.getStopList();
      let found = -1;
      for (let i = 0; i < stops.size(); i++) {
        if (Map_.isSameLocation(unit.getLocation(), stops.get(i).getLocation())) {
          found = i;
          break;
        }
      }
      if (found < 0) {
        found = 0;
      }
      unit.setCurrentStop(found);
    }
    return new ChangeSet()._ChangeSet$().add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [unit]);
  }
  /**
   * Build a settlement.
   *
   * +til: Resolves many tile appearance changes.
   *
   * @param serverPlayer The {@code ServerPlayer} that is building.
   * @param unit The {@code Unit} that is building.
   * @param name The new settlement name.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  buildSettlement(serverPlayer: ServerPlayer, unit: Unit, name: string): ChangeSet {
    let game = this.getGame();
    let spec = game.getSpecification();
    let cs = new ChangeSet()._ChangeSet$();
    let tile = unit.getTile$();
    let settlement: Settlement;
    if ($J.equals(Player.ASSIGN_SETTLEMENT_NAME, name)) {
      name = serverPlayer.getSettlementName(this.random);
    }
    if (serverPlayer.isEuropean()) {
      let nation = serverPlayer.getNationLabel();
      settlement = new ServerColony()._ServerColony$Game$Player$String$Tile(game, serverPlayer, name, tile);
      for (const $it5 = tile.getSurroundingTiles$int(settlement.getRadius()).iterator(); $it5.hasNext(); ) {
        let t = $it5.next();
        t.cacheUnseen$();
      }
      let visible = settlement.getVisibleTileSet();
      cs.add$See$Collection(ChangeSet$See.only(serverPlayer), serverPlayer.collectNewTiles$Collection(visible));
      for (const $it6 = CollectionUtils.transform$Collection$Predicate(game.getConnectedPlayers([serverPlayer]), InGameController.coronadoPred).iterator(); $it6.hasNext(); ) {
        let sp = $it6.next();
        cs.add$See$Collection(ChangeSet$See.only(sp), (sp).exploreForSettlement(settlement));
        sp.invalidateCanSeeTiles();
        cs.addMessage(sp, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'buildColony.others', settlement).addStringTemplate$String$StringTemplate('%nation%', nation).addStringTemplate$String$StringTemplate('%colony%', settlement.getLocationLabelFor(sp)).addStringTemplate$String$StringTemplate('%region%', tile.getRegion().getLabel()));
      }
      serverPlayer.addSettlement(settlement);
      let claimAllTiles = spec.getBoolean(GameOptions.CLAIM_ALL_TILES);
      settlement.placeSettlement(claimAllTiles);
      cs.addHistory(serverPlayer, new HistoryEvent()._HistoryEvent$Turn$HistoryEventType$Player(game.getTurn(), HistoryEvent$HistoryEventType.FOUND_COLONY, serverPlayer).addName$String$String('%colony%', settlement.getName()));
      settlement.equipForRole(unit, spec.getDefaultRole(), 0);
    } else {
      let nationType = serverPlayer.getNationType();
      let skill = RandomChoice.getWeightedRandom$Logger$String$Collection$Random(InGameController.logger, 'Choose skill', nationType.generateSkillsForTile(tile), this.random);
      if (skill == null) {
        let scouts = spec.getUnitTypesWithAbility([Ability.EXPERT_SCOUT]);
        skill = RandomUtils.getRandomMember$Logger$String$List$Random(InGameController.logger, 'Choose scout', scouts, this.random);
      }
      settlement = new ServerIndianSettlement()._ServerIndianSettlement$Game$Player$String$Tile$boolean$UnitType$Unit(game, serverPlayer, name, tile, false, skill, null);
      for (const $it7 = tile.getSurroundingTiles$int(settlement.getRadius()).iterator(); $it7.hasNext(); ) {
        let t = $it7.next();
        t.cacheUnseen$();
      }
      serverPlayer.addSettlement(settlement);
      settlement.placeSettlement(true);
      for (const $it8 = this.getGame().getLivePlayerList([serverPlayer]).iterator(); $it8.hasNext(); ) {
        let p = $it8.next();
        (settlement).setAlarm$Player$Tension(p, (p.isIndian()) ? new Tension()._Tension$int(Tension$Level.CONTENT.getLimit()) : serverPlayer.getTension$Player(p));
      }
    }
    unit.setLocation(settlement);
    unit.setMovesLeft(0);
    cs.add$See$Collection(ChangeSet$See.perhaps(), settlement.getOwnedTiles());
    serverPlayer.invalidateCanSeeTiles();
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Buy goods in Europe.
   *
   * @param serverPlayer The {@code ServerPlayer} that is buying.
   * @param type The {@code GoodsType} to buy.
   * @param amount The amount of goods to buy.
   * @param carrier The {@code Unit} to carry the goods.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  buyGoods(serverPlayer: ServerPlayer, type$: GoodsType, amount: number, carrier: Unit): ChangeSet {
    if (!serverPlayer.canTrade$GoodsType$Access(type$, Market$Access.EUROPE)) {
      return serverPlayer.clientError$String('Can not trade boycotted goods');
    }
    let cs = new ChangeSet()._ChangeSet$();
    let container = carrier.getGoodsContainer();
    container.saveState();
    let gold = serverPlayer.getGold();
    let buyAmount = serverPlayer.buyInEurope(this.random, container, type$, amount);
    if (buyAmount < 0) {
      return serverPlayer.clientError$String('Player ' + serverPlayer.getName() + ' tried to buy ' + amount + ' ' + type$.getSuffix$());
    }
    serverPlayer.propagateToEuropeanMarkets(type$, -buyAmount, this.random);
    serverPlayer.csFlushMarket$GoodsType$ChangeSet(type$, cs);
    carrier.setMovesLeft(0);
    cs.addPartial(ChangeSet$See.only(serverPlayer), serverPlayer, ['gold', String(serverPlayer.getGold())]);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [carrier]);
    InGameController.logger.finest($J.str(carrier) + ' bought ' + amount + '(' + buyAmount + ') ' + type$.getSuffix$() + ' in Europe for ' + ((serverPlayer.getGold() - gold) | 0));
    return cs;
  }
  /**
   * Cash in a treasure train.
   *
   * @param serverPlayer The {@code ServerPlayer} that is cashing in.
   * @param unit The treasure train {@code Unit} to cash in.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  cashInTreasureTrain(serverPlayer: ServerPlayer, unit: Unit): ChangeSet {
    let game = this.getGame();
    let cs = new ChangeSet()._ChangeSet$();
    let fullAmount = unit.getTreasureAmount();
    let cashInAmount: number;
    let messageId: string;
    if (serverPlayer.getPlayerType() === Player$PlayerType.COLONIAL) {
      cashInAmount = $J.idiv(Math.imul(((fullAmount - unit.getTransportFee()) | 0), ((100 - serverPlayer.getTax()) | 0)), 100);
      messageId = 'cashInTreasureTrain.colonial';
    } else {
      cashInAmount = fullAmount;
      messageId = 'cashInTreasureTrain.independent';
    }
    serverPlayer.modifyGold(cashInAmount);
    cs.addPartial(ChangeSet$See.only(serverPlayer), serverPlayer, ['gold', String(serverPlayer.getGold()), 'score', String(serverPlayer.getScore())]);
    cs.addMessage(serverPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, messageId, serverPlayer, unit).addAmount('%amount%', fullAmount).addAmount('%cashInAmount%', cashInAmount));
    messageId = (serverPlayer.isRebel() || serverPlayer.getPlayerType() === Player$PlayerType.INDEPENDENT) ? 'cashInTreasureTrain.otherIndependent' : 'cashInTreasureTrain.otherColonial';
    cs.addGlobalMessage(game, serverPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, messageId, serverPlayer).addAmount('%amount%', fullAmount).addStringTemplate$String$StringTemplate('%nation%', serverPlayer.getNationLabel()));
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [unit.getLocation()]);
    (unit).csRemove(ChangeSet$See.only(serverPlayer), null, cs);
    game.sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Change a units state.
   *
   * @param serverPlayer The {@code ServerPlayer} that owns the unit.
   * @param unit The {@code Unit} to change the state of.
   * @param state The new {@code UnitState}.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  changeState(serverPlayer: ServerPlayer, unit: Unit, state: Unit$UnitState): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    let tile = unit.getTile$();
    let tileDirty = tile != null && tile.getIndianSettlement() != null;
    if (state === Unit$UnitState.FORTIFYING && tile != null) {
      let colony = (tile.getOwningSettlement() instanceof Colony) ? tile.getOwningSettlement() : null;
      let owner = (colony == null) ? null : colony.getOwner();
      if (owner != null && owner !== unit.getOwner() && serverPlayer.getStance(owner) !== Stance.ALLIANCE && serverPlayer.getStance(owner) !== Stance.PEACE) {
        if (colony.isTileInUse(tile)) {
          colony.csEvictUsers(unit, cs);
        }
        if (serverPlayer.getStance(owner) === Stance.WAR) {
          tile.changeOwnership(null, null);
          tileDirty = true;
        }
      }
    }
    unit.setState(state);
    if (tileDirty) {
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [tile]);
    } else {
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [unit.getLocation()]);
    }
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Change improvement work type.
   *
   * @param serverPlayer The {@code ServerPlayer} that owns the unit.
   * @param unit The {@code Unit} to change the work type of.
   * @param type The new {@code TileImprovementType} to produce.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  changeWorkImprovementType(serverPlayer: ServerPlayer, unit: Unit, type$: TileImprovementType): ChangeSet {
    let tile = unit.getTile$();
    let improvement = tile.getTileImprovement(type$);
    if (improvement == null) {
      improvement = new TileImprovement()._TileImprovement$Game$Tile$TileImprovementType$TileImprovementStyle(this.getGame(), tile, type$, null);
      tile.add(improvement);
    }
    unit.setWorkImprovement(improvement);
    unit.setState(Unit$UnitState.IMPROVING);
    return new ChangeSet()._ChangeSet$().add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [tile]);
  }
  /**
   * Change work type.
   *
   * @param serverPlayer The {@code ServerPlayer} that owns the unit.
   * @param unit The {@code Unit} to change the work type of.
   * @param type The new {@code GoodsType} to produce.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  changeWorkType(serverPlayer: ServerPlayer, unit: Unit, type$: GoodsType): ChangeSet {
    if (unit.getWorkType() !== type$) {
      unit.setExperience(0);
      unit.changeWorkType(type$);
    }
    return new ChangeSet()._ChangeSet$().add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [unit.getColony()]);
  }
  /**
   * Chat.
   *
   * @param serverPlayer The {@code ServerPlayer} that is chatting.
   * @param message The chat message.
   * @param pri A privacy setting, currently a noop.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  chat(serverPlayer: ServerPlayer, message: string, pri: boolean): ChangeSet {
    this.getGame().sendToOthers(serverPlayer, ChangeSet.simpleChange$See$Message(ChangeSet$See.all().except(serverPlayer), new ChatMessage()._ChatMessage$Player$String$boolean(serverPlayer, message, false)));
    return null;
  }
  /**
   * Choose a founding father.
   *
   * @param serverPlayer The {@code ServerPlayer} that is choosing.
   * @param ff A {@code FoundingFather} to select.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  chooseFoundingFather(serverPlayer: ServerPlayer, ff: FoundingFather): ChangeSet {
    let offered = serverPlayer.getOfferedFathers();
    if (!serverPlayer.canRecruitFoundingFather()) {
      return serverPlayer.clientError$String('Player can not recruit fathers: ' + serverPlayer.getId());
    } else if (!offered.contains(ff)) {
      return serverPlayer.clientError$String('Founding father not offered: ' + ff.getId());
    }
    serverPlayer.updateCurrentFather(ff);
    return null;
  }
  /**
   * Claim land.
   *
   * @param serverPlayer The {@code ServerPlayer} claiming.
   * @param tile The {@code Tile} to claim.
   * @param settlement The {@code Settlement} to claim for.
   * @param price The price to pay for the land, which must agree
   *     with the owner valuation, unless negative which denotes stealing.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  claimLand(serverPlayer: ServerPlayer, tile: Tile, settlement: Settlement, price: number): ChangeSet {
    let sg = this.getGame();
    let cs = new ChangeSet()._ChangeSet$();
    serverPlayer.csClaimLand(tile, settlement, price, cs);
    if (settlement != null && serverPlayer.isEuropean()) {
      for (const $it9 = CollectionUtils.transform$Collection$Predicate(sg.getConnectedPlayers([serverPlayer]), InGameController.coronadoPred).iterator(); $it9.hasNext(); ) {
        let sp = $it9.next();
        (sp).exploreTile(tile);
        cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(sp), [tile]);
        sp.invalidateCanSeeTiles();
      }
    }
    sg.sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Clear the specialty of a unit.
   *
   * FIXME: why not clear speciality in the open?  You can disband!
   * If we implement this remember to fix the visibility.
   *
   * @param serverPlayer The owner of the unit.
   * @param unit The {@code Unit} to clear the speciality of.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  clearSpeciality(serverPlayer: ServerPlayer, unit: Unit): ChangeSet {
    let uc = unit.getUnitChange$String(UnitChangeType.CLEAR_SKILL);
    if (uc == null) {
      return serverPlayer.clientError$String('Can not clear unit speciality: ' + unit.getId());
    }
    if (unit.getStudent() != null) {
      return serverPlayer.clientError$String('Can not clear speciality of a teacher.');
    }
    unit.changeType(uc.to);
    return new ChangeSet()._ChangeSet$().add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [unit]);
  }
  /**
   * Combat.  Public for the test suite.
   *
   * @param attackerPlayer The {@code ServerPlayer} who is attacking.
   * @param attacker The {@code FreeColGameObject} that is attacking.
   * @param defender The {@code FreeColGameObject} that is defending.
   * @param crs A list of {@code CombatResult}s defining the result.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  combat(attackerPlayer: ServerPlayer, attacker: FreeColGameObject, defender: FreeColGameObject, crs: List<CombatModel$CombatEffectType>): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    try {
      attackerPlayer.csCombat(attacker, defender, crs, this.random, cs);
    } catch ($e10) {
      if ($J.isa($e10, IllegalStateException)) {
        let e = $J.exc($e10);
        InGameController.logger.log(Level.WARNING, 'Combat FAIL', e);
        return attackerPlayer.clientError$String(e.getMessage());
      } else {
        throw $e10;
      }
    }
    this.getGame().sendToOthers(attackerPlayer, cs);
    return cs;
  }
  /**
   * Continue playing after winning.
   *
   * @param serverPlayer The {@code ServerPlayer} that plays on.
   * @return Null.
   */
  continuePlaying(serverPlayer: ServerPlayer): ChangeSet {
    let game = this.getGame();
    if (!this.getFreeColServer().getSinglePlayer()) {
      InGameController.logger.warning('Can not continue playing in multiplayer!');
    } else if (serverPlayer !== game.checkForWinner()) {
      InGameController.logger.warning('Can not continue playing, as ' + serverPlayer.getName() + ' has not won the game!');
    } else {
      let spec = game.getSpecification();
      spec.setBoolean(GameOptions.VICTORY_DEFEAT_REF, false);
      spec.setBoolean(GameOptions.VICTORY_DEFEAT_EUROPEANS, false);
      spec.setBoolean(GameOptions.VICTORY_DEFEAT_HUMANS, false);
      InGameController.logger.info('Disabled victory conditions, as ' + serverPlayer.getName() + ' has won, but is continuing to play.');
    }
    return null;
  }
  /**
   * Declare independence.
   *
   * @param serverPlayer The {@code ServerPlayer} that is declaring.
   * @param nationName The new name for the independent nation.
   * @param countryName The new name for its residents.
   * @return A {@code ChangeSet} containing the response.
   */
  declareIndependence(serverPlayer: ServerPlayer, nationName: string, countryName: string): ChangeSet {
    let game = this.getGame();
    let spec = game.getSpecification();
    let cs = new ChangeSet()._ChangeSet$();
    let oldNation = serverPlayer.getNationLabel();
    serverPlayer.setIndependentNationName(nationName);
    serverPlayer.setNewLandName(countryName);
    serverPlayer.changePlayerType(Player$PlayerType.REBEL);
    let turn = game.getTurn();
    let h = new HistoryEvent()._HistoryEvent$Turn$HistoryEventType$Player(turn, HistoryEvent$HistoryEventType.DECLARE_INDEPENDENCE, serverPlayer);
    let independenceTurn = spec.getInteger(GameOptions.INDEPENDENCE_TURN);
    h.setScore(Math.max(0, (independenceTurn - turn.getNumber()) | 0));
    cs.addGlobalHistory(game, h);
    serverPlayer.clearModelMessages();
    cs.addMessage(serverPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'declareIndependence.resolution', serverPlayer));
    let europe = serverPlayer.getEurope();
    let seized = StringTemplate.label(', ');
    let lost = false;
    for (const $it11 = europe.getUnitList().iterator(); $it11.hasNext(); ) {
      let u = $it11.next();
      seized.addStringTemplate$StringTemplate(u.getLabel$());
      (u).csRemove(ChangeSet$See.only(serverPlayer), null, cs);
      lost = true;
    }
    for (const $it12 = (CollectionUtils.transform$Stream$Predicate(serverPlayer.getHighSeas().getUnits(), CollectionUtils.matchKey$Object$Function(europe, ($p0) => $p0.getDestination()))).iterator(); $it12.hasNext(); ) {
      let u = $it12.next();
      seized.addStringTemplate$StringTemplate(u.getLabel$());
      (u).csRemove(ChangeSet$See.only(serverPlayer), null, cs);
      lost = true;
    }
    if (lost) {
      cs.addMessage(serverPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.UNIT_LOST, 'declareIndependence.unitsSeized', serverPlayer).addStringTemplate$String$StringTemplate('%units%', seized));
    }
    serverPlayer.csLoseLocation(europe, cs);
    serverPlayer.reinitialiseMarket();
    let refPlayer = this.createREFPlayer(serverPlayer);
    cs.addPlayers(Collections.singletonList(refPlayer));
    let monarch = serverPlayer.getMonarch();
    monarch.updateInterventionForce();
    let otherKey = Nation.getRandomNonPlayerNationNameKey(game, this.random);
    cs.addMessage(serverPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'declareIndependence.interventionForce', serverPlayer).add$String$String('%nation%', otherKey).addAmount('%number%', spec.getInteger(GameOptions.INTERVENTION_BELLS)));
    serverPlayer.csChangeStance(Stance.WAR, refPlayer, true, cs);
    let unitMap = new HashMap();
    for (const $it13 = (CollectionUtils.transform$Stream$Predicate(serverPlayer.getColonies(), (c) => c.getSonsOfLiberty() > 50)).iterator(); $it13.hasNext(); ) {
      let colony = $it13.next();
      let allUnits = colony.getAllUnitsList();
      let limit = $J.idiv(Math.imul(((allUnits.size() + 2) | 0), ((colony.getSonsOfLiberty() - 50) | 0)), 100);
      unitMap.clear();
      for (const $it14 = (CollectionUtils.transform$Collection$Predicate(allUnits, (u) => u.getUnitChange$String(UnitChangeType.INDEPENDENCE) != null)).iterator(); $it14.hasNext(); ) {
        let unit = $it14.next();
        CollectionUtils.appendToMapList(unitMap, unit.getType(), unit);
      }
      for (const $it15 = unitMap.entrySet().iterator(); $it15.hasNext(); ) {
        let entry = $it15.next();
        let n = 0;
        let fromType = entry.getKey();
        let toType = spec.getUnitChange$String$UnitType(UnitChangeType.INDEPENDENCE, fromType).to;
        let units = entry.getValue();
        while (n < limit && !units.isEmpty()) {
          let unit = units.removeAt(0);
          unit.changeType(toType);
          cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [unit]);
          n++;
        }
        cs.addMessage(serverPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.UNIT_IMPROVED, 'declareIndependence.continentalArmyMuster', serverPlayer, colony).addName$String$String('%colony%', colony.getName()).addAmount('%number%', n).addNamed$String$Named('%oldUnit%', fromType).addNamed$String$Named('%unit%', toType));
        limit = (limit - n) | 0;
      }
    }
    let comp = Comparator.comparingInt((p) => p.getTension$Player(serverPlayer).getValue());
    let natives = CollectionUtils.transform$Stream$Predicate$Function$Comparator(game.getLiveNativePlayers([]), (p) => p.hasContacted(serverPlayer), JFunction.identity(), comp);
    if (!natives.isEmpty()) {
      let good = CollectionUtils.first$Collection(natives);
      InGameController.logger.info('Native ally following independence: ' + $J.str(good));
      cs.addMessage(serverPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'declareIndependence.nativeSupport', good).addStringTemplate$String$StringTemplate('%nation%', good.getNationLabel()).add$String$String('%ruler%', serverPlayer.getRulerNameKey()));
      let delta: number;
      switch (good.getStance(serverPlayer)) {
        case Stance.ALLIANCE:
        case Stance.PEACE:
        default:
          delta = 0;
          break;
        case Stance.CEASE_FIRE:
          delta = (Tension$Level.HAPPY.getLimit() - good.getTension$Player(serverPlayer).getValue()) | 0;
          break;
        case Stance.WAR:
          delta = (Tension$Level.CONTENT.getLimit() - good.getTension$Player(serverPlayer).getValue()) | 0;
          break;
      }
      (good).csModifyTension$Player$int$ChangeSet(serverPlayer, delta, cs);
      Player.makeContact(good, refPlayer);
      (good).csModifyTension$Player$int$ChangeSet(refPlayer, Tension$Level.HATEFUL.getLimit(), cs);
      CollectionUtils.reverse(natives);
      let bad = null;
      for (const $it16 = natives.iterator(); $it16.hasNext(); ) {
        let p = $it16.next();
        if (p === good || p.getStance(serverPlayer) === Stance.ALLIANCE) {
          break;
        }
        bad = p;
        if (!p.atWarWith(serverPlayer)) {
          break;
        }
      }
      InGameController.logger.info('Native enemy following independence: ' + $J.str(bad));
      if (bad != null) {
        switch (bad.getStance(serverPlayer)) {
          case Stance.PEACE:
          case Stance.CEASE_FIRE:
            delta = (Tension$Level.HATEFUL.getLimit() - bad.getTension$Player(serverPlayer).getValue()) | 0;
            break;
          case Stance.WAR:
          default:
            delta = 0;
            break;
        }
        cs.addMessage(serverPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'declareIndependence.nativeHostile', bad).addStringTemplate$String$StringTemplate('%nation%', bad.getNationLabel()));
        if (delta !== 0) {
          (bad).csModifyTension$Player$int$ChangeSet(serverPlayer, delta, cs);
        }
        Player.makeContact(bad, refPlayer);
        (bad).csModifyTension$Player$int$ChangeSet(refPlayer, -bad.getTension$Player(refPlayer).getValue(), cs);
      }
    }
    let mercs = new ArrayList();
    let mercPrice = monarch.loadMercenaryForce(this.random, mercs);
    if (mercPrice > 0) {
      serverPlayer.csMercenaries(mercPrice, mercs, Monarch$MonarchAction.HESSIAN_MERCENARIES, this.random, cs);
      InGameController.logger.info('Mercenary force offer on declaration (' + Messages.message$StringTemplate(AbstractUnit.getListLabel(', ', mercs)) + ') for ' + mercPrice);
    } else {
      InGameController.logger.info('Mercenary force offer on declaration not affordable.');
    }
    cs.addPartial(ChangeSet$See.all().except(serverPlayer), serverPlayer, ['playerType', $J.str(serverPlayer.getPlayerType()), 'independentNationName', serverPlayer.getIndependentNationName(), 'newLandName', serverPlayer.getNewLandName()]);
    cs.addGlobalMessage(game, serverPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'declareIndependence.announce', serverPlayer).addStringTemplate$String$StringTemplate('%oldNation%', oldNation).addStringTemplate$String$StringTemplate('%newNation%', serverPlayer.getNationLabel()).add$String$String('%ruler%', serverPlayer.getRulerNameKey()));
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [serverPlayer]);
    serverPlayer.invalidateCanSeeTiles();
    cs.addRemove(ChangeSet$See.only(serverPlayer), null, europe);
    europe.dispose();
    game.sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Decline to investigate strange mounds.
   *
   * @param serverPlayer The {@code ServerPlayer} that owns the unit.
   * @param tile The {@code Tile} where the mounds are.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  declineMounds(serverPlayer: ServerPlayer, tile: Tile): ChangeSet {
    tile.cacheUnseen$();
    tile.removeLostCityRumour();
    let cs = new ChangeSet()._ChangeSet$();
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [tile]);
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Delete a trade route.
   *
   * @param serverPlayer The {@code ServerPlayer} to delete a trade
   *     route for.
   * @param tradeRoute The {@code TradeRoute} to delete.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  deleteTradeRoute(serverPlayer: ServerPlayer, tradeRoute: TradeRoute): ChangeSet {
    let dropped = serverPlayer.removeTradeRoute(tradeRoute);
    let cs = new ChangeSet()._ChangeSet$();
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [serverPlayer]);
    if (!dropped.isEmpty()) {
      cs.add$See$Collection(ChangeSet$See.only(serverPlayer), dropped);
    }
    return cs;
  }
  /**
   * Deliver gift to settlement.
   * Note that this includes both European and native gifts.
   *
   * @param serverPlayer The {@code ServerPlayer} that is delivering.
   * @param unit The {@code Unit} that is delivering.
   * @param settlement The {@code Settlement} to deliver to.
   * @param goods The {@code Goods} to deliver.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  deliverGiftToSettlement(serverPlayer: ServerPlayer, unit: ServerUnit, settlement: Settlement, goods: Goods): ChangeSet {
    let session = Session.lookup$Class$FreeColGameObject$FreeColGameObject($J.cls(NativeTradeSession), unit, settlement);
    if (session == null) {
      return serverPlayer.clientError$String('Trying to deliver gift without opening a session');
    }
    let nt = session.getNativeTrade();
    if (!nt.getGift()) {
      return serverPlayer.clientError$String('Trying to deliver gift in a session where gift giving is not allowed: ' + $J.str(unit) + ' ' + $J.str(settlement) + ' ' + $J.str(session));
    }
    let cs = new ChangeSet()._ChangeSet$();
    let tile = settlement.getTile$();
    GoodsLocation.moveGoods(unit, goods.getType(), goods.getAmount(), settlement);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [unit]);
    if (settlement instanceof ServerIndianSettlement) {
      let sis = settlement;
      let alarmBonus = -$J.roundf(Math.fround(Math.fround(sis.getPriceToBuy$AbstractGoods(goods) * Math.fround(0.001)) * this.getGame().getSpecification().getPercentage(GameOptions.ALARM_BONUS_GIFT)));
      unit.csVisit(serverPlayer, sis, 0, cs);
      sis.csModifyAlarm(serverPlayer, alarmBonus, true, cs);
      sis.updateWantedGoods();
      tile.updateIndianSettlement(serverPlayer);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [tile]);
    }
    nt.setGift(true);
    let m = new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.GIFT_GOODS, 'deliverGift.goods', settlement, goods.getType()).addStringTemplate$String$StringTemplate('%player%', serverPlayer.getNationLabel()).addNamed$String$Named('%type%', goods).addAmount('%amount%', goods.getAmount()).addName$String$String('%settlement%', settlement.getName());
    cs.addMessage(serverPlayer, m);
    let receiver = settlement.getOwner();
    if (receiver.isConnected() && settlement instanceof Colony) {
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(receiver), [unit]);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(receiver), [settlement]);
      cs.addMessage(receiver, m);
    }
    InGameController.logger.info('Gift delivered by unit: ' + unit.getId() + ' to settlement: ' + settlement.getName());
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Demand a tribute from a native settlement.
   *
   * FIXME: Move TURNS_PER_TRIBUTE magic number to the spec.
   *
   * @param serverPlayer The {@code ServerPlayer} demanding the tribute.
   * @param unit The {@code Unit} that is demanding the tribute.
   * @param is The {@code IndianSettlement} demanded of.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  demandTribute(serverPlayer: ServerPlayer, unit: ServerUnit, is$: IndianSettlement): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    let TURNS_PER_TRIBUTE = 5;
    unit.csVisit(serverPlayer, is$, 0, cs);
    let indianPlayer = is$.getOwner();
    let gold = 0;
    let year = this.getGame().getTurn().getNumber();
    let gifts = is$.getType().getGifts();
    if (((is$.getLastTribute() + TURNS_PER_TRIBUTE) | 0) < year && gifts != null) {
      switch (indianPlayer.getTension$Player(serverPlayer).getLevel()) {
        case Tension$Level.HAPPY:
        case Tension$Level.CONTENT:
          gold = Math.min($J.idiv(gifts.getAmount('Tribute', this.random, true), 10), 100);
          break;
        case Tension$Level.DISPLEASED:
          gold = Math.min($J.idiv(gifts.getAmount('Tribute', this.random, true), 20), 100);
          break;
        case Tension$Level.ANGRY:
        case Tension$Level.HATEFUL:
        default:
          gold = 0;
          break;
      }
    }
    (is$).csModifyAlarm(serverPlayer, Tension.TENSION_ADD_NORMAL, true, cs);
    is$.setLastTribute(year);
    let m: ModelMessage;
    if (gold > 0) {
      indianPlayer.modifyGold(-gold);
      serverPlayer.modifyGold(gold);
      cs.addPartial(ChangeSet$See.only(serverPlayer), serverPlayer, ['gold', String(serverPlayer.getGold()), 'score', String(serverPlayer.getScore())]);
      m = new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'scoutSettlement.tributeAgree', unit, is$).addAmount('%amount%', gold);
    } else {
      m = new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'scoutSettlement.tributeDisagree', unit, is$);
    }
    cs.addMessage(serverPlayer, m);
    let tile = is$.getTile$();
    tile.updateIndianSettlement(serverPlayer);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [tile]);
    unit.setMovesLeft(0);
    cs.addPartial(ChangeSet$See.only(serverPlayer), unit, ['movesLeft', String(unit.getMovesLeft())]);
    return cs;
  }
  /**
   * Denounce an existing mission.
   *
   * @param serverPlayer The {@code ServerPlayer} that is denouncing.
   * @param sUnit The {@code ServerUnit} denouncing.
   * @param is The {@code IndianSettlement} containing the mission
   *     to denounce.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  denounceMission(serverPlayer: ServerPlayer, sUnit: ServerUnit, is$: IndianSettlement): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    sUnit.csVisit(serverPlayer, is$, 0, cs);
    let missionary = is$.getMissionary();
    if (missionary == null) {
      return serverPlayer.clientError$String('Denouncing null missionary');
    }
    let enemy = missionary.getOwner();
    let denounce = RandomUtils.randomDouble(InGameController.logger, 'Denounce base', this.random) * enemy.getImmigration() / ((serverPlayer.getImmigration() + 1) | 0);
    if (missionary.hasAbility$String(Ability.EXPERT_MISSIONARY)) {
      denounce += 0.2;
    }
    if (sUnit.hasAbility$String(Ability.EXPERT_MISSIONARY)) {
      denounce -= 0.2;
    }
    if (denounce < 0.5) {
      return this.establishMission(serverPlayer, sUnit, is$);
    }
    let owner = is$.getOwner();
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [is$]);
    cs.addMessage(serverPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'indianSettlement.mission.noDenounce', serverPlayer, sUnit).addStringTemplate$String$StringTemplate('%nation%', owner.getNationLabel()));
    cs.addMessage(enemy, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'indianSettlement.mission.enemyDenounce', enemy, is$).addStringTemplate$String$StringTemplate('%enemy%', serverPlayer.getNationLabel()).addStringTemplate$String$StringTemplate('%settlement%', is$.getLocationLabelFor(enemy)).addStringTemplate$String$StringTemplate('%nation%', owner.getNationLabel()));
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps().always(serverPlayer), [sUnit.getLocation()]);
    sUnit.csRemove(ChangeSet$See.perhaps().always(serverPlayer), sUnit.getLocation(), cs);
    serverPlayer.invalidateCanSeeTiles();
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Diplomacy.
   *
   * @param serverPlayer The {@code ServerPlayer} that is trading.
   * @param ourUnit The {@code Unit} that is trading.
   * @param otherColony The {@code Colony} to trade with.
   * @param agreement The {@code DiplomaticTrade} to consider.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  diplomacy$ServerPlayer$Unit$Colony$DiplomaticTrade(serverPlayer: ServerPlayer, ourUnit: Unit, otherColony: Colony, agreement: DiplomaticTrade): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    let status = agreement.getStatus();
    let session = Session.lookup$Class$String($J.cls(DiplomacySession), DiplomacySession.makeDiplomacySessionKey(ourUnit, otherColony));
    if (session == null) {
      if (status !== DiplomaticTrade$TradeStatus.PROPOSE_TRADE) {
        return serverPlayer.clientError$String('Missing uc-diplomacy session for ' + ourUnit.getId() + '/' + otherColony.getId() + ' with ' + $J.str(agreement));
      }
      session = new DiplomacySession()._DiplomacySession$Unit$Settlement$long(ourUnit, otherColony, this.getTimeout());
      session.register();
      InGameController.logger.info('New diplomacy session: ' + $J.str(session));
    } else {
      InGameController.logger.info('Continuing diplomacy session: ' + $J.str(session) + ' from ' + $J.str(ourUnit));
    }
    serverPlayer.csDiplomacy(session, agreement, cs);
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Diplomacy.
   *
   * @param serverPlayer The {@code ServerPlayer} that is trading.
   * @param ourColony Our {@code Colony}.
   * @param otherUnit The other {@code Unit} that is trading.
   * @param agreement The {@code DiplomaticTrade} to consider.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  diplomacy$ServerPlayer$Colony$Unit$DiplomaticTrade(serverPlayer: ServerPlayer, ourColony: Colony, otherUnit: Unit, agreement: DiplomaticTrade): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    let session = Session.lookup$Class$String($J.cls(DiplomacySession), DiplomacySession.makeDiplomacySessionKey(otherUnit, ourColony));
    if (session == null) {
      return serverPlayer.clientError$String('Missing cu-diplomacy session for ' + otherUnit.getId() + '/' + ourColony.getId() + ' with ' + $J.str(agreement));
    } else {
      InGameController.logger.info('Continuing diplomacy session: ' + $J.str(session) + ' from ' + $J.str(ourColony));
    }
    serverPlayer.csDiplomacy(session, agreement, cs);
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Disband a unit.
   *
   * @param serverPlayer The owner of the unit.
   * @param unit The {@code Unit} to disband.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  disbandUnit(serverPlayer: ServerPlayer, unit: Unit): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    let loc = unit.getLocation();
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps().always(serverPlayer), [loc]);
    (unit).csRemove(ChangeSet$See.perhaps().always(serverPlayer), loc, cs);
    serverPlayer.invalidateCanSeeTiles();
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Disconnect the client.
   *
   * @param serverPlayer The {@code ServerPlayer} to disconnect.
   * @return Null, we never reply to a disconnect.
   */
  disconnect(serverPlayer: ServerPlayer): ChangeSet {
    let freeColServer = this.getFreeColServer();
    if (serverPlayer != null) {
      freeColServer.removePlayerConnection(serverPlayer);
    }
    return null;
  }
  /**
   * Disembark unit from a carrier.
   *
   * @param serverPlayer The {@code ServerPlayer} whose unit is
   *                     embarking.
   * @param serverUnit The {@code ServerUnit} that is disembarking.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  disembarkUnit(serverPlayer: ServerPlayer, serverUnit: ServerUnit): ChangeSet {
    if (serverUnit.isNaval()) {
      return serverPlayer.clientError$String('Naval unit ' + serverUnit.getId() + ' can not disembark.');
    }
    let carrier = serverUnit.getCarrier();
    if (carrier == null) {
      return serverPlayer.clientError$String('Unit ' + serverUnit.getId() + ' is not embarked.');
    }
    let cs = new ChangeSet()._ChangeSet$();
    let newLocation = carrier.getLocation();
    let newTiles = (newLocation.getTile$() == null) ? null : serverPlayer.collectNewTiles$Tile$int(newLocation.getTile$(), serverUnit.getLineOfSight());
    serverUnit.setLocation(newLocation);
    serverPlayer.invalidateCanSeeTiles();
    serverUnit.setMovesLeft(0);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [newLocation]);
    if (newTiles != null) {
      serverPlayer.csSeeNewTiles(newTiles, cs);
    }
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Embark a unit onto a carrier.
   * Checking that the locations are appropriate is not done here.
   *
   * @param serverPlayer The {@code ServerPlayer} embarking.
   * @param serverUnit The {@code ServerUnit} that is embarking.
   * @param carrier The {@code Unit} to embark onto.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  embarkUnit(serverPlayer: ServerPlayer, serverUnit: ServerUnit, carrier: Unit): ChangeSet {
    if (serverUnit.isNaval()) {
      return serverPlayer.clientError$String('Naval unit ' + serverUnit.getId() + ' can not embark.');
    }
    let reason = carrier.getNoAddReason(serverUnit);
    if (reason !== UnitLocation$NoAddReason.NONE) {
      return serverPlayer.clientError$String('Carrier: ' + carrier.getId() + ' can not carry ' + serverUnit.getId() + ': ' + $J.str(reason));
    }
    let cs = new ChangeSet()._ChangeSet$();
    serverUnit.csEmbark(carrier, cs);
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * A unit migrates from Europe.
   *
   * @param serverPlayer The {@code ServerPlayer} whose unit it will be.
   * @param slot The slot within {@code Europe} to select the unit from.
   * @param type The type of migration occurring.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  emigrate(serverPlayer: ServerPlayer, slot: number, type$: Europe$MigrationType): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    serverPlayer.csEmigrate(slot, type$, this.random, cs);
    return cs;
  }
  /**
   * Ends the turn of the given player.
   *
   * Note: sends messages to other players.
   *
   * @param serverPlayer The {@code ServerPlayer} to end the turn of.
   * @return A {@code ChangeSet} encapsulating the end of turn changes.
   */
  endTurn(serverPlayer: ServerPlayer): ChangeSet {
    let freeColServer = this.getFreeColServer();
    let serverGame = this.getGame();
    let winner = serverGame.checkForWinner();
    let current = serverGame.getCurrentPlayer();
    if (serverPlayer !== current) {
      throw new RuntimeException('It is not ' + serverPlayer.getName() + '\'s turn, it is ' + ((current == null) ? 'noone' : current.getName()) + '\'s!');
    }
    let cs = new ChangeSet()._ChangeSet$();
    for (; ; ) {
      current.csEndTurn(cs);
      InGameController.logger.finest('Ending turn for ' + current.getName());
      current.clearModelMessages();
      if (serverGame.isNextPlayerInNewTurn()) {
        serverGame.csNextTurn(cs);
        let lb = new LogBuilder()._LogBuilder(512);
        lb.add(['New turn ', serverGame.getTurn(), ' for ']);
        serverGame.csNewTurn(this.random, lb, cs);
        lb.shrink(', ');
        lb.log(InGameController.logger, Level.FINEST);
        if (this.debugOnlyAITurns > 0) {
          if (--this.debugOnlyAITurns <= 0) {
            FreeColDebugger.signalEndDebugRun();
          }
        }
        serverGame.sendToAll(cs);
        cs.clear();
      }
      if ((current = serverGame.getNextPlayer()) == null) {
        return serverPlayer.clientError$String('Can not get next player');
      }
      switch (current.checkForDeath()) {
        case ServerPlayer$DeadCheck.IS_DEFEATED:
          for (const $it17 = current.getRebels().iterator(); $it17.hasNext(); ) {
            let p = $it17.next();
            this.csGiveIndependence(current, p, cs);
          }
        case ServerPlayer$DeadCheck.IS_DEAD:
          current.csWithdraw(cs, null, null);
          InGameController.logger.info('For ' + serverPlayer.getSuffix$() + ', ' + $J.str(current.getNation()) + ' has withdrawn.');
          break;
        case ServerPlayer$DeadCheck.IS_AUTORECRUIT:
          current.csEmigrate(0, Europe$MigrationType.SURVIVAL, this.random, cs);
          break;
        case ServerPlayer$DeadCheck.IS_ALIVE:
        default:
          break;
      }
      if (!cs.isEmpty()) {
        serverGame.sendToAll(cs);
        cs.clear();
      }
      if (current.isDead()) {
        continue;
      }
      let connected = serverGame.getConnectedPlayers([]);
      let onlyAI = CollectionUtils.all$Collection$Predicate(connected, ($p0) => $p0.isAI());
      if (onlyAI) {
        let scoreComp = Comparator.reversed((Comparator.comparingInt(($p0) => $p0.getScore())));
        winner = CollectionUtils.first$Collection(CollectionUtils.sort$Collection$Comparator(connected, scoreComp));
        InGameController.logger.info('No human player left, winner is: ' + $J.str(winner));
        if (this.debugOnlyAITurns > 0) {
          FreeColDebugger.signalEndDebugRun();
        }
        serverGame.setCurrentPlayer(null);
        cs.add$See$Message(ChangeSet$See.all(), new GameEndedMessage()._GameEndedMessage$Player$boolean(winner, false));
        serverGame.sendToAll(cs);
        cs.clear();
      }
      if (winner === current && !(freeColServer.getSinglePlayer() && winner.isAI())) {
        let highScore = !winner.isAI() && HighScore.newHighScore(winner);
        cs.add$See$Message(ChangeSet$See.all(), new GameEndedMessage()._GameEndedMessage$Player$boolean(winner, highScore));
        serverGame.sendToAll(cs);
        cs.clear();
      }
      serverGame.setCurrentPlayer(current);
      if (current.isREF() && current.getEntryTile() == null) {
        let refAIPlayer = freeColServer.getAIPlayer(current);
        let teleport = serverGame.getSpecification().getBoolean(GameOptions.TELEPORT_REF);
        if (refAIPlayer.initialize(teleport)) {
          this.csLaunchREF(current, teleport, cs);
        } else {
          InGameController.logger.severe('REF failed to initialize.');
        }
      }
      current.csStartTurn(this.random, cs);
      cs.add$See$Message(ChangeSet$See.all(), new SetCurrentPlayerMessage()._SetCurrentPlayerMessage$Player(current));
      if (current.getPlayerType() === Player$PlayerType.COLONIAL) {
        let monarch = current.getMonarch();
        let action = null;
        if (this.debugMonarchAction != null && current === this.debugMonarchPlayer) {
          action = this.debugMonarchAction;
          this.debugMonarchAction = null;
          this.debugMonarchPlayer = null;
          InGameController.logger.finest('Debug monarch action: ' + $J.str(action));
        } else if (monarch != null) {
          action = RandomChoice.getWeightedRandom$Logger$String$Collection$Random(InGameController.logger, 'Choose monarch action', monarch.getActionChoices(), this.random);
        }
        if (action != null) {
          if (monarch.actionIsValid(action)) {
            InGameController.logger.finest('Monarch action: ' + $J.str(action));
            this.csMonarchAction(current, action, cs);
          } else {
            InGameController.logger.finest('Skipping invalid monarch action: ' + $J.str(action));
          }
        }
      }
      let players = serverGame.getConnectedPlayers([current]);
      players.add(current);
      let debugSkip = this.debugOnlyAITurns > 0 && !current.isAI() && freeColServer.getSinglePlayer();
      if (debugSkip) {
        serverGame.sendToList(players, cs);
        cs.clear();
        continue;
      }
      players.remove(serverPlayer);
      serverGame.sendToList(players, cs);
      return cs;
    }
  }
  /**
   * Enters revenge mode against those evil AIs.
   *
   * @param serverPlayer The {@code ServerPlayer} entering revenge mode.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  enterRevengeMode(serverPlayer: ServerPlayer): ChangeSet {
    if (!this.getFreeColServer().getSinglePlayer()) {
      return serverPlayer.clientError$String('Can not enter revenge mode, as this is not a single player game.');
    }
    let game = this.getGame();
    let undeads = game.getSpecification().getUnitTypesWithAbility([Ability.UNDEAD]);
    let navalUnits = new ArrayList();
    let landUnits = new ArrayList();
    for (const $it18 = undeads.iterator(); $it18.hasNext(); ) {
      let undead = $it18.next();
      if (undead.hasAbility$String(Ability.NAVAL_UNIT)) {
        navalUnits.add(undead);
      } else if (undead.hasAbility$String(Ability.MULTIPLE_ATTACKS)) {
        landUnits.add(undead);
      }
    }
    if (navalUnits.isEmpty() || landUnits.isEmpty()) {
      return serverPlayer.clientError$String('Can not enter revenge mode, because we can not find the undead units.');
    }
    let cs = new ChangeSet()._ChangeSet$();
    let navalType = RandomUtils.getRandomMember$Logger$String$List$Random(InGameController.logger, 'Choose undead navy', navalUnits, this.random);
    let start = serverPlayer.getEntryTile().getSafeTile(serverPlayer, this.random);
    let theFlyingDutchman = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, start, serverPlayer, navalType);
    let landType = RandomUtils.getRandomMember$Logger$String$List$Random(InGameController.logger, 'Choose undead army', landUnits, this.random);
    let undead = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, theFlyingDutchman, serverPlayer, landType);
    // assert undead != null
    cs.add$See$Collection(ChangeSet$See.only(serverPlayer), serverPlayer.exploreForUnit(theFlyingDutchman));
    serverPlayer.setDead(false);
    serverPlayer.changePlayerType(Player$PlayerType.UNDEAD);
    serverPlayer.addAbility(new Ability()._Ability$String(Ability.UNDEAD));
    serverPlayer.invalidateCanSeeTiles();
    for (const $it19 = (CollectionUtils.transform$Stream$Predicate(game.getLivePlayers([serverPlayer]), (p2) => serverPlayer.hasContacted(p2))).iterator(); $it19.hasNext(); ) {
      let p = $it19.next();
      serverPlayer.csChangeStance(Stance.WAR, p, true, cs);
    }
    game.setCurrentPlayer(serverPlayer);
    cs.add$See$Message(ChangeSet$See.all(), new SetCurrentPlayerMessage()._SetCurrentPlayerMessage$Player(serverPlayer));
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.all(), [serverPlayer]);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [start]);
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Equip a unit for a specific role.
   * Currently the unit is either in Europe or in a settlement.
   * Might one day allow the unit to be on a tile co-located with
   * an equipment-bearing wagon.
   *
   * @param serverPlayer The {@code ServerPlayer} that owns the unit.
   * @param unit The {@code Unit} to equip.
   * @param role The {@code Role} to equip for.
   * @param roleCount The role count.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  equipForRole(serverPlayer: ServerPlayer, unit: Unit, role: Role, roleCount: number): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    let ret = false;
    if (unit.isInEurope()) {
      let serverEurope = serverPlayer.getEurope();
      ret = serverEurope.csEquipForRole(unit, role, roleCount, this.random, cs);
    } else if (unit.getColony() != null) {
      let serverColony = unit.getColony();
      ret = serverColony.csEquipForRole(unit, role, roleCount, this.random, cs);
    } else if (unit.getIndianSettlement() != null) {
      let sis = unit.getIndianSettlement();
      ret = sis.csEquipForRole(unit, role, roleCount, this.random, cs);
    } else {
      return serverPlayer.clientError$String('Unsuitable equip location for: ' + unit.getId());
    }
    if (!ret) {
      return null;
    }
    if (unit.getInitialMovesLeft() !== unit.getMovesLeft()) {
      unit.setMovesLeft(0);
    }
    let carrier = unit.getCarrier();
    if (carrier != null && carrier.getInitialMovesLeft() !== carrier.getMovesLeft() && carrier.getMovesLeft() !== 0) {
      carrier.setMovesLeft(0);
    }
    return cs;
  }
  /**
   * Establish a new mission.
   *
   * @param serverPlayer The {@code ServerPlayer} that is establishing.
   * @param sUnit The missionary {@code ServerUnit}.
   * @param is The {@code IndianSettlement} to establish at.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  establishMission(serverPlayer: ServerPlayer, sUnit: ServerUnit, is$: IndianSettlement): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    sUnit.csVisit(serverPlayer, is$, 0, cs);
    let tension = is$.getAlarm$Player(serverPlayer);
    let loc = sUnit.getLocation();
    {
      let sis: ServerIndianSettlement;
      switch (tension.getLevel()) {
        case Tension$Level.HATEFUL:
        case Tension$Level.ANGRY:
          cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps().always(serverPlayer), [loc]);
          sUnit.csRemove(ChangeSet$See.perhaps().always(serverPlayer), loc, cs);
          serverPlayer.invalidateCanSeeTiles();
          break;
        case Tension$Level.HAPPY:
        case Tension$Level.CONTENT:
        case Tension$Level.DISPLEASED:
          sis = is$;
          if (is$.hasMissionary$()) {
            sis.csKillMissionary(false, cs);
          }
          cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps().always(serverPlayer), [sUnit.getTile$()]);
          sis.csChangeMissionary(sUnit, cs);
          break;
      }
    }
    let nation = is$.getOwner().getNationLabel();
    cs.addMessage(serverPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'indianSettlement.mission.' + tension.getKey(), serverPlayer, sUnit).addStringTemplate$String$StringTemplate('%nation%', nation));
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Handle first contact between European players.
   *
   * @param serverPlayer The {@code ServerPlayer} making contact.
   * @param ourUnit The {@code Unit} making contact (may be null).
   * @param ourColony The {@code Colony} making contact (may be null).
   * @param otherUnit The other {@code Unit} making contact (may be null).
   * @param otherColony The other {@code Colony} making contact (may be null).
   * @param agreement The {@code DiplomaticTrade} to consider.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  europeanFirstContact(serverPlayer: ServerPlayer, ourUnit: Unit, ourColony: Colony, otherUnit: Unit, otherColony: Colony, agreement: DiplomaticTrade): ChangeSet {
    let err = 'Missing contact diplomacy session for ';
    let ds: DiplomacySession;
    let compatible = false;
    if (ourColony != null) {
      ds = DiplomacySession.findContactSession$Unit$Settlement(otherUnit, ourColony);
      if (ds == null) {
        return serverPlayer.clientError$String(err + ourColony.getId() + ' and ' + otherUnit.getId());
      }
      compatible = ds.isCompatible(ourColony, otherUnit);
    } else if (otherUnit != null) {
      ds = DiplomacySession.findContactSession$Unit$Unit(ourUnit, otherUnit);
      if (ds == null) {
        return serverPlayer.clientError$String(err + ourUnit.getId() + ' and ' + otherUnit.getId());
      }
      compatible = ds.isCompatible(ourUnit, otherUnit);
    } else {
      ds = DiplomacySession.findContactSession$Unit$Settlement(ourUnit, otherColony);
      if (ds == null) {
        return serverPlayer.clientError$String(err + ourUnit.getId() + ' and ' + otherColony.getId());
      }
      compatible = ds.isCompatible(ourUnit, otherColony);
    }
    InGameController.logger.info('Continuing ' + ((compatible) ? '' : 'in') + 'compatible contact session: ' + ds.getKey());
    let cs = new ChangeSet()._ChangeSet$();
    if (compatible) {
      serverPlayer.csDiplomacy(ds, agreement, cs);
      this.getGame().sendToOthers(serverPlayer, cs);
    }
    return cs;
  }
  /**
   * Get the game state.
   *
   * @return A {@code ChangeSet} encapsulating this action.
   */
  gameState(): ChangeSet {
    let freeColServer = this.getFreeColServer();
    return ChangeSet.simpleChange$Player$Message(null, new GameStateMessage()._GameStateMessage$ServerState(freeColServer.getServerState()));
  }
  /**
   * Gets the list of high scores.
   *
   * @param serverPlayer The {@code ServerPlayer} querying the scores.
   * @param key A score category key.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  getHighScores(serverPlayer: ServerPlayer, key: string): ChangeSet {
    return ChangeSet.simpleChange$Player$Message(serverPlayer, new HighScoresMessage()._HighScoresMessage$String$List(key, HighScore.loadHighScores()));
  }
  /**
   * Incite a settlement against an enemy.
   *
   * @param serverPlayer The {@code ServerPlayer} that is inciting.
   * @param unit The missionary {@code Unit} inciting.
   * @param is The {@code IndianSettlement} to incite.
   * @param enemy The {@code Player} to be incited against.
   * @param gold The amount of gold in the bribe.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  incite(serverPlayer: ServerPlayer, unit: ServerUnit, is$: IndianSettlement, enemy: Player, gold: number): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    let tile = is$.getTile$();
    unit.csVisit(serverPlayer, is$, 0, cs);
    tile.updateIndianSettlement(serverPlayer);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [tile]);
    let nativePlayer = is$.getOwner();
    let payingValue = nativePlayer.getTension$Player(serverPlayer).getValue();
    let targetValue = nativePlayer.getTension$Player(enemy).getValue();
    let goldToPay = (payingValue > targetValue) ? 10000 : 5000;
    goldToPay = (goldToPay + Math.imul(20, ((payingValue - targetValue) | 0))) | 0;
    goldToPay = Math.max(goldToPay, 650);
    if (gold < 0) {
      cs.add$See$Message(ChangeSet$See.only(serverPlayer), new InciteMessage()._InciteMessage$Unit$IndianSettlement$Player$int(unit, is$, enemy, goldToPay));
    } else if (gold < goldToPay || !serverPlayer.checkGold(gold)) {
      cs.addMessage(serverPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'missionarySettlement.inciteGoldFail', serverPlayer, is$).addStringTemplate$String$StringTemplate('%player%', enemy.getNationLabel()).addAmount('%amount%', goldToPay));
      unit.setMovesLeft(0);
      cs.addPartial(ChangeSet$See.only(serverPlayer), unit, ['movesLeft', String(unit.getMovesLeft())]);
    } else {
      (nativePlayer).csModifyTension$Player$int$ChangeSet(enemy, Tension.WAR_MODIFIER, cs);
      (enemy).csModifyTension$Player$int$ChangeSet(serverPlayer, Tension.TENSION_ADD_WAR_INCITER, cs);
      serverPlayer.modifyGold(-gold);
      nativePlayer.modifyGold(gold);
      cs.addMessage(serverPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'missionarySettlement.inciteSuccess', nativePlayer).addStringTemplate$String$StringTemplate('%native%', nativePlayer.getNationLabel()).addStringTemplate$String$StringTemplate('%enemy%', enemy.getNationLabel()));
      cs.addPartial(ChangeSet$See.only(serverPlayer), serverPlayer, ['gold', String(serverPlayer.getGold())]);
      unit.setMovesLeft(0);
      cs.addPartial(ChangeSet$See.only(serverPlayer), unit, ['movesLeft', String(unit.getMovesLeft())]);
    }
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Indians making demands of a colony.
   *
   * @param serverPlayer The {@code ServerPlayer} that sent the message.
   * @param unit The {@code Unit} making the demands.
   * @param colony The {@code Colony} that is demanded of.
   * @param type The {@code GoodsType} being demanded, null
   *     implies gold.
   * @param amount The amount of goods/gold being demanded.
   * @param result The demand result (null initially).
   * @return A {@code ChangeSet} encapsulating this action.
   */
  indianDemand(serverPlayer: ServerPlayer, unit: Unit, colony: Colony, type$: GoodsType, amount: number, result: Constants$IndianDemandAction): ChangeSet {
    let victim = colony.getOwner();
    let session = Session.lookup$Class$FreeColGameObject$FreeColGameObject($J.cls(NativeDemandSession), unit, colony);
    let cs = new ChangeSet()._ChangeSet$();
    if (serverPlayer.isIndian()) {
      if (session != null) {
        return serverPlayer.clientError$String('Repeated native demand: ' + unit.getId() + ',' + colony.getId());
      }
      session = new NativeDemandSession()._NativeDemandSession(unit, colony, type$, amount, this.getTimeout());
      session.register();
      InGameController.logger.info('Native demand(begin) ' + session.getKey() + ': ' + serverPlayer.getName() + ' unit ' + $J.str(unit) + ' demands ' + amount + ' ' + $J.str(((type$ == null) ? 'gold' : type$)) + ' from ' + colony.getName());
      cs.add$See$Message(ChangeSet$See.only(victim), new IndianDemandMessage()._IndianDemandMessage$Unit$Colony$GoodsType$int(unit, colony, type$, amount));
    } else {
      if (session == null) {
        return serverPlayer.clientError$String('Replying to missing demand: ' + unit.getId() + ',' + colony.getId());
      }
      InGameController.logger.info('Native demand(' + $J.str(result) + ') ' + session.getKey() + ': ' + serverPlayer.getName() + ' unit ' + $J.str(unit) + ' demands ' + amount + ' ' + $J.str(((type$ == null) ? 'gold' : type$)) + ' from ' + colony.getName());
      session.complete$boolean$ChangeSet(result === Constants$IndianDemandAction.INDIAN_DEMAND_ACCEPT, cs);
    }
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Join a colony.
   *
   * @param serverPlayer The {@code ServerPlayer} that owns the unit.
   * @param unit The {@code Unit} that is joining.
   * @param colony The {@code Colony} to join.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  joinColony(serverPlayer: ServerPlayer, unit: Unit, colony: Colony): ChangeSet {
    let spec = this.getGame().getSpecification();
    let cs = new ChangeSet()._ChangeSet$();
    let ownedTiles = colony.getOwnedTiles();
    let tile = colony.getTile$();
    tile.cacheUnseen$();
    unit.setLocation(colony);
    unit.setMovesLeft(0);
    colony.equipForRole(unit, spec.getDefaultRole(), 0);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [tile]);
    for (const $it20 = (CollectionUtils.transform$Collection$Predicate(tile.getSurroundingTiles$int$int(1, colony.getRadius()), (t2) => (t2.getOwningSettlement() === colony && !ownedTiles.contains(t2)))).iterator(); $it20.hasNext(); ) {
      let t = $it20.next();
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [t]);
    }
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Learn a skill at an IndianSettlement.
   *
   * @param serverPlayer The {@code ServerPlayer} that is learning.
   * @param sUnit The {@code ServerUnit} that is learning.
   * @param is The {@code IndianSettlement} to learn from.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  learnFromIndianSettlement(serverPlayer: ServerPlayer, sUnit: ServerUnit, is$: IndianSettlement): ChangeSet {
    let spec = this.getGame().getSpecification();
    let skill = is$.getLearnableSkill();
    if (skill == null) {
      return serverPlayer.clientError$String('No skill to learn at ' + is$.getName());
    }
    if (sUnit.getUnitChange$String$UnitType(UnitChangeType.NATIVES, skill) == null) {
      return serverPlayer.clientError$String('Unit ' + $J.str(sUnit) + ' can not learn skill ' + $J.str(skill) + ' at ' + is$.getName());
    }
    let cs = new ChangeSet()._ChangeSet$();
    sUnit.setMovesLeft(0);
    let loc = sUnit.getLocation();
    switch (is$.getAlarm$Player(serverPlayer).getLevel()) {
      case Tension$Level.HATEFUL:
        cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps().always(serverPlayer), [loc]);
        sUnit.csRemove(ChangeSet$See.perhaps().always(serverPlayer), loc, cs);
        serverPlayer.invalidateCanSeeTiles();
        break;
      case Tension$Level.ANGRY:
        cs.addPartial(ChangeSet$See.only(serverPlayer), sUnit, ['movesLeft', String(sUnit.getMovesLeft())]);
        break;
      default:
        sUnit.changeType(skill);
        serverPlayer.invalidateCanSeeTiles();
        cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [sUnit]);
        if (!is$.isCapital() && !(is$.hasMissionary$Player(serverPlayer) && spec.getBoolean(GameOptions.ENHANCED_MISSIONARIES))) {
          is$.setLearnableSkill(null);
        }
        break;
    }
    let tile = is$.getTile$();
    tile.updateIndianSettlement(serverPlayer);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [tile]);
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Load goods.
   *
   * @param serverPlayer The {@code ServerPlayer} that is loading.
   * @param loc The {@code Location} where the goods are.
   * @param goodsType The {@code GoodsType} to load.
   * @param amount The amount of goods to load.
   * @param carrier The {@code Unit} to load.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  loadGoods(serverPlayer: ServerPlayer, loc: Location, goodsType: GoodsType, amount: number, carrier: Unit): ChangeSet {
    if (carrier.getLoadableAmount(goodsType) < amount) {
      return serverPlayer.clientError$String('Too much goods');
    }
    if (loc instanceof Europe) {
      if (carrier.isInEurope()) {
        return this.buyGoods(serverPlayer, goodsType, amount, carrier);
      } else {
        return serverPlayer.clientError$String('Carrier not in Europe: ' + $J.str(loc));
      }
    }
    if (!(loc instanceof GoodsLocation)) {
      return serverPlayer.clientError$String('Not a goods location: ' + $J.str(loc));
    }
    let gl = loc;
    if (!carrier.isAtLocation(loc)) {
      return serverPlayer.clientError$String('Carrier not at location: ' + $J.str(loc));
    }
    if (gl.getGoodsCount(goodsType) < amount) {
      return serverPlayer.clientError$String('Not enough goods (' + gl.getGoodsCount(goodsType) + ' < ' + amount + ' ' + goodsType.getSuffix$() + ') at ' + $J.str(gl));
    }
    let cs = new ChangeSet()._ChangeSet$();
    GoodsLocation.moveGoods(gl, goodsType, amount, carrier);
    InGameController.logger.finest(Messages.message$StringTemplate(loc.getLocationLabel()) + ' loaded ' + amount + ' ' + goodsType.getSuffix$() + ' onto ' + $J.str(carrier));
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [gl.getGoodsContainer()]);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [carrier.getGoodsContainer()]);
    if (carrier.getInitialMovesLeft() !== carrier.getMovesLeft()) {
      carrier.setMovesLeft(0);
      cs.addPartial(ChangeSet$See.only(serverPlayer), carrier, ['movesLeft', String(carrier.getMovesLeft())]);
    }
    if (gl instanceof Unit) {
      let dst = gl;
      if (dst.getInitialMovesLeft() !== dst.getMovesLeft()) {
        dst.setMovesLeft(0);
        cs.addPartial(ChangeSet$See.only(serverPlayer), dst, ['movesLeft', String(dst.getMovesLeft())]);
      }
    }
    return cs;
  }
  /**
   * Loot cargo.
   *
   * Note loser is passed by identifier, as by the time we get here
   * the unit may have been sunk.
   *
   * @param serverPlayer The {@code ServerPlayer} that owns the winner.
   * @param winner The {@code Unit} that looting.
   * @param loserId The object identifier of the {@code Unit}
   *     that is looted.
   * @param loot The {@code Goods} to loot.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  lootCargo(serverPlayer: ServerPlayer, winner: Unit, loserId: string, loot: List<Goods>): ChangeSet {
    let session = Session.lookup$Class$String$String($J.cls(LootSession), winner.getId(), loserId);
    if (session == null) {
      return serverPlayer.clientError$String('Bogus looting!');
    }
    if (!winner.hasSpaceLeft()) {
      return serverPlayer.clientError$String('No space to loot to: ' + winner.getId());
    }
    let cs = new ChangeSet()._ChangeSet$();
    let available = session.getCapture();
    if (loot == null) {
      cs.add$See$Message(ChangeSet$See.only(serverPlayer), new LootCargoMessage()._LootCargoMessage$Unit$String$List(winner, loserId, available));
    } else {
      for (const $it21 = loot.iterator(); $it21.hasNext(); ) {
        let g = $it21.next();
        if (!available.contains(g)) {
          return serverPlayer.clientError$String('Invalid loot: ' + $J.str(g));
        }
        available.remove(g);
        if (!winner.canAdd(g)) {
          return serverPlayer.clientError$String('Loot failed: ' + $J.str(g));
        }
        winner.add(g);
      }
      session.complete$ChangeSet(cs);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [winner]);
      this.getGame().sendToOthers(serverPlayer, cs);
    }
    return cs;
  }
  /**
   * Respond to a monarch action.
   *
   * @param serverPlayer The {@code ServerPlayer} that is to respond.
   * @param action The {@code MonarchAction} to respond to.
   * @param result The player response.
   * @return A {@code ChangeSet} containing the response.
   */
  monarchAction(serverPlayer: ServerPlayer, action: Monarch$MonarchAction, result: boolean): ChangeSet {
    let session = Session.lookup$Class$String$String($J.cls(MonarchSession), serverPlayer.getId(), '');
    if (session == null) {
      return serverPlayer.clientError$String('Bogus monarch action: ' + $J.str(action));
    } else if (action !== session.getAction()) {
      return serverPlayer.clientError$String('Session action mismatch, ' + $J.str(session.getAction()) + ' expected: ' + $J.str(action));
    }
    let cs = new ChangeSet()._ChangeSet$();
    session.complete$boolean$ChangeSet(result, cs);
    return cs;
  }
  /**
   * Move a unit.
   *
   * @param serverPlayer The {@code ServerPlayer} that is moving.
   * @param unit The {@code ServerUnit} to move.
   * @param newTile The {@code Tile} to move to.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  move(serverPlayer: ServerPlayer, unit: ServerUnit, newTile: Tile): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    unit.csMove(newTile, this.random, cs);
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Move a unit across the high seas.
   *
   * @param serverPlayer The {@code ServerPlayer} that owns the unit.
   * @param unit The {@code Unit} to move.
   * @param destination The {@code Location} to move to.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  moveTo(serverPlayer: ServerPlayer, unit: Unit, destination: Location): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    let highSeas = serverPlayer.getHighSeas();
    let current = unit.getDestination();
    let destinations = highSeas.getDestinations();
    let others = false;
    let invalid = false;
    if (!unit.getType().canMoveToHighSeas()) {
      invalid = true;
    } else if (destination instanceof Europe) {
      if (!destinations.contains(destination)) {
        return serverPlayer.clientError$String('HighSeas does not connect to: ' + destination.getId() + ' in ' + highSeas.destinationsToString());
      } else if (unit.getLocation() === highSeas) {
        if (!(current instanceof Europe)) {
          unit.setWorkLeft((unit.getSailTurns() - unit.getWorkLeft() + 1) | 0);
        }
        unit.setDestination(destination);
        cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [unit, highSeas]);
      } else if (unit.hasTile()) {
        let tile = unit.getTile$();
        unit.setEntryLocation(tile);
        unit.setWorkLeft(unit.getSailTurns());
        unit.setDestination(destination);
        unit.setMovesLeft(0);
        unit.setLocation(highSeas);
        serverPlayer.invalidateCanSeeTiles();
        cs.addDisappear(serverPlayer, tile, unit);
        cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [tile, highSeas]);
        others = true;
      } else {
        invalid = true;
      }
      let hasMap = false;
      for (const $it22 = destinations.iterator(); $it22.hasNext(); ) {
        let dest = $it22.next();
        if (dest instanceof Map_) {
          hasMap = true;
          break;
        }
      }
      if (!hasMap) {
        let map = this.getGame().getMap();
        destinations.add(map);
      }
    } else if (destination instanceof Map_) {
      if (!destinations.contains(destination)) {
        return serverPlayer.clientError$String('HighSeas does not connect to: ' + destination.getId() + ' in ' + highSeas.destinationsToString());
      } else if (unit.getLocation() === highSeas) {
        if (current !== destination && (current == null || current.getTile$() == null || current.getTile$().getMap() !== destination)) {
          unit.setWorkLeft((unit.getSailTurns() - unit.getWorkLeft() + 1) | 0);
        }
        unit.setDestination(destination);
        cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [highSeas]);
      } else if (unit.getLocation() instanceof Europe) {
        let europe = unit.getLocation();
        unit.setWorkLeft(unit.getSailTurns());
        unit.setDestination(destination);
        unit.setMovesLeft(0);
        unit.setLocation(highSeas);
        cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [europe, highSeas]);
      } else {
        invalid = true;
      }
    } else if (destination instanceof Settlement) {
      let tile = destination.getTile$();
      if (!destinations.contains(tile.getMap())) {
        return serverPlayer.clientError$String('HighSeas does not connect to: ' + destination.getId() + '/' + tile.getMap().getId() + ' in ' + highSeas.destinationsToString());
      } else if (unit.getLocation() === highSeas) {
        unit.setWorkLeft(unit.getSailTurns());
        unit.setDestination(destination);
        cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [highSeas]);
      } else if (unit.getLocation() instanceof Europe) {
        let europe = unit.getLocation();
        unit.setWorkLeft(unit.getSailTurns());
        unit.setDestination(destination);
        unit.setMovesLeft(0);
        unit.setLocation(highSeas);
        cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [europe, highSeas]);
      } else {
        invalid = true;
      }
    } else {
      return serverPlayer.clientError$String('Bogus moveTo destination: ' + destination.getId());
    }
    if (invalid) {
      return serverPlayer.clientError$String('Invalid moveTo: unit=' + unit.getId() + ' from=' + unit.getLocation().getId() + ' to=' + destination.getId());
    }
    if (others) {
      this.getGame().sendToOthers(serverPlayer, cs);
    }
    return cs;
  }
  /**
   * Get a nation summary.
   *
   * @param serverPlayer The {@code ServerPlayer} to make the summary for.
   * @param player The {@code Player} to summarize.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  nationSummary(serverPlayer: ServerPlayer, player: Player): ChangeSet {
    return ChangeSet.simpleChange$Player$Message(serverPlayer, new NationSummaryMessage()._NationSummaryMessage$Player$NationSummary(player, new NationSummary()._NationSummary$Player$Player(player, serverPlayer)));
  }
  /**
   * Handle first contact between European and native player.
   *
   * Note that we check for a diplomacy session, but only bother in
   * the case of tile!=null as that is the only possibility for some
   * benefit.
   *
   * @param serverPlayer The {@code ServerPlayer} making contact.
   * @param other The native {@code Player} to contact.
   * @param tile A {@code Tile} on offer at first landing.
   * @param result Whether the initial peace treaty was accepted.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  nativeFirstContact(serverPlayer: ServerPlayer, other: Player, tile: Tile, result: boolean): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    let session = null;
    if (tile != null) {
      let u = tile.getFirstUnit();
      let s = tile.getOwningSettlement();
      if (u != null && s != null) {
        session = DiplomacySession.findContactSession$Unit$Settlement(u, s);
      }
    }
    if (result) {
      if (tile != null) {
        if (session == null) {
          return serverPlayer.clientError$String('No diplomacy for: ' + tile.getId());
        }
        tile.cacheUnseen$();
        tile.changeOwnership(serverPlayer, null);
        cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [tile]);
      }
    } else {
      (other).csModifyTension$Player$int$ChangeSet(serverPlayer, Tension.TENSION_ADD_MAJOR, cs);
      (other).addMissionBan(serverPlayer);
    }
    if (session != null) {
      session.completeFirstContact(cs);
    }
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * A native unit delivers its gift to a colony.
   *
   * @param serverPlayer The {@code ServerPlayer} that is delivering.
   * @param unit The {@code Unit} that is delivering.
   * @param colony The {@code Colony} to deliver to.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  nativeGift(serverPlayer: ServerPlayer, unit: Unit, colony: Colony): ChangeSet {
    let goods = CollectionUtils.first$Collection(unit.getGoodsList());
    if (goods == null) {
      return serverPlayer.clientError$String('No gift to deliver: ' + unit.getId());
    }
    let otherPlayer = colony.getOwner();
    let cs = new ChangeSet()._ChangeSet$();
    GoodsLocation.moveGoods(unit, goods.getType(), goods.getAmount(), colony);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [unit]);
    let m = new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.GIFT_GOODS, 'deliverGift.goods', colony, goods.getType()).addStringTemplate$String$StringTemplate('%player%', serverPlayer.getNationLabel()).addNamed$String$Named('%type%', goods).addAmount('%amount%', goods.getAmount()).addName$String$String('%settlement%', colony.getName());
    cs.addMessage(otherPlayer, m);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(otherPlayer), [colony]);
    InGameController.logger.info('Gift delivered by unit: ' + unit.getId() + ' to colony ' + colony.getName() + ': ' + $J.str(goods));
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Handle native trade sessions.
   *
   * @param serverPlayer The {@code ServerPlayer} that is trading.
   * @param action The {@code NativeTradeAction} to perform.
   * @param nt The {@code NativeTrade} underway.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  nativeTrade(serverPlayer: ServerPlayer, action: NativeTrade$NativeTradeAction, nt: NativeTrade): ChangeSet {
    let unit = nt.getUnit();
    let is$ = nt.getIndianSettlement();
    let otherPlayer = (serverPlayer.owns(unit)) ? is$.getOwner() : unit.getOwner();
    let session = Session.lookup$Class$FreeColGameObject$FreeColGameObject($J.cls(NativeTradeSession), unit, is$);
    if (action.isEuropean() !== serverPlayer.isEuropean()) {
      return serverPlayer.clientError$String(((action.isEuropean()) ? 'European' : 'Native') + ' player expected for ' + $J.str(action) + ': ' + serverPlayer.getSuffix$());
    } else if (action === NativeTrade$NativeTradeAction.OPEN && session != null) {
      return serverPlayer.clientError$String('Session already open for: ' + $J.str(nt));
    } else if (action !== NativeTrade$NativeTradeAction.OPEN && session == null) {
      return serverPlayer.clientError$String('No session found for: ' + $J.str(nt));
    }
    let cs = new ChangeSet()._ChangeSet$();
    let item: NativeTradeItem;
    switch (action) {
      case NativeTrade$NativeTradeAction.OPEN:
        if (unit.getMovesLeft() <= 0) {
          return serverPlayer.clientError$String('Unit ' + unit.getId() + ' has no moves left.');
        }
        nt = NativeTradeSession.openSession(nt);
        cs.add$See$Message(ChangeSet$See.only(otherPlayer), new NativeTradeMessage()._NativeTradeMessage$NativeTradeAction$NativeTrade(action, nt));
        break;
      case NativeTrade$NativeTradeAction.CLOSE:
        session.complete$ChangeSet(cs);
        break;
      case NativeTrade$NativeTradeAction.BUY:
        item = nt.getItem();
        nt.mergeFrom(session.getNativeTrade());
        if (item == null) {
          return serverPlayer.clientError$String('Null purchase: ' + $J.str(nt));
        } else if (!nt.canBuy()) {
          return serverPlayer.clientError$String('Can not buy: ' + $J.str(nt));
        } else if (CollectionUtils.find$Collection$Predicate(nt.getSettlementToUnit(), item.goodsMatcher()) == null) {
          return serverPlayer.clientError$String('Item missing for ' + $J.str(action) + ': ' + $J.str(nt));
        } else if (!serverPlayer.checkGold(item.getPrice())) {
          return serverPlayer.clientError$String('Player can not afford item: ' + $J.str(nt));
        }
        nt.setItem(item);
        cs.add$See$Message(ChangeSet$See.only(otherPlayer), new NativeTradeMessage()._NativeTradeMessage$NativeTradeAction$NativeTrade(action, nt));
        break;
      case NativeTrade$NativeTradeAction.SELL:
        item = nt.getItem();
        nt.mergeFrom(session.getNativeTrade());
        if (item == null) {
          return serverPlayer.clientError$String('Null sale: ' + $J.str(nt));
        } else if (item.priceIsSet() && !nt.canSell()) {
          return serverPlayer.clientError$String('Can not sell: ' + $J.str(nt));
        } else if (CollectionUtils.find$Collection$Predicate(nt.getUnitToSettlement(), item.goodsMatcher()) == null) {
          return serverPlayer.clientError$String('Item missing for ' + $J.str(action) + ': ' + $J.str(nt));
        }
        nt.setItem(item);
        cs.add$See$Message(ChangeSet$See.only(otherPlayer), new NativeTradeMessage()._NativeTradeMessage$NativeTradeAction$NativeTrade(action, nt));
        break;
      case NativeTrade$NativeTradeAction.GIFT:
        item = nt.getItem();
        nt.mergeFrom(session.getNativeTrade());
        if (item == null) {
          return serverPlayer.clientError$String('Null gift: ' + $J.str(nt));
        } else if (!nt.canGift()) {
          return serverPlayer.clientError$String('Can not gift: ' + $J.str(nt));
        } else if (CollectionUtils.find$Collection$Predicate(nt.getUnitToSettlement(), item.goodsMatcher()) == null) {
          return serverPlayer.clientError$String('Item missing for ' + $J.str(action) + ': ' + $J.str(nt));
        }
        nt.setItem(item);
        cs.add$See$Message(ChangeSet$See.only(otherPlayer), new NativeTradeMessage()._NativeTradeMessage$NativeTradeAction$NativeTrade(action, nt));
        break;
      case NativeTrade$NativeTradeAction.ACK_OPEN:
        session.getNativeTrade().mergeFrom(nt);
        cs.add$See$Message(ChangeSet$See.only(otherPlayer), new NativeTradeMessage()._NativeTradeMessage$NativeTradeAction$NativeTrade(action, nt));
        unit.setMovesLeft(0);
        cs.addPartial(ChangeSet$See.only(otherPlayer), unit, ['movesLeft', String(unit.getMovesLeft())]);
        break;
      case NativeTrade$NativeTradeAction.ACK_BUY_HAGGLE:
      case NativeTrade$NativeTradeAction.ACK_SELL_HAGGLE:
      case NativeTrade$NativeTradeAction.NAK_GOODS:
        session.getNativeTrade().mergeFrom(nt);
        cs.add$See$Message(ChangeSet$See.only(otherPlayer), new NativeTradeMessage()._NativeTradeMessage$NativeTradeAction$NativeTrade(action, nt));
        break;
      case NativeTrade$NativeTradeAction.ACK_BUY:
        item = nt.getItem();
        this.csBuy(unit, item.getGoods(), item.getPrice(), is$, cs);
        nt.setBuy(false);
        nt.addToUnit(item);
        session.getNativeTrade().mergeFrom(nt);
        session.getNativeTrade().setBuy(false);
        cs.add$See$Message(ChangeSet$See.only(otherPlayer), new NativeTradeMessage()._NativeTradeMessage$NativeTradeAction$NativeTrade(action, nt));
        break;
      case NativeTrade$NativeTradeAction.ACK_SELL:
        item = nt.getItem();
        this.csSell(unit, item.getGoods(), item.getPrice(), is$, cs);
        nt.setSell(false);
        nt.removeFromUnit(item);
        session.getNativeTrade().mergeFrom(nt);
        session.getNativeTrade().setSell(false);
        cs.add$See$Message(ChangeSet$See.only(otherPlayer), new NativeTradeMessage()._NativeTradeMessage$NativeTradeAction$NativeTrade(action, nt));
        break;
      case NativeTrade$NativeTradeAction.ACK_GIFT:
        item = nt.getItem();
        this.csGift(unit, item.getGoods(), item.getPrice(), is$, cs);
        nt.setGift(false);
        nt.removeFromUnit(item);
        session.getNativeTrade().mergeFrom(nt);
        session.getNativeTrade().setGift(false);
        cs.add$See$Message(ChangeSet$See.only(otherPlayer), new NativeTradeMessage()._NativeTradeMessage$NativeTradeAction$NativeTrade(action, nt));
        break;
      case NativeTrade$NativeTradeAction.NAK_HAGGLE:
      case NativeTrade$NativeTradeAction.NAK_NOSALE:
        unit.setMovesLeft(0);
        cs.addPartial(ChangeSet$See.only(otherPlayer), unit, ['movesLeft', String(unit.getMovesLeft())]);
      case NativeTrade$NativeTradeAction.NAK_INVALID:
      case NativeTrade$NativeTradeAction.NAK_HOSTILE:
        session.getNativeTrade().mergeFrom(nt);
        cs.add$See$Message(ChangeSet$See.only(otherPlayer), new NativeTradeMessage()._NativeTradeMessage$NativeTradeAction$NativeTrade(action, nt));
        session.complete$ChangeSet(cs);
        break;
      default:
        return serverPlayer.clientError$String('Bogus action: ' + $J.str(action));
    }
    InGameController.logger.fine('Native trade(' + StringUtils.downCase$String(action.toString()) + ': ' + $J.str(nt));
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Create a new trade route for a player.
   *
   * @param serverPlayer The {@code ServerPlayer} that needs a new route.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  newTradeRoute(serverPlayer: ServerPlayer): ChangeSet {
    return ChangeSet.simpleChange$Player$Message(serverPlayer, new NewTradeRouteMessage()._NewTradeRouteMessage$TradeRoute(serverPlayer.newTradeRoute()));
  }
  /**
   * Pay arrears.
   *
   * @param serverPlayer The {@code ServerPlayer} that owns the unit.
   * @param type The {@code GoodsType} to pay the arrears for.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  payArrears(serverPlayer: ServerPlayer, type$: GoodsType): ChangeSet {
    let arrears = serverPlayer.getArrears(type$);
    if (arrears <= 0) {
      return serverPlayer.clientError$String('No arrears for pay for: ' + type$.getId());
    } else if (!serverPlayer.checkGold(arrears)) {
      return serverPlayer.clientError$String('Not enough gold to pay arrears for: ' + type$.getId());
    }
    let cs = new ChangeSet()._ChangeSet$();
    let market = serverPlayer.getMarket();
    serverPlayer.modifyGold(-arrears);
    market.setArrears(type$, 0);
    cs.addPartial(ChangeSet$See.only(serverPlayer), serverPlayer, ['gold', String(serverPlayer.getGold())]);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [market.getMarketData$GoodsType(type$)]);
    return cs;
  }
  /**
   * Pay for a building.
   *
   * @param serverPlayer The {@code ServerPlayer} that owns the
   *     colony.
   * @param colony The {@code Colony} that is building.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  payForBuilding(serverPlayer: ServerPlayer, colony: Colony): ChangeSet {
    if (!this.getGame().getSpecification().getBoolean(GameOptions.PAY_FOR_BUILDING)) {
      return serverPlayer.clientError$String('Pay for building is disabled');
    }
    let build = colony.getCurrentlyBuilding();
    if (build == null) {
      return serverPlayer.clientError$String('Colony ' + colony.getId() + ' is not building anything!');
    }
    let required = colony.getRequiredGoods(build);
    let price = colony.priceGoodsForBuilding(required);
    if (!serverPlayer.checkGold(price)) {
      return serverPlayer.clientError$String('Insufficient funds to pay for build.');
    }
    let savedGold = serverPlayer.modifyGold(-price);
    serverPlayer.modifyGold(price);
    let cs = new ChangeSet()._ChangeSet$();
    let container = colony.getGoodsContainer();
    container.saveState();
    for (const $it23 = required.iterator(); $it23.hasNext(); ) {
      let ag = $it23.next();
      let type$ = ag.getType();
      let amount = ag.getAmount();
      if (type$.isStorable()) {
        if ((amount = serverPlayer.buyInEurope(this.random, container, type$, amount)) < 0) {
          return serverPlayer.clientError$String('Can not buy ' + amount + ' ' + $J.str(type$) + ' for ' + $J.str(build));
        }
        serverPlayer.csFlushMarket$GoodsType$ChangeSet(type$, cs);
      } else {
        container.addGoods$GoodsType$int(type$, amount);
      }
    }
    colony.invalidateCache();
    serverPlayer.setGold(savedGold);
    cs.addPartial(ChangeSet$See.only(serverPlayer), serverPlayer, ['gold', String(serverPlayer.getGold())]);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [container]);
    return cs;
  }
  /**
   * Put outside colony.
   *
   * @param serverPlayer The {@code ServerPlayer} that owns the unit.
   * @param unit The {@code Unit} to be put out.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  putOutsideColony(serverPlayer: ServerPlayer, unit: Unit): ChangeSet {
    let tile = unit.getTile$();
    let colony = unit.getColony();
    if (unit.isInColony()) {
      tile.cacheUnseen$();
    }
    unit.setLocation(tile);
    let cs = new ChangeSet()._ChangeSet$();
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [tile]);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps().except(serverPlayer), [colony]);
    return cs;
  }
  /**
   * Rearrange a colony.
   *
   * @param serverPlayer The {@code ServerPlayer} that is querying.
   * @param colony The {@code Colony} to rearrange.
   * @param arrangements A list of {@code Arrangement}s to apply.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  rearrangeColony(serverPlayer: ServerPlayer, colony: Colony, arrangements: List<RearrangeColonyMessage$Arrangement>): ChangeSet {
    let defaultRole = this.getGame().getSpecification().getDefaultRole();
    let tile = colony.getTile$();
    tile.cacheUnseen$();
    for (const $it24 = arrangements.iterator(); $it24.hasNext(); ) {
      let a = $it24.next();
      a.unit.setLocation(tile);
      if (!a.unit.hasDefaultRole()) {
        colony.equipForRole(a.unit, defaultRole, 0);
      }
    }
    let todo = new ArrayList(arrangements);
    while (!todo.isEmpty()) {
      let a = todo.removeAt(0);
      if (a.loc === tile) {
        continue;
      }
      let wl = a.loc;
      switch (wl.getNoAddReason(a.unit)) {
        case UnitLocation$NoAddReason.NONE:
          a.unit.setLocation(wl);
        case UnitLocation$NoAddReason.ALREADY_PRESENT:
          if (a.unit.getWorkType() !== a.work_) {
            a.unit.changeWorkType(a.work_);
          }
          break;
        case UnitLocation$NoAddReason.CAPACITY_EXCEEDED:
          todo.add(todo.size(), a);
          break;
        default:
          InGameController.logger.warning('Bad move for ' + $J.str(a.unit) + ' to ' + $J.str(wl));
          break;
      }
    }
    for (const $it25 = (CollectionUtils.transform$Collection$Predicate$Function$Comparator(arrangements, (a) => a.role !== defaultRole && a.role !== a.unit.getRole(), JFunction.identity(), ($p0, $p1) => $p0.roleComparison($p1))).iterator(); $it25.hasNext(); ) {
      let a = $it25.next();
      if (!colony.equipForRole(a.unit, a.role, a.roleCount)) {
        return serverPlayer.clientError$String('Failed to equip ' + a.unit.getId() + ' for role ' + $J.str(a.role) + ' at ' + $J.str(colony));
      }
    }
    return new ChangeSet()._ChangeSet$().add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [tile]);
  }
  /**
   * Rename an object.
   *
   * @param serverPlayer The {@code ServerPlayer} that is naming.
   * @param object The {@code Nameable} to rename.
   * @param newName The new name.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  renameObject(serverPlayer: ServerPlayer, object$: Nameable, newName: string): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    if (object$ instanceof Settlement) {
      (object$).getTile$().cacheUnseen$();
    }
    object$.setName(newName);
    let fcgo = object$;
    cs.addPartial(ChangeSet$See.all(), fcgo, ['name', newName]);
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Handle a player retiring.
   *
   * @param serverPlayer The {@code ServerPlayer} that is retiring.
   * @return A {@code ChangeSet} containing the response.
   */
  retire(serverPlayer: ServerPlayer): ChangeSet {
    let highScore = HighScore.newHighScore(serverPlayer);
    let cs = new ChangeSet()._ChangeSet$();
    serverPlayer.csWithdraw(cs, null, null);
    this.getGame().sendToOthers(serverPlayer, cs);
    cs.addAttribute(ChangeSet$See.only(serverPlayer), 'highScore', String(highScore));
    return cs;
  }
  /**
   * Scout a native settlement, that is, the contacting action
   * that generates the greeting dialog.
   *
   * @param serverPlayer The {@code ServerPlayer} that is scouting.
   * @param unit The scout {@code Unit}.
   * @param is The {@code IndianSettlement} to scout.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  scoutIndianSettlement(serverPlayer: ServerPlayer, unit: ServerUnit, is$: IndianSettlement): ChangeSet {
    let owner = is$.getOwner();
    let cs = new ChangeSet()._ChangeSet$();
    let tile = is$.getTile$();
    tile.updateIndianSettlement(serverPlayer);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [tile]);
    cs.add$See$Message(ChangeSet$See.only(serverPlayer), new NationSummaryMessage()._NationSummaryMessage$Player$NationSummary(owner, new NationSummary()._NationSummary$Player$Player(owner, serverPlayer)));
    return cs;
  }
  /**
   * Speak to the chief at a native settlement.
   *
   * @param serverPlayer The {@code ServerPlayer} that is scouting.
   * @param sUnit The scout {@code ServerUnit}.
   * @param is The {@code IndianSettlement} to scout.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  scoutSpeakToChief(serverPlayer: ServerPlayer, sUnit: ServerUnit, is$: IndianSettlement): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    let tile = is$.getTile$();
    let tileDirty = is$.setVisited(serverPlayer);
    let result: string;
    let tension = is$.getAlarm$Player(serverPlayer);
    if (tension.getLevel() === Tension$Level.HATEFUL) {
      let loc = sUnit.getLocation();
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps().always(serverPlayer), [loc]);
      sUnit.csRemove(ChangeSet$See.perhaps().always(serverPlayer), loc, cs);
      serverPlayer.invalidateCanSeeTiles();
      result = 'die';
    } else {
      let scoutTypes = this.getGame().getSpecification().getUnitTypesWithAbility([Ability.EXPERT_SCOUT]);
      let scoutSkill = CollectionUtils.first$Collection(scoutTypes);
      let radius = sUnit.getLineOfSight();
      let skill = is$.getLearnableSkill();
      let rnd = RandomUtils.randomInt(InGameController.logger, 'scouting', this.random, 10);
      if (is$.hasAnyScouted()) {
        result = 'nothing';
      } else if (scoutSkill != null && sUnit.getType() !== scoutSkill && ((skill != null && skill.hasAbility$String(Ability.EXPERT_SCOUT)) || rnd === 0)) {
        sUnit.changeType(scoutSkill);
        serverPlayer.invalidateCanSeeTiles();
        result = 'expert';
      } else {
        let gifts = is$.getType().getGifts();
        let gold = (gifts == null) ? 0 : gifts.getAmount('Base beads amount', this.random, true);
        if (gold <= 0 || rnd <= 3) {
          radius = Math.max(radius, IndianSettlement.TALES_RADIUS);
          result = 'tales';
        } else {
          if (sUnit.hasAbility$String(Ability.EXPERT_SCOUT)) {
            gold = $J.idiv((Math.imul(gold, 11)), 10);
          }
          serverPlayer.modifyGold(gold);
          is$.getOwner().modifyGold(-gold);
          result = String(gold);
          cs.addPartial(ChangeSet$See.only(serverPlayer), serverPlayer, ['gold', String(serverPlayer.getGold()), 'score', String(serverPlayer.getScore())]);
        }
      }
      sUnit.csVisit(serverPlayer, is$, 1, cs);
      tileDirty = true;
      let tiles = CollectionUtils.transform$Collection$Predicate$Function$Collector(tile.getSurroundingTiles$int$int(1, radius), (t) => !serverPlayer.canSee(t) && (t.isLand() || t.isShore()), JFunction.identity(), Collectors.toSet());
      cs.add$See$Collection(ChangeSet$See.only(serverPlayer), serverPlayer.exploreTiles(tiles));
      sUnit.setMovesLeft(0);
      if ($J.equals('expert', result)) {
        cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [sUnit]);
      } else {
        cs.addPartial(ChangeSet$See.only(serverPlayer), sUnit, ['movesLeft', String(sUnit.getMovesLeft())]);
      }
    }
    if (tileDirty) {
      tile.updateIndianSettlement(serverPlayer);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [tile]);
    }
    cs.add$See$Message(ChangeSet$See.only(serverPlayer), new ScoutSpeakToChiefMessage()._ScoutSpeakToChiefMessage$Unit$IndianSettlement$String(sUnit, is$, result));
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Sell goods in Europe.
   *
   * @param serverPlayer The {@code ServerPlayer} that is selling.
   * @param type The {@code GoodsType} to sell.
   * @param amount The amount of goods to sell.
   * @param carrier The {@code Unit} carrying the goods.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  sellGoods(serverPlayer: ServerPlayer, type$: GoodsType, amount: number, carrier: Unit): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    let container = carrier.getGoodsContainer();
    container.saveState();
    if (serverPlayer.canTrade$GoodsType$Access(type$, Market$Access.EUROPE)) {
      let gold = serverPlayer.getGold();
      let sellAmount = serverPlayer.sellInEurope(this.random, container, type$, amount);
      if (sellAmount < 0) {
        return serverPlayer.clientError$String('Player ' + serverPlayer.getName() + ' tried to sell ' + amount + ' ' + type$.getSuffix$());
      }
      serverPlayer.csFlushMarket$GoodsType$ChangeSet(type$, cs);
      cs.addPartial(ChangeSet$See.only(serverPlayer), serverPlayer, ['gold', String(serverPlayer.getGold())]);
      InGameController.logger.finest($J.str(carrier) + ' sold ' + amount + '(' + sellAmount + ') ' + type$.getSuffix$() + ' in Europe for ' + ((serverPlayer.getGold() - gold) | 0));
    } else {
      GoodsLocation.moveGoods(carrier, type$, amount, null);
      InGameController.logger.finest($J.str(carrier) + ' dumped ' + amount + ' ' + type$.getSuffix$() + ' in Europe');
    }
    carrier.setMovesLeft(0);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [carrier]);
    return cs;
  }
  /**
   * Set build queue.
   *
   * @param serverPlayer The {@code ServerPlayer} that owns the colony.
   * @param colony The {@code Colony} to set the queue of.
   * @param queue The new build queue.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  setBuildQueue(serverPlayer: ServerPlayer, colony: Colony, queue: List<BuildableType>): ChangeSet {
    let current = colony.getCurrentlyBuilding();
    colony.setBuildQueue(queue);
    if (this.getGame().getSpecification().getBoolean(GameOptions.CLEAR_HAMMERS_ON_CONSTRUCTION_SWITCH) && current != null && current !== colony.getCurrentlyBuilding()) {
      for (const $it26 = (CollectionUtils.transform$Stream$Predicate(current.getRequiredGoods$(), (g) => !g.getType().isStorable())).iterator(); $it26.hasNext(); ) {
        let ag = $it26.next();
        colony.removeGoods$GoodsType(ag.getType());
      }
    }
    colony.invalidateCache();
    let cs = new ChangeSet()._ChangeSet$();
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [colony]);
    return cs;
  }
  /**
   * Set a unit stop.
   *
   * @param serverPlayer The {@code ServerPlayer} that owns the unit.
   * @param unit The {@code Unit} to set the destination for.
   * @param index The stop index.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  setCurrentStop(serverPlayer: ServerPlayer, unit: Unit, index: number): ChangeSet {
    let tr = unit.getTradeRoute();
    if (tr == null) {
      return serverPlayer.clientError$String('Unit has no trade route to set stop for.');
    } else if (index < 0 || index >= tr.getStopCount()) {
      return serverPlayer.clientError$String('Stop index out of range [0..' + tr.getStopCount() + ']: ' + index);
    }
    unit.setCurrentStop(index);
    return new ChangeSet()._ChangeSet$().add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [unit]);
  }
  /**
   * Set a unit destination.
   *
   * @param serverPlayer The {@code ServerPlayer} that owns the unit.
   * @param unit The {@code Unit} to set the destination for.
   * @param destination The {@code Location} to set as destination.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  setDestination(serverPlayer: ServerPlayer, unit: Unit, destination: Location): ChangeSet {
    if (unit.getTradeRoute() != null) {
      if (destination == null && unit.isAtSea()) {
        destination = unit.getStop().getLocation();
      }
      unit.setTradeRoute(null);
    }
    unit.setDestination(destination);
    return new ChangeSet()._ChangeSet$().add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [unit]);
  }
  /**
   * Set goods levels.
   *
   * @param serverPlayer The {@code ServerPlayer} that owns the colony.
   * @param colony The {@code Colony} to set the goods levels in.
   * @param exportData The new {@code ExportData}.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  setGoodsLevels(serverPlayer: ServerPlayer, colony: Colony, exportData: ExportData): ChangeSet {
    colony.setExportData$ExportData(exportData);
    return new ChangeSet()._ChangeSet$().add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [colony]);
  }
  /**
   * Set land name.
   *
   * @param serverPlayer The {@code ServerPlayer} who landed.
   * @param unit The {@code Unit} that has come ashore.
   * @param name The new land name.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  setNewLandName(serverPlayer: ServerPlayer, unit: Unit, name: string): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    serverPlayer.setNewLandName(name);
    cs.addPartial(ChangeSet$See.only(serverPlayer), serverPlayer, ['newLandName', name]);
    let turn = serverPlayer.getGame().getTurn();
    let h = new HistoryEvent()._HistoryEvent$Turn$HistoryEventType$Player(turn, HistoryEvent$HistoryEventType.DISCOVER_NEW_WORLD, serverPlayer).addName$String$String('%name%', name);
    cs.addHistory(serverPlayer, h);
    return cs;
  }
  /**
   * Set region name.
   *
   * @param serverPlayer The {@code ServerPlayer} discovering.
   * @param unit The {@code Unit} that is discovering.
   * @param region The {@code Region} to discover.
   * @param name The new region name.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  setNewRegionName(serverPlayer: ServerPlayer, unit: Unit, region: Region, name: string): ChangeSet {
    let game = this.getGame();
    let serverRegion = region;
    if (!Utils.equals(region.getDiscoverer(), unit.getId())) {
      return serverPlayer.clientError$String('Discoverer mismatch, ' + region.getDiscoverer() + ' expected, ' + unit.getId() + ' provided.');
    }
    let cs = new ChangeSet()._ChangeSet$();
    serverRegion.csDiscover(serverPlayer, unit, game.getTurn(), name, cs);
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  /**
   * Spy on a settlement.
   *
   * @param serverPlayer The {@code ServerPlayer} that is spying.
   * @param unit The {@code Unit} that is spying.
   * @param settlement The {@code Settlement} to spy on.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  spySettlement(serverPlayer: ServerPlayer, unit: Unit, settlement: Settlement): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    InGameController.logger.info('Spy settlement for ' + unit.getId() + ' at ' + settlement.getId() + '(' + settlement.getName() + ')');
    cs.addSpy(unit, settlement);
    unit.setMovesLeft(0);
    cs.addPartial(ChangeSet$See.only(serverPlayer), unit, ['movesLeft', String(unit.getMovesLeft())]);
    return cs;
  }
  /**
   * Train a unit in Europe.
   *
   * @param serverPlayer The {@code ServerPlayer} that is demanding.
   * @param type The {@code UnitType} to train.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  trainUnitInEurope(serverPlayer: ServerPlayer, type$: UnitType): ChangeSet {
    let europe = serverPlayer.getEurope();
    if (europe == null) {
      return serverPlayer.clientError$String('No Europe to train in.');
    }
    let price = europe.getUnitPrice(type$);
    if (price <= 0) {
      return serverPlayer.clientError$String('Bogus price: ' + price);
    } else if (!serverPlayer.checkGold(price)) {
      return serverPlayer.clientError$String('Not enough gold (' + serverPlayer.getGold() + ' < ' + price + ') to train ' + $J.str(type$));
    }
    if (!type$.isAvailableTo([serverPlayer])) {
      return serverPlayer.clientError$String('Unit type is not available for the player.');
    }
    let game = this.getGame();
    let spec = game.getSpecification();
    let role = (spec.getBoolean(GameOptions.EQUIP_EUROPEAN_RECRUITS)) ? type$.getDefaultRole() : spec.getDefaultRole();
    let unit = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType$Role(game, europe, serverPlayer, type$, role);
    unit.setName(serverPlayer.getNameForUnit(type$, this.random));
    serverPlayer.modifyGold(-price);
    (europe).increasePrice(type$, price);
    let cs = new ChangeSet()._ChangeSet$();
    cs.addPartial(ChangeSet$See.only(serverPlayer), serverPlayer, ['gold', String(serverPlayer.getGold())]);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [europe]);
    return cs;
  }
  /**
   * Unload goods.
   *
   * @param serverPlayer The {@code ServerPlayer} that is unloading.
   * @param goodsType The {@code GoodsType} to unload.
   * @param amount The amount of goods to unload.
   * @param carrier The {@code Unit} to unload.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  unloadGoods(serverPlayer: ServerPlayer, goodsType: GoodsType, amount: number, carrier: Unit): ChangeSet {
    if (carrier.getGoodsCount(goodsType) < amount) {
      return serverPlayer.clientError$String('Too few goods');
    }
    if (carrier.isInEurope()) {
      return this.sellGoods(serverPlayer, goodsType, amount, carrier);
    }
    let cs = new ChangeSet()._ChangeSet$();
    let settlement = carrier.getSettlement();
    if (settlement != null) {
      GoodsLocation.moveGoods(carrier, goodsType, amount, settlement);
      InGameController.logger.finest($J.str(carrier) + ' unloaded ' + amount + ' ' + goodsType.getSuffix$() + ' to ' + settlement.getName());
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [settlement.getGoodsContainer()]);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [carrier.getGoodsContainer()]);
      if (carrier.getInitialMovesLeft() !== carrier.getMovesLeft()) {
        carrier.setMovesLeft(0);
        cs.addPartial(ChangeSet$See.only(serverPlayer), carrier, ['movesLeft', String(carrier.getMovesLeft())]);
      }
    } else {
      GoodsLocation.moveGoods(carrier, goodsType, amount, null);
      InGameController.logger.finest($J.str(carrier) + ' dumped ' + amount + ' ' + goodsType.getSuffix$() + ' to ' + $J.str(carrier.getLocation()));
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [carrier.getLocation()]);
      this.getGame().sendToOthers(serverPlayer, cs);
    }
    return cs;
  }
  /**
   * Update a trade route for a player.
   *
   * @param serverPlayer The {@code ServerPlayer} to set trade
   *     routes for.
   * @param tradeRoute An uninterned {@code TradeRoute} to update.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  updateTradeRoute(serverPlayer: ServerPlayer, tradeRoute: TradeRoute): ChangeSet {
    let game = this.getGame();
    let name: string;
    let fail: StringTemplate;
    let tr: TradeRoute;
    if (tradeRoute == null || tradeRoute.getId() == null || (name = tradeRoute.getName()) == null) {
      return serverPlayer.clientError$String('Bogus route');
    } else if ((fail = tradeRoute.verify()) != null) {
      return serverPlayer.clientError$String(Messages.message$StringTemplate(fail));
    } else if ((tr = game.getFreeColGameObject$String$Class(tradeRoute.getId(), $J.cls(TradeRoute))) == null) {
      return serverPlayer.clientError$String('Not an existing trade route: ' + tradeRoute.getId());
    }
    tr.copyIn(tradeRoute);
    return new ChangeSet()._ChangeSet$().add$See$FreeColGameObjectArr(ChangeSet$See.only(serverPlayer), [tr]);
  }
  /**
   * Change work location.
   *
   * @param serverPlayer The {@code ServerPlayer} that owns the unit.
   * @param unit The {@code Unit} to change the work location of.
   * @param workLocation The {@code WorkLocation} to change to.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  work(serverPlayer: ServerPlayer, unit: Unit, workLocation: WorkLocation): ChangeSet {
    let spec = this.getGame().getSpecification();
    let colony = workLocation.getColony();
    colony.getGoodsContainer().saveState();
    let cs = new ChangeSet()._ChangeSet$();
    let tile = workLocation.getWorkTile();
    if (tile != null && tile.getOwningSettlement() !== colony) {
      serverPlayer.csClaimLand(tile, colony, 0, cs);
    }
    colony.equipForRole(unit, spec.getDefaultRole(), 0);
    let uc = unit.getUnitChange$String(UnitChangeType.ENTER_COLONY);
    if (uc != null && uc.appliesTo(unit)) {
      unit.changeType(uc.to);
    }
    if (!unit.isInColony()) {
      unit.getColony().getTile$().cacheUnseen$();
    }
    unit.setLocation(workLocation);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [colony.getTile$()]);
    this.getGame().sendToOthers(serverPlayer, cs);
    return cs;
  }
  static $clinit() {
    InGameController.logger = Logger.getLogger($J.cls(InGameController).getName());
    InGameController.coronadoPred = (p) => p.hasAbility$String(Ability.SEE_ALL_COLONIES);
  }
}

$J.define(InGameController, 'net.sf.freecol.server.control.InGameController', { kind: 'class', sup: 'net.sf.freecol.server.control.Controller', ctors: { 'net.sf.freecol.server.FreeColServer': '_InGameController' }, returns: { 'getSkippedTurns': 'int', 'getTimeout': 'long' }, meths: { 'diplomacy(net.sf.freecol.server.model.ServerPlayer,net.sf.freecol.common.model.Colony,net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.DiplomaticTrade)': 'diplomacy$ServerPlayer$Colony$Unit$DiplomaticTrade', 'diplomacy(net.sf.freecol.server.model.ServerPlayer,net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Colony,net.sf.freecol.common.model.DiplomaticTrade)': 'diplomacy$ServerPlayer$Unit$Colony$DiplomaticTrade', 'debugChangeOwner(net.sf.freecol.server.model.ServerUnit,net.sf.freecol.server.model.ServerPlayer)': 'debugChangeOwner$ServerUnit$ServerPlayer', 'debugChangeOwner(net.sf.freecol.server.model.ServerColony,net.sf.freecol.server.model.ServerPlayer)': 'debugChangeOwner$ServerColony$ServerPlayer' }, clinit: true, lazy: ['logger', 'coronadoPred'] });
$J.module(() => {
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractUnit = $J.load('net.sf.freecol.common.model.AbstractUnit');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Constants$IndianDemandAction = $J.load('net.sf.freecol.common.model.Constants$IndianDemandAction');
  DiplomaticTrade$TradeStatus = $J.load('net.sf.freecol.common.model.DiplomaticTrade$TradeStatus');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  Europe$MigrationType = $J.load('net.sf.freecol.common.model.Europe$MigrationType');
  GoodsLocation = $J.load('net.sf.freecol.common.model.GoodsLocation');
  HighScore = $J.load('net.sf.freecol.common.model.HighScore');
  HistoryEvent = $J.load('net.sf.freecol.common.model.HistoryEvent');
  HistoryEvent$HistoryEventType = $J.load('net.sf.freecol.common.model.HistoryEvent$HistoryEventType');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  Market$Access = $J.load('net.sf.freecol.common.model.Market$Access');
  ModelMessage = $J.load('net.sf.freecol.common.model.ModelMessage');
  ModelMessage$MessageType = $J.load('net.sf.freecol.common.model.ModelMessage$MessageType');
  Monarch$MonarchAction = $J.load('net.sf.freecol.common.model.Monarch$MonarchAction');
  Nation = $J.load('net.sf.freecol.common.model.Nation');
  NationSummary = $J.load('net.sf.freecol.common.model.NationSummary');
  NativeTrade$NativeTradeAction = $J.load('net.sf.freecol.common.model.NativeTrade$NativeTradeAction');
  Player = $J.load('net.sf.freecol.common.model.Player');
  Player$PlayerType = $J.load('net.sf.freecol.common.model.Player$PlayerType');
  Settlement = $J.load('net.sf.freecol.common.model.Settlement');
  Stance = $J.load('net.sf.freecol.common.model.Stance');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Tension = $J.load('net.sf.freecol.common.model.Tension');
  Tension$Level = $J.load('net.sf.freecol.common.model.Tension$Level');
  TileImprovement = $J.load('net.sf.freecol.common.model.TileImprovement');
  TradeRoute = $J.load('net.sf.freecol.common.model.TradeRoute');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$UnitLabelType = $J.load('net.sf.freecol.common.model.Unit$UnitLabelType');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  UnitChangeType = $J.load('net.sf.freecol.common.model.UnitChangeType');
  UnitLocation$NoAddReason = $J.load('net.sf.freecol.common.model.UnitLocation$NoAddReason');
  ChangeSet = $J.load('net.sf.freecol.common.networking.ChangeSet');
  ChangeSet$See = $J.load('net.sf.freecol.common.networking.ChangeSet$See');
  ChatMessage = $J.load('net.sf.freecol.common.networking.ChatMessage');
  GameEndedMessage = $J.load('net.sf.freecol.common.networking.GameEndedMessage');
  GameStateMessage = $J.load('net.sf.freecol.common.networking.GameStateMessage');
  HighScoresMessage = $J.load('net.sf.freecol.common.networking.HighScoresMessage');
  InciteMessage = $J.load('net.sf.freecol.common.networking.InciteMessage');
  IndianDemandMessage = $J.load('net.sf.freecol.common.networking.IndianDemandMessage');
  LootCargoMessage = $J.load('net.sf.freecol.common.networking.LootCargoMessage');
  MonarchActionMessage = $J.load('net.sf.freecol.common.networking.MonarchActionMessage');
  NationSummaryMessage = $J.load('net.sf.freecol.common.networking.NationSummaryMessage');
  NativeTradeMessage = $J.load('net.sf.freecol.common.networking.NativeTradeMessage');
  NewTradeRouteMessage = $J.load('net.sf.freecol.common.networking.NewTradeRouteMessage');
  ScoutSpeakToChiefMessage = $J.load('net.sf.freecol.common.networking.ScoutSpeakToChiefMessage');
  SetCurrentPlayerMessage = $J.load('net.sf.freecol.common.networking.SetCurrentPlayerMessage');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  RandomChoice = $J.load('net.sf.freecol.common.util.RandomChoice');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
  DiplomacySession = $J.load('net.sf.freecol.server.model.DiplomacySession');
  LootSession = $J.load('net.sf.freecol.server.model.LootSession');
  MonarchSession = $J.load('net.sf.freecol.server.model.MonarchSession');
  NativeDemandSession = $J.load('net.sf.freecol.server.model.NativeDemandSession');
  NativeTradeSession = $J.load('net.sf.freecol.server.model.NativeTradeSession');
  ServerColony = $J.load('net.sf.freecol.server.model.ServerColony');
  ServerIndianSettlement = $J.load('net.sf.freecol.server.model.ServerIndianSettlement');
  ServerPlayer$DeadCheck = $J.load('net.sf.freecol.server.model.ServerPlayer$DeadCheck');
  ServerUnit = $J.load('net.sf.freecol.server.model.ServerUnit');
  Session = $J.load('net.sf.freecol.server.model.Session');
});
