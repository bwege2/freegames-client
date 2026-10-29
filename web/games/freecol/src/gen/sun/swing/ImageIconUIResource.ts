// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/swing/ImageIconUIResource.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2004, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../jre/index.ts';
import { ImageIcon } from '../../javax/swing/ImageIcon.ts';

/**
 * A subclass of <code>ImageIcon</code> that implements UIResource.
 *
 * @author Shannon Hickey
 */
export class ImageIconUIResource extends ImageIcon {
  /**
   * Calls the superclass constructor with the same parameter.
   *
   * @param imageData an array of pixels
   * @see javax.swing.ImageIcon#ImageIcon(byte[])
   */
  _ImageIconUIResource$byteArr(imageData: number[]): this {
    this._ImageIcon$byteArr(imageData);
    return this;
  }
  /**
   * Calls the superclass constructor with the same parameter.
   *
   * @param image an image
   * @see javax.swing.ImageIcon#ImageIcon(Image)
   */
  _ImageIconUIResource$Image(image: Image): this {
    this._ImageIcon$Image(image);
    return this;
  }
}

$J.define(ImageIconUIResource, 'sun.swing.ImageIconUIResource', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.ImageIcon', ctors: { 'java.awt.Image': '_ImageIconUIResource$Image', 'byte[]': '_ImageIconUIResource$byteArr' } });
