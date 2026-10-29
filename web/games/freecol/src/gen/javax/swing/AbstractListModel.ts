// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/AbstractListModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let EventListenerList, ListDataEvent, ListDataListener;

/**
 * The abstract definition for the data model that provides
 * a <code>List</code> with its contents.
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
 * @param <E> the type of the elements of this model
 *
 * @author Hans Muller
 * @since 1.2
 */
export class AbstractListModel<E> extends JObject {
  /**
   * The listener list.
   */
  listenerList: EventListenerList = null;
  /**
   * Constructor for subclasses to call.
   */
  _AbstractListModel(): this {
    this.listenerList = new EventListenerList()._EventListenerList();
    return this;
  }
  /**
   * Adds a listener to the list that's notified each time a change
   * to the data model occurs.
   *
   * @param l the <code>ListDataListener</code> to be added
   */
  addListDataListener(l: ListDataListener): void {
    this.listenerList.add($J.cls(ListDataListener), l);
  }
  /**
   * Removes a listener from the list that's notified each time a
   * change to the data model occurs.
   *
   * @param l the <code>ListDataListener</code> to be removed
   */
  removeListDataListener(l: ListDataListener): void {
    this.listenerList.remove($J.cls(ListDataListener), l);
  }
  /**
   * <code>AbstractListModel</code> subclasses must call this method
   * <b>after</b>
   * one or more elements of the list change.  The changed elements
   * are specified by the closed interval index0, index1 -- the endpoints
   * are included.  Note that
   * index0 need not be less than or equal to index1.
   *
   * @param source the <code>ListModel</code> that changed, typically "this"
   * @param index0 one end of the new interval
   * @param index1 the other end of the new interval
   * @see EventListenerList
   * @see DefaultListModel
   */
  fireContentsChanged$Object$int$int(source: any, index0: number, index1: number): void {
    let listeners = this.listenerList.getListenerList();
    let e = null;
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ListDataListener)) {
        if (e == null) {
          e = new ListDataEvent()._ListDataEvent(source, ListDataEvent.CONTENTS_CHANGED, index0, index1);
        }
        (listeners[(i + 1) | 0]).contentsChanged(e);
      }
    }
  }
  /**
   * <code>AbstractListModel</code> subclasses must call this method
   * <b>after</b>
   * one or more elements are added to the model.  The new elements
   * are specified by a closed interval index0, index1 -- the endpoints
   * are included.  Note that
   * index0 need not be less than or equal to index1.
   *
   * @param source the <code>ListModel</code> that changed, typically "this"
   * @param index0 one end of the new interval
   * @param index1 the other end of the new interval
   * @see EventListenerList
   * @see DefaultListModel
   */
  fireIntervalAdded(source: any, index0: number, index1: number): void {
    let listeners = this.listenerList.getListenerList();
    let e = null;
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ListDataListener)) {
        if (e == null) {
          e = new ListDataEvent()._ListDataEvent(source, ListDataEvent.INTERVAL_ADDED, index0, index1);
        }
        (listeners[(i + 1) | 0]).intervalAdded(e);
      }
    }
  }
  /**
   * <code>AbstractListModel</code> subclasses must call this method
   * <b>after</b> one or more elements are removed from the model.
   * <code>index0</code> and <code>index1</code> are the end points
   * of the interval that's been removed.  Note that <code>index0</code>
   * need not be less than or equal to <code>index1</code>.
   *
   * @param source the <code>ListModel</code> that changed, typically "this"
   * @param index0 one end of the removed interval,
   *               including <code>index0</code>
   * @param index1 the other end of the removed interval,
   *               including <code>index1</code>
   * @see EventListenerList
   * @see DefaultListModel
   */
  fireIntervalRemoved(source: any, index0: number, index1: number): void {
    let listeners = this.listenerList.getListenerList();
    let e = null;
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ListDataListener)) {
        if (e == null) {
          e = new ListDataEvent()._ListDataEvent(source, ListDataEvent.INTERVAL_REMOVED, index0, index1);
        }
        (listeners[(i + 1) | 0]).intervalRemoved(e);
      }
    }
  }
}

$J.define(AbstractListModel, 'javax.swing.AbstractListModel', { kind: 'class', ifaces: ['javax.swing.ListModel', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_AbstractListModel' }, meths: { 'fireContentsChanged(java.lang.Object,int,int)': 'fireContentsChanged$Object$int$int' } });
$J.module(() => {
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
  ListDataEvent = $J.load('javax.swing.event.ListDataEvent');
  ListDataListener = $J.load('javax.swing.event.ListDataListener');
});
