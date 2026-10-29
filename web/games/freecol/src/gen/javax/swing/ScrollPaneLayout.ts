// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/ScrollPaneLayout.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, JObject } from '../../../jre/index.ts';

let Dimension, Insets, Rectangle, ScrollPaneConstants, Scrollable, SwingUtilities, UIManager;

/**
 * The layout manager used by <code>JScrollPane</code>.
 * <code>JScrollPaneLayout</code> is
 * responsible for nine components: a viewport, two scrollbars,
 * a row header, a column header, and four "corner" components.
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
 * @see JScrollPane
 * @see JViewport
 *
 * @author Hans Muller
 * @since 1.2
 */
export class ScrollPaneLayout extends JObject {
  /**
   * The scrollpane's viewport child.
   * Default is an empty <code>JViewport</code>.
   * @see JScrollPane#setViewport
   */
  viewport: JViewport = null;
  /**
   * The scrollpane's vertical scrollbar child.
   * Default is a <code>JScrollBar</code>.
   * @see JScrollPane#setVerticalScrollBar
   */
  vsb: JScrollBar = null;
  /**
   * The scrollpane's horizontal scrollbar child.
   * Default is a <code>JScrollBar</code>.
   * @see JScrollPane#setHorizontalScrollBar
   */
  hsb: JScrollBar = null;
  /**
   * The row header child.  Default is <code>null</code>.
   * @see JScrollPane#setRowHeader
   */
  rowHead: JViewport = null;
  /**
   * The column header child.  Default is <code>null</code>.
   * @see JScrollPane#setColumnHeader
   */
  colHead: JViewport = null;
  /**
   * The component to display in the lower left corner.
   * Default is <code>null</code>.
   * @see JScrollPane#setCorner
   */
  lowerLeft: Component = null;
  /**
   * The component to display in the lower right corner.
   * Default is <code>null</code>.
   * @see JScrollPane#setCorner
   */
  lowerRight: Component = null;
  /**
   * The component to display in the upper left corner.
   * Default is <code>null</code>.
   * @see JScrollPane#setCorner
   */
  upperLeft: Component = null;
  /**
   * The component to display in the upper right corner.
   * Default is <code>null</code>.
   * @see JScrollPane#setCorner
   */
  upperRight: Component = null;
  /**
   * The display policy for the vertical scrollbar.
   * The default is <code>ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED</code>.
   * <p>
   * This field is obsolete, please use the <code>JScrollPane</code> field instead.
   *
   * @see JScrollPane#setVerticalScrollBarPolicy
   */
  vsbPolicy: number = 0;
  /**
   * The display policy for the horizontal scrollbar.
   * The default is <code>ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED</code>.
   * <p>
   * This field is obsolete, please use the <code>JScrollPane</code> field instead.
   *
   * @see JScrollPane#setHorizontalScrollBarPolicy
   */
  hsbPolicy: number = 0;
  /**
   * Constructs a {@code ScrollPaneLayout}.
   */
  _ScrollPaneLayout(): this {
    this.vsbPolicy = ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED;
    this.hsbPolicy = ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED;
    return this;
  }
  /**
   * This method is invoked after the ScrollPaneLayout is set as the
   * LayoutManager of a <code>JScrollPane</code>.
   * It initializes all of the internal fields that
   * are ordinarily set by <code>addLayoutComponent</code>.  For example:
   * <pre>
   * ScrollPaneLayout mySPLayout = new ScrollPanelLayout() {
   *     public void layoutContainer(Container p) {
   *         super.layoutContainer(p);
   *         // do some extra work here ...
   *     }
   * };
   * scrollpane.setLayout(mySPLayout):
   * </pre>
   *
   * @param sp an instance of the {@code JScrollPane}
   */
  syncWithScrollPane(sp: JScrollPane): void {
    this.viewport = sp.getViewport();
    this.vsb = sp.getVerticalScrollBar();
    this.hsb = sp.getHorizontalScrollBar();
    this.rowHead = sp.getRowHeader();
    this.colHead = sp.getColumnHeader();
    this.lowerLeft = sp.getCorner(ScrollPaneConstants.LOWER_LEFT_CORNER);
    this.lowerRight = sp.getCorner(ScrollPaneConstants.LOWER_RIGHT_CORNER);
    this.upperLeft = sp.getCorner(ScrollPaneConstants.UPPER_LEFT_CORNER);
    this.upperRight = sp.getCorner(ScrollPaneConstants.UPPER_RIGHT_CORNER);
    this.vsbPolicy = sp.getVerticalScrollBarPolicy();
    this.hsbPolicy = sp.getHorizontalScrollBarPolicy();
  }
  /**
   * Removes an existing component.  When a new component, such as
   * the left corner, or vertical scrollbar, is added, the old one,
   * if it exists, must be removed.
   * <p>
   * This method returns <code>newC</code>. If <code>oldC</code> is
   * not equal to <code>newC</code> and is non-<code>null</code>,
   * it will be removed from its parent.
   *
   * @param oldC the <code>Component</code> to replace
   * @param newC the <code>Component</code> to add
   * @return the <code>newC</code>
   */
  addSingletonComponent(oldC: Component, newC: Component): Component {
    if ((oldC != null) && (oldC !== newC)) {
      oldC.getParent().remove$Component(oldC);
    }
    return newC;
  }
  /**
   * Adds the specified component to the layout. The layout is
   * identified using one of:
   * <ul>
   * <li>ScrollPaneConstants.VIEWPORT
   * <li>ScrollPaneConstants.VERTICAL_SCROLLBAR
   * <li>ScrollPaneConstants.HORIZONTAL_SCROLLBAR
   * <li>ScrollPaneConstants.ROW_HEADER
   * <li>ScrollPaneConstants.COLUMN_HEADER
   * <li>ScrollPaneConstants.LOWER_LEFT_CORNER
   * <li>ScrollPaneConstants.LOWER_RIGHT_CORNER
   * <li>ScrollPaneConstants.UPPER_LEFT_CORNER
   * <li>ScrollPaneConstants.UPPER_RIGHT_CORNER
   * </ul>
   *
   * @param s the component identifier
   * @param c the component to be added
   * @throws IllegalArgumentException if <code>s</code> is an invalid key
   */
  addLayoutComponent$String$Component(s: string, c: Component): void {
    if ($J.equals(s, ScrollPaneConstants.VIEWPORT)) {
      this.viewport = this.addSingletonComponent(this.viewport, c);
    } else if ($J.equals(s, ScrollPaneConstants.VERTICAL_SCROLLBAR)) {
      this.vsb = this.addSingletonComponent(this.vsb, c);
    } else if ($J.equals(s, ScrollPaneConstants.HORIZONTAL_SCROLLBAR)) {
      this.hsb = this.addSingletonComponent(this.hsb, c);
    } else if ($J.equals(s, ScrollPaneConstants.ROW_HEADER)) {
      this.rowHead = this.addSingletonComponent(this.rowHead, c);
    } else if ($J.equals(s, ScrollPaneConstants.COLUMN_HEADER)) {
      this.colHead = this.addSingletonComponent(this.colHead, c);
    } else if ($J.equals(s, ScrollPaneConstants.LOWER_LEFT_CORNER)) {
      this.lowerLeft = this.addSingletonComponent(this.lowerLeft, c);
    } else if ($J.equals(s, ScrollPaneConstants.LOWER_RIGHT_CORNER)) {
      this.lowerRight = this.addSingletonComponent(this.lowerRight, c);
    } else if ($J.equals(s, ScrollPaneConstants.UPPER_LEFT_CORNER)) {
      this.upperLeft = this.addSingletonComponent(this.upperLeft, c);
    } else if ($J.equals(s, ScrollPaneConstants.UPPER_RIGHT_CORNER)) {
      this.upperRight = this.addSingletonComponent(this.upperRight, c);
    } else {
      throw new IllegalArgumentException('invalid layout key ' + s);
    }
  }
  /**
   * Removes the specified component from the layout.
   *
   * @param c the component to remove
   */
  removeLayoutComponent(c: Component): void {
    if (c === this.viewport) {
      this.viewport = null;
    } else if (c === this.vsb) {
      this.vsb = null;
    } else if (c === this.hsb) {
      this.hsb = null;
    } else if (c === this.rowHead) {
      this.rowHead = null;
    } else if (c === this.colHead) {
      this.colHead = null;
    } else if (c === this.lowerLeft) {
      this.lowerLeft = null;
    } else if (c === this.lowerRight) {
      this.lowerRight = null;
    } else if (c === this.upperLeft) {
      this.upperLeft = null;
    } else if (c === this.upperRight) {
      this.upperRight = null;
    }
  }
  /**
   * The preferred size of a <code>ScrollPane</code> is the size of the insets,
   * plus the preferred size of the viewport, plus the preferred size of
   * the visible headers, plus the preferred size of the scrollbars
   * that will appear given the current view and the current
   * scrollbar displayPolicies.
   * <p>Note that the rowHeader is calculated as part of the preferred width
   * and the colHeader is calculated as part of the preferred size.
   *
   * @param parent the <code>Container</code> that will be laid out
   * @return a <code>Dimension</code> object specifying the preferred size of the
   *         viewport and any scrollbars
   * @see ViewportLayout
   * @see LayoutManager
   */
  preferredLayoutSize(parent: Container): Dimension {
    let scrollPane = parent;
    this.vsbPolicy = scrollPane.getVerticalScrollBarPolicy();
    this.hsbPolicy = scrollPane.getHorizontalScrollBarPolicy();
    let insets = parent.getInsets$();
    let prefWidth = (insets.left + insets.right) | 0;
    let prefHeight = (insets.top + insets.bottom) | 0;
    let extentSize = null;
    let viewSize = null;
    let view = null;
    if (this.viewport != null) {
      extentSize = this.viewport.getPreferredSize$();
      view = this.viewport.getView();
      if (view != null) {
        viewSize = view.getPreferredSize$();
      } else {
        viewSize = new Dimension()._Dimension$int$int(0, 0);
      }
    }
    if (extentSize != null) {
      prefWidth = (prefWidth + extentSize.width_) | 0;
      prefHeight = (prefHeight + extentSize.height_) | 0;
    }
    let viewportBorder = scrollPane.getViewportBorder();
    if (viewportBorder != null) {
      let vpbInsets = viewportBorder.getBorderInsets$Component(parent);
      prefWidth = (prefWidth + (vpbInsets.left + vpbInsets.right)) | 0;
      prefHeight = (prefHeight + (vpbInsets.top + vpbInsets.bottom)) | 0;
    }
    if ((this.rowHead != null) && this.rowHead.isVisible$()) {
      prefWidth = (prefWidth + this.rowHead.getPreferredSize$().width_) | 0;
    }
    if ((this.colHead != null) && this.colHead.isVisible$()) {
      prefHeight = (prefHeight + this.colHead.getPreferredSize$().height_) | 0;
    }
    if ((this.vsb != null) && (this.vsbPolicy !== ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER)) {
      if (this.vsbPolicy === ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS) {
        prefWidth = (prefWidth + this.vsb.getPreferredSize$().width_) | 0;
      } else if ((viewSize != null) && (extentSize != null)) {
        let canScroll = true;
        if ($J.isa(view, Scrollable)) {
          canScroll = !(view).getScrollableTracksViewportHeight();
        }
        if (canScroll && (viewSize.height_ > extentSize.height_)) {
          prefWidth = (prefWidth + this.vsb.getPreferredSize$().width_) | 0;
        }
      }
    }
    if ((this.hsb != null) && (this.hsbPolicy !== ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER)) {
      if (this.hsbPolicy === ScrollPaneConstants.HORIZONTAL_SCROLLBAR_ALWAYS) {
        prefHeight = (prefHeight + this.hsb.getPreferredSize$().height_) | 0;
      } else if ((viewSize != null) && (extentSize != null)) {
        let canScroll = true;
        if ($J.isa(view, Scrollable)) {
          canScroll = !(view).getScrollableTracksViewportWidth();
        }
        if (canScroll && (viewSize.width_ > extentSize.width_)) {
          prefHeight = (prefHeight + this.hsb.getPreferredSize$().height_) | 0;
        }
      }
    }
    return new Dimension()._Dimension$int$int(prefWidth, prefHeight);
  }
  /**
   * The minimum size of a <code>ScrollPane</code> is the size of the insets
   * plus minimum size of the viewport, plus the scrollpane's
   * viewportBorder insets, plus the minimum size
   * of the visible headers, plus the minimum size of the
   * scrollbars whose displayPolicy isn't NEVER.
   *
   * @param parent the <code>Container</code> that will be laid out
   * @return a <code>Dimension</code> object specifying the minimum size
   */
  minimumLayoutSize(parent: Container): Dimension {
    let scrollPane = parent;
    this.vsbPolicy = scrollPane.getVerticalScrollBarPolicy();
    this.hsbPolicy = scrollPane.getHorizontalScrollBarPolicy();
    let insets = parent.getInsets$();
    let minWidth = (insets.left + insets.right) | 0;
    let minHeight = (insets.top + insets.bottom) | 0;
    if (this.viewport != null) {
      let size = this.viewport.getMinimumSize$();
      minWidth = (minWidth + size.width_) | 0;
      minHeight = (minHeight + size.height_) | 0;
    }
    let viewportBorder = scrollPane.getViewportBorder();
    if (viewportBorder != null) {
      let vpbInsets = viewportBorder.getBorderInsets$Component(parent);
      minWidth = (minWidth + (vpbInsets.left + vpbInsets.right)) | 0;
      minHeight = (minHeight + (vpbInsets.top + vpbInsets.bottom)) | 0;
    }
    if ((this.rowHead != null) && this.rowHead.isVisible$()) {
      let size = this.rowHead.getMinimumSize$();
      minWidth = (minWidth + size.width_) | 0;
      minHeight = Math.max(minHeight, size.height_);
    }
    if ((this.colHead != null) && this.colHead.isVisible$()) {
      let size = this.colHead.getMinimumSize$();
      minWidth = Math.max(minWidth, size.width_);
      minHeight = (minHeight + size.height_) | 0;
    }
    if ((this.vsb != null) && (this.vsbPolicy !== ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER)) {
      let size = this.vsb.getMinimumSize$();
      minWidth = (minWidth + size.width_) | 0;
      minHeight = Math.max(minHeight, size.height_);
    }
    if ((this.hsb != null) && (this.hsbPolicy !== ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER)) {
      let size = this.hsb.getMinimumSize$();
      minWidth = Math.max(minWidth, size.width_);
      minHeight = (minHeight + size.height_) | 0;
    }
    return new Dimension()._Dimension$int$int(minWidth, minHeight);
  }
  /**
   * Lays out the scrollpane. The positioning of components depends on
   * the following constraints:
   * <ul>
   * <li> The row header, if present and visible, gets its preferred
   * width and the viewport's height.
   *
   * <li> The column header, if present and visible, gets its preferred
   * height and the viewport's width.
   *
   * <li> If a vertical scrollbar is needed, i.e. if the viewport's extent
   * height is smaller than its view height or if the <code>displayPolicy</code>
   * is ALWAYS, it's treated like the row header with respect to its
   * dimensions and is made visible.
   *
   * <li> If a horizontal scrollbar is needed, it is treated like the
   * column header (see the paragraph above regarding the vertical scrollbar).
   *
   * <li> If the scrollpane has a non-<code>null</code>
   * <code>viewportBorder</code>, then space is allocated for that.
   *
   * <li> The viewport gets the space available after accounting for
   * the previous constraints.
   *
   * <li> The corner components, if provided, are aligned with the
   * ends of the scrollbars and headers. If there is a vertical
   * scrollbar, the right corners appear; if there is a horizontal
   * scrollbar, the lower corners appear; a row header gets left
   * corners, and a column header gets upper corners.
   * </ul>
   *
   * @param parent the <code>Container</code> to lay out
   */
  layoutContainer$Container(parent: Container): void {
    let scrollPane = parent;
    this.vsbPolicy = scrollPane.getVerticalScrollBarPolicy();
    this.hsbPolicy = scrollPane.getHorizontalScrollBarPolicy();
    let availR = scrollPane.getBounds$();
    availR.x_ = availR.y_ = 0;
    let insets = parent.getInsets$();
    availR.x_ = insets.left;
    availR.y_ = insets.top;
    availR.width_ = (availR.width_ - (insets.left + insets.right)) | 0;
    availR.height_ = (availR.height_ - (insets.top + insets.bottom)) | 0;
    let leftToRight = SwingUtilities.isLeftToRight(scrollPane);
    let colHeadR = new Rectangle()._Rectangle$int$int$int$int(0, availR.y_, 0, 0);
    if ((this.colHead != null) && (this.colHead.isVisible$())) {
      let colHeadHeight = Math.min(availR.height_, this.colHead.getPreferredSize$().height_);
      colHeadR.height_ = colHeadHeight;
      availR.y_ = (availR.y_ + colHeadHeight) | 0;
      availR.height_ = (availR.height_ - colHeadHeight) | 0;
    }
    let rowHeadR = new Rectangle()._Rectangle$int$int$int$int(0, 0, 0, 0);
    if ((this.rowHead != null) && (this.rowHead.isVisible$())) {
      let rowHeadWidth = Math.min(availR.width_, this.rowHead.getPreferredSize$().width_);
      rowHeadR.width_ = rowHeadWidth;
      availR.width_ = (availR.width_ - rowHeadWidth) | 0;
      if (leftToRight) {
        rowHeadR.x_ = availR.x_;
        availR.x_ = (availR.x_ + rowHeadWidth) | 0;
      } else {
        rowHeadR.x_ = (availR.x_ + availR.width_) | 0;
      }
    }
    let viewportBorder = scrollPane.getViewportBorder();
    let vpbInsets: Insets;
    if (viewportBorder != null) {
      vpbInsets = viewportBorder.getBorderInsets$Component(parent);
      availR.x_ = (availR.x_ + vpbInsets.left) | 0;
      availR.y_ = (availR.y_ + vpbInsets.top) | 0;
      availR.width_ = (availR.width_ - (vpbInsets.left + vpbInsets.right)) | 0;
      availR.height_ = (availR.height_ - (vpbInsets.top + vpbInsets.bottom)) | 0;
    } else {
      vpbInsets = new Insets()._Insets(0, 0, 0, 0);
    }
    let view = (this.viewport != null) ? this.viewport.getView() : null;
    let viewPrefSize = (view != null) ? view.getPreferredSize$() : new Dimension()._Dimension$int$int(0, 0);
    let extentSize = (this.viewport != null) ? this.viewport.toViewCoordinates$Dimension(availR.getSize()) : new Dimension()._Dimension$int$int(0, 0);
    let viewTracksViewportWidth = false;
    let viewTracksViewportHeight = false;
    let isEmpty = (availR.width_ < 0 || availR.height_ < 0);
    let sv: Scrollable;
    if (!isEmpty && $J.isa(view, Scrollable)) {
      sv = view;
      viewTracksViewportWidth = sv.getScrollableTracksViewportWidth();
      viewTracksViewportHeight = sv.getScrollableTracksViewportHeight();
    } else {
      sv = null;
    }
    let vsbR = new Rectangle()._Rectangle$int$int$int$int(0, (availR.y_ - vpbInsets.top) | 0, 0, 0);
    let vsbNeeded: boolean;
    if (this.vsbPolicy === ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS) {
      vsbNeeded = true;
    } else if (this.vsbPolicy === ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER) {
      vsbNeeded = false;
    } else {
      vsbNeeded = !viewTracksViewportHeight && (viewPrefSize.height_ > extentSize.height_);
    }
    if ((this.vsb != null) && vsbNeeded) {
      this.adjustForVSB(true, availR, vsbR, vpbInsets, leftToRight);
      extentSize = this.viewport.toViewCoordinates$Dimension(availR.getSize());
    }
    let hsbR = new Rectangle()._Rectangle$int$int$int$int((availR.x_ - vpbInsets.left) | 0, 0, 0, 0);
    let hsbNeeded: boolean;
    if (this.hsbPolicy === ScrollPaneConstants.HORIZONTAL_SCROLLBAR_ALWAYS) {
      hsbNeeded = true;
    } else if (this.hsbPolicy === ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER) {
      hsbNeeded = false;
    } else {
      hsbNeeded = !viewTracksViewportWidth && (viewPrefSize.width_ > extentSize.width_);
    }
    if ((this.hsb != null) && hsbNeeded) {
      this.adjustForHSB(true, availR, hsbR, vpbInsets);
      if ((this.vsb != null) && !vsbNeeded && (this.vsbPolicy !== ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER)) {
        extentSize = this.viewport.toViewCoordinates$Dimension(availR.getSize());
        vsbNeeded = viewPrefSize.height_ > extentSize.height_;
        if (vsbNeeded) {
          this.adjustForVSB(true, availR, vsbR, vpbInsets, leftToRight);
        }
      }
    }
    if (this.viewport != null) {
      this.viewport.setBounds$Rectangle(availR);
      if (sv != null) {
        extentSize = this.viewport.toViewCoordinates$Dimension(availR.getSize());
        let oldHSBNeeded = hsbNeeded;
        let oldVSBNeeded = vsbNeeded;
        viewTracksViewportWidth = sv.getScrollableTracksViewportWidth();
        viewTracksViewportHeight = sv.getScrollableTracksViewportHeight();
        if (this.vsb != null && this.vsbPolicy === ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED) {
          let newVSBNeeded = !viewTracksViewportHeight && (viewPrefSize.height_ > extentSize.height_);
          if (newVSBNeeded !== vsbNeeded) {
            vsbNeeded = newVSBNeeded;
            this.adjustForVSB(vsbNeeded, availR, vsbR, vpbInsets, leftToRight);
            extentSize = this.viewport.toViewCoordinates$Dimension(availR.getSize());
          }
        }
        if (this.hsb != null && this.hsbPolicy === ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED) {
          let newHSBbNeeded = !viewTracksViewportWidth && (viewPrefSize.width_ > extentSize.width_);
          if (newHSBbNeeded !== hsbNeeded) {
            hsbNeeded = newHSBbNeeded;
            this.adjustForHSB(hsbNeeded, availR, hsbR, vpbInsets);
            if ((this.vsb != null) && !vsbNeeded && (this.vsbPolicy !== ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER)) {
              extentSize = this.viewport.toViewCoordinates$Dimension(availR.getSize());
              vsbNeeded = viewPrefSize.height_ > extentSize.height_;
              if (vsbNeeded) {
                this.adjustForVSB(true, availR, vsbR, vpbInsets, leftToRight);
              }
            }
          }
        }
        if (oldHSBNeeded !== hsbNeeded || oldVSBNeeded !== vsbNeeded) {
          this.viewport.setBounds$Rectangle(availR);
        }
      }
    }
    vsbR.height_ = (availR.height_ + vpbInsets.top + vpbInsets.bottom) | 0;
    hsbR.width_ = (availR.width_ + vpbInsets.left + vpbInsets.right) | 0;
    rowHeadR.height_ = (availR.height_ + vpbInsets.top + vpbInsets.bottom) | 0;
    rowHeadR.y_ = (availR.y_ - vpbInsets.top) | 0;
    colHeadR.width_ = (availR.width_ + vpbInsets.left + vpbInsets.right) | 0;
    colHeadR.x_ = (availR.x_ - vpbInsets.left) | 0;
    if (this.rowHead != null) {
      this.rowHead.setBounds$Rectangle(rowHeadR);
    }
    if (this.colHead != null) {
      this.colHead.setBounds$Rectangle(colHeadR);
    }
    if (this.vsb != null) {
      if (vsbNeeded) {
        if (this.colHead != null && UIManager.getBoolean$Object('ScrollPane.fillUpperCorner')) {
          if ((leftToRight && this.upperRight == null) || (!leftToRight && this.upperLeft == null)) {
            vsbR.y_ = colHeadR.y_;
            vsbR.height_ = (vsbR.height_ + colHeadR.height_) | 0;
          }
        }
        this.vsb.setVisible(true);
        this.vsb.setBounds$Rectangle(vsbR);
      } else {
        this.vsb.setVisible(false);
      }
    }
    if (this.hsb != null) {
      if (hsbNeeded) {
        if (this.rowHead != null && UIManager.getBoolean$Object('ScrollPane.fillLowerCorner')) {
          if ((leftToRight && this.lowerLeft == null) || (!leftToRight && this.lowerRight == null)) {
            if (leftToRight) {
              hsbR.x_ = rowHeadR.x_;
            }
            hsbR.width_ = (hsbR.width_ + rowHeadR.width_) | 0;
          }
        }
        this.hsb.setVisible(true);
        this.hsb.setBounds$Rectangle(hsbR);
      } else {
        this.hsb.setVisible(false);
      }
    }
    if (this.lowerLeft != null) {
      this.lowerLeft.setBounds$int$int$int$int(leftToRight ? rowHeadR.x_ : vsbR.x_, hsbR.y_, leftToRight ? rowHeadR.width_ : vsbR.width_, hsbR.height_);
    }
    if (this.lowerRight != null) {
      this.lowerRight.setBounds$int$int$int$int(leftToRight ? vsbR.x_ : rowHeadR.x_, hsbR.y_, leftToRight ? vsbR.width_ : rowHeadR.width_, hsbR.height_);
    }
    if (this.upperLeft != null) {
      this.upperLeft.setBounds$int$int$int$int(leftToRight ? rowHeadR.x_ : vsbR.x_, colHeadR.y_, leftToRight ? rowHeadR.width_ : vsbR.width_, colHeadR.height_);
    }
    if (this.upperRight != null) {
      this.upperRight.setBounds$int$int$int$int(leftToRight ? vsbR.x_ : rowHeadR.x_, colHeadR.y_, leftToRight ? vsbR.width_ : rowHeadR.width_, colHeadR.height_);
    }
  }
  /**
   * Adjusts the <code>Rectangle</code> <code>available</code> based on if
   * the vertical scrollbar is needed (<code>wantsVSB</code>).
   * The location of the vsb is updated in <code>vsbR</code>, and
   * the viewport border insets (<code>vpbInsets</code>) are used to offset
   * the vsb. This is only called when <code>wantsVSB</code> has
   * changed, eg you shouldn't invoke adjustForVSB(true) twice.
   */
  adjustForVSB(wantsVSB: boolean, available: Rectangle, vsbR: Rectangle, vpbInsets: Insets, leftToRight: boolean): void {
    let oldWidth = vsbR.width_;
    if (wantsVSB) {
      let vsbWidth = Math.max(0, Math.min(this.vsb.getPreferredSize$().width_, available.width_));
      available.width_ = (available.width_ - vsbWidth) | 0;
      vsbR.width_ = vsbWidth;
      if (leftToRight) {
        vsbR.x_ = (available.x_ + available.width_ + vpbInsets.right) | 0;
      } else {
        vsbR.x_ = (available.x_ - vpbInsets.left) | 0;
        available.x_ = (available.x_ + vsbWidth) | 0;
      }
    } else {
      available.width_ = (available.width_ + oldWidth) | 0;
    }
  }
  /**
   * Adjusts the <code>Rectangle</code> <code>available</code> based on if
   * the horizontal scrollbar is needed (<code>wantsHSB</code>).
   * The location of the hsb is updated in <code>hsbR</code>, and
   * the viewport border insets (<code>vpbInsets</code>) are used to offset
   * the hsb.  This is only called when <code>wantsHSB</code> has
   * changed, eg you shouldn't invoked adjustForHSB(true) twice.
   */
  adjustForHSB(wantsHSB: boolean, available: Rectangle, hsbR: Rectangle, vpbInsets: Insets): void {
    let oldHeight = hsbR.height_;
    if (wantsHSB) {
      let hsbHeight = Math.max(0, Math.min(available.height_, this.hsb.getPreferredSize$().height_));
      available.height_ = (available.height_ - hsbHeight) | 0;
      hsbR.y_ = (available.y_ + available.height_ + vpbInsets.bottom) | 0;
      hsbR.height_ = hsbHeight;
    } else {
      available.height_ = (available.height_ + oldHeight) | 0;
    }
  }
}

/**
 * The UI resource version of <code>ScrollPaneLayout</code>.
 */
export class ScrollPaneLayout$UIResource extends ScrollPaneLayout {
  /**
   * Constructs a {@code UIResource}.
   */
  _ScrollPaneLayout$UIResource(): this {
    this._ScrollPaneLayout();
    return this;
  }
}

$J.define(ScrollPaneLayout, 'javax.swing.ScrollPaneLayout', { kind: 'class', ifaces: ['java.awt.LayoutManager', 'javax.swing.ScrollPaneConstants', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_ScrollPaneLayout' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' } });
$J.define(ScrollPaneLayout$UIResource, 'javax.swing.ScrollPaneLayout$UIResource', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.ScrollPaneLayout', ctors: { '': '_ScrollPaneLayout$UIResource' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Insets = $J.load('java.awt.Insets');
  Rectangle = $J.load('java.awt.Rectangle');
  ScrollPaneConstants = $J.load('javax.swing.ScrollPaneConstants');
  Scrollable = $J.load('javax.swing.Scrollable');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
});
