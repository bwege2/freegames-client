// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/event/InternalFrameAdapter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2013, Oracle and/or its affiliates. All rights reserved.
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
 * An abstract adapter class for receiving internal frame events.
 * The methods in this class are empty. This class exists as
 * convenience for creating listener objects, and is functionally
 * equivalent to the WindowAdapter class in the AWT.
 * <p>
 * See <a href="https://docs.oracle.com/javase/tutorial/uiswing/events/internalframelistener.html">How to Write an Internal Frame Listener</a>
 * in <em>The Java Tutorial</em>
 *
 * @see InternalFrameEvent
 * @see InternalFrameListener
 * @see java.awt.event.WindowListener
 *
 * @author Thomas Ball
 */
export class InternalFrameAdapter extends JObject {
  /**
   * Constructor for subclasses to call.
   */
  _InternalFrameAdapter(): this {
    return this;
  }
  /**
   * Invoked when an internal frame has been opened.
   */
  internalFrameOpened(e: InternalFrameEvent): void {
  }
  /**
   * Invoked when an internal frame has been closed.
   */
  internalFrameClosed(e: InternalFrameEvent): void {
  }
  /**
   * Invoked when an internal frame is iconified.
   */
  internalFrameIconified(e: InternalFrameEvent): void {
  }
  /**
   * Invoked when an internal frame is de-iconified.
   */
  internalFrameDeiconified(e: InternalFrameEvent): void {
  }
  /**
   * Invoked when an internal frame is activated.
   */
  internalFrameActivated(e: InternalFrameEvent): void {
  }
  /**
   * Invoked when an internal frame is de-activated.
   */
  internalFrameDeactivated(e: InternalFrameEvent): void {
  }
}

$J.define(InternalFrameAdapter, 'javax.swing.event.InternalFrameAdapter', { kind: 'class', ifaces: ['javax.swing.event.InternalFrameListener'], sup: 'java.lang.Object', ctors: { '': '_InternalFrameAdapter' } });
