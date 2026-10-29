// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/EuropeanAIPlayer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, Collectors, Comparator, Exception, HashMap, HashSet, IllegalStateException, Level, List, Logger, Predicate, RuntimeException } from '../../../../../../jre/index.ts';
import { MissionAIPlayer } from './MissionAIPlayer.ts';

let FreeColException, Messages, Ability, AbstractUnit, Colony, ColonyTradeItem, Constants, Constants$IndianDemandAction, DiplomaticTrade$TradeContext, DiplomaticTrade$TradeStatus, Europe$MigrationType, GoldTradeItem, HistoryEvent$HistoryEventType, Location, Map_, Modifier, NativeTrade$NativeTradeAction, Player$PlayerType, Specification, Stance, StanceTradeItem, Tension, TradeItem, Unit, Unit$UnitState, CostDeciders, GoalDeciders, GameOptions, CachingFunction, CollectionUtils, LogBuilder, RandomChoice, RandomUtils, AIColony, AIGoods, AIMessage, GoodsWish, ValuedAIObject, WorkerWish, MilitaryCoordinator, BuildColonyMission, CashInTreasureTrainMission, DefendSettlementMission, IdleAtSettlementMission, Mission, MissionaryMission, PioneeringMission, PrivateerMission, ScoutingMission, TransportMission, UnitSeekAndDestroyMission, UnitWanderHostileMission, WishRealizationMission, WorkInsideColonyMission;

/**
 * Objects of this class contains AI-information for a single European
 * {@link Player} and is used for controlling this player.
 *
 * The method {@link #startWorking} gets called by the
 * {@link AIInGameInputHandler} when it is this player's turn.
 */
export class EuropeanAIPlayer extends MissionAIPlayer {
  static logger: Logger = null;
  /**
   * Predicate to select units that can be equipped.
   */
  static equipPred: Predicate<Unit> = null;
  /**
   * Predicate to select party modifiers.
   */
  static partyPred: Predicate<Modifier> = null;
  /**
   * Maximum number of turns to travel to a building site.
   */
  static readonly buildingRange: number = 5;
  /**
   * Maximum number of turns to travel to a cash in location.
   */
  static readonly cashInRange: number = 20;
  /**
   * Maximum number of turns to travel to a missionary target.
   */
  static readonly missionaryRange: number = 20;
  /**
   * Maximum number of turns to travel to make progress on
   * pioneering.  This is low-ish because it is usually more
   * efficient to ship the tools where they are needed and either
   * create a new pioneer on site or send a hardy pioneer on
   * horseback.  The AI is probably smart enough to do the former
   * already, and one day the latter.
   */
  static readonly pioneeringRange: number = 10;
  /**
   * Maximum number of turns to travel to a privateering target.
   * Low number because of large naval moves.
   */
  static readonly privateerRange: number = 1;
  /**
   * Maximum number of turns to travel to a scouting target.
   */
  static readonly scoutingRange: number = 20;
  /**
   * A comparator to sort units by decreasing builder score.
   */
  static builderComparator: Comparator<AIUnit> = null;
  /**
   * A comparator to sort units by suitability for a PioneeringMission.
   *
   * We do not check if a unit is near to a colony that can provide tools,
   * as that is likely to be too expensive.  FIXME: perhaps we should.
   */
  static pioneerComparator: Comparator<AIUnit> = null;
  /**
   * A comparator to sort units by suitability for a ScoutingMission.
   *
   * We do not check if a unit is near to a colony that can provide horses,
   * as that is likely to be too expensive.  FIXME: perhaps we should.
   */
  static scoutComparator: Comparator<AIUnit> = null;
  /**
   * Cheat chances.
   */
  static liftBoycottCheatPercent: number = 0;
  static equipScoutCheatPercent: number = 0;
  static equipPioneerCheatPercent: number = 0;
  static landUnitCheatPercent: number = 0;
  static offensiveLandUnitCheatPercent: number = 0;
  static offensiveNavalUnitCheatPercent: number = 0;
  static transportNavalUnitCheatPercent: number = 0;
  /**
   * The pioneer role.
   */
  static pioneerRole: Role = null;
  /**
   * The scouting role.
   */
  static scoutRole: Role = null;
  /**
   * A cached map of Tile to best TileImprovementPlan.
   * Used to choose a tile improvement for a pioneer to work on.
   */
  tipMap: JMap<Tile, TileImprovementPlan> = null;
  /**
   * A cached map of destination Location to Wishes awaiting transport.
   */
  transportDemand: JMap<Location, List<Wish>> = null;
  /**
   * A cached list of transportables awaiting transport.
   */
  transportSupply: List<TransportableAIObject> = null;
  /**
   * A mapping of goods type to the goods wishes where a colony has
   * requested that goods type.  Used to retarget goods that have
   * gone astray.
   */
  goodsWishes: JMap<GoodsType, List<GoodsWish>> = null;
  /**
   * A mapping of unit type to the worker wishes for that type.
   * Used to allocate WishRealizationMissions for units.
   */
  workerWishes: JMap<UnitType, List<WorkerWish>> = null;
  /**
   * A mapping of contiguity number to number of wagons needed in
   * that landmass.
   */
  wagonsNeeded: JMap<number, number> = null;
  /**
   * The colonies that start the turn badly defended.
   */
  badlyDefended: List<AIColony> = null;
  /**
   * Current estimate of the number of new
   * {@code BuildColonyMission}s to create.
   */
  nBuilders: number = 0;
  /**
   * Current estimate of the number of new
   * {@code PioneeringMission}s to create.
   */
  nPioneers: number = 0;
  /**
   * Current estimate of the number of new
   * {@code ScoutingMission}s to create.
   */
  nScouts: number = 0;
  /**
   * Count of the number of transports needing a naval unit.
   */
  nNavalCarrier: number = 0;
  $init_EuropeanAIPlayer() {
    this.tipMap = new HashMap();
    this.transportDemand = new HashMap();
    this.transportSupply = new ArrayList();
    this.goodsWishes = new HashMap();
    this.workerWishes = new HashMap();
    this.wagonsNeeded = new HashMap();
    this.badlyDefended = new ArrayList();
    this.nBuilders = 0;
    this.nPioneers = 0;
    this.nScouts = 0;
    this.nNavalCarrier = 0;
  }
  /**
   * Creates a new {@code EuropeanAIPlayer}.
   *
   * @param aiMain The main AI-class.
   * @param player The player that should be associated with this
   *            {@code AIPlayer}.
   */
  _EuropeanAIPlayer$AIMain$Player(aiMain: AIMain, player: Player): this {
    this._MissionAIPlayer$AIMain$Player(aiMain, player);
    this.$init_EuropeanAIPlayer();
    return this;
  }
  /**
   * Creates a new {@code AIPlayer}.
   *
   * @param aiMain The main AI-object.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered during parsing.
   */
  _EuropeanAIPlayer$AIMain$FreeColXMLReader(aiMain: AIMain, xr: FreeColXMLReader): this {
    this._MissionAIPlayer$AIMain$FreeColXMLReader(aiMain, xr);
    this.$init_EuropeanAIPlayer();
    return this;
  }
  /**
   * Checks if this player should use military units more aggressively.
   *
   * @return {@code true} if attacking other units and settlements are
   *      preferred above defending its own colonies.
   */
  isAggressive(): boolean {
    return $J.equals(this.getPlayer().getNation().getType().getId(), 'model.nationType.conquest') || $J.equals(this.getPlayer().getNation().getType().getId(), 'model.nationType.immigration');
  }
  /**
   * Checks if this player should be attacking the natives.
   *
   * @return {@code true} if native settlements should be targeted by this player.
   */
  isLikesAttackingNatives(): boolean {
    return $J.equals(this.getPlayer().getNation().getType().getId(), 'model.nationType.conquest');
  }
  /**
   * {@inheritDoc}
   */
  removeAIObject(ao: AIObject): void {
    if (ao instanceof AIColony) {
      this.removeAIColony(ao);
    } else {
      super.removeAIObject(ao);
    }
  }
  /**
   * Remove one of our colonies.
   *
   * @param aic The {@code AIColony} to remove.
   */
  removeAIColony(aic: AIColony): void {
    let colony = aic.getColony();
    let tips = new HashSet();
    for (const $it0 = colony.getOwnedTiles().iterator(); $it0.hasNext(); ) {
      let t = $it0.next();
      let tip = this.tipMap.remove(t);
      if (tip != null) {
        tips.add(tip);
      }
    }
    for (const $it1 = aic.getExportGoods().iterator(); $it1.hasNext(); ) {
      let aig = $it1.next();
      if (Map_.isSameLocation(aig.getLocation(), colony)) {
        aig.changeTransport(null);
        aig.dispose();
      }
    }
    this.transportDemand.remove(colony);
    let wishes = new HashSet(aic.getWishes());
    for (const $it2 = this.getAIUnits().iterator(); $it2.hasNext(); ) {
      let aiu = $it2.next();
      let pm = aiu.getMission$Class($J.cls(PioneeringMission));
      if (pm != null) {
        if (tips.contains(pm.getTileImprovementPlan())) {
          EuropeanAIPlayer.logger.info($J.str(pm) + ' collapses with loss of ' + $J.str(colony));
          aiu.changeMission(null);
        }
        continue;
      }
      let wm = aiu.getMission$Class($J.cls(WishRealizationMission));
      if (wm != null) {
        if (wishes.contains(wm.getWish())) {
          EuropeanAIPlayer.logger.info($J.str(wm) + ' collapses with loss of ' + $J.str(colony));
          aiu.changeMission(null);
        }
        continue;
      }
    }
  }
  /**
   * Initialize the static fields that would be final but for
   * needing the specification.
   *
   * @param spec The {@code Specification} to initialize from.
   */
  static initializeFromSpecification(spec: Specification): void {
    if (EuropeanAIPlayer.pioneerRole != null) {
      return;
    }
    EuropeanAIPlayer.pioneerRole = spec.getRoleWithAbility(Ability.IMPROVE_TERRAIN, null);
    EuropeanAIPlayer.scoutRole = spec.getRoleWithAbility(Ability.SPEAK_WITH_CHIEF, null);
    EuropeanAIPlayer.liftBoycottCheatPercent = spec.getInteger(GameOptions.LIFT_BOYCOTT_CHEAT);
    EuropeanAIPlayer.equipScoutCheatPercent = spec.getInteger(GameOptions.EQUIP_SCOUT_CHEAT);
    EuropeanAIPlayer.equipPioneerCheatPercent = spec.getInteger(GameOptions.EQUIP_PIONEER_CHEAT);
    EuropeanAIPlayer.landUnitCheatPercent = spec.getInteger(GameOptions.LAND_UNIT_CHEAT);
    EuropeanAIPlayer.offensiveLandUnitCheatPercent = spec.getInteger(GameOptions.OFFENSIVE_LAND_UNIT_CHEAT);
    EuropeanAIPlayer.offensiveNavalUnitCheatPercent = spec.getInteger(GameOptions.OFFENSIVE_NAVAL_UNIT_CHEAT);
    EuropeanAIPlayer.transportNavalUnitCheatPercent = spec.getInteger(GameOptions.TRANSPORT_NAVAL_UNIT_CHEAT);
  }
  /**
   * Get the list of badly defended colonies.
   *
   * @return A list of {@code AIColony}s that were badly
   *     defended at the start of this turn.
   */
  getBadlyDefended(): List<AIColony> {
    return this.badlyDefended;
  }
  /**
   * Simple initialization of AI missions given that we know the starting
   * conditions.
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  initializeMissions(lb: LogBuilder): void {
    let aiMain = this.getAIMain();
    let aiUnits = this.getAIUnits();
    lb.add(['\n  Initialize ']);
    let map = this.getGame().getMap();
    let maxRange = (map.getWidth() + map.getHeight()) | 0;
    let target: Location;
    let m: Mission;
    let tm: TransportMission;
    for (const $it3 = aiUnits.iterator(); $it3.hasNext(); ) {
      let aiCarrier = $it3.next();
      if (aiCarrier.hasMission$()) {
        continue;
      }
      let carrier = aiCarrier.getUnit();
      if (!carrier.isNaval()) {
        continue;
      }
      target = null;
      for (const $it4 = carrier.getUnitList().iterator(); $it4.hasNext(); ) {
        let u = $it4.next();
        let aiu = aiMain.getAIUnit(u);
        for (let range = EuropeanAIPlayer.buildingRange; range < maxRange; range = (range + EuropeanAIPlayer.buildingRange) | 0) {
          target = BuildColonyMission.findMissionTarget(aiu, range, false);
          if (target != null) {
            break;
          }
        }
        if (target == null) {
          throw new RuntimeException('Initial colony fail: ' + $J.str(u));
        }
        if ((m = this.getBuildColonyMission(aiu, target)) != null) {
          lb.add([m, ', ']);
        }
      }
      tm = this.getTransportMission(aiCarrier);
      if (tm != null) {
        lb.add([tm]);
        for (const $it5 = carrier.getUnitList().iterator(); $it5.hasNext(); ) {
          let u = $it5.next();
          let aiu = this.getAIMain().getAIUnit(u);
          if (aiu == null) {
            continue;
          }
          tm.queueTransportable(aiu, false, lb);
        }
      }
    }
    lb.mark();
    for (const $it6 = aiUnits.iterator(); $it6.hasNext(); ) {
      let aiu = $it6.next();
      if (aiu.hasMission$()) {
        continue;
      }
      if ((m = this.getSimpleMission(aiu)) != null) {
        lb.add([m, ', ']);
      }
    }
    if (lb.grew(['\n  Backup: '])) {
      lb.shrink(', ');
    }
  }
  /**
   * Cheat by adding gold to guarantee the player has a minimum amount.
   *
   * @param amount The minimum amount of gold required.
   * @param lb A {@code LogBuilder} to log to.
   */
  cheatGold(amount: number, lb: LogBuilder): void {
    let player = this.getPlayer();
    let gold = player.getGold();
    if (gold < amount) {
      amount = (amount - gold) | 0;
      player.modifyGold(amount);
      lb.add(['added ', amount, ' gold']);
    }
    player.logCheat(amount + ' gold');
  }
  /**
   * Cheats for the AI.  Please try to centralize cheats here.
   *
   * FIXME: Remove when the AI is good enough.
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  cheat(lb: LogBuilder): void {
    let aiMain = this.getAIMain();
    if (!aiMain.getFreeColServer().getSinglePlayer()) {
      return;
    }
    let player = this.getPlayer();
    if (player.getPlayerType() !== Player$PlayerType.COLONIAL) {
      return;
    }
    lb.mark();
    let spec = this.getSpecification();
    let game = this.getGame();
    let market = player.getMarket();
    let europe = player.getEurope();
    let air = this.getAIRandom();
    let arrears = new ArrayList();
    if (market != null) {
      arrears.addAll(CollectionUtils.transform$Collection$Predicate(spec.getGoodsTypeList(), (gt) => market.getArrears(gt) > 0));
    }
    let nCheats = (arrears.size() + 6) | 0;
    let randoms = RandomUtils.randomInts(EuropeanAIPlayer.logger, 'cheats', air, 100, nCheats);
    let cheatIndex = 0;
    for (const $it7 = arrears.iterator(); $it7.hasNext(); ) {
      let goodsType = $it7.next();
      if (randoms[cheatIndex++] < EuropeanAIPlayer.liftBoycottCheatPercent) {
        market.setArrears(goodsType, 0);
        let partyModifierMapper = new CachingFunction()._CachingFunction((c) => CollectionUtils.first$Collection(CollectionUtils.transform$Stream$Predicate(c.getModifiers$(), EuropeanAIPlayer.partyPred)));
        let party = RandomUtils.getRandomMember$Logger$String$List$Random(EuropeanAIPlayer.logger, 'end boycott', CollectionUtils.transform$Stream$Predicate(player.getColonies(), CollectionUtils.isNotNull$Function((c) => partyModifierMapper.apply(c))), air);
        if (party != null) {
          party.removeModifier(partyModifierMapper.apply(party));
          lb.add(['lift-boycott at ', party, ', ']);
          player.logCheat('lift boycott at ' + party.getName());
        }
      }
    }
    if (!europe.isEmpty() && this.scoutsNeeded() > 0 && randoms[cheatIndex++] < EuropeanAIPlayer.equipScoutCheatPercent) {
      for (const $it8 = CollectionUtils.transform$Stream$Predicate(europe.getUnits(), EuropeanAIPlayer.equipPred).iterator(); $it8.hasNext(); ) {
        let u = $it8.next();
        try {
          let g = europe.priceGoods(u.getGoodsDifference(EuropeanAIPlayer.scoutRole, 1));
          this.cheatGold(g, lb);
        } catch ($e9) {
          if ($J.isa($e9, FreeColException)) {
            let fce = $J.exc($e9);
            continue;
          } else {
            throw $e9;
          }
        }
        if (this.getAIUnit(u).equipForRole(spec.getRoleWithAbility(Ability.SPEAK_WITH_CHIEF, null))) {
          lb.add([' to equip scout ', u, ', ']);
          player.logCheat('Equip scout ' + u.toShortString());
          break;
        }
      }
    }
    if (!europe.isEmpty() && this.pioneersNeeded() > 0 && randoms[cheatIndex++] < EuropeanAIPlayer.equipPioneerCheatPercent) {
      for (const $it10 = CollectionUtils.transform$Stream$Predicate(europe.getUnits(), EuropeanAIPlayer.equipPred).iterator(); $it10.hasNext(); ) {
        let u = $it10.next();
        try {
          let g = europe.priceGoods(u.getGoodsDifference(EuropeanAIPlayer.pioneerRole, 1));
          this.cheatGold(g, lb);
        } catch ($e11) {
          if ($J.isa($e11, FreeColException)) {
            let fce = $J.exc($e11);
            continue;
          } else {
            throw $e11;
          }
        }
        if (this.getAIUnit(u).equipForRole(spec.getRoleWithAbility(Ability.IMPROVE_TERRAIN, null))) {
          lb.add([' to equip pioneer ', u, ', ']);
          player.logCheat('Equip pioneer ' + u.toShortString());
          break;
        }
      }
    }
    if (randoms[cheatIndex++] < EuropeanAIPlayer.landUnitCheatPercent) {
      let bestWishPred = (e) => {
        let ut = e.getKey();
        return ut != null && ut.isAvailableTo([player]) && europe.getUnitPrice(ut) !== Constants.UNDEFINED && CollectionUtils.any$Collection(e.getValue());
      };
      let bestWish = CollectionUtils.maximize$Collection$Comparator(CollectionUtils.transform$Collection$Predicate$Function$Collector(this.workerWishes.entrySet(), bestWishPred, (e) => CollectionUtils.first$Collection(e.getValue()), Collectors.toSet()), ValuedAIObject.ascendingValueComparator);
      let cost = (bestWish != null) ? europe.getUnitPrice(bestWish.getUnitType()) : (player.getImmigration() < $J.idiv(player.getImmigrationRequired(), 2)) ? player.getEuropeanRecruitPrice() : Constants.INFINITY;
      if (cost !== Constants.INFINITY) {
        this.cheatGold(cost, lb);
        let aiu: AIUnit;
        if (bestWish == null) {
          if ((aiu = this.recruitAIUnitInEurope(-1)) != null) {
            lb.add([' to recruit ', aiu.getUnit(), ', ']);
          }
        } else {
          if ((aiu = this.trainAIUnitInEurope(bestWish.getUnitType())) != null) {
            let m = this.getWishRealizationMission(aiu, bestWish);
            if (m != null) {
              lb.add([' to train for ', m, ', ']);
            } else {
              lb.add([' to train ', aiu.getUnit(), ', ']);
            }
          }
        }
        if (aiu != null) {
          player.logCheat('Make ' + $J.str(aiu.getUnit()));
        }
      }
    }
    if (game.getTurn().getNumber() > 300 && player.isAtWar() && randoms[cheatIndex++] < EuropeanAIPlayer.offensiveLandUnitCheatPercent) {
      let wars = CollectionUtils.transform$Stream$Predicate(game.getLivePlayers([player]), (x) => player.atWarWith(x));
      let preferred = new ArrayList(wars.size());
      let enemies = new ArrayList(wars.size());
      for (const $it12 = wars.iterator(); $it12.hasNext(); ) {
        let p = $it12.next();
        enemies.add(p);
        let strength = this.getStrengthRatio(p);
        if (strength < 3 / 2 && strength > 2 / 3) {
          preferred.add(p);
        }
      }
      if (!preferred.isEmpty()) {
        enemies.clear();
        enemies.addAll(preferred);
      }
      let colonies = player.getColonyList();
      let target = null;
      if (colonies.size() < 3) {
        let targetScore = CollectionUtils.cachingDoubleComparator((c) => {
          let score = 100000 / c.getUnitCount();
          let stockade = c.getStockade();
          return $J.boxD((stockade == null) ? 1 : score / (stockade.getLevel() + 1.5));
        });
        target = CollectionUtils.maximize$Stream$Comparator(CollectionUtils.flatten$Collection$Predicate$Function(enemies, ($p0) => $p0.isEuropean(), ($p0) => $p0.getConnectedPorts()), targetScore);
      }
      if (target == null && !colonies.isEmpty()) {
        let bad = new ArrayList(this.getBadlyDefended());
        if (bad.isEmpty()) {
          bad.addAll(this.getAIColonies());
        }
        let defend = RandomUtils.getRandomMember$Logger$String$List$Random(EuropeanAIPlayer.logger, 'AIColony to defend', bad, air);
        let center = defend.getColony().getTile$();
        let t = game.getMap().searchCircle(center, GoalDeciders.getEnemySettlementGoalDecider(enemies), 30);
        if (t != null) {
          target = t.getSettlement();
        }
      }
      if (target != null) {
        let aMercs = new ArrayList();
        let aPrice = player.getMonarch().loadMercenaries(air, aMercs);
        if (aPrice > 0) {
          let mercs = (player).createUnits(aMercs, europe, air);
          for (const $it13 = mercs.iterator(); $it13.hasNext(); ) {
            let u = $it13.next();
            let aiu = this.getAIUnit(u);
            if (aiu == null) {
              continue;
            }
            player.logCheat('Enlist ' + $J.str(aiu.getUnit()));
            let m = this.getSeekAndDestroyMission$AIUnit$Location(aiu, target);
            if (m != null) {
              lb.add(['enlisted ', m, ', ']);
            } else {
              lb.add(['enlisted ', aiu.getUnit(), ', ']);
            }
          }
        }
      }
    }
    let naval = this.getNavalStrengthRatio();
    let nNaval = (player.getUnitCount$boolean(true) === 0) ? 100 : (0 < naval && naval < 0.5) ? $J.d2i((naval * EuropeanAIPlayer.offensiveNavalUnitCheatPercent)) : -1;
    let mapper = (ut) => new RandomChoice()._RandomChoice(ut, $J.idiv(100000, europe.getUnitPrice(ut)));
    if (randoms[cheatIndex++] < nNaval) {
      this.cheatUnit$List$String$LogBuilder$EuropeanAIPlayer(CollectionUtils.transform$Collection$Predicate$Function(spec.getUnitTypeList(), (ut) => ut.hasAbility$String(Ability.NAVAL_UNIT) && ut.isAvailableTo([player]) && ut.hasPrice() && ut.isOffensive(), mapper), 'offensive-naval', lb);
    }
    let nCarrier = (this.nNavalCarrier > 0) ? EuropeanAIPlayer.transportNavalUnitCheatPercent : -1;
    if (randoms[cheatIndex++] < nCarrier) {
      this.cheatUnit$List$String$LogBuilder$EuropeanAIPlayer(CollectionUtils.transform$Collection$Predicate$Function(spec.getUnitTypeList(), (ut) => ut.hasAbility$String(Ability.NAVAL_UNIT) && ut.isAvailableTo([player]) && ut.hasPrice() && ut.getSpace() > 0, mapper), 'transport-naval', lb);
    }
    if (lb.grew(['\n  Cheats: '])) {
      lb.shrink(', ');
    }
  }
  /**
   * Cheat-build a unit in Europe.
   *
   * @param rc A list of random choices to choose from.
   * @param what A description of the unit.
   * @param lb A {@code LogBuilder} to log to.
   * @return The {@code AIUnit} built.
   */
  cheatUnit$List$String$LogBuilder$EuropeanAIPlayer(rc: List<RandomChoice<UnitType>>, what: string, lb: LogBuilder): AIUnit {
    let unitToPurchase = RandomChoice.getWeightedRandom$Logger$String$Collection$Random(EuropeanAIPlayer.logger, 'Cheat which unit', rc, this.getAIRandom());
    return (unitToPurchase == null) ? null : this.cheatUnit$UnitType$String$LogBuilder$EuropeanAIPlayer(unitToPurchase, what, lb);
  }
  /**
   * Cheat-build a unit in Europe.
   *
   * @param unitType The {@code UnitType} to build.
   * @param what A description of the unit.
   * @param lb A {@code LogBuilder} to log to.
   * @return The {@code AIUnit} built.
   */
  cheatUnit$UnitType$String$LogBuilder$EuropeanAIPlayer(unitType: UnitType, what: string, lb: LogBuilder): AIUnit {
    let player = this.getPlayer();
    let europe = player.getEurope();
    let cost = europe.getUnitPrice(unitType);
    this.cheatGold(cost, lb);
    let result = this.trainAIUnitInEurope(unitType);
    lb.add([' to build ', what, ' ', unitType.getSuffix$(), ((result != null) ? '' : '(failed)'), ', ']);
    if (result == null) {
      return null;
    }
    player.logCheat('Build ' + $J.str(result.getUnit()));
    return result;
  }
  /**
   * Assign transportable units and goods to available carriers.
   *
   * These supply driven assignments supplement the demand driven
   * calls inside TransportMission.
   *
   * @param transportables A list of {@code TransportableAIObject}s to
   *     allocated transport for.
   * @param missions A list of {@code TransportMission}s to potentially
   *     assign more transportables to.
   * @param lb A {@code LogBuilder} to log to.
   */
  allocateTransportables(transportables: List<TransportableAIObject>, missions: List<TransportMission>, lb: LogBuilder): void {
    if (transportables.isEmpty()) {
      return;
    }
    if (missions.isEmpty()) {
      return;
    }
    lb.add(['\n  Allocate Transport cargo=', transportables.size(), ' carriers=', missions.size()]);
    let lb2 = new LogBuilder()._LogBuilder(0);
    let best: TransportMission;
    let bestValue: number;
    let present: boolean;
    let i = 0;
    outer:
    while (i < transportables.size()) {
      if (missions.isEmpty()) {
        break;
      }
      let t = transportables.get(i);
      lb.add([' for ', t]);
      best = null;
      bestValue = 0;
      present = false;
      for (const $it14 = missions.iterator(); $it14.hasNext(); ) {
        let tm = $it14.next();
        if (!tm.spaceAvailable$TransportableAIObject(t)) {
          continue;
        }
        let cargo = tm.makeCargo(t, lb2);
        if (cargo == null) {
          transportables.removeAt(i);
          continue outer;
        }
        let turns = cargo.getTurns();
        let value: number;
        if (turns === 0) {
          value = Math.fround(tm.destinationCapacity());
          if (!present) {
            bestValue = 0;
          }
          present = true;
        } else {
          value = (present) ? Math.fround(-1) : Math.fround(Math.fround(t.getTransportPriority()) / turns);
        }
        if (bestValue < value) {
          bestValue = value;
          best = tm;
        }
      }
      if (best == null) {
        lb.add([' nothing found']);
      } else {
        lb.add([' ', best.getUnit(), ' chosen']);
        if (best.queueTransportable(t, false, lb)) {
          this.claimTransportable(t);
          if (best.destinationCapacity() <= 0) {
            missions.remove(best);
          }
        } else {
          missions.remove(best);
        }
      }
      i++;
    }
  }
  /**
   * Brings gifts to nice players with nearby colonies.
   *
   * FIXME: European players can also bring gifts!  However, this
   * might be folded into a trade mission, since European gifts are
   * just a special case of trading.
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  bringGifts(lb: LogBuilder): void {
    return;
  }
  /**
   * Demands goods from players with nearby colonies.
   *
   * FIXME: European players can also demand tribute!
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  demandTribute(lb: LogBuilder): void {
    return;
  }
  /**
   * Rebuilds a map of locations to TileImprovementPlans.
   *
   * Called by startWorking at the start of every turn.
   *
   * Public for the test suite.
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  buildTipMap(lb: LogBuilder): void {
    this.tipMap.clear();
    for (const $it15 = this.getAIColonies().iterator(); $it15.hasNext(); ) {
      let aic = $it15.next();
      for (const $it16 = aic.getTileImprovementPlans().iterator(); $it16.hasNext(); ) {
        let tip = $it16.next();
        if (tip == null || tip.isComplete()) {
          aic.removeTileImprovementPlan(tip);
        } else if (tip.getPioneer() != null) {
        } else if (!tip.validate()) {
          aic.removeTileImprovementPlan(tip);
          tip.dispose();
        } else if (tip.getTarget() == null) {
          EuropeanAIPlayer.logger.warning('No target for tip: ' + $J.str(tip));
        } else {
          let other = this.tipMap.get(tip.getTarget());
          if (other == null || other.getValue() < tip.getValue()) {
            this.tipMap.put(tip.getTarget(), tip);
          }
        }
      }
    }
    if (!this.tipMap.isEmpty()) {
      lb.add(['\n  Improvements:']);
      CollectionUtils.forEachMapEntry$Map$Consumer(this.tipMap, (e) => {
        let t = e.getKey();
        let tip = e.getValue();
        let pioneer = tip.getPioneer();
        lb.add([' ', t, '=', tip.getType().getSuffix$()]);
        if (pioneer != null) {
          lb.add(['/', pioneer.getUnit()]);
        }
      });
    }
  }
  /**
   * Update the tip map with tips from a new colony.
   *
   * @param aic The new {@code AIColony}.
   */
  updateTipMap(aic: AIColony): void {
    for (const $it17 = aic.getTileImprovementPlans().iterator(); $it17.hasNext(); ) {
      let tip = $it17.next();
      this.tipMap.put(tip.getTarget(), tip);
    }
  }
  /**
   * Gets the best plan for a tile from the tipMap.
   *
   * @param tile The {@code Tile} to lookup.
   * @return The best plan for a tile.
   */
  getBestPlan(tile: Tile): TileImprovementPlan {
    return (this.tipMap == null) ? null : this.tipMap.get(tile);
  }
  /**
   * Gets the best plan for a colony from the tipMap.
   *
   * @param colony The {@code Colony} to check.
   * @return The tile with the best plan for a colony, or null if none found.
   */
  getBestPlanTile(colony: Colony): Tile {
    let valueComp = Comparator.comparingInt(($p0) => $p0.getValue());
    let tileMapper = (t) => this.tipMap.get(t);
    let best = CollectionUtils.maximize$Stream$Predicate$Comparator(CollectionUtils.map$Collection$Function(colony.getOwnedTiles(), tileMapper), CollectionUtils.isNotNull$(), valueComp);
    return (best == null) ? null : best.getTarget();
  }
  /**
   * Remove a {@code TileImprovementPlan} from the relevant colony.
   *
   * @param plan The {@code TileImprovementPlan} to remove.
   */
  removeTileImprovementPlan(plan: TileImprovementPlan): void {
    if (plan == null) {
      return;
    }
    if (plan.getTarget() != null) {
      this.tipMap.remove(plan.getTarget());
    }
    for (const $it18 = this.getAIColonies().iterator(); $it18.hasNext(); ) {
      let aic = $it18.next();
      if (aic.removeTileImprovementPlan(plan)) {
        break;
      }
    }
  }
  /**
   * Update the transport of a unit following a target change.
   *
   * If the target has changed
   * - drop all non-boarded transport unless the target is the same
   * - dump boarded transport with no target
   * - requeue all boarded transport unless the target is the same
   *
   * @param aiu The {@code AIUnit} to check.
   * @param oldTarget The old target {@code Location}.
   * @param lb A {@code LogBuilder} to log to.
   */
  updateTransport(aiu: AIUnit, oldTarget: Location, lb: LogBuilder): void {
    let aiCarrier = aiu.getTransport();
    let newMission = aiu.getMission$();
    let newTarget = (newMission == null) ? null : newMission.getTarget();
    let tm: TransportMission;
    if (aiCarrier != null && (tm = aiCarrier.getMission$Class($J.cls(TransportMission))) != null && !Map_.isSameLocation(oldTarget, newTarget)) {
      if (aiu.getUnit().getLocation() !== aiCarrier.getUnit()) {
        lb.add([', drop transport ', aiCarrier.getUnit()]);
        aiu.dropTransport();
      } else if (newTarget == null) {
        tm.dumpTransportable(aiu, lb);
      } else {
        tm.requeueTransportable(aiu, lb);
      }
    }
  }
  /**
   * Checks if a transportable needs transport.
   *
   * @param t The {@code TransportableAIObject} to check.
   * @return True if no transport is already present or the
   *     transportable is already aboard a carrier, and there is a
   *     well defined source and destination location.
   */
  requestsTransport(t: TransportableAIObject): boolean {
    return t.getTransport() == null && t.getTransportDestination() != null && t.getTransportSource() != null && !(t.getLocation() instanceof Unit);
  }
  /**
   * Checks that the carrier assigned to a transportable is has a
   * transport mission and the transport is queued thereon.
   *
   * @param t The {@code TransportableAIObject} to check.
   * @return True if all is well.
   */
  checkTransport(t: TransportableAIObject): boolean {
    let aiCarrier = t.getTransport();
    if (aiCarrier == null) {
      return false;
    }
    let tm = aiCarrier.getMission$Class($J.cls(TransportMission));
    if (tm != null && tm.isTransporting(t)) {
      return true;
    }
    t.changeTransport(null);
    return false;
  }
  /**
   * Changes the needed wagons map for a specified tile/contiguity.
   * If the change is zero, that is a special flag that a connected
   * port is available, and thus that the map should be initialized
   * for that contiguity.
   *
   * @param tile The {@code Tile} to derive the contiguity from.
   * @param amount The change to make.
   */
  changeNeedWagon(tile: Tile, amount: number): void {
    if (tile == null) {
      return;
    }
    let contig = tile.getContiguity();
    if (contig > 0) {
      let i = this.wagonsNeeded.get(contig);
      if (i == null) {
        if (amount === 0) {
          this.wagonsNeeded.put(contig, 0);
        }
      } else {
        this.wagonsNeeded.put(contig, (i + amount) | 0);
      }
    }
  }
  /**
   * Rebuild the transport maps.
   * Count the number of transports requiring naval/land carriers.
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  buildTransportMaps(lb: LogBuilder): void {
    this.transportDemand.clear();
    this.transportSupply.clear();
    this.wagonsNeeded.clear();
    this.nNavalCarrier = 0;
    for (const $it19 = this.getAIColonies().iterator(); $it19.hasNext(); ) {
      let aic = $it19.next();
      let colony = aic.getColony();
      if (colony.isConnectedPort()) {
        this.changeNeedWagon(colony.getTile$(), 0);
      }
    }
    for (const $it20 = this.getAIUnits().iterator(); $it20.hasNext(); ) {
      let aiu = $it20.next();
      if (aiu.hasMission$() && !aiu.getMission$().isValid()) {
        continue;
      }
      let u = aiu.getUnit();
      if (u.isCarrier()) {
        if (u.isNaval()) {
          this.nNavalCarrier--;
        } else {
          this.changeNeedWagon(u.getTile$(), -1);
        }
      } else {
        this.checkTransport(aiu);
        if (this.requestsTransport(aiu)) {
          this.transportSupply.add(aiu);
          aiu.incrementTransportPriority();
          this.nNavalCarrier++;
        }
      }
    }
    for (const $it21 = this.getAIColonies().iterator(); $it21.hasNext(); ) {
      let aic = $it21.next();
      for (const $it22 = aic.getExportGoods().iterator(); $it22.hasNext(); ) {
        let aig = $it22.next();
        this.checkTransport(aig);
        if (this.requestsTransport(aig)) {
          this.transportSupply.add(aig);
          aig.incrementTransportPriority();
          let src = aig.getTransportSource();
          let dst = aig.getTransportDestination();
          if (!Map_.isSameContiguity(src, dst)) {
            this.nNavalCarrier++;
          }
        }
      }
      let colony = aic.getColony();
      if (!colony.isConnectedPort()) {
        this.changeNeedWagon(colony.getTile$(), 1);
      }
    }
    for (const $it23 = this.getWishes().iterator(); $it23.hasNext(); ) {
      let w = $it23.next();
      let t = w.getTransportable();
      if (t != null && t.getTransport() == null && t.getTransportDestination() != null) {
        let loc = Location.upLoc(t.getTransportDestination());
        CollectionUtils.appendToMapList(this.transportDemand, loc, w);
      }
    }
    if (!this.transportSupply.isEmpty()) {
      lb.add(['\n  Transport Supply:']);
      for (const $it24 = this.transportSupply.iterator(); $it24.hasNext(); ) {
        let t = $it24.next();
        lb.add([' ', t.getTransportPriority(), '+', t]);
      }
    }
    if (!this.transportDemand.isEmpty()) {
      lb.add(['\n  Transport Demand:']);
      CollectionUtils.forEachMapEntry$Map$Consumer(this.transportDemand, (e) => {
        let ld = e.getKey();
        lb.add(['\n    ', ld, '[']);
        for (const $it25 = e.getValue().iterator(); $it25.hasNext(); ) {
          let w = $it25.next();
          lb.add([' ', w]);
        }
        lb.add([' ]']);
      });
    }
  }
  /**
   * Gets all transportables sorted by values.
   *
   * @return The transportables in descending order.
   */
  getTransportables(): List<TransportableAIObject> {
    return CollectionUtils.sort$Collection$Comparator(this.transportSupply, ValuedAIObject.descendingValueComparator);
  }
  /**
   * Gets the most urgent transportables.
   *
   * @return The most urgent of the available transportables.
   */
  getUrgentTransportables(): List<TransportableAIObject> {
    return List.of();
  }
  /**
   * Allows a TransportMission to signal that it has taken responsibility
   * for a TransportableAIObject.
   *
   * @param t The {@code TransportableAIObject} being claimed.
   * @return True if the transportable was claimed from the supply map.
   */
  claimTransportable(t: TransportableAIObject): boolean {
    return this.transportSupply.remove(t);
  }
  /**
   * Rearrange colonies.
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  rearrangeColonies(lb: LogBuilder): void {
    for (const $it26 = this.getAIColonies().iterator(); $it26.hasNext(); ) {
      let aic = $it26.next();
      aic.rearrangeColony(lb);
    }
  }
  /**
   * Suppress European trade in a goods type.  A goods party and
   * boycott is incoming.
   *
   * @param type The {@code GoodsType} to suppress.
   * @param lb A {@code LogBuilder} to log to.
   */
  suppressEuropeanTrade(type$: GoodsType, lb: LogBuilder): void {
    let player = this.getPlayer();
    let europe = player.getEurope();
    lb.add(['  Suppressing trade in ', type$.getSuffix$()]);
    let units = new ArrayList(europe.getUnitList());
    units.addAll(player.getHighSeas().getUnitList());
    for (const $it27 = units.iterator(); $it27.hasNext(); ) {
      let u = $it27.next();
      let amount: number;
      let aiu: AIUnit;
      if (u.isCarrier() && (amount = u.getGoodsCount(type$)) > 0 && (aiu = this.getAIUnit(u)) != null && AIMessage.askUnloadGoods(type$, amount, aiu)) {
        lb.add([', ', u, ' sold ', amount]);
      }
    }
    for (const $it28 = this.getAIUnits().iterator(); $it28.hasNext(); ) {
      let aiu = $it28.next();
      let tm = aiu.getMission$Class($J.cls(TransportMission));
      if (tm != null) {
        tm.suppressEuropeanTrade(type$, lb);
      }
    }
    let n = 0;
    let wishes = this.goodsWishes.get(type$);
    if (wishes != null) {
      for (const $it29 = wishes.iterator(); $it29.hasNext(); ) {
        let gw = $it29.next();
        if (gw.getGoodsType() === type$ && gw.getDestination() === europe) {
          if (gw.getTransportable() instanceof AIGoods) {
            let aig = gw.getTransportable();
            this.consumeGoodsWish(aig, gw);
            aig.setTransportDestination(null);
          }
          gw.dispose();
          n++;
        }
      }
      if (n > 0) {
        lb.add([', dropped ', n, ' goods wishes']);
      }
    }
    lb.add(['.']);
  }
  /**
   * Gets a list of the wishes at a given location for a unit type.
   *
   * @param loc The {@code Location} to look for wishes at.
   * @param type The {@code UnitType} to look for.
   * @return A list of {@code WorkerWish}es.
   */
  getWorkerWishesAt(loc: Location, type$: UnitType): List<WorkerWish> {
    let demand = this.transportDemand.get(Location.upLoc(loc));
    return (demand == null) ? Collections.emptyList() : CollectionUtils.transform$Collection$Predicate$Function(demand, (w) => w instanceof WorkerWish && (w).getUnitType() === type$, (w) => w);
  }
  /**
   * Gets a list of the wishes at a given location for a goods type.
   *
   * @param loc The {@code Location} to look for wishes at.
   * @param type The {@code GoodsType} to look for.
   * @return A list of {@code GoodsWish}es.
   */
  getGoodsWishesAt(loc: Location, type$: GoodsType): List<GoodsWish> {
    let demand = this.transportDemand.get(Location.upLoc(loc));
    return (demand == null) ? Collections.emptyList() : CollectionUtils.transform$Collection$Predicate$Function(demand, (w) => w instanceof GoodsWish && (w).getGoodsType() === type$, (w) => w);
  }
  /**
   * Gets the best worker wish for a carrier unit.
   *
   * @param aiUnit The carrier {@code AIUnit}.
   * @param unitType The {@code UnitType} to find a wish for.
   * @return The best worker wish for the unit.
   */
  getBestWorkerWish(aiUnit: AIUnit, unitType: UnitType): WorkerWish {
    let wishes = this.workerWishes.get(unitType);
    if (wishes == null) {
      return null;
    }
    let carrier = aiUnit.getUnit();
    let carried = null;
    let other = null;
    let bestCarriedValue = -1;
    let bestOtherValue = -1;
    for (const $it30 = wishes.iterator(); $it30.hasNext(); ) {
      let w = $it30.next();
      let dest = w.getDestination();
      if (dest == null) {
        continue;
      }
      let turns = carrier.getTurnsToReach$Location(dest);
      if (turns < Unit.MANY_TURNS) {
        if (bestCarriedValue < w.getValue() / turns) {
          bestCarriedValue = w.getValue() / turns;
          carried = w;
        }
      } else {
        if (bestOtherValue < w.getValue()) {
          bestOtherValue = w.getValue();
          other = w;
        }
      }
    }
    return (carried != null) ? carried : (other != null) ? other : null;
  }
  /**
   * Gets the best goods wish for a carrier unit.
   *
   * @param aiUnit The carrier {@code AIUnit}.
   * @param goodsType The {@code GoodsType} to wish for.
   * @return The best {@code GoodsWish} for the unit.
   */
  getBestGoodsWish(aiUnit: AIUnit, goodsType: GoodsType): GoodsWish {
    let carrier = aiUnit.getUnit();
    let wishValue = CollectionUtils.cacheDouble((gw) => {
      let turns = carrier.getTurnsToReach$Location$Location(carrier.getLocation(), gw.getDestination());
      return $J.boxD((turns >= Unit.MANY_TURNS) ? -1 : gw.getValue() / turns);
    });
    let comp = Comparator.comparingDouble(wishValue);
    let wishes = this.goodsWishes.get(goodsType);
    return (wishes == null) ? null : CollectionUtils.maximize$Collection$Predicate$Comparator(wishes, (gw) => wishValue(gw) > 0, comp);
  }
  /**
   * Rebuilds the goods and worker wishes maps.
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  buildWishMaps(lb: LogBuilder): void {
    for (const $it31 = this.getSpecification().getUnitTypeList().iterator(); $it31.hasNext(); ) {
      let unitType = $it31.next();
      let wl = this.workerWishes.get(unitType);
      if (wl == null) {
        this.workerWishes.put(unitType, new ArrayList());
      } else {
        wl.clear();
      }
    }
    for (const $it32 = this.getSpecification().getStorableGoodsTypeList().iterator(); $it32.hasNext(); ) {
      let goodsType = $it32.next();
      let gl = this.goodsWishes.get(goodsType);
      if (gl == null) {
        this.goodsWishes.put(goodsType, new ArrayList());
      } else {
        gl.clear();
      }
    }
    for (const $it33 = this.getWishes().iterator(); $it33.hasNext(); ) {
      let w = $it33.next();
      if (w instanceof WorkerWish) {
        let ww = w;
        if (ww.getTransportable() == null) {
          CollectionUtils.appendToMapList(this.workerWishes, ww.getUnitType(), ww);
        }
      } else if (w instanceof GoodsWish) {
        let gw = w;
        if (gw.getDestination() instanceof Colony) {
          CollectionUtils.appendToMapList(this.goodsWishes, gw.getGoodsType(), gw);
        }
      }
    }
    if (!this.workerWishes.isEmpty()) {
      lb.add(['\n  Wishes (workers):']);
      CollectionUtils.forEachMapEntry$Map$Consumer(this.workerWishes, (e) => {
        let ut = e.getKey();
        let wl = e.getValue();
        if (!wl.isEmpty()) {
          lb.add(['\n    ', ut.getSuffix$(), ':']);
          for (const $it34 = wl.iterator(); $it34.hasNext(); ) {
            let ww = $it34.next();
            lb.add([' ', ww.getDestination(), '(', ww.getValue(), ')']);
          }
        }
      });
    }
    if (!this.goodsWishes.isEmpty()) {
      lb.add(['\n  Wishes (goods):']);
      CollectionUtils.forEachMapEntry$Map$Consumer(this.goodsWishes, (e) => {
        let gt = e.getKey();
        let gl = e.getValue();
        if (!gl.isEmpty()) {
          lb.add(['\n    ', gt.getSuffix$(), ':']);
          for (const $it35 = gl.iterator(); $it35.hasNext(); ) {
            let gw = $it35.next();
            lb.add([' ', gw.getDestination(), '(', gw.getValue(), ')']);
          }
        }
      });
    }
  }
  /**
   * Consume a WorkerWish, yielding a WishRealizationMission for a unit.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param ww The {@code WorkerWish} to consume.
   */
  consumeWorkerWish(aiUnit: AIUnit, ww: WorkerWish): void {
    let unit = aiUnit.getUnit();
    let wwL = this.workerWishes.get(unit.getType());
    wwL.remove(ww);
    let wl = this.transportDemand.get(ww.getDestination());
    if (wl != null) {
      wl.remove(ww);
    }
    ww.setTransportable(aiUnit);
  }
  /**
   * Consume a GoodsWish.
   *
   * @param aig The {@code AIGoods} to use.
   * @param gw The {@code GoodsWish} to consume.
   */
  consumeGoodsWish(aig: AIGoods, gw: GoodsWish): void {
    let goods = aig.getGoods();
    let gwL = this.goodsWishes.get(goods.getType());
    gwL.remove(gw);
    let wl = this.transportDemand.get(gw.getDestination());
    if (wl != null) {
      wl.remove(gw);
    }
    gw.setTransportable(aig);
  }
  /**
   * Gets the number of units that should build a colony.
   *
   * This is the desired total number, not the actual number which would
   * take into account the number of existing BuildColonyMissions.
   *
   * @return The desired number of colony builders for this player.
   */
  buildersNeeded(): number {
    let player = this.getPlayer();
    if (!player.canBuildColonies()) {
      return 0;
    }
    let nColonies = 0;
    let nPorts = 0;
    let nColonySize1 = 0;
    for (const $it36 = player.getSettlementList().iterator(); $it36.hasNext(); ) {
      let settlement = $it36.next();
      nColonies++;
      if (settlement.isConnectedPort()) {
        nPorts++;
      }
      let colonySize = settlement.getUnitList().size();
      if (colonySize === 1) {
        nColonySize1++;
      }
    }
    if (nPorts === 0) {
      return 2;
    }
    if (nPorts === 1) {
      return 1;
    }
    if (nColonies < 3) {
      return 1;
    }
    if (nColonySize1 < 2) {
      return 1;
    }
    return 0;
  }
  /**
   * Asks the server to recruit a unit in Europe on behalf of the AIPlayer.
   *
   * FIXME: Move this to a specialized Handler class (AIEurope?)
   * FIXME: Give protected access?
   *
   * @param slot The migration slot to recruit from.
   * @return The new AIUnit created by this action or null on failure.
   */
  recruitAIUnitInEurope(slot: number): AIUnit {
    let aiUnit = null;
    let europe = this.getPlayer().getEurope();
    if (europe == null) {
      return null;
    }
    let n = europe.getUnitCount();
    let selectAbility = Ability.SELECT_RECRUIT;
    if (!Europe$MigrationType.validMigrantSlot(slot)) {
      slot = (this.getPlayer().hasAbility$String(selectAbility)) ? Europe$MigrationType.getDefaultSlot() : Europe$MigrationType.getUnspecificSlot();
    }
    if (AIMessage.askEmigrate(this, slot) && europe.getUnitCount() === ((n + 1) | 0)) {
      aiUnit = this.getAIUnit(europe.getUnitList().get(n));
      if (aiUnit != null) {
        this.addAIUnit(aiUnit);
      }
    }
    return aiUnit;
  }
  /**
   * Helper function for server communication - Ask the server
   * to train a unit in Europe on behalf of the AIGetPlayer().
   *
   * FIXME: Move this to a specialized Handler class (AIEurope?)
   * FIXME: Give protected access?
   *
   * @param unitType The {@code UnitType} to train.
   * @return the new AIUnit created by this action. May be null.
   */
  trainAIUnitInEurope(unitType: UnitType): AIUnit {
    if (unitType == null) {
      throw new RuntimeException('Invalid UnitType: ' + $J.str(this));
    }
    let aiUnit = null;
    let europe = this.getPlayer().getEurope();
    if (europe == null) {
      return null;
    }
    let n = europe.getUnitCount();
    if (AIMessage.askTrainUnitInEurope(this, unitType) && europe.getUnitCount() === ((n + 1) | 0)) {
      aiUnit = this.getAIUnit(europe.getUnitList().get(n));
      if (aiUnit != null) {
        this.addAIUnit(aiUnit);
      }
    }
    return aiUnit;
  }
  /**
   * Gets the wishes for all this player's colonies, sorted by the
   * {@link Wish#getValue value}.
   *
   * @return A list of wishes.
   */
  getWishes(): List<Wish> {
    return CollectionUtils.sort$Stream$Comparator(CollectionUtils.flatten$Collection$Function(this.getAIColonies(), (aic) => aic.getWishes().stream()), ValuedAIObject.descendingValueComparator);
  }
  /**
   * Determines the stances towards each player.
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  determineStances(lb: LogBuilder): void {
    let player = this.getPlayer();
    lb.mark();
    for (const $it37 = this.getGame().getLivePlayerList([player]).iterator(); $it37.hasNext(); ) {
      let p = $it37.next();
      let newStance = this.determineStance(p);
      if (newStance !== player.getStance(p)) {
        if (newStance === Stance.WAR && this.peaceHolds(p)) {
        } else {
          this.getAIMain().getFreeColServer().getInGameController().changeStance(player, newStance, p, true);
          lb.add([' ', p.getDebugName(), '->', newStance, ', ']);
        }
      }
    }
    if (lb.grew(['\n  Stance changes:'])) {
      lb.shrink(', ');
    }
  }
  /**
   * See if a recent peace treaty still has force.
   *
   * @param p The {@code Player} to check for a peace treaty with.
   * @return True if peace gets another chance.
   */
  peaceHolds(p: Player): boolean {
    let player = this.getPlayer();
    let turn = this.getGame().getTurn();
    let peaceProb = this.getSpecification().getPercentageMultiplier(GameOptions.PEACE_PROBABILITY);
    let peaceTurn = -1;
    for (const $it38 = player.getHistory().iterator(); $it38.hasNext(); ) {
      let h = $it38.next();
      if ($J.equals(p.getId(), h.getPlayerId()) && h.getTurn().getNumber() > peaceTurn) {
        switch (h.getEventType()) {
          case HistoryEvent$HistoryEventType.MAKE_PEACE:
          case HistoryEvent$HistoryEventType.FORM_ALLIANCE:
            peaceTurn = h.getTurn().getNumber();
            break;
          case HistoryEvent$HistoryEventType.DECLARE_WAR:
            peaceTurn = -1;
            break;
          default:
            break;
        }
      }
    }
    if (peaceTurn < 0) {
      return false;
    }
    let n = (turn.getNumber() - peaceTurn) | 0;
    let prob = Math.fround($J.pow(peaceProb, n));
    prob = p.apply$float$Turn$String(prob, turn, Modifier.PEACE_TREATY);
    return prob > 0 && (RandomUtils.randomInt(EuropeanAIPlayer.logger, 'Peace holds?', this.getAIRandom(), 100) < $J.d2i((Math.fround(100 * prob))));
  }
  /**
   * Get a nation summary for another player.
   *
   * @param other The other {@code Player} to get the summary for.
   * @return The current {@code NationSummary} for a player.
   */
  getNationSummary(other: Player): NationSummary {
    let player = this.getPlayer();
    let ns = player.getNationSummary(other);
    if (ns != null) {
      return ns;
    }
    AIMessage.askNationSummary(this, other);
    return player.getNationSummary(other);
  }
  /**
   * Get the land force strength ratio of this player with respect
   * to another.
   *
   * @param other The other {@code Player}.
   * @return The strength ratio (strength/sum(strengths)).
   */
  getStrengthRatio(other: Player): number {
    return this.getPlayer().getStrengthRatio(other, false);
  }
  /**
   * Is this player lagging in naval strength?  Calculate the ratio
   * of its naval strength to the average strength of other European
   * colonial powers.
   *
   * @return The naval strength ratio, or negative if there are no other
   *     European colonial nations.
   */
  getNavalStrengthRatio(): number {
    let player = this.getPlayer();
    let navalAverage = 0;
    let navalStrength = 0;
    let nPlayers = 0;
    for (const $it39 = (CollectionUtils.transform$Stream$Predicate(this.getGame().getLiveEuropeanPlayers([player]), (x) => !x.isREF())).iterator(); $it39.hasNext(); ) {
      let p = $it39.next();
      let ns = this.getNationSummary(p);
      if (ns == null) {
        continue;
      }
      if (p === player) {
        navalStrength = ns.getNavalStrength();
      } else {
        let st = ns.getNavalStrength();
        if (st >= 0) {
          navalAverage += st;
        }
        nPlayers++;
      }
    }
    if (nPlayers <= 0 || navalStrength < 0) {
      return -1;
    }
    navalAverage /= nPlayers;
    return (navalAverage === 0) ? -1 : navalStrength / navalAverage;
  }
  /**
   * Reject a trade agreement, except if a Franklin-derived stance
   * is supplied.
   *
   * @param stance A stance {@code TradeItem}.
   * @param agreement The {@code DiplomaticTrade} to reset.
   * @return The {@code TradeStatus} for the agreement.
   */
  rejectAgreement(stance: TradeItem, agreement: DiplomaticTrade): DiplomaticTrade$TradeStatus {
    if (stance == null) {
      return DiplomaticTrade$TradeStatus.REJECT_TRADE;
    }
    agreement.clear();
    agreement.add(stance);
    return DiplomaticTrade$TradeStatus.PROPOSE_TRADE;
  }
  /**
   * Ensures all units have a mission.
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  giveNormalMissions(lb: LogBuilder, aiUnits: List<AIUnit>): void {
    let aiMain = this.getAIMain();
    let player = this.getPlayer();
    let bcm = null;
    let m: Mission;
    this.nBuilders = this.buildersNeeded();
    this.nPioneers = this.pioneersNeeded();
    this.nScouts = this.scoutsNeeded();
    let navalUnits = new ArrayList($J.idiv(aiUnits.size(), 2));
    let done = new ArrayList(aiUnits.size());
    let transportMissions = new ArrayList($J.idiv(aiUnits.size(), 2));
    let reasons = new HashMap(aiUnits.size());
    lb.mark();
    for (const $it40 = aiUnits.iterator(); $it40.hasNext(); ) {
      let aiUnit = $it40.next();
      let unit = aiUnit.getUnit();
      let colony = unit.getColony();
      m = aiUnit.getMission$();
      let oldTarget = (m == null) ? null : m.getTarget();
      if (!unit.isInitialized() || unit.isDisposed()) {
        reasons.put(unit, 'Invalid');
      } else if (unit.isDamaged()) {
        if (!(m instanceof IdleAtSettlementMission)) {
          if ((m = this.getIdleAtSettlementMission(aiUnit)) != null) {
            lb.add([', ', m]);
          }
        }
        reasons.put(unit, 'Damaged');
      } else if (unit.getState() === Unit$UnitState.IN_COLONY && colony.getUnitCount() <= 1) {
        if (!(m instanceof WorkInsideColonyMission) && (m = this.getWorkInsideColonyMission(aiUnit, aiMain.getAIColony(colony))) != null) {
          EuropeanAIPlayer.logger.warning($J.str(aiUnit) + ' should WorkInsideColony at ' + colony.getName());
          lb.add([', ', m]);
          this.updateTransport(aiUnit, oldTarget, lb);
        }
        reasons.put(unit, 'Vital');
      } else if (unit.isInMission()) {
        reasons.put(unit, 'Mission');
      } else if (m != null && m.isValid() && !m.isOneTime()) {
        if (m instanceof BuildColonyMission) {
          bcm = m;
          this.nBuilders--;
        } else if (m instanceof PioneeringMission) {
          this.nPioneers--;
        } else if (m instanceof ScoutingMission) {
          this.nScouts--;
        } else if (m instanceof TransportMission) {
          let tm = m;
          if (tm.isEmpty() && unit.isNaval() && unit.isOffensiveUnit()) {
            navalUnits.add(aiUnit);
            done.add(aiUnit);
            continue;
          }
          if (tm.destinationCapacity() > 0) {
            transportMissions.add(tm);
          }
        } else if (m instanceof PrivateerMission) {
          if (!(m.getTarget() instanceof Unit)) {
            navalUnits.add(aiUnit);
            done.add(aiUnit);
            continue;
          }
        }
        reasons.put(unit, 'Valid');
      } else if (unit.isNaval()) {
        navalUnits.add(aiUnit);
      } else if (unit.isAtSea()) {
        reasons.put(unit, 'At-Sea');
      } else {
        continue;
      }
      done.add(aiUnit);
    }
    aiUnits.removeAll(done);
    done.clear();
    if (bcm != null && !player.hasSettlements()) {
      let bcmTarget = bcm.getTarget();
      for (const $it41 = CollectionUtils.sort$Collection$Comparator(aiUnits, EuropeanAIPlayer.builderComparator).iterator(); $it41.hasNext(); ) {
        let aiUnit = $it41.next();
        let oldTarget = ((m = aiUnit.getMission$()) == null) ? null : m.getTarget();
        if ((m = this.getBuildColonyMission(aiUnit, bcmTarget)) == null) {
          continue;
        }
        lb.add([', ', m]);
        this.updateTransport(aiUnit, oldTarget, lb);
        done.add(aiUnit);
        if (this.requestsTransport(aiUnit)) {
          this.transportSupply.add(aiUnit);
        }
        reasons.put(aiUnit.getUnit(), '0Builder');
      }
      aiUnits.removeAll(done);
      done.clear();
    }
    if (this.nBuilders > 0) {
      let MAX_BUILDING_MISSION_TRIES = 50;
      let tries = 0;
      for (const $it42 = CollectionUtils.sort$Collection$Comparator(aiUnits, EuropeanAIPlayer.builderComparator).iterator(); $it42.hasNext(); ) {
        let aiUnit = $it42.next();
        if (aiUnit.getUnit().isArmed() && this.getGame().getTurn().getNumber() > 20) {
          continue;
        }
        tries++;
        if (tries > MAX_BUILDING_MISSION_TRIES) {
          break;
        }
        let oldTarget = ((m = aiUnit.getMission$()) == null) ? null : m.getTarget();
        if ((m = this.getBuildColonyMission(aiUnit, null)) == null) {
          continue;
        }
        lb.add([', ', m]);
        this.updateTransport(aiUnit, oldTarget, lb);
        done.add(aiUnit);
        if (this.requestsTransport(aiUnit)) {
          this.transportSupply.add(aiUnit);
        }
        reasons.put(aiUnit.getUnit(), 'Builder' + this.nBuilders);
        if (--this.nBuilders <= 0) {
          break;
        }
      }
      aiUnits.removeAll(done);
      done.clear();
    }
    if (this.nScouts > 0) {
      for (const $it43 = CollectionUtils.sort$Collection$Comparator(aiUnits, EuropeanAIPlayer.scoutComparator).iterator(); $it43.hasNext(); ) {
        let aiUnit = $it43.next();
        let oldTarget = ((m = aiUnit.getMission$()) == null) ? null : m.getTarget();
        let unit = aiUnit.getUnit();
        if ((m = this.getScoutingMission(aiUnit)) == null) {
          continue;
        }
        lb.add([', ', m]);
        this.updateTransport(aiUnit, oldTarget, lb);
        done.add(aiUnit);
        if (this.requestsTransport(aiUnit)) {
          this.transportSupply.add(aiUnit);
        }
        reasons.put(unit, 'Scout' + this.nScouts);
        if (--this.nScouts <= 0) {
          break;
        }
      }
      aiUnits.removeAll(done);
      done.clear();
    }
    if (this.nPioneers > 0) {
      for (const $it44 = CollectionUtils.sort$Collection$Comparator(aiUnits, EuropeanAIPlayer.pioneerComparator).iterator(); $it44.hasNext(); ) {
        let aiUnit = $it44.next();
        let unit = aiUnit.getUnit();
        let oldTarget = ((m = aiUnit.getMission$()) == null) ? null : m.getTarget();
        if ((m = this.getPioneeringMission(aiUnit, null)) == null) {
          continue;
        }
        lb.add([', ', m]);
        this.updateTransport(aiUnit, oldTarget, lb);
        done.add(aiUnit);
        if (this.requestsTransport(aiUnit)) {
          this.transportSupply.add(aiUnit);
        }
        reasons.put(unit, 'Pioneer' + this.nPioneers);
        if (--this.nPioneers <= 0) {
          break;
        }
      }
      aiUnits.removeAll(done);
      done.clear();
    }
    for (const $it45 = aiUnits.iterator(); $it45.hasNext(); ) {
      let aiUnit = $it45.next();
      let unit = aiUnit.getUnit();
      let oldTarget = ((m = aiUnit.getMission$()) == null) ? null : m.getTarget();
      if ((m = this.getSimpleMission(aiUnit)) == null) {
        continue;
      }
      lb.add([', ', m]);
      this.updateTransport(aiUnit, oldTarget, lb);
      reasons.put(unit, 'New-Land');
      done.add(aiUnit);
      if (this.requestsTransport(aiUnit)) {
        this.transportSupply.add(aiUnit);
      }
    }
    aiUnits.removeAll(done);
    done.clear();
    for (const $it46 = navalUnits.iterator(); $it46.hasNext(); ) {
      let aiUnit = $it46.next();
      let unit = aiUnit.getUnit();
      let old = ((m = aiUnit.getMission$()) != null && m.isValid()) ? m : null;
      if ((m = this.getSimpleMission(aiUnit)) == null) {
        continue;
      }
      lb.add([', ', m, ((m === old) ? ' (preserved)' : ' (new)')]);
      reasons.put(unit, 'New-Naval');
      done.add(aiUnit);
      if (m instanceof TransportMission) {
        let tm = m;
        if (tm.destinationCapacity() > 0) {
          transportMissions.add(tm);
        }
        for (const $it47 = aiUnit.getUnit().getUnitList().iterator(); $it47.hasNext(); ) {
          let u = $it47.next();
          let aiu = this.getAIUnit(u);
          let um = aiu.getMission$();
          if (um != null && um.isValid() && aiUnits.contains(aiu)) {
            aiUnits.remove(aiu);
            reasons.put(aiu.getUnit(), 'TNew');
          }
        }
      }
    }
    navalUnits.removeAll(done);
    done.clear();
    aiUnits.addAll(navalUnits);
    let ports = null;
    let nPorts = player.getNumberOfPorts();
    for (const $it48 = aiUnits.iterator(); $it48.hasNext(); ) {
      let aiUnit = $it48.next();
      let unit = aiUnit.getUnit();
      m = aiUnit.getMission$();
      let oldTarget = (m == null) ? null : m.getTarget();
      if (m != null && m.isValid() && !m.isOneTime()) {
        EuropeanAIPlayer.logger.warning('Trying fallback mission for unit ' + $J.str(unit) + ' with valid mission ' + $J.str(m) + ' reason ' + reasons.get(unit));
        continue;
      }
      if (nPorts > 0 && unit.isInEurope() && unit.isPerson()) {
        if (ports == null) {
          ports = player.getConnectedPortList();
        }
        let c = ports.removeAt(0);
        let aic = aiMain.getAIColony(c);
        if ((m = this.getWorkInsideColonyMission(aiUnit, aic)) != null) {
          lb.add([', ', m]);
          this.updateTransport(aiUnit, oldTarget, lb);
          reasons.put(unit, 'To-work');
        }
        ports.add(c);
      } else if (m instanceof IdleAtSettlementMission) {
        reasons.put(unit, 'Idle');
      } else {
        if ((m = this.getIdleAtSettlementMission(aiUnit)) != null) {
          lb.add([', ', m]);
          this.updateTransport(aiUnit, oldTarget, lb);
          reasons.put(unit, 'Idle');
        }
      }
    }
    lb.grew(['\n  Mission changes']);
    this.allocateTransportables(this.getUrgentTransportables(), transportMissions, lb);
    if (!aiUnits.isEmpty()) {
      lb.add(['\n  Free Land Units:']);
      for (const $it49 = aiUnits.iterator(); $it49.hasNext(); ) {
        let aiu = $it49.next();
        lb.add([' ', aiu.getUnit()]);
      }
    }
    if (!navalUnits.isEmpty()) {
      lb.add(['\n  Free Naval Units:']);
      for (const $it50 = navalUnits.iterator(); $it50.hasNext(); ) {
        let aiu = $it50.next();
        lb.add([' ', aiu.getUnit()]);
      }
    }
    lb.add(['\n  Missions(colonies=', player.getSettlementCount(), ' builders=', this.nBuilders, ' pioneers=', this.nPioneers, ' scouts=', this.nScouts, ' naval-carriers=', this.nNavalCarrier, ')']);
    this.logMissions(reasons, lb);
  }
  /**
   * Choose a mission for an AIUnit.
   *
   * @param aiUnit The {@code AIUnit} to choose for.
   * @return A suitable {@code Mission}, or null if none found.
   */
  getSimpleMission(aiUnit: AIUnit): Mission {
    let unit = aiUnit.getUnit();
    let m: Mission;
    let ret: Mission;
    let old = ((m = aiUnit.getMission$()) != null && m.isValid()) ? m : null;
    if (unit.isNaval()) {
      ret = (old instanceof PrivateerMission) ? old : (!unit.isInEurope() && (m = this.getPrivateerMission(aiUnit, null)) != null) ? m : (old instanceof TransportMission) ? old : ((m = this.getTransportMission(aiUnit)) != null) ? m : ((m = this.getPrivateerMission(aiUnit, null)) != null) ? m : (old instanceof UnitSeekAndDestroyMission) ? old : ((m = this.getSeekAndDestroyMission$AIUnit$int(aiUnit, 8)) != null) ? m : (old instanceof UnitWanderHostileMission) ? old : this.getWanderHostileMission(aiUnit);
    } else if (unit.isCarrier()) {
      ret = this.getTransportMission(aiUnit);
    } else {
      ret = (old instanceof CashInTreasureTrainMission) ? old : ((m = this.getCashInTreasureTrainMission(aiUnit)) != null) ? m : (unit.isInColony() && old instanceof WorkInsideColonyMission) ? old : (unit.isInColony() && (m = this.getWorkInsideColonyMission(aiUnit, null)) != null) ? m : (old instanceof DefendSettlementMission && old.getTarget() instanceof Colony && !(old.getTarget()).isVeryWellDefended()) ? old : ((m = this.getDefendCurrentSettlementMission(aiUnit)) != null) ? m : (unit.hasAbility$String(Ability.REF_UNIT)) ? ((old instanceof UnitSeekAndDestroyMission) ? old : ((m = this.getSeekAndDestroyMission$AIUnit$int(aiUnit, 12)) != null) ? m : (m = this.getWanderHostileMission(aiUnit))) : (unit.isColonist() && unit.getSkillLevel() > 0 && old instanceof WishRealizationMission) ? old : (unit.isColonist() && unit.getSkillLevel() > 0 && (m = this.getWishRealizationMission(aiUnit, null)) != null) ? m : ((m = this.getDefendSettlementMission$AIUnit$boolean$boolean(aiUnit, false, false)) != null) ? m : (old instanceof UnitSeekAndDestroyMission) ? old : ((m = this.getSeekAndDestroyMission$AIUnit$int(aiUnit, 8)) != null) ? m : (old instanceof MissionaryMission) ? old : ((m = this.getMissionaryMission(aiUnit)) != null) ? m : (old instanceof WishRealizationMission) ? old : ((m = this.getWishRealizationMission(aiUnit, null)) != null) ? m : ((m = this.getDefendSettlementMission$AIUnit$boolean$boolean(aiUnit, true, false)) != null) ? m : ((m = this.getSeekAndDestroyMission$AIUnit$int(aiUnit, 16)) != null) ? m : ((m = this.getDefendSettlementMission$AIUnit$boolean$boolean(aiUnit, true, true)) != null) ? m : (old instanceof UnitWanderHostileMission) ? old : ((m = this.getWanderHostileMission(aiUnit)) != null) ? m : null;
    }
    return ret;
  }
  /**
   * Gets a new BuildColonyMission for a unit.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param target An optional target {@code Location}.
   * @return A new mission, or null if impossible.
   */
  getBuildColonyMission(aiUnit: AIUnit, target: Location): Mission {
    let reason = BuildColonyMission.invalidMissionReason$AIUnit(aiUnit);
    if (reason != null) {
      return null;
    }
    let unit = aiUnit.getUnit();
    if (target == null) {
      target = BuildColonyMission.findMissionTarget(aiUnit, EuropeanAIPlayer.buildingRange, unit.isInEurope());
    }
    return (target == null) ? null : new BuildColonyMission()._BuildColonyMission$AIMain$AIUnit$Location(this.getAIMain(), aiUnit, target);
  }
  /**
   * Gets a new CashInTreasureTrainMission for a unit.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A new mission, or null if impossible.
   */
  getCashInTreasureTrainMission(aiUnit: AIUnit): Mission {
    let reason = CashInTreasureTrainMission.invalidMissionReason$AIUnit(aiUnit);
    if (reason != null) {
      return null;
    }
    let unit = aiUnit.getUnit();
    let loc = CashInTreasureTrainMission.findMissionTarget(aiUnit, EuropeanAIPlayer.cashInRange, unit.isInEurope());
    return (loc == null) ? null : new CashInTreasureTrainMission()._CashInTreasureTrainMission$AIMain$AIUnit$Location(this.getAIMain(), aiUnit, loc);
  }
  /**
   * Gets a new DefendSettlementMission for a unit.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param relaxed Use a relaxed cost decider to choose the target.
   * @param includeWellDefendedSettlements If {@code true}, then colonies that
   *      are already well defended can get a DefendSettlementMission.
   * @return A new mission, or null if impossible.
   */
  getDefendSettlementMission$AIUnit$boolean$boolean(aiUnit: AIUnit, relaxed: boolean, includeWellDefendedSettlements: boolean): Mission {
    if (DefendSettlementMission.invalidMissionReason$AIUnit(aiUnit) != null) {
      return null;
    }
    let unit = aiUnit.getUnit();
    let loc = unit.getLocation();
    let worstValue = 1.7976931348623157E308;
    let worstColony = null;
    for (const $it51 = this.getAIColonies().iterator(); $it51.hasNext(); ) {
      let aic = $it51.next();
      let colony = aic.getColony();
      if (aic.isBadlyDefended() || includeWellDefendedSettlements) {
        if (unit.isAtLocation(colony.getTile$())) {
          worstColony = colony;
          break;
        }
        let ttr = (1 + unit.getTurnsToReach$Location$Location$Unit$CostDecider(loc, colony.getTile$(), unit.getCarrier(), ((relaxed) ? CostDeciders.numberOfTiles() : null))) | 0;
        if (ttr >= Unit.MANY_TURNS) {
          continue;
        }
        let value = colony.getDefenceRatio() * 10 + ttr;
        if (value < worstValue) {
          worstValue = value;
          worstColony = colony;
        }
      }
    }
    return (worstColony == null) ? null : this.getDefendSettlementMission$AIUnit$Settlement(aiUnit, worstColony);
  }
  /**
   * Gets a new MissionaryMission for a unit.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A new mission, or null if impossible.
   */
  getMissionaryMission(aiUnit: AIUnit): Mission {
    if (MissionaryMission.prepare(aiUnit) != null) {
      return null;
    }
    let loc = MissionaryMission.findMissionTarget(aiUnit, EuropeanAIPlayer.missionaryRange, true);
    if (loc == null) {
      aiUnit.equipForRole(this.getSpecification().getDefaultRole());
      return null;
    }
    return new MissionaryMission()._MissionaryMission$AIMain$AIUnit$Location(this.getAIMain(), aiUnit, loc);
  }
  /**
   * Gets a new PioneeringMission for a unit.
   *
   * FIXME: pioneers to make roads between colonies
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param target An optional target {@code Location}.
   * @return A new mission, or null if impossible.
   */
  getPioneeringMission(aiUnit: AIUnit, target: Location): Mission {
    if (PioneeringMission.prepare(aiUnit) != null) {
      return null;
    }
    if (target == null) {
      target = PioneeringMission.findMissionTarget(aiUnit, EuropeanAIPlayer.pioneeringRange, true);
    }
    if (target == null) {
      let unit = aiUnit.getUnit();
      if (unit.isInEurope() || unit.getSettlement() != null) {
        aiUnit.equipForRole(this.getSpecification().getDefaultRole());
      }
      return null;
    }
    return new PioneeringMission()._PioneeringMission$AIMain$AIUnit$Location(this.getAIMain(), aiUnit, target);
  }
  /**
   * Gets a new PrivateerMission for a unit.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param target An optional target {@code Location}.
   * @return A new mission, or null if impossible.
   */
  getPrivateerMission(aiUnit: AIUnit, target: Location): Mission {
    if (PrivateerMission.invalidMissionReason$AIUnit(aiUnit) != null) {
      return null;
    }
    if (target == null) {
      target = PrivateerMission.findMissionTarget(aiUnit, EuropeanAIPlayer.privateerRange, true);
    }
    return (target == null) ? null : new PrivateerMission()._PrivateerMission$AIMain$AIUnit$Location(this.getAIMain(), aiUnit, target);
  }
  /**
   * Gets a new ScoutingMission for a unit.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A new mission, or null if impossible.
   */
  getScoutingMission(aiUnit: AIUnit): Mission {
    if (ScoutingMission.prepare(aiUnit) != null) {
      return null;
    }
    let loc = ScoutingMission.findMissionTarget(aiUnit, EuropeanAIPlayer.scoutingRange, true);
    if (loc == null) {
      let unit = aiUnit.getUnit();
      if (unit.isInEurope() || unit.getSettlement() != null) {
        aiUnit.equipForRole(this.getSpecification().getDefaultRole());
      }
      return null;
    }
    return new ScoutingMission()._ScoutingMission$AIMain$AIUnit$Location(this.getAIMain(), aiUnit, loc);
  }
  /**
   * Gets a new TransportMission for a unit.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A new mission, or null if impossible.
   */
  getTransportMission(aiUnit: AIUnit): Mission {
    if (TransportMission.invalidMissionReason$AIUnit(aiUnit) != null) {
      return null;
    }
    return new TransportMission()._TransportMission$AIMain$AIUnit(this.getAIMain(), aiUnit);
  }
  /**
   * Gets a new WishRealizationMission for a unit.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param wish An optional {@code WorkerWish} to realize.
   * @return A new mission, or null if impossible.
   */
  getWishRealizationMission(aiUnit: AIUnit, wish: WorkerWish): Mission {
    if (Mission.invalidMissionReason$AIUnit(aiUnit) != null) {
      return null;
    }
    let unit = aiUnit.getUnit();
    if (wish == null) {
      wish = this.getBestWorkerWish(aiUnit, unit.getType());
    }
    if (wish == null) {
      return null;
    }
    this.consumeWorkerWish(aiUnit, wish);
    return new WishRealizationMission()._WishRealizationMission$AIMain$AIUnit$Wish(this.getAIMain(), aiUnit, wish);
  }
  /**
   * Gets a WorkInsideColonyMission for a unit.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param aiColony An optional {@code AIColony} to work at.
   * @return A new mission, or null if impossible.
   */
  getWorkInsideColonyMission(aiUnit: AIUnit, aiColony: AIColony): Mission {
    if (aiColony == null) {
      aiColony = this.getAIColony(aiUnit.getUnit().getColony());
    }
    if (WorkInsideColonyMission.invalidMissionReason(aiUnit, aiColony.getColony()) != null) {
      return null;
    }
    return (aiColony == null) ? null : new WorkInsideColonyMission()._WorkInsideColonyMission$AIMain$AIUnit$AIColony(this.getAIMain(), aiUnit, aiColony);
  }
  /**
   * {@inheritDoc}
   */
  determineStance(other: Player): Stance {
    let player = this.getPlayer();
    return (other.isREF()) ? ((player.getREFPlayer() === other) ? ((player.isRebel()) ? Stance.WAR : Stance.PEACE) : ((!other.getRebels().isEmpty()) ? Stance.PEACE : super.determineStance(other))) : super.determineStance(other);
  }
  /**
   * {@inheritDoc}
   */
  startWorking(): void {
    let player = this.getPlayer();
    let turn = this.getGame().getTurn();
    let spec = this.getSpecification();
    EuropeanAIPlayer.initializeFromSpecification(spec);
    if (this.getAIMain().getAIPlayer(player) !== this) {
      throw new RuntimeException('EuropeanAIPlayer integrity fail: ' + $J.str(player));
    }
    this.clearAIUnits();
    player.clearNationCache();
    this.badlyDefended.clear();
    let lb = new LogBuilder()._LogBuilder(1024);
    let colonyCount = this.getAIColonies().size();
    lb.add([player.getDebugName(), ' in ', turn, '/', turn.getNumber(), ' units=', this.getAIUnits().size(), ' colonies=', colonyCount, ' declare=', (player.checkDeclareIndependence() == null), ' v-land-REF=', $J.boxD(player.getRebelStrengthRatio(false)), ' v-naval-REF=', $J.boxD(player.getRebelStrengthRatio(true))]);
    if (turn.isFirstTurn()) {
      this.initializeMissions(lb);
    }
    if (this.isLikesAttackingNatives() && this.getGame().getTurn().getNumber() > 100) {
      for (const $it52 = this.getGame().getLivePlayerList([player]).iterator(); $it52.hasNext(); ) {
        let p = $it52.next();
        if (!p.isIndian()) {
          continue;
        }
        player.getTension$Player(p).setValue(Tension.TENSION_MAX);
      }
    }
    this.determineStances(lb);
    if (colonyCount > 0) {
      lb.add(['\n  Badly defended:']);
      for (const $it53 = this.getAIColonies().iterator(); $it53.hasNext(); ) {
        let aic = $it53.next();
        if (aic.isBadlyDefended()) {
          this.badlyDefended.add(aic);
          lb.add([' ', aic.getColony()]);
        }
      }
      lb.add(['\n  Update colonies:']);
      for (const $it54 = this.getAIColonies().iterator(); $it54.hasNext(); ) {
        let aic = $it54.next();
        aic.update(lb);
      }
      this.buildTipMap(lb);
      this.buildWishMaps(lb);
    }
    this.cheat(lb);
    this.buyUnitsInEurope(lb);
    let aiUnits = this.getAIUnits();
    let militaryUnits = this.getAIUnits().stream().filter(MilitaryCoordinator.isUnitHandledByMilitaryCoordinator()).collect(Collectors.toSet());
    let militaryCoordinator = new MilitaryCoordinator()._MilitaryCoordinator(this, militaryUnits);
    militaryCoordinator.determineMissions();
    this.buildTransportMaps(lb);
    let normalAiUnits = this.getAIUnits().stream().filter(Predicate.negate(MilitaryCoordinator.isUnitHandledByMilitaryCoordinator())).collect(Collectors.toList());
    for (let i = 0; i < 3; i++) {
      this.rearrangeColonies(lb);
      this.giveNormalMissions(lb, normalAiUnits);
      this.bringGifts(lb);
      this.demandTribute(lb);
      if (aiUnits.isEmpty()) {
        break;
      }
      aiUnits = this.doMissions(aiUnits, lb);
    }
    lb.log(EuropeanAIPlayer.logger, Level.FINE);
    this.clearAIUnits();
    this.tipMap.clear();
    this.transportDemand.clear();
    this.transportSupply.clear();
    this.wagonsNeeded.clear();
    this.goodsWishes.clear();
    this.workerWishes.clear();
  }
  buyUnitsInEurope(lb: LogBuilder): void {
    let player = this.getPlayer();
    let europe = player.getEurope();
    if (player.getEurope() == null) {
      return;
    }
    let numberOfUnitsInDock = player.getEurope().getUnits().filter((unit) => !unit.isNaval()).count();
    let numberOfShips = this.getAIUnits().stream().filter((au) => au.getUnit().isNaval()).count();
    if (player.getEurope() != null && numberOfUnitsInDock > 6 && numberOfShips < 15) {
      if (!this.buyShip()) {
        return;
      }
    }
    if (numberOfUnitsInDock > 30) {
      return;
    }
    let militaryUnitBought = numberOfUnitsInDock >= 18;
    if (!militaryUnitBought) {
      if (this.reallyNeedsMoreArtillery() || this.isLikesAttackingNatives() && this.needsMoreArtillery()) {
        let unitBought = this.buyArtillery();
        if (unitBought == null) {
          return;
        }
        militaryUnitBought = true;
      }
      if (this.reallyNeedsMoreDragoons() || this.isLikesAttackingNatives() && this.needsMoreDragoons()) {
        let unitBought = this.buyDragoon();
        if (unitBought == null) {
          return;
        }
        militaryUnitBought = true;
      }
    }
    for (const $it55 = this.getWishes().iterator(); $it55.hasNext(); ) {
      let w = $it55.next();
      if (!(w instanceof WorkerWish)) {
        continue;
      }
      if (w.getTransportable() != null) {
        continue;
      }
      let workerWish = w;
      let unitType = workerWish.getUnitType();
      if (!unitType.isAvailableTo([player])) {
        continue;
      }
      let unitPrice = europe.getUnitPrice(unitType);
      if (unitPrice <= 0) {
        continue;
      }
      if (unitPrice > player.getGold()) {
        return;
      }
      let newUnit = this.trainAIUnitInEurope(unitType);
      if (newUnit != null) {
        this.getWishRealizationMission(newUnit, workerWish);
      }
      if (!militaryUnitBought) {
        militaryUnitBought = true;
        let unitBought = this.buyDragoon();
        if (unitBought == null) {
          return;
        }
      }
    }
    for (let i = 0; i < 6; i++) {
      let unitBought = this.buyDragoon();
      if (unitBought == null) {
        return;
      }
    }
  }
  buyShip(): boolean {
    let unitTypes = new ArrayList(CollectionUtils.transform$Collection$Predicate(this.getSpecification().getUnitTypeList(), (ut) => ut.hasAbility$String(Ability.NAVAL_UNIT) && ut.isAvailableTo([this.getPlayer()]) && ut.hasPrice() && ut.getSpace() > 0));
    Collections.shuffle(unitTypes);
    if (unitTypes.isEmpty()) {
      return false;
    }
    let au = new AbstractUnit()._AbstractUnit$UnitType$String$int(unitTypes.get(0), Specification.DEFAULT_ROLE_ID, 1);
    let purchasePrice = this.getPlayer().getEuropeanPurchasePrice(au);
    if (purchasePrice <= 0 || purchasePrice === Constants.INFINITY) {
      return false;
    }
    if (purchasePrice > this.getPlayer().getGold()) {
      return false;
    }
    this.getPlayer().modifyGold(-purchasePrice);
    let createdUnit = (this.getPlayer()).createUnits(List.of(au), this.getPlayer().getEurope(), this.getAIRandom());
    return true;
  }
  needsMoreDragoons(): boolean {
    return Math.imul(2, ((this.getAIColonies().size() + 1) | 0)) > this.getAIUnits().stream().filter((au) => au.getUnit().isMounted() && au.getUnit().isArmed()).count();
  }
  reallyNeedsMoreDragoons(): boolean {
    return ((this.getAIColonies().size() + 1) | 0) > this.getAIUnits().stream().filter((au) => au.getUnit().isMounted() && au.getUnit().isArmed()).count();
  }
  reallyNeedsMoreArtillery(): boolean {
    return (($J.idiv(this.getAIColonies().size(), 2) + 1) | 0) > this.getAIUnits().stream().filter((au) => au.getUnit().hasAbility$String(Ability.BOMBARD)).count();
  }
  needsMoreArtillery(): boolean {
    return ((this.getAIColonies().size() + 1) | 0) > this.getAIUnits().stream().filter((au) => au.getUnit().hasAbility$String(Ability.BOMBARD)).count();
  }
  buyDragoon(): Unit {
    let player = this.getPlayer();
    let dragoonRole = this.getSpecification().getMilitaryRolesList().stream().filter((r) => r.hasAbility$String(Ability.ARMED) && r.hasAbility$String(Ability.MOUNTED)).findFirst().orElse(null);
    if (dragoonRole == null) {
      return null;
    }
    let cheapestUnitType = this.getSpecification().getUnitTypesTrainedInEurope(this.getPlayer()).stream().filter((ut) => ut.getPrice() > 0 && ut.getPrice() !== Constants.INFINITY).sorted((a, b) => $J.icmp(a.getPrice(), b.getPrice())).findFirst().orElse(null);
    if (cheapestUnitType == null) {
      return null;
    }
    let au = new AbstractUnit()._AbstractUnit$UnitType$String$int(cheapestUnitType, dragoonRole.getId(), 1);
    let purchasePrice = player.getEuropeanPurchasePrice(au);
    if (purchasePrice <= 0 || purchasePrice === Constants.INFINITY) {
      return null;
    }
    if (purchasePrice > this.getPlayer().getGold()) {
      return null;
    }
    player.modifyGold(-purchasePrice);
    let auForCreation = new AbstractUnit()._AbstractUnit$UnitType$String$int(this.getSpecification().getDefaultUnitType$(), dragoonRole.getId(), 1);
    let createdUnit = (player).createUnits(List.of(auForCreation), player.getEurope(), this.getAIRandom());
    if (createdUnit.isEmpty()) {
      return null;
    }
    return createdUnit.get(0);
  }
  buyArtillery(): Unit {
    let player = this.getPlayer();
    let europe = player.getEurope();
    let cheapestArtilleryUnitType = this.getSpecification().getUnitTypesPurchasedInEurope(this.getPlayer()).stream().filter((ut) => ut.getPrice() > 0 && ut.getPrice() !== Constants.INFINITY).filter((ut) => ut.hasAbility$String(Ability.BOMBARD)).filter((ut) => ut.isAvailableTo([player])).sorted((a, b) => $J.icmp(a.getPrice(), b.getPrice())).findFirst().orElse(null);
    if (cheapestArtilleryUnitType == null) {
      return null;
    }
    let unitPrice = europe.getUnitPrice(cheapestArtilleryUnitType);
    if (unitPrice > player.getGold()) {
      return null;
    }
    let newUnit = this.trainAIUnitInEurope(cheapestArtilleryUnitType);
    if (newUnit == null) {
      return null;
    }
    return newUnit.getUnit();
  }
  /**
   * {@inheritDoc}
   */
  doMissions(aiUnits: List<AIUnit>, lb: LogBuilder): List<AIUnit> {
    lb.add(['\n  Do missions:']);
    let result = new ArrayList();
    for (const $it56 = aiUnits.iterator(); $it56.hasNext(); ) {
      let aiu = $it56.next();
      let unit = aiu.getUnit();
      if (unit == null || unit.isDisposed()) {
        continue;
      }
      let oldMission = aiu.getMission$();
      if (oldMission == null) {
        result.add(aiu);
        continue;
      }
      let oldTarget = oldMission.getTarget();
      let oldLocation = unit.getLocation();
      let oldColony = oldLocation.getColony();
      lb.add(['\n  ', unit, ' ']);
      try {
        aiu.doMission(lb);
      } catch ($e57) {
        if ($J.isa($e57, Exception)) {
          let e = $J.exc($e57);
          lb.add([', EXCEPTION: ', e.getMessage()]);
          EuropeanAIPlayer.logger.log(Level.WARNING, 'doMissions failed for: ' + $J.str(aiu), e);
        } else {
          throw $e57;
        }
      }
      if (unit.isDisposed() || unit.getLocation() == null) {
        aiu.dropTransport();
        lb.add([', DIED.']);
        continue;
      }
      this.updateTransport(aiu, oldTarget, lb);
      if (unit.isDisposed() || unit.getLocation() == null) {
        lb.add([', DIED.']);
        continue;
      }
      if (unit.getMovesLeft() > 0 && (!unit.isOnCarrier() || unit.getCarrier().getMovesLeft() > 0)) {
        lb.add(['+']);
        result.add(aiu);
      } else {
        lb.add(['.']);
      }
      let newColony = unit.getLocation().getColony();
      if (oldColony == null && newColony != null && Map_.isSameLocation(oldLocation, newColony)) {
        let aiColony = this.getAIColony(newColony);
        aiColony.update(lb);
        this.updateTipMap(aiColony);
      }
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  adjustMission(aiUnit: AIUnit, path: PathNode, type$: JClass, value: number): number {
    if (value > 0) {
      if (type$ === $J.cls(DefendSettlementMission)) {
        let loc = DefendSettlementMission.extractTarget(aiUnit, path);
        if (!(loc instanceof Colony)) {
          throw new IllegalStateException('European players defend colonies: ' + $J.str(loc));
        }
        let colony = loc;
        let defenders = this.getSettlementDefenders(colony);
        value = (value - Math.imul(25, defenders)) | 0;
        if (colony.hasStockade()) {
          if (defenders > ((colony.getStockade().getLevel() + 1) | 0)) {
            value = (value - Math.imul(100, colony.getStockade().getLevel())) | 0;
          } else {
            value = (value - Math.imul(20, colony.getStockade().getLevel())) | 0;
          }
        }
      }
    }
    return value;
  }
  /**
   * {@inheritDoc}
   */
  indianDemand(unit: Unit, colony: Colony, goods: GoodsType, gold: number, accept: Constants$IndianDemandAction): Constants$IndianDemandAction {
    return ($J.equals('conquest', this.getAIAdvantage())) ? Constants$IndianDemandAction.INDIAN_DEMAND_ACCEPT : Constants$IndianDemandAction.INDIAN_DEMAND_REJECT;
  }
  /**
   * {@inheritDoc}
   */
  acceptDiplomaticTrade(agreement: DiplomaticTrade): DiplomaticTrade$TradeStatus {
    let player = this.getPlayer();
    let other = agreement.getOtherPlayer(player);
    let franklin = other.hasAbility$String(Ability.ALWAYS_OFFERED_PEACE);
    let scores = new HashMap();
    let peace = null;
    let result = null;
    let lb = new LogBuilder()._LogBuilder(64);
    lb.add(['Evaluate trade offer to ', player.getName(), ' from ', other.getName()]);
    if (agreement.getVersion() === 0) {
      result = DiplomaticTrade$TradeStatus.PROPOSE_TRADE;
    } else {
      let unacceptable = 0;
      let value = 0;
      let colonies = 0;
      for (const $it58 = agreement.getItems().iterator(); $it58.hasNext(); ) {
        let item = $it58.next();
        if (item instanceof StanceTradeItem) {
          this.getNationSummary(other);
        }
        let score = item.evaluateFor(player);
        if (item instanceof ColonyTradeItem) {
          if (item.getSource() === player) {
            colonies++;
          } else {
            colonies--;
          }
        } else if (item instanceof StanceTradeItem) {
          switch (item.getStance()) {
            case Stance.ALLIANCE:
            case Stance.CEASE_FIRE:
              if (franklin) {
                peace = item;
                score = 0;
              }
              break;
            case Stance.UNCONTACTED:
            case Stance.PEACE:
              if (agreement.getContext() === DiplomaticTrade$TradeContext.CONTACT) {
                peace = item;
                score = 0;
              }
              break;
            default:
              break;
          }
        }
        if (score === TradeItem.INVALID_TRADE_ITEM) {
          unacceptable++;
        } else {
          value = (value + score) | 0;
        }
        scores.put(item, score);
        lb.add([', ', Messages.message$StringTemplate(item.getLabel()), ' = ', score]);
      }
      lb.add(['.']);
      if (colonies > 0 && colonies > ((player.getSettlementCount() - Colony.TRADE_MARGIN) | 0)) {
        result = this.rejectAgreement(peace, agreement);
        lb.add(['  Too many (', colonies, ') colonies lost.']);
      } else if (unacceptable === 0 && value >= 0) {
        result = DiplomaticTrade$TradeStatus.ACCEPT_TRADE;
        lb.add(['  All accepted at ', value, '.']);
      } else {
        let ratio = unacceptable / ((unacceptable + agreement.getItems().size()) | 0);
        if (ratio > 0.5 - 0.5 * agreement.getVersion()) {
          result = this.rejectAgreement(peace, agreement);
          lb.add(['  Too many (', unacceptable, ') unacceptable.']);
        }
      }
      if (result == null) {
        value = 0;
        for (const $it59 = scores.entrySet().iterator(); $it59.hasNext(); ) {
          let entry = $it59.next();
          if (entry.getValue() === TradeItem.INVALID_TRADE_ITEM) {
            agreement.remove$TradeItem(entry.getKey());
            lb.add(['  Dropped invalid ', entry.getKey(), '.']);
          } else {
            value = (value + entry.getValue()) | 0;
            lb.add(['  Added valid ', entry.getKey(), ', total = ', value, '.']);
          }
        }
        if (agreement.isEmpty()) {
          result = this.rejectAgreement(peace, agreement);
        }
      }
      if ((RandomUtils.randomInt(EuropeanAIPlayer.logger, 'Enough diplomacy?', this.getAIRandom(), (1 + agreement.getVersion()) | 0)) > 5) {
        result = this.rejectAgreement(peace, agreement);
        lb.add(['  Ran out of patience at ', agreement.getVersion(), '.']);
      }
      if (result == null) {
        for (const $it60 = CollectionUtils.mapEntriesByValue$Map$Comparator(scores, CollectionUtils.ascendingIntegerComparator).iterator(); $it60.hasNext(); ) {
          let e = $it60.next();
          if (value >= 0) {
            break;
          }
          let item = e.getKey();
          value = (value - e.getValue()) | 0;
          if (value >= 50 && item instanceof GoldTradeItem) {
            let gti = item;
            gti.setGold((gti.getGold() - $J.idiv(value, 2)) | 0);
            value = $J.idiv(value, 2);
            lb.add(['  Reducing gold item to ', gti.getGold(), '.']);
          } else {
            agreement.remove$TradeItem(item);
            lb.add(['  Dropped ', item, ', value now = ', value, '.']);
          }
        }
        if (value >= 0 && !agreement.isEmpty()) {
          result = DiplomaticTrade$TradeStatus.PROPOSE_TRADE;
          lb.add(['  Pruned until acceptable at ', value, '.']);
        } else {
          result = this.rejectAgreement(peace, agreement);
          lb.add(['  Agreement unsalvageable at ', value, '.']);
        }
      }
    }
    lb.add([' => ', result]);
    lb.log(EuropeanAIPlayer.logger, Level.INFO);
    return result;
  }
  /**
   * {@inheritDoc}
   */
  handleTrade(action: NativeTrade$NativeTradeAction, nt: NativeTrade): NativeTrade$NativeTradeAction {
    return NativeTrade$NativeTradeAction.NAK_INVALID;
  }
  /**
   * {@inheritDoc}
   */
  acceptTax(tax: number): boolean {
    let ret = true;
    let lb = new LogBuilder()._LogBuilder(64);
    let toBeDestroyed = this.getPlayer().getMostValuableGoods();
    lb.add(['Tax demand to ', this.getPlayer().getName(), ' of ', tax, '% with ', this.getPlayer().getMostValuableGoods(), ' ']);
    let goodsType = (toBeDestroyed == null) ? null : toBeDestroyed.getType();
    if (tax <= 2) {
      ret = true;
      lb.add(['accepted: small rise.']);
    } else if (toBeDestroyed == null) {
      ret = false;
      lb.add(['rejected: no-goods-under-threat.']);
    } else if (goodsType.isFoodType()) {
      ret = false;
      lb.add(['rejected: food-type.']);
    } else if (goodsType.isBreedable()) {
      let n = CollectionUtils.count$Stream$Predicate(this.getPlayer().getSettlements(), (s) => s.getGoodsCount(goodsType) > 0);
      ret = n < 2;
      if (ret) {
        lb.add(['accepted: breedable-type-', goodsType.getSuffix$(), '-missing.']);
      } else {
        lb.add(['rejected: breedable-type-', goodsType.getSuffix$(), '-present-in-', n, '-settlements.']);
      }
    } else if (goodsType.getMilitary() || goodsType.isTradeGoods() || goodsType.isBuildingMaterial()) {
      let turn = this.getGame().getTurn().getNumber();
      ret = turn < 300;
      lb.add([((ret) ? 'accepted' : 'rejected'), ': special-goods-in-turn-', turn, '.']);
    } else {
      let goodsTypes = this.getSpecification().getStorableGoodsTypeList();
      let averageIncome = $J.idiv(CollectionUtils.sum$Collection$ToIntFunction(goodsTypes, (gt) => this.getPlayer().getIncomeAfterTaxes(gt)), goodsTypes.size());
      let income = this.getPlayer().getIncomeAfterTaxes(toBeDestroyed.getType());
      ret = income <= 0 || income > averageIncome;
      lb.add([((ret) ? 'accepted' : 'rejected'), ': goods(', goodsType.getSuffix$(), ')-with-income(', income, ((ret) ? ')non-positive-or-more-than(' : ')less-than-average('), averageIncome, ').']);
    }
    if (!ret) {
      this.suppressEuropeanTrade(goodsType, lb);
    }
    lb.log(EuropeanAIPlayer.logger, Level.INFO);
    return ret;
  }
  /**
   * {@inheritDoc}
   */
  acceptMercenaries(): boolean {
    return this.getPlayer().isAtWar() || $J.equals('conquest', this.getAIAdvantage());
  }
  /**
   * {@inheritDoc}
   */
  selectFoundingFather(ffs: List<FoundingFather>): FoundingFather {
    let age = this.getGame().getAge();
    let bestFather = null;
    let bestWeight = -2147483648;
    for (const $it61 = ffs.iterator(); $it61.hasNext(); ) {
      let father = $it61.next();
      if (father == null) {
        continue;
      }
      if (father.hasAbility$String(Ability.BUILD_CUSTOM_HOUSE)) {
        bestFather = father;
        break;
      }
      let weight = father.getWeight(age);
      if (weight > bestWeight) {
        bestWeight = weight;
        bestFather = father;
      }
    }
    return bestFather;
  }
  /**
   * Gets the needed wagons for a tile/contiguity.
   *
   * @param tile The {@code Tile} to derive the contiguity from.
   * @return The number of wagons needed.
   */
  getNeededWagons(tile: Tile): number {
    if (tile != null) {
      let contig = tile.getContiguity();
      if (contig > 0) {
        let i = this.wagonsNeeded.get(contig);
        if (i != null) {
          return i;
        }
      }
    }
    return 0;
  }
  /**
   * How many pioneers should we have?
   *
   * This is the desired total number, not the actual number which would
   * take into account the number of existing PioneeringMissions.
   *
   * @return The desired number of pioneers for this player.
   */
  pioneersNeeded(): number {
    return $J.idiv(((this.tipMap.size() + 1) | 0), 2);
  }
  /**
   * How many scouts should we have?
   *
   * This is the desired total number, not the actual number which would
   * take into account the number of existing ScoutingMissions.
   *
   * Current scheme for European AIs is to use up to three scouts in
   * the early part of the game, then one.
   *
   * @return The desired number of scouts for this player.
   */
  scoutsNeeded(): number {
    return (3 - ($J.idiv(this.getGame().getTurn().getNumber(), 100))) | 0;
  }
  /**
   * Notify that a wish has been completed.  Called from AIColony.
   *
   * @param w The {@code Wish} to complete.
   */
  completeWish(w: Wish): void {
    if (w instanceof WorkerWish) {
      let ww = w;
      let wl = this.workerWishes.get(ww.getUnitType());
      if (wl != null) {
        wl.remove(ww);
      }
    } else if (w instanceof GoodsWish) {
      let gw = w;
      let gl = this.goodsWishes.get(gw.getGoodsType());
      if (gl != null) {
        gl.remove(gw);
      }
    } else {
      throw new IllegalStateException('Bogus wish: ' + $J.str(w));
    }
  }
  static $clinit() {
    EuropeanAIPlayer.logger = Logger.getLogger($J.cls(EuropeanAIPlayer).getName());
    EuropeanAIPlayer.equipPred = (u) => u.hasDefaultRole() && u.hasAbility$String(Ability.CAN_BE_EQUIPPED);
    EuropeanAIPlayer.partyPred = CollectionUtils.matchKey$Object$Function(Specification.COLONY_GOODS_PARTY_SOURCE, ($p0) => $p0.getSource());
    EuropeanAIPlayer.builderComparator = Comparator.reversed((Comparator.comparingInt(($p0) => $p0.getBuilderScore())));
    EuropeanAIPlayer.pioneerComparator = Comparator.reversed((Comparator.comparingInt(($p0) => $p0.getPioneerScore())));
    EuropeanAIPlayer.scoutComparator = Comparator.reversed((Comparator.comparingInt(($p0) => $p0.getScoutScore())));
    EuropeanAIPlayer.pioneerRole = null;
    EuropeanAIPlayer.scoutRole = null;
  }
}

$J.define(EuropeanAIPlayer, 'net.sf.freecol.server.ai.EuropeanAIPlayer', { kind: 'class', sup: 'net.sf.freecol.server.ai.MissionAIPlayer', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.io.FreeColXMLReader': '_EuropeanAIPlayer$AIMain$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.model.Player': '_EuropeanAIPlayer$AIMain$Player' }, returns: { 'getNavalStrengthRatio': 'double', 'getWishes': 'java.util.List', 'getUrgentTransportables': 'java.util.List', 'getTransportables': 'java.util.List', 'getBadlyDefended': 'java.util.List', 'isLikesAttackingNatives': 'boolean', 'isAggressive': 'boolean' }, meths: { 'getDefendSettlementMission(net.sf.freecol.server.ai.AIUnit,boolean,boolean)': 'getDefendSettlementMission$AIUnit$boolean$boolean', 'cheatUnit(net.sf.freecol.common.model.UnitType,java.lang.String,net.sf.freecol.common.util.LogBuilder)': 'cheatUnit$UnitType$String$LogBuilder$EuropeanAIPlayer', 'cheatUnit(java.util.List,java.lang.String,net.sf.freecol.common.util.LogBuilder)': 'cheatUnit$List$String$LogBuilder$EuropeanAIPlayer' }, clinit: true, lazy: ['logger', 'equipPred', 'partyPred', 'builderComparator', 'pioneerComparator', 'scoutComparator', 'liftBoycottCheatPercent', 'equipScoutCheatPercent', 'equipPioneerCheatPercent', 'landUnitCheatPercent', 'offensiveLandUnitCheatPercent', 'offensiveNavalUnitCheatPercent', 'transportNavalUnitCheatPercent', 'pioneerRole', 'scoutRole'] });
$J.module(() => {
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractUnit = $J.load('net.sf.freecol.common.model.AbstractUnit');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  ColonyTradeItem = $J.load('net.sf.freecol.common.model.ColonyTradeItem');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  Constants$IndianDemandAction = $J.load('net.sf.freecol.common.model.Constants$IndianDemandAction');
  DiplomaticTrade$TradeContext = $J.load('net.sf.freecol.common.model.DiplomaticTrade$TradeContext');
  DiplomaticTrade$TradeStatus = $J.load('net.sf.freecol.common.model.DiplomaticTrade$TradeStatus');
  Europe$MigrationType = $J.load('net.sf.freecol.common.model.Europe$MigrationType');
  GoldTradeItem = $J.load('net.sf.freecol.common.model.GoldTradeItem');
  HistoryEvent$HistoryEventType = $J.load('net.sf.freecol.common.model.HistoryEvent$HistoryEventType');
  Location = $J.load('net.sf.freecol.common.model.Location');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  NativeTrade$NativeTradeAction = $J.load('net.sf.freecol.common.model.NativeTrade$NativeTradeAction');
  Player$PlayerType = $J.load('net.sf.freecol.common.model.Player$PlayerType');
  Specification = $J.load('net.sf.freecol.common.model.Specification');
  Stance = $J.load('net.sf.freecol.common.model.Stance');
  StanceTradeItem = $J.load('net.sf.freecol.common.model.StanceTradeItem');
  Tension = $J.load('net.sf.freecol.common.model.Tension');
  TradeItem = $J.load('net.sf.freecol.common.model.TradeItem');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  CostDeciders = $J.load('net.sf.freecol.common.model.pathfinding.CostDeciders');
  GoalDeciders = $J.load('net.sf.freecol.common.model.pathfinding.GoalDeciders');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CachingFunction = $J.load('net.sf.freecol.common.util.CachingFunction');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  RandomChoice = $J.load('net.sf.freecol.common.util.RandomChoice');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
  AIColony = $J.load('net.sf.freecol.server.ai.AIColony');
  AIGoods = $J.load('net.sf.freecol.server.ai.AIGoods');
  AIMessage = $J.load('net.sf.freecol.server.ai.AIMessage');
  GoodsWish = $J.load('net.sf.freecol.server.ai.GoodsWish');
  ValuedAIObject = $J.load('net.sf.freecol.server.ai.ValuedAIObject');
  WorkerWish = $J.load('net.sf.freecol.server.ai.WorkerWish');
  MilitaryCoordinator = $J.load('net.sf.freecol.server.ai.military.MilitaryCoordinator');
  BuildColonyMission = $J.load('net.sf.freecol.server.ai.mission.BuildColonyMission');
  CashInTreasureTrainMission = $J.load('net.sf.freecol.server.ai.mission.CashInTreasureTrainMission');
  DefendSettlementMission = $J.load('net.sf.freecol.server.ai.mission.DefendSettlementMission');
  IdleAtSettlementMission = $J.load('net.sf.freecol.server.ai.mission.IdleAtSettlementMission');
  Mission = $J.load('net.sf.freecol.server.ai.mission.Mission');
  MissionaryMission = $J.load('net.sf.freecol.server.ai.mission.MissionaryMission');
  PioneeringMission = $J.load('net.sf.freecol.server.ai.mission.PioneeringMission');
  PrivateerMission = $J.load('net.sf.freecol.server.ai.mission.PrivateerMission');
  ScoutingMission = $J.load('net.sf.freecol.server.ai.mission.ScoutingMission');
  TransportMission = $J.load('net.sf.freecol.server.ai.mission.TransportMission');
  UnitSeekAndDestroyMission = $J.load('net.sf.freecol.server.ai.mission.UnitSeekAndDestroyMission');
  UnitWanderHostileMission = $J.load('net.sf.freecol.server.ai.mission.UnitWanderHostileMission');
  WishRealizationMission = $J.load('net.sf.freecol.server.ai.mission.WishRealizationMission');
  WorkInsideColonyMission = $J.load('net.sf.freecol.server.ai.mission.WorkInsideColonyMission');
});
