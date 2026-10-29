// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JDesktopPane.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject, LinkedHashSet, TreeSet } from '../../../jre/index.ts';
import { JLayeredPane } from './JLayeredPane.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';

let Container, PropertyVetoException, JInternalFrame, JInternalFrame$JDesktopIcon, LayoutFocusTraversalPolicy, UIManager;

/**
 * A container used to create a multiple-document interface or a virtual desktop.
 * You create <code>JInternalFrame</code> objects and add them to the
 * <code>JDesktopPane</code>. <code>JDesktopPane</code> extends
 * <code>JLayeredPane</code> to manage the potentially overlapping internal
 * frames. It also maintains a reference to an instance of
 * <code>DesktopManager</code> that is set by the UI
 * class for the current look and feel (L&amp;F).  Note that <code>JDesktopPane</code>
 * does not support borders.
 * <p>
 * This class is normally used as the parent of <code>JInternalFrames</code>
 * to provide a pluggable <code>DesktopManager</code> object to the
 * <code>JInternalFrames</code>. The <code>installUI</code> of the
 * L&amp;F specific implementation is responsible for setting the
 * <code>desktopManager</code> variable appropriately.
 * When the parent of a <code>JInternalFrame</code> is a <code>JDesktopPane</code>,
 * it should delegate most of its behavior to the <code>desktopManager</code>
 * (closing, resizing, etc).
 * <p>
 * For further documentation and examples see
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/internalframe.html">How to Use Internal Frames</a>,
 * a section in <em>The Java Tutorial</em>.
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
 * @see JInternalFrame
 * @see JInternalFrame.JDesktopIcon
 * @see DesktopManager
 *
 * @author David Kloba
 * @since 1.2
 */
export class JDesktopPane extends JLayeredPane {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'DesktopPaneUI';
  desktopManager: DesktopManager = null;
  selectedFrame: JInternalFrame = null;
  /**
   * Indicates that the entire contents of the item being dragged
   * should appear inside the desktop pane.
   *
   * @see #OUTLINE_DRAG_MODE
   * @see #setDragMode
   */
  static readonly LIVE_DRAG_MODE: number = 0;
  /**
   * Indicates that an outline only of the item being dragged
   * should appear inside the desktop pane.
   *
   * @see #LIVE_DRAG_MODE
   * @see #setDragMode
   */
  static readonly OUTLINE_DRAG_MODE: number = 1;
  dragMode: number = 0;
  dragModeSet: boolean = false;
  framesCache: List<JInternalFrame> = null;
  componentOrderCheckingEnabled: boolean = false;
  componentOrderChanged: boolean = false;
  /**
   * Creates a new <code>JDesktopPane</code>.
   */
  _JDesktopPane(): this {
    this._JLayeredPane();
    this.selectedFrame = null;
    this.dragMode = JDesktopPane.LIVE_DRAG_MODE;
    this.dragModeSet = false;
    this.componentOrderCheckingEnabled = true;
    this.componentOrderChanged = false;
    this.setUIProperty('opaque', true);
    this.setFocusCycleRoot(true);
    this.setFocusTraversalPolicy(new (JDesktopPane$1())().$o(this)._LayoutFocusTraversalPolicy$());
    this.updateUI();
    return this;
  }
  /**
   * Sets the L&amp;F object that renders this component.
   *
   * @param ui  the DesktopPaneUI L&amp;F object
   * @see UIDefaults#getUI
   */
  setUI$DesktopPaneUI(ui: DesktopPaneUI): void {
    super.setUI$ComponentUI(ui);
  }
  /**
   * Sets the "dragging style" used by the desktop pane.
   * You may want to change to one mode or another for
   * performance or aesthetic reasons.
   *
   * @param dragMode the style of drag to use for items in the Desktop
   *
   * @see #LIVE_DRAG_MODE
   * @see #OUTLINE_DRAG_MODE
   *
   * @since 1.3
   */
  setDragMode(dragMode: number): void {
    let oldDragMode = this.dragMode;
    this.dragMode = dragMode;
    this.firePropertyChange$String$int$int('dragMode', oldDragMode, this.dragMode);
    this.dragModeSet = true;
  }
  /**
   * Gets the current "dragging style" used by the desktop pane.
   * @return either <code>Live_DRAG_MODE</code> or
   *   <code>OUTLINE_DRAG_MODE</code>
   * @see #setDragMode
   * @since 1.3
   */
  getDragMode(): number {
    return this.dragMode;
  }
  /**
   * Returns the {@code DesktopManger} that handles
   * desktop-specific UI actions.
   *
   * @return the {@code DesktopManger} that handles desktop-specific
   *         UI actions
   */
  getDesktopManager(): DesktopManager {
    return this.desktopManager;
  }
  /**
   * Sets the <code>DesktopManger</code> that will handle
   * desktop-specific UI actions. This may be overridden by
   * {@code LookAndFeel}.
   *
   * @param d the <code>DesktopManager</code> to use
   */
  setDesktopManager(d: DesktopManager): void {
    let oldValue = this.desktopManager;
    this.desktopManager = d;
    this.firePropertyChange$String$Object$Object('desktopManager', oldValue, this.desktopManager);
  }
  /**
   * Notification from the <code>UIManager</code> that the L&amp;F has changed.
   * Replaces the current UI object with the latest version from the
   * <code>UIManager</code>.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    this.setUI$DesktopPaneUI(UIManager.getUI(this));
  }
  /**
   * Returns the name of the L&amp;F class that renders this component.
   *
   * @return the string "DesktopPaneUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JDesktopPane.uiClassID;
  }
  /**
   * Returns all <code>JInternalFrames</code> currently displayed in the
   * desktop. Returns iconified frames as well as expanded frames.
   *
   * @return an array of <code>JInternalFrame</code> objects
   */
  getAllFrames(): JInternalFrame[] {
    return $J.toArrayInto(JDesktopPane.getAllFrames(this).toArray(), $J.newArray(0, null));
  }
  static getAllFrames(parent: Container): Collection<JInternalFrame> {
    let i: number;
    let count: number;
    let results = new LinkedHashSet();
    count = parent.getComponentCount();
    for (i = 0; i < count; i++) {
      let next = parent.getComponent$int(i);
      if (next instanceof JInternalFrame) {
        results.add(next);
      } else if (next instanceof JInternalFrame$JDesktopIcon) {
        let tmp = (next).getInternalFrame();
        if (tmp != null) {
          results.add(tmp);
        }
      } else if (next instanceof Container) {
        results.addAll(JDesktopPane.getAllFrames(next));
      }
    }
    return results;
  }
  /**
   * Returns the currently active <code>JInternalFrame</code>
   * in this <code>JDesktopPane</code>, or <code>null</code>
   * if no <code>JInternalFrame</code> is currently active.
   *
   * @return the currently active <code>JInternalFrame</code> or
   *   <code>null</code>
   * @since 1.3
   */
  getSelectedFrame(): JInternalFrame {
    return this.selectedFrame;
  }
  /**
   * Sets the currently active <code>JInternalFrame</code>
   *  in this <code>JDesktopPane</code>. This method is used to bridge
   *  the package gap between JDesktopPane and the platform implementation
   *  code and should not be called directly. To visually select the frame
   *  the client must call JInternalFrame.setSelected(true) to activate
   *  the frame.
   *  @see JInternalFrame#setSelected(boolean)
   *
   * @param f the internal frame that's currently selected
   * @since 1.3
   */
  setSelectedFrame(f: JInternalFrame): void {
    this.selectedFrame = f;
  }
  getFrames(): List<JInternalFrame> {
    let c: Component;
    let set$ = new TreeSet();
    for (let i = 0; i < this.getComponentCount(); i++) {
      c = this.getComponent$int(i);
      if (c instanceof JInternalFrame) {
        set$.add(new JDesktopPane$ComponentPosition()._JDesktopPane$ComponentPosition(c, this.getLayer(c), i));
      } else if (c instanceof JInternalFrame$JDesktopIcon) {
        c = (c).getInternalFrame();
        set$.add(new JDesktopPane$ComponentPosition()._JDesktopPane$ComponentPosition(c, this.getLayer(c), i));
      }
    }
    let frames = new ArrayList(set$.size());
    for (const $it0 = set$.iterator(); $it0.hasNext(); ) {
      let position = $it0.next();
      frames.add(position.component);
    }
    return frames;
  }
  getNextFrame$JInternalFrame$boolean$JDesktopPane(f: JInternalFrame, forward: boolean): JInternalFrame {
    this.verifyFramesCache();
    if (f == null) {
      return this.getTopInternalFrame();
    }
    let i = this.framesCache.indexOf(f);
    if (i === -1 || this.framesCache.size() === 1) {
      return null;
    }
    if (forward) {
      if (++i === this.framesCache.size()) {
        i = 0;
      }
    } else {
      if (--i === -1) {
        i = (this.framesCache.size() - 1) | 0;
      }
    }
    return this.framesCache.get(i);
  }
  getNextFrame$JInternalFrame(f: JInternalFrame): JInternalFrame {
    return this.getNextFrame$JInternalFrame$boolean$JDesktopPane(f, true);
  }
  getTopInternalFrame(): JInternalFrame {
    if (this.framesCache.size() === 0) {
      return null;
    }
    return this.framesCache.get(0);
  }
  updateFramesCache(): void {
    this.framesCache = this.getFrames();
  }
  verifyFramesCache(): void {
    if (this.componentOrderChanged) {
      this.componentOrderChanged = false;
      this.updateFramesCache();
    }
  }
  /**
   * {@inheritDoc}
   */
  remove$Component(comp: Component): void {
    super.remove$Component(comp);
    this.updateFramesCache();
  }
  /**
   * Selects the next <code>JInternalFrame</code> in this desktop pane.
   *
   * @param forward a boolean indicating which direction to select in;
   *        <code>true</code> for forward, <code>false</code> for
   *        backward
   * @return the JInternalFrame that was selected or <code>null</code>
   *         if nothing was selected
   * @since 1.6
   */
  selectFrame(forward: boolean): JInternalFrame {
    let selectedFrame = this.getSelectedFrame();
    let frameToSelect = this.getNextFrame$JInternalFrame$boolean$JDesktopPane(selectedFrame, forward);
    if (frameToSelect == null) {
      return null;
    }
    this.setComponentOrderCheckingEnabled(false);
    if (forward && selectedFrame != null) {
      selectedFrame.moveToBack();
    }
    try {
      frameToSelect.setSelected(true);
    } catch ($e1) {
      if ($J.isa($e1, PropertyVetoException)) {
        let pve = $J.exc($e1);
      } else {
        throw $e1;
      }
    }
    this.setComponentOrderCheckingEnabled(true);
    return frameToSelect;
  }
  setComponentOrderCheckingEnabled(enable: boolean): void {
    this.componentOrderCheckingEnabled = enable;
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  addImpl(comp: Component, constraints: any, index: number): void {
    this.checkComponentAttributes(comp);
    super.addImpl(comp, constraints, index);
    if (this.componentOrderCheckingEnabled) {
      if (comp instanceof JInternalFrame || comp instanceof JInternalFrame$JDesktopIcon) {
        this.componentOrderChanged = true;
      }
    }
  }
  checkComponentAttributes(comp: Component): void {
    if (comp instanceof JInternalFrame && (comp).isIcon()) {
      (comp).putClientProperty('wasIconOnce', false);
    }
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  remove$int(index: number): void {
    if (this.componentOrderCheckingEnabled) {
      let comp = this.getComponent$int(index);
      if (comp instanceof JInternalFrame || comp instanceof JInternalFrame$JDesktopIcon) {
        this.componentOrderChanged = true;
      }
    }
    super.remove$int(index);
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  removeAll(): void {
    if (this.componentOrderCheckingEnabled) {
      let count = this.getComponentCount();
      for (let i = 0; i < count; i++) {
        let comp = this.getComponent$int(i);
        if (comp instanceof JInternalFrame || comp instanceof JInternalFrame$JDesktopIcon) {
          this.componentOrderChanged = true;
          break;
        }
      }
    }
    super.removeAll();
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  setComponentZOrder(comp: Component, index: number): void {
    super.setComponentZOrder(comp, index);
    if (this.componentOrderCheckingEnabled) {
      if (comp instanceof JInternalFrame || comp instanceof JInternalFrame$JDesktopIcon) {
        this.componentOrderChanged = true;
      }
    }
  }
  setUIProperty(propertyName: string, value: any): void {
    if (propertyName === 'dragMode') {
      if (!this.dragModeSet) {
        this.setDragMode((+(value)));
        this.dragModeSet = false;
      }
    } else {
      super.setUIProperty(propertyName, value);
    }
  }
  /**
   * Returns a string representation of this <code>JDesktopPane</code>.
   * This method is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JDesktopPane</code>
   */
  paramString(): string {
    let desktopManagerString = (this.desktopManager != null ? this.desktopManager.toString() : '');
    return super.paramString() + ',desktopManager=' + desktopManagerString;
  }
  /**
   * Gets the <code>AccessibleContext</code> associated with this
   * <code>JDesktopPane</code>. For desktop panes, the
   * <code>AccessibleContext</code> takes the form of an
   * <code>AccessibleJDesktopPane</code>.
   * A new <code>AccessibleJDesktopPane</code> instance is created if necessary.
   *
   * @return an <code>AccessibleJDesktopPane</code> that serves as the
   *         <code>AccessibleContext</code> of this <code>JDesktopPane</code>
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JDesktopPane$AccessibleJDesktopPane().$o(this)._JDesktopPane$AccessibleJDesktopPane();
    }
    return this.accessibleContext;
  }
}

export class JDesktopPane$ComponentPosition extends JObject {
  component: JInternalFrame = null;
  layer: number = 0;
  zOrder: number = 0;
  _JDesktopPane$ComponentPosition(component: JInternalFrame, layer: number, zOrder: number): this {
    this.component = component;
    this.layer = layer;
    this.zOrder = zOrder;
    return this;
  }
  compareTo(o: JDesktopPane$ComponentPosition): number {
    let delta = (o.layer - this.layer) | 0;
    if (delta === 0) {
      return (this.zOrder - o.zOrder) | 0;
    }
    return delta;
  }
}

/**
 * This class implements accessibility support for the
 * <code>JDesktopPane</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to desktop pane user-interface
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
export class JDesktopPane$AccessibleJDesktopPane extends JComponent$AccessibleJComponent {
  /**
   * Constructs an {@code AccessibleJDesktopPane}.
   */
  _JDesktopPane$AccessibleJDesktopPane(): this {
    this._JComponent$AccessibleJComponent();
    return this;
  }
}

let $JDesktopPane$1: any = null;
/** An anonymous class (JDesktopPane.java:137). */
function JDesktopPane$1(): any {
  return $JDesktopPane$1 ??= $J.local(class extends LayoutFocusTraversalPolicy {
    getDefaultComponent(c: Container): Component {
      let jifArray = this.$outer.getAllFrames();
      let comp = null;
      for (let jif of jifArray) {
        comp = jif.getFocusTraversalPolicy().getDefaultComponent(jif);
        if (comp != null) {
          break;
        }
      }
      return comp;
    }
  }, 'javax.swing.JDesktopPane$1', []);
}

$J.define(JDesktopPane, 'javax.swing.JDesktopPane', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'javax.swing.JLayeredPane', ctors: { '': '_JDesktopPane' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JDesktopPane', 'remove(int)': 'remove$int', 'remove(java.awt.Component)': 'remove$Component', 'getNextFrame(javax.swing.JInternalFrame)': 'getNextFrame$JInternalFrame', 'getNextFrame(javax.swing.JInternalFrame,boolean)': 'getNextFrame$JInternalFrame$boolean$JDesktopPane', 'setUI(javax.swing.plaf.DesktopPaneUI)': 'setUI$DesktopPaneUI' } });
$J.define(JDesktopPane$ComponentPosition, 'javax.swing.JDesktopPane$ComponentPosition', { kind: 'class', ifaces: ['java.lang.Comparable'], sup: 'java.lang.Object', ctors: { 'javax.swing.JInternalFrame,int,int': '_JDesktopPane$ComponentPosition' } });
$J.define(JDesktopPane$AccessibleJDesktopPane, 'javax.swing.JDesktopPane$AccessibleJDesktopPane', { kind: 'class', sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JDesktopPane$AccessibleJDesktopPane' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  Container = $J.load('java.awt.Container');
  PropertyVetoException = $J.load('java.beans.PropertyVetoException');
  JInternalFrame = $J.load('javax.swing.JInternalFrame');
  JInternalFrame$JDesktopIcon = $J.load('javax.swing.JInternalFrame$JDesktopIcon');
  LayoutFocusTraversalPolicy = $J.load('javax.swing.LayoutFocusTraversalPolicy');
  UIManager = $J.load('javax.swing.UIManager');
});
