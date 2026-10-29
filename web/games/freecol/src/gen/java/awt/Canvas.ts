// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Canvas.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { Component } from './Component.ts';
import { Component$AccessibleAWTComponent } from './Component.ts';

/**
 * A {@code Canvas} component represents a blank rectangular
 * area of the screen onto which the application can draw or from
 * which the application can trap input events from the user.
 * <p>
 * An application must subclass the {@code Canvas} class in
 * order to get useful functionality such as creating a custom
 * component. The {@code paint} method must be overridden
 * in order to perform custom graphics on the canvas.
 *
 * @author      Sami Shaio
 * @since       1.0
 */
export class Canvas extends Component {
  static readonly base: string = 'canvas';
  static nameCounter: number = 0;
  /**
   * Constructs a new Canvas.
   */
  _Canvas$(): this {
    this._Component();
    return this;
  }
  setGraphicsConfiguration(gc: GraphicsConfiguration): void {
    {
      let peer = this.peer;
      if (peer != null) {
        gc = peer.getAppropriateGraphicsConfiguration(gc);
      }
      super.setGraphicsConfiguration(gc);
    }
  }
  /**
   * Construct a name for this component.  Called by getName() when the
   * name is null.
   */
  constructComponentName(): string {
    {
      return Canvas.base + Canvas.nameCounter++;
    }
  }
  /**
   * Creates the peer of the canvas.  This peer allows you to change the
   * user interface of the canvas without changing its functionality.
   * @see     java.awt.Component#getToolkit()
   */
  addNotify(): void {
    {
      if (this.peer == null) {
        this.peer = this.getComponentFactory().createCanvas(this);
      }
      super.addNotify();
    }
  }
  postsOldMouseEvents(): boolean {
    return true;
  }
  /**
   * Creates a new strategy for multi-buffering on this component with the
   * required buffer capabilities.  This is useful, for example, if only
   * accelerated memory or page flipping is desired (as specified by the
   * buffer capabilities).
   * <p>
   * Each time this method
   * is called, the existing buffer strategy for this component is discarded.
   * @param numBuffers number of buffers to create
   * @param caps the required capabilities for creating the buffer strategy;
   * cannot be {@code null}
   * @throws AWTException if the capabilities supplied could not be
   * supported or met; this may happen, for example, if there is not enough
   * accelerated memory currently available, or if page flipping is specified
   * but not possible.
   * @throws IllegalArgumentException if numBuffers is less than 1, or if
   * caps is {@code null}
   * @see #getBufferStrategy
   * @since 1.4
   */
  createBufferStrategy$int$BufferCapabilities(numBuffers: number, caps: BufferCapabilities): void {
    super.createBufferStrategy$int$BufferCapabilities(numBuffers, caps);
  }
  /**
   * Returns the {@code BufferStrategy} used by this component.  This
   * method will return null if a {@code BufferStrategy} has not yet
   * been created or has been disposed.
   *
   * @return the buffer strategy used by this component
   * @see #createBufferStrategy
   * @since 1.4
   */
  getBufferStrategy(): BufferStrategy {
    return super.getBufferStrategy();
  }
  /**
   * Gets the AccessibleContext associated with this Canvas.
   * For canvases, the AccessibleContext takes the form of an
   * AccessibleAWTCanvas.
   * A new AccessibleAWTCanvas instance is created if necessary.
   *
   * @return an AccessibleAWTCanvas that serves as the
   *         AccessibleContext of this Canvas
   * @since 1.3
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new Canvas$AccessibleAWTCanvas().$o(this)._Canvas$AccessibleAWTCanvas();
    }
    return this.accessibleContext;
  }
  static $clinit() {
    Canvas.nameCounter = 0;
  }
}

/**
 * This class implements accessibility support for the
 * {@code Canvas} class.  It provides an implementation of the
 * Java Accessibility API appropriate to canvas user-interface elements.
 * @since 1.3
 */
export class Canvas$AccessibleAWTCanvas extends Component$AccessibleAWTComponent {
  /**
   * Constructs an {@code AccessibleAWTCanvas}.
   */
  _Canvas$AccessibleAWTCanvas(): this {
    this._Component$AccessibleAWTComponent();
    return this;
  }
}

$J.define(Canvas, 'java.awt.Canvas', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'java.awt.Component', ctors: { 'java.awt.GraphicsConfiguration': '_Canvas$GraphicsConfiguration', '': '_Canvas$' }, meths: { 'createBufferStrategy(int,java.awt.BufferCapabilities)': 'createBufferStrategy$int$BufferCapabilities', 'createBufferStrategy(int)': 'createBufferStrategy$int', 'update(java.awt.Graphics)': 'update$Graphics' }, clinit: true, lazy: ['nameCounter'] });
$J.define(Canvas$AccessibleAWTCanvas, 'java.awt.Canvas$AccessibleAWTCanvas', { kind: 'class', sup: 'java.awt.Component$AccessibleAWTComponent', ctors: { '': '_Canvas$AccessibleAWTCanvas' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
