// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JSplitPane.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, JString } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';

let UIManager;

/**
 * <code>JSplitPane</code> is used to divide two (and only two)
 * <code>Component</code>s. The two <code>Component</code>s
 * are graphically divided based on the look and feel
 * implementation, and the two <code>Component</code>s can then be
 * interactively resized by the user.
 * Information on using <code>JSplitPane</code> is in
 * <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/splitpane.html">How to Use Split Panes</a> in
 * <em>The Java Tutorial</em>.
 * <p>
 * The two <code>Component</code>s in a split pane can be aligned
 * left to right using
 * <code>JSplitPane.HORIZONTAL_SPLIT</code>, or top to bottom using
 * <code>JSplitPane.VERTICAL_SPLIT</code>.
 * The preferred way to change the size of the <code>Component</code>s
 * is to invoke
 * <code>setDividerLocation</code> where <code>location</code> is either
 * the new x or y position, depending on the orientation of the
 * <code>JSplitPane</code>.
 * <p>
 * To resize the <code>Component</code>s to their preferred sizes invoke
 * <code>resetToPreferredSizes</code>.
 * <p>
 * When the user is resizing the <code>Component</code>s the minimum
 * size of the <code>Components</code> is used to determine the
 * maximum/minimum position the <code>Component</code>s
 * can be set to. If the minimum size of the two
 * components is greater than the size of the split pane the divider
 * will not allow you to resize it. To alter the minimum size of a
 * <code>JComponent</code>, see {@link JComponent#setMinimumSize}.
 * <p>
 * When the user resizes the split pane the new space is distributed between
 * the two components based on the <code>resizeWeight</code> property.
 * A value of 0,
 * the default, indicates the right/bottom component gets all the space,
 * where as a value of 1 indicates the left/top component gets all the space.
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
 * @see #setDividerLocation
 * @see #resetToPreferredSizes
 *
 * @author Scott Violet
 * @since 1.2
 */
export class JSplitPane extends JComponent {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'SplitPaneUI';
  /**
   * Vertical split indicates the <code>Component</code>s are
   * split along the y axis.  For example the two
   * <code>Component</code>s will be split one on top of the other.
   */
  static readonly VERTICAL_SPLIT: number = 0;
  /**
   * Horizontal split indicates the <code>Component</code>s are
   * split along the x axis.  For example the two
   * <code>Component</code>s will be split one to the left of the
   * other.
   */
  static readonly HORIZONTAL_SPLIT: number = 1;
  /**
   * Used to add a <code>Component</code> to the left of the other
   * <code>Component</code>.
   */
  static readonly LEFT: string = 'left';
  /**
   * Used to add a <code>Component</code> to the right of the other
   * <code>Component</code>.
   */
  static readonly RIGHT: string = 'right';
  /**
   * Used to add a <code>Component</code> above the other
   * <code>Component</code>.
   */
  static readonly TOP: string = 'top';
  /**
   * Used to add a <code>Component</code> below the other
   * <code>Component</code>.
   */
  static readonly BOTTOM: string = 'bottom';
  /**
   * Used to add a <code>Component</code> that will represent the divider.
   */
  static readonly DIVIDER: string = 'divider';
  /**
   * Bound property name for orientation (horizontal or vertical).
   */
  static readonly ORIENTATION_PROPERTY: string = 'orientation';
  /**
   * Bound property name for continuousLayout.
   */
  static readonly CONTINUOUS_LAYOUT_PROPERTY: string = 'continuousLayout';
  /**
   * Bound property name for border.
   */
  static readonly DIVIDER_SIZE_PROPERTY: string = 'dividerSize';
  /**
   * Bound property for oneTouchExpandable.
   */
  static readonly ONE_TOUCH_EXPANDABLE_PROPERTY: string = 'oneTouchExpandable';
  /**
   * Bound property for lastLocation.
   */
  static readonly LAST_DIVIDER_LOCATION_PROPERTY: string = 'lastDividerLocation';
  /**
   * Bound property for the dividerLocation.
   * @since 1.3
   */
  static readonly DIVIDER_LOCATION_PROPERTY: string = 'dividerLocation';
  /**
   * Bound property for weight.
   * @since 1.3
   */
  static readonly RESIZE_WEIGHT_PROPERTY: string = 'resizeWeight';
  /**
   * How the views are split.
   */
  orientation: number = 0;
  /**
   * Whether or not the views are continuously redisplayed while
   * resizing.
   */
  continuousLayout: boolean = false;
  /**
   * The left or top component.
   */
  leftComponent: Component = null;
  /**
   * The right or bottom component.
   */
  rightComponent: Component = null;
  /**
   * Size of the divider.
   */
  dividerSize: number = 0;
  dividerSizeSet: boolean = false;
  /**
   * Is a little widget provided to quickly expand/collapse the
   * split pane?
   */
  oneTouchExpandable: boolean = false;
  oneTouchExpandableSet: boolean = false;
  /**
   * Previous location of the split pane.
   */
  lastDividerLocation: number = 0;
  /**
   * How to distribute extra space.
   */
  resizeWeight: number = 0;
  /**
   * Location of the divider, at least the value that was set, the UI may
   * have a different value.
   */
  dividerLocation: number = 0;
  $init_JSplitPane() {
    this.dividerSizeSet = false;
  }
  /**
   * Creates a new <code>JSplitPane</code> with the specified
   * orientation and the specified components.
   *
   * @param newOrientation  <code>JSplitPane.HORIZONTAL_SPLIT</code> or
   *                        <code>JSplitPane.VERTICAL_SPLIT</code>
   * @param newLeftComponent the <code>Component</code> that will
   *          appear on the left
   *          of a horizontally-split pane, or at the top of a
   *          vertically-split pane
   * @param newRightComponent the <code>Component</code> that will
   *          appear on the right
   *          of a horizontally-split pane, or at the bottom of a
   *          vertically-split pane
   * @throws IllegalArgumentException if <code>orientation</code>
   *          is not one of: HORIZONTAL_SPLIT or VERTICAL_SPLIT
   */
  _JSplitPane$int$Component$Component(newOrientation: number, newLeftComponent: Component, newRightComponent: Component): this {
    this._JSplitPane$int$boolean$Component$Component(newOrientation, UIManager.getBoolean$Object('SplitPane.continuousLayout'), newLeftComponent, newRightComponent);
    return this;
  }
  /**
   * Creates a new <code>JSplitPane</code> with the specified
   * orientation and
   * redrawing style, and with the specified components.
   *
   * @param newOrientation  <code>JSplitPane.HORIZONTAL_SPLIT</code> or
   *                        <code>JSplitPane.VERTICAL_SPLIT</code>
   * @param newContinuousLayout  a boolean, true for the components to
   *        redraw continuously as the divider changes position, false
   *        to wait until the divider position stops changing to redraw
   * @param newLeftComponent the <code>Component</code> that will
   *          appear on the left
   *          of a horizontally-split pane, or at the top of a
   *          vertically-split pane
   * @param newRightComponent the <code>Component</code> that will
   *          appear on the right
   *          of a horizontally-split pane, or at the bottom of a
   *          vertically-split pane
   * @throws IllegalArgumentException if <code>orientation</code>
   *          is not one of HORIZONTAL_SPLIT or VERTICAL_SPLIT
   */
  _JSplitPane$int$boolean$Component$Component(newOrientation: number, newContinuousLayout: boolean, newLeftComponent: Component, newRightComponent: Component): this {
    this._JComponent();
    this.$init_JSplitPane();
    this.dividerLocation = -1;
    this.setLayout(null);
    this.setUIProperty('opaque', true);
    this.orientation = newOrientation;
    if (this.orientation !== JSplitPane.HORIZONTAL_SPLIT && this.orientation !== JSplitPane.VERTICAL_SPLIT) {
      throw new IllegalArgumentException('cannot create JSplitPane, orientation must be one of JSplitPane.HORIZONTAL_SPLIT or JSplitPane.VERTICAL_SPLIT');
    }
    this.continuousLayout = newContinuousLayout;
    if (newLeftComponent != null) {
      this.setLeftComponent(newLeftComponent);
    }
    if (newRightComponent != null) {
      this.setRightComponent(newRightComponent);
    }
    this.updateUI();
    return this;
  }
  /**
   * Sets the L&amp;F object that renders this component.
   *
   * @param ui  the <code>SplitPaneUI</code> L&amp;F object
   * @see UIDefaults#getUI
   */
  setUI$SplitPaneUI(ui: SplitPaneUI): void {
    if (this.ui !== ui) {
      super.setUI$ComponentUI(ui);
      this.revalidate();
    }
  }
  /**
   * Returns the <code>SplitPaneUI</code> that is providing the
   * current look and feel.
   *
   * @return the <code>SplitPaneUI</code> object that renders this component
   */
  getUI(): SplitPaneUI {
    return this.ui;
  }
  /**
   * Notification from the <code>UIManager</code> that the L&amp;F has changed.
   * Replaces the current UI object with the latest version from the
   * <code>UIManager</code>.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    this.setUI$SplitPaneUI(UIManager.getUI(this));
    this.revalidate();
  }
  /**
   * Returns the name of the L&amp;F class that renders this component.
   *
   * @return the string "SplitPaneUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JSplitPane.uiClassID;
  }
  /**
   * Sets the size of the divider.
   * Divider sizes {@code newSize < 0} are ignored.
   *
   * @param newSize an integer giving the size of the divider in pixels
   */
  setDividerSize(newSize: number): void {
    if (newSize < 0) {
      return;
    }
    let oldSize = this.dividerSize;
    this.dividerSizeSet = true;
    if (oldSize !== newSize) {
      this.dividerSize = newSize;
      this.firePropertyChange$String$int$int(JSplitPane.DIVIDER_SIZE_PROPERTY, oldSize, newSize);
    }
  }
  /**
   * Returns the size of the divider.
   *
   * @return an integer giving the size of the divider in pixels
   */
  getDividerSize(): number {
    return this.dividerSize;
  }
  /**
   * Sets the component to the left (or above) the divider.
   *
   * @param comp the <code>Component</code> to display in that position
   */
  setLeftComponent(comp: Component): void {
    if (comp == null) {
      if (this.leftComponent != null) {
        this.remove$Component(this.leftComponent);
        this.leftComponent = null;
      }
    } else {
      this.add$Component$Object(comp, JSplitPane.LEFT);
    }
  }
  /**
   * Returns the component to the left (or above) the divider.
   *
   * @return the <code>Component</code> displayed in that position
   */
  getLeftComponent(): Component {
    return this.leftComponent;
  }
  /**
   * Sets the component to the right (or below) the divider.
   *
   * @param comp the <code>Component</code> to display in that position
   */
  setRightComponent(comp: Component): void {
    if (comp == null) {
      if (this.rightComponent != null) {
        this.remove$Component(this.rightComponent);
        this.rightComponent = null;
      }
    } else {
      this.add$Component$Object(comp, JSplitPane.RIGHT);
    }
  }
  /**
   * Returns the component to the right (or below) the divider.
   *
   * @return the <code>Component</code> displayed in that position
   */
  getRightComponent(): Component {
    return this.rightComponent;
  }
  /**
   * Sets the value of the <code>oneTouchExpandable</code> property,
   * which must be <code>true</code> for the
   * <code>JSplitPane</code> to provide a UI widget
   * on the divider to quickly expand/collapse the divider.
   * The default value of this property is <code>false</code>.
   * Some look and feels might not support one-touch expanding;
   * they will ignore this property.
   *
   * @param newValue <code>true</code> to specify that the split pane should provide a
   *        collapse/expand widget
   *
   * @see #isOneTouchExpandable
   */
  setOneTouchExpandable(newValue: boolean): void {
    let oldValue = this.oneTouchExpandable;
    this.oneTouchExpandable = newValue;
    this.oneTouchExpandableSet = true;
    this.firePropertyChange$String$boolean$boolean(JSplitPane.ONE_TOUCH_EXPANDABLE_PROPERTY, oldValue, newValue);
    this.repaint$();
  }
  /**
   * Gets the <code>oneTouchExpandable</code> property.
   *
   * @return the value of the <code>oneTouchExpandable</code> property
   * @see #setOneTouchExpandable
   */
  isOneTouchExpandable(): boolean {
    return this.oneTouchExpandable;
  }
  /**
   * Sets the last location the divider was at to
   * <code>newLastLocation</code>.
   *
   * @param newLastLocation an integer specifying the last divider location
   *        in pixels, from the left (or upper) edge of the pane to the
   *        left (or upper) edge of the divider
   */
  setLastDividerLocation(newLastLocation: number): void {
    let oldLocation = this.lastDividerLocation;
    this.lastDividerLocation = newLastLocation;
    this.firePropertyChange$String$int$int(JSplitPane.LAST_DIVIDER_LOCATION_PROPERTY, oldLocation, newLastLocation);
  }
  /**
   * Returns the last location the divider was at.
   *
   * @return an integer specifying the last divider location as a count
   *       of pixels from the left (or upper) edge of the pane to the
   *       left (or upper) edge of the divider
   */
  getLastDividerLocation(): number {
    return this.lastDividerLocation;
  }
  /**
   * Returns the orientation.
   *
   * @return an integer giving the orientation
   * @see #setOrientation
   */
  getOrientation(): number {
    return this.orientation;
  }
  /**
   * Gets the <code>continuousLayout</code> property.
   *
   * @return the value of the <code>continuousLayout</code> property
   * @see #setContinuousLayout
   */
  isContinuousLayout(): boolean {
    return this.continuousLayout;
  }
  /**
   * Returns the number that determines how extra space is distributed.
   * @return how extra space is to be distributed on a resize of the
   *         split pane
   * @since 1.3
   */
  getResizeWeight(): number {
    return this.resizeWeight;
  }
  /**
   * Sets the location of the divider. This is passed off to the
   * look and feel implementation, and then listeners are notified. A value
   * less than 0 implies the divider should be reset to a value that
   * attempts to honor the preferred size of the left/top component.
   * After notifying the listeners, the last divider location is updated,
   * via <code>setLastDividerLocation</code>.
   *
   * @param location an int specifying a UI-specific value (typically a
   *        pixel count)
   */
  setDividerLocation$int(location: number): void {
    let oldValue = this.dividerLocation;
    this.dividerLocation = location;
    let ui = this.getUI();
    if (ui != null) {
      ui.setDividerLocation(this, location);
    }
    this.firePropertyChange$String$int$int(JSplitPane.DIVIDER_LOCATION_PROPERTY, oldValue, location);
    this.setLastDividerLocation(oldValue);
  }
  /**
   * Returns the last value passed to <code>setDividerLocation</code>.
   * The value returned from this method may differ from the actual
   * divider location (if <code>setDividerLocation</code> was passed a
   * value bigger than the current size).
   *
   * @return an integer specifying the location of the divider
   */
  getDividerLocation(): number {
    return this.dividerLocation;
  }
  /**
   * Returns the maximum location of the divider from the look and feel
   * implementation.
   *
   * @return an integer specifying a UI-specific value for the maximum
   *          location (typically a pixel count); or -1 if the  UI is
   *          <code>null</code>
   */
  getMaximumDividerLocation(): number {
    let ui = this.getUI();
    if (ui != null) {
      return ui.getMaximumDividerLocation(this);
    }
    return -1;
  }
  /**
   * Removes the child component, <code>component</code> from the
   * pane. Resets the <code>leftComponent</code> or
   * <code>rightComponent</code> instance variable, as necessary.
   *
   * @param component the <code>Component</code> to remove
   */
  remove$Component(component: Component): void {
    if (component === this.leftComponent) {
      this.leftComponent = null;
    } else if (component === this.rightComponent) {
      this.rightComponent = null;
    }
    super.remove$Component(component);
    this.revalidate();
    this.repaint$();
  }
  /**
   * Removes the <code>Component</code> at the specified index.
   * Updates the <code>leftComponent</code> and <code>rightComponent</code>
   * instance variables as necessary, and then messages super.
   *
   * @param index an integer specifying the component to remove, where
   *        1 specifies the left/top component and 2 specifies the
   *        bottom/right component
   */
  remove$int(index: number): void {
    let comp = this.getComponent$int(index);
    if (comp === this.leftComponent) {
      this.leftComponent = null;
    } else if (comp === this.rightComponent) {
      this.rightComponent = null;
    }
    super.remove$int(index);
    this.revalidate();
    this.repaint$();
  }
  /**
   * Removes all the child components from the split pane. Resets the
   * <code>leftComonent</code> and <code>rightComponent</code>
   * instance variables.
   */
  removeAll(): void {
    this.leftComponent = this.rightComponent = null;
    super.removeAll();
    this.revalidate();
    this.repaint$();
  }
  /**
   * Returns true, so that calls to <code>revalidate</code>
   * on any descendant of this <code>JSplitPane</code>
   * will cause a request to be queued that
   * will validate the <code>JSplitPane</code> and all its descendants.
   *
   * @return true
   * @see JComponent#revalidate
   * @see java.awt.Container#isValidateRoot
   */
  isValidateRoot$(): boolean {
    return true;
  }
  /**
   * Adds the specified component to this split pane.
   * If <code>constraints</code> identifies the left/top or
   * right/bottom child component, and a component with that identifier
   * was previously added, it will be removed and then <code>comp</code>
   * will be added in its place. If <code>constraints</code> is not
   * one of the known identifiers the layout manager may throw an
   * <code>IllegalArgumentException</code>.
   * <p>
   * The possible constraints objects (Strings) are:
   * <ul>
   * <li>JSplitPane.TOP
   * <li>JSplitPane.LEFT
   * <li>JSplitPane.BOTTOM
   * <li>JSplitPane.RIGHT
   * </ul>
   * If the <code>constraints</code> object is <code>null</code>,
   * the component is added in the
   * first available position (left/top if open, else right/bottom).
   *
   * @param comp        the component to add
   * @param constraints an <code>Object</code> specifying the
   *                    layout constraints
   *                    (position) for this component
   * @param index       an integer specifying the index in the container's
   *                    list.
   * @throws IllegalArgumentException  if the <code>constraints</code>
   *          object does not match an existing component
   * @see java.awt.Container#addImpl(Component, Object, int)
   */
  addImpl(comp: Component, constraints: any, index: number): void {
    let toRemove: Component;
    if (constraints != null && !($J.isa(constraints, JString))) {
      throw new IllegalArgumentException('cannot add to layout: constraint must be a string (or null)');
    }
    if (constraints == null) {
      if (this.getLeftComponent() == null) {
        constraints = JSplitPane.LEFT;
      } else if (this.getRightComponent() == null) {
        constraints = JSplitPane.RIGHT;
      }
    }
    if (constraints != null && ($J.equals(constraints, JSplitPane.LEFT) || $J.equals(constraints, JSplitPane.TOP))) {
      toRemove = this.getLeftComponent();
      if (toRemove != null) {
        this.remove$Component(toRemove);
      }
      this.leftComponent = comp;
      index = -1;
    } else if (constraints != null && ($J.equals(constraints, JSplitPane.RIGHT) || $J.equals(constraints, JSplitPane.BOTTOM))) {
      toRemove = this.getRightComponent();
      if (toRemove != null) {
        this.remove$Component(toRemove);
      }
      this.rightComponent = comp;
      index = -1;
    } else if (constraints != null && $J.equals(constraints, JSplitPane.DIVIDER)) {
      index = -1;
    }
    super.addImpl(comp, constraints, index);
    this.revalidate();
    this.repaint$();
  }
  /**
   * Subclassed to message the UI with <code>finishedPaintingChildren</code>
   * after super has been messaged, as well as painting the border.
   *
   * @param g the <code>Graphics</code> context within which to paint
   */
  paintChildren(g: Graphics): void {
    super.paintChildren(g);
    let ui = this.getUI();
    if (ui != null) {
      let tempG = g.create$();
      ui.finishedPaintingChildren(this, tempG);
      tempG.dispose();
    }
  }
  setUIProperty(propertyName: string, value: any): void {
    if (propertyName === 'dividerSize') {
      if (!this.dividerSizeSet) {
        this.setDividerSize($J.d2i(+(value)));
        this.dividerSizeSet = false;
      }
    } else if (propertyName === 'oneTouchExpandable') {
      if (!this.oneTouchExpandableSet) {
        this.setOneTouchExpandable((value));
        this.oneTouchExpandableSet = false;
      }
    } else {
      super.setUIProperty(propertyName, value);
    }
  }
  /**
   * Returns a string representation of this <code>JSplitPane</code>.
   * This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JSplitPane</code>.
   */
  paramString(): string {
    let orientationString = (this.orientation === JSplitPane.HORIZONTAL_SPLIT ? 'HORIZONTAL_SPLIT' : 'VERTICAL_SPLIT');
    let continuousLayoutString = (this.continuousLayout ? 'true' : 'false');
    let oneTouchExpandableString = (this.oneTouchExpandable ? 'true' : 'false');
    return super.paramString() + ',continuousLayout=' + continuousLayoutString + ',dividerSize=' + this.dividerSize + ',lastDividerLocation=' + this.lastDividerLocation + ',oneTouchExpandable=' + oneTouchExpandableString + ',orientation=' + orientationString;
  }
  /**
   * Gets the AccessibleContext associated with this JSplitPane.
   * For split panes, the AccessibleContext takes the form of an
   * AccessibleJSplitPane.
   * A new AccessibleJSplitPane instance is created if necessary.
   *
   * @return an AccessibleJSplitPane that serves as the
   *         AccessibleContext of this JSplitPane
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JSplitPane$AccessibleJSplitPane().$o(this)._JSplitPane$AccessibleJSplitPane();
    }
    return this.accessibleContext;
  }
}

/**
 * This class implements accessibility support for the
 * <code>JSplitPane</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to split pane user-interface elements.
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
export class JSplitPane$AccessibleJSplitPane extends JComponent$AccessibleJComponent {
  /**
   * Constructs an {@code AccessibleJSplitPane}.
   */
  _JSplitPane$AccessibleJSplitPane(): this {
    this._JComponent$AccessibleJComponent();
    return this;
  }
}

$J.define(JSplitPane, 'javax.swing.JSplitPane', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { 'int,boolean,java.awt.Component,java.awt.Component': '_JSplitPane$int$boolean$Component$Component', 'int,java.awt.Component,java.awt.Component': '_JSplitPane$int$Component$Component', 'int,boolean': '_JSplitPane$int$boolean', 'int': '_JSplitPane$int', '': '_JSplitPane$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JSplitPane', 'isValidateRoot()': 'isValidateRoot$', 'remove(int)': 'remove$int', 'remove(java.awt.Component)': 'remove$Component', 'setDividerLocation(int)': 'setDividerLocation$int', 'setDividerLocation(double)': 'setDividerLocation$double', 'setUI(javax.swing.plaf.SplitPaneUI)': 'setUI$SplitPaneUI' } });
$J.define(JSplitPane$AccessibleJSplitPane, 'javax.swing.JSplitPane$AccessibleJSplitPane', { kind: 'class', ifaces: ['javax.accessibility.AccessibleValue'], sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JSplitPane$AccessibleJSplitPane' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$', 'getAccessibleStateSet()': 'getAccessibleStateSet$' }, inner: true });
$J.module(() => {
  UIManager = $J.load('javax.swing.UIManager');
});
