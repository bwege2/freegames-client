// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/AWTEventMulticaster.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1996, 2015, Oracle and/or its affiliates. All rights reserved.
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
import { $J, EventListener, JArray, JObject, NullPointerException } from '../../../jre/index.ts';

/**
 * {@code AWTEventMulticaster} implements efficient and thread-safe multi-cast
 * event dispatching for the AWT events defined in the {@code java.awt.event}
 * package.
 * <p>
 * The following example illustrates how to use this class:
 *
 * <pre><code>
 * public myComponent extends Component {
 *     ActionListener actionListener = null;
 *
 *     public synchronized void addActionListener(ActionListener l) {
 *         actionListener = AWTEventMulticaster.add(actionListener, l);
 *     }
 *     public synchronized void removeActionListener(ActionListener l) {
 *         actionListener = AWTEventMulticaster.remove(actionListener, l);
 *     }
 *     public void processEvent(AWTEvent e) {
 *         // when event occurs which causes "action" semantic
 *         ActionListener listener = actionListener;
 *         if (listener != null) {
 *             listener.actionPerformed(new ActionEvent());
 *         }
 *     }
 * }
 * </code></pre>
 * The important point to note is the first argument to the {@code
 * add} and {@code remove} methods is the field maintaining the
 * listeners. In addition you must assign the result of the {@code add}
 * and {@code remove} methods to the field maintaining the listeners.
 * <p>
 * {@code AWTEventMulticaster} is implemented as a pair of {@code
 * EventListeners} that are set at construction time. {@code
 * AWTEventMulticaster} is immutable. The {@code add} and {@code
 * remove} methods do not alter {@code AWTEventMulticaster} in
 * anyway. If necessary, a new {@code AWTEventMulticaster} is
 * created. In this way it is safe to add and remove listeners during
 * the process of an event dispatching.  However, event listeners
 * added during the process of an event dispatch operation are not
 * notified of the event currently being dispatched.
 * <p>
 * All of the {@code add} methods allow {@code null} arguments. If the
 * first argument is {@code null}, the second argument is returned. If
 * the first argument is not {@code null} and the second argument is
 * {@code null}, the first argument is returned. If both arguments are
 * {@code non-null}, a new {@code AWTEventMulticaster} is created using
 * the two arguments and returned.
 * <p>
 * For the {@code remove} methods that take two arguments, the following is
 * returned:
 * <ul>
 *   <li>{@code null}, if the first argument is {@code null}, or
 *       the arguments are equal, by way of {@code ==}.
 *   <li>the first argument, if the first argument is not an instance of
 *       {@code AWTEventMulticaster}.
 *   <li>result of invoking {@code remove(EventListener)} on the
 *       first argument, supplying the second argument to the
 *       {@code remove(EventListener)} method.
 * </ul>
 * <p>Swing makes use of
 * {@link javax.swing.event.EventListenerList EventListenerList} for
 * similar logic. Refer to it for details.
 *
 * @see javax.swing.event.EventListenerList
 *
 * @author      John Rose
 * @author      Amy Fowler
 * @since       1.1
 */
export class AWTEventMulticaster extends JObject {
  static readonly MAX_UNBALANCED_TOP_NODES: number = 100;
  /**
   * A variable in the event chain (listener-a)
   */
  a: EventListener = null;
  /**
   * A variable in the event chain (listener-b)
   */
  b: EventListener = null;
  /**
   * Creates an event multicaster instance which chains listener-a
   * with listener-b. Input parameters {@code a} and {@code b}
   * should not be {@code null}, though implementations may vary in
   * choosing whether or not to throw {@code NullPointerException}
   * in that case.
   * @param a listener-a
   * @param b listener-b
   */
  _AWTEventMulticaster(a: EventListener, b: EventListener): this {
    this.a = a;
    this.b = b;
    return this;
  }
  /**
   * Removes a listener from this multicaster.
   * <p>
   * The returned multicaster contains all the listeners in this
   * multicaster with the exception of all occurrences of {@code oldl}.
   * If the resulting multicaster contains only one regular listener
   * the regular listener may be returned.  If the resulting multicaster
   * is empty, then {@code null} may be returned instead.
   * <p>
   * No exception is thrown if {@code oldl} is {@code null}.
   *
   * @param oldl the listener to be removed
   * @return resulting listener
   */
  remove(oldl: EventListener): EventListener {
    if (oldl === this.a) {
      return this.b;
    }
    if (oldl === this.b) {
      return this.a;
    }
    let a2 = AWTEventMulticaster.removeInternal(this.a, oldl);
    let b2 = AWTEventMulticaster.removeInternal(this.b, oldl);
    if (a2 === this.a && b2 === this.b) {
      return this;
    }
    return AWTEventMulticaster.addInternal(a2, b2);
  }
  /**
   * Handles the componentResized event by invoking the
   * componentResized methods on listener-a and listener-b.
   * @param e the component event
   */
  componentResized(e: ComponentEvent): void {
    (this.a).componentResized(e);
    (this.b).componentResized(e);
  }
  /**
   * Handles the componentMoved event by invoking the
   * componentMoved methods on listener-a and listener-b.
   * @param e the component event
   */
  componentMoved(e: ComponentEvent): void {
    (this.a).componentMoved(e);
    (this.b).componentMoved(e);
  }
  /**
   * Handles the componentShown event by invoking the
   * componentShown methods on listener-a and listener-b.
   * @param e the component event
   */
  componentShown(e: ComponentEvent): void {
    (this.a).componentShown(e);
    (this.b).componentShown(e);
  }
  /**
   * Handles the componentHidden event by invoking the
   * componentHidden methods on listener-a and listener-b.
   * @param e the component event
   */
  componentHidden(e: ComponentEvent): void {
    (this.a).componentHidden(e);
    (this.b).componentHidden(e);
  }
  /**
   * Handles the componentAdded container event by invoking the
   * componentAdded methods on listener-a and listener-b.
   * @param e the component event
   */
  componentAdded(e: ContainerEvent): void {
    (this.a).componentAdded(e);
    (this.b).componentAdded(e);
  }
  /**
   * Handles the componentRemoved container event by invoking the
   * componentRemoved methods on listener-a and listener-b.
   * @param e the component event
   */
  componentRemoved(e: ContainerEvent): void {
    (this.a).componentRemoved(e);
    (this.b).componentRemoved(e);
  }
  /**
   * Handles the focusGained event by invoking the
   * focusGained methods on listener-a and listener-b.
   * @param e the focus event
   */
  focusGained(e: FocusEvent): void {
    (this.a).focusGained(e);
    (this.b).focusGained(e);
  }
  /**
   * Handles the focusLost event by invoking the
   * focusLost methods on listener-a and listener-b.
   * @param e the focus event
   */
  focusLost(e: FocusEvent): void {
    (this.a).focusLost(e);
    (this.b).focusLost(e);
  }
  /**
   * Handles the keyTyped event by invoking the
   * keyTyped methods on listener-a and listener-b.
   * @param e the key event
   */
  keyTyped(e: KeyEvent): void {
    (this.a).keyTyped(e);
    (this.b).keyTyped(e);
  }
  /**
   * Handles the keyPressed event by invoking the
   * keyPressed methods on listener-a and listener-b.
   * @param e the key event
   */
  keyPressed(e: KeyEvent): void {
    (this.a).keyPressed(e);
    (this.b).keyPressed(e);
  }
  /**
   * Handles the keyReleased event by invoking the
   * keyReleased methods on listener-a and listener-b.
   * @param e the key event
   */
  keyReleased(e: KeyEvent): void {
    (this.a).keyReleased(e);
    (this.b).keyReleased(e);
  }
  /**
   * Handles the mouseClicked event by invoking the
   * mouseClicked methods on listener-a and listener-b.
   * @param e the mouse event
   */
  mouseClicked(e: MouseEvent): void {
    (this.a).mouseClicked(e);
    (this.b).mouseClicked(e);
  }
  /**
   * Handles the mousePressed event by invoking the
   * mousePressed methods on listener-a and listener-b.
   * @param e the mouse event
   */
  mousePressed(e: MouseEvent): void {
    (this.a).mousePressed(e);
    (this.b).mousePressed(e);
  }
  /**
   * Handles the mouseReleased event by invoking the
   * mouseReleased methods on listener-a and listener-b.
   * @param e the mouse event
   */
  mouseReleased(e: MouseEvent): void {
    (this.a).mouseReleased(e);
    (this.b).mouseReleased(e);
  }
  /**
   * Handles the mouseEntered event by invoking the
   * mouseEntered methods on listener-a and listener-b.
   * @param e the mouse event
   */
  mouseEntered(e: MouseEvent): void {
    (this.a).mouseEntered(e);
    (this.b).mouseEntered(e);
  }
  /**
   * Handles the mouseExited event by invoking the
   * mouseExited methods on listener-a and listener-b.
   * @param e the mouse event
   */
  mouseExited(e: MouseEvent): void {
    (this.a).mouseExited(e);
    (this.b).mouseExited(e);
  }
  /**
   * Handles the mouseDragged event by invoking the
   * mouseDragged methods on listener-a and listener-b.
   * @param e the mouse event
   */
  mouseDragged(e: MouseEvent): void {
    (this.a).mouseDragged(e);
    (this.b).mouseDragged(e);
  }
  /**
   * Handles the mouseMoved event by invoking the
   * mouseMoved methods on listener-a and listener-b.
   * @param e the mouse event
   */
  mouseMoved(e: MouseEvent): void {
    (this.a).mouseMoved(e);
    (this.b).mouseMoved(e);
  }
  /**
   * Handles the windowOpened event by invoking the
   * windowOpened methods on listener-a and listener-b.
   * @param e the window event
   */
  windowOpened(e: WindowEvent): void {
    (this.a).windowOpened(e);
    (this.b).windowOpened(e);
  }
  /**
   * Handles the windowClosing event by invoking the
   * windowClosing methods on listener-a and listener-b.
   * @param e the window event
   */
  windowClosing(e: WindowEvent): void {
    (this.a).windowClosing(e);
    (this.b).windowClosing(e);
  }
  /**
   * Handles the windowClosed event by invoking the
   * windowClosed methods on listener-a and listener-b.
   * @param e the window event
   */
  windowClosed(e: WindowEvent): void {
    (this.a).windowClosed(e);
    (this.b).windowClosed(e);
  }
  /**
   * Handles the windowIconified event by invoking the
   * windowIconified methods on listener-a and listener-b.
   * @param e the window event
   */
  windowIconified(e: WindowEvent): void {
    (this.a).windowIconified(e);
    (this.b).windowIconified(e);
  }
  /**
   * Handles the windowDeiconified event by invoking the
   * windowDeiconified methods on listener-a and listener-b.
   * @param e the window event
   */
  windowDeiconified(e: WindowEvent): void {
    (this.a).windowDeiconified(e);
    (this.b).windowDeiconified(e);
  }
  /**
   * Handles the windowActivated event by invoking the
   * windowActivated methods on listener-a and listener-b.
   * @param e the window event
   */
  windowActivated(e: WindowEvent): void {
    (this.a).windowActivated(e);
    (this.b).windowActivated(e);
  }
  /**
   * Handles the windowDeactivated event by invoking the
   * windowDeactivated methods on listener-a and listener-b.
   * @param e the window event
   */
  windowDeactivated(e: WindowEvent): void {
    (this.a).windowDeactivated(e);
    (this.b).windowDeactivated(e);
  }
  /**
   * Handles the windowStateChanged event by invoking the
   * windowStateChanged methods on listener-a and listener-b.
   * @param e the window event
   * @since 1.4
   */
  windowStateChanged(e: WindowEvent): void {
    (this.a).windowStateChanged(e);
    (this.b).windowStateChanged(e);
  }
  /**
   * Handles the windowGainedFocus event by invoking the windowGainedFocus
   * methods on listener-a and listener-b.
   * @param e the window event
   * @since 1.4
   */
  windowGainedFocus(e: WindowEvent): void {
    (this.a).windowGainedFocus(e);
    (this.b).windowGainedFocus(e);
  }
  /**
   * Handles the windowLostFocus event by invoking the windowLostFocus
   * methods on listener-a and listener-b.
   * @param e the window event
   * @since 1.4
   */
  windowLostFocus(e: WindowEvent): void {
    (this.a).windowLostFocus(e);
    (this.b).windowLostFocus(e);
  }
  /**
   * Handles the actionPerformed event by invoking the
   * actionPerformed methods on listener-a and listener-b.
   * @param e the action event
   */
  actionPerformed(e: ActionEvent): void {
    $J.fn(($J.fn(this.a, 'actionPerformed')), 'actionPerformed')(e);
    $J.fn(($J.fn(this.b, 'actionPerformed')), 'actionPerformed')(e);
  }
  /**
   * Handles the itemStateChanged event by invoking the
   * itemStateChanged methods on listener-a and listener-b.
   * @param e the item event
   */
  itemStateChanged(e: ItemEvent): void {
    $J.fn(($J.fn(this.a, 'itemStateChanged')), 'itemStateChanged')(e);
    $J.fn(($J.fn(this.b, 'itemStateChanged')), 'itemStateChanged')(e);
  }
  /**
   * Handles the adjustmentValueChanged event by invoking the
   * adjustmentValueChanged methods on listener-a and listener-b.
   * @param e the adjustment event
   */
  adjustmentValueChanged(e: AdjustmentEvent): void {
    (this.a).adjustmentValueChanged(e);
    (this.b).adjustmentValueChanged(e);
  }
  /**
   * Handles the inputMethodTextChanged event by invoking the
   * inputMethodTextChanged methods on listener-a and listener-b.
   * @param e the item event
   */
  inputMethodTextChanged(e: InputMethodEvent): void {
    (this.a).inputMethodTextChanged(e);
    (this.b).inputMethodTextChanged(e);
  }
  /**
   * Handles the caretPositionChanged event by invoking the
   * caretPositionChanged methods on listener-a and listener-b.
   * @param e the item event
   */
  caretPositionChanged(e: InputMethodEvent): void {
    (this.a).caretPositionChanged(e);
    (this.b).caretPositionChanged(e);
  }
  /**
   * Handles the hierarchyChanged event by invoking the
   * hierarchyChanged methods on listener-a and listener-b.
   * @param e the item event
   * @since 1.3
   */
  hierarchyChanged(e: HierarchyEvent): void {
    $J.fn(($J.fn(this.a, 'hierarchyChanged')), 'hierarchyChanged')(e);
    $J.fn(($J.fn(this.b, 'hierarchyChanged')), 'hierarchyChanged')(e);
  }
  /**
   * Handles the ancestorMoved event by invoking the
   * ancestorMoved methods on listener-a and listener-b.
   * @param e the item event
   * @since 1.3
   */
  ancestorMoved(e: HierarchyEvent): void {
    (this.a).ancestorMoved(e);
    (this.b).ancestorMoved(e);
  }
  /**
   * Handles the ancestorResized event by invoking the
   * ancestorResized methods on listener-a and listener-b.
   * @param e the item event
   * @since 1.3
   */
  ancestorResized(e: HierarchyEvent): void {
    (this.a).ancestorResized(e);
    (this.b).ancestorResized(e);
  }
  /**
   * Handles the mouseWheelMoved event by invoking the
   * mouseWheelMoved methods on listener-a and listener-b.
   * @param e the mouse event
   * @since 1.4
   */
  mouseWheelMoved(e: MouseWheelEvent): void {
    (this.a).mouseWheelMoved(e);
    (this.b).mouseWheelMoved(e);
  }
  /**
   * Adds component-listener-a with component-listener-b and
   * returns the resulting multicast listener.
   * @param a component-listener-a
   * @param b component-listener-b
   * @return the resulting listener
   */
  static add$ComponentListener$ComponentListener(a: ComponentListener, b: ComponentListener): ComponentListener {
    return AWTEventMulticaster.addInternal(a, b);
  }
  /**
   * Adds container-listener-a with container-listener-b and
   * returns the resulting multicast listener.
   * @param a container-listener-a
   * @param b container-listener-b
   * @return the resulting listener
   */
  static add$ContainerListener$ContainerListener(a: ContainerListener, b: ContainerListener): ContainerListener {
    return AWTEventMulticaster.addInternal(a, b);
  }
  /**
   * Adds focus-listener-a with focus-listener-b and
   * returns the resulting multicast listener.
   * @param a focus-listener-a
   * @param b focus-listener-b
   * @return the resulting listener
   */
  static add$FocusListener$FocusListener(a: FocusListener, b: FocusListener): FocusListener {
    return AWTEventMulticaster.addInternal(a, b);
  }
  /**
   * Adds key-listener-a with key-listener-b and
   * returns the resulting multicast listener.
   * @param a key-listener-a
   * @param b key-listener-b
   * @return the resulting listener
   */
  static add$KeyListener$KeyListener(a: KeyListener, b: KeyListener): KeyListener {
    return AWTEventMulticaster.addInternal(a, b);
  }
  /**
   * Adds mouse-listener-a with mouse-listener-b and
   * returns the resulting multicast listener.
   * @param a mouse-listener-a
   * @param b mouse-listener-b
   * @return the resulting listener
   */
  static add$MouseListener$MouseListener(a: MouseListener, b: MouseListener): MouseListener {
    return AWTEventMulticaster.addInternal(a, b);
  }
  /**
   * Adds mouse-motion-listener-a with mouse-motion-listener-b and
   * returns the resulting multicast listener.
   * @param a mouse-motion-listener-a
   * @param b mouse-motion-listener-b
   * @return the resulting listener
   */
  static add$MouseMotionListener$MouseMotionListener(a: MouseMotionListener, b: MouseMotionListener): MouseMotionListener {
    return AWTEventMulticaster.addInternal(a, b);
  }
  /**
   * Adds window-listener-a with window-listener-b and
   * returns the resulting multicast listener.
   * @param a window-listener-a
   * @param b window-listener-b
   * @return the resulting listener
   */
  static add$WindowListener$WindowListener(a: WindowListener, b: WindowListener): WindowListener {
    return AWTEventMulticaster.addInternal(a, b);
  }
  /**
   * Adds window-focus-listener-a with window-focus-listener-b
   * and returns the resulting multicast listener.
   * @param a window-focus-listener-a
   * @param b window-focus-listener-b
   * @return the resulting listener
   * @since 1.4
   */
  static add$WindowFocusListener$WindowFocusListener(a: WindowFocusListener, b: WindowFocusListener): WindowFocusListener {
    return AWTEventMulticaster.addInternal(a, b);
  }
  /**
   * Adds hierarchy-listener-a with hierarchy-listener-b and
   * returns the resulting multicast listener.
   * @param a hierarchy-listener-a
   * @param b hierarchy-listener-b
   * @return the resulting listener
   * @since 1.3
   */
  static add$HierarchyListener$HierarchyListener(a: HierarchyListener, b: HierarchyListener): HierarchyListener {
    return $J.fn(AWTEventMulticaster.addInternal(a, b), 'hierarchyChanged');
  }
  /**
   * Adds mouse-wheel-listener-a with mouse-wheel-listener-b and
   * returns the resulting multicast listener.
   * @param a mouse-wheel-listener-a
   * @param b mouse-wheel-listener-b
   * @return the resulting listener
   * @since 1.4
   */
  static add$MouseWheelListener$MouseWheelListener(a: MouseWheelListener, b: MouseWheelListener): MouseWheelListener {
    return AWTEventMulticaster.addInternal(a, b);
  }
  /**
   * Removes the old component-listener from component-listener-l and
   * returns the resulting multicast listener.
   * @param l component-listener-l
   * @param oldl the component-listener being removed
   * @return the resulting listener
   */
  static remove$ComponentListener$ComponentListener(l: ComponentListener, oldl: ComponentListener): ComponentListener {
    return AWTEventMulticaster.removeInternal(l, oldl);
  }
  /**
   * Removes the old container-listener from container-listener-l and
   * returns the resulting multicast listener.
   * @param l container-listener-l
   * @param oldl the container-listener being removed
   * @return the resulting listener
   */
  static remove$ContainerListener$ContainerListener(l: ContainerListener, oldl: ContainerListener): ContainerListener {
    return AWTEventMulticaster.removeInternal(l, oldl);
  }
  /**
   * Removes the old focus-listener from focus-listener-l and
   * returns the resulting multicast listener.
   * @param l focus-listener-l
   * @param oldl the focus-listener being removed
   * @return the resulting listener
   */
  static remove$FocusListener$FocusListener(l: FocusListener, oldl: FocusListener): FocusListener {
    return AWTEventMulticaster.removeInternal(l, oldl);
  }
  /**
   * Removes the old key-listener from key-listener-l and
   * returns the resulting multicast listener.
   * @param l key-listener-l
   * @param oldl the key-listener being removed
   * @return the resulting listener
   */
  static remove$KeyListener$KeyListener(l: KeyListener, oldl: KeyListener): KeyListener {
    return AWTEventMulticaster.removeInternal(l, oldl);
  }
  /**
   * Removes the old mouse-listener from mouse-listener-l and
   * returns the resulting multicast listener.
   * @param l mouse-listener-l
   * @param oldl the mouse-listener being removed
   * @return the resulting listener
   */
  static remove$MouseListener$MouseListener(l: MouseListener, oldl: MouseListener): MouseListener {
    return AWTEventMulticaster.removeInternal(l, oldl);
  }
  /**
   * Removes the old mouse-motion-listener from mouse-motion-listener-l
   * and returns the resulting multicast listener.
   * @param l mouse-motion-listener-l
   * @param oldl the mouse-motion-listener being removed
   * @return the resulting listener
   */
  static remove$MouseMotionListener$MouseMotionListener(l: MouseMotionListener, oldl: MouseMotionListener): MouseMotionListener {
    return AWTEventMulticaster.removeInternal(l, oldl);
  }
  /**
   * Removes the old window-listener from window-listener-l and
   * returns the resulting multicast listener.
   * @param l window-listener-l
   * @param oldl the window-listener being removed
   * @return the resulting listener
   */
  static remove$WindowListener$WindowListener(l: WindowListener, oldl: WindowListener): WindowListener {
    return AWTEventMulticaster.removeInternal(l, oldl);
  }
  /**
   * Removes the old window-focus-listener from window-focus-listener-l
   * and returns the resulting multicast listener.
   * @param l window-focus-listener-l
   * @param oldl the window-focus-listener being removed
   * @return the resulting listener
   * @since 1.4
   */
  static remove$WindowFocusListener$WindowFocusListener(l: WindowFocusListener, oldl: WindowFocusListener): WindowFocusListener {
    return AWTEventMulticaster.removeInternal(l, oldl);
  }
  /**
   * Removes the old hierarchy-listener from hierarchy-listener-l and
   * returns the resulting multicast listener.
   * @param l hierarchy-listener-l
   * @param oldl the hierarchy-listener being removed
   * @return the resulting listener
   * @since 1.3
   */
  static remove$HierarchyListener$HierarchyListener(l: HierarchyListener, oldl: HierarchyListener): HierarchyListener {
    return $J.fn(AWTEventMulticaster.removeInternal(l, oldl), 'hierarchyChanged');
  }
  /**
   * Removes the old mouse-wheel-listener from mouse-wheel-listener-l
   * and returns the resulting multicast listener.
   * @param l mouse-wheel-listener-l
   * @param oldl the mouse-wheel-listener being removed
   * @return the resulting listener
   * @since 1.4
   */
  static remove$MouseWheelListener$MouseWheelListener(l: MouseWheelListener, oldl: MouseWheelListener): MouseWheelListener {
    return AWTEventMulticaster.removeInternal(l, oldl);
  }
  /**
   * Returns the resulting multicast listener from adding listener-a
   * and listener-b together.
   * If listener-a is null, it returns listener-b;
   * If listener-b is null, it returns listener-a
   * If neither are null, then it creates and returns
   * a new AWTEventMulticaster instance which chains a with b.
   *
   * @param a event listener-a
   * @param b event listener-b
   * @return the resulting listener
   */
  static addInternal(a: EventListener, b: EventListener): EventListener {
    if (a == null) {
      return b;
    }
    if (b == null) {
      return a;
    }
    let n = new AWTEventMulticaster()._AWTEventMulticaster(a, b);
    if (!AWTEventMulticaster.needsRebalance(n)) {
      return n;
    }
    let array = AWTEventMulticaster.getListeners(n, $J.cls(EventListener));
    return AWTEventMulticaster.rebalance(array, 0, (array.length - 1) | 0);
  }
  /**
   * Return true if the argument represents a binary tree that needs to be rebalanced.
   */
  static needsRebalance(l: AWTEventMulticaster): boolean {
    let level = 0;
    var aMulti, bMulti;
    while (true) {
      if (++level > AWTEventMulticaster.MAX_UNBALANCED_TOP_NODES) {
        return true;
      }
      var aMulti, bMulti;
      if ((aMulti = l.a) instanceof AWTEventMulticaster) {
        if (l.b instanceof AWTEventMulticaster) {
          return false;
        }
        l = aMulti;
      } else if ((bMulti = l.b) instanceof AWTEventMulticaster) {
        l = bMulti;
      } else {
        return false;
      }
    }
  }
  /**
   * Recursively create a balanced tree that includes a given range of EventListeners.
   *
   * @param array the array of the EventListeners to consult
   * @param index0 the lowest index (inclusive) that the return value must include
   * @param index1 the highest index (inclusive) that the return value must include.
   *
   * @return a balanced tree. If index0 equals index1 then this returns an EventListener from
   * the array provided. Otherwise this returns an AWTEventMulticaster.
   */
  static rebalance(array: EventListener[], index0: number, index1: number): EventListener {
    if (index0 === index1) {
      return array[index0];
    }
    if (index0 === ((index1 - 1) | 0)) {
      return new AWTEventMulticaster()._AWTEventMulticaster(array[index0], array[index1]);
    }
    let mid = $J.idiv(((index0 + index1) | 0), 2);
    return new AWTEventMulticaster()._AWTEventMulticaster(AWTEventMulticaster.rebalance(array, index0, mid), AWTEventMulticaster.rebalance(array, (mid + 1) | 0, index1));
  }
  /**
   * Returns the resulting multicast listener after removing the
   * old listener from listener-l.
   * If listener-l equals the old listener OR listener-l is null,
   * returns null.
   * Else if listener-l is an instance of AWTEventMulticaster,
   * then it removes the old listener from it.
   * Else, returns listener l.
   * @param l the listener being removed from
   * @param oldl the listener being removed
   * @return the resulting listener
   */
  static removeInternal(l: EventListener, oldl: EventListener): EventListener {
    if (l === oldl || l == null) {
      return null;
    } else if (l instanceof AWTEventMulticaster) {
      return (l).remove(oldl);
    } else {
      return l;
    }
  }
  static getListenerCount(l: EventListener, listenerType: JClass<any>): number {
    if (l instanceof AWTEventMulticaster) {
      let mc = l;
      return (AWTEventMulticaster.getListenerCount(mc.a, listenerType) + AWTEventMulticaster.getListenerCount(mc.b, listenerType)) | 0;
    } else {
      return listenerType.isInstance(l) ? 1 : 0;
    }
  }
  static populateListenerArray(a: EventListener[], l: EventListener, index: number): number {
    if (l instanceof AWTEventMulticaster) {
      let mc = l;
      let lhs = AWTEventMulticaster.populateListenerArray(a, mc.a, index);
      return AWTEventMulticaster.populateListenerArray(a, mc.b, lhs);
    } else if ($J.getClass(a).getComponentType().isInstance(l)) {
      a[index] = l;
      return (index + 1) | 0;
    } else {
      return index;
    }
  }
  /**
   * Returns an array of all the objects chained as
   * <code><em>Foo</em>Listener</code>s by the specified
   * {@code java.util.EventListener}.
   * <code><em>Foo</em>Listener</code>s are chained by the
   * {@code AWTEventMulticaster} using the
   * <code>add<em>Foo</em>Listener</code> method.
   * If a {@code null} listener is specified, this method returns an
   * empty array. If the specified listener is not an instance of
   * {@code AWTEventMulticaster}, this method returns an array which
   * contains only the specified listener. If no such listeners are chained,
   * this method returns an empty array.
   *
   * @param <T> the listener type
   * @param l the specified {@code java.util.EventListener}
   * @param listenerType the type of listeners requested; this parameter
   *          should specify an interface that descends from
   *          {@code java.util.EventListener}
   * @return an array of all objects chained as
   *          <code><em>Foo</em>Listener</code>s by the specified multicast
   *          listener, or an empty array if no such listeners have been
   *          chained by the specified multicast listener
   * @throws NullPointerException if the specified
   *             {@code listenertype} parameter is {@code null}
   * @throws ClassCastException if {@code listenerType}
   *          doesn't specify a class or interface that implements
   *          {@code java.util.EventListener}
   *
   * @since 1.4
   */
  static getListeners<T>(l: EventListener, listenerType: JClass<T>): T[] {
    if (listenerType == null) {
      throw new NullPointerException('Listener type should not be null');
    }
    let n = AWTEventMulticaster.getListenerCount(l, listenerType);
    let result = JArray.newInstance(listenerType, n);
    AWTEventMulticaster.populateListenerArray(result, l, 0);
    return result;
  }
}

$J.define(AWTEventMulticaster, 'java.awt.AWTEventMulticaster', { kind: 'class', ifaces: ['java.awt.event.ComponentListener', 'java.awt.event.ContainerListener', 'java.awt.event.FocusListener', 'java.awt.event.KeyListener', 'java.awt.event.MouseListener', 'java.awt.event.MouseMotionListener', 'java.awt.event.WindowListener', 'java.awt.event.WindowFocusListener', 'java.awt.event.WindowStateListener', 'java.awt.event.ActionListener', 'java.awt.event.ItemListener', 'java.awt.event.AdjustmentListener', 'java.awt.event.TextListener', 'java.awt.event.InputMethodListener', 'java.awt.event.HierarchyListener', 'java.awt.event.HierarchyBoundsListener', 'java.awt.event.MouseWheelListener'], sup: 'java.lang.Object', ctors: { 'java.util.EventListener,java.util.EventListener': '_AWTEventMulticaster' }, meths: { 'remove(java.awt.event.MouseWheelListener,java.awt.event.MouseWheelListener)': 'remove$MouseWheelListener$MouseWheelListener', 'remove(java.awt.event.HierarchyBoundsListener,java.awt.event.HierarchyBoundsListener)': 'remove$HierarchyBoundsListener$HierarchyBoundsListener', 'remove(java.awt.event.HierarchyListener,java.awt.event.HierarchyListener)': 'remove$HierarchyListener$HierarchyListener', 'remove(java.awt.event.InputMethodListener,java.awt.event.InputMethodListener)': 'remove$InputMethodListener$InputMethodListener', 'remove(java.awt.event.TextListener,java.awt.event.TextListener)': 'remove$TextListener$TextListener', 'remove(java.awt.event.AdjustmentListener,java.awt.event.AdjustmentListener)': 'remove$AdjustmentListener$AdjustmentListener', 'remove(java.awt.event.ItemListener,java.awt.event.ItemListener)': 'remove$ItemListener$ItemListener', 'remove(java.awt.event.ActionListener,java.awt.event.ActionListener)': 'remove$ActionListener$ActionListener', 'remove(java.awt.event.WindowFocusListener,java.awt.event.WindowFocusListener)': 'remove$WindowFocusListener$WindowFocusListener', 'remove(java.awt.event.WindowStateListener,java.awt.event.WindowStateListener)': 'remove$WindowStateListener$WindowStateListener', 'remove(java.awt.event.WindowListener,java.awt.event.WindowListener)': 'remove$WindowListener$WindowListener', 'remove(java.awt.event.MouseMotionListener,java.awt.event.MouseMotionListener)': 'remove$MouseMotionListener$MouseMotionListener', 'remove(java.awt.event.MouseListener,java.awt.event.MouseListener)': 'remove$MouseListener$MouseListener', 'remove(java.awt.event.KeyListener,java.awt.event.KeyListener)': 'remove$KeyListener$KeyListener', 'remove(java.awt.event.FocusListener,java.awt.event.FocusListener)': 'remove$FocusListener$FocusListener', 'remove(java.awt.event.ContainerListener,java.awt.event.ContainerListener)': 'remove$ContainerListener$ContainerListener', 'remove(java.awt.event.ComponentListener,java.awt.event.ComponentListener)': 'remove$ComponentListener$ComponentListener', 'add(java.awt.event.MouseWheelListener,java.awt.event.MouseWheelListener)': 'add$MouseWheelListener$MouseWheelListener', 'add(java.awt.event.HierarchyBoundsListener,java.awt.event.HierarchyBoundsListener)': 'add$HierarchyBoundsListener$HierarchyBoundsListener', 'add(java.awt.event.HierarchyListener,java.awt.event.HierarchyListener)': 'add$HierarchyListener$HierarchyListener', 'add(java.awt.event.InputMethodListener,java.awt.event.InputMethodListener)': 'add$InputMethodListener$InputMethodListener', 'add(java.awt.event.TextListener,java.awt.event.TextListener)': 'add$TextListener$TextListener', 'add(java.awt.event.AdjustmentListener,java.awt.event.AdjustmentListener)': 'add$AdjustmentListener$AdjustmentListener', 'add(java.awt.event.ItemListener,java.awt.event.ItemListener)': 'add$ItemListener$ItemListener', 'add(java.awt.event.ActionListener,java.awt.event.ActionListener)': 'add$ActionListener$ActionListener', 'add(java.awt.event.WindowFocusListener,java.awt.event.WindowFocusListener)': 'add$WindowFocusListener$WindowFocusListener', 'add(java.awt.event.WindowStateListener,java.awt.event.WindowStateListener)': 'add$WindowStateListener$WindowStateListener', 'add(java.awt.event.WindowListener,java.awt.event.WindowListener)': 'add$WindowListener$WindowListener', 'add(java.awt.event.MouseMotionListener,java.awt.event.MouseMotionListener)': 'add$MouseMotionListener$MouseMotionListener', 'add(java.awt.event.MouseListener,java.awt.event.MouseListener)': 'add$MouseListener$MouseListener', 'add(java.awt.event.KeyListener,java.awt.event.KeyListener)': 'add$KeyListener$KeyListener', 'add(java.awt.event.FocusListener,java.awt.event.FocusListener)': 'add$FocusListener$FocusListener', 'add(java.awt.event.ContainerListener,java.awt.event.ContainerListener)': 'add$ContainerListener$ContainerListener', 'add(java.awt.event.ComponentListener,java.awt.event.ComponentListener)': 'add$ComponentListener$ComponentListener' } });
