// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/REFAIPlayer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Comparator, HashMap, HashSet, JObject, Level, Logger, RuntimeException } from '../../../../../../jre/index.ts';
import { EuropeanAIPlayer } from './EuropeanAIPlayer.ts';

let Ability, Colony, Settlement, Stance, Unit, CostDeciders, GoalDeciders, CachingFunction, CollectionUtils, LogBuilder, RandomUtils, Utils, DefendSettlementMission, PrivateerMission, TransportMission, UnitSeekAndDestroyMission;

/**
 * Objects of this class contains AI-information for a single REF player.
 *
 * For now, mostly just the EuropeanAIPlayer, with a few tweaks.
 */
export class REFAIPlayer extends EuropeanAIPlayer {
  static logger: Logger = null;
  /**
   * Limit on the number of REF units chasing a single hostile unit.
   */
  static readonly UNIT_USAD_THRESHOLD: number = 5;
  static readonly seekAndDestroyRange: number = 12;
  /**
   * Map of target to count.
   */
  targetMap: JMap<Location, number> = null;
  /**
   * Has the army been landed?
   */
  landed: boolean = false;
  $init_REFAIPlayer() {
    this.targetMap = new HashMap();
    this.landed = false;
  }
  /**
   * Creates a new {@code REFAIPlayer}.
   *
   * @param aiMain The main AI-class.
   * @param player The player that should be associated with this
   *            {@code REFAIPlayer}.
   */
  _REFAIPlayer$AIMain$Player(aiMain: AIMain, player: Player): this {
    this._EuropeanAIPlayer$AIMain$Player(aiMain, player);
    this.$init_REFAIPlayer();
    this.initialized = this.getPlayer() != null;
    return this;
  }
  /**
   * Creates a new {@code REFAIPlayer}.
   *
   * @param aiMain The main AI-object.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered during parsing.
   */
  _REFAIPlayer$AIMain$FreeColXMLReader(aiMain: AIMain, xr: FreeColXMLReader): this {
    this._EuropeanAIPlayer$AIMain$FreeColXMLReader(aiMain, xr);
    this.$init_REFAIPlayer();
    this.initialized = this.getPlayer() != null;
    return this;
  }
  /**
   * Find suitable colony targets.
   *
   * @param aiu The {@code AIUnit} to search with.
   * @param port If true, insist on the colonies being ports.
   * @param aiCarrier The {@code AIUnit} to use as a carrier.
   * @return A list of {@code TargetTuple} target choices.
   */
  findColonyTargets$AIUnit$boolean$AIUnit$REFAIPlayer(aiu: AIUnit, port: boolean, aiCarrier: AIUnit): List<REFAIPlayer$TargetTuple> {
    let player = this.getPlayer();
    let unit = aiu.getUnit();
    let carrier = aiCarrier.getUnit();
    let pathMapper = new CachingFunction()._CachingFunction((c) => unit.findPath$Location$Location$Unit(carrier, c, carrier));
    let pathPred = (c) => pathMapper.apply(c) != null;
    let newTupleMapper = (c) => {
      let path = pathMapper.apply(c);
      return new REFAIPlayer$TargetTuple()._REFAIPlayer$TargetTuple(c, path, UnitSeekAndDestroyMission.scorePath(aiu, path, false, false));
    };
    let targets = CollectionUtils.transform$Stream$Predicate$Function(CollectionUtils.flatten$Collection$Function(player.getRebels(), ((port) ? (($p0) => $p0.getConnectedPorts()) : ($p0) => $p0.getColonies())), pathPred, newTupleMapper);
    if (targets.isEmpty()) {
      return targets;
    }
    let percentTwiddle = 20;
    let twiddle = RandomUtils.randomInts(REFAIPlayer.logger, 'REF target twiddle', this.getAIRandom(), (Math.imul(2, percentTwiddle) + 1) | 0, targets.size());
    let twidx = 0;
    for (const $it0 = targets.iterator(); $it0.hasNext(); ) {
      let t = $it0.next();
      let bdf = (b) => ((b.hasAbility$String(Ability.REPAIR_UNITS)) ? 1.5 : 1) * (CollectionUtils.product$Stream$ToDoubleFunction(b.getOutputs(), (ag) => (ag.getType().getMilitary()) ? 2 : (ag.getType().isBuildingMaterial() && ag.getType().isRefined()) ? 1.5 : 1));
      t.score *= 0.01 * ((101 - Math.min(100, t.colony.getSonsOfLiberty())) | 0) * CollectionUtils.product$Collection$Predicate$ToDoubleFunction(t.colony.getBuildings(), (b) => b.getLevel() > 1, bdf) * (((6 - ((!t.colony.hasStockade()) ? 0 : t.colony.getStockade().getLevel())) | 0) / 6) * (1 + 0.01 * ((twiddle[twidx++] - percentTwiddle) | 0));
    }
    targets.sort(Comparator.naturalOrder());
    return targets;
  }
  /**
   * Find suitable colony targets.
   *
   * @param aiu The {@code AIUnit} to search with.
   * @param aiCarrier The {@code AIUnit} to use as a carrier.
   * @return A list of {@code TargetTuple} target choices.
   */
  findColonyTargets$AIUnit$AIUnit$REFAIPlayer(aiu: AIUnit, aiCarrier: AIUnit): List<REFAIPlayer$TargetTuple> {
    let targets = this.findColonyTargets$AIUnit$boolean$AIUnit$REFAIPlayer(aiu, true, aiCarrier);
    if (targets.isEmpty()) {
      targets = this.findColonyTargets$AIUnit$boolean$AIUnit$REFAIPlayer(aiu, false, aiCarrier);
    }
    return targets;
  }
  /**
   * Initialize the REF.
   * - Find the initial target
   * - Give valid missions to all the units
   *
   * Note that we can not rely on normal AI processing as the
   * "teleporting" Col1-style REF needs to be placed on the map
   * before its first turn starts, so the server should ask this
   * AI where it should arrive on the map.
   *
   * Note also that to find a target we can not just call
   * getMilitaryMission and aim for it as the getMilitaryMission
   * scoring includes distance from starting point, which is what we
   * are trying to determine.
   * So, just choose the best coastal colony.
   *
   * FIXME: Mission assignment is done here because ATM the European
   * AI is prone to send ships full of troops off to attack the
   * rebel navy.  If this is fixed check if the normal mission
   * assignment works and drop it from here.
   *
   * @param teleport "Teleporting" in is allowed.
   * @return True if the initialization succeeds.
   */
  initialize(teleport: boolean): boolean {
    let aiMain = this.getAIMain();
    let aiRandom = this.getAIRandom();
    let aiUnit = CollectionUtils.find$Collection$Predicate(this.getAIUnits(), (aiu) => !aiu.getUnit().isNaval() && aiu.getUnit().isOffensiveUnit());
    if (aiUnit == null) {
      REFAIPlayer.logger.warning('REF has no army?!?');
      return false;
    }
    let unit = aiUnit.getUnit();
    let carrier = unit.getCarrier();
    if (carrier == null) {
      REFAIPlayer.logger.warning('REF land unit not on a carrier: ' + $J.str(unit));
      return false;
    }
    let aiCarrier = aiMain.getAIUnit(carrier);
    if (aiCarrier == null) {
      REFAIPlayer.logger.warning('REF naval unit missing: ' + $J.str(carrier));
      return false;
    }
    let targets = this.findColonyTargets$AIUnit$AIUnit$REFAIPlayer(aiUnit, aiCarrier);
    if (targets.isEmpty()) {
      REFAIPlayer.logger.warning('REF found no targets.');
      return false;
    } else {
      let lb = new LogBuilder()._LogBuilder(64);
      lb.add(['REF found colony targets:']);
      for (const $it1 = targets.iterator(); $it1.hasNext(); ) {
        let t = $it1.next();
        lb.add([' ', t.colony, '(', $J.boxD(t.score), ')']);
      }
      lb.log(REFAIPlayer.logger, Level.FINE);
    }
    let rebel = targets.get(0).colony.getOwner();
    let ratio = this.getStrengthRatio(rebel);
    let n = targets.size();
    let lb = new LogBuilder()._LogBuilder(64);
    lb.add(['REF attacking ', rebel.getName(), ' ratio=', $J.boxD(ratio)]);
    let fail = 0;
    for (const $it2 = targets.iterator(); $it2.hasNext(); ) {
      let t = $it2.next();
      let gd = GoalDeciders.getDisembarkGoalDecider(t.colony.getTile$());
      let path = unit.search(t.entry, gd, null, 10, carrier);
      if (path == null) {
        t.disembarkTile = null;
        fail++;
      } else {
        t.disembarkTile = path.getTransportDropNode().previous_.getTile();
      }
    }
    if (fail > 0) {
      if (fail < n) {
        lb.add([' (']);
        let i = 0;
        while (i < targets.size()) {
          let t = targets.get(i);
          if (t.disembarkTile == null) {
            lb.add([' ', t.colony]);
            targets.removeAt(i);
            n--;
          } else {
            i++;
          }
        }
        lb.add([')']);
      } else {
        for (const $it3 = targets.iterator(); $it3.hasNext(); ) {
          let t = $it3.next();
          t.disembarkTile = t.path.getTransportDropNode().previous_.getTile();
        }
      }
    }
    n = (ratio < 1) ? 1 : (ratio < 2) ? Math.min(2, targets.size()) : Math.min(3, targets.size());
    lb.add([' => #targets=', n]);
    if (!teleport) {
      let stealthGD = GoalDeciders.getComposedGoalDecider(true, [GoalDeciders.getHighSeasGoalDecider(), GoalDeciders.getStealthyGoalDecider(rebel)]);
      for (let i = 0; i < n; i++) {
        let t = targets.get(i);
        if (!rebel.canSee(t.entry)) {
          continue;
        }
        let path = carrier.search(t.disembarkTile, stealthGD, CostDeciders.avoidSettlementsAndBlockingUnits(), (t.path.getTotalTurns() + 1) | 0, null);
        if (path != null) {
          t.entry = path.getLastNode().getTile();
          t.score *= 1.5;
        }
      }
      targets.sort(Comparator.naturalOrder());
    }
    let navy = new ArrayList();
    let auIterator = this.getAIUnits().iterator();
    let land = this.getPlayer().getNumberOfKingLandUnits();
    let used: number;
    let m: Mission;
    for (let i = 0; i < n; i++) {
      if (!auIterator.hasNext()) {
        break;
      }
      let t = targets.get(i);
      lb.add(['\n  Attack ', t.colony, ' from ', t.entry, ' via ', t.disembarkTile, ' with ']);
      while (auIterator.hasNext()) {
        let aiu = auIterator.next();
        if (!aiu.getUnit().isNaval()) {
          continue;
        }
        let ship = aiu.getUnit();
        if (ship.isEmpty()) {
          navy.add(aiu);
          continue;
        }
        if (teleport) {
          ship.setEntryLocation(t.disembarkTile);
        } else {
          ship.setEntryLocation(t.entry);
        }
        lb.add(['[', ship]);
        lb.mark();
        used = 0;
        for (const $it4 = aiu.getUnit().getUnitList().iterator(); $it4.hasNext(); ) {
          let u = $it4.next();
          let laiu = aiMain.getAIUnit(u);
          m = this.getSeekAndDestroyMission$AIUnit$Location(laiu, t.colony);
          if (m != null) {
            lb.add([' ', m]);
          }
          used++;
        }
        m = this.getTransportMission(aiu);
        lb.grew([' ', m]);
        lb.add([' ]']);
        if (i < ((n - 1) | 0) && used >= $J.d2i(Math.floor(land * 0.66))) {
          land = (land - used) | 0;
          break;
        }
      }
    }
    let rebelNavy = new HashSet();
    let navyGD = new REFAIPlayer$REFNavyGoalDecider()._REFAIPlayer$REFNavyGoalDecider(rebel, rebelNavy);
    for (let i = 0; i < n; i++) {
      carrier.search(targets.get(i).entry, navyGD, null, Math.imul(carrier.getInitialMovesLeft(), 2), null);
    }
    let militaryStrengthComparator = this.getGame().getCombatModel().getMilitaryStrengthComparator();
    let rebelTargets = new ArrayList(rebelNavy);
    rebelTargets.sort(militaryStrengthComparator);
    let ui = rebelTargets.iterator();
    let entries = new ArrayList();
    entries.add(rebel.getEntryTile());
    while (!navy.isEmpty()) {
      let aiu = navy.removeAt(0);
      let u = aiu.getUnit();
      let enemy = (ui.hasNext()) ? ui.next() : null;
      let start: Tile;
      if (enemy == null) {
        if ((m = this.getWanderHostileMission(aiu)) != null) {
          start = RandomUtils.getRandomMember$Logger$String$List$Random(REFAIPlayer.logger, 'REF patrol entry', entries, aiRandom);
          u.setEntryLocation(start);
          lb.add(['\n  Patrol from ', start, ' with ', m]);
        }
      } else {
        if ((m = this.getSeekAndDestroyMission$AIUnit$Location(aiu, enemy)) != null) {
          start = u.getBestEntryTile(enemy.getTile$());
          u.setEntryLocation(start);
          entries.add(start);
          lb.add(['\n  Suppress ', enemy, ' from ', start, ' with ', m]);
        }
      }
    }
    lb.log(REFAIPlayer.logger, Level.FINE);
    return true;
  }
  /**
   * Require more transport missions, recruiting from the privateering
   * missions.
   *
   * @param nt The number of transport missions required.
   * @param transports The list of {@code AIUnit}s with a transport
   *     mission.
   * @param privateers The list of {@code AIUnit}s with a privateer
   *     mission.
   * @param lb A {@code LogBuilder} to log to.
   * @return A list of new {@code AIUnit}s with transport missions.
   */
  requireTransports(nt: number, transports: List<AIUnit>, privateers: List<AIUnit>, lb: LogBuilder): List<AIUnit> {
    let m: Mission;
    let naval = new ArrayList();
    let result = new ArrayList();
    if (transports.size() < nt) {
      for (const $it5 = privateers.iterator(); $it5.hasNext(); ) {
        let aiu = $it5.next();
        let target = aiu.getMission$().getTarget();
        if (target instanceof Unit && !(target).isDisposed() && target.getTile$() != null && aiu.getUnit().hasTile()) {
          naval.add(aiu);
        } else if ((m = this.getTransportMission(aiu)) != null) {
          lb.add([' notarget ', m]);
          result.add(aiu);
        }
      }
    }
    if (transports.size() < nt) {
      let targetDistance = CollectionUtils.cacheInt((aiu) => {
        let target = aiu.getMission$().getTarget();
        let tile = aiu.getUnit().getTile$();
        return tile.getDistanceTo(target.getTile$());
      });
      for (const $it6 = CollectionUtils.sort$Collection$Comparator(naval, Comparator.comparingInt(targetDistance)).iterator(); $it6.hasNext(); ) {
        let aiu = $it6.next();
        let distance = targetDistance(aiu);
        if ((m = this.getTransportMission(aiu)) != null) {
          lb.add([' REQUIRED ', distance, ' ', m]);
          result.add(aiu);
          if (((result.size() + transports.size()) | 0) >= nt) {
            break;
          }
        }
      }
    }
    privateers.removeAll(result);
    transports.addAll(result);
    return result;
  }
  /**
   * {@inheritDoc}
   */
  determineStance(other: Player): Stance {
    let player = this.getPlayer();
    return (other.getREFPlayer() === player) ? ((other.isRebel()) ? Stance.WAR : Stance.PEACE) : (other.atWarWith(player)) ? Stance.WAR : (!player.getRebels().isEmpty()) ? Stance.PEACE : super.determineStance(other);
  }
  /**
   * {@inheritDoc}
   */
  giveNormalMissions(lb: LogBuilder, aiUnits: List<AIUnit>): void {
    let player = this.getPlayer();
    let idlers = new HashMap();
    let privateers = new ArrayList();
    let transports = new ArrayList();
    let todo = new ArrayList();
    let land = new ArrayList();
    let m: Mission;
    let colony: Colony;
    lb.add(['\n  REF mission changes:']);
    this.targetMap.clear();
    for (const $it7 = this.getAIUnits().iterator(); $it7.hasNext(); ) {
      let aiu = $it7.next();
      let u = aiu.getUnit();
      if (u.isDisposed() || !u.hasAbility$String(Ability.REF_UNIT)) {
        continue;
      }
      let mission = aiu.getMission$();
      if (u.isNaval()) {
        if (mission == null || !mission.isValid()) {
          todo.add(aiu);
        } else if (mission instanceof TransportMission) {
          transports.add(aiu);
        } else if (mission instanceof PrivateerMission) {
          privateers.add(aiu);
          let loc = mission.getTarget();
          if (loc != null) {
            CollectionUtils.incrementMapCount(this.targetMap, loc);
          }
        } else {
          todo.add(aiu);
        }
      } else {
        if (mission == null) {
          land.add(aiu);
        } else if (mission instanceof DefendSettlementMission) {
          if (mission.isValid()) {
            colony = mission.getTarget();
            if (u.isAtLocation(colony) && !colony.isBadlyDefended() && RandomUtils.randomInt(REFAIPlayer.logger, 'REF defend ' + colony.getName(), this.getAIRandom(), 3) === 0) {
              land.add(aiu);
            } else {
              CollectionUtils.incrementMapCount(this.targetMap, mission.getTarget());
            }
          } else {
            land.add(aiu);
          }
        } else if (mission instanceof UnitSeekAndDestroyMission) {
          if (mission.isValid()) {
            CollectionUtils.incrementMapCount(this.targetMap, mission.getTarget());
            continue;
          }
          land.add(aiu);
        } else {
          land.add(aiu);
        }
      }
    }
    for (const $it8 = todo.iterator(); $it8.hasNext(); ) {
      let aiu = $it8.next();
      if ((m = this.getTransportMission(aiu)) != null) {
        lb.add([' ', m]);
        transports.add(aiu);
      }
    }
    todo.clear();
    let nt = Math.max(3, $J.idiv(privateers.size(), 10));
    this.requireTransports(nt, transports, privateers, lb);
    for (const $it9 = land.iterator(); $it9.hasNext(); ) {
      let aiu = $it9.next();
      let target = UnitSeekAndDestroyMission.findMissionTarget(aiu, REFAIPlayer.seekAndDestroyRange, false, false);
      if (target != null) {
        let count = this.targetMap.get(target);
        if (count == null) {
          count = 0;
        }
        if (target instanceof Unit && count < REFAIPlayer.UNIT_USAD_THRESHOLD && (m = this.getSeekAndDestroyMission$AIUnit$Location(aiu, target)) != null) {
          lb.add([' NEW-SEEK-', count, ' ', m]);
          CollectionUtils.incrementMapCount(this.targetMap, target);
          continue;
        } else if (target instanceof Settlement && (m = this.getSeekAndDestroyMission$AIUnit$Location(aiu, target)) != null) {
          lb.add([' NEW-SEEK ', m]);
          CollectionUtils.incrementMapCount(this.targetMap, target);
          continue;
        } else {
          throw new RuntimeException('Bogus target: ' + $J.str(target));
        }
      }
      let u = aiu.getUnit();
      if (u.isInEurope()) {
        CollectionUtils.appendToMapList(idlers, player.getEurope(), aiu);
        continue;
      } else if ((colony = u.getColony()) != null && colony.isConnectedPort()) {
        CollectionUtils.appendToMapList(idlers, colony, aiu);
        continue;
      }
      let best = u.getClosestColony$Stream(CollectionUtils.map$Collection$Function(this.getBadlyDefended(), ($p0) => $p0.getColony()));
      if (best != null && (m = this.getDefendSettlementMission$AIUnit$Settlement(aiu, best)) != null) {
        lb.add([' GO-DEFEND-', best.getName(), ' ', m]);
        CollectionUtils.incrementMapCount(this.targetMap, best);
        continue;
      }
      let path = u.findOurNearestPort();
      colony = (path == null) ? null : path.getLastNode().getTile().getColony();
      if (colony != null && (m = this.getDefendSettlementMission$AIUnit$Settlement(aiu, colony)) != null) {
        lb.add([' GOTO-', colony.getName(), ' ', m]);
        CollectionUtils.incrementMapCount(this.targetMap, colony);
        continue;
      }
      m = this.getIdleAtSettlementMission(aiu);
      lb.add([' ', m]);
    }
    if (!idlers.isEmpty()) {
      this.requireTransports(0, transports, privateers, lb);
      todo.clear();
      let ready = new HashMap();
      for (const $it10 = transports.iterator(); $it10.hasNext(); ) {
        let aiu = $it10.next();
        let tm = aiu.getMission$Class($J.cls(TransportMission));
        if (!tm.isEmpty()) {
          continue;
        }
        let u = aiu.getUnit();
        let key: Location;
        if (u.isInEurope() && idlers.containsKey(key = player.getEurope())) {
          CollectionUtils.appendToMapList(ready, key, aiu);
        } else if ((key = u.getColony()) != null && idlers.containsKey(key)) {
          CollectionUtils.appendToMapList(ready, key, aiu);
        } else {
          todo.add(aiu);
        }
      }
      let idlePorts = new ArrayList();
      let aiCarriers = new ArrayList();
      let space = 0;
      for (const $it11 = idlers.entrySet().iterator(); $it11.hasNext(); ) {
        let e = $it11.next();
        if (e.getValue() == null) {
          continue;
        }
        aiCarriers.clear();
        let key = e.getKey();
        if (!ready.containsKey(key) || ready.get(key).isEmpty()) {
          continue;
        }
        landUnit:
        for (const $it12 = e.getValue().iterator(); $it12.hasNext(); ) {
          let aiu = $it12.next();
          for (const $it13 = ready.get(key).iterator(); $it13.hasNext(); ) {
            let aiCarrier = $it13.next();
            let carrier = aiCarrier.getUnit();
            if (carrier.canAdd(aiu.getUnit()) && aiu.joinTransport(carrier, null)) {
              if (!aiCarriers.contains(aiCarrier)) {
                aiCarriers.add(aiCarrier);
              }
              continue landUnit;
            }
          }
        }
        if (aiCarriers.isEmpty()) {
          continue;
        }
        let found = null;
        let target = null;
        for (const $it14 = aiCarriers.iterator(); $it14.hasNext(); ) {
          let aiCarrier = $it14.next();
          found = CollectionUtils.first$Collection(CollectionUtils.transform$Stream$Predicate$Function$Collector(aiCarrier.getUnit().getUnits(), (u) => u.hasAbility$String(Ability.REF_UNIT), (u) => this.getAIUnit(u), CollectionUtils.toListNoNulls()));
          if (found != null && (m = found.getMission$()) != null && m.isValid() && m instanceof UnitSeekAndDestroyMission && m.getTarget() instanceof Colony) {
            target = m.getTarget();
            break;
          }
        }
        if (target == null) {
          let aiCarrier = this.getAIUnit(found.getUnit().getCarrier());
          let ct = this.findColonyTargets$AIUnit$AIUnit$REFAIPlayer(found, aiCarrier);
          if (!ct.isEmpty()) {
            target = ct.get(0).colony;
          }
        }
        if (target == null) {
          continue;
        }
        for (const $it15 = aiCarriers.iterator(); $it15.hasNext(); ) {
          let aiCarrier = $it15.next();
          let tm = aiCarrier.getMission$Class($J.cls(TransportMission));
          let aiu: AIUnit;
          for (const $it16 = aiCarrier.getUnit().getUnitList().iterator(); $it16.hasNext(); ) {
            let u = $it16.next();
            if (u.hasAbility$String(Ability.REF_UNIT) && (aiu = this.getAIUnit(u)) != null && (m = this.getSeekAndDestroyMission$AIUnit$Location(aiu, target)) != null) {
              lb.add([' IDLER->', target, ' ', m]);
              tm.queueTransportable(aiu, false, lb);
              e.getValue().remove(aiu);
            }
          }
        }
        if (!e.getValue().isEmpty()) {
          idlePorts.add(key);
          space = (space + (CollectionUtils.sum$Collection$ToIntFunction(e.getValue(), (aiu) => aiu.getUnit().getSpaceTaken()))) | 0;
        }
      }
      if (!idlePorts.isEmpty()) {
        for (const $it17 = todo.iterator(); $it17.hasNext(); ) {
          let aiu = $it17.next();
          space = (space - (aiu.getUnit().getCargoCapacity() - aiu.getUnit().getCargoSpaceTaken())) | 0;
        }
        nt = todo.size();
        if (space < 0) {
          nt = (nt + ($J.idiv(-space, 5) + 1)) | 0;
          this.requireTransports(nt, todo, privateers, lb);
        }
        let portUnitComparator = Comparator.comparing((loc) => idlers.get(loc), CollectionUtils.ascendingListLengthComparator);
        idlePorts.sort(portUnitComparator);
        let bad = false;
        while (!bad && !todo.isEmpty()) {
          for (const $it18 = idlePorts.iterator(); $it18.hasNext(); ) {
            let l = $it18.next();
            let bestValue = Unit.MANY_TURNS;
            let best = null;
            for (const $it19 = todo.iterator(); $it19.hasNext(); ) {
              let aiu = $it19.next();
              let value = aiu.getUnit().getTurnsToReach$Location(l);
              if (bestValue > value) {
                bestValue = value;
                best = aiu;
              }
            }
            if (best == null) {
              bad = true;
              continue;
            }
            todo.remove(best);
            best.getMission$().setTarget(l);
            lb.add([' retarget ', best, ' to ', l, '(', idlers.get(l).size(), ')']);
          }
        }
      }
    }
    super.giveNormalMissions(lb, this.getAIUnits());
  }
  /**
   * {@inheritDoc}
   */
  startWorking(): void {
    let player = this.getPlayer();
    if (!player.isWorkForREF()) {
      REFAIPlayer.logger.warning('No work for REF: ' + $J.str(player));
      return;
    }
    super.startWorking();
    let transport = new ArrayList();
    let land = new ArrayList();
    for (const $it20 = this.getAIUnits().iterator(); $it20.hasNext(); ) {
      let aiu = $it20.next();
      let u = aiu.getUnit();
      if (u.isNaval()) {
        if (aiu.hasMission$Class($J.cls(TransportMission))) {
          transport.add(aiu.getMission$Class($J.cls(TransportMission)));
        }
      } else {
        if (u.isInEurope()) {
          land.add(aiu);
        } else if (u.isOnTile()) {
          this.landed = true;
        }
      }
    }
    if (!land.isEmpty() && !transport.isEmpty()) {
      let lb = new LogBuilder()._LogBuilder(256);
      this.allocateTransportables(land, transport, lb);
      lb.log(REFAIPlayer.logger, Level.FINE);
    }
  }
  /**
   * {@inheritDoc}
   */
  adjustMission(aiUnit: AIUnit, path: PathNode, type$: JClass, value: number): number {
    if (value > 0) {
      if (type$ === $J.cls(DefendSettlementMission)) {
        let loc = DefendSettlementMission.extractTarget(aiUnit, path);
        if (loc instanceof Colony && !(loc).isBadlyDefended()) {
          return -2147483648;
        }
      } else if (type$ === $J.cls(UnitSeekAndDestroyMission)) {
        let target = UnitSeekAndDestroyMission.extractTarget(aiUnit, path);
        if (target instanceof Settlement) {
          if ((target).isConnectedPort()) {
            value = (value + 500) | 0;
          } else {
            if (!this.getPlayer().hasSettlements()) {
              return -2147483648;
            }
          }
        } else if (target instanceof Unit) {
          if (!this.getPlayer().hasSettlements()) {
            return -2147483648;
          }
          let unitPred = (m) => m != null && m.getTarget() instanceof Unit && m.getTarget() === target;
          let missionMapper = (aiu) => aiu.getMission$Class($J.cls(UnitSeekAndDestroyMission));
          if (CollectionUtils.any$Collection$Predicate(CollectionUtils.transform$Collection$Predicate$Function(this.getAIUnits(), (aiu) => aiu !== aiUnit, missionMapper), unitPred)) {
            return -2147483648;
          }
          value = $J.idiv(value, 2);
        }
      }
    }
    return value;
  }
  static $clinit() {
    REFAIPlayer.logger = Logger.getLogger($J.cls(REFAIPlayer).getName());
  }
}

/**
 * Goal decider class for the REF Navy
 */
export class REFAIPlayer$REFNavyGoalDecider extends JObject {
  /**
   * The rebel player to attack.
   */
  rebel: Player = null;
  /**
   * A container to fill with target units.
   */
  rebelNavy: JSet<Unit> = null;
  /**
   * Build a new goal decider for the REF to find rebel naval units.
   *
   * @param rebel The {@code Player} to attack.
   * @param rebelNavy A container to fill with the naval units found.
   */
  _REFAIPlayer$REFNavyGoalDecider(rebel: Player, rebelNavy: JSet<Unit>): this {
    this.rebel = rebel;
    this.rebelNavy = rebelNavy;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getGoal(): PathNode {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  hasSubGoals(): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  check(unit: Unit, pathNode: PathNode): boolean {
    let pred = ((u) => u.isOffensiveUnit() && u.isNaval() && !this.rebelNavy.contains(u));
    let tile = pathNode.getTile();
    if (tile != null && !tile.isEmpty() && !tile.isLand() && this.rebel.owns(tile.getFirstUnit())) {
      this.rebelNavy.addAll(CollectionUtils.transform$Stream$Predicate(tile.getUnits(), pred));
      return true;
    }
    return false;
  }
}

/**
 * Container class for REF target colony information.
 */
export class REFAIPlayer$TargetTuple extends JObject {
  colony: Colony = null;
  path: PathNode = null;
  score: number = 0;
  disembarkTile: Tile = null;
  entry: Tile = null;
  _REFAIPlayer$TargetTuple(colony: Colony, path: PathNode, score: number): this {
    this.colony = colony;
    this.path = path;
    this.score = score;
    this.disembarkTile = null;
    this.entry = null;
    if (path != null) {
      for (let p = path; p != null; p = p.next_) {
        let t = p.getTile();
        if (t != null) {
          this.entry = t;
          break;
        }
      }
    }
    return this;
  }
  compareTo(other: REFAIPlayer$TargetTuple): number {
    return $J.dcmp(this.score, other.score);
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (o instanceof REFAIPlayer$TargetTuple) {
      let other = o;
      return this.compareTo(other) === 0 && super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(37, hash) + Utils.hashCode(this.colony)) | 0;
    hash = (Math.imul(37, hash) + Utils.hashCode(this.path)) | 0;
    hash = (Math.imul(37, hash) + Utils.hashCode($J.boxD(this.score))) | 0;
    hash = (Math.imul(37, hash) + Utils.hashCode(this.disembarkTile)) | 0;
    return (Math.imul(37, hash) + Utils.hashCode(this.entry)) | 0;
  }
}

$J.define(REFAIPlayer, 'net.sf.freecol.server.ai.REFAIPlayer', { kind: 'class', sup: 'net.sf.freecol.server.ai.EuropeanAIPlayer', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.io.FreeColXMLReader': '_REFAIPlayer$AIMain$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.model.Player': '_REFAIPlayer$AIMain$Player' }, meths: { 'findColonyTargets(net.sf.freecol.server.ai.AIUnit,net.sf.freecol.server.ai.AIUnit)': 'findColonyTargets$AIUnit$AIUnit$REFAIPlayer', 'findColonyTargets(net.sf.freecol.server.ai.AIUnit,boolean,net.sf.freecol.server.ai.AIUnit)': 'findColonyTargets$AIUnit$boolean$AIUnit$REFAIPlayer' }, clinit: true, lazy: ['logger'] });
$J.define(REFAIPlayer$REFNavyGoalDecider, 'net.sf.freecol.server.ai.REFAIPlayer$REFNavyGoalDecider', { kind: 'class', ifaces: ['net.sf.freecol.common.model.pathfinding.GoalDecider'], sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Player,java.util.Set': '_REFAIPlayer$REFNavyGoalDecider' }, returns: { 'hasSubGoals': 'boolean', 'getGoal': 'net.sf.freecol.common.model.PathNode' } });
$J.define(REFAIPlayer$TargetTuple, 'net.sf.freecol.server.ai.REFAIPlayer$TargetTuple', { kind: 'class', ifaces: ['java.lang.Comparable'], sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Colony,net.sf.freecol.common.model.PathNode,double': '_REFAIPlayer$TargetTuple' }, returns: { 'hashCode': 'int' } });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Settlement = $J.load('net.sf.freecol.common.model.Settlement');
  Stance = $J.load('net.sf.freecol.common.model.Stance');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  CostDeciders = $J.load('net.sf.freecol.common.model.pathfinding.CostDeciders');
  GoalDeciders = $J.load('net.sf.freecol.common.model.pathfinding.GoalDeciders');
  CachingFunction = $J.load('net.sf.freecol.common.util.CachingFunction');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
  DefendSettlementMission = $J.load('net.sf.freecol.server.ai.mission.DefendSettlementMission');
  PrivateerMission = $J.load('net.sf.freecol.server.ai.mission.PrivateerMission');
  TransportMission = $J.load('net.sf.freecol.server.ai.mission.TransportMission');
  UnitSeekAndDestroyMission = $J.load('net.sf.freecol.server.ai.mission.UnitSeekAndDestroyMission');
});
