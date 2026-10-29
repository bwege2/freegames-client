// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/NativeAIPlayer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Comparator, HashMap, HashSet, Level, Logger, RuntimeException } from '../../../../../../jre/index.ts';
import { MissionAIPlayer } from './MissionAIPlayer.ts';

let Constants$IndianDemandAction, FeatureContainer, Modifier, NativeTrade, NativeTrade$NativeTradeAction, NativeTradeItem, Ownable, Tension$Level, CostDeciders, GameOptions, CollectionUtils, LogBuilder, RandomChoice, RandomUtils, DefendSettlementMission, IndianBringGiftMission, IndianDemandMission, Mission, UnitSeekAndDestroyMission, UnitWanderHostileMission;

/**
 * Objects of this class contains AI-information for a single {@link
 * Player} and is used for controlling this player.
 *
 * The method {@link #startWorking} gets called by the
 * {@link AIInGameInputHandler} when it is this player's turn.
 */
export class NativeAIPlayer extends MissionAIPlayer {
  static logger: Logger = null;
  static readonly MAX_DISTANCE_TO_BRING_GIFTS: number = 5;
  static readonly MAX_NUMBER_OF_GIFTS_BEING_DELIVERED: number = 1;
  static readonly MAX_DISTANCE_TO_MAKE_DEMANDS: number = 5;
  static readonly MAX_NUMBER_OF_DEMANDS: number = 1;
  /**
   * Debug helper to keep track of why/what the units are doing.
   * Do not serialize.
   */
  reasons: JMap<Unit, string> = null;
  $init_NativeAIPlayer() {
    this.reasons = new HashMap();
  }
  /**
   * Creates a new {@code AIPlayer}.
   *
   * @param aiMain The main AI-class.
   * @param player The player that should be associated with this
   *            {@code AIPlayer}.
   */
  _NativeAIPlayer$AIMain$Player(aiMain: AIMain, player: Player): this {
    this._MissionAIPlayer$AIMain$Player(aiMain, player);
    this.$init_NativeAIPlayer();
    this.initialized = this.getPlayer() != null;
    return this;
  }
  /**
   * Creates a new {@code AIPlayer}.
   *
   * @param aiMain The main AI-object.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered during parsing.
   */
  _NativeAIPlayer$AIMain$FreeColXMLReader(aiMain: AIMain, xr: FreeColXMLReader): this {
    this._MissionAIPlayer$AIMain$FreeColXMLReader(aiMain, xr);
    this.$init_NativeAIPlayer();
    this.initialized = this.getPlayer() != null;
    return this;
  }
  /**
   * Simple initialization of AI missions given that we know the starting
   * conditions.
   *
   * @param lb A {@code LogBuilder}  to log to.
   */
  initializeMissions(lb: LogBuilder): void {
    let player = this.getPlayer();
    lb.add(['\n  Initialize']);
    for (const $it0 = player.getIndianSettlementList().iterator(); $it0.hasNext(); ) {
      let is$ = $it0.next();
      let units = is$.getAllUnitsList();
      while (units.size() > is$.getRequiredDefenders()) {
        let u = units.removeAt(0);
        let aiu = this.getAIUnit(u);
        let m = this.getWanderHostileMission(aiu);
        if (m != null) {
          lb.add([' ', m]);
        }
      }
      for (const $it1 = units.iterator(); $it1.hasNext(); ) {
        let u = $it1.next();
        let aiu = this.getAIUnit(u);
        let m = this.getDefendSettlementMission$AIUnit$Settlement(aiu, is$);
        if (m != null) {
          lb.add([' ', m]);
        }
      }
    }
  }
  /**
   * Determines the stances towards each player.
   * That is: should we declare war?
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  determineStances(lb: LogBuilder): void {
    let player = this.getPlayer();
    lb.mark();
    for (const $it2 = this.getGame().getLivePlayerList([player]).iterator(); $it2.hasNext(); ) {
      let p = $it2.next();
      let newStance = this.determineStance(p);
      if (newStance !== player.getStance(p)) {
        this.getAIMain().getFreeColServer().getInGameController().changeStance(player, newStance, p, true);
        lb.add([' ', p.getDebugName(), '->', newStance, ', ']);
      }
    }
    if (lb.grew(['\n  Stance changes:'])) {
      lb.shrink(', ');
    }
  }
  /**
   * Takes the necessary actions to secure the settlements.
   * This is done by making new military units or to give existing
   * units new missions.
   *
   * @param randoms An array of random settlement indexes.
   * @param lb A {@code LogBuilder} to log to.
   */
  secureSettlements(randoms: number[], lb: LogBuilder): void {
    let randomIdx = 0;
    let settlements = this.getPlayer().getIndianSettlementList();
    for (const $it3 = settlements.iterator(); $it3.hasNext(); ) {
      let is$ = $it3.next();
      let n = randoms[randomIdx++];
      let settlement = settlements.get(n);
      if (settlement !== is$) {
        is$.tradeGoodsWithSettlement(settlement);
      }
    }
    for (const $it4 = settlements.iterator(); $it4.hasNext(); ) {
      let is$ = $it4.next();
      lb.mark();
      this.equipBraves(is$, lb);
      this.secureIndianSettlement(is$, lb);
      if (lb.grew(['\n  At ', is$.getName()])) {
        lb.shrink(', ');
      }
    }
  }
  /**
   * Greedily equips braves with horses and muskets.
   *
   * Public for the test suite.
   *
   * @param is The {@code IndianSettlement} where the equipping occurs.
   * @param lb A {@code LogBuilder} to log to.
   */
  equipBraves(is$: IndianSettlement, lb: LogBuilder): void {
    let comp = this.getGame().getCombatModel().getMilitaryStrengthComparator();
    for (const $it5 = CollectionUtils.sort$Collection$Comparator(is$.getAllUnitsList(), comp).iterator(); $it5.hasNext(); ) {
      let u = $it5.next();
      let r = is$.canImproveUnitMilitaryRole(u);
      if (r != null) {
        let old = u.getRole();
        if (this.getAIUnit(u).equipForRole(r) && u.getRole() !== old) {
          lb.add([u, ' upgraded from ', old.getSuffix$(), ', ']);
        }
      }
    }
  }
  /**
   * Takes the necessary actions to secure an indian settlement
   *
   * Public for the test suite.
   *
   * @param is The {@code IndianSettlement} to secure.
   * @param lb A {@code LogBuilder} to log to.
   */
  secureIndianSettlement(is$: IndianSettlement, lb: LogBuilder): void {
    let aiMain = this.getAIMain();
    let player = this.getPlayer();
    let cm = this.getGame().getCombatModel();
    let minimumDefence = (is$.getType().getMinimumSize() - 1) | 0;
    let dm: DefendSettlementMission;
    let units = is$.getAllUnitsList();
    let defenders = new ArrayList();
    for (const $it6 = is$.getOwnedUnitList().iterator(); $it6.hasNext(); ) {
      let u = $it6.next();
      if (!units.contains(u)) {
        units.add(u);
      }
    }
    for (const $it7 = new ArrayList(units).iterator(); $it7.hasNext(); ) {
      let u = $it7.next();
      let aiu = aiMain.getAIUnit(u);
      if (aiu == null) {
        units.remove(u);
      } else if ((dm = aiu.getMission$Class($J.cls(DefendSettlementMission))) != null && dm.getTarget() === is$) {
        defenders.add(u);
        units.remove(u);
      } else if (Mission.invalidNewMissionReason(aiu) != null) {
        units.remove(u);
      }
    }
    let threats = new HashMap();
    let enemy: Player;
    let tension: Tension;
    for (const $it8 = is$.getTile$().getSurroundingTiles$int((is$.getRadius() + 1) | 0).iterator(); $it8.hasNext(); ) {
      let t = $it8.next();
      if (!t.isLand() || t.getUnitCount() === 0) {
      } else if ((enemy = t.getFirstUnit().getOwner()) === player) {
        for (const $it9 = t.getUnitList().iterator(); $it9.hasNext(); ) {
          let u = $it9.next();
          let aiu: AIUnit;
          if (defenders.contains(u) || units.contains(u) || (aiu = aiMain.getAIUnit(u)) == null) {
          } else if ((dm = aiu.getMission$Class($J.cls(DefendSettlementMission))) != null && dm.getTarget() === is$) {
            defenders.add(u);
          } else if (Mission.invalidNewMissionReason(aiu) == null) {
            units.add(u);
          }
        }
      } else if ((tension = is$.getAlarm$Player(enemy)) == null || tension.getLevel().compareTo(Tension$Level.CONTENT) <= 0) {
      } else {
        let threshold: number;
        let bonus: number;
        let value = 0;
        if (tension.getLevel().compareTo(Tension$Level.DISPLEASED) <= 0) {
          threshold = 1;
          bonus = 0;
        } else {
          threshold = 0;
          bonus = Math.fround(Math.fround(tension.getLevel().ordinal()) - Tension$Level.CONTENT.ordinal());
        }
        value += CollectionUtils.sumDouble$Stream$Predicate$ToDoubleFunction(t.getUnits(), (u) => cm.getOffencePower$FreeColGameObject$FreeColGameObject(u, is$) > threshold, (u) => cm.getOffencePower$FreeColGameObject$FreeColGameObject(u, is$) + bonus);
        if (value > 0) {
          $J.boxD(threats.put(t, $J.boxD(value)));
        }
      }
    }
    let homeBonus = 3;
    let isTile = is$.getTile$();
    let isComparator = CollectionUtils.cachingIntComparator((u) => {
      let t = u.getTile$();
      return (t.getDistanceTo(isTile) - ((u.getHomeIndianSettlement() === is$) ? homeBonus : 0)) | 0;
    });
    let needed = (minimumDefence + threats.size()) | 0;
    if (defenders.size() < needed) {
      units.sort(isComparator);
      while (!units.isEmpty()) {
        let u = units.removeAt(0);
        let aiu = aiMain.getAIUnit(u);
        let m = this.getDefendSettlementMission$AIUnit$Settlement(aiu, is$);
        if (m != null) {
          lb.add([m, ', ']);
          defenders.add(u);
          if (defenders.size() >= needed) {
            break;
          }
        }
      }
    } else if (defenders.size() > needed) {
      defenders.sort(Comparator.reversed(isComparator));
      while (defenders.size() > needed) {
        units.add(defenders.removeAt(0));
      }
    }
    let threatComp = Comparator.comparingDouble((t) => +$J.boxD(threats.get(t)));
    let threatTiles = CollectionUtils.sort$Collection$Comparator(threats.keySet(), threatComp);
    if (!defenders.isEmpty()) {
      lb.add([' defend with:']);
      for (const $it10 = defenders.iterator(); $it10.hasNext(); ) {
        let u = $it10.next();
        lb.add([' ', u]);
      }
      lb.add([' minimum=', minimumDefence, ' threats=', threats.size(), ', ']);
    }
    while (!threatTiles.isEmpty() && !units.isEmpty()) {
      let tile = threatTiles.removeAt(0);
      let score = CollectionUtils.cacheInt((u) => u.getTile$().getDistanceTo(tile));
      let validPred = (u) => UnitSeekAndDestroyMission.invalidMissionReason$AIUnit$Location(aiMain.getAIUnit(u), tile.getDefendingUnit(u)) == null && score(u) >= 0;
      let scoreComp = Comparator.comparingInt(score);
      let unit = CollectionUtils.minimize$Collection$Predicate$Comparator(units, validPred, scoreComp);
      if (unit == null) {
        continue;
      }
      units.remove(unit);
      let aiUnit = aiMain.getAIUnit(unit);
      let target = tile.getDefendingUnit(unit);
      let m = this.getSeekAndDestroyMission$AIUnit$Location(aiUnit, target);
      if (m != null) {
        lb.add([m, ', ']);
      }
    }
  }
  /**
   * Gives a mission to all units.
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  giveNormalMissions(lb: LogBuilder): void {
    let player = this.getPlayer();
    let aiUnits = this.getAIUnits();
    lb.mark();
    let done = new ArrayList(aiUnits.size());
    this.reasons.clear();
    for (const $it11 = aiUnits.iterator(); $it11.hasNext(); ) {
      let aiUnit = $it11.next();
      let unit = aiUnit.getUnit();
      let m = aiUnit.getMission$();
      if (!unit.isInitialized() || unit.isDisposed()) {
        this.reasons.put(unit, 'Invalid');
      } else if (m != null && m.isValid() && !m.isOneTime()) {
        this.reasons.put(unit, 'Valid');
      } else {
        continue;
      }
      done.add(aiUnit);
    }
    aiUnits.removeAll(done);
    done.clear();
    for (const $it12 = aiUnits.iterator(); $it12.hasNext(); ) {
      let aiUnit = $it12.next();
      let unit = aiUnit.getUnit();
      let settlement = unit.getSettlement();
      let is$ = unit.getHomeIndianSettlement();
      let m = aiUnit.getMission$();
      if (settlement != null && ((settlement.getUnitCount() + settlement.getTile$().getUnitCount()) | 0) <= 1) {
        if (!(m instanceof DefendSettlementMission) || m.getTarget() !== settlement) {
          m = this.getDefendSettlementMission$AIUnit$Settlement(aiUnit, settlement);
          if (m == null) {
            continue;
          }
          lb.add([m, ', ']);
        }
        this.reasons.put(unit, 'Defend-' + settlement.getName());
      } else if (is$ != null && is$.canImproveUnitMilitaryRole(unit) != null) {
        if (!(m instanceof DefendSettlementMission) || m.getTarget() !== is$) {
          m = this.getDefendSettlementMission$AIUnit$Settlement(aiUnit, is$);
          if (m == null) {
            continue;
          }
          lb.add([m, ', ']);
        }
        this.reasons.put(unit, 'Equip-' + is$.getName());
      } else {
        if (!(m instanceof UnitWanderHostileMission)) {
          m = this.getWanderHostileMission(aiUnit);
          if (m == null) {
            continue;
          }
          lb.add([m, ', ']);
        }
        this.reasons.put(unit, 'Patrol');
      }
      done.add(aiUnit);
    }
    aiUnits.removeAll(done);
    done.clear();
    if (lb.grew(['\n  Mission changes: '])) {
      lb.shrink(', ');
    }
    if (!aiUnits.isEmpty()) {
      lb.add(['\n  Free Land Units:']);
      for (const $it13 = aiUnits.iterator(); $it13.hasNext(); ) {
        let aiu = $it13.next();
        lb.add([' ', aiu.getUnit()]);
      }
    }
    lb.add(['\n  Missions(settlements=', player.getSettlementCount(), ')']);
    this.logMissions(this.reasons, lb);
  }
  /**
   * Brings gifts to nice players with nearby colonies.
   *
   * @param randoms An array of random percentages.
   * @param lb A {@code LogBuilder} to log to.
   */
  bringGifts(randoms: number[], lb: LogBuilder): void {
    let player = this.getPlayer();
    let cd = CostDeciders.numberOfLegalTiles();
    let giftPercent = this.getSpecification().getPercentage(GameOptions.GIFT_PROBABILITY);
    let randomIdx = 0;
    lb.mark();
    for (const $it14 = player.getIndianSettlementList().iterator(); $it14.hasNext(); ) {
      let is$ = $it14.next();
      if (randoms[randomIdx++] >= giftPercent) {
        continue;
      }
      let gift = is$.getRandomGift(this.getAIRandom());
      if (gift == null) {
        continue;
      }
      let availableUnits = new ArrayList();
      let alreadyAssignedUnits = 0;
      for (const $it15 = is$.getOwnedUnitList().iterator(); $it15.hasNext(); ) {
        let ou = $it15.next();
        let aiu = this.getAIUnit(ou);
        if (aiu == null) {
          continue;
        } else if (aiu.hasMission$Class($J.cls(IndianBringGiftMission))) {
          alreadyAssignedUnits++;
        } else if (Mission.invalidNewMissionReason(aiu) == null) {
          availableUnits.add(ou);
        }
      }
      if (alreadyAssignedUnits > NativeAIPlayer.MAX_NUMBER_OF_GIFTS_BEING_DELIVERED) {
        lb.add([is$.getName(), ' has ', alreadyAssignedUnits, ' already, ']);
        continue;
      } else if (availableUnits.isEmpty()) {
        lb.add([is$.getName(), ' has no gift units, ']);
        continue;
      }
      let unit = null;
      let aiUnit = null;
      let home = is$.getTile$();
      while (unit == null && !availableUnits.isEmpty()) {
        let u = availableUnits.get(RandomUtils.randomInt(NativeAIPlayer.logger, 'Gift unit', this.getAIRandom(), availableUnits.size()));
        availableUnits.remove(u);
        aiUnit = this.getAIUnit(u);
        if (IndianBringGiftMission.invalidMissionReason$AIUnit(aiUnit) == null && u.findPath$Location$Location$Unit$CostDecider$LogBuilder(u.getTile$(), home, null, cd, null) != null) {
          unit = u;
        }
      }
      if (unit == null) {
        lb.add([is$.getName(), ' found no gift unit, ']);
        continue;
      }
      let nearbyColonies = new ArrayList();
      for (const $it16 = home.getSurroundingTiles$int(NativeAIPlayer.MAX_DISTANCE_TO_BRING_GIFTS).iterator(); $it16.hasNext(); ) {
        let t = $it16.next();
        let c = t.getColony();
        let path: PathNode;
        if (c == null || !is$.hasContacted(c.getOwner()) || IndianBringGiftMission.invalidMissionReason$AIUnit$Location(aiUnit, c) != null || (path = unit.findPath$Location$Location$Unit$CostDecider$LogBuilder(home, c.getTile$(), null, cd, null)) == null) {
          continue;
        }
        let alarm = Math.max(1, is$.getAlarm$Player(c.getOwner()).getValue());
        nearbyColonies.add(new RandomChoice()._RandomChoice(c, $J.idiv($J.idiv(1000000, alarm), ((1 + path.getTotalTurns()) | 0))));
      }
      if (nearbyColonies.isEmpty()) {
        lb.add([is$.getName(), ' found no gift colonies, ']);
        continue;
      }
      let target = RandomChoice.getWeightedRandom$Logger$String$Collection$Random(NativeAIPlayer.logger, 'Choose gift colony', nearbyColonies, this.getAIRandom());
      if (target == null) {
        throw new RuntimeException('No gift target: ' + $J.str(this));
      }
      let m = new IndianBringGiftMission()._IndianBringGiftMission$AIMain$AIUnit$Colony(this.getAIMain(), aiUnit, target);
      lb.add([m, ' gift from ', is$.getName(), ' to ', target.getName(), ', ']);
    }
    if (lb.grew(['\n  Gifts: '])) {
      lb.shrink(', ');
    }
  }
  /**
   * Demands tribute from nasty players with nearby colonies.
   *
   * @param randoms An array of random percentages.
   * @param lb A {@code LogBuilder} to log to.
   */
  demandTribute(randoms: number[], lb: LogBuilder): void {
    let player = this.getPlayer();
    let cd = CostDeciders.numberOfLegalTiles();
    let demandPercent = this.getSpecification().getPercentage(GameOptions.DEMAND_PROBABILITY);
    let randomIdx = 0;
    lb.mark();
    for (const $it17 = player.getIndianSettlementList().iterator(); $it17.hasNext(); ) {
      let is$ = $it17.next();
      if (randoms[randomIdx++] >= demandPercent) {
        continue;
      }
      let availableUnits = new ArrayList();
      let alreadyAssignedUnits = 0;
      for (const $it18 = is$.getOwnedUnitList().iterator(); $it18.hasNext(); ) {
        let ou = $it18.next();
        let aiu = this.getAIUnit(ou);
        if (Mission.invalidNewMissionReason(aiu) == null) {
          if (aiu.hasMission$Class($J.cls(IndianDemandMission))) {
            alreadyAssignedUnits++;
          } else {
            availableUnits.add(ou);
          }
        }
      }
      if (alreadyAssignedUnits > NativeAIPlayer.MAX_NUMBER_OF_DEMANDS) {
        lb.add([is$.getName(), ' has ', alreadyAssignedUnits, ' already, ']);
        continue;
      } else if (availableUnits.isEmpty()) {
        lb.add([is$.getName(), ' has no demand units, ']);
        continue;
      }
      let home = is$.getTile$();
      let unit = null;
      let aiUnit = null;
      while (unit == null && !availableUnits.isEmpty()) {
        let u = availableUnits.get(RandomUtils.randomInt(NativeAIPlayer.logger, 'Demand unit', this.getAIRandom(), availableUnits.size()));
        availableUnits.remove(u);
        aiUnit = this.getAIUnit(u);
        if (IndianDemandMission.invalidMissionReason$AIUnit(aiUnit) == null && u.findPath$Location$Location$Unit$CostDecider$LogBuilder(u.getTile$(), home, null, cd, null) != null) {
          unit = u;
        }
      }
      if (unit == null) {
        lb.add([is$.getName(), ' found no demand unit, ']);
        continue;
      }
      let nearbyColonies = new ArrayList();
      for (const $it19 = home.getSurroundingTiles$int(NativeAIPlayer.MAX_DISTANCE_TO_MAKE_DEMANDS).iterator(); $it19.hasNext(); ) {
        let t = $it19.next();
        let c = t.getColony();
        let path: PathNode;
        if (c == null || !is$.hasContacted(c.getOwner()) || IndianDemandMission.invalidMissionReason$AIUnit$Location(aiUnit, c) != null || (path = unit.findPath$Location$Location$Unit$CostDecider$LogBuilder(home, c.getTile$(), null, cd, null)) == null) {
          continue;
        }
        let alarm = is$.getAlarm$Player(c.getOwner()).getValue();
        let defence = (c.getUnitCount() + ((c.getStockade() == null) ? 1 : (Math.imul(c.getStockade().getLevel(), 10)))) | 0;
        let weight = (1 + Math.imul(alarm, ($J.idiv($J.idiv(1000000, defence), ((1 + path.getTotalTurns()) | 0))))) | 0;
        nearbyColonies.add(new RandomChoice()._RandomChoice(c, weight));
      }
      if (nearbyColonies.isEmpty()) {
        lb.add([is$.getName(), ' found no demand colonies, ']);
        continue;
      }
      let target = RandomChoice.getWeightedRandom$Logger$String$Collection$Random(NativeAIPlayer.logger, 'Choose demand colony', nearbyColonies, this.getAIRandom());
      if (target == null) {
        lb.add([is$.getName(), ' found no demand target, ']);
        continue;
      }
      let m = new IndianDemandMission()._IndianDemandMission$AIMain$AIUnit$Colony(this.getAIMain(), aiUnit, target);
      lb.add(['At ', is$.getName(), ' ', m, ' will demand of ', target, ', ']);
    }
    if (lb.grew(['\n  Tribute: '])) {
      lb.shrink(', ');
    }
  }
  /**
   * Gets the appropriate ship trade penalties.
   *
   * @param sense The sense to apply the modifiers.
   * @return The ship trade penalties.
   */
  getShipTradePenalties(sense: boolean): List<Modifier> {
    let spec = this.getSpecification();
    let penalty = Math.imul(((sense) ? 1 : -1), spec.getInteger(GameOptions.SHIP_TRADE_PENALTY));
    let mapper = (m) => Modifier.makeModifier(m).setValue(Math.fround(penalty));
    return CollectionUtils.transform$Stream$Predicate$Function(spec.getModifiers(Modifier.SHIP_TRADE_PENALTY), CollectionUtils.alwaysTrue(), mapper);
  }
  /**
   * Aborts all the missions which are no longer valid.
   *
   * Public for the test suite.
   */
  abortInvalidMissions(): void {
    for (const $it20 = this.getAIUnits().iterator(); $it20.hasNext(); ) {
      let au = $it20.next();
      let mission = au.getMission$();
      let reason = (mission == null) ? null : mission.invalidReason();
      if (reason != null) {
        au.changeMission(null);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  indianDemand(unit: Unit, colony: Colony, type$: GoodsType, amount: number, accept: Constants$IndianDemandAction): Constants$IndianDemandAction {
    let player = this.getPlayer();
    let aiu: AIUnit;
    let mission: IndianDemandMission;
    if (unit.getOwner() === player) {
      if ((aiu = this.getAIUnit(unit)) != null && (mission = aiu.getMission$Class($J.cls(IndianDemandMission))) != null && accept !== Constants$IndianDemandAction.INDIAN_DEMAND_DONE) {
        mission.setSucceeded(accept === Constants$IndianDemandAction.INDIAN_DEMAND_ACCEPT);
      }
    }
    return Constants$IndianDemandAction.INDIAN_DEMAND_DONE;
  }
  /**
   * {@inheritDoc}
   */
  startWorking(): void {
    let player = this.getPlayer();
    let turn = this.getGame().getTurn();
    let nSettlements = player.getSettlementCount();
    let air = this.getAIRandom();
    let lb = new LogBuilder()._LogBuilder(1024);
    lb.add([player.getDebugName(), ' in ', turn, '/', turn.getNumber()]);
    this.clearAIUnits();
    this.determineStances(lb);
    let more: List<AIUnit>;
    if (turn.isFirstTurn()) {
      this.initializeMissions(lb);
      more = this.getAIUnits();
    } else {
      let randoms: number[];
      this.abortInvalidMissions();
      if (nSettlements > 0) {
        randoms = RandomUtils.randomInts(NativeAIPlayer.logger, 'Trades', air, nSettlements, nSettlements);
        this.secureSettlements(randoms, lb);
        randoms = RandomUtils.randomInts(NativeAIPlayer.logger, 'Gifts', air, 100, nSettlements);
        this.bringGifts(randoms, lb);
        randoms = RandomUtils.randomInts(NativeAIPlayer.logger, 'Tribute', air, 100, nSettlements);
        this.demandTribute(randoms, lb);
      }
      this.giveNormalMissions(lb);
      more = this.doMissions(this.getAIUnits(), lb);
    }
    if (!more.isEmpty()) {
      this.abortInvalidMissions();
      this.giveNormalMissions(lb);
      this.doMissions(more, lb);
    }
    this.clearAIUnits();
    lb.log(NativeAIPlayer.logger, Level.FINEST);
  }
  /**
   * {@inheritDoc}
   */
  adjustMission(aiUnit: AIUnit, path: PathNode, type$: JClass, value: number): number {
    if (type$ === $J.cls(DefendSettlementMission)) {
      let settlement = DefendSettlementMission.extractTarget(aiUnit, path);
      value = (value - Math.imul(75, this.getSettlementDefenders(settlement))) | 0;
    } else if (type$ === $J.cls(UnitSeekAndDestroyMission)) {
      let target = UnitSeekAndDestroyMission.extractTarget(aiUnit, path);
      let targetPlayer = ($J.isa(target, Ownable)) ? (target).getOwner() : null;
      let is$ = aiUnit.getUnit().getHomeIndianSettlement();
      if (targetPlayer != null && is$ != null && is$.getAlarm$Player(targetPlayer) != null) {
        value = (value + (is$.getAlarm$Player(targetPlayer).getValue() - Tension$Level.DISPLEASED.getLimit())) | 0;
      }
    }
    return value;
  }
  /**
   * Price the goods to buy.
   *
   * @param nt The {@code NativeTrade} to update.
   * @param anger A penalty to the native prices due to anger.
   */
  updateTrade(nt: NativeTrade, anger: number): void {
    let spec = this.getSpecification();
    let turn = this.getGame().getTurn();
    let is$ = nt.getIndianSettlement();
    let unit = nt.getUnit();
    let modifiers = new HashSet();
    if (is$.hasMissionary$Player(unit.getOwner()) && spec.getBoolean(GameOptions.ENHANCED_MISSIONARIES)) {
      let u = is$.getMissionary();
      modifiers.addAll(u.getMissionaryTradeModifiers(true));
    }
    if (unit.isNaval()) {
      modifiers.addAll(this.getShipTradePenalties(true));
    }
    for (const $it21 = nt.getUnitToSettlement().iterator(); $it21.hasNext(); ) {
      let nti = $it21.next();
      let price = $J.d2i(FeatureContainer.applyModifiers$float$Turn$Collection(Math.fround(Math.fround(1 / anger) * is$.getPriceToBuy$AbstractGoods(nti.getGoods())), turn, modifiers));
      for (let h = nti.getHaggleCount(); h >= 0; h--) {
        price = NativeTrade.haggleUp(price);
      }
      if (price <= NativeTradeItem.PRICE_UNSET) {
        price = NativeTradeItem.PRICE_INVALID;
      }
      nti.setPrice(price);
    }
    modifiers.clear();
    if (is$.hasMissionary$Player(unit.getOwner()) && spec.getBoolean(GameOptions.ENHANCED_MISSIONARIES)) {
      let u = is$.getMissionary();
      modifiers.addAll(u.getMissionaryTradeModifiers(false));
    }
    if (unit.isNaval()) {
      modifiers.addAll(this.getShipTradePenalties(false));
    }
    for (const $it22 = nt.getSettlementToUnit().iterator(); $it22.hasNext(); ) {
      let nti = $it22.next();
      let price = $J.d2i(FeatureContainer.applyModifiers$float$Turn$Collection(Math.fround(Math.fround(anger) * is$.getPriceToSell$AbstractGoods(nti.getGoods())), turn, modifiers));
      for (let h = nti.getHaggleCount(); h >= 0; h--) {
        price = NativeTrade.haggleDown(price);
      }
      if (price <= NativeTradeItem.PRICE_UNSET) {
        price = NativeTradeItem.PRICE_INVALID;
      }
      nti.setPrice(price);
    }
  }
  /**
   * {@inheritDoc}
   */
  handleTrade(action: NativeTrade$NativeTradeAction, nt: NativeTrade): NativeTrade$NativeTradeAction {
    let HAGGLE_NUMBER = 3;
    if (nt == null || !this.getPlayer().owns(nt.getIndianSettlement())) {
      return NativeTrade$NativeTradeAction.NAK_INVALID;
    }
    let is$ = nt.getIndianSettlement();
    let unit = nt.getUnit();
    let other = unit.getOwner();
    let ours: NativeTradeItem;
    let anger: number;
    let haggle: number;
    let tension = is$.getAlarm$Player(other);
    if (tension == null) {
      return NativeTrade$NativeTradeAction.NAK_INVALID;
    }
    switch (action) {
      case NativeTrade$NativeTradeAction.OPEN:
        switch (tension.getLevel()) {
          case Tension$Level.HAPPY:
          case Tension$Level.CONTENT:
            anger = 1;
            break;
          case Tension$Level.DISPLEASED:
            anger = 2;
            break;
          case Tension$Level.ANGRY:
          default:
            anger = -1;
            break;
        }
        if (anger < 0) {
          return NativeTrade$NativeTradeAction.NAK_HOSTILE;
        }
        this.updateTrade(nt, anger);
        return (nt.getDone()) ? NativeTrade$NativeTradeAction.NAK_NOSALE : NativeTrade$NativeTradeAction.ACK_OPEN;
      case NativeTrade$NativeTradeAction.BUY:
        switch (tension.getLevel()) {
          case Tension$Level.HAPPY:
          case Tension$Level.CONTENT:
            anger = 1;
            break;
          case Tension$Level.DISPLEASED:
            anger = 2;
            break;
          case Tension$Level.ANGRY:
          default:
            anger = -1;
            break;
        }
        if (anger < 0) {
          return NativeTrade$NativeTradeAction.NAK_HOSTILE;
        }
        this.updateTrade(nt, anger);
        ours = CollectionUtils.find$Collection$Predicate(nt.getSettlementToUnit(), nt.getItem().goodsMatcher());
        if (ours == null) {
          return NativeTrade$NativeTradeAction.NAK_INVALID;
        }
        if (nt.getItem().priceIsSet() && nt.getItem().getPrice() >= ours.getPrice()) {
          return NativeTrade$NativeTradeAction.ACK_BUY;
        }
        haggle = (ours.getHaggleCount() + 1) | 0;
        if ((RandomUtils.randomInt(NativeAIPlayer.logger, 'Haggle-buy', this.getAIRandom(), (HAGGLE_NUMBER + haggle) | 0)) >= HAGGLE_NUMBER) {
          return NativeTrade$NativeTradeAction.NAK_HAGGLE;
        }
        ours.setHaggleCount(haggle);
        this.updateTrade(nt, anger);
        nt.setItem(ours);
        return NativeTrade$NativeTradeAction.ACK_BUY_HAGGLE;
      case NativeTrade$NativeTradeAction.SELL:
        switch (tension.getLevel()) {
          case Tension$Level.HAPPY:
          case Tension$Level.CONTENT:
            anger = 1;
            break;
          case Tension$Level.DISPLEASED:
            anger = 2;
            break;
          case Tension$Level.ANGRY:
            anger = (CollectionUtils.any$Collection$Predicate(nt.getUnitToSettlement(), (nti) => nti.getGoods().getType().getMilitary())) ? 3 : -1;
            break;
          default:
            anger = -1;
            break;
        }
        if (anger < 0) {
          return NativeTrade$NativeTradeAction.NAK_HOSTILE;
        }
        this.updateTrade(nt, anger);
        ours = CollectionUtils.find$Collection$Predicate(nt.getUnitToSettlement(), nt.getItem().goodsMatcher());
        if (ours == null) {
          return NativeTrade$NativeTradeAction.NAK_INVALID;
        }
        if (nt.getItem().priceIsSet() && nt.getItem().getPrice() <= ours.getPrice()) {
          return NativeTrade$NativeTradeAction.ACK_SELL;
        }
        haggle = (ours.getHaggleCount() + 1) | 0;
        if ((RandomUtils.randomInt(NativeAIPlayer.logger, 'Haggle-sell', this.getAIRandom(), (HAGGLE_NUMBER + haggle) | 0)) >= HAGGLE_NUMBER) {
          return NativeTrade$NativeTradeAction.NAK_HAGGLE;
        }
        ours.setHaggleCount(haggle);
        this.updateTrade(nt, anger);
        nt.setItem(ours);
        return NativeTrade$NativeTradeAction.ACK_SELL_HAGGLE;
      case NativeTrade$NativeTradeAction.GIFT:
        ours = CollectionUtils.find$Collection$Predicate(nt.getUnitToSettlement(), nt.getItem().goodsMatcher());
        if (ours == null) {
          return NativeTrade$NativeTradeAction.NAK_INVALID;
        }
        return (is$.canAdd(nt.getItem().getGoods())) ? NativeTrade$NativeTradeAction.ACK_GIFT : NativeTrade$NativeTradeAction.NAK_GOODS;
      default:
        return NativeTrade$NativeTradeAction.NAK_INVALID;
    }
  }
  /**
   * {@inheritDoc}
   */
  getNeededWagons(tile: Tile): number {
    throw new RuntimeException('Can not happen: ' + $J.str(this));
  }
  /**
   * {@inheritDoc}
   */
  pioneersNeeded(): number {
    throw new RuntimeException('Can not happen: ' + $J.str(this));
  }
  /**
   * {@inheritDoc}
   */
  scoutsNeeded(): number {
    throw new RuntimeException('Can not happen: ' + $J.str(this));
  }
  /**
   * {@inheritDoc}
   */
  completeWish(w: Wish): void {
    throw new RuntimeException('Can not happen: ' + $J.str(this));
  }
  static $clinit() {
    NativeAIPlayer.logger = Logger.getLogger($J.cls(NativeAIPlayer).getName());
  }
}

$J.define(NativeAIPlayer, 'net.sf.freecol.server.ai.NativeAIPlayer', { kind: 'class', sup: 'net.sf.freecol.server.ai.MissionAIPlayer', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.io.FreeColXMLReader': '_NativeAIPlayer$AIMain$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.model.Player': '_NativeAIPlayer$AIMain$Player' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Constants$IndianDemandAction = $J.load('net.sf.freecol.common.model.Constants$IndianDemandAction');
  FeatureContainer = $J.load('net.sf.freecol.common.model.FeatureContainer');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  NativeTrade = $J.load('net.sf.freecol.common.model.NativeTrade');
  NativeTrade$NativeTradeAction = $J.load('net.sf.freecol.common.model.NativeTrade$NativeTradeAction');
  NativeTradeItem = $J.load('net.sf.freecol.common.model.NativeTradeItem');
  Ownable = $J.load('net.sf.freecol.common.model.Ownable');
  Tension$Level = $J.load('net.sf.freecol.common.model.Tension$Level');
  CostDeciders = $J.load('net.sf.freecol.common.model.pathfinding.CostDeciders');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  RandomChoice = $J.load('net.sf.freecol.common.util.RandomChoice');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
  DefendSettlementMission = $J.load('net.sf.freecol.server.ai.mission.DefendSettlementMission');
  IndianBringGiftMission = $J.load('net.sf.freecol.server.ai.mission.IndianBringGiftMission');
  IndianDemandMission = $J.load('net.sf.freecol.server.ai.mission.IndianDemandMission');
  Mission = $J.load('net.sf.freecol.server.ai.mission.Mission');
  UnitSeekAndDestroyMission = $J.load('net.sf.freecol.server.ai.mission.UnitSeekAndDestroyMission');
  UnitWanderHostileMission = $J.load('net.sf.freecol.server.ai.mission.UnitWanderHostileMission');
});
