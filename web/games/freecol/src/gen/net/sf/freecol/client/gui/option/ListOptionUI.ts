// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/option/ListOptionUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, CloneNotSupportedException, Level, Logger } from '../../../../../../../jre/index.ts';
import { OptionUI } from './OptionUI.ts';

let DefaultListModel, JList, JScrollPane, MigLayout, MigPanel, Utility, CollectionUtils;

/**
 * This class provides visualization for a list of
 * {@link net.sf.freecol.common.option.AbstractOption}s in order to enable
 * values to be both seen and changed.
 */
export class ListOptionUI<T> extends OptionUI {
  static logger: Logger = null;
  panel: JPanel = null;
  list: JList<AbstractOption<T>> = null;
  model: DefaultListModel<AbstractOption<T>> = null;
  editButton: JButton = null;
  addButton: JButton = null;
  removeButton: JButton = null;
  upButton: JButton = null;
  downButton: JButton = null;
  choiceModifiableCheck: JFunction<AbstractOption, boolean> = null;
  /**
   * Creates a new {@code ListOptionUI} for the given
   * {@code ListOption}.
   *
   * @param gui The {@code GUI} to display on.
   * @param option The {@code ListOption} to display.
   * @param editable boolean whether user can modify the setting
   * @param choiceModifiableCheck Checks if a specific option can
   *      be added/modified in the list.
   */
  _ListOptionUI(gui: GUI, option: ListOption<T>, editable: boolean, choiceModifiableCheck: JFunction<AbstractOption, boolean>): this {
    this._OptionUI(option, editable);
    this.editButton = Utility.localizedButton$String('list.edit');
    this.addButton = Utility.localizedButton$String('list.add');
    this.removeButton = Utility.localizedButton$String('list.remove');
    this.upButton = Utility.localizedButton$String('list.up');
    this.downButton = Utility.localizedButton$String('list.down');
    this.choiceModifiableCheck = choiceModifiableCheck;
    this.panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String('wrap 2, fill', '[fill, grow]20[fill]'));
    this.panel.setBorder(Utility.localizedBorder$String$Color(super.getJLabel().getText(), Utility.getBorderColor()));
    this.model = new DefaultListModel()._DefaultListModel();
    for (const $it0 = option.getValue$().iterator(); $it0.hasNext(); ) {
      let o = $it0.next();
      try {
        let c = o.cloneOption();
        this.model.addElement(c);
      } catch ($e1) {
        if ($J.isa($e1, CloneNotSupportedException)) {
          let e = $J.exc($e1);
          ListOptionUI.logger.log(Level.WARNING, 'Can not clone ' + o.getId(), e);
        } else {
          throw $e1;
        }
      }
    }
    this.list = new JList()._JList$ListModel(this.model);
    let o = CollectionUtils.first$Collection(option.getValue$());
    if (o == null) {
      o = option.getTemplate();
    }
    if (o != null) {
      this.setCellRenderer(gui, o, editable);
      this.list.setSelectedIndex(0);
    }
    this.list.setVisibleRowCount(4);
    let pane = new JScrollPane()._JScrollPane$Component(this.list);
    this.panel.add$Component$Object(pane, 'grow, spany 5');
    if (option.getAllowDuplicates()) {
      this.editButton.setEnabled(editable);
      this.panel.add$Component(this.editButton);
    }
    for (let button of [this.addButton, this.removeButton, this.upButton, this.downButton]) {
      button.setEnabled(editable);
      this.panel.add$Component(button);
    }
    if (option.getTemplate() == null) {
      this.addButton.setEnabled(false);
    }
    this.addButton.addActionListener((ae) => {
      try {
        let ao = option.getTemplate().cloneOption();
        if (gui.showEditOptionDialog(ao) && option.canAdd(ao)) {
          if (!option.getAllowDuplicates() && this.getValue().contains(ao)) {
            return;
          }
          if (!this.canModifyChoice(ao)) {
            return;
          }
          this.model.addElement(ao);
          this.list.setSelectedValue(ao, true);
          this.list.repaint$();
        }
      } catch ($e2) {
        if ($J.isa($e2, CloneNotSupportedException)) {
          let cnse = $J.exc($e2);
          ListOptionUI.logger.log(Level.WARNING, 'Can not clone: ' + $J.str(option.getTemplate()), cnse);
        } else {
          throw $e2;
        }
      }
    });
    this.editButton.addActionListener((ae) => {
      let ao = this.list.getSelectedValue();
      if (gui.showEditOptionDialog(ao)) {
        this.list.repaint$();
      }
    });
    this.removeButton.addActionListener((ae) => {
      if (!this.canModifyChoice(this.list.getSelectedValue())) {
        return;
      }
      this.model.removeElementAt(this.list.getSelectedIndex());
    });
    this.upButton.addActionListener((ae) => {
      if (this.list.getSelectedIndex() === 0) {
        return;
      }
      if (!this.canModifyChoice(this.list.getSelectedValue())) {
        return;
      }
      let index = this.list.getSelectedIndex();
      let temp = this.model.getElementAt(index);
      this.model.setElementAt(this.model.getElementAt((index - 1) | 0), index);
      this.model.setElementAt(temp, (index - 1) | 0);
      this.list.setSelectedIndex((index - 1) | 0);
    });
    this.downButton.addActionListener((ae) => {
      if (this.list.getSelectedIndex() === ((this.model.getSize() - 1) | 0)) {
        return;
      }
      if (!this.canModifyChoice(this.list.getSelectedValue())) {
        return;
      }
      let index = this.list.getSelectedIndex();
      let temp = this.model.getElementAt(index);
      this.model.setElementAt(this.model.getElementAt((index + 1) | 0), index);
      this.model.setElementAt(temp, (index + 1) | 0);
      this.list.setSelectedIndex((index + 1) | 0);
    });
    this.list.addListSelectionListener($J.fn(this, 'valueChanged'));
    this.initialize();
    return this;
  }
  canModifyChoice(choice: AbstractOption<T>): boolean {
    return this.choiceModifiableCheck(choice);
  }
  setCellRenderer(gui: GUI, o: AbstractOption<T>, editable: boolean): void {
    let ui = OptionUI.getOptionUI(gui, o, editable);
    if (ui != null && ui.getListCellRenderer() != null) {
      this.list.setCellRenderer(ui.getListCellRenderer());
    }
  }
  getValue(): List<AbstractOption<T>> {
    let result = new ArrayList();
    for (let e = this.model.elements(); e.hasMoreElements(); ) {
      result.add(e.nextElement());
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  getJLabel(): JLabel {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  getComponent(): JPanel {
    return this.panel;
  }
  /**
   * {@inheritDoc}
   */
  updateOption(): void {
    this.getOption().setValue$Object(this.getValue());
  }
  /**
   * {@inheritDoc}
   */
  reset(): void {
    this.model.clear();
    for (const $it3 = this.getOption().getValue$().iterator(); $it3.hasNext(); ) {
      let o = $it3.next();
      this.model.addElement(o);
    }
  }
  /**
   * {@inheritDoc}
   */
  valueChanged(e: ListSelectionEvent): void {
    if (e.getValueIsAdjusting() === false) {
      let enabled = this.isEditable() && this.list.getSelectedValue() != null;
      this.editButton.setEnabled(enabled);
      this.addButton.setEnabled(this.isEditable() && this.getOption().getTemplate() != null);
      this.removeButton.setEnabled(enabled);
      this.upButton.setEnabled(enabled);
      this.downButton.setEnabled(enabled);
    }
  }
  static $clinit() {
    ListOptionUI.logger = Logger.getLogger($J.cls(ListOptionUI).getName());
  }
}

$J.define(ListOptionUI, 'net.sf.freecol.client.gui.option.ListOptionUI', { kind: 'class', ifaces: ['javax.swing.event.ListSelectionListener'], sup: 'net.sf.freecol.client.gui.option.OptionUI', ctors: { 'net.sf.freecol.client.gui.GUI,net.sf.freecol.common.option.ListOption,boolean,java.util.function.Function': '_ListOptionUI' }, returns: { 'getComponent': 'javax.swing.JPanel', 'getJLabel': 'javax.swing.JLabel', 'getValue': 'java.util.List' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  DefaultListModel = $J.load('javax.swing.DefaultListModel');
  JList = $J.load('javax.swing.JList');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
