// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/ToolTipManager.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, Objects, Toolkit } from '../../../jre/index.ts';
import { MouseAdapter } from '../../java/awt/event/MouseAdapter.ts';
import { MouseMotionAdapter } from '../../java/awt/event/MouseMotionAdapter.ts';
import { KeyAdapter } from '../../java/awt/event/KeyAdapter.ts';

let GraphicsEnvironment, KeyboardFocusManager, Point, Rectangle, FocusAdapter, InputEvent, KeyEvent, JApplet, JDialog, JFrame, JInternalFrame, JMenuItem, JWindow, KeyStroke, PopupFactory, SwingUtilities, Timer, UIManager;

/**
 * Manages all the <code>ToolTips</code> in the system.
 * <p>
 * ToolTipManager contains numerous properties for configuring how long it
 * will take for the tooltips to become visible, and how long till they
 * hide. Consider a component that has a different tooltip based on where
 * the mouse is, such as JTree. When the mouse moves into the JTree and
 * over a region that has a valid tooltip, the tooltip will become
 * visible after <code>initialDelay</code> milliseconds. After
 * <code>dismissDelay</code> milliseconds the tooltip will be hidden. If
 * the mouse is over a region that has a valid tooltip, and the tooltip
 * is currently visible, when the mouse moves to a region that doesn't have
 * a valid tooltip the tooltip will be hidden. If the mouse then moves back
 * into a region that has a valid tooltip within <code>reshowDelay</code>
 * milliseconds, the tooltip will immediately be shown, otherwise the
 * tooltip will be shown again after <code>initialDelay</code> milliseconds.
 *
 * @see JComponent#createToolTip
 * @author Dave Moore
 * @author Rich Schiavi
 * @since 1.2
 */
export class ToolTipManager extends MouseAdapter {
  enterTimer: Timer = null;
  exitTimer: Timer = null;
  insideTimer: Timer = null;
  toolTipText: string = null;
  preferredLocation: Point = null;
  insideComponent: JComponent = null;
  mouseEvent: MouseEvent = null;
  showImmediately: boolean = false;
  static TOOL_TIP_MANAGER_KEY: any = null;
  tipWindow: Popup = null;
  /**
   * The Window tip is being displayed in. This will be non-null if
   * the Window tip is in differs from that of insideComponent's Window.
   */
  window: Window = null;
  tip: JToolTip = null;
  popupRect: Rectangle = null;
  popupFrameRect: Rectangle = null;
  enabled: boolean = false;
  tipShowing: boolean = false;
  focusChangeListener: FocusListener = null;
  moveBeforeEnterListener: MouseMotionListener = null;
  accessibilityKeyListener: KeyListener = null;
  postTip: KeyStroke = null;
  hideTip: KeyStroke = null;
  /**
   * Lightweight popup enabled.
   */
  lightWeightPopupEnabled: boolean = false;
  /**
   * Heavyweight popup enabled.
   */
  heavyWeightPopupEnabled: boolean = false;
  _ToolTipManager(): this {
    this._MouseAdapter();
    this.popupRect = null;
    this.popupFrameRect = null;
    this.enabled = true;
    this.tipShowing = false;
    this.focusChangeListener = null;
    this.moveBeforeEnterListener = null;
    this.accessibilityKeyListener = null;
    this.lightWeightPopupEnabled = true;
    this.heavyWeightPopupEnabled = false;
    this.enterTimer = new Timer()._Timer(750, $J.fn(new ToolTipManager$insideTimerAction().$o(this)._ToolTipManager$insideTimerAction(), 'actionPerformed'));
    this.enterTimer.setRepeats(false);
    this.exitTimer = new Timer()._Timer(500, $J.fn(new ToolTipManager$outsideTimerAction().$o(this)._ToolTipManager$outsideTimerAction(), 'actionPerformed'));
    this.exitTimer.setRepeats(false);
    this.insideTimer = new Timer()._Timer(4000, $J.fn(new ToolTipManager$stillInsideTimerAction().$o(this)._ToolTipManager$stillInsideTimerAction(), 'actionPerformed'));
    this.insideTimer.setRepeats(false);
    this.moveBeforeEnterListener = new ToolTipManager$MoveBeforeEnterListener().$o(this)._ToolTipManager$MoveBeforeEnterListener();
    this.accessibilityKeyListener = new ToolTipManager$AccessibilityKeyListener().$o(this)._ToolTipManager$AccessibilityKeyListener();
    this.postTip = KeyStroke.getKeyStroke$int$int(KeyEvent.VK_F1, InputEvent.CTRL_MASK);
    this.hideTip = KeyStroke.getKeyStroke$int$int(KeyEvent.VK_ESCAPE, 0);
    return this;
  }
  getDrawingGC(toFind: Point): GraphicsConfiguration {
    let env = GraphicsEnvironment.getLocalGraphicsEnvironment();
    let devices = env.getScreenDevices();
    for (let device of devices) {
      let config = device.getDefaultConfiguration();
      let rect = config.getBounds();
      if (rect.contains$Point(toFind)) {
        return config;
      }
    }
    return null;
  }
  showTipWindow(): void {
    if (this.insideComponent == null || !this.insideComponent.isShowing()) {
      return;
    }
    let mode = UIManager.getString$Object('ToolTipManager.enableToolTipMode');
    if ($J.equals('activeApplication', mode)) {
      let kfm = KeyboardFocusManager.getCurrentKeyboardFocusManager$();
      if (kfm.getFocusedWindow() == null) {
        return;
      }
    }
    if (this.enabled) {
      let size: Dimension;
      let screenLocation = this.insideComponent.getLocationOnScreen();
      let location: Point;
      let toFind: Point;
      if (this.preferredLocation != null) {
        toFind = new Point()._Point$int$int((screenLocation.x_ + this.preferredLocation.x_) | 0, (screenLocation.y_ + this.preferredLocation.y_) | 0);
      } else {
        if (this.mouseEvent != null) {
          toFind = this.mouseEvent.getLocationOnScreen();
        } else {
          toFind = screenLocation;
        }
      }
      let gc = this.getDrawingGC(toFind);
      if (gc == null) {
        if (this.mouseEvent != null) {
          toFind = this.mouseEvent.getLocationOnScreen();
          gc = this.getDrawingGC(toFind);
        }
        if (gc == null) {
          gc = this.insideComponent.getGraphicsConfiguration();
        }
      }
      let sBounds = gc.getBounds();
      let screenInsets = Toolkit.getDefaultToolkit().getScreenInsets(gc);
      sBounds.x_ = (sBounds.x_ + screenInsets.left) | 0;
      sBounds.y_ = (sBounds.y_ + screenInsets.top) | 0;
      sBounds.width_ = (sBounds.width_ - (screenInsets.left + screenInsets.right)) | 0;
      sBounds.height_ = (sBounds.height_ - (screenInsets.top + screenInsets.bottom)) | 0;
      let leftToRight = SwingUtilities.isLeftToRight(this.insideComponent);
      this.hideTipWindow();
      this.tip = this.insideComponent.createToolTip();
      this.tip.setTipText(this.toolTipText);
      size = this.tip.getPreferredSize$();
      if (this.preferredLocation != null) {
        location = toFind;
        if (!leftToRight) {
          location.x_ = (location.x_ - size.width_) | 0;
        }
      } else {
        if (this.mouseEvent != null) {
          location = new Point()._Point$int$int((screenLocation.x_ + this.mouseEvent.getX()) | 0, (screenLocation.y_ + this.mouseEvent.getY() + 20) | 0);
        } else {
          location = screenLocation;
        }
        if (!leftToRight) {
          if (((location.x_ - size.width_) | 0) >= 0) {
            location.x_ = (location.x_ - size.width_) | 0;
          }
        }
      }
      if (this.popupRect == null) {
        this.popupRect = new Rectangle()._Rectangle$();
      }
      this.popupRect.setBounds$int$int$int$int(location.x_, location.y_, size.width_, size.height_);
      if (location.x_ < sBounds.x_) {
        location.x_ = sBounds.x_;
      } else if (((location.x_ - sBounds.x_ + size.width_) | 0) > sBounds.width_) {
        location.x_ = (sBounds.x_ + (Math.max(0, (sBounds.width_ - size.width_) | 0))) | 0;
      }
      if (location.y_ < sBounds.y_) {
        location.y_ = sBounds.y_;
      } else if (((location.y_ - sBounds.y_ + size.height_) | 0) > sBounds.height_) {
        location.y_ = (sBounds.y_ + (Math.max(0, (sBounds.height_ - size.height_) | 0))) | 0;
      }
      let popupFactory = PopupFactory.getSharedInstance();
      if (this.lightWeightPopupEnabled) {
        let y = this.getPopupFitHeight(this.popupRect, this.insideComponent);
        let x = this.getPopupFitWidth(this.popupRect, this.insideComponent);
        if (x > 0 || y > 0) {
          popupFactory.setPopupType(PopupFactory.MEDIUM_WEIGHT_POPUP);
        } else {
          popupFactory.setPopupType(PopupFactory.LIGHT_WEIGHT_POPUP);
        }
      } else {
        popupFactory.setPopupType(PopupFactory.MEDIUM_WEIGHT_POPUP);
      }
      this.tipWindow = popupFactory.getPopup$Component$Component$int$int(this.insideComponent, this.tip, location.x_, location.y_);
      popupFactory.setPopupType(PopupFactory.LIGHT_WEIGHT_POPUP);
      this.tipWindow.show();
      let componentWindow = SwingUtilities.windowForComponent(this.insideComponent);
      this.window = SwingUtilities.windowForComponent(this.tip);
      if (this.window != null && this.window !== componentWindow) {
        this.window.addMouseListener(this);
      } else {
        this.window = null;
      }
      this.insideTimer.start();
      this.tipShowing = true;
    }
  }
  hideTipWindow(): void {
    if (this.tipWindow != null) {
      if (this.window != null) {
        this.window.removeMouseListener(this);
        this.window = null;
      }
      this.tipWindow.hide();
      this.tipWindow = null;
      this.tipShowing = false;
      this.tip = null;
      this.insideTimer.stop();
    }
  }
  /**
   * Returns a shared <code>ToolTipManager</code> instance.
   *
   * @return a shared <code>ToolTipManager</code> object
   */
  static sharedInstance(): ToolTipManager {
    let value = SwingUtilities.appContextGet(ToolTipManager.TOOL_TIP_MANAGER_KEY);
    if (value instanceof ToolTipManager) {
      return value;
    }
    let manager = new ToolTipManager()._ToolTipManager();
    SwingUtilities.appContextPut(ToolTipManager.TOOL_TIP_MANAGER_KEY, manager);
    return manager;
  }
  /**
   * Registers a component for tooltip management.
   * <p>
   * This will register key bindings to show and hide the tooltip text
   * only if <code>component</code> has focus bindings. This is done
   * so that components that are not normally focus traversable, such
   * as <code>JLabel</code>, are not made focus traversable as a result
   * of invoking this method.
   *
   * @param component  a <code>JComponent</code> object to add
   * @see JComponent#isFocusTraversable
   */
  registerComponent(component: JComponent): void {
    component.removeMouseListener(this);
    component.addMouseListener(this);
    component.removeMouseMotionListener(this.moveBeforeEnterListener);
    component.addMouseMotionListener(this.moveBeforeEnterListener);
    if (component instanceof JMenuItem) {
      (component).removeMenuKeyListener(this.accessibilityKeyListener);
      (component).addMenuKeyListener(this.accessibilityKeyListener);
    } else {
      component.removeKeyListener(this.accessibilityKeyListener);
      component.addKeyListener(this.accessibilityKeyListener);
    }
  }
  /**
   * Removes a component from tooltip control.
   *
   * @param component  a <code>JComponent</code> object to remove
   */
  unregisterComponent(component: JComponent): void {
    component.removeMouseListener(this);
    component.removeMouseMotionListener(this.moveBeforeEnterListener);
    if (component instanceof JMenuItem) {
      (component).removeMenuKeyListener(this.accessibilityKeyListener);
    } else {
      component.removeKeyListener(this.accessibilityKeyListener);
    }
  }
  /**
   * Called when the mouse enters the region of a component.
   *  This determines whether the tool tip should be shown.
   *
   *  @param event  the event in question
   */
  mouseEntered(event: MouseEvent): void {
    this.initiateToolTip(event);
  }
  initiateToolTip(event: MouseEvent): void {
    if (event.getSource() === this.window) {
      return;
    }
    let component = event.getSource();
    component.removeMouseMotionListener(this.moveBeforeEnterListener);
    this.exitTimer.stop();
    let location = event.getPoint();
    if (location.x_ < 0 || location.x_ >= component.getWidth() || location.y_ < 0 || location.y_ >= component.getHeight()) {
      return;
    }
    if (this.insideComponent != null) {
      this.enterTimer.stop();
    }
    component.removeMouseMotionListener(this);
    component.addMouseMotionListener(this);
    let sameComponent = (this.insideComponent === component);
    this.insideComponent = component;
    if (this.tipWindow != null) {
      this.mouseEvent = event;
      if (this.showImmediately) {
        let newToolTipText = component.getToolTipText$MouseEvent(event);
        let newPreferredLocation = component.getToolTipLocation(event);
        let sameLoc = (this.preferredLocation != null) ? this.preferredLocation.equals(newPreferredLocation) : (newPreferredLocation == null);
        if (!sameComponent || !Objects.equals(this.toolTipText, newToolTipText) || !sameLoc) {
          this.toolTipText = newToolTipText;
          this.preferredLocation = newPreferredLocation;
          this.showTipWindow();
        }
      } else {
        this.enterTimer.start();
      }
    }
  }
  /**
   * Called when the mouse exits the region of a component.
   *  Any tool tip showing should be hidden.
   *
   *  @param event  the event in question
   */
  mouseExited(event: MouseEvent): void {
    let shouldHide = true;
    if (this.insideComponent == null) {
    }
    if (this.window != null && event.getSource() === this.window && this.insideComponent != null) {
      let insideComponentWindow = this.insideComponent.getTopLevelAncestor();
      if (insideComponentWindow != null) {
        let location = event.getPoint();
        SwingUtilities.convertPointToScreen(location, this.window);
        location.x_ = (location.x_ - insideComponentWindow.getX()) | 0;
        location.y_ = (location.y_ - insideComponentWindow.getY()) | 0;
        location = SwingUtilities.convertPoint$Component$Point$Component(null, location, this.insideComponent);
        if (location.x_ >= 0 && location.x_ < this.insideComponent.getWidth() && location.y_ >= 0 && location.y_ < this.insideComponent.getHeight()) {
          shouldHide = false;
        } else {
          shouldHide = true;
        }
      }
    } else if (event.getSource() === this.insideComponent && this.tipWindow != null) {
      let win = SwingUtilities.getWindowAncestor(this.insideComponent);
      if (win != null) {
        let location = SwingUtilities.convertPoint$Component$Point$Component(this.insideComponent, event.getPoint(), win);
        let bounds = this.insideComponent.getTopLevelAncestor().getBounds$();
        location.x_ = (location.x_ + bounds.x_) | 0;
        location.y_ = (location.y_ + bounds.y_) | 0;
        let loc = new Point()._Point$int$int(0, 0);
        SwingUtilities.convertPointToScreen(loc, this.tip);
        bounds.x_ = loc.x_;
        bounds.y_ = loc.y_;
        bounds.width_ = this.tip.getWidth();
        bounds.height_ = this.tip.getHeight();
        if (location.x_ >= bounds.x_ && location.x_ < ((bounds.x_ + bounds.width_) | 0) && location.y_ >= bounds.y_ && location.y_ < ((bounds.y_ + bounds.height_) | 0)) {
          shouldHide = false;
        } else {
          shouldHide = true;
        }
      }
    }
    if (shouldHide) {
      this.enterTimer.stop();
      if (this.insideComponent != null) {
        this.insideComponent.removeMouseMotionListener(this);
      }
      this.insideComponent = null;
      this.toolTipText = null;
      this.mouseEvent = null;
      this.hideTipWindow();
      this.exitTimer.restart();
    }
  }
  /**
   * Called when the mouse is pressed.
   *  Any tool tip showing should be hidden.
   *
   *  @param event  the event in question
   */
  mousePressed(event: MouseEvent): void {
    this.hideTipWindow();
    this.enterTimer.stop();
    this.showImmediately = false;
    this.insideComponent = null;
    this.mouseEvent = null;
  }
  /**
   * Called when the mouse is pressed and dragged.
   *  Does nothing.
   *
   *  @param event  the event in question
   */
  mouseDragged(event: MouseEvent): void {
  }
  /**
   * Called when the mouse is moved.
   *  Determines whether the tool tip should be displayed.
   *
   *  @param event  the event in question
   */
  mouseMoved(event: MouseEvent): void {
    if (this.tipShowing) {
      this.checkForTipChange(event);
    } else if (this.showImmediately) {
      let component = event.getSource();
      this.toolTipText = component.getToolTipText$MouseEvent(event);
      if (this.toolTipText != null) {
        this.preferredLocation = component.getToolTipLocation(event);
        this.mouseEvent = event;
        this.insideComponent = component;
        this.exitTimer.stop();
        this.showTipWindow();
      }
    } else {
      this.insideComponent = event.getSource();
      this.mouseEvent = event;
      this.toolTipText = null;
      this.enterTimer.restart();
    }
  }
  /**
   * Checks to see if the tooltip needs to be changed in response to
   * the MouseMoved event <code>event</code>.
   */
  checkForTipChange(event: MouseEvent): void {
    let component = event.getSource();
    let newText = component.getToolTipText$MouseEvent(event);
    let newPreferredLocation = component.getToolTipLocation(event);
    if (newText != null || newPreferredLocation != null) {
      this.mouseEvent = event;
      if (((newText != null && $J.equals(newText, this.toolTipText)) || newText == null) && ((newPreferredLocation != null && newPreferredLocation.equals(this.preferredLocation)) || newPreferredLocation == null)) {
        if (this.tipWindow != null) {
          this.insideTimer.restart();
        } else {
          this.enterTimer.restart();
        }
      } else {
        this.toolTipText = newText;
        this.preferredLocation = newPreferredLocation;
        if (this.showImmediately) {
          this.hideTipWindow();
          this.showTipWindow();
          this.exitTimer.stop();
        } else {
          this.enterTimer.restart();
        }
      }
    } else {
      this.toolTipText = null;
      this.preferredLocation = null;
      this.mouseEvent = null;
      this.insideComponent = null;
      this.hideTipWindow();
      this.enterTimer.stop();
      this.exitTimer.restart();
    }
  }
  createFocusChangeListener(): FocusListener {
    return new (ToolTipManager$1())().$o(this)._FocusAdapter();
  }
  getPopupFitWidth(popupRectInScreen: Rectangle, invoker: Component): number {
    if (invoker != null) {
      let parent: Container;
      for (parent = invoker.getParent(); parent != null; parent = parent.getParent()) {
        if (parent instanceof JFrame || parent instanceof JDialog || parent instanceof JWindow) {
          return this.getWidthAdjust(parent.getBounds$(), popupRectInScreen);
        } else if (parent instanceof JApplet || parent instanceof JInternalFrame) {
          if (this.popupFrameRect == null) {
            this.popupFrameRect = new Rectangle()._Rectangle$();
          }
          let p = parent.getLocationOnScreen();
          this.popupFrameRect.setBounds$int$int$int$int(p.x_, p.y_, parent.getBounds$().width_, parent.getBounds$().height_);
          return this.getWidthAdjust(this.popupFrameRect, popupRectInScreen);
        }
      }
    }
    return 0;
  }
  getPopupFitHeight(popupRectInScreen: Rectangle, invoker: Component): number {
    if (invoker != null) {
      let parent: Container;
      for (parent = invoker.getParent(); parent != null; parent = parent.getParent()) {
        if (parent instanceof JFrame || parent instanceof JDialog || parent instanceof JWindow) {
          return this.getHeightAdjust(parent.getBounds$(), popupRectInScreen);
        } else if (parent instanceof JApplet || parent instanceof JInternalFrame) {
          if (this.popupFrameRect == null) {
            this.popupFrameRect = new Rectangle()._Rectangle$();
          }
          let p = parent.getLocationOnScreen();
          this.popupFrameRect.setBounds$int$int$int$int(p.x_, p.y_, parent.getBounds$().width_, parent.getBounds$().height_);
          return this.getHeightAdjust(this.popupFrameRect, popupRectInScreen);
        }
      }
    }
    return 0;
  }
  getHeightAdjust(a: Rectangle, b: Rectangle): number {
    if (b.y_ >= a.y_ && ((b.y_ + b.height_) | 0) <= ((a.y_ + a.height_) | 0)) {
      return 0;
    } else {
      return ((b.y_ + b.height_ - (a.y_ + a.height_) + 5) | 0);
    }
  }
  getWidthAdjust(a: Rectangle, b: Rectangle): number {
    if (b.x_ >= a.x_ && ((b.x_ + b.width_) | 0) <= ((a.x_ + a.width_) | 0)) {
      return 0;
    } else {
      return ((b.x_ + b.width_ - (a.x_ + a.width_) + 5) | 0);
    }
  }
  show(source: JComponent): void {
    if (this.tipWindow != null) {
      this.hideTipWindow();
      this.insideComponent = null;
    } else {
      this.hideTipWindow();
      this.enterTimer.stop();
      this.exitTimer.stop();
      this.insideTimer.stop();
      this.insideComponent = source;
      if (this.insideComponent != null) {
        this.toolTipText = this.insideComponent.getToolTipText$();
        this.preferredLocation = new Point()._Point$int$int(10, (this.insideComponent.getHeight() + 10) | 0);
        this.showTipWindow();
        if (this.focusChangeListener == null) {
          this.focusChangeListener = this.createFocusChangeListener();
        }
        this.insideComponent.addFocusListener(this.focusChangeListener);
      }
    }
  }
  hide(source: JComponent): void {
    this.hideTipWindow();
    source.removeFocusListener(this.focusChangeListener);
    this.preferredLocation = null;
    this.insideComponent = null;
  }
  static $clinit() {
    ToolTipManager.TOOL_TIP_MANAGER_KEY = new JObject();
  }
}

/**
 * Inside timer action.
 */
export class ToolTipManager$insideTimerAction extends JObject {
  /**
   * Constructs an {@code insideTimerAction}.
   */
  _ToolTipManager$insideTimerAction(): this {
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(e: ActionEvent): void {
    if (this.$outer.insideComponent != null && this.$outer.insideComponent.isShowing()) {
      if (this.$outer.toolTipText == null && this.$outer.mouseEvent != null) {
        this.$outer.toolTipText = this.$outer.insideComponent.getToolTipText$MouseEvent(this.$outer.mouseEvent);
        this.$outer.preferredLocation = this.$outer.insideComponent.getToolTipLocation(this.$outer.mouseEvent);
      }
      if (this.$outer.toolTipText != null) {
        this.$outer.showImmediately = true;
        this.$outer.showTipWindow();
      } else {
        this.$outer.insideComponent = null;
        this.$outer.toolTipText = null;
        this.$outer.preferredLocation = null;
        this.$outer.mouseEvent = null;
        this.$outer.hideTipWindow();
      }
    }
  }
}

/**
 * Outside timer action.
 */
export class ToolTipManager$outsideTimerAction extends JObject {
  /**
   * Constructs an {@code outsideTimerAction}.
   */
  _ToolTipManager$outsideTimerAction(): this {
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(e: ActionEvent): void {
    this.$outer.showImmediately = false;
  }
}

/**
 * Still inside timer action.
 */
export class ToolTipManager$stillInsideTimerAction extends JObject {
  /**
   * Constructs a {@code stillInsideTimerAction}.
   */
  _ToolTipManager$stillInsideTimerAction(): this {
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(e: ActionEvent): void {
    this.$outer.hideTipWindow();
    this.$outer.enterTimer.stop();
    this.$outer.showImmediately = false;
    this.$outer.insideComponent = null;
    this.$outer.mouseEvent = null;
  }
}

export class ToolTipManager$MoveBeforeEnterListener extends MouseMotionAdapter {
  _ToolTipManager$MoveBeforeEnterListener(): this {
    this._MouseMotionAdapter();
    return this;
  }
  mouseMoved(e: MouseEvent): void {
    this.$outer.initiateToolTip(e);
  }
}

export class ToolTipManager$AccessibilityKeyListener extends KeyAdapter {
  _ToolTipManager$AccessibilityKeyListener(): this {
    this._KeyAdapter();
    return this;
  }
  keyPressed(e: KeyEvent): void {
    if (!e.isConsumed()) {
      let source = e.getComponent();
      let keyStrokeForEvent = KeyStroke.getKeyStrokeForEvent(e);
      if (this.$outer.hideTip.equals(keyStrokeForEvent)) {
        if (this.$outer.tipWindow != null) {
          this.$outer.hide(source);
          e.consume();
        }
      } else if (this.$outer.postTip.equals(keyStrokeForEvent)) {
        this.$outer.show(source);
        e.consume();
      }
    }
  }
  menuKeyTyped(e: MenuKeyEvent): void {
  }
  menuKeyPressed(e: MenuKeyEvent): void {
    if (this.$outer.postTip.equals(KeyStroke.getKeyStrokeForEvent(e))) {
      let path = e.getPath();
      let element = path[(path.length - 1) | 0];
      let msm = e.getMenuSelectionManager();
      let selectedPath = msm.getSelectedPath();
      let selectedElement = selectedPath[(selectedPath.length - 1) | 0];
      if (element.equals(selectedElement)) {
        let source = element.getComponent$();
        this.$outer.show(source);
        e.consume();
      }
    }
  }
  menuKeyReleased(e: MenuKeyEvent): void {
  }
}

let $ToolTipManager$1: any = null;
/** An anonymous class (ToolTipManager.java:784). */
function ToolTipManager$1(): any {
  return $ToolTipManager$1 ??= $J.local(class extends FocusAdapter {
    focusLost(evt: FocusEvent): void {
      this.$outer.hideTipWindow();
      this.$outer.insideComponent = null;
      let c = evt.getSource();
      c.removeFocusListener(this.$outer.focusChangeListener);
    }
  }, 'javax.swing.ToolTipManager$1', []);
}

$J.define(ToolTipManager, 'javax.swing.ToolTipManager', { kind: 'class', ifaces: ['java.awt.event.MouseMotionListener'], sup: 'java.awt.event.MouseAdapter', ctors: { '': '_ToolTipManager' }, clinit: true, lazy: ['TOOL_TIP_MANAGER_KEY'] });
$J.define(ToolTipManager$insideTimerAction, 'javax.swing.ToolTipManager$insideTimerAction', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'java.lang.Object', ctors: { '': '_ToolTipManager$insideTimerAction' }, inner: true });
$J.define(ToolTipManager$outsideTimerAction, 'javax.swing.ToolTipManager$outsideTimerAction', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'java.lang.Object', ctors: { '': '_ToolTipManager$outsideTimerAction' }, inner: true });
$J.define(ToolTipManager$stillInsideTimerAction, 'javax.swing.ToolTipManager$stillInsideTimerAction', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'java.lang.Object', ctors: { '': '_ToolTipManager$stillInsideTimerAction' }, inner: true });
$J.define(ToolTipManager$MoveBeforeEnterListener, 'javax.swing.ToolTipManager$MoveBeforeEnterListener', { kind: 'class', sup: 'java.awt.event.MouseMotionAdapter', ctors: { '': '_ToolTipManager$MoveBeforeEnterListener' }, inner: true });
$J.define(ToolTipManager$AccessibilityKeyListener, 'javax.swing.ToolTipManager$AccessibilityKeyListener', { kind: 'class', ifaces: ['javax.swing.event.MenuKeyListener'], sup: 'java.awt.event.KeyAdapter', ctors: { '': '_ToolTipManager$AccessibilityKeyListener' }, inner: true });
$J.module(() => {
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  FocusAdapter = $J.load('java.awt.event.FocusAdapter');
  InputEvent = $J.load('java.awt.event.InputEvent');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  JApplet = $J.load('javax.swing.JApplet');
  JDialog = $J.load('javax.swing.JDialog');
  JFrame = $J.load('javax.swing.JFrame');
  JInternalFrame = $J.load('javax.swing.JInternalFrame');
  JMenuItem = $J.load('javax.swing.JMenuItem');
  JWindow = $J.load('javax.swing.JWindow');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  PopupFactory = $J.load('javax.swing.PopupFactory');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  Timer = $J.load('javax.swing.Timer');
  UIManager = $J.load('javax.swing.UIManager');
});
