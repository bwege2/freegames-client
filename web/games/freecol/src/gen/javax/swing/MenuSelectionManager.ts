// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/MenuSelectionManager.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, AppContext, JObject, StringBuilder, Thread, Vector } from '../../../jre/index.ts';

let InputEvent, MouseEvent, JComponent, JMenuBar, JMenuItem, JPopupMenu, SwingUtilities, ChangeEvent, ChangeListener, EventListenerList, AWTAccessor, SwingUtilities2;

/**
 * A MenuSelectionManager owns the selection in menu hierarchy.
 *
 * @author Arnaud Weber
 * @since 1.2
 */
export class MenuSelectionManager extends JObject {
  selection: Vector<MenuElement> = null;
  static readonly TRACE: boolean = false;
  static readonly VERBOSE: boolean = false;
  static readonly DEBUG: boolean = false;
  static MENU_SELECTION_MANAGER_KEY: StringBuilder = null;
  /**
   * Only one ChangeEvent is needed per button model instance since the
   * event's only state is the source property.  The source of events
   * generated is always "this".
   */
  changeEvent: ChangeEvent = null;
  /**
   * The collection of registered listeners
   */
  listenerList: EventListenerList = null;
  /**
   * Constructs a {@code MenuSelectionManager}.
   */
  _MenuSelectionManager(): this {
    this.selection = new Vector();
    this.changeEvent = null;
    this.listenerList = new EventListenerList()._EventListenerList();
    return this;
  }
  /**
   * Returns the default menu selection manager.
   *
   * @return a MenuSelectionManager object
   */
  static defaultManager(): MenuSelectionManager {
    var listener;
    {
      let context = AppContext.getAppContext();
      let msm = context.get(MenuSelectionManager.MENU_SELECTION_MANAGER_KEY);
      var listener;
      if (msm == null) {
        msm = new MenuSelectionManager()._MenuSelectionManager();
        context.put(MenuSelectionManager.MENU_SELECTION_MANAGER_KEY, msm);
        let o = context.get(SwingUtilities2.MENU_SELECTION_MANAGER_LISTENER_KEY);
        var listener;
        if ($J.isa((listener = o), ChangeListener)) {
          msm.addChangeListener(listener);
        }
      }
      return msm;
    }
  }
  /**
   * Changes the selection in the menu hierarchy.  The elements
   * in the array are sorted in order from the root menu
   * element to the currently selected menu element.
   * <p>
   * Note that this method is public but is used by the look and
   * feel engine and should not be called by client applications.
   *
   * @param path  an array of <code>MenuElement</code> objects specifying
   *        the selected path
   */
  setSelectedPath(path: MenuElement[]): void {
    let i: number;
    let c: number;
    let currentSelectionCount = this.selection.size();
    let firstDifference = 0;
    if (path == null) {
      path = $J.newArray(0, null);
    }
    if (MenuSelectionManager.DEBUG) {
      $J.out.print('Previous:  ');
      this.printMenuElementArray$MenuElementArr$MenuSelectionManager(this.getSelectedPath());
      $J.out.print('New:  ');
      this.printMenuElementArray$MenuElementArr$MenuSelectionManager(path);
    }
    for (i = 0, c = path.length; i < c; i++) {
      if (i < currentSelectionCount && this.selection.elementAt(i) === path[i]) {
        firstDifference++;
      } else {
        break;
      }
    }
    for (i = (currentSelectionCount - 1) | 0; i >= firstDifference; i--) {
      let me = this.selection.elementAt(i);
      this.selection.removeElementAt(i);
      me.menuSelectionChanged(false);
    }
    for (i = firstDifference, c = path.length; i < c; i++) {
      if (path[i] != null) {
        this.selection.addElement(path[i]);
        path[i].menuSelectionChanged(true);
      }
    }
    this.fireStateChanged();
  }
  /**
   * Returns the path to the currently selected menu item
   *
   * @return an array of MenuElement objects representing the selected path
   */
  getSelectedPath(): MenuElement[] {
    let res = $J.newArray(this.selection.size(), null);
    let i: number;
    let c: number;
    for (i = 0, c = this.selection.size(); i < c; i++) {
      res[i] = this.selection.elementAt(i);
    }
    return res;
  }
  /**
   * Tell the menu selection to close and unselect all the menu components. Call this method
   * when a choice has been made
   */
  clearSelectedPath(): void {
    if (this.selection.size() > 0) {
      this.setSelectedPath(null);
    }
  }
  /**
   * Adds a ChangeListener to the button.
   *
   * @param l the listener to add
   */
  addChangeListener(l: ChangeListener): void {
    this.listenerList.add($J.cls(ChangeListener), l);
  }
  /**
   * Removes a ChangeListener from the button.
   *
   * @param l the listener to remove
   */
  removeChangeListener(l: ChangeListener): void {
    this.listenerList.remove($J.cls(ChangeListener), l);
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is created lazily.
   *
   * @see EventListenerList
   */
  fireStateChanged(): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ChangeListener)) {
        if (this.changeEvent == null) {
          this.changeEvent = new ChangeEvent()._ChangeEvent(this);
        }
        $J.fn((listeners[(i + 1) | 0]), 'stateChanged')(this.changeEvent);
      }
    }
  }
  /**
   * When a MenuElement receives an event from a MouseListener, it should never process the event
   * directly. Instead all MenuElements should call this method with the event.
   *
   * @param event  a MouseEvent object
   */
  processMouseEvent(event: MouseEvent): void {
    let screenX: number;
    let screenY: number;
    let p: Point;
    let i: number;
    let c: number;
    let j: number;
    let d: number;
    let mc: Component;
    let r2: Rectangle;
    let cWidth: number;
    let cHeight: number;
    let menuElement: MenuElement;
    let subElements: MenuElement[];
    let path: MenuElement[];
    let selectionSize: number;
    p = event.getPoint();
    let source = event.getComponent();
    if ((source != null) && !source.isShowing()) {
      return;
    }
    let type$ = event.getID();
    let modifiers = event.getModifiers();
    if ((type$ === MouseEvent.MOUSE_ENTERED || type$ === MouseEvent.MOUSE_EXITED) && ((modifiers & (InputEvent.BUTTON1_MASK | InputEvent.BUTTON2_MASK | InputEvent.BUTTON3_MASK)) !== 0)) {
      return;
    }
    if (source != null) {
      SwingUtilities.convertPointToScreen(p, source);
    }
    screenX = p.x_;
    screenY = p.y_;
    let tmp = this.selection.clone();
    selectionSize = tmp.size();
    let success = false;
    for (i = (selectionSize - 1) | 0; i >= 0 && success === false; i--) {
      menuElement = tmp.elementAt(i);
      subElements = menuElement.getSubElements();
      path = null;
      for (j = 0, d = subElements.length; j < d && success === false; j++) {
        if (subElements[j] == null) {
          continue;
        }
        mc = subElements[j].getComponent$();
        if (!mc.isShowing()) {
          continue;
        }
        if (mc instanceof JComponent) {
          cWidth = mc.getWidth();
          cHeight = mc.getHeight();
        } else {
          r2 = mc.getBounds$();
          cWidth = r2.width_;
          cHeight = r2.height_;
        }
        p.x_ = screenX;
        p.y_ = screenY;
        SwingUtilities.convertPointFromScreen(p, mc);
        if (p.x_ >= 0 && p.x_ < cWidth && p.y_ >= 0 && p.y_ < cHeight) {
          let k: number;
          if (path == null) {
            path = $J.newArray((i + 2) | 0, null);
            for (k = 0; k <= i; k++) {
              path[k] = tmp.elementAt(k);
            }
          }
          (path[(i + 1) | 0]) = subElements[j];
          let currentSelection = this.getSelectedPath();
          if ((currentSelection[(currentSelection.length - 1) | 0]) !== (path[(i + 1) | 0]) && (currentSelection.length < 2 || (currentSelection[(currentSelection.length - 2) | 0]) !== (path[(i + 1) | 0]))) {
            let oldMC = (currentSelection[(currentSelection.length - 1) | 0]).getComponent$();
            let exitEvent = new MouseEvent()._MouseEvent$Component$int$long$int$int$int$int$int$int$boolean$int(oldMC, MouseEvent.MOUSE_EXITED, event.getWhen(), event.getModifiers(), p.x_, p.y_, event.getXOnScreen(), event.getYOnScreen(), event.getClickCount(), event.isPopupTrigger(), MouseEvent.NOBUTTON);
            let meAccessor = AWTAccessor.getMouseEventAccessor();
            meAccessor.setCausedByTouchEvent(exitEvent, meAccessor.isCausedByTouchEvent(event));
            (currentSelection[(currentSelection.length - 1) | 0]).processMouseEvent$MouseEvent$MenuElementArr$MenuSelectionManager(exitEvent, path, this);
            let enterEvent = new MouseEvent()._MouseEvent$Component$int$long$int$int$int$int$int$int$boolean$int(mc, MouseEvent.MOUSE_ENTERED, event.getWhen(), event.getModifiers(), p.x_, p.y_, event.getXOnScreen(), event.getYOnScreen(), event.getClickCount(), event.isPopupTrigger(), MouseEvent.NOBUTTON);
            meAccessor.setCausedByTouchEvent(enterEvent, meAccessor.isCausedByTouchEvent(event));
            subElements[j].processMouseEvent$MouseEvent$MenuElementArr$MenuSelectionManager(enterEvent, path, this);
          }
          let mouseEvent = new MouseEvent()._MouseEvent$Component$int$long$int$int$int$int$int$int$boolean$int(mc, event.getID(), event.getWhen(), event.getModifiers(), p.x_, p.y_, event.getXOnScreen(), event.getYOnScreen(), event.getClickCount(), event.isPopupTrigger(), MouseEvent.NOBUTTON);
          let meAccessor = AWTAccessor.getMouseEventAccessor();
          meAccessor.setCausedByTouchEvent(mouseEvent, meAccessor.isCausedByTouchEvent(event));
          subElements[j].processMouseEvent$MouseEvent$MenuElementArr$MenuSelectionManager(mouseEvent, path, this);
          success = true;
          event.consume();
        }
      }
    }
  }
  printMenuElementArray$MenuElementArr$MenuSelectionManager(path: MenuElement[]): void {
    this.printMenuElementArray$MenuElementArr$boolean$MenuSelectionManager(path, false);
  }
  printMenuElementArray$MenuElementArr$boolean$MenuSelectionManager(path: MenuElement[], dumpStack: boolean): void {
    $J.out.println('Path is(');
    let i: number;
    let j: number;
    for (i = 0, j = path.length; i < j; i++) {
      for (let k = 0; k <= i; k++) {
        $J.out.print('  ');
      }
      let me = path[i];
      if (me instanceof JMenuItem) {
        $J.out.println((me).getText() + ', ');
      } else if (me instanceof JMenuBar) {
        $J.out.println('JMenuBar, ');
      } else if (me instanceof JPopupMenu) {
        $J.out.println('JPopupMenu, ');
      } else if (me == null) {
        $J.out.println('NULL , ');
      } else {
        $J.out.println('' + $J.str(me) + ', ');
      }
    }
    $J.out.println(')');
    if (dumpStack === true) {
      Thread.dumpStack();
    }
  }
  /**
   * Returns the component in the currently selected path
   * which contains sourcePoint.
   *
   * @param source The component in whose coordinate space sourcePoint
   *        is given
   * @param sourcePoint The point which is being tested
   * @return The component in the currently selected path which
   *         contains sourcePoint (relative to the source component's
   *         coordinate space.  If sourcePoint is not inside a component
   *         on the currently selected path, null is returned.
   */
  componentForPoint(source: Component, sourcePoint: Point): Component {
    let screenX: number;
    let screenY: number;
    let p = sourcePoint;
    let i: number;
    let c: number;
    let j: number;
    let d: number;
    let mc: Component;
    let r2: Rectangle;
    let cWidth: number;
    let cHeight: number;
    let menuElement: MenuElement;
    let subElements: MenuElement[];
    let selectionSize: number;
    SwingUtilities.convertPointToScreen(p, source);
    screenX = p.x_;
    screenY = p.y_;
    let tmp = this.selection.clone();
    selectionSize = tmp.size();
    for (i = (selectionSize - 1) | 0; i >= 0; i--) {
      menuElement = tmp.elementAt(i);
      subElements = menuElement.getSubElements();
      for (j = 0, d = subElements.length; j < d; j++) {
        if (subElements[j] == null) {
          continue;
        }
        mc = subElements[j].getComponent$();
        if (!mc.isShowing()) {
          continue;
        }
        if (mc instanceof JComponent) {
          cWidth = mc.getWidth();
          cHeight = mc.getHeight();
        } else {
          r2 = mc.getBounds$();
          cWidth = r2.width_;
          cHeight = r2.height_;
        }
        p.x_ = screenX;
        p.y_ = screenY;
        SwingUtilities.convertPointFromScreen(p, mc);
        if (p.x_ >= 0 && p.x_ < cWidth && p.y_ >= 0 && p.y_ < cHeight) {
          return mc;
        }
      }
    }
    return null;
  }
  /**
   * When a MenuElement receives an event from a KeyListener, it should never process the event
   * directly. Instead all MenuElements should call this method with the event.
   *
   * @param e  a KeyEvent object
   */
  processKeyEvent(e: KeyEvent): void {
    let sel2 = $J.newArray(0, null);
    sel2 = $J.toArrayInto(this.selection.toArray(), sel2);
    let selSize = sel2.length;
    let path: MenuElement[];
    if (selSize < 1) {
      return;
    }
    for (let i = (selSize - 1) | 0; i >= 0; i--) {
      let elem = sel2[i];
      let subs = elem.getSubElements();
      path = null;
      for (let j = 0; j < subs.length; j++) {
        if (subs[j] == null || !subs[j].getComponent$().isShowing() || !subs[j].getComponent$().isEnabled()) {
          continue;
        }
        if (path == null) {
          path = $J.newArray((i + 2) | 0, null);
          $J.system_arraycopy(sel2, 0, path, 0, (i + 1) | 0);
        }
        (path[(i + 1) | 0]) = subs[j];
        subs[j].processKeyEvent$KeyEvent$MenuElementArr$MenuSelectionManager(e, path, this);
        if (e.isConsumed()) {
          return;
        }
      }
    }
    path = $J.newArray(1, null);
    path[0] = sel2[0];
    path[0].processKeyEvent$KeyEvent$MenuElementArr$MenuSelectionManager(e, path, this);
    if (e.isConsumed()) {
      return;
    }
  }
  static $clinit() {
    MenuSelectionManager.MENU_SELECTION_MANAGER_KEY = new StringBuilder('javax.swing.MenuSelectionManager');
  }
}

$J.define(MenuSelectionManager, 'javax.swing.MenuSelectionManager', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_MenuSelectionManager' }, meths: { 'isComponentPartOfCurrentMenu(javax.swing.MenuElement,java.awt.Component)': 'isComponentPartOfCurrentMenu$MenuElement$Component$MenuSelectionManager', 'isComponentPartOfCurrentMenu(java.awt.Component)': 'isComponentPartOfCurrentMenu$Component', 'printMenuElementArray(javax.swing.MenuElement[],boolean)': 'printMenuElementArray$MenuElementArr$boolean$MenuSelectionManager', 'printMenuElementArray(javax.swing.MenuElement[])': 'printMenuElementArray$MenuElementArr$MenuSelectionManager' }, clinit: true, lazy: ['MENU_SELECTION_MANAGER_KEY'] });
$J.module(() => {
  InputEvent = $J.load('java.awt.event.InputEvent');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  JComponent = $J.load('javax.swing.JComponent');
  JMenuBar = $J.load('javax.swing.JMenuBar');
  JMenuItem = $J.load('javax.swing.JMenuItem');
  JPopupMenu = $J.load('javax.swing.JPopupMenu');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  ChangeEvent = $J.load('javax.swing.event.ChangeEvent');
  ChangeListener = $J.load('javax.swing.event.ChangeListener');
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
