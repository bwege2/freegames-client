// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/military/DefensiveMap.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collectors, Comparator, HashMap, JObject, Objects, PriorityQueue, StringBuilder } from '../../../../../../../jre/index.ts';

let Stance, CostDeciders, DefensiveZone;

/**
 * A tactical map of the areas the AI should defend.
 *
 * @see #createDefensiveMap(EuropeanAIPlayer)
 */
export class DefensiveMap extends JObject {
  static readonly ZONE_SIZE_TURNS: number = 3;
  defensiveZones: JMap<AIColony, DefensiveZone> = null;
  tileDefensiveZone: JMap<string, DefensiveZone> = null;
  _DefensiveMap(defensiveZones: JMap<AIColony, DefensiveZone>, tileDefensiveZone: JMap<string, DefensiveZone>): this {
    this.defensiveZones = defensiveZones;
    this.tileDefensiveZone = tileDefensiveZone;
    return this;
  }
  /**
   * Returns the defensive zone a tile is considered a part of.
   *
   * @param tile The {@code Tile} to obtain the {@code DefensiveZone} for.
   * @return The {@code DefensiveZone}, or {@code null} if the {@code Tile}
   *      is not part of a defensive zone.
   */
  getDefensiveZone(tile: Tile): DefensiveZone {
    return this.tileDefensiveZone.get(tile.getId());
  }
  /**
   * Returns all the defensive zones.
   */
  getDefensiveZones(): List<DefensiveZone> {
    return new ArrayList(this.defensiveZones.values());
  }
  /**
   * Gets the defensive zones that are considered to be under attack.
   */
  getAttackedDefensiveZones(): List<DefensiveZone> {
    return this.defensiveZones.values().stream().filter((dz) => dz.getNumberOfMilitaryEnemies() > 0).collect(Collectors.toList());
  }
  /**
   * Gets the colonies of defensive zones that are considered to
   * be under attack.
   */
  getAttackedColonies(): List<AIColony> {
    return this.getAttackedDefensiveZones().stream().map(($p0) => $p0.getAiColony()).collect(Collectors.toList());
  }
  /**
   * Returns colonies for defensive zones that are close to potential
   * enemy military units.
   */
  getThreatenedColonies(): List<AIColony> {
    return this.defensiveZones.values().stream().filter((dz) => dz.isEnemiesInNeighbour() || dz.getNumberOfPotentialMilitaryEnemies() > 0).map(($p0) => $p0.getAiColony()).collect(Collectors.toList());
  }
  /**
   * Returns a list of colonies that have land areas not protected by
   * other defensive zones.
   */
  getColoniesExposedLand(): List<AIColony> {
    return this.defensiveZones.values().stream().filter((dz) => dz.isExposedLand()).map(($p0) => $p0.getAiColony()).collect(Collectors.toList());
  }
  /**
   * Returns a list of colonies that have defensive zones adjacent to water.
   */
  getColoniesExposedWater(): List<AIColony> {
    return this.defensiveZones.values().stream().filter((dz) => dz.isExposedWater()).map(($p0) => $p0.getAiColony()).collect(Collectors.toList());
  }
  /**
   * Creates a defensive map for the given AI player.
   *
   * The defensive map is not updated automatically, and need to be
   * recreated if an update is required.
   *
   * @param aiPlayer The player to create the defensive map for.
   * @return A defensive map that contains information about how easy
   *      an area can be defended, and possible threats.
   */
  static createDefensiveMap(aiPlayer: EuropeanAIPlayer): DefensiveMap {
    let colonies = aiPlayer.getAIColonies();
    if (colonies.isEmpty()) {
      return new DefensiveMap()._DefensiveMap(new HashMap(), new HashMap());
    }
    let defensiveZones = new HashMap();
    let tileDefensiveZone = new HashMap();
    let openMapQueue = new PriorityQueue(1024, Comparator.comparingInt(($p0) => $p0.getCost()));
    let openMap = new HashMap();
    let closedMap = new HashMap();
    let movesLeft = 1;
    for (const $it0 = colonies.iterator(); $it0.hasNext(); ) {
      let ac = $it0.next();
      let defensiveZone = new DefensiveZone()._DefensiveZone(ac);
      defensiveZones.put(ac, defensiveZone);
      openMapQueue.add(new DefensiveMap$SearchNode()._DefensiveMap$SearchNode(ac.getColony().getTile$(), null, movesLeft, 0, defensiveZone, 0));
    }
    let costDecider = CostDeciders.numberOfTiles();
    while (!openMapQueue.isEmpty()) {
      let searchNode = openMapQueue.poll();
      closedMap.put(searchNode.getTile().getId(), searchNode);
      tileDefensiveZone.put(searchNode.getTile().getId(), searchNode.defensiveZone);
      if (searchNode.getTile().hasSettlement()) {
        let settlement = searchNode.getTile().getSettlement();
        if (aiPlayer.getPlayer().getStance(settlement.getOwner()) !== Stance.ALLIANCE) {
          searchNode.defensiveZone.addPotentialEnemySettlement(settlement);
        }
      } else {
        let enemyUnits = searchNode.getTile().getUnits().filter((u) => !aiPlayer.getPlayer().equals(u.getOwner()) && aiPlayer.getPlayer().getStance(u.getOwner()) !== Stance.ALLIANCE).collect(Collectors.toSet());
        searchNode.defensiveZone.addAllPotentialEnemies(enemyUnits);
      }
      for (const $it1 = searchNode.getTile().getSurroundingTiles$int(1).iterator(); $it1.hasNext(); ) {
        let tile = $it1.next();
        if (!tile.isLand()) {
          if (searchNode.previous_ != null) {
            searchNode.previous_.defensiveZone.setExposedWater(true);
          }
          continue;
        }
        let closedMatch = closedMap.get(tile.getId());
        if (closedMatch != null) {
          if (searchNode.defensiveZone !== closedMatch.defensiveZone) {
            closedMatch.defensiveZone.addNeighbour(searchNode.defensiveZone);
          }
          continue;
        }
        let cost = costDecider.getCost(null, searchNode.getTile(), tile, searchNode.movesLeft);
        let newSearchNode = new DefensiveMap$SearchNode()._DefensiveMap$SearchNode(tile, searchNode, costDecider.getMovesLeft(), (searchNode.turns + costDecider.getNewTurns()) | 0, searchNode.defensiveZone, (searchNode.getCost() + cost) | 0);
        if (openMap.containsKey(tile.getId())) {
          continue;
        }
        if (newSearchNode.cost > DefensiveMap.ZONE_SIZE_TURNS) {
          searchNode.defensiveZone.setExposedLand(true);
          continue;
        }
        openMapQueue.add(newSearchNode);
        openMap.put(tile.getId(), newSearchNode);
      }
    }
    for (const $it2 = defensiveZones.values().iterator(); $it2.hasNext(); ) {
      let defensiveZone = $it2.next();
      for (const $it3 = defensiveZone.getNeighbours().iterator(); $it3.hasNext(); ) {
        let neighbour = $it3.next();
        if (neighbour.getNumberOfMilitaryEnemies() > 0) {
          defensiveZone.setEnemiesInNeighbour(true);
          break;
        }
      }
    }
    return new DefensiveMap()._DefensiveMap(defensiveZones, tileDefensiveZone);
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder();
    for (const $it4 = this.defensiveZones.entrySet().iterator(); $it4.hasNext(); ) {
      let entry = $it4.next();
      sb.append(entry.getKey().getColony().getName());
      sb.append(': exposedLand=' + entry.getValue().isExposedLand());
      sb.append(': exposedWater=' + entry.getValue().isExposedWater());
      sb.append(' enemies=' + entry.getValue().getNumberOfMilitaryEnemies() + '\n');
    }
    return sb.toString();
  }
}

export class DefensiveMap$SearchNode extends JObject {
  tile: Tile = null;
  previous_: DefensiveMap$SearchNode = null;
  turns: number = 0;
  movesLeft: number = 0;
  defensiveZone: DefensiveZone = null;
  cost: number = 0;
  _DefensiveMap$SearchNode(tile: Tile, previous: DefensiveMap$SearchNode, movesLeft: number, turns: number, defensiveZone: DefensiveZone, cost: number): this {
    this.tile = Objects.requireNonNull(tile);
    this.previous_ = previous;
    this.turns = turns;
    this.movesLeft = movesLeft;
    this.defensiveZone = Objects.requireNonNull(defensiveZone);
    this.cost = cost;
    return this;
  }
  getCost(): number {
    return this.cost;
  }
  getTile(): Tile {
    return this.tile;
  }
}

$J.define(DefensiveMap, 'net.sf.freecol.server.ai.military.DefensiveMap', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.util.Map,java.util.Map': '_DefensiveMap' }, returns: { 'getColoniesExposedWater': 'java.util.List', 'getColoniesExposedLand': 'java.util.List', 'getThreatenedColonies': 'java.util.List', 'getAttackedColonies': 'java.util.List', 'getAttackedDefensiveZones': 'java.util.List', 'getDefensiveZones': 'java.util.List' } });
$J.define(DefensiveMap$SearchNode, 'net.sf.freecol.server.ai.military.DefensiveMap$SearchNode', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Tile,net.sf.freecol.server.ai.military.DefensiveMap$SearchNode,int,int,net.sf.freecol.server.ai.military.DefensiveZone,int': '_DefensiveMap$SearchNode' }, returns: { 'getTile': 'net.sf.freecol.common.model.Tile', 'getCost': 'int' } });
$J.module(() => {
  Stance = $J.load('net.sf.freecol.common.model.Stance');
  CostDeciders = $J.load('net.sf.freecol.common.model.pathfinding.CostDeciders');
  DefensiveZone = $J.load('net.sf.freecol.server.ai.military.DefensiveZone');
});
