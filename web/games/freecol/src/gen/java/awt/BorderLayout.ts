// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/BorderLayout.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalArgumentException, JObject, JString } from '../../../jre/index.ts';

let Dimension;

/**
 * A border layout lays out a container, arranging and resizing
 * its components to fit in five regions:
 * north, south, east, west, and center.
 * Each region may contain no more than one component, and
 * is identified by a corresponding constant:
 * {@code NORTH}, {@code SOUTH}, {@code EAST},
 * {@code WEST}, and {@code CENTER}.  When adding a
 * component to a container with a border layout, use one of these
 * five constants, for example:
 * <pre>
 *    Panel p = new Panel();
 *    p.setLayout(new BorderLayout());
 *    p.add(new Button("Okay"), BorderLayout.SOUTH);
 * </pre>
 * As a convenience, {@code BorderLayout} interprets the
 * absence of a string specification the same as the constant
 * {@code CENTER}:
 * <pre>
 *    Panel p2 = new Panel();
 *    p2.setLayout(new BorderLayout());
 *    p2.add(new TextArea());  // Same as p.add(new TextArea(), BorderLayout.CENTER);
 * </pre>
 * <p>
 * In addition, {@code BorderLayout} supports the relative
 * positioning constants, {@code PAGE_START}, {@code PAGE_END},
 * {@code LINE_START}, and {@code LINE_END}.
 * In a container whose {@code ComponentOrientation} is set to
 * {@code ComponentOrientation.LEFT_TO_RIGHT}, these constants map to
 * {@code NORTH}, {@code SOUTH}, {@code WEST}, and
 * {@code EAST}, respectively.
 * <p>
 * For compatibility with previous releases, {@code BorderLayout}
 * also includes the relative positioning constants {@code BEFORE_FIRST_LINE},
 * {@code AFTER_LAST_LINE}, {@code BEFORE_LINE_BEGINS} and
 * {@code AFTER_LINE_ENDS}.  These are equivalent to
 * {@code PAGE_START}, {@code PAGE_END}, {@code LINE_START}
 * and {@code LINE_END} respectively.  For
 * consistency with the relative positioning constants used by other
 * components, the latter constants are preferred.
 * <p>
 * Mixing both absolute and relative positioning constants can lead to
 * unpredictable results.  If
 * you use both types, the relative constants will take precedence.
 * For example, if you add components using both the {@code NORTH}
 * and {@code PAGE_START} constants in a container whose
 * orientation is {@code LEFT_TO_RIGHT}, only the
 * {@code PAGE_START} will be laid out.
 * <p>
 * NOTE: Currently,
 * {@code BorderLayout} does not support vertical
 * orientations.  The {@code isVertical} setting on the container's
 * {@code ComponentOrientation} is not respected.
 * <p>
 * The components are laid out according to their
 * preferred sizes and the constraints of the container's size.
 * The {@code NORTH} and {@code SOUTH} components may
 * be stretched horizontally; the {@code EAST} and
 * {@code WEST} components may be stretched vertically;
 * the {@code CENTER} component may stretch both horizontally
 * and vertically to fill any space left over.
 * <p>
 * Here is an example of five buttons in an applet laid out using
 * the {@code BorderLayout} layout manager:
 * <p>
 * <img src="doc-files/BorderLayout-1.gif" alt="Diagram of an applet
 * demonstrating BorderLayout. Each section of the BorderLayout contains a
 * Button corresponding to its position in the layout, one of: North, West,
 * Center, East, or South." style="margin: 7px 10px;">
 * <p>
 * The code for this applet is as follows:
 *
 * <hr><blockquote><pre>
 * import java.awt.*;
 * import java.applet.Applet;
 *
 * public class buttonDir extends Applet {
 *   public void init() {
 *     setLayout(new BorderLayout());
 *     add(new Button("North"), BorderLayout.NORTH);
 *     add(new Button("South"), BorderLayout.SOUTH);
 *     add(new Button("East"), BorderLayout.EAST);
 *     add(new Button("West"), BorderLayout.WEST);
 *     add(new Button("Center"), BorderLayout.CENTER);
 *   }
 * }
 * </pre></blockquote><hr>
 *
 * @author      Arthur van Hoff
 * @see         java.awt.Container#add(String, Component)
 * @see         java.awt.ComponentOrientation
 * @since       1.0
 */
export class BorderLayout extends JObject {
  /**
   * Constructs a border layout with the horizontal gaps
   * between components.
   * The horizontal gap is specified by {@code hgap}.
   *
   * @see #getHgap()
   * @see #setHgap(int)
   *
   * @serial
   */
  hgap: number = 0;
  /**
   * Constructs a border layout with the vertical gaps
   * between components.
   * The vertical gap is specified by {@code vgap}.
   *
   * @see #getVgap()
   * @see #setVgap(int)
   * @serial
   */
  vgap: number = 0;
  /**
   * Constant to specify components location to be the
   *      north portion of the border layout.
   * @serial
   * @see #getChild(String, boolean)
   * @see #addLayoutComponent
   * @see #getLayoutAlignmentX
   * @see #getLayoutAlignmentY
   * @see #removeLayoutComponent
   */
  north: Component = null;
  /**
   * Constant to specify components location to be the
   *      west portion of the border layout.
   * @serial
   * @see #getChild(String, boolean)
   * @see #addLayoutComponent
   * @see #getLayoutAlignmentX
   * @see #getLayoutAlignmentY
   * @see #removeLayoutComponent
   */
  west: Component = null;
  /**
   * Constant to specify components location to be the
   *      east portion of the border layout.
   * @serial
   * @see #getChild(String, boolean)
   * @see #addLayoutComponent
   * @see #getLayoutAlignmentX
   * @see #getLayoutAlignmentY
   * @see #removeLayoutComponent
   */
  east: Component = null;
  /**
   * Constant to specify components location to be the
   *      south portion of the border layout.
   * @serial
   * @see #getChild(String, boolean)
   * @see #addLayoutComponent
   * @see #getLayoutAlignmentX
   * @see #getLayoutAlignmentY
   * @see #removeLayoutComponent
   */
  south: Component = null;
  /**
   * Constant to specify components location to be the
   *      center portion of the border layout.
   * @serial
   * @see #getChild(String, boolean)
   * @see #addLayoutComponent
   * @see #getLayoutAlignmentX
   * @see #getLayoutAlignmentY
   * @see #removeLayoutComponent
   */
  center_: Component = null;
  /**
   * A relative positioning constant, that can be used instead of
   * north, south, east, west or center.
   * mixing the two types of constants can lead to unpredictable results.  If
   * you use both types, the relative constants will take precedence.
   * For example, if you add components using both the {@code NORTH}
   * and {@code BEFORE_FIRST_LINE} constants in a container whose
   * orientation is {@code LEFT_TO_RIGHT}, only the
   * {@code BEFORE_FIRST_LINE} will be laid out.
   * This will be the same for lastLine, firstItem, lastItem.
   * @serial
   */
  firstLine: Component = null;
  /**
   * A relative positioning constant, that can be used instead of
   * north, south, east, west or center.
   * Please read Description for firstLine.
   * @serial
   */
  lastLine: Component = null;
  /**
   * A relative positioning constant, that can be used instead of
   * north, south, east, west or center.
   * Please read Description for firstLine.
   * @serial
   */
  firstItem: Component = null;
  /**
   * A relative positioning constant, that can be used instead of
   * north, south, east, west or center.
   * Please read Description for firstLine.
   * @serial
   */
  lastItem: Component = null;
  /**
   * The north layout constraint (top of container).
   */
  static readonly NORTH: string = 'North';
  /**
   * The south layout constraint (bottom of container).
   */
  static readonly SOUTH: string = 'South';
  /**
   * The east layout constraint (right side of container).
   */
  static readonly EAST: string = 'East';
  /**
   * The west layout constraint (left side of container).
   */
  static readonly WEST: string = 'West';
  /**
   * The center layout constraint (middle of container).
   */
  static readonly CENTER: string = 'Center';
  /**
   * Synonym for PAGE_START.  Exists for compatibility with previous
   * versions.  PAGE_START is preferred.
   *
   * @see #PAGE_START
   * @since 1.2
   */
  static readonly BEFORE_FIRST_LINE: string = 'First';
  /**
   * Synonym for PAGE_END.  Exists for compatibility with previous
   * versions.  PAGE_END is preferred.
   *
   * @see #PAGE_END
   * @since 1.2
   */
  static readonly AFTER_LAST_LINE: string = 'Last';
  /**
   * Synonym for LINE_START.  Exists for compatibility with previous
   * versions.  LINE_START is preferred.
   *
   * @see #LINE_START
   * @since 1.2
   */
  static readonly BEFORE_LINE_BEGINS: string = 'Before';
  /**
   * Synonym for LINE_END.  Exists for compatibility with previous
   * versions.  LINE_END is preferred.
   *
   * @see #LINE_END
   * @since 1.2
   */
  static readonly AFTER_LINE_ENDS: string = 'After';
  /**
   * The component comes before the first line of the layout's content.
   * For Western, left-to-right and top-to-bottom orientations, this is
   * equivalent to NORTH.
   *
   * @see java.awt.Component#getComponentOrientation
   * @since 1.4
   */
  static readonly PAGE_START: string = 'First';
  /**
   * The component comes after the last line of the layout's content.
   * For Western, left-to-right and top-to-bottom orientations, this is
   * equivalent to SOUTH.
   *
   * @see java.awt.Component#getComponentOrientation
   * @since 1.4
   */
  static readonly PAGE_END: string = 'Last';
  /**
   * The component goes at the beginning of the line direction for the
   * layout. For Western, left-to-right and top-to-bottom orientations,
   * this is equivalent to WEST.
   *
   * @see java.awt.Component#getComponentOrientation
   * @since 1.4
   */
  static readonly LINE_START: string = 'Before';
  /**
   * The component goes at the end of the line direction for the
   * layout. For Western, left-to-right and top-to-bottom orientations,
   * this is equivalent to EAST.
   *
   * @see java.awt.Component#getComponentOrientation
   * @since 1.4
   */
  static readonly LINE_END: string = 'After';
  /**
   * Constructs a new border layout with
   * no gaps between components.
   */
  _BorderLayout$(): this {
    this._BorderLayout$int$int(0, 0);
    return this;
  }
  /**
   * Constructs a border layout with the specified gaps
   * between components.
   * The horizontal gap is specified by {@code hgap}
   * and the vertical gap is specified by {@code vgap}.
   * @param   hgap   the horizontal gap.
   * @param   vgap   the vertical gap.
   */
  _BorderLayout$int$int(hgap: number, vgap: number): this {
    this.hgap = hgap;
    this.vgap = vgap;
    return this;
  }
  /**
   * Sets the horizontal gap between components.
   *
   * @param hgap the horizontal gap between components
   * @since   1.1
   */
  setHgap(hgap: number): void {
    this.hgap = hgap;
  }
  /**
   * Adds the specified component to the layout, using the specified
   * constraint object.  For border layouts, the constraint must be
   * one of the following constants:  {@code NORTH},
   * {@code SOUTH}, {@code EAST},
   * {@code WEST}, or {@code CENTER}.
   * <p>
   * Most applications do not call this method directly. This method
   * is called when a component is added to a container using the
   * {@code Container.add} method with the same argument types.
   * @param   comp         the component to be added.
   * @param   constraints  an object that specifies how and where
   *                       the component is added to the layout.
   * @see     java.awt.Container#add(java.awt.Component, java.lang.Object)
   * @throws   IllegalArgumentException  if the constraint object is not
   *              a string, or if it not one of the five specified constants.
   * @since   1.1
   */
  addLayoutComponent$Component$Object(comp: Component, constraints: any): void {
    {
      if ((constraints == null) || ($J.isa(constraints, JString))) {
        this.addLayoutComponent$String$Component(constraints, comp);
      } else {
        throw new IllegalArgumentException('cannot add to layout: constraint must be a string (or null)');
      }
    }
  }
  /**
   * @deprecated  replaced by {@code addLayoutComponent(Component, Object)}.
   */
  addLayoutComponent$String$Component(name: string, comp: Component): void {
    {
      if (name == null) {
        name = 'Center';
      }
      if ($J.equals('Center', name)) {
        this.center_ = comp;
      } else if ($J.equals('North', name)) {
        this.north = comp;
      } else if ($J.equals('South', name)) {
        this.south = comp;
      } else if ($J.equals('East', name)) {
        this.east = comp;
      } else if ($J.equals('West', name)) {
        this.west = comp;
      } else if ($J.equals(BorderLayout.BEFORE_FIRST_LINE, name)) {
        this.firstLine = comp;
      } else if ($J.equals(BorderLayout.AFTER_LAST_LINE, name)) {
        this.lastLine = comp;
      } else if ($J.equals(BorderLayout.BEFORE_LINE_BEGINS, name)) {
        this.firstItem = comp;
      } else if ($J.equals(BorderLayout.AFTER_LINE_ENDS, name)) {
        this.lastItem = comp;
      } else {
        throw new IllegalArgumentException('cannot add to layout: unknown constraint: ' + name);
      }
    }
  }
  /**
   * Removes the specified component from this border layout. This
   * method is called when a container calls its {@code remove} or
   * {@code removeAll} methods. Most applications do not call this
   * method directly.
   * @param   comp   the component to be removed.
   * @see     java.awt.Container#remove(java.awt.Component)
   * @see     java.awt.Container#removeAll()
   */
  removeLayoutComponent(comp: Component): void {
    {
      if (comp === this.center_) {
        this.center_ = null;
      } else if (comp === this.north) {
        this.north = null;
      } else if (comp === this.south) {
        this.south = null;
      } else if (comp === this.east) {
        this.east = null;
      } else if (comp === this.west) {
        this.west = null;
      }
      if (comp === this.firstLine) {
        this.firstLine = null;
      } else if (comp === this.lastLine) {
        this.lastLine = null;
      } else if (comp === this.firstItem) {
        this.firstItem = null;
      } else if (comp === this.lastItem) {
        this.lastItem = null;
      }
    }
  }
  /**
   * Returns the component that corresponds to the given constraint location
   * based on the target {@code Container}'s component orientation.
   * Components added with the relative constraints {@code PAGE_START},
   * {@code PAGE_END}, {@code LINE_START}, and {@code LINE_END}
   * take precedence over components added with the explicit constraints
   * {@code NORTH}, {@code SOUTH}, {@code WEST}, and {@code EAST}.
   * The {@code Container}'s component orientation is used to determine the location of components
   * added with {@code LINE_START} and {@code LINE_END}.
   *
   * @param   constraints     the desired absolute position, one of {@code CENTER},
   *                          {@code NORTH}, {@code SOUTH},
   *                          {@code EAST}, {@code WEST}
   * @param   target     the {@code Container} used to obtain
   *                     the constraint location based on the target
   *                     {@code Container}'s component orientation.
   * @return  the component at the given location, or {@code null} if
   *          the location is empty
   * @throws   IllegalArgumentException  if the constraint object is
   *              not one of the five specified constants
   * @throws   NullPointerException  if the target parameter is null
   * @see     #addLayoutComponent(java.awt.Component, java.lang.Object)
   * @since 1.5
   */
  getLayoutComponent$Container$Object(target: Container, constraints: any): Component {
    let ltr = target.getComponentOrientation().isLeftToRight();
    let result = null;
    if ($J.equals(BorderLayout.NORTH, constraints)) {
      result = (this.firstLine != null) ? this.firstLine : this.north;
    } else if ($J.equals(BorderLayout.SOUTH, constraints)) {
      result = (this.lastLine != null) ? this.lastLine : this.south;
    } else if ($J.equals(BorderLayout.WEST, constraints)) {
      result = ltr ? this.firstItem : this.lastItem;
      if (result == null) {
        result = this.west;
      }
    } else if ($J.equals(BorderLayout.EAST, constraints)) {
      result = ltr ? this.lastItem : this.firstItem;
      if (result == null) {
        result = this.east;
      }
    } else if ($J.equals(BorderLayout.CENTER, constraints)) {
      result = this.center_;
    } else {
      throw new IllegalArgumentException('cannot get component: invalid constraint: ' + $J.str(constraints));
    }
    return result;
  }
  /**
   * Gets the constraints for the specified component
   *
   * @param   comp the component to be queried
   * @return  the constraint for the specified component,
   *          or null if component is null or is not present
   *          in this layout
   * @see #addLayoutComponent(java.awt.Component, java.lang.Object)
   * @since 1.5
   */
  getConstraints(comp: Component): any {
    if (comp == null) {
      return null;
    }
    if (comp === this.center_) {
      return BorderLayout.CENTER;
    } else if (comp === this.north) {
      return BorderLayout.NORTH;
    } else if (comp === this.south) {
      return BorderLayout.SOUTH;
    } else if (comp === this.west) {
      return BorderLayout.WEST;
    } else if (comp === this.east) {
      return BorderLayout.EAST;
    } else if (comp === this.firstLine) {
      return BorderLayout.PAGE_START;
    } else if (comp === this.lastLine) {
      return BorderLayout.PAGE_END;
    } else if (comp === this.firstItem) {
      return BorderLayout.LINE_START;
    } else if (comp === this.lastItem) {
      return BorderLayout.LINE_END;
    }
    return null;
  }
  /**
   * Determines the minimum size of the {@code target} container
   * using this layout manager.
   * <p>
   * This method is called when a container calls its
   * {@code getMinimumSize} method. Most applications do not call
   * this method directly.
   * @param   target   the container in which to do the layout.
   * @return  the minimum dimensions needed to lay out the subcomponents
   *          of the specified container.
   * @see     java.awt.Container
   * @see     java.awt.BorderLayout#preferredLayoutSize
   * @see     java.awt.Container#getMinimumSize()
   */
  minimumLayoutSize(target: Container): Dimension {
    {
      let dim = new Dimension()._Dimension$int$int(0, 0);
      let ltr = target.getComponentOrientation().isLeftToRight();
      let c = null;
      if ((c = this.getChild(BorderLayout.EAST, ltr)) != null) {
        let d = c.getMinimumSize$();
        dim.width_ = (dim.width_ + (d.width_ + this.hgap)) | 0;
        dim.height_ = Math.max(d.height_, dim.height_);
      }
      if ((c = this.getChild(BorderLayout.WEST, ltr)) != null) {
        let d = c.getMinimumSize$();
        dim.width_ = (dim.width_ + (d.width_ + this.hgap)) | 0;
        dim.height_ = Math.max(d.height_, dim.height_);
      }
      if ((c = this.getChild(BorderLayout.CENTER, ltr)) != null) {
        let d = c.getMinimumSize$();
        dim.width_ = (dim.width_ + d.width_) | 0;
        dim.height_ = Math.max(d.height_, dim.height_);
      }
      if ((c = this.getChild(BorderLayout.NORTH, ltr)) != null) {
        let d = c.getMinimumSize$();
        dim.width_ = Math.max(d.width_, dim.width_);
        dim.height_ = (dim.height_ + (d.height_ + this.vgap)) | 0;
      }
      if ((c = this.getChild(BorderLayout.SOUTH, ltr)) != null) {
        let d = c.getMinimumSize$();
        dim.width_ = Math.max(d.width_, dim.width_);
        dim.height_ = (dim.height_ + (d.height_ + this.vgap)) | 0;
      }
      let insets = target.getInsets$();
      dim.width_ = (dim.width_ + (insets.left + insets.right)) | 0;
      dim.height_ = (dim.height_ + (insets.top + insets.bottom)) | 0;
      return dim;
    }
  }
  /**
   * Determines the preferred size of the {@code target}
   * container using this layout manager, based on the components
   * in the container.
   * <p>
   * Most applications do not call this method directly. This method
   * is called when a container calls its {@code getPreferredSize}
   * method.
   * @param   target   the container in which to do the layout.
   * @return  the preferred dimensions to lay out the subcomponents
   *          of the specified container.
   * @see     java.awt.Container
   * @see     java.awt.BorderLayout#minimumLayoutSize
   * @see     java.awt.Container#getPreferredSize()
   */
  preferredLayoutSize(target: Container): Dimension {
    {
      let dim = new Dimension()._Dimension$int$int(0, 0);
      let ltr = target.getComponentOrientation().isLeftToRight();
      let c = null;
      if ((c = this.getChild(BorderLayout.EAST, ltr)) != null) {
        let d = c.getPreferredSize$();
        dim.width_ = (dim.width_ + (d.width_ + this.hgap)) | 0;
        dim.height_ = Math.max(d.height_, dim.height_);
      }
      if ((c = this.getChild(BorderLayout.WEST, ltr)) != null) {
        let d = c.getPreferredSize$();
        dim.width_ = (dim.width_ + (d.width_ + this.hgap)) | 0;
        dim.height_ = Math.max(d.height_, dim.height_);
      }
      if ((c = this.getChild(BorderLayout.CENTER, ltr)) != null) {
        let d = c.getPreferredSize$();
        dim.width_ = (dim.width_ + d.width_) | 0;
        dim.height_ = Math.max(d.height_, dim.height_);
      }
      if ((c = this.getChild(BorderLayout.NORTH, ltr)) != null) {
        let d = c.getPreferredSize$();
        dim.width_ = Math.max(d.width_, dim.width_);
        dim.height_ = (dim.height_ + (d.height_ + this.vgap)) | 0;
      }
      if ((c = this.getChild(BorderLayout.SOUTH, ltr)) != null) {
        let d = c.getPreferredSize$();
        dim.width_ = Math.max(d.width_, dim.width_);
        dim.height_ = (dim.height_ + (d.height_ + this.vgap)) | 0;
      }
      let insets = target.getInsets$();
      dim.width_ = (dim.width_ + (insets.left + insets.right)) | 0;
      dim.height_ = (dim.height_ + (insets.top + insets.bottom)) | 0;
      return dim;
    }
  }
  /**
   * Returns the maximum dimensions for this layout given the components
   * in the specified target container.
   * @param target the component which needs to be laid out
   * @see Container
   * @see #minimumLayoutSize
   * @see #preferredLayoutSize
   */
  maximumLayoutSize(target: Container): Dimension {
    return new Dimension()._Dimension$int$int(2147483647, 2147483647);
  }
  /**
   * Returns the alignment along the x axis.  This specifies how
   * the component would like to be aligned relative to other
   * components.  The value should be a number between 0 and 1
   * where 0 represents alignment along the origin, 1 is aligned
   * the furthest away from the origin, 0.5 is centered, etc.
   */
  getLayoutAlignmentX(parent: Container): number {
    return 0.5;
  }
  /**
   * Returns the alignment along the y axis.  This specifies how
   * the component would like to be aligned relative to other
   * components.  The value should be a number between 0 and 1
   * where 0 represents alignment along the origin, 1 is aligned
   * the furthest away from the origin, 0.5 is centered, etc.
   */
  getLayoutAlignmentY(parent: Container): number {
    return 0.5;
  }
  /**
   * Invalidates the layout, indicating that if the layout manager
   * has cached information it should be discarded.
   */
  invalidateLayout(target: Container): void {
  }
  /**
   * Lays out the container argument using this border layout.
   * <p>
   * This method actually reshapes the components in the specified
   * container in order to satisfy the constraints of this
   * {@code BorderLayout} object. The {@code NORTH}
   * and {@code SOUTH} components, if any, are placed at
   * the top and bottom of the container, respectively. The
   * {@code WEST} and {@code EAST} components are
   * then placed on the left and right, respectively. Finally,
   * the {@code CENTER} object is placed in any remaining
   * space in the middle.
   * <p>
   * Most applications do not call this method directly. This method
   * is called when a container calls its {@code doLayout} method.
   * @param   target   the container in which to do the layout.
   * @see     java.awt.Container
   * @see     java.awt.Container#doLayout()
   */
  layoutContainer$Container(target: Container): void {
    {
      let insets = target.getInsets$();
      let top = insets.top;
      let bottom = (target.height_ - insets.bottom) | 0;
      let left = insets.left;
      let right = (target.width_ - insets.right) | 0;
      let ltr = target.getComponentOrientation().isLeftToRight();
      let c = null;
      if ((c = this.getChild(BorderLayout.NORTH, ltr)) != null) {
        c.setSize$int$int((right - left) | 0, c.height_);
        let d = c.getPreferredSize$();
        c.setBounds$int$int$int$int(left, top, (right - left) | 0, d.height_);
        top = (top + (d.height_ + this.vgap)) | 0;
      }
      if ((c = this.getChild(BorderLayout.SOUTH, ltr)) != null) {
        c.setSize$int$int((right - left) | 0, c.height_);
        let d = c.getPreferredSize$();
        c.setBounds$int$int$int$int(left, (bottom - d.height_) | 0, (right - left) | 0, d.height_);
        bottom = (bottom - (d.height_ + this.vgap)) | 0;
      }
      if ((c = this.getChild(BorderLayout.EAST, ltr)) != null) {
        c.setSize$int$int(c.width_, (bottom - top) | 0);
        let d = c.getPreferredSize$();
        c.setBounds$int$int$int$int((right - d.width_) | 0, top, d.width_, (bottom - top) | 0);
        right = (right - (d.width_ + this.hgap)) | 0;
      }
      if ((c = this.getChild(BorderLayout.WEST, ltr)) != null) {
        c.setSize$int$int(c.width_, (bottom - top) | 0);
        let d = c.getPreferredSize$();
        c.setBounds$int$int$int$int(left, top, d.width_, (bottom - top) | 0);
        left = (left + (d.width_ + this.hgap)) | 0;
      }
      if ((c = this.getChild(BorderLayout.CENTER, ltr)) != null) {
        c.setBounds$int$int$int$int(left, top, (right - left) | 0, (bottom - top) | 0);
      }
    }
  }
  /**
   * Get the component that corresponds to the given constraint location
   *
   * @param   key     The desired absolute position,
   *                  either NORTH, SOUTH, EAST, or WEST.
   * @param   ltr     Is the component line direction left-to-right?
   */
  getChild(key: string, ltr: boolean): Component {
    let result = null;
    if (key === BorderLayout.NORTH) {
      result = (this.firstLine != null) ? this.firstLine : this.north;
    } else if (key === BorderLayout.SOUTH) {
      result = (this.lastLine != null) ? this.lastLine : this.south;
    } else if (key === BorderLayout.WEST) {
      result = ltr ? this.firstItem : this.lastItem;
      if (result == null) {
        result = this.west;
      }
    } else if (key === BorderLayout.EAST) {
      result = ltr ? this.lastItem : this.firstItem;
      if (result == null) {
        result = this.east;
      }
    } else if (key === BorderLayout.CENTER) {
      result = this.center_;
    }
    if (result != null && !result.visible) {
      result = null;
    }
    return result;
  }
  /**
   * Returns a string representation of the state of this border layout.
   * @return    a string representation of this border layout.
   */
  toString(): string {
    return $J.getClass(this).getName() + '[hgap=' + this.hgap + ',vgap=' + this.vgap + ']';
  }
}

$J.define(BorderLayout, 'java.awt.BorderLayout', { kind: 'class', ifaces: ['java.awt.LayoutManager2', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'int,int': '_BorderLayout$int$int', '': '_BorderLayout$' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'getLayoutComponent(java.awt.Container,java.lang.Object)': 'getLayoutComponent$Container$Object', 'getLayoutComponent(java.lang.Object)': 'getLayoutComponent$Object', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component', 'addLayoutComponent(java.awt.Component,java.lang.Object)': 'addLayoutComponent$Component$Object' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
});
