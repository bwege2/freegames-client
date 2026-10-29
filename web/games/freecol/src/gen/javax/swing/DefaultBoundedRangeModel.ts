// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/DefaultBoundedRangeModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, JObject } from '../../../jre/index.ts';

let ChangeEvent, ChangeListener, EventListenerList;

/**
 * A generic implementation of BoundedRangeModel.
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
 * @author David Kloba
 * @author Hans Muller
 * @see BoundedRangeModel
 * @since 1.2
 */
export class DefaultBoundedRangeModel extends JObject {
  /**
   * Only one <code>ChangeEvent</code> is needed per model instance since the
   * event's only (read-only) state is the source property.  The source
   * of events generated here is always "this".
   */
  changeEvent: ChangeEvent = null;
  /**
   * The listeners waiting for model changes.
   */
  listenerList: EventListenerList = null;
  value_: number = 0;
  extent: number = 0;
  min: number = 0;
  max_: number = 0;
  isAdjusting: boolean = false;
  $init_DefaultBoundedRangeModel() {
    this.changeEvent = null;
    this.listenerList = new EventListenerList()._EventListenerList();
    this.value_ = 0;
    this.extent = 0;
    this.min = 0;
    this.max_ = 100;
    this.isAdjusting = false;
  }
  /**
   * Initializes all of the properties with default values.
   * Those values are:
   * <ul>
   * <li><code>value</code> = 0
   * <li><code>extent</code> = 0
   * <li><code>minimum</code> = 0
   * <li><code>maximum</code> = 100
   * <li><code>adjusting</code> = false
   * </ul>
   */
  _DefaultBoundedRangeModel$(): this {
    this.$init_DefaultBoundedRangeModel();
    return this;
  }
  /**
   * Initializes value, extent, minimum and maximum. Adjusting is false.
   * Throws an <code>IllegalArgumentException</code> if the following
   * constraints aren't satisfied:
   * <pre>
   * min &lt;= value &lt;= value+extent &lt;= max
   * </pre>
   *
   * @param value  an int giving the current value
   * @param extent the length of the inner range that begins at the model's value
   * @param min    an int giving the minimum value
   * @param max    an int giving the maximum value
   */
  _DefaultBoundedRangeModel$int$int$int$int(value: number, extent: number, min: number, max: number): this {
    this.$init_DefaultBoundedRangeModel();
    if ((max >= min) && (value >= min) && (((value + extent) | 0) >= value) && (((value + extent) | 0) <= max)) {
      this.value_ = value;
      this.extent = extent;
      this.min = min;
      this.max_ = max;
    } else {
      throw new IllegalArgumentException('invalid range properties');
    }
    return this;
  }
  /**
   * Returns the model's current value.
   * @return the model's current value
   * @see #setValue
   * @see BoundedRangeModel#getValue
   */
  getValue(): number {
    return this.value_;
  }
  /**
   * Returns the model's extent.
   * @return the model's extent
   * @see #setExtent
   * @see BoundedRangeModel#getExtent
   */
  getExtent(): number {
    return this.extent;
  }
  /**
   * Returns the model's minimum.
   * @return the model's minimum
   * @see #setMinimum
   * @see BoundedRangeModel#getMinimum
   */
  getMinimum(): number {
    return this.min;
  }
  /**
   * Returns the model's maximum.
   * @return  the model's maximum
   * @see #setMaximum
   * @see BoundedRangeModel#getMaximum
   */
  getMaximum(): number {
    return this.max_;
  }
  /**
   * Sets the current value of the model. For a slider, that
   * determines where the knob appears. Ensures that the new
   * value, <I>n</I> falls within the model's constraints:
   * <pre>
   *     minimum &lt;= value &lt;= value+extent &lt;= maximum
   * </pre>
   *
   * @see BoundedRangeModel#setValue
   */
  setValue(n: number): void {
    n = Math.min(n, (2147483647 - this.extent) | 0);
    let newValue = Math.max(n, this.min);
    if (((newValue + this.extent) | 0) > this.max_) {
      newValue = (this.max_ - this.extent) | 0;
    }
    this.setRangeProperties(newValue, this.extent, this.min, this.max_, this.isAdjusting);
  }
  /**
   * Sets the extent to <I>n</I> after ensuring that <I>n</I>
   * is greater than or equal to zero and falls within the model's
   * constraints:
   * <pre>
   *     minimum &lt;= value &lt;= value+extent &lt;= maximum
   * </pre>
   * @see BoundedRangeModel#setExtent
   */
  setExtent(n: number): void {
    let newExtent = Math.max(0, n);
    if (((this.value_ + newExtent) | 0) > this.max_) {
      newExtent = (this.max_ - this.value_) | 0;
    }
    this.setRangeProperties(this.value_, newExtent, this.min, this.max_, this.isAdjusting);
  }
  /**
   * Sets the minimum to <I>n</I> after ensuring that <I>n</I>
   * that the other three properties obey the model's constraints:
   * <pre>
   *     minimum &lt;= value &lt;= value+extent &lt;= maximum
   * </pre>
   * @see #getMinimum
   * @see BoundedRangeModel#setMinimum
   */
  setMinimum(n: number): void {
    let newMax = Math.max(n, this.max_);
    let newValue = Math.max(n, this.value_);
    let newExtent = 0;
    if ((newMax - newValue) > newMax) {
      newExtent = this.extent;
    } else {
      newExtent = Math.min((newMax - newValue) | 0, this.extent);
    }
    this.setRangeProperties(newValue, newExtent, n, newMax, this.isAdjusting);
  }
  /**
   * Sets the maximum to <I>n</I> after ensuring that <I>n</I>
   * that the other three properties obey the model's constraints:
   * <pre>
   *     minimum &lt;= value &lt;= value+extent &lt;= maximum
   * </pre>
   * @see BoundedRangeModel#setMaximum
   */
  setMaximum(n: number): void {
    let newMin = Math.min(n, this.min);
    let newExtent = Math.min((n - newMin) | 0, this.extent);
    let newValue = Math.min((n - newExtent) | 0, this.value_);
    this.setRangeProperties(newValue, newExtent, newMin, n, this.isAdjusting);
  }
  /**
   * Sets the <code>valueIsAdjusting</code> property.
   *
   * @see #getValueIsAdjusting
   * @see #setValue
   * @see BoundedRangeModel#setValueIsAdjusting
   */
  setValueIsAdjusting(b: boolean): void {
    this.setRangeProperties(this.value_, this.extent, this.min, this.max_, b);
  }
  /**
   * Returns true if the value is in the process of changing
   * as a result of actions being taken by the user.
   *
   * @return the value of the <code>valueIsAdjusting</code> property
   * @see #setValue
   * @see BoundedRangeModel#getValueIsAdjusting
   */
  getValueIsAdjusting(): boolean {
    return this.isAdjusting;
  }
  /**
   * Sets all of the <code>BoundedRangeModel</code> properties after forcing
   * the arguments to obey the usual constraints:
   * <pre>
   *     minimum &lt;= value &lt;= value+extent &lt;= maximum
   * </pre>
   * <p>
   * At most, one <code>ChangeEvent</code> is generated.
   *
   * @see BoundedRangeModel#setRangeProperties
   * @see #setValue
   * @see #setExtent
   * @see #setMinimum
   * @see #setMaximum
   * @see #setValueIsAdjusting
   */
  setRangeProperties(newValue: number, newExtent: number, newMin: number, newMax: number, adjusting: boolean): void {
    if (newMin > newMax) {
      newMin = newMax;
    }
    if (newValue > newMax) {
      newMax = newValue;
    }
    if (newValue < newMin) {
      newMin = newValue;
    }
    if ((newExtent + newValue) > newMax) {
      newExtent = (newMax - newValue) | 0;
    }
    if (newExtent < 0) {
      newExtent = 0;
    }
    let isChange = (newValue !== this.value_) || (newExtent !== this.extent) || (newMin !== this.min) || (newMax !== this.max_) || (adjusting !== this.isAdjusting);
    if (isChange) {
      this.value_ = newValue;
      this.extent = newExtent;
      this.min = newMin;
      this.max_ = newMax;
      this.isAdjusting = adjusting;
      this.fireStateChanged();
    }
  }
  /**
   * Adds a <code>ChangeListener</code>.  The change listeners are run each
   * time any one of the Bounded Range model properties changes.
   *
   * @param l the ChangeListener to add
   * @see #removeChangeListener
   * @see BoundedRangeModel#addChangeListener
   */
  addChangeListener(l: ChangeListener): void {
    this.listenerList.add($J.cls(ChangeListener), l);
  }
  /**
   * Removes a <code>ChangeListener</code>.
   *
   * @param l the <code>ChangeListener</code> to remove
   * @see #addChangeListener
   * @see BoundedRangeModel#removeChangeListener
   */
  removeChangeListener(l: ChangeListener): void {
    this.listenerList.remove($J.cls(ChangeListener), l);
  }
  /**
   * Runs each <code>ChangeListener</code>'s <code>stateChanged</code> method.
   *
   * @see #setRangeProperties
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
   * Returns a string that displays all of the
   * <code>BoundedRangeModel</code> properties.
   */
  toString(): string {
    let modelString = 'value=' + this.getValue() + ', extent=' + this.getExtent() + ', min=' + this.getMinimum() + ', max=' + this.getMaximum() + ', adj=' + this.getValueIsAdjusting();
    return $J.getClass(this).getName() + '[' + modelString + ']';
  }
}

$J.define(DefaultBoundedRangeModel, 'javax.swing.DefaultBoundedRangeModel', { kind: 'class', ifaces: ['javax.swing.BoundedRangeModel', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'int,int,int,int': '_DefaultBoundedRangeModel$int$int$int$int', '': '_DefaultBoundedRangeModel$' } });
$J.module(() => {
  ChangeEvent = $J.load('javax.swing.event.ChangeEvent');
  ChangeListener = $J.load('javax.swing.event.ChangeListener');
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
});
