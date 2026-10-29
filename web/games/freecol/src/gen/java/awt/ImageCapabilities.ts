// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/ImageCapabilities.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2011, Oracle and/or its affiliates. All rights reserved.
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
import { $J, CloneNotSupportedException, InternalError, JObject } from '../../../jre/index.ts';

/**
 * Capabilities and properties of images.
 * @author Michael Martak
 * @since 1.4
 */
export class ImageCapabilities extends JObject {
  accelerated: boolean = false;
  /**
   * Creates a new object for specifying image capabilities.
   * @param accelerated whether or not an accelerated image is desired
   */
  _ImageCapabilities(accelerated: boolean): this {
    this.accelerated = false;
    this.accelerated = accelerated;
    return this;
  }
  /**
   * Returns {@code true} if the object whose capabilities are
   * encapsulated in this {@code ImageCapabilities} can be or is
   * accelerated.
   * @return whether or not an image can be, or is, accelerated.  There are
   * various platform-specific ways to accelerate an image, including
   * pixmaps, VRAM, AGP.  This is the general acceleration method (as
   * opposed to residing in system memory).
   */
  isAccelerated(): boolean {
    return this.accelerated;
  }
  /**
   * @return a copy of this ImageCapabilities object.
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
}

$J.define(ImageCapabilities, 'java.awt.ImageCapabilities', { kind: 'class', ifaces: ['java.lang.Cloneable'], sup: 'java.lang.Object', ctors: { 'boolean': '_ImageCapabilities' } });
