// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JLayeredPane.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Hashtable, Integer, SunToolkit } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';

let Color;

/**
 * <code>JLayeredPane</code> adds depth to a JFC/Swing container,
 * allowing components to overlap each other when needed.
 * An <code>Integer</code> object specifies each component's depth in the
 * container, where higher-numbered components sit &quot;on top&quot; of other
 * components.
 * For task-oriented documentation and examples of using layered panes see
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/layeredpane.html">How to Use a Layered Pane</a>,
 * a section in <em>The Java Tutorial</em>.
 *
 * <div style="float:right;text-align:center">
 *   <p><b>Example:</b>
 *   <p><img src="doc-files/JLayeredPane-1.gif"
 *       alt="The following text describes this image."
 *       width="269" height="264">
 * </div>
 * For convenience, <code>JLayeredPane</code> divides the depth-range
 * into several different layers. Putting a component into one of those
 * layers makes it easy to ensure that components overlap properly,
 * without having to worry about specifying numbers for specific depths:
 * <DL>
 *    <DT>DEFAULT_LAYER</DT>
 *         <DD>The standard layer, where most components go. This the bottommost
 *         layer.
 *    <DT>PALETTE_LAYER</DT>
 *         <DD>The palette layer sits over the default layer. Useful for floating
 *         toolbars and palettes, so they can be positioned above other components.
 *    <DT>MODAL_LAYER</DT>
 *         <DD>The layer used for modal dialogs. They will appear on top of any
 *         toolbars, palettes, or standard components in the container.
 *    <DT>POPUP_LAYER</DT>
 *         <DD>The popup layer displays above dialogs. That way, the popup windows
 *         associated with combo boxes, tooltips, and other help text will appear
 *         above the component, palette, or dialog that generated them.
 *    <DT>DRAG_LAYER</DT>
 *         <DD>When dragging a component, reassigning it to the drag layer ensures
 *         that it is positioned over every other component in the container. When
 *         finished dragging, it can be reassigned to its normal layer.
 * </DL>
 * The <code>JLayeredPane</code> methods <code>moveToFront(Component)</code>,
 * <code>moveToBack(Component)</code> and <code>setPosition</code> can be used
 * to reposition a component within its layer. The <code>setLayer</code> method
 * can also be used to change the component's current layer.
 *
 * <h2>Details</h2>
 * <code>JLayeredPane</code> manages its list of children like
 * <code>Container</code>, but allows for the definition of a several
 * layers within itself. Children in the same layer are managed exactly
 * like the normal <code>Container</code> object,
 * with the added feature that when children components overlap, children
 * in higher layers display above the children in lower layers.
 * <p>
 * Each layer is a distinct integer number. The layer attribute can be set
 * on a <code>Component</code> by passing an <code>Integer</code>
 * object during the add call.<br> For example:
 * <PRE>
 *     layeredPane.add(child, JLayeredPane.DEFAULT_LAYER);
 * or
 *     layeredPane.add(child, Integer.valueOf(10));
 * </PRE>
 * The layer attribute can also be set on a Component by calling<PRE>
 *     layeredPaneParent.setLayer(child, 10)</PRE>
 * on the <code>JLayeredPane</code> that is the parent of component. The layer
 * should be set <i>before</i> adding the child to the parent.
 * <p>
 * Higher number layers display above lower number layers. So, using
 * numbers for the layers and letters for individual components, a
 * representative list order would look like this:<PRE>
 *       5a, 5b, 5c, 2a, 2b, 2c, 1a </PRE>
 * where the leftmost components are closest to the top of the display.
 * <p>
 * A component can be moved to the top or bottom position within its
 * layer by calling <code>moveToFront</code> or <code>moveToBack</code>.
 * <p>
 * The position of a component within a layer can also be specified directly.
 * Valid positions range from 0 up to one less than the number of
 * components in that layer. A value of -1 indicates the bottommost
 * position. A value of 0 indicates the topmost position. Unlike layer
 * numbers, higher position values are <i>lower</i> in the display.
 * <blockquote>
 * <b>Note:</b> This sequence (defined by java.awt.Container) is the reverse
 * of the layer numbering sequence. Usually though, you will use <code>moveToFront</code>,
 * <code>moveToBack</code>, and <code>setLayer</code>.
 * </blockquote>
 * Here are some examples using the method add(Component, layer, position):
 * Calling add(5x, 5, -1) results in:<PRE>
 *       5a, 5b, 5c, 5x, 2a, 2b, 2c, 1a </PRE>
 *
 * Calling add(5z, 5, 2) results in:<PRE>
 *       5a, 5b, 5z, 5c, 5x, 2a, 2b, 2c, 1a </PRE>
 *
 * Calling add(3a, 3, 7) results in:<PRE>
 *       5a, 5b, 5z, 5c, 5x, 3a, 2a, 2b, 2c, 1a </PRE>
 *
 * Using normal paint/event mechanics results in 1a appearing at the bottom
 * and 5a being above all other components.
 * <p>
 * <b>Note:</b> that these layers are simply a logical construct and LayoutManagers
 * will affect all child components of this container without regard for
 * layer settings.
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
 * @author David Kloba
 * @since 1.2
 */
export class JLayeredPane extends JComponent {
  /**
   * Convenience object defining the Default layer. Equivalent to Integer.valueOf(0).
   */
  static DEFAULT_LAYER: number = null;
  /**
   * Convenience object defining the Palette layer. Equivalent to Integer.valueOf(100).
   */
  static PALETTE_LAYER: number = null;
  /**
   * Convenience object defining the Modal layer. Equivalent to Integer.valueOf(200).
   */
  static MODAL_LAYER: number = null;
  /**
   * Convenience object defining the Popup layer. Equivalent to Integer.valueOf(300).
   */
  static POPUP_LAYER: number = null;
  /**
   * Convenience object defining the Drag layer. Equivalent to Integer.valueOf(400).
   */
  static DRAG_LAYER: number = null;
  /**
   * Convenience object defining the Frame Content layer.
   * This layer is normally only use to position the contentPane and menuBar
   * components of JFrame.
   * Equivalent to Integer.valueOf(-30000).
   * @see JFrame
   */
  static FRAME_CONTENT_LAYER: number = null;
  /**
   * Bound property
   */
  static readonly LAYER_PROPERTY: string = 'layeredContainerLayer';
  componentToLayer: Hashtable<Component, number> = null;
  optimizedDrawingPossible: boolean = false;
  /**
   * Create a new JLayeredPane
   */
  _JLayeredPane(): this {
    this._JComponent();
    this.optimizedDrawingPossible = true;
    this.setLayout(null);
    return this;
  }
  validateOptimizedDrawing(): void {
    let layeredComponentFound = false;
    {
      let layer: number;
      for (let c of this.getComponents()) {
        layer = null;
        if (SunToolkit.isInstanceOf(c, 'javax.swing.JInternalFrame') || (c instanceof JComponent && (layer = (c).getClientProperty(JLayeredPane.LAYER_PROPERTY)) != null)) {
          if ($J.equals(JLayeredPane.FRAME_CONTENT_LAYER, layer)) {
            continue;
          }
          layeredComponentFound = true;
          break;
        }
      }
    }
    if (layeredComponentFound) {
      this.optimizedDrawingPossible = false;
    } else {
      this.optimizedDrawingPossible = true;
    }
  }
  addImpl(comp: Component, constraints: any, index: number): void {
    let layer: number;
    let pos: number;
    if ($J.isa(constraints, Integer)) {
      layer = (+(constraints));
      this.setLayer$Component$int(comp, layer);
    } else {
      layer = this.getLayer(comp);
    }
    pos = this.insertIndexForLayer$int$int(layer, index);
    super.addImpl(comp, constraints, pos);
    comp.validate();
    comp.repaint$();
    this.validateOptimizedDrawing();
  }
  /**
   * Remove the indexed component from this pane.
   * This is the absolute index, ignoring layers.
   *
   * @param index  an int specifying the component to remove
   * @see #getIndexOf
   */
  remove$int(index: number): void {
    let c = this.getComponent$int(index);
    super.remove$int(index);
    if (c != null && !(c instanceof JComponent)) {
      this.getComponentToLayer().remove(c);
    }
    this.validateOptimizedDrawing();
  }
  /**
   * Removes all the components from this container.
   *
   * @since 1.5
   */
  removeAll(): void {
    let children = this.getComponents();
    let cToL = this.getComponentToLayer();
    for (let counter = (children.length - 1) | 0; counter >= 0; counter--) {
      let c = children[counter];
      if (c != null && !(c instanceof JComponent)) {
        cToL.remove(c);
      }
    }
    super.removeAll();
  }
  /**
   * Returns false if components in the pane can overlap, which makes
   * optimized drawing impossible. Otherwise, returns true.
   *
   * @return false if components can overlap, else true
   * @see JComponent#isOptimizedDrawingEnabled
   */
  isOptimizedDrawingEnabled(): boolean {
    return this.optimizedDrawingPossible;
  }
  /**
   * Sets the layer property on a JComponent. This method does not cause
   * any side effects like setLayer() (painting, add/remove, etc).
   * Normally you should use the instance method setLayer(), in order to
   * get the desired side-effects (like repainting).
   *
   * @param c      the JComponent to move
   * @param layer  an int specifying the layer to move it to
   * @see #setLayer
   */
  static putLayer(c: JComponent, layer: number): void {
    c.putClientProperty(JLayeredPane.LAYER_PROPERTY, layer);
  }
  /**
   * Gets the layer property for a JComponent, it
   * does not cause any side effects like setLayer(). (painting, add/remove, etc)
   * Normally you should use the instance method getLayer().
   *
   * @param c  the JComponent to check
   * @return   an int specifying the component's layer
   */
  static getLayer(c: JComponent): number {
    let i: number;
    if ((i = c.getClientProperty(JLayeredPane.LAYER_PROPERTY)) != null) {
      return (+i);
    }
    return (+JLayeredPane.DEFAULT_LAYER);
  }
  /**
   * Sets the layer attribute on the specified component,
   * making it the bottommost component in that layer.
   * Should be called before adding to parent.
   *
   * @param c     the Component to set the layer for
   * @param layer an int specifying the layer to set, where
   *              lower numbers are closer to the bottom
   */
  setLayer$Component$int(c: Component, layer: number): void {
    this.setLayer$Component$int$int(c, layer, -1);
  }
  /**
   * Sets the layer attribute for the specified component and
   * also sets its position within that layer.
   *
   * @param c         the Component to set the layer for
   * @param layer     an int specifying the layer to set, where
   *                  lower numbers are closer to the bottom
   * @param position  an int specifying the position within the
   *                  layer, where 0 is the topmost position and -1
   *                  is the bottommost position
   */
  setLayer$Component$int$int(c: Component, layer: number, position: number): void {
    let layerObj: number;
    layerObj = this.getObjectForLayer(layer);
    if (layer === this.getLayer(c) && position === this.getPosition(c)) {
      this.repaint$Rectangle(c.getBounds$());
      return;
    }
    if (c instanceof JComponent) {
      (c).putClientProperty(JLayeredPane.LAYER_PROPERTY, layerObj);
    } else {
      this.getComponentToLayer().put(c, layerObj);
    }
    if (c.getParent() == null || c.getParent() !== this) {
      this.repaint$Rectangle(c.getBounds$());
      return;
    }
    let index = this.insertIndexForLayer$Component$int$int$JLayeredPane(c, layer, position);
    this.setComponentZOrder(c, index);
    this.repaint$Rectangle(c.getBounds$());
  }
  /**
   * Returns the layer attribute for the specified Component.
   *
   * @param c  the Component to check
   * @return an int specifying the component's current layer
   */
  getLayer(c: Component): number {
    let i: number;
    if (c instanceof JComponent) {
      i = (c).getClientProperty(JLayeredPane.LAYER_PROPERTY);
    } else {
      i = this.getComponentToLayer().get(c);
    }
    if (i == null) {
      return (+JLayeredPane.DEFAULT_LAYER);
    }
    return (+i);
  }
  /**
   * Returns the index of the specified Component.
   * This is the absolute index, ignoring layers.
   * Index numbers, like position numbers, have the topmost component
   * at index zero. Larger numbers are closer to the bottom.
   *
   * @param c  the Component to check
   * @return an int specifying the component's index
   */
  getIndexOf(c: Component): number {
    let i: number;
    let count: number;
    count = this.getComponentCount();
    for (i = 0; i < count; i++) {
      if (c === this.getComponent$int(i)) {
        return i;
      }
    }
    return -1;
  }
  /**
   * Moves the component to the top of the components in its current layer
   * (position 0).
   *
   * @param c the Component to move
   * @see #setPosition(Component, int)
   */
  moveToFront(c: Component): void {
    this.setPosition(c, 0);
  }
  /**
   * Moves the component to the bottom of the components in its current layer
   * (position -1).
   *
   * @param c the Component to move
   * @see #setPosition(Component, int)
   */
  moveToBack(c: Component): void {
    this.setPosition(c, -1);
  }
  /**
   * Moves the component to <code>position</code> within its current layer,
   * where 0 is the topmost position within the layer and -1 is the bottommost
   * position.
   * <p>
   * <b>Note:</b> Position numbering is defined by java.awt.Container, and
   * is the opposite of layer numbering. Lower position numbers are closer
   * to the top (0 is topmost), and higher position numbers are closer to
   * the bottom.
   *
   * @param c         the Component to move
   * @param position  an int in the range -1..N-1, where N is the number of
   *                  components in the component's current layer
   */
  setPosition(c: Component, position: number): void {
    this.setLayer$Component$int$int(c, this.getLayer(c), position);
  }
  /**
   * Get the relative position of the component within its layer.
   *
   * @param c  the Component to check
   * @return an int giving the component's position, where 0 is the
   *         topmost position and the highest index value = the count
   *         count of components at that layer, minus 1
   *
   * @see #getComponentCountInLayer
   */
  getPosition(c: Component): number {
    let i: number;
    let startLayer: number;
    let curLayer: number;
    let startLocation: number;
    let pos = 0;
    this.getComponentCount();
    startLocation = this.getIndexOf(c);
    if (startLocation === -1) {
      return -1;
    }
    startLayer = this.getLayer(c);
    for (i = (startLocation - 1) | 0; i >= 0; i--) {
      curLayer = this.getLayer(this.getComponent$int(i));
      if (curLayer === startLayer) {
        pos++;
      } else {
        return pos;
      }
    }
    return pos;
  }
  /**
   * Paints this JLayeredPane within the specified graphics context.
   *
   * @param g  the Graphics context within which to paint
   */
  paint(g: Graphics): void {
    if (this.isOpaque()) {
      let r = g.getClipBounds$();
      let c = this.getBackground();
      if (c == null) {
        c = Color.lightGray;
      }
      g.setColor(c);
      if (r != null) {
        g.fillRect(r.x_, r.y_, r.width_, r.height_);
      } else {
        g.fillRect(0, 0, this.getWidth(), this.getHeight());
      }
    }
    super.paint(g);
  }
  /**
   * Returns the hashtable that maps components to layers.
   *
   * @return the Hashtable used to map components to their layers
   */
  getComponentToLayer(): Hashtable<Component, number> {
    if (this.componentToLayer == null) {
      this.componentToLayer = new Hashtable(4);
    }
    return this.componentToLayer;
  }
  /**
   * Returns the Integer object associated with a specified layer.
   *
   * @param layer an int specifying the layer
   * @return an Integer object for that layer
   */
  getObjectForLayer(layer: number): number {
    switch (layer) {
      case 0:
        return JLayeredPane.DEFAULT_LAYER;
      case 100:
        return JLayeredPane.PALETTE_LAYER;
      case 200:
        return JLayeredPane.MODAL_LAYER;
      case 300:
        return JLayeredPane.POPUP_LAYER;
      case 400:
        return JLayeredPane.DRAG_LAYER;
      default:
        return layer;
    }
  }
  /**
   * Primitive method that determines the proper location to
   * insert a new child based on layer and position requests.
   *
   * @param layer     an int specifying the layer
   * @param position  an int specifying the position within the layer
   * @return an int giving the (absolute) insertion-index
   *
   * @see #getIndexOf
   */
  insertIndexForLayer$int$int(layer: number, position: number): number {
    return this.insertIndexForLayer$Component$int$int$JLayeredPane(null, layer, position);
  }
  /**
   * This method is an extended version of insertIndexForLayer()
   * to support setLayer which uses Container.setZOrder which does
   * not remove the component from the containment hierarchy though
   * we need to ignore it when calculating the insertion index.
   *
   * @param comp      component to ignore when determining index
   * @param layer     an int specifying the layer
   * @param position  an int specifying the position within the layer
   * @return an int giving the (absolute) insertion-index
   *
   * @see #getIndexOf
   */
  insertIndexForLayer$Component$int$int$JLayeredPane(comp: Component, layer: number, position: number): number {
    let i: number;
    let count: number;
    let curLayer: number;
    let layerStart = -1;
    let layerEnd = -1;
    let componentCount = this.getComponentCount();
    let compList = new ArrayList(componentCount);
    for (let index = 0; index < componentCount; index++) {
      if (this.getComponent$int(index) !== comp) {
        compList.add(this.getComponent$int(index));
      }
    }
    count = compList.size();
    for (i = 0; i < count; i++) {
      curLayer = this.getLayer(compList.get(i));
      if (layerStart === -1 && curLayer === layer) {
        layerStart = i;
      }
      if (curLayer < layer) {
        if (i === 0) {
          layerStart = 0;
          layerEnd = 0;
        } else {
          layerEnd = i;
        }
        break;
      }
    }
    if (layerStart === -1 && layerEnd === -1) {
      return count;
    }
    if (layerStart !== -1 && layerEnd === -1) {
      layerEnd = count;
    }
    if (layerEnd !== -1 && layerStart === -1) {
      layerStart = layerEnd;
    }
    if (position === -1) {
      return layerEnd;
    }
    if (position > -1 && ((layerStart + position) | 0) <= layerEnd) {
      return (layerStart + position) | 0;
    }
    return layerEnd;
  }
  /**
   * Returns a string representation of this JLayeredPane. This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this JLayeredPane.
   */
  paramString(): string {
    let optimizedDrawingPossibleString = (this.optimizedDrawingPossible ? 'true' : 'false');
    return super.paramString() + ',optimizedDrawingPossible=' + optimizedDrawingPossibleString;
  }
  /**
   * Gets the AccessibleContext associated with this JLayeredPane.
   * For layered panes, the AccessibleContext takes the form of an
   * AccessibleJLayeredPane.
   * A new AccessibleJLayeredPane instance is created if necessary.
   *
   * @return an AccessibleJLayeredPane that serves as the
   *         AccessibleContext of this JLayeredPane
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JLayeredPane$AccessibleJLayeredPane().$o(this)._JLayeredPane$AccessibleJLayeredPane();
    }
    return this.accessibleContext;
  }
  static $clinit() {
    JLayeredPane.DEFAULT_LAYER = 0;
    JLayeredPane.PALETTE_LAYER = 100;
    JLayeredPane.MODAL_LAYER = 200;
    JLayeredPane.POPUP_LAYER = 300;
    JLayeredPane.DRAG_LAYER = 400;
    JLayeredPane.FRAME_CONTENT_LAYER = -30000;
  }
}

/**
 * This class implements accessibility support for the
 * <code>JLayeredPane</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to layered pane user-interface
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
export class JLayeredPane$AccessibleJLayeredPane extends JComponent$AccessibleJComponent {
  /**
   * Constructs an {@code AccessibleJLayeredPane}.
   */
  _JLayeredPane$AccessibleJLayeredPane(): this {
    this._JComponent$AccessibleJComponent();
    return this;
  }
}

$J.define(JLayeredPane, 'javax.swing.JLayeredPane', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { '': '_JLayeredPane' }, meths: { 'insertIndexForLayer(java.awt.Component,int,int)': 'insertIndexForLayer$Component$int$int$JLayeredPane', 'insertIndexForLayer(int,int)': 'insertIndexForLayer$int$int', 'setLayer(java.awt.Component,int,int)': 'setLayer$Component$int$int', 'setLayer(java.awt.Component,int)': 'setLayer$Component$int', 'remove(int)': 'remove$int' }, clinit: true, lazy: ['DEFAULT_LAYER', 'PALETTE_LAYER', 'MODAL_LAYER', 'POPUP_LAYER', 'DRAG_LAYER', 'FRAME_CONTENT_LAYER'] });
$J.define(JLayeredPane$AccessibleJLayeredPane, 'javax.swing.JLayeredPane$AccessibleJLayeredPane', { kind: 'class', sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JLayeredPane$AccessibleJLayeredPane' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  Color = $J.load('java.awt.Color');
});
