// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/DisplayTileTextAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JEnum } from '../../../../../../../jre/index.ts';
import { SelectableOptionAction } from './SelectableOptionAction.ts';

let InputEvent, KeyEvent, KeyStroke, ClientOptions, StringUtils;

/**
 * Display text over tiles.
 */
export class DisplayTileTextAction extends SelectableOptionAction {
  static readonly id: string = 'displayTileTextAction.';
  static accelerators: number[] = null;
  display_: DisplayTileTextAction$DisplayText = null;
  /**
   * Creates this action
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param type a {@code DisplayText} value
   */
  _DisplayTileTextAction(freeColClient: FreeColClient, type$: DisplayTileTextAction$DisplayText): this {
    this._SelectableOptionAction(freeColClient, DisplayTileTextAction.id + type$.getKey(), ClientOptions.DISPLAY_TILE_TEXT);
    this.display_ = null;
    this.display_ = type$;
    this.setAccelerator(KeyStroke.getKeyStroke$int$int(DisplayTileTextAction.accelerators[type$.ordinal()], InputEvent.CTRL_DOWN_MASK | InputEvent.SHIFT_DOWN_MASK));
    this.setSelected(this.shouldBeSelected());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  shouldBeSelected(): boolean {
    return this.display_ != null && this.freeColClient.getClientOptions() != null && this.freeColClient.getClientOptions().getDisplayTileText() === this.display_.ordinal() && super.shouldBeEnabled();
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    if ((ae.getSource()).isSelected()) {
      this.freeColClient.getClientOptions().setInteger(ClientOptions.DISPLAY_TILE_TEXT, this.display_.ordinal());
      this.getGUI().refresh();
    }
  }
  static $clinit() {
    DisplayTileTextAction.accelerators = [KeyEvent.VK_E, KeyEvent.VK_N, KeyEvent.VK_O, KeyEvent.VK_R];
  }
}

export class DisplayTileTextAction$DisplayText extends JEnum {
  static EMPTY: DisplayTileTextAction$DisplayText = null;
  static NAMES: DisplayTileTextAction$DisplayText = null;
  static OWNERS: DisplayTileTextAction$DisplayText = null;
  static REGIONS: DisplayTileTextAction$DisplayText = null;
  static $VALUES: DisplayTileTextAction$DisplayText[] = null;
  _DisplayTileTextAction$DisplayText($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  getKey(): string {
    return StringUtils.getEnumKey(this);
  }
  static values(): DisplayTileTextAction$DisplayText[] { return DisplayTileTextAction$DisplayText.$VALUES.slice(); }
  static valueOf(name: string): DisplayTileTextAction$DisplayText { return $J.enumValueOf(DisplayTileTextAction$DisplayText, name); }
  static $clinit() {
    DisplayTileTextAction$DisplayText.EMPTY = new DisplayTileTextAction$DisplayText()._DisplayTileTextAction$DisplayText('EMPTY', 0);
    DisplayTileTextAction$DisplayText.NAMES = new DisplayTileTextAction$DisplayText()._DisplayTileTextAction$DisplayText('NAMES', 1);
    DisplayTileTextAction$DisplayText.OWNERS = new DisplayTileTextAction$DisplayText()._DisplayTileTextAction$DisplayText('OWNERS', 2);
    DisplayTileTextAction$DisplayText.REGIONS = new DisplayTileTextAction$DisplayText()._DisplayTileTextAction$DisplayText('REGIONS', 3);
    DisplayTileTextAction$DisplayText.$VALUES = [DisplayTileTextAction$DisplayText.EMPTY, DisplayTileTextAction$DisplayText.NAMES, DisplayTileTextAction$DisplayText.OWNERS, DisplayTileTextAction$DisplayText.REGIONS];
  }
}

$J.define(DisplayTileTextAction, 'net.sf.freecol.client.gui.action.DisplayTileTextAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.SelectableOptionAction', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.action.DisplayTileTextAction$DisplayText': '_DisplayTileTextAction' }, clinit: true, lazy: ['accelerators'] });
$J.define(DisplayTileTextAction$DisplayText, 'net.sf.freecol.client.gui.action.DisplayTileTextAction$DisplayText', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_DisplayTileTextAction$DisplayText' }, returns: { 'getKey': 'java.lang.String' }, clinit: true, lazy: ['$VALUES', 'EMPTY', 'NAMES', 'OWNERS', 'REGIONS'] });
$J.module(() => {
  InputEvent = $J.load('java.awt.event.InputEvent');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
