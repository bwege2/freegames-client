// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/WrapLayout.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2023   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, ArrayList, Collections, IllegalArgumentException, IllegalStateException, JEnum, JObject, Objects } from '../../../../../../../jre/index.ts';

let Dimension, Point, Rectangle, JScrollPane, SwingUtilities;

/**
 * FlowLayout like layout manager that supports automatic wrapping to a new line when needed.
 */
export class WrapLayout extends JObject {
  static readonly MAX_COMPRESS_TRIES: number = 3;
  horizontalAlignment: WrapLayout$HorizontalAlignment = null;
  layoutStyle: WrapLayout$LayoutStyle = null;
  horizontalGap: WrapLayout$HorizontalGap = null;
  forceComponentSize: Dimension = null;
  allComponentsWithTheSameSize: boolean = false;
  minHorizontalGap: number = 0;
  minVerticalGap: number = 0;
  maxHorizontalGap: number = 0;
  /**
   * Creates a {@code WrapLayout} with default settings. Specify layout rules using the
   * {@code with*} methods.
   *
   * @see #withHorizontalAlignment(HorizontalAlignment)
   * @see #withLayoutStyle(LayoutStyle)
   * @see #withHorizontalGap(HorizontalGap, int)
   */
  _WrapLayout(): this {
    this.horizontalAlignment = WrapLayout$HorizontalAlignment.CENTER;
    this.layoutStyle = WrapLayout$LayoutStyle.BALANCED;
    this.horizontalGap = WrapLayout$HorizontalGap.AUTO;
    this.forceComponentSize = null;
    this.allComponentsWithTheSameSize = false;
    this.minHorizontalGap = 0;
    this.minVerticalGap = 0;
    this.maxHorizontalGap = 0;
    return this;
  }
  /**
   * Sets the horizontal alignment.
   * @param horizontalAlignment The alignment to be used.
   * @return This object, in order to support method chaining.
   */
  withHorizontalAlignment(horizontalAlignment: WrapLayout$HorizontalAlignment): WrapLayout {
    this.horizontalAlignment = Objects.requireNonNull(horizontalAlignment, 'horizontalAlignment');
    return this;
  }
  /**
   * Chooses the style when laying out components.
   * @param layoutStyle The style to be used.
   * @return This object, in order to support method chaining.
   */
  withLayoutStyle(layoutStyle: WrapLayout$LayoutStyle): WrapLayout {
    this.layoutStyle = Objects.requireNonNull(layoutStyle, 'layoutStyle');
    return this;
  }
  /**
   * Defines how horizontal gaps will be handled.
   *
   * @param horizontalGap The method for choosing the gap size.
   * @return This object, in order to support method chaining.
   */
  withHorizontalGap$HorizontalGap(horizontalGap: WrapLayout$HorizontalGap): WrapLayout {
    this.horizontalGap = Objects.requireNonNull(horizontalGap, 'horizontalGap');
    this.minHorizontalGap = 0;
    this.maxHorizontalGap = 2147483647;
    return this;
  }
  /**
   * Defines how horizontal gaps will be handled.
   *
   * @param horizontalGap The method for choosing the gap size.
   * @param minHorizontalGap The minimum horizontal gap to always be placed between
   *      components (even if there is no room for it).
   * @param maxHorizontalGap The maximum allowed horizontal gap between components.
   * @return This object, in order to support method chaining.
   */
  withHorizontalGap$HorizontalGap$int$int(horizontalGap: WrapLayout$HorizontalGap, minHorizontalGap: number, maxHorizontalGap: number): WrapLayout {
    if (maxHorizontalGap < 0) {
      throw new IllegalArgumentException('maxHorizontalGap must be >= 0. Argument: ' + maxHorizontalGap);
    }
    this.minHorizontalGap = minHorizontalGap;
    this.horizontalGap = Objects.requireNonNull(horizontalGap, 'horizontalGap');
    this.maxHorizontalGap = maxHorizontalGap;
    return this;
  }
  /**
   * Forces all child components to have the given size.
   *
   * @param forceComponentSize The component size.
   * @return This object, in order to support method chaining.
   */
  withForceComponentSize(forceComponentSize: Dimension): WrapLayout {
    this.forceComponentSize = forceComponentSize;
    this.allComponentsWithTheSameSize = false;
    return this;
  }
  /**
   * Uses the biggest preferred/minimum size for all child components.
   *
   * @param allComponentsWithTheSameSize {@code true} if all components should
   *      get the same same.
   * @return This object, in order to support method chaining.
   */
  withAllComponentsWithTheSameSize(allComponentsWithTheSameSize: boolean): WrapLayout {
    this.allComponentsWithTheSameSize = allComponentsWithTheSameSize;
    this.forceComponentSize = null;
    return this;
  }
  /**
   * Returns the preferred dimensions for this layout given the <i>visible</i>
   * components in the specified target container.
   *
   * @param target the component which needs to be laid out
   * @return the preferred dimensions to lay out the subcomponents of the
   *         specified container
   */
  preferredLayoutSize(target: Container): Dimension {
    return this.layoutSize$Container$boolean$WrapLayout(target, true);
  }
  /**
   * Returns the minimum dimensions needed to layout the <i>visible</i> components
   * contained in the specified target container.
   *
   * @param target the component which needs to be laid out
   * @return the minimum dimensions to lay out the subcomponents of the specified
   *         container
   */
  minimumLayoutSize(target: Container): Dimension {
    let minimum = this.layoutSize$Container$boolean$WrapLayout(target, false);
    return minimum;
  }
  /**
   * Determines the layout size. To be used by other layout managers using
   * {@code WrapLayout} as a fallback.
   */
  layoutSize$Container$int$boolean(target: Container, targetWidth: number, preferred: boolean): Dimension {
    {
      let mostCompactLayout = this.determineLayout$Container$int$boolean$WrapLayout(target, targetWidth, preferred);
      return mostCompactLayout.dimension;
    }
  }
  layoutSize$Container$boolean$WrapLayout(target: Container, preferred: boolean): Dimension {
    {
      let mostCompactLayout = this.determineLayout$Container$boolean$WrapLayout(target, preferred);
      return mostCompactLayout.dimension;
    }
  }
  determineLayout$Container$boolean$WrapLayout(target: Container, preferred: boolean): WrapLayout$Layout {
    let targetWidth = target.getSize$().width_;
    let container = target;
    while (container.getSize$().width_ === 0 && container.getParent() != null) {
      container = container.getParent();
    }
    targetWidth = container.getSize$().width_;
    if (targetWidth === 0) {
      targetWidth = 2147483647;
    }
    return this.determineLayout$Container$int$boolean$WrapLayout(target, targetWidth, preferred);
  }
  determineLayout$Container$int$boolean$WrapLayout(target: Container, targetWidth: number, preferred: boolean): WrapLayout$Layout {
    let reverseComponentOrder = (this.layoutStyle === WrapLayout$LayoutStyle.PREFER_BOTTOM);
    let mostCompactLayout = this.internalLayoutSize(target, targetWidth, preferred, reverseComponentOrder);
    if (targetWidth <= 0) {
      return mostCompactLayout;
    }
    if (this.layoutStyle !== WrapLayout$LayoutStyle.BALANCED) {
      return mostCompactLayout;
    }
    for (let i = 0; i < WrapLayout.MAX_COMPRESS_TRIES; i++) {
      let candidateLayout = this.internalLayoutSize(target, (mostCompactLayout.getWidestColumnWidth() - 1) | 0, preferred, reverseComponentOrder);
      if (candidateLayout.dimension.height_ <= mostCompactLayout.dimension.height_) {
        mostCompactLayout = candidateLayout;
      } else {
        break;
      }
    }
    return mostCompactLayout;
  }
  internalLayoutSize(target: Container, targetWidth: number, preferred: boolean, layoutBottomToTop: boolean): WrapLayout$Layout {
    let insets = target.getInsets$();
    let horizontalInsetsAndGap = (insets.left + insets.right + (Math.imul(this.minHorizontalGap, 2))) | 0;
    let maxWidth = (targetWidth - horizontalInsetsAndGap) | 0;
    let rows = new ArrayList();
    let currentLayoutSize = new Dimension()._Dimension$int$int(0, 0);
    let sharedComponentSize = this.forceComponentSize;
    if (this.allComponentsWithTheSameSize) {
      sharedComponentSize = new Dimension()._Dimension$int$int(0, 0);
      for (const $it0 = this.getVisibleComponents(target, layoutBottomToTop).iterator(); $it0.hasNext(); ) {
        let component = $it0.next();
        let d = preferred ? component.getPreferredSize$() : component.getMinimumSize$();
        if (d.width_ > sharedComponentSize.width_) {
          sharedComponentSize.width_ = d.width_;
        }
        if (d.height_ > sharedComponentSize.height_) {
          sharedComponentSize.height_ = d.height_;
        }
      }
    }
    let currentChildren = new ArrayList();
    let currentRowSize = new Dimension()._Dimension$int$int(0, 0);
    for (const $it1 = this.getVisibleComponents(target, layoutBottomToTop).iterator(); $it1.hasNext(); ) {
      let component = $it1.next();
      let d: Dimension;
      if (sharedComponentSize != null) {
        d = sharedComponentSize;
      } else {
        d = preferred ? component.getPreferredSize$() : component.getMinimumSize$();
      }
      if (((currentRowSize.width_ + d.width_) | 0) > maxWidth) {
        this.updateCurrentLayoutSize(currentLayoutSize, currentRowSize);
        rows.add(new WrapLayout$Row()._WrapLayout$Row(currentRowSize, currentChildren));
        currentChildren = new ArrayList();
        currentRowSize = new Dimension()._Dimension$int$int(0, 0);
      }
      if (currentRowSize.width_ !== 0) {
        currentRowSize.width_ = (currentRowSize.width_ + this.minHorizontalGap) | 0;
      }
      currentChildren.add(new WrapLayout$Child()._WrapLayout$Child(component, new Rectangle()._Rectangle$int$int$int$int(currentRowSize.width_, currentLayoutSize.height_, d.width_, d.height_)));
      currentRowSize.width_ = (currentRowSize.width_ + d.width_) | 0;
      currentRowSize.height_ = Math.max(currentRowSize.height_, d.height_);
    }
    currentLayoutSize.width_ = Math.max(currentLayoutSize.width_, currentRowSize.width_);
    currentLayoutSize.height_ = (currentLayoutSize.height_ + currentRowSize.height_) | 0;
    rows.add(new WrapLayout$Row()._WrapLayout$Row(currentRowSize, currentChildren));
    currentLayoutSize.width_ = (currentLayoutSize.width_ + horizontalInsetsAndGap) | 0;
    currentLayoutSize.height_ = (currentLayoutSize.height_ + (insets.top + insets.bottom)) | 0;
    let scrollPane = SwingUtilities.getAncestorOfClass($J.cls(JScrollPane), target);
    if (scrollPane != null && target.isValid()) {
      currentLayoutSize.width_ = (currentLayoutSize.width_ - (this.minHorizontalGap + 1)) | 0;
    }
    if (layoutBottomToTop) {
      this.reverseLayout(rows);
    }
    return new WrapLayout$Layout()._WrapLayout$Layout(currentLayoutSize, rows);
  }
  reverseLayout(rows: List<WrapLayout$Row>): void {
    if (rows.isEmpty()) {
      return;
    }
    Collections.reverse(rows);
    let y = 0;
    let rowNum = 0;
    let lastRowIndex = (rows.size() - 1) | 0;
    for (const $it2 = rows.iterator(); $it2.hasNext(); ) {
      let row = $it2.next();
      Collections.reverse(row.children_);
      let x = 0;
      let childNum = 0;
      let lastChildIndex = (row.children_.size() - 1) | 0;
      for (const $it3 = row.children_.iterator(); $it3.hasNext(); ) {
        let child = $it3.next();
        child.bounds_.x_ = x;
        child.bounds_.y_ = y;
        x = (x + child.bounds_.width_) | 0;
        if (childNum !== lastChildIndex) {
          x = (x + this.minHorizontalGap) | 0;
        }
        childNum++;
      }
      y = (y + row.size_.height_) | 0;
      if (rowNum !== lastRowIndex) {
        y = (y + this.minVerticalGap) | 0;
      }
      rowNum++;
    }
  }
  updateCurrentLayoutSize(currentLayoutSize: Dimension, newRowSize: Dimension): void {
    currentLayoutSize.width_ = Math.max(currentLayoutSize.width_, newRowSize.width_);
    currentLayoutSize.height_ = (currentLayoutSize.height_ + this.minVerticalGap) | 0;
    currentLayoutSize.height_ = (currentLayoutSize.height_ + newRowSize.height_) | 0;
  }
  /**
   * {@inheritDoc}
   */
  layoutContainer$Container(parent: Container): void {
    {
      let size = parent.getSize$();
      let layout = this.determineLayout$Container$int$boolean$WrapLayout(parent, size.width_, true);
      if (layout.dimension.width_ > size.width_ || layout.dimension.height_ > size.height_) {
        layout = this.determineLayout$Container$int$boolean$WrapLayout(parent, size.width_, false);
      }
      this.applyLayout(parent, size, layout);
    }
  }
  /**
   * Layout of the container. To be used by other layout managers using
   * {@code WrapLayout} as a fallback.
   */
  layoutContainer$Container$boolean(parent: Container, preferred: boolean): void {
    {
      let size = parent.getSize$();
      let layout = this.determineLayout$Container$int$boolean$WrapLayout(parent, size.width_, preferred);
      this.applyLayout(parent, size, layout);
    }
  }
  applyLayout(parent: Container, size: Dimension, layout: WrapLayout$Layout): void {
    let offsetAll = this.determineOffsetForCentering(size, layout.dimension);
    let rowsSize = layout.rows.size();
    let rowNum = 0;
    for (const $it4 = layout.rows.iterator(); $it4.hasNext(); ) {
      let row = $it4.next();
      let additionalGapWidthPerChild = this.determineAdditionalGapWidthPerChild(size, rowsSize, rowNum, row);
      let totalAdditionalWidthFromAllChildren = (row.children_.size() > 1) ? Math.imul(additionalGapWidthPerChild, ((row.children_.size() - 1) | 0)) : 0;
      let additionalWidth = (size.width_ - row.size_.width_) | 0;
      let childNum = 0;
      let offsetRowX = $J.idiv(((size.width_ - row.size_.width_ - totalAdditionalWidthFromAllChildren) | 0), 2);
      for (const $it5 = row.children_.iterator(); $it5.hasNext(); ) {
        let child = $it5.next();
        let bounds = child.bounds_;
        if (additionalGapWidthPerChild > 0) {
          if (childNum !== 0) {
            bounds.x_ = (bounds.x_ + Math.imul(additionalGapWidthPerChild, childNum)) | 0;
          }
        }
        if (this.horizontalAlignment === WrapLayout$HorizontalAlignment.CENTER) {
          bounds.x_ = (bounds.x_ + offsetRowX) | 0;
        } else if (this.horizontalAlignment === WrapLayout$HorizontalAlignment.LEFT) {
        } else if (this.horizontalAlignment === WrapLayout$HorizontalAlignment.RIGHT) {
          bounds.x_ = (bounds.x_ + additionalWidth) | 0;
        } else {
          throw new IllegalStateException('Unknown horizontalAlignment: ' + $J.str(this.horizontalAlignment));
        }
        bounds.y_ = (bounds.y_ + offsetAll.y_) | 0;
        child.component.setBounds$Rectangle(bounds);
        childNum++;
      }
      rowNum++;
    }
  }
  determineAdditionalGapWidthPerChild(size: Dimension, rowsSize: number, rowNum: number, row: WrapLayout$Row): number {
    if (row.children_.size() <= 1) {
      return 0;
    }
    if (!this.hasAutoHorizontalGap(rowsSize, rowNum)) {
      return 0;
    }
    return Math.min(this.maxHorizontalGap, $J.idiv(((size.width_ - row.size_.width_) | 0), ((row.children_.size() - 1) | 0)));
  }
  hasAutoHorizontalGap(rowsSize: number, rowNum: number): boolean {
    return this.horizontalGap === WrapLayout$HorizontalGap.AUTO || this.horizontalGap === WrapLayout$HorizontalGap.AUTO_TOP && rowNum === 0 || this.horizontalGap === WrapLayout$HorizontalGap.AUTO_BOTTOM && rowNum === ((rowsSize - 1) | 0);
  }
  getVisibleComponents(parent: Container, reverseComponentOrder: boolean): List<Component> {
    let components = new ArrayList(parent.getComponentCount());
    for (let c of parent.getComponents()) {
      if (!c.isVisible$()) {
        continue;
      }
      components.add(c);
    }
    if (reverseComponentOrder) {
      Collections.reverse(components);
    }
    return components;
  }
  determineOffsetForCentering(displaySize: Dimension, contentSize: Dimension): Point {
    return new Point()._Point$int$int($J.idiv(((displaySize.width_ - contentSize.width_) | 0), 2), $J.idiv(((displaySize.height_ - contentSize.height_) | 0), 2));
  }
  addLayoutComponent$String$Component(name: string, comp: Component): void {
  }
  removeLayoutComponent(comp: Component): void {
  }
}

export class WrapLayout$HorizontalAlignment extends JEnum {
  static LEFT: WrapLayout$HorizontalAlignment = null;
  static CENTER: WrapLayout$HorizontalAlignment = null;
  static RIGHT: WrapLayout$HorizontalAlignment = null;
  static $VALUES: WrapLayout$HorizontalAlignment[] = null;
  _WrapLayout$HorizontalAlignment($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): WrapLayout$HorizontalAlignment[] { return WrapLayout$HorizontalAlignment.$VALUES.slice(); }
  static valueOf(name: string): WrapLayout$HorizontalAlignment { return $J.enumValueOf(WrapLayout$HorizontalAlignment, name); }
  static $clinit() {
    WrapLayout$HorizontalAlignment.LEFT = new WrapLayout$HorizontalAlignment()._WrapLayout$HorizontalAlignment('LEFT', 0);
    WrapLayout$HorizontalAlignment.CENTER = new WrapLayout$HorizontalAlignment()._WrapLayout$HorizontalAlignment('CENTER', 1);
    WrapLayout$HorizontalAlignment.RIGHT = new WrapLayout$HorizontalAlignment()._WrapLayout$HorizontalAlignment('RIGHT', 2);
    WrapLayout$HorizontalAlignment.$VALUES = [WrapLayout$HorizontalAlignment.LEFT, WrapLayout$HorizontalAlignment.CENTER, WrapLayout$HorizontalAlignment.RIGHT];
  }
}

export class WrapLayout$LayoutStyle extends JEnum {
  static BALANCED: WrapLayout$LayoutStyle = null;
  static PREFER_TOP: WrapLayout$LayoutStyle = null;
  static PREFER_BOTTOM: WrapLayout$LayoutStyle = null;
  static $VALUES: WrapLayout$LayoutStyle[] = null;
  _WrapLayout$LayoutStyle($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): WrapLayout$LayoutStyle[] { return WrapLayout$LayoutStyle.$VALUES.slice(); }
  static valueOf(name: string): WrapLayout$LayoutStyle { return $J.enumValueOf(WrapLayout$LayoutStyle, name); }
  static $clinit() {
    WrapLayout$LayoutStyle.BALANCED = new WrapLayout$LayoutStyle()._WrapLayout$LayoutStyle('BALANCED', 0);
    WrapLayout$LayoutStyle.PREFER_TOP = new WrapLayout$LayoutStyle()._WrapLayout$LayoutStyle('PREFER_TOP', 1);
    WrapLayout$LayoutStyle.PREFER_BOTTOM = new WrapLayout$LayoutStyle()._WrapLayout$LayoutStyle('PREFER_BOTTOM', 2);
    WrapLayout$LayoutStyle.$VALUES = [WrapLayout$LayoutStyle.BALANCED, WrapLayout$LayoutStyle.PREFER_TOP, WrapLayout$LayoutStyle.PREFER_BOTTOM];
  }
}

export class WrapLayout$HorizontalGap extends JEnum {
  static NONE: WrapLayout$HorizontalGap = null;
  static AUTO: WrapLayout$HorizontalGap = null;
  static AUTO_TOP: WrapLayout$HorizontalGap = null;
  static AUTO_BOTTOM: WrapLayout$HorizontalGap = null;
  static $VALUES: WrapLayout$HorizontalGap[] = null;
  _WrapLayout$HorizontalGap($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): WrapLayout$HorizontalGap[] { return WrapLayout$HorizontalGap.$VALUES.slice(); }
  static valueOf(name: string): WrapLayout$HorizontalGap { return $J.enumValueOf(WrapLayout$HorizontalGap, name); }
  static $clinit() {
    WrapLayout$HorizontalGap.NONE = new WrapLayout$HorizontalGap()._WrapLayout$HorizontalGap('NONE', 0);
    WrapLayout$HorizontalGap.AUTO = new WrapLayout$HorizontalGap()._WrapLayout$HorizontalGap('AUTO', 1);
    WrapLayout$HorizontalGap.AUTO_TOP = new WrapLayout$HorizontalGap()._WrapLayout$HorizontalGap('AUTO_TOP', 2);
    WrapLayout$HorizontalGap.AUTO_BOTTOM = new WrapLayout$HorizontalGap()._WrapLayout$HorizontalGap('AUTO_BOTTOM', 3);
    WrapLayout$HorizontalGap.$VALUES = [WrapLayout$HorizontalGap.NONE, WrapLayout$HorizontalGap.AUTO, WrapLayout$HorizontalGap.AUTO_TOP, WrapLayout$HorizontalGap.AUTO_BOTTOM];
  }
}

export class WrapLayout$Layout extends JObject {
  dimension: Dimension = null;
  rows: List<WrapLayout$Row> = null;
  _WrapLayout$Layout(dimension: Dimension, rows: List<WrapLayout$Row>): this {
    this.dimension = dimension;
    this.rows = rows;
    return this;
  }
  getWidestColumnWidth(): number {
    return this.rows.stream().mapToInt((r) => r.size_.width_).max().orElse(0);
  }
}

export class WrapLayout$Row extends JObject {
  size_: Dimension = null;
  children_: List<WrapLayout$Child> = null;
  _WrapLayout$Row(size: Dimension, children: List<WrapLayout$Child>): this {
    this.size_ = size;
    this.children_ = children;
    return this;
  }
}

export class WrapLayout$Child extends JObject {
  component: Component = null;
  bounds_: Rectangle = null;
  _WrapLayout$Child(component: Component, bounds: Rectangle): this {
    this.component = component;
    this.bounds_ = bounds;
    return this;
  }
}

$J.define(WrapLayout, 'net.sf.freecol.client.gui.panel.WrapLayout', { kind: 'class', ifaces: ['java.awt.LayoutManager'], sup: 'java.lang.Object', ctors: { '': '_WrapLayout' }, meths: { 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component', 'layoutContainer(java.awt.Container,boolean)': 'layoutContainer$Container$boolean', 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'determineLayout(java.awt.Container,int,boolean)': 'determineLayout$Container$int$boolean$WrapLayout', 'determineLayout(java.awt.Container,boolean)': 'determineLayout$Container$boolean$WrapLayout', 'layoutSize(java.awt.Container,boolean)': 'layoutSize$Container$boolean$WrapLayout', 'layoutSize(java.awt.Container,int,boolean)': 'layoutSize$Container$int$boolean', 'withHorizontalGap(net.sf.freecol.client.gui.panel.WrapLayout$HorizontalGap,int,int)': 'withHorizontalGap$HorizontalGap$int$int', 'withHorizontalGap(net.sf.freecol.client.gui.panel.WrapLayout$HorizontalGap)': 'withHorizontalGap$HorizontalGap' } });
$J.define(WrapLayout$HorizontalAlignment, 'net.sf.freecol.client.gui.panel.WrapLayout$HorizontalAlignment', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_WrapLayout$HorizontalAlignment' }, clinit: true, lazy: ['$VALUES', 'LEFT', 'CENTER', 'RIGHT'] });
$J.define(WrapLayout$LayoutStyle, 'net.sf.freecol.client.gui.panel.WrapLayout$LayoutStyle', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_WrapLayout$LayoutStyle' }, clinit: true, lazy: ['$VALUES', 'BALANCED', 'PREFER_TOP', 'PREFER_BOTTOM'] });
$J.define(WrapLayout$HorizontalGap, 'net.sf.freecol.client.gui.panel.WrapLayout$HorizontalGap', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_WrapLayout$HorizontalGap' }, clinit: true, lazy: ['$VALUES', 'NONE', 'AUTO', 'AUTO_TOP', 'AUTO_BOTTOM'] });
$J.define(WrapLayout$Layout, 'net.sf.freecol.client.gui.panel.WrapLayout$Layout', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.awt.Dimension,java.util.List': '_WrapLayout$Layout' }, returns: { 'getWidestColumnWidth': 'int' } });
$J.define(WrapLayout$Row, 'net.sf.freecol.client.gui.panel.WrapLayout$Row', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.awt.Dimension,java.util.List': '_WrapLayout$Row' } });
$J.define(WrapLayout$Child, 'net.sf.freecol.client.gui.panel.WrapLayout$Child', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.awt.Component,java.awt.Rectangle': '_WrapLayout$Child' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
});
