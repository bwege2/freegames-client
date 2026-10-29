// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/AbstractCellEditor.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1999, 2015, Oracle and/or its affiliates. All rights reserved.
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

let CellEditorListener, ChangeEvent, EventListenerList;

/**
 * A base class for <code>CellEditors</code>, providing default
 * implementations for the methods in the <code>CellEditor</code>
 * interface except <code>getCellEditorValue()</code>.
 * Like the other abstract implementations in Swing, also manages a list
 * of listeners.
 *
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
 * @author Philip Milne
 * @since 1.3
 */
export class AbstractCellEditor extends JObject {
  /**
   * The list of listeners.
   */
  listenerList: EventListenerList = null;
  /**
   * The change event.
   */
  changeEvent: ChangeEvent = null;
  /**
   * Constructor for subclasses to call.
   */
  _AbstractCellEditor(): this {
    this.listenerList = new EventListenerList()._EventListenerList();
    this.changeEvent = null;
    return this;
  }
  /**
   * Returns true.
   * @param e  an event object
   * @return true
   */
  isCellEditable(e: EventObject): boolean {
    return true;
  }
  /**
   * Returns true.
   * @param anEvent  an event object
   * @return true
   */
  shouldSelectCell(anEvent: EventObject): boolean {
    return true;
  }
  /**
   * Calls <code>fireEditingStopped</code> and returns true.
   * @return true
   */
  stopCellEditing(): boolean {
    this.fireEditingStopped();
    return true;
  }
  /**
   * Calls <code>fireEditingCanceled</code>.
   */
  cancelCellEditing(): void {
    this.fireEditingCanceled();
  }
  /**
   * Adds a <code>CellEditorListener</code> to the listener list.
   * @param l  the new listener to be added
   */
  addCellEditorListener(l: CellEditorListener): void {
    this.listenerList.add($J.cls(CellEditorListener), l);
  }
  /**
   * Removes a <code>CellEditorListener</code> from the listener list.
   * @param l  the listener to be removed
   */
  removeCellEditorListener(l: CellEditorListener): void {
    this.listenerList.remove($J.cls(CellEditorListener), l);
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is created lazily.
   *
   * @see EventListenerList
   */
  fireEditingStopped(): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(CellEditorListener)) {
        if (this.changeEvent == null) {
          this.changeEvent = new ChangeEvent()._ChangeEvent(this);
        }
        (listeners[(i + 1) | 0]).editingStopped(this.changeEvent);
      }
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is created lazily.
   *
   * @see EventListenerList
   */
  fireEditingCanceled(): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(CellEditorListener)) {
        if (this.changeEvent == null) {
          this.changeEvent = new ChangeEvent()._ChangeEvent(this);
        }
        (listeners[(i + 1) | 0]).editingCanceled(this.changeEvent);
      }
    }
  }
}

$J.define(AbstractCellEditor, 'javax.swing.AbstractCellEditor', { kind: 'class', ifaces: ['javax.swing.CellEditor', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_AbstractCellEditor' } });
$J.module(() => {
  CellEditorListener = $J.load('javax.swing.event.CellEditorListener');
  ChangeEvent = $J.load('javax.swing.event.ChangeEvent');
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
});
