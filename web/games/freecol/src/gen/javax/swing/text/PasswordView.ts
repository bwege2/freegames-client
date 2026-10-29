// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/PasswordView.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../jre/index.ts';
import { FieldView } from './FieldView.ts';

let Graphics2D, Rectangle, JPasswordField, PlainView, PlainView$FPMethodArgs, Position$Bias, Utilities, View, SwingUtilities2;

/**
 * Implements a View suitable for use in JPasswordField
 * UI implementations.  This is basically a field ui that
 * renders its contents as the echo character specified
 * in the associated component (if it can narrow the
 * component to a JPasswordField).
 *
 * @author  Timothy Prinzing
 * @see     View
 */
export class PasswordView extends FieldView {
  static ONE: number[] = null;
  drawEchoCharacterOverridden: boolean = false;
  /**
   * Constructs a new view wrapped on an element.
   *
   * @param elem the element
   */
  _PasswordView(elem: Element): this {
    this._FieldView(elem);
    this.drawEchoCharacterOverridden = PlainView.getFPMethodOverridden($J.getClass(this), 'drawEchoCharacter', PlainView$FPMethodArgs.GNNC);
    return this;
  }
  /**
   * Renders the given range in the model as normal unselected
   * text.  This sets the foreground color and echos the characters
   * using the value returned by getEchoChar().
   *
   * @param g the graphics context
   * @param x the starting X coordinate &gt;= 0
   * @param y the starting Y coordinate &gt;= 0
   * @param p0 the starting offset in the model &gt;= 0
   * @param p1 the ending offset in the model &gt;= p0
   * @return the X location of the end of the range &gt;= 0
   * @throws BadLocationException if p0 or p1 are out of range
   *
   * @deprecated replaced by
   *     {@link #drawUnselectedText(Graphics2D, float, float, int, int)}
   */
  drawUnselectedText$Graphics$int$int$int$int(g: Graphics, x: number, y: number, p0: number, p1: number): number {
    return $J.d2i(this.drawUnselectedTextImpl$Graphics$float$float$int$int$boolean$PasswordView(g, Math.fround(x), Math.fround(y), p0, p1, false));
  }
  drawUnselectedText$Graphics2D$float$float$int$int(g: Graphics2D, x: number, y: number, p0: number, p1: number): number {
    return this.drawUnselectedTextImpl$Graphics$float$float$int$int$boolean$PasswordView(g, x, y, p0, p1, true);
  }
  drawUnselectedTextImpl$Graphics$float$float$int$int$boolean$PasswordView(g: Graphics, x: number, y: number, p0: number, p1: number, useFPAPI: boolean): number {
    let c = this.getContainer();
    if (c instanceof JPasswordField) {
      let f = c;
      if (!f.echoCharIsSet()) {
        let useDrawUnselectedFPAPI = useFPAPI && this.drawUnselectedTextOverridden && g instanceof Graphics2D;
        return (useDrawUnselectedFPAPI) ? super.drawUnselectedText$Graphics2D$float$float$int$int(g, x, y, p0, p1) : Math.fround(super.drawUnselectedText$Graphics$int$int$int$int(g, $J.d2i(x), $J.d2i(y), p0, p1));
      }
      if (f.isEnabled()) {
        g.setColor(f.getForeground());
      } else {
        g.setColor(f.getDisabledTextColor());
      }
      let echoChar = f.getEchoChar();
      let n = (p1 - p0) | 0;
      let useEchoCharFPAPI = useFPAPI && this.drawEchoCharacterOverridden && g instanceof Graphics2D;
      for (let i = 0; i < n; i++) {
        x = (useEchoCharFPAPI) ? this.drawEchoCharacter$Graphics2D$float$float$char(g, x, y, echoChar) : Math.fround(this.drawEchoCharacter$Graphics$int$int$char(g, $J.d2i(x), $J.d2i(y), echoChar));
      }
    }
    return x;
  }
  /**
   * Renders the given range in the model as selected text.  This
   * is implemented to render the text in the color specified in
   * the hosting component.  It assumes the highlighter will render
   * the selected background.  Uses the result of getEchoChar() to
   * display the characters.
   *
   * @param g the graphics context
   * @param x the starting X coordinate &gt;= 0
   * @param y the starting Y coordinate &gt;= 0
   * @param p0 the starting offset in the model &gt;= 0
   * @param p1 the ending offset in the model &gt;= p0
   * @return the X location of the end of the range &gt;= 0
   * @throws BadLocationException if p0 or p1 are out of range
   *
   * @deprecated replaced by
   *     {@link #drawSelectedText(Graphics2D, float, float, int, int)}
   */
  drawSelectedText$Graphics$int$int$int$int(g: Graphics, x: number, y: number, p0: number, p1: number): number {
    return $J.d2i(this.drawSelectedTextImpl$Graphics$float$float$int$int$boolean$PasswordView(g, Math.fround(x), Math.fround(y), p0, p1, false));
  }
  drawSelectedText$Graphics2D$float$float$int$int(g: Graphics2D, x: number, y: number, p0: number, p1: number): number {
    return this.drawSelectedTextImpl$Graphics$float$float$int$int$boolean$PasswordView(g, x, y, p0, p1, true);
  }
  drawSelectedTextImpl$Graphics$float$float$int$int$boolean$PasswordView(g: Graphics, x: number, y: number, p0: number, p1: number, useFPAPI: boolean): number {
    g.setColor(this.selected);
    let c = this.getContainer();
    if (c instanceof JPasswordField) {
      let f = c;
      if (!f.echoCharIsSet()) {
        let useDrawUnselectedFPAPI = useFPAPI && this.drawSelectedTextOverridden && g instanceof Graphics2D;
        return (useFPAPI) ? super.drawSelectedText$Graphics2D$float$float$int$int(g, x, y, p0, p1) : Math.fround(super.drawSelectedText$Graphics$int$int$int$int(g, $J.d2i(x), $J.d2i(y), p0, p1));
      }
      let echoChar = f.getEchoChar();
      let n = (p1 - p0) | 0;
      let useEchoCharFPAPI = useFPAPI && this.drawEchoCharacterOverridden && g instanceof Graphics2D;
      for (let i = 0; i < n; i++) {
        x = (useEchoCharFPAPI) ? this.drawEchoCharacter$Graphics2D$float$float$char(g, x, y, echoChar) : Math.fround(this.drawEchoCharacter$Graphics$int$int$char(g, $J.d2i(x), $J.d2i(y), echoChar));
      }
    }
    return x;
  }
  /**
   * Renders the echo character, or whatever graphic should be used
   * to display the password characters.  The color in the Graphics
   * object is set to the appropriate foreground color for selected
   * or unselected text.
   *
   * @param g the graphics context
   * @param x the starting X coordinate &gt;= 0
   * @param y the starting Y coordinate &gt;= 0
   * @param c the echo character
   * @return the updated X position &gt;= 0
   *
   * @deprecated replaced by
   *     {@link #drawEchoCharacter(Graphics2D, float, float, char)}
   */
  drawEchoCharacter$Graphics$int$int$char(g: Graphics, x: number, y: number, c: number): number {
    return $J.d2i(this.drawEchoCharacterImpl(g, Math.fround(x), Math.fround(y), c, false));
  }
  /**
   * Renders the echo character, or whatever graphic should be used
   * to display the password characters.  The color in the Graphics
   * object is set to the appropriate foreground color for selected
   * or unselected text.
   *
   * @param g the graphics context
   * @param x the starting X coordinate {@code >= 0}
   * @param y the starting Y coordinate {@code >= 0}
   * @param c the echo character
   * @return the updated X position {@code >= 0}
   *
   * @since 9
   */
  drawEchoCharacter$Graphics2D$float$float$char(g: Graphics2D, x: number, y: number, c: number): number {
    return this.drawEchoCharacterImpl(g, x, y, c, true);
  }
  drawEchoCharacterImpl(g: Graphics, x: number, y: number, c: number, useFPAPI: boolean): number {
    PasswordView.ONE[0] = c;
    SwingUtilities2.drawChars$JComponent$Graphics$charArr$int$int$float$float(Utilities.getJComponent(this), g, PasswordView.ONE, 0, 1, x, y);
    if (useFPAPI) {
      return Math.fround(x + g.getFontMetrics$().charWidth$char(c));
    } else {
      let frc = g.getFontMetrics$().getFontRenderContext();
      return Math.fround(x + Math.fround(g.getFont().getStringBounds$charArr$int$int$FontRenderContext(PasswordView.ONE, 0, 1, frc).getWidth()));
    }
  }
  /**
   * Provides a mapping from the document model coordinate space
   * to the coordinate space of the view mapped to it.
   *
   * @param pos the position to convert &gt;= 0
   * @param a the allocated region to render into
   * @return the bounding box of the given position
   * @throws BadLocationException  if the given position does not
   *   represent a valid location in the associated document
   * @see View#modelToView
   */
  modelToView$int$Shape$Bias(pos: number, a: Shape, b: Position$Bias): Shape {
    let c = this.getContainer();
    if (c instanceof JPasswordField) {
      let f = c;
      if (!f.echoCharIsSet()) {
        return super.modelToView$int$Shape$Bias(pos, a, b);
      }
      let echoChar = f.getEchoChar();
      let m = f.getFontMetrics(f.getFont());
      let alloc = this.adjustAllocation(a).getBounds();
      let dx = Math.imul(((pos - this.getStartOffset()) | 0), m.charWidth$char(echoChar));
      alloc.x_ = (alloc.x_ + dx) | 0;
      alloc.width_ = 1;
      return alloc;
    }
    return null;
  }
  /**
   * Provides a mapping from the view coordinate space to the logical
   * coordinate space of the model.
   *
   * @param fx the X coordinate &gt;= 0.0f
   * @param fy the Y coordinate &gt;= 0.0f
   * @param a the allocated region to render into
   * @return the location within the model that best represents the
   *  given point in the view
   * @see View#viewToModel
   */
  viewToModel$float$float$Shape$BiasArr(fx: number, fy: number, a: Shape, bias: Position$Bias[]): number {
    bias[0] = Position$Bias.Forward;
    let n = 0;
    let c = this.getContainer();
    if (c instanceof JPasswordField) {
      let f = c;
      if (!f.echoCharIsSet()) {
        return super.viewToModel$float$float$Shape$BiasArr(fx, fy, a, bias);
      }
      let echoChar = f.getEchoChar();
      let charWidth = f.getFontMetrics(f.getFont()).charWidth$char(echoChar);
      a = this.adjustAllocation(a);
      let alloc = (a instanceof Rectangle) ? a : a.getBounds();
      n = (charWidth > 0 ? $J.idiv((($J.d2i(fx) - alloc.x_) | 0), charWidth) : 2147483647);
      if (n < 0) {
        n = 0;
      } else if (n > ((this.getStartOffset() + this.getDocument().getLength()) | 0)) {
        n = (this.getDocument().getLength() - this.getStartOffset()) | 0;
      }
    }
    return (this.getStartOffset() + n) | 0;
  }
  /**
   * Determines the preferred span for this view along an
   * axis.
   *
   * @param axis may be either View.X_AXIS or View.Y_AXIS
   * @return   the span the view would like to be rendered into &gt;= 0.
   *           Typically the view is told to render into the span
   *           that is returned, although there is no guarantee.
   *           The parent may choose to resize or break the view.
   */
  getPreferredSpan(axis: number): number {
    {
      let c: Container;
      switch (axis) {
        case View.X_AXIS:
          c = this.getContainer();
          if (c instanceof JPasswordField) {
            let f = c;
            if (f.echoCharIsSet()) {
              let echoChar = f.getEchoChar();
              let m = f.getFontMetrics(f.getFont());
              let doc = this.getDocument();
              return Math.fround(Math.imul(m.charWidth$char(echoChar), this.getDocument().getLength()));
            }
          }
      }
    }
    return super.getPreferredSpan(axis);
  }
  static $clinit() {
    PasswordView.ONE = $J.newArray(1, 0);
  }
}

$J.define(PasswordView, 'javax.swing.text.PasswordView', { kind: 'class', sup: 'javax.swing.text.FieldView', ctors: { 'javax.swing.text.Element': '_PasswordView' }, meths: { 'viewToModel(float,float,java.awt.Shape,javax.swing.text.Position.Bias[])': 'viewToModel$float$float$Shape$BiasArr', 'modelToView(int,java.awt.Shape,javax.swing.text.Position$Bias)': 'modelToView$int$Shape$Bias', 'drawEchoCharacter(java.awt.Graphics2D,float,float,char)': 'drawEchoCharacter$Graphics2D$float$float$char', 'drawEchoCharacter(java.awt.Graphics,int,int,char)': 'drawEchoCharacter$Graphics$int$int$char', 'drawSelectedTextImpl(java.awt.Graphics,float,float,int,int,boolean)': 'drawSelectedTextImpl$Graphics$float$float$int$int$boolean$PasswordView', 'drawSelectedText(java.awt.Graphics2D,float,float,int,int)': 'drawSelectedText$Graphics2D$float$float$int$int', 'drawSelectedText(java.awt.Graphics,int,int,int,int)': 'drawSelectedText$Graphics$int$int$int$int', 'drawUnselectedTextImpl(java.awt.Graphics,float,float,int,int,boolean)': 'drawUnselectedTextImpl$Graphics$float$float$int$int$boolean$PasswordView', 'drawUnselectedText(java.awt.Graphics2D,float,float,int,int)': 'drawUnselectedText$Graphics2D$float$float$int$int', 'drawUnselectedText(java.awt.Graphics,int,int,int,int)': 'drawUnselectedText$Graphics$int$int$int$int' }, clinit: true, lazy: ['ONE'] });
$J.module(() => {
  Graphics2D = $J.load('java.awt.Graphics2D');
  Rectangle = $J.load('java.awt.Rectangle');
  JPasswordField = $J.load('javax.swing.JPasswordField');
  PlainView = $J.load('javax.swing.text.PlainView');
  PlainView$FPMethodArgs = $J.load('javax.swing.text.PlainView$FPMethodArgs');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  Utilities = $J.load('javax.swing.text.Utilities');
  View = $J.load('javax.swing.text.View');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
