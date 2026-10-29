// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/DefaultCaret.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2026, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalArgumentException, IllegalStateException, Integer, JObject, SecurityException, StringBuilder, StringSelection } from '../../../../jre/index.ts';
import { Rectangle } from '../../../java/awt/Rectangle.ts';
import { NavigationFilter$FilterBypass } from './NavigationFilter.ts';

let Color, HeadlessException, Point, ActionEvent, FocusEvent$Cause, JPasswordField, JRootPane, SwingUtilities, Timer, UIManager, ChangeEvent, ChangeListener, EventListenerList, AbstractDocument, AbstractDocument$UndoRedoDocumentEvent, BadLocationException, DefaultEditorKit, DefaultEditorKit$SelectLineAction, DefaultEditorKit$SelectWordAction, DefaultHighlighter, Document, Position$Bias, Segment, StateInvariantError, SwingUtilities2;

/**
 * A default implementation of Caret.  The caret is rendered as
 * a vertical line in the color specified by the CaretColor property
 * of the associated JTextComponent.  It can blink at the rate specified
 * by the BlinkRate property.
 * <p>
 * This implementation expects two sources of asynchronous notification.
 * The timer thread fires asynchronously, and causes the caret to simply
 * repaint the most recent bounding box.  The caret also tracks change
 * as the document is modified.  Typically this will happen on the
 * event dispatch thread as a result of some mouse or keyboard event.
 * The caret behavior on both synchronous and asynchronous documents updates
 * is controlled by <code>UpdatePolicy</code> property. The repaint of the
 * new caret location will occur on the event thread in any case, as calls to
 * <code>modelToView</code> are only safe on the event thread.
 * <p>
 * The caret acts as a mouse and focus listener on the text component
 * it has been installed in, and defines the caret semantics based upon
 * those events.  The listener methods can be reimplemented to change the
 * semantics.
 * By default, the first mouse button will be used to set focus and caret
 * position.  Dragging the mouse pointer with the first mouse button will
 * sweep out a selection that is contiguous in the model.  If the associated
 * text component is editable, the caret will become visible when focus
 * is gained, and invisible when focus is lost.
 * <p>
 * The Highlighter bound to the associated text component is used to
 * render the selection by default.
 * Selection appearance can be customized by supplying a
 * painter to use for the highlights.  By default a painter is used that
 * will render a solid color as specified in the associated text component
 * in the <code>SelectionColor</code> property.  This can easily be changed
 * by reimplementing the
 * {@link #getSelectionPainter getSelectionPainter}
 * method.
 * <p>
 * A customized caret appearance can be achieved by reimplementing
 * the paint method.  If the paint method is changed, the damage method
 * should also be reimplemented to cause a repaint for the area needed
 * to render the caret.  The caret extends the Rectangle class which
 * is used to hold the bounding box for where the caret was last rendered.
 * This enables the caret to repaint in a thread-safe manner when the
 * caret moves without making a call to modelToView which is unstable
 * between model updates and view repair (i.e. the order of delivery
 * to DocumentListeners is not guaranteed).
 * <p>
 * The magic caret position is set to null when the caret position changes.
 * A timer is used to determine the new location (after the caret change).
 * When the timer fires, if the magic caret position is still null it is
 * reset to the current caret position. Any actions that change
 * the caret position and want the magic caret position to remain the
 * same, must remember the magic caret position, change the cursor, and
 * then set the magic caret position to its original value. This has the
 * benefit that only actions that want the magic caret position to persist
 * (such as open/down) need to know about it.
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
 * @author  Timothy Prinzing
 * @see     Caret
 */
export class DefaultCaret extends Rectangle {
  /**
   * Indicates that the caret position is to be updated only when
   * document changes are performed on the Event Dispatching Thread.
   * @see #setUpdatePolicy
   * @see #getUpdatePolicy
   * @since 1.5
   */
  static readonly UPDATE_WHEN_ON_EDT: number = 0;
  /**
   * Indicates that the caret should remain at the same
   * absolute position in the document regardless of any document
   * updates, except when the document length becomes less than
   * the current caret position due to removal. In that case the caret
   * position is adjusted to the end of the document.
   *
   * @see #setUpdatePolicy
   * @see #getUpdatePolicy
   * @since 1.5
   */
  static readonly NEVER_UPDATE: number = 1;
  /**
   * Indicates that the caret position is to be <b>always</b>
   * updated accordingly to the document changes regardless whether
   * the document updates are performed on the Event Dispatching Thread
   * or not.
   *
   * @see #setUpdatePolicy
   * @see #getUpdatePolicy
   * @since 1.5
   */
  static readonly ALWAYS_UPDATE: number = 2;
  savedBlinkRate: number = 0;
  isBlinkRateSaved: boolean = false;
  /**
   * The event listener list.
   */
  listenerList: EventListenerList = null;
  /**
   * The change event for the model.
   * Only one ChangeEvent is needed per model instance since the
   * event's only (read-only) state is the source property.  The source
   * of events generated here is always "this".
   */
  changeEvent: ChangeEvent = null;
  component: JTextComponent = null;
  updatePolicy: number = 0;
  visible: boolean = false;
  active: boolean = false;
  dot: number = 0;
  mark_: number = 0;
  selectionTag: any = null;
  selectionVisible: boolean = false;
  flasher: Timer = null;
  magicCaretPosition: Point = null;
  dotBias: Position$Bias = null;
  markBias: Position$Bias = null;
  dotLTR: boolean = false;
  markLTR: boolean = false;
  handler: DefaultCaret$Handler = null;
  flagXPoints: number[] = null;
  flagYPoints: number[] = null;
  filterBypass: NavigationFilter$FilterBypass = null;
  static selectWord: Action = null;
  static selectLine: Action = null;
  /**
   * This is used to indicate if the caret currently owns the selection.
   * This is always false if the system does not support the system
   * clipboard.
   */
  ownsSelection: boolean = false;
  /**
   * If this is true, the location of the dot is updated regardless of
   * the current location. This is set in the DocumentListener
   * such that even if the model location of dot hasn't changed (perhaps do
   * to a forward delete) the visual location is updated.
   */
  forceCaretPositionChange: boolean = false;
  /**
   * Whether or not mouseReleased should adjust the caret and focus.
   * This flag is set by mousePressed if it wanted to adjust the caret
   * and focus but couldn't because of a possible DnD operation.
   */
  shouldHandleRelease: boolean = false;
  /**
   * holds last MouseEvent which caused the word selection
   */
  selectedWordEvent: MouseEvent = null;
  /**
   * The width of the caret in pixels.
   */
  caretWidth: number = 0;
  aspectRatio: number = 0;
  /**
   * Constructs a default caret.
   */
  _DefaultCaret(): this {
    this._Rectangle$();
    this.savedBlinkRate = 0;
    this.isBlinkRateSaved = false;
    this.listenerList = new EventListenerList()._EventListenerList();
    this.changeEvent = null;
    this.updatePolicy = DefaultCaret.UPDATE_WHEN_ON_EDT;
    this.handler = new DefaultCaret$Handler().$o(this)._DefaultCaret$Handler();
    this.flagXPoints = $J.newArray(3, 0);
    this.flagYPoints = $J.newArray(3, 0);
    this.selectedWordEvent = null;
    this.caretWidth = -1;
    this.aspectRatio = -1;
    return this;
  }
  /**
   * Gets the caret movement policy on document updates.
   *
   * @return one of the following values : <code>UPDATE_WHEN_ON_EDT</code>,
   * <code>NEVER_UPDATE</code>, <code>ALWAYS_UPDATE</code>
   *
   * @see #setUpdatePolicy
   * @see #UPDATE_WHEN_ON_EDT
   * @see #NEVER_UPDATE
   * @see #ALWAYS_UPDATE
   *
   * @since 1.5
   */
  getUpdatePolicy(): number {
    return this.updatePolicy;
  }
  /**
   * Gets the text editor component that this caret is
   * is bound to.
   *
   * @return the component
   */
  getComponent(): JTextComponent {
    return this.component;
  }
  /**
   * Cause the caret to be painted.  The repaint
   * area is the bounding box of the caret (i.e.
   * the caret rectangle or <em>this</em>).
   * <p>
   * This method is thread safe, although most Swing methods
   * are not. Please see
   * <A HREF="https://docs.oracle.com/javase/tutorial/uiswing/concurrency/index.html">Concurrency
   * in Swing</A> for more information.
   */
  repaint(): void {
    if (this.component != null) {
      this.component.repaint$int$int$int$int(this.x_, this.y_, this.width_, this.height_);
    }
  }
  /**
   * Damages the area surrounding the caret to cause
   * it to be repainted in a new location.  If paint()
   * is reimplemented, this method should also be
   * reimplemented.  This method should update the
   * caret bounds (x, y, width, and height).
   *
   * @param r  the current location of the caret
   * @see #paint
   */
  damage(r: Rectangle): void {
    if (r != null) {
      let damageWidth = this.getCaretWidth(r.height_);
      this.x_ = (r.x_ - 4 - (damageWidth >> 1)) | 0;
      this.y_ = r.y_;
      this.width_ = (9 + damageWidth) | 0;
      this.height_ = r.height_;
      this.repaint();
    }
  }
  /**
   * Scrolls the associated view (if necessary) to make
   * the caret visible.  Since how this should be done
   * is somewhat of a policy, this method can be
   * reimplemented to change the behavior.  By default
   * the scrollRectToVisible method is called on the
   * associated component.
   *
   * @param nloc the new position to scroll to
   */
  adjustVisibility(nloc: Rectangle): void {
    if (this.component == null) {
      return;
    }
    if (SwingUtilities.isEventDispatchThread()) {
      this.component.scrollRectToVisible(nloc);
    } else {
      SwingUtilities.invokeLater($J.fn(new DefaultCaret$SafeScroller().$o(this)._DefaultCaret$SafeScroller(nloc), 'run'));
    }
  }
  /**
   * Gets the painter for the Highlighter.
   *
   * @return the painter
   */
  getSelectionPainter(): Highlighter$HighlightPainter {
    return DefaultHighlighter.DefaultPainter;
  }
  /**
   * Tries to set the position of the caret from
   * the coordinates of a mouse event, using viewToModel().
   *
   * @param e the mouse event
   */
  positionCaret(e: MouseEvent): void {
    let pt = new Point()._Point$int$int(e.getX(), e.getY());
    let biasRet = $J.newArray(1, null);
    let pos = this.component.getUI().viewToModel$JTextComponent$Point$BiasArr(this.component, pt, biasRet);
    if (biasRet[0] == null) {
      biasRet[0] = Position$Bias.Forward;
    }
    if (pos >= 0) {
      this.setDot$int$Bias(pos, biasRet[0]);
    }
  }
  /**
   * Tries to move the position of the caret from
   * the coordinates of a mouse event, using viewToModel().
   * This will cause a selection if the dot and mark
   * are different.
   *
   * @param e the mouse event
   */
  moveCaret(e: MouseEvent): void {
    let pt = new Point()._Point$int$int(e.getX(), e.getY());
    let biasRet = $J.newArray(1, null);
    let pos = this.component.getUI().viewToModel$JTextComponent$Point$BiasArr(this.component, pt, biasRet);
    if (biasRet[0] == null) {
      biasRet[0] = Position$Bias.Forward;
    }
    if (pos >= 0) {
      this.moveDot$int$Bias(pos, biasRet[0]);
    }
  }
  /**
   * Called when the component containing the caret gains
   * focus.  This is implemented to set the caret to visible
   * if the component is editable.
   *
   * @param e the focus event
   * @see FocusListener#focusGained
   */
  focusGained(e: FocusEvent): void {
    if (this.component.isEnabled()) {
      if (this.component.isEditable()) {
        if (this.isBlinkRateSaved) {
          this.setBlinkRate(this.savedBlinkRate);
          this.savedBlinkRate = 0;
          this.isBlinkRateSaved = false;
        }
      } else {
        if (this.getBlinkRate() !== 0) {
          if (!this.isBlinkRateSaved) {
            this.savedBlinkRate = this.getBlinkRate();
            this.isBlinkRateSaved = true;
          }
          this.setBlinkRate(0);
        }
      }
      this.setVisible(true);
      this.setSelectionVisible(true);
      this.updateSystemSelection();
    }
  }
  /**
   * Called when the component containing the caret loses
   * focus.  This is implemented to set the caret to visibility
   * to false.
   *
   * @param e the focus event
   * @see FocusListener#focusLost
   */
  focusLost(e: FocusEvent): void {
    this.setVisible(false);
    this.setSelectionVisible((e.getCause() === FocusEvent$Cause.ACTIVATION || e.getOppositeComponent() instanceof JRootPane) && (this.ownsSelection || e.isTemporary()));
  }
  /**
   * Selects word based on the MouseEvent
   */
  selectWord(e: MouseEvent): void {
    if (this.selectedWordEvent != null && this.selectedWordEvent.getX() === e.getX() && this.selectedWordEvent.getY() === e.getY()) {
      return;
    }
    let a = null;
    let map = this.getComponent().getActionMap$();
    if (map != null) {
      a = map.get(DefaultEditorKit.selectWordAction);
    }
    if (a == null) {
      if (DefaultCaret.selectWord == null) {
        DefaultCaret.selectWord = new DefaultEditorKit$SelectWordAction()._DefaultEditorKit$SelectWordAction();
      }
      a = DefaultCaret.selectWord;
    }
    a.actionPerformed(new ActionEvent()._ActionEvent$Object$int$String$long$int(this.getComponent(), ActionEvent.ACTION_PERFORMED, null, e.getWhen(), e.getModifiers()));
    this.selectedWordEvent = e;
  }
  /**
   * Called when the mouse is clicked.  If the click was generated
   * from button1, a double click selects a word,
   * and a triple click the current line.
   *
   * @param e the mouse event
   * @see MouseListener#mouseClicked
   */
  mouseClicked(e: MouseEvent): void {
    if (this.getComponent() == null) {
      return;
    }
    let nclicks = SwingUtilities2.getAdjustedClickCount(this.getComponent(), e);
    if (!e.isConsumed()) {
      if (SwingUtilities.isLeftMouseButton(e)) {
        if (nclicks === 1) {
          this.selectedWordEvent = null;
        } else if (nclicks === 2 && SwingUtilities2.canEventAccessSystemClipboard$AWTEvent(e)) {
          this.selectWord(e);
          this.selectedWordEvent = null;
        } else if (nclicks === 3 && SwingUtilities2.canEventAccessSystemClipboard$AWTEvent(e)) {
          let a = null;
          let map = this.getComponent().getActionMap$();
          if (map != null) {
            a = map.get(DefaultEditorKit.selectLineAction);
          }
          if (a == null) {
            if (DefaultCaret.selectLine == null) {
              DefaultCaret.selectLine = new DefaultEditorKit$SelectLineAction()._DefaultEditorKit$SelectLineAction();
            }
            a = DefaultCaret.selectLine;
          }
          a.actionPerformed(new ActionEvent()._ActionEvent$Object$int$String$long$int(this.getComponent(), ActionEvent.ACTION_PERFORMED, null, e.getWhen(), e.getModifiers()));
        }
      } else if (SwingUtilities.isMiddleMouseButton(e)) {
        if (nclicks === 1 && this.component.isEditable() && this.component.isEnabled() && SwingUtilities2.canEventAccessSystemClipboard$AWTEvent(e)) {
          let c = e.getSource();
          if (c != null) {
            try {
              let tk = c.getToolkit();
              let buffer = tk.getSystemSelection();
              if (buffer != null) {
                this.adjustCaret(e);
                let th = c.getTransferHandler();
                if (th != null) {
                  let trans = null;
                  try {
                    trans = buffer.getContents(null);
                  } catch ($e0) {
                    if ($J.isa($e0, IllegalStateException)) {
                      let ise = $J.exc($e0);
                      UIManager.getLookAndFeel().provideErrorFeedback(c);
                    } else {
                      throw $e0;
                    }
                  }
                  if (trans != null) {
                    th.importData$JComponent$Transferable(c, trans);
                  }
                }
                this.adjustFocus(true);
              }
            } catch ($e1) {
              if ($J.isa($e1, HeadlessException)) {
                let he = $J.exc($e1);
              } else {
                throw $e1;
              }
            }
          }
        }
      }
    }
  }
  /**
   * If button 1 is pressed, this is implemented to
   * request focus on the associated text component,
   * and to set the caret position. If the shift key is held down,
   * the caret will be moved, potentially resulting in a selection,
   * otherwise the
   * caret position will be set to the new location.  If the component
   * is not enabled, there will be no request for focus.
   *
   * @param e the mouse event
   * @see MouseListener#mousePressed
   */
  mousePressed(e: MouseEvent): void {
    let nclicks = SwingUtilities2.getAdjustedClickCount(this.getComponent(), e);
    if (SwingUtilities.isLeftMouseButton(e)) {
      if (e.isConsumed()) {
        this.shouldHandleRelease = true;
      } else {
        this.shouldHandleRelease = false;
        this.adjustCaretAndFocus(e);
        if (nclicks === 2 && SwingUtilities2.canEventAccessSystemClipboard$AWTEvent(e)) {
          this.selectWord(e);
        }
      }
    }
  }
  adjustCaretAndFocus(e: MouseEvent): void {
    this.adjustCaret(e);
    this.adjustFocus(false);
  }
  /**
   * Adjusts the caret location based on the MouseEvent.
   */
  adjustCaret(e: MouseEvent): void {
    if ((e.getModifiers() & ActionEvent.SHIFT_MASK) !== 0 && this.getDot() !== -1) {
      this.moveCaret(e);
    } else if (!e.isPopupTrigger()) {
      this.positionCaret(e);
    }
  }
  /**
   * Adjusts the focus, if necessary.
   *
   * @param inWindow if true indicates requestFocusInWindow should be used
   */
  adjustFocus(inWindow: boolean): void {
    if ((this.component != null) && this.component.isEnabled() && this.component.isRequestFocusEnabled()) {
      if (inWindow) {
        this.component.requestFocusInWindow$Cause(FocusEvent$Cause.MOUSE_EVENT);
      } else {
        this.component.requestFocus$Cause(FocusEvent$Cause.MOUSE_EVENT);
      }
    }
  }
  /**
   * Called when the mouse is released.
   *
   * @param e the mouse event
   * @see MouseListener#mouseReleased
   */
  mouseReleased(e: MouseEvent): void {
    if (!e.isConsumed() && this.shouldHandleRelease && SwingUtilities.isLeftMouseButton(e)) {
      this.adjustCaretAndFocus(e);
    }
  }
  /**
   * Called when the mouse enters a region.
   *
   * @param e the mouse event
   * @see MouseListener#mouseEntered
   */
  mouseEntered(e: MouseEvent): void {
  }
  /**
   * Called when the mouse exits a region.
   *
   * @param e the mouse event
   * @see MouseListener#mouseExited
   */
  mouseExited(e: MouseEvent): void {
  }
  /**
   * Moves the caret position
   * according to the mouse pointer's current
   * location.  This effectively extends the
   * selection.  By default, this is only done
   * for mouse button 1.
   *
   * @param e the mouse event
   * @see MouseMotionListener#mouseDragged
   */
  mouseDragged(e: MouseEvent): void {
    if ((!e.isConsumed()) && SwingUtilities.isLeftMouseButton(e)) {
      this.moveCaret(e);
    }
  }
  /**
   * Called when the mouse is moved.
   *
   * @param e the mouse event
   * @see MouseMotionListener#mouseMoved
   */
  mouseMoved(e: MouseEvent): void {
  }
  /**
   * Renders the caret as a vertical line.  If this is reimplemented
   * the damage method should also be reimplemented as it assumes the
   * shape of the caret is a vertical line.  Sets the caret color to
   * the value returned by getCaretColor().
   * <p>
   * If there are multiple text directions present in the associated
   * document, a flag indicating the caret bias will be rendered.
   * This will occur only if the associated document is a subclass
   * of AbstractDocument and there are multiple bidi levels present
   * in the bidi element structure (i.e. the text has multiple
   * directions associated with it).
   *
   * @param g the graphics context
   * @see #damage
   */
  paint(g: Graphics): void {
    if (this.isVisible()) {
      try {
        let mapper = this.component.getUI();
        let r = mapper.modelToView$JTextComponent$int$Bias(this.component, this.dot, this.dotBias);
        if ((r == null) || ((r.width_ === 0) && (r.height_ === 0))) {
          return;
        }
        if (this.width_ > 0 && this.height_ > 0 && !this._contains(r.x_, r.y_, r.width_, r.height_)) {
          let clip = g.getClipBounds$();
          if (clip != null && !clip.contains$Rectangle(this)) {
            this.repaint();
          }
          this.damage(r);
        }
        if (this.component.isEditable()) {
          g.setColor(this.component.getCaretColor());
        } else {
          let caretColor = this.component.getCaretColor();
          if (caretColor == null) {
            caretColor = g.getColor();
          }
          let bg = this.component.getBackground();
          if (bg == null) {
            g.setColor(caretColor);
          } else {
            let red = $J.idiv(((caretColor.getRed() + bg.getRed()) | 0), 2);
            let green = $J.idiv(((caretColor.getGreen() + bg.getGreen()) | 0), 2);
            let blue = $J.idiv(((caretColor.getBlue() + bg.getBlue()) | 0), 2);
            let alpha = 127;
            let newCaretColor = new Color()._Color$int$int$int$int(red, green, blue, alpha);
            g.setColor(newCaretColor);
          }
        }
        let paintWidth = this.getCaretWidth(r.height_);
        r.x_ = (r.x_ - (paintWidth >> 1)) | 0;
        g.fillRect(r.x_, r.y_, paintWidth, r.height_);
        let doc = this.component.getDocument();
        if (doc instanceof AbstractDocument) {
          let bidi = (doc).getBidiRootElement();
          if ((bidi != null) && (bidi.getElementCount() > 1)) {
            this.flagXPoints[0] = (r.x_ + ((this.dotLTR) ? paintWidth : 0)) | 0;
            this.flagYPoints[0] = r.y_;
            this.flagXPoints[1] = this.flagXPoints[0];
            this.flagYPoints[1] = (this.flagYPoints[0] + 4) | 0;
            this.flagXPoints[2] = (this.flagXPoints[0] + ((this.dotLTR) ? 4 : -4)) | 0;
            this.flagYPoints[2] = this.flagYPoints[0];
            g.fillPolygon$intArr$intArr$int(this.flagXPoints, this.flagYPoints, 3);
          }
        }
      } catch ($e2) {
        if ($J.isa($e2, BadLocationException)) {
          let e = $J.exc($e2);
        } else {
          throw $e2;
        }
      }
    }
  }
  /**
   * Called when the UI is being installed into the
   * interface of a JTextComponent.  This can be used
   * to gain access to the model that is being navigated
   * by the implementation of this interface.  Sets the dot
   * and mark to 0, and establishes document, property change,
   * focus, mouse, and mouse motion listeners.
   *
   * @param c the component
   * @see Caret#install
   */
  install(c: JTextComponent): void {
    this.component = c;
    let doc = c.getDocument();
    this.dot = this.mark_ = 0;
    this.dotLTR = this.markLTR = true;
    this.dotBias = this.markBias = Position$Bias.Forward;
    if (doc != null) {
      doc.addDocumentListener(this.handler);
    }
    c.addPropertyChangeListener$PropertyChangeListener($J.fn(this.handler, 'propertyChange'));
    c.addFocusListener(this);
    c.addMouseListener(this);
    c.addMouseMotionListener(this);
    if (this.component.hasFocus()) {
      this.focusGained(null);
    }
    let ratio = c.getClientProperty('caretAspectRatio');
    if (ratio != null) {
      this.aspectRatio = Math.fround(+ratio);
    } else {
      this.aspectRatio = -1;
    }
    let width = c.getClientProperty('caretWidth');
    if (width != null) {
      this.caretWidth = (+width);
    } else {
      this.caretWidth = -1;
    }
  }
  /**
   * Called when the UI is being removed from the
   * interface of a JTextComponent.  This is used to
   * unregister any listeners that were attached.
   *
   * @param c the component
   * @see Caret#deinstall
   */
  deinstall(c: JTextComponent): void {
    c.removeMouseListener(this);
    c.removeMouseMotionListener(this);
    c.removeFocusListener(this);
    c.removePropertyChangeListener$PropertyChangeListener($J.fn(this.handler, 'propertyChange'));
    let doc = c.getDocument();
    if (doc != null) {
      doc.removeDocumentListener(this.handler);
    }
    {
      this.component = null;
    }
    if (this.flasher != null) {
      this.flasher.stop();
    }
  }
  /**
   * Adds a listener to track whenever the caret position has
   * been changed.
   *
   * @param l the listener
   * @see Caret#addChangeListener
   */
  addChangeListener(l: ChangeListener): void {
    this.listenerList.add($J.cls(ChangeListener), l);
  }
  /**
   * Removes a listener that was tracking caret position changes.
   *
   * @param l the listener
   * @see Caret#removeChangeListener
   */
  removeChangeListener(l: ChangeListener): void {
    this.listenerList.remove($J.cls(ChangeListener), l);
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the parameters passed into
   * the fire method.  The listener list is processed last to first.
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
   * Changes the selection visibility.
   *
   * @param vis the new visibility
   */
  setSelectionVisible(vis: boolean): void {
    if (vis !== this.selectionVisible) {
      this.selectionVisible = vis;
      if (this.selectionVisible) {
        let h = this.component.getHighlighter();
        if ((this.dot !== this.mark_) && (h != null) && (this.selectionTag == null)) {
          let p0 = Math.min(this.dot, this.mark_);
          let p1 = Math.max(this.dot, this.mark_);
          let p = this.getSelectionPainter();
          try {
            this.selectionTag = h.addHighlight(p0, p1, p);
          } catch ($e3) {
            if ($J.isa($e3, BadLocationException)) {
              let bl = $J.exc($e3);
              this.selectionTag = null;
            } else {
              throw $e3;
            }
          }
        }
      } else {
        if (this.selectionTag != null) {
          let h = this.component.getHighlighter();
          h.removeHighlight(this.selectionTag);
          this.selectionTag = null;
        }
      }
    }
  }
  /**
   * Checks whether the current selection is visible.
   *
   * @return true if the selection is visible
   */
  isSelectionVisible(): boolean {
    return this.selectionVisible;
  }
  /**
   * Determines if the caret is currently active.
   * <p>
   * This method returns whether or not the <code>Caret</code>
   * is currently in a blinking state. It does not provide
   * information as to whether it is currently blinked on or off.
   * To determine if the caret is currently painted use the
   * <code>isVisible</code> method.
   *
   * @return <code>true</code> if active else <code>false</code>
   * @see #isVisible
   *
   * @since 1.5
   */
  isActive(): boolean {
    return this.active;
  }
  /**
   * Indicates whether or not the caret is currently visible. As the
   * caret flashes on and off the return value of this will change
   * between true, when the caret is painted, and false, when the
   * caret is not painted. <code>isActive</code> indicates whether
   * or not the caret is in a blinking state, such that it <b>can</b>
   * be visible, and <code>isVisible</code> indicates whether or not
   * the caret <b>is</b> actually visible.
   * <p>
   * Subclasses that wish to render a different flashing caret
   * should override paint and only paint the caret if this method
   * returns true.
   *
   * @return true if visible else false
   * @see Caret#isVisible
   * @see #isActive
   */
  isVisible(): boolean {
    return this.visible;
  }
  /**
   * Sets the caret visibility, and repaints the caret.
   * It is important to understand the relationship between this method,
   * <code>isVisible</code> and <code>isActive</code>.
   * Calling this method with a value of <code>true</code> activates the
   * caret blinking. Setting it to <code>false</code> turns it completely off.
   * To determine whether the blinking is active, you should call
   * <code>isActive</code>. In effect, <code>isActive</code> is an
   * appropriate corresponding "getter" method for this one.
   * <code>isVisible</code> can be used to fetch the current
   * visibility status of the caret, meaning whether or not it is currently
   * painted. This status will change as the caret blinks on and off.
   * <p>
   * Here's a list showing the potential return values of both
   * <code>isActive</code> and <code>isVisible</code>
   * after calling this method:
   * <p>
   * <b><code>setVisible(true)</code></b>:
   * <ul>
   *     <li>isActive(): true</li>
   *     <li>isVisible(): true or false depending on whether
   *         or not the caret is blinked on or off</li>
   * </ul>
   * <p>
   * <b><code>setVisible(false)</code></b>:
   * <ul>
   *     <li>isActive(): false</li>
   *     <li>isVisible(): false</li>
   * </ul>
   *
   * @param e the visibility specifier
   * @see #isActive
   * @see Caret#setVisible
   */
  setVisible(e: boolean): void {
    this.active = e;
    if (this.component != null) {
      let mapper = this.component.getUI();
      if (this.visible !== e) {
        this.visible = e;
        try {
          let loc = mapper.modelToView$JTextComponent$int$Bias(this.component, this.dot, this.dotBias);
          this.damage(loc);
        } catch ($e4) {
          if ($J.isa($e4, BadLocationException)) {
            let badloc = $J.exc($e4);
          } else {
            throw $e4;
          }
        }
      }
    }
    if (this.flasher != null) {
      if (this.visible) {
        this.flasher.start();
      } else {
        this.flasher.stop();
      }
    }
  }
  /**
   * Sets the caret blink rate.
   *
   * @param rate the rate in milliseconds, 0 to stop blinking
   * @see Caret#setBlinkRate
   */
  setBlinkRate(rate: number): void {
    if (rate < 0) {
      throw new IllegalArgumentException('Invalid blink rate: ' + rate);
    }
    if (rate !== 0) {
      if (this.component != null && this.component.isEditable()) {
        if (this.flasher == null) {
          this.flasher = new Timer()._Timer(rate, $J.fn(this.handler, 'actionPerformed'));
        }
        this.flasher.setDelay(rate);
      } else {
        this.savedBlinkRate = rate;
        this.isBlinkRateSaved = true;
      }
    } else {
      if (this.flasher != null) {
        this.flasher.stop();
        this.flasher.removeActionListener($J.fn(this.handler, 'actionPerformed'));
        this.flasher = null;
      }
      if ((this.component == null || this.component.isEditable()) && this.isBlinkRateSaved) {
        this.savedBlinkRate = 0;
        this.isBlinkRateSaved = false;
      }
    }
  }
  /**
   * Gets the caret blink rate.
   *
   * @return the delay in milliseconds.  If this is
   *  zero the caret will not blink.
   * @see Caret#getBlinkRate
   */
  getBlinkRate(): number {
    if (this.isBlinkRateSaved) {
      return this.savedBlinkRate;
    }
    return (this.flasher == null) ? 0 : this.flasher.getDelay();
  }
  /**
   * Fetches the current position of the caret.
   *
   * @return the position &gt;= 0
   * @see Caret#getDot
   */
  getDot(): number {
    return this.dot;
  }
  /**
   * Fetches the current position of the mark.  If there is a selection,
   * the dot and mark will not be the same.
   *
   * @return the position &gt;= 0
   * @see Caret#getMark
   */
  getMark(): number {
    return this.mark_;
  }
  /**
   * Sets the caret position and mark to the specified position,
   * with a forward bias. This implicitly sets the
   * selection range to zero.
   *
   * @param dot the position &gt;= 0
   * @see #setDot(int, Position.Bias)
   * @see Caret#setDot
   */
  setDot$int(dot: number): void {
    this.setDot$int$Bias(dot, Position$Bias.Forward);
  }
  /**
   * Moves the caret position to the specified position,
   * with a forward bias.
   *
   * @param dot the position &gt;= 0
   * @see #moveDot(int, javax.swing.text.Position.Bias)
   * @see Caret#moveDot
   */
  moveDot$int(dot: number): void {
    this.moveDot$int$Bias(dot, Position$Bias.Forward);
  }
  /**
   * Moves the caret position to the specified position, with the
   * specified bias.
   *
   * @param dot the position &gt;= 0
   * @param dotBias the bias for this position, not <code>null</code>
   * @throws IllegalArgumentException if the bias is <code>null</code>
   * @see Caret#moveDot
   * @since 1.6
   */
  moveDot$int$Bias(dot: number, dotBias: Position$Bias): void {
    if (dotBias == null) {
      throw new IllegalArgumentException('null bias');
    }
    if (!this.component.isEnabled()) {
      this.setDot$int$Bias(dot, dotBias);
      return;
    }
    if (dot !== this.dot) {
      let filter = this.component.getNavigationFilter();
      if (filter != null) {
        filter.moveDot(this.getFilterBypass(), dot, dotBias);
      } else {
        this.handleMoveDot(dot, dotBias);
      }
    }
  }
  handleMoveDot(dot: number, dotBias: Position$Bias): void {
    this.changeCaretPosition(dot, dotBias);
    if (this.selectionVisible) {
      let h = this.component.getHighlighter();
      if (h != null) {
        let p0 = Math.min(dot, this.mark_);
        let p1 = Math.max(dot, this.mark_);
        if (p0 === p1) {
          if (this.selectionTag != null) {
            h.removeHighlight(this.selectionTag);
            this.selectionTag = null;
          }
        } else {
          try {
            if (this.selectionTag != null) {
              h.changeHighlight(this.selectionTag, p0, p1);
            } else {
              let p = this.getSelectionPainter();
              this.selectionTag = h.addHighlight(p0, p1, p);
            }
          } catch ($e5) {
            if ($J.isa($e5, BadLocationException)) {
              let e = $J.exc($e5);
              throw new StateInvariantError()._StateInvariantError('Bad caret position');
            } else {
              throw $e5;
            }
          }
        }
      }
    }
  }
  /**
   * Sets the caret position and mark to the specified position, with the
   * specified bias. This implicitly sets the selection range
   * to zero.
   *
   * @param dot the position &gt;= 0
   * @param dotBias the bias for this position, not <code>null</code>
   * @throws IllegalArgumentException if the bias is <code>null</code>
   * @see Caret#setDot
   * @since 1.6
   */
  setDot$int$Bias(dot: number, dotBias: Position$Bias): void {
    if (dotBias == null) {
      throw new IllegalArgumentException('null bias');
    }
    let filter = this.component.getNavigationFilter();
    if (filter != null) {
      filter.setDot(this.getFilterBypass(), dot, dotBias);
    } else {
      this.handleSetDot(dot, dotBias);
    }
  }
  handleSetDot(dot: number, dotBias: Position$Bias): void {
    let doc = this.component.getDocument();
    if (doc != null) {
      dot = Math.min(dot, doc.getLength());
    }
    dot = Math.max(dot, 0);
    if (dot === 0) {
      dotBias = Position$Bias.Forward;
    }
    this.mark_ = dot;
    if (this.dot !== dot || this.dotBias !== dotBias || this.selectionTag != null || this.forceCaretPositionChange) {
      this.changeCaretPosition(dot, dotBias);
    }
    this.markBias = this.dotBias;
    this.markLTR = this.dotLTR;
    let h = this.component.getHighlighter();
    if ((h != null) && (this.selectionTag != null)) {
      h.removeHighlight(this.selectionTag);
      this.selectionTag = null;
    }
  }
  /**
   * Returns the bias of the caret position.
   *
   * @return the bias of the caret position
   * @since 1.6
   */
  getDotBias(): Position$Bias {
    return this.dotBias;
  }
  /**
   * Returns the bias of the mark.
   *
   * @return the bias of the mark
   * @since 1.6
   */
  getMarkBias(): Position$Bias {
    return this.markBias;
  }
  isPositionLTR(position: number, bias: Position$Bias): boolean {
    let doc = this.component.getDocument();
    if (bias === Position$Bias.Backward && --position < 0) {
      position = 0;
    }
    return AbstractDocument.isLeftToRight(doc, position, position);
  }
  guessBiasForOffset(offset: number, lastBias: Position$Bias, lastLTR: boolean): Position$Bias {
    if (lastLTR !== this.isPositionLTR(offset, lastBias)) {
      lastBias = Position$Bias.Backward;
    } else if (lastBias !== Position$Bias.Backward && lastLTR !== this.isPositionLTR(offset, Position$Bias.Backward)) {
      lastBias = Position$Bias.Backward;
    }
    if (lastBias === Position$Bias.Backward && offset > 0) {
      try {
        let s = new Segment()._Segment$();
        this.component.getDocument().getText$int$int$Segment((offset - 1) | 0, 1, s);
        if (s.count_ > 0 && s.array[s.offset] === 10 /* \u000a */) {
          lastBias = Position$Bias.Forward;
        }
      } catch ($e6) {
        if ($J.isa($e6, BadLocationException)) {
          let ble = $J.exc($e6);
        } else {
          throw $e6;
        }
      }
    }
    return lastBias;
  }
  /**
   * Sets the caret position (dot) to a new location.  This
   * causes the old and new location to be repainted.  It
   * also makes sure that the caret is within the visible
   * region of the view, if the view is scrollable.
   */
  changeCaretPosition(dot: number, dotBias: Position$Bias): void {
    this.repaint();
    if (this.flasher != null && this.flasher.isRunning()) {
      this.visible = true;
      this.flasher.restart();
    }
    this.dot = dot;
    this.dotBias = dotBias;
    this.dotLTR = this.isPositionLTR(dot, dotBias);
    this.fireStateChanged();
    this.updateSystemSelection();
    this.setMagicCaretPosition(null);
    let callRepaintNewCaret = () => {
      this.repaintNewCaret();
    };
    SwingUtilities.invokeLater(callRepaintNewCaret);
  }
  /**
   * Repaints the new caret position, with the
   * assumption that this is happening on the
   * event thread so that calling <code>modelToView</code>
   * is safe.
   */
  repaintNewCaret(): void {
    if (this.component != null) {
      let mapper = this.component.getUI();
      let doc = this.component.getDocument();
      if ((mapper != null) && (doc != null)) {
        let newLoc: Rectangle;
        try {
          newLoc = mapper.modelToView$JTextComponent$int$Bias(this.component, this.dot, this.dotBias);
        } catch ($e7) {
          if ($J.isa($e7, BadLocationException)) {
            let e = $J.exc($e7);
            newLoc = null;
          } else {
            throw $e7;
          }
        }
        if (newLoc != null) {
          this.adjustVisibility(newLoc);
          if (this.getMagicCaretPosition() == null) {
            this.setMagicCaretPosition(new Point()._Point$int$int(newLoc.x_, newLoc.y_));
          }
        }
        this.damage(newLoc);
      }
    }
  }
  updateSystemSelection(): void {
    if (!SwingUtilities2.canCurrentEventAccessSystemClipboard$()) {
      return;
    }
    if (this.dot !== this.mark_ && this.component != null && this.component.hasFocus()) {
      let clip = this.getSystemSelection();
      if (clip != null) {
        let selectedText: string;
        if (this.component instanceof JPasswordField && this.component.getClientProperty('JPasswordField.cutCopyAllowed') !== true) {
          let txt = null;
          let echoChar = (this.component).getEchoChar();
          let p0 = Math.min(this.getDot(), this.getMark());
          let p1 = Math.max(this.getDot(), this.getMark());
          for (let i = p0; i < p1; i++) {
            if (txt == null) {
              txt = new StringBuilder();
            }
            txt.append(String.fromCharCode(echoChar));
          }
          selectedText = (txt != null) ? txt.toString() : null;
        } else {
          selectedText = this.component.getSelectedText();
        }
        try {
          clip.setContents(new StringSelection(selectedText), this.getClipboardOwner());
          this.ownsSelection = true;
        } catch ($e8) {
          if ($J.isa($e8, IllegalStateException)) {
            let ise = $J.exc($e8);
          } else {
            throw $e8;
          }
        }
      }
    }
  }
  getSystemSelection(): Clipboard {
    try {
      return this.component.getToolkit().getSystemSelection();
    } catch ($e9) {
      if ($J.isa($e9, HeadlessException)) {
        let he = $J.exc($e9);
      } else if ($J.isa($e9, SecurityException)) {
        let se = $J.exc($e9);
      } else {
        throw $e9;
      }
    }
    return null;
  }
  getClipboardOwner(): ClipboardOwner {
    return this.handler;
  }
  /**
   * This is invoked after the document changes to verify the current
   * dot/mark is valid. We do this in case the <code>NavigationFilter</code>
   * changed where to position the dot, that resulted in the current location
   * being bogus.
   */
  ensureValidPosition(): void {
    let length = this.component.getDocument().getLength();
    if (this.dot > length || this.mark_ > length) {
      this.handleSetDot(length, Position$Bias.Forward);
    }
  }
  /**
   * Saves the current caret position.  This is used when
   * caret up/down actions occur, moving between lines
   * that have uneven end positions.
   *
   * @param p the position
   * @see #getMagicCaretPosition
   */
  setMagicCaretPosition(p: Point): void {
    this.magicCaretPosition = p;
  }
  /**
   * Gets the saved caret position.
   *
   * @return the position
   * see #setMagicCaretPosition
   */
  getMagicCaretPosition(): Point {
    return this.magicCaretPosition;
  }
  /**
   * Compares this object to the specified object.
   * The superclass behavior of comparing rectangles
   * is not desired, so this is changed to the Object
   * behavior.
   *
   * @param     obj   the object to compare this font with
   * @return    <code>true</code> if the objects are equal;
   *            <code>false</code> otherwise
   */
  equals(obj: any): boolean {
    return (this === obj);
  }
  toString(): string {
    let s = 'Dot=(' + this.dot + ', ' + $J.str(this.dotBias) + ')';
    s += ' Mark=(' + this.mark_ + ', ' + $J.str(this.markBias) + ')';
    return s;
  }
  getFilterBypass(): NavigationFilter$FilterBypass {
    if (this.filterBypass == null) {
      this.filterBypass = new DefaultCaret$DefaultFilterBypass().$o(this)._DefaultCaret$DefaultFilterBypass();
    }
    return this.filterBypass;
  }
  _contains(X: number, Y: number, W: number, H: number): boolean {
    let w = this.width_;
    let h = this.height_;
    if ((w | h | W | H) < 0) {
      return false;
    }
    let x = this.x_;
    let y = this.y_;
    if (X < x || Y < y) {
      return false;
    }
    if (W > 0) {
      w = (w + x) | 0;
      W = (W + X) | 0;
      if (W <= X) {
        if (w >= x || W > w) {
          return false;
        }
      } else {
        if (w >= x && W > w) {
          return false;
        }
      }
    } else if (((x + w) | 0) < X) {
      return false;
    }
    if (H > 0) {
      h = (h + y) | 0;
      H = (H + Y) | 0;
      if (H <= Y) {
        if (h >= y || H > h) {
          return false;
        }
      } else {
        if (h >= y && H > h) {
          return false;
        }
      }
    } else if (((y + h) | 0) < Y) {
      return false;
    }
    return true;
  }
  getCaretWidth(height: number): number {
    if (this.aspectRatio > Math.fround(-1)) {
      return ($J.d2i((Math.fround(this.aspectRatio * height))) + 1) | 0;
    }
    if (this.caretWidth > -1) {
      return this.caretWidth;
    } else {
      let property = UIManager.get$Object('Caret.width');
      if ($J.isa(property, Integer)) {
        return (+(property));
      } else {
        return 1;
      }
    }
  }
  static $clinit() {
    DefaultCaret.selectWord = null;
    DefaultCaret.selectLine = null;
  }
}

export class DefaultCaret$SafeScroller extends JObject {
  r: Rectangle = null;
  _DefaultCaret$SafeScroller(r: Rectangle): this {
    this.r = r;
    return this;
  }
  run(): void {
    if (this.$outer.component != null) {
      this.$outer.component.scrollRectToVisible(this.r);
    }
  }
}

export class DefaultCaret$Handler extends JObject {
  _DefaultCaret$Handler(): this {
    return this;
  }
  /**
   * Invoked when the blink timer fires.  This is called
   * asynchronously.  The simply changes the visibility
   * and repaints the rectangle that last bounded the caret.
   *
   * @param e the action event
   */
  actionPerformed(e: ActionEvent): void {
    if (this.$outer.width_ === 0 || this.$outer.height_ === 0) {
      if (this.$outer.component != null) {
        let mapper = this.$outer.component.getUI();
        try {
          let r = mapper.modelToView$JTextComponent$int$Bias(this.$outer.component, this.$outer.dot, this.$outer.dotBias);
          if (r != null && r.width_ !== 0 && r.height_ !== 0) {
            this.$outer.damage(r);
          }
        } catch ($e10) {
          if ($J.isa($e10, BadLocationException)) {
            let ble = $J.exc($e10);
          } else {
            throw $e10;
          }
        }
      }
    }
    this.$outer.visible = !this.$outer.visible;
    this.$outer.repaint();
  }
  /**
   * Updates the dot and mark if they were changed by
   * the insertion.
   *
   * @param e the document event
   * @see DocumentListener#insertUpdate
   */
  insertUpdate(e: DocumentEvent): void {
    if (this.$outer.getUpdatePolicy() === DefaultCaret.NEVER_UPDATE || (this.$outer.getUpdatePolicy() === DefaultCaret.UPDATE_WHEN_ON_EDT && !SwingUtilities.isEventDispatchThread())) {
      if ((e.getOffset() <= this.$outer.dot || e.getOffset() <= this.$outer.mark_) && this.$outer.selectionTag != null) {
        try {
          this.$outer.component.getHighlighter().changeHighlight(this.$outer.selectionTag, Math.min(this.$outer.dot, this.$outer.mark_), Math.max(this.$outer.dot, this.$outer.mark_));
        } catch ($e11) {
          if ($J.isa($e11, BadLocationException)) {
            let e1 = $J.exc($e11);
            e1.printStackTrace();
          } else {
            throw $e11;
          }
        }
      }
      return;
    }
    let offset = e.getOffset();
    let length = e.getLength();
    let newDot = this.$outer.dot;
    let changed = 0;
    if (e instanceof AbstractDocument$UndoRedoDocumentEvent) {
      this.$outer.setDot$int((offset + length) | 0);
      return;
    }
    if (newDot >= offset) {
      newDot = (newDot + length) | 0;
      changed = ((changed | 1) << 16) >> 16;
    }
    let newMark = this.$outer.mark_;
    if (newMark >= offset) {
      newMark = (newMark + length) | 0;
      changed = ((changed | 2) << 16) >> 16;
    }
    if (changed !== 0) {
      let dotBias = this.$outer.dotBias;
      if (this.$outer.dot === offset) {
        let doc = this.$outer.component.getDocument();
        let isNewline: boolean;
        try {
          let s = new Segment()._Segment$();
          doc.getText$int$int$Segment((newDot - 1) | 0, 1, s);
          isNewline = (s.count_ > 0 && s.array[s.offset] === 10 /* \u000a */);
        } catch ($e12) {
          if ($J.isa($e12, BadLocationException)) {
            let ble = $J.exc($e12);
            isNewline = false;
          } else {
            throw $e12;
          }
        }
        if (isNewline) {
          dotBias = Position$Bias.Forward;
        } else {
          dotBias = Position$Bias.Backward;
        }
      }
      if (newMark === newDot) {
        this.$outer.setDot$int$Bias(newDot, dotBias);
        this.$outer.ensureValidPosition();
      } else {
        this.$outer.setDot$int$Bias(newMark, this.$outer.markBias);
        if (this.$outer.getDot() === newMark) {
          this.$outer.moveDot$int$Bias(newDot, dotBias);
        }
        this.$outer.ensureValidPosition();
      }
    }
  }
  /**
   * Updates the dot and mark if they were changed
   * by the removal.
   *
   * @param e the document event
   * @see DocumentListener#removeUpdate
   */
  removeUpdate(e: DocumentEvent): void {
    if (this.$outer.getUpdatePolicy() === DefaultCaret.NEVER_UPDATE || (this.$outer.getUpdatePolicy() === DefaultCaret.UPDATE_WHEN_ON_EDT && !SwingUtilities.isEventDispatchThread())) {
      let length = this.$outer.component.getDocument().getLength();
      this.$outer.dot = Math.min(this.$outer.dot, length);
      this.$outer.mark_ = Math.min(this.$outer.mark_, length);
      if ((e.getOffset() < this.$outer.dot || e.getOffset() < this.$outer.mark_) && this.$outer.selectionTag != null) {
        try {
          this.$outer.component.getHighlighter().changeHighlight(this.$outer.selectionTag, Math.min(this.$outer.dot, this.$outer.mark_), Math.max(this.$outer.dot, this.$outer.mark_));
        } catch ($e13) {
          if ($J.isa($e13, BadLocationException)) {
            let e1 = $J.exc($e13);
            e1.printStackTrace();
          } else {
            throw $e13;
          }
        }
      }
      return;
    }
    let offs0 = e.getOffset();
    let offs1 = (offs0 + e.getLength()) | 0;
    let newDot = this.$outer.dot;
    let adjustDotBias = false;
    let newMark = this.$outer.mark_;
    let adjustMarkBias = false;
    if (e instanceof AbstractDocument$UndoRedoDocumentEvent) {
      this.$outer.setDot$int(offs0);
      return;
    }
    if (newDot >= offs1) {
      newDot = (newDot - (offs1 - offs0)) | 0;
      if (newDot === offs1) {
        adjustDotBias = true;
      }
    } else if (newDot >= offs0) {
      newDot = offs0;
      adjustDotBias = true;
    }
    if (newMark >= offs1) {
      newMark = (newMark - (offs1 - offs0)) | 0;
      if (newMark === offs1) {
        adjustMarkBias = true;
      }
    } else if (newMark >= offs0) {
      newMark = offs0;
      adjustMarkBias = true;
    }
    if (newMark === newDot) {
      this.$outer.forceCaretPositionChange = true;
      try {
        this.$outer.setDot$int$Bias(newDot, this.$outer.guessBiasForOffset(newDot, this.$outer.dotBias, this.$outer.dotLTR));
      } finally {
        this.$outer.forceCaretPositionChange = false;
      }
      this.$outer.ensureValidPosition();
    } else {
      let dotBias = this.$outer.dotBias;
      let markBias = this.$outer.markBias;
      if (adjustDotBias) {
        dotBias = this.$outer.guessBiasForOffset(newDot, dotBias, this.$outer.dotLTR);
      }
      if (adjustMarkBias) {
        markBias = this.$outer.guessBiasForOffset(this.$outer.mark_, markBias, this.$outer.markLTR);
      }
      this.$outer.setDot$int$Bias(newMark, markBias);
      if (this.$outer.getDot() === newMark) {
        this.$outer.moveDot$int$Bias(newDot, dotBias);
      }
      this.$outer.ensureValidPosition();
    }
  }
  /**
   * Gives notification that an attribute or set of attributes changed.
   *
   * @param e the document event
   * @see DocumentListener#changedUpdate
   */
  changedUpdate(e: DocumentEvent): void {
    if (this.$outer.getUpdatePolicy() === DefaultCaret.NEVER_UPDATE || (this.$outer.getUpdatePolicy() === DefaultCaret.UPDATE_WHEN_ON_EDT && !SwingUtilities.isEventDispatchThread())) {
      return;
    }
    if (e instanceof AbstractDocument$UndoRedoDocumentEvent) {
      this.$outer.setDot$int((e.getOffset() + e.getLength()) | 0);
    }
  }
  /**
   * This method gets called when a bound property is changed.
   * We are looking for document changes on the editor.
   */
  propertyChange(evt: PropertyChangeEvent): void {
    let oldValue = evt.getOldValue();
    let newValue = evt.getNewValue();
    if (($J.isa(oldValue, Document)) || ($J.isa(newValue, Document))) {
      this.$outer.setDot$int(0);
      if (oldValue != null) {
        (oldValue).removeDocumentListener(this);
      }
      if (newValue != null) {
        (newValue).addDocumentListener(this);
      }
    } else if ($J.equals('enabled', evt.getPropertyName())) {
      let enabled = evt.getNewValue();
      if (this.$outer.component.isFocusOwner()) {
        if (enabled === true) {
          if (this.$outer.component.isEditable()) {
            this.$outer.setVisible(true);
          }
          this.$outer.setSelectionVisible(true);
        } else {
          this.$outer.setVisible(false);
          this.$outer.setSelectionVisible(false);
        }
      }
    } else if ($J.equals('caretWidth', evt.getPropertyName())) {
      let newWidth = evt.getNewValue();
      if (newWidth != null) {
        this.$outer.caretWidth = (+newWidth);
      } else {
        this.$outer.caretWidth = -1;
      }
      this.$outer.repaint();
    } else if ($J.equals('caretAspectRatio', evt.getPropertyName())) {
      let newRatio = evt.getNewValue();
      if (newRatio != null) {
        this.$outer.aspectRatio = Math.fround(+newRatio);
      } else {
        this.$outer.aspectRatio = -1;
      }
      this.$outer.repaint();
    }
  }
  /**
   * Toggles the visibility of the selection when ownership is lost.
   */
  lostOwnership(clipboard: Clipboard, contents: Transferable): void {
    if (this.$outer.ownsSelection) {
      this.$outer.ownsSelection = false;
      if (this.$outer.component != null && !this.$outer.component.hasFocus()) {
        this.$outer.setSelectionVisible(false);
      }
    }
  }
}

export class DefaultCaret$DefaultFilterBypass extends NavigationFilter$FilterBypass {
  _DefaultCaret$DefaultFilterBypass(): this {
    this._NavigationFilter$FilterBypass();
    return this;
  }
  setDot(dot: number, bias: Position$Bias): void {
    this.$outer.handleSetDot(dot, bias);
  }
  moveDot(dot: number, bias: Position$Bias): void {
    this.$outer.handleMoveDot(dot, bias);
  }
}

$J.define(DefaultCaret, 'javax.swing.text.DefaultCaret', { kind: 'class', ifaces: ['javax.swing.text.Caret', 'java.awt.event.FocusListener', 'java.awt.event.MouseListener', 'java.awt.event.MouseMotionListener'], sup: 'java.awt.Rectangle', ctors: { '': '_DefaultCaret' }, meths: { 'setDot(int,javax.swing.text.Position$Bias)': 'setDot$int$Bias', 'moveDot(int,javax.swing.text.Position$Bias)': 'moveDot$int$Bias', 'moveDot(int)': 'moveDot$int', 'setDot(int)': 'setDot$int' }, clinit: true, lazy: ['selectWord', 'selectLine'] });
$J.define(DefaultCaret$SafeScroller, 'javax.swing.text.DefaultCaret$SafeScroller', { kind: 'class', ifaces: ['java.lang.Runnable'], sup: 'java.lang.Object', ctors: { 'java.awt.Rectangle': '_DefaultCaret$SafeScroller' }, inner: true });
$J.define(DefaultCaret$Handler, 'javax.swing.text.DefaultCaret$Handler', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener', 'javax.swing.event.DocumentListener', 'java.awt.event.ActionListener', 'java.awt.datatransfer.ClipboardOwner'], sup: 'java.lang.Object', ctors: { '': '_DefaultCaret$Handler' }, inner: true });
$J.define(DefaultCaret$DefaultFilterBypass, 'javax.swing.text.DefaultCaret$DefaultFilterBypass', { kind: 'class', sup: 'javax.swing.text.NavigationFilter$FilterBypass', ctors: { '': '_DefaultCaret$DefaultFilterBypass' }, inner: true });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  HeadlessException = $J.load('java.awt.HeadlessException');
  Point = $J.load('java.awt.Point');
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  FocusEvent$Cause = $J.load('java.awt.event.FocusEvent$Cause');
  JPasswordField = $J.load('javax.swing.JPasswordField');
  JRootPane = $J.load('javax.swing.JRootPane');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  Timer = $J.load('javax.swing.Timer');
  UIManager = $J.load('javax.swing.UIManager');
  ChangeEvent = $J.load('javax.swing.event.ChangeEvent');
  ChangeListener = $J.load('javax.swing.event.ChangeListener');
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
  AbstractDocument = $J.load('javax.swing.text.AbstractDocument');
  AbstractDocument$UndoRedoDocumentEvent = $J.load('javax.swing.text.AbstractDocument$UndoRedoDocumentEvent');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  DefaultEditorKit = $J.load('javax.swing.text.DefaultEditorKit');
  DefaultEditorKit$SelectLineAction = $J.load('javax.swing.text.DefaultEditorKit$SelectLineAction');
  DefaultEditorKit$SelectWordAction = $J.load('javax.swing.text.DefaultEditorKit$SelectWordAction');
  DefaultHighlighter = $J.load('javax.swing.text.DefaultHighlighter');
  Document = $J.load('javax.swing.text.Document');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  Segment = $J.load('javax.swing.text.Segment');
  StateInvariantError = $J.load('javax.swing.text.StateInvariantError');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
