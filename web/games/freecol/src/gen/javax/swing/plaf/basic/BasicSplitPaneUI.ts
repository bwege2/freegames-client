// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicSplitPaneUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, HashSet, IllegalArgumentException, JObject, JString, LightweightPeer } from '../../../../../jre/index.ts';
import { SplitPaneUI } from '../SplitPaneUI.ts';
import { UIAction } from '../../../../sun/swing/UIAction.ts';

let Canvas, Dimension, KeyboardFocusManager, InputEvent, KeyEvent, JComponent, JSplitPane, KeyStroke, LookAndFeel, SwingUtilities, UIManager, UIResource, BasicLookAndFeel, BasicSplitPaneDivider, LazyActionMap, AWTAccessor, DefaultLookup, SwingUtilities2;

/**
 * A Basic L&amp;F implementation of the SplitPaneUI.
 *
 * @author Scott Violet
 * @author Steve Wilson
 * @author Ralph Kar
 */
export class BasicSplitPaneUI extends SplitPaneUI {
  /**
   * The divider used for non-continuous layout is added to the split pane
   * with this object.
   */
  static readonly NON_CONTINUOUS_DIVIDER: string = 'nonContinuousDivider';
  /**
   * How far (relative) the divider does move when it is moved around by
   * the cursor keys on the keyboard.
   */
  static KEYBOARD_DIVIDER_MOVE_OFFSET: number = 0;
  /**
   * JSplitPane instance this instance is providing
   * the look and feel for.
   */
  splitPane: JSplitPane = null;
  /**
   * LayoutManager that is created and placed into the split pane.
   */
  layoutManager: BasicSplitPaneUI$BasicHorizontalLayoutManager = null;
  /**
   * Instance of the divider for this JSplitPane.
   */
  divider: BasicSplitPaneDivider = null;
  /**
   * Instance of the PropertyChangeListener for this JSplitPane.
   */
  propertyChangeListener: PropertyChangeListener = null;
  /**
   * Instance of the FocusListener for this JSplitPane.
   */
  focusListener: FocusListener = null;
  handler: BasicSplitPaneUI$Handler = null;
  /**
   * Keys to use for forward focus traversal when the JComponent is
   * managing focus.
   */
  managingFocusForwardTraversalKeys: JSet<KeyStroke> = null;
  /**
   * Keys to use for backward focus traversal when the JComponent is
   * managing focus.
   */
  managingFocusBackwardTraversalKeys: JSet<KeyStroke> = null;
  /**
   * The size of the divider while the dragging session is valid.
   */
  dividerSize: number = 0;
  /**
   * Instance for the shadow of the divider when non continuous layout
   * is being used.
   */
  nonContinuousLayoutDivider: Component = null;
  /**
   * Set to true in startDragging if any of the children
   * (not including the nonContinuousLayoutDivider) are heavy weights.
   */
  draggingHW: boolean = false;
  /**
   * Location of the divider when the dragging session began.
   */
  beginDragDividerLocation: number = 0;
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
  /**
   * As of Java 2 platform v1.3 this previously undocumented field is no
   * longer used.
   * Key bindings are now defined by the LookAndFeel, please refer to
   * the key bindings specification for further details.
   *
   * @deprecated As of Java 2 platform v1.3.
   */
  homeKey: KeyStroke = null;
  /**
   * As of Java 2 platform v1.3 this previously undocumented field is no
   * longer used.
   * Key bindings are now defined by the LookAndFeel, please refer to
   * the key bindings specification for further details.
   *
   * @deprecated As of Java 2 platform v1.3.
   */
  endKey: KeyStroke = null;
  /**
   * As of Java 2 platform v1.3 this previously undocumented field is no
   * longer used.
   * Key bindings are now defined by the LookAndFeel, please refer to
   * the key bindings specification for further details.
   *
   * @deprecated As of Java 2 platform v1.3.
   */
  dividerResizeToggleKey: KeyStroke = null;
  /**
   * As of Java 2 platform v1.3 this previously undocumented field is no
   * longer used.
   * Key bindings are now defined by the LookAndFeel, please refer to
   * the key bindings specification for further details.
   *
   * @deprecated As of Java 2 platform v1.3.
   */
  keyboardUpLeftListener: ActionListener = null;
  /**
   * As of Java 2 platform v1.3 this previously undocumented field is no
   * longer used.
   * Key bindings are now defined by the LookAndFeel, please refer to
   * the key bindings specification for further details.
   *
   * @deprecated As of Java 2 platform v1.3.
   */
  keyboardDownRightListener: ActionListener = null;
  /**
   * As of Java 2 platform v1.3 this previously undocumented field is no
   * longer used.
   * Key bindings are now defined by the LookAndFeel, please refer to
   * the key bindings specification for further details.
   *
   * @deprecated As of Java 2 platform v1.3.
   */
  keyboardHomeListener: ActionListener = null;
  /**
   * As of Java 2 platform v1.3 this previously undocumented field is no
   * longer used.
   * Key bindings are now defined by the LookAndFeel, please refer to
   * the key bindings specification for further details.
   *
   * @deprecated As of Java 2 platform v1.3.
   */
  keyboardEndListener: ActionListener = null;
  /**
   * As of Java 2 platform v1.3 this previously undocumented field is no
   * longer used.
   * Key bindings are now defined by the LookAndFeel, please refer to
   * the key bindings specification for further details.
   *
   * @deprecated As of Java 2 platform v1.3.
   */
  keyboardResizeToggleListener: ActionListener = null;
  orientation: number = 0;
  lastDragLocation: number = 0;
  continuousLayout: boolean = false;
  dividerKeyboardResize: boolean = false;
  dividerLocationIsSet: boolean = false;
  dividerDraggingColor: Color = null;
  rememberPaneSizes: boolean = false;
  keepHidden: boolean = false;
  /**
   * Indicates that we have painted once.
   */
  painted: boolean = false;
  /**
   * If true, setDividerLocation does nothing.
   */
  ignoreDividerLocationChange: boolean = false;
  /**
   * Constructs a {@code BasicSplitPaneUI}.
   */
  _BasicSplitPaneUI(): this {
    this._SplitPaneUI();
    this.keepHidden = false;
    return this;
  }
  /**
   * Creates a new instance of {@code BasicSplitPaneUI}.
   *
   * @param x a component
   * @return a new instance of {@code BasicSplitPaneUI}
   */
  static createUI(x: JComponent): ComponentUI {
    return new BasicSplitPaneUI()._BasicSplitPaneUI();
  }
  static loadActionMap(map: LazyActionMap): void {
    map.put$Action(new BasicSplitPaneUI$Actions()._BasicSplitPaneUI$Actions(BasicSplitPaneUI$Actions.NEGATIVE_INCREMENT));
    map.put$Action(new BasicSplitPaneUI$Actions()._BasicSplitPaneUI$Actions(BasicSplitPaneUI$Actions.POSITIVE_INCREMENT));
    map.put$Action(new BasicSplitPaneUI$Actions()._BasicSplitPaneUI$Actions(BasicSplitPaneUI$Actions.SELECT_MIN));
    map.put$Action(new BasicSplitPaneUI$Actions()._BasicSplitPaneUI$Actions(BasicSplitPaneUI$Actions.SELECT_MAX));
    map.put$Action(new BasicSplitPaneUI$Actions()._BasicSplitPaneUI$Actions(BasicSplitPaneUI$Actions.START_RESIZE));
    map.put$Action(new BasicSplitPaneUI$Actions()._BasicSplitPaneUI$Actions(BasicSplitPaneUI$Actions.TOGGLE_FOCUS));
    map.put$Action(new BasicSplitPaneUI$Actions()._BasicSplitPaneUI$Actions(BasicSplitPaneUI$Actions.FOCUS_OUT_FORWARD));
    map.put$Action(new BasicSplitPaneUI$Actions()._BasicSplitPaneUI$Actions(BasicSplitPaneUI$Actions.FOCUS_OUT_BACKWARD));
  }
  /**
   * Installs the UI.
   */
  installUI(c: JComponent): void {
    this.splitPane = c;
    this.dividerLocationIsSet = false;
    this.dividerKeyboardResize = false;
    this.keepHidden = false;
    this.installDefaults();
    this.installListeners();
    this.installKeyboardActions();
    this.setLastDragLocation(-1);
  }
  /**
   * Installs the UI defaults.
   */
  installDefaults(): void {
    LookAndFeel.installBorder(this.splitPane, 'SplitPane.border');
    LookAndFeel.installColors(this.splitPane, 'SplitPane.background', 'SplitPane.foreground');
    LookAndFeel.installProperty(this.splitPane, 'opaque', true);
    if (this.divider == null) {
      this.divider = this.createDefaultDivider();
    }
    this.divider.setBasicSplitPaneUI(this);
    let b = this.divider.getBorder();
    if (!($J.isa(b, UIResource))) {
      this.divider.setBorder(UIManager.getBorder$Object('SplitPaneDivider.border'));
    }
    this.dividerDraggingColor = UIManager.getColor$Object('SplitPaneDivider.draggingColor');
    this.setOrientation(this.splitPane.getOrientation());
    let temp = UIManager.get$Object('SplitPane.dividerSize');
    LookAndFeel.installProperty(this.splitPane, 'dividerSize', temp == null ? 10 : temp);
    this.divider.setDividerSize(this.splitPane.getDividerSize());
    this.dividerSize = this.divider.getDividerSize();
    this.splitPane.add$Component$Object(this.divider, JSplitPane.DIVIDER);
    this.setContinuousLayout(this.splitPane.isContinuousLayout());
    this.resetLayoutManager();
    if (this.nonContinuousLayoutDivider == null) {
      this.setNonContinuousLayoutDivider$Component$boolean(this.createDefaultNonContinuousLayoutDivider(), true);
    } else {
      this.setNonContinuousLayoutDivider$Component$boolean(this.nonContinuousLayoutDivider, true);
    }
    if (this.managingFocusForwardTraversalKeys == null) {
      this.managingFocusForwardTraversalKeys = new HashSet();
      this.managingFocusForwardTraversalKeys.add(KeyStroke.getKeyStroke$int$int(KeyEvent.VK_TAB, 0));
    }
    this.splitPane.setFocusTraversalKeys(KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS, this.managingFocusForwardTraversalKeys);
    if (this.managingFocusBackwardTraversalKeys == null) {
      this.managingFocusBackwardTraversalKeys = new HashSet();
      this.managingFocusBackwardTraversalKeys.add(KeyStroke.getKeyStroke$int$int(KeyEvent.VK_TAB, InputEvent.SHIFT_MASK));
    }
    this.splitPane.setFocusTraversalKeys(KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS, this.managingFocusBackwardTraversalKeys);
  }
  /**
   * Installs the event listeners for the UI.
   */
  installListeners(): void {
    if ((this.propertyChangeListener = this.createPropertyChangeListener()) != null) {
      this.splitPane.addPropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    }
    if ((this.focusListener = this.createFocusListener()) != null) {
      this.splitPane.addFocusListener(this.focusListener);
    }
  }
  /**
   * Installs the keyboard actions for the UI.
   */
  installKeyboardActions(): void {
    let km = this.getInputMap(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT);
    SwingUtilities.replaceUIInputMap(this.splitPane, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, km);
    LazyActionMap.installLazyActionMap(this.splitPane, $J.cls(BasicSplitPaneUI), 'SplitPane.actionMap');
  }
  getInputMap(condition: number): InputMap {
    if (condition === JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT) {
      return DefaultLookup.get(this.splitPane, this, 'SplitPane.ancestorInputMap');
    }
    return null;
  }
  /**
   * Uninstalls the UI.
   */
  uninstallUI(c: JComponent): void {
    this.uninstallKeyboardActions();
    this.uninstallListeners();
    this.uninstallDefaults();
    this.dividerLocationIsSet = false;
    this.dividerKeyboardResize = false;
    this.splitPane = null;
  }
  /**
   * Uninstalls the UI defaults.
   */
  uninstallDefaults(): void {
    if (this.splitPane.getLayout() === this.layoutManager) {
      this.splitPane.setLayout(null);
    }
    if (this.nonContinuousLayoutDivider != null) {
      this.splitPane.remove$Component(this.nonContinuousLayoutDivider);
    }
    LookAndFeel.uninstallBorder(this.splitPane);
    let b = this.divider.getBorder();
    if ($J.isa(b, UIResource)) {
      this.divider.setBorder(null);
    }
    this.splitPane.remove$Component(this.divider);
    this.divider.setBasicSplitPaneUI(null);
    this.layoutManager = null;
    this.divider = null;
    this.nonContinuousLayoutDivider = null;
    this.setNonContinuousLayoutDivider$Component(null);
    this.splitPane.setFocusTraversalKeys(KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS, null);
    this.splitPane.setFocusTraversalKeys(KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS, null);
  }
  /**
   * Uninstalls the event listeners for the UI.
   */
  uninstallListeners(): void {
    if (this.propertyChangeListener != null) {
      this.splitPane.removePropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
      this.propertyChangeListener = null;
    }
    if (this.focusListener != null) {
      this.splitPane.removeFocusListener(this.focusListener);
      this.focusListener = null;
    }
    this.keyboardUpLeftListener = null;
    this.keyboardDownRightListener = null;
    this.keyboardHomeListener = null;
    this.keyboardEndListener = null;
    this.keyboardResizeToggleListener = null;
    this.handler = null;
  }
  /**
   * Uninstalls the keyboard actions for the UI.
   */
  uninstallKeyboardActions(): void {
    SwingUtilities.replaceUIActionMap(this.splitPane, null);
    SwingUtilities.replaceUIInputMap(this.splitPane, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, null);
  }
  /**
   * Creates a {@code PropertyChangeListener} for the {@code JSplitPane} UI.
   *
   * @return an instance of {@code PropertyChangeListener}
   */
  createPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
  getHandler(): BasicSplitPaneUI$Handler {
    if (this.handler == null) {
      this.handler = new BasicSplitPaneUI$Handler().$o(this)._BasicSplitPaneUI$Handler();
    }
    return this.handler;
  }
  /**
   * Creates a {@code FocusListener} for the {@code JSplitPane} UI.
   *
   * @return an instance of {@code FocusListener}
   */
  createFocusListener(): FocusListener {
    return this.getHandler();
  }
  /**
   * Set the orientation for the {@code JSplitPane}.
   *
   * @param orientation the orientation
   */
  setOrientation(orientation: number): void {
    this.orientation = orientation;
  }
  /**
   * Determines whether the {@code JSplitPane} is set to use a continuous layout.
   *
   * @return {@code true} if a continuous layout is set
   */
  isContinuousLayout(): boolean {
    return this.continuousLayout;
  }
  /**
   * Turn continuous layout on/off.
   *
   * @param b if {@code true} the continuous layout turns on
   */
  setContinuousLayout(b: boolean): void {
    this.continuousLayout = b;
  }
  /**
   * Returns the last drag location of the {@code JSplitPane}.
   *
   * @return the last drag location
   */
  getLastDragLocation(): number {
    return this.lastDragLocation;
  }
  /**
   * Set the last drag location of the {@code JSplitPane}.
   *
   * @param l the drag location
   */
  setLastDragLocation(l: number): void {
    this.lastDragLocation = l;
  }
  /**
   * @return increment via keyboard methods.
   */
  getKeyboardMoveIncrement(): number {
    return 3;
  }
  /**
   * Returns the default non continuous layout divider, which is an
   * instance of {@code Canvas} that fills in the background with dark gray.
   *
   * @return the default non continuous layout divider
   */
  createDefaultNonContinuousLayoutDivider(): Component {
    return new (BasicSplitPaneUI$1())().$o(this)._Canvas$();
  }
  /**
   * Sets the divider to use when the {@code JSplitPane} is configured to
   * not continuously layout. This divider will only be used during a
   * dragging session. It is recommended that the passed in component
   * be a heavy weight.
   *
   * @param newDivider the new divider
   */
  setNonContinuousLayoutDivider$Component(newDivider: Component): void {
    this.setNonContinuousLayoutDivider$Component$boolean(newDivider, true);
  }
  /**
   * Sets the divider to use.
   *
   * @param newDivider the new divider
   * @param rememberSizes if {@code true} the pane size is remembered
   */
  setNonContinuousLayoutDivider$Component$boolean(newDivider: Component, rememberSizes: boolean): void {
    this.rememberPaneSizes = rememberSizes;
    if (this.nonContinuousLayoutDivider != null && this.splitPane != null) {
      this.splitPane.remove$Component(this.nonContinuousLayoutDivider);
    }
    this.nonContinuousLayoutDivider = newDivider;
  }
  addHeavyweightDivider(): void {
    if (this.nonContinuousLayoutDivider != null && this.splitPane != null) {
      let leftC = this.splitPane.getLeftComponent();
      let rightC = this.splitPane.getRightComponent();
      let lastLocation = this.splitPane.getDividerLocation();
      if (leftC != null) {
        this.splitPane.setLeftComponent(null);
      }
      if (rightC != null) {
        this.splitPane.setRightComponent(null);
      }
      this.splitPane.remove$Component(this.divider);
      this.splitPane.add$Component$Object$int(this.nonContinuousLayoutDivider, BasicSplitPaneUI.NON_CONTINUOUS_DIVIDER, this.splitPane.getComponentCount());
      this.splitPane.setLeftComponent(leftC);
      this.splitPane.setRightComponent(rightC);
      this.splitPane.add$Component$Object(this.divider, JSplitPane.DIVIDER);
      if (this.rememberPaneSizes) {
        this.splitPane.setDividerLocation$int(lastLocation);
      }
    }
  }
  /**
   * Returns the divider to use when the {@code JSplitPane} is configured to
   * not continuously layout. This divider will only be used during a
   * dragging session.
   *
   * @return the divider
   */
  getNonContinuousLayoutDivider(): Component {
    return this.nonContinuousLayoutDivider;
  }
  /**
   * Returns the {@code JSplitPane} this instance is currently contained
   * in.
   *
   * @return the instance of {@code JSplitPane}
   */
  getSplitPane(): JSplitPane {
    return this.splitPane;
  }
  /**
   * Creates the default divider.
   *
   * @return the default divider
   */
  createDefaultDivider(): BasicSplitPaneDivider {
    return new BasicSplitPaneDivider()._BasicSplitPaneDivider(this);
  }
  /**
   * Sets the location of the divider to location.
   */
  setDividerLocation(jc: JSplitPane, location: number): void {
    if (!this.ignoreDividerLocationChange) {
      this.dividerLocationIsSet = true;
      this.splitPane.revalidate();
      this.splitPane.repaint$();
      if (this.keepHidden) {
        let insets = this.splitPane.getInsets$();
        let orientation = this.splitPane.getOrientation();
        if ((orientation === JSplitPane.VERTICAL_SPLIT && location !== insets.top && location !== ((this.splitPane.getHeight() - this.divider.getHeight() - insets.top) | 0)) || (orientation === JSplitPane.HORIZONTAL_SPLIT && location !== insets.left && location !== ((this.splitPane.getWidth() - this.divider.getWidth() - insets.left) | 0))) {
          this.setKeepHidden(false);
        }
      }
    } else {
      this.ignoreDividerLocationChange = false;
    }
  }
  /**
   * Returns the location of the divider, which may differ from what
   * the splitpane thinks the location of the divider is.
   */
  getDividerLocation(jc: JSplitPane): number {
    if (this.orientation === JSplitPane.HORIZONTAL_SPLIT) {
      return this.divider.getLocation$().x_;
    }
    return this.divider.getLocation$().y_;
  }
  /**
   * Gets the minimum location of the divider.
   */
  getMinimumDividerLocation(jc: JSplitPane): number {
    let minLoc = 0;
    let leftC = this.splitPane.getLeftComponent();
    if ((leftC != null) && (leftC.isVisible$())) {
      let insets = this.splitPane.getInsets$();
      let minSize = leftC.getMinimumSize$();
      if (this.orientation === JSplitPane.HORIZONTAL_SPLIT) {
        minLoc = minSize.width_;
      } else {
        minLoc = minSize.height_;
      }
      if (insets != null) {
        if (this.orientation === JSplitPane.HORIZONTAL_SPLIT) {
          minLoc = (minLoc + insets.left) | 0;
        } else {
          minLoc = (minLoc + insets.top) | 0;
        }
      }
    }
    return minLoc;
  }
  /**
   * Gets the maximum location of the divider.
   */
  getMaximumDividerLocation(jc: JSplitPane): number {
    let splitPaneSize = this.splitPane.getSize$();
    let maxLoc = 0;
    let rightC = this.splitPane.getRightComponent();
    if (rightC != null) {
      let insets = this.splitPane.getInsets$();
      let minSize = new Dimension()._Dimension$int$int(0, 0);
      if (rightC.isVisible$()) {
        minSize = rightC.getMinimumSize$();
      }
      if (this.orientation === JSplitPane.HORIZONTAL_SPLIT) {
        maxLoc = (splitPaneSize.width_ - minSize.width_) | 0;
      } else {
        maxLoc = (splitPaneSize.height_ - minSize.height_) | 0;
      }
      maxLoc = (maxLoc - this.dividerSize) | 0;
      if (insets != null) {
        if (this.orientation === JSplitPane.HORIZONTAL_SPLIT) {
          maxLoc = (maxLoc - insets.right) | 0;
        } else {
          maxLoc = (maxLoc - insets.top) | 0;
        }
      }
    }
    return Math.max(this.getMinimumDividerLocation(this.splitPane), maxLoc);
  }
  /**
   * Called when the specified split pane has finished painting
   * its children.
   */
  finishedPaintingChildren(sp: JSplitPane, g: Graphics): void {
    if (sp === this.splitPane && this.getLastDragLocation() !== -1 && !this.isContinuousLayout() && !this.draggingHW) {
      let size = this.splitPane.getSize$();
      g.setColor(this.dividerDraggingColor);
      if (this.orientation === JSplitPane.HORIZONTAL_SPLIT) {
        g.fillRect(this.getLastDragLocation(), 0, (this.dividerSize - 1) | 0, (size.height_ - 1) | 0);
      } else {
        g.fillRect(0, this.lastDragLocation, (size.width_ - 1) | 0, (this.dividerSize - 1) | 0);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  paint(g: Graphics, jc: JComponent): void {
    if (!this.painted && this.splitPane.getDividerLocation() < 0) {
      this.ignoreDividerLocationChange = true;
      this.splitPane.setDividerLocation$int(this.getDividerLocation(this.splitPane));
    }
    this.painted = true;
  }
  /**
   * Returns the preferred size for the passed in component,
   * This is passed off to the current layout manager.
   */
  getPreferredSize$JComponent(jc: JComponent): Dimension {
    if (this.splitPane != null) {
      return this.layoutManager.preferredLayoutSize(this.splitPane);
    }
    return new Dimension()._Dimension$int$int(0, 0);
  }
  /**
   * Returns the minimum size for the passed in component,
   * This is passed off to the current layout manager.
   */
  getMinimumSize(jc: JComponent): Dimension {
    if (this.splitPane != null) {
      return this.layoutManager.minimumLayoutSize(this.splitPane);
    }
    return new Dimension()._Dimension$int$int(0, 0);
  }
  /**
   * Returns the maximum size for the passed in component,
   * This is passed off to the current layout manager.
   */
  getMaximumSize(jc: JComponent): Dimension {
    if (this.splitPane != null) {
      return this.layoutManager.maximumLayoutSize(this.splitPane);
    }
    return new Dimension()._Dimension$int$int(0, 0);
  }
  /**
   * Resets the layout manager based on orientation and messages it
   * with invalidateLayout to pull in appropriate Components.
   */
  resetLayoutManager(): void {
    if (this.orientation === JSplitPane.HORIZONTAL_SPLIT) {
      this.layoutManager = new BasicSplitPaneUI$BasicHorizontalLayoutManager().$o(this)._BasicSplitPaneUI$BasicHorizontalLayoutManager$int(0);
    } else {
      this.layoutManager = new BasicSplitPaneUI$BasicHorizontalLayoutManager().$o(this)._BasicSplitPaneUI$BasicHorizontalLayoutManager$int(1);
    }
    this.splitPane.setLayout(this.layoutManager);
    this.layoutManager.updateComponents();
    this.splitPane.revalidate();
    this.splitPane.repaint$();
  }
  /**
   * Set the value to indicate if one of the splitpane sides is expanded.
   */
  setKeepHidden(keepHidden: boolean): void {
    this.keepHidden = keepHidden;
  }
  /**
   * The value returned indicates if one of the splitpane sides is expanded.
   * @return true if one of the splitpane sides is expanded, false otherwise.
   */
  getKeepHidden(): boolean {
    return this.keepHidden;
  }
  /**
   * Should be messaged before the dragging session starts, resets
   * lastDragLocation and dividerSize.
   */
  startDragging(): void {
    let leftC = this.splitPane.getLeftComponent();
    let rightC = this.splitPane.getRightComponent();
    let cPeer: ComponentPeer;
    this.beginDragDividerLocation = this.getDividerLocation(this.splitPane);
    this.draggingHW = false;
    let acc = AWTAccessor.getComponentAccessor();
    if (leftC != null && (cPeer = acc.getPeer(leftC)) != null && !($J.isa(cPeer, LightweightPeer))) {
      this.draggingHW = true;
    } else if (rightC != null && (cPeer = acc.getPeer(rightC)) != null && !($J.isa(cPeer, LightweightPeer))) {
      this.draggingHW = true;
    }
    if (this.orientation === JSplitPane.HORIZONTAL_SPLIT) {
      this.setLastDragLocation(this.divider.getBounds$().x_);
      this.dividerSize = this.divider.getSize$().width_;
      if (!this.isContinuousLayout() && this.draggingHW) {
        this.nonContinuousLayoutDivider.setBounds$int$int$int$int(this.getLastDragLocation(), 0, this.dividerSize, this.splitPane.getHeight());
        this.addHeavyweightDivider();
      }
    } else {
      this.setLastDragLocation(this.divider.getBounds$().y_);
      this.dividerSize = this.divider.getSize$().height_;
      if (!this.isContinuousLayout() && this.draggingHW) {
        this.nonContinuousLayoutDivider.setBounds$int$int$int$int(0, this.getLastDragLocation(), this.splitPane.getWidth(), this.dividerSize);
        this.addHeavyweightDivider();
      }
    }
  }
  /**
   * Messaged during a dragging session to move the divider to the
   * passed in {@code location}. If {@code continuousLayout} is {@code true}
   * the location is reset and the splitPane validated.
   *
   * @param location the location of divider
   */
  dragDividerTo(location: number): void {
    if (this.getLastDragLocation() !== location) {
      if (this.isContinuousLayout()) {
        this.splitPane.setDividerLocation$int(location);
        this.setLastDragLocation(location);
      } else {
        let lastLoc = this.getLastDragLocation();
        this.setLastDragLocation(location);
        if (this.orientation === JSplitPane.HORIZONTAL_SPLIT) {
          if (this.draggingHW) {
            this.nonContinuousLayoutDivider.setLocation$int$int(this.getLastDragLocation(), 0);
          } else {
            let splitHeight = this.splitPane.getHeight();
            this.splitPane.repaint$int$int$int$int(lastLoc, 0, this.dividerSize, splitHeight);
            this.splitPane.repaint$int$int$int$int(location, 0, this.dividerSize, splitHeight);
          }
        } else {
          if (this.draggingHW) {
            this.nonContinuousLayoutDivider.setLocation$int$int(0, this.getLastDragLocation());
          } else {
            let splitWidth = this.splitPane.getWidth();
            this.splitPane.repaint$int$int$int$int(0, lastLoc, splitWidth, this.dividerSize);
            this.splitPane.repaint$int$int$int$int(0, location, splitWidth, this.dividerSize);
          }
        }
      }
    }
  }
  /**
   * Messaged to finish the dragging session. If not continuous display
   * the dividers {@code location} will be reset.
   *
   * @param location the location of divider
   */
  finishDraggingTo(location: number): void {
    this.dragDividerTo(location);
    this.setLastDragLocation(-1);
    if (!this.isContinuousLayout()) {
      let leftC = this.splitPane.getLeftComponent();
      let leftBounds = leftC.getBounds$();
      if (this.draggingHW) {
        if (this.orientation === JSplitPane.HORIZONTAL_SPLIT) {
          this.nonContinuousLayoutDivider.setLocation$int$int(-this.dividerSize, 0);
        } else {
          this.nonContinuousLayoutDivider.setLocation$int$int(0, -this.dividerSize);
        }
        this.splitPane.remove$Component(this.nonContinuousLayoutDivider);
      }
      this.splitPane.setDividerLocation$int(location);
    }
  }
  static $clinit() {
    BasicSplitPaneUI.KEYBOARD_DIVIDER_MOVE_OFFSET = 3;
  }
}

/**
 * LayoutManager for JSplitPanes that have an orientation of
 * HORIZONTAL_SPLIT.
 */
export class BasicSplitPaneUI$BasicHorizontalLayoutManager extends JObject {
  /**
   * The size of components.
   */
  sizes: number[] = null;
  /**
   * The components.
   */
  components: Component[] = null;
  /**
   * Size of the splitpane the last time laid out.
   */
  lastSplitPaneSize: number = 0;
  /**
   * True if resetToPreferredSizes has been invoked.
   */
  doReset: boolean = false;
  /**
   * Axis, 0 for horizontal, or 1 for vertical.
   */
  axis: number = 0;
  _BasicSplitPaneUI$BasicHorizontalLayoutManager$int(axis: number): this {
    this.axis = axis;
    this.components = $J.newArray(3, null);
    this.components[0] = this.components[1] = this.components[2] = null;
    this.sizes = $J.newArray(3, 0);
    return this;
  }
  /**
   * Does the actual layout.
   */
  layoutContainer$Container(container: Container): void {
    let containerSize = container.getSize$();
    if (containerSize.height_ <= 0 || containerSize.width_ <= 0) {
      this.lastSplitPaneSize = 0;
      return;
    }
    let spDividerLocation = this.$outer.splitPane.getDividerLocation();
    let insets = this.$outer.splitPane.getInsets$();
    let availableSize = this.getAvailableSize(containerSize, insets);
    let newSize = this.getSizeForPrimaryAxis$Dimension(containerSize);
    let beginLocation = this.$outer.getDividerLocation(this.$outer.splitPane);
    let dOffset = this.getSizeForPrimaryAxis$Insets$boolean(insets, true);
    let dSize = (this.components[2] == null) ? null : this.components[2].getPreferredSize$();
    if ((this.doReset && !this.$outer.dividerLocationIsSet) || spDividerLocation < 0) {
      this.resetToPreferredSizes$int(availableSize);
    } else if (this.lastSplitPaneSize <= 0 || availableSize === this.lastSplitPaneSize || !this.$outer.painted || (dSize != null && this.getSizeForPrimaryAxis$Dimension(dSize) !== this.sizes[2])) {
      if (dSize != null) {
        this.sizes[2] = this.getSizeForPrimaryAxis$Dimension(dSize);
      } else {
        this.sizes[2] = 0;
      }
      this.setDividerLocation((spDividerLocation - dOffset) | 0, availableSize);
      this.$outer.dividerLocationIsSet = false;
    } else if (availableSize !== this.lastSplitPaneSize) {
      this.distributeSpace((availableSize - this.lastSplitPaneSize) | 0, this.$outer.getKeepHidden());
    }
    this.doReset = false;
    this.$outer.dividerLocationIsSet = false;
    this.lastSplitPaneSize = availableSize;
    let nextLocation = this.getInitialLocation(insets);
    let counter = 0;
    while (counter < 3) {
      if (this.components[counter] != null && this.components[counter].isVisible$()) {
        this.setComponentToSize(this.components[counter], this.sizes[counter], nextLocation, insets, containerSize);
        nextLocation = (nextLocation + this.sizes[counter]) | 0;
      }
      switch (counter) {
        case 0:
          counter = 2;
          break;
        case 2:
          counter = 1;
          break;
        case 1:
          counter = 3;
          break;
      }
    }
    if (this.$outer.painted) {
      let newLocation = this.$outer.getDividerLocation(this.$outer.splitPane);
      if (newLocation !== ((spDividerLocation - dOffset) | 0)) {
        let lastLocation = this.$outer.splitPane.getLastDividerLocation();
        this.$outer.ignoreDividerLocationChange = true;
        try {
          this.$outer.splitPane.setDividerLocation$int(newLocation);
          this.$outer.splitPane.setLastDividerLocation(lastLocation);
        } finally {
          this.$outer.ignoreDividerLocationChange = false;
        }
      }
    }
  }
  /**
   * Adds the component at place.  Place must be one of
   * JSplitPane.LEFT, RIGHT, TOP, BOTTOM, or null (for the
   * divider).
   */
  addLayoutComponent$String$Component(place: string, component: Component): void {
    let isValid = true;
    if (place != null) {
      if ($J.equals(place, JSplitPane.DIVIDER)) {
        this.components[2] = component;
        this.sizes[2] = this.getSizeForPrimaryAxis$Dimension(component.getPreferredSize$());
      } else if ($J.equals(place, JSplitPane.LEFT) || $J.equals(place, JSplitPane.TOP)) {
        this.components[0] = component;
        this.sizes[0] = 0;
      } else if ($J.equals(place, JSplitPane.RIGHT) || $J.equals(place, JSplitPane.BOTTOM)) {
        this.components[1] = component;
        this.sizes[1] = 0;
      } else if (!$J.equals(place, BasicSplitPaneUI.NON_CONTINUOUS_DIVIDER)) {
        isValid = false;
      }
    } else {
      isValid = false;
    }
    if (!isValid) {
      throw new IllegalArgumentException('cannot add to layout: unknown constraint: ' + place);
    }
    this.doReset = true;
  }
  /**
   * Returns the minimum size needed to contain the children.
   * The width is the sum of all the children's min widths and
   * the height is the largest of the children's minimum heights.
   */
  minimumLayoutSize(container: Container): Dimension {
    let minPrimary = 0;
    let minSecondary = 0;
    let insets = this.$outer.splitPane.getInsets$();
    for (let counter = 0; counter < 3; counter++) {
      if (this.components[counter] != null) {
        let minSize = this.components[counter].getMinimumSize$();
        let secSize = this.getSizeForSecondaryAxis$Dimension(minSize);
        minPrimary = (minPrimary + this.getSizeForPrimaryAxis$Dimension(minSize)) | 0;
        if (secSize > minSecondary) {
          minSecondary = secSize;
        }
      }
    }
    if (insets != null) {
      minPrimary = (minPrimary + (this.getSizeForPrimaryAxis$Insets$boolean(insets, true) + this.getSizeForPrimaryAxis$Insets$boolean(insets, false))) | 0;
      minSecondary = (minSecondary + (this.getSizeForSecondaryAxis$Insets$boolean(insets, true) + this.getSizeForSecondaryAxis$Insets$boolean(insets, false))) | 0;
    }
    if (this.axis === 0) {
      return new Dimension()._Dimension$int$int(minPrimary, minSecondary);
    }
    return new Dimension()._Dimension$int$int(minSecondary, minPrimary);
  }
  /**
   * Returns the preferred size needed to contain the children.
   * The width is the sum of all the preferred widths of the children and
   * the height is the largest preferred height of the children.
   */
  preferredLayoutSize(container: Container): Dimension {
    let prePrimary = 0;
    let preSecondary = 0;
    let insets = this.$outer.splitPane.getInsets$();
    for (let counter = 0; counter < 3; counter++) {
      if (this.components[counter] != null) {
        let preSize = this.components[counter].getPreferredSize$();
        let secSize = this.getSizeForSecondaryAxis$Dimension(preSize);
        prePrimary = (prePrimary + this.getSizeForPrimaryAxis$Dimension(preSize)) | 0;
        if (secSize > preSecondary) {
          preSecondary = secSize;
        }
      }
    }
    if (insets != null) {
      prePrimary = (prePrimary + (this.getSizeForPrimaryAxis$Insets$boolean(insets, true) + this.getSizeForPrimaryAxis$Insets$boolean(insets, false))) | 0;
      preSecondary = (preSecondary + (this.getSizeForSecondaryAxis$Insets$boolean(insets, true) + this.getSizeForSecondaryAxis$Insets$boolean(insets, false))) | 0;
    }
    if (this.axis === 0) {
      return new Dimension()._Dimension$int$int(prePrimary, preSecondary);
    }
    return new Dimension()._Dimension$int$int(preSecondary, prePrimary);
  }
  /**
   * Removes the specified component from our knowledge.
   */
  removeLayoutComponent(component: Component): void {
    for (let counter = 0; counter < 3; counter++) {
      if (this.components[counter] === component) {
        this.components[counter] = null;
        this.sizes[counter] = 0;
        this.doReset = true;
      }
    }
  }
  /**
   * Adds the specified component to the layout, using the specified
   * constraint object.
   * @param comp the component to be added
   * @param constraints  where/how the component is added to the layout.
   */
  addLayoutComponent$Component$Object(comp: Component, constraints: any): void {
    if ((constraints == null) || ($J.isa(constraints, JString))) {
      this.addLayoutComponent$String$Component(constraints, comp);
    } else {
      throw new IllegalArgumentException('cannot add to layout: constraint must be a string (or null)');
    }
  }
  /**
   * Returns the alignment along the x axis.  This specifies how
   * the component would like to be aligned relative to other
   * components.  The value should be a number between 0 and 1
   * where 0 represents alignment along the origin, 1 is aligned
   * the furthest away from the origin, 0.5 is centered, etc.
   */
  getLayoutAlignmentX(target: Container): number {
    return 0;
  }
  /**
   * Returns the alignment along the y axis.  This specifies how
   * the component would like to be aligned relative to other
   * components.  The value should be a number between 0 and 1
   * where 0 represents alignment along the origin, 1 is aligned
   * the furthest away from the origin, 0.5 is centered, etc.
   */
  getLayoutAlignmentY(target: Container): number {
    return 0;
  }
  /**
   * Does nothing. If the developer really wants to change the
   * size of one of the views JSplitPane.resetToPreferredSizes should
   * be messaged.
   */
  invalidateLayout(c: Container): void {
  }
  /**
   * Returns the maximum layout size, which is Integer.MAX_VALUE
   * in both directions.
   */
  maximumLayoutSize(target: Container): Dimension {
    return new Dimension()._Dimension$int$int(2147483647, 2147483647);
  }
  /**
   * Sets the sizes to {@code newSizes}.
   *
   * @param newSizes the new sizes
   */
  setSizes(newSizes: number[]): void {
    $J.system_arraycopy(newSizes, 0, this.sizes, 0, 3);
  }
  /**
   * Returns the width of the passed in Components preferred size.
   *
   * @param c a component
   * @return the preferred width of the component
   */
  getPreferredSizeOfComponent(c: Component): number {
    return this.getSizeForPrimaryAxis$Dimension(c.getPreferredSize$());
  }
  /**
   * Returns the width of the passed in Components minimum size.
   *
   * @param c a component
   * @return the minimum width of the component
   */
  getMinimumSizeOfComponent(c: Component): number {
    return this.getSizeForPrimaryAxis$Dimension(c.getMinimumSize$());
  }
  /**
   * Returns the available width based on the container size and
   * {@code Insets}.
   *
   * @param containerSize a container size
   * @param insets an insets
   * @return the available width
   */
  getAvailableSize(containerSize: Dimension, insets: Insets): number {
    if (insets == null) {
      return this.getSizeForPrimaryAxis$Dimension(containerSize);
    }
    return ((this.getSizeForPrimaryAxis$Dimension(containerSize) - (this.getSizeForPrimaryAxis$Insets$boolean(insets, true) + this.getSizeForPrimaryAxis$Insets$boolean(insets, false))) | 0);
  }
  /**
   * Returns the left inset, unless the {@code Insets} are null in which case
   * 0 is returned.
   *
   * @param insets the insets
   * @return the left inset
   */
  getInitialLocation(insets: Insets): number {
    if (insets != null) {
      return this.getSizeForPrimaryAxis$Insets$boolean(insets, true);
    }
    return 0;
  }
  /**
   * Sets the width of the component {@code c} to be {@code size}, placing its
   * x location at {@code location}, y to the {@code insets.top} and height
   * to the {@code containerSize.height} less the top and bottom insets.
   *
   * @param c a component
   * @param size a new width
   * @param location a new X coordinate
   * @param insets an insets
   * @param containerSize a container size
   */
  setComponentToSize(c: Component, size: number, location: number, insets: Insets, containerSize: Dimension): void {
    if (insets != null) {
      if (this.axis === 0) {
        c.setBounds$int$int$int$int(location, insets.top, size, (containerSize.height_ - (insets.top + insets.bottom)) | 0);
      } else {
        c.setBounds$int$int$int$int(insets.left, location, (containerSize.width_ - (insets.left + insets.right)) | 0, size);
      }
    } else {
      if (this.axis === 0) {
        c.setBounds$int$int$int$int(location, 0, size, containerSize.height_);
      } else {
        c.setBounds$int$int$int$int(0, location, containerSize.width_, size);
      }
    }
  }
  /**
   * If the axis == 0, the width is returned, otherwise the height.
   */
  getSizeForPrimaryAxis$Dimension(size: Dimension): number {
    if (this.axis === 0) {
      return size.width_;
    }
    return size.height_;
  }
  /**
   * If the axis == 0, the width is returned, otherwise the height.
   */
  getSizeForSecondaryAxis$Dimension(size: Dimension): number {
    if (this.axis === 0) {
      return size.height_;
    }
    return size.width_;
  }
  /**
   * Returns a particular value of the inset identified by the
   * axis and <code>isTop</code><p>
   *   axis isTop
   *    0    true    - left
   *    0    false   - right
   *    1    true    - top
   *    1    false   - bottom
   */
  getSizeForPrimaryAxis$Insets$boolean(insets: Insets, isTop: boolean): number {
    if (this.axis === 0) {
      if (isTop) {
        return insets.left;
      }
      return insets.right;
    }
    if (isTop) {
      return insets.top;
    }
    return insets.bottom;
  }
  /**
   * Returns a particular value of the inset identified by the
   * axis and <code>isTop</code><p>
   *   axis isTop
   *    0    true    - left
   *    0    false   - right
   *    1    true    - top
   *    1    false   - bottom
   */
  getSizeForSecondaryAxis$Insets$boolean(insets: Insets, isTop: boolean): number {
    if (this.axis === 0) {
      if (isTop) {
        return insets.top;
      }
      return insets.bottom;
    }
    if (isTop) {
      return insets.left;
    }
    return insets.right;
  }
  /**
   * Determines the components. This should be called whenever
   * a new instance of this is installed into an existing
   * SplitPane.
   */
  updateComponents(): void {
    let comp: Component;
    comp = this.$outer.splitPane.getLeftComponent();
    if (this.components[0] !== comp) {
      this.components[0] = comp;
      if (comp == null) {
        this.sizes[0] = 0;
      } else {
        this.sizes[0] = -1;
      }
    }
    comp = this.$outer.splitPane.getRightComponent();
    if (this.components[1] !== comp) {
      this.components[1] = comp;
      if (comp == null) {
        this.sizes[1] = 0;
      } else {
        this.sizes[1] = -1;
      }
    }
    let children = this.$outer.splitPane.getComponents();
    let oldDivider = this.components[2];
    this.components[2] = null;
    for (let counter = (children.length - 1) | 0; counter >= 0; counter--) {
      if (children[counter] !== this.components[0] && children[counter] !== this.components[1] && children[counter] !== this.$outer.nonContinuousLayoutDivider) {
        if (oldDivider !== children[counter]) {
          this.components[2] = children[counter];
        } else {
          this.components[2] = oldDivider;
        }
        break;
      }
    }
    if (this.components[2] == null) {
      this.sizes[2] = 0;
    } else {
      this.sizes[2] = this.getSizeForPrimaryAxis$Dimension(this.components[2].getPreferredSize$());
    }
  }
  /**
   * Resets the size of the first component to <code>leftSize</code>,
   * and the right component to the remainder of the space.
   */
  setDividerLocation(leftSize: number, availableSize: number): void {
    let lValid = (this.components[0] != null && this.components[0].isVisible$());
    let rValid = (this.components[1] != null && this.components[1].isVisible$());
    let dValid = (this.components[2] != null && this.components[2].isVisible$());
    let max = availableSize;
    if (dValid) {
      max = (max - this.sizes[2]) | 0;
    }
    leftSize = Math.max(0, Math.min(leftSize, max));
    if (lValid) {
      if (rValid) {
        this.sizes[0] = leftSize;
        this.sizes[1] = (max - leftSize) | 0;
      } else {
        this.sizes[0] = max;
        this.sizes[1] = 0;
      }
    } else if (rValid) {
      this.sizes[1] = max;
      this.sizes[0] = 0;
    }
  }
  /**
   * Returns an array of the minimum sizes of the components.
   */
  getPreferredSizes(): number[] {
    let retValue = $J.newArray(3, 0);
    for (let counter = 0; counter < 3; counter++) {
      if (this.components[counter] != null && this.components[counter].isVisible$()) {
        retValue[counter] = this.getPreferredSizeOfComponent(this.components[counter]);
      } else {
        retValue[counter] = -1;
      }
    }
    return retValue;
  }
  /**
   * Returns an array of the minimum sizes of the components.
   */
  getMinimumSizes(): number[] {
    let retValue = $J.newArray(3, 0);
    for (let counter = 0; counter < 2; counter++) {
      if (this.components[counter] != null && this.components[counter].isVisible$()) {
        retValue[counter] = this.getMinimumSizeOfComponent(this.components[counter]);
      } else {
        retValue[counter] = -1;
      }
    }
    retValue[2] = (this.components[2] != null) ? this.getMinimumSizeOfComponent(this.components[2]) : -1;
    return retValue;
  }
  /**
   * Resets the components to their preferred sizes.
   */
  resetToPreferredSizes$int(availableSize: number): void {
    let testSizes = this.getPreferredSizes();
    let totalSize = 0;
    for (let counter = 0; counter < 3; counter++) {
      if (testSizes[counter] !== -1) {
        totalSize = (totalSize + testSizes[counter]) | 0;
      }
    }
    if (totalSize > availableSize) {
      testSizes = this.getMinimumSizes();
      totalSize = 0;
      for (let counter = 0; counter < 3; counter++) {
        if (testSizes[counter] !== -1) {
          totalSize = (totalSize + testSizes[counter]) | 0;
        }
      }
    }
    this.setSizes(testSizes);
    this.distributeSpace((availableSize - totalSize) | 0, false);
  }
  /**
   * Distributes <code>space</code> between the two components
   * (divider won't get any extra space) based on the weighting. This
   * attempts to honor the min size of the components.
   *
   * @param keepHidden if true and one of the components is 0x0
   *                   it gets none of the extra space
   */
  distributeSpace(space: number, keepHidden: boolean): void {
    let lValid = (this.components[0] != null && this.components[0].isVisible$());
    let rValid = (this.components[1] != null && this.components[1].isVisible$());
    if (keepHidden) {
      if (lValid && this.getSizeForPrimaryAxis$Dimension(this.components[0].getSize$()) === 0) {
        lValid = false;
        if (rValid && this.getSizeForPrimaryAxis$Dimension(this.components[1].getSize$()) === 0) {
          lValid = true;
        }
      } else if (rValid && this.getSizeForPrimaryAxis$Dimension(this.components[1].getSize$()) === 0) {
        rValid = false;
      }
    }
    if (lValid && rValid) {
      let weight = this.$outer.splitPane.getResizeWeight();
      let lExtra = $J.d2i((weight * space));
      let rExtra = ((space - lExtra) | 0);
      this.sizes[0] = (this.sizes[0] + lExtra) | 0;
      this.sizes[1] = (this.sizes[1] + rExtra) | 0;
      let lMin = this.getMinimumSizeOfComponent(this.components[0]);
      let rMin = this.getMinimumSizeOfComponent(this.components[1]);
      let lMinValid = (this.sizes[0] >= lMin);
      let rMinValid = (this.sizes[1] >= rMin);
      if (!lMinValid && !rMinValid) {
        if (this.sizes[0] < 0) {
          this.sizes[1] = (this.sizes[1] + this.sizes[0]) | 0;
          this.sizes[0] = 0;
        } else if (this.sizes[1] < 0) {
          this.sizes[0] = (this.sizes[0] + this.sizes[1]) | 0;
          this.sizes[1] = 0;
        }
      } else if (!lMinValid) {
        if (((this.sizes[1] - (lMin - this.sizes[0])) | 0) < rMin) {
          if (this.sizes[0] < 0) {
            this.sizes[1] = (this.sizes[1] + this.sizes[0]) | 0;
            this.sizes[0] = 0;
          }
        } else {
          this.sizes[1] = (this.sizes[1] - (lMin - this.sizes[0])) | 0;
          this.sizes[0] = lMin;
        }
      } else if (!rMinValid) {
        if (((this.sizes[0] - (rMin - this.sizes[1])) | 0) < lMin) {
          if (this.sizes[1] < 0) {
            this.sizes[0] = (this.sizes[0] + this.sizes[1]) | 0;
            this.sizes[1] = 0;
          }
        } else {
          this.sizes[0] = (this.sizes[0] - (rMin - this.sizes[1])) | 0;
          this.sizes[1] = rMin;
        }
      }
      if (this.sizes[0] < 0) {
        this.sizes[0] = 0;
      }
      if (this.sizes[1] < 0) {
        this.sizes[1] = 0;
      }
    } else if (lValid) {
      this.sizes[0] = Math.max(0, (this.sizes[0] + space) | 0);
    } else if (rValid) {
      this.sizes[1] = Math.max(0, (this.sizes[1] + space) | 0);
    }
  }
}

export class BasicSplitPaneUI$Handler extends JObject {
  _BasicSplitPaneUI$Handler(): this {
    return this;
  }
  /**
   * Messaged from the <code>JSplitPane</code> the receiver is
   * contained in.  May potentially reset the layout manager and cause a
   * <code>validate</code> to be sent.
   */
  propertyChange(e: PropertyChangeEvent): void {
    if (e.getSource() === this.$outer.splitPane) {
      let changeName = e.getPropertyName();
      if (changeName === JSplitPane.ORIENTATION_PROPERTY) {
        this.$outer.orientation = this.$outer.splitPane.getOrientation();
        this.$outer.resetLayoutManager();
      } else if (changeName === JSplitPane.CONTINUOUS_LAYOUT_PROPERTY) {
        this.$outer.setContinuousLayout(this.$outer.splitPane.isContinuousLayout());
        if (!this.$outer.isContinuousLayout()) {
          if (this.$outer.nonContinuousLayoutDivider == null) {
            this.$outer.setNonContinuousLayoutDivider$Component$boolean(this.$outer.createDefaultNonContinuousLayoutDivider(), true);
          } else if (this.$outer.nonContinuousLayoutDivider.getParent() == null) {
            this.$outer.setNonContinuousLayoutDivider$Component$boolean(this.$outer.nonContinuousLayoutDivider, true);
          }
        }
      } else if (changeName === JSplitPane.DIVIDER_SIZE_PROPERTY) {
        this.$outer.divider.setDividerSize(this.$outer.splitPane.getDividerSize());
        this.$outer.dividerSize = this.$outer.divider.getDividerSize();
        this.$outer.splitPane.revalidate();
        this.$outer.splitPane.repaint$();
      }
    }
  }
  focusGained(ev: FocusEvent): void {
    this.$outer.dividerKeyboardResize = true;
    this.$outer.splitPane.repaint$();
  }
  focusLost(ev: FocusEvent): void {
    this.$outer.dividerKeyboardResize = false;
    this.$outer.splitPane.repaint$();
  }
}

export class BasicSplitPaneUI$Actions extends UIAction {
  static readonly NEGATIVE_INCREMENT: string = 'negativeIncrement';
  static readonly POSITIVE_INCREMENT: string = 'positiveIncrement';
  static readonly SELECT_MIN: string = 'selectMin';
  static readonly SELECT_MAX: string = 'selectMax';
  static readonly START_RESIZE: string = 'startResize';
  static readonly TOGGLE_FOCUS: string = 'toggleFocus';
  static readonly FOCUS_OUT_FORWARD: string = 'focusOutForward';
  static readonly FOCUS_OUT_BACKWARD: string = 'focusOutBackward';
  _BasicSplitPaneUI$Actions(key: string): this {
    this._UIAction(key);
    return this;
  }
  actionPerformed(ev: ActionEvent): void {
    let splitPane = ev.getSource();
    let ui = BasicLookAndFeel.getUIOfType(splitPane.getUI(), $J.cls(BasicSplitPaneUI));
    if (ui == null) {
      return;
    }
    let key = this.getName();
    if (key === BasicSplitPaneUI$Actions.NEGATIVE_INCREMENT) {
      if (ui.dividerKeyboardResize) {
        splitPane.setDividerLocation$int(Math.max(0, (ui.getDividerLocation(splitPane) - ui.getKeyboardMoveIncrement()) | 0));
      }
    } else if (key === BasicSplitPaneUI$Actions.POSITIVE_INCREMENT) {
      if (ui.dividerKeyboardResize) {
        splitPane.setDividerLocation$int((ui.getDividerLocation(splitPane) + ui.getKeyboardMoveIncrement()) | 0);
      }
    } else if (key === BasicSplitPaneUI$Actions.SELECT_MIN) {
      if (ui.dividerKeyboardResize) {
        splitPane.setDividerLocation$int(0);
      }
    } else if (key === BasicSplitPaneUI$Actions.SELECT_MAX) {
      if (ui.dividerKeyboardResize) {
        let insets = splitPane.getInsets$();
        let bottomI = (insets != null) ? insets.bottom : 0;
        let rightI = (insets != null) ? insets.right : 0;
        if (ui.orientation === JSplitPane.VERTICAL_SPLIT) {
          splitPane.setDividerLocation$int((splitPane.getHeight() - bottomI) | 0);
        } else {
          splitPane.setDividerLocation$int((splitPane.getWidth() - rightI) | 0);
        }
      }
    } else if (key === BasicSplitPaneUI$Actions.START_RESIZE) {
      if (!ui.dividerKeyboardResize) {
        splitPane.requestFocus$();
      } else {
        let parentSplitPane = SwingUtilities.getAncestorOfClass($J.cls(JSplitPane), splitPane);
        if (parentSplitPane != null) {
          parentSplitPane.requestFocus$();
        }
      }
    } else if (key === BasicSplitPaneUI$Actions.TOGGLE_FOCUS) {
      this.toggleFocus(splitPane);
    } else if (key === BasicSplitPaneUI$Actions.FOCUS_OUT_FORWARD) {
      this.moveFocus(splitPane, 1);
    } else if (key === BasicSplitPaneUI$Actions.FOCUS_OUT_BACKWARD) {
      this.moveFocus(splitPane, -1);
    }
  }
  moveFocus(splitPane: JSplitPane, direction: number): void {
    let rootAncestor = splitPane.getFocusCycleRootAncestor();
    let policy = rootAncestor.getFocusTraversalPolicy();
    let focusOn = (direction > 0) ? policy.getComponentAfter(rootAncestor, splitPane) : policy.getComponentBefore(rootAncestor, splitPane);
    let focusFrom = new HashSet();
    if (splitPane.isAncestorOf(focusOn)) {
      do {
        focusFrom.add(focusOn);
        rootAncestor = focusOn.getFocusCycleRootAncestor();
        policy = rootAncestor.getFocusTraversalPolicy();
        focusOn = (direction > 0) ? policy.getComponentAfter(rootAncestor, focusOn) : policy.getComponentBefore(rootAncestor, focusOn);
      } while (splitPane.isAncestorOf(focusOn) && !focusFrom.contains(focusOn));
    }
    if (focusOn != null && !splitPane.isAncestorOf(focusOn)) {
      focusOn.requestFocus$();
    }
  }
  toggleFocus(splitPane: JSplitPane): void {
    let left = splitPane.getLeftComponent();
    let right = splitPane.getRightComponent();
    let manager = KeyboardFocusManager.getCurrentKeyboardFocusManager$();
    let focus = manager.getFocusOwner();
    let focusOn = this.getNextSide(splitPane, focus);
    if (focusOn != null) {
      if (focus != null && ((SwingUtilities.isDescendingFrom(focus, left) && SwingUtilities.isDescendingFrom(focusOn, left)) || (SwingUtilities.isDescendingFrom(focus, right) && SwingUtilities.isDescendingFrom(focusOn, right)))) {
        return;
      }
      SwingUtilities2.compositeRequestFocus(focusOn);
    }
  }
  getNextSide(splitPane: JSplitPane, focus: Component): Component {
    let left = splitPane.getLeftComponent();
    let right = splitPane.getRightComponent();
    let next: Component;
    if (focus != null && SwingUtilities.isDescendingFrom(focus, left) && right != null) {
      next = this.getFirstAvailableComponent(right);
      if (next != null) {
        return next;
      }
    }
    let parentSplitPane = SwingUtilities.getAncestorOfClass($J.cls(JSplitPane), splitPane);
    if (parentSplitPane != null) {
      next = this.getNextSide(parentSplitPane, focus);
    } else {
      next = this.getFirstAvailableComponent(left);
      if (next == null) {
        next = this.getFirstAvailableComponent(right);
      }
    }
    return next;
  }
  getFirstAvailableComponent(c: Component): Component {
    var sp;
    if ((sp = c) instanceof JSplitPane) {
      let left = this.getFirstAvailableComponent(sp.getLeftComponent());
      if (left != null) {
        c = left;
      } else {
        c = this.getFirstAvailableComponent(sp.getRightComponent());
      }
    }
    return c;
  }
}

let $BasicSplitPaneUI$1: any = null;
/** An anonymous class (BasicSplitPaneUI.java:904). */
function BasicSplitPaneUI$1(): any {
  return $BasicSplitPaneUI$1 ??= $J.local(class extends Canvas {
    paint(g: Graphics): void {
      if (!this.$outer.isContinuousLayout() && this.$outer.getLastDragLocation() !== -1) {
        let size = this.$outer.splitPane.getSize$();
        g.setColor(this.$outer.dividerDraggingColor);
        if (this.$outer.orientation === JSplitPane.HORIZONTAL_SPLIT) {
          g.fillRect(0, 0, (this.$outer.dividerSize - 1) | 0, (size.height_ - 1) | 0);
        } else {
          g.fillRect(0, 0, (size.width_ - 1) | 0, (this.$outer.dividerSize - 1) | 0);
        }
      }
    }
  }, 'javax.swing.plaf.basic.BasicSplitPaneUI$1', []);
}

$J.define(BasicSplitPaneUI, 'javax.swing.plaf.basic.BasicSplitPaneUI', { kind: 'class', sup: 'javax.swing.plaf.SplitPaneUI', ctors: { '': '_BasicSplitPaneUI' }, meths: { 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent', 'setNonContinuousLayoutDivider(java.awt.Component,boolean)': 'setNonContinuousLayoutDivider$Component$boolean', 'setNonContinuousLayoutDivider(java.awt.Component)': 'setNonContinuousLayoutDivider$Component' }, clinit: true, lazy: ['KEYBOARD_DIVIDER_MOVE_OFFSET'] });
$J.define(BasicSplitPaneUI$BasicHorizontalLayoutManager, 'javax.swing.plaf.basic.BasicSplitPaneUI$BasicHorizontalLayoutManager', { kind: 'class', ifaces: ['java.awt.LayoutManager2'], sup: 'java.lang.Object', ctors: { 'int': '_BasicSplitPaneUI$BasicHorizontalLayoutManager$int', '': '_BasicSplitPaneUI$BasicHorizontalLayoutManager$' }, meths: { 'resetToPreferredSizes(int)': 'resetToPreferredSizes$int', 'getSizeForSecondaryAxis(java.awt.Insets,boolean)': 'getSizeForSecondaryAxis$Insets$boolean', 'getSizeForPrimaryAxis(java.awt.Insets,boolean)': 'getSizeForPrimaryAxis$Insets$boolean', 'getSizeForSecondaryAxis(java.awt.Dimension)': 'getSizeForSecondaryAxis$Dimension', 'getSizeForPrimaryAxis(java.awt.Dimension)': 'getSizeForPrimaryAxis$Dimension', 'resetToPreferredSizes()': 'resetToPreferredSizes$', 'addLayoutComponent(java.awt.Component,java.lang.Object)': 'addLayoutComponent$Component$Object', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component', 'layoutContainer(java.awt.Container)': 'layoutContainer$Container' }, inner: true });
$J.define(BasicSplitPaneUI$Handler, 'javax.swing.plaf.basic.BasicSplitPaneUI$Handler', { kind: 'class', ifaces: ['java.awt.event.FocusListener', 'java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_BasicSplitPaneUI$Handler' }, inner: true });
$J.define(BasicSplitPaneUI$Actions, 'javax.swing.plaf.basic.BasicSplitPaneUI$Actions', { kind: 'class', sup: 'sun.swing.UIAction', ctors: { 'java.lang.String': '_BasicSplitPaneUI$Actions' } });
$J.module(() => {
  Canvas = $J.load('java.awt.Canvas');
  Dimension = $J.load('java.awt.Dimension');
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  InputEvent = $J.load('java.awt.event.InputEvent');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  JComponent = $J.load('javax.swing.JComponent');
  JSplitPane = $J.load('javax.swing.JSplitPane');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicLookAndFeel = $J.load('javax.swing.plaf.basic.BasicLookAndFeel');
  BasicSplitPaneDivider = $J.load('javax.swing.plaf.basic.BasicSplitPaneDivider');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
