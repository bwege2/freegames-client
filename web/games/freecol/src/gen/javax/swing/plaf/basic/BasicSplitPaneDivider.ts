// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicSplitPaneDivider.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { Container } from '../../../../java/awt/Container.ts';
import { MouseAdapter } from '../../../../java/awt/event/MouseAdapter.ts';

let Color, Cursor, Dimension, JButton, JSplitPane, UIManager, DefaultLookup;

/**
 * Divider used by BasicSplitPaneUI. Subclassers may wish to override
 * paint to do something more interesting.
 * The border effect is drawn in BasicSplitPaneUI, so if you don't like
 * that border, reset it there.
 * To conditionally drag from certain areas subclass mousePressed and
 * call super when you wish the dragging to begin.
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
 * @author Scott Violet
 */
export class BasicSplitPaneDivider extends Container {
  /**
   * Width or height of the divider based on orientation
   * {@code BasicSplitPaneUI} adds two to this.
   */
  static readonly ONE_TOUCH_SIZE: number = 6;
  /**
   * The offset of the divider.
   */
  static readonly ONE_TOUCH_OFFSET: number = 2;
  /**
   * Handles mouse dragging message to do the actual dragging.
   */
  dragger: BasicSplitPaneDivider$DragController = null;
  /**
   * UI this instance was created from.
   */
  splitPaneUI: BasicSplitPaneUI = null;
  /**
   * Size of the divider.
   */
  dividerSize: number = 0;
  /**
   * Divider that is used for noncontinuous layout mode.
   */
  hiddenDivider: Component = null;
  /**
   * JSplitPane the receiver is contained in.
   */
  splitPane: JSplitPane = null;
  /**
   * Handles mouse events from both this class, and the split pane.
   * Mouse events are handled for the splitpane since you want to be able
   * to drag when clicking on the border of the divider, which is not
   * drawn by the divider.
   */
  mouseHandler: BasicSplitPaneDivider$MouseHandler = null;
  /**
   * Orientation of the JSplitPane.
   */
  orientation: number = 0;
  /**
   * Button for quickly toggling the left component.
   */
  leftButton: JButton = null;
  /**
   * Button for quickly toggling the right component.
   */
  rightButton: JButton = null;
  /**
   * Border.
   */
  border: Border = null;
  /**
   * Is the mouse over the divider?
   */
  mouseOver: boolean = false;
  oneTouchSize: number = 0;
  oneTouchOffset: number = 0;
  /**
   * If true the one touch buttons are centered on the divider.
   */
  centerOneTouchButtons: boolean = false;
  /**
   * Creates an instance of {@code BasicSplitPaneDivider}. Registers this
   * instance for mouse events and mouse dragged events.
   *
   * @param ui an instance of {@code BasicSplitPaneUI}
   */
  _BasicSplitPaneDivider(ui: BasicSplitPaneUI): this {
    this._Container();
    this.dividerSize = 0;
    this.oneTouchSize = DefaultLookup.getInt$JComponent$ComponentUI$String$int(ui.getSplitPane(), ui, 'SplitPane.oneTouchButtonSize', BasicSplitPaneDivider.ONE_TOUCH_SIZE);
    this.oneTouchOffset = DefaultLookup.getInt$JComponent$ComponentUI$String$int(ui.getSplitPane(), ui, 'SplitPane.oneTouchButtonOffset', BasicSplitPaneDivider.ONE_TOUCH_OFFSET);
    this.centerOneTouchButtons = DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(ui.getSplitPane(), ui, 'SplitPane.centerOneTouchButtons', true);
    this.setLayout(new BasicSplitPaneDivider$DividerLayout().$o(this)._BasicSplitPaneDivider$DividerLayout());
    this.setBasicSplitPaneUI(ui);
    this.orientation = this.splitPane.getOrientation();
    this.setCursor$Cursor((this.orientation === JSplitPane.HORIZONTAL_SPLIT) ? Cursor.getPredefinedCursor(Cursor.E_RESIZE_CURSOR) : Cursor.getPredefinedCursor(Cursor.S_RESIZE_CURSOR));
    this.setBackground(UIManager.getColor$Object('SplitPane.background'));
    return this;
  }
  revalidateSplitPane(): void {
    this.invalidate();
    if (this.splitPane != null) {
      this.splitPane.revalidate();
    }
  }
  /**
   * Sets the {@code SplitPaneUI} that is using the receiver.
   *
   * @param newUI the new {@code SplitPaneUI}
   */
  setBasicSplitPaneUI(newUI: BasicSplitPaneUI): void {
    if (this.splitPane != null) {
      this.splitPane.removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
      if (this.mouseHandler != null) {
        this.splitPane.removeMouseListener(this.mouseHandler);
        this.splitPane.removeMouseMotionListener(this.mouseHandler);
        this.removeMouseListener(this.mouseHandler);
        this.removeMouseMotionListener(this.mouseHandler);
        this.mouseHandler = null;
      }
    }
    this.splitPaneUI = newUI;
    if (newUI != null) {
      this.splitPane = newUI.getSplitPane();
      if (this.splitPane != null) {
        if (this.mouseHandler == null) {
          this.mouseHandler = new BasicSplitPaneDivider$MouseHandler().$o(this)._BasicSplitPaneDivider$MouseHandler();
        }
        this.splitPane.addMouseListener(this.mouseHandler);
        this.splitPane.addMouseMotionListener(this.mouseHandler);
        this.addMouseListener(this.mouseHandler);
        this.addMouseMotionListener(this.mouseHandler);
        this.splitPane.addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
        if (this.splitPane.isOneTouchExpandable()) {
          this.oneTouchExpandableChanged();
        }
      }
    } else {
      this.splitPane = null;
    }
  }
  /**
   * Returns the {@code SplitPaneUI} the receiver is currently in.
   *
   * @return the {@code SplitPaneUI} the receiver is currently in
   */
  getBasicSplitPaneUI(): BasicSplitPaneUI {
    return this.splitPaneUI;
  }
  /**
   * Sets the size of the divider to {@code newSize}. That is
   * the width if the splitpane is {@code HORIZONTAL_SPLIT}, or
   * the height of {@code VERTICAL_SPLIT}.
   * Divider sizes {@code newSize < 0} are ignored.
   *
   * @param newSize a new size
   */
  setDividerSize(newSize: number): void {
    if (newSize < 0) {
      return;
    }
    this.dividerSize = newSize;
  }
  /**
   * Returns the size of the divider, that is the width if the splitpane
   * is HORIZONTAL_SPLIT, or the height of VERTICAL_SPLIT.
   *
   * @return the size of the divider
   */
  getDividerSize(): number {
    return this.dividerSize;
  }
  /**
   * Sets the border of this component.
   *
   * @param border a new border
   * @since 1.3
   */
  setBorder(border: Border): void {
    let oldBorder = this.border;
    this.border = border;
  }
  /**
   * Returns the border of this component or null if no border is
   * currently set.
   *
   * @return the border object for this component
   * @see #setBorder
   * @since 1.3
   */
  getBorder(): Border {
    return this.border;
  }
  /**
   * If a border has been set on this component, returns the
   * border's insets, else calls super.getInsets.
   *
   * @return the value of the insets property.
   * @see #setBorder
   */
  getInsets$(): Insets {
    let border = this.getBorder();
    if (border != null) {
      return border.getBorderInsets$Component(this);
    }
    return super.getInsets$();
  }
  /**
   * Sets whether or not the mouse is currently over the divider.
   *
   * @param mouseOver whether or not the mouse is currently over the divider
   * @since 1.5
   */
  setMouseOver(mouseOver: boolean): void {
    this.mouseOver = mouseOver;
  }
  /**
   * Returns the preferred size of the divider.
   * @implNote In current implementation,
   * if the splitpane is HORIZONTAL_SPLIT, the preferred size is obtained from
   * width of {@code getDividerSize} pixels and height of 1 pixel
   * If the splitpane is VERTICAL_SPLIT, the preferred size is obtained from
   * height of {@code getDividerSize} pixels and width of 1 pixel
   *
   * @return a {@code Dimension} object containing the preferred size of
   *         {@code BasicSplitPaneDivider}
   */
  getPreferredSize$(): Dimension {
    if (this.orientation === JSplitPane.HORIZONTAL_SPLIT) {
      return new Dimension()._Dimension$int$int(this.getDividerSize(), 1);
    }
    return new Dimension()._Dimension$int$int(1, this.getDividerSize());
  }
  /**
   * Returns the minimum size of the divider.
   * @implNote In current implementation,
   * if the splitpane is HORIZONTAL_SPLIT, the minimum size is obtained from
   * width of {@code getDividerSize} pixels and height of 1 pixel
   * If the splitpane is VERTICAL_SPLIT, the minimum size is obtained from
   * height of {@code getDividerSize} pixels and width of 1 pixel
   *
   * @return a {@code Dimension} object containing the minimum size of
   *         {@code BasicSplitPaneDivider}
   */
  getMinimumSize$(): Dimension {
    return this.getPreferredSize$();
  }
  /**
   * Property change event, presumably from the JSplitPane, will message
   * updateOrientation if necessary.
   */
  propertyChange(e: PropertyChangeEvent): void {
    if (e.getSource() === this.splitPane) {
      if (e.getPropertyName() === JSplitPane.ORIENTATION_PROPERTY) {
        this.orientation = this.splitPane.getOrientation();
        this.setCursor$Cursor((this.orientation === JSplitPane.HORIZONTAL_SPLIT) ? Cursor.getPredefinedCursor(Cursor.E_RESIZE_CURSOR) : Cursor.getPredefinedCursor(Cursor.S_RESIZE_CURSOR));
        this.revalidateSplitPane();
      } else if (e.getPropertyName() === JSplitPane.ONE_TOUCH_EXPANDABLE_PROPERTY) {
        this.oneTouchExpandableChanged();
      }
    }
  }
  /**
   * Paints the divider.
   */
  paint(g: Graphics): void {
    super.paint(g);
    let border = this.getBorder();
    if (border != null) {
      let size = this.getSize$();
      border.paintBorder(this, g, 0, 0, size.width_, size.height_);
    }
  }
  /**
   * Messaged when the oneTouchExpandable value of the JSplitPane the
   * divider is contained in changes. Will create the
   * <code>leftButton</code> and <code>rightButton</code> if they are null
   * and corresponding JSplitPane supports oneTouchExpandable property.
   * Invalidates the corresponding JSplitPane as well.
   */
  oneTouchExpandableChanged(): void {
    if (!DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(this.splitPane, this.splitPaneUI, 'SplitPane.supportsOneTouchButtons', true)) {
      return;
    }
    if (this.splitPane.isOneTouchExpandable() && this.leftButton == null && this.rightButton == null) {
      this.leftButton = this.createLeftOneTouchButton();
      if (this.leftButton != null) {
        this.leftButton.addActionListener($J.fn(new BasicSplitPaneDivider$OneTouchActionHandler().$o(this)._BasicSplitPaneDivider$OneTouchActionHandler(true), 'actionPerformed'));
      }
      this.rightButton = this.createRightOneTouchButton();
      if (this.rightButton != null) {
        this.rightButton.addActionListener($J.fn(new BasicSplitPaneDivider$OneTouchActionHandler().$o(this)._BasicSplitPaneDivider$OneTouchActionHandler(false), 'actionPerformed'));
      }
      if (this.leftButton != null && this.rightButton != null) {
        this.add$Component(this.leftButton);
        this.add$Component(this.rightButton);
      }
    }
    this.revalidateSplitPane();
  }
  /**
   * Creates and return an instance of {@code JButton} that can be used to
   * collapse the left component in the split pane.
   *
   * @return an instance of {@code JButton}
   */
  createLeftOneTouchButton(): JButton {
    let b = new (BasicSplitPaneDivider$1())().$o(this)._JButton$();
    b.setMinimumSize(new Dimension()._Dimension$int$int(this.oneTouchSize, this.oneTouchSize));
    b.setCursor$Cursor(Cursor.getPredefinedCursor(Cursor.DEFAULT_CURSOR));
    b.setFocusPainted(false);
    b.setBorderPainted(false);
    b.setRequestFocusEnabled(false);
    return b;
  }
  /**
   * Creates and return an instance of {@code JButton} that can be used to
   * collapse the right component in the split pane.
   *
   * @return an instance of {@code JButton}
   */
  createRightOneTouchButton(): JButton {
    let b = new (BasicSplitPaneDivider$2())().$o(this)._JButton$();
    b.setMinimumSize(new Dimension()._Dimension$int$int(this.oneTouchSize, this.oneTouchSize));
    b.setCursor$Cursor(Cursor.getPredefinedCursor(Cursor.DEFAULT_CURSOR));
    b.setFocusPainted(false);
    b.setBorderPainted(false);
    b.setRequestFocusEnabled(false);
    return b;
  }
  /**
   * Message to prepare for dragging. This messages the BasicSplitPaneUI
   * with startDragging.
   */
  prepareForDragging(): void {
    this.splitPaneUI.startDragging();
  }
  /**
   * Messages the BasicSplitPaneUI with dragDividerTo that this instance
   * is contained in.
   *
   * @param location a location
   */
  dragDividerTo(location: number): void {
    this.splitPaneUI.dragDividerTo(location);
  }
  /**
   * Messages the BasicSplitPaneUI with finishDraggingTo that this instance
   * is contained in.
   *
   * @param location a location
   */
  finishDraggingTo(location: number): void {
    this.splitPaneUI.finishDraggingTo(location);
  }
}

/**
 * MouseHandler is responsible for converting mouse events
 * (released, dragged...) into the appropriate DragController
 * methods.
 */
export class BasicSplitPaneDivider$MouseHandler extends MouseAdapter {
  /**
   * Constructs a {@code MouseHandler}.
   */
  _BasicSplitPaneDivider$MouseHandler(): this {
    this._MouseAdapter();
    return this;
  }
  /**
   * Starts the dragging session by creating the appropriate instance
   * of DragController.
   */
  mousePressed(e: MouseEvent): void {
    if ((e.getSource() === this.$outer || e.getSource() === this.$outer.splitPane) && this.$outer.dragger == null && this.$outer.splitPane.isEnabled()) {
      let newHiddenDivider = this.$outer.splitPaneUI.getNonContinuousLayoutDivider();
      if (this.$outer.hiddenDivider !== newHiddenDivider) {
        if (this.$outer.hiddenDivider != null) {
          this.$outer.hiddenDivider.removeMouseListener(this);
          this.$outer.hiddenDivider.removeMouseMotionListener(this);
        }
        this.$outer.hiddenDivider = newHiddenDivider;
        if (this.$outer.hiddenDivider != null) {
          this.$outer.hiddenDivider.addMouseMotionListener(this);
          this.$outer.hiddenDivider.addMouseListener(this);
        }
      }
      if (this.$outer.splitPane.getLeftComponent() != null && this.$outer.splitPane.getRightComponent() != null) {
        if (this.$outer.orientation === JSplitPane.HORIZONTAL_SPLIT) {
          this.$outer.dragger = new BasicSplitPaneDivider$DragController().$o(this.$outer)._BasicSplitPaneDivider$DragController(e);
        } else {
          this.$outer.dragger = new BasicSplitPaneDivider$VerticalDragController().$o(this.$outer)._BasicSplitPaneDivider$VerticalDragController(e);
        }
        if (!this.$outer.dragger.isValid()) {
          this.$outer.dragger = null;
        } else {
          this.$outer.prepareForDragging();
          this.$outer.dragger.continueDrag$MouseEvent(e);
        }
      }
      e.consume();
    }
  }
  /**
   * If dragger is not null it is messaged with completeDrag.
   */
  mouseReleased(e: MouseEvent): void {
    if (this.$outer.dragger != null) {
      if (e.getSource() === this.$outer.splitPane) {
        this.$outer.dragger.completeDrag$int$int(e.getX(), e.getY());
      } else if (e.getSource() === this.$outer) {
        let ourLoc = this.$outer.getLocation$();
        this.$outer.dragger.completeDrag$int$int((e.getX() + ourLoc.x_) | 0, (e.getY() + ourLoc.y_) | 0);
      } else if (e.getSource() === this.$outer.hiddenDivider) {
        let hDividerLoc = this.$outer.hiddenDivider.getLocation$();
        let ourX = (e.getX() + hDividerLoc.x_) | 0;
        let ourY = (e.getY() + hDividerLoc.y_) | 0;
        this.$outer.dragger.completeDrag$int$int(ourX, ourY);
      }
      this.$outer.dragger = null;
      e.consume();
    }
  }
  /**
   * If dragger is not null it is messaged with continueDrag.
   */
  mouseDragged(e: MouseEvent): void {
    if (this.$outer.dragger != null) {
      if (e.getSource() === this.$outer.splitPane) {
        this.$outer.dragger.continueDrag$int$int(e.getX(), e.getY());
      } else if (e.getSource() === this.$outer) {
        let ourLoc = this.$outer.getLocation$();
        this.$outer.dragger.continueDrag$int$int((e.getX() + ourLoc.x_) | 0, (e.getY() + ourLoc.y_) | 0);
      } else if (e.getSource() === this.$outer.hiddenDivider) {
        let hDividerLoc = this.$outer.hiddenDivider.getLocation$();
        let ourX = (e.getX() + hDividerLoc.x_) | 0;
        let ourY = (e.getY() + hDividerLoc.y_) | 0;
        this.$outer.dragger.continueDrag$int$int(ourX, ourY);
      }
      e.consume();
    }
  }
  /**
   * Resets the cursor based on the orientation.
   */
  mouseMoved(e: MouseEvent): void {
  }
  /**
   * Invoked when the mouse enters a component.
   *
   * @param e MouseEvent describing the details of the enter event.
   * @since 1.5
   */
  mouseEntered(e: MouseEvent): void {
    if (e.getSource() === this.$outer) {
      this.$outer.setMouseOver(true);
    }
  }
  /**
   * Invoked when the mouse exits a component.
   *
   * @param e MouseEvent describing the details of the exit event.
   * @since 1.5
   */
  mouseExited(e: MouseEvent): void {
    if (e.getSource() === this.$outer) {
      this.$outer.setMouseOver(false);
    }
  }
}

/**
 * Handles the events during a dragging session for a
 * HORIZONTAL_SPLIT oriented split pane. This continually
 * messages <code>dragDividerTo</code> and then when done messages
 * <code>finishDraggingTo</code>. When an instance is created it should be
 * messaged with <code>isValid</code> to insure that dragging can happen
 * (dragging won't be allowed if the two views can not be resized).
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
export class BasicSplitPaneDivider$DragController extends JObject {
  /**
   * Initial location of the divider.
   */
  initialX: number = 0;
  /**
   * Maximum and minimum positions to drag to.
   */
  maxX: number = 0;
  /**
   * Maximum and minimum positions to drag to.
   */
  minX: number = 0;
  /**
   * Initial location the mouse down happened at.
   */
  offset: number = 0;
  /**
   * Constructs a new instance of {@code DragController}.
   *
   * @param e a mouse event
   */
  _BasicSplitPaneDivider$DragController(e: MouseEvent): this {
    let splitPane = this.$outer.splitPaneUI.getSplitPane();
    let leftC = splitPane.getLeftComponent();
    let rightC = splitPane.getRightComponent();
    this.initialX = this.$outer.getLocation$().x_;
    if (e.getSource() === this.$outer) {
      this.offset = e.getX();
    } else {
      this.offset = (e.getX() - this.initialX) | 0;
    }
    if (leftC == null || rightC == null || this.offset < -1 || this.offset >= this.$outer.getSize$().width_) {
      this.maxX = -1;
    } else {
      let insets = splitPane.getInsets$();
      if (leftC.isVisible$()) {
        this.minX = leftC.getMinimumSize$().width_;
        if (insets != null) {
          this.minX = (this.minX + insets.left) | 0;
        }
      } else {
        this.minX = 0;
      }
      if (rightC.isVisible$()) {
        let right = (insets != null) ? insets.right : 0;
        this.maxX = Math.max(0, (splitPane.getSize$().width_ - (this.$outer.getSize$().width_ + right) - rightC.getMinimumSize$().width_) | 0);
      } else {
        let right = (insets != null) ? insets.right : 0;
        this.maxX = Math.max(0, (splitPane.getSize$().width_ - (this.$outer.getSize$().width_ + right)) | 0);
      }
      if (this.maxX < this.minX) {
        this.minX = this.maxX = 0;
      }
    }
    return this;
  }
  /**
   * Returns {@code true} if the dragging session is valid.
   *
   * @return {@code true} if the dragging session is valid
   */
  isValid(): boolean {
    return (this.maxX > 0);
  }
  /**
   * Returns the new position to put the divider at based on
   * the passed in MouseEvent.
   *
   * @param e a mouse event
   * @return the new position
   */
  positionForMouseEvent(e: MouseEvent): number {
    let newX = (e.getSource() === this.$outer) ? ((e.getX() + this.$outer.getLocation$().x_) | 0) : e.getX();
    newX = Math.min(this.maxX, Math.max(this.minX, (newX - this.offset) | 0));
    return newX;
  }
  /**
   * Returns the x argument, since this is used for horizontal
   * splits.
   *
   * @param x an X coordinate
   * @param y an Y coordinate
   * @return the X argument
   */
  getNeededLocation(x: number, y: number): number {
    let newX: number;
    newX = Math.min(this.maxX, Math.max(this.minX, (x - this.offset) | 0));
    return newX;
  }
  /**
   * Messages dragDividerTo with the new location for the mouse
   * event.
   *
   * @param newX an X coordinate
   * @param newY an Y coordinate
   */
  continueDrag$int$int(newX: number, newY: number): void {
    this.$outer.dragDividerTo(this.getNeededLocation(newX, newY));
  }
  /**
   * Messages dragDividerTo with the new location for the mouse
   * event.
   *
   * @param e a mouse event
   */
  continueDrag$MouseEvent(e: MouseEvent): void {
    this.$outer.dragDividerTo(this.positionForMouseEvent(e));
  }
  /**
   * Messages finishDraggingTo with the new location for the mouse
   * event.
   *
   * @param x an X coordinate
   * @param y an Y coordinate
   */
  completeDrag$int$int(x: number, y: number): void {
    this.$outer.finishDraggingTo(this.getNeededLocation(x, y));
  }
}

/**
 * Handles the events during a dragging session for a
 * VERTICAL_SPLIT oriented split pane. This continually
 * messages <code>dragDividerTo</code> and then when done messages
 * <code>finishDraggingTo</code>. When an instance is created it should be
 * messaged with <code>isValid</code> to insure that dragging can happen
 * (dragging won't be allowed if the two views can not be resized).
 */
export class BasicSplitPaneDivider$VerticalDragController extends BasicSplitPaneDivider$DragController {
  /**
   * Constructs a new instance of {@code VerticalDragController}.
   *
   * @param e a mouse event
   */
  _BasicSplitPaneDivider$VerticalDragController(e: MouseEvent): this {
    this._BasicSplitPaneDivider$DragController(e);
    let splitPane = this.$outer.splitPaneUI.getSplitPane();
    let leftC = splitPane.getLeftComponent();
    let rightC = splitPane.getRightComponent();
    this.initialX = this.$outer.getLocation$().y_;
    if (e.getSource() === this.$outer) {
      this.offset = e.getY();
    } else {
      this.offset = (e.getY() - this.initialX) | 0;
    }
    if (leftC == null || rightC == null || this.offset < -1 || this.offset > this.$outer.getSize$().height_) {
      this.maxX = -1;
    } else {
      let insets = splitPane.getInsets$();
      if (leftC.isVisible$()) {
        this.minX = leftC.getMinimumSize$().height_;
        if (insets != null) {
          this.minX = (this.minX + insets.top) | 0;
        }
      } else {
        this.minX = 0;
      }
      if (rightC.isVisible$()) {
        let bottom = (insets != null) ? insets.bottom : 0;
        this.maxX = Math.max(0, (splitPane.getSize$().height_ - (this.$outer.getSize$().height_ + bottom) - rightC.getMinimumSize$().height_) | 0);
      } else {
        let bottom = (insets != null) ? insets.bottom : 0;
        this.maxX = Math.max(0, (splitPane.getSize$().height_ - (this.$outer.getSize$().height_ + bottom)) | 0);
      }
      if (this.maxX < this.minX) {
        this.minX = this.maxX = 0;
      }
    }
    return this;
  }
  /**
   * Returns the y argument, since this is used for vertical
   * splits.
   */
  getNeededLocation(x: number, y: number): number {
    let newY: number;
    newY = Math.min(this.maxX, Math.max(this.minX, (y - this.offset) | 0));
    return newY;
  }
  /**
   * Returns the new position to put the divider at based on
   * the passed in MouseEvent.
   */
  positionForMouseEvent(e: MouseEvent): number {
    let newY = (e.getSource() === this.$outer) ? ((e.getY() + this.$outer.getLocation$().y_) | 0) : e.getY();
    newY = Math.min(this.maxX, Math.max(this.minX, (newY - this.offset) | 0));
    return newY;
  }
}

/**
 * Used to layout a <code>BasicSplitPaneDivider</code>.
 * Layout for the divider
 * involves appropriately moving the left/right buttons around.
 */
export class BasicSplitPaneDivider$DividerLayout extends JObject {
  /**
   * Constructs a {@code DividerLayout}.
   */
  _BasicSplitPaneDivider$DividerLayout(): this {
    return this;
  }
  layoutContainer$Container(c: Container): void {
    if (this.$outer.leftButton != null && this.$outer.rightButton != null && c === this.$outer) {
      if (this.$outer.splitPane.isOneTouchExpandable()) {
        let insets = this.$outer.getInsets$();
        if (this.$outer.orientation === JSplitPane.VERTICAL_SPLIT) {
          let extraX = (insets != null) ? insets.left : 0;
          let blockSize = this.$outer.getHeight();
          if (insets != null) {
            blockSize = (blockSize - (insets.top + insets.bottom)) | 0;
            blockSize = Math.max(blockSize, 0);
          }
          blockSize = Math.min(blockSize, this.$outer.oneTouchSize);
          let y = $J.idiv(((c.getSize$().height_ - blockSize) | 0), 2);
          if (!this.$outer.centerOneTouchButtons) {
            y = (insets != null) ? insets.top : 0;
            extraX = 0;
          }
          this.$outer.leftButton.setBounds$int$int$int$int((extraX + this.$outer.oneTouchOffset) | 0, y, Math.imul(blockSize, 2), blockSize);
          this.$outer.rightButton.setBounds$int$int$int$int((extraX + this.$outer.oneTouchOffset + Math.imul(this.$outer.oneTouchSize, 2)) | 0, y, Math.imul(blockSize, 2), blockSize);
        } else {
          let extraY = (insets != null) ? insets.top : 0;
          let blockSize = this.$outer.getWidth();
          if (insets != null) {
            blockSize = (blockSize - (insets.left + insets.right)) | 0;
            blockSize = Math.max(blockSize, 0);
          }
          blockSize = Math.min(blockSize, this.$outer.oneTouchSize);
          let x = $J.idiv(((c.getSize$().width_ - blockSize) | 0), 2);
          if (!this.$outer.centerOneTouchButtons) {
            x = (insets != null) ? insets.left : 0;
            extraY = 0;
          }
          this.$outer.leftButton.setBounds$int$int$int$int(x, (extraY + this.$outer.oneTouchOffset) | 0, blockSize, Math.imul(blockSize, 2));
          this.$outer.rightButton.setBounds$int$int$int$int(x, (extraY + this.$outer.oneTouchOffset + Math.imul(this.$outer.oneTouchSize, 2)) | 0, blockSize, Math.imul(blockSize, 2));
        }
      } else {
        this.$outer.leftButton.setBounds$int$int$int$int(-5, -5, 1, 1);
        this.$outer.rightButton.setBounds$int$int$int$int(-5, -5, 1, 1);
      }
    }
  }
  minimumLayoutSize(c: Container): Dimension {
    if (c !== this.$outer || this.$outer.splitPane == null) {
      return new Dimension()._Dimension$int$int(0, 0);
    }
    let buttonMinSize = null;
    if (this.$outer.splitPane.isOneTouchExpandable() && this.$outer.leftButton != null) {
      buttonMinSize = this.$outer.leftButton.getMinimumSize$();
    }
    let insets = this.$outer.getInsets$();
    let width = this.$outer.getDividerSize();
    let height = width;
    if (this.$outer.orientation === JSplitPane.VERTICAL_SPLIT) {
      if (buttonMinSize != null) {
        let size = buttonMinSize.height_;
        if (insets != null) {
          size = (size + (insets.top + insets.bottom)) | 0;
        }
        height = Math.max(height, size);
      }
      width = 1;
    } else {
      if (buttonMinSize != null) {
        let size = buttonMinSize.width_;
        if (insets != null) {
          size = (size + (insets.left + insets.right)) | 0;
        }
        width = Math.max(width, size);
      }
      height = 1;
    }
    return new Dimension()._Dimension$int$int(width, height);
  }
  preferredLayoutSize(c: Container): Dimension {
    return this.minimumLayoutSize(c);
  }
  removeLayoutComponent(c: Component): void {
  }
  addLayoutComponent$String$Component(string$: string, c: Component): void {
  }
}

/**
 * Listeners installed on the one touch expandable buttons.
 */
export class BasicSplitPaneDivider$OneTouchActionHandler extends JObject {
  /**
   * True indicates the resize should go the minimum (top or left)
   * vs false which indicates the resize should go to the maximum.
   */
  toMinimum: boolean = false;
  _BasicSplitPaneDivider$OneTouchActionHandler(toMinimum: boolean): this {
    this.toMinimum = toMinimum;
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    let insets = this.$outer.splitPane.getInsets$();
    let lastLoc = this.$outer.splitPane.getLastDividerLocation();
    let currentLoc = this.$outer.splitPaneUI.getDividerLocation(this.$outer.splitPane);
    let newLoc: number;
    if (this.toMinimum) {
      if (this.$outer.orientation === JSplitPane.VERTICAL_SPLIT) {
        if (currentLoc >= ((this.$outer.splitPane.getHeight() - insets.bottom - this.$outer.getHeight()) | 0)) {
          let maxLoc = this.$outer.splitPane.getMaximumDividerLocation();
          newLoc = Math.min(lastLoc, maxLoc);
          this.$outer.splitPaneUI.setKeepHidden(false);
        } else {
          newLoc = insets.top;
          this.$outer.splitPaneUI.setKeepHidden(true);
        }
      } else {
        if (currentLoc >= ((this.$outer.splitPane.getWidth() - insets.right - this.$outer.getWidth()) | 0)) {
          let maxLoc = this.$outer.splitPane.getMaximumDividerLocation();
          newLoc = Math.min(lastLoc, maxLoc);
          this.$outer.splitPaneUI.setKeepHidden(false);
        } else {
          newLoc = insets.left;
          this.$outer.splitPaneUI.setKeepHidden(true);
        }
      }
    } else {
      if (this.$outer.orientation === JSplitPane.VERTICAL_SPLIT) {
        if (currentLoc === insets.top) {
          let maxLoc = this.$outer.splitPane.getMaximumDividerLocation();
          newLoc = Math.min(lastLoc, maxLoc);
          this.$outer.splitPaneUI.setKeepHidden(false);
        } else {
          newLoc = (this.$outer.splitPane.getHeight() - this.$outer.getHeight() - insets.top) | 0;
          this.$outer.splitPaneUI.setKeepHidden(true);
        }
      } else {
        if (currentLoc === insets.left) {
          let maxLoc = this.$outer.splitPane.getMaximumDividerLocation();
          newLoc = Math.min(lastLoc, maxLoc);
          this.$outer.splitPaneUI.setKeepHidden(false);
        } else {
          newLoc = (this.$outer.splitPane.getWidth() - this.$outer.getWidth() - insets.left) | 0;
          this.$outer.splitPaneUI.setKeepHidden(true);
        }
      }
    }
    if (currentLoc !== newLoc) {
      this.$outer.splitPane.setDividerLocation$int(newLoc);
      this.$outer.splitPane.setLastDividerLocation(currentLoc);
    }
  }
}

let $BasicSplitPaneDivider$1: any = null;
/** An anonymous class (BasicSplitPaneDivider.java:427). */
function BasicSplitPaneDivider$1(): any {
  return $BasicSplitPaneDivider$1 ??= $J.local(class extends JButton {
    setBorder(b: Border): void {
    }
    paint(g: Graphics): void {
      if (this.$outer.splitPane != null) {
        let xs = $J.newArray(3, 0);
        let ys = $J.newArray(3, 0);
        let blockSize: number;
        g.setColor(this.getBackground());
        g.fillRect(0, 0, this.getWidth(), this.getHeight());
        g.setColor(Color.black);
        if (this.$outer.orientation === JSplitPane.VERTICAL_SPLIT) {
          blockSize = Math.min(this.getHeight(), this.$outer.oneTouchSize);
          xs[0] = blockSize;
          xs[1] = 0;
          xs[2] = blockSize << 1;
          ys[0] = 0;
          ys[1] = ys[2] = blockSize;
          g.drawPolygon$intArr$intArr$int(xs, ys, 3);
        } else {
          blockSize = Math.min(this.getWidth(), this.$outer.oneTouchSize);
          xs[0] = xs[2] = blockSize;
          xs[1] = 0;
          ys[0] = 0;
          ys[1] = blockSize;
          ys[2] = blockSize << 1;
        }
        g.fillPolygon$intArr$intArr$int(xs, ys, 3);
      }
    }
    isFocusTraversable(): boolean {
      return false;
    }
  }, 'javax.swing.plaf.basic.BasicSplitPaneDivider$1', []);
}

let $BasicSplitPaneDivider$2: any = null;
/** An anonymous class (BasicSplitPaneDivider.java:486). */
function BasicSplitPaneDivider$2(): any {
  return $BasicSplitPaneDivider$2 ??= $J.local(class extends JButton {
    setBorder(border: Border): void {
    }
    paint(g: Graphics): void {
      if (this.$outer.splitPane != null) {
        let xs = $J.newArray(3, 0);
        let ys = $J.newArray(3, 0);
        let blockSize: number;
        g.setColor(this.getBackground());
        g.fillRect(0, 0, this.getWidth(), this.getHeight());
        if (this.$outer.orientation === JSplitPane.VERTICAL_SPLIT) {
          blockSize = Math.min(this.getHeight(), this.$outer.oneTouchSize);
          xs[0] = blockSize;
          xs[1] = blockSize << 1;
          xs[2] = 0;
          ys[0] = blockSize;
          ys[1] = ys[2] = 0;
        } else {
          blockSize = Math.min(this.getWidth(), this.$outer.oneTouchSize);
          xs[0] = xs[2] = 0;
          xs[1] = blockSize;
          ys[0] = 0;
          ys[1] = blockSize;
          ys[2] = blockSize << 1;
        }
        g.setColor(Color.black);
        g.fillPolygon$intArr$intArr$int(xs, ys, 3);
      }
    }
    isFocusTraversable(): boolean {
      return false;
    }
  }, 'javax.swing.plaf.basic.BasicSplitPaneDivider$2', []);
}

$J.define(BasicSplitPaneDivider, 'javax.swing.plaf.basic.BasicSplitPaneDivider', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'java.awt.Container', ctors: { 'javax.swing.plaf.basic.BasicSplitPaneUI': '_BasicSplitPaneDivider' }, meths: { 'getMinimumSize()': 'getMinimumSize$', 'getPreferredSize()': 'getPreferredSize$', 'getInsets()': 'getInsets$' } });
$J.define(BasicSplitPaneDivider$MouseHandler, 'javax.swing.plaf.basic.BasicSplitPaneDivider$MouseHandler', { kind: 'class', ifaces: ['java.awt.event.MouseMotionListener'], sup: 'java.awt.event.MouseAdapter', ctors: { '': '_BasicSplitPaneDivider$MouseHandler' }, inner: true });
$J.define(BasicSplitPaneDivider$DragController, 'javax.swing.plaf.basic.BasicSplitPaneDivider$DragController', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.awt.event.MouseEvent': '_BasicSplitPaneDivider$DragController' }, meths: { 'completeDrag(java.awt.event.MouseEvent)': 'completeDrag$MouseEvent', 'completeDrag(int,int)': 'completeDrag$int$int', 'continueDrag(java.awt.event.MouseEvent)': 'continueDrag$MouseEvent', 'continueDrag(int,int)': 'continueDrag$int$int' }, inner: true });
$J.define(BasicSplitPaneDivider$VerticalDragController, 'javax.swing.plaf.basic.BasicSplitPaneDivider$VerticalDragController', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicSplitPaneDivider$DragController', ctors: { 'java.awt.event.MouseEvent': '_BasicSplitPaneDivider$VerticalDragController' }, inner: true });
$J.define(BasicSplitPaneDivider$DividerLayout, 'javax.swing.plaf.basic.BasicSplitPaneDivider$DividerLayout', { kind: 'class', ifaces: ['java.awt.LayoutManager'], sup: 'java.lang.Object', ctors: { '': '_BasicSplitPaneDivider$DividerLayout' }, meths: { 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component', 'layoutContainer(java.awt.Container)': 'layoutContainer$Container' }, inner: true });
$J.define(BasicSplitPaneDivider$OneTouchActionHandler, 'javax.swing.plaf.basic.BasicSplitPaneDivider$OneTouchActionHandler', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'java.lang.Object', ctors: { 'boolean': '_BasicSplitPaneDivider$OneTouchActionHandler' }, inner: true });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Cursor = $J.load('java.awt.Cursor');
  Dimension = $J.load('java.awt.Dimension');
  JButton = $J.load('javax.swing.JButton');
  JSplitPane = $J.load('javax.swing.JSplitPane');
  UIManager = $J.load('javax.swing.UIManager');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
});
