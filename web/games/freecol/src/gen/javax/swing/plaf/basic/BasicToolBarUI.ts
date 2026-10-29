// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicToolBarUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, HashMap, Hashtable, JObject } from '../../../../../jre/index.ts';
import { ToolBarUI } from '../ToolBarUI.ts';
import { UIAction } from '../../../../sun/swing/UIAction.ts';
import { WindowAdapter } from '../../../../java/awt/event/WindowAdapter.ts';
import { Window } from '../../../../java/awt/Window.ts';

let BorderLayout, Color, Container, Dialog, Dimension, Frame, IllegalComponentStateException, Insets, Point, AbstractButton, JComponent, JDialog, JRootPane, JToggleButton, JToolBar$Separator, LookAndFeel, SwingConstants, SwingUtilities, UIManager, CompoundBorder, UIResource, BasicBorders$ButtonBorder, BasicBorders$RadioButtonBorder, BasicBorders$RolloverButtonBorder, BasicBorders$RolloverMarginBorder, BasicGraphicsUtils, BasicLookAndFeel, LazyActionMap, DefaultLookup;

/**
 * A Basic L&amp;F implementation of ToolBarUI.  This implementation
 * is a "combined" view/controller.
 *
 * @author Georges Saab
 * @author Jeff Shapiro
 */
export class BasicToolBarUI extends ToolBarUI {
  /**
   * The instance of {@code JToolBar}.
   */
  toolBar: JToolBar = null;
  floating: boolean = false;
  floatingX: number = 0;
  floatingY: number = 0;
  floatingFrame: JFrame = null;
  floatingToolBar: RootPaneContainer = null;
  /**
   * The instance of {@code DragWindow}.
   */
  dragWindow: BasicToolBarUI$DragWindow = null;
  dockingSource: Container = null;
  dockingSensitivity: number = 0;
  /**
   * The index of the focused component.
   */
  focusedCompIndex: number = 0;
  /**
   * The background color of the docking border.
   */
  dockingColor: Color = null;
  /**
   * The background color of the not docking border.
   */
  floatingColor: Color = null;
  /**
   * The color of the docking border.
   */
  dockingBorderColor: Color = null;
  /**
   * The color of the not docking border.
   */
  floatingBorderColor: Color = null;
  /**
   * The instance of a {@code MouseInputListener}.
   */
  dockingListener: MouseInputListener = null;
  /**
   * The instance of a {@code PropertyChangeListener}.
   */
  propertyListener: PropertyChangeListener = null;
  /**
   * The instance of a {@code ContainerListener}.
   */
  toolBarContListener: ContainerListener = null;
  /**
   * The instance of a {@code FocusListener}.
   */
  toolBarFocusListener: FocusListener = null;
  handler: BasicToolBarUI$Handler = null;
  /**
   * The layout before floating.
   */
  constraintBeforeFloating: string = null;
  static IS_ROLLOVER: string = null;
  static rolloverBorder: Border = null;
  static nonRolloverBorder: Border = null;
  static nonRolloverToggleBorder: Border = null;
  rolloverBorders: boolean = false;
  borderTable: HashMap<AbstractButton, Border> = null;
  rolloverTable: Hashtable<AbstractButton, boolean> = null;
  /**
   * As of Java 2 platform v1.3 this previously undocumented field is no
   * longer used.
   * Key bindings are now defined by the LookAndFeel, please refer to
   * the key bindings specification for further details.
   *
   * @deprecated As of Java 2 platform v1.3.
   */
  upKey: KeyStroke = null;
  /**
   * As of Java 2 platform v1.3 this previously undocumented field is no
   * longer used.
   * Key bindings are now defined by the LookAndFeel, please refer to
   * the key bindings specification for further details.
   *
   * @deprecated As of Java 2 platform v1.3.
   */
  downKey: KeyStroke = null;
  /**
   * As of Java 2 platform v1.3 this previously undocumented field is no
   * longer used.
   * Key bindings are now defined by the LookAndFeel, please refer to
   * the key bindings specification for further details.
   *
   * @deprecated As of Java 2 platform v1.3.
   */
  leftKey: KeyStroke = null;
  /**
   * As of Java 2 platform v1.3 this previously undocumented field is no
   * longer used.
   * Key bindings are now defined by the LookAndFeel, please refer to
   * the key bindings specification for further details.
   *
   * @deprecated As of Java 2 platform v1.3.
   */
  rightKey: KeyStroke = null;
  static FOCUSED_COMP_INDEX: string = null;
  /**
   * Constructs a {@code BasicToolBarUI}.
   */
  _BasicToolBarUI(): this {
    this._ToolBarUI();
    this.dockingSensitivity = 0;
    this.focusedCompIndex = -1;
    this.dockingColor = null;
    this.floatingColor = null;
    this.dockingBorderColor = null;
    this.floatingBorderColor = null;
    this.constraintBeforeFloating = BorderLayout.NORTH;
    this.rolloverBorders = false;
    this.borderTable = new HashMap();
    this.rolloverTable = new Hashtable();
    return this;
  }
  /**
   * Constructs a new instance of {@code BasicToolBarUI}.
   *
   * @param c a component
   * @return a new instance of {@code BasicToolBarUI}
   */
  static createUI(c: JComponent): ComponentUI {
    return new BasicToolBarUI()._BasicToolBarUI();
  }
  installUI(c: JComponent): void {
    this.toolBar = c;
    this.installDefaults();
    this.installComponents();
    this.installListeners();
    this.installKeyboardActions();
    this.dockingSensitivity = 0;
    this.floating = false;
    this.floatingX = this.floatingY = 0;
    this.floatingToolBar = null;
    this.setOrientation(this.toolBar.getOrientation());
    LookAndFeel.installProperty(c, 'opaque', true);
    if (c.getClientProperty(BasicToolBarUI.FOCUSED_COMP_INDEX) != null) {
      this.focusedCompIndex = (+((c.getClientProperty(BasicToolBarUI.FOCUSED_COMP_INDEX))));
    }
  }
  uninstallUI(c: JComponent): void {
    this.uninstallDefaults();
    this.uninstallComponents();
    this.uninstallListeners();
    this.uninstallKeyboardActions();
    if (this.isFloating()) {
      this.setFloating(false, null);
    }
    this.floatingToolBar = null;
    this.dragWindow = null;
    this.dockingSource = null;
    c.putClientProperty(BasicToolBarUI.FOCUSED_COMP_INDEX, this.focusedCompIndex);
  }
  /**
   * Installs default properties.
   */
  installDefaults(): void {
    LookAndFeel.installBorder(this.toolBar, 'ToolBar.border');
    LookAndFeel.installColorsAndFont(this.toolBar, 'ToolBar.background', 'ToolBar.foreground', 'ToolBar.font');
    if (this.dockingColor == null || $J.isa(this.dockingColor, UIResource)) {
      this.dockingColor = UIManager.getColor$Object('ToolBar.dockingBackground');
    }
    if (this.floatingColor == null || $J.isa(this.floatingColor, UIResource)) {
      this.floatingColor = UIManager.getColor$Object('ToolBar.floatingBackground');
    }
    if (this.dockingBorderColor == null || $J.isa(this.dockingBorderColor, UIResource)) {
      this.dockingBorderColor = UIManager.getColor$Object('ToolBar.dockingForeground');
    }
    if (this.floatingBorderColor == null || $J.isa(this.floatingBorderColor, UIResource)) {
      this.floatingBorderColor = UIManager.getColor$Object('ToolBar.floatingForeground');
    }
    let rolloverProp = this.toolBar.getClientProperty(BasicToolBarUI.IS_ROLLOVER);
    if (rolloverProp == null) {
      rolloverProp = UIManager.get$Object('ToolBar.isRollover');
    }
    if (rolloverProp != null) {
      this.rolloverBorders = (rolloverProp);
    }
    if (BasicToolBarUI.rolloverBorder == null) {
      BasicToolBarUI.rolloverBorder = this.createRolloverBorder();
    }
    if (BasicToolBarUI.nonRolloverBorder == null) {
      BasicToolBarUI.nonRolloverBorder = this.createNonRolloverBorder();
    }
    if (BasicToolBarUI.nonRolloverToggleBorder == null) {
      BasicToolBarUI.nonRolloverToggleBorder = this.createNonRolloverToggleBorder$$BasicToolBarUI();
    }
    this.setRolloverBorders(this.isRolloverBorders());
  }
  /**
   * Uninstalls default properties.
   */
  uninstallDefaults(): void {
    LookAndFeel.uninstallBorder(this.toolBar);
    this.dockingColor = null;
    this.floatingColor = null;
    this.dockingBorderColor = null;
    this.floatingBorderColor = null;
    this.installNormalBorders(this.toolBar);
    BasicToolBarUI.rolloverBorder = null;
    BasicToolBarUI.nonRolloverBorder = null;
    BasicToolBarUI.nonRolloverToggleBorder = null;
  }
  /**
   * Registers components.
   */
  installComponents(): void {
  }
  /**
   * Unregisters components.
   */
  uninstallComponents(): void {
  }
  /**
   * Registers listeners.
   */
  installListeners(): void {
    this.dockingListener = this.createDockingListener();
    if (this.dockingListener != null) {
      this.toolBar.addMouseMotionListener(this.dockingListener);
      this.toolBar.addMouseListener(this.dockingListener);
    }
    this.propertyListener = this.createPropertyListener();
    if (this.propertyListener != null) {
      this.toolBar.addPropertyChangeListener$PropertyChangeListener(this.propertyListener);
    }
    this.toolBarContListener = this.createToolBarContListener();
    if (this.toolBarContListener != null) {
      this.toolBar.addContainerListener(this.toolBarContListener);
    }
    this.toolBarFocusListener = this.createToolBarFocusListener();
    if (this.toolBarFocusListener != null) {
      let components = this.toolBar.getComponents();
      for (let component of components) {
        component.addFocusListener(this.toolBarFocusListener);
      }
    }
  }
  /**
   * Unregisters listeners.
   */
  uninstallListeners(): void {
    if (this.dockingListener != null) {
      this.toolBar.removeMouseMotionListener(this.dockingListener);
      this.toolBar.removeMouseListener(this.dockingListener);
      this.dockingListener = null;
    }
    if (this.propertyListener != null) {
      this.toolBar.removePropertyChangeListener$PropertyChangeListener(this.propertyListener);
      this.propertyListener = null;
    }
    if (this.toolBarContListener != null) {
      this.toolBar.removeContainerListener(this.toolBarContListener);
      this.toolBarContListener = null;
    }
    if (this.toolBarFocusListener != null) {
      let components = this.toolBar.getComponents();
      for (let component of components) {
        component.removeFocusListener(this.toolBarFocusListener);
      }
      this.toolBarFocusListener = null;
    }
    this.handler = null;
  }
  /**
   * Registers keyboard actions.
   */
  installKeyboardActions(): void {
    let km = this.getInputMap(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT);
    SwingUtilities.replaceUIInputMap(this.toolBar, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, km);
    LazyActionMap.installLazyActionMap(this.toolBar, $J.cls(BasicToolBarUI), 'ToolBar.actionMap');
  }
  getInputMap(condition: number): InputMap {
    if (condition === JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT) {
      return DefaultLookup.get(this.toolBar, this, 'ToolBar.ancestorInputMap');
    }
    return null;
  }
  static loadActionMap(map: LazyActionMap): void {
    map.put$Action(new BasicToolBarUI$Actions()._BasicToolBarUI$Actions(BasicToolBarUI$Actions.NAVIGATE_RIGHT));
    map.put$Action(new BasicToolBarUI$Actions()._BasicToolBarUI$Actions(BasicToolBarUI$Actions.NAVIGATE_LEFT));
    map.put$Action(new BasicToolBarUI$Actions()._BasicToolBarUI$Actions(BasicToolBarUI$Actions.NAVIGATE_UP));
    map.put$Action(new BasicToolBarUI$Actions()._BasicToolBarUI$Actions(BasicToolBarUI$Actions.NAVIGATE_DOWN));
  }
  /**
   * Unregisters keyboard actions.
   */
  uninstallKeyboardActions(): void {
    SwingUtilities.replaceUIActionMap(this.toolBar, null);
    SwingUtilities.replaceUIInputMap(this.toolBar, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, null);
  }
  /**
   * Navigates the focused component.
   *
   * @param direction a direction
   */
  navigateFocusedComp(direction: number): void {
    let nComp = this.toolBar.getComponentCount();
    let j: number;
    switch (direction) {
      case SwingConstants.EAST:
      case SwingConstants.SOUTH:
        if (this.focusedCompIndex < 0 || this.focusedCompIndex >= nComp) {
          break;
        }
        j = (this.focusedCompIndex + 1) | 0;
        while (j !== this.focusedCompIndex) {
          if (j >= nComp) {
            j = 0;
          }
          let comp = this.toolBar.getComponentAtIndex(j++);
          if (comp != null && comp.isFocusTraversable() && comp.isEnabled()) {
            comp.requestFocus$();
            break;
          }
        }
        break;
      case SwingConstants.WEST:
      case SwingConstants.NORTH:
        if (this.focusedCompIndex < 0 || this.focusedCompIndex >= nComp) {
          break;
        }
        j = (this.focusedCompIndex - 1) | 0;
        while (j !== this.focusedCompIndex) {
          if (j < 0) {
            j = (nComp - 1) | 0;
          }
          let comp = this.toolBar.getComponentAtIndex(j--);
          if (comp != null && comp.isFocusTraversable() && comp.isEnabled()) {
            comp.requestFocus$();
            break;
          }
        }
        break;
      default:
        break;
    }
  }
  /**
   * Creates a rollover border for toolbar components. The
   * rollover border will be installed if rollover borders are
   * enabled.
   * <p>
   * Override this method to provide an alternate rollover border.
   *
   * @return a rollover border for toolbar components
   * @since 1.4
   */
  createRolloverBorder(): Border {
    let border = UIManager.get$Object('ToolBar.rolloverBorder');
    if (border != null) {
      return border;
    }
    let table = UIManager.getLookAndFeelDefaults();
    return new CompoundBorder()._CompoundBorder$Border$Border(new BasicBorders$RolloverButtonBorder()._BasicBorders$RolloverButtonBorder(table.getColor$Object('controlShadow'), table.getColor$Object('controlDkShadow'), table.getColor$Object('controlHighlight'), table.getColor$Object('controlLtHighlight')), new BasicBorders$RolloverMarginBorder()._BasicBorders$RolloverMarginBorder());
  }
  /**
   * Creates the non rollover border for toolbar components. This
   * border will be installed as the border for components added
   * to the toolbar if rollover borders are not enabled.
   * <p>
   * Override this method to provide an alternate rollover border.
   *
   * @return the non rollover border for toolbar components
   * @since 1.4
   */
  createNonRolloverBorder(): Border {
    let border = UIManager.get$Object('ToolBar.nonrolloverBorder');
    if (border != null) {
      return border;
    }
    let table = UIManager.getLookAndFeelDefaults();
    return new CompoundBorder()._CompoundBorder$Border$Border(new BasicBorders$ButtonBorder()._BasicBorders$ButtonBorder(table.getColor$Object('Button.shadow'), table.getColor$Object('Button.darkShadow'), table.getColor$Object('Button.light'), table.getColor$Object('Button.highlight')), new BasicBorders$RolloverMarginBorder()._BasicBorders$RolloverMarginBorder());
  }
  /**
   * Creates a non rollover border for Toggle buttons in the toolbar.
   */
  createNonRolloverToggleBorder$$BasicToolBarUI(): Border {
    let table = UIManager.getLookAndFeelDefaults();
    return new CompoundBorder()._CompoundBorder$Border$Border(new BasicBorders$RadioButtonBorder()._BasicBorders$RadioButtonBorder(table.getColor$Object('ToggleButton.shadow'), table.getColor$Object('ToggleButton.darkShadow'), table.getColor$Object('ToggleButton.light'), table.getColor$Object('ToggleButton.highlight')), new BasicBorders$RolloverMarginBorder()._BasicBorders$RolloverMarginBorder());
  }
  /**
   * Creates a window which contains the toolbar after it has been
   * dragged out from its container
   *
   * @param toolbar an instance of {@code JToolBar}
   * @return a {@code RootPaneContainer} object, containing the toolbar
   * @since 1.4
   */
  createFloatingWindow(toolbar: JToolBar): RootPaneContainer {
    // class ToolBarDialog: BasicToolBarUI$1ToolBarDialog(), below
    let dialog: JDialog;
    let window = SwingUtilities.getWindowAncestor(toolbar);
    if (window instanceof Frame) {
      dialog = new (BasicToolBarUI$1ToolBarDialog())().$o(this)._ToolBarDialog$Frame$String$boolean(window, toolbar.getName$(), false);
    } else if (window instanceof Dialog) {
      dialog = new (BasicToolBarUI$1ToolBarDialog())().$o(this)._ToolBarDialog$Dialog$String$boolean(window, toolbar.getName$(), false);
    } else {
      dialog = new (BasicToolBarUI$1ToolBarDialog())().$o(this)._ToolBarDialog$Frame$String$boolean(null, toolbar.getName$(), false);
    }
    dialog.getRootPane().setName('ToolBar.FloatingWindow');
    dialog.setTitle(toolbar.getName$());
    dialog.setResizable(false);
    let wl = this.createFrameListener();
    dialog.addWindowListener(wl);
    return dialog;
  }
  /**
   * Returns an instance of {@code DragWindow}.
   *
   * @param toolbar an instance of {@code JToolBar}
   * @return an instance of {@code DragWindow}
   */
  createDragWindow(toolbar: JToolBar): BasicToolBarUI$DragWindow {
    let frame = null;
    var window;
    if (this.toolBar != null) {
      let p: Container;
      for (p = this.toolBar.getParent(); p != null && !(p instanceof Window); p = p.getParent()) {
      }
      var window;
      if ((window = p) instanceof Window) {
        frame = window;
      }
    }
    if (this.floatingToolBar == null) {
      this.floatingToolBar = this.createFloatingWindow(this.toolBar);
    }
    if (this.floatingToolBar instanceof Window) {
      frame = this.floatingToolBar;
    }
    let dragWindow = new BasicToolBarUI$DragWindow().$o(this)._BasicToolBarUI$DragWindow(frame);
    return dragWindow;
  }
  /**
   * Returns a flag to determine whether rollover button borders
   * are enabled.
   *
   * @return true if rollover borders are enabled; false otherwise
   * @see #setRolloverBorders
   * @since 1.4
   */
  isRolloverBorders(): boolean {
    return this.rolloverBorders;
  }
  /**
   * Sets the flag for enabling rollover borders on the toolbar and it will
   * also install the appropriate border depending on the state of the flag.
   *
   * @param rollover if true, rollover borders are installed.
   *        Otherwise non-rollover borders are installed
   * @see #isRolloverBorders
   * @since 1.4
   */
  setRolloverBorders(rollover: boolean): void {
    this.rolloverBorders = rollover;
    if (this.rolloverBorders) {
      this.installRolloverBorders(this.toolBar);
    } else {
      this.installNonRolloverBorders(this.toolBar);
    }
  }
  /**
   * Installs rollover borders on all the child components of the JComponent.
   * <p>
   * This is a convenience method to call <code>setBorderToRollover</code>
   * for each child component.
   *
   * @param c container which holds the child components (usually a JToolBar)
   * @see #setBorderToRollover
   * @since 1.4
   */
  installRolloverBorders(c: JComponent): void {
    let components = c.getComponents();
    for (let component of components) {
      if (component instanceof JComponent) {
        (component).updateUI();
        this.setBorderToRollover(component);
      }
    }
  }
  /**
   * Installs non-rollover borders on all the child components of the JComponent.
   * A non-rollover border is the border that is installed on the child component
   * while it is in the toolbar.
   * <p>
   * This is a convenience method to call <code>setBorderToNonRollover</code>
   * for each child component.
   *
   * @param c container which holds the child components (usually a JToolBar)
   * @see #setBorderToNonRollover
   * @since 1.4
   */
  installNonRolloverBorders(c: JComponent): void {
    let components = c.getComponents();
    for (let component of components) {
      if (component instanceof JComponent) {
        (component).updateUI();
        this.setBorderToNonRollover(component);
      }
    }
  }
  /**
   * Installs normal borders on all the child components of the JComponent.
   * A normal border is the original border that was installed on the child
   * component before it was added to the toolbar.
   * <p>
   * This is a convenience method to call <code>setBorderNormal</code>
   * for each child component.
   *
   * @param c container which holds the child components (usually a JToolBar)
   * @see #setBorderToNonRollover
   * @since 1.4
   */
  installNormalBorders(c: JComponent): void {
    let components = c.getComponents();
    for (let component of components) {
      this.setBorderToNormal(component);
    }
  }
  /**
   * Sets the border of the component to have a rollover border which
   * was created by the {@link #createRolloverBorder} method.
   *
   * @param c component which will have a rollover border installed
   * @see #createRolloverBorder
   * @since 1.4
   */
  setBorderToRollover(c: Component): void {
    if (c instanceof AbstractButton) {
      let b = c;
      let border = this.borderTable.get(b);
      if (border == null || $J.isa(border, UIResource)) {
        this.borderTable.put(b, b.getBorder());
      }
      if ($J.isa(b.getBorder(), UIResource)) {
        b.setBorder(this.getRolloverBorder(b));
      }
      this.rolloverTable.put(b, b.isRolloverEnabled() ? true : false);
      b.setRolloverEnabled(true);
    }
  }
  /**
   * Returns a rollover border for the button.
   *
   * @param b the button to calculate the rollover border for
   * @return the rollover border
   * @see #setBorderToRollover
   * @since 1.6
   */
  getRolloverBorder(b: AbstractButton): Border {
    return BasicToolBarUI.rolloverBorder;
  }
  /**
   * Sets the border of the component to have a non-rollover border which
   * was created by the {@link #createNonRolloverBorder} method.
   *
   * @param c component which will have a non-rollover border installed
   * @see #createNonRolloverBorder
   * @since 1.4
   */
  setBorderToNonRollover(c: Component): void {
    if (c instanceof AbstractButton) {
      let b = c;
      let border = this.borderTable.get(b);
      if (border == null || $J.isa(border, UIResource)) {
        this.borderTable.put(b, b.getBorder());
      }
      if ($J.isa(b.getBorder(), UIResource)) {
        b.setBorder(this.getNonRolloverBorder(b));
      }
      this.rolloverTable.put(b, b.isRolloverEnabled() ? true : false);
      b.setRolloverEnabled(false);
    }
  }
  /**
   * Returns a non-rollover border for the button.
   *
   * @param b the button to calculate the non-rollover border for
   * @return the non-rollover border
   * @see #setBorderToNonRollover
   * @since 1.6
   */
  getNonRolloverBorder(b: AbstractButton): Border {
    if (b instanceof JToggleButton) {
      return BasicToolBarUI.nonRolloverToggleBorder;
    } else {
      return BasicToolBarUI.nonRolloverBorder;
    }
  }
  /**
   * Sets the border of the component to have a normal border.
   * A normal border is the original border that was installed on the child
   * component before it was added to the toolbar.
   *
   * @param c component which will have a normal border re-installed
   * @see #createNonRolloverBorder
   * @since 1.4
   */
  setBorderToNormal(c: Component): void {
    if (c instanceof AbstractButton) {
      let b = c;
      let border = this.borderTable.remove(b);
      b.setBorder(border);
      let value = this.rolloverTable.remove(b);
      if (value != null) {
        b.setRolloverEnabled(value);
      }
    }
  }
  /**
   * Sets the floating location.
   *
   * @param x an X coordinate
   * @param y an Y coordinate
   */
  setFloatingLocation(x: number, y: number): void {
    this.floatingX = x;
    this.floatingY = y;
  }
  /**
   * Returns {@code true} if the {@code JToolBar} is floating
   *
   * @return {@code true} if the {@code JToolBar} is floating
   */
  isFloating(): boolean {
    return this.floating;
  }
  /**
   * Sets the floating property.
   *
   * @param b {@code true} if the {@code JToolBar} is floating
   * @param p the position
   */
  setFloating(b: boolean, p: Point): void {
    if (this.toolBar.isFloatable()) {
      let visible = false;
      let ancestor = SwingUtilities.getWindowAncestor(this.toolBar);
      if (ancestor != null) {
        visible = ancestor.isVisible$();
      }
      if (this.dragWindow != null) {
        this.dragWindow.setVisible(false);
      }
      this.floating = b;
      if (this.floatingToolBar == null) {
        this.floatingToolBar = this.createFloatingWindow(this.toolBar);
      }
      if (b === true) {
        if (this.dockingSource == null) {
          this.dockingSource = this.toolBar.getParent();
          this.dockingSource.remove$Component(this.toolBar);
        }
        this.constraintBeforeFloating = this.calculateConstraint();
        if (this.propertyListener != null) {
          UIManager.addPropertyChangeListener(this.propertyListener);
        }
        this.floatingToolBar.getContentPane().add$Component$Object(this.toolBar, BorderLayout.CENTER);
        if (this.floatingToolBar instanceof Window) {
          (this.floatingToolBar).pack();
          (this.floatingToolBar).setLocation$int$int(this.floatingX, this.floatingY);
          if (visible) {
            (this.floatingToolBar).show$();
          } else {
            ancestor.addWindowListener(new (BasicToolBarUI$2())().$o(this)._WindowAdapter());
          }
        }
      } else {
        if (this.floatingToolBar == null) {
          this.floatingToolBar = this.createFloatingWindow(this.toolBar);
        }
        if (this.floatingToolBar instanceof Window) {
          (this.floatingToolBar).setVisible(false);
        }
        this.floatingToolBar.getContentPane().remove$Component(this.toolBar);
        let constraint = this.getDockingConstraint(this.dockingSource, p);
        if (constraint == null) {
          constraint = BorderLayout.NORTH;
        }
        let orientation = this.mapConstraintToOrientation(constraint);
        this.setOrientation(orientation);
        if (this.dockingSource == null) {
          this.dockingSource = this.toolBar.getParent();
        }
        if (this.propertyListener != null) {
          UIManager.removePropertyChangeListener(this.propertyListener);
        }
        this.dockingSource.add$String$Component(constraint, this.toolBar);
      }
      this.dockingSource.invalidate();
      let dockingSourceParent = this.dockingSource.getParent();
      if (dockingSourceParent != null) {
        dockingSourceParent.validate();
      }
      this.dockingSource.repaint$();
    }
  }
  mapConstraintToOrientation(constraint: string): number {
    let orientation = this.toolBar.getOrientation();
    if (constraint != null) {
      if ($J.equals(constraint, BorderLayout.EAST) || $J.equals(constraint, BorderLayout.WEST)) {
        orientation = SwingConstants.VERTICAL;
      } else if ($J.equals(constraint, BorderLayout.NORTH) || $J.equals(constraint, BorderLayout.SOUTH)) {
        orientation = SwingConstants.HORIZONTAL;
      }
    }
    return orientation;
  }
  /**
   * Sets the tool bar's orientation.
   *
   * @param orientation the new orientation
   */
  setOrientation(orientation: number): void {
    this.toolBar.setOrientation(orientation);
    if (this.dragWindow != null) {
      this.dragWindow.setOrientation(orientation);
    }
  }
  /**
   * Gets the color displayed when over a docking area
   *
   * @return the color displayed when over a docking area
   */
  getDockingColor(): Color {
    return this.dockingColor;
  }
  /**
   * Gets the color displayed when over a floating area
   *
   * @return the color displayed when over a floating area
   */
  getFloatingColor(): Color {
    return this.floatingColor;
  }
  isBlocked(comp: Component, constraint: any): boolean {
    if (comp instanceof Container) {
      let cont = comp;
      let lm = cont.getLayout();
      if (lm instanceof BorderLayout) {
        let blm = lm;
        let c = blm.getLayoutComponent$Container$Object(cont, constraint);
        return (c != null && c !== this.toolBar);
      }
    }
    return false;
  }
  /**
   * Returns {@code true} if the {@code JToolBar} can dock at the given position.
   *
   * @param c a component
   * @param p a position
   * @return {@code true} if the {@code JToolBar} can dock at the given position
   */
  canDock(c: Component, p: Point): boolean {
    return (p != null && this.getDockingConstraint(c, p) != null);
  }
  calculateConstraint(): string {
    let constraint = null;
    let lm = this.dockingSource.getLayout();
    if (lm instanceof BorderLayout) {
      constraint = (lm).getConstraints(this.toolBar);
    }
    return (constraint != null) ? constraint : this.constraintBeforeFloating;
  }
  getDockingConstraint(c: Component, p: Point): string {
    if (p == null) {
      return this.constraintBeforeFloating;
    }
    if (c.contains$Point(p)) {
      this.dockingSensitivity = (this.toolBar.getOrientation() === SwingConstants.HORIZONTAL) ? this.toolBar.getSize$().height_ : this.toolBar.getSize$().width_;
      if (p.y_ < this.dockingSensitivity && !this.isBlocked(c, BorderLayout.NORTH)) {
        return BorderLayout.NORTH;
      }
      if (p.x_ >= ((c.getWidth() - this.dockingSensitivity) | 0) && !this.isBlocked(c, BorderLayout.EAST)) {
        return BorderLayout.EAST;
      }
      if (p.x_ < this.dockingSensitivity && !this.isBlocked(c, BorderLayout.WEST)) {
        return BorderLayout.WEST;
      }
      if (p.y_ >= ((c.getHeight() - this.dockingSensitivity) | 0) && !this.isBlocked(c, BorderLayout.SOUTH)) {
        return BorderLayout.SOUTH;
      }
    }
    return null;
  }
  /**
   * The method is used to drag {@code DragWindow} during the {@code JToolBar}
   * is being dragged.
   *
   * @param position the relative to the {@code JTollBar} position
   * @param origin the screen position of {@code JToolBar} before dragging
   */
  dragTo(position: Point, origin: Point): void {
    if (this.toolBar.isFloatable()) {
      try {
        if (this.dragWindow == null) {
          this.dragWindow = this.createDragWindow(this.toolBar);
        }
        let offset = this.dragWindow.getOffset();
        if (offset == null) {
          let size = this.toolBar.getPreferredSize$();
          offset = new Point()._Point$int$int($J.idiv(size.width_, 2), $J.idiv(size.height_, 2));
          this.dragWindow.setOffset(offset);
        }
        let global = new Point()._Point$int$int((origin.x_ + position.x_) | 0, (origin.y_ + position.y_) | 0);
        let dragPoint = new Point()._Point$int$int((global.x_ - offset.x_) | 0, (global.y_ - offset.y_) | 0);
        if (this.dockingSource == null) {
          this.dockingSource = this.toolBar.getParent();
        }
        this.constraintBeforeFloating = this.calculateConstraint();
        let dockingPosition = this.dockingSource.getLocationOnScreen();
        let comparisonPoint = new Point()._Point$int$int((global.x_ - dockingPosition.x_) | 0, (global.y_ - dockingPosition.y_) | 0);
        if (this.canDock(this.dockingSource, comparisonPoint)) {
          this.dragWindow.setBackground(this.getDockingColor());
          let constraint = this.getDockingConstraint(this.dockingSource, comparisonPoint);
          let orientation = this.mapConstraintToOrientation(constraint);
          this.dragWindow.setOrientation(orientation);
          this.dragWindow.setBorderColor(this.dockingBorderColor);
        } else {
          this.dragWindow.setBackground(this.getFloatingColor());
          this.dragWindow.setBorderColor(this.floatingBorderColor);
          this.dragWindow.setOrientation(this.toolBar.getOrientation());
        }
        this.dragWindow.setLocation$int$int(dragPoint.x_, dragPoint.y_);
        if (this.dragWindow.isVisible$() === false) {
          let size = this.toolBar.getPreferredSize$();
          this.dragWindow.setSize$int$int(size.width_, size.height_);
          this.dragWindow.show$();
        }
      } catch ($e0) {
        if ($J.isa($e0, IllegalComponentStateException)) {
          let e = $J.exc($e0);
        } else {
          throw $e0;
        }
      }
    }
  }
  /**
   * The method is called at end of dragging to place the frame in either
   * its original place or in its floating frame.
   *
   * @param position the relative to the {@code JTollBar} position
   * @param origin the screen position of {@code JToolBar} before dragging
   */
  floatAt(position: Point, origin: Point): void {
    if (this.toolBar.isFloatable()) {
      try {
        let offset = this.dragWindow.getOffset();
        if (offset == null) {
          offset = position;
          this.dragWindow.setOffset(offset);
        }
        let global = new Point()._Point$int$int((origin.x_ + position.x_) | 0, (origin.y_ + position.y_) | 0);
        this.setFloatingLocation((global.x_ - offset.x_) | 0, (global.y_ - offset.y_) | 0);
        if (this.dockingSource != null) {
          let dockingPosition = this.dockingSource.getLocationOnScreen();
          let comparisonPoint = new Point()._Point$int$int((global.x_ - dockingPosition.x_) | 0, (global.y_ - dockingPosition.y_) | 0);
          if (this.canDock(this.dockingSource, comparisonPoint)) {
            this.setFloating(false, comparisonPoint);
          } else {
            this.setFloating(true, null);
          }
        } else {
          this.setFloating(true, null);
        }
        this.dragWindow.setOffset(null);
      } catch ($e1) {
        if ($J.isa($e1, IllegalComponentStateException)) {
          let e = $J.exc($e1);
        } else {
          throw $e1;
        }
      }
    }
  }
  getHandler(): BasicToolBarUI$Handler {
    if (this.handler == null) {
      this.handler = new BasicToolBarUI$Handler().$o(this)._BasicToolBarUI$Handler();
    }
    return this.handler;
  }
  /**
   * Returns an instance of {@code ContainerListener}.
   *
   * @return an instance of {@code ContainerListener}
   */
  createToolBarContListener(): ContainerListener {
    return this.getHandler();
  }
  /**
   * Returns an instance of {@code FocusListener}.
   *
   * @return an instance of {@code FocusListener}
   */
  createToolBarFocusListener(): FocusListener {
    return this.getHandler();
  }
  /**
   * Returns an instance of {@code PropertyChangeListener}.
   *
   * @return an instance of {@code PropertyChangeListener}
   */
  createPropertyListener(): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
  /**
   * Returns an instance of {@code MouseInputListener}.
   *
   * @return an instance of {@code MouseInputListener}
   */
  createDockingListener(): MouseInputListener {
    this.getHandler().tb = this.toolBar;
    return this.getHandler();
  }
  /**
   * Constructs a new instance of {@code WindowListener}.
   *
   * @return a new instance of {@code WindowListener}
   */
  createFrameListener(): WindowListener {
    return new BasicToolBarUI$FrameListener().$o(this)._BasicToolBarUI$FrameListener();
  }
  /**
   * Paints the contents of the window used for dragging.
   *
   * @param g Graphics to paint to.
   * @throws NullPointerException is <code>g</code> is null
   * @since 1.5
   */
  paintDragWindow(g: Graphics): void {
    g.setColor(this.dragWindow.getBackground());
    let w = this.dragWindow.getWidth();
    let h = this.dragWindow.getHeight();
    g.fillRect(0, 0, w, h);
    g.setColor(this.dragWindow.getBorderColor());
    g.drawRect(0, 0, (w - 1) | 0, (h - 1) | 0);
  }
  static $clinit() {
    BasicToolBarUI.IS_ROLLOVER = 'JToolBar.isRollover';
    BasicToolBarUI.FOCUSED_COMP_INDEX = 'JToolBar.focusedCompIndex';
  }
}

export class BasicToolBarUI$Actions extends UIAction {
  static readonly NAVIGATE_RIGHT: string = 'navigateRight';
  static readonly NAVIGATE_LEFT: string = 'navigateLeft';
  static readonly NAVIGATE_UP: string = 'navigateUp';
  static readonly NAVIGATE_DOWN: string = 'navigateDown';
  _BasicToolBarUI$Actions(name: string): this {
    this._UIAction(name);
    return this;
  }
  actionPerformed(evt: ActionEvent): void {
    let key = this.getName();
    let toolBar = evt.getSource();
    let ui = BasicLookAndFeel.getUIOfType(toolBar.getUI(), $J.cls(BasicToolBarUI));
    if (BasicToolBarUI$Actions.NAVIGATE_RIGHT === key) {
      ui.navigateFocusedComp(SwingConstants.EAST);
    } else if (BasicToolBarUI$Actions.NAVIGATE_LEFT === key) {
      ui.navigateFocusedComp(SwingConstants.WEST);
    } else if (BasicToolBarUI$Actions.NAVIGATE_UP === key) {
      ui.navigateFocusedComp(SwingConstants.NORTH);
    } else if (BasicToolBarUI$Actions.NAVIGATE_DOWN === key) {
      ui.navigateFocusedComp(SwingConstants.SOUTH);
    }
  }
}

export class BasicToolBarUI$Handler extends JObject {
  tb: JToolBar = null;
  isDragging_: boolean = false;
  origin: Point = null;
  _BasicToolBarUI$Handler(): this {
    this.isDragging_ = false;
    this.origin = null;
    return this;
  }
  componentAdded(evt: ContainerEvent): void {
    let c = evt.getChild();
    if (this.$outer.toolBarFocusListener != null) {
      c.addFocusListener(this.$outer.toolBarFocusListener);
    }
    if (this.$outer.isRolloverBorders()) {
      this.$outer.setBorderToRollover(c);
    } else {
      this.$outer.setBorderToNonRollover(c);
    }
  }
  componentRemoved(evt: ContainerEvent): void {
    let c = evt.getChild();
    if (this.$outer.toolBarFocusListener != null) {
      c.removeFocusListener(this.$outer.toolBarFocusListener);
    }
    this.$outer.setBorderToNormal(c);
  }
  focusGained(evt: FocusEvent): void {
    let c = evt.getComponent();
    this.$outer.focusedCompIndex = this.$outer.toolBar.getComponentIndex(c);
  }
  focusLost(evt: FocusEvent): void {
  }
  mousePressed(evt: MouseEvent): void {
    if (!this.tb.isEnabled()) {
      return;
    }
    this.isDragging_ = false;
  }
  mouseReleased(evt: MouseEvent): void {
    if (!this.tb.isEnabled()) {
      return;
    }
    if (this.isDragging_) {
      let position = evt.getPoint();
      if (this.origin == null) {
        this.origin = evt.getComponent().getLocationOnScreen();
      }
      this.$outer.floatAt(position, this.origin);
    }
    this.origin = null;
    this.isDragging_ = false;
  }
  mouseDragged(evt: MouseEvent): void {
    if (!this.tb.isEnabled()) {
      return;
    }
    this.isDragging_ = true;
    let position = evt.getPoint();
    if (this.origin == null) {
      this.origin = evt.getComponent().getLocationOnScreen();
    }
    this.$outer.dragTo(position, this.origin);
  }
  mouseClicked(evt: MouseEvent): void {
  }
  mouseEntered(evt: MouseEvent): void {
  }
  mouseExited(evt: MouseEvent): void {
  }
  mouseMoved(evt: MouseEvent): void {
  }
  propertyChange(evt: PropertyChangeEvent): void {
    let propertyName = evt.getPropertyName();
    if (propertyName === 'lookAndFeel') {
      this.$outer.toolBar.updateUI();
    } else if (propertyName === 'orientation') {
      let components = this.$outer.toolBar.getComponents();
      let orientation = (+(evt.getNewValue()));
      let separator: JToolBar$Separator;
      for (let i = 0; i < components.length; ++i) {
        if (components[i] instanceof JToolBar$Separator) {
          separator = components[i];
          if (orientation === SwingConstants.HORIZONTAL) {
            separator.setOrientation(SwingConstants.VERTICAL);
          } else {
            separator.setOrientation(SwingConstants.HORIZONTAL);
          }
          let size = separator.getSeparatorSize();
          if (size != null && size.width_ !== size.height_) {
            let newSize = new Dimension()._Dimension$int$int(size.height_, size.width_);
            separator.setSeparatorSize(newSize);
          }
        }
      }
    } else if (propertyName === BasicToolBarUI.IS_ROLLOVER) {
      this.$outer.installNormalBorders(this.$outer.toolBar);
      this.$outer.setRolloverBorders((evt.getNewValue()));
    }
  }
}

/**
 * The class listens for window events.
 */
export class BasicToolBarUI$FrameListener extends WindowAdapter {
  /**
   * Constructs a {@code FrameListener}.
   */
  _BasicToolBarUI$FrameListener(): this {
    this._WindowAdapter();
    return this;
  }
  windowClosing(w: WindowEvent): void {
    if (this.$outer.toolBar.isFloatable()) {
      if (this.$outer.dragWindow != null) {
        this.$outer.dragWindow.setVisible(false);
      }
      this.$outer.floating = false;
      if (this.$outer.floatingToolBar == null) {
        this.$outer.floatingToolBar = this.$outer.createFloatingWindow(this.$outer.toolBar);
      }
      if (this.$outer.floatingToolBar instanceof Window) {
        (this.$outer.floatingToolBar).setVisible(false);
      }
      this.$outer.floatingToolBar.getContentPane().remove$Component(this.$outer.toolBar);
      let constraint = this.$outer.constraintBeforeFloating;
      if (this.$outer.toolBar.getOrientation() === SwingConstants.HORIZONTAL) {
        if (constraint === 'West' || constraint === 'East') {
          constraint = 'North';
        }
      } else {
        if (constraint === 'North' || constraint === 'South') {
          constraint = 'West';
        }
      }
      if (this.$outer.dockingSource == null) {
        this.$outer.dockingSource = this.$outer.toolBar.getParent();
      }
      if (this.$outer.propertyListener != null) {
        UIManager.removePropertyChangeListener(this.$outer.propertyListener);
      }
      this.$outer.dockingSource.add$Component$Object(this.$outer.toolBar, constraint);
      this.$outer.dockingSource.invalidate();
      let dockingSourceParent = this.$outer.dockingSource.getParent();
      if (dockingSourceParent != null) {
        dockingSourceParent.validate();
      }
      this.$outer.dockingSource.repaint$();
    }
  }
}

/**
 * This class should be treated as a &quot;protected&quot; inner class.
 * Instantiate it only within subclasses of BasicToolBarUI.
 */
export class BasicToolBarUI$DockingListener extends JObject {
  /**
   * The instance of {@code JToolBar}.
   */
  toolBar: JToolBar = null;
  /**
   * {@code true} if the {@code JToolBar} is being dragged.
   */
  isDragging_: boolean = false;
  /**
   * The origin point.
   */
  origin: Point = null;
  /**
   * Constructs a new instance of {@code DockingListener}.
   *
   * @param t an instance of {@code JToolBar}
   */
  _BasicToolBarUI$DockingListener(t: JToolBar): this {
    this.isDragging_ = false;
    this.origin = null;
    this.toolBar = t;
    this.$outer.getHandler().tb = t;
    return this;
  }
  mouseClicked(e: MouseEvent): void {
    this.$outer.getHandler().mouseClicked(e);
  }
  mousePressed(e: MouseEvent): void {
    this.$outer.getHandler().tb = this.toolBar;
    this.$outer.getHandler().mousePressed(e);
    this.isDragging_ = this.$outer.getHandler().isDragging_;
  }
  mouseReleased(e: MouseEvent): void {
    this.$outer.getHandler().tb = this.toolBar;
    this.$outer.getHandler().isDragging_ = this.isDragging_;
    this.$outer.getHandler().origin = this.origin;
    this.$outer.getHandler().mouseReleased(e);
    this.isDragging_ = this.$outer.getHandler().isDragging_;
    this.origin = this.$outer.getHandler().origin;
  }
  mouseEntered(e: MouseEvent): void {
    this.$outer.getHandler().mouseEntered(e);
  }
  mouseExited(e: MouseEvent): void {
    this.$outer.getHandler().mouseExited(e);
  }
  mouseDragged(e: MouseEvent): void {
    this.$outer.getHandler().tb = this.toolBar;
    this.$outer.getHandler().origin = this.origin;
    this.$outer.getHandler().mouseDragged(e);
    this.isDragging_ = this.$outer.getHandler().isDragging_;
    this.origin = this.$outer.getHandler().origin;
  }
  mouseMoved(e: MouseEvent): void {
    this.$outer.getHandler().mouseMoved(e);
  }
}

/**
 * The window which appears during dragging the {@code JToolBar}.
 */
export class BasicToolBarUI$DragWindow extends Window {
  borderColor: Color = null;
  orientation: number = 0;
  offset: Point = null;
  _BasicToolBarUI$DragWindow(w: Window): this {
    this._Window$Window(w);
    this.borderColor = Color.gray;
    this.orientation = this.$outer.toolBar.getOrientation();
    return this;
  }
  /**
   * Sets the orientation.
   *
   * @param o the new orientation
   */
  setOrientation(o: number): void {
    if (this.isShowing()) {
      if (o === this.orientation) {
        return;
      }
      this.orientation = o;
      let size = this.getSize$();
      this.setSize$Dimension(new Dimension()._Dimension$int$int(size.height_, size.width_));
      if (this.offset != null) {
        if (BasicGraphicsUtils.isLeftToRight(this.$outer.toolBar)) {
          this.setOffset(new Point()._Point$int$int(this.offset.y_, this.offset.x_));
        } else if (o === SwingConstants.HORIZONTAL) {
          this.setOffset(new Point()._Point$int$int((size.height_ - this.offset.y_) | 0, this.offset.x_));
        } else {
          this.setOffset(new Point()._Point$int$int(this.offset.y_, (size.width_ - this.offset.x_) | 0));
        }
      }
      this.repaint$();
    }
  }
  /**
   * Returns the offset.
   *
   * @return the offset
   */
  getOffset(): Point {
    return this.offset;
  }
  /**
   * Sets the offset.
   *
   * @param p the new offset
   */
  setOffset(p: Point): void {
    this.offset = p;
  }
  /**
   * Sets the border color.
   *
   * @param c the new border color
   */
  setBorderColor(c: Color): void {
    if (this.borderColor === c) {
      return;
    }
    this.borderColor = c;
    this.repaint$();
  }
  /**
   * Returns the border color.
   *
   * @return the border color
   */
  getBorderColor(): Color {
    return this.borderColor;
  }
  paint(g: Graphics): void {
    this.$outer.paintDragWindow(g);
    super.paint(g);
  }
  getInsets$(): Insets {
    return new Insets()._Insets(1, 1, 1, 1);
  }
}

let $BasicToolBarUI$1ToolBarDialog$1: any = null;
/** An anonymous class (BasicToolBarUI.java:610). */
function BasicToolBarUI$1ToolBarDialog$1(): any {
  return $BasicToolBarUI$1ToolBarDialog$1 ??= $J.local(class extends JRootPane {
    packing: boolean = false;
    $init_anon() {
      this.packing = false;
      return this;
    }
    validate(): void {
      super.validate();
      if (!this.packing) {
        this.packing = true;
        this.$outer.pack();
        this.packing = false;
      }
    }
  }, 'javax.swing.plaf.basic.BasicToolBarUI$1ToolBarDialog$1', []);
}

let $BasicToolBarUI$1ToolBarDialog: any = null;
/** The local class ToolBarDialog (BasicToolBarUI.java:597). */
function BasicToolBarUI$1ToolBarDialog(): any {
  return $BasicToolBarUI$1ToolBarDialog ??= $J.local(class extends JDialog {
    _ToolBarDialog$Frame$String$boolean(owner: Frame, title: string, modal: boolean): this {
      this._JDialog$Frame$String$boolean(owner, title, modal);
      return this;
    }
    _ToolBarDialog$Dialog$String$boolean(owner: Dialog, title: string, modal: boolean): this {
      this._JDialog$Dialog$String$boolean(owner, title, modal);
      return this;
    }
    createRootPane(): JRootPane {
      let rootPane = new (BasicToolBarUI$1ToolBarDialog$1())().$o(this)._JRootPane().$init_anon();
      rootPane.setOpaque(true);
      return rootPane;
    }
  }, 'javax.swing.plaf.basic.BasicToolBarUI$1ToolBarDialog', []);
}

let $BasicToolBarUI$2: any = null;
/** An anonymous class (BasicToolBarUI.java:929). */
function BasicToolBarUI$2(): any {
  return $BasicToolBarUI$2 ??= $J.local(class extends WindowAdapter {
    windowOpened(e: WindowEvent): void {
      (this.$outer.floatingToolBar).show$();
    }
  }, 'javax.swing.plaf.basic.BasicToolBarUI$2', []);
}

$J.define(BasicToolBarUI, 'javax.swing.plaf.basic.BasicToolBarUI', { kind: 'class', ifaces: ['javax.swing.SwingConstants'], sup: 'javax.swing.plaf.ToolBarUI', ctors: { '': '_BasicToolBarUI' }, meths: { 'createNonRolloverToggleBorder()': 'createNonRolloverToggleBorder$$BasicToolBarUI' }, clinit: true, lazy: ['IS_ROLLOVER', 'rolloverBorder', 'nonRolloverBorder', 'nonRolloverToggleBorder', 'FOCUSED_COMP_INDEX'] });
$J.define(BasicToolBarUI$Actions, 'javax.swing.plaf.basic.BasicToolBarUI$Actions', { kind: 'class', sup: 'sun.swing.UIAction', ctors: { 'java.lang.String': '_BasicToolBarUI$Actions' } });
$J.define(BasicToolBarUI$Handler, 'javax.swing.plaf.basic.BasicToolBarUI$Handler', { kind: 'class', ifaces: ['java.awt.event.ContainerListener', 'java.awt.event.FocusListener', 'javax.swing.event.MouseInputListener', 'java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_BasicToolBarUI$Handler' }, inner: true });
$J.define(BasicToolBarUI$FrameListener, 'javax.swing.plaf.basic.BasicToolBarUI$FrameListener', { kind: 'class', sup: 'java.awt.event.WindowAdapter', ctors: { '': '_BasicToolBarUI$FrameListener' }, inner: true });
$J.define(BasicToolBarUI$DockingListener, 'javax.swing.plaf.basic.BasicToolBarUI$DockingListener', { kind: 'class', ifaces: ['javax.swing.event.MouseInputListener'], sup: 'java.lang.Object', ctors: { 'javax.swing.JToolBar': '_BasicToolBarUI$DockingListener' }, inner: true });
$J.define(BasicToolBarUI$DragWindow, 'javax.swing.plaf.basic.BasicToolBarUI$DragWindow', { kind: 'class', sup: 'java.awt.Window', ctors: { 'java.awt.Window': '_BasicToolBarUI$DragWindow' }, meths: { 'getInsets()': 'getInsets$' }, inner: true });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  Color = $J.load('java.awt.Color');
  Container = $J.load('java.awt.Container');
  Dialog = $J.load('java.awt.Dialog');
  Dimension = $J.load('java.awt.Dimension');
  Frame = $J.load('java.awt.Frame');
  IllegalComponentStateException = $J.load('java.awt.IllegalComponentStateException');
  Insets = $J.load('java.awt.Insets');
  Point = $J.load('java.awt.Point');
  AbstractButton = $J.load('javax.swing.AbstractButton');
  JComponent = $J.load('javax.swing.JComponent');
  JDialog = $J.load('javax.swing.JDialog');
  JRootPane = $J.load('javax.swing.JRootPane');
  JToggleButton = $J.load('javax.swing.JToggleButton');
  JToolBar$Separator = $J.load('javax.swing.JToolBar$Separator');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  CompoundBorder = $J.load('javax.swing.border.CompoundBorder');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicBorders$ButtonBorder = $J.load('javax.swing.plaf.basic.BasicBorders$ButtonBorder');
  BasicBorders$RadioButtonBorder = $J.load('javax.swing.plaf.basic.BasicBorders$RadioButtonBorder');
  BasicBorders$RolloverButtonBorder = $J.load('javax.swing.plaf.basic.BasicBorders$RolloverButtonBorder');
  BasicBorders$RolloverMarginBorder = $J.load('javax.swing.plaf.basic.BasicBorders$RolloverMarginBorder');
  BasicGraphicsUtils = $J.load('javax.swing.plaf.basic.BasicGraphicsUtils');
  BasicLookAndFeel = $J.load('javax.swing.plaf.basic.BasicLookAndFeel');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
});
