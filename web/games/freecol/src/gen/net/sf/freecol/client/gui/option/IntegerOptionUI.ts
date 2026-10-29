// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/option/IntegerOptionUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let JSpinner, SpinnerNumberModel;

/**
 * This class provides visualization for an
 * {@link net.sf.freecol.common.option.IntegerOption} in order to enable
 * values to be both seen and changed.
 */
export class IntegerOptionUI extends OptionUI {
  spinner: JSpinner = null;
  /**
   * Creates a new {@code IntegerOptionUI} for the given
   * {@code IntegerOption}.
   *
   * @param option The {@code IntegerOption} to make a user interface for.
   * @param editable boolean whether user can modify the setting
   */
  _IntegerOptionUI(option: IntegerOption, editable: boolean): this {
    this._OptionUI(option, editable);
    this.spinner = new JSpinner()._JSpinner$();
    let value = option.getValue$();
    let min = option.getMinimumValue();
    let max = option.getMaximumValue();
    if (min > max) {
      let tmp = min;
      min = max;
      max = tmp;
    }
    let stepSize: number;
    if (option.getStepSize() > 0) {
      stepSize = option.getStepSize();
    } else {
      stepSize = Math.max(1, Math.min($J.idiv(((max - min) | 0), 10), 1000));
    }
    this.spinner.setModel(new SpinnerNumberModel()._SpinnerNumberModel$int$int$int$int(value, min, max, stepSize));
    this.initialize();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getComponent(): JComponent {
    return this.spinner;
  }
  /**
   * {@inheritDoc}
   */
  updateOption(): void {
    this.getOption().setValue$Object(this.spinner.getValue());
  }
  /**
   * {@inheritDoc}
   */
  reset(): void {
    this.spinner.setValue(this.getOption().getValue$());
  }
}

$J.define(IntegerOptionUI, 'net.sf.freecol.client.gui.option.IntegerOptionUI', { kind: 'class', sup: 'net.sf.freecol.client.gui.option.OptionUI', ctors: { 'net.sf.freecol.common.option.IntegerOption,boolean': '_IntegerOptionUI' }, returns: { 'getComponent': 'javax.swing.JComponent' } });
$J.module(() => {
  JSpinner = $J.load('javax.swing.JSpinner');
  SpinnerNumberModel = $J.load('javax.swing.SpinnerNumberModel');
});
