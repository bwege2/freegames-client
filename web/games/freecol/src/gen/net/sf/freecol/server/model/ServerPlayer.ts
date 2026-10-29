// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/model/ServerPlayer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, ClassCastException, Collections, Collectors, EnumMap, HashMap, HashSet, IOException, IllegalStateException, JEnum, JFunction, JString, Level, Logger, RuntimeException, StringBuilder, XMLStreamException } from '../../../../../../jre/index.ts';
import { Player } from '../../common/model/Player.ts';

let FreeCol, FreeColException, FreeColDebugger, Messages, NameCache, Ability, AbstractGoods, AbstractUnit, Colony, CombatModel$CombatEffectType, Constants, Constants$IndianDemandAction, DiplomaticTrade, DiplomaticTrade$TradeContext, DiplomaticTrade$TradeStatus, Disaster, Disaster$Effects, Effect, Europe$MigrationType, FoundingFather$FoundingFatherType, GoodsContainer, HistoryEvent, HistoryEvent$HistoryEventType, IndianSettlement, Market, ModelMessage, ModelMessage$MessageType, Modifier, Monarch, Monarch$MonarchAction, Player$PlayerType, Specification, Stance, StringTemplate, Tension, TradeRoute, Unit, Unit$UnitState, UnitChangeType, GoalDeciders, ChangeSet$See, ChooseFoundingFatherMessage, FirstContactMessage, IndianDemandMessage, LootCargoMessage, MonarchActionMessage, SetDeadMessage, GameOptions, IntegerOption, CollectionUtils, LogBuilder, RandomChoice, RandomUtils, DiplomacySession, LootSession, MonarchSession, ServerEurope, ServerIndianSettlement, ServerUnit;

/**
 * A {@code Player} with additional (server specific) information, notably
 * this player's {@link Connection}.
 */
export class ServerPlayer extends Player {
  static logger: Logger = null;
  static readonly ALARM_RADIUS: number = 2;
  static readonly ALARM_TILE_IN_USE: number = 2;
  static readonly SCORE_SETTLEMENT_DESTROYED: number = -5;
  static readonly SCORE_NATION_DESTROYED: number = -50;
  static readonly SCORE_GOLD: number = 0.001;
  static readonly SCORE_FOUNDING_FATHER: number = 5;
  static readonly SCORE_INDEPENDENCE_BONUS_FIRST: number = 100;
  static readonly SCORE_INDEPENDENCE_BONUS_SECOND: number = 50;
  static readonly SCORE_INDEPENDENCE_BONUS_THIRD: number = 25;
  /**
   * The connection for this player.
   */
  connection: Connection = null;
  /**
   * Remaining emigrants to select due to a fountain of youth
   */
  remainingEmigrants: number = 0;
  /**
   * Players with respect to which stance has changed.
   */
  stanceDirty: List<Player> = null;
  /**
   * Accumulate extra trades here.
   */
  extraTrades: List<AbstractGoods> = null;
  $init_ServerPlayer() {
    this.remainingEmigrants = 0;
    this.stanceDirty = new ArrayList();
    this.extraTrades = new ArrayList();
  }
  /**
   * Trivial constructor for Game.newInstance.
   *
   * @param game The {@code Game} this object belongs to.
   * @param id The object identifier.
   */
  _ServerPlayer$Game$String(game: Game, id: string): this {
    this._Player$Game$String(game, id);
    this.$init_ServerPlayer();
    return this;
  }
  /**
   * Special constructor to make a simple stub player with only the
   * connection information valid.  Needed when a new player logs in.
   *
   * @param game The {@code Game} this player belongs to.
   * @param connection The initial {@code Connection}.
   */
  _ServerPlayer$Game$Connection(game: Game, connection: Connection): this {
    this._Player$Game(game);
    this.$init_ServerPlayer();
    this.setConnection(connection);
    return this;
  }
  /**
   * Creates a new ServerPlayer.
   *
   * @param game The {@code Game} this object belongs to.
   * @param admin Whether the player is the game administrator or not.
   * @param nation The nation of the {@code Player}.
   */
  _ServerPlayer$Game$boolean$Nation(game: Game, admin: boolean, nation: Nation): this {
    this._Player$Game(game);
    this.$init_ServerPlayer();
    this.setConnection(null);
    this.initialize(game, admin, nation);
    return this;
  }
  /**
   * Complete initialization for this server player.
   *
   * Used above and for the stub players created at login.
   *
   * @param game The {@code Game} this object belongs to.
   * @param admin Whether the player is the game administrator or not.
   * @param nation The nation for this player.
   */
  initialize(game: Game, admin: boolean, nation: Nation): void {
    if (nation == null) {
      throw new RuntimeException('Null nation: ' + $J.str(this));
    }
    this.name = nation.getRulerName();
    this.admin = admin;
    this.nationId = nation.getId();
    this.immigration = 0;
    if (nation.isUnknownEnemy()) {
      this.nationType = null;
      this.playerType = Player$PlayerType.COLONIAL;
      this.europe = null;
      this.monarch = null;
      this.gold = 0;
      this.setAI(true);
      this.setReady(true);
    } else if (nation.getType() != null) {
      this.nationType = nation.getType();
      this.addFeatures(this.nationType);
      if (this.nationType.isEuropean()) {
        this.playerType = (this.nationType.isREF()) ? Player$PlayerType.ROYAL : Player$PlayerType.COLONIAL;
        this.europe = new ServerEurope()._ServerEurope$Game$Player(game, this);
        this.initializeHighSeas();
        if (this.playerType === Player$PlayerType.COLONIAL) {
          this.monarch = new Monarch()._Monarch$Game$Player(game, this);
          let spec = game.getSpecification();
          this.immigration = spec.getInteger(GameOptions.PLAYER_IMMIGRATION_BONUS);
        }
        this.gold = 0;
      } else {
        this.playerType = Player$PlayerType.NATIVE;
        this.gold = Player.GOLD_NOT_ACCOUNTED;
      }
    } else {
      throw new RuntimeException('Bogus nation: ' + $J.str(nation));
    }
    this.market = new Market()._Market$Game$Player(this.getGame(), this);
    this.liberty = 0;
    this.currentFather = null;
  }
  /**
   * {@inheritDoc}
   */
  getConnection(): Connection {
    return this.connection;
  }
  /**
   * {@inheritDoc}
   */
  setConnection(connection: Connection): void {
    this.connection = connection;
  }
  /**
   * {@inheritDoc}
   */
  send(cs: ChangeSet): boolean {
    if (!this.isConnected()) {
      return false;
    }
    try {
      this.connection.request(cs.build(this));
    } catch ($e0) {
      if ($J.isa($e0, FreeColException) || $J.isa($e0, IOException) || $J.isa($e0, XMLStreamException)) {
        let ex = $J.exc($e0);
        ServerPlayer.logger.log(Level.WARNING, 'send fail', ex);
        return false;
      } else {
        throw $e0;
      }
    }
    return true;
  }
  /**
   * Update the current father.
   *
   * @param ff The {@code FoundingFather} to recruit.
   */
  updateCurrentFather(ff: FoundingFather): void {
    this.setCurrentFather(ff);
    this.clearOfferedFathers();
    if (ff != null) {
      ServerPlayer.logger.finest(this.getId() + ' is recruiting ' + ff.getId() + ' in ' + $J.str(this.getGame().getTurn()));
    }
  }
  /**
   * Get a new trade route.
   *
   * @return The new {@code TradeRoute}.
   */
  newTradeRoute(): TradeRoute {
    let route = new TradeRoute()._TradeRoute$Game$String$Player(this.getGame(), this.getNameForTradeRoute(), this);
    this.addTradeRoute(route);
    return route;
  }
  /**
   * Accumulate extra trades.
   *
   * @param ag The {@code AbstractGoods} describing the sale.
   */
  addExtraTrade(ag: AbstractGoods): void {
    this.extraTrades.add(ag);
  }
  /**
   * Flush the extra trades.
   *
   * @param random A pseudo-random number source.
   */
  flushExtraTrades(random: Random): void {
    while (!this.extraTrades.isEmpty()) {
      let ag = this.extraTrades.removeAt(0);
      this.propagateToEuropeanMarkets(ag.getType(), ag.getAmount(), random);
    }
  }
  /**
   * Performs initial randomizations for this player.
   *
   * @param random A pseudo-random number source.
   */
  randomizeGame(random: Random): void {
    if (!this.isEuropean() || this.isREF() || this.isUnknownEnemy()) {
      return;
    }
    let spec = this.getGame().getSpecification();
    let i0 = spec.getInteger(GameOptions.INITIAL_IMMIGRATION);
    this.immigrationRequired = $J.d2i(this.apply$float$Turn$String(Math.fround(i0), null, Modifier.RELIGIOUS_UNREST_BONUS));
    this.modifyGold(spec.getInteger(GameOptions.STARTING_MONEY));
    (this.getEurope()).initializeMigration(random);
    let market = this.getMarket();
    let sb = new StringBuilder();
    let changed = false;
    for (const $it1 = spec.getGoodsTypeList().iterator(); $it1.hasNext(); ) {
      let type$ = $it1.next();
      let prefix = 'model.option.' + type$.getSuffix$String('model.goods.');
      if (spec.hasOption(prefix + '.minimumPrice', $J.cls(IntegerOption)) && spec.hasOption(prefix + '.maximumPrice', $J.cls(IntegerOption))) {
        let min = spec.getInteger(prefix + '.minimumPrice');
        let max = spec.getInteger(prefix + '.maximumPrice');
        if (max < min) {
          let bad = min;
          min = max;
          max = bad;
        } else if (max === min) {
          continue;
        }
        let add = RandomUtils.randomInt(ServerPlayer.logger, type$.getId() + ' initial price', random, (max - min) | 0);
        if (add > 0) {
          market.setInitialPrice(type$, (min + add) | 0);
          market.update(type$);
          market.flushPriceChange(type$);
          sb.append(', ').append(type$.getId()).append(' -> ').append(String((min + add) | 0));
          changed = true;
        }
      }
    }
    if (changed) {
      ServerPlayer.logger.finest('randomizeGame(' + this.getId() + ') initial prices: ' + sb.toString().substring(2));
    }
  }
  /**
   * Checks if this player has died.
   *
   * @return The appropriate {@code DeadCheck} value.
   */
  checkForDeath(): ServerPlayer$DeadCheck {
    if (this.isUnknownEnemy()) {
      return ServerPlayer$DeadCheck.IS_ALIVE;
    }
    let spec = this.getGame().getSpecification();
    switch (this.getPlayerType()) {
      case Player$PlayerType.NATIVE:
      case Player$PlayerType.UNDEAD:
        return (this.getUnitCount$() === 0) ? ServerPlayer$DeadCheck.IS_DEAD : ServerPlayer$DeadCheck.IS_ALIVE;
      case Player$PlayerType.COLONIAL:
        break;
      case Player$PlayerType.REBEL:
      case Player$PlayerType.INDEPENDENT:
        return (this.getNumberOfPorts() > 0) ? ServerPlayer$DeadCheck.IS_ALIVE : ServerPlayer$DeadCheck.IS_DEAD;
      case Player$PlayerType.ROYAL:
        return (this.checkForREFDefeat()) ? ServerPlayer$DeadCheck.IS_DEFEATED : ServerPlayer$DeadCheck.IS_ALIVE;
      default:
        throw new RuntimeException('Bogus player type: ' + $J.str(this.getPlayerType()));
    }
    if (CollectionUtils.any$Stream(this.getColonies())) {
      return ServerPlayer$DeadCheck.IS_ALIVE;
    }
    if (!this.isAI() && FreeColDebugger.getDebugRunTurns() >= 0) {
      return ServerPlayer$DeadCheck.IS_ALIVE;
    }
    let hasCarrier = false;
    let hasColonist = false;
    let hasEmbarked = false;
    let hasGoods = false;
    for (const $it2 = this.getUnitSet().iterator(); $it2.hasNext(); ) {
      let unit = $it2.next();
      if (unit.isCarrier()) {
        if (unit.hasGoodsCargo()) {
          hasGoods = true;
        }
        hasCarrier = true;
        continue;
      }
      if (!unit.isColonist() && !unit.isOffensiveUnit()) {
        continue;
      }
      hasColonist = true;
      let carrier: Unit;
      if ((carrier = unit.getCarrier()) != null) {
        if (carrier.hasTile()) {
          ServerPlayer.logger.info(this.getName() + ' alive, unit ' + unit.getId() + ' (embarked) on map.');
          return ServerPlayer$DeadCheck.IS_ALIVE;
        }
        hasEmbarked = true;
      }
      if (unit.hasTile() && !unit.isInMission()) {
        ServerPlayer.logger.info(this.getName() + ' alive, unit ' + unit.getId() + ' on map.');
        return ServerPlayer$DeadCheck.IS_ALIVE;
      }
    }
    let mandatory = spec.getInteger(GameOptions.MANDATORY_COLONY_YEAR);
    if (this.getGame().getTurn().getYear() >= mandatory) {
      ServerPlayer.logger.info(this.getName() + ' dead, no presence >= ' + mandatory);
      return ServerPlayer$DeadCheck.IS_DEAD;
    }
    if (hasEmbarked) {
      ServerPlayer.logger.info(this.getName() + ' alive, has embarked unit.');
      return ServerPlayer$DeadCheck.IS_ALIVE;
    } else if (hasGoods) {
      ServerPlayer.logger.info(this.getName() + ' alive, has cargo.');
      return ServerPlayer$DeadCheck.IS_ALIVE;
    }
    let europe = this.getEurope();
    let unitPricer = (ut) => {
      let p = europe.getUnitPrice(ut);
      return (p === Constants.UNDEFINED) ? 2147483647 : p;
    };
    let goldNeeded = 0;
    if (!hasCarrier) {
      let price = (europe == null) ? 2147483647 : CollectionUtils.min$Collection$ToIntFunction(spec.getUnitTypesWithAbility([Ability.NAVAL_UNIT]), unitPricer);
      if (price === 2147483647 || !this.checkGold(price)) {
        ServerPlayer.logger.info(this.getName() + ' dead, can not buy carrier.');
        return ServerPlayer$DeadCheck.IS_DEAD;
      }
      goldNeeded = (goldNeeded + price) | 0;
    }
    if (hasColonist) {
      ServerPlayer.logger.info(this.getName() + ' alive, has waiting colonist.');
      return ServerPlayer$DeadCheck.IS_ALIVE;
    } else if (europe == null) {
      ServerPlayer.logger.info(this.getName() + ' dead, can not recruit.');
      return ServerPlayer$DeadCheck.IS_DEAD;
    }
    let price = Math.min(europe.getCurrentRecruitPrice(), CollectionUtils.min$Collection$ToIntFunction(spec.getUnitTypesWithAbility([Ability.FOUND_COLONY]), unitPricer));
    goldNeeded = (goldNeeded + price) | 0;
    if (this.checkGold(goldNeeded)) {
      ServerPlayer.logger.info(this.getName() + ' alive, can buy colonist.');
      return ServerPlayer$DeadCheck.IS_ALIVE;
    }
    ServerPlayer.logger.info(this.getName() + ' survives by autorecruit.');
    return ServerPlayer$DeadCheck.IS_AUTORECRUIT;
  }
  /**
   * Check if a REF player has been defeated and should surrender.
   *
   * @return True if this REF player has been defeated.
   */
  checkForREFDefeat(): boolean {
    if (!this.isREF()) {
      return false;
    }
    if (this.getRebels().isEmpty()) {
      return false;
    }
    if (this.hasSettlements()) {
      return false;
    }
    let naval = 0;
    let land = 0;
    let landOnMap = 0;
    for (const $it3 = this.getUnitSet().iterator(); $it3.hasNext(); ) {
      let u = $it3.next();
      if (u.isNaval()) {
        naval++;
      } else {
        land++;
        if (u.isOnTile()) {
          landOnMap++;
        }
      }
    }
    let refLandPower = 1.5 * this.calculateStrength(false);
    for (const $it4 = this.getRebels().iterator(); $it4.hasNext(); ) {
      let r = $it4.next();
      let rebelLandPower = r.calculateStrength(false);
      if (rebelLandPower < refLandPower) {
        return false;
      }
      ServerPlayer.logger.fine('REF in trouble wrt ' + r.getName() + ' (' + $J.dstr(refLandPower) + ' <= ' + $J.dstr(rebelLandPower) + ')');
    }
    let landREFUnitsRequired = 7;
    if (land < landREFUnitsRequired) {
      ServerPlayer.logger.info('REF surrenders due to land army collapse (' + land + ' < ' + landREFUnitsRequired + ')');
      return true;
    }
    let navalREFUnitsRequired = 2;
    if (naval < navalREFUnitsRequired) {
      ServerPlayer.logger.info('REF surrenders due to lack of naval support (' + naval + ' < ' + navalREFUnitsRequired + ')');
      return true;
    }
    return false;
  }
  /**
   * Kill off a player and clear out its remains.
   *
   * +vis: Albeit killing the player makes visibility changes moot.
   * +til: Fixes the appearance changes too.
   *
   * @param cs A {@code ChangeSet} to update.
   */
  csKill(cs: ChangeSet): void {
    let game = this.getGame();
    this.setDead(true);
    cs.addPartial(ChangeSet$See.all(), this, ['dead', $J.str(true)]);
    cs.add$See$Message(ChangeSet$See.all(), new SetDeadMessage()._SetDeadMessage$Player(this));
    for (const $it5 = game.getLivePlayerList([this]).iterator(); $it5.hasNext(); ) {
      let other = $it5.next();
      if (this.isEuropean() && other.isIndian()) {
        for (const $it6 = other.getIndianSettlementList().iterator(); $it6.hasNext(); ) {
          let is$ = $it6.next();
          let sis = is$;
          if (is$.hasMissionary$Player(this)) {
            sis.csKillMissionary(null, cs);
          }
          is$.getTile$().cacheUnseen$();
          sis.removeAlarm(this);
        }
        other.removeTension(this);
      }
      other.setStance(this, null);
    }
    let tiles = new HashSet(64);
    for (const $it7 = game.getFreeColGameObjectList().iterator(); $it7.hasNext(); ) {
      let fcgo = $it7.next();
      if (fcgo instanceof Unit) {
        let u = fcgo;
        if (u.hasTile() && !this.owns(u)) {
          let t = u.getTile$();
          cs.addRemove(ChangeSet$See.only(this), t, u);
          tiles.add(t);
        }
      }
    }
    cs.add$See$Collection(ChangeSet$See.only(this), tiles);
    let settlements = this.getSettlementList();
    while (!settlements.isEmpty()) {
      this.csDisposeSettlement(settlements.removeAt(0), cs);
    }
    tiles.clear();
    tiles.addAll(game.getMap().getTileList(CollectionUtils.matchKeyEquals$Object$Function(this, ($p0) => $p0.getOwner())));
    for (const $it8 = tiles.iterator(); $it8.hasNext(); ) {
      let t = $it8.next();
      t.cacheUnseen$();
      t.changeOwnership(null, null);
    }
    for (const $it9 = this.getUnitSet().iterator(); $it9.hasNext(); ) {
      let u = $it9.next();
      if (u.hasTile()) {
        tiles.add(u.getTile$());
      }
      (u).csRemove(ChangeSet$See.perhaps().always(this), u.getLocation(), cs);
    }
    cs.add$See$Collection(ChangeSet$See.perhaps().always(this), tiles);
    if (this.market != null) {
      this.market.dispose();
      this.market = null;
    }
    if (this.monarch != null) {
      this.monarch.dispose();
      this.monarch = null;
    }
    if (this.europe != null) {
      this.europe.dispose();
      this.europe = null;
    }
    this.currentFather = null;
    if (this.foundingFathers != null) {
      this.foundingFathers.clear();
    }
    if (this.offeredFathers != null) {
      this.offeredFathers.clear();
    }
    if (this.tradeRoutes != null) {
      this.tradeRoutes.clear();
    }
    if (this.lastSales != null) {
      this.lastSales = null;
    }
    this.featureContainer.clear();
    this.invalidateCanSeeTiles();
  }
  /**
   * Withdraw a player from the new world.
   *
   * Called from the standard endTurn processing when a player is found
   * to have died, and from the Spanish Succession routine.
   *
   * @param mm A {@code ModelMessage} explaining why the player is leaving,
   *     or null if the standard death message should be used.
   * @param he A corresponding {@code HistoryEvent}, or null if the standard
   *     death message should be used.
   * @param cs A {@code ChangeSet} to update.
   */
  csWithdraw(cs: ChangeSet, mm: ModelMessage, he: HistoryEvent): void {
    let game = this.getGame();
    if (mm == null) {
      let key = (this.isEuropean()) ? 'model.player.dead.european' : 'model.player.dead.native';
      mm = new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, key, this).addStringTemplate$String$StringTemplate('%nation%', this.getNationLabel());
    }
    if (he == null) {
      he = new HistoryEvent()._HistoryEvent$Turn$HistoryEventType$Player(game.getTurn(), HistoryEvent$HistoryEventType.NATION_DESTROYED, null).addStringTemplate$String$StringTemplate('%nation%', this.getNationLabel());
    }
    cs.addGlobalMessage(game, null, mm);
    cs.addGlobalHistory(game, he);
    this.csKill(cs);
  }
  getRemainingEmigrants(): number {
    return this.remainingEmigrants;
  }
  setRemainingEmigrants(emigrants: number): void {
    this.remainingEmigrants = emigrants;
  }
  /**
   * Checks whether the current founding father has been recruited.
   *
   * @return The new founding father, or null if none available or ready.
   */
  checkFoundingFather(): FoundingFather {
    let father = null;
    if (this.currentFather != null) {
      let extraLiberty = this.getRemainingFoundingFatherCost();
      if (extraLiberty <= 0) {
        let overflow = this.getSpecification().getBoolean(GameOptions.SAVE_PRODUCTION_OVERFLOW);
        this.setLiberty((overflow) ? -extraLiberty : 0);
        father = this.currentFather;
        this.currentFather = null;
      }
    }
    return father;
  }
  /**
   * Checks whether to start recruiting a founding father.
   *
   * @return True if a new father should be chosen.
   */
  canRecruitFoundingFather(): boolean {
    let spec = this.getGame().getSpecification();
    switch (this.getPlayerType()) {
      case Player$PlayerType.COLONIAL:
        break;
      case Player$PlayerType.REBEL:
      case Player$PlayerType.INDEPENDENT:
        if (!spec.getBoolean(GameOptions.CONTINUE_FOUNDING_FATHER_RECRUITMENT)) {
          return false;
        }
        break;
      default:
        return false;
    }
    return this.currentFather == null && this.hasSettlements() && this.getFatherCount() < spec.getFoundingFathers().size() && this.canHaveFoundingFathers();
  }
  /**
   * Build a list of random FoundingFathers, one per type.
   * Do not include any the player has or are not available.
   *
   * @param random A pseudo-random number source.
   * @return A list of FoundingFathers.
   */
  getRandomFoundingFathers(random: Random): List<FoundingFather> {
    let game = this.getGame();
    let spec = game.getSpecification();
    let age = game.getAge();
    let choices = new EnumMap($J.cls(FoundingFather$FoundingFatherType));
    for (const $it10 = (CollectionUtils.transform$Collection$Predicate(spec.getFoundingFathers(), (ff) => !this.hasFather(ff) && ff.isAvailableTo(this))).iterator(); $it10.hasNext(); ) {
      let father = $it10.next();
      let type$ = father.getType();
      let rc = choices.get(type$);
      if (rc == null) {
        rc = new ArrayList();
      }
      let weight = father.getWeight(age);
      rc.add(new RandomChoice()._RandomChoice(father, weight));
      choices.put(father.getType(), rc);
    }
    let mapper = (ft) => {
      let rc = choices.get(ft);
      return (rc == null) ? null : RandomChoice.getWeightedRandom$Logger$String$Collection$Random(ServerPlayer.logger, 'Choose founding father', rc, random);
    };
    let fathers = CollectionUtils.transform$ObjectArr$Predicate$Function$Collector(FoundingFather$FoundingFatherType.values(), CollectionUtils.alwaysTrue(), mapper, CollectionUtils.toListNoNulls());
    let lb = new LogBuilder()._LogBuilder(64);
    lb.add(['Random fathers for ', this.getDebugName(), ':']);
    for (const $it11 = fathers.iterator(); $it11.hasNext(); ) {
      let f = $it11.next();
      lb.add([' ', f.getSuffix$()]);
    }
    lb.log(ServerPlayer.logger, Level.INFO);
    return fathers;
  }
  /**
   * Add a HistoryEvent to this player.
   *
   * @param event The {@code HistoryEvent} to add.
   */
  addHistory(event: HistoryEvent): void {
    this.history.add(event);
  }
  /**
   * Update the current score for this player.
   *
   * Known incompatibility with the Col1 manual:
   * ``In addition, you get one point per liberty bell produced
   *   after foreign intervention''
   * However you are already getting a point per liberty bell
   * produced, so this implies you get no further liberty after
   * declaring independence!?, but it can then start again if the
   * foreign intervention happens (penalizing players who quickly
   * thrash the REF:-S).  Whatever this really means, it is
   * incompatible with our extensions to allow playing on (and
   * defeating other Europeans), so for now at least just leave the
   * simple liberty==score rule in place.
   *
   * @return True if the player score changed.
   */
  updateScore(): boolean {
    let oldScore = this.score;
    this.score = ((CollectionUtils.sum$Stream$ToIntFunction(this.getUnits(), ($p0) => $p0.getScoreValue())) + (CollectionUtils.sum$Stream$ToIntFunction(this.getColonies(), ($p0) => $p0.getLiberty())) + Math.imul(ServerPlayer.SCORE_FOUNDING_FATHER, CollectionUtils.count$Collection(this.getFoundingFathers()))) | 0;
    let gold = this.getGold();
    if (gold !== Player.GOLD_NOT_ACCOUNTED) {
      this.score = (this.score + $J.d2i(Math.floor(ServerPlayer.SCORE_GOLD * gold))) | 0;
    }
    let bonus = 0;
    for (const $it12 = (CollectionUtils.transform$Collection$Predicate(this.getHistory(), CollectionUtils.matchKeyEquals$Object$Function(this.getId(), ($p0) => $p0.getPlayerId()))).iterator(); $it12.hasNext(); ) {
      let h = $it12.next();
      switch (h.getEventType()) {
        case HistoryEvent$HistoryEventType.INDEPENDENCE:
          switch (h.getScore()) {
            case 0:
              bonus = ServerPlayer.SCORE_INDEPENDENCE_BONUS_FIRST;
              break;
            case 1:
              bonus = ServerPlayer.SCORE_INDEPENDENCE_BONUS_SECOND;
              break;
            case 2:
              bonus = ServerPlayer.SCORE_INDEPENDENCE_BONUS_THIRD;
              break;
            default:
              bonus = 0;
              break;
          }
          break;
        default:
          this.score = (this.score + h.getScore()) | 0;
          break;
      }
    }
    this.score = (this.score + $J.idiv((Math.imul(this.score, bonus)), 100)) | 0;
    return this.score !== oldScore;
  }
  /**
   * Checks if this {@code Player} has explored the given
   * {@code Tile}.
   *
   * @param tile The {@code Tile}.
   * @return <i>true</i> if the {@code Tile} has been explored and
   *         <i>false</i> otherwise.
   */
  hasExplored(tile: Tile): boolean {
    return tile.isExploredBy(this);
  }
  /**
   * Sets the given tile to be explored by this player and updates
   * the player's information about the tile.
   *
   * +til: Exploring the tile also updates the pet.
   *
   * @param tile The {@code Tile} to explore.
   * @return True if the tile is newly explored by this action.
   */
  exploreTile(tile: Tile): boolean {
    let ret = !this.hasExplored(tile);
    if (ret) {
      tile.setExplored(this, true);
    }
    return ret;
  }
  /**
   * Sets the tiles within the given {@code Unit}'s line of
   * sight to be explored by this player.
   *
   * @param tiles A list of {@code Tile}s.
   * @return A list of newly explored {@code Tile}s.
   * @see #hasExplored
   */
  exploreTiles(tiles: Collection<Tile>): JSet<Tile> {
    return CollectionUtils.transform$Collection$Predicate$Function$Collector(tiles, (t) => this.exploreTile(t), JFunction.identity(), Collectors.toSet());
  }
  /**
   * Sets the tiles visible to a given settlement to be explored by
   * this player and updates the player's information about the
   * tiles.  Note that the player does not necessarily own the settlement
   * (e.g. missionary at native settlement).
   *
   * @param settlement The {@code Settlement} that is exploring.
   * @return A list of newly explored {@code Tile}s.
   */
  exploreForSettlement(settlement: Settlement): JSet<Tile> {
    let tiles = new HashSet(settlement.getOwnedTiles());
    tiles.addAll(settlement.getVisibleTileSet());
    tiles.remove(settlement.getTile$());
    return this.exploreTiles(tiles);
  }
  /**
   * Sets the tiles within the given {@code Unit}'s line of
   * sight to be explored by this player.
   *
   * @param unit The {@code Unit}.
   * @return A list of newly explored {@code Tile}s.
   * @see #hasExplored
   */
  exploreForUnit(unit: Unit): JSet<Tile> {
    return (unit == null || !unit.isOnTile() || this.getGame() == null || this.getGame().getMap() == null) ? Collections.emptySet() : this.exploreTiles(unit.getVisibleTileSet());
  }
  /**
   * Makes the entire map visible or invisible.
   *
   * @param reveal If true, reveal the map, if false, hide it.
   * @return A list of tiles whose visibility changed.
   */
  exploreMap(reveal: boolean): JSet<Tile> {
    let tiles = this.getGame().getMap().getTileSet((t) => this.hasExplored(t) !== reveal);
    for (const $it13 = tiles.iterator(); $it13.hasNext(); ) {
      let t = $it13.next();
      t.setExplored(this, reveal);
    }
    this.invalidateCanSeeTiles();
    if (!reveal) {
      for (const $it14 = this.getSettlementList().iterator(); $it14.hasNext(); ) {
        let s = $it14.next();
        this.exploreForSettlement(s);
      }
      for (const $it15 = this.getUnitSet().iterator(); $it15.hasNext(); ) {
        let u = $it15.next();
        this.exploreForUnit(u);
      }
    }
    return tiles;
  }
  /**
   * Given a tile and new radius of visibility, explore unexplored tiles
   * and return those plus the previously invisible tiles.
   *
   * @param center The center {@code Tile} to explore from.
   * @param radius A radius to explore to.
   * @return A set of newly explored or currently invisible {@code Tile}s.
   */
  collectNewTiles$Tile$int(center: Tile, radius: number): JSet<Tile> {
    return this.collectNewTiles$Collection(center.getSurroundingTiles$int$int(0, radius));
  }
  /**
   * Given a tile and new radius of visibility, explore unexplored tiles
   * and return those plus the previously invisible tiles.
   *
   * @param collection A {@code Collection} of tiles to check.
   * @return A set of newly explored or currently invisible {@code Tile}s.
   */
  collectNewTiles$Collection(collection: Collection<Tile>): JSet<Tile> {
    return (collection == null) ? Collections.emptySet() : this.collectNewTiles$Stream(collection.stream());
  }
  /**
   * Given a stream of tiles, explore unexplored tiles and return those
   * plus the previously invisible tiles.
   *
   * @param tiles A stream of {@code Tile}s to check.
   * @return A set of newly explored or currently invisible {@code Tile}s.
   */
  collectNewTiles$Stream(tiles: Stream<Tile>): JSet<Tile> {
    return CollectionUtils.transform$Stream$Predicate$Function$Collector(tiles, (t) => this.exploreTile(t) || !this.canSee(t), JFunction.identity(), Collectors.toSet());
  }
  /**
   * Try to reassign the ownership of a collection of tiles,
   * preferring this player.
   *
   * Do it in two passes so the first successful claim does not give
   * a large advantage.
   *
   * @param tiles The collection of {@code Tile}s to reassign.
   * @param avoid An optional {@code Settlement} to consider last
   *     when making claims.
   */
  reassignTiles(tiles: Collection<Tile>, avoid: Settlement): void {
    let votes = new HashMap();
    let claims = new HashMap();
    let claimant: Settlement;
    for (const $it16 = tiles.iterator(); $it16.hasNext(); ) {
      let tile = $it16.next();
      let occupier = (tile.getFirstUnit() == null) ? null : tile.getFirstUnit().getOwner();
      claims.put(tile, null);
      votes.clear();
      for (const $it17 = tile.getSurroundingTiles$int(1).iterator(); $it17.hasNext(); ) {
        let t = $it17.next();
        claimant = t.getOwningSettlement();
        if (claimant != null && !claimant.isDisposed() && claimant.getOwner() != null && claimant.getOwner().canOwnTile(tile) && (occupier == null || claimant.getOwner() === occupier) && (claimant.getTile$().getDistanceTo(tile) <= claimant.getRadius())) {
          let value = (claimant.getOwner() === this) ? 3 : (claimant.getOwner().isEuropean() === this.isEuropean()) ? 2 : 1;
          if (votes.get(claimant) != null) {
            value = (value + votes.get(claimant)) | 0;
          }
          votes.put(claimant, value);
        }
      }
      let lastResort = false;
      let bestValue = 0;
      claimant = null;
      for (const $it18 = votes.entrySet().iterator(); $it18.hasNext(); ) {
        let entry = $it18.next();
        if (avoid === entry.getKey()) {
          lastResort = true;
          continue;
        }
        let value = entry.getValue();
        if (bestValue < value) {
          bestValue = value;
          claimant = entry.getKey();
        }
      }
      if (claimant == null && lastResort) {
        claimant = avoid;
      }
      claims.put(tile, claimant);
    }
    for (const $it19 = claims.entrySet().iterator(); $it19.hasNext(); ) {
      let e = $it19.next();
      let t = e.getKey();
      claimant = e.getValue();
      let newOwner = (claimant == null) ? null : claimant.getOwner();
      t.changeOwnership(newOwner, claimant);
    }
  }
  /**
   * Create units from a list of abstract units.  Only used by
   * Europeans at present.
   *
   * -vis: Visibility issues depending on location.
   * -til: Tile appearance issue if created in a colony (not ATM)
   *
   * @param abstractUnits The list of {@code AbstractUnit}s to
   *     create.
   * @param location The {@code Location} where the units will
   *     be created.
   * @param random A pseudo-random number source.
   * @return A list of units created.
   */
  createUnits(abstractUnits: List<AbstractUnit>, location: Location, random: Random): List<Unit> {
    let game = this.getGame();
    let spec = game.getSpecification();
    let units = new ArrayList();
    let lb = new LogBuilder()._LogBuilder(32);
    lb.add(['createUnits for ', this, ' at ', location]);
    for (const $it20 = abstractUnits.iterator(); $it20.hasNext(); ) {
      let au = $it20.next();
      let type$ = au.getType(spec);
      let role = au.getRole(spec);
      if (!type$.isAvailableTo([this])) {
        lb.add([' ignoring type-unavailable ', au]);
        continue;
      }
      if (!role.isAvailableTo([this, type$])) {
        lb.add([' ignoring role-unavailable ', au]);
        continue;
      }
      for (let i = 0; i < au.getNumber(); i++) {
        let su = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType$Role(game, location, this, type$, role);
        su.setName(this.getNameForUnit(type$, random));
        units.add(su);
        lb.add([32 /* ' ' */, su]);
      }
    }
    lb.log(ServerPlayer.logger, Level.FINEST);
    return units;
  }
  /**
   * Embark the land units.  For all land units, find a naval unit
   * to carry it.  Fill greedily, so as if there is excess naval
   * capacity then the naval units at the end of the list will tend
   * to be empty or very lightly filled, allowing them to defend the
   * whole fleet at full strength.  Returns a list of units that
   * could not be placed on ships.
   *
   * -vis: Has visibility implications depending on the initial
   * location of the loaded units.  Usually ATM this is Europe which
   * is safe, but beware.
   * -til: Safe while in Europe though.
   *
   * @param landUnits A list of land units to put on ships.
   * @param navalUnits A list of ships to put land units on.
   * @param random An optional pseudo-random number source.
   * @return a list of units left over
   */
  loadShips(landUnits: List<Unit>, navalUnits: List<Unit>, random: Random): List<Unit> {
    let leftOver = new ArrayList();
    if (random != null) {
      RandomUtils.randomShuffle(ServerPlayer.logger, 'Naval load', navalUnits, random);
      RandomUtils.randomShuffle(ServerPlayer.logger, 'Land load', landUnits, random);
    }
    let lb = new LogBuilder()._LogBuilder(256);
    lb.add(['Load ', navalUnits.size(), ' ships with ', landUnits.size(), ' land units: ']);
    for (const $it21 = landUnits.iterator(); $it21.hasNext(); ) {
      let unit = $it21.next();
      let carrier = CollectionUtils.find$Collection$Predicate(navalUnits, (u) => u.canAdd(unit));
      if (carrier != null) {
        unit.setLocation(carrier);
        lb.add([unit, ' -> ', carrier, ', ']);
      } else {
        leftOver.add(unit);
      }
    }
    if (leftOver.isEmpty()) {
      lb.add(['no leftovers.']);
    } else {
      lb.add(['leftover']);
      for (const $it22 = leftOver.iterator(); $it22.hasNext(); ) {
        let u = $it22.next();
        lb.add([' ', u]);
      }
      lb.add(['.']);
    }
    lb.log(ServerPlayer.logger, Level.FINEST);
    return leftOver;
  }
  /**
   * Flush any market price changes.
   *
   * @param cs A {@code ChangeSet} to update.
   * @return True if the market has changed.
   */
  csFlushMarket$ChangeSet(cs: ChangeSet): boolean {
    let market = this.getMarket();
    if (market == null) {
      return false;
    }
    let spec = this.getSpecification();
    let ret = false;
    let sb = new StringBuilder(32);
    sb.append('Flush market for ').append(this.getId()).append(String.fromCharCode(58 /* ':' */));
    for (const $it23 = (CollectionUtils.transform$Collection$Predicate(spec.getGoodsTypeList(), (gt) => this.csFlushMarket$GoodsType$ChangeSet(gt, cs))).iterator(); $it23.hasNext(); ) {
      let goodsType = $it23.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append(goodsType.getId());
      ret = true;
    }
    if (ret) {
      ServerPlayer.logger.finest(sb.toString());
    }
    return ret;
  }
  /**
   * Flush any market price changes for a specified goods type.
   *
   * @param type The {@code GoodsType} to check.
   * @param cs A {@code ChangeSet} to update.
   * @return True if the market price had changed.
   */
  csFlushMarket$GoodsType$ChangeSet(type$: GoodsType, cs: ChangeSet): boolean {
    let market = this.getMarket();
    let ret = market.hasPriceChanged(type$);
    if (ret) {
      cs.addMessage(this, market.makePriceChangeMessage(type$));
      market.flushPriceChange(type$);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(this), [market.getMarketData$GoodsType(type$)]);
    }
    return ret;
  }
  /**
   * Buy goods in Europe.
   *
   * @param random A pseudo-random number source.
   * @param container The {@code GoodsContainer} to carry the goods.
   * @param type The {@code GoodsType} to buy.
   * @param amount The amount of goods to buy.
   * @return The amount actually removed from the market, or
   *     negative on failure.
   */
  buyInEurope(random: Random, container: GoodsContainer, type$: GoodsType, amount: number): number {
    let market = this.getMarket();
    let marketAmount = 0;
    while (amount > 0) {
      let a = (amount <= GoodsContainer.CARGO_SIZE) ? amount : GoodsContainer.CARGO_SIZE;
      let price = market.getBidPrice(type$, a);
      if (!this.checkGold(price)) {
        if (marketAmount === 0) {
          return -1;
        }
        break;
      }
      this.modifyGold(-price);
      market.modifySales(type$, -a);
      if (container != null) {
        container.addGoods$GoodsType$int(type$, a);
      }
      market.modifyIncomeBeforeTaxes(type$, -price);
      market.modifyIncomeAfterTaxes(type$, -price);
      let ma = $J.d2i(this.apply$float$Turn$String$FreeColSpecObjectType(Math.fround(a), this.getGame().getTurn(), Modifier.TRADE_BONUS, type$));
      market.addGoodsToMarket(type$, -ma);
      marketAmount = (marketAmount + ma) | 0;
      this.propagateToEuropeanMarkets(type$, -a, random);
      amount = (amount - a) | 0;
    }
    return marketAmount;
  }
  /**
   * Sell goods in Europe.
   *
   * @param random A pseudo-random number source.
   * @param container An optional {@code GoodsContainer}
   *     carrying the goods.
   * @param type The {@code GoodsType} to sell.
   * @param amount The amount of goods to sell.
   * @return The amount actually added to the market, or negative on failure.
   */
  sellInEurope(random: Random, container: GoodsContainer, type$: GoodsType, amount: number): number {
    let market = this.getMarket();
    let tax = this.getTax();
    let marketAmount = 0;
    while (amount > 0) {
      let a = (amount <= GoodsContainer.CARGO_SIZE) ? amount : GoodsContainer.CARGO_SIZE;
      let incomeBeforeTaxes = market.getSalePrice$GoodsType$int(type$, a);
      let incomeAfterTaxes = $J.idiv((Math.imul(((100 - tax) | 0), incomeBeforeTaxes)), 100);
      if (this.isAI()) {
        let tradeProfitMultiplierCheat = this.getSpecification().getInteger(GameOptions.TRADE_PROFIT_MULTIPLIER_CHEAT);
        let tradeProfitMultiplierCheatTurns = this.getSpecification().getInteger(GameOptions.TRADE_PROFIT_MULTIPLIER_CHEAT_TURNS);
        let currentMultiplier = Math.max(1, tradeProfitMultiplierCheat * (tradeProfitMultiplierCheatTurns - this.getGame().getTurn().getNumber()) / tradeProfitMultiplierCheatTurns);
        let adjustedGoldAfterCheating = $J.d2i((incomeAfterTaxes * currentMultiplier));
        this.modifyGold(adjustedGoldAfterCheating);
      } else {
        this.modifyGold(incomeAfterTaxes);
      }
      market.modifySales(type$, a);
      if (container != null) {
        container.addGoods$GoodsType$int(type$, -a);
      }
      market.modifyIncomeBeforeTaxes(type$, incomeBeforeTaxes);
      market.modifyIncomeAfterTaxes(type$, incomeAfterTaxes);
      let ma = $J.d2i(this.apply$float$Turn$String$FreeColSpecObjectType(Math.fround(a), this.getGame().getTurn(), Modifier.TRADE_BONUS, type$));
      market.addGoodsToMarket(type$, ma);
      marketAmount = (marketAmount + ma) | 0;
      this.propagateToEuropeanMarkets(type$, a, random);
      amount = (amount - a) | 0;
    }
    return marketAmount;
  }
  /**
   * Adds a player to the list of players for whom the stance has changed.
   *
   * @param other The {@code Player} to add.
   */
  addStanceChange(other: Player): void {
    if (!this.stanceDirty.contains(other)) {
      this.stanceDirty.add(other);
    }
  }
  /**
   * Modifies stance.
   *
   * @param stance The new {@code Stance}.
   * @param otherPlayer The {@code Player} wrt which the stance changes.
   * @param symmetric If true, change the otherPlayer stance as well.
   * @param cs A {@code ChangeSet} to update.
   * @return True if there was a change in stance at all.
   */
  csChangeStance(stance: Stance, otherPlayer: Player, symmetric: boolean, cs: ChangeSet): boolean {
    let change = false;
    let old = this.getStance(otherPlayer);
    if (old !== stance) {
      let modifier = old.getTensionModifier(stance);
      this.setStance(otherPlayer, stance);
      if (modifier !== 0) {
        this.csModifyTension$Player$int$ChangeSet(otherPlayer, modifier, cs);
      }
      cs.addHistory(this, new HistoryEvent()._HistoryEvent$Turn$HistoryEventType$Player(this.getGame().getTurn(), HistoryEvent.getEventTypeFromStance(stance), otherPlayer).addStringTemplate$String$StringTemplate('%nation%', otherPlayer.getNationLabel()));
      ServerPlayer.logger.info('Stance modification ' + this.getName() + ' ' + $J.str(old) + ' -> ' + $J.str(stance) + ' wrt ' + otherPlayer.getName());
      this.addStanceChange(otherPlayer);
      if (old !== Stance.UNCONTACTED) {
        cs.addMessage(otherPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, stance.getStanceChangeKey(), this).addStringTemplate$String$StringTemplate('%nation%', this.getNationLabel()));
      }
      cs.addStance(ChangeSet$See.only(this), this, stance, otherPlayer);
      cs.addStance(ChangeSet$See.only(otherPlayer), this, stance, otherPlayer);
      change = true;
    }
    if (symmetric && (old = otherPlayer.getStance(this)) !== stance) {
      let modifier = old.getTensionModifier(stance);
      otherPlayer.setStance(this, stance);
      if (modifier !== 0) {
        (otherPlayer).csModifyTension$Player$int$ChangeSet(this, modifier, cs);
      }
      cs.addHistory(otherPlayer, new HistoryEvent()._HistoryEvent$Turn$HistoryEventType$Player(this.getGame().getTurn(), HistoryEvent.getEventTypeFromStance(stance), this).addStringTemplate$String$StringTemplate('%nation%', this.getNationLabel()));
      ServerPlayer.logger.info('Stance modification ' + otherPlayer.getName() + ' ' + $J.str(old) + ' -> ' + $J.str(stance) + ' wrt ' + this.getName() + ' (symmetric)');
      (otherPlayer).addStanceChange(this);
      if (old !== Stance.UNCONTACTED) {
        cs.addMessage(this, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, stance.getStanceChangeKey(), otherPlayer).addStringTemplate$String$StringTemplate('%nation%', otherPlayer.getNationLabel()));
      }
      cs.addStance(ChangeSet$See.only(this), otherPlayer, stance, this);
      cs.addStance(ChangeSet$See.only(otherPlayer), otherPlayer, stance, this);
      change = true;
    }
    return change;
  }
  /**
   * Modifies the hostility against the given player.
   *
   * +til: Handles tile modifications.
   *
   * @param player The {@code Player}.
   * @param add The amount to add to the current tension level.
   * @param cs A {@code ChangeSet} to update.
   */
  csModifyTension$Player$int$ChangeSet(player: Player, add: number, cs: ChangeSet): void {
    this.csModifyTension$Player$int$Settlement$ChangeSet(player, add, null, cs);
  }
  /**
   * Modifies the hostility against the given player.
   *
   * +til: Handles tile modifications.
   *
   * @param player The {@code Player}.
   * @param add The amount to add to the current tension level.
   * @param origin A {@code Settlement} where the alarming event
   *     occurred.
   * @param cs A {@code ChangeSet} to update.
   */
  csModifyTension$Player$int$Settlement$ChangeSet(player: Player, add: number, origin: Settlement, cs: ChangeSet): void {
    let oldLevel = this.getTension$Player(player).getLevel();
    this.getTension$Player(player).modify(add);
    if (oldLevel !== this.getTension$Player(player).getLevel()) {
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(player), [this]);
    }
    if (this.isIndian()) {
      for (const $it24 = (CollectionUtils.transform$Stream$Predicate(this.getIndianSettlements(), (i) => i !== origin && i.hasContacted(player))).iterator(); $it24.hasNext(); ) {
        let is$ = $it24.next();
        (is$).csModifyAlarm(player, add, false, cs);
      }
    }
  }
  /**
   * Pay upkeep on the player resources.
   *
   * @param random A pseudo-random number source.
   * @param cs A {@code ChangeSet} to update.
   */
  csPayUpkeep(random: Random, cs: ChangeSet): void {
    let spec = this.getSpecification();
    let bankruptcy = spec.getDisaster(Disaster.BANKRUPTCY);
    let changed = false;
    let upkeep = CollectionUtils.sum$Stream$ToIntFunction(this.getSettlements(), ($p0) => $p0.getUpkeep());
    if (this.checkGold(upkeep)) {
      this.modifyGold(-upkeep);
      if (this.getBankrupt()) {
        this.setBankrupt(false);
        changed = true;
        CollectionUtils.forEach$Stream$Consumer(CollectionUtils.flatten$Collection$Function(bankruptcy.getEffects(), (e) => e.getObject().getModifiers$()), (m) => cs.addModifier(this, this, m, false));
        cs.addMessage(this, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.GOVERNMENT_EFFICIENCY, 'model.player.disaster.bankruptcy.stop', this));
      }
    } else {
      this.modifyGold(-this.getGold());
      if (!this.getBankrupt()) {
        this.setBankrupt(true);
        changed = true;
        this.csApplyDisaster(random, null, bankruptcy, cs);
        cs.addMessage(this, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.GOVERNMENT_EFFICIENCY, 'model.player.disaster.bankruptcy.start', this));
      }
    }
    if (upkeep > 0) {
      cs.addPartial(ChangeSet$See.only(this), this, ['gold', String(this.getGold())]);
    }
    if (changed) {
      cs.addPartial(ChangeSet$See.only(this), this, ['bankrupt', String(this.getBankrupt())]);
    }
  }
  /**
   * Check for natural disasters.
   *
   * @param random A {@code Random} number source.
   * @param cs A {@code ChangeSet} to update.
   * @param probability The percentage probability of a disaster occuring.
   */
  csNaturalDisasters(random: Random, cs: ChangeSet, probability: number): void {
    if (RandomUtils.randomInt(ServerPlayer.logger, 'Natural disaster', random, 100) < probability) {
      let colonies = this.getColonyList();
      let size = colonies.size();
      if (size <= 0) {
        return;
      }
      let start = RandomUtils.randomInt(ServerPlayer.logger, 'select colony', random, size);
      for (let i = 0; i < size; i++) {
        let colony = colonies.get(((start + i) | 0) % size);
        let disaster = RandomChoice.getWeightedRandom$Logger$String$Stream$Random(ServerPlayer.logger, 'select disaster', colony.getDisasterChoices(), random);
        let messages = this.csApplyDisaster(random, colony, disaster, cs);
        if (!messages.isEmpty()) {
          cs.addMessage(this, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.DISASTERS, 'model.player.disaster.strikes', colony).addName$String$String('%colony%', colony.getName()).addName$String$FreeColObject('%disaster%', disaster));
          for (const $it25 = messages.iterator(); $it25.hasNext(); ) {
            let message = $it25.next();
            cs.addMessage(this, message);
          }
          return;
        }
      }
    }
  }
  /**
   * Apply the effects of the given {@code Disaster} to the
   * given {@code Colony}, or the {@code Player} if the
   * {@code Colony} is {@code null}, and return a list of
   * appropriate {@code ModelMessage}s. Note that a disaster
   * might have no effect on a particular colony. In that case, the
   * returned list is empty.
   *
   * @param random A {@code Random} number source.
   * @param colony A {@code Colony}, or {@code null}.
   * @param disaster A {@code Disaster} value.
   * @param cs A {@code ChangeSet} to update.
   * @return A list of {@code ModelMessage}s, possibly empty.
   */
  csApplyDisaster(random: Random, colony: Colony, disaster: Disaster, cs: ChangeSet): List<ModelMessage> {
    let sb = new StringBuilder(64);
    sb.append('Applying ').append($J.str(disaster.getNumberOfEffects())).append(' effect/s of disaster ').append(Messages.getName$Named(disaster));
    if (colony != null) {
      sb.append(' to ').append(colony.getName());
    }
    sb.append(String.fromCharCode(58 /* ':' */));
    let effects = new ArrayList();
    switch (disaster.getNumberOfEffects()) {
      case Disaster$Effects.ONE:
        effects.add(RandomChoice.getWeightedRandom$Logger$String$Collection$Random(ServerPlayer.logger, 'Get effect of disaster', disaster.getEffects(), random));
        sb.append(String.fromCharCode(32 /* ' ' */)).append(Messages.getName$Named(effects.get(0)));
        break;
      case Disaster$Effects.SEVERAL:
        for (const $it26 = disaster.getEffects().iterator(); $it26.hasNext(); ) {
          let effect = $it26.next();
          if (RandomUtils.randomInt(ServerPlayer.logger, 'Get effects of disaster', random, 100) < effect.getProbability()) {
            effects.add(effect.getObject());
            sb.append(String.fromCharCode(32 /* ' ' */)).append(Messages.getName$Named(effect.getObject()));
          }
        }
        break;
      case Disaster$Effects.ALL:
        for (const $it27 = disaster.getEffects().iterator(); $it27.hasNext(); ) {
          let effect = $it27.next();
          effects.add(effect.getObject());
          sb.append(String.fromCharCode(32 /* ' ' */)).append(Messages.getName$Named(effect.getObject()));
        }
    }
    if (effects.isEmpty()) {
      sb.append(' All avoided');
    }
    ServerPlayer.logger.fine(sb.toString());
    let colonyDirty = false;
    let messages = new ArrayList();
    let mm: ModelMessage;
    outer:
    for (const $it28 = effects.iterator(); $it28.hasNext(); ) {
      let effect = $it28.next();
      mm = null;
      if (colony == null) {
        CollectionUtils.forEach$Stream$Consumer(effect.getModifiers$(), (modifier) => {
          if (modifier.getDuration() > 0) {
            let timedModifier = Modifier.makeTimedModifier(modifier.getId(), modifier, this.getGame().getTurn());
            modifier.setModifierIndex(Modifier.DISASTER_PRODUCTION_INDEX);
            cs.addModifier(this, this, timedModifier, true);
          } else {
            cs.addModifier(this, this, modifier, true);
          }
        });
      } else {
        if (null != effect.getId()) {
          {
            let plunder: number, building: Building, goods: Goods;
            switch (effect.getId()) {
              case Effect.LOSS_OF_MONEY:
                plunder = Math.max(1, $J.idiv(colony.getPlunder(null, random), 5));
                this.modifyGold(-plunder);
                cs.addPartial(ChangeSet$See.only(this), this, ['gold', String(this.getGold())]);
                mm = new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.DISASTERS, effect.getId(), this).addAmount('%amount%', plunder);
                break;
              case Effect.LOSS_OF_BUILDING:
                building = this.getBuildingForEffect(colony, effect, random);
                if (building != null) {
                  mm = new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.DISASTERS, effect.getId(), colony).addNamed$String$Named('%building%', building.getType());
                  this.csDamageBuilding(building, cs);
                  colonyDirty = true;
                }
                break;
              case Effect.LOSS_OF_GOODS:
                goods = RandomUtils.getRandomMember$Logger$String$List$Random(ServerPlayer.logger, 'select goods', colony.getLootableGoodsList(), random);
                if (goods != null) {
                  goods.setAmount(Math.min($J.idiv(goods.getAmount(), 2), 50));
                  colony.removeGoods$AbstractGoods(goods);
                  mm = new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.DISASTERS, effect.getId(), colony).addStringTemplate$String$StringTemplate('%goods%', goods.getLabel$boolean(true));
                  colonyDirty = true;
                }
                break;
              case Effect.LOSS_OF_UNIT:
                {
                  let unit = this.getUnitForEffect(colony, effect, random);
                  if (unit != null) {
                    if (colony.getUnitCount() === 1) {
                      messages.clear();
                      mm = new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.DISASTERS, 'model.player.disaster.effect.colonyDestroyed', this).addName$String$String('%colony%', colony.getName());
                      messages.add(mm);
                      this.csDisposeSettlement(colony, cs);
                      colonyDirty = false;
                      break outer;
                    }
                    mm = new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.DISASTERS, effect.getId(), colony).addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$());
                    (unit).csRemove(ChangeSet$See.only(this), null, cs);
                    colonyDirty = true;
                  }
                  break;
                }
              case Effect.DAMAGED_UNIT:
                {
                  let unit = this.getUnitForEffect(colony, effect, random);
                  if (unit != null && unit.isNaval()) {
                    let repairLocation = unit.getRepairLocation();
                    if (repairLocation == null) {
                      mm = new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.DISASTERS, effect.getId(), colony).addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$());
                      this.csSinkShip(unit, null, cs);
                    } else {
                      mm = new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.DISASTERS, effect.getId(), colony).addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$());
                      this.csDamageShip(unit, repairLocation, cs);
                    }
                    colonyDirty = true;
                  }
                  break;
                }
              default:
                mm = new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.DISASTERS, effect.getId(), colony);
                CollectionUtils.forEach$Stream$Consumer(effect.getModifiers$(), (m) => {
                  if (m.getDuration() > 0) {
                    let timedModifier = Modifier.makeTimedModifier(m.getId(), m, this.getGame().getTurn());
                    timedModifier.setModifierIndex(Modifier.DISASTER_PRODUCTION_INDEX);
                    cs.addModifier(this, colony, timedModifier, true);
                  } else {
                    cs.addModifier(this, colony, m, true);
                  }
                });
                colonyDirty = !!(colonyDirty | CollectionUtils.first$Stream(effect.getModifiers$()) != null);
                break;
            }
          }
        }
      }
      if (mm != null) {
        messages.add(mm);
      }
    }
    if (colonyDirty) {
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [colony]);
    }
    return messages;
  }
  getBuildingForEffect(colony: Colony, effect: Effect, random: Random): Building {
    let buildings = colony.getBurnableBuildings();
    return (buildings.isEmpty()) ? null : RandomUtils.getRandomMember$Logger$String$List$Random(ServerPlayer.logger, 'Select building for effect', buildings, random);
  }
  getUnitForEffect(colony: Colony, effect: Effect, random: Random): Unit {
    let units = CollectionUtils.transform$Collection$Predicate(colony.getAllUnitsList(), (u) => effect.appliesTo(u.getType()));
    return (units.isEmpty()) ? null : RandomUtils.getRandomMember$Logger$String$List$Random(ServerPlayer.logger, 'Select unit for effect', units, random);
  }
  /**
   * Propagate an European market trade to the other European markets.
   *
   * @param type The type of goods that was traded.
   * @param amount The amount of goods that was traded.
   * @param random A pseudo-random number source (note: may be null
   *     in some cases).
   */
  propagateToEuropeanMarkets(type$: GoodsType, amount: number, random: Random): void {
    if (!type$.isStorable()) {
      return;
    }
    let lowerBound = 5;
    let upperBound = 30;
    let r = (random == null) ? $J.idiv(((lowerBound + upperBound) | 0), 2) : ((RandomUtils.randomInt(ServerPlayer.logger, 'Propagate goods', random, (upperBound - lowerBound + 1) | 0)) + lowerBound) | 0;
    amount = Math.imul(amount, r);
    amount = $J.idiv(amount, 100);
    if (amount === 0) {
      return;
    }
    for (const $it29 = this.getGame().getLiveEuropeanPlayerList([this]).iterator(); $it29.hasNext(); ) {
      let p = $it29.next();
      let market = p.getMarket();
      if (market != null) {
        market.addGoodsToMarket(type$, amount);
      }
    }
  }
  /**
   * Add or remove a standard yearly amount of storable goods, and a
   * random extra amount of a random type.  Then push out all the
   * accumulated trades.
   *
   * Public for the test suite.
   *
   * @param random A pseudo-random number source.
   * @param cs A {@code ChangeSet} to update.
   */
  csYearlyGoodsAdjust(random: Random, cs: ChangeSet): void {
    let game = this.getGame();
    let goodsTypes = game.getSpecification().getStorableGoodsTypeList();
    let market = this.getMarket();
    if (market == null) {
      return;
    }
    let extraType: GoodsType;
    while (!(extraType = RandomUtils.getRandomMember$Logger$String$List$Random(ServerPlayer.logger, 'Choose goods type', goodsTypes, random)).isStorable()) {
    }
    for (const $it30 = (CollectionUtils.transform$Collection$Predicate(goodsTypes, (gt) => market.hasBeenTraded(gt))).iterator(); $it30.hasNext(); ) {
      let type$ = $it30.next();
      let add = market.getAmountInMarket(type$) < type$.getInitialAmount();
      let amount = $J.idiv(game.getTurn().getNumber(), 10);
      if (type$ === extraType) {
        amount = (Math.imul(2, amount) + 1) | 0;
      }
      if (amount <= 0) {
        continue;
      }
      amount = RandomUtils.randomInt(ServerPlayer.logger, 'Market adjust ' + $J.str(type$), random, amount);
      if (!add) {
        amount = -amount;
      }
      market.addGoodsToMarket(type$, amount);
      ServerPlayer.logger.finest(this.getName() + ' adjust of ' + amount + ' ' + $J.str(type$) + ', total: ' + market.getAmountInMarket(type$) + ', initial: ' + type$.getInitialAmount());
      this.addExtraTrade(new AbstractGoods()._AbstractGoods$GoodsType$int(type$, amount));
    }
    this.flushExtraTrades(random);
    this.csFlushMarket$ChangeSet(cs);
  }
  /**
   * Starts a new turn for a player.
   *
   * @param random A pseudo-random number source.
   * @param cs A {@code ChangeSet} to update.
   */
  csStartTurn(random: Random, cs: ChangeSet): void {
    let game = this.getGame();
    if (this.isEuropean()) {
      this.csBombardEnemyShips(random, cs);
      this.csYearlyGoodsAdjust(random, cs);
      let father = this.checkFoundingFather();
      if (father != null) {
        this.csAddFoundingFather(father, random, cs);
        this.clearOfferedFathers();
      }
      let ffs = this.getOfferedFathers();
      if (this.canRecruitFoundingFather() && ffs.isEmpty()) {
        ffs = this.getRandomFoundingFathers(random);
        this.setOfferedFathers(ffs);
      }
      if (!ffs.isEmpty()) {
        cs.add$See$Message(ChangeSet$See.only(this), new ChooseFoundingFatherMessage()._ChooseFoundingFatherMessage$List$FoundingFather(ffs, null));
      }
      if (this.updateScore()) {
        cs.addPartial(ChangeSet$See.only(this), this, ['score', String(this.getScore())]);
      }
    } else if (this.isIndian()) {
      let allSettlements = this.getIndianSettlementList();
      let oldLevels = new HashMap(allSettlements.size());
      for (const $it31 = allSettlements.iterator(); $it31.hasNext(); ) {
        let is$ = $it31.next();
        let oldLevel = new HashMap();
        oldLevels.put(is$, oldLevel);
        for (const $it32 = game.getLiveEuropeanPlayerList([this]).iterator(); $it32.hasNext(); ) {
          let enemy = $it32.next();
          let alarm = is$.getAlarm$Player(enemy);
          oldLevel.put(enemy, (alarm == null) ? null : alarm.getLevel());
        }
      }
      for (const $it33 = allSettlements.iterator(); $it33.hasNext(); ) {
        let is$ = $it33.next();
        let enemies = game.getLiveEuropeanPlayerList([this]);
        let extra = new HashMap(enemies.size());
        for (const $it34 = enemies.iterator(); $it34.hasNext(); ) {
          let enemy = $it34.next();
          extra.put(enemy, 0);
        }
        let alarmRadius = (is$.getRadius() + ServerPlayer.ALARM_RADIUS) | 0;
        for (const $it35 = is$.getTile$().getSurroundingTiles$int(alarmRadius).iterator(); $it35.hasNext(); ) {
          let tile = $it35.next();
          let colony = tile.getColony();
          if (tile.getFirstUnit() != null) {
            let enemy = tile.getFirstUnit().getOwner();
            if (enemy.isEuropean()) {
              let alarm = extra.get(enemy);
              if (alarm == null) {
                continue;
              }
              alarm = (alarm + $J.d2i(CollectionUtils.sumDouble$Stream$Predicate$ToDoubleFunction(tile.getUnits(), (u) => u.isOffensiveUnit() && !u.isNaval(), (u) => u.getType().getOffence()))) | 0;
              extra.put(enemy, alarm);
            }
          } else if (colony != null) {
            let enemy = colony.getOwner();
            extra.put(enemy, (extra.get(enemy) + ServerPlayer.ALARM_TILE_IN_USE + colony.getUnitCount()) | 0);
          } else if (tile.getOwningSettlement() != null) {
            let enemy = tile.getOwningSettlement().getOwner();
            if (enemy != null && enemy.isEuropean()) {
              extra.put(enemy, (extra.get(enemy) + ServerPlayer.ALARM_TILE_IN_USE) | 0);
            }
          }
        }
        if (is$.hasMissionary$()) {
          let missionary = is$.getMissionary();
          let missionAlarm = this.getGame().getSpecification().getInteger(GameOptions.MISSION_INFLUENCE);
          if (missionary.hasAbility$String(Ability.EXPERT_MISSIONARY)) {
            missionAlarm = Math.imul(missionAlarm, 2);
          }
          let enemy = missionary.getOwner();
          extra.put(enemy, (extra.get(enemy) + missionAlarm) | 0);
        }
        CollectionUtils.forEachMapEntry$Map$Predicate$Consumer(extra, (e) => e.getValue() !== 0, (e) => {
          let player = e.getKey();
          let change = $J.d2i(player.apply$float$Turn$String(Math.fround(e.getValue()), game.getTurn(), Modifier.NATIVE_ALARM_MODIFIER));
          (is$).csModifyAlarm(player, change, true, cs);
        });
      }
      for (const $it36 = (CollectionUtils.transform$Stream$Predicate(game.getLiveEuropeanPlayers([this]), (p) => this.getTension$Player(p).getValue() > 0)).iterator(); $it36.hasNext(); ) {
        let enemy = $it36.next();
        let change = ($J.idiv(-this.getTension$Player(enemy).getValue(), 100) - 4) | 0;
        this.csModifyTension$Player$int$ChangeSet(enemy, change, cs);
      }
      for (const $it37 = allSettlements.iterator(); $it37.hasNext(); ) {
        let is$ = $it37.next();
        CollectionUtils.forEachMapEntry$Map$Consumer(oldLevels.get(is$), (e) => (is$).csCheckTension(e.getKey(), e.getValue(), cs));
      }
      for (const $it38 = allSettlements.iterator(); $it38.hasNext(); ) {
        let is$ = $it38.next();
        (is$).csStartTurn(random, cs);
      }
    }
  }
  /**
   * All player colonies bombard all available targets.
   *
   * @param random A random number source.
   * @param cs A {@code ChangeSet} to update.
   */
  csBombardEnemyShips(random: Random, cs: ChangeSet): void {
    let bombardUnit = (u) => (u.getOwner() !== this && u.isNaval() && !u.getTile$().isLand() && (this.atWarWith(u.getOwner()) || u.hasAbility$String(Ability.PIRACY)));
    for (const $it39 = (CollectionUtils.transform$Stream$Predicate(this.getColonies(), ($p0) => $p0.canBombardEnemyShip())).iterator(); $it39.hasNext(); ) {
      let c = $it39.next();
      let tile = c.getTile$();
      for (const $it40 = CollectionUtils.transform$Stream$Predicate(CollectionUtils.flatten$Collection$Function(tile.getSurroundingTiles$int$int(1, 1), ($p0) => $p0.getUnits()), bombardUnit).iterator(); $it40.hasNext(); ) {
        let u = $it40.next();
        this.csCombat(c, u, null, random, cs);
      }
    }
  }
  /**
   * Adds a founding father to a players continental congress.
   *
   * @param father The {@code FoundingFather} to add.
   * @param random A pseudo-random number source.
   * @param cs A {@code ChangeSet} to update.
   */
  csAddFoundingFather(father: FoundingFather, random: Random, cs: ChangeSet): void {
    let game = this.getGame();
    let spec = game.getSpecification();
    let europe = this.getEurope();
    let turn = game.getTurn();
    let europeDirty = false;
    let visibilityChange = false;
    this.addFather(father);
    this.addHistory(new HistoryEvent()._HistoryEvent$Turn$HistoryEventType$Player(turn, HistoryEvent$HistoryEventType.FOUNDING_FATHER, this).addNamed$String$Named('%father%', father));
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(this), [this]);
    cs.addMessage(this, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.SONS_OF_LIBERTY, 'model.player.foundingFatherJoinedCongress', this).addNamed$String$Named('%foundingFather%', father).add$String$String('%description%', father.getDescriptionKey()));
    let units = father.getUnitList();
    if (europe != null && units != null && !units.isEmpty()) {
      this.createUnits(units, europe, random);
      europeDirty = true;
    }
    let uct = spec.getUnitChangeType(UnitChangeType.FOUNDING_FATHER);
    if (uct != null && uct.appliesTo(this)) {
      for (const $it41 = this.getUnitSet().iterator(); $it41.hasNext(); ) {
        let u = $it41.next();
        for (const $it42 = uct.getUnitChanges(u.getType()).iterator(); $it42.hasNext(); ) {
          let uc = $it42.next();
          if (!uc.appliesTo(u)) {
            continue;
          }
          u.changeType(uc.to);
          visibilityChange = true;
          cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [u]);
          break;
        }
      }
    }
    for (const $it43 = CollectionUtils.iterable(father.getModifiers$()).iterator(); $it43.hasNext(); ) {
      let m = $it43.next();
      if ($J.equals(Modifier.LINE_OF_SIGHT_BONUS, m.getId())) {
        let tiles = this.collectNewTiles$Collection(this.getVisibleTileSet());
        cs.add$See$Collection(ChangeSet$See.only(this), tiles);
        visibilityChange = !tiles.isEmpty();
      } else if ($J.equals(Modifier.SOL, m.getId())) {
        for (const $it44 = this.getColonyList().iterator(); $it44.hasNext(); ) {
          let c = $it44.next();
          c.addLiberty(0);
          c.invalidateCache();
        }
      }
    }
    for (const $it45 = father.getEvents().iterator(); $it45.hasNext(); ) {
      let event = $it45.next();
      let eventId = event.getId();
      {
        let market: Market, type$: BuildingType;
        switch (eventId) {
          case 'model.event.resetBannedMissions':
            for (const $it46 = game.getLiveNativePlayerList([]).iterator(); $it46.hasNext(); ) {
              let p = $it46.next();
              if (p.missionsBanned(this)) {
                p.removeMissionBan(this);
                cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(this), [p]);
              }
            }
            break;
          case 'model.event.resetNativeAlarm':
            for (const $it47 = (CollectionUtils.transform$Stream$Predicate(game.getLiveNativePlayers([]), (p) => p.hasContacted(this))).iterator(); $it47.hasNext(); ) {
              let p = $it47.next();
              p.setTension$Player$Tension(this, new Tension()._Tension$int(Tension.TENSION_MIN));
              for (const $it48 = (CollectionUtils.transform$Stream$Predicate(p.getIndianSettlements(), (is$) => is$.hasContacted(this))).iterator(); $it48.hasNext(); ) {
                let is$ = $it48.next();
                is$.getTile$().cacheUnseen$();
                is$.setAlarm$Player$Tension(this, new Tension()._Tension$int(Tension.TENSION_MIN));
                cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(this), [is$]);
              }
              this.csChangeStance(Stance.PEACE, p, true, cs);
            }
            break;
          case 'model.event.boycottsLifted':
            market = this.getMarket();
            for (const $it49 = spec.getGoodsTypeList().iterator(); $it49.hasNext(); ) {
              let goodsType = $it49.next();
              if (market.getArrears(goodsType) > 0) {
                market.setArrears(goodsType, 0);
                cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(this), [market.getMarketData$GoodsType(goodsType)]);
              }
            }
            break;
          case 'model.event.freeBuilding':
            type$ = spec.getBuildingType(event.getValue());
            for (const $it50 = this.getColonyList().iterator(); $it50.hasNext(); ) {
              let c = $it50.next();
              (c).csFreeBuilding(type$, cs);
            }
            break;
          case 'model.event.seeAllColonies':
            visibilityChange = true;
            for (const $it51 = game.getAllColoniesList(null).iterator(); $it51.hasNext(); ) {
              let colony = $it51.next();
              let t = colony.getTile$();
              let tiles = new HashSet();
              if (this.exploreTile(t)) {
                if (!this.hasAbility$String(Ability.SEE_ALL_COLONIES)) {
                  let c = t.copy$Game(game);
                  c.getColony().setDisplayUnitCount(1);
                  t.setCachedTile(this, c);
                }
                tiles.add(t);
              }
              let fullRadius = $J.d2i(father.apply$float$Turn$String(Math.fround(colony.getLineOfSight()), turn, Modifier.EXPOSED_TILES_RADIUS));
              tiles.addAll(this.exploreTiles(t.getSurroundingTiles$int$int(1, fullRadius)));
              cs.add$See$Collection(ChangeSet$See.only(this), tiles);
            }
            break;
          case 'model.event.newRecruits':
            if (europe != null) {
              europeDirty = europe.replaceRecruits(random);
            }
            break;
          case 'model.event.movementChange':
            for (const $it52 = (CollectionUtils.transform$Stream$Predicate(this.getUnits(), (u) => u.getMovesLeft() > 0)).iterator(); $it52.hasNext(); ) {
              let u = $it52.next();
              u.setMovesLeft(u.getInitialMovesLeft());
              cs.addPartial(ChangeSet$See.only(this), u, ['movesLeft', String(u.getMovesLeft())]);
            }
            break;
          default:
            break;
        }
      }
    }
    if (europeDirty) {
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(this), [europe]);
    }
    if (visibilityChange) {
      this.invalidateCanSeeTiles();
    }
  }
  /**
   * Get a list of free building types this player has access to
   * through its choice of founding fathers.  Used to upgrade newly
   * captured colonies.
   *
   * @return A list of free {@code BuildingType}s.
   */
  getFreeBuildingTypes(): List<BuildingType> {
    let spec = this.getGame().getSpecification();
    return CollectionUtils.transform$Stream$Predicate$Function(CollectionUtils.flatten$Collection$Function(this.getFoundingFathers(), (ff) => ff.getEvents().stream()), CollectionUtils.matchKeyEquals$Object$Function('model.event.freeBuilding', ($p0) => $p0.getId()), (ev) => spec.getBuildingType(ev.getValue()));
  }
  /**
   * Claim land.
   *
   * @param tile The {@code Tile} to claim.
   * @param settlement The {@code Settlement} to claim for.
   * @param price The price to pay for the land, which must agree
   *     with the owner valuation, unless negative which denotes stealing.
   * @param cs A {@code ChangeSet} to update.
   */
  csClaimLand(tile: Tile, settlement: Settlement, price: number, cs: ChangeSet): void {
    let owner = tile.getOwner();
    let ownerSettlement = tile.getOwningSettlement();
    tile.cacheUnseen$();
    tile.changeOwnership(this, settlement);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [tile]);
    if (price > 0) {
      this.modifyGold(-price);
      owner.modifyGold(price);
      cs.addPartial(ChangeSet$See.only(this), this, ['gold', String(this.getGold())]);
    } else if (price < 0 && owner.isIndian()) {
      let sis = ownerSettlement;
      if (sis == null) {
        (owner).csModifyTension$Player$int$ChangeSet(this, Tension.TENSION_ADD_LAND_TAKEN, cs);
      } else {
        sis.csModifyAlarm(this, Tension.TENSION_ADD_LAND_TAKEN, true, cs);
      }
    }
    ServerPlayer.logger.finest(this.getName() + ' claimed ' + $J.str(tile) + ' from ' + ((owner == null) ? 'no-one' : owner.getName()) + ', price: ' + $J.str(((price === 0) ? 'free' : (price < 0) ? 'stolen' : price)));
  }
  /**
   * A unit migrates from Europe.
   *
   * @param slot The slot within {@code Europe} to select the unit from.
   * @param type The type of migration occurring.
   * @param random A pseudo-random number source.
   * @param cs A {@code ChangeSet} to update.
   */
  csEmigrate(slot: number, type$: Europe$MigrationType, random: Random, cs: ChangeSet): void {
    let europe = this.getEurope();
    let recruit = europe.extractRecruitable(slot, random);
    let game = this.getGame();
    let spec = game.getSpecification();
    let role = (spec.getBoolean(GameOptions.EQUIP_EUROPEAN_RECRUITS)) ? recruit.getRole(spec) : spec.getDefaultRole();
    let unit = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType$Role(game, europe, this, recruit.getType(spec), role);
    switch (type$) {
      case Europe$MigrationType.FOUNTAIN:
        this.setRemainingEmigrants((this.getRemainingEmigrants() - 1) | 0);
        break;
      case Europe$MigrationType.RECRUIT:
        this.modifyGold(-europe.getCurrentRecruitPrice());
        cs.addPartial(ChangeSet$See.only(this), this, ['gold', String(this.getGold())]);
        europe.increaseRecruitmentDifficulty();
      case Europe$MigrationType.NORMAL:
        this.reduceImmigration();
        this.updateImmigrationRequired();
        cs.addPartial(ChangeSet$See.only(this), this, ['immigration', String(this.getImmigration()), 'immigrationRequired', String(this.getImmigrationRequired())]);
        if (!Europe$MigrationType.specificMigrantSlot(slot)) {
          cs.addMessage(this, this.getEmigrationMessage(unit));
        }
        break;
      case Europe$MigrationType.SURVIVAL:
        cs.addMessage(this, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.UNIT_ADDED, 'model.player.autoRecruit', this, unit).addNamed$String$Named('%europe%', europe).addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$()));
        break;
      default:
        throw new RuntimeException('Bogus migration type: ' + $J.str(type$));
    }
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(this), [europe]);
  }
  /**
   * Combat.
   *
   * @param attacker The {@code FreeColGameObject} that is attacking.
   * @param defender The {@code FreeColGameObject} that is defending.
   * @param crs A list of {@code CombatResult}s defining the result.
   * @param random A pseudo-random number source.
   * @param cs A {@code ChangeSet} to update.
   */
  csCombat(attacker: FreeColGameObject, defender: FreeColGameObject, crs: List<CombatModel$CombatEffectType>, random: Random, cs: ChangeSet): void {
    let combatModel = this.getGame().getCombatModel();
    let isAttack = combatModel.combatIsAttack(attacker, defender);
    let isBombard = combatModel.combatIsBombard(attacker, defender);
    let attackerUnit = null;
    let attackerSettlement = null;
    let attackerTile = null;
    let defenderUnit = null;
    let defenderPlayer = null;
    let defenderTile = null;
    if (isAttack) {
      attackerUnit = attacker;
      attackerTile = attackerUnit.getTile$();
      defenderUnit = defender;
      defenderPlayer = defenderUnit.getOwner();
      defenderTile = defenderUnit.getTile$();
      let bombard = attackerUnit.hasAbility$String(Ability.BOMBARD);
      cs.addAttribute(ChangeSet$See.only(this), 'sound', (attackerUnit.isNaval()) ? 'sound.attack.naval' : (bombard) ? 'sound.attack.artillery' : (attackerUnit.isMounted()) ? 'sound.attack.mounted' : 'sound.attack.foot');
      if (attackerUnit.getOwner().isIndian() && defenderPlayer.isEuropean() && defenderUnit.getLocation().getColony() != null && !defenderPlayer.atWarWith(attackerUnit.getOwner())) {
        let attackerNation = attackerUnit.getApparentOwnerName();
        let colony = defenderUnit.getLocation().getColony();
        cs.addMessage(defenderPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.raid.ours', colony).addName$String$String('%colony%', colony.getName()).addStringTemplate$String$StringTemplate('%nation%', attackerNation));
      }
    } else if (isBombard) {
      attackerSettlement = attacker;
      attackerTile = attackerSettlement.getTile$();
      defenderUnit = defender;
      defenderPlayer = defenderUnit.getOwner();
      defenderTile = defenderUnit.getTile$();
      cs.addAttribute(ChangeSet$See.only(this), 'sound', 'sound.attack.bombard');
    } else {
      throw new RuntimeException('Bogus combat: ' + $J.str(attacker) + ' v ' + $J.str(defender));
    }
    // assert defenderTile != null
    let combatResult = null;
    if (crs == null) {
      combatResult = combatModel.generateAttackResult(random, attacker, defender);
      crs = combatResult.getEffects();
    }
    if (crs.isEmpty()) {
      throw new RuntimeException('empty attack result: ' + $J.str(this));
    }
    let vis: ChangeSet$See;
    let result = crs.removeAt(0);
    switch (result) {
      case CombatModel$CombatEffectType.NO_RESULT:
        vis = ChangeSet$See.perhaps();
        break;
      case CombatModel$CombatEffectType.WIN:
        vis = ChangeSet$See.perhaps().always(defenderPlayer);
        if (isAttack) {
          if (attackerTile == null || attackerTile === defenderTile || !attackerTile.isAdjacent(defenderTile)) {
            ServerPlayer.logger.warning('Bogus attack from ' + $J.str(attackerTile) + ' to ' + $J.str(defenderTile));
          } else {
            cs.addAttack(vis, attackerUnit, defenderUnit, true);
          }
        }
        break;
      case CombatModel$CombatEffectType.LOSE:
        vis = ChangeSet$See.perhaps().always(this);
        if (isAttack) {
          if (attackerTile == null || attackerTile === defenderTile || !attackerTile.isAdjacent(defenderTile)) {
            ServerPlayer.logger.warning('Bogus attack from ' + $J.str(attackerTile) + ' to ' + $J.str(defenderTile));
          } else {
            cs.addAttack(vis, attackerUnit, defenderUnit, false);
          }
        }
        break;
      default:
        throw new IllegalStateException('generateAttackResult returned: ' + $J.str(result));
    }
    let attackerTileDirty = false;
    let defenderTileDirty = false;
    let moveAttacker = false;
    let burnedNativeCapital = false;
    let settlement = defenderTile.getSettlement();
    let colony = defenderTile.getColony();
    let natives = (settlement instanceof IndianSettlement) ? settlement : null;
    let attackerTension = 0;
    let defenderTension = 0;
    if (combatResult != null && combatResult.isAttackerHitpointsAffected()) {
      attackerUnit.setHitPoints(combatResult.getAttackerHitpointsAfter());
      attackerTileDirty = true;
    }
    if (combatResult != null && combatResult.isDefenderHitpointsAffected()) {
      defenderUnit.setHitPoints(combatResult.getDefenderHitpointsAfter());
      defenderTileDirty = true;
    }
    for (const $it53 = crs.iterator(); $it53.hasNext(); ) {
      let cr = $it53.next();
      let ok: boolean;
      switch (cr) {
        case CombatModel$CombatEffectType.AUTOEQUIP_UNIT:
          ok = isAttack && settlement != null;
          if (ok) {
            this.csAutoequipUnit(defenderUnit, settlement, cs);
          }
          break;
        case CombatModel$CombatEffectType.BURN_MISSIONS:
          ok = isAttack && result === CombatModel$CombatEffectType.WIN && natives != null && this.isEuropean() && defenderPlayer.isIndian();
          if (ok) {
            defenderTileDirty = !!(defenderTileDirty | natives.hasMissionary$Player(this));
            this.csBurnMissions(attackerUnit, natives, cs);
          }
          break;
        case CombatModel$CombatEffectType.CAPTURE_AUTOEQUIP:
          ok = isAttack && result === CombatModel$CombatEffectType.WIN && settlement != null;
          if (ok) {
            this.csCaptureAutoEquip(attackerUnit, defenderUnit, cs);
            attackerTileDirty = defenderTileDirty = true;
          }
          break;
        case CombatModel$CombatEffectType.CAPTURE_COLONY:
          ok = isAttack && result === CombatModel$CombatEffectType.WIN && colony != null && (this.isEuropean() || this.isUndead()) && (defenderPlayer.isEuropean() || defenderPlayer.isUndead());
          if (ok) {
            this.csCaptureColony(attackerUnit, colony, random, cs);
            attackerTileDirty = defenderTileDirty = false;
            moveAttacker = true;
            defenderTension = (defenderTension + Tension.TENSION_ADD_MAJOR) | 0;
          }
          break;
        case CombatModel$CombatEffectType.CAPTURE_CONVERT:
          ok = isAttack && result === CombatModel$CombatEffectType.WIN && natives != null && this.isEuropean() && defenderPlayer.isIndian();
          if (ok) {
            this.csCaptureConvert(attackerUnit, natives, random, cs);
            attackerTileDirty = true;
          }
          break;
        case CombatModel$CombatEffectType.CAPTURE_EQUIP:
          ok = isAttack && result !== CombatModel$CombatEffectType.NO_RESULT;
          if (ok) {
            if (result === CombatModel$CombatEffectType.WIN) {
              this.csCaptureEquip(attackerUnit, defenderUnit, cs);
            } else {
              this.csCaptureEquip(defenderUnit, attackerUnit, cs);
            }
            attackerTileDirty = defenderTileDirty = true;
          }
          break;
        case CombatModel$CombatEffectType.CAPTURE_UNIT:
          ok = isAttack && result !== CombatModel$CombatEffectType.NO_RESULT;
          if (ok) {
            if (result === CombatModel$CombatEffectType.WIN) {
              this.csCaptureUnit(attackerUnit, defenderUnit, cs);
            } else {
              this.csCaptureUnit(defenderUnit, attackerUnit, cs);
            }
            attackerTileDirty = true;
            defenderTileDirty = false;
          }
          break;
        case CombatModel$CombatEffectType.DAMAGE_COLONY_SHIPS:
          ok = isAttack && result === CombatModel$CombatEffectType.WIN && colony != null;
          if (ok) {
            this.csDamageColonyShips(attackerUnit, colony, cs);
            defenderTileDirty = true;
          }
          break;
        case CombatModel$CombatEffectType.DAMAGE_SHIP_ATTACK:
          ok = isAttack && result !== CombatModel$CombatEffectType.NO_RESULT && ((result === CombatModel$CombatEffectType.WIN) ? defenderUnit : attackerUnit).isNaval();
          if (ok) {
            if (result === CombatModel$CombatEffectType.WIN) {
              this.csDamageShipAttack(attackerUnit, defenderUnit, cs);
              defenderTileDirty = true;
            } else {
              this.csDamageShipAttack(defenderUnit, attackerUnit, cs);
              attackerTileDirty = true;
            }
          }
          break;
        case CombatModel$CombatEffectType.DAMAGE_SHIP_BOMBARD:
          ok = isBombard && result === CombatModel$CombatEffectType.WIN && defenderUnit.isNaval();
          if (ok) {
            this.csDamageShipBombard(attackerSettlement, defenderUnit, cs);
            defenderTileDirty = true;
          }
          break;
        case CombatModel$CombatEffectType.DEMOTE_UNIT:
          ok = isAttack && result !== CombatModel$CombatEffectType.NO_RESULT;
          if (ok) {
            if (result === CombatModel$CombatEffectType.WIN) {
              this.csDemoteUnit(attackerUnit, defenderUnit, cs);
              defenderTileDirty = true;
            } else {
              this.csDemoteUnit(defenderUnit, attackerUnit, cs);
              attackerTileDirty = true;
            }
          }
          break;
        case CombatModel$CombatEffectType.DESTROY_COLONY:
          ok = isAttack && result === CombatModel$CombatEffectType.WIN && colony != null && this.isIndian() && defenderPlayer.isEuropean();
          if (ok) {
            this.csDestroyColony(attackerUnit, colony, random, cs);
            attackerTileDirty = defenderTileDirty = true;
            moveAttacker = true;
            attackerTension = (attackerTension - Tension.TENSION_ADD_NORMAL) | 0;
            defenderTension = (defenderTension + Tension.TENSION_ADD_MAJOR) | 0;
          }
          break;
        case CombatModel$CombatEffectType.DESTROY_SETTLEMENT:
          ok = isAttack && result === CombatModel$CombatEffectType.WIN && natives != null && defenderPlayer.isIndian();
          if (ok) {
            burnedNativeCapital = settlement.isCapital();
            this.csDestroySettlement(attackerUnit, natives, random, cs);
            attackerTileDirty = defenderTileDirty = true;
            moveAttacker = true;
            attackerTension = (attackerTension - Tension.TENSION_ADD_NORMAL) | 0;
            if (!burnedNativeCapital) {
              defenderTension = (defenderTension + Tension.TENSION_ADD_MAJOR) | 0;
            }
          }
          break;
        case CombatModel$CombatEffectType.EVADE_ATTACK:
          ok = isAttack && result === CombatModel$CombatEffectType.NO_RESULT && defenderUnit.isNaval();
          if (ok) {
            this.csEvadeAttack(attackerUnit, defenderUnit, cs);
          }
          break;
        case CombatModel$CombatEffectType.EVADE_BOMBARD:
          ok = isBombard && result === CombatModel$CombatEffectType.NO_RESULT && defenderUnit.isNaval();
          if (ok) {
            this.csEvadeBombard(attackerSettlement, defenderUnit, cs);
          }
          break;
        case CombatModel$CombatEffectType.LOOT_SHIP:
          ok = isAttack && result !== CombatModel$CombatEffectType.NO_RESULT && attackerUnit.isNaval() && defenderUnit.isNaval();
          if (ok) {
            if (result === CombatModel$CombatEffectType.WIN) {
              this.csLootShip(attackerUnit, defenderUnit, cs);
            } else {
              this.csLootShip(defenderUnit, attackerUnit, cs);
            }
          }
          break;
        case CombatModel$CombatEffectType.LOSE_AUTOEQUIP:
          ok = isAttack && result === CombatModel$CombatEffectType.WIN && settlement != null;
          if (ok) {
            this.csLoseAutoEquip(attackerUnit, defenderUnit, cs);
            defenderTileDirty = true;
          }
          break;
        case CombatModel$CombatEffectType.LOSE_EQUIP:
          ok = isAttack && result !== CombatModel$CombatEffectType.NO_RESULT;
          if (ok) {
            if (result === CombatModel$CombatEffectType.WIN) {
              this.csLoseEquip(attackerUnit, defenderUnit, cs);
              defenderTileDirty = true;
            } else {
              this.csLoseEquip(defenderUnit, attackerUnit, cs);
              attackerTileDirty = true;
            }
          }
          break;
        case CombatModel$CombatEffectType.PILLAGE_COLONY:
          ok = isAttack && result === CombatModel$CombatEffectType.WIN && colony != null && this.isIndian() && defenderPlayer.isEuropean();
          if (ok) {
            this.csPillageColony(attackerUnit, colony, random, cs);
            defenderTileDirty = true;
            attackerTension = (attackerTension - Tension.TENSION_ADD_NORMAL) | 0;
          }
          break;
        case CombatModel$CombatEffectType.PROMOTE_UNIT:
          ok = isAttack && result !== CombatModel$CombatEffectType.NO_RESULT;
          if (ok) {
            if (result === CombatModel$CombatEffectType.WIN) {
              this.csPromoteUnit(attackerUnit, cs);
              attackerTileDirty = true;
            } else {
              this.csPromoteUnit(defenderUnit, cs);
              defenderTileDirty = true;
            }
          }
          break;
        case CombatModel$CombatEffectType.SINK_COLONY_SHIPS:
          ok = isAttack && result === CombatModel$CombatEffectType.WIN && colony != null;
          if (ok) {
            this.csSinkColonyShips(attackerUnit, colony, cs);
            defenderTileDirty = true;
          }
          break;
        case CombatModel$CombatEffectType.SINK_SHIP_ATTACK:
          ok = isAttack && result !== CombatModel$CombatEffectType.NO_RESULT && ((result === CombatModel$CombatEffectType.WIN) ? defenderUnit : attackerUnit).isNaval();
          if (ok) {
            if (result === CombatModel$CombatEffectType.WIN) {
              this.csSinkShipAttack(attackerUnit, defenderUnit, cs);
              defenderTileDirty = true;
            } else {
              this.csSinkShipAttack(defenderUnit, attackerUnit, cs);
              attackerTileDirty = true;
            }
          }
          break;
        case CombatModel$CombatEffectType.SINK_SHIP_BOMBARD:
          ok = isBombard && result === CombatModel$CombatEffectType.WIN && defenderUnit.isNaval();
          if (ok) {
            this.csSinkShipBombard(attackerSettlement, defenderUnit, cs);
            defenderTileDirty = true;
          }
          break;
        case CombatModel$CombatEffectType.SLAUGHTER_UNIT:
          ok = isAttack && result !== CombatModel$CombatEffectType.NO_RESULT;
          if (ok) {
            if (result === CombatModel$CombatEffectType.WIN) {
              this.csSlaughterUnit(attackerUnit, defenderUnit, cs);
              defenderTileDirty = true;
              attackerTension = (attackerTension - Tension.TENSION_ADD_NORMAL) | 0;
              defenderTension = (defenderTension + this.getSlaughterTension(defenderUnit)) | 0;
            } else {
              this.csSlaughterUnit(defenderUnit, attackerUnit, cs);
              attackerTileDirty = true;
              attackerTension = (attackerTension + this.getSlaughterTension(attackerUnit)) | 0;
              defenderTension = (defenderTension - Tension.TENSION_ADD_NORMAL) | 0;
            }
          }
          break;
        default:
          ok = false;
          break;
      }
      if (!ok) {
        throw new IllegalStateException('Attack (result=' + $J.str(result) + ') has bogus subresult: ' + $J.str(cr));
      }
    }
    if (attacker.hasAbility$String(Ability.PIRACY)) {
      if (!defenderPlayer.getAttackedByPrivateers()) {
        defenderPlayer.setAttackedByPrivateers(true);
        cs.addPartial(ChangeSet$See.only(defenderPlayer), defenderPlayer, ['attackedByPrivateers', $J.str(true)]);
      }
    } else if (defender.hasAbility$String(Ability.PIRACY)) {
    } else if (burnedNativeCapital) {
      defenderPlayer.getTension$Player(this).setValue(Tension.SURRENDERED);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps().always(this), [defenderPlayer]);
      this.csChangeStance(Stance.PEACE, defenderPlayer, true, cs);
      for (const $it54 = (CollectionUtils.transform$Stream$Predicate(defenderPlayer.getIndianSettlements(), (is$) => is$.hasContacted(this))).iterator(); $it54.hasNext(); ) {
        let is$ = $it54.next();
        is$.getAlarm$Player(this).setValue(Tension.SURRENDERED);
        if (this.hasExplored(is$.getTile$())) {
          cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps().always(this), [is$]);
        } else {
          cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(defenderPlayer), [is$]);
        }
      }
    } else if (this.isEuropean() && defenderPlayer.isEuropean()) {
      this.csChangeStance(Stance.WAR, defenderPlayer, true, cs);
    } else {
      if (this.isEuropean()) {
        this.csChangeStance(Stance.WAR, defenderPlayer, true, cs);
      } else if (this.isIndian()) {
        if (result === CombatModel$CombatEffectType.WIN) {
          attackerTension = (attackerTension - Tension.TENSION_ADD_MINOR) | 0;
        } else if (result === CombatModel$CombatEffectType.LOSE) {
          attackerTension = (attackerTension + Tension.TENSION_ADD_MINOR) | 0;
        }
      }
      if (defenderPlayer.isEuropean()) {
        (defenderPlayer).csChangeStance(Stance.WAR, this, true, cs);
      } else if (defenderPlayer.isIndian()) {
        if (result === CombatModel$CombatEffectType.WIN) {
          defenderTension = (defenderTension + Tension.TENSION_ADD_MINOR) | 0;
        } else if (result === CombatModel$CombatEffectType.LOSE) {
          defenderTension = (defenderTension - Tension.TENSION_ADD_MINOR) | 0;
        }
      }
      if (attackerTension !== 0) {
        this.csModifyTension$Player$int$ChangeSet(defenderPlayer, attackerTension, cs);
      }
      if (defenderTension !== 0) {
        (defenderPlayer).csModifyTension$Player$int$ChangeSet(this, defenderTension, cs);
      }
    }
    if (moveAttacker) {
      attackerUnit.setMovesLeft(attackerUnit.getInitialMovesLeft());
      (attackerUnit).csMove(defenderTile, random, cs);
      attackerUnit.setMovesLeft(0);
      attackerTileDirty = defenderTileDirty = false;
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(defenderPlayer), [defenderTile]);
    } else if (isAttack) {
      if (attacker.hasAbility$String(Ability.MULTIPLE_ATTACKS)) {
        let movecost = attackerUnit.getMoveCost$Tile(defenderTile);
        attackerUnit.setMovesLeft((attackerUnit.getMovesLeft() - movecost) | 0);
      } else {
        attackerUnit.setMovesLeft(0);
      }
      if (!attackerTileDirty) {
        cs.addPartial(ChangeSet$See.only(this), attacker, ['movesLeft', String(attackerUnit.getMovesLeft())]);
      }
    }
    if (attackerTileDirty) {
      if (attackerSettlement != null) {
        cs.remove(attackerSettlement);
      }
      cs.add$See$FreeColGameObjectArr(vis, [attackerTile]);
    }
    if (defenderTileDirty) {
      if (settlement != null) {
        cs.remove(settlement);
      }
      cs.add$See$FreeColGameObjectArr(vis, [defenderTile]);
    }
  }
  /**
   * Gets the amount to raise tension by when a unit is slaughtered.
   *
   * @param loser The {@code Unit} that dies.
   * @return An amount to raise tension by.
   */
  getSlaughterTension(loser: Unit): number {
    let settlement = loser.getSettlement();
    if (settlement != null) {
      if (settlement instanceof IndianSettlement) {
        return (settlement.isCapital()) ? Tension.TENSION_ADD_CAPITAL_ATTACKED : Tension.TENSION_ADD_SETTLEMENT_ATTACKED;
      } else {
        return Tension.TENSION_ADD_NORMAL;
      }
    } else {
      return (loser.getHomeIndianSettlement() != null) ? Tension.TENSION_ADD_UNIT_DESTROYED : Tension.TENSION_ADD_MINOR;
    }
  }
  /**
   * Notifies of automatic arming.
   *
   * @param unit The {@code Unit} that is auto-equipping.
   * @param settlement The {@code Settlement} being defended.
   * @param cs A {@code ChangeSet} to update.
   */
  csAutoequipUnit(unit: Unit, settlement: Settlement, cs: ChangeSet): void {
    let owner = unit.getOwner();
    cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.automaticDefence', unit).addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$()).addName$String$String('%colony%', settlement.getName()));
  }
  /**
   * Burns a players missions.
   *
   * @param attacker The {@code Unit} that attacked.
   * @param is The {@code IndianSettlement} that was attacked.
   * @param cs The {@code ChangeSet} to update.
   */
  csBurnMissions(attacker: Unit, is$: IndianSettlement, cs: ChangeSet): void {
    let attackerPlayer = attacker.getOwner();
    let attackerNation = attackerPlayer.getNationLabel();
    let nativePlayer = is$.getOwner();
    let nativeNation = nativePlayer.getNationLabel();
    cs.addMessage(attackerPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.burnMissions', attacker, is$).addStringTemplate$String$StringTemplate('%nation%', attackerNation).addStringTemplate$String$StringTemplate('%enemyNation%', nativeNation));
    let here = is$.hasMissionary$Player(attackerPlayer);
    for (const $it55 = nativePlayer.getIndianSettlementsWithMissionaryList(attackerPlayer).iterator(); $it55.hasNext(); ) {
      let s = $it55.next();
      (s).csKillMissionary(null, cs);
    }
    if (here) {
      cs.remove(is$.getTile$());
    }
  }
  /**
   * Defender auto equips but loses and attacker captures the equipment.
   *
   * @param attacker The {@code Unit} that attacked.
   * @param defender The {@code Unit} that defended and loses equipment.
   * @param cs A {@code ChangeSet} to update.
   */
  csCaptureAutoEquip(attacker: Unit, defender: Unit, cs: ChangeSet): void {
    let role = defender.getAutomaticRole();
    this.csLoseAutoEquip(attacker, defender, cs);
    this.csCaptureEquipment(attacker, defender, role, cs);
  }
  /**
   * Captures a colony.
   *
   * @param attacker The attacking {@code Unit}.
   * @param colony The {@code ServerColony} to capture.
   * @param random A pseudo-random number source.
   * @param cs The {@code ChangeSet} to update.
   */
  csCaptureColony(attacker: Unit, colony: ServerColony, random: Random, cs: ChangeSet): void {
    let game = attacker.getGame();
    let attackerPlayer = attacker.getOwner();
    let attackerNation = attacker.getApparentOwnerName();
    let colonyPlayer = colony.getOwner();
    let colonyNation = colonyPlayer.getNationLabel();
    let tile = colony.getTile$();
    let plunder = colony.getPlunder(attacker, random);
    cs.addHistory(attackerPlayer, new HistoryEvent()._HistoryEvent$Turn$HistoryEventType$Player(game.getTurn(), HistoryEvent$HistoryEventType.CONQUER_COLONY, attackerPlayer).addStringTemplate$String$StringTemplate('%nation%', colonyNation).addName$String$String('%colony%', colony.getName()));
    cs.addHistory(colonyPlayer, new HistoryEvent()._HistoryEvent$Turn$HistoryEventType$Player(game.getTurn(), HistoryEvent$HistoryEventType.COLONY_CONQUERED, attackerPlayer).addStringTemplate$String$StringTemplate('%nation%', attackerNation).addName$String$String('%colony%', colony.getName()));
    cs.addMessage(attackerPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.colonyCaptured.enemy', colony).addName$String$String('%colony%', colony.getName()).addStringTemplate$String$StringTemplate('%unit%', attacker.getLabel$()).addStringTemplate$String$StringTemplate('%enemyNation%', colonyNation).addAmount('%amount%', plunder));
    cs.addMessage(colonyPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.colonyCaptured.ours', tile).addName$String$String('%colony%', colony.getName()).addStringTemplate$String$StringTemplate('%enemyUnit%', attacker.getLabel$()).addStringTemplate$String$StringTemplate('%enemyNation%', attackerNation).addAmount('%amount%', plunder));
    (colonyPlayer).csLoseLocation(colony, cs);
    if (plunder > 0) {
      attackerPlayer.modifyGold(plunder);
      colonyPlayer.modifyGold(-plunder);
      cs.addPartial(ChangeSet$See.only(attackerPlayer), attackerPlayer, ['gold', String(attackerPlayer.getGold())]);
      cs.addPartial(ChangeSet$See.only(colonyPlayer), colonyPlayer, ['gold', String(colonyPlayer.getGold())]);
    }
    for (const $it56 = (CollectionUtils.transform$Stream$Predicate(colony.getModifiers$(), CollectionUtils.matchKey$Object$Function(Specification.COLONY_GOODS_PARTY_SOURCE, ($p0) => $p0.getSource()))).iterator(); $it56.hasNext(); ) {
      let m = $it56.next();
      colony.removeModifier(m);
    }
    colony.csChangeOwner(attackerPlayer, true, UnitChangeType.CAPTURE, cs);
    cs.addAttribute(ChangeSet$See.only(attackerPlayer), 'sound', 'sound.event.captureColony');
    attackerPlayer.invalidateCanSeeTiles();
    colonyPlayer.invalidateCanSeeTiles();
  }
  /**
   * Extracts a convert from a native settlement.
   *
   * @param attacker The {@code Unit} that is attacking.
   * @param is The {@code IndianSettlement} under attack.
   * @param random A pseudo-random number source.
   * @param cs A {@code ChangeSet} to update.
   */
  csCaptureConvert(attacker: Unit, is$: IndianSettlement, random: Random, cs: ChangeSet): void {
    let spec = this.getGame().getSpecification();
    let attackerPlayer = attacker.getOwner();
    let nativePlayer = is$.getOwner();
    let convertNation = nativePlayer.getNationLabel();
    let convert = RandomUtils.getRandomMember$Logger$String$List$Random(ServerPlayer.logger, 'Choose convert', is$.getAllUnitsList(), random);
    if ((nativePlayer).csChangeOwner(convert, attackerPlayer, UnitChangeType.CONVERSION, attacker.getTile$(), cs)) {
      convert.changeRole(spec.getDefaultRole(), 0);
      for (const $it57 = convert.getCompactGoodsList().iterator(); $it57.hasNext(); ) {
        let g = $it57.next();
        convert.removeGoods$AbstractGoods(g);
      }
      convert.setMovesLeft(0);
      convert.setState(Unit$UnitState.ACTIVE);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(nativePlayer), [is$.getTile$()]);
      cs.addMessage(attackerPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.newConvertFromAttack', convert).addStringTemplate$String$StringTemplate('%unit%', attacker.getLabel$()).addStringTemplate$String$StringTemplate('%enemyNation%', convertNation).addStringTemplate$String$StringTemplate('%enemyUnit%', convert.getLabel$()));
      attackerPlayer.invalidateCanSeeTiles();
    }
  }
  /**
   * Captures equipment.
   *
   * @param winner The {@code Unit} that captures equipment.
   * @param loser The {@code Unit} that defended and loses equipment.
   * @param cs A {@code ChangeSet} to update.
   */
  csCaptureEquip(winner: Unit, loser: Unit, cs: ChangeSet): void {
    let role = loser.getRole();
    this.csLoseEquip(winner, loser, cs);
    this.csCaptureEquipment(winner, loser, role, cs);
  }
  /**
   * Capture equipment.
   *
   * @param winner The {@code Unit} that is capturing equipment.
   * @param loser The {@code Unit} that is losing equipment.
   * @param role The {@code Role} wrest from the loser.
   * @param cs A {@code ChangeSet} to update.
   */
  csCaptureEquipment(winner: Unit, loser: Unit, role: Role, cs: ChangeSet): void {
    let winnerPlayer = winner.getOwner();
    let loserPlayer = loser.getOwner();
    let newRole = winner.canCaptureEquipment(role);
    if (newRole != null) {
      let newGoods = winner.getGoodsDifference(newRole, 1);
      let goodsType = newGoods.get(0).getType();
      winner.changeRole(newRole, 1);
      if (winnerPlayer.isIndian()) {
        let winnerNation = winner.getApparentOwnerName();
        cs.addMessage(loserPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.equipmentCaptured', winnerPlayer).addStringTemplate$String$StringTemplate('%nation%', winnerNation).addNamed$String$Named('%equipment%', goodsType));
        let is$ = winner.getHomeIndianSettlement();
        if (is$ != null) {
          for (const $it58 = newGoods.iterator(); $it58.hasNext(); ) {
            let ag = $it58.next();
            is$.addGoods$AbstractGoods(ag);
            winnerPlayer.logCheat('teleported ' + $J.str(ag) + ' back to ' + is$.getName());
          }
          cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(winnerPlayer), [is$]);
        }
      }
    }
  }
  /**
   * Capture a unit.
   *
   * @param winner A {@code Unit} that is capturing.
   * @param loser A {@code Unit} to capture.
   * @param cs A {@code ChangeSet} to update.
   */
  csCaptureUnit(winner: Unit, loser: Unit, cs: ChangeSet): void {
    let loserPlayer = loser.getOwner();
    let loserNation = loserPlayer.getNationLabel();
    let loserLocation = loser.getLocation().getLocationLabelFor(loserPlayer);
    let loserLabel = loser.getLabel$();
    let winnerPlayer = winner.getOwner();
    let winnerNation = winner.getApparentOwnerName();
    let winnerLocation = winner.getLocation().getLocationLabelFor(winnerPlayer);
    let oldTile = loser.getTile$();
    let key: string;
    if ((loserPlayer).csChangeOwner(loser, winnerPlayer, UnitChangeType.CAPTURE, winner.getTile$(), cs)) {
      loser.setMovesLeft(0);
      loser.setState(Unit$UnitState.ACTIVE);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps().always(loserPlayer), [oldTile]);
      key = 'combat.unitCaptured.enemy.' + loser.getType().getSuffix$();
      cs.addMessage(winnerPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, key, loser).addDefaultId('combat.unitCaptured.enemy').addStringTemplate$String$StringTemplate('%location%', winnerLocation).addStringTemplate$String$StringTemplate('%unit%', winner.getLabel$()).addStringTemplate$String$StringTemplate('%enemyNation%', loserNation).addStringTemplate$String$StringTemplate('%enemyUnit%', loserLabel));
    }
    key = 'combat.unitCaptured.ours.' + loser.getType().getSuffix$();
    cs.addMessage(loserPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, key, oldTile).addDefaultId('combat.unitCaptured.ours').addStringTemplate$String$StringTemplate('%location%', loserLocation).addStringTemplate$String$StringTemplate('%unit%', loserLabel).addStringTemplate$String$StringTemplate('%enemyNation%', winnerNation).addStringTemplate$String$StringTemplate('%enemyUnit%', winner.getLabel$()));
    winnerPlayer.invalidateCanSeeTiles();
    loserPlayer.invalidateCanSeeTiles();
  }
  /**
   * Damages all ships in a colony in preparation for capture.
   *
   * @param attacker The {@code Unit} that is damaging.
   * @param colony The {@code Colony} to damage ships in.
   * @param cs A {@code ChangeSet} to update.
   */
  csDamageColonyShips(attacker: Unit, colony: Colony, cs: ChangeSet): void {
    let captureRepairing = this.getSpecification().getBoolean(GameOptions.CAPTURE_UNITS_UNDER_REPAIR);
    let units = CollectionUtils.transform$Stream$Predicate(colony.getTile$().getUnits(), (u) => u.isNaval() && !(captureRepairing && u.isDamaged()));
    if (!units.isEmpty()) {
      let shipPlayer = colony.getOwner();
      let ship = units.get(0);
      let repairLocation = ship.getRepairLocation();
      let t = StringTemplate.label(', ');
      for (const $it59 = units.iterator(); $it59.hasNext(); ) {
        let u = $it59.next();
        this.csDamageShip(u, repairLocation, cs);
        t.addStringTemplate$StringTemplate(u.getLabel$());
      }
      cs.addMessage(shipPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.shipsDamaged', shipPlayer).addStringTemplate$String$StringTemplate('%ships%', t).addAmount('%number%', units.size()).addStringTemplate$String$StringTemplate('%repairLocation%', repairLocation.getLocationLabelFor(shipPlayer)));
    }
  }
  /**
   * Damage a ship through normal attack.
   *
   * @param attacker The attacker {@code Unit}.
   * @param ship The {@code Unit} which is a ship to damage.
   * @param cs A {@code ChangeSet} to update.
   */
  csDamageShipAttack(attacker: Unit, ship: Unit, cs: ChangeSet): void {
    let attackerPlayer = attacker.getOwner();
    let attackerNation = attacker.getApparentOwnerName();
    let shipPlayer = ship.getOwner();
    let shipLocation = ship.getLocation();
    let repair = ship.getRepairLocation();
    let repairLoc = repair.getLocationLabelFor(shipPlayer);
    let shipNation = ship.getApparentOwnerName();
    cs.addMessage(attackerPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.shipDamaged.enemy', attacker).addStringTemplate$String$StringTemplate('%location%', shipLocation.getLocationLabelFor(attackerPlayer)).addStringTemplate$String$StringTemplate('%unit%', attacker.getLabel$()).addStringTemplate$String$StringTemplate('%enemyNation%', shipNation).addStringTemplate$String$StringTemplate('%enemyUnit%', ship.getLabel$()));
    cs.addMessage(shipPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.shipDamaged.ours', ship).addStringTemplate$String$StringTemplate('%location%', shipLocation.getLocationLabelFor(shipPlayer)).addStringTemplate$String$StringTemplate('%unit%', ship.getLabel$()).addStringTemplate$String$StringTemplate('%enemyUnit%', attacker.getLabel$()).addStringTemplate$String$StringTemplate('%enemyNation%', attackerNation).addStringTemplate$String$StringTemplate('%repairLocation%', repairLoc));
    this.csDamageShip(ship, repair, cs);
  }
  /**
   * Damage a ship through bombard.
   *
   * @param settlement The attacker {@code Settlement}.
   * @param ship The {@code Unit} which is a ship to damage.
   * @param cs A {@code ChangeSet} to update.
   */
  csDamageShipBombard(settlement: Settlement, ship: Unit, cs: ChangeSet): void {
    let attackerPlayer = settlement.getOwner();
    let shipPlayer = ship.getOwner();
    let building = (settlement).getStockade();
    let repair = ship.getRepairLocation();
    let repairLoc = repair.getLocationLabelFor(shipPlayer);
    let shipNation = ship.getApparentOwnerName();
    cs.addMessage(attackerPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.shipDamagedByBombardment.enemy', settlement).addStringTemplate$String$StringTemplate('%location%', settlement.getLocationLabelFor(attackerPlayer)).addNamed$String$Named('%building%', building).addStringTemplate$String$StringTemplate('%enemyNation%', shipNation).addStringTemplate$String$StringTemplate('%enemyUnit%', ship.getLabel$()));
    cs.addMessage(shipPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.shipDamagedByBombardment.ours', ship).addStringTemplate$String$StringTemplate('%location%', settlement.getLocationLabelFor(shipPlayer)).addStringTemplate$String$StringTemplate('%unit%', ship.getLabel$()).addNamed$String$Named('%building%', building).addStringTemplate$String$StringTemplate('%enemyNation%', attackerPlayer.getNationLabel()).addStringTemplate$String$StringTemplate('%repairLocation%', repairLoc));
    this.csDamageShip(ship, repair, cs);
  }
  /**
   * Damage a ship.
   *
   * @param ship The naval {@code Unit} to damage.
   * @param repair The {@code Location} to send it to.
   * @param cs A {@code ChangeSet} to update.
   */
  csDamageShip(ship: Unit, repair: Location, cs: ChangeSet): void {
    let owner = ship.getOwner();
    for (const $it60 = ship.getCompactGoodsList().iterator(); $it60.hasNext(); ) {
      let g = $it60.next();
      ship.remove(g);
    }
    for (const $it61 = ship.getUnitList().iterator(); $it61.hasNext(); ) {
      let u = $it61.next();
      ship.remove(u);
      (u).csRemove(ChangeSet$See.only(owner), null, cs);
    }
    let shipLoc = (repair instanceof Colony) ? repair.getTile$() : repair;
    ship.damageShip(shipLoc);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(owner), [shipLoc]);
    owner.invalidateCanSeeTiles();
  }
  /**
   * Demotes a unit.
   *
   * @param winner The {@code Unit} that won.
   * @param loser The {@code Unit} that lost and should be demoted.
   * @param cs A {@code ChangeSet} to update.
   */
  csDemoteUnit(winner: Unit, loser: Unit, cs: ChangeSet): void {
    let loserPlayer = loser.getOwner();
    let loserNation = loser.getApparentOwnerName();
    let loserLocation = loser.getLocation().getLocationLabelFor(loserPlayer);
    let loserLabel = loser.getLabel$();
    let winnerPlayer = winner.getOwner();
    let winnerNation = winner.getApparentOwnerName();
    let winnerLocation = winner.getLocation().getLocationLabelFor(winnerPlayer);
    let suffix = loser.getType().getSuffix$();
    let uc = loser.getUnitChange$String(UnitChangeType.DEMOTION);
    if (uc == null || uc.to === loser.getType()) {
      ServerPlayer.logger.warning('Demotion failed, type=' + ((uc == null) ? 'null' : 'same type: ' + $J.str(uc.to)));
      return;
    }
    loser.changeType(uc.to);
    loserPlayer.invalidateCanSeeTiles();
    let key = 'combat.unitDemoted.enemy.' + suffix;
    cs.addMessage(winnerPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, key, winner).addDefaultId('combat.unitDemoted.enemy').addStringTemplate$String$StringTemplate('%location%', winnerLocation).addStringTemplate$String$StringTemplate('%unit%', winner.getLabel$()).addStringTemplate$String$StringTemplate('%enemyNation%', loserNation).addStringTemplate$String$StringTemplate('%oldName%', loserLabel).addStringTemplate$String$StringTemplate('%enemyUnit%', loser.getLabel$()));
    key = 'combat.unitDemoted.ours.' + suffix;
    cs.addMessage(loserPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, key, loser).addDefaultId('combat.unitDemoted.ours').addStringTemplate$String$StringTemplate('%location%', loserLocation).addStringTemplate$String$StringTemplate('%oldName%', loserLabel).addStringTemplate$String$StringTemplate('%unit%', loser.getLabel$()).addStringTemplate$String$StringTemplate('%enemyNation%', winnerNation).addStringTemplate$String$StringTemplate('%enemyUnit%', winner.getLabel$()));
  }
  /**
   * Destroy a colony.
   *
   * @param attacker The {@code Unit} that attacked.
   * @param colony The {@code Colony} that was attacked.
   * @param random A pseudo-random number source.
   * @param cs The {@code ChangeSet} to update.
   */
  csDestroyColony(attacker: Unit, colony: Colony, random: Random, cs: ChangeSet): void {
    let game = attacker.getGame();
    let attackerPlayer = attacker.getOwner();
    let attackerNation = attacker.getApparentOwnerName();
    let colonyPlayer = colony.getOwner();
    let colonyNation = colonyPlayer.getNationLabel();
    let plunder = colony.getPlunder(attacker, random);
    cs.addHistory(colonyPlayer, new HistoryEvent()._HistoryEvent$Turn$HistoryEventType$Player(game.getTurn(), HistoryEvent$HistoryEventType.COLONY_DESTROYED, attackerPlayer).addStringTemplate$String$StringTemplate('%nation%', attackerNation).addName$String$String('%colony%', colony.getName()));
    cs.addMessage(colonyPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.colonyBurned.ours', colony.getTile$()).addName$String$String('%colony%', colony.getName()).addStringTemplate$String$StringTemplate('%enemyNation%', attackerNation).addStringTemplate$String$StringTemplate('%enemyUnit%', attacker.getLabel$()).addAmount('%amount%', plunder));
    cs.addGlobalMessage(game, colonyPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.colonyBurned.other', colonyPlayer).addName$String$String('%colony%', colony.getName()).addStringTemplate$String$StringTemplate('%nation%', colonyNation).addStringTemplate$String$StringTemplate('%attackerNation%', attackerNation));
    (colonyPlayer).csLoseLocation(colony, cs);
    if (plunder > 0) {
      attackerPlayer.modifyGold(plunder);
      colonyPlayer.modifyGold(-plunder);
      cs.addPartial(ChangeSet$See.only(attackerPlayer), attackerPlayer, ['gold', String(attackerPlayer.getGold())]);
      cs.addPartial(ChangeSet$See.only(colonyPlayer), colonyPlayer, ['gold', String(colonyPlayer.getGold())]);
    }
    this.csDisposeSettlement(colony, cs);
  }
  /**
   * Destroys an Indian settlement.
   *
   * @param attacker The attacking {@code Unit}.
   * @param is An {@code IndianSettlement} to destroy.
   * @param random A pseudo-random number source.
   * @param cs A {@code ChangeSet} to update.
   */
  csDestroySettlement(attacker: Unit, is$: IndianSettlement, random: Random, cs: ChangeSet): void {
    let game = this.getGame();
    let spec = game.getSpecification();
    let tile = is$.getTile$();
    let attackerPlayer = attacker.getOwner();
    let nativePlayer = is$.getOwner();
    let attackerNation = attackerPlayer.getNationLabel();
    let nativeNation = nativePlayer.getNationLabel();
    let settlementName = is$.getName();
    let capital = is$.isCapital();
    let plunder = is$.getPlunder(attacker, random);
    for (const $it62 = is$.getOwnedUnitList().iterator(); $it62.hasNext(); ) {
      let u = $it62.next();
      u.changeHomeIndianSettlement(null);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(nativePlayer), [u]);
    }
    this.csDisposeSettlement(is$, cs);
    if (plunder > 0) {
      let unitTypes = spec.getUnitTypesWithAbility([Ability.CARRY_TREASURE]);
      let type$ = RandomUtils.getRandomMember$Logger$String$List$Random(ServerPlayer.logger, 'Choose train', unitTypes, random);
      let train = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(game, tile, attackerPlayer, type$);
      train.setTreasureAmount(plunder);
    }
    let score = spec.getInteger(GameOptions.DESTROY_SETTLEMENT_SCORE);
    let h = new HistoryEvent()._HistoryEvent$Turn$HistoryEventType$Player(game.getTurn(), HistoryEvent$HistoryEventType.DESTROY_SETTLEMENT, this).addStringTemplate$String$StringTemplate('%nation%', nativeNation).addName$String$String('%settlement%', settlementName);
    h.setScore(score);
    cs.addHistory(attackerPlayer, h);
    cs.addMessage(attackerPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.destroySettlement.enemy', attacker).addName$String$String('%settlement%', settlementName).addStringTemplate$String$StringTemplate('%unit%', attacker.getLabel$()).addStringTemplate$String$StringTemplate('%nativeNation%', nativeNation).addAmount('%amount%', plunder));
    if (capital) {
      cs.addMessage(attackerPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'combat.destroySettlement.enemy.capital', attacker).addStringTemplate$String$StringTemplate('%nation%', nativeNation));
    }
    if ((nativePlayer).checkForDeath() === ServerPlayer$DeadCheck.IS_DEAD) {
      h = new HistoryEvent()._HistoryEvent$Turn$HistoryEventType$Player(game.getTurn(), HistoryEvent$HistoryEventType.DESTROY_NATION, this).addStringTemplate$String$StringTemplate('%nation%', attackerNation).addStringTemplate$String$StringTemplate('%nativeNation%', nativeNation);
      h.setScore(ServerPlayer.SCORE_NATION_DESTROYED);
      cs.addGlobalHistory(game, h);
    }
    cs.addAttribute(ChangeSet$See.only(attackerPlayer), 'sound', 'sound.event.destroySettlement');
  }
  /**
   * Disposes of a settlement and reassign its tiles.
   *
   * +vis,til: Resolves the whole mess.
   *
   * @param settlement The {@code Settlement} under attack.
   * @param cs A {@code ChangeSet} to update.
   */
  csDisposeSettlement(settlement: Settlement, cs: ChangeSet): void {
    let owner = settlement.getOwner();
    let owned = settlement.getOwnedTiles();
    ServerPlayer.logger.finest('Disposing of ' + settlement.getName());
    for (const $it63 = owned.iterator(); $it63.hasNext(); ) {
      let t = $it63.next();
      t.cacheUnseen$();
    }
    let centerTile = settlement.getTile$();
    let missionaryOwner = null;
    let radius = 0;
    if (settlement instanceof ServerIndianSettlement) {
      let sis = settlement;
      if (sis.hasMissionary$()) {
        missionaryOwner = sis.getMissionary().getOwner();
        radius = sis.getMissionaryLineOfSight();
        sis.csKillMissionary(true, cs);
      }
    }
    settlement.exciseSettlement();
    owner.removeSettlement(settlement);
    if (owner.hasSettlement(settlement)) {
      throw new IllegalStateException('Still has settlement: ' + $J.str(settlement));
    }
    (owner).reassignTiles(owned, null);
    let vis = ChangeSet$See.perhaps().always(owner);
    if (missionaryOwner != null) {
      vis.except(missionaryOwner);
    }
    cs.add$See$Collection(vis, owned);
    cs.addRemove(vis, centerTile, settlement);
    settlement.dispose();
    owner.invalidateCanSeeTiles();
    if (missionaryOwner != null) {
      let surrounding = CollectionUtils.transform$Collection$Predicate(centerTile.getSurroundingTiles$int$int(1, radius), (t) => !owned.contains(t));
      cs.add$See$Collection(ChangeSet$See.only(missionaryOwner), owned);
      cs.add$See$Collection(ChangeSet$See.only(missionaryOwner), surrounding);
      cs.addRemove(ChangeSet$See.only(missionaryOwner), centerTile, settlement);
      missionaryOwner.invalidateCanSeeTiles();
      for (const $it64 = surrounding.iterator(); $it64.hasNext(); ) {
        let t = $it64.next();
        t.cacheUnseen$Player(missionaryOwner);
      }
    }
    for (const $it65 = owned.iterator(); $it65.hasNext(); ) {
      let t = $it65.next();
      t.cacheUnseen$();
    }
    if (settlement instanceof IndianSettlement) {
      centerTile.seeTile$();
    }
    if (missionaryOwner != null) {
      centerTile.seeTile$Player(missionaryOwner);
    }
  }
  /**
   * Evade a normal attack.
   *
   * @param attacker The attacker {@code Unit}.
   * @param defender A naval {@code Unit} that evades the attacker.
   * @param cs A {@code ChangeSet} to update.
   */
  csEvadeAttack(attacker: Unit, defender: Unit, cs: ChangeSet): void {
    let attackerPlayer = attacker.getOwner();
    let attackerNation = attacker.getApparentOwnerName();
    let attackerLocation = attacker.getLocation();
    let defenderPlayer = defender.getOwner();
    let defenderNation = defender.getApparentOwnerName();
    let defenderLocation = defender.getLocation();
    cs.addMessage(attackerPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.shipEvaded.enemy', attacker).addStringTemplate$String$StringTemplate('%location%', attackerLocation.getLocationLabelFor(attackerPlayer)).addStringTemplate$String$StringTemplate('%unit%', attacker.getLabel$()).addStringTemplate$String$StringTemplate('%enemyNation%', defenderNation).addStringTemplate$String$StringTemplate('%enemyUnit%', defender.getLabel$()));
    cs.addMessage(defenderPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.shipEvaded.ours', defender).addStringTemplate$String$StringTemplate('%location%', defenderLocation.getLocationLabelFor(defenderPlayer)).addStringTemplate$String$StringTemplate('%unit%', defender.getLabel$()).addStringTemplate$String$StringTemplate('%enemyNation%', attackerNation).addStringTemplate$String$StringTemplate('%enemyUnit%', attacker.getLabel$()));
  }
  /**
   * Evade a bombardment.
   *
   * @param settlement The attacker {@code Settlement}.
   * @param defender A naval {@code Unit} that evades the attacker.
   * @param cs A {@code ChangeSet} to update.
   */
  csEvadeBombard(settlement: Settlement, defender: Unit, cs: ChangeSet): void {
    let attackerPlayer = settlement.getOwner();
    let defenderPlayer = defender.getOwner();
    let defenderNation = defender.getApparentOwnerName();
    let building = (settlement).getStockade();
    cs.addMessage(attackerPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.shipEvadedBombardment.enemy', settlement).addStringTemplate$String$StringTemplate('%location%', settlement.getLocationLabelFor(attackerPlayer)).addNamed$String$Named('%building%', building).addStringTemplate$String$StringTemplate('%enemyNation%', defenderNation).addStringTemplate$String$StringTemplate('%enemyUnit%', defender.getLabel$()));
    cs.addMessage(defenderPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.shipEvadedBombardment.ours', defender).addStringTemplate$String$StringTemplate('%location%', settlement.getLocationLabelFor(defenderPlayer)).addStringTemplate$String$StringTemplate('%unit%', defender.getLabel$()).addNamed$String$Named('%building%', building).addStringTemplate$String$StringTemplate('%enemyNation%', attackerPlayer.getNationLabel()));
  }
  /**
   * Loot a ship.
   *
   * @param winner The winning naval {@code Unit}.
   * @param loser The losing naval {@code Unit}
   * @param cs A {@code ChangeSet} to update.
   */
  csLootShip(winner: Unit, loser: Unit, cs: ChangeSet): void {
    let winnerPlayer = winner.getOwner();
    let capture = loser.getGoodsList();
    if (!capture.isEmpty() && winner.hasSpaceLeft()) {
      for (const $it66 = capture.iterator(); $it66.hasNext(); ) {
        let g = $it66.next();
        g.setLocation(null);
      }
      new LootSession()._LootSession(winner, loser, capture).register();
      cs.add$See$Message(ChangeSet$See.only(winnerPlayer), new LootCargoMessage()._LootCargoMessage$Unit$String$List(winner, loser.getId(), capture));
    }
    loser.getGoodsContainer().removeAll();
    loser.setState(Unit$UnitState.ACTIVE);
  }
  /**
   * Unit auto equips but loses equipment.
   *
   * @param attacker The {@code Unit} that attacked.
   * @param defender The {@code Unit} that defended and loses equipment.
   * @param cs A {@code ChangeSet} to update.
   */
  csLoseAutoEquip(attacker: Unit, defender: Unit, cs: ChangeSet): void {
    let defenderPlayer = defender.getOwner();
    let defenderNation = defenderPlayer.getNationLabel();
    let settlement = defender.getSettlement();
    let role = defender.getAutomaticRole();
    let defenderLabel = Messages.getUnitLabel(null, defender.getType().getId(), 1, defenderPlayer.getNation().getId(), role.getId(), null);
    let attackerPlayer = attacker.getOwner();
    let attackerNation = attacker.getApparentOwnerName();
    for (const $it67 = role.getRequiredGoodsList$().iterator(); $it67.hasNext(); ) {
      let ag = $it67.next();
      settlement.removeGoods$AbstractGoods(ag);
    }
    cs.addMessage(attackerPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.unitDemotedToUnarmed.enemy', attacker).addStringTemplate$String$StringTemplate('%location%', settlement.getLocationLabelFor(attackerPlayer)).addStringTemplate$String$StringTemplate('%unit%', attacker.getLabel$()).addStringTemplate$String$StringTemplate('%oldName%', defenderLabel).addStringTemplate$String$StringTemplate('%enemyNation%', defenderNation).addStringTemplate$String$StringTemplate('%enemyUnit%', defender.getLabel$()));
    cs.addMessage(defenderPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.unitLoseAutoEquip', defender).addStringTemplate$String$StringTemplate('%location%', settlement.getLocationLabelFor(defenderPlayer)).addStringTemplate$String$StringTemplate('%unit%', defender.getLabel$()).addStringTemplate$String$StringTemplate('%enemyNation%', attackerNation).addStringTemplate$String$StringTemplate('%enemyUnit%', attacker.getLabel$()));
  }
  /**
   * Unit drops some equipment.
   *
   * @param winner The {@code Unit} that won.
   * @param loser The {@code Unit} that lost and loses equipment.
   * @param cs A {@code ChangeSet} to update.
   */
  csLoseEquip(winner: Unit, loser: Unit, cs: ChangeSet): void {
    let spec = this.getSpecification();
    let loserPlayer = loser.getOwner();
    let loserNation = loserPlayer.getNationLabel();
    let loserLocation = loser.getLocation().getLocationLabelFor(loserPlayer);
    let loserLabel = loser.getLabel$();
    let winnerPlayer = winner.getOwner();
    let winnerNation = winner.getApparentOwnerName();
    let winnerLocation = winner.getLocation().getLocationLabelFor(winnerPlayer);
    let role = loser.getRole();
    let downgrade = role.getDowngrade();
    if (downgrade != null) {
      loser.changeRole(downgrade, 1);
    } else {
      loser.changeRole(spec.getDefaultRole(), 0);
    }
    loser.setMovesLeft(Math.min(loser.getMovesLeft(), loser.getInitialMovesLeft()));
    if (!loser.isArmed()) {
      cs.addMessage(winnerPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.unitDemotedToUnarmed.enemy', winner).addStringTemplate$String$StringTemplate('%location%', winnerLocation).addStringTemplate$String$StringTemplate('%unit%', winner.getLabel$()).addStringTemplate$String$StringTemplate('%oldName%', loserLabel).addStringTemplate$String$StringTemplate('%enemyNation%', loserNation).addStringTemplate$String$StringTemplate('%enemyUnit%', loser.getLabel$()));
      cs.addMessage(loserPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.unitDemotedToUnarmed.ours', loser).addStringTemplate$String$StringTemplate('%location%', loserLocation).addStringTemplate$String$StringTemplate('%oldName%', loserLabel).addStringTemplate$String$StringTemplate('%unit%', loser.getLabel$()).addStringTemplate$String$StringTemplate('%enemyNation%', winnerNation).addStringTemplate$String$StringTemplate('%enemyUnit%', winner.getLabel$()));
      loser.setState(Unit$UnitState.ACTIVE);
    } else {
      let key = 'combat.unitDemoted.enemy.' + loser.getType().getSuffix$();
      cs.addMessage(winnerPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, key, winner).addDefaultId('combat.unitDemoted.enemy').addStringTemplate$String$StringTemplate('%location%', winnerLocation).addStringTemplate$String$StringTemplate('%unit%', winner.getLabel$()).addStringTemplate$String$StringTemplate('%oldName%', loserLabel).addStringTemplate$String$StringTemplate('%enemyNation%', loserNation).addStringTemplate$String$StringTemplate('%enemyUnit%', loser.getLabel$()));
      key = 'combat.unitDemoted.ours.' + loser.getType().getSuffix$();
      cs.addMessage(loserPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, key, loser).addDefaultId('combat.unitDemoted.ours').addStringTemplate$String$StringTemplate('%location%', loserLocation).addStringTemplate$String$StringTemplate('%oldName%', loserLabel).addStringTemplate$String$StringTemplate('%unit%', loser.getLabel$()).addStringTemplate$String$StringTemplate('%enemyNation%', winnerNation).addStringTemplate$String$StringTemplate('%enemyUnit%', winner.getLabel$()));
    }
  }
  /**
   * Hook for when a player loses access to a location for whatever
   * reason.  Useful for disabling trade routes.
   *
   * @param loc The {@code Location} that was lost.
   * @param cs A {@code ChangeSet} to update.
   */
  csLoseLocation(loc: Location, cs: ChangeSet): void {
    for (const $it68 = (CollectionUtils.transform$Collection$Predicate(this.getTradeRoutes(), (r) => r.removeMatchingStops(loc))).iterator(); $it68.hasNext(); ) {
      let tr = $it68.next();
      for (const $it69 = tr.getAssignedUnits().iterator(); $it69.hasNext(); ) {
        let u = $it69.next();
        u.setTradeRoute(null);
        cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(this), [u]);
      }
      cs.addMessage(this, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.GOODS_MOVEMENT, 'combat.tradeRouteSuspended', this).addName$String$String('%route%', tr.getName()).addStringTemplate$String$StringTemplate('%stop%', loc.getLocationLabel()));
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(this), [tr]);
    }
  }
  /**
   * Damage a building or a ship or steal some goods or gold.
   *
   * @param attacker The attacking {@code Unit}.
   * @param colony The {@code Colony} to pillage.
   * @param random A pseudo-random number source.
   * @param cs A {@code ChangeSet} to update.
   */
  csPillageColony(attacker: Unit, colony: Colony, random: Random, cs: ChangeSet): void {
    let attackerPlayer = attacker.getOwner();
    let attackerNation = attacker.getApparentOwnerName();
    let colonyPlayer = colony.getOwner();
    let colonyNation = colonyPlayer.getNationLabel();
    let buildingList = colony.getBurnableBuildings();
    let shipList = colony.getTile$().getNavalUnits();
    let goodsList = colony.getLootableGoodsList();
    let pillage = RandomUtils.randomInt(ServerPlayer.logger, 'Pillage choice', random, (buildingList.size() + shipList.size() + goodsList.size() + ((colony.canBePlundered()) ? 1 : 0)) | 0);
    if (pillage < buildingList.size()) {
      let building = buildingList.get(pillage);
      this.csDamageBuilding(building, cs);
      cs.addMessage(colonyPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.raid.building', colony).addName$String$String('%colony%', colony.getName()).addNamed$String$Named('%building%', building).addStringTemplate$String$StringTemplate('%enemyNation%', attackerNation).addStringTemplate$String$StringTemplate('%enemyUnit%', attacker.getLabel$()));
    } else if (pillage < ((buildingList.size() + shipList.size()) | 0)) {
      let ship = shipList.get((pillage - buildingList.size()) | 0);
      if (ship.getRepairLocation() == null) {
        this.csSinkShipAttack(attacker, ship, cs);
      } else {
        this.csDamageShipAttack(attacker, ship, cs);
      }
    } else if (pillage < ((buildingList.size() + shipList.size() + goodsList.size()) | 0)) {
      let goods = goodsList.get((pillage - buildingList.size() - shipList.size()) | 0);
      goods.setAmount(Math.min($J.idiv(goods.getAmount(), 2), 50));
      colony.removeGoods$AbstractGoods(goods);
      if (attacker.canAdd(goods)) {
        attacker.add(goods);
      }
      cs.addMessage(colonyPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.raid.goods', colony, goods).addName$String$String('%colony%', colony.getName()).addAmount('%amount%', goods.getAmount()).addNamed$String$Named('%goods%', goods.getType()).addStringTemplate$String$StringTemplate('%enemyNation%', attackerNation).addStringTemplate$String$StringTemplate('%enemyUnit%', attacker.getLabel$()));
    } else {
      let plunder = Math.max(1, $J.idiv(colony.getPlunder(attacker, random), 5));
      colonyPlayer.modifyGold(-plunder);
      attackerPlayer.modifyGold(plunder);
      cs.addPartial(ChangeSet$See.only(colonyPlayer), colonyPlayer, ['gold', String(colonyPlayer.getGold())]);
      cs.addMessage(colonyPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.raid.plunder', colony).addAmount('%amount%', plunder).addName$String$String('%colony%', colony.getName()).addStringTemplate$String$StringTemplate('%enemyNation%', attackerNation).addStringTemplate$String$StringTemplate('%enemyUnit%', attacker.getLabel$()));
    }
    cs.addGlobalMessage(this.getGame(), colonyPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.raid.other', colonyPlayer).addName$String$String('%colony%', colony.getName()).addStringTemplate$String$StringTemplate('%colonyNation%', colonyNation).addStringTemplate$String$StringTemplate('%nation%', attackerNation));
  }
  /**
   * Damage a building in a colony by downgrading it if possible and
   * destroying it otherwise.
   *
   * This is called as a result of pillaging, which always updates
   * the colony tile.
   *
   * @param building The {@code Building} to damage.
   * @param cs a {@code ChangeSet} value
   */
  csDamageBuilding(building: Building, cs: ChangeSet): void {
    let colony = building.getColony();
    let copied = colony.getTile$().getTileToCache();
    let changed = false;
    let type$ = building.getType();
    if (type$.getUpgradesFrom() == null) {
      changed = colony.ejectUnits(building, building.getUnitList());
      colony.destroyBuilding(building);
      changed = !!(changed | building.getType().isDefenceType());
      cs.addRemove(ChangeSet$See.only(colony.getOwner()), colony, building);
      building.dispose();
      for (const $it70 = (CollectionUtils.transform$Stream$Predicate(colony.getAllWorkLocations(), (w) => !w.isEmpty() && !w.canBeWorked())).iterator(); $it70.hasNext(); ) {
        let wl = $it70.next();
        changed = !!(changed | colony.ejectUnits(wl, wl.getUnitList()));
        ServerPlayer.logger.info('Units ejected from workLocation ' + wl.getId() + ' on loss of ' + building.getType().getSuffix$());
      }
    } else if (building.canBeDamaged()) {
      changed = colony.ejectUnits(building, building.downgrade());
      changed = !!(changed | building.getType().isDefenceType());
    } else {
      return;
    }
    if (changed) {
      colony.getTile$().cacheUnseen$Tile(copied);
    }
    if (this.isAI()) {
      colony.firePropertyChange$String$boolean$boolean(Colony.REARRANGE_COLONY, true, false);
    }
  }
  /**
   * Promotes a unit.
   *
   * @param winner The {@code Unit} that won and should be promoted.
   * @param cs A {@code ChangeSet} to update.
   */
  csPromoteUnit(winner: Unit, cs: ChangeSet): void {
    let winnerPlayer = winner.getOwner();
    let winnerLabel = winner.getLabel$();
    let uc = winner.getUnitChange$String(UnitChangeType.PROMOTION);
    if (uc == null || uc.to === winner.getType()) {
      ServerPlayer.logger.warning('Promotion failed, type=' + ((uc == null) ? 'null' : 'same type: ' + $J.str(uc.to)));
      return;
    }
    winner.changeType(uc.to);
    winnerPlayer.invalidateCanSeeTiles();
    cs.addMessage(winnerPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.unitPromoted', winner).addStringTemplate$String$StringTemplate('%oldName%', winnerLabel).addStringTemplate$String$StringTemplate('%unit%', winner.getLabel$()));
  }
  /**
   * Sinks all ships in a colony.
   *
   * @param attacker The attacker {@code Unit}.
   * @param colony The {@code Colony} to sink ships in.
   * @param cs A {@code ChangeSet} to update.
   */
  csSinkColonyShips(attacker: Unit, colony: Colony, cs: ChangeSet): void {
    let captureRepairing = this.getSpecification().getBoolean(GameOptions.CAPTURE_UNITS_UNDER_REPAIR);
    let units = CollectionUtils.transform$Stream$Predicate(colony.getTile$().getUnits(), (u) => u.isNaval() && !(captureRepairing && u.isDamaged()));
    if (!units.isEmpty()) {
      let shipPlayer = colony.getOwner();
      let attackerPlayer = attacker.getOwner();
      let t = StringTemplate.label(', ');
      for (const $it71 = units.iterator(); $it71.hasNext(); ) {
        let u = $it71.next();
        this.csSinkShip(u, attackerPlayer, cs);
        t.addStringTemplate$StringTemplate(u.getLabel$());
      }
      cs.addMessage(shipPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.shipsSunk', shipPlayer).addStringTemplate$String$StringTemplate('%ships%', t).addAmount('%number%', units.size()));
    }
  }
  /**
   * Sinks this ship as result of a normal attack.
   *
   * @param attacker The attacker {@code Unit}.
   * @param ship The naval {@code Unit} to sink.
   * @param cs A {@code ChangeSet} to update.
   */
  csSinkShipAttack(attacker: Unit, ship: Unit, cs: ChangeSet): void {
    let shipPlayer = ship.getOwner();
    let shipNation = ship.getApparentOwnerName();
    let shipLocation = ship.getLocation();
    let attackerUnit = attacker;
    let attackerPlayer = attackerUnit.getOwner();
    let attackerNation = attackerUnit.getApparentOwnerName();
    cs.addMessage(attackerPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.shipSunk.enemy', attackerUnit).addStringTemplate$String$StringTemplate('%location%', shipLocation.getLocationLabelFor(attackerPlayer)).addStringTemplate$String$StringTemplate('%unit%', attackerUnit.getLabel$()).addStringTemplate$String$StringTemplate('%enemyUnit%', ship.getLabel$()).addStringTemplate$String$StringTemplate('%enemyNation%', shipNation));
    cs.addMessage(shipPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.shipSunk.ours', ship.getTile$()).addStringTemplate$String$StringTemplate('%location%', shipLocation.getLocationLabelFor(shipPlayer)).addStringTemplate$String$StringTemplate('%unit%', ship.getLabel$()).addStringTemplate$String$StringTemplate('%enemyUnit%', attackerUnit.getLabel$()).addStringTemplate$String$StringTemplate('%enemyNation%', attackerNation));
    this.csSinkShip(ship, attackerPlayer, cs);
  }
  /**
   * Sinks this ship as result of a bombard.
   *
   * @param settlement The bombarding {@code Settlement}.
   * @param ship The naval {@code Unit} to sink.
   * @param cs A {@code ChangeSet} to update.
   */
  csSinkShipBombard(settlement: Settlement, ship: Unit, cs: ChangeSet): void {
    let attackerPlayer = settlement.getOwner();
    let shipPlayer = ship.getOwner();
    let shipNation = ship.getApparentOwnerName();
    let building = (settlement).getStockade();
    cs.addMessage(attackerPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.shipSunkByBombardment.enemy', settlement).addStringTemplate$String$StringTemplate('%location%', settlement.getLocationLabelFor(attackerPlayer)).addNamed$String$Named('%building%', building).addStringTemplate$String$StringTemplate('%enemyUnit%', ship.getLabel$()).addStringTemplate$String$StringTemplate('%enemyNation%', shipNation));
    cs.addMessage(shipPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, 'combat.shipSunkByBombardment', ship.getTile$()).addStringTemplate$String$StringTemplate('%location%', settlement.getLocationLabelFor(shipPlayer)).addStringTemplate$String$StringTemplate('%unit%', ship.getLabel$()).addNamed$String$Named('%building%', building).addStringTemplate$String$StringTemplate('%enemyNation%', attackerPlayer.getNationLabel()));
    this.csSinkShip(ship, attackerPlayer, cs);
  }
  /**
   * Sink the ship.
   *
   * @param ship The naval {@code Unit} to sink.
   * @param attackerPlayer The {@code Player} that attacked, or null
   * @param cs A {@code ChangeSet} to update.
   */
  csSinkShip(ship: Unit, attackerPlayer: Player, cs: ChangeSet): void {
    let shipPlayer = ship.getOwner();
    (ship).csRemove(ChangeSet$See.perhaps().always(shipPlayer), ship.getLocation(), cs);
    shipPlayer.invalidateCanSeeTiles();
    if (attackerPlayer != null) {
      cs.addAttribute(ChangeSet$See.only(attackerPlayer), 'sound', 'sound.event.shipSunk');
    }
  }
  /**
   * Slaughter a unit.
   *
   * @param winner The {@code Unit} that is slaughtering.
   * @param loser The {@code Unit} to slaughter.
   * @param cs A {@code ChangeSet} to update.
   */
  csSlaughterUnit(winner: Unit, loser: Unit, cs: ChangeSet): void {
    let winnerPlayer = winner.getOwner();
    let winnerNation = winner.getApparentOwnerName();
    let winnerLoc = (winner.isInColony()) ? winner.getColony() : winner.getLocation();
    let winnerLocation = winnerLoc.getLocationLabelFor(winnerPlayer);
    let loserPlayer = loser.getOwner();
    let loserNation = loser.getApparentOwnerName();
    let loserLoc = (loser.isInColony()) ? loser.getColony() : loser.getLocation();
    let loserLocation = loserLoc.getLocationLabelFor(loserPlayer);
    let key = 'combat.unitSlaughtered.enemy.' + loser.getType().getSuffix$();
    cs.addMessage(winnerPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, key, winner).addDefaultId('combat.unitSlaughtered.enemy').addStringTemplate$String$StringTemplate('%location%', winnerLocation).addStringTemplate$String$StringTemplate('%unit%', winner.getLabel$()).addStringTemplate$String$StringTemplate('%enemyNation%', loserNation).addStringTemplate$String$StringTemplate('%enemyUnit%', loser.getLabel$()));
    key = 'combat.unitSlaughtered.ours.' + loser.getType().getSuffix$();
    cs.addMessage(loserPlayer, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.COMBAT_RESULT, key, loser.getTile$()).addDefaultId('combat.unitSlaughtered.ours').addStringTemplate$String$StringTemplate('%location%', loserLocation).addStringTemplate$String$StringTemplate('%unit%', loser.getLabel$()).addStringTemplate$String$StringTemplate('%enemyNation%', winnerNation).addStringTemplate$String$StringTemplate('%enemyUnit%', winner.getLabel$()));
    if (loserPlayer.isIndian() && (loserPlayer).checkForDeath() === ServerPlayer$DeadCheck.IS_DEAD) {
      let nativeNation = loserPlayer.getNationLabel();
      cs.addGlobalHistory(this.getGame(), new HistoryEvent()._HistoryEvent$Turn$HistoryEventType$Player(this.getGame().getTurn(), HistoryEvent$HistoryEventType.DESTROY_NATION, winnerPlayer).addStringTemplate$String$StringTemplate('%nation%', winnerPlayer.getNationLabel()).addStringTemplate$String$StringTemplate('%nativeNation%', nativeNation));
    }
    (loser).csRemove((loserLoc.getSettlement() != null) ? ChangeSet$See.only(loserPlayer) : ChangeSet$See.perhaps().always(loserPlayer), loserLoc, cs);
    loserPlayer.invalidateCanSeeTiles();
  }
  /**
   * Updates the player view for each new tile on a supplied list,
   * and update a ChangeSet as well.
   *
   * @param newTiles A list of {@code Tile}s to update.
   * @param cs A {@code ChangeSet} to update.
   */
  csSeeNewTiles(newTiles: Collection<Tile>, cs: ChangeSet): void {
    this.exploreTiles(newTiles);
    cs.add$See$Collection(ChangeSet$See.only(this), newTiles);
  }
  /**
   * Make a tea party modifier for the current turn.
   *
   * Public for the test suite.
   *
   * @return A tea party {@code Modifier}.
   */
  makeTeaPartyModifier(): Modifier {
    let spec = this.getGame().getSpecification();
    let turn = this.getGame().getTurn();
    let modifier = CollectionUtils.first$Stream(spec.getModifiers(Modifier.COLONY_GOODS_PARTY));
    if (modifier != null) {
      modifier = Modifier.makeTimedModifier('model.goods.bells', modifier, turn);
      modifier.setModifierIndex(Modifier.PARTY_PRODUCTION_INDEX);
    }
    return modifier;
  }
  /**
   * Raises the players tax rate, or handles a goods party.
   *
   * @param tax The new tax rate.
   * @param goods The {@code Goods} to use in a goods party.
   * @param accepted Whether the tax raise was accepted.
   * @param cs A {@code ChangeSet} to update.
   */
  csRaiseTax(tax: number, goods: Goods, accepted: boolean, cs: ChangeSet): void {
    let goodsType = goods.getType();
    let colony = goods.getLocation();
    let amount = Math.min(goods.getAmount(), GoodsContainer.CARGO_SIZE);
    if (accepted) {
      this.csSetTax(tax, cs);
      ServerPlayer.logger.info('Accepted tax raise to: ' + tax);
    } else if (colony.getGoodsCount(goodsType) < amount) {
      let extraTax = 3;
      this.csSetTax((tax + extraTax) | 0, cs);
      cs.add$See$Message(ChangeSet$See.only(this), new MonarchActionMessage()._MonarchActionMessage$MonarchAction$StringTemplate$String(Monarch$MonarchAction.FORCE_TAX, StringTemplate.template$String(Monarch$MonarchAction.FORCE_TAX.getTextKey()).addAmount('%amount%', (tax + extraTax) | 0), this.getNationId()));
      ServerPlayer.logger.info('Forced tax raise to: ' + ((tax + extraTax) | 0));
    } else {
      let spec = this.getGame().getSpecification();
      colony.getGoodsContainer().saveState();
      colony.removeGoods$GoodsType$int(goodsType, amount);
      let arrears = Math.imul(this.market.getPaidForSale(goodsType), spec.getInteger(GameOptions.ARREARS_FACTOR));
      let market = this.getMarket();
      market.setArrears(goodsType, arrears);
      let tpm = this.makeTeaPartyModifier();
      cs.addModifier(this, colony, tpm, true);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(this), [colony.getGoodsContainer()]);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(this), [market.getMarketData$GoodsType(goodsType)]);
      let messageId = 'model.player.colonyGoodsParty.' + goodsType.getSuffix$();
      if (!Messages.containsKey(messageId)) {
        messageId = (colony.isLandLocked()) ? 'model.player.colonyGoodsParty.landLocked' : 'model.player.colonyGoodsParty.harbour';
      }
      cs.addMessage(this, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, messageId, this).addName$String$String('%colony%', colony.getName()).addAmount('%amount%', amount).addNamed$String$Named('%goods%', goodsType));
      cs.addAttribute(ChangeSet$See.only(this), 'flush', $J.str(true));
      ServerPlayer.logger.info('Goods party at ' + colony.getName() + ' with: ' + $J.str(goods) + ' arrears: ' + arrears);
      if (this.isAI()) {
        colony.firePropertyChange$String$Object$Object(Colony.REARRANGE_COLONY, goodsType, null);
      }
    }
  }
  /**
   * Handle the end of a session where the player has ignored a tax
   * increase demand.
   *
   * @param tax The new tax rate.
   * @param goods The {@code Goods} to use in a goods party.
   * @param cs A {@code ChangeSet} to update.
   */
  ignoreTax(tax: number, goods: Goods, cs: ChangeSet): void {
    this.csRaiseTax(tax, goods, true, cs);
    cs.addMessage(this, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'model.player.ignoredTax', this).addAmount('%amount%', tax));
  }
  /**
   * Handle the end of a session where the player has ignored an
   * offer of mercenaries.
   *
   * @param cs A {@code ChangeSet} to update.
   */
  ignoreMercenaries(cs: ChangeSet): void {
    cs.addMessage(this, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'model.player.ignoredMercenaries', this));
  }
  /**
   * Add an independent (non-monarch) mercenary offer to the player.
   *
   * @param price The price to charge for the mercenaries.
   * @param mercenaries A list of mercenary units.
   * @param action The monarch action that caused the offer.
   * @param random A pseudo-random number source.
   * @param cs A {@code ChangeSet} to update.
   */
  csMercenaries(price: number, mercenaries: List<AbstractUnit>, action: Monarch$MonarchAction, random: Random, cs: ChangeSet): void {
    if (price <= 0 || mercenaries.isEmpty()) {
      return;
    }
    let n = NameCache.getMercenaryLeaderIndex(random);
    cs.add$See$Message(ChangeSet$See.only(this), new MonarchActionMessage()._MonarchActionMessage$MonarchAction$StringTemplate$String(action, StringTemplate.template$String(action.getTextKey()).addName$String$String('%leader%', NameCache.getMercenaryLeaderName(n)).addAmount('%gold%', price).addStringTemplate$String$StringTemplate('%mercenaries%', AbstractUnit.getListLabel(', ', mercenaries)), String(n)));
    new MonarchSession()._MonarchSession$ServerPlayer$MonarchAction$List$int(this, action, mercenaries, price).register();
  }
  /**
   * Set the player tax rate.
   * If this requires a change to the bells bonuses, we have to update
   * the whole player (bah) because we can not yet independently update
   * the feature container.
   *
   * @param tax The new tax rate.
   * @param cs A {@code ChangeSet} to update.
   */
  csSetTax(tax: number, cs: ChangeSet): void {
    this.setTax(tax);
    if (this.recalculateBellsBonus()) {
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(this), [this]);
    } else {
      cs.addPartial(ChangeSet$See.only(this), this, ['tax', String(this.getTax())]);
    }
  }
  /**
   * Adds mercenaries that the player has accepted.
   *
   * @param mercs A list of mercenaries.
   * @param price The price to be charged for them.
   * @param random A pseudo-random number source.
   * @param cs A {@code ChangeSet} to update.
   */
  csAddMercenaries(mercs: List<AbstractUnit>, price: number, random: Random, cs: ChangeSet): void {
    if (this.checkGold(price)) {
      let spec = this.getSpecification();
      let isNaval = (au) => au.getType(spec).isNaval();
      let isLand = (au) => !au.getType(spec).isNaval();
      let naval = CollectionUtils.transform$Collection$Predicate(mercs, isNaval);
      let dst: Tile;
      if (naval.isEmpty()) {
        dst = CollectionUtils.first$Stream(this.getColonies()).getTile$();
        this.createUnits(mercs, dst, null);
        cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(this), [dst]);
      } else {
        dst = this.getEntryTile();
        this.loadShips(this.createUnits(CollectionUtils.transform$Collection$Predicate(mercs, isLand), null, null), this.createUnits(naval, dst, random), null);
        this.invalidateCanSeeTiles();
        cs.add$See$FreeColGameObjectArr(ChangeSet$See.perhaps(), [dst]);
      }
      cs.addMessage(this, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.UNIT_ARRIVED, 'model.player.mercenariesArrived', this).addStringTemplate$String$StringTemplate('%location%', dst.up().getLocationLabelFor(this)));
      this.modifyGold(-price);
      cs.addPartial(ChangeSet$See.only(this), this, ['gold', String(this.getGold())]);
    } else {
      this.getMonarch().setDispleasure(true);
      cs.add$See$Message(ChangeSet$See.only(this), new MonarchActionMessage()._MonarchActionMessage$MonarchAction$StringTemplate$String(Monarch$MonarchAction.DISPLEASURE, StringTemplate.template$String(Monarch$MonarchAction.DISPLEASURE.getTextKey()), this.getNationId()));
    }
  }
  /**
   * Make contact between two nations if necessary.
   *
   * @param other The other {@code Player}.
   * @param cs A {@code ChangeSet} to update.
   * @return True if this was a first contact.
   */
  csContact(other: Player, cs: ChangeSet): boolean {
    if (this.hasContacted(other)) {
      return false;
    }
    let game = this.getGame();
    let turn = game.getTurn();
    if (this.isIndian()) {
      if (other.isIndian()) {
        return false;
      } else {
        cs.addHistory(other, new HistoryEvent()._HistoryEvent$Turn$HistoryEventType$Player(turn, HistoryEvent$HistoryEventType.MEET_NATION, other).addStringTemplate$String$StringTemplate('%nation%', this.getNationLabel()));
      }
    } else {
      cs.addHistory(this, new HistoryEvent()._HistoryEvent$Turn$HistoryEventType$Player(turn, HistoryEvent$HistoryEventType.MEET_NATION, other).addStringTemplate$String$StringTemplate('%nation%', other.getNationLabel()));
    }
    ServerPlayer.logger.finest('First contact between ' + this.getId() + ' and ' + other.getId());
    return true;
  }
  /**
   * Initiate first contact between this European and native player.
   *
   * @param other The native {@code Player}.
   * @param tile The {@code Tile} contact is made at if this is
   *     a first landing in the new world and it is owned by the
   *     other player.
   * @param cs A {@code ChangeSet} to update.
   */
  csNativeFirstContact(other: Player, tile: Tile, cs: ChangeSet): void {
    cs.add$See$Message(ChangeSet$See.only(this), new FirstContactMessage()._FirstContactMessage$Player$Player$Tile(this, other, tile));
    this.csChangeStance(Stance.PEACE, other, true, cs);
    if (tile != null) {
      let ds = new DiplomacySession()._DiplomacySession$Unit$Settlement$long(tile.getFirstUnit(), tile.getOwningSettlement(), FreeCol.getTimeout(false));
      ds.register();
      ds.setAgreement(DiplomaticTrade.makePeaceTreaty(DiplomaticTrade$TradeContext.CONTACT, this, other));
    }
  }
  /**
   * Initiate first contact between this European and another
   * European player.
   *
   * @param unit The {@code Unit} making contact.
   * @param settlement The {@code Settlement} being contacted.
   * @param otherUnit The other {@code Unit} being contacted.
   * @param cs A {@code ChangeSet} to update.
   */
  csEuropeanFirstContact(unit: Unit, settlement: Settlement, otherUnit: Unit, cs: ChangeSet): void {
    let ds: DiplomacySession;
    let other: Player;
    if (settlement instanceof Colony) {
      other = settlement.getOwner();
      ds = DiplomacySession.findContactSession$Unit$Settlement(unit, settlement);
    } else if (otherUnit != null) {
      other = otherUnit.getOwner();
      ds = DiplomacySession.findContactSession$Unit$Unit(unit, otherUnit);
    } else {
      throw new RuntimeException('Non-null settlement (' + $J.str(settlement) + ') or other unit (null) required');
    }
    if (ds != null) {
      return;
    }
    let agreement = DiplomaticTrade.makePeaceTreaty(DiplomaticTrade$TradeContext.CONTACT, this, other);
    let timeout = FreeCol.getTimeout(false);
    let session = (settlement == null) ? new DiplomacySession()._DiplomacySession$Unit$Unit$long(unit, otherUnit, timeout) : new DiplomacySession()._DiplomacySession$Unit$Settlement$long(unit, settlement, timeout);
    session.register();
    session.setAgreement(agreement);
    cs.add$See$Message(ChangeSet$See.only(this), session.getMessage(this));
    unit.setMovesLeft(0);
    cs.addPartial(ChangeSet$See.only(this), unit, ['movesLeft', String(unit.getMovesLeft())]);
    ServerPlayer.logger.info('New European contact for ' + $J.str(unit) + ', with session: ' + session.getKey());
  }
  /**
   * Change the owner of a unit or dispose of it if the change is
   * impossible.  Move the unit to a new location if necessary.
   * Also handle disappearance of any carried units that will now be
   * invisible to the new owner.
   *
   * -vis(owner,newOwner)
   *
   * @param unit The {@code Unit} to change ownership of.
   * @param newOwner The new owning {@code Player}.
   * @param change An optional accompanying change type.
   * @param loc A optional new {@code Location} for the unit.
   * @param cs A {@code ChangeSet} to update.
   * @return True if the new owner can have this unit.
   */
  csChangeOwner(unit: Unit, newOwner: Player, change: string, loc: Location, cs: ChangeSet): boolean {
    if (newOwner === this) {
      return true;
    }
    let oldTile = unit.getTile$();
    if (newOwner.isUndead()) {
      change = UnitChangeType.UNDEAD;
    }
    if (change != null) {
      let mainType = unit.getType();
      let uc: UnitTypeChange;
      if ((uc = unit.getUnitChange$String$UnitType$Player(change, null, newOwner)) == null) {
      } else if (uc.isAvailableTo(newOwner)) {
        mainType = uc.to;
      } else {
        ServerPlayer.logger.warning('Change type/owner failed for ' + $J.str(unit) + ' -> ' + $J.str(newOwner) + '(' + change + '/' + $J.str(uc) + ')');
        (unit).csRemove(ChangeSet$See.perhaps().always(this), oldTile, cs);
        return false;
      }
      for (const $it72 = unit.getUnitList().iterator(); $it72.hasNext(); ) {
        let u = $it72.next();
        if ((uc = u.getUnitChange$String$UnitType$Player(change, null, newOwner)) == null) {
        } else if (uc.isAvailableTo(newOwner)) {
          if (uc.to !== u.getType() && !u.changeType(uc.to)) {
            ServerPlayer.logger.warning('Type change failure: ' + $J.str(u) + ' -> ' + $J.str(uc.to));
          }
        } else {
          ServerPlayer.logger.warning('Change type/owner failed for cargo ' + $J.str(u) + ' -> ' + $J.str(newOwner) + '(' + change + '/' + $J.str(uc) + ')');
          (u).csRemove(ChangeSet$See.only(this), unit, cs);
        }
      }
      unit.changeOwner(newOwner);
      if (mainType !== unit.getType() && !unit.changeType(mainType)) {
        ServerPlayer.logger.warning('Type change failure: ' + $J.str(unit) + ' -> ' + $J.str(mainType));
        return false;
      }
    } else {
      unit.changeOwner(newOwner);
    }
    if (loc != null) {
      unit.setLocation(loc);
    }
    if (unit.isCarrier()) {
      cs.addRemoves(ChangeSet$See.only(this), unit, unit.getUnitList());
    }
    cs.add$See$Collection(ChangeSet$See.only(newOwner), (newOwner).exploreForUnit(unit));
    return true;
  }
  /**
   * Accept the native demand at a players colony.
   *
   * @param demandPlayer The {@code ServerPlayer} that is demanding.
   * @param unit The {@code Unit} that demanded.
   * @param colony The {@code Colony} that was demanded of.
   * @param type The {@code GoodsType} demanded, or null for gold.
   * @param amount The amount demanded.
   * @param result The result of the demand.
   * @param cs A {@code ChangeSet} to update.
   */
  csCompleteNativeDemand(demandPlayer: ServerPlayer, unit: Unit, colony: Colony, type$: GoodsType, amount: number, result: Constants$IndianDemandAction, cs: ChangeSet): void {
    cs.add$See$Message(ChangeSet$See.only(demandPlayer), new IndianDemandMessage()._IndianDemandMessage$Unit$Colony$GoodsType$int(unit, colony, type$, amount).setResult(result));
    if (result === Constants$IndianDemandAction.INDIAN_DEMAND_ACCEPT) {
      if (type$ == null) {
        this.modifyGold(-amount);
        demandPlayer.modifyGold(amount);
        cs.addPartial(ChangeSet$See.only(this), this, ['gold', String(this.getGold())]);
        cs.addPartial(ChangeSet$See.only(demandPlayer), demandPlayer, ['gold', String(demandPlayer.getGold())]);
      } else {
        let colonyContainer = colony.getGoodsContainer();
        let unitContainer = unit.getGoodsContainer();
        GoodsContainer.moveGoods(colonyContainer, type$, amount, unitContainer);
        cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(this), [colonyContainer]);
        cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(demandPlayer), [unitContainer]);
      }
      let difficulty = this.getSpecification().getInteger(GameOptions.NATIVE_DEMANDS);
      let tension = Math.imul(-((5 - difficulty) | 0), 50);
      let sis = unit.getHomeIndianSettlement();
      if (sis == null) {
        demandPlayer.csModifyTension$Player$int$ChangeSet(this, tension, cs);
      } else {
        sis.csModifyAlarm(this, tension, true, cs);
      }
    }
  }
  /**
   * Process European diplomacy according to an agreement.
   *
   * @param session The {@code DiplomacySession} underway.
   * @param agreement The {@code DiplomaticTrade} to consider.
   * @param cs A {@code ChangeSet} to update.
   */
  csDiplomacy(session: DiplomacySession, agreement: DiplomaticTrade, cs: ChangeSet): void {
    agreement.incrementVersion();
    let status = agreement.getStatus();
    {
      let otherPlayer: ServerPlayer;
      switch (status) {
        case DiplomaticTrade$TradeStatus.PROPOSE_TRADE:
          session.setAgreement(agreement);
          otherPlayer = session.getOtherPlayer$ServerPlayer(this);
          cs.add$See$Message(ChangeSet$See.only(otherPlayer), session.getMessage(otherPlayer));
          break;
        case DiplomaticTrade$TradeStatus.ACCEPT_TRADE:
          session.complete$boolean$ChangeSet(true, cs);
          break;
        case DiplomaticTrade$TradeStatus.REJECT_TRADE:
        default:
          session.complete$boolean$ChangeSet(false, cs);
          break;
      }
    }
  }
  /**
   * Things to do just before ending the turn for a player.
   *
   * @param cs A {@code ChangeSet} to update.
   */
  csEndTurn(cs: ChangeSet): void {
    for (const $it73 = this.getFreeBuildingTypes().iterator(); $it73.hasNext(); ) {
      let bt = $it73.next();
      for (const $it74 = this.getColonyList().iterator(); $it74.hasNext(); ) {
        let c = $it74.next();
        (c).csFreeBuilding(bt, cs);
      }
    }
  }
  /**
   * New turn for this player.
   *
   * @param random A {@code Random} number source.
   * @param lb A {@code LogBuilder} to log to.
   * @param cs A {@code ChangeSet} to update.
   */
  csNewTurn(random: Random, lb: LogBuilder, cs: ChangeSet): void {
    lb.add(['PLAYER ', this.getName(), ': ']);
    let game = this.getGame();
    let spec = this.getSpecification();
    let oldImmigration = this.getImmigration();
    let oldLiberty = this.getLiberty();
    let newSoL = 0;
    let newImmigration = 0;
    let newLiberty = 0;
    let settlements = this.getSettlementList();
    for (const $it75 = settlements.iterator(); $it75.hasNext(); ) {
      let settlement = $it75.next();
      (settlement).csNewTurn(random, lb, cs);
      newSoL = (newSoL + settlement.getSonsOfLiberty()) | 0;
    }
    let numberOfSettlements = settlements.size();
    if (numberOfSettlements > 0) {
      newSoL = $J.idiv(newSoL, numberOfSettlements);
      if ($J.idiv(this.oldSoL, 10) !== $J.idiv(newSoL, 10)) {
        let key = (newSoL > this.oldSoL) ? 'model.player.soLIncrease' : 'model.player.soLDecrease';
        cs.addMessage(this, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.SONS_OF_LIBERTY, key, this).addAmount('%oldSoL%', this.oldSoL).addAmount('%newSoL%', newSoL));
      }
      this.oldSoL = newSoL;
    }
    newImmigration = (this.getImmigration() - oldImmigration) | 0;
    newLiberty = (this.getLiberty() - oldLiberty) | 0;
    for (const $it76 = this.getUnitSet().iterator(); $it76.hasNext(); ) {
      let unit = $it76.next();
      try {
        (unit).csNewTurn(random, lb, cs);
      } catch ($e77) {
        if ($J.isa($e77, ClassCastException)) {
          let cce = $J.exc($e77);
          ServerPlayer.logger.log(Level.SEVERE, 'Not a ServerUnit: ' + unit.getId(), cce);
        } else {
          throw $e77;
        }
      }
    }
    if (this.europe != null) {
      (this.europe).csNewTurn(random, lb, cs);
      this.modifyImmigration(this.europe.getImmigration(newImmigration));
      newImmigration = (this.getImmigration() - oldImmigration) | 0;
    }
    if (this.isEuropean()) {
      if (!this.hasAbility$String(Ability.SELECT_RECRUIT)) {
        while (this.checkEmigrate()) {
          this.csEmigrate(Europe$MigrationType.getUnspecificSlot(), Europe$MigrationType.NORMAL, random, cs);
        }
      }
      if (newImmigration !== 0) {
        cs.addPartial(ChangeSet$See.only(this), this, ['immigration', String(this.getImmigration())]);
      }
      if (newLiberty !== 0) {
        cs.addPartial(ChangeSet$See.only(this), this, ['liberty', String(this.getLiberty())]);
      }
      if (spec.getBoolean(GameOptions.ENABLE_UPKEEP)) {
        this.csPayUpkeep(random, cs);
      }
      let disaster = spec.getPercentage(GameOptions.NATURAL_DISASTERS);
      if (disaster > 0) {
        this.csNaturalDisasters(random, cs, disaster);
      }
      if (this.isRebel() && this.interventionBells >= spec.getInteger(GameOptions.INTERVENTION_BELLS)) {
        this.interventionBells = -2147483648;
        let ports = this.getConnectedPortList();
        let port = RandomUtils.getRandomMember$Logger$String$List$Random(ServerPlayer.logger, 'Intervention port', ports, random);
        let portTile = port.getTile$();
        let entry = game.getMap().searchCircle(portTile, GoalDeciders.getSimpleHighSeasGoalDecider(), (portTile.getHighSeasCount() + 1) | 0).getSafeTile(this, random);
        let ivf = this.getMonarch().getInterventionForce();
        let land = this.createUnits(ivf.getLandUnitsList(), entry, random);
        let naval = this.createUnits(ivf.getNavalUnitsList(), entry, random);
        let leftOver = this.loadShips(land, naval, random);
        for (const $it78 = leftOver.iterator(); $it78.hasNext(); ) {
          let unit = $it78.next();
          ServerPlayer.logger.warning('Disposing of left over unit ' + $J.str(unit));
          unit.setLocationNoUpdate(null);
          unit.dispose();
        }
        let tiles = this.exploreForUnit(naval.get(0));
        tiles.add(entry);
        this.invalidateCanSeeTiles();
        cs.add$See$Collection(ChangeSet$See.perhaps(), tiles);
        cs.addMessage(this, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'model.player.interventionForceArrives', this));
        ServerPlayer.logger.info('Intervention force (' + naval.size() + ' naval, ' + land.size() + ' land, ' + leftOver.size() + ' left over) arrives at ' + $J.str(entry) + '(for ' + port.getName() + ')');
      }
      for (const $it79 = this.getColonyList().iterator(); $it79.hasNext(); ) {
        let c = $it79.next();
        (c).csNewTurnWarnings(random, lb, cs);
      }
    }
    while (!this.stanceDirty.isEmpty()) {
      let s = this.stanceDirty.removeAt(0);
      let sta = this.getStance(s);
      let war = sta === Stance.WAR;
      if (sta === Stance.UNCONTACTED) {
        continue;
      }
      for (const $it80 = game.getLiveEuropeanPlayerList([this]).iterator(); $it80.hasNext(); ) {
        let p = $it80.next();
        if (p === s || !p.hasContacted(this) || !p.hasContacted(s)) {
          continue;
        }
        if (p.hasAbility$String(Ability.BETTER_FOREIGN_AFFAIRS_REPORT) || war) {
          cs.addStance(ChangeSet$See.only(p), this, sta, s);
          cs.addMessage(p, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, sta.getOtherStanceChangeKey(), this).addStringTemplate$String$StringTemplate('%attacker%', this.getNationLabel()).addStringTemplate$String$StringTemplate('%defender%', s.getNationLabel()));
        }
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append('[ServerPlayer ').append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append(this.getName()).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    ServerPlayer.logger = Logger.getLogger($J.cls(ServerPlayer).getName());
  }
}

export class ServerPlayer$DeadCheck extends JEnum {
  static IS_DEAD: ServerPlayer$DeadCheck = null;
  static IS_DEFEATED: ServerPlayer$DeadCheck = null;
  static IS_AUTORECRUIT: ServerPlayer$DeadCheck = null;
  static IS_ALIVE: ServerPlayer$DeadCheck = null;
  static $VALUES: ServerPlayer$DeadCheck[] = null;
  _ServerPlayer$DeadCheck($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): ServerPlayer$DeadCheck[] { return ServerPlayer$DeadCheck.$VALUES.slice(); }
  static valueOf(name: string): ServerPlayer$DeadCheck { return $J.enumValueOf(ServerPlayer$DeadCheck, name); }
  static $clinit() {
    ServerPlayer$DeadCheck.IS_DEAD = new ServerPlayer$DeadCheck()._ServerPlayer$DeadCheck('IS_DEAD', 0);
    ServerPlayer$DeadCheck.IS_DEFEATED = new ServerPlayer$DeadCheck()._ServerPlayer$DeadCheck('IS_DEFEATED', 1);
    ServerPlayer$DeadCheck.IS_AUTORECRUIT = new ServerPlayer$DeadCheck()._ServerPlayer$DeadCheck('IS_AUTORECRUIT', 2);
    ServerPlayer$DeadCheck.IS_ALIVE = new ServerPlayer$DeadCheck()._ServerPlayer$DeadCheck('IS_ALIVE', 3);
    ServerPlayer$DeadCheck.$VALUES = [ServerPlayer$DeadCheck.IS_DEAD, ServerPlayer$DeadCheck.IS_DEFEATED, ServerPlayer$DeadCheck.IS_AUTORECRUIT, ServerPlayer$DeadCheck.IS_ALIVE];
  }
}

$J.define(ServerPlayer, 'net.sf.freecol.server.model.ServerPlayer', { kind: 'class', ifaces: ['net.sf.freecol.server.model.TurnTaker'], sup: 'net.sf.freecol.common.model.Player', ctors: { 'net.sf.freecol.common.model.Game,boolean,net.sf.freecol.common.model.Nation': '_ServerPlayer$Game$boolean$Nation', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.networking.Connection': '_ServerPlayer$Game$Connection', 'net.sf.freecol.common.model.Game,java.lang.String': '_ServerPlayer$Game$String' }, returns: { 'getFreeBuildingTypes': 'java.util.List', 'getRemainingEmigrants': 'int', 'getConnection': 'net.sf.freecol.common.networking.Connection' }, meths: { 'csModifyTension(net.sf.freecol.common.model.Player,int,net.sf.freecol.common.model.Settlement,net.sf.freecol.common.networking.ChangeSet)': 'csModifyTension$Player$int$Settlement$ChangeSet', 'csModifyTension(net.sf.freecol.common.model.Player,int,net.sf.freecol.common.networking.ChangeSet)': 'csModifyTension$Player$int$ChangeSet', 'csFlushMarket(net.sf.freecol.common.model.GoodsType,net.sf.freecol.common.networking.ChangeSet)': 'csFlushMarket$GoodsType$ChangeSet', 'csFlushMarket(net.sf.freecol.common.networking.ChangeSet)': 'csFlushMarket$ChangeSet', 'collectNewTiles(java.util.stream.Stream)': 'collectNewTiles$Stream', 'collectNewTiles(java.util.Collection)': 'collectNewTiles$Collection', 'collectNewTiles(net.sf.freecol.common.model.Tile,int)': 'collectNewTiles$Tile$int' }, clinit: true, lazy: ['logger'] });
$J.define(ServerPlayer$DeadCheck, 'net.sf.freecol.server.model.ServerPlayer$DeadCheck', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_ServerPlayer$DeadCheck' }, clinit: true, lazy: ['$VALUES', 'IS_DEAD', 'IS_DEFEATED', 'IS_AUTORECRUIT', 'IS_ALIVE'] });
$J.module(() => {
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  NameCache = $J.load('net.sf.freecol.common.i18n.NameCache');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  AbstractUnit = $J.load('net.sf.freecol.common.model.AbstractUnit');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  CombatModel$CombatEffectType = $J.load('net.sf.freecol.common.model.CombatModel$CombatEffectType');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  Constants$IndianDemandAction = $J.load('net.sf.freecol.common.model.Constants$IndianDemandAction');
  DiplomaticTrade = $J.load('net.sf.freecol.common.model.DiplomaticTrade');
  DiplomaticTrade$TradeContext = $J.load('net.sf.freecol.common.model.DiplomaticTrade$TradeContext');
  DiplomaticTrade$TradeStatus = $J.load('net.sf.freecol.common.model.DiplomaticTrade$TradeStatus');
  Disaster = $J.load('net.sf.freecol.common.model.Disaster');
  Disaster$Effects = $J.load('net.sf.freecol.common.model.Disaster$Effects');
  Effect = $J.load('net.sf.freecol.common.model.Effect');
  Europe$MigrationType = $J.load('net.sf.freecol.common.model.Europe$MigrationType');
  FoundingFather$FoundingFatherType = $J.load('net.sf.freecol.common.model.FoundingFather$FoundingFatherType');
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
  HistoryEvent = $J.load('net.sf.freecol.common.model.HistoryEvent');
  HistoryEvent$HistoryEventType = $J.load('net.sf.freecol.common.model.HistoryEvent$HistoryEventType');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  Market = $J.load('net.sf.freecol.common.model.Market');
  ModelMessage = $J.load('net.sf.freecol.common.model.ModelMessage');
  ModelMessage$MessageType = $J.load('net.sf.freecol.common.model.ModelMessage$MessageType');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Monarch = $J.load('net.sf.freecol.common.model.Monarch');
  Monarch$MonarchAction = $J.load('net.sf.freecol.common.model.Monarch$MonarchAction');
  Player$PlayerType = $J.load('net.sf.freecol.common.model.Player$PlayerType');
  Specification = $J.load('net.sf.freecol.common.model.Specification');
  Stance = $J.load('net.sf.freecol.common.model.Stance');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Tension = $J.load('net.sf.freecol.common.model.Tension');
  TradeRoute = $J.load('net.sf.freecol.common.model.TradeRoute');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  UnitChangeType = $J.load('net.sf.freecol.common.model.UnitChangeType');
  GoalDeciders = $J.load('net.sf.freecol.common.model.pathfinding.GoalDeciders');
  ChangeSet$See = $J.load('net.sf.freecol.common.networking.ChangeSet$See');
  ChooseFoundingFatherMessage = $J.load('net.sf.freecol.common.networking.ChooseFoundingFatherMessage');
  FirstContactMessage = $J.load('net.sf.freecol.common.networking.FirstContactMessage');
  IndianDemandMessage = $J.load('net.sf.freecol.common.networking.IndianDemandMessage');
  LootCargoMessage = $J.load('net.sf.freecol.common.networking.LootCargoMessage');
  MonarchActionMessage = $J.load('net.sf.freecol.common.networking.MonarchActionMessage');
  SetDeadMessage = $J.load('net.sf.freecol.common.networking.SetDeadMessage');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  IntegerOption = $J.load('net.sf.freecol.common.option.IntegerOption');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  RandomChoice = $J.load('net.sf.freecol.common.util.RandomChoice');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
  DiplomacySession = $J.load('net.sf.freecol.server.model.DiplomacySession');
  LootSession = $J.load('net.sf.freecol.server.model.LootSession');
  MonarchSession = $J.load('net.sf.freecol.server.model.MonarchSession');
  ServerEurope = $J.load('net.sf.freecol.server.model.ServerEurope');
  ServerIndianSettlement = $J.load('net.sf.freecol.server.model.ServerIndianSettlement');
  ServerUnit = $J.load('net.sf.freecol.server.model.ServerUnit');
});
