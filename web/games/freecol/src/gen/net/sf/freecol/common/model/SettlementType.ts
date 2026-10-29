// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/SettlementType.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections } from '../../../../../../jre/index.ts';
import { FreeColSpecObjectType } from './FreeColSpecObjectType.ts';

let GoodsContainer, PlunderType, RandomRange, CollectionUtils;

/**
 * The various types of settlements in the game.
 */
export class SettlementType extends FreeColSpecObjectType {
  static readonly TAG: string = 'settlementType';
  /**
   * Whether this SettlementType is a capital.
   */
  capital: boolean = false;
  /**
   * How many tiles this SettlementType can see.
   */
  visibleRadius: number = 0;
  /**
   * How many tiles this SettlementType can claim.
   */
  claimableRadius: number = 0;
  /**
   * The extra radius beyond the claimableRadius where wandering
   * units may claim as yet unclaimed tiles.
   */
  extraClaimableRadius: number = 0;
  /**
   * How far units from this SettlementType may roam.
   */
  wanderingRadius: number = 0;
  /**
   * The minimum number of units for this SettlementType.
   */
  minimumSize_: number = 0;
  /**
   * The maximum number of units for this SettlementType.
   */
  maximumSize: number = 0;
  /**
   * The minimum number of tiles to grow this SettlementType.
   */
  minimumGrowth: number = 0;
  /**
   * The maximum number of tiles to grown this SettlementType.
   */
  maximumGrowth: number = 0;
  /**
   * The general trade bonus, roughly proportional to the settlement
   * size and general sophistication.
   */
  tradeBonus: number = 0;
  /**
   * The threshold at which a new convert occurs.
   */
  convertThreshold: number = 0;
  /**
   * The plunder this SettlementType generates when destroyed.
   */
  plunderTypes: List<PlunderType> = null;
  /**
   * The gifts this SettlementType generates when visited by a scout.
   */
  gifts: RandomRange = null;
  static readonly CAPITAL_TAG: string = 'capital';
  static readonly CLAIMABLE_RADIUS_TAG: string = 'claimable-radius';
  static readonly CONVERT_THRESHOLD_TAG: string = 'convert-threshold';
  static readonly EXTRA_CLAIMABLE_RADIUS_TAG: string = 'extra-claimable-radius';
  static readonly GIFTS_TAG: string = 'gifts';
  static readonly MAXIMUM_GROWTH_TAG: string = 'maximum-growth';
  static readonly MAXIMUM_SIZE_TAG: string = 'maximum-size';
  static readonly MINIMUM_GROWTH_TAG: string = 'minimum-growth';
  static readonly MINIMUM_SIZE_TAG: string = 'minimum-size';
  static readonly TRADE_BONUS_TAG: string = 'trade-bonus';
  static readonly VISIBLE_RADIUS_TAG: string = 'visible-radius';
  static readonly WANDERING_RADIUS_TAG: string = 'wandering-radius';
  static readonly OLD_CLAIMABLE_RADIUS_TAG: string = 'claimableRadius';
  static readonly OLD_CONVERT_THRESHOLD_TAG: string = 'convertThreshold';
  static readonly OLD_EXTRA_CLAIMABLE_RADIUS_TAG: string = 'extraClaimableRadius';
  static readonly OLD_MAXIMUM_GROWTH_TAG: string = 'maximumGrowth';
  static readonly OLD_MAXIMUM_SIZE_TAG: string = 'maximumSize';
  static readonly OLD_MINIMUM_GROWTH_TAG: string = 'minimumGrowth';
  static readonly OLD_MINIMUM_SIZE_TAG: string = 'minimumSize';
  static readonly OLD_TRADE_BONUS_TAG: string = 'tradeBonus';
  static readonly OLD_VISIBLE_RADIUS_TAG: string = 'visibleRadius';
  static readonly OLD_WANDERING_RADIUS_TAG: string = 'wanderingRadius';
  $init_SettlementType() {
    this.capital = false;
    this.visibleRadius = 2;
    this.claimableRadius = 1;
    this.extraClaimableRadius = 2;
    this.wanderingRadius = 4;
    this.minimumSize_ = 3;
    this.maximumSize = 10;
    this.minimumGrowth = 1;
    this.maximumGrowth = 10;
    this.tradeBonus = 1;
    this.convertThreshold = 100;
    this.plunderTypes = null;
    this.gifts = null;
  }
  /**
   * Creates a new settlement type.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _SettlementType$String$Specification(id: string, specification: Specification): this {
    this._FreeColSpecObjectType$String$Specification(id, specification);
    this.$init_SettlementType();
    return this;
  }
  /**
   * Creates a new settlement type.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @param specification The {@code Specification} to refer to.
   * @exception XMLStreamException if there is problem reading the stream.
   */
  _SettlementType$FreeColXMLReader$Specification(xr: FreeColXMLReader, specification: Specification): this {
    this._FreeColSpecObjectType$Specification(specification);
    this.$init_SettlementType();
    this.readFromXML(xr);
    return this;
  }
  /**
   * Is this a capital settlement type?
   *
   * @return True if this is a capital.
   */
  isCapital(): boolean {
    return this.capital;
  }
  /**
   * Get the minimum size of this settlement type.
   *
   * @return The minimum settlement size.
   */
  getMinimumSize(): number {
    return this.minimumSize_;
  }
  /**
   * Get the maximum size of this settlement type.
   *
   * @return The maximum settlement size.
   */
  getMaximumSize(): number {
    return this.maximumSize;
  }
  /**
   * Get the visible radius of this settlement type.
   *
   * @return The visible radius.
   */
  getVisibleRadius(): number {
    return this.visibleRadius;
  }
  /**
   * Get the claimable radius of this settlement type.
   *
   * @return The claimable radius.
   */
  getClaimableRadius(): number {
    return this.claimableRadius;
  }
  /**
   * Get the extra claimable radius.
   *
   * @return The extra claimable radius.
   */
  getExtraClaimableRadius(): number {
    return this.extraClaimableRadius;
  }
  /**
   * Get the wandering radius for this settlement type.
   *
   * @return The wandering radius.
   */
  getWanderingRadius(): number {
    return this.wanderingRadius;
  }
  /**
   * Get the minimum growth value.
   *
   * @return The minimum number of tiles to try to grow this
   *     settlement type by.
   */
  getMinimumGrowth(): number {
    return this.minimumGrowth;
  }
  /**
   * Get the maximum growth value.
   *
   * @return The maximum number of tiles to try to grow this
   *     settlement type by.
   */
  getMaximumGrowth(): number {
    return this.maximumGrowth;
  }
  /**
   * Gets the trade bonus.
   *
   * @return The general bonus to trade.
   */
  getTradeBonus(): number {
    return this.tradeBonus;
  }
  /**
   * Gets the convert threshold for this settlement.
   *
   * @return The convert threshold.
   */
  getConvertThreshold(): number {
    return this.convertThreshold;
  }
  /**
   * Get the list of plunder types.
   *
   * @return The list of {@code PlunderType}s.
   */
  getPlunderTypes(): List<PlunderType> {
    return (this.plunderTypes == null) ? Collections.emptyList() : this.plunderTypes;
  }
  /**
   * Set the plunder types.
   *
   * @param plunderTypes The new plunder type list.
   */
  setPlunderTypes(plunderTypes: List<PlunderType>): void {
    if (this.plunderTypes == null) {
      this.plunderTypes = new ArrayList();
    } else {
      this.plunderTypes.clear();
    }
    this.plunderTypes.addAll(plunderTypes);
  }
  /**
   * Gets the plunder range available for the supplied unit.
   *
   * @param unit The {@code Unit} to check.
   * @return The plunder range, or null if none applicable.
   */
  getPlunderRange(unit: Unit): RandomRange {
    if (this.plunderTypes == null) {
      return null;
    }
    let pt = CollectionUtils.find$Collection$Predicate(this.plunderTypes, (p) => p.appliesTo(unit));
    return (pt == null) ? null : pt.getPlunder();
  }
  /**
   * Add a plunder type.
   *
   * @param pt The {@code PlunderType} to add.
   */
  addPlunderType(pt: PlunderType): void {
    if (this.plunderTypes == null) {
      this.plunderTypes = new ArrayList();
    }
    this.plunderTypes.add(pt);
  }
  /**
   * Get the range of gifts available to a unit.
   *
   * @return A range of gifts, or null if none applicable.
   */
  getGifts(): RandomRange {
    return this.gifts;
  }
  /**
   * Gets the warehouse capacity of this settlement.
   *
   * @return The warehouse capacity of this settlement.
   */
  getWarehouseCapacity(): number {
    return Math.imul(GoodsContainer.CARGO_SIZE, this.getClaimableRadius());
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(SettlementType));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.capital = o.isCapital();
    this.visibleRadius = o.getVisibleRadius();
    this.claimableRadius = o.getClaimableRadius();
    this.extraClaimableRadius = o.getExtraClaimableRadius();
    this.wanderingRadius = o.getWanderingRadius();
    this.minimumSize_ = o.getMinimumSize();
    this.maximumSize = o.getMaximumSize();
    this.minimumGrowth = o.getMinimumGrowth();
    this.maximumGrowth = o.getMaximumGrowth();
    this.tradeBonus = o.getTradeBonus();
    this.convertThreshold = o.getConvertThreshold();
    this.setPlunderTypes(o.getPlunderTypes());
    this.gifts = o.getGifts();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$boolean(SettlementType.CAPITAL_TAG, this.capital);
    xw.writeAttribute$String$int(SettlementType.MINIMUM_SIZE_TAG, this.minimumSize_);
    xw.writeAttribute$String$int(SettlementType.MAXIMUM_SIZE_TAG, this.maximumSize);
    xw.writeAttribute$String$int(SettlementType.VISIBLE_RADIUS_TAG, this.visibleRadius);
    xw.writeAttribute$String$int(SettlementType.CLAIMABLE_RADIUS_TAG, this.claimableRadius);
    xw.writeAttribute$String$int(SettlementType.EXTRA_CLAIMABLE_RADIUS_TAG, this.extraClaimableRadius);
    xw.writeAttribute$String$int(SettlementType.WANDERING_RADIUS_TAG, this.wanderingRadius);
    xw.writeAttribute$String$int(SettlementType.MINIMUM_GROWTH_TAG, this.minimumGrowth);
    xw.writeAttribute$String$int(SettlementType.MAXIMUM_GROWTH_TAG, this.maximumGrowth);
    xw.writeAttribute$String$int(SettlementType.TRADE_BONUS_TAG, this.tradeBonus);
    xw.writeAttribute$String$int(SettlementType.CONVERT_THRESHOLD_TAG, this.convertThreshold);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    if (this.plunderTypes != null) {
      for (const $it0 = this.plunderTypes.iterator(); $it0.hasNext(); ) {
        let pt = $it0.next();
        pt.toXML$FreeColXMLWriter(xw);
      }
    }
    if (this.gifts != null) {
      xw.writeStartElement(SettlementType.GIFTS_TAG);
      this.gifts.writeAttributes(xw);
      xw.writeEndElement();
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.capital = xr.getAttribute$String$boolean(SettlementType.CAPITAL_TAG, this.capital);
    if (xr.hasAttribute(SettlementType.OLD_MINIMUM_SIZE_TAG)) {
      this.minimumSize_ = xr.getAttribute$String$int(SettlementType.OLD_MINIMUM_SIZE_TAG, this.minimumSize_);
    } else {
      this.minimumSize_ = xr.getAttribute$String$int(SettlementType.MINIMUM_SIZE_TAG, this.minimumSize_);
    }
    if (xr.hasAttribute(SettlementType.OLD_MAXIMUM_SIZE_TAG)) {
      this.maximumSize = xr.getAttribute$String$int(SettlementType.OLD_MAXIMUM_SIZE_TAG, this.maximumSize);
    } else {
      this.maximumSize = xr.getAttribute$String$int(SettlementType.MAXIMUM_SIZE_TAG, this.maximumSize);
    }
    if (xr.hasAttribute(SettlementType.OLD_VISIBLE_RADIUS_TAG)) {
      this.visibleRadius = xr.getAttribute$String$int(SettlementType.OLD_VISIBLE_RADIUS_TAG, this.visibleRadius);
    } else {
      this.visibleRadius = xr.getAttribute$String$int(SettlementType.VISIBLE_RADIUS_TAG, this.visibleRadius);
    }
    if (xr.hasAttribute(SettlementType.OLD_CLAIMABLE_RADIUS_TAG)) {
      this.claimableRadius = xr.getAttribute$String$int(SettlementType.OLD_CLAIMABLE_RADIUS_TAG, this.claimableRadius);
    } else {
      this.claimableRadius = xr.getAttribute$String$int(SettlementType.CLAIMABLE_RADIUS_TAG, this.claimableRadius);
    }
    if (xr.hasAttribute(SettlementType.OLD_EXTRA_CLAIMABLE_RADIUS_TAG)) {
      this.extraClaimableRadius = xr.getAttribute$String$int(SettlementType.OLD_EXTRA_CLAIMABLE_RADIUS_TAG, this.extraClaimableRadius);
    } else {
      this.extraClaimableRadius = xr.getAttribute$String$int(SettlementType.EXTRA_CLAIMABLE_RADIUS_TAG, this.extraClaimableRadius);
    }
    if (xr.hasAttribute(SettlementType.OLD_WANDERING_RADIUS_TAG)) {
      this.wanderingRadius = xr.getAttribute$String$int(SettlementType.OLD_WANDERING_RADIUS_TAG, this.wanderingRadius);
    } else {
      this.wanderingRadius = xr.getAttribute$String$int(SettlementType.WANDERING_RADIUS_TAG, this.wanderingRadius);
    }
    if (xr.hasAttribute(SettlementType.OLD_MINIMUM_GROWTH_TAG)) {
      this.minimumGrowth = xr.getAttribute$String$int(SettlementType.OLD_MINIMUM_GROWTH_TAG, this.minimumGrowth);
    } else {
      this.minimumGrowth = xr.getAttribute$String$int(SettlementType.MINIMUM_GROWTH_TAG, this.minimumGrowth);
    }
    if (xr.hasAttribute(SettlementType.OLD_MAXIMUM_GROWTH_TAG)) {
      this.maximumGrowth = xr.getAttribute$String$int(SettlementType.OLD_MAXIMUM_GROWTH_TAG, this.maximumGrowth);
    } else {
      this.maximumGrowth = xr.getAttribute$String$int(SettlementType.MAXIMUM_GROWTH_TAG, this.maximumGrowth);
    }
    if (xr.hasAttribute(SettlementType.OLD_TRADE_BONUS_TAG)) {
      this.tradeBonus = xr.getAttribute$String$int(SettlementType.OLD_TRADE_BONUS_TAG, this.tradeBonus);
    } else {
      this.tradeBonus = xr.getAttribute$String$int(SettlementType.TRADE_BONUS_TAG, this.tradeBonus);
    }
    if (xr.hasAttribute(SettlementType.OLD_CONVERT_THRESHOLD_TAG)) {
      this.convertThreshold = xr.getAttribute$String$int(SettlementType.OLD_CONVERT_THRESHOLD_TAG, this.convertThreshold);
    } else {
      this.convertThreshold = xr.getAttribute$String$int(SettlementType.CONVERT_THRESHOLD_TAG, this.convertThreshold);
    }
  }
  /**
   * {@inheritDoc}
   */
  clearContainers$FreeColXMLReader(xr: FreeColXMLReader): void {
    super.clearContainers$FreeColXMLReader(xr);
    this.plunderTypes = null;
    this.gifts = null;
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
    let tag = xr.getLocalName();
    if ($J.equals(SettlementType.GIFTS_TAG, tag)) {
      this.gifts = new RandomRange()._RandomRange$FreeColXMLReader(xr);
      xr.closeTag$String(SettlementType.GIFTS_TAG);
    } else if ($J.equals(PlunderType.TAG, tag)) {
      this.addPlunderType(new PlunderType()._PlunderType$FreeColXMLReader$Specification(xr, this.getSpecification()));
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return SettlementType.TAG;
  }
}

$J.define(SettlementType, 'net.sf.freecol.common.model.SettlementType', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColSpecObjectType', ctors: { 'net.sf.freecol.common.io.FreeColXMLReader,net.sf.freecol.common.model.Specification': '_SettlementType$FreeColXMLReader$Specification', 'java.lang.String,net.sf.freecol.common.model.Specification': '_SettlementType$String$Specification' }, returns: { 'getXMLTagName': 'java.lang.String', 'getWarehouseCapacity': 'int', 'getGifts': 'net.sf.freecol.common.model.RandomRange', 'getPlunderTypes': 'java.util.List', 'getConvertThreshold': 'int', 'getTradeBonus': 'int', 'getMaximumGrowth': 'int', 'getMinimumGrowth': 'int', 'getWanderingRadius': 'int', 'getExtraClaimableRadius': 'int', 'getClaimableRadius': 'int', 'getVisibleRadius': 'int', 'getMaximumSize': 'int', 'getMinimumSize': 'int', 'isCapital': 'boolean' }, meths: { 'clearContainers(net.sf.freecol.common.io.FreeColXMLReader)': 'clearContainers$FreeColXMLReader' } });
$J.module(() => {
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
  PlunderType = $J.load('net.sf.freecol.common.model.PlunderType');
  RandomRange = $J.load('net.sf.freecol.common.model.RandomRange');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
