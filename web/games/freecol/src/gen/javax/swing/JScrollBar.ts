// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JScrollBar.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, JObject } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';

let Adjustable, Dimension, AdjustmentEvent, AdjustmentListener, AccessibleContext, AccessibleState, BoundedRangeModel, DefaultBoundedRangeModel, UIManager;

/**
 * An implementation of a scrollbar. The user positions the knob in the
 * scrollbar to determine the contents of the viewing area. The
 * program typically adjusts the display so that the end of the
 * scrollbar represents the end of the displayable contents, or 100%
 * of the contents. The start of the scrollbar is the beginning of the
 * displayable contents, or 0%. The position of the knob within
 * those bounds then translates to the corresponding percentage of
 * the displayable contents.
 * <p>
 * Typically, as the position of the knob in the scrollbar changes
 * a corresponding change is made to the position of the JViewport on
 * the underlying view, changing the contents of the JViewport.
 * <p>
 * <strong>Warning:</strong> Swing is not thread safe. For more
 * information see <a
 * href="package-summary.html#threading">Swing's Threading
 * Policy</a>.
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
 * @see JScrollPane
 *
 * @author David Kloba
 * @since 1.2
 */
export class JScrollBar extends JComponent {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'ScrollBarUI';
  /**
   * All changes from the model are treated as though the user moved
   * the scrollbar knob.
   */
  fwdAdjustmentEvents: ChangeListener = null;
  /**
   * The model that represents the scrollbar's minimum, maximum, extent
   * (aka "visibleAmount") and current value.
   * @see #setModel
   */
  model: BoundedRangeModel = null;
  /**
   * Orientation of this scrollBar.
   *
   * @see #setOrientation
   */
  orientation: number = 0;
  /**
   * Stores the amount by which the value of the scrollbar is changed
   * upon a unit up/down request.
   *
   * @see #setUnitIncrement
   */
  unitIncrement: number = 0;
  /**
   * Stores the amount by which the value of the scrollbar is changed
   * upon a block (usually "page") up/down request.
   *
   * @see #setBlockIncrement
   */
  blockIncrement: number = 0;
  $init_JScrollBar() {
    this.fwdAdjustmentEvents = $J.fn(new JScrollBar$ModelListener().$o(this)._JScrollBar$ModelListener(), 'stateChanged');
  }
  /**
   * Creates a scrollbar with the specified orientation,
   * value, extent, minimum, and maximum.
   * The "extent" is the size of the viewable area. It is also known
   * as the "visible amount".
   * <p>
   * Note: Use <code>setBlockIncrement</code> to set the block
   * increment to a size slightly smaller than the view's extent.
   * That way, when the user jumps the knob to an adjacent position,
   * one or two lines of the original contents remain in view.
   *
   * @throws IllegalArgumentException if orientation is not one of VERTICAL, HORIZONTAL
   *
   * @see #setOrientation
   * @see #setValue
   * @see #setVisibleAmount
   * @see #setMinimum
   * @see #setMaximum
   *
   * @param orientation an orientation of the {@code JScrollBar}
   * @param value an int giving the current value
   * @param extent an int giving the amount by which the value can "jump"
   * @param min an int giving the minimum value
   * @param max an int giving the maximum value
   */
  _JScrollBar$int$int$int$int$int(orientation: number, value: number, extent: number, min: number, max: number): this {
    this._JComponent();
    this.$init_JScrollBar();
    this.checkOrientation(orientation);
    this.unitIncrement = 1;
    this.blockIncrement = (extent === 0) ? 1 : extent;
    this.orientation = orientation;
    this.model = new DefaultBoundedRangeModel()._DefaultBoundedRangeModel$int$int$int$int(value, extent, min, max);
    this.model.addChangeListener(this.fwdAdjustmentEvents);
    this.setRequestFocusEnabled(false);
    this.updateUI();
    return this;
  }
  /**
   * Creates a scrollbar with the specified orientation
   * and the following initial values:
   * <pre>
   * minimum = 0
   * maximum = 100
   * value = 0
   * extent = 10
   * </pre>
   *
   * @param orientation an orientation of the {@code JScrollBar}
   */
  _JScrollBar$int(orientation: number): this {
    this._JScrollBar$int$int$int$int$int(orientation, 0, 10, 0, 100);
    return this;
  }
  checkOrientation(orientation: number): void {
    switch (orientation) {
      case Adjustable.VERTICAL:
      case Adjustable.HORIZONTAL:
        break;
      default:
        throw new IllegalArgumentException('orientation must be one of: VERTICAL, HORIZONTAL');
    }
  }
  /**
   * Sets the {@literal L&F} object that renders this component.
   *
   * @param ui  the <code>ScrollBarUI</code> {@literal L&F} object
   * @see UIDefaults#getUI
   * @since 1.4
   */
  setUI$ScrollBarUI(ui: ScrollBarUI): void {
    super.setUI$ComponentUI(ui);
  }
  /**
   * Overrides <code>JComponent.updateUI</code>.
   * @see JComponent#updateUI
   */
  updateUI(): void {
    this.setUI$ScrollBarUI(UIManager.getUI(this));
  }
  /**
   * Returns the name of the LookAndFeel class for this component.
   *
   * @return the string "ScrollBarUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JScrollBar.uiClassID;
  }
  /**
   * Returns the component's orientation (horizontal or vertical).
   *
   * @return VERTICAL or HORIZONTAL
   * @see #setOrientation
   * @see java.awt.Adjustable#getOrientation
   */
  getOrientation(): number {
    return this.orientation;
  }
  /**
   * Returns data model that handles the scrollbar's four
   * fundamental properties: minimum, maximum, value, extent.
   *
   * @return the data model
   *
   * @see #setModel
   */
  getModel(): BoundedRangeModel {
    return this.model;
  }
  /**
   * Returns the amount to change the scrollbar's value by,
   * given a unit up/down request.  A ScrollBarUI implementation
   * typically calls this method when the user clicks on a scrollbar
   * up/down arrow and uses the result to update the scrollbar's
   * value.   Subclasses may override this method to compute
   * a value, e.g. the change required to scroll one
   * (variable height) line of text or one row in a table.
   * <p>
   * The JScrollPane component creates scrollbars (by default)
   * that override this method and delegate to the viewports
   * Scrollable view, if it has one.  The Scrollable interface
   * provides a more specialized version of this method.
   * <p>
   * Some look and feel implementations that provide custom scrolling
   * behavior ignore this property.
   *
   * @param direction is -1 or 1 for up/down respectively
   * @return the value of the unitIncrement property
   * @see #setUnitIncrement
   * @see #setValue
   * @see Scrollable#getScrollableUnitIncrement
   */
  getUnitIncrement$int(direction: number): number {
    return this.unitIncrement;
  }
  /**
   * Sets the unitIncrement property.
   * <p>
   * Note, that if the argument is equal to the value of Integer.MIN_VALUE,
   * then most look and feel implementations will not provide scrolling
   * to the right/down.
   * <p>
   * Some look and feel implementations that provide custom scrolling
   * behavior ignore this property.
   *
   * @see #getUnitIncrement
   */
  setUnitIncrement(unitIncrement: number): void {
    let oldValue = this.unitIncrement;
    this.unitIncrement = unitIncrement;
    this.firePropertyChange$String$int$int('unitIncrement', oldValue, unitIncrement);
  }
  /**
   * Returns the amount to change the scrollbar's value by,
   * given a block (usually "page") up/down request.  A ScrollBarUI
   * implementation typically calls this method when the user clicks
   * outside the scrollbar "knob" to scroll up or down by a large amount.
   * Subclasses may override this method to compute a
   * value, e.g. the change required to scroll one paragraph
   * in a text document.
   * <p>
   * The JScrollPane component creates scrollbars (by default)
   * that override this method and delegate to the viewports
   * Scrollable view, if it has one.  The Scrollable interface
   * provides a more specialized version of this method.
   * <p>
   * Some look and feel implementations that provide custom scrolling
   * behavior ignore this property.
   *
   * @param direction is -1 or 1 for up/down respectively
   * @return the value of the blockIncrement property
   * @see #setBlockIncrement
   * @see #setValue
   * @see Scrollable#getScrollableBlockIncrement
   */
  getBlockIncrement$int(direction: number): number {
    return this.blockIncrement;
  }
  /**
   * Returns the scrollbar's value.
   * @return the model's value property
   * @see #setValue
   */
  getValue(): number {
    return this.getModel().getValue();
  }
  /**
   * Sets the scrollbar's value.  This method just forwards the value
   * to the model.
   *
   * @see #getValue
   * @see BoundedRangeModel#setValue
   */
  setValue(value: number): void {
    let m = this.getModel();
    let oldValue = m.getValue();
    m.setValue(value);
    if (this.accessibleContext != null) {
      this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_VALUE_PROPERTY, oldValue, m.getValue());
    }
  }
  /**
   * Returns the scrollbar's extent, aka its "visibleAmount".  In many
   * scrollbar look and feel implementations the size of the
   * scrollbar "knob" or "thumb" is proportional to the extent.
   *
   * @return the value of the model's extent property
   * @see #setVisibleAmount
   */
  getVisibleAmount(): number {
    return this.getModel().getExtent();
  }
  /**
   * Returns the minimum value supported by the scrollbar
   * (usually zero).
   *
   * @return the value of the model's minimum property
   * @see #setMinimum
   */
  getMinimum(): number {
    return this.getModel().getMinimum();
  }
  /**
   * The maximum value of the scrollbar is maximum - extent.
   *
   * @return the value of the model's maximum property
   * @see #setMaximum
   */
  getMaximum(): number {
    return this.getModel().getMaximum();
  }
  /**
   * True if the scrollbar knob is being dragged.
   *
   * @return the value of the model's valueIsAdjusting property
   * @see #setValueIsAdjusting
   */
  getValueIsAdjusting(): boolean {
    return this.getModel().getValueIsAdjusting();
  }
  /**
   * Sets the model's valueIsAdjusting property.  Scrollbar look and
   * feel implementations should set this property to true when
   * a knob drag begins, and to false when the drag ends.  The
   * scrollbar model will not generate ChangeEvents while
   * valueIsAdjusting is true.
   *
   * @param b {@code true} if the upcoming changes to the value property are part of a series
   *
   * @see #getValueIsAdjusting
   * @see BoundedRangeModel#setValueIsAdjusting
   */
  setValueIsAdjusting(b: boolean): void {
    let m = this.getModel();
    let oldValue = m.getValueIsAdjusting();
    m.setValueIsAdjusting(b);
    if ((oldValue !== b) && (this.accessibleContext != null)) {
      this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, ((oldValue) ? AccessibleState.BUSY : null), ((b) ? AccessibleState.BUSY : null));
    }
  }
  /**
   * Sets the four BoundedRangeModel properties after forcing
   * the arguments to obey the usual constraints:
   * <pre>
   * minimum &le; value &le; value+extent &le; maximum
   * </pre>
   *
   * @param newValue an int giving the current value
   * @param newExtent an int giving the amount by which the value can "jump"
   * @param newMin an int giving the minimum value
   * @param newMax an int giving the maximum value
   *
   * @see BoundedRangeModel#setRangeProperties
   * @see #setValue
   * @see #setVisibleAmount
   * @see #setMinimum
   * @see #setMaximum
   */
  setValues(newValue: number, newExtent: number, newMin: number, newMax: number): void {
    let m = this.getModel();
    let oldValue = m.getValue();
    m.setRangeProperties(newValue, newExtent, newMin, newMax, m.getValueIsAdjusting());
    if (this.accessibleContext != null) {
      this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_VALUE_PROPERTY, oldValue, m.getValue());
    }
  }
  /**
   * Notify listeners that the scrollbar's model has changed.
   *
   * @see #addAdjustmentListener
   * @see EventListenerList
   */
  fireAdjustmentValueChanged$int$int$int$boolean$JScrollBar(id: number, type$: number, value: number, isAdjusting: boolean): void {
    let listeners = this.listenerList.getListenerList();
    let e = null;
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(AdjustmentListener)) {
        if (e == null) {
          e = new AdjustmentEvent()._AdjustmentEvent$Adjustable$int$int$int$boolean(this, id, type$, value, isAdjusting);
        }
        (listeners[(i + 1) | 0]).adjustmentValueChanged(e);
      }
    }
  }
  /**
   * The scrollbar is flexible along it's scrolling axis and
   * rigid along the other axis.
   */
  getMinimumSize$(): Dimension {
    let pref = this.getPreferredSize$();
    if (this.orientation === Adjustable.VERTICAL) {
      return new Dimension()._Dimension$int$int(pref.width_, 5);
    } else {
      return new Dimension()._Dimension$int$int(5, pref.height_);
    }
  }
  /**
   * The scrollbar is flexible along it's scrolling axis and
   * rigid along the other axis.
   */
  getMaximumSize(): Dimension {
    let pref = this.getPreferredSize$();
    if (this.getOrientation() === Adjustable.VERTICAL) {
      return new Dimension()._Dimension$int$int(pref.width_, 32767);
    } else {
      return new Dimension()._Dimension$int$int(32767, pref.height_);
    }
  }
  /**
   * Enables the component so that the knob position can be changed.
   * When the disabled, the knob position cannot be changed.
   *
   * @param x a boolean value, where true enables the component and
   *          false disables it
   */
  setEnabled(x: boolean): void {
    super.setEnabled(x);
    let children = this.getComponents();
    for (let child of children) {
      child.setEnabled(x);
    }
  }
  /**
   * Returns a string representation of this JScrollBar. This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this JScrollBar.
   */
  paramString(): string {
    let orientationString = (this.orientation === Adjustable.HORIZONTAL ? 'HORIZONTAL' : 'VERTICAL');
    return super.paramString() + ',blockIncrement=' + this.blockIncrement + ',orientation=' + orientationString + ',unitIncrement=' + this.unitIncrement;
  }
  /**
   * Gets the AccessibleContext associated with this JScrollBar.
   * For JScrollBar, the AccessibleContext takes the form of an
   * AccessibleJScrollBar.
   * A new AccessibleJScrollBar instance is created if necessary.
   *
   * @return an AccessibleJScrollBar that serves as the
   *         AccessibleContext of this JScrollBar
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JScrollBar$AccessibleJScrollBar().$o(this)._JScrollBar$AccessibleJScrollBar();
    }
    return this.accessibleContext;
  }
}

/**
 * This class listens to ChangeEvents on the model and forwards
 * AdjustmentEvents for the sake of backwards compatibility.
 * Unfortunately there's no way to determine the proper
 * type of the AdjustmentEvent as all updates to the model's
 * value are considered equivalent.
 */
export class JScrollBar$ModelListener extends JObject {
  _JScrollBar$ModelListener(): this {
    return this;
  }
  stateChanged(e: ChangeEvent): void {
    let obj = e.getSource();
    if ($J.isa(obj, BoundedRangeModel)) {
      let id = AdjustmentEvent.ADJUSTMENT_VALUE_CHANGED;
      let type$ = AdjustmentEvent.TRACK;
      let model = obj;
      let value = model.getValue();
      let isAdjusting = model.getValueIsAdjusting();
      this.$outer.fireAdjustmentValueChanged$int$int$int$boolean$JScrollBar(id, type$, value, isAdjusting);
    }
  }
}

/**
 * This class implements accessibility support for the
 * <code>JScrollBar</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to scroll bar user-interface
 * elements.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 */
export class JScrollBar$AccessibleJScrollBar extends JComponent$AccessibleJComponent {
  /**
   * Constructs an {@code AccessibleJScrollBar}.
   */
  _JScrollBar$AccessibleJScrollBar(): this {
    this._JComponent$AccessibleJComponent();
    return this;
  }
}

$J.define(JScrollBar, 'javax.swing.JScrollBar', { kind: 'class', ifaces: ['java.awt.Adjustable', 'javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { '': '_JScrollBar$', 'int': '_JScrollBar$int', 'int,int,int,int,int': '_JScrollBar$int$int$int$int$int' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JScrollBar', 'getMinimumSize()': 'getMinimumSize$', 'fireAdjustmentValueChanged(int,int,int,boolean)': 'fireAdjustmentValueChanged$int$int$int$boolean$JScrollBar', 'fireAdjustmentValueChanged(int,int,int)': 'fireAdjustmentValueChanged$int$int$int', 'getBlockIncrement()': 'getBlockIncrement$', 'getUnitIncrement()': 'getUnitIncrement$', 'getBlockIncrement(int)': 'getBlockIncrement$int', 'getUnitIncrement(int)': 'getUnitIncrement$int', 'setUI(javax.swing.plaf.ScrollBarUI)': 'setUI$ScrollBarUI' } });
$J.define(JScrollBar$ModelListener, 'javax.swing.JScrollBar$ModelListener', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_JScrollBar$ModelListener' }, inner: true });
$J.define(JScrollBar$AccessibleJScrollBar, 'javax.swing.JScrollBar$AccessibleJScrollBar', { kind: 'class', ifaces: ['javax.accessibility.AccessibleValue'], sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JScrollBar$AccessibleJScrollBar' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$', 'getAccessibleStateSet()': 'getAccessibleStateSet$' }, inner: true });
$J.module(() => {
  Adjustable = $J.load('java.awt.Adjustable');
  Dimension = $J.load('java.awt.Dimension');
  AdjustmentEvent = $J.load('java.awt.event.AdjustmentEvent');
  AdjustmentListener = $J.load('java.awt.event.AdjustmentListener');
  AccessibleContext = $J.load('javax.accessibility.AccessibleContext');
  AccessibleState = $J.load('javax.accessibility.AccessibleState');
  BoundedRangeModel = $J.load('javax.swing.BoundedRangeModel');
  DefaultBoundedRangeModel = $J.load('javax.swing.DefaultBoundedRangeModel');
  UIManager = $J.load('javax.swing.UIManager');
});
