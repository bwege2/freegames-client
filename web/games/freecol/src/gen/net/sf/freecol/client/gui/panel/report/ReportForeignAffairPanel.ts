// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/ReportForeignAffairPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { ReportPanel } from './ReportPanel.ts';

let ImageIcon, JLabel, MigLayout, FontLibrary, MigPanel, Utility, Messages, StringTemplate;

/**
 * This panel displays the Foreign Affairs Report.
 */
export class ReportForeignAffairPanel extends ReportPanel {
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ReportForeignAffairPanel(freeColClient: FreeColClient): this {
    this._ReportPanel(freeColClient, 'reportForeignAction');
    let lib = this.getImageLibrary();
    let font = FontLibrary.getScaledFont$String('normal-bold-small');
    let stance = Messages.message$StringTemplate(StringTemplate.key$String('report.foreignAffair.stance'));
    let numberOfColonies = Messages.message$StringTemplate(StringTemplate.key$String('report.foreignAffair.numberOfColonies'));
    let numberOfUnits = Messages.message$StringTemplate(StringTemplate.key$String('report.foreignAffair.numberOfUnits'));
    let militaryStrength = Messages.message$StringTemplate(StringTemplate.key$String('report.foreignAffair.militaryStrength'));
    let navalStrength = Messages.message$StringTemplate(StringTemplate.key$String('report.foreignAffair.navalStrength'));
    let goldTitle = Messages.message$StringTemplate(StringTemplate.key$String('gold'));
    let continentalCongress_title = Messages.message$StringTemplate(StringTemplate.key$String('report.foreignAffair.congress'));
    let tax = Messages.message$StringTemplate(StringTemplate.key$String('tax'));
    let sonsOfLiberty = Messages.message$StringTemplate(StringTemplate.key$String('report.foreignAffair.sonsOfLiberty'));
    this.reportPanel.removeAll();
    this.reportPanel.setLayout(new MigLayout()._MigLayout$String$String$String('wrap 2', '[]push[]', '[align top]'));
    let n: number;
    for (const $it0 = this.getGame().getLiveEuropeanPlayerList([]).iterator(); $it0.hasNext(); ) {
      let enemy = $it0.next();
      let ns = this.igc().nationSummary(enemy);
      if (ns == null) {
        continue;
      }
      let enemyPanel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('gapy 0', '[][]20[align right]0[]', ''));
      enemyPanel.setOpaque(false);
      let coatOfArms = lib.getScaledNationImage(enemy.getNation());
      let coatLabel = new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(coatOfArms));
      enemyPanel.add$Component$Object(coatLabel, 'spany, aligny top');
      let label = Utility.localizedLabel$StringTemplate(enemy.getCountryLabel());
      label.setFont(font);
      enemyPanel.add$Component$Object(label, 'wrap 12');
      enemyPanel.add$Component$Object(new JLabel()._JLabel$String(stance), 'newline');
      enemyPanel.add$Component(Utility.localizedLabel$String(ns.getStance().getNameKey()));
      n = ns.getNumberOfSettlements();
      enemyPanel.add$Component$Object(new JLabel()._JLabel$String(numberOfColonies), 'newline');
      enemyPanel.add$Component(new JLabel()._JLabel$String(String(n)));
      n = ns.getNumberOfUnits();
      enemyPanel.add$Component$Object(new JLabel()._JLabel$String(numberOfUnits), 'newline');
      enemyPanel.add$Component(new JLabel()._JLabel$String(String(n)));
      n = ns.getMilitaryStrength();
      enemyPanel.add$Component$Object(new JLabel()._JLabel$String(militaryStrength), 'newline');
      enemyPanel.add$Component(new JLabel()._JLabel$String(String(n)));
      n = ns.getNavalStrength();
      enemyPanel.add$Component$Object(new JLabel()._JLabel$String(navalStrength), 'newline');
      enemyPanel.add$Component(new JLabel()._JLabel$String(String(n)));
      n = ns.getGold();
      enemyPanel.add$Component$Object(new JLabel()._JLabel$String(goldTitle), 'newline');
      enemyPanel.add$Component(new JLabel()._JLabel$String(String(n)));
      n = ns.getFoundingFathers();
      if (n >= 0) {
        enemyPanel.add$Component$Object(new JLabel()._JLabel$String(continentalCongress_title), 'newline 8');
        enemyPanel.add$Component(new JLabel()._JLabel$String(String(n)));
      }
      n = ns.getTax();
      if (n >= 0) {
        enemyPanel.add$Component$Object(new JLabel()._JLabel$String(tax), 'newline');
        enemyPanel.add$Component(new JLabel()._JLabel$String(String(n)));
        enemyPanel.add$Component(new JLabel()._JLabel$String('%'));
      }
      n = ns.getSoL();
      if (n >= 0) {
        enemyPanel.add$Component$Object(new JLabel()._JLabel$String(sonsOfLiberty), 'newline');
        enemyPanel.add$Component(new JLabel()._JLabel$String(String(n)));
        enemyPanel.add$Component(new JLabel()._JLabel$String('%'));
      }
      this.reportPanel.add$Component(enemyPanel);
    }
    this.reportPanel.add$Component$Object(Utility.localizedTextArea$String$int('report.foreignAffair.notice', 40), 'newline 20, span 8');
    this.reportPanel.doLayout();
    return this;
  }
}

$J.define(ReportForeignAffairPanel, 'net.sf.freecol.client.gui.panel.report.ReportForeignAffairPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.report.ReportPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_ReportForeignAffairPanel' } });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
});
