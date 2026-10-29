// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalToolBarUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ArrayList, NullPointerException, WeakReference } from '../../../../../jre/index.ts';
import { BasicToolBarUI } from '../basic/BasicToolBarUI.ts';
import { BasicToolBarUI$DockingListener } from '../basic/BasicToolBarUI.ts';

let GraphicsEnvironment, Point, Rectangle, JCheckBox, JMenuBar, JToggleButton, JToolBar, SwingConstants, SwingUtilities, UIManager, UIResource, MetalLookAndFeel, MetalUtils;

/**
 * A Metal Look and Feel implementation of ToolBarUI.  This implementation
 * is a "combined" view/controller.
 *
 * @author Jeff Shapiro
 */
export class MetalToolBarUI extends BasicToolBarUI {
  /**
   * An array of WeakReferences that point to JComponents. This will contain
   * instances of JToolBars and JMenuBars and is used to find
   * JToolBars/JMenuBars that border each other.
   */
  static components: List<WeakReference<JComponent>> = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the create method instead.
   *
   * @see #createContainerListener
   */
  contListener: ContainerListener = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the create method instead.
   *
   * @see #createRolloverListener
   */
  rolloverListener: PropertyChangeListener = null;
  static nonRolloverBorder: Border = null;
  /**
   * Last menubar the toolbar touched.  This is only useful for ocean.
   */
  lastMenuBar: JMenuBar = null;
  /**
   * Constructs a {@code MetalToolBarUI}.
   */
  _MetalToolBarUI(): this {
    this._BasicToolBarUI();
    return this;
  }
  /**
   * Registers the specified component.
   */
  static register(c: JComponent): void {
    if (c == null) {
      throw new NullPointerException('JComponent must be non-null');
    }
    MetalToolBarUI.components.add(new WeakReference(c));
  }
  /**
   * Unregisters the specified component.
   */
  static unregister(c: JComponent): void {
    for (let counter = (MetalToolBarUI.components.size() - 1) | 0; counter >= 0; counter--) {
      let target = MetalToolBarUI.components.get(counter).get();
      if (target === c || target == null) {
        MetalToolBarUI.components.removeAt(counter);
      }
    }
  }
  /**
   * Finds a previously registered component of class <code>target</code>
   * that shares the JRootPane ancestor of <code>from</code>.
   */
  static findRegisteredComponentOfType(from: JComponent, target: JClass<any>): any {
    let rp = SwingUtilities.getRootPane(from);
    if (rp != null) {
      for (let counter = (MetalToolBarUI.components.size() - 1) | 0; counter >= 0; counter--) {
        let component = (MetalToolBarUI.components.get(counter)).get();
        if (component == null) {
          MetalToolBarUI.components.removeAt(counter);
        } else if (target.isInstance(component) && SwingUtilities.getRootPane(component) === rp) {
          return component;
        }
      }
    }
    return null;
  }
  /**
   * Returns true if the passed in JMenuBar is above a horizontal
   * JToolBar.
   */
  static doesMenuBarBorderToolBar(c: JMenuBar): boolean {
    let tb = MetalToolBarUI.findRegisteredComponentOfType(c, $J.cls(JToolBar));
    if (tb != null && tb.getOrientation() === SwingConstants.HORIZONTAL) {
      let rp = SwingUtilities.getRootPane(c);
      let point = new Point()._Point$int$int(0, 0);
      point = SwingUtilities.convertPoint$Component$Point$Component(c, point, rp);
      let menuX = point.x_;
      let menuY = point.y_;
      point.x_ = point.y_ = 0;
      point = SwingUtilities.convertPoint$Component$Point$Component(tb, point, rp);
      return (point.x_ === menuX && ((menuY + c.getHeight()) | 0) === point.y_ && c.getWidth() === tb.getWidth());
    }
    return false;
  }
  /**
   * Constructs an instance of {@code MetalToolBarUI}.
   *
   * @param c a component
   * @return an instance of {@code MetalToolBarUI}
   */
  static createUI(c: JComponent): ComponentUI {
    return new MetalToolBarUI()._MetalToolBarUI();
  }
  installUI(c: JComponent): void {
    super.installUI(c);
    MetalToolBarUI.register(c);
  }
  uninstallUI(c: JComponent): void {
    super.uninstallUI(c);
    MetalToolBarUI.nonRolloverBorder = null;
    MetalToolBarUI.unregister(c);
  }
  installListeners(): void {
    super.installListeners();
    this.contListener = this.createContainerListener();
    if (this.contListener != null) {
      this.toolBar.addContainerListener(this.contListener);
    }
    this.rolloverListener = this.createRolloverListener();
    if (this.rolloverListener != null) {
      this.toolBar.addPropertyChangeListener$PropertyChangeListener(this.rolloverListener);
    }
  }
  uninstallListeners(): void {
    super.uninstallListeners();
    if (this.contListener != null) {
      this.toolBar.removeContainerListener(this.contListener);
    }
    this.rolloverListener = this.createRolloverListener();
    if (this.rolloverListener != null) {
      this.toolBar.removePropertyChangeListener$PropertyChangeListener(this.rolloverListener);
    }
  }
  createRolloverBorder(): Border {
    return super.createRolloverBorder();
  }
  createNonRolloverBorder(): Border {
    return super.createNonRolloverBorder();
  }
  /**
   * Creates a non rollover border for Toggle buttons in the toolbar.
   */
  createNonRolloverToggleBorder$$MetalToolBarUI(): Border {
    return this.createNonRolloverBorder();
  }
  setBorderToNonRollover(c: Component): void {
    if (c instanceof JToggleButton && !(c instanceof JCheckBox)) {
      let b = c;
      let border = b.getBorder();
      super.setBorderToNonRollover(c);
      if ($J.isa(border, UIResource)) {
        if (MetalToolBarUI.nonRolloverBorder == null) {
          MetalToolBarUI.nonRolloverBorder = this.createNonRolloverToggleBorder$$MetalToolBarUI();
        }
        b.setBorder(MetalToolBarUI.nonRolloverBorder);
      }
    } else {
      super.setBorderToNonRollover(c);
    }
  }
  /**
   * Creates a container listener that will be added to the JToolBar.
   * If this method returns null then it will not be added to the
   * toolbar.
   *
   * @return an instance of a <code>ContainerListener</code> or null
   */
  createContainerListener(): ContainerListener {
    return null;
  }
  /**
   * Creates a property change listener that will be added to the JToolBar.
   * If this method returns null then it will not be added to the
   * toolbar.
   *
   * @return an instance of a <code>PropertyChangeListener</code> or null
   */
  createRolloverListener(): PropertyChangeListener {
    return null;
  }
  createDockingListener(): MouseInputListener {
    return new MetalToolBarUI$MetalDockingListener().$o(this)._MetalToolBarUI$MetalDockingListener(this.toolBar);
  }
  /**
   * Sets the offset of the mouse cursor inside the DragWindow.
   *
   * @param p the offset
   */
  setDragOffset(p: Point): void {
    if (!GraphicsEnvironment.isHeadless()) {
      if (this.dragWindow == null) {
        this.dragWindow = this.createDragWindow(this.toolBar);
      }
      this.dragWindow.setOffset(p);
    }
  }
  /**
   * If necessary paints the background of the component, then invokes
   * <code>paint</code>.
   *
   * @param g Graphics to paint to
   * @param c JComponent painting on
   * @throws NullPointerException if <code>g</code> or <code>c</code> is
   *         null
   * @see javax.swing.plaf.ComponentUI#update
   * @see javax.swing.plaf.ComponentUI#paint
   * @since 1.5
   */
  update(g: Graphics, c: JComponent): void {
    if (g == null) {
      throw new NullPointerException('graphics must be non-null');
    }
    if (c.isOpaque() && ($J.isa(c.getBackground(), UIResource)) && (c).getOrientation() === SwingConstants.HORIZONTAL && UIManager.get$Object('MenuBar.gradient') != null) {
      let rp = SwingUtilities.getRootPane(c);
      let mb = MetalToolBarUI.findRegisteredComponentOfType(c, $J.cls(JMenuBar));
      if (mb != null && mb.isOpaque() && ($J.isa(mb.getBackground(), UIResource))) {
        let point = new Point()._Point$int$int(0, 0);
        point = SwingUtilities.convertPoint$Component$Point$Component(c, point, rp);
        let x = point.x_;
        let y = point.y_;
        point.x_ = point.y_ = 0;
        point = SwingUtilities.convertPoint$Component$Point$Component(mb, point, rp);
        if (point.x_ === x && y === ((point.y_ + mb.getHeight()) | 0) && mb.getWidth() === c.getWidth() && MetalUtils.drawGradient(c, g, 'MenuBar.gradient', 0, -mb.getHeight(), c.getWidth(), (c.getHeight() + mb.getHeight()) | 0, true)) {
          this.setLastMenuBar(mb);
          this.paint(g, c);
          return;
        }
      }
      if (MetalUtils.drawGradient(c, g, 'MenuBar.gradient', 0, 0, c.getWidth(), c.getHeight(), true)) {
        this.setLastMenuBar(null);
        this.paint(g, c);
        return;
      }
    }
    this.setLastMenuBar(null);
    super.update(g, c);
  }
  setLastMenuBar(lastMenuBar: JMenuBar): void {
    if (MetalLookAndFeel.usingOcean()) {
      if (this.lastMenuBar !== lastMenuBar) {
        if (this.lastMenuBar != null) {
          this.lastMenuBar.repaint$();
        }
        if (lastMenuBar != null) {
          lastMenuBar.repaint$();
        }
        this.lastMenuBar = lastMenuBar;
      }
    }
  }
  static $clinit() {
    MetalToolBarUI.components = new ArrayList();
  }
}

/**
 * {@code DockingListener} for {@code MetalToolBarUI}.
 */
export class MetalToolBarUI$MetalDockingListener extends BasicToolBarUI$DockingListener {
  pressedInBumps: boolean = false;
  /**
   * Constructs the {@code MetalDockingListener}.
   *
   * @param t an instance of {@code JToolBar}
   */
  _MetalToolBarUI$MetalDockingListener(t: JToolBar): this {
    this._BasicToolBarUI$DockingListener(t);
    this.pressedInBumps = false;
    return this;
  }
  mousePressed(e: MouseEvent): void {
    super.mousePressed(e);
    if (!this.toolBar.isEnabled()) {
      return;
    }
    this.pressedInBumps = false;
    let bumpRect = new Rectangle()._Rectangle$();
    if (this.toolBar.getOrientation() === SwingConstants.HORIZONTAL) {
      let x = MetalUtils.isLeftToRight(this.toolBar) ? 0 : (this.toolBar.getSize$().width_ - 14) | 0;
      bumpRect.setBounds$int$int$int$int(x, 0, 14, this.toolBar.getSize$().height_);
    } else {
      bumpRect.setBounds$int$int$int$int(0, 0, this.toolBar.getSize$().width_, 14);
    }
    if (bumpRect.contains$Point(e.getPoint())) {
      this.pressedInBumps = true;
      let dragOffset = e.getPoint();
      if (!MetalUtils.isLeftToRight(this.toolBar)) {
        dragOffset.x_ = (dragOffset.x_ - (this.toolBar.getSize$().width_ - this.toolBar.getPreferredSize$().width_)) | 0;
      }
      this.$outer.setDragOffset(dragOffset);
    }
  }
  mouseDragged(e: MouseEvent): void {
    if (this.pressedInBumps) {
      super.mouseDragged(e);
    }
  }
}

$J.define(MetalToolBarUI, 'javax.swing.plaf.metal.MetalToolBarUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicToolBarUI', ctors: { '': '_MetalToolBarUI' }, meths: { 'createNonRolloverToggleBorder()': 'createNonRolloverToggleBorder$$MetalToolBarUI' }, clinit: true, lazy: ['components', 'nonRolloverBorder'] });
$J.define(MetalToolBarUI$MetalDockingListener, 'javax.swing.plaf.metal.MetalToolBarUI$MetalDockingListener', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicToolBarUI$DockingListener', ctors: { 'javax.swing.JToolBar': '_MetalToolBarUI$MetalDockingListener' }, inner: true });
$J.module(() => {
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  JCheckBox = $J.load('javax.swing.JCheckBox');
  JMenuBar = $J.load('javax.swing.JMenuBar');
  JToggleButton = $J.load('javax.swing.JToggleButton');
  JToolBar = $J.load('javax.swing.JToolBar');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
  MetalUtils = $J.load('javax.swing.plaf.metal.MetalUtils');
});
