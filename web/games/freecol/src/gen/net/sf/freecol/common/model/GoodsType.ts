// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/GoodsType.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collectors, Comparator, JFunction } from '../../../../../../jre/index.ts';
import { FreeColSpecObjectType } from './FreeColSpecObjectType.ts';

let Constants, Modifier, StringTemplate, CollectionUtils;

/**
 * A type of goods, derived from the specification.
 */
export class GoodsType extends FreeColSpecObjectType {
  static readonly TAG: string = 'goods-type';
  static readonly DEFAULT_PRODUCTION_WEIGHT: number = 1;
  static readonly DEFAULT_LOW_PRODUCTION_THRESHOLD: number = 0;
  static readonly DEFAULT_ZERO_PRODUCTION_FACTOR: number = 1;
  /**
   * A comparator to impose a useful order on goods types.
   */
  static goodsTypeComparator: Comparator<GoodsType> = null;
  /**
   * Is this a farmed goods type.
   */
  isFarmed_: boolean = false;
  /**
   * Is this a food type.
   */
  isFood: boolean = false;
  /**
   * Does this goods type ignore warehouse limits.
   */
  ignoreLimit: boolean = false;
  /**
   * Is this goods type native to the New World.
   */
  newWorldGoods: boolean = false;
  /**
   * Whether this type of goods is required for building equipment
   * that grants an offence bonus or defence bonus.
   */
  isMilitary: boolean = false;
  /**
   * Whether this type of goods is required for building. (Derived
   * attribute)
   */
  buildingMaterial: boolean = false;
  /**
   * Whether these are trade goods that can only be obtained in Europe.
   */
  tradeGoods: boolean = false;
  /**
   * Whether this type of goods can be stored in a warehouse.
   */
  storable: boolean = false;
  /**
   * What this goods type is stored as.
   */
  storedAs: GoodsType = null;
  /**
   * What this goods type is made from.
   */
  madeFrom: GoodsType = null;
  /**
   * What this goods type can make.  (Derived attribute)
   */
  makes: GoodsType = null;
  /**
   * The initial amount of this goods type in a market.
   */
  initialAmount: number = 0;
  /**
   * The initial <em>minimum</em> sales price for this type of goods.
   */
  initialPrice: number = 0;
  /**
   * The initial market price difference for this type of goods.
   */
  priceDiff: number = 0;
  /**
   * The number of units required to breed this type of goods. This
   * obviously only applies to animals.
   */
  breedingNumber: number = 0;
  /**
   * The price of this type of goods.  This is only used for goods
   * that can not be traded in the market, such as hammers.
   */
  price_: number = 0;
  /**
   * A weight for the potential production of this goods type at a
   * colony site.
   */
  productionWeight: number = 0;
  /**
   * A threshold amount of potential production of this goods type
   * at a colony site, below which the score for the site is reduced.
   */
  lowProductionThreshold: number = 0;
  /**
   * The multiplicative factor with which to penalize a colony site
   * with zero production of this goods type, scaling linearly to
   * unity when the amount reaches lowResourceThreshold.
   */
  zeroProductionFactor: number = 0;
  static readonly BREEDING_NUMBER_TAG: string = 'breeding-number';
  static readonly IGNORE_LIMIT_TAG: string = 'ignore-limit';
  static readonly INITIAL_AMOUNT_TAG: string = 'initial-amount';
  static readonly INITIAL_PRICE_TAG: string = 'initial-price';
  static readonly IS_FARMED_TAG: string = 'is-farmed';
  static readonly IS_FOOD_TAG: string = 'is-food';
  static readonly IS_MILITARY_TAG: string = 'is-military';
  static readonly LOW_PRODUCTION_THRESHOLD_TAG: string = 'low-production-threshold';
  static readonly MADE_FROM_TAG: string = 'made-from';
  static readonly MARKET_TAG: string = 'market';
  static readonly NEW_WORLD_GOODS_TAG: string = 'new-world-goods';
  static readonly PRICE_TAG: string = 'price';
  static readonly PRICE_DIFFERENCE_TAG: string = 'price-difference';
  static readonly PRODUCTION_WEIGHT_TAG: string = 'production-weight';
  static readonly STORABLE_TAG: string = 'storable';
  static readonly STORED_AS_TAG: string = 'stored-as';
  static readonly TRADE_GOODS_TAG: string = 'trade-goods';
  static readonly ZERO_PRODUCTION_FACTOR_TAG: string = 'zero-production-factor';
  /**
   * Create a new goods type.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _GoodsType(id: string, specification: Specification): this {
    this._FreeColSpecObjectType$String$Specification(id, specification);
    this.isMilitary = false;
    this.buildingMaterial = false;
    this.makes = null;
    this.breedingNumber = Constants.INFINITY;
    this.price_ = Constants.INFINITY;
    this.productionWeight = GoodsType.DEFAULT_PRODUCTION_WEIGHT;
    this.lowProductionThreshold = GoodsType.DEFAULT_LOW_PRODUCTION_THRESHOLD;
    this.zeroProductionFactor = GoodsType.DEFAULT_ZERO_PRODUCTION_FACTOR;
    return this;
  }
  /**
   * Is this a farmed goods type?
   *
   * @return True if this is a farmed goods type.
   */
  isFarmed(): boolean {
    return this.isFarmed_;
  }
  /**
   * Is this an edible goods type?
   *
   * @return True if this is a food type.
   */
  isFoodType(): boolean {
    return this.isFood;
  }
  /**
   * Is this goods type a military goods type?
   *
   * @return True if this is a military goods type.
   */
  getMilitary(): boolean {
    return this.isMilitary;
  }
  setMilitary(): void {
    this.isMilitary = true;
  }
  /**
   * Do warehouse storage limits not apply to this goods type?
   *
   * @return True if unlimited amounts of this goods type can be stored.
   */
  limitIgnored(): boolean {
    return this.ignoreLimit;
  }
  /**
   * Is this a goods type native to the New World?
   *
   * @return True if this goods type is native to the New World.
   */
  isNewWorldGoodsType(): boolean {
    return this.newWorldGoods;
  }
  /**
   * Is this goods type made from a New World goods type?
   *
   * @return True if this goods type is made from New World goods.
   */
  isNewWorldLuxuryType(): boolean {
    return this.madeFrom != null && this.madeFrom.isNewWorldGoodsType();
  }
  /**
   * Is this type of goods is required for building a BuildableType?
   *
   * @return True if this is a simple building material.
   * @see BuildableType
   */
  isBuildingMaterial(): boolean {
    return this.buildingMaterial;
  }
  /**
   * Is this a trade goods type?
   *
   * @return True if this goods type is trade goods.
   */
  isTradeGoods(): boolean {
    return this.tradeGoods;
  }
  /**
   * Does this type of goods produce liberty?
   *
   * @return True if this goods type produces liberty.
   */
  isLibertyType(): boolean {
    return this.containsModifierKey(Modifier.LIBERTY);
  }
  /**
   * Does this type of goods produce immigration?
   *
   * @return True if this goods type produces immigration.
   */
  isImmigrationType(): boolean {
    return this.containsModifierKey(Modifier.IMMIGRATION);
  }
  /**
   * Is this goods type storable?
   *
   * @return True if this goods type is storable.
   */
  isStorable(): boolean {
    return this.storable;
  }
  /**
   * Is this type of goods stored as something else?
   *
   * @return True if this type of goods is stored as another type.
   */
  isStoredAs(): boolean {
    return this.storedAs != null;
  }
  /**
   * What type of goods is this goods type stored as?
   *
   * @return The {@code GoodsType} this is stored as, usually itself.
   */
  getStoredAs(): GoodsType {
    return (this.storedAs == null) ? this : this.storedAs;
  }
  /**
   * Can this goods type be made into somthing?
   *
   * @return True if this {@code GoodsType} can be made into something.
   */
  isRawMaterial(): boolean {
    return this.makes != null;
  }
  /**
   * Is this goods type made from somthing?
   *
   * @return True if this {@code GoodsType} is made from something.
   */
  isRefined(): boolean {
    return this.madeFrom != null;
  }
  /**
   * What is this goods made into?
   *
   * @return The {@code GoodsType} this is made into, if anything.
   */
  getOutputType(): GoodsType {
    return this.makes;
  }
  /**
   * What is this goods type made from?
   *
   * @return The {@code GoodsType} this is made from, if anything.
   */
  getInputType(): GoodsType {
    return this.madeFrom;
  }
  /**
   * Get the default initial amount of this goods type in a market.
   *
   * @return The default initial amount.
   */
  getInitialAmount(): number {
    return this.initialAmount;
  }
  /**
   * Get the initial <em>minimum</em> sales price for this type
   * of goods.  The actual initial sales price in a particular
   * Market may be higher.  This method is only used for initializing
   * Markets.
   *
   * @return The initial sell price.
   * @see Market
   */
  getInitialSellPrice(): number {
    return this.initialPrice;
  }
  /**
   * The default initial purchase price for this goods type.
   *
   * @return The default initial purchase price.
   */
  getInitialBuyPrice(): number {
    return (this.initialPrice + this.priceDiff) | 0;
  }
  /**
   * The default initial price difference (between purchase and sale price)
   * for this type of goods.
   *
   * @return The default initial price difference.
   */
  getPriceDifference(): number {
    return this.priceDiff;
  }
  /**
   * Get the breeding number for this goods type.
   *
   * @return The breeding number.
   */
  getBreedingNumber(): number {
    return this.breedingNumber;
  }
  /**
   * Is this type of goods breedable?
   *
   * @return True if this {@code GoodsType} is breedable.
   */
  isBreedable(): boolean {
    return this.breedingNumber !== Constants.INFINITY;
  }
  /**
   * Get the price of a non-tradeable goods type.
   *
   * @return The price.
   */
  getPrice(): number {
    return this.price_;
  }
  setPrice(newPrice: number): void {
    this.price_ = newPrice;
  }
  /**
   * Get the production weight.
   *
   * @return The production weight.
   */
  getProductionWeight(): number {
    return this.productionWeight;
  }
  /**
   * Get the low production threshold.
   *
   * @return The low production threshold.
   */
  getLowProductionThreshold(): number {
    return this.lowProductionThreshold;
  }
  /**
   * Get the zero production factor.
   *
   * @return The zero production factor.
   */
  getZeroProductionFactor(): number {
    return this.zeroProductionFactor;
  }
  /**
   * Gets the i18n-ed name for this goods type.
   *
   * @return The name of this {@code GoodsType}.
   */
  getLabel(): StringTemplate {
    return StringTemplate.key$String(this.getNameKey());
  }
  /**
   * Gets the "workingAs" key for the profession that makes this goods type.
   *
   * @return The "workingAs" message key.
   */
  getWorkingAsKey(): string {
    return this.getId() + '.workingAs';
  }
  /**
   * Gets the production chain of the goods type, beginning with a
   * raw material that can not be produced from any other.  The last
   * member of the production chain is the goods type itself.
   *
   * Note that this does not really handle goods that are stored as
   * something else as is the case for grain etc.
   * FIXME: fix or retire this routine?
   *
   * @return The production chain of this {@code GoodsType} as
   *     a list.
   */
  getProductionChain(): List<GoodsType> {
    let result = new ArrayList();
    let currentGoods = this;
    while (currentGoods != null) {
      result.add(0, currentGoods);
      currentGoods = currentGoods.madeFrom;
    }
    return result;
  }
  /**
   * Is this type of goods required somewhere in the chain for
   * producing a BuildableType, and is not itself buildable.
   *
   * @return True if a raw building type.
   * @see BuildableType
   */
  isRawBuildingMaterial(): boolean {
    if (this.madeFrom != null) {
      return false;
    }
    let refinedType = this.makes;
    while (refinedType != null) {
      if (refinedType.isBuildingMaterial()) {
        return true;
      }
      refinedType = refinedType.makes;
    }
    return false;
  }
  /**
   * Is this type of goods required somewhere in the chain for
   * producing a BuildableType, and is not itself buildable.
   *
   * @return True if a raw building type.
   * @see BuildableType
   */
  isRawMaterialForUnstorableBuildingMaterial(): boolean {
    if (this.madeFrom != null) {
      return false;
    }
    let refinedType = this.makes;
    while (refinedType != null) {
      if (refinedType.isBuildingMaterial() && !refinedType.isStorable()) {
        return true;
      }
      refinedType = refinedType.makes;
    }
    return false;
  }
  /**
   * Get all the equivalent goods types, in the sense that they are
   * stored as this type.
   *
   * @return A set of equivalent {@code GoodsType}s, which
   *     must include this one.
   */
  getEquivalentTypes(): JSet<GoodsType> {
    return CollectionUtils.transform$Collection$Predicate$Function$Collector(this.getSpecification().getGoodsTypeList(), (gt) => gt === this || gt.getStoredAs() === this, JFunction.identity(), Collectors.toSet());
  }
  /**
   * Set the derived fields for the goods types in a specification.
   *
   * The "derived" fields are: buildingMaterial + makes
   * - buildingMaterial depends on whether a GoodsType is present on
   *   a BuildableType requiredGoods list
   * - makes depends on whether a GoodsType madeFrom field refers
   *   to another
   *   
   * This is called from Specification.clean() when the
   * specification is fully read.  We must wait until then as the
   * made-from field can change in extended specifications and mods.
   * The current example of which is horses, which is made-from food
   * in the classic ruleset and made-from grain in the freecol
   * ruleset.
   *
   * @param spec The {@code Specification} to operate on.
   */
  static setDerivedAttributes(spec: Specification): void {
    for (const $it0 = spec.getGoodsTypeList().iterator(); $it0.hasNext(); ) {
      let g = $it0.next();
      g.buildingMaterial = false;
      g.makes = null;
    }
    let buildableTypes = new ArrayList();
    buildableTypes.addAll(spec.getBuildingTypeList());
    buildableTypes.addAll(spec.getUnitTypeList());
    buildableTypes.addAll(spec.getRolesList());
    CollectionUtils.forEach$Stream$Consumer(CollectionUtils.flatten$Collection$Function(buildableTypes, ($p0) => $p0.getRequiredGoods$()), (ag) => ag.getType().buildingMaterial = true);
    for (const $it1 = spec.getGoodsTypeList().iterator(); $it1.hasNext(); ) {
      let g = $it1.next();
      if (g.madeFrom != null) {
        g.madeFrom.makes = g;
      }
    }
  }
  /**
   * Impose a general order on the goods types.
   *
   * @return An integer useful in comparators.
   */
  getRank(): number {
    return (!this.isStorable() || this.isTradeGoods()) ? -1 : (this.isFoodType()) ? 1 : (this.isNewWorldGoodsType()) ? 2 : (this.isFarmed()) ? 3 : (this.isRawMaterial()) ? 4 : (this.isNewWorldLuxuryType()) ? 5 : (this.isRefined()) ? 6 : -1;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(GoodsType));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.isFarmed_ = o.isFarmed();
    this.isFood = o.isFoodType();
    this.ignoreLimit = o.limitIgnored();
    this.newWorldGoods = o.isNewWorldGoodsType();
    this.isMilitary = o.getMilitary();
    this.buildingMaterial = o.isBuildingMaterial();
    this.tradeGoods = o.isTradeGoods();
    this.storable = o.isStorable();
    this.storedAs = o.getStoredAs();
    this.madeFrom = o.getInputType();
    this.makes = o.getOutputType();
    this.initialAmount = o.getInitialAmount();
    this.initialPrice = o.getInitialSellPrice();
    this.priceDiff = o.getPriceDifference();
    this.breedingNumber = o.getBreedingNumber();
    this.price_ = o.getPrice();
    this.productionWeight = o.getProductionWeight();
    this.lowProductionThreshold = o.getLowProductionThreshold();
    this.zeroProductionFactor = o.getZeroProductionFactor();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$boolean(GoodsType.IS_FARMED_TAG, this.isFarmed_);
    xw.writeAttribute$String$boolean(GoodsType.IS_FOOD_TAG, this.isFood);
    xw.writeAttribute$String$boolean(GoodsType.IS_MILITARY_TAG, this.isMilitary);
    xw.writeAttribute$String$boolean(GoodsType.IGNORE_LIMIT_TAG, this.ignoreLimit);
    xw.writeAttribute$String$boolean(GoodsType.NEW_WORLD_GOODS_TAG, this.newWorldGoods);
    xw.writeAttribute$String$boolean(GoodsType.TRADE_GOODS_TAG, this.tradeGoods);
    xw.writeAttribute$String$boolean(GoodsType.STORABLE_TAG, this.storable);
    if (this.breedingNumber !== Constants.INFINITY) {
      xw.writeAttribute$String$int(GoodsType.BREEDING_NUMBER_TAG, this.breedingNumber);
    }
    if (this.price_ !== Constants.INFINITY) {
      xw.writeAttribute$String$int(GoodsType.PRICE_TAG, this.price_);
    }
    if (this.madeFrom != null) {
      xw.writeAttribute$String$FreeColObject(GoodsType.MADE_FROM_TAG, this.madeFrom);
    }
    if (this.storedAs != null) {
      xw.writeAttribute$String$FreeColObject(GoodsType.STORED_AS_TAG, this.storedAs);
    }
    xw.writeAttribute$String$float(GoodsType.PRODUCTION_WEIGHT_TAG, this.productionWeight);
    if (this.lowProductionThreshold > GoodsType.DEFAULT_LOW_PRODUCTION_THRESHOLD) {
      xw.writeAttribute$String$float(GoodsType.LOW_PRODUCTION_THRESHOLD_TAG, this.lowProductionThreshold);
    }
    if (0 <= this.zeroProductionFactor && this.zeroProductionFactor < GoodsType.DEFAULT_ZERO_PRODUCTION_FACTOR) {
      xw.writeAttribute$String$float(GoodsType.ZERO_PRODUCTION_FACTOR_TAG, this.zeroProductionFactor);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    if (this.initialAmount > 0) {
      xw.writeStartElement(GoodsType.MARKET_TAG);
      xw.writeAttribute$String$int(GoodsType.INITIAL_AMOUNT_TAG, this.initialAmount);
      xw.writeAttribute$String$int(GoodsType.INITIAL_PRICE_TAG, this.initialPrice);
      xw.writeAttribute$String$int(GoodsType.PRICE_DIFFERENCE_TAG, this.priceDiff);
      xw.writeEndElement();
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let spec = this.getSpecification();
    this.isFarmed_ = xr.getAttribute$String$boolean(GoodsType.IS_FARMED_TAG, false);
    this.isFood = xr.getAttribute$String$boolean(GoodsType.IS_FOOD_TAG, false);
    this.isMilitary = xr.getAttribute$String$boolean(GoodsType.IS_MILITARY_TAG, false);
    this.ignoreLimit = xr.getAttribute$String$boolean(GoodsType.IGNORE_LIMIT_TAG, false);
    this.newWorldGoods = xr.getAttribute$String$boolean(GoodsType.NEW_WORLD_GOODS_TAG, false);
    this.tradeGoods = xr.getAttribute$String$boolean(GoodsType.TRADE_GOODS_TAG, false);
    this.breedingNumber = xr.getAttribute$String$int(GoodsType.BREEDING_NUMBER_TAG, Constants.INFINITY);
    this.price_ = xr.getAttribute$String$int(GoodsType.PRICE_TAG, Constants.INFINITY);
    this.madeFrom = xr.getType(spec, GoodsType.MADE_FROM_TAG, $J.cls(GoodsType), null);
    this.storable = xr.getAttribute$String$boolean(GoodsType.STORABLE_TAG, true);
    this.storedAs = xr.getType(spec, GoodsType.STORED_AS_TAG, $J.cls(GoodsType), null);
    this.productionWeight = xr.getAttribute$String$float(GoodsType.PRODUCTION_WEIGHT_TAG, GoodsType.DEFAULT_PRODUCTION_WEIGHT);
    this.lowProductionThreshold = xr.getAttribute$String$float(GoodsType.LOW_PRODUCTION_THRESHOLD_TAG, GoodsType.DEFAULT_LOW_PRODUCTION_THRESHOLD);
    this.zeroProductionFactor = xr.getAttribute$String$float(GoodsType.ZERO_PRODUCTION_FACTOR_TAG, GoodsType.DEFAULT_ZERO_PRODUCTION_FACTOR);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if ($J.equals(GoodsType.MARKET_TAG, tag)) {
      this.initialAmount = xr.getAttribute$String$int(GoodsType.INITIAL_AMOUNT_TAG, 0);
      this.initialPrice = xr.getAttribute$String$int(GoodsType.INITIAL_PRICE_TAG, 1);
      this.priceDiff = xr.getAttribute$String$int(GoodsType.PRICE_DIFFERENCE_TAG, 1);
      xr.closeTag$String(GoodsType.MARKET_TAG);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return GoodsType.TAG;
  }
  static $clinit() {
    GoodsType.goodsTypeComparator = Comparator.thenComparingKey((Comparator.comparingInt(($p0) => $p0.getRank())), JFunction.identity());
  }
}

$J.define(GoodsType, 'net.sf.freecol.common.model.GoodsType', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColSpecObjectType', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_GoodsType' }, returns: { 'getXMLTagName': 'java.lang.String', 'getRank': 'int', 'getEquivalentTypes': 'java.util.Set', 'isRawMaterialForUnstorableBuildingMaterial': 'boolean', 'isRawBuildingMaterial': 'boolean', 'getProductionChain': 'java.util.List', 'getWorkingAsKey': 'java.lang.String', 'getLabel': 'net.sf.freecol.common.model.StringTemplate', 'getZeroProductionFactor': 'float', 'getLowProductionThreshold': 'float', 'getProductionWeight': 'float', 'getPrice': 'int', 'isBreedable': 'boolean', 'getBreedingNumber': 'int', 'getPriceDifference': 'int', 'getInitialBuyPrice': 'int', 'getInitialSellPrice': 'int', 'getInitialAmount': 'int', 'getInputType': 'net.sf.freecol.common.model.GoodsType', 'getOutputType': 'net.sf.freecol.common.model.GoodsType', 'isRefined': 'boolean', 'isRawMaterial': 'boolean', 'getStoredAs': 'net.sf.freecol.common.model.GoodsType', 'isStoredAs': 'boolean', 'isStorable': 'boolean', 'isImmigrationType': 'boolean', 'isLibertyType': 'boolean', 'isTradeGoods': 'boolean', 'isBuildingMaterial': 'boolean', 'isNewWorldLuxuryType': 'boolean', 'isNewWorldGoodsType': 'boolean', 'getMilitary': 'boolean', 'isFoodType': 'boolean', 'isFarmed': 'boolean' }, clinit: true, lazy: ['goodsTypeComparator'] });
$J.module(() => {
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
