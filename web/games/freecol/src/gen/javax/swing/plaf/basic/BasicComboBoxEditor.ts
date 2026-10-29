// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicComboBoxEditor.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Exception, JObject, JString, MethodUtil } from '../../../../../jre/index.ts';
import { JTextField } from '../../JTextField.ts';

/**
 * The default editor for editable combo boxes. The editor is implemented as a JTextField.
 *
 * @author Arnaud Weber
 * @author Mark Davidson
 */
export class BasicComboBoxEditor extends JObject {
  /**
   * An instance of {@code JTextField}.
   */
  editor: JTextField = null;
  oldValue: any = null;
  /**
   * Constructs a new instance of {@code BasicComboBoxEditor}.
   */
  _BasicComboBoxEditor(): this {
    this.editor = this.createEditorComponent();
    return this;
  }
  getEditorComponent(): Component {
    return this.editor;
  }
  /**
   * Creates the internal editor component. Override this to provide
   * a custom implementation.
   *
   * @return a new editor component
   * @since 1.6
   */
  createEditorComponent(): JTextField {
    let editor = new BasicComboBoxEditor$BorderlessTextField()._BasicComboBoxEditor$BorderlessTextField('', 9);
    editor.setBorder(null);
    return editor;
  }
  /**
   * Sets the item that should be edited.
   *
   * @param anObject the displayed value of the editor
   */
  setItem(anObject: any): void {
    let text: string;
    if (anObject != null) {
      text = $J.str(anObject);
      if (text == null) {
        text = '';
      }
      this.oldValue = anObject;
    } else {
      text = '';
    }
    if (!$J.equals(text, this.editor.getText$())) {
      this.editor.setText(text);
    }
  }
  getItem(): any {
    let newValue = this.editor.getText$();
    if (this.oldValue != null && !($J.isa(this.oldValue, JString))) {
      if ($J.equals(newValue, $J.str(this.oldValue))) {
        return this.oldValue;
      } else {
        let cls = $J.getClass(this.oldValue);
        try {
          let method = MethodUtil.getMethod(cls, 'valueOf', [$J.cls(JString)]);
          newValue = MethodUtil.invoke(method, this.oldValue, [this.editor.getText$()]);
        } catch ($e0) {
          if ($J.isa($e0, Exception)) {
            let ex = $J.exc($e0);
          } else {
            throw $e0;
          }
        }
      }
    }
    return newValue;
  }
  focusGained(e: FocusEvent): void {
  }
  focusLost(e: FocusEvent): void {
  }
  addActionListener(l: ActionListener): void {
    this.editor.addActionListener(l);
  }
  removeActionListener(l: ActionListener): void {
    this.editor.removeActionListener(l);
  }
}

export class BasicComboBoxEditor$BorderlessTextField extends JTextField {
  _BasicComboBoxEditor$BorderlessTextField(value: string, n: number): this {
    this._JTextField$String$int(value, n);
    return this;
  }
  setText(s: string): void {
    if ($J.equals(this.getText$(), s)) {
      return;
    }
    super.setText(s);
  }
  setBorder(b: Border): void {
    if (!(b instanceof BasicComboBoxEditor$UIResource)) {
      super.setBorder(b);
    }
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
export class BasicComboBoxEditor$UIResource extends BasicComboBoxEditor {
  /**
   * Constructs a {@code UIResource}.
   */
  _BasicComboBoxEditor$UIResource(): this {
    this._BasicComboBoxEditor();
    return this;
  }
}

$J.define(BasicComboBoxEditor, 'javax.swing.plaf.basic.BasicComboBoxEditor', { kind: 'class', ifaces: ['javax.swing.ComboBoxEditor', 'java.awt.event.FocusListener'], sup: 'java.lang.Object', ctors: { '': '_BasicComboBoxEditor' } });
$J.define(BasicComboBoxEditor$BorderlessTextField, 'javax.swing.plaf.basic.BasicComboBoxEditor$BorderlessTextField', { kind: 'class', sup: 'javax.swing.JTextField', ctors: { 'java.lang.String,int': '_BasicComboBoxEditor$BorderlessTextField' } });
$J.define(BasicComboBoxEditor$UIResource, 'javax.swing.plaf.basic.BasicComboBoxEditor$UIResource', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.plaf.basic.BasicComboBoxEditor', ctors: { '': '_BasicComboBoxEditor$UIResource' } });
