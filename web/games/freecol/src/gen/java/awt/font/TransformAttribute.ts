// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/font/TransformAttribute.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ClassCastException, JObject } from '../../../../jre/index.ts';

let AffineTransform;

/**
 * The {@code TransformAttribute} class provides an immutable
 * wrapper for a transform so that it is safe to use as an attribute.
 */
export class TransformAttribute extends JObject {
  /**
   * The {@code AffineTransform} for this
   * {@code TransformAttribute}, or {@code null}
   * if {@code AffineTransform} is the identity transform.
   */
  transform_: AffineTransform = null;
  /**
   * A {@code TransformAttribute} representing the identity transform.
   * @since 1.6
   */
  static IDENTITY: TransformAttribute = null;
  /**
   * Wraps the specified transform.  The transform is cloned and a
   * reference to the clone is kept.  The original transform is unchanged.
   * If null is passed as the argument, this constructor behaves as though
   * it were the identity transform.  (Note that it is preferable to use
   * {@link #IDENTITY} in this case.)
   * @param transform the specified {@link AffineTransform} to be wrapped,
   * or null.
   */
  _TransformAttribute(transform: AffineTransform): this {
    if (transform != null && !transform.isIdentity()) {
      this.transform_ = new AffineTransform()._AffineTransform$AffineTransform(transform);
    }
    return this;
  }
  /**
   * Returns a copy of the wrapped transform.
   * @return an {@code AffineTransform} that is a copy of the wrapped
   * transform of this {@code TransformAttribute}.
   */
  getTransform(): AffineTransform {
    let at = this.transform_;
    return (at == null) ? new AffineTransform()._AffineTransform$() : new AffineTransform()._AffineTransform$AffineTransform(at);
  }
  /**
   * Returns {@code true} if the wrapped transform is
   * an identity transform.
   * @return {@code true} if the wrapped transform is
   * an identity transform; {@code false} otherwise.
   * @since 1.4
   */
  isIdentity(): boolean {
    return this.transform_ == null;
  }
  /**
   * @since 1.6
   */
  hashCode(): number {
    return this.transform_ == null ? 0 : this.transform_.hashCode();
  }
  /**
   * Returns {@code true} if rhs is a {@code TransformAttribute}
   * whose transform is equal to this {@code TransformAttribute}'s
   * transform.
   * @param rhs the object to compare to
   * @return {@code true} if the argument is a {@code TransformAttribute}
   * whose transform is equal to this {@code TransformAttribute}'s
   * transform.
   * @since 1.6
   */
  equals(rhs: any): boolean {
    if (rhs != null) {
      try {
        let that = rhs;
        if (this.transform_ == null) {
          return that.transform_ == null;
        }
        return this.transform_.equals(that.transform_);
      } catch ($e0) {
        if ($J.isa($e0, ClassCastException)) {
          let e = $J.exc($e0);
        } else {
          throw $e0;
        }
      }
    }
    return false;
  }
  static $clinit() {
    TransformAttribute.IDENTITY = new TransformAttribute()._TransformAttribute(null);
  }
}

$J.define(TransformAttribute, 'java.awt.font.TransformAttribute', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'java.awt.geom.AffineTransform': '_TransformAttribute' }, clinit: true, lazy: ['IDENTITY'] });
$J.module(() => {
  AffineTransform = $J.load('java.awt.geom.AffineTransform');
});
