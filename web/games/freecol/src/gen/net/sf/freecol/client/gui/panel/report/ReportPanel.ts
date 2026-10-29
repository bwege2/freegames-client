// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/ReportPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString, Logger } from '../../../../../../../../jre/index.ts';
import { FreeColPanel } from '../FreeColPanel.ts';

let Color, Dimension, AbstractAction, ImageIcon, JLabel, JScrollPane, ScrollPaneConstants, EmptyBorder, MigLayout, MigPanel, Utility, Messages, Europe, Map_;

/**
 * This panel displays a report.
 */
export class ReportPanel extends FreeColPanel {
  static logger: Logger = null;
  /**
   * The default layout contrains of the {@code JScrollPane}s in this class.
   */
  static readonly SCROLL_PANE_SIZE: string = 'cell 0 1, height 100%, width 100%';
  reportPanel: JPanel = null;
  header: JLabel = null;
  scrollPane: JScrollPane = null;
  /**
   * Creates the basic FreeCol report panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param key A key for the title.
   */
  _ReportPanel(freeColClient: FreeColClient, key: string): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, 'ReportPanelUI', new MigLayout()._MigLayout$String$String$String('wrap 1', '[fill]', '[][fill][]'));
    this.header = Utility.localizedHeader(Messages.nameKey$String(key), Utility.FONTSPEC_TITLE);
    this.add$Component$Object(this.header, 'cell 0 0, align center');
    this.reportPanel = new MigPanel()._MigPanel$String('ReportPanelUI');
    this.reportPanel.setOpaque(true);
    this.reportPanel.setBorder(this.createBorder());
    this.scrollPane = new JScrollPane()._JScrollPane$Component$int$int(this.reportPanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED);
    this.scrollPane.getVerticalScrollBar().setUnitIncrement(16);
    this.add$Component$Object(this.scrollPane, ReportPanel.SCROLL_PANE_SIZE);
    this.add$Component$Object(this.okButton, 'cell 0 2, tag ok');
    this.setEscapeAction(new (ReportPanel$1())().$o(this)._AbstractAction$());
    let width = $J.d2i((Math.fround(1050 * this.getImageLibrary().getScaleFactor())));
    let height = $J.d2i((Math.fround(725 * this.getImageLibrary().getScaleFactor())));
    this.getGUI().restoreSavedSize(this, new Dimension()._Dimension$int$int(width, height));
    return this;
  }
  /**
   * Prepares this panel to be displayed.
   */
  initialize(): void {
    this.reportPanel.removeAll();
    this.reportPanel.doLayout();
  }
  createBorder(): Border {
    return new EmptyBorder()._EmptyBorder$int$int$int$int(20, 20, 20, 20);
  }
  createUnitTypeLabel(au: AbstractUnit): JLabel {
    let unitType = au.getType(this.getSpecification());
    let roleId = au.getRoleId();
    let count = au.getNumber();
    let unitIcon = new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getSmallUnitTypeImage$UnitType$String$boolean(unitType, roleId, (count === 0)));
    let unitLabel = new JLabel()._JLabel$Icon(unitIcon);
    unitLabel.setText(String(count));
    if (count === 0) {
      unitLabel.setForeground(Color.GRAY);
    }
    unitLabel.setToolTipText(au.getDescription());
    return unitLabel;
  }
  getLocationLabelFor(unit: Unit): string {
    if (unit.getDestination() instanceof Map_) {
      return Messages.message$String('sailingToAmerica');
    } else if (unit.getDestination() instanceof Europe) {
      return Messages.message$String('sailingToEurope');
    } else {
      return Messages.message$StringTemplate(unit.getLocation().getLocationLabelFor(unit.getOwner()));
    }
  }
  setMainComponent(main: Component): void {
    this.remove$Component(this.scrollPane);
    this.add$Component$Object(main, ReportPanel.SCROLL_PANE_SIZE);
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let command = ae.getActionCommand();
    if ($J.equals(FreeColPanel.OK, command)) {
      this.getGUI().removeComponent(this);
    } else {
      let fco = this.getGame().getFreeColGameObject$String(command);
      if (fco != null) {
        this.getGUI().displayObject(fco);
      } else {
        this.getGUI().showColopediaPanel(command);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    super.removeNotify();
    this.removeAll();
    this.scrollPane = null;
  }
  static $clinit() {
    ReportPanel.logger = Logger.getLogger($J.cls(ReportPanel).getName());
  }
}

let $ReportPanel$1: any = null;
/** An anonymous class (ReportPanel.java:95). */
function ReportPanel$1(): any {
  return $ReportPanel$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.okButton.doClick$();
    }
  }, 'net.sf.freecol.client.gui.panel.report.ReportPanel$1', []);
}

$J.define(ReportPanel, 'net.sf.freecol.client.gui.panel.report.ReportPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,java.lang.String': '_ReportPanel' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Dimension = $J.load('java.awt.Dimension');
  AbstractAction = $J.load('javax.swing.AbstractAction');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  ScrollPaneConstants = $J.load('javax.swing.ScrollPaneConstants');
  EmptyBorder = $J.load('javax.swing.border.EmptyBorder');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
});
