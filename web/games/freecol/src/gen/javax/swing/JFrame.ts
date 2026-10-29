// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JFrame.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, StringBuffer, SunToolkit } from '../../../jre/index.ts';
import { Frame } from '../../java/awt/Frame.ts';
import { Frame$AccessibleAWTFrame } from '../../java/awt/Frame.ts';

let AWTEvent, BorderLayout, WindowEvent, JComponent, JRootPane, RepaintManager, SwingUtilities, UIManager, WindowConstants;

/**
 * An extended version of <code>java.awt.Frame</code> that adds support for
 * the JFC/Swing component architecture.
 * You can find task-oriented documentation about using <code>JFrame</code>
 * in <em>The Java Tutorial</em>, in the section
 * <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/frame.html">How to Make Frames</a>.
 *
 * <p>
 * The <code>JFrame</code> class is slightly incompatible with <code>Frame</code>.
 * Like all other JFC/Swing top-level containers,
 * a <code>JFrame</code> contains a <code>JRootPane</code> as its only child.
 * The <b>content pane</b> provided by the root pane should,
 * as a rule, contain
 * all the non-menu components displayed by the <code>JFrame</code>.
 * This is different from the AWT <code>Frame</code> case.
 * As a convenience, the {@code add}, {@code remove}, and {@code setLayout}
 * methods of this class are overridden, so that they delegate calls
 * to the corresponding methods of the {@code ContentPane}.
 * For example, you can add a child component to a frame as follows:
 * <pre>
 *       frame.add(child);
 * </pre>
 * And the child will be added to the contentPane.
 * The content pane will
 * always be non-null. Attempting to set it to null will cause the JFrame
 * to throw an exception. The default content pane will have a BorderLayout
 * manager set on it.
 * Refer to {@link javax.swing.RootPaneContainer}
 * for details on adding, removing and setting the <code>LayoutManager</code>
 * of a <code>JFrame</code>.
 * <p>
 * Unlike a <code>Frame</code>, a <code>JFrame</code> has some notion of how to
 * respond when the user attempts to close the window. The default behavior
 * is to simply hide the JFrame when the user closes the window. To change the
 * default behavior, you invoke the method
 * {@link #setDefaultCloseOperation}.
 * To make the <code>JFrame</code> behave the same as a <code>Frame</code>
 * instance, use
 * <code>setDefaultCloseOperation(WindowConstants.DO_NOTHING_ON_CLOSE)</code>.
 * <p>
 * For more information on content panes
 * and other features that root panes provide,
 * see <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/toplevel.html">Using Top-Level Containers</a> in <em>The Java Tutorial</em>.
 * <p>
 * In a multi-screen environment, you can create a <code>JFrame</code>
 * on a different screen device.  See {@link java.awt.Frame} for more
 * information.
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
 * @see JRootPane
 * @see #setDefaultCloseOperation
 * @see java.awt.event.WindowListener#windowClosing
 * @see javax.swing.RootPaneContainer
 *
 * @author Jeff Dinkins
 * @author Georges Saab
 * @author David Kloba
 * @since 1.2
 */
export class JFrame extends Frame {
  /**
   * Key into the AppContext, used to check if should provide decorations
   * by default.
   */
  static defaultLookAndFeelDecoratedKey: any = null;
  defaultCloseOperation: number = 0;
  /**
   * The <code>TransferHandler</code> for this frame.
   */
  transferHandler: TransferHandler = null;
  /**
   * The <code>JRootPane</code> instance that manages the
   * <code>contentPane</code>
   * and optional <code>menuBar</code> for this frame, as well as the
   * <code>glassPane</code>.
   *
   * @see JRootPane
   * @see RootPaneContainer
   */
  rootPane: JRootPane = null;
  /**
   * If true then calls to <code>add</code> and <code>setLayout</code>
   * will be forwarded to the <code>contentPane</code>. This is initially
   * false, but is set to true when the <code>JFrame</code> is constructed.
   *
   * @see #isRootPaneCheckingEnabled
   * @see #setRootPaneCheckingEnabled
   * @see javax.swing.RootPaneContainer
   */
  rootPaneCheckingEnabled: boolean = false;
  /**
   * The accessible context property.
   */
  accessibleContext$JFrame: AccessibleContext = null;
  $init_JFrame() {
    this.defaultCloseOperation = WindowConstants.HIDE_ON_CLOSE;
    this.rootPaneCheckingEnabled = false;
    this.accessibleContext$JFrame = null;
  }
  /**
   * Constructs a new frame that is initially invisible.
   * <p>
   * This constructor sets the component's locale property to the value
   * returned by <code>JComponent.getDefaultLocale</code>.
   *
   * @throws HeadlessException if GraphicsEnvironment.isHeadless()
   * returns true.
   * @see java.awt.GraphicsEnvironment#isHeadless
   * @see Component#setSize
   * @see Component#setVisible
   * @see JComponent#getDefaultLocale
   */
  _JFrame$(): this {
    this._Frame$();
    this.$init_JFrame();
    this.frameInit();
    return this;
  }
  /**
   * Creates a <code>Frame</code> in the specified
   * <code>GraphicsConfiguration</code> of
   * a screen device and a blank title.
   * <p>
   * This constructor sets the component's locale property to the value
   * returned by <code>JComponent.getDefaultLocale</code>.
   *
   * @param gc the <code>GraphicsConfiguration</code> that is used
   *          to construct the new <code>Frame</code>;
   *          if <code>gc</code> is <code>null</code>, the system
   *          default <code>GraphicsConfiguration</code> is assumed
   * @throws IllegalArgumentException if <code>gc</code> is not from
   *          a screen device.  This exception is always thrown when
   *      GraphicsEnvironment.isHeadless() returns true.
   * @see java.awt.GraphicsEnvironment#isHeadless
   * @see JComponent#getDefaultLocale
   * @since     1.3
   */
  _JFrame$GraphicsConfiguration(gc: GraphicsConfiguration): this {
    this._Frame$GraphicsConfiguration(gc);
    this.$init_JFrame();
    this.frameInit();
    return this;
  }
  /**
   * Creates a <code>JFrame</code> with the specified title and the
   * specified <code>GraphicsConfiguration</code> of a screen device.
   * <p>
   * This constructor sets the component's locale property to the value
   * returned by <code>JComponent.getDefaultLocale</code>.
   *
   * @param title the title to be displayed in the
   *          frame's border. A <code>null</code> value is treated as
   *          an empty string, "".
   * @param gc the <code>GraphicsConfiguration</code> that is used
   *          to construct the new <code>JFrame</code> with;
   *          if <code>gc</code> is <code>null</code>, the system
   *          default <code>GraphicsConfiguration</code> is assumed
   * @throws IllegalArgumentException if <code>gc</code> is not from
   *          a screen device.  This exception is always thrown when
   *      GraphicsEnvironment.isHeadless() returns true.
   * @see java.awt.GraphicsEnvironment#isHeadless
   * @see JComponent#getDefaultLocale
   * @since     1.3
   */
  _JFrame$String$GraphicsConfiguration(title: string, gc: GraphicsConfiguration): this {
    this._Frame$String$GraphicsConfiguration(title, gc);
    this.$init_JFrame();
    this.frameInit();
    return this;
  }
  /**
   * Called by the constructors to init the <code>JFrame</code> properly.
   */
  frameInit(): void {
    this.enableEvents($J.lor(AWTEvent.KEY_EVENT_MASK, AWTEvent.WINDOW_EVENT_MASK));
    this.setLocale(JComponent.getDefaultLocale());
    this.setRootPane(this.createRootPane());
    this.setBackground(UIManager.getColor$Object('control'));
    this.setRootPaneCheckingEnabled(true);
    if (JFrame.isDefaultLookAndFeelDecorated()) {
      let supportsWindowDecorations = UIManager.getLookAndFeel().getSupportsWindowDecorations();
      if (supportsWindowDecorations) {
        this.setUndecorated(true);
        this.getRootPane().setWindowDecorationStyle(JRootPane.FRAME);
      }
    }
    SunToolkit.checkAndSetPolicy(this);
  }
  /**
   * Called by the constructor methods to create the default
   * <code>rootPane</code>.
   *
   * @return a new {@code JRootPane}
   */
  createRootPane(): JRootPane {
    let rp = new JRootPane()._JRootPane();
    rp.setOpaque(true);
    return rp;
  }
  /**
   * Processes window events occurring on this component.
   * Hides the window or disposes of it, as specified by the setting
   * of the <code>defaultCloseOperation</code> property.
   *
   * @param  e  the window event
   * @see    #setDefaultCloseOperation
   * @see    java.awt.Window#processWindowEvent
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
        case WindowConstants.EXIT_ON_CLOSE:
          $J.system_exit(0);
          break;
        case WindowConstants.DO_NOTHING_ON_CLOSE:
        default:
      }
    }
  }
  /**
   * Sets the operation that will happen by default when
   * the user initiates a "close" on this frame.
   * You must specify one of the following choices:
   * <br><br>
   * <ul>
   * <li><code>DO_NOTHING_ON_CLOSE</code>
   * (defined in <code>WindowConstants</code>):
   * Don't do anything; require the
   * program to handle the operation in the <code>windowClosing</code>
   * method of a registered <code>WindowListener</code> object.
   *
   * <li><code>HIDE_ON_CLOSE</code>
   * (defined in <code>WindowConstants</code>):
   * Automatically hide the frame after
   * invoking any registered <code>WindowListener</code>
   * objects.
   *
   * <li><code>DISPOSE_ON_CLOSE</code>
   * (defined in <code>WindowConstants</code>):
   * Automatically hide and dispose the
   * frame after invoking any registered <code>WindowListener</code>
   * objects.
   *
   * <li><code>EXIT_ON_CLOSE</code>
   * (defined in <code>WindowConstants</code>):
   * Exit the application using the <code>System</code>
   * <code>exit</code> method.  Use this only in applications.
   * </ul>
   * <p>
   * The value is set to <code>HIDE_ON_CLOSE</code> by default. Changes
   * to the value of this property cause the firing of a property
   * change event, with property name "defaultCloseOperation".
   * <p>
   * <b>Note</b>: When the last displayable window within the
   * Java virtual machine (VM) is disposed of, the VM may
   * terminate.  See <a href="../../java/awt/doc-files/AWTThreadIssues.html">
   * AWT Threading Issues</a> for more information.
   *
   * @param operation the operation which should be performed when the
   *        user closes the frame
   * @throws IllegalArgumentException if defaultCloseOperation value
   *             isn't one of the above valid values
   * @see #addWindowListener
   * @see #getDefaultCloseOperation
   * @see WindowConstants
   * @throws  SecurityException
   *        if <code>EXIT_ON_CLOSE</code> has been specified and the
   *        <code>SecurityManager</code> will
   *        not allow the caller to invoke <code>System.exit</code>
   * @see        java.lang.Runtime#exit(int)
   */
  setDefaultCloseOperation(operation: number): void {
    if (operation !== WindowConstants.DO_NOTHING_ON_CLOSE && operation !== WindowConstants.HIDE_ON_CLOSE && operation !== WindowConstants.DISPOSE_ON_CLOSE && operation !== WindowConstants.EXIT_ON_CLOSE) {
      throw new IllegalArgumentException('defaultCloseOperation must be one of: DO_NOTHING_ON_CLOSE, HIDE_ON_CLOSE, DISPOSE_ON_CLOSE, or EXIT_ON_CLOSE');
    }
    if (operation === WindowConstants.EXIT_ON_CLOSE) {
      let security = $J.system_getSecurityManager();
      if (security != null) {
        security.checkExit(0);
      }
    }
    if (this.defaultCloseOperation !== operation) {
      let oldValue = this.defaultCloseOperation;
      this.defaultCloseOperation = operation;
      this.firePropertyChange$String$int$int('defaultCloseOperation', oldValue, operation);
    }
  }
  /**
   * Sets the menubar for this frame.
   * @param menubar the menubar being placed in the frame
   *
   * @see #getJMenuBar
   */
  setJMenuBar(menubar: JMenuBar): void {
    this.getRootPane().setJMenuBar(menubar);
  }
  /**
   * Returns the menubar set on this frame.
   * @return the menubar for this frame
   *
   * @see #setJMenuBar
   */
  getJMenuBar(): JMenuBar {
    return this.getRootPane().getJMenuBar();
  }
  /**
   * Returns whether calls to <code>add</code> and
   * <code>setLayout</code> are forwarded to the <code>contentPane</code>.
   *
   * @return true if <code>add</code> and <code>setLayout</code>
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
   * Sets whether calls to <code>add</code> and
   * <code>setLayout</code> are forwarded to the <code>contentPane</code>.
   *
   * @param enabled  true if <code>add</code> and <code>setLayout</code>
   *        are forwarded, false if they should operate directly on the
   *        <code>JFrame</code>.
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
   * Adds the specified child <code>Component</code>.
   * This method is overridden to conditionally forward calls to the
   * <code>contentPane</code>.
   * By default, children are added to the <code>contentPane</code> instead
   * of the frame, refer to {@link javax.swing.RootPaneContainer} for
   * details.
   *
   * @param comp the component to be enhanced
   * @param constraints the constraints to be respected
   * @param index the index
   * @throws IllegalArgumentException if <code>index</code> is invalid
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
   * <code>comp</code> is not the <code>rootPane</code>, this will forward
   * the call to the <code>contentPane</code>. This will do nothing if
   * <code>comp</code> is not a child of the <code>JFrame</code> or
   * <code>contentPane</code>.
   *
   * @param comp the component to be removed
   * @throws NullPointerException if <code>comp</code> is null
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
   * Sets the <code>LayoutManager</code>.
   * Overridden to conditionally forward the call to the
   * <code>contentPane</code>.
   * Refer to {@link javax.swing.RootPaneContainer} for
   * more information.
   *
   * @param manager the <code>LayoutManager</code>
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
   * Returns the <code>rootPane</code> object for this frame.
   * @return the <code>rootPane</code> property
   *
   * @see #setRootPane
   * @see RootPaneContainer#getRootPane
   */
  getRootPane(): JRootPane {
    return this.rootPane;
  }
  /**
   * Sets the <code>rootPane</code> property.
   * This method is called by the constructor.
   * @param root the <code>rootPane</code> object for this frame
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
   * {@inheritDoc}
   */
  setIconImage(image: Image): void {
    super.setIconImage(image);
  }
  /**
   * Returns the <code>contentPane</code> object for this frame.
   * @return the <code>contentPane</code> property
   *
   * @see #setContentPane
   * @see RootPaneContainer#getContentPane
   */
  getContentPane(): Container {
    return this.getRootPane().getContentPane();
  }
  /**
   * Sets the <code>contentPane</code> property.
   * This method is called by the constructor.
   * <p>
   * Swing's painting architecture requires an opaque <code>JComponent</code>
   * in the containment hierarchy. This is typically provided by the
   * content pane. If you replace the content pane it is recommended you
   * replace it with an opaque <code>JComponent</code>.
   *
   * @param contentPane the <code>contentPane</code> object for this frame
   *
   * @throws java.awt.IllegalComponentStateException (a runtime
   *            exception) if the content pane parameter is <code>null</code>
   * @see #getContentPane
   * @see RootPaneContainer#setContentPane
   * @see JRootPane
   */
  setContentPane(contentPane: Container): void {
    this.getRootPane().setContentPane(contentPane);
  }
  /**
   * Returns the <code>layeredPane</code> object for this frame.
   * @return the <code>layeredPane</code> property
   *
   * @see #setLayeredPane
   * @see RootPaneContainer#getLayeredPane
   */
  getLayeredPane(): JLayeredPane {
    return this.getRootPane().getLayeredPane();
  }
  /**
   * Returns the <code>glassPane</code> object for this frame.
   * @return the <code>glassPane</code> property
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
   * <code>time</code> milliseconds.  Refer to <code>RepaintManager</code>
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
   * Returns true if newly created <code>JFrame</code>s should have their
   * Window decorations provided by the current look and feel. This is only
   * a hint, as certain look and feels may not support this feature.
   *
   * @return true if look and feel should provide Window decorations.
   * @since 1.4
   */
  static isDefaultLookAndFeelDecorated(): boolean {
    let defaultLookAndFeelDecorated = SwingUtilities.appContextGet(JFrame.defaultLookAndFeelDecoratedKey);
    if (defaultLookAndFeelDecorated == null) {
      defaultLookAndFeelDecorated = false;
    }
    return defaultLookAndFeelDecorated;
  }
  /**
   * Returns a string representation of this <code>JFrame</code>.
   * This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JFrame</code>
   */
  paramString(): string {
    let defaultCloseOperationString: string;
    if (this.defaultCloseOperation === WindowConstants.HIDE_ON_CLOSE) {
      defaultCloseOperationString = 'HIDE_ON_CLOSE';
    } else if (this.defaultCloseOperation === WindowConstants.DISPOSE_ON_CLOSE) {
      defaultCloseOperationString = 'DISPOSE_ON_CLOSE';
    } else if (this.defaultCloseOperation === WindowConstants.DO_NOTHING_ON_CLOSE) {
      defaultCloseOperationString = 'DO_NOTHING_ON_CLOSE';
    } else if (this.defaultCloseOperation === WindowConstants.EXIT_ON_CLOSE) {
      defaultCloseOperationString = 'EXIT_ON_CLOSE';
    } else {
      defaultCloseOperationString = '';
    }
    let rootPaneString = (this.rootPane != null ? this.rootPane.toString() : '');
    let rootPaneCheckingEnabledString = (this.rootPaneCheckingEnabled ? 'true' : 'false');
    return super.paramString() + ',defaultCloseOperation=' + defaultCloseOperationString + ',rootPane=' + rootPaneString + ',rootPaneCheckingEnabled=' + rootPaneCheckingEnabledString;
  }
  /**
   * Gets the AccessibleContext associated with this JFrame.
   * For JFrames, the AccessibleContext takes the form of an
   * AccessibleJFrame.
   * A new AccessibleJFrame instance is created if necessary.
   *
   * @return an AccessibleJFrame that serves as the
   *         AccessibleContext of this JFrame
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext$JFrame == null) {
      this.accessibleContext$JFrame = new JFrame$AccessibleJFrame().$o(this)._JFrame$AccessibleJFrame();
    }
    return this.accessibleContext$JFrame;
  }
  static $clinit() {
    JFrame.defaultLookAndFeelDecoratedKey = new StringBuffer('JFrame.defaultLookAndFeelDecorated');
  }
}

/**
 * This class implements accessibility support for the
 * <code>JFrame</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to frame user-interface
 * elements.
 */
export class JFrame$AccessibleJFrame extends Frame$AccessibleAWTFrame {
  /**
   * Constructs an {@code AccessibleJFrame}.
   */
  _JFrame$AccessibleJFrame(): this {
    this._Frame$AccessibleAWTFrame();
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

$J.define(JFrame, 'javax.swing.JFrame', { kind: 'class', ifaces: ['javax.swing.WindowConstants', 'javax.accessibility.Accessible', 'javax.swing.RootPaneContainer', 'javax.swing.TransferHandler$HasGetTransferHandler'], sup: 'java.awt.Frame', ctors: { 'java.lang.String,java.awt.GraphicsConfiguration': '_JFrame$String$GraphicsConfiguration', 'java.lang.String': '_JFrame$String', 'java.awt.GraphicsConfiguration': '_JFrame$GraphicsConfiguration', '': '_JFrame$' }, meths: { 'repaint(long,int,int,int,int)': 'repaint$long$int$int$int$int', 'remove(java.awt.Component)': 'remove$Component', 'update(java.awt.Graphics)': 'update$Graphics' }, clinit: true, lazy: ['defaultLookAndFeelDecoratedKey'] });
$J.define(JFrame$AccessibleJFrame, 'javax.swing.JFrame$AccessibleJFrame', { kind: 'class', sup: 'java.awt.Frame$AccessibleAWTFrame', ctors: { '': '_JFrame$AccessibleJFrame' }, meths: { 'getAccessibleStateSet()': 'getAccessibleStateSet$' }, inner: true });
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
