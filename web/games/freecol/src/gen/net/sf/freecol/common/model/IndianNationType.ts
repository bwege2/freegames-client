// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/IndianNationType.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, Collectors, JFunction } from '../../../../../../jre/index.ts';
import { NationType } from './NationType.ts';

let FreeColObject, FreeColSpecObjectType, Region, UnitType, CollectionUtils, RandomChoice;

/**
 * Represents one of the native nations present in the game.
 */
export class IndianNationType extends NationType {
  static readonly TAG: string = 'indian-nation-type';
  /**
   * Stores the ids of the skills taught by this Nation.
   */
  skills: List<RandomChoice<UnitType>> = null;
  /**
   * Identifiers for the regions that can be settled by this Nation.
   */
  regions: List<string> = null;
  static readonly PROBABILITY_TAG: string = 'probability';
  static readonly SKILL_TAG: string = 'skill';
  /**
   * Create a new native nation type.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _IndianNationType(id: string, specification: Specification): this {
    this._NationType(id, specification);
    this.skills = null;
    this.regions = null;
    return this;
  }
  /**
   * Is this a European nation type?
   *
   * @return False.
   */
  isEuropean(): boolean {
    return false;
  }
  /**
   * Is this a native nation type?
   *
   * @return True.
   */
  isIndian(): boolean {
    return true;
  }
  /**
   * Is this a REF nation type?
   *
   * @return False.
   */
  isREF(): boolean {
    return false;
  }
  /**
   * Get a message id for the general type of settlements of this nation.
   *
   * @param plural Choose the plural form or not.
   * @return A suitable message id.
   */
  getSettlementTypeKey(plural: boolean): string {
    return this.getSettlementType$boolean(false).getId() + ((plural) ? '.plural' : '');
  }
  /**
   * Gets a list of this Nation's skills.
   *
   * @return A list of national skills.
   */
  getSkills(): List<RandomChoice<UnitType>> {
    return (this.skills == null) ? Collections.emptyList() : this.skills;
  }
  /**
   * Set the skills of this nation.
   *
   * @param skills The new skills list.
   */
  setSkills(skills: List<RandomChoice<UnitType>>): void {
    this.skills.clear();
    this.skills.addAll(skills);
  }
  /**
   * Add a skill.
   *
   * @param unitType The {@code UnitType} skill taught.
   * @param probability The probability of the skill.
   */
  addSkill(unitType: UnitType, probability: number): void {
    if (this.skills == null) {
      this.skills = new ArrayList();
    }
    this.skills.add(new RandomChoice()._RandomChoice(unitType, probability));
  }
  /**
   * Generates choices for skill that could be taught from a settlement on
   * a given Tile.
   *
   * @param tile The {@code Tile} where the settlement will be located.
   * @return A random choice set of skills.
   */
  generateSkillsForTile(tile: Tile): List<RandomChoice<UnitType>> {
    let skills = this.getSkills();
    let scale = CollectionUtils.transform$Collection$Predicate$Function$Collector(skills, CollectionUtils.alwaysTrue(), JFunction.identity(), Collectors.toMap((rc) => rc.getObject().getExpertProduction(), (rc) => 1));
    for (const $it0 = tile.getSurroundingTiles$int(1).iterator(); $it0.hasNext(); ) {
      let t = $it0.next();
      CollectionUtils.forEachMapEntry$Map$Consumer(scale, (e) => {
        let goodsType = e.getKey();
        scale.put(goodsType, (e.getValue() + t.getPotentialProduction(goodsType, null)) | 0);
      });
    }
    let mapper = (rc) => {
      let ut = rc.getObject();
      let scaleValue = scale.get(ut.getExpertProduction());
      return new RandomChoice()._RandomChoice(ut, Math.imul(rc.getProbability(), scaleValue));
    };
    return CollectionUtils.transform$Collection$Predicate$Function(skills, CollectionUtils.alwaysTrue(), mapper);
  }
  /**
   * Gets the list of regions in which this tribe may settle.
   *
   * @return A list of regions identifiers.
   */
  getRegions(): List<string> {
    return (this.regions == null) ? Collections.emptyList() : this.regions;
  }
  /**
   * Set the settleable regions list.
   *
   * @param regions The new list of region identifiers.
   */
  setRegions(regions: List<string>): void {
    if (this.regions == null) {
      this.regions = new ArrayList();
    } else {
      this.regions.clear();
    }
    this.regions.addAll(regions);
  }
  /**
   * Add a region identifier.
   *
   * @param id The object identifier.
   */
  addRegion(id: string): void {
    if (this.regions == null) {
      this.regions = new ArrayList();
    }
    this.regions.add(id);
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(IndianNationType));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.setSkills(o.getSkills());
    this.setRegions(o.getRegions());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it1 = this.getSkills().iterator(); $it1.hasNext(); ) {
      let choice = $it1.next();
      xw.writeStartElement(IndianNationType.SKILL_TAG);
      xw.writeAttribute$String$FreeColObject(FreeColObject.ID_ATTRIBUTE_TAG, choice.getObject());
      xw.writeAttribute$String$int(IndianNationType.PROBABILITY_TAG, choice.getProbability());
      xw.writeEndElement();
    }
    for (const $it2 = this.getRegions().iterator(); $it2.hasNext(); ) {
      let region = $it2.next();
      xw.writeStartElement(Region.TAG);
      xw.writeAttribute(FreeColObject.ID_ATTRIBUTE_TAG, region);
      xw.writeEndElement();
    }
  }
  /**
   * {@inheritDoc}
   */
  clearContainers$FreeColXMLReader(xr: FreeColXMLReader): void {
    super.clearContainers$FreeColXMLReader(xr);
    this.skills = null;
    this.regions = null;
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    let parent = xr.getAlreadyInitializedType(spec, FreeColSpecObjectType.EXTENDS_TAG, $J.cls(IndianNationType), this);
    if (parent !== this) {
      if (parent.skills != null && !parent.skills.isEmpty()) {
        if (this.skills == null) {
          this.skills = new ArrayList();
        }
        this.skills.addAll(parent.skills);
      }
      if (parent.regions != null && !parent.regions.isEmpty()) {
        if (this.regions == null) {
          this.regions = new ArrayList();
        }
        this.regions.addAll(parent.regions);
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
    if ($J.equals(IndianNationType.SKILL_TAG, tag)) {
      this.addSkill(xr.getType(spec, FreeColObject.ID_ATTRIBUTE_TAG, $J.cls(UnitType), null), xr.getAttribute$String$int(IndianNationType.PROBABILITY_TAG, 0));
      xr.closeTag$String(IndianNationType.SKILL_TAG);
    } else if ($J.equals(Region.TAG, tag)) {
      this.addRegion(xr.readId());
      xr.closeTag$String(Region.TAG);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return IndianNationType.TAG;
  }
}

$J.define(IndianNationType, 'net.sf.freecol.common.model.IndianNationType', { kind: 'class', sup: 'net.sf.freecol.common.model.NationType', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_IndianNationType' }, returns: { 'getXMLTagName': 'java.lang.String', 'getRegions': 'java.util.List', 'getSkills': 'java.util.List', 'isREF': 'boolean', 'isIndian': 'boolean', 'isEuropean': 'boolean' }, meths: { 'clearContainers(net.sf.freecol.common.io.FreeColXMLReader)': 'clearContainers$FreeColXMLReader' } });
$J.module(() => {
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  FreeColSpecObjectType = $J.load('net.sf.freecol.common.model.FreeColSpecObjectType');
  Region = $J.load('net.sf.freecol.common.model.Region');
  UnitType = $J.load('net.sf.freecol.common.model.UnitType');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  RandomChoice = $J.load('net.sf.freecol.common.util.RandomChoice');
});
