// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicComboBoxRenderer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString } from '../../../../../jre/index.ts';
import { JLabel } from '../../JLabel.ts';

let Icon, EmptyBorder;

/**
 * ComboBox renderer
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
 * @author Arnaud Weber
 */
export class BasicComboBoxRenderer extends JLabel {
  /**
   * An empty <code>Border</code>. This field might not be used. To change the
   * <code>Border</code> used by this renderer directly set it using
   * the <code>setBorder</code> method.
   */
  static noFocusBorder: Border = null;
  static SAFE_NO_FOCUS_BORDER: Border = null;
  /**
   * Constructs a new instance of {@code BasicComboBoxRenderer}.
   */
  _BasicComboBoxRenderer(): this {
    this._JLabel$();
    this.setOpaque(true);
    this.setBorder(BasicComboBoxRenderer.getNoFocusBorder());
    return this;
  }
  static getNoFocusBorder(): Border {
    if ($J.system_getSecurityManager() != null) {
      return BasicComboBoxRenderer.SAFE_NO_FOCUS_BORDER;
    } else {
      return BasicComboBoxRenderer.noFocusBorder;
    }
  }
  getPreferredSize$(): Dimension {
    let size: Dimension;
    if (this.getText() == null || (this.getText().length === 0)) {
      this.setText(' ');
      size = super.getPreferredSize$();
      this.setText('');
    } else {
      size = super.getPreferredSize$();
    }
    return size;
  }
  getListCellRendererComponent(list: JList<any>, value: any, index: number, isSelected: boolean, cellHasFocus: boolean): Component {
    if (isSelected) {
      this.setBackground(list.getSelectionBackground());
      this.setForeground(list.getSelectionForeground());
    } else {
      this.setBackground(list.getBackground());
      this.setForeground(list.getForeground());
    }
    this.setFont(list.getFont());
    if ($J.isa(value, Icon)) {
      this.setIcon(value);
    } else {
      this.setText((value == null) ? '' : $J.str(value));
    }
    return this;
  }
  static $clinit() {
    BasicComboBoxRenderer.noFocusBorder = new EmptyBorder()._EmptyBorder$int$int$int$int(1, 1, 1, 1);
    BasicComboBoxRenderer.SAFE_NO_FOCUS_BORDER = new EmptyBorder()._EmptyBorder$int$int$int$int(1, 1, 1, 1);
  }
}

/**
 * A subclass of BasicComboBoxRenderer that implements UIResource.
 * BasicComboBoxRenderer doesn't implement UIResource
 * directly so that applications can safely override the
 * cellRenderer property with BasicListCellRenderer subclasses.
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
export class BasicComboBoxRenderer$UIResource extends BasicComboBoxRenderer {
  /**
   * Constructs a {@code UIResource}.
   */
  _BasicComboBoxRenderer$UIResource(): this {
    this._BasicComboBoxRenderer();
    return this;
  }
}

$J.define(BasicComboBoxRenderer, 'javax.swing.plaf.basic.BasicComboBoxRenderer', { kind: 'class', ifaces: ['javax.swing.ListCellRenderer', 'java.io.Serializable'], sup: 'javax.swing.JLabel', ctors: { '': '_BasicComboBoxRenderer' }, meths: { 'getPreferredSize()': 'getPreferredSize$' }, clinit: true, lazy: ['noFocusBorder', 'SAFE_NO_FOCUS_BORDER'] });
$J.define(BasicComboBoxRenderer$UIResource, 'javax.swing.plaf.basic.BasicComboBoxRenderer$UIResource', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.plaf.basic.BasicComboBoxRenderer', ctors: { '': '_BasicComboBoxRenderer$UIResource' } });
$J.module(() => {
  Icon = $J.load('javax.swing.Icon');
  EmptyBorder = $J.load('javax.swing.border.EmptyBorder');
});
