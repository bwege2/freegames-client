// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/TileImprovementPlan.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { ValuedAIObject } from './ValuedAIObject.ts';

let Constants$IntegrityType, Tile, TileImprovementType, CollectionUtils, Utils, AIUnit;

/**
 * Represents a plan to improve a {@code Tile} in some way.
 * For instance by plowing or by building a road.
 *
 * @see Tile
 */
export class TileImprovementPlan extends ValuedAIObject {
  static logger: Logger = null;
  static readonly TAG: string = 'tileImprovementPlan';
  /**
   * The type of improvement, from TileImprovementTypes.
   */
  type: TileImprovementType = null;
  /**
   * The {@code Tile} to be improved.
   */
  target: Tile = null;
  /**
   * The pioneer which should make the improvement (if a
   * {@code Unit} has been assigned).
   */
  pioneer: AIUnit = null;
  static readonly PIONEER_TAG: string = 'pioneer';
  static readonly TARGET_TAG: string = 'target';
  static readonly TYPE_TAG: string = 'type';
  $init_TileImprovementPlan() {
    this.pioneer = null;
  }
  /**
   * Creates a new uninitialized {@code TileImprovementPlan}.
   *
   * @param aiMain The main AI-object.
   * @param id The object identifier.
   */
  _TileImprovementPlan$AIMain$String(aiMain: AIMain, id: string): this {
    this._ValuedAIObject$AIMain$String(aiMain, id);
    this.$init_TileImprovementPlan();
    this.type = null;
    this.target = null;
    this.pioneer = null;
    this.initialized = false;
    return this;
  }
  /**
   * Creates a new {@code TileImprovementPlan} and initializes its
   * critical fields.
   *
   * @param aiMain The main AI-object.
   * @param target The target {@code Tile} for the improvement.
   * @param type The type of improvement.
   * @param value The value identifying the importance of
   *     this {@code TileImprovementPlan} - a higher value
   *     signals a higher importance.
   */
  _TileImprovementPlan$AIMain$Tile$TileImprovementType$int(aiMain: AIMain, target: Tile, type$: TileImprovementType, value: number): this {
    this._ValuedAIObject$AIMain$String(aiMain, TileImprovementPlan.TAG + ':' + aiMain.getNextId());
    this.$init_TileImprovementPlan();
    this.target = target;
    this.type = type$;
    this.pioneer = null;
    this.setValue(value);
    this.setInitialized();
    return this;
  }
  /**
   * Creates a new {@code TileImprovementPlan} from the given
   * XML-representation.
   *
   * @param aiMain The main AI-object.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered
   *     during parsing.
   */
  _TileImprovementPlan$AIMain$FreeColXMLReader(aiMain: AIMain, xr: FreeColXMLReader): this {
    this._ValuedAIObject$AIMain$FreeColXMLReader(aiMain, xr);
    this.$init_TileImprovementPlan();
    this.setInitialized();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  setInitialized(): void {
    this.initialized = this.getType() != null && this.getTarget() != null;
  }
  /**
   * Gets the pioneer who have been assigned to making the
   * improvement described by this object.
   *
   * @return The pioneer which should make the improvement, if
   *     such a {@code AIUnit} has been assigned, and
   *     {@code null} if nobody has been assigned this
   *     mission.
   */
  getPioneer(): AIUnit {
    return this.pioneer;
  }
  /**
   * Sets the pioneer who have been assigned to making the
   * improvement described by this object.
   *
   * @param pioneer The pioneer which should make the improvement, if
   *     such a {@code Unit} has been assigned, and
   *     {@code null} if nobody has been assigned this
   *     mission.
   */
  setPioneer(pioneer: AIUnit): void {
    this.pioneer = pioneer;
  }
  /**
   * Gets the {@code TileImprovementType} of this plan.
   *
   * @return The type of the improvement.
   */
  getType(): TileImprovementType {
    return this.type;
  }
  /**
   * Sets the type of this {@code TileImprovementPlan}.
   *
   * @param type The {@code TileImprovementType}.
   * @see #getType
   */
  setType(type$: TileImprovementType): void {
    this.type = type$;
  }
  /**
   * Gets the target of this {@code TileImprovementPlan}.
   *
   * @return The {@code Tile} where
   *     {@link #getPioneer pioneer} should make the
   *     given {@link #getType improvement}.
   */
  getTarget(): Tile {
    return this.target;
  }
  /**
   * Gets the 'most effective' TileImprovementType allowed for a
   * given tile and goods type.  Useful for AI in deciding the
   * improvements to prioritize.
   *
   * @param tile The {@code Tile} that will be improved.
   * @param goodsType The {@code GoodsType} to be prioritized.
   * @return The best {@code TileImprovementType} available to be done.
   */
  static getBestTileImprovementType(tile: Tile, goodsType: GoodsType): TileImprovementType {
    let spec = tile.getSpecification();
    let goodTIPred = (it) => !it.isNatural() && it.isTileTypeAllowed(tile.getType()) && it.getExpendedAmount() <= 1 && tile.getTileImprovement(it) == null;
    let bestTIComp = CollectionUtils.cachingIntComparator((it) => it.getImprovementValue$Tile$GoodsType(tile, goodsType));
    let best = CollectionUtils.maximize$Collection$Predicate$Comparator(spec.getTileImprovementTypeList(), goodTIPred, bestTIComp);
    return (best == null || best.getImprovementValue$Tile$GoodsType(tile, goodsType) <= 0) ? null : best;
  }
  /**
   * Updates this tile improvement plan to the best available for its
   * tile and the specified goods type.
   *
   * @param goodsType The {@code GoodsType} to be prioritized.
   * @return True if the plan is still viable.
   */
  update(goodsType: GoodsType): boolean {
    let type$ = TileImprovementPlan.getBestTileImprovementType(this.target, goodsType);
    if (type$ == null) {
      return false;
    }
    this.setType(type$);
    this.setValue(type$.getImprovementValue$Tile$GoodsType(this.target, goodsType));
    return true;
  }
  /**
   * Is this improvement complete?
   *
   * @return True if the tile improvement has been completed.
   */
  isComplete(): boolean {
    return this.target != null && this.target.hasTileImprovement(this.getType());
  }
  /**
   * Weeds out a broken or obsolete tile improvement plan.
   *
   * @return True if the plan survives this check.
   */
  validate(): boolean {
    if (this.type == null) {
      TileImprovementPlan.logger.warning('Removing typeless TileImprovementPlan');
      this.dispose();
      return false;
    }
    if (this.target == null) {
      TileImprovementPlan.logger.warning('Removing targetless TileImprovementPlan');
      this.dispose();
      return false;
    }
    if (this.getPioneer() != null && (this.getPioneer().getUnit() == null || this.getPioneer().getUnit().isDisposed())) {
      TileImprovementPlan.logger.warning('Clearing broken pioneer for TileImprovementPlan');
      this.setPioneer(null);
    }
    return true;
  }
  /**
   * Disposes this {@code TileImprovementPlan}.
   *
   * If a pioneer has been assigned to making this improvement, then
   * abort its mission.
   */
  dispose(): void {
    this.pioneer = null;
    super.dispose();
  }
  /**
   * {@inheritDoc}
   */
  checkIntegrity$boolean$LogBuilder(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = super.checkIntegrity$boolean$LogBuilder(fix, lb);
    if (this.pioneer != null) {
      result = result.combine(this.pioneer.checkIntegrity$boolean$LogBuilder(fix, lb));
    }
    if (this.type == null) {
      lb.add(['\n  Tile improvement plan without type: ', this.getId()]);
      result = result.fail();
    } else if (this.target == null) {
      lb.add(['\n  Tile improvement plan without target: ', this.getId()]);
      result = result.fail();
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  toXML$FreeColXMLWriter(xw: FreeColXMLWriter): void {
    if (this.validate()) {
      this.toXML$FreeColXMLWriter$String(xw, TileImprovementPlan.TAG);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(TileImprovementPlan.TYPE_TAG, this.type);
    xw.writeAttribute$String$FreeColObject(TileImprovementPlan.TARGET_TAG, this.target);
    if (this.pioneer != null && this.pioneer.checkIntegrity$boolean(false) === Constants$IntegrityType.INTEGRITY_GOOD) {
      xw.writeAttribute$String$FreeColObject(TileImprovementPlan.PIONEER_TAG, this.pioneer);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let aiMain = this.getAIMain();
    let spec = this.getSpecification();
    this.type = xr.getType(spec, TileImprovementPlan.TYPE_TAG, $J.cls(TileImprovementType), null);
    this.pioneer = (xr.hasAttribute(TileImprovementPlan.PIONEER_TAG)) ? xr.makeAIObject(aiMain, TileImprovementPlan.PIONEER_TAG, $J.cls(AIUnit), null, true) : null;
    this.target = xr.getAttribute$Game$String$Class$FreeColObject(this.getGame(), TileImprovementPlan.TARGET_TAG, $J.cls(Tile), null);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return TileImprovementPlan.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (!(o instanceof TileImprovementPlan)) {
      return false;
    }
    let other = o;
    return Utils.equals(this.type, other.type) && Utils.equals(this.target, other.target) && Utils.equals(this.pioneer, other.pioneer) && super.equals(other);
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(37, hash) + Utils.hashCode(this.type)) | 0;
    hash = (Math.imul(37, hash) + Utils.hashCode(this.target)) | 0;
    return (Math.imul(37, hash) + Utils.hashCode(this.pioneer)) | 0;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append((this.type == null) ? 'null' : this.type.getSuffix$()).append(' at ').append((this.target == null) ? 'null' : this.target.toShortString()).append(String.fromCharCode(47 /* \u002f */)).append(String(this.getValue())).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    TileImprovementPlan.logger = Logger.getLogger($J.cls(TileImprovementPlan).getName());
  }
}

$J.define(TileImprovementPlan, 'net.sf.freecol.server.ai.TileImprovementPlan', { kind: 'class', sup: 'net.sf.freecol.server.ai.ValuedAIObject', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.io.FreeColXMLReader': '_TileImprovementPlan$AIMain$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.TileImprovementType,int': '_TileImprovementPlan$AIMain$Tile$TileImprovementType$int', 'net.sf.freecol.server.ai.AIMain,java.lang.String': '_TileImprovementPlan$AIMain$String' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'isComplete': 'boolean', 'getTarget': 'net.sf.freecol.common.model.Tile', 'getType': 'net.sf.freecol.common.model.TileImprovementType', 'getPioneer': 'net.sf.freecol.server.ai.AIUnit' }, meths: { 'toXML(net.sf.freecol.common.io.FreeColXMLWriter)': 'toXML$FreeColXMLWriter', 'checkIntegrity(boolean,net.sf.freecol.common.util.LogBuilder)': 'checkIntegrity$boolean$LogBuilder' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Constants$IntegrityType = $J.load('net.sf.freecol.common.model.Constants$IntegrityType');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  TileImprovementType = $J.load('net.sf.freecol.common.model.TileImprovementType');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
  AIUnit = $J.load('net.sf.freecol.server.ai.AIUnit');
});
