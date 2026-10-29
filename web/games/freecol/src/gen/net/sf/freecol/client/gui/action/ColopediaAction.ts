// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/ColopediaAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColAction } from './FreeColAction.ts';

let KeyEvent, StringUtils;

/**
 * Displays a section of the Colopedia.
 */
export class ColopediaAction extends FreeColAction {
  static readonly id: string = 'colopediaAction.';
  static mnemonics: number[] = null;
  /**
   * Creates this action.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param panelType The {@code PanelType} to use.
   */
  _ColopediaAction(freeColClient: FreeColClient, panelType: ColopediaAction$PanelType): this {
    this._FreeColAction(freeColClient, ColopediaAction.id + panelType.getKey());
    this.setMnemonic(ColopediaAction.mnemonics[panelType.ordinal()]);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    this.getGUI().showColopediaPanel(this.getId());
  }
  static $clinit() {
    ColopediaAction.mnemonics = [KeyEvent.VK_T, KeyEvent.VK_R, KeyEvent.VK_G, KeyEvent.VK_U, KeyEvent.VK_B, KeyEvent.VK_F, KeyEvent.VK_N, KeyEvent.VK_A, KeyEvent.VK_C];
  }
}

export class ColopediaAction$PanelType extends JEnum {
  static TERRAIN: ColopediaAction$PanelType = null;
  static RESOURCES: ColopediaAction$PanelType = null;
  static GOODS: ColopediaAction$PanelType = null;
  static UNITS: ColopediaAction$PanelType = null;
  static BUILDINGS: ColopediaAction$PanelType = null;
  static FATHERS: ColopediaAction$PanelType = null;
  static NATIONS: ColopediaAction$PanelType = null;
  static NATION_TYPES: ColopediaAction$PanelType = null;
  static CONCEPTS: ColopediaAction$PanelType = null;
  static $VALUES: ColopediaAction$PanelType[] = null;
  _ColopediaAction$PanelType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  getKey(): string {
    return StringUtils.getEnumKey(this);
  }
  static values(): ColopediaAction$PanelType[] { return ColopediaAction$PanelType.$VALUES.slice(); }
  static valueOf(name: string): ColopediaAction$PanelType { return $J.enumValueOf(ColopediaAction$PanelType, name); }
  static $clinit() {
    ColopediaAction$PanelType.TERRAIN = new ColopediaAction$PanelType()._ColopediaAction$PanelType('TERRAIN', 0);
    ColopediaAction$PanelType.RESOURCES = new ColopediaAction$PanelType()._ColopediaAction$PanelType('RESOURCES', 1);
    ColopediaAction$PanelType.GOODS = new ColopediaAction$PanelType()._ColopediaAction$PanelType('GOODS', 2);
    ColopediaAction$PanelType.UNITS = new ColopediaAction$PanelType()._ColopediaAction$PanelType('UNITS', 3);
    ColopediaAction$PanelType.BUILDINGS = new ColopediaAction$PanelType()._ColopediaAction$PanelType('BUILDINGS', 4);
    ColopediaAction$PanelType.FATHERS = new ColopediaAction$PanelType()._ColopediaAction$PanelType('FATHERS', 5);
    ColopediaAction$PanelType.NATIONS = new ColopediaAction$PanelType()._ColopediaAction$PanelType('NATIONS', 6);
    ColopediaAction$PanelType.NATION_TYPES = new ColopediaAction$PanelType()._ColopediaAction$PanelType('NATION_TYPES', 7);
    ColopediaAction$PanelType.CONCEPTS = new ColopediaAction$PanelType()._ColopediaAction$PanelType('CONCEPTS', 8);
    ColopediaAction$PanelType.$VALUES = [ColopediaAction$PanelType.TERRAIN, ColopediaAction$PanelType.RESOURCES, ColopediaAction$PanelType.GOODS, ColopediaAction$PanelType.UNITS, ColopediaAction$PanelType.BUILDINGS, ColopediaAction$PanelType.FATHERS, ColopediaAction$PanelType.NATIONS, ColopediaAction$PanelType.NATION_TYPES, ColopediaAction$PanelType.CONCEPTS];
  }
}

$J.define(ColopediaAction, 'net.sf.freecol.client.gui.action.ColopediaAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.FreeColAction', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.action.ColopediaAction$PanelType': '_ColopediaAction' }, clinit: true, lazy: ['mnemonics'] });
$J.define(ColopediaAction$PanelType, 'net.sf.freecol.client.gui.action.ColopediaAction$PanelType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_ColopediaAction$PanelType' }, returns: { 'getKey': 'java.lang.String' }, clinit: true, lazy: ['$VALUES', 'TERRAIN', 'RESOURCES', 'GOODS', 'UNITS', 'BUILDINGS', 'FATHERS', 'NATIONS', 'NATION_TYPES', 'CONCEPTS'] });
$J.module(() => {
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
