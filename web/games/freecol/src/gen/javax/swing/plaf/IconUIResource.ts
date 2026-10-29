// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/IconUIResource.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalArgumentException, JObject } from '../../../../jre/index.ts';

/**
 * An Icon wrapper class which implements UIResource.  UI
 * classes which set icon properties should use this class
 * to wrap any icons specified as defaults.
 *
 * This class delegates all method invocations to the
 * Icon "delegate" object specified at construction.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @see javax.swing.plaf.UIResource
 * @author Amy Fowler
 */
export class IconUIResource extends JObject {
  delegate_: Icon = null;
  /**
   * Creates a UIResource icon object which wraps
   * an existing Icon instance.
   * @param delegate the icon being wrapped
   */
  _IconUIResource(delegate: Icon): this {
    if (delegate == null) {
      throw new IllegalArgumentException('null delegate icon argument');
    }
    this.delegate_ = delegate;
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    this.delegate_.paintIcon(c, g, x, y);
  }
  getIconWidth(): number {
    return this.delegate_.getIconWidth();
  }
  getIconHeight(): number {
    return this.delegate_.getIconHeight();
  }
}

$J.define(IconUIResource, 'javax.swing.plaf.IconUIResource', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'javax.swing.Icon': '_IconUIResource' } });
