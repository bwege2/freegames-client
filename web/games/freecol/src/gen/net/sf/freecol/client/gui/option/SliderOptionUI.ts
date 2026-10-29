// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/option/SliderOptionUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Color, Dimension, JSlider, SwingConstants, Utility;

/**
 * This class provides a JSlider as visualization for an
 * {@link net.sf.freecol.common.option.IntegerOption} or one of its
 * subclasses.
 */
export class SliderOptionUI<T> extends OptionUI {
  slider: JSlider = null;
  /**
   * Creates a new {@code SliderOptionUI} for the given
   * {@code IntegerOption}.
   *
   * @param option The {@code IntegerOption} to make a user
   *     interface for.
   * @param editable boolean whether user can modify the setting
   */
  _SliderOptionUI(option: T, editable: boolean): this {
    this._OptionUI(option, editable);
    this.slider = new JSlider()._JSlider$();
    this.slider.setBorder(Utility.localizedBorder$String$Color(super.getJLabel().getText(), Color.BLACK));
    this.slider.setOrientation(SwingConstants.HORIZONTAL);
    this.slider.setPreferredSize(new Dimension()._Dimension$int$int(500, 50));
    this.slider.setPaintLabels(true);
    this.slider.setPaintTicks(true);
    this.slider.setExtent(0);
    this.initialize();
    return this;
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
  getComponent(): JSlider {
    return this.slider;
  }
  /**
   * {@inheritDoc}
   */
  updateOption(): void {
    this.getOption().setValue$Object(this.slider.getValue());
  }
  /**
   * {@inheritDoc}
   */
  reset(): void {
    this.slider.setValue(this.getOption().getValue$());
  }
}

$J.define(SliderOptionUI, 'net.sf.freecol.client.gui.option.SliderOptionUI', { kind: 'class', sup: 'net.sf.freecol.client.gui.option.OptionUI', ctors: { 'net.sf.freecol.common.option.Option,boolean': '_SliderOptionUI' }, returns: { 'getComponent': 'javax.swing.JSlider', 'getJLabel': 'javax.swing.JLabel' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Dimension = $J.load('java.awt.Dimension');
  JSlider = $J.load('javax.swing.JSlider');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
});
