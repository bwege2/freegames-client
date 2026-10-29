// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/option/AbstractUnitOptionUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let DefaultComboBoxModel, MigLayout, IntegerOptionUI, StringOptionUI, UnitTypeOptionUI, MigPanel, Utility, Messages, Ability, AbstractUnit, Specification;

/**
 * This class provides visualization for an
 * {@link net.sf.freecol.common.option.AbstractUnitOption} in order to enable
 * values to be both seen and changed.
 */
export class AbstractUnitOptionUI extends OptionUI {
  panel: JPanel = null;
  numberUI: IntegerOptionUI = null;
  typeUI: UnitTypeOptionUI = null;
  roleUI: StringOptionUI = null;
  roleEditable: boolean = false;
  /**
   * Creates a new {@code AbstractUnitOptionUI} for the given
   * {@code AbstractUnitOption}.
   *
   * @param option The {@code AbstractUnitOption} to make a
   *     user interface for
   * @param editable boolean whether user can modify the setting
   */
  _AbstractUnitOptionUI(option: AbstractUnitOption, editable: boolean): this {
    this._OptionUI(option, editable);
    this.panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$());
    let numberOption = option.getNumber();
    let typeOption = option.getUnitType();
    let roleOption = option.getRole();
    let numberEditable = editable && (numberOption.getMaximumValue() > numberOption.getMinimumValue());
    this.numberUI = new IntegerOptionUI()._IntegerOptionUI(numberOption, numberEditable);
    Utility.localizeToolTip$JComponent$String(this.numberUI.getComponent(), 'number');
    this.panel.add$Component$Object(this.numberUI.getComponent(), 'width 30%');
    let typeEditable = editable && typeOption.getChoices().size() > 1;
    this.typeUI = new UnitTypeOptionUI()._UnitTypeOptionUI(typeOption, typeEditable);
    Utility.localizeToolTip$JComponent$String(this.typeUI.getComponent(), 'unitType');
    this.typeUI.getComponent().addItemListener($J.fn(this, 'itemStateChanged'));
    this.panel.add$Component$Object(this.typeUI.getComponent(), 'width 35%');
    this.roleEditable = editable && roleOption.getChoices().size() > 1;
    this.roleUI = new StringOptionUI()._StringOptionUI(roleOption, this.roleEditable);
    Utility.localizeToolTip$JComponent$String(this.roleUI.getComponent(), 'model.role.name');
    this.roleUI.getComponent().setRenderer(new AbstractUnitOptionUI$RoleRenderer()._AbstractUnitOptionUI$RoleRenderer());
    this.panel.add$Component$Object(this.roleUI.getComponent(), 'width 35%');
    this.initialize();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  itemStateChanged(e: ItemEvent): void {
    let box = this.roleUI.getComponent();
    let model: DefaultComboBoxModel<string>;
    let enable = false;
    let type$ = this.typeUI.getComponent().getSelectedItem();
    if (type$ != null && type$.hasAbility$String(Ability.CAN_BE_EQUIPPED)) {
      let spec = type$.getSpecification();
      let nt = this.getOption().getNationType();
      let n = 0;
      model = new DefaultComboBoxModel()._DefaultComboBoxModel$();
      for (const $it0 = this.getOption().getRole().getChoices().iterator(); $it0.hasNext(); ) {
        let ri = $it0.next();
        let role = spec.getRole(ri);
        if (role.isAvailableTo([type$, nt])) {
          model.addElement(ri);
          n++;
        }
      }
      enable = n > 1 && this.isEditable();
    } else {
      model = new DefaultComboBoxModel()._DefaultComboBoxModel$ObjectArr([Specification.DEFAULT_ROLE_ID]);
    }
    box.setModel(model);
    box.setEnabled(enable);
  }
  /**
   * {@inheritDoc}
   */
  getListCellRenderer(): ListCellRenderer {
    return new AbstractUnitOptionUI$AbstractUnitRenderer()._AbstractUnitOptionUI$AbstractUnitRenderer();
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
    this.typeUI.updateOption();
    this.roleUI.updateOption();
    this.numberUI.updateOption();
    let type$ = this.typeUI.getOption().getValue$();
    let roleId = this.roleUI.getOption().getValue$();
    let number$ = this.numberUI.getOption().getValue$();
    this.getOption().setValue$Object(new AbstractUnit()._AbstractUnit$UnitType$String$int(type$, roleId, number$));
  }
  /**
   * {@inheritDoc}
   */
  reset(): void {
    this.typeUI.reset();
    this.roleUI.reset();
    this.numberUI.reset();
  }
}

export class AbstractUnitOptionUI$AbstractUnitRenderer extends FreeColComboBoxRenderer {
  _AbstractUnitOptionUI$AbstractUnitRenderer(): this {
    this._FreeColComboBoxRenderer$();
    return this;
  }
  setLabelValues(label: JLabel, value: AbstractUnitOption): void {
    label.setText(Messages.message$StringTemplate(value.getValue$().getLabel()));
  }
}

export class AbstractUnitOptionUI$RoleRenderer extends FreeColComboBoxRenderer {
  _AbstractUnitOptionUI$RoleRenderer(): this {
    this._FreeColComboBoxRenderer$();
    return this;
  }
  setLabelValues(label: JLabel, value: string): void {
    label.setText((value == null) ? '' : Messages.getName$String(value));
  }
}

$J.define(AbstractUnitOptionUI, 'net.sf.freecol.client.gui.option.AbstractUnitOptionUI', { kind: 'class', ifaces: ['java.awt.event.ItemListener'], sup: 'net.sf.freecol.client.gui.option.OptionUI', ctors: { 'net.sf.freecol.common.option.AbstractUnitOption,boolean': '_AbstractUnitOptionUI' }, returns: { 'getComponent': 'javax.swing.JPanel', 'getListCellRenderer': 'javax.swing.ListCellRenderer' } });
$J.define(AbstractUnitOptionUI$AbstractUnitRenderer, 'net.sf.freecol.client.gui.option.AbstractUnitOptionUI$AbstractUnitRenderer', { kind: 'class', sup: 'net.sf.freecol.client.gui.plaf.FreeColComboBoxRenderer', ctors: { '': '_AbstractUnitOptionUI$AbstractUnitRenderer' } });
$J.define(AbstractUnitOptionUI$RoleRenderer, 'net.sf.freecol.client.gui.option.AbstractUnitOptionUI$RoleRenderer', { kind: 'class', sup: 'net.sf.freecol.client.gui.plaf.FreeColComboBoxRenderer', ctors: { '': '_AbstractUnitOptionUI$RoleRenderer' } });
$J.module(() => {
  DefaultComboBoxModel = $J.load('javax.swing.DefaultComboBoxModel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  IntegerOptionUI = $J.load('net.sf.freecol.client.gui.option.IntegerOptionUI');
  StringOptionUI = $J.load('net.sf.freecol.client.gui.option.StringOptionUI');
  UnitTypeOptionUI = $J.load('net.sf.freecol.client.gui.option.UnitTypeOptionUI');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractUnit = $J.load('net.sf.freecol.common.model.AbstractUnit');
  Specification = $J.load('net.sf.freecol.common.model.Specification');
});
