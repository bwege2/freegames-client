// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, StringBuffer, SunToolkit } from '../../../jre/index.ts';
import { Dialog } from '../../java/awt/Dialog.ts';
import { Dialog$AccessibleAWTDialog } from '../../java/awt/Dialog.ts';

let AWTEvent, BorderLayout, WindowEvent, JComponent, JRootPane, RepaintManager, SwingUtilities, UIManager, WindowConstants;

/**
 * The main class for creating a dialog window. You can use this class
 * to create a custom dialog, or invoke the many class methods
 * in {@link JOptionPane} to create a variety of standard dialogs.
 * For information about creating dialogs, see
 * <em>The Java Tutorial</em> section
 * <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/dialog.html">How
 * to Make Dialogs</a>.
 *
 * <p>
 *
 * The {@code JDialog} component contains a {@code JRootPane}
 * as its only child.
 * The {@code contentPane} should be the parent of any children of the
 * {@code JDialog}.
 * As a convenience, the {@code add}, {@code remove}, and {@code setLayout}
 * methods of this class are overridden, so that they delegate calls
 * to the corresponding methods of the {@code ContentPane}.
 * For example, you can add a child component to a dialog as follows:
 * <pre>
 *       dialog.add(child);
 * </pre>
 * And the child will be added to the contentPane.
 * The {@code contentPane} is always non-{@code null}.
 * Attempting to set it to {@code null} generates an exception.
 * The default {@code contentPane} has a {@code BorderLayout}
 * manager set on it.
 * Refer to {@link javax.swing.RootPaneContainer}
 * for details on adding, removing and setting the {@code LayoutManager}
 * of a {@code JDialog}.
 * <p>
 * Please see the {@code JRootPane} documentation for a complete
 * description of the {@code contentPane}, {@code glassPane},
 * and {@code layeredPane} components.
 * <p>
 * In a multi-screen environment, you can create a {@code JDialog}
 * on a different screen device than its owner.  See {@link java.awt.Frame} for
 * more information.
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
 * has been added to the {@code java.beans} package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @see JOptionPane
 * @see JRootPane
 * @see javax.swing.RootPaneContainer
 *
 * @author David Kloba
 * @author James Gosling
 * @author Scott Violet
 * @since 1.2
 */
export class JDialog extends Dialog {
  /**
   * Key into the AppContext, used to check if should provide decorations
   * by default.
   */
  static defaultLookAndFeelDecoratedKey: any = null;
  defaultCloseOperation: number = 0;
  /**
   * The <code>JRootPane</code> instance that manages the
   * <code>contentPane</code>.
   *
   * @see #getRootPane
   * @see #setRootPane
   */
  rootPane: JRootPane = null;
  /**
   * If true then calls to {@code add} and {@code setLayout}
   * will be forwarded to the {@code contentPane}. This is initially
   * false, but is set to true when the {@code JDialog} is constructed.
   *
   * @see #isRootPaneCheckingEnabled
   * @see #setRootPaneCheckingEnabled
   * @see javax.swing.RootPaneContainer
   */
  rootPaneCheckingEnabled: boolean = false;
  /**
   * The {@code TransferHandler} for this dialog.
   */
  transferHandler: TransferHandler = null;
  /**
   * {@code AccessibleContext} associated with this {@code JDialog}
   */
  accessibleContext$JDialog: AccessibleContext = null;
  $init_JDialog() {
    this.defaultCloseOperation = WindowConstants.HIDE_ON_CLOSE;
    this.rootPaneCheckingEnabled = false;
    this.accessibleContext$JDialog = null;
  }
  /**
   * Creates a modeless dialog with the specified {@code Frame}
   * as its owner and an empty title. If {@code owner}
   * is {@code null}, a shared, hidden frame will be set as the
   * owner of the dialog.
   * <p>
   * This constructor sets the component's locale property to the value
   * returned by {@code JComponent.getDefaultLocale}.
   * <p>
   * NOTE: This constructor does not allow you to create an unowned
   * {@code JDialog}. To create an unowned {@code JDialog}
   * you must use either the {@code JDialog(Window)} or
   * {@code JDialog(Dialog)} constructor with an argument of
   * {@code null}.
   *
   * @param owner the {@code Frame} from which the dialog is displayed
   * @throws HeadlessException if {@code GraphicsEnvironment.isHeadless()}
   *     returns {@code true}.
   * @see java.awt.GraphicsEnvironment#isHeadless
   * @see JComponent#getDefaultLocale
   */
  _JDialog$Frame(owner: Frame): this {
    this._JDialog$Frame$boolean(owner, false);
    return this;
  }
  /**
   * Creates a dialog with an empty title and the specified modality and
   * {@code Frame} as its owner. If {@code owner} is {@code null},
   * a shared, hidden frame will be set as the owner of the dialog.
   * <p>
   * This constructor sets the component's locale property to the value
   * returned by {@code JComponent.getDefaultLocale}.
   * <p>
   * NOTE: This constructor does not allow you to create an unowned
   * {@code JDialog}. To create an unowned {@code JDialog}
   * you must use either the {@code JDialog(Window)} or
   * {@code JDialog(Dialog)} constructor with an argument of
   * {@code null}.
   *
   * @param owner the {@code Frame} from which the dialog is displayed
   * @param modal specifies whether dialog blocks user input to other top-level
   *     windows when shown. If {@code true}, the modality type property is set to
   *     {@code DEFAULT_MODALITY_TYPE}, otherwise the dialog is modeless.
   * @throws HeadlessException if {@code GraphicsEnvironment.isHeadless()}
   *     returns {@code true}.
   * @see java.awt.GraphicsEnvironment#isHeadless
   * @see JComponent#getDefaultLocale
   */
  _JDialog$Frame$boolean(owner: Frame, modal: boolean): this {
    this._JDialog$Frame$String$boolean(owner, '', modal);
    return this;
  }
  /**
   * Creates a dialog with the specified title, owner {@code Frame}
   * and modality. If {@code owner} is {@code null},
   * a shared, hidden frame will be set as the owner of this dialog.
   * <p>
   * This constructor sets the component's locale property to the value
   * returned by {@code JComponent.getDefaultLocale}.
   * <p>
   * NOTE: Any popup components ({@code JComboBox},
   * {@code JPopupMenu}, {@code JMenuBar})
   * created within a modal dialog will be forced to be lightweight.
   * <p>
   * NOTE: This constructor does not allow you to create an unowned
   * {@code JDialog}. To create an unowned {@code JDialog}
   * you must use either the {@code JDialog(Window)} or
   * {@code JDialog(Dialog)} constructor with an argument of
   * {@code null}.
   *
   * @param owner the {@code Frame} from which the dialog is displayed
   * @param title  the {@code String} to display in the dialog's
   *     title bar
   * @param modal specifies whether dialog blocks user input to other top-level
   *     windows when shown. If {@code true}, the modality type property is set to
   *     {@code DEFAULT_MODALITY_TYPE} otherwise the dialog is modeless
   * @throws HeadlessException if {@code GraphicsEnvironment.isHeadless()}
   *     returns {@code true}.
   *
   * @see java.awt.Dialog.ModalityType
   * @see java.awt.Dialog.ModalityType#MODELESS
   * @see java.awt.Dialog#DEFAULT_MODALITY_TYPE
   * @see java.awt.Dialog#setModal
   * @see java.awt.Dialog#setModalityType
   * @see java.awt.GraphicsEnvironment#isHeadless
   * @see JComponent#getDefaultLocale
   */
  _JDialog$Frame$String$boolean(owner: Frame, title: string, modal: boolean): this {
    this._Dialog$Frame$String$boolean(owner == null ? SwingUtilities.getSharedOwnerFrame() : owner, title, modal);
    this.$init_JDialog();
    if (owner == null) {
      let ownerShutdownListener = SwingUtilities.getSharedOwnerFrameShutdownListener();
      this.addWindowListener(ownerShutdownListener);
    }
    this.dialogInit();
    return this;
  }
  /**
   * Creates a dialog with the specified title, modality
   * and the specified owner {@code Dialog}.
   * <p>
   * This constructor sets the component's locale property to the value
   * returned by {@code JComponent.getDefaultLocale}.
   *
   * @param owner the owner {@code Dialog} from which the dialog is displayed
   *     or {@code null} if this dialog has no owner
   * @param title  the {@code String} to display in the dialog's
   *     title bar
   * @param modal specifies whether dialog blocks user input to other top-level
   *     windows when shown. If {@code true}, the modality type property is set to
   *     {@code DEFAULT_MODALITY_TYPE}, otherwise the dialog is modeless
   * @throws HeadlessException if {@code GraphicsEnvironment.isHeadless()}
   *     returns {@code true}.
   * @see java.awt.Dialog.ModalityType
   * @see java.awt.Dialog.ModalityType#MODELESS
   * @see java.awt.Dialog#DEFAULT_MODALITY_TYPE
   * @see java.awt.Dialog#setModal
   * @see java.awt.Dialog#setModalityType
   * @see java.awt.GraphicsEnvironment#isHeadless
   * @see JComponent#getDefaultLocale
   */
  _JDialog$Dialog$String$boolean(owner: Dialog, title: string, modal: boolean): this {
    this._Dialog$Dialog$String$boolean(owner, title, modal);
    this.$init_JDialog();
    this.dialogInit();
    return this;
  }
  /**
   * Called by the constructors to init the {@code JDialog} properly.
   */
  dialogInit(): void {
    this.enableEvents($J.lor(AWTEvent.KEY_EVENT_MASK, AWTEvent.WINDOW_EVENT_MASK));
    this.setLocale(JComponent.getDefaultLocale());
    this.setRootPane(this.createRootPane());
    this.setBackground(UIManager.getColor$Object('control'));
    this.setRootPaneCheckingEnabled(true);
    if (JDialog.isDefaultLookAndFeelDecorated()) {
      let supportsWindowDecorations = UIManager.getLookAndFeel().getSupportsWindowDecorations();
      if (supportsWindowDecorations) {
        this.setUndecorated(true);
        this.getRootPane().setWindowDecorationStyle(JRootPane.PLAIN_DIALOG);
      }
    }
    SunToolkit.checkAndSetPolicy(this);
  }
  /**
   * Called by the constructor methods to create the default
   * {@code rootPane}.
   *
   * @return  a new {@code JRootPane}
   */
  createRootPane(): JRootPane {
    let rp = new JRootPane()._JRootPane();
    rp.setOpaque(true);
    return rp;
  }
  /**
   * Handles window events depending on the state of the
   * {@code defaultCloseOperation} property.
   *
   * @see #setDefaultCloseOperation
   */
  processWindowEvent(e: WindowEvent): void {
    super.processWindowEvent(e);
    if (e.getID() === WindowEvent.WINDOW_CLOSING) {
      switch (this.defaultCloseOperation) {
        case WindowConstants.HIDE_ON_CLOSE:
          this.setVisible(false);
          break;
        case WindowConstants.DISPOSE_ON_CLOSE:
          this.dispose();
          break;
        case WindowConstants.DO_NOTHING_ON_CLOSE:
        default:
          break;
      }
    }
  }
  /**
   * Returns whether calls to {@code add} and
   * {@code setLayout} are forwarded to the {@code contentPane}.
   *
   * @return true if {@code add} and {@code setLayout}
   *         are forwarded; false otherwise
   *
   * @see #addImpl
   * @see #setLayout
   * @see #setRootPaneCheckingEnabled
   * @see javax.swing.RootPaneContainer
   */
  isRootPaneCheckingEnabled(): boolean {
    return this.rootPaneCheckingEnabled;
  }
  /**
   * Sets whether calls to {@code add} and
   * {@code setLayout} are forwarded to the {@code contentPane}.
   *
   * @param enabled  true if {@code add} and {@code setLayout}
   *        are forwarded, false if they should operate directly on the
   *        {@code JDialog}.
   *
   * @see #addImpl
   * @see #setLayout
   * @see #isRootPaneCheckingEnabled
   * @see javax.swing.RootPaneContainer
   */
  setRootPaneCheckingEnabled(enabled: boolean): void {
    this.rootPaneCheckingEnabled = enabled;
  }
  /**
   * Adds the specified child {@code Component}.
   * This method is overridden to conditionally forward calls to the
   * {@code contentPane}.
   * By default, children are added to the {@code contentPane} instead
   * of the frame, refer to {@link javax.swing.RootPaneContainer} for
   * details.
   *
   * @param comp the component to be enhanced
   * @param constraints the constraints to be respected
   * @param index the index
   * @throws IllegalArgumentException if {@code index} is invalid
   * @throws IllegalArgumentException if adding the container's parent
   *                  to itself
   * @throws IllegalArgumentException if adding a window to a container
   *
   * @see #setRootPaneCheckingEnabled
   * @see javax.swing.RootPaneContainer
   */
  addImpl(comp: Component, constraints: any, index: number): void {
    if (this.isRootPaneCheckingEnabled()) {
      this.getContentPane().add$Component$Object$int(comp, constraints, index);
    } else {
      super.addImpl(comp, constraints, index);
    }
  }
  /**
   * Removes the specified component from the container. If
   * {@code comp} is not the {@code rootPane}, this will forward
   * the call to the {@code contentPane}. This will do nothing if
   * {@code comp} is not a child of the {@code JDialog} or
   * {@code contentPane}.
   *
   * @param comp the component to be removed
   * @throws NullPointerException if {@code comp} is null
   * @see #add
   * @see javax.swing.RootPaneContainer
   */
  remove$Component(comp: Component): void {
    if (comp === this.rootPane) {
      super.remove$Component(comp);
    } else {
      this.getContentPane().remove$Component(comp);
    }
  }
  /**
   * Sets the {@code LayoutManager}.
   * Overridden to conditionally forward the call to the
   * {@code contentPane}.
   * Refer to {@link javax.swing.RootPaneContainer} for
   * more information.
   *
   * @param manager the {@code LayoutManager}
   * @see #setRootPaneCheckingEnabled
   * @see javax.swing.RootPaneContainer
   */
  setLayout(manager: LayoutManager): void {
    if (this.isRootPaneCheckingEnabled()) {
      this.getContentPane().setLayout(manager);
    } else {
      super.setLayout(manager);
    }
  }
  /**
   * Returns the {@code rootPane} object for this dialog.
   *
   * @see #setRootPane
   * @see RootPaneContainer#getRootPane
   */
  getRootPane(): JRootPane {
    return this.rootPane;
  }
  /**
   * Sets the {@code rootPane} property.
   * This method is called by the constructor.
   *
   * @param root the {@code rootPane} object for this dialog
   *
   * @see #getRootPane
   */
  setRootPane(root: JRootPane): void {
    if (this.rootPane != null) {
      this.remove$Component(this.rootPane);
    }
    this.rootPane = root;
    if (this.rootPane != null) {
      let checkingEnabled = this.isRootPaneCheckingEnabled();
      try {
        this.setRootPaneCheckingEnabled(false);
        this.add$Component$Object(this.rootPane, BorderLayout.CENTER);
      } finally {
        this.setRootPaneCheckingEnabled(checkingEnabled);
      }
    }
  }
  /**
   * Returns the {@code contentPane} object for this dialog.
   *
   * @return the {@code contentPane} property
   *
   * @see #setContentPane
   * @see RootPaneContainer#getContentPane
   */
  getContentPane(): Container {
    return this.getRootPane().getContentPane();
  }
  /**
   * Returns the {@code layeredPane} object for this dialog.
   *
   * @return the {@code layeredPane} property
   *
   * @see #setLayeredPane
   * @see RootPaneContainer#getLayeredPane
   */
  getLayeredPane(): JLayeredPane {
    return this.getRootPane().getLayeredPane();
  }
  /**
   * Returns the {@code glassPane} object for this dialog.
   *
   * @return the {@code glassPane} property
   *
   * @see #setGlassPane
   * @see RootPaneContainer#getGlassPane
   */
  getGlassPane(): Component {
    return this.getRootPane().getGlassPane();
  }
  /**
   * {@inheritDoc}
   *
   * @since 1.6
   */
  getGraphics(): Graphics {
    JComponent.getGraphicsInvoked(this);
    return super.getGraphics();
  }
  /**
   * Repaints the specified rectangle of this component within
   * {@code time} milliseconds.  Refer to {@code RepaintManager}
   * for details on how the repaint is handled.
   *
   * @param     time   maximum time in milliseconds before update
   * @param     x    the <i>x</i> coordinate
   * @param     y    the <i>y</i> coordinate
   * @param     width    the width
   * @param     height   the height
   * @see       RepaintManager
   * @since     1.6
   */
  repaint$long$int$int$int$int(time: number, x: number, y: number, width: number, height: number): void {
    if (RepaintManager.HANDLE_TOP_LEVEL_PAINT) {
      RepaintManager.currentManager$Component(this).addDirtyRegion$Window$int$int$int$int(this, x, y, width, height);
    } else {
      super.repaint$long$int$int$int$int(time, x, y, width, height);
    }
  }
  /**
   * Returns true if newly created {@code JDialog}s should have their
   * Window decorations provided by the current look and feel. This is only
   * a hint, as certain look and feels may not support this feature.
   *
   * @return true if look and feel should provide Window decorations.
   * @since 1.4
   */
  static isDefaultLookAndFeelDecorated(): boolean {
    let defaultLookAndFeelDecorated = SwingUtilities.appContextGet(JDialog.defaultLookAndFeelDecoratedKey);
    if (defaultLookAndFeelDecorated == null) {
      defaultLookAndFeelDecorated = false;
    }
    return defaultLookAndFeelDecorated;
  }
  /**
   * Returns a string representation of this {@code JDialog}.
   * This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be {@code null}.
   *
   * @return  a string representation of this {@code JDialog}.
   */
  paramString(): string {
    let defaultCloseOperationString: string;
    if (this.defaultCloseOperation === WindowConstants.HIDE_ON_CLOSE) {
      defaultCloseOperationString = 'HIDE_ON_CLOSE';
    } else if (this.defaultCloseOperation === WindowConstants.DISPOSE_ON_CLOSE) {
      defaultCloseOperationString = 'DISPOSE_ON_CLOSE';
    } else if (this.defaultCloseOperation === WindowConstants.DO_NOTHING_ON_CLOSE) {
      defaultCloseOperationString = 'DO_NOTHING_ON_CLOSE';
    } else {
      defaultCloseOperationString = '';
    }
    let rootPaneString = (this.rootPane != null ? this.rootPane.toString() : '');
    let rootPaneCheckingEnabledString = (this.rootPaneCheckingEnabled ? 'true' : 'false');
    return super.paramString() + ',defaultCloseOperation=' + defaultCloseOperationString + ',rootPane=' + rootPaneString + ',rootPaneCheckingEnabled=' + rootPaneCheckingEnabledString;
  }
  /**
   * Gets the AccessibleContext associated with this JDialog.
   * For JDialogs, the AccessibleContext takes the form of an
   * AccessibleJDialog.
   * A new AccessibleJDialog instance is created if necessary.
   *
   * @return an AccessibleJDialog that serves as the
   *         AccessibleContext of this JDialog
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext$JDialog == null) {
      this.accessibleContext$JDialog = new JDialog$AccessibleJDialog().$o(this)._JDialog$AccessibleJDialog();
    }
    return this.accessibleContext$JDialog;
  }
  static $clinit() {
    JDialog.defaultLookAndFeelDecoratedKey = new StringBuffer('JDialog.defaultLookAndFeelDecorated');
  }
}

/**
 * This class implements accessibility support for the
 * {@code JDialog} class.  It provides an implementation of the
 * Java Accessibility API appropriate to dialog user-interface
 * elements.
 */
export class JDialog$AccessibleJDialog extends Dialog$AccessibleAWTDialog {
  /**
   * Constructs an {@code AccessibleJDialog}.
   */
  _JDialog$AccessibleJDialog(): this {
    this._Dialog$AccessibleAWTDialog();
    return this;
  }
  /**
   * Get the accessible name of this object.
   *
   * @return the localized name of the object -- can be null if this
   * object does not have a name
   */
  getAccessibleName(): string {
    if (this.accessibleName != null) {
      return this.accessibleName;
    } else {
      if (this.$outer.getTitle() == null) {
        return super.getAccessibleName();
      } else {
        return this.$outer.getTitle();
      }
    }
  }
}

$J.define(JDialog, 'javax.swing.JDialog', { kind: 'class', ifaces: ['javax.swing.WindowConstants', 'javax.accessibility.Accessible', 'javax.swing.RootPaneContainer', 'javax.swing.TransferHandler$HasGetTransferHandler'], sup: 'java.awt.Dialog', ctors: { 'java.awt.Window,java.lang.String,java.awt.Dialog$ModalityType,java.awt.GraphicsConfiguration': '_JDialog$Window$String$ModalityType$GraphicsConfiguration', 'java.awt.Window,java.lang.String,java.awt.Dialog$ModalityType': '_JDialog$Window$String$ModalityType', 'java.awt.Window,java.lang.String': '_JDialog$Window$String', 'java.awt.Window,java.awt.Dialog$ModalityType': '_JDialog$Window$ModalityType', 'java.awt.Window': '_JDialog$Window', 'java.awt.Dialog,java.lang.String,boolean,java.awt.GraphicsConfiguration': '_JDialog$Dialog$String$boolean$GraphicsConfiguration', 'java.awt.Dialog,java.lang.String,boolean': '_JDialog$Dialog$String$boolean', 'java.awt.Dialog,java.lang.String': '_JDialog$Dialog$String', 'java.awt.Dialog,boolean': '_JDialog$Dialog$boolean', 'java.awt.Dialog': '_JDialog$Dialog', 'java.awt.Frame,java.lang.String,boolean,java.awt.GraphicsConfiguration': '_JDialog$Frame$String$boolean$GraphicsConfiguration', 'java.awt.Frame,java.lang.String,boolean': '_JDialog$Frame$String$boolean', 'java.awt.Frame,java.lang.String': '_JDialog$Frame$String', 'java.awt.Frame,boolean': '_JDialog$Frame$boolean', 'java.awt.Frame': '_JDialog$Frame', '': '_JDialog$' }, meths: { 'repaint(long,int,int,int,int)': 'repaint$long$int$int$int$int', 'remove(java.awt.Component)': 'remove$Component', 'update(java.awt.Graphics)': 'update$Graphics' }, clinit: true, lazy: ['defaultLookAndFeelDecoratedKey'] });
$J.define(JDialog$AccessibleJDialog, 'javax.swing.JDialog$AccessibleJDialog', { kind: 'class', sup: 'java.awt.Dialog$AccessibleAWTDialog', ctors: { '': '_JDialog$AccessibleJDialog' }, meths: { 'getAccessibleStateSet()': 'getAccessibleStateSet$' }, inner: true });
$J.module(() => {
  AWTEvent = $J.load('java.awt.AWTEvent');
  BorderLayout = $J.load('java.awt.BorderLayout');
  WindowEvent = $J.load('java.awt.event.WindowEvent');
  JComponent = $J.load('javax.swing.JComponent');
  JRootPane = $J.load('javax.swing.JRootPane');
  RepaintManager = $J.load('javax.swing.RepaintManager');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  WindowConstants = $J.load('javax.swing.WindowConstants');
});
