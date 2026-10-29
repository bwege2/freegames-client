// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/DisplayMode.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2016, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../jre/index.ts';

let Dimension;

/**
 * The {@code DisplayMode} class encapsulates the bit depth, height,
 * width, and refresh rate of a {@code GraphicsDevice}. The ability to
 * change graphics device's display mode is platform- and
 * configuration-dependent and may not always be available
 * (see {@link GraphicsDevice#isDisplayChangeSupported}).
 * <p>
 * For more information on full-screen exclusive mode API, see the
 * <a href="https://docs.oracle.com/javase/tutorial/extra/fullscreen/index.html">
 * Full-Screen Exclusive Mode API Tutorial</a>.
 *
 * @see GraphicsDevice
 * @see GraphicsDevice#isDisplayChangeSupported
 * @see GraphicsDevice#getDisplayModes
 * @see GraphicsDevice#setDisplayMode
 * @author Michael Martak
 * @since 1.4
 */
export class DisplayMode extends JObject {
  size_: Dimension = null;
  bitDepth: number = 0;
  refreshRate: number = 0;
  /**
   * Value of the bit depth if multiple bit depths are supported in this
   * display mode.
   * @see #getBitDepth
   */
  static readonly BIT_DEPTH_MULTI: number = -1;
  /**
   * Value of the refresh rate if not known.
   * @see #getRefreshRate
   */
  static readonly REFRESH_RATE_UNKNOWN: number = 0;
  /**
   * Create a new display mode object with the supplied parameters.
   * @param width the width of the display, in pixels
   * @param height the height of the display, in pixels
   * @param bitDepth the bit depth of the display, in bits per
   *        pixel.  This can be {@code BIT_DEPTH_MULTI} if multiple
   *        bit depths are available.
   * @param refreshRate the refresh rate of the display, in hertz.
   *        This can be {@code REFRESH_RATE_UNKNOWN} if the
   *        information is not available.
   * @see #BIT_DEPTH_MULTI
   * @see #REFRESH_RATE_UNKNOWN
   */
  _DisplayMode(width: number, height: number, bitDepth: number, refreshRate: number): this {
    this.size_ = new Dimension()._Dimension$int$int(width, height);
    this.bitDepth = bitDepth;
    this.refreshRate = refreshRate;
    return this;
  }
  /**
   * Returns the height of the display, in pixels.
   * @return the height of the display, in pixels
   */
  getHeight(): number {
    return this.size_.height_;
  }
  /**
   * Returns the width of the display, in pixels.
   * @return the width of the display, in pixels
   */
  getWidth(): number {
    return this.size_.width_;
  }
  /**
   * Returns the bit depth of the display, in bits per pixel.  This may be
   * {@code BIT_DEPTH_MULTI} if multiple bit depths are supported in
   * this display mode.
   *
   * @return the bit depth of the display, in bits per pixel.
   * @see #BIT_DEPTH_MULTI
   */
  getBitDepth(): number {
    return this.bitDepth;
  }
  /**
   * Returns the refresh rate of the display, in hertz.  This may be
   * {@code REFRESH_RATE_UNKNOWN} if the information is not available.
   *
   * @return the refresh rate of the display, in hertz.
   * @see #REFRESH_RATE_UNKNOWN
   */
  getRefreshRate(): number {
    return this.refreshRate;
  }
  /**
   * Returns whether the two display modes are equal.
   *
   * @param  dm the display mode to compare to
   * @return whether the two display modes are equal
   */
  equals$DisplayMode(dm: DisplayMode): boolean {
    if (dm == null) {
      return false;
    }
    return (this.getHeight() === dm.getHeight() && this.getWidth() === dm.getWidth() && this.getBitDepth() === dm.getBitDepth() && this.getRefreshRate() === dm.getRefreshRate());
  }
  /**
   * {@inheritDoc}
   */
  equals(dm: any): boolean {
    if (dm instanceof DisplayMode) {
      return this.equals$DisplayMode(dm);
    } else {
      return false;
    }
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    return (this.getWidth() + this.getHeight() + Math.imul(this.getBitDepth(), 7) + Math.imul(this.getRefreshRate(), 13)) | 0;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return this.getWidth() + 'x' + this.getHeight() + 'x' + (this.getBitDepth() > 0 ? this.getBitDepth() + 'bpp' : '[Multi depth]') + '@' + (this.getRefreshRate() > 0 ? this.getRefreshRate() + 'Hz' : '[Unknown refresh rate]');
  }
}

$J.define(DisplayMode, 'java.awt.DisplayMode', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,int,int,int': '_DisplayMode' }, meths: { 'equals(java.awt.DisplayMode)': 'equals$DisplayMode' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
});
