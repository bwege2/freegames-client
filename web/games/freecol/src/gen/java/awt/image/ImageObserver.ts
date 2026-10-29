// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/ImageObserver.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2013, Oracle and/or its affiliates. All rights reserved.
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
 * An asynchronous update interface for receiving notifications about
 * Image information as the Image is constructed.
 *
 * @author      Jim Graham
 */
export class ImageObserver {
  /**
   * This flag in the infoflags argument to imageUpdate indicates that
   * the width of the base image is now available and can be taken
   * from the width argument to the imageUpdate callback method.
   * @see Image#getWidth
   * @see #imageUpdate
   */
  static readonly WIDTH: number = 1;
  /**
   * This flag in the infoflags argument to imageUpdate indicates that
   * the height of the base image is now available and can be taken
   * from the height argument to the imageUpdate callback method.
   * @see Image#getHeight
   * @see #imageUpdate
   */
  static readonly HEIGHT: number = 2;
  /**
   * This flag in the infoflags argument to imageUpdate indicates that
   * the properties of the image are now available.
   * @see Image#getProperty
   * @see #imageUpdate
   */
  static readonly PROPERTIES: number = 4;
  /**
   * This flag in the infoflags argument to imageUpdate indicates that
   * more pixels needed for drawing a scaled variation of the image
   * are available.  The bounding box of the new pixels can be taken
   * from the x, y, width, and height arguments to the imageUpdate
   * callback method.
   * @see java.awt.Graphics#drawImage
   * @see #imageUpdate
   */
  static readonly SOMEBITS: number = 8;
  /**
   * This flag in the infoflags argument to imageUpdate indicates that
   * another complete frame of a multi-frame image which was previously
   * drawn is now available to be drawn again.  The x, y, width, and height
   * arguments to the imageUpdate callback method should be ignored.
   * @see java.awt.Graphics#drawImage
   * @see #imageUpdate
   */
  static readonly FRAMEBITS: number = 16;
  /**
   * This flag in the infoflags argument to imageUpdate indicates that
   * a static image which was previously drawn is now complete and can
   * be drawn again in its final form.  The x, y, width, and height
   * arguments to the imageUpdate callback method should be ignored.
   * @see java.awt.Graphics#drawImage
   * @see #imageUpdate
   */
  static readonly ALLBITS: number = 32;
  /**
   * This flag in the infoflags argument to imageUpdate indicates that
   * an image which was being tracked asynchronously has encountered
   * an error.  No further information will become available and
   * drawing the image will fail.
   * As a convenience, the ABORT flag will be indicated at the same
   * time to indicate that the image production was aborted.
   * @see #imageUpdate
   */
  static readonly ERROR: number = 64;
  /**
   * This flag in the infoflags argument to imageUpdate indicates that
   * an image which was being tracked asynchronously was aborted before
   * production was complete.  No more information will become available
   * without further action to trigger another image production sequence.
   * If the ERROR flag was not also set in this image update, then
   * accessing any of the data in the image will restart the production
   * again, probably from the beginning.
   * @see #imageUpdate
   */
  static readonly ABORT: number = 128;
}

$J.define(ImageObserver, 'java.awt.image.ImageObserver', { kind: 'interface' });
