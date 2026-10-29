// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/FreeColAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, CloneNotSupportedException, JObject, JString, Logger } from '../../../../../../../jre/index.ts';
import { AbstractAction } from '../../../../../../javax/swing/AbstractAction.ts';

let ActionEvent, Action, ImageIcon, KeyStroke, SwingUtilities, Messages, FreeColObject;

/**
 * The super class of all actions in FreeCol.  Subclasses of this
 * object is stored in an {@link ActionManager}.
 */
export class FreeColAction extends AbstractAction {
  /**
   * Protected to congregate the subclasses here.
   */
  static logger: Logger = null;
  static readonly TAG: string = 'action';
  /**
   * There are four versions of the order buttons: normal, rollover,
   * pressed, disabled.
   */
  static readonly ORDER_BUTTON_COUNT: number = 4;
  static readonly ACTION_ID: string = 'ACTION_ID';
  static readonly BUTTON_IMAGE: string = 'BUTTON_IMAGE';
  static readonly BUTTON_ROLLOVER_IMAGE: string = 'BUTTON_ROLLOVER_IMAGE';
  static readonly BUTTON_PRESSED_IMAGE: string = 'BUTTON_PRESSED_IMAGE';
  static readonly BUTTON_DISABLED_IMAGE: string = 'BUTTON_DISABLED_IMAGE';
  freeColClient: FreeColClient = null;
  orderButtonImageCount: number = 0;
  imageIconKeys: List<string> = null;
  static readonly ACCELERATOR_TAG: string = 'accelerator';
  /**
   * Creates a new {@code FreeColAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param id The object identifier for this action.
   */
  _FreeColAction(freeColClient: FreeColClient, id: string): this {
    this._AbstractAction$String(Messages.getName$String(id));
    this.orderButtonImageCount = 0;
    this.imageIconKeys = new ArrayList();
    this.freeColClient = freeColClient;
    this.putValue(FreeColAction.ACTION_ID, id);
    let shortDescription = Messages.getDescription$String(id);
    if (!$J.equals(shortDescription, Messages.descriptionKey$String(id))) {
      this.putValue(Action.SHORT_DESCRIPTION, shortDescription);
    }
    let acceleratorKey = id + '.accelerator';
    let accelerator = Messages.message$String(acceleratorKey);
    if (!$J.equals(accelerator, acceleratorKey)) {
      this.setAccelerator(KeyStroke.getKeyStroke$String(accelerator));
    }
    return this;
  }
  /**
   * Gets the main controller object for the client.
   *
   * @return The main controller object for the client.
   */
  getFreeColClient(): FreeColClient {
    return this.freeColClient;
  }
  /**
   * Gets the game.
   *
   * @return The {@code Game}.
   */
  getGame(): Game {
    return this.freeColClient.getGame();
  }
  /**
   * Gets the map.
   *
   * @return The {@code Map}.
   */
  getMap(): Map_ {
    let game = this.getGame();
    return (game == null) ? null : game.getMap();
  }
  /**
   * Get the GUI.
   *
   * @return The GUI.
   */
  getGUI(): GUI {
    return this.freeColClient.getGUI();
  }
  /**
   * Get the controller.
   *
   * @return The {@code InGameController}.
   */
  igc(): InGameController {
    return this.freeColClient.getInGameController();
  }
  /**
   * Get the connect controller.
   *
   * @return The {@code ConnectController}.
   */
  getConnectController(): ConnectController {
    return this.freeColClient.getConnectController();
  }
  /**
   * Get the action manager.
   *
   * @return The {@code ActionManager}.
   */
  getActionManager(): ActionManager {
    return this.freeColClient.getActionManager();
  }
  /**
   * Get the client options
   *
   * @return The {@code ClientOptions}.
   */
  getClientOptions(): ClientOptions {
    return this.freeColClient.getClientOptions();
  }
  /**
   * Don't use this method.
   */
  cloneOption(): FreeColAction {
    throw new CloneNotSupportedException('FreeColAction can not be cloned:' + $J.str(this));
  }
  /**
   * Gets the mnemonic to be used for selecting this action
   *
   * @return The mnemonic of the action
   */
  getMnemonic(): number {
    return this.getValue$String(Action.MNEMONIC_KEY);
  }
  setMnemonic(mnemonic: number): void {
    this.putValue(Action.MNEMONIC_KEY, mnemonic);
  }
  /**
   * Are all the order button images present?
   *
   * @return True if all the order button images are present.
   */
  hasOrderButtons(): boolean {
    return this.orderButtonImageCount === FreeColAction.ORDER_BUTTON_COUNT;
  }
  /**
   * Adds icons for the order buttons.
   *
   * @param key The identifier of the action.
   */
  addImageIcons(key: string): void {
    this.imageIconKeys.add(key);
    SwingUtilities.invokeLater(() => {
      this.updateImageIcon(key);
    });
  }
  updateRegisteredImageIcons(): void {
    for (const $it0 = this.imageIconKeys.iterator(); $it0.hasNext(); ) {
      let key = $it0.next();
      this.updateImageIcon(key);
    }
  }
  updateImageIcon(key: string): void {
    let lib = this.getGUI().getFixedImageLibrary();
    let images = lib.getButtonImages(key);
    this.orderButtonImageCount = images.size();
    if (this.hasOrderButtons()) {
      this.putValue(FreeColAction.BUTTON_IMAGE, new ImageIcon()._ImageIcon$Image(images.removeAt(0)));
      this.putValue(FreeColAction.BUTTON_ROLLOVER_IMAGE, new ImageIcon()._ImageIcon$Image(images.removeAt(0)));
      this.putValue(FreeColAction.BUTTON_PRESSED_IMAGE, new ImageIcon()._ImageIcon$Image(images.removeAt(0)));
      this.putValue(FreeColAction.BUTTON_DISABLED_IMAGE, new ImageIcon()._ImageIcon$Image(images.removeAt(0)));
    } else {
      FreeColAction.logger.warning('Found only ' + this.orderButtonImageCount + ' order button images for ' + this.getId() + '/' + key);
    }
  }
  /**
   * Sets a keyboard accelerator.
   *
   * @param accelerator The {@code KeyStroke}. Using {@code null}
   *            is the same as disabling the keyboard accelerator.
   */
  setAccelerator(accelerator: KeyStroke): void {
    this.putValue(Action.ACCELERATOR_KEY, accelerator);
  }
  /**
   * Gets the keyboard accelerator for this option.
   *
   * @return The {@code KeyStroke} or {@code null} if the
   *         keyboard accelerator is disabled.
   */
  getAccelerator(): KeyStroke {
    return this.getValue$String(Action.ACCELERATOR_KEY);
  }
  /**
   * Gives a short description of this {@code Option}. Can for
   * instance be used as a tooltip text.
   *
   * @return A short description of this action.
   */
  getShortDescription(): string {
    return this.getValue$String(Action.SHORT_DESCRIPTION);
  }
  /**
   * Get the identifier of this {@code Option}.
   *
   * @return An unique identifier for this action.
   */
  getId(): string {
    return this.getValue$String(FreeColAction.ACTION_ID);
  }
  /**
   * Returns the name of this {@code Option}.
   *
   * @return The name as provided in the constructor.
   */
  getName(): string {
    return this.getValue$String(Action.NAME);
  }
  /**
   * Creates a {@code String} that keeps the attributes given
   * {@code KeyStroke}. This {@code String} can be used to
   * store the key stroke in an XML-file.
   *
   * @param keyStroke The {@code KeyStroke}.
   * @return A {@code String} that produces a key stroke equal to the
   *         given {@code KeyStroke} if passed as a parameter to
   *         {@code getAWTKeyStroke(String)}.
   */
  static getKeyStrokeText(keyStroke: KeyStroke): string {
    return (keyStroke == null) ? '' : keyStroke.toString();
  }
  getMenuKeyListener(): MenuKeyListener {
    return new FreeColAction$InnerMenuKeyListener().$o(this)._FreeColAction$InnerMenuKeyListener();
  }
  /**
   * Checks if this action should be enabled.
   *
   * @return True if the {@link ClientOptionsDialog}
   *     is not visible.
   */
  shouldBeEnabled(): boolean {
    return !this.getGUI().isClientOptionsDialogShowing();
  }
  /**
   * Updates the "enabled"-status with the value returned by
   * {@link #shouldBeEnabled}.
   */
  update(): void {
    this.setEnabled(this.shouldBeEnabled());
  }
  /**
   * {@inheritDoc}
   */
  getGroup(): string {
    return this.getActionManager().getId();
  }
  /**
   * {@inheritDoc}
   */
  setGroup(group: string): void {
    FreeColAction.logger.warning('Unsupported method FreeColAction.setGroup.');
  }
  /**
   * {@inheritDoc}
   */
  getValue$(): FreeColAction {
    return this;
  }
  /**
   * {@inheritDoc}
   */
  setValue$Object(value: FreeColAction): void {
    FreeColAction.logger.warning('Unsupported method FreeColAction.setValue.');
  }
  /**
   * {@inheritDoc}
   */
  getEnabledBy(): string {
    return null;
  }
  /**
   * This method writes an XML-representation of this object to the given
   * stream.
   *
   * @param xw The {@code FreeColXMLWriter} to write to.
   * @throws XMLStreamException if there is a problem writing to the stream.
   */
  toXML$FreeColXMLWriter(xw: FreeColXMLWriter): void {
    xw.writeStartElement(FreeColAction.TAG);
    xw.writeAttribute(FreeColObject.ID_ATTRIBUTE_TAG, this.getId());
    xw.writeAttribute(FreeColAction.ACCELERATOR_TAG, FreeColAction.getKeyStrokeText(this.getAccelerator()));
    xw.writeEndElement();
  }
  /**
   * Initialize this object from an XML-representation of this object.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @throws XMLStreamException if a problem was encountered during parsing.
   */
  readFromXML(xr: FreeColXMLReader): void {
    let acc = xr.getAttribute$String$String(FreeColAction.ACCELERATOR_TAG, '');
    this.putValue(Action.ACCELERATOR_KEY, (acc == null || (acc.length === 0)) ? null : KeyStroke.getKeyStroke$String(acc));
    xr.closeTag$String(FreeColAction.TAG);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return FreeColAction.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return this.getName();
  }
  static $clinit() {
    FreeColAction.logger = Logger.getLogger($J.cls(FreeColAction).getName());
  }
}

/**
 * A class used by Actions which have a mnemonic. Those Actions should
 * assign this listener to the JMenuItem they are a part of. This captures
 * the mnemonic key press and keeps other menus from processing keys meant
 * for other actions.
 *
 * @author johnathanj
 */
export class FreeColAction$InnerMenuKeyListener extends JObject {
  mnemonic: number = 0;
  _FreeColAction$InnerMenuKeyListener(): this {
    this.mnemonic = (this.$outer.getValue$String(Action.MNEMONIC_KEY));
    return this;
  }
  menuKeyPressed(e: MenuKeyEvent): void {
    if (e.getKeyCode() === this.mnemonic) {
      let ae = new ActionEvent()._ActionEvent$Object$int$String$int(e.getSource(), e.getID(), this.$outer.getValue$String(Action.NAME), e.getModifiersEx());
      this.$outer.actionPerformed(ae);
      e.consume();
    }
  }
  menuKeyReleased(e: MenuKeyEvent): void {
  }
  menuKeyTyped(e: MenuKeyEvent): void {
  }
}

$J.define(FreeColAction, 'net.sf.freecol.client.gui.action.FreeColAction', { kind: 'class', ifaces: ['net.sf.freecol.common.option.Option'], sup: 'javax.swing.AbstractAction', ctors: { 'net.sf.freecol.client.FreeColClient,java.lang.String': '_FreeColAction' }, returns: { 'getXMLTagName': 'java.lang.String', 'getEnabledBy': 'java.lang.String', 'getValue$': 'net.sf.freecol.client.gui.action.FreeColAction', 'getGroup': 'java.lang.String', 'getMenuKeyListener': 'javax.swing.event.MenuKeyListener', 'getName': 'java.lang.String', 'getId': 'java.lang.String', 'getShortDescription': 'java.lang.String', 'getAccelerator': 'javax.swing.KeyStroke', 'hasOrderButtons': 'boolean', 'getMnemonic': 'java.lang.Integer', 'getClientOptions': 'net.sf.freecol.client.ClientOptions', 'getActionManager': 'net.sf.freecol.client.gui.action.ActionManager', 'getConnectController': 'net.sf.freecol.client.control.ConnectController', 'getGUI': 'net.sf.freecol.client.gui.GUI', 'getMap': 'net.sf.freecol.common.model.Map', 'getGame': 'net.sf.freecol.common.model.Game', 'getFreeColClient': 'net.sf.freecol.client.FreeColClient' }, meths: { 'toXML(net.sf.freecol.common.io.FreeColXMLWriter)': 'toXML$FreeColXMLWriter', 'setValue(net.sf.freecol.client.gui.action.FreeColAction)': 'setValue$Object', 'getValue()': 'getValue$' }, clinit: true, lazy: ['logger'] });
$J.define(FreeColAction$InnerMenuKeyListener, 'net.sf.freecol.client.gui.action.FreeColAction$InnerMenuKeyListener', { kind: 'class', ifaces: ['javax.swing.event.MenuKeyListener'], sup: 'java.lang.Object', ctors: { '': '_FreeColAction$InnerMenuKeyListener' }, inner: true });
$J.module(() => {
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  Action = $J.load('javax.swing.Action');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
});
