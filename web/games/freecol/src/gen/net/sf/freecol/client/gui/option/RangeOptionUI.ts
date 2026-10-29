// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/option/RangeOptionUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Hashtable } from '../../../../../../../jre/index.ts';
import { SliderOptionUI } from './SliderOptionUI.ts';

let DefaultBoundedRangeModel, JLabel, Utility;

/**
 * This class provides visualization for a
 * {@link net.sf.freecol.common.option.RangeOption} in order to enable
 * values to be both seen and changed.
 */
export class RangeOptionUI extends SliderOptionUI {
  /**
   * Creates a new {@code RangeOptionUI} for the given
   * {@code RangeOption}.
   *
   * @param option The {@code RangeOption} to make a user interface for
   * @param editable boolean whether user can modify the setting
   */
  _RangeOptionUI(option: RangeOption, editable: boolean): this {
    this._SliderOptionUI(option, editable);
    let slider = this.getComponent();
    slider.setModel(new DefaultBoundedRangeModel()._DefaultBoundedRangeModel$int$int$int$int(option.getValueRank(), 0, 0, (option.getItemValues().size() - 1) | 0));
    let labels = new Hashtable();
    let index = 0;
    for (const $it0 = option.getItemValues().values().iterator(); $it0.hasNext(); ) {
      let string$ = $it0.next();
      if (option.localizeLabels()) {
        labels.put(index, Utility.localizedLabel$String(string$));
      } else {
        labels.put(index, new JLabel()._JLabel$String(string$));
      }
      index++;
    }
    slider.setLabelTable(labels);
    slider.setValue(option.getValueRank());
    slider.setMajorTickSpacing(1);
    slider.setSnapToTicks(true);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  updateOption(): void {
    this.getOption().setValueRank(this.getComponent().getValue());
  }
  /**
   * {@inheritDoc}
   */
  reset(): void {
    this.getComponent().setValue(this.getOption().getValueRank());
  }
}

$J.define(RangeOptionUI, 'net.sf.freecol.client.gui.option.RangeOptionUI', { kind: 'class', sup: 'net.sf.freecol.client.gui.option.SliderOptionUI', ctors: { 'net.sf.freecol.common.option.RangeOption,boolean': '_RangeOptionUI' } });
$J.module(() => {
  DefaultBoundedRangeModel = $J.load('javax.swing.DefaultBoundedRangeModel');
  JLabel = $J.load('javax.swing.JLabel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
});
