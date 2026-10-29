// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicTabbedPaneUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2025, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Hashtable, IllegalArgumentException, JObject, JString, Vector } from '../../../../../jre/index.ts';
import { TabbedPaneUI } from '../TabbedPaneUI.ts';
import { UIAction } from '../../../../sun/swing/UIAction.ts';
import { JViewport } from '../../JViewport.ts';
import { JPanel } from '../../JPanel.ts';
import { BasicArrowButton } from './BasicArrowButton.ts';

let Component$BaselineResizeBehavior, Dimension, Graphics2D, Insets, Point, Polygon, Rectangle, ActionEvent, FocusEvent$Cause, JComponent, JTabbedPane, KeyStroke, LookAndFeel, SwingConstants, SwingUtilities, UIManager, ComponentInputMapUIResource, UIResource, BasicGraphicsUtils, BasicHTML, BasicLookAndFeel, LazyActionMap, View, DefaultLookup, SwingUtilities2;

/**
 * A Basic L&amp;F implementation of TabbedPaneUI.
 *
 * @author Amy Fowler
 * @author Philip Milne
 * @author Steve Wilson
 * @author Tom Santos
 * @author Dave Moore
 */
export class BasicTabbedPaneUI extends TabbedPaneUI {
  /**
   * The tab pane
   */
  tabPane: JTabbedPane = null;
  /**
   * Highlight color
   */
  highlight: Color = null;
  /**
   * Light highlight color
   */
  lightHighlight: Color = null;
  /**
   * Shadow color
   */
  shadow: Color = null;
  /**
   * Dark shadow color
   */
  darkShadow: Color = null;
  /**
   * Focus color
   */
  focus: Color = null;
  selectedColor: Color = null;
  /**
   * Text icon gap
   */
  textIconGap: number = 0;
  /**
   * Tab run overlay
   */
  tabRunOverlay: number = 0;
  /**
   * Tab insets
   */
  tabInsets: Insets = null;
  /**
   * Selected tab insets
   */
  selectedTabPadInsets: Insets = null;
  /**
   * Tab area insets
   */
  tabAreaInsets: Insets = null;
  /**
   * Content border insets
   */
  contentBorderInsets: Insets = null;
  tabsOverlapBorder: boolean = false;
  tabsOpaque: boolean = false;
  contentOpaque: boolean = false;
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
   * Tab runs
   */
  tabRuns: number[] = null;
  /**
   * Run count
   */
  runCount: number = 0;
  /**
   * Selected run
   */
  selectedRun: number = 0;
  /**
   * Tab rects
   */
  rects: Rectangle[] = null;
  /**
   * Maximum tab height
   */
  maxTabHeight: number = 0;
  /**
   * Maximum tab width
   */
  maxTabWidth: number = 0;
  /**
   * Tab change listener
   */
  tabChangeListener: ChangeListener = null;
  /**
   * Property change listener
   */
  propertyChangeListener: PropertyChangeListener = null;
  /**
   * Mouse change listener
   */
  mouseListener: MouseListener = null;
  /**
   * Focus change listener
   */
  focusListener: FocusListener = null;
  currentPadInsets: Insets = null;
  currentTabAreaInsets: Insets = null;
  visibleComponent: Component = null;
  htmlViews: Vector<View> = null;
  mnemonicToIndexMap: Hashtable<number, number> = null;
  /**
   * InputMap used for mnemonics. Only non-null if the JTabbedPane has
   * mnemonics associated with it. Lazily created in initMnemonics.
   */
  mnemonicInputMap: InputMap = null;
  tabScroller: BasicTabbedPaneUI$ScrollableTabSupport = null;
  tabContainer: BasicTabbedPaneUI$TabContainer = null;
  /**
   * A rectangle used for general layout calculations in order
   * to avoid constructing many new Rectangles on the fly.
   */
  calcRect: Rectangle = null;
  /**
   * Tab that has focus.
   */
  focusIndex: number = 0;
  /**
   * Combined listeners.
   */
  handler: BasicTabbedPaneUI$Handler = null;
  /**
   * Index of the tab the mouse is over.
   */
  rolloverTabIndex: number = 0;
  /**
   * This is set to true when a component is added/removed from the tab
   * pane and set to false when layout happens.  If true it indicates that
   * tabRuns is not valid and shouldn't be used.
   */
  isRunsDirty: boolean = false;
  calculatedBaseline: boolean = false;
  baseline: number = 0;
  static xCropLen: number[] = null;
  static yCropLen: number[] = null;
  static readonly CROP_SEGMENT: number = 12;
  /**
   * Constructs a {@code BasicTabbedPaneUI}.
   */
  _BasicTabbedPaneUI(): this {
    this._TabbedPaneUI();
    this.tabsOpaque = true;
    this.contentOpaque = true;
    this.tabRuns = $J.newArray(10, 0);
    this.runCount = 0;
    this.selectedRun = -1;
    this.rects = $J.newArray(0, null);
    this.currentPadInsets = new Insets()._Insets(0, 0, 0, 0);
    this.currentTabAreaInsets = new Insets()._Insets(0, 0, 0, 0);
    this.calcRect = new Rectangle()._Rectangle$int$int$int$int(0, 0, 0, 0);
    return this;
  }
  /**
   * Creates a UI.
   * @param c a component
   * @return a UI
   */
  static createUI(c: JComponent): ComponentUI {
    return new BasicTabbedPaneUI()._BasicTabbedPaneUI();
  }
  static loadActionMap(map: LazyActionMap): void {
    map.put$Action(new BasicTabbedPaneUI$Actions()._BasicTabbedPaneUI$Actions(BasicTabbedPaneUI$Actions.NEXT));
    map.put$Action(new BasicTabbedPaneUI$Actions()._BasicTabbedPaneUI$Actions(BasicTabbedPaneUI$Actions.PREVIOUS));
    map.put$Action(new BasicTabbedPaneUI$Actions()._BasicTabbedPaneUI$Actions(BasicTabbedPaneUI$Actions.RIGHT));
    map.put$Action(new BasicTabbedPaneUI$Actions()._BasicTabbedPaneUI$Actions(BasicTabbedPaneUI$Actions.LEFT));
    map.put$Action(new BasicTabbedPaneUI$Actions()._BasicTabbedPaneUI$Actions(BasicTabbedPaneUI$Actions.UP));
    map.put$Action(new BasicTabbedPaneUI$Actions()._BasicTabbedPaneUI$Actions(BasicTabbedPaneUI$Actions.DOWN));
    map.put$Action(new BasicTabbedPaneUI$Actions()._BasicTabbedPaneUI$Actions(BasicTabbedPaneUI$Actions.PAGE_UP));
    map.put$Action(new BasicTabbedPaneUI$Actions()._BasicTabbedPaneUI$Actions(BasicTabbedPaneUI$Actions.PAGE_DOWN));
    map.put$Action(new BasicTabbedPaneUI$Actions()._BasicTabbedPaneUI$Actions(BasicTabbedPaneUI$Actions.REQUEST_FOCUS));
    map.put$Action(new BasicTabbedPaneUI$Actions()._BasicTabbedPaneUI$Actions(BasicTabbedPaneUI$Actions.REQUEST_FOCUS_FOR_VISIBLE));
    map.put$Action(new BasicTabbedPaneUI$Actions()._BasicTabbedPaneUI$Actions(BasicTabbedPaneUI$Actions.SET_SELECTED));
    map.put$Action(new BasicTabbedPaneUI$Actions()._BasicTabbedPaneUI$Actions(BasicTabbedPaneUI$Actions.SELECT_FOCUSED));
    map.put$Action(new BasicTabbedPaneUI$Actions()._BasicTabbedPaneUI$Actions(BasicTabbedPaneUI$Actions.SCROLL_FORWARD));
    map.put$Action(new BasicTabbedPaneUI$Actions()._BasicTabbedPaneUI$Actions(BasicTabbedPaneUI$Actions.SCROLL_BACKWARD));
  }
  installUI(c: JComponent): void {
    this.tabPane = c;
    this.calculatedBaseline = false;
    this.rolloverTabIndex = -1;
    this.focusIndex = -1;
    c.setLayout(this.createLayoutManager());
    this.installComponents();
    this.installDefaults();
    this.installListeners();
    this.installKeyboardActions();
  }
  uninstallUI(c: JComponent): void {
    this.uninstallKeyboardActions();
    this.uninstallListeners();
    this.uninstallDefaults();
    this.uninstallComponents();
    c.setLayout(null);
    this.tabPane = null;
  }
  /**
   * Invoked by <code>installUI</code> to create
   * a layout manager object to manage
   * the <code>JTabbedPane</code>.
   *
   * @return a layout manager object
   *
   * @see TabbedPaneLayout
   * @see javax.swing.JTabbedPane#getTabLayoutPolicy
   */
  createLayoutManager(): LayoutManager {
    if (this.tabPane.getTabLayoutPolicy() === JTabbedPane.SCROLL_TAB_LAYOUT) {
      return new BasicTabbedPaneUI$TabbedPaneScrollLayout().$o(this)._BasicTabbedPaneUI$TabbedPaneScrollLayout();
    } else {
      return new BasicTabbedPaneUI$TabbedPaneLayout().$o(this)._BasicTabbedPaneUI$TabbedPaneLayout();
    }
  }
  scrollableTabLayoutEnabled(): boolean {
    return (this.tabPane.getLayout() instanceof BasicTabbedPaneUI$TabbedPaneScrollLayout);
  }
  /**
   * Creates and installs any required subcomponents for the JTabbedPane.
   * Invoked by installUI.
   *
   * @since 1.4
   */
  installComponents(): void {
    if (this.scrollableTabLayoutEnabled()) {
      if (this.tabScroller == null) {
        this.tabScroller = new BasicTabbedPaneUI$ScrollableTabSupport().$o(this)._BasicTabbedPaneUI$ScrollableTabSupport(this.tabPane.getTabPlacement());
        this.tabPane.add$Component(this.tabScroller.viewport);
      }
    }
    this.installTabContainer();
  }
  installTabContainer(): void {
    for (let i = 0; i < this.tabPane.getTabCount(); i++) {
      let tabComponent = this.tabPane.getTabComponentAt(i);
      if (tabComponent != null) {
        if (this.tabContainer == null) {
          this.tabContainer = new BasicTabbedPaneUI$TabContainer().$o(this)._BasicTabbedPaneUI$TabContainer();
        }
        this.tabContainer.add$Component(tabComponent);
      }
    }
    if (this.tabContainer == null) {
      return;
    }
    if (this.scrollableTabLayoutEnabled()) {
      this.tabScroller.tabPanel.add$Component(this.tabContainer);
    } else {
      this.tabPane.add$Component(this.tabContainer);
    }
  }
  /**
   * Creates and returns a JButton that will provide the user
   * with a way to scroll the tabs in a particular direction. The
   * returned JButton must be instance of UIResource.
   *
   * @param direction One of the SwingConstants constants:
   * SOUTH, NORTH, EAST or WEST
   * @return Widget for user to
   * @see javax.swing.JTabbedPane#setTabPlacement
   * @see javax.swing.SwingConstants
   * @throws IllegalArgumentException if direction is not one of
   *         NORTH, SOUTH, EAST or WEST
   * @since 1.5
   */
  createScrollButton(direction: number): JButton {
    if (direction !== SwingConstants.SOUTH && direction !== SwingConstants.NORTH && direction !== SwingConstants.EAST && direction !== SwingConstants.WEST) {
      throw new IllegalArgumentException('Direction must be one of: SOUTH, NORTH, EAST or WEST');
    }
    return new BasicTabbedPaneUI$ScrollableTabButton()._BasicTabbedPaneUI$ScrollableTabButton(direction);
  }
  /**
   * Removes any installed subcomponents from the JTabbedPane.
   * Invoked by uninstallUI.
   *
   * @since 1.4
   */
  uninstallComponents(): void {
    this.uninstallTabContainer();
    if (this.scrollableTabLayoutEnabled()) {
      this.tabPane.remove$Component(this.tabScroller.viewport);
      this.tabPane.remove$Component(this.tabScroller.scrollForwardButton);
      this.tabPane.remove$Component(this.tabScroller.scrollBackwardButton);
      this.tabScroller = null;
    }
  }
  uninstallTabContainer(): void {
    if (this.tabContainer == null) {
      return;
    }
    this.tabContainer.notifyTabbedPane = false;
    this.tabContainer.removeAll();
    if (this.scrollableTabLayoutEnabled()) {
      this.tabContainer.remove$Component(this.tabScroller.croppedEdge);
      this.tabScroller.tabPanel.remove$Component(this.tabContainer);
    } else {
      this.tabPane.remove$Component(this.tabContainer);
    }
    this.tabContainer = null;
  }
  /**
   * Installs the defaults.
   */
  installDefaults(): void {
    LookAndFeel.installColorsAndFont(this.tabPane, 'TabbedPane.background', 'TabbedPane.foreground', 'TabbedPane.font');
    this.highlight = UIManager.getColor$Object('TabbedPane.light');
    this.lightHighlight = UIManager.getColor$Object('TabbedPane.highlight');
    this.shadow = UIManager.getColor$Object('TabbedPane.shadow');
    this.darkShadow = UIManager.getColor$Object('TabbedPane.darkShadow');
    this.focus = UIManager.getColor$Object('TabbedPane.focus');
    this.selectedColor = UIManager.getColor$Object('TabbedPane.selected');
    this.textIconGap = UIManager.getInt$Object('TabbedPane.textIconGap');
    this.tabInsets = UIManager.getInsets$Object('TabbedPane.tabInsets');
    this.selectedTabPadInsets = UIManager.getInsets$Object('TabbedPane.selectedTabPadInsets');
    this.tabAreaInsets = UIManager.getInsets$Object('TabbedPane.tabAreaInsets');
    this.tabsOverlapBorder = UIManager.getBoolean$Object('TabbedPane.tabsOverlapBorder');
    this.contentBorderInsets = UIManager.getInsets$Object('TabbedPane.contentBorderInsets');
    this.tabRunOverlay = UIManager.getInt$Object('TabbedPane.tabRunOverlay');
    this.tabsOpaque = UIManager.getBoolean$Object('TabbedPane.tabsOpaque');
    this.contentOpaque = UIManager.getBoolean$Object('TabbedPane.contentOpaque');
    let opaque = UIManager.get$Object('TabbedPane.opaque');
    if (opaque == null) {
      opaque = false;
    }
    LookAndFeel.installProperty(this.tabPane, 'opaque', opaque);
    if (this.tabInsets == null) {
      this.tabInsets = new Insets()._Insets(0, 4, 1, 4);
    }
    if (this.selectedTabPadInsets == null) {
      this.selectedTabPadInsets = new Insets()._Insets(2, 2, 2, 1);
    }
    if (this.tabAreaInsets == null) {
      this.tabAreaInsets = new Insets()._Insets(3, 2, 0, 2);
    }
    if (this.contentBorderInsets == null) {
      this.contentBorderInsets = new Insets()._Insets(2, 2, 3, 3);
    }
  }
  /**
   * Uninstalls the defaults.
   */
  uninstallDefaults(): void {
    this.highlight = null;
    this.lightHighlight = null;
    this.shadow = null;
    this.darkShadow = null;
    this.focus = null;
    this.tabInsets = null;
    this.selectedTabPadInsets = null;
    this.tabAreaInsets = null;
    this.contentBorderInsets = null;
  }
  /**
   * Installs the listeners.
   */
  installListeners(): void {
    if ((this.propertyChangeListener = this.createPropertyChangeListener()) != null) {
      this.tabPane.addPropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    }
    if ((this.tabChangeListener = this.createChangeListener()) != null) {
      this.tabPane.addChangeListener(this.tabChangeListener);
    }
    if ((this.mouseListener = this.createMouseListener()) != null) {
      this.tabPane.addMouseListener(this.mouseListener);
    }
    this.tabPane.addMouseMotionListener(this.getHandler());
    if ((this.focusListener = this.createFocusListener()) != null) {
      this.tabPane.addFocusListener(this.focusListener);
    }
    this.tabPane.addContainerListener(this.getHandler());
    if (this.tabPane.getTabCount() > 0) {
      let htmlDisabled = this.tabPane.getClientProperty('html.disable');
      if (!($J.equals(true, htmlDisabled))) {
        this.htmlViews = this.createHTMLVector();
      }
    }
  }
  /**
   * Uninstalls the listeners.
   */
  uninstallListeners(): void {
    if (this.mouseListener != null) {
      this.tabPane.removeMouseListener(this.mouseListener);
      this.mouseListener = null;
    }
    this.tabPane.removeMouseMotionListener(this.getHandler());
    if (this.focusListener != null) {
      this.tabPane.removeFocusListener(this.focusListener);
      this.focusListener = null;
    }
    this.tabPane.removeContainerListener(this.getHandler());
    if (this.htmlViews != null) {
      this.htmlViews.removeAllElements();
      this.htmlViews = null;
    }
    if (this.tabChangeListener != null) {
      this.tabPane.removeChangeListener(this.tabChangeListener);
      this.tabChangeListener = null;
    }
    if (this.propertyChangeListener != null) {
      this.tabPane.removePropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
      this.propertyChangeListener = null;
    }
    this.handler = null;
  }
  /**
   * Creates a mouse listener.
   * @return a mouse listener
   */
  createMouseListener(): MouseListener {
    return this.getHandler();
  }
  /**
   * Creates a focus listener.
   * @return a focus listener
   */
  createFocusListener(): FocusListener {
    return this.getHandler();
  }
  /**
   * Creates a change listener.
   * @return a change listener
   */
  createChangeListener(): ChangeListener {
    return $J.fn(this.getHandler(), 'stateChanged');
  }
  /**
   * Creates a property change listener.
   * @return a property change listener
   */
  createPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
  getHandler(): BasicTabbedPaneUI$Handler {
    if (this.handler == null) {
      this.handler = new BasicTabbedPaneUI$Handler().$o(this)._BasicTabbedPaneUI$Handler();
    }
    return this.handler;
  }
  /**
   * Installs the keyboard actions.
   */
  installKeyboardActions(): void {
    let km = this.getInputMap(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT);
    SwingUtilities.replaceUIInputMap(this.tabPane, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, km);
    km = this.getInputMap(JComponent.WHEN_FOCUSED);
    SwingUtilities.replaceUIInputMap(this.tabPane, JComponent.WHEN_FOCUSED, km);
    LazyActionMap.installLazyActionMap(this.tabPane, $J.cls(BasicTabbedPaneUI), 'TabbedPane.actionMap');
    this.updateMnemonics();
  }
  getInputMap(condition: number): InputMap {
    if (condition === JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT) {
      return DefaultLookup.get(this.tabPane, this, 'TabbedPane.ancestorInputMap');
    } else if (condition === JComponent.WHEN_FOCUSED) {
      return DefaultLookup.get(this.tabPane, this, 'TabbedPane.focusInputMap');
    }
    return null;
  }
  /**
   * Uninstalls the keyboard actions.
   */
  uninstallKeyboardActions(): void {
    SwingUtilities.replaceUIActionMap(this.tabPane, null);
    SwingUtilities.replaceUIInputMap(this.tabPane, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, null);
    SwingUtilities.replaceUIInputMap(this.tabPane, JComponent.WHEN_FOCUSED, null);
    SwingUtilities.replaceUIInputMap(this.tabPane, JComponent.WHEN_IN_FOCUSED_WINDOW, null);
    this.mnemonicToIndexMap = null;
    this.mnemonicInputMap = null;
  }
  /**
   * Reloads the mnemonics. This should be invoked when a memonic changes,
   * when the title of a mnemonic changes, or when tabs are added/removed.
   */
  updateMnemonics(): void {
    this.resetMnemonics();
    for (let counter = (this.tabPane.getTabCount() - 1) | 0; counter >= 0; counter--) {
      let mnemonic = this.tabPane.getMnemonicAt(counter);
      if (mnemonic > 0) {
        this.addMnemonic(counter, mnemonic);
      }
    }
  }
  /**
   * Resets the mnemonics bindings to an empty state.
   */
  resetMnemonics(): void {
    if (this.mnemonicToIndexMap != null) {
      this.mnemonicToIndexMap.clear();
      this.mnemonicInputMap.clear();
    }
  }
  /**
   * Adds the specified mnemonic at the specified index.
   */
  addMnemonic(index: number, mnemonic: number): void {
    if (this.mnemonicToIndexMap == null) {
      this.initMnemonics();
    }
    this.mnemonicInputMap.put(KeyStroke.getKeyStroke$int$int(mnemonic, BasicLookAndFeel.getFocusAcceleratorKeyMask()), 'setSelectedIndex');
    this.mnemonicInputMap.put(KeyStroke.getKeyStroke$int$int(mnemonic, SwingUtilities2.setAltGraphMask(BasicLookAndFeel.getFocusAcceleratorKeyMask())), 'setSelectedIndex');
    this.mnemonicToIndexMap.put(mnemonic, index);
  }
  /**
   * Installs the state needed for mnemonics.
   */
  initMnemonics(): void {
    this.mnemonicToIndexMap = new Hashtable();
    this.mnemonicInputMap = new ComponentInputMapUIResource()._ComponentInputMapUIResource(this.tabPane);
    this.mnemonicInputMap.setParent(SwingUtilities.getUIInputMap(this.tabPane, JComponent.WHEN_IN_FOCUSED_WINDOW));
    SwingUtilities.replaceUIInputMap(this.tabPane, JComponent.WHEN_IN_FOCUSED_WINDOW, this.mnemonicInputMap);
  }
  /**
   * Sets the tab the mouse is over by location. This is a cover method
   * for <code>setRolloverTab(tabForCoordinate(x, y, false))</code>.
   */
  setRolloverTab$int$int$BasicTabbedPaneUI(x: number, y: number): void {
    this.setRolloverTab$int(this.tabForCoordinate$JTabbedPane$int$int$boolean$BasicTabbedPaneUI(this.tabPane, x, y, false));
  }
  /**
   * Sets the tab the mouse is currently over to <code>index</code>.
   * <code>index</code> will be -1 if the mouse is no longer over any
   * tab. No checking is done to ensure the passed in index identifies a
   * valid tab.
   *
   * @param index Index of the tab the mouse is over.
   * @since 1.5
   */
  setRolloverTab$int(index: number): void {
    this.rolloverTabIndex = index;
  }
  getMinimumSize(c: JComponent): Dimension {
    return null;
  }
  getMaximumSize(c: JComponent): Dimension {
    return null;
  }
  /**
   * Returns the baseline.
   *
   * @throws NullPointerException {@inheritDoc}
   * @throws IllegalArgumentException {@inheritDoc}
   * @see javax.swing.JComponent#getBaseline(int, int)
   * @since 1.6
   */
  getBaseline$JComponent$int$int(c: JComponent, width: number, height: number): number {
    super.getBaseline$JComponent$int$int(c, width, height);
    let baseline = this.calculateBaselineIfNecessary();
    if (baseline !== -1) {
      let placement = this.tabPane.getTabPlacement();
      let insets = this.tabPane.getInsets$();
      let tabAreaInsets = this.getTabAreaInsets(placement);
      switch (placement) {
        case SwingConstants.TOP:
          baseline = (baseline + (insets.top + tabAreaInsets.top)) | 0;
          return baseline;
        case SwingConstants.BOTTOM:
          baseline = (height - insets.bottom - tabAreaInsets.bottom - this.maxTabHeight + baseline) | 0;
          return baseline;
        case SwingConstants.LEFT:
        case SwingConstants.RIGHT:
          baseline = (baseline + (insets.top + tabAreaInsets.top)) | 0;
          return baseline;
      }
    }
    return -1;
  }
  /**
   * Returns an enum indicating how the baseline of the component
   * changes as the size changes.
   *
   * @throws NullPointerException {@inheritDoc}
   * @see javax.swing.JComponent#getBaseline(int, int)
   * @since 1.6
   */
  getBaselineResizeBehavior(c: JComponent): Component$BaselineResizeBehavior {
    super.getBaselineResizeBehavior(c);
    switch (this.tabPane.getTabPlacement()) {
      case SwingConstants.LEFT:
      case SwingConstants.RIGHT:
      case SwingConstants.TOP:
        return Component$BaselineResizeBehavior.CONSTANT_ASCENT;
      case SwingConstants.BOTTOM:
        return Component$BaselineResizeBehavior.CONSTANT_DESCENT;
    }
    return Component$BaselineResizeBehavior.OTHER;
  }
  /**
   * Returns the baseline for the specified tab.
   *
   * @param tab index of tab to get baseline for
   * @throws IndexOutOfBoundsException if index is out of range
   *            (index &lt; 0 || index &gt;= tab count)
   * @return baseline or a value &lt; 0 indicating there is no reasonable
   *                  baseline
   * @since 1.6
   */
  getBaseline$int(tab: number): number {
    if (this.tabPane.getTabComponentAt(tab) != null) {
      let offset = this.getBaselineOffset();
      if (offset !== 0) {
        return -1;
      }
      let c = this.tabPane.getTabComponentAt(tab);
      let pref = c.getPreferredSize$();
      let tabInsets = this.getTabInsets(this.tabPane.getTabPlacement(), tab);
      let cellHeight = (this.maxTabHeight - tabInsets.top - tabInsets.bottom) | 0;
      return (c.getBaseline(pref.width_, pref.height_) + $J.idiv(((cellHeight - pref.height_) | 0), 2) + tabInsets.top) | 0;
    } else {
      let view = this.getTextViewForTab(tab);
      if (view != null) {
        let viewHeight = $J.d2i(view.getPreferredSpan(View.Y_AXIS));
        let baseline = BasicHTML.getHTMLBaseline(view, $J.d2i(view.getPreferredSpan(View.X_AXIS)), viewHeight);
        if (baseline >= 0) {
          return ($J.idiv(this.maxTabHeight, 2) - $J.idiv(viewHeight, 2) + baseline + this.getBaselineOffset()) | 0;
        }
        return -1;
      }
    }
    let metrics = this.getFontMetrics();
    let fontHeight = metrics.getHeight();
    let fontBaseline = metrics.getAscent();
    return ($J.idiv(this.maxTabHeight, 2) - $J.idiv(fontHeight, 2) + fontBaseline + this.getBaselineOffset()) | 0;
  }
  /**
   * Returns the amount the baseline is offset by.  This is typically
   * the same as <code>getTabLabelShiftY</code>.
   *
   * @return amount to offset the baseline by
   * @since 1.6
   */
  getBaselineOffset(): number {
    switch (this.tabPane.getTabPlacement()) {
      case SwingConstants.TOP:
        if (this.tabPane.getTabCount() > 1) {
          return 1;
        } else {
          return -1;
        }
      case SwingConstants.BOTTOM:
        if (this.tabPane.getTabCount() > 1) {
          return -1;
        } else {
          return 1;
        }
      default:
        return (this.maxTabHeight % 2);
    }
  }
  calculateBaselineIfNecessary(): number {
    if (!this.calculatedBaseline) {
      this.calculatedBaseline = true;
      this.baseline = -1;
      if (this.tabPane.getTabCount() > 0) {
        this.calculateBaseline();
      }
    }
    return this.baseline;
  }
  calculateBaseline(): void {
    let tabCount = this.tabPane.getTabCount();
    let tabPlacement = this.tabPane.getTabPlacement();
    this.maxTabHeight = this.calculateMaxTabHeight(tabPlacement);
    this.baseline = this.getBaseline$int(0);
    if (this.isHorizontalTabPlacement()) {
      for (let i = 1; i < tabCount; i++) {
        if (this.getBaseline$int(i) !== this.baseline) {
          this.baseline = -1;
          break;
        }
      }
    } else {
      let fontMetrics = this.getFontMetrics();
      let fontHeight = fontMetrics.getHeight();
      let height = this.calculateTabHeight(tabPlacement, 0, fontHeight);
      for (let i = 1; i < tabCount; i++) {
        let newHeight = this.calculateTabHeight(tabPlacement, i, fontHeight);
        if (height !== newHeight) {
          this.baseline = -1;
          break;
        }
      }
    }
  }
  paint(g: Graphics, c: JComponent): void {
    let selectedIndex = this.tabPane.getSelectedIndex();
    let tabPlacement = this.tabPane.getTabPlacement();
    this.ensureCurrentLayout();
    if (this.tabsOverlapBorder) {
      this.paintContentBorder(g, tabPlacement, selectedIndex);
    }
    if (!this.scrollableTabLayoutEnabled()) {
      this.paintTabArea(g, tabPlacement, selectedIndex);
    }
    if (!this.tabsOverlapBorder) {
      this.paintContentBorder(g, tabPlacement, selectedIndex);
    }
  }
  /**
   * Paints the tabs in the tab area.
   * Invoked by paint().
   * The graphics parameter must be a valid <code>Graphics</code>
   * object.  Tab placement may be either:
   * <code>JTabbedPane.TOP</code>, <code>JTabbedPane.BOTTOM</code>,
   * <code>JTabbedPane.LEFT</code>, or <code>JTabbedPane.RIGHT</code>.
   * The selected index must be a valid tabbed pane tab index (0 to
   * tab count - 1, inclusive) or -1 if no tab is currently selected.
   * The handling of invalid parameters is unspecified.
   *
   * @param g the graphics object to use for rendering
   * @param tabPlacement the placement for the tabs within the JTabbedPane
   * @param selectedIndex the tab index of the selected component
   *
   * @since 1.4
   */
  paintTabArea(g: Graphics, tabPlacement: number, selectedIndex: number): void {
    let tabCount = this.tabPane.getTabCount();
    let iconRect = new Rectangle()._Rectangle$();
    let textRect = new Rectangle()._Rectangle$();
    let clipRect = g.getClipBounds$();
    for (let i = (this.runCount - 1) | 0; i >= 0; i--) {
      let start = this.tabRuns[i];
      let next = this.tabRuns[(i === ((this.runCount - 1) | 0)) ? 0 : (i + 1) | 0];
      let end = (next !== 0 ? (next - 1) | 0 : (tabCount - 1) | 0);
      for (let j = start; j <= end; j++) {
        if (j !== selectedIndex && this.rects[j].intersects$Rectangle(clipRect)) {
          this.paintTab(g, tabPlacement, this.rects, j, iconRect, textRect);
        }
      }
    }
    if (selectedIndex >= 0 && this.rects[selectedIndex].intersects$Rectangle(clipRect)) {
      this.paintTab(g, tabPlacement, this.rects, selectedIndex, iconRect, textRect);
    }
  }
  /**
   * Paints a tab.
   * @param g the graphics
   * @param tabPlacement the tab placement
   * @param rects the tab rectangles
   * @param tabIndex the tab index
   * @param iconRect the icon rectangle
   * @param textRect the text rectangle
   */
  paintTab(g: Graphics, tabPlacement: number, rects: Rectangle[], tabIndex: number, iconRect: Rectangle, textRect: Rectangle): void {
    let tabRect = rects[tabIndex];
    let selectedIndex = this.tabPane.getSelectedIndex();
    let isSelected = selectedIndex === tabIndex;
    if (this.tabsOpaque || this.tabPane.isOpaque()) {
      this.paintTabBackground(g, tabPlacement, tabIndex, tabRect.x_, tabRect.y_, tabRect.width_, tabRect.height_, isSelected);
    }
    this.paintTabBorder(g, tabPlacement, tabIndex, tabRect.x_, tabRect.y_, tabRect.width_, tabRect.height_, isSelected);
    let title = this.tabPane.getTitleAt(tabIndex);
    let font = this.tabPane.getFont();
    let metrics = SwingUtilities2.getFontMetrics$JComponent$Graphics$Font(this.tabPane, g, font);
    let icon = this.getIconForTab(tabIndex);
    this.layoutLabel(tabPlacement, metrics, tabIndex, title, icon, tabRect, iconRect, textRect, isSelected);
    if (this.tabPane.getTabComponentAt(tabIndex) == null) {
      let clippedTitle = title;
      if (this.scrollableTabLayoutEnabled() && this.tabScroller.croppedEdge.isParamsSet() && this.tabScroller.croppedEdge.getTabIndex() === tabIndex && this.isHorizontalTabPlacement()) {
        let availTextWidth = (this.tabScroller.croppedEdge.getCropline() - (textRect.x_ - tabRect.x_) - this.tabScroller.croppedEdge.getCroppedSideWidth()) | 0;
        clippedTitle = SwingUtilities2.clipStringIfNecessary(null, metrics, title, availTextWidth);
      } else if (!this.scrollableTabLayoutEnabled() && this.isHorizontalTabPlacement()) {
        clippedTitle = SwingUtilities2.clipStringIfNecessary(null, metrics, title, textRect.width_);
      }
      this.paintText(g, tabPlacement, font, metrics, tabIndex, clippedTitle, textRect, isSelected);
      this.paintIcon(g, tabPlacement, tabIndex, icon, iconRect, isSelected);
    }
    this.paintFocusIndicator(g, tabPlacement, rects, tabIndex, iconRect, textRect, isSelected);
  }
  isHorizontalTabPlacement(): boolean {
    return this.tabPane.getTabPlacement() === SwingConstants.TOP || this.tabPane.getTabPlacement() === SwingConstants.BOTTOM;
  }
  static createCroppedTabShape(tabPlacement: number, tabRect: Rectangle, cropline: number): Polygon {
    let rlen: number;
    let start: number;
    let end: number;
    let ostart: number;
    switch (tabPlacement) {
      case SwingConstants.LEFT:
      case SwingConstants.RIGHT:
        rlen = tabRect.width_;
        start = tabRect.x_;
        end = (tabRect.x_ + tabRect.width_) | 0;
        ostart = (tabRect.y_ + tabRect.height_) | 0;
        break;
      case SwingConstants.TOP:
      case SwingConstants.BOTTOM:
      default:
        rlen = tabRect.height_;
        start = tabRect.y_;
        end = (tabRect.y_ + tabRect.height_) | 0;
        ostart = (tabRect.x_ + tabRect.width_) | 0;
    }
    let rcnt = $J.idiv(rlen, BasicTabbedPaneUI.CROP_SEGMENT);
    if (rlen % BasicTabbedPaneUI.CROP_SEGMENT > 0) {
      rcnt++;
    }
    let npts = (2 + (Math.imul(rcnt, 8))) | 0;
    let xp = $J.newArray(npts, 0);
    let yp = $J.newArray(npts, 0);
    let pcnt = 0;
    xp[pcnt] = ostart;
    yp[pcnt++] = end;
    xp[pcnt] = ostart;
    yp[pcnt++] = start;
    for (let i = 0; i < rcnt; i++) {
      for (let j = 0; j < BasicTabbedPaneUI.xCropLen.length; j++) {
        xp[pcnt] = (cropline - BasicTabbedPaneUI.xCropLen[j]) | 0;
        yp[pcnt] = (start + (Math.imul(i, BasicTabbedPaneUI.CROP_SEGMENT)) + BasicTabbedPaneUI.yCropLen[j]) | 0;
        if (yp[pcnt] >= end) {
          yp[pcnt] = end;
          pcnt++;
          break;
        }
        pcnt++;
      }
    }
    if (tabPlacement === SwingConstants.TOP || tabPlacement === SwingConstants.BOTTOM) {
      return new Polygon()._Polygon$intArr$intArr$int(xp, yp, pcnt);
    } else {
      return new Polygon()._Polygon$intArr$intArr$int(yp, xp, pcnt);
    }
  }
  paintCroppedTabEdge(g: Graphics): void {
    let tabIndex = this.tabScroller.croppedEdge.getTabIndex();
    let cropline = this.tabScroller.croppedEdge.getCropline();
    let x: number;
    let y: number;
    {
      let xx: number, yy: number;
      switch (this.tabPane.getTabPlacement()) {
        case SwingConstants.LEFT:
        case SwingConstants.RIGHT:
          x = this.rects[tabIndex].x_;
          y = cropline;
          xx = x;
          g.setColor(this.shadow);
          while (xx <= ((x + this.rects[tabIndex].width_) | 0)) {
            for (let i = 0; i < BasicTabbedPaneUI.xCropLen.length; i = (i + 2) | 0) {
              g.drawLine((xx + BasicTabbedPaneUI.yCropLen[i]) | 0, (y - BasicTabbedPaneUI.xCropLen[i]) | 0, (xx + (BasicTabbedPaneUI.yCropLen[(i + 1) | 0]) - 1) | 0, (y - (BasicTabbedPaneUI.xCropLen[(i + 1) | 0])) | 0);
            }
            xx = (xx + BasicTabbedPaneUI.CROP_SEGMENT) | 0;
          }
          break;
        case SwingConstants.TOP:
        case SwingConstants.BOTTOM:
        default:
          x = cropline;
          y = this.rects[tabIndex].y_;
          yy = y;
          g.setColor(this.shadow);
          while (yy <= ((y + this.rects[tabIndex].height_) | 0)) {
            for (let i = 0; i < BasicTabbedPaneUI.xCropLen.length; i = (i + 2) | 0) {
              g.drawLine((x - BasicTabbedPaneUI.xCropLen[i]) | 0, (yy + BasicTabbedPaneUI.yCropLen[i]) | 0, (x - (BasicTabbedPaneUI.xCropLen[(i + 1) | 0])) | 0, (yy + (BasicTabbedPaneUI.yCropLen[(i + 1) | 0]) - 1) | 0);
            }
            yy = (yy + BasicTabbedPaneUI.CROP_SEGMENT) | 0;
          }
      }
    }
  }
  /**
   * Lays out a label.
   * @param tabPlacement the tab placement
   * @param metrics the font metrics
   * @param tabIndex the tab index
   * @param title the title
   * @param icon the icon
   * @param tabRect the tab rectangle
   * @param iconRect the icon rectangle
   * @param textRect the text rectangle
   * @param isSelected selection status
   */
  layoutLabel(tabPlacement: number, metrics: FontMetrics, tabIndex: number, title: string, icon: Icon, tabRect: Rectangle, iconRect: Rectangle, textRect: Rectangle, isSelected: boolean): void {
    textRect.x_ = textRect.y_ = iconRect.x_ = iconRect.y_ = 0;
    let v = this.getTextViewForTab(tabIndex);
    if (v != null) {
      this.tabPane.putClientProperty('html', v);
    }
    SwingUtilities.layoutCompoundLabel$JComponent$FontMetrics$String$Icon$int$int$int$int$Rectangle$Rectangle$Rectangle$int(this.tabPane, metrics, title, icon, SwingConstants.CENTER, SwingConstants.CENTER, SwingConstants.CENTER, SwingConstants.TRAILING, tabRect, iconRect, textRect, this.textIconGap);
    this.tabPane.putClientProperty('html', null);
    let xNudge = this.getTabLabelShiftX(tabPlacement, tabIndex, isSelected);
    let yNudge = this.getTabLabelShiftY(tabPlacement, tabIndex, isSelected);
    iconRect.x_ = (iconRect.x_ + xNudge) | 0;
    iconRect.y_ = (iconRect.y_ + yNudge) | 0;
    textRect.x_ = (textRect.x_ + xNudge) | 0;
    textRect.y_ = (textRect.y_ + yNudge) | 0;
  }
  /**
   * Paints an icon.
   * @param g the graphics
   * @param tabPlacement the tab placement
   * @param tabIndex the tab index
   * @param icon the icon
   * @param iconRect the icon rectangle
   * @param isSelected selection status
   */
  paintIcon(g: Graphics, tabPlacement: number, tabIndex: number, icon: Icon, iconRect: Rectangle, isSelected: boolean): void {
    if (icon != null) {
      let oldClip = g.getClip();
      (g).clip(iconRect);
      icon.paintIcon(this.tabPane, g, iconRect.x_, iconRect.y_);
      g.setClip$Shape(oldClip);
    }
  }
  /**
   * Paints text.
   * @param g the graphics
   * @param tabPlacement the tab placement
   * @param font the font
   * @param metrics the font metrics
   * @param tabIndex the tab index
   * @param title the title
   * @param textRect the text rectangle
   * @param isSelected selection status
   */
  paintText(g: Graphics, tabPlacement: number, font: Font, metrics: FontMetrics, tabIndex: number, title: string, textRect: Rectangle, isSelected: boolean): void {
    g.setFont(font);
    let v = this.getTextViewForTab(tabIndex);
    if (v != null) {
      v.paint(g, textRect);
    } else {
      let mnemIndex = this.tabPane.getDisplayedMnemonicIndexAt(tabIndex);
      if (this.tabPane.isEnabled() && this.tabPane.isEnabledAt(tabIndex)) {
        let fg = this.tabPane.getForegroundAt(tabIndex);
        if (isSelected && ($J.isa(fg, UIResource))) {
          let selectedFG = UIManager.getColor$Object('TabbedPane.selectedForeground');
          if (selectedFG != null) {
            fg = selectedFG;
          }
        }
        g.setColor(fg);
        SwingUtilities2.drawStringUnderlineCharAt$JComponent$Graphics$String$int$int$int(this.tabPane, g, title, mnemIndex, textRect.x_, (textRect.y_ + metrics.getAscent()) | 0);
      } else {
        g.setColor(this.tabPane.getBackgroundAt(tabIndex).brighter());
        SwingUtilities2.drawStringUnderlineCharAt$JComponent$Graphics$String$int$int$int(this.tabPane, g, title, mnemIndex, textRect.x_, (textRect.y_ + metrics.getAscent()) | 0);
        g.setColor(this.tabPane.getBackgroundAt(tabIndex).darker());
        SwingUtilities2.drawStringUnderlineCharAt$JComponent$Graphics$String$int$int$int(this.tabPane, g, title, mnemIndex, (textRect.x_ - 1) | 0, (textRect.y_ + metrics.getAscent() - 1) | 0);
      }
    }
  }
  /**
   * Returns the tab label shift x.
   * @param tabPlacement the tab placement
   * @param tabIndex the tab index
   * @param isSelected selection status
   * @return the tab label shift x
   */
  getTabLabelShiftX(tabPlacement: number, tabIndex: number, isSelected: boolean): number {
    let tabRect = this.rects[tabIndex];
    let propKey = (isSelected ? 'selectedLabelShift' : 'labelShift');
    let nudge = DefaultLookup.getInt$JComponent$ComponentUI$String$int(this.tabPane, this, 'TabbedPane.' + propKey, 1);
    switch (tabPlacement) {
      case SwingConstants.LEFT:
        return nudge;
      case SwingConstants.RIGHT:
        return -nudge;
      case SwingConstants.BOTTOM:
      case SwingConstants.TOP:
      default:
        return tabRect.width_ % 2;
    }
  }
  /**
   * Returns the tab label shift y.
   * @param tabPlacement the tab placement
   * @param tabIndex the tab index
   * @param isSelected selection status
   * @return the tab label shift y
   */
  getTabLabelShiftY(tabPlacement: number, tabIndex: number, isSelected: boolean): number {
    let tabRect = this.rects[tabIndex];
    let nudge = (isSelected ? DefaultLookup.getInt$JComponent$ComponentUI$String$int(this.tabPane, this, 'TabbedPane.selectedLabelShift', -1) : DefaultLookup.getInt$JComponent$ComponentUI$String$int(this.tabPane, this, 'TabbedPane.labelShift', 1));
    switch (tabPlacement) {
      case SwingConstants.BOTTOM:
        return -nudge;
      case SwingConstants.LEFT:
      case SwingConstants.RIGHT:
        return tabRect.height_ % 2;
      case SwingConstants.TOP:
      default:
        return nudge;
    }
  }
  /**
   * Paints the focus indicator.
   * @param g the graphics
   * @param tabPlacement the tab placement
   * @param rects the tab rectangles
   * @param tabIndex the tab index
   * @param iconRect the icon rectangle
   * @param textRect the text rectangle
   * @param isSelected selection status
   */
  paintFocusIndicator(g: Graphics, tabPlacement: number, rects: Rectangle[], tabIndex: number, iconRect: Rectangle, textRect: Rectangle, isSelected: boolean): void {
    let tabRect = rects[tabIndex];
    if (this.tabPane.hasFocus() && isSelected) {
      let x: number;
      let y: number;
      let w: number;
      let h: number;
      g.setColor(this.focus);
      switch (tabPlacement) {
        case SwingConstants.LEFT:
          x = (tabRect.x_ + 3) | 0;
          y = (tabRect.y_ + 3) | 0;
          w = (tabRect.width_ - 5) | 0;
          h = (tabRect.height_ - 6) | 0;
          break;
        case SwingConstants.RIGHT:
          x = (tabRect.x_ + 2) | 0;
          y = (tabRect.y_ + 3) | 0;
          w = (tabRect.width_ - 5) | 0;
          h = (tabRect.height_ - 6) | 0;
          break;
        case SwingConstants.BOTTOM:
          x = (tabRect.x_ + 3) | 0;
          y = (tabRect.y_ + 2) | 0;
          w = (tabRect.width_ - 6) | 0;
          h = (tabRect.height_ - 5) | 0;
          break;
        case SwingConstants.TOP:
        default:
          x = (tabRect.x_ + 3) | 0;
          y = (tabRect.y_ + 3) | 0;
          w = (tabRect.width_ - 6) | 0;
          h = (tabRect.height_ - 5) | 0;
      }
      BasicGraphicsUtils.drawDashedRect(g, x, y, w, h);
    }
  }
  /**
   * Paints the border around a tab.
   * Note that this function does not paint the background of the tab,
   * that is done elsewhere.
   *
   * @param g             the graphics context in which to paint
   * @param tabPlacement  the placement (left, right, bottom, top) of the tab
   * @param tabIndex      the index of the tab with respect to other tabs
   * @param x             the x coordinate of tab
   * @param y             the y coordinate of tab
   * @param w             the width of the tab
   * @param h             the height of the tab
   * @param isSelected    a {@code boolean} which determines whether or not
   * the tab is selected
   */
  paintTabBorder(g: Graphics, tabPlacement: number, tabIndex: number, x: number, y: number, w: number, h: number, isSelected: boolean): void {
    g.setColor(this.lightHighlight);
    switch (tabPlacement) {
      case SwingConstants.LEFT:
        g.drawLine((x + 1) | 0, (y + h - 2) | 0, (x + 1) | 0, (y + h - 2) | 0);
        g.drawLine(x, (y + 2) | 0, x, (y + h - 3) | 0);
        g.drawLine((x + 1) | 0, (y + 1) | 0, (x + 1) | 0, (y + 1) | 0);
        g.drawLine((x + 2) | 0, y, (x + w - 1) | 0, y);
        g.setColor(this.shadow);
        g.drawLine((x + 2) | 0, (y + h - 2) | 0, (x + w - 1) | 0, (y + h - 2) | 0);
        g.setColor(this.darkShadow);
        g.drawLine((x + 2) | 0, (y + h - 1) | 0, (x + w - 1) | 0, (y + h - 1) | 0);
        break;
      case SwingConstants.RIGHT:
        g.drawLine(x, y, (x + w - 3) | 0, y);
        g.setColor(this.shadow);
        g.drawLine(x, (y + h - 2) | 0, (x + w - 3) | 0, (y + h - 2) | 0);
        g.drawLine((x + w - 2) | 0, (y + 2) | 0, (x + w - 2) | 0, (y + h - 3) | 0);
        g.setColor(this.darkShadow);
        g.drawLine((x + w - 2) | 0, (y + 1) | 0, (x + w - 2) | 0, (y + 1) | 0);
        g.drawLine((x + w - 2) | 0, (y + h - 2) | 0, (x + w - 2) | 0, (y + h - 2) | 0);
        g.drawLine((x + w - 1) | 0, (y + 2) | 0, (x + w - 1) | 0, (y + h - 3) | 0);
        g.drawLine(x, (y + h - 1) | 0, (x + w - 3) | 0, (y + h - 1) | 0);
        break;
      case SwingConstants.BOTTOM:
        g.drawLine(x, y, x, (y + h - 3) | 0);
        g.drawLine((x + 1) | 0, (y + h - 2) | 0, (x + 1) | 0, (y + h - 2) | 0);
        g.setColor(this.shadow);
        g.drawLine((x + 2) | 0, (y + h - 2) | 0, (x + w - 3) | 0, (y + h - 2) | 0);
        g.drawLine((x + w - 2) | 0, y, (x + w - 2) | 0, (y + h - 3) | 0);
        g.setColor(this.darkShadow);
        g.drawLine((x + 2) | 0, (y + h - 1) | 0, (x + w - 3) | 0, (y + h - 1) | 0);
        g.drawLine((x + w - 2) | 0, (y + h - 2) | 0, (x + w - 2) | 0, (y + h - 2) | 0);
        g.drawLine((x + w - 1) | 0, y, (x + w - 1) | 0, (y + h - 3) | 0);
        break;
      case SwingConstants.TOP:
      default:
        g.drawLine(x, (y + 2) | 0, x, (y + h - 1) | 0);
        g.drawLine((x + 1) | 0, (y + 1) | 0, (x + 1) | 0, (y + 1) | 0);
        g.drawLine((x + 2) | 0, y, (x + w - 3) | 0, y);
        g.setColor(this.shadow);
        g.drawLine((x + w - 2) | 0, (y + 2) | 0, (x + w - 2) | 0, (y + h - 1) | 0);
        g.setColor(this.darkShadow);
        g.drawLine((x + w - 1) | 0, (y + 2) | 0, (x + w - 1) | 0, (y + h - 1) | 0);
        g.drawLine((x + w - 2) | 0, (y + 1) | 0, (x + w - 2) | 0, (y + 1) | 0);
    }
  }
  /**
   * Paints the tab background.
   * @param g             the graphics context in which to paint
   * @param tabPlacement  the placement (left, right, bottom, top) of the tab
   * @param tabIndex      the index of the tab with respect to other tabs
   * @param x             the x coordinate of tab
   * @param y             the y coordinate of tab
   * @param w             the width of the tab
   * @param h             the height of the tab
   * @param isSelected    a {@code boolean} which determines whether or not
   * the tab is selected
   */
  paintTabBackground(g: Graphics, tabPlacement: number, tabIndex: number, x: number, y: number, w: number, h: number, isSelected: boolean): void {
    g.setColor(!isSelected || this.selectedColor == null ? this.tabPane.getBackgroundAt(tabIndex) : this.selectedColor);
    switch (tabPlacement) {
      case SwingConstants.LEFT:
        g.fillRect((x + 1) | 0, (y + 1) | 0, (w - 1) | 0, (h - 3) | 0);
        break;
      case SwingConstants.RIGHT:
        g.fillRect(x, (y + 1) | 0, (w - 2) | 0, (h - 3) | 0);
        break;
      case SwingConstants.BOTTOM:
        g.fillRect((x + 1) | 0, y, (w - 3) | 0, (h - 1) | 0);
        break;
      case SwingConstants.TOP:
      default:
        g.fillRect((x + 1) | 0, (y + 1) | 0, (w - 3) | 0, (h - 1) | 0);
    }
  }
  /**
   * Paints the content border.
   * @param g             the graphics context in which to paint
   * @param tabPlacement  the placement (left, right, bottom, top) of the tab
   * @param selectedIndex the tab index of the selected component
   */
  paintContentBorder(g: Graphics, tabPlacement: number, selectedIndex: number): void {
    let width = this.tabPane.getWidth();
    let height = this.tabPane.getHeight();
    let insets = this.tabPane.getInsets$();
    let tabAreaInsets = this.getTabAreaInsets(tabPlacement);
    let x = insets.left;
    let y = insets.top;
    let w = (width - insets.right - insets.left) | 0;
    let h = (height - insets.top - insets.bottom) | 0;
    switch (tabPlacement) {
      case SwingConstants.LEFT:
        x = (x + this.calculateTabAreaWidth(tabPlacement, this.runCount, this.maxTabWidth)) | 0;
        if (this.tabsOverlapBorder) {
          x = (x - tabAreaInsets.right) | 0;
        }
        w = (w - (x - insets.left)) | 0;
        break;
      case SwingConstants.RIGHT:
        w = (w - this.calculateTabAreaWidth(tabPlacement, this.runCount, this.maxTabWidth)) | 0;
        if (this.tabsOverlapBorder) {
          w = (w + tabAreaInsets.left) | 0;
        }
        break;
      case SwingConstants.BOTTOM:
        h = (h - this.calculateTabAreaHeight(tabPlacement, this.runCount, this.maxTabHeight)) | 0;
        if (this.tabsOverlapBorder) {
          h = (h + tabAreaInsets.top) | 0;
        }
        break;
      case SwingConstants.TOP:
      default:
        y = (y + this.calculateTabAreaHeight(tabPlacement, this.runCount, this.maxTabHeight)) | 0;
        if (this.tabsOverlapBorder) {
          y = (y - tabAreaInsets.bottom) | 0;
        }
        h = (h - (y - insets.top)) | 0;
    }
    if (this.tabPane.getTabCount() > 0 && (this.contentOpaque || this.tabPane.isOpaque())) {
      let color = UIManager.getColor$Object('TabbedPane.contentAreaColor');
      if (color != null) {
        g.setColor(color);
      } else if (this.selectedColor == null || selectedIndex === -1) {
        g.setColor(this.tabPane.getBackground());
      } else {
        g.setColor(this.selectedColor);
      }
      g.fillRect(x, y, w, h);
    }
    this.paintContentBorderTopEdge(g, tabPlacement, selectedIndex, x, y, w, h);
    this.paintContentBorderLeftEdge(g, tabPlacement, selectedIndex, x, y, w, h);
    this.paintContentBorderBottomEdge(g, tabPlacement, selectedIndex, x, y, w, h);
    this.paintContentBorderRightEdge(g, tabPlacement, selectedIndex, x, y, w, h);
  }
  /**
   * Paints the content border top edge.
   * @param g             the graphics context in which to paint
   * @param tabPlacement  the placement (left, right, bottom, top) of the tab
   * @param selectedIndex the tab index of the selected component
   * @param x             the x coordinate of tab
   * @param y             the y coordinate of tab
   * @param w             the width of the tab
   * @param h             the height of the tab
   */
  paintContentBorderTopEdge(g: Graphics, tabPlacement: number, selectedIndex: number, x: number, y: number, w: number, h: number): void {
    let selRect = selectedIndex < 0 ? null : this.getTabBounds$int$Rectangle(selectedIndex, this.calcRect);
    g.setColor(this.lightHighlight);
    if (tabPlacement !== SwingConstants.TOP || selectedIndex < 0 || (((selRect.y_ + selRect.height_ + 1) | 0) < y) || (selRect.x_ < x || selRect.x_ > ((x + w) | 0))) {
      g.drawLine(x, y, (x + w - 2) | 0, y);
    } else {
      g.drawLine(x, y, (selRect.x_ - 1) | 0, y);
      if (((selRect.x_ + selRect.width_) | 0) < ((x + w - 2) | 0)) {
        g.drawLine((selRect.x_ + selRect.width_) | 0, y, (x + w - 2) | 0, y);
      } else {
        g.setColor(this.shadow);
        g.drawLine((x + w - 2) | 0, y, (x + w - 2) | 0, y);
      }
    }
  }
  /**
   * Paints the content border left edge.
   * @param g             the graphics context in which to paint
   * @param tabPlacement  the placement (left, right, bottom, top) of the tab
   * @param selectedIndex the tab index of the selected component
   * @param x             the x coordinate of tab
   * @param y             the y coordinate of tab
   * @param w             the width of the tab
   * @param h             the height of the tab
   */
  paintContentBorderLeftEdge(g: Graphics, tabPlacement: number, selectedIndex: number, x: number, y: number, w: number, h: number): void {
    let selRect = selectedIndex < 0 ? null : this.getTabBounds$int$Rectangle(selectedIndex, this.calcRect);
    g.setColor(this.lightHighlight);
    if (tabPlacement !== SwingConstants.LEFT || selectedIndex < 0 || (((selRect.x_ + selRect.width_ + 1) | 0) < x) || (selRect.y_ < y || selRect.y_ > ((y + h) | 0))) {
      g.drawLine(x, y, x, (y + h - 2) | 0);
    } else {
      g.drawLine(x, y, x, (selRect.y_ - 1) | 0);
      if (((selRect.y_ + selRect.height_) | 0) < ((y + h - 2) | 0)) {
        g.drawLine(x, (selRect.y_ + selRect.height_) | 0, x, (y + h - 2) | 0);
      }
    }
  }
  /**
   * Paints the content border bottom edge.
   * @param g             the graphics context in which to paint
   * @param tabPlacement  the placement (left, right, bottom, top) of the tab
   * @param selectedIndex the tab index of the selected component
   * @param x             the x coordinate of tab
   * @param y             the y coordinate of tab
   * @param w             the width of the tab
   * @param h             the height of the tab
   */
  paintContentBorderBottomEdge(g: Graphics, tabPlacement: number, selectedIndex: number, x: number, y: number, w: number, h: number): void {
    let selRect = selectedIndex < 0 ? null : this.getTabBounds$int$Rectangle(selectedIndex, this.calcRect);
    g.setColor(this.shadow);
    if (tabPlacement !== SwingConstants.BOTTOM || selectedIndex < 0 || (((selRect.y_ - 1) | 0) > h) || (selRect.x_ < x || selRect.x_ > ((x + w) | 0))) {
      g.drawLine((x + 1) | 0, (y + h - 2) | 0, (x + w - 2) | 0, (y + h - 2) | 0);
      g.setColor(this.darkShadow);
      g.drawLine(x, (y + h - 1) | 0, (x + w - 1) | 0, (y + h - 1) | 0);
    } else {
      g.drawLine((x + 1) | 0, (y + h - 2) | 0, (selRect.x_ - 1) | 0, (y + h - 2) | 0);
      g.setColor(this.darkShadow);
      g.drawLine(x, (y + h - 1) | 0, (selRect.x_ - 1) | 0, (y + h - 1) | 0);
      if (((selRect.x_ + selRect.width_) | 0) < ((x + w - 2) | 0)) {
        g.setColor(this.shadow);
        g.drawLine((selRect.x_ + selRect.width_) | 0, (y + h - 2) | 0, (x + w - 2) | 0, (y + h - 2) | 0);
        g.setColor(this.darkShadow);
        g.drawLine((selRect.x_ + selRect.width_) | 0, (y + h - 1) | 0, (x + w - 1) | 0, (y + h - 1) | 0);
      }
    }
  }
  /**
   * Paints the content border right edge.
   * @param g             the graphics context in which to paint
   * @param tabPlacement  the placement (left, right, bottom, top) of the tab
   * @param selectedIndex the tab index of the selected component
   * @param x             the x coordinate of tab
   * @param y             the y coordinate of tab
   * @param w             the width of the tab
   * @param h             the height of the tab
   */
  paintContentBorderRightEdge(g: Graphics, tabPlacement: number, selectedIndex: number, x: number, y: number, w: number, h: number): void {
    let selRect = selectedIndex < 0 ? null : this.getTabBounds$int$Rectangle(selectedIndex, this.calcRect);
    g.setColor(this.shadow);
    if (tabPlacement !== SwingConstants.RIGHT || selectedIndex < 0 || (((selRect.x_ - 1) | 0) > w) || (selRect.y_ < y || selRect.y_ > ((y + h) | 0))) {
      g.drawLine((x + w - 2) | 0, (y + 1) | 0, (x + w - 2) | 0, (y + h - 3) | 0);
      g.setColor(this.darkShadow);
      g.drawLine((x + w - 1) | 0, y, (x + w - 1) | 0, (y + h - 1) | 0);
    } else {
      g.drawLine((x + w - 2) | 0, (y + 1) | 0, (x + w - 2) | 0, (selRect.y_ - 1) | 0);
      g.setColor(this.darkShadow);
      g.drawLine((x + w - 1) | 0, y, (x + w - 1) | 0, (selRect.y_ - 1) | 0);
      if (((selRect.y_ + selRect.height_) | 0) < ((y + h - 2) | 0)) {
        g.setColor(this.shadow);
        g.drawLine((x + w - 2) | 0, (selRect.y_ + selRect.height_) | 0, (x + w - 2) | 0, (y + h - 2) | 0);
        g.setColor(this.darkShadow);
        g.drawLine((x + w - 1) | 0, (selRect.y_ + selRect.height_) | 0, (x + w - 1) | 0, (y + h - 2) | 0);
      }
    }
  }
  ensureCurrentLayout(): void {
    if (!this.tabPane.isValid()) {
      this.tabPane.validate();
    }
    if (!this.tabPane.isValid()) {
      let layout = this.tabPane.getLayout();
      layout.calculateLayoutInfo();
    }
  }
  /**
   * Returns the bounds of the specified tab index.  The bounds are
   * with respect to the JTabbedPane's coordinate space.
   */
  getTabBounds$JTabbedPane$int(pane: JTabbedPane, i: number): Rectangle {
    this.ensureCurrentLayout();
    let tabRect = new Rectangle()._Rectangle$();
    return this.getTabBounds$int$Rectangle(i, tabRect);
  }
  /**
   * Returns the tab index which intersects the specified point
   * in the JTabbedPane's coordinate space.
   */
  tabForCoordinate$JTabbedPane$int$int(pane: JTabbedPane, x: number, y: number): number {
    return this.tabForCoordinate$JTabbedPane$int$int$boolean$BasicTabbedPaneUI(pane, x, y, true);
  }
  tabForCoordinate$JTabbedPane$int$int$boolean$BasicTabbedPaneUI(pane: JTabbedPane, x: number, y: number, validateIfNecessary: boolean): number {
    if (validateIfNecessary) {
      this.ensureCurrentLayout();
    }
    if (this.isRunsDirty) {
      return -1;
    }
    let p = new Point()._Point$int$int(x, y);
    if (this.scrollableTabLayoutEnabled()) {
      this.translatePointToTabPanel(x, y, p);
      let viewRect = this.tabScroller.viewport.getViewRect();
      if (!viewRect.contains$Point(p)) {
        return -1;
      }
    }
    let tabCount = this.tabPane.getTabCount();
    for (let i = 0; i < tabCount; i++) {
      if (this.rects[i].contains$int$int(p.x_, p.y_)) {
        return i;
      }
    }
    return -1;
  }
  /**
   * Returns the bounds of the specified tab in the coordinate space
   * of the JTabbedPane component.  This is required because the tab rects
   * are by default defined in the coordinate space of the component where
   * they are rendered, which could be the JTabbedPane
   * (for WRAP_TAB_LAYOUT) or a ScrollableTabPanel (SCROLL_TAB_LAYOUT).
   * This method should be used whenever the tab rectangle must be relative
   * to the JTabbedPane itself and the result should be placed in a
   * designated Rectangle object (rather than instantiating and returning
   * a new Rectangle each time). The tab index parameter must be a valid
   * tabbed pane tab index (0 to tab count - 1, inclusive).  The destination
   * rectangle parameter must be a valid <code>Rectangle</code> instance.
   * The handling of invalid parameters is unspecified.
   *
   * @param tabIndex the index of the tab
   * @param dest the rectangle where the result should be placed
   * @return the resulting rectangle
   *
   * @since 1.4
   */
  getTabBounds$int$Rectangle(tabIndex: number, dest: Rectangle): Rectangle {
    dest.width_ = this.rects[tabIndex].width_;
    dest.height_ = this.rects[tabIndex].height_;
    if (this.scrollableTabLayoutEnabled()) {
      let vpp = this.tabScroller.viewport.getLocation$();
      let viewp = this.tabScroller.viewport.getViewPosition();
      dest.x_ = (this.rects[tabIndex].x_ + vpp.x_ - viewp.x_) | 0;
      dest.y_ = (this.rects[tabIndex].y_ + vpp.y_ - viewp.y_) | 0;
    } else {
      dest.x_ = this.rects[tabIndex].x_;
      dest.y_ = this.rects[tabIndex].y_;
    }
    return dest;
  }
  /**
   * Returns the index of the tab closest to the passed in location, note
   * that the returned tab may not contain the location x,y.
   */
  getClosestTab(x: number, y: number): number {
    let min = 0;
    let tabCount = Math.min(this.rects.length, this.tabPane.getTabCount());
    let max = tabCount;
    let tabPlacement = this.tabPane.getTabPlacement();
    let useX = (tabPlacement === SwingConstants.TOP || tabPlacement === SwingConstants.BOTTOM);
    let want = (useX) ? x : y;
    while (min !== max) {
      let current = $J.idiv(((max + min) | 0), 2);
      let minLoc: number;
      let maxLoc: number;
      if (useX) {
        minLoc = this.rects[current].x_;
        maxLoc = (minLoc + this.rects[current].width_) | 0;
      } else {
        minLoc = this.rects[current].y_;
        maxLoc = (minLoc + this.rects[current].height_) | 0;
      }
      if (want < minLoc) {
        max = current;
        if (min === max) {
          return Math.max(0, (current - 1) | 0);
        }
      } else if (want >= maxLoc) {
        min = current;
        if (((max - min) | 0) <= 1) {
          return Math.max((current + 1) | 0, (tabCount - 1) | 0);
        }
      } else {
        return current;
      }
    }
    return min;
  }
  /**
   * Returns a point which is translated from the specified point in the
   * JTabbedPane's coordinate space to the coordinate space of the
   * ScrollableTabPanel.  This is used for SCROLL_TAB_LAYOUT ONLY.
   */
  translatePointToTabPanel(srcx: number, srcy: number, dest: Point): Point {
    let vpp = this.tabScroller.viewport.getLocation$();
    let viewp = this.tabScroller.viewport.getViewPosition();
    dest.x_ = (srcx - vpp.x_ + viewp.x_) | 0;
    dest.y_ = (srcy - vpp.y_ + viewp.y_) | 0;
    return dest;
  }
  /**
   * Returns the visible component.
   * @return the visible component
   */
  getVisibleComponent(): Component {
    return this.visibleComponent;
  }
  /**
   * Sets the visible component.
   * @param component the component
   */
  setVisibleComponent(component: Component): void {
    if (this.visibleComponent != null && this.visibleComponent !== component && this.visibleComponent.getParent() === this.tabPane && this.visibleComponent.isVisible$()) {
      this.visibleComponent.setVisible(false);
    }
    if (component != null && !component.isVisible$()) {
      component.setVisible(true);
    }
    this.visibleComponent = component;
  }
  /**
   * Assures the tab rectangles are created.
   * @param tabCount the tab count
   */
  assureRectsCreated(tabCount: number): void {
    let rectArrayLen = this.rects.length;
    if (tabCount !== rectArrayLen) {
      let tempRectArray = $J.newArray(tabCount, null);
      $J.system_arraycopy(this.rects, 0, tempRectArray, 0, Math.min(rectArrayLen, tabCount));
      this.rects = tempRectArray;
      for (let rectIndex = rectArrayLen; rectIndex < tabCount; rectIndex++) {
        this.rects[rectIndex] = new Rectangle()._Rectangle$();
      }
    }
  }
  /**
   * Expands the tab runs array.
   */
  expandTabRunsArray(): void {
    let rectLen = this.tabRuns.length;
    let newArray = $J.newArray((rectLen + 10) | 0, 0);
    $J.system_arraycopy(this.tabRuns, 0, newArray, 0, this.runCount);
    this.tabRuns = newArray;
  }
  /**
   * Returns the run for a tab.
   * @param tabCount the tab count
   * @param tabIndex the tab index.
   * @return the run for a tab
   */
  getRunForTab(tabCount: number, tabIndex: number): number {
    for (let i = 0; i < this.runCount; i++) {
      let first = this.tabRuns[i];
      let last = this.lastTabInRun(tabCount, i);
      if (tabIndex >= first && tabIndex <= last) {
        return i;
      }
    }
    return 0;
  }
  /**
   * Returns the last tab in a run.
   * @param tabCount the tab count
   * @param run the run
   * @return the last tab in a run
   */
  lastTabInRun(tabCount: number, run: number): number {
    if (this.runCount === 1) {
      return (tabCount - 1) | 0;
    }
    let nextRun = (run === ((this.runCount - 1) | 0) ? 0 : (run + 1) | 0);
    if (this.tabRuns[nextRun] === 0) {
      return (tabCount - 1) | 0;
    }
    return (this.tabRuns[nextRun] - 1) | 0;
  }
  /**
   * Returns the tab run overlay.
   * @param tabPlacement the placement (left, right, bottom, top) of the tab
   * @return the tab run overlay
   */
  getTabRunOverlay(tabPlacement: number): number {
    return this.tabRunOverlay;
  }
  /**
   * Returns the tab run indent.
   * @param tabPlacement the placement (left, right, bottom, top) of the tab
   * @param run the tab run
   * @return the tab run indent
   */
  getTabRunIndent(tabPlacement: number, run: number): number {
    return 0;
  }
  /**
   * Returns whether or not the tab run should be padded.
   * @param tabPlacement the placement (left, right, bottom, top) of the tab
   * @param run the tab run
   * @return whether or not the tab run should be padded
   */
  shouldPadTabRun(tabPlacement: number, run: number): boolean {
    return this.runCount > 1;
  }
  /**
   * Returns whether or not the tab run should be rotated.
   * @param tabPlacement the placement (left, right, bottom, top) of the tab
   * @return whether or not the tab run should be rotated
   */
  shouldRotateTabRuns$int(tabPlacement: number): boolean {
    return true;
  }
  /**
   * Returns the icon for a tab.
   * @param tabIndex the index of the tab
   * @return the icon for a tab
   */
  getIconForTab(tabIndex: number): Icon {
    return (!this.tabPane.isEnabled() || !this.tabPane.isEnabledAt(tabIndex)) ? this.tabPane.getDisabledIconAt(tabIndex) : this.tabPane.getIconAt(tabIndex);
  }
  /**
   * Returns the text View object required to render stylized text (HTML) for
   * the specified tab or null if no specialized text rendering is needed
   * for this tab. This is provided to support html rendering inside tabs.
   *
   * @param tabIndex the index of the tab
   * @return the text view to render the tab's text or null if no
   *         specialized rendering is required
   *
   * @since 1.4
   */
  getTextViewForTab(tabIndex: number): View {
    if (this.htmlViews != null) {
      return this.htmlViews.elementAt(tabIndex);
    }
    return null;
  }
  /**
   * Calculates the tab height.
   * @param tabPlacement  the placement (left, right, bottom, top) of the tab
   * @param tabIndex      the index of the tab with respect to other tabs
   * @param fontHeight    the font height
   * @return the tab height
   */
  calculateTabHeight(tabPlacement: number, tabIndex: number, fontHeight: number): number {
    let height = 0;
    let c = this.tabPane.getTabComponentAt(tabIndex);
    if (c != null) {
      height = c.getPreferredSize$().height_;
    } else {
      let v = this.getTextViewForTab(tabIndex);
      if (v != null) {
        height = (height + $J.d2i(v.getPreferredSpan(View.Y_AXIS))) | 0;
      } else {
        height = (height + fontHeight) | 0;
      }
      let icon = this.getIconForTab(tabIndex);
      if (icon != null) {
        height = Math.max(height, icon.getIconHeight());
      }
    }
    let tabInsets = this.getTabInsets(tabPlacement, tabIndex);
    height = (height + (tabInsets.top + tabInsets.bottom + 2)) | 0;
    return height;
  }
  /**
   * Calculates the maximum tab height.
   * @param tabPlacement  the placement (left, right, bottom, top) of the tab
   * @return the maximum tab height
   */
  calculateMaxTabHeight(tabPlacement: number): number {
    let metrics = this.getFontMetrics();
    let tabCount = this.tabPane.getTabCount();
    let result = 0;
    let fontHeight = metrics.getHeight();
    for (let i = 0; i < tabCount; i++) {
      result = Math.max(this.calculateTabHeight(tabPlacement, i, fontHeight), result);
    }
    return result;
  }
  /**
   * Calculates the tab width.
   * @param tabPlacement  the placement (left, right, bottom, top) of the tab
   * @param tabIndex      the index of the tab with respect to other tabs
   * @param metrics       the font metrics
   * @return the tab width
   */
  calculateTabWidth(tabPlacement: number, tabIndex: number, metrics: FontMetrics): number {
    let tabInsets = this.getTabInsets(tabPlacement, tabIndex);
    let width = (tabInsets.left + tabInsets.right + 3) | 0;
    let tabComponent = this.tabPane.getTabComponentAt(tabIndex);
    if (tabComponent != null) {
      width = (width + tabComponent.getPreferredSize$().width_) | 0;
    } else {
      let icon = this.getIconForTab(tabIndex);
      if (icon != null) {
        width = (width + (icon.getIconWidth() + this.textIconGap)) | 0;
      }
      let v = this.getTextViewForTab(tabIndex);
      if (v != null) {
        width = (width + $J.d2i(v.getPreferredSpan(View.X_AXIS))) | 0;
      } else {
        let title = this.tabPane.getTitleAt(tabIndex);
        width = (width + SwingUtilities2.stringWidth$JComponent$FontMetrics$String(this.tabPane, metrics, title)) | 0;
      }
    }
    return width;
  }
  /**
   * Calculates the maximum tab width.
   * @param tabPlacement  the placement (left, right, bottom, top) of the tab
   * @return the maximum tab width
   */
  calculateMaxTabWidth(tabPlacement: number): number {
    let metrics = this.getFontMetrics();
    let tabCount = this.tabPane.getTabCount();
    let result = 0;
    for (let i = 0; i < tabCount; i++) {
      result = Math.max(this.calculateTabWidth(tabPlacement, i, metrics), result);
    }
    return result;
  }
  /**
   * Calculates the tab area height.
   * @param tabPlacement  the placement (left, right, bottom, top) of the tab
   * @param horizRunCount horizontal run count
   * @param maxTabHeight maximum tab height
   * @return the tab area height
   */
  calculateTabAreaHeight(tabPlacement: number, horizRunCount: number, maxTabHeight: number): number {
    let tabAreaInsets = this.getTabAreaInsets(tabPlacement);
    let tabRunOverlay = this.getTabRunOverlay(tabPlacement);
    return (horizRunCount > 0 ? (Math.imul(horizRunCount, ((maxTabHeight - tabRunOverlay) | 0)) + tabRunOverlay + tabAreaInsets.top + tabAreaInsets.bottom) | 0 : 0);
  }
  /**
   * Calculates the tab area width.
   * @param tabPlacement  the placement (left, right, bottom, top) of the tab
   * @param vertRunCount vertical run count
   * @param maxTabWidth maximum tab width
   * @return the tab area width
   */
  calculateTabAreaWidth(tabPlacement: number, vertRunCount: number, maxTabWidth: number): number {
    let tabAreaInsets = this.getTabAreaInsets(tabPlacement);
    let tabRunOverlay = this.getTabRunOverlay(tabPlacement);
    return (vertRunCount > 0 ? (Math.imul(vertRunCount, ((maxTabWidth - tabRunOverlay) | 0)) + tabRunOverlay + tabAreaInsets.left + tabAreaInsets.right) | 0 : 0);
  }
  /**
   * Returns the tab insets.
   * @param tabPlacement  the placement (left, right, bottom, top) of the tab
   * @param tabIndex the tab index
   * @return the tab insets
   */
  getTabInsets(tabPlacement: number, tabIndex: number): Insets {
    return this.tabInsets;
  }
  /**
   * Returns the selected tab pad insets.
   * @param tabPlacement  the placement (left, right, bottom, top) of the tab
   * @return the selected tab pad insets
   */
  getSelectedTabPadInsets(tabPlacement: number): Insets {
    BasicTabbedPaneUI.rotateInsets(this.selectedTabPadInsets, this.currentPadInsets, tabPlacement);
    return this.currentPadInsets;
  }
  /**
   * Returns the tab area insets.
   * @param tabPlacement  the placement (left, right, bottom, top) of the tab
   * @return the pad area insets
   */
  getTabAreaInsets(tabPlacement: number): Insets {
    BasicTabbedPaneUI.rotateInsets(this.tabAreaInsets, this.currentTabAreaInsets, tabPlacement);
    return this.currentTabAreaInsets;
  }
  /**
   * Returns the content border insets.
   * @param tabPlacement  the placement (left, right, bottom, top) of the tab
   * @return the content border insets
   */
  getContentBorderInsets(tabPlacement: number): Insets {
    return this.contentBorderInsets;
  }
  /**
   * Returns the font metrics.
   * @return the font metrics
   */
  getFontMetrics(): FontMetrics {
    let font = this.tabPane.getFont();
    return this.tabPane.getFontMetrics(font);
  }
  /**
   * Navigates the selected tab.
   * @param direction the direction
   */
  navigateSelectedTab(direction: number): void {
    let tabPlacement = this.tabPane.getTabPlacement();
    let current = DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(this.tabPane, this, 'TabbedPane.selectionFollowsFocus', true) ? this.tabPane.getSelectedIndex() : this.getFocusIndex();
    let tabCount = this.tabPane.getTabCount();
    let leftToRight = BasicGraphicsUtils.isLeftToRight(this.tabPane);
    if (tabCount <= 0) {
      return;
    }
    let offset: number;
    switch (tabPlacement) {
      case SwingConstants.LEFT:
      case SwingConstants.RIGHT:
        switch (direction) {
          case SwingConstants.NEXT:
            this.selectNextTab(current);
            break;
          case SwingConstants.PREVIOUS:
            this.selectPreviousTab(current);
            break;
          case SwingConstants.NORTH:
            this.selectPreviousTabInRun(current);
            break;
          case SwingConstants.SOUTH:
            this.selectNextTabInRun(current);
            break;
          case SwingConstants.WEST:
            offset = this.getTabRunOffset(tabPlacement, tabCount, current, false);
            this.selectAdjacentRunTab(tabPlacement, current, offset);
            break;
          case SwingConstants.EAST:
            offset = this.getTabRunOffset(tabPlacement, tabCount, current, true);
            this.selectAdjacentRunTab(tabPlacement, current, offset);
            break;
          default:
        }
        break;
      case SwingConstants.BOTTOM:
      case SwingConstants.TOP:
      default:
        switch (direction) {
          case SwingConstants.NEXT:
            this.selectNextTab(current);
            break;
          case SwingConstants.PREVIOUS:
            this.selectPreviousTab(current);
            break;
          case SwingConstants.NORTH:
            offset = this.getTabRunOffset(tabPlacement, tabCount, current, false);
            this.selectAdjacentRunTab(tabPlacement, current, offset);
            break;
          case SwingConstants.SOUTH:
            offset = this.getTabRunOffset(tabPlacement, tabCount, current, true);
            this.selectAdjacentRunTab(tabPlacement, current, offset);
            break;
          case SwingConstants.EAST:
            if (leftToRight) {
              this.selectNextTabInRun(current);
            } else {
              this.selectPreviousTabInRun(current);
            }
            break;
          case SwingConstants.WEST:
            if (leftToRight) {
              this.selectPreviousTabInRun(current);
            } else {
              this.selectNextTabInRun(current);
            }
            break;
          default:
        }
    }
  }
  /**
   * Selects the next tab in the run.
   * @param current the current tab
   */
  selectNextTabInRun(current: number): void {
    let tabCount = this.tabPane.getTabCount();
    let tabIndex = this.getNextTabIndexInRun(tabCount, current);
    while (tabIndex !== current && !this.tabPane.isEnabledAt(tabIndex)) {
      tabIndex = this.getNextTabIndexInRun(tabCount, tabIndex);
    }
    this.navigateTo(tabIndex);
  }
  /**
   * Selects the previous tab in the run.
   * @param current the current tab
   */
  selectPreviousTabInRun(current: number): void {
    let tabCount = this.tabPane.getTabCount();
    let tabIndex = this.getPreviousTabIndexInRun(tabCount, current);
    while (tabIndex !== current && !this.tabPane.isEnabledAt(tabIndex)) {
      tabIndex = this.getPreviousTabIndexInRun(tabCount, tabIndex);
    }
    this.navigateTo(tabIndex);
  }
  /**
   * Selects the next tab.
   * @param current the current tab
   */
  selectNextTab(current: number): void {
    let tabIndex = this.getNextTabIndex(current);
    while (tabIndex !== current && !this.tabPane.isEnabledAt(tabIndex)) {
      tabIndex = this.getNextTabIndex(tabIndex);
    }
    this.navigateTo(tabIndex);
  }
  /**
   * Selects the previous tab.
   * @param current the current tab
   */
  selectPreviousTab(current: number): void {
    let tabIndex = this.getPreviousTabIndex(current);
    while (tabIndex !== current && !this.tabPane.isEnabledAt(tabIndex)) {
      tabIndex = this.getPreviousTabIndex(tabIndex);
    }
    this.navigateTo(tabIndex);
  }
  /**
   * Selects an adjacent run of tabs.
   * @param tabPlacement  the placement (left, right, bottom, top) of the tab
   * @param tabIndex      the index of the tab with respect to other tabs
   * @param offset        selection offset
   */
  selectAdjacentRunTab(tabPlacement: number, tabIndex: number, offset: number): void {
    if (this.runCount < 2) {
      return;
    }
    let newIndex: number;
    let r = this.rects[tabIndex];
    switch (tabPlacement) {
      case SwingConstants.LEFT:
      case SwingConstants.RIGHT:
        newIndex = this.tabForCoordinate$JTabbedPane$int$int(this.tabPane, (r.x_ + $J.idiv(r.width_, 2) + offset) | 0, (r.y_ + $J.idiv(r.height_, 2)) | 0);
        break;
      case SwingConstants.BOTTOM:
      case SwingConstants.TOP:
      default:
        newIndex = this.tabForCoordinate$JTabbedPane$int$int(this.tabPane, (r.x_ + $J.idiv(r.width_, 2)) | 0, (r.y_ + $J.idiv(r.height_, 2) + offset) | 0);
    }
    if (newIndex !== -1) {
      while (!this.tabPane.isEnabledAt(newIndex) && newIndex !== tabIndex) {
        newIndex = this.getNextTabIndex(newIndex);
      }
      this.navigateTo(newIndex);
    }
  }
  navigateTo(index: number): void {
    if (DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(this.tabPane, this, 'TabbedPane.selectionFollowsFocus', true)) {
      this.tabPane.setSelectedIndex(index);
    } else {
      this.setFocusIndex(index, true);
    }
  }
  setFocusIndex(index: number, repaint: boolean): void {
    if (repaint && !this.isRunsDirty) {
      this.repaintTab(this.focusIndex);
      this.focusIndex = index;
      this.repaintTab(this.focusIndex);
    } else {
      this.focusIndex = index;
    }
  }
  /**
   * Repaints the specified tab.
   */
  repaintTab(index: number): void {
    if (!this.isRunsDirty && index >= 0 && index < this.tabPane.getTabCount()) {
      this.tabPane.repaint$Rectangle(this.getTabBounds$JTabbedPane$int(this.tabPane, index));
    }
  }
  /**
   * Makes sure the focusIndex is valid.
   */
  validateFocusIndex(): void {
    if (this.focusIndex >= this.tabPane.getTabCount()) {
      this.setFocusIndex(this.tabPane.getSelectedIndex(), false);
    }
  }
  /**
   * Returns the index of the tab that has focus.
   *
   * @return index of tab that has focus
   * @since 1.5
   */
  getFocusIndex(): number {
    return this.focusIndex;
  }
  /**
   * Returns the tab run offset.
   * @param tabPlacement  the placement (left, right, bottom, top) of the tab
   * @param tabCount the tab count
   * @param tabIndex      the index of the tab with respect to other tabs
   * @param forward forward or not
   * @return the tab run offset
   */
  getTabRunOffset(tabPlacement: number, tabCount: number, tabIndex: number, forward: boolean): number {
    let run = this.getRunForTab(tabCount, tabIndex);
    let offset: number;
    switch (tabPlacement) {
      case SwingConstants.LEFT:
        {
          if (run === 0) {
            offset = (forward ? -((this.calculateTabAreaWidth(tabPlacement, this.runCount, this.maxTabWidth) - this.maxTabWidth) | 0) : -this.maxTabWidth);
          } else if (run === ((this.runCount - 1) | 0)) {
            offset = (forward ? this.maxTabWidth : (this.calculateTabAreaWidth(tabPlacement, this.runCount, this.maxTabWidth) - this.maxTabWidth) | 0);
          } else {
            offset = (forward ? this.maxTabWidth : -this.maxTabWidth);
          }
          break;
        }
      case SwingConstants.RIGHT:
        {
          if (run === 0) {
            offset = (forward ? this.maxTabWidth : (this.calculateTabAreaWidth(tabPlacement, this.runCount, this.maxTabWidth) - this.maxTabWidth) | 0);
          } else if (run === ((this.runCount - 1) | 0)) {
            offset = (forward ? -((this.calculateTabAreaWidth(tabPlacement, this.runCount, this.maxTabWidth) - this.maxTabWidth) | 0) : -this.maxTabWidth);
          } else {
            offset = (forward ? this.maxTabWidth : -this.maxTabWidth);
          }
          break;
        }
      case SwingConstants.BOTTOM:
        {
          if (run === 0) {
            offset = (forward ? this.maxTabHeight : (this.calculateTabAreaHeight(tabPlacement, this.runCount, this.maxTabHeight) - this.maxTabHeight) | 0);
          } else if (run === ((this.runCount - 1) | 0)) {
            offset = (forward ? -((this.calculateTabAreaHeight(tabPlacement, this.runCount, this.maxTabHeight) - this.maxTabHeight) | 0) : -this.maxTabHeight);
          } else {
            offset = (forward ? this.maxTabHeight : -this.maxTabHeight);
          }
          break;
        }
      case SwingConstants.TOP:
      default:
        {
          if (run === 0) {
            offset = (forward ? -((this.calculateTabAreaHeight(tabPlacement, this.runCount, this.maxTabHeight) - this.maxTabHeight) | 0) : -this.maxTabHeight);
          } else if (run === ((this.runCount - 1) | 0)) {
            offset = (forward ? this.maxTabHeight : (this.calculateTabAreaHeight(tabPlacement, this.runCount, this.maxTabHeight) - this.maxTabHeight) | 0);
          } else {
            offset = (forward ? this.maxTabHeight : -this.maxTabHeight);
          }
        }
    }
    return offset;
  }
  /**
   * Returns the previous tab index.
   * @param base the base
   * @return the previous tab index
   */
  getPreviousTabIndex(base: number): number {
    let tabIndex = (((base - 1) | 0) >= 0 ? (base - 1) | 0 : (this.tabPane.getTabCount() - 1) | 0);
    return (tabIndex >= 0 ? tabIndex : 0);
  }
  /**
   * Returns the next tab index.
   * @param base the base
   * @return the next tab index
   */
  getNextTabIndex(base: number): number {
    return ((base + 1) | 0) % this.tabPane.getTabCount();
  }
  /**
   * Returns the next tab index in the run.
   * @param tabCount the tab count
   * @param base the base
   * @return the next tab index in the run
   */
  getNextTabIndexInRun(tabCount: number, base: number): number {
    if (this.runCount < 2) {
      return this.getNextTabIndex(base);
    }
    let currentRun = this.getRunForTab(tabCount, base);
    let next = this.getNextTabIndex(base);
    if (next === this.tabRuns[this.getNextTabRun(currentRun)]) {
      return this.tabRuns[currentRun];
    }
    return next;
  }
  /**
   * Returns the previous tab index in the run.
   * @param tabCount the tab count
   * @param base the base
   * @return the previous tab index in the run
   */
  getPreviousTabIndexInRun(tabCount: number, base: number): number {
    if (this.runCount < 2) {
      return this.getPreviousTabIndex(base);
    }
    let currentRun = this.getRunForTab(tabCount, base);
    if (base === this.tabRuns[currentRun]) {
      let previous = (this.tabRuns[this.getNextTabRun(currentRun)] - 1) | 0;
      return (previous !== -1 ? previous : (tabCount - 1) | 0);
    }
    return this.getPreviousTabIndex(base);
  }
  /**
   * Returns the next tab run.
   * @param baseRun the base run
   * @return the next tab run
   */
  getNextTabRun(baseRun: number): number {
    return ((baseRun + 1) | 0) % this.runCount;
  }
  /**
   * Rotates the insets.
   * @param topInsets the top insets
   * @param targetInsets the target insets
   * @param targetPlacement the target placement
   */
  static rotateInsets(topInsets: Insets, targetInsets: Insets, targetPlacement: number): void {
    switch (targetPlacement) {
      case SwingConstants.LEFT:
        targetInsets.top = topInsets.left;
        targetInsets.left = topInsets.top;
        targetInsets.bottom = topInsets.right;
        targetInsets.right = topInsets.bottom;
        break;
      case SwingConstants.BOTTOM:
        targetInsets.top = topInsets.bottom;
        targetInsets.left = topInsets.left;
        targetInsets.bottom = topInsets.top;
        targetInsets.right = topInsets.right;
        break;
      case SwingConstants.RIGHT:
        targetInsets.top = topInsets.left;
        targetInsets.left = topInsets.bottom;
        targetInsets.bottom = topInsets.right;
        targetInsets.right = topInsets.top;
        break;
      case SwingConstants.TOP:
      default:
        targetInsets.top = topInsets.top;
        targetInsets.left = topInsets.left;
        targetInsets.bottom = topInsets.bottom;
        targetInsets.right = topInsets.right;
    }
  }
  requestFocusForVisibleComponent(): boolean {
    return SwingUtilities2.tabbedPaneChangeFocusTo(this.getVisibleComponent());
  }
  createHTMLVector(): Vector<View> {
    let htmlViews = new Vector();
    let count = this.tabPane.getTabCount();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        let title = this.tabPane.getTitleAt(i);
        if (BasicHTML.isHTMLString(title)) {
          htmlViews.addElement(BasicHTML.createHTMLView(this.tabPane, title));
        } else {
          htmlViews.addElement(null);
        }
      }
    }
    return htmlViews;
  }
  static $clinit() {
    BasicTabbedPaneUI.xCropLen = [1, 1, 0, 0, 1, 1, 2, 2];
    BasicTabbedPaneUI.yCropLen = [0, 3, 3, 6, 6, 9, 9, 12];
  }
}

export class BasicTabbedPaneUI$Actions extends UIAction {
  static readonly NEXT: string = 'navigateNext';
  static readonly PREVIOUS: string = 'navigatePrevious';
  static readonly RIGHT: string = 'navigateRight';
  static readonly LEFT: string = 'navigateLeft';
  static readonly UP: string = 'navigateUp';
  static readonly DOWN: string = 'navigateDown';
  static readonly PAGE_UP: string = 'navigatePageUp';
  static readonly PAGE_DOWN: string = 'navigatePageDown';
  static readonly REQUEST_FOCUS: string = 'requestFocus';
  static readonly REQUEST_FOCUS_FOR_VISIBLE: string = 'requestFocusForVisibleComponent';
  static readonly SET_SELECTED: string = 'setSelectedIndex';
  static readonly SELECT_FOCUSED: string = 'selectTabWithFocus';
  static readonly SCROLL_FORWARD: string = 'scrollTabsForwardAction';
  static readonly SCROLL_BACKWARD: string = 'scrollTabsBackwardAction';
  _BasicTabbedPaneUI$Actions(key: string): this {
    this._UIAction(key);
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    let key = this.getName();
    let pane = e.getSource();
    let ui = BasicLookAndFeel.getUIOfType(pane.getUI(), $J.cls(BasicTabbedPaneUI));
    if (ui == null) {
      return;
    }
    if (key === BasicTabbedPaneUI$Actions.NEXT) {
      ui.navigateSelectedTab(SwingConstants.NEXT);
    } else if (key === BasicTabbedPaneUI$Actions.PREVIOUS) {
      ui.navigateSelectedTab(SwingConstants.PREVIOUS);
    } else if (key === BasicTabbedPaneUI$Actions.RIGHT) {
      ui.navigateSelectedTab(SwingConstants.EAST);
    } else if (key === BasicTabbedPaneUI$Actions.LEFT) {
      ui.navigateSelectedTab(SwingConstants.WEST);
    } else if (key === BasicTabbedPaneUI$Actions.UP) {
      ui.navigateSelectedTab(SwingConstants.NORTH);
    } else if (key === BasicTabbedPaneUI$Actions.DOWN) {
      ui.navigateSelectedTab(SwingConstants.SOUTH);
    } else if (key === BasicTabbedPaneUI$Actions.PAGE_UP) {
      let tabPlacement = pane.getTabPlacement();
      if (tabPlacement === SwingConstants.TOP || tabPlacement === SwingConstants.BOTTOM) {
        ui.navigateSelectedTab(SwingConstants.WEST);
      } else {
        ui.navigateSelectedTab(SwingConstants.NORTH);
      }
    } else if (key === BasicTabbedPaneUI$Actions.PAGE_DOWN) {
      let tabPlacement = pane.getTabPlacement();
      if (tabPlacement === SwingConstants.TOP || tabPlacement === SwingConstants.BOTTOM) {
        ui.navigateSelectedTab(SwingConstants.EAST);
      } else {
        ui.navigateSelectedTab(SwingConstants.SOUTH);
      }
    } else if (key === BasicTabbedPaneUI$Actions.REQUEST_FOCUS) {
      pane.requestFocus$();
    } else if (key === BasicTabbedPaneUI$Actions.REQUEST_FOCUS_FOR_VISIBLE) {
      ui.requestFocusForVisibleComponent();
    } else if (key === BasicTabbedPaneUI$Actions.SET_SELECTED) {
      let command = e.getActionCommand();
      if (command != null && command.length > 0) {
        let mnemonic = e.getActionCommand().charCodeAt(0);
        if (mnemonic >= 97 /* 'a' */ && mnemonic <= 122 /* 'z' */) {
          mnemonic = (mnemonic - (97 /* 'a' */ - 65 /* 'A' */)) | 0;
        }
        let index = ui.mnemonicToIndexMap.get(mnemonic);
        if (index != null && pane.isEnabledAt((+index))) {
          pane.setSelectedIndex((+index));
        }
      }
    } else if (key === BasicTabbedPaneUI$Actions.SELECT_FOCUSED) {
      let focusIndex = ui.getFocusIndex();
      if (focusIndex !== -1) {
        pane.setSelectedIndex(focusIndex);
      }
    } else if (key === BasicTabbedPaneUI$Actions.SCROLL_FORWARD) {
      if (ui.scrollableTabLayoutEnabled()) {
        ui.tabScroller.scrollForward(pane.getTabPlacement());
      }
    } else if (key === BasicTabbedPaneUI$Actions.SCROLL_BACKWARD) {
      if (ui.scrollableTabLayoutEnabled()) {
        ui.tabScroller.scrollBackward(pane.getTabPlacement());
      }
    }
  }
}

/**
 * This class should be treated as a &quot;protected&quot; inner class.
 * Instantiate it only within subclasses of BasicTabbedPaneUI.
 */
export class BasicTabbedPaneUI$TabbedPaneLayout extends JObject {
  /**
   * Constructs a {@code TabbedPaneLayout}.
   */
  _BasicTabbedPaneUI$TabbedPaneLayout(): this {
    return this;
  }
  addLayoutComponent$String$Component(name: string, comp: Component): void {
  }
  removeLayoutComponent(comp: Component): void {
  }
  preferredLayoutSize(parent: Container): Dimension {
    return this.calculateSize(false);
  }
  minimumLayoutSize(parent: Container): Dimension {
    return this.calculateSize(true);
  }
  /**
   * Returns the calculated size.
   * @param minimum use the minimum size or preferred size
   * @return the calculated size
   */
  calculateSize(minimum: boolean): Dimension {
    let tabPlacement = this.$outer.tabPane.getTabPlacement();
    let insets = this.$outer.tabPane.getInsets$();
    let contentInsets = this.$outer.getContentBorderInsets(tabPlacement);
    let tabAreaInsets = this.$outer.getTabAreaInsets(tabPlacement);
    let zeroSize = new Dimension()._Dimension$int$int(0, 0);
    let height = 0;
    let width = 0;
    let cWidth = 0;
    let cHeight = 0;
    for (let i = 0; i < this.$outer.tabPane.getTabCount(); i++) {
      let component = this.$outer.tabPane.getComponentAt$int(i);
      if (component != null) {
        let size = minimum ? component.getMinimumSize$() : component.getPreferredSize$();
        if (size != null) {
          cHeight = Math.max(size.height_, cHeight);
          cWidth = Math.max(size.width_, cWidth);
        }
      }
    }
    width = (width + cWidth) | 0;
    height = (height + cHeight) | 0;
    let tabExtent: number;
    switch (tabPlacement) {
      case SwingConstants.LEFT:
      case SwingConstants.RIGHT:
        height = Math.max(height, this.$outer.calculateMaxTabHeight(tabPlacement));
        tabExtent = this.preferredTabAreaWidth(tabPlacement, (height - tabAreaInsets.top - tabAreaInsets.bottom) | 0);
        width = (width + tabExtent) | 0;
        break;
      case SwingConstants.TOP:
      case SwingConstants.BOTTOM:
      default:
        width = Math.max(width, this.$outer.calculateMaxTabWidth(tabPlacement));
        tabExtent = this.preferredTabAreaHeight(tabPlacement, (width - tabAreaInsets.left - tabAreaInsets.right) | 0);
        height = (height + tabExtent) | 0;
    }
    return new Dimension()._Dimension$int$int((width + insets.left + insets.right + contentInsets.left + contentInsets.right) | 0, (height + insets.bottom + insets.top + contentInsets.top + contentInsets.bottom) | 0);
  }
  /**
   * Returns the preferred tab area height.
   * @param tabPlacement the tab placement
   * @param width the width
   * @return the preferred tab area height
   */
  preferredTabAreaHeight(tabPlacement: number, width: number): number {
    let metrics = this.$outer.getFontMetrics();
    let tabCount = this.$outer.tabPane.getTabCount();
    let total = 0;
    if (tabCount > 0) {
      let rows = 1;
      let x = 0;
      let maxTabHeight = this.$outer.calculateMaxTabHeight(tabPlacement);
      for (let i = 0; i < tabCount; i++) {
        let tabWidth = this.$outer.calculateTabWidth(tabPlacement, i, metrics);
        if (x !== 0 && ((x + tabWidth) | 0) > width) {
          rows++;
          x = 0;
        }
        x = (x + tabWidth) | 0;
      }
      total = this.$outer.calculateTabAreaHeight(tabPlacement, rows, maxTabHeight);
    }
    return total;
  }
  /**
   * Returns the preferred tab area width.
   * @param tabPlacement the tab placement
   * @param height the height
   * @return the preferred tab area width
   */
  preferredTabAreaWidth(tabPlacement: number, height: number): number {
    let metrics = this.$outer.getFontMetrics();
    let tabCount = this.$outer.tabPane.getTabCount();
    let total = 0;
    if (tabCount > 0) {
      let columns = 1;
      let y = 0;
      let fontHeight = metrics.getHeight();
      this.$outer.maxTabWidth = this.$outer.calculateMaxTabWidth(tabPlacement);
      for (let i = 0; i < tabCount; i++) {
        let tabHeight = this.$outer.calculateTabHeight(tabPlacement, i, fontHeight);
        if (y !== 0 && ((y + tabHeight) | 0) > height) {
          columns++;
          y = 0;
        }
        y = (y + tabHeight) | 0;
      }
      total = this.$outer.calculateTabAreaWidth(tabPlacement, columns, this.$outer.maxTabWidth);
    }
    return total;
  }
  /**
   * {@inheritDoc}
   */
  layoutContainer$Container(parent: Container): void {
    this.$outer.setRolloverTab$int(-1);
    let tabPlacement = this.$outer.tabPane.getTabPlacement();
    let insets = this.$outer.tabPane.getInsets$();
    let selectedIndex = this.$outer.tabPane.getSelectedIndex();
    let visibleComponent = this.$outer.getVisibleComponent();
    this.calculateLayoutInfo();
    let selectedComponent = null;
    if (selectedIndex < 0) {
      if (visibleComponent != null) {
        this.$outer.setVisibleComponent(null);
      }
    } else {
      selectedComponent = this.$outer.tabPane.getComponentAt$int(selectedIndex);
    }
    let cx: number;
    let cy: number;
    let cw: number;
    let ch: number;
    let totalTabWidth = 0;
    let totalTabHeight = 0;
    let contentInsets = this.$outer.getContentBorderInsets(tabPlacement);
    let shouldChangeFocus = false;
    if (selectedComponent != null) {
      if (selectedComponent !== visibleComponent && visibleComponent != null) {
        if (SwingUtilities.findFocusOwner(visibleComponent) != null) {
          shouldChangeFocus = true;
        }
      }
      this.$outer.setVisibleComponent(selectedComponent);
    }
    let bounds = this.$outer.tabPane.getBounds$();
    let numChildren = this.$outer.tabPane.getComponentCount();
    if (numChildren > 0) {
      switch (tabPlacement) {
        case SwingConstants.LEFT:
          totalTabWidth = this.$outer.calculateTabAreaWidth(tabPlacement, this.$outer.runCount, this.$outer.maxTabWidth);
          cx = (insets.left + totalTabWidth + contentInsets.left) | 0;
          cy = (insets.top + contentInsets.top) | 0;
          break;
        case SwingConstants.RIGHT:
          totalTabWidth = this.$outer.calculateTabAreaWidth(tabPlacement, this.$outer.runCount, this.$outer.maxTabWidth);
          cx = (insets.left + contentInsets.left) | 0;
          cy = (insets.top + contentInsets.top) | 0;
          break;
        case SwingConstants.BOTTOM:
          totalTabHeight = this.$outer.calculateTabAreaHeight(tabPlacement, this.$outer.runCount, this.$outer.maxTabHeight);
          cx = (insets.left + contentInsets.left) | 0;
          cy = (insets.top + contentInsets.top) | 0;
          break;
        case SwingConstants.TOP:
        default:
          totalTabHeight = this.$outer.calculateTabAreaHeight(tabPlacement, this.$outer.runCount, this.$outer.maxTabHeight);
          cx = (insets.left + contentInsets.left) | 0;
          cy = (insets.top + totalTabHeight + contentInsets.top) | 0;
      }
      cw = (bounds.width_ - totalTabWidth - insets.left - insets.right - contentInsets.left - contentInsets.right) | 0;
      ch = (bounds.height_ - totalTabHeight - insets.top - insets.bottom - contentInsets.top - contentInsets.bottom) | 0;
      for (let i = 0; i < numChildren; i++) {
        let child = this.$outer.tabPane.getComponent$int(i);
        if (child === this.$outer.tabContainer) {
          let tabContainerWidth = totalTabWidth === 0 ? bounds.width_ : (totalTabWidth + insets.left + insets.right + contentInsets.left + contentInsets.right) | 0;
          let tabContainerHeight = totalTabHeight === 0 ? bounds.height_ : (totalTabHeight + insets.top + insets.bottom + contentInsets.top + contentInsets.bottom) | 0;
          let tabContainerX = 0;
          let tabContainerY = 0;
          if (tabPlacement === SwingConstants.BOTTOM) {
            tabContainerY = (bounds.height_ - tabContainerHeight) | 0;
          } else if (tabPlacement === SwingConstants.RIGHT) {
            tabContainerX = (bounds.width_ - tabContainerWidth) | 0;
          }
          child.setBounds$int$int$int$int(tabContainerX, tabContainerY, tabContainerWidth, tabContainerHeight);
        } else {
          child.setBounds$int$int$int$int(cx, cy, cw, ch);
        }
      }
    }
    this.layoutTabComponents();
    if (shouldChangeFocus) {
      if (!this.$outer.requestFocusForVisibleComponent()) {
        this.$outer.tabPane.requestFocus$();
      }
    }
  }
  /**
   * Calculates the layout info.
   */
  calculateLayoutInfo(): void {
    let tabCount = this.$outer.tabPane.getTabCount();
    this.$outer.assureRectsCreated(tabCount);
    this.calculateTabRects(this.$outer.tabPane.getTabPlacement(), tabCount);
    this.$outer.isRunsDirty = false;
  }
  layoutTabComponents(): void {
    if (this.$outer.tabContainer == null) {
      return;
    }
    let rect = new Rectangle()._Rectangle$();
    let delta = new Point()._Point$int$int(-this.$outer.tabContainer.getX(), -this.$outer.tabContainer.getY());
    if (this.$outer.scrollableTabLayoutEnabled()) {
      this.$outer.translatePointToTabPanel(0, 0, delta);
    }
    for (let i = 0; i < this.$outer.tabPane.getTabCount(); i++) {
      let c = this.$outer.tabPane.getTabComponentAt(i);
      if (c == null) {
        continue;
      }
      this.$outer.getTabBounds$int$Rectangle(i, rect);
      let preferredSize = c.getPreferredSize$();
      let insets = this.$outer.getTabInsets(this.$outer.tabPane.getTabPlacement(), i);
      let outerX = (rect.x_ + insets.left + delta.x_) | 0;
      let outerY = (rect.y_ + insets.top + delta.y_) | 0;
      let outerWidth = (rect.width_ - insets.left - insets.right) | 0;
      let outerHeight = (rect.height_ - insets.top - insets.bottom) | 0;
      let x = (outerX + $J.idiv(((outerWidth - preferredSize.width_) | 0), 2)) | 0;
      let y = (outerY + $J.idiv(((outerHeight - preferredSize.height_) | 0), 2)) | 0;
      let tabPlacement = this.$outer.tabPane.getTabPlacement();
      let isSeleceted = i === this.$outer.tabPane.getSelectedIndex();
      c.setBounds$int$int$int$int((x + this.$outer.getTabLabelShiftX(tabPlacement, i, isSeleceted)) | 0, (y + this.$outer.getTabLabelShiftY(tabPlacement, i, isSeleceted)) | 0, preferredSize.width_, preferredSize.height_);
    }
  }
  /**
   * Calculate the tab rectangles.
   * @param tabPlacement the tab placement
   * @param tabCount the tab count
   */
  calculateTabRects(tabPlacement: number, tabCount: number): void {
    let metrics = this.$outer.getFontMetrics();
    let size = this.$outer.tabPane.getSize$();
    let insets = this.$outer.tabPane.getInsets$();
    let tabAreaInsets = this.$outer.getTabAreaInsets(tabPlacement);
    let fontHeight = metrics.getHeight();
    let selectedIndex = this.$outer.tabPane.getSelectedIndex();
    let tabRunOverlay: number;
    let i: number;
    let j: number;
    let x: number;
    let y: number;
    let returnAt: number;
    let verticalTabRuns = (tabPlacement === SwingConstants.LEFT || tabPlacement === SwingConstants.RIGHT);
    let leftToRight = BasicGraphicsUtils.isLeftToRight(this.$outer.tabPane);
    switch (tabPlacement) {
      case SwingConstants.LEFT:
        this.$outer.maxTabWidth = this.$outer.calculateMaxTabWidth(tabPlacement);
        x = (insets.left + tabAreaInsets.left) | 0;
        y = (insets.top + tabAreaInsets.top) | 0;
        returnAt = (size.height_ - (insets.bottom + tabAreaInsets.bottom)) | 0;
        break;
      case SwingConstants.RIGHT:
        this.$outer.maxTabWidth = this.$outer.calculateMaxTabWidth(tabPlacement);
        x = (size.width_ - insets.right - tabAreaInsets.right - this.$outer.maxTabWidth) | 0;
        y = (insets.top + tabAreaInsets.top) | 0;
        returnAt = (size.height_ - (insets.bottom + tabAreaInsets.bottom)) | 0;
        break;
      case SwingConstants.BOTTOM:
        this.$outer.maxTabHeight = this.$outer.calculateMaxTabHeight(tabPlacement);
        x = (insets.left + tabAreaInsets.left) | 0;
        y = (size.height_ - insets.bottom - tabAreaInsets.bottom - this.$outer.maxTabHeight) | 0;
        returnAt = (size.width_ - (insets.right + tabAreaInsets.right)) | 0;
        break;
      case SwingConstants.TOP:
      default:
        this.$outer.maxTabHeight = this.$outer.calculateMaxTabHeight(tabPlacement);
        x = (insets.left + tabAreaInsets.left) | 0;
        y = (insets.top + tabAreaInsets.top) | 0;
        returnAt = (size.width_ - (insets.right + tabAreaInsets.right)) | 0;
        break;
    }
    tabRunOverlay = this.$outer.getTabRunOverlay(tabPlacement);
    this.$outer.runCount = 0;
    this.$outer.selectedRun = -1;
    if (tabCount === 0) {
      return;
    }
    let rect: Rectangle;
    for (i = 0; i < tabCount; i++) {
      rect = this.$outer.rects[i];
      if (!verticalTabRuns) {
        if (i > 0) {
          rect.x_ = ((this.$outer.rects[(i - 1) | 0]).x_ + (this.$outer.rects[(i - 1) | 0]).width_) | 0;
        } else {
          this.$outer.tabRuns[0] = 0;
          this.$outer.runCount = 1;
          this.$outer.maxTabWidth = 0;
          rect.x_ = x;
        }
        rect.width_ = this.$outer.calculateTabWidth(tabPlacement, i, metrics);
        this.$outer.maxTabWidth = Math.max(this.$outer.maxTabWidth, rect.width_);
        if (rect.x_ !== x && ((rect.x_ + rect.width_) | 0) > returnAt) {
          if (this.$outer.runCount > ((this.$outer.tabRuns.length - 1) | 0)) {
            this.$outer.expandTabRunsArray();
          }
          this.$outer.tabRuns[this.$outer.runCount] = i;
          this.$outer.runCount++;
          rect.x_ = x;
        }
        rect.y_ = y;
        rect.height_ = this.$outer.maxTabHeight;
      } else {
        if (i > 0) {
          rect.y_ = ((this.$outer.rects[(i - 1) | 0]).y_ + (this.$outer.rects[(i - 1) | 0]).height_) | 0;
        } else {
          this.$outer.tabRuns[0] = 0;
          this.$outer.runCount = 1;
          this.$outer.maxTabHeight = 0;
          rect.y_ = y;
        }
        rect.height_ = this.$outer.calculateTabHeight(tabPlacement, i, fontHeight);
        this.$outer.maxTabHeight = Math.max(this.$outer.maxTabHeight, rect.height_);
        if (rect.y_ !== y && ((rect.y_ + rect.height_) | 0) > returnAt) {
          if (this.$outer.runCount > ((this.$outer.tabRuns.length - 1) | 0)) {
            this.$outer.expandTabRunsArray();
          }
          this.$outer.tabRuns[this.$outer.runCount] = i;
          this.$outer.runCount++;
          rect.y_ = y;
        }
        rect.x_ = x;
        rect.width_ = this.$outer.maxTabWidth;
      }
      if (i === selectedIndex) {
        this.$outer.selectedRun = (this.$outer.runCount - 1) | 0;
      }
    }
    if (this.$outer.runCount > 1) {
      this.normalizeTabRuns(tabPlacement, tabCount, verticalTabRuns ? y : x, returnAt);
      this.$outer.selectedRun = this.$outer.getRunForTab(tabCount, selectedIndex);
      if (this.$outer.shouldRotateTabRuns$int(tabPlacement)) {
        this.rotateTabRuns(tabPlacement, this.$outer.selectedRun);
      }
    }
    for (i = (this.$outer.runCount - 1) | 0; i >= 0; i--) {
      let start = this.$outer.tabRuns[i];
      let next = this.$outer.tabRuns[i === ((this.$outer.runCount - 1) | 0) ? 0 : (i + 1) | 0];
      let end = (next !== 0 ? (next - 1) | 0 : (tabCount - 1) | 0);
      if (!verticalTabRuns) {
        for (j = start; j <= end; j++) {
          rect = this.$outer.rects[j];
          rect.y_ = y;
          rect.x_ = (rect.x_ + this.$outer.getTabRunIndent(tabPlacement, i)) | 0;
        }
        if (this.$outer.shouldPadTabRun(tabPlacement, i)) {
          this.padTabRun(tabPlacement, start, end, returnAt);
        }
        if (tabPlacement === SwingConstants.BOTTOM) {
          y = (y - (this.$outer.maxTabHeight - tabRunOverlay)) | 0;
        } else {
          y = (y + (this.$outer.maxTabHeight - tabRunOverlay)) | 0;
        }
      } else {
        for (j = start; j <= end; j++) {
          rect = this.$outer.rects[j];
          rect.x_ = x;
          rect.y_ = (rect.y_ + this.$outer.getTabRunIndent(tabPlacement, i)) | 0;
        }
        if (this.$outer.shouldPadTabRun(tabPlacement, i)) {
          this.padTabRun(tabPlacement, start, end, returnAt);
        }
        if (tabPlacement === SwingConstants.RIGHT) {
          x = (x - (this.$outer.maxTabWidth - tabRunOverlay)) | 0;
        } else {
          x = (x + (this.$outer.maxTabWidth - tabRunOverlay)) | 0;
        }
      }
    }
    this.padSelectedTab(tabPlacement, selectedIndex);
    if (!leftToRight && !verticalTabRuns) {
      let rightMargin = (size.width_ - (insets.right + tabAreaInsets.right)) | 0;
      for (i = 0; i < tabCount; i++) {
        this.$outer.rects[i].x_ = (rightMargin - this.$outer.rects[i].x_ - this.$outer.rects[i].width_) | 0;
      }
    }
  }
  /**
   * Rotates the run-index array so that the selected run is run[0].
   * @param tabPlacement the tab placement
   * @param selectedRun the selected run
   */
  rotateTabRuns(tabPlacement: number, selectedRun: number): void {
    for (let i = 0; i < selectedRun; i++) {
      let save = this.$outer.tabRuns[0];
      for (let j = 1; j < this.$outer.runCount; j++) {
        (this.$outer.tabRuns[(j - 1) | 0]) = this.$outer.tabRuns[j];
      }
      (this.$outer.tabRuns[(this.$outer.runCount - 1) | 0]) = save;
    }
  }
  /**
   * Normalizes the tab runs.
   * @param tabPlacement the tab placement
   * @param tabCount the tab count
   * @param start the start
   * @param max the max
   */
  normalizeTabRuns(tabPlacement: number, tabCount: number, start: number, max: number): void {
    let verticalTabRuns = (tabPlacement === SwingConstants.LEFT || tabPlacement === SwingConstants.RIGHT);
    let run = (this.$outer.runCount - 1) | 0;
    let keepAdjusting = true;
    let weight = 1.25;
    while (keepAdjusting) {
      let last = this.$outer.lastTabInRun(tabCount, run);
      let prevLast = this.$outer.lastTabInRun(tabCount, (run - 1) | 0);
      let end: number;
      let prevLastLen: number;
      if (!verticalTabRuns) {
        end = (this.$outer.rects[last].x_ + this.$outer.rects[last].width_) | 0;
        prevLastLen = $J.d2i((this.$outer.maxTabWidth * weight));
      } else {
        end = (this.$outer.rects[last].y_ + this.$outer.rects[last].height_) | 0;
        prevLastLen = $J.d2i((this.$outer.maxTabHeight * weight * 2));
      }
      if (((max - end) | 0) > prevLastLen) {
        this.$outer.tabRuns[run] = prevLast;
        if (!verticalTabRuns) {
          this.$outer.rects[prevLast].x_ = start;
        } else {
          this.$outer.rects[prevLast].y_ = start;
        }
        for (let i = (prevLast + 1) | 0; i <= last; i++) {
          if (!verticalTabRuns) {
            this.$outer.rects[i].x_ = ((this.$outer.rects[(i - 1) | 0]).x_ + (this.$outer.rects[(i - 1) | 0]).width_) | 0;
          } else {
            this.$outer.rects[i].y_ = ((this.$outer.rects[(i - 1) | 0]).y_ + (this.$outer.rects[(i - 1) | 0]).height_) | 0;
          }
        }
      } else if (run === ((this.$outer.runCount - 1) | 0)) {
        keepAdjusting = false;
      }
      if (((run - 1) | 0) > 0) {
        run = (run - 1) | 0;
      } else {
        run = (this.$outer.runCount - 1) | 0;
        weight += 0.25;
      }
    }
  }
  /**
   * Pads the tab run.
   * @param tabPlacement the tab placement
   * @param start the start
   * @param end the end
   * @param max the max
   */
  padTabRun(tabPlacement: number, start: number, end: number, max: number): void {
    let lastRect = this.$outer.rects[end];
    if (tabPlacement === SwingConstants.TOP || tabPlacement === SwingConstants.BOTTOM) {
      let runWidth = (lastRect.x_ + lastRect.width_ - this.$outer.rects[start].x_) | 0;
      let deltaWidth = (max - (lastRect.x_ + lastRect.width_)) | 0;
      let factor = Math.fround(Math.fround(deltaWidth) / Math.fround(runWidth));
      for (let j = start; j <= end; j++) {
        let pastRect = this.$outer.rects[j];
        if (j > start) {
          pastRect.x_ = ((this.$outer.rects[(j - 1) | 0]).x_ + (this.$outer.rects[(j - 1) | 0]).width_) | 0;
        }
        pastRect.width_ = (pastRect.width_ + $J.roundf(Math.fround(Math.fround(pastRect.width_) * factor))) | 0;
      }
      lastRect.width_ = (max - lastRect.x_) | 0;
    } else {
      let runHeight = (lastRect.y_ + lastRect.height_ - this.$outer.rects[start].y_) | 0;
      let deltaHeight = (max - (lastRect.y_ + lastRect.height_)) | 0;
      let factor = Math.fround(Math.fround(deltaHeight) / Math.fround(runHeight));
      for (let j = start; j <= end; j++) {
        let pastRect = this.$outer.rects[j];
        if (j > start) {
          pastRect.y_ = ((this.$outer.rects[(j - 1) | 0]).y_ + (this.$outer.rects[(j - 1) | 0]).height_) | 0;
        }
        pastRect.height_ = (pastRect.height_ + $J.roundf(Math.fround(Math.fround(pastRect.height_) * factor))) | 0;
      }
      lastRect.height_ = (max - lastRect.y_) | 0;
    }
  }
  /**
   * Pads selected tab.
   * @param tabPlacement the tab placement
   * @param selectedIndex the selected index
   */
  padSelectedTab(tabPlacement: number, selectedIndex: number): void {
    if (selectedIndex >= 0) {
      let selRect = this.$outer.rects[selectedIndex];
      let padInsets = this.$outer.getSelectedTabPadInsets(tabPlacement);
      selRect.x_ = (selRect.x_ - padInsets.left) | 0;
      selRect.width_ = (selRect.width_ + (padInsets.left + padInsets.right)) | 0;
      selRect.y_ = (selRect.y_ - padInsets.top) | 0;
      selRect.height_ = (selRect.height_ + (padInsets.top + padInsets.bottom)) | 0;
      if (!this.$outer.scrollableTabLayoutEnabled()) {
        let size = this.$outer.tabPane.getSize$();
        let insets = this.$outer.tabPane.getInsets$();
        if ((tabPlacement === SwingConstants.LEFT) || (tabPlacement === SwingConstants.RIGHT)) {
          let top = (insets.top - selRect.y_) | 0;
          if (top > 0) {
            selRect.y_ = (selRect.y_ + top) | 0;
            selRect.height_ = (selRect.height_ - top) | 0;
          }
          let bottom = (selRect.y_ + selRect.height_ + insets.bottom - size.height_) | 0;
          if (bottom > 0) {
            selRect.height_ = (selRect.height_ - bottom) | 0;
          }
        } else {
          let left = (insets.left - selRect.x_) | 0;
          if (left > 0) {
            selRect.x_ = (selRect.x_ + left) | 0;
            selRect.width_ = (selRect.width_ - left) | 0;
          }
          let right = (selRect.x_ + selRect.width_ + insets.right - size.width_) | 0;
          if (right > 0) {
            selRect.width_ = (selRect.width_ - right) | 0;
          }
        }
      }
    }
  }
}

export class BasicTabbedPaneUI$TabbedPaneScrollLayout extends BasicTabbedPaneUI$TabbedPaneLayout {
  _BasicTabbedPaneUI$TabbedPaneScrollLayout(): this {
    this._BasicTabbedPaneUI$TabbedPaneLayout();
    return this;
  }
  preferredTabAreaHeight(tabPlacement: number, width: number): number {
    return this.$outer.calculateTabAreaHeight(tabPlacement, 1, this.$outer.calculateMaxTabHeight(tabPlacement));
  }
  preferredTabAreaWidth(tabPlacement: number, height: number): number {
    return this.$outer.calculateTabAreaWidth(tabPlacement, 1, this.$outer.calculateMaxTabWidth(tabPlacement));
  }
  layoutContainer$Container(parent: Container): void {
    this.$outer.setRolloverTab$int(-1);
    let tabPlacement = this.$outer.tabPane.getTabPlacement();
    let tabCount = this.$outer.tabPane.getTabCount();
    let insets = this.$outer.tabPane.getInsets$();
    let selectedIndex = this.$outer.tabPane.getSelectedIndex();
    let visibleComponent = this.$outer.getVisibleComponent();
    this.calculateLayoutInfo();
    let selectedComponent = null;
    if (selectedIndex < 0) {
      if (visibleComponent != null) {
        this.$outer.setVisibleComponent(null);
      }
    } else {
      selectedComponent = this.$outer.tabPane.getComponentAt$int(selectedIndex);
    }
    if (this.$outer.tabPane.getTabCount() === 0) {
      this.$outer.tabScroller.croppedEdge.resetParams();
      this.$outer.tabScroller.scrollForwardButton.setVisible(false);
      this.$outer.tabScroller.scrollBackwardButton.setVisible(false);
      return;
    }
    let shouldChangeFocus = false;
    if (selectedComponent != null) {
      if (selectedComponent !== visibleComponent && visibleComponent != null) {
        if (SwingUtilities.findFocusOwner(visibleComponent) != null) {
          shouldChangeFocus = true;
        }
      }
      this.$outer.setVisibleComponent(selectedComponent);
    }
    let tx: number;
    let ty: number;
    let tw: number;
    let th: number;
    let cx: number;
    let cy: number;
    let cw: number;
    let ch: number;
    let contentInsets = this.$outer.getContentBorderInsets(tabPlacement);
    let bounds = this.$outer.tabPane.getBounds$();
    let numChildren = this.$outer.tabPane.getComponentCount();
    if (numChildren > 0) {
      switch (tabPlacement) {
        case SwingConstants.LEFT:
          tw = this.$outer.calculateTabAreaWidth(tabPlacement, this.$outer.runCount, this.$outer.maxTabWidth);
          th = (bounds.height_ - insets.top - insets.bottom) | 0;
          tx = insets.left;
          ty = insets.top;
          cx = (tx + tw + contentInsets.left) | 0;
          cy = (ty + contentInsets.top) | 0;
          cw = (bounds.width_ - insets.left - insets.right - tw - contentInsets.left - contentInsets.right) | 0;
          ch = (bounds.height_ - insets.top - insets.bottom - contentInsets.top - contentInsets.bottom) | 0;
          break;
        case SwingConstants.RIGHT:
          tw = this.$outer.calculateTabAreaWidth(tabPlacement, this.$outer.runCount, this.$outer.maxTabWidth);
          th = (bounds.height_ - insets.top - insets.bottom) | 0;
          tx = (bounds.width_ - insets.right - tw) | 0;
          ty = insets.top;
          cx = (insets.left + contentInsets.left) | 0;
          cy = (insets.top + contentInsets.top) | 0;
          cw = (bounds.width_ - insets.left - insets.right - tw - contentInsets.left - contentInsets.right) | 0;
          ch = (bounds.height_ - insets.top - insets.bottom - contentInsets.top - contentInsets.bottom) | 0;
          break;
        case SwingConstants.BOTTOM:
          tw = (bounds.width_ - insets.left - insets.right) | 0;
          th = this.$outer.calculateTabAreaHeight(tabPlacement, this.$outer.runCount, this.$outer.maxTabHeight);
          tx = insets.left;
          ty = (bounds.height_ - insets.bottom - th) | 0;
          cx = (insets.left + contentInsets.left) | 0;
          cy = (insets.top + contentInsets.top) | 0;
          cw = (bounds.width_ - insets.left - insets.right - contentInsets.left - contentInsets.right) | 0;
          ch = (bounds.height_ - insets.top - insets.bottom - th - contentInsets.top - contentInsets.bottom) | 0;
          break;
        case SwingConstants.TOP:
        default:
          tw = (bounds.width_ - insets.left - insets.right) | 0;
          th = this.$outer.calculateTabAreaHeight(tabPlacement, this.$outer.runCount, this.$outer.maxTabHeight);
          tx = insets.left;
          ty = insets.top;
          cx = (tx + contentInsets.left) | 0;
          cy = (ty + th + contentInsets.top) | 0;
          cw = (bounds.width_ - insets.left - insets.right - contentInsets.left - contentInsets.right) | 0;
          ch = (bounds.height_ - insets.top - insets.bottom - th - contentInsets.top - contentInsets.bottom) | 0;
      }
      for (let i = 0; i < numChildren; i++) {
        let child = this.$outer.tabPane.getComponent$int(i);
        if (this.$outer.tabScroller != null && child === this.$outer.tabScroller.viewport) {
          let viewport = child;
          let viewRect = viewport.getViewRect();
          let vw = tw;
          let vh = th;
          let butSize = this.$outer.tabScroller.scrollForwardButton.getPreferredSize$();
          {
            let totalTabHeight: number, totalTabWidth: number;
            switch (tabPlacement) {
              case SwingConstants.LEFT:
              case SwingConstants.RIGHT:
                totalTabHeight = ((this.$outer.rects[(tabCount - 1) | 0]).y_ + (this.$outer.rects[(tabCount - 1) | 0]).height_) | 0;
                if (totalTabHeight > th) {
                  vh = (th > Math.imul(2, butSize.height_)) ? (th - Math.imul(2, butSize.height_)) | 0 : 0;
                  if (((totalTabHeight - viewRect.y_) | 0) <= vh) {
                    vh = (totalTabHeight - viewRect.y_) | 0;
                  }
                }
                break;
              case SwingConstants.BOTTOM:
              case SwingConstants.TOP:
              default:
                totalTabWidth = ((this.$outer.rects[(tabCount - 1) | 0]).x_ + (this.$outer.rects[(tabCount - 1) | 0]).width_) | 0;
                if (totalTabWidth > tw) {
                  vw = (tw > Math.imul(2, butSize.width_)) ? (tw - Math.imul(2, butSize.width_)) | 0 : 0;
                  if (((totalTabWidth - viewRect.x_) | 0) <= vw) {
                    vw = (totalTabWidth - viewRect.x_) | 0;
                  }
                }
            }
          }
          child.setBounds$int$int$int$int(tx, ty, vw, vh);
        } else if (this.$outer.tabScroller != null && (child === this.$outer.tabScroller.scrollForwardButton || child === this.$outer.tabScroller.scrollBackwardButton)) {
          let scrollbutton = child;
          let bsize = scrollbutton.getPreferredSize$();
          let bx = 0;
          let by = 0;
          let bw = bsize.width_;
          let bh = bsize.height_;
          let visible = false;
          {
            let totalTabHeight: number, totalTabWidth: number;
            switch (tabPlacement) {
              case SwingConstants.LEFT:
              case SwingConstants.RIGHT:
                totalTabHeight = ((this.$outer.rects[(tabCount - 1) | 0]).y_ + (this.$outer.rects[(tabCount - 1) | 0]).height_) | 0;
                if (totalTabHeight > th) {
                  visible = true;
                  bx = (tabPlacement === SwingConstants.LEFT ? (tx + tw - bsize.width_) | 0 : tx);
                  by = (child === this.$outer.tabScroller.scrollForwardButton) ? (bounds.height_ - insets.bottom - bsize.height_) | 0 : (bounds.height_ - insets.bottom - Math.imul(2, bsize.height_)) | 0;
                }
                break;
              case SwingConstants.BOTTOM:
              case SwingConstants.TOP:
              default:
                totalTabWidth = ((this.$outer.rects[(tabCount - 1) | 0]).x_ + (this.$outer.rects[(tabCount - 1) | 0]).width_) | 0;
                if (totalTabWidth > tw) {
                  visible = true;
                  bx = (child === this.$outer.tabScroller.scrollForwardButton) ? (bounds.width_ - insets.left - bsize.width_) | 0 : (bounds.width_ - insets.left - Math.imul(2, bsize.width_)) | 0;
                  by = (tabPlacement === SwingConstants.TOP ? (ty + th - bsize.height_) | 0 : ty);
                }
            }
          }
          child.setVisible(visible);
          if (visible) {
            child.setBounds$int$int$int$int(bx, by, bw, bh);
          }
        } else {
          child.setBounds$int$int$int$int(cx, cy, cw, ch);
        }
      }
      super.layoutTabComponents();
      this.layoutCroppedEdge();
      if (shouldChangeFocus) {
        if (!this.$outer.requestFocusForVisibleComponent()) {
          this.$outer.tabPane.requestFocus$();
        }
      }
    }
  }
  layoutCroppedEdge(): void {
    this.$outer.tabScroller.croppedEdge.resetParams();
    let viewRect = this.$outer.tabScroller.viewport.getViewRect();
    let cropline: number;
    for (let i = 0; i < this.$outer.rects.length; i++) {
      let tabRect = this.$outer.rects[i];
      switch (this.$outer.tabPane.getTabPlacement()) {
        case SwingConstants.LEFT:
        case SwingConstants.RIGHT:
          cropline = (viewRect.y_ + viewRect.height_) | 0;
          if ((tabRect.y_ < cropline) && (((tabRect.y_ + tabRect.height_) | 0) > cropline)) {
            this.$outer.tabScroller.croppedEdge.setParams(i, (cropline - tabRect.y_ - 1) | 0, -this.$outer.currentTabAreaInsets.left, 0);
          }
          break;
        case SwingConstants.TOP:
        case SwingConstants.BOTTOM:
        default:
          cropline = (viewRect.x_ + viewRect.width_) | 0;
          if ((tabRect.x_ < ((cropline - 1) | 0)) && (((tabRect.x_ + tabRect.width_) | 0) > cropline)) {
            this.$outer.tabScroller.croppedEdge.setParams(i, (cropline - tabRect.x_ - 1) | 0, 0, -this.$outer.currentTabAreaInsets.top);
          }
      }
    }
  }
  calculateTabRects(tabPlacement: number, tabCount: number): void {
    let metrics = this.$outer.getFontMetrics();
    let size = this.$outer.tabPane.getSize$();
    let insets = this.$outer.tabPane.getInsets$();
    let tabAreaInsets = this.$outer.getTabAreaInsets(tabPlacement);
    let fontHeight = metrics.getHeight();
    let selectedIndex = this.$outer.tabPane.getSelectedIndex();
    let i: number;
    let verticalTabRuns = (tabPlacement === SwingConstants.LEFT || tabPlacement === SwingConstants.RIGHT);
    let leftToRight = BasicGraphicsUtils.isLeftToRight(this.$outer.tabPane);
    let x = tabAreaInsets.left;
    let y = tabAreaInsets.top;
    let totalWidth = 0;
    let totalHeight = 0;
    switch (tabPlacement) {
      case SwingConstants.LEFT:
      case SwingConstants.RIGHT:
        this.$outer.maxTabWidth = this.$outer.calculateMaxTabWidth(tabPlacement);
        break;
      case SwingConstants.BOTTOM:
      case SwingConstants.TOP:
      default:
        this.$outer.maxTabHeight = this.$outer.calculateMaxTabHeight(tabPlacement);
    }
    this.$outer.runCount = 0;
    this.$outer.selectedRun = -1;
    if (tabCount === 0) {
      return;
    }
    this.$outer.selectedRun = 0;
    this.$outer.runCount = 1;
    let rect: Rectangle;
    for (i = 0; i < tabCount; i++) {
      rect = this.$outer.rects[i];
      if (!verticalTabRuns) {
        if (i > 0) {
          rect.x_ = ((this.$outer.rects[(i - 1) | 0]).x_ + (this.$outer.rects[(i - 1) | 0]).width_) | 0;
        } else {
          this.$outer.tabRuns[0] = 0;
          this.$outer.maxTabWidth = 0;
          totalHeight = (totalHeight + this.$outer.maxTabHeight) | 0;
          rect.x_ = x;
        }
        rect.width_ = this.$outer.calculateTabWidth(tabPlacement, i, metrics);
        totalWidth = (rect.x_ + rect.width_) | 0;
        this.$outer.maxTabWidth = Math.max(this.$outer.maxTabWidth, rect.width_);
        rect.y_ = y;
        rect.height_ = this.$outer.maxTabHeight;
      } else {
        if (i > 0) {
          rect.y_ = ((this.$outer.rects[(i - 1) | 0]).y_ + (this.$outer.rects[(i - 1) | 0]).height_) | 0;
        } else {
          this.$outer.tabRuns[0] = 0;
          this.$outer.maxTabHeight = 0;
          totalWidth = this.$outer.maxTabWidth;
          rect.y_ = y;
        }
        rect.height_ = this.$outer.calculateTabHeight(tabPlacement, i, fontHeight);
        totalHeight = (rect.y_ + rect.height_) | 0;
        this.$outer.maxTabHeight = Math.max(this.$outer.maxTabHeight, rect.height_);
        rect.x_ = x;
        rect.width_ = this.$outer.maxTabWidth;
      }
    }
    if (this.$outer.tabsOverlapBorder) {
      this.padSelectedTab(tabPlacement, selectedIndex);
    }
    if (!leftToRight && !verticalTabRuns) {
      let rightMargin = (size.width_ - (insets.right + tabAreaInsets.right)) | 0;
      for (i = 0; i < tabCount; i++) {
        this.$outer.rects[i].x_ = (rightMargin - this.$outer.rects[i].x_ - this.$outer.rects[i].width_) | 0;
      }
    }
    this.$outer.tabScroller.tabPanel.setPreferredSize(new Dimension()._Dimension$int$int(totalWidth, totalHeight));
    this.$outer.tabScroller.tabPanel.invalidate();
  }
}

export class BasicTabbedPaneUI$ScrollableTabSupport extends JObject {
  viewport: BasicTabbedPaneUI$ScrollableTabViewport = null;
  tabPanel: BasicTabbedPaneUI$ScrollableTabPanel = null;
  scrollForwardButton: JButton = null;
  scrollBackwardButton: JButton = null;
  croppedEdge: BasicTabbedPaneUI$CroppedEdge = null;
  leadingTabIndex: number = 0;
  tabViewPosition: Point = null;
  _BasicTabbedPaneUI$ScrollableTabSupport(tabPlacement: number): this {
    this.tabViewPosition = new Point()._Point$int$int(0, 0);
    this.viewport = new BasicTabbedPaneUI$ScrollableTabViewport().$o(this.$outer)._BasicTabbedPaneUI$ScrollableTabViewport();
    this.tabPanel = new BasicTabbedPaneUI$ScrollableTabPanel().$o(this.$outer)._BasicTabbedPaneUI$ScrollableTabPanel();
    this.viewport.setView(this.tabPanel);
    this.viewport.addChangeListener($J.fn(this, 'stateChanged'));
    this.croppedEdge = new BasicTabbedPaneUI$CroppedEdge().$o(this.$outer)._BasicTabbedPaneUI$CroppedEdge();
    this.createButtons();
    return this;
  }
  /**
   * Recreates the scroll buttons and adds them to the TabbedPane.
   */
  createButtons(): void {
    if (this.scrollForwardButton != null) {
      this.$outer.tabPane.remove$Component(this.scrollForwardButton);
      this.scrollForwardButton.removeActionListener($J.fn(this, 'actionPerformed'));
      this.$outer.tabPane.remove$Component(this.scrollBackwardButton);
      this.scrollBackwardButton.removeActionListener($J.fn(this, 'actionPerformed'));
    }
    let tabPlacement = this.$outer.tabPane.getTabPlacement();
    if (tabPlacement === SwingConstants.TOP || tabPlacement === SwingConstants.BOTTOM) {
      this.scrollForwardButton = this.$outer.createScrollButton(SwingConstants.EAST);
      this.scrollBackwardButton = this.$outer.createScrollButton(SwingConstants.WEST);
    } else {
      this.scrollForwardButton = this.$outer.createScrollButton(SwingConstants.SOUTH);
      this.scrollBackwardButton = this.$outer.createScrollButton(SwingConstants.NORTH);
    }
    this.scrollForwardButton.addActionListener($J.fn(this, 'actionPerformed'));
    this.scrollBackwardButton.addActionListener($J.fn(this, 'actionPerformed'));
    this.$outer.tabPane.add$Component(this.scrollForwardButton);
    this.$outer.tabPane.add$Component(this.scrollBackwardButton);
  }
  scrollForward(tabPlacement: number): void {
    let viewSize = this.viewport.getViewSize();
    let viewRect = this.viewport.getViewRect();
    if (tabPlacement === SwingConstants.TOP || tabPlacement === SwingConstants.BOTTOM) {
      if (viewRect.width_ >= ((viewSize.width_ - viewRect.x_) | 0)) {
        return;
      }
    } else {
      if (viewRect.height_ >= ((viewSize.height_ - viewRect.y_) | 0)) {
        return;
      }
    }
    this.setLeadingTabIndex(tabPlacement, (this.leadingTabIndex + 1) | 0);
  }
  scrollBackward(tabPlacement: number): void {
    if (this.leadingTabIndex === 0) {
      return;
    }
    this.setLeadingTabIndex(tabPlacement, (this.leadingTabIndex - 1) | 0);
  }
  setLeadingTabIndex(tabPlacement: number, index: number): void {
    this.leadingTabIndex = index;
    let viewSize = this.viewport.getViewSize();
    let viewRect = this.viewport.getViewRect();
    switch (tabPlacement) {
      case SwingConstants.TOP:
      case SwingConstants.BOTTOM:
        this.tabViewPosition.x_ = this.leadingTabIndex === 0 ? 0 : this.$outer.rects[this.leadingTabIndex].x_;
        if (((viewSize.width_ - this.tabViewPosition.x_) | 0) < viewRect.width_) {
          let extentSize = new Dimension()._Dimension$int$int((viewSize.width_ - this.tabViewPosition.x_) | 0, viewRect.height_);
          this.viewport.setExtentSize(extentSize);
        }
        break;
      case SwingConstants.LEFT:
      case SwingConstants.RIGHT:
        this.tabViewPosition.y_ = this.leadingTabIndex === 0 ? 0 : this.$outer.rects[this.leadingTabIndex].y_;
        if (((viewSize.height_ - this.tabViewPosition.y_) | 0) < viewRect.height_) {
          let extentSize = new Dimension()._Dimension$int$int(viewRect.width_, (viewSize.height_ - this.tabViewPosition.y_) | 0);
          this.viewport.setExtentSize(extentSize);
        }
    }
    this.viewport.setViewPosition(this.tabViewPosition);
  }
  stateChanged(e: ChangeEvent): void {
    this.updateView();
  }
  updateView(): void {
    let tabPlacement = this.$outer.tabPane.getTabPlacement();
    let tabCount = this.$outer.tabPane.getTabCount();
    this.$outer.assureRectsCreated(tabCount);
    let vpRect = this.viewport.getBounds$();
    let viewSize = this.viewport.getViewSize();
    let viewRect = this.viewport.getViewRect();
    this.leadingTabIndex = this.$outer.getClosestTab(viewRect.x_, viewRect.y_);
    if (((this.leadingTabIndex + 1) | 0) < tabCount) {
      switch (tabPlacement) {
        case SwingConstants.TOP:
        case SwingConstants.BOTTOM:
          if (this.$outer.rects[this.leadingTabIndex].x_ < viewRect.x_) {
            this.leadingTabIndex++;
          }
          break;
        case SwingConstants.LEFT:
        case SwingConstants.RIGHT:
          if (this.$outer.rects[this.leadingTabIndex].y_ < viewRect.y_) {
            this.leadingTabIndex++;
          }
          break;
      }
    }
    let contentInsets = this.$outer.getContentBorderInsets(tabPlacement);
    switch (tabPlacement) {
      case SwingConstants.LEFT:
        this.$outer.tabPane.repaint$int$int$int$int((vpRect.x_ + vpRect.width_) | 0, vpRect.y_, contentInsets.left, vpRect.height_);
        this.scrollBackwardButton.setEnabled(viewRect.y_ > 0 && this.leadingTabIndex > 0);
        this.scrollForwardButton.setEnabled(this.leadingTabIndex < ((tabCount - 1) | 0) && ((viewSize.height_ - viewRect.y_) | 0) > viewRect.height_);
        break;
      case SwingConstants.RIGHT:
        this.$outer.tabPane.repaint$int$int$int$int((vpRect.x_ - contentInsets.right) | 0, vpRect.y_, contentInsets.right, vpRect.height_);
        this.scrollBackwardButton.setEnabled(viewRect.y_ > 0 && this.leadingTabIndex > 0);
        this.scrollForwardButton.setEnabled(this.leadingTabIndex < ((tabCount - 1) | 0) && ((viewSize.height_ - viewRect.y_) | 0) > viewRect.height_);
        break;
      case SwingConstants.BOTTOM:
        this.$outer.tabPane.repaint$int$int$int$int(vpRect.x_, (vpRect.y_ - contentInsets.bottom) | 0, vpRect.width_, contentInsets.bottom);
        this.scrollBackwardButton.setEnabled(viewRect.x_ > 0 && this.leadingTabIndex > 0);
        this.scrollForwardButton.setEnabled(this.leadingTabIndex < ((tabCount - 1) | 0) && ((viewSize.width_ - viewRect.x_) | 0) > viewRect.width_);
        break;
      case SwingConstants.TOP:
      default:
        this.$outer.tabPane.repaint$int$int$int$int(vpRect.x_, (vpRect.y_ + vpRect.height_) | 0, vpRect.width_, contentInsets.top);
        this.scrollBackwardButton.setEnabled(viewRect.x_ > 0 && this.leadingTabIndex > 0);
        this.scrollForwardButton.setEnabled(this.leadingTabIndex < ((tabCount - 1) | 0) && ((viewSize.width_ - viewRect.x_) | 0) > viewRect.width_);
    }
  }
  /**
   * ActionListener for the scroll buttons.
   */
  actionPerformed(e: ActionEvent): void {
    let map = this.$outer.tabPane.getActionMap$();
    if (map != null) {
      let actionKey: string;
      if (e.getSource() === this.scrollForwardButton) {
        actionKey = 'scrollTabsForwardAction';
      } else {
        actionKey = 'scrollTabsBackwardAction';
      }
      let action = map.get(actionKey);
      if (action != null && action.isEnabled()) {
        action.actionPerformed(new ActionEvent()._ActionEvent$Object$int$String$long$int(this.$outer.tabPane, ActionEvent.ACTION_PERFORMED, null, e.getWhen(), e.getModifiers()));
      }
    }
  }
  toString(): string {
    return 'viewport.viewSize=' + $J.str(this.viewport.getViewSize()) + '\nviewport.viewRectangle=' + $J.str(this.viewport.getViewRect()) + '\nleadingTabIndex=' + this.leadingTabIndex + '\ntabViewPosition=' + $J.str(this.tabViewPosition);
  }
}

export class BasicTabbedPaneUI$ScrollableTabViewport extends JViewport {
  _BasicTabbedPaneUI$ScrollableTabViewport(): this {
    this._JViewport();
    this.setName('TabbedPane.scrollableViewport');
    this.setScrollMode(JViewport.SIMPLE_SCROLL_MODE);
    this.setOpaque(this.$outer.tabPane.isOpaque());
    let bgColor = UIManager.getColor$Object('TabbedPane.tabAreaBackground');
    if (bgColor == null) {
      bgColor = this.$outer.tabPane.getBackground();
    }
    this.setBackground(bgColor);
    return this;
  }
}

export class BasicTabbedPaneUI$ScrollableTabPanel extends JPanel {
  _BasicTabbedPaneUI$ScrollableTabPanel(): this {
    this._JPanel$LayoutManager(null);
    this.setOpaque(this.$outer.tabPane.isOpaque());
    let background = this.$outer.tabPane.getBackground();
    let tabAreaBackground = UIManager.getColor$Object('TabbedPane.tabAreaBackground');
    if ($J.isa(background, UIResource) && tabAreaBackground != null) {
      this.setBackground(tabAreaBackground);
    } else {
      this.setBackground(background);
    }
    return this;
  }
  paintComponent(g: Graphics): void {
    super.paintComponent(g);
    this.$outer.paintTabArea(g, this.$outer.tabPane.getTabPlacement(), this.$outer.tabPane.getSelectedIndex());
    if (this.$outer.tabScroller.croppedEdge.isParamsSet() && this.$outer.tabContainer == null) {
      let croppedRect = this.$outer.rects[this.$outer.tabScroller.croppedEdge.getTabIndex()];
      g.translate$int$int(croppedRect.x_, croppedRect.y_);
      this.$outer.tabScroller.croppedEdge.paintComponent(g);
      g.translate$int$int(-croppedRect.x_, -croppedRect.y_);
    }
  }
  doLayout(): void {
    if (this.getComponentCount() > 0) {
      let child = this.getComponent$int(0);
      child.setBounds$int$int$int$int(0, 0, this.getWidth(), this.getHeight());
    }
  }
}

export class BasicTabbedPaneUI$ScrollableTabButton extends BasicArrowButton {
  _BasicTabbedPaneUI$ScrollableTabButton(direction: number): this {
    this._BasicArrowButton$int$Color$Color$Color$Color(direction, UIManager.getColor$Object('TabbedPane.selected'), UIManager.getColor$Object('TabbedPane.shadow'), UIManager.getColor$Object('TabbedPane.darkShadow'), UIManager.getColor$Object('TabbedPane.highlight'));
    return this;
  }
}

export class BasicTabbedPaneUI$Handler extends JObject {
  _BasicTabbedPaneUI$Handler(): this {
    return this;
  }
  propertyChange(e: PropertyChangeEvent): void {
    let pane = e.getSource();
    let name = e.getPropertyName();
    let isScrollLayout = this.$outer.scrollableTabLayoutEnabled();
    if (name === 'mnemonicAt') {
      this.$outer.updateMnemonics();
      pane.repaint$();
    } else if (name === 'displayedMnemonicIndexAt') {
      pane.repaint$();
    } else if (name === 'indexForTitle') {
      this.$outer.calculatedBaseline = false;
      let index = e.getNewValue();
      this.updateHtmlViews(index, false);
    } else if (name === 'tabLayoutPolicy') {
      this.$outer.uninstallUI(pane);
      this.$outer.installUI(pane);
      this.$outer.calculatedBaseline = false;
    } else if (name === 'tabPlacement') {
      if (this.$outer.scrollableTabLayoutEnabled()) {
        this.$outer.tabScroller.createButtons();
      }
      this.$outer.calculatedBaseline = false;
    } else if (name === 'opaque' && isScrollLayout) {
      let newVal = (e.getNewValue());
      this.$outer.tabScroller.tabPanel.setOpaque(newVal);
      this.$outer.tabScroller.viewport.setOpaque(newVal);
    } else if (name === 'background' && isScrollLayout) {
      let newVal = e.getNewValue();
      this.$outer.tabScroller.tabPanel.setBackground(newVal);
      this.$outer.tabScroller.viewport.setBackground(newVal);
      let newColor = this.$outer.selectedColor == null ? newVal : this.$outer.selectedColor;
      this.$outer.tabScroller.scrollForwardButton.setBackground(newColor);
      this.$outer.tabScroller.scrollBackwardButton.setBackground(newColor);
    } else if (name === 'indexForTabComponent') {
      if (this.$outer.tabContainer != null) {
        this.$outer.tabContainer.removeUnusedTabComponents();
      }
      let c = this.$outer.tabPane.getTabComponentAt(e.getNewValue());
      if (c != null) {
        if (this.$outer.tabContainer == null) {
          this.$outer.installTabContainer();
        } else {
          this.$outer.tabContainer.add$Component(c);
        }
      }
      this.$outer.tabPane.revalidate();
      this.$outer.tabPane.repaint$();
      this.$outer.calculatedBaseline = false;
    } else if (name === 'indexForNullComponent') {
      this.$outer.isRunsDirty = true;
      this.updateHtmlViews(e.getNewValue(), true);
    } else if (name === 'font' || SwingUtilities2.isScaleChanged$PropertyChangeEvent(e)) {
      this.$outer.calculatedBaseline = false;
    }
  }
  updateHtmlViews(index: number, inserted: boolean): void {
    let title = this.$outer.tabPane.getTitleAt(index);
    let htmlDisabled = this.$outer.tabPane.getClientProperty('html.disable');
    let isHTML = BasicHTML.isHTMLString(title);
    if (isHTML && !($J.equals(true, htmlDisabled))) {
      if (this.$outer.htmlViews == null) {
        this.$outer.htmlViews = this.$outer.createHTMLVector();
      } else {
        let v = BasicHTML.createHTMLView(this.$outer.tabPane, title);
        this.setHtmlView(v, inserted, index);
      }
    } else {
      if (this.$outer.htmlViews != null) {
        this.setHtmlView(null, inserted, index);
      }
    }
    this.$outer.updateMnemonics();
  }
  setHtmlView(v: View, inserted: boolean, index: number): void {
    if (inserted || index >= this.$outer.htmlViews.size()) {
      this.$outer.htmlViews.insertElementAt(v, index);
    } else {
      this.$outer.htmlViews.setElementAt(v, index);
    }
  }
  stateChanged(e: ChangeEvent): void {
    let tabPane = e.getSource();
    tabPane.revalidate();
    tabPane.repaint$();
    this.$outer.setFocusIndex(tabPane.getSelectedIndex(), false);
    if (tabPane.getLayout() instanceof BasicTabbedPaneUI$TabbedPaneScrollLayout) {
      this.$outer.ensureCurrentLayout();
      let index = tabPane.getSelectedIndex();
      if (index < this.$outer.rects.length && index !== -1) {
        this.$outer.tabScroller.tabPanel.scrollRectToVisible(this.$outer.rects[index].clone());
      }
    }
  }
  mouseClicked(e: MouseEvent): void {
  }
  mouseReleased(e: MouseEvent): void {
  }
  mouseEntered(e: MouseEvent): void {
    this.$outer.setRolloverTab$int$int$BasicTabbedPaneUI(e.getX(), e.getY());
  }
  mouseExited(e: MouseEvent): void {
    this.$outer.setRolloverTab$int(-1);
  }
  mousePressed(e: MouseEvent): void {
    if (!this.$outer.tabPane.isEnabled()) {
      return;
    }
    let tabIndex = this.$outer.tabForCoordinate$JTabbedPane$int$int(this.$outer.tabPane, e.getX(), e.getY());
    if (tabIndex >= 0 && this.$outer.tabPane.isEnabledAt(tabIndex)) {
      if (tabIndex !== this.$outer.tabPane.getSelectedIndex()) {
        this.$outer.tabPane.setSelectedIndex(tabIndex);
      } else if (this.$outer.tabPane.isRequestFocusEnabled()) {
        this.$outer.tabPane.requestFocus$Cause(FocusEvent$Cause.MOUSE_EVENT);
      }
    }
  }
  mouseDragged(e: MouseEvent): void {
  }
  mouseMoved(e: MouseEvent): void {
    this.$outer.setRolloverTab$int$int$BasicTabbedPaneUI(e.getX(), e.getY());
  }
  focusGained(e: FocusEvent): void {
    this.$outer.setFocusIndex(this.$outer.tabPane.getSelectedIndex(), true);
  }
  focusLost(e: FocusEvent): void {
    this.$outer.repaintTab(this.$outer.focusIndex);
  }
  componentAdded(e: ContainerEvent): void {
    let tp = e.getContainer();
    let child = e.getChild();
    if ($J.isa(child, UIResource)) {
      return;
    }
    this.$outer.isRunsDirty = true;
    this.updateHtmlViews(tp.indexOfComponent(child), true);
  }
  componentRemoved(e: ContainerEvent): void {
    let tp = e.getContainer();
    let child = e.getChild();
    if ($J.isa(child, UIResource)) {
      return;
    }
    let indexObj = tp.getClientProperty('__index_to_remove__');
    if (indexObj != null) {
      let index = (+indexObj);
      if (this.$outer.htmlViews != null && this.$outer.htmlViews.size() > index) {
        this.$outer.htmlViews.removeElementAt(index);
      }
      tp.putClientProperty('__index_to_remove__', null);
    }
    this.$outer.isRunsDirty = true;
    this.$outer.updateMnemonics();
    this.$outer.validateFocusIndex();
  }
}

export class BasicTabbedPaneUI$TabContainer extends JPanel {
  notifyTabbedPane: boolean = false;
  _BasicTabbedPaneUI$TabContainer(): this {
    this._JPanel$LayoutManager(null);
    this.notifyTabbedPane = true;
    this.setOpaque(false);
    return this;
  }
  remove$Component(comp: Component): void {
    let index = this.$outer.tabPane.indexOfTabComponent(comp);
    super.remove$Component(comp);
    if (this.notifyTabbedPane && index !== -1) {
      this.$outer.tabPane.setTabComponentAt(index, null);
    }
  }
  removeUnusedTabComponents(): void {
    for (let c of this.getComponents()) {
      if (!($J.isa(c, UIResource))) {
        let index = this.$outer.tabPane.indexOfTabComponent(c);
        if (index === -1) {
          super.remove$Component(c);
        }
      }
    }
  }
  isOptimizedDrawingEnabled(): boolean {
    return this.$outer.tabScroller != null && !this.$outer.tabScroller.croppedEdge.isParamsSet();
  }
  doLayout(): void {
    if (this.$outer.scrollableTabLayoutEnabled()) {
      this.$outer.tabScroller.tabPanel.repaint$();
      this.$outer.tabScroller.updateView();
    } else {
      this.$outer.tabPane.repaint$Rectangle(this.getBounds$());
    }
  }
}

export class BasicTabbedPaneUI$CroppedEdge extends JPanel {
  shape_: Shape = null;
  tabIndex: number = 0;
  cropline: number = 0;
  cropx: number = 0;
  cropy: number = 0;
  _BasicTabbedPaneUI$CroppedEdge(): this {
    this._JPanel$();
    this.setOpaque(false);
    return this;
  }
  setParams(tabIndex: number, cropline: number, cropx: number, cropy: number): void {
    this.tabIndex = tabIndex;
    this.cropline = cropline;
    this.cropx = cropx;
    this.cropy = cropy;
    let tabRect = this.$outer.rects[tabIndex];
    this.setBounds$Rectangle(tabRect);
    this.shape_ = BasicTabbedPaneUI.createCroppedTabShape(this.$outer.tabPane.getTabPlacement(), tabRect, cropline);
    if (this.getParent() == null && this.$outer.tabContainer != null) {
      this.$outer.tabContainer.add$Component$int(this, 0);
    }
  }
  resetParams(): void {
    this.shape_ = null;
    if (this.getParent() === this.$outer.tabContainer && this.$outer.tabContainer != null) {
      this.$outer.tabContainer.remove$Component(this);
    }
  }
  isParamsSet(): boolean {
    return this.shape_ != null;
  }
  getTabIndex(): number {
    return this.tabIndex;
  }
  getCropline(): number {
    return this.cropline;
  }
  getCroppedSideWidth(): number {
    return 3;
  }
  getBgColor(): Color {
    let parent = this.$outer.tabPane.getParent();
    if (parent != null) {
      let bg = parent.getBackground();
      if (bg != null) {
        return bg;
      }
    }
    return UIManager.getColor$Object('control');
  }
  paintComponent(g: Graphics): void {
    super.paintComponent(g);
    if (this.isParamsSet() && g instanceof Graphics2D) {
      let g2 = g;
      g2.clipRect(0, 0, this.getWidth(), this.getHeight());
      g2.setColor(this.getBgColor());
      g2.translate$int$int(this.cropx, this.cropy);
      g2.fill(this.shape_);
      this.$outer.paintCroppedTabEdge(g);
      g2.translate$int$int(-this.cropx, -this.cropy);
    }
  }
}

$J.define(BasicTabbedPaneUI, 'javax.swing.plaf.basic.BasicTabbedPaneUI', { kind: 'class', ifaces: ['javax.swing.SwingConstants'], sup: 'javax.swing.plaf.TabbedPaneUI', ctors: { '': '_BasicTabbedPaneUI' }, meths: { 'shouldRotateTabRuns(int)': 'shouldRotateTabRuns$int', 'getTabBounds(int,java.awt.Rectangle)': 'getTabBounds$int$Rectangle', 'tabForCoordinate(javax.swing.JTabbedPane,int,int,boolean)': 'tabForCoordinate$JTabbedPane$int$int$boolean$BasicTabbedPaneUI', 'tabForCoordinate(javax.swing.JTabbedPane,int,int)': 'tabForCoordinate$JTabbedPane$int$int', 'getTabBounds(javax.swing.JTabbedPane,int)': 'getTabBounds$JTabbedPane$int', 'getBaseline(int)': 'getBaseline$int', 'getBaseline(javax.swing.JComponent,int,int)': 'getBaseline$JComponent$int$int', 'setRolloverTab(int)': 'setRolloverTab$int', 'setRolloverTab(int,int)': 'setRolloverTab$int$int$BasicTabbedPaneUI' }, clinit: true, lazy: ['xCropLen', 'yCropLen'] });
$J.define(BasicTabbedPaneUI$Actions, 'javax.swing.plaf.basic.BasicTabbedPaneUI$Actions', { kind: 'class', sup: 'sun.swing.UIAction', ctors: { 'java.lang.String': '_BasicTabbedPaneUI$Actions' } });
$J.define(BasicTabbedPaneUI$TabbedPaneLayout, 'javax.swing.plaf.basic.BasicTabbedPaneUI$TabbedPaneLayout', { kind: 'class', ifaces: ['java.awt.LayoutManager'], sup: 'java.lang.Object', ctors: { '': '_BasicTabbedPaneUI$TabbedPaneLayout' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' }, inner: true });
$J.define(BasicTabbedPaneUI$TabbedPaneScrollLayout, 'javax.swing.plaf.basic.BasicTabbedPaneUI$TabbedPaneScrollLayout', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicTabbedPaneUI$TabbedPaneLayout', ctors: { '': '_BasicTabbedPaneUI$TabbedPaneScrollLayout' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container' }, inner: true });
$J.define(BasicTabbedPaneUI$ScrollableTabSupport, 'javax.swing.plaf.basic.BasicTabbedPaneUI$ScrollableTabSupport', { kind: 'class', ifaces: ['java.awt.event.ActionListener', 'javax.swing.event.ChangeListener'], sup: 'java.lang.Object', ctors: { 'int': '_BasicTabbedPaneUI$ScrollableTabSupport' }, inner: true });
$J.define(BasicTabbedPaneUI$ScrollableTabViewport, 'javax.swing.plaf.basic.BasicTabbedPaneUI$ScrollableTabViewport', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.JViewport', ctors: { '': '_BasicTabbedPaneUI$ScrollableTabViewport' }, inner: true });
$J.define(BasicTabbedPaneUI$ScrollableTabPanel, 'javax.swing.plaf.basic.BasicTabbedPaneUI$ScrollableTabPanel', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.JPanel', ctors: { '': '_BasicTabbedPaneUI$ScrollableTabPanel' }, inner: true });
$J.define(BasicTabbedPaneUI$ScrollableTabButton, 'javax.swing.plaf.basic.BasicTabbedPaneUI$ScrollableTabButton', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource', 'javax.swing.SwingConstants'], sup: 'javax.swing.plaf.basic.BasicArrowButton', ctors: { 'int': '_BasicTabbedPaneUI$ScrollableTabButton' } });
$J.define(BasicTabbedPaneUI$Handler, 'javax.swing.plaf.basic.BasicTabbedPaneUI$Handler', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener', 'java.awt.event.ContainerListener', 'java.awt.event.FocusListener', 'java.awt.event.MouseListener', 'java.awt.event.MouseMotionListener', 'java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_BasicTabbedPaneUI$Handler' }, inner: true });
$J.define(BasicTabbedPaneUI$TabContainer, 'javax.swing.plaf.basic.BasicTabbedPaneUI$TabContainer', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.JPanel', ctors: { '': '_BasicTabbedPaneUI$TabContainer' }, meths: { 'remove(java.awt.Component)': 'remove$Component' }, inner: true });
$J.define(BasicTabbedPaneUI$CroppedEdge, 'javax.swing.plaf.basic.BasicTabbedPaneUI$CroppedEdge', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.JPanel', ctors: { '': '_BasicTabbedPaneUI$CroppedEdge' }, inner: true });
$J.module(() => {
  Component$BaselineResizeBehavior = $J.load('java.awt.Component$BaselineResizeBehavior');
  Dimension = $J.load('java.awt.Dimension');
  Graphics2D = $J.load('java.awt.Graphics2D');
  Insets = $J.load('java.awt.Insets');
  Point = $J.load('java.awt.Point');
  Polygon = $J.load('java.awt.Polygon');
  Rectangle = $J.load('java.awt.Rectangle');
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  FocusEvent$Cause = $J.load('java.awt.event.FocusEvent$Cause');
  JComponent = $J.load('javax.swing.JComponent');
  JTabbedPane = $J.load('javax.swing.JTabbedPane');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  ComponentInputMapUIResource = $J.load('javax.swing.plaf.ComponentInputMapUIResource');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicGraphicsUtils = $J.load('javax.swing.plaf.basic.BasicGraphicsUtils');
  BasicHTML = $J.load('javax.swing.plaf.basic.BasicHTML');
  BasicLookAndFeel = $J.load('javax.swing.plaf.basic.BasicLookAndFeel');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  View = $J.load('javax.swing.text.View');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
