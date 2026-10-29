// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/border/TitledBorder.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2025, Oracle and/or its affiliates. All rights reserved.
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
import { $J, CleanerFactory, IllegalArgumentException, Integer, JString, NullPointerException, WeakReference } from '../../../../jre/index.ts';
import { AbstractBorder } from './AbstractBorder.ts';

let Component$BaselineResizeBehavior, Font, Graphics2D, Insets, Rectangle, Path2D$Float, JComponent, JLabel, UIManager, BasicHTML;

/**
 * A class which implements an arbitrary border
 * with the addition of a String title in a
 * specified position and justification.
 * <p>
 * If the border, font, or color property values are not
 * specified in the constructor or by invoking the appropriate
 * set methods, the property values will be defined by the current
 * look and feel, using the following property names in the
 * Defaults Table:
 * <ul>
 * <li>&quot;TitledBorder.border&quot;
 * <li>&quot;TitledBorder.font&quot;
 * <li>&quot;TitledBorder.titleColor&quot;
 * </ul>
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
 * @author David Kloba
 * @author Amy Fowler
 */
export class TitledBorder extends AbstractBorder {
  /**
   * The title the border should display.
   */
  title: string = null;
  /**
   * The border.
   */
  border: Border = null;
  /**
   * The position for the title.
   */
  titlePosition: number = 0;
  /**
   * The justification for the title.
   */
  titleJustification: number = 0;
  /**
   * The font for rendering the title.
   */
  titleFont: Font = null;
  /**
   * The color of the title.
   */
  titleColor: Color = null;
  label: JLabel = null;
  /**
   * Use the default vertical orientation for the title text.
   */
  static readonly DEFAULT_POSITION: number = 0;
  /**
   * Position the title above the border's top line.
   */
  static readonly ABOVE_TOP: number = 1;
  /**
   * Position the title in the middle of the border's top line.
   */
  static readonly TOP: number = 2;
  /**
   * Position the title below the border's top line.
   */
  static readonly BELOW_TOP: number = 3;
  /**
   * Position the title above the border's bottom line.
   */
  static readonly ABOVE_BOTTOM: number = 4;
  /**
   * Position the title in the middle of the border's bottom line.
   */
  static readonly BOTTOM: number = 5;
  /**
   * Position the title below the border's bottom line.
   */
  static readonly BELOW_BOTTOM: number = 6;
  /**
   * Use the default justification for the title text.
   */
  static readonly DEFAULT_JUSTIFICATION: number = 0;
  /**
   * Position title text at the left side of the border line.
   */
  static readonly LEFT: number = 1;
  /**
   * Position title text in the center of the border line.
   */
  static readonly CENTER: number = 2;
  /**
   * Position title text at the right side of the border line.
   */
  static readonly RIGHT: number = 3;
  /**
   * Position title text at the left side of the border line
   *  for left to right orientation, at the right side of the
   *  border line for right to left orientation.
   */
  static readonly LEADING: number = 4;
  /**
   * Position title text at the right side of the border line
   *  for left to right orientation, at the left side of the
   *  border line for right to left orientation.
   */
  static readonly TRAILING: number = 5;
  /**
   * Space between the border and the component's edge
   */
  static readonly EDGE_SPACING: number = 2;
  /**
   * Space between the border and text
   */
  static readonly TEXT_SPACING: number = 2;
  /**
   * Horizontal inset of text that is left or right justified
   */
  static readonly TEXT_INSET_H: number = 5;
  /**
   * Creates a TitledBorder instance.
   *
   * @param title  the title the border should display
   */
  _TitledBorder$String(title: string): this {
    this._TitledBorder$Border$String$int$int$Font$Color(null, title, TitledBorder.LEADING, TitledBorder.DEFAULT_POSITION, null, null);
    return this;
  }
  /**
   * Creates a TitledBorder instance with the specified border
   * and title.
   *
   * @param border  the border
   * @param title  the title the border should display
   */
  _TitledBorder$Border$String(border: Border, title: string): this {
    this._TitledBorder$Border$String$int$int$Font$Color(border, title, TitledBorder.LEADING, TitledBorder.DEFAULT_POSITION, null, null);
    return this;
  }
  /**
   * Creates a TitledBorder instance with the specified border,
   * title, title-justification, title-position, title-font, and
   * title-color.
   *
   * @param border  the border
   * @param title  the title the border should display
   * @param titleJustification the justification for the title
   * @param titlePosition the position for the title
   * @param titleFont the font of the title
   * @param titleColor the color of the title
   */
  _TitledBorder$Border$String$int$int$Font$Color(border: Border, title: string, titleJustification: number, titlePosition: number, titleFont: Font, titleColor: Color): this {
    this._AbstractBorder();
    this.title = title;
    this.border = border;
    this.titleFont = titleFont;
    this.titleColor = titleColor;
    this.setTitleJustification(titleJustification);
    this.setTitlePosition(titlePosition);
    this.label = new JLabel()._JLabel$();
    this.label.setOpaque(false);
    this.label.putClientProperty(BasicHTML.propertyKey, null);
    this.installPropertyChangeListeners();
    return this;
  }
  /**
   * Paints the border for the specified component with the
   * specified position and size.
   * @param c the component for which this border is being painted
   * @param g the paint graphics
   * @param x the x position of the painted border
   * @param y the y position of the painted border
   * @param width the width of the painted border
   * @param height the height of the painted border
   */
  paintBorder(c: Component, g: Graphics, x: number, y: number, width: number, height: number): void {
    let border = this.getBorder();
    let title = this.getTitle();
    if ((title != null) && !(title.length === 0)) {
      let edge = (border instanceof TitledBorder) ? 0 : TitledBorder.EDGE_SPACING;
      let label = this.getLabel(c);
      let size = label.getPreferredSize$();
      let insets = TitledBorder.getBorderInsets(border, c, new Insets()._Insets(0, 0, 0, 0));
      let borderX = (x + edge) | 0;
      let borderY = (y + edge) | 0;
      let borderW = (width - edge - edge) | 0;
      let borderH = (height - edge - edge) | 0;
      let labelY = y;
      let labelH = size.height_;
      let position = this.getPosition();
      switch (position) {
        case TitledBorder.ABOVE_TOP:
          insets.left = 0;
          insets.right = 0;
          borderY = (borderY + (labelH - edge)) | 0;
          borderH = (borderH - (labelH - edge)) | 0;
          break;
        case TitledBorder.TOP:
          insets.top = (edge + $J.idiv(insets.top, 2) - $J.idiv(labelH, 2)) | 0;
          if (insets.top < edge) {
            borderY = (borderY - insets.top) | 0;
            borderH = (borderH + insets.top) | 0;
          } else {
            labelY = (labelY + insets.top) | 0;
          }
          break;
        case TitledBorder.BELOW_TOP:
          labelY = (labelY + (insets.top + edge)) | 0;
          break;
        case TitledBorder.ABOVE_BOTTOM:
          labelY = (labelY + (height - labelH - insets.bottom - edge)) | 0;
          break;
        case TitledBorder.BOTTOM:
          labelY = (labelY + (height - labelH)) | 0;
          insets.bottom = (edge + $J.idiv(((insets.bottom - labelH) | 0), 2)) | 0;
          if (insets.bottom < edge) {
            borderH = (borderH + insets.bottom) | 0;
          } else {
            labelY = (labelY - insets.bottom) | 0;
          }
          break;
        case TitledBorder.BELOW_BOTTOM:
          insets.left = 0;
          insets.right = 0;
          labelY = (labelY + (height - labelH)) | 0;
          borderH = (borderH - (labelH - edge)) | 0;
          break;
      }
      insets.left = (insets.left + (edge + TitledBorder.TEXT_INSET_H)) | 0;
      insets.right = (insets.right + (edge + TitledBorder.TEXT_INSET_H)) | 0;
      let labelX = x;
      let labelW = (width - insets.left - insets.right) | 0;
      if (labelW > size.width_) {
        labelW = size.width_;
      }
      switch (this.getJustification(c)) {
        case TitledBorder.LEFT:
          labelX = (labelX + insets.left) | 0;
          break;
        case TitledBorder.RIGHT:
          labelX = (labelX + (width - insets.right - labelW)) | 0;
          break;
        case TitledBorder.CENTER:
          labelX = (labelX + $J.idiv(((width - labelW) | 0), 2)) | 0;
          break;
      }
      if (border != null) {
        if ((position !== TitledBorder.TOP) && (position !== TitledBorder.BOTTOM)) {
          border.paintBorder(c, g, borderX, borderY, borderW, borderH);
        } else {
          let g2 = g.create$();
          if (g2 instanceof Graphics2D) {
            let g2d = g2;
            let path = new Path2D$Float()._Path2D$Float$();
            path.append$Shape$boolean(new Rectangle()._Rectangle$int$int$int$int(borderX, borderY, borderW, (labelY - borderY) | 0), false);
            path.append$Shape$boolean(new Rectangle()._Rectangle$int$int$int$int(borderX, labelY, (labelX - borderX - TitledBorder.TEXT_SPACING) | 0, labelH), false);
            path.append$Shape$boolean(new Rectangle()._Rectangle$int$int$int$int((labelX + labelW + TitledBorder.TEXT_SPACING) | 0, labelY, (borderX - labelX + borderW - labelW - TitledBorder.TEXT_SPACING) | 0, labelH), false);
            path.append$Shape$boolean(new Rectangle()._Rectangle$int$int$int$int(borderX, (labelY + labelH) | 0, borderW, (borderY - labelY + borderH - labelH) | 0), false);
            g2d.clip(path);
          }
          border.paintBorder(c, g2, borderX, borderY, borderW, borderH);
          g2.dispose();
        }
      }
      g.translate$int$int(labelX, labelY);
      label.setSize$int$int(labelW, labelH);
      label.paint(g);
      g.translate$int$int(-labelX, -labelY);
    } else if (border != null) {
      border.paintBorder(c, g, x, y, width, height);
    }
  }
  /**
   * Reinitialize the insets parameter with this Border's current Insets.
   * @param c the component for which this border insets value applies
   * @param insets the object to be reinitialized
   * @throws NullPointerException if the specified {@code insets}
   *         is {@code null}
   */
  getBorderInsets$Component$Insets(c: Component, insets: Insets): Insets {
    let border = this.getBorder();
    insets = TitledBorder.getBorderInsets(border, c, insets);
    let title = this.getTitle();
    if ((title != null) && !(title.length === 0)) {
      let edge = (border instanceof TitledBorder) ? 0 : TitledBorder.EDGE_SPACING;
      let label = this.getLabel(c);
      let size = label.getPreferredSize$();
      switch (this.getPosition()) {
        case TitledBorder.ABOVE_TOP:
          insets.top = (insets.top + (size.height_ - edge)) | 0;
          break;
        case TitledBorder.TOP:
          {
            if (insets.top < size.height_) {
              insets.top = (size.height_ - edge) | 0;
            }
            break;
          }
        case TitledBorder.BELOW_TOP:
          insets.top = (insets.top + size.height_) | 0;
          break;
        case TitledBorder.ABOVE_BOTTOM:
          insets.bottom = (insets.bottom + size.height_) | 0;
          break;
        case TitledBorder.BOTTOM:
          {
            if (insets.bottom < size.height_) {
              insets.bottom = (size.height_ - edge) | 0;
            }
            break;
          }
        case TitledBorder.BELOW_BOTTOM:
          insets.bottom = (insets.bottom + (size.height_ - edge)) | 0;
          break;
      }
      insets.top = (insets.top + (edge + TitledBorder.TEXT_SPACING)) | 0;
      insets.left = (insets.left + (edge + TitledBorder.TEXT_SPACING)) | 0;
      insets.right = (insets.right + (edge + TitledBorder.TEXT_SPACING)) | 0;
      insets.bottom = (insets.bottom + (edge + TitledBorder.TEXT_SPACING)) | 0;
    }
    return insets;
  }
  /**
   * Returns the title of the titled border.
   *
   * @return the title of the titled border
   */
  getTitle(): string {
    return this.title;
  }
  /**
   * Returns the border of the titled border.
   *
   * @return the border of the titled border
   */
  getBorder(): Border {
    return this.border != null ? this.border : UIManager.getBorder$Object('TitledBorder.border');
  }
  /**
   * Returns the title-position of the titled border.
   *
   * @return the title-position of the titled border
   */
  getTitlePosition(): number {
    return this.titlePosition;
  }
  /**
   * Returns the title-justification of the titled border.
   *
   * @return the title-justification of the titled border
   */
  getTitleJustification(): number {
    return this.titleJustification;
  }
  /**
   * Returns the title-font of the titled border.
   *
   * @return the title-font of the titled border
   */
  getTitleFont(): Font {
    return this.titleFont == null ? UIManager.getFont$Object('TitledBorder.font') : this.titleFont;
  }
  /**
   * Returns the title-color of the titled border.
   *
   * @return the title-color of the titled border
   */
  getTitleColor(): Color {
    return this.titleColor == null ? UIManager.getColor$Object('TitledBorder.titleColor') : this.titleColor;
  }
  /**
   * Sets the title of the titled border.
   * @param title  the title for the border
   */
  setTitle(title: string): void {
    this.title = title;
  }
  /**
   * Sets the title-position of the titled border.
   * @param titlePosition the position for the border
   */
  setTitlePosition(titlePosition: number): void {
    switch (titlePosition) {
      case TitledBorder.ABOVE_TOP:
      case TitledBorder.TOP:
      case TitledBorder.BELOW_TOP:
      case TitledBorder.ABOVE_BOTTOM:
      case TitledBorder.BOTTOM:
      case TitledBorder.BELOW_BOTTOM:
      case TitledBorder.DEFAULT_POSITION:
        this.titlePosition = titlePosition;
        break;
      default:
        throw new IllegalArgumentException(titlePosition + ' is not a valid title position.');
    }
  }
  /**
   * Sets the title-justification of the titled border.
   * @param titleJustification the justification for the border
   */
  setTitleJustification(titleJustification: number): void {
    switch (titleJustification) {
      case TitledBorder.DEFAULT_JUSTIFICATION:
      case TitledBorder.LEFT:
      case TitledBorder.CENTER:
      case TitledBorder.RIGHT:
      case TitledBorder.LEADING:
      case TitledBorder.TRAILING:
        this.titleJustification = titleJustification;
        break;
      default:
        throw new IllegalArgumentException(titleJustification + ' is not a valid title justification.');
    }
  }
  /**
   * Returns the baseline.
   *
   * @throws NullPointerException if {@code Component} is {@code null}
   * @throws IllegalArgumentException {@inheritDoc}
   * @see javax.swing.JComponent#getBaseline(int, int)
   * @since 1.6
   */
  getBaseline(c: Component, width: number, height: number): number {
    if (c == null) {
      throw new NullPointerException('Must supply non-null component');
    }
    if (width < 0) {
      throw new IllegalArgumentException('Width must be >= 0');
    }
    if (height < 0) {
      throw new IllegalArgumentException('Height must be >= 0');
    }
    let border = this.getBorder();
    let title = this.getTitle();
    if ((title != null) && !(title.length === 0)) {
      let edge = (border instanceof TitledBorder) ? 0 : TitledBorder.EDGE_SPACING;
      let label = this.getLabel(c);
      let size = label.getPreferredSize$();
      let insets = TitledBorder.getBorderInsets(border, c, new Insets()._Insets(0, 0, 0, 0));
      let baseline = label.getBaseline(size.width_, size.height_);
      switch (this.getPosition()) {
        case TitledBorder.ABOVE_TOP:
          return baseline;
        case TitledBorder.TOP:
          insets.top = (edge + $J.idiv(((insets.top - size.height_) | 0), 2)) | 0;
          return (insets.top < edge) ? baseline : (baseline + insets.top) | 0;
        case TitledBorder.BELOW_TOP:
          return (baseline + insets.top + edge) | 0;
        case TitledBorder.ABOVE_BOTTOM:
          return (baseline + height - size.height_ - insets.bottom - edge) | 0;
        case TitledBorder.BOTTOM:
          insets.bottom = (edge + $J.idiv(((insets.bottom - size.height_) | 0), 2)) | 0;
          return (insets.bottom < edge) ? (baseline + height - size.height_) | 0 : (baseline + height - size.height_ + insets.bottom) | 0;
        case TitledBorder.BELOW_BOTTOM:
          return (baseline + height - size.height_) | 0;
      }
    }
    return -1;
  }
  /**
   * Returns an enum indicating how the baseline of the border
   * changes as the size changes.
   *
   * @throws NullPointerException {@inheritDoc}
   * @see javax.swing.JComponent#getBaseline(int, int)
   * @since 1.6
   */
  getBaselineResizeBehavior(c: Component): Component$BaselineResizeBehavior {
    super.getBaselineResizeBehavior(c);
    switch (this.getPosition()) {
      case TitledBorder.ABOVE_TOP:
      case TitledBorder.TOP:
      case TitledBorder.BELOW_TOP:
        return Component$BaselineResizeBehavior.CONSTANT_ASCENT;
      case TitledBorder.ABOVE_BOTTOM:
      case TitledBorder.BOTTOM:
      case TitledBorder.BELOW_BOTTOM:
        return Component$BaselineResizeBehavior.CONSTANT_DESCENT;
    }
    return Component$BaselineResizeBehavior.OTHER;
  }
  getPosition(): number {
    let position = this.getTitlePosition();
    if (position !== TitledBorder.DEFAULT_POSITION) {
      return position;
    }
    let value = UIManager.get$Object('TitledBorder.position');
    if ($J.isa(value, Integer)) {
      let i = value;
      if ((0 < i) && (i <= 6)) {
        return i;
      }
    } else if ($J.isa(value, JString)) {
      let s = value;
      if (JString.equalsIgnoreCase(s, 'ABOVE_TOP')) {
        return TitledBorder.ABOVE_TOP;
      }
      if (JString.equalsIgnoreCase(s, 'TOP')) {
        return TitledBorder.TOP;
      }
      if (JString.equalsIgnoreCase(s, 'BELOW_TOP')) {
        return TitledBorder.BELOW_TOP;
      }
      if (JString.equalsIgnoreCase(s, 'ABOVE_BOTTOM')) {
        return TitledBorder.ABOVE_BOTTOM;
      }
      if (JString.equalsIgnoreCase(s, 'BOTTOM')) {
        return TitledBorder.BOTTOM;
      }
      if (JString.equalsIgnoreCase(s, 'BELOW_BOTTOM')) {
        return TitledBorder.BELOW_BOTTOM;
      }
    }
    return TitledBorder.TOP;
  }
  getJustification(c: Component): number {
    let justification = this.getTitleJustification();
    if ((justification === TitledBorder.LEADING) || (justification === TitledBorder.DEFAULT_JUSTIFICATION)) {
      return c.getComponentOrientation().isLeftToRight() ? TitledBorder.LEFT : TitledBorder.RIGHT;
    }
    if (justification === TitledBorder.TRAILING) {
      return c.getComponentOrientation().isLeftToRight() ? TitledBorder.RIGHT : TitledBorder.LEFT;
    }
    return justification;
  }
  /**
   * Returns default font of the titled border.
   * @return default font of the titled border
   * @param c the component
   */
  getFont(c: Component): Font {
    let font = this.getTitleFont();
    if (font != null) {
      return font;
    }
    if (c != null) {
      font = c.getFont();
      if (font != null) {
        return font;
      }
    }
    return new Font()._Font$String$int$int(Font.DIALOG, Font.PLAIN, 12);
  }
  getColor(c: Component): Color {
    let color = this.getTitleColor();
    if (color != null) {
      return color;
    }
    return (c != null) ? c.getForeground() : null;
  }
  getLabel(c: Component): JLabel {
    var comp;
    if ((comp = c) instanceof JComponent) {
      this.label.putClientProperty('html.disable', comp.getClientProperty('html.disable'));
    }
    this.label.setText(this.getTitle());
    this.label.setFont(this.getFont(c));
    this.label.setForeground(this.getColor(c));
    this.label.setComponentOrientation(c.getComponentOrientation());
    this.label.setEnabled(c.isEnabled());
    return this.label;
  }
  static getBorderInsets(border: Border, c: Component, insets: Insets): Insets {
    if (border == null) {
      insets.set(0, 0, 0, 0);
    } else if (border instanceof AbstractBorder) {
      let ab = border;
      insets = ab.getBorderInsets$Component$Insets(c, insets);
    } else {
      let i = border.getBorderInsets$Component(c);
      insets.set(i.top, i.left, i.bottom, i.right);
    }
    return insets;
  }
  installPropertyChangeListeners(): void {
    let weakReference = new WeakReference(this);
    let listener = (evt) => {
      let tb = weakReference.get();
      let prop = evt.getPropertyName();
      if (tb != null && ($J.equals('lookAndFeel', prop) || $J.equals('LabelUI', prop))) {
        tb.label.updateUI();
      }
    };
    UIManager.addPropertyChangeListener(listener);
    UIManager.getDefaults().addPropertyChangeListener(listener);
    CleanerFactory.cleaner().register(this, () => {
      UIManager.removePropertyChangeListener(listener);
      UIManager.getDefaults().removePropertyChangeListener(listener);
    });
  }
}

$J.define(TitledBorder, 'javax.swing.border.TitledBorder', { kind: 'class', sup: 'javax.swing.border.AbstractBorder', ctors: { 'javax.swing.border.Border,java.lang.String,int,int,java.awt.Font,java.awt.Color': '_TitledBorder$Border$String$int$int$Font$Color', 'javax.swing.border.Border,java.lang.String,int,int,java.awt.Font': '_TitledBorder$Border$String$int$int$Font', 'javax.swing.border.Border,java.lang.String,int,int': '_TitledBorder$Border$String$int$int', 'javax.swing.border.Border,java.lang.String': '_TitledBorder$Border$String', 'javax.swing.border.Border': '_TitledBorder$Border', 'java.lang.String': '_TitledBorder$String' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.module(() => {
  Component$BaselineResizeBehavior = $J.load('java.awt.Component$BaselineResizeBehavior');
  Font = $J.load('java.awt.Font');
  Graphics2D = $J.load('java.awt.Graphics2D');
  Insets = $J.load('java.awt.Insets');
  Rectangle = $J.load('java.awt.Rectangle');
  Path2D$Float = $J.load('java.awt.geom.Path2D$Float');
  JComponent = $J.load('javax.swing.JComponent');
  JLabel = $J.load('javax.swing.JLabel');
  UIManager = $J.load('javax.swing.UIManager');
  BasicHTML = $J.load('javax.swing.plaf.basic.BasicHTML');
});
