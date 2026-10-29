// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicMenuItemUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, JString } from '../../../../../jre/index.ts';
import { MenuItemUI } from '../MenuItemUI.ts';
import { UIAction } from '../../../../sun/swing/UIAction.ts';

let SwingUtilities3, Color, Dimension, Rectangle, InputEvent, JCheckBoxMenuItem, JComponent, JMenu, JRadioButtonMenuItem, KeyStroke, LookAndFeel, MenuSelectionManager, SwingUtilities, UIManager, ComponentInputMapUIResource, UIResource, BasicGraphicsUtils, BasicHTML, BasicLookAndFeel, LazyActionMap, View, MenuItemLayoutHelper, SwingUtilities2;

/**
 * BasicMenuItem implementation
 *
 * @author Georges Saab
 * @author David Karlton
 * @author Arnaud Weber
 * @author Fredrik Lagerblad
 */
export class BasicMenuItemUI extends MenuItemUI {
  /**
   * The instance of {@code JMenuItem}.
   */
  menuItem: JMenuItem = null;
  /**
   * The color of the selection background.
   */
  selectionBackground: Color = null;
  /**
   * The color of the selection foreground.
   */
  selectionForeground: Color = null;
  /**
   * The color of the disabled foreground.
   */
  disabledForeground: Color = null;
  /**
   * The color of the accelerator foreground.
   */
  acceleratorForeground: Color = null;
  /**
   * The color of the accelerator selection.
   */
  acceleratorSelectionForeground: Color = null;
  /**
   * Accelerator delimiter string, such as {@code '+'} in {@code 'Ctrl+C'}.
   * @since 1.7
   */
  acceleratorDelimiter: string = null;
  /**
   * The gap between the text and the icon.
   */
  defaultTextIconGap: number = 0;
  /**
   * The accelerator font.
   */
  acceleratorFont: Font = null;
  /**
   * The instance of {@code MouseInputListener}.
   */
  mouseInputListener: MouseInputListener = null;
  /**
   * The instance of {@code MenuDragMouseListener}.
   */
  menuDragMouseListener: MenuDragMouseListener = null;
  /**
   * The instance of {@code MenuKeyListener}.
   */
  menuKeyListener: MenuKeyListener = null;
  /**
   * {@code PropertyChangeListener} returned from
   * {@code createPropertyChangeListener}. You should not
   * need to access this field, rather if you want to customize the
   * {@code PropertyChangeListener} override
   * {@code createPropertyChangeListener}.
   *
   * @since 1.6
   * @see #createPropertyChangeListener
   */
  propertyChangeListener: PropertyChangeListener = null;
  handler: BasicMenuItemUI$Handler = null;
  /**
   * The arrow icon.
   */
  arrowIcon: Icon = null;
  /**
   * The check icon.
   */
  checkIcon: Icon = null;
  /**
   * The value represents if the old border is painted.
   */
  oldBorderPainted: boolean = false;
  static readonly TRACE: boolean = false;
  static readonly VERBOSE: boolean = false;
  static readonly DEBUG: boolean = false;
  /**
   * Constructs a {@code BasicMenuItemUI}.
   */
  _BasicMenuItemUI(): this {
    this._MenuItemUI();
    this.menuItem = null;
    this.arrowIcon = null;
    this.checkIcon = null;
    return this;
  }
  static loadActionMap(map: LazyActionMap): void {
    map.put$Action(new BasicMenuItemUI$Actions()._BasicMenuItemUI$Actions(BasicMenuItemUI$Actions.CLICK));
    BasicLookAndFeel.installAudioActionMap(map);
  }
  /**
   * Returns a new instance of {@code BasicMenuItemUI}.
   *
   * @param c a component
   * @return a new instance of {@code BasicMenuItemUI}
   */
  static createUI(c: JComponent): ComponentUI {
    return new BasicMenuItemUI()._BasicMenuItemUI();
  }
  installUI(c: JComponent): void {
    this.menuItem = c;
    this.installDefaults();
    this.installComponents(this.menuItem);
    this.installListeners();
    this.installKeyboardActions();
  }
  /**
   * Installs default properties.
   */
  installDefaults(): void {
    let prefix = this.getPropertyPrefix();
    this.acceleratorFont = UIManager.getFont$Object('MenuItem.acceleratorFont');
    if (this.acceleratorFont == null) {
      this.acceleratorFont = UIManager.getFont$Object('MenuItem.font');
    }
    let opaque = UIManager.get$Object(this.getPropertyPrefix() + '.opaque');
    if (opaque != null) {
      LookAndFeel.installProperty(this.menuItem, 'opaque', opaque);
    } else {
      LookAndFeel.installProperty(this.menuItem, 'opaque', true);
    }
    if (this.menuItem.getMargin() == null || ($J.isa(this.menuItem.getMargin(), UIResource))) {
      this.menuItem.setMargin(UIManager.getInsets$Object(prefix + '.margin'));
    }
    LookAndFeel.installProperty(this.menuItem, 'iconTextGap', 4);
    this.defaultTextIconGap = this.menuItem.getIconTextGap();
    LookAndFeel.installBorder(this.menuItem, prefix + '.border');
    this.oldBorderPainted = this.menuItem.isBorderPainted();
    LookAndFeel.installProperty(this.menuItem, 'borderPainted', UIManager.getBoolean$Object(prefix + '.borderPainted'));
    LookAndFeel.installColorsAndFont(this.menuItem, prefix + '.background', prefix + '.foreground', prefix + '.font');
    if (this.selectionBackground == null || $J.isa(this.selectionBackground, UIResource)) {
      this.selectionBackground = UIManager.getColor$Object(prefix + '.selectionBackground');
    }
    if (this.selectionForeground == null || $J.isa(this.selectionForeground, UIResource)) {
      this.selectionForeground = UIManager.getColor$Object(prefix + '.selectionForeground');
    }
    if (this.disabledForeground == null || $J.isa(this.disabledForeground, UIResource)) {
      this.disabledForeground = UIManager.getColor$Object(prefix + '.disabledForeground');
    }
    if (this.acceleratorForeground == null || $J.isa(this.acceleratorForeground, UIResource)) {
      this.acceleratorForeground = UIManager.getColor$Object(prefix + '.acceleratorForeground');
    }
    if (this.acceleratorSelectionForeground == null || $J.isa(this.acceleratorSelectionForeground, UIResource)) {
      this.acceleratorSelectionForeground = UIManager.getColor$Object(prefix + '.acceleratorSelectionForeground');
    }
    this.acceleratorDelimiter = UIManager.getString$Object('MenuItem.acceleratorDelimiter');
    if (this.acceleratorDelimiter == null) {
      this.acceleratorDelimiter = '+';
    }
    if (this.arrowIcon == null || $J.isa(this.arrowIcon, UIResource)) {
      this.arrowIcon = UIManager.getIcon$Object(prefix + '.arrowIcon');
    }
    if (this.checkIcon == null || $J.isa(this.checkIcon, UIResource)) {
      this.checkIcon = UIManager.getIcon$Object(prefix + '.checkIcon');
      let isColumnLayout = MenuItemLayoutHelper.isColumnLayout$boolean$JMenuItem(BasicGraphicsUtils.isLeftToRight(this.menuItem), this.menuItem);
      if (isColumnLayout) {
        let iconFactory = UIManager.get$Object(prefix + '.checkIconFactory');
        if (iconFactory != null && MenuItemLayoutHelper.useCheckAndArrow(this.menuItem) && iconFactory.isCompatible(this.checkIcon, prefix)) {
          this.checkIcon = iconFactory.getIcon(this.menuItem);
        }
      }
    }
  }
  /**
   * Registers the subcomponents of the menu.
   *
   * @param menuItem a menu item
   * @since 1.3
   */
  installComponents(menuItem: JMenuItem): void {
    BasicHTML.updateRenderer(menuItem, menuItem.getText());
  }
  /**
   * Returns a property prefix.
   *
   * @return a property prefix
   */
  getPropertyPrefix(): string {
    return 'MenuItem';
  }
  /**
   * Registers listeners.
   */
  installListeners(): void {
    if ((this.mouseInputListener = this.createMouseInputListener(this.menuItem)) != null) {
      this.menuItem.addMouseListener(this.mouseInputListener);
      this.menuItem.addMouseMotionListener(this.mouseInputListener);
    }
    if ((this.menuDragMouseListener = this.createMenuDragMouseListener(this.menuItem)) != null) {
      this.menuItem.addMenuDragMouseListener(this.menuDragMouseListener);
    }
    if ((this.menuKeyListener = this.createMenuKeyListener(this.menuItem)) != null) {
      this.menuItem.addMenuKeyListener(this.menuKeyListener);
    }
    if ((this.propertyChangeListener = this.createPropertyChangeListener(this.menuItem)) != null) {
      this.menuItem.addPropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    }
  }
  /**
   * Registers keyboard action.
   */
  installKeyboardActions(): void {
    this.installLazyActionMap();
    this.updateAcceleratorBinding();
  }
  installLazyActionMap(): void {
    LazyActionMap.installLazyActionMap(this.menuItem, $J.cls(BasicMenuItemUI), this.getPropertyPrefix() + '.actionMap');
  }
  uninstallUI(c: JComponent): void {
    this.menuItem = c;
    this.uninstallDefaults();
    this.uninstallComponents(this.menuItem);
    this.uninstallListeners();
    this.uninstallKeyboardActions();
    MenuItemLayoutHelper.clearUsedParentClientProperties(this.menuItem);
    this.menuItem = null;
  }
  /**
   * Uninstalls default properties.
   */
  uninstallDefaults(): void {
    LookAndFeel.uninstallBorder(this.menuItem);
    LookAndFeel.installProperty(this.menuItem, 'borderPainted', this.oldBorderPainted);
    if ($J.isa(this.menuItem.getMargin(), UIResource)) {
      this.menuItem.setMargin(null);
    }
    if ($J.isa(this.arrowIcon, UIResource)) {
      this.arrowIcon = null;
    }
    if ($J.isa(this.checkIcon, UIResource)) {
      this.checkIcon = null;
    }
  }
  /**
   * Unregisters components.
   *
   * @param menuItem a menu item
   * @since 1.3
   */
  uninstallComponents(menuItem: JMenuItem): void {
    BasicHTML.updateRenderer(menuItem, '');
  }
  /**
   * Unregisters listeners.
   */
  uninstallListeners(): void {
    if (this.mouseInputListener != null) {
      this.menuItem.removeMouseListener(this.mouseInputListener);
      this.menuItem.removeMouseMotionListener(this.mouseInputListener);
    }
    if (this.menuDragMouseListener != null) {
      this.menuItem.removeMenuDragMouseListener(this.menuDragMouseListener);
    }
    if (this.menuKeyListener != null) {
      this.menuItem.removeMenuKeyListener(this.menuKeyListener);
    }
    if (this.propertyChangeListener != null) {
      this.menuItem.removePropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    }
    this.mouseInputListener = null;
    this.menuDragMouseListener = null;
    this.menuKeyListener = null;
    this.propertyChangeListener = null;
    this.handler = null;
  }
  /**
   * Unregisters keyboard actions.
   */
  uninstallKeyboardActions(): void {
    SwingUtilities.replaceUIActionMap(this.menuItem, null);
    SwingUtilities.replaceUIInputMap(this.menuItem, JComponent.WHEN_IN_FOCUSED_WINDOW, null);
  }
  /**
   * Returns an instance of {@code MouseInputListener}.
   *
   * @param c a component
   * @return an instance of {@code MouseInputListener}
   */
  createMouseInputListener(c: JComponent): MouseInputListener {
    return this.getHandler();
  }
  /**
   * Returns an instance of {@code MenuDragMouseListener}.
   *
   * @param c a component
   * @return an instance of {@code MenuDragMouseListener}
   */
  createMenuDragMouseListener(c: JComponent): MenuDragMouseListener {
    return this.getHandler();
  }
  /**
   * Returns an instance of {@code MenuKeyListener}.
   *
   * @param c a component
   * @return an instance of {@code MenuKeyListener}
   */
  createMenuKeyListener(c: JComponent): MenuKeyListener {
    return null;
  }
  /**
   * Creates a {@code PropertyChangeListener} which will be added to
   * the menu item.
   * If this method returns null then it will not be added to the menu item.
   *
   * @param c a component
   * @return an instance of a {@code PropertyChangeListener} or null
   * @since 1.6
   */
  createPropertyChangeListener(c: JComponent): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
  getHandler(): BasicMenuItemUI$Handler {
    if (this.handler == null) {
      this.handler = new BasicMenuItemUI$Handler().$o(this)._BasicMenuItemUI$Handler();
    }
    return this.handler;
  }
  createInputMap(condition: number): InputMap {
    if (condition === JComponent.WHEN_IN_FOCUSED_WINDOW) {
      return new ComponentInputMapUIResource()._ComponentInputMapUIResource(this.menuItem);
    }
    return null;
  }
  updateAcceleratorBinding(): void {
    let accelerator = this.menuItem.getAccelerator();
    let windowInputMap = SwingUtilities.getUIInputMap(this.menuItem, JComponent.WHEN_IN_FOCUSED_WINDOW);
    if (windowInputMap != null) {
      windowInputMap.clear();
    }
    if (accelerator != null) {
      if (windowInputMap == null) {
        windowInputMap = this.createInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW);
        SwingUtilities.replaceUIInputMap(this.menuItem, JComponent.WHEN_IN_FOCUSED_WINDOW, windowInputMap);
      }
      windowInputMap.put(accelerator, 'doClick');
      let modifiers = accelerator.getModifiers();
      if (((modifiers & InputEvent.ALT_DOWN_MASK) !== 0) && ((modifiers & InputEvent.ALT_GRAPH_DOWN_MASK) !== 0)) {
        modifiers &= ~InputEvent.ALT_GRAPH_DOWN_MASK;
        modifiers &= ~InputEvent.ALT_GRAPH_MASK;
        let keyStroke = KeyStroke.getKeyStroke$int$int$boolean(accelerator.getKeyCode(), modifiers, accelerator.isOnKeyRelease());
        windowInputMap.put(keyStroke, 'doClick');
      } else if (((modifiers & InputEvent.ALT_DOWN_MASK) !== 0) && ((modifiers & InputEvent.ALT_GRAPH_DOWN_MASK) === 0)) {
        modifiers |= InputEvent.ALT_GRAPH_DOWN_MASK;
        let keyStroke = KeyStroke.getKeyStroke$int$int$boolean(accelerator.getKeyCode(), modifiers, accelerator.isOnKeyRelease());
        windowInputMap.put(keyStroke, 'doClick');
      } else if ((modifiers & InputEvent.ALT_GRAPH_DOWN_MASK) !== 0) {
        modifiers &= ~InputEvent.ALT_GRAPH_DOWN_MASK;
        modifiers &= ~InputEvent.ALT_GRAPH_MASK;
        modifiers |= InputEvent.ALT_DOWN_MASK;
        let keyStroke = KeyStroke.getKeyStroke$int$int$boolean(accelerator.getKeyCode(), modifiers, accelerator.isOnKeyRelease());
        windowInputMap.put(keyStroke, 'doClick');
        modifiers |= InputEvent.ALT_GRAPH_DOWN_MASK;
        keyStroke = KeyStroke.getKeyStroke$int$int$boolean(accelerator.getKeyCode(), modifiers, accelerator.isOnKeyRelease());
        windowInputMap.put(keyStroke, 'doClick');
      }
    }
  }
  getMinimumSize(c: JComponent): Dimension {
    let d = null;
    let v = c.getClientProperty(BasicHTML.propertyKey);
    if (v != null) {
      d = this.getPreferredSize$JComponent(c);
      d.width_ = $J.d2i(Math.fround(d.width_ - Math.fround(v.getPreferredSpan(View.X_AXIS) - v.getMinimumSpan(View.X_AXIS))));
    }
    return d;
  }
  getPreferredSize$JComponent(c: JComponent): Dimension {
    return this.getPreferredMenuItemSize(c, this.checkIcon, this.arrowIcon, this.defaultTextIconGap);
  }
  getMaximumSize(c: JComponent): Dimension {
    let d = null;
    let v = c.getClientProperty(BasicHTML.propertyKey);
    if (v != null) {
      d = this.getPreferredSize$JComponent(c);
      d.width_ = $J.d2i(Math.fround(d.width_ + Math.fround(v.getMaximumSpan(View.X_AXIS) - v.getPreferredSpan(View.X_AXIS))));
    }
    return d;
  }
  /**
   * Returns the preferred size of a menu item.
   *
   * @param c a component
   * @param checkIcon a check icon
   * @param arrowIcon an arrow icon
   * @param defaultTextIconGap a gap between a text and an icon
   * @return the preferred size of a menu item
   */
  getPreferredMenuItemSize(c: JComponent, checkIcon: Icon, arrowIcon: Icon, defaultTextIconGap: number): Dimension {
    let mi = c;
    let lh = new MenuItemLayoutHelper()._MenuItemLayoutHelper$JMenuItem$Icon$Icon$Rectangle$int$String$boolean$Font$Font$boolean$String(mi, checkIcon, arrowIcon, MenuItemLayoutHelper.createMaxRect(), defaultTextIconGap, this.acceleratorDelimiter, BasicGraphicsUtils.isLeftToRight(mi), mi.getFont(), this.acceleratorFont, MenuItemLayoutHelper.useCheckAndArrow(this.menuItem), this.getPropertyPrefix());
    let result = new Dimension()._Dimension$();
    result.width_ = lh.getLeadingGap$();
    MenuItemLayoutHelper.addMaxWidth(lh.getCheckSize(), lh.getAfterCheckIconGap$(), result);
    if ((!lh.isTopLevelMenu()) && (lh.getMinTextOffset$() > 0) && (result.width_ < lh.getMinTextOffset$())) {
      result.width_ = lh.getMinTextOffset$();
    }
    MenuItemLayoutHelper.addMaxWidth(lh.getLabelSize(), lh.getGap(), result);
    MenuItemLayoutHelper.addMaxWidth(lh.getAccSize(), lh.getGap(), result);
    MenuItemLayoutHelper.addMaxWidth(lh.getArrowSize(), lh.getGap(), result);
    result.height_ = MenuItemLayoutHelper.max([lh.getCheckSize().getHeight(), lh.getLabelSize().getHeight(), lh.getAccSize().getHeight(), lh.getArrowSize().getHeight()]);
    let insets = lh.getMenuItem().getInsets$();
    if (insets != null) {
      result.width_ = (result.width_ + (insets.left + insets.right)) | 0;
      result.height_ = (result.height_ + (insets.top + insets.bottom)) | 0;
    }
    if (result.width_ % 2 === 0) {
      result.width_++;
    }
    if (result.height_ % 2 === 0 && true !== UIManager.get$Object(this.getPropertyPrefix() + '.evenHeight')) {
      result.height_++;
    }
    return result;
  }
  /**
   * We draw the background in paintMenuItem()
   * so override update (which fills the background of opaque
   * components by default) to just call paint().
   */
  update(g: Graphics, c: JComponent): void {
    this.paint(g, c);
  }
  paint(g: Graphics, c: JComponent): void {
    this.paintMenuItem(g, c, this.checkIcon, this.arrowIcon, this.selectionBackground, this.selectionForeground, this.defaultTextIconGap);
  }
  /**
   * Paints a menu item.
   *
   * @param g an instance of {@code Graphics}
   * @param c a component
   * @param checkIcon a check icon
   * @param arrowIcon an arrow icon
   * @param background a background color
   * @param foreground a foreground color
   * @param defaultTextIconGap a gap between a text and an icon
   */
  paintMenuItem(g: Graphics, c: JComponent, checkIcon: Icon, arrowIcon: Icon, background: Color, foreground: Color, defaultTextIconGap: number): void {
    let holdf = g.getFont();
    let holdc = g.getColor();
    let mi = c;
    g.setFont(mi.getFont());
    let viewRect = new Rectangle()._Rectangle$int$int$int$int(0, 0, mi.getWidth(), mi.getHeight());
    SwingUtilities3.applyInsets$Rectangle$Insets(viewRect, mi.getInsets$());
    let lh = new MenuItemLayoutHelper()._MenuItemLayoutHelper$JMenuItem$Icon$Icon$Rectangle$int$String$boolean$Font$Font$boolean$String(mi, checkIcon, arrowIcon, viewRect, defaultTextIconGap, this.acceleratorDelimiter, BasicGraphicsUtils.isLeftToRight(mi), mi.getFont(), this.acceleratorFont, MenuItemLayoutHelper.useCheckAndArrow(this.menuItem), this.getPropertyPrefix());
    let lr = lh.layoutMenuItem();
    this.paintBackground(g, mi, background);
    this.paintCheckIcon(g, lh, lr, holdc, foreground);
    this.paintIcon(g, lh, lr, holdc);
    this.paintText$Graphics$MenuItemLayoutHelper$LayoutResult$BasicMenuItemUI(g, lh, lr);
    this.paintAccText(g, lh, lr);
    this.paintArrowIcon(g, lh, lr, foreground);
    g.setColor(holdc);
    g.setFont(holdf);
  }
  paintIcon(g: Graphics, lh: MenuItemLayoutHelper, lr: MenuItemLayoutHelper$LayoutResult, holdc: Color): void {
    SwingUtilities3.paintIcon(g, lh, lr, holdc);
  }
  paintCheckIcon(g: Graphics, lh: MenuItemLayoutHelper, lr: MenuItemLayoutHelper$LayoutResult, holdc: Color, foreground: Color): void {
    SwingUtilities3.paintCheckIcon(g, lh, lr, holdc, foreground);
  }
  paintAccText(g: Graphics, lh: MenuItemLayoutHelper, lr: MenuItemLayoutHelper$LayoutResult): void {
    SwingUtilities3.paintAccText(g, lh, lr, this.disabledForeground, this.acceleratorSelectionForeground, this.acceleratorForeground);
  }
  paintText$Graphics$MenuItemLayoutHelper$LayoutResult$BasicMenuItemUI(g: Graphics, lh: MenuItemLayoutHelper, lr: MenuItemLayoutHelper$LayoutResult): void {
    if (!(lh.getText().length === 0)) {
      if (lh.getHtmlView() != null) {
        lh.getHtmlView().paint(g, lr.getTextRect());
      } else {
        this.paintText$Graphics$JMenuItem$Rectangle$String(g, lh.getMenuItem(), lr.getTextRect(), lh.getText());
      }
    }
  }
  paintArrowIcon(g: Graphics, lh: MenuItemLayoutHelper, lr: MenuItemLayoutHelper$LayoutResult, foreground: Color): void {
    SwingUtilities3.paintArrowIcon(g, lh, lr, foreground);
  }
  /**
   * Draws the background of the menu item.
   *
   * @param g the paint graphics
   * @param menuItem menu item to be painted
   * @param bgColor selection background color
   * @since 1.4
   */
  paintBackground(g: Graphics, menuItem: JMenuItem, bgColor: Color): void {
    let model = menuItem.getModel();
    let oldColor = g.getColor();
    let menuWidth = menuItem.getWidth();
    let menuHeight = menuItem.getHeight();
    if (menuItem.isOpaque()) {
      if (model.isArmed() || (menuItem instanceof JMenu && model.isSelected())) {
        g.setColor(bgColor);
        g.fillRect(0, 0, menuWidth, menuHeight);
      } else {
        g.setColor(menuItem.getBackground());
        g.fillRect(0, 0, menuWidth, menuHeight);
      }
      g.setColor(oldColor);
    } else if (model.isArmed() || (menuItem instanceof JMenu && model.isSelected())) {
      g.setColor(bgColor);
      g.fillRect(0, 0, menuWidth, menuHeight);
      g.setColor(oldColor);
    }
  }
  /**
   * Renders the text of the current menu item.
   *
   * @param g graphics context
   * @param menuItem menu item to render
   * @param textRect bounding rectangle for rendering the text
   * @param text string to render
   * @since 1.4
   */
  paintText$Graphics$JMenuItem$Rectangle$String(g: Graphics, menuItem: JMenuItem, textRect: Rectangle, text: string): void {
    let model = menuItem.getModel();
    let fm = SwingUtilities2.getFontMetrics$JComponent$Graphics(menuItem, g);
    let mnemIndex = menuItem.getDisplayedMnemonicIndex();
    if (!model.isEnabled()) {
      if (UIManager.get$Object('MenuItem.disabledForeground') instanceof Color) {
        g.setColor(UIManager.getColor$Object('MenuItem.disabledForeground'));
        SwingUtilities2.drawStringUnderlineCharAt$JComponent$Graphics$String$int$int$int(menuItem, g, text, mnemIndex, textRect.x_, (textRect.y_ + fm.getAscent()) | 0);
      } else {
        g.setColor(menuItem.getBackground().brighter());
        SwingUtilities2.drawStringUnderlineCharAt$JComponent$Graphics$String$int$int$int(menuItem, g, text, mnemIndex, textRect.x_, (textRect.y_ + fm.getAscent()) | 0);
        g.setColor(menuItem.getBackground().darker());
        SwingUtilities2.drawStringUnderlineCharAt$JComponent$Graphics$String$int$int$int(menuItem, g, text, mnemIndex, (textRect.x_ - 1) | 0, (textRect.y_ + fm.getAscent() - 1) | 0);
      }
    } else {
      if (model.isArmed() || (menuItem instanceof JMenu && model.isSelected())) {
        g.setColor(this.selectionForeground);
      }
      SwingUtilities2.drawStringUnderlineCharAt$JComponent$Graphics$String$int$int$int(menuItem, g, text, mnemIndex, textRect.x_, (textRect.y_ + fm.getAscent()) | 0);
    }
  }
  /**
   * Returns a menu element path.
   *
   * @return a menu element path
   */
  getPath(): MenuElement[] {
    let m = MenuSelectionManager.defaultManager();
    let oldPath = m.getSelectedPath();
    let newPath: MenuElement[];
    let i = oldPath.length;
    if (i === 0) {
      return $J.newArray(0, null);
    }
    let parent = this.menuItem.getParent();
    if ((oldPath[(i - 1) | 0]).getComponent$() === parent) {
      newPath = $J.newArray((i + 1) | 0, null);
      $J.system_arraycopy(oldPath, 0, newPath, 0, i);
      newPath[i] = this.menuItem;
    } else {
      let j: number;
      for (j = (oldPath.length - 1) | 0; j >= 0; j--) {
        if (oldPath[j].getComponent$() === parent) {
          break;
        }
      }
      newPath = $J.newArray((j + 2) | 0, null);
      $J.system_arraycopy(oldPath, 0, newPath, 0, (j + 1) | 0);
      (newPath[(j + 1) | 0]) = this.menuItem;
    }
    return newPath;
  }
  doNotCloseOnMouseClick(): boolean {
    if (this.menuItem instanceof JCheckBoxMenuItem) {
      let property = 'CheckBoxMenuItem.doNotCloseOnMouseClick';
      return SwingUtilities2.getBoolean(this.menuItem, property);
    } else if (this.menuItem instanceof JRadioButtonMenuItem) {
      let property = 'RadioButtonMenuItem.doNotCloseOnMouseClick';
      return SwingUtilities2.getBoolean(this.menuItem, property);
    }
    return false;
  }
  /**
   * Call this method when a menu item is to be activated.
   * This method handles some of the details of menu item activation
   * such as clearing the selected path and messaging the
   * JMenuItem's doClick() method.
   *
   * @param msm  A MenuSelectionManager. The visual feedback and
   *             internal bookkeeping tasks are delegated to
   *             this MenuSelectionManager. If <code>null</code> is
   *             passed as this argument, the
   *             <code>MenuSelectionManager.defaultManager</code> is
   *             used.
   * @see MenuSelectionManager
   * @see JMenuItem#doClick(int)
   * @since 1.4
   */
  doClick(msm: MenuSelectionManager): void {
    if (!this.isInternalFrameSystemMenu()) {
      BasicLookAndFeel.playSound(this.menuItem, this.getPropertyPrefix() + '.commandSound');
    }
    if (!this.doNotCloseOnMouseClick()) {
      if (msm == null) {
        msm = MenuSelectionManager.defaultManager();
      }
      msm.clearSelectedPath();
    }
    this.menuItem.doClick$int(0);
  }
  /**
   * This is to see if the menu item in question is part of the
   * system menu on an internal frame.
   * The Strings that are being checked can be found in
   * MetalInternalFrameTitlePaneUI.java,
   * WindowsInternalFrameTitlePaneUI.java, and
   * MotifInternalFrameTitlePaneUI.java.
   *
   * @since 1.4
   */
  isInternalFrameSystemMenu(): boolean {
    let actionCommand = this.menuItem.getActionCommand();
    if ((actionCommand === 'Close') || (actionCommand === 'Minimize') || (actionCommand === 'Restore') || (actionCommand === 'Maximize')) {
      return true;
    } else {
      return false;
    }
  }
}

export class BasicMenuItemUI$Actions extends UIAction {
  static readonly CLICK: string = 'doClick';
  _BasicMenuItemUI$Actions(key: string): this {
    this._UIAction(key);
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    let mi = e.getSource();
    MenuSelectionManager.defaultManager().clearSelectedPath();
    mi.doClick$();
  }
}

export class BasicMenuItemUI$Handler extends JObject {
  _BasicMenuItemUI$Handler(): this {
    return this;
  }
  mouseClicked(e: MouseEvent): void {
  }
  mousePressed(e: MouseEvent): void {
  }
  mouseReleased(e: MouseEvent): void {
    if (!this.$outer.menuItem.isEnabled()) {
      return;
    }
    let manager = MenuSelectionManager.defaultManager();
    let p = e.getPoint();
    if (p.x_ >= 0 && p.x_ < this.$outer.menuItem.getWidth() && p.y_ >= 0 && p.y_ < this.$outer.menuItem.getHeight()) {
      this.$outer.doClick(manager);
    } else {
      manager.processMouseEvent(e);
    }
  }
  mouseEntered(e: MouseEvent): void {
    let manager = MenuSelectionManager.defaultManager();
    let modifiers = e.getModifiers();
    if ((modifiers & (InputEvent.BUTTON1_MASK | InputEvent.BUTTON2_MASK | InputEvent.BUTTON3_MASK)) !== 0) {
      MenuSelectionManager.defaultManager().processMouseEvent(e);
    } else {
      manager.setSelectedPath(this.$outer.getPath());
    }
  }
  mouseExited(e: MouseEvent): void {
    let manager = MenuSelectionManager.defaultManager();
    let modifiers = e.getModifiers();
    if ((modifiers & (InputEvent.BUTTON1_MASK | InputEvent.BUTTON2_MASK | InputEvent.BUTTON3_MASK)) !== 0) {
      MenuSelectionManager.defaultManager().processMouseEvent(e);
    } else {
      let path = manager.getSelectedPath();
      if (path.length > 1 && (path[(path.length - 1) | 0]) === this.$outer.menuItem) {
        let newPath = $J.newArray((path.length - 1) | 0, null);
        let i: number;
        let c: number;
        for (i = 0, c = (path.length - 1) | 0; i < c; i++) {
          newPath[i] = path[i];
        }
        manager.setSelectedPath(newPath);
      }
    }
  }
  mouseDragged(e: MouseEvent): void {
    MenuSelectionManager.defaultManager().processMouseEvent(e);
  }
  mouseMoved(e: MouseEvent): void {
  }
  menuDragMouseEntered(e: MenuDragMouseEvent): void {
    let manager = e.getMenuSelectionManager();
    let path = e.getPath();
    manager.setSelectedPath(path);
  }
  menuDragMouseDragged(e: MenuDragMouseEvent): void {
    let manager = e.getMenuSelectionManager();
    let path = e.getPath();
    manager.setSelectedPath(path);
  }
  menuDragMouseExited(e: MenuDragMouseEvent): void {
  }
  menuDragMouseReleased(e: MenuDragMouseEvent): void {
    if (!this.$outer.menuItem.isEnabled()) {
      return;
    }
    let manager = e.getMenuSelectionManager();
    let path = e.getPath();
    let p = e.getPoint();
    if (p.x_ >= 0 && p.x_ < this.$outer.menuItem.getWidth() && p.y_ >= 0 && p.y_ < this.$outer.menuItem.getHeight()) {
      this.$outer.doClick(manager);
    } else {
      manager.clearSelectedPath();
    }
  }
  propertyChange(e: PropertyChangeEvent): void {
    let name = e.getPropertyName();
    if (name === 'labelFor' || name === 'displayedMnemonic' || name === 'accelerator') {
      this.$outer.updateAcceleratorBinding();
    } else if (name === 'text' || 'font' === name || 'foreground' === name || SwingUtilities2.isScaleChanged$PropertyChangeEvent(e)) {
      let lbl = (e.getSource());
      if (SwingUtilities2.isScaleChanged$PropertyChangeEvent(e)) {
        MenuItemLayoutHelper.clearUsedParentClientProperties(lbl);
      }
      let text = lbl.getText();
      BasicHTML.updateRenderer(lbl, text);
    } else if (name === 'iconTextGap') {
      this.$outer.defaultTextIconGap = $J.d2i(+(e.getNewValue()));
    }
  }
}

$J.define(BasicMenuItemUI, 'javax.swing.plaf.basic.BasicMenuItemUI', { kind: 'class', sup: 'javax.swing.plaf.MenuItemUI', ctors: { '': '_BasicMenuItemUI' }, meths: { 'paintText(java.awt.Graphics,javax.swing.JMenuItem,java.awt.Rectangle,java.lang.String)': 'paintText$Graphics$JMenuItem$Rectangle$String', 'paintText(java.awt.Graphics,sun.swing.MenuItemLayoutHelper,sun.swing.MenuItemLayoutHelper$LayoutResult)': 'paintText$Graphics$MenuItemLayoutHelper$LayoutResult$BasicMenuItemUI', 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent' } });
$J.define(BasicMenuItemUI$Actions, 'javax.swing.plaf.basic.BasicMenuItemUI$Actions', { kind: 'class', sup: 'sun.swing.UIAction', ctors: { 'java.lang.String': '_BasicMenuItemUI$Actions' } });
$J.define(BasicMenuItemUI$Handler, 'javax.swing.plaf.basic.BasicMenuItemUI$Handler', { kind: 'class', ifaces: ['javax.swing.event.MenuDragMouseListener', 'javax.swing.event.MouseInputListener', 'java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_BasicMenuItemUI$Handler' }, inner: true });
$J.module(() => {
  SwingUtilities3 = $J.load('com.sun.java.swing.SwingUtilities3');
  Color = $J.load('java.awt.Color');
  Dimension = $J.load('java.awt.Dimension');
  Rectangle = $J.load('java.awt.Rectangle');
  InputEvent = $J.load('java.awt.event.InputEvent');
  JCheckBoxMenuItem = $J.load('javax.swing.JCheckBoxMenuItem');
  JComponent = $J.load('javax.swing.JComponent');
  JMenu = $J.load('javax.swing.JMenu');
  JRadioButtonMenuItem = $J.load('javax.swing.JRadioButtonMenuItem');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  MenuSelectionManager = $J.load('javax.swing.MenuSelectionManager');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  ComponentInputMapUIResource = $J.load('javax.swing.plaf.ComponentInputMapUIResource');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicGraphicsUtils = $J.load('javax.swing.plaf.basic.BasicGraphicsUtils');
  BasicHTML = $J.load('javax.swing.plaf.basic.BasicHTML');
  BasicLookAndFeel = $J.load('javax.swing.plaf.basic.BasicLookAndFeel');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  View = $J.load('javax.swing.text.View');
  MenuItemLayoutHelper = $J.load('sun.swing.MenuItemLayoutHelper');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
