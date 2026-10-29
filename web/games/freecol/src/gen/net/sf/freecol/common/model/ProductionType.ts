// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/ProductionType.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, Stream, StringBuilder } from '../../../../../../jre/index.ts';
import { FreeColSpecObject } from './FreeColSpecObject.ts';

let AbstractGoods, FreeColObject, GoodsType, CollectionUtils, Utils;

/**
 * This class describes a possible production type of a tile or building.
 */
export class ProductionType extends FreeColSpecObject {
  static readonly TAG: string = 'production';
  static EMPTY_LIST: List<AbstractGoods> = null;
  /**
   * Whether this production type applies only to colony center tiles.
   */
  unattended: boolean = false;
  /**
   * The production level of this production type (usually a
   * difficulty level key).
   */
  productionLevel: string = null;
  /**
   * The goods that are produced by this production type.
   */
  outputs: List<AbstractGoods> = null;
  /**
   * The goods that are consumed by this production type.
   */
  inputs: List<AbstractGoods> = null;
  static readonly UNATTENDED_TAG: string = 'unattended';
  static readonly GOODS_TYPE_TAG: string = 'goods-type';
  static readonly INPUT_TAG: string = 'input';
  static readonly OUTPUT_TAG: string = 'output';
  static readonly PRODUCTION_LEVEL_TAG: string = 'production-level';
  static readonly OLD_PRODUCTION_LEVEL_TAG: string = 'productionLevel';
  $init_ProductionType() {
    this.outputs = null;
    this.inputs = null;
  }
  /**
   * Simple constructor.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _ProductionType$Specification(specification: Specification): this {
    this._FreeColSpecObject(specification);
    this.$init_ProductionType();
    return this;
  }
  /**
   * Creates a new production type that consumes no raw materials
   * and produces the given output.
   *
   * @param outputs A list of the {@code AbstractGoods} produced.
   */
  _ProductionType$List(outputs: List<AbstractGoods>): this {
    this._ProductionType$Specification(null);
    this.outputs = outputs;
    return this;
  }
  /**
   * Creates a new production type that consumes the given raw materials
   * and produces the given output.
   *
   * @param inputs A list of the {@code AbstractGoods} consumed.
   * @param outputs A list of the {@code AbstractGoods} produced.
   */
  _ProductionType$List$List(inputs: List<AbstractGoods>, outputs: List<AbstractGoods>): this {
    this._ProductionType$List(outputs);
    this.inputs = inputs;
    return this;
  }
  /**
   * Convenience constructor for a production type with a single output.
   *
   * @param output The {@code AbstractGoods} produced.
   * @param unattended True if this is unattended production.
   * @param level The difficulty level key.
   */
  _ProductionType$AbstractGoods$boolean$String(output: AbstractGoods, unattended: boolean, level: string): this {
    this._ProductionType$List(new ArrayList());
    this.outputs.add(output);
    this.unattended = unattended;
    this.productionLevel = level;
    return this;
  }
  /**
   * Convenience constructor for a new {@code ProductionType}
   * instance with a single input and output.
   *
   * @param input The {@code GoodsType} consumed.
   * @param output The {@code GoodsType} produced.
   * @param amount The amount of goods both produced and consumed.
   */
  _ProductionType$GoodsType$GoodsType$int(input: GoodsType, output: GoodsType, amount: number): this {
    this._ProductionType$Specification(null);
    if (input != null) {
      this.inputs = new ArrayList();
      this.inputs.add(new AbstractGoods()._AbstractGoods$GoodsType$int(input, amount));
    }
    if (output != null) {
      this.outputs = new ArrayList();
      this.outputs.add(new AbstractGoods()._AbstractGoods$GoodsType$int(output, amount));
    }
    return this;
  }
  /**
   * Creates a new {@code ProductionType} instance.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @param specification The {@code Specification} to refer to.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _ProductionType$FreeColXMLReader$Specification(xr: FreeColXMLReader, specification: Specification): this {
    this._ProductionType$Specification(specification);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Get the unattended production state.
   *
   * @return True if this is unattended production.
   */
  getUnattended(): boolean {
    return this.unattended;
  }
  /**
   * Set the unattended state of this production.
   *
   * @param unattended The new unattended production state.
   */
  setUnattended(unattended: boolean): void {
    this.unattended = unattended;
  }
  /**
   * The production level of this type of production (used by
   * difficulty levels).
   *
   * @return The production level key.
   */
  getProductionLevel(): string {
    return this.productionLevel;
  }
  /**
   * Does this production apply to a given difficulty level.
   *
   * @param level The difficulty level key to check.
   * @return True if this production applies.
   */
  appliesTo(level: string): boolean {
    return level == null || this.productionLevel == null || $J.equals(level, this.productionLevel);
  }
  /**
   * Does this production apply exactly to a given difficulty level,
   * that is without using wildcard matches on null.
   *
   * @param level The difficulty level key to check.
   * @return True if this production applies.
   */
  appliesExactly(level: string): boolean {
    return level != null && $J.equals(level, this.productionLevel);
  }
  /**
   * Get the input goods list.
   *
   * @return A list of the input {@code AbstractGoods}.
   */
  getInputList(): List<AbstractGoods> {
    return (this.inputs == null) ? ProductionType.EMPTY_LIST : this.inputs;
  }
  /**
   * Get the input goods as a stream.
   *
   * @return A stream of the input {@code AbstractGoods}.
   */
  getInputs(): Stream<AbstractGoods> {
    return (this.inputs == null) ? Stream.empty() : this.inputs.stream();
  }
  /**
   * Set the input goods.
   *
   * @param newInputs The new list of input {@code AbstractGoods}.
   */
  setInputs(newInputs: List<AbstractGoods>): void {
    this.inputs = newInputs;
  }
  /**
   * Add a new input.
   *
   * @param type The {@code GoodsType} to add.
   * @param amount The amount of goods.
   */
  addInput(type$: GoodsType, amount: number): void {
    if (this.inputs == null) {
      this.inputs = new ArrayList(1);
    }
    this.inputs.add(new AbstractGoods()._AbstractGoods$GoodsType$int(type$, amount));
  }
  /**
   * Get the output goods list.
   *
   * @return A list of the output {@code AbstractGoods}.
   */
  getOutputList(): List<AbstractGoods> {
    return (this.outputs == null) ? ProductionType.EMPTY_LIST : this.outputs;
  }
  /**
   * Get the output goods as a stream.
   *
   * @return A stream of the output {@code AbstractGoods}.
   */
  getOutputs(): Stream<AbstractGoods> {
    return (this.outputs == null) ? Stream.empty() : this.outputs.stream();
  }
  /**
   * Set the output goods.
   *
   * @param newOutputs The new list of output {@code AbstractGoods}.
   */
  setOutputs(newOutputs: List<AbstractGoods>): void {
    this.outputs = newOutputs;
  }
  /**
   * Add a new output.
   *
   * @param type The {@code GoodsType} to add.
   * @param amount The amount of goods.
   */
  addOutput$GoodsType$int$ProductionType(type$: GoodsType, amount: number): void {
    if (this.outputs == null) {
      this.outputs = new ArrayList(1);
    }
    this.outputs.add(new AbstractGoods()._AbstractGoods$GoodsType$int(type$, amount));
  }
  /**
   * Add a new output.
   *
   * @param ag The {@code AbstractGoods} to add.
   */
  addOutput$AbstractGoods(ag: AbstractGoods): void {
    if (this.outputs == null) {
      this.outputs = new ArrayList(1);
    }
    this.outputs.add(ag);
  }
  /**
   * Get the goods of the given goods type in this production type.
   *
   * @param goodsType The {@code GoodsType} to check.
   * @return The {@code AbstractGoods} output if any, otherwise
   *     null.
   */
  getOutput(goodsType: GoodsType): AbstractGoods {
    return (this.outputs == null) ? null : CollectionUtils.find$Collection$Predicate(this.outputs, AbstractGoods.matches(goodsType));
  }
  /**
   * Get the type of the most productive output.
   *
   * @return The {@code GoodsType} of the most productive output.
   */
  getBestOutputType(): GoodsType {
    let goods: AbstractGoods;
    return (this.outputs == null || (goods = CollectionUtils.maximize$Collection$Comparator(this.outputs, AbstractGoods.ascendingAmountComparator)) == null) ? null : goods.getType();
  }
  /**
   * Convenience function to check if there is an output for a given
   * goods type in a collection of production types.
   *
   * @param goodsType The {@code GoodsType} to use.
   * @param types A list of {@code ProductionType}s to consider.
   * @return The most productive output that produces the goods type,
   *     or null if none found.
   */
  static canProduce(goodsType: GoodsType, types: Collection<ProductionType>): boolean {
    return CollectionUtils.any$Stream$Predicate(CollectionUtils.flatten$Collection$Function(types, ($p0) => $p0.getOutputs()), (ag) => goodsType === ag.getType() && ag.getAmount() > 0);
  }
  /**
   * Get the production type with the greatest total output of an
   * optional goods type from a collection of production types
   *
   * @param goodsType An optional {@code GoodsType} to restrict the
   *     choice of outputs with.
   * @param types A collection of {@code ProductionType}s to consider.
   * @return The most productive {@code ProductionType}.
   */
  static getBestProductionType(goodsType: GoodsType, types: Collection<ProductionType>): ProductionType {
    let comp = CollectionUtils.cachingIntComparator((pt) => {
      let best = pt.getBestOutputFor(goodsType);
      return (best == null) ? -2147483648 : best.getAmount();
    });
    return CollectionUtils.maximize$Collection$Comparator(types, comp);
  }
  /**
   * Get the output the maximizes production for an optional goods type.
   *
   * @param goodsType The optional {@code GoodsType} to check.
   * @return The best production.
   */
  getBestOutputFor(goodsType: GoodsType): AbstractGoods {
    let typePred = (ag) => goodsType == null || ag.getType() === goodsType;
    return CollectionUtils.maximize$Stream$Predicate$Comparator(this.getOutputs(), typePred, AbstractGoods.ascendingAmountComparator);
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(ProductionType));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.unattended = o.getUnattended();
    this.productionLevel = o.getProductionLevel();
    this.setOutputs(o.getOutputList());
    this.setInputs(o.getInputList());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    if (this.unattended) {
      xw.writeAttribute$String$boolean(ProductionType.UNATTENDED_TAG, this.unattended);
    }
    if (this.productionLevel != null) {
      xw.writeAttribute(ProductionType.PRODUCTION_LEVEL_TAG, this.productionLevel);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    if (this.inputs != null) {
      for (const $it0 = this.inputs.iterator(); $it0.hasNext(); ) {
        let input = $it0.next();
        xw.writeStartElement(ProductionType.INPUT_TAG);
        xw.writeAttribute$String$FreeColObject(ProductionType.GOODS_TYPE_TAG, input.getType());
        xw.writeAttribute$String$int(FreeColObject.VALUE_TAG, input.getAmount());
        xw.writeEndElement();
      }
    }
    if (this.outputs != null) {
      for (const $it1 = this.outputs.iterator(); $it1.hasNext(); ) {
        let output = $it1.next();
        xw.writeStartElement(ProductionType.OUTPUT_TAG);
        xw.writeAttribute$String$FreeColObject(ProductionType.GOODS_TYPE_TAG, output.getType());
        xw.writeAttribute$String$int(FreeColObject.VALUE_TAG, output.getAmount());
        xw.writeEndElement();
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    this.unattended = xr.getAttribute$String$boolean(ProductionType.UNATTENDED_TAG, false);
    this.productionLevel = xr.getAttribute$String$String(ProductionType.PRODUCTION_LEVEL_TAG, null);
    if (this.productionLevel == null) {
      this.productionLevel = xr.getAttribute$String$String(ProductionType.OLD_PRODUCTION_LEVEL_TAG, null);
    }
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    if (this.inputs != null) {
      this.inputs.clear();
    }
    if (this.outputs != null) {
      this.outputs.clear();
    }
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    let tag = xr.getLocalName();
    if ($J.equals(ProductionType.INPUT_TAG, tag)) {
      let type$ = xr.getType(spec, ProductionType.GOODS_TYPE_TAG, $J.cls(GoodsType), null);
      if (type$ == null) {
        FreeColObject.logger.warning('Skipping input with null type: ' + xr.getAttribute$String$String(ProductionType.GOODS_TYPE_TAG, null));
      } else {
        this.addInput(type$, xr.getAttribute$String$int(FreeColObject.VALUE_TAG, -1));
      }
      xr.closeTag$String(ProductionType.INPUT_TAG);
    } else if ($J.equals(ProductionType.OUTPUT_TAG, tag)) {
      let type$ = xr.getType(spec, ProductionType.GOODS_TYPE_TAG, $J.cls(GoodsType), null);
      if (type$ == null) {
        FreeColObject.logger.warning('Skipping output with null type: ' + xr.getAttribute$String$String(ProductionType.GOODS_TYPE_TAG, null));
      } else {
        this.addOutput$GoodsType$int$ProductionType(type$, xr.getAttribute$String$int(FreeColObject.VALUE_TAG, -1));
      }
      xr.closeTag$String(ProductionType.OUTPUT_TAG);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return ProductionType.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (this === o) {
      return true;
    }
    if (o instanceof ProductionType) {
      let other = o;
      return this.unattended === other.unattended && CollectionUtils.listEquals(this.outputs, other.outputs) && CollectionUtils.listEquals(this.inputs, other.inputs) && Utils.equals(this.productionLevel, other.productionLevel) && super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(31, hash) + ((this.unattended) ? 1 : 0)) | 0;
    hash = (Math.imul(31, hash) + Utils.hashCode(this.productionLevel)) | 0;
    if (this.outputs != null) {
      for (const $it2 = this.outputs.iterator(); $it2.hasNext(); ) {
        let ag = $it2.next();
        hash = (Math.imul(31, hash) + Utils.hashCode(ag)) | 0;
      }
    }
    if (this.inputs != null) {
      for (const $it3 = this.inputs.iterator(); $it3.hasNext(); ) {
        let ag = $it3.next();
        hash = (Math.imul(31, hash) + Utils.hashCode(ag)) | 0;
      }
    }
    return hash;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let result = new StringBuilder(64);
    result.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(58 /* ':' */));
    if (this.productionLevel != null) {
      result.append(String.fromCharCode(32 /* ' ' */)).append(this.productionLevel);
    }
    if (this.unattended) {
      result.append(' unattended');
    }
    if (!(this.inputs == null || this.inputs.isEmpty())) {
      result.append(' [inputs: ');
      for (const $it4 = this.inputs.iterator(); $it4.hasNext(); ) {
        let input = $it4.next();
        result.append($J.str(input)).append(', ');
      }
      let length = result.length();
      result.replace((length - 2) | 0, length, ']');
    }
    if (!(this.outputs == null || this.outputs.isEmpty())) {
      result.append(' [outputs: ');
      for (const $it5 = this.outputs.iterator(); $it5.hasNext(); ) {
        let output = $it5.next();
        result.append($J.str(output)).append(', ');
      }
      let length = result.length();
      result.replace((length - 2) | 0, length, ']');
    }
    result.append(String.fromCharCode(93 /* ']' */));
    return result.toString();
  }
  static $clinit() {
    ProductionType.EMPTY_LIST = Collections.emptyList();
  }
}

$J.define(ProductionType, 'net.sf.freecol.common.model.ProductionType', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColSpecObject', ctors: { 'net.sf.freecol.common.io.FreeColXMLReader,net.sf.freecol.common.model.Specification': '_ProductionType$FreeColXMLReader$Specification', 'net.sf.freecol.common.model.GoodsType,net.sf.freecol.common.model.GoodsType,int': '_ProductionType$GoodsType$GoodsType$int', 'net.sf.freecol.common.model.AbstractGoods,boolean,java.lang.String': '_ProductionType$AbstractGoods$boolean$String', 'java.util.List,java.util.List': '_ProductionType$List$List', 'java.util.List': '_ProductionType$List', 'net.sf.freecol.common.model.Specification': '_ProductionType$Specification' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getBestOutputType': 'net.sf.freecol.common.model.GoodsType', 'getOutputs': 'java.util.stream.Stream', 'getOutputList': 'java.util.List', 'getInputs': 'java.util.stream.Stream', 'getInputList': 'java.util.List', 'getProductionLevel': 'java.lang.String', 'getUnattended': 'boolean' }, meths: { 'addOutput(net.sf.freecol.common.model.AbstractGoods)': 'addOutput$AbstractGoods', 'addOutput(net.sf.freecol.common.model.GoodsType,int)': 'addOutput$GoodsType$int$ProductionType' }, clinit: true, lazy: ['EMPTY_LIST'] });
$J.module(() => {
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
