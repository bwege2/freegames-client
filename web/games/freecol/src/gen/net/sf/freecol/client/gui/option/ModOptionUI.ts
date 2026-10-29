// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/option/ModOptionUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let DefaultComboBoxModel, ImageIcon, JComboBox, Messages, ResourceManager;

/**
 * This class provides visualization for a
 * {@link net.sf.freecol.common.option.ModOption} in order to enable
 * values to be both seen and changed.
 */
export class ModOptionUI extends OptionUI {
  gui: GUI = null;
  /**
   * The selection box for the various mod files.
   */
  box: JComboBox<FreeColModFile> = null;
  /**
   * Creates a new {@code ModOptionUI} for the given
   * {@code ModOption}.
   *
   * @param option The {@code ModOption} to make a user interface for
   * @param editable boolean whether user can modify the setting
   */
  _ModOptionUI(gui: GUI, option: ModOption, editable: boolean): this {
    this._OptionUI(option, editable);
    this.gui = gui;
    let model = new DefaultComboBoxModel()._DefaultComboBoxModel$();
    for (const $it0 = option.getChoices().iterator(); $it0.hasNext(); ) {
      let choice = $it0.next();
      model.addElement(choice);
    }
    this.box = new JComboBox()._JComboBox$();
    this.box.setModel(model);
    this.box.setRenderer(new ModOptionUI$BoxRenderer()._ModOptionUI$BoxRenderer(gui));
    if (option.getValue$() != null) {
      this.box.setSelectedItem(option.getValue$());
    }
    this.initialize();
    return this;
  }
  /**
   * Add information from a mod file to a label.
   *
   * @param label The {@code JLabel} to modify.
   * @param modFile The {@code FreeColModFile} to use.
   */
  static labelModFile(gui: GUI, label: JLabel, modFile: FreeColModFile): void {
    let key = 'mod.' + modFile.getId();
    label.setText(Messages.getName$String(key));
    if (Messages.containsKey(Messages.shortDescriptionKey(key))) {
      label.setToolTipText(Messages.getShortDescription$String(key));
    }
    let containsSpecification = modFile.hasSpecification();
    if (containsSpecification) {
      label.setIcon(new ImageIcon()._ImageIcon$Image(ResourceManager.getImage$String('image.ui.includesSpecification')));
    } else {
      label.setIcon(new ImageIcon()._ImageIcon$Image(ResourceManager.getImage$String('image.ui.noSpecification')));
    }
    let shouldBeEnabled = gui.canGameChangingModsBeAdded() || !containsSpecification;
    label.setEnabled(shouldBeEnabled);
  }
  /**
   * {@inheritDoc}
   */
  getListCellRenderer(): ListCellRenderer {
    return new ModOptionUI$ModOptionRenderer()._ModOptionUI$ModOptionRenderer(this.gui);
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
  getComponent(): JComboBox {
    return this.box;
  }
  /**
   * {@inheritDoc}
   */
  reset(): void {
    this.box.setSelectedItem(this.getOption().getValue$());
  }
}

export class ModOptionUI$BoxRenderer extends FreeColComboBoxRenderer {
  gui: GUI = null;
  _ModOptionUI$BoxRenderer(gui: GUI): this {
    this._FreeColComboBoxRenderer$();
    this.gui = gui;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  setLabelValues(label: JLabel, value: FreeColModFile): void {
    if (value != null) {
      ModOptionUI.labelModFile(this.gui, label, value);
    }
  }
}

export class ModOptionUI$ModOptionRenderer extends FreeColComboBoxRenderer {
  gui: GUI = null;
  _ModOptionUI$ModOptionRenderer(gui: GUI): this {
    this._FreeColComboBoxRenderer$();
    this.gui = gui;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  setLabelValues(label: JLabel, value: ModOption): void {
    let modFile = value.getValue$();
    if (modFile == null) {
      label.setText(value.toString());
    } else {
      ModOptionUI.labelModFile(this.gui, label, modFile);
    }
  }
}

$J.define(ModOptionUI, 'net.sf.freecol.client.gui.option.ModOptionUI', { kind: 'class', sup: 'net.sf.freecol.client.gui.option.OptionUI', ctors: { 'net.sf.freecol.client.gui.GUI,net.sf.freecol.common.option.ModOption,boolean': '_ModOptionUI' }, returns: { 'getComponent': 'javax.swing.JComboBox', 'getListCellRenderer': 'javax.swing.ListCellRenderer' } });
$J.define(ModOptionUI$BoxRenderer, 'net.sf.freecol.client.gui.option.ModOptionUI$BoxRenderer', { kind: 'class', sup: 'net.sf.freecol.client.gui.plaf.FreeColComboBoxRenderer', ctors: { 'net.sf.freecol.client.gui.GUI': '_ModOptionUI$BoxRenderer' } });
$J.define(ModOptionUI$ModOptionRenderer, 'net.sf.freecol.client.gui.option.ModOptionUI$ModOptionRenderer', { kind: 'class', sup: 'net.sf.freecol.client.gui.plaf.FreeColComboBoxRenderer', ctors: { 'net.sf.freecol.client.gui.GUI': '_ModOptionUI$ModOptionRenderer' } });
$J.module(() => {
  DefaultComboBoxModel = $J.load('javax.swing.DefaultComboBoxModel');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JComboBox = $J.load('javax.swing.JComboBox');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
});
