// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicScrollBarUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { ScrollBarUI } from '../ScrollBarUI.ts';
import { MouseAdapter } from '../../../../java/awt/event/MouseAdapter.ts';
import { UIAction } from '../../../../sun/swing/UIAction.ts';

let Adjustable, Dimension, Point, Rectangle, FocusEvent$Cause, JComponent, JList, JScrollPane, LookAndFeel, SwingConstants, SwingUtilities, Timer, UIManager, UIResource, BasicArrowButton, LazyActionMap, DefaultLookup, SwingUtilities2;

/**
 * Implementation of ScrollBarUI for the Basic Look and Feel
 *
 * @author Rich Schiavi
 * @author David Kloba
 * @author Hans Muller
 */
export class BasicScrollBarUI extends ScrollBarUI {
  static readonly POSITIVE_SCROLL: number = 1;
  static readonly NEGATIVE_SCROLL: number = -1;
  static readonly MIN_SCROLL: number = 2;
  static readonly MAX_SCROLL: number = 3;
  /**
   * Minimum thumb size
   */
  minimumThumbSize: Dimension = null;
  /**
   * Maximum thumb size
   */
  maximumThumbSize: Dimension = null;
  /**
   * Thumb highlight color
   */
  thumbHighlightColor: Color = null;
  /**
   * Thumb light shadow color
   */
  thumbLightShadowColor: Color = null;
  /**
   * Thumb dark shadow color
   */
  thumbDarkShadowColor: Color = null;
  /**
   * Thumb color
   */
  thumbColor: Color = null;
  /**
   * Track color
   */
  trackColor: Color = null;
  /**
   * Track highlight color
   */
  trackHighlightColor: Color = null;
  /**
   * Scrollbar
   */
  scrollbar: JScrollBar = null;
  /**
   * Increment button
   */
  incrButton: JButton = null;
  /**
   * Decrement button
   */
  decrButton: JButton = null;
  /**
   * Dragging
   */
  isDragging_: boolean = false;
  /**
   * Track listener
   */
  trackListener: BasicScrollBarUI$TrackListener = null;
  /**
   * Button listener
   */
  buttonListener: BasicScrollBarUI$ArrowButtonListener = null;
  /**
   * Model listener
   */
  modelListener: BasicScrollBarUI$ModelListener = null;
  /**
   * Thumb rectangle
   */
  thumbRect: Rectangle = null;
  /**
   * Track rectangle
   */
  trackRect: Rectangle = null;
  /**
   * Track highlight
   */
  trackHighlight: number = 0;
  /**
   * No highlight
   */
  static readonly NO_HIGHLIGHT: number = 0;
  /**
   * Decrease highlight
   */
  static readonly DECREASE_HIGHLIGHT: number = 1;
  /**
   * Increase highlight
   */
  static readonly INCREASE_HIGHLIGHT: number = 2;
  /**
   * Scroll listener
   */
  scrollListener: BasicScrollBarUI$ScrollListener = null;
  /**
   * Property change listener
   */
  propertyChangeListener: PropertyChangeListener = null;
  /**
   * Scroll timer
   */
  scrollTimer: Timer = null;
  static readonly scrollSpeedThrottle: number = 60;
  /**
   * True indicates a middle click will absolutely position the
   * scrollbar.
   */
  supportsAbsolutePositioning: boolean = false;
  /**
   * Hint as to what width (when vertical) or height (when horizontal)
   * should be.
   *
   * @since 1.7
   */
  scrollBarWidth: number = 0;
  handler: BasicScrollBarUI$Handler = null;
  thumbActive: boolean = false;
  /**
   * Determine whether scrollbar layout should use cached value or adjusted
   * value returned by scrollbar's <code>getValue</code>.
   */
  useCachedValue: boolean = false;
  /**
   * The scrollbar value is cached to save real value if the view is adjusted.
   */
  scrollBarValue: number = 0;
  /**
   * Distance between the increment button and the track. This may be a negative
   * number. If negative, then an overlap between the button and track will occur,
   * which is useful for shaped buttons.
   *
   * @since 1.7
   */
  incrGap: number = 0;
  /**
   * Distance between the decrement button and the track. This may be a negative
   * number. If negative, then an overlap between the button and track will occur,
   * which is useful for shaped buttons.
   *
   * @since 1.7
   */
  decrGap: number = 0;
  /**
   * Constructs a {@code BasicScrollBarUI}.
   */
  _BasicScrollBarUI(): this {
    this._ScrollBarUI();
    this.useCachedValue = false;
    return this;
  }
  static loadActionMap(map: LazyActionMap): void {
    map.put$Action(new BasicScrollBarUI$Actions()._BasicScrollBarUI$Actions(BasicScrollBarUI$Actions.POSITIVE_UNIT_INCREMENT));
    map.put$Action(new BasicScrollBarUI$Actions()._BasicScrollBarUI$Actions(BasicScrollBarUI$Actions.POSITIVE_BLOCK_INCREMENT));
    map.put$Action(new BasicScrollBarUI$Actions()._BasicScrollBarUI$Actions(BasicScrollBarUI$Actions.NEGATIVE_UNIT_INCREMENT));
    map.put$Action(new BasicScrollBarUI$Actions()._BasicScrollBarUI$Actions(BasicScrollBarUI$Actions.NEGATIVE_BLOCK_INCREMENT));
    map.put$Action(new BasicScrollBarUI$Actions()._BasicScrollBarUI$Actions(BasicScrollBarUI$Actions.MIN_SCROLL));
    map.put$Action(new BasicScrollBarUI$Actions()._BasicScrollBarUI$Actions(BasicScrollBarUI$Actions.MAX_SCROLL));
  }
  /**
   * Creates the UI.
   * @param c the component
   * @return the UI
   */
  static createUI(c: JComponent): ComponentUI {
    return new BasicScrollBarUI()._BasicScrollBarUI();
  }
  /**
   * Configures the scroll bar colors.
   */
  configureScrollBarColors(): void {
    LookAndFeel.installColors(this.scrollbar, 'ScrollBar.background', 'ScrollBar.foreground');
    this.thumbHighlightColor = UIManager.getColor$Object('ScrollBar.thumbHighlight');
    this.thumbLightShadowColor = UIManager.getColor$Object('ScrollBar.thumbShadow');
    this.thumbDarkShadowColor = UIManager.getColor$Object('ScrollBar.thumbDarkShadow');
    this.thumbColor = UIManager.getColor$Object('ScrollBar.thumb');
    this.trackColor = UIManager.getColor$Object('ScrollBar.track');
    this.trackHighlightColor = UIManager.getColor$Object('ScrollBar.trackHighlight');
  }
  /**
   * Installs the UI.
   * @param c the component
   */
  installUI(c: JComponent): void {
    this.scrollbar = c;
    this.thumbRect = new Rectangle()._Rectangle$int$int$int$int(0, 0, 0, 0);
    this.trackRect = new Rectangle()._Rectangle$int$int$int$int(0, 0, 0, 0);
    this.installDefaults();
    this.installComponents();
    this.installListeners();
    this.installKeyboardActions();
  }
  /**
   * Uninstalls the UI.
   * @param c the component
   */
  uninstallUI(c: JComponent): void {
    this.scrollbar = c;
    this.uninstallListeners();
    this.uninstallDefaults();
    this.uninstallComponents();
    this.uninstallKeyboardActions();
    this.thumbRect = null;
    this.scrollbar = null;
    this.incrButton = null;
    this.decrButton = null;
  }
  /**
   * Installs the defaults.
   */
  installDefaults(): void {
    this.scrollBarWidth = UIManager.getInt$Object('ScrollBar.width');
    if (this.scrollBarWidth <= 0) {
      this.scrollBarWidth = 16;
    }
    this.minimumThumbSize = UIManager.get$Object('ScrollBar.minimumThumbSize');
    this.maximumThumbSize = UIManager.get$Object('ScrollBar.maximumThumbSize');
    let absB = UIManager.get$Object('ScrollBar.allowsAbsolutePositioning');
    this.supportsAbsolutePositioning = (absB != null) ? absB : false;
    this.trackHighlight = BasicScrollBarUI.NO_HIGHLIGHT;
    if (this.scrollbar.getLayout() == null || ($J.isa(this.scrollbar.getLayout(), UIResource))) {
      this.scrollbar.setLayout(this);
    }
    this.configureScrollBarColors();
    LookAndFeel.installBorder(this.scrollbar, 'ScrollBar.border');
    LookAndFeel.installProperty(this.scrollbar, 'opaque', true);
    this.scrollBarValue = this.scrollbar.getValue();
    this.incrGap = UIManager.getInt$Object('ScrollBar.incrementButtonGap');
    this.decrGap = UIManager.getInt$Object('ScrollBar.decrementButtonGap');
    let scaleKey = this.scrollbar.getClientProperty('JComponent.sizeVariant');
    if (scaleKey != null) {
      if ($J.equals('large', scaleKey)) {
        this.scrollBarWidth = $J.d2i(this.scrollBarWidth * 1.15);
        this.incrGap = $J.d2i(this.incrGap * 1.15);
        this.decrGap = $J.d2i(this.decrGap * 1.15);
      } else if ($J.equals('small', scaleKey)) {
        this.scrollBarWidth = $J.d2i(this.scrollBarWidth * 0.857);
        this.incrGap = $J.d2i(this.incrGap * 0.857);
        this.decrGap = $J.d2i(this.decrGap * 0.857);
      } else if ($J.equals('mini', scaleKey)) {
        this.scrollBarWidth = $J.d2i(this.scrollBarWidth * 0.714);
        this.incrGap = $J.d2i(this.incrGap * 0.714);
        this.decrGap = $J.d2i(this.decrGap * 0.714);
      }
    }
  }
  /**
   * Installs the components.
   */
  installComponents(): void {
    switch (this.scrollbar.getOrientation()) {
      case Adjustable.VERTICAL:
        this.incrButton = this.createIncreaseButton(SwingConstants.SOUTH);
        this.decrButton = this.createDecreaseButton(SwingConstants.NORTH);
        break;
      case Adjustable.HORIZONTAL:
        if (this.scrollbar.getComponentOrientation().isLeftToRight()) {
          this.incrButton = this.createIncreaseButton(SwingConstants.EAST);
          this.decrButton = this.createDecreaseButton(SwingConstants.WEST);
        } else {
          this.incrButton = this.createIncreaseButton(SwingConstants.WEST);
          this.decrButton = this.createDecreaseButton(SwingConstants.EAST);
        }
        break;
    }
    this.scrollbar.add$Component(this.incrButton);
    this.scrollbar.add$Component(this.decrButton);
    this.scrollbar.setEnabled(this.scrollbar.isEnabled());
  }
  /**
   * Uninstalls the components.
   */
  uninstallComponents(): void {
    this.scrollbar.remove$Component(this.incrButton);
    this.scrollbar.remove$Component(this.decrButton);
  }
  /**
   * Installs the listeners.
   */
  installListeners(): void {
    this.trackListener = this.createTrackListener();
    this.buttonListener = this.createArrowButtonListener();
    this.modelListener = this.createModelListener();
    this.propertyChangeListener = this.createPropertyChangeListener();
    this.scrollbar.addMouseListener(this.trackListener);
    this.scrollbar.addMouseMotionListener(this.trackListener);
    this.scrollbar.getModel().addChangeListener($J.fn(this.modelListener, 'stateChanged'));
    this.scrollbar.addPropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    this.scrollbar.addFocusListener(this.getHandler());
    if (this.incrButton != null) {
      this.incrButton.addMouseListener(this.buttonListener);
    }
    if (this.decrButton != null) {
      this.decrButton.addMouseListener(this.buttonListener);
    }
    this.scrollListener = this.createScrollListener();
    this.scrollTimer = new Timer()._Timer(BasicScrollBarUI.scrollSpeedThrottle, $J.fn(this.scrollListener, 'actionPerformed'));
    this.scrollTimer.setInitialDelay(300);
  }
  /**
   * Installs the keyboard actions.
   */
  installKeyboardActions(): void {
    LazyActionMap.installLazyActionMap(this.scrollbar, $J.cls(BasicScrollBarUI), 'ScrollBar.actionMap');
    let inputMap = this.getInputMap(JComponent.WHEN_FOCUSED);
    SwingUtilities.replaceUIInputMap(this.scrollbar, JComponent.WHEN_FOCUSED, inputMap);
    inputMap = this.getInputMap(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT);
    SwingUtilities.replaceUIInputMap(this.scrollbar, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, inputMap);
  }
  /**
   * Uninstalls the keyboard actions.
   */
  uninstallKeyboardActions(): void {
    SwingUtilities.replaceUIInputMap(this.scrollbar, JComponent.WHEN_FOCUSED, null);
    SwingUtilities.replaceUIActionMap(this.scrollbar, null);
  }
  getInputMap(condition: number): InputMap {
    if (condition === JComponent.WHEN_FOCUSED) {
      let keyMap = DefaultLookup.get(this.scrollbar, this, 'ScrollBar.focusInputMap');
      let rtlKeyMap: InputMap;
      if (this.scrollbar.getComponentOrientation().isLeftToRight() || ((rtlKeyMap = DefaultLookup.get(this.scrollbar, this, 'ScrollBar.focusInputMap.RightToLeft')) == null)) {
        return keyMap;
      } else {
        rtlKeyMap.setParent(keyMap);
        return rtlKeyMap;
      }
    } else if (condition === JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT) {
      let keyMap = DefaultLookup.get(this.scrollbar, this, 'ScrollBar.ancestorInputMap');
      let rtlKeyMap: InputMap;
      if (this.scrollbar.getComponentOrientation().isLeftToRight() || ((rtlKeyMap = DefaultLookup.get(this.scrollbar, this, 'ScrollBar.ancestorInputMap.RightToLeft')) == null)) {
        return keyMap;
      } else {
        rtlKeyMap.setParent(keyMap);
        return rtlKeyMap;
      }
    }
    return null;
  }
  /**
   * Uninstall the listeners.
   */
  uninstallListeners(): void {
    this.scrollTimer.stop();
    this.scrollTimer = null;
    if (this.decrButton != null) {
      this.decrButton.removeMouseListener(this.buttonListener);
    }
    if (this.incrButton != null) {
      this.incrButton.removeMouseListener(this.buttonListener);
    }
    this.scrollbar.getModel().removeChangeListener($J.fn(this.modelListener, 'stateChanged'));
    this.scrollbar.removeMouseListener(this.trackListener);
    this.scrollbar.removeMouseMotionListener(this.trackListener);
    this.scrollbar.removePropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    this.scrollbar.removeFocusListener(this.getHandler());
    this.handler = null;
  }
  /**
   * Uninstalls the defaults.
   */
  uninstallDefaults(): void {
    LookAndFeel.uninstallBorder(this.scrollbar);
    if (this.scrollbar.getLayout() === this) {
      this.scrollbar.setLayout(null);
    }
  }
  getHandler(): BasicScrollBarUI$Handler {
    if (this.handler == null) {
      this.handler = new BasicScrollBarUI$Handler().$o(this)._BasicScrollBarUI$Handler();
    }
    return this.handler;
  }
  /**
   * Creates a track listener.
   * @return a track listener
   */
  createTrackListener(): BasicScrollBarUI$TrackListener {
    return new BasicScrollBarUI$TrackListener().$o(this)._BasicScrollBarUI$TrackListener();
  }
  /**
   * Creates an arrow button listener.
   * @return an arrow button   listener
   */
  createArrowButtonListener(): BasicScrollBarUI$ArrowButtonListener {
    return new BasicScrollBarUI$ArrowButtonListener().$o(this)._BasicScrollBarUI$ArrowButtonListener();
  }
  /**
   * Creates a model listener.
   * @return a model listener
   */
  createModelListener(): BasicScrollBarUI$ModelListener {
    return new BasicScrollBarUI$ModelListener().$o(this)._BasicScrollBarUI$ModelListener();
  }
  /**
   * Creates a scroll listener.
   * @return a scroll listener
   */
  createScrollListener(): BasicScrollBarUI$ScrollListener {
    return new BasicScrollBarUI$ScrollListener().$o(this)._BasicScrollBarUI$ScrollListener$();
  }
  /**
   * Creates a property change listener.
   * @return a property change listener
   */
  createPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
  updateThumbState(x: number, y: number): void {
    let rect = this.getThumbBounds();
    this.setThumbRollover(rect.contains$int$int(x, y));
  }
  /**
   * Sets whether or not the mouse is currently over the thumb.
   *
   * @param active True indicates the thumb is currently active.
   * @since 1.5
   */
  setThumbRollover(active: boolean): void {
    if (this.thumbActive !== active) {
      this.thumbActive = active;
      this.scrollbar.repaint$Rectangle(this.getThumbBounds());
    }
  }
  /**
   * Returns true if the mouse is currently over the thumb.
   *
   * @return true if the thumb is currently active
   * @since 1.5
   */
  isThumbRollover(): boolean {
    return this.thumbActive;
  }
  paint(g: Graphics, c: JComponent): void {
    this.paintTrack(g, c, this.getTrackBounds());
    let thumbBounds = this.getThumbBounds();
    if (thumbBounds.intersects$Rectangle(g.getClipBounds$())) {
      this.paintThumb(g, c, thumbBounds);
    }
  }
  /**
   * A vertical scrollbar's preferred width is the maximum of
   * preferred widths of the (non <code>null</code>)
   * increment/decrement buttons,
   * and the minimum width of the thumb. The preferred height is the
   * sum of the preferred heights of the same parts.  The basis for
   * the preferred size of a horizontal scrollbar is similar.
   * <p>
   * The <code>preferredSize</code> is only computed once, subsequent
   * calls to this method just return a cached size.
   *
   * @param c the <code>JScrollBar</code> that's delegating this method to us
   * @return the preferred size of a Basic JScrollBar
   * @see #getMaximumSize
   * @see #getMinimumSize
   */
  getPreferredSize$JComponent(c: JComponent): Dimension {
    return (this.scrollbar.getOrientation() === Adjustable.VERTICAL) ? new Dimension()._Dimension$int$int(this.scrollBarWidth, 48) : new Dimension()._Dimension$int$int(48, this.scrollBarWidth);
  }
  /**
   * @param c The JScrollBar that's delegating this method to us.
   * @return new Dimension(Integer.MAX_VALUE, Integer.MAX_VALUE);
   * @see #getMinimumSize
   * @see #getPreferredSize
   */
  getMaximumSize(c: JComponent): Dimension {
    return new Dimension()._Dimension$int$int(2147483647, 2147483647);
  }
  /**
   * Creates a decrease button.
   * @param orientation the orientation
   * @return a decrease button
   */
  createDecreaseButton(orientation: number): JButton {
    return new BasicArrowButton()._BasicArrowButton$int$Color$Color$Color$Color(orientation, UIManager.getColor$Object('ScrollBar.thumb'), UIManager.getColor$Object('ScrollBar.thumbShadow'), UIManager.getColor$Object('ScrollBar.thumbDarkShadow'), UIManager.getColor$Object('ScrollBar.thumbHighlight'));
  }
  /**
   * Creates an increase button.
   * @param orientation the orientation
   * @return an increase button
   */
  createIncreaseButton(orientation: number): JButton {
    return new BasicArrowButton()._BasicArrowButton$int$Color$Color$Color$Color(orientation, UIManager.getColor$Object('ScrollBar.thumb'), UIManager.getColor$Object('ScrollBar.thumbShadow'), UIManager.getColor$Object('ScrollBar.thumbDarkShadow'), UIManager.getColor$Object('ScrollBar.thumbHighlight'));
  }
  /**
   * Paints the decrease highlight.
   * @param g the graphics
   */
  paintDecreaseHighlight(g: Graphics): void {
    let insets = this.scrollbar.getInsets$();
    let thumbR = this.getThumbBounds();
    g.setColor(this.trackHighlightColor);
    if (this.scrollbar.getOrientation() === Adjustable.VERTICAL) {
      let x = insets.left;
      let y = this.trackRect.y_;
      let w = (this.scrollbar.getWidth() - (insets.left + insets.right)) | 0;
      let h = (thumbR.y_ - y) | 0;
      g.fillRect(x, y, w, h);
    } else {
      let x: number;
      let w: number;
      if (this.scrollbar.getComponentOrientation().isLeftToRight()) {
        x = this.trackRect.x_;
        w = (thumbR.x_ - x) | 0;
      } else {
        x = (thumbR.x_ + thumbR.width_) | 0;
        w = (this.trackRect.x_ + this.trackRect.width_ - x) | 0;
      }
      let y = insets.top;
      let h = (this.scrollbar.getHeight() - (insets.top + insets.bottom)) | 0;
      g.fillRect(x, y, w, h);
    }
  }
  /**
   * Paints the increase highlight.
   * @param g the graphics
   */
  paintIncreaseHighlight(g: Graphics): void {
    let insets = this.scrollbar.getInsets$();
    let thumbR = this.getThumbBounds();
    g.setColor(this.trackHighlightColor);
    if (this.scrollbar.getOrientation() === Adjustable.VERTICAL) {
      let x = insets.left;
      let y = (thumbR.y_ + thumbR.height_) | 0;
      let w = (this.scrollbar.getWidth() - (insets.left + insets.right)) | 0;
      let h = (this.trackRect.y_ + this.trackRect.height_ - y) | 0;
      g.fillRect(x, y, w, h);
    } else {
      let x: number;
      let w: number;
      if (this.scrollbar.getComponentOrientation().isLeftToRight()) {
        x = (thumbR.x_ + thumbR.width_) | 0;
        w = (this.trackRect.x_ + this.trackRect.width_ - x) | 0;
      } else {
        x = this.trackRect.x_;
        w = (thumbR.x_ - x) | 0;
      }
      let y = insets.top;
      let h = (this.scrollbar.getHeight() - (insets.top + insets.bottom)) | 0;
      g.fillRect(x, y, w, h);
    }
  }
  /**
   * Paints the track.
   * @param g the graphics
   * @param c the component
   * @param trackBounds the track bounds
   */
  paintTrack(g: Graphics, c: JComponent, trackBounds: Rectangle): void {
    g.setColor(this.trackColor);
    g.fillRect(trackBounds.x_, trackBounds.y_, trackBounds.width_, trackBounds.height_);
    if (this.trackHighlight === BasicScrollBarUI.DECREASE_HIGHLIGHT) {
      this.paintDecreaseHighlight(g);
    } else if (this.trackHighlight === BasicScrollBarUI.INCREASE_HIGHLIGHT) {
      this.paintIncreaseHighlight(g);
    }
  }
  /**
   * Paints the thumb.
   * @param g the graphics
   * @param c the component
   * @param thumbBounds the thumb bounds
   */
  paintThumb(g: Graphics, c: JComponent, thumbBounds: Rectangle): void {
    if (thumbBounds.isEmpty() || !this.scrollbar.isEnabled()) {
      return;
    }
    let w = thumbBounds.width_;
    let h = thumbBounds.height_;
    g.translate$int$int(thumbBounds.x_, thumbBounds.y_);
    g.setColor(this.thumbDarkShadowColor);
    SwingUtilities2.drawRect(g, 0, 0, (w - 1) | 0, (h - 1) | 0);
    g.setColor(this.thumbColor);
    g.fillRect(0, 0, (w - 1) | 0, (h - 1) | 0);
    g.setColor(this.thumbHighlightColor);
    SwingUtilities2.drawVLine(g, 1, 1, (h - 2) | 0);
    SwingUtilities2.drawHLine(g, 2, (w - 3) | 0, 1);
    g.setColor(this.thumbLightShadowColor);
    SwingUtilities2.drawHLine(g, 2, (w - 2) | 0, (h - 2) | 0);
    SwingUtilities2.drawVLine(g, (w - 2) | 0, 1, (h - 3) | 0);
    g.translate$int$int(-thumbBounds.x_, -thumbBounds.y_);
  }
  /**
   * Returns the smallest acceptable size for the thumb.  If the scrollbar
   * becomes so small that this size isn't available, the thumb will be
   * hidden.
   * <p>
   * <b>Warning </b>: the value returned by this method should not be
   * be modified, it's a shared static constant.
   *
   * @return The smallest acceptable size for the thumb.
   * @see #getMaximumThumbSize
   */
  getMinimumThumbSize(): Dimension {
    return this.minimumThumbSize;
  }
  /**
   * Returns the largest acceptable size for the thumb.  To create a fixed
   * size thumb one make this method and <code>getMinimumThumbSize</code>
   * return the same value.
   * <p>
   * <b>Warning </b>: the value returned by this method should not be
   * be modified, it's a shared static constant.
   *
   * @return The largest acceptable size for the thumb.
   * @see #getMinimumThumbSize
   */
  getMaximumThumbSize(): Dimension {
    return this.maximumThumbSize;
  }
  addLayoutComponent$String$Component(name: string, child: Component): void {
  }
  removeLayoutComponent(child: Component): void {
  }
  preferredLayoutSize(scrollbarContainer: Container): Dimension {
    return this.getPreferredSize$JComponent(scrollbarContainer);
  }
  minimumLayoutSize(scrollbarContainer: Container): Dimension {
    return this.getMinimumSize(scrollbarContainer);
  }
  getValue(sb: JScrollBar): number {
    return (this.useCachedValue) ? this.scrollBarValue : sb.getValue();
  }
  /**
   * Lays out a vertical scroll bar.
   * @param sb the scroll bar
   */
  layoutVScrollbar(sb: JScrollBar): void {
    let sbSize = sb.getSize$();
    let sbInsets = sb.getInsets$();
    let itemW = (sbSize.width_ - (sbInsets.left + sbInsets.right)) | 0;
    let itemX = sbInsets.left;
    let squareButtons = DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(this.scrollbar, this, 'ScrollBar.squareButtons', false);
    let decrButtonH = squareButtons ? itemW : this.decrButton.getPreferredSize$().height_;
    let decrButtonY = sbInsets.top;
    let incrButtonH = squareButtons ? itemW : this.incrButton.getPreferredSize$().height_;
    let incrButtonY = (sbSize.height_ - (sbInsets.bottom + incrButtonH)) | 0;
    let sbInsetsH = (sbInsets.top + sbInsets.bottom) | 0;
    let sbButtonsH = (decrButtonH + incrButtonH) | 0;
    let gaps = (this.decrGap + this.incrGap) | 0;
    let trackH = Math.fround((sbSize.height_ - (sbInsetsH + sbButtonsH) - gaps) | 0);
    let min = Math.fround(sb.getMinimum());
    let extent = Math.fround(sb.getVisibleAmount());
    let range = Math.fround(sb.getMaximum() - min);
    let value = Math.fround(this.getValue(sb));
    let thumbH = (range <= Math.fround(0)) ? this.getMaximumThumbSize().height_ : $J.d2i((Math.fround(trackH * (Math.fround(extent / range)))));
    thumbH = Math.max(thumbH, this.getMinimumThumbSize().height_);
    thumbH = Math.min(thumbH, this.getMaximumThumbSize().height_);
    let thumbY = (incrButtonY - this.incrGap - thumbH) | 0;
    if (value < Math.fround(((sb.getMaximum() - sb.getVisibleAmount()) | 0))) {
      let thumbRange = Math.fround(trackH - thumbH);
      thumbY = $J.d2i((Math.fround(0.5 + (Math.fround(thumbRange * (Math.fround((Math.fround(value - min)) / (Math.fround(range - extent)))))))));
      thumbY = (thumbY + (decrButtonY + decrButtonH + this.decrGap)) | 0;
    }
    let sbAvailButtonH = ((sbSize.height_ - sbInsetsH) | 0);
    if (sbAvailButtonH < sbButtonsH) {
      incrButtonH = decrButtonH = $J.idiv(sbAvailButtonH, 2);
      incrButtonY = (sbSize.height_ - (sbInsets.bottom + incrButtonH)) | 0;
    }
    this.decrButton.setBounds$int$int$int$int(itemX, decrButtonY, itemW, decrButtonH);
    this.incrButton.setBounds$int$int$int$int(itemX, incrButtonY, itemW, incrButtonH);
    let itrackY = (decrButtonY + decrButtonH + this.decrGap) | 0;
    let itrackH = (incrButtonY - this.incrGap - itrackY) | 0;
    this.trackRect.setBounds$int$int$int$int(itemX, itrackY, itemW, itrackH);
    if (thumbH >= $J.d2i(trackH)) {
      if (UIManager.getBoolean$Object('ScrollBar.alwaysShowThumb')) {
        this.setThumbBounds(itemX, itrackY, itemW, itrackH);
      } else {
        this.setThumbBounds(0, 0, 0, 0);
      }
    } else {
      if (((thumbY + thumbH) | 0) > ((incrButtonY - this.incrGap) | 0)) {
        thumbY = (incrButtonY - this.incrGap - thumbH) | 0;
      }
      if (thumbY < ((decrButtonY + decrButtonH + this.decrGap) | 0)) {
        thumbY = (decrButtonY + decrButtonH + this.decrGap + 1) | 0;
      }
      this.setThumbBounds(itemX, thumbY, itemW, thumbH);
    }
  }
  /**
   * Lays out a horizontal scroll bar.
   * @param sb the scroll bar
   */
  layoutHScrollbar(sb: JScrollBar): void {
    let sbSize = sb.getSize$();
    let sbInsets = sb.getInsets$();
    let itemH = (sbSize.height_ - (sbInsets.top + sbInsets.bottom)) | 0;
    let itemY = sbInsets.top;
    let ltr = sb.getComponentOrientation().isLeftToRight();
    let squareButtons = DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(this.scrollbar, this, 'ScrollBar.squareButtons', false);
    let leftButtonW = squareButtons ? itemH : this.decrButton.getPreferredSize$().width_;
    let rightButtonW = squareButtons ? itemH : this.incrButton.getPreferredSize$().width_;
    if (!ltr) {
      let temp = leftButtonW;
      leftButtonW = rightButtonW;
      rightButtonW = temp;
    }
    let leftButtonX = sbInsets.left;
    let rightButtonX = (sbSize.width_ - (sbInsets.right + rightButtonW)) | 0;
    let leftGap = ltr ? this.decrGap : this.incrGap;
    let rightGap = ltr ? this.incrGap : this.decrGap;
    let sbInsetsW = (sbInsets.left + sbInsets.right) | 0;
    let sbButtonsW = (leftButtonW + rightButtonW) | 0;
    let trackW = Math.fround((sbSize.width_ - (sbInsetsW + sbButtonsW) - (leftGap + rightGap)) | 0);
    let min = Math.fround(sb.getMinimum());
    let max = Math.fround(sb.getMaximum());
    let extent = Math.fround(sb.getVisibleAmount());
    let range = Math.fround(max - min);
    let value = Math.fround(this.getValue(sb));
    let thumbW = (range <= Math.fround(0)) ? this.getMaximumThumbSize().width_ : $J.d2i((Math.fround(trackW * (Math.fround(extent / range)))));
    thumbW = Math.max(thumbW, this.getMinimumThumbSize().width_);
    thumbW = Math.min(thumbW, this.getMaximumThumbSize().width_);
    let thumbX = ltr ? (rightButtonX - rightGap - thumbW) | 0 : (leftButtonX + leftButtonW + leftGap) | 0;
    if (value < (Math.fround(max - sb.getVisibleAmount()))) {
      let thumbRange = Math.fround(trackW - thumbW);
      if (ltr) {
        thumbX = $J.d2i((Math.fround(0.5 + (Math.fround(thumbRange * (Math.fround((Math.fround(value - min)) / (Math.fround(range - extent)))))))));
      } else {
        thumbX = $J.d2i((Math.fround(0.5 + (Math.fround(thumbRange * (Math.fround((Math.fround(Math.fround(max - extent) - value)) / (Math.fround(range - extent)))))))));
      }
      thumbX = (thumbX + (leftButtonX + leftButtonW + leftGap)) | 0;
    }
    let sbAvailButtonW = ((sbSize.width_ - sbInsetsW) | 0);
    if (sbAvailButtonW < sbButtonsW) {
      rightButtonW = leftButtonW = $J.idiv(sbAvailButtonW, 2);
      rightButtonX = (sbSize.width_ - (sbInsets.right + rightButtonW + rightGap)) | 0;
    }
    (ltr ? this.decrButton : this.incrButton).setBounds$int$int$int$int(leftButtonX, itemY, leftButtonW, itemH);
    (ltr ? this.incrButton : this.decrButton).setBounds$int$int$int$int(rightButtonX, itemY, rightButtonW, itemH);
    let itrackX = (leftButtonX + leftButtonW + leftGap) | 0;
    let itrackW = (rightButtonX - rightGap - itrackX) | 0;
    this.trackRect.setBounds$int$int$int$int(itrackX, itemY, itrackW, itemH);
    if (thumbW >= $J.d2i(trackW)) {
      if (UIManager.getBoolean$Object('ScrollBar.alwaysShowThumb')) {
        this.setThumbBounds(itrackX, itemY, itrackW, itemH);
      } else {
        this.setThumbBounds(0, 0, 0, 0);
      }
    } else {
      if (((thumbX + thumbW) | 0) > ((rightButtonX - rightGap) | 0)) {
        thumbX = (rightButtonX - rightGap - thumbW) | 0;
      }
      if (thumbX < ((leftButtonX + leftButtonW + leftGap) | 0)) {
        thumbX = (leftButtonX + leftButtonW + leftGap + 1) | 0;
      }
      this.setThumbBounds(thumbX, itemY, thumbW, itemH);
    }
  }
  layoutContainer$Container(scrollbarContainer: Container): void {
    if (this.isDragging_) {
      return;
    }
    let scrollbar = scrollbarContainer;
    switch (scrollbar.getOrientation()) {
      case Adjustable.VERTICAL:
        this.layoutVScrollbar(scrollbar);
        break;
      case Adjustable.HORIZONTAL:
        this.layoutHScrollbar(scrollbar);
        break;
    }
  }
  /**
   * Set the bounds of the thumb and force a repaint that includes
   * the old thumbBounds and the new one.
   *
   * @param x set the x location of the thumb
   * @param y set the y location of the thumb
   * @param width set the width of the thumb
   * @param height set the height of the thumb
   * @see #getThumbBounds
   */
  setThumbBounds(x: number, y: number, width: number, height: number): void {
    if ((this.thumbRect.x_ === x) && (this.thumbRect.y_ === y) && (this.thumbRect.width_ === width) && (this.thumbRect.height_ === height)) {
      return;
    }
    let minX = Math.min(x, this.thumbRect.x_);
    let minY = Math.min(y, this.thumbRect.y_);
    let maxX = Math.max((x + width) | 0, (this.thumbRect.x_ + this.thumbRect.width_) | 0);
    let maxY = Math.max((y + height) | 0, (this.thumbRect.y_ + this.thumbRect.height_) | 0);
    this.thumbRect.setBounds$int$int$int$int(x, y, width, height);
    this.scrollbar.repaint$int$int$int$int(minX, minY, (maxX - minX) | 0, (maxY - minY) | 0);
    this.setThumbRollover(false);
  }
  /**
   * Return the current size/location of the thumb.
   * <p>
   * <b>Warning </b>: the value returned by this method should not be
   * be modified, it's a reference to the actual rectangle, not a copy.
   *
   * @return The current size/location of the thumb.
   * @see #setThumbBounds
   */
  getThumbBounds(): Rectangle {
    return this.thumbRect;
  }
  /**
   * Returns the current bounds of the track, i.e. the space in between
   * the increment and decrement buttons, less the insets.  The value
   * returned by this method is updated each time the scrollbar is
   * laid out (validated).
   * <p>
   * <b>Warning </b>: the value returned by this method should not be
   * be modified, it's a reference to the actual rectangle, not a copy.
   *
   * @return the current bounds of the scrollbar track
   * @see #layoutContainer
   */
  getTrackBounds(): Rectangle {
    return this.trackRect;
  }
  static scrollByBlock(scrollbar: JScrollBar, direction: number): void {
    let oldValue = scrollbar.getValue();
    let blockIncrement = scrollbar.getBlockIncrement$int(direction);
    let delta = Math.imul(blockIncrement, ((direction > 0) ? +1 : -1));
    let newValue = (oldValue + delta) | 0;
    if (delta > 0 && newValue < oldValue) {
      newValue = scrollbar.getMaximum();
    } else if (delta < 0 && newValue > oldValue) {
      newValue = scrollbar.getMinimum();
    }
    scrollbar.setValue(newValue);
  }
  /**
   * Scrolls by block.
   * @param direction the direction to scroll
   */
  scrollByBlock(direction: number): void {
    BasicScrollBarUI.scrollByBlock(this.scrollbar, direction);
    this.trackHighlight = direction > 0 ? BasicScrollBarUI.INCREASE_HIGHLIGHT : BasicScrollBarUI.DECREASE_HIGHLIGHT;
    let dirtyRect = this.getTrackBounds();
    this.scrollbar.repaint$int$int$int$int(dirtyRect.x_, dirtyRect.y_, dirtyRect.width_, dirtyRect.height_);
  }
  static scrollByUnits(scrollbar: JScrollBar, direction: number, units: number, limitToBlock: boolean): void {
    let delta: number;
    let limit = -1;
    if (limitToBlock) {
      if (direction < 0) {
        limit = (scrollbar.getValue() - scrollbar.getBlockIncrement$int(direction)) | 0;
      } else {
        limit = (scrollbar.getValue() + scrollbar.getBlockIncrement$int(direction)) | 0;
      }
    }
    for (let i = 0; i < units; i++) {
      if (direction > 0) {
        delta = scrollbar.getUnitIncrement$int(direction);
      } else {
        delta = -scrollbar.getUnitIncrement$int(direction);
      }
      let oldValue = scrollbar.getValue();
      let newValue = (oldValue + delta) | 0;
      if (delta > 0 && newValue < oldValue) {
        newValue = scrollbar.getMaximum();
      } else if (delta < 0 && newValue > oldValue) {
        newValue = scrollbar.getMinimum();
      }
      if (oldValue === newValue) {
        break;
      }
      if (limitToBlock && i > 0) {
        // assert limit != -1
        if ((direction < 0 && newValue < limit) || (direction > 0 && newValue > limit)) {
          break;
        }
      }
      scrollbar.setValue(newValue);
    }
  }
  /**
   * Scrolls by unit.
   * @param direction the direction to scroll
   */
  scrollByUnit(direction: number): void {
    BasicScrollBarUI.scrollByUnits(this.scrollbar, direction, 1, false);
  }
  /**
   * Indicates whether the user can absolutely position the thumb with
   * a mouse gesture (usually the middle mouse button).
   *
   * @return true if a mouse gesture can absolutely position the thumb
   * @since 1.5
   */
  getSupportsAbsolutePositioning(): boolean {
    return this.supportsAbsolutePositioning;
  }
  isMouseLeftOfThumb(): boolean {
    return this.trackListener.currentMouseX < this.getThumbBounds().x_;
  }
  isMouseRightOfThumb(): boolean {
    let tb = this.getThumbBounds();
    return this.trackListener.currentMouseX > ((tb.x_ + tb.width_) | 0);
  }
  isMouseBeforeThumb(): boolean {
    return this.scrollbar.getComponentOrientation().isLeftToRight() ? this.isMouseLeftOfThumb() : this.isMouseRightOfThumb();
  }
  isMouseAfterThumb(): boolean {
    return this.scrollbar.getComponentOrientation().isLeftToRight() ? this.isMouseRightOfThumb() : this.isMouseLeftOfThumb();
  }
  updateButtonDirections(): void {
    let orient = this.scrollbar.getOrientation();
    if (this.scrollbar.getComponentOrientation().isLeftToRight()) {
      if (this.incrButton instanceof BasicArrowButton) {
        (this.incrButton).setDirection(orient === SwingConstants.HORIZONTAL ? SwingConstants.EAST : SwingConstants.SOUTH);
      }
      if (this.decrButton instanceof BasicArrowButton) {
        (this.decrButton).setDirection(orient === SwingConstants.HORIZONTAL ? SwingConstants.WEST : SwingConstants.NORTH);
      }
    } else {
      if (this.incrButton instanceof BasicArrowButton) {
        (this.incrButton).setDirection(orient === SwingConstants.HORIZONTAL ? SwingConstants.WEST : SwingConstants.SOUTH);
      }
      if (this.decrButton instanceof BasicArrowButton) {
        (this.decrButton).setDirection(orient === SwingConstants.HORIZONTAL ? SwingConstants.EAST : SwingConstants.NORTH);
      }
    }
  }
  setDragging(dragging: boolean): void {
    this.isDragging_ = dragging;
    this.scrollbar.repaint$Rectangle(this.getThumbBounds());
  }
}

/**
 * A listener to listen for model changes.
 */
export class BasicScrollBarUI$ModelListener extends JObject {
  /**
   * Constructs a {@code ModelListener}.
   */
  _BasicScrollBarUI$ModelListener(): this {
    return this;
  }
  stateChanged(e: ChangeEvent): void {
    if (!this.$outer.useCachedValue) {
      this.$outer.scrollBarValue = this.$outer.scrollbar.getValue();
    }
    this.$outer.layoutContainer$Container(this.$outer.scrollbar);
    this.$outer.useCachedValue = false;
  }
}

/**
 * Track mouse drags.
 */
export class BasicScrollBarUI$TrackListener extends MouseAdapter {
  /**
   * The offset
   */
  offset: number = 0;
  /**
   * Current mouse x position
   */
  currentMouseX: number = 0;
  /**
   * Current mouse y position
   */
  currentMouseY: number = 0;
  direction: number = 0;
  /**
   * Constructs a {@code TrackListener}.
   */
  _BasicScrollBarUI$TrackListener(): this {
    this._MouseAdapter();
    this.direction = +1;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  mouseReleased(e: MouseEvent): void {
    if (this.$outer.isDragging_) {
      this.$outer.updateThumbState(e.getX(), e.getY());
    }
    if (SwingUtilities.isRightMouseButton(e) || (!this.$outer.getSupportsAbsolutePositioning() && SwingUtilities.isMiddleMouseButton(e))) {
      return;
    }
    if (!this.$outer.scrollbar.isEnabled()) {
      return;
    }
    let r = this.$outer.getTrackBounds();
    this.$outer.scrollbar.repaint$int$int$int$int(r.x_, r.y_, r.width_, r.height_);
    this.$outer.trackHighlight = BasicScrollBarUI.NO_HIGHLIGHT;
    this.$outer.setDragging(false);
    this.offset = 0;
    this.$outer.scrollTimer.stop();
    this.$outer.useCachedValue = true;
    this.$outer.scrollbar.setValueIsAdjusting(false);
  }
  /**
   * If the mouse is pressed above the "thumb" component
   * then reduce the scrollbars value by one page ("page up"),
   * otherwise increase it by one page.  If there is no
   * thumb then page up if the mouse is in the upper half
   * of the track.
   */
  mousePressed(e: MouseEvent): void {
    if (SwingUtilities.isRightMouseButton(e) || (!this.$outer.getSupportsAbsolutePositioning() && SwingUtilities.isMiddleMouseButton(e))) {
      return;
    }
    if (!this.$outer.scrollbar.isEnabled()) {
      return;
    }
    if (!this.$outer.scrollbar.hasFocus() && this.$outer.scrollbar.isRequestFocusEnabled()) {
      this.$outer.scrollbar.requestFocus$Cause(FocusEvent$Cause.MOUSE_EVENT);
    }
    this.$outer.useCachedValue = true;
    this.$outer.scrollbar.setValueIsAdjusting(true);
    this.currentMouseX = e.getX();
    this.currentMouseY = e.getY();
    if (this.$outer.getThumbBounds().contains$int$int(this.currentMouseX, this.currentMouseY)) {
      switch (this.$outer.scrollbar.getOrientation()) {
        case Adjustable.VERTICAL:
          this.offset = (this.currentMouseY - this.$outer.getThumbBounds().y_) | 0;
          break;
        case Adjustable.HORIZONTAL:
          this.offset = (this.currentMouseX - this.$outer.getThumbBounds().x_) | 0;
          break;
      }
      this.$outer.setDragging(true);
      return;
    } else if (this.$outer.getSupportsAbsolutePositioning() && SwingUtilities.isMiddleMouseButton(e)) {
      switch (this.$outer.scrollbar.getOrientation()) {
        case Adjustable.VERTICAL:
          this.offset = $J.idiv(this.$outer.getThumbBounds().height_, 2);
          break;
        case Adjustable.HORIZONTAL:
          this.offset = $J.idiv(this.$outer.getThumbBounds().width_, 2);
          break;
      }
      this.$outer.setDragging(true);
      this.setValueFrom(e);
      return;
    }
    this.$outer.setDragging(false);
    let sbSize = this.$outer.scrollbar.getSize$();
    this.direction = +1;
    switch (this.$outer.scrollbar.getOrientation()) {
      case Adjustable.VERTICAL:
        if (this.$outer.getThumbBounds().isEmpty()) {
          let scrollbarCenter = $J.idiv(sbSize.height_, 2);
          this.direction = (this.currentMouseY < scrollbarCenter) ? -1 : +1;
        } else {
          let thumbY = this.$outer.getThumbBounds().y_;
          this.direction = (this.currentMouseY < thumbY) ? -1 : +1;
        }
        break;
      case Adjustable.HORIZONTAL:
        if (this.$outer.getThumbBounds().isEmpty()) {
          let scrollbarCenter = $J.idiv(sbSize.width_, 2);
          this.direction = (this.currentMouseX < scrollbarCenter) ? -1 : +1;
        } else {
          let thumbX = this.$outer.getThumbBounds().x_;
          this.direction = (this.currentMouseX < thumbX) ? -1 : +1;
        }
        if (!this.$outer.scrollbar.getComponentOrientation().isLeftToRight()) {
          this.direction = -this.direction;
        }
        break;
    }
    this.$outer.scrollByBlock(this.direction);
    this.$outer.scrollTimer.stop();
    this.$outer.scrollListener.setDirection(this.direction);
    this.$outer.scrollListener.setScrollByBlock(true);
    this.startScrollTimerIfNecessary();
  }
  /**
   * Set the models value to the position of the thumb's top of Vertical
   * scrollbar, or the left/right of Horizontal scrollbar in
   * left-to-right/right-to-left scrollbar relative to the origin of the
   * track.
   */
  mouseDragged(e: MouseEvent): void {
    if (SwingUtilities.isRightMouseButton(e) || (!this.$outer.getSupportsAbsolutePositioning() && SwingUtilities.isMiddleMouseButton(e))) {
      return;
    }
    if (!this.$outer.scrollbar.isEnabled() || this.$outer.getThumbBounds().isEmpty()) {
      return;
    }
    if (this.$outer.isDragging_) {
      this.setValueFrom(e);
    } else {
      this.currentMouseX = e.getX();
      this.currentMouseY = e.getY();
      this.$outer.updateThumbState(this.currentMouseX, this.currentMouseY);
      this.startScrollTimerIfNecessary();
    }
  }
  setValueFrom(e: MouseEvent): void {
    let active = this.$outer.isThumbRollover();
    let model = this.$outer.scrollbar.getModel();
    let thumbR = this.$outer.getThumbBounds();
    let trackLength: number;
    let thumbMin: number;
    let thumbMax: number;
    let thumbPos: number;
    if (this.$outer.scrollbar.getOrientation() === Adjustable.VERTICAL) {
      thumbMin = this.$outer.trackRect.y_;
      thumbMax = (this.$outer.trackRect.y_ + this.$outer.trackRect.height_ - thumbR.height_) | 0;
      thumbPos = Math.min(thumbMax, Math.max(thumbMin, ((e.getY() - this.offset) | 0)));
      this.$outer.setThumbBounds(thumbR.x_, thumbPos, thumbR.width_, thumbR.height_);
      trackLength = Math.fround(this.$outer.getTrackBounds().height_);
    } else {
      thumbMin = this.$outer.trackRect.x_;
      thumbMax = (this.$outer.trackRect.x_ + this.$outer.trackRect.width_ - thumbR.width_) | 0;
      thumbPos = Math.min(thumbMax, Math.max(thumbMin, ((e.getX() - this.offset) | 0)));
      this.$outer.setThumbBounds(thumbPos, thumbR.y_, thumbR.width_, thumbR.height_);
      trackLength = Math.fround(this.$outer.getTrackBounds().width_);
    }
    if (thumbPos === thumbMax) {
      if (this.$outer.scrollbar.getOrientation() === Adjustable.VERTICAL || this.$outer.scrollbar.getComponentOrientation().isLeftToRight()) {
        this.$outer.scrollbar.setValue((model.getMaximum() - model.getExtent()) | 0);
      } else {
        this.$outer.scrollbar.setValue(model.getMinimum());
      }
    } else {
      let valueMax = Math.fround((model.getMaximum() - model.getExtent()) | 0);
      let valueRange = Math.fround(valueMax - model.getMinimum());
      let thumbValue = Math.fround((thumbPos - thumbMin) | 0);
      let thumbRange = Math.fround((thumbMax - thumbMin) | 0);
      let value: number;
      if (this.$outer.scrollbar.getOrientation() === Adjustable.VERTICAL || this.$outer.scrollbar.getComponentOrientation().isLeftToRight()) {
        value = $J.d2i((0.5 + (Math.fround((Math.fround(thumbValue / thumbRange)) * valueRange))));
      } else {
        value = $J.d2i((0.5 + (Math.fround((Math.fround(((thumbMax - thumbPos) | 0) / thumbRange)) * valueRange))));
      }
      this.$outer.useCachedValue = true;
      this.$outer.scrollBarValue = (value + model.getMinimum()) | 0;
      this.$outer.scrollbar.setValue(this.adjustValueIfNecessary(this.$outer.scrollBarValue));
    }
    this.$outer.setThumbRollover(active);
  }
  adjustValueIfNecessary(value: number): number {
    if (this.$outer.scrollbar.getParent() instanceof JScrollPane) {
      let scrollpane = this.$outer.scrollbar.getParent();
      let viewport = scrollpane.getViewport();
      let view = viewport.getView();
      if (view instanceof JList) {
        let list = view;
        if (DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(list, list.getUI(), 'List.lockToPositionOnScroll', false)) {
          let adjustedValue = value;
          let mode = list.getLayoutOrientation();
          let orientation = this.$outer.scrollbar.getOrientation();
          if (orientation === Adjustable.VERTICAL && mode === JList.VERTICAL) {
            let index = list.locationToIndex(new Point()._Point$int$int(0, value));
            let rect = list.getCellBounds(index, index);
            if (rect != null) {
              adjustedValue = rect.y_;
            }
          }
          if (orientation === Adjustable.HORIZONTAL && (mode === JList.VERTICAL_WRAP || mode === JList.HORIZONTAL_WRAP)) {
            if (scrollpane.getComponentOrientation().isLeftToRight()) {
              let index = list.locationToIndex(new Point()._Point$int$int(value, 0));
              let rect = list.getCellBounds(index, index);
              if (rect != null) {
                adjustedValue = rect.x_;
              }
            } else {
              let loc = new Point()._Point$int$int(value, 0);
              let extent = viewport.getExtentSize().width_;
              loc.x_ = (loc.x_ + (extent - 1)) | 0;
              let index = list.locationToIndex(loc);
              let rect = list.getCellBounds(index, index);
              if (rect != null) {
                adjustedValue = (rect.x_ + rect.width_ - extent) | 0;
              }
            }
          }
          value = adjustedValue;
        }
      }
    }
    return value;
  }
  startScrollTimerIfNecessary(): void {
    if (this.$outer.scrollTimer.isRunning()) {
      return;
    }
    let tb = this.$outer.getThumbBounds();
    switch (this.$outer.scrollbar.getOrientation()) {
      case Adjustable.VERTICAL:
        if (this.direction > 0) {
          if (((tb.y_ + tb.height_) | 0) < this.$outer.trackListener.currentMouseY) {
            this.$outer.scrollTimer.start();
          }
        } else if (tb.y_ > this.$outer.trackListener.currentMouseY) {
          this.$outer.scrollTimer.start();
        }
        break;
      case Adjustable.HORIZONTAL:
        if ((this.direction > 0 && this.$outer.isMouseAfterThumb()) || (this.direction < 0 && this.$outer.isMouseBeforeThumb())) {
          this.$outer.scrollTimer.start();
        }
        break;
    }
  }
  /**
   * {@inheritDoc}
   */
  mouseMoved(e: MouseEvent): void {
    if (!this.$outer.isDragging_) {
      this.$outer.updateThumbState(e.getX(), e.getY());
    }
  }
  /**
   * Invoked when the mouse exits the scrollbar.
   *
   * @param e MouseEvent further describing the event
   * @since 1.5
   */
  mouseExited(e: MouseEvent): void {
    if (!this.$outer.isDragging_) {
      this.$outer.setThumbRollover(false);
    }
  }
}

/**
 * Listener for cursor keys.
 */
export class BasicScrollBarUI$ArrowButtonListener extends MouseAdapter {
  handledEvent: boolean = false;
  /**
   * Constructs an {@code ArrowButtonListener}.
   */
  _BasicScrollBarUI$ArrowButtonListener(): this {
    this._MouseAdapter();
    return this;
  }
  mousePressed(e: MouseEvent): void {
    if (!this.$outer.scrollbar.isEnabled()) {
      return;
    }
    if (!SwingUtilities.isLeftMouseButton(e)) {
      return;
    }
    let direction = (e.getSource() === this.$outer.incrButton) ? 1 : -1;
    this.$outer.scrollByUnit(direction);
    this.$outer.scrollTimer.stop();
    this.$outer.scrollListener.setDirection(direction);
    this.$outer.scrollListener.setScrollByBlock(false);
    this.$outer.scrollTimer.start();
    this.handledEvent = true;
    if (!this.$outer.scrollbar.hasFocus() && this.$outer.scrollbar.isRequestFocusEnabled()) {
      this.$outer.scrollbar.requestFocus$Cause(FocusEvent$Cause.MOUSE_EVENT);
    }
  }
  mouseReleased(e: MouseEvent): void {
    this.$outer.scrollTimer.stop();
    this.handledEvent = false;
    this.$outer.scrollbar.setValueIsAdjusting(false);
  }
}

/**
 * Listener for scrolling events initiated in the
 * <code>ScrollPane</code>.
 */
export class BasicScrollBarUI$ScrollListener extends JObject {
  direction: number = 0;
  useBlockIncrement: boolean = false;
  $init_BasicScrollBarUI_ScrollListener() {
    this.direction = +1;
  }
  /**
   * Constructs a {@code ScrollListener}.
   */
  _BasicScrollBarUI$ScrollListener$(): this {
    this.$init_BasicScrollBarUI_ScrollListener();
    this.direction = +1;
    this.useBlockIncrement = false;
    return this;
  }
  /**
   * Sets the direction.
   * @param direction the new direction
   */
  setDirection(direction: number): void {
    this.direction = direction;
  }
  /**
   * Sets the scrolling by block
   * @param block whether or not to scroll by block
   */
  setScrollByBlock(block: boolean): void {
    this.useBlockIncrement = block;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(e: ActionEvent): void {
    if (this.useBlockIncrement) {
      this.$outer.scrollByBlock(this.direction);
      if (this.$outer.scrollbar.getOrientation() === Adjustable.VERTICAL) {
        if (this.direction > 0) {
          if (((this.$outer.getThumbBounds().y_ + this.$outer.getThumbBounds().height_) | 0) >= this.$outer.trackListener.currentMouseY) {
            (e.getSource()).stop();
          }
        } else if (this.$outer.getThumbBounds().y_ <= this.$outer.trackListener.currentMouseY) {
          (e.getSource()).stop();
        }
      } else {
        if ((this.direction > 0 && !this.$outer.isMouseAfterThumb()) || (this.direction < 0 && !this.$outer.isMouseBeforeThumb())) {
          (e.getSource()).stop();
        }
      }
    } else {
      this.$outer.scrollByUnit(this.direction);
    }
    if (this.direction > 0 && ((this.$outer.scrollbar.getValue() + this.$outer.scrollbar.getVisibleAmount()) | 0) >= this.$outer.scrollbar.getMaximum()) {
      (e.getSource()).stop();
    } else if (this.direction < 0 && this.$outer.scrollbar.getValue() <= this.$outer.scrollbar.getMinimum()) {
      (e.getSource()).stop();
    }
  }
}

/**
 * Property change handler
 */
export class BasicScrollBarUI$PropertyChangeHandler extends JObject {
  /**
   * Constructs a {@code PropertyChangeHandler}.
   */
  _BasicScrollBarUI$PropertyChangeHandler(): this {
    return this;
  }
  /**
   * {@inheritDoc}
   */
  propertyChange(e: PropertyChangeEvent): void {
    this.$outer.getHandler().propertyChange(e);
  }
}

/**
 * Used for scrolling the scrollbar.
 */
export class BasicScrollBarUI$Actions extends UIAction {
  static readonly POSITIVE_UNIT_INCREMENT: string = 'positiveUnitIncrement';
  static readonly POSITIVE_BLOCK_INCREMENT: string = 'positiveBlockIncrement';
  static readonly NEGATIVE_UNIT_INCREMENT: string = 'negativeUnitIncrement';
  static readonly NEGATIVE_BLOCK_INCREMENT: string = 'negativeBlockIncrement';
  static readonly MIN_SCROLL: string = 'minScroll';
  static readonly MAX_SCROLL: string = 'maxScroll';
  _BasicScrollBarUI$Actions(name: string): this {
    this._UIAction(name);
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    let scrollBar = e.getSource();
    let key = this.getName();
    if (key === BasicScrollBarUI$Actions.POSITIVE_UNIT_INCREMENT) {
      this.scroll(scrollBar, BasicScrollBarUI.POSITIVE_SCROLL, false);
    } else if (key === BasicScrollBarUI$Actions.POSITIVE_BLOCK_INCREMENT) {
      this.scroll(scrollBar, BasicScrollBarUI.POSITIVE_SCROLL, true);
    } else if (key === BasicScrollBarUI$Actions.NEGATIVE_UNIT_INCREMENT) {
      this.scroll(scrollBar, BasicScrollBarUI.NEGATIVE_SCROLL, false);
    } else if (key === BasicScrollBarUI$Actions.NEGATIVE_BLOCK_INCREMENT) {
      this.scroll(scrollBar, BasicScrollBarUI.NEGATIVE_SCROLL, true);
    } else if (key === BasicScrollBarUI$Actions.MIN_SCROLL) {
      this.scroll(scrollBar, BasicScrollBarUI.MIN_SCROLL, true);
    } else if (key === BasicScrollBarUI$Actions.MAX_SCROLL) {
      this.scroll(scrollBar, BasicScrollBarUI.MAX_SCROLL, true);
    }
  }
  scroll(scrollBar: JScrollBar, dir: number, block: boolean): void {
    if (dir === BasicScrollBarUI.NEGATIVE_SCROLL || dir === BasicScrollBarUI.POSITIVE_SCROLL) {
      let amount: number;
      if (block) {
        if (dir === BasicScrollBarUI.NEGATIVE_SCROLL) {
          amount = Math.imul(-1, scrollBar.getBlockIncrement$int(-1));
        } else {
          amount = scrollBar.getBlockIncrement$int(1);
        }
      } else {
        if (dir === BasicScrollBarUI.NEGATIVE_SCROLL) {
          amount = Math.imul(-1, scrollBar.getUnitIncrement$int(-1));
        } else {
          amount = scrollBar.getUnitIncrement$int(1);
        }
      }
      scrollBar.setValue((scrollBar.getValue() + amount) | 0);
    } else if (dir === BasicScrollBarUI.MIN_SCROLL) {
      scrollBar.setValue(scrollBar.getMinimum());
    } else if (dir === BasicScrollBarUI.MAX_SCROLL) {
      scrollBar.setValue(scrollBar.getMaximum());
    }
  }
}

export class BasicScrollBarUI$Handler extends JObject {
  _BasicScrollBarUI$Handler(): this {
    return this;
  }
  focusGained(e: FocusEvent): void {
    this.$outer.scrollbar.repaint$();
  }
  focusLost(e: FocusEvent): void {
    this.$outer.scrollbar.repaint$();
  }
  propertyChange(e: PropertyChangeEvent): void {
    let propertyName = e.getPropertyName();
    if ('model' === propertyName) {
      let oldModel = e.getOldValue();
      let newModel = e.getNewValue();
      oldModel.removeChangeListener($J.fn(this.$outer.modelListener, 'stateChanged'));
      newModel.addChangeListener($J.fn(this.$outer.modelListener, 'stateChanged'));
      this.$outer.scrollBarValue = this.$outer.scrollbar.getValue();
      this.$outer.scrollbar.repaint$();
      this.$outer.scrollbar.revalidate();
    } else if ('orientation' === propertyName) {
      this.$outer.updateButtonDirections();
    } else if ('componentOrientation' === propertyName) {
      this.$outer.updateButtonDirections();
      let inputMap = this.$outer.getInputMap(JComponent.WHEN_FOCUSED);
      SwingUtilities.replaceUIInputMap(this.$outer.scrollbar, JComponent.WHEN_FOCUSED, inputMap);
    }
  }
}

$J.define(BasicScrollBarUI, 'javax.swing.plaf.basic.BasicScrollBarUI', { kind: 'class', ifaces: ['java.awt.LayoutManager', 'javax.swing.SwingConstants'], sup: 'javax.swing.plaf.ScrollBarUI', ctors: { '': '_BasicScrollBarUI' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component', 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent' } });
$J.define(BasicScrollBarUI$ModelListener, 'javax.swing.plaf.basic.BasicScrollBarUI$ModelListener', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener'], sup: 'java.lang.Object', ctors: { '': '_BasicScrollBarUI$ModelListener' }, inner: true });
$J.define(BasicScrollBarUI$TrackListener, 'javax.swing.plaf.basic.BasicScrollBarUI$TrackListener', { kind: 'class', ifaces: ['java.awt.event.MouseMotionListener'], sup: 'java.awt.event.MouseAdapter', ctors: { '': '_BasicScrollBarUI$TrackListener' }, inner: true });
$J.define(BasicScrollBarUI$ArrowButtonListener, 'javax.swing.plaf.basic.BasicScrollBarUI$ArrowButtonListener', { kind: 'class', sup: 'java.awt.event.MouseAdapter', ctors: { '': '_BasicScrollBarUI$ArrowButtonListener' }, inner: true });
$J.define(BasicScrollBarUI$ScrollListener, 'javax.swing.plaf.basic.BasicScrollBarUI$ScrollListener', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'java.lang.Object', ctors: { 'int,boolean': '_BasicScrollBarUI$ScrollListener$int$boolean', '': '_BasicScrollBarUI$ScrollListener$' }, inner: true });
$J.define(BasicScrollBarUI$PropertyChangeHandler, 'javax.swing.plaf.basic.BasicScrollBarUI$PropertyChangeHandler', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_BasicScrollBarUI$PropertyChangeHandler' }, inner: true });
$J.define(BasicScrollBarUI$Actions, 'javax.swing.plaf.basic.BasicScrollBarUI$Actions', { kind: 'class', sup: 'sun.swing.UIAction', ctors: { 'java.lang.String': '_BasicScrollBarUI$Actions' } });
$J.define(BasicScrollBarUI$Handler, 'javax.swing.plaf.basic.BasicScrollBarUI$Handler', { kind: 'class', ifaces: ['java.awt.event.FocusListener', 'java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_BasicScrollBarUI$Handler' }, inner: true });
$J.module(() => {
  Adjustable = $J.load('java.awt.Adjustable');
  Dimension = $J.load('java.awt.Dimension');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  FocusEvent$Cause = $J.load('java.awt.event.FocusEvent$Cause');
  JComponent = $J.load('javax.swing.JComponent');
  JList = $J.load('javax.swing.JList');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  Timer = $J.load('javax.swing.Timer');
  UIManager = $J.load('javax.swing.UIManager');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicArrowButton = $J.load('javax.swing.plaf.basic.BasicArrowButton');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
