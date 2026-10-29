// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/StyledEditorKit.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2015, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalArgumentException, JObject, NumberFormatException } from '../../../../jre/index.ts';
import { DefaultEditorKit } from './DefaultEditorKit.ts';
import { TextAction } from './TextAction.ts';

let JEditorPane, UIManager, AbstractDocument, BoxView, ComponentView, DefaultStyledDocument, Document, IconView, JTextComponent, LabelView, ParagraphView, SimpleAttributeSet, StyleConstants, StyledDocument, View;

/**
 * This is the set of things needed by a text component
 * to be a reasonably functioning editor for some <em>type</em>
 * of text document.  This implementation provides a default
 * implementation which treats text as styled text and
 * provides a minimal set of actions for editing styled text.
 *
 * @author  Timothy Prinzing
 */
export class StyledEditorKit extends DefaultEditorKit {
  static defaultFactory: ViewFactory = null;
  currentRun: Element = null;
  currentParagraph: Element = null;
  /**
   * This is the set of attributes used to store the
   * input attributes.
   */
  inputAttributes: MutableAttributeSet = null;
  /**
   * This listener will be attached to the caret of
   * the text component that the EditorKit gets installed
   * into.  This should keep the input attributes updated
   * for use by the styled actions.
   */
  inputAttributeUpdater: StyledEditorKit$AttributeTracker = null;
  static defaultActions: Action[] = null;
  /**
   * Creates a new EditorKit used for styled documents.
   */
  _StyledEditorKit(): this {
    this._DefaultEditorKit();
    this.createInputAttributeUpdated();
    this.createInputAttributes$$StyledEditorKit();
    return this;
  }
  /**
   * Gets the input attributes for the pane.  When
   * the caret moves and there is no selection, the
   * input attributes are automatically mutated to
   * reflect the character attributes of the current
   * caret location.  The styled editing actions
   * use the input attributes to carry out their
   * actions.
   *
   * @return the attribute set
   */
  getInputAttributes$(): MutableAttributeSet {
    return this.inputAttributes;
  }
  /**
   * Fetches the command list for the editor.  This is
   * the list of commands supported by the superclass
   * augmented by the collection of commands defined
   * locally for style operations.
   *
   * @return the command list
   */
  getActions$(): Action[] {
    return TextAction.augmentList(super.getActions$(), StyledEditorKit.defaultActions);
  }
  /**
   * Creates an uninitialized text storage model
   * that is appropriate for this type of editor.
   *
   * @return the model
   */
  createDefaultDocument$(): Document {
    return new DefaultStyledDocument()._DefaultStyledDocument$();
  }
  /**
   * Called when the kit is being installed into
   * a JEditorPane.
   *
   * @param c the JEditorPane
   */
  install$JEditorPane(c: JEditorPane): void {
    c.addCaretListener(this.inputAttributeUpdater);
    c.addPropertyChangeListener$PropertyChangeListener($J.fn(this.inputAttributeUpdater, 'propertyChange'));
    let caret = c.getCaret();
    if (caret != null) {
      this.inputAttributeUpdater.updateInputAttributes(caret.getDot(), caret.getMark(), c);
    }
  }
  /**
   * Called when the kit is being removed from the
   * JEditorPane.  This is used to unregister any
   * listeners that were attached.
   *
   * @param c the JEditorPane
   */
  deinstall$JEditorPane(c: JEditorPane): void {
    c.removeCaretListener(this.inputAttributeUpdater);
    c.removePropertyChangeListener$PropertyChangeListener($J.fn(this.inputAttributeUpdater, 'propertyChange'));
    this.currentRun = null;
    this.currentParagraph = null;
  }
  /**
   * Fetches a factory that is suitable for producing
   * views of any models that are produced by this
   * kit.  This is implemented to return View implementations
   * for the following kinds of elements:
   * <ul>
   * <li>AbstractDocument.ContentElementName
   * <li>AbstractDocument.ParagraphElementName
   * <li>AbstractDocument.SectionElementName
   * <li>StyleConstants.ComponentElementName
   * <li>StyleConstants.IconElementName
   * </ul>
   *
   * @return the factory
   */
  getViewFactory(): ViewFactory {
    return StyledEditorKit.defaultFactory;
  }
  /**
   * Creates a copy of the editor kit.
   *
   * @return the copy
   */
  clone(): any {
    let o = super.clone();
    o.currentRun = o.currentParagraph = null;
    o.createInputAttributeUpdated();
    o.createInputAttributes$$StyledEditorKit();
    return o;
  }
  /**
   * Creates the AttributeSet used for the selection.
   */
  createInputAttributes$$StyledEditorKit(): void {
    this.inputAttributes = new (StyledEditorKit$1())().$o(this)._SimpleAttributeSet$();
  }
  /**
   * Creates a new <code>AttributeTracker</code>.
   */
  createInputAttributeUpdated(): void {
    this.inputAttributeUpdater = new StyledEditorKit$AttributeTracker().$o(this)._StyledEditorKit$AttributeTracker();
  }
  /**
   * Copies the key/values in <code>element</code>s AttributeSet into
   * <code>set</code>. This does not copy component, icon, or element
   * names attributes. Subclasses may wish to refine what is and what
   * isn't copied here. But be sure to first remove all the attributes that
   * are in <code>set</code>.<p>
   * This is called anytime the caret moves over a different location.
   *
   * @param element the element
   * @param set the attributes
   */
  createInputAttributes$Element$MutableAttributeSet(element: Element, set$: MutableAttributeSet): void {
    if (element.getAttributes().getAttributeCount() > 0 || ((element.getEndOffset() - element.getStartOffset()) | 0) > 1 || element.getEndOffset() < element.getDocument().getLength()) {
      set$.removeAttributes$AttributeSet(set$);
      set$.addAttributes(element.getAttributes());
      set$.removeAttribute(StyleConstants.ComponentAttribute);
      set$.removeAttribute(StyleConstants.IconAttribute);
      set$.removeAttribute(AbstractDocument.ElementNameAttribute);
      set$.removeAttribute(StyleConstants.ComposedTextAttribute);
    }
  }
  static $clinit() {
    StyledEditorKit.defaultFactory = new StyledEditorKit$StyledViewFactory()._StyledEditorKit$StyledViewFactory();
    StyledEditorKit.defaultActions = [new StyledEditorKit$FontFamilyAction()._StyledEditorKit$FontFamilyAction('font-family-SansSerif', 'SansSerif'), new StyledEditorKit$FontFamilyAction()._StyledEditorKit$FontFamilyAction('font-family-Monospaced', 'Monospaced'), new StyledEditorKit$FontFamilyAction()._StyledEditorKit$FontFamilyAction('font-family-Serif', 'Serif'), new StyledEditorKit$FontSizeAction()._StyledEditorKit$FontSizeAction('font-size-8', 8), new StyledEditorKit$FontSizeAction()._StyledEditorKit$FontSizeAction('font-size-10', 10), new StyledEditorKit$FontSizeAction()._StyledEditorKit$FontSizeAction('font-size-12', 12), new StyledEditorKit$FontSizeAction()._StyledEditorKit$FontSizeAction('font-size-14', 14), new StyledEditorKit$FontSizeAction()._StyledEditorKit$FontSizeAction('font-size-16', 16), new StyledEditorKit$FontSizeAction()._StyledEditorKit$FontSizeAction('font-size-18', 18), new StyledEditorKit$FontSizeAction()._StyledEditorKit$FontSizeAction('font-size-24', 24), new StyledEditorKit$FontSizeAction()._StyledEditorKit$FontSizeAction('font-size-36', 36), new StyledEditorKit$FontSizeAction()._StyledEditorKit$FontSizeAction('font-size-48', 48), new StyledEditorKit$AlignmentAction()._StyledEditorKit$AlignmentAction('left-justify', StyleConstants.ALIGN_LEFT), new StyledEditorKit$AlignmentAction()._StyledEditorKit$AlignmentAction('center-justify', StyleConstants.ALIGN_CENTER), new StyledEditorKit$AlignmentAction()._StyledEditorKit$AlignmentAction('right-justify', StyleConstants.ALIGN_RIGHT), new StyledEditorKit$BoldAction()._StyledEditorKit$BoldAction(), new StyledEditorKit$ItalicAction()._StyledEditorKit$ItalicAction(), new StyledEditorKit$StyledInsertBreakAction()._StyledEditorKit$StyledInsertBreakAction(), new StyledEditorKit$UnderlineAction()._StyledEditorKit$UnderlineAction()];
  }
}

/**
 * Tracks caret movement and keeps the input attributes set
 * to reflect the current set of attribute definitions at the
 * caret position.
 * <p>This implements PropertyChangeListener to update the
 * input attributes when the Document changes, as if the Document
 * changes the attributes will almost certainly change.
 */
export class StyledEditorKit$AttributeTracker extends JObject {
  _StyledEditorKit$AttributeTracker(): this {
    return this;
  }
  /**
   * Updates the attributes. <code>dot</code> and <code>mark</code>
   * mark give the positions of the selection in <code>c</code>.
   */
  updateInputAttributes(dot: number, mark: number, c: JTextComponent): void {
    let aDoc = c.getDocument();
    if (!($J.isa(aDoc, StyledDocument))) {
      return;
    }
    let start = Math.min(dot, mark);
    let doc = aDoc;
    let run: Element;
    this.$outer.currentParagraph = doc.getParagraphElement(start);
    if (this.$outer.currentParagraph.getStartOffset() === start || dot !== mark) {
      run = doc.getCharacterElement(start);
    } else {
      run = doc.getCharacterElement(Math.max((start - 1) | 0, 0));
    }
    if (run !== this.$outer.currentRun) {
      this.$outer.currentRun = run;
      this.$outer.createInputAttributes$Element$MutableAttributeSet(this.$outer.currentRun, this.$outer.getInputAttributes$());
    }
  }
  propertyChange(evt: PropertyChangeEvent): void {
    let newValue = evt.getNewValue();
    let source = evt.getSource();
    if ((source instanceof JTextComponent) && ($J.isa(newValue, Document))) {
      this.updateInputAttributes(0, 0, source);
    }
  }
  caretUpdate(e: CaretEvent): void {
    this.updateInputAttributes(e.getDot(), e.getMark(), e.getSource());
  }
}

export class StyledEditorKit$StyledViewFactory extends JObject {
  _StyledEditorKit$StyledViewFactory(): this {
    return this;
  }
  create(elem: Element): View {
    let kind = elem.getName();
    if (kind != null) {
      if ($J.equals(kind, AbstractDocument.ContentElementName)) {
        return new LabelView()._LabelView(elem);
      } else if ($J.equals(kind, AbstractDocument.ParagraphElementName)) {
        return new ParagraphView()._ParagraphView(elem);
      } else if ($J.equals(kind, AbstractDocument.SectionElementName)) {
        return new BoxView()._BoxView(elem, View.Y_AXIS);
      } else if ($J.equals(kind, StyleConstants.ComponentElementName)) {
        return new ComponentView()._ComponentView(elem);
      } else if ($J.equals(kind, StyleConstants.IconElementName)) {
        return new IconView()._IconView(elem);
      }
    }
    return new LabelView()._LabelView(elem);
  }
}

/**
 * An action that assumes it's being fired on a JEditorPane
 * with a StyledEditorKit (or subclass) installed.  This has
 * some convenience methods for causing character or paragraph
 * level attribute changes.  The convenience methods will
 * throw an IllegalArgumentException if the assumption of
 * a StyledDocument, a JEditorPane, or a StyledEditorKit
 * fail to be true.
 * <p>
 * The component that gets acted upon by the action
 * will be the source of the ActionEvent if the source
 * can be narrowed to a JEditorPane type.  If the source
 * can't be narrowed, the most recently focused text
 * component is changed.  If neither of these are the
 * case, the action cannot be performed.
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
export class StyledEditorKit$StyledTextAction extends TextAction {
  /**
   * Creates a new StyledTextAction from a string action name.
   *
   * @param nm the name of the action
   */
  _StyledEditorKit$StyledTextAction(nm: string): this {
    this._TextAction(nm);
    return this;
  }
  /**
   * Gets the target editor for an action.
   *
   * @param e the action event
   * @return the editor
   */
  getEditor(e: ActionEvent): JEditorPane {
    let tcomp = this.getTextComponent(e);
    if (tcomp instanceof JEditorPane) {
      return tcomp;
    }
    return null;
  }
  /**
   * Gets the document associated with an editor pane.
   *
   * @param e the editor
   * @return the document
   * @throws IllegalArgumentException for the wrong document type
   */
  getStyledDocument(e: JEditorPane): StyledDocument {
    let d = e.getDocument();
    if ($J.isa(d, StyledDocument)) {
      return d;
    }
    throw new IllegalArgumentException('document must be StyledDocument');
  }
  /**
   * Gets the editor kit associated with an editor pane.
   *
   * @param e the editor pane
   * @return the kit
   * @throws IllegalArgumentException for the wrong document type
   */
  getStyledEditorKit(e: JEditorPane): StyledEditorKit {
    let k = e.getEditorKit();
    if (k instanceof StyledEditorKit) {
      return k;
    }
    throw new IllegalArgumentException('EditorKit must be StyledEditorKit');
  }
  /**
   * Applies the given attributes to character
   * content.  If there is a selection, the attributes
   * are applied to the selection range.  If there
   * is no selection, the attributes are applied to
   * the input attribute set which defines the attributes
   * for any new text that gets inserted.
   *
   * @param editor the editor
   * @param attr the attributes
   * @param replace   if true, then replace the existing attributes first
   */
  setCharacterAttributes(editor: JEditorPane, attr: AttributeSet, replace: boolean): void {
    let p0 = editor.getSelectionStart();
    let p1 = editor.getSelectionEnd();
    if (p0 !== p1) {
      let doc = this.getStyledDocument(editor);
      doc.setCharacterAttributes(p0, (p1 - p0) | 0, attr, replace);
    }
    let k = this.getStyledEditorKit(editor);
    let inputAttributes = k.getInputAttributes$();
    if (replace) {
      inputAttributes.removeAttributes$AttributeSet(inputAttributes);
    }
    inputAttributes.addAttributes(attr);
  }
  /**
   * Applies the given attributes to paragraphs.  If
   * there is a selection, the attributes are applied
   * to the paragraphs that intersect the selection.
   * if there is no selection, the attributes are applied
   * to the paragraph at the current caret position.
   *
   * @param editor the editor
   * @param attr the attributes
   * @param replace   if true, replace the existing attributes first
   */
  setParagraphAttributes(editor: JEditorPane, attr: AttributeSet, replace: boolean): void {
    let p0 = editor.getSelectionStart();
    let p1 = editor.getSelectionEnd();
    let doc = this.getStyledDocument(editor);
    doc.setParagraphAttributes(p0, (p1 - p0) | 0, attr, replace);
  }
}

/**
 * An action to set the font family in the associated
 * JEditorPane.  This will use the family specified as
 * the command string on the ActionEvent if there is one,
 * otherwise the family that was initialized with will be used.
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
export class StyledEditorKit$FontFamilyAction extends StyledEditorKit$StyledTextAction {
  family: string = null;
  /**
   * Creates a new FontFamilyAction.
   *
   * @param nm the action name
   * @param family the font family
   */
  _StyledEditorKit$FontFamilyAction(nm: string, family: string): this {
    this._StyledEditorKit$StyledTextAction(nm);
    this.family = family;
    return this;
  }
  /**
   * Sets the font family.
   *
   * @param e the event
   */
  actionPerformed(e: ActionEvent): void {
    let editor = this.getEditor(e);
    if (editor != null) {
      let family = this.family;
      if ((e != null) && (e.getSource() === editor)) {
        let s = e.getActionCommand();
        if (s != null) {
          family = s;
        }
      }
      if (family != null) {
        let attr = new SimpleAttributeSet()._SimpleAttributeSet$();
        StyleConstants.setFontFamily(attr, family);
        this.setCharacterAttributes(editor, attr, false);
      } else {
        UIManager.getLookAndFeel().provideErrorFeedback(editor);
      }
    }
  }
}

/**
 * An action to set the font size in the associated
 * JEditorPane.  This will use the size specified as
 * the command string on the ActionEvent if there is one,
 * otherwise the size that was initialized with will be used.
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
export class StyledEditorKit$FontSizeAction extends StyledEditorKit$StyledTextAction {
  size_: number = 0;
  /**
   * Creates a new FontSizeAction.
   *
   * @param nm the action name
   * @param size the font size
   */
  _StyledEditorKit$FontSizeAction(nm: string, size: number): this {
    this._StyledEditorKit$StyledTextAction(nm);
    this.size_ = size;
    return this;
  }
  /**
   * Sets the font size.
   *
   * @param e the action event
   */
  actionPerformed(e: ActionEvent): void {
    let editor = this.getEditor(e);
    if (editor != null) {
      let size = this.size_;
      if ((e != null) && (e.getSource() === editor)) {
        let s = e.getActionCommand();
        try {
          size = $J.parseInt(s, 10);
        } catch ($e0) {
          if ($J.isa($e0, NumberFormatException)) {
            let nfe = $J.exc($e0);
          } else {
            throw $e0;
          }
        }
      }
      if (size !== 0) {
        let attr = new SimpleAttributeSet()._SimpleAttributeSet$();
        StyleConstants.setFontSize(attr, size);
        this.setCharacterAttributes(editor, attr, false);
      } else {
        UIManager.getLookAndFeel().provideErrorFeedback(editor);
      }
    }
  }
}

/**
 * An action to set paragraph alignment.  This sets the
 * <code>StyleConstants.Alignment</code> attribute for the
 * currently selected range of the target JEditorPane.
 * This is done by calling
 * <code>StyledDocument.setParagraphAttributes</code>
 * on the styled document associated with the target
 * JEditorPane.
 * <p>
 * If the target text component is specified as the
 * source of the ActionEvent and there is a command string,
 * the command string will be interpreted as an integer
 * that should be one of the legal values for the
 * <code>StyleConstants.Alignment</code> attribute.
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
export class StyledEditorKit$AlignmentAction extends StyledEditorKit$StyledTextAction {
  a: number = 0;
  /**
   * Creates a new AlignmentAction.
   *
   * @param nm the action name
   * @param a the alignment &gt;= 0
   */
  _StyledEditorKit$AlignmentAction(nm: string, a: number): this {
    this._StyledEditorKit$StyledTextAction(nm);
    this.a = a;
    return this;
  }
  /**
   * Sets the alignment.
   *
   * @param e the action event
   */
  actionPerformed(e: ActionEvent): void {
    let editor = this.getEditor(e);
    if (editor != null) {
      let a = this.a;
      if ((e != null) && (e.getSource() === editor)) {
        let s = e.getActionCommand();
        try {
          a = $J.parseInt(s, 10);
        } catch ($e1) {
          if ($J.isa($e1, NumberFormatException)) {
            let nfe = $J.exc($e1);
          } else {
            throw $e1;
          }
        }
      }
      let attr = new SimpleAttributeSet()._SimpleAttributeSet$();
      StyleConstants.setAlignment(attr, a);
      this.setParagraphAttributes(editor, attr, false);
    }
  }
}

/**
 * An action to toggle the bold attribute.
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
export class StyledEditorKit$BoldAction extends StyledEditorKit$StyledTextAction {
  /**
   * Constructs a new BoldAction.
   */
  _StyledEditorKit$BoldAction(): this {
    this._StyledEditorKit$StyledTextAction('font-bold');
    return this;
  }
  /**
   * Toggles the bold attribute.
   *
   * @param e the action event
   */
  actionPerformed(e: ActionEvent): void {
    let editor = this.getEditor(e);
    if (editor != null) {
      let kit = this.getStyledEditorKit(editor);
      let attr = kit.getInputAttributes$();
      let bold = (StyleConstants.isBold(attr)) ? false : true;
      let sas = new SimpleAttributeSet()._SimpleAttributeSet$();
      StyleConstants.setBold(sas, bold);
      this.setCharacterAttributes(editor, sas, false);
    }
  }
}

/**
 * An action to toggle the italic attribute.
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
export class StyledEditorKit$ItalicAction extends StyledEditorKit$StyledTextAction {
  /**
   * Constructs a new ItalicAction.
   */
  _StyledEditorKit$ItalicAction(): this {
    this._StyledEditorKit$StyledTextAction('font-italic');
    return this;
  }
  /**
   * Toggles the italic attribute.
   *
   * @param e the action event
   */
  actionPerformed(e: ActionEvent): void {
    let editor = this.getEditor(e);
    if (editor != null) {
      let kit = this.getStyledEditorKit(editor);
      let attr = kit.getInputAttributes$();
      let italic = (StyleConstants.isItalic(attr)) ? false : true;
      let sas = new SimpleAttributeSet()._SimpleAttributeSet$();
      StyleConstants.setItalic(sas, italic);
      this.setCharacterAttributes(editor, sas, false);
    }
  }
}

/**
 * An action to toggle the underline attribute.
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
export class StyledEditorKit$UnderlineAction extends StyledEditorKit$StyledTextAction {
  /**
   * Constructs a new UnderlineAction.
   */
  _StyledEditorKit$UnderlineAction(): this {
    this._StyledEditorKit$StyledTextAction('font-underline');
    return this;
  }
  /**
   * Toggles the Underline attribute.
   *
   * @param e the action event
   */
  actionPerformed(e: ActionEvent): void {
    let editor = this.getEditor(e);
    if (editor != null) {
      let kit = this.getStyledEditorKit(editor);
      let attr = kit.getInputAttributes$();
      let underline = (StyleConstants.isUnderline(attr)) ? false : true;
      let sas = new SimpleAttributeSet()._SimpleAttributeSet$();
      StyleConstants.setUnderline(sas, underline);
      this.setCharacterAttributes(editor, sas, false);
    }
  }
}

/**
 * StyledInsertBreakAction has similar behavior to that of
 * <code>DefaultEditorKit.InsertBreakAction</code>. That is when
 * its <code>actionPerformed</code> method is invoked, a newline
 * is inserted. Beyond that, this will reset the input attributes to
 * what they were before the newline was inserted.
 */
export class StyledEditorKit$StyledInsertBreakAction extends StyledEditorKit$StyledTextAction {
  tempSet: SimpleAttributeSet = null;
  _StyledEditorKit$StyledInsertBreakAction(): this {
    this._StyledEditorKit$StyledTextAction(DefaultEditorKit.insertBreakAction);
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    let target = this.getEditor(e);
    if (target != null) {
      if ((!target.isEditable()) || (!target.isEnabled())) {
        UIManager.getLookAndFeel().provideErrorFeedback(target);
        return;
      }
      let sek = this.getStyledEditorKit(target);
      if (this.tempSet != null) {
        this.tempSet.removeAttributes$AttributeSet(this.tempSet);
      } else {
        this.tempSet = new SimpleAttributeSet()._SimpleAttributeSet$();
      }
      this.tempSet.addAttributes(sek.getInputAttributes$());
      target.replaceSelection$String('\n');
      let ia = sek.getInputAttributes$();
      ia.removeAttributes$AttributeSet(ia);
      ia.addAttributes(this.tempSet);
      this.tempSet.removeAttributes$AttributeSet(this.tempSet);
    } else {
      let text = this.getTextComponent(e);
      if (text != null) {
        if ((!text.isEditable()) || (!text.isEnabled())) {
          UIManager.getLookAndFeel().provideErrorFeedback(target);
          return;
        }
        text.replaceSelection$String('\n');
      }
    }
  }
}

let $StyledEditorKit$1: any = null;
/** An anonymous class (StyledEditorKit.java:176). */
function StyledEditorKit$1(): any {
  return $StyledEditorKit$1 ??= $J.local(class extends SimpleAttributeSet {
    getResolveParent(): AttributeSet {
      return (this.$outer.currentParagraph != null) ? this.$outer.currentParagraph.getAttributes() : null;
    }
    clone(): any {
      return new SimpleAttributeSet()._SimpleAttributeSet$AttributeSet(this);
    }
  }, 'javax.swing.text.StyledEditorKit$1', []);
}

$J.define(StyledEditorKit, 'javax.swing.text.StyledEditorKit', { kind: 'class', sup: 'javax.swing.text.DefaultEditorKit', ctors: { '': '_StyledEditorKit' }, meths: { 'createInputAttributes(javax.swing.text.Element,javax.swing.text.MutableAttributeSet)': 'createInputAttributes$Element$MutableAttributeSet', 'createInputAttributes()': 'createInputAttributes$$StyledEditorKit', 'deinstall(javax.swing.JEditorPane)': 'deinstall$JEditorPane', 'install(javax.swing.JEditorPane)': 'install$JEditorPane', 'createDefaultDocument()': 'createDefaultDocument$', 'getActions()': 'getActions$', 'getInputAttributes()': 'getInputAttributes$' }, clinit: true, lazy: ['defaultFactory', 'defaultActions'] });
$J.define(StyledEditorKit$AttributeTracker, 'javax.swing.text.StyledEditorKit$AttributeTracker', { kind: 'class', ifaces: ['javax.swing.event.CaretListener', 'java.beans.PropertyChangeListener', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_StyledEditorKit$AttributeTracker' }, inner: true });
$J.define(StyledEditorKit$StyledViewFactory, 'javax.swing.text.StyledEditorKit$StyledViewFactory', { kind: 'class', ifaces: ['javax.swing.text.ViewFactory'], sup: 'java.lang.Object', ctors: { '': '_StyledEditorKit$StyledViewFactory' } });
$J.define(StyledEditorKit$StyledTextAction, 'javax.swing.text.StyledEditorKit$StyledTextAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { 'java.lang.String': '_StyledEditorKit$StyledTextAction' } });
$J.define(StyledEditorKit$FontFamilyAction, 'javax.swing.text.StyledEditorKit$FontFamilyAction', { kind: 'class', sup: 'javax.swing.text.StyledEditorKit$StyledTextAction', ctors: { 'java.lang.String,java.lang.String': '_StyledEditorKit$FontFamilyAction' } });
$J.define(StyledEditorKit$FontSizeAction, 'javax.swing.text.StyledEditorKit$FontSizeAction', { kind: 'class', sup: 'javax.swing.text.StyledEditorKit$StyledTextAction', ctors: { 'java.lang.String,int': '_StyledEditorKit$FontSizeAction' } });
$J.define(StyledEditorKit$AlignmentAction, 'javax.swing.text.StyledEditorKit$AlignmentAction', { kind: 'class', sup: 'javax.swing.text.StyledEditorKit$StyledTextAction', ctors: { 'java.lang.String,int': '_StyledEditorKit$AlignmentAction' } });
$J.define(StyledEditorKit$BoldAction, 'javax.swing.text.StyledEditorKit$BoldAction', { kind: 'class', sup: 'javax.swing.text.StyledEditorKit$StyledTextAction', ctors: { '': '_StyledEditorKit$BoldAction' } });
$J.define(StyledEditorKit$ItalicAction, 'javax.swing.text.StyledEditorKit$ItalicAction', { kind: 'class', sup: 'javax.swing.text.StyledEditorKit$StyledTextAction', ctors: { '': '_StyledEditorKit$ItalicAction' } });
$J.define(StyledEditorKit$UnderlineAction, 'javax.swing.text.StyledEditorKit$UnderlineAction', { kind: 'class', sup: 'javax.swing.text.StyledEditorKit$StyledTextAction', ctors: { '': '_StyledEditorKit$UnderlineAction' } });
$J.define(StyledEditorKit$StyledInsertBreakAction, 'javax.swing.text.StyledEditorKit$StyledInsertBreakAction', { kind: 'class', sup: 'javax.swing.text.StyledEditorKit$StyledTextAction', ctors: { '': '_StyledEditorKit$StyledInsertBreakAction' } });
$J.module(() => {
  JEditorPane = $J.load('javax.swing.JEditorPane');
  UIManager = $J.load('javax.swing.UIManager');
  AbstractDocument = $J.load('javax.swing.text.AbstractDocument');
  BoxView = $J.load('javax.swing.text.BoxView');
  ComponentView = $J.load('javax.swing.text.ComponentView');
  DefaultStyledDocument = $J.load('javax.swing.text.DefaultStyledDocument');
  Document = $J.load('javax.swing.text.Document');
  IconView = $J.load('javax.swing.text.IconView');
  JTextComponent = $J.load('javax.swing.text.JTextComponent');
  LabelView = $J.load('javax.swing.text.LabelView');
  ParagraphView = $J.load('javax.swing.text.ParagraphView');
  SimpleAttributeSet = $J.load('javax.swing.text.SimpleAttributeSet');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
  StyledDocument = $J.load('javax.swing.text.StyledDocument');
  View = $J.load('javax.swing.text.View');
});
