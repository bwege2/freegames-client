// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JSpinner.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, DateFormatProvider, DecimalFormat, IllegalArgumentException, JObject, JString, LocaleProviderAdapter, NullPointerException, NumberFormatProvider, ParseException, SimpleDateFormat } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { JPanel } from './JPanel.ts';
import { DateFormatter } from './text/DateFormatter.ts';
import { NumberFormatter } from './text/NumberFormatter.ts';
import { JFormattedTextField$AbstractFormatter } from './JFormattedTextField.ts';
import { DocumentFilter } from './text/DocumentFilter.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';

let Dimension, AccessibleContext, JFormattedTextField, SpinnerDateModel, SpinnerListModel, SpinnerNumberModel, SwingConstants, UIManager, ChangeEvent, ChangeListener, FontUIResource, UIResource, DefaultFormatterFactory;

/**
 * A single line input field that lets the user select a
 * number or an object value from an ordered sequence. Spinners typically
 * provide a pair of tiny arrow buttons for stepping through the elements
 * of the sequence. The keyboard up/down arrow keys also cycle through the
 * elements. The user may also be allowed to type a (legal) value directly
 * into the spinner. Although combo boxes provide similar functionality,
 * spinners are sometimes preferred because they don't require a drop down list
 * that can obscure important data.
 * <p>
 * A <code>JSpinner</code>'s sequence value is defined by its
 * <code>SpinnerModel</code>.
 * The <code>model</code> can be specified as a constructor argument and
 * changed with the <code>model</code> property.  <code>SpinnerModel</code>
 * classes for some common types are provided: <code>SpinnerListModel</code>,
 * <code>SpinnerNumberModel</code>, and <code>SpinnerDateModel</code>.
 * <p>
 * A <code>JSpinner</code> has a single child component that's
 * responsible for displaying
 * and potentially changing the current element or <i>value</i> of
 * the model, which is called the <code>editor</code>.  The editor is created
 * by the <code>JSpinner</code>'s constructor and can be changed with the
 * <code>editor</code> property.  The <code>JSpinner</code>'s editor stays
 * in sync with the model by listening for <code>ChangeEvent</code>s. If the
 * user has changed the value displayed by the <code>editor</code> it is
 * possible for the <code>model</code>'s value to differ from that of
 * the <code>editor</code>. To make sure the <code>model</code> has the same
 * value as the editor use the <code>commitEdit</code> method, eg:
 * <pre>
 *   try {
 *       spinner.commitEdit();
 *   }
 *   catch (ParseException pe) {
 *       // Edited value is invalid, spinner.getValue() will return
 *       // the last valid value, you could revert the spinner to show that:
 *       JComponent editor = spinner.getEditor();
 *       if (editor instanceof DefaultEditor) {
 *           ((DefaultEditor)editor).getTextField().setValue(spinner.getValue());
 *       }
 *       // reset the value to some known value:
 *       spinner.setValue(fallbackValue);
 *       // or treat the last valid value as the current, in which
 *       // case you don't need to do anything.
 *   }
 *   return spinner.getValue();
 * </pre>
 * <p>
 * For information and examples of using spinner see
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/spinner.html">How to Use Spinners</a>,
 * a section in <em>The Java Tutorial.</em>
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
 * @see SpinnerModel
 * @see AbstractSpinnerModel
 * @see SpinnerListModel
 * @see SpinnerNumberModel
 * @see SpinnerDateModel
 * @see JFormattedTextField
 *
 * @author Hans Muller
 * @author Lynn Monsanto (accessibility)
 * @since 1.4
 */
export class JSpinner extends JComponent {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'SpinnerUI';
  static DISABLED_ACTION: Action = null;
  model: SpinnerModel = null;
  editor: JComponent = null;
  modelListener: ChangeListener = null;
  changeEvent: ChangeEvent = null;
  editorExplicitlySet: boolean = false;
  $init_JSpinner() {
    this.editorExplicitlySet = false;
  }
  /**
   * Constructs a spinner for the given model. The spinner has
   * a set of previous/next buttons, and an editor appropriate
   * for the model.
   *
   * @param model  a model for the new spinner
   * @throws NullPointerException if the model is {@code null}
   */
  _JSpinner$SpinnerModel(model: SpinnerModel): this {
    this._JComponent();
    this.$init_JSpinner();
    if (model == null) {
      throw new NullPointerException('model cannot be null');
    }
    this.model = model;
    this.editor = this.createEditor(model);
    this.setUIProperty('opaque', true);
    this.updateUI();
    return this;
  }
  /**
   * Constructs a spinner with an <code>Integer SpinnerNumberModel</code>
   * with initial value 0 and no minimum or maximum limits.
   */
  _JSpinner$(): this {
    this._JSpinner$SpinnerModel(new SpinnerNumberModel()._SpinnerNumberModel$());
    return this;
  }
  /**
   * Returns the look and feel (L&amp;F) object that renders this component.
   *
   * @return the <code>SpinnerUI</code> object that renders this component
   */
  getUI(): SpinnerUI {
    return this.ui;
  }
  /**
   * Sets the look and feel (L&amp;F) object that renders this component.
   *
   * @param ui  the <code>SpinnerUI</code> L&amp;F object
   * @see UIDefaults#getUI
   */
  setUI$SpinnerUI(ui: SpinnerUI): void {
    super.setUI$ComponentUI(ui);
  }
  /**
   * Returns the suffix used to construct the name of the look and feel
   * (L&amp;F) class used to render this component.
   *
   * @return the string "SpinnerUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JSpinner.uiClassID;
  }
  /**
   * Resets the UI property with the value from the current look and feel.
   *
   * @see UIManager#getUI
   */
  updateUI(): void {
    this.setUI$SpinnerUI(UIManager.getUI(this));
    this.invalidate();
  }
  /**
   * This method is called by the constructors to create the
   * <code>JComponent</code>
   * that displays the current value of the sequence.  The editor may
   * also allow the user to enter an element of the sequence directly.
   * An editor must listen for <code>ChangeEvents</code> on the
   * <code>model</code> and keep the value it displays
   * in sync with the value of the model.
   * <p>
   * Subclasses may override this method to add support for new
   * <code>SpinnerModel</code> classes.  Alternatively one can just
   * replace the editor created here with the <code>setEditor</code>
   * method.  The default mapping from model type to editor is:
   * <ul>
   * <li> <code>SpinnerNumberModel =&gt; JSpinner.NumberEditor</code>
   * <li> <code>SpinnerDateModel =&gt; JSpinner.DateEditor</code>
   * <li> <code>SpinnerListModel =&gt; JSpinner.ListEditor</code>
   * <li> <i>all others</i> =&gt; <code>JSpinner.DefaultEditor</code>
   * </ul>
   *
   * @return a component that displays the current value of the sequence
   * @param model the value of getModel
   * @see #getModel
   * @see #setEditor
   */
  createEditor(model: SpinnerModel): JComponent {
    if (model instanceof SpinnerDateModel) {
      return new JSpinner$DateEditor()._JSpinner$DateEditor$JSpinner(this);
    } else if (model instanceof SpinnerListModel) {
      return new JSpinner$ListEditor()._JSpinner$ListEditor(this);
    } else if (model instanceof SpinnerNumberModel) {
      return new JSpinner$NumberEditor()._JSpinner$NumberEditor$JSpinner(this);
    } else {
      return new JSpinner$DefaultEditor()._JSpinner$DefaultEditor(this);
    }
  }
  /**
   * Changes the model that represents the value of this spinner.
   * If the editor property has not been explicitly set,
   * the editor property is (implicitly) set after the <code>"model"</code>
   * <code>PropertyChangeEvent</code> has been fired.  The editor
   * property is set to the value returned by <code>createEditor</code>,
   * as in:
   * <pre>
   * setEditor(createEditor(model));
   * </pre>
   *
   * @param model the new <code>SpinnerModel</code>
   * @see #getModel
   * @see #getEditor
   * @see #setEditor
   * @throws IllegalArgumentException if model is <code>null</code>
   */
  setModel(model: SpinnerModel): void {
    if (model == null) {
      throw new IllegalArgumentException('null model');
    }
    if (!model.equals(this.model)) {
      let oldModel = this.model;
      this.model = model;
      if (this.modelListener != null) {
        oldModel.removeChangeListener(this.modelListener);
        this.model.addChangeListener(this.modelListener);
      }
      this.firePropertyChange$String$Object$Object('model', oldModel, model);
      if (!this.editorExplicitlySet) {
        this.setEditor(this.createEditor(model));
        this.editorExplicitlySet = false;
      }
      this.repaint$();
      this.revalidate();
    }
  }
  /**
   * Returns the <code>SpinnerModel</code> that defines
   * this spinners sequence of values.
   *
   * @return the value of the model property
   * @see #setModel
   */
  getModel(): SpinnerModel {
    return this.model;
  }
  /**
   * Returns the current value of the model, typically
   * this value is displayed by the <code>editor</code>. If the
   * user has changed the value displayed by the <code>editor</code> it is
   * possible for the <code>model</code>'s value to differ from that of
   * the <code>editor</code>, refer to the class level javadoc for examples
   * of how to deal with this.
   * <p>
   * This method simply delegates to the <code>model</code>.
   * It is equivalent to:
   * <pre>
   * getModel().getValue()
   * </pre>
   *
   * @return the current value of the model
   * @see #setValue
   * @see SpinnerModel#getValue
   */
  getValue(): any {
    return this.getModel().getValue();
  }
  /**
   * Changes current value of the model, typically
   * this value is displayed by the <code>editor</code>.
   * If the <code>SpinnerModel</code> implementation
   * doesn't support the specified value then an
   * <code>IllegalArgumentException</code> is thrown.
   * <p>
   * This method simply delegates to the <code>model</code>.
   * It is equivalent to:
   * <pre>
   * getModel().setValue(value)
   * </pre>
   *
   * @param value  new value for the spinner
   * @throws IllegalArgumentException if <code>value</code> isn't allowed
   * @see #getValue
   * @see SpinnerModel#setValue
   */
  setValue(value: any): void {
    this.getModel().setValue(value);
  }
  /**
   * Returns the object in the sequence that comes after the object returned
   * by <code>getValue()</code>. If the end of the sequence has been reached
   * then return <code>null</code>.
   * Calling this method does not effect <code>value</code>.
   * <p>
   * This method simply delegates to the <code>model</code>.
   * It is equivalent to:
   * <pre>
   * getModel().getNextValue()
   * </pre>
   *
   * @return the next legal value or <code>null</code> if one doesn't exist
   * @see #getValue
   * @see #getPreviousValue
   * @see SpinnerModel#getNextValue
   */
  getNextValue(): any {
    return this.getModel().getNextValue();
  }
  /**
   * Adds a listener to the list that is notified each time a change
   * to the model occurs.  The source of <code>ChangeEvents</code>
   * delivered to <code>ChangeListeners</code> will be this
   * <code>JSpinner</code>.  Note also that replacing the model
   * will not affect listeners added directly to JSpinner.
   * Applications can add listeners to  the model directly.  In that
   * case is that the source of the event would be the
   * <code>SpinnerModel</code>.
   *
   * @param listener the <code>ChangeListener</code> to add
   * @see #removeChangeListener
   * @see #getModel
   */
  addChangeListener(listener: ChangeListener): void {
    if (this.modelListener == null) {
      this.modelListener = $J.fn(new JSpinner$ModelListener().$o(this)._JSpinner$ModelListener(), 'stateChanged');
      this.getModel().addChangeListener(this.modelListener);
    }
    this.listenerList.add($J.cls(ChangeListener), listener);
  }
  /**
   * Removes a <code>ChangeListener</code> from this spinner.
   *
   * @param listener the <code>ChangeListener</code> to remove
   * @see #fireStateChanged
   * @see #addChangeListener
   */
  removeChangeListener(listener: ChangeListener): void {
    this.listenerList.remove($J.cls(ChangeListener), listener);
  }
  /**
   * Sends a <code>ChangeEvent</code>, whose source is this
   * <code>JSpinner</code>, to each <code>ChangeListener</code>.
   * When a <code>ChangeListener</code> has been added
   * to the spinner, this method is called each time
   * a <code>ChangeEvent</code> is received from the model.
   *
   * @see #addChangeListener
   * @see #removeChangeListener
   * @see EventListenerList
   */
  fireStateChanged(): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ChangeListener)) {
        if (this.changeEvent == null) {
          this.changeEvent = new ChangeEvent()._ChangeEvent(this);
        }
        $J.fn((listeners[(i + 1) | 0]), 'stateChanged')(this.changeEvent);
      }
    }
  }
  /**
   * Returns the object in the sequence that comes
   * before the object returned by <code>getValue()</code>.
   * If the end of the sequence has been reached then
   * return <code>null</code>. Calling this method does
   * not effect <code>value</code>.
   * <p>
   * This method simply delegates to the <code>model</code>.
   * It is equivalent to:
   * <pre>
   * getModel().getPreviousValue()
   * </pre>
   *
   * @return the previous legal value or <code>null</code>
   *   if one doesn't exist
   * @see #getValue
   * @see #getNextValue
   * @see SpinnerModel#getPreviousValue
   */
  getPreviousValue(): any {
    return this.getModel().getPreviousValue();
  }
  /**
   * Changes the <code>JComponent</code> that displays the current value
   * of the <code>SpinnerModel</code>.  It is the responsibility of this
   * method to <i>disconnect</i> the old editor from the model and to
   * connect the new editor.  This may mean removing the
   * old editors <code>ChangeListener</code> from the model or the
   * spinner itself and adding one for the new editor.
   *
   * @param editor the new editor
   * @see #getEditor
   * @see #createEditor
   * @see #getModel
   * @throws IllegalArgumentException if editor is <code>null</code>
   */
  setEditor(editor: JComponent): void {
    if (editor == null) {
      throw new IllegalArgumentException('null editor');
    }
    if (!editor.equals(this.editor)) {
      let oldEditor = this.editor;
      this.editor = editor;
      if (oldEditor instanceof JSpinner$DefaultEditor) {
        (oldEditor).dismiss(this);
      }
      this.editorExplicitlySet = true;
      this.firePropertyChange$String$Object$Object('editor', oldEditor, editor);
      this.revalidate();
      this.repaint$();
    }
  }
  /**
   * Returns the component that displays and potentially
   * changes the model's value.
   *
   * @return the component that displays and potentially
   *    changes the model's value
   * @see #setEditor
   * @see #createEditor
   */
  getEditor(): JComponent {
    return this.editor;
  }
  /**
   * Commits the currently edited value to the <code>SpinnerModel</code>.
   * <p>
   * If the editor is an instance of <code>DefaultEditor</code>, the
   * call if forwarded to the editor, otherwise this does nothing.
   *
   * @throws ParseException if the currently edited value couldn't
   *         be committed.
   */
  commitEdit(): void {
    let editor = this.getEditor();
    if (editor instanceof JSpinner$DefaultEditor) {
      (editor).commitEdit();
    }
  }
  /**
   * Gets the <code>AccessibleContext</code> for the <code>JSpinner</code>
   *
   * @return the <code>AccessibleContext</code> for the <code>JSpinner</code>
   * @since 1.5
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JSpinner$AccessibleJSpinner().$o(this)._JSpinner$AccessibleJSpinner();
    }
    return this.accessibleContext;
  }
  static $clinit() {
    JSpinner.DISABLED_ACTION = new JSpinner$DisabledAction()._JSpinner$DisabledAction();
  }
}

/**
 * We pass <code>Change</code> events along to the listeners with the
 * the slider (instead of the model itself) as the event source.
 */
export class JSpinner$ModelListener extends JObject {
  _JSpinner$ModelListener(): this {
    return this;
  }
  stateChanged(e: ChangeEvent): void {
    this.$outer.fireStateChanged();
  }
}

/**
 * A simple base class for more specialized editors
 * that displays a read-only view of the model's current
 * value with a <code>JFormattedTextField</code>.  Subclasses
 * can configure the <code>JFormattedTextField</code> to create
 * an editor that's appropriate for the type of model they
 * support and they may want to override
 * the <code>stateChanged</code> and <code>propertyChanged</code>
 * methods, which keep the model and the text field in sync.
 * <p>
 * This class defines a <code>dismiss</code> method that removes the
 * editors <code>ChangeListener</code> from the <code>JSpinner</code>
 * that it's part of.   The <code>setEditor</code> method knows about
 * <code>DefaultEditor.dismiss</code>, so if the developer
 * replaces an editor that's derived from <code>JSpinner.DefaultEditor</code>
 * its <code>ChangeListener</code> connection back to the
 * <code>JSpinner</code> will be removed.  However after that,
 * it's up to the developer to manage their editor listeners.
 * Similarly, if a subclass overrides <code>createEditor</code>,
 * it's up to the subclasser to deal with their editor
 * subsequently being replaced (with <code>setEditor</code>).
 * We expect that in most cases, and in editor installed
 * with <code>setEditor</code> or created by a <code>createEditor</code>
 * override, will not be replaced anyway.
 * <p>
 * This class is the <code>LayoutManager</code> for it's single
 * <code>JFormattedTextField</code> child.   By default the
 * child is just centered with the parents insets.
 * @since 1.4
 */
export class JSpinner$DefaultEditor extends JPanel {
  /**
   * Constructs an editor component for the specified <code>JSpinner</code>.
   * This <code>DefaultEditor</code> is it's own layout manager and
   * it is added to the spinner's <code>ChangeListener</code> list.
   * The constructor creates a single <code>JFormattedTextField</code> child,
   * initializes it's value to be the spinner model's current value
   * and adds it to <code>this</code> <code>DefaultEditor</code>.
   *
   * @param spinner the spinner whose model <code>this</code> editor will monitor
   * @see #getTextField
   * @see JSpinner#addChangeListener
   */
  _JSpinner$DefaultEditor(spinner: JSpinner): this {
    this._JPanel$LayoutManager(null);
    let ftf = new JFormattedTextField()._JFormattedTextField$();
    ftf.setName('Spinner.formattedTextField');
    ftf.setValue$Object(spinner.getValue());
    ftf.addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
    ftf.setEditable(false);
    ftf.setInheritsPopupMenu(true);
    let toolTipText = spinner.getToolTipText$();
    if (toolTipText != null) {
      ftf.setToolTipText(toolTipText);
    }
    this.add$Component(ftf);
    this.setLayout(this);
    spinner.addChangeListener($J.fn(this, 'stateChanged'));
    let ftfMap = ftf.getActionMap$();
    if (ftfMap != null) {
      ftfMap.put$Object$Action('increment', JSpinner.DISABLED_ACTION);
      ftfMap.put$Object$Action('decrement', JSpinner.DISABLED_ACTION);
    }
    return this;
  }
  /**
   * Disconnect <code>this</code> editor from the specified
   * <code>JSpinner</code>.  By default, this method removes
   * itself from the spinners <code>ChangeListener</code> list.
   *
   * @param spinner the <code>JSpinner</code> to disconnect this
   *    editor from; the same spinner as was passed to the constructor.
   */
  dismiss(spinner: JSpinner): void {
    spinner.removeChangeListener($J.fn(this, 'stateChanged'));
  }
  /**
   * Returns the <code>JSpinner</code> ancestor of this editor or
   * <code>null</code> if none of the ancestors are a
   * <code>JSpinner</code>.
   * Typically the editor's parent is a <code>JSpinner</code> however
   * subclasses of <code>JSpinner</code> may override the
   * the <code>createEditor</code> method and insert one or more containers
   * between the <code>JSpinner</code> and it's editor.
   *
   * @return <code>JSpinner</code> ancestor; <code>null</code>
   *         if none of the ancestors are a <code>JSpinner</code>
   *
   * @see JSpinner#createEditor
   */
  getSpinner(): JSpinner {
    for (let c = this; c != null; c = c.getParent()) {
      if (c instanceof JSpinner) {
        return c;
      }
    }
    return null;
  }
  /**
   * Returns the <code>JFormattedTextField</code> child of this
   * editor.  By default the text field is the first and only
   * child of editor.
   *
   * @return the <code>JFormattedTextField</code> that gives the user
   *     access to the <code>SpinnerDateModel's</code> value.
   * @see #getSpinner
   * @see #getModel
   */
  getTextField(): JFormattedTextField {
    return this.getComponent$int(0);
  }
  /**
   * This method is called when the spinner's model's state changes.
   * It sets the <code>value</code> of the text field to the current
   * value of the spinners model.
   *
   * @param e the <code>ChangeEvent</code> whose source is the
   * <code>JSpinner</code> whose model has changed.
   * @see #getTextField
   * @see JSpinner#getValue
   */
  stateChanged(e: ChangeEvent): void {
    let spinner = (e.getSource());
    this.getTextField().setValue$Object(spinner.getValue());
  }
  /**
   * Called by the <code>JFormattedTextField</code>
   * <code>PropertyChangeListener</code>.  When the <code>"value"</code>
   * property changes, which implies that the user has typed a new
   * number, we set the value of the spinners model.
   * <p>
   * This class ignores <code>PropertyChangeEvents</code> whose
   * source is not the <code>JFormattedTextField</code>, so subclasses
   * may safely make <code>this</code> <code>DefaultEditor</code> a
   * <code>PropertyChangeListener</code> on other objects.
   *
   * @param e the <code>PropertyChangeEvent</code> whose source is
   *    the <code>JFormattedTextField</code> created by this class.
   * @see #getTextField
   */
  propertyChange(e: PropertyChangeEvent): void {
    let spinner = this.getSpinner();
    if (spinner == null) {
      return;
    }
    let source = e.getSource();
    let name = e.getPropertyName();
    if (source instanceof JFormattedTextField) {
      if ($J.equals('value', name)) {
        let lastValue = spinner.getValue();
        try {
          spinner.setValue(this.getTextField().getValue());
        } catch ($e0) {
          if ($J.isa($e0, IllegalArgumentException)) {
            let iae = $J.exc($e0);
            try {
              (source).setValue$Object(lastValue);
            } catch ($e1) {
              if ($J.isa($e1, IllegalArgumentException)) {
                let iae2 = $J.exc($e1);
              } else {
                throw $e1;
              }
            }
          } else {
            throw $e0;
          }
        }
      } else if ($J.equals('font', name)) {
        let newfont = e.getNewValue();
        if ($J.isa(newfont, UIResource)) {
          let font = spinner.getFont();
          if (!$J.equals(newfont, font)) {
            this.getTextField().setFont(font == null ? null : new FontUIResource()._FontUIResource$Font(font));
          }
        }
      }
    }
  }
  /**
   * This <code>LayoutManager</code> method does nothing.  We're
   * only managing a single child and there's no support
   * for layout constraints.
   *
   * @param name ignored
   * @param child ignored
   */
  addLayoutComponent$String$Component(name: string, child: Component): void {
  }
  /**
   * This <code>LayoutManager</code> method does nothing.  There
   * isn't any per-child state.
   *
   * @param child ignored
   */
  removeLayoutComponent(child: Component): void {
  }
  /**
   * Returns the size of the parents insets.
   */
  insetSize(parent: Container): Dimension {
    let insets = parent.getInsets$();
    let w = (insets.left + insets.right) | 0;
    let h = (insets.top + insets.bottom) | 0;
    return new Dimension()._Dimension$int$int(w, h);
  }
  /**
   * Returns the preferred size of first (and only) child plus the
   * size of the parents insets.
   *
   * @param parent the Container that's managing the layout
   * @return the preferred dimensions to lay out the subcomponents
   *          of the specified container.
   */
  preferredLayoutSize(parent: Container): Dimension {
    let preferredSize = this.insetSize(parent);
    if (parent.getComponentCount() > 0) {
      let childSize = this.getComponent$int(0).getPreferredSize$();
      preferredSize.width_ = (preferredSize.width_ + childSize.width_) | 0;
      preferredSize.height_ = (preferredSize.height_ + childSize.height_) | 0;
    }
    return preferredSize;
  }
  /**
   * Returns the minimum size of first (and only) child plus the
   * size of the parents insets.
   *
   * @param parent the Container that's managing the layout
   * @return  the minimum dimensions needed to lay out the subcomponents
   *          of the specified container.
   */
  minimumLayoutSize(parent: Container): Dimension {
    let minimumSize = this.insetSize(parent);
    if (parent.getComponentCount() > 0) {
      let childSize = this.getComponent$int(0).getMinimumSize$();
      minimumSize.width_ = (minimumSize.width_ + childSize.width_) | 0;
      minimumSize.height_ = (minimumSize.height_ + childSize.height_) | 0;
    }
    return minimumSize;
  }
  /**
   * Resize the one (and only) child to completely fill the area
   * within the parents insets.
   */
  layoutContainer$Container(parent: Container): void {
    if (parent.getComponentCount() > 0) {
      let insets = parent.getInsets$();
      let w = (parent.getWidth() - (insets.left + insets.right)) | 0;
      let h = (parent.getHeight() - (insets.top + insets.bottom)) | 0;
      this.getComponent$int(0).setBounds$int$int$int$int(insets.left, insets.top, w, h);
    }
  }
  /**
   * Pushes the currently edited value to the <code>SpinnerModel</code>.
   * <p>
   * The default implementation invokes <code>commitEdit</code> on the
   * <code>JFormattedTextField</code>.
   *
   * @throws ParseException if the edited value is not legal
   */
  commitEdit(): void {
    let ftf = this.getTextField();
    ftf.commitEdit();
  }
  /**
   * Returns the baseline.
   *
   * @throws IllegalArgumentException {@inheritDoc}
   * @see javax.swing.JComponent#getBaseline(int,int)
   * @see javax.swing.JComponent#getBaselineResizeBehavior()
   * @since 1.6
   */
  getBaseline(width: number, height: number): number {
    super.getBaseline(width, height);
    let insets = this.getInsets$();
    width = (width - insets.left - insets.right) | 0;
    height = (height - insets.top - insets.bottom) | 0;
    let baseline = this.getComponent$int(0).getBaseline(width, height);
    if (baseline >= 0) {
      return (baseline + insets.top) | 0;
    }
    return -1;
  }
  /**
   * Returns an enum indicating how the baseline of the component
   * changes as the size changes.
   *
   * @see javax.swing.JComponent#getBaseline(int, int)
   * @since 1.6
   */
  getBaselineResizeBehavior(): Component$BaselineResizeBehavior {
    return this.getComponent$int(0).getBaselineResizeBehavior();
  }
}

/**
 * This subclass of javax.swing.DateFormatter maps the minimum/maximum
 * properties to the start/end properties of a SpinnerDateModel.
 */
export class JSpinner$DateEditorFormatter extends DateFormatter {
  model: SpinnerDateModel = null;
  _JSpinner$DateEditorFormatter(model: SpinnerDateModel, format: DateFormat): this {
    this._DateFormatter$DateFormat(format);
    this.model = model;
    return this;
  }
  getMinimum(): Comparable<JDate> {
    return this.model.getStart();
  }
  getMaximum(): Comparable<JDate> {
    return this.model.getEnd();
  }
}

/**
 * An editor for a <code>JSpinner</code> whose model is a
 * <code>SpinnerDateModel</code>.  The value of the editor is
 * displayed with a <code>JFormattedTextField</code> whose format
 * is defined by a <code>DateFormatter</code> instance whose
 * <code>minimum</code> and <code>maximum</code> properties
 * are mapped to the <code>SpinnerDateModel</code>.
 * @since 1.4
 */
export class JSpinner$DateEditor extends JSpinner$DefaultEditor {
  /**
   * Construct a <code>JSpinner</code> editor that supports displaying
   * and editing the value of a <code>SpinnerDateModel</code>
   * with a <code>JFormattedTextField</code>.  <code>This</code>
   * <code>DateEditor</code> becomes both a <code>ChangeListener</code>
   * on the spinner and a <code>PropertyChangeListener</code>
   * on the new <code>JFormattedTextField</code>.
   *
   * @param spinner the spinner whose model <code>this</code> editor will monitor
   * @throws IllegalArgumentException if the spinners model is not
   *     an instance of <code>SpinnerDateModel</code>
   *
   * @see #getModel
   * @see #getFormat
   * @see SpinnerDateModel
   */
  _JSpinner$DateEditor$JSpinner(spinner: JSpinner): this {
    this._JSpinner$DateEditor$JSpinner$String(spinner, JSpinner$DateEditor.getDefaultPattern(spinner.getLocale$()));
    return this;
  }
  /**
   * Construct a <code>JSpinner</code> editor that supports displaying
   * and editing the value of a <code>SpinnerDateModel</code>
   * with a <code>JFormattedTextField</code>.  <code>This</code>
   * <code>DateEditor</code> becomes both a <code>ChangeListener</code>
   * on the spinner and a <code>PropertyChangeListener</code>
   * on the new <code>JFormattedTextField</code>.
   *
   * @param spinner the spinner whose model <code>this</code> editor will monitor
   * @param dateFormatPattern the initial pattern for the
   *     <code>SimpleDateFormat</code> object that's used to display
   *     and parse the value of the text field.
   * @throws IllegalArgumentException if the spinners model is not
   *     an instance of <code>SpinnerDateModel</code>
   *
   * @see #getModel
   * @see #getFormat
   * @see SpinnerDateModel
   * @see java.text.SimpleDateFormat
   */
  _JSpinner$DateEditor$JSpinner$String(spinner: JSpinner, dateFormatPattern: string): this {
    this._JSpinner$DateEditor$JSpinner$DateFormat(spinner, new SimpleDateFormat(dateFormatPattern, spinner.getLocale$()));
    return this;
  }
  /**
   * Construct a <code>JSpinner</code> editor that supports displaying
   * and editing the value of a <code>SpinnerDateModel</code>
   * with a <code>JFormattedTextField</code>.  <code>This</code>
   * <code>DateEditor</code> becomes both a <code>ChangeListener</code>
   * on the spinner and a <code>PropertyChangeListener</code>
   * on the new <code>JFormattedTextField</code>.
   *
   * @param spinner the spinner whose model <code>this</code> editor
   *        will monitor
   * @param format <code>DateFormat</code> object that's used to display
   *     and parse the value of the text field.
   * @throws IllegalArgumentException if the spinners model is not
   *     an instance of <code>SpinnerDateModel</code>
   *
   * @see #getModel
   * @see #getFormat
   * @see SpinnerDateModel
   * @see java.text.SimpleDateFormat
   */
  _JSpinner$DateEditor$JSpinner$DateFormat(spinner: JSpinner, format: DateFormat): this {
    this._JSpinner$DefaultEditor(spinner);
    if (!(spinner.getModel() instanceof SpinnerDateModel)) {
      throw new IllegalArgumentException('model not a SpinnerDateModel');
    }
    let model = spinner.getModel();
    let formatter = new JSpinner$DateEditorFormatter()._JSpinner$DateEditorFormatter(model, format);
    let factory = new DefaultFormatterFactory()._DefaultFormatterFactory$AbstractFormatter(formatter);
    let ftf = this.getTextField();
    ftf.setEditable(true);
    ftf.setFormatterFactory(factory);
    try {
      let maxString = formatter.valueToString(model.getStart());
      let minString = formatter.valueToString(model.getEnd());
      ftf.setColumns(Math.max(maxString.length, minString.length));
    } catch ($e2) {
      if ($J.isa($e2, ParseException)) {
        let e = $J.exc($e2);
      } else {
        throw $e2;
      }
    }
    return this;
  }
  static getDefaultPattern(loc: Locale): string {
    let adapter = LocaleProviderAdapter.getAdapter($J.cls(DateFormatProvider), loc);
    let lr = adapter.getLocaleResources(loc);
    if (lr == null) {
      lr = LocaleProviderAdapter.forJRE().getLocaleResources(loc);
    }
    return lr.getDateTimePattern(3, 3, null);
  }
  /**
   * Returns the <code>java.text.SimpleDateFormat</code> object the
   * <code>JFormattedTextField</code> uses to parse and format
   * numbers.
   *
   * @return the value of <code>getTextField().getFormatter().getFormat()</code>.
   * @see #getTextField
   * @see java.text.SimpleDateFormat
   */
  getFormat(): SimpleDateFormat {
    return ((this.getTextField().getFormatter())).getFormat();
  }
  /**
   * Return our spinner ancestor's <code>SpinnerDateModel</code>.
   *
   * @return <code>getSpinner().getModel()</code>
   * @see #getSpinner
   * @see #getTextField
   */
  getModel(): SpinnerDateModel {
    return (this.getSpinner().getModel());
  }
}

/**
 * This subclass of javax.swing.NumberFormatter maps the minimum/maximum
 * properties to a SpinnerNumberModel and initializes the valueClass
 * of the NumberFormatter to match the type of the initial models value.
 */
export class JSpinner$NumberEditorFormatter extends NumberFormatter {
  model: SpinnerNumberModel = null;
  _JSpinner$NumberEditorFormatter(model: SpinnerNumberModel, format: NumberFormat): this {
    this._NumberFormatter$NumberFormat(format);
    this.model = model;
    this.setValueClass($J.getClass(model.getValue()));
    return this;
  }
  getMinimum(): Comparable<any> {
    return this.model.getMinimum();
  }
  getMaximum(): Comparable<any> {
    return this.model.getMaximum();
  }
}

/**
 * An editor for a <code>JSpinner</code> whose model is a
 * <code>SpinnerNumberModel</code>.  The value of the editor is
 * displayed with a <code>JFormattedTextField</code> whose format
 * is defined by a <code>NumberFormatter</code> instance whose
 * <code>minimum</code> and <code>maximum</code> properties
 * are mapped to the <code>SpinnerNumberModel</code>.
 * @since 1.4
 */
export class JSpinner$NumberEditor extends JSpinner$DefaultEditor {
  /**
   * Construct a <code>JSpinner</code> editor that supports displaying
   * and editing the value of a <code>SpinnerNumberModel</code>
   * with a <code>JFormattedTextField</code>.  <code>This</code>
   * <code>NumberEditor</code> becomes both a <code>ChangeListener</code>
   * on the spinner and a <code>PropertyChangeListener</code>
   * on the new <code>JFormattedTextField</code>.
   *
   * @param spinner the spinner whose model <code>this</code> editor will monitor
   * @throws IllegalArgumentException if the spinners model is not
   *     an instance of <code>SpinnerNumberModel</code>
   *
   * @see #getModel
   * @see #getFormat
   * @see SpinnerNumberModel
   */
  _JSpinner$NumberEditor$JSpinner(spinner: JSpinner): this {
    this._JSpinner$NumberEditor$JSpinner$String(spinner, JSpinner$NumberEditor.getDefaultPattern(spinner.getLocale$()));
    return this;
  }
  /**
   * Construct a <code>JSpinner</code> editor that supports displaying
   * and editing the value of a <code>SpinnerNumberModel</code>
   * with a <code>JFormattedTextField</code>.  <code>This</code>
   * <code>NumberEditor</code> becomes both a <code>ChangeListener</code>
   * on the spinner and a <code>PropertyChangeListener</code>
   * on the new <code>JFormattedTextField</code>.
   *
   * @param spinner the spinner whose model <code>this</code> editor will monitor
   * @param decimalFormatPattern the initial pattern for the
   *     <code>DecimalFormat</code> object that's used to display
   *     and parse the value of the text field.
   * @throws IllegalArgumentException if the spinners model is not
   *     an instance of <code>SpinnerNumberModel</code> or if
   *     <code>decimalFormatPattern</code> is not a legal
   *     argument to <code>DecimalFormat</code>
   *
   * @see #getTextField
   * @see SpinnerNumberModel
   * @see java.text.DecimalFormat
   */
  _JSpinner$NumberEditor$JSpinner$String(spinner: JSpinner, decimalFormatPattern: string): this {
    this._JSpinner$NumberEditor$JSpinner$DecimalFormat(spinner, new DecimalFormat(decimalFormatPattern));
    return this;
  }
  /**
   * Construct a <code>JSpinner</code> editor that supports displaying
   * and editing the value of a <code>SpinnerNumberModel</code>
   * with a <code>JFormattedTextField</code>.  <code>This</code>
   * <code>NumberEditor</code> becomes both a <code>ChangeListener</code>
   * on the spinner and a <code>PropertyChangeListener</code>
   * on the new <code>JFormattedTextField</code>.
   *
   * @param spinner the spinner whose model <code>this</code> editor will monitor
   * @param format the initial pattern for the
   *     <code>DecimalFormat</code> object that's used to display
   *     and parse the value of the text field.
   * @throws IllegalArgumentException if the spinners model is not
   *     an instance of <code>SpinnerNumberModel</code>
   *
   * @see #getTextField
   * @see SpinnerNumberModel
   * @see java.text.DecimalFormat
   */
  _JSpinner$NumberEditor$JSpinner$DecimalFormat(spinner: JSpinner, format: DecimalFormat): this {
    this._JSpinner$DefaultEditor(spinner);
    if (!(spinner.getModel() instanceof SpinnerNumberModel)) {
      throw new IllegalArgumentException('model not a SpinnerNumberModel');
    }
    let model = spinner.getModel();
    let formatter = new JSpinner$NumberEditorFormatter()._JSpinner$NumberEditorFormatter(model, format);
    let factory = new DefaultFormatterFactory()._DefaultFormatterFactory$AbstractFormatter(formatter);
    let ftf = this.getTextField();
    ftf.setEditable(true);
    ftf.setFormatterFactory(factory);
    ftf.setHorizontalAlignment(SwingConstants.RIGHT);
    try {
      let maxString = formatter.valueToString(model.getMinimum());
      let minString = formatter.valueToString(model.getMaximum());
      ftf.setColumns(Math.max(maxString.length, minString.length));
    } catch ($e3) {
      if ($J.isa($e3, ParseException)) {
        let e = $J.exc($e3);
      } else {
        throw $e3;
      }
    }
    return this;
  }
  static getDefaultPattern(locale: Locale): string {
    let adapter: LocaleProviderAdapter;
    adapter = LocaleProviderAdapter.getAdapter($J.cls(NumberFormatProvider), locale);
    let lr = adapter.getLocaleResources(locale);
    if (lr == null) {
      lr = LocaleProviderAdapter.forJRE().getLocaleResources(locale);
    }
    let all = lr.getNumberPatterns();
    return all[0];
  }
  /**
   * {@inheritDoc}
   */
  setComponentOrientation(o: ComponentOrientation): void {
    super.setComponentOrientation(o);
    this.getTextField().setHorizontalAlignment(o.isLeftToRight() ? SwingConstants.RIGHT : SwingConstants.LEFT);
  }
}

/**
 * An editor for a <code>JSpinner</code> whose model is a
 * <code>SpinnerListModel</code>.
 * @since 1.4
 */
export class JSpinner$ListEditor extends JSpinner$DefaultEditor {
  /**
   * Construct a <code>JSpinner</code> editor that supports displaying
   * and editing the value of a <code>SpinnerListModel</code>
   * with a <code>JFormattedTextField</code>.  <code>This</code>
   * <code>ListEditor</code> becomes both a <code>ChangeListener</code>
   * on the spinner and a <code>PropertyChangeListener</code>
   * on the new <code>JFormattedTextField</code>.
   *
   * @param spinner the spinner whose model <code>this</code> editor will monitor
   * @throws IllegalArgumentException if the spinners model is not
   *     an instance of <code>SpinnerListModel</code>
   *
   * @see #getModel
   * @see SpinnerListModel
   */
  _JSpinner$ListEditor(spinner: JSpinner): this {
    this._JSpinner$DefaultEditor(spinner);
    if (!(spinner.getModel() instanceof SpinnerListModel)) {
      throw new IllegalArgumentException('model not a SpinnerListModel');
    }
    this.getTextField().setEditable(true);
    this.getTextField().setFormatterFactory(new DefaultFormatterFactory()._DefaultFormatterFactory$AbstractFormatter(new JSpinner$ListEditor$ListFormatter().$o(this)._JSpinner$ListEditor$ListFormatter()));
    return this;
  }
  /**
   * Return our spinner ancestor's <code>SpinnerNumberModel</code>.
   *
   * @return <code>getSpinner().getModel()</code>
   * @see #getSpinner
   * @see #getTextField
   */
  getModel(): SpinnerListModel {
    return (this.getSpinner().getModel());
  }
}

/**
 * ListFormatter provides completion while text is being input
 * into the JFormattedTextField. Completion is only done if the
 * user is inserting text at the end of the document. Completion
 * is done by way of the SpinnerListModel method findNextMatch.
 */
export class JSpinner$ListEditor$ListFormatter extends JFormattedTextField$AbstractFormatter {
  filter_: DocumentFilter = null;
  _JSpinner$ListEditor$ListFormatter(): this {
    this._JFormattedTextField$AbstractFormatter();
    return this;
  }
  valueToString(value: any): string {
    if (value == null) {
      return '';
    }
    return $J.str(value);
  }
  stringToValue$String(string$: string): any {
    return string$;
  }
  getDocumentFilter(): DocumentFilter {
    if (this.filter_ == null) {
      this.filter_ = new JSpinner$ListEditor$ListFormatter$Filter().$o(this)._JSpinner$ListEditor$ListFormatter$Filter();
    }
    return this.filter_;
  }
}

export class JSpinner$ListEditor$ListFormatter$Filter extends DocumentFilter {
  _JSpinner$ListEditor$ListFormatter$Filter(): this {
    this._DocumentFilter();
    return this;
  }
  replace(fb: DocumentFilter$FilterBypass, offset: number, length: number, string$: string, attrs: AttributeSet): void {
    if (string$ != null && ((offset + length) | 0) === fb.getDocument().getLength()) {
      let next = this.$outer.$outer.getModel().findNextMatch(fb.getDocument().getText$int$int(0, offset) + string$);
      let value = (next != null) ? $J.str(next) : null;
      if (value != null) {
        fb.remove(0, (offset + length) | 0);
        fb.insertString(0, value, null);
        this.$outer.getFormattedTextField().select((offset + string$.length) | 0, value.length);
        return;
      }
    }
    super.replace(fb, offset, length, string$, attrs);
  }
  insertString(fb: DocumentFilter$FilterBypass, offset: number, string$: string, attr: AttributeSet): void {
    this.replace(fb, offset, 0, string$, attr);
  }
}

/**
 * An Action implementation that is always disabled.
 */
export class JSpinner$DisabledAction extends JObject {
  _JSpinner$DisabledAction(): this {
    return this;
  }
  getValue$String(key: string): any {
    return null;
  }
  putValue(key: string, value: any): void {
  }
  setEnabled(b: boolean): void {
  }
  isEnabled(): boolean {
    return false;
  }
  addPropertyChangeListener(l: PropertyChangeListener): void {
  }
  removePropertyChangeListener(l: PropertyChangeListener): void {
  }
  actionPerformed(ae: ActionEvent): void {
  }
}

/**
 * <code>AccessibleJSpinner</code> implements accessibility
 * support for the <code>JSpinner</code> class.
 * @since 1.5
 */
export class JSpinner$AccessibleJSpinner extends JComponent$AccessibleJComponent {
  oldModelValue: any = null;
  /**
   * AccessibleJSpinner constructor
   */
  _JSpinner$AccessibleJSpinner(): this {
    this._JComponent$AccessibleJComponent();
    this.oldModelValue = null;
    this.oldModelValue = this.$outer.model.getValue();
    this.$outer.addChangeListener($J.fn(this, 'stateChanged'));
    return this;
  }
  /**
   * Invoked when the target of the listener has changed its state.
   *
   * @param e  a <code>ChangeEvent</code> object. Must not be null.
   * @throws NullPointerException if the parameter is null.
   */
  stateChanged(e: ChangeEvent): void {
    if (e == null) {
      throw new NullPointerException();
    }
    let newModelValue = this.$outer.model.getValue();
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_VALUE_PROPERTY, this.oldModelValue, newModelValue);
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_TEXT_PROPERTY, null, 0);
    this.oldModelValue = newModelValue;
  }
  /**
   * Returns the number of accessible children of the object.
   *
   * @return the number of accessible children of the object.
   */
  getAccessibleChildrenCount(): number {
    if (this.$outer.editor.getAccessibleContext() != null) {
      return 1;
    }
    return 0;
  }
  /**
   * Returns the specified Accessible child of the object.  The Accessible
   * children of an Accessible object are zero-based, so the first child
   * of an Accessible child is at index 0, the second child is at index 1,
   * and so on.
   *
   * @param i zero-based index of child
   * @return the Accessible child of the object
   * @see #getAccessibleChildrenCount
   */
  getAccessibleChild(i: number): Accessible {
    if (i !== 0) {
      return null;
    }
    if (this.$outer.editor.getAccessibleContext() != null) {
      return this.$outer.editor;
    }
    return null;
  }
}

$J.define(JSpinner, 'javax.swing.JSpinner', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { '': '_JSpinner$', 'javax.swing.SpinnerModel': '_JSpinner$SpinnerModel' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JSpinner', 'setUI(javax.swing.plaf.SpinnerUI)': 'setUI$SpinnerUI' }, clinit: true, lazy: ['DISABLED_ACTION'] });
$J.define(JSpinner$ModelListener, 'javax.swing.JSpinner$ModelListener', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_JSpinner$ModelListener' }, inner: true });
$J.define(JSpinner$DefaultEditor, 'javax.swing.JSpinner$DefaultEditor', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener', 'java.beans.PropertyChangeListener', 'java.awt.LayoutManager'], sup: 'javax.swing.JPanel', ctors: { 'javax.swing.JSpinner': '_JSpinner$DefaultEditor' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' } });
$J.define(JSpinner$DateEditorFormatter, 'javax.swing.JSpinner$DateEditorFormatter', { kind: 'class', sup: 'javax.swing.text.DateFormatter', ctors: { 'javax.swing.SpinnerDateModel,java.text.DateFormat': '_JSpinner$DateEditorFormatter' } });
$J.define(JSpinner$DateEditor, 'javax.swing.JSpinner$DateEditor', { kind: 'class', sup: 'javax.swing.JSpinner$DefaultEditor', ctors: { 'javax.swing.JSpinner,java.text.DateFormat': '_JSpinner$DateEditor$JSpinner$DateFormat', 'javax.swing.JSpinner,java.lang.String': '_JSpinner$DateEditor$JSpinner$String', 'javax.swing.JSpinner': '_JSpinner$DateEditor$JSpinner' } });
$J.define(JSpinner$NumberEditorFormatter, 'javax.swing.JSpinner$NumberEditorFormatter', { kind: 'class', sup: 'javax.swing.text.NumberFormatter', ctors: { 'javax.swing.SpinnerNumberModel,java.text.NumberFormat': '_JSpinner$NumberEditorFormatter' } });
$J.define(JSpinner$NumberEditor, 'javax.swing.JSpinner$NumberEditor', { kind: 'class', sup: 'javax.swing.JSpinner$DefaultEditor', ctors: { 'javax.swing.JSpinner,java.text.DecimalFormat': '_JSpinner$NumberEditor$JSpinner$DecimalFormat', 'javax.swing.JSpinner,java.lang.String': '_JSpinner$NumberEditor$JSpinner$String', 'javax.swing.JSpinner': '_JSpinner$NumberEditor$JSpinner' } });
$J.define(JSpinner$ListEditor, 'javax.swing.JSpinner$ListEditor', { kind: 'class', sup: 'javax.swing.JSpinner$DefaultEditor', ctors: { 'javax.swing.JSpinner': '_JSpinner$ListEditor' } });
$J.define(JSpinner$ListEditor$ListFormatter, 'javax.swing.JSpinner$ListEditor$ListFormatter', { kind: 'class', sup: 'javax.swing.JFormattedTextField$AbstractFormatter', ctors: { '': '_JSpinner$ListEditor$ListFormatter' }, meths: { 'stringToValue(java.lang.String)': 'stringToValue$String' }, inner: true });
$J.define(JSpinner$ListEditor$ListFormatter$Filter, 'javax.swing.JSpinner$ListEditor$ListFormatter$Filter', { kind: 'class', sup: 'javax.swing.text.DocumentFilter', ctors: { '': '_JSpinner$ListEditor$ListFormatter$Filter' }, inner: true });
$J.define(JSpinner$DisabledAction, 'javax.swing.JSpinner$DisabledAction', { kind: 'class', ifaces: ['javax.swing.Action'], sup: 'java.lang.Object', ctors: { '': '_JSpinner$DisabledAction' }, meths: { 'getValue(java.lang.String)': 'getValue$String' } });
$J.define(JSpinner$AccessibleJSpinner, 'javax.swing.JSpinner$AccessibleJSpinner', { kind: 'class', ifaces: ['javax.accessibility.AccessibleValue', 'javax.accessibility.AccessibleAction', 'javax.accessibility.AccessibleText', 'javax.accessibility.AccessibleEditableText', 'javax.swing.event.ChangeListener'], sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JSpinner$AccessibleJSpinner' }, meths: { 'getAtIndex(int,int)': 'getAtIndex$int$int', 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  AccessibleContext = $J.load('javax.accessibility.AccessibleContext');
  JFormattedTextField = $J.load('javax.swing.JFormattedTextField');
  SpinnerDateModel = $J.load('javax.swing.SpinnerDateModel');
  SpinnerListModel = $J.load('javax.swing.SpinnerListModel');
  SpinnerNumberModel = $J.load('javax.swing.SpinnerNumberModel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  UIManager = $J.load('javax.swing.UIManager');
  ChangeEvent = $J.load('javax.swing.event.ChangeEvent');
  ChangeListener = $J.load('javax.swing.event.ChangeListener');
  FontUIResource = $J.load('javax.swing.plaf.FontUIResource');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  DefaultFormatterFactory = $J.load('javax.swing.text.DefaultFormatterFactory');
});
