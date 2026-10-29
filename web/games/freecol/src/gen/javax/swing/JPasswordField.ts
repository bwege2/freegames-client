// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JPasswordField.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Arrays } from '../../../jre/index.ts';
import { JTextField } from './JTextField.ts';
import { JTextField$AccessibleJTextField } from './JTextField.ts';

let UIManager, AbstractDocument, BadLocationException, Segment;

/**
 * <code>JPasswordField</code> is a lightweight component that allows
 * the editing of a single line of text where the view indicates
 * something was typed, but does not show the original characters.
 * You can find further information and examples in
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/textfield.html">How to Use Text Fields</a>,
 * a section in <em>The Java Tutorial.</em>
 * <p>
 * <code>JPasswordField</code> is intended
 * to be source-compatible with <code>java.awt.TextField</code>
 * used with <code>echoChar</code> set.  It is provided separately
 * to make it easier to safely change the UI for the
 * <code>JTextField</code> without affecting password entries.
 * <p>
 * <strong>NOTE:</strong>
 * By default, JPasswordField disables input methods; otherwise, input
 * characters could be visible while they were composed using input methods.
 * If an application needs the input methods support, please use the
 * inherited method, <code>enableInputMethods(true)</code>.
 * <p>
 * <strong>Warning:</strong> The {@code JPasswordField} will not show the
 * original characters that were typed, instead displaying alternative text or
 * graphics. However this doesn't prevent the password from appearing in the
 * system memory. For handling confidential information such as the password
 * text, refer to the relevant section at
 * <a href="https://www.oracle.com/java/technologies/javase/seccodeguide.html">
 * Secure Coding Guidelines</a>.
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
 * @since 1.2
 */
export class JPasswordField extends JTextField {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'PasswordFieldUI';
  echoChar: number = 0;
  echoCharSet: boolean = false;
  $init_JPasswordField() {
    this.echoCharSet = false;
  }
  /**
   * Constructs a new <code>JPasswordField</code>,
   * with a default document, <code>null</code> starting
   * text string, and 0 column width.
   */
  _JPasswordField$(): this {
    this._JPasswordField$Document$String$int(null, null, 0);
    return this;
  }
  /**
   * Constructs a new <code>JPasswordField</code> initialized
   * with the specified text.  The document model is set to the
   * default, and the number of columns to 0.
   *
   * @param text the text to be displayed, <code>null</code> if none
   */
  _JPasswordField$String(text: string): this {
    this._JPasswordField$Document$String$int(null, text, 0);
    return this;
  }
  /**
   * Constructs a new empty <code>JPasswordField</code> with the specified
   * number of columns.  A default model is created, and the initial string
   * is set to <code>null</code>.
   *
   * @param columns the number of columns &gt;= 0
   */
  _JPasswordField$int(columns: number): this {
    this._JPasswordField$Document$String$int(null, null, columns);
    return this;
  }
  /**
   * Constructs a new <code>JPasswordField</code> initialized with
   * the specified text and columns.  The document model is set to
   * the default.
   *
   * @param text the text to be displayed, <code>null</code> if none
   * @param columns the number of columns &gt;= 0
   */
  _JPasswordField$String$int(text: string, columns: number): this {
    this._JPasswordField$Document$String$int(null, text, columns);
    return this;
  }
  /**
   * Constructs a new <code>JPasswordField</code> that uses the
   * given text storage model and the given number of columns.
   * This is the constructor through which the other constructors feed.
   * The echo character is set to '*', but may be changed by the current
   * Look and Feel.  If the document model is
   * <code>null</code>, a default one will be created.
   *
   * @param doc  the text storage to use
   * @param txt the text to be displayed, <code>null</code> if none
   * @param columns  the number of columns to use to calculate
   *   the preferred width &gt;= 0; if columns is set to zero, the
   *   preferred width will be whatever naturally results from
   *   the component implementation
   */
  _JPasswordField$Document$String$int(doc: Document, txt: string, columns: number): this {
    this._JTextField$Document$String$int(doc, txt, columns);
    this.$init_JPasswordField();
    this.enableInputMethods(false);
    return this;
  }
  /**
   * Returns the name of the L&amp;F class that renders this component.
   *
   * @return the string "PasswordFieldUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JPasswordField.uiClassID;
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  updateUI(): void {
    if (!this.echoCharSet) {
      this.echoChar = 42 /* \u002a */;
    }
    super.updateUI();
  }
  /**
   * Returns the character to be used for echoing.  The default is '*'.
   * The default may be different depending on the currently running Look
   * and Feel. For example, Metal/Ocean's default is a bullet character.
   *
   * @return the echo character, 0 if unset
   * @see #setEchoChar
   * @see #echoCharIsSet
   */
  getEchoChar(): number {
    return this.echoChar;
  }
  /**
   * Sets the echo character for this <code>JPasswordField</code>.
   * Note that this is largely a suggestion, since the
   * view that gets installed can use whatever graphic techniques
   * it desires to represent the field.  Setting a value of 0 indicates
   * that you wish to see the text as it is typed, similar to
   * the behavior of a standard <code>JTextField</code>.
   *
   * @param c the echo character to display
   * @see #echoCharIsSet
   * @see #getEchoChar
   */
  setEchoChar(c: number): void {
    this.echoChar = c;
    this.echoCharSet = true;
    this.repaint$();
    this.revalidate();
  }
  /**
   * Returns true if this <code>JPasswordField</code> has a character
   * set for echoing.  A character is considered to be set if the echo
   * character is not 0.
   *
   * @return true if a character is set for echoing
   * @see #setEchoChar
   * @see #getEchoChar
   */
  echoCharIsSet(): boolean {
    return this.echoChar !== 0;
  }
  /**
   * Invokes <code>provideErrorFeedback</code> on the current
   * look and feel, which typically initiates an error beep.
   * The normal behavior of transferring the
   * currently selected range in the associated text model
   * to the system clipboard, and removing the contents from
   * the model, is not acceptable for a password field.
   */
  cut(): void {
    if (this.getClientProperty('JPasswordField.cutCopyAllowed') !== true) {
      UIManager.getLookAndFeel().provideErrorFeedback(this);
    } else {
      super.cut();
    }
  }
  /**
   * Invokes <code>provideErrorFeedback</code> on the current
   * look and feel, which typically initiates an error beep.
   * The normal behavior of transferring the
   * currently selected range in the associated text model
   * to the system clipboard, and leaving the contents from
   * the model, is not acceptable for a password field.
   */
  copy(): void {
    if (this.getClientProperty('JPasswordField.cutCopyAllowed') !== true) {
      UIManager.getLookAndFeel().provideErrorFeedback(this);
    } else {
      super.copy();
    }
  }
  /**
   * Returns the text contained in this <code>TextComponent</code>.
   * If the underlying document is <code>null</code>, will give a
   * <code>NullPointerException</code>.
   * <p>
   * For security reasons, this method is deprecated.  Use the
   *     <code>* getPassword</code> method instead.
   * @deprecated As of Java 2 platform v1.2,
   * replaced by <code>getPassword</code>.
   * @return the text
   */
  getText$(): string {
    return super.getText$();
  }
  setText(t: string): void {
    let doc = this.getDocument();
    let filter = null;
    var adoc;
    if ((adoc = doc) instanceof AbstractDocument) {
      filter = adoc.getDocumentFilter();
    }
    if (filter == null) {
      let nleft = doc.getLength();
      let text = new Segment()._Segment$();
      text.setPartialReturn(true);
      let offs = 0;
      try {
        while (nleft > 0) {
          doc.getText$int$int$Segment(offs, nleft, text);
          Arrays.fill(text.array, text.offset, (text.count_ + text.offset) | 0, 0 /* \u0000 */);
          nleft = (nleft - text.count_) | 0;
          offs = (offs + text.count_) | 0;
        }
      } catch ($e0) {
        if ($J.isa($e0, BadLocationException)) {
          let ignored = $J.exc($e0);
        } else {
          throw $e0;
        }
      }
    }
    super.setText(t);
  }
  /**
   * Returns a string representation of this <code>JPasswordField</code>.
   * This method is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JPasswordField</code>
   */
  paramString(): string {
    return super.paramString() + ',echoChar=' + String.fromCharCode(this.echoChar);
  }
  /**
   * This method is a hack to get around the fact that we cannot
   * directly override setUIProperty because part of the inheritance hierarchy
   * goes outside of the javax.swing package, and therefore calling a package
   * private method isn't allowed. This method should return true if the property
   * was handled, and false otherwise.
   */
  customSetUIProperty(propertyName: string, value: any): boolean {
    if (propertyName === 'echoChar') {
      if (!this.echoCharSet) {
        this.setEchoChar(value);
        this.echoCharSet = false;
      }
      return true;
    }
    return false;
  }
  /**
   * Returns the <code>AccessibleContext</code> associated with this
   * <code>JPasswordField</code>. For password fields, the
   * <code>AccessibleContext</code> takes the form of an
   * <code>AccessibleJPasswordField</code>.
   * A new <code>AccessibleJPasswordField</code> instance is created
   * if necessary.
   *
   * @return an <code>AccessibleJPasswordField</code> that serves as the
   *         <code>AccessibleContext</code> of this
   *         <code>JPasswordField</code>
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JPasswordField$AccessibleJPasswordField().$o(this)._JPasswordField$AccessibleJPasswordField();
    }
    return this.accessibleContext;
  }
}

/**
 * This class implements accessibility support for the
 * <code>JPasswordField</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to password field user-interface
 * elements.
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
export class JPasswordField$AccessibleJPasswordField extends JTextField$AccessibleJTextField {
  /**
   * Constructs an {@code AccessibleJPasswordField}.
   */
  _JPasswordField$AccessibleJPasswordField(): this {
    this._JTextField$AccessibleJTextField();
    return this;
  }
}

$J.define(JPasswordField, 'javax.swing.JPasswordField', { kind: 'class', sup: 'javax.swing.JTextField', ctors: { 'javax.swing.text.Document,java.lang.String,int': '_JPasswordField$Document$String$int', 'java.lang.String,int': '_JPasswordField$String$int', 'int': '_JPasswordField$int', 'java.lang.String': '_JPasswordField$String', '': '_JPasswordField$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JPasswordField', 'getText(int,int)': 'getText$int$int', 'getText()': 'getText$' } });
$J.define(JPasswordField$AccessibleJPasswordField, 'javax.swing.JPasswordField$AccessibleJPasswordField', { kind: 'class', sup: 'javax.swing.JTextField$AccessibleJTextField', ctors: { '': '_JPasswordField$AccessibleJPasswordField' }, meths: { 'getAtIndex(int,int)': 'getAtIndex$int$int', 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  UIManager = $J.load('javax.swing.UIManager');
  AbstractDocument = $J.load('javax.swing.text.AbstractDocument');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  Segment = $J.load('javax.swing.text.Segment');
});
