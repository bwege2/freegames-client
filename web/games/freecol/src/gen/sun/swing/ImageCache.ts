// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/swing/ImageCache.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2006, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, LinkedList, SoftReference } from '../../../jre/index.ts';

/**
 * Cache is used to cache an image based on a set of arguments.
 */
export class ImageCache extends JObject {
  maxCount: number = 0;
  entries: LinkedList<SoftReference<ImageCache$Entry>> = null;
  _ImageCache(maxCount: number): this {
    this.maxCount = maxCount;
    this.entries = new LinkedList();
    return this;
  }
  setMaxCount(maxCount: number): void {
    this.maxCount = maxCount;
  }
  getEntry(key: any, config: GraphicsConfiguration, w: number, h: number, args: any[]): ImageCache$Entry {
    let entry: ImageCache$Entry;
    let iter = this.entries.listIterator();
    while (iter.hasNext()) {
      let ref = iter.next();
      entry = ref.get();
      if (entry == null) {
        iter.remove();
      } else if (entry.equals$GraphicsConfiguration$int$int$ObjectArr(config, w, h, args)) {
        iter.remove();
        this.entries.addFirst(ref);
        return entry;
      }
    }
    entry = new ImageCache$Entry()._ImageCache$Entry(config, w, h, args);
    if (this.entries.size() >= this.maxCount) {
      this.entries.removeLast();
    }
    this.entries.addFirst(new SoftReference(entry));
    return entry;
  }
  /**
   * Returns the cached Image, or null, for the specified arguments.
   */
  getImage(key: any, config: GraphicsConfiguration, w: number, h: number, args: any[]): Image {
    let entry = this.getEntry(key, config, w, h, args);
    return entry.getImage();
  }
  /**
   * Sets the cached image for the specified constraints.
   */
  setImage(key: any, config: GraphicsConfiguration, w: number, h: number, args: any[], image: Image): void {
    let entry = this.getEntry(key, config, w, h, args);
    entry.setImage(image);
  }
}

/**
 * Caches set of arguments and Image.
 */
export class ImageCache$Entry extends JObject {
  config: GraphicsConfiguration = null;
  w: number = 0;
  h: number = 0;
  args: any[] = null;
  image: Image = null;
  _ImageCache$Entry(config: GraphicsConfiguration, w: number, h: number, args: any[]): this {
    this.config = config;
    this.args = args;
    this.w = w;
    this.h = h;
    return this;
  }
  setImage(image: Image): void {
    this.image = image;
  }
  getImage(): Image {
    return this.image;
  }
  toString(): string {
    let value = super.toString() + '[ graphicsConfig=' + $J.str(this.config) + ', image=' + $J.str(this.image) + ', w=' + this.w + ', h=' + this.h;
    if (this.args != null) {
      for (let counter = 0; counter < this.args.length; counter++) {
        value += ', ' + $J.str(this.args[counter]);
      }
    }
    value += ']';
    return value;
  }
  equals$GraphicsConfiguration$int$int$ObjectArr(config: GraphicsConfiguration, w: number, h: number, args: any[]): boolean {
    if (this.w === w && this.h === h && ((this.config != null && this.config.equals(config)) || (this.config == null && config == null))) {
      if (this.args == null && args == null) {
        return true;
      }
      if (this.args != null && args != null && this.args.length === args.length) {
        for (let counter = (args.length - 1) | 0; counter >= 0; counter--) {
          let a1 = this.args[counter];
          let a2 = args[counter];
          if ((a1 == null && a2 != null) || (a1 != null && !$J.equals(a1, a2))) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }
}

$J.define(ImageCache, 'sun.swing.ImageCache', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int': '_ImageCache' } });
$J.define(ImageCache$Entry, 'sun.swing.ImageCache$Entry', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.awt.GraphicsConfiguration,int,int,java.lang.Object[]': '_ImageCache$Entry' }, meths: { 'equals(java.awt.GraphicsConfiguration,int,int,java.lang.Object[])': 'equals$GraphicsConfiguration$int$int$ObjectArr' } });
