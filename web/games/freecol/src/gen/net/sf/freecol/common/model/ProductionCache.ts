// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/ProductionCache.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap, HashSet, JObject } from '../../../../../../jre/index.ts';

let AbstractGoods, BuildQueue, Building, FeatureContainer, Modifier, ProductionInfo, ProductionMap, TypeCountMap, Unit, GameOptions, CollectionUtils;

/**
 * The {@code ProductionCache} is contains all relevant
 * information about the production and consumption of the
 * colony. This includes the production of all colony tiles and
 * buildings, as well as the consumption of all units, buildings and
 * build queues.
 */
export class ProductionCache extends JObject {
  /**
   * The colony whose production is being cached. The goods stored
   * in the colony may need to be considered in order to prevent
   * excess production.
   */
  colony: Colony = null;
  /**
   * A map of net production by goods type.
   */
  netProduction: TypeCountMap<GoodsType> = null;
  /**
   * A map of production info for various producers and consumers.
   */
  productionAndConsumption: JMap<any, ProductionInfo> = null;
  /**
   * A set of the goods used by the colony.
   */
  goodsUsed: JSet<GoodsType> = null;
  /**
   * Flag to indicate whether the cache is up to date, or not and
   * needs {@link #update} to be called.
   * Synchronize access to this variable.
   */
  upToDate: boolean = false;
  /**
   * Creates a new {@code ProductionCache} instance.
   *
   * @param colony a {@code Colony} value
   */
  _ProductionCache(colony: Colony): this {
    this.netProduction = new TypeCountMap()._TypeCountMap();
    this.productionAndConsumption = new HashMap();
    this.goodsUsed = new HashSet();
    this.upToDate = false;
    this.colony = colony;
    return this;
  }
  /**
   * Updates all data structures.
   *
   * Front end for reallyUpdate, split out to keep the wrapping of
   * upToDate distinct, and to make reallyUpdate visible when profiling.
   */
  update(): void {
    if (this.upToDate) {
      return;
    }
    this.reallyUpdate();
    this.upToDate = true;
  }
  /**
   * Really update everything.
   *
   * For now, there is a hard assumption that ColonyTiles do not
   * consume but Buildings do.  One day we may want to generalize
   * this, which will require processing the goods types in an order
   * sorted by the requirement dependencies.  But not yet.  This
   * assumption is made explicit by getting the ProductionInfo from
   * ColonyTiles with the simple getBasicProductionInfo() routine,
   * but from Buildings with getAdjustedProductionInfo() which takes
   * account of the input and output goods levels.
   *
   * FIXME: Ideally these should be unified into a
   * WorkLocation.getProductionInfo with the Building-form
   * arguments.
   */
  reallyUpdate(): void {
    let spec = this.colony.getSpecification();
    let bells = spec.getGoodsType('model.goods.bells');
    this.productionAndConsumption.clear();
    this.netProduction.clear();
    this.goodsUsed.clear();
    let production = new ProductionMap()._ProductionMap();
    for (const $it0 = this.colony.getColonyTiles().iterator(); $it0.hasNext(); ) {
      let colonyTile = $it0.next();
      let info = colonyTile.getBasicProductionInfo();
      production.add$List(info.getProduction());
      this.productionAndConsumption.put(colonyTile, info);
      for (const $it1 = info.getProduction().iterator(); $it1.hasNext(); ) {
        let goods = $it1.next();
        this.goodsUsed.add(goods.getType());
        this.netProduction.incrementCount(goods.getType().getStoredAs(), goods.getAmount());
      }
    }
    let unitsThatUseNoBells = spec.getInteger(GameOptions.UNITS_THAT_USE_NO_BELLS);
    let amount = Math.min(unitsThatUseNoBells, this.colony.getUnitCount());
    let bellsInfo = new ProductionInfo()._ProductionInfo();
    bellsInfo.addProduction$AbstractGoods(new AbstractGoods()._AbstractGoods$GoodsType$int(bells, amount));
    this.productionAndConsumption.put(this, bellsInfo);
    this.netProduction.incrementCount(bells, amount);
    let goods = new ArrayList();
    for (const $it2 = this.colony.getConsumers().iterator(); $it2.hasNext(); ) {
      let consumer = $it2.next();
      let modifiers = CollectionUtils.toList$Stream(consumer.getConsumptionModifiers(Modifier.CONSUME_ONLY_SURPLUS_PRODUCTION));
      goods.clear();
      for (const $it3 = consumer.getConsumedGoods().iterator(); $it3.hasNext(); ) {
        let g = $it3.next();
        this.goodsUsed.add(g.getType());
        let surplus = new AbstractGoods()._AbstractGoods$AbstractGoods(production.get(g.getType()));
        if (modifiers.isEmpty()) {
          surplus.setAmount((surplus.getAmount() + this.getGoodsCount(g.getType())) | 0);
        } else {
          surplus.setAmount($J.d2i(FeatureContainer.applyModifiers$float$Turn$Collection(Math.fround(surplus.getAmount()), null, modifiers)));
        }
        goods.add(surplus);
      }
      let info = null;
      if (consumer instanceof Building) {
        let building = consumer;
        let mapper = (ag) => {
          let outputType = ag.getType();
          let newOutput = new AbstractGoods()._AbstractGoods$AbstractGoods(production.get(outputType));
          newOutput.setAmount((newOutput.getAmount() + this.getGoodsCount(outputType)) | 0);
          return newOutput;
        };
        let outputs = CollectionUtils.transform$Stream$Predicate$Function(building.getOutputs(), CollectionUtils.alwaysTrue(), mapper);
        this.goodsUsed.addAll(CollectionUtils.transform$Collection$Predicate$Function(outputs, CollectionUtils.alwaysTrue(), ($p0) => $p0.getType()));
        info = building.getAdjustedProductionInfo(goods, outputs);
      } else if (consumer instanceof Unit) {
        info = (consumer).getProductionInfo(goods);
      } else if (consumer instanceof BuildQueue) {
        info = (consumer).getProductionInfo(goods);
      }
      if (info != null) {
        production.add$List(info.getProduction());
        production.remove$List(info.getConsumption());
        for (const $it4 = info.getProduction().iterator(); $it4.hasNext(); ) {
          let g = $it4.next();
          this.netProduction.incrementCount(g.getType().getStoredAs(), g.getAmount());
        }
        for (const $it5 = info.getConsumption().iterator(); $it5.hasNext(); ) {
          let g = $it5.next();
          this.netProduction.incrementCount(g.getType().getStoredAs(), -g.getAmount());
        }
        this.productionAndConsumption.put(consumer, info);
      }
    }
  }
  /**
   * Returns the number of goods of the given type stored in the
   * colony.
   *
   * @param type a {@code GoodsType} value
   * @return an {@code int} value
   */
  getGoodsCount(type$: GoodsType): number {
    return this.colony.getGoodsCount(type$);
  }
  /**
   * Invalidates the production cache. This method needs to be
   * called whenever global production modifiers change. This might
   * be the case when a new {@link FoundingFather} is added, or when
   * the colony's production bonus changes.
   */
  invalidate$(): void {
    this.upToDate = false;
  }
  /**
   * Invalidates the production cache if it produces or consumes the
   * given GoodsType. This method needs to be called whenever goods
   * are added to or removed from the colony.
   *
   * @param goodsType a {@code GoodsType} value
   */
  invalidate$GoodsType(goodsType: GoodsType): void {
    if (this.goodsUsed.contains(goodsType)) {
      this.upToDate = false;
    }
  }
  /**
   * Does this production cache contain production of a goods type?
   *
   * @param goodsType The {@code GoodsType} to check.
   * @return True if there is a production entry for the given type.
   */
  isProducing(goodsType: GoodsType): boolean {
    this.update();
    return CollectionUtils.any$Collection$Predicate(this.productionAndConsumption.values(), (pi) => CollectionUtils.any$Collection$Predicate(pi.getProduction(), AbstractGoods.matches(goodsType)));
  }
  /**
   * Does this production cache contain consumption of a goods type?
   *
   * @param goodsType The {@code GoodsType} to check.
   * @return True if there is a consumption entry for the given type.
   */
  isConsuming(goodsType: GoodsType): boolean {
    this.update();
    return CollectionUtils.any$Collection$Predicate(this.productionAndConsumption.values(), (pi) => CollectionUtils.any$Collection$Predicate(pi.getConsumption(), AbstractGoods.matches(goodsType)));
  }
  /**
   * Returns the net production, that is the total production minus
   * the total consumption, of the given GoodsType.
   *
   * @param type a {@code GoodsType} value
   * @return an {@code int} value
   */
  getNetProductionOf(type$: GoodsType): number {
    this.update();
    return this.netProduction.getCount(type$);
  }
  /**
   * Gets the {@code ProductionInfo} for the given
   * {@link WorkLocation} or {@link Consumer}.
   *
   * @param object an {@code Object} value
   * @return a {@code ProductionInfo} value
   */
  getProductionInfo(object$: any): ProductionInfo {
    this.update();
    return this.productionAndConsumption.get(object$);
  }
  /**
   * Gets a copy of the current production state.
   *
   * @return A copy of the current production state.
   */
  getProductionMap(): TypeCountMap<GoodsType> {
    this.update();
    let result = new TypeCountMap()._TypeCountMap();
    result.putAll(this.netProduction);
    return result;
  }
}

$J.define(ProductionCache, 'net.sf.freecol.common.model.ProductionCache', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Colony': '_ProductionCache' }, returns: { 'getProductionMap': 'net.sf.freecol.common.model.TypeCountMap' }, meths: { 'invalidate(net.sf.freecol.common.model.GoodsType)': 'invalidate$GoodsType', 'invalidate()': 'invalidate$' } });
$J.module(() => {
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  BuildQueue = $J.load('net.sf.freecol.common.model.BuildQueue');
  Building = $J.load('net.sf.freecol.common.model.Building');
  FeatureContainer = $J.load('net.sf.freecol.common.model.FeatureContainer');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  ProductionInfo = $J.load('net.sf.freecol.common.model.ProductionInfo');
  ProductionMap = $J.load('net.sf.freecol.common.model.ProductionMap');
  TypeCountMap = $J.load('net.sf.freecol.common.model.TypeCountMap');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
