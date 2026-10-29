// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalTreeUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2017, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../../../jre/index.ts';
import { BasicTreeUI } from '../basic/BasicTreeUI.ts';

let UIManager;

/**
 * The metal look and feel implementation of <code>TreeUI</code>.
 * <p>
 * <code>MetalTreeUI</code> allows for configuring how to
 * visually render the spacing and delineation between nodes. The following
 * hints are supported:
 *
 * <table class="striped">
 * <caption>Descriptions of supported hints: Angled, Horizontal, and None
 * </caption>
 * <thead>
 *   <tr>
 *     <th scope="col">Hint
 *     <th scope="col">Description
 * </thead>
 * <tbody>
 *   <tr>
 *     <th scope="row">Angled
 *     <td>A line is drawn connecting the child to the parent. For handling of
 *     the root node refer to {@link JTree#setRootVisible} and
 *     {@link JTree#setShowsRootHandles}.
 *   <tr>
 *     <th scope="row">Horizontal
 *     <td>A horizontal line is drawn dividing the children of the root node.
 *   <tr>
 *     <th scope="row">None
 *     <td>Do not draw any visual indication between nodes.
 * </tbody>
 * </table>
 * <p>
 * As it is typically impractical to obtain the <code>TreeUI</code> from
 * the <code>JTree</code> and cast to an instance of <code>MetalTreeUI</code>
 * you enable this property via the client property
 * <code>JTree.lineStyle</code>. For example, to switch to
 * <code>Horizontal</code> style you would do:
 * <code>tree.putClientProperty("JTree.lineStyle", "Horizontal");</code>
 * <p>
 * The default is <code>Angled</code>.
 *
 * @author Tom Santos
 * @author Steve Wilson (value add stuff)
 */
export class MetalTreeUI extends BasicTreeUI {
  static lineColor: Color = null;
  static readonly LINE_STYLE: string = 'JTree.lineStyle';
  static readonly LEG_LINE_STYLE_STRING: string = 'Angled';
  static readonly HORIZ_STYLE_STRING: string = 'Horizontal';
  static readonly NO_STYLE_STRING: string = 'None';
  static readonly LEG_LINE_STYLE: number = 2;
  static readonly HORIZ_LINE_STYLE: number = 1;
  static readonly NO_LINE_STYLE: number = 0;
  lineStyle: number = 0;
  lineStyleListener: PropertyChangeListener = null;
  /**
   * Constructs the {@code MetalTreeUI}.
   */
  _MetalTreeUI(): this {
    this._BasicTreeUI();
    this.lineStyle = MetalTreeUI.LEG_LINE_STYLE;
    this.lineStyleListener = $J.fn(new MetalTreeUI$LineListener().$o(this)._MetalTreeUI$LineListener(), 'propertyChange');
    return this;
  }
  /**
   * Constructs the {@code MetalTreeUI}.
   *
   * @param x a component
   * @return the instance of the {@code MetalTreeUI}
   */
  static createUI(x: JComponent): ComponentUI {
    return new MetalTreeUI()._MetalTreeUI();
  }
  getHorizontalLegBuffer(): number {
    return 3;
  }
  installUI(c: JComponent): void {
    super.installUI(c);
    MetalTreeUI.lineColor = UIManager.getColor$Object('Tree.line');
    let lineStyleFlag = c.getClientProperty(MetalTreeUI.LINE_STYLE);
    this.decodeLineStyle(lineStyleFlag);
    c.addPropertyChangeListener$PropertyChangeListener(this.lineStyleListener);
  }
  uninstallUI(c: JComponent): void {
    c.removePropertyChangeListener$PropertyChangeListener(this.lineStyleListener);
    super.uninstallUI(c);
  }
  /**
   * Converts between the string passed into the client property
   * and the internal representation (currently and int)
   *
   * @param lineStyleFlag a flag
   */
  decodeLineStyle(lineStyleFlag: any): void {
    if (lineStyleFlag == null || $J.equals(lineStyleFlag, MetalTreeUI.LEG_LINE_STYLE_STRING)) {
      this.lineStyle = MetalTreeUI.LEG_LINE_STYLE;
    } else {
      if ($J.equals(lineStyleFlag, MetalTreeUI.NO_STYLE_STRING)) {
        this.lineStyle = MetalTreeUI.NO_LINE_STYLE;
      } else if ($J.equals(lineStyleFlag, MetalTreeUI.HORIZ_STYLE_STRING)) {
        this.lineStyle = MetalTreeUI.HORIZ_LINE_STYLE;
      }
    }
  }
  paint(g: Graphics, c: JComponent): void {
    super.paint(g, c);
    if (this.lineStyle === MetalTreeUI.HORIZ_LINE_STYLE && !this.largeModel) {
      this.paintHorizontalSeparators(g, c);
    }
  }
  /**
   * Paints the horizontal separators.
   *
   * @param g an instance of {@code Graphics}
   * @param c a component
   */
  paintHorizontalSeparators(g: Graphics, c: JComponent): void {
    g.setColor(MetalTreeUI.lineColor);
    let clipBounds = g.getClipBounds$();
    let beginRow = this.getRowForPath(this.tree, this.getClosestPathForLocation(this.tree, 0, clipBounds.y_));
    let endRow = this.getRowForPath(this.tree, this.getClosestPathForLocation(this.tree, 0, (clipBounds.y_ + clipBounds.height_ - 1) | 0));
    if (beginRow <= -1 || endRow <= -1) {
      return;
    }
    for (let i = beginRow; i <= endRow; ++i) {
      let path = this.getPathForRow(this.tree, i);
      if (path != null && path.getPathCount() === 2) {
        let rowBounds = this.getPathBounds$JTree$TreePath(this.tree, this.getPathForRow(this.tree, i));
        if (rowBounds != null) {
          g.drawLine(clipBounds.x_, rowBounds.y_, (clipBounds.x_ + clipBounds.width_) | 0, rowBounds.y_);
        }
      }
    }
  }
  paintVerticalPartOfLeg(g: Graphics, clipBounds: Rectangle, insets: Insets, path: TreePath): void {
    if (this.lineStyle === MetalTreeUI.LEG_LINE_STYLE) {
      super.paintVerticalPartOfLeg(g, clipBounds, insets, path);
    }
  }
  paintHorizontalPartOfLeg(g: Graphics, clipBounds: Rectangle, insets: Insets, bounds: Rectangle, path: TreePath, row: number, isExpanded: boolean, hasBeenExpanded: boolean, isLeaf: boolean): void {
    if (this.lineStyle === MetalTreeUI.LEG_LINE_STYLE) {
      super.paintHorizontalPartOfLeg(g, clipBounds, insets, bounds, path, row, isExpanded, hasBeenExpanded, isLeaf);
    }
  }
}

/**
 * This class listens for changes in line style
 */
export class MetalTreeUI$LineListener extends JObject {
  _MetalTreeUI$LineListener(): this {
    return this;
  }
  propertyChange(e: PropertyChangeEvent): void {
    let name = e.getPropertyName();
    if ($J.equals(name, MetalTreeUI.LINE_STYLE)) {
      this.$outer.decodeLineStyle(e.getNewValue());
    }
  }
}

$J.define(MetalTreeUI, 'javax.swing.plaf.metal.MetalTreeUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicTreeUI', ctors: { '': '_MetalTreeUI' }, meths: { 'isLocationInExpandControl(int,int,int,int)': 'isLocationInExpandControl$int$int$int$int' } });
$J.define(MetalTreeUI$LineListener, 'javax.swing.plaf.metal.MetalTreeUI$LineListener', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_MetalTreeUI$LineListener' }, inner: true });
$J.module(() => {
  UIManager = $J.load('javax.swing.UIManager');
});
