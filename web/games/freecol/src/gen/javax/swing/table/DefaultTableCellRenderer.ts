// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/table/DefaultTableCellRenderer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { JLabel } from '../JLabel.ts';

let EmptyBorder, UIResource, BasicHTML, DefaultLookup, SwingUtilities2;

/**
 * The standard class for rendering (displaying) individual cells
 * in a <code>JTable</code>.
 * <p>
 *
 * <strong><a id="override">Implementation Note:</a></strong>
 * This class inherits from <code>JLabel</code>, a standard component class.
 * However <code>JTable</code> employs a unique mechanism for rendering
 * its cells and therefore requires some slightly modified behavior
 * from its cell renderer.
 * The table class defines a single cell renderer and uses it as a
 * as a rubber-stamp for rendering all cells in the table;
 * it renders the first cell,
 * changes the contents of that cell renderer,
 * shifts the origin to the new location, re-draws it, and so on.
 * The standard <code>JLabel</code> component was not
 * designed to be used this way and we want to avoid
 * triggering a <code>revalidate</code> each time the
 * cell is drawn. This would greatly decrease performance because the
 * <code>revalidate</code> message would be
 * passed up the hierarchy of the container to determine whether any other
 * components would be affected.
 * As the renderer is only parented for the lifetime of a painting operation
 * we similarly want to avoid the overhead associated with walking the
 * hierarchy for painting operations.
 * So this class
 * overrides the <code>validate</code>, <code>invalidate</code>,
 * <code>revalidate</code>, <code>repaint</code>, and
 * <code>firePropertyChange</code> methods to be
 * no-ops and override the <code>isOpaque</code> method solely to improve
 * performance.  If you write your own renderer,
 * please keep this performance consideration in mind.
 * <p>
 *
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @author Philip Milne
 * @see JTable
 */
export class DefaultTableCellRenderer extends JLabel {
  /**
   * An empty <code>Border</code>. This field might not be used. To change the
   * <code>Border</code> used by this renderer override the
   * <code>getTableCellRendererComponent</code> method and set the border
   * of the returned component directly.
   */
  static SAFE_NO_FOCUS_BORDER: Border = null;
  static DEFAULT_NO_FOCUS_BORDER: Border = null;
  /**
   * A border without focus.
   */
  static noFocusBorder: Border = null;
  unselectedForeground: Color = null;
  unselectedBackground: Color = null;
  /**
   * Creates a default table cell renderer.
   */
  _DefaultTableCellRenderer(): this {
    this._JLabel$();
    this.setOpaque(true);
    this.setBorder(this.getNoFocusBorder());
    this.setName('Table.cellRenderer');
    return this;
  }
  getNoFocusBorder(): Border {
    let border = DefaultLookup.getBorder$JComponent$ComponentUI$String(this, this.ui, 'Table.cellNoFocusBorder');
    if ($J.system_getSecurityManager() != null) {
      if (border != null) {
        return border;
      }
      return DefaultTableCellRenderer.SAFE_NO_FOCUS_BORDER;
    } else if (border != null) {
      if (DefaultTableCellRenderer.noFocusBorder == null || DefaultTableCellRenderer.noFocusBorder === DefaultTableCellRenderer.DEFAULT_NO_FOCUS_BORDER) {
        return border;
      }
    }
    return DefaultTableCellRenderer.noFocusBorder;
  }
  /**
   * Overrides <code>JComponent.setForeground</code> to assign
   * the unselected-foreground color to the specified color.
   *
   * @param c set the foreground color to this value
   */
  setForeground(c: Color): void {
    super.setForeground(c);
    this.unselectedForeground = c;
  }
  /**
   * Overrides <code>JComponent.setBackground</code> to assign
   * the unselected-background color to the specified color.
   *
   * @param c set the background color to this value
   */
  setBackground(c: Color): void {
    super.setBackground(c);
    this.unselectedBackground = c;
  }
  /**
   * Notification from the <code>UIManager</code> that the look and feel
   * [L&amp;F] has changed.
   * Replaces the current UI object with the latest version from the
   * <code>UIManager</code>.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    super.updateUI();
    this.setForeground(null);
    this.setBackground(null);
  }
  /**
   * Returns the default table cell renderer.
   * <p>
   * During a printing operation, this method will be called with
   * <code>isSelected</code> and <code>hasFocus</code> values of
   * <code>false</code> to prevent selection and focus from appearing
   * in the printed output. To do other customization based on whether
   * or not the table is being printed, check the return value from
   * {@link javax.swing.JComponent#isPaintingForPrint()}.
   *
   * @param table  the <code>JTable</code>
   * @param value  the value to assign to the cell at
   *                  <code>[row, column]</code>
   * @param isSelected true if cell is selected
   * @param hasFocus true if cell has focus
   * @param row  the row of the cell to render
   * @param column the column of the cell to render
   * @return the default table cell renderer
   * @see javax.swing.JComponent#isPaintingForPrint()
   */
  getTableCellRendererComponent(table: JTable, value: any, isSelected: boolean, hasFocus: boolean, row: number, column: number): Component {
    if (table == null) {
      return this;
    }
    let fg = null;
    let bg = null;
    let dropLocation = table.getDropLocation();
    if (dropLocation != null && !dropLocation.isInsertRow() && !dropLocation.isInsertColumn() && dropLocation.getRow() === row && dropLocation.getColumn() === column) {
      fg = DefaultLookup.getColor$JComponent$ComponentUI$String(this, this.ui, 'Table.dropCellForeground');
      bg = DefaultLookup.getColor$JComponent$ComponentUI$String(this, this.ui, 'Table.dropCellBackground');
      isSelected = true;
    }
    if (isSelected) {
      super.setForeground(fg == null ? table.getSelectionForeground() : fg);
      super.setBackground(bg == null ? table.getSelectionBackground() : bg);
    } else {
      let background = this.unselectedBackground != null ? this.unselectedBackground : table.getBackground();
      if (background == null || $J.isa(background, UIResource)) {
        let alternateColor = DefaultLookup.getColor$JComponent$ComponentUI$String(this, this.ui, 'Table.alternateRowColor');
        if (alternateColor != null && row % 2 !== 0) {
          background = alternateColor;
        }
      }
      super.setForeground(this.unselectedForeground != null ? this.unselectedForeground : table.getForeground());
      super.setBackground(background);
    }
    this.setFont(table.getFont());
    if (hasFocus) {
      let border = null;
      if (isSelected) {
        border = DefaultLookup.getBorder$JComponent$ComponentUI$String(this, this.ui, 'Table.focusSelectedCellHighlightBorder');
      }
      if (border == null) {
        border = DefaultLookup.getBorder$JComponent$ComponentUI$String(this, this.ui, 'Table.focusCellHighlightBorder');
      }
      this.setBorder(border);
      if (!isSelected && table.isCellEditable(row, column)) {
        let col: Color;
        col = DefaultLookup.getColor$JComponent$ComponentUI$String(this, this.ui, 'Table.focusCellForeground');
        if (col != null) {
          super.setForeground(col);
        }
        col = DefaultLookup.getColor$JComponent$ComponentUI$String(this, this.ui, 'Table.focusCellBackground');
        if (col != null) {
          super.setBackground(col);
        }
      }
    } else {
      this.setBorder(this.getNoFocusBorder());
    }
    this.setValue(value);
    return this;
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   */
  isOpaque(): boolean {
    let back = this.getBackground();
    let p = this.getParent();
    if (p != null) {
      p = p.getParent();
    }
    let colorMatch = (back != null) && (p != null) && back.equals(p.getBackground()) && p.isOpaque();
    return !colorMatch && super.isOpaque();
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   *
   * @since 1.5
   */
  invalidate(): void {
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   */
  validate(): void {
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   */
  revalidate(): void {
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   */
  repaint$long$int$int$int$int(tm: number, x: number, y: number, width: number, height: number): void {
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   */
  repaint$Rectangle(r: Rectangle): void {
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   *
   * @since 1.5
   */
  repaint$(): void {
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   */
  firePropertyChange$String$Object$Object(propertyName: string, oldValue: any, newValue: any): void {
    if (propertyName === 'text' || propertyName === 'labelFor' || propertyName === 'displayedMnemonic' || ((SwingUtilities2.isScaleChanged$String$Object$Object(propertyName, oldValue, newValue) || propertyName === 'font' || propertyName === 'foreground') && oldValue !== newValue && this.getClientProperty(BasicHTML.propertyKey) != null)) {
      super.firePropertyChange$String$Object$Object(propertyName, oldValue, newValue);
    }
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   */
  firePropertyChange$String$boolean$boolean(propertyName: string, oldValue: boolean, newValue: boolean): void {
  }
  /**
   * Sets the <code>String</code> object for the cell being rendered to
   * <code>value</code>.
   *
   * @param value  the string value for this cell; if value is
   *          <code>null</code> it sets the text value to an empty string
   * @see JLabel#setText
   */
  setValue(value: any): void {
    this.setText((value == null) ? '' : $J.str(value));
  }
  static $clinit() {
    DefaultTableCellRenderer.SAFE_NO_FOCUS_BORDER = new EmptyBorder()._EmptyBorder$int$int$int$int(1, 1, 1, 1);
    DefaultTableCellRenderer.DEFAULT_NO_FOCUS_BORDER = new EmptyBorder()._EmptyBorder$int$int$int$int(1, 1, 1, 1);
    DefaultTableCellRenderer.noFocusBorder = DefaultTableCellRenderer.DEFAULT_NO_FOCUS_BORDER;
  }
}

/**
 * A subclass of <code>DefaultTableCellRenderer</code> that
 * implements <code>UIResource</code>.
 * <code>DefaultTableCellRenderer</code> doesn't implement
 * <code>UIResource</code>
 * directly so that applications can safely override the
 * <code>cellRenderer</code> property with
 * <code>DefaultTableCellRenderer</code> subclasses.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 */
export class DefaultTableCellRenderer$UIResource extends DefaultTableCellRenderer {
  /**
   * Constructs a {@code UIResource}.
   */
  _DefaultTableCellRenderer$UIResource(): this {
    this._DefaultTableCellRenderer();
    return this;
  }
}

$J.define(DefaultTableCellRenderer, 'javax.swing.table.DefaultTableCellRenderer', { kind: 'class', ifaces: ['javax.swing.table.TableCellRenderer', 'java.io.Serializable'], sup: 'javax.swing.JLabel', ctors: { '': '_DefaultTableCellRenderer' }, meths: { 'firePropertyChange(java.lang.String,boolean,boolean)': 'firePropertyChange$String$boolean$boolean', 'firePropertyChange(java.lang.String,java.lang.Object,java.lang.Object)': 'firePropertyChange$String$Object$Object', 'repaint()': 'repaint$', 'repaint(java.awt.Rectangle)': 'repaint$Rectangle', 'repaint(long,int,int,int,int)': 'repaint$long$int$int$int$int' }, clinit: true, lazy: ['SAFE_NO_FOCUS_BORDER', 'DEFAULT_NO_FOCUS_BORDER', 'noFocusBorder'] });
$J.define(DefaultTableCellRenderer$UIResource, 'javax.swing.table.DefaultTableCellRenderer$UIResource', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.table.DefaultTableCellRenderer', ctors: { '': '_DefaultTableCellRenderer$UIResource' } });
$J.module(() => {
  EmptyBorder = $J.load('javax.swing.border.EmptyBorder');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicHTML = $J.load('javax.swing.plaf.basic.BasicHTML');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
