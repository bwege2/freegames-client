// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/SelectableAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { MapboardAction } from './MapboardAction.ts';

let Action;

/**
 * An action for a boolean value.
 */
export class SelectableAction extends MapboardAction {
  static readonly id: string = 'selectableAction';
  /**
   * Creates this action.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param id The object identifier.
   */
  _SelectableAction(freeColClient: FreeColClient, id: string): this {
    this._MapboardAction(freeColClient, id);
    return this;
  }
  /**
   * Gets whether the action is selected.
   *
   * @return True if this action is selected.
   */
  isSelected(): boolean {
    return $J.equals(true, this.getValue$String(Action.SELECTED_KEY));
  }
  /**
   * Sets whether the action is selected.
   *
   * @param b The new selection value.
   */
  setSelected(b: boolean): void {
    this.putValue(Action.SELECTED_KEY, b);
  }
  /**
   * Should this action be selected?
   *
   * Override this in subclasses.
   *
   * @return True of this action should be selected.
   */
  shouldBeSelected(): boolean {
    return this.isSelected();
  }
  /**
   * {@inheritDoc}
   */
  update(): void {
    super.update();
    this.setSelected(this.shouldBeSelected());
  }
}

$J.define(SelectableAction, 'net.sf.freecol.client.gui.action.SelectableAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.MapboardAction', ctors: { 'net.sf.freecol.client.FreeColClient,java.lang.String': '_SelectableAction' }, returns: { 'isSelected': 'boolean' } });
$J.module(() => {
  Action = $J.load('javax.swing.Action');
});
