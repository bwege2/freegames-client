// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/EuropeanNationType.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap } from '../../../../../../jre/index.ts';
import { NationType } from './NationType.ts';

let AbstractUnit, FreeColObject, FreeColSpecObjectType, Specification, GameOptions, CollectionUtils;

/**
 * Represents one of the European nations present in the game,
 * i.e. both REFs and possible human players.
 */
export class EuropeanNationType extends NationType {
  static readonly TAG: string = 'european-nation-type';
  static readonly DEFAULT_MAP_KEY: string = 'default';
  static readonly EXPERT_MAP_KEY: string = 'expert';
  /**
   * Whether this is an REF Nation.
   */
  ref: boolean = false;
  /**
   * Stores the starting units of this Nation at various
   * difficulties.
   */
  startingUnitMap: JMap<string, JMap<string, AbstractUnit>> = null;
  static readonly EXPERT_STARTING_UNITS_TAG: string = 'expert-starting-units';
  static readonly REF_TAG: string = 'ref';
  static readonly ROLE_TAG: string = 'role';
  static readonly TYPE_TAG: string = 'type';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new European nation type.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _EuropeanNationType(id: string, specification: Specification): this {
    this._NationType(id, specification);
    this.ref = false;
    this.startingUnitMap = new HashMap();
    return this;
  }
  /**
   * Get the starting unit map.
   *
   * @return The map of national starting units by difficulty.
   */
  getStartingUnitMap(): JMap<string, JMap<string, AbstractUnit>> {
    return this.startingUnitMap;
  }
  /**
   * Set the starting unit map.
   *
   * @param startingUnitMap The new map of national starting units.
   */
  setStartingUnitMap(startingUnitMap: JMap<string, JMap<string, AbstractUnit>>): void {
    this.startingUnitMap.clear();
    this.startingUnitMap.putAll(startingUnitMap);
  }
  /**
   * Get the map key, either expert or default, according to a boolean.
   *
   * @param b The boolean to test.
   * @return The map key.
   */
  getMapKey(b: boolean): string {
    return (b) ? EuropeanNationType.EXPERT_MAP_KEY : EuropeanNationType.DEFAULT_MAP_KEY;
  }
  /**
   * Gets the starting units for this nation type.
   *
   * @return A list of {@code AbstractUnit}s to start with.
   */
  getStartingUnits$(): List<AbstractUnit> {
    let ex = this.getSpecification().getBoolean(GameOptions.EXPERT_STARTING_UNITS);
    return this.getStartingUnits$String(this.getMapKey(ex));
  }
  /**
   * Gets a list of this Nation's starting units at the given
   * difficulty.
   *
   * @param key The value of the expert-starting-units field.
   * @return A list of {@code AbstractUnit}s to start with.
   */
  getStartingUnits$String(key: string): List<AbstractUnit> {
    let result = new HashMap();
    let defaultMap = this.startingUnitMap.get(EuropeanNationType.DEFAULT_MAP_KEY);
    let difficultyMap = this.startingUnitMap.get(key);
    if (defaultMap != null) {
      result.putAll(defaultMap);
    }
    if (difficultyMap != null) {
      result.putAll(difficultyMap);
    }
    return new ArrayList(result.values());
  }
  /**
   * Add a starting unit.
   *
   * @param id The unit identifier.
   * @param unit The {@code AbstractUnit} to add.
   * @param expert Is this an expert unit?
   */
  addStartingUnit(id: string, unit: AbstractUnit, expert: boolean): void {
    let mapTag = this.getMapKey(expert);
    let units = this.startingUnitMap.get(mapTag);
    if (units == null) {
      units = new HashMap();
      this.startingUnitMap.put(mapTag, units);
    }
    units.put(id, unit);
  }
  /**
   * Is this a REF nation type?
   *
   * @return True if this is a REF nation type.
   */
  isREF(): boolean {
    return this.ref;
  }
  /**
   * Is this a European nation type?
   *
   * @return True.
   */
  isEuropean(): boolean {
    return true;
  }
  /**
   * Is this a native nation type?
   *
   * @return False.
   */
  isIndian(): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(EuropeanNationType));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.setStartingUnitMap(o.getStartingUnitMap());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$boolean(EuropeanNationType.REF_TAG, this.ref);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    if (this.startingUnitMap != null && !this.startingUnitMap.isEmpty()) {
      let map: JMap<string, AbstractUnit>;
      if ((map = this.startingUnitMap.get(EuropeanNationType.DEFAULT_MAP_KEY)) != null) {
        for (const $it0 = map.entrySet().iterator(); $it0.hasNext(); ) {
          let entry = $it0.next();
          this.writeUnit(xw, entry.getKey(), entry.getValue(), false);
        }
      }
      if ((map = this.startingUnitMap.get(EuropeanNationType.EXPERT_MAP_KEY)) != null) {
        for (const $it1 = map.entrySet().iterator(); $it1.hasNext(); ) {
          let entry = $it1.next();
          this.writeUnit(xw, entry.getKey(), entry.getValue(), true);
        }
      }
    }
  }
  writeUnit(xw: FreeColXMLWriter, id: string, au: AbstractUnit, expert: boolean): void {
    xw.writeStartElement(EuropeanNationType.UNIT_TAG);
    xw.writeAttribute(FreeColObject.ID_ATTRIBUTE_TAG, id);
    xw.writeAttribute$String$FreeColObject(EuropeanNationType.TYPE_TAG, au);
    xw.writeAttribute(EuropeanNationType.ROLE_TAG, au.getRoleId());
    if (expert) {
      xw.writeAttribute$String$boolean(EuropeanNationType.EXPERT_STARTING_UNITS_TAG, expert);
    }
    xw.writeEndElement();
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let spec = this.getSpecification();
    let parent = xr.getAlreadyInitializedType(spec, FreeColSpecObjectType.EXTENDS_TAG, $J.cls(EuropeanNationType), this);
    this.ref = xr.getAttribute$String$boolean(EuropeanNationType.REF_TAG, parent.ref);
  }
  /**
   * {@inheritDoc}
   */
  clearContainers$FreeColXMLReader(xr: FreeColXMLReader): void {
    super.clearContainers$FreeColXMLReader(xr);
    this.startingUnitMap.clear();
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    let parent = xr.getAlreadyInitializedType(spec, FreeColSpecObjectType.EXTENDS_TAG, $J.cls(EuropeanNationType), this);
    if (parent !== this) {
      CollectionUtils.forEachMapEntry$Map$Consumer(parent.startingUnitMap, (e) => this.startingUnitMap.put(e.getKey(), new HashMap(e.getValue())));
    }
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if ($J.equals(EuropeanNationType.UNIT_TAG, tag)) {
      let id = xr.readId();
      let type$ = xr.getAttribute$String$String(EuropeanNationType.TYPE_TAG, null);
      let roleId = xr.getAttribute$String$String(EuropeanNationType.ROLE_TAG, Specification.DEFAULT_ROLE_ID);
      let ex = xr.getAttribute$String$boolean(EuropeanNationType.EXPERT_STARTING_UNITS_TAG, false);
      this.addStartingUnit(id, new AbstractUnit()._AbstractUnit$String$String$int(type$, roleId, 1), ex);
      xr.closeTag$String(EuropeanNationType.UNIT_TAG);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return EuropeanNationType.TAG;
  }
}

$J.define(EuropeanNationType, 'net.sf.freecol.common.model.EuropeanNationType', { kind: 'class', sup: 'net.sf.freecol.common.model.NationType', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_EuropeanNationType' }, returns: { 'getXMLTagName': 'java.lang.String', 'isIndian': 'boolean', 'isEuropean': 'boolean', 'isREF': 'boolean', 'getStartingUnits$': 'java.util.List', 'getStartingUnitMap': 'java.util.Map' }, meths: { 'clearContainers(net.sf.freecol.common.io.FreeColXMLReader)': 'clearContainers$FreeColXMLReader', 'getStartingUnits(java.lang.String)': 'getStartingUnits$String', 'getStartingUnits()': 'getStartingUnits$' } });
$J.module(() => {
  AbstractUnit = $J.load('net.sf.freecol.common.model.AbstractUnit');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  FreeColSpecObjectType = $J.load('net.sf.freecol.common.model.FreeColSpecObjectType');
  Specification = $J.load('net.sf.freecol.common.model.Specification');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
