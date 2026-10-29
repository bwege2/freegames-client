// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/ReportContinentalCongressPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, EnumMap, JString } from '../../../../../../../../jre/index.ts';
import { ReportPanel } from './ReportPanel.ts';

let ImageIcon, JLabel, JScrollPane, JTabbedPane, ScrollPaneConstants, SwingConstants, MigLayout, FreeColProgressBar, MigPanel, Utility, FreeColDebugger, FreeColDebugger$DebugMode, Messages, FoundingFather$FoundingFatherType, StringTemplate, CollectionUtils;

/**
 * This panel displays the ContinentalCongress Report.
 */
export class ReportContinentalCongressPanel extends ReportPanel {
  static none: string = null;
  /**
   * Creates the continental congress report.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ReportContinentalCongressPanel(freeColClient: FreeColClient): this {
    this._ReportPanel(freeColClient, 'reportCongressAction');
    let tabs = new JTabbedPane()._JTabbedPane$int(SwingConstants.TOP);
    tabs.setOpaque(false);
    let player = this.getMyPlayer();
    let currentFather = player.getCurrentFather();
    let recruitingPanel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String('center, wrap 1', 'center'));
    if (currentFather == null) {
      recruitingPanel.add$Component$Object(new JLabel()._JLabel$String(ReportContinentalCongressPanel.none), 'wrap 20');
    } else {
      let name = Messages.getName$Named(currentFather);
      let button = Utility.getLinkButton(name, null, currentFather.getId());
      button.addActionListener($J.fn(this, 'actionPerformed'));
      recruitingPanel.add$Component(button);
      let currentFatherLabel = new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getFoundingFatherImage(currentFather, false)));
      currentFatherLabel.setToolTipText(Messages.getDescription$ObjectWithId(currentFather));
      recruitingPanel.add$Component(currentFatherLabel);
      for (const $it0 = this.getSpecification().getLibertyGoodsTypeList().iterator(); $it0.hasNext(); ) {
        let gt = $it0.next();
        let total = CollectionUtils.sum$Stream$ToIntFunction(player.getColonies(), (c) => c.getNetProductionOf(gt));
        let progressBar = new FreeColProgressBar()._FreeColProgressBar$FreeColClient$GoodsType$int$int$int$int(freeColClient, gt, 0, player.getTotalFoundingFatherCost(), player.getLiberty(), total);
        recruitingPanel.add$Component$Object(progressBar, 'wrap 20');
      }
    }
    tabs.addTab$String$Icon$Component$String(Messages.message$String('report.continentalCongress.recruiting'), null, recruitingPanel, null);
    let panels = new EnumMap($J.cls(FoundingFather$FoundingFatherType));
    for (let type$ of FoundingFather$FoundingFatherType.values()) {
      let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String('flowy', '[center]'));
      panels.put(type$, panel);
      let imageScrollPane = new JScrollPane()._JScrollPane$Component$int$int(panel, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED);
      tabs.addTab$String$Icon$Component$String(Messages.message$String(type$.getTypeKey()), null, imageScrollPane, null);
    }
    let age = this.getGame().getAge();
    let electionTurns = this.getMyPlayer().getElectionTurns();
    for (const $it1 = this.getSpecification().getFoundingFathers().iterator(); $it1.hasNext(); ) {
      let father = $it1.next();
      let panel = panels.get(father.getType());
      let image: Image;
      let turn = null;
      if (player.hasFather(father)) {
        image = this.getImageLibrary().getFoundingFatherImage(father, false);
        turn = electionTurns.get(Messages.nameKey$ObjectWithId(father));
      } else {
        image = this.getImageLibrary().getFoundingFatherImage(father, true);
      }
      panel.add$Component$Object(new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(image)), 'newline');
      let button = Utility.getLinkButton(Messages.getName$Named(father), null, father.getId());
      button.addActionListener($J.fn(this, 'actionPerformed'));
      panel.add$Component(button);
      panel.add$Component((turn != null) ? Utility.localizedLabel$StringTemplate(StringTemplate.template$String('report.continentalCongress.elected').addStringTemplate$String$StringTemplate('%turn%', turn.getLabel())) : (father === currentFather) ? Utility.localizedLabel$String('report.continentalCongress.recruiting') : Utility.localizedLabel$String('report.continentalCongress.available'));
      if (FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.MENUS)) {
        panel.add$Component(new JLabel()._JLabel$String(String(father.getWeight(age))));
      }
    }
    panels.clear();
    this.setMainComponent(tabs);
    return this;
  }
  static $clinit() {
    ReportContinentalCongressPanel.none = Messages.message$String('report.continentalCongress.none');
  }
}

$J.define(ReportContinentalCongressPanel, 'net.sf.freecol.client.gui.panel.report.ReportContinentalCongressPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.report.ReportPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_ReportContinentalCongressPanel' }, clinit: true, lazy: ['none'] });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  JTabbedPane = $J.load('javax.swing.JTabbedPane');
  ScrollPaneConstants = $J.load('javax.swing.ScrollPaneConstants');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FreeColProgressBar = $J.load('net.sf.freecol.client.gui.panel.FreeColProgressBar');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FoundingFather$FoundingFatherType = $J.load('net.sf.freecol.common.model.FoundingFather$FoundingFatherType');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
