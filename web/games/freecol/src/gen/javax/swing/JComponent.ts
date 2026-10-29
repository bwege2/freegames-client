// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JComponent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Applet, ArrayList, AtomicBoolean, Exception, HashSet, Hashtable, IllegalArgumentException, JObject, Locale, StringBuilder, SunToolkit } from '../../../jre/index.ts';
import { Container } from '../../java/awt/Container.ts';
import { Container$AccessibleAWTContainer } from '../../java/awt/Container.ts';

let AWTEvent, Component$BaselineResizeBehavior, Dimension, Insets, KeyboardFocusManager, Rectangle, RenderingHints, Window, InputEvent, KeyEvent, MouseEvent, PropertyChangeListener, VetoableChangeListener, Accessible, AccessibleContext, AccessibleState, ActionMap, AncestorNotifier, ArrayTable, Autoscroller, CellRendererPane, ClientPropertyKey, ComponentInputMap, DebugGraphics, InputMap, JInternalFrame, JLabel, JToolTip, KeyStroke, KeyboardManager, LegacyGlueFocusTraversalPolicy, LookAndFeel, Popup$HeavyWeightWindow, RepaintManager, SwingUtilities, ToolTipManager, UIClientPropertyKey, UIManager, AbstractBorder, CompoundBorder, TitledBorder, AncestorListener, EventListenerList, AWTAccessor, SwingAccessor, SwingUtilities2;

/**
 * The base class for all Swing components except top-level containers.
 * To use a component that inherits from <code>JComponent</code>,
 * you must place the component in a containment hierarchy
 * whose root is a top-level Swing container.
 * Top-level Swing containers --
 * such as <code>JFrame</code>, <code>JDialog</code>,
 * and <code>JApplet</code> --
 * are specialized components
 * that provide a place for other Swing components to paint themselves.
 * For an explanation of containment hierarchies, see
 * <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/toplevel.html">Swing Components and the Containment Hierarchy</a>,
 * a section in <em>The Java Tutorial</em>.
 *
 * <p>
 * The <code>JComponent</code> class provides:
 * <ul>
 * <li>The base class for both standard and custom components
 *     that use the Swing architecture.
 * <li>A "pluggable look and feel" (L&amp;F) that can be specified by the
 *     programmer or (optionally) selected by the user at runtime.
 *     The look and feel for each component is provided by a
 *     <em>UI delegate</em> -- an object that descends from
 *     {@link javax.swing.plaf.ComponentUI}.
 *     See <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/lookandfeel/plaf.html">How
 *     to Set the Look and Feel</a>
 *     in <em>The Java Tutorial</em>
 *     for more information.
 * <li>Comprehensive keystroke handling.
 *     See the document <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/misc/keybinding.html">How to Use Key Bindings</a>,
 *     an article in <em>The Java Tutorial</em>,
 *     for more information.
 * <li>Support for tool tips --
 *     short descriptions that pop up when the cursor lingers
 *     over a component.
 *     See <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/tooltip.html">How
 *     to Use Tool Tips</a>
 *     in <em>The Java Tutorial</em>
 *     for more information.
 * <li>Support for accessibility.
 *     <code>JComponent</code> contains all of the methods in the
 *     <code>Accessible</code> interface,
 *     but it doesn't actually implement the interface.  That is the
 *     responsibility of the individual classes
 *     that extend <code>JComponent</code>.
 * <li>Support for component-specific properties.
 *     With the {@link #putClientProperty}
 *     and {@link #getClientProperty} methods,
 *     you can associate name-object pairs
 *     with any object that descends from <code>JComponent</code>.
 * <li>An infrastructure for painting
 *     that includes double buffering and support for borders.
 *     For more information see <a
 * href="http://www.oracle.com/technetwork/java/painting-140037.html#swing">Painting</a> and
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/border.html">How
 *     to Use Borders</a>,
 *     both of which are sections in <em>The Java Tutorial</em>.
 * </ul>
 * For more information on these subjects, see the
 * {@link javax.swing Swing package description}
 * and <em>The Java Tutorial</em> section
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/jcomponent.html">The JComponent Class</a>.
 * <p>
 * <code>JComponent</code> and its subclasses document default values
 * for certain properties.  For example, <code>JTable</code> documents the
 * default row height as 16.  Each <code>JComponent</code> subclass
 * that has a <code>ComponentUI</code> will create the
 * <code>ComponentUI</code> as part of its constructor.  In order
 * to provide a particular look and feel each
 * <code>ComponentUI</code> may set properties back on the
 * <code>JComponent</code> that created it.  For example, a custom
 * look and feel may require <code>JTable</code>s to have a row
 * height of 24. The documented defaults are the value of a property
 * BEFORE the <code>ComponentUI</code> has been installed.  If you
 * need a specific value for a particular property you should
 * explicitly set it.
 * <p>
 * A <code>JComponent</code> may contain any number of default or initial
 * components as children. This behaviour may change according to look and
 * feel, therefore a <code>JComponent</code> may contain some default or
 * initial components as children for a particular Look and Feel, whereas it
 * may not do so for some other Look and Feel. Within a particular Look and
 * Feel also, this behaviour may change depending upon the configuration
 * properties of the <code>JComponent</code>. In summary, it is not valid
 * to assume a JComponent has no children just because the application
 * did not directly add them.
 * <p>
 * In release 1.4, the focus subsystem was rearchitected.
 * For more information, see
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/misc/focus.html">
 * How to Use the Focus Subsystem</a>,
 * a section in <em>The Java Tutorial</em>.
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
 * @see KeyStroke
 * @see Action
 * @see #setBorder
 * @see #registerKeyboardAction
 * @see JOptionPane
 * @see #setDebugGraphicsOptions
 * @see #setToolTipText
 * @see #setAutoscrolls
 *
 * @author Hans Muller
 * @author Arnaud Weber
 * @since 1.2
 */
export class JComponent extends Container {
  /**
   * @see #getUIClassID
   * @see #writeObject
   */
  static readonly uiClassID: string = 'ComponentUI';
  /**
   * @see #readObject
   */
  static readObjectCallbacks: Hashtable<ObjectInputStream, JComponent$ReadObjectCallback> = null;
  /**
   * Keys to use for forward focus traversal when the JComponent is
   * managing focus.
   */
  static managingFocusForwardTraversalKeys: JSet<KeyStroke> = null;
  /**
   * Keys to use for backward focus traversal when the JComponent is
   * managing focus.
   */
  static managingFocusBackwardTraversalKeys: JSet<KeyStroke> = null;
  static readonly NOT_OBSCURED: number = 0;
  static readonly PARTIALLY_OBSCURED: number = 1;
  static readonly COMPLETELY_OBSCURED: number = 2;
  /**
   * Set to true when DebugGraphics has been loaded.
   */
  static DEBUG_GRAPHICS_LOADED: boolean = false;
  /**
   * Key used to look up a value from the AppContext to determine the
   * JComponent the InputVerifier is running for. That is, if
   * AppContext.get(INPUT_VERIFIER_SOURCE_KEY) returns non-null, it
   * indicates the EDT is calling into the InputVerifier from the
   * returned component.
   */
  static INPUT_VERIFIER_SOURCE_KEY: any = null;
  isAlignmentXSet: boolean = false;
  alignmentX: number = 0;
  isAlignmentYSet: boolean = false;
  alignmentY: number = 0;
  /**
   * The look and feel delegate for this component.
   */
  ui: ComponentUI = null;
  /**
   * A list of event listeners for this component.
   */
  listenerList: EventListenerList = null;
  clientProperties: ArrayTable = null;
  vetoableChangeSupport: VetoableChangeSupport = null;
  /**
   * Whether or not autoscroll has been enabled.
   */
  autoscrolls: boolean = false;
  border: Border = null;
  flags: number = 0;
  inputVerifier: InputVerifier = null;
  verifyInputWhenFocusTarget: boolean = false;
  /**
   * Set in <code>_paintImmediately</code>.
   * Will indicate the child that initiated the painting operation.
   * If <code>paintingChild</code> is opaque, no need to paint
   * any child components after <code>paintingChild</code>.
   * Test used in <code>paintChildren</code>.
   */
  paintingChild: Component = null;
  /**
   * Constant used for <code>registerKeyboardAction</code> that
   * means that the command should be invoked when
   * the component has the focus.
   */
  static readonly WHEN_FOCUSED: number = 0;
  /**
   * Constant used for <code>registerKeyboardAction</code> that
   * means that the command should be invoked when the receiving
   * component is an ancestor of the focused component or is
   * itself the focused component.
   */
  static readonly WHEN_ANCESTOR_OF_FOCUSED_COMPONENT: number = 1;
  /**
   * Constant used for <code>registerKeyboardAction</code> that
   * means that the command should be invoked when
   * the receiving component is in the window that has the focus
   * or is itself the focused component.
   */
  static readonly WHEN_IN_FOCUSED_WINDOW: number = 2;
  /**
   * Constant used by some of the APIs to mean that no condition is defined.
   */
  static readonly UNDEFINED_CONDITION: number = -1;
  /**
   * The key used by <code>JComponent</code> to access keyboard bindings.
   */
  static readonly KEYBOARD_BINDINGS_KEY: string = '_KeyboardBindings';
  /**
   * An array of <code>KeyStroke</code>s used for
   * <code>WHEN_IN_FOCUSED_WINDOW</code> are stashed
   * in the client properties under this string.
   */
  static readonly WHEN_IN_FOCUSED_WINDOW_BINDINGS: string = '_WhenInFocusedWindow';
  /**
   * The comment to display when the cursor is over the component,
   * also known as a "value tip", "flyover help", or "flyover label".
   */
  static readonly TOOL_TIP_TEXT_KEY: string = 'ToolTipText';
  static readonly NEXT_FOCUS: string = 'nextFocus';
  /**
   * <code>JPopupMenu</code> assigned to this component
   * and all of its children
   */
  popupMenu: JPopupMenu = null;
  /**
   * Private flags
   */
  static readonly IS_DOUBLE_BUFFERED: number = 0;
  static readonly ANCESTOR_USING_BUFFER: number = 1;
  static readonly IS_PAINTING_TILE: number = 2;
  static readonly IS_OPAQUE: number = 3;
  static readonly KEY_EVENTS_ENABLED: number = 4;
  static readonly FOCUS_INPUTMAP_CREATED: number = 5;
  static readonly ANCESTOR_INPUTMAP_CREATED: number = 6;
  static readonly WIF_INPUTMAP_CREATED: number = 7;
  static readonly ACTIONMAP_CREATED: number = 8;
  static readonly CREATED_DOUBLE_BUFFER: number = 9;
  static readonly IS_PRINTING: number = 11;
  static readonly IS_PRINTING_ALL: number = 12;
  static readonly IS_REPAINTING: number = 13;
  /**
   * Bits 14-21 are used to handle nested writeObject calls.
   */
  static readonly WRITE_OBJ_COUNTER_FIRST: number = 14;
  static readonly RESERVED_1: number = 15;
  static readonly RESERVED_2: number = 16;
  static readonly RESERVED_3: number = 17;
  static readonly RESERVED_4: number = 18;
  static readonly RESERVED_5: number = 19;
  static readonly RESERVED_6: number = 20;
  static readonly WRITE_OBJ_COUNTER_LAST: number = 21;
  static readonly REQUEST_FOCUS_DISABLED: number = 22;
  static readonly INHERITS_POPUP_MENU: number = 23;
  static readonly OPAQUE_SET: number = 24;
  static readonly AUTOSCROLLS_SET: number = 25;
  static readonly FOCUS_TRAVERSAL_KEYS_FORWARD_SET: number = 26;
  static readonly FOCUS_TRAVERSAL_KEYS_BACKWARD_SET: number = 27;
  revalidateRunnableScheduled: AtomicBoolean = null;
  /**
   * Temporary rectangles.
   */
  static tempRectangles: List<Rectangle> = null;
  /**
   * Used for <code>WHEN_FOCUSED</code> bindings.
   */
  focusInputMap: InputMap = null;
  /**
   * Used for <code>WHEN_ANCESTOR_OF_FOCUSED_COMPONENT</code> bindings.
   */
  ancestorInputMap: InputMap = null;
  /**
   * Used for <code>WHEN_IN_FOCUSED_KEY</code> bindings.
   */
  windowInputMap: ComponentInputMap = null;
  /**
   * ActionMap.
   */
  actionMap: ActionMap = null;
  /**
   * Key used to store the default locale in an AppContext
   */
  static readonly defaultLocale: string = 'JComponent.defaultLocale';
  static componentObtainingGraphicsFrom: Component = null;
  static componentObtainingGraphicsFromLock: any = null;
  /**
   * AA text hints.
   */
  aaHint: any = null;
  lcdRenderingHint: any = null;
  static focusController: RequestFocusController = null;
  /**
   * Default <code>JComponent</code> constructor.  This constructor does
   * very little initialization beyond calling the <code>Container</code>
   * constructor.  For example, the initial layout manager is
   * <code>null</code>. It does, however, set the component's locale
   * property to the value returned by
   * <code>JComponent.getDefaultLocale</code>.
   *
   * @see #getDefaultLocale
   */
  _JComponent(): this {
    this._Container();
    this.listenerList = new EventListenerList()._EventListenerList();
    this.inputVerifier = null;
    this.verifyInputWhenFocusTarget = true;
    this.revalidateRunnableScheduled = new AtomicBoolean(false);
    this.enableEvents(AWTEvent.KEY_EVENT_MASK);
    if (this.isManagingFocus()) {
      LookAndFeel.installProperty(this, 'focusTraversalKeysForward', JComponent.getManagingFocusForwardTraversalKeys());
      LookAndFeel.installProperty(this, 'focusTraversalKeysBackward', JComponent.getManagingFocusBackwardTraversalKeys());
    }
    super.setLocale(JComponent.getDefaultLocale());
    return this;
  }
  static safelyGetGraphics$Component(c: Component): Graphics {
    return JComponent.safelyGetGraphics$Component$Component(c, SwingUtilities.getRoot(c));
  }
  static safelyGetGraphics$Component$Component(c: Component, root: Component): Graphics {
    {
      JComponent.componentObtainingGraphicsFrom = root;
      let g = c.getGraphics();
      JComponent.componentObtainingGraphicsFrom = null;
      return g;
    }
  }
  static getGraphicsInvoked(root: Component): void {
    if (!JComponent.isComponentObtainingGraphicsFrom(root)) {
      let rootPane = (root).getRootPane();
      if (rootPane != null) {
        rootPane.disableTrueDoubleBuffering();
      }
    }
  }
  /**
   * Returns true if {@code c} is the component the graphics is being
   * requested of. This is intended for use when getGraphics is invoked.
   */
  static isComponentObtainingGraphicsFrom(c: Component): boolean {
    {
      return (JComponent.componentObtainingGraphicsFrom === c);
    }
  }
  /**
   * Returns the Set of <code>KeyStroke</code>s to use if the component
   * is managing focus for forward focus traversal.
   */
  static getManagingFocusForwardTraversalKeys(): JSet<KeyStroke> {
    {
      if (JComponent.managingFocusForwardTraversalKeys == null) {
        JComponent.managingFocusForwardTraversalKeys = new HashSet(1);
        JComponent.managingFocusForwardTraversalKeys.add(KeyStroke.getKeyStroke$int$int(KeyEvent.VK_TAB, InputEvent.CTRL_MASK));
      }
    }
    return JComponent.managingFocusForwardTraversalKeys;
  }
  /**
   * Returns the Set of <code>KeyStroke</code>s to use if the component
   * is managing focus for backward focus traversal.
   */
  static getManagingFocusBackwardTraversalKeys(): JSet<KeyStroke> {
    {
      if (JComponent.managingFocusBackwardTraversalKeys == null) {
        JComponent.managingFocusBackwardTraversalKeys = new HashSet(1);
        JComponent.managingFocusBackwardTraversalKeys.add(KeyStroke.getKeyStroke$int$int(KeyEvent.VK_TAB, InputEvent.SHIFT_MASK | InputEvent.CTRL_MASK));
      }
    }
    return JComponent.managingFocusBackwardTraversalKeys;
  }
  static fetchRectangle(): Rectangle {
    {
      let rect: Rectangle;
      let size = JComponent.tempRectangles.size();
      if (size > 0) {
        rect = JComponent.tempRectangles.removeAt((size - 1) | 0);
      } else {
        rect = new Rectangle()._Rectangle$int$int$int$int(0, 0, 0, 0);
      }
      return rect;
    }
  }
  static recycleRectangle(rect: Rectangle): void {
    {
      JComponent.tempRectangles.add(rect);
    }
  }
  /**
   * Sets whether or not <code>getComponentPopupMenu</code> should delegate
   * to the parent if this component does not have a <code>JPopupMenu</code>
   * assigned to it.
   * <p>
   * The default value for this is false, but some <code>JComponent</code>
   * subclasses that are implemented as a number of <code>JComponent</code>s
   * may set this to true.
   * <p>
   * This is a bound property.
   *
   * @param value whether or not the JPopupMenu is inherited
   * @see #setComponentPopupMenu
   * @since 1.5
   */
  setInheritsPopupMenu(value: boolean): void {
    let oldValue = this.getFlag(JComponent.INHERITS_POPUP_MENU);
    this.setFlag(JComponent.INHERITS_POPUP_MENU, value);
    this.firePropertyChange$String$boolean$boolean('inheritsPopupMenu', oldValue, value);
  }
  /**
   * Returns true if the JPopupMenu should be inherited from the parent.
   *
   * @return true if the JPopupMenu should be inherited from the parent
   * @see #setComponentPopupMenu
   * @since 1.5
   */
  getInheritsPopupMenu(): boolean {
    return this.getFlag(JComponent.INHERITS_POPUP_MENU);
  }
  /**
   * Returns <code>JPopupMenu</code> that assigned for this component.
   * If this component does not have a <code>JPopupMenu</code> assigned
   * to it and <code>getInheritsPopupMenu</code> is true, this
   * will return <code>getParent().getComponentPopupMenu()</code> (assuming
   * the parent is valid.)
   *
   * @return <code>JPopupMenu</code> assigned for this component
   *         or <code>null</code> if no popup assigned
   * @see #setComponentPopupMenu
   * @since 1.5
   */
  getComponentPopupMenu(): JPopupMenu {
    if (!this.getInheritsPopupMenu()) {
      return this.popupMenu;
    }
    if (this.popupMenu == null) {
      let parent = this.getParent();
      while (parent != null) {
        if (parent instanceof JComponent) {
          return (parent).getComponentPopupMenu();
        }
        if (parent instanceof Window || $J.isa(parent, Applet)) {
          break;
        }
        parent = parent.getParent();
      }
      return null;
    }
    return this.popupMenu;
  }
  /**
   * This method is called to update the UI property to a value from the
   * current look and feel.
   * {@code JComponent} subclasses must override this method
   * like this:
   * <pre>
   *   public void updateUI() {
   *      setUI((SliderUI)UIManager.getUI(this);
   *   }
   *  </pre>
   *
   * @implSpec The default implementation of this method does nothing.
   *
   * @see #setUI
   * @see UIManager#getLookAndFeel
   * @see UIManager#getUI
   */
  updateUI(): void {
  }
  /**
   * Sets the look and feel delegate for this component.
   * <code>JComponent</code> subclasses generally override this method
   * to narrow the argument type. For example, in <code>JSlider</code>:
   * <pre>
   * public void setUI(SliderUI newUI) {
   *     super.setUI(newUI);
   * }
   *  </pre>
   * <p>
   * Additionally <code>JComponent</code> subclasses must provide a
   * <code>getUI</code> method that returns the correct type.  For example:
   * <pre>
   * public SliderUI getUI() {
   *     return (SliderUI)ui;
   * }
   * </pre>
   *
   * @param newUI the new UI delegate
   * @see #updateUI
   * @see UIManager#getLookAndFeel
   * @see UIManager#getUI
   */
  setUI$ComponentUI(newUI: ComponentUI): void {
    this.uninstallUIAndProperties();
    this.aaHint = UIManager.getDefaults().get(RenderingHints.KEY_TEXT_ANTIALIASING);
    this.lcdRenderingHint = UIManager.getDefaults().get(RenderingHints.KEY_TEXT_LCD_CONTRAST);
    let oldUI = this.ui;
    this.ui = newUI;
    if (this.ui != null) {
      this.ui.installUI(this);
    }
    this.firePropertyChange$String$Object$Object('UI', oldUI, newUI);
    this.revalidate();
    this.repaint$();
  }
  /**
   * Uninstalls the UI, if any, and any client properties designated
   * as being specific to the installed UI - instances of
   * {@code UIClientPropertyKey}.
   */
  uninstallUIAndProperties(): void {
    if (this.ui != null) {
      this.ui.uninstallUI(this);
      if (this.clientProperties != null) {
        {
          let clientPropertyKeys = this.clientProperties.getKeys(null);
          if (clientPropertyKeys != null) {
            for (let key of clientPropertyKeys) {
              if ($J.isa(key, UIClientPropertyKey)) {
                this.putClientProperty(key, null);
              }
            }
          }
        }
      }
    }
  }
  /**
   * Returns the <code>UIDefaults</code> key used to
   * look up the name of the <code>swing.plaf.ComponentUI</code>
   * class that defines the look and feel
   * for this component.  Most applications will never need to
   * call this method.  Subclasses of <code>JComponent</code> that support
   * pluggable look and feel should override this method to
   * return a <code>UIDefaults</code> key that maps to the
   * <code>ComponentUI</code> subclass that defines their look and feel.
   *
   * @return the <code>UIDefaults</code> key for a
   *          <code>ComponentUI</code> subclass
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JComponent.uiClassID;
  }
  /**
   * Returns the graphics object used to paint this component.
   * If <code>DebugGraphics</code> is turned on we create a new
   * <code>DebugGraphics</code> object if necessary.
   * Otherwise we just configure the
   * specified graphics object's foreground and font.
   *
   * @param g the original <code>Graphics</code> object
   * @return a <code>Graphics</code> object configured for this component
   */
  getComponentGraphics(g: Graphics): Graphics {
    let componentGraphics = g;
    if (this.ui != null && JComponent.DEBUG_GRAPHICS_LOADED) {
      if ((DebugGraphics.debugComponentCount() !== 0) && (this.shouldDebugGraphics() !== 0) && !(g instanceof DebugGraphics)) {
        componentGraphics = new DebugGraphics()._DebugGraphics$Graphics$JComponent(g, this);
      }
    }
    componentGraphics.setColor(this.getForeground());
    componentGraphics.setFont(this.getFont());
    return componentGraphics;
  }
  /**
   * Calls the UI delegate's paint method, if the UI delegate
   * is non-<code>null</code>.  We pass the delegate a copy of the
   * <code>Graphics</code> object to protect the rest of the
   * paint code from irrevocable changes
   * (for example, <code>Graphics.translate</code>).
   * <p>
   * If you override this in a subclass you should not make permanent
   * changes to the passed in <code>Graphics</code>. For example, you
   * should not alter the clip <code>Rectangle</code> or modify the
   * transform. If you need to do these operations you may find it
   * easier to create a new <code>Graphics</code> from the passed in
   * <code>Graphics</code> and manipulate it. Further, if you do not
   * invoke super's implementation you must honor the opaque property, that is
   * if this component is opaque, you must completely fill in the background
   * in an opaque color. If you do not honor the opaque property you
   * will likely see visual artifacts.
   * <p>
   * The passed in <code>Graphics</code> object might
   * have a transform other than the identify transform
   * installed on it.  In this case, you might get
   * unexpected results if you cumulatively apply
   * another transform.
   *
   * @param g the <code>Graphics</code> object to protect
   * @see #paint
   * @see ComponentUI
   */
  paintComponent(g: Graphics): void {
    if (this.ui != null) {
      let scratchGraphics = (g == null) ? null : g.create$();
      try {
        this.ui.update(scratchGraphics, this);
      } finally {
        scratchGraphics.dispose();
      }
    }
  }
  /**
   * Paints this component's children.
   * If <code>shouldUseBuffer</code> is true,
   * no component ancestor has a buffer and
   * the component children can use a buffer if they have one.
   * Otherwise, one ancestor has a buffer currently in use and children
   * should not use a buffer to paint.
   * @param g  the <code>Graphics</code> context in which to paint
   * @see #paint
   * @see java.awt.Container#paint
   */
  paintChildren(g: Graphics): void {
    let sg = g;
    {
      let i = (this.getComponentCount() - 1) | 0;
      if (i < 0) {
        return;
      }
      if ((this.paintingChild instanceof JComponent) && this.paintingChild.isOpaque()) {
        for (; i >= 0; i--) {
          if (this.getComponent$int(i) === this.paintingChild) {
            break;
          }
        }
      }
      let tmpRect = JComponent.fetchRectangle();
      let checkSiblings = (!this.isOptimizedDrawingEnabled() && this.checkIfChildObscuredBySibling());
      let clipBounds = null;
      if (checkSiblings) {
        clipBounds = sg.getClipBounds$();
        if (clipBounds == null) {
          clipBounds = new Rectangle()._Rectangle$int$int$int$int(0, 0, this.getWidth(), this.getHeight());
        }
      }
      let printing = this.getFlag(JComponent.IS_PRINTING);
      let window = SwingUtilities.getWindowAncestor(this);
      let isWindowOpaque = window == null || window.isOpaque();
      for (; i >= 0; i--) {
        let comp = this.getComponent$int(i);
        if (comp == null) {
          continue;
        }
        let isJComponent = comp instanceof JComponent;
        if ((!isWindowOpaque || isJComponent || JComponent.isLightweightComponent(comp)) && comp.isVisible$()) {
          let cr: Rectangle;
          cr = comp.getBounds$Rectangle(tmpRect);
          let clip = g.getClip();
          let hitClip = (clip != null) ? clip.intersects$double$double$double$double(cr.x_, cr.y_, cr.width_, cr.height_) : true;
          if (hitClip) {
            if (checkSiblings && i > 0) {
              let x = cr.x_;
              let y = cr.y_;
              let width = cr.width_;
              let height = cr.height_;
              SwingUtilities.computeIntersection(clipBounds.x_, clipBounds.y_, clipBounds.width_, clipBounds.height_, cr);
              if (this.getObscuredState(i, cr.x_, cr.y_, cr.width_, cr.height_) === JComponent.COMPLETELY_OBSCURED) {
                continue;
              }
              cr.x_ = x;
              cr.y_ = y;
              cr.width_ = width;
              cr.height_ = height;
            }
            let cg = sg.create$int$int$int$int(cr.x_, cr.y_, cr.width_, cr.height_);
            cg.setColor(comp.getForeground());
            cg.setFont(comp.getFont());
            let shouldSetFlagBack = false;
            try {
              if (isJComponent) {
                if (this.getFlag(JComponent.ANCESTOR_USING_BUFFER)) {
                  (comp).setFlag(JComponent.ANCESTOR_USING_BUFFER, true);
                  shouldSetFlagBack = true;
                }
                if (this.getFlag(JComponent.IS_PAINTING_TILE)) {
                  (comp).setFlag(JComponent.IS_PAINTING_TILE, true);
                  shouldSetFlagBack = true;
                }
                if (!printing) {
                  comp.paint(cg);
                } else {
                  if (!this.getFlag(JComponent.IS_PRINTING_ALL)) {
                    comp.print$Graphics(cg);
                  } else {
                    comp.printAll(cg);
                  }
                }
              } else {
                if (!printing) {
                  comp.paint(cg);
                } else {
                  if (!this.getFlag(JComponent.IS_PRINTING_ALL)) {
                    comp.print$Graphics(cg);
                  } else {
                    comp.printAll(cg);
                  }
                }
              }
            } finally {
              cg.dispose();
              if (shouldSetFlagBack) {
                (comp).setFlag(JComponent.ANCESTOR_USING_BUFFER, false);
                (comp).setFlag(JComponent.IS_PAINTING_TILE, false);
              }
            }
          }
        }
      }
      JComponent.recycleRectangle(tmpRect);
    }
  }
  /**
   * Paints the component's border.
   * <p>
   * If you override this in a subclass you should not make permanent
   * changes to the passed in <code>Graphics</code>. For example, you
   * should not alter the clip <code>Rectangle</code> or modify the
   * transform. If you need to do these operations you may find it
   * easier to create a new <code>Graphics</code> from the passed in
   * <code>Graphics</code> and manipulate it.
   *
   * @param g  the <code>Graphics</code> context in which to paint
   *
   * @see #paint
   * @see #setBorder
   */
  paintBorder(g: Graphics): void {
    let border = this.getBorder();
    if (border != null) {
      border.paintBorder(this, g, 0, 0, this.getWidth(), this.getHeight());
    }
  }
  /**
   * Invoked by Swing to draw components.
   * Applications should not invoke <code>paint</code> directly,
   * but should instead use the <code>repaint</code> method to
   * schedule the component for redrawing.
   * <p>
   * This method actually delegates the work of painting to three
   * protected methods: <code>paintComponent</code>,
   * <code>paintBorder</code>,
   * and <code>paintChildren</code>.  They're called in the order
   * listed to ensure that children appear on top of component itself.
   * Generally speaking, the component and its children should not
   * paint in the insets area allocated to the border. Subclasses can
   * just override this method, as always.  A subclass that just
   * wants to specialize the UI (look and feel) delegate's
   * <code>paint</code> method should just override
   * <code>paintComponent</code>.
   *
   * @param g  the <code>Graphics</code> context in which to paint
   * @see #paintComponent
   * @see #paintBorder
   * @see #paintChildren
   * @see #getComponentGraphics
   * @see #repaint
   */
  paint(g: Graphics): void {
    let shouldClearPaintFlags = false;
    if ((this.getWidth() <= 0) || (this.getHeight() <= 0)) {
      return;
    }
    let componentGraphics = this.getComponentGraphics(g);
    let co = componentGraphics.create$();
    try {
      let repaintManager = RepaintManager.currentManager$JComponent(this);
      let clipRect = co.getClipBounds$();
      let clipX: number;
      let clipY: number;
      let clipW: number;
      let clipH: number;
      if (clipRect == null) {
        clipX = clipY = 0;
        clipW = this.getWidth();
        clipH = this.getHeight();
      } else {
        clipX = clipRect.x_;
        clipY = clipRect.y_;
        clipW = clipRect.width_;
        clipH = clipRect.height_;
      }
      if (clipW > this.getWidth()) {
        clipW = this.getWidth();
      }
      if (clipH > this.getHeight()) {
        clipH = this.getHeight();
      }
      if (this.getParent() != null && !(this.getParent() instanceof JComponent)) {
        this.adjustPaintFlags();
        shouldClearPaintFlags = true;
      }
      let bw: number;
      let bh: number;
      let printing = this.getFlag(JComponent.IS_PRINTING);
      if (!printing && repaintManager.isDoubleBufferingEnabled() && !this.getFlag(JComponent.ANCESTOR_USING_BUFFER) && this.isDoubleBuffered() && (this.getFlag(JComponent.IS_REPAINTING) || repaintManager.isPainting())) {
        repaintManager.beginPaint();
        try {
          repaintManager.paint(this, this, co, clipX, clipY, clipW, clipH);
        } finally {
          repaintManager.endPaint();
        }
      } else {
        if (clipRect == null) {
          co.setClip$int$int$int$int(clipX, clipY, clipW, clipH);
        }
        if (!this.rectangleIsObscured(clipX, clipY, clipW, clipH)) {
          if (!printing) {
            this.paintComponent(co);
            this.paintBorder(co);
          } else {
            this.printComponent(co);
            this.printBorder(co);
          }
        }
        if (!printing) {
          this.paintChildren(co);
        } else {
          this.printChildren(co);
        }
      }
    } finally {
      co.dispose();
      if (shouldClearPaintFlags) {
        this.setFlag(JComponent.ANCESTOR_USING_BUFFER, false);
        this.setFlag(JComponent.IS_PAINTING_TILE, false);
        this.setFlag(JComponent.IS_PRINTING, false);
        this.setFlag(JComponent.IS_PRINTING_ALL, false);
      }
    }
  }
  paintForceDoubleBuffered(g: Graphics): void {
    let rm = RepaintManager.currentManager$JComponent(this);
    let clip = g.getClipBounds$();
    rm.beginPaint();
    this.setFlag(JComponent.IS_REPAINTING, true);
    try {
      rm.paint(this, this, g, clip.x_, clip.y_, clip.width_, clip.height_);
    } finally {
      rm.endPaint();
      this.setFlag(JComponent.IS_REPAINTING, false);
    }
  }
  /**
   * Returns true if this component, or any of its ancestors, are in
   * the processing of painting.
   */
  isPainting(): boolean {
    let component = this;
    while (component != null) {
      if (component instanceof JComponent && (component).getFlag(JComponent.ANCESTOR_USING_BUFFER)) {
        return true;
      }
      component = component.getParent();
    }
    return false;
  }
  adjustPaintFlags(): void {
    let jparent: JComponent;
    let parent: Container;
    for (parent = this.getParent(); parent != null; parent = parent.getParent()) {
      if (parent instanceof JComponent) {
        jparent = parent;
        if (jparent.getFlag(JComponent.ANCESTOR_USING_BUFFER)) {
          this.setFlag(JComponent.ANCESTOR_USING_BUFFER, true);
        }
        if (jparent.getFlag(JComponent.IS_PAINTING_TILE)) {
          this.setFlag(JComponent.IS_PAINTING_TILE, true);
        }
        if (jparent.getFlag(JComponent.IS_PRINTING)) {
          this.setFlag(JComponent.IS_PRINTING, true);
        }
        if (jparent.getFlag(JComponent.IS_PRINTING_ALL)) {
          this.setFlag(JComponent.IS_PRINTING_ALL, true);
        }
        break;
      }
    }
  }
  /**
   * Invoke this method to print the component. This method invokes
   * <code>print</code> on the component.
   *
   * @param g the <code>Graphics</code> context in which to paint
   * @see #print
   * @see #printComponent
   * @see #printBorder
   * @see #printChildren
   */
  printAll(g: Graphics): void {
    this.setFlag(JComponent.IS_PRINTING_ALL, true);
    try {
      this.print$Graphics(g);
    } finally {
      this.setFlag(JComponent.IS_PRINTING_ALL, false);
    }
  }
  /**
   * Invoke this method to print the component to the specified
   * <code>Graphics</code>. This method will result in invocations
   * of <code>printComponent</code>, <code>printBorder</code> and
   * <code>printChildren</code>. It is recommended that you override
   * one of the previously mentioned methods rather than this one if
   * your intention is to customize the way printing looks. However,
   * it can be useful to override this method should you want to prepare
   * state before invoking the superclass behavior. As an example,
   * if you wanted to change the component's background color before
   * printing, you could do the following:
   * <pre>
   *     public void print(Graphics g) {
   *         Color orig = getBackground();
   *         setBackground(Color.WHITE);
   *
   *         // wrap in try/finally so that we always restore the state
   *         try {
   *             super.print(g);
   *         } finally {
   *             setBackground(orig);
   *         }
   *     }
   * </pre>
   * <p>
   * Alternatively, or for components that delegate painting to other objects,
   * you can query during painting whether or not the component is in the
   * midst of a print operation. The <code>isPaintingForPrint</code> method provides
   * this ability and its return value will be changed by this method: to
   * <code>true</code> immediately before rendering and to <code>false</code>
   * immediately after. With each change a property change event is fired on
   * this component with the name <code>"paintingForPrint"</code>.
   * <p>
   * This method sets the component's state such that the double buffer
   * will not be used: painting will be done directly on the passed in
   * <code>Graphics</code>.
   *
   * @param g the <code>Graphics</code> context in which to paint
   * @see #printComponent
   * @see #printBorder
   * @see #printChildren
   * @see #isPaintingForPrint
   */
  print$Graphics(g: Graphics): void {
    this.setFlag(JComponent.IS_PRINTING, true);
    this.firePropertyChange$String$boolean$boolean('paintingForPrint', false, true);
    try {
      this.paint(g);
    } finally {
      this.setFlag(JComponent.IS_PRINTING, false);
      this.firePropertyChange$String$boolean$boolean('paintingForPrint', true, false);
    }
  }
  /**
   * This is invoked during a printing operation. This is implemented to
   * invoke <code>paintComponent</code> on the component. Override this
   * if you wish to add special painting behavior when printing.
   *
   * @param g the <code>Graphics</code> context in which to paint
   * @see #print
   * @since 1.3
   */
  printComponent(g: Graphics): void {
    this.paintComponent(g);
  }
  /**
   * Prints this component's children. This is implemented to invoke
   * <code>paintChildren</code> on the component. Override this if you
   * wish to print the children differently than painting.
   *
   * @param g the <code>Graphics</code> context in which to paint
   * @see #print
   * @since 1.3
   */
  printChildren(g: Graphics): void {
    this.paintChildren(g);
  }
  /**
   * Prints the component's border. This is implemented to invoke
   * <code>paintBorder</code> on the component. Override this if you
   * wish to print the border differently that it is painted.
   *
   * @param g the <code>Graphics</code> context in which to paint
   * @see #print
   * @since 1.3
   */
  printBorder(g: Graphics): void {
    this.paintBorder(g);
  }
  /**
   * Returns <code>true</code> if the current painting operation on this
   * component is part of a <code>print</code> operation. This method is
   * useful when you want to customize what you print versus what you show
   * on the screen.
   * <p>
   * You can detect changes in the value of this property by listening for
   * property change events on this component with name
   * <code>"paintingForPrint"</code>.
   * <p>
   * Note: This method provides complimentary functionality to that provided
   * by other high level Swing printing APIs. However, it deals strictly with
   * painting and should not be confused as providing information on higher
   * level print processes. For example, a {@link javax.swing.JTable#print()}
   * operation doesn't necessarily result in a continuous rendering of the
   * full component, and the return value of this method can change multiple
   * times during that operation. It is even possible for the component to be
   * painted to the screen while the printing process is ongoing. In such a
   * case, the return value of this method is <code>true</code> when, and only
   * when, the table is being painted as part of the printing process.
   *
   * @return true if the current painting operation on this component
   *         is part of a print operation
   * @see #print
   * @since 1.6
   */
  isPaintingForPrint(): boolean {
    return this.getFlag(JComponent.IS_PRINTING);
  }
  /**
   * In release 1.4, the focus subsystem was rearchitected.
   * For more information, see
   * <a href="https://docs.oracle.com/javase/tutorial/uiswing/misc/focus.html">
   * How to Use the Focus Subsystem</a>,
   * a section in <em>The Java Tutorial</em>.
   * <p>
   * Changes this <code>JComponent</code>'s focus traversal keys to
   * CTRL+TAB and CTRL+SHIFT+TAB. Also prevents
   * <code>SortingFocusTraversalPolicy</code> from considering descendants
   * of this JComponent when computing a focus traversal cycle.
   *
   * @return false
   * @see java.awt.Component#setFocusTraversalKeys
   * @see SortingFocusTraversalPolicy
   * @deprecated As of 1.4, replaced by
   *   <code>Component.setFocusTraversalKeys(int, Set)</code> and
   *   <code>Container.setFocusCycleRoot(boolean)</code>.
   */
  isManagingFocus(): boolean {
    return false;
  }
  registerNextFocusableComponent$$JComponent(): void {
    this.registerNextFocusableComponent$Component$JComponent(this.getNextFocusableComponent());
  }
  registerNextFocusableComponent$Component$JComponent(nextFocusableComponent: Component): void {
    if (nextFocusableComponent == null) {
      return;
    }
    let nearestRoot = (this.isFocusCycleRoot$()) ? this : this.getFocusCycleRootAncestor();
    let policy = nearestRoot.getFocusTraversalPolicy();
    if (!(policy instanceof LegacyGlueFocusTraversalPolicy)) {
      policy = new LegacyGlueFocusTraversalPolicy()._LegacyGlueFocusTraversalPolicy$FocusTraversalPolicy(policy);
      nearestRoot.setFocusTraversalPolicy(policy);
    }
    (policy).setNextFocusableComponent(this, nextFocusableComponent);
  }
  deregisterNextFocusableComponent(): void {
    let nextFocusableComponent = this.getNextFocusableComponent();
    if (nextFocusableComponent == null) {
      return;
    }
    let nearestRoot = (this.isFocusCycleRoot$()) ? this : this.getFocusCycleRootAncestor();
    if (nearestRoot == null) {
      return;
    }
    let policy = nearestRoot.getFocusTraversalPolicy();
    if (policy instanceof LegacyGlueFocusTraversalPolicy) {
      (policy).unsetNextFocusableComponent(this, nextFocusableComponent);
    }
  }
  /**
   * In release 1.4, the focus subsystem was rearchitected.
   * For more information, see
   * <a href="https://docs.oracle.com/javase/tutorial/uiswing/misc/focus.html">
   * How to Use the Focus Subsystem</a>,
   * a section in <em>The Java Tutorial</em>.
   * <p>
   * Overrides the default <code>FocusTraversalPolicy</code> for this
   * <code>JComponent</code>'s focus traversal cycle by unconditionally
   * setting the specified <code>Component</code> as the next
   * <code>Component</code> in the cycle, and this <code>JComponent</code>
   * as the specified <code>Component</code>'s previous
   * <code>Component</code> in the cycle.
   *
   * @param aComponent the <code>Component</code> that should follow this
   *        <code>JComponent</code> in the focus traversal cycle
   *
   * @see #getNextFocusableComponent
   * @see java.awt.FocusTraversalPolicy
   * @deprecated As of 1.4, replaced by <code>FocusTraversalPolicy</code>
   */
  setNextFocusableComponent(aComponent: Component): void {
    let displayable = this.isDisplayable();
    if (displayable) {
      this.deregisterNextFocusableComponent();
    }
    this.putClientProperty(JComponent.NEXT_FOCUS, aComponent);
    if (displayable) {
      this.registerNextFocusableComponent$Component$JComponent(aComponent);
    }
  }
  /**
   * In release 1.4, the focus subsystem was rearchitected.
   * For more information, see
   * <a href="https://docs.oracle.com/javase/tutorial/uiswing/misc/focus.html">
   * How to Use the Focus Subsystem</a>,
   * a section in <em>The Java Tutorial</em>.
   * <p>
   * Returns the <code>Component</code> set by a prior call to
   * <code>setNextFocusableComponent(Component)</code> on this
   * <code>JComponent</code>.
   *
   * @return the <code>Component</code> that will follow this
   *        <code>JComponent</code> in the focus traversal cycle, or
   *        <code>null</code> if none has been explicitly specified
   *
   * @see #setNextFocusableComponent
   * @deprecated As of 1.4, replaced by <code>FocusTraversalPolicy</code>.
   */
  getNextFocusableComponent(): Component {
    return this.getClientProperty(JComponent.NEXT_FOCUS);
  }
  /**
   * Provides a hint as to whether or not this <code>JComponent</code>
   * should get focus. This is only a hint, and it is up to consumers that
   * are requesting focus to honor this property. This is typically honored
   * for mouse operations, but not keyboard operations. For example, look
   * and feels could verify this property is true before requesting focus
   * during a mouse operation. This would often times be used if you did
   * not want a mouse press on a <code>JComponent</code> to steal focus,
   * but did want the <code>JComponent</code> to be traversable via the
   * keyboard. If you do not want this <code>JComponent</code> focusable at
   * all, use the <code>setFocusable</code> method instead.
   * <p>
   * Please see
   * <a href="https://docs.oracle.com/javase/tutorial/uiswing/misc/focus.html">
   * How to Use the Focus Subsystem</a>,
   * a section in <em>The Java Tutorial</em>,
   * for more information.
   *
   * @param requestFocusEnabled indicates whether you want this
   *        <code>JComponent</code> to be focusable or not
   * @see <a href="../../java/awt/doc-files/FocusSpec.html">Focus Specification</a>
   * @see java.awt.Component#setFocusable
   */
  setRequestFocusEnabled(requestFocusEnabled: boolean): void {
    this.setFlag(JComponent.REQUEST_FOCUS_DISABLED, !requestFocusEnabled);
  }
  /**
   * Returns <code>true</code> if this <code>JComponent</code> should
   * get focus; otherwise returns <code>false</code>.
   * <p>
   * Please see
   * <a href="https://docs.oracle.com/javase/tutorial/uiswing/misc/focus.html">
   * How to Use the Focus Subsystem</a>,
   * a section in <em>The Java Tutorial</em>,
   * for more information.
   *
   * @return <code>true</code> if this component should get focus,
   *     otherwise returns <code>false</code>
   * @see #setRequestFocusEnabled
   * @see <a href="../../java/awt/doc-files/FocusSpec.html">Focus
   *      Specification</a>
   * @see java.awt.Component#isFocusable
   */
  isRequestFocusEnabled(): boolean {
    return !this.getFlag(JComponent.REQUEST_FOCUS_DISABLED);
  }
  /**
   * Requests that this <code>Component</code> gets the input focus.
   * Refer to {@link java.awt.Component#requestFocus()
   * Component.requestFocus()} for a complete description of
   * this method.
   * <p>
   * Note that the use of this method is discouraged because
   * its behavior is platform dependent. Instead we recommend the
   * use of {@link #requestFocusInWindow() requestFocusInWindow()}.
   * If you would like more information on focus, see
   * <a href="https://docs.oracle.com/javase/tutorial/uiswing/misc/focus.html">
   * How to Use the Focus Subsystem</a>,
   * a section in <em>The Java Tutorial</em>.
   *
   * @see java.awt.Component#requestFocusInWindow()
   * @see java.awt.Component#requestFocusInWindow(boolean)
   * @since 1.4
   */
  requestFocus$(): void {
    super.requestFocus$();
  }
  /**
   * Requests that this <code>Component</code> gets the input focus.
   * Refer to {@link java.awt.Component#requestFocus(boolean)
   * Component.requestFocus(boolean)} for a complete description of
   * this method.
   * <p>
   * Note that the use of this method is discouraged because
   * its behavior is platform dependent. Instead we recommend the
   * use of {@link #requestFocusInWindow(boolean)
   * requestFocusInWindow(boolean)}.
   * If you would like more information on focus, see
   * <a href="https://docs.oracle.com/javase/tutorial/uiswing/misc/focus.html">
   * How to Use the Focus Subsystem</a>,
   * a section in <em>The Java Tutorial</em>.
   *
   * @param temporary boolean indicating if the focus change is temporary
   * @return <code>false</code> if the focus change request is guaranteed to
   *         fail; <code>true</code> if it is likely to succeed
   * @see java.awt.Component#requestFocusInWindow()
   * @see java.awt.Component#requestFocusInWindow(boolean)
   * @since 1.4
   */
  requestFocus$boolean(temporary: boolean): boolean {
    return super.requestFocus$boolean(temporary);
  }
  /**
   * Requests that this <code>Component</code> gets the input focus.
   * Refer to {@link java.awt.Component#requestFocusInWindow()
   * Component.requestFocusInWindow()} for a complete description of
   * this method.
   * <p>
   * If you would like more information on focus, see
   * <a href="https://docs.oracle.com/javase/tutorial/uiswing/misc/focus.html">
   * How to Use the Focus Subsystem</a>,
   * a section in <em>The Java Tutorial</em>.
   *
   * @return <code>false</code> if the focus change request is guaranteed to
   *         fail; <code>true</code> if it is likely to succeed
   * @see java.awt.Component#requestFocusInWindow()
   * @see java.awt.Component#requestFocusInWindow(boolean)
   * @since 1.4
   */
  requestFocusInWindow$(): boolean {
    return super.requestFocusInWindow$();
  }
  /**
   * Returns the value that indicates whether the input verifier for the
   * current focus owner will be called before this component requests
   * focus.
   *
   * @return value of the <code>verifyInputWhenFocusTarget</code> property
   *
   * @see InputVerifier
   * @see #setInputVerifier
   * @see #getInputVerifier
   * @see #setVerifyInputWhenFocusTarget
   *
   * @since 1.3
   */
  getVerifyInputWhenFocusTarget(): boolean {
    return this.verifyInputWhenFocusTarget;
  }
  /**
   * Gets the <code>FontMetrics</code> for the specified <code>Font</code>.
   *
   * @param font the font for which font metrics is to be
   *          obtained
   * @return the font metrics for <code>font</code>
   * @throws NullPointerException if <code>font</code> is null
   * @since 1.5
   */
  getFontMetrics(font: Font): FontMetrics {
    return SwingUtilities2.getFontMetrics$JComponent$Font(this, font);
  }
  /**
   * Sets the preferred size of this component.
   * If <code>preferredSize</code> is <code>null</code>, the UI will
   * be asked for the preferred size.
   */
  setPreferredSize(preferredSize: Dimension): void {
    super.setPreferredSize(preferredSize);
  }
  /**
   * If the <code>preferredSize</code> has been set to a
   * non-<code>null</code> value just returns it.
   * If the UI delegate's <code>getPreferredSize</code>
   * method returns a non <code>null</code> value then return that;
   * otherwise defer to the component's layout manager.
   *
   * @return the value of the <code>preferredSize</code> property
   * @see #setPreferredSize
   * @see ComponentUI
   */
  getPreferredSize$(): Dimension {
    if (this.isPreferredSizeSet()) {
      return super.getPreferredSize$();
    }
    let size = null;
    if (this.ui != null) {
      size = this.ui.getPreferredSize$JComponent(this);
    }
    return (size != null) ? size : super.getPreferredSize$();
  }
  /**
   * Sets the maximum size of this component to a constant
   * value.  Subsequent calls to <code>getMaximumSize</code> will always
   * return this value; the component's UI will not be asked
   * to compute it.  Setting the maximum size to <code>null</code>
   * restores the default behavior.
   *
   * @param maximumSize a <code>Dimension</code> containing the
   *          desired maximum allowable size
   * @see #getMaximumSize
   */
  setMaximumSize(maximumSize: Dimension): void {
    super.setMaximumSize(maximumSize);
  }
  /**
   * If the maximum size has been set to a non-<code>null</code> value
   * just returns it.  If the UI delegate's <code>getMaximumSize</code>
   * method returns a non-<code>null</code> value then return that;
   * otherwise defer to the component's layout manager.
   *
   * @return the value of the <code>maximumSize</code> property
   * @see #setMaximumSize
   * @see ComponentUI
   */
  getMaximumSize(): Dimension {
    if (this.isMaximumSizeSet()) {
      return super.getMaximumSize();
    }
    let size = null;
    if (this.ui != null) {
      size = this.ui.getMaximumSize(this);
    }
    return (size != null) ? size : super.getMaximumSize();
  }
  /**
   * Sets the minimum size of this component to a constant
   * value.  Subsequent calls to <code>getMinimumSize</code> will always
   * return this value; the component's UI will not be asked
   * to compute it.  Setting the minimum size to <code>null</code>
   * restores the default behavior.
   *
   * @param minimumSize the new minimum size of this component
   * @see #getMinimumSize
   */
  setMinimumSize(minimumSize: Dimension): void {
    super.setMinimumSize(minimumSize);
  }
  /**
   * If the minimum size has been set to a non-<code>null</code> value
   * just returns it.  If the UI delegate's <code>getMinimumSize</code>
   * method returns a non-<code>null</code> value then return that; otherwise
   * defer to the component's layout manager.
   *
   * @return the value of the <code>minimumSize</code> property
   * @see #setMinimumSize
   * @see ComponentUI
   */
  getMinimumSize$(): Dimension {
    if (this.isMinimumSizeSet()) {
      return super.getMinimumSize$();
    }
    let size = null;
    if (this.ui != null) {
      size = this.ui.getMinimumSize(this);
    }
    return (size != null) ? size : super.getMinimumSize$();
  }
  /**
   * Gives the UI delegate an opportunity to define the precise
   * shape of this component for the sake of mouse processing.
   *
   * @return true if this component logically contains x,y
   * @see java.awt.Component#contains(int, int)
   * @see ComponentUI
   */
  contains$int$int(x: number, y: number): boolean {
    return (this.ui != null) ? this.ui.contains(this, x, y) : super.contains$int$int(x, y);
  }
  /**
   * Sets the border of this component.  The <code>Border</code> object is
   * responsible for defining the insets for the component
   * (overriding any insets set directly on the component) and
   * for optionally rendering any border decorations within the
   * bounds of those insets.  Borders should be used (rather
   * than insets) for creating both decorative and non-decorative
   * (such as margins and padding) regions for a swing component.
   * Compound borders can be used to nest multiple borders within a
   * single component.
   * <p>
   * Although technically you can set the border on any object
   * that inherits from <code>JComponent</code>, the look and
   * feel implementation of many standard Swing components
   * doesn't work well with user-set borders.  In general,
   * when you want to set a border on a standard Swing
   * component other than <code>JPanel</code> or <code>JLabel</code>,
   * we recommend that you put the component in a <code>JPanel</code>
   * and set the border on the <code>JPanel</code>.
   * <p>
   * This is a bound property.
   *
   * @param border the border to be rendered for this component
   * @see Border
   * @see CompoundBorder
   */
  setBorder(border: Border): void {
    let oldBorder = this.border;
    this.border = border;
    this.firePropertyChange$String$Object$Object('border', oldBorder, border);
    if (border !== oldBorder) {
      if (border == null || oldBorder == null || !(border.getBorderInsets$Component(this).equals(oldBorder.getBorderInsets$Component(this)))) {
        this.revalidate();
      }
      this.repaint$();
    }
  }
  /**
   * Returns the border of this component or <code>null</code> if no
   * border is currently set.
   *
   * @return the border object for this component
   * @see #setBorder
   */
  getBorder(): Border {
    return this.border;
  }
  /**
   * If a border has been set on this component, returns the
   * border's insets; otherwise calls <code>super.getInsets</code>.
   *
   * @return the value of the insets property
   * @see #setBorder
   */
  getInsets$(): Insets {
    if (this.border != null) {
      return this.border.getBorderInsets$Component(this);
    }
    return super.getInsets$();
  }
  /**
   * Returns an <code>Insets</code> object containing this component's inset
   * values.  The passed-in <code>Insets</code> object will be reused
   * if possible.
   * Calling methods cannot assume that the same object will be returned,
   * however.  All existing values within this object are overwritten.
   * If <code>insets</code> is null, this will allocate a new one.
   *
   * @param insets the <code>Insets</code> object, which can be reused
   * @return the <code>Insets</code> object
   * @see #getInsets
   */
  getInsets$Insets(insets: Insets): Insets {
    if (insets == null) {
      insets = new Insets()._Insets(0, 0, 0, 0);
    }
    if (this.border != null) {
      if (this.border instanceof AbstractBorder) {
        return (this.border).getBorderInsets$Component$Insets(this, insets);
      } else {
        return this.border.getBorderInsets$Component(this);
      }
    } else {
      insets.left = insets.top = insets.right = insets.bottom = 0;
      return insets;
    }
  }
  /**
   * Overrides <code>Container.getAlignmentY</code> to return
   * the vertical alignment.
   *
   * @return the value of the <code>alignmentY</code> property
   * @see #setAlignmentY
   * @see java.awt.Component#getAlignmentY
   */
  getAlignmentY(): number {
    if (this.isAlignmentYSet) {
      return this.alignmentY;
    }
    return super.getAlignmentY();
  }
  /**
   * Sets the vertical alignment.
   *
   * @param alignmentY  the new vertical alignment
   * @see #getAlignmentY
   */
  setAlignmentY(alignmentY: number): void {
    this.alignmentY = this.validateAlignment(alignmentY);
    this.isAlignmentYSet = true;
  }
  /**
   * Overrides <code>Container.getAlignmentX</code> to return
   * the horizontal alignment.
   *
   * @return the value of the <code>alignmentX</code> property
   * @see #setAlignmentX
   * @see java.awt.Component#getAlignmentX
   */
  getAlignmentX(): number {
    if (this.isAlignmentXSet) {
      return this.alignmentX;
    }
    return super.getAlignmentX();
  }
  /**
   * Sets the horizontal alignment.
   *
   * @param alignmentX  the new horizontal alignment
   * @see #getAlignmentX
   */
  setAlignmentX(alignmentX: number): void {
    this.alignmentX = this.validateAlignment(alignmentX);
    this.isAlignmentXSet = true;
  }
  validateAlignment(alignment: number): number {
    return alignment > 1 ? 1 : alignment < 0 ? 0 : alignment;
  }
  /**
   * Sets the input verifier for this component.
   *
   * @param inputVerifier the new input verifier
   * @since 1.3
   * @see InputVerifier
   */
  setInputVerifier(inputVerifier: InputVerifier): void {
    let oldInputVerifier = this.getClientProperty(ClientPropertyKey.JComponent_INPUT_VERIFIER);
    this.putClientProperty(ClientPropertyKey.JComponent_INPUT_VERIFIER, inputVerifier);
    this.firePropertyChange$String$Object$Object('inputVerifier', oldInputVerifier, inputVerifier);
  }
  /**
   * Returns the input verifier for this component.
   *
   * @return the <code>inputVerifier</code> property
   * @since 1.3
   * @see InputVerifier
   */
  getInputVerifier(): InputVerifier {
    return this.getClientProperty(ClientPropertyKey.JComponent_INPUT_VERIFIER);
  }
  /**
   * Returns this component's graphics context, which lets you draw
   * on a component. Use this method to get a <code>Graphics</code> object and
   * then invoke operations on that object to draw on the component.
   * @return this components graphics context
   */
  getGraphics(): Graphics {
    if (JComponent.DEBUG_GRAPHICS_LOADED && this.shouldDebugGraphics() !== 0) {
      let graphics = new DebugGraphics()._DebugGraphics$Graphics$JComponent(super.getGraphics(), this);
      return graphics;
    }
    return super.getGraphics();
  }
  /**
   * Returns true if debug information is enabled for this
   * <code>JComponent</code> or one of its parents.
   */
  shouldDebugGraphics(): number {
    return DebugGraphics.shouldComponentDebug(this);
  }
  /**
   * Registers any bound <code>WHEN_IN_FOCUSED_WINDOW</code> actions with
   * the <code>KeyboardManager</code>. If <code>onlyIfNew</code>
   * is true only actions that haven't been registered are pushed
   * to the <code>KeyboardManager</code>;
   * otherwise all actions are pushed to the <code>KeyboardManager</code>.
   *
   * @param onlyIfNew  if true, only actions that haven't been registered
   *          are pushed to the <code>KeyboardManager</code>
   */
  registerWithKeyboardManager$boolean$JComponent(onlyIfNew: boolean): void {
    let inputMap = this.getInputMap$int$boolean(JComponent.WHEN_IN_FOCUSED_WINDOW, false);
    let strokes: KeyStroke[];
    let registered = this.getClientProperty(JComponent.WHEN_IN_FOCUSED_WINDOW_BINDINGS);
    if (inputMap != null) {
      strokes = inputMap.allKeys();
      if (strokes != null) {
        for (let counter = (strokes.length - 1) | 0; counter >= 0; counter--) {
          if (!onlyIfNew || registered == null || registered.get(strokes[counter]) == null) {
            this.registerWithKeyboardManager$KeyStroke$JComponent(strokes[counter]);
          }
          if (registered != null) {
            registered.remove(strokes[counter]);
          }
        }
      }
    } else {
      strokes = null;
    }
    if (registered != null && registered.size() > 0) {
      let keys = registered.keys();
      while (keys.hasMoreElements()) {
        let ks = keys.nextElement();
        this.unregisterWithKeyboardManager$KeyStroke$JComponent(ks);
      }
      registered.clear();
    }
    if (strokes != null && strokes.length > 0) {
      if (registered == null) {
        registered = new Hashtable(strokes.length);
        this.putClientProperty(JComponent.WHEN_IN_FOCUSED_WINDOW_BINDINGS, registered);
      }
      for (let counter = (strokes.length - 1) | 0; counter >= 0; counter--) {
        registered.put(strokes[counter], strokes[counter]);
      }
    } else {
      this.putClientProperty(JComponent.WHEN_IN_FOCUSED_WINDOW_BINDINGS, null);
    }
  }
  /**
   * Unregisters all the previously registered
   * <code>WHEN_IN_FOCUSED_WINDOW</code> <code>KeyStroke</code> bindings.
   */
  unregisterWithKeyboardManager$$JComponent(): void {
    let registered = this.getClientProperty(JComponent.WHEN_IN_FOCUSED_WINDOW_BINDINGS);
    if (registered != null && registered.size() > 0) {
      let keys = registered.keys();
      while (keys.hasMoreElements()) {
        let ks = keys.nextElement();
        this.unregisterWithKeyboardManager$KeyStroke$JComponent(ks);
      }
    }
    this.putClientProperty(JComponent.WHEN_IN_FOCUSED_WINDOW_BINDINGS, null);
  }
  /**
   * Invoked from <code>ComponentInputMap</code> when its bindings change.
   * If <code>inputMap</code> is the current <code>windowInputMap</code>
   * (or a parent of the window <code>InputMap</code>)
   * the <code>KeyboardManager</code> is notified of the new bindings.
   *
   * @param inputMap the map containing the new bindings
   */
  componentInputMapChanged(inputMap: ComponentInputMap): void {
    let km = this.getInputMap$int$boolean(JComponent.WHEN_IN_FOCUSED_WINDOW, false);
    while (km !== inputMap && km != null) {
      km = km.getParent();
    }
    if (km != null) {
      this.registerWithKeyboardManager$boolean$JComponent(false);
    }
  }
  registerWithKeyboardManager$KeyStroke$JComponent(aKeyStroke: KeyStroke): void {
    KeyboardManager.getCurrentManager().registerKeyStroke(aKeyStroke, this);
  }
  unregisterWithKeyboardManager$KeyStroke$JComponent(aKeyStroke: KeyStroke): void {
    KeyboardManager.getCurrentManager().unregisterKeyStroke(aKeyStroke, this);
  }
  /**
   * Unregisters all the bindings in the first tier <code>InputMaps</code>
   * and <code>ActionMap</code>. This has the effect of removing any
   * local bindings, and allowing the bindings defined in parent
   * <code>InputMap/ActionMaps</code>
   * (the UI is usually defined in the second tier) to persist.
   */
  resetKeyboardActions(): void {
    for (let counter = 0; counter < 3; counter++) {
      let inputMap = this.getInputMap$int$boolean(counter, false);
      if (inputMap != null) {
        inputMap.clear();
      }
    }
    let am = this.getActionMap$boolean(false);
    if (am != null) {
      am.clear();
    }
  }
  /**
   * Sets the <code>InputMap</code> to use under the condition
   * <code>condition</code> to
   * <code>map</code>. A <code>null</code> value implies you
   * do not want any bindings to be used, even from the UI. This will
   * not reinstall the UI <code>InputMap</code> (if there was one).
   * <code>condition</code> has one of the following values:
   * <ul>
   * <li><code>WHEN_IN_FOCUSED_WINDOW</code>
   * <li><code>WHEN_FOCUSED</code>
   * <li><code>WHEN_ANCESTOR_OF_FOCUSED_COMPONENT</code>
   * </ul>
   * If <code>condition</code> is <code>WHEN_IN_FOCUSED_WINDOW</code>
   * and <code>map</code> is not a <code>ComponentInputMap</code>, an
   * <code>IllegalArgumentException</code> will be thrown.
   * Similarly, if <code>condition</code> is not one of the values
   * listed, an <code>IllegalArgumentException</code> will be thrown.
   *
   * @param condition one of the values listed above
   * @param map  the <code>InputMap</code> to use for the given condition
   * @throws IllegalArgumentException if <code>condition</code> is
   *          <code>WHEN_IN_FOCUSED_WINDOW</code> and <code>map</code>
   *          is not an instance of <code>ComponentInputMap</code>; or
   *          if <code>condition</code> is not one of the legal values
   *          specified above
   * @since 1.3
   */
  setInputMap(condition: number, map: InputMap): void {
    switch (condition) {
      case JComponent.WHEN_IN_FOCUSED_WINDOW:
        if (map != null && !(map instanceof ComponentInputMap)) {
          throw new IllegalArgumentException('WHEN_IN_FOCUSED_WINDOW InputMaps must be of type ComponentInputMap');
        }
        this.windowInputMap = map;
        this.setFlag(JComponent.WIF_INPUTMAP_CREATED, true);
        this.registerWithKeyboardManager$boolean$JComponent(false);
        break;
      case JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT:
        this.ancestorInputMap = map;
        this.setFlag(JComponent.ANCESTOR_INPUTMAP_CREATED, true);
        break;
      case JComponent.WHEN_FOCUSED:
        this.focusInputMap = map;
        this.setFlag(JComponent.FOCUS_INPUTMAP_CREATED, true);
        break;
      default:
        throw new IllegalArgumentException('condition must be one of JComponent.WHEN_IN_FOCUSED_WINDOW, JComponent.WHEN_FOCUSED or JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT');
    }
  }
  /**
   * Returns the <code>InputMap</code> that is used during
   * <code>condition</code>.
   *
   * @param condition one of WHEN_IN_FOCUSED_WINDOW, WHEN_FOCUSED,
   *        WHEN_ANCESTOR_OF_FOCUSED_COMPONENT
   * @return the <code>InputMap</code> for the specified
   *          <code>condition</code>
   * @since 1.3
   */
  getInputMap$int(condition: number): InputMap {
    return this.getInputMap$int$boolean(condition, true);
  }
  /**
   * Returns the <code>InputMap</code> that is used when the
   * component has focus.
   * This is convenience method for <code>getInputMap(WHEN_FOCUSED)</code>.
   *
   * @return the <code>InputMap</code> used when the component has focus
   * @since 1.3
   */
  getInputMap$(): InputMap {
    return this.getInputMap$int$boolean(JComponent.WHEN_FOCUSED, true);
  }
  /**
   * Sets the <code>ActionMap</code> to <code>am</code>. This does not set
   * the parent of the <code>am</code> to be the <code>ActionMap</code>
   * from the UI (if there was one), it is up to the caller to have done this.
   *
   * @param am  the new <code>ActionMap</code>
   * @since 1.3
   */
  setActionMap(am: ActionMap): void {
    this.actionMap = am;
    this.setFlag(JComponent.ACTIONMAP_CREATED, true);
  }
  /**
   * Returns the <code>ActionMap</code> used to determine what
   * <code>Action</code> to fire for particular <code>KeyStroke</code>
   * binding. The returned <code>ActionMap</code>, unless otherwise
   * set, will have the <code>ActionMap</code> from the UI set as the parent.
   *
   * @return the <code>ActionMap</code> containing the key/action bindings
   * @since 1.3
   */
  getActionMap$(): ActionMap {
    return this.getActionMap$boolean(true);
  }
  /**
   * Returns the <code>InputMap</code> to use for condition
   * <code>condition</code>.  If the <code>InputMap</code> hasn't
   * been created, and <code>create</code> is
   * true, it will be created.
   *
   * @param condition one of the following values:
   * <ul>
   * <li>JComponent.FOCUS_INPUTMAP_CREATED
   * <li>JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT
   * <li>JComponent.WHEN_IN_FOCUSED_WINDOW
   * </ul>
   * @param create if true, create the <code>InputMap</code> if it
   *          is not already created
   * @return the <code>InputMap</code> for the given <code>condition</code>;
   *          if <code>create</code> is false and the <code>InputMap</code>
   *          hasn't been created, returns <code>null</code>
   * @throws IllegalArgumentException if <code>condition</code>
   *          is not one of the legal values listed above
   */
  getInputMap$int$boolean(condition: number, create: boolean): InputMap {
    switch (condition) {
      case JComponent.WHEN_FOCUSED:
        if (this.getFlag(JComponent.FOCUS_INPUTMAP_CREATED)) {
          return this.focusInputMap;
        }
        if (create) {
          let km = new InputMap()._InputMap();
          this.setInputMap(condition, km);
          return km;
        }
        break;
      case JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT:
        if (this.getFlag(JComponent.ANCESTOR_INPUTMAP_CREATED)) {
          return this.ancestorInputMap;
        }
        if (create) {
          let km = new InputMap()._InputMap();
          this.setInputMap(condition, km);
          return km;
        }
        break;
      case JComponent.WHEN_IN_FOCUSED_WINDOW:
        if (this.getFlag(JComponent.WIF_INPUTMAP_CREATED)) {
          return this.windowInputMap;
        }
        if (create) {
          let km = new ComponentInputMap()._ComponentInputMap(this);
          this.setInputMap(condition, km);
          return km;
        }
        break;
      default:
        throw new IllegalArgumentException('condition must be one of JComponent.WHEN_IN_FOCUSED_WINDOW, JComponent.WHEN_FOCUSED or JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT');
    }
    return null;
  }
  /**
   * Finds and returns the appropriate <code>ActionMap</code>.
   *
   * @param create if true, create the <code>ActionMap</code> if it
   *          is not already created
   * @return the <code>ActionMap</code> for this component; if the
   *          <code>create</code> flag is false and there is no
   *          current <code>ActionMap</code>, returns <code>null</code>
   */
  getActionMap$boolean(create: boolean): ActionMap {
    if (this.getFlag(JComponent.ACTIONMAP_CREATED)) {
      return this.actionMap;
    }
    if (create) {
      let am = new ActionMap()._ActionMap();
      this.setActionMap(am);
      return am;
    }
    return null;
  }
  /**
   * Returns the baseline.  The baseline is measured from the top of
   * the component.  This method is primarily meant for
   * <code>LayoutManager</code>s to align components along their
   * baseline.  A return value less than 0 indicates this component
   * does not have a reasonable baseline and that
   * <code>LayoutManager</code>s should not align this component on
   * its baseline.
   * <p>
   * This method calls into the <code>ComponentUI</code> method of the
   * same name.  If this component does not have a <code>ComponentUI</code>
   * -1 will be returned.  If a value &gt;= 0 is
   * returned, then the component has a valid baseline for any
   * size &gt;= the minimum size and <code>getBaselineResizeBehavior</code>
   * can be used to determine how the baseline changes with size.
   *
   * @throws IllegalArgumentException {@inheritDoc}
   * @see #getBaselineResizeBehavior
   * @see java.awt.FontMetrics
   * @since 1.6
   */
  getBaseline(width: number, height: number): number {
    super.getBaseline(width, height);
    if (this.ui != null) {
      return this.ui.getBaseline$JComponent$int$int(this, width, height);
    }
    return -1;
  }
  /**
   * Returns an enum indicating how the baseline of the component
   * changes as the size changes.  This method is primarily meant for
   * layout managers and GUI builders.
   * <p>
   * This method calls into the <code>ComponentUI</code> method of
   * the same name.  If this component does not have a
   * <code>ComponentUI</code>
   * <code>BaselineResizeBehavior.OTHER</code> will be
   * returned.  Subclasses should
   * never return <code>null</code>; if the baseline can not be
   * calculated return <code>BaselineResizeBehavior.OTHER</code>.  Callers
   * should first ask for the baseline using
   * <code>getBaseline</code> and if a value &gt;= 0 is returned use
   * this method.  It is acceptable for this method to return a
   * value other than <code>BaselineResizeBehavior.OTHER</code> even if
   * <code>getBaseline</code> returns a value less than 0.
   *
   * @see #getBaseline(int, int)
   * @since 1.6
   */
  getBaselineResizeBehavior(): Component$BaselineResizeBehavior {
    if (this.ui != null) {
      return this.ui.getBaselineResizeBehavior(this);
    }
    return Component$BaselineResizeBehavior.OTHER;
  }
  /**
   * In release 1.4, the focus subsystem was rearchitected.
   * For more information, see
   * <a href="https://docs.oracle.com/javase/tutorial/uiswing/misc/focus.html">
   * How to Use the Focus Subsystem</a>,
   * a section in <em>The Java Tutorial</em>.
   * <p>
   * Requests focus on this <code>JComponent</code>'s
   * <code>FocusTraversalPolicy</code>'s default <code>Component</code>.
   * If this <code>JComponent</code> is a focus cycle root, then its
   * <code>FocusTraversalPolicy</code> is used. Otherwise, the
   * <code>FocusTraversalPolicy</code> of this <code>JComponent</code>'s
   * focus-cycle-root ancestor is used.
   *
   * @return true if this component can request to get the input focus,
   *              false if it can not
   * @see java.awt.FocusTraversalPolicy#getDefaultComponent
   * @deprecated As of 1.4, replaced by
   * <code>FocusTraversalPolicy.getDefaultComponent(Container).requestFocus()</code>
   */
  requestDefaultFocus(): boolean {
    let nearestRoot = (this.isFocusCycleRoot$()) ? this : this.getFocusCycleRootAncestor();
    if (nearestRoot == null) {
      return false;
    }
    let comp = nearestRoot.getFocusTraversalPolicy().getDefaultComponent(nearestRoot);
    if (comp != null) {
      comp.requestFocus$();
      return true;
    } else {
      return false;
    }
  }
  /**
   * Makes the component visible or invisible.
   * Overrides <code>Component.setVisible</code>.
   *
   * @param aFlag  true to make the component visible; false to
   *          make it invisible
   */
  setVisible(aFlag: boolean): void {
    if (aFlag !== this.isVisible$()) {
      super.setVisible(aFlag);
      if (aFlag) {
        let parent = this.getParent();
        if (parent != null) {
          let r = this.getBounds$();
          parent.repaint$int$int$int$int(r.x_, r.y_, r.width_, r.height_);
        }
        this.revalidate();
      }
    }
  }
  /**
   * Sets whether or not this component is enabled.
   * A component that is enabled may respond to user input,
   * while a component that is not enabled cannot respond to
   * user input.  Some components may alter their visual
   * representation when they are disabled in order to
   * provide feedback to the user that they cannot take input.
   * <p>Note: Disabling a component does not disable its children.
   *
   * <p>Note: Disabling a lightweight component does not prevent it from
   * receiving MouseEvents.
   *
   * @param enabled true if this component should be enabled, false otherwise
   * @see java.awt.Component#isEnabled
   * @see java.awt.Component#isLightweight
   */
  setEnabled(enabled: boolean): void {
    let oldEnabled = this.isEnabled();
    super.setEnabled(enabled);
    this.firePropertyChange$String$boolean$boolean('enabled', oldEnabled, enabled);
    if (enabled !== oldEnabled) {
      this.repaint$();
    }
  }
  /**
   * Sets the foreground color of this component.  It is up to the
   * look and feel to honor this property, some may choose to ignore
   * it.
   *
   * @param fg  the desired foreground <code>Color</code>
   * @see java.awt.Component#getForeground
   */
  setForeground(fg: Color): void {
    let oldFg = this.getForeground();
    super.setForeground(fg);
    if ((oldFg != null) ? !oldFg.equals(fg) : ((fg != null) && !fg.equals(oldFg))) {
      this.repaint$();
    }
  }
  /**
   * Sets the background color of this component.  The background
   * color is used only if the component is opaque, and only
   * by subclasses of <code>JComponent</code> or
   * <code>ComponentUI</code> implementations.  Direct subclasses of
   * <code>JComponent</code> must override
   * <code>paintComponent</code> to honor this property.
   * <p>
   * It is up to the look and feel to honor this property, some may
   * choose to ignore it.
   *
   * @param bg the desired background <code>Color</code>
   * @see java.awt.Component#getBackground
   * @see #setOpaque
   */
  setBackground(bg: Color): void {
    let oldBg = this.getBackground();
    super.setBackground(bg);
    if ((oldBg != null) ? !oldBg.equals(bg) : ((bg != null) && !bg.equals(oldBg))) {
      this.repaint$();
    }
  }
  /**
   * Sets the font for this component.
   *
   * @param font the desired <code>Font</code> for this component
   * @see java.awt.Component#getFont
   */
  setFont(font: Font): void {
    let oldFont = this.getFont();
    super.setFont(font);
    if (font !== oldFont) {
      this.revalidate();
      this.repaint$();
    }
  }
  /**
   * Returns the default locale used to initialize each JComponent's
   * locale property upon creation.
   *
   * The default locale has "AppContext" scope so that applets (and
   * potentially multiple lightweight applications running in a single VM)
   * can have their own setting. An applet can safely alter its default
   * locale because it will have no affect on other applets (or the browser).
   *
   * @return the default <code>Locale</code>.
   * @see #setDefaultLocale
   * @see java.awt.Component#getLocale
   * @see #setLocale
   * @since 1.4
   */
  static getDefaultLocale(): Locale {
    let l = SwingUtilities.appContextGet(JComponent.defaultLocale);
    if (l == null) {
      l = Locale.getDefault();
      JComponent.setDefaultLocale(l);
    }
    return l;
  }
  /**
   * Sets the default locale used to initialize each JComponent's locale
   * property upon creation.  The initial value is the VM's default locale.
   *
   * The default locale has "AppContext" scope so that applets (and
   * potentially multiple lightweight applications running in a single VM)
   * can have their own setting. An applet can safely alter its default
   * locale because it will have no affect on other applets (or the browser).
   * Passing {@code null} will reset the current locale back
   * to VM's default locale.
   *
   * @param l the desired default <code>Locale</code> for new components.
   * @see #getDefaultLocale
   * @see java.awt.Component#getLocale
   * @see #setLocale
   * @since 1.4
   */
  static setDefaultLocale(l: Locale): void {
    SwingUtilities.appContextPut(JComponent.defaultLocale, l);
  }
  /**
   * Processes any key events that the component itself
   * recognizes.  This is called after the focus
   * manager and any interested listeners have been
   * given a chance to steal away the event.  This
   * method is called only if the event has not
   * yet been consumed.  This method is called prior
   * to the keyboard UI logic.
   * <p>
   * This method is implemented to do nothing.  Subclasses would
   * normally override this method if they process some
   * key events themselves.  If the event is processed,
   * it should be consumed.
   *
   * @param e the event to be processed
   */
  processComponentKeyEvent(e: KeyEvent): void {
  }
  /**
   * Overrides <code>processKeyEvent</code> to process events.
   */
  processKeyEvent$KeyEvent(e: KeyEvent): void {
    let result: boolean;
    let shouldProcessKey: boolean;
    super.processKeyEvent$KeyEvent(e);
    if (!e.isConsumed()) {
      this.processComponentKeyEvent(e);
    }
    shouldProcessKey = JComponent$KeyboardState.shouldProcess(e);
    if (e.isConsumed()) {
      return;
    }
    if (shouldProcessKey && this.processKeyBindings(e, e.getID() === KeyEvent.KEY_PRESSED)) {
      e.consume();
    }
  }
  /**
   * Invoked to process the key bindings for <code>ks</code> as the result
   * of the <code>KeyEvent</code> <code>e</code>. This obtains
   * the appropriate <code>InputMap</code>,
   * gets the binding, gets the action from the <code>ActionMap</code>,
   * and then (if the action is found and the component
   * is enabled) invokes <code>notifyAction</code> to notify the action.
   *
   * @param ks  the <code>KeyStroke</code> queried
   * @param e the <code>KeyEvent</code>
   * @param condition one of the following values:
   * <ul>
   * <li>JComponent.WHEN_FOCUSED
   * <li>JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT
   * <li>JComponent.WHEN_IN_FOCUSED_WINDOW
   * </ul>
   * @param pressed true if the key is pressed
   * @return true if there was a binding to an action, and the action
   *         was enabled
   *
   * @since 1.3
   */
  processKeyBinding(ks: KeyStroke, e: KeyEvent, condition: number, pressed: boolean): boolean {
    let map = this.getInputMap$int$boolean(condition, false);
    let am = this.getActionMap$boolean(false);
    if (map != null && am != null && this.isEnabled()) {
      let binding = map.get(ks);
      let action = (binding == null) ? null : am.get(binding);
      if (action != null) {
        return SwingUtilities.notifyAction(action, ks, e, this, e.getModifiers());
      }
    }
    return false;
  }
  /**
   * This is invoked as the result of a <code>KeyEvent</code>
   * that was not consumed by the <code>FocusManager</code>,
   * <code>KeyListeners</code>, or the component. It will first try
   * <code>WHEN_FOCUSED</code> bindings,
   * then <code>WHEN_ANCESTOR_OF_FOCUSED_COMPONENT</code> bindings,
   * and finally <code>WHEN_IN_FOCUSED_WINDOW</code> bindings.
   *
   * @param e the unconsumed <code>KeyEvent</code>
   * @param pressed true if the key is pressed
   * @return true if there is a key binding for <code>e</code>
   */
  processKeyBindings(e: KeyEvent, pressed: boolean): boolean {
    if (!SwingUtilities.isValidKeyEventForKeyBindings(e)) {
      return false;
    }
    let ks: KeyStroke;
    let ksE = null;
    if (e.getID() === KeyEvent.KEY_TYPED) {
      ks = KeyStroke.getKeyStroke$char(e.getKeyChar());
    } else {
      ks = KeyStroke.getKeyStroke$int$int$boolean(e.getKeyCode(), e.getModifiers(), (pressed ? false : true));
      if (e.getKeyCode() !== e.getExtendedKeyCode()) {
        ksE = KeyStroke.getKeyStroke$int$int$boolean(e.getExtendedKeyCode(), e.getModifiers(), (pressed ? false : true));
      }
    }
    if (ksE != null && this.processKeyBinding(ksE, e, JComponent.WHEN_FOCUSED, pressed)) {
      return true;
    }
    if (this.processKeyBinding(ks, e, JComponent.WHEN_FOCUSED, pressed)) {
      return true;
    }
    let parent = this;
    while (parent != null && !(parent instanceof Window) && !($J.isa(parent, Applet))) {
      if (parent instanceof JComponent) {
        if (ksE != null && (parent).processKeyBinding(ksE, e, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, pressed)) {
          return true;
        }
        if ((parent).processKeyBinding(ks, e, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, pressed)) {
          return true;
        }
      }
      if ((parent instanceof JInternalFrame) && JComponent.processKeyBindingsForAllComponents(e, parent, pressed)) {
        return true;
      }
      parent = parent.getParent();
    }
    if (parent != null) {
      return JComponent.processKeyBindingsForAllComponents(e, parent, pressed);
    }
    return false;
  }
  static processKeyBindingsForAllComponents(e: KeyEvent, container: Container, pressed: boolean): boolean {
    while (true) {
      if (KeyboardManager.getCurrentManager().fireKeyboardAction(e, pressed, container)) {
        return true;
      }
      if (container instanceof Popup$HeavyWeightWindow) {
        container = (container).getOwner();
      } else {
        return false;
      }
    }
  }
  /**
   * Registers the text to display in a tool tip.
   * The text displays when the cursor lingers over the component.
   * <p>
   * See <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/tooltip.html">How to Use Tool Tips</a>
   * in <em>The Java Tutorial</em>
   * for further documentation.
   *
   * @param text  the string to display; if the text is <code>null</code>,
   *              the tool tip is turned off for this component
   * @see #TOOL_TIP_TEXT_KEY
   */
  setToolTipText(text: string): void {
    let oldText = this.getToolTipText$();
    this.putClientProperty(JComponent.TOOL_TIP_TEXT_KEY, text);
    let toolTipManager = ToolTipManager.sharedInstance();
    if (text != null) {
      if (oldText == null) {
        toolTipManager.registerComponent(this);
      }
    } else {
      toolTipManager.unregisterComponent(this);
    }
  }
  /**
   * Returns the tooltip string that has been set with
   * <code>setToolTipText</code>.
   *
   * @return the text of the tool tip
   * @see #TOOL_TIP_TEXT_KEY
   */
  getToolTipText$(): string {
    return this.getClientProperty(JComponent.TOOL_TIP_TEXT_KEY);
  }
  /**
   * Returns the string to be used as the tooltip for <i>event</i>.
   * By default this returns any string set using
   * <code>setToolTipText</code>.  If a component provides
   * more extensive API to support differing tooltips at different locations,
   * this method should be overridden.
   *
   * @param event the {@code MouseEvent} that initiated the
   *              {@code ToolTip} display
   * @return a string containing the  tooltip
   */
  getToolTipText$MouseEvent(event: MouseEvent): string {
    return this.getToolTipText$();
  }
  /**
   * Returns the tooltip location in this component's coordinate system.
   * If <code>null</code> is returned, Swing will choose a location.
   * The default implementation returns <code>null</code>.
   *
   * @param event  the <code>MouseEvent</code> that caused the
   *          <code>ToolTipManager</code> to show the tooltip
   * @return always returns <code>null</code>
   */
  getToolTipLocation(event: MouseEvent): Point {
    return null;
  }
  /**
   * Returns the preferred location to display the popup menu in this
   * component's coordinate system. It is up to the look and feel to
   * honor this property, some may choose to ignore it.
   * If {@code null}, the look and feel will choose a suitable location.
   *
   * @param event the {@code MouseEvent} that triggered the popup to be
   *        shown, or {@code null} if the popup is not being shown as the
   *        result of a mouse event
   * @return location to display the {@code JPopupMenu}, or {@code null}
   * @since 1.5
   */
  getPopupLocation$MouseEvent(event: MouseEvent): Point {
    return null;
  }
  /**
   * Returns the instance of <code>JToolTip</code> that should be used
   * to display the tooltip.
   * Components typically would not override this method,
   * but it can be used to
   * cause different tooltips to be displayed differently.
   *
   * @return the <code>JToolTip</code> used to display this toolTip
   */
  createToolTip(): JToolTip {
    let tip = new JToolTip()._JToolTip();
    tip.setComponent(this);
    return tip;
  }
  /**
   * Forwards the <code>scrollRectToVisible()</code> message to the
   * <code>JComponent</code>'s parent. Components that can service
   * the request, such as <code>JViewport</code>,
   * override this method and perform the scrolling.
   *
   * @param aRect the visible <code>Rectangle</code>
   * @see JViewport
   */
  scrollRectToVisible(aRect: Rectangle): void {
    let parent: Container;
    let dx = this.getX();
    let dy = this.getY();
    for (parent = this.getParent(); !(parent == null) && !(parent instanceof JComponent) && !(parent instanceof CellRendererPane); parent = parent.getParent()) {
      let bounds = parent.getBounds$();
      dx = (dx + bounds.x_) | 0;
      dy = (dy + bounds.y_) | 0;
    }
    if (!(parent == null) && !(parent instanceof CellRendererPane)) {
      aRect.x_ = (aRect.x_ + dx) | 0;
      aRect.y_ = (aRect.y_ + dy) | 0;
      (parent).scrollRectToVisible(aRect);
      aRect.x_ = (aRect.x_ - dx) | 0;
      aRect.y_ = (aRect.y_ - dy) | 0;
    }
  }
  /**
   * Sets the <code>autoscrolls</code> property.
   * If <code>true</code> mouse dragged events will be
   * synthetically generated when the mouse is dragged
   * outside of the component's bounds and mouse motion
   * has paused (while the button continues to be held
   * down). The synthetic events make it appear that the
   * drag gesture has resumed in the direction established when
   * the component's boundary was crossed.  Components that
   * support autoscrolling must handle <code>mouseDragged</code>
   * events by calling <code>scrollRectToVisible</code> with a
   * rectangle that contains the mouse event's location.  All of
   * the Swing components that support item selection and are
   * typically displayed in a <code>JScrollPane</code>
   * (<code>JTable</code>, <code>JList</code>, <code>JTree</code>,
   * <code>JTextArea</code>, and <code>JEditorPane</code>)
   * already handle mouse dragged events in this way.  To enable
   * autoscrolling in any other component, add a mouse motion
   * listener that calls <code>scrollRectToVisible</code>.
   * For example, given a <code>JPanel</code>, <code>myPanel</code>:
   * <pre>
   * MouseMotionListener doScrollRectToVisible = new MouseMotionAdapter() {
   *     public void mouseDragged(MouseEvent e) {
   *        Rectangle r = new Rectangle(e.getX(), e.getY(), 1, 1);
   *        ((JPanel)e.getSource()).scrollRectToVisible(r);
   *    }
   * };
   * myPanel.addMouseMotionListener(doScrollRectToVisible);
   * </pre>
   * The default value of the <code>autoScrolls</code>
   * property is <code>false</code>.
   *
   * @param autoscrolls if true, synthetic mouse dragged events
   *   are generated when the mouse is dragged outside of a component's
   *   bounds and the mouse button continues to be held down; otherwise
   *   false
   * @see #getAutoscrolls
   * @see JViewport
   * @see JScrollPane
   */
  setAutoscrolls(autoscrolls: boolean): void {
    this.setFlag(JComponent.AUTOSCROLLS_SET, true);
    if (this.autoscrolls !== autoscrolls) {
      this.autoscrolls = autoscrolls;
      if (autoscrolls) {
        this.enableEvents(AWTEvent.MOUSE_EVENT_MASK);
        this.enableEvents(AWTEvent.MOUSE_MOTION_EVENT_MASK);
      } else {
        Autoscroller.stop(this);
      }
    }
  }
  /**
   * Gets the <code>autoscrolls</code> property.
   *
   * @return the value of the <code>autoscrolls</code> property
   * @see JViewport
   * @see #setAutoscrolls
   */
  getAutoscrolls(): boolean {
    return this.autoscrolls;
  }
  /**
   * Sets the {@code TransferHandler}, which provides support for transfer
   * of data into and out of this component via cut/copy/paste and drag
   * and drop. This may be {@code null} if the component does not support
   * data transfer operations.
   * <p>
   * If the new {@code TransferHandler} is not {@code null}, this method
   * also installs a <b>new</b> {@code DropTarget} on the component to
   * activate drop handling through the {@code TransferHandler} and activate
   * any built-in support (such as calculating and displaying potential drop
   * locations). If you do not wish for this component to respond in any way
   * to drops, you can disable drop support entirely either by removing the
   * drop target ({@code setDropTarget(null)}) or by de-activating it
   * ({@code getDropTaget().setActive(false)}).
   * <p>
   * If the new {@code TransferHandler} is {@code null}, this method removes
   * the drop target.
   * <p>
   * Under two circumstances, this method does not modify the drop target:
   * First, if the existing drop target on this component was explicitly
   * set by the developer to a {@code non-null} value. Second, if the
   * system property {@code suppressSwingDropSupport} is {@code true}. The
   * default value for the system property is {@code false}.
   * <p>
   * Please see
   * <a href="https://docs.oracle.com/javase/tutorial/uiswing/dnd/index.html">
   * How to Use Drag and Drop and Data Transfer</a>,
   * a section in <em>The Java Tutorial</em>, for more information.
   *
   * @param newHandler the new {@code TransferHandler}
   *
   * @see TransferHandler
   * @see #getTransferHandler
   * @since 1.4
   */
  setTransferHandler(newHandler: TransferHandler): void {
    let oldHandler = this.getClientProperty(ClientPropertyKey.JComponent_TRANSFER_HANDLER);
    this.putClientProperty(ClientPropertyKey.JComponent_TRANSFER_HANDLER, newHandler);
    SwingUtilities.installSwingDropTargetAsNecessary(this, newHandler);
    this.firePropertyChange$String$Object$Object('transferHandler', oldHandler, newHandler);
  }
  /**
   * Gets the <code>transferHandler</code> property.
   *
   * @return  the value of the <code>transferHandler</code> property
   *
   * @see TransferHandler
   * @see #setTransferHandler
   * @since 1.4
   */
  getTransferHandler(): TransferHandler {
    return this.getClientProperty(ClientPropertyKey.JComponent_TRANSFER_HANDLER);
  }
  /**
   * Calculates a custom drop location for this type of component,
   * representing where a drop at the given point should insert data.
   * <code>null</code> is returned if this component doesn't calculate
   * custom drop locations. In this case, <code>TransferHandler</code>
   * will provide a default <code>DropLocation</code> containing just
   * the point.
   *
   * @param p the point to calculate a drop location for
   * @return the drop location, or <code>null</code>
   */
  dropLocationForPoint$Point(p: Point): TransferHandler$DropLocation {
    return null;
  }
  /**
   * Called to set or clear the drop location during a DnD operation.
   * In some cases, the component may need to use its internal selection
   * temporarily to indicate the drop location. To help facilitate this,
   * this method returns and accepts as a parameter a state object.
   * This state object can be used to store, and later restore, the selection
   * state. Whatever this method returns will be passed back to it in
   * future calls, as the state parameter. If it wants the DnD system to
   * continue storing the same state, it must pass it back every time.
   * Here's how this is used:
   * <p>
   * Let's say that on the first call to this method the component decides
   * to save some state (because it is about to use the selection to show
   * a drop index). It can return a state object to the caller encapsulating
   * any saved selection state. On a second call, let's say the drop location
   * is being changed to something else. The component doesn't need to
   * restore anything yet, so it simply passes back the same state object
   * to have the DnD system continue storing it. Finally, let's say this
   * method is messaged with <code>null</code>. This means DnD
   * is finished with this component for now, meaning it should restore
   * state. At this point, it can use the state parameter to restore
   * said state, and of course return <code>null</code> since there's
   * no longer anything to store.
   *
   * @param location the drop location (as calculated by
   *        <code>dropLocationForPoint</code>) or <code>null</code>
   *        if there's no longer a valid drop location
   * @param state the state object saved earlier for this component,
   *        or <code>null</code>
   * @param forDrop whether or not the method is being called because an
   *        actual drop occurred
   * @return any saved state for this component, or <code>null</code> if none
   */
  setDropLocation$DropLocation$Object$boolean(location: TransferHandler$DropLocation, state: any, forDrop: boolean): any {
    return null;
  }
  /**
   * Called to indicate to this component that DnD is done.
   * Needed by <code>JTree</code>.
   */
  dndDone(): void {
  }
  /**
   * Processes mouse events occurring on this component by
   * dispatching them to any registered
   * <code>MouseListener</code> objects, refer to
   * {@link java.awt.Component#processMouseEvent(MouseEvent)}
   * for a complete description of this method.
   *
   * @param       e the mouse event
   * @see         java.awt.Component#processMouseEvent
   * @since       1.5
   */
  processMouseEvent$MouseEvent(e: MouseEvent): void {
    if (this.autoscrolls && e.getID() === MouseEvent.MOUSE_RELEASED) {
      Autoscroller.stop(this);
    }
    super.processMouseEvent$MouseEvent(e);
  }
  /**
   * Processes mouse motion events, such as MouseEvent.MOUSE_DRAGGED.
   *
   * @param e the <code>MouseEvent</code>
   * @see MouseEvent
   */
  processMouseMotionEvent(e: MouseEvent): void {
    let dispatch = true;
    if (this.autoscrolls && e.getID() === MouseEvent.MOUSE_DRAGGED) {
      dispatch = !Autoscroller.isRunning(this);
      Autoscroller.processMouseDragged(e);
    }
    if (dispatch) {
      super.processMouseMotionEvent(e);
    }
  }
  superProcessMouseMotionEvent(e: MouseEvent): void {
    super.processMouseMotionEvent(e);
  }
  /**
   * This is invoked by the <code>RepaintManager</code> if
   * <code>createImage</code> is called on the component.
   *
   * @param newValue true if the double buffer image was created from this component
   */
  setCreatedDoubleBuffer(newValue: boolean): void {
    this.setFlag(JComponent.CREATED_DOUBLE_BUFFER, newValue);
  }
  /**
   * Returns true if the <code>RepaintManager</code>
   * created the double buffer image from the component.
   *
   * @return true if this component had a double buffer image, false otherwise
   */
  getCreatedDoubleBuffer(): boolean {
    return this.getFlag(JComponent.CREATED_DOUBLE_BUFFER);
  }
  /**
   * @deprecated As of JDK version 1.1,
   * replaced by <code>java.awt.Component.setEnabled(boolean)</code>.
   */
  enable$(): void {
    if (this.isEnabled() !== true) {
      super.enable$();
      if (this.accessibleContext != null) {
        this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, null, AccessibleState.ENABLED);
      }
    }
  }
  /**
   * @deprecated As of JDK version 1.1,
   * replaced by <code>java.awt.Component.setEnabled(boolean)</code>.
   */
  disable(): void {
    if (this.isEnabled() !== false) {
      super.disable();
      if (this.accessibleContext != null) {
        this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, AccessibleState.ENABLED, null);
      }
    }
  }
  /**
   * Returns an <code>ArrayTable</code> used for
   * key/value "client properties" for this component. If the
   * <code>clientProperties</code> table doesn't exist, an empty one
   * will be created.
   *
   * @return an ArrayTable
   * @see #putClientProperty
   * @see #getClientProperty
   */
  getClientProperties(): ArrayTable {
    if (this.clientProperties == null) {
      this.clientProperties = new ArrayTable()._ArrayTable();
    }
    return this.clientProperties;
  }
  /**
   * Returns the value of the property with the specified key.  Only
   * properties added with <code>putClientProperty</code> will return
   * a non-<code>null</code> value.
   *
   * @param key the being queried
   * @return the value of this property or <code>null</code>
   * @see #putClientProperty
   */
  getClientProperty(key: any): any {
    if (key === RenderingHints.KEY_TEXT_ANTIALIASING) {
      return this.aaHint;
    } else if (key === RenderingHints.KEY_TEXT_LCD_CONTRAST) {
      return this.lcdRenderingHint;
    }
    if (this.clientProperties == null) {
      return null;
    } else {
      {
        return this.clientProperties.get(key);
      }
    }
  }
  /**
   * Adds an arbitrary key/value "client property" to this component.
   * <p>
   * The <code>get/putClientProperty</code> methods provide access to
   * a small per-instance hashtable. Callers can use get/putClientProperty
   * to annotate components that were created by another module.
   * For example, a
   * layout manager might store per child constraints this way. For example:
   * <pre>
   * componentA.putClientProperty("to the left of", componentB);
   * </pre>
   * If value is <code>null</code> this method will remove the property.
   * Changes to client properties are reported with
   * <code>PropertyChange</code> events.
   * The name of the property (for the sake of PropertyChange
   * events) is <code>key.toString()</code>.
   * <p>
   * The <code>clientProperty</code> dictionary is not intended to
   * support large
   * scale extensions to JComponent nor should be it considered an
   * alternative to subclassing when designing a new component.
   *
   * @param key the new client property key
   * @param value the new client property value; if <code>null</code>
   *          this method will remove the property
   * @see #getClientProperty
   * @see #addPropertyChangeListener
   */
  putClientProperty(key: any, value: any): void {
    if (key === RenderingHints.KEY_TEXT_ANTIALIASING) {
      this.aaHint = value;
      return;
    } else if (key === RenderingHints.KEY_TEXT_LCD_CONTRAST) {
      this.lcdRenderingHint = value;
      return;
    }
    if (value == null && this.clientProperties == null) {
      return;
    }
    let clientProperties = this.getClientProperties();
    let oldValue: any;
    {
      oldValue = clientProperties.get(key);
      if (value != null) {
        clientProperties.put(key, value);
      } else if (oldValue != null) {
        clientProperties.remove(key);
      } else {
        return;
      }
    }
    this.clientPropertyChanged(key, oldValue, value);
    this.firePropertyChange$String$Object$Object($J.str(key), oldValue, value);
  }
  clientPropertyChanged(key: any, oldValue: any, newValue: any): void {
  }
  setUIProperty(propertyName: string, value: any): void {
    if ($J.equals('opaque', propertyName)) {
      if (!this.getFlag(JComponent.OPAQUE_SET)) {
        this.setOpaque((value));
        this.setFlag(JComponent.OPAQUE_SET, false);
      }
    } else if ($J.equals('autoscrolls', propertyName)) {
      if (!this.getFlag(JComponent.AUTOSCROLLS_SET)) {
        this.setAutoscrolls((value));
        this.setFlag(JComponent.AUTOSCROLLS_SET, false);
      }
    } else if ($J.equals('focusTraversalKeysForward', propertyName)) {
      let strokeSet = value;
      if (!this.getFlag(JComponent.FOCUS_TRAVERSAL_KEYS_FORWARD_SET)) {
        super.setFocusTraversalKeys(KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS, strokeSet);
      }
    } else if ($J.equals('focusTraversalKeysBackward', propertyName)) {
      let strokeSet = value;
      if (!this.getFlag(JComponent.FOCUS_TRAVERSAL_KEYS_BACKWARD_SET)) {
        super.setFocusTraversalKeys(KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS, strokeSet);
      }
    } else {
      throw new IllegalArgumentException('property "' + propertyName + '" cannot be set using this method');
    }
  }
  /**
   * Sets the focus traversal keys for a given traversal operation for this
   * Component.
   * Refer to
   * {@link java.awt.Component#setFocusTraversalKeys}
   * for a complete description of this method.
   * <p>
   * This method may throw a {@code ClassCastException} if any {@code Object}
   * in {@code keystrokes} is not an {@code AWTKeyStroke}.
   *
   * @param id one of KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS,
   *        KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS, or
   *        KeyboardFocusManager.UP_CYCLE_TRAVERSAL_KEYS
   * @param keystrokes the Set of AWTKeyStroke for the specified operation
   * @see java.awt.KeyboardFocusManager#FORWARD_TRAVERSAL_KEYS
   * @see java.awt.KeyboardFocusManager#BACKWARD_TRAVERSAL_KEYS
   * @see java.awt.KeyboardFocusManager#UP_CYCLE_TRAVERSAL_KEYS
   * @throws IllegalArgumentException if id is not one of
   *         KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS,
   *         KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS, or
   *         KeyboardFocusManager.UP_CYCLE_TRAVERSAL_KEYS, or if keystrokes
   *         contains null, or if any keystroke represents a KEY_TYPED event,
   *         or if any keystroke already maps to another focus traversal
   *         operation for this Component
   * @since 1.5
   */
  setFocusTraversalKeys(id: number, keystrokes: JSet<AWTKeyStroke>): void {
    if (id === KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS) {
      this.setFlag(JComponent.FOCUS_TRAVERSAL_KEYS_FORWARD_SET, true);
    } else if (id === KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS) {
      this.setFlag(JComponent.FOCUS_TRAVERSAL_KEYS_BACKWARD_SET, true);
    }
    super.setFocusTraversalKeys(id, keystrokes);
  }
  /**
   * Returns true if this component is lightweight, that is, if it doesn't
   * have a native window system peer.
   *
   * @param c  the {@code Component} to be checked
   * @return true if this component is lightweight
   */
  static isLightweightComponent(c: Component): boolean {
    return AWTAccessor.getComponentAccessor().isLightweight(c);
  }
  /**
   * @deprecated As of JDK 5,
   * replaced by <code>Component.setBounds(int, int, int, int)</code>.
   * <p>
   * Moves and resizes this component.
   *
   * @param x  the new horizontal location
   * @param y  the new vertical location
   * @param w  the new width
   * @param h  the new height
   * @see java.awt.Component#setBounds
   */
  reshape(x: number, y: number, w: number, h: number): void {
    super.reshape(x, y, w, h);
  }
  /**
   * Stores the bounds of this component into "return value"
   * <code>rv</code> and returns <code>rv</code>.
   * If <code>rv</code> is <code>null</code> a new <code>Rectangle</code>
   * is allocated.  This version of <code>getBounds</code> is useful
   * if the caller wants to avoid allocating a new <code>Rectangle</code>
   * object on the heap.
   *
   * @param rv the return value, modified to the component's bounds
   * @return <code>rv</code>; if <code>rv</code> is <code>null</code>
   *          return a newly created <code>Rectangle</code> with this
   *          component's bounds
   */
  getBounds$Rectangle(rv: Rectangle): Rectangle {
    if (rv == null) {
      return new Rectangle()._Rectangle$int$int$int$int(this.getX(), this.getY(), this.getWidth(), this.getHeight());
    } else {
      rv.setBounds$int$int$int$int(this.getX(), this.getY(), this.getWidth(), this.getHeight());
      return rv;
    }
  }
  /**
   * Stores the width/height of this component into "return value"
   * <code>rv</code> and returns <code>rv</code>.
   * If <code>rv</code> is <code>null</code> a new <code>Dimension</code>
   * object is allocated.  This version of <code>getSize</code>
   * is useful if the caller wants to avoid allocating a new
   * <code>Dimension</code> object on the heap.
   *
   * @param rv the return value, modified to the component's size
   * @return <code>rv</code>
   */
  getSize$Dimension(rv: Dimension): Dimension {
    if (rv == null) {
      return new Dimension()._Dimension$int$int(this.getWidth(), this.getHeight());
    } else {
      rv.setSize$int$int(this.getWidth(), this.getHeight());
      return rv;
    }
  }
  /**
   * Returns the current x coordinate of the component's origin.
   * This method is preferable to writing
   * <code>component.getBounds().x</code>, or
   * <code>component.getLocation().x</code> because it doesn't cause any
   * heap allocations.
   *
   * @return the current x coordinate of the component's origin
   */
  getX(): number {
    return super.getX();
  }
  /**
   * Returns the current y coordinate of the component's origin.
   * This method is preferable to writing
   * <code>component.getBounds().y</code>, or
   * <code>component.getLocation().y</code> because it doesn't cause any
   * heap allocations.
   *
   * @return the current y coordinate of the component's origin
   */
  getY(): number {
    return super.getY();
  }
  /**
   * Returns the current width of this component.
   * This method is preferable to writing
   * <code>component.getBounds().width</code>, or
   * <code>component.getSize().width</code> because it doesn't cause any
   * heap allocations.
   *
   * @return the current width of this component
   */
  getWidth(): number {
    return super.getWidth();
  }
  /**
   * Returns the current height of this component.
   * This method is preferable to writing
   * <code>component.getBounds().height</code>, or
   * <code>component.getSize().height</code> because it doesn't cause any
   * heap allocations.
   *
   * @return the current height of this component
   */
  getHeight(): number {
    return super.getHeight();
  }
  /**
   * Returns true if this component is completely opaque.
   * <p>
   * An opaque component paints every pixel within its
   * rectangular bounds. A non-opaque component paints only a subset of
   * its pixels or none at all, allowing the pixels underneath it to
   * "show through".  Therefore, a component that does not fully paint
   * its pixels provides a degree of transparency.
   * <p>
   * Subclasses that guarantee to always completely paint their contents
   * should override this method and return true.
   *
   * @return true if this component is completely opaque
   * @see #setOpaque
   */
  isOpaque(): boolean {
    return this.getFlag(JComponent.IS_OPAQUE);
  }
  /**
   * If true the component paints every pixel within its bounds.
   * Otherwise, the component may not paint some or all of its
   * pixels, allowing the underlying pixels to show through.
   * <p>
   * The default value of this property is false for <code>JComponent</code>.
   * However, the default value for this property on most standard
   * <code>JComponent</code> subclasses (such as <code>JButton</code> and
   * <code>JTree</code>) is look-and-feel dependent.
   *
   * @param isOpaque  true if this component should be opaque
   * @see #isOpaque
   */
  setOpaque(isOpaque: boolean): void {
    let oldValue = this.getFlag(JComponent.IS_OPAQUE);
    this.setFlag(JComponent.IS_OPAQUE, isOpaque);
    this.setFlag(JComponent.OPAQUE_SET, true);
    this.firePropertyChange$String$boolean$boolean('opaque', oldValue, isOpaque);
  }
  /**
   * If the specified rectangle is completely obscured by any of this
   * component's opaque children then returns true.  Only direct children
   * are considered, more distant descendants are ignored.  A
   * <code>JComponent</code> is opaque if
   * <code>JComponent.isOpaque()</code> returns true, other lightweight
   * components are always considered transparent, and heavyweight components
   * are always considered opaque.
   *
   * @param x  x value of specified rectangle
   * @param y  y value of specified rectangle
   * @param width  width of specified rectangle
   * @param height height of specified rectangle
   * @return true if the specified rectangle is obscured by an opaque child
   */
  rectangleIsObscured(x: number, y: number, width: number, height: number): boolean {
    let numChildren = this.getComponentCount();
    for (let i = 0; i < numChildren; i++) {
      let child = this.getComponent$int(i);
      let cx: number;
      let cy: number;
      let cw: number;
      let ch: number;
      cx = child.getX();
      cy = child.getY();
      cw = child.getWidth();
      ch = child.getHeight();
      if (x >= cx && ((x + width) | 0) <= ((cx + cw) | 0) && y >= cy && ((y + height) | 0) <= ((cy + ch) | 0) && child.isVisible$()) {
        if (child instanceof JComponent) {
          return child.isOpaque();
        } else {
          return false;
        }
      }
    }
    return false;
  }
  /**
   * Returns the <code>Component</code>'s "visible rect rectangle" -  the
   * intersection of the visible rectangles for the component <code>c</code>
   * and all of its ancestors.  The return value is stored in
   * <code>visibleRect</code>.
   *
   * @param c  the component
   * @param visibleRect  a <code>Rectangle</code> computed as the
   *          intersection of all visible rectangles for the component
   *          <code>c</code> and all of its ancestors -- this is the
   *          return value for this method
   * @see #getVisibleRect
   */
  static computeVisibleRect(c: Component, visibleRect: Rectangle): void {
    let p = c.getParent();
    let bounds = c.getBounds$();
    if (p == null || p instanceof Window || $J.isa(p, Applet)) {
      visibleRect.setBounds$int$int$int$int(0, 0, bounds.width_, bounds.height_);
    } else {
      JComponent.computeVisibleRect(p, visibleRect);
      visibleRect.x_ = (visibleRect.x_ - bounds.x_) | 0;
      visibleRect.y_ = (visibleRect.y_ - bounds.y_) | 0;
      SwingUtilities.computeIntersection(0, 0, bounds.width_, bounds.height_, visibleRect);
    }
  }
  /**
   * Returns the <code>Component</code>'s "visible rect rectangle" -  the
   * intersection of the visible rectangles for this component
   * and all of its ancestors.  The return value is stored in
   * <code>visibleRect</code>.
   *
   * @param visibleRect a <code>Rectangle</code> computed as the
   *          intersection of all visible rectangles for this
   *          component and all of its ancestors -- this is the return
   *          value for this method
   * @see #getVisibleRect
   */
  computeVisibleRect(visibleRect: Rectangle): void {
    JComponent.computeVisibleRect(this, visibleRect);
  }
  /**
   * Returns the <code>Component</code>'s "visible rectangle" -  the
   * intersection of this component's visible rectangle,
   * <code>new Rectangle(0, 0, getWidth(), getHeight())</code>,
   * and all of its ancestors' visible rectangles.
   *
   * @return the visible rectangle
   */
  getVisibleRect(): Rectangle {
    let visibleRect = new Rectangle()._Rectangle$();
    this.computeVisibleRect(visibleRect);
    return visibleRect;
  }
  /**
   * Support for reporting bound property changes for boolean properties.
   * This method can be called when a bound property has changed and it will
   * send the appropriate PropertyChangeEvent to any registered
   * PropertyChangeListeners.
   *
   * @param propertyName the property whose value has changed
   * @param oldValue the property's previous value
   * @param newValue the property's new value
   */
  firePropertyChange$String$boolean$boolean(propertyName: string, oldValue: boolean, newValue: boolean): void {
    super.firePropertyChange$String$boolean$boolean(propertyName, oldValue, newValue);
  }
  /**
   * Support for reporting bound property changes for integer properties.
   * This method can be called when a bound property has changed and it will
   * send the appropriate PropertyChangeEvent to any registered
   * PropertyChangeListeners.
   *
   * @param propertyName the property whose value has changed
   * @param oldValue the property's previous value
   * @param newValue the property's new value
   */
  firePropertyChange$String$int$int(propertyName: string, oldValue: number, newValue: number): void {
    super.firePropertyChange$String$int$int(propertyName, oldValue, newValue);
  }
  /**
   * Supports reporting constrained property changes.
   * This method can be called when a constrained property has changed
   * and it will send the appropriate <code>PropertyChangeEvent</code>
   * to any registered <code>VetoableChangeListeners</code>.
   *
   * @param propertyName  the name of the property that was listened on
   * @param oldValue  the old value of the property
   * @param newValue  the new value of the property
   * @throws java.beans.PropertyVetoException when the attempt to set the
   *          property is vetoed by the component
   */
  fireVetoableChange(propertyName: string, oldValue: any, newValue: any): void {
    if (this.vetoableChangeSupport == null) {
      return;
    }
    this.vetoableChangeSupport.fireVetoableChange$String$Object$Object(propertyName, oldValue, newValue);
  }
  /**
   * Returns an array of all the vetoable change listeners
   * registered on this component.
   *
   * @return all of the component's <code>VetoableChangeListener</code>s
   *         or an empty
   *         array if no vetoable change listeners are currently registered
   *
   * @see #addVetoableChangeListener
   * @see #removeVetoableChangeListener
   *
   * @since 1.4
   */
  getVetoableChangeListeners(): VetoableChangeListener[] {
    if (this.vetoableChangeSupport == null) {
      return $J.newArray(0, null);
    }
    return this.vetoableChangeSupport.getVetoableChangeListeners$();
  }
  /**
   * Returns the top-level ancestor of this component (either the
   * containing <code>Window</code> or <code>Applet</code>),
   * or <code>null</code> if this component has not
   * been added to any container.
   *
   * @return the top-level <code>Container</code> that this component is in,
   *          or <code>null</code> if not in any container
   */
  getTopLevelAncestor(): Container {
    for (let p = this; p != null; p = p.getParent()) {
      if (p instanceof Window || $J.isa(p, Applet)) {
        return p;
      }
    }
    return null;
  }
  getAncestorNotifier(): AncestorNotifier {
    return this.getClientProperty(ClientPropertyKey.JComponent_ANCESTOR_NOTIFIER);
  }
  /**
   * Registers <code>listener</code> so that it will receive
   * <code>AncestorEvents</code> when it or any of its ancestors
   * move or are made visible or invisible.
   * Events are also sent when the component or its ancestors are added
   * or removed from the containment hierarchy.
   *
   * @param listener  the <code>AncestorListener</code> to register
   * @see AncestorEvent
   */
  addAncestorListener(listener: AncestorListener): void {
    let ancestorNotifier = this.getAncestorNotifier();
    if (ancestorNotifier == null) {
      ancestorNotifier = new AncestorNotifier()._AncestorNotifier(this);
      this.putClientProperty(ClientPropertyKey.JComponent_ANCESTOR_NOTIFIER, ancestorNotifier);
    }
    ancestorNotifier.addAncestorListener(listener);
  }
  /**
   * Returns an array of all the ancestor listeners
   * registered on this component.
   *
   * @return all of the component's <code>AncestorListener</code>s
   *         or an empty
   *         array if no ancestor listeners are currently registered
   *
   * @see #addAncestorListener
   * @see #removeAncestorListener
   *
   * @since 1.4
   */
  getAncestorListeners(): AncestorListener[] {
    let ancestorNotifier = this.getAncestorNotifier();
    if (ancestorNotifier == null) {
      return $J.newArray(0, null);
    }
    return ancestorNotifier.getAncestorListeners();
  }
  /**
   * Returns an array of all the objects currently registered
   * as <code><em>Foo</em>Listener</code>s
   * upon this <code>JComponent</code>.
   * <code><em>Foo</em>Listener</code>s are registered using the
   * <code>add<em>Foo</em>Listener</code> method.
   *
   * <p>
   *
   * You can specify the <code>listenerType</code> argument
   * with a class literal,
   * such as
   * <code><em>Foo</em>Listener.class</code>.
   * For example, you can query a
   * <code>JComponent</code> <code>c</code>
   * for its mouse listeners with the following code:
   * <pre>MouseListener[] mls = (MouseListener[])(c.getListeners(MouseListener.class));</pre>
   * If no such listeners exist, this method returns an empty array.
   *
   * @param listenerType the type of listeners requested; this parameter
   *          should specify an interface that descends from
   *          <code>java.util.EventListener</code>
   * @return an array of all objects registered as
   *          <code><em>Foo</em>Listener</code>s on this component,
   *          or an empty array if no such
   *          listeners have been added
   * @throws ClassCastException if <code>listenerType</code>
   *          doesn't specify a class or interface that implements
   *          <code>java.util.EventListener</code>
   *
   * @since 1.3
   *
   * @see #getVetoableChangeListeners
   * @see #getAncestorListeners
   */
  getListeners<T>(listenerType: JClass<T>): T[] {
    let result: T[];
    if (listenerType === $J.cls(AncestorListener)) {
      result = this.getAncestorListeners();
    } else if (listenerType === $J.cls(VetoableChangeListener)) {
      result = this.getVetoableChangeListeners();
    } else if (listenerType === $J.cls(PropertyChangeListener)) {
      result = this.getPropertyChangeListeners$();
    } else {
      result = this.listenerList.getListeners(listenerType);
    }
    if (result.length === 0) {
      return super.getListeners(listenerType);
    }
    return result;
  }
  /**
   * Notifies this component that it now has a parent component.
   * When this method is invoked, the chain of parent components is
   * set up with <code>KeyboardAction</code> event listeners.
   * This method is called by the toolkit internally and should
   * not be called directly by programs.
   *
   * @see #registerKeyboardAction
   */
  addNotify(): void {
    super.addNotify();
    this.firePropertyChange$String$Object$Object('ancestor', null, this.getParent());
    this.registerWithKeyboardManager$boolean$JComponent(false);
    this.registerNextFocusableComponent$$JComponent();
  }
  /**
   * Notifies this component that it no longer has a parent component.
   * When this method is invoked, any <code>KeyboardAction</code>s
   * set up in the chain of parent components are removed.
   * This method is called by the toolkit internally and should
   * not be called directly by programs.
   *
   * @see #registerKeyboardAction
   */
  removeNotify(): void {
    super.removeNotify();
    this.firePropertyChange$String$Object$Object('ancestor', this.getParent(), null);
    this.unregisterWithKeyboardManager$$JComponent();
    this.deregisterNextFocusableComponent();
    if (this.getCreatedDoubleBuffer()) {
      RepaintManager.currentManager$JComponent(this).resetDoubleBuffer();
      this.setCreatedDoubleBuffer(false);
    }
    if (this.autoscrolls) {
      Autoscroller.stop(this);
    }
  }
  /**
   * Adds the specified region to the dirty region list if the component
   * is showing.  The component will be repainted after all of the
   * currently pending events have been dispatched.
   *
   * @param tm  this parameter is not used
   * @param x  the x value of the dirty region
   * @param y  the y value of the dirty region
   * @param width  the width of the dirty region
   * @param height  the height of the dirty region
   * @see #isPaintingOrigin()
   * @see java.awt.Component#isShowing
   * @see RepaintManager#addDirtyRegion
   */
  repaint$long$int$int$int$int(tm: number, x: number, y: number, width: number, height: number): void {
    RepaintManager.currentManager$AppContext(SunToolkit.targetToAppContext(this)).addDirtyRegion$JComponent$int$int$int$int(this, x, y, width, height);
  }
  /**
   * Adds the specified region to the dirty region list if the component
   * is showing.  The component will be repainted after all of the
   * currently pending events have been dispatched.
   *
   * @param  r a <code>Rectangle</code> containing the dirty region
   * @see #isPaintingOrigin()
   * @see java.awt.Component#isShowing
   * @see RepaintManager#addDirtyRegion
   */
  repaint$Rectangle(r: Rectangle): void {
    this.repaint$long$int$int$int$int(0, r.x_, r.y_, r.width_, r.height_);
  }
  /**
   * Supports deferred automatic layout.
   * <p>
   * Calls <code>invalidate</code> and then adds this component's
   * <code>validateRoot</code> to a list of components that need to be
   * validated.  Validation will occur after all currently pending
   * events have been dispatched.  In other words after this method
   * is called,  the first validateRoot (if any) found when walking
   * up the containment hierarchy of this component will be validated.
   * By default, <code>JRootPane</code>, <code>JScrollPane</code>,
   * and <code>JTextField</code> return true
   * from <code>isValidateRoot</code>.
   * <p>
   * This method will automatically be called on this component
   * when a property value changes such that size, location, or
   * internal layout of this component has been affected.  This automatic
   * updating differs from the AWT because programs generally no
   * longer need to invoke <code>validate</code> to get the contents of the
   * GUI to update.
   *
   * @see java.awt.Component#invalidate
   * @see java.awt.Container#validate
   * @see #isValidateRoot
   * @see RepaintManager#addInvalidComponent
   */
  revalidate(): void {
    if (this.getParent() == null) {
      return;
    }
    if (SunToolkit.isDispatchThreadForAppContext(this)) {
      this.invalidate();
      RepaintManager.currentManager$JComponent(this).addInvalidComponent(this);
    } else {
      if (this.revalidateRunnableScheduled.getAndSet(true)) {
        return;
      }
      SunToolkit.executeOnEventHandlerThread(this, () => {
        this.revalidateRunnableScheduled.set(false);
        this.revalidate();
      });
    }
  }
  /**
   * If this method returns true, <code>revalidate</code> calls by
   * descendants of this component will cause the entire tree
   * beginning with this root to be validated.
   * Returns false by default.  <code>JScrollPane</code> overrides
   * this method and returns true.
   *
   * @return always returns false
   * @see #revalidate
   * @see java.awt.Component#invalidate
   * @see java.awt.Container#validate
   * @see java.awt.Container#isValidateRoot
   */
  isValidateRoot$(): boolean {
    return false;
  }
  /**
   * Returns true if this component tiles its children -- that is, if
   * it can guarantee that the children will not overlap.  The
   * repainting system is substantially more efficient in this
   * common case.  <code>JComponent</code> subclasses that can't make this
   * guarantee, such as <code>JLayeredPane</code>,
   * should override this method to return false.
   *
   * @return always returns true
   */
  isOptimizedDrawingEnabled(): boolean {
    return true;
  }
  /**
   * Returns {@code true} if a paint triggered on a child component should cause
   * painting to originate from this Component, or one of its ancestors.
   * <p>
   * Calling {@link #repaint} or {@link #paintImmediately(int, int, int, int)}
   * on a Swing component will result in calling
   * the {@link JComponent#paintImmediately(int, int, int, int)} method of
   * the first ancestor which {@code isPaintingOrigin()} returns {@code true}, if there are any.
   * <p>
   * {@code JComponent} subclasses that need to be painted when any of their
   * children are repainted should override this method to return {@code true}.
   *
   * @return always returns {@code false}
   *
   * @see #paintImmediately(int, int, int, int)
   */
  isPaintingOrigin(): boolean {
    return false;
  }
  /**
   * Paints the specified region in this component and all of its
   * descendants that overlap the region, immediately.
   * <p>
   * It's rarely necessary to call this method.  In most cases it's
   * more efficient to call repaint, which defers the actual painting
   * and can collapse redundant requests into a single paint call.
   * This method is useful if one needs to update the display while
   * the current event is being dispatched.
   * <p>
   * This method is to be overridden when the dirty region needs to be changed
   * for components that are painting origins.
   *
   * @param x  the x value of the region to be painted
   * @param y  the y value of the region to be painted
   * @param w  the width of the region to be painted
   * @param h  the height of the region to be painted
   * @see #repaint
   * @see #isPaintingOrigin()
   */
  paintImmediately$int$int$int$int(x: number, y: number, w: number, h: number): void {
    let c = this;
    let parent: Component;
    if (!this.isShowing()) {
      return;
    }
    let paintingOigin = SwingUtilities.getPaintingOrigin(this);
    if (paintingOigin != null) {
      let rectangle = SwingUtilities.convertRectangle(c, new Rectangle()._Rectangle$int$int$int$int(x, y, w, h), paintingOigin);
      paintingOigin.paintImmediately$int$int$int$int(rectangle.x_, rectangle.y_, rectangle.width_, rectangle.height_);
      return;
    }
    while (!c.isOpaque()) {
      parent = c.getParent();
      if (parent != null) {
        x = (x + c.getX()) | 0;
        y = (y + c.getY()) | 0;
        c = parent;
      } else {
        break;
      }
      if (!(c instanceof JComponent)) {
        break;
      }
    }
    if (c instanceof JComponent) {
      (c)._paintImmediately(x, y, w, h);
    } else {
      c.repaint$int$int$int$int(x, y, w, h);
    }
  }
  /**
   * Paints the specified region now.
   *
   * @param r a <code>Rectangle</code> containing the region to be painted
   */
  paintImmediately$Rectangle(r: Rectangle): void {
    this.paintImmediately$int$int$int$int(r.x_, r.y_, r.width_, r.height_);
  }
  /**
   * Returns whether this component should be guaranteed to be on top.
   * For example, it would make no sense for <code>Menu</code>s to pop up
   * under another component, so they would always return true.
   * Most components will want to return false, hence that is the default.
   *
   * @return always returns false
   */
  alwaysOnTop(): boolean {
    return false;
  }
  setPaintingChild(paintingChild: Component): void {
    this.paintingChild = paintingChild;
  }
  _paintImmediately(x: number, y: number, w: number, h: number): void {
    let g: Graphics;
    let c: Container;
    let b: Rectangle;
    let tmpX: number;
    let tmpY: number;
    let tmpWidth: number;
    let tmpHeight: number;
    let offsetX = 0;
    let offsetY = 0;
    let hasBuffer = false;
    let bufferedComponent = null;
    let paintingComponent = this;
    let repaintManager = RepaintManager.currentManager$JComponent(this);
    let path = new ArrayList(7);
    let pIndex = -1;
    let pCount = 0;
    tmpX = tmpY = tmpWidth = tmpHeight = 0;
    let paintImmediatelyClip = JComponent.fetchRectangle();
    paintImmediatelyClip.x_ = x;
    paintImmediatelyClip.y_ = y;
    paintImmediatelyClip.width_ = w;
    paintImmediatelyClip.height_ = h;
    let ontop = this.alwaysOnTop() && this.isOpaque();
    if (ontop) {
      SwingUtilities.computeIntersection(0, 0, this.getWidth(), this.getHeight(), paintImmediatelyClip);
      if (paintImmediatelyClip.width_ === 0) {
        JComponent.recycleRectangle(paintImmediatelyClip);
        return;
      }
    }
    let child: Component;
    for (c = this, child = null; c != null && !(c instanceof Window) && !($J.isa(c, Applet)); child = c, c = c.getParent()) {
      let jc = (c instanceof JComponent) ? c : null;
      path.add(c);
      if (!ontop && jc != null && !jc.isOptimizedDrawingEnabled()) {
        let resetPC: boolean;
        if (c !== this) {
          if (jc.isPaintingOrigin()) {
            resetPC = true;
          } else {
            let children = c.getComponents();
            let i = 0;
            for (; i < children.length; i++) {
              if (children[i] === child) {
                break;
              }
            }
            switch (jc.getObscuredState(i, paintImmediatelyClip.x_, paintImmediatelyClip.y_, paintImmediatelyClip.width_, paintImmediatelyClip.height_)) {
              case JComponent.NOT_OBSCURED:
                resetPC = false;
                break;
              case JComponent.COMPLETELY_OBSCURED:
                JComponent.recycleRectangle(paintImmediatelyClip);
                return;
              default:
                resetPC = true;
                break;
            }
          }
        } else {
          resetPC = false;
        }
        if (resetPC) {
          paintingComponent = jc;
          pIndex = pCount;
          offsetX = offsetY = 0;
          hasBuffer = false;
        }
      }
      pCount++;
      if (repaintManager.isDoubleBufferingEnabled() && jc != null && jc.isDoubleBuffered()) {
        hasBuffer = true;
        bufferedComponent = jc;
      }
      if (!ontop) {
        let bx = c.getX();
        let by = c.getY();
        tmpWidth = c.getWidth();
        tmpHeight = c.getHeight();
        SwingUtilities.computeIntersection(tmpX, tmpY, tmpWidth, tmpHeight, paintImmediatelyClip);
        paintImmediatelyClip.x_ = (paintImmediatelyClip.x_ + bx) | 0;
        paintImmediatelyClip.y_ = (paintImmediatelyClip.y_ + by) | 0;
        offsetX = (offsetX + bx) | 0;
        offsetY = (offsetY + by) | 0;
      }
    }
    if (c == null || !c.isDisplayable() || paintImmediatelyClip.width_ <= 0 || paintImmediatelyClip.height_ <= 0) {
      JComponent.recycleRectangle(paintImmediatelyClip);
      return;
    }
    paintingComponent.setFlag(JComponent.IS_REPAINTING, true);
    paintImmediatelyClip.x_ = (paintImmediatelyClip.x_ - offsetX) | 0;
    paintImmediatelyClip.y_ = (paintImmediatelyClip.y_ - offsetY) | 0;
    if (paintingComponent !== this) {
      let comp: Component;
      let i = pIndex;
      for (; i > 0; i--) {
        comp = path.get(i);
        if (comp instanceof JComponent) {
          (comp).setPaintingChild(path.get((i - 1) | 0));
        }
      }
    }
    try {
      if ((g = JComponent.safelyGetGraphics$Component$Component(paintingComponent, c)) != null) {
        try {
          if (hasBuffer) {
            let rm = RepaintManager.currentManager$JComponent(bufferedComponent);
            rm.beginPaint();
            try {
              rm.paint(paintingComponent, bufferedComponent, g, paintImmediatelyClip.x_, paintImmediatelyClip.y_, paintImmediatelyClip.width_, paintImmediatelyClip.height_);
            } finally {
              rm.endPaint();
            }
          } else {
            g.setClip$int$int$int$int(paintImmediatelyClip.x_, paintImmediatelyClip.y_, paintImmediatelyClip.width_, paintImmediatelyClip.height_);
            paintingComponent.paint(g);
          }
        } finally {
          g.dispose();
        }
      }
    } finally {
      if (paintingComponent !== this) {
        let comp: Component;
        let i = pIndex;
        for (; i > 0; i--) {
          comp = path.get(i);
          if (comp instanceof JComponent) {
            (comp).setPaintingChild(null);
          }
        }
      }
      paintingComponent.setFlag(JComponent.IS_REPAINTING, false);
    }
    JComponent.recycleRectangle(paintImmediatelyClip);
  }
  /**
   * Paints to the specified graphics.  This does not set the clip and it
   * does not adjust the Graphics in anyway, callers must do that first.
   * This method is package-private for RepaintManager.PaintManager and
   * its subclasses to call, it is NOT intended for general use outside
   * of that.
   */
  paintToOffscreen(g: Graphics, x: number, y: number, w: number, h: number, maxX: number, maxY: number): void {
    try {
      this.setFlag(JComponent.ANCESTOR_USING_BUFFER, true);
      if (((y + h) | 0) < maxY || ((x + w) | 0) < maxX) {
        this.setFlag(JComponent.IS_PAINTING_TILE, true);
      }
      if (this.getFlag(JComponent.IS_REPAINTING)) {
        this.paint(g);
      } else {
        if (!this.rectangleIsObscured(x, y, w, h)) {
          this.paintComponent(g);
          this.paintBorder(g);
        }
        this.paintChildren(g);
      }
    } finally {
      this.setFlag(JComponent.ANCESTOR_USING_BUFFER, false);
      this.setFlag(JComponent.IS_PAINTING_TILE, false);
    }
  }
  /**
   * Returns whether or not the region of the specified component is
   * obscured by a sibling.
   *
   * @return NOT_OBSCURED if non of the siblings above the Component obscure
   *         it, COMPLETELY_OBSCURED if one of the siblings completely
   *         obscures the Component or PARTIALLY_OBSCURED if the Component is
   *         only partially obscured.
   */
  getObscuredState(compIndex: number, x: number, y: number, width: number, height: number): number {
    let retValue = JComponent.NOT_OBSCURED;
    let tmpRect = JComponent.fetchRectangle();
    for (let i = (compIndex - 1) | 0; i >= 0; i--) {
      let sibling = this.getComponent$int(i);
      if (!sibling.isVisible$()) {
        continue;
      }
      let siblingRect: Rectangle;
      let opaque: boolean;
      if (sibling instanceof JComponent) {
        opaque = sibling.isOpaque();
        if (!opaque) {
          if (retValue === JComponent.PARTIALLY_OBSCURED) {
            continue;
          }
        }
      } else {
        opaque = true;
      }
      siblingRect = sibling.getBounds$Rectangle(tmpRect);
      if (opaque && x >= siblingRect.x_ && ((x + width) | 0) <= ((siblingRect.x_ + siblingRect.width_) | 0) && y >= siblingRect.y_ && ((y + height) | 0) <= ((siblingRect.y_ + siblingRect.height_) | 0)) {
        JComponent.recycleRectangle(tmpRect);
        return JComponent.COMPLETELY_OBSCURED;
      } else if (retValue === JComponent.NOT_OBSCURED && !((((x + width) | 0) <= siblingRect.x_) || (((y + height) | 0) <= siblingRect.y_) || (x >= ((siblingRect.x_ + siblingRect.width_) | 0)) || (y >= ((siblingRect.y_ + siblingRect.height_) | 0)))) {
        retValue = JComponent.PARTIALLY_OBSCURED;
      }
    }
    JComponent.recycleRectangle(tmpRect);
    return retValue;
  }
  /**
   * Returns true, which implies that before checking if a child should
   * be painted it is first check that the child is not obscured by another
   * sibling. This is only checked if <code>isOptimizedDrawingEnabled</code>
   * returns false.
   *
   * @return always returns true
   */
  checkIfChildObscuredBySibling(): boolean {
    return true;
  }
  setFlag(aFlag: number, aValue: boolean): void {
    if (aValue) {
      this.flags |= (1 << aFlag);
    } else {
      this.flags &= ~(1 << aFlag);
    }
  }
  getFlag(aFlag: number): boolean {
    let mask = (1 << aFlag);
    return ((this.flags & mask) === mask);
  }
  static setWriteObjCounter(comp: JComponent, count: number): void {
    comp.flags = (comp.flags & ~(255 << JComponent.WRITE_OBJ_COUNTER_FIRST)) | (count << JComponent.WRITE_OBJ_COUNTER_FIRST);
  }
  static getWriteObjCounter(comp: JComponent): number {
    return ((((comp.flags >> JComponent.WRITE_OBJ_COUNTER_FIRST) & 255)) << 24) >> 24;
  }
  /**
   * Sets whether this component should use a buffer to paint.
   *  If set to true, all the drawing from this component will be done
   *  in an offscreen painting buffer. The offscreen painting buffer will
   *  the be copied onto the screen.
   *  If a <code>Component</code> is buffered and one of its ancestor
   *  is also buffered, the ancestor buffer will be used.
   *
   *  @param aFlag if true, set this component to be double buffered
   */
  setDoubleBuffered(aFlag: boolean): void {
    this.setFlag(JComponent.IS_DOUBLE_BUFFERED, aFlag);
  }
  /**
   * Returns whether this component should use a buffer to paint.
   *
   * @return true if this component is double buffered, otherwise false
   */
  isDoubleBuffered(): boolean {
    return this.getFlag(JComponent.IS_DOUBLE_BUFFERED);
  }
  /**
   * Returns the <code>JRootPane</code> ancestor for this component.
   *
   * @return the <code>JRootPane</code> that contains this component,
   *          or <code>null</code> if no <code>JRootPane</code> is found
   */
  getRootPane(): JRootPane {
    return SwingUtilities.getRootPane(this);
  }
  /**
   * Returns a string representation of this <code>JComponent</code>.
   * This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JComponent</code>
   */
  paramString(): string {
    let preferredSizeString = (this.isPreferredSizeSet() ? this.getPreferredSize$().toString() : '');
    let minimumSizeString = (this.isMinimumSizeSet() ? this.getMinimumSize$().toString() : '');
    let maximumSizeString = (this.isMaximumSizeSet() ? this.getMaximumSize().toString() : '');
    let borderString = (this.border == null ? '' : (this.border === this ? 'this' : this.border.toString()));
    return super.paramString() + ',alignmentX=' + $J.fstr(this.alignmentX) + ',alignmentY=' + $J.fstr(this.alignmentY) + ',border=' + borderString + ',flags=' + this.flags + ',maximumSize=' + maximumSizeString + ',minimumSize=' + minimumSizeString + ',preferredSize=' + preferredSizeString;
  }
  /**
   * {@inheritDoc}
   */
  hide(): void {
    let showing = this.isShowing();
    super.hide();
    if (showing) {
      let parent = this.getParent();
      if (parent != null) {
        let r = this.getBounds$();
        parent.repaint$int$int$int$int(r.x_, r.y_, r.width_, r.height_);
      }
      this.revalidate();
    }
  }
  static $clinit() {
    JComponent.readObjectCallbacks = new Hashtable(1);
    JComponent.INPUT_VERIFIER_SOURCE_KEY = new StringBuilder('InputVerifierSourceKey');
    JComponent.tempRectangles = new ArrayList(11);
    JComponent.componentObtainingGraphicsFromLock = new StringBuilder('componentObtainingGraphicsFrom');
    SwingAccessor.setJComponentAccessor(new (JComponent$1())());
    JComponent.focusController = new (JComponent$2())();
  }
}

/**
 * <code>ActionStandin</code> is used as a standin for
 * <code>ActionListeners</code> that are
 * added via <code>registerKeyboardAction</code>.
 */
export class JComponent$ActionStandin extends JObject {
  actionListener: ActionListener = null;
  command: string = null;
  action_: Action = null;
}

export class JComponent$IntVector extends JObject {
  array: number[] = null;
  count_: number = 0;
  capacity_: number = 0;
  _JComponent$IntVector(): this {
    this.array = null;
    this.count_ = 0;
    this.capacity_ = 0;
    return this;
  }
  size(): number {
    return this.count_;
  }
  elementAt(index: number): number {
    return this.array[index];
  }
  addElement(value: number): void {
    if (this.count_ === this.capacity_) {
      this.capacity_ = Math.imul(((this.capacity_ + 2) | 0), 2);
      let newarray = $J.newArray(this.capacity_, 0);
      if (this.count_ > 0) {
        $J.system_arraycopy(this.array, 0, newarray, 0, this.count_);
      }
      this.array = newarray;
    }
    this.array[this.count_++] = value;
  }
  setElementAt(value: number, index: number): void {
    this.array[index] = value;
  }
}

export class JComponent$KeyboardState extends JObject {
  static keyCodesKey: any = null;
  static getKeyCodeArray(): JComponent$IntVector {
    let iv = SwingUtilities.appContextGet(JComponent$KeyboardState.keyCodesKey);
    if (iv == null) {
      iv = new JComponent$IntVector()._JComponent$IntVector();
      SwingUtilities.appContextPut(JComponent$KeyboardState.keyCodesKey, iv);
    }
    return iv;
  }
  static registerKeyPressed(keyCode: number): void {
    let kca = JComponent$KeyboardState.getKeyCodeArray();
    let count = kca.size();
    let i: number;
    for (i = 0; i < count; i++) {
      if (kca.elementAt(i) === -1) {
        kca.setElementAt(keyCode, i);
        return;
      }
    }
    kca.addElement(keyCode);
  }
  static registerKeyReleased(keyCode: number): void {
    let kca = JComponent$KeyboardState.getKeyCodeArray();
    let count = kca.size();
    let i: number;
    for (i = 0; i < count; i++) {
      if (kca.elementAt(i) === keyCode) {
        kca.setElementAt(-1, i);
        return;
      }
    }
  }
  static keyIsPressed(keyCode: number): boolean {
    let kca = JComponent$KeyboardState.getKeyCodeArray();
    let count = kca.size();
    let i: number;
    for (i = 0; i < count; i++) {
      if (kca.elementAt(i) === keyCode) {
        return true;
      }
    }
    return false;
  }
  /**
   * Updates internal state of the KeyboardState and returns true
   * if the event should be processed further.
   */
  static shouldProcess(e: KeyEvent): boolean {
    switch (e.getID()) {
      case KeyEvent.KEY_PRESSED:
        if (!JComponent$KeyboardState.keyIsPressed(e.getKeyCode())) {
          JComponent$KeyboardState.registerKeyPressed(e.getKeyCode());
        }
        return true;
      case KeyEvent.KEY_RELEASED:
        if (JComponent$KeyboardState.keyIsPressed(e.getKeyCode()) || e.getKeyCode() === KeyEvent.VK_PRINTSCREEN) {
          JComponent$KeyboardState.registerKeyReleased(e.getKeyCode());
          return true;
        }
        return false;
      case KeyEvent.KEY_TYPED:
        return true;
      default:
        return false;
    }
  }
  static $clinit() {
    JComponent$KeyboardState.keyCodesKey = $J.cls(JComponent$KeyboardState);
  }
}

/**
 * Inner class of JComponent used to provide default support for
 * accessibility.  This class is not meant to be used directly by
 * application developers, but is instead meant only to be
 * subclassed by component developers.
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
export class JComponent$AccessibleJComponent extends Container$AccessibleAWTContainer {
  /**
   * Number of PropertyChangeListener objects registered. It's used
   * to add/remove ContainerListener and FocusListener to track
   * target JComponent's state
   */
  propertyListenersCount$JComponent_AccessibleJComponent: number = 0;
  /**
   * This field duplicates the function of the accessibleAWTFocusHandler field
   * in java.awt.Component.AccessibleAWTComponent, so it has been deprecated.
   */
  accessibleFocusHandler: FocusListener = null;
  /**
   * Though the class is abstract, this should be called by
   * all sub-classes.
   */
  _JComponent$AccessibleJComponent(): this {
    this._Container$AccessibleAWTContainer();
    this.accessibleFocusHandler = null;
    return this;
  }
  /**
   * Recursively search through the border hierarchy (if it exists)
   * for a TitledBorder with a non-null title.  This does a depth
   * first search on first the inside borders then the outside borders.
   * The assumption is that titles make really pretty inside borders
   * but not very pretty outside borders in compound border situations.
   * It's rather arbitrary, but hopefully decent UI programmers will
   * not create multiple titled borders for the same component.
   *
   * @param b  the {@code Border} for which to retrieve its title
   * @return the border's title as a {@code String}, null if it has
   *         no title
   */
  getBorderTitle(b: Border): string {
    let s: string;
    if (b instanceof TitledBorder) {
      return (b).getTitle();
    } else if (b instanceof CompoundBorder) {
      s = this.getBorderTitle((b).getInsideBorder());
      if (s == null) {
        s = this.getBorderTitle((b).getOutsideBorder());
      }
      return s;
    } else {
      return null;
    }
  }
  /**
   * Gets the accessible name of this object.  This should almost never
   * return java.awt.Component.getName(), as that generally isn't
   * a localized name, and doesn't have meaning for the user.  If the
   * object is fundamentally a text object (such as a menu item), the
   * accessible name should be the text of the object (for example,
   * "save").
   * If the object has a tooltip, the tooltip text may also be an
   * appropriate String to return.
   *
   * @return the localized name of the object -- can be null if this
   *         object does not have a name
   * @see AccessibleContext#setAccessibleName
   */
  getAccessibleName(): string {
    let name = this.accessibleName;
    if (name == null) {
      name = this.$outer.getClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY);
    }
    if (name == null) {
      name = this.getBorderTitle(this.$outer.getBorder());
    }
    if (name == null) {
      let o = this.$outer.getClientProperty(JLabel.LABELED_BY_PROPERTY);
      if ($J.isa(o, Accessible)) {
        let ac = (o).getAccessibleContext();
        if (ac != null) {
          name = ac.getAccessibleName();
        }
      }
    }
    return name;
  }
  /**
   * Gets the accessible description of this object.  This should be
   * a concise, localized description of what this object is - what
   * is its meaning to the user.  If the object has a tooltip, the
   * tooltip text may be an appropriate string to return, assuming
   * it contains a concise description of the object (instead of just
   * the name of the object - for example a "Save" icon on a toolbar that
   * had "save" as the tooltip text shouldn't return the tooltip
   * text as the description, but something like "Saves the current
   * text document" instead).
   *
   * @return the localized description of the object -- can be null if
   * this object does not have a description
   * @see AccessibleContext#setAccessibleDescription
   */
  getAccessibleDescription(): string {
    let description = this.accessibleDescription;
    if (description == null) {
      description = this.$outer.getClientProperty(AccessibleContext.ACCESSIBLE_DESCRIPTION_PROPERTY);
    }
    if (description == null) {
      try {
        description = this.getToolTipText();
      } catch ($e0) {
        if ($J.isa($e0, Exception)) {
          let e = $J.exc($e0);
        } else {
          throw $e0;
        }
      }
    }
    if (description == null) {
      let o = this.$outer.getClientProperty(JLabel.LABELED_BY_PROPERTY);
      if ($J.isa(o, Accessible)) {
        let ac = (o).getAccessibleContext();
        if (ac != null) {
          description = ac.getAccessibleDescription();
        }
      }
    }
    return description;
  }
  /**
   * Gets the state of this object.
   *
   * @return an instance of AccessibleStateSet containing the current
   * state set of the object
   * @see AccessibleState
   */
  getAccessibleStateSet$(): AccessibleStateSet {
    let states = super.getAccessibleStateSet$();
    if (this.$outer.isOpaque()) {
      states.add(AccessibleState.OPAQUE);
    }
    return states;
  }
  /**
   * Returns the number of accessible children in the object.  If all
   * of the children of this object implement Accessible, than this
   * method should return the number of children of this object.
   *
   * @return the number of accessible children in the object.
   */
  getAccessibleChildrenCount(): number {
    return super.getAccessibleChildrenCount();
  }
  /**
   * Returns the nth Accessible child of the object.
   *
   * @param i zero-based index of child
   * @return the nth Accessible child of the object
   */
  getAccessibleChild(i: number): Accessible {
    return super.getAccessibleChild(i);
  }
  /**
   * Returns the tool tip text
   *
   * @return the tool tip text, if supported, of the object;
   * otherwise, null
   * @since 1.4
   */
  getToolTipText(): string {
    return this.$outer.getToolTipText$();
  }
}

/**
 * This object is the <code>ObjectInputStream</code> callback
 * that's called after a complete graph of objects (including at least
 * one <code>JComponent</code>) has been read.
 *  It sets the UI property of each Swing component
 * that was read to the current default with <code>updateUI</code>.
 * <p>
 * As each  component is read in we keep track of the current set of
 * root components here, in the roots vector.  Note that there's only one
 * <code>ReadObjectCallback</code> per <code>ObjectInputStream</code>,
 * they're stored in the static <code>readObjectCallbacks</code>
 * hashtable.
 *
 * @see java.io.ObjectInputStream#registerValidation
 * @see SwingUtilities#updateComponentTreeUI
 */
export class JComponent$ReadObjectCallback extends JObject {
  roots: Vector<JComponent> = null;
  inputStream: ObjectInputStream = null;
}

let $JComponent$1: any = null;
/** An anonymous class (JComponent.java:433). */
function JComponent$1(): any {
  return $JComponent$1 ??= $J.local(class extends JObject {
  }, 'javax.swing.JComponent$1', ['sun.swing.SwingAccessor$JComponentAccessor']);
}

let $JComponent$2: any = null;
/** An anonymous class (JComponent.java:3633). */
function JComponent$2(): any {
  return $JComponent$2 ??= $J.local(class extends JObject {
    acceptRequestFocus(from: Component, to: Component, temporary: boolean, focusedWindowChangeAllowed: boolean, cause: FocusEvent$Cause): boolean {
      var target;
      if (!((target = to) instanceof JComponent)) {
        return true;
      }
      var jFocusOwner;
      if (!((jFocusOwner = from) instanceof JComponent)) {
        return true;
      }
      if (!target.getVerifyInputWhenFocusTarget()) {
        return true;
      }
      let iv = jFocusOwner.getInputVerifier();
      if (iv == null) {
        return true;
      } else {
        let currentSource = SwingUtilities.appContextGet(JComponent.INPUT_VERIFIER_SOURCE_KEY);
        if (currentSource === jFocusOwner) {
          return true;
        }
        SwingUtilities.appContextPut(JComponent.INPUT_VERIFIER_SOURCE_KEY, jFocusOwner);
        try {
          return iv.shouldYieldFocus$JComponent$JComponent(jFocusOwner, target);
        } finally {
          if (currentSource != null) {
            SwingUtilities.appContextPut(JComponent.INPUT_VERIFIER_SOURCE_KEY, currentSource);
          } else {
            SwingUtilities.appContextRemove(JComponent.INPUT_VERIFIER_SOURCE_KEY);
          }
        }
      }
    }
  }, 'javax.swing.JComponent$2', ['sun.awt.RequestFocusController']);
}

$J.define(JComponent, 'javax.swing.JComponent', { kind: 'class', ifaces: ['java.io.Serializable', 'javax.swing.TransferHandler$HasGetTransferHandler'], sup: 'java.awt.Container', ctors: { '': '_JComponent' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JComponent', 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$JComponent', 'paintImmediately(java.awt.Rectangle)': 'paintImmediately$Rectangle', 'paintImmediately(int,int,int,int)': 'paintImmediately$int$int$int$int', 'isValidateRoot()': 'isValidateRoot$', 'repaint(java.awt.Rectangle)': 'repaint$Rectangle', 'repaint(long,int,int,int,int)': 'repaint$long$int$int$int$int', 'firePropertyChange(java.lang.String,char,char)': 'firePropertyChange$String$char$char', 'firePropertyChange(java.lang.String,int,int)': 'firePropertyChange$String$int$int', 'firePropertyChange(java.lang.String,boolean,boolean)': 'firePropertyChange$String$boolean$boolean', 'getLocation(java.awt.Point)': 'getLocation$Point', 'getSize(java.awt.Dimension)': 'getSize$Dimension', 'getBounds(java.awt.Rectangle)': 'getBounds$Rectangle', 'enable()': 'enable$', 'processMouseEvent(java.awt.event.MouseEvent)': 'processMouseEvent$MouseEvent', 'setDropLocation(javax.swing.TransferHandler$DropLocation,java.lang.Object,boolean)': 'setDropLocation$DropLocation$Object$boolean', 'dropLocationForPoint(java.awt.Point)': 'dropLocationForPoint$Point', 'getPopupLocation(java.awt.event.MouseEvent)': 'getPopupLocation$MouseEvent', 'getToolTipText(java.awt.event.MouseEvent)': 'getToolTipText$MouseEvent', 'getToolTipText()': 'getToolTipText$', 'processKeyEvent(java.awt.event.KeyEvent)': 'processKeyEvent$KeyEvent', 'getActionMap(boolean)': 'getActionMap$boolean', 'getInputMap(int,boolean)': 'getInputMap$int$boolean', 'getActionMap()': 'getActionMap$', 'getInputMap()': 'getInputMap$', 'getInputMap(int)': 'getInputMap$int', 'registerKeyboardAction(java.awt.event.ActionListener,javax.swing.KeyStroke,int)': 'registerKeyboardAction$ActionListener$KeyStroke$int', 'unregisterWithKeyboardManager(javax.swing.KeyStroke)': 'unregisterWithKeyboardManager$KeyStroke$JComponent', 'registerWithKeyboardManager(javax.swing.KeyStroke)': 'registerWithKeyboardManager$KeyStroke$JComponent', 'unregisterWithKeyboardManager()': 'unregisterWithKeyboardManager$$JComponent', 'registerWithKeyboardManager(boolean)': 'registerWithKeyboardManager$boolean$JComponent', 'registerKeyboardAction(java.awt.event.ActionListener,java.lang.String,javax.swing.KeyStroke,int)': 'registerKeyboardAction$ActionListener$String$KeyStroke$int', 'getInsets(java.awt.Insets)': 'getInsets$Insets', 'getInsets()': 'getInsets$', 'contains(int,int)': 'contains$int$int', 'getMinimumSize()': 'getMinimumSize$', 'getPreferredSize()': 'getPreferredSize$', 'requestFocusInWindow(boolean)': 'requestFocusInWindow$boolean', 'requestFocusInWindow()': 'requestFocusInWindow$', 'requestFocus(boolean)': 'requestFocus$boolean', 'requestFocus()': 'requestFocus$', 'registerNextFocusableComponent(java.awt.Component)': 'registerNextFocusableComponent$Component$JComponent', 'registerNextFocusableComponent()': 'registerNextFocusableComponent$$JComponent', 'print(java.awt.Graphics)': 'print$Graphics', 'update(java.awt.Graphics)': 'update$Graphics', 'setUI(javax.swing.plaf.ComponentUI)': 'setUI$ComponentUI', 'safelyGetGraphics(java.awt.Component,java.awt.Component)': 'safelyGetGraphics$Component$Component', 'safelyGetGraphics(java.awt.Component)': 'safelyGetGraphics$Component' }, clinit: true, lazy: ['readObjectCallbacks', 'managingFocusForwardTraversalKeys', 'managingFocusBackwardTraversalKeys', 'DEBUG_GRAPHICS_LOADED', 'INPUT_VERIFIER_SOURCE_KEY', 'tempRectangles', 'componentObtainingGraphicsFrom', 'componentObtainingGraphicsFromLock', 'focusController'] });
$J.define(JComponent$ActionStandin, 'javax.swing.JComponent$ActionStandin', { kind: 'class', ifaces: ['javax.swing.Action'], sup: 'java.lang.Object', ctors: { 'java.awt.event.ActionListener,java.lang.String': '_JComponent$ActionStandin' }, meths: { 'getValue(java.lang.String)': 'getValue$String' } });
$J.define(JComponent$IntVector, 'javax.swing.JComponent$IntVector', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_JComponent$IntVector' } });
$J.define(JComponent$KeyboardState, 'javax.swing.JComponent$KeyboardState', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_JComponent$KeyboardState' }, clinit: true, lazy: ['keyCodesKey'] });
$J.define(JComponent$AccessibleJComponent, 'javax.swing.JComponent$AccessibleJComponent', { kind: 'class', ifaces: ['javax.accessibility.AccessibleExtendedComponent'], sup: 'java.awt.Container$AccessibleAWTContainer', ctors: { '': '_JComponent$AccessibleJComponent' }, meths: { 'getAccessibleStateSet()': 'getAccessibleStateSet$', 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.define(JComponent$ReadObjectCallback, 'javax.swing.JComponent$ReadObjectCallback', { kind: 'class', ifaces: ['java.io.ObjectInputValidation'], sup: 'java.lang.Object', ctors: { 'java.io.ObjectInputStream': '_JComponent$ReadObjectCallback' } });
$J.module(() => {
  AWTEvent = $J.load('java.awt.AWTEvent');
  Component$BaselineResizeBehavior = $J.load('java.awt.Component$BaselineResizeBehavior');
  Dimension = $J.load('java.awt.Dimension');
  Insets = $J.load('java.awt.Insets');
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  Rectangle = $J.load('java.awt.Rectangle');
  RenderingHints = $J.load('java.awt.RenderingHints');
  Window = $J.load('java.awt.Window');
  InputEvent = $J.load('java.awt.event.InputEvent');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  PropertyChangeListener = $J.load('java.beans.PropertyChangeListener');
  VetoableChangeListener = $J.load('java.beans.VetoableChangeListener');
  Accessible = $J.load('javax.accessibility.Accessible');
  AccessibleContext = $J.load('javax.accessibility.AccessibleContext');
  AccessibleState = $J.load('javax.accessibility.AccessibleState');
  ActionMap = $J.load('javax.swing.ActionMap');
  AncestorNotifier = $J.load('javax.swing.AncestorNotifier');
  ArrayTable = $J.load('javax.swing.ArrayTable');
  Autoscroller = $J.load('javax.swing.Autoscroller');
  CellRendererPane = $J.load('javax.swing.CellRendererPane');
  ClientPropertyKey = $J.load('javax.swing.ClientPropertyKey');
  ComponentInputMap = $J.load('javax.swing.ComponentInputMap');
  DebugGraphics = $J.load('javax.swing.DebugGraphics');
  InputMap = $J.load('javax.swing.InputMap');
  JInternalFrame = $J.load('javax.swing.JInternalFrame');
  JLabel = $J.load('javax.swing.JLabel');
  JToolTip = $J.load('javax.swing.JToolTip');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  KeyboardManager = $J.load('javax.swing.KeyboardManager');
  LegacyGlueFocusTraversalPolicy = $J.load('javax.swing.LegacyGlueFocusTraversalPolicy');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  Popup$HeavyWeightWindow = $J.load('javax.swing.Popup$HeavyWeightWindow');
  RepaintManager = $J.load('javax.swing.RepaintManager');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  ToolTipManager = $J.load('javax.swing.ToolTipManager');
  UIClientPropertyKey = $J.load('javax.swing.UIClientPropertyKey');
  UIManager = $J.load('javax.swing.UIManager');
  AbstractBorder = $J.load('javax.swing.border.AbstractBorder');
  CompoundBorder = $J.load('javax.swing.border.CompoundBorder');
  TitledBorder = $J.load('javax.swing.border.TitledBorder');
  AncestorListener = $J.load('javax.swing.event.AncestorListener');
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  SwingAccessor = $J.load('sun.swing.SwingAccessor');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
