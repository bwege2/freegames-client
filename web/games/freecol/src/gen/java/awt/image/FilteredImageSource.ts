// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/FilteredImageSource.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2017, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../../jre/index.ts';

/**
 * This class is an implementation of the ImageProducer interface which
 * takes an existing image and a filter object and uses them to produce
 * image data for a new filtered version of the original image. Furthermore,
 * {@code FilteredImageSource} is safe for use by multiple threads.
 * Here is an example which filters an image by swapping the red and
 * blue components:
 * <pre>
 *
 *      Image src = getImage("doc:///demo/images/duke/T1.gif");
 *      ImageFilter colorfilter = new RedBlueSwapFilter();
 *      Image img = createImage(new FilteredImageSource(src.getSource(),
 *                                                      colorfilter));
 *
 * </pre>
 *
 * @see ImageProducer
 *
 * @author      Jim Graham
 */
export class FilteredImageSource extends JObject {
  src: ImageProducer = null;
  filter_: ImageFilter = null;
  proxies: Hashtable<ImageConsumer, ImageFilter> = null;
  /**
   * Constructs an ImageProducer object from an existing ImageProducer
   * and a filter object.
   * @param orig the specified {@code ImageProducer}
   * @param imgf the specified {@code ImageFilter}
   * @see ImageFilter
   * @see java.awt.Component#createImage
   */
  _FilteredImageSource(orig: ImageProducer, imgf: ImageFilter): this {
    this.src = orig;
    this.filter_ = imgf;
    return this;
  }
}

$J.define(FilteredImageSource, 'java.awt.image.FilteredImageSource', { kind: 'class', ifaces: ['java.awt.image.ImageProducer'], sup: 'java.lang.Object', ctors: { 'java.awt.image.ImageProducer,java.awt.image.ImageFilter': '_FilteredImageSource' } });
