// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/BuildableType.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, HashMap, Stream } from '../../../../../../jre/index.ts';
import { FreeColSpecObjectType } from './FreeColSpecObjectType.ts';

let AbstractGoods, FreeColObject, GoodsType, Limit, StringTemplate, CollectionUtils;

/**
 * Contains information on buildable types.
 */
export class BuildableType extends FreeColSpecObjectType {
  /**
   * The required population for an ordinary buildable.
   */
  static readonly DEFAULT_REQUIRED_POPULATION: number = 1;
  /**
   * The minimum population that a Colony needs in order to build
   * this type.
   */
  requiredPopulation: number = 0;
  /**
   * Stores the abilities required by this Type.
   */
  requiredAbilities: JMap<string, boolean> = null;
  /**
   * A list of AbstractGoods required to build this type.
   */
  requiredGoods: List<AbstractGoods> = null;
  /**
   * Limits on the production of this type.
   */
  limits: List<Limit> = null;
  static readonly REQUIRED_ABILITY_TAG: string = 'required-ability';
  static readonly REQUIRED_GOODS_TAG: string = 'required-goods';
  static readonly REQUIRED_POPULATION_TAG: string = 'required-population';
  /**
   * Creates a new buildable type.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _BuildableType(id: string, specification: Specification): this {
    this._FreeColSpecObjectType$String$Specification(id, specification);
    this.requiredPopulation = BuildableType.DEFAULT_REQUIRED_POPULATION;
    this.requiredAbilities = null;
    this.requiredGoods = null;
    this.limits = null;
    return this;
  }
  /**
   * Get the population required to build this buildable type.
   *
   * @return The population required.
   */
  getRequiredPopulation(): number {
    return this.requiredPopulation;
  }
  /**
   * Set the population required to build this buildable type.
   *
   * @param newPopulation The new population required.
   */
  setRequiredPopulation(newPopulation: number): void {
    this.requiredPopulation = newPopulation;
  }
  /**
   * Gets the abilities required by this type.
   *
   * @return A copy of the required abilities map.
   */
  getRequiredAbilities(): JMap<string, boolean> {
    return (this.requiredAbilities == null) ? Collections.emptyMap() : new HashMap(this.requiredAbilities);
  }
  requiresAbility(key: string): boolean {
    return (this.requiredAbilities == null) ? false : (!this.requiredAbilities.containsKey(key)) ? false : this.requiredAbilities.get(key);
  }
  /**
   * Sets the abilities required by this type.
   *
   * @param abilities The new required abilities.
   */
  setRequiredAbilities(abilities: JMap<string, boolean>): void {
    this.requiredAbilities = abilities;
  }
  /**
   * Add a new required ability.
   *
   * Public for specification fixes.
   *
   * @param tag The ability name.
   * @param value The ability value.
   */
  addRequiredAbility(tag: string, value: boolean): void {
    if (this.requiredAbilities == null) {
      this.requiredAbilities = new HashMap();
    }
    this.requiredAbilities.put(tag, value);
  }
  /**
   * Remove a required ability.
   *
   * Public for specification fixes.
   *
   * @param tag The ability name to remove.
   */
  removeRequiredAbility(tag: string): void {
    if (this.requiredAbilities != null) {
      this.requiredAbilities.remove(tag);
    }
  }
  /**
   * Is this buildable available to a given FreeColObject?
   *
   * @param fco The {@code FreeColObject}s to check.
   * @return True if the buildable is available.
   */
  isAvailableTo(fco: FreeColObject[]): boolean {
    if (false) {
      if (this.requiredAbilities == null) {
        $J.err.println($J.str(this) + '.isAvailableTo() null -> true');
        return true;
      }
      for (const $it0 = this.requiredAbilities.entrySet().iterator(); $it0.hasNext(); ) {
        let e = $it0.next();
        let any$ = false;
        for (let f of fco) {
          $J.err.println($J.str(this) + '.isAvailableTo(' + $J.str(f) + ') on ' + e.getKey() + ' = ' + f.hasAbility$String(e.getKey()));
          if (f.hasAbility$String(e.getKey())) {
            any$ = true;
            break;
          }
        }
        if (e.getValue() !== any$) {
          $J.err.println($J.str(this) + '.isAvailableTo() fail on ' + e.getKey() + ' expecting ' + e.getValue() + ' but saw ' + any$);
          return false;
        }
      }
      return true;
    } else {
      return (this.requiredAbilities == null) ? true : CollectionUtils.all$Collection$Predicate(this.requiredAbilities.entrySet(), (e) => e.getValue() === (CollectionUtils.any$ObjectArr$Predicate(fco, (o) => o != null && o.hasAbility$String(e.getKey()))));
    }
  }
  /**
   * Get the goods required to build an instance of this buildable.
   *
   * Note we must take care to return a deep copy, as these lists
   * are subject to complex manipulations in the role code.
   *
   * @return A deep copy of the list of required goods.
   */
  getRequiredGoodsList$(): List<AbstractGoods> {
    return (this.requiredGoods == null) ? Collections.emptyList() : CollectionUtils.transform$Collection$Predicate$Function(this.requiredGoods, CollectionUtils.alwaysTrue(), (ag) => new AbstractGoods()._AbstractGoods$GoodsType$int(ag.getType(), ag.getAmount()));
  }
  /**
   * Get the goods required to build an instance of this buildable
   * as a stream.
   *
   * @return A stream of the required goods.
   */
  getRequiredGoods$(): Stream<AbstractGoods> {
    return (this.requiredGoods == null) ? Stream.empty() : this.getRequiredGoodsList$().stream();
  }
  /**
   * Set the goods required to build an instance of this buildable.
   *
   * @param goods The new required goods.
   */
  setRequiredGoods(goods: List<AbstractGoods>): void {
    this.requiredGoods.clear();
    this.requiredGoods.addAll(goods);
  }
  /**
   * Get the amount required of a given {@code GoodsType} to build
   * an instance of this buildable.
   *
   * @param type The {@code GoodsType} to check.
   * @return The amount of goods required.
   */
  getRequiredAmountOf(type$: GoodsType): number {
    return AbstractGoods.getCount(type$, this.getRequiredGoodsList$());
  }
  /**
   * Add a new goods requirement.
   *
   * @param ag The required {@code AbstractGoods} to add.
   */
  addRequiredGoods(ag: AbstractGoods): void {
    if (this.requiredGoods == null) {
      this.requiredGoods = new ArrayList();
    }
    this.requiredGoods.add(ag);
  }
  /**
   * Does this buildable need goods to build?
   *
   * @return True if goods are required to build this buildable.
   */
  needsGoodsToBuild(): boolean {
    return this.requiredGoods != null && !this.requiredGoods.isEmpty();
  }
  /**
   * Get the limits on this buildable.
   *
   * @return A list of {@code Limit}s.
   */
  getLimits(): List<Limit> {
    return (this.limits == null) ? Collections.emptyList() : this.limits;
  }
  /**
   * Set the limits on this buildable.
   *
   * @param newLimits The new {@code Limits} value.
   */
  setLimits(newLimits: List<Limit>): void {
    this.limits = newLimits;
  }
  /**
   * Add a new limit.
   *
   * @param limit The {@code Limit} to add.
   */
  addLimit(limit: Limit): void {
    if (this.limits == null) {
      this.limits = new ArrayList();
    }
    this.limits.add(limit);
  }
  /**
   * Get a label describing this buildable type as being currently built.
   *
   * @return A suitable label.
   */
  getCurrentlyBuildingLabel(): StringTemplate {
    return StringTemplate.template$String('model.buildableType.currentlyBuilding').addNamed$String$Named('%buildable%', this);
  }
  getMinimumIndex(colony: Colony, buildQueueList: JList<BuildableType>, UNABLE_TO_BUILD: number): number {
    return UNABLE_TO_BUILD;
  }
  getMaximumIndex(colony: Colony, buildQueueList: JList<BuildableType>, UNABLE_TO_BUILD: number): number {
    return UNABLE_TO_BUILD;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(BuildableType));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.setRequiredPopulation(o.getRequiredPopulation());
    this.setRequiredAbilities(o.getRequiredAbilities());
    this.setRequiredGoods(o.getRequiredGoodsList$());
    this.setLimits(o.getLimits());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.requiredPopulation > 1) {
      xw.writeAttribute$String$int(BuildableType.REQUIRED_POPULATION_TAG, this.requiredPopulation);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    if (this.requiredAbilities != null) {
      for (const $it1 = this.requiredAbilities.entrySet().iterator(); $it1.hasNext(); ) {
        let entry = $it1.next();
        xw.writeStartElement(BuildableType.REQUIRED_ABILITY_TAG);
        xw.writeAttribute(FreeColObject.ID_ATTRIBUTE_TAG, entry.getKey());
        xw.writeAttribute$String$Object(FreeColObject.VALUE_TAG, entry.getValue());
        xw.writeEndElement();
      }
    }
    for (const $it2 = this.getRequiredGoodsList$().iterator(); $it2.hasNext(); ) {
      let goods = $it2.next();
      xw.writeStartElement(BuildableType.REQUIRED_GOODS_TAG);
      xw.writeAttribute$String$FreeColObject(FreeColObject.ID_ATTRIBUTE_TAG, goods.getType());
      xw.writeAttribute$String$int(FreeColObject.VALUE_TAG, goods.getAmount());
      xw.writeEndElement();
    }
    for (const $it3 = this.getLimits().iterator(); $it3.hasNext(); ) {
      let limit = $it3.next();
      limit.toXML$FreeColXMLWriter(xw);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.requiredPopulation = xr.getAttribute$String$int(BuildableType.REQUIRED_POPULATION_TAG, BuildableType.DEFAULT_REQUIRED_POPULATION);
  }
  /**
   * {@inheritDoc}
   */
  clearContainers$FreeColXMLReader(xr: FreeColXMLReader): void {
    super.clearContainers$FreeColXMLReader(xr);
    this.requiredAbilities = null;
    this.requiredGoods = null;
    this.limits = null;
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    let tag = xr.getLocalName();
    if ($J.equals(BuildableType.REQUIRED_ABILITY_TAG, tag)) {
      let id = xr.readId();
      this.addRequiredAbility(id, xr.getAttribute$String$boolean(FreeColObject.VALUE_TAG, true));
      spec.addAbility$String(id);
      xr.closeTag$String(BuildableType.REQUIRED_ABILITY_TAG);
    } else if ($J.equals(BuildableType.REQUIRED_GOODS_TAG, tag)) {
      let type$ = xr.getType(spec, FreeColObject.ID_ATTRIBUTE_TAG, $J.cls(GoodsType), null);
      let amount = xr.getAttribute$String$int(FreeColObject.VALUE_TAG, 0);
      this.addRequiredGoods(new AbstractGoods()._AbstractGoods$GoodsType$int(type$, amount));
      xr.closeTag$String(BuildableType.REQUIRED_GOODS_TAG);
    } else if ($J.equals(Limit.TAG, tag)) {
      let limit = new Limit()._Limit$FreeColXMLReader$Specification(xr, spec);
      if (limit.getLeftHandSide().getType() == null) {
        limit.getLeftHandSide().setType(this.getId());
      }
      this.addLimit(limit);
    } else {
      super.readChild(xr);
    }
  }
}

$J.define(BuildableType, 'net.sf.freecol.common.model.BuildableType', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColSpecObjectType', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_BuildableType' }, returns: { 'getCurrentlyBuildingLabel': 'net.sf.freecol.common.model.StringTemplate', 'getLimits': 'java.util.List', 'getRequiredGoods$': 'java.util.stream.Stream', 'getRequiredGoodsList$': 'java.util.List', 'getRequiredAbilities': 'java.util.Map', 'getRequiredPopulation': 'int' }, meths: { 'clearContainers(net.sf.freecol.common.io.FreeColXMLReader)': 'clearContainers$FreeColXMLReader', 'getRequiredGoods()': 'getRequiredGoods$', 'getRequiredGoodsList()': 'getRequiredGoodsList$' } });
$J.module(() => {
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
  Limit = $J.load('net.sf.freecol.common.model.Limit');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
