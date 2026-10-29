// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/mission/IndianDemandMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Comparator, Logger } from '../../../../../../../jre/index.ts';
import { Mission } from './Mission.ts';

let Colony, Goods, GoodsContainer, IndianSettlement, Stance, Tension$Level, Unit$MoveType, CostDeciders, GameOptions, CollectionUtils, AIMessage;

/**
 * Mission for demanding goods from a specified player.
 */
export class IndianDemandMission extends Mission {
  static logger: Logger = null;
  static readonly TAG: string = 'indianDemandMission';
  /**
   * The minimum amount of goods to demand.
   */
  static readonly GOODS_DEMAND_MIN: number = 30;
  /**
   * The tag for this mission.
   */
  static readonly tag: string = 'AI native demander';
  /**
   * Predicates for demand goods selection.
   */
  static selectPredicates: List<Predicate<GoodsType>> = null;
  /**
   * The colony to demand from.
   */
  colony: Colony = null;
  /**
   * Whether the demand has been made or not.
   */
  demanded: boolean = false;
  /**
   * Whether the demand succeeded.
   */
  succeeded: boolean = false;
  static readonly COLONY_TAG: string = 'colony';
  static readonly DEMANDED_TAG: string = 'demanded';
  static readonly SUCCEEDED_TAG: string = 'succeeded';
  /**
   * Creates a mission for the given {@code AIUnit}.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param target The {@code Colony} receiving the gift.
   */
  _IndianDemandMission$AIMain$AIUnit$Colony(aiMain: AIMain, aiUnit: AIUnit, target: Colony): this {
    this._Mission(aiMain, aiUnit);
    this.setTarget(target);
    this.demanded = this.succeeded = false;
    return this;
  }
  /**
   * Creates a new {@code IndianDemandMission} from a reader.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered during parsing.
   * @see net.sf.freecol.server.ai.AIObject#readFromXML
   */
  _IndianDemandMission$AIMain$AIUnit$FreeColXMLReader(aiMain: AIMain, aiUnit: AIUnit, xr: FreeColXMLReader): this {
    this._Mission(aiMain, aiUnit);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Checks if the unit is carrying a tribute (goods).
   *
   * @return True if the unit is carrying goods.
   */
  hasTribute(): boolean {
    return IndianDemandMission.hasMissionTribute(this.getAIUnit());
  }
  /**
   * Checks if a unit is carrying a tribute.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return True if the unit is carrying goods.
   */
  static hasMissionTribute(aiUnit: AIUnit): boolean {
    return aiUnit.getUnit().hasGoodsCargo();
  }
  /**
   * Set the result of the demand.
   *
   * @param result The result of making the demand.
   */
  setSucceeded(result: boolean): void {
    this.succeeded = result;
  }
  /**
   * Selects the most desirable goods from the colony.
   *
   * @param target The target {@code Colony}.
   * @return The goods to demand.
   */
  selectGoods(target: Colony): Goods {
    let spec = this.getSpecification();
    let goodsTypes = CollectionUtils.transform$Collection$Predicate(spec.getGoodsTypeList(), (gt) => target.getGoodsCount(gt) > 0);
    let dx = (spec.getInteger(GameOptions.NATIVE_DEMANDS) + 1) | 0;
    let game = target.getGame();
    let market = target.getOwner().getMarket();
    let marketPrice = Comparator.comparingInt((g) => market.getSalePrice$AbstractGoods(g));
    let makeGoods = (g) => new Goods()._Goods$Game$Location$GoodsType$int(game, target, g.getType(), this.capAmount(g.getAmount(), dx));
    let tension = this.getUnit().getOwner().getTension$Player(target.getOwner()).getLevel();
    let food = spec.getPrimaryFoodType();
    let cutoff = this.capAmount(target.getGoodsCount(food), dx);
    let goods = null;
    if (tension.compareTo(Tension$Level.CONTENT) <= 0 && target.getGoodsCount(food) >= cutoff) {
      goods = new Goods()._Goods$Game$Location$GoodsType$int(this.getGame(), target, food, cutoff);
    }
    if (goods == null && tension.compareTo(Tension$Level.DISPLEASED) <= 0) {
      let angryPred = (g) => !g.isFoodType() && !g.getType().getMilitary();
      goods = CollectionUtils.maximize$Collection$Predicate$Comparator(target.getCompactGoodsList(), angryPred, marketPrice);
      if (goods != null) {
        goods = makeGoods(goods);
      }
    }
    if (goods == null) {
      let goodsType = CollectionUtils.first$Stream(CollectionUtils.flatten$Collection$Function(IndianDemandMission.selectPredicates, (pred) => (CollectionUtils.transform$Collection$Predicate(goodsTypes, (gt) => pred(gt))).stream()));
      if (goodsType != null) {
        goods = new Goods()._Goods$Game$Location$GoodsType$int(this.getGame(), target, goodsType, this.capAmount(target.getGoodsCount(goodsType), dx));
      }
    }
    if (goods == null) {
      goods = CollectionUtils.maximize$Collection$Comparator(target.getCompactGoodsList(), marketPrice);
      if (goods != null) {
        goods = makeGoods(goods);
      }
    }
    return goods;
  }
  capAmount(amount: number, difficulty: number): number {
    return Math.min(Math.max($J.idiv(Math.imul(amount, difficulty), 6), IndianDemandMission.GOODS_DEMAND_MIN), GoodsContainer.CARGO_SIZE);
  }
  static getHome(aiUnit: AIUnit): IndianSettlement {
    return aiUnit.getUnit().getHomeIndianSettlement();
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
    return (reason != null) ? reason : ((home = IndianDemandMission.getHome(aiUnit)) == null || home.isDisposed()) ? 'home-destroyed' : null;
  }
  /**
   * Why would an IndianDemandMission be invalid with the given
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
        case Stance.PEACE:
        case Stance.ALLIANCE:
          return 'bad-stance';
        case Stance.WAR:
        case Stance.CEASE_FIRE:
          tension = unit.getHomeIndianSettlement().getAlarm$Player(targetPlayer);
          if (tension != null && tension.getLevel().compareTo(Tension$Level.CONTENT) <= 0) {
            return 'happy';
          }
          break;
      }
    }
    return null;
  }
  /**
   * Why would this mission be invalid with the given AI unit?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A reason for invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit(aiUnit: AIUnit): string {
    return IndianDemandMission.invalidUnitReason(aiUnit);
  }
  /**
   * Why would this mission be invalid with the given AI unit and location?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param loc The {@code Location} to check.
   * @return A reason for invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit$Location(aiUnit: AIUnit, loc: Location): string {
    let reason = IndianDemandMission.invalidMissionReason$AIUnit(aiUnit);
    return (reason != null) ? reason : (loc instanceof Colony) ? IndianDemandMission.invalidColonyReason(aiUnit, loc) : (loc instanceof IndianSettlement) ? Mission.invalidTargetReason$Location$Player(loc, aiUnit.getUnit().getOwner()) : Mission.TARGETINVALID;
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
    return (this.demanded && this.succeeded) ? this.getUnit().getHomeIndianSettlement() : this.colony;
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
    return IndianDemandMission.invalidMissionReason$AIUnit$Location(this.getAIUnit(), this.getTarget());
  }
  /**
   * {@inheritDoc}
   */
  doMission(lb: LogBuilder): Mission {
    lb.add([IndianDemandMission.tag]);
    let reason = this.invalidReason();
    if (reason != null) {
      return this.lbFail(lb, false, [reason]);
    }
    let aiUnit = this.getAIUnit();
    let unit = this.getUnit();
    let is$ = unit.getHomeIndianSettlement();
    let d: Direction;
    if (!this.demanded) {
      let mt = this.travelToTarget(this.getTarget(), null, lb);
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
          case Unit$MoveType.ATTACK_SETTLEMENT:
            d = unit.getTile$().getDirection(this.getTarget().getTile$());
            if (d != null) {
              break;
            }
          case Unit$MoveType.ATTACK_UNIT:
            blocker = Mission.resolveBlockage(aiUnit, this.getTarget());
            if (blocker == null) {
              this.moveRandomly(IndianDemandMission.tag, null);
              return this.lbWait(lb, []);
            }
            d = unit.getTile$().getDirection(blocker.getTile$());
            return (AIMessage.askAttack(aiUnit, d)) ? this.lbAttack(lb, blocker) : this.lbWait(lb, []);
          default:
            return this.lbMove(lb, mt);
        }
      }
      this.lbAt(lb);
      let aiPlayer = this.getAIPlayer();
      let colony = this.getTarget();
      let enemy = colony.getOwner();
      let goods = this.selectGoods(colony);
      let type$ = (goods == null) ? null : goods.getType();
      let amount = (goods == null) ? 0 : goods.getAmount();
      if (goods == null) {
        if (!enemy.checkGold(1)) {
          return this.lbDone(lb, false, ['empty handed']);
        }
        amount = $J.idiv(enemy.getGold(), 20);
        if (amount === 0) {
          amount = enemy.getGold();
        }
      }
      this.demanded = AIMessage.askIndianDemand(aiPlayer, unit, colony, type$, amount, null);
      lb.add([', demand made ', (this.demanded) ? '' : 'un', 'successfully']);
      return this.lbWait(lb, []);
    } else if (!this.succeeded) {
      let colony = this.getTarget();
      let enemy = colony.getOwner();
      let unitTension = (is$ == null) ? 0 : is$.getAlarm$Player(enemy).getValue();
      let tension = Math.max(unitTension, unit.getOwner().getTension$Player(enemy).getValue());
      d = unit.getTile$().getDirection(colony.getTile$());
      if (d != null && tension >= Tension$Level.CONTENT.getLimit()) {
        if (AIMessage.askAttack(aiUnit, d)) {
          this.lbAttack(lb, colony);
        }
      }
      return this.lbDone(lb, false, ['refused at ', colony]);
    } else if (!this.hasTribute()) {
      return this.lbDone(lb, true, ['accepted gold at ', this.colony]);
    } else {
      for (; ; ) {
        let mt = this.travelToTarget(this.getTarget(), CostDeciders.avoidSettlementsAndBlockingUnits(), lb);
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
          default:
            return this.lbMove(lb, mt);
        }
        this.lbAt(lb);
        let container = unit.getGoodsContainer();
        for (const $it0 = container.getCompactGoodsList().iterator(); $it0.hasNext(); ) {
          let goods = $it0.next();
          let tribute = container.removeGoods$GoodsType(goods.getType());
          is$.addGoods$AbstractGoods(tribute);
        }
        return this.lbDone(lb, false, ['unloaded tribute']);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.colony != null) {
      xw.writeAttribute(IndianDemandMission.COLONY_TAG, this.colony.getId());
    }
    xw.writeAttribute$String$boolean(IndianDemandMission.DEMANDED_TAG, this.demanded);
    xw.writeAttribute$String$boolean(IndianDemandMission.SUCCEEDED_TAG, this.succeeded);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.colony = xr.getAttribute$Game$String$Class$FreeColObject(this.getGame(), IndianDemandMission.COLONY_TAG, $J.cls(Colony), null);
    this.demanded = xr.getAttribute$String$boolean(IndianDemandMission.DEMANDED_TAG, false);
    this.succeeded = xr.getAttribute$String$boolean(IndianDemandMission.SUCCEEDED_TAG, false);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return IndianDemandMission.TAG;
  }
  static $clinit() {
    IndianDemandMission.logger = Logger.getLogger($J.cls(IndianDemandMission).getName());
    IndianDemandMission.selectPredicates = new ArrayList();
    IndianDemandMission.selectPredicates.add(($p0) => $p0.getMilitary());
    IndianDemandMission.selectPredicates.add(($p0) => $p0.isBuildingMaterial());
    IndianDemandMission.selectPredicates.add(($p0) => $p0.isTradeGoods());
    IndianDemandMission.selectPredicates.add(($p0) => $p0.isRefined());
  }
}

$J.define(IndianDemandMission, 'net.sf.freecol.server.ai.mission.IndianDemandMission', { kind: 'class', sup: 'net.sf.freecol.server.ai.mission.Mission', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.io.FreeColXMLReader': '_IndianDemandMission$AIMain$AIUnit$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Colony': '_IndianDemandMission$AIMain$AIUnit$Colony' }, returns: { 'getXMLTagName': 'java.lang.String', 'getTarget': 'net.sf.freecol.common.model.Location', 'getTransportDestination': 'net.sf.freecol.common.model.Location', 'hasTribute': 'boolean' }, meths: { 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location)': 'invalidMissionReason$AIUnit$Location', 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit)': 'invalidMissionReason$AIUnit' }, clinit: true, lazy: ['logger', 'selectPredicates'] });
$J.module(() => {
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Goods = $J.load('net.sf.freecol.common.model.Goods');
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  Stance = $J.load('net.sf.freecol.common.model.Stance');
  Tension$Level = $J.load('net.sf.freecol.common.model.Tension$Level');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  CostDeciders = $J.load('net.sf.freecol.common.model.pathfinding.CostDeciders');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  AIMessage = $J.load('net.sf.freecol.server.ai.AIMessage');
});
