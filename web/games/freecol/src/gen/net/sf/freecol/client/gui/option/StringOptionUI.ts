// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/option/StringOptionUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let DefaultComboBoxModel, JComboBox, FreeColComboBoxRenderer;

/**
 * This class provides visualization for a
 * {@link net.sf.freecol.common.option.StringOption} in order to enable
 * values to be both seen and changed.
 */
export class StringOptionUI extends OptionUI {
  box: JComboBox<string> = null;
  /**
   * Creates a new {@code StringOptionUI} for the given
   * {@code StringOption}.
   *
   * @param option The {@code StringOption} to make a user
   *     interface for.
   * @param editable Whether user can modify the setting.
   */
  _StringOptionUI(option: StringOption, editable: boolean): this {
    this._OptionUI(option, editable);
    this.box = new JComboBox()._JComboBox$();
    let choices = option.getChoices();
    this.box.setModel(new DefaultComboBoxModel()._DefaultComboBoxModel$ObjectArr($J.toArrayInto(choices.toArray(), $J.newArray(choices.size(), null))));
    this.box.setSelectedItem(option.getValue$());
    this.box.setRenderer(new FreeColComboBoxRenderer()._FreeColComboBoxRenderer$String$boolean('', true));
    this.initialize();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getComponent(): JComboBox<string> {
    return this.box;
  }
  /**
   * {@inheritDoc}
   */
  updateOption(): void {
    this.getOption().setValue$Object(this.box.getSelectedItem());
  }
  /**
   * {@inheritDoc}
   */
  reset(): void {
    this.box.setSelectedItem(this.getOption().getValue$());
  }
}

$J.define(StringOptionUI, 'net.sf.freecol.client.gui.option.StringOptionUI', { kind: 'class', sup: 'net.sf.freecol.client.gui.option.OptionUI', ctors: { 'net.sf.freecol.common.option.StringOption,boolean': '_StringOptionUI' }, returns: { 'getComponent': 'javax.swing.JComboBox' } });
$J.module(() => {
  DefaultComboBoxModel = $J.load('javax.swing.DefaultComboBoxModel');
  JComboBox = $J.load('javax.swing.JComboBox');
  FreeColComboBoxRenderer = $J.load('net.sf.freecol.client.gui.plaf.FreeColComboBoxRenderer');
});
