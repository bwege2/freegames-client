// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/SelectableOptionAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception, Level } from '../../../../../../../jre/index.ts';
import { SelectableAction } from './SelectableAction.ts';

let FreeColAction;

/**
 * An action for selecting one of several options.
 */
export class SelectableOptionAction extends SelectableAction {
  static readonly id: string = 'selectableOptionAction';
  optionId: string = null;
  selected: boolean = false;
  /**
   * Creates this action.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param id The object identifier.
   * @param optionId The identifier of a boolean client option.
   */
  _SelectableOptionAction(freeColClient: FreeColClient, id: string, optionId: string): this {
    this._SelectableAction(freeColClient, id);
    this.selected = false;
    this.optionId = optionId;
    return this;
  }
  /**
   * Get the value of the underlying option.
   *
   * @return The option value.
   */
  getOption(): boolean {
    let co = this.freeColClient.getClientOptions();
    if (co != null && this.optionId != null) {
      try {
        return co.getBoolean(this.optionId);
      } catch ($e0) {
        if ($J.isa($e0, Exception)) {
          let e = $J.exc($e0);
          FreeColAction.logger.log(Level.WARNING, 'Failure with option: ' + this.optionId, e);
        } else {
          throw $e0;
        }
      }
    }
    return false;
  }
  /**
   * Set the option value.
   *
   * @param value The new boolean value.
   */
  setOption(value: boolean): void {
    let co = this.freeColClient.getClientOptions();
    if (co != null && this.optionId != null) {
      co.setBoolean(this.optionId, value);
    }
  }
  /**
   * Should this action be selected?
   *
   * Override this in subclasses.
   *
   * @return True of this action should be selected.
   */
  shouldBeSelected(): boolean {
    return this.getOption();
  }
}

$J.define(SelectableOptionAction, 'net.sf.freecol.client.gui.action.SelectableOptionAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.SelectableAction', ctors: { 'net.sf.freecol.client.FreeColClient,java.lang.String,java.lang.String': '_SelectableOptionAction' }, returns: { 'getOption': 'boolean' } });
$J.module(() => {
  FreeColAction = $J.load('net.sf.freecol.client.gui.action.FreeColAction');
});
