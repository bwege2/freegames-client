// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/MemoryImageSource.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Hashtable, JObject, Vector } from '../../../../jre/index.ts';

let ColorModel;

/**
 * This class is an implementation of the ImageProducer interface which
 * uses an array to produce pixel values for an Image.  Here is an example
 * which calculates a 100x100 image representing a fade from black to blue
 * along the X axis and a fade from black to red along the Y axis:
 * <pre>{@code
 *
 *      int w = 100;
 *      int h = 100;
 *      int pix[] = new int[w * h];
 *      int index = 0;
 *      for (int y = 0; y < h; y++) {
 *          int red = (y * 255) / (h - 1);
 *          for (int x = 0; x < w; x++) {
 *              int blue = (x * 255) / (w - 1);
 *              pix[index++] = (255 << 24) | (red << 16) | blue;
 *          }
 *      }
 *      Image img = createImage(new MemoryImageSource(w, h, pix, 0, w));
 *
 * }</pre>
 * The MemoryImageSource is also capable of managing a memory image which
 * varies over time to allow animation or custom rendering.  Here is an
 * example showing how to set up the animation source and signal changes
 * in the data (adapted from the MemoryAnimationSourceDemo by Garth Dickie):
 * <pre>{@code
 *
 *      int pixels[];
 *      MemoryImageSource source;
 *
 *      public void init() {
 *          int width = 50;
 *          int height = 50;
 *          int size = width * height;
 *          pixels = new int[size];
 *
 *          int value = getBackground().getRGB();
 *          for (int i = 0; i < size; i++) {
 *              pixels[i] = value;
 *          }
 *
 *          source = new MemoryImageSource(width, height, pixels, 0, width);
 *          source.setAnimated(true);
 *          image = createImage(source);
 *      }
 *
 *      public void run() {
 *          Thread me = Thread.currentThread( );
 *          me.setPriority(Thread.MIN_PRIORITY);
 *
 *          while (true) {
 *              try {
 *                  Thread.sleep(10);
 *              } catch( InterruptedException e ) {
 *                  return;
 *              }
 *
 *              // Modify the values in the pixels array at (x, y, w, h)
 *
 *              // Send the new data to the interested ImageConsumers
 *              source.newPixels(x, y, w, h);
 *          }
 *      }
 *
 * }</pre>
 *
 * @see ImageProducer
 *
 * @author      Jim Graham
 * @author      Animation capabilities inspired by the
 *              MemoryAnimationSource class written by Garth Dickie
 */
export class MemoryImageSource extends JObject {
  width_: number = 0;
  height_: number = 0;
  model: ColorModel = null;
  pixels: any = null;
  pixeloffset: number = 0;
  pixelscan: number = 0;
  properties: Hashtable<any, any> = null;
  theConsumers: Vector<ImageConsumer> = null;
  animating: boolean = false;
  fullbuffers: boolean = false;
  $init_MemoryImageSource() {
    this.theConsumers = new Vector();
  }
  /**
   * Constructs an ImageProducer object which uses an array of bytes
   * to produce data for an Image object.
   * @param w the width of the rectangle of pixels
   * @param h the height of the rectangle of pixels
   * @param cm the specified {@code ColorModel}
   * @param pix an array of pixels
   * @param off the offset into the array of where to store the
   *        first pixel
   * @param scan the distance from one row of pixels to the next in
   *        the array
   * @see java.awt.Component#createImage
   */
  _MemoryImageSource$int$int$ColorModel$byteArr$int$int(w: number, h: number, cm: ColorModel, pix: number[], off: number, scan: number): this {
    this.$init_MemoryImageSource();
    this.initialize(w, h, cm, pix, off, scan, null);
    return this;
  }
  /**
   * Constructs an ImageProducer object which uses an array of bytes
   * to produce data for an Image object.
   * @param w the width of the rectangle of pixels
   * @param h the height of the rectangle of pixels
   * @param cm the specified {@code ColorModel}
   * @param pix an array of pixels
   * @param off the offset into the array of where to store the
   *        first pixel
   * @param scan the distance from one row of pixels to the next in
   *        the array
   * @param props a list of properties that the {@code ImageProducer}
   *        uses to process an image
   * @see java.awt.Component#createImage
   */
  _MemoryImageSource$int$int$ColorModel$byteArr$int$int$Hashtable(w: number, h: number, cm: ColorModel, pix: number[], off: number, scan: number, props: Hashtable<any, any>): this {
    this.$init_MemoryImageSource();
    this.initialize(w, h, cm, pix, off, scan, props);
    return this;
  }
  /**
   * Constructs an ImageProducer object which uses an array of integers
   * to produce data for an Image object.
   * @param w the width of the rectangle of pixels
   * @param h the height of the rectangle of pixels
   * @param cm the specified {@code ColorModel}
   * @param pix an array of pixels
   * @param off the offset into the array of where to store the
   *        first pixel
   * @param scan the distance from one row of pixels to the next in
   *        the array
   * @see java.awt.Component#createImage
   */
  _MemoryImageSource$int$int$ColorModel$intArr$int$int(w: number, h: number, cm: ColorModel, pix: number[], off: number, scan: number): this {
    this.$init_MemoryImageSource();
    this.initialize(w, h, cm, pix, off, scan, null);
    return this;
  }
  /**
   * Constructs an ImageProducer object which uses an array of integers
   * to produce data for an Image object.
   * @param w the width of the rectangle of pixels
   * @param h the height of the rectangle of pixels
   * @param cm the specified {@code ColorModel}
   * @param pix an array of pixels
   * @param off the offset into the array of where to store the
   *        first pixel
   * @param scan the distance from one row of pixels to the next in
   *        the array
   * @param props a list of properties that the {@code ImageProducer}
   *        uses to process an image
   * @see java.awt.Component#createImage
   */
  _MemoryImageSource$int$int$ColorModel$intArr$int$int$Hashtable(w: number, h: number, cm: ColorModel, pix: number[], off: number, scan: number, props: Hashtable<any, any>): this {
    this.$init_MemoryImageSource();
    this.initialize(w, h, cm, pix, off, scan, props);
    return this;
  }
  /**
   * Constructs an ImageProducer object which uses an array of integers
   * in the default RGB ColorModel to produce data for an Image object.
   * @param w the width of the rectangle of pixels
   * @param h the height of the rectangle of pixels
   * @param pix an array of pixels
   * @param off the offset into the array of where to store the
   *        first pixel
   * @param scan the distance from one row of pixels to the next in
   *        the array
   * @see java.awt.Component#createImage
   * @see ColorModel#getRGBdefault
   */
  _MemoryImageSource$int$int$intArr$int$int(w: number, h: number, pix: number[], off: number, scan: number): this {
    this.$init_MemoryImageSource();
    this.initialize(w, h, ColorModel.getRGBdefault(), pix, off, scan, null);
    return this;
  }
  /**
   * Constructs an ImageProducer object which uses an array of integers
   * in the default RGB ColorModel to produce data for an Image object.
   * @param w the width of the rectangle of pixels
   * @param h the height of the rectangle of pixels
   * @param pix an array of pixels
   * @param off the offset into the array of where to store the
   *        first pixel
   * @param scan the distance from one row of pixels to the next in
   *        the array
   * @param props a list of properties that the {@code ImageProducer}
   *        uses to process an image
   * @see java.awt.Component#createImage
   * @see ColorModel#getRGBdefault
   */
  _MemoryImageSource$int$int$intArr$int$int$Hashtable(w: number, h: number, pix: number[], off: number, scan: number, props: Hashtable<any, any>): this {
    this.$init_MemoryImageSource();
    this.initialize(w, h, ColorModel.getRGBdefault(), pix, off, scan, props);
    return this;
  }
  initialize(w: number, h: number, cm: ColorModel, pix: any, off: number, scan: number, props: Hashtable<any, any>): void {
    this.width_ = w;
    this.height_ = h;
    this.model = cm;
    this.pixels = pix;
    this.pixeloffset = off;
    this.pixelscan = scan;
    if (props == null) {
      props = new Hashtable();
    }
    this.properties = props;
  }
}

$J.define(MemoryImageSource, 'java.awt.image.MemoryImageSource', { kind: 'class', ifaces: ['java.awt.image.ImageProducer'], sup: 'java.lang.Object', ctors: { 'int,int,int[],int,int,java.util.Hashtable': '_MemoryImageSource$int$int$intArr$int$int$Hashtable', 'int,int,int[],int,int': '_MemoryImageSource$int$int$intArr$int$int', 'int,int,java.awt.image.ColorModel,int[],int,int,java.util.Hashtable': '_MemoryImageSource$int$int$ColorModel$intArr$int$int$Hashtable', 'int,int,java.awt.image.ColorModel,int[],int,int': '_MemoryImageSource$int$int$ColorModel$intArr$int$int', 'int,int,java.awt.image.ColorModel,byte[],int,int,java.util.Hashtable': '_MemoryImageSource$int$int$ColorModel$byteArr$int$int$Hashtable', 'int,int,java.awt.image.ColorModel,byte[],int,int': '_MemoryImageSource$int$int$ColorModel$byteArr$int$int' }, meths: { 'newPixels(int[],java.awt.image.ColorModel,int,int)': 'newPixels$intArr$ColorModel$int$int', 'newPixels(byte[],java.awt.image.ColorModel,int,int)': 'newPixels$byteArr$ColorModel$int$int', 'newPixels(int,int,int,int,boolean)': 'newPixels$int$int$int$int$boolean', 'newPixels(int,int,int,int)': 'newPixels$int$int$int$int', 'newPixels()': 'newPixels$' } });
$J.module(() => {
  ColorModel = $J.load('java.awt.image.ColorModel');
});
