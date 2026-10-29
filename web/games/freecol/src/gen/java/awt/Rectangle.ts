// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Rectangle.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Toolkit } from '../../../jre/index.ts';
import { Rectangle2D } from './geom/Rectangle2D.ts';

let Dimension, GraphicsEnvironment, Point;

/**
 * A {@code Rectangle} specifies an area in a coordinate space that is
 * enclosed by the {@code Rectangle} object's upper-left point
 * {@code (x,y)}
 * in the coordinate space, its width, and its height.
 * <p>
 * A {@code Rectangle} object's {@code width} and
 * {@code height} are {@code public} fields. The constructors
 * that create a {@code Rectangle}, and the methods that can modify
 * one, do not prevent setting a negative value for width or height.
 * <p>
 * <a id="Empty">
 * A {@code Rectangle} whose width or height is exactly zero has location
 * along those axes with zero dimension, but is otherwise considered empty.</a>
 * The {@link #isEmpty} method will return true for such a {@code Rectangle}.
 * Methods which test if an empty {@code Rectangle} contains or intersects
 * a point or rectangle will always return false if either dimension is zero.
 * Methods which combine such a {@code Rectangle} with a point or rectangle
 * will include the location of the {@code Rectangle} on that axis in the
 * result as if the {@link #add(Point)} method were being called.
 * <p>
 * <a id="NonExistent">
 * A {@code Rectangle} whose width or height is negative has neither
 * location nor dimension along those axes with negative dimensions.
 * Such a {@code Rectangle} is treated as non-existent along those axes.
 * Such a {@code Rectangle} is also empty with respect to containment
 * calculations and methods which test if it contains or intersects a
 * point or rectangle will always return false.
 * Methods which combine such a {@code Rectangle} with a point or rectangle
 * will ignore the {@code Rectangle} entirely in generating the result.
 * If two {@code Rectangle} objects are combined and each has a negative
 * dimension, the result will have at least one negative dimension.
 * </a>
 * <p>
 * Methods which affect only the location of a {@code Rectangle} will
 * operate on its location regardless of whether or not it has a negative
 * or zero dimension along either axis.
 * <p>
 * Note that a {@code Rectangle} constructed with the default no-argument
 * constructor will have dimensions of {@code 0x0} and therefore be empty.
 * That {@code Rectangle} will still have a location of {@code (0,0)} and
 * will contribute that location to the union and add operations.
 * Code attempting to accumulate the bounds of a set of points should
 * therefore initially construct the {@code Rectangle} with a specifically
 * negative width and height or it should use the first point in the set
 * to construct the {@code Rectangle}.
 * For example:
 * <pre>{@code
 *     Rectangle bounds = new Rectangle(0, 0, -1, -1);
 *     for (int i = 0; i < points.length; i++) {
 *         bounds.add(points[i]);
 *     }
 * }</pre>
 * or if we know that the points array contains at least one point:
 * <pre>{@code
 *     Rectangle bounds = new Rectangle(points[0]);
 *     for (int i = 1; i < points.length; i++) {
 *         bounds.add(points[i]);
 *     }
 * }</pre>
 * <p>
 * This class uses 32-bit integers to store its location and dimensions.
 * Frequently operations may produce a result that exceeds the range of
 * a 32-bit integer.
 * The methods will calculate their results in a way that avoids any
 * 32-bit overflow for intermediate results and then choose the best
 * representation to store the final results back into the 32-bit fields
 * which hold the location and dimensions.
 * The location of the result will be stored into the {@link #x} and
 * {@link #y} fields by clipping the true result to the nearest 32-bit value.
 * The values stored into the {@link #width} and {@link #height} dimension
 * fields will be chosen as the 32-bit values that encompass the largest
 * part of the true result as possible.
 * Generally this means that the dimension will be clipped independently
 * to the range of 32-bit integers except that if the location had to be
 * moved to store it into its pair of 32-bit fields then the dimensions
 * will be adjusted relative to the "best representation" of the location.
 * If the true result had a negative dimension and was therefore
 * non-existent along one or both axes, the stored dimensions will be
 * negative numbers in those axes.
 * If the true result had a location that could be represented within
 * the range of 32-bit integers, but zero dimension along one or both
 * axes, then the stored dimensions will be zero in those axes.
 *
 * @author      Sami Shaio
 * @since 1.0
 */
export class Rectangle extends Rectangle2D {
  /**
   * The X coordinate of the upper-left corner of the {@code Rectangle}.
   *
   * @serial
   * @see #setLocation(int, int)
   * @see #getLocation()
   * @since 1.0
   */
  x_: number = 0;
  /**
   * The Y coordinate of the upper-left corner of the {@code Rectangle}.
   *
   * @serial
   * @see #setLocation(int, int)
   * @see #getLocation()
   * @since 1.0
   */
  y_: number = 0;
  /**
   * The width of the {@code Rectangle}.
   * @serial
   * @see #setSize(int, int)
   * @see #getSize()
   * @since 1.0
   */
  width_: number = 0;
  /**
   * The height of the {@code Rectangle}.
   *
   * @serial
   * @see #setSize(int, int)
   * @see #getSize()
   * @since 1.0
   */
  height_: number = 0;
  /**
   * Constructs a new {@code Rectangle} whose upper-left corner
   * is at (0,&nbsp;0) in the coordinate space, and whose width and
   * height are both zero.
   */
  _Rectangle$(): this {
    this._Rectangle$int$int$int$int(0, 0, 0, 0);
    return this;
  }
  /**
   * Constructs a new {@code Rectangle}, initialized to match
   * the values of the specified {@code Rectangle}.
   * @param r  the {@code Rectangle} from which to copy initial values
   *           to a newly constructed {@code Rectangle}
   * @since 1.1
   */
  _Rectangle$Rectangle(r: Rectangle): this {
    this._Rectangle$int$int$int$int(r.x_, r.y_, r.width_, r.height_);
    return this;
  }
  /**
   * Constructs a new {@code Rectangle} whose upper-left corner is
   * specified as
   * {@code (x,y)} and whose width and height
   * are specified by the arguments of the same name.
   * @param     x the specified X coordinate
   * @param     y the specified Y coordinate
   * @param     width    the width of the {@code Rectangle}
   * @param     height   the height of the {@code Rectangle}
   * @since 1.0
   */
  _Rectangle$int$int$int$int(x: number, y: number, width: number, height: number): this {
    this._Rectangle2D();
    this.x_ = x;
    this.y_ = y;
    this.width_ = width;
    this.height_ = height;
    return this;
  }
  /**
   * Constructs a new {@code Rectangle} whose upper-left corner
   * is at (0,&nbsp;0) in the coordinate space, and whose width and
   * height are specified by the arguments of the same name.
   * @param width the width of the {@code Rectangle}
   * @param height the height of the {@code Rectangle}
   */
  _Rectangle$int$int(width: number, height: number): this {
    this._Rectangle$int$int$int$int(0, 0, width, height);
    return this;
  }
  /**
   * Constructs a new {@code Rectangle} whose upper-left corner is
   * specified by the {@link Point} argument, and
   * whose width and height are specified by the
   * {@link Dimension} argument.
   * @param p a {@code Point} that is the upper-left corner of
   * the {@code Rectangle}
   * @param d a {@code Dimension}, representing the
   * width and height of the {@code Rectangle}
   */
  _Rectangle$Point$Dimension(p: Point, d: Dimension): this {
    this._Rectangle$int$int$int$int(p.x_, p.y_, d.width_, d.height_);
    return this;
  }
  /**
   * Constructs a new {@code Rectangle} whose upper-left corner is the
   * specified {@code Point}, and whose width and height are both zero.
   * @param p a {@code Point} that is the top left corner
   * of the {@code Rectangle}
   */
  _Rectangle$Point(p: Point): this {
    this._Rectangle$int$int$int$int(p.x_, p.y_, 0, 0);
    return this;
  }
  /**
   * Constructs a new {@code Rectangle} whose top left corner is
   * (0,&nbsp;0) and whose width and height are specified
   * by the {@code Dimension} argument.
   * @param d a {@code Dimension}, specifying width and height
   */
  _Rectangle$Dimension(d: Dimension): this {
    this._Rectangle$int$int$int$int(0, 0, d.width_, d.height_);
    return this;
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('java.awt.Rectangle', 'initIDs', this, $a);
  }
  /**
   * Returns the X coordinate of the bounding {@code Rectangle} in
   * {@code double} precision.
   * @return the X coordinate of the bounding {@code Rectangle}.
   */
  getX(): number {
    return this.x_;
  }
  /**
   * Returns the Y coordinate of the bounding {@code Rectangle} in
   * {@code double} precision.
   * @return the Y coordinate of the bounding {@code Rectangle}.
   */
  getY(): number {
    return this.y_;
  }
  /**
   * Returns the width of the bounding {@code Rectangle} in
   * {@code double} precision.
   * @return the width of the bounding {@code Rectangle}.
   */
  getWidth(): number {
    return this.width_;
  }
  /**
   * Returns the height of the bounding {@code Rectangle} in
   * {@code double} precision.
   * @return the height of the bounding {@code Rectangle}.
   */
  getHeight(): number {
    return this.height_;
  }
  /**
   * Gets the bounding {@code Rectangle} of this {@code Rectangle}.
   * <p>
   * This method is included for completeness, to parallel the
   * {@code getBounds} method of
   * {@link Component}.
   * @return    a new {@code Rectangle}, equal to the
   * bounding {@code Rectangle} for this {@code Rectangle}.
   * @see       java.awt.Component#getBounds
   * @see       #setBounds(Rectangle)
   * @see       #setBounds(int, int, int, int)
   * @since     1.1
   */
  getBounds(): Rectangle {
    return new Rectangle()._Rectangle$int$int$int$int(this.x_, this.y_, this.width_, this.height_);
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  getBounds2D(): Rectangle2D {
    return new Rectangle()._Rectangle$int$int$int$int(this.x_, this.y_, this.width_, this.height_);
  }
  /**
   * Sets the bounding {@code Rectangle} of this {@code Rectangle}
   * to match the specified {@code Rectangle}.
   * <p>
   * This method is included for completeness, to parallel the
   * {@code setBounds} method of {@code Component}.
   * @param r the specified {@code Rectangle}
   * @see       #getBounds
   * @see       java.awt.Component#setBounds(java.awt.Rectangle)
   * @since     1.1
   */
  setBounds$Rectangle(r: Rectangle): void {
    this.setBounds$int$int$int$int(r.x_, r.y_, r.width_, r.height_);
  }
  /**
   * Sets the bounding {@code Rectangle} of this
   * {@code Rectangle} to the specified
   * {@code x}, {@code y}, {@code width},
   * and {@code height}.
   * <p>
   * This method is included for completeness, to parallel the
   * {@code setBounds} method of {@code Component}.
   * @param x the new X coordinate for the upper-left
   *                    corner of this {@code Rectangle}
   * @param y the new Y coordinate for the upper-left
   *                    corner of this {@code Rectangle}
   * @param width the new width for this {@code Rectangle}
   * @param height the new height for this {@code Rectangle}
   * @see       #getBounds
   * @see       java.awt.Component#setBounds(int, int, int, int)
   * @since     1.1
   */
  setBounds$int$int$int$int(x: number, y: number, width: number, height: number): void {
    this.reshape(x, y, width, height);
  }
  /**
   * Sets the bounds of this {@code Rectangle} to the integer bounds
   * which encompass the specified {@code x}, {@code y}, {@code width},
   * and {@code height}.
   * If the parameters specify a {@code Rectangle} that exceeds the
   * maximum range of integers, the result will be the best
   * representation of the specified {@code Rectangle} intersected
   * with the maximum integer bounds.
   * @param x the X coordinate of the upper-left corner of
   *                  the specified rectangle
   * @param y the Y coordinate of the upper-left corner of
   *                  the specified rectangle
   * @param width the width of the specified rectangle
   * @param height the new height of the specified rectangle
   */
  setRect$double$double$double$double(x: number, y: number, width: number, height: number): void {
    let newx: number;
    let newy: number;
    let neww: number;
    let newh: number;
    if (x > 2 * 2147483647) {
      newx = 2147483647;
      neww = -1;
    } else {
      newx = Rectangle.clip(x, false);
      if (width >= 0) {
        width += x - newx;
      }
      neww = Rectangle.clip(width, width >= 0);
    }
    if (y > 2 * 2147483647) {
      newy = 2147483647;
      newh = -1;
    } else {
      newy = Rectangle.clip(y, false);
      if (height >= 0) {
        height += y - newy;
      }
      newh = Rectangle.clip(height, height >= 0);
    }
    this.reshape(newx, newy, neww, newh);
  }
  static clip(v: number, doceil: boolean): number {
    if (v <= -2147483648) {
      return -2147483648;
    }
    if (v >= 2147483647) {
      return 2147483647;
    }
    return $J.d2i((doceil ? Math.ceil(v) : Math.floor(v)));
  }
  /**
   * Sets the bounding {@code Rectangle} of this
   * {@code Rectangle} to the specified
   * {@code x}, {@code y}, {@code width},
   * and {@code height}.
   *
   * @param x the new X coordinate for the upper-left
   *                    corner of this {@code Rectangle}
   * @param y the new Y coordinate for the upper-left
   *                    corner of this {@code Rectangle}
   * @param width the new width for this {@code Rectangle}
   * @param height the new height for this {@code Rectangle}
   * @deprecated As of JDK version 1.1,
   * replaced by {@code setBounds(int, int, int, int)}.
   */
  reshape(x: number, y: number, width: number, height: number): void {
    this.x_ = x;
    this.y_ = y;
    this.width_ = width;
    this.height_ = height;
  }
  /**
   * Returns the location of this {@code Rectangle}.
   * <p>
   * This method is included for completeness, to parallel the
   * {@code getLocation} method of {@code Component}.
   * @return the {@code Point} that is the upper-left corner of
   *                  this {@code Rectangle}.
   * @see       java.awt.Component#getLocation
   * @see       #setLocation(Point)
   * @see       #setLocation(int, int)
   * @since     1.1
   */
  getLocation(): Point {
    return new Point()._Point$int$int(this.x_, this.y_);
  }
  /**
   * Moves this {@code Rectangle} to the specified location.
   * <p>
   * This method is included for completeness, to parallel the
   * {@code setLocation} method of {@code Component}.
   * @param x the X coordinate of the new location
   * @param y the Y coordinate of the new location
   * @see       #getLocation
   * @see       java.awt.Component#setLocation(int, int)
   * @since     1.1
   */
  setLocation$int$int(x: number, y: number): void {
    this.move(x, y);
  }
  /**
   * Moves this {@code Rectangle} to the specified location.
   *
   * @param x the X coordinate of the new location
   * @param y the Y coordinate of the new location
   * @deprecated As of JDK version 1.1,
   * replaced by {@code setLocation(int, int)}.
   */
  move(x: number, y: number): void {
    this.x_ = x;
    this.y_ = y;
  }
  /**
   * Translates this {@code Rectangle} the indicated distance,
   * to the right along the X coordinate axis, and
   * downward along the Y coordinate axis.
   * @param dx the distance to move this {@code Rectangle}
   *                 along the X axis
   * @param dy the distance to move this {@code Rectangle}
   *                 along the Y axis
   * @see       java.awt.Rectangle#setLocation(int, int)
   * @see       java.awt.Rectangle#setLocation(java.awt.Point)
   */
  translate(dx: number, dy: number): void {
    let oldv = this.x_;
    let newv = (oldv + dx) | 0;
    if (dx < 0) {
      if (newv > oldv) {
        if (this.width_ >= 0) {
          this.width_ = (this.width_ + (newv - -2147483648)) | 0;
        }
        newv = -2147483648;
      }
    } else {
      if (newv < oldv) {
        if (this.width_ >= 0) {
          this.width_ = (this.width_ + (newv - 2147483647)) | 0;
          if (this.width_ < 0) {
            this.width_ = 2147483647;
          }
        }
        newv = 2147483647;
      }
    }
    this.x_ = newv;
    oldv = this.y_;
    newv = (oldv + dy) | 0;
    if (dy < 0) {
      if (newv > oldv) {
        if (this.height_ >= 0) {
          this.height_ = (this.height_ + (newv - -2147483648)) | 0;
        }
        newv = -2147483648;
      }
    } else {
      if (newv < oldv) {
        if (this.height_ >= 0) {
          this.height_ = (this.height_ + (newv - 2147483647)) | 0;
          if (this.height_ < 0) {
            this.height_ = 2147483647;
          }
        }
        newv = 2147483647;
      }
    }
    this.y_ = newv;
  }
  /**
   * Gets the size of this {@code Rectangle}, represented by
   * the returned {@code Dimension}.
   * <p>
   * This method is included for completeness, to parallel the
   * {@code getSize} method of {@code Component}.
   * @return a {@code Dimension}, representing the size of
   *            this {@code Rectangle}.
   * @see       java.awt.Component#getSize
   * @see       #setSize(Dimension)
   * @see       #setSize(int, int)
   * @since     1.1
   */
  getSize(): Dimension {
    return new Dimension()._Dimension$int$int(this.width_, this.height_);
  }
  /**
   * Sets the size of this {@code Rectangle} to the specified
   * width and height.
   * <p>
   * This method is included for completeness, to parallel the
   * {@code setSize} method of {@code Component}.
   * @param width the new width for this {@code Rectangle}
   * @param height the new height for this {@code Rectangle}
   * @see       java.awt.Component#setSize(int, int)
   * @see       #getSize
   * @since     1.1
   */
  setSize$int$int(width: number, height: number): void {
    this.resize(width, height);
  }
  /**
   * Sets the size of this {@code Rectangle} to the specified
   * width and height.
   *
   * @param width the new width for this {@code Rectangle}
   * @param height the new height for this {@code Rectangle}
   * @deprecated As of JDK version 1.1,
   * replaced by {@code setSize(int, int)}.
   */
  resize(width: number, height: number): void {
    this.width_ = width;
    this.height_ = height;
  }
  /**
   * Checks whether or not this {@code Rectangle} contains the
   * specified {@code Point}.
   * @param p the {@code Point} to test
   * @return    {@code true} if the specified {@code Point}
   *            is inside this {@code Rectangle};
   *            {@code false} otherwise.
   * @since     1.1
   */
  contains$Point(p: Point): boolean {
    return this.contains$int$int(p.x_, p.y_);
  }
  /**
   * Checks whether or not this {@code Rectangle} contains the
   * point at the specified location {@code (x,y)}.
   *
   * @param  x the specified X coordinate
   * @param  y the specified Y coordinate
   * @return    {@code true} if the point
   *            {@code (x,y)} is inside this
   *            {@code Rectangle};
   *            {@code false} otherwise.
   * @since     1.1
   */
  contains$int$int(x: number, y: number): boolean {
    return this.inside(x, y);
  }
  /**
   * Checks whether or not this {@code Rectangle} entirely contains
   * the specified {@code Rectangle}.
   *
   * @param     r   the specified {@code Rectangle}
   * @return    {@code true} if the {@code Rectangle}
   *            is contained entirely inside this {@code Rectangle};
   *            {@code false} otherwise
   * @since     1.2
   */
  contains$Rectangle(r: Rectangle): boolean {
    return this.contains$int$int$int$int(r.x_, r.y_, r.width_, r.height_);
  }
  /**
   * Checks whether this {@code Rectangle} entirely contains
   * the {@code Rectangle}
   * at the specified location {@code (X,Y)} with the
   * specified dimensions {@code (W,H)}.
   * @param     X the specified X coordinate
   * @param     Y the specified Y coordinate
   * @param     W   the width of the {@code Rectangle}
   * @param     H   the height of the {@code Rectangle}
   * @return    {@code true} if the {@code Rectangle} specified by
   *            {@code (X, Y, W, H)}
   *            is entirely enclosed inside this {@code Rectangle};
   *            {@code false} otherwise.
   * @since     1.1
   */
  contains$int$int$int$int(X: number, Y: number, W: number, H: number): boolean {
    let w = this.width_;
    let h = this.height_;
    if ((w | h | W | H) < 0) {
      return false;
    }
    let x = this.x_;
    let y = this.y_;
    if (X < x || Y < y) {
      return false;
    }
    w = (w + x) | 0;
    W = (W + X) | 0;
    if (W <= X) {
      if (w >= x || W > w) {
        return false;
      }
    } else {
      if (w >= x && W > w) {
        return false;
      }
    }
    h = (h + y) | 0;
    H = (H + Y) | 0;
    if (H <= Y) {
      if (h >= y || H > h) {
        return false;
      }
    } else {
      if (h >= y && H > h) {
        return false;
      }
    }
    return true;
  }
  /**
   * Checks whether or not this {@code Rectangle} contains the
   * point at the specified location {@code (X,Y)}.
   *
   * @param  X the specified X coordinate
   * @param  Y the specified Y coordinate
   * @return    {@code true} if the point
   *            {@code (X,Y)} is inside this
   *            {@code Rectangle};
   *            {@code false} otherwise.
   * @deprecated As of JDK version 1.1,
   * replaced by {@code contains(int, int)}.
   */
  inside(X: number, Y: number): boolean {
    let w = this.width_;
    let h = this.height_;
    if ((w | h) < 0) {
      return false;
    }
    let x = this.x_;
    let y = this.y_;
    if (X < x || Y < y) {
      return false;
    }
    w = (w + x) | 0;
    h = (h + y) | 0;
    return ((w < x || w > X) && (h < y || h > Y));
  }
  /**
   * Determines whether or not this {@code Rectangle} and the specified
   * {@code Rectangle} intersect. Two rectangles intersect if
   * their intersection is nonempty.
   *
   * @param r the specified {@code Rectangle}
   * @return    {@code true} if the specified {@code Rectangle}
   *            and this {@code Rectangle} intersect;
   *            {@code false} otherwise.
   */
  intersects$Rectangle(r: Rectangle): boolean {
    let tw = this.width_;
    let th = this.height_;
    let rw = r.width_;
    let rh = r.height_;
    if (rw <= 0 || rh <= 0 || tw <= 0 || th <= 0) {
      return false;
    }
    let tx = this.x_;
    let ty = this.y_;
    let rx = r.x_;
    let ry = r.y_;
    rw = (rw + rx) | 0;
    rh = (rh + ry) | 0;
    tw = (tw + tx) | 0;
    th = (th + ty) | 0;
    return ((rw < rx || rw > tx) && (rh < ry || rh > ty) && (tw < tx || tw > rx) && (th < ty || th > ry));
  }
  /**
   * Computes the intersection of this {@code Rectangle} with the
   * specified {@code Rectangle}. Returns a new {@code Rectangle}
   * that represents the intersection of the two rectangles.
   * If the two rectangles do not intersect, the result will be
   * an empty rectangle.
   *
   * @param     r   the specified {@code Rectangle}
   * @return    the largest {@code Rectangle} contained in both the
   *            specified {@code Rectangle} and in
   *            this {@code Rectangle}; or if the rectangles
   *            do not intersect, an empty rectangle.
   */
  intersection(r: Rectangle): Rectangle {
    let tx1 = this.x_;
    let ty1 = this.y_;
    let rx1 = r.x_;
    let ry1 = r.y_;
    let tx2 = tx1;
    tx2 += this.width_;
    let ty2 = ty1;
    ty2 += this.height_;
    let rx2 = rx1;
    rx2 += r.width_;
    let ry2 = ry1;
    ry2 += r.height_;
    if (tx1 < rx1) {
      tx1 = rx1;
    }
    if (ty1 < ry1) {
      ty1 = ry1;
    }
    if (tx2 > rx2) {
      tx2 = rx2;
    }
    if (ty2 > ry2) {
      ty2 = ry2;
    }
    tx2 -= tx1;
    ty2 -= ty1;
    if (tx2 < -2147483648) {
      tx2 = -2147483648;
    }
    if (ty2 < -2147483648) {
      ty2 = -2147483648;
    }
    return new Rectangle()._Rectangle$int$int$int$int(tx1, ty1, (tx2) | 0, (ty2) | 0);
  }
  /**
   * Computes the union of this {@code Rectangle} with the
   * specified {@code Rectangle}. Returns a new
   * {@code Rectangle} that
   * represents the union of the two rectangles.
   * <p>
   * If either {@code Rectangle} has any dimension less than zero
   * the rules for <a href=#NonExistent>non-existent</a> rectangles
   * apply.
   * If only one has a dimension less than zero, then the result
   * will be a copy of the other {@code Rectangle}.
   * If both have dimension less than zero, then the result will
   * have at least one dimension less than zero.
   * <p>
   * If the resulting {@code Rectangle} would have a dimension
   * too large to be expressed as an {@code int}, the result
   * will have a dimension of {@code Integer.MAX_VALUE} along
   * that dimension.
   * @param r the specified {@code Rectangle}
   * @return    the smallest {@code Rectangle} containing both
   *            the specified {@code Rectangle} and this
   *            {@code Rectangle}.
   */
  union(r: Rectangle): Rectangle {
    let tx2 = this.width_;
    let ty2 = this.height_;
    if (($J.lor(tx2, ty2)) < 0) {
      return new Rectangle()._Rectangle$Rectangle(r);
    }
    let rx2 = r.width_;
    let ry2 = r.height_;
    if (($J.lor(rx2, ry2)) < 0) {
      return new Rectangle()._Rectangle$Rectangle(this);
    }
    let tx1 = this.x_;
    let ty1 = this.y_;
    tx2 += tx1;
    ty2 += ty1;
    let rx1 = r.x_;
    let ry1 = r.y_;
    rx2 += rx1;
    ry2 += ry1;
    if (tx1 > rx1) {
      tx1 = rx1;
    }
    if (ty1 > ry1) {
      ty1 = ry1;
    }
    if (tx2 < rx2) {
      tx2 = rx2;
    }
    if (ty2 < ry2) {
      ty2 = ry2;
    }
    tx2 -= tx1;
    ty2 -= ty1;
    if (tx2 > 2147483647) {
      tx2 = 2147483647;
    }
    if (ty2 > 2147483647) {
      ty2 = 2147483647;
    }
    return new Rectangle()._Rectangle$int$int$int$int(tx1, ty1, (tx2) | 0, (ty2) | 0);
  }
  /**
   * Adds a point, specified by the integer arguments {@code newx,newy}
   * to the bounds of this {@code Rectangle}.
   * <p>
   * If this {@code Rectangle} has any dimension less than zero,
   * the rules for <a href=#NonExistent>non-existent</a>
   * rectangles apply.
   * In that case, the new bounds of this {@code Rectangle} will
   * have a location equal to the specified coordinates and
   * width and height equal to zero.
   * <p>
   * After adding a point, a call to {@code contains} with the
   * added point as an argument does not necessarily return
   * {@code true}. The {@code contains} method does not
   * return {@code true} for points on the right or bottom
   * edges of a {@code Rectangle}. Therefore, if the added point
   * falls on the right or bottom edge of the enlarged
   * {@code Rectangle}, {@code contains} returns
   * {@code false} for that point.
   * If the specified point must be contained within the new
   * {@code Rectangle}, a 1x1 rectangle should be added instead:
   * <pre>
   *     r.add(new Rectangle(newx, newy, 1, 1));
   * </pre>
   * @param newx the X coordinate of the new point
   * @param newy the Y coordinate of the new point
   */
  add$int$int(newx: number, newy: number): void {
    if ((this.width_ | this.height_) < 0) {
      this.x_ = newx;
      this.y_ = newy;
      this.width_ = this.height_ = 0;
      return;
    }
    let x1 = this.x_;
    let y1 = this.y_;
    let x2 = this.width_;
    let y2 = this.height_;
    x2 += x1;
    y2 += y1;
    if (x1 > newx) {
      x1 = newx;
    }
    if (y1 > newy) {
      y1 = newy;
    }
    if (x2 < newx) {
      x2 = newx;
    }
    if (y2 < newy) {
      y2 = newy;
    }
    x2 -= x1;
    y2 -= y1;
    if (x2 > 2147483647) {
      x2 = 2147483647;
    }
    if (y2 > 2147483647) {
      y2 = 2147483647;
    }
    this.reshape(x1, y1, (x2) | 0, (y2) | 0);
  }
  /**
   * Adds a {@code Rectangle} to this {@code Rectangle}.
   * The resulting {@code Rectangle} is the union of the two
   * rectangles.
   * <p>
   * If either {@code Rectangle} has any dimension less than 0, the
   * result will have the dimensions of the other {@code Rectangle}.
   * If both {@code Rectangle}s have at least one dimension less
   * than 0, the result will have at least one dimension less than 0.
   * <p>
   * If either {@code Rectangle} has one or both dimensions equal
   * to 0, the result along those axes with 0 dimensions will be
   * equivalent to the results obtained by adding the corresponding
   * origin coordinate to the result rectangle along that axis,
   * similar to the operation of the {@link #add(Point)} method,
   * but contribute no further dimension beyond that.
   * <p>
   * If the resulting {@code Rectangle} would have a dimension
   * too large to be expressed as an {@code int}, the result
   * will have a dimension of {@code Integer.MAX_VALUE} along
   * that dimension.
   * @param  r the specified {@code Rectangle}
   */
  add$Rectangle(r: Rectangle): void {
    let tx2 = this.width_;
    let ty2 = this.height_;
    if (($J.lor(tx2, ty2)) < 0) {
      this.reshape(r.x_, r.y_, r.width_, r.height_);
    }
    let rx2 = r.width_;
    let ry2 = r.height_;
    if (($J.lor(rx2, ry2)) < 0) {
      return;
    }
    let tx1 = this.x_;
    let ty1 = this.y_;
    tx2 += tx1;
    ty2 += ty1;
    let rx1 = r.x_;
    let ry1 = r.y_;
    rx2 += rx1;
    ry2 += ry1;
    if (tx1 > rx1) {
      tx1 = rx1;
    }
    if (ty1 > ry1) {
      ty1 = ry1;
    }
    if (tx2 < rx2) {
      tx2 = rx2;
    }
    if (ty2 < ry2) {
      ty2 = ry2;
    }
    tx2 -= tx1;
    ty2 -= ty1;
    if (tx2 > 2147483647) {
      tx2 = 2147483647;
    }
    if (ty2 > 2147483647) {
      ty2 = 2147483647;
    }
    this.reshape(tx1, ty1, (tx2) | 0, (ty2) | 0);
  }
  /**
   * Resizes the {@code Rectangle} both horizontally and vertically.
   * <p>
   * This method modifies the {@code Rectangle} so that it is
   * {@code h} units larger on both the left and right side,
   * and {@code v} units larger at both the top and bottom.
   * <p>
   * The new {@code Rectangle} has {@code (x - h, y - v)}
   * as its upper-left corner,
   * width of {@code (width + 2h)},
   * and a height of {@code (height + 2v)}.
   * <p>
   * If negative values are supplied for {@code h} and
   * {@code v}, the size of the {@code Rectangle}
   * decreases accordingly.
   * The {@code grow} method will check for integer overflow
   * and underflow, but does not check whether the resulting
   * values of {@code width} and {@code height} grow
   * from negative to non-negative or shrink from non-negative
   * to negative.
   * @param h the horizontal expansion
   * @param v the vertical expansion
   */
  grow(h: number, v: number): void {
    let x0 = this.x_;
    let y0 = this.y_;
    let x1 = this.width_;
    let y1 = this.height_;
    x1 += x0;
    y1 += y0;
    x0 -= h;
    y0 -= v;
    x1 += h;
    y1 += v;
    if (x1 < x0) {
      x1 -= x0;
      if (x1 < -2147483648) {
        x1 = -2147483648;
      }
      if (x0 < -2147483648) {
        x0 = -2147483648;
      } else if (x0 > 2147483647) {
        x0 = 2147483647;
      }
    } else {
      if (x0 < -2147483648) {
        x0 = -2147483648;
      } else if (x0 > 2147483647) {
        x0 = 2147483647;
      }
      x1 -= x0;
      if (x1 < -2147483648) {
        x1 = -2147483648;
      } else if (x1 > 2147483647) {
        x1 = 2147483647;
      }
    }
    if (y1 < y0) {
      y1 -= y0;
      if (y1 < -2147483648) {
        y1 = -2147483648;
      }
      if (y0 < -2147483648) {
        y0 = -2147483648;
      } else if (y0 > 2147483647) {
        y0 = 2147483647;
      }
    } else {
      if (y0 < -2147483648) {
        y0 = -2147483648;
      } else if (y0 > 2147483647) {
        y0 = 2147483647;
      }
      y1 -= y0;
      if (y1 < -2147483648) {
        y1 = -2147483648;
      } else if (y1 > 2147483647) {
        y1 = 2147483647;
      }
    }
    this.reshape((x0) | 0, (y0) | 0, (x1) | 0, (y1) | 0);
  }
  /**
   * {@inheritDoc}
   * @since 1.2
   */
  isEmpty(): boolean {
    return (this.width_ <= 0) || (this.height_ <= 0);
  }
  /**
   * Checks whether two rectangles are equal.
   * <p>
   * The result is {@code true} if and only if the argument is not
   * {@code null} and is a {@code Rectangle} object that has the
   * same upper-left corner, width, and height as
   * this {@code Rectangle}.
   * @param obj the {@code Object} to compare with
   *                this {@code Rectangle}
   * @return    {@code true} if the objects are equal;
   *            {@code false} otherwise.
   */
  equals(obj: any): boolean {
    if (obj instanceof Rectangle) {
      let r = obj;
      return ((this.x_ === r.x_) && (this.y_ === r.y_) && (this.width_ === r.width_) && (this.height_ === r.height_));
    }
    return super.equals(obj);
  }
  /**
   * Returns a {@code String} representing this
   * {@code Rectangle} and its values.
   * @return a {@code String} representing this
   *               {@code Rectangle} object's coordinate and size values.
   */
  toString(): string {
    return $J.getClass(this).getName() + '[x=' + this.x_ + ',y=' + this.y_ + ',width=' + this.width_ + ',height=' + this.height_ + ']';
  }
  static $clinit() {
    Toolkit.loadLibraries();
    if (!GraphicsEnvironment.isHeadless()) {
      Rectangle.initIDs();
    }
  }
}

$J.define(Rectangle, 'java.awt.Rectangle', { kind: 'class', ifaces: ['java.awt.Shape', 'java.io.Serializable'], sup: 'java.awt.geom.Rectangle2D', ctors: { 'java.awt.Dimension': '_Rectangle$Dimension', 'java.awt.Point': '_Rectangle$Point', 'java.awt.Point,java.awt.Dimension': '_Rectangle$Point$Dimension', 'int,int': '_Rectangle$int$int', 'int,int,int,int': '_Rectangle$int$int$int$int', 'java.awt.Rectangle': '_Rectangle$Rectangle', '': '_Rectangle$' }, meths: { 'outcode(double,double)': 'outcode$double$double', 'add(java.awt.Rectangle)': 'add$Rectangle', 'add(java.awt.Point)': 'add$Point', 'add(int,int)': 'add$int$int', 'intersects(java.awt.Rectangle)': 'intersects$Rectangle', 'contains(int,int,int,int)': 'contains$int$int$int$int', 'contains(java.awt.Rectangle)': 'contains$Rectangle', 'contains(int,int)': 'contains$int$int', 'contains(java.awt.Point)': 'contains$Point', 'setSize(int,int)': 'setSize$int$int', 'setSize(java.awt.Dimension)': 'setSize$Dimension', 'setLocation(int,int)': 'setLocation$int$int', 'setLocation(java.awt.Point)': 'setLocation$Point', 'setRect(double,double,double,double)': 'setRect$double$double$double$double', 'setBounds(int,int,int,int)': 'setBounds$int$int$int$int', 'setBounds(java.awt.Rectangle)': 'setBounds$Rectangle' }, clinit: true, lazy: [] });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  Point = $J.load('java.awt.Point');
});
