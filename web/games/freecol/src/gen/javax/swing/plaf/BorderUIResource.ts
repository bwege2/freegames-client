// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/BorderUIResource.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { CompoundBorder } from '../border/CompoundBorder.ts';
import { EmptyBorder } from '../border/EmptyBorder.ts';
import { LineBorder } from '../border/LineBorder.ts';
import { BevelBorder } from '../border/BevelBorder.ts';
import { EtchedBorder } from '../border/EtchedBorder.ts';

let Color;

/**
 * A Border wrapper class which implements UIResource.  UI
 * classes which set border properties should use this class
 * to wrap any borders specified as defaults.
 *
 * This class delegates all method invocations to the
 * Border "delegate" object specified at construction.
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
export class BorderUIResource extends JObject {
  static etched: Border = null;
  static loweredBevel: Border = null;
  static raisedBevel: Border = null;
  static blackLine: Border = null;
  delegate_: Border = null;
  /**
   * Creates a UIResource border object which wraps
   * an existing Border instance.
   * @param delegate the border being wrapped
   */
  _BorderUIResource(delegate: Border): this {
    if (delegate == null) {
      throw new IllegalArgumentException('null border delegate argument');
    }
    this.delegate_ = delegate;
    return this;
  }
  /**
   * Returns a etched border UI resource.
   * @return a etched border UI resource
   */
  static getEtchedBorderUIResource(): Border {
    if (BorderUIResource.etched == null) {
      BorderUIResource.etched = new BorderUIResource$EtchedBorderUIResource()._BorderUIResource$EtchedBorderUIResource$();
    }
    return BorderUIResource.etched;
  }
  /**
   * Returns a lowered bevel border UI resource.
   * @return a lowered bevel border UI resource
   */
  static getLoweredBevelBorderUIResource(): Border {
    if (BorderUIResource.loweredBevel == null) {
      BorderUIResource.loweredBevel = new BorderUIResource$BevelBorderUIResource()._BorderUIResource$BevelBorderUIResource$int(BevelBorder.LOWERED);
    }
    return BorderUIResource.loweredBevel;
  }
  /**
   * Returns a black line border UI resource.
   * @return a black line border UI resource
   */
  static getBlackLineBorderUIResource(): Border {
    if (BorderUIResource.blackLine == null) {
      BorderUIResource.blackLine = new BorderUIResource$LineBorderUIResource()._BorderUIResource$LineBorderUIResource$Color(Color.black);
    }
    return BorderUIResource.blackLine;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, width: number, height: number): void {
    this.delegate_.paintBorder(c, g, x, y, width, height);
  }
  getBorderInsets$Component(c: Component): Insets {
    return this.delegate_.getBorderInsets$Component(c);
  }
}

/**
 * A compound border UI resource.
 */
export class BorderUIResource$CompoundBorderUIResource extends CompoundBorder {
  /**
   * Constructs a {@code CompoundBorderUIResource}.
   * @param outsideBorder the outside border
   * @param insideBorder the inside border
   */
  _BorderUIResource$CompoundBorderUIResource(outsideBorder: Border, insideBorder: Border): this {
    this._CompoundBorder$Border$Border(outsideBorder, insideBorder);
    return this;
  }
}

/**
 * An empty border UI resource.
 */
export class BorderUIResource$EmptyBorderUIResource extends EmptyBorder {
  /**
   * Constructs an {@code EmptyBorderUIResource}.
   * @param top the top inset of the border
   * @param left the left inset of the border
   * @param bottom the bottom inset of the border
   * @param right the right inset of the border
   */
  _BorderUIResource$EmptyBorderUIResource$int$int$int$int(top: number, left: number, bottom: number, right: number): this {
    this._EmptyBorder$int$int$int$int(top, left, bottom, right);
    return this;
  }
  /**
   * Constructs an {@code EmptyBorderUIResource}.
   * @param insets the insets of the border
   * @throws NullPointerException if the spcecified {@code insets}
   *         is {@code null}
   */
  _BorderUIResource$EmptyBorderUIResource$Insets(insets: Insets): this {
    this._EmptyBorder$Insets(insets);
    return this;
  }
}

/**
 * A line border UI resource.
 */
export class BorderUIResource$LineBorderUIResource extends LineBorder {
  /**
   * Constructs a {@code LineBorderUIResource}.
   * @param color the color for the border
   */
  _BorderUIResource$LineBorderUIResource$Color(color: Color): this {
    this._LineBorder$Color(color);
    return this;
  }
  /**
   * Constructs a {@code LineBorderUIResource}.
   * @param color the color for the border
   * @param thickness the thickness of the border
   */
  _BorderUIResource$LineBorderUIResource$Color$int(color: Color, thickness: number): this {
    this._LineBorder$Color$int(color, thickness);
    return this;
  }
}

/**
 * A bevel border UI resource.
 */
export class BorderUIResource$BevelBorderUIResource extends BevelBorder {
  /**
   * Constructs a {@code BevelBorderUIResource}.
   * @param bevelType the type of bevel for the border
   */
  _BorderUIResource$BevelBorderUIResource$int(bevelType: number): this {
    this._BevelBorder$int(bevelType);
    return this;
  }
  /**
   * Constructs a {@code BevelBorderUIResource}.
   * @param bevelType the type of bevel for the border
   * @param highlightOuter the color to use for the bevel outer highlight
   * @param highlightInner the color to use for the bevel inner highlight
   * @param shadowOuter the color to use for the bevel outer shadow
   * @param shadowInner the color to use for the bevel inner shadow
   */
  _BorderUIResource$BevelBorderUIResource$int$Color$Color$Color$Color(bevelType: number, highlightOuter: Color, highlightInner: Color, shadowOuter: Color, shadowInner: Color): this {
    this._BevelBorder$int$Color$Color$Color$Color(bevelType, highlightOuter, highlightInner, shadowOuter, shadowInner);
    return this;
  }
}

/**
 * An etched border UI resource.
 */
export class BorderUIResource$EtchedBorderUIResource extends EtchedBorder {
  /**
   * Constructs an {@code EtchedBorderUIResource}.
   */
  _BorderUIResource$EtchedBorderUIResource$(): this {
    this._EtchedBorder$();
    return this;
  }
}

$J.define(BorderUIResource, 'javax.swing.plaf.BorderUIResource', { kind: 'class', ifaces: ['javax.swing.border.Border', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'javax.swing.border.Border': '_BorderUIResource' }, meths: { 'getBorderInsets(java.awt.Component)': 'getBorderInsets$Component' } });
$J.define(BorderUIResource$CompoundBorderUIResource, 'javax.swing.plaf.BorderUIResource$CompoundBorderUIResource', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.border.CompoundBorder', ctors: { 'javax.swing.border.Border,javax.swing.border.Border': '_BorderUIResource$CompoundBorderUIResource' } });
$J.define(BorderUIResource$EmptyBorderUIResource, 'javax.swing.plaf.BorderUIResource$EmptyBorderUIResource', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.border.EmptyBorder', ctors: { 'java.awt.Insets': '_BorderUIResource$EmptyBorderUIResource$Insets', 'int,int,int,int': '_BorderUIResource$EmptyBorderUIResource$int$int$int$int' } });
$J.define(BorderUIResource$LineBorderUIResource, 'javax.swing.plaf.BorderUIResource$LineBorderUIResource', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.border.LineBorder', ctors: { 'java.awt.Color,int': '_BorderUIResource$LineBorderUIResource$Color$int', 'java.awt.Color': '_BorderUIResource$LineBorderUIResource$Color' } });
$J.define(BorderUIResource$BevelBorderUIResource, 'javax.swing.plaf.BorderUIResource$BevelBorderUIResource', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.border.BevelBorder', ctors: { 'int,java.awt.Color,java.awt.Color,java.awt.Color,java.awt.Color': '_BorderUIResource$BevelBorderUIResource$int$Color$Color$Color$Color', 'int,java.awt.Color,java.awt.Color': '_BorderUIResource$BevelBorderUIResource$int$Color$Color', 'int': '_BorderUIResource$BevelBorderUIResource$int' } });
$J.define(BorderUIResource$EtchedBorderUIResource, 'javax.swing.plaf.BorderUIResource$EtchedBorderUIResource', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.border.EtchedBorder', ctors: { 'int,java.awt.Color,java.awt.Color': '_BorderUIResource$EtchedBorderUIResource$int$Color$Color', 'java.awt.Color,java.awt.Color': '_BorderUIResource$EtchedBorderUIResource$Color$Color', 'int': '_BorderUIResource$EtchedBorderUIResource$int', '': '_BorderUIResource$EtchedBorderUIResource$' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
});
