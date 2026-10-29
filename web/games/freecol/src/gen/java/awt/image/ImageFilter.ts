// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/ImageFilter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2020, Oracle and/or its affiliates. All rights reserved.
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

/**
 * This class implements a filter for the set of interface methods that
 * are used to deliver data from an ImageProducer to an ImageConsumer.
 * It is meant to be used in conjunction with a FilteredImageSource
 * object to produce filtered versions of existing images.  It is a
 * base class that provides the calls needed to implement a "Null filter"
 * which has no effect on the data being passed through.  Filters should
 * subclass this class and override the methods which deal with the
 * data that needs to be filtered and modify it as necessary.
 *
 * @see FilteredImageSource
 * @see ImageConsumer
 *
 * @author      Jim Graham
 */
export class ImageFilter extends JObject {
  /**
   * The consumer of the particular image data stream for which this
   * instance of the ImageFilter is filtering data.  It is not
   * initialized during the constructor, but rather during the
   * getFilterInstance() method call when the FilteredImageSource
   * is creating a unique instance of this object for a particular
   * image data stream.
   * @see #getFilterInstance
   * @see ImageConsumer
   */
  consumer: ImageConsumer = null;
  /**
   * Constructs an {@code ImageFilter}.
   */
  _ImageFilter(): this {
    return this;
  }
  /**
   * Clones this object.
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

$J.define(ImageFilter, 'java.awt.image.ImageFilter', { kind: 'class', ifaces: ['java.awt.image.ImageConsumer', 'java.lang.Cloneable'], sup: 'java.lang.Object', ctors: { '': '_ImageFilter' }, meths: { 'setPixels(int,int,int,int,java.awt.image.ColorModel,int[],int,int)': 'setPixels$int$int$int$int$ColorModel$intArr$int$int', 'setPixels(int,int,int,int,java.awt.image.ColorModel,byte[],int,int)': 'setPixels$int$int$int$int$ColorModel$byteArr$int$int' } });
