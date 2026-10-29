// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/option/FileOptionUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, File, JString } from '../../../../../../../jre/index.ts';
import { OptionUI } from './OptionUI.ts';

let Color, JPanel, JTextField, FreeCol, Utility, FreeColDirectories;

/**
 * This class provides visualization for a
 * {@link net.sf.freecol.common.option.FileOption} in order to enable values
 * to be both seen and changed.
 */
export class FileOptionUI extends OptionUI {
  panel: JPanel = null;
  fileField: JTextField = null;
  /**
   * Creates a new {@code FileOptionUI} for the given
   * {@code FileOption}.
   *
   * @param gui The {@code GUI} to create a change dialog on.
   * @param option The {@code FileOption} to make a user interface for.
   * @param editable boolean whether user can modify the setting
   */
  _FileOptionUI(gui: GUI, option: FileOption, editable: boolean): this {
    this._OptionUI(option, editable);
    this.panel = new JPanel()._JPanel$();
    this.panel.add$Component(this.getJLabel());
    let file = option.getValue$();
    this.fileField = new JTextField()._JTextField$String$int((file == null) ? null : file.getAbsolutePath(), 20);
    this.fileField.setToolTipText((file == null) ? null : file.getAbsolutePath());
    this.fileField.setDisabledTextColor(Color.BLACK);
    this.panel.add$Component(this.fileField);
    let browse = Utility.localizedButton$String('browse');
    if (editable) {
      browse.addActionListener((ae) => {
        let isMap = $J.equals('map', option.getType());
        let root = (isMap) ? FreeColDirectories.getMapsDirectory() : FreeColDirectories.getSaveDirectory();
        let extensions = (isMap) ? [FreeCol.FREECOL_MAP_EXTENSION, FreeCol.FREECOL_SAVE_EXTENSION, '*'] : [FreeCol.FREECOL_SAVE_EXTENSION, '*'];
        let f = gui.showLoadSaveFileDialog(root, extensions);
        if (f != null) {
          this.setValue(f);
        }
      });
    }
    this.panel.add$Component(browse);
    let remove = Utility.localizedButton$String('remove');
    if (editable) {
      remove.addActionListener((ae) => {
        this.setValue(null);
      });
    }
    this.panel.add$Component(remove);
    browse.setEnabled(editable);
    remove.setEnabled(editable);
    this.fileField.setEnabled(false);
    this.getJLabel().setLabelFor(this.fileField);
    return this;
  }
  /**
   * Sets the value of this UI's component.
   *
   * @param f The new {@code File} value.
   */
  setValue(f: File): void {
    this.getOption().setValue$Object(f);
    this.reset();
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
    let f = (this.fileField.getText$() == null || (this.fileField.getText$().length === 0)) ? null : new File(this.fileField.getText$());
    this.getOption().setValue$Object(f);
  }
  /**
   * {@inheritDoc}
   */
  reset(): void {
    let file = this.getOption().getValue$();
    let text = (file == null) ? '' : file.getAbsolutePath();
    this.fileField.setText(text);
    this.fileField.setToolTipText(text);
  }
}

$J.define(FileOptionUI, 'net.sf.freecol.client.gui.option.FileOptionUI', { kind: 'class', sup: 'net.sf.freecol.client.gui.option.OptionUI', ctors: { 'net.sf.freecol.client.gui.GUI,net.sf.freecol.common.option.FileOption,boolean': '_FileOptionUI' }, returns: { 'getComponent': 'javax.swing.JPanel' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  JPanel = $J.load('javax.swing.JPanel');
  JTextField = $J.load('javax.swing.JTextField');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
});
