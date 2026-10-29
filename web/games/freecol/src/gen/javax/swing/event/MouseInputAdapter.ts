// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/event/MouseInputAdapter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2006, Oracle and/or its affiliates. All rights reserved.
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
import { MouseAdapter } from '../../../java/awt/event/MouseAdapter.ts';

/**
 * An empty implementation of the {@code MouseInputListener} interface, provided
 * as a convenience to simplify the task of creating listeners, by extending
 * and implementing only the methods of interest. This class also provides an
 * empty implementation of the {@code MouseWheelListener} interface, through
 * its extension from AWT's {@code MouseAdapter}.
 *
 * @author Philip Milne
 * @author Shannon Hickey
 */
export class MouseInputAdapter extends MouseAdapter {
  /**
   * Constructor for subclasses to call.
   */
  _MouseInputAdapter(): this {
    this._MouseAdapter();
    return this;
  }
}

$J.define(MouseInputAdapter, 'javax.swing.event.MouseInputAdapter', { kind: 'class', ifaces: ['javax.swing.event.MouseInputListener'], sup: 'java.awt.event.MouseAdapter', ctors: { '': '_MouseInputAdapter' } });
