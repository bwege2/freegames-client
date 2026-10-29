// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/OptionsDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from '../panel/FreeColPanel.ts';

let Dimension, AbstractAction, MigLayout, FreeCol, OptionGroupUI, MigPanel, Utility, Messages, FreeColDirectories, OptionGroup;

/**
 * Dialog for changing the options of an {@link OptionGroup}.
 */
export class OptionsDialog extends FreeColPanel {
  static logger: Logger = null;
  /**
   * The option group to display.
   */
  group: OptionGroup = null;
  /**
   * The supporting UI for the displayed group.
   */
  ui$OptionsDialog: OptionGroupUI = null;
  /**
   * The name of the file containing the default settings.
   */
  defaultFileName: string = null;
  /**
   * The option group identifier defining the group to load within the
   * default settings file.
   */
  optionGroupId: string = null;
  /**
   * Dialog internal parts.
   */
  optionPanel: MigPanel = null;
  panel: MigPanel = null;
  dialogHandler: DialogHandler<OptionGroup> = null;
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param group The {@code OptionGroup} to display.
   * @param headerKey The message identifier for the header.
   * @param defaultFileName The name of the default file to back
   *     this dialog with.
   * @param optionGroupId The identifier for the overall option group.
   */
  _OptionsDialog(freeColClient: FreeColClient, group: OptionGroup, headerKey: string, defaultFileName: string, optionGroupId: string, editable: boolean): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new MigLayout()._MigLayout$String('fill'));
    this.editable = editable;
    this.group = group;
    this.ui$OptionsDialog = new OptionGroupUI()._OptionGroupUI(this.getGUI(), this.group, editable);
    this.defaultFileName = defaultFileName;
    this.optionGroupId = optionGroupId;
    this.preparePanel(headerKey, this.ui$OptionsDialog);
    return this;
  }
  /**
   * Get the option group being displayed by this dialog.
   *
   * @return The {@code OptionGroup}.
   */
  getGroup(): OptionGroup {
    return this.group;
  }
  /**
   * Get the option group UI controlling this dialog.
   *
   * @return The {@code OptionGroupUI}.
   */
  getOptionUI(): OptionGroupUI {
    return this.ui$OptionsDialog;
  }
  /**
   * Get the default name of the file to save the {@code OptionGroup}.
   *
   * @return A default file name.
   */
  getDefaultFileName(): string {
    return this.defaultFileName;
  }
  /**
   * Get the identifier of the {@code OptionGroup}.
   *
   * @return The option group identifier.
   */
  getOptionGroupId(): string {
    return this.optionGroupId;
  }
  setDialogHandler(dialogHandler: DialogHandler<OptionGroup>): void {
    this.dialogHandler = dialogHandler;
  }
  /**
   * Load the panel.
   *
   * @param headerKey A message key for the panel title.
   * @param ui The {@code OptionGroupUI} to encapsulate.
   */
  preparePanel(headerKey: string, ui: OptionGroupUI): void {
    this.optionPanel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String('fill, insets 0'));
    this.optionPanel.setOpaque(false);
    this.optionPanel.add$Component$Object(ui, 'grow, gap 0 0, pad 0');
    this.optionPanel.setSize$Dimension(this.optionPanel.getPreferredSize$());
    this.panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String('wrap 1, fill, insets 0'));
    this.panel.add$Component$Object(Utility.localizedHeader(Messages.nameKey$String(headerKey), Utility.FONTSPEC_TITLE), 'span, center');
  }
  /**
   * Initialize this dialog.
   *
   * @param frame The owner frame.
   * @param c Extra choices to add beyond the default ok and cancel.
   */
  initialize(frame: JFrame, extraButtons: List<JButton>): void {
    this.panel.add$Component$Object(this.optionPanel, 'width 100%, height 100%, gap 0 0, pad 0');
    this.add$Component$Object(this.panel, 'grow, gap 0 0, pad 0');
    this.add$Component$Object(this.okButton, 'newline, split, tag ok');
    if (this.isEditable()) {
      let cancelButton = Utility.localizedButton$String('cancel');
      cancelButton.setActionCommand(FreeColPanel.CANCEL);
      cancelButton.addActionListener($J.fn(this, 'actionPerformed'));
      this.add$Component$Object(cancelButton, 'tag cancel');
      this.setEscapeAction(new (OptionsDialog$1())().$o(this)._AbstractAction$());
    }
    for (const $it0 = extraButtons.iterator(); $it0.hasNext(); ) {
      let button = $it0.next();
      this.add$Component$Object(button, 'tag left');
    }
    let scaleFactor = this.getImageLibrary().getScaleFactor();
    let maxWidth = $J.d2i((Math.fround(850 * scaleFactor)));
    let maxHeight = $J.d2i((Math.fround(650 * scaleFactor)));
    let width = Math.min(maxWidth, (frame.getWidth() - 200) | 0);
    let height = Math.min(maxHeight, (frame.getHeight() - 200) | 0);
    this.panel.setSize$Dimension(new Dimension()._Dimension$int$int(width, height));
  }
  /**
   * Set the group for this panel.
   *
   * @param group The new {@code OptionGroup}.
   */
  set(group: OptionGroup): void {
    this.group = group;
    this.update$$OptionsDialog();
  }
  /**
   * Completely update the ui.
   */
  update$$OptionsDialog(): void {
    this.optionPanel.removeAll();
    this.ui$OptionsDialog = new OptionGroupUI()._OptionGroupUI(this.getGUI(), this.group, this.editable);
    this.optionPanel.add$Component$Object(this.ui$OptionsDialog, 'grow');
    this.invalidate();
    this.validate();
    this.repaint$();
  }
  /**
   * Load an option group from given File.
   *
   * @param file A {@code File} to load from.
   * @return True if the load succeeded.
   */
  load(file: File): boolean {
    let og = this.group;
    if (og == null) {
      og = OptionGroup.loadOptionGroup(file, this.getOptionGroupId(), this.getSpecification());
    } else {
      this.group.load$File(file);
    }
    if (og == null) {
      return false;
    }
    this.set(og);
    return true;
  }
  /**
   * Save an option group to a given File.
   *
   * @param file The {@code File} to save to.
   * @return True if the save succeeded.
   */
  save(file: File): boolean {
    if (this.group.save$File$WriteScope$boolean(file, null, true)) {
      return true;
    }
    this.getGUI().showErrorPanel$StringTemplate(FreeCol.badFile('error.couldNotSave', file));
    return false;
  }
  /**
   * Load the option group from the default file.
   *
   * @return True if the options were loaded.
   */
  loadDefaultOptions(): boolean {
    let f = FreeColDirectories.getOptionsFile(this.getDefaultFileName());
    return (f.exists()) ? this.load(f) : false;
  }
  /**
   * Save the option group to the default file.
   *
   * @return True if the options were saved.
   */
  saveDefaultOptions(): boolean {
    let f = FreeColDirectories.getOptionsFile(this.getDefaultFileName());
    return this.save(f);
  }
  /**
   * Resets so that the option with preview (volume)
   * gets restored on cancel.
   */
  cancelOptionsDialog(): void {
    this.getOptionUI().reset();
    this.getGUI().removeComponent(this);
    if (this.dialogHandler != null) {
      $J.fn(this.dialogHandler, 'handle')(null);
    }
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let command = ae.getActionCommand();
    if ($J.equals(FreeColPanel.OK, command)) {
      if (!this.isEditable()) {
        this.getGUI().removeComponent(this);
        if (this.dialogHandler != null) {
          $J.fn(this.dialogHandler, 'handle')(null);
        }
        return;
      }
      this.getOptionUI().updateOption();
      this.saveDefaultOptions();
      this.getGUI().removeComponent(this);
      if (this.dialogHandler != null) {
        $J.fn(this.dialogHandler, 'handle')(this.group);
      }
    } else if ($J.equals(FreeColPanel.CANCEL, command)) {
      this.cancelOptionsDialog();
    } else {
      OptionsDialog.logger.warning('Bad event: ' + command);
    }
  }
  static $clinit() {
    OptionsDialog.logger = Logger.getLogger($J.cls(OptionsDialog).getName());
  }
}

let $OptionsDialog$1: any = null;
/** An anonymous class (OptionsDialog.java:172). */
function OptionsDialog$1(): any {
  return $OptionsDialog$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.cancelOptionsDialog();
    }
  }, 'net.sf.freecol.client.gui.dialog.OptionsDialog$1', []);
}

$J.define(OptionsDialog, 'net.sf.freecol.client.gui.dialog.OptionsDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.option.OptionGroup,java.lang.String,java.lang.String,java.lang.String,boolean': '_OptionsDialog' }, returns: { 'getOptionGroupId': 'java.lang.String', 'getDefaultFileName': 'java.lang.String', 'getOptionUI': 'net.sf.freecol.client.gui.option.OptionGroupUI', 'getGroup': 'net.sf.freecol.common.option.OptionGroup' }, meths: { 'update()': 'update$$OptionsDialog' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  AbstractAction = $J.load('javax.swing.AbstractAction');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  OptionGroupUI = $J.load('net.sf.freecol.client.gui.option.OptionGroupUI');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  OptionGroup = $J.load('net.sf.freecol.common.option.OptionGroup');
});
