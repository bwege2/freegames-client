// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/EndTurnDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, Logger } from '../../../../../../../jre/index.ts';
import { FreeColConfirmDialog } from './FreeColConfirmDialog.ts';

let Dimension, Font, AbstractAction, DefaultListModel, ImageIcon, JLabel, JList, JScrollPane, KeyStroke, SwingConstants, MigLayout, MigPanel, Utility, FreeColSelectedPanelUI, Messages, StringTemplate, Unit$UnitLabelType;

/**
 * Centers the map on a known settlement or colony.  Pressing ENTER
 * opens a panel if appropriate.
 */
export class EndTurnDialog extends FreeColConfirmDialog {
  static logger: Logger = null;
  /**
   * The list of units to display.
   */
  unitList: JList<EndTurnDialog$UnitWrapper> = null;
  /**
   * The constructor to use.
   *
   * @param freeColClient The freecol client.
   * @param frame The owner frame.
   * @param units The unit list.
   */
  _EndTurnDialog(freeColClient: FreeColClient, frame: JFrame, units: List<Unit>): this {
    this._FreeColConfirmDialog$FreeColClient$JFrame(freeColClient, frame);
    let player = this.getMyPlayer();
    let header = Utility.localizedHeader(Messages.nameKey$String('endTurnDialog'), Utility.FONTSPEC_TITLE);
    let text = Utility.localizedTextArea$StringTemplate(StringTemplate.template$String('endTurnDialog.areYouSure').addAmount('%number%', units.size()));
    let model = new DefaultListModel()._DefaultListModel();
    for (const $it0 = units.iterator(); $it0.hasNext(); ) {
      let unit = $it0.next();
      model.addElement(new EndTurnDialog$UnitWrapper()._EndTurnDialog$UnitWrapper(unit));
    }
    this.unitList = new JList()._JList$ListModel(model);
    this.unitList.setCellRenderer(new EndTurnDialog$UnitCellRenderer().$o(this)._EndTurnDialog$UnitCellRenderer());
    this.unitList.getInputMap$().put(KeyStroke.getKeyStroke$String('ENTER'), 'select');
    this.unitList.getActionMap$().put$Object$Action('select', new (EndTurnDialog$1())().$o(this)._AbstractAction$());
    this.unitList.getInputMap$().put(KeyStroke.getKeyStroke$String('ESCAPE'), 'quit');
    this.unitList.getActionMap$().put$Object$Action('quit', new (EndTurnDialog$2())().$o(this)._AbstractAction$());
    this.unitList.addListSelectionListener((e) => {
      if (e.getValueIsAdjusting()) {
        return;
      }
      this.selectUnit();
    });
    let listScroller = new JScrollPane()._JScrollPane$Component(this.unitList);
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String('wrap 1, fill', '[align center]'));
    panel.add$Component(header);
    panel.add$Component$Object(text, 'newline 20');
    panel.add$Component$Object(listScroller, 'newline 10');
    panel.setSize$Dimension(panel.getPreferredSize$());
    let icon = new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getScaledNationImage(player.getNation()));
    this.initializeConfirmDialog(frame, false, panel, icon, 'ok', 'cancel');
    return this;
  }
  /**
   * Select the current unit in the list.
   */
  selectUnit(): void {
    let wrapper = this.unitList.getSelectedValue();
    if (wrapper != null && wrapper.unit != null) {
      if (wrapper.unit.isInEurope()) {
        this.getGUI().showEuropePanel();
      } else {
        this.getGUI().changeView$Unit$boolean(wrapper.unit, false);
        if (wrapper.unit.getColony() != null) {
          this.getGUI().showColonyPanel(wrapper.unit.getColony(), wrapper.unit);
        }
      }
    }
  }
  static $clinit() {
    EndTurnDialog.logger = Logger.getLogger($J.cls(EndTurnDialog).getName());
  }
}

/**
 * We need to wrap the Unit class in order to make the JList
 * support keystroke navigation.  JList.getNextMatch uses the
 * toString() method, but the toString() method of FreeCol objects
 * provides debugging information rather than a searchable name.
 */
export class EndTurnDialog$UnitWrapper extends JObject {
  unit: Unit = null;
  name: string = null;
  location_: string = null;
  _EndTurnDialog$UnitWrapper(unit: Unit): this {
    this.unit = unit;
    this.name = unit.getDescription$UnitLabelType(Unit$UnitLabelType.NATIONAL);
    this.location_ = Messages.message$StringTemplate(unit.getLocation().getLocationLabelFor(unit.getOwner()));
    return this;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return this.name;
  }
}

export class EndTurnDialog$UnitCellRenderer extends JObject {
  _EndTurnDialog$UnitCellRenderer(): this {
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getListCellRendererComponent(list: JList<EndTurnDialog$UnitWrapper>, value: EndTurnDialog$UnitWrapper, index: number, isSelected: boolean, cellHasFocus: boolean): Component {
    let imageLabel = new JLabel()._JLabel$();
    imageLabel.setIcon(new ImageIcon()._ImageIcon$Image(this.$outer.getImageLibrary().getSmallerUnitImage(value.unit)));
    imageLabel.setHorizontalAlignment(SwingConstants.CENTER);
    let nameLabel = new JLabel()._JLabel$();
    nameLabel.setText(value.name);
    let locationLabel = new JLabel()._JLabel$();
    locationLabel.setFont(locationLabel.getFont().deriveFont$int(Font.ITALIC));
    locationLabel.setText(value.location_);
    let panel: JPanel;
    if (isSelected) {
      panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String('', '[fill]'));
      panel.setOpaque(false);
      panel.setUI$PanelUI(FreeColSelectedPanelUI.createUI(panel));
    } else {
      panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String('', '[fill]'));
      panel.setOpaque(false);
    }
    let largestIconSize = this.largestIconSize(list);
    panel.add$Component$Object(imageLabel, 'center, width ' + largestIconSize.width_ + 'px!, height ' + largestIconSize.height_ + 'px!');
    panel.add$Component$Object(nameLabel, 'split 2, flowy, grow');
    panel.add$Component$Object(locationLabel, 'grow');
    return panel;
  }
  largestIconSize(list: JList<EndTurnDialog$UnitWrapper>): Dimension {
    let model = list.getModel();
    let largestWidth = 0;
    let largestHeight = 0;
    for (let i = 0; i < model.getSize(); i++) {
      let value = model.getElementAt(i);
      let image = this.$outer.getImageLibrary().getSmallerUnitImage(value.unit);
      if (image.getWidth() > largestWidth) {
        largestWidth = image.getWidth();
      }
      if (image.getHeight() > largestHeight) {
        largestHeight = image.getHeight();
      }
    }
    return new Dimension()._Dimension$int$int(largestWidth, largestHeight);
  }
}

let $EndTurnDialog$1: any = null;
/** An anonymous class (EndTurnDialog.java:194). */
function EndTurnDialog$1(): any {
  return $EndTurnDialog$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.selectUnit();
    }
  }, 'net.sf.freecol.client.gui.dialog.EndTurnDialog$1', []);
}

let $EndTurnDialog$2: any = null;
/** An anonymous class (EndTurnDialog.java:202). */
function EndTurnDialog$2(): any {
  return $EndTurnDialog$2 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.setValue(this.$outer.options.get(1));
    }
  }, 'net.sf.freecol.client.gui.dialog.EndTurnDialog$2', []);
}

$J.define(EndTurnDialog, 'net.sf.freecol.client.gui.dialog.EndTurnDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColConfirmDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,java.util.List': '_EndTurnDialog' }, clinit: true, lazy: ['logger'] });
$J.define(EndTurnDialog$UnitWrapper, 'net.sf.freecol.client.gui.dialog.EndTurnDialog$UnitWrapper', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Unit': '_EndTurnDialog$UnitWrapper' } });
$J.define(EndTurnDialog$UnitCellRenderer, 'net.sf.freecol.client.gui.dialog.EndTurnDialog$UnitCellRenderer', { kind: 'class', ifaces: ['javax.swing.ListCellRenderer'], sup: 'java.lang.Object', ctors: { '': '_EndTurnDialog$UnitCellRenderer' }, inner: true });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Font = $J.load('java.awt.Font');
  AbstractAction = $J.load('javax.swing.AbstractAction');
  DefaultListModel = $J.load('javax.swing.DefaultListModel');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  JList = $J.load('javax.swing.JList');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FreeColSelectedPanelUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColSelectedPanelUI');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Unit$UnitLabelType = $J.load('net.sf.freecol.common.model.Unit$UnitLabelType');
});
