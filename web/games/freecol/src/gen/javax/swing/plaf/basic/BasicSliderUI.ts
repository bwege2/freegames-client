// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicSliderUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2020, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, Toolkit } from '../../../../../jre/index.ts';
import { SliderUI } from '../SliderUI.ts';
import { MouseInputAdapter } from '../../event/MouseInputAdapter.ts';
import { UIAction } from '../../../../sun/swing/UIAction.ts';

let Color, Component$BaselineResizeBehavior, Dimension, IllegalComponentStateException, Polygon, Rectangle, FocusEvent$Cause, ImageIcon, JComponent, JLabel, LookAndFeel, SwingConstants, SwingUtilities, Timer, UIManager, InsetsUIResource, BasicGraphicsUtils, BasicLookAndFeel, LazyActionMap, DefaultLookup, SwingUtilities2;

/**
 * A Basic L&amp;F implementation of SliderUI.
 *
 * @author Tom Santos
 */
export class BasicSliderUI extends SliderUI {
  static SHARED_ACTION: BasicSliderUI$Actions = null;
  /**
   * Positive scroll
   */
  static readonly POSITIVE_SCROLL: number = 1;
  /**
   * Negative scroll
   */
  static readonly NEGATIVE_SCROLL: number = -1;
  /**
   * Minimum scroll
   */
  static readonly MIN_SCROLL: number = -2;
  /**
   * Maximum scroll
   */
  static readonly MAX_SCROLL: number = 2;
  /**
   * Scroll timer
   */
  scrollTimer: Timer = null;
  /**
   * Slider
   */
  slider: JSlider = null;
  /**
   * Focus insets
   */
  focusInsets: Insets = null;
  /**
   * Inset cache
   */
  insetCache: Insets = null;
  /**
   * Left-to-right cache
   */
  leftToRightCache: boolean = false;
  /**
   * Focus rectangle
   */
  focusRect: Rectangle = null;
  /**
   * Content rectangle
   */
  contentRect: Rectangle = null;
  /**
   * Label rectangle
   */
  labelRect: Rectangle = null;
  /**
   * Tick rectangle
   */
  tickRect: Rectangle = null;
  /**
   * Track rectangle
   */
  trackRect: Rectangle = null;
  /**
   * Thumb rectangle
   */
  thumbRect: Rectangle = null;
  /**
   * The distance that the track is from the side of the control
   */
  trackBuffer: number = 0;
  isDragging_: boolean = false;
  /**
   * Track listener
   */
  trackListener: BasicSliderUI$TrackListener = null;
  /**
   * Change listener
   */
  changeListener: ChangeListener = null;
  /**
   * Component listener
   */
  componentListener: ComponentListener = null;
  /**
   * Focus listener
   */
  focusListener: FocusListener = null;
  /**
   * Scroll listener
   */
  scrollListener: BasicSliderUI$ScrollListener = null;
  /**
   * Property change listener
   */
  propertyChangeListener: PropertyChangeListener = null;
  handler: BasicSliderUI$Handler = null;
  lastValue: number = 0;
  shadowColor: Color = null;
  highlightColor: Color = null;
  focusColor: Color = null;
  /**
   * Whether or not sameLabelBaselines is up to date.
   */
  checkedLabelBaselines: boolean = false;
  /**
   * Whether or not all the entries in the labeltable have the same
   * baseline.
   */
  sameLabelBaselines: boolean = false;
  static unionRect: Rectangle = null;
  $init_BasicSliderUI() {
    this.focusInsets = null;
    this.insetCache = null;
    this.leftToRightCache = true;
    this.focusRect = null;
    this.contentRect = null;
    this.labelRect = null;
    this.tickRect = null;
    this.trackRect = null;
    this.thumbRect = null;
    this.trackBuffer = 0;
  }
  /**
   * Constructs a {@code BasicSliderUI}.
   */
  _BasicSliderUI$(): this {
    this._SliderUI();
    this.$init_BasicSliderUI();
    return this;
  }
  /**
   * Constructs a {@code BasicSliderUI}.
   * @param b a slider
   */
  _BasicSliderUI$JSlider(b: JSlider): this {
    this._SliderUI();
    this.$init_BasicSliderUI();
    return this;
  }
  /**
   * Returns the shadow color.
   * @return the shadow color
   */
  getShadowColor(): Color {
    return this.shadowColor;
  }
  /**
   * Returns the highlight color.
   * @return the highlight color
   */
  getHighlightColor(): Color {
    return this.highlightColor;
  }
  /**
   * Returns the focus color.
   * @return the focus color
   */
  getFocusColor(): Color {
    return this.focusColor;
  }
  /**
   * Creates a UI.
   * @param b a component
   * @return a UI
   */
  static createUI(b: JComponent): ComponentUI {
    return new BasicSliderUI()._BasicSliderUI$JSlider(b);
  }
  /**
   * Installs a UI.
   * @param c a component
   */
  installUI(c: JComponent): void {
    this.slider = c;
    this.checkedLabelBaselines = false;
    this.slider.setEnabled(this.slider.isEnabled());
    LookAndFeel.installProperty(this.slider, 'opaque', true);
    this.isDragging_ = false;
    this.trackListener = this.createTrackListener(this.slider);
    this.changeListener = this.createChangeListener(this.slider);
    this.componentListener = this.createComponentListener(this.slider);
    this.focusListener = this.createFocusListener(this.slider);
    this.scrollListener = this.createScrollListener(this.slider);
    this.propertyChangeListener = this.createPropertyChangeListener(this.slider);
    this.installDefaults(this.slider);
    this.installListeners(this.slider);
    this.installKeyboardActions(this.slider);
    this.scrollTimer = new Timer()._Timer(100, $J.fn(this.scrollListener, 'actionPerformed'));
    this.scrollTimer.setInitialDelay(300);
    this.insetCache = this.slider.getInsets$();
    this.leftToRightCache = BasicGraphicsUtils.isLeftToRight(this.slider);
    this.focusRect = new Rectangle()._Rectangle$();
    this.contentRect = new Rectangle()._Rectangle$();
    this.labelRect = new Rectangle()._Rectangle$();
    this.tickRect = new Rectangle()._Rectangle$();
    this.trackRect = new Rectangle()._Rectangle$();
    this.thumbRect = new Rectangle()._Rectangle$();
    this.lastValue = this.slider.getValue();
    this.calculateGeometry();
  }
  /**
   * Uninstalls a UI.
   * @param c a component
   */
  uninstallUI(c: JComponent): void {
    if (c !== this.slider) {
      throw new IllegalComponentStateException()._IllegalComponentStateException$String($J.str(this) + ' was asked to deinstall() ' + $J.str(c) + ' when it only knows about ' + $J.str(this.slider) + '.');
    }
    this.scrollTimer.stop();
    this.scrollTimer = null;
    this.uninstallDefaults(this.slider);
    this.uninstallListeners(this.slider);
    this.uninstallKeyboardActions(this.slider);
    this.insetCache = null;
    this.leftToRightCache = true;
    this.focusRect = null;
    this.contentRect = null;
    this.labelRect = null;
    this.tickRect = null;
    this.trackRect = null;
    this.thumbRect = null;
    this.trackListener = null;
    this.changeListener = null;
    this.componentListener = null;
    this.focusListener = null;
    this.scrollListener = null;
    this.propertyChangeListener = null;
    this.slider = null;
  }
  /**
   * Installs the defaults.
   * @param slider a slider
   */
  installDefaults(slider: JSlider): void {
    LookAndFeel.installBorder(slider, 'Slider.border');
    LookAndFeel.installColorsAndFont(slider, 'Slider.background', 'Slider.foreground', 'Slider.font');
    this.highlightColor = UIManager.getColor$Object('Slider.highlight');
    this.shadowColor = UIManager.getColor$Object('Slider.shadow');
    this.focusColor = UIManager.getColor$Object('Slider.focus');
    this.focusInsets = UIManager.get$Object('Slider.focusInsets');
    if (this.focusInsets == null) {
      this.focusInsets = new InsetsUIResource()._InsetsUIResource(2, 2, 2, 2);
    }
  }
  /**
   * Uninstalls the defaults.
   * @param slider a slider
   */
  uninstallDefaults(slider: JSlider): void {
    LookAndFeel.uninstallBorder(slider);
    this.focusInsets = null;
  }
  /**
   * Creates a track listener.
   * @return a track listener
   * @param slider a slider
   */
  createTrackListener(slider: JSlider): BasicSliderUI$TrackListener {
    return new BasicSliderUI$TrackListener().$o(this)._BasicSliderUI$TrackListener();
  }
  /**
   * Creates a change listener.
   * @return a change listener
   * @param slider a slider
   */
  createChangeListener(slider: JSlider): ChangeListener {
    return $J.fn(this.getHandler(), 'stateChanged');
  }
  /**
   * Creates a composite listener.
   * @return a composite listener
   * @param slider a slider
   */
  createComponentListener(slider: JSlider): ComponentListener {
    return this.getHandler();
  }
  /**
   * Creates a focus listener.
   * @return a focus listener
   * @param slider a slider
   */
  createFocusListener(slider: JSlider): FocusListener {
    return this.getHandler();
  }
  /**
   * Creates a scroll listener.
   * @return a scroll listener
   * @param slider a slider
   */
  createScrollListener(slider: JSlider): BasicSliderUI$ScrollListener {
    return new BasicSliderUI$ScrollListener().$o(this)._BasicSliderUI$ScrollListener$();
  }
  /**
   * Creates a property change listener.
   * @return a property change listener
   * @param slider a slider
   */
  createPropertyChangeListener(slider: JSlider): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
  getHandler(): BasicSliderUI$Handler {
    if (this.handler == null) {
      this.handler = new BasicSliderUI$Handler().$o(this)._BasicSliderUI$Handler();
    }
    return this.handler;
  }
  /**
   * Installs listeners.
   * @param slider a slider
   */
  installListeners(slider: JSlider): void {
    slider.addMouseListener(this.trackListener);
    slider.addMouseMotionListener(this.trackListener);
    slider.addFocusListener(this.focusListener);
    slider.addComponentListener(this.componentListener);
    slider.addPropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    slider.getModel().addChangeListener(this.changeListener);
  }
  /**
   * Uninstalls listeners.
   * @param slider a slider
   */
  uninstallListeners(slider: JSlider): void {
    slider.removeMouseListener(this.trackListener);
    slider.removeMouseMotionListener(this.trackListener);
    slider.removeFocusListener(this.focusListener);
    slider.removeComponentListener(this.componentListener);
    slider.removePropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    slider.getModel().removeChangeListener(this.changeListener);
    this.handler = null;
  }
  /**
   * Installs keyboard actions.
   * @param slider a slider
   */
  installKeyboardActions(slider: JSlider): void {
    let km = this.getInputMap(JComponent.WHEN_FOCUSED, slider);
    SwingUtilities.replaceUIInputMap(slider, JComponent.WHEN_FOCUSED, km);
    LazyActionMap.installLazyActionMap(slider, $J.cls(BasicSliderUI), 'Slider.actionMap');
  }
  getInputMap(condition: number, slider: JSlider): InputMap {
    if (condition === JComponent.WHEN_FOCUSED) {
      let keyMap = DefaultLookup.get(slider, this, 'Slider.focusInputMap');
      let rtlKeyMap: InputMap;
      if (slider.getComponentOrientation().isLeftToRight() || ((rtlKeyMap = DefaultLookup.get(slider, this, 'Slider.focusInputMap.RightToLeft')) == null)) {
        return keyMap;
      } else {
        rtlKeyMap.setParent(keyMap);
        return rtlKeyMap;
      }
    }
    return null;
  }
  /**
   * Populates ComboBox's actions.
   */
  static loadActionMap(map: LazyActionMap): void {
    map.put$Action(new BasicSliderUI$Actions()._BasicSliderUI$Actions$String(BasicSliderUI$Actions.POSITIVE_UNIT_INCREMENT));
    map.put$Action(new BasicSliderUI$Actions()._BasicSliderUI$Actions$String(BasicSliderUI$Actions.POSITIVE_BLOCK_INCREMENT));
    map.put$Action(new BasicSliderUI$Actions()._BasicSliderUI$Actions$String(BasicSliderUI$Actions.NEGATIVE_UNIT_INCREMENT));
    map.put$Action(new BasicSliderUI$Actions()._BasicSliderUI$Actions$String(BasicSliderUI$Actions.NEGATIVE_BLOCK_INCREMENT));
    map.put$Action(new BasicSliderUI$Actions()._BasicSliderUI$Actions$String(BasicSliderUI$Actions.MIN_SCROLL_INCREMENT));
    map.put$Action(new BasicSliderUI$Actions()._BasicSliderUI$Actions$String(BasicSliderUI$Actions.MAX_SCROLL_INCREMENT));
  }
  /**
   * Uninstalls keyboard actions.
   * @param slider a slider
   */
  uninstallKeyboardActions(slider: JSlider): void {
    SwingUtilities.replaceUIActionMap(slider, null);
    SwingUtilities.replaceUIInputMap(slider, JComponent.WHEN_FOCUSED, null);
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
    if (this.slider.getPaintLabels() && this.labelsHaveSameBaselines()) {
      let metrics = this.slider.getFontMetrics(this.slider.getFont());
      let insets = this.slider.getInsets$();
      let thumbSize = this.getThumbSize();
      if (this.slider.getOrientation() === SwingConstants.HORIZONTAL) {
        let tickLength = this.getTickLength();
        let contentHeight = (height - insets.top - insets.bottom - this.focusInsets.top - this.focusInsets.bottom) | 0;
        let thumbHeight = thumbSize.height_;
        let centerSpacing = thumbHeight;
        if (this.slider.getPaintTicks()) {
          centerSpacing = (centerSpacing + tickLength) | 0;
        }
        centerSpacing = (centerSpacing + this.getHeightOfTallestLabel()) | 0;
        let trackY = (insets.top + this.focusInsets.top + $J.idiv(((contentHeight - centerSpacing - 1) | 0), 2)) | 0;
        let trackHeight = thumbHeight;
        let tickY = (trackY + trackHeight) | 0;
        let tickHeight = tickLength;
        if (!this.slider.getPaintTicks()) {
          tickHeight = 0;
        }
        let labelY = (tickY + tickHeight) | 0;
        return (labelY + metrics.getAscent()) | 0;
      } else {
        let inverted = this.slider.getInverted();
        let value = inverted ? this.getLowestValue() : this.getHighestValue();
        if (value != null) {
          let thumbHeight = thumbSize.height_;
          let trackBuffer = Math.max($J.idiv(metrics.getHeight(), 2), $J.idiv(thumbHeight, 2));
          let contentY = (this.focusInsets.top + insets.top) | 0;
          let trackY = (contentY + trackBuffer) | 0;
          let trackHeight = (height - this.focusInsets.top - this.focusInsets.bottom - insets.top - insets.bottom - trackBuffer - trackBuffer) | 0;
          let yPosition = this.yPositionForValue$int$int$int(value, trackY, trackHeight);
          return (yPosition - $J.idiv(metrics.getHeight(), 2) + metrics.getAscent()) | 0;
        }
      }
    }
    return 0;
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
    return Component$BaselineResizeBehavior.OTHER;
  }
  /**
   * Returns true if all the labels from the label table have the same
   * baseline.
   *
   * @return true if all the labels from the label table have the
   *         same baseline
   * @since 1.6
   */
  labelsHaveSameBaselines(): boolean {
    if (!this.checkedLabelBaselines) {
      this.checkedLabelBaselines = true;
      let dictionary = this.slider.getLabelTable();
      if (dictionary != null) {
        this.sameLabelBaselines = true;
        let elements = dictionary.elements();
        let baseline = -1;
        while (elements.hasMoreElements()) {
          let label = elements.nextElement();
          let pref = label.getPreferredSize$();
          let labelBaseline = label.getBaseline(pref.width_, pref.height_);
          if (labelBaseline >= 0) {
            if (baseline === -1) {
              baseline = labelBaseline;
            } else if (baseline !== labelBaseline) {
              this.sameLabelBaselines = false;
              break;
            }
          } else {
            this.sameLabelBaselines = false;
            break;
          }
        }
      } else {
        this.sameLabelBaselines = false;
      }
    }
    return this.sameLabelBaselines;
  }
  /**
   * Returns the preferred horizontal size.
   * @return the preferred horizontal size
   */
  getPreferredHorizontalSize(): Dimension {
    let horizDim = DefaultLookup.get(this.slider, this, 'Slider.horizontalSize');
    if (horizDim == null) {
      horizDim = new Dimension()._Dimension$int$int(200, 21);
    }
    return horizDim;
  }
  /**
   * Returns the preferred vertical size.
   * @return the preferred vertical size
   */
  getPreferredVerticalSize(): Dimension {
    let vertDim = DefaultLookup.get(this.slider, this, 'Slider.verticalSize');
    if (vertDim == null) {
      vertDim = new Dimension()._Dimension$int$int(21, 200);
    }
    return vertDim;
  }
  /**
   * Returns the minimum horizontal size.
   * @return the minimum horizontal size
   */
  getMinimumHorizontalSize(): Dimension {
    let minHorizDim = DefaultLookup.get(this.slider, this, 'Slider.minimumHorizontalSize');
    if (minHorizDim == null) {
      minHorizDim = new Dimension()._Dimension$int$int(36, 21);
    }
    return minHorizDim;
  }
  /**
   * Returns the minimum vertical size.
   * @return the minimum vertical size
   */
  getMinimumVerticalSize(): Dimension {
    let minVertDim = DefaultLookup.get(this.slider, this, 'Slider.minimumVerticalSize');
    if (minVertDim == null) {
      minVertDim = new Dimension()._Dimension$int$int(21, 36);
    }
    return minVertDim;
  }
  /**
   * Returns the preferred size.
   * @param c a component
   * @return the preferred size
   */
  getPreferredSize$JComponent(c: JComponent): Dimension {
    this.recalculateIfInsetsChanged();
    let d: Dimension;
    if (this.slider.getOrientation() === SwingConstants.VERTICAL) {
      d = new Dimension()._Dimension$Dimension(this.getPreferredVerticalSize());
      d.width_ = (this.insetCache.left + this.insetCache.right) | 0;
      d.width_ = (d.width_ + (this.focusInsets.left + this.focusInsets.right)) | 0;
      d.width_ = (d.width_ + (this.trackRect.width_ + this.tickRect.width_ + this.labelRect.width_)) | 0;
    } else {
      d = new Dimension()._Dimension$Dimension(this.getPreferredHorizontalSize());
      d.height_ = (this.insetCache.top + this.insetCache.bottom) | 0;
      d.height_ = (d.height_ + (this.focusInsets.top + this.focusInsets.bottom)) | 0;
      d.height_ = (d.height_ + (this.trackRect.height_ + this.tickRect.height_ + this.labelRect.height_)) | 0;
    }
    return d;
  }
  /**
   * Returns the minimum size.
   * @param c a component
   * @return the minimum size
   */
  getMinimumSize(c: JComponent): Dimension {
    this.recalculateIfInsetsChanged();
    let d: Dimension;
    if (this.slider.getOrientation() === SwingConstants.VERTICAL) {
      d = new Dimension()._Dimension$Dimension(this.getMinimumVerticalSize());
      d.width_ = (this.insetCache.left + this.insetCache.right) | 0;
      d.width_ = (d.width_ + (this.focusInsets.left + this.focusInsets.right)) | 0;
      d.width_ = (d.width_ + (this.trackRect.width_ + this.tickRect.width_ + this.labelRect.width_)) | 0;
    } else {
      d = new Dimension()._Dimension$Dimension(this.getMinimumHorizontalSize());
      d.height_ = (this.insetCache.top + this.insetCache.bottom) | 0;
      d.height_ = (d.height_ + (this.focusInsets.top + this.focusInsets.bottom)) | 0;
      d.height_ = (d.height_ + (this.trackRect.height_ + this.tickRect.height_ + this.labelRect.height_)) | 0;
    }
    return d;
  }
  /**
   * Returns the maximum size.
   * @param c a component
   * @return the maximum size
   */
  getMaximumSize(c: JComponent): Dimension {
    let d = this.getPreferredSize$JComponent(c);
    if (this.slider.getOrientation() === SwingConstants.VERTICAL) {
      d.height_ = 32767;
    } else {
      d.width_ = 32767;
    }
    return d;
  }
  /**
   * Calculates the geometry.
   */
  calculateGeometry(): void {
    this.calculateFocusRect();
    this.calculateContentRect();
    this.calculateThumbSize();
    this.calculateTrackBuffer();
    this.calculateTrackRect();
    this.calculateTickRect();
    this.calculateLabelRect();
    this.calculateThumbLocation();
  }
  /**
   * Calculates the focus rectangle.
   */
  calculateFocusRect(): void {
    this.focusRect.x_ = this.insetCache.left;
    this.focusRect.y_ = this.insetCache.top;
    this.focusRect.width_ = (this.slider.getWidth() - (this.insetCache.left + this.insetCache.right)) | 0;
    this.focusRect.height_ = (this.slider.getHeight() - (this.insetCache.top + this.insetCache.bottom)) | 0;
  }
  /**
   * Calculates the thumb size rectangle.
   */
  calculateThumbSize(): void {
    let size = this.getThumbSize();
    this.thumbRect.setSize$int$int(size.width_, size.height_);
  }
  /**
   * Calculates the content rectangle.
   */
  calculateContentRect(): void {
    this.contentRect.x_ = (this.focusRect.x_ + this.focusInsets.left) | 0;
    this.contentRect.y_ = (this.focusRect.y_ + this.focusInsets.top) | 0;
    this.contentRect.width_ = (this.focusRect.width_ - (this.focusInsets.left + this.focusInsets.right)) | 0;
    this.contentRect.height_ = (this.focusRect.height_ - (this.focusInsets.top + this.focusInsets.bottom)) | 0;
  }
  getTickSpacing(): number {
    let majorTickSpacing = this.slider.getMajorTickSpacing();
    let minorTickSpacing = this.slider.getMinorTickSpacing();
    let result: number;
    if (minorTickSpacing > 0) {
      result = minorTickSpacing;
    } else if (majorTickSpacing > 0) {
      result = majorTickSpacing;
    } else {
      result = 0;
    }
    return result;
  }
  /**
   * Calculates the thumb location.
   */
  calculateThumbLocation(): void {
    if (this.slider.getSnapToTicks()) {
      let sliderValue = this.slider.getValue();
      let snappedValue = sliderValue;
      let tickSpacing = this.getTickSpacing();
      if (tickSpacing !== 0) {
        if (((sliderValue - this.slider.getMinimum()) | 0) % tickSpacing !== 0) {
          let temp = Math.fround(Math.fround(((sliderValue - this.slider.getMinimum()) | 0)) / Math.fround(tickSpacing));
          let whichTick = $J.roundf(temp);
          if (Math.fround(temp - $J.d2i(temp)) === 0.5 && sliderValue < this.lastValue) {
            whichTick--;
          }
          snappedValue = (this.slider.getMinimum() + (Math.imul(whichTick, tickSpacing))) | 0;
        }
        if (snappedValue !== sliderValue) {
          this.slider.setValue(snappedValue);
        }
      }
    }
    if (this.slider.getOrientation() === SwingConstants.HORIZONTAL) {
      let valuePosition = this.xPositionForValue(this.slider.getValue());
      this.thumbRect.x_ = (valuePosition - ($J.idiv(this.thumbRect.width_, 2))) | 0;
      this.thumbRect.y_ = this.trackRect.y_;
    } else {
      let valuePosition = this.yPositionForValue$int(this.slider.getValue());
      this.thumbRect.x_ = this.trackRect.x_;
      this.thumbRect.y_ = (valuePosition - ($J.idiv(this.thumbRect.height_, 2))) | 0;
    }
  }
  /**
   * Calculates the track buffer.
   */
  calculateTrackBuffer(): void {
    if (this.slider.getPaintLabels() && this.slider.getLabelTable() != null) {
      let highLabel = this.getHighestValueLabel();
      let lowLabel = this.getLowestValueLabel();
      if (this.slider.getOrientation() === SwingConstants.HORIZONTAL) {
        this.trackBuffer = $J.idiv(Math.max(highLabel.getBounds$().width_, lowLabel.getBounds$().width_), 2);
        this.trackBuffer = Math.max(this.trackBuffer, $J.idiv(this.thumbRect.width_, 2));
      } else {
        this.trackBuffer = $J.idiv(Math.max(highLabel.getBounds$().height_, lowLabel.getBounds$().height_), 2);
        this.trackBuffer = Math.max(this.trackBuffer, $J.idiv(this.thumbRect.height_, 2));
      }
    } else {
      if (this.slider.getOrientation() === SwingConstants.HORIZONTAL) {
        this.trackBuffer = $J.idiv(this.thumbRect.width_, 2);
      } else {
        this.trackBuffer = $J.idiv(this.thumbRect.height_, 2);
      }
    }
  }
  /**
   * Calculates the track rectangle.
   */
  calculateTrackRect(): void {
    let centerSpacing: number;
    if (this.slider.getOrientation() === SwingConstants.HORIZONTAL) {
      centerSpacing = this.thumbRect.height_;
      if (this.slider.getPaintTicks()) {
        centerSpacing = (centerSpacing + this.getTickLength()) | 0;
      }
      if (this.slider.getPaintLabels()) {
        centerSpacing = (centerSpacing + this.getHeightOfTallestLabel()) | 0;
      }
      this.trackRect.x_ = (this.contentRect.x_ + this.trackBuffer) | 0;
      this.trackRect.y_ = (this.contentRect.y_ + $J.idiv(((this.contentRect.height_ - centerSpacing - 1) | 0), 2)) | 0;
      this.trackRect.width_ = (this.contentRect.width_ - (Math.imul(this.trackBuffer, 2))) | 0;
      this.trackRect.height_ = this.thumbRect.height_;
    } else {
      centerSpacing = this.thumbRect.width_;
      if (BasicGraphicsUtils.isLeftToRight(this.slider)) {
        if (this.slider.getPaintTicks()) {
          centerSpacing = (centerSpacing + this.getTickLength()) | 0;
        }
        if (this.slider.getPaintLabels()) {
          centerSpacing = (centerSpacing + this.getWidthOfWidestLabel()) | 0;
        }
      } else {
        if (this.slider.getPaintTicks()) {
          centerSpacing = (centerSpacing - this.getTickLength()) | 0;
        }
        if (this.slider.getPaintLabels()) {
          centerSpacing = (centerSpacing - this.getWidthOfWidestLabel()) | 0;
        }
      }
      this.trackRect.x_ = (this.contentRect.x_ + $J.idiv(((this.contentRect.width_ - centerSpacing - 1) | 0), 2)) | 0;
      this.trackRect.y_ = (this.contentRect.y_ + this.trackBuffer) | 0;
      this.trackRect.width_ = this.thumbRect.width_;
      this.trackRect.height_ = (this.contentRect.height_ - (Math.imul(this.trackBuffer, 2))) | 0;
    }
  }
  /**
   * Gets the height of the tick area for horizontal sliders and the width of
   * the tick area for vertical sliders. BasicSliderUI uses the returned value
   * to determine the tick area rectangle. If you want to give your ticks some
   * room, make this larger than you need and paint your ticks away from the
   * sides in paintTicks().
   *
   * @return an integer representing the height of the tick area for
   * horizontal sliders, and the width of the tick area for the vertical
   * sliders
   */
  getTickLength(): number {
    return 8;
  }
  /**
   * Calculates the tick rectangle.
   */
  calculateTickRect(): void {
    if (this.slider.getOrientation() === SwingConstants.HORIZONTAL) {
      this.tickRect.x_ = this.trackRect.x_;
      this.tickRect.y_ = (this.trackRect.y_ + this.trackRect.height_) | 0;
      this.tickRect.width_ = this.trackRect.width_;
      this.tickRect.height_ = (this.slider.getPaintTicks()) ? this.getTickLength() : 0;
    } else {
      this.tickRect.width_ = (this.slider.getPaintTicks()) ? this.getTickLength() : 0;
      if (BasicGraphicsUtils.isLeftToRight(this.slider)) {
        this.tickRect.x_ = (this.trackRect.x_ + this.trackRect.width_) | 0;
      } else {
        this.tickRect.x_ = (this.trackRect.x_ - this.tickRect.width_) | 0;
      }
      this.tickRect.y_ = this.trackRect.y_;
      this.tickRect.height_ = this.trackRect.height_;
    }
  }
  /**
   * Calculates the label rectangle.
   */
  calculateLabelRect(): void {
    if (this.slider.getPaintLabels()) {
      if (this.slider.getOrientation() === SwingConstants.HORIZONTAL) {
        this.labelRect.x_ = (this.tickRect.x_ - this.trackBuffer) | 0;
        this.labelRect.y_ = (this.tickRect.y_ + this.tickRect.height_) | 0;
        this.labelRect.width_ = (this.tickRect.width_ + (Math.imul(this.trackBuffer, 2))) | 0;
        this.labelRect.height_ = this.getHeightOfTallestLabel();
      } else {
        if (BasicGraphicsUtils.isLeftToRight(this.slider)) {
          this.labelRect.x_ = (this.tickRect.x_ + this.tickRect.width_) | 0;
          this.labelRect.width_ = this.getWidthOfWidestLabel();
        } else {
          this.labelRect.width_ = this.getWidthOfWidestLabel();
          this.labelRect.x_ = (this.tickRect.x_ - this.labelRect.width_) | 0;
        }
        this.labelRect.y_ = (this.tickRect.y_ - this.trackBuffer) | 0;
        this.labelRect.height_ = (this.tickRect.height_ + (Math.imul(this.trackBuffer, 2))) | 0;
      }
    } else {
      if (this.slider.getOrientation() === SwingConstants.HORIZONTAL) {
        this.labelRect.x_ = this.tickRect.x_;
        this.labelRect.y_ = (this.tickRect.y_ + this.tickRect.height_) | 0;
        this.labelRect.width_ = this.tickRect.width_;
        this.labelRect.height_ = 0;
      } else {
        if (BasicGraphicsUtils.isLeftToRight(this.slider)) {
          this.labelRect.x_ = (this.tickRect.x_ + this.tickRect.width_) | 0;
        } else {
          this.labelRect.x_ = this.tickRect.x_;
        }
        this.labelRect.y_ = this.tickRect.y_;
        this.labelRect.width_ = 0;
        this.labelRect.height_ = this.tickRect.height_;
      }
    }
  }
  /**
   * Returns the thumb size.
   * @return the thumb size
   */
  getThumbSize(): Dimension {
    let size = new Dimension()._Dimension$();
    if (this.slider.getOrientation() === SwingConstants.VERTICAL) {
      size.width_ = 20;
      size.height_ = 11;
    } else {
      size.width_ = 11;
      size.height_ = 20;
    }
    return size;
  }
  /**
   * Returns the width of the widest label.
   * @return the width of the widest label
   */
  getWidthOfWidestLabel(): number {
    let dictionary = this.slider.getLabelTable();
    let widest = 0;
    if (dictionary != null) {
      let keys = dictionary.keys();
      while (keys.hasMoreElements()) {
        let label = dictionary.get(keys.nextElement());
        widest = Math.max(label.getPreferredSize$().width_, widest);
      }
    }
    return widest;
  }
  /**
   * Returns the height of the tallest label.
   * @return the height of the tallest label
   */
  getHeightOfTallestLabel(): number {
    let dictionary = this.slider.getLabelTable();
    let tallest = 0;
    if (dictionary != null) {
      let keys = dictionary.keys();
      while (keys.hasMoreElements()) {
        let label = dictionary.get(keys.nextElement());
        tallest = Math.max(label.getPreferredSize$().height_, tallest);
      }
    }
    return tallest;
  }
  /**
   * Draws inverted.
   * @return the inverted-ness
   */
  drawInverted(): boolean {
    if (this.slider.getOrientation() === SwingConstants.HORIZONTAL) {
      if (BasicGraphicsUtils.isLeftToRight(this.slider)) {
        return this.slider.getInverted();
      } else {
        return !this.slider.getInverted();
      }
    } else {
      return this.slider.getInverted();
    }
  }
  /**
   * Returns the biggest value that has an entry in the label table.
   *
   * @return biggest value that has an entry in the label table, or
   *         null.
   * @since 1.6
   */
  getHighestValue(): number {
    let dictionary = this.slider.getLabelTable();
    if (dictionary == null) {
      return null;
    }
    let keys = dictionary.keys();
    let max = null;
    while (keys.hasMoreElements()) {
      let i = keys.nextElement();
      if (max == null || i > max) {
        max = i;
      }
    }
    return max;
  }
  /**
   * Returns the smallest value that has an entry in the label table.
   *
   * @return smallest value that has an entry in the label table, or
   * null.
   * @since 1.6
   */
  getLowestValue(): number {
    let dictionary = this.slider.getLabelTable();
    if (dictionary == null) {
      return null;
    }
    let keys = dictionary.keys();
    let min = null;
    while (keys.hasMoreElements()) {
      let i = keys.nextElement();
      if (min == null || i < min) {
        min = i;
      }
    }
    return min;
  }
  /**
   * Returns the label that corresponds to the highest slider value in the
   * label table.
   *
   * @return the label that corresponds to the highest slider value in the
   * label table
   * @see JSlider#setLabelTable
   */
  getLowestValueLabel(): Component {
    let min = this.getLowestValue();
    if (min != null) {
      return this.slider.getLabelTable().get(min);
    }
    return null;
  }
  /**
   * Returns the label that corresponds to the lowest slider value in the
   * label table.
   *
   * @return the label that corresponds to the lowest slider value in the
   * label table
   * @see JSlider#setLabelTable
   */
  getHighestValueLabel(): Component {
    let max = this.getHighestValue();
    if (max != null) {
      return this.slider.getLabelTable().get(max);
    }
    return null;
  }
  paint(g: Graphics, c: JComponent): void {
    this.recalculateIfInsetsChanged();
    this.recalculateIfOrientationChanged();
    let clip = g.getClipBounds$();
    if (!clip.intersects$Rectangle(this.trackRect) && this.slider.getPaintTrack()) {
      this.calculateGeometry();
    }
    if (this.slider.getPaintTrack() && clip.intersects$Rectangle(this.trackRect)) {
      this.paintTrack(g);
    }
    if (this.slider.getPaintTicks() && clip.intersects$Rectangle(this.tickRect)) {
      this.paintTicks(g);
    }
    if (this.slider.getPaintLabels() && clip.intersects$Rectangle(this.labelRect)) {
      this.paintLabels(g);
    }
    if (this.slider.hasFocus() && clip.intersects$Rectangle(this.focusRect)) {
      this.paintFocus(g);
    }
    if (clip.intersects$Rectangle(this.thumbRect)) {
      this.paintThumb(g);
    }
  }
  /**
   * Recalculates if the insets have changed.
   */
  recalculateIfInsetsChanged(): void {
    let newInsets = this.slider.getInsets$();
    if (!newInsets.equals(this.insetCache)) {
      this.insetCache = newInsets;
      this.calculateGeometry();
    }
  }
  /**
   * Recalculates if the orientation has changed.
   */
  recalculateIfOrientationChanged(): void {
    let ltr = BasicGraphicsUtils.isLeftToRight(this.slider);
    if (ltr !== this.leftToRightCache) {
      this.leftToRightCache = ltr;
      this.calculateGeometry();
    }
  }
  /**
   * Paints focus.
   * @param g the graphics
   */
  paintFocus(g: Graphics): void {
    g.setColor(this.getFocusColor());
    BasicGraphicsUtils.drawDashedRect(g, this.focusRect.x_, this.focusRect.y_, this.focusRect.width_, this.focusRect.height_);
  }
  /**
   * Paints track.
   * @param g the graphics
   */
  paintTrack(g: Graphics): void {
    let trackBounds = this.trackRect;
    if (this.slider.getOrientation() === SwingConstants.HORIZONTAL) {
      let cy = (($J.idiv(trackBounds.height_, 2)) - 2) | 0;
      let cw = trackBounds.width_;
      g.translate$int$int(trackBounds.x_, (trackBounds.y_ + cy) | 0);
      g.setColor(this.getShadowColor());
      g.drawLine(0, 0, (cw - 1) | 0, 0);
      g.drawLine(0, 1, 0, 2);
      g.setColor(this.getHighlightColor());
      g.drawLine(0, 3, cw, 3);
      g.drawLine(cw, 0, cw, 3);
      g.setColor(Color.black);
      g.drawLine(1, 1, (cw - 2) | 0, 1);
      g.translate$int$int(-trackBounds.x_, -((trackBounds.y_ + cy) | 0));
    } else {
      let cx = (($J.idiv(trackBounds.width_, 2)) - 2) | 0;
      let ch = trackBounds.height_;
      g.translate$int$int((trackBounds.x_ + cx) | 0, trackBounds.y_);
      g.setColor(this.getShadowColor());
      g.drawLine(0, 0, 0, (ch - 1) | 0);
      g.drawLine(1, 0, 2, 0);
      g.setColor(this.getHighlightColor());
      g.drawLine(3, 0, 3, ch);
      g.drawLine(0, ch, 3, ch);
      g.setColor(Color.black);
      g.drawLine(1, 1, 1, (ch - 2) | 0);
      g.translate$int$int(-((trackBounds.x_ + cx) | 0), -trackBounds.y_);
    }
  }
  /**
   * Paints ticks.
   * @param g the graphics
   */
  paintTicks(g: Graphics): void {
    let tickBounds = this.tickRect;
    g.setColor(DefaultLookup.getColor$JComponent$ComponentUI$String$Color(this.slider, this, 'Slider.tickColor', Color.black));
    if (this.slider.getOrientation() === SwingConstants.HORIZONTAL) {
      g.translate$int$int(0, tickBounds.y_);
      if (this.slider.getMinorTickSpacing() > 0) {
        let value = this.slider.getMinimum();
        while (value <= this.slider.getMaximum()) {
          let xPos = this.xPositionForValue(value);
          this.paintMinorTickForHorizSlider(g, tickBounds, xPos);
          if (((2147483647 - this.slider.getMinorTickSpacing()) | 0) < value) {
            break;
          }
          value = (value + this.slider.getMinorTickSpacing()) | 0;
        }
      }
      if (this.slider.getMajorTickSpacing() > 0) {
        let value = this.slider.getMinimum();
        while (value <= this.slider.getMaximum()) {
          let xPos = this.xPositionForValue(value);
          this.paintMajorTickForHorizSlider(g, tickBounds, xPos);
          if (((2147483647 - this.slider.getMajorTickSpacing()) | 0) < value) {
            break;
          }
          value = (value + this.slider.getMajorTickSpacing()) | 0;
        }
      }
      g.translate$int$int(0, -tickBounds.y_);
    } else {
      g.translate$int$int(tickBounds.x_, 0);
      if (this.slider.getMinorTickSpacing() > 0) {
        let offset = 0;
        if (!BasicGraphicsUtils.isLeftToRight(this.slider)) {
          offset = (tickBounds.width_ - $J.idiv(tickBounds.width_, 2)) | 0;
          g.translate$int$int(offset, 0);
        }
        let value = this.slider.getMinimum();
        while (value <= this.slider.getMaximum()) {
          let yPos = this.yPositionForValue$int(value);
          this.paintMinorTickForVertSlider(g, tickBounds, yPos);
          if (((2147483647 - this.slider.getMinorTickSpacing()) | 0) < value) {
            break;
          }
          value = (value + this.slider.getMinorTickSpacing()) | 0;
        }
        if (!BasicGraphicsUtils.isLeftToRight(this.slider)) {
          g.translate$int$int(-offset, 0);
        }
      }
      if (this.slider.getMajorTickSpacing() > 0) {
        if (!BasicGraphicsUtils.isLeftToRight(this.slider)) {
          g.translate$int$int(2, 0);
        }
        let value = this.slider.getMinimum();
        while (value <= this.slider.getMaximum()) {
          let yPos = this.yPositionForValue$int(value);
          this.paintMajorTickForVertSlider(g, tickBounds, yPos);
          if (((2147483647 - this.slider.getMajorTickSpacing()) | 0) < value) {
            break;
          }
          value = (value + this.slider.getMajorTickSpacing()) | 0;
        }
        if (!BasicGraphicsUtils.isLeftToRight(this.slider)) {
          g.translate$int$int(-2, 0);
        }
      }
      g.translate$int$int(-tickBounds.x_, 0);
    }
  }
  /**
   * Paints minor tick for horizontal slider.
   * @param g the graphics
   * @param tickBounds the tick bounds
   * @param x the x coordinate
   */
  paintMinorTickForHorizSlider(g: Graphics, tickBounds: Rectangle, x: number): void {
    g.drawLine(x, 0, x, ($J.idiv(tickBounds.height_, 2) - 1) | 0);
  }
  /**
   * Paints major tick for horizontal slider.
   * @param g the graphics
   * @param tickBounds the tick bounds
   * @param x the x coordinate
   */
  paintMajorTickForHorizSlider(g: Graphics, tickBounds: Rectangle, x: number): void {
    g.drawLine(x, 0, x, (tickBounds.height_ - 2) | 0);
  }
  /**
   * Paints minor tick for vertical slider.
   * @param g the graphics
   * @param tickBounds the tick bounds
   * @param y the y coordinate
   */
  paintMinorTickForVertSlider(g: Graphics, tickBounds: Rectangle, y: number): void {
    g.drawLine(0, y, ($J.idiv(tickBounds.width_, 2) - 1) | 0, y);
  }
  /**
   * Paints major tick for vertical slider.
   * @param g the graphics
   * @param tickBounds the tick bounds
   * @param y the y coordinate
   */
  paintMajorTickForVertSlider(g: Graphics, tickBounds: Rectangle, y: number): void {
    g.drawLine(0, y, (tickBounds.width_ - 2) | 0, y);
  }
  /**
   * Paints the labels.
   * @param g the graphics
   */
  paintLabels(g: Graphics): void {
    let labelBounds = this.labelRect;
    let dictionary = this.slider.getLabelTable();
    if (dictionary != null) {
      let keys = dictionary.keys();
      let minValue = this.slider.getMinimum();
      let maxValue = this.slider.getMaximum();
      let enabled = this.slider.isEnabled();
      while (keys.hasMoreElements()) {
        let key = keys.nextElement();
        let value = (+key);
        if (value >= minValue && value <= maxValue) {
          let label = dictionary.get(key);
          label.setEnabled(enabled);
          if (label instanceof JLabel) {
            let icon = label.isEnabled() ? (label).getIcon() : (label).getDisabledIcon();
            if (icon instanceof ImageIcon) {
              Toolkit.getDefaultToolkit().checkImage((icon).getImage(), -1, -1, this.slider);
            }
          }
          if (this.slider.getOrientation() === SwingConstants.HORIZONTAL) {
            g.translate$int$int(0, labelBounds.y_);
            this.paintHorizontalLabel(g, value, label);
            g.translate$int$int(0, -labelBounds.y_);
          } else {
            let offset = 0;
            if (!BasicGraphicsUtils.isLeftToRight(this.slider)) {
              offset = (labelBounds.width_ - label.getPreferredSize$().width_) | 0;
            }
            g.translate$int$int((labelBounds.x_ + offset) | 0, 0);
            this.paintVerticalLabel(g, value, label);
            g.translate$int$int((-labelBounds.x_ - offset) | 0, 0);
          }
        }
      }
    }
  }
  /**
   * Called for every label in the label table. Used to draw the labels for
   * horizontal sliders. The graphics have been translated to labelRect.y
   * already.
   *
   * @param g the graphics context in which to paint
   * @param value the value of the slider
   * @param label the component label in the label table that needs to be
   * painted
   * @see JSlider#setLabelTable
   */
  paintHorizontalLabel(g: Graphics, value: number, label: Component): void {
    let labelCenter = this.xPositionForValue(value);
    let labelLeft = (labelCenter - ($J.idiv(label.getPreferredSize$().width_, 2))) | 0;
    g.translate$int$int(labelLeft, 0);
    label.paint(g);
    g.translate$int$int(-labelLeft, 0);
  }
  /**
   * Called for every label in the label table. Used to draw the labels for
   * vertical sliders. The graphics have been translated to labelRect.x
   * already.
   *
   * @param g the graphics context in which to paint
   * @param value the value of the slider
   * @param label the component label in the label table that needs to be
   * painted
   * @see JSlider#setLabelTable
   */
  paintVerticalLabel(g: Graphics, value: number, label: Component): void {
    let labelCenter = this.yPositionForValue$int(value);
    let labelTop = (labelCenter - ($J.idiv(label.getPreferredSize$().height_, 2))) | 0;
    g.translate$int$int(0, labelTop);
    label.paint(g);
    g.translate$int$int(0, -labelTop);
  }
  /**
   * Paints the thumb.
   * @param g the graphics
   */
  paintThumb(g: Graphics): void {
    let knobBounds = this.thumbRect;
    let w = knobBounds.width_;
    let h = knobBounds.height_;
    g.translate$int$int(knobBounds.x_, knobBounds.y_);
    let clip = g.getClipBounds$();
    g.clipRect(0, 0, w, h);
    if (this.slider.isEnabled()) {
      g.setColor(this.slider.getBackground());
    } else {
      g.setColor(this.slider.getBackground().darker());
    }
    let paintThumbArrowShape = this.slider.getClientProperty('Slider.paintThumbArrowShape');
    if ((!this.slider.getPaintTicks() && paintThumbArrowShape == null) || paintThumbArrowShape === false) {
      g.fillRect(0, 0, w, h);
      g.setColor(Color.black);
      g.drawLine(0, (h - 1) | 0, (w - 1) | 0, (h - 1) | 0);
      g.drawLine((w - 1) | 0, 0, (w - 1) | 0, (h - 1) | 0);
      g.setColor(this.highlightColor);
      g.drawLine(0, 0, 0, (h - 2) | 0);
      g.drawLine(1, 0, (w - 2) | 0, 0);
      g.setColor(this.shadowColor);
      g.drawLine(1, (h - 2) | 0, (w - 2) | 0, (h - 2) | 0);
      g.drawLine((w - 2) | 0, 1, (w - 2) | 0, (h - 3) | 0);
    } else if (this.slider.getOrientation() === SwingConstants.HORIZONTAL) {
      let cw = $J.idiv(w, 2);
      g.fillRect(1, 1, (w - 3) | 0, (h - 1 - cw) | 0);
      let p = new Polygon()._Polygon$();
      p.addPoint(1, (h - cw) | 0);
      p.addPoint((cw - 1) | 0, (h - 1) | 0);
      p.addPoint((w - 2) | 0, (h - 1 - cw) | 0);
      g.fillPolygon$Polygon(p);
      g.setColor(this.highlightColor);
      g.drawLine(0, 0, (w - 2) | 0, 0);
      g.drawLine(0, 1, 0, (h - 1 - cw) | 0);
      g.drawLine(0, (h - cw) | 0, (cw - 1) | 0, (h - 1) | 0);
      g.setColor(Color.black);
      g.drawLine((w - 1) | 0, 0, (w - 1) | 0, (h - 2 - cw) | 0);
      g.drawLine((w - 1) | 0, (h - 1 - cw) | 0, (w - 1 - cw) | 0, (h - 1) | 0);
      g.setColor(this.shadowColor);
      g.drawLine((w - 2) | 0, 1, (w - 2) | 0, (h - 2 - cw) | 0);
      g.drawLine((w - 2) | 0, (h - 1 - cw) | 0, (w - 1 - cw) | 0, (h - 2) | 0);
    } else {
      let cw = $J.idiv(h, 2);
      if (BasicGraphicsUtils.isLeftToRight(this.slider)) {
        g.fillRect(1, 1, (w - 1 - cw) | 0, (h - 3) | 0);
        let p = new Polygon()._Polygon$();
        p.addPoint((w - cw - 1) | 0, 0);
        p.addPoint((w - 1) | 0, cw);
        p.addPoint((w - 1 - cw) | 0, (h - 2) | 0);
        g.fillPolygon$Polygon(p);
        g.setColor(this.highlightColor);
        g.drawLine(0, 0, 0, (h - 2) | 0);
        g.drawLine(1, 0, (w - 1 - cw) | 0, 0);
        g.drawLine((w - cw - 1) | 0, 0, (w - 1) | 0, cw);
        g.setColor(Color.black);
        g.drawLine(0, (h - 1) | 0, (w - 2 - cw) | 0, (h - 1) | 0);
        g.drawLine((w - 1 - cw) | 0, (h - 1) | 0, (w - 1) | 0, (h - 1 - cw) | 0);
        g.setColor(this.shadowColor);
        g.drawLine(1, (h - 2) | 0, (w - 2 - cw) | 0, (h - 2) | 0);
        g.drawLine((w - 1 - cw) | 0, (h - 2) | 0, (w - 2) | 0, (h - cw - 1) | 0);
      } else {
        g.fillRect(5, 1, (w - 1 - cw) | 0, (h - 3) | 0);
        let p = new Polygon()._Polygon$();
        p.addPoint(cw, 0);
        p.addPoint(0, cw);
        p.addPoint(cw, (h - 2) | 0);
        g.fillPolygon$Polygon(p);
        g.setColor(this.highlightColor);
        g.drawLine((cw - 1) | 0, 0, (w - 2) | 0, 0);
        g.drawLine(0, cw, cw, 0);
        g.setColor(Color.black);
        g.drawLine(0, (h - 1 - cw) | 0, cw, (h - 1) | 0);
        g.drawLine(cw, (h - 1) | 0, (w - 1) | 0, (h - 1) | 0);
        g.setColor(this.shadowColor);
        g.drawLine(cw, (h - 2) | 0, (w - 2) | 0, (h - 2) | 0);
        g.drawLine((w - 1) | 0, 1, (w - 1) | 0, (h - 2) | 0);
      }
    }
    g.setClip$Shape(clip);
    g.translate$int$int(-knobBounds.x_, -knobBounds.y_);
  }
  /**
   * Sets the thumb location.
   * @param x the x coordinate
   * @param y the y coordinate
   */
  setThumbLocation(x: number, y: number): void {
    BasicSliderUI.unionRect.setBounds$Rectangle(this.thumbRect);
    this.thumbRect.setLocation$int$int(x, y);
    SwingUtilities.computeUnion(this.thumbRect.x_, this.thumbRect.y_, this.thumbRect.width_, this.thumbRect.height_, BasicSliderUI.unionRect);
    this.slider.repaint$int$int$int$int(BasicSliderUI.unionRect.x_, BasicSliderUI.unionRect.y_, BasicSliderUI.unionRect.width_, BasicSliderUI.unionRect.height_);
  }
  /**
   * Scrolls by block.
   * @param direction the direction
   */
  scrollByBlock(direction: number): void {
    {
      let blockIncrement = $J.idiv(((this.slider.getMaximum() - this.slider.getMinimum()) | 0), 10);
      if (blockIncrement === 0) {
        blockIncrement = 1;
      }
      let tickSpacing = this.getTickSpacing();
      if (this.slider.getSnapToTicks()) {
        if (blockIncrement < tickSpacing) {
          blockIncrement = tickSpacing;
        }
      } else {
        if (tickSpacing > 0) {
          blockIncrement = tickSpacing;
        }
      }
      let delta = Math.imul(blockIncrement, ((direction > 0) ? BasicSliderUI.POSITIVE_SCROLL : BasicSliderUI.NEGATIVE_SCROLL));
      this.slider.setValue((this.slider.getValue() + delta) | 0);
    }
  }
  /**
   * Scrolls by unit.
   * @param direction the direction
   */
  scrollByUnit(direction: number): void {
    {
      let delta = ((direction > 0) ? BasicSliderUI.POSITIVE_SCROLL : BasicSliderUI.NEGATIVE_SCROLL);
      if (this.slider.getSnapToTicks()) {
        delta = Math.imul(delta, this.getTickSpacing());
      }
      this.slider.setValue((this.slider.getValue() + delta) | 0);
    }
  }
  /**
   * This function is called when a mousePressed was detected in the track,
   * not in the thumb. The default behavior is to scroll by block. You can
   * override this method to stop it from scrolling or to add additional
   * behavior.
   *
   * @param dir the direction and number of blocks to scroll
   */
  scrollDueToClickInTrack(dir: number): void {
    this.scrollByBlock(dir);
  }
  /**
   * Returns the x position for a value.
   * @param value the value
   * @return the x position for a value
   */
  xPositionForValue(value: number): number {
    let min = this.slider.getMinimum();
    let max = this.slider.getMaximum();
    let trackLength = this.trackRect.width_;
    let valueRange = max - min;
    let pixelsPerValue = trackLength / valueRange;
    let trackLeft = this.trackRect.x_;
    let trackRight = (this.trackRect.x_ + (this.trackRect.width_ - 1)) | 0;
    let xPosition: number;
    if (!this.drawInverted()) {
      xPosition = trackLeft;
      xPosition = (xPosition + $J.round(pixelsPerValue * (value - min))) | 0;
    } else {
      xPosition = trackRight;
      xPosition = (xPosition - $J.round(pixelsPerValue * (value - min))) | 0;
    }
    xPosition = Math.max(trackLeft, xPosition);
    xPosition = Math.min(trackRight, xPosition);
    return xPosition;
  }
  /**
   * Returns the y position for a value.
   * @param value the value
   * @return the y position for a value
   */
  yPositionForValue$int(value: number): number {
    return this.yPositionForValue$int$int$int(value, this.trackRect.y_, this.trackRect.height_);
  }
  /**
   * Returns the y location for the specified value.  No checking is
   * done on the arguments.  In particular if <code>trackHeight</code> is
   * negative undefined results may occur.
   *
   * @param value the slider value to get the location for
   * @param trackY y-origin of the track
   * @param trackHeight the height of the track
   * @return the y location for the specified value of the slider
   * @since 1.6
   */
  yPositionForValue$int$int$int(value: number, trackY: number, trackHeight: number): number {
    let min = this.slider.getMinimum();
    let max = this.slider.getMaximum();
    let valueRange = max - min;
    let pixelsPerValue = trackHeight / valueRange;
    let trackBottom = (trackY + (trackHeight - 1)) | 0;
    let yPosition: number;
    if (!this.drawInverted()) {
      yPosition = trackY;
      yPosition = (yPosition + $J.round(pixelsPerValue * (max - value))) | 0;
    } else {
      yPosition = trackY;
      yPosition = (yPosition + $J.round(pixelsPerValue * (value - min))) | 0;
    }
    yPosition = Math.max(trackY, yPosition);
    yPosition = Math.min(trackBottom, yPosition);
    return yPosition;
  }
  /**
   * Returns the value at the y position. If {@code yPos} is beyond the
   * track at the bottom or the top, this method sets the value to either
   * the minimum or maximum value of the slider, depending on if the slider
   * is inverted or not.
   *
   * @param yPos the location of the slider along the y axis
   * @return the value at the y position
   */
  valueForYPosition(yPos: number): number {
    let value: number;
    let minValue = this.slider.getMinimum();
    let maxValue = this.slider.getMaximum();
    let trackLength = this.trackRect.height_;
    let trackTop = this.trackRect.y_;
    let trackBottom = (this.trackRect.y_ + (this.trackRect.height_ - 1)) | 0;
    if (yPos <= trackTop) {
      value = this.drawInverted() ? minValue : maxValue;
    } else if (yPos >= trackBottom) {
      value = this.drawInverted() ? maxValue : minValue;
    } else {
      let distanceFromTrackTop = (yPos - trackTop) | 0;
      let valueRange = maxValue - minValue;
      let valuePerPixel = valueRange / trackLength;
      let valueFromTrackTop = ($J.round(distanceFromTrackTop * valuePerPixel)) | 0;
      value = this.drawInverted() ? (minValue + valueFromTrackTop) | 0 : (maxValue - valueFromTrackTop) | 0;
    }
    return value;
  }
  /**
   * Returns the value at the x position.  If {@code xPos} is beyond the
   * track at the left or the right, this method sets the value to either the
   * minimum or maximum value of the slider, depending on if the slider is
   * inverted or not.
   *
   * @param xPos the location of the slider along the x axis
   * @return the value of the x position
   */
  valueForXPosition(xPos: number): number {
    let value: number;
    let minValue = this.slider.getMinimum();
    let maxValue = this.slider.getMaximum();
    let trackLength = this.trackRect.width_;
    let trackLeft = this.trackRect.x_;
    let trackRight = (this.trackRect.x_ + (this.trackRect.width_ - 1)) | 0;
    if (xPos <= trackLeft) {
      value = this.drawInverted() ? maxValue : minValue;
    } else if (xPos >= trackRight) {
      value = this.drawInverted() ? minValue : maxValue;
    } else {
      let distanceFromTrackLeft = (xPos - trackLeft) | 0;
      let valueRange = maxValue - minValue;
      let valuePerPixel = valueRange / trackLength;
      let valueFromTrackLeft = ($J.round(distanceFromTrackLeft * valuePerPixel)) | 0;
      value = this.drawInverted() ? (maxValue - valueFromTrackLeft) | 0 : (minValue + valueFromTrackLeft) | 0;
    }
    return value;
  }
  static $clinit() {
    BasicSliderUI.SHARED_ACTION = new BasicSliderUI$Actions()._BasicSliderUI$Actions$();
    BasicSliderUI.unionRect = new Rectangle()._Rectangle$();
  }
}

/**
 * A property change handler.
 */
export class BasicSliderUI$PropertyChangeHandler extends JObject {
  /**
   * Constructs a {@code PropertyChangeHandler}.
   */
  _BasicSliderUI$PropertyChangeHandler(): this {
    return this;
  }
  /**
   * {@inheritDoc}
   */
  propertyChange(e: PropertyChangeEvent): void {
    this.$outer.getHandler().propertyChange(e);
  }
}

export class BasicSliderUI$Handler extends JObject {
  _BasicSliderUI$Handler(): this {
    return this;
  }
  stateChanged(e: ChangeEvent): void {
    if (!this.$outer.isDragging_) {
      this.$outer.calculateThumbLocation();
      this.$outer.slider.repaint$();
    }
    this.$outer.lastValue = this.$outer.slider.getValue();
  }
  componentHidden(e: ComponentEvent): void {
  }
  componentMoved(e: ComponentEvent): void {
  }
  componentResized(e: ComponentEvent): void {
    this.$outer.calculateGeometry();
    this.$outer.slider.repaint$();
  }
  componentShown(e: ComponentEvent): void {
  }
  focusGained(e: FocusEvent): void {
    this.$outer.slider.repaint$();
  }
  focusLost(e: FocusEvent): void {
    this.$outer.slider.repaint$();
  }
  propertyChange(e: PropertyChangeEvent): void {
    let propertyName = e.getPropertyName();
    if (propertyName === 'orientation' || propertyName === 'inverted' || propertyName === 'labelTable' || propertyName === 'majorTickSpacing' || propertyName === 'minorTickSpacing' || propertyName === 'paintTicks' || propertyName === 'paintTrack' || propertyName === 'font' || SwingUtilities2.isScaleChanged$PropertyChangeEvent(e) || propertyName === 'paintLabels' || propertyName === 'Slider.paintThumbArrowShape') {
      this.$outer.checkedLabelBaselines = false;
      this.$outer.calculateGeometry();
      this.$outer.slider.repaint$();
    } else if (propertyName === 'componentOrientation') {
      this.$outer.calculateGeometry();
      this.$outer.slider.repaint$();
      let km = this.$outer.getInputMap(JComponent.WHEN_FOCUSED, this.$outer.slider);
      SwingUtilities.replaceUIInputMap(this.$outer.slider, JComponent.WHEN_FOCUSED, km);
    } else if (propertyName === 'model') {
      (e.getOldValue()).removeChangeListener(this.$outer.changeListener);
      (e.getNewValue()).addChangeListener(this.$outer.changeListener);
      this.$outer.calculateThumbLocation();
      this.$outer.slider.repaint$();
    }
  }
}

/**
 * Track mouse movements.
 *
 * This class should be treated as a &quot;protected&quot; inner class.
 * Instantiate it only within subclasses of <code>Foo</code>.
 */
export class BasicSliderUI$TrackListener extends MouseInputAdapter {
  /**
   * The offset
   */
  offset: number = 0;
  /**
   * Current mouse x.
   */
  currentMouseX: number = 0;
  /**
   * Current mouse y.
   */
  currentMouseY: number = 0;
  /**
   * Constructs a {@code TrackListener}.
   */
  _BasicSliderUI$TrackListener(): this {
    this._MouseInputAdapter();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  mouseReleased(e: MouseEvent): void {
    if (!this.$outer.slider.isEnabled()) {
      return;
    }
    this.offset = 0;
    this.$outer.scrollTimer.stop();
    this.$outer.isDragging_ = false;
    this.$outer.slider.setValueIsAdjusting(false);
    this.$outer.slider.repaint$();
  }
  /**
   * If the mouse is pressed above the "thumb" component
   * then reduce the scrollbars value by one page ("page up"),
   * otherwise increase it by one page.  If there is no
   * thumb then page up if the mouse is in the upper half
   * of the track.
   */
  mousePressed(e: MouseEvent): void {
    if (!this.$outer.slider.isEnabled()) {
      return;
    }
    this.$outer.calculateGeometry();
    this.currentMouseX = e.getX();
    this.currentMouseY = e.getY();
    if (this.$outer.slider.isRequestFocusEnabled()) {
      this.$outer.slider.requestFocus$Cause(FocusEvent$Cause.MOUSE_EVENT);
    }
    if (this.$outer.thumbRect.contains$int$int(this.currentMouseX, this.currentMouseY)) {
      if (UIManager.getBoolean$Object('Slider.onlyLeftMouseButtonDrag') && !SwingUtilities.isLeftMouseButton(e)) {
        return;
      }
      switch (this.$outer.slider.getOrientation()) {
        case SwingConstants.VERTICAL:
          this.offset = (this.currentMouseY - this.$outer.thumbRect.y_) | 0;
          break;
        case SwingConstants.HORIZONTAL:
          this.offset = (this.currentMouseX - this.$outer.thumbRect.x_) | 0;
          break;
      }
      this.$outer.isDragging_ = true;
      return;
    }
    if (!SwingUtilities.isLeftMouseButton(e)) {
      return;
    }
    this.$outer.isDragging_ = false;
    this.$outer.slider.setValueIsAdjusting(true);
    let sbSize = this.$outer.slider.getSize$();
    let direction = BasicSliderUI.POSITIVE_SCROLL;
    switch (this.$outer.slider.getOrientation()) {
      case SwingConstants.VERTICAL:
        if (this.$outer.thumbRect.isEmpty()) {
          let scrollbarCenter = $J.idiv(sbSize.height_, 2);
          if (!this.$outer.drawInverted()) {
            direction = (this.currentMouseY < scrollbarCenter) ? BasicSliderUI.POSITIVE_SCROLL : BasicSliderUI.NEGATIVE_SCROLL;
          } else {
            direction = (this.currentMouseY < scrollbarCenter) ? BasicSliderUI.NEGATIVE_SCROLL : BasicSliderUI.POSITIVE_SCROLL;
          }
        } else {
          let thumbY = this.$outer.thumbRect.y_;
          if (!this.$outer.drawInverted()) {
            direction = (this.currentMouseY < thumbY) ? BasicSliderUI.POSITIVE_SCROLL : BasicSliderUI.NEGATIVE_SCROLL;
          } else {
            direction = (this.currentMouseY < thumbY) ? BasicSliderUI.NEGATIVE_SCROLL : BasicSliderUI.POSITIVE_SCROLL;
          }
        }
        break;
      case SwingConstants.HORIZONTAL:
        if (this.$outer.thumbRect.isEmpty()) {
          let scrollbarCenter = $J.idiv(sbSize.width_, 2);
          if (!this.$outer.drawInverted()) {
            direction = (this.currentMouseX < scrollbarCenter) ? BasicSliderUI.NEGATIVE_SCROLL : BasicSliderUI.POSITIVE_SCROLL;
          } else {
            direction = (this.currentMouseX < scrollbarCenter) ? BasicSliderUI.POSITIVE_SCROLL : BasicSliderUI.NEGATIVE_SCROLL;
          }
        } else {
          let thumbX = this.$outer.thumbRect.x_;
          if (!this.$outer.drawInverted()) {
            direction = (this.currentMouseX < thumbX) ? BasicSliderUI.NEGATIVE_SCROLL : BasicSliderUI.POSITIVE_SCROLL;
          } else {
            direction = (this.currentMouseX < thumbX) ? BasicSliderUI.POSITIVE_SCROLL : BasicSliderUI.NEGATIVE_SCROLL;
          }
        }
        break;
    }
    if (this.shouldScroll(direction)) {
      this.$outer.scrollDueToClickInTrack(direction);
    }
    if (this.shouldScroll(direction)) {
      this.$outer.scrollTimer.stop();
      this.$outer.scrollListener.setDirection(direction);
      this.$outer.scrollTimer.start();
    }
  }
  /**
   * Returns if scrolling should occur
   * @param direction the direction.
   * @return if scrolling should occur
   */
  shouldScroll(direction: number): boolean {
    let r = this.$outer.thumbRect;
    if (this.$outer.slider.getOrientation() === SwingConstants.VERTICAL) {
      if (this.$outer.drawInverted() ? direction < 0 : direction > 0) {
        if (r.y_ <= this.currentMouseY) {
          return false;
        }
      } else if (((r.y_ + r.height_) | 0) >= this.currentMouseY) {
        return false;
      }
    } else {
      if (this.$outer.drawInverted() ? direction < 0 : direction > 0) {
        if (((r.x_ + r.width_) | 0) >= this.currentMouseX) {
          return false;
        }
      } else if (r.x_ <= this.currentMouseX) {
        return false;
      }
    }
    if (direction > 0 && ((this.$outer.slider.getValue() + this.$outer.slider.getExtent()) | 0) >= this.$outer.slider.getMaximum()) {
      return false;
    } else if (direction < 0 && this.$outer.slider.getValue() <= this.$outer.slider.getMinimum()) {
      return false;
    }
    return true;
  }
  /**
   * Set the models value to the position of the top/left
   * of the thumb relative to the origin of the track.
   */
  mouseDragged(e: MouseEvent): void {
    let thumbMiddle: number;
    if (!this.$outer.slider.isEnabled()) {
      return;
    }
    this.currentMouseX = e.getX();
    this.currentMouseY = e.getY();
    if (!this.$outer.isDragging_) {
      return;
    }
    this.$outer.slider.setValueIsAdjusting(true);
    {
      let halfThumbHeight: number, thumbTop: number, trackTop: number, trackBottom: number, vMax: number, halfThumbWidth: number, thumbLeft: number, trackLeft: number, trackRight: number, hMax: number;
      switch (this.$outer.slider.getOrientation()) {
        case SwingConstants.VERTICAL:
          halfThumbHeight = $J.idiv(this.$outer.thumbRect.height_, 2);
          thumbTop = (e.getY() - this.offset) | 0;
          trackTop = this.$outer.trackRect.y_;
          trackBottom = (this.$outer.trackRect.y_ + (this.$outer.trackRect.height_ - 1)) | 0;
          vMax = this.$outer.yPositionForValue$int((this.$outer.slider.getMaximum() - this.$outer.slider.getExtent()) | 0);
          if (this.$outer.drawInverted()) {
            trackBottom = vMax;
          } else {
            trackTop = vMax;
          }
          thumbTop = Math.max(thumbTop, (trackTop - halfThumbHeight) | 0);
          thumbTop = Math.min(thumbTop, (trackBottom - halfThumbHeight) | 0);
          this.$outer.setThumbLocation(this.$outer.thumbRect.x_, thumbTop);
          thumbMiddle = (thumbTop + halfThumbHeight) | 0;
          this.$outer.slider.setValue(this.$outer.valueForYPosition(thumbMiddle));
          break;
        case SwingConstants.HORIZONTAL:
          halfThumbWidth = $J.idiv(this.$outer.thumbRect.width_, 2);
          thumbLeft = (e.getX() - this.offset) | 0;
          trackLeft = this.$outer.trackRect.x_;
          trackRight = (this.$outer.trackRect.x_ + (this.$outer.trackRect.width_ - 1)) | 0;
          hMax = this.$outer.xPositionForValue((this.$outer.slider.getMaximum() - this.$outer.slider.getExtent()) | 0);
          if (this.$outer.drawInverted()) {
            trackLeft = hMax;
          } else {
            trackRight = hMax;
          }
          thumbLeft = Math.max(thumbLeft, (trackLeft - halfThumbWidth) | 0);
          thumbLeft = Math.min(thumbLeft, (trackRight - halfThumbWidth) | 0);
          this.$outer.setThumbLocation(thumbLeft, this.$outer.thumbRect.y_);
          thumbMiddle = (thumbLeft + halfThumbWidth) | 0;
          this.$outer.slider.setValue(this.$outer.valueForXPosition(thumbMiddle));
          break;
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  mouseMoved(e: MouseEvent): void {
  }
}

/**
 * Scroll-event listener.
 *
 * This class should be treated as a &quot;protected&quot; inner class.
 * Instantiate it only within subclasses of <code>Foo</code>.
 */
export class BasicSliderUI$ScrollListener extends JObject {
  direction: number = 0;
  useBlockIncrement: boolean = false;
  $init_BasicSliderUI_ScrollListener() {
    this.direction = BasicSliderUI.POSITIVE_SCROLL;
  }
  /**
   * Constructs a {@code ScrollListener}
   */
  _BasicSliderUI$ScrollListener$(): this {
    this.$init_BasicSliderUI_ScrollListener();
    this.direction = BasicSliderUI.POSITIVE_SCROLL;
    this.useBlockIncrement = true;
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
   * Sets scrolling by block
   * @param block the new scroll by block value
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
    } else {
      this.$outer.scrollByUnit(this.direction);
    }
    if (!this.$outer.trackListener.shouldScroll(this.direction)) {
      (e.getSource()).stop();
    }
  }
}

export class BasicSliderUI$Actions extends UIAction {
  static readonly POSITIVE_UNIT_INCREMENT: string = 'positiveUnitIncrement';
  static readonly POSITIVE_BLOCK_INCREMENT: string = 'positiveBlockIncrement';
  static readonly NEGATIVE_UNIT_INCREMENT: string = 'negativeUnitIncrement';
  static readonly NEGATIVE_BLOCK_INCREMENT: string = 'negativeBlockIncrement';
  static readonly MIN_SCROLL_INCREMENT: string = 'minScroll';
  static readonly MAX_SCROLL_INCREMENT: string = 'maxScroll';
  _BasicSliderUI$Actions$(): this {
    this._UIAction(null);
    return this;
  }
  _BasicSliderUI$Actions$String(name: string): this {
    this._UIAction(name);
    return this;
  }
  actionPerformed(evt: ActionEvent): void {
    let slider = evt.getSource();
    let ui = BasicLookAndFeel.getUIOfType(slider.getUI(), $J.cls(BasicSliderUI));
    let name = this.getName();
    if (ui == null) {
      return;
    }
    if (BasicSliderUI$Actions.POSITIVE_UNIT_INCREMENT === name) {
      this.scroll(slider, ui, BasicSliderUI.POSITIVE_SCROLL, false);
    } else if (BasicSliderUI$Actions.NEGATIVE_UNIT_INCREMENT === name) {
      this.scroll(slider, ui, BasicSliderUI.NEGATIVE_SCROLL, false);
    } else if (BasicSliderUI$Actions.POSITIVE_BLOCK_INCREMENT === name) {
      this.scroll(slider, ui, BasicSliderUI.POSITIVE_SCROLL, true);
    } else if (BasicSliderUI$Actions.NEGATIVE_BLOCK_INCREMENT === name) {
      this.scroll(slider, ui, BasicSliderUI.NEGATIVE_SCROLL, true);
    } else if (BasicSliderUI$Actions.MIN_SCROLL_INCREMENT === name) {
      this.scroll(slider, ui, BasicSliderUI.MIN_SCROLL, false);
    } else if (BasicSliderUI$Actions.MAX_SCROLL_INCREMENT === name) {
      this.scroll(slider, ui, BasicSliderUI.MAX_SCROLL, false);
    }
  }
  scroll(slider: JSlider, ui: BasicSliderUI, direction: number, isBlock: boolean): void {
    let invert = slider.getInverted();
    if (direction === BasicSliderUI.NEGATIVE_SCROLL || direction === BasicSliderUI.POSITIVE_SCROLL) {
      if (invert) {
        direction = (direction === BasicSliderUI.POSITIVE_SCROLL) ? BasicSliderUI.NEGATIVE_SCROLL : BasicSliderUI.POSITIVE_SCROLL;
      }
      if (isBlock) {
        ui.scrollByBlock(direction);
      } else {
        ui.scrollByUnit(direction);
      }
    } else {
      if (invert) {
        direction = (direction === BasicSliderUI.MIN_SCROLL) ? BasicSliderUI.MAX_SCROLL : BasicSliderUI.MIN_SCROLL;
      }
      slider.setValue((direction === BasicSliderUI.MIN_SCROLL) ? slider.getMinimum() : slider.getMaximum());
    }
  }
}

$J.define(BasicSliderUI, 'javax.swing.plaf.basic.BasicSliderUI', { kind: 'class', sup: 'javax.swing.plaf.SliderUI', ctors: { 'javax.swing.JSlider': '_BasicSliderUI$JSlider', '': '_BasicSliderUI$' }, meths: { 'yPositionForValue(int,int,int)': 'yPositionForValue$int$int$int', 'yPositionForValue(int)': 'yPositionForValue$int', 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent', 'getBaseline(javax.swing.JComponent,int,int)': 'getBaseline$JComponent$int$int' }, clinit: true, lazy: ['SHARED_ACTION', 'unionRect'] });
$J.define(BasicSliderUI$PropertyChangeHandler, 'javax.swing.plaf.basic.BasicSliderUI$PropertyChangeHandler', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_BasicSliderUI$PropertyChangeHandler' }, inner: true });
$J.define(BasicSliderUI$Handler, 'javax.swing.plaf.basic.BasicSliderUI$Handler', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener', 'java.awt.event.ComponentListener', 'java.awt.event.FocusListener', 'java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_BasicSliderUI$Handler' }, inner: true });
$J.define(BasicSliderUI$TrackListener, 'javax.swing.plaf.basic.BasicSliderUI$TrackListener', { kind: 'class', sup: 'javax.swing.event.MouseInputAdapter', ctors: { '': '_BasicSliderUI$TrackListener' }, inner: true });
$J.define(BasicSliderUI$ScrollListener, 'javax.swing.plaf.basic.BasicSliderUI$ScrollListener', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'java.lang.Object', ctors: { 'int,boolean': '_BasicSliderUI$ScrollListener$int$boolean', '': '_BasicSliderUI$ScrollListener$' }, inner: true });
$J.define(BasicSliderUI$Actions, 'javax.swing.plaf.basic.BasicSliderUI$Actions', { kind: 'class', sup: 'sun.swing.UIAction', ctors: { 'java.lang.String': '_BasicSliderUI$Actions$String', '': '_BasicSliderUI$Actions$' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Component$BaselineResizeBehavior = $J.load('java.awt.Component$BaselineResizeBehavior');
  Dimension = $J.load('java.awt.Dimension');
  IllegalComponentStateException = $J.load('java.awt.IllegalComponentStateException');
  Polygon = $J.load('java.awt.Polygon');
  Rectangle = $J.load('java.awt.Rectangle');
  FocusEvent$Cause = $J.load('java.awt.event.FocusEvent$Cause');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JComponent = $J.load('javax.swing.JComponent');
  JLabel = $J.load('javax.swing.JLabel');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  Timer = $J.load('javax.swing.Timer');
  UIManager = $J.load('javax.swing.UIManager');
  InsetsUIResource = $J.load('javax.swing.plaf.InsetsUIResource');
  BasicGraphicsUtils = $J.load('javax.swing.plaf.basic.BasicGraphicsUtils');
  BasicLookAndFeel = $J.load('javax.swing.plaf.basic.BasicLookAndFeel');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
