// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/FindSettlementPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JEnum, Logger } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';
import { FreeColComboBoxRenderer } from '../plaf/FreeColComboBoxRenderer.ts';

let Dimension, MouseAdapter, AbstractAction, DefaultListModel, ImageIcon, JComboBox, JList, JScrollPane, KeyStroke, ListSelectionModel, MigLayout, Utility, Messages, Colony, IndianSettlement, StringTemplate;

/**
 * Centers the map on a known settlement or colony.  Pressing ENTER
 * opens a panel if appropriate.
 */
export class FindSettlementPanel extends FreeColPanel {
  static logger: Logger = null;
  /**
   * Box to choose the type of settlements to list.
   */
  displayOptionBox: JComboBox<string> = null;
  /**
   * The list of settlements to display.
   */
  settlementList: JList<Settlement> = null;
  /**
   * Create a new panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _FindSettlementPanel(freeColClient: FreeColClient): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new MigLayout()._MigLayout$String$String$String('wrap 1', '[align center]', '[]30[]30[]'));
    this.settlementList = new JList()._JList$();
    this.settlementList.setCellRenderer(new FindSettlementPanel$SettlementRenderer()._FindSettlementPanel$SettlementRenderer(this.getImageLibrary()));
    this.settlementList.setFixedCellHeight(48);
    this.settlementList.addListSelectionListener($J.fn(this, 'valueChanged'));
    this.settlementList.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
    let selectAction = new (FindSettlementPanel$1())().$o(this)._AbstractAction$();
    this.settlementList.getInputMap$().put(KeyStroke.getKeyStroke$String('ENTER'), 'select');
    this.settlementList.getActionMap$().put$Object$Action('select', selectAction);
    let quitAction = new (FindSettlementPanel$2())().$o(this)._AbstractAction$();
    this.settlementList.getInputMap$().put(KeyStroke.getKeyStroke$String('ESCAPE'), 'quit');
    this.settlementList.getActionMap$().put$Object$Action('quit', quitAction);
    this.settlementList.addMouseListener(new (FindSettlementPanel$3())().$o(this)._MouseAdapter());
    let listScroller = new JScrollPane()._JScrollPane$Component(this.settlementList);
    listScroller.setPreferredSize(new Dimension()._Dimension$int$int(250, 250));
    this.displayOptionBox = new JComboBox()._JComboBox$ObjectArr([Messages.message$String('findSettlementPanel.displayAll'), Messages.message$String('findSettlementPanel.displayOnlyNatives'), Messages.message$String('findSettlementPanel.displayOnlyEuropean')]);
    this.displayOptionBox.addItemListener($J.fn(this, 'itemStateChanged'));
    this.add$Component(Utility.localizedHeader(Messages.nameKey$String('findSettlementPanel'), Utility.FONTSPEC_SUBTITLE));
    this.add$Component$Object(listScroller, 'width max(300, 100%), height max(300, 100%)');
    this.add$Component(this.displayOptionBox);
    this.add$Component$Object(this.okButton, 'tag ok');
    this.getGUI().restoreSavedSize(this, this.getPreferredSize$());
    this.updateSearch(FindSettlementPanel$DisplayListOption.valueOf('ALL'));
    this.setEscapeAction(new (FindSettlementPanel$4())().$o(this)._AbstractAction$());
    return this;
  }
  updateSearch(displayListOption: FindSettlementPanel$DisplayListOption): void {
    let model = new DefaultListModel()._DefaultListModel();
    let selected = this.settlementList.getSelectedValue();
    for (const $it0 = this.getGame().getLivePlayerList([]).iterator(); $it0.hasNext(); ) {
      let player = $it0.next();
      let ok: boolean;
      switch (displayListOption) {
        case FindSettlementPanel$DisplayListOption.ONLY_NATIVES:
          ok = player.isIndian();
          break;
        case FindSettlementPanel$DisplayListOption.ONLY_EUROPEAN:
          ok = player.isEuropean();
          break;
        case FindSettlementPanel$DisplayListOption.ALL:
          ok = true;
          break;
        default:
          ok = false;
          break;
      }
      if (ok) {
        for (const $it1 = player.getSettlementList().iterator(); $it1.hasNext(); ) {
          let s = $it1.next();
          model.addElement(s);
        }
      }
    }
    this.settlementList.setModel(model);
    this.settlementList.setSelectedValue(selected, true);
    if (this.settlementList.getSelectedIndex() < 0) {
      this.settlementList.setSelectedIndex(0);
    }
  }
  selectSettlement(): void {
    let settlement = this.settlementList.getSelectedValue();
    if (settlement instanceof Colony && settlement.getOwner() === this.getMyPlayer()) {
      this.getGUI().removeComponent(this);
      this.getGUI().showColonyPanel(settlement, null);
    } else if (settlement instanceof IndianSettlement) {
      this.getGUI().removeComponent(this);
      this.getGUI().showIndianSettlementPanel(settlement);
    }
  }
  itemStateChanged(event: ItemEvent): void {
    switch (this.displayOptionBox.getSelectedIndex()) {
      case 0:
      default:
        this.updateSearch(FindSettlementPanel$DisplayListOption.valueOf('ALL'));
        break;
      case 1:
        this.updateSearch(FindSettlementPanel$DisplayListOption.valueOf('ONLY_NATIVES'));
        break;
      case 2:
        this.updateSearch(FindSettlementPanel$DisplayListOption.valueOf('ONLY_EUROPEAN'));
    }
  }
  /**
   * {@inheritDoc}
   */
  valueChanged(e: ListSelectionEvent): void {
    let settlement = this.settlementList.getSelectedValue();
    if (settlement != null) {
      this.getGUI().setFocus(settlement.getTile$());
    }
  }
  /**
   * {@inheritDoc}
   */
  requestFocus$(): void {
    this.settlementList.requestFocus$();
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    super.removeNotify();
    this.removeAll();
    this.displayOptionBox = null;
  }
  static $clinit() {
    FindSettlementPanel.logger = Logger.getLogger($J.cls(FindSettlementPanel).getName());
  }
}

export class FindSettlementPanel$SettlementRenderer extends FreeColComboBoxRenderer {
  lib: ImageLibrary = null;
  _FindSettlementPanel$SettlementRenderer(lib: ImageLibrary): this {
    this._FreeColComboBoxRenderer$();
    this.lib = lib;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  setLabelValues(label: JLabel, value: Settlement): void {
    let template = StringTemplate.template$String('findSettlementPanel.settlement').addName$String$String('%name%', value.getName()).addName$String$String('%capital%', ((value.isCapital()) ? '*' : '')).addStringTemplate$String$StringTemplate('%nation%', value.getOwner().getNationLabel());
    label.setText(Messages.message$StringTemplate(template));
    label.setIcon(new ImageIcon()._ImageIcon$Image(this.lib.getSettlementImage$Settlement$Dimension(value, new Dimension()._Dimension$int$int(64, -1))));
  }
}

export class FindSettlementPanel$DisplayListOption extends JEnum {
  static ALL: FindSettlementPanel$DisplayListOption = null;
  static ONLY_NATIVES: FindSettlementPanel$DisplayListOption = null;
  static ONLY_EUROPEAN: FindSettlementPanel$DisplayListOption = null;
  static $VALUES: FindSettlementPanel$DisplayListOption[] = null;
  _FindSettlementPanel$DisplayListOption($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): FindSettlementPanel$DisplayListOption[] { return FindSettlementPanel$DisplayListOption.$VALUES.slice(); }
  static valueOf(name: string): FindSettlementPanel$DisplayListOption { return $J.enumValueOf(FindSettlementPanel$DisplayListOption, name); }
  static $clinit() {
    FindSettlementPanel$DisplayListOption.ALL = new FindSettlementPanel$DisplayListOption()._FindSettlementPanel$DisplayListOption('ALL', 0);
    FindSettlementPanel$DisplayListOption.ONLY_NATIVES = new FindSettlementPanel$DisplayListOption()._FindSettlementPanel$DisplayListOption('ONLY_NATIVES', 1);
    FindSettlementPanel$DisplayListOption.ONLY_EUROPEAN = new FindSettlementPanel$DisplayListOption()._FindSettlementPanel$DisplayListOption('ONLY_EUROPEAN', 2);
    FindSettlementPanel$DisplayListOption.$VALUES = [FindSettlementPanel$DisplayListOption.ALL, FindSettlementPanel$DisplayListOption.ONLY_NATIVES, FindSettlementPanel$DisplayListOption.ONLY_EUROPEAN];
  }
}

let $FindSettlementPanel$1: any = null;
/** An anonymous class (FindSettlementPanel.java:117). */
function FindSettlementPanel$1(): any {
  return $FindSettlementPanel$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.selectSettlement();
    }
  }, 'net.sf.freecol.client.gui.panel.FindSettlementPanel$1', []);
}

let $FindSettlementPanel$2: any = null;
/** An anonymous class (FindSettlementPanel.java:126). */
function FindSettlementPanel$2(): any {
  return $FindSettlementPanel$2 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.getGUI().removeComponent(this.$outer);
    }
  }, 'net.sf.freecol.client.gui.panel.FindSettlementPanel$2', []);
}

let $FindSettlementPanel$3: any = null;
/** An anonymous class (FindSettlementPanel.java:135). */
function FindSettlementPanel$3(): any {
  return $FindSettlementPanel$3 ??= $J.local(class extends MouseAdapter {
    mouseClicked(e: MouseEvent): void {
      if (e.getClickCount() === 2) {
        this.$outer.selectSettlement();
      }
    }
  }, 'net.sf.freecol.client.gui.panel.FindSettlementPanel$3', []);
}

let $FindSettlementPanel$4: any = null;
/** An anonymous class (FindSettlementPanel.java:163). */
function FindSettlementPanel$4(): any {
  return $FindSettlementPanel$4 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.okButton.doClick$();
    }
  }, 'net.sf.freecol.client.gui.panel.FindSettlementPanel$4', []);
}

$J.define(FindSettlementPanel, 'net.sf.freecol.client.gui.panel.FindSettlementPanel', { kind: 'class', ifaces: ['javax.swing.event.ListSelectionListener', 'java.awt.event.ItemListener'], sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_FindSettlementPanel' }, meths: { 'requestFocus()': 'requestFocus$' }, clinit: true, lazy: ['logger'] });
$J.define(FindSettlementPanel$SettlementRenderer, 'net.sf.freecol.client.gui.panel.FindSettlementPanel$SettlementRenderer', { kind: 'class', sup: 'net.sf.freecol.client.gui.plaf.FreeColComboBoxRenderer', ctors: { 'net.sf.freecol.client.gui.ImageLibrary': '_FindSettlementPanel$SettlementRenderer' } });
$J.define(FindSettlementPanel$DisplayListOption, 'net.sf.freecol.client.gui.panel.FindSettlementPanel$DisplayListOption', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_FindSettlementPanel$DisplayListOption' }, clinit: true, lazy: ['$VALUES', 'ALL', 'ONLY_NATIVES', 'ONLY_EUROPEAN'] });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  MouseAdapter = $J.load('java.awt.event.MouseAdapter');
  AbstractAction = $J.load('javax.swing.AbstractAction');
  DefaultListModel = $J.load('javax.swing.DefaultListModel');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JComboBox = $J.load('javax.swing.JComboBox');
  JList = $J.load('javax.swing.JList');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  ListSelectionModel = $J.load('javax.swing.ListSelectionModel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
});
