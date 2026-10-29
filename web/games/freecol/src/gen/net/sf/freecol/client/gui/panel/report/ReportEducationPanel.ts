// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/ReportEducationPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JFunction } from '../../../../../../../../jre/index.ts';
import { ReportPanel } from './ReportPanel.ts';

let Color, FlowLayout, JPanel, MigLayout, UnitLabel, BuildingPanel, Utility, StringTemplate, Unit, CollectionUtils;

/**
 * This panel displays the Education Report.
 */
export class ReportEducationPanel extends ReportPanel {
  /**
   * Creates the education report.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ReportEducationPanel(freeColClient: FreeColClient): this {
    this._ReportPanel(freeColClient, 'reportEducationAction');
    this.reportPanel.setLayout(new MigLayout()._MigLayout$String$String('wrap 2, fill', '[]20[fill, growprio 200]'));
    let player = this.getMyPlayer();
    let colonies = player.getColonyList();
    for (const $it0 = colonies.iterator(); $it0.hasNext(); ) {
      let colony = $it0.next();
      for (const $it1 = colony.getBuildings().iterator(); $it1.hasNext(); ) {
        let building = $it1.next();
        if (building.canTeach()) {
          this.reportPanel.add$Component$Object(this.createColonyButton$Colony(colony), 'newline, split 2, flowy');
          let bp = new BuildingPanel()._BuildingPanel(freeColClient, building);
          bp.initialize();
          this.reportPanel.add$Component(bp);
          let teacherPanel = this.getPanel('report.education.teachers');
          let teachers = CollectionUtils.transform$Stream$Predicate$Function$Comparator(colony.getUnits(), (u) => building.canAdd(u), JFunction.identity(), Unit.increasingSkillComparator);
          for (const $it2 = teachers.iterator(); $it2.hasNext(); ) {
            let u = $it2.next();
            teacherPanel.add$Component(new UnitLabel()._UnitLabel$FreeColClient$Unit$boolean$boolean(freeColClient, u, true, true));
          }
          this.reportPanel.add$Component$Object(teacherPanel, 'split 2, flowy, grow');
          let studentPanel = this.getPanel('report.education.students');
          for (const $it3 = colony.getUnitList().iterator(); $it3.hasNext(); ) {
            let unit = $it3.next();
            let teacher = CollectionUtils.find$Collection$Predicate(teachers, (u) => unit.canBeStudent(u));
            if (teacher != null) {
              let ul = new UnitLabel()._UnitLabel$FreeColClient$Unit$boolean$boolean(freeColClient, unit, true, true);
              studentPanel.add$Component(ul);
              Utility.localizeToolTip$JComponent$StringTemplate(ul, StringTemplate.template$String('report.education.tooltip').addNamed$String$Named('%skill%', unit.getTeachingType$Unit(teacher)));
            }
          }
          this.reportPanel.add$Component$Object(studentPanel, 'grow');
        }
      }
    }
    return this;
  }
  getPanel(key: string): JPanel {
    let result = new JPanel()._JPanel$LayoutManager(new FlowLayout()._FlowLayout$int(FlowLayout.LEADING));
    result.setOpaque(false);
    result.setBorder(Utility.localizedBorder$String$Color(key, Color.GRAY));
    return result;
  }
}

$J.define(ReportEducationPanel, 'net.sf.freecol.client.gui.panel.report.ReportEducationPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.report.ReportPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_ReportEducationPanel' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  FlowLayout = $J.load('java.awt.FlowLayout');
  JPanel = $J.load('javax.swing.JPanel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  UnitLabel = $J.load('net.sf.freecol.client.gui.label.UnitLabel');
  BuildingPanel = $J.load('net.sf.freecol.client.gui.panel.BuildingPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
