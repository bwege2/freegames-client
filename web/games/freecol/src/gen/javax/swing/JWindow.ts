// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JWindow.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2020, Oracle and/or its affiliates. All rights reserved.
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
import { $J, SunToolkit } from '../../../jre/index.ts';
import { Window } from '../../java/awt/Window.ts';
import { Window$AccessibleAWTWindow } from '../../java/awt/Window.ts';

let BorderLayout, JComponent, JRootPane, RepaintManager, SwingUtilities;

/**
 * A <code>JWindow</code> is a container that can be displayed anywhere on the
 * user's desktop. It does not have the title bar, window-management buttons,
 * or other trimmings associated with a <code>JFrame</code>, but it is still a
 * "first-class citizen" of the user's desktop, and can exist anywhere
 * on it.
 * <p>
 * The <code>JWindow</code> component contains a <code>JRootPane</code>
 * as its only child.  The <code>contentPane</code> should be the parent
 * of any children of the <code>JWindow</code>.
 * As a convenience, the {@code add}, {@code remove}, and {@code setLayout}
 * methods of this class are overridden, so that they delegate calls
 * to the corresponding methods of the {@code ContentPane}.
 * For example, you can add a child component to a window as follows:
 * <pre>
 *       window.add(child);
 * </pre>
 * And the child will be added to the contentPane.
 * The <code>contentPane</code> will always be non-<code>null</code>.
 * Attempting to set it to <code>null</code> will cause the <code>JWindow</code>
 * to throw an exception. The default <code>contentPane</code> will have a
 * <code>BorderLayout</code> manager set on it.
 * Refer to {@link javax.swing.RootPaneContainer}
 * for details on adding, removing and setting the <code>LayoutManager</code>
 * of a <code>JWindow</code>.
 * <p>
 * Please see the {@link JRootPane} documentation for a complete description of
 * the <code>contentPane</code>, <code>glassPane</code>, and
 * <code>layeredPane</code> components.
 * <p>
 * In a multi-screen environment, you can create a <code>JWindow</code>
 * on a different screen device.  See {@link java.awt.Window} for more
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
 *
 * @author David Kloba
 * @since 1.2
 */
export class JWindow extends Window {
  /**
   * The <code>JRootPane</code> instance that manages the
   * <code>contentPane</code>
   * and optional <code>menuBar</code> for this frame, as well as the
   * <code>glassPane</code>.
   *
   * @see #getRootPane
   * @see #setRootPane
   */
  rootPane: JRootPane = null;
  /**
   * If true then calls to <code>add</code> and <code>setLayout</code>
   * will be forwarded to the <code>contentPane</code>. This is initially
   * false, but is set to true when the <code>JWindow</code> is constructed.
   *
   * @see #isRootPaneCheckingEnabled
   * @see #setRootPaneCheckingEnabled
   * @see javax.swing.RootPaneContainer
   */
  rootPaneCheckingEnabled: boolean = false;
  /**
   * The <code>TransferHandler</code> for this window.
   */
  transferHandler: TransferHandler = null;
  /**
   * The accessible context property.
   */
  accessibleContext$JWindow: AccessibleContext = null;
  $init_JWindow() {
    this.rootPaneCheckingEnabled = false;
    this.accessibleContext$JWindow = null;
  }
  /**
   * Creates a window with the specified owner window. This window
   * will not be focusable unless its owner is showing on the screen.
   * If <code>owner</code> is <code>null</code>, the shared owner
   * will be used and this window will not be focusable.
   * <p>
   * This constructor sets the component's locale property to the value
   * returned by <code>JComponent.getDefaultLocale</code>.
   *
   * @param owner the window from which the window is displayed
   * @throws HeadlessException if
   *         <code>GraphicsEnvironment.isHeadless()</code> returns true.
   * @see java.awt.GraphicsEnvironment#isHeadless
   * @see #isFocusableWindow
   * @see JComponent#getDefaultLocale
   */
  _JWindow$Window(owner: Window): this {
    this._Window$Window(owner == null ? SwingUtilities.getSharedOwnerFrame() : owner);
    this.$init_JWindow();
    if (owner == null) {
      let ownerShutdownListener = SwingUtilities.getSharedOwnerFrameShutdownListener();
      this.addWindowListener(ownerShutdownListener);
    }
    this.windowInit();
    return this;
  }
  /**
   * Called by the constructors to init the <code>JWindow</code> properly.
   */
  windowInit(): void {
    this.setLocale(JComponent.getDefaultLocale());
    this.setRootPane(this.createRootPane());
    this.setRootPaneCheckingEnabled(true);
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
   *        <code>JWindow</code>.
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
   * <code>comp</code> is not a child of the <code>JWindow</code> or
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
   * Returns the <code>rootPane</code> object for this window.
   * @return the <code>rootPane</code> property for this window
   *
   * @see #setRootPane
   * @see RootPaneContainer#getRootPane
   */
  getRootPane(): JRootPane {
    return this.rootPane;
  }
  /**
   * Sets the new <code>rootPane</code> object for this window.
   * This method is called by the constructor.
   *
   * @param root the new <code>rootPane</code> property
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
   * Returns the <code>Container</code> which is the <code>contentPane</code>
   * for this window.
   *
   * @return the <code>contentPane</code> property
   * @see #setContentPane
   * @see RootPaneContainer#getContentPane
   */
  getContentPane(): Container {
    return this.getRootPane().getContentPane();
  }
  /**
   * Returns the <code>layeredPane</code> object for this window.
   *
   * @return the <code>layeredPane</code> property
   * @see #setLayeredPane
   * @see RootPaneContainer#getLayeredPane
   */
  getLayeredPane(): JLayeredPane {
    return this.getRootPane().getLayeredPane();
  }
  /**
   * Returns the <code>glassPane Component</code> for this window.
   *
   * @return the <code>glassPane</code> property
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
   * Returns a string representation of this <code>JWindow</code>.
   * This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JWindow</code>
   */
  paramString(): string {
    let rootPaneCheckingEnabledString = (this.rootPaneCheckingEnabled ? 'true' : 'false');
    return super.paramString() + ',rootPaneCheckingEnabled=' + rootPaneCheckingEnabledString;
  }
  /**
   * Gets the AccessibleContext associated with this JWindow.
   * For JWindows, the AccessibleContext takes the form of an
   * AccessibleJWindow.
   * A new AccessibleJWindow instance is created if necessary.
   *
   * @return an AccessibleJWindow that serves as the
   *         AccessibleContext of this JWindow
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext$JWindow == null) {
      this.accessibleContext$JWindow = new JWindow$AccessibleJWindow().$o(this)._JWindow$AccessibleJWindow();
    }
    return this.accessibleContext$JWindow;
  }
}

/**
 * This class implements accessibility support for the
 * <code>JWindow</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to window user-interface
 * elements.
 */
export class JWindow$AccessibleJWindow extends Window$AccessibleAWTWindow {
  /**
   * Constructs an {@code AccessibleJWindow}.
   */
  _JWindow$AccessibleJWindow(): this {
    this._Window$AccessibleAWTWindow();
    return this;
  }
}

$J.define(JWindow, 'javax.swing.JWindow', { kind: 'class', ifaces: ['javax.accessibility.Accessible', 'javax.swing.RootPaneContainer', 'javax.swing.TransferHandler$HasGetTransferHandler'], sup: 'java.awt.Window', ctors: { 'java.awt.Window,java.awt.GraphicsConfiguration': '_JWindow$Window$GraphicsConfiguration', 'java.awt.Window': '_JWindow$Window', 'java.awt.Frame': '_JWindow$Frame', 'java.awt.GraphicsConfiguration': '_JWindow$GraphicsConfiguration', '': '_JWindow$' }, meths: { 'repaint(long,int,int,int,int)': 'repaint$long$int$int$int$int', 'remove(java.awt.Component)': 'remove$Component', 'update(java.awt.Graphics)': 'update$Graphics' } });
$J.define(JWindow$AccessibleJWindow, 'javax.swing.JWindow$AccessibleJWindow', { kind: 'class', sup: 'java.awt.Window$AccessibleAWTWindow', ctors: { '': '_JWindow$AccessibleJWindow' }, inner: true });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  JComponent = $J.load('javax.swing.JComponent');
  JRootPane = $J.load('javax.swing.JRootPane');
  RepaintManager = $J.load('javax.swing.RepaintManager');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
});
