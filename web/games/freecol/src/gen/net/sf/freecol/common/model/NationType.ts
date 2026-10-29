// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/NationType.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, JEnum } from '../../../../../../jre/index.ts';
import { FreeColSpecObjectType } from './FreeColSpecObjectType.ts';

let SettlementType, CollectionUtils, StringUtils;

/**
 * Represents the type of one of the nations present in the game.
 */
export class NationType extends FreeColSpecObjectType {
  /**
   * The number of settlements this Nation has.
   */
  numberOfSettlements: NationType$SettlementNumber = null;
  /**
   * The aggression of this Nation.
   */
  aggression: NationType$AggressionLevel = null;
  /**
   * The types of settlement this Nation has.
   */
  settlementTypes: List<SettlementType> = null;
  static readonly AGGRESSION_TAG: string = 'aggression';
  static readonly NUMBER_OF_SETTLEMENTS_TAG: string = 'number-of-settlements';
  static readonly SETTLEMENT_TAG: string = 'settlement';
  /**
   * Default nation type constructor.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _NationType(id: string, specification: Specification): this {
    this._FreeColSpecObjectType$String$Specification(id, specification);
    this.numberOfSettlements = NationType$SettlementNumber.AVERAGE;
    this.aggression = NationType$AggressionLevel.AVERAGE;
    this.settlementTypes = null;
    return this;
  }
  /**
   * Get the settlement types.
   *
   * @return A list of {@code SettlementType}s.
   */
  getSettlementTypes(): List<SettlementType> {
    return (this.settlementTypes == null) ? Collections.emptyList() : this.settlementTypes;
  }
  /**
   * Set the settlement types.
   *
   * @param settlementTypes A new list of {@code SettlementType}s.
   */
  setSettlementTypes(settlementTypes: List<SettlementType>): void {
    if (this.settlementTypes == null) {
      this.settlementTypes = new ArrayList();
    } else {
      this.settlementTypes.clear();
    }
    this.settlementTypes.addAll(settlementTypes);
  }
  /**
   * Add a settlement type.
   *
   * @param settlementType The {@code SettlementType} to add.
   */
  addSettlementType(settlementType: SettlementType): void {
    if (this.settlementTypes == null) {
      this.settlementTypes = new ArrayList();
    }
    this.settlementTypes.add(settlementType);
  }
  /**
   * Add settlement types.
   *
   * @param types A list of {@code SettlementType}s to add.
   */
  addSettlementTypes(types: List<SettlementType>): void {
    if (this.settlementTypes == null) {
      this.settlementTypes = new ArrayList();
    }
    this.settlementTypes.addAll(types);
  }
  /**
   * Gets the settlement type for the national capital.
   *
   * @return The capital {@code SettlementType}.
   */
  getCapitalType(): SettlementType {
    return this.getSettlementType$boolean(true);
  }
  /**
   * Gets the settlement type for a settlement of this nation.
   *
   * @param isCapital If true, get the capital type.
   * @return The settlement type.
   */
  getSettlementType$boolean(isCapital: boolean): SettlementType {
    return CollectionUtils.find$Collection$Predicate(this.getSettlementTypes(), CollectionUtils.matchKey$Object$Function(isCapital, ($p0) => $p0.isCapital()));
  }
  /**
   * Get a settlement type by identifier.
   *
   * @param id The object identifier.
   * @return The settlement type.
   */
  getSettlementType$String(id: string): SettlementType {
    return CollectionUtils.find$Collection$Predicate(this.getSettlementTypes(), CollectionUtils.matchKeyEquals$Object$Function(id, ($p0) => $p0.getId()));
  }
  /**
   * Get the national number of settlements.
   *
   * @return The {@code SettlementNumber}.
   */
  getNumberOfSettlements(): NationType$SettlementNumber {
    return this.numberOfSettlements;
  }
  /**
   * Get the national aggression.
   *
   * @return The national {@code AggressionLevel}.
   */
  getAggression(): NationType$AggressionLevel {
    return this.aggression;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(NationType));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.numberOfSettlements = o.getNumberOfSettlements();
    this.aggression = o.getAggression();
    this.setSettlementTypes(o.getSettlementTypes());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$Enum(NationType.NUMBER_OF_SETTLEMENTS_TAG, this.numberOfSettlements);
    xw.writeAttribute$String$Enum(NationType.AGGRESSION_TAG, this.aggression);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it0 = this.getSettlementTypes().iterator(); $it0.hasNext(); ) {
      let settlementType = $it0.next();
      settlementType.toXML$FreeColXMLWriter$String(xw, NationType.SETTLEMENT_TAG);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let spec = this.getSpecification();
    let parent = xr.getAlreadyInitializedType(spec, FreeColSpecObjectType.EXTENDS_TAG, $J.cls(NationType), this);
    this.numberOfSettlements = xr.getAttribute$String$Class$Enum(NationType.NUMBER_OF_SETTLEMENTS_TAG, $J.cls(NationType$SettlementNumber), parent.numberOfSettlements);
    this.aggression = xr.getAttribute$String$Class$Enum(NationType.AGGRESSION_TAG, $J.cls(NationType$AggressionLevel), parent.aggression);
  }
  /**
   * {@inheritDoc}
   */
  clearContainers$FreeColXMLReader(xr: FreeColXMLReader): void {
    super.clearContainers$FreeColXMLReader(xr);
    this.settlementTypes = null;
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    let parent = xr.getAlreadyInitializedType(spec, FreeColSpecObjectType.EXTENDS_TAG, $J.cls(NationType), this);
    if (parent !== this) {
      if (parent.settlementTypes != null) {
        this.addSettlementTypes(parent.settlementTypes);
      }
      this.addFeatures(parent);
      if (parent.isAbstractType()) {
        this.getFeatureContainer().replaceSource(parent, this);
      }
    }
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    let tag = xr.getLocalName();
    if ($J.equals(NationType.SETTLEMENT_TAG, tag)) {
      this.addSettlementType(new SettlementType()._SettlementType$FreeColXMLReader$Specification(xr, spec));
    } else {
      super.readChild(xr);
    }
  }
}

export class NationType$SettlementNumber extends JEnum {
  static LOW: NationType$SettlementNumber = null;
  static AVERAGE: NationType$SettlementNumber = null;
  static HIGH: NationType$SettlementNumber = null;
  static $VALUES: NationType$SettlementNumber[] = null;
  _NationType$SettlementNumber($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  /**
   * Get a message key for this settlement number.
   *
   * @return A message key.
   */
  getKey(): string {
    return 'settlementNumber.' + StringUtils.getEnumKey(this);
  }
  static values(): NationType$SettlementNumber[] { return NationType$SettlementNumber.$VALUES.slice(); }
  static valueOf(name: string): NationType$SettlementNumber { return $J.enumValueOf(NationType$SettlementNumber, name); }
  static $clinit() {
    NationType$SettlementNumber.LOW = new NationType$SettlementNumber()._NationType$SettlementNumber('LOW', 0);
    NationType$SettlementNumber.AVERAGE = new NationType$SettlementNumber()._NationType$SettlementNumber('AVERAGE', 1);
    NationType$SettlementNumber.HIGH = new NationType$SettlementNumber()._NationType$SettlementNumber('HIGH', 2);
    NationType$SettlementNumber.$VALUES = [NationType$SettlementNumber.LOW, NationType$SettlementNumber.AVERAGE, NationType$SettlementNumber.HIGH];
  }
}

export class NationType$AggressionLevel extends JEnum {
  static LOW: NationType$AggressionLevel = null;
  static AVERAGE: NationType$AggressionLevel = null;
  static HIGH: NationType$AggressionLevel = null;
  static $VALUES: NationType$AggressionLevel[] = null;
  _NationType$AggressionLevel($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  /**
   * Get a message key for this aggression level.
   *
   * @return A message key.
   */
  getKey(): string {
    return 'aggressionLevel.' + StringUtils.getEnumKey(this);
  }
  static values(): NationType$AggressionLevel[] { return NationType$AggressionLevel.$VALUES.slice(); }
  static valueOf(name: string): NationType$AggressionLevel { return $J.enumValueOf(NationType$AggressionLevel, name); }
  static $clinit() {
    NationType$AggressionLevel.LOW = new NationType$AggressionLevel()._NationType$AggressionLevel('LOW', 0);
    NationType$AggressionLevel.AVERAGE = new NationType$AggressionLevel()._NationType$AggressionLevel('AVERAGE', 1);
    NationType$AggressionLevel.HIGH = new NationType$AggressionLevel()._NationType$AggressionLevel('HIGH', 2);
    NationType$AggressionLevel.$VALUES = [NationType$AggressionLevel.LOW, NationType$AggressionLevel.AVERAGE, NationType$AggressionLevel.HIGH];
  }
}

$J.define(NationType, 'net.sf.freecol.common.model.NationType', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColSpecObjectType', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_NationType' }, returns: { 'isREF': 'boolean', 'isIndian': 'boolean', 'isEuropean': 'boolean', 'getAggression': 'net.sf.freecol.common.model.NationType$AggressionLevel', 'getNumberOfSettlements': 'net.sf.freecol.common.model.NationType$SettlementNumber', 'getCapitalType': 'net.sf.freecol.common.model.SettlementType', 'getSettlementTypes': 'java.util.List' }, meths: { 'clearContainers(net.sf.freecol.common.io.FreeColXMLReader)': 'clearContainers$FreeColXMLReader', 'getSettlementType(java.lang.String)': 'getSettlementType$String', 'getSettlementType(boolean)': 'getSettlementType$boolean' } });
$J.define(NationType$SettlementNumber, 'net.sf.freecol.common.model.NationType$SettlementNumber', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_NationType$SettlementNumber' }, returns: { 'getKey': 'java.lang.String' }, clinit: true, lazy: ['$VALUES', 'LOW', 'AVERAGE', 'HIGH'] });
$J.define(NationType$AggressionLevel, 'net.sf.freecol.common.model.NationType$AggressionLevel', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_NationType$AggressionLevel' }, returns: { 'getKey': 'java.lang.String' }, clinit: true, lazy: ['$VALUES', 'LOW', 'AVERAGE', 'HIGH'] });
$J.module(() => {
  SettlementType = $J.load('net.sf.freecol.common.model.SettlementType');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
