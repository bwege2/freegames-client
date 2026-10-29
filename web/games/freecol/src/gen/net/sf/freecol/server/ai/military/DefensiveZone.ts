// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/military/DefensiveZone.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Collectors, HashSet, JObject, Objects } from '../../../../../../../jre/index.ts';

let IndianSettlement;

/**
 * Represents the area around a colony that should be defended.
 */
export class DefensiveZone extends JObject {
  aiColony: AIColony = null;
  potentialEnemies: JSet<Unit> = null;
  potentialEnemySettlements: JSet<Settlement> = null;
  exposedLand: boolean = false;
  exposedWater: boolean = false;
  neighbours: JSet<DefensiveZone> = null;
  enemiesInNeighbour: boolean = false;
  _DefensiveZone(aiColony: AIColony): this {
    this.potentialEnemies = new HashSet();
    this.potentialEnemySettlements = new HashSet();
    this.exposedLand = false;
    this.exposedWater = false;
    this.neighbours = new HashSet();
    this.enemiesInNeighbour = false;
    this.aiColony = aiColony;
    return this;
  }
  getAiColony(): AIColony {
    return this.aiColony;
  }
  setExposedWater(exposedWater: boolean): void {
    this.exposedWater = exposedWater;
  }
  setExposedLand(exposedLand: boolean): void {
    this.exposedLand = exposedLand;
  }
  setEnemiesInNeighbour(enemiesInNeighbour: boolean): void {
    this.enemiesInNeighbour = enemiesInNeighbour;
  }
  addAllPotentialEnemies(units: JSet<Unit>): void {
    this.potentialEnemies.addAll(units);
  }
  addPotentialEnemySettlement(settlement: Settlement): void {
    this.potentialEnemySettlements.add(settlement);
  }
  addNeighbour(defensiveZone: DefensiveZone): void {
    this.neighbours.add(defensiveZone);
  }
  isExposed(): boolean {
    return this.exposedLand || this.exposedWater;
  }
  isExposedWater(): boolean {
    return this.exposedWater;
  }
  isExposedLand(): boolean {
    return this.exposedLand;
  }
  isEnemiesInNeighbour(): boolean {
    return this.enemiesInNeighbour;
  }
  getEnemies(): JSet<Unit> {
    return this.potentialEnemies.stream().filter(this.enemiesOnly()).collect(Collectors.toSet());
  }
  getNumberOfMilitaryEnemies(): number {
    let unitEnemies = (this.potentialEnemies.stream().filter(this.enemiesOnly()).filter((u) => u.isOffensiveUnit()).filter((u) => !u.getOwner().isIndian()).count()) | 0;
    let settlementEnemies = (this.potentialEnemySettlements.stream().filter(this.enemiesOnly()).filter((s) => !(s instanceof IndianSettlement)).count()) | 0;
    return (unitEnemies + settlementEnemies) | 0;
  }
  getNumberOfPotentialMilitaryEnemies(): number {
    let unitEnemies = (this.potentialEnemies.stream().filter((u) => u.isOffensiveUnit()).filter((u) => !u.getOwner().isIndian()).count()) | 0;
    let settlementEnemies = (this.potentialEnemySettlements.stream().filter((s) => !(s instanceof IndianSettlement)).count()) | 0;
    return (unitEnemies + settlementEnemies) | 0;
  }
  getPlayer(): Player {
    return this.aiColony.getColony().getOwner();
  }
  /**
   * Gets adjacent defensive zones. The defensive zones are only considered
   * to be adjacent if they are connected by land.
   */
  getNeighbours(): JSet<DefensiveZone> {
    return this.neighbours;
  }
  enemiesOnly(): Predicate<any> {
    return (u) => this.getPlayer().atWarWith(u.getOwner());
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    return Objects.hash(this.aiColony);
  }
  /**
   * {@inheritDoc}
   */
  equals(obj: any): boolean {
    if (this === obj) {
      return true;
    }
    if (obj == null) {
      return false;
    }
    if ($J.getClass(this) !== $J.getClass(obj)) {
      return false;
    }
    let other = obj;
    return Objects.equals(this.aiColony, other.aiColony);
  }
}

$J.define(DefensiveZone, 'net.sf.freecol.server.ai.military.DefensiveZone', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.server.ai.AIColony': '_DefensiveZone' }, returns: { 'hashCode': 'int', 'getNeighbours': 'java.util.Set', 'getPlayer': 'net.sf.freecol.common.model.Player', 'getNumberOfPotentialMilitaryEnemies': 'int', 'getNumberOfMilitaryEnemies': 'int', 'getEnemies': 'java.util.Set', 'isEnemiesInNeighbour': 'boolean', 'isExposedLand': 'boolean', 'isExposedWater': 'boolean', 'isExposed': 'boolean', 'getAiColony': 'net.sf.freecol.server.ai.AIColony' } });
$J.module(() => {
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
});
