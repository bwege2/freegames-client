// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/military/MilitaryCoordinator.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, Collectors, HashMap, HashSet, IdentityHashMap, JObject } from '../../../../../../../jre/index.ts';

let Ability, DefensiveMap, DefendSettlementMission, EscortUnitMission, UnitSeekAndDestroyMission, UnitWanderHostileMission;

/**
 * Provides missions for all military (land) units.
 */
export class MilitaryCoordinator extends JObject {
  player: EuropeanAIPlayer = null;
  unusedUnits: JSet<AIUnit> = null;
  ourColonies: List<AIColony> = null;
  defenders: JMap<AIColony, List<AIUnit>> = null;
  defensiveMap: DefensiveMap = null;
  targetedEnemies: JSet<Unit> = null;
  targetedEnemySettlements: JMap<Settlement, List<AIUnit>> = null;
  turnsToReachCache: JMap<string, number> = null;
  /**
   * Creates a new military coordinator for the given military units.
   *
   * Please note that a new instance needs to be created every time the map has
   * changed (for example, by executing other missions).
   *  
   * @param player The player owning the units to be coordinated.
   * @param militaryUnits The units to be managed by this instance.
   */
  _MilitaryCoordinator(player: EuropeanAIPlayer, militaryUnits: JSet<AIUnit>): this {
    this.targetedEnemies = Collections.newSetFromMap(new IdentityHashMap());
    this.targetedEnemySettlements = new HashMap();
    this.turnsToReachCache = new HashMap();
    // assert player != null
    // assert militaryUnits.stream().noneMatch((au)->au.getOwner() != player.getPlayer())
    this.player = player;
    this.unusedUnits = MilitaryCoordinator.identitySet(militaryUnits.stream().filter((u) => !u.getUnit().isInEurope() || !u.hasMission$()).collect(Collectors.toList()));
    this.ourColonies = this.getOurColoniesSortedByValue();
    this.defenders = new HashMap();
    for (const $it0 = this.ourColonies.iterator(); $it0.hasNext(); ) {
      let colony = $it0.next();
      this.defenders.put(colony, new ArrayList());
    }
    this.defensiveMap = DefensiveMap.createDefensiveMap(player);
    return this;
  }
  /**
   * Determines the missions for the units this coordinator controls.
   */
  determineMissions(): void {
    let artilleryUnits = MilitaryCoordinator.identitySet(MilitaryCoordinator.onlyArtillery(this.unusedUnits));
    let dragoonUnits = MilitaryCoordinator.identitySet(MilitaryCoordinator.onlyDragoons(this.unusedUnits));
    let otherMilitaryUnits = MilitaryCoordinator.identitySet(MilitaryCoordinator.neitherArtilleryNorDragoons(this.unusedUnits));
    this.keepUnitsInColonies(this.defensiveMap.getAttackedColonies(), artilleryUnits, MilitaryCoordinator.always());
    this.keepUnitsInColonies(this.defensiveMap.getAttackedColonies(), dragoonUnits, MilitaryCoordinator.maxDefenders(1));
    if (this.player.isAggressive()) {
      let importantWaterColonies = this.defensiveMap.getColoniesExposedWater().stream().filter((ac) => ac.getColony().getUnitCount() > 3).collect(Collectors.toList());
      this.keepUnitsInColonies(importantWaterColonies, artilleryUnits, MilitaryCoordinator.maxArtilleries(1));
      this.placeUnitsInColonies(importantWaterColonies, artilleryUnits, MilitaryCoordinator.maxArtilleries(1));
      this.placeUnitsInColonies(this.defensiveMap.getAttackedColonies(), dragoonUnits, MilitaryCoordinator.maxDefenders(1));
      this.placeUnitsInColonies(this.defensiveMap.getAttackedColonies(), dragoonUnits, MilitaryCoordinator.maxDefenders(1));
      this.keepUnitsInColonies(this.defensiveMap.getThreatenedColonies(), dragoonUnits, MilitaryCoordinator.maxDefenders(1));
      this.placeUnitsInColonies(this.defensiveMap.getThreatenedColonies(), dragoonUnits, MilitaryCoordinator.maxDefenders(1));
      this.keepUnitsInColonies(this.defensiveMap.getColoniesExposedWater(), dragoonUnits, MilitaryCoordinator.maxDefenders(1));
      this.placeUnitsInColonies(this.defensiveMap.getColoniesExposedWater(), dragoonUnits, MilitaryCoordinator.maxDefenders(1));
      this.keepUnitsInColonies(this.defensiveMap.getColoniesExposedLand(), dragoonUnits, MilitaryCoordinator.maxDefenders(1));
      this.placeUnitsInColonies(this.defensiveMap.getColoniesExposedLand(), dragoonUnits, MilitaryCoordinator.maxDefenders(1));
      this.keepUnitsInColonies(this.ourColonies, otherMilitaryUnits, MilitaryCoordinator.always());
    } else {
      this.keepUnitsInColonies(this.ourColonies, artilleryUnits, MilitaryCoordinator.maxDefenders(1));
      this.placeUnitsInColonies(this.ourColonies, artilleryUnits, MilitaryCoordinator.maxDefenders(1));
      this.keepUnitsInColonies(this.ourColonies, dragoonUnits, MilitaryCoordinator.maxDefenders(1));
      this.placeUnitsInColonies(this.ourColonies, dragoonUnits, MilitaryCoordinator.maxDefenders(1));
      this.keepUnitsInColonies(this.ourColonies, otherMilitaryUnits, MilitaryCoordinator.always());
      this.keepUnitsInColonies(this.defensiveMap.getThreatenedColonies(), artilleryUnits, MilitaryCoordinator.maxArtilleries(3));
      this.keepUnitsInColonies(this.defensiveMap.getColoniesExposedWater(), artilleryUnits, MilitaryCoordinator.maxArtilleries(2));
      this.placeUnitsInColonies(this.defensiveMap.getThreatenedColonies(), artilleryUnits, MilitaryCoordinator.maxArtilleries(2));
    }
    this.counterattackEnemyValuableUnitsReachableInTurns(dragoonUnits, 0);
    this.counterattackEnemyValuableUnitsReachableInTurns(dragoonUnits, 1);
    this.counterattackAllEnemyUnitsReachableInTurns(dragoonUnits, 1);
    this.counterattackAllEnemyUnitsReachableInTurns(dragoonUnits, 2);
    this.attackEnemySettlements(artilleryUnits, dragoonUnits);
    this.keepUnitsInColonies(this.defensiveMap.getAttackedColonies(), dragoonUnits, MilitaryCoordinator.always());
    this.keepUnitsInColonies(this.defensiveMap.getThreatenedColonies(), artilleryUnits, MilitaryCoordinator.always());
    if (this.player.isAggressive()) {
      this.placeUnitsInColonies(this.defensiveMap.getColoniesExposedWater(), artilleryUnits, MilitaryCoordinator.maxArtilleries(1));
    }
    this.placeUnitsInColonies(this.defensiveMap.getColoniesExposedWater(), artilleryUnits, MilitaryCoordinator.maxArtilleries(2));
    this.keepUnitsInColonies(this.defensiveMap.getThreatenedColonies(), dragoonUnits, MilitaryCoordinator.always());
    this.keepUnitsInColonies(this.defensiveMap.getColoniesExposedLand(), artilleryUnits, MilitaryCoordinator.maxArtilleries(2));
    this.placeUnitsInColonies(this.defensiveMap.getColoniesExposedLand(), dragoonUnits, MilitaryCoordinator.maxDragoons(2));
    this.assignDefendClosestColony(this.unusedUnits);
    if (!this.ourColonies.isEmpty()) {
      this.transportMilitaryUnitsFromEurope(this.ourColonies.get(0), this.unusedUnits);
    }
    this.assignWanderHostile();
  }
  attackEnemySettlements(artilleryUnits: JSet<AIUnit>, dragoonUnits: JSet<AIUnit>): void {
    for (const $it1 = new HashSet(artilleryUnits).iterator(); $it1.hasNext(); ) {
      let artillery = $it1.next();
      if (dragoonUnits.isEmpty()) {
        continue;
      }
      if (artillery.getUnit().getTile$() == null) {
        continue;
      }
      let possibleTarget = UnitSeekAndDestroyMission.findMissionTarget(artillery, 10, true, !this.player.isLikesAttackingNatives());
      if (possibleTarget == null) {
        continue;
      }
      let settlementAttackers = this.targetedEnemySettlements.get(possibleTarget);
      if (settlementAttackers == null) {
        settlementAttackers = new ArrayList();
        this.targetedEnemySettlements.put(possibleTarget, settlementAttackers);
      }
      if (settlementAttackers.size() > possibleTarget.getUnitCount()) {
        continue;
      }
      let escortTargetTile = artillery.getUnit().getTile$();
      let escort = dragoonUnits.stream().sorted((a, b) => $J.icmp(this.getTurnsToReach(a.getUnit(), escortTargetTile), this.getTurnsToReach(b.getUnit(), escortTargetTile))).findFirst().orElse(null);
      if (escort == null || this.getTurnsToReach(escort.getUnit(), escortTargetTile) > 8) {
        continue;
      }
      artillery.changeMission(new UnitSeekAndDestroyMission()._UnitSeekAndDestroyMission$AIMain$AIUnit$Location(artillery.getAIMain(), artillery, possibleTarget));
      artilleryUnits.remove(artillery);
      this.unusedUnits.remove(artillery);
      escort.changeMission(new EscortUnitMission()._EscortUnitMission$AIMain$AIUnit$Unit(escort.getAIMain(), escort, artillery.getUnit()));
      dragoonUnits.remove(escort);
      this.unusedUnits.remove(escort);
      settlementAttackers.add(artillery);
    }
  }
  getTurnsToReach(unit: Unit, location: Location): number {
    let key = unit.getId() + ',' + location.getId();
    let cachedResult = this.turnsToReachCache.get(key);
    if (cachedResult != null) {
      return cachedResult;
    }
    let result = unit.getTurnsToReach$Location(location);
    this.turnsToReachCache.put(key, result);
    return result;
  }
  counterattackEnemyValuableUnitsReachableInTurns(dragoonUnits: JSet<AIUnit>, turns: number): void {
    for (const $it2 = this.defensiveMap.getDefensiveZones().iterator(); $it2.hasNext(); ) {
      let defensiveZone = $it2.next();
      let unprotectedUnarmedSoldiers = MilitaryCoordinator.identitySet(MilitaryCoordinator.onlyUnprotectedUnarmedSoldierUnits(defensiveZone.getEnemies()));
      let enemyArtillery = MilitaryCoordinator.identitySet(MilitaryCoordinator.onlyArtilleryUnits(defensiveZone.getEnemies()));
      for (const $it3 = unprotectedUnarmedSoldiers.iterator(); $it3.hasNext(); ) {
        let enemy = $it3.next();
        for (const $it4 = new HashSet(dragoonUnits).iterator(); $it4.hasNext(); ) {
          let dragoon = $it4.next();
          if (dragoon.getUnit().getTile$() == null) {
            continue;
          }
          if (dragoon.getUnit().getTile$().getContiguity() !== enemy.getTile$().getContiguity()) {
            continue;
          }
          let path = dragoon.getUnit().findPath$Location(enemy.getTile$());
          if (path != null && path.getTurns() <= turns) {
            dragoon.changeMission(new UnitSeekAndDestroyMission()._UnitSeekAndDestroyMission$AIMain$AIUnit$Location(dragoon.getAIMain(), dragoon, enemy));
            this.unusedUnits.remove(dragoon);
            dragoonUnits.remove(dragoon);
            this.targetedEnemies.add(enemy);
            break;
          }
        }
      }
      for (let i = 0; i < 2; i++) {
        for (const $it5 = enemyArtillery.iterator(); $it5.hasNext(); ) {
          let enemy = $it5.next();
          for (const $it6 = new HashSet(dragoonUnits).iterator(); $it6.hasNext(); ) {
            let dragoon = $it6.next();
            if (dragoon.getUnit().getTile$() == null) {
              continue;
            }
            if (dragoon.getUnit().getTile$().getContiguity() !== enemy.getTile$().getContiguity()) {
              continue;
            }
            let path = dragoon.getUnit().findPath$Location(enemy.getTile$());
            if (path != null && path.getTurns() <= turns) {
              dragoon.changeMission(new UnitSeekAndDestroyMission()._UnitSeekAndDestroyMission$AIMain$AIUnit$Location(dragoon.getAIMain(), dragoon, enemy));
              this.unusedUnits.remove(dragoon);
              dragoonUnits.remove(dragoon);
              this.targetedEnemies.add(enemy);
              break;
            }
          }
        }
      }
    }
  }
  counterattackAllEnemyUnitsReachableInTurns(dragoonUnits: JSet<AIUnit>, turns: number): void {
    for (const $it7 = this.defensiveMap.getDefensiveZones().iterator(); $it7.hasNext(); ) {
      let defensiveZone = $it7.next();
      for (const $it8 = defensiveZone.getEnemies().iterator(); $it8.hasNext(); ) {
        let enemy = $it8.next();
        if (this.targetedEnemies.contains(enemy)) {
          continue;
        }
        for (const $it9 = new HashSet(dragoonUnits).iterator(); $it9.hasNext(); ) {
          let dragoon = $it9.next();
          if (dragoon.getUnit().getTile$() == null) {
            continue;
          }
          if (dragoon.getUnit().getTile$().getContiguity() !== enemy.getTile$().getContiguity()) {
            continue;
          }
          let path = dragoon.getUnit().findPath$Location(enemy.getTile$());
          if (path != null && path.getTurns() <= turns) {
            dragoon.changeMission(new UnitSeekAndDestroyMission()._UnitSeekAndDestroyMission$AIMain$AIUnit$Location(dragoon.getAIMain(), dragoon, enemy));
            this.unusedUnits.remove(dragoon);
            dragoonUnits.remove(dragoon);
            this.targetedEnemies.add(enemy);
            break;
          }
        }
      }
    }
  }
  assignDefendClosestColony(militaryUnits: JSet<AIUnit>): void {
    for (const $it10 = new HashSet(this.unusedUnits).iterator(); $it10.hasNext(); ) {
      let unit = $it10.next();
      let mission = this.player.getDefendSettlementMission$AIUnit$boolean$boolean(unit, true, true);
      if (mission != null) {
        unit.changeMission(mission);
        this.unusedUnits.remove(unit);
      }
    }
  }
  transportMilitaryUnitsFromEurope(destination: AIColony, militaryUnits: JSet<AIUnit>): void {
    for (const $it11 = new HashSet(this.unusedUnits).iterator(); $it11.hasNext(); ) {
      let unit = $it11.next();
      if (unit.getUnit().getTile$() != null) {
        continue;
      }
      unit.changeMission(new DefendSettlementMission()._DefendSettlementMission$AIMain$AIUnit$Settlement(unit.getAIMain(), unit, destination.getColony()));
      this.unusedUnits.remove(unit);
    }
  }
  placeUnit(aiColonies: List<AIColony>, units: JSet<AIUnit>, checkIfDefenderShouldBeAdded: JFunction<List<AIUnit>, boolean>, onlySameTile: boolean): void {
    for (const $it12 = aiColonies.iterator(); $it12.hasNext(); ) {
      let colony = $it12.next();
      if (!checkIfDefenderShouldBeAdded(this.defenders.get(colony))) {
        continue;
      }
      let unit: AIUnit;
      if (onlySameTile) {
        unit = MilitaryCoordinator.findUnitInColony(colony, units);
      } else {
        unit = this.findUnitClosestToColony(colony, units);
      }
      if (unit == null) {
        break;
      }
      this.placeDefender(unit, colony);
      units.remove(unit);
    }
  }
  keepUnitsInColonies(aiColonies: List<AIColony>, units: JSet<AIUnit>, checkIfDefenderShouldBeAdded: JFunction<List<AIUnit>, boolean>): void {
    this.placeUnit(aiColonies, units, checkIfDefenderShouldBeAdded, true);
  }
  placeUnitsInColonies(aiColonies: List<AIColony>, units: JSet<AIUnit>, checkIfDefenderShouldBeAdded: JFunction<List<AIUnit>, boolean>): void {
    this.placeUnit(aiColonies, units, checkIfDefenderShouldBeAdded, false);
  }
  assignWanderHostile(): void {
    for (const $it13 = new HashSet(this.unusedUnits).iterator(); $it13.hasNext(); ) {
      let unit = $it13.next();
      unit.changeMission(new UnitWanderHostileMission()._UnitWanderHostileMission$AIMain$AIUnit(unit.getAIMain(), unit));
      this.unusedUnits.remove(unit);
    }
    // assert unusedUnits.isEmpty()
  }
  placeDefender(unit: AIUnit, colony: AIColony): void {
    unit.changeMission(new DefendSettlementMission()._DefendSettlementMission$AIMain$AIUnit$Settlement(unit.getAIMain(), unit, colony.getColony()));
    let units = this.defenders.get(colony);
    units.add(unit);
    this.unusedUnits.remove(unit);
  }
  findUnitClosestToColony(colony: AIColony, units: JSet<AIUnit>): AIUnit {
    for (const $it14 = units.iterator(); $it14.hasNext(); ) {
      let au = $it14.next();
      if (au.getMission$() instanceof DefendSettlementMission && au.getMission$().getTarget() === colony.getColony()) {
        return au;
      }
    }
    return units.stream().sorted((a, b) => $J.icmp(this.getTurnsToReach(a.getUnit(), colony.getColony().getTile$()), this.getTurnsToReach(b.getUnit(), colony.getColony().getTile$()))).findFirst().orElse(null);
  }
  static findUnitInColony(ac: AIColony, units: JSet<AIUnit>): AIUnit {
    return units.stream().filter((au) => au.getUnit().getTile$() != null && au.getUnit().getTile$().equals(ac.getColony().getTile$())).findAny().orElse(null);
  }
  static onlyArtillery(militaryUnits: JSet<AIUnit>): JSet<AIUnit> {
    return militaryUnits.stream().filter((au) => MilitaryCoordinator.isArtillery(au.getUnit())).collect(Collectors.toSet());
  }
  static onlyArtilleryUnits(militaryUnits: JSet<Unit>): JSet<Unit> {
    return militaryUnits.stream().filter((u) => MilitaryCoordinator.isArtillery(u)).collect(Collectors.toSet());
  }
  static isArtillery(unit: Unit): boolean {
    return unit.hasAbility$String(Ability.BOMBARD);
  }
  static onlyUnprotectedUnarmedSoldierUnits(militaryUnits: JSet<Unit>): JSet<Unit> {
    return militaryUnits.stream().filter((u) => !u.isArmed() && u.getSortedMilitaryRoles().stream().anyMatch((r) => r.getExpertUnit() === u.getType())).filter((u) => militaryUnits.stream().noneMatch((guard) => guard.getTile$() === u.getTile$() && guard.isOffensiveUnit())).collect(Collectors.toSet());
  }
  static onlyDragoons(militaryUnits: JSet<AIUnit>): JSet<AIUnit> {
    return militaryUnits.stream().filter((au) => MilitaryCoordinator.isDragoon(au.getUnit())).collect(Collectors.toSet());
  }
  static isDragoon(unit: Unit): boolean {
    return unit.isMounted();
  }
  static neitherArtilleryNorDragoons(militaryUnits: JSet<AIUnit>): JSet<AIUnit> {
    return militaryUnits.stream().filter((au) => !au.getUnit().hasAbility$String(Ability.BOMBARD) && !au.getUnit().isMounted()).collect(Collectors.toSet());
  }
  getOurColoniesSortedByValue(): List<AIColony> {
    let ourColonies = this.player.getAIColonies();
    Collections.sort(ourColonies, (a, b) => {
      return $J.icmp(b.getColony().getUnitCount(), a.getColony().getUnitCount());
    });
    return ourColonies;
  }
  static identitySet<T>(collection: Collection<T>): JSet<T> {
    let result = Collections.newSetFromMap(new IdentityHashMap());
    result.addAll(collection);
    return result;
  }
  static maxDefenders(count: number): JFunction<List<AIUnit>, boolean> {
    return (units) => units.size() < count;
  }
  static maxArtilleries(count: number): JFunction<List<AIUnit>, boolean> {
    return (units) => units.stream().filter((au) => MilitaryCoordinator.isArtillery(au.getUnit())).count() < count;
  }
  static maxDragoons(count: number): JFunction<List<AIUnit>, boolean> {
    return (units) => units.stream().filter((au) => MilitaryCoordinator.isDragoon(au.getUnit())).count() < count;
  }
  static always(): JFunction<List<AIUnit>, boolean> {
    return (units) => true;
  }
  static isUnitHandledByMilitaryCoordinator(): Predicate<any> {
    return (u) => !u.getUnit().isNaval() && u.getUnit().isOffensiveUnit() && !u.getUnit().hasAbility$String(Ability.SPEAK_WITH_CHIEF);
  }
}

$J.define(MilitaryCoordinator, 'net.sf.freecol.server.ai.military.MilitaryCoordinator', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.server.ai.EuropeanAIPlayer,java.util.Set': '_MilitaryCoordinator' }, returns: { 'getOurColoniesSortedByValue': 'java.util.List' } });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  DefensiveMap = $J.load('net.sf.freecol.server.ai.military.DefensiveMap');
  DefendSettlementMission = $J.load('net.sf.freecol.server.ai.mission.DefendSettlementMission');
  EscortUnitMission = $J.load('net.sf.freecol.server.ai.mission.EscortUnitMission');
  UnitSeekAndDestroyMission = $J.load('net.sf.freecol.server.ai.mission.UnitSeekAndDestroyMission');
  UnitWanderHostileMission = $J.load('net.sf.freecol.server.ai.mission.UnitWanderHostileMission');
});
