// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JInternalFrame.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, AppContext, JObject, SecurityException, StringBuilder, SunToolkit, Toolkit } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';

let BorderLayout, Cursor, KeyboardFocusManager, Window, PropertyVetoException, AccessibleContext, InternalFrameFocusTraversalPolicy, JDesktopPane, JLayeredPane, JRootPane, SwingUtilities, UIManager, WindowConstants, InternalFrameEvent, InternalFrameListener, UngrabEvent, SwingUtilities2;

/**
 * A lightweight object that provides many of the features of
 * a native frame, including dragging, closing, becoming an icon,
 * resizing, title display, and support for a menu bar.
 * For task-oriented documentation and examples of using internal frames,
 * see <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/internalframe.html" target="_top">How to Use Internal Frames</a>,
 * a section in <em>The Java Tutorial</em>.
 *
 * <p>
 *
 * Generally,
 * you add <code>JInternalFrame</code>s to a <code>JDesktopPane</code>. The UI
 * delegates the look-and-feel-specific actions to the
 * <code>DesktopManager</code>
 * object maintained by the <code>JDesktopPane</code>.
 * <p>
 * The <code>JInternalFrame</code> content pane
 * is where you add child components.
 * As a convenience, the {@code add}, {@code remove}, and {@code setLayout}
 * methods of this class are overridden, so that they delegate calls
 * to the corresponding methods of the {@code ContentPane}.
 * For example, you can add a child component to an internal frame as follows:
 * <pre>
 *       internalFrame.add(child);
 * </pre>
 * And the child will be added to the contentPane.
 * The content pane is actually managed by an instance of
 * <code>JRootPane</code>,
 * which also manages a layout pane, glass pane, and
 * optional menu bar for the internal frame. Please see the
 * <code>JRootPane</code>
 * documentation for a complete description of these components.
 * Refer to {@link javax.swing.RootPaneContainer}
 * for details on adding, removing and setting the <code>LayoutManager</code>
 * of a <code>JInternalFrame</code>.
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
 * @see InternalFrameEvent
 * @see JDesktopPane
 * @see DesktopManager
 * @see JInternalFrame.JDesktopIcon
 * @see JRootPane
 * @see javax.swing.RootPaneContainer
 *
 * @author David Kloba
 * @author Rich Schiavi
 * @since 1.2
 */
export class JInternalFrame extends JComponent {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'InternalFrameUI';
  /**
   * The <code>JRootPane</code> instance that manages the
   * content pane
   * and optional menu bar for this internal frame, as well as the
   * glass pane.
   *
   * @see JRootPane
   * @see RootPaneContainer
   */
  rootPane: JRootPane = null;
  /**
   * If true then calls to <code>add</code> and <code>setLayout</code>
   * will be forwarded to the <code>contentPane</code>. This is initially
   * false, but is set to true when the <code>JInternalFrame</code> is
   * constructed.
   *
   * @see #isRootPaneCheckingEnabled
   * @see #setRootPaneCheckingEnabled
   * @see javax.swing.RootPaneContainer
   */
  rootPaneCheckingEnabled: boolean = false;
  /**
   * The frame can be closed.
   */
  closable: boolean = false;
  /**
   * The frame has been closed.
   */
  isClosed_: boolean = false;
  /**
   * The frame can be expanded to the size of the desktop pane.
   */
  maximizable: boolean = false;
  /**
   * The frame has been expanded to its maximum size.
   * @see #maximizable
   */
  isMaximum_: boolean = false;
  /**
   * The frame can "iconified" (shrunk down and displayed as
   * an icon-image).
   * @see JInternalFrame.JDesktopIcon
   * @see #setIconifiable
   */
  iconable: boolean = false;
  /**
   * The frame has been iconified.
   * @see #isIcon()
   */
  isIcon_: boolean = false;
  /**
   * The frame's size can be changed.
   */
  resizable: boolean = false;
  /**
   * The frame is currently selected.
   */
  isSelected_: boolean = false;
  /**
   * The icon shown in the top-left corner of this internal frame.
   */
  frameIcon: Icon = null;
  /**
   * The title displayed in this internal frame's title bar.
   */
  title: string = null;
  /**
   * The icon that is displayed when this internal frame is iconified.
   * Subclassers must ensure this is set to a non-null value
   * during construction and not subsequently set this to null.
   * @see #iconable
   */
  desktopIcon: JInternalFrame$JDesktopIcon = null;
  lastCursor: Cursor = null;
  opened: boolean = false;
  normalBounds: Rectangle = null;
  defaultCloseOperation: number = 0;
  /**
   * Contains the Component that focus is to go when
   * <code>restoreSubcomponentFocus</code> is invoked, that is,
   * <code>restoreSubcomponentFocus</code> sets this to the value returned
   * from <code>getMostRecentFocusOwner</code>.
   */
  lastFocusOwner: Component = null;
  /**
   * Bound property name.
   */
  static readonly CONTENT_PANE_PROPERTY: string = 'contentPane';
  /**
   * Bound property name.
   */
  static readonly MENU_BAR_PROPERTY: string = 'JMenuBar';
  /**
   * Bound property name.
   */
  static readonly TITLE_PROPERTY: string = 'title';
  /**
   * Bound property name.
   */
  static readonly LAYERED_PANE_PROPERTY: string = 'layeredPane';
  /**
   * Bound property name.
   */
  static readonly ROOT_PANE_PROPERTY: string = 'rootPane';
  /**
   * Bound property name.
   */
  static readonly GLASS_PANE_PROPERTY: string = 'glassPane';
  /**
   * Bound property name.
   */
  static readonly FRAME_ICON_PROPERTY: string = 'frameIcon';
  /**
   * Constrained property name indicated that this frame has
   * selected status.
   */
  static readonly IS_SELECTED_PROPERTY: string = 'selected';
  /**
   * Constrained property name indicating that the internal frame is closed.
   */
  static readonly IS_CLOSED_PROPERTY: string = 'closed';
  /**
   * Constrained property name indicating that the internal frame is maximized.
   */
  static readonly IS_MAXIMUM_PROPERTY: string = 'maximum';
  /**
   * Constrained property name indicating that the internal frame is iconified.
   */
  static readonly IS_ICON_PROPERTY: string = 'icon';
  static PROPERTY_CHANGE_LISTENER_KEY: any = null;
  isDragging_: boolean = false;
  danger: boolean = false;
  $init_JInternalFrame() {
    this.rootPaneCheckingEnabled = false;
    this.normalBounds = null;
    this.defaultCloseOperation = WindowConstants.DISPOSE_ON_CLOSE;
    this.isDragging_ = false;
    this.danger = false;
  }
  /**
   * Creates a non-resizable, non-closable, non-maximizable,
   * non-iconifiable <code>JInternalFrame</code> with no title.
   */
  _JInternalFrame$(): this {
    this._JInternalFrame$String$boolean$boolean$boolean$boolean('', false, false, false, false);
    return this;
  }
  /**
   * Creates a non-resizable, non-closable, non-maximizable,
   * non-iconifiable <code>JInternalFrame</code> with the specified title.
   * Note that passing in a <code>null</code> <code>title</code> results in
   * unspecified behavior and possibly an exception.
   *
   * @param title  the non-<code>null</code> <code>String</code>
   *     to display in the title bar
   */
  _JInternalFrame$String(title: string): this {
    this._JInternalFrame$String$boolean$boolean$boolean$boolean(title, false, false, false, false);
    return this;
  }
  /**
   * Creates a non-closable, non-maximizable, non-iconifiable
   * <code>JInternalFrame</code> with the specified title
   * and resizability.
   *
   * @param title      the <code>String</code> to display in the title bar
   * @param resizable  if <code>true</code>, the internal frame can be resized
   */
  _JInternalFrame$String$boolean(title: string, resizable: boolean): this {
    this._JInternalFrame$String$boolean$boolean$boolean$boolean(title, resizable, false, false, false);
    return this;
  }
  /**
   * Creates a non-maximizable, non-iconifiable <code>JInternalFrame</code>
   * with the specified title, resizability, and
   * closability.
   *
   * @param title      the <code>String</code> to display in the title bar
   * @param resizable  if <code>true</code>, the internal frame can be resized
   * @param closable   if <code>true</code>, the internal frame can be closed
   */
  _JInternalFrame$String$boolean$boolean(title: string, resizable: boolean, closable: boolean): this {
    this._JInternalFrame$String$boolean$boolean$boolean$boolean(title, resizable, closable, false, false);
    return this;
  }
  /**
   * Creates a non-iconifiable <code>JInternalFrame</code>
   * with the specified title,
   * resizability, closability, and maximizability.
   *
   * @param title       the <code>String</code> to display in the title bar
   * @param resizable   if <code>true</code>, the internal frame can be resized
   * @param closable    if <code>true</code>, the internal frame can be closed
   * @param maximizable if <code>true</code>, the internal frame can be maximized
   */
  _JInternalFrame$String$boolean$boolean$boolean(title: string, resizable: boolean, closable: boolean, maximizable: boolean): this {
    this._JInternalFrame$String$boolean$boolean$boolean$boolean(title, resizable, closable, maximizable, false);
    return this;
  }
  /**
   * Creates a <code>JInternalFrame</code> with the specified title,
   * resizability, closability, maximizability, and iconifiability.
   * All <code>JInternalFrame</code> constructors use this one.
   *
   * @param title       the <code>String</code> to display in the title bar
   * @param resizable   if <code>true</code>, the internal frame can be resized
   * @param closable    if <code>true</code>, the internal frame can be closed
   * @param maximizable if <code>true</code>, the internal frame can be maximized
   * @param iconifiable if <code>true</code>, the internal frame can be iconified
   */
  _JInternalFrame$String$boolean$boolean$boolean$boolean(title: string, resizable: boolean, closable: boolean, maximizable: boolean, iconifiable: boolean): this {
    this._JComponent();
    this.$init_JInternalFrame();
    this.setRootPane(this.createRootPane());
    this.setLayout(new BorderLayout()._BorderLayout$());
    this.title = title;
    this.resizable = resizable;
    this.closable = closable;
    this.maximizable = maximizable;
    this.isMaximum_ = false;
    this.iconable = iconifiable;
    this.isIcon_ = false;
    this.setVisible(false);
    this.setRootPaneCheckingEnabled(true);
    this.desktopIcon = new JInternalFrame$JDesktopIcon()._JInternalFrame$JDesktopIcon(this);
    this.updateUI();
    SunToolkit.checkAndSetPolicy(this);
    JInternalFrame.addPropertyChangeListenerIfNecessary();
    return this;
  }
  static addPropertyChangeListenerIfNecessary(): void {
    if (AppContext.getAppContext().get(JInternalFrame.PROPERTY_CHANGE_LISTENER_KEY) == null) {
      let focusListener = $J.fn(new JInternalFrame$FocusPropertyChangeListener()._JInternalFrame$FocusPropertyChangeListener(), 'propertyChange');
      AppContext.getAppContext().put(JInternalFrame.PROPERTY_CHANGE_LISTENER_KEY, focusListener);
      KeyboardFocusManager.getCurrentKeyboardFocusManager$().addPropertyChangeListener$PropertyChangeListener(focusListener);
    }
  }
  static updateLastFocusOwner(component: Component): void {
    if (component != null) {
      let parent = component;
      while (parent != null && !(parent instanceof Window)) {
        if (parent instanceof JInternalFrame) {
          (parent).setLastFocusOwner(component);
        }
        parent = parent.getParent();
      }
    }
  }
  /**
   * Called by the constructor to set up the <code>JRootPane</code>.
   * @return  a new <code>JRootPane</code>
   * @see JRootPane
   */
  createRootPane(): JRootPane {
    return new JRootPane()._JRootPane();
  }
  /**
   * Returns the look-and-feel object that renders this component.
   *
   * @return the <code>InternalFrameUI</code> object that renders
   *          this component
   */
  getUI(): InternalFrameUI {
    return this.ui;
  }
  /**
   * Sets the UI delegate for this <code>JInternalFrame</code>.
   * @param ui  the UI delegate
   */
  setUI$InternalFrameUI(ui: InternalFrameUI): void {
    let checkingEnabled = this.isRootPaneCheckingEnabled();
    try {
      this.setRootPaneCheckingEnabled(false);
      super.setUI$ComponentUI(ui);
    } finally {
      this.setRootPaneCheckingEnabled(checkingEnabled);
    }
  }
  /**
   * Notification from the <code>UIManager</code> that the look and feel
   * has changed.
   * Replaces the current UI object with the latest version from the
   * <code>UIManager</code>.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    this.setUI$InternalFrameUI(UIManager.getUI(this));
    this.invalidate();
    if (this.desktopIcon != null) {
      this.desktopIcon.updateUIWhenHidden();
    }
  }
  /**
   * Returns the name of the look-and-feel
   * class that renders this component.
   *
   * @return the string "InternalFrameUI"
   *
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JInternalFrame.uiClassID;
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
   *        <code>JInternalFrame</code>.
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
   * <code>comp</code> is not a child of the <code>JInternalFrame</code>
   * this will forward the call to the <code>contentPane</code>.
   *
   * @param comp the component to be removed
   * @throws NullPointerException if <code>comp</code> is null
   * @see #add
   * @see javax.swing.RootPaneContainer
   */
  remove$Component(comp: Component): void {
    let oldCount = this.getComponentCount();
    super.remove$Component(comp);
    if (oldCount === this.getComponentCount()) {
      this.getContentPane().remove$Component(comp);
    }
  }
  /**
   * Ensures that, by default, the layout of this component cannot be set.
   * Overridden to conditionally forward the call to the
   * <code>contentPane</code>.
   * Refer to {@link javax.swing.RootPaneContainer} for
   * more information.
   *
   * @param manager the <code>LayoutManager</code>
   * @see #setRootPaneCheckingEnabled
   */
  setLayout(manager: LayoutManager): void {
    if (this.isRootPaneCheckingEnabled()) {
      this.getContentPane().setLayout(manager);
    } else {
      super.setLayout(manager);
    }
  }
  /**
   * Returns the content pane for this internal frame.
   * @return the content pane
   */
  getContentPane(): Container {
    return this.getRootPane().getContentPane();
  }
  /**
   * Returns the layered pane for this internal frame.
   *
   * @return a <code>JLayeredPane</code> object
   * @see RootPaneContainer#setLayeredPane
   * @see RootPaneContainer#getLayeredPane
   */
  getLayeredPane(): JLayeredPane {
    return this.getRootPane().getLayeredPane();
  }
  /**
   * Returns the glass pane for this internal frame.
   *
   * @return the glass pane
   * @see RootPaneContainer#setGlassPane
   */
  getGlassPane(): Component {
    return this.getRootPane().getGlassPane();
  }
  /**
   * Returns the <code>rootPane</code> object for this internal frame.
   *
   * @return the <code>rootPane</code> property
   * @see RootPaneContainer#getRootPane
   */
  getRootPane(): JRootPane {
    return this.rootPane;
  }
  /**
   * Sets the <code>rootPane</code> property
   * for this <code>JInternalFrame</code>.
   * This method is called by the constructor.
   *
   * @param root  the new <code>JRootPane</code> object
   */
  setRootPane(root: JRootPane): void {
    if (this.rootPane != null) {
      this.remove$Component(this.rootPane);
    }
    let oldValue = this.getRootPane();
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
    this.firePropertyChange$String$Object$Object(JInternalFrame.ROOT_PANE_PROPERTY, oldValue, root);
  }
  /**
   * Sets whether this <code>JInternalFrame</code> can be closed by
   * some user action.
   * @param b a boolean value, where <code>true</code> means this internal frame can be closed
   */
  setClosable(b: boolean): void {
    let oldValue = this.closable ? true : false;
    let newValue = b ? true : false;
    this.closable = b;
    this.firePropertyChange$String$Object$Object('closable', oldValue, newValue);
  }
  /**
   * Returns whether this <code>JInternalFrame</code> can be closed by
   * some user action.
   * @return <code>true</code> if this internal frame can be closed
   */
  isClosable(): boolean {
    return this.closable;
  }
  /**
   * Sets whether the <code>JInternalFrame</code> can be resized by some
   * user action.
   *
   * @param b  a boolean, where <code>true</code> means this internal frame can be resized
   */
  setResizable(b: boolean): void {
    let oldValue = this.resizable ? true : false;
    let newValue = b ? true : false;
    this.resizable = b;
    this.firePropertyChange$String$Object$Object('resizable', oldValue, newValue);
  }
  /**
   * Returns whether the <code>JInternalFrame</code> can be resized
   * by some user action.
   *
   * @return <code>true</code> if this internal frame can be resized, <code>false</code> otherwise
   */
  isResizable(): boolean {
    return this.isMaximum_ ? false : this.resizable;
  }
  /**
   * Sets the <code>iconable</code> property,
   * which must be <code>true</code>
   * for the user to be able to
   * make the <code>JInternalFrame</code> an icon.
   * Some look and feels might not implement iconification;
   * they will ignore this property.
   *
   * @param b  a boolean, where <code>true</code> means this internal frame can be iconified
   */
  setIconifiable(b: boolean): void {
    let oldValue = this.iconable ? true : false;
    let newValue = b ? true : false;
    this.iconable = b;
    this.firePropertyChange$String$Object$Object('iconable', oldValue, newValue);
  }
  /**
   * Gets the <code>iconable</code> property,
   * which by default is <code>false</code>.
   *
   * @return the value of the <code>iconable</code> property.
   *
   * @see #setIconifiable
   */
  isIconifiable(): boolean {
    return this.iconable;
  }
  /**
   * Returns whether the <code>JInternalFrame</code> is currently iconified.
   *
   * @return <code>true</code> if this internal frame is iconified
   */
  isIcon(): boolean {
    return this.isIcon_;
  }
  /**
   * Iconifies or de-iconifies this internal frame,
   * if the look and feel supports iconification.
   * If the internal frame's state changes to iconified,
   * this method fires an <code>INTERNAL_FRAME_ICONIFIED</code> event.
   * If the state changes to de-iconified,
   * an <code>INTERNAL_FRAME_DEICONIFIED</code> event is fired.
   *
   * @param b a boolean, where <code>true</code> means to iconify this internal frame and
   *          <code>false</code> means to de-iconify it
   * @throws PropertyVetoException when the attempt to set the
   *            property is vetoed by the <code>JInternalFrame</code>
   *
   * @see InternalFrameEvent#INTERNAL_FRAME_ICONIFIED
   * @see InternalFrameEvent#INTERNAL_FRAME_DEICONIFIED
   */
  setIcon(b: boolean): void {
    if (this.isIcon_ === b) {
      return;
    }
    this.firePropertyChange$String$Object$Object('ancestor', null, this.getParent());
    let oldValue = this.isIcon_ ? true : false;
    let newValue = b ? true : false;
    this.fireVetoableChange(JInternalFrame.IS_ICON_PROPERTY, oldValue, newValue);
    this.isIcon_ = b;
    this.firePropertyChange$String$Object$Object(JInternalFrame.IS_ICON_PROPERTY, oldValue, newValue);
    if (b) {
      this.fireInternalFrameEvent(InternalFrameEvent.INTERNAL_FRAME_ICONIFIED);
    } else {
      this.fireInternalFrameEvent(InternalFrameEvent.INTERNAL_FRAME_DEICONIFIED);
    }
  }
  /**
   * Sets the <code>maximizable</code> property,
   * which determines whether the <code>JInternalFrame</code>
   * can be maximized by
   * some user action.
   * Some look and feels might not support maximizing internal frames;
   * they will ignore this property.
   *
   * @param b <code>true</code> to specify that this internal frame should be maximizable; <code>false</code> to specify that it should not be
   */
  setMaximizable(b: boolean): void {
    let oldValue = this.maximizable ? true : false;
    let newValue = b ? true : false;
    this.maximizable = b;
    this.firePropertyChange$String$Object$Object('maximizable', oldValue, newValue);
  }
  /**
   * Gets the value of the <code>maximizable</code> property.
   *
   * @return the value of the <code>maximizable</code> property
   * @see #setMaximizable
   */
  isMaximizable(): boolean {
    return this.maximizable;
  }
  /**
   * Returns whether the <code>JInternalFrame</code> is currently maximized.
   *
   * @return <code>true</code> if this internal frame is maximized, <code>false</code> otherwise
   */
  isMaximum(): boolean {
    return this.isMaximum_;
  }
  /**
   * Maximizes and restores this internal frame.  A maximized frame is resized to
   * fully fit the <code>JDesktopPane</code> area associated with the
   * <code>JInternalFrame</code>.
   * A restored frame's size is set to the <code>JInternalFrame</code>'s
   * actual size.
   *
   * @param b  a boolean, where <code>true</code> maximizes this internal frame and <code>false</code>
   *           restores it
   * @throws PropertyVetoException when the attempt to set the
   *            property is vetoed by the <code>JInternalFrame</code>
   */
  setMaximum(b: boolean): void {
    if (this.isMaximum_ === b) {
      return;
    }
    let oldValue = this.isMaximum_ ? true : false;
    let newValue = b ? true : false;
    this.fireVetoableChange(JInternalFrame.IS_MAXIMUM_PROPERTY, oldValue, newValue);
    this.isMaximum_ = b;
    this.firePropertyChange$String$Object$Object(JInternalFrame.IS_MAXIMUM_PROPERTY, oldValue, newValue);
  }
  /**
   * Returns the title of the <code>JInternalFrame</code>.
   *
   * @return a <code>String</code> containing this internal frame's title
   * @see #setTitle
   */
  getTitle(): string {
    return this.title;
  }
  /**
   * Sets the <code>JInternalFrame</code> title. <code>title</code>
   * may have a <code>null</code> value.
   * @see #getTitle
   *
   * @param title  the <code>String</code> to display in the title bar
   */
  setTitle(title: string): void {
    let oldValue = this.title;
    this.title = title;
    this.firePropertyChange$String$Object$Object(JInternalFrame.TITLE_PROPERTY, oldValue, title);
  }
  /**
   * Selects or deselects the internal frame
   * if it's showing.
   * A <code>JInternalFrame</code> normally draws its title bar
   * differently if it is
   * the selected frame, which indicates to the user that this
   * internal frame has the focus.
   * When this method changes the state of the internal frame
   * from deselected to selected, it fires an
   * <code>InternalFrameEvent.INTERNAL_FRAME_ACTIVATED</code> event.
   * If the change is from selected to deselected,
   * an <code>InternalFrameEvent.INTERNAL_FRAME_DEACTIVATED</code> event
   * is fired.
   *
   * @param selected  a boolean, where <code>true</code> means this internal frame
   *                  should become selected (currently active)
   *                  and <code>false</code> means it should become deselected
   * @throws PropertyVetoException when the attempt to set the
   *            property is vetoed by the <code>JInternalFrame</code>
   *
   * @see #isShowing
   * @see InternalFrameEvent#INTERNAL_FRAME_ACTIVATED
   * @see InternalFrameEvent#INTERNAL_FRAME_DEACTIVATED
   */
  setSelected(selected: boolean): void {
    if (selected && this.isSelected_) {
      this.restoreSubcomponentFocus();
      return;
    }
    if ((this.isSelected_ === selected) || (selected && (this.isIcon_ ? !this.desktopIcon.isShowing() : !this.isShowing()))) {
      return;
    }
    let oldValue = this.isSelected_ ? true : false;
    let newValue = selected ? true : false;
    this.fireVetoableChange(JInternalFrame.IS_SELECTED_PROPERTY, oldValue, newValue);
    if (selected) {
      this.restoreSubcomponentFocus();
    }
    this.isSelected_ = selected;
    this.firePropertyChange$String$Object$Object(JInternalFrame.IS_SELECTED_PROPERTY, oldValue, newValue);
    if (this.isSelected_) {
      this.fireInternalFrameEvent(InternalFrameEvent.INTERNAL_FRAME_ACTIVATED);
    } else {
      this.fireInternalFrameEvent(InternalFrameEvent.INTERNAL_FRAME_DEACTIVATED);
      try {
        Toolkit.getDefaultToolkit().getSystemEventQueue().postEvent$AWTEvent(new UngrabEvent()._UngrabEvent(this));
      } catch ($e0) {
        if ($J.isa($e0, SecurityException)) {
          let e = $J.exc($e0);
          this.dispatchEvent(new UngrabEvent()._UngrabEvent(this));
        } else {
          throw $e0;
        }
      }
    }
    this.repaint$();
  }
  /**
   * Returns whether the <code>JInternalFrame</code> is the
   * currently "selected" or active frame.
   *
   * @return <code>true</code> if this internal frame is currently selected (active)
   * @see #setSelected
   */
  isSelected(): boolean {
    return this.isSelected_;
  }
  /**
   * Sets an image to be displayed in the titlebar of this internal frame (usually
   * in the top-left corner).
   * Some look and feels might not support displaying an icon in the titlebar.
   *
   * This image is not the <code>desktopIcon</code> object, which
   * is the image displayed in the <code>JDesktop</code> when
   * this internal frame is iconified.
   *
   * Passing <code>null</code> to this function is valid,
   * but the look and feel can choose the appropriate behavior
   * for that situation, such as displaying no icon
   * or a default icon for the look and feel.
   *
   * @param icon the <code>Icon</code> to display in the title bar
   * @see #getFrameIcon
   */
  setFrameIcon(icon: Icon): void {
    let oldIcon = this.frameIcon;
    this.frameIcon = icon;
    this.firePropertyChange$String$Object$Object(JInternalFrame.FRAME_ICON_PROPERTY, oldIcon, icon);
  }
  /**
   * Returns the image displayed in the title bar of this internal frame (usually
   * in the top-left corner).
   *
   * @return the <code>Icon</code> displayed in the title bar
   * @see #setFrameIcon
   */
  getFrameIcon(): Icon {
    return this.frameIcon;
  }
  /**
   * Convenience method that moves this component to position 0 if its
   * parent is a <code>JLayeredPane</code>.
   */
  moveToFront(): void {
    if (this.isIcon()) {
      if (this.getDesktopIcon().getParent() instanceof JLayeredPane) {
        (this.getDesktopIcon().getParent()).moveToFront(this.getDesktopIcon());
      }
    } else if (this.getParent() instanceof JLayeredPane) {
      (this.getParent()).moveToFront(this);
    }
  }
  /**
   * Convenience method that moves this component to position -1 if its
   * parent is a <code>JLayeredPane</code>.
   */
  moveToBack(): void {
    if (this.isIcon()) {
      if (this.getDesktopIcon().getParent() instanceof JLayeredPane) {
        (this.getDesktopIcon().getParent()).moveToBack(this.getDesktopIcon());
      }
    } else if (this.getParent() instanceof JLayeredPane) {
      (this.getParent()).moveToBack(this);
    }
  }
  /**
   * Returns the last <code>Cursor</code> that was set by the
   * <code>setCursor</code> method that is not a resizable
   * <code>Cursor</code>.
   *
   * @return the last non-resizable <code>Cursor</code>
   * @since 1.6
   */
  getLastCursor(): Cursor {
    return this.lastCursor;
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  setCursor$Cursor(cursor: Cursor): void {
    if (cursor == null) {
      this.lastCursor = null;
      super.setCursor$Cursor(cursor);
      return;
    }
    let type$ = cursor.getType();
    if (!(type$ === Cursor.SW_RESIZE_CURSOR || type$ === Cursor.SE_RESIZE_CURSOR || type$ === Cursor.NW_RESIZE_CURSOR || type$ === Cursor.NE_RESIZE_CURSOR || type$ === Cursor.N_RESIZE_CURSOR || type$ === Cursor.S_RESIZE_CURSOR || type$ === Cursor.W_RESIZE_CURSOR || type$ === Cursor.E_RESIZE_CURSOR)) {
      this.lastCursor = cursor;
    }
    super.setCursor$Cursor(cursor);
  }
  /**
   * Convenience method that searches the ancestor hierarchy for a
   * <code>JDesktop</code> instance. If <code>JInternalFrame</code>
   * finds none, the <code>desktopIcon</code> tree is searched.
   *
   * @return the <code>JDesktopPane</code> this internal frame belongs to,
   *         or <code>null</code> if none is found
   */
  getDesktopPane(): JDesktopPane {
    let p: Container;
    p = this.getParent();
    while (p != null && !(p instanceof JDesktopPane)) {
      p = p.getParent();
    }
    if (p == null) {
      p = this.getDesktopIcon().getParent();
      while (p != null && !(p instanceof JDesktopPane)) {
        p = p.getParent();
      }
    }
    return p;
  }
  /**
   * Returns the <code>JDesktopIcon</code> used when this
   * <code>JInternalFrame</code> is iconified.
   *
   * @return the <code>JDesktopIcon</code> displayed on the desktop
   * @see #setDesktopIcon
   */
  getDesktopIcon(): JInternalFrame$JDesktopIcon {
    return this.desktopIcon;
  }
  /**
   * If the <code>JInternalFrame</code> is not in maximized state, returns
   * <code>getBounds()</code>; otherwise, returns the bounds that the
   * <code>JInternalFrame</code> would be restored to.
   *
   * @return a <code>Rectangle</code> containing the bounds of this
   *          frame when in the normal state
   * @since 1.3
   */
  getNormalBounds(): Rectangle {
    if (this.normalBounds != null) {
      return this.normalBounds;
    } else {
      return this.getBounds$();
    }
  }
  /**
   * Sets the normal bounds for this internal frame, the bounds that
   * this internal frame would be restored to from its maximized state.
   * This method is intended for use only by desktop managers.
   *
   * @param r the bounds that this internal frame should be restored to
   * @since 1.3
   */
  setNormalBounds(r: Rectangle): void {
    this.normalBounds = r;
  }
  /**
   * If this <code>JInternalFrame</code> is active,
   * returns the child that has focus.
   * Otherwise, returns <code>null</code>.
   *
   * @return the component with focus, or <code>null</code> if no children have focus
   * @since 1.3
   */
  getFocusOwner(): Component {
    if (this.isSelected()) {
      return this.lastFocusOwner;
    }
    return null;
  }
  /**
   * Returns the child component of this <code>JInternalFrame</code>
   * that will receive the
   * focus when this <code>JInternalFrame</code> is selected.
   * If this <code>JInternalFrame</code> is
   * currently selected, this method returns the same component as
   * the <code>getFocusOwner</code> method.
   * If this <code>JInternalFrame</code> is not selected,
   * then the child component that most recently requested focus will be
   * returned. If no child component has ever requested focus, then this
   * <code>JInternalFrame</code>'s initial focusable component is returned.
   * If no such
   * child exists, then this <code>JInternalFrame</code>'s default component
   * to focus is returned.
   *
   * @return the child component that will receive focus when this
   *         <code>JInternalFrame</code> is selected
   * @see #getFocusOwner
   * @see #isSelected
   * @since 1.4
   */
  getMostRecentFocusOwner(): Component {
    if (this.isSelected()) {
      return this.getFocusOwner();
    }
    if (this.lastFocusOwner != null) {
      return this.lastFocusOwner;
    }
    let policy = this.getFocusTraversalPolicy();
    if (policy instanceof InternalFrameFocusTraversalPolicy) {
      return (policy).getInitialComponent$JInternalFrame(this);
    }
    let toFocus = policy.getDefaultComponent(this);
    if (toFocus != null) {
      return toFocus;
    }
    return this.getContentPane();
  }
  /**
   * Requests the internal frame to restore focus to the
   * last subcomponent that had focus. This is used by the UI when
   * the user selected this internal frame --
   * for example, by clicking on the title bar.
   *
   * @since 1.3
   */
  restoreSubcomponentFocus(): void {
    if (this.isIcon()) {
      SwingUtilities2.compositeRequestFocus(this.getDesktopIcon());
    } else {
      let component = KeyboardFocusManager.getCurrentKeyboardFocusManager$().getPermanentFocusOwner();
      if ((component == null) || !SwingUtilities.isDescendingFrom(component, this)) {
        this.setLastFocusOwner(this.getMostRecentFocusOwner());
        if (this.lastFocusOwner == null) {
          this.setLastFocusOwner(this.getContentPane());
        }
        this.lastFocusOwner.requestFocus$();
      }
    }
  }
  setLastFocusOwner(component: Component): void {
    this.lastFocusOwner = component;
  }
  /**
   * Moves and resizes this component.  Unlike other components,
   * this implementation also forces re-layout, so that frame
   * decorations such as the title bar are always redisplayed.
   *
   * @param x  an integer giving the component's new horizontal position
   *           measured in pixels from the left of its container
   * @param y  an integer giving the component's new vertical position,
   *           measured in pixels from the bottom of its container
   * @param width  an integer giving the component's new width in pixels
   * @param height an integer giving the component's new height in pixels
   */
  reshape(x: number, y: number, width: number, height: number): void {
    super.reshape(x, y, width, height);
    this.validate();
    this.repaint$();
  }
  /**
   * Adds the specified listener to receive internal
   * frame events from this internal frame.
   *
   * @param l the internal frame listener
   */
  addInternalFrameListener(l: InternalFrameListener): void {
    this.listenerList.add($J.cls(InternalFrameListener), l);
    this.enableEvents(0);
  }
  /**
   * Removes the specified internal frame listener so that it no longer
   * receives internal frame events from this internal frame.
   *
   * @param l the internal frame listener
   */
  removeInternalFrameListener(l: InternalFrameListener): void {
    this.listenerList.remove($J.cls(InternalFrameListener), l);
  }
  /**
   * Fires an internal frame event.
   *
   * @param id  the type of the event being fired; one of the following:
   * <ul>
   * <li><code>InternalFrameEvent.INTERNAL_FRAME_OPENED</code>
   * <li><code>InternalFrameEvent.INTERNAL_FRAME_CLOSING</code>
   * <li><code>InternalFrameEvent.INTERNAL_FRAME_CLOSED</code>
   * <li><code>InternalFrameEvent.INTERNAL_FRAME_ICONIFIED</code>
   * <li><code>InternalFrameEvent.INTERNAL_FRAME_DEICONIFIED</code>
   * <li><code>InternalFrameEvent.INTERNAL_FRAME_ACTIVATED</code>
   * <li><code>InternalFrameEvent.INTERNAL_FRAME_DEACTIVATED</code>
   * </ul>
   * If the event type is not one of the above, nothing happens.
   */
  fireInternalFrameEvent(id: number): void {
    let listeners = this.listenerList.getListenerList();
    let e = null;
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(InternalFrameListener)) {
        if (e == null) {
          e = new InternalFrameEvent()._InternalFrameEvent(this, id);
        }
        switch (e.getID()) {
          case InternalFrameEvent.INTERNAL_FRAME_OPENED:
            (listeners[(i + 1) | 0]).internalFrameOpened(e);
            break;
          case InternalFrameEvent.INTERNAL_FRAME_CLOSING:
            (listeners[(i + 1) | 0]).internalFrameClosing(e);
            break;
          case InternalFrameEvent.INTERNAL_FRAME_CLOSED:
            (listeners[(i + 1) | 0]).internalFrameClosed(e);
            break;
          case InternalFrameEvent.INTERNAL_FRAME_ICONIFIED:
            (listeners[(i + 1) | 0]).internalFrameIconified(e);
            break;
          case InternalFrameEvent.INTERNAL_FRAME_DEICONIFIED:
            (listeners[(i + 1) | 0]).internalFrameDeiconified(e);
            break;
          case InternalFrameEvent.INTERNAL_FRAME_ACTIVATED:
            (listeners[(i + 1) | 0]).internalFrameActivated(e);
            break;
          case InternalFrameEvent.INTERNAL_FRAME_DEACTIVATED:
            (listeners[(i + 1) | 0]).internalFrameDeactivated(e);
            break;
          default:
            break;
        }
      }
    }
  }
  /**
   * Fires an
   * <code>INTERNAL_FRAME_CLOSING</code> event
   * and then performs the action specified by
   * the internal frame's default close operation.
   * This method is typically invoked by the
   * look-and-feel-implemented action handler
   * for the internal frame's close button.
   *
   * @since 1.3
   * @see #setDefaultCloseOperation
   * @see javax.swing.event.InternalFrameEvent#INTERNAL_FRAME_CLOSING
   */
  doDefaultCloseAction(): void {
    this.fireInternalFrameEvent(InternalFrameEvent.INTERNAL_FRAME_CLOSING);
    switch (this.defaultCloseOperation) {
      case WindowConstants.DO_NOTHING_ON_CLOSE:
        break;
      case WindowConstants.HIDE_ON_CLOSE:
        this.setVisible(false);
        if (this.isSelected()) {
          try {
            this.setSelected(false);
          } catch ($e1) {
            if ($J.isa($e1, PropertyVetoException)) {
              let pve = $J.exc($e1);
            } else {
              throw $e1;
            }
          }
        }
        break;
      case WindowConstants.DISPOSE_ON_CLOSE:
        try {
          this.fireVetoableChange(JInternalFrame.IS_CLOSED_PROPERTY, false, true);
          this.isClosed_ = true;
          this.setVisible(false);
          this.firePropertyChange$String$Object$Object(JInternalFrame.IS_CLOSED_PROPERTY, false, true);
          this.dispose();
        } catch ($e2) {
          if ($J.isa($e2, PropertyVetoException)) {
            let pve = $J.exc($e2);
          } else {
            throw $e2;
          }
        }
        break;
      default:
        break;
    }
  }
  /**
   * Causes subcomponents of this <code>JInternalFrame</code>
   * to be laid out at their preferred size.  Internal frames that are
   * iconized or maximized are first restored and then packed.  If the
   * internal frame is unable to be restored its state is not changed
   * and will not be packed.
   *
   * @see       java.awt.Window#pack
   */
  pack(): void {
    try {
      if (this.isIcon()) {
        this.setIcon(false);
      } else if (this.isMaximum()) {
        this.setMaximum(false);
      }
    } catch ($e3) {
      if ($J.isa($e3, PropertyVetoException)) {
        let e = $J.exc($e3);
        return;
      } else {
        throw $e3;
      }
    }
    this.setSize$Dimension(this.getPreferredSize$());
    this.validate();
  }
  /**
   * If the internal frame is not visible,
   * brings the internal frame to the front,
   * makes it visible,
   * and attempts to select it.
   * The first time the internal frame is made visible,
   * this method also fires an <code>INTERNAL_FRAME_OPENED</code> event.
   * This method does nothing if the internal frame is already visible.
   * Invoking this method
   * has the same result as invoking
   * <code>setVisible(true)</code>.
   *
   * @see #moveToFront
   * @see #setSelected
   * @see InternalFrameEvent#INTERNAL_FRAME_OPENED
   * @see #setVisible
   */
  show$(): void {
    if (this.isVisible$()) {
      return;
    }
    if (!this.opened) {
      this.fireInternalFrameEvent(InternalFrameEvent.INTERNAL_FRAME_OPENED);
      this.opened = true;
    }
    this.getDesktopIcon().setVisible(true);
    this.toFront();
    super.show$();
    if (this.isIcon_) {
      return;
    }
    if (!this.isSelected()) {
      try {
        this.setSelected(true);
      } catch ($e4) {
        if ($J.isa($e4, PropertyVetoException)) {
          let pve = $J.exc($e4);
        } else {
          throw $e4;
        }
      }
    }
  }
  hide(): void {
    if (this.isIcon()) {
      this.getDesktopIcon().setVisible(false);
    }
    super.hide();
  }
  /**
   * Makes this internal frame
   * invisible, unselected, and closed.
   * If the frame is not already closed,
   * this method fires an
   * <code>INTERNAL_FRAME_CLOSED</code> event.
   * The results of invoking this method are similar to
   * <code>setClosed(true)</code>,
   * but <code>dispose</code> always succeeds in closing
   * the internal frame and does not fire
   * an <code>INTERNAL_FRAME_CLOSING</code> event.
   *
   * @see javax.swing.event.InternalFrameEvent#INTERNAL_FRAME_CLOSED
   * @see #setVisible
   * @see #setSelected
   * @see #setClosed
   */
  dispose(): void {
    if (this.isVisible$()) {
      this.setVisible(false);
    }
    if (!this.isClosed_) {
      this.firePropertyChange$String$Object$Object(JInternalFrame.IS_CLOSED_PROPERTY, false, true);
      this.isClosed_ = true;
    }
    this.fireInternalFrameEvent(InternalFrameEvent.INTERNAL_FRAME_CLOSED);
    try {
      Toolkit.getDefaultToolkit().getSystemEventQueue().postEvent$AWTEvent(new UngrabEvent()._UngrabEvent(this));
    } catch ($e5) {
      if ($J.isa($e5, SecurityException)) {
        let e = $J.exc($e5);
        this.dispatchEvent(new UngrabEvent()._UngrabEvent(this));
      } else {
        throw $e5;
      }
    }
  }
  /**
   * Brings this internal frame to the front.
   * Places this internal frame  at the top of the stacking order
   * and makes the corresponding adjustment to other visible internal
   * frames.
   *
   * @see       java.awt.Window#toFront
   * @see       #moveToFront
   */
  toFront(): void {
    this.moveToFront();
  }
  /**
   * Does nothing because <code>JInternalFrame</code>s must always be roots of a focus
   * traversal cycle.
   *
   * @param focusCycleRoot this value is ignored
   * @see #isFocusCycleRoot
   * @see java.awt.Container#setFocusTraversalPolicy
   * @see java.awt.Container#getFocusTraversalPolicy
   * @since 1.4
   */
  setFocusCycleRoot(focusCycleRoot: boolean): void {
  }
  /**
   * Always returns <code>true</code> because all <code>JInternalFrame</code>s must be
   * roots of a focus traversal cycle.
   *
   * @return <code>true</code>
   * @see #setFocusCycleRoot
   * @see java.awt.Container#setFocusTraversalPolicy
   * @see java.awt.Container#getFocusTraversalPolicy
   * @since 1.4
   */
  isFocusCycleRoot$(): boolean {
    return true;
  }
  /**
   * Always returns <code>null</code> because <code>JInternalFrame</code>s
   * must always be roots of a focus
   * traversal cycle.
   *
   * @return <code>null</code>
   * @see java.awt.Container#isFocusCycleRoot()
   * @since 1.4
   */
  getFocusCycleRootAncestor(): Container {
    return null;
  }
  /**
   * Returns a string representation of this <code>JInternalFrame</code>.
   * This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JInternalFrame</code>
   */
  paramString(): string {
    let rootPaneString = (this.rootPane != null ? this.rootPane.toString() : '');
    let rootPaneCheckingEnabledString = (this.rootPaneCheckingEnabled ? 'true' : 'false');
    let closableString = (this.closable ? 'true' : 'false');
    let isClosedString = (this.isClosed_ ? 'true' : 'false');
    let maximizableString = (this.maximizable ? 'true' : 'false');
    let isMaximumString = (this.isMaximum_ ? 'true' : 'false');
    let iconableString = (this.iconable ? 'true' : 'false');
    let isIconString = (this.isIcon_ ? 'true' : 'false');
    let resizableString = (this.resizable ? 'true' : 'false');
    let isSelectedString = (this.isSelected_ ? 'true' : 'false');
    let frameIconString = (this.frameIcon != null ? this.frameIcon.toString() : '');
    let titleString = (this.title != null ? this.title : '');
    let desktopIconString = (this.desktopIcon != null ? this.desktopIcon.toString() : '');
    let openedString = (this.opened ? 'true' : 'false');
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
    return super.paramString() + ',closable=' + closableString + ',defaultCloseOperation=' + defaultCloseOperationString + ',desktopIcon=' + desktopIconString + ',frameIcon=' + frameIconString + ',iconable=' + iconableString + ',isClosed=' + isClosedString + ',isIcon=' + isIconString + ',isMaximum=' + isMaximumString + ',isSelected=' + isSelectedString + ',maximizable=' + maximizableString + ',opened=' + openedString + ',resizable=' + resizableString + ',rootPane=' + rootPaneString + ',rootPaneCheckingEnabled=' + rootPaneCheckingEnabledString + ',title=' + titleString;
  }
  /**
   * Overridden to allow optimized painting when the
   * internal frame is being dragged.
   */
  paintComponent(g: Graphics): void {
    if (this.isDragging_) {
      this.danger = true;
    }
    super.paintComponent(g);
  }
  /**
   * Gets the <code>AccessibleContext</code> associated with this
   * <code>JInternalFrame</code>.
   * For internal frames, the <code>AccessibleContext</code>
   * takes the form of an
   * <code>AccessibleJInternalFrame</code> object.
   * A new <code>AccessibleJInternalFrame</code> instance is created if necessary.
   *
   * @return an <code>AccessibleJInternalFrame</code> that serves as the
   *         <code>AccessibleContext</code> of this
   *         <code>JInternalFrame</code>
   * @see AccessibleJInternalFrame
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JInternalFrame$AccessibleJInternalFrame().$o(this)._JInternalFrame$AccessibleJInternalFrame();
    }
    return this.accessibleContext;
  }
  static $clinit() {
    JInternalFrame.PROPERTY_CHANGE_LISTENER_KEY = new StringBuilder('InternalFramePropertyChangeListener');
  }
}

export class JInternalFrame$FocusPropertyChangeListener extends JObject {
  _JInternalFrame$FocusPropertyChangeListener(): this {
    return this;
  }
  propertyChange(e: PropertyChangeEvent): void {
    if (e.getPropertyName() === 'permanentFocusOwner') {
      JInternalFrame.updateLastFocusOwner(e.getNewValue());
    }
  }
}

/**
 * This class implements accessibility support for the
 * <code>JInternalFrame</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to internal frame user-interface
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
export class JInternalFrame$AccessibleJInternalFrame extends JComponent$AccessibleJComponent {
  /**
   * Constructs an {@code AccessibleJInternalFrame}.
   */
  _JInternalFrame$AccessibleJInternalFrame(): this {
    this._JComponent$AccessibleJComponent();
    return this;
  }
  /**
   * Get the accessible name of this object.
   *
   * @return the localized name of the object -- can be <code>null</code> if this
   * object does not have a name
   * @see #setAccessibleName
   */
  getAccessibleName(): string {
    let name = this.accessibleName;
    if (name == null) {
      name = this.$outer.getClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY);
    }
    if (name == null) {
      name = this.$outer.getTitle();
    }
    return name;
  }
}

/**
 * This component represents an iconified version of a
 * <code>JInternalFrame</code>.
 * This API should NOT BE USED by Swing applications, as it will go
 * away in future versions of Swing as its functionality is moved into
 * <code>JInternalFrame</code>.  This class is public only so that
 * UI objects can display a desktop icon.  If an application
 * wants to display a desktop icon, it should create a
 * <code>JInternalFrame</code> instance and iconify it.
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
 * @author David Kloba
 */
export class JInternalFrame$JDesktopIcon extends JComponent {
  internalFrame: JInternalFrame = null;
  /**
   * Creates an icon for an internal frame.
   *
   * @param f  the <code>JInternalFrame</code>
   *              for which the icon is created
   */
  _JInternalFrame$JDesktopIcon(f: JInternalFrame): this {
    this._JComponent();
    this.setVisible(false);
    this.setInternalFrame(f);
    this.updateUI();
    return this;
  }
  /**
   * Sets the look-and-feel object that renders this component.
   *
   * @param ui  the <code>DesktopIconUI</code> look-and-feel object
   * @see UIDefaults#getUI
   */
  setUI$DesktopIconUI(ui: DesktopIconUI): void {
    super.setUI$ComponentUI(ui);
  }
  /**
   * Returns the <code>JInternalFrame</code> that this
   * <code>DesktopIcon</code> is associated with.
   *
   * @return the <code>JInternalFrame</code> with which this icon
   *              is associated
   */
  getInternalFrame(): JInternalFrame {
    return this.internalFrame;
  }
  /**
   * Sets the <code>JInternalFrame</code> with which this
   * <code>DesktopIcon</code> is associated.
   *
   * @param f  the <code>JInternalFrame</code> with which this icon
   *              is associated
   */
  setInternalFrame(f: JInternalFrame): void {
    this.internalFrame = f;
  }
  /**
   * Convenience method to ask the icon for the <code>Desktop</code>
   * object it belongs to.
   *
   * @return the <code>JDesktopPane</code> that contains this
   *           icon's internal frame, or <code>null</code> if none found
   */
  getDesktopPane(): JDesktopPane {
    if (this.getInternalFrame() != null) {
      return this.getInternalFrame().getDesktopPane();
    }
    return null;
  }
  /**
   * Notification from the <code>UIManager</code> that the look and feel
   * has changed.
   * Replaces the current UI object with the latest version from the
   * <code>UIManager</code>.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    let hadUI = (this.ui != null);
    this.setUI$DesktopIconUI(UIManager.getUI(this));
    this.invalidate();
    let r = this.getPreferredSize$();
    this.setSize$int$int(r.width_, r.height_);
    if (this.internalFrame != null && this.internalFrame.getUI() != null) {
      SwingUtilities.updateComponentTreeUI(this.internalFrame);
    }
  }
  updateUIWhenHidden(): void {
    this.setUI$DesktopIconUI(UIManager.getUI(this));
    let r = this.getPreferredSize$();
    this.setSize$int$int(r.width_, r.height_);
    this.invalidate();
    let children = this.getComponents();
    if (children != null) {
      for (let child of children) {
        SwingUtilities.updateComponentTreeUI(child);
      }
    }
  }
  /**
   * Returns the name of the look-and-feel
   * class that renders this component.
   *
   * @return the string "DesktopIconUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return 'DesktopIconUI';
  }
  /**
   * Gets the AccessibleContext associated with this JDesktopIcon.
   * For desktop icons, the AccessibleContext takes the form of an
   * AccessibleJDesktopIcon.
   * A new AccessibleJDesktopIcon instance is created if necessary.
   *
   * @return an AccessibleJDesktopIcon that serves as the
   *         AccessibleContext of this JDesktopIcon
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JInternalFrame$JDesktopIcon$AccessibleJDesktopIcon().$o(this)._JInternalFrame$JDesktopIcon$AccessibleJDesktopIcon();
    }
    return this.accessibleContext;
  }
}

/**
 * This class implements accessibility support for the
 * <code>JInternalFrame.JDesktopIcon</code> class.  It provides an
 * implementation of the Java Accessibility API appropriate to
 * desktop icon user-interface elements.
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
export class JInternalFrame$JDesktopIcon$AccessibleJDesktopIcon extends JComponent$AccessibleJComponent {
  /**
   * Constructs an {@code AccessibleJDesktopIcon}.
   */
  _JInternalFrame$JDesktopIcon$AccessibleJDesktopIcon(): this {
    this._JComponent$AccessibleJComponent();
    return this;
  }
}

$J.define(JInternalFrame, 'javax.swing.JInternalFrame', { kind: 'class', ifaces: ['javax.accessibility.Accessible', 'javax.swing.WindowConstants', 'javax.swing.RootPaneContainer'], sup: 'javax.swing.JComponent', ctors: { 'java.lang.String,boolean,boolean,boolean,boolean': '_JInternalFrame$String$boolean$boolean$boolean$boolean', 'java.lang.String,boolean,boolean,boolean': '_JInternalFrame$String$boolean$boolean$boolean', 'java.lang.String,boolean,boolean': '_JInternalFrame$String$boolean$boolean', 'java.lang.String,boolean': '_JInternalFrame$String$boolean', 'java.lang.String': '_JInternalFrame$String', '': '_JInternalFrame$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JInternalFrame', 'isFocusCycleRoot()': 'isFocusCycleRoot$', 'show()': 'show$', 'setLayer(int)': 'setLayer$int', 'setLayer(java.lang.Integer)': 'setLayer$Integer', 'setCursor(java.awt.Cursor)': 'setCursor$Cursor', 'remove(java.awt.Component)': 'remove$Component', 'setUI(javax.swing.plaf.InternalFrameUI)': 'setUI$InternalFrameUI' }, clinit: true, lazy: ['PROPERTY_CHANGE_LISTENER_KEY'] });
$J.define(JInternalFrame$FocusPropertyChangeListener, 'javax.swing.JInternalFrame$FocusPropertyChangeListener', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_JInternalFrame$FocusPropertyChangeListener' } });
$J.define(JInternalFrame$AccessibleJInternalFrame, 'javax.swing.JInternalFrame$AccessibleJInternalFrame', { kind: 'class', ifaces: ['javax.accessibility.AccessibleValue'], sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JInternalFrame$AccessibleJInternalFrame' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.define(JInternalFrame$JDesktopIcon, 'javax.swing.JInternalFrame$JDesktopIcon', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { 'javax.swing.JInternalFrame': '_JInternalFrame$JDesktopIcon' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JInternalFrame_JDesktopIcon', 'setUI(javax.swing.plaf.DesktopIconUI)': 'setUI$DesktopIconUI' } });
$J.define(JInternalFrame$JDesktopIcon$AccessibleJDesktopIcon, 'javax.swing.JInternalFrame$JDesktopIcon$AccessibleJDesktopIcon', { kind: 'class', ifaces: ['javax.accessibility.AccessibleValue'], sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JInternalFrame$JDesktopIcon$AccessibleJDesktopIcon' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  Cursor = $J.load('java.awt.Cursor');
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  Window = $J.load('java.awt.Window');
  PropertyVetoException = $J.load('java.beans.PropertyVetoException');
  AccessibleContext = $J.load('javax.accessibility.AccessibleContext');
  InternalFrameFocusTraversalPolicy = $J.load('javax.swing.InternalFrameFocusTraversalPolicy');
  JDesktopPane = $J.load('javax.swing.JDesktopPane');
  JLayeredPane = $J.load('javax.swing.JLayeredPane');
  JRootPane = $J.load('javax.swing.JRootPane');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  WindowConstants = $J.load('javax.swing.WindowConstants');
  InternalFrameEvent = $J.load('javax.swing.event.InternalFrameEvent');
  InternalFrameListener = $J.load('javax.swing.event.InternalFrameListener');
  UngrabEvent = $J.load('sun.awt.UngrabEvent');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
