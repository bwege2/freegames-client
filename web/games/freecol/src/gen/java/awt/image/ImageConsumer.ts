// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/ImageConsumer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2018, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../../jre/index.ts';

/**
 * The interface for objects expressing interest in image data through
 * the ImageProducer interfaces.  When a consumer is added to an image
 * producer, the producer delivers all of the data about the image
 * using the method calls defined in this interface.
 *
 * @see ImageProducer
 *
 * @author      Jim Graham
 */
export class ImageConsumer {
  /**
   * The pixels will be delivered in a random order.  This tells the
   * ImageConsumer not to use any optimizations that depend on the
   * order of pixel delivery, which should be the default assumption
   * in the absence of any call to the setHints method.
   * @see #setHints
   */
  static readonly RANDOMPIXELORDER: number = 1;
  /**
   * The pixels will be delivered in top-down, left-to-right order.
   * @see #setHints
   */
  static readonly TOPDOWNLEFTRIGHT: number = 2;
  /**
   * The pixels will be delivered in (multiples of) complete scanlines
   * at a time.
   * @see #setHints
   */
  static readonly COMPLETESCANLINES: number = 4;
  /**
   * The pixels will be delivered in a single pass.  Each pixel will
   * appear in only one call to any of the setPixels methods.  An
   * example of an image format which does not meet this criterion
   * is a progressive JPEG image which defines pixels in multiple
   * passes, each more refined than the previous.
   * @see #setHints
   */
  static readonly SINGLEPASS: number = 8;
  /**
   * The image contain a single static image.  The pixels will be defined
   * in calls to the setPixels methods and then the imageComplete method
   * will be called with the STATICIMAGEDONE flag after which no more
   * image data will be delivered.  An example of an image type which
   * would not meet these criteria would be the output of a video feed,
   * or the representation of a 3D rendering being manipulated
   * by the user.  The end of each frame in those types of images will
   * be indicated by calling imageComplete with the SINGLEFRAMEDONE flag.
   * @see #setHints
   * @see #imageComplete
   */
  static readonly SINGLEFRAME: number = 16;
  /**
   * An error was encountered while producing the image.
   * @see #imageComplete
   */
  static readonly IMAGEERROR: number = 1;
  /**
   * One frame of the image is complete but there are more frames
   * to be delivered.
   * @see #imageComplete
   */
  static readonly SINGLEFRAMEDONE: number = 2;
  /**
   * The image is complete and there are no more pixels or frames
   * to be delivered.
   * @see #imageComplete
   */
  static readonly STATICIMAGEDONE: number = 3;
  /**
   * The image creation process was deliberately aborted.
   * @see #imageComplete
   */
  static readonly IMAGEABORTED: number = 4;
}

$J.define(ImageConsumer, 'java.awt.image.ImageConsumer', { kind: 'interface', meths: { 'setPixels(int,int,int,int,java.awt.image.ColorModel,int[],int,int)': 'setPixels$int$int$int$int$ColorModel$intArr$int$int', 'setPixels(int,int,int,int,java.awt.image.ColorModel,byte[],int,int)': 'setPixels$int$int$int$int$ColorModel$byteArr$int$int' } });
