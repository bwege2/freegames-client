// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/ReportCargoPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Specification;

/**
 * This panel displays the Cargo Report.
 */
export class ReportCargoPanel extends ReportUnitPanel {
  /**
   * Creates a cargo report.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ReportCargoPanel(freeColClient: FreeColClient): this {
    this._ReportUnitPanel(freeColClient, 'reportCargoAction', false);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  isReportable$Unit(unit: Unit): boolean {
    return unit.isCarrier() || unit.canCarryTreasure();
  }
  /**
   * {@inheritDoc}
   */
  isReportable$UnitType$Role(unitType: UnitType, role: Role): boolean {
    return unitType.isAvailableTo([this.getMyPlayer()]) && (unitType.canCarryUnits() || unitType.canCarryGoods() || unitType.canCarryTreasure()) && $J.equals(Specification.DEFAULT_ROLE_ID, role.getId());
  }
  /**
   * {@inheritDoc}
   */
  isReportableREF(au: AbstractUnit): boolean {
    return false;
  }
}

$J.define(ReportCargoPanel, 'net.sf.freecol.client.gui.panel.report.ReportCargoPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.report.ReportUnitPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_ReportCargoPanel' }, meths: { 'isReportable(net.sf.freecol.common.model.UnitType,net.sf.freecol.common.model.Role)': 'isReportable$UnitType$Role', 'isReportable(net.sf.freecol.common.model.Unit)': 'isReportable$Unit' } });
$J.module(() => {
  Specification = $J.load('net.sf.freecol.common.model.Specification');
});
