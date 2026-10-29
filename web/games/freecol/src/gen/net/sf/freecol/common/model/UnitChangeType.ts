// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/UnitChangeType.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Collections, HashMap, StringBuilder } from '../../../../../../jre/index.ts';
import { FreeColSpecObjectType } from './FreeColSpecObjectType.ts';

let UnitTypeChange, CollectionUtils;

/**
 * The possible changes of a unit type.
 */
export class UnitChangeType extends FreeColSpecObjectType {
  static readonly TAG: string = 'unit-change-type';
  /**
   * Changes due to the unit being captured.
   */
  static readonly CAPTURE: string = 'model.unitChange.capture';
  /**
   * Changes due to a clear-skill command.
   */
  static readonly CLEAR_SKILL: string = 'model.unitChange.clearSkill';
  /**
   * Changes due to a unit being converted by missionaries.
   */
  static readonly CONVERSION: string = 'model.unitChange.conversion';
  /**
   * Changes to be made immediately at creation of a unit.
   */
  static readonly CREATION: string = 'model.unitChange.creation';
  /**
   * Changes due to a unit being demoted after losing a battle.
   */
  static readonly DEMOTION: string = 'model.unitChange.demotion';
  /**
   * Changes due to education.
   */
  static readonly EDUCATION: string = 'model.unitChange.education';
  /**
   * Changes when a unit begins to work in a colony.  This is not in
   * the standard spec but in the convertUpgrade mod.  However it needs
   * coding support to work.
   */
  static readonly ENTER_COLONY: string = 'model.unitChange.enterColony';
  /**
   * Changes due to experience.
   */
  static readonly EXPERIENCE: string = 'model.unitChange.experience';
  /**
   * Change when a founding father is elected.
   */
  static readonly FOUNDING_FATHER: string = 'model.unitChange.foundingFather';
  /**
   * Changes at declaration of independence.
   */
  static readonly INDEPENDENCE: string = 'model.unitChange.independence';
  /**
   * Changes from exploring a lost city.
   */
  static readonly LOST_CITY: string = 'model.unitChange.lostCity';
  /**
   * Changes from living with the natives.
   */
  static readonly NATIVES: string = 'model.unitChange.natives';
  /**
   * Changes due to the unit being promoted after winning a battle.
   */
  static readonly PROMOTION: string = 'model.unitChange.promotion';
  /**
   * Changes due to the undead claiming the unit.
   */
  static readonly UNDEAD: string = 'model.unitChange.undead';
  /**
   * The individual unit changes valid for this change type.
   */
  changes: JMap<UnitType, List<UnitTypeChange>> = null;
  /**
   * True if this type of change always implies a change of owner.
   */
  ownerChange: boolean = false;
  static readonly OWNER_CHANGE_TAG: string = 'owner-change';
  /**
   * Trivial constructor.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to use.
   */
  _UnitChangeType(id: string, specification: Specification): this {
    this._FreeColSpecObjectType$String$Specification(id, specification);
    this.changes = new HashMap();
    this.ownerChange = false;
    return this;
  }
  /**
   * Get the owner change state.
   *
   * @return True if this type change is expected to be accompanied by
   *     an owner change.
   */
  getOwnerChange(): boolean {
    return this.ownerChange;
  }
  /**
   * Get the change map.
   *
   * @return The map of unit type to eligible changes.
   */
  getChanges(): JMap<UnitType, List<UnitTypeChange>> {
    return this.changes;
  }
  /**
   * Set the change map.
   *
   * @param changes The new map of unit type to eligible changes.
   */
  setChanges(changes: JMap<UnitType, List<UnitTypeChange>>): void {
    this.changes.clear();
    this.changes.putAll(changes);
  }
  /**
   * Add a new change.
   *
   * Public for the test suite.
   *
   * @param uc The {@code UnitTypeChange} to add.
   */
  addUnitTypeChange(uc: UnitTypeChange): void {
    CollectionUtils.appendToMapList(this.changes, uc.from, uc);
  }
  /**
   * Get the unit changes possible from a given unit type.
   *
   * @param from The source {@code UnitType}.
   * @return A list of {@code UnitChange}s.
   */
  getUnitChanges(from: UnitType): List<UnitTypeChange> {
    let ret = this.changes.get(from);
    return (ret == null) ? Collections.emptyList() : ret;
  }
  /**
   * Get a specific unit change for this unit change type, a
   * source unit type to change, and an optional destination unit type.
   *
   * @param fromType The {@code UnitType} to change from.
   * @param toType An optional {@code UnitType} to change to.
   * @return The {@code UnitChange} found, or null if the
   *     change is impossible.
   */
  getUnitChange(fromType: UnitType, toType: UnitType): UnitTypeChange {
    return CollectionUtils.find$Collection$Predicate(this.getUnitChanges(fromType), ((toType == null) ? CollectionUtils.alwaysTrue() : (uc) => uc.to === toType));
  }
  deleteUnitChanges(from: UnitType): void {
    this.changes.remove(from);
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(UnitChangeType));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.setChanges(o.getChanges());
    this.ownerChange = o.getOwnerChange();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$boolean(UnitChangeType.OWNER_CHANGE_TAG, this.ownerChange);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it0 = this.changes.values().iterator(); $it0.hasNext(); ) {
      let utcs = $it0.next();
      for (const $it1 = utcs.iterator(); $it1.hasNext(); ) {
        let uc = $it1.next();
        uc.toXML$FreeColXMLWriter(xw);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.ownerChange = xr.getAttribute$String$boolean(UnitChangeType.OWNER_CHANGE_TAG, false);
  }
  /**
   * {@inheritDoc}
   */
  clearContainers$FreeColXMLReader(xr: FreeColXMLReader): void {
    super.clearContainers$FreeColXMLReader(xr);
    this.changes.clear();
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
    if ($J.equals(UnitTypeChange.TAG, tag)) {
      this.addUnitTypeChange(new UnitTypeChange()._UnitTypeChange$FreeColXMLReader$Specification(xr, spec));
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return UnitChangeType.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append(this.getSuffix$()).append(' ownerChange=').append(String(this.ownerChange));
    for (const $it2 = this.changes.entrySet().iterator(); $it2.hasNext(); ) {
      let entry = $it2.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append(entry.getKey().getSuffix$()).append(String.fromCharCode(91 /* '[' */));
      for (const $it3 = entry.getValue().iterator(); $it3.hasNext(); ) {
        let uc = $it3.next();
        sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(uc));
      }
      sb.append(' ]');
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

$J.define(UnitChangeType, 'net.sf.freecol.common.model.UnitChangeType', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColSpecObjectType', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_UnitChangeType' }, returns: { 'getXMLTagName': 'java.lang.String', 'getChanges': 'java.util.Map', 'getOwnerChange': 'boolean' }, meths: { 'clearContainers(net.sf.freecol.common.io.FreeColXMLReader)': 'clearContainers$FreeColXMLReader' } });
$J.module(() => {
  UnitTypeChange = $J.load('net.sf.freecol.common.model.UnitTypeChange');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
