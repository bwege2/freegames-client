// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/MissionAIPlayer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Exception, JString, Level, Logger } from '../../../../../../jre/index.ts';
import { AIPlayer } from './AIPlayer.ts';

let FreeColObject, Tension$Level, WorkLocation, CollectionUtils, StringUtils, AIUnit, DefendSettlementMission, IdleAtSettlementMission, Mission, UnitSeekAndDestroyMission, UnitWanderHostileMission;

/**
 * An AIPlayer with support for executing {@code Mission}s.
 *
 * The method {@link #startWorking} gets called by the
 * {@link AIInGameInputHandler} when it is this player's turn.
 */
export class MissionAIPlayer extends AIPlayer {
  static logger: Logger = null;
  /**
   * A comparator to sort AI units by location.
   */
  static aiUnitLocationComparator: Comparator<AIUnit> = null;
  /**
   * Temporary variable, used to hold all AIUnit objects belonging
   * to this AI.  Any implementation of AIPlayer needs to make sure
   * this list is invalidated as necessary, using clearAIUnits().
   */
  aiUnits: List<AIUnit> = null;
  $init_MissionAIPlayer() {
    this.aiUnits = new ArrayList();
  }
  /**
   * Creates a new AI player.
   *
   * @param aiMain The {@code AIMain} the player exists within.
   * @param player The {@code Player} to associate this AI player with.
   */
  _MissionAIPlayer$AIMain$Player(aiMain: AIMain, player: Player): this {
    this._AIPlayer$AIMain$Player(aiMain, player);
    this.$init_MissionAIPlayer();
    return this;
  }
  /**
   * Creates a new {@code AIPlayer} from the given
   * XML-representation.
   *
   * @param aiMain The main AI-object.
   * @param xr The input stream containing the XML.
   * @exception XMLStreamException if a problem was encountered
   *     during parsing.
   */
  _MissionAIPlayer$AIMain$FreeColXMLReader(aiMain: AIMain, xr: FreeColXMLReader): this {
    this._AIPlayer$AIMain$FreeColXMLReader(aiMain, xr);
    this.$init_MissionAIPlayer();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  removeAIObject(ao: AIObject): void {
    if (ao instanceof AIUnit) {
      this.removeAIUnit(ao);
    } else {
      super.removeAIObject(ao);
    }
  }
  /**
   * Clears the cache of AI units.
   */
  clearAIUnits(): void {
    this.aiUnits.clear();
  }
  /**
   * Add an AI unit owned by this player.
   *
   * @param aiUnit The {@code AIUnit} to add.
   */
  addAIUnit(aiUnit: AIUnit): void {
    this.aiUnits.add(aiUnit);
  }
  /**
   * Remove an AI unit.
   *
   * @param aiu The {@code AIUnit} to remove.
   */
  removeAIUnit(aiu: AIUnit): void {
    aiu.dropTransport();
    aiu.changeMission(null);
    this.aiUnits.remove(aiu);
  }
  /**
   * Gets a list of AIUnits for the player.
   *
   * @return A list of AIUnits.
   */
  getAIUnits(): List<AIUnit> {
    if (this.aiUnits.isEmpty()) {
      this.aiUnits = super.getAIUnits();
    }
    return new ArrayList(this.aiUnits);
  }
  /**
   * Counts the number of defenders allocated to a settlement.
   *
   * @param settlement The {@code Settlement} to examine.
   * @return The number of defenders.
   */
  getSettlementDefenders(settlement: Settlement): number {
    let defenders = 0;
    for (const $it0 = this.getAIUnits().iterator(); $it0.hasNext(); ) {
      let au = $it0.next();
      let dm = au.getMission$Class($J.cls(DefendSettlementMission));
      if (dm != null && dm.getTarget() === settlement && au.getUnit().getSettlement() === settlement) {
        defenders++;
      }
    }
    return defenders;
  }
  /**
   * Find out if a tile contains a suitable target for seek-and-destroy.
   *
   * FIXME: Package for access by a test only - necessary?
   *
   * @param attacker The attacking {@code Unit}.
   * @param tile The {@code Tile} to attack into.
   * @return True if an attack can be launched.
   */
  isTargetValidForSeekAndDestroy(attacker: Unit, tile: Tile): boolean {
    if (attacker == null) {
      return false;
    }
    let attackerPlayer = attacker.getOwner();
    let settlement = tile.getSettlement();
    let defender = tile.getDefendingUnit(attacker);
    let defenderPlayer = (settlement != null) ? settlement.getOwner() : (defender != null) ? defender.getOwner() : null;
    if (defenderPlayer == null) {
      return false;
    }
    if (attackerPlayer === defenderPlayer) {
      return false;
    }
    let atWar = attackerPlayer.atWarWith(defenderPlayer);
    if (attackerPlayer.isEuropean()) {
      if (!atWar) {
        return false;
      }
    } else if (attackerPlayer.isIndian()) {
      if (!atWar && attackerPlayer.getTension$Player(defenderPlayer).getLevel().compareTo(Tension$Level.CONTENT) <= 0) {
        return false;
      }
    }
    return attacker.canAttack(defender);
  }
  /**
   * Log the missions of this player.
   *
   * @param reasons A map of reasons for the current mission by unit.
   * @param lb A {@code LogBuilder} to log to.
   */
  logMissions(reasons: JMap<Unit, string>, lb: LogBuilder): void {
    let units = this.getAIUnits();
    for (const $it1 = CollectionUtils.sort$Collection$Comparator(units, MissionAIPlayer.aiUnitLocationComparator).iterator(); $it1.hasNext(); ) {
      let aiu = $it1.next();
      let u = aiu.getUnit();
      let reason = reasons.get(u);
      if (reason == null) {
        reason = 'OMITTED';
      }
      let ms = 'NONE';
      let target = null;
      if (aiu.hasMission$()) {
        let m = aiu.getMission$();
        ms = StringUtils.lastPart(m.getClass().toString(), '.');
        ms = ms.substring(0, (ms.length - 'Mission'.length) | 0);
        target = m.getTarget();
      }
      lb.add(['\n  @', JString.format('%-30s%-10s%-40s%-16s', StringUtils.chop(u.getLocation().toShortString(), 30), StringUtils.chop(reason, 10), StringUtils.chop(u.toShortString(), 40), StringUtils.chop(ms, 16))]);
      if (target != null) {
        lb.add(['->', target]);
      }
    }
  }
  /**
   * Get a DefendSettlementMission for the current settlement of a
   * unit if it is badly defended.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A new misison, or null if impossible or not worthwhile.
   */
  getDefendCurrentSettlementMission(aiUnit: AIUnit): Mission {
    if (DefendSettlementMission.invalidMissionReason$AIUnit(aiUnit) != null) {
      return null;
    }
    let unit = aiUnit.getUnit();
    let loc = unit.getLocation();
    let settlement = (loc == null) ? null : loc.getSettlement();
    return (settlement != null && settlement.isBadlyDefended()) ? this.getDefendSettlementMission$AIUnit$Settlement(aiUnit, settlement) : null;
  }
  /**
   * Gets a new DefendSettlementMission for a unit.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param target The {@code Settlement} to defend.
   * @return A new mission, or null if impossible.
   */
  getDefendSettlementMission$AIUnit$Settlement(aiUnit: AIUnit, target: Settlement): Mission {
    return (DefendSettlementMission.invalidMissionReason$AIUnit(aiUnit) != null) ? null : new DefendSettlementMission()._DefendSettlementMission$AIMain$AIUnit$Settlement(this.getAIMain(), aiUnit, target);
  }
  /**
   * Gets a new IdleAtSettlementMission for a unit.
   *
   * @param aiUnit The {@code AIUnit} to use.
   * @return A new mission, or null if impossible.
   */
  getIdleAtSettlementMission(aiUnit: AIUnit): Mission {
    return (Mission.invalidMissionReason$AIUnit(aiUnit) != null) ? null : new IdleAtSettlementMission()._IdleAtSettlementMission$AIMain$AIUnit(this.getAIMain(), aiUnit);
  }
  /**
   * Gets a UnitSeekAndDestroyMission for a unit.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param range A maximum range to search for a target within.
   * @return A new mission, or null if impossible.
   */
  getSeekAndDestroyMission$AIUnit$int(aiUnit: AIUnit, range: number): Mission {
    let loc = null;
    if (UnitSeekAndDestroyMission.invalidMissionReason$AIUnit(aiUnit) == null) {
      loc = UnitSeekAndDestroyMission.findMissionTarget(aiUnit, range, false, false);
    }
    return (loc == null) ? null : this.getSeekAndDestroyMission$AIUnit$Location(aiUnit, loc);
  }
  /**
   * Gets a UnitSeekAndDestroyMission for a unit.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param loc The target {@code Location}.
   * @return A new mission, or null if impossible.
   */
  getSeekAndDestroyMission$AIUnit$Location(aiUnit: AIUnit, loc: Location): Mission {
    return (UnitSeekAndDestroyMission.invalidMissionReason$AIUnit(aiUnit) != null || loc == null) ? null : new UnitSeekAndDestroyMission()._UnitSeekAndDestroyMission$AIMain$AIUnit$Location(this.getAIMain(), aiUnit, loc);
  }
  /**
   * Gets a new UnitWanderHostileMission for a unit.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A new mission, or null if impossible.
   */
  getWanderHostileMission(aiUnit: AIUnit): Mission {
    return (UnitWanderHostileMission.invalidMissionReason$AIUnit(aiUnit) != null) ? null : new UnitWanderHostileMission()._UnitWanderHostileMission$AIMain$AIUnit(this.getAIMain(), aiUnit);
  }
  /**
   * Makes every unit perform their mission.
   *
   * @param aiUnits A list of {@code AIUnit}s to perform missions.
   * @param lb A {@code LogBuilder} to log to.
   * @return A list of {@code AIUnit}s that have moves left.
   */
  doMissions(aiUnits: List<AIUnit>, lb: LogBuilder): List<AIUnit> {
    lb.add(['\n  Do Missions:']);
    let result = new ArrayList();
    for (const $it2 = aiUnits.iterator(); $it2.hasNext(); ) {
      let aiu = $it2.next();
      let unit = aiu.getUnit();
      if (unit == null || unit.isDisposed()) {
        continue;
      }
      lb.add(['\n  ', unit, ' ']);
      try {
        aiu.doMission(lb);
      } catch ($e3) {
        if ($J.isa($e3, Exception)) {
          let e = $J.exc($e3);
          MissionAIPlayer.logger.log(Level.WARNING, 'doMissions failed for: ' + $J.str(aiu), e);
        } else {
          throw $e3;
        }
      }
      if (!unit.isDisposed() && unit.getMovesLeft() > 0) {
        result.add(aiu);
      }
    }
    return result;
  }
  static $clinit() {
    MissionAIPlayer.logger = Logger.getLogger($J.cls(MissionAIPlayer).getName());
    MissionAIPlayer.aiUnitLocationComparator = (a1, a2) => {
      let l1 = (a1 == null) ? null : (a1.getUnit() == null) ? null : a1.getUnit().getLocation();
      let l2 = (a2 == null) ? null : (a2.getUnit() == null) ? null : a2.getUnit().getLocation();
      let f1 = (l1 instanceof WorkLocation) ? l1.getColony() : l1;
      let f2 = (l2 instanceof WorkLocation) ? l2.getColony() : l2;
      return FreeColObject.compareIds(f1, f2);
    };
  }
}

$J.define(MissionAIPlayer, 'net.sf.freecol.server.ai.MissionAIPlayer', { kind: 'class', sup: 'net.sf.freecol.server.ai.AIPlayer', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.io.FreeColXMLReader': '_MissionAIPlayer$AIMain$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.model.Player': '_MissionAIPlayer$AIMain$Player' }, returns: { 'getAIUnits': 'java.util.List' }, meths: { 'getSeekAndDestroyMission(net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location)': 'getSeekAndDestroyMission$AIUnit$Location', 'getSeekAndDestroyMission(net.sf.freecol.server.ai.AIUnit,int)': 'getSeekAndDestroyMission$AIUnit$int', 'getDefendSettlementMission(net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Settlement)': 'getDefendSettlementMission$AIUnit$Settlement' }, clinit: true, lazy: ['logger', 'aiUnitLocationComparator'] });
$J.module(() => {
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Tension$Level = $J.load('net.sf.freecol.common.model.Tension$Level');
  WorkLocation = $J.load('net.sf.freecol.common.model.WorkLocation');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
  AIUnit = $J.load('net.sf.freecol.server.ai.AIUnit');
  DefendSettlementMission = $J.load('net.sf.freecol.server.ai.mission.DefendSettlementMission');
  IdleAtSettlementMission = $J.load('net.sf.freecol.server.ai.mission.IdleAtSettlementMission');
  Mission = $J.load('net.sf.freecol.server.ai.mission.Mission');
  UnitSeekAndDestroyMission = $J.load('net.sf.freecol.server.ai.mission.UnitSeekAndDestroyMission');
  UnitWanderHostileMission = $J.load('net.sf.freecol.server.ai.mission.UnitWanderHostileMission');
});
