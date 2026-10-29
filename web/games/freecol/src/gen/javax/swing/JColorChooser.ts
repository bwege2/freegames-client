// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JColorChooser.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Arrays, IllegalArgumentException, StringBuilder } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';

let Color, Frame, ColorChooserDialog, ColorChooserDialog$DisposeOnClose, ColorTracker, JOptionPane, UIManager, ColorChooserComponentFactory, DefaultColorSelectionModel;

/**
 * <code>JColorChooser</code> provides a pane of controls designed to allow
 * a user to manipulate and select a color.
 * For information about using color choosers, see
 * <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/colorchooser.html">How to Use Color Choosers</a>,
 * a section in <em>The Java Tutorial</em>.
 *
 * <p>
 *
 * This class provides three levels of API:
 * <ol>
 * <li>A static convenience method which shows a modal color-chooser
 * dialog and returns the color selected by the user.
 * <li>A static convenience method for creating a color-chooser dialog
 * where <code>ActionListeners</code> can be specified to be invoked when
 * the user presses one of the dialog buttons.
 * <li>The ability to create instances of <code>JColorChooser</code> panes
 * directly (within any container). <code>PropertyChange</code> listeners
 * can be added to detect when the current "color" property changes.
 * </ol>
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
 * @author James Gosling
 * @author Amy Fowler
 * @author Steve Wilson
 * @since 1.2
 */
export class JColorChooser extends JComponent {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'ColorChooserUI';
  selectionModel: ColorSelectionModel = null;
  previewPanel: JComponent = null;
  chooserPanels: AbstractColorChooserPanel[] = null;
  dragEnabled: boolean = false;
  /**
   * The selection model property name.
   */
  static readonly SELECTION_MODEL_PROPERTY: string = 'selectionModel';
  /**
   * The preview panel property name.
   */
  static readonly PREVIEW_PANEL_PROPERTY: string = 'previewPanel';
  /**
   * The chooserPanel array property name.
   */
  static readonly CHOOSER_PANELS_PROPERTY: string = 'chooserPanels';
  /**
   * The accessible context.
   */
  accessibleContext$JColorChooser: AccessibleContext = null;
  $init_JColorChooser() {
    this.previewPanel = ColorChooserComponentFactory.getPreviewPanel();
    this.chooserPanels = $J.newArray(0, null);
    this.accessibleContext$JColorChooser = null;
  }
  /**
   * Creates a color chooser pane with an initial color of white.
   */
  _JColorChooser$(): this {
    this._JColorChooser$Color(Color.white);
    return this;
  }
  /**
   * Creates a color chooser pane with the specified initial color.
   *
   * @param initialColor the initial color set in the chooser
   */
  _JColorChooser$Color(initialColor: Color): this {
    this._JColorChooser$ColorSelectionModel(new DefaultColorSelectionModel()._DefaultColorSelectionModel$Color(initialColor));
    return this;
  }
  /**
   * Creates a color chooser pane with the specified
   * <code>ColorSelectionModel</code>.
   *
   * @param model the <code>ColorSelectionModel</code> to be used
   */
  _JColorChooser$ColorSelectionModel(model: ColorSelectionModel): this {
    this._JComponent();
    this.$init_JColorChooser();
    this.selectionModel = model;
    this.updateUI();
    this.dragEnabled = false;
    return this;
  }
  /**
   * Shows a modal color-chooser dialog and blocks until the
   * dialog is hidden.  If the user presses the "OK" button, then
   * this method hides/disposes the dialog and returns the selected color.
   * If the user presses the "Cancel" button or closes the dialog without
   * pressing "OK", then this method hides/disposes the dialog and returns
   * <code>null</code>.
   *
   * @param component    the parent <code>Component</code> for the dialog
   * @param title        the String containing the dialog's title
   * @param initialColor the initial Color set when the color-chooser is shown
   * @return the selected color or <code>null</code> if the user opted out
   * @throws HeadlessException if GraphicsEnvironment.isHeadless()
   * returns true.
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  static showDialog$Component$String$Color(component: Component, title: string, initialColor: Color): Color {
    return JColorChooser.showDialog$Component$String$Color$boolean(component, title, initialColor, true);
  }
  /**
   * Shows a modal color-chooser dialog and blocks until the
   * dialog is hidden.  If the user presses the "OK" button, then
   * this method hides/disposes the dialog and returns the selected color.
   * If the user presses the "Cancel" button or closes the dialog without
   * pressing "OK", then this method hides/disposes the dialog and returns
   * <code>null</code>.
   *
   * @param component    the parent <code>Component</code> for the dialog
   * @param title        the String containing the dialog's title
   * @param initialColor the initial Color set when the color-chooser is shown
   * @param colorTransparencySelectionEnabled true if the transparency of
   *            a color can be selected
   * @return the selected color or <code>null</code> if the user opted out
   * @throws HeadlessException if GraphicsEnvironment.isHeadless()
   * returns true.
   *
   * @see java.awt.GraphicsEnvironment#isHeadless
   * @since 9
   */
  static showDialog$Component$String$Color$boolean(component: Component, title: string, initialColor: Color, colorTransparencySelectionEnabled: boolean): Color {
    let pane = new JColorChooser()._JColorChooser$Color(initialColor != null ? initialColor : Color.white);
    for (let ccPanel of pane.getChooserPanels()) {
      ccPanel.setColorTransparencySelectionEnabled(colorTransparencySelectionEnabled);
    }
    let ok = new ColorTracker()._ColorTracker(pane);
    let dialog = JColorChooser.createDialog(component, title, true, pane, $J.fn(ok, 'actionPerformed'), null);
    dialog.addComponentListener(new ColorChooserDialog$DisposeOnClose()._ColorChooserDialog$DisposeOnClose());
    dialog.show$();
    return ok.getColor();
  }
  /**
   * Creates and returns a new dialog containing the specified
   * <code>ColorChooser</code> pane along with "OK", "Cancel", and "Reset"
   * buttons. If the "OK" or "Cancel" buttons are pressed, the dialog is
   * automatically hidden (but not disposed).  If the "Reset"
   * button is pressed, the color-chooser's color will be reset to the
   * color which was set the last time <code>show</code> was invoked on the
   * dialog and the dialog will remain showing.
   *
   * @param c              the parent component for the dialog
   * @param title          the title for the dialog
   * @param modal          a boolean. When true, the remainder of the program
   *                       is inactive until the dialog is closed.
   * @param chooserPane    the color-chooser to be placed inside the dialog
   * @param okListener     the ActionListener invoked when "OK" is pressed
   * @param cancelListener the ActionListener invoked when "Cancel" is pressed
   * @return a new dialog containing the color-chooser pane
   * @throws HeadlessException if GraphicsEnvironment.isHeadless()
   * returns true.
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  static createDialog(c: Component, title: string, modal: boolean, chooserPane: JColorChooser, okListener: ActionListener, cancelListener: ActionListener): JDialog {
    let window = JOptionPane.getWindowForComponent(c);
    let dialog: ColorChooserDialog;
    if (window instanceof Frame) {
      dialog = new ColorChooserDialog()._ColorChooserDialog$Frame$String$boolean$Component$JColorChooser$ActionListener$ActionListener(window, title, modal, c, chooserPane, okListener, cancelListener);
    } else {
      dialog = new ColorChooserDialog()._ColorChooserDialog$Dialog$String$boolean$Component$JColorChooser$ActionListener$ActionListener(window, title, modal, c, chooserPane, okListener, cancelListener);
    }
    dialog.getAccessibleContext().setAccessibleDescription(title);
    return dialog;
  }
  /**
   * Sets the L&amp;F object that renders this component.
   *
   * @param ui  the <code>ColorChooserUI</code> L&amp;F object
   * @see UIDefaults#getUI
   */
  setUI$ColorChooserUI(ui: ColorChooserUI): void {
    super.setUI$ComponentUI(ui);
  }
  /**
   * Notification from the <code>UIManager</code> that the L&amp;F has changed.
   * Replaces the current UI object with the latest version from the
   * <code>UIManager</code>.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    this.setUI$ColorChooserUI(UIManager.getUI(this));
  }
  /**
   * Returns the name of the L&amp;F class that renders this component.
   *
   * @return the string "ColorChooserUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JColorChooser.uiClassID;
  }
  /**
   * Gets the current color value from the color chooser.
   * By default, this delegates to the model.
   *
   * @return the current color value of the color chooser
   */
  getColor(): Color {
    return this.selectionModel.getSelectedColor();
  }
  /**
   * Sets the current color of the color chooser to the specified color.
   * The <code>ColorSelectionModel</code> will fire a <code>ChangeEvent</code>
   * @param color the color to be set in the color chooser
   * @see JComponent#addPropertyChangeListener
   */
  setColor$Color(color: Color): void {
    this.selectionModel.setSelectedColor(color);
  }
  /**
   * Gets the value of the <code>dragEnabled</code> property.
   *
   * @return  the value of the <code>dragEnabled</code> property
   * @see #setDragEnabled
   * @since 1.4
   */
  getDragEnabled(): boolean {
    return this.dragEnabled;
  }
  /**
   * Returns the preview panel that shows a chosen color.
   *
   * @return a <code>JComponent</code> object -- the preview panel
   */
  getPreviewPanel(): JComponent {
    return this.previewPanel;
  }
  /**
   * Removes the Color Panel specified.
   *
   * @param panel   a string that specifies the panel to be removed
   * @return the color panel
   * @throws IllegalArgumentException if panel is not in list of
   *                  known chooser panels
   */
  removeChooserPanel(panel: AbstractColorChooserPanel): AbstractColorChooserPanel {
    let containedAt = -1;
    for (let i = 0; i < this.chooserPanels.length; i++) {
      if (this.chooserPanels[i] === panel) {
        containedAt = i;
        break;
      }
    }
    if (containedAt === -1) {
      throw new IllegalArgumentException('chooser panel not in this chooser');
    }
    let newArray = $J.newArray((this.chooserPanels.length - 1) | 0, null);
    if (containedAt === ((this.chooserPanels.length - 1) | 0)) {
      $J.system_arraycopy(this.chooserPanels, 0, newArray, 0, newArray.length);
    } else if (containedAt === 0) {
      $J.system_arraycopy(this.chooserPanels, 1, newArray, 0, newArray.length);
    } else {
      $J.system_arraycopy(this.chooserPanels, 0, newArray, 0, containedAt);
      $J.system_arraycopy(this.chooserPanels, (containedAt + 1) | 0, newArray, containedAt, ((this.chooserPanels.length - containedAt - 1) | 0));
    }
    this.setChooserPanels(newArray);
    return panel;
  }
  /**
   * Specifies the Color Panels used to choose a color value.
   *
   * @param panels  an array of <code>AbstractColorChooserPanel</code>
   *          objects
   */
  setChooserPanels(panels: AbstractColorChooserPanel[]): void {
    let oldValue = this.chooserPanels;
    this.chooserPanels = Arrays.copyOf(panels, panels.length);
    this.firePropertyChange$String$Object$Object(JColorChooser.CHOOSER_PANELS_PROPERTY, oldValue, panels);
  }
  /**
   * Returns the specified color panels.
   *
   * @return an array of <code>AbstractColorChooserPanel</code> objects
   */
  getChooserPanels(): AbstractColorChooserPanel[] {
    return Arrays.copyOf(this.chooserPanels, this.chooserPanels.length);
  }
  /**
   * Returns the data model that handles color selections.
   *
   * @return a <code>ColorSelectionModel</code> object
   */
  getSelectionModel(): ColorSelectionModel {
    return this.selectionModel;
  }
  /**
   * Returns a string representation of this <code>JColorChooser</code>.
   * This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JColorChooser</code>
   */
  paramString(): string {
    let chooserPanelsString = new StringBuilder();
    for (let panel of this.chooserPanels) {
      chooserPanelsString.append(String.fromCharCode(91 /* '[' */)).append($J.str(panel)).append(String.fromCharCode(93 /* ']' */));
    }
    let previewPanelString = (this.previewPanel != null ? this.previewPanel.toString() : '');
    return super.paramString() + ',chooserPanels=' + chooserPanelsString.toString() + ',previewPanel=' + previewPanelString;
  }
  /**
   * Gets the AccessibleContext associated with this JColorChooser.
   * For color choosers, the AccessibleContext takes the form of an
   * AccessibleJColorChooser.
   * A new AccessibleJColorChooser instance is created if necessary.
   *
   * @return an AccessibleJColorChooser that serves as the
   *         AccessibleContext of this JColorChooser
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext$JColorChooser == null) {
      this.accessibleContext$JColorChooser = new JColorChooser$AccessibleJColorChooser().$o(this)._JColorChooser$AccessibleJColorChooser();
    }
    return this.accessibleContext$JColorChooser;
  }
}

/**
 * This class implements accessibility support for the
 * <code>JColorChooser</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to color chooser user-interface
 * elements.
 */
export class JColorChooser$AccessibleJColorChooser extends JComponent$AccessibleJComponent {
  /**
   * Constructs an {@code AccessibleJColorChooser}.
   */
  _JColorChooser$AccessibleJColorChooser(): this {
    this._JComponent$AccessibleJComponent();
    return this;
  }
}

$J.define(JColorChooser, 'javax.swing.JColorChooser', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { 'javax.swing.colorchooser.ColorSelectionModel': '_JColorChooser$ColorSelectionModel', 'java.awt.Color': '_JColorChooser$Color', '': '_JColorChooser$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JColorChooser', 'setColor(int)': 'setColor$int', 'setColor(int,int,int)': 'setColor$int$int$int', 'setColor(java.awt.Color)': 'setColor$Color', 'setUI(javax.swing.plaf.ColorChooserUI)': 'setUI$ColorChooserUI', 'showDialog(java.awt.Component,java.lang.String,java.awt.Color,boolean)': 'showDialog$Component$String$Color$boolean', 'showDialog(java.awt.Component,java.lang.String,java.awt.Color)': 'showDialog$Component$String$Color' } });
$J.define(JColorChooser$AccessibleJColorChooser, 'javax.swing.JColorChooser$AccessibleJColorChooser', { kind: 'class', sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JColorChooser$AccessibleJColorChooser' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Frame = $J.load('java.awt.Frame');
  ColorChooserDialog = $J.load('javax.swing.ColorChooserDialog');
  ColorChooserDialog$DisposeOnClose = $J.load('javax.swing.ColorChooserDialog$DisposeOnClose');
  ColorTracker = $J.load('javax.swing.ColorTracker');
  JOptionPane = $J.load('javax.swing.JOptionPane');
  UIManager = $J.load('javax.swing.UIManager');
  ColorChooserComponentFactory = $J.load('javax.swing.colorchooser.ColorChooserComponentFactory');
  DefaultColorSelectionModel = $J.load('javax.swing.colorchooser.DefaultColorSelectionModel');
});
