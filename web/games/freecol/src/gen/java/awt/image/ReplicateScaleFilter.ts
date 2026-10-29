// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/ReplicateScaleFilter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException } from '../../../../jre/index.ts';
import { ImageFilter } from './ImageFilter.ts';

/**
 * An ImageFilter class for scaling images using the simplest algorithm.
 * This class extends the basic ImageFilter Class to scale an existing
 * image and provide a source for a new image containing the resampled
 * image.  The pixels in the source image are sampled to produce pixels
 * for an image of the specified size by replicating rows and columns of
 * pixels to scale up or omitting rows and columns of pixels to scale
 * down.
 * <p>It is meant to be used in conjunction with a FilteredImageSource
 * object to produce scaled versions of existing images.  Due to
 * implementation dependencies, there may be differences in pixel values
 * of an image filtered on different platforms.
 *
 * @see FilteredImageSource
 * @see ImageFilter
 *
 * @author      Jim Graham
 */
export class ReplicateScaleFilter extends ImageFilter {
  /**
   * The width of the source image.
   */
  srcWidth: number = 0;
  /**
   * The height of the source image.
   */
  srcHeight: number = 0;
  /**
   * The target width to scale the image.
   */
  destWidth: number = 0;
  /**
   * The target height to scale the image.
   */
  destHeight: number = 0;
  /**
   * An {@code int} array containing information about a
   * row of pixels.
   */
  srcrows: number[] = null;
  /**
   * An {@code int} array containing information about a
   * column of pixels.
   */
  srccols: number[] = null;
  /**
   * A {@code byte} array initialized with a size of
   * {@link #destWidth} and used to deliver a row of pixel
   * data to the {@link ImageConsumer}.
   */
  outpixbuf: any = null;
  /**
   * Constructs a ReplicateScaleFilter that scales the pixels from
   * its source Image as specified by the width and height parameters.
   * @param width the target width to scale the image
   * @param height the target height to scale the image
   * @throws IllegalArgumentException if {@code width} equals
   *         zero or {@code height} equals zero
   */
  _ReplicateScaleFilter(width: number, height: number): this {
    this._ImageFilter();
    if (width === 0 || height === 0) {
      throw new IllegalArgumentException('Width (' + width + ') and height (' + height + ') must be non-zero');
    }
    this.destWidth = width;
    this.destHeight = height;
    return this;
  }
}

$J.define(ReplicateScaleFilter, 'java.awt.image.ReplicateScaleFilter', { kind: 'class', sup: 'java.awt.image.ImageFilter', ctors: { 'int,int': '_ReplicateScaleFilter' }, meths: { 'setPixels(int,int,int,int,java.awt.image.ColorModel,int[],int,int)': 'setPixels$int$int$int$int$ColorModel$intArr$int$int', 'setPixels(int,int,int,int,java.awt.image.ColorModel,byte[],int,int)': 'setPixels$int$int$int$int$ColorModel$byteArr$int$int' } });
