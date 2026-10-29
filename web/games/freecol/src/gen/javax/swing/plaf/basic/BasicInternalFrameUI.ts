// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicInternalFrameUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../jre/index.ts';
import { InternalFrameUI } from '../InternalFrameUI.ts';
import { MouseInputAdapter } from '../../event/MouseInputAdapter.ts';

let Cursor, Dimension, IllegalComponentStateException, Point, InputEvent, PropertyVetoException, DefaultDesktopManager, JComponent, JInternalFrame, LookAndFeel, RootPaneContainer, SwingConstants, SwingUtilities, UIManager, UIResource, BasicInternalFrameTitlePane, BasicLookAndFeel, LazyActionMap, DefaultLookup, UIAction;

/**
 * A basic L&amp;F implementation of JInternalFrame.
 *
 * @author David Kloba
 * @author Rich Schiavi
 */
export class BasicInternalFrameUI extends InternalFrameUI {
  /**
   * frame
   */
  frame: JInternalFrame = null;
  handler: BasicInternalFrameUI$Handler = null;
  /**
   * Border listener
   */
  borderListener: MouseInputAdapter = null;
  /**
   * Property change listener
   */
  propertyChangeListener: PropertyChangeListener = null;
  /**
   * Internal frame layout
   */
  internalFrameLayout: LayoutManager = null;
  /**
   * Component listener
   */
  componentListener: ComponentListener = null;
  /**
   * Glass pane dispatcher
   */
  glassPaneDispatcher: MouseInputListener = null;
  internalFrameListener: InternalFrameListener = null;
  /**
   * North pane
   */
  northPane: JComponent = null;
  /**
   * South pane
   */
  southPane: JComponent = null;
  /**
   * West pane
   */
  westPane: JComponent = null;
  /**
   * East pane
   */
  eastPane: JComponent = null;
  /**
   * Title pane
   */
  titlePane: BasicInternalFrameTitlePane = null;
  static sharedDesktopManager: DesktopManager = null;
  componentListenerAdded: boolean = false;
  parentBounds: Rectangle = null;
  dragging: boolean = false;
  resizing: boolean = false;
  /**
   * As of Java 2 platform v1.3 this previously undocumented field is no
   * longer used.
   * Key bindings are now defined by the LookAndFeel, please refer to
   * the key bindings specification for further details.
   *
   * @deprecated As of Java 2 platform v1.3.
   */
  openMenuKey: KeyStroke = null;
  keyBindingRegistered: boolean = false;
  keyBindingActive: boolean = false;
  /**
   * Constructs a {@code BasicInternalFrameUI}.
   * @param b the internal frame
   */
  _BasicInternalFrameUI(b: JInternalFrame): this {
    this._InternalFrameUI();
    this.componentListenerAdded = false;
    this.dragging = false;
    this.resizing = false;
    this.keyBindingRegistered = false;
    this.keyBindingActive = false;
    let laf = UIManager.getLookAndFeel();
    if (laf instanceof BasicLookAndFeel) {
      (laf).installAWTEventListener();
    }
    return this;
  }
  /**
   * Returns a component UI.
   * @param b a component
   * @return a component UI
   */
  static createUI(b: JComponent): ComponentUI {
    return new BasicInternalFrameUI()._BasicInternalFrameUI(b);
  }
  /**
   * Installs the UI.
   * @param c the component
   */
  installUI(c: JComponent): void {
    this.frame = c;
    this.installDefaults();
    this.installListeners();
    this.installComponents();
    this.installKeyboardActions();
    LookAndFeel.installProperty(this.frame, 'opaque', true);
  }
  /**
   * Uninstalls the UI.
   * @param c the component
   */
  uninstallUI(c: JComponent): void {
    if (c !== this.frame) {
      throw new IllegalComponentStateException()._IllegalComponentStateException$String($J.str(this) + ' was asked to deinstall() ' + $J.str(c) + ' when it only knows about ' + $J.str(this.frame) + '.');
    }
    this.uninstallKeyboardActions();
    this.uninstallComponents();
    this.uninstallListeners();
    this.uninstallDefaults();
    this.updateFrameCursor();
    this.handler = null;
    this.frame = null;
  }
  /**
   * Installs the defaults.
   */
  installDefaults(): void {
    let frameIcon = this.frame.getFrameIcon();
    if (frameIcon == null || $J.isa(frameIcon, UIResource)) {
      this.frame.setFrameIcon(UIManager.getIcon$Object('InternalFrame.icon'));
    }
    let contentPane = this.frame.getContentPane();
    if (contentPane != null) {
      let bg = contentPane.getBackground();
      if ($J.isa(bg, UIResource)) {
        contentPane.setBackground(null);
      }
    }
    this.frame.setLayout(this.internalFrameLayout = this.createLayoutManager());
    this.frame.setBackground(UIManager.getLookAndFeelDefaults().getColor$Object('control'));
    LookAndFeel.installBorder(this.frame, 'InternalFrame.border');
  }
  /**
   * Installs the keyboard actions.
   */
  installKeyboardActions(): void {
    this.createInternalFrameListener();
    if (this.internalFrameListener != null) {
      this.frame.addInternalFrameListener(this.internalFrameListener);
    }
    LazyActionMap.installLazyActionMap(this.frame, $J.cls(BasicInternalFrameUI), 'InternalFrame.actionMap');
  }
  static loadActionMap(map: LazyActionMap): void {
    map.put$Action(new (BasicInternalFrameUI$1())()._UIAction('showSystemMenu'));
    BasicLookAndFeel.installAudioActionMap(map);
  }
  /**
   * Installs the components.
   */
  installComponents(): void {
    this.setNorthPane(this.createNorthPane(this.frame));
    this.setSouthPane(this.createSouthPane(this.frame));
    this.setEastPane(this.createEastPane(this.frame));
    this.setWestPane(this.createWestPane(this.frame));
  }
  /**
   * Installs the listeners.
   * @since 1.3
   */
  installListeners(): void {
    this.borderListener = this.createBorderListener(this.frame);
    this.propertyChangeListener = this.createPropertyChangeListener();
    this.frame.addPropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    this.installMouseHandlers(this.frame);
    this.glassPaneDispatcher = this.createGlassPaneDispatcher();
    if (this.glassPaneDispatcher != null) {
      this.frame.getGlassPane().addMouseListener(this.glassPaneDispatcher);
      this.frame.getGlassPane().addMouseMotionListener(this.glassPaneDispatcher);
    }
    this.componentListener = this.createComponentListener();
    if (this.frame.getParent() != null) {
      this.parentBounds = this.frame.getParent().getBounds$();
    }
    if ((this.frame.getParent() != null) && !this.componentListenerAdded) {
      this.frame.getParent().addComponentListener(this.componentListener);
      this.componentListenerAdded = true;
    }
  }
  getWindowFocusListener(): WindowFocusListener {
    return this.getHandler();
  }
  cancelResize(): void {
    if (this.resizing) {
      if (this.borderListener instanceof BasicInternalFrameUI$BorderListener) {
        (this.borderListener).finishMouseReleased();
      }
    }
  }
  getHandler(): BasicInternalFrameUI$Handler {
    if (this.handler == null) {
      this.handler = new BasicInternalFrameUI$Handler().$o(this)._BasicInternalFrameUI$Handler();
    }
    return this.handler;
  }
  getInputMap(condition: number): InputMap {
    if (condition === JComponent.WHEN_IN_FOCUSED_WINDOW) {
      return this.createInputMap(condition);
    }
    return null;
  }
  createInputMap(condition: number): InputMap {
    if (condition === JComponent.WHEN_IN_FOCUSED_WINDOW) {
      let bindings = DefaultLookup.get(this.frame, this, 'InternalFrame.windowBindings');
      if (bindings != null) {
        return LookAndFeel.makeComponentInputMap(this.frame, bindings);
      }
    }
    return null;
  }
  /**
   * Uninstalls the defaults.
   */
  uninstallDefaults(): void {
    let frameIcon = this.frame.getFrameIcon();
    if ($J.isa(frameIcon, UIResource)) {
      this.frame.setFrameIcon(null);
    }
    this.internalFrameLayout = null;
    this.frame.setLayout(null);
    LookAndFeel.uninstallBorder(this.frame);
  }
  /**
   * Uninstalls the components.
   */
  uninstallComponents(): void {
    this.setNorthPane(null);
    this.setSouthPane(null);
    this.setEastPane(null);
    this.setWestPane(null);
    if (this.titlePane != null) {
      this.titlePane.uninstallDefaults();
    }
    this.titlePane = null;
  }
  /**
   * Uninstalls the listeners.
   * @since 1.3
   */
  uninstallListeners(): void {
    if ((this.frame.getParent() != null) && this.componentListenerAdded) {
      this.frame.getParent().removeComponentListener(this.componentListener);
      this.componentListenerAdded = false;
    }
    this.componentListener = null;
    if (this.glassPaneDispatcher != null) {
      this.frame.getGlassPane().removeMouseListener(this.glassPaneDispatcher);
      this.frame.getGlassPane().removeMouseMotionListener(this.glassPaneDispatcher);
      this.glassPaneDispatcher = null;
    }
    this.deinstallMouseHandlers(this.frame);
    this.frame.removePropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    this.propertyChangeListener = null;
    this.borderListener = null;
  }
  /**
   * Uninstalls the keyboard actions.
   */
  uninstallKeyboardActions(): void {
    if (this.internalFrameListener != null) {
      this.frame.removeInternalFrameListener(this.internalFrameListener);
    }
    this.internalFrameListener = null;
    SwingUtilities.replaceUIInputMap(this.frame, JComponent.WHEN_IN_FOCUSED_WINDOW, null);
    SwingUtilities.replaceUIActionMap(this.frame, null);
  }
  updateFrameCursor(): void {
    if (this.resizing) {
      return;
    }
    let s = this.frame.getLastCursor();
    if (s == null) {
      s = Cursor.getPredefinedCursor(Cursor.DEFAULT_CURSOR);
    }
    this.frame.setCursor$Cursor(s);
  }
  /**
   * Creates the layout manager.
   * @return the layout manager
   */
  createLayoutManager(): LayoutManager {
    return this.getHandler();
  }
  /**
   * Creates the property change listener.
   * @return the property change listener
   */
  createPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
  /**
   * Returns the preferred size.
   * @param x the component
   * @return the preferred size
   */
  getPreferredSize$JComponent(x: JComponent): Dimension {
    if (this.frame === x) {
      return this.frame.getLayout().preferredLayoutSize(x);
    }
    return new Dimension()._Dimension$int$int(100, 100);
  }
  /**
   * Returns the minimum size.
   * @param x the component
   * @return the minimum size
   */
  getMinimumSize(x: JComponent): Dimension {
    if (this.frame === x) {
      return this.frame.getLayout().minimumLayoutSize(x);
    }
    return new Dimension()._Dimension$int$int(0, 0);
  }
  /**
   * Returns the maximum size.
   * @param x the component
   * @return the maximum size
   */
  getMaximumSize(x: JComponent): Dimension {
    return new Dimension()._Dimension$int$int(2147483647, 2147483647);
  }
  /**
   * Installs necessary mouse handlers on <code>newPane</code>
   * and adds it to the frame.
   * Reverse process for the <code>currentPane</code>.
   *
   * @param currentPane this {@code Jcomponent} is the current pane being
   * viewed that has mouse handlers installed
   * @param newPane this {@code Jcomponent} is the pane which will be added
   * and have mouse handlers installed
   */
  replacePane(currentPane: JComponent, newPane: JComponent): void {
    if (currentPane != null) {
      this.deinstallMouseHandlers(currentPane);
      this.frame.remove$Component(currentPane);
    }
    if (newPane != null) {
      this.frame.add$Component(newPane);
      this.installMouseHandlers(newPane);
    }
  }
  /**
   * Deinstalls the mouse handlers.
   * @param c the component
   */
  deinstallMouseHandlers(c: JComponent): void {
    c.removeMouseListener(this.borderListener);
    c.removeMouseMotionListener(this.borderListener);
  }
  /**
   * Installs the mouse handlers.
   * @param c the component
   */
  installMouseHandlers(c: JComponent): void {
    c.addMouseListener(this.borderListener);
    c.addMouseMotionListener(this.borderListener);
  }
  /**
   * Creates the north pane.
   * @param w the internal frame
   * @return the north pane
   */
  createNorthPane(w: JInternalFrame): JComponent {
    this.titlePane = new BasicInternalFrameTitlePane()._BasicInternalFrameTitlePane(w);
    return this.titlePane;
  }
  /**
   * Creates the north pane.
   * @param w the internal frame
   * @return the north pane
   */
  createSouthPane(w: JInternalFrame): JComponent {
    return null;
  }
  /**
   * Creates the west pane.
   * @param w the internal frame
   * @return the west pane
   */
  createWestPane(w: JInternalFrame): JComponent {
    return null;
  }
  /**
   * Creates the east pane.
   * @param w the internal frame
   * @return the east pane
   */
  createEastPane(w: JInternalFrame): JComponent {
    return null;
  }
  /**
   * Creates the border listener.
   * @param w the internal frame
   * @return the border listener
   */
  createBorderListener(w: JInternalFrame): MouseInputAdapter {
    return new BasicInternalFrameUI$BorderListener().$o(this)._BasicInternalFrameUI$BorderListener();
  }
  /**
   * Creates the internal frame listener.
   */
  createInternalFrameListener(): void {
    this.internalFrameListener = this.getHandler();
  }
  /**
   * Returns whether or no the key binding is registered.
   * @return whether or no the key binding is registered
   */
  isKeyBindingRegistered(): boolean {
    return this.keyBindingRegistered;
  }
  /**
   * Sets the key binding registration.
   * @param b new value for key binding registration
   */
  setKeyBindingRegistered(b: boolean): void {
    this.keyBindingRegistered = b;
  }
  /**
   * Returns whether or no the key binding is active.
   * @return whether or no the key binding is active
   */
  isKeyBindingActive(): boolean {
    return this.keyBindingActive;
  }
  /**
   * Sets the key binding activity.
   * @param b new value for key binding activity
   */
  setKeyBindingActive(b: boolean): void {
    this.keyBindingActive = b;
  }
  /**
   * Setup the menu open key.
   */
  setupMenuOpenKey(): void {
    let map = this.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW);
    SwingUtilities.replaceUIInputMap(this.frame, JComponent.WHEN_IN_FOCUSED_WINDOW, map);
  }
  /**
   * Setup the menu close key.
   */
  setupMenuCloseKey(): void {
  }
  /**
   * Returns the north pane.
   * @return the north pane
   */
  getNorthPane(): JComponent {
    return this.northPane;
  }
  /**
   * Sets the north pane.
   * @param c the new north pane
   */
  setNorthPane(c: JComponent): void {
    var tp;
    if ((tp = this.northPane) instanceof BasicInternalFrameTitlePane) {
      tp.uninstallListeners();
    }
    this.replacePane(this.northPane, c);
    this.northPane = c;
    if (c instanceof BasicInternalFrameTitlePane) {
      this.titlePane = c;
    }
  }
  /**
   * Returns the south pane.
   * @return the south pane
   */
  getSouthPane(): JComponent {
    return this.southPane;
  }
  /**
   * Sets the south pane.
   * @param c the new south pane
   */
  setSouthPane(c: JComponent): void {
    this.southPane = c;
  }
  /**
   * Returns the west pane.
   * @return the west pane
   */
  getWestPane(): JComponent {
    return this.westPane;
  }
  /**
   * Sets the west pane.
   * @param c the new west pane
   */
  setWestPane(c: JComponent): void {
    this.westPane = c;
  }
  /**
   * Returns the east pane.
   * @return the east pane
   */
  getEastPane(): JComponent {
    return this.eastPane;
  }
  /**
   * Sets the east pane.
   * @param c the new east pane
   */
  setEastPane(c: JComponent): void {
    this.eastPane = c;
  }
  /**
   * Returns the proper DesktopManager. Calls getDesktopPane() to
   * find the JDesktop component and returns the desktopManager from
   * it. If this fails, it will return a default DesktopManager that
   * should work in arbitrary parents.
   * @return the proper DesktopManager
   */
  getDesktopManager(): DesktopManager {
    if (this.frame.getDesktopPane() != null && this.frame.getDesktopPane().getDesktopManager() != null) {
      return this.frame.getDesktopPane().getDesktopManager();
    }
    if (BasicInternalFrameUI.sharedDesktopManager == null) {
      BasicInternalFrameUI.sharedDesktopManager = this.createDesktopManager();
    }
    return BasicInternalFrameUI.sharedDesktopManager;
  }
  /**
   * Creates the desktop manager.
   * @return the desktop manager
   */
  createDesktopManager(): DesktopManager {
    return new DefaultDesktopManager()._DefaultDesktopManager();
  }
  /**
   * This method is called when the user wants to close the frame.
   * The <code>playCloseSound</code> Action is fired.
   * This action is delegated to the desktopManager.
   *
   * @param f the {@code JInternalFrame} being viewed
   */
  closeFrame(f: JInternalFrame): void {
    BasicLookAndFeel.playSound(this.frame, 'InternalFrame.closeSound');
    this.getDesktopManager().closeFrame(f);
  }
  /**
   * This method is called when the user wants to maximize the frame.
   * The <code>playMaximizeSound</code> Action is fired.
   * This action is delegated to the desktopManager.
   *
   * @param f the {@code JInternalFrame} being viewed
   */
  maximizeFrame(f: JInternalFrame): void {
    BasicLookAndFeel.playSound(this.frame, 'InternalFrame.maximizeSound');
    this.getDesktopManager().maximizeFrame(f);
  }
  /**
   * This method is called when the user wants to minimize the frame.
   * The <code>playRestoreDownSound</code> Action is fired.
   * This action is delegated to the desktopManager.
   *
   * @param f the {@code JInternalFrame} being viewed
   */
  minimizeFrame(f: JInternalFrame): void {
    if (!f.isIcon()) {
      BasicLookAndFeel.playSound(this.frame, 'InternalFrame.restoreDownSound');
    }
    this.getDesktopManager().minimizeFrame(f);
  }
  /**
   * This method is called when the user wants to iconify the frame.
   * The <code>playMinimizeSound</code> Action is fired.
   * This action is delegated to the desktopManager.
   *
   * @param f the {@code JInternalFrame} being viewed
   */
  iconifyFrame(f: JInternalFrame): void {
    BasicLookAndFeel.playSound(this.frame, 'InternalFrame.minimizeSound');
    this.getDesktopManager().iconifyFrame(f);
  }
  /**
   * This method is called when the user wants to deiconify the frame.
   * The <code>playRestoreUpSound</code> Action is fired.
   * This action is delegated to the desktopManager.
   *
   * @param f the {@code JInternalFrame} being viewed
   */
  deiconifyFrame(f: JInternalFrame): void {
    if (!f.isMaximum()) {
      BasicLookAndFeel.playSound(this.frame, 'InternalFrame.restoreUpSound');
    }
    this.getDesktopManager().deiconifyFrame(f);
  }
  /**
   * This method is called when the frame becomes selected.
   * This action is delegated to the desktopManager.
   *
   * @param f the {@code JInternalFrame} being viewed
   */
  activateFrame(f: JInternalFrame): void {
    this.getDesktopManager().activateFrame(f);
  }
  /**
   * This method is called when the frame is no longer selected.
   * This action is delegated to the desktopManager.
   *
   * @param f the {@code JInternalFrame} being viewed
   */
  deactivateFrame(f: JInternalFrame): void {
    this.getDesktopManager().deactivateFrame(f);
  }
  /**
   * Creates a component listener.
   * @return a component listener
   */
  createComponentListener(): ComponentListener {
    return this.getHandler();
  }
  /**
   * Creates a {@code GlassPaneDispatcher}.
   * @return a {@code GlassPaneDispatcher}
   */
  createGlassPaneDispatcher(): MouseInputListener {
    return null;
  }
}

/**
 * Listens for border adjustments.
 */
export class BasicInternalFrameUI$BorderListener extends MouseInputAdapter {
  _x: number = 0;
  _y: number = 0;
  __x: number = 0;
  __y: number = 0;
  startingBounds: Rectangle = null;
  resizeDir: number = 0;
  /**
   * resize none
   */
  RESIZE_NONE: number = 0;
  discardRelease: boolean = false;
  resizeCornerSize: number = 0;
  /**
   * Constructs a {@code BorderListener}.
   */
  _BasicInternalFrameUI$BorderListener(): this {
    this._MouseInputAdapter();
    this.RESIZE_NONE = 0;
    this.discardRelease = false;
    this.resizeCornerSize = 16;
    return this;
  }
  mouseClicked(e: MouseEvent): void {
    if (e.getClickCount() > 1 && e.getSource() === this.$outer.getNorthPane()) {
      if (this.$outer.frame.isIconifiable() && this.$outer.frame.isIcon()) {
        try {
          this.$outer.frame.setIcon(false);
        } catch ($e0) {
          if ($J.isa($e0, PropertyVetoException)) {
            let e2 = $J.exc($e0);
          } else {
            throw $e0;
          }
        }
      } else if (this.$outer.frame.isMaximizable()) {
        if (!this.$outer.frame.isMaximum()) {
          try {
            this.$outer.frame.setMaximum(true);
          } catch ($e1) {
            if ($J.isa($e1, PropertyVetoException)) {
              let e2 = $J.exc($e1);
            } else {
              throw $e1;
            }
          }
        } else {
          try {
            this.$outer.frame.setMaximum(false);
          } catch ($e2) {
            if ($J.isa($e2, PropertyVetoException)) {
              let e3 = $J.exc($e2);
            } else {
              throw $e2;
            }
          }
        }
      }
    }
  }
  finishMouseReleased(): void {
    if (this.discardRelease) {
      this.discardRelease = false;
      return;
    }
    if (this.resizeDir === this.RESIZE_NONE) {
      this.$outer.getDesktopManager().endDraggingFrame(this.$outer.frame);
      this.$outer.dragging = false;
    } else {
      let windowAncestor = SwingUtilities.getWindowAncestor(this.$outer.frame);
      if (windowAncestor != null) {
        windowAncestor.removeWindowFocusListener(this.$outer.getWindowFocusListener());
      }
      let c = this.$outer.frame.getTopLevelAncestor();
      if ($J.isa(c, RootPaneContainer)) {
        let glassPane = (c).getGlassPane();
        glassPane.setCursor$Cursor(Cursor.getPredefinedCursor(Cursor.DEFAULT_CURSOR));
        glassPane.setVisible(false);
      }
      this.$outer.getDesktopManager().endResizingFrame(this.$outer.frame);
      this.$outer.resizing = false;
      this.$outer.updateFrameCursor();
    }
    this._x = 0;
    this._y = 0;
    this.__x = 0;
    this.__y = 0;
    this.startingBounds = null;
    this.resizeDir = this.RESIZE_NONE;
    this.discardRelease = true;
  }
  mouseReleased(e: MouseEvent): void {
    this.finishMouseReleased();
  }
  mousePressed(e: MouseEvent): void {
    let p = SwingUtilities.convertPoint$Component$int$int$Component(e.getSource(), e.getX(), e.getY(), null);
    this.__x = e.getX();
    this.__y = e.getY();
    this._x = p.x_;
    this._y = p.y_;
    this.startingBounds = this.$outer.frame.getBounds$();
    this.resizeDir = this.RESIZE_NONE;
    this.discardRelease = false;
    try {
      this.$outer.frame.setSelected(true);
    } catch ($e3) {
      if ($J.isa($e3, PropertyVetoException)) {
        let e1 = $J.exc($e3);
      } else {
        throw $e3;
      }
    }
    let i = this.$outer.frame.getInsets$();
    let ep = new Point()._Point$int$int(this.__x, this.__y);
    if (e.getSource() === this.$outer.getNorthPane()) {
      let np = this.$outer.getNorthPane().getLocation$();
      ep.x_ = (ep.x_ + np.x_) | 0;
      ep.y_ = (ep.y_ + np.y_) | 0;
    }
    if (e.getSource() === this.$outer.getNorthPane()) {
      if (ep.x_ > i.left && ep.y_ > i.top && ep.x_ < ((this.$outer.frame.getWidth() - i.right) | 0)) {
        this.$outer.getDesktopManager().beginDraggingFrame(this.$outer.frame);
        this.$outer.dragging = true;
        return;
      }
    }
    if (!this.$outer.frame.isResizable()) {
      return;
    }
    if (e.getSource() === this.$outer.frame || e.getSource() === this.$outer.getNorthPane()) {
      if (ep.x_ <= i.left) {
        if (ep.y_ < ((this.resizeCornerSize + i.top) | 0)) {
          this.resizeDir = SwingConstants.NORTH_WEST;
        } else if (ep.y_ > ((this.$outer.frame.getHeight() - this.resizeCornerSize - i.bottom) | 0)) {
          this.resizeDir = SwingConstants.SOUTH_WEST;
        } else {
          this.resizeDir = SwingConstants.WEST;
        }
      } else if (ep.x_ >= ((this.$outer.frame.getWidth() - i.right) | 0)) {
        if (ep.y_ < ((this.resizeCornerSize + i.top) | 0)) {
          this.resizeDir = SwingConstants.NORTH_EAST;
        } else if (ep.y_ > ((this.$outer.frame.getHeight() - this.resizeCornerSize - i.bottom) | 0)) {
          this.resizeDir = SwingConstants.SOUTH_EAST;
        } else {
          this.resizeDir = SwingConstants.EAST;
        }
      } else if (ep.y_ <= i.top) {
        if (ep.x_ < ((this.resizeCornerSize + i.left) | 0)) {
          this.resizeDir = SwingConstants.NORTH_WEST;
        } else if (ep.x_ > ((this.$outer.frame.getWidth() - this.resizeCornerSize - i.right) | 0)) {
          this.resizeDir = SwingConstants.NORTH_EAST;
        } else {
          this.resizeDir = SwingConstants.NORTH;
        }
      } else if (ep.y_ >= ((this.$outer.frame.getHeight() - i.bottom) | 0)) {
        if (ep.x_ < ((this.resizeCornerSize + i.left) | 0)) {
          this.resizeDir = SwingConstants.SOUTH_WEST;
        } else if (ep.x_ > ((this.$outer.frame.getWidth() - this.resizeCornerSize - i.right) | 0)) {
          this.resizeDir = SwingConstants.SOUTH_EAST;
        } else {
          this.resizeDir = SwingConstants.SOUTH;
        }
      } else {
        this.discardRelease = true;
        return;
      }
      let s = Cursor.getPredefinedCursor(Cursor.DEFAULT_CURSOR);
      switch (this.resizeDir) {
        case SwingConstants.SOUTH:
          s = Cursor.getPredefinedCursor(Cursor.S_RESIZE_CURSOR);
          break;
        case SwingConstants.NORTH:
          s = Cursor.getPredefinedCursor(Cursor.N_RESIZE_CURSOR);
          break;
        case SwingConstants.WEST:
          s = Cursor.getPredefinedCursor(Cursor.W_RESIZE_CURSOR);
          break;
        case SwingConstants.EAST:
          s = Cursor.getPredefinedCursor(Cursor.E_RESIZE_CURSOR);
          break;
        case SwingConstants.SOUTH_EAST:
          s = Cursor.getPredefinedCursor(Cursor.SE_RESIZE_CURSOR);
          break;
        case SwingConstants.SOUTH_WEST:
          s = Cursor.getPredefinedCursor(Cursor.SW_RESIZE_CURSOR);
          break;
        case SwingConstants.NORTH_WEST:
          s = Cursor.getPredefinedCursor(Cursor.NW_RESIZE_CURSOR);
          break;
        case SwingConstants.NORTH_EAST:
          s = Cursor.getPredefinedCursor(Cursor.NE_RESIZE_CURSOR);
          break;
      }
      let c = this.$outer.frame.getTopLevelAncestor();
      if ($J.isa(c, RootPaneContainer)) {
        let glassPane = (c).getGlassPane();
        glassPane.setVisible(true);
        glassPane.setCursor$Cursor(s);
      }
      this.$outer.getDesktopManager().beginResizingFrame(this.$outer.frame, this.resizeDir);
      this.$outer.resizing = true;
      let windowAncestor = SwingUtilities.getWindowAncestor(this.$outer.frame);
      if (windowAncestor != null) {
        windowAncestor.addWindowFocusListener(this.$outer.getWindowFocusListener());
      }
      return;
    }
  }
  mouseDragged(e: MouseEvent): void {
    if (this.startingBounds == null) {
      return;
    }
    let p = SwingUtilities.convertPoint$Component$int$int$Component(e.getSource(), e.getX(), e.getY(), null);
    let deltaX = (this._x - p.x_) | 0;
    let deltaY = (this._y - p.y_) | 0;
    let min = this.$outer.frame.getMinimumSize$();
    let max = this.$outer.frame.getMaximumSize();
    let newX: number;
    let newY: number;
    let newW: number;
    let newH: number;
    let i = this.$outer.frame.getInsets$();
    if (this.$outer.dragging) {
      if (this.$outer.frame.isMaximum() || ((e.getModifiers() & InputEvent.BUTTON1_MASK) !== InputEvent.BUTTON1_MASK)) {
        return;
      }
      let pWidth: number;
      let pHeight: number;
      let s = this.$outer.frame.getParent().getSize$();
      pWidth = s.width_;
      pHeight = s.height_;
      newX = (this.startingBounds.x_ - deltaX) | 0;
      newY = (this.startingBounds.y_ - deltaY) | 0;
      if (((newX + i.left) | 0) <= -this.__x) {
        newX = (-this.__x - i.left + 1) | 0;
      }
      if (((newY + i.top) | 0) <= -this.__y) {
        newY = (-this.__y - i.top + 1) | 0;
      }
      if (((newX + this.__x + i.right) | 0) >= pWidth) {
        newX = (pWidth - this.__x - i.right - 1) | 0;
      }
      if (((newY + this.__y + i.bottom) | 0) >= pHeight) {
        newY = (pHeight - this.__y - i.bottom - 1) | 0;
      }
      this.$outer.getDesktopManager().dragFrame(this.$outer.frame, newX, newY);
      return;
    }
    if (!this.$outer.frame.isResizable()) {
      return;
    }
    newX = this.$outer.frame.getX();
    newY = this.$outer.frame.getY();
    newW = this.$outer.frame.getWidth();
    newH = this.$outer.frame.getHeight();
    this.$outer.parentBounds = this.$outer.frame.getParent().getBounds$();
    switch (this.resizeDir) {
      case this.RESIZE_NONE:
        return;
      case SwingConstants.NORTH:
        if (((this.startingBounds.height_ + deltaY) | 0) < min.height_) {
          deltaY = -((this.startingBounds.height_ - min.height_) | 0);
        } else if (((this.startingBounds.height_ + deltaY) | 0) > max.height_) {
          deltaY = (max.height_ - this.startingBounds.height_) | 0;
        }
        if (((this.startingBounds.y_ - deltaY) | 0) < 0) {
          deltaY = this.startingBounds.y_;
        }
        newX = this.startingBounds.x_;
        newY = (this.startingBounds.y_ - deltaY) | 0;
        newW = this.startingBounds.width_;
        newH = (this.startingBounds.height_ + deltaY) | 0;
        break;
      case SwingConstants.NORTH_EAST:
        if (((this.startingBounds.height_ + deltaY) | 0) < min.height_) {
          deltaY = -((this.startingBounds.height_ - min.height_) | 0);
        } else if (((this.startingBounds.height_ + deltaY) | 0) > max.height_) {
          deltaY = (max.height_ - this.startingBounds.height_) | 0;
        }
        if (((this.startingBounds.y_ - deltaY) | 0) < 0) {
          deltaY = this.startingBounds.y_;
        }
        if (((this.startingBounds.width_ - deltaX) | 0) < min.width_) {
          deltaX = (this.startingBounds.width_ - min.width_) | 0;
        } else if (((this.startingBounds.width_ - deltaX) | 0) > max.width_) {
          deltaX = -((max.width_ - this.startingBounds.width_) | 0);
        }
        if (((this.startingBounds.x_ + this.startingBounds.width_ - deltaX) | 0) > this.$outer.parentBounds.width_) {
          deltaX = (this.startingBounds.x_ + this.startingBounds.width_ - this.$outer.parentBounds.width_) | 0;
        }
        newX = this.startingBounds.x_;
        newY = (this.startingBounds.y_ - deltaY) | 0;
        newW = (this.startingBounds.width_ - deltaX) | 0;
        newH = (this.startingBounds.height_ + deltaY) | 0;
        break;
      case SwingConstants.EAST:
        if (((this.startingBounds.width_ - deltaX) | 0) < min.width_) {
          deltaX = (this.startingBounds.width_ - min.width_) | 0;
        } else if (((this.startingBounds.width_ - deltaX) | 0) > max.width_) {
          deltaX = -((max.width_ - this.startingBounds.width_) | 0);
        }
        if (((this.startingBounds.x_ + this.startingBounds.width_ - deltaX) | 0) > this.$outer.parentBounds.width_) {
          deltaX = (this.startingBounds.x_ + this.startingBounds.width_ - this.$outer.parentBounds.width_) | 0;
        }
        newW = (this.startingBounds.width_ - deltaX) | 0;
        newH = this.startingBounds.height_;
        break;
      case SwingConstants.SOUTH_EAST:
        if (((this.startingBounds.width_ - deltaX) | 0) < min.width_) {
          deltaX = (this.startingBounds.width_ - min.width_) | 0;
        } else if (((this.startingBounds.width_ - deltaX) | 0) > max.width_) {
          deltaX = -((max.width_ - this.startingBounds.width_) | 0);
        }
        if (((this.startingBounds.x_ + this.startingBounds.width_ - deltaX) | 0) > this.$outer.parentBounds.width_) {
          deltaX = (this.startingBounds.x_ + this.startingBounds.width_ - this.$outer.parentBounds.width_) | 0;
        }
        if (((this.startingBounds.height_ - deltaY) | 0) < min.height_) {
          deltaY = (this.startingBounds.height_ - min.height_) | 0;
        } else if (((this.startingBounds.height_ - deltaY) | 0) > max.height_) {
          deltaY = -((max.height_ - this.startingBounds.height_) | 0);
        }
        if (((this.startingBounds.y_ + this.startingBounds.height_ - deltaY) | 0) > this.$outer.parentBounds.height_) {
          deltaY = (this.startingBounds.y_ + this.startingBounds.height_ - this.$outer.parentBounds.height_) | 0;
        }
        newW = (this.startingBounds.width_ - deltaX) | 0;
        newH = (this.startingBounds.height_ - deltaY) | 0;
        break;
      case SwingConstants.SOUTH:
        if (((this.startingBounds.height_ - deltaY) | 0) < min.height_) {
          deltaY = (this.startingBounds.height_ - min.height_) | 0;
        } else if (((this.startingBounds.height_ - deltaY) | 0) > max.height_) {
          deltaY = -((max.height_ - this.startingBounds.height_) | 0);
        }
        if (((this.startingBounds.y_ + this.startingBounds.height_ - deltaY) | 0) > this.$outer.parentBounds.height_) {
          deltaY = (this.startingBounds.y_ + this.startingBounds.height_ - this.$outer.parentBounds.height_) | 0;
        }
        newW = this.startingBounds.width_;
        newH = (this.startingBounds.height_ - deltaY) | 0;
        break;
      case SwingConstants.SOUTH_WEST:
        if (((this.startingBounds.height_ - deltaY) | 0) < min.height_) {
          deltaY = (this.startingBounds.height_ - min.height_) | 0;
        } else if (((this.startingBounds.height_ - deltaY) | 0) > max.height_) {
          deltaY = -((max.height_ - this.startingBounds.height_) | 0);
        }
        if (((this.startingBounds.y_ + this.startingBounds.height_ - deltaY) | 0) > this.$outer.parentBounds.height_) {
          deltaY = (this.startingBounds.y_ + this.startingBounds.height_ - this.$outer.parentBounds.height_) | 0;
        }
        if (((this.startingBounds.width_ + deltaX) | 0) < min.width_) {
          deltaX = -((this.startingBounds.width_ - min.width_) | 0);
        } else if (((this.startingBounds.width_ + deltaX) | 0) > max.width_) {
          deltaX = (max.width_ - this.startingBounds.width_) | 0;
        }
        if (((this.startingBounds.x_ - deltaX) | 0) < 0) {
          deltaX = this.startingBounds.x_;
        }
        newX = (this.startingBounds.x_ - deltaX) | 0;
        newY = this.startingBounds.y_;
        newW = (this.startingBounds.width_ + deltaX) | 0;
        newH = (this.startingBounds.height_ - deltaY) | 0;
        break;
      case SwingConstants.WEST:
        if (((this.startingBounds.width_ + deltaX) | 0) < min.width_) {
          deltaX = -((this.startingBounds.width_ - min.width_) | 0);
        } else if (((this.startingBounds.width_ + deltaX) | 0) > max.width_) {
          deltaX = (max.width_ - this.startingBounds.width_) | 0;
        }
        if (((this.startingBounds.x_ - deltaX) | 0) < 0) {
          deltaX = this.startingBounds.x_;
        }
        newX = (this.startingBounds.x_ - deltaX) | 0;
        newY = this.startingBounds.y_;
        newW = (this.startingBounds.width_ + deltaX) | 0;
        newH = this.startingBounds.height_;
        break;
      case SwingConstants.NORTH_WEST:
        if (((this.startingBounds.width_ + deltaX) | 0) < min.width_) {
          deltaX = -((this.startingBounds.width_ - min.width_) | 0);
        } else if (((this.startingBounds.width_ + deltaX) | 0) > max.width_) {
          deltaX = (max.width_ - this.startingBounds.width_) | 0;
        }
        if (((this.startingBounds.x_ - deltaX) | 0) < 0) {
          deltaX = this.startingBounds.x_;
        }
        if (((this.startingBounds.height_ + deltaY) | 0) < min.height_) {
          deltaY = -((this.startingBounds.height_ - min.height_) | 0);
        } else if (((this.startingBounds.height_ + deltaY) | 0) > max.height_) {
          deltaY = (max.height_ - this.startingBounds.height_) | 0;
        }
        if (((this.startingBounds.y_ - deltaY) | 0) < 0) {
          deltaY = this.startingBounds.y_;
        }
        newX = (this.startingBounds.x_ - deltaX) | 0;
        newY = (this.startingBounds.y_ - deltaY) | 0;
        newW = (this.startingBounds.width_ + deltaX) | 0;
        newH = (this.startingBounds.height_ + deltaY) | 0;
        break;
      default:
        return;
    }
    this.$outer.getDesktopManager().resizeFrame(this.$outer.frame, newX, newY, newW, newH);
  }
  mouseMoved(e: MouseEvent): void {
    if (!this.$outer.frame.isResizable()) {
      return;
    }
    if (e.getSource() === this.$outer.frame || e.getSource() === this.$outer.getNorthPane()) {
      let i = this.$outer.frame.getInsets$();
      let ep = new Point()._Point$int$int(e.getX(), e.getY());
      if (e.getSource() === this.$outer.getNorthPane()) {
        let np = this.$outer.getNorthPane().getLocation$();
        ep.x_ = (ep.x_ + np.x_) | 0;
        ep.y_ = (ep.y_ + np.y_) | 0;
      }
      if (ep.x_ <= i.left) {
        if (ep.y_ < ((this.resizeCornerSize + i.top) | 0)) {
          this.$outer.frame.setCursor$Cursor(Cursor.getPredefinedCursor(Cursor.NW_RESIZE_CURSOR));
        } else if (ep.y_ > ((this.$outer.frame.getHeight() - this.resizeCornerSize - i.bottom) | 0)) {
          this.$outer.frame.setCursor$Cursor(Cursor.getPredefinedCursor(Cursor.SW_RESIZE_CURSOR));
        } else {
          this.$outer.frame.setCursor$Cursor(Cursor.getPredefinedCursor(Cursor.W_RESIZE_CURSOR));
        }
      } else if (ep.x_ >= ((this.$outer.frame.getWidth() - i.right) | 0)) {
        if (e.getY() < ((this.resizeCornerSize + i.top) | 0)) {
          this.$outer.frame.setCursor$Cursor(Cursor.getPredefinedCursor(Cursor.NE_RESIZE_CURSOR));
        } else if (ep.y_ > ((this.$outer.frame.getHeight() - this.resizeCornerSize - i.bottom) | 0)) {
          this.$outer.frame.setCursor$Cursor(Cursor.getPredefinedCursor(Cursor.SE_RESIZE_CURSOR));
        } else {
          this.$outer.frame.setCursor$Cursor(Cursor.getPredefinedCursor(Cursor.E_RESIZE_CURSOR));
        }
      } else if (ep.y_ <= i.top) {
        if (ep.x_ < ((this.resizeCornerSize + i.left) | 0)) {
          this.$outer.frame.setCursor$Cursor(Cursor.getPredefinedCursor(Cursor.NW_RESIZE_CURSOR));
        } else if (ep.x_ > ((this.$outer.frame.getWidth() - this.resizeCornerSize - i.right) | 0)) {
          this.$outer.frame.setCursor$Cursor(Cursor.getPredefinedCursor(Cursor.NE_RESIZE_CURSOR));
        } else {
          this.$outer.frame.setCursor$Cursor(Cursor.getPredefinedCursor(Cursor.N_RESIZE_CURSOR));
        }
      } else if (ep.y_ >= ((this.$outer.frame.getHeight() - i.bottom) | 0)) {
        if (ep.x_ < ((this.resizeCornerSize + i.left) | 0)) {
          this.$outer.frame.setCursor$Cursor(Cursor.getPredefinedCursor(Cursor.SW_RESIZE_CURSOR));
        } else if (ep.x_ > ((this.$outer.frame.getWidth() - this.resizeCornerSize - i.right) | 0)) {
          this.$outer.frame.setCursor$Cursor(Cursor.getPredefinedCursor(Cursor.SE_RESIZE_CURSOR));
        } else {
          this.$outer.frame.setCursor$Cursor(Cursor.getPredefinedCursor(Cursor.S_RESIZE_CURSOR));
        }
      } else {
        this.$outer.updateFrameCursor();
      }
      return;
    }
    this.$outer.updateFrameCursor();
  }
  mouseEntered(e: MouseEvent): void {
    this.$outer.updateFrameCursor();
  }
  mouseExited(e: MouseEvent): void {
    this.$outer.updateFrameCursor();
  }
}

export class BasicInternalFrameUI$Handler extends JObject {
  _BasicInternalFrameUI$Handler(): this {
    return this;
  }
  windowGainedFocus(e: WindowEvent): void {
  }
  windowLostFocus(e: WindowEvent): void {
    this.$outer.cancelResize();
  }
  /**
   * Invoked when a JInternalFrame's parent's size changes.
   */
  componentResized(e: ComponentEvent): void {
    let parentNewBounds = (e.getSource()).getBounds$();
    let icon = null;
    if (this.$outer.frame != null) {
      icon = this.$outer.frame.getDesktopIcon();
      if (this.$outer.frame.isMaximum()) {
        this.$outer.frame.setBounds$int$int$int$int(0, 0, parentNewBounds.width_, parentNewBounds.height_);
      }
    }
    if (icon != null) {
      let iconBounds = icon.getBounds$();
      let y = (iconBounds.y_ + (parentNewBounds.height_ - this.$outer.parentBounds.height_)) | 0;
      icon.setBounds$int$int$int$int(iconBounds.x_, y, iconBounds.width_, iconBounds.height_);
    }
    if (!this.$outer.parentBounds.equals(parentNewBounds)) {
      this.$outer.parentBounds = parentNewBounds;
    }
    if (this.$outer.frame != null) {
      this.$outer.frame.validate();
    }
  }
  componentMoved(e: ComponentEvent): void {
  }
  componentShown(e: ComponentEvent): void {
  }
  componentHidden(e: ComponentEvent): void {
  }
  internalFrameClosed(e: InternalFrameEvent): void {
    this.$outer.frame.removeInternalFrameListener(this.$outer.getHandler());
  }
  internalFrameActivated(e: InternalFrameEvent): void {
    if (!this.$outer.isKeyBindingRegistered()) {
      this.$outer.setKeyBindingRegistered(true);
      this.$outer.setupMenuOpenKey();
      this.$outer.setupMenuCloseKey();
    }
    if (this.$outer.isKeyBindingRegistered()) {
      this.$outer.setKeyBindingActive(true);
    }
  }
  internalFrameDeactivated(e: InternalFrameEvent): void {
    this.$outer.setKeyBindingActive(false);
  }
  internalFrameClosing(e: InternalFrameEvent): void {
  }
  internalFrameOpened(e: InternalFrameEvent): void {
  }
  internalFrameIconified(e: InternalFrameEvent): void {
  }
  internalFrameDeiconified(e: InternalFrameEvent): void {
  }
  addLayoutComponent$String$Component(name: string, c: Component): void {
  }
  removeLayoutComponent(c: Component): void {
  }
  preferredLayoutSize(c: Container): Dimension {
    let result: Dimension;
    let i = this.$outer.frame.getInsets$();
    result = new Dimension()._Dimension$Dimension(this.$outer.frame.getRootPane().getPreferredSize$());
    result.width_ = (result.width_ + (i.left + i.right)) | 0;
    result.height_ = (result.height_ + (i.top + i.bottom)) | 0;
    if (this.$outer.getNorthPane() != null) {
      let d = this.$outer.getNorthPane().getPreferredSize$();
      result.width_ = Math.max(d.width_, result.width_);
      result.height_ = (result.height_ + d.height_) | 0;
    }
    if (this.$outer.getSouthPane() != null) {
      let d = this.$outer.getSouthPane().getPreferredSize$();
      result.width_ = Math.max(d.width_, result.width_);
      result.height_ = (result.height_ + d.height_) | 0;
    }
    if (this.$outer.getEastPane() != null) {
      let d = this.$outer.getEastPane().getPreferredSize$();
      result.width_ = (result.width_ + d.width_) | 0;
      result.height_ = Math.max(d.height_, result.height_);
    }
    if (this.$outer.getWestPane() != null) {
      let d = this.$outer.getWestPane().getPreferredSize$();
      result.width_ = (result.width_ + d.width_) | 0;
      result.height_ = Math.max(d.height_, result.height_);
    }
    return result;
  }
  minimumLayoutSize(c: Container): Dimension {
    let result = new Dimension()._Dimension$();
    var tp;
    if ((tp = this.$outer.getNorthPane()) instanceof BasicInternalFrameTitlePane) {
      result = new Dimension()._Dimension$Dimension(tp.getMinimumSize$());
    }
    let i = this.$outer.frame.getInsets$();
    result.width_ = (result.width_ + (i.left + i.right)) | 0;
    result.height_ = (result.height_ + (i.top + i.bottom)) | 0;
    return result;
  }
  layoutContainer$Container(c: Container): void {
    let i = this.$outer.frame.getInsets$();
    let cx: number;
    let cy: number;
    let cw: number;
    let ch: number;
    cx = i.left;
    cy = i.top;
    cw = (this.$outer.frame.getWidth() - i.left - i.right) | 0;
    ch = (this.$outer.frame.getHeight() - i.top - i.bottom) | 0;
    if (this.$outer.getNorthPane() != null) {
      let size = this.$outer.getNorthPane().getPreferredSize$();
      if (DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(this.$outer.frame, this.$outer, 'InternalFrame.layoutTitlePaneAtOrigin', false)) {
        cy = 0;
        ch = (ch + i.top) | 0;
        this.$outer.getNorthPane().setBounds$int$int$int$int(0, 0, this.$outer.frame.getWidth(), size.height_);
      } else {
        this.$outer.getNorthPane().setBounds$int$int$int$int(cx, cy, cw, size.height_);
      }
      cy = (cy + size.height_) | 0;
      ch = (ch - size.height_) | 0;
    }
    if (this.$outer.getSouthPane() != null) {
      let size = this.$outer.getSouthPane().getPreferredSize$();
      this.$outer.getSouthPane().setBounds$int$int$int$int(cx, (this.$outer.frame.getHeight() - i.bottom - size.height_) | 0, cw, size.height_);
      ch = (ch - size.height_) | 0;
    }
    if (this.$outer.getWestPane() != null) {
      let size = this.$outer.getWestPane().getPreferredSize$();
      this.$outer.getWestPane().setBounds$int$int$int$int(cx, cy, size.width_, ch);
      cw = (cw - size.width_) | 0;
      cx = (cx + size.width_) | 0;
    }
    if (this.$outer.getEastPane() != null) {
      let size = this.$outer.getEastPane().getPreferredSize$();
      this.$outer.getEastPane().setBounds$int$int$int$int((cw - size.width_) | 0, cy, size.width_, ch);
      cw = (cw - size.width_) | 0;
    }
    if (this.$outer.frame.getRootPane() != null) {
      this.$outer.frame.getRootPane().setBounds$int$int$int$int(cx, cy, cw, ch);
    }
  }
  mousePressed(e: MouseEvent): void {
  }
  mouseEntered(e: MouseEvent): void {
  }
  mouseMoved(e: MouseEvent): void {
  }
  mouseExited(e: MouseEvent): void {
  }
  mouseClicked(e: MouseEvent): void {
  }
  mouseReleased(e: MouseEvent): void {
  }
  mouseDragged(e: MouseEvent): void {
  }
  propertyChange(evt: PropertyChangeEvent): void {
    let prop = evt.getPropertyName();
    let f = evt.getSource();
    let newValue = evt.getNewValue();
    let oldValue = evt.getOldValue();
    if (JInternalFrame.IS_CLOSED_PROPERTY === prop) {
      if (newValue === true) {
        this.$outer.cancelResize();
        if ((this.$outer.frame.getParent() != null) && this.$outer.componentListenerAdded) {
          this.$outer.frame.getParent().removeComponentListener(this.$outer.componentListener);
        }
        this.$outer.closeFrame(f);
      }
    } else if (JInternalFrame.IS_MAXIMUM_PROPERTY === prop) {
      if (newValue === true) {
        this.$outer.maximizeFrame(f);
      } else {
        this.$outer.minimizeFrame(f);
      }
    } else if (JInternalFrame.IS_ICON_PROPERTY === prop) {
      if (newValue === true) {
        this.$outer.iconifyFrame(f);
      } else {
        this.$outer.deiconifyFrame(f);
      }
    } else if (JInternalFrame.IS_SELECTED_PROPERTY === prop) {
      if (newValue === true && oldValue === false) {
        this.$outer.activateFrame(f);
      } else if (newValue === false && oldValue === true) {
        this.$outer.deactivateFrame(f);
      }
    } else if (prop === 'ancestor') {
      if (newValue == null) {
        this.$outer.cancelResize();
      }
      if (this.$outer.frame.getParent() != null) {
        this.$outer.parentBounds = f.getParent().getBounds$();
      } else {
        this.$outer.parentBounds = null;
      }
      if ((this.$outer.frame.getParent() != null) && this.$outer.frame.isIcon()) {
        let value = this.$outer.frame.getClientProperty('wasIconOnce');
        if ($J.equals(false, value)) {
          this.$outer.iconifyFrame(this.$outer.frame);
        }
      }
      if ((this.$outer.frame.getParent() != null) && !this.$outer.componentListenerAdded) {
        f.getParent().addComponentListener(this.$outer.componentListener);
        this.$outer.componentListenerAdded = true;
        if (f.isMaximum()) {
          this.$outer.maximizeFrame(f);
        }
      }
    } else if (JInternalFrame.TITLE_PROPERTY === prop || prop === 'closable' || prop === 'iconable' || prop === 'maximizable') {
      let dim = this.$outer.frame.getMinimumSize$();
      let frame_dim = this.$outer.frame.getSize$();
      if (dim.width_ > frame_dim.width_) {
        this.$outer.frame.setSize$int$int(dim.width_, frame_dim.height_);
      }
    }
  }
}

let $BasicInternalFrameUI$1: any = null;
/** An anonymous class (BasicInternalFrameUI.java:190). */
function BasicInternalFrameUI$1(): any {
  return $BasicInternalFrameUI$1 ??= $J.local(class extends UIAction {
    actionPerformed(evt: ActionEvent): void {
      let iFrame = evt.getSource();
      if (iFrame.getUI() instanceof BasicInternalFrameUI) {
        let comp = (iFrame.getUI()).getNorthPane();
        if (comp instanceof BasicInternalFrameTitlePane) {
          (comp).showSystemMenu();
        }
      }
    }
    accept(sender: any): boolean {
      if (sender instanceof JInternalFrame) {
        let iFrame = sender;
        if (iFrame.getUI() instanceof BasicInternalFrameUI) {
          return (iFrame.getUI()).isKeyBindingActive();
        }
      }
      return false;
    }
  }, 'javax.swing.plaf.basic.BasicInternalFrameUI$1', []);
}

$J.define(BasicInternalFrameUI, 'javax.swing.plaf.basic.BasicInternalFrameUI', { kind: 'class', sup: 'javax.swing.plaf.InternalFrameUI', ctors: { 'javax.swing.JInternalFrame': '_BasicInternalFrameUI' }, meths: { 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent' } });
$J.define(BasicInternalFrameUI$BorderListener, 'javax.swing.plaf.basic.BasicInternalFrameUI$BorderListener', { kind: 'class', ifaces: ['javax.swing.SwingConstants'], sup: 'javax.swing.event.MouseInputAdapter', ctors: { '': '_BasicInternalFrameUI$BorderListener' }, inner: true });
$J.define(BasicInternalFrameUI$Handler, 'javax.swing.plaf.basic.BasicInternalFrameUI$Handler', { kind: 'class', ifaces: ['java.awt.event.ComponentListener', 'javax.swing.event.InternalFrameListener', 'java.awt.LayoutManager', 'javax.swing.event.MouseInputListener', 'java.beans.PropertyChangeListener', 'java.awt.event.WindowFocusListener', 'javax.swing.SwingConstants'], sup: 'java.lang.Object', ctors: { '': '_BasicInternalFrameUI$Handler' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' }, inner: true });
$J.module(() => {
  Cursor = $J.load('java.awt.Cursor');
  Dimension = $J.load('java.awt.Dimension');
  IllegalComponentStateException = $J.load('java.awt.IllegalComponentStateException');
  Point = $J.load('java.awt.Point');
  InputEvent = $J.load('java.awt.event.InputEvent');
  PropertyVetoException = $J.load('java.beans.PropertyVetoException');
  DefaultDesktopManager = $J.load('javax.swing.DefaultDesktopManager');
  JComponent = $J.load('javax.swing.JComponent');
  JInternalFrame = $J.load('javax.swing.JInternalFrame');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  RootPaneContainer = $J.load('javax.swing.RootPaneContainer');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicInternalFrameTitlePane = $J.load('javax.swing.plaf.basic.BasicInternalFrameTitlePane');
  BasicLookAndFeel = $J.load('javax.swing.plaf.basic.BasicLookAndFeel');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
  UIAction = $J.load('sun.swing.UIAction');
});
