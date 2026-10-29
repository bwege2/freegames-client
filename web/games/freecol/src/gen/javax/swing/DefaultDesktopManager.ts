// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/DefaultDesktopManager.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, SunToolkit, Toolkit } from '../../../jre/index.ts';

let Color, Point, Rectangle, PropertyVetoException, JComponent, JDesktopPane, JInternalFrame, JInternalFrame$JDesktopIcon, JLayeredPane, RepaintManager, SwingUtilities, AWTAccessor;

/**
 * This is an implementation of the <code>DesktopManager</code>.
 * It currently implements the basic behaviors for managing
 * <code>JInternalFrame</code>s in an arbitrary parent.
 * <code>JInternalFrame</code>s that are not children of a
 * <code>JDesktop</code> will use this component
 * to handle their desktop-like actions.
 * <p>This class provides a policy for the various JInternalFrame methods,
 * it is not meant to be called directly rather the various JInternalFrame
 * methods will call into the DesktopManager.</p>
 * @see JDesktopPane
 * @see JInternalFrame
 * @author David Kloba
 * @author Steve Wilson
 * @since 1.2
 */
export class DefaultDesktopManager extends JObject {
  static readonly HAS_BEEN_ICONIFIED_PROPERTY: string = 'wasIconOnce';
  static readonly DEFAULT_DRAG_MODE: number = 0;
  static readonly OUTLINE_DRAG_MODE: number = 1;
  static readonly FASTER_DRAG_MODE: number = 2;
  dragMode: number = 0;
  currentBounds: Rectangle = null;
  desktopGraphics: Graphics = null;
  desktopBounds: Rectangle = null;
  floatingItems: Rectangle[] = null;
  /**
   * Set to true when the user actually drags a frame vs clicks on it
   * to start the drag operation.  This is only used when dragging with
   * FASTER_DRAG_MODE.
   */
  didDrag: boolean = false;
  currentLoc: Point = null;
  /**
   * Constructs a {@code DefaultDesktopManager}.
   */
  _DefaultDesktopManager(): this {
    this.dragMode = DefaultDesktopManager.DEFAULT_DRAG_MODE;
    this.currentBounds = null;
    this.desktopGraphics = null;
    this.desktopBounds = null;
    this.floatingItems = [];
    this.currentLoc = null;
    return this;
  }
  /**
   * Removes the frame, and, if necessary, the
   * <code>desktopIcon</code>, from its parent.
   * @param f the <code>JInternalFrame</code> to be removed
   */
  closeFrame(f: JInternalFrame): void {
    let d = f.getDesktopPane();
    if (d == null) {
      return;
    }
    let findNext = f.isSelected();
    let c = f.getParent();
    let nextFrame = null;
    if (findNext) {
      nextFrame = d.getNextFrame$JInternalFrame(f);
      try {
        f.setSelected(false);
      } catch ($e0) {
        if ($J.isa($e0, PropertyVetoException)) {
          let e2 = $J.exc($e0);
        } else {
          throw $e0;
        }
      }
    }
    if (c != null) {
      c.remove$Component(f);
      c.repaint$int$int$int$int(f.getX(), f.getY(), f.getWidth(), f.getHeight());
    }
    this.removeIconFor(f);
    if (f.getNormalBounds() != null) {
      f.setNormalBounds(null);
    }
    if (this.wasIcon(f)) {
      this.setWasIcon(f, null);
    }
    if (nextFrame != null) {
      try {
        nextFrame.setSelected(true);
      } catch ($e1) {
        if ($J.isa($e1, PropertyVetoException)) {
          let e2 = $J.exc($e1);
        } else {
          throw $e1;
        }
      }
    } else if (findNext && d.getComponentCount() === 0) {
      d.requestFocus$();
    }
  }
  /**
   * Resizes the frame to fill its parents bounds.
   * @param f the frame to be resized
   */
  maximizeFrame(f: JInternalFrame): void {
    if (f.isIcon()) {
      try {
        f.setIcon(false);
      } catch ($e2) {
        if ($J.isa($e2, PropertyVetoException)) {
          let e2 = $J.exc($e2);
        } else {
          throw $e2;
        }
      }
    } else {
      let c = f.getParent();
      if (c == null) {
        return;
      }
      f.setNormalBounds(f.getBounds$());
      let desktopBounds = c.getBounds$();
      this.setBoundsForFrame(f, 0, 0, desktopBounds.width_, desktopBounds.height_);
    }
    try {
      f.setSelected(true);
    } catch ($e3) {
      if ($J.isa($e3, PropertyVetoException)) {
        let e2 = $J.exc($e3);
      } else {
        throw $e3;
      }
    }
  }
  /**
   * Restores the frame back to its size and position prior
   * to a <code>maximizeFrame</code> call.
   * @param f the <code>JInternalFrame</code> to be restored
   */
  minimizeFrame(f: JInternalFrame): void {
    if (f.isIcon()) {
      this.iconifyFrame(f);
      return;
    }
    if ((f.getNormalBounds()) != null) {
      let r = f.getNormalBounds();
      f.setNormalBounds(null);
      try {
        f.setSelected(true);
      } catch ($e4) {
        if ($J.isa($e4, PropertyVetoException)) {
          let e2 = $J.exc($e4);
        } else {
          throw $e4;
        }
      }
      this.setBoundsForFrame(f, r.x_, r.y_, r.width_, r.height_);
    }
  }
  /**
   * Removes the frame from its parent and adds its
   * <code>desktopIcon</code> to the parent.
   * @param f the <code>JInternalFrame</code> to be iconified
   */
  iconifyFrame(f: JInternalFrame): void {
    let desktopIcon: JInternalFrame$JDesktopIcon;
    let c = f.getParent();
    let d = f.getDesktopPane();
    let findNext = f.isSelected();
    desktopIcon = f.getDesktopIcon();
    if (!this.wasIcon(f)) {
      let r = this.getBoundsForIconOf(f);
      desktopIcon.setBounds$int$int$int$int(r.x_, r.y_, r.width_, r.height_);
      desktopIcon.revalidate();
      this.setWasIcon(f, true);
    }
    if (c == null || d == null) {
      return;
    }
    if (c instanceof JLayeredPane) {
      let lp = c;
      let layer = JLayeredPane.getLayer(f);
      JLayeredPane.putLayer(desktopIcon, layer);
    }
    d.setComponentOrderCheckingEnabled(true);
    c.remove$Component(f);
    c.add$Component(desktopIcon);
    if (findNext) {
      if (d.selectFrame(true) == null) {
        f.restoreSubcomponentFocus();
      }
    }
    c.repaint$int$int$int$int(f.getX(), f.getY(), f.getWidth(), f.getHeight());
  }
  /**
   * Removes the desktopIcon from its parent and adds its frame
   * to the parent.
   * @param f the <code>JInternalFrame</code> to be de-iconified
   */
  deiconifyFrame(f: JInternalFrame): void {
    let desktopIcon = f.getDesktopIcon();
    let c = desktopIcon.getParent();
    let d = f.getDesktopPane();
    if (c != null && d != null) {
      c.add$Component(f);
      if (f.isMaximum()) {
        let desktopBounds = c.getBounds$();
        if (f.getWidth() !== desktopBounds.width_ || f.getHeight() !== desktopBounds.height_) {
          this.setBoundsForFrame(f, 0, 0, desktopBounds.width_, desktopBounds.height_);
        }
      }
      this.removeIconFor(f);
      if (f.isSelected()) {
        f.moveToFront();
        f.restoreSubcomponentFocus();
      } else {
        try {
          f.setSelected(true);
        } catch ($e5) {
          if ($J.isa($e5, PropertyVetoException)) {
            let e2 = $J.exc($e5);
          } else {
            throw $e5;
          }
        }
      }
    }
  }
  /**
   * This will activate <b>f</b> moving it to the front. It will
   * set the current active frame's (if any)
   * <code>IS_SELECTED_PROPERTY</code> to <code>false</code>.
   * There can be only one active frame across all Layers.
   * @param f the <code>JInternalFrame</code> to be activated
   */
  activateFrame(f: JInternalFrame): void {
    let p = f.getParent();
    let c: Component[];
    let d = f.getDesktopPane();
    let currentlyActiveFrame = (d == null) ? null : d.getSelectedFrame();
    if (p == null) {
      p = f.getDesktopIcon().getParent();
      if (p == null) {
        return;
      }
    }
    if (currentlyActiveFrame == null) {
      if (d != null) {
        d.setSelectedFrame(f);
      }
    } else if (currentlyActiveFrame !== f) {
      if (currentlyActiveFrame.isSelected()) {
        try {
          currentlyActiveFrame.setSelected(false);
        } catch ($e6) {
          if ($J.isa($e6, PropertyVetoException)) {
            let e2 = $J.exc($e6);
          } else {
            throw $e6;
          }
        }
      }
      if (d != null) {
        d.setSelectedFrame(f);
      }
    }
    f.moveToFront();
  }
  deactivateFrame(f: JInternalFrame): void {
    let d = f.getDesktopPane();
    let currentlyActiveFrame = (d == null) ? null : d.getSelectedFrame();
    if (currentlyActiveFrame === f) {
      d.setSelectedFrame(null);
    }
  }
  beginDraggingFrame(f: JComponent): void {
    this.setupDragMode(f);
    if (this.dragMode === DefaultDesktopManager.FASTER_DRAG_MODE) {
      let desktop = f.getParent();
      this.floatingItems = this.findFloatingItems(f);
      this.currentBounds = f.getBounds$();
      if (desktop instanceof JComponent) {
        this.desktopBounds = (desktop).getVisibleRect();
      } else {
        this.desktopBounds = desktop.getBounds$();
        this.desktopBounds.x_ = this.desktopBounds.y_ = 0;
      }
      this.desktopGraphics = JComponent.safelyGetGraphics$Component(desktop);
      (f).isDragging_ = true;
      this.didDrag = false;
    }
  }
  setupDragMode(f: JComponent): void {
    let p = this.getDesktopPane(f);
    let parent = f.getParent();
    this.dragMode = DefaultDesktopManager.DEFAULT_DRAG_MODE;
    if (p != null) {
      let mode = p.getClientProperty('JDesktopPane.dragMode');
      let window = SwingUtilities.getWindowAncestor(f);
      if (window != null && !window.isOpaque()) {
        this.dragMode = DefaultDesktopManager.DEFAULT_DRAG_MODE;
      } else if ($J.equals('outline', mode)) {
        this.dragMode = DefaultDesktopManager.OUTLINE_DRAG_MODE;
      } else if ($J.equals('faster', mode) && f instanceof JInternalFrame && (f).isOpaque() && (parent == null || parent.isOpaque())) {
        this.dragMode = DefaultDesktopManager.FASTER_DRAG_MODE;
      } else {
        if (p.getDragMode() === JDesktopPane.OUTLINE_DRAG_MODE) {
          this.dragMode = DefaultDesktopManager.OUTLINE_DRAG_MODE;
        } else if (p.getDragMode() === JDesktopPane.LIVE_DRAG_MODE && f instanceof JInternalFrame && (f).isOpaque()) {
          this.dragMode = DefaultDesktopManager.FASTER_DRAG_MODE;
        } else {
          this.dragMode = DefaultDesktopManager.DEFAULT_DRAG_MODE;
        }
      }
    }
  }
  /**
   * Moves the visible location of the frame being dragged
   * to the location specified.  The means by which this occurs can vary depending
   * on the dragging algorithm being used.  The actual logical location of the frame
   * might not change until <code>endDraggingFrame</code> is called.
   */
  dragFrame(f: JComponent, newX: number, newY: number): void {
    if (this.dragMode === DefaultDesktopManager.OUTLINE_DRAG_MODE) {
      let desktopPane = this.getDesktopPane(f);
      if (desktopPane != null) {
        let g = JComponent.safelyGetGraphics$Component(desktopPane);
        g.setXORMode(Color.white);
        if (this.currentLoc != null) {
          g.drawRect(this.currentLoc.x_, this.currentLoc.y_, (f.getWidth() - 1) | 0, (f.getHeight() - 1) | 0);
        }
        g.drawRect(newX, newY, (f.getWidth() - 1) | 0, (f.getHeight() - 1) | 0);
        let sData = (g).getSurfaceData();
        if (!sData.isSurfaceLost()) {
          this.currentLoc = new Point()._Point$int$int(newX, newY);
        }
        g.dispose();
      }
    } else if (this.dragMode === DefaultDesktopManager.FASTER_DRAG_MODE) {
      this.dragFrameFaster(f, newX, newY);
    } else {
      this.setBoundsForFrame(f, newX, newY, f.getWidth(), f.getHeight());
    }
  }
  endDraggingFrame(f: JComponent): void {
    if (this.dragMode === DefaultDesktopManager.OUTLINE_DRAG_MODE && this.currentLoc != null) {
      this.setBoundsForFrame(f, this.currentLoc.x_, this.currentLoc.y_, f.getWidth(), f.getHeight());
      this.currentLoc = null;
    } else if (this.dragMode === DefaultDesktopManager.FASTER_DRAG_MODE) {
      this.currentBounds = null;
      if (this.desktopGraphics != null) {
        this.desktopGraphics.dispose();
        this.desktopGraphics = null;
      }
      this.desktopBounds = null;
      (f).isDragging_ = false;
    }
  }
  beginResizingFrame(f: JComponent, direction: number): void {
    this.setupDragMode(f);
  }
  /**
   * Calls <code>setBoundsForFrame</code> with the new values.
   * @param f the component to be resized
   * @param newX the new x-coordinate
   * @param newY the new y-coordinate
   * @param newWidth the new width
   * @param newHeight the new height
   */
  resizeFrame(f: JComponent, newX: number, newY: number, newWidth: number, newHeight: number): void {
    if (this.dragMode === DefaultDesktopManager.DEFAULT_DRAG_MODE || this.dragMode === DefaultDesktopManager.FASTER_DRAG_MODE) {
      this.setBoundsForFrame(f, newX, newY, newWidth, newHeight);
    } else {
      let desktopPane = this.getDesktopPane(f);
      if (desktopPane != null) {
        let g = JComponent.safelyGetGraphics$Component(desktopPane);
        g.setXORMode(Color.white);
        if (this.currentBounds != null) {
          g.drawRect(this.currentBounds.x_, this.currentBounds.y_, (this.currentBounds.width_ - 1) | 0, (this.currentBounds.height_ - 1) | 0);
        }
        g.drawRect(newX, newY, (newWidth - 1) | 0, (newHeight - 1) | 0);
        let sData = (g).getSurfaceData();
        if (!sData.isSurfaceLost()) {
          this.currentBounds = new Rectangle()._Rectangle$int$int$int$int(newX, newY, newWidth, newHeight);
        }
        g.setPaintMode();
        g.dispose();
      }
    }
  }
  endResizingFrame(f: JComponent): void {
    if (this.dragMode === DefaultDesktopManager.OUTLINE_DRAG_MODE && this.currentBounds != null) {
      this.setBoundsForFrame(f, this.currentBounds.x_, this.currentBounds.y_, this.currentBounds.width_, this.currentBounds.height_);
      this.currentBounds = null;
    }
  }
  /**
   * This moves the <code>JComponent</code> and repaints the damaged areas.
   */
  setBoundsForFrame(f: JComponent, newX: number, newY: number, newWidth: number, newHeight: number): void {
    f.setBounds$int$int$int$int(newX, newY, newWidth, newHeight);
    f.revalidate();
  }
  /**
   * Convenience method to remove the desktopIcon of <b>f</b> is necessary.
   *
   * @param f the {@code JInternalFrame} for which to remove the
   *          {@code desktopIcon}
   */
  removeIconFor(f: JInternalFrame): void {
    let di = f.getDesktopIcon();
    let c = di.getParent();
    if (c != null) {
      c.remove$Component(di);
      c.repaint$int$int$int$int(di.getX(), di.getY(), di.getWidth(), di.getHeight());
    }
  }
  /**
   * The {@code iconifyFrame()} code calls this to determine the proper bounds
   * for the desktopIcon.
   *
   * @param f the {@code JInternalFrame} of interest
   * @return a {@code Rectangle} containing bounds for the {@code desktopIcon}
   */
  getBoundsForIconOf(f: JInternalFrame): Rectangle {
    let icon = f.getDesktopIcon();
    let prefSize = icon.getPreferredSize$();
    let c = f.getParent();
    if (c == null) {
      c = f.getDesktopIcon().getParent();
    }
    if (c == null) {
      return new Rectangle()._Rectangle$int$int$int$int(0, 0, prefSize.width_, prefSize.height_);
    }
    let parentBounds = c.getBounds$();
    let components = c.getComponents();
    let availableRectangle = null;
    let currentIcon = null;
    let x = 0;
    let y = (parentBounds.height_ - prefSize.height_) | 0;
    let w = prefSize.width_;
    let h = prefSize.height_;
    let found = false;
    while (!found) {
      availableRectangle = new Rectangle()._Rectangle$int$int$int$int(x, y, w, h);
      found = true;
      for (let i = 0; i < components.length; i++) {
        if (components[i] instanceof JInternalFrame) {
          currentIcon = (components[i]).getDesktopIcon();
        } else if (components[i] instanceof JInternalFrame$JDesktopIcon) {
          currentIcon = components[i];
        } else {
          continue;
        }
        if (!currentIcon.equals(icon)) {
          if (availableRectangle.intersects$Rectangle(currentIcon.getBounds$())) {
            found = false;
            break;
          }
        }
      }
      if (currentIcon == null) {
        return availableRectangle;
      }
      x = (x + currentIcon.getBounds$().width_) | 0;
      if (((x + w) | 0) > parentBounds.width_) {
        x = 0;
        y = (y - h) | 0;
      }
    }
    return (availableRectangle);
  }
  /**
   * Sets that the component has been iconized and the bounds of the
   * <code>desktopIcon</code> are valid.
   *
   * @param f     the {@code JInternalFrame} of interest
   * @param value a {@code Boolean} signifying if component has been iconized
   */
  setWasIcon(f: JInternalFrame, value: boolean): void {
    if (value != null) {
      f.putClientProperty(DefaultDesktopManager.HAS_BEEN_ICONIFIED_PROPERTY, value);
    }
  }
  /**
   * Returns <code>true</code> if the component has been iconized
   * and the bounds of the <code>desktopIcon</code> are valid,
   * otherwise returns <code>false</code>.
   *
   * @param f the <code>JInternalFrame</code> of interest
   * @return <code>true</code> if the component has been iconized;
   *    otherwise returns <code>false</code>
   */
  wasIcon(f: JInternalFrame): boolean {
    return (f.getClientProperty(DefaultDesktopManager.HAS_BEEN_ICONIFIED_PROPERTY) === true);
  }
  getDesktopPane(frame: JComponent): JDesktopPane {
    let pane = null;
    let c = frame.getParent();
    while (pane == null) {
      if (c instanceof JDesktopPane) {
        pane = c;
      } else if (c == null) {
        break;
      } else {
        c = c.getParent();
      }
    }
    return pane;
  }
  dragFrameFaster(f: JComponent, newX: number, newY: number): void {
    let previousBounds = new Rectangle()._Rectangle$int$int$int$int(this.currentBounds.x_, this.currentBounds.y_, this.currentBounds.width_, this.currentBounds.height_);
    this.currentBounds.x_ = newX;
    this.currentBounds.y_ = newY;
    if (this.didDrag) {
      this.emergencyCleanup(f);
    } else {
      this.didDrag = true;
      (f).danger = false;
    }
    let floaterCollision = this.isFloaterCollision(previousBounds, this.currentBounds);
    let parent = f.getParent();
    let visBounds = previousBounds.intersection(this.desktopBounds);
    let currentManager = RepaintManager.currentManager$JComponent(f);
    currentManager.beginPaint();
    try {
      if (!floaterCollision) {
        currentManager.copyArea(parent, this.desktopGraphics, visBounds.x_, visBounds.y_, visBounds.width_, visBounds.height_, (newX - previousBounds.x_) | 0, (newY - previousBounds.y_) | 0, true);
      }
      f.setBounds$Rectangle(this.currentBounds);
      if (!floaterCollision) {
        let r = this.currentBounds;
        currentManager.notifyRepaintPerformed(parent, r.x_, r.y_, r.width_, r.height_);
      }
      if (floaterCollision) {
        (f).isDragging_ = false;
        parent.paintImmediately$Rectangle(this.currentBounds);
        (f).isDragging_ = true;
      }
      currentManager.markCompletelyClean(parent);
      currentManager.markCompletelyClean(f);
      let dirtyRects = null;
      if (previousBounds.intersects$Rectangle(this.currentBounds)) {
        dirtyRects = SwingUtilities.computeDifference(previousBounds, this.currentBounds);
      } else {
        dirtyRects = $J.newArray(1, null);
        dirtyRects[0] = previousBounds;
      }
      for (let i = 0; i < dirtyRects.length; i++) {
        parent.paintImmediately$Rectangle(dirtyRects[i]);
        let r = dirtyRects[i];
        currentManager.notifyRepaintPerformed(parent, r.x_, r.y_, r.width_, r.height_);
      }
      if (!(visBounds.equals(previousBounds))) {
        dirtyRects = SwingUtilities.computeDifference(previousBounds, this.desktopBounds);
        for (let i = 0; i < dirtyRects.length; i++) {
          dirtyRects[i].x_ = (dirtyRects[i].x_ + (newX - previousBounds.x_)) | 0;
          dirtyRects[i].y_ = (dirtyRects[i].y_ + (newY - previousBounds.y_)) | 0;
          (f).isDragging_ = false;
          parent.paintImmediately$Rectangle(dirtyRects[i]);
          (f).isDragging_ = true;
          let r = dirtyRects[i];
          currentManager.notifyRepaintPerformed(parent, r.x_, r.y_, r.width_, r.height_);
        }
      }
    } finally {
      currentManager.endPaint();
    }
    let topLevel = SwingUtilities.getWindowAncestor(f);
    let tk = Toolkit.getDefaultToolkit();
    if (!topLevel.isOpaque() && ($J.isa(tk, SunToolkit)) && (tk).needUpdateWindow()) {
      AWTAccessor.getWindowAccessor().updateWindow(topLevel);
    }
  }
  isFloaterCollision(moveFrom: Rectangle, moveTo: Rectangle): boolean {
    if (this.floatingItems.length === 0) {
      return false;
    }
    for (let i = 0; i < this.floatingItems.length; i++) {
      let intersectsFrom = moveFrom.intersects$Rectangle(this.floatingItems[i]);
      if (intersectsFrom) {
        return true;
      }
      let intersectsTo = moveTo.intersects$Rectangle(this.floatingItems[i]);
      if (intersectsTo) {
        return true;
      }
    }
    return false;
  }
  findFloatingItems(f: JComponent): Rectangle[] {
    let desktop = f.getParent();
    let children = desktop.getComponents();
    let i = 0;
    for (i = 0; i < children.length; i++) {
      if (children[i] === f) {
        break;
      }
    }
    let floaters = $J.newArray(i, null);
    for (i = 0; i < floaters.length; i++) {
      floaters[i] = children[i].getBounds$();
    }
    return floaters;
  }
  /**
   * This method is here to clean up problems associated
   * with a race condition which can occur when the full contents
   * of a copyArea's source argument is not available onscreen.
   * This uses brute force to clean up in case of possible damage
   */
  emergencyCleanup(f: JComponent): void {
    if ((f).danger) {
      SwingUtilities.invokeLater(() => {
        (f).isDragging_ = false;
        f.paintImmediately$int$int$int$int(0, 0, f.getWidth(), f.getHeight());
        (f).isDragging_ = true;
      });
      (f).danger = false;
    }
  }
}

$J.define(DefaultDesktopManager, 'javax.swing.DefaultDesktopManager', { kind: 'class', ifaces: ['javax.swing.DesktopManager', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_DefaultDesktopManager' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  PropertyVetoException = $J.load('java.beans.PropertyVetoException');
  JComponent = $J.load('javax.swing.JComponent');
  JDesktopPane = $J.load('javax.swing.JDesktopPane');
  JInternalFrame = $J.load('javax.swing.JInternalFrame');
  JInternalFrame$JDesktopIcon = $J.load('javax.swing.JInternalFrame$JDesktopIcon');
  JLayeredPane = $J.load('javax.swing.JLayeredPane');
  RepaintManager = $J.load('javax.swing.RepaintManager');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
});
