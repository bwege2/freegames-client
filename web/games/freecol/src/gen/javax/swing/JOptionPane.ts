// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JOptionPane.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Arrays, Integer, RuntimeException } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';

let BorderLayout, Dialog, Frame, ComponentAdapter, WindowAdapter, JDialog, JRootPane, SwingUtilities, SwingUtilities$SharedOwnerFrame, UIManager;

/**
 * <code>JOptionPane</code> makes it easy to pop up a standard dialog box that
 * prompts users for a value or informs them of something.
 * For information about using <code>JOptionPane</code>, see
 * <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/dialog.html">How to Make Dialogs</a>,
 * a section in <em>The Java Tutorial</em>.
 *
 * <p>
 *
 * While the <code>JOptionPane</code>
 * class may appear complex because of the large number of methods, almost
 * all uses of this class are one-line calls to one of the static
 * <code>showXxxDialog</code> methods shown below:
 *
 * <table class="striped">
 * <caption>Common JOptionPane method names and their descriptions</caption>
 * <thead>
 *   <tr>
 *     <th scope="col">Method Name
 *     <th scope="col">Description
 * </thead>
 * <tbody>
 *   <tr>
 *     <th scope="row">showConfirmDialog
 *     <td>Asks a confirming question, like yes/no/cancel.</td>
 *   <tr>
 *     <th scope="row">showInputDialog
 *     <td>Prompt for some input.
 *   <tr>
 *     <th scope="row">showMessageDialog
 *     <td>Tell the user about something that has happened.
 *   <tr>
 *     <th scope="row">showOptionDialog
 *     <td>The Grand Unification of the above three.
 * </tbody>
 * </table>
 *
 * Each of these methods also comes in a <code>showInternalXXX</code>
 * flavor, which uses an internal frame to hold the dialog box (see
 * {@link JInternalFrame}).
 * Multiple convenience methods have also been defined -- overloaded
 * versions of the basic methods that use different parameter lists.
 * <p>
 * All dialogs are modal. Each <code>showXxxDialog</code> method blocks
 * the caller until the user's interaction is complete.
 *
 * <table class="borderless">
 * <caption>Common dialog</caption>
 * <tr>
 *  <td style="background-color:#FFe0d0" rowspan=2>icon</td>
 *  <td style="background-color:#FFe0d0">message</td>
 * </tr>
 * <tr>
 *  <td style="background-color:#FFe0d0">input value</td>
 * </tr>
 * <tr>
 *   <td style="background-color:#FFe0d0" colspan=2>option buttons</td>
 * </tr>
 * </table>
 *
 * The basic appearance of one of these dialog boxes is generally
 * similar to the picture above, although the various
 * look-and-feels are
 * ultimately responsible for the final result.  In particular, the
 * look-and-feels will adjust the layout to accommodate the option pane's
 * <code>ComponentOrientation</code> property.
 * <br style="clear:all">
 * <p>
 * <b>Parameters:</b><br>
 * The parameters to these methods follow consistent patterns:
 * <blockquote>
 * <dl>
 * <dt>parentComponent<dd>
 * Defines the <code>Component</code> that is to be the parent of this
 * dialog box.
 * It is used in two ways: the <code>Frame</code> that contains
 * it is used as the <code>Frame</code>
 * parent for the dialog box, and its screen coordinates are used in
 * the placement of the dialog box. In general, the dialog box is placed
 * just below the component. This parameter may be <code>null</code>,
 * in which case a default <code>Frame</code> is used as the parent,
 * and the dialog will be
 * centered on the screen (depending on the {@literal L&F}).
 * <dt>message<dd>
 * A descriptive message to be placed in the dialog box.
 * In the most common usage, message is just a <code>String</code> or
 * <code>String</code> constant.
 * However, the type of this parameter is actually <code>Object</code>. Its
 * interpretation depends on its type:
 * <dl>
 * <dt>Object[]<dd>An array of objects is interpreted as a series of
 *                 messages (one per object) arranged in a vertical stack.
 *                 The interpretation is recursive -- each object in the
 *                 array is interpreted according to its type.
 * <dt>Component<dd>The <code>Component</code> is displayed in the dialog.
 * <dt>Icon<dd>The <code>Icon</code> is wrapped in a <code>JLabel</code>
 *               and displayed in the dialog.
 * <dt>others<dd>The object is converted to a <code>String</code> by calling
 *               its <code>toString</code> method. The result is wrapped in a
 *               <code>JLabel</code> and displayed.
 * </dl>
 * <dt>messageType<dd>Defines the style of the message. The Look and Feel
 * manager may lay out the dialog differently depending on this value, and
 * will often provide a default icon. The possible values are:
 * <ul>
 * <li><code>ERROR_MESSAGE</code>
 * <li><code>INFORMATION_MESSAGE</code>
 * <li><code>WARNING_MESSAGE</code>
 * <li><code>QUESTION_MESSAGE</code>
 * <li><code>PLAIN_MESSAGE</code>
 * </ul>
 * <dt>optionType<dd>Defines the set of option buttons that appear at
 * the bottom of the dialog box:
 * <ul>
 * <li><code>DEFAULT_OPTION</code>
 * <li><code>YES_NO_OPTION</code>
 * <li><code>YES_NO_CANCEL_OPTION</code>
 * <li><code>OK_CANCEL_OPTION</code>
 * </ul>
 * You aren't limited to this set of option buttons.  You can provide any
 * buttons you want using the options parameter.
 * <dt>options<dd>A more detailed description of the set of option buttons
 * that will appear at the bottom of the dialog box.
 * The usual value for the options parameter is an array of
 * <code>String</code>s. But
 * the parameter type is an array of <code>Objects</code>.
 * A button is created for each object depending on its type:
 * <dl>
 * <dt>Component<dd>The component is added to the button row directly.
 * <dt>Icon<dd>A <code>JButton</code> is created with this as its label.
 * <dt>other<dd>The <code>Object</code> is converted to a string using its
 *              <code>toString</code> method and the result is used to
 *              label a <code>JButton</code>.
 * </dl>
 * <dt>icon<dd>A decorative icon to be placed in the dialog box. A default
 * value for this is determined by the <code>messageType</code> parameter.
 * <dt>title<dd>The title for the dialog box.
 * <dt>initialValue<dd>The default selection (input value).
 * </dl>
 * </blockquote>
 * <p>
 * When the selection is changed, <code>setValue</code> is invoked,
 * which generates a <code>PropertyChangeEvent</code>.
 * <p>
 * If a <code>JOptionPane</code> has configured to all input
 * <code>setWantsInput</code>
 * the bound property <code>JOptionPane.INPUT_VALUE_PROPERTY</code>
 *  can also be listened
 * to, to determine when the user has input or selected a value.
 * <p>
 * When one of the <code>showXxxDialog</code> methods returns an integer,
 * the possible values are:
 * <ul>
 * <li><code>YES_OPTION</code>
 * <li><code>NO_OPTION</code>
 * <li><code>CANCEL_OPTION</code>
 * <li><code>OK_OPTION</code>
 * <li><code>CLOSED_OPTION</code>
 * </ul>
 * <b>Examples:</b>
 * <dl>
 * <dt>Show an error dialog that displays the message, 'alert':
 * <dd><code>
 * JOptionPane.showMessageDialog(null, "alert", "alert", JOptionPane.ERROR_MESSAGE);
 * </code>
 * <dt>Show an internal information dialog with the message, 'information':
 * <dd><pre>
 * JOptionPane.showInternalMessageDialog(frame, "information",
 *             "information", JOptionPane.INFORMATION_MESSAGE);
 * </pre>
 * <dt>Show an information panel with the options yes/no and message 'choose one':
 * <dd><pre>JOptionPane.showConfirmDialog(null,
 *             "choose one", "choose one", JOptionPane.YES_NO_OPTION);
 * </pre>
 * <dt>Show an internal information dialog with the options yes/no/cancel and
 * message 'please choose one' and title information:
 * <dd><pre>JOptionPane.showInternalConfirmDialog(frame,
 *             "please choose one", "information",
 *             JOptionPane.YES_NO_CANCEL_OPTION, JOptionPane.INFORMATION_MESSAGE);
 * </pre>
 * <dt>Show a warning dialog with the options OK, CANCEL, title 'Warning', and
 * message 'Click OK to continue':
 * <dd><pre>
 * Object[] options = { "OK", "CANCEL" };
 * JOptionPane.showOptionDialog(null, "Click OK to continue", "Warning",
 *             JOptionPane.DEFAULT_OPTION, JOptionPane.WARNING_MESSAGE,
 *             null, options, options[0]);
 * </pre>
 * <dt>Show a dialog asking the user to type in a String:
 * <dd><code>
 * String inputValue = JOptionPane.showInputDialog("Please input a value");
 * </code>
 * <dt>Show a dialog asking the user to select a String:
 * <dd><pre>
 * Object[] possibleValues = { "First", "Second", "Third" };<br>
 * Object selectedValue = JOptionPane.showInputDialog(null,
 *             "Choose one", "Input",
 *             JOptionPane.INFORMATION_MESSAGE, null,
 *             possibleValues, possibleValues[0]);
 * </pre>
 * </dl>
 * <b>Direct Use:</b><br>
 * To create and use an <code>JOptionPane</code> directly, the
 * standard pattern is roughly as follows:
 * <pre>
 *     JOptionPane pane = new JOptionPane(<i>arguments</i>);
 *     pane.set<i>.Xxxx(...); // Configure</i>
 *     JDialog dialog = pane.createDialog(<i>parentComponent, title</i>);
 *     dialog.setVisible(true);
 *     Object selectedValue = pane.getValue();
 *     if(selectedValue == null)
 *       return CLOSED_OPTION;
 *     <i>//If there is <b>not</b> an array of option buttons:</i>
 *     if(options == null) {
 *       if(selectedValue instanceof Integer)
 *          return ((Integer)selectedValue).intValue();
 *       return CLOSED_OPTION;
 *     }
 *     <i>//If there is an array of option buttons:</i>
 *     for(int counter = 0, maxCounter = options.length;
 *        counter &lt; maxCounter; counter++) {
 *        if(options[counter].equals(selectedValue))
 *        return counter;
 *     }
 *     return CLOSED_OPTION;
 * </pre>
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
 * @see JInternalFrame
 *
 * @author James Gosling
 * @author Scott Violet
 * @since 1.2
 */
export class JOptionPane extends JComponent {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'OptionPaneUI';
  /**
   * Indicates that the user has not yet selected a value.
   */
  static UNINITIALIZED_VALUE: any = null;
  /**
   * Type meaning Look and Feel should not supply any options -- only
   * use the options from the <code>JOptionPane</code>.
   */
  static readonly DEFAULT_OPTION: number = -1;
  /**
   * Type used for <code>showConfirmDialog</code>.
   */
  static readonly YES_NO_OPTION: number = 0;
  /**
   * Type used for <code>showConfirmDialog</code>.
   */
  static readonly YES_NO_CANCEL_OPTION: number = 1;
  /**
   * Type used for <code>showConfirmDialog</code>.
   */
  static readonly OK_CANCEL_OPTION: number = 2;
  /**
   * Return value from class method if YES is chosen.
   */
  static readonly YES_OPTION: number = 0;
  /**
   * Return value from class method if NO is chosen.
   */
  static readonly NO_OPTION: number = 1;
  /**
   * Return value from class method if CANCEL is chosen.
   */
  static readonly CANCEL_OPTION: number = 2;
  /**
   * Return value from class method if OK is chosen.
   */
  static readonly OK_OPTION: number = 0;
  /**
   * Return value from class method if user closes window without selecting
   * anything, more than likely this should be treated as either a
   * <code>CANCEL_OPTION</code> or <code>NO_OPTION</code>.
   */
  static readonly CLOSED_OPTION: number = -1;
  /**
   * Used for error messages.
   */
  static readonly ERROR_MESSAGE: number = 0;
  /**
   * Used for information messages.
   */
  static readonly INFORMATION_MESSAGE: number = 1;
  /**
   * Used for warning messages.
   */
  static readonly WARNING_MESSAGE: number = 2;
  /**
   * Used for questions.
   */
  static readonly QUESTION_MESSAGE: number = 3;
  /**
   * No icon is used.
   */
  static readonly PLAIN_MESSAGE: number = -1;
  /**
   * Bound property name for <code>icon</code>.
   */
  static readonly ICON_PROPERTY: string = 'icon';
  /**
   * Bound property name for <code>message</code>.
   */
  static readonly MESSAGE_PROPERTY: string = 'message';
  /**
   * Bound property name for <code>value</code>.
   */
  static readonly VALUE_PROPERTY: string = 'value';
  /**
   * Bound property name for <code>option</code>.
   */
  static readonly OPTIONS_PROPERTY: string = 'options';
  /**
   * Bound property name for <code>initialValue</code>.
   */
  static readonly INITIAL_VALUE_PROPERTY: string = 'initialValue';
  /**
   * Bound property name for <code>type</code>.
   */
  static readonly MESSAGE_TYPE_PROPERTY: string = 'messageType';
  /**
   * Bound property name for <code>optionType</code>.
   */
  static readonly OPTION_TYPE_PROPERTY: string = 'optionType';
  /**
   * Bound property name for <code>selectionValues</code>.
   */
  static readonly SELECTION_VALUES_PROPERTY: string = 'selectionValues';
  /**
   * Bound property name for <code>initialSelectionValue</code>.
   */
  static readonly INITIAL_SELECTION_VALUE_PROPERTY: string = 'initialSelectionValue';
  /**
   * Bound property name for <code>inputValue</code>.
   */
  static readonly INPUT_VALUE_PROPERTY: string = 'inputValue';
  /**
   * Bound property name for <code>wantsInput</code>.
   */
  static readonly WANTS_INPUT_PROPERTY: string = 'wantsInput';
  /**
   * Icon used in pane.
   */
  icon: Icon = null;
  /**
   * Message to display.
   */
  message: any = null;
  /**
   * Options to display to the user.
   */
  options: any[] = null;
  /**
   * Value that should be initially selected in <code>options</code>.
   */
  initialValue: any = null;
  /**
   * Message type.
   */
  messageType: number = 0;
  /**
   * Option type, one of <code>DEFAULT_OPTION</code>,
   * <code>YES_NO_OPTION</code>,
   * <code>YES_NO_CANCEL_OPTION</code> or
   * <code>OK_CANCEL_OPTION</code>.
   */
  optionType: number = 0;
  /**
   * Currently selected value, will be a valid option, or
   * <code>UNINITIALIZED_VALUE</code> or <code>null</code>.
   */
  value_: any = null;
  /**
   * Array of values the user can choose from. Look and feel will
   * provide the UI component to choose this from.
   */
  selectionValues: any[] = null;
  /**
   * Value the user has input.
   */
  inputValue: any = null;
  /**
   * Initial value to select in <code>selectionValues</code>.
   */
  initialSelectionValue: any = null;
  /**
   * If true, a UI widget will be provided to the user to get input.
   */
  wantsInput: boolean = false;
  static sharedFrameKey: any = null;
  /**
   * Creates an instance of <code>JOptionPane</code> to display a message
   * with the specified message type, icon, and options, with the
   * initially-selected option specified.
   *
   * @param message the <code>Object</code> to display
   * @param messageType the type of message to be displayed:
   *                  <code>ERROR_MESSAGE</code>,
   *                  <code>INFORMATION_MESSAGE</code>,
   *                  <code>WARNING_MESSAGE</code>,
   *                  <code>QUESTION_MESSAGE</code>,
   *                  or <code>PLAIN_MESSAGE</code>
   * @param optionType the options to display in the pane:
   *                  <code>DEFAULT_OPTION</code>,
   *                  <code>YES_NO_OPTION</code>,
   *                  <code>YES_NO_CANCEL_OPTION</code>,
   *                  <code>OK_CANCEL_OPTION</code>
   * @param icon the Icon image to display
   * @param options  the choices the user can select
   * @param initialValue the choice that is initially selected; if
   *                  <code>null</code>, then nothing will be initially selected;
   *                  only meaningful if <code>options</code> is used
   */
  _JOptionPane$Object$int$int$Icon$ObjectArr$Object(message: any, messageType: number, optionType: number, icon: Icon, options: any[], initialValue: any): this {
    this._JComponent();
    this.message = message;
    this.options = options == null ? null : Arrays.copyOf(options, options.length);
    this.initialValue = initialValue;
    this.icon = icon;
    this.setMessageType(messageType);
    this.setOptionType(optionType);
    this.value_ = JOptionPane.UNINITIALIZED_VALUE;
    this.inputValue = JOptionPane.UNINITIALIZED_VALUE;
    this.updateUI();
    return this;
  }
  /**
   * Brings up a dialog that displays a message using a default
   * icon determined by the <code>messageType</code> parameter.
   *
   * @param parentComponent determines the <code>Frame</code>
   *          in which the dialog is displayed; if <code>null</code>,
   *          or if the <code>parentComponent</code> has no
   *          <code>Frame</code>, a default <code>Frame</code> is used
   * @param message   the <code>Object</code> to display
   * @param title     the title string for the dialog
   * @param messageType the type of message to be displayed:
   *                  <code>ERROR_MESSAGE</code>,
   *                  <code>INFORMATION_MESSAGE</code>,
   *                  <code>WARNING_MESSAGE</code>,
   *                  <code>QUESTION_MESSAGE</code>,
   *                  or <code>PLAIN_MESSAGE</code>
   * @throws HeadlessException if
   *   <code>GraphicsEnvironment.isHeadless</code> returns
   *   <code>true</code>
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  static showMessageDialog$Component$Object$String$int(parentComponent: Component, message: any, title: string, messageType: number): void {
    JOptionPane.showMessageDialog$Component$Object$String$int$Icon(parentComponent, message, title, messageType, null);
  }
  /**
   * Brings up a dialog displaying a message, specifying all parameters.
   *
   * @param parentComponent determines the <code>Frame</code> in which the
   *                  dialog is displayed; if <code>null</code>,
   *                  or if the <code>parentComponent</code> has no
   *                  <code>Frame</code>, a
   *                  default <code>Frame</code> is used
   * @param message   the <code>Object</code> to display
   * @param title     the title string for the dialog
   * @param messageType the type of message to be displayed:
   *                  <code>ERROR_MESSAGE</code>,
   *                  <code>INFORMATION_MESSAGE</code>,
   *                  <code>WARNING_MESSAGE</code>,
   *                  <code>QUESTION_MESSAGE</code>,
   *                  or <code>PLAIN_MESSAGE</code>
   * @param icon      an icon to display in the dialog that helps the user
   *                  identify the kind of message that is being displayed
   * @throws HeadlessException if
   *   <code>GraphicsEnvironment.isHeadless</code> returns
   *   <code>true</code>
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  static showMessageDialog$Component$Object$String$int$Icon(parentComponent: Component, message: any, title: string, messageType: number, icon: Icon): void {
    JOptionPane.showOptionDialog(parentComponent, message, title, JOptionPane.DEFAULT_OPTION, messageType, icon, null, null);
  }
  /**
   * Brings up a dialog with a specified icon, where the initial
   * choice is determined by the <code>initialValue</code> parameter and
   * the number of choices is determined by the <code>optionType</code>
   * parameter.
   * <p>
   * If <code>optionType</code> is <code>YES_NO_OPTION</code>,
   * or <code>YES_NO_CANCEL_OPTION</code>
   * and the <code>options</code> parameter is <code>null</code>,
   * then the options are
   * supplied by the look and feel.
   * <p>
   * The <code>messageType</code> parameter is primarily used to supply
   * a default icon from the look and feel.
   *
   * @param parentComponent determines the <code>Frame</code>
   *                  in which the dialog is displayed;  if
   *                  <code>null</code>, or if the
   *                  <code>parentComponent</code> has no
   *                  <code>Frame</code>, a
   *                  default <code>Frame</code> is used
   * @param message   the <code>Object</code> to display
   * @param title     the title string for the dialog
   * @param optionType an integer designating the options available on the
   *                  dialog: <code>DEFAULT_OPTION</code>,
   *                  <code>YES_NO_OPTION</code>,
   *                  <code>YES_NO_CANCEL_OPTION</code>,
   *                  or <code>OK_CANCEL_OPTION</code>
   * @param messageType an integer designating the kind of message this is,
   *                  primarily used to determine the icon from the
   *                  pluggable Look and Feel: <code>ERROR_MESSAGE</code>,
   *                  <code>INFORMATION_MESSAGE</code>,
   *                  <code>WARNING_MESSAGE</code>,
   *                  <code>QUESTION_MESSAGE</code>,
   *                  or <code>PLAIN_MESSAGE</code>
   * @param icon      the icon to display in the dialog
   * @param options   an array of objects indicating the possible choices
   *                  the user can make; if the objects are components, they
   *                  are rendered properly; non-<code>String</code>
   *                  objects are
   *                  rendered using their <code>toString</code> methods;
   *                  if this parameter is <code>null</code>,
   *                  the options are determined by the Look and Feel
   * @param initialValue the object that represents the default selection
   *                  for the dialog; only meaningful if <code>options</code>
   *                  is used; can be <code>null</code>
   * @return an integer indicating the option chosen by the user,
   *                  or <code>CLOSED_OPTION</code> if the user closed
   *                  the dialog
   * @throws HeadlessException if
   *   <code>GraphicsEnvironment.isHeadless</code> returns
   *   <code>true</code>
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  static showOptionDialog(parentComponent: Component, message: any, title: string, optionType: number, messageType: number, icon: Icon, options: any[], initialValue: any): number {
    let pane = new JOptionPane()._JOptionPane$Object$int$int$Icon$ObjectArr$Object(message, messageType, optionType, icon, options, initialValue);
    pane.setInitialValue(initialValue);
    pane.setComponentOrientation(((parentComponent == null) ? JOptionPane.getRootFrame() : parentComponent).getComponentOrientation());
    let style = JOptionPane.styleFromMessageType(messageType);
    let dialog = pane.createDialog$Component$String$int$JOptionPane(parentComponent, title, style);
    pane.selectInitialValue();
    dialog.show$();
    dialog.dispose();
    let selectedValue = pane.getValue();
    if (selectedValue == null) {
      return JOptionPane.CLOSED_OPTION;
    }
    if (options == null) {
      if ($J.isa(selectedValue, Integer)) {
        return (+(selectedValue));
      }
      return JOptionPane.CLOSED_OPTION;
    }
    for (let counter = 0, maxCounter = options.length; counter < maxCounter; counter++) {
      if ($J.equals(options[counter], selectedValue)) {
        return counter;
      }
    }
    return JOptionPane.CLOSED_OPTION;
  }
  createDialog$Component$String$int$JOptionPane(parentComponent: Component, title: string, style: number): JDialog {
    let dialog: JDialog;
    let window = JOptionPane.getWindowForComponent(parentComponent);
    if (window instanceof Frame) {
      dialog = new JDialog()._JDialog$Frame$String$boolean(window, title, true);
    } else {
      dialog = new JDialog()._JDialog$Dialog$String$boolean(window, title, true);
    }
    if (window instanceof SwingUtilities$SharedOwnerFrame) {
      let ownerShutdownListener = SwingUtilities.getSharedOwnerFrameShutdownListener();
      dialog.addWindowListener(ownerShutdownListener);
    }
    this.initDialog(dialog, style, parentComponent);
    return dialog;
  }
  initDialog(dialog: JDialog, style: number, parentComponent: Component): void {
    dialog.setComponentOrientation(this.getComponentOrientation());
    let contentPane = dialog.getContentPane();
    contentPane.setLayout(new BorderLayout()._BorderLayout$());
    contentPane.add$Component$Object(this, BorderLayout.CENTER);
    dialog.setResizable(false);
    if (JDialog.isDefaultLookAndFeelDecorated()) {
      let supportsWindowDecorations = UIManager.getLookAndFeel().getSupportsWindowDecorations();
      if (supportsWindowDecorations) {
        dialog.setUndecorated(true);
        this.getRootPane().setWindowDecorationStyle(style);
      }
    }
    dialog.pack();
    dialog.setLocationRelativeTo(parentComponent);
    let listener = (event) => {
      if (dialog.isVisible$() && event.getSource() === this && ($J.equals(event.getPropertyName(), JOptionPane.VALUE_PROPERTY)) && event.getNewValue() != null && event.getNewValue() !== JOptionPane.UNINITIALIZED_VALUE) {
        dialog.setVisible(false);
      }
    };
    let adapter = new (JOptionPane$2())().$o(this).$c(listener, dialog)._WindowAdapter().$init_anon();
    dialog.addWindowListener(adapter);
    dialog.addWindowFocusListener(adapter);
    dialog.addComponentListener(new (JOptionPane$3())().$o(this)._ComponentAdapter());
    this.addPropertyChangeListener$PropertyChangeListener(listener);
  }
  /**
   * Returns the specified component's toplevel <code>Frame</code> or
   * <code>Dialog</code>.
   *
   * @param parentComponent the <code>Component</code> to check for a
   *          <code>Frame</code> or <code>Dialog</code>
   * @return the <code>Frame</code> or <code>Dialog</code> that
   *          contains the component, or the default
   *          frame if the component is <code>null</code>,
   *          or does not have a valid
   *          <code>Frame</code> or <code>Dialog</code> parent
   * @throws HeadlessException if
   *   <code>GraphicsEnvironment.isHeadless</code> returns
   *   <code>true</code>
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  static getWindowForComponent(parentComponent: Component): Window {
    if (parentComponent == null) {
      return JOptionPane.getRootFrame();
    }
    if (parentComponent instanceof Frame || parentComponent instanceof Dialog) {
      return parentComponent;
    }
    return JOptionPane.getWindowForComponent(parentComponent.getParent());
  }
  /**
   * Returns the <code>Frame</code> to use for the class methods in
   * which a frame is not provided.
   *
   * @return the default <code>Frame</code> to use
   * @throws HeadlessException if
   *   <code>GraphicsEnvironment.isHeadless</code> returns
   *   <code>true</code>
   * @see #setRootFrame
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  static getRootFrame(): Frame {
    let sharedFrame = SwingUtilities.appContextGet(JOptionPane.sharedFrameKey);
    if (sharedFrame == null) {
      sharedFrame = SwingUtilities.getSharedOwnerFrame();
      SwingUtilities.appContextPut(JOptionPane.sharedFrameKey, sharedFrame);
    }
    return sharedFrame;
  }
  /**
   * Sets the UI object which implements the {@literal L&F} for this component.
   *
   * @param ui  the <code>OptionPaneUI</code> {@literal L&F} object
   * @see UIDefaults#getUI
   */
  setUI$OptionPaneUI(ui: OptionPaneUI): void {
    if (this.ui !== ui) {
      super.setUI$ComponentUI(ui);
      this.invalidate();
    }
  }
  /**
   * Returns the UI object which implements the {@literal L&F} for this component.
   *
   * @return the <code>OptionPaneUI</code> object
   */
  getUI(): OptionPaneUI {
    return this.ui;
  }
  /**
   * Notification from the <code>UIManager</code> that the {@literal L&F} has changed.
   * Replaces the current UI object with the latest version from the
   * <code>UIManager</code>.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    this.setUI$OptionPaneUI(UIManager.getUI(this));
  }
  /**
   * Returns the name of the UI class that implements the
   * {@literal L&F} for this component.
   *
   * @return the string "OptionPaneUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JOptionPane.uiClassID;
  }
  /**
   * Returns the message-object this pane displays.
   * @see #setMessage
   *
   * @return the <code>Object</code> that is displayed
   */
  getMessage(): any {
    return this.message;
  }
  /**
   * Returns the icon this pane displays.
   * @return the <code>Icon</code> that is displayed
   *
   * @see #setIcon
   */
  getIcon(): Icon {
    return this.icon;
  }
  /**
   * Sets the value the user has chosen.
   * @param newValue  the chosen value
   *
   * @see #getValue
   */
  setValue(newValue: any): void {
    let oldValue = this.value_;
    this.value_ = newValue;
    this.firePropertyChange$String$Object$Object(JOptionPane.VALUE_PROPERTY, oldValue, this.value_);
  }
  /**
   * Returns the value the user has selected. <code>UNINITIALIZED_VALUE</code>
   * implies the user has not yet made a choice, <code>null</code> means the
   * user closed the window with out choosing anything. Otherwise
   * the returned value will be one of the options defined in this
   * object.
   *
   * @return the <code>Object</code> chosen by the user,
   *         <code>UNINITIALIZED_VALUE</code>
   *         if the user has not yet made a choice, or <code>null</code> if
   *         the user closed the window without making a choice
   *
   * @see #setValue
   */
  getValue(): any {
    return this.value_;
  }
  /**
   * Returns the choices the user can make.
   * @return the array of <code>Objects</code> that give the user's choices
   *
   * @see #setOptions
   */
  getOptions(): any[] {
    return this.options == null ? null : Arrays.copyOf(this.options, this.options.length);
  }
  /**
   * Sets the initial value that is to be enabled -- the
   * <code>Component</code>
   * that has the focus when the pane is initially displayed.
   *
   * @param newInitialValue the <code>Object</code> that gets the initial
   *                         keyboard focus
   *
   * @see #getInitialValue
   */
  setInitialValue(newInitialValue: any): void {
    let oldIV = this.initialValue;
    this.initialValue = newInitialValue;
    this.firePropertyChange$String$Object$Object(JOptionPane.INITIAL_VALUE_PROPERTY, oldIV, this.initialValue);
  }
  /**
   * Returns the initial value.
   *
   * @return the <code>Object</code> that gets the initial keyboard focus
   *
   * @see #setInitialValue
   */
  getInitialValue(): any {
    return this.initialValue;
  }
  /**
   * Sets the option pane's message type.
   * The message type is used by the Look and Feel to determine the
   * icon to display (if not supplied) as well as potentially how to
   * lay out the <code>parentComponent</code>.
   * @param newType an integer specifying the kind of message to display:
   *                <code>ERROR_MESSAGE</code>, <code>INFORMATION_MESSAGE</code>,
   *                <code>WARNING_MESSAGE</code>,
   *                <code>QUESTION_MESSAGE</code>, or <code>PLAIN_MESSAGE</code>
   * @throws RuntimeException if <code>newType</code> is not one of the
   *          legal values listed above
   *
   * @see #getMessageType
   */
  setMessageType(newType: number): void {
    JOptionPane.checkMessageType(newType);
    let oldType = this.messageType;
    this.messageType = newType;
    this.firePropertyChange$String$int$int(JOptionPane.MESSAGE_TYPE_PROPERTY, oldType, this.messageType);
  }
  static checkMessageType(newType: number): void {
    if (newType !== JOptionPane.ERROR_MESSAGE && newType !== JOptionPane.INFORMATION_MESSAGE && newType !== JOptionPane.WARNING_MESSAGE && newType !== JOptionPane.QUESTION_MESSAGE && newType !== JOptionPane.PLAIN_MESSAGE) {
      throw new RuntimeException('JOptionPane: type must be one of JOptionPane.ERROR_MESSAGE, JOptionPane.INFORMATION_MESSAGE, JOptionPane.WARNING_MESSAGE, JOptionPane.QUESTION_MESSAGE or JOptionPane.PLAIN_MESSAGE');
    }
  }
  /**
   * Returns the message type.
   *
   * @return an integer specifying the message type
   *
   * @see #setMessageType
   */
  getMessageType(): number {
    return this.messageType;
  }
  /**
   * Sets the options to display.
   * The option type is used by the Look and Feel to
   * determine what buttons to show (unless options are supplied).
   * @param newType an integer specifying the options the {@literal L&F} is to display:
   *                  <code>DEFAULT_OPTION</code>,
   *                  <code>YES_NO_OPTION</code>,
   *                  <code>YES_NO_CANCEL_OPTION</code>,
   *                  or <code>OK_CANCEL_OPTION</code>
   * @throws RuntimeException if <code>newType</code> is not one of
   *          the legal values listed above
   *
   * @see #getOptionType
   * @see #setOptions
   */
  setOptionType(newType: number): void {
    JOptionPane.checkOptionType(newType);
    let oldType = this.optionType;
    this.optionType = newType;
    this.firePropertyChange$String$int$int(JOptionPane.OPTION_TYPE_PROPERTY, oldType, this.optionType);
  }
  static checkOptionType(newType: number): void {
    if (newType !== JOptionPane.DEFAULT_OPTION && newType !== JOptionPane.YES_NO_OPTION && newType !== JOptionPane.YES_NO_CANCEL_OPTION && newType !== JOptionPane.OK_CANCEL_OPTION) {
      throw new RuntimeException('JOptionPane: option type must be one of JOptionPane.DEFAULT_OPTION, JOptionPane.YES_NO_OPTION, JOptionPane.YES_NO_CANCEL_OPTION or JOptionPane.OK_CANCEL_OPTION');
    }
  }
  /**
   * Returns the type of options that are displayed.
   *
   * @return an integer specifying the user-selectable options
   *
   * @see #setOptionType
   */
  getOptionType(): number {
    return this.optionType;
  }
  /**
   * Returns the input selection values.
   *
   * @return the array of <code>Objects</code> the user can select
   * @see #setSelectionValues
   */
  getSelectionValues(): any[] {
    return this.selectionValues == null ? null : Arrays.copyOf(this.selectionValues, this.selectionValues.length);
  }
  /**
   * Returns the input value that is displayed as initially selected to the user.
   *
   * @return the initially selected value
   * @see #setInitialSelectionValue
   * @see #setSelectionValues
   */
  getInitialSelectionValue(): any {
    return this.initialSelectionValue;
  }
  /**
   * Sets the input value that was selected or input by the user.
   * Only used if <code>wantsInput</code> is true.  Note that this method
   * is invoked internally by the option pane (in response to user action)
   * and should generally not be called by client programs.  To set the
   * input value initially displayed as selected to the user, use
   * <code>setInitialSelectionValue</code>.
   *
   * @param newValue the <code>Object</code> used to set the
   *          value that the user specified (usually in a text field)
   * @see #setSelectionValues
   * @see #setInitialSelectionValue
   * @see #setWantsInput
   * @see #getInputValue
   */
  setInputValue(newValue: any): void {
    let oldValue = this.inputValue;
    this.inputValue = newValue;
    this.firePropertyChange$String$Object$Object(JOptionPane.INPUT_VALUE_PROPERTY, oldValue, newValue);
  }
  /**
   * Returns the maximum number of characters to place on a line in a
   * message. Default is to return <code>Integer.MAX_VALUE</code>.
   * The value can be
   * changed by overriding this method in a subclass.
   *
   * @return an integer giving the maximum number of characters on a line
   */
  getMaxCharactersPerLineCount(): number {
    return 2147483647;
  }
  /**
   * Returns the value of the <code>wantsInput</code> property.
   *
   * @return true if an input component will be provided
   * @see #setWantsInput
   */
  getWantsInput(): boolean {
    return this.wantsInput;
  }
  /**
   * Requests that the initial value be selected, which will set
   * focus to the initial value. This method
   * should be invoked after the window containing the option pane
   * is made visible.
   */
  selectInitialValue(): void {
    let ui = this.getUI();
    if (ui != null) {
      ui.selectInitialValue(this);
    }
  }
  static styleFromMessageType(messageType: number): number {
    switch (messageType) {
      case JOptionPane.ERROR_MESSAGE:
        return JRootPane.ERROR_DIALOG;
      case JOptionPane.QUESTION_MESSAGE:
        return JRootPane.QUESTION_DIALOG;
      case JOptionPane.WARNING_MESSAGE:
        return JRootPane.WARNING_DIALOG;
      case JOptionPane.INFORMATION_MESSAGE:
        return JRootPane.INFORMATION_DIALOG;
      case JOptionPane.PLAIN_MESSAGE:
      default:
        return JRootPane.PLAIN_DIALOG;
    }
  }
  /**
   * Returns a string representation of this <code>JOptionPane</code>.
   * This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JOptionPane</code>
   */
  paramString(): string {
    let iconString = (this.icon != null ? this.icon.toString() : '');
    let initialValueString = (this.initialValue != null ? $J.str(this.initialValue) : '');
    let messageString = (this.message != null ? $J.str(this.message) : '');
    let messageTypeString: string;
    if (this.messageType === JOptionPane.ERROR_MESSAGE) {
      messageTypeString = 'ERROR_MESSAGE';
    } else if (this.messageType === JOptionPane.INFORMATION_MESSAGE) {
      messageTypeString = 'INFORMATION_MESSAGE';
    } else if (this.messageType === JOptionPane.WARNING_MESSAGE) {
      messageTypeString = 'WARNING_MESSAGE';
    } else if (this.messageType === JOptionPane.QUESTION_MESSAGE) {
      messageTypeString = 'QUESTION_MESSAGE';
    } else if (this.messageType === JOptionPane.PLAIN_MESSAGE) {
      messageTypeString = 'PLAIN_MESSAGE';
    } else {
      messageTypeString = '';
    }
    let optionTypeString: string;
    if (this.optionType === JOptionPane.DEFAULT_OPTION) {
      optionTypeString = 'DEFAULT_OPTION';
    } else if (this.optionType === JOptionPane.YES_NO_OPTION) {
      optionTypeString = 'YES_NO_OPTION';
    } else if (this.optionType === JOptionPane.YES_NO_CANCEL_OPTION) {
      optionTypeString = 'YES_NO_CANCEL_OPTION';
    } else if (this.optionType === JOptionPane.OK_CANCEL_OPTION) {
      optionTypeString = 'OK_CANCEL_OPTION';
    } else {
      optionTypeString = '';
    }
    let wantsInputString = (this.wantsInput ? 'true' : 'false');
    return super.paramString() + ',icon=' + iconString + ',initialValue=' + initialValueString + ',message=' + messageString + ',messageType=' + messageTypeString + ',optionType=' + optionTypeString + ',wantsInput=' + wantsInputString;
  }
  /**
   * Returns the <code>AccessibleContext</code> associated with this JOptionPane.
   * For option panes, the <code>AccessibleContext</code> takes the form of an
   * <code>AccessibleJOptionPane</code>.
   * A new <code>AccessibleJOptionPane</code> instance is created if necessary.
   *
   * @return an AccessibleJOptionPane that serves as the
   *         AccessibleContext of this AccessibleJOptionPane
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JOptionPane$AccessibleJOptionPane().$o(this)._JOptionPane$AccessibleJOptionPane();
    }
    return this.accessibleContext;
  }
  static $clinit() {
    JOptionPane.UNINITIALIZED_VALUE = 'uninitializedValue';
    JOptionPane.sharedFrameKey = $J.cls(JOptionPane);
  }
}

/**
 * This class implements accessibility support for the
 * <code>JOptionPane</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to option pane user-interface
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
export class JOptionPane$AccessibleJOptionPane extends JComponent$AccessibleJComponent {
  /**
   * Constructs an {@code AccessibleJOptionPane}.
   */
  _JOptionPane$AccessibleJOptionPane(): this {
    this._JComponent$AccessibleJComponent();
    return this;
  }
}

let $JOptionPane$2: any = null;
/** An anonymous class (JOptionPane.java:1015). */
function JOptionPane$2(): any {
  return $JOptionPane$2 ??= $J.local(class extends WindowAdapter {
    gotFocus_: boolean = false;
    $init_anon() {
      this.gotFocus_ = false;
      return this;
    }
    windowClosing(we: WindowEvent): void {
      this.$outer.setValue(null);
    }
    windowClosed(e: WindowEvent): void {
      this.$outer.removePropertyChangeListener$PropertyChangeListener(this.$cv_listener);
      this.$cv_dialog.getContentPane().removeAll();
    }
    windowGainedFocus(we: WindowEvent): void {
      if (!this.gotFocus_) {
        this.$outer.selectInitialValue();
        this.gotFocus_ = true;
      }
    }
    $c($listener, $dialog): this {
      this.$cv_listener = $listener; this.$cv_dialog = $dialog;
      return this;
    }
  }, 'javax.swing.JOptionPane$2', []);
}

let $JOptionPane$3: any = null;
/** An anonymous class (JOptionPane.java:1036). */
function JOptionPane$3(): any {
  return $JOptionPane$3 ??= $J.local(class extends ComponentAdapter {
    componentShown(ce: ComponentEvent): void {
      this.$outer.setValue(JOptionPane.UNINITIALIZED_VALUE);
    }
  }, 'javax.swing.JOptionPane$3', []);
}

$J.define(JOptionPane, 'javax.swing.JOptionPane', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { 'java.lang.Object,int,int,javax.swing.Icon,java.lang.Object[],java.lang.Object': '_JOptionPane$Object$int$int$Icon$ObjectArr$Object', 'java.lang.Object,int,int,javax.swing.Icon,java.lang.Object[]': '_JOptionPane$Object$int$int$Icon$ObjectArr', 'java.lang.Object,int,int,javax.swing.Icon': '_JOptionPane$Object$int$int$Icon', 'java.lang.Object,int,int': '_JOptionPane$Object$int$int', 'java.lang.Object,int': '_JOptionPane$Object$int', 'java.lang.Object': '_JOptionPane$Object', '': '_JOptionPane$' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$JOptionPane', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JOptionPane', 'setUI(javax.swing.plaf.OptionPaneUI)': 'setUI$OptionPaneUI', 'showInternalInputDialog(java.awt.Component,java.lang.Object,java.lang.String,int,javax.swing.Icon,java.lang.Object[],java.lang.Object)': 'showInternalInputDialog$Component$Object$String$int$Icon$ObjectArr$Object', 'showInternalInputDialog(java.awt.Component,java.lang.Object,java.lang.String,int)': 'showInternalInputDialog$Component$Object$String$int', 'showInternalInputDialog(java.awt.Component,java.lang.Object)': 'showInternalInputDialog$Component$Object', 'showInternalConfirmDialog(java.awt.Component,java.lang.Object,java.lang.String,int,int,javax.swing.Icon)': 'showInternalConfirmDialog$Component$Object$String$int$int$Icon', 'showInternalConfirmDialog(java.awt.Component,java.lang.Object,java.lang.String,int,int)': 'showInternalConfirmDialog$Component$Object$String$int$int', 'showInternalConfirmDialog(java.awt.Component,java.lang.Object,java.lang.String,int)': 'showInternalConfirmDialog$Component$Object$String$int', 'showInternalConfirmDialog(java.awt.Component,java.lang.Object)': 'showInternalConfirmDialog$Component$Object', 'showInternalMessageDialog(java.awt.Component,java.lang.Object,java.lang.String,int,javax.swing.Icon)': 'showInternalMessageDialog$Component$Object$String$int$Icon', 'showInternalMessageDialog(java.awt.Component,java.lang.Object,java.lang.String,int)': 'showInternalMessageDialog$Component$Object$String$int', 'showInternalMessageDialog(java.awt.Component,java.lang.Object)': 'showInternalMessageDialog$Component$Object', 'createDialog(java.awt.Component,java.lang.String,int)': 'createDialog$Component$String$int$JOptionPane', 'createDialog(java.lang.String)': 'createDialog$String', 'createDialog(java.awt.Component,java.lang.String)': 'createDialog$Component$String', 'showConfirmDialog(java.awt.Component,java.lang.Object,java.lang.String,int,int,javax.swing.Icon)': 'showConfirmDialog$Component$Object$String$int$int$Icon', 'showConfirmDialog(java.awt.Component,java.lang.Object,java.lang.String,int,int)': 'showConfirmDialog$Component$Object$String$int$int', 'showConfirmDialog(java.awt.Component,java.lang.Object,java.lang.String,int)': 'showConfirmDialog$Component$Object$String$int', 'showConfirmDialog(java.awt.Component,java.lang.Object)': 'showConfirmDialog$Component$Object', 'showMessageDialog(java.awt.Component,java.lang.Object,java.lang.String,int,javax.swing.Icon)': 'showMessageDialog$Component$Object$String$int$Icon', 'showMessageDialog(java.awt.Component,java.lang.Object,java.lang.String,int)': 'showMessageDialog$Component$Object$String$int', 'showMessageDialog(java.awt.Component,java.lang.Object)': 'showMessageDialog$Component$Object', 'showInputDialog(java.awt.Component,java.lang.Object,java.lang.String,int,javax.swing.Icon,java.lang.Object[],java.lang.Object)': 'showInputDialog$Component$Object$String$int$Icon$ObjectArr$Object', 'showInputDialog(java.awt.Component,java.lang.Object,java.lang.String,int)': 'showInputDialog$Component$Object$String$int', 'showInputDialog(java.awt.Component,java.lang.Object,java.lang.Object)': 'showInputDialog$Component$Object$Object', 'showInputDialog(java.awt.Component,java.lang.Object)': 'showInputDialog$Component$Object', 'showInputDialog(java.lang.Object,java.lang.Object)': 'showInputDialog$Object$Object', 'showInputDialog(java.lang.Object)': 'showInputDialog$Object' }, clinit: true, lazy: ['UNINITIALIZED_VALUE', 'sharedFrameKey'] });
$J.define(JOptionPane$AccessibleJOptionPane, 'javax.swing.JOptionPane$AccessibleJOptionPane', { kind: 'class', sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JOptionPane$AccessibleJOptionPane' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  Dialog = $J.load('java.awt.Dialog');
  Frame = $J.load('java.awt.Frame');
  ComponentAdapter = $J.load('java.awt.event.ComponentAdapter');
  WindowAdapter = $J.load('java.awt.event.WindowAdapter');
  JDialog = $J.load('javax.swing.JDialog');
  JRootPane = $J.load('javax.swing.JRootPane');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  SwingUtilities$SharedOwnerFrame = $J.load('javax.swing.SwingUtilities$SharedOwnerFrame');
  UIManager = $J.load('javax.swing.UIManager');
});
