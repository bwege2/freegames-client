// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/DefaultListCellRenderer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2023, Oracle and/or its affiliates. All rights reserved.
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
import { $J, SynthListUI } from '../../../jre/index.ts';
import { JLabel } from './JLabel.ts';

let Icon, EmptyBorder, BasicHTML, DefaultLookup, SwingUtilities2;

/**
 * Renders an item in a list.
 * <p>
 * <strong><a id="override">Implementation Note:</a></strong>
 * This class overrides
 * <code>invalidate</code>,
 * <code>validate</code>,
 * <code>revalidate</code>,
 * <code>repaint</code>,
 * <code>isOpaque</code>,
 * and
 * <code>firePropertyChange</code>
 * solely to improve performance.
 * If not overridden, these frequently called methods would execute code paths
 * that are unnecessary for the default list cell renderer.
 * If you write your own renderer,
 * take care to weigh the benefits and
 * drawbacks of overriding these methods.
 *
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
 * @author Hans Muller
 * @since 1.2
 */
export class DefaultListCellRenderer extends JLabel {
  /**
   * An empty <code>Border</code>. This field might not be used. To change the
   * <code>Border</code> used by this renderer override the
   * <code>getListCellRendererComponent</code> method and set the border
   * of the returned component directly.
   */
  static SAFE_NO_FOCUS_BORDER: Border = null;
  static DEFAULT_NO_FOCUS_BORDER: Border = null;
  /**
   * No focus border
   */
  static noFocusBorder: Border = null;
  /**
   * Constructs a default renderer object for an item
   * in a list.
   */
  _DefaultListCellRenderer(): this {
    this._JLabel$();
    this.setOpaque(true);
    this.setBorder(this.getNoFocusBorder());
    this.setName('List.cellRenderer');
    return this;
  }
  getNoFocusBorder(): Border {
    let border = DefaultLookup.getBorder$JComponent$ComponentUI$String(this, this.ui, 'List.cellNoFocusBorder');
    if ($J.system_getSecurityManager() != null) {
      if (border != null) {
        return border;
      }
      return DefaultListCellRenderer.SAFE_NO_FOCUS_BORDER;
    } else {
      if (border != null && (DefaultListCellRenderer.noFocusBorder == null || DefaultListCellRenderer.noFocusBorder === DefaultListCellRenderer.DEFAULT_NO_FOCUS_BORDER)) {
        return border;
      }
      return DefaultListCellRenderer.noFocusBorder;
    }
  }
  getListCellRendererComponent(list: JList<any>, value: any, index: number, isSelected: boolean, cellHasFocus: boolean): Component {
    this.setComponentOrientation(list.getComponentOrientation());
    let bg = null;
    let fg = null;
    let dropLocation = list.getDropLocation();
    if (dropLocation != null && !dropLocation.isInsert() && dropLocation.getIndex() === index) {
      bg = DefaultLookup.getColor$JComponent$ComponentUI$String(this, this.ui, 'List.dropCellBackground');
      fg = DefaultLookup.getColor$JComponent$ComponentUI$String(this, this.ui, 'List.dropCellForeground');
      isSelected = true;
    }
    if (isSelected) {
      this.setBackground(bg == null ? list.getSelectionBackground() : bg);
      this.setForeground(fg == null ? list.getSelectionForeground() : fg);
    } else {
      this.setBackground(list.getBackground());
      this.setForeground(list.getForeground());
    }
    if ($J.isa(value, Icon)) {
      this.setIcon(value);
      this.setText('');
    } else {
      this.setIcon(null);
      this.setText((value == null) ? '' : $J.str(value));
    }
    if (list.getName$() == null || !$J.equals(list.getName$(), 'ComboBox.list') || !($J.isa(list.getUI(), SynthListUI))) {
      this.setEnabled(list.isEnabled());
    }
    this.setFont(list.getFont());
    let border = null;
    if (cellHasFocus) {
      if (isSelected) {
        border = DefaultLookup.getBorder$JComponent$ComponentUI$String(this, this.ui, 'List.focusSelectedCellHighlightBorder');
      }
      if (border == null) {
        border = DefaultLookup.getBorder$JComponent$ComponentUI$String(this, this.ui, 'List.focusCellHighlightBorder');
      }
    } else {
      border = this.getNoFocusBorder();
    }
    this.setBorder(border);
    return this;
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   *
   * @since 1.5
   * @return <code>true</code> if the background is completely opaque
   *         and differs from the JList's background;
   *         <code>false</code> otherwise
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
   */
  validate(): void {
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
   */
  firePropertyChange$String$Object$Object(propertyName: string, oldValue: any, newValue: any): void {
    if (propertyName === 'text' || ((SwingUtilities2.isScaleChanged$String$Object$Object(propertyName, oldValue, newValue) || propertyName === 'font' || propertyName === 'foreground') && oldValue !== newValue && this.getClientProperty(BasicHTML.propertyKey) != null)) {
      super.firePropertyChange$String$Object$Object(propertyName, oldValue, newValue);
    }
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   */
  firePropertyChange$String$int$int(propertyName: string, oldValue: number, newValue: number): void {
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   */
  firePropertyChange$String$boolean$boolean(propertyName: string, oldValue: boolean, newValue: boolean): void {
  }
  static $clinit() {
    DefaultListCellRenderer.SAFE_NO_FOCUS_BORDER = new EmptyBorder()._EmptyBorder$int$int$int$int(1, 1, 1, 1);
    DefaultListCellRenderer.DEFAULT_NO_FOCUS_BORDER = new EmptyBorder()._EmptyBorder$int$int$int$int(1, 1, 1, 1);
    DefaultListCellRenderer.noFocusBorder = DefaultListCellRenderer.DEFAULT_NO_FOCUS_BORDER;
  }
}

/**
 * A subclass of DefaultListCellRenderer that implements UIResource.
 * DefaultListCellRenderer doesn't implement UIResource
 * directly so that applications can safely override the
 * cellRenderer property with DefaultListCellRenderer subclasses.
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
export class DefaultListCellRenderer$UIResource extends DefaultListCellRenderer {
  /**
   * Constructs a {@code UIResource}.
   */
  _DefaultListCellRenderer$UIResource(): this {
    this._DefaultListCellRenderer();
    return this;
  }
}

$J.define(DefaultListCellRenderer, 'javax.swing.DefaultListCellRenderer', { kind: 'class', ifaces: ['javax.swing.ListCellRenderer', 'java.io.Serializable'], sup: 'javax.swing.JLabel', ctors: { '': '_DefaultListCellRenderer' }, meths: { 'firePropertyChange(java.lang.String,boolean,boolean)': 'firePropertyChange$String$boolean$boolean', 'firePropertyChange(java.lang.String,double,double)': 'firePropertyChange$String$double$double', 'firePropertyChange(java.lang.String,float,float)': 'firePropertyChange$String$float$float', 'firePropertyChange(java.lang.String,long,long)': 'firePropertyChange$String$long$long', 'firePropertyChange(java.lang.String,int,int)': 'firePropertyChange$String$int$int', 'firePropertyChange(java.lang.String,short,short)': 'firePropertyChange$String$short$short', 'firePropertyChange(java.lang.String,char,char)': 'firePropertyChange$String$char$char', 'firePropertyChange(java.lang.String,byte,byte)': 'firePropertyChange$String$byte$byte', 'firePropertyChange(java.lang.String,java.lang.Object,java.lang.Object)': 'firePropertyChange$String$Object$Object', 'repaint(java.awt.Rectangle)': 'repaint$Rectangle', 'repaint(long,int,int,int,int)': 'repaint$long$int$int$int$int', 'repaint()': 'repaint$' }, clinit: true, lazy: ['SAFE_NO_FOCUS_BORDER', 'DEFAULT_NO_FOCUS_BORDER', 'noFocusBorder'] });
$J.define(DefaultListCellRenderer$UIResource, 'javax.swing.DefaultListCellRenderer$UIResource', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.DefaultListCellRenderer', ctors: { '': '_DefaultListCellRenderer$UIResource' } });
$J.module(() => {
  Icon = $J.load('javax.swing.Icon');
  EmptyBorder = $J.load('javax.swing.border.EmptyBorder');
  BasicHTML = $J.load('javax.swing.plaf.basic.BasicHTML');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
