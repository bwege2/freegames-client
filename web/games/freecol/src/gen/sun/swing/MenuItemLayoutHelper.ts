// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/swing/MenuItemLayoutHelper.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2002, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Integer, JObject, JString } from '../../../jre/index.ts';

let Rectangle, KeyEvent, JComponent, JMenu, SwingConstants, SwingUtilities, UIManager, BasicHTML, View, StringUIClientPropertyKey, SwingUtilities2;

/**
 * Calculates preferred size and layouts menu items.
 */
export class MenuItemLayoutHelper extends JObject {
  static MAX_ARROW_WIDTH: StringUIClientPropertyKey = null;
  static MAX_CHECK_WIDTH: StringUIClientPropertyKey = null;
  static MAX_ICON_WIDTH: StringUIClientPropertyKey = null;
  static MAX_TEXT_WIDTH: StringUIClientPropertyKey = null;
  static MAX_ACC_WIDTH: StringUIClientPropertyKey = null;
  static MAX_LABEL_WIDTH: StringUIClientPropertyKey = null;
  mi: JMenuItem = null;
  miParent: JComponent = null;
  font: Font = null;
  accFont: Font = null;
  fm: FontMetrics = null;
  accFm: FontMetrics = null;
  icon: Icon = null;
  checkIcon: Icon = null;
  arrowIcon: Icon = null;
  text_: string = null;
  accText: string = null;
  isColumnLayout_: boolean = false;
  useCheckAndArrow_: boolean = false;
  isLeftToRight_: boolean = false;
  isTopLevelMenu_: boolean = false;
  htmlView: View = null;
  verticalAlignment: number = 0;
  horizontalAlignment: number = 0;
  verticalTextPosition: number = 0;
  horizontalTextPosition: number = 0;
  gap_: number = 0;
  leadingGap: number = 0;
  afterCheckIconGap: number = 0;
  minTextOffset: number = 0;
  leftTextExtraWidth: number = 0;
  viewRect: Rectangle = null;
  iconSize: MenuItemLayoutHelper$RectSize = null;
  textSize: MenuItemLayoutHelper$RectSize = null;
  accSize: MenuItemLayoutHelper$RectSize = null;
  checkSize: MenuItemLayoutHelper$RectSize = null;
  arrowSize: MenuItemLayoutHelper$RectSize = null;
  labelSize: MenuItemLayoutHelper$RectSize = null;
  _MenuItemLayoutHelper$JMenuItem$Icon$Icon$Rectangle$int$String$boolean$Font$Font$boolean$String(mi: JMenuItem, checkIcon: Icon, arrowIcon: Icon, viewRect: Rectangle, gap: number, accDelimiter: string, isLeftToRight: boolean, font: Font, accFont: Font, useCheckAndArrow: boolean, propertyPrefix: string): this {
    this.reset(mi, checkIcon, arrowIcon, viewRect, gap, accDelimiter, isLeftToRight, font, accFont, useCheckAndArrow, propertyPrefix);
    return this;
  }
  reset(mi: JMenuItem, checkIcon: Icon, arrowIcon: Icon, viewRect: Rectangle, gap: number, accDelimiter: string, isLeftToRight: boolean, font: Font, accFont: Font, useCheckAndArrow: boolean, propertyPrefix: string): void {
    this.mi = mi;
    this.miParent = MenuItemLayoutHelper.getMenuItemParent(mi);
    this.accText = this.getAccText$String$MenuItemLayoutHelper(accDelimiter);
    this.verticalAlignment = mi.getVerticalAlignment();
    this.horizontalAlignment = mi.getHorizontalAlignment();
    this.verticalTextPosition = mi.getVerticalTextPosition();
    this.horizontalTextPosition = mi.getHorizontalTextPosition();
    this.useCheckAndArrow_ = useCheckAndArrow;
    this.font = font;
    this.accFont = accFont;
    this.fm = mi.getFontMetrics(font);
    this.accFm = mi.getFontMetrics(accFont);
    this.isLeftToRight_ = isLeftToRight;
    this.isColumnLayout_ = MenuItemLayoutHelper.isColumnLayout$boolean$int$int$int(isLeftToRight, this.horizontalAlignment, this.horizontalTextPosition, this.verticalTextPosition);
    this.isTopLevelMenu_ = (this.miParent == null) ? true : false;
    this.checkIcon = checkIcon;
    this.icon = this.getIcon$String$MenuItemLayoutHelper(propertyPrefix);
    this.arrowIcon = arrowIcon;
    this.text_ = mi.getText();
    this.gap_ = gap;
    this.afterCheckIconGap = this.getAfterCheckIconGap$String$MenuItemLayoutHelper(propertyPrefix);
    this.minTextOffset = this.getMinTextOffset$String$MenuItemLayoutHelper(propertyPrefix);
    this.htmlView = mi.getClientProperty(BasicHTML.propertyKey);
    this.viewRect = viewRect;
    this.iconSize = new MenuItemLayoutHelper$RectSize()._MenuItemLayoutHelper$RectSize$();
    this.textSize = new MenuItemLayoutHelper$RectSize()._MenuItemLayoutHelper$RectSize$();
    this.accSize = new MenuItemLayoutHelper$RectSize()._MenuItemLayoutHelper$RectSize$();
    this.checkSize = new MenuItemLayoutHelper$RectSize()._MenuItemLayoutHelper$RectSize$();
    this.arrowSize = new MenuItemLayoutHelper$RectSize()._MenuItemLayoutHelper$RectSize$();
    this.labelSize = new MenuItemLayoutHelper$RectSize()._MenuItemLayoutHelper$RectSize$();
    this.calcExtraWidths();
    this.calcWidthsAndHeights();
    this.setOriginalWidths();
    this.calcMaxWidths();
    this.leadingGap = this.getLeadingGap$String$MenuItemLayoutHelper(propertyPrefix);
    this.calcMaxTextOffset(viewRect);
  }
  calcExtraWidths(): void {
    this.leftTextExtraWidth = this.getLeftExtraWidth(this.text_);
  }
  getLeftExtraWidth(str: string): number {
    let lsb = SwingUtilities2.getLeftSideBearing$JComponent$FontMetrics$String(this.mi, this.fm, str);
    if (lsb < 0) {
      return -lsb;
    } else {
      return 0;
    }
  }
  setOriginalWidths(): void {
    this.iconSize.origWidth = this.iconSize.width_;
    this.textSize.origWidth = this.textSize.width_;
    this.accSize.origWidth = this.accSize.width_;
    this.checkSize.origWidth = this.checkSize.width_;
    this.arrowSize.origWidth = this.arrowSize.width_;
  }
  getAccText$String$MenuItemLayoutHelper(acceleratorDelimiter: string): string {
    let accText = '';
    let accelerator = this.mi.getAccelerator();
    if (accelerator != null) {
      let modifiers = accelerator.getModifiers();
      if (modifiers > 0) {
        accText = KeyEvent.getKeyModifiersText(modifiers);
        accText += acceleratorDelimiter;
      }
      let keyCode = accelerator.getKeyCode();
      if (keyCode !== 0) {
        accText += KeyEvent.getKeyText(keyCode);
      } else {
        accText += String.fromCharCode(accelerator.getKeyChar());
      }
    }
    return accText;
  }
  getIcon$String$MenuItemLayoutHelper(propertyPrefix: string): Icon {
    let icon = null;
    let iconFactory = UIManager.get$Object(propertyPrefix + '.checkIconFactory');
    if (!this.isColumnLayout_ || !this.useCheckAndArrow_ || iconFactory == null || !iconFactory.isCompatible(this.checkIcon, propertyPrefix)) {
      icon = this.mi.getIcon();
    }
    return icon;
  }
  getMinTextOffset$String$MenuItemLayoutHelper(propertyPrefix: string): number {
    let minimumTextOffset = 0;
    let minimumTextOffsetObject = UIManager.get$Object(propertyPrefix + '.minimumTextOffset');
    if ($J.isa(minimumTextOffsetObject, Integer)) {
      minimumTextOffset = minimumTextOffsetObject;
    }
    return minimumTextOffset;
  }
  getAfterCheckIconGap$String$MenuItemLayoutHelper(propertyPrefix: string): number {
    let afterCheckIconGap = this.gap_;
    let afterCheckIconGapObject = UIManager.get$Object(propertyPrefix + '.afterCheckIconGap');
    if ($J.isa(afterCheckIconGapObject, Integer)) {
      afterCheckIconGap = afterCheckIconGapObject;
    }
    return afterCheckIconGap;
  }
  getLeadingGap$String$MenuItemLayoutHelper(propertyPrefix: string): number {
    if (this.checkSize.getMaxWidth() > 0) {
      return this.getCheckOffset(propertyPrefix);
    } else {
      return this.gap_;
    }
  }
  getCheckOffset(propertyPrefix: string): number {
    let checkIconOffset = this.gap_;
    let checkIconOffsetObject = UIManager.get$Object(propertyPrefix + '.checkIconOffset');
    if ($J.isa(checkIconOffsetObject, Integer)) {
      checkIconOffset = checkIconOffsetObject;
    }
    return checkIconOffset;
  }
  calcWidthsAndHeights(): void {
    if (this.icon != null) {
      this.iconSize.width_ = this.icon.getIconWidth();
      this.iconSize.height_ = this.icon.getIconHeight();
    }
    if (!(this.accText.length === 0)) {
      this.accSize.width_ = SwingUtilities2.stringWidth$JComponent$FontMetrics$String(this.mi, this.accFm, this.accText);
      this.accSize.height_ = this.accFm.getHeight();
    }
    if (this.text_ == null) {
      this.text_ = '';
    } else if (!(this.text_.length === 0)) {
      if (this.htmlView != null) {
        this.textSize.width_ = $J.d2i(this.htmlView.getPreferredSpan(View.X_AXIS));
        this.textSize.height_ = $J.d2i(this.htmlView.getPreferredSpan(View.Y_AXIS));
      } else {
        this.textSize.width_ = SwingUtilities2.stringWidth$JComponent$FontMetrics$String(this.mi, this.fm, this.text_);
        this.textSize.height_ = this.fm.getHeight();
      }
    }
    if (this.useCheckAndArrow_) {
      if (this.checkIcon != null) {
        this.checkSize.width_ = this.checkIcon.getIconWidth();
        this.checkSize.height_ = this.checkIcon.getIconHeight();
      }
      if (this.arrowIcon != null) {
        this.arrowSize.width_ = this.arrowIcon.getIconWidth();
        this.arrowSize.height_ = this.arrowIcon.getIconHeight();
      }
    }
    if (this.isColumnLayout_) {
      this.labelSize.width_ = (this.iconSize.width_ + this.textSize.width_ + this.gap_) | 0;
      this.labelSize.height_ = MenuItemLayoutHelper.max([this.checkSize.height_, this.iconSize.height_, this.textSize.height_, this.accSize.height_, this.arrowSize.height_]);
    } else {
      let textRect = new Rectangle()._Rectangle$();
      let iconRect = new Rectangle()._Rectangle$();
      SwingUtilities.layoutCompoundLabel$JComponent$FontMetrics$String$Icon$int$int$int$int$Rectangle$Rectangle$Rectangle$int(this.mi, this.fm, this.text_, this.icon, this.verticalAlignment, this.horizontalAlignment, this.verticalTextPosition, this.horizontalTextPosition, this.viewRect, iconRect, textRect, this.gap_);
      textRect.width_ = (textRect.width_ + this.leftTextExtraWidth) | 0;
      let labelRect = iconRect.union(textRect);
      this.labelSize.height_ = labelRect.height_;
      this.labelSize.width_ = labelRect.width_;
    }
  }
  calcMaxWidths(): void {
    this.calcMaxWidth(this.checkSize, MenuItemLayoutHelper.MAX_CHECK_WIDTH);
    this.calcMaxWidth(this.arrowSize, MenuItemLayoutHelper.MAX_ARROW_WIDTH);
    this.calcMaxWidth(this.accSize, MenuItemLayoutHelper.MAX_ACC_WIDTH);
    if (this.isColumnLayout_) {
      this.calcMaxWidth(this.iconSize, MenuItemLayoutHelper.MAX_ICON_WIDTH);
      this.calcMaxWidth(this.textSize, MenuItemLayoutHelper.MAX_TEXT_WIDTH);
      let curGap = this.gap_;
      if ((this.iconSize.getMaxWidth() === 0) || (this.textSize.getMaxWidth() === 0)) {
        curGap = 0;
      }
      this.labelSize.maxWidth_ = this.calcMaxValue(MenuItemLayoutHelper.MAX_LABEL_WIDTH, (this.iconSize.maxWidth_ + this.textSize.maxWidth_ + curGap) | 0);
    } else {
      this.iconSize.maxWidth_ = this.getParentIntProperty(MenuItemLayoutHelper.MAX_ICON_WIDTH);
      this.calcMaxWidth(this.labelSize, MenuItemLayoutHelper.MAX_LABEL_WIDTH);
      let candidateTextWidth = (this.labelSize.maxWidth_ - this.iconSize.maxWidth_) | 0;
      if (this.iconSize.maxWidth_ > 0) {
        candidateTextWidth = (candidateTextWidth - this.gap_) | 0;
      }
      this.textSize.maxWidth_ = this.calcMaxValue(MenuItemLayoutHelper.MAX_TEXT_WIDTH, candidateTextWidth);
    }
  }
  calcMaxWidth(rs: MenuItemLayoutHelper$RectSize, key: any): void {
    rs.maxWidth_ = this.calcMaxValue(key, rs.width_);
  }
  /**
   * Calculates and returns maximal value through specified parent component
   * client property.
   *
   * @param propertyName name of the property, which stores the maximal value.
   * @param value a value which pretends to be maximal
   * @return maximal value among the parent property and the value.
   */
  calcMaxValue(propertyName: any, value: number): number {
    let maxValue = this.getParentIntProperty(propertyName);
    if (value > maxValue) {
      if (this.miParent != null) {
        this.miParent.putClientProperty(propertyName, value);
      }
      return value;
    } else {
      return maxValue;
    }
  }
  /**
   * Returns parent client property as int.
   * @param propertyName name of the parent property.
   * @return value of the property as int.
   */
  getParentIntProperty(propertyName: any): number {
    let value = null;
    if (this.miParent != null) {
      value = this.miParent.getClientProperty(propertyName);
    }
    var intValue;
    if ($J.isa((intValue = value), Integer)) {
      return intValue;
    }
    return 0;
  }
  static isColumnLayout$boolean$JMenuItem(isLeftToRight: boolean, mi: JMenuItem): boolean {
    // assert (mi != null)
    return MenuItemLayoutHelper.isColumnLayout$boolean$int$int$int(isLeftToRight, mi.getHorizontalAlignment(), mi.getHorizontalTextPosition(), mi.getVerticalTextPosition());
  }
  /**
   * Answers should we do column layout for a menu item or not.
   * We do it when a user doesn't set any alignments
   * and text positions manually, except the vertical alignment.
   */
  static isColumnLayout$boolean$int$int$int(isLeftToRight: boolean, horizontalAlignment: number, horizontalTextPosition: number, verticalTextPosition: number): boolean {
    if (verticalTextPosition !== SwingConstants.CENTER) {
      return false;
    }
    if (isLeftToRight) {
      if (horizontalAlignment !== SwingConstants.LEADING && horizontalAlignment !== SwingConstants.LEFT) {
        return false;
      }
      if (horizontalTextPosition !== SwingConstants.TRAILING && horizontalTextPosition !== SwingConstants.RIGHT) {
        return false;
      }
    } else {
      if (horizontalAlignment !== SwingConstants.LEADING && horizontalAlignment !== SwingConstants.RIGHT) {
        return false;
      }
      if (horizontalTextPosition !== SwingConstants.TRAILING && horizontalTextPosition !== SwingConstants.LEFT) {
        return false;
      }
    }
    return true;
  }
  /**
   * Calculates maximal text offset.
   * It is required for some L&Fs (ex: Vista L&F).
   * The offset is meaningful only for L2R column layout.
   *
   * @param viewRect the rectangle, the maximal text offset
   * will be calculated for.
   */
  calcMaxTextOffset(viewRect: Rectangle): void {
    if (!this.isColumnLayout_ || !this.isLeftToRight_) {
      return;
    }
    let offset = (viewRect.x_ + this.leadingGap + this.checkSize.maxWidth_ + this.afterCheckIconGap + this.iconSize.maxWidth_ + this.gap_) | 0;
    if (this.checkSize.maxWidth_ === 0) {
      offset = (offset - this.afterCheckIconGap) | 0;
    }
    if (this.iconSize.maxWidth_ === 0) {
      offset = (offset - this.gap_) | 0;
    }
    if (offset < this.minTextOffset) {
      offset = this.minTextOffset;
    }
    this.calcMaxValue(SwingUtilities2.BASICMENUITEMUI_MAX_TEXT_OFFSET, offset);
  }
  /**
   * Layout icon, text, check icon, accelerator text and arrow icon
   * in the viewRect and return their positions.
   *
   * If horizontalAlignment, verticalTextPosition and horizontalTextPosition
   * are default (user doesn't set any manually) the layouting algorithm is:
   * Elements are layouted in the five columns:
   * check icon + icon + text + accelerator text + arrow icon
   *
   * In the other case elements are layouted in the four columns:
   * check icon + label + accelerator text + arrow icon
   * Label is union of icon and text.
   *
   * The order of columns can be reversed.
   * It depends on the menu item orientation.
   */
  layoutMenuItem(): MenuItemLayoutHelper$LayoutResult {
    let lr = this.createLayoutResult();
    this.prepareForLayout(lr);
    if (this.isColumnLayout()) {
      if (this.isLeftToRight()) {
        this.doLTRColumnLayout(lr, this.getLTRColumnAlignment());
      } else {
        this.doRTLColumnLayout(lr, this.getRTLColumnAlignment());
      }
    } else {
      if (this.isLeftToRight()) {
        this.doLTRComplexLayout(lr, this.getLTRColumnAlignment());
      } else {
        this.doRTLComplexLayout(lr, this.getRTLColumnAlignment());
      }
    }
    this.alignAccCheckAndArrowVertically(lr);
    return lr;
  }
  createLayoutResult(): MenuItemLayoutHelper$LayoutResult {
    return new MenuItemLayoutHelper$LayoutResult()._MenuItemLayoutHelper$LayoutResult$Rectangle$Rectangle$Rectangle$Rectangle$Rectangle$Rectangle(new Rectangle()._Rectangle$int$int(this.iconSize.width_, this.iconSize.height_), new Rectangle()._Rectangle$int$int(this.textSize.width_, this.textSize.height_), new Rectangle()._Rectangle$int$int(this.accSize.width_, this.accSize.height_), new Rectangle()._Rectangle$int$int(this.checkSize.width_, this.checkSize.height_), new Rectangle()._Rectangle$int$int(this.arrowSize.width_, this.arrowSize.height_), new Rectangle()._Rectangle$int$int(this.labelSize.width_, this.labelSize.height_));
  }
  getLTRColumnAlignment(): MenuItemLayoutHelper$ColumnAlignment {
    return MenuItemLayoutHelper$ColumnAlignment.LEFT_ALIGNMENT;
  }
  getRTLColumnAlignment(): MenuItemLayoutHelper$ColumnAlignment {
    return MenuItemLayoutHelper$ColumnAlignment.RIGHT_ALIGNMENT;
  }
  prepareForLayout(lr: MenuItemLayoutHelper$LayoutResult): void {
    lr.checkRect.width_ = this.checkSize.maxWidth_;
    lr.accRect.width_ = this.accSize.maxWidth_;
    lr.arrowRect.width_ = this.arrowSize.maxWidth_;
  }
  /**
   * Aligns the accelertor text and the check and arrow icons vertically
   * with the center of the label rect.
   */
  alignAccCheckAndArrowVertically(lr: MenuItemLayoutHelper$LayoutResult): void {
    lr.accRect.y_ = $J.d2i((Math.fround(Math.fround(lr.labelRect.y_ + Math.fround(Math.fround(lr.labelRect.height_) / 2)) - Math.fround(Math.fround(lr.accRect.height_) / 2))));
    this.fixVerticalAlignment(lr, lr.accRect);
    if (this.useCheckAndArrow_) {
      lr.arrowRect.y_ = $J.d2i((Math.fround(Math.fround(lr.labelRect.y_ + Math.fround(Math.fround(lr.labelRect.height_) / 2)) - Math.fround(Math.fround(lr.arrowRect.height_) / 2))));
      lr.checkRect.y_ = $J.d2i((Math.fround(Math.fround(lr.labelRect.y_ + Math.fround(Math.fround(lr.labelRect.height_) / 2)) - Math.fround(Math.fround(lr.checkRect.height_) / 2))));
      this.fixVerticalAlignment(lr, lr.arrowRect);
      this.fixVerticalAlignment(lr, lr.checkRect);
    }
  }
  /**
   * Fixes vertical alignment of all menu item elements if rect.y
   * or (rect.y + rect.height) is out of viewRect bounds
   */
  fixVerticalAlignment(lr: MenuItemLayoutHelper$LayoutResult, r: Rectangle): void {
    let delta = 0;
    if (r.y_ < this.viewRect.y_) {
      delta = (this.viewRect.y_ - r.y_) | 0;
    } else if (((r.y_ + r.height_) | 0) > ((this.viewRect.y_ + this.viewRect.height_) | 0)) {
      delta = (this.viewRect.y_ + this.viewRect.height_ - r.y_ - r.height_) | 0;
    }
    if (delta !== 0) {
      lr.checkRect.y_ = (lr.checkRect.y_ + delta) | 0;
      lr.iconRect.y_ = (lr.iconRect.y_ + delta) | 0;
      lr.textRect.y_ = (lr.textRect.y_ + delta) | 0;
      lr.accRect.y_ = (lr.accRect.y_ + delta) | 0;
      lr.arrowRect.y_ = (lr.arrowRect.y_ + delta) | 0;
      lr.labelRect.y_ = (lr.labelRect.y_ + delta) | 0;
    }
  }
  doLTRColumnLayout(lr: MenuItemLayoutHelper$LayoutResult, alignment: MenuItemLayoutHelper$ColumnAlignment): void {
    lr.iconRect.width_ = this.iconSize.maxWidth_;
    lr.textRect.width_ = this.textSize.maxWidth_;
    this.calcXPositionsLTR(this.viewRect.x_, this.leadingGap, this.gap_, [lr.checkRect, lr.iconRect, lr.textRect]);
    if (lr.checkRect.width_ > 0) {
      lr.iconRect.x_ = (lr.iconRect.x_ + (this.afterCheckIconGap - this.gap_)) | 0;
      lr.textRect.x_ = (lr.textRect.x_ + (this.afterCheckIconGap - this.gap_)) | 0;
    }
    this.calcXPositionsRTL((this.viewRect.x_ + this.viewRect.width_) | 0, this.leadingGap, this.gap_, [lr.arrowRect, lr.accRect]);
    let textOffset = (lr.textRect.x_ - this.viewRect.x_) | 0;
    if (!this.isTopLevelMenu_ && (textOffset < this.minTextOffset)) {
      lr.textRect.x_ = (lr.textRect.x_ + (this.minTextOffset - textOffset)) | 0;
    }
    this.alignRects(lr, alignment);
    this.calcTextAndIconYPositions(lr);
    lr.setLabelRect(lr.textRect.union(lr.iconRect));
  }
  doLTRComplexLayout(lr: MenuItemLayoutHelper$LayoutResult, alignment: MenuItemLayoutHelper$ColumnAlignment): void {
    lr.labelRect.width_ = this.labelSize.maxWidth_;
    this.calcXPositionsLTR(this.viewRect.x_, this.leadingGap, this.gap_, [lr.checkRect, lr.labelRect]);
    if (lr.checkRect.width_ > 0) {
      lr.labelRect.x_ = (lr.labelRect.x_ + (this.afterCheckIconGap - this.gap_)) | 0;
    }
    this.calcXPositionsRTL((this.viewRect.x_ + this.viewRect.width_) | 0, this.leadingGap, this.gap_, [lr.arrowRect, lr.accRect]);
    let labelOffset = (lr.labelRect.x_ - this.viewRect.x_) | 0;
    if (!this.isTopLevelMenu_ && (labelOffset < this.minTextOffset)) {
      lr.labelRect.x_ = (lr.labelRect.x_ + (this.minTextOffset - labelOffset)) | 0;
    }
    this.alignRects(lr, alignment);
    this.calcLabelYPosition(lr);
    this.layoutIconAndTextInLabelRect(lr);
  }
  doRTLColumnLayout(lr: MenuItemLayoutHelper$LayoutResult, alignment: MenuItemLayoutHelper$ColumnAlignment): void {
    lr.iconRect.width_ = this.iconSize.maxWidth_;
    lr.textRect.width_ = this.textSize.maxWidth_;
    this.calcXPositionsRTL((this.viewRect.x_ + this.viewRect.width_) | 0, this.leadingGap, this.gap_, [lr.checkRect, lr.iconRect, lr.textRect]);
    if (lr.checkRect.width_ > 0) {
      lr.iconRect.x_ = (lr.iconRect.x_ - (this.afterCheckIconGap - this.gap_)) | 0;
      lr.textRect.x_ = (lr.textRect.x_ - (this.afterCheckIconGap - this.gap_)) | 0;
    }
    this.calcXPositionsLTR(this.viewRect.x_, this.leadingGap, this.gap_, [lr.arrowRect, lr.accRect]);
    let textOffset = (this.viewRect.x_ + this.viewRect.width_ - (lr.textRect.x_ + lr.textRect.width_)) | 0;
    if (!this.isTopLevelMenu_ && (textOffset < this.minTextOffset)) {
      lr.textRect.x_ = (lr.textRect.x_ - (this.minTextOffset - textOffset)) | 0;
    }
    this.alignRects(lr, alignment);
    this.calcTextAndIconYPositions(lr);
    lr.setLabelRect(lr.textRect.union(lr.iconRect));
  }
  doRTLComplexLayout(lr: MenuItemLayoutHelper$LayoutResult, alignment: MenuItemLayoutHelper$ColumnAlignment): void {
    lr.labelRect.width_ = this.labelSize.maxWidth_;
    this.calcXPositionsRTL((this.viewRect.x_ + this.viewRect.width_) | 0, this.leadingGap, this.gap_, [lr.checkRect, lr.labelRect]);
    if (lr.checkRect.width_ > 0) {
      lr.labelRect.x_ = (lr.labelRect.x_ - (this.afterCheckIconGap - this.gap_)) | 0;
    }
    this.calcXPositionsLTR(this.viewRect.x_, this.leadingGap, this.gap_, [lr.arrowRect, lr.accRect]);
    let labelOffset = (this.viewRect.x_ + this.viewRect.width_ - (lr.labelRect.x_ + lr.labelRect.width_)) | 0;
    if (!this.isTopLevelMenu_ && (labelOffset < this.minTextOffset)) {
      lr.labelRect.x_ = (lr.labelRect.x_ - (this.minTextOffset - labelOffset)) | 0;
    }
    this.alignRects(lr, alignment);
    this.calcLabelYPosition(lr);
    this.layoutIconAndTextInLabelRect(lr);
  }
  alignRects(lr: MenuItemLayoutHelper$LayoutResult, alignment: MenuItemLayoutHelper$ColumnAlignment): void {
    this.alignRect(lr.checkRect, alignment.getCheckAlignment(), this.checkSize.getOrigWidth());
    this.alignRect(lr.iconRect, alignment.getIconAlignment(), this.iconSize.getOrigWidth());
    this.alignRect(lr.textRect, alignment.getTextAlignment(), this.textSize.getOrigWidth());
    this.alignRect(lr.accRect, alignment.getAccAlignment(), this.accSize.getOrigWidth());
    this.alignRect(lr.arrowRect, alignment.getArrowAlignment(), this.arrowSize.getOrigWidth());
  }
  alignRect(rect: Rectangle, alignment: number, origWidth: number): void {
    if (alignment === SwingConstants.RIGHT) {
      rect.x_ = (rect.x_ + rect.width_ - origWidth) | 0;
    }
    rect.width_ = origWidth;
  }
  layoutIconAndTextInLabelRect(lr: MenuItemLayoutHelper$LayoutResult): void {
    lr.setTextRect(new Rectangle()._Rectangle$());
    lr.setIconRect(new Rectangle()._Rectangle$());
    SwingUtilities.layoutCompoundLabel$JComponent$FontMetrics$String$Icon$int$int$int$int$Rectangle$Rectangle$Rectangle$int(this.mi, this.fm, this.text_, this.icon, this.verticalAlignment, this.horizontalAlignment, this.verticalTextPosition, this.horizontalTextPosition, lr.labelRect, lr.iconRect, lr.textRect, this.gap_);
  }
  calcXPositionsLTR(startXPos: number, leadingGap: number, gap: number, rects: Rectangle[]): void {
    let curXPos = (startXPos + leadingGap) | 0;
    for (let rect of rects) {
      rect.x_ = curXPos;
      if (rect.width_ > 0) {
        curXPos = (curXPos + (rect.width_ + gap)) | 0;
      }
    }
  }
  calcXPositionsRTL(startXPos: number, leadingGap: number, gap: number, rects: Rectangle[]): void {
    let curXPos = (startXPos - leadingGap) | 0;
    for (let rect of rects) {
      rect.x_ = (curXPos - rect.width_) | 0;
      if (rect.width_ > 0) {
        curXPos = (curXPos - (rect.width_ + gap)) | 0;
      }
    }
  }
  /**
   * Sets Y coordinates of text and icon
   * taking into account the vertical alignment
   */
  calcTextAndIconYPositions(lr: MenuItemLayoutHelper$LayoutResult): void {
    if (this.verticalAlignment === SwingConstants.TOP) {
      lr.textRect.y_ = $J.d2i((Math.fround(Math.fround(this.viewRect.y_ + Math.fround(Math.fround(lr.labelRect.height_) / 2)) - Math.fround(Math.fround(lr.textRect.height_) / 2))));
      lr.iconRect.y_ = $J.d2i((Math.fround(Math.fround(this.viewRect.y_ + Math.fround(Math.fround(lr.labelRect.height_) / 2)) - Math.fround(Math.fround(lr.iconRect.height_) / 2))));
    } else if (this.verticalAlignment === SwingConstants.CENTER) {
      lr.textRect.y_ = $J.d2i((Math.fround(Math.fround(this.viewRect.y_ + Math.fround(Math.fround(this.viewRect.height_) / 2)) - Math.fround(Math.fround(lr.textRect.height_) / 2))));
      lr.iconRect.y_ = $J.d2i((Math.fround(Math.fround(this.viewRect.y_ + Math.fround(Math.fround(this.viewRect.height_) / 2)) - Math.fround(Math.fround(lr.iconRect.height_) / 2))));
    } else if (this.verticalAlignment === SwingConstants.BOTTOM) {
      lr.textRect.y_ = $J.d2i((Math.fround(Math.fround(((this.viewRect.y_ + this.viewRect.height_) | 0) - Math.fround(Math.fround(lr.labelRect.height_) / 2)) - Math.fround(Math.fround(lr.textRect.height_) / 2))));
      lr.iconRect.y_ = $J.d2i((Math.fround(Math.fround(((this.viewRect.y_ + this.viewRect.height_) | 0) - Math.fround(Math.fround(lr.labelRect.height_) / 2)) - Math.fround(Math.fround(lr.iconRect.height_) / 2))));
    }
  }
  /**
   * Sets labelRect Y coordinate
   * taking into account the vertical alignment
   */
  calcLabelYPosition(lr: MenuItemLayoutHelper$LayoutResult): void {
    if (this.verticalAlignment === SwingConstants.TOP) {
      lr.labelRect.y_ = this.viewRect.y_;
    } else if (this.verticalAlignment === SwingConstants.CENTER) {
      lr.labelRect.y_ = $J.d2i((Math.fround(Math.fround(this.viewRect.y_ + Math.fround(Math.fround(this.viewRect.height_) / 2)) - Math.fround(Math.fround(lr.labelRect.height_) / 2))));
    } else if (this.verticalAlignment === SwingConstants.BOTTOM) {
      lr.labelRect.y_ = (this.viewRect.y_ + this.viewRect.height_ - lr.labelRect.height_) | 0;
    }
  }
  /**
   * Returns parent of this component if it is not a top-level menu
   * Otherwise returns null.
   * @param menuItem the menu item whose parent will be returned.
   * @return parent of this component if it is not a top-level menu
   * Otherwise returns null.
   */
  static getMenuItemParent(menuItem: JMenuItem): JComponent {
    let parent = menuItem.getParent();
    if ((parent instanceof JComponent) && (!(menuItem instanceof JMenu) || !(menuItem).isTopLevelMenu())) {
      return parent;
    } else {
      return null;
    }
  }
  static clearUsedParentClientProperties(menuItem: JMenuItem): void {
    MenuItemLayoutHelper.clearUsedClientProperties(MenuItemLayoutHelper.getMenuItemParent(menuItem));
  }
  static clearUsedClientProperties(c: JComponent): void {
    if (c != null) {
      c.putClientProperty(MenuItemLayoutHelper.MAX_ARROW_WIDTH, null);
      c.putClientProperty(MenuItemLayoutHelper.MAX_CHECK_WIDTH, null);
      c.putClientProperty(MenuItemLayoutHelper.MAX_ACC_WIDTH, null);
      c.putClientProperty(MenuItemLayoutHelper.MAX_TEXT_WIDTH, null);
      c.putClientProperty(MenuItemLayoutHelper.MAX_ICON_WIDTH, null);
      c.putClientProperty(MenuItemLayoutHelper.MAX_LABEL_WIDTH, null);
      c.putClientProperty(SwingUtilities2.BASICMENUITEMUI_MAX_TEXT_OFFSET, null);
    }
  }
  /**
   * Finds and returns maximal integer value in the given array.
   * @param values array where the search will be performed.
   * @return maximal value.
   */
  static max(values: number[]): number {
    let maxValue = -2147483648;
    for (let i of values) {
      if (i > maxValue) {
        maxValue = i;
      }
    }
    return maxValue;
  }
  static createMaxRect(): Rectangle {
    return new Rectangle()._Rectangle$int$int$int$int(0, 0, 2147483647, 2147483647);
  }
  static addMaxWidth(size: MenuItemLayoutHelper$RectSize, gap: number, result: Dimension): void {
    if (size.maxWidth_ > 0) {
      result.width_ = (result.width_ + (size.maxWidth_ + gap)) | 0;
    }
  }
  getMenuItem(): JMenuItem {
    return this.mi;
  }
  getFontMetrics(): FontMetrics {
    return this.fm;
  }
  getAccFontMetrics(): FontMetrics {
    return this.accFm;
  }
  getIcon$(): Icon {
    return this.icon;
  }
  getCheckIcon(): Icon {
    return this.checkIcon;
  }
  getArrowIcon(): Icon {
    return this.arrowIcon;
  }
  getText(): string {
    return this.text_;
  }
  getAccText$(): string {
    return this.accText;
  }
  isColumnLayout(): boolean {
    return this.isColumnLayout_;
  }
  useCheckAndArrow(): boolean {
    return this.useCheckAndArrow_;
  }
  isLeftToRight(): boolean {
    return this.isLeftToRight_;
  }
  isTopLevelMenu(): boolean {
    return this.isTopLevelMenu_;
  }
  getHtmlView(): View {
    return this.htmlView;
  }
  getGap(): number {
    return this.gap_;
  }
  getLeadingGap$(): number {
    return this.leadingGap;
  }
  getAfterCheckIconGap$(): number {
    return this.afterCheckIconGap;
  }
  getMinTextOffset$(): number {
    return this.minTextOffset;
  }
  getAccSize(): MenuItemLayoutHelper$RectSize {
    return this.accSize;
  }
  getCheckSize(): MenuItemLayoutHelper$RectSize {
    return this.checkSize;
  }
  getArrowSize(): MenuItemLayoutHelper$RectSize {
    return this.arrowSize;
  }
  getLabelSize(): MenuItemLayoutHelper$RectSize {
    return this.labelSize;
  }
  /**
   * Returns false if the component is a JMenu and it is a top
   * level menu (on the menubar).
   */
  static useCheckAndArrow(menuItem: JMenuItem): boolean {
    let b = true;
    if ((menuItem instanceof JMenu) && ((menuItem).isTopLevelMenu())) {
      b = false;
    }
    return b;
  }
  static $clinit() {
    MenuItemLayoutHelper.MAX_ARROW_WIDTH = new StringUIClientPropertyKey()._StringUIClientPropertyKey('maxArrowWidth');
    MenuItemLayoutHelper.MAX_CHECK_WIDTH = new StringUIClientPropertyKey()._StringUIClientPropertyKey('maxCheckWidth');
    MenuItemLayoutHelper.MAX_ICON_WIDTH = new StringUIClientPropertyKey()._StringUIClientPropertyKey('maxIconWidth');
    MenuItemLayoutHelper.MAX_TEXT_WIDTH = new StringUIClientPropertyKey()._StringUIClientPropertyKey('maxTextWidth');
    MenuItemLayoutHelper.MAX_ACC_WIDTH = new StringUIClientPropertyKey()._StringUIClientPropertyKey('maxAccWidth');
    MenuItemLayoutHelper.MAX_LABEL_WIDTH = new StringUIClientPropertyKey()._StringUIClientPropertyKey('maxLabelWidth');
  }
}

export class MenuItemLayoutHelper$LayoutResult extends JObject {
  iconRect: Rectangle = null;
  textRect: Rectangle = null;
  accRect: Rectangle = null;
  checkRect: Rectangle = null;
  arrowRect: Rectangle = null;
  labelRect: Rectangle = null;
  _MenuItemLayoutHelper$LayoutResult$Rectangle$Rectangle$Rectangle$Rectangle$Rectangle$Rectangle(iconRect: Rectangle, textRect: Rectangle, accRect: Rectangle, checkRect: Rectangle, arrowRect: Rectangle, labelRect: Rectangle): this {
    this.iconRect = iconRect;
    this.textRect = textRect;
    this.accRect = accRect;
    this.checkRect = checkRect;
    this.arrowRect = arrowRect;
    this.labelRect = labelRect;
    return this;
  }
  getIconRect(): Rectangle {
    return this.iconRect;
  }
  setIconRect(iconRect: Rectangle): void {
    this.iconRect = iconRect;
  }
  getTextRect(): Rectangle {
    return this.textRect;
  }
  setTextRect(textRect: Rectangle): void {
    this.textRect = textRect;
  }
  getAccRect(): Rectangle {
    return this.accRect;
  }
  getCheckRect(): Rectangle {
    return this.checkRect;
  }
  getArrowRect(): Rectangle {
    return this.arrowRect;
  }
  setLabelRect(labelRect: Rectangle): void {
    this.labelRect = labelRect;
  }
}

export class MenuItemLayoutHelper$ColumnAlignment extends JObject {
  checkAlignment: number = 0;
  iconAlignment: number = 0;
  textAlignment: number = 0;
  accAlignment: number = 0;
  arrowAlignment: number = 0;
  static LEFT_ALIGNMENT: MenuItemLayoutHelper$ColumnAlignment = null;
  static RIGHT_ALIGNMENT: MenuItemLayoutHelper$ColumnAlignment = null;
  _MenuItemLayoutHelper$ColumnAlignment(checkAlignment: number, iconAlignment: number, textAlignment: number, accAlignment: number, arrowAlignment: number): this {
    this.checkAlignment = checkAlignment;
    this.iconAlignment = iconAlignment;
    this.textAlignment = textAlignment;
    this.accAlignment = accAlignment;
    this.arrowAlignment = arrowAlignment;
    return this;
  }
  getCheckAlignment(): number {
    return this.checkAlignment;
  }
  getIconAlignment(): number {
    return this.iconAlignment;
  }
  getTextAlignment(): number {
    return this.textAlignment;
  }
  getAccAlignment(): number {
    return this.accAlignment;
  }
  getArrowAlignment(): number {
    return this.arrowAlignment;
  }
  static $clinit() {
    MenuItemLayoutHelper$ColumnAlignment.LEFT_ALIGNMENT = new MenuItemLayoutHelper$ColumnAlignment()._MenuItemLayoutHelper$ColumnAlignment(SwingConstants.LEFT, SwingConstants.LEFT, SwingConstants.LEFT, SwingConstants.LEFT, SwingConstants.LEFT);
    MenuItemLayoutHelper$ColumnAlignment.RIGHT_ALIGNMENT = new MenuItemLayoutHelper$ColumnAlignment()._MenuItemLayoutHelper$ColumnAlignment(SwingConstants.RIGHT, SwingConstants.RIGHT, SwingConstants.RIGHT, SwingConstants.RIGHT, SwingConstants.RIGHT);
  }
}

export class MenuItemLayoutHelper$RectSize extends JObject {
  width_: number = 0;
  height_: number = 0;
  origWidth: number = 0;
  maxWidth_: number = 0;
  _MenuItemLayoutHelper$RectSize$(): this {
    return this;
  }
  getHeight(): number {
    return this.height_;
  }
  getOrigWidth(): number {
    return this.origWidth;
  }
  getMaxWidth(): number {
    return this.maxWidth_;
  }
  toString(): string {
    return '[w=' + this.width_ + ',h=' + this.height_ + ',ow=' + this.origWidth + ',mw=' + this.maxWidth_ + ']';
  }
}

$J.define(MenuItemLayoutHelper, 'sun.swing.MenuItemLayoutHelper', { kind: 'class', sup: 'java.lang.Object', ctors: { 'javax.swing.JMenuItem,javax.swing.Icon,javax.swing.Icon,java.awt.Rectangle,int,java.lang.String,boolean,java.awt.Font,java.awt.Font,boolean,java.lang.String': '_MenuItemLayoutHelper$JMenuItem$Icon$Icon$Rectangle$int$String$boolean$Font$Font$boolean$String', '': '_MenuItemLayoutHelper$' }, meths: { 'getMinTextOffset()': 'getMinTextOffset$', 'getAfterCheckIconGap()': 'getAfterCheckIconGap$', 'getLeadingGap()': 'getLeadingGap$', 'getAccText()': 'getAccText$', 'getIcon()': 'getIcon$', 'isColumnLayout(boolean,int,int,int)': 'isColumnLayout$boolean$int$int$int', 'isColumnLayout(boolean,javax.swing.JMenuItem)': 'isColumnLayout$boolean$JMenuItem', 'getLeadingGap(java.lang.String)': 'getLeadingGap$String$MenuItemLayoutHelper', 'getAfterCheckIconGap(java.lang.String)': 'getAfterCheckIconGap$String$MenuItemLayoutHelper', 'getMinTextOffset(java.lang.String)': 'getMinTextOffset$String$MenuItemLayoutHelper', 'getIcon(java.lang.String)': 'getIcon$String$MenuItemLayoutHelper', 'getAccText(java.lang.String)': 'getAccText$String$MenuItemLayoutHelper' }, clinit: true, lazy: ['MAX_ARROW_WIDTH', 'MAX_CHECK_WIDTH', 'MAX_ICON_WIDTH', 'MAX_TEXT_WIDTH', 'MAX_ACC_WIDTH', 'MAX_LABEL_WIDTH'] });
$J.define(MenuItemLayoutHelper$LayoutResult, 'sun.swing.MenuItemLayoutHelper$LayoutResult', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.awt.Rectangle,java.awt.Rectangle,java.awt.Rectangle,java.awt.Rectangle,java.awt.Rectangle,java.awt.Rectangle': '_MenuItemLayoutHelper$LayoutResult$Rectangle$Rectangle$Rectangle$Rectangle$Rectangle$Rectangle', '': '_MenuItemLayoutHelper$LayoutResult$' } });
$J.define(MenuItemLayoutHelper$ColumnAlignment, 'sun.swing.MenuItemLayoutHelper$ColumnAlignment', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,int,int,int,int': '_MenuItemLayoutHelper$ColumnAlignment' }, clinit: true, lazy: ['LEFT_ALIGNMENT', 'RIGHT_ALIGNMENT'] });
$J.define(MenuItemLayoutHelper$RectSize, 'sun.swing.MenuItemLayoutHelper$RectSize', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,int,int,int': '_MenuItemLayoutHelper$RectSize$int$int$int$int', '': '_MenuItemLayoutHelper$RectSize$' } });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  JComponent = $J.load('javax.swing.JComponent');
  JMenu = $J.load('javax.swing.JMenu');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  BasicHTML = $J.load('javax.swing.plaf.basic.BasicHTML');
  View = $J.load('javax.swing.text.View');
  StringUIClientPropertyKey = $J.load('sun.swing.StringUIClientPropertyKey');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
