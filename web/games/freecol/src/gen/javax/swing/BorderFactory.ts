// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/BorderFactory.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2013, Oracle and/or its affiliates. All rights reserved.
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

let BevelBorder, CompoundBorder, EmptyBorder, EtchedBorder, LineBorder, MatteBorder, TitledBorder;

/**
 * Factory class for vending standard <code>Border</code> objects.  Wherever
 * possible, this factory will hand out references to shared
 * <code>Border</code> instances.
 * For further information and examples see
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/border.html">How
 * to Use Borders</a>,
 * a section in <em>The Java Tutorial</em>.
 *
 * @author David Kloba
 * @since 1.2
 */
export class BorderFactory extends JObject {
  static sharedRaisedBevel: Border = null;
  static sharedLoweredBevel: Border = null;
  static sharedSoftRaisedBevel: Border = null;
  static sharedSoftLoweredBevel: Border = null;
  static sharedEtchedBorder: Border = null;
  static sharedRaisedEtchedBorder: Border = null;
  static emptyBorder: Border = null;
  static sharedDashedBorder: Border = null;
  /**
   * Creates a line border with the specified color.
   *
   * @param color  a <code>Color</code> to use for the line
   * @return the <code>Border</code> object
   */
  static createLineBorder$Color(color: Color): Border {
    return new LineBorder()._LineBorder$Color$int(color, 1);
  }
  /**
   * Creates a line border with the specified color
   * and width. The width applies to all four sides of the
   * border. To specify widths individually for the top,
   * bottom, left, and right, use
   * {@link #createMatteBorder(int,int,int,int,Color)}.
   *
   * @param color  a <code>Color</code> to use for the line
   * @param thickness  an integer specifying the width in pixels
   * @return the <code>Border</code> object
   */
  static createLineBorder$Color$int(color: Color, thickness: number): Border {
    return new LineBorder()._LineBorder$Color$int(color, thickness);
  }
  /**
   * Creates a beveled border of the specified type, using
   * brighter shades of the component's current background color
   * for highlighting, and darker shading for shadows.
   * (In a lowered border, shadows are on top and highlights
   *  are underneath.)
   *
   * @param type  an integer specifying either
   *                  <code>BevelBorder.LOWERED</code> or
   *                  <code>BevelBorder.RAISED</code>
   * @return the <code>Border</code> object
   */
  static createBevelBorder$int(type$: number): Border {
    return BorderFactory.createSharedBevel(type$);
  }
  static createSharedBevel(type$: number): Border {
    if (type$ === BevelBorder.RAISED) {
      return BorderFactory.sharedRaisedBevel;
    } else if (type$ === BevelBorder.LOWERED) {
      return BorderFactory.sharedLoweredBevel;
    }
    return null;
  }
  /**
   * Creates a border with an "etched" look using
   * the component's current background color for
   * highlighting and shading.
   *
   * @return the <code>Border</code> object
   */
  static createEtchedBorder$(): Border {
    return BorderFactory.sharedEtchedBorder;
  }
  /**
   * Adds a title to an existing border,
   * with default positioning (determined by the current look and feel),
   * default justification (leading) and the default
   * font and text color (determined by the current look and feel).
   *
   * @param border     the <code>Border</code> object to add the title to
   * @param title      a <code>String</code> containing the text of the title
   * @return the <code>TitledBorder</code> object
   */
  static createTitledBorder$Border$String(border: Border, title: string): TitledBorder {
    return new TitledBorder()._TitledBorder$Border$String(border, title);
  }
  /**
   * Creates an empty border that takes up no space. (The width
   * of the top, bottom, left, and right sides are all zero.)
   *
   * @return the <code>Border</code> object
   */
  static createEmptyBorder$(): Border {
    return BorderFactory.emptyBorder;
  }
  /**
   * Creates an empty border that takes up space but which does
   * no drawing, specifying the width of the top, left, bottom, and
   * right sides.
   *
   * @param top     an integer specifying the width of the top,
   *                  in pixels
   * @param left    an integer specifying the width of the left side,
   *                  in pixels
   * @param bottom  an integer specifying the width of the bottom,
   *                  in pixels
   * @param right   an integer specifying the width of the right side,
   *                  in pixels
   * @return the <code>Border</code> object
   */
  static createEmptyBorder$int$int$int$int(top: number, left: number, bottom: number, right: number): Border {
    return new EmptyBorder()._EmptyBorder$int$int$int$int(top, left, bottom, right);
  }
  /**
   * Creates a compound border specifying the border objects to use
   * for the outside and inside edges.
   *
   * @param outsideBorder  a <code>Border</code> object for the outer
   *                          edge of the compound border
   * @param insideBorder   a <code>Border</code> object for the inner
   *                          edge of the compound border
   * @return the <code>CompoundBorder</code> object
   */
  static createCompoundBorder$Border$Border(outsideBorder: Border, insideBorder: Border): CompoundBorder {
    return new CompoundBorder()._CompoundBorder$Border$Border(outsideBorder, insideBorder);
  }
  /**
   * Creates a matte-look border using a solid color. (The difference between
   * this border and a line border is that you can specify the individual
   * border dimensions.)
   *
   * @param top     an integer specifying the width of the top,
   *                          in pixels
   * @param left    an integer specifying the width of the left side,
   *                          in pixels
   * @param bottom  an integer specifying the width of the right side,
   *                          in pixels
   * @param right   an integer specifying the width of the bottom,
   *                          in pixels
   * @param color   a <code>Color</code> to use for the border
   * @return the <code>MatteBorder</code> object
   */
  static createMatteBorder$int$int$int$int$Color(top: number, left: number, bottom: number, right: number, color: Color): MatteBorder {
    return new MatteBorder()._MatteBorder$int$int$int$int$Color(top, left, bottom, right, color);
  }
  /**
   * Creates a matte-look border that consists of multiple tiles of a
   * specified icon. Multiple copies of the icon are placed side-by-side
   * to fill up the border area.
   * <p>
   * Note:<br>
   * If the icon doesn't load, the border area is painted gray.
   *
   * @param top     an integer specifying the width of the top,
   *                          in pixels
   * @param left    an integer specifying the width of the left side,
   *                          in pixels
   * @param bottom  an integer specifying the width of the right side,
   *                          in pixels
   * @param right   an integer specifying the width of the bottom,
   *                          in pixels
   * @param tileIcon  the <code>Icon</code> object used for the border tiles
   * @return the <code>MatteBorder</code> object
   */
  static createMatteBorder$int$int$int$int$Icon(top: number, left: number, bottom: number, right: number, tileIcon: Icon): MatteBorder {
    return new MatteBorder()._MatteBorder$int$int$int$int$Icon(top, left, bottom, right, tileIcon);
  }
  static $clinit() {
    BorderFactory.sharedRaisedBevel = new BevelBorder()._BevelBorder$int(BevelBorder.RAISED);
    BorderFactory.sharedLoweredBevel = new BevelBorder()._BevelBorder$int(BevelBorder.LOWERED);
    BorderFactory.sharedEtchedBorder = new EtchedBorder()._EtchedBorder$();
    BorderFactory.emptyBorder = new EmptyBorder()._EmptyBorder$int$int$int$int(0, 0, 0, 0);
  }
}

$J.define(BorderFactory, 'javax.swing.BorderFactory', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_BorderFactory' }, meths: { 'createDashedBorder(java.awt.Paint,float,float,float,boolean)': 'createDashedBorder$Paint$float$float$float$boolean', 'createDashedBorder(java.awt.Paint,float,float)': 'createDashedBorder$Paint$float$float', 'createDashedBorder(java.awt.Paint)': 'createDashedBorder$Paint', 'createStrokeBorder(java.awt.BasicStroke,java.awt.Paint)': 'createStrokeBorder$BasicStroke$Paint', 'createStrokeBorder(java.awt.BasicStroke)': 'createStrokeBorder$BasicStroke', 'createMatteBorder(int,int,int,int,javax.swing.Icon)': 'createMatteBorder$int$int$int$int$Icon', 'createMatteBorder(int,int,int,int,java.awt.Color)': 'createMatteBorder$int$int$int$int$Color', 'createCompoundBorder(javax.swing.border.Border,javax.swing.border.Border)': 'createCompoundBorder$Border$Border', 'createCompoundBorder()': 'createCompoundBorder$', 'createEmptyBorder(int,int,int,int)': 'createEmptyBorder$int$int$int$int', 'createEmptyBorder()': 'createEmptyBorder$', 'createTitledBorder(javax.swing.border.Border,java.lang.String,int,int,java.awt.Font,java.awt.Color)': 'createTitledBorder$Border$String$int$int$Font$Color', 'createTitledBorder(javax.swing.border.Border,java.lang.String,int,int,java.awt.Font)': 'createTitledBorder$Border$String$int$int$Font', 'createTitledBorder(javax.swing.border.Border,java.lang.String,int,int)': 'createTitledBorder$Border$String$int$int', 'createTitledBorder(javax.swing.border.Border,java.lang.String)': 'createTitledBorder$Border$String', 'createTitledBorder(javax.swing.border.Border)': 'createTitledBorder$Border', 'createTitledBorder(java.lang.String)': 'createTitledBorder$String', 'createEtchedBorder(int,java.awt.Color,java.awt.Color)': 'createEtchedBorder$int$Color$Color', 'createEtchedBorder(int)': 'createEtchedBorder$int', 'createEtchedBorder(java.awt.Color,java.awt.Color)': 'createEtchedBorder$Color$Color', 'createEtchedBorder()': 'createEtchedBorder$', 'createSoftBevelBorder(int,java.awt.Color,java.awt.Color,java.awt.Color,java.awt.Color)': 'createSoftBevelBorder$int$Color$Color$Color$Color', 'createSoftBevelBorder(int,java.awt.Color,java.awt.Color)': 'createSoftBevelBorder$int$Color$Color', 'createSoftBevelBorder(int)': 'createSoftBevelBorder$int', 'createBevelBorder(int,java.awt.Color,java.awt.Color,java.awt.Color,java.awt.Color)': 'createBevelBorder$int$Color$Color$Color$Color', 'createBevelBorder(int,java.awt.Color,java.awt.Color)': 'createBevelBorder$int$Color$Color', 'createBevelBorder(int)': 'createBevelBorder$int', 'createLineBorder(java.awt.Color,int,boolean)': 'createLineBorder$Color$int$boolean', 'createLineBorder(java.awt.Color,int)': 'createLineBorder$Color$int', 'createLineBorder(java.awt.Color)': 'createLineBorder$Color' }, clinit: true, lazy: ['sharedRaisedBevel', 'sharedLoweredBevel', 'sharedSoftRaisedBevel', 'sharedSoftLoweredBevel', 'sharedEtchedBorder', 'sharedRaisedEtchedBorder', 'emptyBorder', 'sharedDashedBorder'] });
$J.module(() => {
  BevelBorder = $J.load('javax.swing.border.BevelBorder');
  CompoundBorder = $J.load('javax.swing.border.CompoundBorder');
  EmptyBorder = $J.load('javax.swing.border.EmptyBorder');
  EtchedBorder = $J.load('javax.swing.border.EtchedBorder');
  LineBorder = $J.load('javax.swing.border.LineBorder');
  MatteBorder = $J.load('javax.swing.border.MatteBorder');
  TitledBorder = $J.load('javax.swing.border.TitledBorder');
});
