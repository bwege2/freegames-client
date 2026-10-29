// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/option/SelectOptionUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { OptionUI } from './OptionUI.ts';

let DefaultComboBoxModel, JComboBox, Messages;

/**
 * This class provides visualization for a
 * {@link net.sf.freecol.common.option.SelectOption} in order to enable
 * values to be both seen and changed.
 */
export class SelectOptionUI extends OptionUI {
  box: JComboBox<string> = null;
  /**
   * Creates a new {@code SelectOptionUI} for the given
   * {@code SelectOption}.
   *
   * @param option The {@code SelectOption} to make a user
   *     interface for.
   * @param editable Whether user can modify the setting.
   */
  _SelectOptionUI(option: SelectOption, editable: boolean): this {
    this._OptionUI(option, editable);
    this.box = new JComboBox()._JComboBox$();
    let model = new DefaultComboBoxModel()._DefaultComboBoxModel$();
    for (const $it0 = option.getItemValues().values().iterator(); $it0.hasNext(); ) {
      let string$ = $it0.next();
      model.addElement(option.localizeLabels() ? Messages.message$String(string$) : string$);
    }
    this.box.setModel(model);
    this.box.setSelectedIndex(option.getValue$());
    this.initialize();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getComponent(): JComponent {
    return this.box;
  }
  /**
   * {@inheritDoc}
   */
  updateOption(): void {
    this.getOption().setValue$Object(this.box.getSelectedIndex());
  }
  /**
   * {@inheritDoc}
   */
  reset(): void {
    this.box.setSelectedIndex(this.getOption().getValue$());
  }
}

$J.define(SelectOptionUI, 'net.sf.freecol.client.gui.option.SelectOptionUI', { kind: 'class', sup: 'net.sf.freecol.client.gui.option.OptionUI', ctors: { 'net.sf.freecol.common.option.SelectOption,boolean': '_SelectOptionUI' }, returns: { 'getComponent': 'javax.swing.JComponent' } });
$J.module(() => {
  DefaultComboBoxModel = $J.load('javax.swing.DefaultComboBoxModel');
  JComboBox = $J.load('javax.swing.JComboBox');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
});
