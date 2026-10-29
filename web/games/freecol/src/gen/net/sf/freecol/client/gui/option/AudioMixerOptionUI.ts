// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/option/AudioMixerOptionUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let BorderLayout, DefaultComboBoxModel, JComboBox, JLabel, JPanel, Utility, FreeColComboBoxRenderer;

/**
 * This class provides visualization for an
 * {@link net.sf.freecol.common.option.AudioMixerOption}
 * in order to enable values to be both seen and changed.
 */
export class AudioMixerOptionUI extends OptionUI {
  gui: GUI = null;
  panel: JPanel = null;
  cbox: JComboBox<AudioMixerOption$MixerWrapper> = null;
  button1: JButton = null;
  button2: JButton = null;
  currentMixerLabel: JLabel = null;
  /**
   * Creates a new {@code AudioMixerOptionUI} for the given
   * {@code AudioMixerOption}.
   *
   * @param gui The GUI.
   * @param option The {@code AudioMixerOption} to make a user
   *      interface for.
   * @param editable boolean whether user can modify the setting
   */
  _AudioMixerOptionUI(gui: GUI, option: AudioMixerOption, editable: boolean): this {
    this._OptionUI(option, editable);
    this.panel = new JPanel()._JPanel$();
    this.gui = gui;
    let layout = new BorderLayout()._BorderLayout$();
    layout.setHgap(15);
    this.panel.setLayout(layout);
    this.cbox = new JComboBox()._JComboBox$();
    this.panel.add$Component$Object(this.cbox, BorderLayout.LINE_START);
    this.currentMixerLabel = new JLabel()._JLabel$();
    this.panel.add$Component$Object(this.currentMixerLabel, BorderLayout.LINE_END);
    this.updateMixerLabel();
    this.button1 = Utility.localizedButton$String('test');
    this.panel.add$Component(this.button1);
    this.button2 = Utility.localizedButton$String('music');
    this.panel.add$Component(this.button2);
    this.cbox.setModel(new DefaultComboBoxModel()._DefaultComboBoxModel$ObjectArr($J.toArrayInto(this.getOption().getChoices().toArray(), $J.newArray(0, null))));
    this.cbox.setRenderer(new FreeColComboBoxRenderer()._FreeColComboBoxRenderer$());
    this.reset();
    this.cbox.setEnabled(editable);
    let aHandler = (ae) => {
      if (ae.getSource() === this.button1) {
        gui.playSound('sound.event.buildingComplete');
      } else if (ae.getSource() === this.button2) {
        gui.playSound('sound.intro.general');
      } else if (ae.getSource() === this.cbox) {
        let value = this.cbox.getSelectedItem();
        if (this.getOption().getValue$() !== value) {
          this.getOption().setValue$Object(value);
          this.updateMixerLabel();
        }
      }
    };
    this.button1.addActionListener(aHandler);
    this.button2.addActionListener(aHandler);
    this.cbox.addActionListener(aHandler);
    this.initialize();
    return this;
  }
  updateMixerLabel(): void {
    this.currentMixerLabel.setText(this.gui.getSoundMixerLabelText());
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
  getComponent(): JPanel {
    return this.panel;
  }
  /**
   * Updates the value of the
   * {@link net.sf.freecol.common.option.Option} this object keeps.
   */
  updateOption(): void {
    this.getOption().setValue$Object(this.cbox.getSelectedItem());
  }
  /**
   * Reset with the value from the option.
   */
  reset(): void {
    this.cbox.setSelectedItem(this.getOption().getValue$());
  }
}

$J.define(AudioMixerOptionUI, 'net.sf.freecol.client.gui.option.AudioMixerOptionUI', { kind: 'class', sup: 'net.sf.freecol.client.gui.option.OptionUI', ctors: { 'net.sf.freecol.client.gui.GUI,net.sf.freecol.common.option.AudioMixerOption,boolean': '_AudioMixerOptionUI' }, returns: { 'getComponent': 'javax.swing.JPanel', 'getJLabel': 'javax.swing.JLabel' } });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  DefaultComboBoxModel = $J.load('javax.swing.DefaultComboBoxModel');
  JComboBox = $J.load('javax.swing.JComboBox');
  JLabel = $J.load('javax.swing.JLabel');
  JPanel = $J.load('javax.swing.JPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FreeColComboBoxRenderer = $J.load('net.sf.freecol.client.gui.plaf.FreeColComboBoxRenderer');
});
