// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/DifficultyDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Logger } from '../../../../../../../jre/index.ts';
import { OptionsDialog } from './OptionsDialog.ts';

let Utility, FreeColDirectories, StringTemplate;

/**
 * Dialog for displaying and modifying the difficulty level.
 *
 * @see OptionGroup
 */
export class DifficultyDialog extends OptionsDialog {
  static logger: Logger = null;
  /**
   * The currently selected subgroup.
   */
  selected: OptionGroup = null;
  /**
   * We need our own copy of the specification, as the dialog is
   * used before the game has been started.
   */
  specification: Specification = null;
  /**
   * Use this constructor to display the difficulty level of the
   * current game read-only.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param specification The {@code Specification} to base the difficulty on.
   * @param level An {@code OptionGroup} encapsulating the difficulty
   *     level to display.
   * @param editable Is the dialog editable?
   */
  _DifficultyDialog(freeColClient: FreeColClient, frame: JFrame, specification: Specification, level: OptionGroup, editable: boolean): this {
    this._OptionsDialog(freeColClient, level, 'difficultyDialog', FreeColDirectories.CUSTOM_DIFFICULTY_FILE_NAME, 'model.difficulty.custom', editable);
    this.specification = specification;
    this.selected = level;
    this.getOptionUI().getTree().addTreeSelectionListener(this);
    let extraButtons = new ArrayList();
    if (this.isEditable()) {
      let resetButton = Utility.localizedButton$String('reset');
      this.addResetAction(resetButton);
      let loadButton = Utility.localizedButton$String('load');
      this.addLoadAction(loadButton);
      let saveButton = Utility.localizedButton$String('save');
      this.addSaveAction(saveButton);
      extraButtons.add(resetButton);
      extraButtons.add(loadButton);
      extraButtons.add(saveButton);
    }
    this.initialize(frame, extraButtons);
    return this;
  }
  /**
   * Gets this dialog's instance of the {@code Specification}.
   *
   * @return The {@code Specification}.
   */
  getSpecification(): Specification {
    return this.specification;
  }
  /**
   * Add a reset action to a button.
   *
   * @param button The {@code JButton} to add the action to.
   */
  addResetAction(button: JButton): void {
    button.addActionListener((ae) => {
      this.getOptionUI().reset();
    });
  }
  /**
   * Add a load action to a button.
   *
   * @param button The {@code JButton} to add the action to.
   */
  addLoadAction(button: JButton): void {
    button.addActionListener((ae) => {
      let dir = FreeColDirectories.getOptionsDirectory();
      let file = this.getGUI().showLoadDialog(dir, ['xml']);
      if (file != null) {
        if (this.load(file)) {
        } else {
          let err = StringTemplate.template$String('error.couldNotLoadDifficulty').addName$String$String('%name%', file.getPath());
          this.getGUI().showErrorPanel$StringTemplate(err);
        }
      }
    });
  }
  /**
   * Add a save action to a button.
   *
   * @param button The {@code JButton} to add the action to.
   */
  addSaveAction(button: JButton): void {
    button.addActionListener((ae) => {
      let dir = FreeColDirectories.getOptionsDirectory();
      let file = this.getGUI().showSaveDialog(dir, this.getDefaultFileName());
      if (file != null) {
        this.getOptionUI().updateOption();
        this.save(file);
      }
    });
  }
  valueChanged(event: TreeSelectionEvent): void {
    let path = event.getPath();
    if (path.getPathCount() >= 2) {
      let node = path.getPathComponent(1);
      this.selected = node.getUserObject();
    }
  }
  saveDefaultOptions(): boolean {
    return false;
  }
  static $clinit() {
    DifficultyDialog.logger = Logger.getLogger($J.cls(DifficultyDialog).getName());
  }
}

$J.define(DifficultyDialog, 'net.sf.freecol.client.gui.dialog.DifficultyDialog', { kind: 'class', ifaces: ['javax.swing.event.TreeSelectionListener'], sup: 'net.sf.freecol.client.gui.dialog.OptionsDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,net.sf.freecol.common.model.Specification,net.sf.freecol.common.option.OptionGroup,boolean': '_DifficultyDialog' }, returns: { 'getSpecification': 'net.sf.freecol.common.model.Specification' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
});
