// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JRootPane.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, AccessController, GetBooleanAction, IllegalArgumentException, JObject, NullPointerException, Thread } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';

let AWTEvent, BorderLayout, Dimension, IllegalComponentStateException, Rectangle, JLayeredPane, JPanel, RepaintManager, UIManager;

/**
 * A lightweight container used behind the scenes by
 * <code>JFrame</code>, <code>JDialog</code>, <code>JWindow</code>,
 * <code>JApplet</code>, and <code>JInternalFrame</code>.
 * For task-oriented information on functionality provided by root panes
 * see <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/rootpane.html">How to Use Root Panes</a>,
 * a section in <em>The Java Tutorial</em>.
 *
 * <p>
 * The following image shows the relationships between
 * the classes that use root panes.
 * <p style="text-align:center"><img src="doc-files/JRootPane-1.gif"
 * alt="The following text describes this graphic."
 * HEIGHT=484 WIDTH=629></p>
 * The &quot;heavyweight&quot; components (those that delegate to a peer, or native
 * component on the host system) are shown with a darker, heavier box. The four
 * heavyweight JFC/Swing containers (<code>JFrame</code>, <code>JDialog</code>,
 * <code>JWindow</code>, and <code>JApplet</code>) are
 * shown in relation to the AWT classes they extend.
 * These four components are the
 * only heavyweight containers in the Swing library. The lightweight container
 * <code>JInternalFrame</code> is also shown.
 * All five of these JFC/Swing containers implement the
 * <code>RootPaneContainer</code> interface,
 * and they all delegate their operations to a
 * <code>JRootPane</code> (shown with a little "handle" on top).
 * <blockquote>
 * <b>Note:</b> The <code>JComponent</code> method <code>getRootPane</code>
 * can be used to obtain the <code>JRootPane</code> that contains
 * a given component.
 * </blockquote>
 *
 * <div style="float:right;text-align:center;font-weight:bold">
 *   <p>Example:
 *   <p><img src="doc-files/JRootPane-2.gif"
 *      alt="the following text describes this graphic." height=386 width=349>
 * </div>
 * The diagram at right shows the structure of a <code>JRootPane</code>.
 * A <code>JRootpane</code> is made up of a <code>glassPane</code>,
 * an optional <code>menuBar</code>, and a <code>contentPane</code>.
 * (The <code>JLayeredPane</code> manages the <code>menuBar</code>
 * and the <code>contentPane</code>.)
 * The <code>glassPane</code> sits over the top of everything,
 * where it is in a position to intercept mouse movements.
 * Since the <code>glassPane</code> (like the <code>contentPane</code>)
 * can be an arbitrary component, it is also possible to set up the
 * <code>glassPane</code> for drawing. Lines and images on the
 * <code>glassPane</code> can then range
 * over the frames underneath without being limited by their boundaries.
 * <p>
 * Although the <code>menuBar</code> component is optional,
 * the <code>layeredPane</code>, <code>contentPane</code>,
 * and <code>glassPane</code> always exist.
 * Attempting to set them to <code>null</code> generates an exception.
 * <p>
 * To add components to the <code>JRootPane</code> (other than the
 * optional menu bar), you add the object to the <code>contentPane</code>
 * of the <code>JRootPane</code>, like this:
 * <pre>
 *       rootPane.getContentPane().add(child);
 * </pre>
 * The same principle holds true for setting layout managers, removing
 * components, listing children, etc. All these methods are invoked on
 * the <code>contentPane</code> instead of on the <code>JRootPane</code>.
 * <blockquote>
 * <b>Note:</b> The default layout manager for the <code>contentPane</code> is
 *  a <code>BorderLayout</code> manager. However, the <code>JRootPane</code>
 *  uses a custom <code>LayoutManager</code>.
 *  So, when you want to change the layout manager for the components you added
 *  to a <code>JRootPane</code>, be sure to use code like this:
 * <pre>
 *    rootPane.getContentPane().setLayout(new BoxLayout());
 * </pre></blockquote>
 * If a <code>JMenuBar</code> component is set on the <code>JRootPane</code>,
 * it is positioned along the upper edge of the frame.
 * The <code>contentPane</code> is adjusted in location and size to
 * fill the remaining area.
 * (The <code>JMenuBar</code> and the <code>contentPane</code> are added to the
 * <code>layeredPane</code> component at the
 * <code>JLayeredPane.FRAME_CONTENT_LAYER</code> layer.)
 * <p>
 * The <code>layeredPane</code> is the parent of all children in the
 * <code>JRootPane</code> -- both as the direct parent of the menu and
 * the grandparent of all components added to the <code>contentPane</code>.
 * It is an instance of <code>JLayeredPane</code>,
 * which provides the ability to add components at several layers.
 * This capability is very useful when working with menu popups,
 * dialog boxes, and dragging -- situations in which you need to place
 * a component on top of all other components in the pane.
 * <p>
 * The <code>glassPane</code> sits on top of all other components in the
 * <code>JRootPane</code>.
 * That provides a convenient place to draw above all other components,
 * and makes it possible to intercept mouse events,
 * which is useful both for dragging and for drawing.
 * Developers can use <code>setVisible</code> on the <code>glassPane</code>
 * to control when the <code>glassPane</code> displays over the other children.
 * By default the <code>glassPane</code> is not visible.
 * <p>
 * The custom <code>LayoutManager</code> used by <code>JRootPane</code>
 * ensures that:
 * <OL>
 * <LI>The <code>glassPane</code> fills the entire viewable
 *     area of the <code>JRootPane</code> (bounds - insets).
 * <LI>The <code>layeredPane</code> fills the entire viewable area of the
 *     <code>JRootPane</code>. (bounds - insets)
 * <LI>The <code>menuBar</code> is positioned at the upper edge of the
 *     <code>layeredPane</code>.
 * <LI>The <code>contentPane</code> fills the entire viewable area,
 *     minus the <code>menuBar</code>, if present.
 * </OL>
 * Any other views in the <code>JRootPane</code> view hierarchy are ignored.
 * <p>
 * If you replace the <code>LayoutManager</code> of the <code>JRootPane</code>,
 * you are responsible for managing all of these views.
 * So ordinarily you will want to be sure that you
 * change the layout manager for the <code>contentPane</code> rather than
 * for the <code>JRootPane</code> itself!
 * <p>
 * The painting architecture of Swing requires an opaque
 * <code>JComponent</code>
 * to exist in the containment hierarchy above all other components. This is
 * typically provided by way of the content pane. If you replace the content
 * pane, it is recommended that you make the content pane opaque
 * by way of <code>setOpaque(true)</code>. Additionally, if the content pane
 * overrides <code>paintComponent</code>, it
 * will need to completely fill in the background in an opaque color in
 * <code>paintComponent</code>.
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
 * @see JLayeredPane
 * @see JMenuBar
 * @see JWindow
 * @see JFrame
 * @see JDialog
 * @see JApplet
 * @see JInternalFrame
 * @see JComponent
 * @see BoxLayout
 *
 * @see <a href="http://www.oracle.com/technetwork/articles/java/mixing-components-433992.html">
 * Mixing Heavy and Light Components</a>
 *
 * @author David Kloba
 * @since 1.2
 */
export class JRootPane extends JComponent {
  static readonly uiClassID: string = 'RootPaneUI';
  /**
   * Whether or not we should dump the stack when true double buffering
   * is disabled. Default is false.
   */
  static LOG_DISABLE_TRUE_DOUBLE_BUFFERING: boolean = false;
  /**
   * Whether or not we should ignore requests to disable true double
   * buffering. Default is false.
   */
  static IGNORE_DISABLE_TRUE_DOUBLE_BUFFERING: boolean = false;
  /**
   * Constant used for the windowDecorationStyle property. Indicates that
   * the <code>JRootPane</code> should not provide any sort of
   * Window decorations.
   *
   * @since 1.4
   */
  static readonly NONE: number = 0;
  /**
   * Constant used for the windowDecorationStyle property. Indicates that
   * the <code>JRootPane</code> should provide decorations appropriate for
   * a Frame.
   *
   * @since 1.4
   */
  static readonly FRAME: number = 1;
  /**
   * Constant used for the windowDecorationStyle property. Indicates that
   * the <code>JRootPane</code> should provide decorations appropriate for
   * a Dialog.
   *
   * @since 1.4
   */
  static readonly PLAIN_DIALOG: number = 2;
  /**
   * Constant used for the windowDecorationStyle property. Indicates that
   * the <code>JRootPane</code> should provide decorations appropriate for
   * a Dialog used to display an informational message.
   *
   * @since 1.4
   */
  static readonly INFORMATION_DIALOG: number = 3;
  /**
   * Constant used for the windowDecorationStyle property. Indicates that
   * the <code>JRootPane</code> should provide decorations appropriate for
   * a Dialog used to display an error message.
   *
   * @since 1.4
   */
  static readonly ERROR_DIALOG: number = 4;
  /**
   * Constant used for the windowDecorationStyle property. Indicates that
   * the <code>JRootPane</code> should provide decorations appropriate for
   * a Dialog used to display a <code>JColorChooser</code>.
   *
   * @since 1.4
   */
  static readonly COLOR_CHOOSER_DIALOG: number = 5;
  /**
   * Constant used for the windowDecorationStyle property. Indicates that
   * the <code>JRootPane</code> should provide decorations appropriate for
   * a Dialog used to display a <code>JFileChooser</code>.
   *
   * @since 1.4
   */
  static readonly FILE_CHOOSER_DIALOG: number = 6;
  /**
   * Constant used for the windowDecorationStyle property. Indicates that
   * the <code>JRootPane</code> should provide decorations appropriate for
   * a Dialog used to present a question to the user.
   *
   * @since 1.4
   */
  static readonly QUESTION_DIALOG: number = 7;
  /**
   * Constant used for the windowDecorationStyle property. Indicates that
   * the <code>JRootPane</code> should provide decorations appropriate for
   * a Dialog used to display a warning message.
   *
   * @since 1.4
   */
  static readonly WARNING_DIALOG: number = 8;
  windowDecorationStyle: number = 0;
  /**
   * The menu bar.
   */
  menuBar: JMenuBar = null;
  /**
   * The content pane.
   */
  contentPane: Container = null;
  /**
   * The layered pane that manages the menu bar and content pane.
   */
  layeredPane: JLayeredPane = null;
  /**
   * The glass pane that overlays the menu bar and content pane,
   *  so it can intercept mouse movements and such.
   */
  glassPane: Component = null;
  /**
   * The button that gets activated when the pane has the focus and
   * a UI-specific action like pressing the <b>Enter</b> key occurs.
   */
  defaultButton: JButton = null;
  /**
   * Whether or not true double buffering should be used.  This is typically
   * true, but may be set to false in special situations.  For example,
   * heavy weight popups (backed by a window) set this to false.
   */
  useTrueDoubleBuffering: boolean = false;
  /**
   * Creates a <code>JRootPane</code>, setting up its
   * <code>glassPane</code>, <code>layeredPane</code>,
   * and <code>contentPane</code>.
   */
  _JRootPane(): this {
    this._JComponent();
    this.useTrueDoubleBuffering = true;
    this.setGlassPane(this.createGlassPane());
    this.setLayeredPane(this.createLayeredPane());
    this.setContentPane(this.createContentPane());
    this.setLayout(this.createRootLayout());
    this.setDoubleBuffered(true);
    this.updateUI();
    return this;
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  setDoubleBuffered(aFlag: boolean): void {
    if (this.isDoubleBuffered() !== aFlag) {
      super.setDoubleBuffered(aFlag);
      RepaintManager.currentManager$JComponent(this).doubleBufferingChanged(this);
    }
  }
  /**
   * Returns a constant identifying the type of Window decorations the
   * <code>JRootPane</code> is providing.
   *
   * @return One of <code>NONE</code>, <code>FRAME</code>,
   *        <code>PLAIN_DIALOG</code>, <code>INFORMATION_DIALOG</code>,
   *        <code>ERROR_DIALOG</code>, <code>COLOR_CHOOSER_DIALOG</code>,
   *        <code>FILE_CHOOSER_DIALOG</code>, <code>QUESTION_DIALOG</code> or
   *        <code>WARNING_DIALOG</code>.
   * @see #setWindowDecorationStyle
   * @since 1.4
   */
  getWindowDecorationStyle(): number {
    return this.windowDecorationStyle;
  }
  /**
   * Sets the type of Window decorations (such as borders, widgets for
   * closing a Window, title ...) the <code>JRootPane</code> should
   * provide. The default is to provide no Window decorations
   * (<code>NONE</code>).
   * <p>
   * This is only a hint, and some look and feels may not support
   * this.
   * This is a bound property.
   *
   * @param windowDecorationStyle Constant identifying Window decorations
   *        to provide.
   * @see JDialog#setDefaultLookAndFeelDecorated
   * @see JFrame#setDefaultLookAndFeelDecorated
   * @see LookAndFeel#getSupportsWindowDecorations
   * @throws IllegalArgumentException if <code>style</code> is
   *        not one of: <code>NONE</code>, <code>FRAME</code>,
   *        <code>PLAIN_DIALOG</code>, <code>INFORMATION_DIALOG</code>,
   *        <code>ERROR_DIALOG</code>, <code>COLOR_CHOOSER_DIALOG</code>,
   *        <code>FILE_CHOOSER_DIALOG</code>, <code>QUESTION_DIALOG</code>, or
   *        <code>WARNING_DIALOG</code>.
   * @since 1.4
   */
  setWindowDecorationStyle(windowDecorationStyle: number): void {
    if (windowDecorationStyle < 0 || windowDecorationStyle > JRootPane.WARNING_DIALOG) {
      throw new IllegalArgumentException('Invalid decoration style');
    }
    let oldWindowDecorationStyle = this.getWindowDecorationStyle();
    this.windowDecorationStyle = windowDecorationStyle;
    this.firePropertyChange$String$int$int('windowDecorationStyle', oldWindowDecorationStyle, windowDecorationStyle);
  }
  /**
   * Returns the L&amp;F object that renders this component.
   *
   * @return <code>LabelUI</code> object
   * @since 1.3
   */
  getUI(): RootPaneUI {
    return this.ui;
  }
  /**
   * Sets the L&amp;F object that renders this component.
   *
   * @param ui  the <code>LabelUI</code> L&amp;F object
   * @see UIDefaults#getUI
   * @since 1.3
   */
  setUI$RootPaneUI(ui: RootPaneUI): void {
    super.setUI$ComponentUI(ui);
  }
  /**
   * Resets the UI property to a value from the current look and feel.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    this.setUI$RootPaneUI(UIManager.getUI(this));
  }
  /**
   * Returns a string that specifies the name of the L&amp;F class
   * that renders this component.
   *
   * @return the string "RootPaneUI"
   *
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JRootPane.uiClassID;
  }
  /**
   * Called by the constructor methods to create the default
   * <code>layeredPane</code>.
   * Bt default it creates a new <code>JLayeredPane</code>.
   * @return the default <code>layeredPane</code>
   */
  createLayeredPane(): JLayeredPane {
    let p = new JLayeredPane()._JLayeredPane();
    p.setName(this.getName$() + '.layeredPane');
    return p;
  }
  /**
   * Called by the constructor methods to create the default
   * <code>contentPane</code>.
   * By default this method creates a new <code>JComponent</code> add sets a
   * <code>BorderLayout</code> as its <code>LayoutManager</code>.
   * @return the default <code>contentPane</code>
   */
  createContentPane(): Container {
    let c = new JPanel()._JPanel$();
    c.setName(this.getName$() + '.contentPane');
    c.setLayout(new (JRootPane$1())().$o(this)._BorderLayout$());
    return c;
  }
  /**
   * Called by the constructor methods to create the default
   * <code>glassPane</code>.
   * By default this method creates a new <code>JComponent</code>
   * with visibility set to false.
   * @return the default <code>glassPane</code>
   */
  createGlassPane(): Component {
    let c = new JPanel()._JPanel$();
    c.setName(this.getName$() + '.glassPane');
    c.setVisible(false);
    c.setOpaque(false);
    return c;
  }
  /**
   * Called by the constructor methods to create the default
   * <code>layoutManager</code>.
   * @return the default <code>layoutManager</code>.
   */
  createRootLayout(): LayoutManager {
    return new JRootPane$RootLayout().$o(this)._JRootPane$RootLayout();
  }
  /**
   * Adds or changes the menu bar used in the layered pane.
   * @param menu the <code>JMenuBar</code> to add
   */
  setJMenuBar(menu: JMenuBar): void {
    if (this.menuBar != null && this.menuBar.getParent() === this.layeredPane) {
      this.layeredPane.remove$Component(this.menuBar);
    }
    this.menuBar = menu;
    if (this.menuBar != null) {
      this.menuBar.updateUI();
      this.layeredPane.add$Component$Object(this.menuBar, JLayeredPane.FRAME_CONTENT_LAYER);
    }
  }
  /**
   * Returns the menu bar from the layered pane.
   * @return the <code>JMenuBar</code> used in the pane
   */
  getJMenuBar(): JMenuBar {
    return this.menuBar;
  }
  /**
   * Sets the content pane -- the container that holds the components
   * parented by the root pane.
   * <p>
   * Swing's painting architecture requires an opaque <code>JComponent</code>
   * in the containment hierarchy. This is typically provided by the
   * content pane. If you replace the content pane it is recommended you
   * replace it with an opaque <code>JComponent</code>.
   *
   * @param content the <code>Container</code> to use for component-contents
   * @throws java.awt.IllegalComponentStateException (a runtime
   *            exception) if the content pane parameter is <code>null</code>
   */
  setContentPane(content: Container): void {
    if (content == null) {
      throw new IllegalComponentStateException()._IllegalComponentStateException$String('contentPane cannot be set to null.');
    }
    if (this.contentPane != null && this.contentPane.getParent() === this.layeredPane) {
      this.layeredPane.remove$Component(this.contentPane);
    }
    this.contentPane = content;
    this.layeredPane.add$Component$Object(this.contentPane, JLayeredPane.FRAME_CONTENT_LAYER);
  }
  /**
   * Returns the content pane -- the container that holds the components
   * parented by the root pane.
   *
   * @return the <code>Container</code> that holds the component-contents
   */
  getContentPane(): Container {
    return this.contentPane;
  }
  /**
   * Sets the layered pane for the root pane. The layered pane
   * typically holds a content pane and an optional <code>JMenuBar</code>.
   *
   * @param layered  the <code>JLayeredPane</code> to use
   * @throws java.awt.IllegalComponentStateException (a runtime
   *            exception) if the layered pane parameter is <code>null</code>
   */
  setLayeredPane(layered: JLayeredPane): void {
    if (layered == null) {
      throw new IllegalComponentStateException()._IllegalComponentStateException$String('layeredPane cannot be set to null.');
    }
    if (this.layeredPane != null && this.layeredPane.getParent() === this) {
      this.remove$Component(this.layeredPane);
    }
    this.layeredPane = layered;
    this.add$Component$int(this.layeredPane, -1);
  }
  /**
   * Gets the layered pane used by the root pane. The layered pane
   * typically holds a content pane and an optional <code>JMenuBar</code>.
   *
   * @return the <code>JLayeredPane</code> currently in use
   */
  getLayeredPane(): JLayeredPane {
    return this.layeredPane;
  }
  /**
   * Sets a specified <code>Component</code> to be the glass pane for this
   * root pane.  The glass pane should normally be a lightweight,
   * transparent component, because it will be made visible when
   * ever the root pane needs to grab input events.
   * <p>
   * The new glass pane's visibility is changed to match that of
   * the current glass pane.  An implication of this is that care
   * must be taken when you want to replace the glass pane and
   * make it visible.  Either of the following will work:
   * <pre>
   *   root.setGlassPane(newGlassPane);
   *   newGlassPane.setVisible(true);
   * </pre>
   * or:
   * <pre>
   *   root.getGlassPane().setVisible(true);
   *   root.setGlassPane(newGlassPane);
   * </pre>
   *
   * @param glass the <code>Component</code> to use as the glass pane
   *              for this <code>JRootPane</code>
   * @throws NullPointerException if the <code>glass</code> parameter is
   *          <code>null</code>
   */
  setGlassPane(glass: Component): void {
    if (glass == null) {
      throw new NullPointerException('glassPane cannot be set to null.');
    }
    glass.setMixingCutoutShape(new Rectangle()._Rectangle$());
    let visible = false;
    if (this.glassPane != null && this.glassPane.getParent() === this) {
      this.remove$Component(this.glassPane);
      visible = this.glassPane.isVisible$();
    }
    glass.setVisible(visible);
    this.glassPane = glass;
    this.add$Component$int(this.glassPane, 0);
    if (visible) {
      this.repaint$();
    }
  }
  /**
   * Returns the current glass pane for this <code>JRootPane</code>.
   * @return the current glass pane
   * @see #setGlassPane
   */
  getGlassPane(): Component {
    return this.glassPane;
  }
  /**
   * If a descendant of this <code>JRootPane</code> calls
   * <code>revalidate</code>, validate from here on down.
   * <p>
   * Deferred requests to layout a component and its descendents again.
   * For example, calls to <code>revalidate</code>, are pushed upwards to
   * either a <code>JRootPane</code> or a <code>JScrollPane</code>
   * because both classes override <code>isValidateRoot</code> to return true.
   *
   * @see JComponent#isValidateRoot
   * @see java.awt.Container#isValidateRoot
   * @return true
   */
  isValidateRoot$(): boolean {
    return true;
  }
  /**
   * The <code>glassPane</code> and <code>contentPane</code>
   * have the same bounds, which means <code>JRootPane</code>
   * does not tiles its children and this should return false.
   * On the other hand, the <code>glassPane</code>
   * is normally not visible, and so this can return true if the
   * <code>glassPane</code> isn't visible. Therefore, the
   * return value here depends upon the visibility of the
   * <code>glassPane</code>.
   *
   * @return true if this component's children don't overlap
   */
  isOptimizedDrawingEnabled(): boolean {
    return !this.glassPane.isVisible$();
  }
  /**
   * {@inheritDoc}
   */
  addNotify(): void {
    super.addNotify();
    this.enableEvents(AWTEvent.KEY_EVENT_MASK);
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    super.removeNotify();
  }
  /**
   * Sets the <code>defaultButton</code> property,
   * which determines the current default button for this <code>JRootPane</code>.
   * The default button is the button which will be activated
   * when a UI-defined activation event (typically the <b>Enter</b> key)
   * occurs in the root pane regardless of whether or not the button
   * has keyboard focus (unless there is another component within
   * the root pane which consumes the activation event,
   * such as a <code>JTextPane</code>).
   * For default activation to work, the button must be an enabled
   * descendent of the root pane when activation occurs.
   * To remove a default button from this root pane, set this
   * property to <code>null</code>.
   *
   * @see JButton#isDefaultButton
   * @param defaultButton the <code>JButton</code> which is to be the default button
   */
  setDefaultButton(defaultButton: JButton): void {
    let oldDefault = this.defaultButton;
    if (oldDefault !== defaultButton) {
      this.defaultButton = defaultButton;
      if (oldDefault != null) {
        oldDefault.repaint$();
      }
      if (defaultButton != null) {
        defaultButton.repaint$();
      }
    }
    this.firePropertyChange$String$Object$Object('defaultButton', oldDefault, defaultButton);
  }
  /**
   * Returns the value of the <code>defaultButton</code> property.
   * @return the <code>JButton</code> which is currently the default button
   * @see #setDefaultButton
   */
  getDefaultButton(): JButton {
    return this.defaultButton;
  }
  setUseTrueDoubleBuffering(useTrueDoubleBuffering: boolean): void {
    this.useTrueDoubleBuffering = useTrueDoubleBuffering;
  }
  getUseTrueDoubleBuffering(): boolean {
    return this.useTrueDoubleBuffering;
  }
  disableTrueDoubleBuffering(): void {
    if (this.useTrueDoubleBuffering) {
      if (!JRootPane.IGNORE_DISABLE_TRUE_DOUBLE_BUFFERING) {
        if (JRootPane.LOG_DISABLE_TRUE_DOUBLE_BUFFERING) {
          $J.out.println('Disabling true double buffering for ' + $J.str(this));
          Thread.dumpStack();
        }
        this.useTrueDoubleBuffering = false;
        RepaintManager.currentManager$JComponent(this).doubleBufferingChanged(this);
      }
    }
  }
  /**
   * Overridden to enforce the position of the glass component as
   * the zero child.
   *
   * @param comp the component to be enhanced
   * @param constraints the constraints to be respected
   * @param index the index
   */
  addImpl(comp: Component, constraints: any, index: number): void {
    super.addImpl(comp, constraints, index);
    if (this.glassPane != null && this.glassPane.getParent() === this && this.getComponent$int(0) !== this.glassPane) {
      this.add$Component$int(this.glassPane, 0);
    }
  }
  /**
   * Returns a string representation of this <code>JRootPane</code>.
   * This method is intended to be used only for debugging purposes,
   * and the content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JRootPane</code>.
   */
  paramString(): string {
    return super.paramString();
  }
  /**
   * Gets the <code>AccessibleContext</code> associated with this
   * <code>JRootPane</code>. For root panes, the
   * <code>AccessibleContext</code> takes the form of an
   * <code>AccessibleJRootPane</code>.
   * A new <code>AccessibleJRootPane</code> instance is created if necessary.
   *
   * @return an <code>AccessibleJRootPane</code> that serves as the
   *         <code>AccessibleContext</code> of this <code>JRootPane</code>
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JRootPane$AccessibleJRootPane().$o(this)._JRootPane$AccessibleJRootPane();
    }
    return this.accessibleContext;
  }
  static $clinit() {
    JRootPane.LOG_DISABLE_TRUE_DOUBLE_BUFFERING = AccessController.doPrivileged(new GetBooleanAction('swing.logDoubleBufferingDisable'));
    JRootPane.IGNORE_DISABLE_TRUE_DOUBLE_BUFFERING = AccessController.doPrivileged(new GetBooleanAction('swing.ignoreDoubleBufferingDisable'));
  }
}

/**
 * A custom layout manager that is responsible for the layout of
 * layeredPane, glassPane, and menuBar.
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
export class JRootPane$RootLayout extends JObject {
  /**
   * Constructs a {@code RootLayout}.
   */
  _JRootPane$RootLayout(): this {
    return this;
  }
  /**
   * Returns the amount of space the layout would like to have.
   *
   * @param parent the Container for which this layout manager
   * is being used
   * @return a Dimension object containing the layout's preferred size
   */
  preferredLayoutSize(parent: Container): Dimension {
    let rd: Dimension;
    let mbd: Dimension;
    let i = this.$outer.getInsets$();
    if (this.$outer.contentPane != null) {
      rd = this.$outer.contentPane.getPreferredSize$();
    } else {
      rd = parent.getSize$();
    }
    if (this.$outer.menuBar != null && this.$outer.menuBar.isVisible$()) {
      mbd = this.$outer.menuBar.getPreferredSize$();
    } else {
      mbd = new Dimension()._Dimension$int$int(0, 0);
    }
    return new Dimension()._Dimension$int$int((Math.max(rd.width_, mbd.width_) + i.left + i.right) | 0, (rd.height_ + mbd.height_ + i.top + i.bottom) | 0);
  }
  /**
   * Returns the minimum amount of space the layout needs.
   *
   * @param parent the Container for which this layout manager
   * is being used
   * @return a Dimension object containing the layout's minimum size
   */
  minimumLayoutSize(parent: Container): Dimension {
    let rd: Dimension;
    let mbd: Dimension;
    let i = this.$outer.getInsets$();
    if (this.$outer.contentPane != null) {
      rd = this.$outer.contentPane.getMinimumSize$();
    } else {
      rd = parent.getSize$();
    }
    if (this.$outer.menuBar != null && this.$outer.menuBar.isVisible$()) {
      mbd = this.$outer.menuBar.getMinimumSize$();
    } else {
      mbd = new Dimension()._Dimension$int$int(0, 0);
    }
    return new Dimension()._Dimension$int$int((Math.max(rd.width_, mbd.width_) + i.left + i.right) | 0, (rd.height_ + mbd.height_ + i.top + i.bottom) | 0);
  }
  /**
   * Returns the maximum amount of space the layout can use.
   *
   * @param target the Container for which this layout manager
   * is being used
   * @return a Dimension object containing the layout's maximum size
   */
  maximumLayoutSize(target: Container): Dimension {
    let rd: Dimension;
    let mbd: Dimension;
    let i = this.$outer.getInsets$();
    if (this.$outer.menuBar != null && this.$outer.menuBar.isVisible$()) {
      mbd = this.$outer.menuBar.getMaximumSize();
    } else {
      mbd = new Dimension()._Dimension$int$int(0, 0);
    }
    if (this.$outer.contentPane != null) {
      rd = this.$outer.contentPane.getMaximumSize();
    } else {
      rd = new Dimension()._Dimension$int$int(2147483647, (2147483647 - i.top - i.bottom - mbd.height_ - 1) | 0);
    }
    return new Dimension()._Dimension$int$int((Math.max(rd.width_, mbd.width_) + i.left + i.right) | 0, (rd.height_ + mbd.height_ + i.top + i.bottom) | 0);
  }
  /**
   * Instructs the layout manager to perform the layout for the specified
   * container.
   *
   * @param parent the Container for which this layout manager
   * is being used
   */
  layoutContainer$Container(parent: Container): void {
    let b = parent.getBounds$();
    let i = this.$outer.getInsets$();
    let contentY = 0;
    let w = (b.width_ - i.right - i.left) | 0;
    let h = (b.height_ - i.top - i.bottom) | 0;
    if (this.$outer.layeredPane != null) {
      this.$outer.layeredPane.setBounds$int$int$int$int(i.left, i.top, w, h);
    }
    if (this.$outer.glassPane != null) {
      this.$outer.glassPane.setBounds$int$int$int$int(i.left, i.top, w, h);
    }
    if (this.$outer.menuBar != null && this.$outer.menuBar.isVisible$()) {
      let mbd = this.$outer.menuBar.getPreferredSize$();
      this.$outer.menuBar.setBounds$int$int$int$int(0, 0, w, mbd.height_);
      contentY = (contentY + mbd.height_) | 0;
    }
    if (this.$outer.contentPane != null) {
      this.$outer.contentPane.setBounds$int$int$int$int(0, contentY, w, (h - contentY) | 0);
    }
  }
  addLayoutComponent$String$Component(name: string, comp: Component): void {
  }
  removeLayoutComponent(comp: Component): void {
  }
  addLayoutComponent$Component$Object(comp: Component, constraints: any): void {
  }
  getLayoutAlignmentX(target: Container): number {
    return 0;
  }
  getLayoutAlignmentY(target: Container): number {
    return 0;
  }
  invalidateLayout(target: Container): void {
  }
}

/**
 * This class implements accessibility support for the
 * <code>JRootPane</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to root pane user-interface elements.
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
export class JRootPane$AccessibleJRootPane extends JComponent$AccessibleJComponent {
  /**
   * Constructs an {@code AccessibleJRootPane}.
   */
  _JRootPane$AccessibleJRootPane(): this {
    this._JComponent$AccessibleJComponent();
    return this;
  }
  /**
   * Returns the number of accessible children of the object.
   *
   * @return the number of accessible children of the object.
   */
  getAccessibleChildrenCount(): number {
    return super.getAccessibleChildrenCount();
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
    return super.getAccessibleChild(i);
  }
}

let $JRootPane$1: any = null;
/** An anonymous class (JRootPane.java:486). */
function JRootPane$1(): any {
  return $JRootPane$1 ??= $J.local(class extends BorderLayout {
    addLayoutComponent$Component$Object(comp: Component, constraints: any): void {
      if (constraints == null) {
        constraints = BorderLayout.CENTER;
      }
      super.addLayoutComponent$Component$Object(comp, constraints);
    }
  }, 'javax.swing.JRootPane$1', []);
}

$J.define(JRootPane, 'javax.swing.JRootPane', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { '': '_JRootPane' }, meths: { 'isValidateRoot()': 'isValidateRoot$', 'setUI(javax.swing.plaf.RootPaneUI)': 'setUI$RootPaneUI' }, clinit: true, lazy: ['LOG_DISABLE_TRUE_DOUBLE_BUFFERING', 'IGNORE_DISABLE_TRUE_DOUBLE_BUFFERING'] });
$J.define(JRootPane$RootLayout, 'javax.swing.JRootPane$RootLayout', { kind: 'class', ifaces: ['java.awt.LayoutManager2', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_JRootPane$RootLayout' }, meths: { 'addLayoutComponent(java.awt.Component,java.lang.Object)': 'addLayoutComponent$Component$Object', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component', 'layoutContainer(java.awt.Container)': 'layoutContainer$Container' }, inner: true });
$J.define(JRootPane$AccessibleJRootPane, 'javax.swing.JRootPane$AccessibleJRootPane', { kind: 'class', sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JRootPane$AccessibleJRootPane' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  AWTEvent = $J.load('java.awt.AWTEvent');
  BorderLayout = $J.load('java.awt.BorderLayout');
  Dimension = $J.load('java.awt.Dimension');
  IllegalComponentStateException = $J.load('java.awt.IllegalComponentStateException');
  Rectangle = $J.load('java.awt.Rectangle');
  JLayeredPane = $J.load('javax.swing.JLayeredPane');
  JPanel = $J.load('javax.swing.JPanel');
  RepaintManager = $J.load('javax.swing.RepaintManager');
  UIManager = $J.load('javax.swing.UIManager');
});
