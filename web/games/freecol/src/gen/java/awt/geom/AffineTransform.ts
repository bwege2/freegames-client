// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/geom/AffineTransform.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1996, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, CloneNotSupportedException, InternalError, JObject } from '../../../../jre/index.ts';

let NoninvertibleTransformException, Path2D$Double, Point2D$Double, Point2D$Float;

/**
 * The {@code AffineTransform} class represents a 2D affine transform
 * that performs a linear mapping from 2D coordinates to other 2D
 * coordinates that preserves the "straightness" and
 * "parallelness" of lines.  Affine transformations can be constructed
 * using sequences of translations, scales, flips, rotations, and shears.
 * <p>
 * Such a coordinate transformation can be represented by a 3 row by
 * 3 column matrix with an implied last row of [ 0 0 1 ].  This matrix
 * transforms source coordinates {@code (x,y)} into
 * destination coordinates {@code (x',y')} by considering
 * them to be a column vector and multiplying the coordinate vector
 * by the matrix according to the following process:
 * <pre>
 *      [ x']   [  m00  m01  m02  ] [ x ]   [ m00x + m01y + m02 ]
 *      [ y'] = [  m10  m11  m12  ] [ y ] = [ m10x + m11y + m12 ]
 *      [ 1 ]   [   0    0    1   ] [ 1 ]   [         1         ]
 * </pre>
 * <h2><a id="quadrantapproximation">Handling 90-Degree Rotations</a></h2>
 * <p>
 * In some variations of the {@code rotate} methods in the
 * {@code AffineTransform} class, a double-precision argument
 * specifies the angle of rotation in radians.
 * These methods have special handling for rotations of approximately
 * 90 degrees (including multiples such as 180, 270, and 360 degrees),
 * so that the common case of quadrant rotation is handled more
 * efficiently.
 * This special handling can cause angles very close to multiples of
 * 90 degrees to be treated as if they were exact multiples of
 * 90 degrees.
 * For small multiples of 90 degrees the range of angles treated
 * as a quadrant rotation is approximately 0.00000121 degrees wide.
 * This section explains why such special care is needed and how
 * it is implemented.
 * <p>
 * Since 90 degrees is represented as {@code PI/2} in radians,
 * and since PI is a transcendental (and therefore irrational) number,
 * it is not possible to exactly represent a multiple of 90 degrees as
 * an exact double precision value measured in radians.
 * As a result it is theoretically impossible to describe quadrant
 * rotations (90, 180, 270 or 360 degrees) using these values.
 * Double precision floating point values can get very close to
 * non-zero multiples of {@code PI/2} but never close enough
 * for the sine or cosine to be exactly 0.0, 1.0 or -1.0.
 * The implementations of {@code Math.sin()} and
 * {@code Math.cos()} correspondingly never return 0.0
 * for any case other than {@code Math.sin(0.0)}.
 * These same implementations do, however, return exactly 1.0 and
 * -1.0 for some range of numbers around each multiple of 90
 * degrees since the correct answer is so close to 1.0 or -1.0 that
 * the double precision significand cannot represent the difference
 * as accurately as it can for numbers that are near 0.0.
 * <p>
 * The net result of these issues is that if the
 * {@code Math.sin()} and {@code Math.cos()} methods
 * are used to directly generate the values for the matrix modifications
 * during these radian-based rotation operations then the resulting
 * transform is never strictly classifiable as a quadrant rotation
 * even for a simple case like {@code rotate(Math.PI/2.0)},
 * due to minor variations in the matrix caused by the non-0.0 values
 * obtained for the sine and cosine.
 * If these transforms are not classified as quadrant rotations then
 * subsequent code which attempts to optimize further operations based
 * upon the type of the transform will be relegated to its most general
 * implementation.
 * <p>
 * Because quadrant rotations are fairly common,
 * this class should handle these cases reasonably quickly, both in
 * applying the rotations to the transform and in applying the resulting
 * transform to the coordinates.
 * To facilitate this optimal handling, the methods which take an angle
 * of rotation measured in radians attempt to detect angles that are
 * intended to be quadrant rotations and treat them as such.
 * These methods therefore treat an angle <em>theta</em> as a quadrant
 * rotation if either <code>Math.sin(<em>theta</em>)</code> or
 * <code>Math.cos(<em>theta</em>)</code> returns exactly 1.0 or -1.0.
 * As a rule of thumb, this property holds true for a range of
 * approximately 0.0000000211 radians (or 0.00000121 degrees) around
 * small multiples of {@code Math.PI/2.0}.
 *
 * @author Jim Graham
 * @since 1.2
 */
export class AffineTransform extends JObject {
  static readonly TYPE_UNKNOWN: number = -1;
  /**
   * This constant indicates that the transform defined by this object
   * is an identity transform.
   * An identity transform is one in which the output coordinates are
   * always the same as the input coordinates.
   * If this transform is anything other than the identity transform,
   * the type will either be the constant GENERAL_TRANSFORM or a
   * combination of the appropriate flag bits for the various coordinate
   * conversions that this transform performs.
   * @see #TYPE_TRANSLATION
   * @see #TYPE_UNIFORM_SCALE
   * @see #TYPE_GENERAL_SCALE
   * @see #TYPE_FLIP
   * @see #TYPE_QUADRANT_ROTATION
   * @see #TYPE_GENERAL_ROTATION
   * @see #TYPE_GENERAL_TRANSFORM
   * @see #getType
   * @since 1.2
   */
  static readonly TYPE_IDENTITY: number = 0;
  /**
   * This flag bit indicates that the transform defined by this object
   * performs a translation in addition to the conversions indicated
   * by other flag bits.
   * A translation moves the coordinates by a constant amount in x
   * and y without changing the length or angle of vectors.
   * @see #TYPE_IDENTITY
   * @see #TYPE_UNIFORM_SCALE
   * @see #TYPE_GENERAL_SCALE
   * @see #TYPE_FLIP
   * @see #TYPE_QUADRANT_ROTATION
   * @see #TYPE_GENERAL_ROTATION
   * @see #TYPE_GENERAL_TRANSFORM
   * @see #getType
   * @since 1.2
   */
  static readonly TYPE_TRANSLATION: number = 1;
  /**
   * This flag bit indicates that the transform defined by this object
   * performs a uniform scale in addition to the conversions indicated
   * by other flag bits.
   * A uniform scale multiplies the length of vectors by the same amount
   * in both the x and y directions without changing the angle between
   * vectors.
   * This flag bit is mutually exclusive with the TYPE_GENERAL_SCALE flag.
   * @see #TYPE_IDENTITY
   * @see #TYPE_TRANSLATION
   * @see #TYPE_GENERAL_SCALE
   * @see #TYPE_FLIP
   * @see #TYPE_QUADRANT_ROTATION
   * @see #TYPE_GENERAL_ROTATION
   * @see #TYPE_GENERAL_TRANSFORM
   * @see #getType
   * @since 1.2
   */
  static readonly TYPE_UNIFORM_SCALE: number = 2;
  /**
   * This flag bit indicates that the transform defined by this object
   * performs a general scale in addition to the conversions indicated
   * by other flag bits.
   * A general scale multiplies the length of vectors by different
   * amounts in the x and y directions without changing the angle
   * between perpendicular vectors.
   * This flag bit is mutually exclusive with the TYPE_UNIFORM_SCALE flag.
   * @see #TYPE_IDENTITY
   * @see #TYPE_TRANSLATION
   * @see #TYPE_UNIFORM_SCALE
   * @see #TYPE_FLIP
   * @see #TYPE_QUADRANT_ROTATION
   * @see #TYPE_GENERAL_ROTATION
   * @see #TYPE_GENERAL_TRANSFORM
   * @see #getType
   * @since 1.2
   */
  static readonly TYPE_GENERAL_SCALE: number = 4;
  /**
   * This constant is a bit mask for any of the scale flag bits.
   * @see #TYPE_UNIFORM_SCALE
   * @see #TYPE_GENERAL_SCALE
   * @since 1.2
   */
  static readonly TYPE_MASK_SCALE: number = 6;
  /**
   * This flag bit indicates that the transform defined by this object
   * performs a mirror image flip about some axis which changes the
   * normally right handed coordinate system into a left handed
   * system in addition to the conversions indicated by other flag bits.
   * A right handed coordinate system is one where the positive X
   * axis rotates counterclockwise to overlay the positive Y axis
   * similar to the direction that the fingers on your right hand
   * curl when you stare end on at your thumb.
   * A left handed coordinate system is one where the positive X
   * axis rotates clockwise to overlay the positive Y axis similar
   * to the direction that the fingers on your left hand curl.
   * There is no mathematical way to determine the angle of the
   * original flipping or mirroring transformation since all angles
   * of flip are identical given an appropriate adjusting rotation.
   * @see #TYPE_IDENTITY
   * @see #TYPE_TRANSLATION
   * @see #TYPE_UNIFORM_SCALE
   * @see #TYPE_GENERAL_SCALE
   * @see #TYPE_QUADRANT_ROTATION
   * @see #TYPE_GENERAL_ROTATION
   * @see #TYPE_GENERAL_TRANSFORM
   * @see #getType
   * @since 1.2
   */
  static readonly TYPE_FLIP: number = 64;
  /**
   * This flag bit indicates that the transform defined by this object
   * performs a quadrant rotation by some multiple of 90 degrees in
   * addition to the conversions indicated by other flag bits.
   * A rotation changes the angles of vectors by the same amount
   * regardless of the original direction of the vector and without
   * changing the length of the vector.
   * This flag bit is mutually exclusive with the TYPE_GENERAL_ROTATION flag.
   * @see #TYPE_IDENTITY
   * @see #TYPE_TRANSLATION
   * @see #TYPE_UNIFORM_SCALE
   * @see #TYPE_GENERAL_SCALE
   * @see #TYPE_FLIP
   * @see #TYPE_GENERAL_ROTATION
   * @see #TYPE_GENERAL_TRANSFORM
   * @see #getType
   * @since 1.2
   */
  static readonly TYPE_QUADRANT_ROTATION: number = 8;
  /**
   * This flag bit indicates that the transform defined by this object
   * performs a rotation by an arbitrary angle in addition to the
   * conversions indicated by other flag bits.
   * A rotation changes the angles of vectors by the same amount
   * regardless of the original direction of the vector and without
   * changing the length of the vector.
   * This flag bit is mutually exclusive with the
   * TYPE_QUADRANT_ROTATION flag.
   * @see #TYPE_IDENTITY
   * @see #TYPE_TRANSLATION
   * @see #TYPE_UNIFORM_SCALE
   * @see #TYPE_GENERAL_SCALE
   * @see #TYPE_FLIP
   * @see #TYPE_QUADRANT_ROTATION
   * @see #TYPE_GENERAL_TRANSFORM
   * @see #getType
   * @since 1.2
   */
  static readonly TYPE_GENERAL_ROTATION: number = 16;
  /**
   * This constant is a bit mask for any of the rotation flag bits.
   * @see #TYPE_QUADRANT_ROTATION
   * @see #TYPE_GENERAL_ROTATION
   * @since 1.2
   */
  static readonly TYPE_MASK_ROTATION: number = 24;
  /**
   * This constant indicates that the transform defined by this object
   * performs an arbitrary conversion of the input coordinates.
   * If this transform can be classified by any of the above constants,
   * the type will either be the constant TYPE_IDENTITY or a
   * combination of the appropriate flag bits for the various coordinate
   * conversions that this transform performs.
   * @see #TYPE_IDENTITY
   * @see #TYPE_TRANSLATION
   * @see #TYPE_UNIFORM_SCALE
   * @see #TYPE_GENERAL_SCALE
   * @see #TYPE_FLIP
   * @see #TYPE_QUADRANT_ROTATION
   * @see #TYPE_GENERAL_ROTATION
   * @see #getType
   * @since 1.2
   */
  static readonly TYPE_GENERAL_TRANSFORM: number = 32;
  /**
   * This constant is used for the internal state variable to indicate
   * that no calculations need to be performed and that the source
   * coordinates only need to be copied to their destinations to
   * complete the transformation equation of this transform.
   * @see #APPLY_TRANSLATE
   * @see #APPLY_SCALE
   * @see #APPLY_SHEAR
   * @see #state
   */
  static readonly APPLY_IDENTITY: number = 0;
  /**
   * This constant is used for the internal state variable to indicate
   * that the translation components of the matrix (m02 and m12) need
   * to be added to complete the transformation equation of this transform.
   * @see #APPLY_IDENTITY
   * @see #APPLY_SCALE
   * @see #APPLY_SHEAR
   * @see #state
   */
  static readonly APPLY_TRANSLATE: number = 1;
  /**
   * This constant is used for the internal state variable to indicate
   * that the scaling components of the matrix (m00 and m11) need
   * to be factored in to complete the transformation equation of
   * this transform.  If the APPLY_SHEAR bit is also set then it
   * indicates that the scaling components are not both 0.0.  If the
   * APPLY_SHEAR bit is not also set then it indicates that the
   * scaling components are not both 1.0.  If neither the APPLY_SHEAR
   * nor the APPLY_SCALE bits are set then the scaling components
   * are both 1.0, which means that the x and y components contribute
   * to the transformed coordinate, but they are not multiplied by
   * any scaling factor.
   * @see #APPLY_IDENTITY
   * @see #APPLY_TRANSLATE
   * @see #APPLY_SHEAR
   * @see #state
   */
  static readonly APPLY_SCALE: number = 2;
  /**
   * This constant is used for the internal state variable to indicate
   * that the shearing components of the matrix (m01 and m10) need
   * to be factored in to complete the transformation equation of this
   * transform.  The presence of this bit in the state variable changes
   * the interpretation of the APPLY_SCALE bit as indicated in its
   * documentation.
   * @see #APPLY_IDENTITY
   * @see #APPLY_TRANSLATE
   * @see #APPLY_SCALE
   * @see #state
   */
  static readonly APPLY_SHEAR: number = 4;
  static readonly HI_SHIFT: number = 3;
  static readonly HI_IDENTITY: number = 0;
  static readonly HI_TRANSLATE: number = 8;
  static readonly HI_SCALE: number = 16;
  static readonly HI_SHEAR: number = 32;
  /**
   * The X coordinate scaling element of the 3x3
   * affine transformation matrix.
   *
   * @serial
   */
  m00: number = 0;
  /**
   * The Y coordinate shearing element of the 3x3
   * affine transformation matrix.
   *
   * @serial
   */
  m10: number = 0;
  /**
   * The X coordinate shearing element of the 3x3
   * affine transformation matrix.
   *
   * @serial
   */
  m01: number = 0;
  /**
   * The Y coordinate scaling element of the 3x3
   * affine transformation matrix.
   *
   * @serial
   */
  m11: number = 0;
  /**
   * The X coordinate of the translation element of the
   * 3x3 affine transformation matrix.
   *
   * @serial
   */
  m02: number = 0;
  /**
   * The Y coordinate of the translation element of the
   * 3x3 affine transformation matrix.
   *
   * @serial
   */
  m12: number = 0;
  /**
   * This field keeps track of which components of the matrix need to
   * be applied when performing a transformation.
   * @see #APPLY_IDENTITY
   * @see #APPLY_TRANSLATE
   * @see #APPLY_SCALE
   * @see #APPLY_SHEAR
   */
  state: number = 0;
  /**
   * This field caches the current transformation type of the matrix.
   * @see #TYPE_IDENTITY
   * @see #TYPE_TRANSLATION
   * @see #TYPE_UNIFORM_SCALE
   * @see #TYPE_GENERAL_SCALE
   * @see #TYPE_FLIP
   * @see #TYPE_QUADRANT_ROTATION
   * @see #TYPE_GENERAL_ROTATION
   * @see #TYPE_GENERAL_TRANSFORM
   * @see #TYPE_UNKNOWN
   * @see #getType
   */
  type: number = 0;
  static rot90conversion: number[] = null;
  _AffineTransform$double$double$double$double$double$double$int(m00: number, m10: number, m01: number, m11: number, m02: number, m12: number, state: number): this {
    this.m00 = m00;
    this.m10 = m10;
    this.m01 = m01;
    this.m11 = m11;
    this.m02 = m02;
    this.m12 = m12;
    this.state = state;
    this.type = AffineTransform.TYPE_UNKNOWN;
    return this;
  }
  /**
   * Constructs a new {@code AffineTransform} representing the
   * Identity transformation.
   * @since 1.2
   */
  _AffineTransform$(): this {
    this.m00 = this.m11 = 1;
    return this;
  }
  /**
   * Constructs a new {@code AffineTransform} that is a copy of
   * the specified {@code AffineTransform} object.
   * @param Tx the {@code AffineTransform} object to copy
   * @since 1.2
   */
  _AffineTransform$AffineTransform(Tx: AffineTransform): this {
    this.m00 = Tx.m00;
    this.m10 = Tx.m10;
    this.m01 = Tx.m01;
    this.m11 = Tx.m11;
    this.m02 = Tx.m02;
    this.m12 = Tx.m12;
    this.state = Tx.state;
    this.type = Tx.type;
    return this;
  }
  /**
   * Constructs a new {@code AffineTransform} from 6 floating point
   * values representing the 6 specifiable entries of the 3x3
   * transformation matrix.
   *
   * @param m00 the X coordinate scaling element of the 3x3 matrix
   * @param m10 the Y coordinate shearing element of the 3x3 matrix
   * @param m01 the X coordinate shearing element of the 3x3 matrix
   * @param m11 the Y coordinate scaling element of the 3x3 matrix
   * @param m02 the X coordinate translation element of the 3x3 matrix
   * @param m12 the Y coordinate translation element of the 3x3 matrix
   * @since 1.2
   */
  _AffineTransform$float$float$float$float$float$float(m00: number, m10: number, m01: number, m11: number, m02: number, m12: number): this {
    this.m00 = m00;
    this.m10 = m10;
    this.m01 = m01;
    this.m11 = m11;
    this.m02 = m02;
    this.m12 = m12;
    this.updateState();
    return this;
  }
  /**
   * Constructs a new {@code AffineTransform} from an array of
   * floating point values representing either the 4 non-translation
   * entries or the 6 specifiable entries of the 3x3 transformation
   * matrix.  The values are retrieved from the array as
   * {&nbsp;m00&nbsp;m10&nbsp;m01&nbsp;m11&nbsp;[m02&nbsp;m12]}.
   * @param flatmatrix the float array containing the values to be set
   * in the new {@code AffineTransform} object. The length of the
   * array is assumed to be at least 4. If the length of the array is
   * less than 6, only the first 4 values are taken. If the length of
   * the array is greater than 6, the first 6 values are taken.
   * @since 1.2
   */
  _AffineTransform$floatArr(flatmatrix: number[]): this {
    this.m00 = flatmatrix[0];
    this.m10 = flatmatrix[1];
    this.m01 = flatmatrix[2];
    this.m11 = flatmatrix[3];
    if (flatmatrix.length > 5) {
      this.m02 = flatmatrix[4];
      this.m12 = flatmatrix[5];
    }
    this.updateState();
    return this;
  }
  /**
   * Constructs a new {@code AffineTransform} from 6 double
   * precision values representing the 6 specifiable entries of the 3x3
   * transformation matrix.
   *
   * @param m00 the X coordinate scaling element of the 3x3 matrix
   * @param m10 the Y coordinate shearing element of the 3x3 matrix
   * @param m01 the X coordinate shearing element of the 3x3 matrix
   * @param m11 the Y coordinate scaling element of the 3x3 matrix
   * @param m02 the X coordinate translation element of the 3x3 matrix
   * @param m12 the Y coordinate translation element of the 3x3 matrix
   * @since 1.2
   */
  _AffineTransform$double$double$double$double$double$double(m00: number, m10: number, m01: number, m11: number, m02: number, m12: number): this {
    this.m00 = m00;
    this.m10 = m10;
    this.m01 = m01;
    this.m11 = m11;
    this.m02 = m02;
    this.m12 = m12;
    this.updateState();
    return this;
  }
  /**
   * Constructs a new {@code AffineTransform} from an array of
   * double precision values representing either the 4 non-translation
   * entries or the 6 specifiable entries of the 3x3 transformation
   * matrix. The values are retrieved from the array as
   * {&nbsp;m00&nbsp;m10&nbsp;m01&nbsp;m11&nbsp;[m02&nbsp;m12]}.
   * @param flatmatrix the double array containing the values to be set
   * in the new {@code AffineTransform} object. The length of the
   * array is assumed to be at least 4. If the length of the array is
   * less than 6, only the first 4 values are taken. If the length of
   * the array is greater than 6, the first 6 values are taken.
   * @since 1.2
   */
  _AffineTransform$doubleArr(flatmatrix: number[]): this {
    this.m00 = flatmatrix[0];
    this.m10 = flatmatrix[1];
    this.m01 = flatmatrix[2];
    this.m11 = flatmatrix[3];
    if (flatmatrix.length > 5) {
      this.m02 = flatmatrix[4];
      this.m12 = flatmatrix[5];
    }
    this.updateState();
    return this;
  }
  /**
   * Returns a transform representing a translation transformation.
   * The matrix representing the returned transform is:
   * <pre>
   *          [   1    0    tx  ]
   *          [   0    1    ty  ]
   *          [   0    0    1   ]
   * </pre>
   * @param tx the distance by which coordinates are translated in the
   * X axis direction
   * @param ty the distance by which coordinates are translated in the
   * Y axis direction
   * @return an {@code AffineTransform} object that represents a
   *  translation transformation, created with the specified vector.
   * @since 1.2
   */
  static getTranslateInstance(tx: number, ty: number): AffineTransform {
    let Tx = new AffineTransform()._AffineTransform$();
    Tx.setToTranslation(tx, ty);
    return Tx;
  }
  /**
   * Returns a transform representing a rotation transformation.
   * The matrix representing the returned transform is:
   * <pre>
   *          [   cos(theta)    -sin(theta)    0   ]
   *          [   sin(theta)     cos(theta)    0   ]
   *          [       0              0         1   ]
   * </pre>
   * Rotating by a positive angle theta rotates points on the positive
   * X axis toward the positive Y axis.
   * Note also the discussion of
   * <a href="#quadrantapproximation">Handling 90-Degree Rotations</a>
   * above.
   * @param theta the angle of rotation measured in radians
   * @return an {@code AffineTransform} object that is a rotation
   *  transformation, created with the specified angle of rotation.
   * @since 1.2
   */
  static getRotateInstance$double(theta: number): AffineTransform {
    let Tx = new AffineTransform()._AffineTransform$();
    Tx.setToRotation$double(theta);
    return Tx;
  }
  /**
   * Returns a transform that rotates coordinates around an anchor point.
   * This operation is equivalent to translating the coordinates so
   * that the anchor point is at the origin (S1), then rotating them
   * about the new origin (S2), and finally translating so that the
   * intermediate origin is restored to the coordinates of the original
   * anchor point (S3).
   * <p>
   * This operation is equivalent to the following sequence of calls:
   * <pre>
   *     AffineTransform Tx = new AffineTransform();
   *     Tx.translate(anchorx, anchory);    // S3: final translation
   *     Tx.rotate(theta);                  // S2: rotate around anchor
   *     Tx.translate(-anchorx, -anchory);  // S1: translate anchor to origin
   * </pre>
   * The matrix representing the returned transform is:
   * <pre>
   *          [   cos(theta)    -sin(theta)    x-x*cos+y*sin  ]
   *          [   sin(theta)     cos(theta)    y-x*sin-y*cos  ]
   *          [       0              0               1        ]
   * </pre>
   * Rotating by a positive angle theta rotates points on the positive
   * X axis toward the positive Y axis.
   * Note also the discussion of
   * <a href="#quadrantapproximation">Handling 90-Degree Rotations</a>
   * above.
   *
   * @param theta the angle of rotation measured in radians
   * @param anchorx the X coordinate of the rotation anchor point
   * @param anchory the Y coordinate of the rotation anchor point
   * @return an {@code AffineTransform} object that rotates
   *  coordinates around the specified point by the specified angle of
   *  rotation.
   * @since 1.2
   */
  static getRotateInstance$double$double$double(theta: number, anchorx: number, anchory: number): AffineTransform {
    let Tx = new AffineTransform()._AffineTransform$();
    Tx.setToRotation$double$double$double(theta, anchorx, anchory);
    return Tx;
  }
  /**
   * Returns a transform that rotates coordinates according to
   * a rotation vector.
   * All coordinates rotate about the origin by the same amount.
   * The amount of rotation is such that coordinates along the former
   * positive X axis will subsequently align with the vector pointing
   * from the origin to the specified vector coordinates.
   * If both {@code vecx} and {@code vecy} are 0.0,
   * an identity transform is returned.
   * This operation is equivalent to calling:
   * <pre>
   *     AffineTransform.getRotateInstance(Math.atan2(vecy, vecx));
   * </pre>
   *
   * @param vecx the X coordinate of the rotation vector
   * @param vecy the Y coordinate of the rotation vector
   * @return an {@code AffineTransform} object that rotates
   *  coordinates according to the specified rotation vector.
   * @since 1.6
   */
  static getRotateInstance$double$double(vecx: number, vecy: number): AffineTransform {
    let Tx = new AffineTransform()._AffineTransform$();
    Tx.setToRotation$double$double(vecx, vecy);
    return Tx;
  }
  /**
   * Returns a transform that rotates coordinates around an anchor
   * point according to a rotation vector.
   * All coordinates rotate about the specified anchor coordinates
   * by the same amount.
   * The amount of rotation is such that coordinates along the former
   * positive X axis will subsequently align with the vector pointing
   * from the origin to the specified vector coordinates.
   * If both {@code vecx} and {@code vecy} are 0.0,
   * an identity transform is returned.
   * This operation is equivalent to calling:
   * <pre>
   *     AffineTransform.getRotateInstance(Math.atan2(vecy, vecx),
   *                                       anchorx, anchory);
   * </pre>
   *
   * @param vecx the X coordinate of the rotation vector
   * @param vecy the Y coordinate of the rotation vector
   * @param anchorx the X coordinate of the rotation anchor point
   * @param anchory the Y coordinate of the rotation anchor point
   * @return an {@code AffineTransform} object that rotates
   *  coordinates around the specified point according to the
   *  specified rotation vector.
   * @since 1.6
   */
  static getRotateInstance$double$double$double$double(vecx: number, vecy: number, anchorx: number, anchory: number): AffineTransform {
    let Tx = new AffineTransform()._AffineTransform$();
    Tx.setToRotation$double$double$double$double(vecx, vecy, anchorx, anchory);
    return Tx;
  }
  /**
   * Returns a transform that rotates coordinates by the specified
   * number of quadrants.
   * This operation is equivalent to calling:
   * <pre>
   *     AffineTransform.getRotateInstance(numquadrants * Math.PI / 2.0);
   * </pre>
   * Rotating by a positive number of quadrants rotates points on
   * the positive X axis toward the positive Y axis.
   * @param numquadrants the number of 90 degree arcs to rotate by
   * @return an {@code AffineTransform} object that rotates
   *  coordinates by the specified number of quadrants.
   * @since 1.6
   */
  static getQuadrantRotateInstance$int(numquadrants: number): AffineTransform {
    let Tx = new AffineTransform()._AffineTransform$();
    Tx.setToQuadrantRotation$int(numquadrants);
    return Tx;
  }
  /**
   * Returns a transform that rotates coordinates by the specified
   * number of quadrants around the specified anchor point.
   * This operation is equivalent to calling:
   * <pre>
   *     AffineTransform.getRotateInstance(numquadrants * Math.PI / 2.0,
   *                                       anchorx, anchory);
   * </pre>
   * Rotating by a positive number of quadrants rotates points on
   * the positive X axis toward the positive Y axis.
   *
   * @param numquadrants the number of 90 degree arcs to rotate by
   * @param anchorx the X coordinate of the rotation anchor point
   * @param anchory the Y coordinate of the rotation anchor point
   * @return an {@code AffineTransform} object that rotates
   *  coordinates by the specified number of quadrants around the
   *  specified anchor point.
   * @since 1.6
   */
  static getQuadrantRotateInstance$int$double$double(numquadrants: number, anchorx: number, anchory: number): AffineTransform {
    let Tx = new AffineTransform()._AffineTransform$();
    Tx.setToQuadrantRotation$int$double$double(numquadrants, anchorx, anchory);
    return Tx;
  }
  /**
   * Returns a transform representing a scaling transformation.
   * The matrix representing the returned transform is:
   * <pre>
   *          [   sx   0    0   ]
   *          [   0    sy   0   ]
   *          [   0    0    1   ]
   * </pre>
   * @param sx the factor by which coordinates are scaled along the
   * X axis direction
   * @param sy the factor by which coordinates are scaled along the
   * Y axis direction
   * @return an {@code AffineTransform} object that scales
   *  coordinates by the specified factors.
   * @since 1.2
   */
  static getScaleInstance(sx: number, sy: number): AffineTransform {
    let Tx = new AffineTransform()._AffineTransform$();
    Tx.setToScale(sx, sy);
    return Tx;
  }
  /**
   * Returns a transform representing a shearing transformation.
   * The matrix representing the returned transform is:
   * <pre>
   *          [   1   shx   0   ]
   *          [  shy   1    0   ]
   *          [   0    0    1   ]
   * </pre>
   * @param shx the multiplier by which coordinates are shifted in the
   * direction of the positive X axis as a factor of their Y coordinate
   * @param shy the multiplier by which coordinates are shifted in the
   * direction of the positive Y axis as a factor of their X coordinate
   * @return an {@code AffineTransform} object that shears
   *  coordinates by the specified multipliers.
   * @since 1.2
   */
  static getShearInstance(shx: number, shy: number): AffineTransform {
    let Tx = new AffineTransform()._AffineTransform$();
    Tx.setToShear(shx, shy);
    return Tx;
  }
  /**
   * Retrieves the flag bits describing the conversion properties of
   * this transform.
   * The return value is either one of the constants TYPE_IDENTITY
   * or TYPE_GENERAL_TRANSFORM, or a combination of the
   * appropriate flag bits.
   * A valid combination of flag bits is an exclusive OR operation
   * that can combine
   * the TYPE_TRANSLATION flag bit
   * in addition to either of the
   * TYPE_UNIFORM_SCALE or TYPE_GENERAL_SCALE flag bits
   * as well as either of the
   * TYPE_QUADRANT_ROTATION or TYPE_GENERAL_ROTATION flag bits.
   * @return the OR combination of any of the indicated flags that
   * apply to this transform
   * @see #TYPE_IDENTITY
   * @see #TYPE_TRANSLATION
   * @see #TYPE_UNIFORM_SCALE
   * @see #TYPE_GENERAL_SCALE
   * @see #TYPE_QUADRANT_ROTATION
   * @see #TYPE_GENERAL_ROTATION
   * @see #TYPE_GENERAL_TRANSFORM
   * @since 1.2
   */
  getType(): number {
    if (this.type === AffineTransform.TYPE_UNKNOWN) {
      this.calculateType();
    }
    return this.type;
  }
  /**
   * This is the utility function to calculate the flag bits when
   * they have not been cached.
   * @see #getType
   */
  calculateType(): void {
    let ret = AffineTransform.TYPE_IDENTITY;
    let sgn0: boolean;
    let sgn1: boolean;
    let M0: number;
    let M1: number;
    let M2: number;
    let M3: number;
    this.updateState();
    switch (this.state) {
      default:
        this.stateError();
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        ret = AffineTransform.TYPE_TRANSLATION;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
        if ((M0 = this.m00) * (M2 = this.m01) + (M3 = this.m10) * (M1 = this.m11) !== 0) {
          this.type = AffineTransform.TYPE_GENERAL_TRANSFORM;
          return;
        }
        sgn0 = (M0 >= 0);
        sgn1 = (M1 >= 0);
        if (sgn0 === sgn1) {
          if (M0 !== M1 || M2 !== -M3) {
            ret |= (AffineTransform.TYPE_GENERAL_ROTATION | AffineTransform.TYPE_GENERAL_SCALE);
          } else if (M0 * M1 - M2 * M3 !== 1) {
            ret |= (AffineTransform.TYPE_GENERAL_ROTATION | AffineTransform.TYPE_UNIFORM_SCALE);
          } else {
            ret |= AffineTransform.TYPE_GENERAL_ROTATION;
          }
        } else {
          if (M0 !== -M1 || M2 !== M3) {
            ret |= (AffineTransform.TYPE_GENERAL_ROTATION | AffineTransform.TYPE_FLIP | AffineTransform.TYPE_GENERAL_SCALE);
          } else if (M0 * M1 - M2 * M3 !== 1) {
            ret |= (AffineTransform.TYPE_GENERAL_ROTATION | AffineTransform.TYPE_FLIP | AffineTransform.TYPE_UNIFORM_SCALE);
          } else {
            ret |= (AffineTransform.TYPE_GENERAL_ROTATION | AffineTransform.TYPE_FLIP);
          }
        }
        break;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
        ret = AffineTransform.TYPE_TRANSLATION;
      case (AffineTransform.APPLY_SHEAR):
        sgn0 = ((M0 = this.m01) >= 0);
        sgn1 = ((M1 = this.m10) >= 0);
        if (sgn0 !== sgn1) {
          if (M0 !== -M1) {
            ret |= (AffineTransform.TYPE_QUADRANT_ROTATION | AffineTransform.TYPE_GENERAL_SCALE);
          } else if (M0 !== 1 && M0 !== -1) {
            ret |= (AffineTransform.TYPE_QUADRANT_ROTATION | AffineTransform.TYPE_UNIFORM_SCALE);
          } else {
            ret |= AffineTransform.TYPE_QUADRANT_ROTATION;
          }
        } else {
          if (M0 === M1) {
            ret |= (AffineTransform.TYPE_QUADRANT_ROTATION | AffineTransform.TYPE_FLIP | AffineTransform.TYPE_UNIFORM_SCALE);
          } else {
            ret |= (AffineTransform.TYPE_QUADRANT_ROTATION | AffineTransform.TYPE_FLIP | AffineTransform.TYPE_GENERAL_SCALE);
          }
        }
        break;
      case (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        ret = AffineTransform.TYPE_TRANSLATION;
      case (AffineTransform.APPLY_SCALE):
        sgn0 = ((M0 = this.m00) >= 0);
        sgn1 = ((M1 = this.m11) >= 0);
        if (sgn0 === sgn1) {
          if (sgn0) {
            if (M0 === M1) {
              ret |= AffineTransform.TYPE_UNIFORM_SCALE;
            } else {
              ret |= AffineTransform.TYPE_GENERAL_SCALE;
            }
          } else {
            if (M0 !== M1) {
              ret |= (AffineTransform.TYPE_QUADRANT_ROTATION | AffineTransform.TYPE_GENERAL_SCALE);
            } else if (M0 !== -1) {
              ret |= (AffineTransform.TYPE_QUADRANT_ROTATION | AffineTransform.TYPE_UNIFORM_SCALE);
            } else {
              ret |= AffineTransform.TYPE_QUADRANT_ROTATION;
            }
          }
        } else {
          if (M0 === -M1) {
            if (M0 === 1 || M0 === -1) {
              ret |= AffineTransform.TYPE_FLIP;
            } else {
              ret |= (AffineTransform.TYPE_FLIP | AffineTransform.TYPE_UNIFORM_SCALE);
            }
          } else {
            ret |= (AffineTransform.TYPE_FLIP | AffineTransform.TYPE_GENERAL_SCALE);
          }
        }
        break;
      case (AffineTransform.APPLY_TRANSLATE):
        ret = AffineTransform.TYPE_TRANSLATION;
        break;
      case (AffineTransform.APPLY_IDENTITY):
        break;
    }
    this.type = ret;
  }
  /**
   * Returns the determinant of the matrix representation of the transform.
   * The determinant is useful both to determine if the transform can
   * be inverted and to get a single value representing the
   * combined X and Y scaling of the transform.
   * <p>
   * If the determinant is non-zero, then this transform is
   * invertible and the various methods that depend on the inverse
   * transform do not need to throw a
   * {@link NoninvertibleTransformException}.
   * If the determinant is zero then this transform can not be
   * inverted since the transform maps all input coordinates onto
   * a line or a point.
   * If the determinant is near enough to zero then inverse transform
   * operations might not carry enough precision to produce meaningful
   * results.
   * <p>
   * If this transform represents a uniform scale, as indicated by
   * the {@code getType} method then the determinant also
   * represents the square of the uniform scale factor by which all of
   * the points are expanded from or contracted towards the origin.
   * If this transform represents a non-uniform scale or more general
   * transform then the determinant is not likely to represent a
   * value useful for any purpose other than determining if inverse
   * transforms are possible.
   * <p>
   * Mathematically, the determinant is calculated using the formula:
   * <pre>
   *          |  m00  m01  m02  |
   *          |  m10  m11  m12  |  =  m00 * m11 - m01 * m10
   *          |   0    0    1   |
   * </pre>
   *
   * @return the determinant of the matrix used to transform the
   * coordinates.
   * @see #getType
   * @see #createInverse
   * @see #inverseTransform
   * @see #TYPE_UNIFORM_SCALE
   * @since 1.2
   */
  getDeterminant(): number {
    switch (this.state) {
      default:
        this.stateError();
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
        return this.m00 * this.m11 - this.m01 * this.m10;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.APPLY_SHEAR):
        return -(this.m01 * this.m10);
      case (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.APPLY_SCALE):
        return this.m00 * this.m11;
      case (AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.APPLY_IDENTITY):
        return 1;
    }
  }
  /**
   * Manually recalculates the state of the transform when the matrix
   * changes too much to predict the effects on the state.
   * The following table specifies what the various settings of the
   * state field say about the values of the corresponding matrix
   * element fields.
   * Note that the rules governing the SCALE fields are slightly
   * different depending on whether the SHEAR flag is also set.
   * <pre>
   *                     SCALE            SHEAR          TRANSLATE
   *                    m00/m11          m01/m10          m02/m12
   *
   * IDENTITY             1.0              0.0              0.0
   * TRANSLATE (TR)       1.0              0.0          not both 0.0
   * SCALE (SC)       not both 1.0         0.0              0.0
   * TR | SC          not both 1.0         0.0          not both 0.0
   * SHEAR (SH)           0.0          not both 0.0         0.0
   * TR | SH              0.0          not both 0.0     not both 0.0
   * SC | SH          not both 0.0     not both 0.0         0.0
   * TR | SC | SH     not both 0.0     not both 0.0     not both 0.0
   * </pre>
   */
  updateState(): void {
    if (this.m01 === 0 && this.m10 === 0) {
      if (this.m00 === 1 && this.m11 === 1) {
        if (this.m02 === 0 && this.m12 === 0) {
          this.state = AffineTransform.APPLY_IDENTITY;
          this.type = AffineTransform.TYPE_IDENTITY;
        } else {
          this.state = AffineTransform.APPLY_TRANSLATE;
          this.type = AffineTransform.TYPE_TRANSLATION;
        }
      } else {
        if (this.m02 === 0 && this.m12 === 0) {
          this.state = AffineTransform.APPLY_SCALE;
          this.type = AffineTransform.TYPE_UNKNOWN;
        } else {
          this.state = (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE);
          this.type = AffineTransform.TYPE_UNKNOWN;
        }
      }
    } else {
      if (this.m00 === 0 && this.m11 === 0) {
        if (this.m02 === 0 && this.m12 === 0) {
          this.state = AffineTransform.APPLY_SHEAR;
          this.type = AffineTransform.TYPE_UNKNOWN;
        } else {
          this.state = (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE);
          this.type = AffineTransform.TYPE_UNKNOWN;
        }
      } else {
        if (this.m02 === 0 && this.m12 === 0) {
          this.state = (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE);
          this.type = AffineTransform.TYPE_UNKNOWN;
        } else {
          this.state = (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE);
          this.type = AffineTransform.TYPE_UNKNOWN;
        }
      }
    }
  }
  stateError(): void {
    throw new InternalError('missing case in transform state switch');
  }
  /**
   * Retrieves the 6 specifiable values in the 3x3 affine transformation
   * matrix and places them into an array of double precisions values.
   * The values are stored in the array as
   * {&nbsp;m00&nbsp;m10&nbsp;m01&nbsp;m11&nbsp;m02&nbsp;m12&nbsp;}.
   * An array of 4 doubles can also be specified, in which case only the
   * first four elements representing the non-transform
   * parts of the array are retrieved and the values are stored into
   * the array as {&nbsp;m00&nbsp;m10&nbsp;m01&nbsp;m11&nbsp;}
   * @param flatmatrix the double array used to store the returned
   * values.
   * @see #getScaleX
   * @see #getScaleY
   * @see #getShearX
   * @see #getShearY
   * @see #getTranslateX
   * @see #getTranslateY
   * @since 1.2
   */
  getMatrix(flatmatrix: number[]): void {
    flatmatrix[0] = this.m00;
    flatmatrix[1] = this.m10;
    flatmatrix[2] = this.m01;
    flatmatrix[3] = this.m11;
    if (flatmatrix.length > 5) {
      flatmatrix[4] = this.m02;
      flatmatrix[5] = this.m12;
    }
  }
  /**
   * Returns the {@code m00} element of the 3x3 affine transformation matrix.
   * This matrix factor determines how input X coordinates will affect output
   * X coordinates and is one element of the scale of the transform.
   * To measure the full amount by which X coordinates are stretched or
   * contracted by this transform, use the following code:
   * <pre>
   *     Point2D p = new Point2D.Double(1, 0);
   *     p = tx.deltaTransform(p, p);
   *     double scaleX = p.distance(0, 0);
   * </pre>
   * @return a double value that is {@code m00} element of the
   *         3x3 affine transformation matrix.
   * @see #getMatrix
   * @since 1.2
   */
  getScaleX(): number {
    return this.m00;
  }
  /**
   * Returns the {@code m11} element of the 3x3 affine transformation matrix.
   * This matrix factor determines how input Y coordinates will affect output
   * Y coordinates and is one element of the scale of the transform.
   * To measure the full amount by which Y coordinates are stretched or
   * contracted by this transform, use the following code:
   * <pre>
   *     Point2D p = new Point2D.Double(0, 1);
   *     p = tx.deltaTransform(p, p);
   *     double scaleY = p.distance(0, 0);
   * </pre>
   * @return a double value that is {@code m11} element of the
   *         3x3 affine transformation matrix.
   * @see #getMatrix
   * @since 1.2
   */
  getScaleY(): number {
    return this.m11;
  }
  /**
   * Returns the X coordinate shearing element (m01) of the 3x3
   * affine transformation matrix.
   * @return a double value that is the X coordinate of the shearing
   *  element of the affine transformation matrix.
   * @see #getMatrix
   * @since 1.2
   */
  getShearX(): number {
    return this.m01;
  }
  /**
   * Returns the Y coordinate shearing element (m10) of the 3x3
   * affine transformation matrix.
   * @return a double value that is the Y coordinate of the shearing
   *  element of the affine transformation matrix.
   * @see #getMatrix
   * @since 1.2
   */
  getShearY(): number {
    return this.m10;
  }
  /**
   * Returns the X coordinate of the translation element (m02) of the
   * 3x3 affine transformation matrix.
   * @return a double value that is the X coordinate of the translation
   *  element of the affine transformation matrix.
   * @see #getMatrix
   * @since 1.2
   */
  getTranslateX(): number {
    return this.m02;
  }
  /**
   * Returns the Y coordinate of the translation element (m12) of the
   * 3x3 affine transformation matrix.
   * @return a double value that is the Y coordinate of the translation
   *  element of the affine transformation matrix.
   * @see #getMatrix
   * @since 1.2
   */
  getTranslateY(): number {
    return this.m12;
  }
  /**
   * Concatenates this transform with a translation transformation.
   * This is equivalent to calling concatenate(T), where T is an
   * {@code AffineTransform} represented by the following matrix:
   * <pre>
   *          [   1    0    tx  ]
   *          [   0    1    ty  ]
   *          [   0    0    1   ]
   * </pre>
   * @param tx the distance by which coordinates are translated in the
   * X axis direction
   * @param ty the distance by which coordinates are translated in the
   * Y axis direction
   * @since 1.2
   */
  translate(tx: number, ty: number): void {
    switch (this.state) {
      default:
        this.stateError();
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        this.m02 = tx * this.m00 + ty * this.m01 + this.m02;
        this.m12 = tx * this.m10 + ty * this.m11 + this.m12;
        if (this.m02 === 0 && this.m12 === 0) {
          this.state = AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE;
          if (this.type !== AffineTransform.TYPE_UNKNOWN) {
            this.type = (this.type - AffineTransform.TYPE_TRANSLATION) | 0;
          }
        }
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
        this.m02 = tx * this.m00 + ty * this.m01;
        this.m12 = tx * this.m10 + ty * this.m11;
        if (this.m02 !== 0 || this.m12 !== 0) {
          this.state = AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE;
          this.type |= AffineTransform.TYPE_TRANSLATION;
        }
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
        this.m02 = ty * this.m01 + this.m02;
        this.m12 = tx * this.m10 + this.m12;
        if (this.m02 === 0 && this.m12 === 0) {
          this.state = AffineTransform.APPLY_SHEAR;
          if (this.type !== AffineTransform.TYPE_UNKNOWN) {
            this.type = (this.type - AffineTransform.TYPE_TRANSLATION) | 0;
          }
        }
        return;
      case (AffineTransform.APPLY_SHEAR):
        this.m02 = ty * this.m01;
        this.m12 = tx * this.m10;
        if (this.m02 !== 0 || this.m12 !== 0) {
          this.state = AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE;
          this.type |= AffineTransform.TYPE_TRANSLATION;
        }
        return;
      case (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        this.m02 = tx * this.m00 + this.m02;
        this.m12 = ty * this.m11 + this.m12;
        if (this.m02 === 0 && this.m12 === 0) {
          this.state = AffineTransform.APPLY_SCALE;
          if (this.type !== AffineTransform.TYPE_UNKNOWN) {
            this.type = (this.type - AffineTransform.TYPE_TRANSLATION) | 0;
          }
        }
        return;
      case (AffineTransform.APPLY_SCALE):
        this.m02 = tx * this.m00;
        this.m12 = ty * this.m11;
        if (this.m02 !== 0 || this.m12 !== 0) {
          this.state = AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE;
          this.type |= AffineTransform.TYPE_TRANSLATION;
        }
        return;
      case (AffineTransform.APPLY_TRANSLATE):
        this.m02 = tx + this.m02;
        this.m12 = ty + this.m12;
        if (this.m02 === 0 && this.m12 === 0) {
          this.state = AffineTransform.APPLY_IDENTITY;
          this.type = AffineTransform.TYPE_IDENTITY;
        }
        return;
      case (AffineTransform.APPLY_IDENTITY):
        this.m02 = tx;
        this.m12 = ty;
        if (tx !== 0 || ty !== 0) {
          this.state = AffineTransform.APPLY_TRANSLATE;
          this.type = AffineTransform.TYPE_TRANSLATION;
        }
        return;
    }
  }
  rotate90(): void {
    let M0 = this.m00;
    this.m00 = this.m01;
    this.m01 = -M0;
    M0 = this.m10;
    this.m10 = this.m11;
    this.m11 = -M0;
    let state = AffineTransform.rot90conversion[this.state];
    if ((state & (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE)) === AffineTransform.APPLY_SCALE && this.m00 === 1 && this.m11 === 1) {
      state = (state - AffineTransform.APPLY_SCALE) | 0;
    }
    this.state = state;
    this.type = AffineTransform.TYPE_UNKNOWN;
  }
  rotate180(): void {
    this.m00 = -this.m00;
    this.m11 = -this.m11;
    let state = this.state;
    if ((state & (AffineTransform.APPLY_SHEAR)) !== 0) {
      this.m01 = -this.m01;
      this.m10 = -this.m10;
    } else {
      if (this.m00 === 1 && this.m11 === 1) {
        this.state = state & ~AffineTransform.APPLY_SCALE;
      } else {
        this.state = state | AffineTransform.APPLY_SCALE;
      }
    }
    this.type = AffineTransform.TYPE_UNKNOWN;
  }
  rotate270(): void {
    let M0 = this.m00;
    this.m00 = -this.m01;
    this.m01 = M0;
    M0 = this.m10;
    this.m10 = -this.m11;
    this.m11 = M0;
    let state = AffineTransform.rot90conversion[this.state];
    if ((state & (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE)) === AffineTransform.APPLY_SCALE && this.m00 === 1 && this.m11 === 1) {
      state = (state - AffineTransform.APPLY_SCALE) | 0;
    }
    this.state = state;
    this.type = AffineTransform.TYPE_UNKNOWN;
  }
  /**
   * Concatenates this transform with a rotation transformation.
   * This is equivalent to calling concatenate(R), where R is an
   * {@code AffineTransform} represented by the following matrix:
   * <pre>
   *          [   cos(theta)    -sin(theta)    0   ]
   *          [   sin(theta)     cos(theta)    0   ]
   *          [       0              0         1   ]
   * </pre>
   * Rotating by a positive angle theta rotates points on the positive
   * X axis toward the positive Y axis.
   * Note also the discussion of
   * <a href="#quadrantapproximation">Handling 90-Degree Rotations</a>
   * above.
   * @param theta the angle of rotation measured in radians
   * @since 1.2
   */
  rotate$double(theta: number): void {
    let sin = Math.sin(theta);
    if (sin === 1) {
      this.rotate90();
    } else if (sin === -1) {
      this.rotate270();
    } else {
      let cos = Math.cos(theta);
      if (cos === -1) {
        this.rotate180();
      } else if (cos !== 1) {
        let M0: number;
        let M1: number;
        M0 = this.m00;
        M1 = this.m01;
        this.m00 = cos * M0 + sin * M1;
        this.m01 = -sin * M0 + cos * M1;
        M0 = this.m10;
        M1 = this.m11;
        this.m10 = cos * M0 + sin * M1;
        this.m11 = -sin * M0 + cos * M1;
        this.updateState();
      }
    }
  }
  /**
   * Concatenates this transform with a transform that rotates
   * coordinates around an anchor point.
   * This operation is equivalent to translating the coordinates so
   * that the anchor point is at the origin (S1), then rotating them
   * about the new origin (S2), and finally translating so that the
   * intermediate origin is restored to the coordinates of the original
   * anchor point (S3).
   * <p>
   * This operation is equivalent to the following sequence of calls:
   * <pre>
   *     translate(anchorx, anchory);      // S3: final translation
   *     rotate(theta);                    // S2: rotate around anchor
   *     translate(-anchorx, -anchory);    // S1: translate anchor to origin
   * </pre>
   * Rotating by a positive angle theta rotates points on the positive
   * X axis toward the positive Y axis.
   * Note also the discussion of
   * <a href="#quadrantapproximation">Handling 90-Degree Rotations</a>
   * above.
   *
   * @param theta the angle of rotation measured in radians
   * @param anchorx the X coordinate of the rotation anchor point
   * @param anchory the Y coordinate of the rotation anchor point
   * @since 1.2
   */
  rotate$double$double$double(theta: number, anchorx: number, anchory: number): void {
    this.translate(anchorx, anchory);
    this.rotate$double(theta);
    this.translate(-anchorx, -anchory);
  }
  /**
   * Concatenates this transform with a transform that rotates
   * coordinates according to a rotation vector.
   * All coordinates rotate about the origin by the same amount.
   * The amount of rotation is such that coordinates along the former
   * positive X axis will subsequently align with the vector pointing
   * from the origin to the specified vector coordinates.
   * If both {@code vecx} and {@code vecy} are 0.0,
   * no additional rotation is added to this transform.
   * This operation is equivalent to calling:
   * <pre>
   *          rotate(Math.atan2(vecy, vecx));
   * </pre>
   *
   * @param vecx the X coordinate of the rotation vector
   * @param vecy the Y coordinate of the rotation vector
   * @since 1.6
   */
  rotate$double$double(vecx: number, vecy: number): void {
    if (vecy === 0) {
      if (vecx < 0) {
        this.rotate180();
      }
    } else if (vecx === 0) {
      if (vecy > 0) {
        this.rotate90();
      } else {
        this.rotate270();
      }
    } else {
      let len = Math.sqrt(vecx * vecx + vecy * vecy);
      let sin = vecy / len;
      let cos = vecx / len;
      let M0: number;
      let M1: number;
      M0 = this.m00;
      M1 = this.m01;
      this.m00 = cos * M0 + sin * M1;
      this.m01 = -sin * M0 + cos * M1;
      M0 = this.m10;
      M1 = this.m11;
      this.m10 = cos * M0 + sin * M1;
      this.m11 = -sin * M0 + cos * M1;
      this.updateState();
    }
  }
  /**
   * Concatenates this transform with a transform that rotates
   * coordinates around an anchor point according to a rotation
   * vector.
   * All coordinates rotate about the specified anchor coordinates
   * by the same amount.
   * The amount of rotation is such that coordinates along the former
   * positive X axis will subsequently align with the vector pointing
   * from the origin to the specified vector coordinates.
   * If both {@code vecx} and {@code vecy} are 0.0,
   * the transform is not modified in any way.
   * This method is equivalent to calling:
   * <pre>
   *     rotate(Math.atan2(vecy, vecx), anchorx, anchory);
   * </pre>
   *
   * @param vecx the X coordinate of the rotation vector
   * @param vecy the Y coordinate of the rotation vector
   * @param anchorx the X coordinate of the rotation anchor point
   * @param anchory the Y coordinate of the rotation anchor point
   * @since 1.6
   */
  rotate$double$double$double$double(vecx: number, vecy: number, anchorx: number, anchory: number): void {
    this.translate(anchorx, anchory);
    this.rotate$double$double(vecx, vecy);
    this.translate(-anchorx, -anchory);
  }
  /**
   * Concatenates this transform with a transform that rotates
   * coordinates by the specified number of quadrants.
   * This is equivalent to calling:
   * <pre>
   *     rotate(numquadrants * Math.PI / 2.0);
   * </pre>
   * Rotating by a positive number of quadrants rotates points on
   * the positive X axis toward the positive Y axis.
   * @param numquadrants the number of 90 degree arcs to rotate by
   * @since 1.6
   */
  quadrantRotate$int(numquadrants: number): void {
    switch (numquadrants & 3) {
      case 0:
        break;
      case 1:
        this.rotate90();
        break;
      case 2:
        this.rotate180();
        break;
      case 3:
        this.rotate270();
        break;
    }
  }
  /**
   * Concatenates this transform with a transform that rotates
   * coordinates by the specified number of quadrants around
   * the specified anchor point.
   * This method is equivalent to calling:
   * <pre>
   *     rotate(numquadrants * Math.PI / 2.0, anchorx, anchory);
   * </pre>
   * Rotating by a positive number of quadrants rotates points on
   * the positive X axis toward the positive Y axis.
   *
   * @param numquadrants the number of 90 degree arcs to rotate by
   * @param anchorx the X coordinate of the rotation anchor point
   * @param anchory the Y coordinate of the rotation anchor point
   * @since 1.6
   */
  quadrantRotate$int$double$double(numquadrants: number, anchorx: number, anchory: number): void {
    switch (numquadrants & 3) {
      case 0:
        return;
      case 1:
        this.m02 += anchorx * (this.m00 - this.m01) + anchory * (this.m01 + this.m00);
        this.m12 += anchorx * (this.m10 - this.m11) + anchory * (this.m11 + this.m10);
        this.rotate90();
        break;
      case 2:
        this.m02 += anchorx * (this.m00 + this.m00) + anchory * (this.m01 + this.m01);
        this.m12 += anchorx * (this.m10 + this.m10) + anchory * (this.m11 + this.m11);
        this.rotate180();
        break;
      case 3:
        this.m02 += anchorx * (this.m00 + this.m01) + anchory * (this.m01 - this.m00);
        this.m12 += anchorx * (this.m10 + this.m11) + anchory * (this.m11 - this.m10);
        this.rotate270();
        break;
    }
    if (this.m02 === 0 && this.m12 === 0) {
      this.state &= ~AffineTransform.APPLY_TRANSLATE;
    } else {
      this.state |= AffineTransform.APPLY_TRANSLATE;
    }
  }
  /**
   * Concatenates this transform with a scaling transformation.
   * This is equivalent to calling concatenate(S), where S is an
   * {@code AffineTransform} represented by the following matrix:
   * <pre>
   *          [   sx   0    0   ]
   *          [   0    sy   0   ]
   *          [   0    0    1   ]
   * </pre>
   * @param sx the factor by which coordinates are scaled along the
   * X axis direction
   * @param sy the factor by which coordinates are scaled along the
   * Y axis direction
   * @since 1.2
   */
  scale(sx: number, sy: number): void {
    let state = this.state;
    switch (state) {
      default:
        this.stateError();
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
        this.m00 *= sx;
        this.m11 *= sy;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.APPLY_SHEAR):
        this.m01 *= sy;
        this.m10 *= sx;
        if (this.m01 === 0 && this.m10 === 0) {
          state &= AffineTransform.APPLY_TRANSLATE;
          if (this.m00 === 1 && this.m11 === 1) {
            this.type = (state === AffineTransform.APPLY_IDENTITY ? AffineTransform.TYPE_IDENTITY : AffineTransform.TYPE_TRANSLATION);
          } else {
            state |= AffineTransform.APPLY_SCALE;
            this.type = AffineTransform.TYPE_UNKNOWN;
          }
          this.state = state;
        }
        return;
      case (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.APPLY_SCALE):
        this.m00 *= sx;
        this.m11 *= sy;
        if (this.m00 === 1 && this.m11 === 1) {
          this.state = (state &= AffineTransform.APPLY_TRANSLATE);
          this.type = (state === AffineTransform.APPLY_IDENTITY ? AffineTransform.TYPE_IDENTITY : AffineTransform.TYPE_TRANSLATION);
        } else {
          this.type = AffineTransform.TYPE_UNKNOWN;
        }
        return;
      case (AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.APPLY_IDENTITY):
        this.m00 = sx;
        this.m11 = sy;
        if (sx !== 1 || sy !== 1) {
          this.state = state | AffineTransform.APPLY_SCALE;
          this.type = AffineTransform.TYPE_UNKNOWN;
        }
        return;
    }
  }
  /**
   * Concatenates this transform with a shearing transformation.
   * This is equivalent to calling concatenate(SH), where SH is an
   * {@code AffineTransform} represented by the following matrix:
   * <pre>
   *          [   1   shx   0   ]
   *          [  shy   1    0   ]
   *          [   0    0    1   ]
   * </pre>
   * @param shx the multiplier by which coordinates are shifted in the
   * direction of the positive X axis as a factor of their Y coordinate
   * @param shy the multiplier by which coordinates are shifted in the
   * direction of the positive Y axis as a factor of their X coordinate
   * @since 1.2
   */
  shear(shx: number, shy: number): void {
    let state = this.state;
    {
      let M0: number, M1: number;
      switch (state) {
        default:
          this.stateError();
          return;
        case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
          M0 = this.m00;
          M1 = this.m01;
          this.m00 = M0 + M1 * shy;
          this.m01 = M0 * shx + M1;
          M0 = this.m10;
          M1 = this.m11;
          this.m10 = M0 + M1 * shy;
          this.m11 = M0 * shx + M1;
          this.updateState();
          return;
        case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
        case (AffineTransform.APPLY_SHEAR):
          this.m00 = this.m01 * shy;
          this.m11 = this.m10 * shx;
          if (this.m00 !== 0 || this.m11 !== 0) {
            this.state = state | AffineTransform.APPLY_SCALE;
          }
          this.type = AffineTransform.TYPE_UNKNOWN;
          return;
        case (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        case (AffineTransform.APPLY_SCALE):
          this.m01 = this.m00 * shx;
          this.m10 = this.m11 * shy;
          if (this.m01 !== 0 || this.m10 !== 0) {
            this.state = state | AffineTransform.APPLY_SHEAR;
          }
          this.type = AffineTransform.TYPE_UNKNOWN;
          return;
        case (AffineTransform.APPLY_TRANSLATE):
        case (AffineTransform.APPLY_IDENTITY):
          this.m01 = shx;
          this.m10 = shy;
          if (this.m01 !== 0 || this.m10 !== 0) {
            this.state = state | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_SHEAR;
            this.type = AffineTransform.TYPE_UNKNOWN;
          }
          return;
      }
    }
  }
  /**
   * Resets this transform to the Identity transform.
   * @since 1.2
   */
  setToIdentity(): void {
    this.m00 = this.m11 = 1;
    this.m10 = this.m01 = this.m02 = this.m12 = 0;
    this.state = AffineTransform.APPLY_IDENTITY;
    this.type = AffineTransform.TYPE_IDENTITY;
  }
  /**
   * Sets this transform to a translation transformation.
   * The matrix representing this transform becomes:
   * <pre>
   *          [   1    0    tx  ]
   *          [   0    1    ty  ]
   *          [   0    0    1   ]
   * </pre>
   * @param tx the distance by which coordinates are translated in the
   * X axis direction
   * @param ty the distance by which coordinates are translated in the
   * Y axis direction
   * @since 1.2
   */
  setToTranslation(tx: number, ty: number): void {
    this.m00 = 1;
    this.m10 = 0;
    this.m01 = 0;
    this.m11 = 1;
    this.m02 = tx;
    this.m12 = ty;
    if (tx !== 0 || ty !== 0) {
      this.state = AffineTransform.APPLY_TRANSLATE;
      this.type = AffineTransform.TYPE_TRANSLATION;
    } else {
      this.state = AffineTransform.APPLY_IDENTITY;
      this.type = AffineTransform.TYPE_IDENTITY;
    }
  }
  /**
   * Sets this transform to a rotation transformation.
   * The matrix representing this transform becomes:
   * <pre>
   *          [   cos(theta)    -sin(theta)    0   ]
   *          [   sin(theta)     cos(theta)    0   ]
   *          [       0              0         1   ]
   * </pre>
   * Rotating by a positive angle theta rotates points on the positive
   * X axis toward the positive Y axis.
   * Note also the discussion of
   * <a href="#quadrantapproximation">Handling 90-Degree Rotations</a>
   * above.
   * @param theta the angle of rotation measured in radians
   * @since 1.2
   */
  setToRotation$double(theta: number): void {
    let sin = Math.sin(theta);
    let cos: number;
    if (sin === 1 || sin === -1) {
      cos = 0;
      this.state = AffineTransform.APPLY_SHEAR;
      this.type = AffineTransform.TYPE_QUADRANT_ROTATION;
    } else {
      cos = Math.cos(theta);
      if (cos === -1) {
        sin = 0;
        this.state = AffineTransform.APPLY_SCALE;
        this.type = AffineTransform.TYPE_QUADRANT_ROTATION;
      } else if (cos === 1) {
        sin = 0;
        this.state = AffineTransform.APPLY_IDENTITY;
        this.type = AffineTransform.TYPE_IDENTITY;
      } else {
        this.state = AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE;
        this.type = AffineTransform.TYPE_GENERAL_ROTATION;
      }
    }
    this.m00 = cos;
    this.m10 = sin;
    this.m01 = -sin;
    this.m11 = cos;
    this.m02 = 0;
    this.m12 = 0;
  }
  /**
   * Sets this transform to a translated rotation transformation.
   * This operation is equivalent to translating the coordinates so
   * that the anchor point is at the origin (S1), then rotating them
   * about the new origin (S2), and finally translating so that the
   * intermediate origin is restored to the coordinates of the original
   * anchor point (S3).
   * <p>
   * This operation is equivalent to the following sequence of calls:
   * <pre>
   *     setToTranslation(anchorx, anchory); // S3: final translation
   *     rotate(theta);                      // S2: rotate around anchor
   *     translate(-anchorx, -anchory);      // S1: translate anchor to origin
   * </pre>
   * The matrix representing this transform becomes:
   * <pre>
   *          [   cos(theta)    -sin(theta)    x-x*cos+y*sin  ]
   *          [   sin(theta)     cos(theta)    y-x*sin-y*cos  ]
   *          [       0              0               1        ]
   * </pre>
   * Rotating by a positive angle theta rotates points on the positive
   * X axis toward the positive Y axis.
   * Note also the discussion of
   * <a href="#quadrantapproximation">Handling 90-Degree Rotations</a>
   * above.
   *
   * @param theta the angle of rotation measured in radians
   * @param anchorx the X coordinate of the rotation anchor point
   * @param anchory the Y coordinate of the rotation anchor point
   * @since 1.2
   */
  setToRotation$double$double$double(theta: number, anchorx: number, anchory: number): void {
    this.setToRotation$double(theta);
    let sin = this.m10;
    let oneMinusCos = 1 - this.m00;
    this.m02 = anchorx * oneMinusCos + anchory * sin;
    this.m12 = anchory * oneMinusCos - anchorx * sin;
    if (this.m02 !== 0 || this.m12 !== 0) {
      this.state |= AffineTransform.APPLY_TRANSLATE;
      this.type |= AffineTransform.TYPE_TRANSLATION;
    }
  }
  /**
   * Sets this transform to a rotation transformation that rotates
   * coordinates according to a rotation vector.
   * All coordinates rotate about the origin by the same amount.
   * The amount of rotation is such that coordinates along the former
   * positive X axis will subsequently align with the vector pointing
   * from the origin to the specified vector coordinates.
   * If both {@code vecx} and {@code vecy} are 0.0,
   * the transform is set to an identity transform.
   * This operation is equivalent to calling:
   * <pre>
   *     setToRotation(Math.atan2(vecy, vecx));
   * </pre>
   *
   * @param vecx the X coordinate of the rotation vector
   * @param vecy the Y coordinate of the rotation vector
   * @since 1.6
   */
  setToRotation$double$double(vecx: number, vecy: number): void {
    let sin: number;
    let cos: number;
    if (vecy === 0) {
      sin = 0;
      if (vecx < 0) {
        cos = -1;
        this.state = AffineTransform.APPLY_SCALE;
        this.type = AffineTransform.TYPE_QUADRANT_ROTATION;
      } else {
        cos = 1;
        this.state = AffineTransform.APPLY_IDENTITY;
        this.type = AffineTransform.TYPE_IDENTITY;
      }
    } else if (vecx === 0) {
      cos = 0;
      sin = (vecy > 0) ? 1 : -1;
      this.state = AffineTransform.APPLY_SHEAR;
      this.type = AffineTransform.TYPE_QUADRANT_ROTATION;
    } else {
      let len = Math.sqrt(vecx * vecx + vecy * vecy);
      cos = vecx / len;
      sin = vecy / len;
      this.state = AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE;
      this.type = AffineTransform.TYPE_GENERAL_ROTATION;
    }
    this.m00 = cos;
    this.m10 = sin;
    this.m01 = -sin;
    this.m11 = cos;
    this.m02 = 0;
    this.m12 = 0;
  }
  /**
   * Sets this transform to a rotation transformation that rotates
   * coordinates around an anchor point according to a rotation
   * vector.
   * All coordinates rotate about the specified anchor coordinates
   * by the same amount.
   * The amount of rotation is such that coordinates along the former
   * positive X axis will subsequently align with the vector pointing
   * from the origin to the specified vector coordinates.
   * If both {@code vecx} and {@code vecy} are 0.0,
   * the transform is set to an identity transform.
   * This operation is equivalent to calling:
   * <pre>
   *     setToTranslation(Math.atan2(vecy, vecx), anchorx, anchory);
   * </pre>
   *
   * @param vecx the X coordinate of the rotation vector
   * @param vecy the Y coordinate of the rotation vector
   * @param anchorx the X coordinate of the rotation anchor point
   * @param anchory the Y coordinate of the rotation anchor point
   * @since 1.6
   */
  setToRotation$double$double$double$double(vecx: number, vecy: number, anchorx: number, anchory: number): void {
    this.setToRotation$double$double(vecx, vecy);
    let sin = this.m10;
    let oneMinusCos = 1 - this.m00;
    this.m02 = anchorx * oneMinusCos + anchory * sin;
    this.m12 = anchory * oneMinusCos - anchorx * sin;
    if (this.m02 !== 0 || this.m12 !== 0) {
      this.state |= AffineTransform.APPLY_TRANSLATE;
      this.type |= AffineTransform.TYPE_TRANSLATION;
    }
  }
  /**
   * Sets this transform to a rotation transformation that rotates
   * coordinates by the specified number of quadrants.
   * This operation is equivalent to calling:
   * <pre>
   *     setToRotation(numquadrants * Math.PI / 2.0);
   * </pre>
   * Rotating by a positive number of quadrants rotates points on
   * the positive X axis toward the positive Y axis.
   * @param numquadrants the number of 90 degree arcs to rotate by
   * @since 1.6
   */
  setToQuadrantRotation$int(numquadrants: number): void {
    switch (numquadrants & 3) {
      case 0:
        this.m00 = 1;
        this.m10 = 0;
        this.m01 = 0;
        this.m11 = 1;
        this.m02 = 0;
        this.m12 = 0;
        this.state = AffineTransform.APPLY_IDENTITY;
        this.type = AffineTransform.TYPE_IDENTITY;
        break;
      case 1:
        this.m00 = 0;
        this.m10 = 1;
        this.m01 = -1;
        this.m11 = 0;
        this.m02 = 0;
        this.m12 = 0;
        this.state = AffineTransform.APPLY_SHEAR;
        this.type = AffineTransform.TYPE_QUADRANT_ROTATION;
        break;
      case 2:
        this.m00 = -1;
        this.m10 = 0;
        this.m01 = 0;
        this.m11 = -1;
        this.m02 = 0;
        this.m12 = 0;
        this.state = AffineTransform.APPLY_SCALE;
        this.type = AffineTransform.TYPE_QUADRANT_ROTATION;
        break;
      case 3:
        this.m00 = 0;
        this.m10 = -1;
        this.m01 = 1;
        this.m11 = 0;
        this.m02 = 0;
        this.m12 = 0;
        this.state = AffineTransform.APPLY_SHEAR;
        this.type = AffineTransform.TYPE_QUADRANT_ROTATION;
        break;
    }
  }
  /**
   * Sets this transform to a translated rotation transformation
   * that rotates coordinates by the specified number of quadrants
   * around the specified anchor point.
   * This operation is equivalent to calling:
   * <pre>
   *     setToRotation(numquadrants * Math.PI / 2.0, anchorx, anchory);
   * </pre>
   * Rotating by a positive number of quadrants rotates points on
   * the positive X axis toward the positive Y axis.
   *
   * @param numquadrants the number of 90 degree arcs to rotate by
   * @param anchorx the X coordinate of the rotation anchor point
   * @param anchory the Y coordinate of the rotation anchor point
   * @since 1.6
   */
  setToQuadrantRotation$int$double$double(numquadrants: number, anchorx: number, anchory: number): void {
    switch (numquadrants & 3) {
      case 0:
        this.m00 = 1;
        this.m10 = 0;
        this.m01 = 0;
        this.m11 = 1;
        this.m02 = 0;
        this.m12 = 0;
        this.state = AffineTransform.APPLY_IDENTITY;
        this.type = AffineTransform.TYPE_IDENTITY;
        break;
      case 1:
        this.m00 = 0;
        this.m10 = 1;
        this.m01 = -1;
        this.m11 = 0;
        this.m02 = anchorx + anchory;
        this.m12 = anchory - anchorx;
        if (this.m02 === 0 && this.m12 === 0) {
          this.state = AffineTransform.APPLY_SHEAR;
          this.type = AffineTransform.TYPE_QUADRANT_ROTATION;
        } else {
          this.state = AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE;
          this.type = AffineTransform.TYPE_QUADRANT_ROTATION | AffineTransform.TYPE_TRANSLATION;
        }
        break;
      case 2:
        this.m00 = -1;
        this.m10 = 0;
        this.m01 = 0;
        this.m11 = -1;
        this.m02 = anchorx + anchorx;
        this.m12 = anchory + anchory;
        if (this.m02 === 0 && this.m12 === 0) {
          this.state = AffineTransform.APPLY_SCALE;
          this.type = AffineTransform.TYPE_QUADRANT_ROTATION;
        } else {
          this.state = AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE;
          this.type = AffineTransform.TYPE_QUADRANT_ROTATION | AffineTransform.TYPE_TRANSLATION;
        }
        break;
      case 3:
        this.m00 = 0;
        this.m10 = -1;
        this.m01 = 1;
        this.m11 = 0;
        this.m02 = anchorx - anchory;
        this.m12 = anchory + anchorx;
        if (this.m02 === 0 && this.m12 === 0) {
          this.state = AffineTransform.APPLY_SHEAR;
          this.type = AffineTransform.TYPE_QUADRANT_ROTATION;
        } else {
          this.state = AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE;
          this.type = AffineTransform.TYPE_QUADRANT_ROTATION | AffineTransform.TYPE_TRANSLATION;
        }
        break;
    }
  }
  /**
   * Sets this transform to a scaling transformation.
   * The matrix representing this transform becomes:
   * <pre>
   *          [   sx   0    0   ]
   *          [   0    sy   0   ]
   *          [   0    0    1   ]
   * </pre>
   * @param sx the factor by which coordinates are scaled along the
   * X axis direction
   * @param sy the factor by which coordinates are scaled along the
   * Y axis direction
   * @since 1.2
   */
  setToScale(sx: number, sy: number): void {
    this.m00 = sx;
    this.m10 = 0;
    this.m01 = 0;
    this.m11 = sy;
    this.m02 = 0;
    this.m12 = 0;
    if (sx !== 1 || sy !== 1) {
      this.state = AffineTransform.APPLY_SCALE;
      this.type = AffineTransform.TYPE_UNKNOWN;
    } else {
      this.state = AffineTransform.APPLY_IDENTITY;
      this.type = AffineTransform.TYPE_IDENTITY;
    }
  }
  /**
   * Sets this transform to a shearing transformation.
   * The matrix representing this transform becomes:
   * <pre>
   *          [   1   shx   0   ]
   *          [  shy   1    0   ]
   *          [   0    0    1   ]
   * </pre>
   * @param shx the multiplier by which coordinates are shifted in the
   * direction of the positive X axis as a factor of their Y coordinate
   * @param shy the multiplier by which coordinates are shifted in the
   * direction of the positive Y axis as a factor of their X coordinate
   * @since 1.2
   */
  setToShear(shx: number, shy: number): void {
    this.m00 = 1;
    this.m01 = shx;
    this.m10 = shy;
    this.m11 = 1;
    this.m02 = 0;
    this.m12 = 0;
    if (shx !== 0 || shy !== 0) {
      this.state = (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE);
      this.type = AffineTransform.TYPE_UNKNOWN;
    } else {
      this.state = AffineTransform.APPLY_IDENTITY;
      this.type = AffineTransform.TYPE_IDENTITY;
    }
  }
  /**
   * Sets this transform to a copy of the transform in the specified
   * {@code AffineTransform} object.
   * @param Tx the {@code AffineTransform} object from which to
   * copy the transform
   * @since 1.2
   */
  setTransform$AffineTransform(Tx: AffineTransform): void {
    this.m00 = Tx.m00;
    this.m10 = Tx.m10;
    this.m01 = Tx.m01;
    this.m11 = Tx.m11;
    this.m02 = Tx.m02;
    this.m12 = Tx.m12;
    this.state = Tx.state;
    this.type = Tx.type;
  }
  /**
   * Sets this transform to the matrix specified by the 6
   * double precision values.
   *
   * @param m00 the X coordinate scaling element of the 3x3 matrix
   * @param m10 the Y coordinate shearing element of the 3x3 matrix
   * @param m01 the X coordinate shearing element of the 3x3 matrix
   * @param m11 the Y coordinate scaling element of the 3x3 matrix
   * @param m02 the X coordinate translation element of the 3x3 matrix
   * @param m12 the Y coordinate translation element of the 3x3 matrix
   * @since 1.2
   */
  setTransform$double$double$double$double$double$double(m00: number, m10: number, m01: number, m11: number, m02: number, m12: number): void {
    this.m00 = m00;
    this.m10 = m10;
    this.m01 = m01;
    this.m11 = m11;
    this.m02 = m02;
    this.m12 = m12;
    this.updateState();
  }
  /**
   * Concatenates an {@code AffineTransform Tx} to
   * this {@code AffineTransform} Cx in the most commonly useful
   * way to provide a new user space
   * that is mapped to the former user space by {@code Tx}.
   * Cx is updated to perform the combined transformation.
   * Transforming a point p by the updated transform Cx' is
   * equivalent to first transforming p by {@code Tx} and then
   * transforming the result by the original transform Cx like this:
   * Cx'(p) = Cx(Tx(p))
   * In matrix notation, if this transform Cx is
   * represented by the matrix [this] and {@code Tx} is represented
   * by the matrix [Tx] then this method does the following:
   * <pre>
   *          [this] = [this] x [Tx]
   * </pre>
   * @param Tx the {@code AffineTransform} object to be
   * concatenated with this {@code AffineTransform} object.
   * @see #preConcatenate
   * @since 1.2
   */
  concatenate(Tx: AffineTransform): void {
    let M0: number;
    let M1: number;
    let T00: number;
    let T01: number;
    let T10: number;
    let T11: number;
    let T02: number;
    let T12: number;
    let mystate = this.state;
    let txstate = Tx.state;
    switch ((txstate << AffineTransform.HI_SHIFT) | mystate) {
      case (AffineTransform.HI_IDENTITY | AffineTransform.APPLY_IDENTITY):
      case (AffineTransform.HI_IDENTITY | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_IDENTITY | AffineTransform.APPLY_SCALE):
      case (AffineTransform.HI_IDENTITY | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_IDENTITY | AffineTransform.APPLY_SHEAR):
      case (AffineTransform.HI_IDENTITY | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_IDENTITY | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
      case (AffineTransform.HI_IDENTITY | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        return;
      case (AffineTransform.HI_SHEAR | AffineTransform.HI_SCALE | AffineTransform.HI_TRANSLATE | AffineTransform.APPLY_IDENTITY):
        this.m01 = Tx.m01;
        this.m10 = Tx.m10;
      case (AffineTransform.HI_SCALE | AffineTransform.HI_TRANSLATE | AffineTransform.APPLY_IDENTITY):
        this.m00 = Tx.m00;
        this.m11 = Tx.m11;
      case (AffineTransform.HI_TRANSLATE | AffineTransform.APPLY_IDENTITY):
        this.m02 = Tx.m02;
        this.m12 = Tx.m12;
        this.state = txstate;
        this.type = Tx.type;
        return;
      case (AffineTransform.HI_SHEAR | AffineTransform.HI_SCALE | AffineTransform.APPLY_IDENTITY):
        this.m01 = Tx.m01;
        this.m10 = Tx.m10;
      case (AffineTransform.HI_SCALE | AffineTransform.APPLY_IDENTITY):
        this.m00 = Tx.m00;
        this.m11 = Tx.m11;
        this.state = txstate;
        this.type = Tx.type;
        return;
      case (AffineTransform.HI_SHEAR | AffineTransform.HI_TRANSLATE | AffineTransform.APPLY_IDENTITY):
        this.m02 = Tx.m02;
        this.m12 = Tx.m12;
      case (AffineTransform.HI_SHEAR | AffineTransform.APPLY_IDENTITY):
        this.m01 = Tx.m01;
        this.m10 = Tx.m10;
        this.m00 = this.m11 = 0;
        this.state = txstate;
        this.type = Tx.type;
        return;
      case (AffineTransform.HI_TRANSLATE | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_TRANSLATE | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
      case (AffineTransform.HI_TRANSLATE | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_TRANSLATE | AffineTransform.APPLY_SHEAR):
      case (AffineTransform.HI_TRANSLATE | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_TRANSLATE | AffineTransform.APPLY_SCALE):
      case (AffineTransform.HI_TRANSLATE | AffineTransform.APPLY_TRANSLATE):
        this.translate(Tx.m02, Tx.m12);
        return;
      case (AffineTransform.HI_SCALE | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_SCALE | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
      case (AffineTransform.HI_SCALE | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_SCALE | AffineTransform.APPLY_SHEAR):
      case (AffineTransform.HI_SCALE | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_SCALE | AffineTransform.APPLY_SCALE):
      case (AffineTransform.HI_SCALE | AffineTransform.APPLY_TRANSLATE):
        this.scale(Tx.m00, Tx.m11);
        return;
      case (AffineTransform.HI_SHEAR | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_SHEAR | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
        T01 = Tx.m01;
        T10 = Tx.m10;
        M0 = this.m00;
        this.m00 = this.m01 * T10;
        this.m01 = M0 * T01;
        M0 = this.m10;
        this.m10 = this.m11 * T10;
        this.m11 = M0 * T01;
        this.type = AffineTransform.TYPE_UNKNOWN;
        return;
      case (AffineTransform.HI_SHEAR | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_SHEAR | AffineTransform.APPLY_SHEAR):
        this.m00 = this.m01 * Tx.m10;
        this.m01 = 0;
        this.m11 = this.m10 * Tx.m01;
        this.m10 = 0;
        this.state = mystate ^ (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE);
        this.type = AffineTransform.TYPE_UNKNOWN;
        return;
      case (AffineTransform.HI_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_SHEAR | AffineTransform.APPLY_SCALE):
        this.m01 = this.m00 * Tx.m01;
        this.m00 = 0;
        this.m10 = this.m11 * Tx.m10;
        this.m11 = 0;
        this.state = mystate ^ (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE);
        this.type = AffineTransform.TYPE_UNKNOWN;
        return;
      case (AffineTransform.HI_SHEAR | AffineTransform.APPLY_TRANSLATE):
        this.m00 = 0;
        this.m01 = Tx.m01;
        this.m10 = Tx.m10;
        this.m11 = 0;
        this.state = AffineTransform.APPLY_TRANSLATE | AffineTransform.APPLY_SHEAR;
        this.type = AffineTransform.TYPE_UNKNOWN;
        return;
    }
    T00 = Tx.m00;
    T01 = Tx.m01;
    T02 = Tx.m02;
    T10 = Tx.m10;
    T11 = Tx.m11;
    T12 = Tx.m12;
    switch (mystate) {
      default:
        this.stateError();
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
        this.state = mystate | txstate;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        M0 = this.m00;
        M1 = this.m01;
        this.m00 = T00 * M0 + T10 * M1;
        this.m01 = T01 * M0 + T11 * M1;
        this.m02 += T02 * M0 + T12 * M1;
        M0 = this.m10;
        M1 = this.m11;
        this.m10 = T00 * M0 + T10 * M1;
        this.m11 = T01 * M0 + T11 * M1;
        this.m12 += T02 * M0 + T12 * M1;
        this.type = AffineTransform.TYPE_UNKNOWN;
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.APPLY_SHEAR):
        M0 = this.m01;
        this.m00 = T10 * M0;
        this.m01 = T11 * M0;
        this.m02 += T12 * M0;
        M0 = this.m10;
        this.m10 = T00 * M0;
        this.m11 = T01 * M0;
        this.m12 += T02 * M0;
        break;
      case (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.APPLY_SCALE):
        M0 = this.m00;
        this.m00 = T00 * M0;
        this.m01 = T01 * M0;
        this.m02 += T02 * M0;
        M0 = this.m11;
        this.m10 = T10 * M0;
        this.m11 = T11 * M0;
        this.m12 += T12 * M0;
        break;
      case (AffineTransform.APPLY_TRANSLATE):
        this.m00 = T00;
        this.m01 = T01;
        this.m02 += T02;
        this.m10 = T10;
        this.m11 = T11;
        this.m12 += T12;
        this.state = txstate | AffineTransform.APPLY_TRANSLATE;
        this.type = AffineTransform.TYPE_UNKNOWN;
        return;
    }
    this.updateState();
  }
  /**
   * Concatenates an {@code AffineTransform Tx} to
   * this {@code AffineTransform} Cx
   * in a less commonly used way such that {@code Tx} modifies the
   * coordinate transformation relative to the absolute pixel
   * space rather than relative to the existing user space.
   * Cx is updated to perform the combined transformation.
   * Transforming a point p by the updated transform Cx' is
   * equivalent to first transforming p by the original transform
   * Cx and then transforming the result by
   * {@code Tx} like this:
   * Cx'(p) = Tx(Cx(p))
   * In matrix notation, if this transform Cx
   * is represented by the matrix [this] and {@code Tx} is
   * represented by the matrix [Tx] then this method does the
   * following:
   * <pre>
   *          [this] = [Tx] x [this]
   * </pre>
   * @param Tx the {@code AffineTransform} object to be
   * concatenated with this {@code AffineTransform} object.
   * @see #concatenate
   * @since 1.2
   */
  preConcatenate(Tx: AffineTransform): void {
    let M0: number;
    let M1: number;
    let T00: number;
    let T01: number;
    let T10: number;
    let T11: number;
    let T02: number;
    let T12: number;
    let mystate = this.state;
    let txstate = Tx.state;
    switch ((txstate << AffineTransform.HI_SHIFT) | mystate) {
      case (AffineTransform.HI_IDENTITY | AffineTransform.APPLY_IDENTITY):
      case (AffineTransform.HI_IDENTITY | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_IDENTITY | AffineTransform.APPLY_SCALE):
      case (AffineTransform.HI_IDENTITY | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_IDENTITY | AffineTransform.APPLY_SHEAR):
      case (AffineTransform.HI_IDENTITY | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_IDENTITY | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
      case (AffineTransform.HI_IDENTITY | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        return;
      case (AffineTransform.HI_TRANSLATE | AffineTransform.APPLY_IDENTITY):
      case (AffineTransform.HI_TRANSLATE | AffineTransform.APPLY_SCALE):
      case (AffineTransform.HI_TRANSLATE | AffineTransform.APPLY_SHEAR):
      case (AffineTransform.HI_TRANSLATE | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
        this.m02 = Tx.m02;
        this.m12 = Tx.m12;
        this.state = mystate | AffineTransform.APPLY_TRANSLATE;
        this.type |= AffineTransform.TYPE_TRANSLATION;
        return;
      case (AffineTransform.HI_TRANSLATE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_TRANSLATE | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_TRANSLATE | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_TRANSLATE | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        this.m02 = this.m02 + Tx.m02;
        this.m12 = this.m12 + Tx.m12;
        return;
      case (AffineTransform.HI_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_SCALE | AffineTransform.APPLY_IDENTITY):
        this.state = mystate | AffineTransform.APPLY_SCALE;
      case (AffineTransform.HI_SCALE | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_SCALE | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
      case (AffineTransform.HI_SCALE | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_SCALE | AffineTransform.APPLY_SHEAR):
      case (AffineTransform.HI_SCALE | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_SCALE | AffineTransform.APPLY_SCALE):
        T00 = Tx.m00;
        T11 = Tx.m11;
        if ((mystate & AffineTransform.APPLY_SHEAR) !== 0) {
          this.m01 = this.m01 * T00;
          this.m10 = this.m10 * T11;
          if ((mystate & AffineTransform.APPLY_SCALE) !== 0) {
            this.m00 = this.m00 * T00;
            this.m11 = this.m11 * T11;
          }
        } else {
          this.m00 = this.m00 * T00;
          this.m11 = this.m11 * T11;
        }
        if ((mystate & AffineTransform.APPLY_TRANSLATE) !== 0) {
          this.m02 = this.m02 * T00;
          this.m12 = this.m12 * T11;
        }
        this.type = AffineTransform.TYPE_UNKNOWN;
        return;
      case (AffineTransform.HI_SHEAR | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_SHEAR | AffineTransform.APPLY_SHEAR):
        mystate = mystate | AffineTransform.APPLY_SCALE;
      case (AffineTransform.HI_SHEAR | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_SHEAR | AffineTransform.APPLY_IDENTITY):
      case (AffineTransform.HI_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_SHEAR | AffineTransform.APPLY_SCALE):
        this.state = mystate ^ AffineTransform.APPLY_SHEAR;
      case (AffineTransform.HI_SHEAR | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.HI_SHEAR | AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
        T01 = Tx.m01;
        T10 = Tx.m10;
        M0 = this.m00;
        this.m00 = this.m10 * T01;
        this.m10 = M0 * T10;
        M0 = this.m01;
        this.m01 = this.m11 * T01;
        this.m11 = M0 * T10;
        M0 = this.m02;
        this.m02 = this.m12 * T01;
        this.m12 = M0 * T10;
        this.type = AffineTransform.TYPE_UNKNOWN;
        return;
    }
    T00 = Tx.m00;
    T01 = Tx.m01;
    T02 = Tx.m02;
    T10 = Tx.m10;
    T11 = Tx.m11;
    T12 = Tx.m12;
    switch (mystate) {
      default:
        this.stateError();
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        M0 = this.m02;
        M1 = this.m12;
        T02 += M0 * T00 + M1 * T01;
        T12 += M0 * T10 + M1 * T11;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
        this.m02 = T02;
        this.m12 = T12;
        M0 = this.m00;
        M1 = this.m10;
        this.m00 = M0 * T00 + M1 * T01;
        this.m10 = M0 * T10 + M1 * T11;
        M0 = this.m01;
        M1 = this.m11;
        this.m01 = M0 * T00 + M1 * T01;
        this.m11 = M0 * T10 + M1 * T11;
        break;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
        M0 = this.m02;
        M1 = this.m12;
        T02 += M0 * T00 + M1 * T01;
        T12 += M0 * T10 + M1 * T11;
      case (AffineTransform.APPLY_SHEAR):
        this.m02 = T02;
        this.m12 = T12;
        M0 = this.m10;
        this.m00 = M0 * T01;
        this.m10 = M0 * T11;
        M0 = this.m01;
        this.m01 = M0 * T00;
        this.m11 = M0 * T10;
        break;
      case (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        M0 = this.m02;
        M1 = this.m12;
        T02 += M0 * T00 + M1 * T01;
        T12 += M0 * T10 + M1 * T11;
      case (AffineTransform.APPLY_SCALE):
        this.m02 = T02;
        this.m12 = T12;
        M0 = this.m00;
        this.m00 = M0 * T00;
        this.m10 = M0 * T10;
        M0 = this.m11;
        this.m01 = M0 * T01;
        this.m11 = M0 * T11;
        break;
      case (AffineTransform.APPLY_TRANSLATE):
        M0 = this.m02;
        M1 = this.m12;
        T02 += M0 * T00 + M1 * T01;
        T12 += M0 * T10 + M1 * T11;
      case (AffineTransform.APPLY_IDENTITY):
        this.m02 = T02;
        this.m12 = T12;
        this.m00 = T00;
        this.m10 = T10;
        this.m01 = T01;
        this.m11 = T11;
        this.state = mystate | txstate;
        this.type = AffineTransform.TYPE_UNKNOWN;
        return;
    }
    this.updateState();
  }
  /**
   * Returns an {@code AffineTransform} object representing the
   * inverse transformation.
   * The inverse transform Tx' of this transform Tx
   * maps coordinates transformed by Tx back
   * to their original coordinates.
   * In other words, Tx'(Tx(p)) = p = Tx(Tx'(p)).
   * <p>
   * If this transform maps all coordinates onto a point or a line
   * then it will not have an inverse, since coordinates that do
   * not lie on the destination point or line will not have an inverse
   * mapping.
   * The {@code getDeterminant} method can be used to determine if this
   * transform has no inverse, in which case an exception will be
   * thrown if the {@code createInverse} method is called.
   * @return a new {@code AffineTransform} object representing the
   * inverse transformation.
   * @see #getDeterminant
   * @throws NoninvertibleTransformException
   * if the matrix cannot be inverted.
   * @since 1.2
   */
  createInverse(): AffineTransform {
    let det: number;
    switch (this.state) {
      default:
        this.stateError();
        return null;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        det = this.m00 * this.m11 - this.m01 * this.m10;
        if (Math.abs(det) <= 4.9E-324) {
          throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is ' + $J.dstr(det));
        }
        return new AffineTransform()._AffineTransform$double$double$double$double$double$double$int(this.m11 / det, -this.m10 / det, -this.m01 / det, this.m00 / det, (this.m01 * this.m12 - this.m11 * this.m02) / det, (this.m10 * this.m02 - this.m00 * this.m12) / det, (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE));
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
        det = this.m00 * this.m11 - this.m01 * this.m10;
        if (Math.abs(det) <= 4.9E-324) {
          throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is ' + $J.dstr(det));
        }
        return new AffineTransform()._AffineTransform$double$double$double$double$double$double$int(this.m11 / det, -this.m10 / det, -this.m01 / det, this.m00 / det, 0, 0, (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE));
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
        if (this.m01 === 0 || this.m10 === 0) {
          throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is 0');
        }
        return new AffineTransform()._AffineTransform$double$double$double$double$double$double$int(0, 1 / this.m01, 1 / this.m10, 0, -this.m12 / this.m10, -this.m02 / this.m01, (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE));
      case (AffineTransform.APPLY_SHEAR):
        if (this.m01 === 0 || this.m10 === 0) {
          throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is 0');
        }
        return new AffineTransform()._AffineTransform$double$double$double$double$double$double$int(0, 1 / this.m01, 1 / this.m10, 0, 0, 0, (AffineTransform.APPLY_SHEAR));
      case (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        if (this.m00 === 0 || this.m11 === 0) {
          throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is 0');
        }
        return new AffineTransform()._AffineTransform$double$double$double$double$double$double$int(1 / this.m00, 0, 0, 1 / this.m11, -this.m02 / this.m00, -this.m12 / this.m11, (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE));
      case (AffineTransform.APPLY_SCALE):
        if (this.m00 === 0 || this.m11 === 0) {
          throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is 0');
        }
        return new AffineTransform()._AffineTransform$double$double$double$double$double$double$int(1 / this.m00, 0, 0, 1 / this.m11, 0, 0, (AffineTransform.APPLY_SCALE));
      case (AffineTransform.APPLY_TRANSLATE):
        return new AffineTransform()._AffineTransform$double$double$double$double$double$double$int(1, 0, 0, 1, -this.m02, -this.m12, (AffineTransform.APPLY_TRANSLATE));
      case (AffineTransform.APPLY_IDENTITY):
        return new AffineTransform()._AffineTransform$();
    }
  }
  /**
   * Sets this transform to the inverse of itself.
   * The inverse transform Tx' of this transform Tx
   * maps coordinates transformed by Tx back
   * to their original coordinates.
   * In other words, Tx'(Tx(p)) = p = Tx(Tx'(p)).
   * <p>
   * If this transform maps all coordinates onto a point or a line
   * then it will not have an inverse, since coordinates that do
   * not lie on the destination point or line will not have an inverse
   * mapping.
   * The {@code getDeterminant} method can be used to determine if this
   * transform has no inverse, in which case an exception will be
   * thrown if the {@code invert} method is called.
   * @see #getDeterminant
   * @throws NoninvertibleTransformException
   * if the matrix cannot be inverted.
   * @since 1.6
   */
  invert(): void {
    let M00: number;
    let M01: number;
    let M02: number;
    let M10: number;
    let M11: number;
    let M12: number;
    let det: number;
    switch (this.state) {
      default:
        this.stateError();
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        M00 = this.m00;
        M01 = this.m01;
        M02 = this.m02;
        M10 = this.m10;
        M11 = this.m11;
        M12 = this.m12;
        det = M00 * M11 - M01 * M10;
        if (Math.abs(det) <= 4.9E-324) {
          throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is ' + $J.dstr(det));
        }
        this.m00 = M11 / det;
        this.m10 = -M10 / det;
        this.m01 = -M01 / det;
        this.m11 = M00 / det;
        this.m02 = (M01 * M12 - M11 * M02) / det;
        this.m12 = (M10 * M02 - M00 * M12) / det;
        break;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
        M00 = this.m00;
        M01 = this.m01;
        M10 = this.m10;
        M11 = this.m11;
        det = M00 * M11 - M01 * M10;
        if (Math.abs(det) <= 4.9E-324) {
          throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is ' + $J.dstr(det));
        }
        this.m00 = M11 / det;
        this.m10 = -M10 / det;
        this.m01 = -M01 / det;
        this.m11 = M00 / det;
        break;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
        M01 = this.m01;
        M02 = this.m02;
        M10 = this.m10;
        M12 = this.m12;
        if (M01 === 0 || M10 === 0) {
          throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is 0');
        }
        this.m10 = 1 / M01;
        this.m01 = 1 / M10;
        this.m02 = -M12 / M10;
        this.m12 = -M02 / M01;
        break;
      case (AffineTransform.APPLY_SHEAR):
        M01 = this.m01;
        M10 = this.m10;
        if (M01 === 0 || M10 === 0) {
          throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is 0');
        }
        this.m10 = 1 / M01;
        this.m01 = 1 / M10;
        break;
      case (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        M00 = this.m00;
        M02 = this.m02;
        M11 = this.m11;
        M12 = this.m12;
        if (M00 === 0 || M11 === 0) {
          throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is 0');
        }
        this.m00 = 1 / M00;
        this.m11 = 1 / M11;
        this.m02 = -M02 / M00;
        this.m12 = -M12 / M11;
        break;
      case (AffineTransform.APPLY_SCALE):
        M00 = this.m00;
        M11 = this.m11;
        if (M00 === 0 || M11 === 0) {
          throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is 0');
        }
        this.m00 = 1 / M00;
        this.m11 = 1 / M11;
        break;
      case (AffineTransform.APPLY_TRANSLATE):
        this.m02 = -this.m02;
        this.m12 = -this.m12;
        break;
      case (AffineTransform.APPLY_IDENTITY):
        break;
    }
  }
  /**
   * Transforms the specified {@code ptSrc} and stores the result
   * in {@code ptDst}.
   * If {@code ptDst} is {@code null}, a new {@link Point2D}
   * object is allocated and then the result of the transformation is
   * stored in this object.
   * In either case, {@code ptDst}, which contains the
   * transformed point, is returned for convenience.
   * If {@code ptSrc} and {@code ptDst} are the same
   * object, the input point is correctly overwritten with
   * the transformed point.
   * @param ptSrc the specified {@code Point2D} to be transformed
   * @param ptDst the specified {@code Point2D} that stores the
   * result of transforming {@code ptSrc}
   * @return the {@code ptDst} after transforming
   * {@code ptSrc} and storing the result in {@code ptDst}.
   * @since 1.2
   */
  transform$Point2D$Point2D(ptSrc: Point2D, ptDst: Point2D): Point2D {
    if (ptDst == null) {
      if (ptSrc instanceof Point2D$Double) {
        ptDst = new Point2D$Double()._Point2D$Double$();
      } else {
        ptDst = new Point2D$Float()._Point2D$Float$();
      }
    }
    let x = ptSrc.getX();
    let y = ptSrc.getY();
    switch (this.state) {
      default:
        this.stateError();
        return null;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        ptDst.setLocation$double$double(x * this.m00 + y * this.m01 + this.m02, x * this.m10 + y * this.m11 + this.m12);
        return ptDst;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
        ptDst.setLocation$double$double(x * this.m00 + y * this.m01, x * this.m10 + y * this.m11);
        return ptDst;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
        ptDst.setLocation$double$double(y * this.m01 + this.m02, x * this.m10 + this.m12);
        return ptDst;
      case (AffineTransform.APPLY_SHEAR):
        ptDst.setLocation$double$double(y * this.m01, x * this.m10);
        return ptDst;
      case (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        ptDst.setLocation$double$double(x * this.m00 + this.m02, y * this.m11 + this.m12);
        return ptDst;
      case (AffineTransform.APPLY_SCALE):
        ptDst.setLocation$double$double(x * this.m00, y * this.m11);
        return ptDst;
      case (AffineTransform.APPLY_TRANSLATE):
        ptDst.setLocation$double$double(x + this.m02, y + this.m12);
        return ptDst;
      case (AffineTransform.APPLY_IDENTITY):
        ptDst.setLocation$double$double(x, y);
        return ptDst;
    }
  }
  /**
   * Transforms an array of point objects by this transform.
   * If any element of the {@code ptDst} array is
   * {@code null}, a new {@code Point2D} object is allocated
   * and stored into that element before storing the results of the
   * transformation.
   * <p>
   * Note that this method does not take any precautions to
   * avoid problems caused by storing results into {@code Point2D}
   * objects that will be used as the source for calculations
   * further down the source array.
   * This method does guarantee that if a specified {@code Point2D}
   * object is both the source and destination for the same single point
   * transform operation then the results will not be stored until
   * the calculations are complete to avoid storing the results on
   * top of the operands.
   * If, however, the destination {@code Point2D} object for one
   * operation is the same object as the source {@code Point2D}
   * object for another operation further down the source array then
   * the original coordinates in that point are overwritten before
   * they can be converted.
   * @param ptSrc the array containing the source point objects
   * @param ptDst the array into which the transform point objects are
   * returned
   * @param srcOff the offset to the first point object to be
   * transformed in the source array
   * @param dstOff the offset to the location of the first
   * transformed point object that is stored in the destination array
   * @param numPts the number of point objects to be transformed
   * @since 1.2
   */
  transform$Point2DArr$int$Point2DArr$int$int(ptSrc: Point2D[], srcOff: number, ptDst: Point2D[], dstOff: number, numPts: number): void {
    let state = this.state;
    while (--numPts >= 0) {
      let src = ptSrc[srcOff++];
      let x = src.getX();
      let y = src.getY();
      let dst = ptDst[dstOff++];
      if (dst == null) {
        if (src instanceof Point2D$Double) {
          dst = new Point2D$Double()._Point2D$Double$();
        } else {
          dst = new Point2D$Float()._Point2D$Float$();
        }
        (ptDst[(dstOff - 1) | 0]) = dst;
      }
      switch (state) {
        default:
          this.stateError();
          return;
        case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
          dst.setLocation$double$double(x * this.m00 + y * this.m01 + this.m02, x * this.m10 + y * this.m11 + this.m12);
          break;
        case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
          dst.setLocation$double$double(x * this.m00 + y * this.m01, x * this.m10 + y * this.m11);
          break;
        case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
          dst.setLocation$double$double(y * this.m01 + this.m02, x * this.m10 + this.m12);
          break;
        case (AffineTransform.APPLY_SHEAR):
          dst.setLocation$double$double(y * this.m01, x * this.m10);
          break;
        case (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
          dst.setLocation$double$double(x * this.m00 + this.m02, y * this.m11 + this.m12);
          break;
        case (AffineTransform.APPLY_SCALE):
          dst.setLocation$double$double(x * this.m00, y * this.m11);
          break;
        case (AffineTransform.APPLY_TRANSLATE):
          dst.setLocation$double$double(x + this.m02, y + this.m12);
          break;
        case (AffineTransform.APPLY_IDENTITY):
          dst.setLocation$double$double(x, y);
          break;
      }
    }
  }
  /**
   * Transforms an array of floating point coordinates by this transform.
   * The two coordinate array sections can be exactly the same or
   * can be overlapping sections of the same array without affecting the
   * validity of the results.
   * This method ensures that no source coordinates are overwritten by a
   * previous operation before they can be transformed.
   * The coordinates are stored in the arrays starting at the specified
   * offset in the order {@code [x0, y0, x1, y1, ..., xn, yn]}.
   * @param srcPts the array containing the source point coordinates.
   * Each point is stored as a pair of x,&nbsp;y coordinates.
   * @param dstPts the array into which the transformed point coordinates
   * are returned.  Each point is stored as a pair of x,&nbsp;y
   * coordinates.
   * @param srcOff the offset to the first point to be transformed
   * in the source array
   * @param dstOff the offset to the location of the first
   * transformed point that is stored in the destination array
   * @param numPts the number of points to be transformed
   * @since 1.2
   */
  transform$floatArr$int$floatArr$int$int(srcPts: number[], srcOff: number, dstPts: number[], dstOff: number, numPts: number): void {
    let M00: number;
    let M01: number;
    let M02: number;
    let M10: number;
    let M11: number;
    let M12: number;
    if (dstPts === srcPts && dstOff > srcOff && dstOff < ((srcOff + Math.imul(numPts, 2)) | 0)) {
      $J.system_arraycopy(srcPts, srcOff, dstPts, dstOff, Math.imul(numPts, 2));
      srcOff = dstOff;
    }
    switch (this.state) {
      default:
        this.stateError();
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        M00 = this.m00;
        M01 = this.m01;
        M02 = this.m02;
        M10 = this.m10;
        M11 = this.m11;
        M12 = this.m12;
        while (--numPts >= 0) {
          let x = srcPts[srcOff++];
          let y = srcPts[srcOff++];
          dstPts[dstOff++] = Math.fround((M00 * x + M01 * y + M02));
          dstPts[dstOff++] = Math.fround((M10 * x + M11 * y + M12));
        }
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
        M00 = this.m00;
        M01 = this.m01;
        M10 = this.m10;
        M11 = this.m11;
        while (--numPts >= 0) {
          let x = srcPts[srcOff++];
          let y = srcPts[srcOff++];
          dstPts[dstOff++] = Math.fround((M00 * x + M01 * y));
          dstPts[dstOff++] = Math.fround((M10 * x + M11 * y));
        }
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
        M01 = this.m01;
        M02 = this.m02;
        M10 = this.m10;
        M12 = this.m12;
        while (--numPts >= 0) {
          let x = srcPts[srcOff++];
          dstPts[dstOff++] = Math.fround((M01 * srcPts[srcOff++] + M02));
          dstPts[dstOff++] = Math.fround((M10 * x + M12));
        }
        return;
      case (AffineTransform.APPLY_SHEAR):
        M01 = this.m01;
        M10 = this.m10;
        while (--numPts >= 0) {
          let x = srcPts[srcOff++];
          dstPts[dstOff++] = Math.fround((M01 * srcPts[srcOff++]));
          dstPts[dstOff++] = Math.fround((M10 * x));
        }
        return;
      case (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        M00 = this.m00;
        M02 = this.m02;
        M11 = this.m11;
        M12 = this.m12;
        while (--numPts >= 0) {
          dstPts[dstOff++] = Math.fround((M00 * srcPts[srcOff++] + M02));
          dstPts[dstOff++] = Math.fround((M11 * srcPts[srcOff++] + M12));
        }
        return;
      case (AffineTransform.APPLY_SCALE):
        M00 = this.m00;
        M11 = this.m11;
        while (--numPts >= 0) {
          dstPts[dstOff++] = Math.fround((M00 * srcPts[srcOff++]));
          dstPts[dstOff++] = Math.fround((M11 * srcPts[srcOff++]));
        }
        return;
      case (AffineTransform.APPLY_TRANSLATE):
        M02 = this.m02;
        M12 = this.m12;
        while (--numPts >= 0) {
          dstPts[dstOff++] = Math.fround((srcPts[srcOff++] + M02));
          dstPts[dstOff++] = Math.fround((srcPts[srcOff++] + M12));
        }
        return;
      case (AffineTransform.APPLY_IDENTITY):
        if (srcPts !== dstPts || srcOff !== dstOff) {
          $J.system_arraycopy(srcPts, srcOff, dstPts, dstOff, Math.imul(numPts, 2));
        }
        return;
    }
  }
  /**
   * Transforms an array of double precision coordinates by this transform.
   * The two coordinate array sections can be exactly the same or
   * can be overlapping sections of the same array without affecting the
   * validity of the results.
   * This method ensures that no source coordinates are
   * overwritten by a previous operation before they can be transformed.
   * The coordinates are stored in the arrays starting at the indicated
   * offset in the order {@code [x0, y0, x1, y1, ..., xn, yn]}.
   * @param srcPts the array containing the source point coordinates.
   * Each point is stored as a pair of x,&nbsp;y coordinates.
   * @param dstPts the array into which the transformed point
   * coordinates are returned.  Each point is stored as a pair of
   * x,&nbsp;y coordinates.
   * @param srcOff the offset to the first point to be transformed
   * in the source array
   * @param dstOff the offset to the location of the first
   * transformed point that is stored in the destination array
   * @param numPts the number of point objects to be transformed
   * @since 1.2
   */
  transform$doubleArr$int$doubleArr$int$int(srcPts: number[], srcOff: number, dstPts: number[], dstOff: number, numPts: number): void {
    let M00: number;
    let M01: number;
    let M02: number;
    let M10: number;
    let M11: number;
    let M12: number;
    if (dstPts === srcPts && dstOff > srcOff && dstOff < ((srcOff + Math.imul(numPts, 2)) | 0)) {
      $J.system_arraycopy(srcPts, srcOff, dstPts, dstOff, Math.imul(numPts, 2));
      srcOff = dstOff;
    }
    switch (this.state) {
      default:
        this.stateError();
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        M00 = this.m00;
        M01 = this.m01;
        M02 = this.m02;
        M10 = this.m10;
        M11 = this.m11;
        M12 = this.m12;
        while (--numPts >= 0) {
          let x = srcPts[srcOff++];
          let y = srcPts[srcOff++];
          dstPts[dstOff++] = M00 * x + M01 * y + M02;
          dstPts[dstOff++] = M10 * x + M11 * y + M12;
        }
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
        M00 = this.m00;
        M01 = this.m01;
        M10 = this.m10;
        M11 = this.m11;
        while (--numPts >= 0) {
          let x = srcPts[srcOff++];
          let y = srcPts[srcOff++];
          dstPts[dstOff++] = M00 * x + M01 * y;
          dstPts[dstOff++] = M10 * x + M11 * y;
        }
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
        M01 = this.m01;
        M02 = this.m02;
        M10 = this.m10;
        M12 = this.m12;
        while (--numPts >= 0) {
          let x = srcPts[srcOff++];
          dstPts[dstOff++] = M01 * srcPts[srcOff++] + M02;
          dstPts[dstOff++] = M10 * x + M12;
        }
        return;
      case (AffineTransform.APPLY_SHEAR):
        M01 = this.m01;
        M10 = this.m10;
        while (--numPts >= 0) {
          let x = srcPts[srcOff++];
          dstPts[dstOff++] = M01 * srcPts[srcOff++];
          dstPts[dstOff++] = M10 * x;
        }
        return;
      case (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        M00 = this.m00;
        M02 = this.m02;
        M11 = this.m11;
        M12 = this.m12;
        while (--numPts >= 0) {
          dstPts[dstOff++] = M00 * srcPts[srcOff++] + M02;
          dstPts[dstOff++] = M11 * srcPts[srcOff++] + M12;
        }
        return;
      case (AffineTransform.APPLY_SCALE):
        M00 = this.m00;
        M11 = this.m11;
        while (--numPts >= 0) {
          dstPts[dstOff++] = M00 * srcPts[srcOff++];
          dstPts[dstOff++] = M11 * srcPts[srcOff++];
        }
        return;
      case (AffineTransform.APPLY_TRANSLATE):
        M02 = this.m02;
        M12 = this.m12;
        while (--numPts >= 0) {
          dstPts[dstOff++] = srcPts[srcOff++] + M02;
          dstPts[dstOff++] = srcPts[srcOff++] + M12;
        }
        return;
      case (AffineTransform.APPLY_IDENTITY):
        if (srcPts !== dstPts || srcOff !== dstOff) {
          $J.system_arraycopy(srcPts, srcOff, dstPts, dstOff, Math.imul(numPts, 2));
        }
        return;
    }
  }
  /**
   * Transforms an array of floating point coordinates by this transform
   * and stores the results into an array of doubles.
   * The coordinates are stored in the arrays starting at the specified
   * offset in the order {@code [x0, y0, x1, y1, ..., xn, yn]}.
   * @param srcPts the array containing the source point coordinates.
   * Each point is stored as a pair of x,&nbsp;y coordinates.
   * @param dstPts the array into which the transformed point coordinates
   * are returned.  Each point is stored as a pair of x,&nbsp;y
   * coordinates.
   * @param srcOff the offset to the first point to be transformed
   * in the source array
   * @param dstOff the offset to the location of the first
   * transformed point that is stored in the destination array
   * @param numPts the number of points to be transformed
   * @since 1.2
   */
  transform$floatArr$int$doubleArr$int$int(srcPts: number[], srcOff: number, dstPts: number[], dstOff: number, numPts: number): void {
    let M00: number;
    let M01: number;
    let M02: number;
    let M10: number;
    let M11: number;
    let M12: number;
    switch (this.state) {
      default:
        this.stateError();
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        M00 = this.m00;
        M01 = this.m01;
        M02 = this.m02;
        M10 = this.m10;
        M11 = this.m11;
        M12 = this.m12;
        while (--numPts >= 0) {
          let x = srcPts[srcOff++];
          let y = srcPts[srcOff++];
          dstPts[dstOff++] = M00 * x + M01 * y + M02;
          dstPts[dstOff++] = M10 * x + M11 * y + M12;
        }
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
        M00 = this.m00;
        M01 = this.m01;
        M10 = this.m10;
        M11 = this.m11;
        while (--numPts >= 0) {
          let x = srcPts[srcOff++];
          let y = srcPts[srcOff++];
          dstPts[dstOff++] = M00 * x + M01 * y;
          dstPts[dstOff++] = M10 * x + M11 * y;
        }
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
        M01 = this.m01;
        M02 = this.m02;
        M10 = this.m10;
        M12 = this.m12;
        while (--numPts >= 0) {
          let x = srcPts[srcOff++];
          dstPts[dstOff++] = M01 * srcPts[srcOff++] + M02;
          dstPts[dstOff++] = M10 * x + M12;
        }
        return;
      case (AffineTransform.APPLY_SHEAR):
        M01 = this.m01;
        M10 = this.m10;
        while (--numPts >= 0) {
          let x = srcPts[srcOff++];
          dstPts[dstOff++] = M01 * srcPts[srcOff++];
          dstPts[dstOff++] = M10 * x;
        }
        return;
      case (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        M00 = this.m00;
        M02 = this.m02;
        M11 = this.m11;
        M12 = this.m12;
        while (--numPts >= 0) {
          dstPts[dstOff++] = M00 * srcPts[srcOff++] + M02;
          dstPts[dstOff++] = M11 * srcPts[srcOff++] + M12;
        }
        return;
      case (AffineTransform.APPLY_SCALE):
        M00 = this.m00;
        M11 = this.m11;
        while (--numPts >= 0) {
          dstPts[dstOff++] = M00 * srcPts[srcOff++];
          dstPts[dstOff++] = M11 * srcPts[srcOff++];
        }
        return;
      case (AffineTransform.APPLY_TRANSLATE):
        M02 = this.m02;
        M12 = this.m12;
        while (--numPts >= 0) {
          dstPts[dstOff++] = srcPts[srcOff++] + M02;
          dstPts[dstOff++] = srcPts[srcOff++] + M12;
        }
        return;
      case (AffineTransform.APPLY_IDENTITY):
        while (--numPts >= 0) {
          dstPts[dstOff++] = srcPts[srcOff++];
          dstPts[dstOff++] = srcPts[srcOff++];
        }
        return;
    }
  }
  /**
   * Transforms an array of double precision coordinates by this transform
   * and stores the results into an array of floats.
   * The coordinates are stored in the arrays starting at the specified
   * offset in the order {@code [x0, y0, x1, y1, ..., xn, yn]}.
   * @param srcPts the array containing the source point coordinates.
   * Each point is stored as a pair of x,&nbsp;y coordinates.
   * @param dstPts the array into which the transformed point
   * coordinates are returned.  Each point is stored as a pair of
   * x,&nbsp;y coordinates.
   * @param srcOff the offset to the first point to be transformed
   * in the source array
   * @param dstOff the offset to the location of the first
   * transformed point that is stored in the destination array
   * @param numPts the number of point objects to be transformed
   * @since 1.2
   */
  transform$doubleArr$int$floatArr$int$int(srcPts: number[], srcOff: number, dstPts: number[], dstOff: number, numPts: number): void {
    let M00: number;
    let M01: number;
    let M02: number;
    let M10: number;
    let M11: number;
    let M12: number;
    switch (this.state) {
      default:
        this.stateError();
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        M00 = this.m00;
        M01 = this.m01;
        M02 = this.m02;
        M10 = this.m10;
        M11 = this.m11;
        M12 = this.m12;
        while (--numPts >= 0) {
          let x = srcPts[srcOff++];
          let y = srcPts[srcOff++];
          dstPts[dstOff++] = Math.fround((M00 * x + M01 * y + M02));
          dstPts[dstOff++] = Math.fround((M10 * x + M11 * y + M12));
        }
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
        M00 = this.m00;
        M01 = this.m01;
        M10 = this.m10;
        M11 = this.m11;
        while (--numPts >= 0) {
          let x = srcPts[srcOff++];
          let y = srcPts[srcOff++];
          dstPts[dstOff++] = Math.fround((M00 * x + M01 * y));
          dstPts[dstOff++] = Math.fround((M10 * x + M11 * y));
        }
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
        M01 = this.m01;
        M02 = this.m02;
        M10 = this.m10;
        M12 = this.m12;
        while (--numPts >= 0) {
          let x = srcPts[srcOff++];
          dstPts[dstOff++] = Math.fround((M01 * srcPts[srcOff++] + M02));
          dstPts[dstOff++] = Math.fround((M10 * x + M12));
        }
        return;
      case (AffineTransform.APPLY_SHEAR):
        M01 = this.m01;
        M10 = this.m10;
        while (--numPts >= 0) {
          let x = srcPts[srcOff++];
          dstPts[dstOff++] = Math.fround((M01 * srcPts[srcOff++]));
          dstPts[dstOff++] = Math.fround((M10 * x));
        }
        return;
      case (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        M00 = this.m00;
        M02 = this.m02;
        M11 = this.m11;
        M12 = this.m12;
        while (--numPts >= 0) {
          dstPts[dstOff++] = Math.fround((M00 * srcPts[srcOff++] + M02));
          dstPts[dstOff++] = Math.fround((M11 * srcPts[srcOff++] + M12));
        }
        return;
      case (AffineTransform.APPLY_SCALE):
        M00 = this.m00;
        M11 = this.m11;
        while (--numPts >= 0) {
          dstPts[dstOff++] = Math.fround((M00 * srcPts[srcOff++]));
          dstPts[dstOff++] = Math.fround((M11 * srcPts[srcOff++]));
        }
        return;
      case (AffineTransform.APPLY_TRANSLATE):
        M02 = this.m02;
        M12 = this.m12;
        while (--numPts >= 0) {
          dstPts[dstOff++] = Math.fround((srcPts[srcOff++] + M02));
          dstPts[dstOff++] = Math.fround((srcPts[srcOff++] + M12));
        }
        return;
      case (AffineTransform.APPLY_IDENTITY):
        while (--numPts >= 0) {
          dstPts[dstOff++] = Math.fround((srcPts[srcOff++]));
          dstPts[dstOff++] = Math.fround((srcPts[srcOff++]));
        }
        return;
    }
  }
  /**
   * Inverse transforms the specified {@code ptSrc} and stores the
   * result in {@code ptDst}.
   * If {@code ptDst} is {@code null}, a new
   * {@code Point2D} object is allocated and then the result of the
   * transform is stored in this object.
   * In either case, {@code ptDst}, which contains the transformed
   * point, is returned for convenience.
   * If {@code ptSrc} and {@code ptDst} are the same
   * object, the input point is correctly overwritten with the
   * transformed point.
   * @param ptSrc the point to be inverse transformed
   * @param ptDst the resulting transformed point
   * @return {@code ptDst}, which contains the result of the
   * inverse transform.
   * @throws NoninvertibleTransformException  if the matrix cannot be
   *                                         inverted.
   * @since 1.2
   */
  inverseTransform$Point2D$Point2D(ptSrc: Point2D, ptDst: Point2D): Point2D {
    if (ptDst == null) {
      if (ptSrc instanceof Point2D$Double) {
        ptDst = new Point2D$Double()._Point2D$Double$();
      } else {
        ptDst = new Point2D$Float()._Point2D$Float$();
      }
    }
    let x = ptSrc.getX();
    let y = ptSrc.getY();
    {
      let det: number;
      switch (this.state) {
        default:
          this.stateError();
        case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
          x -= this.m02;
          y -= this.m12;
        case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
          det = this.m00 * this.m11 - this.m01 * this.m10;
          if (Math.abs(det) <= 4.9E-324) {
            throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is ' + $J.dstr(det));
          }
          ptDst.setLocation$double$double((x * this.m11 - y * this.m01) / det, (y * this.m00 - x * this.m10) / det);
          return ptDst;
        case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
          x -= this.m02;
          y -= this.m12;
        case (AffineTransform.APPLY_SHEAR):
          if (this.m01 === 0 || this.m10 === 0) {
            throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is 0');
          }
          ptDst.setLocation$double$double(y / this.m10, x / this.m01);
          return ptDst;
        case (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
          x -= this.m02;
          y -= this.m12;
        case (AffineTransform.APPLY_SCALE):
          if (this.m00 === 0 || this.m11 === 0) {
            throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is 0');
          }
          ptDst.setLocation$double$double(x / this.m00, y / this.m11);
          return ptDst;
        case (AffineTransform.APPLY_TRANSLATE):
          ptDst.setLocation$double$double(x - this.m02, y - this.m12);
          return ptDst;
        case (AffineTransform.APPLY_IDENTITY):
          ptDst.setLocation$double$double(x, y);
          return ptDst;
      }
    }
  }
  /**
   * Inverse transforms an array of double precision coordinates by
   * this transform.
   * The two coordinate array sections can be exactly the same or
   * can be overlapping sections of the same array without affecting the
   * validity of the results.
   * This method ensures that no source coordinates are
   * overwritten by a previous operation before they can be transformed.
   * The coordinates are stored in the arrays starting at the specified
   * offset in the order {@code [x0, y0, x1, y1, ..., xn, yn]}.
   * @param srcPts the array containing the source point coordinates.
   * Each point is stored as a pair of x,&nbsp;y coordinates.
   * @param dstPts the array into which the transformed point
   * coordinates are returned.  Each point is stored as a pair of
   * x,&nbsp;y coordinates.
   * @param srcOff the offset to the first point to be transformed
   * in the source array
   * @param dstOff the offset to the location of the first
   * transformed point that is stored in the destination array
   * @param numPts the number of point objects to be transformed
   * @throws NoninvertibleTransformException  if the matrix cannot be
   *                                         inverted.
   * @since 1.2
   */
  inverseTransform$doubleArr$int$doubleArr$int$int(srcPts: number[], srcOff: number, dstPts: number[], dstOff: number, numPts: number): void {
    let M00: number;
    let M01: number;
    let M02: number;
    let M10: number;
    let M11: number;
    let M12: number;
    let det: number;
    if (dstPts === srcPts && dstOff > srcOff && dstOff < ((srcOff + Math.imul(numPts, 2)) | 0)) {
      $J.system_arraycopy(srcPts, srcOff, dstPts, dstOff, Math.imul(numPts, 2));
      srcOff = dstOff;
    }
    switch (this.state) {
      default:
        this.stateError();
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        M00 = this.m00;
        M01 = this.m01;
        M02 = this.m02;
        M10 = this.m10;
        M11 = this.m11;
        M12 = this.m12;
        det = M00 * M11 - M01 * M10;
        if (Math.abs(det) <= 4.9E-324) {
          throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is ' + $J.dstr(det));
        }
        while (--numPts >= 0) {
          let x = srcPts[srcOff++] - M02;
          let y = srcPts[srcOff++] - M12;
          dstPts[dstOff++] = (x * M11 - y * M01) / det;
          dstPts[dstOff++] = (y * M00 - x * M10) / det;
        }
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
        M00 = this.m00;
        M01 = this.m01;
        M10 = this.m10;
        M11 = this.m11;
        det = M00 * M11 - M01 * M10;
        if (Math.abs(det) <= 4.9E-324) {
          throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is ' + $J.dstr(det));
        }
        while (--numPts >= 0) {
          let x = srcPts[srcOff++];
          let y = srcPts[srcOff++];
          dstPts[dstOff++] = (x * M11 - y * M01) / det;
          dstPts[dstOff++] = (y * M00 - x * M10) / det;
        }
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
        M01 = this.m01;
        M02 = this.m02;
        M10 = this.m10;
        M12 = this.m12;
        if (M01 === 0 || M10 === 0) {
          throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is 0');
        }
        while (--numPts >= 0) {
          let x = srcPts[srcOff++] - M02;
          dstPts[dstOff++] = (srcPts[srcOff++] - M12) / M10;
          dstPts[dstOff++] = x / M01;
        }
        return;
      case (AffineTransform.APPLY_SHEAR):
        M01 = this.m01;
        M10 = this.m10;
        if (M01 === 0 || M10 === 0) {
          throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is 0');
        }
        while (--numPts >= 0) {
          let x = srcPts[srcOff++];
          dstPts[dstOff++] = srcPts[srcOff++] / M10;
          dstPts[dstOff++] = x / M01;
        }
        return;
      case (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
        M00 = this.m00;
        M02 = this.m02;
        M11 = this.m11;
        M12 = this.m12;
        if (M00 === 0 || M11 === 0) {
          throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is 0');
        }
        while (--numPts >= 0) {
          dstPts[dstOff++] = (srcPts[srcOff++] - M02) / M00;
          dstPts[dstOff++] = (srcPts[srcOff++] - M12) / M11;
        }
        return;
      case (AffineTransform.APPLY_SCALE):
        M00 = this.m00;
        M11 = this.m11;
        if (M00 === 0 || M11 === 0) {
          throw new NoninvertibleTransformException()._NoninvertibleTransformException('Determinant is 0');
        }
        while (--numPts >= 0) {
          dstPts[dstOff++] = srcPts[srcOff++] / M00;
          dstPts[dstOff++] = srcPts[srcOff++] / M11;
        }
        return;
      case (AffineTransform.APPLY_TRANSLATE):
        M02 = this.m02;
        M12 = this.m12;
        while (--numPts >= 0) {
          dstPts[dstOff++] = srcPts[srcOff++] - M02;
          dstPts[dstOff++] = srcPts[srcOff++] - M12;
        }
        return;
      case (AffineTransform.APPLY_IDENTITY):
        if (srcPts !== dstPts || srcOff !== dstOff) {
          $J.system_arraycopy(srcPts, srcOff, dstPts, dstOff, Math.imul(numPts, 2));
        }
        return;
    }
  }
  /**
   * Transforms the relative distance vector specified by
   * {@code ptSrc} and stores the result in {@code ptDst}.
   * A relative distance vector is transformed without applying the
   * translation components of the affine transformation matrix
   * using the following equations:
   * <pre>
   *  [  x' ]   [  m00  m01 (m02) ] [  x  ]   [ m00x + m01y ]
   *  [  y' ] = [  m10  m11 (m12) ] [  y  ] = [ m10x + m11y ]
   *  [ (1) ]   [  (0)  (0) ( 1 ) ] [ (1) ]   [     (1)     ]
   * </pre>
   * If {@code ptDst} is {@code null}, a new
   * {@code Point2D} object is allocated and then the result of the
   * transform is stored in this object.
   * In either case, {@code ptDst}, which contains the
   * transformed point, is returned for convenience.
   * If {@code ptSrc} and {@code ptDst} are the same object,
   * the input point is correctly overwritten with the transformed
   * point.
   * @param ptSrc the distance vector to be delta transformed
   * @param ptDst the resulting transformed distance vector
   * @return {@code ptDst}, which contains the result of the
   * transformation.
   * @since 1.2
   */
  deltaTransform$Point2D$Point2D(ptSrc: Point2D, ptDst: Point2D): Point2D {
    if (ptDst == null) {
      if (ptSrc instanceof Point2D$Double) {
        ptDst = new Point2D$Double()._Point2D$Double$();
      } else {
        ptDst = new Point2D$Float()._Point2D$Float$();
      }
    }
    let x = ptSrc.getX();
    let y = ptSrc.getY();
    switch (this.state) {
      default:
        this.stateError();
        return null;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
        ptDst.setLocation$double$double(x * this.m00 + y * this.m01, x * this.m10 + y * this.m11);
        return ptDst;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.APPLY_SHEAR):
        ptDst.setLocation$double$double(y * this.m01, x * this.m10);
        return ptDst;
      case (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.APPLY_SCALE):
        ptDst.setLocation$double$double(x * this.m00, y * this.m11);
        return ptDst;
      case (AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.APPLY_IDENTITY):
        ptDst.setLocation$double$double(x, y);
        return ptDst;
    }
  }
  /**
   * Transforms an array of relative distance vectors by this
   * transform.
   * A relative distance vector is transformed without applying the
   * translation components of the affine transformation matrix
   * using the following equations:
   * <pre>
   *  [  x' ]   [  m00  m01 (m02) ] [  x  ]   [ m00x + m01y ]
   *  [  y' ] = [  m10  m11 (m12) ] [  y  ] = [ m10x + m11y ]
   *  [ (1) ]   [  (0)  (0) ( 1 ) ] [ (1) ]   [     (1)     ]
   * </pre>
   * The two coordinate array sections can be exactly the same or
   * can be overlapping sections of the same array without affecting the
   * validity of the results.
   * This method ensures that no source coordinates are
   * overwritten by a previous operation before they can be transformed.
   * The coordinates are stored in the arrays starting at the indicated
   * offset in the order {@code [x0, y0, x1, y1, ..., xn, yn]}.
   * @param srcPts the array containing the source distance vectors.
   * Each vector is stored as a pair of relative x,&nbsp;y coordinates.
   * @param dstPts the array into which the transformed distance vectors
   * are returned.  Each vector is stored as a pair of relative
   * x,&nbsp;y coordinates.
   * @param srcOff the offset to the first vector to be transformed
   * in the source array
   * @param dstOff the offset to the location of the first
   * transformed vector that is stored in the destination array
   * @param numPts the number of vector coordinate pairs to be
   * transformed
   * @since 1.2
   */
  deltaTransform$doubleArr$int$doubleArr$int$int(srcPts: number[], srcOff: number, dstPts: number[], dstOff: number, numPts: number): void {
    let M00: number;
    let M01: number;
    let M10: number;
    let M11: number;
    if (dstPts === srcPts && dstOff > srcOff && dstOff < ((srcOff + Math.imul(numPts, 2)) | 0)) {
      $J.system_arraycopy(srcPts, srcOff, dstPts, dstOff, Math.imul(numPts, 2));
      srcOff = dstOff;
    }
    switch (this.state) {
      default:
        this.stateError();
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE):
        M00 = this.m00;
        M01 = this.m01;
        M10 = this.m10;
        M11 = this.m11;
        while (--numPts >= 0) {
          let x = srcPts[srcOff++];
          let y = srcPts[srcOff++];
          dstPts[dstOff++] = x * M00 + y * M01;
          dstPts[dstOff++] = x * M10 + y * M11;
        }
        return;
      case (AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.APPLY_SHEAR):
        M01 = this.m01;
        M10 = this.m10;
        while (--numPts >= 0) {
          let x = srcPts[srcOff++];
          dstPts[dstOff++] = srcPts[srcOff++] * M01;
          dstPts[dstOff++] = x * M10;
        }
        return;
      case (AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.APPLY_SCALE):
        M00 = this.m00;
        M11 = this.m11;
        while (--numPts >= 0) {
          dstPts[dstOff++] = srcPts[srcOff++] * M00;
          dstPts[dstOff++] = srcPts[srcOff++] * M11;
        }
        return;
      case (AffineTransform.APPLY_TRANSLATE):
      case (AffineTransform.APPLY_IDENTITY):
        if (srcPts !== dstPts || srcOff !== dstOff) {
          $J.system_arraycopy(srcPts, srcOff, dstPts, dstOff, Math.imul(numPts, 2));
        }
        return;
    }
  }
  /**
   * Returns a new {@link Shape} object defined by the geometry of the
   * specified {@code Shape} after it has been transformed by
   * this transform.
   * @param pSrc the specified {@code Shape} object to be
   * transformed by this transform.
   * @return a new {@code Shape} object that defines the geometry
   * of the transformed {@code Shape}, or null if {@code pSrc} is null.
   * @since 1.2
   */
  createTransformedShape(pSrc: Shape): Shape {
    if (pSrc == null) {
      return null;
    }
    return new Path2D$Double()._Path2D$Double$Shape$AffineTransform(pSrc, this);
  }
  static _matround(matval: number): number {
    return $J.rint(matval * 1E15) / 1E15;
  }
  /**
   * Returns a {@code String} that represents the value of this
   * {@link Object}.
   * @return a {@code String} representing the value of this
   * {@code Object}.
   * @since 1.2
   */
  toString(): string {
    return ('AffineTransform[[' + $J.dstr(AffineTransform._matround(this.m00)) + ', ' + $J.dstr(AffineTransform._matround(this.m01)) + ', ' + $J.dstr(AffineTransform._matround(this.m02)) + '], [' + $J.dstr(AffineTransform._matround(this.m10)) + ', ' + $J.dstr(AffineTransform._matround(this.m11)) + ', ' + $J.dstr(AffineTransform._matround(this.m12)) + ']]');
  }
  /**
   * Returns {@code true} if this {@code AffineTransform} is
   * an identity transform.
   * @return {@code true} if this {@code AffineTransform} is
   * an identity transform; {@code false} otherwise.
   * @since 1.2
   */
  isIdentity(): boolean {
    return (this.state === AffineTransform.APPLY_IDENTITY || (this.getType() === AffineTransform.TYPE_IDENTITY));
  }
  /**
   * Returns a copy of this {@code AffineTransform} object.
   * @return an {@code Object} that is a copy of this
   * {@code AffineTransform} object.
   * @since 1.2
   */
  clone(): any {
    try {
      return super.clone();
    } catch ($e0) {
      if ($J.isa($e0, CloneNotSupportedException)) {
        let e = $J.exc($e0);
        throw new InternalError(e);
      } else {
        throw $e0;
      }
    }
  }
  /**
   * Returns the hashcode for this transform.
   * @return      a hash code for this transform.
   * @since 1.2
   */
  hashCode(): number {
    let bits = AffineTransform.hash(this.m00);
    bits = bits * 31 + AffineTransform.hash(this.m01);
    bits = bits * 31 + AffineTransform.hash(this.m02);
    bits = bits * 31 + AffineTransform.hash(this.m10);
    bits = bits * 31 + AffineTransform.hash(this.m11);
    bits = bits * 31 + AffineTransform.hash(this.m12);
    return (((bits) | 0) ^ ((($J.lshr(bits, 32))) | 0));
  }
  /**
   * Returns a hash code for the given value, with negative zero
   * collapsed to the single positive zero.
   */
  static hash(m: number): number {
    let h = $J.Double_doubleToLongBits(m);
    if (h === -9223372036854775808) {
      h = 0;
    }
    return h;
  }
  /**
   * Returns {@code true} if this {@code AffineTransform}
   * represents the same affine coordinate transform as the specified
   * argument.
   * @param obj the {@code Object} to test for equality with this
   * {@code AffineTransform}
   * @return {@code true} if {@code obj} equals this
   * {@code AffineTransform} object; {@code false} otherwise.
   * @since 1.2
   */
  equals(obj: any): boolean {
    if (!(obj instanceof AffineTransform)) {
      return false;
    }
    let a = obj;
    return AffineTransform.equals(this.m00, a.m00) && AffineTransform.equals(this.m01, a.m01) && AffineTransform.equals(this.m02, a.m02) && AffineTransform.equals(this.m10, a.m10) && AffineTransform.equals(this.m11, a.m11) && AffineTransform.equals(this.m12, a.m12);
  }
  /**
   * Compares the given floating point values, with negative zero
   * considered equals to positive zero.
   */
  static equals(a: number, b: number): boolean {
    return (a === b) || ($J.Double_isNaN(a) && $J.Double_isNaN(b));
  }
  /**
   * Writes default serializable fields to stream.
   *
   * @param  s the {@code ObjectOutputStream} to write
   * @throws IOException if an I/O error occurs
   */
  writeObject(s: ObjectOutputStream): void {
    s.defaultWriteObject();
  }
  /**
   * Reads the {@code ObjectInputStream}.
   *
   * @param  s the {@code ObjectInputStream} to read
   * @throws ClassNotFoundException if the class of a serialized object could
   *         not be found
   * @throws IOException if an I/O error occurs
   */
  readObject(s: ObjectInputStream): void {
    s.defaultReadObject();
    this.updateState();
  }
  static $clinit() {
    AffineTransform.rot90conversion = [AffineTransform.APPLY_SHEAR, AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE, AffineTransform.APPLY_SHEAR, AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_TRANSLATE, AffineTransform.APPLY_SCALE, AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE, AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE, AffineTransform.APPLY_SHEAR | AffineTransform.APPLY_SCALE | AffineTransform.APPLY_TRANSLATE];
  }
}

$J.define(AffineTransform, 'java.awt.geom.AffineTransform', { kind: 'class', ifaces: ['java.lang.Cloneable', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'double[]': '_AffineTransform$doubleArr', 'double,double,double,double,double,double': '_AffineTransform$double$double$double$double$double$double', 'float[]': '_AffineTransform$floatArr', 'float,float,float,float,float,float': '_AffineTransform$float$float$float$float$float$float', 'java.awt.geom.AffineTransform': '_AffineTransform$AffineTransform', '': '_AffineTransform$', 'double,double,double,double,double,double,int': '_AffineTransform$double$double$double$double$double$double$int' }, meths: { 'deltaTransform(double[],int,double[],int,int)': 'deltaTransform$doubleArr$int$doubleArr$int$int', 'deltaTransform(java.awt.geom.Point2D,java.awt.geom.Point2D)': 'deltaTransform$Point2D$Point2D', 'inverseTransform(double[],int,double[],int,int)': 'inverseTransform$doubleArr$int$doubleArr$int$int', 'inverseTransform(java.awt.geom.Point2D,java.awt.geom.Point2D)': 'inverseTransform$Point2D$Point2D', 'transform(double[],int,float[],int,int)': 'transform$doubleArr$int$floatArr$int$int', 'transform(float[],int,double[],int,int)': 'transform$floatArr$int$doubleArr$int$int', 'transform(double[],int,double[],int,int)': 'transform$doubleArr$int$doubleArr$int$int', 'transform(float[],int,float[],int,int)': 'transform$floatArr$int$floatArr$int$int', 'transform(java.awt.geom.Point2D[],int,java.awt.geom.Point2D[],int,int)': 'transform$Point2DArr$int$Point2DArr$int$int', 'transform(java.awt.geom.Point2D,java.awt.geom.Point2D)': 'transform$Point2D$Point2D', 'setTransform(double,double,double,double,double,double)': 'setTransform$double$double$double$double$double$double', 'setTransform(java.awt.geom.AffineTransform)': 'setTransform$AffineTransform', 'setToQuadrantRotation(int,double,double)': 'setToQuadrantRotation$int$double$double', 'setToQuadrantRotation(int)': 'setToQuadrantRotation$int', 'setToRotation(double,double,double,double)': 'setToRotation$double$double$double$double', 'setToRotation(double,double)': 'setToRotation$double$double', 'setToRotation(double,double,double)': 'setToRotation$double$double$double', 'setToRotation(double)': 'setToRotation$double', 'quadrantRotate(int,double,double)': 'quadrantRotate$int$double$double', 'quadrantRotate(int)': 'quadrantRotate$int', 'rotate(double,double,double,double)': 'rotate$double$double$double$double', 'rotate(double,double)': 'rotate$double$double', 'rotate(double,double,double)': 'rotate$double$double$double', 'rotate(double)': 'rotate$double', 'getQuadrantRotateInstance(int,double,double)': 'getQuadrantRotateInstance$int$double$double', 'getQuadrantRotateInstance(int)': 'getQuadrantRotateInstance$int', 'getRotateInstance(double,double,double,double)': 'getRotateInstance$double$double$double$double', 'getRotateInstance(double,double)': 'getRotateInstance$double$double', 'getRotateInstance(double,double,double)': 'getRotateInstance$double$double$double', 'getRotateInstance(double)': 'getRotateInstance$double' }, clinit: true, lazy: ['rot90conversion'] });
$J.module(() => {
  NoninvertibleTransformException = $J.load('java.awt.geom.NoninvertibleTransformException');
  Path2D$Double = $J.load('java.awt.geom.Path2D$Double');
  Point2D$Double = $J.load('java.awt.geom.Point2D$Double');
  Point2D$Float = $J.load('java.awt.geom.Point2D$Float');
});
