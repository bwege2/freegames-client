// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/swing/table/DefaultTableCellHeaderRenderer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2005, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { DefaultTableCellRenderer } from '../../../javax/swing/table/DefaultTableCellRenderer.ts';

let Point, Rectangle, SortOrder, SwingConstants, SwingUtilities, DefaultLookup;

export class DefaultTableCellHeaderRenderer extends DefaultTableCellRenderer {
  horizontalTextPositionSet: boolean = false;
  sortArrow: Icon = null;
  emptyIcon: DefaultTableCellHeaderRenderer$EmptyIcon = null;
  _DefaultTableCellHeaderRenderer(): this {
    this._DefaultTableCellRenderer();
    this.emptyIcon = new DefaultTableCellHeaderRenderer$EmptyIcon()._DefaultTableCellHeaderRenderer$EmptyIcon();
    this.setHorizontalAlignment(SwingConstants.CENTER);
    return this;
  }
  setHorizontalTextPosition(textPosition: number): void {
    this.horizontalTextPositionSet = true;
    super.setHorizontalTextPosition(textPosition);
  }
  getTableCellRendererComponent(table: JTable, value: any, isSelected: boolean, hasFocus: boolean, row: number, column: number): Component {
    let sortIcon = null;
    let isPaintingForPrint = false;
    if (table != null) {
      let header = table.getTableHeader();
      if (header != null) {
        let fgColor = null;
        let bgColor = null;
        if (hasFocus) {
          fgColor = DefaultLookup.getColor$JComponent$ComponentUI$String(this, this.ui, 'TableHeader.focusCellForeground');
          bgColor = DefaultLookup.getColor$JComponent$ComponentUI$String(this, this.ui, 'TableHeader.focusCellBackground');
        }
        if (fgColor == null) {
          fgColor = header.getForeground();
        }
        if (bgColor == null) {
          bgColor = header.getBackground();
        }
        this.setForeground(fgColor);
        this.setBackground(bgColor);
        this.setFont(header.getFont());
        isPaintingForPrint = header.isPaintingForPrint();
      }
      if (!isPaintingForPrint && table.getRowSorter() != null) {
        if (!this.horizontalTextPositionSet) {
          this.setHorizontalTextPosition(SwingConstants.LEADING);
        }
        let sortOrder = DefaultTableCellHeaderRenderer.getColumnSortOrder(table, column);
        if (sortOrder != null) {
          switch (sortOrder) {
            case SortOrder.ASCENDING:
              sortIcon = DefaultLookup.getIcon$JComponent$ComponentUI$String(this, this.ui, 'Table.ascendingSortIcon');
              break;
            case SortOrder.DESCENDING:
              sortIcon = DefaultLookup.getIcon$JComponent$ComponentUI$String(this, this.ui, 'Table.descendingSortIcon');
              break;
            case SortOrder.UNSORTED:
              sortIcon = DefaultLookup.getIcon$JComponent$ComponentUI$String(this, this.ui, 'Table.naturalSortIcon');
              break;
          }
        }
      }
    }
    this.setText(value == null ? '' : $J.str(value));
    this.setIcon(sortIcon);
    this.sortArrow = sortIcon;
    let border = null;
    if (hasFocus) {
      border = DefaultLookup.getBorder$JComponent$ComponentUI$String(this, this.ui, 'TableHeader.focusCellBorder');
    }
    if (border == null) {
      border = DefaultLookup.getBorder$JComponent$ComponentUI$String(this, this.ui, 'TableHeader.cellBorder');
    }
    this.setBorder(border);
    return this;
  }
  static getColumnSortOrder(table: JTable, column: number): SortOrder {
    let rv = null;
    if (table == null || table.getRowSorter() == null) {
      return rv;
    }
    let sortKeys = table.getRowSorter().getSortKeys();
    if (sortKeys.size() > 0 && sortKeys.get(0).getColumn() === table.convertColumnIndexToModel(column)) {
      rv = sortKeys.get(0).getSortOrder();
    }
    return rv;
  }
  paintComponent(g: Graphics): void {
    let b = DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(this, this.ui, 'TableHeader.rightAlignSortArrow', false);
    if (b && this.sortArrow != null) {
      this.emptyIcon.width_ = this.sortArrow.getIconWidth();
      this.emptyIcon.height_ = this.sortArrow.getIconHeight();
      this.setIcon(this.emptyIcon);
      super.paintComponent(g);
      let position = this.computeIconPosition(g);
      this.sortArrow.paintIcon(this, g, position.x_, position.y_);
    } else {
      super.paintComponent(g);
    }
  }
  computeIconPosition(g: Graphics): Point {
    let fontMetrics = g.getFontMetrics$();
    let viewR = new Rectangle()._Rectangle$();
    let textR = new Rectangle()._Rectangle$();
    let iconR = new Rectangle()._Rectangle$();
    let i = this.getInsets$();
    viewR.x_ = i.left;
    viewR.y_ = i.top;
    viewR.width_ = (this.getWidth() - (i.left + i.right)) | 0;
    viewR.height_ = (this.getHeight() - (i.top + i.bottom)) | 0;
    SwingUtilities.layoutCompoundLabel$JComponent$FontMetrics$String$Icon$int$int$int$int$Rectangle$Rectangle$Rectangle$int(this, fontMetrics, this.getText(), this.sortArrow, this.getVerticalAlignment(), this.getHorizontalAlignment(), this.getVerticalTextPosition(), this.getHorizontalTextPosition(), viewR, iconR, textR, this.getIconTextGap());
    let x = (this.getWidth() - i.right - this.sortArrow.getIconWidth()) | 0;
    let y = iconR.y_;
    return new Point()._Point$int$int(x, y);
  }
}

export class DefaultTableCellHeaderRenderer$EmptyIcon extends JObject {
  width_: number = 0;
  height_: number = 0;
  _DefaultTableCellHeaderRenderer$EmptyIcon(): this {
    this.width_ = 0;
    this.height_ = 0;
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
  }
  getIconWidth(): number {
    return this.width_;
  }
  getIconHeight(): number {
    return this.height_;
  }
}

$J.define(DefaultTableCellHeaderRenderer, 'sun.swing.table.DefaultTableCellHeaderRenderer', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.table.DefaultTableCellRenderer', ctors: { '': '_DefaultTableCellHeaderRenderer' } });
$J.define(DefaultTableCellHeaderRenderer$EmptyIcon, 'sun.swing.table.DefaultTableCellHeaderRenderer$EmptyIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_DefaultTableCellHeaderRenderer$EmptyIcon' } });
$J.module(() => {
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  SortOrder = $J.load('javax.swing.SortOrder');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
});
