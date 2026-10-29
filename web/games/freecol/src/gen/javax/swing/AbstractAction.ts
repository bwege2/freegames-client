// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/AbstractAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, GetPropertyAction, JBoolean, JObject } from '../../../jre/index.ts';

let Action, ArrayTable, SwingPropertyChangeSupport;

/**
 * This class provides default implementations for the JFC <code>Action</code>
 * interface. Standard behaviors like the get and set methods for
 * <code>Action</code> object properties (icon, text, and enabled) are defined
 * here. The developer need only subclass this abstract class and
 * define the <code>actionPerformed</code> method.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @author Georges Saab
 * @see Action
 * @since 1.2
 */
export class AbstractAction extends JObject {
  /**
   * Whether or not actions should reconfigure all properties on null.
   */
  static RECONFIGURE_ON_NULL: boolean = null;
  /**
   * Specifies whether action is enabled; the default is true.
   */
  enabled: boolean = false;
  /**
   * Contains the array of key bindings.
   */
  arrayTable: ArrayTable = null;
  /**
   * If any <code>PropertyChangeListeners</code> have been registered, the
   * <code>changeSupport</code> field describes them.
   */
  changeSupport: SwingPropertyChangeSupport = null;
  $init_AbstractAction() {
    this.enabled = true;
  }
  /**
   * Creates an {@code Action}.
   */
  _AbstractAction$(): this {
    this.$init_AbstractAction();
    return this;
  }
  /**
   * Creates an {@code Action} with the specified name.
   *
   * @param name the name ({@code Action.NAME}) for the action; a
   *        value of {@code null} is ignored
   */
  _AbstractAction$String(name: string): this {
    this.$init_AbstractAction();
    this.putValue(Action.NAME, name);
    return this;
  }
  /**
   * Whether or not to reconfigure all action properties from the
   * specified event.
   */
  static shouldReconfigure(e: PropertyChangeEvent): boolean {
    if (e.getPropertyName() == null) {
      {
        if (AbstractAction.RECONFIGURE_ON_NULL == null) {
          AbstractAction.RECONFIGURE_ON_NULL = $J.parseBoolean(AccessController.doPrivileged(new GetPropertyAction('swing.actions.reconfigureOnNull', 'false')));
        }
        return AbstractAction.RECONFIGURE_ON_NULL;
      }
    }
    return false;
  }
  /**
   * Sets the enabled state of a component from an Action.
   *
   * @param c the Component to set the enabled state on
   * @param a the Action to set the enabled state from, may be null
   */
  static setEnabledFromAction(c: JComponent, a: Action): void {
    c.setEnabled((a != null) ? a.isEnabled() : true);
  }
  /**
   * Sets the tooltip text of a component from an Action.
   *
   * @param c the Component to set the tooltip text on
   * @param a the Action to set the tooltip text from, may be null
   */
  static setToolTipTextFromAction(c: JComponent, a: Action): void {
    c.setToolTipText(a != null ? a.getValue$String(Action.SHORT_DESCRIPTION) : null);
  }
  static hasSelectedKey(a: Action): boolean {
    return (a != null && a.getValue$String(Action.SELECTED_KEY) != null);
  }
  static isSelected(a: Action): boolean {
    return $J.equals(true, a.getValue$String(Action.SELECTED_KEY));
  }
  /**
   * Gets the <code>Object</code> associated with the specified key.
   *
   * @param key a string containing the specified <code>key</code>
   * @return the binding <code>Object</code> stored with this key; if there
   *          are no keys, it will return <code>null</code>
   * @see Action#getValue
   */
  getValue$String(key: string): any {
    if (key === 'enabled') {
      return this.enabled;
    }
    if (this.arrayTable == null) {
      return null;
    }
    return this.arrayTable.get(key);
  }
  /**
   * Sets the <code>Value</code> associated with the specified key.
   *
   * @param key  the <code>String</code> that identifies the stored object
   * @param newValue the <code>Object</code> to store using this key
   * @see Action#putValue
   */
  putValue(key: string, newValue: any): void {
    let oldValue = null;
    if (key === 'enabled') {
      if (!($J.isa(newValue, JBoolean))) {
        newValue = false;
      }
      oldValue = this.enabled;
      this.enabled = newValue;
    } else {
      if (this.arrayTable == null) {
        this.arrayTable = new ArrayTable()._ArrayTable();
      }
      if (this.arrayTable.containsKey(key)) {
        oldValue = this.arrayTable.get(key);
      }
      if (newValue == null) {
        this.arrayTable.remove(key);
      } else {
        this.arrayTable.put(key, newValue);
      }
    }
    this.firePropertyChange(key, oldValue, newValue);
  }
  /**
   * Returns true if the action is enabled.
   *
   * @return true if the action is enabled, false otherwise
   * @see Action#isEnabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
  /**
   * Sets whether the {@code Action} is enabled. The default is {@code true}.
   *
   * @param newValue  {@code true} to enable the action, {@code false} to
   *                  disable it
   * @see Action#setEnabled
   */
  setEnabled(newValue: boolean): void {
    let oldValue = this.enabled;
    if (oldValue !== newValue) {
      this.enabled = newValue;
      this.firePropertyChange('enabled', oldValue, newValue);
    }
  }
  /**
   * Supports reporting bound property changes.  This method can be called
   * when a bound property has changed and it will send the appropriate
   * <code>PropertyChangeEvent</code> to any registered
   * <code>PropertyChangeListeners</code>.
   *
   * @param propertyName  the name of the property that has changed
   * @param oldValue  the old value of the property
   * @param newValue  the new value of the property
   */
  firePropertyChange(propertyName: string, oldValue: any, newValue: any): void {
    if (this.changeSupport == null || (oldValue != null && newValue != null && $J.equals(oldValue, newValue))) {
      return;
    }
    this.changeSupport.firePropertyChange$String$Object$Object(propertyName, oldValue, newValue);
  }
  /**
   * Adds a <code>PropertyChangeListener</code> to the listener list.
   * The listener is registered for all properties.
   * <p>
   * A <code>PropertyChangeEvent</code> will get fired in response to setting
   * a bound property, e.g. <code>setFont</code>, <code>setBackground</code>,
   * or <code>setForeground</code>.
   * Note that if the current component is inheriting its foreground,
   * background, or font from its container, then no event will be
   * fired in response to a change in the inherited property.
   *
   * @param listener  The <code>PropertyChangeListener</code> to be added
   *
   * @see Action#addPropertyChangeListener
   */
  addPropertyChangeListener(listener: PropertyChangeListener): void {
    if (this.changeSupport == null) {
      this.changeSupport = new SwingPropertyChangeSupport()._SwingPropertyChangeSupport$Object(this);
    }
    this.changeSupport.addPropertyChangeListener$PropertyChangeListener(listener);
  }
  /**
   * Removes a <code>PropertyChangeListener</code> from the listener list.
   * This removes a <code>PropertyChangeListener</code> that was registered
   * for all properties.
   *
   * @param listener  the <code>PropertyChangeListener</code> to be removed
   *
   * @see Action#removePropertyChangeListener
   */
  removePropertyChangeListener(listener: PropertyChangeListener): void {
    if (this.changeSupport == null) {
      return;
    }
    this.changeSupport.removePropertyChangeListener$PropertyChangeListener(listener);
  }
  /**
   * Clones the abstract action. This gives the clone
   * its own copy of the key/value list,
   * which is not handled for you by <code>Object.clone()</code>.
   */
  clone(): any {
    let newAction = super.clone();
    {
      if (this.arrayTable != null) {
        newAction.arrayTable = this.arrayTable.clone();
      }
    }
    return newAction;
  }
}

$J.define(AbstractAction, 'javax.swing.AbstractAction', { kind: 'class', ifaces: ['javax.swing.Action', 'java.lang.Cloneable', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'java.lang.String,javax.swing.Icon': '_AbstractAction$String$Icon', 'java.lang.String': '_AbstractAction$String', '': '_AbstractAction$' }, meths: { 'getValue(java.lang.String)': 'getValue$String' } });
$J.module(() => {
  Action = $J.load('javax.swing.Action');
  ArrayTable = $J.load('javax.swing.ArrayTable');
  SwingPropertyChangeSupport = $J.load('javax.swing.event.SwingPropertyChangeSupport');
});
