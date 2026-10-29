// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/mission/IndianBringGiftMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../../jre/index.ts';
import { Mission } from './Mission.ts';

let Colony, IndianSettlement, Stance, Tension$Level, Unit$MoveType, CostDeciders, AIMessage;

/**
 * Mission for bringing a gift to a specified player.
 *
 * The mission has three different tasks to perform:
 * <ol>
 * <li>Get the gift (goods) from the {@link IndianSettlement} that owns the
 * unit.
 * <li>Transport this gift to the given {@link Colony}.
 * <li>Complete the mission by delivering the gift.
 * </ol>
 */
export class IndianBringGiftMission extends Mission {
  static logger: Logger = null;
  static readonly TAG: string = 'indianBringGiftMission';
  /**
   * The tag for this mission.
   */
  static readonly tag: string = 'AI native gifter';
  /**
   * The Colony to receive the gift.
   */
  colony: Colony = null;
  /**
   * Has the gift been collected?
   */
  collected: boolean = false;
  static readonly COLLECTED_TAG: string = 'collected';
  static readonly COLONY_TAG: string = 'colony';
  /**
   * Creates a mission for the given {@code AIUnit}.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param target The {@code Colony} receiving the gift.
   */
  _IndianBringGiftMission$AIMain$AIUnit$Colony(aiMain: AIMain, aiUnit: AIUnit, target: Colony): this {
    this._Mission(aiMain, aiUnit);
    this.setTarget(target);
    this.collected = this.hasGift();
    return this;
  }
  /**
   * Creates a new {@code IndianBringGiftMission} from a reader.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered during parsing.
   * @see net.sf.freecol.server.ai.AIObject#readFromXML
   */
  _IndianBringGiftMission$AIMain$AIUnit$FreeColXMLReader(aiMain: AIMain, aiUnit: AIUnit, xr: FreeColXMLReader): this {
    this._Mission(aiMain, aiUnit);
    this.readFromXML(xr);
    return this;
  }
  getColony(): Colony {
    return this.colony;
  }
  /**
   * Checks if the unit is carrying a gift (goods).
   *
   * @return True if the unit is carrying goods.
   */
  hasGift(): boolean {
    return this.getUnit().hasGoodsCargo();
  }
  /**
   * Why would this mission be invalid with the given unit?
   *
   * @param aiUnit The {@code AIUnit} to test.
   * @return A reason why the mission would be invalid with the unit,
   *     or null if none found.
   */
  static invalidUnitReason(aiUnit: AIUnit): string {
    let reason = Mission.invalidAIUnitReason(aiUnit);
    let home: IndianSettlement;
    return (reason != null) ? reason : ((home = aiUnit.getUnit().getHomeIndianSettlement()) == null || home.isDisposed()) ? 'home-destroyed' : null;
  }
  /**
   * Why would an IndianBringGiftMission be invalid with the given
   * unit and colony.
   *
   * @param aiUnit The {@code AIUnit} to test.
   * @param colony The {@code Colony} to test.
   * @return A reason why the mission would be invalid with the unit
   *     and colony or null if none found.
   */
  static invalidColonyReason(aiUnit: AIUnit, colony: Colony): string {
    let reason = Mission.invalidTargetReason$Location(colony);
    if (reason != null) {
      return reason;
    }
    let unit = aiUnit.getUnit();
    let owner = unit.getOwner();
    let targetPlayer = colony.getOwner();
    {
      let tension: Tension;
      switch (owner.getStance(targetPlayer)) {
        case Stance.UNCONTACTED:
        case Stance.WAR:
        case Stance.CEASE_FIRE:
          return 'bad-stance';
        case Stance.PEACE:
        case Stance.ALLIANCE:
          tension = unit.getHomeIndianSettlement().getAlarm$Player(targetPlayer);
          if (tension != null && tension.getLevel().compareTo(Tension$Level.HAPPY) > 0) {
            return 'unhappy';
          }
      }
    }
    return null;
  }
  /**
   * Why would this mission be invalid with the given AI unit?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit(aiUnit: AIUnit): string {
    return IndianBringGiftMission.invalidUnitReason(aiUnit);
  }
  /**
   * Why would this mission be invalid with the given AI unit and location?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param loc The {@code Location} to check.
   * @return A reason for invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit$Location(aiUnit: AIUnit, loc: Location): string {
    let reason = IndianBringGiftMission.invalidMissionReason$AIUnit(aiUnit);
    return (reason != null) ? reason : (loc instanceof Colony) ? IndianBringGiftMission.invalidColonyReason(aiUnit, loc) : (loc instanceof IndianSettlement) ? Mission.invalidTargetReason$Location$Player(loc, aiUnit.getUnit().getOwner()) : Mission.TARGETINVALID;
  }
  /**
   * {@inheritDoc}
   */
  getTransportDestination(): Location {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  getTarget(): Location {
    return (this.collected) ? this.colony : this.getUnit().getHomeIndianSettlement();
  }
  /**
   * {@inheritDoc}
   */
  setTarget(target: Location): void {
    if (target instanceof Colony) {
      this.colony = target;
    }
  }
  /**
   * {@inheritDoc}
   */
  findTarget(): Location {
    return this.getTarget();
  }
  /**
   * {@inheritDoc}
   */
  invalidReason(): string {
    return IndianBringGiftMission.invalidMissionReason$AIUnit$Location(this.getAIUnit(), this.colony);
  }
  /**
   * {@inheritDoc}
   */
  doMission(lb: LogBuilder): Mission {
    lb.add([IndianBringGiftMission.tag]);
    let reason = this.invalidReason();
    if (reason != null) {
      return this.lbFail(lb, false, [reason]);
    }
    let aiUnit = this.getAIUnit();
    let unit = this.getUnit();
    let is$ = unit.getHomeIndianSettlement();
    while (!this.collected) {
      let mt = this.travelToTarget(this.getTarget(), null, lb);
      {
        let blocker: Location;
        switch (mt) {
          case Unit$MoveType.MOVE:
            break;
          case Unit$MoveType.MOVE_HIGH_SEAS:
          case Unit$MoveType.MOVE_NO_MOVES:
          case Unit$MoveType.MOVE_ILLEGAL:
            return this.lbWait(lb, []);
          case Unit$MoveType.MOVE_NO_REPAIR:
            return this.lbFail(lb, false, [Mission.AIUNITDIED]);
          case Unit$MoveType.MOVE_NO_TILE:
            return this;
          case Unit$MoveType.ATTACK_SETTLEMENT:
          case Unit$MoveType.ATTACK_UNIT:
            blocker = Mission.resolveBlockage(aiUnit, this.getTarget());
            if (blocker != null && AIMessage.askAttack(aiUnit, unit.getTile$().getDirection(blocker.getTile$()))) {
              return this.lbAttack(lb, blocker);
            }
            this.moveRandomly(IndianBringGiftMission.tag, null);
            continue;
          default:
            return this.lbMove(lb, mt);
        }
      }
      this.lbAt(lb);
      let gift = is$.getRandomGift(this.getAIRandom());
      if (gift == null) {
        return this.lbFail(lb, false, ['found no gift']);
      }
      if (!AIMessage.askLoadGoods(is$, gift.getType(), gift.getAmount(), aiUnit) || !this.hasGift()) {
        return this.lbFail(lb, false, ['failed to collect gift']);
      }
      this.collected = true;
      lb.add([', collected gift']);
      return this.lbRetarget(lb);
    }
    for (; ; ) {
      let mt = this.travelToTarget(this.getTarget(), CostDeciders.avoidSettlementsAndBlockingUnits(), lb);
      {
        let blocker: Location;
        switch (mt) {
          case Unit$MoveType.MOVE_HIGH_SEAS:
          case Unit$MoveType.MOVE_NO_MOVES:
          case Unit$MoveType.MOVE_ILLEGAL:
            return this.lbWait(lb, []);
          case Unit$MoveType.MOVE_NO_REPAIR:
            return this.lbFail(lb, false, [Mission.AIUNITDIED]);
          case Unit$MoveType.MOVE_NO_TILE:
            return this;
          case Unit$MoveType.MOVE:
          case Unit$MoveType.ATTACK_SETTLEMENT:
            break;
          case Unit$MoveType.ATTACK_UNIT:
            blocker = Mission.resolveBlockage(aiUnit, this.getTarget());
            if (blocker != null && AIMessage.askAttack(aiUnit, unit.getTile$().getDirection(blocker.getTile$()))) {
              return this.lbAttack(lb, blocker);
            }
            this.moveRandomly(IndianBringGiftMission.tag, null);
            continue;
          default:
            return this.lbMove(lb, mt);
        }
      }
      this.lbAt(lb);
      let result = AIMessage.askNativeGift(aiUnit, this.colony);
      return (result) ? this.lbDone(lb, false, ['delivered']) : this.lbFail(lb, false, ['delivery']);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$boolean(IndianBringGiftMission.COLLECTED_TAG, this.collected);
    if (this.colony != null) {
      xw.writeAttribute(IndianBringGiftMission.COLONY_TAG, this.colony.getId());
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.collected = xr.getAttribute$String$boolean(IndianBringGiftMission.COLLECTED_TAG, false);
    this.colony = xr.getAttribute$Game$String$Class$FreeColObject(this.getGame(), IndianBringGiftMission.COLONY_TAG, $J.cls(Colony), null);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return IndianBringGiftMission.TAG;
  }
  static $clinit() {
    IndianBringGiftMission.logger = Logger.getLogger($J.cls(IndianBringGiftMission).getName());
  }
}

$J.define(IndianBringGiftMission, 'net.sf.freecol.server.ai.mission.IndianBringGiftMission', { kind: 'class', sup: 'net.sf.freecol.server.ai.mission.Mission', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.io.FreeColXMLReader': '_IndianBringGiftMission$AIMain$AIUnit$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Colony': '_IndianBringGiftMission$AIMain$AIUnit$Colony' }, returns: { 'getXMLTagName': 'java.lang.String', 'getTarget': 'net.sf.freecol.common.model.Location', 'getTransportDestination': 'net.sf.freecol.common.model.Location', 'hasGift': 'boolean', 'getColony': 'net.sf.freecol.common.model.Colony' }, meths: { 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location)': 'invalidMissionReason$AIUnit$Location', 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit)': 'invalidMissionReason$AIUnit' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  Stance = $J.load('net.sf.freecol.common.model.Stance');
  Tension$Level = $J.load('net.sf.freecol.common.model.Tension$Level');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  CostDeciders = $J.load('net.sf.freecol.common.model.pathfinding.CostDeciders');
  AIMessage = $J.load('net.sf.freecol.server.ai.AIMessage');
});
