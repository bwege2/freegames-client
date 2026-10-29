// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/FlowLayout.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../jre/index.ts';

let Dimension;

/**
 * A flow layout arranges components in a directional flow, much
 * like lines of text in a paragraph. The flow direction is
 * determined by the container's {@code componentOrientation}
 * property and may be one of two values:
 * <ul>
 * <li>{@code ComponentOrientation.LEFT_TO_RIGHT}
 * <li>{@code ComponentOrientation.RIGHT_TO_LEFT}
 * </ul>
 * Flow layouts are typically used
 * to arrange buttons in a panel. It arranges buttons
 * horizontally until no more buttons fit on the same line.
 * The line alignment is determined by the {@code align}
 * property. The possible values are:
 * <ul>
 * <li>{@link #LEFT LEFT}
 * <li>{@link #RIGHT RIGHT}
 * <li>{@link #CENTER CENTER}
 * <li>{@link #LEADING LEADING}
 * <li>{@link #TRAILING TRAILING}
 * </ul>
 * <p>
 * For example, the following picture shows an applet using the flow
 * layout manager (its default layout manager) to position three buttons:
 * <p>
 * <img src="doc-files/FlowLayout-1.gif"
 * ALT="Graphic of Layout for Three Buttons"
 * style="margin: 7px 10px;">
 * <p>
 * Here is the code for this applet:
 *
 * <hr><blockquote><pre>
 * import java.awt.*;
 * import java.applet.Applet;
 *
 * public class myButtons extends Applet {
 *     Button button1, button2, button3;
 *     public void init() {
 *         button1 = new Button("Ok");
 *         button2 = new Button("Open");
 *         button3 = new Button("Close");
 *         add(button1);
 *         add(button2);
 *         add(button3);
 *     }
 * }
 * </pre></blockquote><hr>
 * <p>
 * A flow layout lets each component assume its natural (preferred) size.
 *
 * @author      Arthur van Hoff
 * @author      Sami Shaio
 * @since       1.0
 * @see ComponentOrientation
 */
export class FlowLayout extends JObject {
  /**
   * This value indicates that each row of components
   * should be left-justified.
   */
  static readonly LEFT: number = 0;
  /**
   * This value indicates that each row of components
   * should be centered.
   */
  static readonly CENTER: number = 1;
  /**
   * This value indicates that each row of components
   * should be right-justified.
   */
  static readonly RIGHT: number = 2;
  /**
   * This value indicates that each row of components
   * should be justified to the leading edge of the container's
   * orientation, for example, to the left in left-to-right orientations.
   *
   * @see     java.awt.Component#getComponentOrientation
   * @see     java.awt.ComponentOrientation
   * @since   1.2
   */
  static readonly LEADING: number = 3;
  /**
   * This value indicates that each row of components
   * should be justified to the trailing edge of the container's
   * orientation, for example, to the right in left-to-right orientations.
   *
   * @see     java.awt.Component#getComponentOrientation
   * @see     java.awt.ComponentOrientation
   * @since   1.2
   */
  static readonly TRAILING: number = 4;
  /**
   * {@code align} is the property that determines
   * how each row distributes empty space.
   * It can be one of the following values:
   * <ul>
   * <li>{@code LEFT}
   * <li>{@code RIGHT}
   * <li>{@code CENTER}
   * </ul>
   *
   * @serial
   * @see #getAlignment
   * @see #setAlignment
   */
  align_: number = 0;
  /**
   * {@code newAlign} is the property that determines
   * how each row distributes empty space for the Java 2 platform,
   * v1.2 and greater.
   * It can be one of the following three values:
   * <ul>
   * <li>{@code LEFT}
   * <li>{@code RIGHT}
   * <li>{@code CENTER}
   * <li>{@code LEADING}
   * <li>{@code TRAILING}
   * </ul>
   *
   * @serial
   * @since 1.2
   * @see #getAlignment
   * @see #setAlignment
   */
  newAlign: number = 0;
  /**
   * The flow layout manager allows a separation of
   * components with gaps.  The horizontal gap will
   * specify the space between components and between
   * the components and the borders of the
   * {@code Container}.
   *
   * @serial
   * @see #getHgap()
   * @see #setHgap(int)
   */
  hgap: number = 0;
  /**
   * The flow layout manager allows a separation of
   * components with gaps.  The vertical gap will
   * specify the space between rows and between the
   * the rows and the borders of the {@code Container}.
   *
   * @serial
   * @see #getHgap()
   * @see #setHgap(int)
   */
  vgap: number = 0;
  /**
   * If true, components will be aligned on their baseline.
   */
  alignOnBaseline_: boolean = false;
  static readonly currentSerialVersion: number = 1;
  /**
   * This represent the {@code currentSerialVersion}
   * which is bein used.  It will be one of two values:
   * {@code 0} versions before Java 2 platform v1.2,
   * {@code 1} versions after  Java 2 platform v1.2.
   *
   * @serial
   * @since 1.2
   */
  serialVersionOnStream: number = 0;
  $init_FlowLayout() {
    this.serialVersionOnStream = FlowLayout.currentSerialVersion;
  }
  /**
   * Constructs a new {@code FlowLayout} with a centered alignment and a
   * default 5-unit horizontal and vertical gap.
   */
  _FlowLayout$(): this {
    this._FlowLayout$int$int$int(FlowLayout.CENTER, 5, 5);
    return this;
  }
  /**
   * Constructs a new {@code FlowLayout} with the specified
   * alignment and a default 5-unit horizontal and vertical gap.
   * The value of the alignment argument must be one of
   * {@code FlowLayout.LEFT}, {@code FlowLayout.RIGHT},
   * {@code FlowLayout.CENTER}, {@code FlowLayout.LEADING},
   * or {@code FlowLayout.TRAILING}.
   * @param align the alignment value
   */
  _FlowLayout$int(align: number): this {
    this._FlowLayout$int$int$int(align, 5, 5);
    return this;
  }
  /**
   * Creates a new flow layout manager with the indicated alignment
   * and the indicated horizontal and vertical gaps.
   * <p>
   * The value of the alignment argument must be one of
   * {@code FlowLayout.LEFT}, {@code FlowLayout.RIGHT},
   * {@code FlowLayout.CENTER}, {@code FlowLayout.LEADING},
   * or {@code FlowLayout.TRAILING}.
   * @param      align   the alignment value
   * @param      hgap    the horizontal gap between components
   *                     and between the components and the
   *                     borders of the {@code Container}
   * @param      vgap    the vertical gap between components
   *                     and between the components and the
   *                     borders of the {@code Container}
   */
  _FlowLayout$int$int$int(align: number, hgap: number, vgap: number): this {
    this.$init_FlowLayout();
    this.hgap = hgap;
    this.vgap = vgap;
    this.setAlignment(align);
    return this;
  }
  /**
   * Sets the alignment for this layout.
   * Possible values are
   * <ul>
   * <li>{@code FlowLayout.LEFT}
   * <li>{@code FlowLayout.RIGHT}
   * <li>{@code FlowLayout.CENTER}
   * <li>{@code FlowLayout.LEADING}
   * <li>{@code FlowLayout.TRAILING}
   * </ul>
   * @param      align one of the alignment values shown above
   * @see        #getAlignment()
   * @since      1.1
   */
  setAlignment(align: number): void {
    this.newAlign = align;
    switch (align) {
      case FlowLayout.LEADING:
        this.align_ = FlowLayout.LEFT;
        break;
      case FlowLayout.TRAILING:
        this.align_ = FlowLayout.RIGHT;
        break;
      default:
        this.align_ = align;
        break;
    }
  }
  /**
   * Returns true if components are to be vertically aligned along
   * their baseline.  The default is false.
   *
   * @return true if components are to be vertically aligned along
   *              their baseline
   * @since 1.6
   */
  getAlignOnBaseline(): boolean {
    return this.alignOnBaseline_;
  }
  /**
   * Adds the specified component to the layout.
   * Not used by this class.
   * @param name the name of the component
   * @param comp the component to be added
   */
  addLayoutComponent$String$Component(name: string, comp: Component): void {
  }
  /**
   * Removes the specified component from the layout.
   * Not used by this class.
   * @param comp the component to remove
   * @see       java.awt.Container#removeAll
   */
  removeLayoutComponent(comp: Component): void {
  }
  /**
   * Returns the preferred dimensions for this layout given the
   * <i>visible</i> components in the specified target container.
   *
   * @param target the container that needs to be laid out
   * @return    the preferred dimensions to lay out the
   *            subcomponents of the specified container
   * @see Container
   * @see #minimumLayoutSize
   * @see       java.awt.Container#getPreferredSize
   */
  preferredLayoutSize(target: Container): Dimension {
    {
      let dim = new Dimension()._Dimension$int$int(0, 0);
      let nmembers = target.getComponentCount();
      let firstVisibleComponent = true;
      let useBaseline = this.getAlignOnBaseline();
      let maxAscent = 0;
      let maxDescent = 0;
      for (let i = 0; i < nmembers; i++) {
        let m = target.getComponent$int(i);
        if (m.isVisible$()) {
          let d = m.getPreferredSize$();
          dim.height_ = Math.max(dim.height_, d.height_);
          if (firstVisibleComponent) {
            firstVisibleComponent = false;
          } else {
            dim.width_ = (dim.width_ + this.hgap) | 0;
          }
          dim.width_ = (dim.width_ + d.width_) | 0;
          if (useBaseline) {
            let baseline = m.getBaseline(d.width_, d.height_);
            if (baseline >= 0) {
              maxAscent = Math.max(maxAscent, baseline);
              maxDescent = Math.max(maxDescent, (d.height_ - baseline) | 0);
            }
          }
        }
      }
      if (useBaseline) {
        dim.height_ = Math.max((maxAscent + maxDescent) | 0, dim.height_);
      }
      let insets = target.getInsets$();
      dim.width_ = (dim.width_ + (insets.left + insets.right + Math.imul(this.hgap, 2))) | 0;
      dim.height_ = (dim.height_ + (insets.top + insets.bottom + Math.imul(this.vgap, 2))) | 0;
      return dim;
    }
  }
  /**
   * Returns the minimum dimensions needed to layout the <i>visible</i>
   * components contained in the specified target container.
   * @param target the container that needs to be laid out
   * @return    the minimum dimensions to lay out the
   *            subcomponents of the specified container
   * @see #preferredLayoutSize
   * @see       java.awt.Container
   * @see       java.awt.Container#doLayout
   */
  minimumLayoutSize(target: Container): Dimension {
    {
      let useBaseline = this.getAlignOnBaseline();
      let dim = new Dimension()._Dimension$int$int(0, 0);
      let nmembers = target.getComponentCount();
      let maxAscent = 0;
      let maxDescent = 0;
      let firstVisibleComponent = true;
      for (let i = 0; i < nmembers; i++) {
        let m = target.getComponent$int(i);
        if (m.visible) {
          let d = m.getMinimumSize$();
          dim.height_ = Math.max(dim.height_, d.height_);
          if (firstVisibleComponent) {
            firstVisibleComponent = false;
          } else {
            dim.width_ = (dim.width_ + this.hgap) | 0;
          }
          dim.width_ = (dim.width_ + d.width_) | 0;
          if (useBaseline) {
            let baseline = m.getBaseline(d.width_, d.height_);
            if (baseline >= 0) {
              maxAscent = Math.max(maxAscent, baseline);
              maxDescent = Math.max(maxDescent, (dim.height_ - baseline) | 0);
            }
          }
        }
      }
      if (useBaseline) {
        dim.height_ = Math.max((maxAscent + maxDescent) | 0, dim.height_);
      }
      let insets = target.getInsets$();
      dim.width_ = (dim.width_ + (insets.left + insets.right + Math.imul(this.hgap, 2))) | 0;
      dim.height_ = (dim.height_ + (insets.top + insets.bottom + Math.imul(this.vgap, 2))) | 0;
      return dim;
    }
  }
  /**
   * Centers the elements in the specified row, if there is any slack.
   * @param target the component which needs to be moved
   * @param x the x coordinate
   * @param y the y coordinate
   * @param width the width dimensions
   * @param height the height dimensions
   * @param rowStart the beginning of the row
   * @param rowEnd the ending of the row
   * @param useBaseline Whether or not to align on baseline.
   * @param ascent Ascent for the components. This is only valid if
   *               useBaseline is true.
   * @param descent Ascent for the components. This is only valid if
   *               useBaseline is true.
   * @return actual row height
   */
  moveComponents(target: Container, x: number, y: number, width: number, height: number, rowStart: number, rowEnd: number, ltr: boolean, useBaseline: boolean, ascent: number[], descent: number[]): number {
    switch (this.newAlign) {
      case FlowLayout.LEFT:
        x = (x + (ltr ? 0 : width)) | 0;
        break;
      case FlowLayout.CENTER:
        x = (x + $J.idiv(width, 2)) | 0;
        break;
      case FlowLayout.RIGHT:
        x = (x + (ltr ? width : 0)) | 0;
        break;
      case FlowLayout.LEADING:
        break;
      case FlowLayout.TRAILING:
        x = (x + width) | 0;
        break;
    }
    let maxAscent = 0;
    let nonbaselineHeight = 0;
    let baselineOffset = 0;
    if (useBaseline) {
      let maxDescent = 0;
      for (let i = rowStart; i < rowEnd; i++) {
        let m = target.getComponent$int(i);
        if (m.visible) {
          if (ascent[i] >= 0) {
            maxAscent = Math.max(maxAscent, ascent[i]);
            maxDescent = Math.max(maxDescent, descent[i]);
          } else {
            nonbaselineHeight = Math.max(m.getHeight(), nonbaselineHeight);
          }
        }
      }
      height = Math.max((maxAscent + maxDescent) | 0, nonbaselineHeight);
      baselineOffset = $J.idiv(((height - maxAscent - maxDescent) | 0), 2);
    }
    for (let i = rowStart; i < rowEnd; i++) {
      let m = target.getComponent$int(i);
      if (m.isVisible$()) {
        let cy: number;
        if (useBaseline && ascent[i] >= 0) {
          cy = (y + baselineOffset + maxAscent - ascent[i]) | 0;
        } else {
          cy = (y + $J.idiv(((height - m.height_) | 0), 2)) | 0;
        }
        if (ltr) {
          m.setLocation$int$int(x, cy);
        } else {
          m.setLocation$int$int((target.width_ - x - m.width_) | 0, cy);
        }
        x = (x + (m.width_ + this.hgap)) | 0;
      }
    }
    return height;
  }
  /**
   * Lays out the container. This method lets each
   * <i>visible</i> component take
   * its preferred size by reshaping the components in the
   * target container in order to satisfy the alignment of
   * this {@code FlowLayout} object.
   *
   * @param target the specified component being laid out
   * @see Container
   * @see       java.awt.Container#doLayout
   */
  layoutContainer$Container(target: Container): void {
    {
      let insets = target.getInsets$();
      let maxwidth = (target.width_ - (insets.left + insets.right + Math.imul(this.hgap, 2))) | 0;
      let nmembers = target.getComponentCount();
      let x = 0;
      let y = (insets.top + this.vgap) | 0;
      let rowh = 0;
      let start = 0;
      let ltr = target.getComponentOrientation().isLeftToRight();
      let useBaseline = this.getAlignOnBaseline();
      let ascent = null;
      let descent = null;
      if (useBaseline) {
        ascent = $J.newArray(nmembers, 0);
        descent = $J.newArray(nmembers, 0);
      }
      for (let i = 0; i < nmembers; i++) {
        let m = target.getComponent$int(i);
        if (m.isVisible$()) {
          let d = m.getPreferredSize$();
          m.setSize$int$int(d.width_, d.height_);
          if (useBaseline) {
            let baseline = m.getBaseline(d.width_, d.height_);
            if (baseline >= 0) {
              ascent[i] = baseline;
              descent[i] = (d.height_ - baseline) | 0;
            } else {
              ascent[i] = -1;
            }
          }
          if ((x === 0) || (((x + d.width_) | 0) <= maxwidth)) {
            if (x > 0) {
              x = (x + this.hgap) | 0;
            }
            x = (x + d.width_) | 0;
            rowh = Math.max(rowh, d.height_);
          } else {
            rowh = this.moveComponents(target, (insets.left + this.hgap) | 0, y, (maxwidth - x) | 0, rowh, start, i, ltr, useBaseline, ascent, descent);
            x = d.width_;
            y = (y + (this.vgap + rowh)) | 0;
            rowh = d.height_;
            start = i;
          }
        }
      }
      this.moveComponents(target, (insets.left + this.hgap) | 0, y, (maxwidth - x) | 0, rowh, start, nmembers, ltr, useBaseline, ascent, descent);
    }
  }
  /**
   * Returns a string representation of this {@code FlowLayout}
   * object and its values.
   * @return     a string representation of this layout
   */
  toString(): string {
    let str = '';
    switch (this.align_) {
      case FlowLayout.LEFT:
        str = ',align=left';
        break;
      case FlowLayout.CENTER:
        str = ',align=center';
        break;
      case FlowLayout.RIGHT:
        str = ',align=right';
        break;
      case FlowLayout.LEADING:
        str = ',align=leading';
        break;
      case FlowLayout.TRAILING:
        str = ',align=trailing';
        break;
    }
    return $J.getClass(this).getName() + '[hgap=' + this.hgap + ',vgap=' + this.vgap + str + ']';
  }
}

$J.define(FlowLayout, 'java.awt.FlowLayout', { kind: 'class', ifaces: ['java.awt.LayoutManager', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'int,int,int': '_FlowLayout$int$int$int', 'int': '_FlowLayout$int', '': '_FlowLayout$' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
});
