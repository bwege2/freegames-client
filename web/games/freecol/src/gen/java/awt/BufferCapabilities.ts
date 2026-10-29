// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/BufferCapabilities.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, CloneNotSupportedException, IllegalArgumentException, InternalError, JObject } from '../../../jre/index.ts';
import { AttributeValue } from './AttributeValue.ts';

/**
 * Capabilities and properties of buffers.
 *
 * @see java.awt.image.BufferStrategy#getCapabilities()
 * @see GraphicsConfiguration#getBufferCapabilities
 * @author Michael Martak
 * @since 1.4
 */
export class BufferCapabilities extends JObject {
  frontCaps: ImageCapabilities = null;
  backCaps: ImageCapabilities = null;
  flipContents: BufferCapabilities$FlipContents = null;
  /**
   * Creates a new object for specifying buffering capabilities
   * @param frontCaps the capabilities of the front buffer; cannot be
   * {@code null}
   * @param backCaps the capabilities of the back and intermediate buffers;
   * cannot be {@code null}
   * @param flipContents the contents of the back buffer after page-flipping,
   * {@code null} if page flipping is not used (implies blitting)
   * @throws IllegalArgumentException if frontCaps or backCaps are
   * {@code null}
   */
  _BufferCapabilities(frontCaps: ImageCapabilities, backCaps: ImageCapabilities, flipContents: BufferCapabilities$FlipContents): this {
    if (frontCaps == null || backCaps == null) {
      throw new IllegalArgumentException('Image capabilities specified cannot be null');
    }
    this.frontCaps = frontCaps;
    this.backCaps = backCaps;
    this.flipContents = flipContents;
    return this;
  }
  /**
   * Returns the image capabilities of the front (displayed) buffer.
   *
   * @return the image capabilities of the front (displayed) buffer
   */
  getFrontBufferCapabilities(): ImageCapabilities {
    return this.frontCaps;
  }
  /**
   * Returns the image capabilities of all back buffers (intermediate buffers
   * are considered back buffers).
   *
   * @return the image capabilities of all back buffers (intermediate buffers
   * are considered back buffers)
   */
  getBackBufferCapabilities(): ImageCapabilities {
    return this.backCaps;
  }
  /**
   * Returns whether or not the buffer strategy uses page flipping.
   * A set of buffers that uses page flipping
   * can swap the contents internally between the front buffer and one or
   * more back buffers by switching the video pointer (or by copying memory
   * internally).  A non-flipping set of
   * buffers uses blitting to copy the contents from one buffer to
   * another; when this is the case, {@code getFlipContents} returns
   * {@code null}.
   *
   * @return whether or not the buffer strategy uses page flipping
   */
  isPageFlipping$(): boolean {
    return (this.getFlipContents() != null);
  }
  /**
   * Returns the resulting contents of the back buffer after page-flipping.
   * This value is {@code null} when the {@code isPageFlipping}
   * returns {@code false}, implying blitting.  It can be one of
   * {@code FlipContents.UNDEFINED}
   * (the assumed default), {@code FlipContents.BACKGROUND},
   * {@code FlipContents.PRIOR}, or
   * {@code FlipContents.COPIED}.
   *
   * @return the resulting contents of the back buffer after page-flipping
   * @see #isPageFlipping
   * @see FlipContents#UNDEFINED
   * @see FlipContents#BACKGROUND
   * @see FlipContents#PRIOR
   * @see FlipContents#COPIED
   */
  getFlipContents(): BufferCapabilities$FlipContents {
    return this.flipContents;
  }
  /**
   * @return a copy of this BufferCapabilities object.
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

/**
 * A type-safe enumeration of the possible back buffer contents after
 * page-flipping
 * @since 1.4
 */
export class BufferCapabilities$FlipContents extends AttributeValue {
  static I_UNDEFINED: number = 0;
  static I_BACKGROUND: number = 0;
  static I_PRIOR: number = 0;
  static I_COPIED: number = 0;
  static NAMES: string[] = null;
  /**
   * When flip contents are {@code UNDEFINED}, the
   * contents of the back buffer are undefined after flipping.
   * @see #isPageFlipping
   * @see #getFlipContents
   * @see #BACKGROUND
   * @see #PRIOR
   * @see #COPIED
   */
  static UNDEFINED: BufferCapabilities$FlipContents = null;
  /**
   * When flip contents are {@code BACKGROUND}, the
   * contents of the back buffer are cleared with the background color after
   * flipping.
   * @see #isPageFlipping
   * @see #getFlipContents
   * @see #UNDEFINED
   * @see #PRIOR
   * @see #COPIED
   */
  static BACKGROUND: BufferCapabilities$FlipContents = null;
  /**
   * When flip contents are {@code PRIOR}, the
   * contents of the back buffer are the prior contents of the front buffer
   * (a true page flip).
   * @see #isPageFlipping
   * @see #getFlipContents
   * @see #UNDEFINED
   * @see #BACKGROUND
   * @see #COPIED
   */
  static PRIOR: BufferCapabilities$FlipContents = null;
  /**
   * When flip contents are {@code COPIED}, the
   * contents of the back buffer are copied to the front buffer when
   * flipping.
   * @see #isPageFlipping
   * @see #getFlipContents
   * @see #UNDEFINED
   * @see #BACKGROUND
   * @see #PRIOR
   */
  static COPIED: BufferCapabilities$FlipContents = null;
  _BufferCapabilities$FlipContents(type$: number): this {
    this._AttributeValue(type$, BufferCapabilities$FlipContents.NAMES);
    return this;
  }
  static $clinit() {
    BufferCapabilities$FlipContents.I_UNDEFINED = 0;
    BufferCapabilities$FlipContents.I_BACKGROUND = 1;
    BufferCapabilities$FlipContents.I_PRIOR = 2;
    BufferCapabilities$FlipContents.I_COPIED = 3;
    BufferCapabilities$FlipContents.NAMES = ['undefined', 'background', 'prior', 'copied'];
    BufferCapabilities$FlipContents.UNDEFINED = new BufferCapabilities$FlipContents()._BufferCapabilities$FlipContents(BufferCapabilities$FlipContents.I_UNDEFINED);
    BufferCapabilities$FlipContents.BACKGROUND = new BufferCapabilities$FlipContents()._BufferCapabilities$FlipContents(BufferCapabilities$FlipContents.I_BACKGROUND);
    BufferCapabilities$FlipContents.PRIOR = new BufferCapabilities$FlipContents()._BufferCapabilities$FlipContents(BufferCapabilities$FlipContents.I_PRIOR);
    BufferCapabilities$FlipContents.COPIED = new BufferCapabilities$FlipContents()._BufferCapabilities$FlipContents(BufferCapabilities$FlipContents.I_COPIED);
  }
}

$J.define(BufferCapabilities, 'java.awt.BufferCapabilities', { kind: 'class', ifaces: ['java.lang.Cloneable'], sup: 'java.lang.Object', ctors: { 'java.awt.ImageCapabilities,java.awt.ImageCapabilities,java.awt.BufferCapabilities$FlipContents': '_BufferCapabilities' }, meths: { 'isPageFlipping()': 'isPageFlipping$' } });
$J.define(BufferCapabilities$FlipContents, 'java.awt.BufferCapabilities$FlipContents', { kind: 'class', sup: 'java.awt.AttributeValue', ctors: { 'int': '_BufferCapabilities$FlipContents' }, clinit: true, lazy: ['I_UNDEFINED', 'I_BACKGROUND', 'I_PRIOR', 'I_COPIED', 'NAMES', 'UNDEFINED', 'BACKGROUND', 'PRIOR', 'COPIED'] });
