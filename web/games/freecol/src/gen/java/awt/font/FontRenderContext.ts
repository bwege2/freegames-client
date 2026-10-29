// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/font/FontRenderContext.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2013, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ClassCastException, Exception, IllegalArgumentException, JObject } from '../../../../jre/index.ts';

let RenderingHints, AffineTransform;

/**
 * The {@code FontRenderContext} class is a container for the
 *   information needed to correctly measure text.  The measurement of text
 *   can vary because of rules that map outlines to pixels, and rendering
 *   hints provided by an application.
 *   <p>
 *   One such piece of information is a transform that scales
 *   typographical points to pixels. (A point is defined to be exactly 1/72
 *   of an inch, which is slightly different than
 *   the traditional mechanical measurement of a point.)  A character that
 *   is rendered at 12pt on a 600dpi device might have a different size
 *   than the same character rendered at 12pt on a 72dpi device because of
 *   such factors as rounding to pixel boundaries and hints that the font
 *   designer may have specified.
 *   <p>
 *   Anti-aliasing and Fractional-metrics specified by an application can also
 *   affect the size of a character because of rounding to pixel
 *   boundaries.
 *   <p>
 *   Typically, instances of {@code FontRenderContext} are
 *   obtained from a {@link java.awt.Graphics2D Graphics2D} object.  A
 *   {@code FontRenderContext} which is directly constructed will
 *   most likely not represent any actual graphics device, and may lead
 *   to unexpected or incorrect results.
 *   @see java.awt.RenderingHints#KEY_TEXT_ANTIALIASING
 *   @see java.awt.RenderingHints#KEY_FRACTIONALMETRICS
 *   @see java.awt.Graphics2D#getFontRenderContext()
 *   @see java.awt.font.LineMetrics
 */
export class FontRenderContext extends JObject {
  tx: AffineTransform = null;
  aaHintValue: any = null;
  fmHintValue: any = null;
  defaulting: boolean = false;
  /**
   * Constructs a new {@code FontRenderContext}
   * object.
   */
  _FontRenderContext$(): this {
    this.aaHintValue = RenderingHints.VALUE_TEXT_ANTIALIAS_DEFAULT;
    this.fmHintValue = RenderingHints.VALUE_FRACTIONALMETRICS_DEFAULT;
    this.defaulting = true;
    return this;
  }
  /**
   * Constructs a {@code FontRenderContext} object from an
   * optional {@link AffineTransform} and two {@code boolean}
   * values that determine if the newly constructed object has
   * anti-aliasing or fractional metrics.
   * In each case the boolean values {@code true} and {@code false}
   * correspond to the rendering hint values {@code ON} and
   * {@code OFF} respectively.
   * <p>
   * To specify other hint values, use the constructor which
   * specifies the rendering hint values as parameters :
   * {@link #FontRenderContext(AffineTransform, Object, Object)}.
   * @param tx the transform which is used to scale typographical points
   * to pixels in this {@code FontRenderContext}.  If null, an
   * identity transform is used.
   * @param isAntiAliased determines if the newly constructed object
   * has anti-aliasing.
   * @param usesFractionalMetrics determines if the newly constructed
   * object has fractional metrics.
   */
  _FontRenderContext$AffineTransform$boolean$boolean(tx: AffineTransform, isAntiAliased: boolean, usesFractionalMetrics: boolean): this {
    if (tx != null && !tx.isIdentity()) {
      this.tx = new AffineTransform()._AffineTransform$AffineTransform(tx);
    }
    if (isAntiAliased) {
      this.aaHintValue = RenderingHints.VALUE_TEXT_ANTIALIAS_ON;
    } else {
      this.aaHintValue = RenderingHints.VALUE_TEXT_ANTIALIAS_OFF;
    }
    if (usesFractionalMetrics) {
      this.fmHintValue = RenderingHints.VALUE_FRACTIONALMETRICS_ON;
    } else {
      this.fmHintValue = RenderingHints.VALUE_FRACTIONALMETRICS_OFF;
    }
    return this;
  }
  /**
   * Constructs a {@code FontRenderContext} object from an
   * optional {@link AffineTransform} and two {@code Object}
   * values that determine if the newly constructed object has
   * anti-aliasing or fractional metrics.
   * @param tx the transform which is used to scale typographical points
   * to pixels in this {@code FontRenderContext}.  If null, an
   * identity transform is used.
   * @param aaHint one of the text antialiasing rendering hint values
   * defined in {@link java.awt.RenderingHints java.awt.RenderingHints}.
   * Any other value will throw {@code IllegalArgumentException}.
   * {@link java.awt.RenderingHints#VALUE_TEXT_ANTIALIAS_DEFAULT VALUE_TEXT_ANTIALIAS_DEFAULT}
   * may be specified, in which case the mode used is implementation
   * dependent.
   * @param fmHint one of the text fractional rendering hint values defined
   * in {@link java.awt.RenderingHints java.awt.RenderingHints}.
   * {@link java.awt.RenderingHints#VALUE_FRACTIONALMETRICS_DEFAULT VALUE_FRACTIONALMETRICS_DEFAULT}
   * may be specified, in which case the mode used is implementation
   * dependent.
   * Any other value will throw {@code IllegalArgumentException}
   * @throws IllegalArgumentException if the hints are not one of the
   * legal values.
   * @since 1.6
   */
  _FontRenderContext$AffineTransform$Object$Object(tx: AffineTransform, aaHint: any, fmHint: any): this {
    if (tx != null && !tx.isIdentity()) {
      this.tx = new AffineTransform()._AffineTransform$AffineTransform(tx);
    }
    try {
      if (RenderingHints.KEY_TEXT_ANTIALIASING.isCompatibleValue(aaHint)) {
        this.aaHintValue = aaHint;
      } else {
        throw new IllegalArgumentException('AA hint:' + $J.str(aaHint));
      }
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        throw new IllegalArgumentException('AA hint:' + $J.str(aaHint));
      } else {
        throw $e0;
      }
    }
    try {
      if (RenderingHints.KEY_FRACTIONALMETRICS.isCompatibleValue(fmHint)) {
        this.fmHintValue = fmHint;
      } else {
        throw new IllegalArgumentException('FM hint:' + $J.str(fmHint));
      }
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        throw new IllegalArgumentException('FM hint:' + $J.str(fmHint));
      } else {
        throw $e1;
      }
    }
    return this;
  }
  /**
   * Indicates whether or not this {@code FontRenderContext} object
   * measures text in a transformed render context.
   * @return  {@code true} if this {@code FontRenderContext}
   *          object has a non-identity AffineTransform attribute.
   *          {@code false} otherwise.
   * @see     java.awt.font.FontRenderContext#getTransform
   * @since   1.6
   */
  isTransformed(): boolean {
    if (!this.defaulting) {
      return this.tx != null;
    } else {
      return !this.getTransform().isIdentity();
    }
  }
  /**
   * Returns the integer type of the affine transform for this
   * {@code FontRenderContext} as specified by
   * {@link java.awt.geom.AffineTransform#getType()}
   * @return the type of the transform.
   * @see AffineTransform
   * @since 1.6
   */
  getTransformType(): number {
    if (!this.defaulting) {
      if (this.tx == null) {
        return AffineTransform.TYPE_IDENTITY;
      } else {
        return this.tx.getType();
      }
    } else {
      return this.getTransform().getType();
    }
  }
  /**
   * Gets the transform that is used to scale typographical points
   *   to pixels in this {@code FontRenderContext}.
   *   @return the {@code AffineTransform} of this
   *    {@code FontRenderContext}.
   *   @see AffineTransform
   */
  getTransform(): AffineTransform {
    return (this.tx == null) ? new AffineTransform()._AffineTransform$() : new AffineTransform()._AffineTransform$AffineTransform(this.tx);
  }
  /**
   * Returns a boolean which indicates whether or not some form of
   * antialiasing is specified by this {@code FontRenderContext}.
   * Call {@link #getAntiAliasingHint() getAntiAliasingHint()}
   * for the specific rendering hint value.
   *   @return    {@code true}, if text is anti-aliased in this
   *   {@code FontRenderContext}; {@code false} otherwise.
   *   @see        java.awt.RenderingHints#KEY_TEXT_ANTIALIASING
   *   @see #FontRenderContext(AffineTransform,boolean,boolean)
   *   @see #FontRenderContext(AffineTransform,Object,Object)
   */
  isAntiAliased(): boolean {
    return !(this.aaHintValue === RenderingHints.VALUE_TEXT_ANTIALIAS_OFF || this.aaHintValue === RenderingHints.VALUE_TEXT_ANTIALIAS_DEFAULT);
  }
  /**
   * Returns a boolean which whether text fractional metrics mode
   * is used in this {@code FontRenderContext}.
   * Call {@link #getFractionalMetricsHint() getFractionalMetricsHint()}
   * to obtain the corresponding rendering hint value.
   *   @return    {@code true}, if layout should be performed with
   *   fractional metrics; {@code false} otherwise.
   *               in this {@code FontRenderContext}.
   *   @see java.awt.RenderingHints#KEY_FRACTIONALMETRICS
   *   @see #FontRenderContext(AffineTransform,boolean,boolean)
   *   @see #FontRenderContext(AffineTransform,Object,Object)
   */
  usesFractionalMetrics(): boolean {
    return !(this.fmHintValue === RenderingHints.VALUE_FRACTIONALMETRICS_OFF || this.fmHintValue === RenderingHints.VALUE_FRACTIONALMETRICS_DEFAULT);
  }
  /**
   * Return the text anti-aliasing rendering mode hint used in this
   * {@code FontRenderContext}.
   * This will be one of the text antialiasing rendering hint values
   * defined in {@link java.awt.RenderingHints java.awt.RenderingHints}.
   * @return  text anti-aliasing rendering mode hint used in this
   * {@code FontRenderContext}.
   * @since 1.6
   */
  getAntiAliasingHint(): any {
    if (this.defaulting) {
      if (this.isAntiAliased()) {
        return RenderingHints.VALUE_TEXT_ANTIALIAS_ON;
      } else {
        return RenderingHints.VALUE_TEXT_ANTIALIAS_OFF;
      }
    }
    return this.aaHintValue;
  }
  /**
   * Return the text fractional metrics rendering mode hint used in this
   * {@code FontRenderContext}.
   * This will be one of the text fractional metrics rendering hint values
   * defined in {@link java.awt.RenderingHints java.awt.RenderingHints}.
   * @return the text fractional metrics rendering mode hint used in this
   * {@code FontRenderContext}.
   * @since 1.6
   */
  getFractionalMetricsHint(): any {
    if (this.defaulting) {
      if (this.usesFractionalMetrics()) {
        return RenderingHints.VALUE_FRACTIONALMETRICS_ON;
      } else {
        return RenderingHints.VALUE_FRACTIONALMETRICS_OFF;
      }
    }
    return this.fmHintValue;
  }
  /**
   * Return true if obj is an instance of FontRenderContext and has the same
   * transform, antialiasing, and fractional metrics values as this.
   * @param obj the object to test for equality
   * @return {@code true} if the specified object is equal to
   *         this {@code FontRenderContext}; {@code false}
   *         otherwise.
   */
  equals(obj: any): boolean {
    try {
      return this.equals$FontRenderContext(obj);
    } catch ($e2) {
      if ($J.isa($e2, ClassCastException)) {
        let e = $J.exc($e2);
        return false;
      } else {
        throw $e2;
      }
    }
  }
  /**
   * Return true if rhs has the same transform, antialiasing,
   * and fractional metrics values as this.
   * @param rhs the {@code FontRenderContext} to test for equality
   * @return {@code true} if {@code rhs} is equal to
   *         this {@code FontRenderContext}; {@code false}
   *         otherwise.
   * @since 1.4
   */
  equals$FontRenderContext(rhs: FontRenderContext): boolean {
    if (this === rhs) {
      return true;
    }
    if (rhs == null) {
      return false;
    }
    if (!rhs.defaulting && !this.defaulting) {
      if (rhs.aaHintValue === this.aaHintValue && rhs.fmHintValue === this.fmHintValue) {
        return this.tx == null ? rhs.tx == null : this.tx.equals(rhs.tx);
      }
      return false;
    } else {
      return rhs.getAntiAliasingHint() === this.getAntiAliasingHint() && rhs.getFractionalMetricsHint() === this.getFractionalMetricsHint() && rhs.getTransform().equals(this.getTransform());
    }
  }
  /**
   * Return a hashcode for this FontRenderContext.
   */
  hashCode(): number {
    let hash = this.tx == null ? 0 : this.tx.hashCode();
    if (this.defaulting) {
      hash = (hash + $J.hashCode(this.getAntiAliasingHint())) | 0;
      hash = (hash + $J.hashCode(this.getFractionalMetricsHint())) | 0;
    } else {
      hash = (hash + $J.hashCode(this.aaHintValue)) | 0;
      hash = (hash + $J.hashCode(this.fmHintValue)) | 0;
    }
    return hash;
  }
}

$J.define(FontRenderContext, 'java.awt.font.FontRenderContext', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.awt.geom.AffineTransform,java.lang.Object,java.lang.Object': '_FontRenderContext$AffineTransform$Object$Object', 'java.awt.geom.AffineTransform,boolean,boolean': '_FontRenderContext$AffineTransform$boolean$boolean', '': '_FontRenderContext$' }, meths: { 'equals(java.awt.font.FontRenderContext)': 'equals$FontRenderContext' } });
$J.module(() => {
  RenderingHints = $J.load('java.awt.RenderingHints');
  AffineTransform = $J.load('java.awt.geom.AffineTransform');
});
