// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/colorchooser/DefaultColorSelectionModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2015, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../../jre/index.ts';

let ChangeEvent, ChangeListener, EventListenerList;

/**
 * A generic implementation of <code>ColorSelectionModel</code>.
 *
 * @author Steve Wilson
 *
 * @see java.awt.Color
 */
export class DefaultColorSelectionModel extends JObject {
  /**
   * Only one <code>ChangeEvent</code> is needed per model instance
   * since the event's only (read-only) state is the source property.
   * The source of events generated here is always "this".
   */
  changeEvent: ChangeEvent = null;
  /**
   * The listener list.
   */
  listenerList: EventListenerList = null;
  selectedColor: Color = null;
  $init_DefaultColorSelectionModel() {
    this.changeEvent = null;
    this.listenerList = new EventListenerList()._EventListenerList();
  }
  /**
   * Creates a <code>DefaultColorSelectionModel</code> with the
   * current color set to <code>color</code>, which should be
   * non-<code>null</code>.  Note that setting the color to
   * <code>null</code> is undefined and may have unpredictable
   * results.
   *
   * @param color the new <code>Color</code>
   */
  _DefaultColorSelectionModel$Color(color: Color): this {
    this.$init_DefaultColorSelectionModel();
    this.selectedColor = color;
    return this;
  }
  /**
   * Returns the selected <code>Color</code> which should be
   * non-<code>null</code>.
   *
   * @return the selected <code>Color</code>
   */
  getSelectedColor(): Color {
    return this.selectedColor;
  }
  /**
   * Sets the selected color to <code>color</code>.
   * Note that setting the color to <code>null</code>
   * is undefined and may have unpredictable results.
   * This method fires a state changed event if it sets the
   * current color to a new non-<code>null</code> color;
   * if the new color is the same as the current color,
   * no event is fired.
   *
   * @param color the new <code>Color</code>
   */
  setSelectedColor(color: Color): void {
    if (color != null && !this.selectedColor.equals(color)) {
      this.selectedColor = color;
      this.fireStateChanged();
    }
  }
  /**
   * Adds a <code>ChangeListener</code> to the model.
   *
   * @param l the <code>ChangeListener</code> to be added
   */
  addChangeListener(l: ChangeListener): void {
    this.listenerList.add($J.cls(ChangeListener), l);
  }
  /**
   * Removes a <code>ChangeListener</code> from the model.
   * @param l the <code>ChangeListener</code> to be removed
   */
  removeChangeListener(l: ChangeListener): void {
    this.listenerList.remove($J.cls(ChangeListener), l);
  }
  /**
   * Runs each <code>ChangeListener</code>'s
   * <code>stateChanged</code> method.
   *
   * <!-- @see #setRangeProperties    //bad link-->
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

$J.define(DefaultColorSelectionModel, 'javax.swing.colorchooser.DefaultColorSelectionModel', { kind: 'class', ifaces: ['javax.swing.colorchooser.ColorSelectionModel', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'java.awt.Color': '_DefaultColorSelectionModel$Color', '': '_DefaultColorSelectionModel$' } });
$J.module(() => {
  ChangeEvent = $J.load('javax.swing.event.ChangeEvent');
  ChangeListener = $J.load('javax.swing.event.ChangeListener');
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
});
