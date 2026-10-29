// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/DefaultCellEditor.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2020, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JBoolean, JObject, JString } from '../../../jre/index.ts';
import { AbstractCellEditor } from './AbstractCellEditor.ts';

let ActionEvent, MouseEvent, JCheckBox, JComponent;

/**
 * The default editor for table and tree cells.
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
 * @author Alan Chung
 * @author Philip Milne
 * @since 1.2
 */
export class DefaultCellEditor extends AbstractCellEditor {
  /**
   * The Swing component being edited.
   */
  editorComponent: JComponent = null;
  /**
   * The delegate class which handles all methods sent from the
   * <code>CellEditor</code>.
   */
  delegate_: DefaultCellEditor$EditorDelegate = null;
  /**
   * An integer specifying the number of clicks needed to start editing.
   * Even if <code>clickCountToStart</code> is defined as zero, it
   * will not initiate until a click occurs.
   */
  clickCountToStart: number = 0;
  $init_DefaultCellEditor() {
    this.clickCountToStart = 1;
  }
  /**
   * Constructs a <code>DefaultCellEditor</code> that uses a text field.
   *
   * @param textField  a <code>JTextField</code> object
   */
  _DefaultCellEditor$JTextField(textField: JTextField): this {
    this._AbstractCellEditor();
    this.$init_DefaultCellEditor();
    this.editorComponent = textField;
    this.clickCountToStart = 2;
    this.delegate_ = new (DefaultCellEditor$1())().$o(this).$c(textField)._DefaultCellEditor$EditorDelegate();
    textField.addActionListener($J.fn(this.delegate_, 'actionPerformed'));
    return this;
  }
  /**
   * Constructs a <code>DefaultCellEditor</code> object that uses a check box.
   *
   * @param checkBox  a <code>JCheckBox</code> object
   */
  _DefaultCellEditor$JCheckBox(checkBox: JCheckBox): this {
    this._AbstractCellEditor();
    this.$init_DefaultCellEditor();
    this.editorComponent = checkBox;
    this.delegate_ = new (DefaultCellEditor$2())().$o(this).$c(checkBox)._DefaultCellEditor$EditorDelegate();
    checkBox.addActionListener($J.fn(this.delegate_, 'actionPerformed'));
    checkBox.setRequestFocusEnabled(false);
    return this;
  }
  /**
   * Constructs a <code>DefaultCellEditor</code> object that uses a
   * combo box.
   *
   * @param comboBox  a <code>JComboBox</code> object
   */
  _DefaultCellEditor$JComboBox(comboBox: JComboBox<any>): this {
    this._AbstractCellEditor();
    this.$init_DefaultCellEditor();
    this.editorComponent = comboBox;
    comboBox.putClientProperty('JComboBox.isTableCellEditor', true);
    this.delegate_ = new (DefaultCellEditor$3())().$o(this).$c(comboBox)._DefaultCellEditor$EditorDelegate();
    comboBox.addActionListener($J.fn(this.delegate_, 'actionPerformed'));
    return this;
  }
  /**
   * Returns a reference to the editor component.
   *
   * @return the editor <code>Component</code>
   */
  getComponent(): Component {
    return this.editorComponent;
  }
  /**
   * Specifies the number of clicks needed to start editing.
   *
   * @param count  an int specifying the number of clicks needed to start editing
   * @see #getClickCountToStart
   */
  setClickCountToStart(count: number): void {
    this.clickCountToStart = count;
  }
  /**
   * Forwards the message from the <code>CellEditor</code> to
   * the <code>delegate</code>.
   * @see EditorDelegate#getCellEditorValue
   */
  getCellEditorValue(): any {
    return this.delegate_.getCellEditorValue();
  }
  /**
   * Forwards the message from the <code>CellEditor</code> to
   * the <code>delegate</code>.
   * @see EditorDelegate#isCellEditable(EventObject)
   */
  isCellEditable(anEvent: EventObject): boolean {
    return this.delegate_.isCellEditable(anEvent);
  }
  /**
   * Forwards the message from the <code>CellEditor</code> to
   * the <code>delegate</code>.
   * @see EditorDelegate#shouldSelectCell(EventObject)
   */
  shouldSelectCell(anEvent: EventObject): boolean {
    return this.delegate_.shouldSelectCell(anEvent);
  }
  /**
   * Forwards the message from the <code>CellEditor</code> to
   * the <code>delegate</code>.
   * @see EditorDelegate#stopCellEditing
   */
  stopCellEditing(): boolean {
    return this.delegate_.stopCellEditing();
  }
  /**
   * Forwards the message from the <code>CellEditor</code> to
   * the <code>delegate</code>.
   * @see EditorDelegate#cancelCellEditing
   */
  cancelCellEditing(): void {
    this.delegate_.cancelCellEditing();
  }
  /**
   * Implements the <code>TreeCellEditor</code> interface.
   */
  getTreeCellEditorComponent(tree: JTree, value: any, isSelected: boolean, expanded: boolean, leaf: boolean, row: number): Component {
    let stringValue = tree.convertValueToText(value, isSelected, expanded, leaf, row, false);
    this.delegate_.setValue(stringValue);
    return this.editorComponent;
  }
  /**
   * Implements the <code>TableCellEditor</code> interface.
   */
  getTableCellEditorComponent(table: JTable, value: any, isSelected: boolean, row: number, column: number): Component {
    this.delegate_.setValue(value);
    if (this.editorComponent instanceof JCheckBox) {
      let renderer = table.getCellRenderer(row, column);
      let c = renderer.getTableCellRendererComponent(table, value, isSelected, true, row, column);
      if (c != null) {
        this.editorComponent.setOpaque(true);
        this.editorComponent.setBackground(c.getBackground());
        if (c instanceof JComponent) {
          this.editorComponent.setBorder((c).getBorder());
        }
      } else {
        this.editorComponent.setOpaque(false);
      }
    }
    return this.editorComponent;
  }
}

/**
 * The protected <code>EditorDelegate</code> class.
 */
export class DefaultCellEditor$EditorDelegate extends JObject {
  /**
   * The value of this cell.
   */
  value_: any = null;
  /**
   * Constructs an {@code EditorDelegate}.
   */
  _DefaultCellEditor$EditorDelegate(): this {
    return this;
  }
  /**
   * Returns true if <code>anEvent</code> is <b>not</b> a
   * <code>MouseEvent</code>.  Otherwise, it returns true
   * if the necessary number of clicks have occurred, and
   * returns false otherwise.
   *
   * @param   anEvent         the event
   * @return  true  if cell is ready for editing, false otherwise
   * @see #setClickCountToStart
   * @see #shouldSelectCell
   */
  isCellEditable(anEvent: EventObject): boolean {
    if (anEvent instanceof MouseEvent) {
      return (anEvent).getClickCount() >= this.$outer.clickCountToStart;
    }
    return true;
  }
  /**
   * Returns true to indicate that the editing cell may
   * be selected.
   *
   * @param   anEvent         the event
   * @return  true
   * @see #isCellEditable
   */
  shouldSelectCell(anEvent: EventObject): boolean {
    return true;
  }
  /**
   * Stops editing and
   * returns true to indicate that editing has stopped.
   * This method calls <code>fireEditingStopped</code>.
   *
   * @return  true
   */
  stopCellEditing(): boolean {
    this.$outer.fireEditingStopped();
    return true;
  }
  /**
   * Cancels editing.  This method calls <code>fireEditingCanceled</code>.
   */
  cancelCellEditing(): void {
    this.$outer.fireEditingCanceled();
  }
  /**
   * When an action is performed, editing is ended.
   * @param e the action event
   * @see #stopCellEditing
   */
  actionPerformed(e: ActionEvent): void {
    this.$outer.stopCellEditing();
  }
  /**
   * When an item's state changes, editing is ended.
   * @param e the action event
   * @see #stopCellEditing
   */
  itemStateChanged(e: ItemEvent): void {
    this.$outer.stopCellEditing();
  }
}

let $DefaultCellEditor$1: any = null;
/** An anonymous class (DefaultCellEditor.java:89). */
function DefaultCellEditor$1(): any {
  return $DefaultCellEditor$1 ??= $J.local(class extends DefaultCellEditor$EditorDelegate {
    setValue(value: any): void {
      this.$cv_textField.setText((value != null) ? $J.str(value) : '');
    }
    getCellEditorValue(): any {
      return this.$cv_textField.getText$();
    }
    $c($textField): this {
      this.$cv_textField = $textField;
      return this;
    }
  }, 'javax.swing.DefaultCellEditor$1', []);
}

let $DefaultCellEditor$2: any = null;
/** An anonymous class (DefaultCellEditor.java:108). */
function DefaultCellEditor$2(): any {
  return $DefaultCellEditor$2 ??= $J.local(class extends DefaultCellEditor$EditorDelegate {
    setValue(value: any): void {
      let selected = false;
      if ($J.isa(value, JBoolean)) {
        selected = (value);
      } else if ($J.isa(value, JString)) {
        selected = $J.equals(value, 'true');
      }
      this.$cv_checkBox.setSelected(selected);
    }
    getCellEditorValue(): any {
      return this.$cv_checkBox.isSelected();
    }
    $c($checkBox): this {
      this.$cv_checkBox = $checkBox;
      return this;
    }
  }, 'javax.swing.DefaultCellEditor$2', []);
}

let $DefaultCellEditor$3: any = null;
/** An anonymous class (DefaultCellEditor.java:137). */
function DefaultCellEditor$3(): any {
  return $DefaultCellEditor$3 ??= $J.local(class extends DefaultCellEditor$EditorDelegate {
    setValue(value: any): void {
      this.$cv_comboBox.setSelectedItem(value);
    }
    getCellEditorValue(): any {
      return this.$cv_comboBox.getSelectedItem();
    }
    shouldSelectCell(anEvent: EventObject): boolean {
      if (anEvent instanceof MouseEvent) {
        let e = anEvent;
        return e.getID() !== MouseEvent.MOUSE_DRAGGED;
      }
      return true;
    }
    stopCellEditing(): boolean {
      if (this.$cv_comboBox.isEditable()) {
        this.$cv_comboBox.actionPerformed(new ActionEvent()._ActionEvent$Object$int$String(this.$outer, 0, ''));
      }
      return super.stopCellEditing();
    }
    $c($comboBox): this {
      this.$cv_comboBox = $comboBox;
      return this;
    }
  }, 'javax.swing.DefaultCellEditor$3', []);
}

$J.define(DefaultCellEditor, 'javax.swing.DefaultCellEditor', { kind: 'class', ifaces: ['javax.swing.table.TableCellEditor', 'javax.swing.tree.TreeCellEditor'], sup: 'javax.swing.AbstractCellEditor', ctors: { 'javax.swing.JComboBox': '_DefaultCellEditor$JComboBox', 'javax.swing.JCheckBox': '_DefaultCellEditor$JCheckBox', 'javax.swing.JTextField': '_DefaultCellEditor$JTextField' } });
$J.define(DefaultCellEditor$EditorDelegate, 'javax.swing.DefaultCellEditor$EditorDelegate', { kind: 'class', ifaces: ['java.awt.event.ActionListener', 'java.awt.event.ItemListener', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_DefaultCellEditor$EditorDelegate' }, inner: true });
$J.module(() => {
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  JCheckBox = $J.load('javax.swing.JCheckBox');
  JComponent = $J.load('javax.swing.JComponent');
});
