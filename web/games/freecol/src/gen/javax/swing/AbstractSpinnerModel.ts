// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/AbstractSpinnerModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2014, Oracle and/or its affiliates. All rights reserved.
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
 * This class provides the ChangeListener part of the
 * SpinnerModel interface that should be suitable for most concrete SpinnerModel
 * implementations.  Subclasses must provide an implementation of the
 * <code>setValue</code>, <code>getValue</code>, <code>getNextValue</code> and
 * <code>getPreviousValue</code> methods.
 *
 * @see JSpinner
 * @see SpinnerModel
 * @see SpinnerListModel
 * @see SpinnerNumberModel
 * @see SpinnerDateModel
 *
 * @author Hans Muller
 * @since 1.4
 */
export class AbstractSpinnerModel extends JObject {
  /**
   * Only one ChangeEvent is needed per model instance since the
   * event's only (read-only) state is the source property.  The source
   * of events generated here is always "this".
   */
  changeEvent: ChangeEvent = null;
  /**
   * The list of ChangeListeners for this model.  Subclasses may
   * store their own listeners here.
   */
  listenerList: EventListenerList = null;
  /**
   * Constructor for subclasses to call.
   */
  _AbstractSpinnerModel(): this {
    this.changeEvent = null;
    this.listenerList = new EventListenerList()._EventListenerList();
    return this;
  }
  /**
   * Adds a ChangeListener to the model's listener list.  The
   * ChangeListeners must be notified when the models value changes.
   *
   * @param l the ChangeListener to add
   * @see #removeChangeListener
   * @see SpinnerModel#addChangeListener
   */
  addChangeListener(l: ChangeListener): void {
    this.listenerList.add($J.cls(ChangeListener), l);
  }
  /**
   * Removes a ChangeListener from the model's listener list.
   *
   * @param l the ChangeListener to remove
   * @see #addChangeListener
   * @see SpinnerModel#removeChangeListener
   */
  removeChangeListener(l: ChangeListener): void {
    this.listenerList.remove($J.cls(ChangeListener), l);
  }
  /**
   * Run each ChangeListeners stateChanged() method.
   *
   * @see #setValue
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

$J.define(AbstractSpinnerModel, 'javax.swing.AbstractSpinnerModel', { kind: 'class', ifaces: ['javax.swing.SpinnerModel', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_AbstractSpinnerModel' } });
$J.module(() => {
  ChangeEvent = $J.load('javax.swing.event.ChangeEvent');
  ChangeListener = $J.load('javax.swing.event.ChangeListener');
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
});
