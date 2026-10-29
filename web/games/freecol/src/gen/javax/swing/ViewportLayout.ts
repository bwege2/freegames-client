// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/ViewportLayout.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../jre/index.ts';

let Dimension, Scrollable;

/**
 * The default layout manager for <code>JViewport</code>.
 * <code>ViewportLayout</code> defines
 * a policy for layout that should be useful for most applications.
 * The viewport makes its view the same size as the viewport,
 * however it will not make the view smaller than its minimum size.
 * As the viewport grows the view is kept bottom justified until
 * the entire view is visible, subsequently the view is kept top
 * justified.
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
 * @author Hans Muller
 * @since 1.2
 */
export class ViewportLayout extends JObject {
  static SHARED_INSTANCE: ViewportLayout = null;
  /**
   * Constructs a {@code ViewportLayout}.
   */
  _ViewportLayout(): this {
    return this;
  }
  /**
   * Adds the specified component to the layout. Not used by this class.
   * @param name the name of the component
   * @param c the component to be added
   */
  addLayoutComponent$String$Component(name: string, c: Component): void {
  }
  /**
   * Removes the specified component from the layout. Not used by
   * this class.
   * @param c the component to remove
   */
  removeLayoutComponent(c: Component): void {
  }
  /**
   * Returns the preferred dimensions for this layout given the components
   * in the specified target container.
   * @param parent the component which needs to be laid out
   * @return a <code>Dimension</code> object containing the
   *          preferred dimensions
   * @see #minimumLayoutSize
   */
  preferredLayoutSize(parent: Container): Dimension {
    let view = (parent).getView();
    if (view == null) {
      return new Dimension()._Dimension$int$int(0, 0);
    } else if ($J.isa(view, Scrollable)) {
      return (view).getPreferredScrollableViewportSize();
    } else {
      return view.getPreferredSize$();
    }
  }
  /**
   * Returns the minimum dimensions needed to layout the components
   * contained in the specified target container.
   *
   * @param parent the component which needs to be laid out
   * @return a <code>Dimension</code> object containing the minimum
   *          dimensions
   * @see #preferredLayoutSize
   */
  minimumLayoutSize(parent: Container): Dimension {
    return new Dimension()._Dimension$int$int(4, 4);
  }
  /**
   * Called by the AWT when the specified container needs to be laid out.
   *
   * @param parent  the container to lay out
   *
   * @throws AWTError if the target isn't the container specified to the
   *                      <code>BoxLayout</code> constructor
   */
  layoutContainer$Container(parent: Container): void {
    let vp = parent;
    let view = vp.getView();
    let scrollableView = null;
    if (view == null) {
      return;
    } else if ($J.isa(view, Scrollable)) {
      scrollableView = view;
    }
    let insets = vp.getInsets$();
    let viewPrefSize = view.getPreferredSize$();
    let vpSize = vp.getSize$();
    let extentSize = vp.toViewCoordinates$Dimension(vpSize);
    let viewSize = new Dimension()._Dimension$Dimension(viewPrefSize);
    if (scrollableView != null) {
      if (scrollableView.getScrollableTracksViewportWidth()) {
        viewSize.width_ = vpSize.width_;
      }
      if (scrollableView.getScrollableTracksViewportHeight()) {
        viewSize.height_ = vpSize.height_;
      }
    }
    let viewPosition = vp.getViewPosition();
    if (scrollableView == null || vp.getParent() == null || vp.getParent().getComponentOrientation().isLeftToRight()) {
      if (((viewPosition.x_ + extentSize.width_) | 0) > viewSize.width_) {
        viewPosition.x_ = Math.max(0, (viewSize.width_ - extentSize.width_) | 0);
      }
    } else {
      if (extentSize.width_ > viewSize.width_) {
        viewPosition.x_ = (viewSize.width_ - extentSize.width_) | 0;
      } else {
        viewPosition.x_ = Math.max(0, Math.min((viewSize.width_ - extentSize.width_) | 0, viewPosition.x_));
      }
    }
    if (((viewPosition.y_ + extentSize.height_) | 0) > viewSize.height_) {
      viewPosition.y_ = Math.max(0, (viewSize.height_ - extentSize.height_) | 0);
    }
    if (scrollableView == null) {
      if ((viewPosition.x_ === 0) && (vpSize.width_ > viewPrefSize.width_)) {
        viewSize.width_ = vpSize.width_;
      }
      if ((viewPosition.y_ === 0) && (vpSize.height_ > viewPrefSize.height_)) {
        viewSize.height_ = vpSize.height_;
      }
    }
    vp.setViewPosition(viewPosition);
    vp.setViewSize(viewSize);
  }
  static $clinit() {
    ViewportLayout.SHARED_INSTANCE = new ViewportLayout()._ViewportLayout();
  }
}

$J.define(ViewportLayout, 'javax.swing.ViewportLayout', { kind: 'class', ifaces: ['java.awt.LayoutManager', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_ViewportLayout' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' }, clinit: true, lazy: ['SHARED_INSTANCE'] });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Scrollable = $J.load('javax.swing.Scrollable');
});
