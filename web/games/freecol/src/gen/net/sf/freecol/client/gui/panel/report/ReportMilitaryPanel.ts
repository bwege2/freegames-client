// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/ReportMilitaryPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../../jre/index.ts';
import { ReportUnitPanel } from './ReportUnitPanel.ts';

let Ability;

/**
 * This panel displays the Military Report.
 */
export class ReportMilitaryPanel extends ReportUnitPanel {
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ReportMilitaryPanel(freeColClient: FreeColClient): this {
    this._ReportUnitPanel(freeColClient, 'reportMilitaryAction', true);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  isReportable$Unit(unit: Unit): boolean {
    return !unit.isNaval() && (unit.hasAbility$String(Ability.EXPERT_SOLDIER) || unit.isOffensiveUnit());
  }
  /**
   * {@inheritDoc}
   */
  isReportable$UnitType$Role(unitType: UnitType, role: Role): boolean {
    let player = this.getMyPlayer();
    if (!unitType.isAvailableTo([player]) || unitType.isNaval()) {
      return false;
    }
    return unitType.isOffensive() || (role.isAvailableTo([player, unitType]) && this.getSpecification().getMilitaryRolesList().contains(role));
  }
  /**
   * {@inheritDoc}
   */
  isReportableREF(au: AbstractUnit): boolean {
    return !au.getType(this.getSpecification()).isNaval();
  }
}

$J.define(ReportMilitaryPanel, 'net.sf.freecol.client.gui.panel.report.ReportMilitaryPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.report.ReportUnitPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_ReportMilitaryPanel' }, meths: { 'isReportable(net.sf.freecol.common.model.UnitType,net.sf.freecol.common.model.Role)': 'isReportable$UnitType$Role', 'isReportable(net.sf.freecol.common.model.Unit)': 'isReportable$Unit' } });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
});
