// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/FreeColPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, Logger } from '../../../../../../../jre/index.ts';
import { MigPanel } from './MigPanel.ts';

let FlowLayout, KeyEvent, JComponent, KeyStroke, FreeColButton$ButtonStyle, FreeColImageBorder, Utility;

/**
 * Superclass for all panels in FreeCol.
 */
export class FreeColPanel extends MigPanel {
  static logger: Logger = null;
  static readonly CANCEL: string = 'CANCEL';
  static readonly OK: string = 'OK';
  static readonly HELP: string = 'HELP';
  static readonly ESCAPE: string = 'ESCAPE';
  static readonly SPAN_SPLIT_2: string = 'span, split 2';
  static readonly NL_SPAN_SPLIT_2: string = 'newline, span, split 2';
  static readonly MARGIN: number = 3;
  freeColClient: FreeColClient = null;
  editable: boolean = false;
  okButton: JButton = null;
  $init_FreeColPanel() {
    this.editable = true;
    this.okButton = Utility.localizedButton$String('ok').withButtonStyle(FreeColButton$ButtonStyle.IMPORTANT);
  }
  /**
   * Constructor.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _FreeColPanel$FreeColClient(freeColClient: FreeColClient): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new FlowLayout()._FlowLayout$());
    return this;
  }
  /**
   * Default constructor.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param uiClassId An optional L+F class to render this component.
   * @param layout The {@code LayoutManager} to be used.
   */
  _FreeColPanel$FreeColClient$String$LayoutManager(freeColClient: FreeColClient, uiClassId: string, layout: LayoutManager): this {
    this._MigPanel$String$LayoutManager(uiClassId, layout);
    this.$init_FreeColPanel();
    this.freeColClient = freeColClient;
    this.setBorder(FreeColImageBorder.panelBorder);
    this.okButton.setActionCommand(FreeColPanel.OK);
    this.okButton.addActionListener($J.fn(this, 'actionPerformed'));
    let inputMap = this.getInputMap$int(JComponent.WHEN_IN_FOCUSED_WINDOW);
    inputMap.put(KeyStroke.getKeyStroke$int$int$boolean(KeyEvent.VK_ESCAPE, 0, true), FreeColPanel.ESCAPE);
    return this;
  }
  /**
   * Get the FreeColClient.
   *
   * @return The current {@code FreeColClient}.
   */
  getFreeColClient(): FreeColClient {
    return this.freeColClient;
  }
  /**
   * Is this panel editable?
   *
   * @return True if the panel is editable.
   */
  isEditable(): boolean {
    return this.editable;
  }
  /**
   * Get the game.
   *
   * @return The current {@code Game}.
   */
  getGame(): Game {
    return this.freeColClient.getGame();
  }
  /**
   * Get the map.
   *
   * @return The current {@code Map}.
   */
  getMap(): Map_ {
    let game = this.getGame();
    return (game == null) ? null : game.getMap();
  }
  /**
   * Get the GUI.
   *
   * @return The current {@code GUI}.
   */
  getGUI(): GUI {
    return this.freeColClient.getGUI();
  }
  /**
   * Get the image library.
   *
   * @return The {@code ImageLibrary}.
   */
  getImageLibrary(): ImageLibrary {
    return this.getGUI().getFixedImageLibrary();
  }
  /**
   * Get the game specification.
   *
   * @return The {@code Specification}.
   */
  getSpecification(): Specification {
    if (this.freeColClient.getGame() == null) {
      return null;
    }
    return this.freeColClient.getGame().getSpecification();
  }
  /**
   * Get the player.
   *
   * @return The client {@code Player}.
   */
  getMyPlayer(): Player {
    return this.freeColClient.getMyPlayer();
  }
  /**
   * Get the client options.
   *
   * @return The {@code ClientOptions}.
   */
  getClientOptions(): ClientOptions {
    return (this.freeColClient == null) ? null : this.freeColClient.getClientOptions();
  }
  /**
   * Get the client controller.
   *
   * @return The client {@code InGameController}.
   */
  igc(): InGameController {
    return this.freeColClient.getInGameController();
  }
  /**
   * Create a button for a colony.
   *
   * @param colony The {@code Colony} to create a button for.
   * @return The new button.
   */
  createColonyButton$Colony(colony: Colony): JButton {
    let button = Utility.getLinkButton(colony.getName(), null, colony.getId());
    button.addActionListener($J.fn(this, 'actionPerformed'));
    return button;
  }
  /**
   * Add a routine to be called when this panel closes.
   * Triggered by Canvas.notifyClose.
   *
   * @param runnable Some code to run on close.
   * @return This panel.
   */
  addClosingCallback(runnable: Runnable): FreeColPanel {
    if (runnable != null) {
      this.addPropertyChangeListener$PropertyChangeListener($J.fn(new (FreeColPanel$1())().$o(this).$c(runnable), 'propertyChange'));
    }
    return this;
  }
  /**
   * Set the action in response to the escape key.
   *
   * @param aa The {@code AbstractAction} to take.
   */
  setEscapeAction(aa: AbstractAction): void {
    this.getActionMap$().put$Object$Action(FreeColPanel.ESCAPE, aa);
  }
  /**
   * Helper to get a small single abstract unit image.
   *
   * @param au The {@code AbstractUnit} to examine.
   * @return A suitable {@code BufferedImage}.
   */
  getSmallAbstractUnitImage(au: AbstractUnit): BufferedImage {
    let spec = this.getSpecification();
    return this.getImageLibrary().getSmallUnitTypeImage$UnitType$String$boolean(au.getType(spec), au.getRoleId(), false);
  }
  /**
   * A border to be used around the frame containing this panel.
   * @return The border, if any, or {@code null}.
   */
  getFrameBorder(): Border {
    return null;
  }
  /**
   * Refreshes the layout after scaling and/or font changes.
   *
   * Subclasses can extend this method to handle the change.
   */
  refreshLayout(): void {
  }
  /**
   * Checks if this panel should be displayed in fullscreen mode.
   * @return {@code false} unless overriden by a subclass.
   */
  isFullscreen(): boolean {
    return false;
  }
  /**
   * Allows subclasses to define a frame title.
   * @return The title, if defined by a subclass.
   */
  getFrameTitle(): string {
    return null;
  }
  /**
   * Allows subclasses to define a default frame popup position.
   * @return The title, if defined by a subclass.
   */
  getFramePopupPosition(): SwingGUI$PopupPosition {
    return null;
  }
  /**
   * Allows subclasses to execute code when the frame is closed
   * using the "X" button (in the map editor).
   */
  onFrameClosing(): void {
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let command = ae.getActionCommand();
    if ($J.equals(FreeColPanel.OK, command)) {
      this.getGUI().removeComponent(this);
    } else {
      FreeColPanel.logger.warning('Bad event: ' + command);
    }
  }
  /**
   * {@inheritDoc}
   */
  requestFocus$(): void {
    if (this.okButton != null) {
      this.okButton.requestFocus$();
    }
  }
  static $clinit() {
    FreeColPanel.logger = Logger.getLogger($J.cls(FreeColPanel).getName());
  }
}

let $FreeColPanel$1: any = null;
/** An anonymous class (FreeColPanel.java:234). */
function FreeColPanel$1(): any {
  return $FreeColPanel$1 ??= $J.local(class extends JObject {
    /**
     * {@inheritDoc}
     */
    propertyChange(e: PropertyChangeEvent): void {
      if ($J.equals('closing', e.getPropertyName())) {
        this.$cv_runnable();
        this.$outer.removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
      }
    }
    $c($runnable): this {
      this.$cv_runnable = $runnable;
      return this;
    }
  }, 'net.sf.freecol.client.gui.panel.FreeColPanel$1', ['java.beans.PropertyChangeListener']);
}

$J.define(FreeColPanel, 'net.sf.freecol.client.gui.panel.FreeColPanel', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'net.sf.freecol.client.gui.panel.MigPanel', ctors: { 'net.sf.freecol.client.FreeColClient,java.lang.String,java.awt.LayoutManager': '_FreeColPanel$FreeColClient$String$LayoutManager', 'net.sf.freecol.client.FreeColClient': '_FreeColPanel$FreeColClient' }, returns: { 'getFramePopupPosition': 'net.sf.freecol.client.gui.SwingGUI$PopupPosition', 'getFrameTitle': 'java.lang.String', 'isFullscreen': 'boolean', 'getFrameBorder': 'javax.swing.border.Border', 'getClientOptions': 'net.sf.freecol.client.ClientOptions', 'getMyPlayer': 'net.sf.freecol.common.model.Player', 'getSpecification': 'net.sf.freecol.common.model.Specification', 'getImageLibrary': 'net.sf.freecol.client.gui.ImageLibrary', 'getGUI': 'net.sf.freecol.client.gui.GUI', 'getMap': 'net.sf.freecol.common.model.Map', 'getGame': 'net.sf.freecol.common.model.Game', 'isEditable': 'boolean', 'getFreeColClient': 'net.sf.freecol.client.FreeColClient' }, meths: { 'requestFocus()': 'requestFocus$', 'createColonyButton(net.sf.freecol.common.model.Colony)': 'createColonyButton$Colony' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  FlowLayout = $J.load('java.awt.FlowLayout');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  JComponent = $J.load('javax.swing.JComponent');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  FreeColButton$ButtonStyle = $J.load('net.sf.freecol.client.gui.panel.FreeColButton$ButtonStyle');
  FreeColImageBorder = $J.load('net.sf.freecol.client.gui.panel.FreeColImageBorder');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
});
