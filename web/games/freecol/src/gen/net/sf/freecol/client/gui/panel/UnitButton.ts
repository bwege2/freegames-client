// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/UnitButton.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColButton } from './FreeColButton.ts';

let Dimension, Action, FreeColAction, FreeColButton$ButtonStyle;

/**
 * A button with a set of images which is used to give commands
 * to a unit with the mouse instead of the keyboard. The UnitButton
 * has rollover highlighting, can be grayed out if it is unusable,
 * and will use a separate image for being pressed.
 * The UnitButton is useless by itself, this object needs to
 * be placed on a JComponent in order to be useable.
 */
export class UnitButton extends FreeColButton {
  static logger: Logger = null;
  actionId: string = null;
  am: ActionManager = null;
  /**
   * The basic constructor.
   *
   * @param am The action manager which holds all FreeColAction.
   * @param actionId The key for the action to be used with this button
   */
  _UnitButton(am: ActionManager, actionId: string): this {
    this._FreeColButton$ButtonStyle$Action(FreeColButton$ButtonStyle.TRANSPARENT, am.getFreeColAction(actionId));
    this.actionId = actionId;
    this.am = am;
    return this;
  }
  /**
   * Refreshes the the reference to the FreeColAction stored in the
   * action manager.
   */
  refreshAction(): void {
    this.setAction(null);
    let freeColAction = this.am.getFreeColAction(this.actionId);
    freeColAction.update();
    this.setAction(freeColAction);
  }
  configurePropertiesFromAction(a: Action): void {
    super.configurePropertiesFromAction(a);
    if (a != null) {
      this.setRolloverEnabled(true);
      let bi = a.getValue$String(FreeColAction.BUTTON_IMAGE);
      this.setIcon(bi);
      this.setRolloverIcon(a.getValue$String(FreeColAction.BUTTON_ROLLOVER_IMAGE));
      this.setPressedIcon(a.getValue$String(FreeColAction.BUTTON_PRESSED_IMAGE));
      this.setDisabledIcon(a.getValue$String(FreeColAction.BUTTON_DISABLED_IMAGE));
      this.setToolTipText(a.getValue$String(Action.NAME));
      this.setText(null);
      this.setFocusPainted(false);
      this.setContentAreaFilled(false);
      this.setBorderPainted(false);
      if (bi != null) {
        this.setSize$int$int(bi.getIconWidth(), bi.getIconHeight());
        this.setPreferredSize(new Dimension()._Dimension$int$int(bi.getIconWidth(), bi.getIconHeight()));
        this.setMinimumSize(new Dimension()._Dimension$int$int(bi.getIconWidth(), bi.getIconHeight()));
      } else {
        UnitButton.logger.warning('Action ' + $J.str(a) + ' has no BUTTON_IMAGE');
      }
    }
  }
  createActionPropertyChangeListener(a: Action): PropertyChangeListener {
    return $J.fn(new UnitButton$UnitButtonActionPropertyChangeListener()._UnitButton$UnitButtonActionPropertyChangeListener(this), 'propertyChange');
  }
  static $clinit() {
    UnitButton.logger = Logger.getLogger($J.cls(UnitButton).getName());
  }
}

export class UnitButton$UnitButtonActionPropertyChangeListener extends JObject {
  button: AbstractButton = null;
  _UnitButton$UnitButtonActionPropertyChangeListener(button: AbstractButton): this {
    this.button = button;
    return this;
  }
  propertyChange(e: PropertyChangeEvent): void {
    let propertyName = e.getPropertyName();
    if ($J.equals(Action.NAME, e.getPropertyName()) || $J.equals(Action.SHORT_DESCRIPTION, e.getPropertyName())) {
      let text = e.getNewValue();
      this.button.setToolTipText(text);
    } else if ($J.equals('enabled', propertyName)) {
      let enabledState = e.getNewValue();
      this.button.setEnabled(enabledState);
      this.button.repaint$();
    } else if ($J.equals(Action.SMALL_ICON, e.getPropertyName())) {
      let icon = e.getNewValue();
      this.button.setIcon(icon);
      this.button.repaint$();
    } else if ($J.equals(FreeColAction.BUTTON_IMAGE, e.getPropertyName())) {
      let bi = e.getNewValue();
      this.button.setIcon(bi);
      if (bi != null) {
        this.button.setSize$Dimension(new Dimension()._Dimension$int$int(bi.getIconWidth(), bi.getIconHeight()));
        this.button.setMinimumSize(new Dimension()._Dimension$int$int(bi.getIconWidth(), bi.getIconHeight()));
        this.button.setPreferredSize(new Dimension()._Dimension$int$int(bi.getIconWidth(), bi.getIconHeight()));
      }
      this.button.repaint$();
    } else if ($J.equals(FreeColAction.BUTTON_ROLLOVER_IMAGE, e.getPropertyName())) {
      this.button.setRolloverIcon(e.getNewValue());
      this.button.repaint$();
    } else if ($J.equals(FreeColAction.BUTTON_PRESSED_IMAGE, e.getPropertyName())) {
      this.button.setPressedIcon(e.getNewValue());
      this.button.repaint$();
    } else if ($J.equals(FreeColAction.BUTTON_DISABLED_IMAGE, e.getPropertyName())) {
      this.button.setDisabledIcon(e.getNewValue());
      this.button.repaint$();
    } else if ($J.equals(Action.MNEMONIC_KEY, e.getPropertyName())) {
      let mn = e.getNewValue();
      this.button.setMnemonic$int(mn);
      this.button.repaint$();
    } else if ($J.equals(Action.ACTION_COMMAND_KEY, e.getPropertyName())) {
      this.button.setActionCommand(e.getNewValue());
    }
  }
}

$J.define(UnitButton, 'net.sf.freecol.client.gui.panel.UnitButton', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColButton', ctors: { 'net.sf.freecol.client.gui.action.ActionManager,java.lang.String': '_UnitButton' }, clinit: true, lazy: ['logger'] });
$J.define(UnitButton$UnitButtonActionPropertyChangeListener, 'net.sf.freecol.client.gui.panel.UnitButton$UnitButtonActionPropertyChangeListener', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { 'javax.swing.AbstractButton': '_UnitButton$UnitButtonActionPropertyChangeListener' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Action = $J.load('javax.swing.Action');
  FreeColAction = $J.load('net.sf.freecol.client.gui.action.FreeColAction');
  FreeColButton$ButtonStyle = $J.load('net.sf.freecol.client.gui.panel.FreeColButton$ButtonStyle');
});
