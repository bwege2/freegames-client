// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalComboBoxEditor.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { BasicComboBoxEditor } from '../basic/BasicComboBoxEditor.ts';
import { AbstractBorder } from '../../border/AbstractBorder.ts';

let Insets, JTextField, MetalLookAndFeel;

/**
 * The default editor for Metal editable combo boxes
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
 * @author Steve Wilson
 */
export class MetalComboBoxEditor extends BasicComboBoxEditor {
  /**
   * The default editor border <code>Insets</code>. This field
   * might not be used.
   */
  static editorBorderInsets: Insets = null;
  /**
   * Constructs a new instance of {@code MetalComboBoxEditor}.
   */
  _MetalComboBoxEditor(): this {
    this._BasicComboBoxEditor();
    this.editor = new (MetalComboBoxEditor$1())().$o(this)._JTextField$String$int('', 9);
    this.editor.setBorder(new MetalComboBoxEditor$EditorBorder()._MetalComboBoxEditor$EditorBorder());
    return this;
  }
  static $clinit() {
    MetalComboBoxEditor.editorBorderInsets = new Insets()._Insets(2, 2, 2, 0);
  }
}

export class MetalComboBoxEditor$EditorBorder extends AbstractBorder {
  _MetalComboBoxEditor$EditorBorder(): this {
    this._AbstractBorder();
    return this;
  }
  paintBorder(c: Component, g: Graphics, x: number, y: number, w: number, h: number): void {
    g.translate$int$int(x, y);
    if (MetalLookAndFeel.usingOcean()) {
      g.setColor(MetalLookAndFeel.getControlDarkShadow());
      g.drawRect(0, 0, w, (h - 1) | 0);
      g.setColor(MetalLookAndFeel.getControlShadow());
      g.drawRect(1, 1, (w - 2) | 0, (h - 3) | 0);
    } else {
      g.setColor(MetalLookAndFeel.getControlDarkShadow());
      g.drawLine(0, 0, (w - 1) | 0, 0);
      g.drawLine(0, 0, 0, (h - 2) | 0);
      g.drawLine(0, (h - 2) | 0, (w - 1) | 0, (h - 2) | 0);
      g.setColor(MetalLookAndFeel.getControlHighlight());
      g.drawLine(1, 1, (w - 1) | 0, 1);
      g.drawLine(1, 1, 1, (h - 1) | 0);
      g.drawLine(1, (h - 1) | 0, (w - 1) | 0, (h - 1) | 0);
      g.setColor(MetalLookAndFeel.getControl());
      g.drawLine(1, (h - 2) | 0, 1, (h - 2) | 0);
    }
    g.translate$int$int(-x, -y);
  }
  getBorderInsets$Component$Insets(c: Component, insets: Insets): Insets {
    insets.set(2, 2, 2, 0);
    return insets;
  }
}

/**
 * A subclass of BasicComboBoxEditor that implements UIResource.
 * BasicComboBoxEditor doesn't implement UIResource
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
export class MetalComboBoxEditor$UIResource extends MetalComboBoxEditor {
  /**
   * Constructs a {@code UIResource}.
   */
  _MetalComboBoxEditor$UIResource(): this {
    this._MetalComboBoxEditor();
    return this;
  }
}

let $MetalComboBoxEditor$1: any = null;
/** An anonymous class (MetalComboBoxEditor.java:57). */
function MetalComboBoxEditor$1(): any {
  return $MetalComboBoxEditor$1 ??= $J.local(class extends JTextField {
    setText(s: string): void {
      if ($J.equals(this.getText$(), s)) {
        return;
      }
      super.setText(s);
    }
    getPreferredSize$(): Dimension {
      let pref = super.getPreferredSize$();
      pref.height_ = (pref.height_ + 4) | 0;
      return pref;
    }
    getMinimumSize$(): Dimension {
      let min = super.getMinimumSize$();
      min.height_ = (min.height_ + 4) | 0;
      return min;
    }
  }, 'javax.swing.plaf.metal.MetalComboBoxEditor$1', []);
}

$J.define(MetalComboBoxEditor, 'javax.swing.plaf.metal.MetalComboBoxEditor', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicComboBoxEditor', ctors: { '': '_MetalComboBoxEditor' }, clinit: true, lazy: ['editorBorderInsets'] });
$J.define(MetalComboBoxEditor$EditorBorder, 'javax.swing.plaf.metal.MetalComboBoxEditor$EditorBorder', { kind: 'class', sup: 'javax.swing.border.AbstractBorder', ctors: { '': '_MetalComboBoxEditor$EditorBorder' }, meths: { 'getBorderInsets(java.awt.Component,java.awt.Insets)': 'getBorderInsets$Component$Insets' } });
$J.define(MetalComboBoxEditor$UIResource, 'javax.swing.plaf.metal.MetalComboBoxEditor$UIResource', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.plaf.metal.MetalComboBoxEditor', ctors: { '': '_MetalComboBoxEditor$UIResource' } });
$J.module(() => {
  Insets = $J.load('java.awt.Insets');
  JTextField = $J.load('javax.swing.JTextField');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
});
