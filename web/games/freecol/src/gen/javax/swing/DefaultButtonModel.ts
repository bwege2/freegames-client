// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/DefaultButtonModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2014, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Oracle designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Oracle in the LICENSE file that accompanied this code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Oracle, 500 Oracle Parkway, Redwood Shores, CA 94065 USA
 * or visit www.oracle.com if you need additional information or have any
 * questions.
 */
import { $J, JObject } from '../../../jre/index.ts';

let EventQueue, ActionEvent, ActionListener, InputEvent, ItemEvent, ItemListener, UIManager, ChangeEvent, ChangeListener, EventListenerList;

/**
 * The default implementation of a <code>Button</code> component's data model.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing. As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @author Jeff Dinkins
 * @since 1.2
 */
export class DefaultButtonModel extends JObject {
  /**
   * The bitmask used to store the state of the button.
   */
  stateMask: number = 0;
  /**
   * The action command string fired by the button.
   */
  actionCommand: string = null;
  /**
   * The button group that the button belongs to.
   */
  group: ButtonGroup = null;
  /**
   * The button's mnemonic.
   */
  mnemonic: number = 0;
  /**
   * Only one <code>ChangeEvent</code> is needed per button model
   * instance since the event's only state is the source property.
   * The source of events generated is always "this".
   */
  changeEvent: ChangeEvent = null;
  /**
   * Stores the listeners on this model.
   */
  listenerList: EventListenerList = null;
  menuItem: boolean = false;
  /**
   * Identifies the "armed" bit in the bitmask, which
   * indicates partial commitment towards choosing/triggering
   * the button.
   */
  static readonly ARMED: number = 1;
  /**
   * Identifies the "selected" bit in the bitmask, which
   * indicates that the button has been selected. Only needed for
   * certain types of buttons - such as radio button or check box.
   */
  static readonly SELECTED: number = 2;
  /**
   * Identifies the "pressed" bit in the bitmask, which
   * indicates that the button is pressed.
   */
  static readonly PRESSED: number = 4;
  /**
   * Identifies the "enabled" bit in the bitmask, which
   * indicates that the button can be selected by
   * an input device (such as a mouse pointer).
   */
  static readonly ENABLED: number = 8;
  /**
   * Identifies the "rollover" bit in the bitmask, which
   * indicates that the mouse is over the button.
   */
  static readonly ROLLOVER: number = 16;
  /**
   * Constructs a <code>DefaultButtonModel</code>.
   */
  _DefaultButtonModel(): this {
    this.stateMask = 0;
    this.actionCommand = null;
    this.group = null;
    this.mnemonic = 0;
    this.changeEvent = null;
    this.listenerList = new EventListenerList()._EventListenerList();
    this.menuItem = false;
    this.stateMask = 0;
    this.setEnabled(true);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  setActionCommand(actionCommand: string): void {
    this.actionCommand = actionCommand;
  }
  /**
   * {@inheritDoc}
   */
  getActionCommand(): string {
    return this.actionCommand;
  }
  /**
   * {@inheritDoc}
   */
  isArmed(): boolean {
    return (this.stateMask & DefaultButtonModel.ARMED) !== 0;
  }
  /**
   * {@inheritDoc}
   */
  isSelected(): boolean {
    return (this.stateMask & DefaultButtonModel.SELECTED) !== 0;
  }
  /**
   * {@inheritDoc}
   */
  isEnabled(): boolean {
    return (this.stateMask & DefaultButtonModel.ENABLED) !== 0;
  }
  /**
   * {@inheritDoc}
   */
  isPressed(): boolean {
    return (this.stateMask & DefaultButtonModel.PRESSED) !== 0;
  }
  /**
   * {@inheritDoc}
   */
  isRollover(): boolean {
    return (this.stateMask & DefaultButtonModel.ROLLOVER) !== 0;
  }
  /**
   * {@inheritDoc}
   */
  setArmed(b: boolean): void {
    if (this.isMenuItem() && UIManager.getBoolean$Object('MenuItem.disabledAreNavigable')) {
      if (this.isArmed() === b) {
        return;
      }
    } else {
      if ((this.isArmed() === b) || !this.isEnabled()) {
        return;
      }
    }
    if (b) {
      this.stateMask |= DefaultButtonModel.ARMED;
    } else {
      this.stateMask &= ~DefaultButtonModel.ARMED;
    }
    this.fireStateChanged();
  }
  /**
   * {@inheritDoc}
   */
  setEnabled(b: boolean): void {
    if (this.isEnabled() === b) {
      return;
    }
    if (b) {
      this.stateMask |= DefaultButtonModel.ENABLED;
    } else {
      this.stateMask &= ~DefaultButtonModel.ENABLED;
      this.stateMask &= ~DefaultButtonModel.ARMED;
      this.stateMask &= ~DefaultButtonModel.PRESSED;
    }
    this.fireStateChanged();
  }
  /**
   * {@inheritDoc}
   */
  setSelected(b: boolean): void {
    if (this.isSelected() === b) {
      return;
    }
    if (b) {
      this.stateMask |= DefaultButtonModel.SELECTED;
    } else {
      this.stateMask &= ~DefaultButtonModel.SELECTED;
    }
    this.fireItemStateChanged(new ItemEvent()._ItemEvent(this, ItemEvent.ITEM_STATE_CHANGED, this, b ? ItemEvent.SELECTED : ItemEvent.DESELECTED));
    this.fireStateChanged();
  }
  /**
   * {@inheritDoc}
   */
  setPressed(b: boolean): void {
    if ((this.isPressed() === b) || !this.isEnabled()) {
      return;
    }
    if (b) {
      this.stateMask |= DefaultButtonModel.PRESSED;
    } else {
      this.stateMask &= ~DefaultButtonModel.PRESSED;
    }
    if (!this.isPressed() && this.isArmed()) {
      let modifiers = 0;
      let currentEvent = EventQueue.getCurrentEvent();
      if (currentEvent instanceof InputEvent) {
        modifiers = (currentEvent).getModifiers();
      } else if (currentEvent instanceof ActionEvent) {
        modifiers = (currentEvent).getModifiers();
      }
      this.fireActionPerformed(new ActionEvent()._ActionEvent$Object$int$String$long$int(this, ActionEvent.ACTION_PERFORMED, this.getActionCommand(), EventQueue.getMostRecentEventTime(), modifiers));
    }
    this.fireStateChanged();
  }
  /**
   * {@inheritDoc}
   */
  setRollover(b: boolean): void {
    if ((this.isRollover() === b) || !this.isEnabled()) {
      return;
    }
    if (b) {
      this.stateMask |= DefaultButtonModel.ROLLOVER;
    } else {
      this.stateMask &= ~DefaultButtonModel.ROLLOVER;
    }
    this.fireStateChanged();
  }
  /**
   * {@inheritDoc}
   */
  setMnemonic(key: number): void {
    if (this.mnemonic !== key) {
      this.mnemonic = key;
      this.fireStateChanged();
    }
  }
  /**
   * {@inheritDoc}
   */
  getMnemonic(): number {
    return this.mnemonic;
  }
  /**
   * {@inheritDoc}
   */
  addChangeListener(l: ChangeListener): void {
    this.listenerList.add($J.cls(ChangeListener), l);
  }
  /**
   * {@inheritDoc}
   */
  removeChangeListener(l: ChangeListener): void {
    this.listenerList.remove($J.cls(ChangeListener), l);
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is created lazily.
   *
   * @see EventListenerList
   */
  fireStateChanged(): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ChangeListener)) {
        if (this.changeEvent == null) {
          this.changeEvent = new ChangeEvent()._ChangeEvent(this);
        }
        $J.fn((listeners[(i + 1) | 0]), 'stateChanged')(this.changeEvent);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  addActionListener(l: ActionListener): void {
    this.listenerList.add($J.cls(ActionListener), l);
  }
  /**
   * {@inheritDoc}
   */
  removeActionListener(l: ActionListener): void {
    this.listenerList.remove($J.cls(ActionListener), l);
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.
   *
   * @param e the <code>ActionEvent</code> to deliver to listeners
   * @see EventListenerList
   */
  fireActionPerformed(e: ActionEvent): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ActionListener)) {
        $J.fn((listeners[(i + 1) | 0]), 'actionPerformed')(e);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  addItemListener(l: ItemListener): void {
    this.listenerList.add($J.cls(ItemListener), l);
  }
  /**
   * {@inheritDoc}
   */
  removeItemListener(l: ItemListener): void {
    this.listenerList.remove($J.cls(ItemListener), l);
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.
   *
   * @param e the <code>ItemEvent</code> to deliver to listeners
   * @see EventListenerList
   */
  fireItemStateChanged(e: ItemEvent): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ItemListener)) {
        $J.fn((listeners[(i + 1) | 0]), 'itemStateChanged')(e);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  setGroup(group: ButtonGroup): void {
    this.group = group;
  }
  /**
   * Returns the group that the button belongs to.
   * Normally used with radio buttons, which are mutually
   * exclusive within their group.
   *
   * @return the <code>ButtonGroup</code> that the button belongs to
   *
   * @since 1.3
   */
  getGroup(): ButtonGroup {
    return this.group;
  }
  isMenuItem(): boolean {
    return this.menuItem;
  }
  setMenuItem(menuItem: boolean): void {
    this.menuItem = menuItem;
  }
}

$J.define(DefaultButtonModel, 'javax.swing.DefaultButtonModel', { kind: 'class', ifaces: ['javax.swing.ButtonModel', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_DefaultButtonModel' } });
$J.module(() => {
  EventQueue = $J.load('java.awt.EventQueue');
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  ActionListener = $J.load('java.awt.event.ActionListener');
  InputEvent = $J.load('java.awt.event.InputEvent');
  ItemEvent = $J.load('java.awt.event.ItemEvent');
  ItemListener = $J.load('java.awt.event.ItemListener');
  UIManager = $J.load('javax.swing.UIManager');
  ChangeEvent = $J.load('javax.swing.event.ChangeEvent');
  ChangeListener = $J.load('javax.swing.event.ChangeListener');
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
});
