// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JFormattedTextField.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, DateFormat, DecimalFormat, Format, IllegalArgumentException, JDate, JNumber, JObject, NumberFormat, ParseException } from '../../../jre/index.ts';
import { JTextField } from './JTextField.ts';
import { JTextField$NotifyAction } from './JTextField.ts';
import { TextAction } from './text/TextAction.ts';

let AWTEvent, EventQueue, FocusEvent, Action, ActionMap, UIManager, UIResource, AbstractDocument, DateFormatter, DefaultFormatter, DefaultFormatterFactory, DocumentFilter, InternationalFormatter, NumberFormatter;

/**
 * <code>JFormattedTextField</code> extends <code>JTextField</code> adding
 * support for formatting arbitrary values, as well as retrieving a particular
 * object once the user has edited the text. The following illustrates
 * configuring a <code>JFormattedTextField</code> to edit dates:
 * <pre>
 *   JFormattedTextField ftf = new JFormattedTextField();
 *   ftf.setValue(new Date());
 * </pre>
 * <p>
 * Once a <code>JFormattedTextField</code> has been created, you can
 * listen for editing changes by way of adding
 * a <code>PropertyChangeListener</code> and listening for
 * <code>PropertyChangeEvent</code>s with the property name <code>value</code>.
 * <p>
 * <code>JFormattedTextField</code> allows
 * configuring what action should be taken when focus is lost. The possible
 * configurations are:
 *
 * <table class="striped">
 * <caption>Possible JFormattedTextField configurations and their descriptions
 * </caption>
 * <thead>
 *   <tr>
 *     <th scope="col">Value
 *     <th scope="col">Description
 * </thead>
 * <tbody>
 *   <tr>
 *     <th scope="row">JFormattedTextField.REVERT
 *     <td>Revert the display to match that of {@code getValue}, possibly losing
 *     the current edit.
 *   <tr>
 *     <th scope="row">JFormattedTextField.COMMIT
 *     <td>Commits the current value. If the value being edited isn't considered
 *     a legal value by the {@code AbstractFormatter} that is, a
 *     {@code ParseException} is thrown, then the value will not change, and
 *     then edited value will persist.
 *   <tr>
 *     <th scope="row">JFormattedTextField.COMMIT_OR_REVERT
 *     <td>Similar to {@code COMMIT}, but if the value isn't legal, behave like
 *     {@code REVERT}.
 *   <tr>
 *     <th scope="row">JFormattedTextField.PERSIST
 *     <td>Do nothing, don't obtain a new {@code AbstractFormatter}, and don't
 *     update the value.
 * </tbody>
 * </table>
 *
 * The default is <code>JFormattedTextField.COMMIT_OR_REVERT</code>,
 * refer to {@link #setFocusLostBehavior} for more information on this.
 * <p>
 * <code>JFormattedTextField</code> allows the focus to leave, even if
 * the currently edited value is invalid. To lock the focus down while the
 * <code>JFormattedTextField</code> is an invalid edit state
 * you can attach an <code>InputVerifier</code>. The following code snippet
 * shows a potential implementation of such an <code>InputVerifier</code>:
 * <pre>
 * public class FormattedTextFieldVerifier extends InputVerifier {
 *     public boolean verify(JComponent input) {
 *         if (input instanceof JFormattedTextField) {
 *             JFormattedTextField ftf = (JFormattedTextField)input;
 *             AbstractFormatter formatter = ftf.getFormatter();
 *             if (formatter != null) {
 *                 String text = ftf.getText();
 *                 try {
 *                      formatter.stringToValue(text);
 *                      return true;
 *                  } catch (ParseException pe) {
 *                      return false;
 *                  }
 *              }
 *          }
 *          return true;
 *      }
 *      public boolean shouldYieldFocus(JComponent input) {
 *          return verify(input);
 *      }
 *  }
 * </pre>
 * <p>
 * Alternatively, you could invoke <code>commitEdit</code>, which would also
 * commit the value.
 * <p>
 * <code>JFormattedTextField</code> does not do the formatting it self,
 * rather formatting is done through an instance of
 * <code>JFormattedTextField.AbstractFormatter</code> which is obtained from
 * an instance of <code>JFormattedTextField.AbstractFormatterFactory</code>.
 * Instances of <code>JFormattedTextField.AbstractFormatter</code> are
 * notified when they become active by way of the
 * <code>install</code> method, at which point the
 * <code>JFormattedTextField.AbstractFormatter</code> can install whatever
 * it needs to, typically a <code>DocumentFilter</code>. Similarly when
 * <code>JFormattedTextField</code> no longer
 * needs the <code>AbstractFormatter</code>, it will invoke
 * <code>uninstall</code>.
 * <p>
 * <code>JFormattedTextField</code> typically
 * queries the <code>AbstractFormatterFactory</code> for an
 * <code>AbstractFormat</code> when it gains or loses focus. Although this
 * can change based on the focus lost policy. If the focus lost
 * policy is <code>JFormattedTextField.PERSIST</code>
 * and the <code>JFormattedTextField</code> has been edited, the
 * <code>AbstractFormatterFactory</code> will not be queried until the
 * value has been committed. Similarly if the focus lost policy is
 * <code>JFormattedTextField.COMMIT</code> and an exception
 * is thrown from <code>stringToValue</code>, the
 * <code>AbstractFormatterFactory</code> will not be queried when focus is
 * lost or gained.
 * <p>
 * <code>JFormattedTextField.AbstractFormatter</code>
 * is also responsible for determining when values are committed to
 * the <code>JFormattedTextField</code>. Some
 * <code>JFormattedTextField.AbstractFormatter</code>s will make new values
 * available on every edit, and others will never commit the value. You can
 * force the current value to be obtained
 * from the current <code>JFormattedTextField.AbstractFormatter</code>
 * by way of invoking <code>commitEdit</code>. <code>commitEdit</code> will
 * be invoked whenever return is pressed in the
 * <code>JFormattedTextField</code>.
 * <p>
 * If an <code>AbstractFormatterFactory</code> has not been explicitly
 * set, one will be set based on the <code>Class</code> of the value type after
 * <code>setValue</code> has been invoked (assuming value is non-null).
 * For example, in the following code an appropriate
 * <code>AbstractFormatterFactory</code> and <code>AbstractFormatter</code>
 * will be created to handle formatting of numbers:
 * <pre>
 *   JFormattedTextField tf = new JFormattedTextField();
 *   tf.setValue(100);
 * </pre>
 * <p>
 * <strong>Warning:</strong> As the <code>AbstractFormatter</code> will
 * typically install a <code>DocumentFilter</code> on the
 * <code>Document</code>, and a <code>NavigationFilter</code> on the
 * <code>JFormattedTextField</code> you should not install your own. If you do,
 * you are likely to see odd behavior in that the editing policy of the
 * <code>AbstractFormatter</code> will not be enforced.
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
 * @since 1.4
 */
export class JFormattedTextField extends JTextField {
  static readonly uiClassID: string = 'FormattedTextFieldUI';
  static defaultActions: Action[] = null;
  /**
   * Constant identifying that when focus is lost,
   * <code>commitEdit</code> should be invoked. If in committing the
   * new value a <code>ParseException</code> is thrown, the invalid
   * value will remain.
   *
   * @see #setFocusLostBehavior
   */
  static readonly COMMIT: number = 0;
  /**
   * Constant identifying that when focus is lost,
   * <code>commitEdit</code> should be invoked. If in committing the new
   * value a <code>ParseException</code> is thrown, the value will be
   * reverted.
   *
   * @see #setFocusLostBehavior
   */
  static readonly COMMIT_OR_REVERT: number = 1;
  /**
   * Constant identifying that when focus is lost, editing value should
   * be reverted to current value set on the
   * <code>JFormattedTextField</code>.
   *
   * @see #setFocusLostBehavior
   */
  static readonly REVERT: number = 2;
  /**
   * Constant identifying that when focus is lost, the edited value
   * should be left.
   *
   * @see #setFocusLostBehavior
   */
  static readonly PERSIST: number = 3;
  /**
   * Factory used to obtain an instance of AbstractFormatter.
   */
  factory: JFormattedTextField$AbstractFormatterFactory = null;
  /**
   * Object responsible for formatting the current value.
   */
  format_: JFormattedTextField$AbstractFormatter = null;
  /**
   * Last valid value.
   */
  value_: any = null;
  /**
   * True while the value being edited is valid.
   */
  editValid: boolean = false;
  /**
   * Behavior when focus is lost.
   */
  focusLostBehavior: number = 0;
  /**
   * Indicates the current value has been edited.
   */
  edited: boolean = false;
  /**
   * Used to set the dirty state.
   */
  documentListener: DocumentListener = null;
  /**
   * Masked used to set the AbstractFormatterFactory.
   */
  mask: any = null;
  /**
   * ActionMap that the TextFormatter Actions are added to.
   */
  textFormatterActionMap: ActionMap = null;
  /**
   * Indicates the input method composed text is in the document
   */
  composedTextExists_: boolean = false;
  /**
   * A handler for FOCUS_LOST event
   */
  focusLostHandler: JFormattedTextField$FocusLostHandler = null;
  $init_JFormattedTextField() {
    this.composedTextExists_ = false;
  }
  /**
   * Creates a <code>JFormattedTextField</code> with no
   * <code>AbstractFormatterFactory</code>. Use <code>setMask</code> or
   * <code>setFormatterFactory</code> to configure the
   * <code>JFormattedTextField</code> to edit a particular type of
   * value.
   */
  _JFormattedTextField$(): this {
    this._JTextField$();
    this.$init_JFormattedTextField();
    this.enableEvents(AWTEvent.FOCUS_EVENT_MASK);
    this.setFocusLostBehavior(JFormattedTextField.COMMIT_OR_REVERT);
    return this;
  }
  /**
   * Sets the behavior when focus is lost. This will be one of
   * <code>JFormattedTextField.COMMIT_OR_REVERT</code>,
   * <code>JFormattedTextField.REVERT</code>,
   * <code>JFormattedTextField.COMMIT</code> or
   * <code>JFormattedTextField.PERSIST</code>
   * Note that some <code>AbstractFormatter</code>s may push changes as
   * they occur, so that the value of this will have no effect.
   * <p>
   * This will throw an <code>IllegalArgumentException</code> if the object
   * passed in is not one of the afore mentioned values.
   * <p>
   * The default value of this property is
   * <code>JFormattedTextField.COMMIT_OR_REVERT</code>.
   *
   * @param behavior Identifies behavior when focus is lost
   * @throws IllegalArgumentException if behavior is not one of the known
   *         values
   */
  setFocusLostBehavior(behavior: number): void {
    if (behavior !== JFormattedTextField.COMMIT && behavior !== JFormattedTextField.COMMIT_OR_REVERT && behavior !== JFormattedTextField.PERSIST && behavior !== JFormattedTextField.REVERT) {
      throw new IllegalArgumentException('setFocusLostBehavior must be one of: JFormattedTextField.COMMIT, JFormattedTextField.COMMIT_OR_REVERT, JFormattedTextField.PERSIST or JFormattedTextField.REVERT');
    }
    this.focusLostBehavior = behavior;
  }
  /**
   * Returns the behavior when focus is lost. This will be one of
   * <code>COMMIT_OR_REVERT</code>,
   * <code>COMMIT</code>,
   * <code>REVERT</code> or
   * <code>PERSIST</code>
   * Note that some <code>AbstractFormatter</code>s may push changes as
   * they occur, so that the value of this will have no effect.
   *
   * @return returns behavior when focus is lost
   */
  getFocusLostBehavior(): number {
    return this.focusLostBehavior;
  }
  /**
   * Sets the <code>AbstractFormatterFactory</code>.
   * <code>AbstractFormatterFactory</code> is
   * able to return an instance of <code>AbstractFormatter</code> that is
   * used to format a value for display, as well an enforcing an editing
   * policy.
   * <p>
   * If you have not explicitly set an <code>AbstractFormatterFactory</code>
   * by way of this method (or a constructor) an
   * <code>AbstractFormatterFactory</code> and consequently an
   * <code>AbstractFormatter</code> will be used based on the
   * <code>Class</code> of the value. <code>NumberFormatter</code> will
   * be used for <code>Number</code>s, <code>DateFormatter</code> will
   * be used for <code>Dates</code>, otherwise <code>DefaultFormatter</code>
   * will be used.
   * <p>
   * This is a JavaBeans bound property.
   *
   * @param tf <code>AbstractFormatterFactory</code> used to lookup
   *          instances of <code>AbstractFormatter</code>
   */
  setFormatterFactory(tf: JFormattedTextField$AbstractFormatterFactory): void {
    let oldFactory = this.factory;
    this.factory = tf;
    this.firePropertyChange$String$Object$Object('formatterFactory', oldFactory, tf);
    this.setValue$Object$boolean$boolean$JFormattedTextField(this.getValue(), true, false);
  }
  /**
   * Returns the current <code>AbstractFormatterFactory</code>.
   *
   * @see #setFormatterFactory
   * @return <code>AbstractFormatterFactory</code> used to determine
   *         <code>AbstractFormatter</code>s
   */
  getFormatterFactory(): JFormattedTextField$AbstractFormatterFactory {
    return this.factory;
  }
  /**
   * Sets the current <code>AbstractFormatter</code>.
   * <p>
   * You should not normally invoke this, instead set the
   * <code>AbstractFormatterFactory</code> or set the value.
   * <code>JFormattedTextField</code> will
   * invoke this as the state of the <code>JFormattedTextField</code>
   * changes and requires the value to be reset.
   * <code>JFormattedTextField</code> passes in the
   * <code>AbstractFormatter</code> obtained from the
   * <code>AbstractFormatterFactory</code>.
   * <p>
   * This is a JavaBeans bound property.
   *
   * @see #setFormatterFactory
   * @param format AbstractFormatter to use for formatting
   */
  setFormatter(format: JFormattedTextField$AbstractFormatter): void {
    let oldFormat = this.format_;
    if (oldFormat != null) {
      oldFormat.uninstall();
    }
    this.setEditValid(true);
    this.format_ = format;
    if (format != null) {
      format.install(this);
    }
    this.setEdited(false);
    this.firePropertyChange$String$Object$Object('textFormatter', oldFormat, format);
  }
  /**
   * Returns the <code>AbstractFormatter</code> that is used to format and
   * parse the current value.
   *
   * @return AbstractFormatter used for formatting
   */
  getFormatter(): JFormattedTextField$AbstractFormatter {
    return this.format_;
  }
  /**
   * Sets the value that will be formatted by an
   * <code>AbstractFormatter</code> obtained from the current
   * <code>AbstractFormatterFactory</code>. If no
   * <code>AbstractFormatterFactory</code> has been specified, this will
   * attempt to create one based on the type of <code>value</code>.
   * <p>
   * The default value of this property is null.
   * <p>
   * This is a JavaBeans bound property.
   *
   * @param value Current value to display
   */
  setValue$Object(value: any): void {
    if (value != null && this.getFormatterFactory() == null) {
      this.setFormatterFactory(this.getDefaultFormatterFactory(value));
    }
    this.setValue$Object$boolean$boolean$JFormattedTextField(value, true, true);
  }
  /**
   * Returns the last valid value. Based on the editing policy of
   * the <code>AbstractFormatter</code> this may not return the current
   * value. The currently edited value can be obtained by invoking
   * <code>commitEdit</code> followed by <code>getValue</code>.
   *
   * @return Last valid value
   */
  getValue(): any {
    return this.value_;
  }
  /**
   * Forces the current value to be taken from the
   * <code>AbstractFormatter</code> and set as the current value.
   * This has no effect if there is no current
   * <code>AbstractFormatter</code> installed.
   *
   * @throws ParseException if the <code>AbstractFormatter</code> is not able
   *         to format the current value
   */
  commitEdit(): void {
    let format = this.getFormatter();
    if (format != null) {
      this.setValue$Object$boolean$boolean$JFormattedTextField(format.stringToValue$String(this.getText$()), false, true);
    }
  }
  /**
   * Sets the validity of the edit on the receiver. You should not normally
   * invoke this. This will be invoked by the
   * <code>AbstractFormatter</code> as the user edits the value.
   * <p>
   * Not all formatters will allow the component to get into an invalid
   * state, and thus this may never be invoked.
   * <p>
   * Based on the look and feel this may visually change the state of
   * the receiver.
   *
   * @param isValid boolean indicating if the currently edited value is
   *        valid.
   */
  setEditValid(isValid: boolean): void {
    if (isValid !== this.editValid) {
      this.editValid = isValid;
      this.firePropertyChange$String$Object$Object('editValid', !isValid, isValid);
    }
  }
  /**
   * Invoked when the user inputs an invalid value. This gives the
   * component a chance to provide feedback. The default
   * implementation beeps.
   */
  invalidEdit(): void {
    UIManager.getLookAndFeel().provideErrorFeedback(this);
  }
  /**
   * Processes any input method events, such as
   * <code>InputMethodEvent.INPUT_METHOD_TEXT_CHANGED</code> or
   * <code>InputMethodEvent.CARET_POSITION_CHANGED</code>.
   *
   * @param e the <code>InputMethodEvent</code>
   * @see InputMethodEvent
   */
  processInputMethodEvent(e: InputMethodEvent): void {
    let text = e.getText();
    let commitCount = e.getCommittedCharacterCount();
    if (text != null) {
      let begin = text.getBeginIndex();
      let end = text.getEndIndex();
      this.composedTextExists_ = (((end - begin) | 0) > commitCount);
    } else {
      this.composedTextExists_ = false;
    }
    super.processInputMethodEvent(e);
  }
  /**
   * Processes any focus events, such as
   * <code>FocusEvent.FOCUS_GAINED</code> or
   * <code>FocusEvent.FOCUS_LOST</code>.
   *
   * @param e the <code>FocusEvent</code>
   * @see FocusEvent
   */
  processFocusEvent(e: FocusEvent): void {
    super.processFocusEvent(e);
    if (e.isTemporary()) {
      return;
    }
    if (this.isEdited() && e.getID() === FocusEvent.FOCUS_LOST) {
      let ic = this.getInputContext();
      if (this.focusLostHandler == null) {
        this.focusLostHandler = new JFormattedTextField$FocusLostHandler().$o(this)._JFormattedTextField$FocusLostHandler();
      }
      if ((ic != null) && this.composedTextExists_) {
        ic.endComposition();
        EventQueue.invokeLater($J.fn(this.focusLostHandler, 'run'));
      } else {
        this.focusLostHandler.run();
      }
    } else if (!this.isEdited()) {
      this.setValue$Object$boolean$boolean$JFormattedTextField(this.getValue(), true, true);
    }
  }
  /**
   * Fetches the command list for the editor.  This is
   * the list of commands supported by the plugged-in UI
   * augmented by the collection of commands that the
   * editor itself supports.  These are useful for binding
   * to events, such as in a keymap.
   *
   * @return the command list
   */
  getActions(): Action[] {
    return TextAction.augmentList(super.getActions(), JFormattedTextField.defaultActions);
  }
  /**
   * Gets the class ID for a UI.
   *
   * @return the string "FormattedTextFieldUI"
   * @see JComponent#getUIClassID
   */
  getUIClassID(): string {
    return JFormattedTextField.uiClassID;
  }
  /**
   * Associates the editor with a text document.
   * The currently registered factory is used to build a view for
   * the document, which gets displayed by the editor after revalidation.
   * A PropertyChange event ("document") is propagated to each listener.
   *
   * @param doc  the document to display/edit
   * @see #getDocument
   */
  setDocument(doc: Document): void {
    if (this.documentListener != null && this.getDocument() != null) {
      this.getDocument().removeDocumentListener(this.documentListener);
    }
    super.setDocument(doc);
    if (this.documentListener == null) {
      this.documentListener = new JFormattedTextField$DocumentHandler().$o(this)._JFormattedTextField$DocumentHandler();
    }
    doc.addDocumentListener(this.documentListener);
  }
  /**
   * Resets the Actions that come from the TextFormatter to
   * <code>actions</code>.
   */
  setFormatterActions(actions: Action[]): void {
    if (actions == null) {
      if (this.textFormatterActionMap != null) {
        this.textFormatterActionMap.clear();
      }
    } else {
      if (this.textFormatterActionMap == null) {
        let map = this.getActionMap$();
        this.textFormatterActionMap = new ActionMap()._ActionMap();
        while (map != null) {
          let parent = map.getParent();
          if ($J.isa(parent, UIResource) || parent == null) {
            map.setParent(this.textFormatterActionMap);
            this.textFormatterActionMap.setParent(parent);
            break;
          }
          map = parent;
        }
      }
      for (let counter = (actions.length - 1) | 0; counter >= 0; counter--) {
        let key = actions[counter].getValue$String(Action.NAME);
        if (key != null) {
          this.textFormatterActionMap.put$Object$Action(key, actions[counter]);
        }
      }
    }
  }
  /**
   * Does the setting of the value. If <code>createFormat</code> is true,
   * this will also obtain a new <code>AbstractFormatter</code> from the
   * current factory. The property change event will be fired if
   * <code>firePC</code> is true.
   */
  setValue$Object$boolean$boolean$JFormattedTextField(value: any, createFormat: boolean, firePC: boolean): void {
    let oldValue = this.value_;
    this.value_ = value;
    if (createFormat) {
      let factory = this.getFormatterFactory();
      let atf: JFormattedTextField$AbstractFormatter;
      if (factory != null) {
        atf = factory.getFormatter(this);
      } else {
        atf = null;
      }
      this.setFormatter(atf);
    } else {
      this.setEditValid(true);
    }
    this.setEdited(false);
    if (firePC) {
      this.firePropertyChange$String$Object$Object('value', oldValue, value);
    }
  }
  /**
   * Sets the edited state of the receiver.
   */
  setEdited(edited: boolean): void {
    this.edited = edited;
  }
  /**
   * Returns true if the receiver has been edited.
   */
  isEdited(): boolean {
    return this.edited;
  }
  /**
   * Returns an AbstractFormatterFactory suitable for the passed in
   * Object type.
   */
  getDefaultFormatterFactory(type$: any): JFormattedTextField$AbstractFormatterFactory {
    if ($J.isa(type$, DateFormat)) {
      return new DefaultFormatterFactory()._DefaultFormatterFactory$AbstractFormatter(new DateFormatter()._DateFormatter$DateFormat(type$));
    }
    if ($J.isa(type$, NumberFormat)) {
      return new DefaultFormatterFactory()._DefaultFormatterFactory$AbstractFormatter(new NumberFormatter()._NumberFormatter$NumberFormat(type$));
    }
    if ($J.isa(type$, Format)) {
      return new DefaultFormatterFactory()._DefaultFormatterFactory$AbstractFormatter(new InternationalFormatter()._InternationalFormatter$Format(type$));
    }
    if ($J.isa(type$, JDate)) {
      return new DefaultFormatterFactory()._DefaultFormatterFactory$AbstractFormatter(new DateFormatter()._DateFormatter$());
    }
    if ($J.isa(type$, JNumber)) {
      let displayFormatter = new NumberFormatter()._NumberFormatter$();
      displayFormatter.setValueClass($J.getClass(type$));
      let editFormatter = new NumberFormatter()._NumberFormatter$NumberFormat(new DecimalFormat('#.#'));
      editFormatter.setValueClass($J.getClass(type$));
      return new DefaultFormatterFactory()._DefaultFormatterFactory$AbstractFormatter$AbstractFormatter$AbstractFormatter(displayFormatter, displayFormatter, editFormatter);
    }
    return new DefaultFormatterFactory()._DefaultFormatterFactory$AbstractFormatter(new DefaultFormatter()._DefaultFormatter());
  }
  static $clinit() {
    JFormattedTextField.defaultActions = [new JFormattedTextField$CommitAction()._JFormattedTextField$CommitAction(), new JFormattedTextField$CancelAction()._JFormattedTextField$CancelAction()];
  }
}

/**
 * FOCUS_LOST behavior implementation
 */
export class JFormattedTextField$FocusLostHandler extends JObject {
  _JFormattedTextField$FocusLostHandler(): this {
    return this;
  }
  run(): void {
    let fb = this.$outer.getFocusLostBehavior();
    if (fb === JFormattedTextField.COMMIT || fb === JFormattedTextField.COMMIT_OR_REVERT) {
      try {
        this.$outer.commitEdit();
        this.$outer.setValue$Object$boolean$boolean$JFormattedTextField(this.$outer.getValue(), true, true);
      } catch ($e0) {
        if ($J.isa($e0, ParseException)) {
          let pe = $J.exc($e0);
          if (fb === JFormattedTextField.COMMIT_OR_REVERT) {
            this.$outer.setValue$Object$boolean$boolean$JFormattedTextField(this.$outer.getValue(), true, true);
          }
        } else {
          throw $e0;
        }
      }
    } else if (fb === JFormattedTextField.REVERT) {
      this.$outer.setValue$Object$boolean$boolean$JFormattedTextField(this.$outer.getValue(), true, true);
    }
  }
}

/**
 * Instances of <code>AbstractFormatterFactory</code> are used by
 * <code>JFormattedTextField</code> to obtain instances of
 * <code>AbstractFormatter</code> which in turn are used to format values.
 * <code>AbstractFormatterFactory</code> can return different
 * <code>AbstractFormatter</code>s based on the state of the
 * <code>JFormattedTextField</code>, perhaps returning different
 * <code>AbstractFormatter</code>s when the
 * <code>JFormattedTextField</code> has focus vs when it
 * doesn't have focus.
 * @since 1.4
 */
export class JFormattedTextField$AbstractFormatterFactory extends JObject {
  /**
   * Constructor for subclasses to call.
   */
  _JFormattedTextField$AbstractFormatterFactory(): this {
    return this;
  }
}

/**
 * Instances of <code>AbstractFormatter</code> are used by
 * <code>JFormattedTextField</code> to handle the conversion both
 * from an Object to a String, and back from a String to an Object.
 * <code>AbstractFormatter</code>s can also enforce editing policies,
 * or navigation policies, or manipulate the
 * <code>JFormattedTextField</code> in any way it sees fit to
 * enforce the desired policy.
 * <p>
 * An <code>AbstractFormatter</code> can only be active in
 * one <code>JFormattedTextField</code> at a time.
 * <code>JFormattedTextField</code> invokes
 * <code>install</code> when it is ready to use it followed
 * by <code>uninstall</code> when done. Subclasses
 * that wish to install additional state should override
 * <code>install</code> and message super appropriately.
 * <p>
 * Subclasses must override the conversion methods
 * <code>stringToValue</code> and <code>valueToString</code>. Optionally
 * they can override <code>getActions</code>,
 * <code>getNavigationFilter</code> and <code>getDocumentFilter</code>
 * to restrict the <code>JFormattedTextField</code> in a particular
 * way.
 * <p>
 * Subclasses that allow the <code>JFormattedTextField</code> to be in
 * a temporarily invalid state should invoke <code>setEditValid</code>
 * at the appropriate times.
 * @since 1.4
 */
export class JFormattedTextField$AbstractFormatter extends JObject {
  ftf: JFormattedTextField = null;
  /**
   * Constructor for subclasses to call.
   */
  _JFormattedTextField$AbstractFormatter(): this {
    return this;
  }
  /**
   * Installs the <code>AbstractFormatter</code> onto a particular
   * <code>JFormattedTextField</code>.
   * This will invoke <code>valueToString</code> to convert the
   * current value from the <code>JFormattedTextField</code> to
   * a String. This will then install the <code>Action</code>s from
   * <code>getActions</code>, the <code>DocumentFilter</code>
   * returned from <code>getDocumentFilter</code> and the
   * <code>NavigationFilter</code> returned from
   * <code>getNavigationFilter</code> onto the
   * <code>JFormattedTextField</code>.
   * <p>
   * Subclasses will typically only need to override this if they
   * wish to install additional listeners on the
   * <code>JFormattedTextField</code>.
   * <p>
   * If there is a <code>ParseException</code> in converting the
   * current value to a String, this will set the text to an empty
   * String, and mark the <code>JFormattedTextField</code> as being
   * in an invalid state.
   * <p>
   * While this is a public method, this is typically only useful
   * for subclassers of <code>JFormattedTextField</code>.
   * <code>JFormattedTextField</code> will invoke this method at
   * the appropriate times when the value changes, or its internal
   * state changes.  You will only need to invoke this yourself if
   * you are subclassing <code>JFormattedTextField</code> and
   * installing/uninstalling <code>AbstractFormatter</code> at a
   * different time than <code>JFormattedTextField</code> does.
   *
   * @param ftf JFormattedTextField to format for, may be null indicating
   *            uninstall from current JFormattedTextField.
   */
  install(ftf: JFormattedTextField): void {
    if (this.ftf != null) {
      this.uninstall();
    }
    this.ftf = ftf;
    if (ftf != null) {
      try {
        ftf.setText(this.valueToString(ftf.getValue()));
      } catch ($e1) {
        if ($J.isa($e1, ParseException)) {
          let pe = $J.exc($e1);
          ftf.setText('');
          this.setEditValid(false);
        } else {
          throw $e1;
        }
      }
      this.installDocumentFilter(this.getDocumentFilter());
      ftf.setNavigationFilter(this.getNavigationFilter());
      ftf.setFormatterActions(this.getActions());
    }
  }
  /**
   * Uninstalls any state the <code>AbstractFormatter</code> may have
   * installed on the <code>JFormattedTextField</code>. This resets the
   * <code>DocumentFilter</code>, <code>NavigationFilter</code>
   * and additional <code>Action</code>s installed on the
   * <code>JFormattedTextField</code>.
   */
  uninstall(): void {
    if (this.ftf != null) {
      this.installDocumentFilter(null);
      this.ftf.setNavigationFilter(null);
      this.ftf.setFormatterActions(null);
    }
  }
  /**
   * Returns the current <code>JFormattedTextField</code> the
   * <code>AbstractFormatter</code> is installed on.
   *
   * @return JFormattedTextField formatting for.
   */
  getFormattedTextField(): JFormattedTextField {
    return this.ftf;
  }
  /**
   * This should be invoked when the user types an invalid character.
   * This forwards the call to the current JFormattedTextField.
   */
  invalidEdit(): void {
    let ftf = this.getFormattedTextField();
    if (ftf != null) {
      ftf.invalidEdit();
    }
  }
  /**
   * Invoke this to update the <code>editValid</code> property of the
   * <code>JFormattedTextField</code>. If you an enforce a policy
   * such that the <code>JFormattedTextField</code> is always in a
   * valid state, you will never need to invoke this.
   *
   * @param valid Valid state of the JFormattedTextField
   */
  setEditValid(valid: boolean): void {
    let ftf = this.getFormattedTextField();
    if (ftf != null) {
      ftf.setEditValid(valid);
    }
  }
  /**
   * Subclass and override if you wish to provide a custom set of
   * <code>Action</code>s. <code>install</code> will install these
   * on the <code>JFormattedTextField</code>'s <code>ActionMap</code>.
   *
   * @return Array of Actions to install on JFormattedTextField
   */
  getActions(): Action[] {
    return null;
  }
  /**
   * Subclass and override if you wish to provide a filter to restrict
   * where the user can navigate to.
   * <code>install</code> will install the returned value onto
   * the <code>JFormattedTextField</code>.
   *
   * @implSpec The default implementation returns <code>null</code>.
   *
   * @return NavigationFilter to restrict navigation
   */
  getNavigationFilter(): NavigationFilter {
    return null;
  }
  /**
   * Clones the <code>AbstractFormatter</code>. The returned instance
   * is not associated with a <code>JFormattedTextField</code>.
   *
   * @return Copy of the AbstractFormatter
   */
  clone(): any {
    let formatter = super.clone();
    formatter.ftf = null;
    return formatter;
  }
  /**
   * Installs the <code>DocumentFilter</code> <code>filter</code>
   * onto the current <code>JFormattedTextField</code>.
   *
   * @param filter DocumentFilter to install on the Document.
   */
  installDocumentFilter(filter: DocumentFilter): void {
    let ftf = this.getFormattedTextField();
    if (ftf != null) {
      let doc = ftf.getDocument();
      if (doc instanceof AbstractDocument) {
        (doc).setDocumentFilter(filter);
      }
      doc.putProperty($J.cls(DocumentFilter), null);
    }
  }
}

/**
 * Used to commit the edit. This extends JTextField.NotifyAction
 * so that <code>isEnabled</code> is true while a JFormattedTextField
 * has focus, and extends <code>actionPerformed</code> to invoke
 * commitEdit.
 */
export class JFormattedTextField$CommitAction extends JTextField$NotifyAction {
  _JFormattedTextField$CommitAction(): this {
    this._JTextField$NotifyAction();
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    let target = this.getFocusedComponent();
    if (target instanceof JFormattedTextField) {
      try {
        (target).commitEdit();
      } catch ($e2) {
        if ($J.isa($e2, ParseException)) {
          let pe = $J.exc($e2);
          (target).invalidEdit();
          return;
        } else {
          throw $e2;
        }
      }
    }
    super.actionPerformed(e);
  }
  isEnabled(): boolean {
    let target = this.getFocusedComponent();
    if (target instanceof JFormattedTextField) {
      let ftf = target;
      if (!ftf.isEdited()) {
        return false;
      }
      return true;
    }
    return super.isEnabled();
  }
}

/**
 * CancelAction will reset the value in the JFormattedTextField when
 * <code>actionPerformed</code> is invoked. It will only be
 * enabled if the focused component is an instance of
 * JFormattedTextField.
 */
export class JFormattedTextField$CancelAction extends TextAction {
  _JFormattedTextField$CancelAction(): this {
    this._TextAction('reset-field-edit');
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    let target = this.getFocusedComponent();
    if (target instanceof JFormattedTextField) {
      let ftf = target;
      ftf.setValue$Object(ftf.getValue());
    }
  }
  isEnabled(): boolean {
    let target = this.getFocusedComponent();
    if (target instanceof JFormattedTextField) {
      let ftf = target;
      if (!ftf.isEdited()) {
        return false;
      }
      return true;
    }
    return super.isEnabled();
  }
}

/**
 * Sets the dirty state as the document changes.
 */
export class JFormattedTextField$DocumentHandler extends JObject {
  _JFormattedTextField$DocumentHandler(): this {
    return this;
  }
  insertUpdate(e: DocumentEvent): void {
    this.$outer.setEdited(true);
  }
  removeUpdate(e: DocumentEvent): void {
    this.$outer.setEdited(true);
  }
  changedUpdate(e: DocumentEvent): void {
  }
}

$J.define(JFormattedTextField, 'javax.swing.JFormattedTextField', { kind: 'class', sup: 'javax.swing.JTextField', ctors: { 'javax.swing.JFormattedTextField$AbstractFormatterFactory,java.lang.Object': '_JFormattedTextField$AbstractFormatterFactory$Object', 'javax.swing.JFormattedTextField$AbstractFormatterFactory': '_JFormattedTextField$AbstractFormatterFactory', 'javax.swing.JFormattedTextField$AbstractFormatter': '_JFormattedTextField$AbstractFormatter', 'java.text.Format': '_JFormattedTextField$Format', 'java.lang.Object': '_JFormattedTextField$Object', '': '_JFormattedTextField$' }, meths: { 'setValue(java.lang.Object,boolean,boolean)': 'setValue$Object$boolean$boolean$JFormattedTextField', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JFormattedTextField', 'setValue(java.lang.Object)': 'setValue$Object' }, clinit: true, lazy: ['defaultActions'] });
$J.define(JFormattedTextField$FocusLostHandler, 'javax.swing.JFormattedTextField$FocusLostHandler', { kind: 'class', ifaces: ['java.lang.Runnable', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_JFormattedTextField$FocusLostHandler' }, inner: true });
$J.define(JFormattedTextField$AbstractFormatterFactory, 'javax.swing.JFormattedTextField$AbstractFormatterFactory', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_JFormattedTextField$AbstractFormatterFactory' } });
$J.define(JFormattedTextField$AbstractFormatter, 'javax.swing.JFormattedTextField$AbstractFormatter', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_JFormattedTextField$AbstractFormatter' }, meths: { 'stringToValue(java.lang.String)': 'stringToValue$String' } });
$J.define(JFormattedTextField$CommitAction, 'javax.swing.JFormattedTextField$CommitAction', { kind: 'class', sup: 'javax.swing.JTextField$NotifyAction', ctors: { '': '_JFormattedTextField$CommitAction' } });
$J.define(JFormattedTextField$CancelAction, 'javax.swing.JFormattedTextField$CancelAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_JFormattedTextField$CancelAction' } });
$J.define(JFormattedTextField$DocumentHandler, 'javax.swing.JFormattedTextField$DocumentHandler', { kind: 'class', ifaces: ['javax.swing.event.DocumentListener', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_JFormattedTextField$DocumentHandler' }, inner: true });
$J.module(() => {
  AWTEvent = $J.load('java.awt.AWTEvent');
  EventQueue = $J.load('java.awt.EventQueue');
  FocusEvent = $J.load('java.awt.event.FocusEvent');
  Action = $J.load('javax.swing.Action');
  ActionMap = $J.load('javax.swing.ActionMap');
  UIManager = $J.load('javax.swing.UIManager');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  AbstractDocument = $J.load('javax.swing.text.AbstractDocument');
  DateFormatter = $J.load('javax.swing.text.DateFormatter');
  DefaultFormatter = $J.load('javax.swing.text.DefaultFormatter');
  DefaultFormatterFactory = $J.load('javax.swing.text.DefaultFormatterFactory');
  DocumentFilter = $J.load('javax.swing.text.DocumentFilter');
  InternationalFormatter = $J.load('javax.swing.text.InternationalFormatter');
  NumberFormatter = $J.load('javax.swing.text.NumberFormatter');
});
