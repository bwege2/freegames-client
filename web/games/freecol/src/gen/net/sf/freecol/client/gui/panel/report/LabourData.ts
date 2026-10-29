// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/LabourData.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, LinkedHashMap } from '../../../../../../../../jre/index.ts';

let Messages, Ability, Europe, Tile, Unit, WorkLocation, CollectionUtils;

/**
 * Holds labour statistics for the labour report.
 */
export class LabourData extends JObject {
  static UNITS_IN_EUROPE_GETTER: LabourData$LocationData$Getter = null;
  static UNITS_AT_SEA_GETTER: LabourData$LocationData$Getter = null;
  static UNITS_ON_LAND_GETTER: LabourData$LocationData$Getter = null;
  experts: JMap<GoodsType, LabourData$UnitData> = null;
  unitDataMap: JMap<string, LabourData$UnitData> = null;
  summary: LabourData$UnitData = null;
  missionary_: LabourData$UnitData = null;
  pioneer: LabourData$UnitData = null;
  soldier: LabourData$UnitData = null;
  scout: LabourData$UnitData = null;
  _LabourData(client: FreeColClient): this {
    this.experts = new LinkedHashMap();
    this.unitDataMap = new LinkedHashMap();
    this.summary = new LabourData$UnitData()._LabourData$UnitData(null);
    let spec = client.getGame().getSpecification();
    for (const $it0 = spec.getUnitTypeList().iterator(); $it0.hasNext(); ) {
      let unitType = $it0.next();
      if (!unitType.isAvailableTo([client.getMyPlayer()])) {
        continue;
      }
      let production = unitType.getExpertProduction();
      if (production != null) {
        this.experts.put(production, this.getUnitData(unitType));
      }
      if (unitType.hasAbility$String(Ability.EXPERT_PIONEER)) {
        this.pioneer = this.getUnitData(unitType);
      } else if (unitType.hasAbility$String(Ability.EXPERT_SOLDIER)) {
        this.soldier = this.getUnitData(unitType);
      } else if (unitType.hasAbility$String(Ability.EXPERT_SCOUT)) {
        this.scout = this.getUnitData(unitType);
      } else if (unitType.hasAbility$String(Ability.EXPERT_MISSIONARY)) {
        this.missionary_ = this.getUnitData(unitType);
      }
    }
    this.gatherData(client.getMyPlayer());
    return this;
  }
  gatherData(player: Player): void {
    let labourTypes = LabourData.getLabourTypes(player);
    for (const $it1 = (CollectionUtils.transform$Stream$Predicate(player.getUnits(), (u) => labourTypes.contains(u.getType()))).iterator(); $it1.hasNext(); ) {
      let unit = $it1.next();
      let location = unit.getLocation();
      let data = this.getUnitData(unit.getType());
      if (location instanceof WorkLocation) {
        this.incrementColonyCount(location.getColony(), unit, data);
      } else if (location instanceof Europe) {
        this.incrementOutsideWorker$UnitData$Unit$Getter$LabourData(data, unit, LabourData.UNITS_IN_EUROPE_GETTER);
      } else if (location instanceof Tile && (location).hasSettlement()) {
        this.incrementColonyCount(location.getSettlement(), unit, data);
      } else if (location instanceof Unit) {
        this.incrementOutsideWorker$UnitData$Unit$Getter$LabourData(data, unit, LabourData.UNITS_AT_SEA_GETTER);
      } else {
        this.incrementOutsideWorker$UnitData$Unit$Getter$LabourData(data, unit, LabourData.UNITS_ON_LAND_GETTER);
      }
    }
    this.summarize$$LabourData();
    for (const $it2 = this.unitDataMap.values().iterator(); $it2.hasNext(); ) {
      let unitData = $it2.next();
      let total = unitData.getTotal();
      let expertProduction = unitData.getUnitType().getExpertProduction();
      if (expertProduction != null) {
        for (const $it3 = player.getColonyList().iterator(); $it3.hasNext(); ) {
          let c = $it3.next();
          let net = c.getNetProductionOf(expertProduction);
          if (unitData.details.containsKey(c)) {
            unitData.getLocationData(c).netProduction = net;
          }
          total.netProduction = (total.netProduction + net) | 0;
        }
      }
    }
  }
  static getLabourTypes(player: Player): List<UnitType> {
    return CollectionUtils.transform$Collection$Predicate(player.getSpecification().getUnitTypeList(), (ut) => ut.hasSkill() && ut.isAvailableTo([player]));
  }
  summarize$$LabourData(): void {
    for (const $it4 = this.unitDataMap.values().iterator(); $it4.hasNext(); ) {
      let unitData = $it4.next();
      this.summarize$UnitData$Getter$LabourData(unitData, LabourData.UNITS_IN_EUROPE_GETTER);
      this.summarize$UnitData$Getter$LabourData(unitData, LabourData.UNITS_AT_SEA_GETTER);
      this.summarize$UnitData$Getter$LabourData(unitData, LabourData.UNITS_ON_LAND_GETTER);
      for (const $it5 = unitData.details.keySet().iterator(); $it5.hasNext(); ) {
        let colony = $it5.next();
        this.summarize$UnitData$Getter$LabourData(unitData, new LabourData$ColonyLocationDataGetter()._LabourData$ColonyLocationDataGetter(colony));
      }
    }
  }
  summarize$UnitData$Getter$LabourData(data: LabourData$UnitData, getter: LabourData$LocationData$Getter): void {
    let unitLocation = getter.getLocationData(data);
    let summaryLocation = getter.getLocationData(this.summary);
    data.total.add(unitLocation);
    summaryLocation.add(unitLocation);
    this.summary.total.add(unitLocation);
  }
  incrementOutsideWorker$UnitData$Unit$Getter$LabourData(unitData: LabourData$UnitData, unit: Unit, getter: LabourData$LocationData$Getter): void {
    let workingAs = null;
    if (unit.isArmed()) {
      workingAs = this.soldier;
    } else if (unit.hasAbility$String(Ability.ESTABLISH_MISSION)) {
      workingAs = this.missionary_;
    } else if (unit.hasAbility$String(Ability.IMPROVE_TERRAIN)) {
      workingAs = this.pioneer;
    } else if (unit.hasAbility$String(Ability.SPEAK_WITH_CHIEF)) {
      workingAs = this.scout;
    }
    if (workingAs == null) {
      getter.getLocationData(unitData).notWorking++;
    } else {
      this.incrementOutsideWorker$UnitData$Unit$UnitData$Getter$LabourData(unitData, unit, workingAs, getter);
    }
  }
  incrementOutsideWorker$UnitData$Unit$UnitData$Getter$LabourData(expert: LabourData$UnitData, unit: Unit, workingAs: LabourData$UnitData, getter: LabourData$LocationData$Getter): void {
    if (unit.getType() === workingAs.unitType) {
      getter.getLocationData(expert).workingProfessionals.colonists++;
    } else {
      getter.getLocationData(expert).workingAmateurs++;
      getter.getLocationData(workingAs).otherWorkingAmateurs.colonists++;
    }
  }
  incrementColonyCount(colony: Colony, unit: Unit, unitData: LabourData$UnitData): void {
    if (!unit.isInColony()) {
      this.incrementOutsideWorker$UnitData$Unit$Getter$LabourData(unitData, unit, new LabourData$ColonyLocationDataGetter()._LabourData$ColonyLocationDataGetter(colony));
      return;
    }
    let wl = unit.getWorkLocation();
    let colonyData = unitData.getLocationData(colony);
    let teacher = unit.getTeacher();
    if (teacher != null) {
      colonyData.students++;
      let learning = this.getUnitData(unit.getTeachingType$Unit(teacher));
      learning.getLocationData(colony).addOtherStudent(unitData.getUnitName());
    }
    if (wl.canTeach()) {
      colonyData.teachers++;
    }
    let currentlyWorking = unit.getWorkType();
    let production = (currentlyWorking == null) ? 0 : wl.getProductionOf(unit, currentlyWorking);
    let workingAs = this.experts.get(currentlyWorking);
    if (workingAs == null) {
    } else if (workingAs.getUnitType() === unit.getType()) {
      colonyData.getWorkingProfessionals().addProduction(production);
    } else {
      colonyData.workingAmateurs++;
      workingAs.getLocationData(colony).otherWorkingAmateurs.addProduction(production);
    }
  }
  /**
   * get profession data (create on demand)
   *
   * @param unitType goods unitType
   * @return profession data
   */
  getUnitData(unitType: UnitType): LabourData$UnitData {
    let data = this.unitDataMap.get(unitType.getId());
    if (data == null) {
      data = new LabourData$UnitData()._LabourData$UnitData(unitType);
      this.unitDataMap.put(unitType.getId(), data);
    }
    return data;
  }
  getSummary(): LabourData$UnitData {
    return this.summary;
  }
  static $clinit() {
    LabourData.UNITS_IN_EUROPE_GETTER = new (LabourData$1())();
    LabourData.UNITS_AT_SEA_GETTER = new (LabourData$2())();
    LabourData.UNITS_ON_LAND_GETTER = new (LabourData$3())();
  }
}

export class LabourData$ColonyLocationDataGetter extends JObject {
  /**
   * The colony to get data for.
   */
  colony: Colony = null;
  /**
   * Build a new location data getter for a given colony.
   *
   * @param colony The {@code Colony} to get data for.
   */
  _LabourData$ColonyLocationDataGetter(colony: Colony): this {
    this.colony = colony;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getLocationData(data: LabourData$UnitData): LabourData$LocationData {
    return data.getLocationData(this.colony);
  }
}

export class LabourData$ProductionData extends JObject {
  /**
   * number of colonists
   */
  colonists: number = 0;
  /**
   * Potential production
   */
  production: number = 0;
  _LabourData$ProductionData(): this {
    return this;
  }
  addProduction(production: number): void {
    this.colonists = (this.getColonists() + 1) | 0;
    this.production = (this.getProduction() + production) | 0;
  }
  getColonists(): number {
    return this.colonists;
  }
  getProduction(): number {
    return this.production;
  }
  add(data: LabourData$ProductionData): void {
    this.colonists = (this.colonists + data.colonists) | 0;
    this.production = (this.production + data.production) | 0;
  }
}

export class LabourData$LocationData extends JObject {
  /**
   * associated unit data
   */
  unitData: LabourData$UnitData = null;
  /**
   * if this is the total for the unit data
   */
  isTotal_: boolean = false;
  /**
   * experts working in their expert field
   */
  workingProfessionals: LabourData$ProductionData = null;
  /**
   * lumberjacks working as something else
   */
  workingAmateurs: number = 0;
  /**
   * others working as lumberjacks
   */
  otherWorkingAmateurs: LabourData$ProductionData = null;
  /**
   * net production of goods
   */
  netProduction: number = 0;
  /**
   * teachers
   */
  teachers: number = 0;
  /**
   * students learning this job (i.e. lumberjacks, not free colonists)
   */
  otherStudents: number = 0;
  /**
   * of the other students
   */
  otherStudentsName: string = null;
  /**
   * students in their old type (i.e. free colonists, not lumberjacks)
   */
  students: number = 0;
  /**
   * not working colonists
   */
  notWorking: number = 0;
  $init_LabourData_LocationData() {
    this.workingProfessionals = new LabourData$ProductionData()._LabourData$ProductionData();
    this.otherWorkingAmateurs = new LabourData$ProductionData()._LabourData$ProductionData();
  }
  _LabourData$LocationData$UnitData(unitData: LabourData$UnitData): this {
    this._LabourData$LocationData$UnitData$boolean(unitData, false);
    return this;
  }
  _LabourData$LocationData$UnitData$boolean(unitData: LabourData$UnitData, total: boolean): this {
    this.$init_LabourData_LocationData();
    this.unitData = unitData;
    this.isTotal_ = total;
    return this;
  }
  getOtherStudents(): number {
    return this.otherStudents;
  }
  getOtherStudentsName(): string {
    return this.otherStudentsName;
  }
  addOtherStudent(name: string): void {
    this.otherStudents++;
    this.otherStudentsName = name;
  }
  getWorkingProfessionals(): LabourData$ProductionData {
    return this.workingProfessionals;
  }
  getOtherWorkingAmateurs(): LabourData$ProductionData {
    return this.otherWorkingAmateurs;
  }
  getNetProduction(): number {
    return this.netProduction;
  }
  getTotalColonists(): number {
    return (this.workingAmateurs + this.workingProfessionals.getColonists() + this.notWorking + this.teachers + this.otherStudents - this.students) | 0;
  }
  getTotalProduction(): number {
    return (this.workingProfessionals.getProduction() + this.otherWorkingAmateurs.getProduction()) | 0;
  }
  /**
   * in the summary for all unit types, some rows are skipped
   *
   * @return the rows to display the unit data
   */
  getRowCount(): number {
    let isSummary = this.getUnitData().isSummary();
    let rows = 0;
    if (this.workingProfessionals.getColonists() > 0) {
      rows++;
    }
    if (this.workingAmateurs > 0) {
      rows++;
    }
    if (!isSummary && this.otherWorkingAmateurs.getColonists() > 0) {
      rows++;
    }
    if (this.teachers > 0) {
      rows++;
    }
    if (this.students > 0) {
      rows++;
    }
    if (!isSummary && this.otherStudents > 0) {
      rows++;
    }
    if (this.notWorking > 0) {
      rows++;
    }
    return rows;
  }
  isTraining(): boolean {
    return this.teachers > 0 || this.students > 0 || this.otherStudents > 0;
  }
  getWorkingAmateurs(): number {
    return this.workingAmateurs;
  }
  getTeachers(): number {
    return this.teachers;
  }
  getStudents(): number {
    return this.students;
  }
  getNotWorking(): number {
    return this.notWorking;
  }
  getUnitData(): LabourData$UnitData {
    return this.unitData;
  }
  isTotal(): boolean {
    return this.isTotal_;
  }
  add(data: LabourData$LocationData): void {
    this.workingProfessionals.add(data.workingProfessionals);
    this.workingAmateurs = (this.workingAmateurs + data.workingAmateurs) | 0;
    this.otherWorkingAmateurs.add(data.otherWorkingAmateurs);
    this.teachers = (this.teachers + data.teachers) | 0;
    this.students = (this.students + data.students) | 0;
    this.otherStudents = (this.otherStudents + data.otherStudents) | 0;
    this.notWorking = (this.notWorking + data.notWorking) | 0;
    if (data.otherStudents > 0) {
      this.otherStudentsName = data.otherStudentsName;
    }
  }
}

export class LabourData$LocationData$Getter {
}

export class LabourData$UnitData extends JObject {
  unitType: UnitType = null;
  summary: boolean = false;
  /**
   * Map[Colony, colony details]]
   */
  details: JMap<Colony, LabourData$LocationData> = null;
  total: LabourData$LocationData = null;
  unitsAtSea: LabourData$LocationData = null;
  unitsOnLand: LabourData$LocationData = null;
  unitsInEurope: LabourData$LocationData = null;
  _LabourData$UnitData(unitType: UnitType): this {
    this.summary = false;
    this.details = new LinkedHashMap();
    this.total = new LabourData$LocationData()._LabourData$LocationData$UnitData$boolean(this, true);
    this.unitsAtSea = new LabourData$LocationData()._LabourData$LocationData$UnitData(this);
    this.unitsOnLand = new LabourData$LocationData()._LabourData$LocationData$UnitData(this);
    this.unitsInEurope = new LabourData$LocationData()._LabourData$LocationData$UnitData(this);
    this.unitType = unitType;
    if (unitType == null) {
      this.summary = true;
    }
    return this;
  }
  /**
   * Get the labour data (create on demand).
   *
   * @param colony The {@code Colony} to query.
   * @return The {@code LocationData} found.
   */
  getLocationData(colony: Colony): LabourData$LocationData {
    let colonyData = this.details.get(colony);
    if (colonyData == null) {
      colonyData = new LabourData$LocationData()._LabourData$LocationData$UnitData(this);
      this.details.put(colony, colonyData);
    }
    return colonyData;
  }
  getUnitName(): string {
    return (this.isSummary()) ? null : Messages.getName$Named(this.unitType);
  }
  hasDetails(): boolean {
    return this.getTotal().getRowCount() > 0;
  }
  getUnitSummaryRowCount(): number {
    return Math.max(1, this.getTotal().getRowCount());
  }
  getUnitType(): UnitType {
    return this.unitType;
  }
  getTotal(): LabourData$LocationData {
    return this.total;
  }
  getUnitsAtSea(): LabourData$LocationData {
    return this.unitsAtSea;
  }
  getUnitsOnLand(): LabourData$LocationData {
    return this.unitsOnLand;
  }
  getUnitsInEurope(): LabourData$LocationData {
    return this.unitsInEurope;
  }
  getDetails(): JMap<Colony, LabourData$LocationData> {
    return this.details;
  }
  isSummary(): boolean {
    return this.summary;
  }
  showProduction(): boolean {
    return !this.summary && this.unitType.getExpertProduction() != null;
  }
  showNetProduction(): boolean {
    return this.showProduction() && this.unitType.getExpertProduction().isStorable();
  }
  getExpertProduction(): GoodsType {
    if (this.summary) {
      return null;
    }
    return this.getUnitType().getExpertProduction();
  }
}

let $LabourData$1: any = null;
/** An anonymous class (LabourData.java:73). */
function LabourData$1(): any {
  return $LabourData$1 ??= $J.local(class extends JObject {
    getLocationData(unitData: LabourData$UnitData): LabourData$LocationData {
      return unitData.unitsInEurope;
    }
  }, 'net.sf.freecol.client.gui.panel.report.LabourData$1', ['net.sf.freecol.client.gui.panel.report.LabourData$LocationData$Getter']);
}

let $LabourData$2: any = null;
/** An anonymous class (LabourData.java:81). */
function LabourData$2(): any {
  return $LabourData$2 ??= $J.local(class extends JObject {
    getLocationData(unitData: LabourData$UnitData): LabourData$LocationData {
      return unitData.unitsAtSea;
    }
  }, 'net.sf.freecol.client.gui.panel.report.LabourData$2', ['net.sf.freecol.client.gui.panel.report.LabourData$LocationData$Getter']);
}

let $LabourData$3: any = null;
/** An anonymous class (LabourData.java:89). */
function LabourData$3(): any {
  return $LabourData$3 ??= $J.local(class extends JObject {
    getLocationData(unitData: LabourData$UnitData): LabourData$LocationData {
      return unitData.unitsOnLand;
    }
  }, 'net.sf.freecol.client.gui.panel.report.LabourData$3', ['net.sf.freecol.client.gui.panel.report.LabourData$LocationData$Getter']);
}

$J.define(LabourData, 'net.sf.freecol.client.gui.panel.report.LabourData', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.client.FreeColClient': '_LabourData' }, returns: { 'getSummary': 'net.sf.freecol.client.gui.panel.report.LabourData$UnitData' }, meths: { 'incrementOutsideWorker(net.sf.freecol.client.gui.panel.report.LabourData$UnitData,net.sf.freecol.common.model.Unit,net.sf.freecol.client.gui.panel.report.LabourData$UnitData,net.sf.freecol.client.gui.panel.report.LabourData$LocationData$Getter)': 'incrementOutsideWorker$UnitData$Unit$UnitData$Getter$LabourData', 'incrementOutsideWorker(net.sf.freecol.client.gui.panel.report.LabourData$UnitData,net.sf.freecol.common.model.Unit,net.sf.freecol.client.gui.panel.report.LabourData$LocationData$Getter)': 'incrementOutsideWorker$UnitData$Unit$Getter$LabourData', 'summarize(net.sf.freecol.client.gui.panel.report.LabourData$UnitData,net.sf.freecol.client.gui.panel.report.LabourData$LocationData$Getter)': 'summarize$UnitData$Getter$LabourData', 'summarize()': 'summarize$$LabourData' }, clinit: true, lazy: ['UNITS_IN_EUROPE_GETTER', 'UNITS_AT_SEA_GETTER', 'UNITS_ON_LAND_GETTER'] });
$J.define(LabourData$ColonyLocationDataGetter, 'net.sf.freecol.client.gui.panel.report.LabourData$ColonyLocationDataGetter', { kind: 'class', ifaces: ['net.sf.freecol.client.gui.panel.report.LabourData$LocationData$Getter'], sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Colony': '_LabourData$ColonyLocationDataGetter' } });
$J.define(LabourData$ProductionData, 'net.sf.freecol.client.gui.panel.report.LabourData$ProductionData', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_LabourData$ProductionData' }, returns: { 'getProduction': 'int', 'getColonists': 'int' } });
$J.define(LabourData$LocationData, 'net.sf.freecol.client.gui.panel.report.LabourData$LocationData', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.client.gui.panel.report.LabourData$UnitData,boolean': '_LabourData$LocationData$UnitData$boolean', 'net.sf.freecol.client.gui.panel.report.LabourData$UnitData': '_LabourData$LocationData$UnitData' }, returns: { 'isTotal': 'boolean', 'getUnitData': 'net.sf.freecol.client.gui.panel.report.LabourData$UnitData', 'getNotWorking': 'int', 'getStudents': 'int', 'getTeachers': 'int', 'getWorkingAmateurs': 'int', 'isTraining': 'boolean', 'getRowCount': 'int', 'getTotalProduction': 'int', 'getTotalColonists': 'int', 'getNetProduction': 'int', 'getOtherWorkingAmateurs': 'net.sf.freecol.client.gui.panel.report.LabourData$ProductionData', 'getWorkingProfessionals': 'net.sf.freecol.client.gui.panel.report.LabourData$ProductionData', 'getOtherStudentsName': 'java.lang.String', 'getOtherStudents': 'int' } });
$J.define(LabourData$LocationData$Getter, 'net.sf.freecol.client.gui.panel.report.LabourData$LocationData$Getter', { kind: 'interface' });
$J.define(LabourData$UnitData, 'net.sf.freecol.client.gui.panel.report.LabourData$UnitData', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.UnitType': '_LabourData$UnitData' }, returns: { 'getExpertProduction': 'net.sf.freecol.common.model.GoodsType', 'isSummary': 'boolean', 'getDetails': 'java.util.Map', 'getUnitsInEurope': 'net.sf.freecol.client.gui.panel.report.LabourData$LocationData', 'getUnitsOnLand': 'net.sf.freecol.client.gui.panel.report.LabourData$LocationData', 'getUnitsAtSea': 'net.sf.freecol.client.gui.panel.report.LabourData$LocationData', 'getTotal': 'net.sf.freecol.client.gui.panel.report.LabourData$LocationData', 'getUnitType': 'net.sf.freecol.common.model.UnitType', 'getUnitSummaryRowCount': 'int', 'hasDetails': 'boolean', 'getUnitName': 'java.lang.String' } });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  WorkLocation = $J.load('net.sf.freecol.common.model.WorkLocation');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
