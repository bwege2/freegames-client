// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/mission/WishRealizationMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString, Logger, XMLStreamException } from '../../../../../../../jre/index.ts';
import { Mission } from './Mission.ts';

let Colony, Unit$MoveType, CostDeciders, GoodsWish, Wish, WorkerWish;

/**
 * Mission for realizing a {@code Wish}.
 */
export class WishRealizationMission extends Mission {
  static logger: Logger = null;
  static readonly TAG: string = 'wishRealizationMission';
  /**
   * The tag for this mission.
   */
  static readonly tag: string = 'AI wisher';
  /**
   * The wish to be realized.
   */
  wish: Wish = null;
  static readonly WISH_TAG: string = 'wish';
  /**
   * Creates a mission for the given {@code AIUnit}.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param wish The {@code Wish} which will be realized by
   *     the unit and this mission.
   */
  _WishRealizationMission$AIMain$AIUnit$Wish(aiMain: AIMain, aiUnit: AIUnit, wish: Wish): this {
    this._Mission(aiMain, aiUnit);
    this.setTarget(wish.getDestination());
    this.wish = wish;
    wish.setTransportable(aiUnit);
    return this;
  }
  /**
   * Creates a new {@code WishRealizationMission} from a reader.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered
   *      during parsing.
   * @see net.sf.freecol.server.ai.AIObject#readFromXML
   */
  _WishRealizationMission$AIMain$AIUnit$FreeColXMLReader(aiMain: AIMain, aiUnit: AIUnit, xr: FreeColXMLReader): this {
    this._Mission(aiMain, aiUnit);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Get the wish handled by this mission.
   *
   * @return The mission {@code Wish}.
   */
  getWish(): Wish {
    return this.wish;
  }
  /**
   * Why would this mission be invalid with the given AI unit and location?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param loc The {@code Location} to check.
   * @return A reason for invalidity, or null if none found.
   */
  static invalidMissionReason(aiUnit: AIUnit, loc: Location): string {
    let reason: string;
    return ((reason = Mission.invalidAIUnitReason(aiUnit)) != null) ? reason : ((reason = Mission.invalidTargetReason$Location$Player(loc, aiUnit.getUnit().getOwner())) != null) ? reason : null;
  }
  /**
   * {@inheritDoc}
   */
  dispose(): void {
    if (this.wish != null) {
      this.wish.setTransportable(null);
      this.wish = null;
    }
    super.dispose();
  }
  /**
   * {@inheritDoc}
   */
  getBaseTransportPriority(): number {
    return Mission.NORMAL_TRANSPORT_PRIORITY;
  }
  /**
   * {@inheritDoc}
   */
  getTarget(): Location {
    return (this.wish == null) ? null : this.wish.getDestination();
  }
  /**
   * {@inheritDoc}
   */
  setTarget(target: Location): void {
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
    return (this.wish == null) ? 'wish-null' : WishRealizationMission.invalidMissionReason(this.getAIUnit(), this.getTarget());
  }
  /**
   * {@inheritDoc}
   */
  doMission(lb: LogBuilder): Mission {
    lb.add([WishRealizationMission.tag]);
    let reason = this.invalidReason();
    if (reason != null) {
      return this.lbFail(lb, false, [reason]);
    }
    let unit = this.getUnit();
    let target = this.getTarget();
    let mt = this.travelToTarget(target, CostDeciders.avoidSettlementsAndBlockingUnits(), lb);
    switch (mt) {
      case Unit$MoveType.MOVE:
        break;
      case Unit$MoveType.MOVE_HIGH_SEAS:
      case Unit$MoveType.MOVE_NO_MOVES:
      case Unit$MoveType.MOVE_ILLEGAL:
        return this.lbWait(lb, []);
      case Unit$MoveType.MOVE_NO_REPAIR:
        return this.lbFail(lb, false, [Mission.AIUNITDIED]);
      case Unit$MoveType.MOVE_NO_ACCESS_EMBARK:
      case Unit$MoveType.MOVE_NO_TILE:
        return this;
      default:
        return this.lbMove(lb, mt);
    }
    this.lbAt(lb);
    if (target instanceof Colony) {
      let aiMain = this.getAIMain();
      let colony = target;
      let aiUnit = this.getAIUnit();
      let aiColony = aiMain.getAIColony(colony);
      let owner = this.getEuropeanAIPlayer();
      aiColony.completeWish$Wish$String$LogBuilder(this.wish, unit.toShortString(), lb);
      if (unit.getType().isOffensive()) {
        if (owner.getDefendSettlementMission$AIUnit$Settlement(aiUnit, colony) != null) {
          this.lbDone(lb, true, ['ready to defend, ', colony]);
        } else {
          this.lbFail(lb, true, ['unable to defend']);
        }
      } else {
        aiColony.requestRearrange();
        if (owner.getWorkInsideColonyMission(aiUnit, aiColony) != null) {
          this.lbDone(lb, true, ['ready to work ', colony]);
        } else {
          this.lbFail(lb, true, ['unable to work']);
        }
      }
    } else {
      this.lbFail(lb, true, ['broken wish ', this.wish]);
    }
    this.wish = null;
    return this.lbDrop(lb, []);
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(WishRealizationMission.WISH_TAG, this.wish);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let aiMain = this.getAIMain();
    let wid = xr.getAttribute$String$String(WishRealizationMission.WISH_TAG, null);
    this.wish = xr.getAttribute$AIMain$String$Class$AIObject(aiMain, WishRealizationMission.WISH_TAG, $J.cls(Wish), null);
    if (this.wish == null) {
      if (wid.startsWith(GoodsWish.TAG)) {
        this.wish = new GoodsWish()._GoodsWish$AIMain$String(aiMain, wid);
      } else if (wid.startsWith(WorkerWish.TAG)) {
        this.wish = new WorkerWish()._WorkerWish$AIMain$String(aiMain, wid);
      } else {
        throw new XMLStreamException('Unknown wish tag: ' + wid);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return WishRealizationMission.TAG;
  }
  static $clinit() {
    WishRealizationMission.logger = Logger.getLogger($J.cls(WishRealizationMission).getName());
  }
}

$J.define(WishRealizationMission, 'net.sf.freecol.server.ai.mission.WishRealizationMission', { kind: 'class', sup: 'net.sf.freecol.server.ai.mission.Mission', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.io.FreeColXMLReader': '_WishRealizationMission$AIMain$AIUnit$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.server.ai.Wish': '_WishRealizationMission$AIMain$AIUnit$Wish' }, returns: { 'getXMLTagName': 'java.lang.String', 'getTarget': 'net.sf.freecol.common.model.Location', 'getBaseTransportPriority': 'int', 'getWish': 'net.sf.freecol.server.ai.Wish' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  CostDeciders = $J.load('net.sf.freecol.common.model.pathfinding.CostDeciders');
  GoodsWish = $J.load('net.sf.freecol.server.ai.GoodsWish');
  Wish = $J.load('net.sf.freecol.server.ai.Wish');
  WorkerWish = $J.load('net.sf.freecol.server.ai.WorkerWish');
});
