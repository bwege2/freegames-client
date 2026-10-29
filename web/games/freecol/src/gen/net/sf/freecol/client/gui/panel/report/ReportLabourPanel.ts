// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/ReportLabourPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, HashMap, JObject } from '../../../../../../../../jre/index.ts';
import { ReportPanel } from './ReportPanel.ts';
import { MigPanel } from '../MigPanel.ts';

let AlphaComposite, Color, MouseAdapter, AbstractAction, DefaultListModel, ImageIcon, JLabel, JList, KeyStroke, ListSelectionModel, MigLayout, FreeColPanel, Messages, TypeCountMap;

/**
 * This panel displays the Labour Report.
 */
export class ReportLabourPanel extends ReportPanel {
  /**
   * The map of unit type to location and count.
   */
  data: JMap<UnitType, JMap<Location, number>> = null;
  /**
   * A map of count by unit type.
   */
  unitCount: TypeCountMap<UnitType> = null;
  /**
   * The player colonies.
   */
  colonies: List<Colony> = null;
  /**
   * A list of panels for the unit types.
   */
  panelList: JList<ReportLabourPanel$LabourUnitPanel> = null;
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The enclosing {@code FreeColClient}.
   */
  _ReportLabourPanel(freeColClient: FreeColClient): this {
    this._ReportPanel(freeColClient, 'reportLabourAction');
    this.panelList = null;
    let player = this.getMyPlayer();
    this.data = new HashMap();
    this.unitCount = new TypeCountMap()._TypeCountMap();
    for (const $it0 = player.getUnitSet().iterator(); $it0.hasNext(); ) {
      let unit = $it0.next();
      let type$ = unit.getType();
      this.unitCount.incrementCount(type$, 1);
      let unitMap = this.data.get(type$);
      if (unitMap == null) {
        unitMap = new HashMap();
        this.data.put(type$, unitMap);
      }
      let location = unit.getLocation();
      if (location == null) {
        ReportPanel.logger.warning('Unit has null location: ' + $J.str(unit));
      } else if (location.getSettlement() != null) {
        location = location.getSettlement();
      } else if (unit.isInEurope()) {
        location = player.getEurope();
      } else if (location.getTile$() != null) {
        location = location.getTile$();
      }
      let count = unitMap.get(location);
      if (count == null) {
        unitMap.put(location, 1);
      } else {
        unitMap.put(location, (count + 1) | 0);
      }
    }
    this.colonies = player.getColonyList();
    let model = new DefaultListModel()._DefaultListModel();
    for (const $it1 = this.getSpecification().getUnitTypeList().iterator(); $it1.hasNext(); ) {
      let unitType = $it1.next();
      if (unitType.isPerson() && unitType.isAvailableTo([player])) {
        let count = this.unitCount.getCount(unitType);
        model.addElement(new ReportLabourPanel$LabourUnitPanel()._ReportLabourPanel$LabourUnitPanel(freeColClient, unitType, count));
      }
    }
    let selectAction = new (ReportLabourPanel$1())().$o(this)._AbstractAction$();
    let quitAction = new (ReportLabourPanel$2())().$o(this)._AbstractAction$();
    this.panelList = new JList()._JList$ListModel(model);
    this.panelList.getInputMap$().put(KeyStroke.getKeyStroke$String('ENTER'), 'select');
    this.panelList.getActionMap$().put$Object$Action('select', selectAction);
    this.panelList.getInputMap$().put(KeyStroke.getKeyStroke$String('ESCAPE'), 'quit');
    this.panelList.getActionMap$().put$Object$Action('quit', quitAction);
    this.panelList.addMouseListener(new (ReportLabourPanel$3())().$o(this)._MouseAdapter());
    this.panelList.setOpaque(false);
    this.panelList.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
    this.panelList.setLayoutOrientation(JList.HORIZONTAL_WRAP);
    this.panelList.setCellRenderer(new ReportLabourPanel$LabourUnitPanelRenderer()._ReportLabourPanel$LabourUnitPanelRenderer());
    this.scrollPane.setViewportView(this.panelList);
    return this;
  }
  showDetails(): void {
    let unitType = this.panelList.getSelectedValue().unitType;
    if (this.unitCount.getCount(unitType) === 0) {
      return;
    }
    this.getGUI().showReportLabourDetailPanel(unitType, this.data, this.unitCount, this.colonies);
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let command = ae.getActionCommand();
    if ($J.equals(FreeColPanel.OK, command)) {
      super.actionPerformed(ae);
    } else {
      let unitType = this.getSpecification().getUnitType(command);
      this.getGUI().showReportLabourDetailPanel(unitType, this.data, this.unitCount, this.colonies);
    }
  }
}

/**
 * An individual unit type panel.
 */
export class ReportLabourPanel$LabourUnitPanel extends MigPanel {
  selected: boolean = false;
  unitType: UnitType = null;
  _ReportLabourPanel$LabourUnitPanel(freeColClient: FreeColClient, unitType: UnitType, count: number): this {
    this._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String('wrap 2', '[60, right][left]'));
    this.unitType = unitType;
    this.setOpaque(false);
    this.add$Component$Object(new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(freeColClient.getGUI().getFixedImageLibrary().getSmallUnitTypeImage$UnitType$boolean(unitType, (count === 0)))), 'spany 2');
    this.add$Component(new JLabel()._JLabel$String(Messages.getName$Named(unitType)));
    this.add$Component(new JLabel()._JLabel$String(String(count)));
    this.setPreferredSize(this.getPreferredSize$());
    return this;
  }
  paintComponent(g: Graphics): void {
    if (this.selected) {
      let g2d = g;
      let oldComposite = g2d.getComposite();
      let oldColor = g2d.getColor();
      g2d.setComposite(AlphaComposite.getInstance$int$float(AlphaComposite.SRC_OVER, Math.fround(0.1)));
      g2d.setColor(Color.BLACK);
      g2d.fillRect(0, 0, this.getWidth(), this.getHeight());
      g2d.setComposite(oldComposite);
      g2d.setColor(oldColor);
    }
    super.paintComponent(g);
  }
}

/**
 * A renderer for the labour unit panels.
 */
export class ReportLabourPanel$LabourUnitPanelRenderer extends JObject {
  _ReportLabourPanel$LabourUnitPanelRenderer(): this {
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getListCellRendererComponent(list: JList<ReportLabourPanel$LabourUnitPanel>, value: ReportLabourPanel$LabourUnitPanel, index: number, isSelected: boolean, cellHasFocus: boolean): Component {
    value.selected = isSelected;
    return value;
  }
}

let $ReportLabourPanel$1: any = null;
/** An anonymous class (ReportLabourPanel.java:181). */
function ReportLabourPanel$1(): any {
  return $ReportLabourPanel$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.showDetails();
    }
  }, 'net.sf.freecol.client.gui.panel.report.ReportLabourPanel$1', []);
}

let $ReportLabourPanel$2: any = null;
/** An anonymous class (ReportLabourPanel.java:187). */
function ReportLabourPanel$2(): any {
  return $ReportLabourPanel$2 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.getGUI().removeComponent(this.$outer);
    }
  }, 'net.sf.freecol.client.gui.panel.report.ReportLabourPanel$2', []);
}

let $ReportLabourPanel$3: any = null;
/** An anonymous class (ReportLabourPanel.java:202). */
function ReportLabourPanel$3(): any {
  return $ReportLabourPanel$3 ??= $J.local(class extends MouseAdapter {
    mouseClicked(e: MouseEvent): void {
      this.$outer.showDetails();
    }
  }, 'net.sf.freecol.client.gui.panel.report.ReportLabourPanel$3', []);
}

$J.define(ReportLabourPanel, 'net.sf.freecol.client.gui.panel.report.ReportLabourPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.report.ReportPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_ReportLabourPanel' } });
$J.define(ReportLabourPanel$LabourUnitPanel, 'net.sf.freecol.client.gui.panel.report.ReportLabourPanel$LabourUnitPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.MigPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.UnitType,int': '_ReportLabourPanel$LabourUnitPanel' } });
$J.define(ReportLabourPanel$LabourUnitPanelRenderer, 'net.sf.freecol.client.gui.panel.report.ReportLabourPanel$LabourUnitPanelRenderer', { kind: 'class', ifaces: ['javax.swing.ListCellRenderer'], sup: 'java.lang.Object', ctors: { '': '_ReportLabourPanel$LabourUnitPanelRenderer' } });
$J.module(() => {
  AlphaComposite = $J.load('java.awt.AlphaComposite');
  Color = $J.load('java.awt.Color');
  MouseAdapter = $J.load('java.awt.event.MouseAdapter');
  AbstractAction = $J.load('javax.swing.AbstractAction');
  DefaultListModel = $J.load('javax.swing.DefaultListModel');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  JList = $J.load('javax.swing.JList');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  ListSelectionModel = $J.load('javax.swing.ListSelectionModel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FreeColPanel = $J.load('net.sf.freecol.client.gui.panel.FreeColPanel');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  TypeCountMap = $J.load('net.sf.freecol.common.model.TypeCountMap');
});
