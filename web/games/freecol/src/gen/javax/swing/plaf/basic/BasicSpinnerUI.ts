// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicSpinnerUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, DateFormat_Field, IllegalArgumentException, JObject, ParseException } from '../../../../../jre/index.ts';
import { SpinnerUI } from '../SpinnerUI.ts';
import { AbstractAction } from '../../AbstractAction.ts';

let Component, Container, Dimension, KeyboardFocusManager, FocusEvent$Cause, JButton, JComponent, JPanel, JSpinner, JSpinner$DateEditor, JSpinner$DefaultEditor, LookAndFeel, SwingConstants, SwingUtilities, Timer, UIManager, CompoundBorder, FontUIResource, UIResource, BasicArrowButton, LazyActionMap, InternationalFormatter, DefaultLookup;

/**
 * The default Spinner UI delegate.
 *
 * @author Hans Muller
 * @since 1.4
 */
export class BasicSpinnerUI extends SpinnerUI {
  /**
   * The spinner that we're a UI delegate for.  Initialized by
   * the <code>installUI</code> method, and reset to null
   * by <code>uninstallUI</code>.
   *
   * @see #installUI
   * @see #uninstallUI
   */
  spinner: JSpinner = null;
  handler: BasicSpinnerUI$Handler = null;
  /**
   * The mouse/action listeners that are added to the spinner's
   * arrow buttons.  These listeners are shared by all
   * spinner arrow buttons.
   *
   * @see #createNextButton
   * @see #createPreviousButton
   */
  static nextButtonHandler: BasicSpinnerUI$ArrowButtonHandler = null;
  static previousButtonHandler: BasicSpinnerUI$ArrowButtonHandler = null;
  propertyChangeListener: PropertyChangeListener = null;
  /**
   * Used by the default LayoutManager class - SpinnerLayout for
   * missing (null) editor/nextButton/previousButton children.
   */
  static zeroSize: Dimension = null;
  /**
   * Constructs a {@code BasicSpinnerUI}.
   */
  _BasicSpinnerUI(): this {
    this._SpinnerUI();
    return this;
  }
  /**
   * Returns a new instance of BasicSpinnerUI.  SpinnerListUI
   * delegates are allocated one per JSpinner.
   *
   * @param c the JSpinner (not used)
   * @see ComponentUI#createUI
   * @return a new BasicSpinnerUI object
   */
  static createUI(c: JComponent): ComponentUI {
    return new BasicSpinnerUI()._BasicSpinnerUI();
  }
  maybeAdd(c: Component, s: string): void {
    if (c != null) {
      this.spinner.add$Component$Object(c, s);
    }
  }
  /**
   * Calls <code>installDefaults</code>, <code>installListeners</code>,
   * and then adds the components returned by <code>createNextButton</code>,
   * <code>createPreviousButton</code>, and <code>createEditor</code>.
   *
   * @param c the JSpinner
   * @see #installDefaults
   * @see #installListeners
   * @see #createNextButton
   * @see #createPreviousButton
   * @see #createEditor
   */
  installUI(c: JComponent): void {
    this.spinner = c;
    this.installDefaults();
    this.installListeners();
    this.maybeAdd(this.createNextButton(), 'Next');
    this.maybeAdd(this.createPreviousButton(), 'Previous');
    this.maybeAdd(this.createEditor(), 'Editor');
    this.updateEnabledState$$BasicSpinnerUI();
    this.installKeyboardActions();
  }
  /**
   * Calls <code>uninstallDefaults</code>, <code>uninstallListeners</code>,
   * and then removes all of the spinners children.
   *
   * @param c the JSpinner (not used)
   */
  uninstallUI(c: JComponent): void {
    this.uninstallDefaults();
    this.uninstallListeners();
    this.spinner = null;
    c.removeAll();
  }
  /**
   * Initializes <code>PropertyChangeListener</code> with
   * a shared object that delegates interesting PropertyChangeEvents
   * to protected methods.
   * <p>
   * This method is called by <code>installUI</code>.
   *
   * @see #replaceEditor
   * @see #uninstallListeners
   */
  installListeners(): void {
    this.propertyChangeListener = this.createPropertyChangeListener();
    this.spinner.addPropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    if (DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(this.spinner, this, 'Spinner.disableOnBoundaryValues', false)) {
      this.spinner.addChangeListener($J.fn(this.getHandler(), 'stateChanged'));
    }
    let editor = this.spinner.getEditor();
    var defaultEditor;
    if ((defaultEditor = editor) instanceof JSpinner$DefaultEditor) {
      let tf = defaultEditor.getTextField();
      if (tf != null) {
        tf.addFocusListener(BasicSpinnerUI.nextButtonHandler);
        tf.addFocusListener(BasicSpinnerUI.previousButtonHandler);
      }
    }
  }
  /**
   * Removes the <code>PropertyChangeListener</code> added
   * by installListeners.
   * <p>
   * This method is called by <code>uninstallUI</code>.
   *
   * @see #installListeners
   */
  uninstallListeners(): void {
    this.spinner.removePropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    this.spinner.removeChangeListener($J.fn(this.handler, 'stateChanged'));
    let editor = this.spinner.getEditor();
    this.removeEditorBorderListener(editor);
    if (editor instanceof JSpinner$DefaultEditor) {
      let tf = (editor).getTextField();
      if (tf != null) {
        tf.removeFocusListener(BasicSpinnerUI.nextButtonHandler);
        tf.removeFocusListener(BasicSpinnerUI.previousButtonHandler);
      }
    }
    this.propertyChangeListener = null;
    this.handler = null;
  }
  /**
   * Initialize the <code>JSpinner</code> <code>border</code>,
   * <code>foreground</code>, and <code>background</code>, properties
   * based on the corresponding "Spinner.*" properties from defaults table.
   * The <code>JSpinners</code> layout is set to the value returned by
   * <code>createLayout</code>.  This method is called by <code>installUI</code>.
   *
   * @see #uninstallDefaults
   * @see #installUI
   * @see #createLayout
   * @see LookAndFeel#installBorder
   * @see LookAndFeel#installColors
   */
  installDefaults(): void {
    this.spinner.setLayout(this.createLayout());
    LookAndFeel.installBorder(this.spinner, 'Spinner.border');
    LookAndFeel.installColorsAndFont(this.spinner, 'Spinner.background', 'Spinner.foreground', 'Spinner.font');
    LookAndFeel.installProperty(this.spinner, 'opaque', true);
    let editor = this.spinner.getEditor();
    if (editor instanceof JSpinner$DefaultEditor) {
      let tf = (editor).getTextField();
      if (tf != null) {
        if ($J.isa(tf.getFont(), UIResource)) {
          let font = this.spinner.getFont();
          tf.setFont(font == null ? null : new FontUIResource()._FontUIResource$Font(font));
        }
      }
    }
  }
  /**
   * Sets the <code>JSpinner's</code> layout manager to null.  This
   * method is called by <code>uninstallUI</code>.
   *
   * @see #installDefaults
   * @see #uninstallUI
   */
  uninstallDefaults(): void {
    LookAndFeel.uninstallBorder(this.spinner);
    this.spinner.setLayout(null);
  }
  getHandler(): BasicSpinnerUI$Handler {
    if (this.handler == null) {
      this.handler = new BasicSpinnerUI$Handler()._BasicSpinnerUI$Handler();
    }
    return this.handler;
  }
  /**
   * Installs the necessary listeners on the next button, <code>c</code>,
   * to update the <code>JSpinner</code> in response to a user gesture.
   *
   * @param c Component to install the listeners on
   * @throws NullPointerException if <code>c</code> is null.
   * @see #createNextButton
   * @since 1.5
   */
  installNextButtonListeners(c: Component): void {
    this.installButtonListeners(c, BasicSpinnerUI.nextButtonHandler);
  }
  /**
   * Installs the necessary listeners on the previous button, <code>c</code>,
   * to update the <code>JSpinner</code> in response to a user gesture.
   *
   * @param c Component to install the listeners on.
   * @throws NullPointerException if <code>c</code> is null.
   * @see #createPreviousButton
   * @since 1.5
   */
  installPreviousButtonListeners(c: Component): void {
    this.installButtonListeners(c, BasicSpinnerUI.previousButtonHandler);
  }
  installButtonListeners(c: Component, handler: BasicSpinnerUI$ArrowButtonHandler): void {
    if (c instanceof JButton) {
      (c).addActionListener($J.fn(handler, 'actionPerformed'));
    }
    c.addMouseListener(handler);
  }
  /**
   * Creates a <code>LayoutManager</code> that manages the <code>editor</code>,
   * <code>nextButton</code>, and <code>previousButton</code>
   * children of the JSpinner.  These three children must be
   * added with a constraint that identifies their role:
   * "Editor", "Next", and "Previous". The default layout manager
   * can handle the absence of any of these children.
   *
   * @return a LayoutManager for the editor, next button, and previous button.
   * @see #createNextButton
   * @see #createPreviousButton
   * @see #createEditor
   */
  createLayout(): LayoutManager {
    return this.getHandler();
  }
  /**
   * Creates a <code>PropertyChangeListener</code> that can be
   * added to the JSpinner itself.  Typically, this listener
   * will call replaceEditor when the "editor" property changes,
   * since it's the <code>SpinnerUI's</code> responsibility to
   * add the editor to the JSpinner (and remove the old one).
   * This method is called by <code>installListeners</code>.
   *
   * @return A PropertyChangeListener for the JSpinner itself
   * @see #installListeners
   */
  createPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
  /**
   * Creates a decrement button, i.e. component that replaces the spinner
   * value with the object returned by <code>spinner.getPreviousValue</code>.
   * By default the <code>previousButton</code> is a {@code JButton}. If the
   * decrement button is not needed this method should return {@code null}.
   *
   * @return a component that will replace the spinner's value with the
   *     previous value in the sequence, or {@code null}
   * @see #installUI
   * @see #createNextButton
   * @see #installPreviousButtonListeners
   */
  createPreviousButton(): Component {
    let c = this.createArrowButton(SwingConstants.SOUTH);
    c.setName('Spinner.previousButton');
    this.installPreviousButtonListeners(c);
    return c;
  }
  /**
   * Creates an increment button, i.e. component that replaces the spinner
   * value with the object returned by <code>spinner.getNextValue</code>.
   * By default the <code>nextButton</code> is a {@code JButton}. If the
   * increment button is not needed this method should return {@code null}.
   *
   * @return a component that will replace the spinner's value with the
   *     next value in the sequence, or {@code null}
   * @see #installUI
   * @see #createPreviousButton
   * @see #installNextButtonListeners
   */
  createNextButton(): Component {
    let c = this.createArrowButton(SwingConstants.NORTH);
    c.setName('Spinner.nextButton');
    this.installNextButtonListeners(c);
    return c;
  }
  createArrowButton(direction: number): Component {
    let b = new BasicArrowButton()._BasicArrowButton$int(direction);
    let buttonBorder = UIManager.getBorder$Object('Spinner.arrowButtonBorder');
    if ($J.isa(buttonBorder, UIResource)) {
      b.setBorder(new CompoundBorder()._CompoundBorder$Border$Border(buttonBorder, null));
    } else {
      b.setBorder(buttonBorder);
    }
    b.setInheritsPopupMenu(true);
    return b;
  }
  /**
   * This method is called by installUI to get the editor component
   * of the <code>JSpinner</code>.  By default it just returns
   * <code>JSpinner.getEditor()</code>.  Subclasses can override
   * <code>createEditor</code> to return a component that contains
   * the spinner's editor or null, if they're going to handle adding
   * the editor to the <code>JSpinner</code> in an
   * <code>installUI</code> override.
   * <p>
   * Typically this method would be overridden to wrap the editor
   * with a container with a custom border, since one can't assume
   * that the editors border can be set directly.
   * <p>
   * The <code>replaceEditor</code> method is called when the spinners
   * editor is changed with <code>JSpinner.setEditor</code>.  If you've
   * overridden this method, then you'll probably want to override
   * <code>replaceEditor</code> as well.
   *
   * @return the JSpinners editor JComponent, spinner.getEditor() by default
   * @see #installUI
   * @see #replaceEditor
   * @see JSpinner#getEditor
   */
  createEditor(): JComponent {
    let editor = this.spinner.getEditor();
    this.maybeRemoveEditorBorder(editor);
    this.installEditorBorderListener(editor);
    editor.setInheritsPopupMenu(true);
    this.updateEditorAlignment(editor);
    return editor;
  }
  /**
   * Called by the <code>PropertyChangeListener</code> when the
   * <code>JSpinner</code> editor property changes.  It's the responsibility
   * of this method to remove the old editor and add the new one.  By
   * default this operation is just:
   * <pre>
   * spinner.remove(oldEditor);
   * spinner.add(newEditor, "Editor");
   * </pre>
   * The implementation of <code>replaceEditor</code> should be coordinated
   * with the <code>createEditor</code> method.
   *
   * @param oldEditor an old instance of editor
   * @param newEditor a new instance of editor
   * @see #createEditor
   * @see #createPropertyChangeListener
   */
  replaceEditor(oldEditor: JComponent, newEditor: JComponent): void {
    this.spinner.remove$Component(oldEditor);
    this.maybeRemoveEditorBorder(newEditor);
    this.installEditorBorderListener(newEditor);
    newEditor.setInheritsPopupMenu(true);
    this.spinner.add$Component$Object(newEditor, 'Editor');
  }
  updateEditorAlignment(editor: JComponent): void {
    if (editor instanceof JSpinner$DefaultEditor) {
      let alignment = UIManager.getInt$Object('Spinner.editorAlignment');
      let text = (editor).getTextField();
      text.setHorizontalAlignment(alignment);
    }
  }
  /**
   * Remove the border around the inner editor component for LaFs
   * that install an outside border around the spinner,
   */
  maybeRemoveEditorBorder(editor: JComponent): void {
    if (!UIManager.getBoolean$Object('Spinner.editorBorderPainted')) {
      if (editor instanceof JPanel && editor.getBorder() == null && editor.getComponentCount() > 0) {
        editor = editor.getComponent$int(0);
      }
      if (editor != null && $J.isa(editor.getBorder(), UIResource)) {
        editor.setBorder(null);
      }
    }
  }
  /**
   * Remove the border around the inner editor component for LaFs
   * that install an outside border around the spinner,
   */
  installEditorBorderListener(editor: JComponent): void {
    if (!UIManager.getBoolean$Object('Spinner.editorBorderPainted')) {
      if (editor instanceof JPanel && editor.getBorder() == null && editor.getComponentCount() > 0) {
        editor = editor.getComponent$int(0);
      }
      if (editor != null && (editor.getBorder() == null || $J.isa(editor.getBorder(), UIResource))) {
        editor.addPropertyChangeListener$PropertyChangeListener($J.fn(this.getHandler(), 'propertyChange'));
      }
    }
  }
  removeEditorBorderListener(editor: JComponent): void {
    if (!UIManager.getBoolean$Object('Spinner.editorBorderPainted')) {
      if (editor instanceof JPanel && editor.getComponentCount() > 0) {
        editor = editor.getComponent$int(0);
      }
      if (editor != null) {
        editor.removePropertyChangeListener$PropertyChangeListener($J.fn(this.getHandler(), 'propertyChange'));
      }
    }
  }
  /**
   * Updates the enabled state of the children Components based on the
   * enabled state of the <code>JSpinner</code>.
   */
  updateEnabledState$$BasicSpinnerUI(): void {
    this.updateEnabledState$Container$boolean$BasicSpinnerUI(this.spinner, this.spinner.isEnabled());
  }
  /**
   * Recursively updates the enabled state of the child
   * <code>Component</code>s of <code>c</code>.
   */
  updateEnabledState$Container$boolean$BasicSpinnerUI(c: Container, enabled: boolean): void {
    for (let counter = (c.getComponentCount() - 1) | 0; counter >= 0; counter--) {
      let child = c.getComponent$int(counter);
      if (DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(this.spinner, this, 'Spinner.disableOnBoundaryValues', false)) {
        let model = this.spinner.getModel();
        if (child.getName$() === 'Spinner.nextButton' && model.getNextValue() == null) {
          child.setEnabled(false);
        } else if (child.getName$() === 'Spinner.previousButton' && model.getPreviousValue() == null) {
          child.setEnabled(false);
        } else {
          child.setEnabled(enabled);
        }
      } else {
        child.setEnabled(enabled);
      }
      if (child instanceof Container) {
        this.updateEnabledState$Container$boolean$BasicSpinnerUI(child, enabled);
      }
    }
  }
  /**
   * Installs the keyboard Actions onto the JSpinner.
   *
   * @since 1.5
   */
  installKeyboardActions(): void {
    let iMap = this.getInputMap(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT);
    SwingUtilities.replaceUIInputMap(this.spinner, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, iMap);
    LazyActionMap.installLazyActionMap(this.spinner, $J.cls(BasicSpinnerUI), 'Spinner.actionMap');
  }
  /**
   * Returns the InputMap to install for <code>condition</code>.
   */
  getInputMap(condition: number): InputMap {
    if (condition === JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT) {
      return DefaultLookup.get(this.spinner, this, 'Spinner.ancestorInputMap');
    }
    return null;
  }
  static loadActionMap(map: LazyActionMap): void {
    map.put$Object$Action('increment', BasicSpinnerUI.nextButtonHandler);
    map.put$Object$Action('decrement', BasicSpinnerUI.previousButtonHandler);
  }
  /**
   * Returns the baseline.
   *
   * @throws NullPointerException {@inheritDoc}
   * @throws IllegalArgumentException {@inheritDoc}
   * @see javax.swing.JComponent#getBaseline(int, int)
   * @since 1.6
   */
  getBaseline$JComponent$int$int(c: JComponent, width: number, height: number): number {
    super.getBaseline$JComponent$int$int(c, width, height);
    let editor = this.spinner.getEditor();
    let insets = this.spinner.getInsets$();
    width = (width - insets.left - insets.right) | 0;
    height = (height - insets.top - insets.bottom) | 0;
    if (width >= 0 && height >= 0) {
      let baseline = editor.getBaseline(width, height);
      if (baseline >= 0) {
        return (insets.top + baseline) | 0;
      }
    }
    return -1;
  }
  /**
   * Returns an enum indicating how the baseline of the component
   * changes as the size changes.
   *
   * @throws NullPointerException {@inheritDoc}
   * @see javax.swing.JComponent#getBaseline(int, int)
   * @since 1.6
   */
  getBaselineResizeBehavior(c: JComponent): Component$BaselineResizeBehavior {
    super.getBaselineResizeBehavior(c);
    return this.spinner.getEditor().getBaselineResizeBehavior();
  }
  static $clinit() {
    BasicSpinnerUI.nextButtonHandler = new BasicSpinnerUI$ArrowButtonHandler()._BasicSpinnerUI$ArrowButtonHandler('increment', true);
    BasicSpinnerUI.previousButtonHandler = new BasicSpinnerUI$ArrowButtonHandler()._BasicSpinnerUI$ArrowButtonHandler('decrement', false);
    BasicSpinnerUI.zeroSize = new Dimension()._Dimension$int$int(0, 0);
  }
}

/**
 * A handler for spinner arrow button mouse and action events.  When
 * a left mouse pressed event occurs we look up the (enabled) spinner
 * that's the source of the event and start the autorepeat timer.  The
 * timer fires action events until any button is released at which
 * point the timer is stopped and the reference to the spinner cleared.
 * The timer doesn't start until after a 300ms delay, so often the
 * source of the initial (and final) action event is just the button
 * logic for mouse released - which means that we're relying on the fact
 * that our mouse listener runs after the buttons mouse listener.
 * <p>
 * Note that one instance of this handler is shared by all slider previous
 * arrow buttons and likewise for all of the next buttons,
 * so it doesn't have any state that persists beyond the limits
 * of a single button pressed/released gesture.
 */
export class BasicSpinnerUI$ArrowButtonHandler extends AbstractAction {
  autoRepeatTimer: Timer = null;
  isNext: boolean = false;
  spinner: JSpinner = null;
  arrowButton: JButton = null;
  _BasicSpinnerUI$ArrowButtonHandler(name: string, isNext: boolean): this {
    this._AbstractAction$String(name);
    this.spinner = null;
    this.arrowButton = null;
    this.isNext = isNext;
    this.autoRepeatTimer = new Timer()._Timer(60, $J.fn(this, 'actionPerformed'));
    this.autoRepeatTimer.setInitialDelay(300);
    return this;
  }
  eventToSpinner(e: AWTEvent): JSpinner {
    let src = e.getSource();
    while ((src instanceof Component) && !(src instanceof JSpinner)) {
      src = (src).getParent();
    }
    return (src instanceof JSpinner) ? src : null;
  }
  actionPerformed(e: ActionEvent): void {
    let spinner = this.spinner;
    if (!(e.getSource() instanceof Timer)) {
      spinner = this.eventToSpinner(e);
      if (e.getSource() instanceof JButton) {
        this.arrowButton = e.getSource();
      }
    } else {
      if (this.arrowButton != null && !this.arrowButton.getModel().isPressed() && this.autoRepeatTimer.isRunning()) {
        this.autoRepeatTimer.stop();
        spinner = null;
        this.arrowButton = null;
      }
    }
    if (spinner != null) {
      try {
        let calendarField = this.getCalendarField(spinner);
        spinner.commitEdit();
        if (calendarField !== -1) {
          (spinner.getModel()).setCalendarField(calendarField);
        }
        let value = (this.isNext) ? spinner.getNextValue() : spinner.getPreviousValue();
        if (value != null) {
          spinner.setValue(value);
          this.select$JSpinner$BasicSpinnerUI_ArrowButtonHandler(spinner);
        }
      } catch ($e0) {
        if ($J.isa($e0, IllegalArgumentException) || $J.isa($e0, ParseException)) {
          let ex = $J.exc($e0);
          UIManager.getLookAndFeel().provideErrorFeedback(spinner);
        } else {
          throw $e0;
        }
      }
    }
  }
  /**
   * If the spinner's editor is a DateEditor, this selects the field
   * associated with the value that is being incremented.
   */
  select$JSpinner$BasicSpinnerUI_ArrowButtonHandler(spinner: JSpinner): void {
    let editor = spinner.getEditor();
    if (editor instanceof JSpinner$DateEditor) {
      let dateEditor = editor;
      let ftf = dateEditor.getTextField();
      let format = dateEditor.getFormat();
      let value: any;
      if (format != null && (value = spinner.getValue()) != null) {
        let model = dateEditor.getModel();
        let field = DateFormat_Field.ofCalendarField(model.getCalendarField());
        if (field != null) {
          try {
            let iterator = format.formatToCharacterIterator(value);
            if (!this.select$JFormattedTextField$AttributedCharacterIterator$Field$BasicSpinnerUI_ArrowButtonHandler(ftf, iterator, field) && field === DateFormat_Field.HOUR0) {
              this.select$JFormattedTextField$AttributedCharacterIterator$Field$BasicSpinnerUI_ArrowButtonHandler(ftf, iterator, DateFormat_Field.HOUR1);
            }
          } catch ($e1) {
            if ($J.isa($e1, IllegalArgumentException)) {
              let iae = $J.exc($e1);
            } else {
              throw $e1;
            }
          }
        }
      }
    }
  }
  /**
   * Selects the passed in field, returning true if it is found,
   * false otherwise.
   */
  select$JFormattedTextField$AttributedCharacterIterator$Field$BasicSpinnerUI_ArrowButtonHandler(ftf: JFormattedTextField, iterator: AttributedCharacterIterator, field: DateFormat_Field): boolean {
    let max = ftf.getDocument().getLength();
    iterator.first();
    do {
      let attrs = iterator.getAttributes();
      if (attrs != null && attrs.containsKey(field)) {
        let start = iterator.getRunStart(field);
        let end = iterator.getRunLimit(field);
        if (start !== -1 && end !== -1 && start <= max && end <= max) {
          ftf.select(start, end);
        }
        return true;
      }
    } while (iterator.next() !== 65535 /* \uffff */);
    return false;
  }
  /**
   * Returns the calendarField under the start of the selection, or
   * -1 if there is no valid calendar field under the selection (or
   * the spinner isn't editing dates.
   */
  getCalendarField(spinner: JSpinner): number {
    let editor = spinner.getEditor();
    if (editor instanceof JSpinner$DateEditor) {
      let dateEditor = editor;
      let ftf = dateEditor.getTextField();
      let start = ftf.getSelectionStart();
      let formatter = ftf.getFormatter();
      if (formatter instanceof InternationalFormatter) {
        let fields = (formatter).getFields(start);
        for (let counter = 0; counter < fields.length; counter++) {
          if ($J.isa(fields[counter], DateFormat_Field)) {
            let calendarField: number;
            if (fields[counter] === DateFormat_Field.HOUR1) {
              calendarField = 10;
            } else {
              calendarField = (fields[counter]).getCalendarField();
            }
            if (calendarField !== -1) {
              return calendarField;
            }
          }
        }
      }
    }
    return -1;
  }
  mousePressed(e: MouseEvent): void {
    if (SwingUtilities.isLeftMouseButton(e) && e.getComponent().isEnabled()) {
      this.spinner = this.eventToSpinner(e);
      this.autoRepeatTimer.start();
      this.focusSpinnerIfNecessary();
    }
  }
  mouseReleased(e: MouseEvent): void {
    this.autoRepeatTimer.stop();
    this.arrowButton = null;
    this.spinner = null;
  }
  mouseClicked(e: MouseEvent): void {
  }
  mouseEntered(e: MouseEvent): void {
    if (this.spinner != null && !this.autoRepeatTimer.isRunning() && this.spinner === this.eventToSpinner(e)) {
      this.autoRepeatTimer.start();
    }
  }
  mouseExited(e: MouseEvent): void {
    if (this.autoRepeatTimer.isRunning()) {
      this.autoRepeatTimer.stop();
    }
  }
  /**
   * Requests focus on a child of the spinner if the spinner doesn't
   * have focus.
   */
  focusSpinnerIfNecessary(): void {
    let fo = KeyboardFocusManager.getCurrentKeyboardFocusManager$().getFocusOwner();
    if (this.spinner.isRequestFocusEnabled() && (fo == null || !SwingUtilities.isDescendingFrom(fo, this.spinner))) {
      let root = this.spinner;
      if (!root.isFocusCycleRoot$()) {
        root = root.getFocusCycleRootAncestor();
      }
      if (root != null) {
        let ftp = root.getFocusTraversalPolicy();
        let child = ftp.getComponentAfter(root, this.spinner);
        if (child != null && SwingUtilities.isDescendingFrom(child, this.spinner)) {
          child.requestFocus$Cause(FocusEvent$Cause.MOUSE_EVENT);
        }
      }
    }
  }
  focusGained(e: FocusEvent): void {
  }
  focusLost(e: FocusEvent): void {
    if (this.spinner === this.eventToSpinner(e)) {
      if (this.autoRepeatTimer.isRunning()) {
        this.autoRepeatTimer.stop();
      }
      this.spinner = null;
      if (this.arrowButton != null) {
        let model = this.arrowButton.getModel();
        model.setPressed(false);
        model.setArmed(false);
        this.arrowButton = null;
      }
    }
  }
}

export class BasicSpinnerUI$Handler extends JObject {
  nextButton: Component = null;
  previousButton: Component = null;
  editor: Component = null;
  _BasicSpinnerUI$Handler(): this {
    this.nextButton = null;
    this.previousButton = null;
    this.editor = null;
    return this;
  }
  addLayoutComponent$String$Component(name: string, c: Component): void {
    if ($J.equals('Next', name)) {
      this.nextButton = c;
    } else if ($J.equals('Previous', name)) {
      this.previousButton = c;
    } else if ($J.equals('Editor', name)) {
      this.editor = c;
    }
  }
  removeLayoutComponent(c: Component): void {
    if (c === this.nextButton) {
      this.nextButton = null;
    } else if (c === this.previousButton) {
      this.previousButton = null;
    } else if (c === this.editor) {
      this.editor = null;
    }
  }
  preferredSize(c: Component): Dimension {
    return (c == null) ? BasicSpinnerUI.zeroSize : c.getPreferredSize$();
  }
  preferredLayoutSize(parent: Container): Dimension {
    let nextD = this.preferredSize(this.nextButton);
    let previousD = this.preferredSize(this.previousButton);
    let editorD = this.preferredSize(this.editor);
    editorD.height_ = Math.imul(($J.idiv(((editorD.height_ + 1) | 0), 2)), 2);
    let size = new Dimension()._Dimension$int$int(editorD.width_, editorD.height_);
    size.width_ = (size.width_ + Math.max(nextD.width_, previousD.width_)) | 0;
    let insets = parent.getInsets$();
    size.width_ = (size.width_ + (insets.left + insets.right)) | 0;
    size.height_ = (size.height_ + (insets.top + insets.bottom)) | 0;
    return size;
  }
  minimumLayoutSize(parent: Container): Dimension {
    return this.preferredLayoutSize(parent);
  }
  setBounds(c: Component, x: number, y: number, width: number, height: number): void {
    if (c != null) {
      c.setBounds$int$int$int$int(x, y, width, height);
    }
  }
  layoutContainer$Container(parent: Container): void {
    let width = parent.getWidth();
    let height = parent.getHeight();
    let insets = parent.getInsets$();
    if (this.nextButton == null && this.previousButton == null) {
      this.setBounds(this.editor, insets.left, insets.top, (width - insets.left - insets.right) | 0, (height - insets.top - insets.bottom) | 0);
      return;
    }
    let nextD = this.preferredSize(this.nextButton);
    let previousD = this.preferredSize(this.previousButton);
    let buttonsWidth = Math.max(nextD.width_, previousD.width_);
    let editorHeight = (height - (insets.top + insets.bottom)) | 0;
    let buttonInsets = UIManager.getInsets$Object('Spinner.arrowButtonInsets');
    if (buttonInsets == null) {
      buttonInsets = insets;
    }
    let editorX: number;
    let editorWidth: number;
    let buttonsX: number;
    if (parent.getComponentOrientation().isLeftToRight()) {
      editorX = insets.left;
      editorWidth = (width - insets.left - buttonsWidth - buttonInsets.right) | 0;
      buttonsX = (width - buttonsWidth - buttonInsets.right) | 0;
    } else {
      buttonsX = buttonInsets.left;
      editorX = (buttonsX + buttonsWidth) | 0;
      editorWidth = (width - buttonInsets.left - buttonsWidth - insets.right) | 0;
    }
    let nextY = buttonInsets.top;
    let nextHeight = (($J.idiv(height, 2)) + (height % 2) - nextY) | 0;
    let previousY = (buttonInsets.top + nextHeight) | 0;
    let previousHeight = (height - previousY - buttonInsets.bottom) | 0;
    this.setBounds(this.editor, editorX, insets.top, editorWidth, editorHeight);
    this.setBounds(this.nextButton, buttonsX, nextY, buttonsWidth, nextHeight);
    this.setBounds(this.previousButton, buttonsX, previousY, buttonsWidth, previousHeight);
  }
  propertyChange(e: PropertyChangeEvent): void {
    let propertyName = e.getPropertyName();
    if (e.getSource() instanceof JSpinner) {
      let spinner = (e.getSource());
      let spinnerUI = spinner.getUI();
      if (spinnerUI instanceof BasicSpinnerUI) {
        let ui = spinnerUI;
        if ($J.equals('editor', propertyName)) {
          let oldEditor = e.getOldValue();
          let newEditor = e.getNewValue();
          ui.replaceEditor(oldEditor, newEditor);
          ui.updateEnabledState$$BasicSpinnerUI();
          if (oldEditor instanceof JSpinner$DefaultEditor) {
            let tf = (oldEditor).getTextField();
            if (tf != null) {
              tf.removeFocusListener(BasicSpinnerUI.nextButtonHandler);
              tf.removeFocusListener(BasicSpinnerUI.previousButtonHandler);
            }
          }
          if (newEditor instanceof JSpinner$DefaultEditor) {
            let tf = (newEditor).getTextField();
            if (tf != null) {
              if ($J.isa(tf.getFont(), UIResource)) {
                let font = spinner.getFont();
                tf.setFont(font == null ? null : new FontUIResource()._FontUIResource$Font(font));
              }
              tf.addFocusListener(BasicSpinnerUI.nextButtonHandler);
              tf.addFocusListener(BasicSpinnerUI.previousButtonHandler);
            }
          }
        } else if ($J.equals('enabled', propertyName) || $J.equals('model', propertyName)) {
          ui.updateEnabledState$$BasicSpinnerUI();
        } else if ($J.equals('font', propertyName)) {
          let editor = spinner.getEditor();
          if (editor instanceof JSpinner$DefaultEditor) {
            let tf = (editor).getTextField();
            if (tf != null) {
              if ($J.isa(tf.getFont(), UIResource)) {
                let font = spinner.getFont();
                tf.setFont(font == null ? null : new FontUIResource()._FontUIResource$Font(font));
              }
            }
          }
        } else if ($J.equals(JComponent.TOOL_TIP_TEXT_KEY, propertyName)) {
          this.updateToolTipTextForChildren(spinner);
        } else if ($J.equals('componentOrientation', propertyName)) {
          let o = e.getNewValue();
          if (o !== e.getOldValue()) {
            let editor = spinner.getEditor();
            if (editor != null) {
              editor.applyComponentOrientation(o);
            }
            spinner.revalidate();
            spinner.repaint$();
          }
        }
      }
    } else if (e.getSource() instanceof JComponent) {
      let c = e.getSource();
      if ((c.getParent() instanceof JPanel) && (c.getParent().getParent() instanceof JSpinner) && $J.equals('border', propertyName)) {
        let spinner = c.getParent().getParent();
        let spinnerUI = spinner.getUI();
        if (spinnerUI instanceof BasicSpinnerUI) {
          let ui = spinnerUI;
          ui.maybeRemoveEditorBorder(c);
        }
      }
    }
  }
  updateToolTipTextForChildren(spinner: JComponent): void {
    let toolTipText = spinner.getToolTipText$();
    let children = spinner.getComponents();
    for (let i = 0; i < children.length; i++) {
      if (children[i] instanceof JSpinner$DefaultEditor) {
        let tf = (children[i]).getTextField();
        if (tf != null) {
          tf.setToolTipText(toolTipText);
        }
      } else if (children[i] instanceof JComponent) {
        (children[i]).setToolTipText(spinner.getToolTipText$());
      }
    }
  }
  stateChanged(e: ChangeEvent): void {
    if (e.getSource() instanceof JSpinner) {
      let spinner = e.getSource();
      let spinnerUI = spinner.getUI();
      if (DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(spinner, spinnerUI, 'Spinner.disableOnBoundaryValues', false) && spinnerUI instanceof BasicSpinnerUI) {
        let ui = spinnerUI;
        ui.updateEnabledState$$BasicSpinnerUI();
      }
    }
  }
}

$J.define(BasicSpinnerUI, 'javax.swing.plaf.basic.BasicSpinnerUI', { kind: 'class', sup: 'javax.swing.plaf.SpinnerUI', ctors: { '': '_BasicSpinnerUI' }, meths: { 'getBaseline(javax.swing.JComponent,int,int)': 'getBaseline$JComponent$int$int', 'updateEnabledState(java.awt.Container,boolean)': 'updateEnabledState$Container$boolean$BasicSpinnerUI', 'updateEnabledState()': 'updateEnabledState$$BasicSpinnerUI' }, clinit: true, lazy: ['nextButtonHandler', 'previousButtonHandler', 'zeroSize'] });
$J.define(BasicSpinnerUI$ArrowButtonHandler, 'javax.swing.plaf.basic.BasicSpinnerUI$ArrowButtonHandler', { kind: 'class', ifaces: ['java.awt.event.FocusListener', 'java.awt.event.MouseListener', 'javax.swing.plaf.UIResource'], sup: 'javax.swing.AbstractAction', ctors: { 'java.lang.String,boolean': '_BasicSpinnerUI$ArrowButtonHandler' }, meths: { 'select(javax.swing.JFormattedTextField,java.text.AttributedCharacterIterator,java.text.DateFormat$Field)': 'select$JFormattedTextField$AttributedCharacterIterator$Field$BasicSpinnerUI_ArrowButtonHandler', 'select(javax.swing.JSpinner)': 'select$JSpinner$BasicSpinnerUI_ArrowButtonHandler' } });
$J.define(BasicSpinnerUI$Handler, 'javax.swing.plaf.basic.BasicSpinnerUI$Handler', { kind: 'class', ifaces: ['java.awt.LayoutManager', 'java.beans.PropertyChangeListener', 'javax.swing.event.ChangeListener'], sup: 'java.lang.Object', ctors: { '': '_BasicSpinnerUI$Handler' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' } });
$J.module(() => {
  Component = $J.load('java.awt.Component');
  Container = $J.load('java.awt.Container');
  Dimension = $J.load('java.awt.Dimension');
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  FocusEvent$Cause = $J.load('java.awt.event.FocusEvent$Cause');
  JButton = $J.load('javax.swing.JButton');
  JComponent = $J.load('javax.swing.JComponent');
  JPanel = $J.load('javax.swing.JPanel');
  JSpinner = $J.load('javax.swing.JSpinner');
  JSpinner$DateEditor = $J.load('javax.swing.JSpinner$DateEditor');
  JSpinner$DefaultEditor = $J.load('javax.swing.JSpinner$DefaultEditor');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  Timer = $J.load('javax.swing.Timer');
  UIManager = $J.load('javax.swing.UIManager');
  CompoundBorder = $J.load('javax.swing.border.CompoundBorder');
  FontUIResource = $J.load('javax.swing.plaf.FontUIResource');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicArrowButton = $J.load('javax.swing.plaf.basic.BasicArrowButton');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  InternationalFormatter = $J.load('javax.swing.text.InternationalFormatter');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
});
