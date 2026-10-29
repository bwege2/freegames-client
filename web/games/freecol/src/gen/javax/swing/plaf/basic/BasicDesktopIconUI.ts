// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicDesktopIconUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { DesktopIconUI } from '../DesktopIconUI.ts';
import { MouseInputAdapter } from '../../event/MouseInputAdapter.ts';

let BorderLayout, Dimension, PropertyVetoException, DefaultDesktopManager, JLayeredPane, LookAndFeel, SwingUtilities, BasicInternalFrameTitlePane;

/**
 * Basic L&amp;F for a minimized window on a desktop.
 *
 * @author David Kloba
 * @author Steve Wilson
 * @author Rich Schiavi
 */
export class BasicDesktopIconUI extends DesktopIconUI {
  /**
   * The instance of {@code JInternalFrame.JDesktopIcon}.
   */
  desktopIcon: JInternalFrame$JDesktopIcon = null;
  /**
   * The instance of {@code JInternalFrame}.
   */
  frame: JInternalFrame = null;
  /**
   * The title pane component used in the desktop icon.
   *
   * @since 1.5
   */
  iconPane: JComponent = null;
  mouseInputListener: MouseInputListener = null;
  /**
   * Constructs a new instance of {@code BasicDesktopIconUI}.
   */
  _BasicDesktopIconUI(): this {
    this._DesktopIconUI();
    return this;
  }
  /**
   * Constructs a new instance of {@code BasicDesktopIconUI}.
   *
   * @param c a component
   * @return a new instance of {@code BasicDesktopIconUI}
   */
  static createUI(c: JComponent): ComponentUI {
    return new BasicDesktopIconUI()._BasicDesktopIconUI();
  }
  installUI(c: JComponent): void {
    this.desktopIcon = c;
    this.frame = this.desktopIcon.getInternalFrame();
    this.installDefaults();
    this.installComponents();
    let f = this.desktopIcon.getInternalFrame();
    if (f.isIcon() && f.getParent() == null) {
      let desktop = this.desktopIcon.getDesktopPane();
      if (desktop != null) {
        let desktopManager = desktop.getDesktopManager();
        if (desktopManager instanceof DefaultDesktopManager) {
          desktopManager.iconifyFrame(f);
        }
      }
    }
    this.installListeners();
    JLayeredPane.putLayer(this.desktopIcon, JLayeredPane.getLayer(this.frame));
  }
  uninstallUI(c: JComponent): void {
    this.uninstallDefaults();
    this.uninstallComponents();
    let f = this.desktopIcon.getInternalFrame();
    if (f.isIcon()) {
      let desktop = this.desktopIcon.getDesktopPane();
      if (desktop != null) {
        let desktopManager = desktop.getDesktopManager();
        if (desktopManager instanceof DefaultDesktopManager) {
          f.putClientProperty('wasIconOnce', null);
          this.desktopIcon.setLocation$int$int(-2147483648, 0);
        }
      }
    }
    this.uninstallListeners();
    this.frame = null;
    this.desktopIcon = null;
  }
  /**
   * Registers components.
   */
  installComponents(): void {
    this.iconPane = new BasicInternalFrameTitlePane()._BasicInternalFrameTitlePane(this.frame);
    this.desktopIcon.setLayout(new BorderLayout()._BorderLayout$());
    this.desktopIcon.add$Component$Object(this.iconPane, BorderLayout.CENTER);
  }
  /**
   * Unregisters components.
   */
  uninstallComponents(): void {
    this.desktopIcon.remove$Component(this.iconPane);
    this.desktopIcon.setLayout(null);
    this.iconPane = null;
  }
  /**
   * Registers listeners.
   */
  installListeners(): void {
    this.mouseInputListener = this.createMouseInputListener();
    this.desktopIcon.addMouseMotionListener(this.mouseInputListener);
    this.desktopIcon.addMouseListener(this.mouseInputListener);
  }
  /**
   * Unregisters listeners.
   */
  uninstallListeners(): void {
    this.desktopIcon.removeMouseMotionListener(this.mouseInputListener);
    this.desktopIcon.removeMouseListener(this.mouseInputListener);
    this.mouseInputListener = null;
  }
  /**
   * Installs default properties.
   */
  installDefaults(): void {
    LookAndFeel.installBorder(this.desktopIcon, 'DesktopIcon.border');
    LookAndFeel.installProperty(this.desktopIcon, 'opaque', true);
  }
  /**
   * Uninstalls default properties.
   */
  uninstallDefaults(): void {
    LookAndFeel.uninstallBorder(this.desktopIcon);
  }
  /**
   * Returns a new instance of {@code MouseInputListener}.
   *
   * @return a new instance of {@code MouseInputListener}
   */
  createMouseInputListener(): MouseInputListener {
    return new BasicDesktopIconUI$MouseInputHandler().$o(this)._BasicDesktopIconUI$MouseInputHandler();
  }
  getPreferredSize$JComponent(c: JComponent): Dimension {
    return this.desktopIcon.getLayout().preferredLayoutSize(this.desktopIcon);
  }
  getMinimumSize(c: JComponent): Dimension {
    let dim = new Dimension()._Dimension$Dimension(this.iconPane.getMinimumSize$());
    let border = this.frame.getBorder();
    if (border != null) {
      dim.height_ = (dim.height_ + (border.getBorderInsets$Component(this.frame).bottom + border.getBorderInsets$Component(this.frame).top)) | 0;
    }
    return dim;
  }
  /**
   * Desktop icons can not be resized.  Therefore, we should always
   * return the minimum size of the desktop icon.
   *
   * @see #getMinimumSize
   */
  getMaximumSize(c: JComponent): Dimension {
    return this.iconPane.getMaximumSize();
  }
  /**
   * De-iconifies the internal frame.
   */
  deiconize(): void {
    try {
      this.frame.setIcon(false);
    } catch ($e0) {
      if ($J.isa($e0, PropertyVetoException)) {
        let e2 = $J.exc($e0);
      } else {
        throw $e0;
      }
    }
  }
}

/**
 * Listens for mouse movements and acts on them.
 *
 * This class should be treated as a &quot;protected&quot; inner class.
 * Instantiate it only within subclasses of {@code BasicDesktopIconUI}.
 */
export class BasicDesktopIconUI$MouseInputHandler extends MouseInputAdapter {
  _x: number = 0;
  _y: number = 0;
  __x: number = 0;
  __y: number = 0;
  startingBounds: Rectangle = null;
  /**
   * Constructs a {@code MouseInputHandler}.
   */
  _BasicDesktopIconUI$MouseInputHandler(): this {
    this._MouseInputAdapter();
    return this;
  }
  mouseReleased(e: MouseEvent): void {
    this._x = 0;
    this._y = 0;
    this.__x = 0;
    this.__y = 0;
    this.startingBounds = null;
    let d: JDesktopPane;
    if ((d = this.$outer.desktopIcon.getDesktopPane()) != null) {
      let dm = d.getDesktopManager();
      dm.endDraggingFrame(this.$outer.desktopIcon);
    }
  }
  mousePressed(e: MouseEvent): void {
    let p = SwingUtilities.convertPoint$Component$int$int$Component(e.getSource(), e.getX(), e.getY(), null);
    this.__x = e.getX();
    this.__y = e.getY();
    this._x = p.x_;
    this._y = p.y_;
    this.startingBounds = this.$outer.desktopIcon.getBounds$();
    let d: JDesktopPane;
    if ((d = this.$outer.desktopIcon.getDesktopPane()) != null) {
      let dm = d.getDesktopManager();
      dm.beginDraggingFrame(this.$outer.desktopIcon);
    }
    try {
      this.$outer.frame.setSelected(true);
    } catch ($e1) {
      if ($J.isa($e1, PropertyVetoException)) {
        let e1 = $J.exc($e1);
      } else {
        throw $e1;
      }
    }
    if (this.$outer.desktopIcon.getParent() instanceof JLayeredPane) {
      (this.$outer.desktopIcon.getParent()).moveToFront(this.$outer.desktopIcon);
    }
    if (e.getClickCount() > 1) {
      if (this.$outer.frame.isIconifiable() && this.$outer.frame.isIcon()) {
        this.$outer.deiconize();
      }
    }
  }
  mouseMoved(e: MouseEvent): void {
  }
  mouseDragged(e: MouseEvent): void {
    let p: Point;
    let newX: number;
    let newY: number;
    let newW: number;
    let newH: number;
    let deltaX: number;
    let deltaY: number;
    let min: Dimension;
    let max: Dimension;
    p = SwingUtilities.convertPoint$Component$int$int$Component(e.getSource(), e.getX(), e.getY(), null);
    let i = this.$outer.desktopIcon.getInsets$();
    let pWidth: number;
    let pHeight: number;
    pWidth = (this.$outer.desktopIcon.getParent()).getWidth();
    pHeight = (this.$outer.desktopIcon.getParent()).getHeight();
    if (this.startingBounds == null) {
      return;
    }
    newX = (this.startingBounds.x_ - (this._x - p.x_)) | 0;
    newY = (this.startingBounds.y_ - (this._y - p.y_)) | 0;
    if (((newX + i.left) | 0) <= -this.__x) {
      newX = (-this.__x - i.left) | 0;
    }
    if (((newY + i.top) | 0) <= -this.__y) {
      newY = (-this.__y - i.top) | 0;
    }
    if (((newX + this.__x + i.right) | 0) > pWidth) {
      newX = (pWidth - this.__x - i.right) | 0;
    }
    if (((newY + this.__y + i.bottom) | 0) > pHeight) {
      newY = (pHeight - this.__y - i.bottom) | 0;
    }
    let d: JDesktopPane;
    if ((d = this.$outer.desktopIcon.getDesktopPane()) != null) {
      let dm = d.getDesktopManager();
      dm.dragFrame(this.$outer.desktopIcon, newX, newY);
    } else {
      this.moveAndRepaint(this.$outer.desktopIcon, newX, newY, this.$outer.desktopIcon.getWidth(), this.$outer.desktopIcon.getHeight());
    }
    return;
  }
  /**
   * Moves and repaints a component {@code f}.
   *
   * @param f a component
   * @param newX a new X coordinate
   * @param newY a new Y coordinate
   * @param newWidth a new width
   * @param newHeight a new height
   */
  moveAndRepaint(f: JComponent, newX: number, newY: number, newWidth: number, newHeight: number): void {
    let r = f.getBounds$();
    f.setBounds$int$int$int$int(newX, newY, newWidth, newHeight);
    SwingUtilities.computeUnion(newX, newY, newWidth, newHeight, r);
    f.getParent().repaint$int$int$int$int(r.x_, r.y_, r.width_, r.height_);
  }
}

$J.define(BasicDesktopIconUI, 'javax.swing.plaf.basic.BasicDesktopIconUI', { kind: 'class', sup: 'javax.swing.plaf.DesktopIconUI', ctors: { '': '_BasicDesktopIconUI' }, meths: { 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent' } });
$J.define(BasicDesktopIconUI$MouseInputHandler, 'javax.swing.plaf.basic.BasicDesktopIconUI$MouseInputHandler', { kind: 'class', sup: 'javax.swing.event.MouseInputAdapter', ctors: { '': '_BasicDesktopIconUI$MouseInputHandler' }, inner: true });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  Dimension = $J.load('java.awt.Dimension');
  PropertyVetoException = $J.load('java.beans.PropertyVetoException');
  DefaultDesktopManager = $J.load('javax.swing.DefaultDesktopManager');
  JLayeredPane = $J.load('javax.swing.JLayeredPane');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  BasicInternalFrameTitlePane = $J.load('javax.swing.plaf.basic.BasicInternalFrameTitlePane');
});
