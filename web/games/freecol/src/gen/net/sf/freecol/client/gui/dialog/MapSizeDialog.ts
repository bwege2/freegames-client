// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/MapSizeDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, NumberFormatException } from '../../../../../../../jre/index.ts';
import { FreeColInputDialog } from './FreeColInputDialog.ts';

let Dimension, JTextField, MigLayout, MigPanel, Utility;

/**
 * A dialog for choosing a map size.
 */
export class MapSizeDialog extends FreeColInputDialog {
  static readonly COLUMNS: number = 5;
  static readonly DEFAULT_HEIGHT: number = 100;
  static readonly DEFAULT_WIDTH: number = 40;
  inputWidth: JTextField = null;
  inputHeight: JTextField = null;
  /**
   * Creates a dialog to choose the map size.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   */
  _MapSizeDialog(freeColClient: FreeColClient, frame: JFrame): this {
    this._FreeColInputDialog$FreeColClient$JFrame(freeColClient, frame);
    this.inputWidth = new JTextField()._JTextField$String$int(String(MapSizeDialog.DEFAULT_WIDTH), MapSizeDialog.COLUMNS);
    this.inputHeight = new JTextField()._JTextField$String$int(String(MapSizeDialog.DEFAULT_HEIGHT), MapSizeDialog.COLUMNS);
    let widthLabel = Utility.localizedLabel$String('width');
    widthLabel.setLabelFor(this.inputWidth);
    let heightLabel = Utility.localizedLabel$String('height');
    heightLabel.setLabelFor(this.inputHeight);
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String('wrap 2'));
    panel.add$Component$Object(Utility.localizedHeader('mapSizeDialog.mapSize', Utility.FONTSPEC_SUBTITLE), 'span, align center');
    panel.add$Component$Object(widthLabel, 'newline 20');
    panel.add$Component(this.inputWidth);
    panel.add$Component(heightLabel);
    panel.add$Component(this.inputHeight);
    this.initializeInputDialog(frame, true, panel, null, 'ok', 'cancel');
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getInputValue(): Dimension {
    let width: number;
    let height: number;
    try {
      width = $J.parseInt(this.inputWidth.getText$());
      height = $J.parseInt(this.inputHeight.getText$());
    } catch ($e0) {
      if ($J.isa($e0, NumberFormatException)) {
        let nfe = $J.exc($e0);
        return null;
      } else {
        throw $e0;
      }
    }
    return (width <= 0 || height <= 0) ? null : new Dimension()._Dimension$int$int(width, height);
  }
  /**
   * {@inheritDoc}
   */
  requestFocus$(): void {
    this.inputWidth.requestFocus$();
  }
}

$J.define(MapSizeDialog, 'net.sf.freecol.client.gui.dialog.MapSizeDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColInputDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame': '_MapSizeDialog' }, returns: { 'getInputValue': 'java.awt.Dimension' }, meths: { 'requestFocus()': 'requestFocus$' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  JTextField = $J.load('javax.swing.JTextField');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
});
