// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/option/OptionUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../../jre/index.ts';

let JLabel, FreeColAction, AbstractUnitOptionUI, AudioMixerOptionUI, BooleanOptionUI, FileOptionUI, FreeColActionUI, IntegerOptionUI, LanguageOptionUI, ListOptionUI, ModOptionUI, PercentageOptionUI, RangeOptionUI, SelectOptionUI, StringOptionUI, TextOptionUI, Messages, AbstractUnitOption, AudioMixerOption, BooleanOption, FileOption, IntegerOption, LanguageOption, ModListOption, ModOption, PercentageOption, RangeOption, SelectOption, StringOption, TextOption, UnitListOption;

/**
 * This class provides common methods for various Option UIs.
 */
export class OptionUI<T> extends JObject {
  /**
   * Whether the Option should be editable.
   */
  editable: boolean = false;
  /**
   * The label to use for the Option.
   */
  label: JLabel = null;
  /**
   * The Option value itself.
   */
  option: T = null;
  enabler: BooleanOptionUI = null;
  /**
   * Constructor.
   *
   * @param option The {@code Option} to display.
   * @param editable True if the option should be editable.
   */
  _OptionUI(option: T, editable: boolean): this {
    this.label = new JLabel()._JLabel$();
    this.enabler = null;
    this.option = option;
    this.editable = editable;
    let name = Messages.getName$String(option.getId());
    let text = Messages.getBestDescription$ObjectWithId(option);
    this.label.setText(name);
    this.label.setToolTipText(text);
    return this;
  }
  /**
   * Set up component.
   */
  initialize(): void {
    let component = this.getComponent();
    component.setToolTipText(this.label.getToolTipText$());
    component.setEnabled(this.isEditable());
    component.setOpaque(false);
  }
  getOption(): T {
    return this.option;
  }
  setOption(newOption: T): void {
    this.option = newOption;
  }
  isEditable(): boolean {
    return this.editable && this.isEnabled();
  }
  isEnabled(): boolean {
    return this.enabler == null || this.enabler.getValue();
  }
  setEditable(newEditable: boolean): void {
    this.editable = newEditable;
  }
  setEnabler(enabler: BooleanOptionUI): void {
    this.enabler = enabler;
    let component = this.getComponent();
    component.setEnabled(this.isEditable());
  }
  getJLabel(): JLabel {
    return this.label;
  }
  setLabel(label: JLabel): void {
    this.label = label;
  }
  /**
   * Get a ListCellRenderer suitable for the wrapped Option.
   *
   * @return A suitable ListCellRenderer.
   */
  getListCellRenderer(): ListCellRenderer {
    return null;
  }
  /**
   * Get an option UI for a given option.
   *
   * @param gui The {@code GUI} to use.
   * @param option The {@code Option} to check.
   * @param editable Should the result be editable.
   * @return A suitable {@code OptionUI}, or null if none found.
   */
  static getOptionUI(gui: GUI, option: Option, editable: boolean): OptionUI {
    if (option instanceof BooleanOption) {
      return new BooleanOptionUI()._BooleanOptionUI(option, editable);
    } else if (option instanceof FileOption) {
      return new FileOptionUI()._FileOptionUI(gui, option, editable);
    } else if (option instanceof PercentageOption) {
      return new PercentageOptionUI()._PercentageOptionUI(option, editable);
    } else if (option instanceof RangeOption) {
      return new RangeOptionUI()._RangeOptionUI(option, editable);
    } else if (option instanceof SelectOption) {
      return new SelectOptionUI()._SelectOptionUI(option, editable);
    } else if (option instanceof IntegerOption) {
      return new IntegerOptionUI()._IntegerOptionUI(option, editable);
    } else if (option instanceof StringOption) {
      return new StringOptionUI()._StringOptionUI(option, editable);
    } else if (option instanceof LanguageOption) {
      return new LanguageOptionUI()._LanguageOptionUI(option, editable);
    } else if (option instanceof AudioMixerOption) {
      return new AudioMixerOptionUI()._AudioMixerOptionUI(gui, option, editable);
    } else if (option instanceof FreeColAction) {
      return new FreeColActionUI()._FreeColActionUI(option, editable);
    } else if (option instanceof AbstractUnitOption) {
      return new AbstractUnitOptionUI()._AbstractUnitOptionUI(option, editable);
    } else if (option instanceof ModOption) {
      return new ModOptionUI()._ModOptionUI(gui, option, editable);
    } else if (option instanceof UnitListOption) {
      return new ListOptionUI()._ListOptionUI(gui, option, editable, (choice) => true);
    } else if (option instanceof ModListOption) {
      return new ListOptionUI()._ListOptionUI(gui, option, editable, (choice) => {
        if (gui.canGameChangingModsBeAdded()) {
          return true;
        }
        let modFile = (choice).getValue$();
        return !modFile.hasSpecification();
      });
    } else if (option instanceof TextOption) {
      return new TextOptionUI()._TextOptionUI(option, editable);
    } else {
      return null;
    }
  }
}

$J.define(OptionUI, 'net.sf.freecol.client.gui.option.OptionUI', { kind: 'class', ifaces: ['net.sf.freecol.client.gui.option.OptionUpdater'], sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.option.Option,boolean': '_OptionUI' }, returns: { 'getComponent': 'javax.swing.JComponent', 'getListCellRenderer': 'javax.swing.ListCellRenderer', 'getJLabel': 'javax.swing.JLabel', 'isEnabled': 'boolean', 'isEditable': 'boolean', 'getOption': 'net.sf.freecol.common.option.Option' } });
$J.module(() => {
  JLabel = $J.load('javax.swing.JLabel');
  FreeColAction = $J.load('net.sf.freecol.client.gui.action.FreeColAction');
  AbstractUnitOptionUI = $J.load('net.sf.freecol.client.gui.option.AbstractUnitOptionUI');
  AudioMixerOptionUI = $J.load('net.sf.freecol.client.gui.option.AudioMixerOptionUI');
  BooleanOptionUI = $J.load('net.sf.freecol.client.gui.option.BooleanOptionUI');
  FileOptionUI = $J.load('net.sf.freecol.client.gui.option.FileOptionUI');
  FreeColActionUI = $J.load('net.sf.freecol.client.gui.option.FreeColActionUI');
  IntegerOptionUI = $J.load('net.sf.freecol.client.gui.option.IntegerOptionUI');
  LanguageOptionUI = $J.load('net.sf.freecol.client.gui.option.LanguageOptionUI');
  ListOptionUI = $J.load('net.sf.freecol.client.gui.option.ListOptionUI');
  ModOptionUI = $J.load('net.sf.freecol.client.gui.option.ModOptionUI');
  PercentageOptionUI = $J.load('net.sf.freecol.client.gui.option.PercentageOptionUI');
  RangeOptionUI = $J.load('net.sf.freecol.client.gui.option.RangeOptionUI');
  SelectOptionUI = $J.load('net.sf.freecol.client.gui.option.SelectOptionUI');
  StringOptionUI = $J.load('net.sf.freecol.client.gui.option.StringOptionUI');
  TextOptionUI = $J.load('net.sf.freecol.client.gui.option.TextOptionUI');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  AbstractUnitOption = $J.load('net.sf.freecol.common.option.AbstractUnitOption');
  AudioMixerOption = $J.load('net.sf.freecol.common.option.AudioMixerOption');
  BooleanOption = $J.load('net.sf.freecol.common.option.BooleanOption');
  FileOption = $J.load('net.sf.freecol.common.option.FileOption');
  IntegerOption = $J.load('net.sf.freecol.common.option.IntegerOption');
  LanguageOption = $J.load('net.sf.freecol.common.option.LanguageOption');
  ModListOption = $J.load('net.sf.freecol.common.option.ModListOption');
  ModOption = $J.load('net.sf.freecol.common.option.ModOption');
  PercentageOption = $J.load('net.sf.freecol.common.option.PercentageOption');
  RangeOption = $J.load('net.sf.freecol.common.option.RangeOption');
  SelectOption = $J.load('net.sf.freecol.common.option.SelectOption');
  StringOption = $J.load('net.sf.freecol.common.option.StringOption');
  TextOption = $J.load('net.sf.freecol.common.option.TextOption');
  UnitListOption = $J.load('net.sf.freecol.common.option.UnitListOption');
});
