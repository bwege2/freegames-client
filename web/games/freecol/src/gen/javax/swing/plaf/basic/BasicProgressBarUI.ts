// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicProgressBarUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { ProgressBarUI } from '../ProgressBarUI.ts';

let BasicStroke, Component$BaselineResizeBehavior, Dimension, Graphics2D, Point, Rectangle, HierarchyEvent, AffineTransform, LookAndFeel, SwingConstants, SwingUtilities, Timer, UIManager, BasicGraphicsUtils, DefaultLookup, SwingUtilities2;

/**
 * A Basic L&amp;F implementation of ProgressBarUI.
 *
 * @author Michael C. Albers
 * @author Kathy Walrath
 */
export class BasicProgressBarUI extends ProgressBarUI {
  cachedPercent: number = 0;
  cellLength: number = 0;
  cellSpacing: number = 0;
  selectionForeground: Color = null;
  selectionBackground: Color = null;
  animator: BasicProgressBarUI$Animator = null;
  /**
   * The instance of {@code JProgressBar}.
   */
  progressBar: JProgressBar = null;
  /**
   * The instance of {@code ChangeListener}.
   */
  changeListener: ChangeListener = null;
  handler: BasicProgressBarUI$Handler = null;
  /**
   * The current state of the indeterminate animation's cycle.
   * 0, the initial value, means paint the first frame.
   * When the progress bar is indeterminate and showing,
   * the default animation thread updates this variable
   * by invoking incrementAnimationIndex()
   * every repaintInterval milliseconds.
   */
  animationIndex: number = 0;
  /**
   * The number of frames per cycle. Under the default implementation,
   * this depends on the cycleTime and repaintInterval.  It
   * must be an even number for the default painting algorithm.  This
   * value is set in the initIndeterminateValues method.
   */
  numFrames: number = 0;
  /**
   * Interval (in ms) between repaints of the indeterminate progress bar.
   * The value of this method is set
   * (every time the progress bar changes to indeterminate mode)
   * using the
   * "ProgressBar.repaintInterval" key in the defaults table.
   */
  repaintInterval: number = 0;
  /**
   * The number of milliseconds until the animation cycle repeats.
   * The value of this method is set
   * (every time the progress bar changes to indeterminate mode)
   * using the
   * "ProgressBar.cycleTime" key in the defaults table.
   */
  cycleTime: number = 0;
  static ADJUSTTIMER: boolean = false;
  /**
   * Used to hold the location and size of the bouncing box (returned
   * by getBox) to be painted.
   *
   * @since 1.5
   */
  boxRect: Rectangle = null;
  /**
   * The rectangle to be updated the next time the
   * animation thread calls repaint.  For bouncing-box
   * animation this rect should include the union of
   * the currently displayed box (which needs to be erased)
   * and the box to be displayed next.
   * This rectangle's values are set in
   * the setAnimationIndex method.
   */
  nextPaintRect: Rectangle = null;
  /**
   * The component's painting area, not including the border.
   */
  componentInnards: Rectangle = null;
  oldComponentInnards: Rectangle = null;
  /**
   * For bouncing-box animation, the change in position per frame.
   */
  delta_: number = 0;
  maxPosition: number = 0;
  /**
   * Constructs a {@code BasicProgressBarUI}.
   */
  _BasicProgressBarUI(): this {
    this._ProgressBarUI();
    this.animationIndex = 0;
    this.delta_ = 0;
    this.maxPosition = 0;
    return this;
  }
  /**
   * Returns a new instance of {@code BasicProgressBarUI}.
   *
   * @param x a component
   * @return a new instance of {@code BasicProgressBarUI}
   */
  static createUI(x: JComponent): ComponentUI {
    return new BasicProgressBarUI()._BasicProgressBarUI();
  }
  installUI(c: JComponent): void {
    this.progressBar = c;
    this.installDefaults();
    this.installListeners();
    if (this.progressBar.isIndeterminate()) {
      this.initIndeterminateValues();
    }
  }
  uninstallUI(c: JComponent): void {
    if (this.progressBar.isIndeterminate()) {
      this.cleanUpIndeterminateValues();
    }
    this.uninstallDefaults();
    this.uninstallListeners();
    this.progressBar = null;
  }
  /**
   * Installs default properties.
   */
  installDefaults(): void {
    LookAndFeel.installProperty(this.progressBar, 'opaque', true);
    LookAndFeel.installBorder(this.progressBar, 'ProgressBar.border');
    LookAndFeel.installColorsAndFont(this.progressBar, 'ProgressBar.background', 'ProgressBar.foreground', 'ProgressBar.font');
    this.cellLength = UIManager.getInt$Object('ProgressBar.cellLength');
    if (this.cellLength === 0) {
      this.cellLength = 1;
    }
    this.cellSpacing = UIManager.getInt$Object('ProgressBar.cellSpacing');
    this.selectionForeground = UIManager.getColor$Object('ProgressBar.selectionForeground');
    this.selectionBackground = UIManager.getColor$Object('ProgressBar.selectionBackground');
  }
  /**
   * Unintalls default properties.
   */
  uninstallDefaults(): void {
    LookAndFeel.uninstallBorder(this.progressBar);
  }
  /**
   * Registers listeners.
   */
  installListeners(): void {
    this.changeListener = $J.fn(this.getHandler(), 'stateChanged');
    this.progressBar.addChangeListener(this.changeListener);
    this.progressBar.addPropertyChangeListener$PropertyChangeListener($J.fn(this.getHandler(), 'propertyChange'));
  }
  getHandler(): BasicProgressBarUI$Handler {
    if (this.handler == null) {
      this.handler = new BasicProgressBarUI$Handler().$o(this)._BasicProgressBarUI$Handler();
    }
    return this.handler;
  }
  /**
   * Starts the animation thread, creating and initializing
   * it if necessary. This method is invoked when an
   * indeterminate progress bar should start animating.
   * Reasons for this may include:
   * <ul>
   *    <li>The progress bar is determinate and becomes displayable
   *    <li>The progress bar is displayable and becomes determinate
   *    <li>The progress bar is displayable and determinate and this
   *        UI is installed
   * </ul>
   * If you implement your own animation thread,
   * you must override this method.
   *
   * @since 1.4
   * @see #stopAnimationTimer
   */
  startAnimationTimer(): void {
    if (this.animator == null) {
      this.animator = new BasicProgressBarUI$Animator().$o(this)._BasicProgressBarUI$Animator();
    }
    this.animator.start(this.getRepaintInterval());
  }
  /**
   * Stops the animation thread.
   * This method is invoked when the indeterminate
   * animation should be stopped. Reasons for this may include:
   * <ul>
   *    <li>The progress bar changes to determinate
   *    <li>The progress bar is no longer part of a displayable hierarchy
   *    <li>This UI in uninstalled
   * </ul>
   * If you implement your own animation thread,
   * you must override this method.
   *
   * @since 1.4
   * @see #startAnimationTimer
   */
  stopAnimationTimer(): void {
    if (this.animator != null) {
      this.animator.stop();
    }
  }
  /**
   * Removes all listeners installed by this object.
   */
  uninstallListeners(): void {
    this.progressBar.removeChangeListener(this.changeListener);
    this.progressBar.removePropertyChangeListener$PropertyChangeListener($J.fn(this.getHandler(), 'propertyChange'));
    this.handler = null;
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
    if (this.progressBar.isStringPainted() && this.progressBar.getOrientation() === SwingConstants.HORIZONTAL) {
      let metrics = this.progressBar.getFontMetrics(this.progressBar.getFont());
      let insets = this.progressBar.getInsets$();
      let y = insets.top;
      height = (height - insets.top - insets.bottom) | 0;
      return (y + $J.idiv(((height + metrics.getAscent() - metrics.getLeading() - metrics.getDescent()) | 0), 2)) | 0;
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
    if (this.progressBar.isStringPainted() && this.progressBar.getOrientation() === SwingConstants.HORIZONTAL) {
      return Component$BaselineResizeBehavior.CENTER_OFFSET;
    }
    return Component$BaselineResizeBehavior.OTHER;
  }
  /**
   * Returns preferred size of the horizontal {@code JProgressBar}.
   *
   * @return preferred size of the horizontal {@code JProgressBar}
   */
  getPreferredInnerHorizontal(): Dimension {
    let horizDim = DefaultLookup.get(this.progressBar, this, 'ProgressBar.horizontalSize');
    if (horizDim == null) {
      horizDim = new Dimension()._Dimension$int$int(146, 12);
    }
    return horizDim;
  }
  /**
   * Returns preferred size of the vertical {@code JProgressBar}.
   *
   * @return preferred size of the vertical {@code JProgressBar}
   */
  getPreferredInnerVertical(): Dimension {
    let vertDim = DefaultLookup.get(this.progressBar, this, 'ProgressBar.verticalSize');
    if (vertDim == null) {
      vertDim = new Dimension()._Dimension$int$int(12, 146);
    }
    return vertDim;
  }
  /**
   * The "selectionForeground" is the color of the text when it is painted
   * over a filled area of the progress bar.
   *
   * @return the color of the selected foreground
   */
  getSelectionForeground(): Color {
    return this.selectionForeground;
  }
  /**
   * The "selectionBackground" is the color of the text when it is painted
   * over an unfilled area of the progress bar.
   *
   * @return the color of the selected background
   */
  getSelectionBackground(): Color {
    return this.selectionBackground;
  }
  getCachedPercent(): number {
    return this.cachedPercent;
  }
  setCachedPercent(cachedPercent: number): void {
    this.cachedPercent = cachedPercent;
  }
  /**
   * Returns the width (if HORIZONTAL) or height (if VERTICAL)
   * of each of the individual cells/units to be rendered in the
   * progress bar. However, for text rendering simplification and
   * aesthetic considerations, this function will return 1 when
   * the progress string is being rendered.
   *
   * @return the value representing the spacing between cells
   * @see    #setCellLength
   * @see    JProgressBar#isStringPainted
   */
  getCellLength(): number {
    if (this.progressBar.isStringPainted()) {
      return 1;
    } else {
      return this.cellLength;
    }
  }
  /**
   * Returns the spacing between each of the cells/units in the
   * progress bar. However, for text rendering simplification and
   * aesthetic considerations, this function will return 0 when
   * the progress string is being rendered.
   *
   * @return the value representing the spacing between cells
   * @see    #setCellSpacing
   * @see    JProgressBar#isStringPainted
   */
  getCellSpacing(): number {
    if (this.progressBar.isStringPainted()) {
      return 0;
    } else {
      return this.cellSpacing;
    }
  }
  /**
   * This determines the amount of the progress bar that should be filled
   * based on the percent done gathered from the model. This is a common
   * operation so it was abstracted out. It assumes that your progress bar
   * is linear. That is, if you are making a circular progress indicator,
   * you will want to override this method.
   *
   * @param b insets
   * @param width a width
   * @param height a height
   * @return the amount of the progress bar that should be filled
   */
  getAmountFull(b: Insets, width: number, height: number): number {
    let amountFull = 0;
    let model = this.progressBar.getModel();
    if (((model.getMaximum() - model.getMinimum()) | 0) !== 0) {
      if (this.progressBar.getOrientation() === SwingConstants.HORIZONTAL) {
        amountFull = ($J.round(width * this.progressBar.getPercentComplete())) | 0;
      } else {
        amountFull = ($J.round(height * this.progressBar.getPercentComplete())) | 0;
      }
    }
    return amountFull;
  }
  /**
   * Delegates painting to one of two methods:
   * paintDeterminate or paintIndeterminate.
   */
  paint(g: Graphics, c: JComponent): void {
    if (this.progressBar.isIndeterminate()) {
      this.paintIndeterminate(g, c);
    } else {
      this.paintDeterminate(g, c);
    }
  }
  /**
   * Stores the position and size of
   * the bouncing box that would be painted for the current animation index
   * in <code>r</code> and returns <code>r</code>.
   * Subclasses that add to the painting performed
   * in this class's implementation of <code>paintIndeterminate</code> --
   * to draw an outline around the bouncing box, for example --
   * can use this method to get the location of the bouncing
   * box that was just painted.
   * By overriding this method,
   * you have complete control over the size and position
   * of the bouncing box,
   * without having to reimplement <code>paintIndeterminate</code>.
   *
   * @param r  the Rectangle instance to be modified;
   *           may be <code>null</code>
   * @return   <code>null</code> if no box should be drawn;
   *           otherwise, returns the passed-in rectangle
   *           (if non-null)
   *           or a new rectangle
   *
   * @see #setAnimationIndex
   * @since 1.4
   */
  getBox(r: Rectangle): Rectangle {
    let currentFrame = this.getAnimationIndex();
    let middleFrame = $J.idiv(this.numFrames, 2);
    if (this.sizeChanged() || this.delta_ === 0 || this.maxPosition === 0) {
      this.updateSizes();
    }
    r = this.getGenericBox(r);
    if (r == null) {
      return null;
    }
    if (middleFrame <= 0) {
      return null;
    }
    if (this.progressBar.getOrientation() === SwingConstants.HORIZONTAL) {
      if (currentFrame < middleFrame) {
        r.x_ = (this.componentInnards.x_ + (($J.round(this.delta_ * currentFrame)) | 0)) | 0;
      } else {
        r.x_ = (this.maxPosition - (($J.round(this.delta_ * ((currentFrame - middleFrame) | 0))) | 0)) | 0;
      }
    } else {
      if (currentFrame < middleFrame) {
        r.y_ = (this.componentInnards.y_ + (($J.round(this.delta_ * currentFrame)) | 0)) | 0;
      } else {
        r.y_ = (this.maxPosition - (($J.round(this.delta_ * ((currentFrame - middleFrame) | 0))) | 0)) | 0;
      }
    }
    return r;
  }
  /**
   * Updates delta, max position.
   * Assumes componentInnards is correct (e.g. call after sizeChanged()).
   */
  updateSizes(): void {
    let length = 0;
    if (this.progressBar.getOrientation() === SwingConstants.HORIZONTAL) {
      length = this.getBoxLength(this.componentInnards.width_, this.componentInnards.height_);
      this.maxPosition = (this.componentInnards.x_ + this.componentInnards.width_ - length) | 0;
    } else {
      length = this.getBoxLength(this.componentInnards.height_, this.componentInnards.width_);
      this.maxPosition = (this.componentInnards.y_ + this.componentInnards.height_ - length) | 0;
    }
    this.delta_ = 2 * this.maxPosition / this.numFrames;
  }
  /**
   * Assumes that the component innards, max position, etc. are up-to-date.
   */
  getGenericBox(r: Rectangle): Rectangle {
    if (r == null) {
      r = new Rectangle()._Rectangle$();
    }
    if (this.progressBar.getOrientation() === SwingConstants.HORIZONTAL) {
      r.width_ = this.getBoxLength(this.componentInnards.width_, this.componentInnards.height_);
      if (r.width_ < 0) {
        r = null;
      } else {
        r.height_ = this.componentInnards.height_;
        r.y_ = this.componentInnards.y_;
      }
    } else {
      r.height_ = this.getBoxLength(this.componentInnards.height_, this.componentInnards.width_);
      if (r.height_ < 0) {
        r = null;
      } else {
        r.width_ = this.componentInnards.width_;
        r.x_ = this.componentInnards.x_;
      }
    }
    return r;
  }
  /**
   * Returns the length
   * of the "bouncing box" to be painted.
   * This method is invoked by the
   * default implementation of <code>paintIndeterminate</code>
   * to get the width (if the progress bar is horizontal)
   * or height (if vertical) of the box.
   * For example:
   * <blockquote>
   * <pre>
   * boxRect.width = getBoxLength(componentInnards.width,
   *                             componentInnards.height);
   * </pre>
   * </blockquote>
   *
   * @param availableLength  the amount of space available
   *                         for the bouncing box to move in;
   *                         for a horizontal progress bar,
   *                         for example,
   *                         this should be
   *                         the inside width of the progress bar
   *                         (the component width minus borders)
   * @param otherDimension   for a horizontal progress bar, this should be
   *                         the inside height of the progress bar; this
   *                         value might be used to constrain or determine
   *                         the return value
   *
   * @return the size of the box dimension being determined;
   *         must be no larger than <code>availableLength</code>
   *
   * @see javax.swing.SwingUtilities#calculateInnerArea
   * @since 1.5
   */
  getBoxLength(availableLength: number, otherDimension: number): number {
    return ($J.round(availableLength / 6)) | 0;
  }
  /**
   * All purpose paint method that should do the right thing for all
   * linear bouncing-box progress bars.
   * Override this if you are making another kind of
   * progress bar.
   *
   * @param g an instance of {@code Graphics}
   * @param c a component
   * @see #paintDeterminate
   *
   * @since 1.4
   */
  paintIndeterminate(g: Graphics, c: JComponent): void {
    if (!(g instanceof Graphics2D)) {
      return;
    }
    let b = this.progressBar.getInsets$();
    let barRectWidth = (this.progressBar.getWidth() - (b.right + b.left)) | 0;
    let barRectHeight = (this.progressBar.getHeight() - (b.top + b.bottom)) | 0;
    if (barRectWidth <= 0 || barRectHeight <= 0) {
      return;
    }
    let g2 = g;
    this.boxRect = this.getBox(this.boxRect);
    if (this.boxRect != null) {
      g2.setColor(this.progressBar.getForeground());
      g2.fillRect(this.boxRect.x_, this.boxRect.y_, this.boxRect.width_, this.boxRect.height_);
    }
    if (this.progressBar.isStringPainted()) {
      if (this.progressBar.getOrientation() === SwingConstants.HORIZONTAL) {
        this.paintString$Graphics$int$int$int$int$int$int$Insets$BasicProgressBarUI(g2, b.left, b.top, barRectWidth, barRectHeight, this.boxRect.x_, this.boxRect.width_, b);
      } else {
        this.paintString$Graphics$int$int$int$int$int$int$Insets$BasicProgressBarUI(g2, b.left, b.top, barRectWidth, barRectHeight, this.boxRect.y_, this.boxRect.height_, b);
      }
    }
  }
  /**
   * All purpose paint method that should do the right thing for almost
   * all linear, determinate progress bars. By setting a few values in
   * the defaults
   * table, things should work just fine to paint your progress bar.
   * Naturally, override this if you are making a circular or
   * semi-circular progress bar.
   *
   * @param g an instance of {@code Graphics}
   * @param c a component
   * @see #paintIndeterminate
   *
   * @since 1.4
   */
  paintDeterminate(g: Graphics, c: JComponent): void {
    if (!(g instanceof Graphics2D)) {
      return;
    }
    let b = this.progressBar.getInsets$();
    let barRectWidth = (this.progressBar.getWidth() - (b.right + b.left)) | 0;
    let barRectHeight = (this.progressBar.getHeight() - (b.top + b.bottom)) | 0;
    if (barRectWidth <= 0 || barRectHeight <= 0) {
      return;
    }
    let cellLength = this.getCellLength();
    let cellSpacing = this.getCellSpacing();
    let amountFull = this.getAmountFull(b, barRectWidth, barRectHeight);
    let g2 = g;
    g2.setColor(this.progressBar.getForeground());
    if (this.progressBar.getOrientation() === SwingConstants.HORIZONTAL) {
      if (cellSpacing === 0 && amountFull > 0) {
        g2.setStroke(new BasicStroke()._BasicStroke$float$int$int(Math.fround(barRectHeight), BasicStroke.CAP_BUTT, BasicStroke.JOIN_BEVEL));
      } else {
        g2.setStroke(new BasicStroke()._BasicStroke$float$int$int$float$floatArr$float(Math.fround(barRectHeight), BasicStroke.CAP_BUTT, BasicStroke.JOIN_BEVEL, 0, [Math.fround(cellLength), Math.fround(cellSpacing)], 0));
      }
      if (BasicGraphicsUtils.isLeftToRight(c)) {
        g2.drawLine(b.left, (($J.idiv(barRectHeight, 2)) + b.top) | 0, (amountFull + b.left) | 0, (($J.idiv(barRectHeight, 2)) + b.top) | 0);
      } else {
        g2.drawLine(((barRectWidth + b.left) | 0), (($J.idiv(barRectHeight, 2)) + b.top) | 0, (barRectWidth + b.left - amountFull) | 0, (($J.idiv(barRectHeight, 2)) + b.top) | 0);
      }
    } else {
      if (cellSpacing === 0 && amountFull > 0) {
        g2.setStroke(new BasicStroke()._BasicStroke$float$int$int(Math.fround(barRectWidth), BasicStroke.CAP_BUTT, BasicStroke.JOIN_BEVEL));
      } else {
        g2.setStroke(new BasicStroke()._BasicStroke$float$int$int$float$floatArr$float(Math.fround(barRectWidth), BasicStroke.CAP_BUTT, BasicStroke.JOIN_BEVEL, 0, [Math.fround(cellLength), Math.fround(cellSpacing)], 0));
      }
      g2.drawLine(($J.idiv(barRectWidth, 2) + b.left) | 0, (b.top + barRectHeight) | 0, ($J.idiv(barRectWidth, 2) + b.left) | 0, (b.top + barRectHeight - amountFull) | 0);
    }
    if (this.progressBar.isStringPainted()) {
      this.paintString$Graphics$int$int$int$int$int$Insets(g, b.left, b.top, barRectWidth, barRectHeight, amountFull, b);
    }
  }
  /**
   * Paints the progress string.
   *
   * @param g an instance of {@code Graphics}
   * @param x X location of bounding box
   * @param y Y location of bounding box
   * @param width width of bounding box
   * @param height height of bounding box
   * @param amountFull size of the fill region, either width or height
   *        depending upon orientation.
   * @param b Insets of the progress bar.
   */
  paintString$Graphics$int$int$int$int$int$Insets(g: Graphics, x: number, y: number, width: number, height: number, amountFull: number, b: Insets): void {
    if (this.progressBar.getOrientation() === SwingConstants.HORIZONTAL) {
      if (BasicGraphicsUtils.isLeftToRight(this.progressBar)) {
        if (this.progressBar.isIndeterminate()) {
          this.boxRect = this.getBox(this.boxRect);
          this.paintString$Graphics$int$int$int$int$int$int$Insets$BasicProgressBarUI(g, x, y, width, height, this.boxRect.x_, this.boxRect.width_, b);
        } else {
          this.paintString$Graphics$int$int$int$int$int$int$Insets$BasicProgressBarUI(g, x, y, width, height, x, amountFull, b);
        }
      } else {
        this.paintString$Graphics$int$int$int$int$int$int$Insets$BasicProgressBarUI(g, x, y, width, height, (x + width - amountFull) | 0, amountFull, b);
      }
    } else {
      if (this.progressBar.isIndeterminate()) {
        this.boxRect = this.getBox(this.boxRect);
        this.paintString$Graphics$int$int$int$int$int$int$Insets$BasicProgressBarUI(g, x, y, width, height, this.boxRect.y_, this.boxRect.height_, b);
      } else {
        this.paintString$Graphics$int$int$int$int$int$int$Insets$BasicProgressBarUI(g, x, y, width, height, (y + height - amountFull) | 0, amountFull, b);
      }
    }
  }
  /**
   * Paints the progress string.
   *
   * @param g Graphics used for drawing.
   * @param x x location of bounding box
   * @param y y location of bounding box
   * @param width width of bounding box
   * @param height height of bounding box
   * @param fillStart start location, in x or y depending on orientation,
   *        of the filled portion of the progress bar.
   * @param amountFull size of the fill region, either width or height
   *        depending upon orientation.
   * @param b Insets of the progress bar.
   */
  paintString$Graphics$int$int$int$int$int$int$Insets$BasicProgressBarUI(g: Graphics, x: number, y: number, width: number, height: number, fillStart: number, amountFull: number, b: Insets): void {
    if (!(g instanceof Graphics2D)) {
      return;
    }
    let g2 = g;
    let progressString = this.progressBar.getString();
    g2.setFont(this.progressBar.getFont());
    let renderLocation = this.getStringPlacement(g2, progressString, x, y, width, height);
    let oldClip = g2.getClipBounds$();
    if (this.progressBar.getOrientation() === SwingConstants.HORIZONTAL) {
      g2.setColor(this.getSelectionBackground());
      SwingUtilities2.drawString$JComponent$Graphics$String$int$int(this.progressBar, g2, progressString, renderLocation.x_, renderLocation.y_);
      g2.setColor(this.getSelectionForeground());
      g2.clipRect(fillStart, y, amountFull, height);
      SwingUtilities2.drawString$JComponent$Graphics$String$int$int(this.progressBar, g2, progressString, renderLocation.x_, renderLocation.y_);
    } else {
      g2.setColor(this.getSelectionBackground());
      let rotate = AffineTransform.getRotateInstance$double(3.141592653589793 / 2);
      g2.setFont(this.progressBar.getFont().deriveFont$AffineTransform(rotate));
      renderLocation = this.getStringPlacement(g2, progressString, x, y, width, height);
      SwingUtilities2.drawString$JComponent$Graphics$String$int$int(this.progressBar, g2, progressString, renderLocation.x_, renderLocation.y_);
      g2.setColor(this.getSelectionForeground());
      g2.clipRect(x, fillStart, width, amountFull);
      SwingUtilities2.drawString$JComponent$Graphics$String$int$int(this.progressBar, g2, progressString, renderLocation.x_, renderLocation.y_);
    }
    g2.setClip$Shape(oldClip);
  }
  /**
   * Designate the place where the progress string will be painted.
   * This implementation places it at the center of the progress
   * bar (in both x and y). Override this if you want to right,
   * left, top, or bottom align the progress string or if you need
   * to nudge it around for any reason.
   *
   * @param g an instance of {@code Graphics}
   * @param progressString a text
   * @param x an X coordinate
   * @param y an Y coordinate
   * @param width a width
   * @param height a height
   * @return the place where the progress string will be painted
   */
  getStringPlacement(g: Graphics, progressString: string, x: number, y: number, width: number, height: number): Point {
    let fontSizer = SwingUtilities2.getFontMetrics$JComponent$Graphics$Font(this.progressBar, g, this.progressBar.getFont());
    let stringWidth = SwingUtilities2.stringWidth$JComponent$FontMetrics$String(this.progressBar, fontSizer, progressString);
    if (this.progressBar.getOrientation() === SwingConstants.HORIZONTAL) {
      return new Point()._Point$int$int((x + (($J.round(width / 2 - stringWidth / 2)) | 0)) | 0, (y + ($J.idiv(((height + fontSizer.getAscent() - fontSizer.getLeading() - fontSizer.getDescent()) | 0), 2))) | 0);
    } else {
      return new Point()._Point$int$int((x + ($J.idiv(((width - fontSizer.getAscent() + fontSizer.getLeading() + fontSizer.getDescent()) | 0), 2))) | 0, (y + (($J.round(height / 2 - stringWidth / 2)) | 0)) | 0);
    }
  }
  getPreferredSize$JComponent(c: JComponent): Dimension {
    let size: Dimension;
    let border = this.progressBar.getInsets$();
    let fontSizer = this.progressBar.getFontMetrics(this.progressBar.getFont());
    if (this.progressBar.getOrientation() === SwingConstants.HORIZONTAL) {
      size = new Dimension()._Dimension$Dimension(this.getPreferredInnerHorizontal());
      if (this.progressBar.isStringPainted()) {
        let progString = this.progressBar.getString();
        let stringWidth = SwingUtilities2.stringWidth$JComponent$FontMetrics$String(this.progressBar, fontSizer, progString);
        if (stringWidth > size.width_) {
          size.width_ = stringWidth;
        }
        let stringHeight = (fontSizer.getHeight() + fontSizer.getDescent()) | 0;
        if (stringHeight > size.height_) {
          size.height_ = stringHeight;
        }
      }
    } else {
      size = new Dimension()._Dimension$Dimension(this.getPreferredInnerVertical());
      if (this.progressBar.isStringPainted()) {
        let progString = this.progressBar.getString();
        let stringHeight = (fontSizer.getHeight() + fontSizer.getDescent()) | 0;
        if (stringHeight > size.width_) {
          size.width_ = stringHeight;
        }
        let stringWidth = SwingUtilities2.stringWidth$JComponent$FontMetrics$String(this.progressBar, fontSizer, progString);
        if (stringWidth > size.height_) {
          size.height_ = stringWidth;
        }
      }
    }
    size.width_ = (size.width_ + (border.left + border.right)) | 0;
    size.height_ = (size.height_ + (border.top + border.bottom)) | 0;
    return size;
  }
  /**
   * The Minimum size for this component is 10. The rationale here
   * is that there should be at least one pixel per 10 percent.
   */
  getMinimumSize(c: JComponent): Dimension {
    let pref = this.getPreferredSize$JComponent(this.progressBar);
    if (this.progressBar.getOrientation() === SwingConstants.HORIZONTAL) {
      pref.width_ = 10;
    } else {
      pref.height_ = 10;
    }
    return pref;
  }
  getMaximumSize(c: JComponent): Dimension {
    let pref = this.getPreferredSize$JComponent(this.progressBar);
    if (this.progressBar.getOrientation() === SwingConstants.HORIZONTAL) {
      pref.width_ = 32767;
    } else {
      pref.height_ = 32767;
    }
    return pref;
  }
  /**
   * Gets the index of the current animation frame.
   *
   * @return the index of the current animation frame
   * @since 1.4
   */
  getAnimationIndex(): number {
    return this.animationIndex;
  }
  /**
   * Sets the index of the current animation frame
   * to the specified value and requests that the
   * progress bar be repainted.
   * Subclasses that don't use the default painting code
   * might need to override this method
   * to change the way that the <code>repaint</code> method
   * is invoked.
   *
   * @param newValue the new animation index; no checking
   *                 is performed on its value
   * @see #incrementAnimationIndex
   *
   * @since 1.4
   */
  setAnimationIndex(newValue: number): void {
    if (this.animationIndex !== newValue) {
      if (this.sizeChanged()) {
        this.animationIndex = newValue;
        this.maxPosition = 0;
        this.delta_ = 0;
        this.progressBar.repaint$();
        return;
      }
      this.nextPaintRect = this.getBox(this.nextPaintRect);
      this.animationIndex = newValue;
      if (this.nextPaintRect != null) {
        this.boxRect = this.getBox(this.boxRect);
        if (this.boxRect != null) {
          this.nextPaintRect.add$Rectangle(this.boxRect);
        }
      }
    } else {
      return;
    }
    if (this.nextPaintRect != null) {
      this.progressBar.repaint$Rectangle(this.nextPaintRect);
    } else {
      this.progressBar.repaint$();
    }
  }
  sizeChanged(): boolean {
    if ((this.oldComponentInnards == null) || (this.componentInnards == null)) {
      return true;
    }
    this.oldComponentInnards.setRect$Rectangle2D(this.componentInnards);
    this.componentInnards = SwingUtilities.calculateInnerArea(this.progressBar, this.componentInnards);
    return !this.oldComponentInnards.equals(this.componentInnards);
  }
  /**
   * Sets the index of the current animation frame,
   * to the next valid value,
   * which results in the progress bar being repainted.
   * The next valid value is, by default,
   * the current animation index plus one.
   * If the new value would be too large,
   * this method sets the index to 0.
   * Subclasses might need to override this method
   * to ensure that the index does not go over
   * the number of frames needed for the particular
   * progress bar instance.
   * This method is invoked by the default animation thread
   * every <em>X</em> milliseconds,
   * where <em>X</em> is specified by the "ProgressBar.repaintInterval"
   * UI default.
   *
   * @see #setAnimationIndex
   * @since 1.4
   */
  incrementAnimationIndex(): void {
    let newValue = (this.getAnimationIndex() + 1) | 0;
    if (newValue < this.numFrames) {
      this.setAnimationIndex(newValue);
    } else {
      this.setAnimationIndex(0);
    }
  }
  /**
   * Returns the desired number of milliseconds between repaints.
   * This value is meaningful
   * only if the progress bar is in indeterminate mode.
   * The repaint interval determines how often the
   * default animation thread's timer is fired.
   * It's also used by the default indeterminate progress bar
   * painting code when determining
   * how far to move the bouncing box per frame.
   * The repaint interval is specified by
   * the "ProgressBar.repaintInterval" UI default.
   *
   * @return  the repaint interval, in milliseconds
   */
  getRepaintInterval(): number {
    return this.repaintInterval;
  }
  initRepaintInterval(): number {
    this.repaintInterval = DefaultLookup.getInt$JComponent$ComponentUI$String$int(this.progressBar, this, 'ProgressBar.repaintInterval', 50);
    return this.repaintInterval;
  }
  initCycleTime(): number {
    this.cycleTime = DefaultLookup.getInt$JComponent$ComponentUI$String$int(this.progressBar, this, 'ProgressBar.cycleTime', 3000);
    return this.cycleTime;
  }
  /**
   * Initialize cycleTime, repaintInterval, numFrames, animationIndex.
   */
  initIndeterminateDefaults(): void {
    this.initRepaintInterval();
    this.initCycleTime();
    if (this.repaintInterval <= 0) {
      this.repaintInterval = 100;
    }
    if (this.repaintInterval > this.cycleTime) {
      this.cycleTime = Math.imul(this.repaintInterval, 20);
    } else {
      let factor = $J.d2i(Math.ceil((this.cycleTime) / (this.repaintInterval * 2)));
      this.cycleTime = Math.imul(Math.imul(this.repaintInterval, factor), 2);
    }
  }
  /**
   * Invoked by PropertyChangeHandler.
   *
   *  NOTE: This might not be invoked until after the first
   *  paintIndeterminate call.
   */
  initIndeterminateValues(): void {
    this.initIndeterminateDefaults();
    this.numFrames = $J.idiv(this.cycleTime, this.repaintInterval);
    this.initAnimationIndex();
    this.boxRect = new Rectangle()._Rectangle$();
    this.nextPaintRect = new Rectangle()._Rectangle$();
    this.componentInnards = new Rectangle()._Rectangle$();
    this.oldComponentInnards = new Rectangle()._Rectangle$();
    this.progressBar.addHierarchyListener($J.fn(this.getHandler(), 'hierarchyChanged'));
    if (this.progressBar.isDisplayable()) {
      this.startAnimationTimer();
    }
  }
  /**
   * Invoked by PropertyChangeHandler.
   */
  cleanUpIndeterminateValues(): void {
    if (this.progressBar.isDisplayable()) {
      this.stopAnimationTimer();
    }
    this.cycleTime = this.repaintInterval = 0;
    this.numFrames = this.animationIndex = 0;
    this.maxPosition = 0;
    this.delta_ = 0;
    this.boxRect = this.nextPaintRect = null;
    this.componentInnards = this.oldComponentInnards = null;
    this.progressBar.removeHierarchyListener($J.fn(this.getHandler(), 'hierarchyChanged'));
  }
  initAnimationIndex(): void {
    if ((this.progressBar.getOrientation() === SwingConstants.HORIZONTAL) && (BasicGraphicsUtils.isLeftToRight(this.progressBar))) {
      this.setAnimationIndex(0);
    } else {
      this.setAnimationIndex($J.idiv(this.numFrames, 2));
    }
  }
  static $clinit() {
    BasicProgressBarUI.ADJUSTTIMER = true;
  }
}

/**
 * Implements an animation thread that invokes repaint
 * at a fixed rate.  If ADJUSTTIMER is true, this thread
 * will continuously adjust the repaint interval to
 * try to make the actual time between repaints match
 * the requested rate.
 */
export class BasicProgressBarUI$Animator extends JObject {
  timer: Timer = null;
  previousDelay: number = 0;
  interval: number = 0;
  lastCall: number = 0;
  MINIMUM_DELAY: number = 0;
  _BasicProgressBarUI$Animator(): this {
    this.MINIMUM_DELAY = 5;
    return this;
  }
  /**
   * Creates a timer if one doesn't already exist,
   * then starts the timer thread.
   */
  start(interval: number): void {
    this.previousDelay = interval;
    this.lastCall = 0;
    if (this.timer == null) {
      this.timer = new Timer()._Timer(interval, $J.fn(this, 'actionPerformed'));
    } else {
      this.timer.setDelay(interval);
    }
    if (BasicProgressBarUI.ADJUSTTIMER) {
      this.timer.setRepeats(false);
      this.timer.setCoalesce(false);
    }
    this.timer.start();
  }
  /**
   * Stops the timer thread.
   */
  stop(): void {
    this.timer.stop();
  }
  /**
   * Reacts to the timer's action events.
   */
  actionPerformed(e: ActionEvent): void {
    if (BasicProgressBarUI.ADJUSTTIMER) {
      let time = $J.system_currentTimeMillis();
      if (this.lastCall > 0) {
        let nextDelay = ((this.previousDelay - time + this.lastCall + this.$outer.getRepaintInterval())) | 0;
        if (nextDelay < this.MINIMUM_DELAY) {
          nextDelay = this.MINIMUM_DELAY;
        }
        this.timer.setInitialDelay(nextDelay);
        this.previousDelay = nextDelay;
      }
      this.timer.start();
      this.lastCall = time;
    }
    this.$outer.incrementAnimationIndex();
  }
}

export class BasicProgressBarUI$Handler extends JObject {
  _BasicProgressBarUI$Handler(): this {
    return this;
  }
  stateChanged(e: ChangeEvent): void {
    let model = this.$outer.progressBar.getModel();
    let newRange = (model.getMaximum() - model.getMinimum()) | 0;
    let newPercent: number;
    let oldPercent = this.$outer.getCachedPercent();
    if (newRange > 0) {
      newPercent = (($J.ldiv((100 * model.getValue()), newRange))) | 0;
    } else {
      newPercent = 0;
    }
    if (newPercent !== oldPercent) {
      this.$outer.setCachedPercent(newPercent);
      this.$outer.progressBar.repaint$();
    }
  }
  propertyChange(e: PropertyChangeEvent): void {
    let prop = e.getPropertyName();
    if ('indeterminate' === prop) {
      if (this.$outer.progressBar.isIndeterminate()) {
        this.$outer.initIndeterminateValues();
      } else {
        this.$outer.cleanUpIndeterminateValues();
      }
      this.$outer.progressBar.repaint$();
    }
  }
  hierarchyChanged(he: HierarchyEvent): void {
    if (($J.land(he.getChangeFlags(), HierarchyEvent.DISPLAYABILITY_CHANGED)) !== 0) {
      if (this.$outer.progressBar.isIndeterminate()) {
        if (this.$outer.progressBar.isDisplayable()) {
          this.$outer.startAnimationTimer();
        } else {
          this.$outer.stopAnimationTimer();
        }
      }
    }
  }
}

$J.define(BasicProgressBarUI, 'javax.swing.plaf.basic.BasicProgressBarUI', { kind: 'class', sup: 'javax.swing.plaf.ProgressBarUI', ctors: { '': '_BasicProgressBarUI' }, meths: { 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent', 'paintString(java.awt.Graphics,int,int,int,int,int,int,java.awt.Insets)': 'paintString$Graphics$int$int$int$int$int$int$Insets$BasicProgressBarUI', 'paintString(java.awt.Graphics,int,int,int,int,int,java.awt.Insets)': 'paintString$Graphics$int$int$int$int$int$Insets', 'getBaseline(javax.swing.JComponent,int,int)': 'getBaseline$JComponent$int$int' }, clinit: true, lazy: ['ADJUSTTIMER'] });
$J.define(BasicProgressBarUI$Animator, 'javax.swing.plaf.basic.BasicProgressBarUI$Animator', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'java.lang.Object', ctors: { '': '_BasicProgressBarUI$Animator' }, inner: true });
$J.define(BasicProgressBarUI$Handler, 'javax.swing.plaf.basic.BasicProgressBarUI$Handler', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener', 'java.beans.PropertyChangeListener', 'java.awt.event.HierarchyListener'], sup: 'java.lang.Object', ctors: { '': '_BasicProgressBarUI$Handler' }, inner: true });
$J.module(() => {
  BasicStroke = $J.load('java.awt.BasicStroke');
  Component$BaselineResizeBehavior = $J.load('java.awt.Component$BaselineResizeBehavior');
  Dimension = $J.load('java.awt.Dimension');
  Graphics2D = $J.load('java.awt.Graphics2D');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  HierarchyEvent = $J.load('java.awt.event.HierarchyEvent');
  AffineTransform = $J.load('java.awt.geom.AffineTransform');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  Timer = $J.load('javax.swing.Timer');
  UIManager = $J.load('javax.swing.UIManager');
  BasicGraphicsUtils = $J.load('javax.swing.plaf.basic.BasicGraphicsUtils');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
