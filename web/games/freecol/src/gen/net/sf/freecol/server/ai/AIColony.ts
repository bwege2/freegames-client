// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/AIColony.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, Collectors, Comparator, HashSet, JFunction, Level, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { AIObject } from './AIObject.ts';

let Ability, Colony, ColonyTile, Constants, FreeColObject, GoodsContainer, GoodsType, Turn, TypeCountMap, UnitWas, CollectionUtils, LogBuilder, AIGoods, AIMessage, AIUnit, ColonyPlan, GoodsWish, TileImprovementPlan, TransportableAIObject, ValuedAIObject, WorkerWish;

/**
 * Objects of this class contains AI-information for a single {@link Colony}.
 */
export class AIColony extends AIObject {
  static logger: Logger = null;
  static readonly TAG: string = 'aiColony';
  static readonly LIST_ELEMENT: string = 'ListElement';
  /**
   * Do not perform tile improvements that would leave less than
   * this amount of forested work locations available to the colony.
   */
  static readonly FOREST_MINIMUM: number = 1;
  /**
   * Do not bother trying to ship out less than this amount of goods.
   */
  static readonly EXPORT_MINIMUM: number = 10;
  /**
   * Comparator to choose the best pioneers.
   */
  static pioneerComparator: Comparator<Unit> = null;
  /**
   * Comparator to choose the best scouts.
   */
  static scoutComparator: Comparator<Unit> = null;
  /**
   * Goods that should be completely exported and only exported to
   * prevent the warehouse filling.
   */
  static fullExport: JSet<GoodsType> = null;
  static partExport: JSet<GoodsType> = null;
  /**
   * The colony this AIColony is managing.
   */
  colony: Colony = null;
  /**
   * The current plan for the colony.  Does not need to be serialized.
   */
  colonyPlan: ColonyPlan = null;
  /**
   * Goods to export from the colony.
   */
  exportGoods: List<AIGoods> = null;
  /**
   * Useful things for the colony.
   */
  wishes: List<Wish> = null;
  /**
   * Plans to improve neighbouring tiles.
   */
  tileImprovementPlans: List<TileImprovementPlan> = null;
  /**
   * When should the workers in this Colony be rearranged?
   */
  rearrangeTurn: Turn = null;
  static readonly AI_GOODS_LIST_TAG: string = 'aiGoodsListElement';
  static readonly GOODS_WISH_LIST_TAG: string = 'goodsWishListElement';
  static readonly TILE_IMPROVEMENT_PLAN_LIST_TAG: string = 'tileImprovementPlanListElement';
  static readonly WORKER_WISH_LIST_TAG: string = 'workerWishListElement';
  static readonly OLD_TILE_IMPROVEMENT_PLAN_LIST_TAG: string = 'tileimprovementplanListElement';
  $init_AIColony() {
    this.rearrangeTurn = new Turn()._Turn(0);
  }
  /**
   * Creates a new uninitialized {@code AIColony}.
   *
   * @param aiMain The main AI-object.
   * @param id The object identifier.
   */
  _AIColony$AIMain$String(aiMain: AIMain, id: string): this {
    this._AIObject$AIMain$String(aiMain, id);
    this.$init_AIColony();
    this.baseInitialize();
    this.initialized = false;
    return this;
  }
  /**
   * Creates a new {@code AIColony}.
   *
   * @param aiMain The main AI-object.
   * @param colony The colony to make an {@link AIObject} for.
   */
  _AIColony$AIMain$Colony(aiMain: AIMain, colony: Colony): this {
    this._AIColony$AIMain$String(aiMain, colony.getId());
    this.colony = colony;
    colony.addPropertyChangeListener$String$PropertyChangeListener(Colony.REARRANGE_COLONY, $J.fn(this, 'propertyChange'));
    this.setInitialized();
    return this;
  }
  /**
   * Creates a new {@code AIColony} from the given
   * XML-representation.
   *
   * @param aiMain The main AI-object.
   * @param xr The input stream containing the XML.
   * @exception XMLStreamException if a problem was encountered
   *     during parsing.
   */
  _AIColony$AIMain$FreeColXMLReader(aiMain: AIMain, xr: FreeColXMLReader): this {
    this._AIObject$AIMain$FreeColXMLReader(aiMain, xr);
    this.$init_AIColony();
    this.setInitialized();
    return this;
  }
  /**
   * Initialize the basic fields.
   */
  baseInitialize(): void {
    if (this.exportGoods != null) {
      return;
    }
    this.colonyPlan = null;
    this.exportGoods = new ArrayList();
    this.wishes = new ArrayList();
    this.tileImprovementPlans = new ArrayList();
  }
  /**
   * {@inheritDoc}
   */
  setInitialized(): void {
    this.initialized = this.getColony() != null;
  }
  /**
   * Gets the {@code Colony} this {@code AIColony} controls.
   *
   * @return The {@code Colony}.
   */
  getColony(): Colony {
    return this.colony;
  }
  getAIUnit(unit: Unit): AIUnit {
    return this.getAIMain().getAIUnit(unit);
  }
  getAIOwner(): AIPlayer {
    return this.getAIMain().getAIPlayer(this.colony.getOwner());
  }
  /**
   * Is this AI colony badly defended?
   *
   * @return True if this colony needs more defenders.
   */
  isBadlyDefended(): boolean {
    return this.colony.isBadlyDefended();
  }
  /**
   * Update any relatively static properties of the colony:
   *   - export state
   *   - disposition of export goods in this colony
   *   - tile improvements (might ignore freshly grabbed tiles)
   *   - wishes
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  update(lb: LogBuilder): void {
    lb.add(['\n  ', this.colony.getName()]);
    this.resetExports();
    this.updateExportGoods(lb);
    this.updateTileImprovementPlans(lb);
    this.updateWishes(lb);
  }
  /**
   * Rearranges the workers within this colony using the {@link ColonyPlan}.
   *
   * FIXME: Detect military threats and boost defence.
   *
   * @param lb A {@code LogBuilder} to log to.
   * @return A set of {@code AIUnit}s that changed their work state.
   */
  rearrangeColony(lb: LogBuilder): JSet<AIUnit> {
    let aiMain = this.getAIMain();
    let result = new HashSet();
    if (this.colony.getUnitCount() <= 0) {
      if (!this.avertAutoDestruction()) {
        return result;
      }
    }
    let turn = this.getGame().getTurn().getNumber();
    if (this.rearrangeTurn.getNumber() > turn) {
      if (this.colony.getCurrentlyBuilding() == null && this.colonyPlan != null && this.colonyPlan.getBestBuildableType() != null) {
        AIColony.logger.warning(this.colony.getName() + ' could be building but is asleep until turn: ' + this.rearrangeTurn.getNumber() + '( > ' + turn + ')');
      } else {
        return result;
      }
    }
    let tile = this.colony.getTile$();
    let player = this.colony.getOwner();
    let spec = this.getSpecification();
    lb.add(['\n  ', this.colony.getName()]);
    let nextRearrange = 15;
    this.exploreLCRs();
    this.stealTiles(lb);
    for (const $it0 = (CollectionUtils.transform$Collection$Predicate(tile.getSurroundingTiles$int$int(1, 1), (t2) => !player.owns(t2) && player.canClaimForSettlement(t2))).iterator(); $it0.hasNext(); ) {
      let t = $it0.next();
      AIMessage.askClaimLand$Tile$AIColony$int(t, this, 0);
      if (player.owns(t)) {
        lb.add([', claimed tile ', t]);
      }
    }
    if (this.colonyPlan == null) {
      this.colonyPlan = new ColonyPlan()._ColonyPlan(aiMain, this.colony);
    }
    this.colonyPlan.update();
    let oldBuild = this.colony.getCurrentlyBuilding();
    let build = this.colonyPlan.getBestBuildableType();
    if (build !== oldBuild) {
      let queue = new ArrayList(1);
      if (build != null) {
        queue.add(build);
      }
      AIMessage.askSetBuildQueue(this, queue);
      build = this.colony.getCurrentlyBuilding();
    }
    this.colonyPlan.refine(build, lb);
    let workers = this.colony.getUnitList();
    let was = CollectionUtils.transform$Collection$Predicate$Function(workers, CollectionUtils.alwaysTrue(), (u) => new UnitWas()._UnitWas(u));
    let workerPred = (u) => {
      let validAIU: AIUnit;
      return u.isPerson() && !u.hasAbility$String(Ability.REF_UNIT) && (validAIU = this.getAIUnit(u)) != null && validAIU.isAvailableForWork(this.colony);
    };
    for (const $it1 = CollectionUtils.transform$Stream$Predicate(tile.getUnits(), workerPred).iterator(); $it1.hasNext(); ) {
      let u = $it1.next();
      workers.add(u);
      was.add(new UnitWas()._UnitWas(u));
    }
    let aiPlayer = this.getAIOwner();
    let aw = new LogBuilder()._LogBuilder(256);
    let preferScouts = aiPlayer.scoutsNeeded() > 0;
    let scratch = this.colonyPlan.assignWorkers(new ArrayList(workers), preferScouts, aw);
    if (scratch == null) {
      lb.add([', failed to assign workers.']);
      this.rearrangeTurn = new Turn()._Turn((turn + 1) | 0);
      return result;
    }
    lb.add([', assigned ', workers.size(), ' workers']);
    AIMessage.askRearrangeColony(this, workers, scratch);
    if (this.colony.getUnitCount() <= 0) {
      lb.add([', autodestruct detected']);
      let sb = new StringBuilder(64);
      sb.append('Autodestruct at ').append(this.colony.getName()).append(' in ').append(String(turn)).append(String.fromCharCode(58 /* ':' */));
      for (const $it2 = was.iterator(); $it2.hasNext(); ) {
        let uw = $it2.next();
        sb.append(String.fromCharCode(10 /* \u000a */)).append($J.str(uw));
      }
      AIColony.logger.warning(sb.toString());
      if (!this.avertAutoDestruction()) {
        return result;
      }
    }
    if (build != null && !this.colony.canBuild$BuildableType(build)) {
      let newBuild = this.colonyPlan.getBestBuildableType();
      lb.add([', reneged building ', build.getSuffix$(), ' (', this.colony.getNoBuildReason(build, null), ')']);
      let queue = new ArrayList();
      if (newBuild != null) {
        queue.add(newBuild);
      }
      AIMessage.askSetBuildQueue(this, queue);
      nextRearrange = 1;
    }
    if (this.colony.getNetProductionOf(spec.getPrimaryFoodType()) < 0) {
      let food = spec.getPrimaryFoodType();
      let net = this.colony.getNetProductionOf(food);
      let when = $J.idiv(this.colony.getGoodsCount(food), -net);
      nextRearrange = Math.max(0, Math.min(nextRearrange, (when - 1) | 0));
    }
    let warehouse = this.colony.getWarehouseCapacity();
    for (const $it3 = (CollectionUtils.transform$Collection$Predicate(spec.getStorableGoodsTypeList(), (gt) => !gt.isFoodType())).iterator(); $it3.hasNext(); ) {
      let g = $it3.next();
      let have = this.colony.getGoodsCount(g);
      let net = this.colony.getAdjustedNetProductionOf(g);
      if (net >= 0 && (have >= warehouse || g.limitIgnored())) {
        continue;
      }
      let when = (net < 0) ? (($J.idiv(have, -net) - 1) | 0) : (net > 0) ? (($J.idiv(((warehouse - have) | 0), net) - 1) | 0) : 2147483647;
      nextRearrange = Math.max(1, Math.min(nextRearrange, when));
    }
    for (const $it4 = this.colony.getUnitList().iterator(); $it4.hasNext(); ) {
      let u = $it4.next();
      let aiu = this.getAIUnit(u);
      if (!aiu.tryWorkInsideColonyMission(this, lb)) {
        result.add(aiu);
      }
    }
    let tipSize = this.tileImprovementPlans.size();
    if (tipSize > 0) {
      let pioneers = CollectionUtils.transform$Stream$Predicate$Function$Comparator(tile.getUnits(), (u) => u.getPioneerScore() >= 0, JFunction.identity(), AIColony.pioneerComparator);
      for (const $it5 = pioneers.iterator(); $it5.hasNext(); ) {
        let u = $it5.next();
        let aiu = this.getAIUnit(u);
        if (aiu.tryPioneeringMission(lb)) {
          if (--tipSize <= 0) {
            break;
          }
        }
      }
    }
    for (const $it6 = tile.getUnitList().iterator(); $it6.hasNext(); ) {
      let u = $it6.next();
      let aiu = this.getAIUnit(u);
      if (!aiu.trySomeUsefulMission(this.colony, lb)) {
        result.add(aiu);
      }
    }
    build = this.colony.getCurrentlyBuilding();
    let buildStr = (build != null) ? build.toString() : ((build = this.colonyPlan.getBestBuildableType()) != null) ? 'unexpected-null(' + $J.str(build) + ')' : 'expected-null';
    lb.add([', building ', buildStr, ', population ', this.colony.getUnitCount(), ', rearrange ', nextRearrange, '.\n']);
    lb.add([aw.toString()]);
    lb.shrink('\n');
    for (const $it7 = was.iterator(); $it7.hasNext(); ) {
      let uw = $it7.next();
      lb.add(['\n  ', uw]);
    }
    this.rearrangeTurn = new Turn()._Turn((turn + nextRearrange) | 0);
    return result;
  }
  /**
   * Reset the export settings.
   * This is always needed even when there is no customs house, because
   * updateExportGoods needs to know what to export by transport.
   *
   * FIXME: consider market prices?
   */
  resetExports(): void {
    let spec = this.getSpecification();
    let player = this.colony.getOwner();
    AIColony.fullExport.clear();
    AIColony.partExport.clear();
    for (const $it8 = spec.getStorableGoodsTypeList().iterator(); $it8.hasNext(); ) {
      let g = $it8.next();
      if (!g.isFoodType() && !g.isRawMaterialForUnstorableBuildingMaterial() && !g.isBuildingMaterial() && !g.getMilitary() && !g.isTradeGoods()) {
        if (g.isRawMaterial()) {
          AIColony.partExport.add(g);
        } else {
          AIColony.fullExport.add(g);
        }
      }
    }
    let dUT = spec.getDefaultUnitType$Player(player);
    for (const $it9 = (CollectionUtils.transform$Stream$Predicate(CollectionUtils.flatten$Stream$Predicate$Function(spec.getRoles(), (r) => r.isAvailableTo([player, dUT]), ($p0) => $p0.getRequiredGoods$()), (g) => AIColony.fullExport.contains(g.getType()))).iterator(); $it9.hasNext(); ) {
      let ag = $it9.next();
      AIColony.fullExport.remove(ag.getType());
      AIColony.partExport.add(ag.getType());
    }
    if (this.colony.getOwner().getMarket() == null) {
      for (const $it10 = spec.getGoodsTypeList().iterator(); $it10.hasNext(); ) {
        let g = $it10.next();
        this.colony.getExportData$GoodsType(g).setExported(false);
      }
    } else {
      let exportLevel = $J.idiv(Math.imul(4, this.colony.getWarehouseCapacity()), 5);
      for (const $it11 = spec.getGoodsTypeList().iterator(); $it11.hasNext(); ) {
        let g = $it11.next();
        if (AIColony.fullExport.contains(g)) {
          this.colony.getExportData$GoodsType(g).setExportLevel(0);
          this.colony.getExportData$GoodsType(g).setExported(true);
        } else if (AIColony.partExport.contains(g)) {
          this.colony.getExportData$GoodsType(g).setExportLevel(exportLevel);
          this.colony.getExportData$GoodsType(g).setExported(true);
        } else {
          this.colony.getExportData$GoodsType(g).setExported(false);
        }
      }
    }
  }
  /**
   * Explores any neighbouring LCRs.
   * Choose non-expert persons for the exploration.
   */
  exploreLCRs(): void {
    let tile = this.colony.getTile$();
    let explorerPred = (u) => u.isPerson() && (u.getType().getSkill() <= 0 || u.hasAbility$String(Ability.EXPERT_SCOUT));
    let scouts = CollectionUtils.transform$Stream$Predicate$Function$Comparator(tile.getUnits(), explorerPred, JFunction.identity(), AIColony.scoutComparator);
    for (const $it12 = (CollectionUtils.transform$Collection$Predicate(tile.getSurroundingTiles$int$int(1, 1), ($p0) => $p0.hasLostCityRumour())).iterator(); $it12.hasNext(); ) {
      let t = $it12.next();
      let direction = tile.getDirection(t);
      for (; ; ) {
        if (scouts.isEmpty()) {
          return;
        }
        let u = scouts.removeAt(0);
        if (!u.getMoveType$Tile(t).isProgress()) {
          continue;
        }
        if (this.getAIUnit(u).move(direction) && !t.hasLostCityRumour()) {
          u.setDestination(tile);
          break;
        }
      }
    }
  }
  /**
   * Steals neighbouring tiles but only if the colony has some
   * defence.  Grab everything if at war with the owner, otherwise
   * just take the tile that best helps with the currently required
   * raw building materials, with a lesser interest in food.
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  stealTiles(lb: LogBuilder): void {
    let spec = this.getSpecification();
    let tile = this.colony.getTile$();
    let player = this.colony.getOwner();
    let hasDefender = CollectionUtils.any$Stream$Predicate(tile.getUnits(), (u) => u.isDefensiveUnit() && this.getAIUnit(u).hasDefendSettlementMission());
    if (!hasDefender) {
      return;
    }
    let needed = CollectionUtils.transform$Collection$Predicate(spec.getRawBuildingGoodsTypeList(), (gt) => this.colony.getTotalProductionOf(gt) <= 0);
    let unitType = spec.getDefaultUnitType$Player(player);
    let steal = null;
    let score = 1;
    for (const $it13 = tile.getSurroundingTiles$int(1).iterator(); $it13.hasNext(); ) {
      let t = $it13.next();
      let owner = t.getOwner();
      if (owner == null || owner === player || owner.isEuropean() || !player.canClaimForSettlement(t)) {
        continue;
      }
      if (owner.atWarWith(player)) {
        if (AIMessage.askClaimLand$Tile$AIColony$int(t, this, Constants.STEAL_LAND) && player.owns(t)) {
          lb.add([', stole tile ', t, ' from hostile ', owner.getName()]);
        }
      } else {
        let s = (CollectionUtils.sumDouble$Collection$ToDoubleFunction(needed, (gt) => t.getPotentialProduction(gt, unitType))) + (CollectionUtils.sumDouble$Collection$ToDoubleFunction(spec.getFoodGoodsTypeList(), (ft) => 0.1 * t.getPotentialProduction(ft, unitType)));
        if (s > score) {
          score = s;
          steal = t;
        }
      }
    }
    if (steal != null) {
      let owner = steal.getOwner();
      if (AIMessage.askClaimLand$Tile$AIColony$int(steal, this, Constants.STEAL_LAND) && player.owns(steal)) {
        lb.add([', stole tile ', steal, ' (score = ', $J.boxD(score), ') from ', owner.getName()]);
      }
    }
  }
  /**
   * Something bad happened, there is no remaining unit working in
   * the colony.
   *
   * Throwing an exception stalls the AI and wrecks the colony in a
   * weird way.  Try to recover by hopefully finding a unit outside
   * the colony and stuffing it into the town hall.
   *
   * @return True if autodestruction has been averted.
   */
  avertAutoDestruction(): boolean {
    let lb = new LogBuilder()._LogBuilder(64);
    lb.add(['Colony ', this.colony.getName(), ' rearrangement leaves no units, ', this.colony.getTile$().getUnitCount(), ' available:']);
    for (const $it14 = this.colony.getTile$().getUnitList().iterator(); $it14.hasNext(); ) {
      let u = $it14.next();
      lb.add([' ', u]);
    }
    let libertyGoods = this.getSpecification().getLibertyGoodsTypeList();
    out:
    for (const $it15 = (CollectionUtils.transform$Stream$Predicate(this.colony.getTile$().getUnits(), ($p0) => $p0.isPerson())).iterator(); $it15.hasNext(); ) {
      let u = $it15.next();
      for (const $it16 = (CollectionUtils.transform$Stream$Predicate(this.colony.getAvailableWorkLocations(), (w) => w.canAdd(u))).iterator(); $it16.hasNext(); ) {
        let wl = $it16.next();
        for (const $it17 = libertyGoods.iterator(); $it17.hasNext(); ) {
          let type$ = $it17.next();
          if (wl.getPotentialProduction(type$, u.getType()) > 0 && AIMessage.askWork(this.getAIUnit(u), wl) && u.getLocation() === wl) {
            AIMessage.askChangeWorkType(this.getAIUnit(u), type$);
            lb.add([', averts destruction with ', u]);
            break out;
          }
        }
      }
    }
    lb.log(AIColony.logger, Level.WARNING);
    return this.colony.getUnitCount() > 0;
  }
  /**
   * Stop using a work location.
   *
   * Called from BuildColonyMission to clear a colony tile that is about
   * to have a colony built on it.
   *
   * @param wl The {@code WorkLocation} to stop using.
   */
  stopUsing(wl: WorkLocation): void {
    for (const $it18 = wl.getUnitList().iterator(); $it18.hasNext(); ) {
      let u = $it18.next();
      AIMessage.askPutOutsideColony(this.getAIUnit(u));
    }
    if (this.colony.getUnitCount() <= 0) {
      this.avertAutoDestruction();
    }
    this.rearrangeTurn = new Turn()._Turn(this.getGame().getTurn().getNumber());
  }
  /**
   * Gets the goods to be exported from this AI colony.
   *
   * @return A copy of the exportGoods list.
   */
  getExportGoods(): List<AIGoods> {
    {
      return new ArrayList(this.exportGoods);
    }
  }
  /**
   * Clear the export goods.
   */
  clearExportGoods(): void {
    {
      this.exportGoods.clear();
    }
  }
  /**
   * Add to the export goods list, and resort.
   *
   * @param aiGoods The {@code AIGoods} to add.
   */
  addExportGoods(aiGoods: AIGoods): void {
    {
      this.exportGoods.add(aiGoods);
    }
  }
  /**
   * Set the export goods list.
   *
   * @param aiGoods The new list of {@code AIGoods}.
   */
  setExportGoods(aiGoods: List<AIGoods>): void {
    this.clearExportGoods();
    {
      this.exportGoods.addAll(aiGoods);
    }
    this.sortExportGoods();
  }
  /**
   * Sort the export goods.
   */
  sortExportGoods(): void {
    if (this.exportGoods == null) {
      return;
    }
    {
      this.exportGoods.sort(ValuedAIObject.descendingValueComparator);
    }
  }
  /**
   * Removes the given {@code AIGoods} from the export goods
   * for this colony.  The {@code AIGoods}-object is not
   * disposed as part of this operation.  Use dropExportGoods
   * instead to remove the object completely (this method would then
   * be called indirectly).
   *
   * @param ag The {@code AIGoods} to be removed.
   * @see AIGoods#dispose()
   */
  removeExportGoods(ag: AIGoods): void {
    {
      while (this.exportGoods.remove(ag)) {
      }
    }
  }
  /**
   * Drops some goods from the goods list, and cancels any transport.
   *
   * @param ag The {@code AIGoods} to drop.
   */
  dropExportGoods(ag: AIGoods): void {
    let transport = ag.getTransport();
    if (transport != null) {
      transport.removeTransportable(ag);
    }
    this.removeExportGoods(ag);
    ag.dispose();
  }
  /**
   * Emits a standard message regarding the state of AIGoods.
   *
   * @param ag The {@code AIGoods} to log.
   * @param action The state of the goods.
   * @param lb A {@code LogBuilder} to log to.
   */
  goodsLog(ag: AIGoods, action: string, lb: LogBuilder): void {
    let goods = (ag == null) ? null : ag.getGoods();
    let amount = (goods == null) ? -1 : goods.getAmount();
    let type$ = (goods == null) ? '(null)' : ag.getGoods().getType().getSuffix$();
    lb.add([', ', action, ' ', ((ag == null) ? '(null)' : ag.getId()), ' ', ((amount >= GoodsContainer.CARGO_SIZE) ? 'full ' : String(amount) + ' '), type$]);
  }
  /**
   * Creates a list of the goods which should be shipped out of this colony.
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  updateExportGoods(lb: LogBuilder): void {
    if (this.colony.hasAbility$String(Ability.EXPORT)) {
      for (const $it19 = this.getExportGoods().iterator(); $it19.hasNext(); ) {
        let aig = $it19.next();
        this.goodsLog(aig, 'customizes', lb);
        this.dropExportGoods(aig);
      }
    } else {
      for (const $it20 = this.getExportGoods().iterator(); $it20.hasNext(); ) {
        let aig = $it20.next();
        if (aig == null) {
        } else if (!aig.checkIntegrity$boolean(false).safe()) {
          this.goodsLog(aig, 'reaps', lb);
          this.dropExportGoods(aig);
        } else if (aig.getGoods().getLocation() !== this.colony) {
          this.goodsLog(aig, 'sends', lb);
          this.removeExportGoods(aig);
        } else if (this.colony.getAdjustedNetProductionOf(aig.getGoods().getType()) < 0) {
          this.goodsLog(aig, 'needs', lb);
          this.dropExportGoods(aig);
        }
      }
      let europe = this.colony.getOwner().getEurope();
      let capacity = this.colony.getWarehouseCapacity();
      let newAIGoods = new ArrayList();
      outer:
      for (const $it21 = this.getSpecification().getGoodsTypeList().iterator(); $it21.hasNext(); ) {
        let gt = $it21.next();
        if (this.colony.getAdjustedNetProductionOf(gt) < 0) {
          continue;
        }
        let count = this.colony.getGoodsCount(gt);
        let exportAmount = AIColony.fullExport.contains(gt) || AIColony.partExport.contains(gt) ? count : -1;
        if (exportAmount <= 0) {
          continue;
        }
        let priority = (exportAmount >= capacity) ? TransportableAIObject.IMPORTANT_DELIVERY : (exportAmount >= GoodsContainer.CARGO_SIZE) ? TransportableAIObject.FULL_DELIVERY : 0;
        for (const $it22 = this.getExportGoods().iterator(); $it22.hasNext(); ) {
          let aig = $it22.next();
          let goods = aig.getGoods();
          if (goods.getType() === gt) {
            let amount = goods.getAmount();
            if (amount <= exportAmount) {
              goods.setAmount(exportAmount);
              this.goodsLog(aig, 'updates', lb);
              newAIGoods.add(aig);
            } else {
              if (exportAmount >= AIColony.EXPORT_MINIMUM) {
                goods.setAmount(exportAmount);
                this.goodsLog(aig, 'clamps', lb);
                newAIGoods.add(aig);
              } else {
                this.goodsLog(aig, 'unexports', lb);
                this.dropExportGoods(aig);
              }
            }
            continue outer;
          }
        }
        let destination = (this.colony.getOwner().canTrade$GoodsType(gt)) ? europe : null;
        if (exportAmount >= AIColony.EXPORT_MINIMUM) {
          let newGoods = new AIGoods()._AIGoods$AIMain$Location$GoodsType$int$Location(this.getAIMain(), this.colony, gt, exportAmount, destination);
          newGoods.setTransportPriority(priority);
          newAIGoods.add(newGoods);
          this.goodsLog(newGoods, 'makes', lb);
        }
      }
      this.setExportGoods(newAIGoods);
    }
  }
  /**
   * Clear the wishes.
   */
  clearWishes(): void {
    this.wishes.clear();
  }
  /**
   * Adds a {@code Wish} to the wishes list.
   *
   * @param wish The {@code Wish} to be added.
   */
  addWish(wish: Wish): void {
    this.wishes.add(wish);
  }
  /**
   * Tries to complete a supplied wish.
   *
   * @param wish The {@code Wish} to complete.
   * @param reason A reason for wish completion.
   * @param lb A {@code LogBuilder} to log to.
   * @return True if this wish was successfully completed.
   */
  completeWish$Wish$String$LogBuilder(wish: Wish, reason: string, lb: LogBuilder): boolean {
    if (!this.wishes.remove(wish)) {
      lb.add([', ', reason, ' not wished for at ', this.colony.getName()]);
      return false;
    }
    this.getAIOwner().completeWish(wish);
    lb.add([', ', reason, ' fulfills at ', this.colony.getName()]);
    wish.dispose();
    this.requestRearrange();
    return true;
  }
  /**
   * Tries to complete any wishes for some goods that have just arrived.
   *
   * @param goods Some {@code Goods} that are arriving in this colony.
   * @param lb A {@code LogBuilder} to log to.
   * @return True if a wish was successfully completed.
   */
  completeWish$Goods$LogBuilder(goods: Goods, lb: LogBuilder): boolean {
    let ret = false;
    for (const $it23 = (CollectionUtils.transform$Collection$Predicate(this.wishes, (w) => w.satisfiedBy$AbstractGoods(goods))).iterator(); $it23.hasNext(); ) {
      let wish = $it23.next();
      ret = !!(ret | this.completeWish$Wish$String$LogBuilder(wish, goods.toString(), lb));
    }
    return ret;
  }
  /**
   * Tries to complete any wishes for a unit that has just arrived.
   *
   * @param unit A {@code Unit} that is arriving in this colony.
   * @param lb A {@code LogBuilder} to log to.
   * @return True if a wish was successfully completed.
   */
  completeWish$Unit$LogBuilder(unit: Unit, lb: LogBuilder): boolean {
    let ret = false;
    for (const $it24 = (CollectionUtils.transform$Collection$Predicate(this.wishes, (w) => w.satisfiedBy$Unit(unit))).iterator(); $it24.hasNext(); ) {
      let wish = $it24.next();
      ret = !!(ret | this.completeWish$Wish$String$LogBuilder(wish, unit.toShortString(), lb));
    }
    return ret;
  }
  /**
   * Tries to complete any wishes for a transportable that has just arrived.
   *
   * @param t The arriving {@code TransportableAIObject}.
   * @param lb A {@code LogBuilder} to log to.
   * @return True if a wish was successfully completed.
   */
  completeWish$TransportableAIObject$LogBuilder(t: TransportableAIObject, lb: LogBuilder): boolean {
    if (t instanceof AIGoods) {
      return this.completeWish$Goods$LogBuilder(t.getTransportLocatable(), lb);
    } else if (t instanceof AIUnit) {
      let aiUnit = t;
      if (aiUnit.isCompleteWishRealizationMission(this.colony)) {
        lb.add([', at wish-target']);
        this.completeWish$Unit$LogBuilder(aiUnit.getUnit(), lb);
        aiUnit.removeMission();
        return true;
      }
    }
    return false;
  }
  /**
   * Gets the wishes this colony has.
   *
   * @return A copy of the wishes list.
   */
  getWishes(): List<Wish> {
    return new ArrayList(this.wishes);
  }
  /**
   * Gets the goods wishes this colony has.
   *
   * @return A copy of the wishes list with non-goods wishes removed.
   */
  getGoodsWishes(): List<GoodsWish> {
    return CollectionUtils.transform$Collection$Predicate$Function(this.wishes, (w) => w instanceof GoodsWish, (w) => w);
  }
  /**
   * Gets the worker wishes this colony has.
   *
   * @return A copy of the wishes list with non-worker wishes removed.
   */
  getWorkerWishes(): List<WorkerWish> {
    return CollectionUtils.transform$Collection$Predicate$Function(this.wishes, (w) => w instanceof WorkerWish, (w) => w);
  }
  /**
   * Requires a goods wish for a specified goods type be present at this
   * AI colony.  If one is already present, the amount specified here
   * takes precedence as it is more likely to be up to date.  The value
   * is treated as a minimum requirement.
   *
   * @param type The {@code GoodsType} to wish for.
   * @param amount The amount of goods wished for.
   * @param value The urgency of the wish.
   * @param lb A {@code LogBuilder} to log to.
   */
  requireGoodsWish(type$: GoodsType, amount: number, value: number, lb: LogBuilder): void {
    let gw = CollectionUtils.find$Collection$Predicate(this.wishes, (w) => w instanceof GoodsWish && (w).getGoodsType() === type$);
    if (gw != null) {
      gw.update(type$, amount, (gw.getValue() + 1) | 0);
      lb.add([', update ', gw]);
    } else {
      gw = new GoodsWish()._GoodsWish$AIMain$Location$int$int$GoodsType(this.getAIMain(), this.colony, value, amount, type$);
      this.wishes.add(gw);
      lb.add([', add ', gw]);
    }
  }
  /**
   * Requires a worker wish for a unit type to be provided to this AIColony.
   * If a suitable wish is already present, the expert and value parameters
   * take precedence as they are more likely to be up to date.
   *
   * @param type The {@code UnitType} to wish for.
   * @param expertNeeded Is an expert unit required?
   * @param value The urgency of the wish.
   * @param lb A {@code LogBuilder} to log to.
   */
  requireWorkerWish(type$: UnitType, expertNeeded: boolean, value: number, lb: LogBuilder): void {
    let ww = CollectionUtils.find$Collection$Predicate(this.wishes, (w) => w instanceof WorkerWish && (w).getUnitType() === type$);
    if (ww != null) {
      ww.update(type$, expertNeeded, (ww.getValue() + 1) | 0);
      lb.add([', update ', ww]);
    } else {
      ww = new WorkerWish()._WorkerWish$AIMain$Location$int$UnitType$boolean(this.getAIMain(), this.colony, value, type$, expertNeeded);
      this.wishes.add(ww);
      lb.add([', add ', ww]);
    }
  }
  /**
   * Updates the wishes for the {@code Colony}.
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  updateWishes(lb: LogBuilder): void {
    this.updateWorkerWishes(lb);
    this.updateGoodsWishes(lb);
    this.wishes.sort(ValuedAIObject.descendingValueComparator);
  }
  /**
   * Updates the worker wishes.
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  updateWorkerWishes(lb: LogBuilder): void {
    let spec = this.getSpecification();
    let baseValue = 25;
    let priorityMax = 50;
    let priorityDecay = 5;
    let multipleBonus = 5;
    let multipleMax = 5;
    let comp = CollectionUtils.cachingIntComparator((gt) => this.colony.getAdjustedNetProductionOf(gt));
    let producing = CollectionUtils.sort$Collection$Comparator(CollectionUtils.transform$Stream$Predicate$Function$Collector(CollectionUtils.flatten$Stream$Function(this.colony.getAvailableWorkLocations(), ($p0) => $p0.getUnits()), CollectionUtils.isNotNull$Function(($p0) => $p0.getWorkType()), (u) => u.getWorkType().getStoredAs(), Collectors.toSet()), comp);
    let experts = new TypeCountMap()._TypeCountMap();
    for (const $it25 = this.colony.getUnitList().iterator(); $it25.hasNext(); ) {
      let unit = $it25.next();
      let goods = unit.getWorkType();
      let expert = (goods == null || goods === unit.getType().getExpertProduction()) ? null : spec.getExpertForProducing(goods);
      if (expert != null) {
        experts.incrementCount(expert, 1);
      }
    }
    for (const $it26 = experts.keySet().iterator(); $it26.hasNext(); ) {
      let expert = $it26.next();
      let goods = expert.getExpertProduction();
      let value = (baseValue + (Math.max(0, (priorityMax - Math.imul(priorityDecay, producing.indexOf(goods))) | 0)) + (Math.imul(Math.min(multipleMax, (experts.getCount(expert) - 1) | 0), multipleBonus))) | 0;
      this.requireWorkerWish(expert, true, value, lb);
    }
    if (this.colonyPlan != null && experts.isEmpty() && this.colony.governmentChange((this.colony.getUnitCount() + 1) | 0) >= 0) {
      let needFood = this.colony.getFoodProduction() <= ((this.colony.getFoodConsumption() + this.colony.getOwner().getMaximumFoodConsumption()) | 0);
      let owner = this.colony.getOwner();
      let expert = spec.getDefaultUnitType$Player(owner);
      for (const $it27 = ((needFood) ? this.colonyPlan.getFoodPlans() : this.colonyPlan.getWorkPlans()).iterator(); $it27.hasNext(); ) {
        let plan = $it27.next();
        let location = plan.getWorkLocation();
        if (!location.canBeWorked()) {
          continue;
        }
        expert = spec.getExpertForProducing(plan.getGoodsType());
        break;
      }
      this.requireWorkerWish(expert, false, 50, lb);
    }
  }
  /**
   * Updates the goods wishes.
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  updateGoodsWishes(lb: LogBuilder): void {
    let spec = this.getSpecification();
    let goodsWishValue = 50;
    let required = new TypeCountMap()._TypeCountMap();
    let build = this.colony.getCurrentlyBuilding();
    if (build != null) {
      for (const $it28 = build.getRequiredGoodsList$().iterator(); $it28.hasNext(); ) {
        let ag = $it28.next();
        if (this.colony.getAdjustedNetProductionOf(ag.getType()) <= 0) {
          required.incrementCount(ag.getType(), ag.getAmount());
        }
      }
    }
    for (const $it29 = this.tileImprovementPlans.iterator(); $it29.hasNext(); ) {
      let plan = $it29.next();
      let role = plan.getType().getRequiredRole();
      if (role == null) {
        continue;
      }
      for (const $it30 = role.getRequiredGoodsList$().iterator(); $it30.hasNext(); ) {
        let ag = $it30.next();
        required.incrementCount(ag.getType(), ag.getAmount());
      }
    }
    CollectionUtils.forEach$Stream$Consumer(CollectionUtils.map$Stream$Function(CollectionUtils.flatten$Stream$Predicate$Function(this.colony.getCurrentWorkLocations(), (wl) => !wl.getProductionInfo().atMaximumProduction(), ($p0) => $p0.getInputs()), ($p0) => $p0.getType()), (gt) => required.incrementCount(gt, 100));
    for (const $it31 = (CollectionUtils.transform$Collection$Predicate(spec.getGoodsTypeList(), (g) => (g.isBreedable() && this.colony.getGoodsCount(g) < g.getBreedingNumber()))).iterator(); $it31.hasNext(); ) {
      let gt = $it31.next();
      required.incrementCount(gt, gt.getBreedingNumber());
    }
    for (const $it32 = (CollectionUtils.transform$Collection$Predicate(this.wishes, (w) => {
      if (w instanceof GoodsWish) {
        let t = (w).getGoodsType();
        return required.getCount(t) < this.colony.getGoodsCount(t);
      } else {
        return false;
      }
    })).iterator(); $it32.hasNext(); ) {
      let wish = $it32.next();
      this.completeWish$Wish$String$LogBuilder(wish, 'redundant', lb);
    }
    for (const $it33 = required.keySet().iterator(); $it33.hasNext(); ) {
      let type$ = $it33.next();
      let requiredType = type$;
      while (requiredType != null) {
        if (requiredType.isStorable()) {
          break;
        }
        requiredType = requiredType.getInputType();
      }
      if (requiredType == null) {
        continue;
      }
      let amount = Math.min(this.colony.getWarehouseCapacity(), ((required.getCount(type$) - this.colony.getGoodsCount(requiredType)) | 0));
      if (amount > 0) {
        let value = goodsWishValue;
        if (this.colony.canProduce(requiredType)) {
          value = $J.idiv(value, 10);
        }
        this.requireGoodsWish(requiredType, amount, value, lb);
      }
    }
  }
  /**
   * Clear the tile improvement plans.
   */
  clearTileImprovementPlans(): void {
    this.tileImprovementPlans.clear();
  }
  /**
   * Add a tile improvement plan.
   *
   * @param plan The new {@code TileImprovementPlan} to add.
   */
  addTileImprovementPlan(plan: TileImprovementPlan): void {
    this.tileImprovementPlans.add(plan);
  }
  /**
   * Gets the tile improvements planned for this colony.
   *
   * @return A copy of the tile improvement plan list.
   */
  getTileImprovementPlans(): List<TileImprovementPlan> {
    return new ArrayList(this.tileImprovementPlans);
  }
  /**
   * Removes a {@code TileImprovementPlan} from the list
   *
   * @param plan The {@code TileImprovementPlan} to remove.
   * @return True if it was successfully deleted, false otherwise
   */
  removeTileImprovementPlan(plan: TileImprovementPlan): boolean {
    return this.tileImprovementPlans.remove(plan);
  }
  /**
   * Gets the first plan for a specified tile from a list of tile
   * improvement plans.
   *
   * @param tile The {@code Tile} to look for.
   * @param plans A list of {@code TileImprovementPlan}s to search.
   * @return A matching plan, or null if not found.
   */
  getPlanFor(tile: Tile, plans: List<TileImprovementPlan>): TileImprovementPlan {
    return CollectionUtils.find$Collection$Predicate(plans, (tip) => tip.getTarget() === tile);
  }
  /**
   * Creates a list of the {@code Tile}-improvements which will
   * increase the production by this {@code Colony}.
   *
   * Public for the test suite.
   *
   * @see TileImprovementPlan
   * @param lb A {@code LogBuilder} to log to.
   */
  updateTileImprovementPlans(lb: LogBuilder): void {
    let wls = CollectionUtils.transform$Stream$Predicate(this.colony.getAvailableWorkLocations(), (w) => w instanceof ColonyTile);
    let newPlans = new ArrayList(wls.size());
    for (const $it34 = wls.iterator(); $it34.hasNext(); ) {
      let wl = $it34.next();
      let workTile = wl.getWorkTile();
      let colonyTile = wl;
      if (workTile.getOwningSettlement() !== this.colony || this.getPlanFor(workTile, newPlans) != null) {
        continue;
      }
      let goodsType: GoodsType;
      if (colonyTile.isColonyCenterTile()) {
        let food = CollectionUtils.find$Collection$Predicate(wl.getProduction(), ($p0) => $p0.isFoodType());
        goodsType = (food == null) ? null : food.getType();
      } else {
        goodsType = (wl.isEmpty()) ? null : wl.getCurrentWorkType();
      }
      if (goodsType == null) {
        continue;
      }
      let plan = this.getPlanFor(workTile, this.tileImprovementPlans);
      if (plan == null) {
        let type$ = TileImprovementPlan.getBestTileImprovementType(workTile, goodsType);
        if (type$ != null) {
          plan = new TileImprovementPlan()._TileImprovementPlan$AIMain$Tile$TileImprovementType$int(this.getAIMain(), workTile, type$, type$.getImprovementValue$Tile$GoodsType(workTile, goodsType));
        }
      } else {
        if (!plan.update(goodsType)) {
          plan = null;
        }
      }
      if (plan == null) {
        continue;
      }
      let change = plan.getType().getChange(workTile.getType());
      let forestPred = (cwl) => cwl instanceof ColonyTile && !(cwl).isColonyCenterTile() && cwl.getWorkTile().isForested();
      if (change != null && !change.isForested() && !colonyTile.isColonyCenterTile() && CollectionUtils.count$Stream$Predicate(this.colony.getAvailableWorkLocations(), forestPred) <= AIColony.FOREST_MINIMUM) {
        continue;
      }
      newPlans.add(plan);
    }
    this.clearTileImprovementPlans();
    this.tileImprovementPlans.addAll(newPlans);
    this.tileImprovementPlans.sort(ValuedAIObject.descendingValueComparator);
    if (!this.tileImprovementPlans.isEmpty()) {
      lb.add([', improve:']);
      for (const $it35 = this.tileImprovementPlans.iterator(); $it35.hasNext(); ) {
        let tip = $it35.next();
        lb.add([' ', tip.getTarget(), '-', tip.getType().getSuffix$()]);
      }
    }
  }
  /**
   * Get the list of buildables in the colony plan.
   *
   * Public for the test suite.
   *
   * @return A list of planned {@code BuildableType}.
   */
  getPlannedBuildableTypes(): List<BuildableType> {
    return (this.colonyPlan == null) ? Collections.emptyList() : this.colonyPlan.getBuildableTypes();
  }
  /**
   * Summarize the colony plan as a string.
   *
   * @return A summary of the colony plan.
   */
  planToString(): string {
    if (this.colonyPlan == null) {
      return 'No plan.';
    }
    let lb = new LogBuilder()._LogBuilder(256);
    lb.add([this.colonyPlan, '\n\nTILE IMPROVEMENTS:\n']);
    for (const $it36 = this.getTileImprovementPlans().iterator(); $it36.hasNext(); ) {
      let tip = $it36.next();
      lb.add([tip, '\n']);
    }
    lb.add(['\n\nWISHES:\n']);
    for (const $it37 = this.getWishes().iterator(); $it37.hasNext(); ) {
      let w = $it37.next();
      lb.add([w, '\n']);
    }
    lb.add(['\n\nEXPORT GOODS:\n']);
    for (const $it38 = this.getExportGoods().iterator(); $it38.hasNext(); ) {
      let aig = $it38.next();
      lb.add([aig, '\n']);
    }
    return lb.toString();
  }
  /**
   * Handle REARRANGE_WORKERS property change events.
   *
   * @param event The {@code PropertyChangeEvent}.
   */
  propertyChange(event: PropertyChangeEvent): void {
    AIColony.logger.finest('Property change REARRANGE_WORKERS fired.');
    this.requestRearrange();
    if (event != null && event.getOldValue() instanceof GoodsType) {
      let goodsType = event.getOldValue();
      let left = this.colony.getGoodsCount(goodsType);
      for (const $it39 = this.getExportGoods().iterator(); $it39.hasNext(); ) {
        let aig = $it39.next();
        let remove = false;
        if (aig.isDisposed()) {
          remove = true;
        } else if (aig.getGoods() == null) {
          aig.changeTransport(null);
          remove = true;
        } else if (aig.getGoodsType() === goodsType) {
          if (left > 0) {
            aig.getGoods().setAmount(left);
          } else {
            aig.changeTransport(null);
            remove = true;
          }
        }
        if (remove) {
          this.removeExportGoods(aig);
          break;
        }
      }
    }
  }
  /**
   * Sets the rearrangeTurn variable such that rearrangeColony will
   * run fully next time it is invoked.
   */
  requestRearrange(): void {
    this.rearrangeTurn = new Turn()._Turn(0);
  }
  /**
   * Disposes this {@code AIColony}.
   */
  dispose(): void {
    let ourGoodsPred = (aig) => !aig.isDisposed() && aig.getGoods() != null && aig.getGoods().getLocation() === this.colony;
    let objects = CollectionUtils.transform$Collection$Predicate$Function(this.getExportGoods(), ourGoodsPred, (aig) => aig);
    objects.addAll(this.wishes);
    this.clearWishes();
    objects.addAll(this.tileImprovementPlans);
    this.clearTileImprovementPlans();
    for (const $it40 = objects.iterator(); $it40.hasNext(); ) {
      let o = $it40.next();
      o.dispose();
    }
    this.colonyPlan = null;
    super.dispose();
  }
  /**
   * {@inheritDoc}
   */
  checkIntegrity$boolean$LogBuilder(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = super.checkIntegrity$boolean$LogBuilder(fix, lb);
    if (this.colony == null || this.colony.isDisposed()) {
      lb.add(['\n  Null colony: ', this.getId()]);
      result = result.fail();
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it41 = this.getExportGoods().iterator(); $it41.hasNext(); ) {
      let ag = $it41.next();
      if (!ag.checkIntegrity$boolean(true).safe()) {
        continue;
      }
      xw.writeStartElement(AIColony.AI_GOODS_LIST_TAG);
      xw.writeAttribute$String$FreeColObject(FreeColObject.ID_ATTRIBUTE_TAG, ag);
      xw.writeEndElement();
    }
    for (const $it42 = this.tileImprovementPlans.iterator(); $it42.hasNext(); ) {
      let tip = $it42.next();
      if (!tip.checkIntegrity$boolean(true).safe()) {
        continue;
      }
      xw.writeStartElement(AIColony.TILE_IMPROVEMENT_PLAN_LIST_TAG);
      xw.writeAttribute$String$FreeColObject(FreeColObject.ID_ATTRIBUTE_TAG, tip);
      xw.writeEndElement();
    }
    for (const $it43 = this.wishes.iterator(); $it43.hasNext(); ) {
      let w = $it43.next();
      let tag = (w instanceof GoodsWish) ? AIColony.GOODS_WISH_LIST_TAG : (w instanceof WorkerWish) ? AIColony.WORKER_WISH_LIST_TAG : null;
      if (!w.checkIntegrity$boolean(true).safe() || !w.shouldBeStored() || tag == null) {
        continue;
      }
      xw.writeStartElement(tag);
      xw.writeAttribute$String$FreeColObject(FreeColObject.ID_ATTRIBUTE_TAG, w);
      xw.writeEndElement();
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let aiMain = this.getAIMain();
    this.colony = xr.getAttribute$Game$String$Class$FreeColObject(aiMain.getGame(), FreeColObject.ID_ATTRIBUTE_TAG, $J.cls(Colony), null);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.baseInitialize();
    this.clearExportGoods();
    this.clearTileImprovementPlans();
    this.clearWishes();
    super.readChildren(xr);
    this.sortExportGoods();
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let aiMain = this.getAIMain();
    let tag = xr.getLocalName();
    if ($J.equals(AIColony.AI_GOODS_LIST_TAG, tag)) {
      this.addExportGoods(xr.makeAIObject(aiMain, FreeColObject.ID_ATTRIBUTE_TAG, $J.cls(AIGoods), null, true));
      xr.closeTag$String(AIColony.AI_GOODS_LIST_TAG);
    } else if ($J.equals(AIColony.GOODS_WISH_LIST_TAG, tag)) {
      this.addWish(xr.makeAIObject(aiMain, FreeColObject.ID_ATTRIBUTE_TAG, $J.cls(GoodsWish), null, true));
      xr.closeTag$String(AIColony.GOODS_WISH_LIST_TAG);
    } else if ($J.equals(AIColony.TILE_IMPROVEMENT_PLAN_LIST_TAG, tag) || $J.equals(AIColony.OLD_TILE_IMPROVEMENT_PLAN_LIST_TAG, tag)) {
      this.addTileImprovementPlan(xr.makeAIObject(aiMain, FreeColObject.ID_ATTRIBUTE_TAG, $J.cls(TileImprovementPlan), null, true));
      xr.closeTag$String(tag);
    } else if ($J.equals(AIColony.WORKER_WISH_LIST_TAG, tag)) {
      this.addWish(xr.makeAIObject(aiMain, FreeColObject.ID_ATTRIBUTE_TAG, $J.cls(WorkerWish), null, true));
      xr.closeTag$String(AIColony.WORKER_WISH_LIST_TAG);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return AIColony.TAG;
  }
  static $clinit() {
    AIColony.logger = Logger.getLogger($J.cls(AIColony).getName());
    AIColony.pioneerComparator = Comparator.reversed((Comparator.comparingInt(($p0) => $p0.getPioneerScore())));
    AIColony.scoutComparator = Comparator.reversed((Comparator.comparingInt(($p0) => $p0.getScoutScore())));
    AIColony.fullExport = new HashSet();
    AIColony.partExport = new HashSet();
  }
}

$J.define(AIColony, 'net.sf.freecol.server.ai.AIColony', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'net.sf.freecol.server.ai.AIObject', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.io.FreeColXMLReader': '_AIColony$AIMain$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.model.Colony': '_AIColony$AIMain$Colony', 'net.sf.freecol.server.ai.AIMain,java.lang.String': '_AIColony$AIMain$String' }, returns: { 'getXMLTagName': 'java.lang.String', 'getPlannedBuildableTypes': 'java.util.List', 'getTileImprovementPlans': 'java.util.List', 'getWorkerWishes': 'java.util.List', 'getGoodsWishes': 'java.util.List', 'getWishes': 'java.util.List', 'getExportGoods': 'java.util.List', 'isBadlyDefended': 'boolean', 'getAIOwner': 'net.sf.freecol.server.ai.AIPlayer', 'getColony': 'net.sf.freecol.common.model.Colony' }, meths: { 'checkIntegrity(boolean,net.sf.freecol.common.util.LogBuilder)': 'checkIntegrity$boolean$LogBuilder', 'completeWish(net.sf.freecol.server.ai.TransportableAIObject,net.sf.freecol.common.util.LogBuilder)': 'completeWish$TransportableAIObject$LogBuilder', 'completeWish(net.sf.freecol.common.model.Unit,net.sf.freecol.common.util.LogBuilder)': 'completeWish$Unit$LogBuilder', 'completeWish(net.sf.freecol.common.model.Goods,net.sf.freecol.common.util.LogBuilder)': 'completeWish$Goods$LogBuilder', 'completeWish(net.sf.freecol.server.ai.Wish,java.lang.String,net.sf.freecol.common.util.LogBuilder)': 'completeWish$Wish$String$LogBuilder' }, clinit: true, lazy: ['logger', 'pioneerComparator', 'scoutComparator', 'fullExport', 'partExport'] });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  ColonyTile = $J.load('net.sf.freecol.common.model.ColonyTile');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
  Turn = $J.load('net.sf.freecol.common.model.Turn');
  TypeCountMap = $J.load('net.sf.freecol.common.model.TypeCountMap');
  UnitWas = $J.load('net.sf.freecol.common.model.UnitWas');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  AIGoods = $J.load('net.sf.freecol.server.ai.AIGoods');
  AIMessage = $J.load('net.sf.freecol.server.ai.AIMessage');
  AIUnit = $J.load('net.sf.freecol.server.ai.AIUnit');
  ColonyPlan = $J.load('net.sf.freecol.server.ai.ColonyPlan');
  GoodsWish = $J.load('net.sf.freecol.server.ai.GoodsWish');
  TileImprovementPlan = $J.load('net.sf.freecol.server.ai.TileImprovementPlan');
  TransportableAIObject = $J.load('net.sf.freecol.server.ai.TransportableAIObject');
  ValuedAIObject = $J.load('net.sf.freecol.server.ai.ValuedAIObject');
  WorkerWish = $J.load('net.sf.freecol.server.ai.WorkerWish');
});
