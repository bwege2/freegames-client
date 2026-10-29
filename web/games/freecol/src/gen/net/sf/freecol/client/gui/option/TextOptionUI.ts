// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/option/TextOptionUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let JTextField;

/**
 * This class provides visualization for a
 * {@link net.sf.freecol.common.option.TextOption} in order to enable
 * values to be both seen and changed.
 */
export class TextOptionUI extends OptionUI {
  box: JTextField = null;
  /**
   * Creates a new {@code TextOptionUI} for the given
   * {@code TextOption}.
   *
   * @param option The {@code TextOption} to make a user interface for.
   * @param editable boolean whether user can modify the setting.
   */
  _TextOptionUI(option: TextOption, editable: boolean): this {
    this._OptionUI(option, editable);
    this.box = new JTextField()._JTextField$int(16);
    this.box.setText(option.getValue$());
    this.initialize();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getComponent(): JTextField {
    return this.box;
  }
  /**
   * {@inheritDoc}
   */
  updateOption(): void {
    this.getOption().setValue$Object(this.box.getText$());
  }
  /**
   * {@inheritDoc}
   */
  reset(): void {
    this.box.setText(this.getOption().getValue$());
  }
}

$J.define(TextOptionUI, 'net.sf.freecol.client.gui.option.TextOptionUI', { kind: 'class', sup: 'net.sf.freecol.client.gui.option.OptionUI', ctors: { 'net.sf.freecol.common.option.TextOption,boolean': '_TextOptionUI' }, returns: { 'getComponent': 'javax.swing.JTextField' } });
$J.module(() => {
  JTextField = $J.load('javax.swing.JTextField');
});
