// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JTextPane.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, JString } from '../../../jre/index.ts';
import { JEditorPane } from './JEditorPane.ts';

let UIManager, AbstractDocument, BadLocationException, StyledDocument, StyledEditorKit;

/**
 * A text component that can be marked up with attributes that are
 * represented graphically.
 * You can find how-to information and examples of using text panes in
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/text.html">Using Text Components</a>,
 * a section in <em>The Java Tutorial.</em>
 *
 * <p>
 * This component models paragraphs
 * that are composed of runs of character level attributes.  Each
 * paragraph may have a logical style attached to it which contains
 * the default attributes to use if not overridden by attributes set
 * on the paragraph or character run.  Components and images may
 * be embedded in the flow of text.
 *
 * <dl>
 * <dt><b>Newlines</b>
 * <dd>
 * For a discussion on how newlines are handled, see
 * <a href="text/DefaultEditorKit.html">DefaultEditorKit</a>.
 * </dl>
 *
 * <p>
 * <strong>Warning:</strong> Swing is not thread safe. For more
 * information see <a
 * href="package-summary.html#threading">Swing's Threading
 * Policy</a>.
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
 * @author  Timothy Prinzing
 * @see javax.swing.text.StyledEditorKit
 * @since 1.2
 */
export class JTextPane extends JEditorPane {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'TextPaneUI';
  /**
   * Creates a new <code>JTextPane</code>.  A new instance of
   * <code>StyledEditorKit</code> is
   * created and set, and the document model set to <code>null</code>.
   */
  _JTextPane$(): this {
    this._JEditorPane$();
    let editorKit = this.createDefaultEditorKit();
    let contentType = editorKit.getContentType$();
    if (contentType != null && JEditorPane.getEditorKitClassNameForContentType(contentType) === JEditorPane.defaultEditorKitMap.get(contentType)) {
      this.setEditorKitForContentType(contentType, editorKit);
    }
    this.setEditorKit(editorKit);
    return this;
  }
  /**
   * Creates a new <code>JTextPane</code>, with a specified document model.
   * A new instance of <code>javax.swing.text.StyledEditorKit</code>
   *  is created and set.
   *
   * @param doc the document model
   */
  _JTextPane$StyledDocument(doc: StyledDocument): this {
    this._JTextPane$();
    this.setStyledDocument(doc);
    return this;
  }
  /**
   * Returns the class ID for the UI.
   *
   * @return the string "TextPaneUI"
   *
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JTextPane.uiClassID;
  }
  /**
   * Associates the editor with a text document.  This
   * must be a <code>StyledDocument</code>.
   *
   * @param doc  the document to display/edit
   * @throws IllegalArgumentException  if <code>doc</code> can't
   *   be narrowed to a <code>StyledDocument</code> which is the
   *   required type of model for this text component
   */
  setDocument(doc: Document): void {
    if ($J.isa(doc, StyledDocument)) {
      super.setDocument(doc);
    } else {
      throw new IllegalArgumentException('Model must be StyledDocument');
    }
  }
  /**
   * Associates the editor with a text document.
   * The currently registered factory is used to build a view for
   * the document, which gets displayed by the editor.
   *
   * @param doc  the document to display/edit
   */
  setStyledDocument(doc: StyledDocument): void {
    super.setDocument(doc);
  }
  /**
   * Fetches the model associated with the editor.
   *
   * @return the model
   */
  getStyledDocument(): StyledDocument {
    return this.getDocument();
  }
  /**
   * Replaces the currently selected content with new content
   * represented by the given string.  If there is no selection
   * this amounts to an insert of the given text.  If there
   * is no replacement text this amounts to a removal of the
   * current selection.  The replacement text will have the
   * attributes currently defined for input at the point of
   * insertion.  If the document is not editable, beep and return.
   *
   * @param content  the content to replace the selection with
   */
  replaceSelection$String(content: string): void {
    this.replaceSelection$String$boolean$JTextPane(content, true);
  }
  replaceSelection$String$boolean$JTextPane(content: string, checkEditable: boolean): void {
    if (checkEditable && !this.isEditable()) {
      UIManager.getLookAndFeel().provideErrorFeedback(this);
      return;
    }
    let doc = this.getStyledDocument();
    if (doc != null) {
      try {
        let caret = this.getCaret();
        let composedTextSaved = this.saveComposedText(caret.getDot());
        let p0 = Math.min(caret.getDot(), caret.getMark());
        let p1 = Math.max(caret.getDot(), caret.getMark());
        let attr = this.getInputAttributes().copyAttributes();
        if (doc instanceof AbstractDocument) {
          (doc).replace(p0, (p1 - p0) | 0, content, attr);
        } else {
          if (p0 !== p1) {
            doc.remove(p0, (p1 - p0) | 0);
          }
          if (content != null && content.length > 0) {
            doc.insertString(p0, content, attr);
          }
        }
        if (composedTextSaved) {
          this.restoreComposedText();
        }
      } catch ($e0) {
        if ($J.isa($e0, BadLocationException)) {
          let e = $J.exc($e0);
          UIManager.getLookAndFeel().provideErrorFeedback(this);
        } else {
          throw $e0;
        }
      }
    }
  }
  /**
   * Sets the logical style to use for the paragraph at the
   * current caret position.  If attributes aren't explicitly set
   * for character and paragraph attributes they will resolve
   * through the logical style assigned to the paragraph, which
   * in term may resolve through some hierarchy completely
   * independent of the element hierarchy in the document.
   *
   * @param s  the logical style to assign to the paragraph,
   *          or <code>null</code> for no style
   */
  setLogicalStyle(s: Style): void {
    let doc = this.getStyledDocument();
    doc.setLogicalStyle(this.getCaretPosition(), s);
  }
  /**
   * Applies the given attributes to paragraphs.  If
   * there is a selection, the attributes are applied
   * to the paragraphs that intersect the selection.
   * If there is no selection, the attributes are applied
   * to the paragraph at the current caret position.
   *
   * @param attr the non-<code>null</code> attributes
   * @param replace if true, replace the existing attributes first
   */
  setParagraphAttributes(attr: AttributeSet, replace: boolean): void {
    let p0 = this.getSelectionStart();
    let p1 = this.getSelectionEnd();
    let doc = this.getStyledDocument();
    doc.setParagraphAttributes(p0, (p1 - p0) | 0, attr, replace);
  }
  /**
   * Gets the input attributes for the pane.
   *
   * @return the attributes
   */
  getInputAttributes(): MutableAttributeSet {
    return this.getStyledEditorKit().getInputAttributes$();
  }
  /**
   * Gets the editor kit.
   *
   * @return the editor kit
   */
  getStyledEditorKit(): StyledEditorKit {
    return this.getEditorKit();
  }
  /**
   * Creates the <code>EditorKit</code> to use by default.  This
   * is implemented to return <code>javax.swing.text.StyledEditorKit</code>.
   *
   * @return the editor kit
   */
  createDefaultEditorKit(): EditorKit {
    return new StyledEditorKit()._StyledEditorKit();
  }
  /**
   * Sets the currently installed kit for handling
   * content.  This is the bound property that
   * establishes the content type of the editor.
   *
   * @param kit the desired editor behavior
   * @throws IllegalArgumentException if kit is not a
   *          <code>StyledEditorKit</code>
   */
  setEditorKit(kit: EditorKit): void {
    if (kit instanceof StyledEditorKit) {
      super.setEditorKit(kit);
    } else {
      throw new IllegalArgumentException('Must be StyledEditorKit');
    }
  }
  /**
   * Returns a string representation of this <code>JTextPane</code>.
   * This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JTextPane</code>
   */
  paramString(): string {
    return super.paramString();
  }
}

$J.define(JTextPane, 'javax.swing.JTextPane', { kind: 'class', sup: 'javax.swing.JEditorPane', ctors: { 'javax.swing.text.StyledDocument': '_JTextPane$StyledDocument', '': '_JTextPane$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JTextPane', 'replaceSelection(java.lang.String,boolean)': 'replaceSelection$String$boolean$JTextPane', 'replaceSelection(java.lang.String)': 'replaceSelection$String' } });
$J.module(() => {
  UIManager = $J.load('javax.swing.UIManager');
  AbstractDocument = $J.load('javax.swing.text.AbstractDocument');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  StyledDocument = $J.load('javax.swing.text.StyledDocument');
  StyledEditorKit = $J.load('javax.swing.text.StyledEditorKit');
});
