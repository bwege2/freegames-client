// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/LoadDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, File } from '../../../../../../../jre/index.ts';
import { FreeColDialog } from './FreeColDialog.ts';

let JFileChooser, FreeColDialog$DialogType, Messages;

/**
 * A dialog for choosing a file to load.
 */
export class LoadDialog extends FreeColDialog {
  /**
   * Fake file for the cancel selection.
   */
  static cancelFile: File = null;
  /**
   * Creates a dialog to choose a file to load.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param directory The directory to display when choosing the file.
   * @param fileFilters The available file filters in the dialog.
   */
  _LoadDialog(freeColClient: FreeColClient, frame: JFrame, directory: File, fileFilters: FileFilter[]): this {
    this._FreeColDialog$FreeColClient$JFrame(freeColClient, frame);
    let fileChooser = new JFileChooser()._JFileChooser$File(directory);
    if (fileFilters.length > 0) {
      for (let fileFilter of fileFilters) {
        fileChooser.addChoosableFileFilter(fileFilter);
      }
      fileChooser.setFileFilter(fileFilters[0]);
      fileChooser.setAcceptAllFileFilterUsed(false);
    }
    fileChooser.setControlButtonsAreShown(true);
    fileChooser.setApproveButtonText(Messages.message$String('ok'));
    fileChooser.setDialogType(JFileChooser.OPEN_DIALOG);
    fileChooser.setFileSelectionMode(JFileChooser.FILES_ONLY);
    fileChooser.setFileHidingEnabled(false);
    fileChooser.addActionListener((ae) => {
      let cmd = ae.getActionCommand();
      let value = ($J.equals(JFileChooser.APPROVE_SELECTION, cmd)) ? (ae.getSource()).getSelectedFile() : LoadDialog.cancelFile;
      this.setValue(value);
    });
    let c = FreeColDialog.choices();
    this.initializeDialog(frame, FreeColDialog$DialogType.QUESTION, true, fileChooser, null, c);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getResponse(): File {
    let value = this.getValue();
    return (value === LoadDialog.cancelFile) ? null : value;
  }
  static $clinit() {
    LoadDialog.cancelFile = new File('');
  }
}

$J.define(LoadDialog, 'net.sf.freecol.client.gui.dialog.LoadDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,java.io.File,javax.swing.filechooser.FileFilter[]': '_LoadDialog' }, returns: { 'getResponse': 'java.io.File' }, clinit: true, lazy: ['cancelFile'] });
$J.module(() => {
  JFileChooser = $J.load('javax.swing.JFileChooser');
  FreeColDialog$DialogType = $J.load('net.sf.freecol.client.gui.dialog.FreeColDialog$DialogType');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
});
