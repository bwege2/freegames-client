// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/SwingUtilities.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, AccessController, AppContext, Applet, Character, Exception, GetPropertyAction, JClass, JError, JObject, JString, ReflectUtil, StringBuffer, Thread } from '../../../jre/index.ts';
import { Frame } from '../../java/awt/Frame.ts';

let Component, Container, EventQueue, GraphicsEnvironment, IllegalComponentStateException, KeyboardFocusManager, Point, Rectangle, Window, ActionEvent, InputEvent, KeyEvent, MouseEvent, MouseWheelEvent, Action, CellRendererPane, DefaultCellEditor, JComponent, JComponent$ActionStandin, JLayer, JMenu, JRootPane, JToggleButton, RootPaneContainer, SwingConstants, TransferHandler$SwingDropTarget, MenuDragMouseEvent, UIResource, View, AWTAccessor, SwingUtilities2;

/**
 * A collection of utility methods for Swing.
 *
 * @since 1.2
 */
export class SwingUtilities extends JObject {
  static canAccessEventQueue: boolean = false;
  static eventQueueTested: boolean = false;
  /**
   * Indicates if we should change the drop target when a
   * {@code TransferHandler} is set.
   */
  static suppressDropSupport: boolean = false;
  /**
   * Indicates if we've checked the system property for suppressing
   * drop support.
   */
  static checkedSuppressDropSupport: boolean = false;
  static sharedOwnerFrameKey: any = null;
  /**
   * Returns true if <code>setTransferHandler</code> should change the
   * <code>DropTarget</code>.
   */
  static getSuppressDropTarget(): boolean {
    if (!SwingUtilities.checkedSuppressDropSupport) {
      SwingUtilities.suppressDropSupport = $J.parseBoolean(AccessController.doPrivileged(new GetPropertyAction('suppressSwingDropSupport')));
      SwingUtilities.checkedSuppressDropSupport = true;
    }
    return SwingUtilities.suppressDropSupport;
  }
  /**
   * Installs a {@code DropTarget} on the component as necessary for a
   * {@code TransferHandler} change.
   */
  static installSwingDropTargetAsNecessary(c: Component, t: TransferHandler): void {
    if (!SwingUtilities.getSuppressDropTarget()) {
      let dropHandler = c.getDropTarget();
      if ((dropHandler == null) || ($J.isa(dropHandler, UIResource))) {
        if (t == null) {
          c.setDropTarget(null);
        } else if (!GraphicsEnvironment.isHeadless()) {
          c.setDropTarget(new TransferHandler$SwingDropTarget()._TransferHandler$SwingDropTarget(c));
        }
      }
    }
  }
  /**
   * Return {@code true} if {@code a} contains {@code b}
   *
   * @param a the first rectangle
   * @param b the second rectangle
   *
   * @return {@code true} if {@code a} contains {@code b}
   */
  static isRectangleContainingRectangle(a: Rectangle, b: Rectangle): boolean {
    return b.x_ >= a.x_ && ((b.x_ + b.width_) | 0) <= ((a.x_ + a.width_) | 0) && b.y_ >= a.y_ && ((b.y_ + b.height_) | 0) <= ((a.y_ + a.height_) | 0);
  }
  /**
   * Returns the first <code>Window </code> ancestor of <code>c</code>, or
   * {@code null} if <code>c</code> is not contained inside a <code>Window</code>.
   *
   * @param c <code>Component</code> to get <code>Window</code> ancestor
   *        of.
   * @return the first <code>Window </code> ancestor of <code>c</code>, or
   *         {@code null} if <code>c</code> is not contained inside a
   *         <code>Window</code>.
   * @since 1.3
   */
  static getWindowAncestor(c: Component): Window {
    for (let p = c.getParent(); p != null; p = p.getParent()) {
      if (p instanceof Window) {
        return p;
      }
    }
    return null;
  }
  /**
   * Converts the location <code>x</code> <code>y</code> to the
   * parents coordinate system, returning the location.
   */
  static convertScreenLocationToParent(parent: Container, x: number, y: number): Point {
    for (let p = parent; p != null; p = p.getParent()) {
      if (p instanceof Window) {
        let point = new Point()._Point$int$int(x, y);
        SwingUtilities.convertPointFromScreen(point, parent);
        return point;
      }
    }
    throw new JError('convertScreenLocationToParent: no window ancestor');
  }
  /**
   * Convert a <code>aPoint</code> in <code>source</code> coordinate system to
   * <code>destination</code> coordinate system.
   * If <code>source</code> is {@code null}, <code>aPoint</code> is assumed to be in <code>destination</code>'s
   * root component coordinate system.
   * If <code>destination</code> is {@code null}, <code>aPoint</code> will be converted to <code>source</code>'s
   * root component coordinate system.
   * If both <code>source</code> and <code>destination</code> are {@code null}, return <code>aPoint</code>
   * without any conversion.
   *
   * @param source the source component
   * @param aPoint the point
   * @param destination the destination component
   *
   * @return the converted coordinate
   */
  static convertPoint$Component$Point$Component(source: Component, aPoint: Point, destination: Component): Point {
    let p: Point;
    if (source == null && destination == null) {
      return aPoint;
    }
    if (source == null) {
      source = SwingUtilities.getWindowAncestor(destination);
      if (source == null) {
        throw new JError('Source component not connected to component tree hierarchy');
      }
    }
    p = new Point()._Point$Point(aPoint);
    SwingUtilities.convertPointToScreen(p, source);
    if (destination == null) {
      destination = SwingUtilities.getWindowAncestor(source);
      if (destination == null) {
        throw new JError('Destination component not connected to component tree hierarchy');
      }
    }
    SwingUtilities.convertPointFromScreen(p, destination);
    return p;
  }
  /**
   * Convert the point <code>(x,y)</code> in <code>source</code> coordinate system to
   * <code>destination</code> coordinate system.
   * If <code>source</code> is {@code null}, <code>(x,y)</code> is assumed to be in <code>destination</code>'s
   * root component coordinate system.
   * If <code>destination</code> is {@code null}, <code>(x,y)</code> will be converted to <code>source</code>'s
   * root component coordinate system.
   * If both <code>source</code> and <code>destination</code> are {@code null}, return <code>(x,y)</code>
   * without any conversion.
   *
   * @param source the source component
   * @param x the x-coordinate of the point
   * @param y the y-coordinate of the point
   * @param destination the destination component
   *
   * @return the converted coordinate
   */
  static convertPoint$Component$int$int$Component(source: Component, x: number, y: number, destination: Component): Point {
    let point = new Point()._Point$int$int(x, y);
    return SwingUtilities.convertPoint$Component$Point$Component(source, point, destination);
  }
  /**
   * Convert the rectangle <code>aRectangle</code> in <code>source</code> coordinate system to
   * <code>destination</code> coordinate system.
   * If <code>source</code> is {@code null}, <code>aRectangle</code> is assumed to be in <code>destination</code>'s
   * root component coordinate system.
   * If <code>destination</code> is {@code null}, <code>aRectangle</code> will be converted to <code>source</code>'s
   * root component coordinate system.
   * If both <code>source</code> and <code>destination</code> are {@code null}, return <code>aRectangle</code>
   * without any conversion.
   *
   * @param source the source component
   * @param aRectangle a rectangle
   * @param destination the destination component
   *
   * @return the converted rectangle
   */
  static convertRectangle(source: Component, aRectangle: Rectangle, destination: Component): Rectangle {
    let point = new Point()._Point$int$int(aRectangle.x_, aRectangle.y_);
    point = SwingUtilities.convertPoint$Component$Point$Component(source, point, destination);
    return new Rectangle()._Rectangle$int$int$int$int(point.x_, point.y_, aRectangle.width_, aRectangle.height_);
  }
  /**
   * Convenience method for searching above <code>comp</code> in the
   * component hierarchy and returns the first object of class <code>c</code> it
   * finds. Can return {@code null}, if a class <code>c</code> cannot be found.
   *
   * @param c the class of a component
   * @param comp the component
   *
   * @return the ancestor of the {@code comp},
   *         or {@code null} if {@code c} cannot be found.
   */
  static getAncestorOfClass(c: JClass<any>, comp: Component): Container {
    if (comp == null || c == null) {
      return null;
    }
    let parent = comp.getParent();
    while (parent != null && !(c.isInstance(parent))) {
      parent = parent.getParent();
    }
    return parent;
  }
  /**
   * Returns the deepest visible descendent Component of <code>parent</code>
   * that contains the location <code>x</code>, <code>y</code>.
   * If <code>parent</code> does not contain the specified location,
   * then <code>null</code> is returned.  If <code>parent</code> is not a
   * container, or none of <code>parent</code>'s visible descendents
   * contain the specified location, <code>parent</code> is returned.
   *
   * @param parent the root component to begin the search
   * @param x the x target location
   * @param y the y target location
   *
   * @return the deepest component
   */
  static getDeepestComponentAt(parent: Component, x: number, y: number): Component {
    if (!parent.contains$int$int(x, y)) {
      return null;
    }
    if (parent instanceof Container) {
      let components = (parent).getComponents();
      for (let comp of components) {
        if (comp != null && comp.isVisible$()) {
          let loc = comp.getLocation$();
          if (comp instanceof Container) {
            comp = SwingUtilities.getDeepestComponentAt(comp, (x - loc.x_) | 0, (y - loc.y_) | 0);
          } else {
            comp = comp.getComponentAt$int$int((x - loc.x_) | 0, (y - loc.y_) | 0);
          }
          if (comp != null && comp.isVisible$()) {
            return comp;
          }
        }
      }
    }
    return parent;
  }
  /**
   * Returns a MouseEvent similar to <code>sourceEvent</code> except that its x
   * and y members have been converted to <code>destination</code>'s coordinate
   * system.  If <code>source</code> is {@code null}, <code>sourceEvent</code> x and y members
   * are assumed to be into <code>destination</code>'s root component coordinate system.
   * If <code>destination</code> is <code>null</code>, the
   * returned MouseEvent will be in <code>source</code>'s coordinate system.
   * <code>sourceEvent</code> will not be changed. A new event is returned.
   * the <code>source</code> field of the returned event will be set
   * to <code>destination</code> if destination is non-{@code null}
   * use the translateMouseEvent() method to translate a mouse event from
   * one component to another without changing the source.
   *
   * @param source the source component
   * @param sourceEvent the source mouse event
   * @param destination the destination component
   *
   * @return the new mouse event
   */
  static convertMouseEvent(source: Component, sourceEvent: MouseEvent, destination: Component): MouseEvent {
    let p = SwingUtilities.convertPoint$Component$Point$Component(source, new Point()._Point$int$int(sourceEvent.getX(), sourceEvent.getY()), destination);
    let newSource: Component;
    if (destination != null) {
      newSource = destination;
    } else {
      newSource = source;
    }
    let newEvent: MouseEvent;
    if (sourceEvent instanceof MouseWheelEvent) {
      let sourceWheelEvent = sourceEvent;
      newEvent = new MouseWheelEvent()._MouseWheelEvent$Component$int$long$int$int$int$int$int$int$boolean$int$int$int$double(newSource, sourceWheelEvent.getID(), sourceWheelEvent.getWhen(), sourceWheelEvent.getModifiers() | sourceWheelEvent.getModifiersEx(), p.x_, p.y_, sourceWheelEvent.getXOnScreen(), sourceWheelEvent.getYOnScreen(), sourceWheelEvent.getClickCount(), sourceWheelEvent.isPopupTrigger(), sourceWheelEvent.getScrollType(), sourceWheelEvent.getScrollAmount(), sourceWheelEvent.getWheelRotation(), sourceWheelEvent.getPreciseWheelRotation());
    } else if (sourceEvent instanceof MenuDragMouseEvent) {
      let sourceMenuDragEvent = sourceEvent;
      newEvent = new MenuDragMouseEvent()._MenuDragMouseEvent$Component$int$long$int$int$int$int$int$int$boolean$MenuElementArr$MenuSelectionManager(newSource, sourceMenuDragEvent.getID(), sourceMenuDragEvent.getWhen(), sourceMenuDragEvent.getModifiers() | sourceMenuDragEvent.getModifiersEx(), p.x_, p.y_, sourceMenuDragEvent.getXOnScreen(), sourceMenuDragEvent.getYOnScreen(), sourceMenuDragEvent.getClickCount(), sourceMenuDragEvent.isPopupTrigger(), sourceMenuDragEvent.getPath(), sourceMenuDragEvent.getMenuSelectionManager());
    } else {
      newEvent = new MouseEvent()._MouseEvent$Component$int$long$int$int$int$int$int$int$boolean$int(newSource, sourceEvent.getID(), sourceEvent.getWhen(), sourceEvent.getModifiers() | sourceEvent.getModifiersEx(), p.x_, p.y_, sourceEvent.getXOnScreen(), sourceEvent.getYOnScreen(), sourceEvent.getClickCount(), sourceEvent.isPopupTrigger(), sourceEvent.getButton());
      let meAccessor = AWTAccessor.getMouseEventAccessor();
      meAccessor.setCausedByTouchEvent(newEvent, meAccessor.isCausedByTouchEvent(sourceEvent));
    }
    return newEvent;
  }
  /**
   * Convert a point from a component's coordinate system to
   * screen coordinates.
   *
   * @param p  a Point object (converted to the new coordinate system)
   * @param c  a Component object
   */
  static convertPointToScreen(p: Point, c: Component): void {
    let b: Rectangle;
    let x: number;
    let y: number;
    do {
      if (c instanceof JComponent) {
        x = c.getX();
        y = c.getY();
      } else if ($J.isa(c, Applet) || c instanceof Window) {
        try {
          let pp = c.getLocationOnScreen();
          x = pp.x_;
          y = pp.y_;
        } catch ($e0) {
          if ($J.isa($e0, IllegalComponentStateException)) {
            let icse = $J.exc($e0);
            x = c.getX();
            y = c.getY();
          } else {
            throw $e0;
          }
        }
      } else {
        x = c.getX();
        y = c.getY();
      }
      p.x_ = (p.x_ + x) | 0;
      p.y_ = (p.y_ + y) | 0;
      if (c instanceof Window || $J.isa(c, Applet)) {
        break;
      }
      c = c.getParent();
    } while (c != null);
  }
  /**
   * Convert a point from a screen coordinates to a component's
   * coordinate system
   *
   * @param p  a Point object (converted to the new coordinate system)
   * @param c  a Component object
   */
  static convertPointFromScreen(p: Point, c: Component): void {
    let b: Rectangle;
    let x: number;
    let y: number;
    do {
      if (c instanceof JComponent) {
        x = c.getX();
        y = c.getY();
      } else if ($J.isa(c, Applet) || c instanceof Window) {
        try {
          let pp = c.getLocationOnScreen();
          x = pp.x_;
          y = pp.y_;
        } catch ($e1) {
          if ($J.isa($e1, IllegalComponentStateException)) {
            let icse = $J.exc($e1);
            x = c.getX();
            y = c.getY();
          } else {
            throw $e1;
          }
        }
      } else {
        x = c.getX();
        y = c.getY();
      }
      p.x_ = (p.x_ - x) | 0;
      p.y_ = (p.y_ - y) | 0;
      if (c instanceof Window || $J.isa(c, Applet)) {
        break;
      }
      c = c.getParent();
    } while (c != null);
  }
  /**
   * Returns the first <code>Window </code> ancestor of <code>c</code>, or
   * {@code null} if <code>c</code> is not contained inside a <code>Window</code>.
   * <p>
   * Note: This method provides the same functionality as
   * <code>getWindowAncestor</code>.
   *
   * @param c <code>Component</code> to get <code>Window</code> ancestor
   *        of.
   * @return the first <code>Window </code> ancestor of <code>c</code>, or
   *         {@code null} if <code>c</code> is not contained inside a
   *         <code>Window</code>.
   */
  static windowForComponent(c: Component): Window {
    return SwingUtilities.getWindowAncestor(c);
  }
  /**
   * Return {@code true} if a component {@code a} descends from a component {@code b}
   *
   * @param a the first component
   * @param b the second component
   * @return {@code true} if a component {@code a} descends from a component {@code b}
   */
  static isDescendingFrom(a: Component, b: Component): boolean {
    if (a === b) {
      return true;
    }
    for (let p = a.getParent(); p != null; p = p.getParent()) {
      if (p === b) {
        return true;
      }
    }
    return false;
  }
  /**
   * Convenience to calculate the intersection of two rectangles
   * without allocating a new rectangle.
   * If the two rectangles don't intersect,
   * then the returned rectangle begins at (0,0)
   * and has zero width and height.
   *
   * @param x       the X coordinate of the first rectangle's top-left point
   * @param y       the Y coordinate of the first rectangle's top-left point
   * @param width   the width of the first rectangle
   * @param height  the height of the first rectangle
   * @param dest    the second rectangle
   *
   * @return <code>dest</code>, modified to specify the intersection
   */
  static computeIntersection(x: number, y: number, width: number, height: number, dest: Rectangle): Rectangle {
    let x1 = (x > dest.x_) ? x : dest.x_;
    let x2 = (((x + width) | 0) < ((dest.x_ + dest.width_) | 0)) ? ((x + width) | 0) : ((dest.x_ + dest.width_) | 0);
    let y1 = (y > dest.y_) ? y : dest.y_;
    let y2 = (((y + height) | 0) < ((dest.y_ + dest.height_) | 0) ? ((y + height) | 0) : ((dest.y_ + dest.height_) | 0));
    dest.x_ = x1;
    dest.y_ = y1;
    dest.width_ = (x2 - x1) | 0;
    dest.height_ = (y2 - y1) | 0;
    if (dest.width_ < 0 || dest.height_ < 0) {
      dest.x_ = dest.y_ = dest.width_ = dest.height_ = 0;
    }
    return dest;
  }
  /**
   * Convenience method that calculates the union of two rectangles
   * without allocating a new rectangle.
   *
   * @param x the x-coordinate of the first rectangle
   * @param y the y-coordinate of the first rectangle
   * @param width the width of the first rectangle
   * @param height the height of the first rectangle
   * @param dest  the coordinates of the second rectangle; the union
   *    of the two rectangles is returned in this rectangle
   * @return the <code>dest</code> <code>Rectangle</code>
   */
  static computeUnion(x: number, y: number, width: number, height: number, dest: Rectangle): Rectangle {
    let x1 = (x < dest.x_) ? x : dest.x_;
    let x2 = (((x + width) | 0) > ((dest.x_ + dest.width_) | 0)) ? ((x + width) | 0) : ((dest.x_ + dest.width_) | 0);
    let y1 = (y < dest.y_) ? y : dest.y_;
    let y2 = (((y + height) | 0) > ((dest.y_ + dest.height_) | 0)) ? ((y + height) | 0) : ((dest.y_ + dest.height_) | 0);
    dest.x_ = x1;
    dest.y_ = y1;
    dest.width_ = ((x2 - x1) | 0);
    dest.height_ = ((y2 - y1) | 0);
    return dest;
  }
  /**
   * Convenience returning an array of rect representing the regions within
   * <code>rectA</code> that do not overlap with <code>rectB</code>. If the
   * two Rects do not overlap, returns an empty array
   *
   * @param rectA the first rectangle
   * @param rectB the second rectangle
   *
   * @return an array of rectangles representing the regions within {@code rectA}
   *         that do not overlap with {@code rectB}.
   */
  static computeDifference(rectA: Rectangle, rectB: Rectangle): Rectangle[] {
    if (rectB == null || !rectA.intersects$Rectangle(rectB) || SwingUtilities.isRectangleContainingRectangle(rectB, rectA)) {
      return $J.newArray(0, null);
    }
    let t = new Rectangle()._Rectangle$();
    let a = null;
    let b = null;
    let c = null;
    let d = null;
    let result: Rectangle[];
    let rectCount = 0;
    if (SwingUtilities.isRectangleContainingRectangle(rectA, rectB)) {
      t.x_ = rectA.x_;
      t.y_ = rectA.y_;
      t.width_ = (rectB.x_ - rectA.x_) | 0;
      t.height_ = rectA.height_;
      if (t.width_ > 0 && t.height_ > 0) {
        a = new Rectangle()._Rectangle$Rectangle(t);
        rectCount++;
      }
      t.x_ = rectB.x_;
      t.y_ = rectA.y_;
      t.width_ = rectB.width_;
      t.height_ = (rectB.y_ - rectA.y_) | 0;
      if (t.width_ > 0 && t.height_ > 0) {
        b = new Rectangle()._Rectangle$Rectangle(t);
        rectCount++;
      }
      t.x_ = rectB.x_;
      t.y_ = (rectB.y_ + rectB.height_) | 0;
      t.width_ = rectB.width_;
      t.height_ = (rectA.y_ + rectA.height_ - (rectB.y_ + rectB.height_)) | 0;
      if (t.width_ > 0 && t.height_ > 0) {
        c = new Rectangle()._Rectangle$Rectangle(t);
        rectCount++;
      }
      t.x_ = (rectB.x_ + rectB.width_) | 0;
      t.y_ = rectA.y_;
      t.width_ = (rectA.x_ + rectA.width_ - (rectB.x_ + rectB.width_)) | 0;
      t.height_ = rectA.height_;
      if (t.width_ > 0 && t.height_ > 0) {
        d = new Rectangle()._Rectangle$Rectangle(t);
        rectCount++;
      }
    } else {
      if (rectB.x_ <= rectA.x_ && rectB.y_ <= rectA.y_) {
        if (((rectB.x_ + rectB.width_) | 0) > ((rectA.x_ + rectA.width_) | 0)) {
          t.x_ = rectA.x_;
          t.y_ = (rectB.y_ + rectB.height_) | 0;
          t.width_ = rectA.width_;
          t.height_ = (rectA.y_ + rectA.height_ - (rectB.y_ + rectB.height_)) | 0;
          if (t.width_ > 0 && t.height_ > 0) {
            a = t;
            rectCount++;
          }
        } else if (((rectB.y_ + rectB.height_) | 0) > ((rectA.y_ + rectA.height_) | 0)) {
          t.setBounds$int$int$int$int(((rectB.x_ + rectB.width_) | 0), rectA.y_, (rectA.x_ + rectA.width_ - (rectB.x_ + rectB.width_)) | 0, rectA.height_);
          if (t.width_ > 0 && t.height_ > 0) {
            a = t;
            rectCount++;
          }
        } else {
          t.setBounds$int$int$int$int(((rectB.x_ + rectB.width_) | 0), rectA.y_, (rectA.x_ + rectA.width_ - (rectB.x_ + rectB.width_)) | 0, (rectB.y_ + rectB.height_ - rectA.y_) | 0);
          if (t.width_ > 0 && t.height_ > 0) {
            a = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
          t.setBounds$int$int$int$int(rectA.x_, ((rectB.y_ + rectB.height_) | 0), rectA.width_, (rectA.y_ + rectA.height_ - (rectB.y_ + rectB.height_)) | 0);
          if (t.width_ > 0 && t.height_ > 0) {
            b = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
        }
      } else if (rectB.x_ <= rectA.x_ && ((rectB.y_ + rectB.height_) | 0) >= ((rectA.y_ + rectA.height_) | 0)) {
        if (((rectB.x_ + rectB.width_) | 0) > ((rectA.x_ + rectA.width_) | 0)) {
          t.setBounds$int$int$int$int(rectA.x_, rectA.y_, rectA.width_, (rectB.y_ - rectA.y_) | 0);
          if (t.width_ > 0 && t.height_ > 0) {
            a = t;
            rectCount++;
          }
        } else {
          t.setBounds$int$int$int$int(rectA.x_, rectA.y_, rectA.width_, (rectB.y_ - rectA.y_) | 0);
          if (t.width_ > 0 && t.height_ > 0) {
            a = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
          t.setBounds$int$int$int$int(((rectB.x_ + rectB.width_) | 0), rectB.y_, (rectA.x_ + rectA.width_ - (rectB.x_ + rectB.width_)) | 0, (rectA.y_ + rectA.height_ - rectB.y_) | 0);
          if (t.width_ > 0 && t.height_ > 0) {
            b = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
        }
      } else if (rectB.x_ <= rectA.x_) {
        if (((rectB.x_ + rectB.width_) | 0) >= ((rectA.x_ + rectA.width_) | 0)) {
          t.setBounds$int$int$int$int(rectA.x_, rectA.y_, rectA.width_, (rectB.y_ - rectA.y_) | 0);
          if (t.width_ > 0 && t.height_ > 0) {
            a = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
          t.setBounds$int$int$int$int(rectA.x_, ((rectB.y_ + rectB.height_) | 0), rectA.width_, (rectA.y_ + rectA.height_ - (rectB.y_ + rectB.height_)) | 0);
          if (t.width_ > 0 && t.height_ > 0) {
            b = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
        } else {
          t.setBounds$int$int$int$int(rectA.x_, rectA.y_, rectA.width_, (rectB.y_ - rectA.y_) | 0);
          if (t.width_ > 0 && t.height_ > 0) {
            a = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
          t.setBounds$int$int$int$int(((rectB.x_ + rectB.width_) | 0), rectB.y_, (rectA.x_ + rectA.width_ - (rectB.x_ + rectB.width_)) | 0, rectB.height_);
          if (t.width_ > 0 && t.height_ > 0) {
            b = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
          t.setBounds$int$int$int$int(rectA.x_, ((rectB.y_ + rectB.height_) | 0), rectA.width_, (rectA.y_ + rectA.height_ - (rectB.y_ + rectB.height_)) | 0);
          if (t.width_ > 0 && t.height_ > 0) {
            c = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
        }
      } else if (rectB.x_ <= ((rectA.x_ + rectA.width_) | 0) && ((rectB.x_ + rectB.width_) | 0) > ((rectA.x_ + rectA.width_) | 0)) {
        if (rectB.y_ <= rectA.y_ && ((rectB.y_ + rectB.height_) | 0) > ((rectA.y_ + rectA.height_) | 0)) {
          t.setBounds$int$int$int$int(rectA.x_, rectA.y_, (rectB.x_ - rectA.x_) | 0, rectA.height_);
          if (t.width_ > 0 && t.height_ > 0) {
            a = t;
            rectCount++;
          }
        } else if (rectB.y_ <= rectA.y_) {
          t.setBounds$int$int$int$int(rectA.x_, rectA.y_, (rectB.x_ - rectA.x_) | 0, (rectB.y_ + rectB.height_ - rectA.y_) | 0);
          if (t.width_ > 0 && t.height_ > 0) {
            a = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
          t.setBounds$int$int$int$int(rectA.x_, ((rectB.y_ + rectB.height_) | 0), rectA.width_, (rectA.y_ + rectA.height_ - (rectB.y_ + rectB.height_)) | 0);
          if (t.width_ > 0 && t.height_ > 0) {
            b = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
        } else if (((rectB.y_ + rectB.height_) | 0) > ((rectA.y_ + rectA.height_) | 0)) {
          t.setBounds$int$int$int$int(rectA.x_, rectA.y_, rectA.width_, (rectB.y_ - rectA.y_) | 0);
          if (t.width_ > 0 && t.height_ > 0) {
            a = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
          t.setBounds$int$int$int$int(rectA.x_, rectB.y_, (rectB.x_ - rectA.x_) | 0, (rectA.y_ + rectA.height_ - rectB.y_) | 0);
          if (t.width_ > 0 && t.height_ > 0) {
            b = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
        } else {
          t.setBounds$int$int$int$int(rectA.x_, rectA.y_, rectA.width_, (rectB.y_ - rectA.y_) | 0);
          if (t.width_ > 0 && t.height_ > 0) {
            a = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
          t.setBounds$int$int$int$int(rectA.x_, rectB.y_, (rectB.x_ - rectA.x_) | 0, rectB.height_);
          if (t.width_ > 0 && t.height_ > 0) {
            b = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
          t.setBounds$int$int$int$int(rectA.x_, ((rectB.y_ + rectB.height_) | 0), rectA.width_, (rectA.y_ + rectA.height_ - (rectB.y_ + rectB.height_)) | 0);
          if (t.width_ > 0 && t.height_ > 0) {
            c = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
        }
      } else if (rectB.x_ >= rectA.x_ && ((rectB.x_ + rectB.width_) | 0) <= ((rectA.x_ + rectA.width_) | 0)) {
        if (rectB.y_ <= rectA.y_ && ((rectB.y_ + rectB.height_) | 0) > ((rectA.y_ + rectA.height_) | 0)) {
          t.setBounds$int$int$int$int(rectA.x_, rectA.y_, (rectB.x_ - rectA.x_) | 0, rectA.height_);
          if (t.width_ > 0 && t.height_ > 0) {
            a = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
          t.setBounds$int$int$int$int(((rectB.x_ + rectB.width_) | 0), rectA.y_, (rectA.x_ + rectA.width_ - (rectB.x_ + rectB.width_)) | 0, rectA.height_);
          if (t.width_ > 0 && t.height_ > 0) {
            b = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
        } else if (rectB.y_ <= rectA.y_) {
          t.setBounds$int$int$int$int(rectA.x_, rectA.y_, (rectB.x_ - rectA.x_) | 0, rectA.height_);
          if (t.width_ > 0 && t.height_ > 0) {
            a = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
          t.setBounds$int$int$int$int(rectB.x_, ((rectB.y_ + rectB.height_) | 0), rectB.width_, (rectA.y_ + rectA.height_ - (rectB.y_ + rectB.height_)) | 0);
          if (t.width_ > 0 && t.height_ > 0) {
            b = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
          t.setBounds$int$int$int$int(((rectB.x_ + rectB.width_) | 0), rectA.y_, (rectA.x_ + rectA.width_ - (rectB.x_ + rectB.width_)) | 0, rectA.height_);
          if (t.width_ > 0 && t.height_ > 0) {
            c = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
        } else {
          t.setBounds$int$int$int$int(rectA.x_, rectA.y_, (rectB.x_ - rectA.x_) | 0, rectA.height_);
          if (t.width_ > 0 && t.height_ > 0) {
            a = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
          t.setBounds$int$int$int$int(rectB.x_, rectA.y_, rectB.width_, (rectB.y_ - rectA.y_) | 0);
          if (t.width_ > 0 && t.height_ > 0) {
            b = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
          t.setBounds$int$int$int$int(((rectB.x_ + rectB.width_) | 0), rectA.y_, (rectA.x_ + rectA.width_ - (rectB.x_ + rectB.width_)) | 0, rectA.height_);
          if (t.width_ > 0 && t.height_ > 0) {
            c = new Rectangle()._Rectangle$Rectangle(t);
            rectCount++;
          }
        }
      }
    }
    result = $J.newArray(rectCount, null);
    rectCount = 0;
    if (a != null) {
      result[rectCount++] = a;
    }
    if (b != null) {
      result[rectCount++] = b;
    }
    if (c != null) {
      result[rectCount++] = c;
    }
    if (d != null) {
      result[rectCount++] = d;
    }
    return result;
  }
  /**
   * Check whether MouseEvent contains specified mouse button or
   * mouse button down mask based on MouseEvent ID.
   *
   * @param anEvent  a MouseEvent object
   * @param mouseButton mouse button type
   * @param mouseButtonDownMask mouse button down mask event modifier
   *
   * @return true if the anEvent contains specified mouseButton or
   * mouseButtonDownMask based on MouseEvent ID.
   */
  static checkMouseButton(anEvent: MouseEvent, mouseButton: number, mouseButtonDownMask: number): boolean {
    switch (anEvent.getID()) {
      case MouseEvent.MOUSE_PRESSED:
      case MouseEvent.MOUSE_RELEASED:
      case MouseEvent.MOUSE_CLICKED:
        return (anEvent.getButton() === mouseButton);
      case MouseEvent.MOUSE_ENTERED:
      case MouseEvent.MOUSE_EXITED:
      case MouseEvent.MOUSE_DRAGGED:
        return ((anEvent.getModifiersEx() & mouseButtonDownMask) !== 0);
      default:
        return ((anEvent.getModifiersEx() & mouseButtonDownMask) !== 0 || anEvent.getButton() === mouseButton);
    }
  }
  /**
   * Returns true if the mouse event specifies the left mouse button.
   *
   * @param anEvent  a MouseEvent object
   * @return true if the left mouse button was active
   */
  static isLeftMouseButton(anEvent: MouseEvent): boolean {
    return SwingUtilities.checkMouseButton(anEvent, MouseEvent.BUTTON1, InputEvent.BUTTON1_DOWN_MASK);
  }
  /**
   * Returns true if the mouse event specifies the middle mouse button.
   *
   * @param anEvent  a MouseEvent object
   * @return true if the middle mouse button was active
   */
  static isMiddleMouseButton(anEvent: MouseEvent): boolean {
    return SwingUtilities.checkMouseButton(anEvent, MouseEvent.BUTTON2, InputEvent.BUTTON2_DOWN_MASK);
  }
  /**
   * Returns true if the mouse event specifies the right mouse button.
   *
   * @param anEvent  a MouseEvent object
   * @return true if the right mouse button was active
   */
  static isRightMouseButton(anEvent: MouseEvent): boolean {
    return SwingUtilities.checkMouseButton(anEvent, MouseEvent.BUTTON3, InputEvent.BUTTON3_DOWN_MASK);
  }
  /**
   * Compute and return the location of the icons origin, the
   * location of origin of the text baseline, and a possibly clipped
   * version of the compound labels string.  Locations are computed
   * relative to the viewR rectangle.
   * The JComponents orientation (LEADING/TRAILING) will also be taken
   * into account and translated into LEFT/RIGHT values accordingly.
   *
   * @param c the component
   * @param fm the instance of {@code FontMetrics}
   * @param text the text
   * @param icon the icon
   * @param verticalAlignment the vertical alignment
   * @param horizontalAlignment the horizontal alignment
   * @param verticalTextPosition the vertical text position
   * @param horizontalTextPosition the horizontal text position
   * @param viewR the available rectangle
   * @param iconR the rectangle for the icon
   * @param textR the rectangle for the text
   * @param textIconGap the gap between text and icon
   *
   * @return the possibly clipped version of the compound labels string
   */
  static layoutCompoundLabel$JComponent$FontMetrics$String$Icon$int$int$int$int$Rectangle$Rectangle$Rectangle$int(c: JComponent, fm: FontMetrics, text: string, icon: Icon, verticalAlignment: number, horizontalAlignment: number, verticalTextPosition: number, horizontalTextPosition: number, viewR: Rectangle, iconR: Rectangle, textR: Rectangle, textIconGap: number): string {
    let orientationIsLeftToRight = true;
    let hAlign = horizontalAlignment;
    let hTextPos = horizontalTextPosition;
    if (c != null) {
      if (!(c.getComponentOrientation().isLeftToRight())) {
        orientationIsLeftToRight = false;
      }
    }
    switch (horizontalAlignment) {
      case SwingConstants.LEADING:
        hAlign = (orientationIsLeftToRight) ? SwingConstants.LEFT : SwingConstants.RIGHT;
        break;
      case SwingConstants.TRAILING:
        hAlign = (orientationIsLeftToRight) ? SwingConstants.RIGHT : SwingConstants.LEFT;
        break;
    }
    switch (horizontalTextPosition) {
      case SwingConstants.LEADING:
        hTextPos = (orientationIsLeftToRight) ? SwingConstants.LEFT : SwingConstants.RIGHT;
        break;
      case SwingConstants.TRAILING:
        hTextPos = (orientationIsLeftToRight) ? SwingConstants.RIGHT : SwingConstants.LEFT;
        break;
    }
    return SwingUtilities.layoutCompoundLabelImpl(c, fm, text, icon, verticalAlignment, hAlign, verticalTextPosition, hTextPos, viewR, iconR, textR, textIconGap);
  }
  /**
   * Compute and return the location of the icons origin, the
   * location of origin of the text baseline, and a possibly clipped
   * version of the compound labels string.  Locations are computed
   * relative to the viewR rectangle.
   * This layoutCompoundLabel() does not know how to handle LEADING/TRAILING
   * values in horizontalTextPosition (they will default to RIGHT) and in
   * horizontalAlignment (they will default to CENTER).
   * Use the other version of layoutCompoundLabel() instead.
   */
  static layoutCompoundLabelImpl(c: JComponent, fm: FontMetrics, text: string, icon: Icon, verticalAlignment: number, horizontalAlignment: number, verticalTextPosition: number, horizontalTextPosition: number, viewR: Rectangle, iconR: Rectangle, textR: Rectangle, textIconGap: number): string {
    if (icon != null) {
      iconR.width_ = icon.getIconWidth();
      iconR.height_ = icon.getIconHeight();
    } else {
      iconR.width_ = iconR.height_ = 0;
    }
    let textIsEmpty = (text == null) || (text.length === 0);
    let lsb = 0;
    let rsb = 0;
    let gap: number;
    let v: View;
    if (textIsEmpty) {
      textR.width_ = textR.height_ = 0;
      text = '';
      gap = 0;
    } else {
      let availTextWidth: number;
      gap = (icon == null) ? 0 : textIconGap;
      if (horizontalTextPosition === SwingConstants.CENTER) {
        availTextWidth = viewR.width_;
      } else {
        availTextWidth = (viewR.width_ - (iconR.width_ + gap)) | 0;
      }
      v = (c != null) ? c.getClientProperty('html') : null;
      if (v != null) {
        textR.width_ = Math.min(availTextWidth, $J.d2i(v.getPreferredSpan(View.X_AXIS)));
        textR.height_ = $J.d2i(v.getPreferredSpan(View.Y_AXIS));
      } else {
        textR.width_ = SwingUtilities2.stringWidth$JComponent$FontMetrics$String(c, fm, text);
        lsb = SwingUtilities2.getLeftSideBearing$JComponent$FontMetrics$String(c, fm, text);
        if (lsb < 0) {
          textR.width_ = (textR.width_ - lsb) | 0;
        }
        if (textR.width_ > availTextWidth) {
          text = SwingUtilities2.clipString(c, fm, text, availTextWidth);
          textR.width_ = SwingUtilities2.stringWidth$JComponent$FontMetrics$String(c, fm, text);
        }
        textR.height_ = fm.getHeight();
      }
    }
    if (verticalTextPosition === SwingConstants.TOP) {
      if (horizontalTextPosition !== SwingConstants.CENTER) {
        textR.y_ = 0;
      } else {
        textR.y_ = -((textR.height_ + gap) | 0);
      }
    } else if (verticalTextPosition === SwingConstants.CENTER) {
      textR.y_ = (($J.idiv(iconR.height_, 2)) - ($J.idiv(textR.height_, 2))) | 0;
    } else {
      if (horizontalTextPosition !== SwingConstants.CENTER) {
        textR.y_ = (iconR.height_ - textR.height_) | 0;
      } else {
        textR.y_ = ((iconR.height_ + gap) | 0);
      }
    }
    if (horizontalTextPosition === SwingConstants.LEFT) {
      textR.x_ = -((textR.width_ + gap) | 0);
    } else if (horizontalTextPosition === SwingConstants.CENTER) {
      textR.x_ = (($J.idiv(iconR.width_, 2)) - ($J.idiv(textR.width_, 2))) | 0;
    } else {
      textR.x_ = ((iconR.width_ + gap) | 0);
    }
    let labelR_x = Math.min(iconR.x_, textR.x_);
    let labelR_width = ((Math.max((iconR.x_ + iconR.width_) | 0, (textR.x_ + textR.width_) | 0)) - labelR_x) | 0;
    let labelR_y = Math.min(iconR.y_, textR.y_);
    let labelR_height = ((Math.max((iconR.y_ + iconR.height_) | 0, (textR.y_ + textR.height_) | 0)) - labelR_y) | 0;
    let dx: number;
    let dy: number;
    if (verticalAlignment === SwingConstants.TOP) {
      dy = (viewR.y_ - labelR_y) | 0;
    } else if (verticalAlignment === SwingConstants.CENTER) {
      dy = (viewR.y_ + ($J.idiv(viewR.height_, 2)) - (labelR_y + ($J.idiv(labelR_height, 2)))) | 0;
    } else {
      dy = (viewR.y_ + viewR.height_ - (labelR_y + labelR_height)) | 0;
    }
    if (horizontalAlignment === SwingConstants.LEFT) {
      dx = (viewR.x_ - labelR_x) | 0;
    } else if (horizontalAlignment === SwingConstants.RIGHT) {
      dx = (viewR.x_ + viewR.width_ - (labelR_x + labelR_width)) | 0;
    } else {
      dx = (viewR.x_ + ($J.idiv(viewR.width_, 2)) - (labelR_x + ($J.idiv(labelR_width, 2)))) | 0;
    }
    textR.x_ = (textR.x_ + dx) | 0;
    textR.y_ = (textR.y_ + dy) | 0;
    iconR.x_ = (iconR.x_ + dx) | 0;
    iconR.y_ = (iconR.y_ + dy) | 0;
    if (lsb < 0) {
      textR.x_ = (textR.x_ - lsb) | 0;
      textR.width_ = (textR.width_ + lsb) | 0;
    }
    if (rsb > 0) {
      textR.width_ = (textR.width_ - rsb) | 0;
    }
    return text;
  }
  /**
   * A simple minded look and feel change: ask each node in the tree
   * to <code>updateUI()</code> -- that is, to initialize its UI property
   * with the current look and feel.
   *
   * @param c the component
   */
  static updateComponentTreeUI(c: Component): void {
    SwingUtilities.updateComponentTreeUI0(c);
    c.invalidate();
    c.validate();
    c.repaint$();
  }
  static updateComponentTreeUI0(c: Component): void {
    if (c instanceof JComponent) {
      let jc = c;
      jc.updateUI();
      let jpm = jc.getComponentPopupMenu();
      if (jpm != null) {
        SwingUtilities.updateComponentTreeUI(jpm);
      }
    }
    let children = null;
    if (c instanceof JMenu) {
      children = (c).getMenuComponents();
    } else if (c instanceof Container) {
      children = (c).getComponents();
    }
    if (children != null) {
      for (let child of children) {
        SwingUtilities.updateComponentTreeUI0(child);
      }
    }
  }
  /**
   * Causes <i>doRun.run()</i> to be executed asynchronously on the
   * AWT event dispatching thread.  This will happen after all
   * pending AWT events have been processed.  This method should
   * be used when an application thread needs to update the GUI.
   * In the following example the <code>invokeLater</code> call queues
   * the <code>Runnable</code> object <code>doHelloWorld</code>
   * on the event dispatching thread and
   * then prints a message.
   * <pre>
   * Runnable doHelloWorld = new Runnable() {
   *     public void run() {
   *         System.out.println("Hello World on " + Thread.currentThread());
   *     }
   * };
   *
   * SwingUtilities.invokeLater(doHelloWorld);
   * System.out.println("This might well be displayed before the other message.");
   * </pre>
   * If invokeLater is called from the event dispatching thread --
   * for example, from a JButton's ActionListener -- the <i>doRun.run()</i> will
   * still be deferred until all pending events have been processed.
   * Note that if the <i>doRun.run()</i> throws an uncaught exception
   * the event dispatching thread will unwind (not the current thread).
   * <p>
   * Additional documentation and examples for this method can be
   * found in
   * <A HREF="https://docs.oracle.com/javase/tutorial/uiswing/concurrency/index.html">Concurrency in Swing</a>.
   * <p>
   * As of 1.3 this method is just a cover for <code>java.awt.EventQueue.invokeLater()</code>.
   * <p>
   * Unlike the rest of Swing, this method can be invoked from any thread.
   *
   * @param doRun the instance of {@code Runnable}
   * @see #invokeAndWait
   */
  static invokeLater(doRun: Runnable): void {
    EventQueue.invokeLater(doRun);
  }
  /**
   * Causes <code>doRun.run()</code> to be executed synchronously on the
   * AWT event dispatching thread.  This call blocks until
   * all pending AWT events have been processed and (then)
   * <code>doRun.run()</code> returns. This method should
   * be used when an application thread needs to update the GUI.
   * It shouldn't be called from the event dispatching thread.
   * Here's an example that creates a new application thread
   * that uses <code>invokeAndWait</code> to print a string from the event
   * dispatching thread and then, when that's finished, print
   * a string from the application thread.
   * <pre>
   * final Runnable doHelloWorld = new Runnable() {
   *     public void run() {
   *         System.out.println("Hello World on " + Thread.currentThread());
   *     }
   * };
   *
   * Thread appThread = new Thread() {
   *     public void run() {
   *         try {
   *             SwingUtilities.invokeAndWait(doHelloWorld);
   *         }
   *         catch (Exception e) {
   *             e.printStackTrace();
   *         }
   *         System.out.println("Finished on " + Thread.currentThread());
   *     }
   * };
   * appThread.start();
   * </pre>
   * Note that if the <code>Runnable.run</code> method throws an
   * uncaught exception
   * (on the event dispatching thread) it's caught and rethrown, as
   * an <code>InvocationTargetException</code>, on the caller's thread.
   * <p>
   * Additional documentation and examples for this method can be
   * found in
   * <A HREF="https://docs.oracle.com/javase/tutorial/uiswing/concurrency/index.html">Concurrency in Swing</a>.
   * <p>
   * As of 1.3 this method is just a cover for
   * <code>java.awt.EventQueue.invokeAndWait()</code>.
   *
   * @param doRun the instance of {@code Runnable}
   * @throws  InterruptedException if we're interrupted while waiting for
   *             the event dispatching thread to finish executing
   *             <code>doRun.run()</code>
   * @throws  InvocationTargetException  if an exception is thrown
   *             while running <code>doRun</code>
   *
   * @see #invokeLater
   */
  static invokeAndWait(doRun: Runnable): void {
    EventQueue.invokeAndWait$Runnable(doRun);
  }
  /**
   * Returns true if the current thread is an AWT event dispatching thread.
   * <p>
   * As of 1.3 this method is just a cover for
   * <code>java.awt.EventQueue.isDispatchThread()</code>.
   *
   * @return true if the current thread is an AWT event dispatching thread
   */
  static isEventDispatchThread(): boolean {
    return EventQueue.isDispatchThread();
  }
  /**
   * Returns the number of accessible children in the object.  If all
   * of the children of this object implement Accessible, than this
   * method should return the number of children of this object. <p>
   *
   * Note: as of the Java 2 platform v1.3, it is recommended that developers call
   * Component.AccessibleAWTComponent.getAccessibleIndexInParent() instead
   * of using this method.
   *
   * @param c the component
   * @return the number of accessible children in the object.
   */
  static getAccessibleChildrenCount(c: Component): number {
    return c.getAccessibleContext().getAccessibleChildrenCount();
  }
  /**
   * Return the nth Accessible child of the object. <p>
   *
   * Note: as of the Java 2 platform v1.3, it is recommended that developers call
   * Component.AccessibleAWTComponent.getAccessibleIndexInParent() instead
   * of using this method.
   *
   * @param c the component
   * @param i zero-based index of child
   * @return the nth Accessible child of the object
   */
  static getAccessibleChild(c: Component, i: number): Accessible {
    return c.getAccessibleContext().getAccessibleChild(i);
  }
  /**
   * Return the child <code>Component</code> of the specified
   * <code>Component</code> that is the focus owner, if any.
   *
   * @param c the root of the <code>Component</code> hierarchy to
   *        search for the focus owner
   * @return the focus owner, or <code>null</code> if there is no focus
   *         owner, or if the focus owner is not <code>comp</code>, or a
   *         descendant of <code>comp</code>
   *
   * @see java.awt.KeyboardFocusManager#getFocusOwner
   * @deprecated As of 1.4, replaced by
   *   <code>KeyboardFocusManager.getFocusOwner()</code>.
   */
  static findFocusOwner(c: Component): Component {
    let focusOwner = KeyboardFocusManager.getCurrentKeyboardFocusManager$().getFocusOwner();
    for (let temp = focusOwner; temp != null; temp = (temp instanceof Window) ? null : temp.getParent()) {
      if (temp === c) {
        return focusOwner;
      }
    }
    return null;
  }
  /**
   * If c is a JRootPane descendant return its JRootPane ancestor.
   * If c is a RootPaneContainer then return its JRootPane.
   *
   * @param c the component
   * @return the JRootPane for Component c or {@code null}.
   */
  static getRootPane(c: Component): JRootPane {
    if ($J.isa(c, RootPaneContainer)) {
      return (c).getRootPane();
    }
    for (; c != null; c = c.getParent()) {
      if (c instanceof JRootPane) {
        return c;
      }
    }
    return null;
  }
  /**
   * Returns the root component for the current component tree.
   *
   * @param c the component
   * @return the first ancestor of c that's a Window or the last Applet ancestor
   */
  static getRoot(c: Component): Component {
    let applet = null;
    for (let p = c; p != null; p = p.getParent()) {
      if (p instanceof Window) {
        return p;
      }
      if ($J.isa(p, Applet)) {
        applet = p;
      }
    }
    return applet;
  }
  static getPaintingOrigin(c: JComponent): JComponent {
    let p = c;
    while ((p = p.getParent()) instanceof JComponent) {
      let jp = p;
      if (jp.isPaintingOrigin()) {
        return jp;
      }
    }
    return null;
  }
  /**
   * Process the key bindings for the <code>Component</code> associated with
   * <code>event</code>. This method is only useful if
   * <code>event.getComponent()</code> does not descend from
   * <code>JComponent</code>, or your are not invoking
   * <code>super.processKeyEvent</code> from within your
   * <code>JComponent</code> subclass. <code>JComponent</code>
   * automatically processes bindings from within its
   * <code>processKeyEvent</code> method, hence you rarely need
   * to directly invoke this method.
   *
   * @param event KeyEvent used to identify which bindings to process, as
   *              well as which Component has focus.
   * @return true if a binding has found and processed
   * @since 1.4
   */
  static processKeyBindings(event: KeyEvent): boolean {
    if (event != null) {
      if (event.isConsumed()) {
        return false;
      }
      let component = event.getComponent();
      let pressed = (event.getID() === KeyEvent.KEY_PRESSED);
      if (!SwingUtilities.isValidKeyEventForKeyBindings(event)) {
        return false;
      }
      while (component != null) {
        if (component instanceof JComponent) {
          return (component).processKeyBindings(event, pressed);
        }
        if (($J.isa(component, Applet)) || (component instanceof Window)) {
          return JComponent.processKeyBindingsForAllComponents(event, component, pressed);
        }
        component = component.getParent();
      }
    }
    return false;
  }
  /**
   * Returns true if the <code>e</code> is a valid KeyEvent to use in
   * processing the key bindings associated with JComponents.
   */
  static isValidKeyEventForKeyBindings(e: KeyEvent): boolean {
    return true;
  }
  /**
   * Invokes {@code actionPerformed} on {@code action} if {@code action}
   * is non-{@code null} and accepts the sender object.
   * The command for the ActionEvent is determined by:
   * <ol>
   *   <li>If the action was registered via
   *       <code>registerKeyboardAction</code>, then the command string
   *       passed in ({@code null} will be used if {@code null} was passed in).
   *   <li>Action value with name Action.ACTION_COMMAND_KEY, unless {@code null}.
   *   <li>String value of the KeyEvent, unless <code>getKeyChar</code>
   *       returns KeyEvent.CHAR_UNDEFINED..
   * </ol>
   * This will return true if <code>action</code> is non-{@code null} and
   * actionPerformed is invoked on it.
   *
   * @param action an action
   * @param ks a key stroke
   * @param event a key event
   * @param sender a sender
   * @param modifiers action modifiers
   * @return {@code true} if {@code action} is non-{@code null} and
   *         actionPerformed is invoked on it.
   * @see javax.swing.Action#accept
   *
   * @since 1.3
   */
  static notifyAction(action: Action, ks: KeyStroke, event: KeyEvent, sender: any, modifiers: number): boolean {
    if (action == null || !action.accept(sender)) {
      return false;
    }
    let commandO: any;
    let stayNull: boolean;
    commandO = action.getValue$String(Action.ACTION_COMMAND_KEY);
    if (commandO == null && (action instanceof JComponent$ActionStandin)) {
      stayNull = true;
    } else {
      stayNull = false;
    }
    let command: string;
    if (commandO != null) {
      command = $J.str(commandO);
    } else if (!stayNull && event.getKeyChar() !== KeyEvent.CHAR_UNDEFINED) {
      command = String.fromCharCode(event.getKeyChar());
    } else {
      command = null;
    }
    action.actionPerformed(new ActionEvent()._ActionEvent$Object$int$String$long$int(sender, ActionEvent.ACTION_PERFORMED, command, event.getWhen(), modifiers));
    var tb;
    if ((tb = event.getSource()) instanceof JToggleButton) {
      commandO = action.getValue$String(Action.SELECTED_KEY);
      if (commandO != null) {
        tb.setSelected(!tb.isSelected());
      }
    }
    return true;
  }
  /**
   * Convenience method to change the UI InputMap for <code>component</code>
   * to <code>uiInputMap</code>. If <code>uiInputMap</code> is {@code null},
   * this removes any previously installed UI InputMap.
   *
   * @param component a component
   * @param type a type
   * @param uiInputMap an {@code InputMap}
   * @since 1.3
   */
  static replaceUIInputMap(component: JComponent, type$: number, uiInputMap: InputMap): void {
    let map = component.getInputMap$int$boolean(type$, (uiInputMap != null));
    while (map != null) {
      let parent = map.getParent();
      if (parent == null || ($J.isa(parent, UIResource))) {
        map.setParent(uiInputMap);
        return;
      }
      map = parent;
    }
  }
  /**
   * Convenience method to change the UI ActionMap for <code>component</code>
   * to <code>uiActionMap</code>. If <code>uiActionMap</code> is {@code null},
   * this removes any previously installed UI ActionMap.
   *
   * @param component a component
   * @param uiActionMap an {@code ActionMap}
   * @since 1.3
   */
  static replaceUIActionMap(component: JComponent, uiActionMap: ActionMap): void {
    let map = component.getActionMap$boolean((uiActionMap != null));
    while (map != null) {
      let parent = map.getParent();
      if (parent == null || ($J.isa(parent, UIResource))) {
        map.setParent(uiActionMap);
        return;
      }
      map = parent;
    }
  }
  /**
   * Returns the InputMap provided by the UI for condition
   * <code>condition</code> in component <code>component</code>.
   * <p>This will return {@code null} if the UI has not installed an InputMap
   * of the specified type.
   *
   * @param component a component
   * @param condition a condition
   * @return the {@code ActionMap} provided by the UI for {@code condition}
   *         in the component, or {@code null} if the UI has not installed
   *         an InputMap of the specified type.
   * @since 1.3
   */
  static getUIInputMap(component: JComponent, condition: number): InputMap {
    let map = component.getInputMap$int$boolean(condition, false);
    while (map != null) {
      let parent = map.getParent();
      if ($J.isa(parent, UIResource)) {
        return parent;
      }
      map = parent;
    }
    return null;
  }
  /**
   * Returns the ActionMap provided by the UI
   * in component <code>component</code>.
   * <p>This will return {@code null} if the UI has not installed an ActionMap.
   *
   * @param component a component
   * @return the {@code ActionMap} provided by the UI in the component,
   *         or {@code null} if the UI has not installed an ActionMap.
   * @since 1.3
   */
  static getUIActionMap(component: JComponent): ActionMap {
    let map = component.getActionMap$boolean(false);
    while (map != null) {
      let parent = map.getParent();
      if ($J.isa(parent, UIResource)) {
        return parent;
      }
      map = parent;
    }
    return null;
  }
  /**
   * Returns a toolkit-private, shared, invisible Frame
   * to be the owner for JDialogs and JWindows created with
   * {@code null} owners.
   * @throws HeadlessException if GraphicsEnvironment.isHeadless()
   * returns true.
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  static getSharedOwnerFrame(): Frame {
    let sharedOwnerFrame = SwingUtilities.appContextGet(SwingUtilities.sharedOwnerFrameKey);
    if (sharedOwnerFrame == null) {
      sharedOwnerFrame = new SwingUtilities$SharedOwnerFrame()._SwingUtilities$SharedOwnerFrame();
      SwingUtilities.appContextPut(SwingUtilities.sharedOwnerFrameKey, sharedOwnerFrame);
    }
    return sharedOwnerFrame;
  }
  /**
   * Returns a SharedOwnerFrame's shutdown listener to dispose the SharedOwnerFrame
   * if it has no more displayable children.
   * @throws HeadlessException if GraphicsEnvironment.isHeadless()
   * returns true.
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  static getSharedOwnerFrameShutdownListener(): WindowListener {
    let sharedOwnerFrame = SwingUtilities.getSharedOwnerFrame();
    return sharedOwnerFrame;
  }
  static appContextGet(key: any): any {
    return AppContext.getAppContext().get(key);
  }
  static appContextPut(key: any, value: any): void {
    AppContext.getAppContext().put(key, value);
  }
  static appContextRemove(key: any): void {
    AppContext.getAppContext().remove(key);
  }
  static loadSystemClass(className: string): JClass<any> {
    ReflectUtil.checkPackageAccess(className);
    return JClass.forName(className, true, Thread.currentThread().getContextClassLoader());
  }
  static isLeftToRight(c: Component): boolean {
    return c.getComponentOrientation().isLeftToRight();
  }
  /**
   * Returns index of the first occurrence of <code>mnemonic</code>
   * within string <code>text</code>. Matching algorithm is not
   * case-sensitive.
   *
   * @param text The text to search through, may be {@code null}
   * @param mnemonic The mnemonic to find the character for.
   * @return index into the string if exists, otherwise -1
   */
  static findDisplayedMnemonicIndex(text: string, mnemonic: number): number {
    if (text == null || mnemonic === 0 /* \u0000 */) {
      return -1;
    }
    if (mnemonic >= 97 /* 'a' */ && mnemonic <= 122 /* 'z' */) {
      return -1;
    }
    let uc = Character.toUpperCase((mnemonic) & 0xffff);
    let lc = Character.toLowerCase((mnemonic) & 0xffff);
    let uci = text.indexOf(String.fromCharCode(uc));
    let lci = text.indexOf(String.fromCharCode(lc));
    if (uci === -1) {
      return lci;
    } else if (lci === -1) {
      return uci;
    } else {
      return (lci < uci) ? lci : uci;
    }
  }
  /**
   * Stores the position and size of
   * the inner painting area of the specified component
   * in <code>r</code> and returns <code>r</code>.
   * The position and size specify the bounds of the component,
   * adjusted so as not to include the border area (the insets).
   * This method is useful for classes
   * that implement painting code.
   *
   * @param c  the JComponent in question; if {@code null}, this method returns {@code null}
   * @param r  the Rectangle instance to be modified;
   *           may be {@code null}
   * @return {@code null} if the Component is {@code null};
   *         otherwise, returns the passed-in rectangle (if non-{@code null})
   *         or a new rectangle specifying position and size information
   *
   * @since 1.4
   */
  static calculateInnerArea(c: JComponent, r: Rectangle): Rectangle {
    if (c == null) {
      return null;
    }
    let rect = r;
    let insets = c.getInsets$();
    if (rect == null) {
      rect = new Rectangle()._Rectangle$();
    }
    rect.x_ = insets.left;
    rect.y_ = insets.top;
    rect.width_ = (c.getWidth() - insets.left - insets.right) | 0;
    rect.height_ = (c.getHeight() - insets.top - insets.bottom) | 0;
    return rect;
  }
  static updateRendererOrEditorUI(rendererOrEditor: any): void {
    if (rendererOrEditor == null) {
      return;
    }
    let component = null;
    if (rendererOrEditor instanceof Component) {
      component = rendererOrEditor;
    }
    if (rendererOrEditor instanceof DefaultCellEditor) {
      component = (rendererOrEditor).getComponent();
    }
    if (component != null) {
      SwingUtilities.updateComponentTreeUI(component);
    }
  }
  /**
   * Returns the first ancestor of the {@code component}
   * which is not an instance of {@link JLayer}.
   *
   * @param component {@code Component} to get
   * the first ancestor of, which is not a {@link JLayer} instance.
   *
   * @return the first ancestor of the {@code component}
   * which is not an instance of {@link JLayer}.
   * If such an ancestor can not be found, {@code null} is returned.
   *
   * @throws NullPointerException if {@code component} is {@code null}
   * @see JLayer
   *
   * @since 1.7
   */
  static getUnwrappedParent(component: Component): Container {
    let parent = component.getParent();
    while (parent instanceof JLayer) {
      parent = parent.getParent();
    }
    return parent;
  }
  /**
   * Returns the first {@code JViewport}'s descendant
   * which is not an instance of {@code JLayer}.
   * If such a descendant can not be found, {@code null} is returned.
   *
   * If the {@code viewport}'s view component is not a {@code JLayer},
   * this method is equivalent to {@link JViewport#getView()}
   * otherwise {@link JLayer#getView()} will be recursively
   * called on all descending {@code JLayer}s.
   *
   * @param viewport {@code JViewport} to get the first descendant of,
   * which in not a {@code JLayer} instance.
   *
   * @return the first {@code JViewport}'s descendant
   * which is not an instance of {@code JLayer}.
   * If such a descendant can not be found, {@code null} is returned.
   *
   * @throws NullPointerException if {@code viewport} is {@code null}
   * @see JViewport#getView()
   * @see JLayer
   *
   * @since 1.7
   */
  static getUnwrappedView(viewport: JViewport): Component {
    let view = viewport.getView();
    while (view instanceof JLayer) {
      view = (view).getView();
    }
    return view;
  }
  /**
   * Retrieves the validate root of a given container.
   *
   * If the container is contained within a {@code CellRendererPane}, this
   * method returns {@code null} due to the synthetic nature of the {@code
   * CellRendererPane}.
   * <p>
   * The component hierarchy must be displayable up to the toplevel component
   * (either a {@code Frame} or an {@code Applet} object.) Otherwise this
   * method returns {@code null}.
   * <p>
   * If the {@code visibleOnly} argument is {@code true}, the found validate
   * root and all its parents up to the toplevel component must also be
   * visible. Otherwise this method returns {@code null}.
   *
   * @return the validate root of the given container or null
   * @see java.awt.Component#isDisplayable()
   * @see java.awt.Component#isVisible()
   * @since 1.7
   */
  static getValidateRoot(c: Container, visibleOnly: boolean): Container {
    let root = null;
    for (; c != null; c = c.getParent()) {
      if (!c.isDisplayable() || c instanceof CellRendererPane) {
        return null;
      }
      if (c.isValidateRoot$()) {
        root = c;
        break;
      }
    }
    if (root == null) {
      return null;
    }
    for (; c != null; c = c.getParent()) {
      if (!c.isDisplayable() || (visibleOnly && !c.isVisible$())) {
        return null;
      }
      if (c instanceof Window || $J.isa(c, Applet)) {
        return root;
      }
    }
    return null;
  }
  static $clinit() {
    SwingUtilities.canAccessEventQueue = false;
    SwingUtilities.eventQueueTested = false;
    SwingUtilities.sharedOwnerFrameKey = new StringBuffer('SwingUtilities.sharedOwnerFrame');
  }
}

export class SwingUtilities$SharedOwnerFrame extends Frame {
  _SwingUtilities$SharedOwnerFrame(): this {
    this._Frame$();
    return this;
  }
  addNotify(): void {
    super.addNotify();
    this.installListeners();
  }
  /**
   * Install window listeners on owned windows to watch for displayability changes
   */
  installListeners(): void {
    let windows = this.getOwnedWindows();
    for (let window of windows) {
      if (window != null) {
        window.removeWindowListener(this);
        window.addWindowListener(this);
      }
    }
  }
  /**
   * Watches for displayability changes and disposes shared instance if there are no
   * displayable children left.
   */
  windowClosed(e: WindowEvent): void {
    {
      let windows = this.getOwnedWindows();
      for (let window of windows) {
        if (window != null) {
          if (window.isDisplayable()) {
            return;
          }
          window.removeWindowListener(this);
        }
      }
      this.dispose();
    }
  }
  windowOpened(e: WindowEvent): void {
  }
  windowClosing(e: WindowEvent): void {
  }
  windowIconified(e: WindowEvent): void {
  }
  windowDeiconified(e: WindowEvent): void {
  }
  windowActivated(e: WindowEvent): void {
  }
  windowDeactivated(e: WindowEvent): void {
  }
  show$(): void {
  }
  dispose(): void {
    try {
      this.getToolkit().getSystemEventQueue();
      super.dispose();
    } catch ($e2) {
      if ($J.isa($e2, Exception)) {
        let e = $J.exc($e2);
      } else {
        throw $e2;
      }
    }
  }
}

$J.define(SwingUtilities, 'javax.swing.SwingUtilities', { kind: 'class', ifaces: ['javax.swing.SwingConstants'], sup: 'java.lang.Object', ctors: { '': '_SwingUtilities' }, meths: { 'paintComponent(java.awt.Graphics,java.awt.Component,java.awt.Container,java.awt.Rectangle)': 'paintComponent$Graphics$Component$Container$Rectangle', 'paintComponent(java.awt.Graphics,java.awt.Component,java.awt.Container,int,int,int,int)': 'paintComponent$Graphics$Component$Container$int$int$int$int', 'layoutCompoundLabel(java.awt.FontMetrics,java.lang.String,javax.swing.Icon,int,int,int,int,java.awt.Rectangle,java.awt.Rectangle,java.awt.Rectangle,int)': 'layoutCompoundLabel$FontMetrics$String$Icon$int$int$int$int$Rectangle$Rectangle$Rectangle$int', 'layoutCompoundLabel(javax.swing.JComponent,java.awt.FontMetrics,java.lang.String,javax.swing.Icon,int,int,int,int,java.awt.Rectangle,java.awt.Rectangle,java.awt.Rectangle,int)': 'layoutCompoundLabel$JComponent$FontMetrics$String$Icon$int$int$int$int$Rectangle$Rectangle$Rectangle$int', 'convertPoint(java.awt.Component,int,int,java.awt.Component)': 'convertPoint$Component$int$int$Component', 'convertPoint(java.awt.Component,java.awt.Point,java.awt.Component)': 'convertPoint$Component$Point$Component' }, clinit: true, lazy: ['canAccessEventQueue', 'eventQueueTested', 'suppressDropSupport', 'checkedSuppressDropSupport', 'sharedOwnerFrameKey'] });
$J.define(SwingUtilities$SharedOwnerFrame, 'javax.swing.SwingUtilities$SharedOwnerFrame', { kind: 'class', ifaces: ['java.awt.event.WindowListener'], sup: 'java.awt.Frame', ctors: { '': '_SwingUtilities$SharedOwnerFrame' }, meths: { 'show()': 'show$' } });
$J.module(() => {
  Component = $J.load('java.awt.Component');
  Container = $J.load('java.awt.Container');
  EventQueue = $J.load('java.awt.EventQueue');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  IllegalComponentStateException = $J.load('java.awt.IllegalComponentStateException');
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  Window = $J.load('java.awt.Window');
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  InputEvent = $J.load('java.awt.event.InputEvent');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  MouseWheelEvent = $J.load('java.awt.event.MouseWheelEvent');
  Action = $J.load('javax.swing.Action');
  CellRendererPane = $J.load('javax.swing.CellRendererPane');
  DefaultCellEditor = $J.load('javax.swing.DefaultCellEditor');
  JComponent = $J.load('javax.swing.JComponent');
  JComponent$ActionStandin = $J.load('javax.swing.JComponent$ActionStandin');
  JLayer = $J.load('javax.swing.JLayer');
  JMenu = $J.load('javax.swing.JMenu');
  JRootPane = $J.load('javax.swing.JRootPane');
  JToggleButton = $J.load('javax.swing.JToggleButton');
  RootPaneContainer = $J.load('javax.swing.RootPaneContainer');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  TransferHandler$SwingDropTarget = $J.load('javax.swing.TransferHandler$SwingDropTarget');
  MenuDragMouseEvent = $J.load('javax.swing.event.MenuDragMouseEvent');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  View = $J.load('javax.swing.text.View');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
