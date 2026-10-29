// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/option/UnitTypeOptionUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColComboBoxRenderer } from '../plaf/FreeColComboBoxRenderer.ts';

let DefaultComboBoxModel, JComboBox, Messages;

/**
 * This class provides visualization for a
 * {@link net.sf.freecol.common.option.UnitTypeOption} in order to enable
 * values to be both seen and changed.
 */
export class UnitTypeOptionUI extends OptionUI {
  box: JComboBox<UnitType> = null;
  /**
   * Creates a new {@code UnitTypeOptionUI} for the given
   * {@code UnitTypeOption}.
   *
   * @param option The {@code UnitTypeOption} to make a user
   *     interface for.
   * @param editable boolean whether user can modify the setting
   */
  _UnitTypeOptionUI(option: UnitTypeOption, editable: boolean): this {
    this._OptionUI(option, editable);
    this.box = new JComboBox()._JComboBox$();
    let choices = option.getChoices();
    this.box.setModel(new DefaultComboBoxModel()._DefaultComboBoxModel$ObjectArr($J.toArrayInto(choices.toArray(), $J.newArray(choices.size(), null))));
    this.box.setSelectedItem(option.getValue$());
    this.box.setRenderer(new UnitTypeOptionUI$ChoiceRenderer()._UnitTypeOptionUI$ChoiceRenderer());
    this.initialize();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getComponent(): JComboBox {
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

export class UnitTypeOptionUI$ChoiceRenderer extends FreeColComboBoxRenderer {
  _UnitTypeOptionUI$ChoiceRenderer(): this {
    this._FreeColComboBoxRenderer$();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  setLabelValues(label: JLabel, value: UnitType): void {
    label.setText((value == null) ? Messages.message$String('none') : Messages.getName$Named(value));
  }
}

$J.define(UnitTypeOptionUI, 'net.sf.freecol.client.gui.option.UnitTypeOptionUI', { kind: 'class', sup: 'net.sf.freecol.client.gui.option.OptionUI', ctors: { 'net.sf.freecol.common.option.UnitTypeOption,boolean': '_UnitTypeOptionUI' }, returns: { 'getComponent': 'javax.swing.JComboBox' } });
$J.define(UnitTypeOptionUI$ChoiceRenderer, 'net.sf.freecol.client.gui.option.UnitTypeOptionUI$ChoiceRenderer', { kind: 'class', sup: 'net.sf.freecol.client.gui.plaf.FreeColComboBoxRenderer', ctors: { '': '_UnitTypeOptionUI$ChoiceRenderer' } });
$J.module(() => {
  DefaultComboBoxModel = $J.load('javax.swing.DefaultComboBoxModel');
  JComboBox = $J.load('javax.swing.JComboBox');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
});
