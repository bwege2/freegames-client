// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/LoadingSavegameDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColConfirmDialog } from './FreeColConfirmDialog.ts';

let FlowLayout, BoxLayout, ButtonGroup, JPanel, JRadioButton, JSpinner, JSpinner$NumberEditor, JTextField, SpinnerNumberModel, SwingConstants, FreeCol, LoadingSavegameInfo, Utility, Messages;

/**
 * Dialog for setting some options when loading a game.
 */
export class LoadingSavegameDialog extends FreeColConfirmDialog {
  static logger: Logger = null;
  singlePlayer: JRadioButton = null;
  privateMultiplayer: JRadioButton = null;
  publicMultiplayer: JRadioButton = null;
  serverNameField: JTextField = null;
  serverAddressBox: JComboBox<InetAddress> = null;
  portField: JSpinner = null;
  /**
   * Creates a dialog to set the options for loading a saved game.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   */
  _LoadingSavegameDialog(freeColClient: FreeColClient, frame: JFrame): this {
    this._FreeColConfirmDialog$FreeColClient$JFrame(freeColClient, frame);
    let panel = new JPanel()._JPanel$();
    panel.setBorder(Utility.blankBorder(10, 10, 10, 10));
    panel.setLayout(new BoxLayout()._BoxLayout$Container$int(panel, BoxLayout.PAGE_AXIS));
    panel.setOpaque(false);
    let header = Utility.localizedHeaderLabel$String$int$String('loadingSavegameDialog.name', SwingConstants.CENTER, Utility.FONTSPEC_SUBTITLE);
    header.setBorder(Utility.blankBorder(20, 0, 0, 0));
    let p1 = new JPanel()._JPanel$LayoutManager(new FlowLayout()._FlowLayout$int(FlowLayout.LEADING));
    p1.add$Component(Utility.localizedLabel$String('loadingSavegameDialog.serverName'));
    this.serverNameField = new JTextField()._JTextField$();
    this.serverAddressBox = Utility.createServerInetAddressBox();
    let p2 = new JPanel()._JPanel$LayoutManager(new FlowLayout()._FlowLayout$int(FlowLayout.LEADING));
    p2.add$Component(Utility.localizedLabel$String('loadingSavegameDialog.port'));
    this.portField = new JSpinner()._JSpinner$SpinnerModel(new SpinnerNumberModel()._SpinnerNumberModel$int$int$int$int(FreeCol.getServerPort(), 1, 65536, 1));
    this.portField.setEditor(new JSpinner$NumberEditor()._JSpinner$NumberEditor$JSpinner$String(this.portField, '#'));
    let bg = new ButtonGroup()._ButtonGroup();
    let str = Messages.message$String('loadingSavegameDialog.singlePlayer');
    this.singlePlayer = new JRadioButton()._JRadioButton$String(str);
    this.singlePlayer.setSelected(true);
    bg.add(this.singlePlayer);
    str = Messages.message$String('loadingSavegameDialog.privateMultiplayer');
    this.privateMultiplayer = new JRadioButton()._JRadioButton$String(str);
    bg.add(this.privateMultiplayer);
    str = Messages.message$String('loadingSavegameDialog.publicMultiplayer');
    this.publicMultiplayer = new JRadioButton()._JRadioButton$String(str);
    bg.add(this.publicMultiplayer);
    this.serverAddressBox.addActionListener((event) => {
      let address = this.serverAddressBox.getSelectedItem();
      this.publicMultiplayer.setEnabled(!address.isLoopbackAddress());
    });
    let address = this.serverAddressBox.getSelectedItem();
    this.publicMultiplayer.setEnabled(!address.isLoopbackAddress());
    panel.add$Component(header);
    panel.add$Component(p1);
    panel.add$Component(this.serverNameField);
    panel.add$Component(this.serverAddressBox);
    panel.add$Component(p2);
    panel.add$Component(this.portField);
    panel.add$Component(this.singlePlayer);
    panel.add$Component(this.privateMultiplayer);
    panel.add$Component(this.publicMultiplayer);
    panel.setSize$Dimension(panel.getPreferredSize$());
    this.initializeConfirmDialog(frame, true, panel, null, 'ok', 'cancel');
    return this;
  }
  /**
   * Is a single player game selected?
   *
   * @return True if single player is selected.
   */
  isSinglePlayer(): boolean {
    return this.singlePlayer.isSelected();
  }
  /**
   * Is a public server game selected?
   *
   * @return True if public server is selected.
   */
  isPublic(): boolean {
    return this.publicMultiplayer.isSelected() && !this.getAddress().isLoopbackAddress();
  }
  getAddress(): InetAddress {
    return this.singlePlayer.isSelected() ? null : this.serverAddressBox.getSelectedItem();
  }
  /**
   * Get the selected port number.
   *
   * @return The port number.
   */
  getPort(): number {
    return this.singlePlayer.isSelected() ? -1 : (this.portField.getValue());
  }
  /**
   * Get the specified server name.
   *
   * @return The server name.
   */
  getServerName(): string {
    return this.serverNameField.getName$();
  }
  /**
   * Get all important information at once.
   *
   * @return A LoadingSavegameInfo.
   */
  getInfo(): LoadingSavegameInfo {
    return new LoadingSavegameInfo()._LoadingSavegameInfo(this.isSinglePlayer(), this.getAddress(), this.getPort(), this.getServerName(), this.isPublic());
  }
  /**
   * Reset the dialog to a given state.
   *
   * @param publicServer The public server state.
   * @param singlePlayer The single player state.
   */
  reset(publicServer: boolean, singlePlayer: boolean): void {
    this.singlePlayer.setSelected(false);
    this.privateMultiplayer.setSelected(false);
    this.publicMultiplayer.setSelected(false);
    if (singlePlayer) {
      this.singlePlayer.setSelected(true);
    } else if (publicServer) {
      this.publicMultiplayer.setSelected(true);
    } else {
      this.privateMultiplayer.setSelected(true);
    }
    this.serverNameField.setText('');
  }
  static $clinit() {
    LoadingSavegameDialog.logger = Logger.getLogger($J.cls(LoadingSavegameDialog).getName());
  }
}

$J.define(LoadingSavegameDialog, 'net.sf.freecol.client.gui.dialog.LoadingSavegameDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColConfirmDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame': '_LoadingSavegameDialog' }, returns: { 'getInfo': 'net.sf.freecol.client.gui.LoadingSavegameInfo', 'getServerName': 'java.lang.String', 'getPort': 'int', 'getAddress': 'java.net.InetAddress', 'isPublic': 'boolean', 'isSinglePlayer': 'boolean' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  FlowLayout = $J.load('java.awt.FlowLayout');
  BoxLayout = $J.load('javax.swing.BoxLayout');
  ButtonGroup = $J.load('javax.swing.ButtonGroup');
  JPanel = $J.load('javax.swing.JPanel');
  JRadioButton = $J.load('javax.swing.JRadioButton');
  JSpinner = $J.load('javax.swing.JSpinner');
  JSpinner$NumberEditor = $J.load('javax.swing.JSpinner$NumberEditor');
  JTextField = $J.load('javax.swing.JTextField');
  SpinnerNumberModel = $J.load('javax.swing.SpinnerNumberModel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  LoadingSavegameInfo = $J.load('net.sf.freecol.client.gui.LoadingSavegameInfo');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
});
