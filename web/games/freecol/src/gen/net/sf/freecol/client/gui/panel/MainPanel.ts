// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/MainPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColPanel } from './FreeColPanel.ts';

let Color, ImageIcon, JLabel, MigLayout, FreeCol, ImageLibrary, AboutAction, ContinueAction, MapEditorAction, NewAction, OpenAction, PreferencesAction, QuitAction, FreeColButton, FreeColButton$ButtonStyle, MigPanel, FreeColDirectories;

/**
 * The initial panel where the user chooses from the main modes of operation.
 */
export class MainPanel extends FreeColPanel {
  static logger: Logger = null;
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _MainPanel(freeColClient: FreeColClient): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new MigLayout()._MigLayout$String$String('wrap 1, insets 32px 32px 32px 32px, gap 0', '[center]'));
    let canContinue = FreeColDirectories.getLastSaveGameFile() != null;
    let am = this.getFreeColClient().getActionManager();
    let newButton = this.createImportantButton(am.getFreeColAction(NewAction.id));
    let openButton = this.createImportantButton(am.getFreeColAction(OpenAction.id));
    let mapEditorButton = this.createImportantButton(am.getFreeColAction(MapEditorAction.id));
    let optionsButton = this.createImportantButton(am.getFreeColAction(PreferencesAction.id));
    let aboutButton = this.createImportantButton(am.getFreeColAction(AboutAction.id));
    let quitButton = this.createImportantButton(am.getFreeColAction(QuitAction.id));
    this.okButton.setAction(am.getFreeColAction((canContinue) ? ContinueAction.id : NewAction.id));
    let logoLabel = new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(ImageLibrary.getUnscaledImage('image.flavor.Title')));
    this.add$Component(logoLabel);
    let versionLabel = new JLabel()._JLabel$String(FreeCol.getVersion());
    versionLabel.setForeground(new Color()._Color$int$int$int(180, 162, 66));
    this.add$Component(versionLabel);
    let buttons = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String('wrap 2'));
    buttons.setOpaque(false);
    buttons.add$Component$Object(this.okButton, 'grow');
    if (canContinue) {
      buttons.add$Component$Object(newButton, 'grow');
    }
    buttons.add$Component$Object(openButton, 'grow');
    buttons.add$Component$Object(mapEditorButton, 'grow');
    buttons.add$Component$Object(optionsButton, 'grow');
    buttons.add$Component$Object(aboutButton, 'grow');
    buttons.add$Component$Object(quitButton, 'grow, span');
    this.add$Component$Object(buttons, 'gapy 16px');
    this.setSize$Dimension(this.getPreferredSize$());
    return this;
  }
  createImportantButton(action: Action): JButton {
    let button = new FreeColButton()._FreeColButton$ButtonStyle$Action(FreeColButton$ButtonStyle.IMPORTANT, action);
    return button;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    this.getGUI().removeComponent(this);
  }
  static $clinit() {
    MainPanel.logger = Logger.getLogger($J.cls(MainPanel).getName());
  }
}

$J.define(MainPanel, 'net.sf.freecol.client.gui.panel.MainPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_MainPanel' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  AboutAction = $J.load('net.sf.freecol.client.gui.action.AboutAction');
  ContinueAction = $J.load('net.sf.freecol.client.gui.action.ContinueAction');
  MapEditorAction = $J.load('net.sf.freecol.client.gui.action.MapEditorAction');
  NewAction = $J.load('net.sf.freecol.client.gui.action.NewAction');
  OpenAction = $J.load('net.sf.freecol.client.gui.action.OpenAction');
  PreferencesAction = $J.load('net.sf.freecol.client.gui.action.PreferencesAction');
  QuitAction = $J.load('net.sf.freecol.client.gui.action.QuitAction');
  FreeColButton = $J.load('net.sf.freecol.client.gui.panel.FreeColButton');
  FreeColButton$ButtonStyle = $J.load('net.sf.freecol.client.gui.panel.FreeColButton$ButtonStyle');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
});
