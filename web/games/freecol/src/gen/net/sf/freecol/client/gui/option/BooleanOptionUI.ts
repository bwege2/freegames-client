// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/option/BooleanOptionUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let JCheckBox;

/**
 * This class provides visualization for a
 * {@link net.sf.freecol.common.option.BooleanOption} in order to enable
 * values to be both seen and changed.
 */
export class BooleanOptionUI extends OptionUI {
  box: JCheckBox = null;
  /**
   * Creates a new {@code BooleanOptionUI} for the given
   * {@code BooleanOption}.
   *
   * @param option The {@code BooleanOption} to make a user
   *     interface for.
   * @param editable Whether user can modify the setting.
   */
  _BooleanOptionUI(option: BooleanOption, editable: boolean): this {
    this._OptionUI(option, editable);
    this.box = new JCheckBox()._JCheckBox$();
    this.setValue(option.getValue$());
    this.initialize();
    return this;
  }
  /**
   * Sets the value of this UI's component.
   *
   * @param b The new boolean value.
   */
  setValue(b: boolean): void {
    this.box.setSelected(b);
  }
  getValue(): boolean {
    return this.box.isSelected();
  }
  addActionListener(actionListener: ActionListener): void {
    this.box.addActionListener(actionListener);
  }
  removeActionListener(actionListener: ActionListener): void {
    this.box.removeActionListener(actionListener);
  }
  /**
   * {@inheritDoc}
   */
  getComponent(): JCheckBox {
    return this.box;
  }
  /**
   * {@inheritDoc}
   */
  updateOption(): void {
    this.getOption().setValue$Object(this.box.isSelected());
  }
  /**
   * {@inheritDoc}
   */
  reset(): void {
    this.box.setSelected(this.getOption().getValue$());
  }
}

$J.define(BooleanOptionUI, 'net.sf.freecol.client.gui.option.BooleanOptionUI', { kind: 'class', sup: 'net.sf.freecol.client.gui.option.OptionUI', ctors: { 'net.sf.freecol.common.option.BooleanOption,boolean': '_BooleanOptionUI' }, returns: { 'getComponent': 'javax.swing.JCheckBox', 'getValue': 'boolean' } });
$J.module(() => {
  JCheckBox = $J.load('javax.swing.JCheckBox');
});
