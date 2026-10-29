// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/option/PercentageOptionUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let DefaultBoundedRangeModel, JLabel;

/**
 * This class provides visualization for a
 * {@link net.sf.freecol.common.option.PercentageOption}
 * in order to enable values to be both seen and changed.
 */
export class PercentageOptionUI extends SliderOptionUI {
  /**
   * Creates a new {@code PercentageOptionUI} for the given
   * {@code PercentageOption}.
   *
   * @param option The {@code PercentageOption} to make a user
   *     interface for.
   * @param editable boolean whether user can modify the setting
   */
  _PercentageOptionUI(option: PercentageOption, editable: boolean): this {
    this._SliderOptionUI(option, editable);
    let slider = this.getComponent();
    slider.setModel(new DefaultBoundedRangeModel()._DefaultBoundedRangeModel$int$int$int$int(option.getValue$(), 0, 0, 100));
    let labels = new Hashtable();
    labels.put(0, new JLabel()._JLabel$String('0 %'));
    labels.put(25, new JLabel()._JLabel$String('25 %'));
    labels.put(50, new JLabel()._JLabel$String('50 %'));
    labels.put(75, new JLabel()._JLabel$String('75 %'));
    labels.put(100, new JLabel()._JLabel$String('100 %'));
    slider.setLabelTable(labels);
    slider.setValue(option.getValue$());
    slider.setMajorTickSpacing(5);
    slider.setSnapToTicks(false);
    slider.addChangeListener((event) => {
      if (this.getOption().isPreviewEnabled()) {
        this.getOption().setValue$Object(slider.getValue());
      }
    });
    return this;
  }
  reset(): void {
    this.getOption().resetValue();
    super.reset();
  }
}

$J.define(PercentageOptionUI, 'net.sf.freecol.client.gui.option.PercentageOptionUI', { kind: 'class', sup: 'net.sf.freecol.client.gui.option.SliderOptionUI', ctors: { 'net.sf.freecol.common.option.PercentageOption,boolean': '_PercentageOptionUI' } });
$J.module(() => {
  DefaultBoundedRangeModel = $J.load('javax.swing.DefaultBoundedRangeModel');
  JLabel = $J.load('javax.swing.JLabel');
});
