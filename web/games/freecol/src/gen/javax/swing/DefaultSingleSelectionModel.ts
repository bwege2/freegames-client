// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/DefaultSingleSelectionModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2015, Oracle and/or its affiliates. All rights reserved.
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

let ChangeEvent, ChangeListener, EventListenerList;

/**
 * A generic implementation of SingleSelectionModel.
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
 * @author Dave Moore
 * @since 1.2
 */
export class DefaultSingleSelectionModel extends JObject {
  /**
   * Only one ModelChangeEvent is needed per model instance since the
   * event's only (read-only) state is the source property.  The source
   * of events generated here is always "this".
   */
  changeEvent: ChangeEvent = null;
  /**
   * The collection of registered listeners
   */
  listenerList: EventListenerList = null;
  index_: number = 0;
  /**
   * Constructs a {@code DefaultSingleSelectionModel}.
   */
  _DefaultSingleSelectionModel(): this {
    this.changeEvent = null;
    this.listenerList = new EventListenerList()._EventListenerList();
    this.index_ = -1;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getSelectedIndex(): number {
    return this.index_;
  }
  /**
   * {@inheritDoc}
   */
  setSelectedIndex(index: number): void {
    if (this.index_ !== index) {
      this.index_ = index;
      this.fireStateChanged();
    }
  }
  /**
   * {@inheritDoc}
   */
  clearSelection(): void {
    this.setSelectedIndex(-1);
  }
  /**
   * {@inheritDoc}
   */
  isSelected(): boolean {
    let ret = false;
    if (this.getSelectedIndex() !== -1) {
      ret = true;
    }
    return ret;
  }
  /**
   * Adds a <code>ChangeListener</code> to the button.
   */
  addChangeListener(l: ChangeListener): void {
    this.listenerList.add($J.cls(ChangeListener), l);
  }
  /**
   * Removes a <code>ChangeListener</code> from the button.
   */
  removeChangeListener(l: ChangeListener): void {
    this.listenerList.remove($J.cls(ChangeListener), l);
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is created lazily.
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
}

$J.define(DefaultSingleSelectionModel, 'javax.swing.DefaultSingleSelectionModel', { kind: 'class', ifaces: ['javax.swing.SingleSelectionModel', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_DefaultSingleSelectionModel' } });
$J.module(() => {
  ChangeEvent = $J.load('javax.swing.event.ChangeEvent');
  ChangeListener = $J.load('javax.swing.event.ChangeListener');
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
});
