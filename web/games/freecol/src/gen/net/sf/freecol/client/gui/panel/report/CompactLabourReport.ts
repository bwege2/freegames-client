// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/CompactLabourReport.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Collections, Collectors, JString, StringBuilder } from '../../../../../../../../jre/index.ts';
import { ReportPanel } from './ReportPanel.ts';

let Color, Insets, ImageIcon, JButton, JLabel, SwingConstants, EmptyBorder, MigLayout, MigPanel, Utility, LabourData, Messages, Ability, StringTemplate, CollectionUtils;

/**
 * This panel displays the Labour Report.
 */
export class CompactLabourReport extends ReportPanel {
  static readonly COLONY_COLUMN: number = 0;
  static readonly UNIT_TYPE_COLUMN: number = 1;
  static readonly WORKING_COLUMN: number = 2;
  static readonly BUILDING_COLUMN: number = 3;
  static readonly COLONIST_COLUMN: number = 4;
  static readonly COLONIST_SUMMARY_COLUMN: number = 5;
  static readonly PRODUCTION_SYMBOL_COLUMN: number = 6;
  static readonly PRODUCTION_COLUMN: number = 7;
  static readonly PRODUCTION_SUMMARY_COLUMN: number = 8;
  static readonly NETPRODUCTION_SUMMARY_COLUMN: number = 9;
  static readonly COLUMNS: number = 10;
  labourData: LabourData = null;
  unitData: LabourData$UnitData = null;
  showProduction_: boolean = false;
  showNetProduction_: boolean = false;
  showProductionSymbols: boolean = false;
  showBuildings: boolean = false;
  headerRow: JPanel = null;
  $init_CompactLabourReport() {
    this.headerRow = new MigPanel()._MigPanel$String('ReportPanelUI');
  }
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _CompactLabourReport$FreeColClient(freeColClient: FreeColClient): this {
    this._CompactLabourReport$FreeColClient$UnitData(freeColClient, null);
    this.labourData = new LabourData()._LabourData(this.getFreeColClient());
    return this;
  }
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param data The {@code UnitData} to display in this report.
   */
  _CompactLabourReport$FreeColClient$UnitData(freeColClient: FreeColClient, data: LabourData$UnitData): this {
    this._ReportPanel(freeColClient, ((data == null) ? 'reportLabourAction' : 'report.labour.details'));
    this.$init_CompactLabourReport();
    this.unitData = data;
    this.headerRow.setBorder(new EmptyBorder()._EmptyBorder$int$int$int$int(20, 20, 0, 20));
    this.headerRow.setOpaque(true);
    this.scrollPane.setColumnHeaderView(this.headerRow);
    return this;
  }
  createColonyButton$Colony(colony: Colony): JButton {
    let text = colony.getName();
    if (!this.unitData.isSummary()) {
      if (colony.canTrain$UnitType(this.unitData.getUnitType())) {
        text += '*';
      }
    }
    return this.createButton(text, (ae) => {
      this.getGUI().showColonyPanel(colony, null);
    });
  }
  initialize(): void {
    if (this.isOverview()) {
      this.showProduction_ = true;
      this.showNetProduction_ = true;
      this.showProductionSymbols = true;
      this.showBuildings = false;
    } else {
      this.showProduction_ = this.unitData.showProduction();
      this.showNetProduction_ = this.unitData.showNetProduction();
      this.showProductionSymbols = false;
      let expertProduction = this.getGoodsType();
      this.showBuildings = (expertProduction != null && !expertProduction.isFarmed()) || this.unitData.getTotal().isTraining();
    }
    let layoutConstraints = 'fill, insets 0, gap 0 0';
    let widths = new StringBuilder();
    widths.append('[175, fill]');
    widths.append(this.isOverview() || !this.unitData.isSummary() ? '[150, fill]' : '[0!]');
    widths.append('[150, fill]');
    widths.append(this.showBuildings ? '[130, fill]' : '[0!]');
    widths.append('[26, fill][33, fill]');
    widths.append(this.showProductionSymbols ? '[50, fill]' : '[0!]');
    widths.append(this.showProduction_ ? '[30, fill][40, fill]' : '[0!][0!]');
    widths.append(this.showNetProduction_ ? '[40, fill]' : '[0!]');
    let columnConstraints = widths.toString();
    let rowConstraints = '[fill]';
    this.headerRow.setLayout(new MigLayout()._MigLayout$String$String$String(layoutConstraints, columnConstraints, rowConstraints));
    this.reportPanel.setLayout(new MigLayout()._MigLayout$String$String$String(layoutConstraints, columnConstraints, rowConstraints));
    this.addHeader();
    if (this.isOverview()) {
      this.addUnitTypes();
    } else {
      this.addLocations();
    }
  }
  /**
   * adds the header rows
   */
  addHeader(): void {
    let empty = new JLabel()._JLabel$();
    empty.setBorder(Utility.getTopLeftCellBorder());
    this.headerRow.add$Component$Object(empty, 'cell ' + CompactLabourReport.COLONY_COLUMN + ' 1');
    if (this.isOverview() || !this.unitData.isSummary()) {
      let unitType = Utility.localizedLabel$String('unitType');
      unitType.setBorder(Utility.getTopCellBorder());
      this.headerRow.add$Component$Object(unitType, 'cell ' + CompactLabourReport.UNIT_TYPE_COLUMN + ' 1');
    }
    let workingAs = Utility.localizedLabel$String('report.labour.workingAs');
    workingAs.setBorder(Utility.getTopCellBorder());
    this.headerRow.add$Component$Object(workingAs, 'cell ' + CompactLabourReport.WORKING_COLUMN + ' 1');
    if (this.showBuildings) {
      let building = Utility.localizedLabel$String('building');
      building.setBorder(Utility.getTopCellBorder());
      this.headerRow.add$Component$Object(building, 'cell ' + CompactLabourReport.BUILDING_COLUMN + ' 1');
    }
    let colonists = Utility.localizedLabel$String('colonists');
    colonists.setBorder(Utility.getTopCellBorder());
    this.headerRow.add$Component$Object(colonists, 'cell ' + CompactLabourReport.COLONIST_COLUMN + ' 1 2 1');
    if (this.isOverview()) {
      let production = Utility.localizedLabel$String('report.labour.production');
      production.setBorder(Utility.getTopCellBorder());
      this.headerRow.add$Component$Object(production, 'cell ' + CompactLabourReport.PRODUCTION_SYMBOL_COLUMN + ' 1 ' + ((CompactLabourReport.COLUMNS - CompactLabourReport.PRODUCTION_SYMBOL_COLUMN) | 0) + ' 1');
    } else if (this.showProduction_) {
      let unit = this.unitData;
      let goodsType = unit.getExpertProduction();
      let lib = this.getImageLibrary();
      let production = new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(lib.getScaledGoodsTypeImage(goodsType)));
      production.setBorder(Utility.getTopCellBorder());
      this.headerRow.add$Component$Object(production, 'cell ' + CompactLabourReport.PRODUCTION_SYMBOL_COLUMN + ' 1 ' + ((CompactLabourReport.COLUMNS - CompactLabourReport.PRODUCTION_SYMBOL_COLUMN + (this.showNetProduction_ && goodsType.isStoredAs() ? 1 : 0)) | 0) + ' 1');
      if (this.showNetProduction_ && goodsType.isStoredAs()) {
        let netProduction = new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(lib.getScaledGoodsTypeImage(goodsType.getStoredAs())));
        netProduction.setBorder(Utility.getTopCellBorder());
        this.headerRow.add$Component$Object(netProduction, 'cell ' + CompactLabourReport.NETPRODUCTION_SUMMARY_COLUMN + ' 1');
      }
    }
    if (!this.isSummary()) {
      let icon = new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getScaledUnitTypeImage(this.unitData.getUnitType()));
      this.header.setIcon(icon);
      this.header.setIconTextGap(20);
    }
  }
  /**
   * Add unit data for a given location.
   *
   * @param data The {@code LocationData} to add to.
   * @param colony The enclosing {@code Colony}.
   * @param row The starting row.
   * @return The finishing row.
   */
  addLocationData(data: LabourData$LocationData, colony: Colony, row: number): number {
    let allColonists = data.getUnitData().isSummary();
    let unit = data.getUnitData();
    let unitType = unit.getUnitType();
    let unitName = unit.getUnitName();
    let workingAs = null;
    let productionWL = null;
    if (!allColonists) {
      workingAs = Messages.message$String(unitType.getWorkingAsKey());
      if (colony != null) {
        let expert = unitType.getExpertProduction();
        if (expert != null) {
          productionWL = colony.getWorkLocationForProducing(expert);
        }
      }
    }
    this.addLocationSummary(data, row);
    let buildingStartRow = row;
    let otherAmateurs = data.getOtherWorkingAmateurs().getColonists();
    if (!allColonists && otherAmateurs > 0) {
      this.addRow$LocationData$String$String$JLabel$int$int$CompactLabourReport(data, Messages.message$String('report.labour.otherUnitType'), workingAs, this.createNonCountedLabel(otherAmateurs), data.getOtherWorkingAmateurs().getProduction(), row);
      row++;
    }
    row = this.addRow$LocationData$String$String$int$int$int$CompactLabourReport(data, unitName, allColonists ? Messages.message$String('report.labour.expertsWorking') : workingAs, data.getWorkingProfessionals().getColonists(), data.getWorkingProfessionals().getProduction(), row);
    let notProducingStartRow = row;
    if (this.showBuildings) {
      if (productionWL != null && row > buildingStartRow) {
        let buildingLabel = Utility.localizedLabel$StringTemplate(productionWL.getLabel());
        buildingLabel.setBorder(Utility.getCellBorder());
        this.reportPanel.add$Component$Object(buildingLabel, 'cell ' + CompactLabourReport.BUILDING_COLUMN + ' ' + buildingStartRow + ' 1 ' + ((row - buildingStartRow) | 0));
        buildingStartRow = row;
      } else {
        this.reportPanel.add$Component$Object(this.createEmptyLabel(), 'cell ' + CompactLabourReport.BUILDING_COLUMN + ' ' + buildingStartRow + ' 1 ' + ((row - buildingStartRow) | 0));
      }
    }
    row = this.addRow$LocationData$String$String$int$int$int$CompactLabourReport(data, unitName, Messages.message$String(allColonists ? 'report.labour.amateursWorking' : 'report.labour.workingAsOther'), data.getWorkingAmateurs(), 0, row);
    if (data.getNotWorking() > 0) {
      this.addRow$LocationData$String$String$JLabel$int$int$CompactLabourReport(data, unitName, Messages.message$String('report.labour.notWorking'), this.createNumberLabel(data.getNotWorking(), 'report.labour.notWorking.tooltip'), 0, row);
      row++;
    }
    let school = (colony != null && data.isTraining()) ? colony.getWorkLocationWithAbility$String(Ability.TEACH) : null;
    if (this.showBuildings && school != null && row > buildingStartRow) {
      this.reportPanel.add$Component$Object(this.createEmptyLabel(), 'cell ' + CompactLabourReport.BUILDING_COLUMN + ' ' + buildingStartRow + ' 1 ' + ((row - buildingStartRow) | 0));
      buildingStartRow = row;
    }
    row = this.addRow$LocationData$String$String$int$int$int$CompactLabourReport(data, unitName, Messages.message$String('report.labour.teacher'), data.getTeachers(), 0, row);
    if (!allColonists) {
      row = this.addRow$LocationData$String$String$int$int$int$CompactLabourReport(data, data.getOtherStudentsName(), Messages.message$StringTemplate(StringTemplate.template$String('report.labour.learning').addName$String$String('%unit%', data.getUnitData().getUnitName())), data.getOtherStudents(), 0, row);
    }
    let studentCount = data.getStudents();
    if (studentCount > 0) {
      if (allColonists) {
        this.addRow$LocationData$String$String$JLabel$int$int$CompactLabourReport(data, null, Messages.message$String('report.labour.sutdent'), this.createNonCountedLabel(studentCount), 0, row);
      } else {
        let teachingPred = (u) => {
          let student = u.getStudent();
          return student != null && student.getType() === unitType;
        };
        let studentMapper = (u) => unitType.getTeachingType(u.getType());
        let resultOfTraining = (colony == null) ? Collections.emptySet() : CollectionUtils.transform$Stream$Predicate$Function$Collector(colony.getTeachers(), teachingPred, studentMapper, Collectors.toSet());
        let student = (resultOfTraining.size() === 1) ? Messages.message$StringTemplate(StringTemplate.template$String('report.labour.learning').addName$String$FreeColObject('%unit%', CollectionUtils.first$Collection(resultOfTraining))) : Messages.message$String('report.labour.learningOther');
        this.addRow$LocationData$String$String$JLabel$int$int$CompactLabourReport(data, data.getUnitData().getUnitName(), student, this.createNumberLabel(-studentCount, 'report.labour.subtracted.tooltip'), 0, row);
      }
      row++;
    }
    if (this.showBuildings && row > buildingStartRow) {
      let buildingLabel = new JLabel()._JLabel$String((school == null) ? '' : Messages.message$StringTemplate(school.getLabel()));
      buildingLabel.setBorder(Utility.getCellBorder());
      this.reportPanel.add$Component$Object(buildingLabel, 'cell ' + CompactLabourReport.BUILDING_COLUMN + ' ' + buildingStartRow + ' 1 ' + ((row - buildingStartRow) | 0));
    }
    if (row > notProducingStartRow && data.getUnitData().showProduction()) {
      this.reportPanel.add$Component$Object(this.createEmptyLabel(), 'cell ' + CompactLabourReport.PRODUCTION_COLUMN + ' ' + notProducingStartRow + ' 1 ' + ((row - notProducingStartRow) | 0));
    }
    return row;
  }
  addLocations(): void {
    let player = this.getMyPlayer();
    let unitTotal = this.unitData.getTotal();
    let row = 1;
    let summaryLabel = Utility.localizedLabel$String('report.labour.summary');
    summaryLabel.setBorder(Utility.getLeftCellBorder());
    this.reportPanel.add$Component$Object(summaryLabel, 'cell ' + CompactLabourReport.COLONY_COLUMN + ' ' + row + ' 1 ' + unitTotal.getRowCount());
    row = this.addLocationData(unitTotal, null, row);
    for (const $it0 = player.getColonyList().iterator(); $it0.hasNext(); ) {
      let colony = $it0.next();
      let colonyData = this.unitData.getDetails().get(colony);
      if (colonyData != null) {
        this.reportPanel.add$Component$Object(this.createColonyButton$Colony(colony), 'cell ' + CompactLabourReport.COLONY_COLUMN + ' ' + row + ' 1 ' + colonyData.getRowCount());
        row = this.addLocationData(colonyData, colony, row);
      }
    }
    let europe = this.unitData.getUnitsInEurope();
    let euRow = europe.getRowCount();
    if (euRow > 0) {
      let nam = Messages.getName$Named(this.getMyPlayer().getEurope());
      let button = this.createButton(nam, (ae) => {
        this.getGUI().showEuropePanel();
      });
      this.reportPanel.add$Component$Object(button, 'cell ' + CompactLabourReport.COLONY_COLUMN + ' ' + row + ' 1 ' + euRow);
      row = this.addLocationData(europe, null, row);
    }
    row = this.addNonLinkedLocation(this.unitData.getUnitsOnLand(), 'report.labour.onLand', row);
    row = this.addNonLinkedLocation(this.unitData.getUnitsAtSea(), 'report.labour.atSea', row);
    this.reportPanel.add$Component$Object(Utility.localizedLabel$String('report.labour.canTrain'), 'cell 1 ' + row + ' ' + CompactLabourReport.COLUMNS + ' 1');
  }
  addLocationSummary(data: LabourData$LocationData, row: number): void {
    let rows = data.getRowCount();
    let colonistsLabel = this.createNumberLabel(data.getTotalColonists(), null);
    if (data.getUnitData().isSummary()) {
      if (this.isOverview()) {
        this.reportPanel.add$Component$Object(this.createEmptyLabel(), 'cell ' + CompactLabourReport.UNIT_TYPE_COLUMN + ' ' + row + ' 1 ' + rows);
      }
    } else {
      Utility.localizeToolTip$JComponent$StringTemplate(colonistsLabel, StringTemplate.template$String('report.labour.unitTotal.tooltip').addName$String$String('%unit%', data.getUnitData().getUnitName()));
    }
    this.reportPanel.add$Component$Object(colonistsLabel, 'cell ' + CompactLabourReport.COLONIST_SUMMARY_COLUMN + ' ' + row + ' 1 ' + data.getRowCount());
    if (this.showProduction_ && !data.getUnitData().showProduction()) {
      this.reportPanel.add$Component$Object(this.createEmptyLabel(), 'cell ' + CompactLabourReport.PRODUCTION_SYMBOL_COLUMN + ' ' + row + ' 4 ' + rows);
      return;
    }
    if (this.showProduction_) {
      let productionLabel = this.createNumberLabel(data.getTotalProduction(), 'report.labour.potentialProduction.tooltip');
      if (!data.isTotal() && data.getTotalProduction() === 0) {
        productionLabel.setText('');
      }
      this.reportPanel.add$Component$Object(productionLabel, 'cell ' + CompactLabourReport.PRODUCTION_SUMMARY_COLUMN + ' ' + row + ' 1 ' + rows);
    }
    if (this.showNetProduction_) {
      let net = data.getNetProduction();
      let netProductionLabel = this.createNumberLabel(net, 'report.labour.netProduction.tooltip');
      if (!data.getUnitData().showNetProduction() || (!data.isTotal() && net === 0)) {
        netProductionLabel.setText('');
        netProductionLabel.setToolTipText('');
      } else if (net >= 0) {
        netProductionLabel.setText('+' + net);
      } else {
        netProductionLabel.setForeground(Color.RED);
      }
      this.reportPanel.add$Component$Object(netProductionLabel, 'cell ' + CompactLabourReport.NETPRODUCTION_SUMMARY_COLUMN + ' ' + row + ' 1 ' + rows);
    }
    if (this.showProductionSymbols) {
      let icon = new JLabel()._JLabel$();
      icon.setBorder(Utility.getCellBorder());
      let goodsType = data.getUnitData().getExpertProduction();
      if (goodsType != null) {
        icon.setIcon(new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getScaledGoodsTypeImage(goodsType)));
      }
      this.reportPanel.add$Component$Object(icon, 'cell ' + CompactLabourReport.PRODUCTION_SYMBOL_COLUMN + ' ' + row + ' 1 ' + rows);
    }
  }
  addNonLinkedLocation(data: LabourData$LocationData, messageKey: string, row: number): number {
    let rows = data.getRowCount();
    if (rows <= 0) {
      return row;
    }
    let label = Utility.localizedLabel$String(messageKey);
    label.setBorder(Utility.getLeftCellBorder());
    label.setForeground(Color.GRAY);
    this.reportPanel.add$Component$Object(label, 'cell ' + CompactLabourReport.COLONY_COLUMN + ' ' + row + ' 1 ' + rows);
    return this.addLocationData(data, null, row);
  }
  addRow$LocationData$String$String$int$int$int$CompactLabourReport(data: LabourData$LocationData, typeName: string, activity: string, colonists: number, production: number, row: number): number {
    if (colonists > 0) {
      this.addRow$LocationData$String$String$JLabel$int$int$CompactLabourReport(data, typeName, activity, this.createNumberLabel(colonists, null), production, row);
      row++;
    }
    return row;
  }
  addRow$LocationData$String$String$JLabel$int$int$CompactLabourReport(data: LabourData$LocationData, typeName: string, activity: string, colonistLabel: JLabel, production: number, row: number): void {
    if (!data.getUnitData().isSummary()) {
      let typeLabel = new JLabel()._JLabel$String(typeName);
      typeLabel.setBorder(Utility.getCellBorder());
      this.reportPanel.add$Component$Object(typeLabel, 'cell ' + CompactLabourReport.UNIT_TYPE_COLUMN + ' ' + row);
    }
    let activityLabel = new JLabel()._JLabel$String(activity);
    activityLabel.setBorder(Utility.getCellBorder());
    this.reportPanel.add$Component$Object(activityLabel, 'cell ' + CompactLabourReport.WORKING_COLUMN + ' ' + row);
    this.reportPanel.add$Component$Object(colonistLabel, 'cell ' + CompactLabourReport.COLONIST_COLUMN + ' ' + row);
    if (production > 0 && data.getUnitData().showProduction()) {
      this.reportPanel.add$Component$Object(this.createNumberLabel(production, 'report.labour.potentialProduction.tooltip'), 'cell ' + CompactLabourReport.PRODUCTION_COLUMN + ' ' + row);
    }
  }
  addUnitTypes(): void {
    let row = 1;
    let allColonistsButton = this.createUnitNameButton(Messages.message$String('report.labour.allColonists'), this.labourData.getSummary());
    this.reportPanel.add$Component$Object(allColonistsButton, 'cell ' + CompactLabourReport.COLONY_COLUMN + ' ' + row + ' 1 ' + this.labourData.getSummary().getUnitSummaryRowCount());
    row = this.addLocationData(this.labourData.getSummary().getTotal(), null, row);
    for (const $it1 = LabourData.getLabourTypes(this.getMyPlayer()).iterator(); $it1.hasNext(); ) {
      let unitType = $it1.next();
      let unitData = this.labourData.getUnitData(unitType);
      let unitButton = this.createUnitNameButton(unitData.getUnitName(), unitData);
      let rows = unitData.getUnitSummaryRowCount();
      this.reportPanel.add$Component$Object(unitButton, 'cell ' + CompactLabourReport.COLONY_COLUMN + ' ' + row + ' 1 ' + rows);
      if (unitData.hasDetails()) {
        row = this.addLocationData(unitData.getTotal(), null, row);
      } else {
        unitButton.setEnabled(false);
        unitButton.setDisabledIcon(unitButton.getIcon());
        unitButton.setForeground(Color.GRAY);
        this.reportPanel.add$Component$Object(this.createEmptyLabel(), 'cell ' + CompactLabourReport.UNIT_TYPE_COLUMN + ' ' + row + ' ' + ((CompactLabourReport.COLUMNS - 1) | 0) + ' 1');
        row++;
      }
    }
  }
  createButton(name: string, listener: ActionListener): JButton {
    let button = new JButton()._JButton$String(name);
    button.setMargin(new Insets()._Insets(0, 0, 0, 0));
    button.setOpaque(false);
    button.setHorizontalAlignment(SwingConstants.LEADING);
    button.setForeground(Utility.getLinkColor());
    button.setBorder(Utility.getLeftCellBorder());
    button.addActionListener(listener);
    return button;
  }
  createEmptyLabel(): JLabel {
    let empty = new JLabel()._JLabel$();
    empty.setBorder(Utility.getCellBorder());
    return empty;
  }
  createNonCountedLabel(otherAmateurs: number): JLabel {
    let label = this.createNumberLabel(otherAmateurs, 'report.labour.notCounted.tooltip');
    label.setForeground(Color.GRAY);
    return label;
  }
  createNumberLabel(number$: number, toolTipKey: string): JLabel {
    let label = new JLabel()._JLabel$String(String(number$));
    label.setHorizontalAlignment(SwingConstants.TRAILING);
    label.setBorder(Utility.getCellBorder());
    if (toolTipKey != null) {
      Utility.localizeToolTip$JComponent$String(this, toolTipKey);
    }
    return label;
  }
  createUnitNameButton(name: string, unitData: LabourData$UnitData): JButton {
    let button = this.createButton(name, (ae) => {
      this.getGUI().showCompactLabourReport$UnitData(unitData);
    });
    if (!unitData.isSummary()) {
      button.setIcon(new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getScaledUnitTypeImage(unitData.getUnitType())));
    }
    return button;
  }
  getGoodsType(): GoodsType {
    return (this.isSummary()) ? null : this.unitData.getUnitType().getExpertProduction();
  }
  /**
   * Is this an overview/location summary?
   *
   * @return True if this is the location summary.
   */
  isOverview(): boolean {
    return this.unitData == null;
  }
  /**
   * Is this a summary?
   *
   * @return True if this is any sort of summary.
   */
  isSummary(): boolean {
    return this.isOverview() || this.unitData.isSummary();
  }
}

$J.define(CompactLabourReport, 'net.sf.freecol.client.gui.panel.report.CompactLabourReport', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.report.ReportPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.panel.report.LabourData$UnitData': '_CompactLabourReport$FreeColClient$UnitData', 'net.sf.freecol.client.FreeColClient': '_CompactLabourReport$FreeColClient' }, returns: { 'isSummary': 'boolean', 'isOverview': 'boolean', 'getGoodsType': 'net.sf.freecol.common.model.GoodsType' }, meths: { 'addRow(net.sf.freecol.client.gui.panel.report.LabourData$LocationData,java.lang.String,java.lang.String,javax.swing.JLabel,int,int)': 'addRow$LocationData$String$String$JLabel$int$int$CompactLabourReport', 'addRow(net.sf.freecol.client.gui.panel.report.LabourData$LocationData,java.lang.String,java.lang.String,int,int,int)': 'addRow$LocationData$String$String$int$int$int$CompactLabourReport', 'createColonyButton(net.sf.freecol.common.model.Colony)': 'createColonyButton$Colony' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Insets = $J.load('java.awt.Insets');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JButton = $J.load('javax.swing.JButton');
  JLabel = $J.load('javax.swing.JLabel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  EmptyBorder = $J.load('javax.swing.border.EmptyBorder');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  LabourData = $J.load('net.sf.freecol.client.gui.panel.report.LabourData');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
