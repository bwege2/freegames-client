// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/WorkLocation.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Collections, Comparator, HashMap, IllegalStateException, JObject, Level, Logger, RuntimeException, Stream, UnsupportedOperationException } from '../../../../../../jre/index.ts';
import { UnitLocation } from './UnitLocation.ts';

let Ability, AbstractGoods, Colony, FreeColObject, GoodsType, Location, Occupation, Player$PlayerType, ProductionType, StringTemplate, Unit, Unit$UnitState, UnitLocation$NoAddReason, CollectionUtils, LogBuilder, Utils;

/**
 * The {@code WorkLocation} is a place in a {@link Colony} where
 * {@code Units} can work.  The unit capacity of a WorkLocation
 * is likely to be limited.  ColonyTiles can only hold a single
 * worker, and Buildings can hold no more than three workers, for
 * example.  WorkLocations do not store any Goods.  They take any
 * Goods they consume from the Colony, and put all Goods they produce
 * there, too.  Although the WorkLocation implements {@link Ownable},
 * its owner can not be changed directly, as it is always owned by the
 * owner of the Colony.
 */
export class WorkLocation extends UnitLocation {
  static logger: Logger = null;
  static EMPTY_LIST: List<AbstractGoods> = null;
  /**
   * The colony that contains this work location.
   */
  colony: Colony = null;
  /**
   * The production type of this WorkLocation.
   */
  productionType: ProductionType = null;
  static readonly COLONY_TAG: string = 'colony';
  /**
   * Constructor for ServerWorkLocation.
   *
   * @param game The enclosing {@code Game}.
   */
  _WorkLocation$Game(game: Game): this {
    this._UnitLocation$Game(game);
    return this;
  }
  /**
   * Creates a new {@code WorkLocation} with the given identifier.
   *
   * The object should be initialized later.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _WorkLocation$Game$String(game: Game, id: string): this {
    this._UnitLocation$Game$String(game, id);
    return this;
  }
  setColony(colony: Colony): void {
    this.colony = colony;
  }
  /**
   * Get the production type.
   *
   * @return The {@code ProductionType} for this work location.
   */
  getProductionType(): ProductionType {
    return this.productionType;
  }
  /**
   * Set the prodution type.
   *
   * @param newProductionType The new {@code ProductionType} value.
   */
  setProductionType(newProductionType: ProductionType): void {
    if (!Utils.equals(newProductionType, this.productionType)) {
      this.productionType = newProductionType;
      this.getColony().invalidateCache();
      WorkLocation.logger.fine('Production type at ' + $J.str(this) + ' is now: ' + $J.str(newProductionType));
    }
  }
  /**
   * Get the current work type of any unit present.
   *
   * This assumes that all units in a work location are doing the same
   * work, which is true for now.
   *
   * @return The current {@code GoodsType} being produced, or
   *     null if none.
   */
  getCurrentWorkType(): GoodsType {
    let unit = this.getFirstUnit();
    return (unit != null && unit.getType() != null) ? unit.getWorkType() : null;
  }
  /**
   * Update production type on the basis of the current work
   * location type (which might change due to an upgrade) and the
   * work type of units present.
   */
  updateProductionType(): void {
    this.setProductionType(this.getBestProductionType(this.isEmpty(), this.getCurrentWorkType()));
  }
  /**
   * Get the best available production type at this work location.
   *
   * @param unattended Whether to require unattended production.
   * @param workType An optional work type to require.
   * @return The best available {@code ProductionType} given the
   *     argument constraints.
   */
  getBestProductionType(unattended: boolean, workType: GoodsType): ProductionType {
    return ProductionType.getBestProductionType(workType, this.getAvailableProductionTypes(unattended));
  }
  /**
   * Gets the best occupation for a given unit at this work location.
   *
   * @param unit The {@code Unit} to find an
   *     {@code Occupation} for.
   * @param userMode If a user requested this, favour the current
   *     work type, if not favour goods that the unit requires.
   * @return An {@code Occupation} for the given unit, or
   *     null if none found.
   */
  getOccupation$Unit$boolean(unit: Unit, userMode: boolean): Occupation {
    let lb = new LogBuilder()._LogBuilder((this.getColony().getOccupationTrace()) ? 64 : 0);
    lb.add([this.getColony().getName(), '/', this, '.getOccupation(', unit, ')']);
    let best = new Occupation()._Occupation(null, null, null);
    let bestAmount = 0;
    for (const $it0 = this.getColony().getWorkTypeChoices(unit, userMode).iterator(); $it0.hasNext(); ) {
      let types = $it0.next();
      lb.add(['\n  ']);
      FreeColObject.logFreeColObjects(types, lb);
      bestAmount = best.improve$Unit$WorkLocation$int$Collection$LogBuilder(unit, this, bestAmount, types, lb);
      if (best.workType != null) {
        lb.add(['\n  => ', best]);
        break;
      }
    }
    if (best.workType == null) {
      lb.add(['\n  FAILED']);
    }
    lb.log(WorkLocation.logger, Level.WARNING);
    return (best.workType == null) ? null : best;
  }
  /**
   * Gets the best occupation for a given unit type at this work location.
   *
   * @param unitType An optional {@code UnitType} to find an
   *     {@code Occupation} for.  If null, use the default unit type.
   * @return An {@code Occupation} for the given unit, or
   *     null if none found.
   */
  getOccupation$UnitType(unitType: UnitType): Occupation {
    let spec = this.getSpecification();
    if (unitType == null) {
      unitType = spec.getDefaultUnitType$NationType(this.getOwner().getNationType());
    }
    let lb = new LogBuilder()._LogBuilder((this.getColony().getOccupationTrace()) ? 64 : 0);
    lb.add([this.getColony().getName(), '/', this, '.getOccupation(', unitType.getSuffix$(), ')']);
    let types = spec.getGoodsTypeList();
    let best = new Occupation()._Occupation(null, null, null);
    lb.add(['\n  ']);
    FreeColObject.logFreeColObjects(types, lb);
    let bestAmount = best.improve$UnitType$WorkLocation$int$Collection$LogBuilder(unitType, this, 0, types, lb);
    if (best.workType != null) {
      lb.add(['\n  => ', best, '/', bestAmount]);
    } else {
      lb.add(['\n  FAILED']);
    }
    lb.log(WorkLocation.logger, Level.WARNING);
    return (best.workType == null) ? null : best;
  }
  /**
   * Get the best work type for a unit at this work location, favouring
   * the existing work.
   *
   * @param unit The {@code Unit} to find a work type for.
   * @return The best work {@code GoodsType} for the unit, or null
   *     if none found.
   */
  getWorkFor(unit: Unit): GoodsType {
    let occupation = this.getOccupation$Unit$boolean(unit, true);
    return (occupation == null) ? null : occupation.workType;
  }
  /**
   * Install a unit at the best occupation for it at this work location.
   *
   * @param unit The {@code Unit} to install.
   * @return True if the installation succeeds.
   */
  setWorkFor(unit: Unit): boolean {
    let occupation = this.getOccupation$Unit$boolean(unit, false);
    return occupation != null && occupation.install(unit);
  }
  /**
   * Is it a good idea to produce a goods type at this work location
   * using a better unit type?
   *
   * @param unit The {@code Unit} that is doing the job at
   *     present, which may be null if none is at work.
   * @param productionType The {@code ProductionType} to use.
   * @param goodsType The {@code GoodsType} to produce.
   * @return A {@code Suggestion} for a better worker, or null if
   *     improvement is not worthwhile.
   */
  getSuggestion(unit: Unit, productionType: ProductionType, goodsType: GoodsType): WorkLocation$Suggestion {
    if (productionType == null || goodsType == null || ((unit == null || !this.contains(unit)) && this.isFull())) {
      return null;
    }
    let spec = this.getSpecification();
    let owner = this.getOwner();
    let expert = spec.getExpertForProducing(goodsType);
    let better = (expert != null) ? expert : spec.getDefaultUnitType$Player(owner);
    if (unit != null && better === unit.getType()) {
      return null;
    }
    let delta = this.getPotentialProduction(goodsType, better);
    if (unit != null) {
      delta = (delta - this.getPotentialProduction(goodsType, unit.getType())) | 0;
    }
    let prod = (ag) => this.getColony().getNetProductionOf(ag.getType());
    delta = Math.min(delta, CollectionUtils.min$Stream$ToIntFunction(productionType.getInputs(), prod));
    if (delta <= 0) {
      return null;
    }
    if (owner.getPlayerType() === Player$PlayerType.INDEPENDENT && ((goodsType.isLibertyType() && this.getColony().getSonsOfLiberty() >= 100) || goodsType.isImmigrationType())) {
      return null;
    }
    let ok = this.goodSuggestionCheck$UnitType$Unit$GoodsType(better, unit, goodsType);
    return (!ok) ? null : new WorkLocation$Suggestion()._WorkLocation$Suggestion(this, (unit == null) ? null : unit.getType(), better, goodsType, delta);
  }
  /**
   * Determines whether a {@code WorkLocation} is a good suggestion
   *
   * @param unitType The type of {@code Unit} to check.
   * @param unit The Unit itself.
   * @param goodsType The {@code GoodsType} to check.
   *
   * @return True or false, depending on whether the suggestion is valid.
   */
  goodSuggestionCheck$UnitType$Unit$GoodsType(unitType: UnitType, unit: Unit, goodsType: GoodsType): boolean {
    return this.goodSuggestionCheck$UnitType$Unit$GoodsType$WorkLocation(unitType, unit, goodsType, this);
  }
  /**
   * Determines whether a {@code WorkLocation} is a good suggestion
   *
   * @param unitType The type of {@code Unit} to check.
   * @param unit The Unit itself.
   * @param goodsType The {@code GoodsType} to check.
   * @param workLocation The {@code WorkLocation} to check. This can
   *     be overloaded with a default parameter of "this" to call
   *     the WorkLocation instance currently in in reference.
   * @return True or false, depending on whether the suggestion is valid.
   */
  goodSuggestionCheck$UnitType$Unit$GoodsType$WorkLocation(unitType: UnitType, unit: Unit, goodsType: GoodsType, workLocation: WorkLocation): boolean {
    return false;
  }
  /**
   * Get a map of suggestions for better or additional units.
   *
   * @return A mapping of either existing units or null (denoting
   *     adding a unit) to a {@code Suggestion}.
   */
  getSuggestions(): JMap<Unit, WorkLocation$Suggestion> {
    let result = new HashMap();
    if (!this.canBeWorked() || this.canTeach()) {
      return result;
    }
    let occ = this.getOccupation$UnitType(null);
    let work: GoodsType;
    let sug: WorkLocation$Suggestion;
    for (const $it1 = (CollectionUtils.transform$Stream$Predicate(this.getUnits(), CollectionUtils.isNull$Function(($p0) => $p0.getTeacher()))).iterator(); $it1.hasNext(); ) {
      let u = $it1.next();
      if ((work = u.getWorkType()) == null) {
        if (occ != null) {
          work = occ.workType;
        }
      }
      if ((sug = this.getSuggestion(u, this.getProductionType(), work)) != null) {
        result.put(u, sug);
      }
    }
    if (occ != null && (work = occ.workType) != null && !this.isFull() && (sug = this.getSuggestion(null, occ.productionType, work)) != null) {
      result.put(null, sug);
    }
    return result;
  }
  /**
   * Get the {@code AbstractGoods} consumed by this work location.
   *
   * @return A stream of {@code AbstractGoods} consumed.
   */
  getInputs(): Stream<AbstractGoods> {
    return (this.productionType == null) ? Stream.empty() : this.productionType.getInputs();
  }
  /**
   * Get the {@code AbstractGoods} produced by this work location.
   *
   * @return A stream of {@code AbstractGoods} produced.
   */
  getOutputs(): Stream<AbstractGoods> {
    return (this.productionType == null) ? Stream.empty() : this.productionType.getOutputs();
  }
  /**
   * Does this work location produce a given type of goods?
   *
   * @param goodsType The {@code GoodsType} to check.
   * @return True if this {@code WorkLocation} produces the
   *     given {@code GoodsType}.
   */
  produces(goodsType: GoodsType): boolean {
    return CollectionUtils.any$Stream$Predicate(this.getOutputs(), AbstractGoods.matches(goodsType));
  }
  /**
   * Does this work location have any inputs.
   *
   * @return True if there are any inputs.
   */
  hasInputs(): boolean {
    return CollectionUtils.any$Stream(this.getInputs());
  }
  /**
   * Does this work location have any outputs.
   *
   * @return True if there are any outputs.
   */
  hasOutputs(): boolean {
    return this.productionType != null && CollectionUtils.any$Stream(this.productionType.getOutputs());
  }
  /**
   * Checks if this work location can actually be worked.
   *
   * @return True if the work location can be worked.
   */
  canBeWorked(): boolean {
    return this.getNoWorkReason() === UnitLocation$NoAddReason.NONE;
  }
  /**
   * Does this work location have teaching capability?
   *
   * @return True if this is a teaching location.
   * @see Ability#TEACH
   */
  canTeach(): boolean {
    return this.hasAbility$String(Ability.TEACH);
  }
  /**
   * Gets the ProductionInfo for this WorkLocation from the Colony's
   * cache.
   *
   * @return The work location {@code ProductionInfo}.
   */
  getProductionInfo(): ProductionInfo {
    return this.getColony().getProductionInfo(this);
  }
  /**
   * Gets the production at this work location.
   *
   * @return The work location production.
   */
  getProduction(): List<AbstractGoods> {
    let info = this.getProductionInfo();
    return (info == null) ? WorkLocation.EMPTY_LIST : info.getProduction();
  }
  /**
   * Gets the total production of a specified goods type at this
   * work location.
   *
   * @param goodsType The {@code GoodsType} to check.
   * @return The amount of production.
   */
  getTotalProductionOf(goodsType: GoodsType): number {
    if (goodsType == null) {
      throw new RuntimeException('Null GoodsType: ' + $J.str(this));
    }
    return AbstractGoods.getCount(goodsType, this.getProduction());
  }
  /**
   * Gets the maximum production of this work location for a given
   * goods type, assuming the current workers and input goods.
   *
   * @param goodsType The {@code GoodsType} to check.
   * @return The maximum production of the goods at this work location.
   */
  getMaximumProductionOf(goodsType: GoodsType): number {
    let info = this.getProductionInfo();
    if (info == null) {
      return 0;
    }
    let production = info.getMaximumProduction();
    if (production != null) {
      let ag = CollectionUtils.find$Collection$Predicate(production, AbstractGoods.matches(goodsType));
      if (ag != null) {
        return ag.getAmount();
      }
    }
    return this.getTotalProductionOf(goodsType);
  }
  /**
   * Gets the unit type that is the expert for this work location
   * using its first output for which an expert type can be found.
   *
   * @return The expert {@code UnitType} or null if none found.
   */
  getExpertUnitType(): UnitType {
    let spec = this.getSpecification();
    let pt = this.getBestProductionType(false, null);
    return (pt == null) ? null : CollectionUtils.find$Stream$Predicate(CollectionUtils.map$Stream$Function(pt.getOutputs(), (ag) => spec.getExpertForProducing(ag.getType())), CollectionUtils.isNotNull$());
  }
  /**
   * Get the potential production of a given goods type using the
   * default unit.  This is useful for planning.
   *
   * @param goodsType The {@code GoodsType} to check.
   * @return The potential production.
   */
  getGenericPotential(goodsType: GoodsType): number {
    return this.getPotentialProduction(goodsType, this.getSpecification().getDefaultUnitType$Player(this.getOwner()));
  }
  /**
   * Gets the productivity of a unit working in this work location,
   * considering *only* the contribution of the unit, exclusive of
   * that of the work location.
   *
   * Used below, only public for the test suite.
   *
   * @param unit The {@code Unit} to check.
   * @param goodsType The {@code GoodsType} to check the production of.
   * @return The maximum return from this unit.
   */
  getUnitProduction(unit: Unit, goodsType: GoodsType): number {
    if (unit == null || unit.getWorkType() !== goodsType) {
      return 0;
    }
    let unitType = unit.getType();
    let turn = this.getGame().getTurn();
    return Math.max(0, $J.d2i(FreeColObject.applyModifiers$float$Turn$Stream(Math.fround(this.getBaseProduction(this.getProductionType(), goodsType, unitType)), turn, this.getProductionModifiers(goodsType, unitType))));
  }
  /**
   * Gets the production of a unit of the given type of goods.
   *
   * @param unit The unit to do the work.
   * @param goodsType The type of goods to get the production of.
   * @return The production of the given type of goods.
   */
  getProductionOf(unit: Unit, goodsType: GoodsType): number {
    if (unit == null) {
      throw new RuntimeException('Null unit: ' + $J.str(this));
    }
    return (!this.produces(goodsType)) ? 0 : Math.max(0, this.getPotentialProduction(goodsType, unit.getType()));
  }
  /**
   * Get the potential production of a given goods type at this
   * location.  An optional unit type to do the production may be
   * specified, however if null the unattended production will be
   * calculated.
   *
   * Usually if a unit type is specified and a unit can not be added
   * to the work location, zero production is returned.  However,
   * this routine is intended to be used for planning purposes, so
   * some exceptions are allowed --- the calculation proceeds:
   *
   *   - for unclaimed tiles
   *   - when the location is currently full of units
   *
   * which are conditions that an AI might plausibly be able and
   * willing to change (a case could be made for including the
   * OCCUPIED_BY_ENEMY condition).
   *
   * @param goodsType The {@code GoodsType} to produce.
   * @param unitType The optional {@code UnitType} to do the work.
   * @return The potential production with the given goods type and
   *     unit type.
   */
  getPotentialProduction(goodsType: GoodsType, unitType: UnitType): number {
    if (!this.canProduce(goodsType, unitType)) {
      return 0;
    }
    if (unitType != null) {
      switch (this.getNoWorkReason()) {
        case UnitLocation$NoAddReason.NONE:
        case UnitLocation$NoAddReason.ALREADY_PRESENT:
        case UnitLocation$NoAddReason.CLAIM_REQUIRED:
          break;
        case UnitLocation$NoAddReason.CAPACITY_EXCEEDED:
          if (this.getUnitCapacity() > 0) {
            break;
          }
        case UnitLocation$NoAddReason.WRONG_TYPE:
        case UnitLocation$NoAddReason.OWNED_BY_ENEMY:
        case UnitLocation$NoAddReason.ANOTHER_COLONY:
        case UnitLocation$NoAddReason.COLONY_CENTER:
        case UnitLocation$NoAddReason.MISSING_ABILITY:
        case UnitLocation$NoAddReason.MISSING_SKILL:
        case UnitLocation$NoAddReason.MINIMUM_SKILL:
        case UnitLocation$NoAddReason.MAXIMUM_SKILL:
        case UnitLocation$NoAddReason.OCCUPIED_BY_ENEMY:
        default:
          return 0;
      }
    }
    let amount = this.getBaseProduction(null, goodsType, unitType);
    amount = $J.d2i(FreeColObject.applyModifiers$float$Turn$Stream(Math.fround(amount), this.getGame().getTurn(), this.getProductionModifiers(goodsType, unitType)));
    return (amount < 0) ? 0 : amount;
  }
  /**
   * Helper to get the production deficit for a type of goods.
   *
   * @param goodsType The {@code GoodsType} to check.
   * @return The production deficit as {@code AbstractGoods}, or null
   *     if not in deficit.
   */
  getProductionDeficit(goodsType: GoodsType): AbstractGoods {
    let pi = this.getProductionInfo();
    return (pi == null) ? null : CollectionUtils.find$Collection$Predicate(pi.getProductionDeficit(), AbstractGoods.matches(goodsType));
  }
  /**
   * {@inheritDoc}
   */
  getLocationLabelFor(player: Player): StringTemplate {
    return (this.getOwner() === player) ? this.getLocationLabel() : this.getColony().getLocationLabelFor(player);
  }
  /**
   * {@inheritDoc}
   */
  getTile$(): Tile {
    return this.getSettlement().getTile$();
  }
  /**
   * {@inheritDoc}
   */
  add(locatable: Locatable): boolean {
    let reason = this.getNoAddReason(locatable);
    switch (reason) {
      case UnitLocation$NoAddReason.NONE:
        break;
      case UnitLocation$NoAddReason.ALREADY_PRESENT:
        return true;
      default:
        throw new IllegalStateException('Can not add ' + $J.str(locatable) + ' to ' + $J.str(this) + ' because ' + $J.str(reason));
    }
    let unit = locatable;
    if (!super.add(unit)) {
      return false;
    }
    unit.setState(Unit$UnitState.IN_COLONY);
    unit.setMovesLeft(0);
    this.setWorkFor(unit);
    this.getColony().invalidateCache();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  remove(locatable: Locatable): boolean {
    if (!(locatable instanceof Unit)) {
      throw new IllegalStateException('Not a unit: ' + $J.str(locatable));
    }
    let unit = locatable;
    if (!this.contains(unit)) {
      return true;
    }
    if (!super.remove(unit)) {
      return false;
    }
    unit.setState(Unit$UnitState.ACTIVE);
    unit.setMovesLeft(0);
    if (this.isEmpty()) {
      this.updateProductionType();
    }
    this.getColony().invalidateCache();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  getSettlement(): Settlement {
    return this.colony;
  }
  /**
   * {@inheritDoc}
   */
  getColony(): Colony {
    return this.colony;
  }
  /**
   * {@inheritDoc}
   */
  getRank(): number {
    return Location.rankOf(this.getTile$());
  }
  /**
   * {@inheritDoc}
   */
  getNoAddReason(locatable: Locatable): UnitLocation$NoAddReason {
    if (locatable instanceof Unit && (locatable).isDamaged()) {
      return UnitLocation$NoAddReason.WORKER_DAMAGED;
    }
    return (locatable instanceof Unit && (locatable).isPerson()) ? super.getNoAddReason(locatable) : UnitLocation$NoAddReason.WRONG_TYPE;
  }
  /**
   * Evaluate this work location for a given player.
   * To be overridden by subclasses.
   *
   * @param player The {@code Player} to evaluate for.
   * @return A value for the player.
   */
  evaluateFor(player: Player): number {
    let result = 0;
    for (const $it2 = this.getUnitList().iterator(); $it2.hasNext(); ) {
      let u = $it2.next();
      let v = u.evaluateFor(player);
      if (v === -2147483648) {
        return -2147483648;
      }
      result = (result + v) | 0;
    }
    return result;
  }
  /**
   * Gets a template describing whether this work location can/needs-to
   * be claimed.  To be overridden by classes where this is meaningful.
   *
   * This is a default null implementation.
   *
   * @return A suitable template.
   */
  getClaimTemplate(): StringTemplate {
    return StringTemplate.name_('');
  }
  /**
   * Gets the owner of this {@code Ownable}.
   *
   * @return The {@code Player} controlling this
   *         {@link Ownable}.
   */
  getOwner(): Player {
    let colony = this.getColony();
    return (colony == null) ? null : colony.getOwner();
  }
  /**
   * Sets the owner of this {@code Ownable}.  Do not call this
   * method, ever.  The owner of this WorkLocation is the owner
   * of the Colony, you must set the owner of the Colony instead.
   *
   * @param p The {@code Player} that should take ownership
   *     of this {@link Ownable}.
   * @exception UnsupportedOperationException is always thrown by
   *     this method.
   */
  setOwner(p: Player): void {
    throw new UnsupportedOperationException();
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(WorkLocation));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.colony = this.getGame().updateRef$FreeColGameObject(o.getColony());
    this.productionType = o.getProductionType();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(WorkLocation.COLONY_TAG, this.colony);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    if (this.productionType != null) {
      this.productionType.toXML$FreeColXMLWriter(xw);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.colony = xr.findFreeColGameObject(this.getGame(), WorkLocation.COLONY_TAG, $J.cls(Colony), null, true);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    let tag = xr.getLocalName();
    if ($J.equals(ProductionType.TAG, tag)) {
      this.productionType = new ProductionType()._ProductionType$FreeColXMLReader$Specification(xr, spec);
    } else {
      super.readChild(xr);
    }
  }
  static $clinit() {
    WorkLocation.logger = Logger.getLogger($J.cls(WorkLocation).getName());
    WorkLocation.EMPTY_LIST = Collections.emptyList();
  }
}

/**
 * Container class to suggest a better use of a unit.
 */
export class WorkLocation$Suggestion extends JObject {
  static descendingAmountComparator: Comparator<WorkLocation$Suggestion> = null;
  workLocation: WorkLocation = null;
  oldType: UnitType = null;
  newType_: UnitType = null;
  goodsType: GoodsType = null;
  amount: number = 0;
  /**
   * Suggest that work done by (optional) {@code oldType}
   * would be better done by {@code newType} because it
   * could produce {@code amount} more
   * {@code goodsType}.
   *
   * @param workLocation The {@code WorkLocation} to add
   *     a unit to.
   * @param oldType The optional {@code UnitType} currently
   *     doing the work.
   * @param newType A new {@code UnitType} to do the work.
   * @param goodsType The {@code GoodsType} to produce.
   * @param amount The extra goods that would be produced if the
   *     suggestion is taken.
   */
  _WorkLocation$Suggestion(workLocation: WorkLocation, oldType: UnitType, newType: UnitType, goodsType: GoodsType, amount: number): this {
    this.workLocation = workLocation;
    this.oldType = oldType;
    this.newType_ = newType;
    this.goodsType = goodsType;
    this.amount = amount;
    return this;
  }
  getNewUnitType(): UnitType {
    return this.newType_;
  }
  getGoodsType(): GoodsType {
    return this.goodsType;
  }
  getAmount(): number {
    return this.amount;
  }
  static $clinit() {
    WorkLocation$Suggestion.descendingAmountComparator = Comparator.thenComparingKey(Comparator.thenComparing(Comparator.reversed((Comparator.comparingInt(($p0) => $p0.getAmount()))), ($p0) => $p0.getGoodsType(), GoodsType.goodsTypeComparator), ($p0) => $p0.getNewUnitType());
  }
}

$J.define(WorkLocation, 'net.sf.freecol.common.model.WorkLocation', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Ownable'], sup: 'net.sf.freecol.common.model.UnitLocation', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_WorkLocation$Game$String', 'net.sf.freecol.common.model.Game': '_WorkLocation$Game' }, returns: { 'getOwner': 'net.sf.freecol.common.model.Player', 'getClaimTemplate': 'net.sf.freecol.common.model.StringTemplate', 'getRebelFactor': 'float', 'getCompetenceFactor': 'float', 'getLevel': 'int', 'getWorkTile': 'net.sf.freecol.common.model.Tile', 'getNoWorkReason': 'net.sf.freecol.common.model.UnitLocation$NoAddReason', 'isCurrent': 'boolean', 'isAvailable': 'boolean', 'getLabel': 'net.sf.freecol.common.model.StringTemplate', 'getRank': 'int', 'getColony': 'net.sf.freecol.common.model.Colony', 'getSettlement': 'net.sf.freecol.common.model.Settlement', 'getTile$': 'net.sf.freecol.common.model.Tile', 'getExpertUnitType': 'net.sf.freecol.common.model.UnitType', 'getProduction': 'java.util.List', 'getProductionInfo': 'net.sf.freecol.common.model.ProductionInfo', 'hasOutputs': 'boolean', 'hasInputs': 'boolean', 'getOutputs': 'java.util.stream.Stream', 'getInputs': 'java.util.stream.Stream', 'getSuggestions': 'java.util.Map', 'getCurrentWorkType': 'net.sf.freecol.common.model.GoodsType', 'getProductionType': 'net.sf.freecol.common.model.ProductionType' }, meths: { 'getTile()': 'getTile$', 'goodSuggestionCheck(net.sf.freecol.common.model.UnitType,net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.GoodsType,net.sf.freecol.common.model.WorkLocation)': 'goodSuggestionCheck$UnitType$Unit$GoodsType$WorkLocation', 'goodSuggestionCheck(net.sf.freecol.common.model.UnitType,net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.GoodsType)': 'goodSuggestionCheck$UnitType$Unit$GoodsType', 'getOccupation(net.sf.freecol.common.model.UnitType)': 'getOccupation$UnitType', 'getOccupation(net.sf.freecol.common.model.Unit,boolean)': 'getOccupation$Unit$boolean' }, clinit: true, lazy: ['logger', 'EMPTY_LIST'] });
$J.define(WorkLocation$Suggestion, 'net.sf.freecol.common.model.WorkLocation$Suggestion', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.WorkLocation,net.sf.freecol.common.model.UnitType,net.sf.freecol.common.model.UnitType,net.sf.freecol.common.model.GoodsType,int': '_WorkLocation$Suggestion' }, returns: { 'getAmount': 'int', 'getGoodsType': 'net.sf.freecol.common.model.GoodsType', 'getNewUnitType': 'net.sf.freecol.common.model.UnitType' }, clinit: true, lazy: ['descendingAmountComparator'] });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
  Location = $J.load('net.sf.freecol.common.model.Location');
  Occupation = $J.load('net.sf.freecol.common.model.Occupation');
  Player$PlayerType = $J.load('net.sf.freecol.common.model.Player$PlayerType');
  ProductionType = $J.load('net.sf.freecol.common.model.ProductionType');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  UnitLocation$NoAddReason = $J.load('net.sf.freecol.common.model.UnitLocation$NoAddReason');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
