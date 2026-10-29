// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JScrollPane.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ClassCastException, IllegalArgumentException, NullPointerException } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { JScrollBar } from './JScrollBar.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';

let Adjustable, Point, Rectangle, AccessibleContext, AccessibleRelation, JViewport, ScrollPaneConstants, ScrollPaneLayout, ScrollPaneLayout$UIResource, Scrollable, SwingUtilities, UIManager;

/**
 * Provides a scrollable view of a lightweight component.
 * A <code>JScrollPane</code> manages a viewport, optional
 * vertical and horizontal scroll bars, and optional row and
 * column heading viewports.
 * You can find task-oriented documentation of <code>JScrollPane</code> in
 *  <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/scrollpane.html">How to Use Scroll Panes</a>,
 * a section in <em>The Java Tutorial</em>.  Note that
 * <code>JScrollPane</code> does not support heavyweight components.
 *
 * <div style="float:right;text-align:center">
 *   <p><b>Example:</b>
 *   <p><img src="doc-files/JScrollPane-1.gif"
 *       alt="The following text describes this image."
 *       width="256" height="248">
 * </div>
 * The <code>JViewport</code> provides a window,
 * or &quot;viewport&quot; onto a data
 * source -- for example, a text file. That data source is the
 * &quot;scrollable client&quot; (aka data model) displayed by the
 * <code>JViewport</code> view.
 * A <code>JScrollPane</code> basically consists of <code>JScrollBar</code>s,
 * a <code>JViewport</code>, and the wiring between them,
 * as shown in the diagram at right.
 * <p>
 * In addition to the scroll bars and viewport,
 * a <code>JScrollPane</code> can have a
 * column header and a row header. Each of these is a
 * <code>JViewport</code> object that
 * you specify with <code>setRowHeaderView</code>,
 * and <code>setColumnHeaderView</code>.
 * The column header viewport automatically scrolls left and right, tracking
 * the left-right scrolling of the main viewport.
 * (It never scrolls vertically, however.)
 * The row header acts in a similar fashion.
 * <p>
 * Where two scroll bars meet, the row header meets the column header,
 * or a scroll bar meets one of the headers, both components stop short
 * of the corner, leaving a rectangular space which is, by default, empty.
 * These spaces can potentially exist in any number of the four corners.
 * In the previous diagram, the top right space is present and identified
 * by the label "corner component".
 * <p>
 * Any number of these empty spaces can be replaced by using the
 * <code>setCorner</code> method to add a component to a particular corner.
 * (Note: The same component cannot be added to multiple corners.)
 * This is useful if there's
 * some extra decoration or function you'd like to add to the scroll pane.
 * The size of each corner component is entirely determined by the size of the
 * headers and/or scroll bars that surround it.
 * <p>
 * A corner component will only be visible if there is an empty space in that
 * corner for it to exist in. For example, consider a component set into the
 * top right corner of a scroll pane with a column header. If the scroll pane's
 * vertical scrollbar is not present, perhaps because the view component hasn't
 * grown large enough to require it, then the corner component will not be
 * shown (since there is no empty space in that corner created by the meeting
 * of the header and vertical scroll bar). Forcing the scroll bar to always be
 * shown, using
 * <code>setVerticalScrollBarPolicy(VERTICAL_SCROLLBAR_ALWAYS)</code>,
 * will ensure that the space for the corner component always exists.
 * <p>
 * To add a border around the main viewport,
 * you can use <code>setViewportBorder</code>.
 * (Of course, you can also add a border around the whole scroll pane using
 * <code>setBorder</code>.)
 * <p>
 * A common operation to want to do is to set the background color that will
 * be used if the main viewport view is smaller than the viewport, or is
 * not opaque. This can be accomplished by setting the background color
 * of the viewport, via <code>scrollPane.getViewport().setBackground()</code>.
 * The reason for setting the color of the viewport and not the scrollpane
 * is that by default <code>JViewport</code> is opaque
 * which, among other things, means it will completely fill
 * in its background using its background color.  Therefore when
 * <code>JScrollPane</code> draws its background the viewport will
 * usually draw over it.
 * <p>
 * By default <code>JScrollPane</code> uses <code>ScrollPaneLayout</code>
 * to handle the layout of its child Components. <code>ScrollPaneLayout</code>
 * determines the size to make the viewport view in one of two ways:
 * <ol>
 *   <li>If the view implements <code>Scrollable</code>
 *       a combination of <code>getPreferredScrollableViewportSize</code>,
 *       <code>getScrollableTracksViewportWidth</code> and
 *       <code>getScrollableTracksViewportHeight</code>is used, otherwise
 *   <li><code>getPreferredSize</code> is used.
 * </ol>
 * <p>
 * <strong>Warning:</strong> Swing is not thread safe. For more
 * information see <a
 * href="package-summary.html#threading">Swing's Threading
 * Policy</a>.
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
 * @see JScrollBar
 * @see JViewport
 * @see ScrollPaneLayout
 * @see Scrollable
 * @see Component#getPreferredSize
 * @see #setViewportView
 * @see #setRowHeaderView
 * @see #setColumnHeaderView
 * @see #setCorner
 * @see #setViewportBorder
 *
 * @author Hans Muller
 * @since 1.2
 */
export class JScrollPane extends JComponent {
  viewportBorder: Border = null;
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'ScrollPaneUI';
  /**
   * The display policy for the vertical scrollbar.
   * The default is
   * <code>ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED</code>.
   * @see #setVerticalScrollBarPolicy
   */
  verticalScrollBarPolicy: number = 0;
  /**
   * The display policy for the horizontal scrollbar.
   * The default is
   * <code>ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED</code>.
   * @see #setHorizontalScrollBarPolicy
   */
  horizontalScrollBarPolicy: number = 0;
  /**
   * The scrollpane's viewport child.  Default is an empty
   * <code>JViewport</code>.
   * @see #setViewport
   */
  viewport: JViewport = null;
  /**
   * The scrollpane's vertical scrollbar child.
   * Default is a <code>JScrollBar</code>.
   * @see #setVerticalScrollBar
   */
  verticalScrollBar: JScrollBar = null;
  /**
   * The scrollpane's horizontal scrollbar child.
   * Default is a <code>JScrollBar</code>.
   * @see #setHorizontalScrollBar
   */
  horizontalScrollBar: JScrollBar = null;
  /**
   * The row header child.  Default is <code>null</code>.
   * @see #setRowHeader
   */
  rowHeader: JViewport = null;
  /**
   * The column header child.  Default is <code>null</code>.
   * @see #setColumnHeader
   */
  columnHeader: JViewport = null;
  /**
   * The component to display in the lower left corner.
   * Default is <code>null</code>.
   * @see #setCorner
   */
  lowerLeft: Component = null;
  /**
   * The component to display in the lower right corner.
   * Default is <code>null</code>.
   * @see #setCorner
   */
  lowerRight: Component = null;
  /**
   * The component to display in the upper left corner.
   * Default is <code>null</code>.
   * @see #setCorner
   */
  upperLeft: Component = null;
  /**
   * The component to display in the upper right corner.
   * Default is <code>null</code>.
   * @see #setCorner
   */
  upperRight: Component = null;
  wheelScrollState: boolean = false;
  $init_JScrollPane() {
    this.verticalScrollBarPolicy = ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED;
    this.horizontalScrollBarPolicy = ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED;
    this.wheelScrollState = true;
  }
  /**
   * Creates a <code>JScrollPane</code> that displays the view
   * component in a viewport
   * whose view position can be controlled with a pair of scrollbars.
   * The scrollbar policies specify when the scrollbars are displayed,
   * For example, if <code>vsbPolicy</code> is
   * <code>VERTICAL_SCROLLBAR_AS_NEEDED</code>
   * then the vertical scrollbar only appears if the view doesn't fit
   * vertically. The available policy settings are listed at
   * {@link #setVerticalScrollBarPolicy} and
   * {@link #setHorizontalScrollBarPolicy}.
   *
   * @see #setViewportView
   *
   * @param view the component to display in the scrollpanes viewport
   * @param vsbPolicy an integer that specifies the vertical
   *          scrollbar policy
   * @param hsbPolicy an integer that specifies the horizontal
   *          scrollbar policy
   */
  _JScrollPane$Component$int$int(view: Component, vsbPolicy: number, hsbPolicy: number): this {
    this._JComponent();
    this.$init_JScrollPane();
    this.setLayout(new ScrollPaneLayout$UIResource()._ScrollPaneLayout$UIResource());
    this.setVerticalScrollBarPolicy(vsbPolicy);
    this.setHorizontalScrollBarPolicy(hsbPolicy);
    this.setViewport(this.createViewport());
    this.setVerticalScrollBar(this.createVerticalScrollBar());
    this.setHorizontalScrollBar(this.createHorizontalScrollBar());
    if (view != null) {
      this.setViewportView(view);
    }
    this.setUIProperty('opaque', true);
    this.updateUI();
    if (!this.getComponentOrientation().isLeftToRight()) {
      this.viewport.setViewPosition(new Point()._Point$int$int(2147483647, 0));
    }
    return this;
  }
  /**
   * Creates a <code>JScrollPane</code> that displays the
   * contents of the specified
   * component, where both horizontal and vertical scrollbars appear
   * whenever the component's contents are larger than the view.
   *
   * @see #setViewportView
   * @param view the component to display in the scrollpane's viewport
   */
  _JScrollPane$Component(view: Component): this {
    this._JScrollPane$Component$int$int(view, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED);
    return this;
  }
  /**
   * Sets the <code>ScrollPaneUI</code> object that provides the
   * look and feel (L&amp;F) for this component.
   *
   * @param ui the <code>ScrollPaneUI</code> L&amp;F object
   * @see #getUI
   */
  setUI$ScrollPaneUI(ui: ScrollPaneUI): void {
    super.setUI$ComponentUI(ui);
  }
  /**
   * Replaces the current <code>ScrollPaneUI</code> object with a version
   * from the current default look and feel.
   * To be called when the default look and feel changes.
   *
   * @see JComponent#updateUI
   * @see UIManager#getUI
   */
  updateUI(): void {
    this.setUI$ScrollPaneUI(UIManager.getUI(this));
  }
  /**
   * Returns the suffix used to construct the name of the L&amp;F class used to
   * render this component.
   *
   * @return the string "ScrollPaneUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JScrollPane.uiClassID;
  }
  /**
   * Sets the layout manager for this <code>JScrollPane</code>.
   * This method overrides <code>setLayout</code> in
   * <code>java.awt.Container</code> to ensure that only
   * <code>LayoutManager</code>s which
   * are subclasses of <code>ScrollPaneLayout</code> can be used in a
   * <code>JScrollPane</code>. If <code>layout</code> is non-null, this
   * will invoke <code>syncWithScrollPane</code> on it.
   *
   * @param layout the specified layout manager
   * @throws ClassCastException if layout is not a
   *                  <code>ScrollPaneLayout</code>
   * @see java.awt.Container#getLayout
   * @see java.awt.Container#setLayout
   */
  setLayout(layout: LayoutManager): void {
    if (layout instanceof ScrollPaneLayout) {
      super.setLayout(layout);
      (layout).syncWithScrollPane(this);
    } else if (layout == null) {
      super.setLayout(layout);
    } else {
      let s = 'layout of JScrollPane must be a ScrollPaneLayout';
      throw new ClassCastException(s);
    }
  }
  /**
   * Overridden to return true so that any calls to <code>revalidate</code>
   * on any descendants of this <code>JScrollPane</code> will cause the
   * entire tree beginning with this <code>JScrollPane</code> to be
   * validated.
   *
   * @return true
   * @see java.awt.Container#validate
   * @see JComponent#revalidate
   * @see JComponent#isValidateRoot
   * @see java.awt.Container#isValidateRoot
   */
  isValidateRoot$(): boolean {
    return true;
  }
  /**
   * Returns the vertical scroll bar policy value.
   * @return the <code>verticalScrollBarPolicy</code> property
   * @see #setVerticalScrollBarPolicy
   */
  getVerticalScrollBarPolicy(): number {
    return this.verticalScrollBarPolicy;
  }
  /**
   * Determines when the vertical scrollbar appears in the scrollpane.
   * Legal values are:
   * <ul>
   * <li><code>ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED</code>
   * <li><code>ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER</code>
   * <li><code>ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS</code>
   * </ul>
   *
   * @param policy one of the three values listed above
   * @throws IllegalArgumentException if <code>policy</code>
   *                          is not one of the legal values shown above
   * @see #getVerticalScrollBarPolicy
   */
  setVerticalScrollBarPolicy(policy: number): void {
    switch (policy) {
      case ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED:
      case ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER:
      case ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS:
        break;
      default:
        throw new IllegalArgumentException('invalid verticalScrollBarPolicy');
    }
    let old = this.verticalScrollBarPolicy;
    this.verticalScrollBarPolicy = policy;
    this.firePropertyChange$String$int$int('verticalScrollBarPolicy', old, policy);
    this.revalidate();
    this.repaint$();
  }
  /**
   * Returns the horizontal scroll bar policy value.
   * @return the <code>horizontalScrollBarPolicy</code> property
   * @see #setHorizontalScrollBarPolicy
   */
  getHorizontalScrollBarPolicy(): number {
    return this.horizontalScrollBarPolicy;
  }
  /**
   * Determines when the horizontal scrollbar appears in the scrollpane.
   * The options are:<ul>
   * <li><code>ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED</code>
   * <li><code>ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER</code>
   * <li><code>ScrollPaneConstants.HORIZONTAL_SCROLLBAR_ALWAYS</code>
   * </ul>
   *
   * @param policy one of the three values listed above
   * @throws IllegalArgumentException if <code>policy</code>
   *                          is not one of the legal values shown above
   * @see #getHorizontalScrollBarPolicy
   */
  setHorizontalScrollBarPolicy(policy: number): void {
    switch (policy) {
      case ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED:
      case ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER:
      case ScrollPaneConstants.HORIZONTAL_SCROLLBAR_ALWAYS:
        break;
      default:
        throw new IllegalArgumentException('invalid horizontalScrollBarPolicy');
    }
    let old = this.horizontalScrollBarPolicy;
    this.horizontalScrollBarPolicy = policy;
    this.firePropertyChange$String$int$int('horizontalScrollBarPolicy', old, policy);
    this.revalidate();
    this.repaint$();
  }
  /**
   * Returns the <code>Border</code> object that surrounds the viewport.
   *
   * @return the <code>viewportBorder</code> property
   * @see #setViewportBorder
   */
  getViewportBorder(): Border {
    return this.viewportBorder;
  }
  /**
   * Adds a border around the viewport.  Note that the border isn't
   * set on the viewport directly, <code>JViewport</code> doesn't support
   * the <code>JComponent</code> border property.
   * Similarly setting the <code>JScrollPane</code>s
   * viewport doesn't affect the <code>viewportBorder</code> property.
   * <p>
   * The default value of this property is computed by the look
   * and feel implementation.
   *
   * @param viewportBorder the border to be added
   * @see #getViewportBorder
   * @see #setViewport
   */
  setViewportBorder(viewportBorder: Border): void {
    let oldValue = this.viewportBorder;
    this.viewportBorder = viewportBorder;
    this.firePropertyChange$String$Object$Object('viewportBorder', oldValue, viewportBorder);
  }
  /**
   * Returns the bounds of the viewport's border.
   *
   * @return a <code>Rectangle</code> object specifying the viewport border
   */
  getViewportBorderBounds(): Rectangle {
    let borderR = new Rectangle()._Rectangle$Dimension(this.getSize$());
    let insets = this.getInsets$();
    borderR.x_ = insets.left;
    borderR.y_ = insets.top;
    borderR.width_ = (borderR.width_ - (insets.left + insets.right)) | 0;
    borderR.height_ = (borderR.height_ - (insets.top + insets.bottom)) | 0;
    let leftToRight = SwingUtilities.isLeftToRight(this);
    let colHead = this.getColumnHeader();
    if ((colHead != null) && (colHead.isVisible$())) {
      let colHeadHeight = colHead.getHeight();
      borderR.y_ = (borderR.y_ + colHeadHeight) | 0;
      borderR.height_ = (borderR.height_ - colHeadHeight) | 0;
    }
    let rowHead = this.getRowHeader();
    if ((rowHead != null) && (rowHead.isVisible$())) {
      let rowHeadWidth = rowHead.getWidth();
      if (leftToRight) {
        borderR.x_ = (borderR.x_ + rowHeadWidth) | 0;
      }
      borderR.width_ = (borderR.width_ - rowHeadWidth) | 0;
    }
    let vsb = this.getVerticalScrollBar();
    if ((vsb != null) && (vsb.isVisible$())) {
      let vsbWidth = vsb.getWidth();
      if (!leftToRight) {
        borderR.x_ = (borderR.x_ + vsbWidth) | 0;
      }
      borderR.width_ = (borderR.width_ - vsbWidth) | 0;
    }
    let hsb = this.getHorizontalScrollBar();
    if ((hsb != null) && (hsb.isVisible$())) {
      borderR.height_ = (borderR.height_ - hsb.getHeight()) | 0;
    }
    return borderR;
  }
  /**
   * Returns a <code>JScrollPane.ScrollBar</code> by default.
   * Subclasses may override this method to force <code>ScrollPaneUI</code>
   * implementations to use a <code>JScrollBar</code> subclass.
   * Used by <code>ScrollPaneUI</code> implementations to
   * create the horizontal scrollbar.
   *
   * @return a <code>JScrollBar</code> with a horizontal orientation
   * @see JScrollBar
   */
  createHorizontalScrollBar(): JScrollBar {
    return new JScrollPane$ScrollBar().$o(this)._JScrollPane$ScrollBar(Adjustable.HORIZONTAL);
  }
  /**
   * Returns the horizontal scroll bar that controls the viewport's
   * horizontal view position.
   *
   * @return the <code>horizontalScrollBar</code> property
   * @see #setHorizontalScrollBar
   */
  getHorizontalScrollBar(): JScrollBar {
    return this.horizontalScrollBar;
  }
  /**
   * Adds the scrollbar that controls the viewport's horizontal view
   * position to the scrollpane.
   * This is usually unnecessary, as <code>JScrollPane</code> creates
   * horizontal and vertical scrollbars by default.
   *
   * @param horizontalScrollBar the horizontal scrollbar to be added
   * @see #createHorizontalScrollBar
   * @see #getHorizontalScrollBar
   */
  setHorizontalScrollBar(horizontalScrollBar: JScrollBar): void {
    let old = this.getHorizontalScrollBar();
    this.horizontalScrollBar = horizontalScrollBar;
    if (horizontalScrollBar != null) {
      this.add$Component$Object(horizontalScrollBar, ScrollPaneConstants.HORIZONTAL_SCROLLBAR);
    } else if (old != null) {
      this.remove$Component(old);
    }
    this.firePropertyChange$String$Object$Object('horizontalScrollBar', old, horizontalScrollBar);
    this.revalidate();
    this.repaint$();
  }
  /**
   * Returns a <code>JScrollPane.ScrollBar</code> by default.  Subclasses
   * may override this method to force <code>ScrollPaneUI</code>
   * implementations to use a <code>JScrollBar</code> subclass.
   * Used by <code>ScrollPaneUI</code> implementations to create the
   * vertical scrollbar.
   *
   * @return a <code>JScrollBar</code> with a vertical orientation
   * @see JScrollBar
   */
  createVerticalScrollBar(): JScrollBar {
    return new JScrollPane$ScrollBar().$o(this)._JScrollPane$ScrollBar(Adjustable.VERTICAL);
  }
  /**
   * Returns the vertical scroll bar that controls the viewports
   * vertical view position.
   *
   * @return the <code>verticalScrollBar</code> property
   * @see #setVerticalScrollBar
   */
  getVerticalScrollBar(): JScrollBar {
    return this.verticalScrollBar;
  }
  /**
   * Adds the scrollbar that controls the viewports vertical view position
   * to the scrollpane.  This is usually unnecessary,
   * as <code>JScrollPane</code> creates vertical and
   * horizontal scrollbars by default.
   *
   * @param verticalScrollBar the new vertical scrollbar to be added
   * @see #createVerticalScrollBar
   * @see #getVerticalScrollBar
   */
  setVerticalScrollBar(verticalScrollBar: JScrollBar): void {
    let old = this.getVerticalScrollBar();
    this.verticalScrollBar = verticalScrollBar;
    this.add$Component$Object(verticalScrollBar, ScrollPaneConstants.VERTICAL_SCROLLBAR);
    this.firePropertyChange$String$Object$Object('verticalScrollBar', old, verticalScrollBar);
    this.revalidate();
    this.repaint$();
  }
  /**
   * Returns a new <code>JViewport</code> by default.
   * Used to create the
   * viewport (as needed) in <code>setViewportView</code>,
   * <code>setRowHeaderView</code>, and <code>setColumnHeaderView</code>.
   * Subclasses may override this method to return a subclass of
   * <code>JViewport</code>.
   *
   * @return a new <code>JViewport</code>
   */
  createViewport(): JViewport {
    return new JViewport()._JViewport();
  }
  /**
   * Returns the current <code>JViewport</code>.
   *
   * @see #setViewport
   * @return the <code>viewport</code> property
   */
  getViewport(): JViewport {
    return this.viewport;
  }
  /**
   * Removes the old viewport (if there is one); forces the
   * viewPosition of the new viewport to be in the +x,+y quadrant;
   * syncs up the row and column headers (if there are any) with the
   * new viewport; and finally syncs the scrollbars and
   * headers with the new viewport.
   * <p>
   * Most applications will find it more convenient to use
   * <code>setViewportView</code>
   * to add a viewport and a view to the scrollpane.
   *
   * @param viewport the new viewport to be used; if viewport is
   *          <code>null</code>, the old viewport is still removed
   *          and the new viewport is set to <code>null</code>
   * @see #createViewport
   * @see #getViewport
   * @see #setViewportView
   */
  setViewport(viewport: JViewport): void {
    let old = this.getViewport();
    this.viewport = viewport;
    if (viewport != null) {
      this.add$Component$Object(viewport, ScrollPaneConstants.VIEWPORT);
    } else if (old != null) {
      this.remove$Component(old);
    }
    this.firePropertyChange$String$Object$Object('viewport', old, viewport);
    if (this.accessibleContext != null) {
      (this.accessibleContext).resetViewPort();
    }
    this.revalidate();
    this.repaint$();
  }
  /**
   * Creates a viewport if necessary and then sets its view.  Applications
   * that don't provide the view directly to the <code>JScrollPane</code>
   * constructor
   * should use this method to specify the scrollable child that's going
   * to be displayed in the scrollpane. For example:
   * <pre>
   * JScrollPane scrollpane = new JScrollPane();
   * scrollpane.setViewportView(myBigComponentToScroll);
   * </pre>
   * Applications should not add children directly to the scrollpane.
   *
   * @param view the component to add to the viewport
   * @see #setViewport
   * @see JViewport#setView
   */
  setViewportView(view: Component): void {
    if (this.getViewport() == null) {
      this.setViewport(this.createViewport());
    }
    this.getViewport().setView(view);
  }
  /**
   * Returns the row header.
   * @return the <code>rowHeader</code> property
   * @see #setRowHeader
   */
  getRowHeader(): JViewport {
    return this.rowHeader;
  }
  /**
   * Returns the column header.
   * @return the <code>columnHeader</code> property
   * @see #setColumnHeader
   */
  getColumnHeader(): JViewport {
    return this.columnHeader;
  }
  /**
   * Removes the old columnHeader, if it exists; if the new columnHeader
   * isn't <code>null</code>, syncs the x coordinate of its viewPosition
   * with the viewport (if there is one) and then adds it to the scroll pane.
   * <p>
   * Most applications will find it more convenient to use
   * <code>setColumnHeaderView</code>
   * to add a column header component and its viewport to the scroll pane.
   *
   * @param columnHeader  a {@code JViewport} which is the new column header
   * @see #getColumnHeader
   * @see #setColumnHeaderView
   */
  setColumnHeader(columnHeader: JViewport): void {
    let old = this.getColumnHeader();
    this.columnHeader = columnHeader;
    if (columnHeader != null) {
      this.add$Component$Object(columnHeader, ScrollPaneConstants.COLUMN_HEADER);
    } else if (old != null) {
      this.remove$Component(old);
    }
    this.firePropertyChange$String$Object$Object('columnHeader', old, columnHeader);
    this.revalidate();
    this.repaint$();
  }
  /**
   * Creates a column-header viewport if necessary, sets
   * its view, and then adds the column-header viewport
   * to the scrollpane.  For example:
   * <pre>
   * JScrollPane scrollpane = new JScrollPane();
   * scrollpane.setViewportView(myBigComponentToScroll);
   * scrollpane.setColumnHeaderView(myBigComponentsColumnHeader);
   * </pre>
   *
   * @see #setColumnHeader
   * @see JViewport#setView
   *
   * @param view the component to display as the column header
   */
  setColumnHeaderView(view: Component): void {
    if (this.getColumnHeader() == null) {
      this.setColumnHeader(this.createViewport());
    }
    this.getColumnHeader().setView(view);
  }
  /**
   * Returns the component at the specified corner. The
   * <code>key</code> value specifying the corner is one of:
   * <ul>
   * <li>ScrollPaneConstants.LOWER_LEFT_CORNER
   * <li>ScrollPaneConstants.LOWER_RIGHT_CORNER
   * <li>ScrollPaneConstants.UPPER_LEFT_CORNER
   * <li>ScrollPaneConstants.UPPER_RIGHT_CORNER
   * <li>ScrollPaneConstants.LOWER_LEADING_CORNER
   * <li>ScrollPaneConstants.LOWER_TRAILING_CORNER
   * <li>ScrollPaneConstants.UPPER_LEADING_CORNER
   * <li>ScrollPaneConstants.UPPER_TRAILING_CORNER
   * </ul>
   *
   * @param key one of the values as shown above
   * @return the corner component (which may be <code>null</code>)
   *         identified by the given key, or <code>null</code>
   *         if the key is invalid
   * @see #setCorner
   */
  getCorner(key: string): Component {
    let isLeftToRight = this.getComponentOrientation().isLeftToRight();
    if ($J.equals(key, ScrollPaneConstants.LOWER_LEADING_CORNER)) {
      key = isLeftToRight ? ScrollPaneConstants.LOWER_LEFT_CORNER : ScrollPaneConstants.LOWER_RIGHT_CORNER;
    } else if ($J.equals(key, ScrollPaneConstants.LOWER_TRAILING_CORNER)) {
      key = isLeftToRight ? ScrollPaneConstants.LOWER_RIGHT_CORNER : ScrollPaneConstants.LOWER_LEFT_CORNER;
    } else if ($J.equals(key, ScrollPaneConstants.UPPER_LEADING_CORNER)) {
      key = isLeftToRight ? ScrollPaneConstants.UPPER_LEFT_CORNER : ScrollPaneConstants.UPPER_RIGHT_CORNER;
    } else if ($J.equals(key, ScrollPaneConstants.UPPER_TRAILING_CORNER)) {
      key = isLeftToRight ? ScrollPaneConstants.UPPER_RIGHT_CORNER : ScrollPaneConstants.UPPER_LEFT_CORNER;
    }
    if ($J.equals(key, ScrollPaneConstants.LOWER_LEFT_CORNER)) {
      return this.lowerLeft;
    } else if ($J.equals(key, ScrollPaneConstants.LOWER_RIGHT_CORNER)) {
      return this.lowerRight;
    } else if ($J.equals(key, ScrollPaneConstants.UPPER_LEFT_CORNER)) {
      return this.upperLeft;
    } else if ($J.equals(key, ScrollPaneConstants.UPPER_RIGHT_CORNER)) {
      return this.upperRight;
    } else {
      return null;
    }
  }
  /**
   * Adds a child that will appear in one of the scroll panes
   * corners, if there's room.   For example with both scrollbars
   * showing (on the right and bottom edges of the scrollpane)
   * the lower left corner component will be shown in the space
   * between ends of the two scrollbars. Legal values for
   * the <b>key</b> are:
   * <ul>
   * <li>ScrollPaneConstants.LOWER_LEFT_CORNER
   * <li>ScrollPaneConstants.LOWER_RIGHT_CORNER
   * <li>ScrollPaneConstants.UPPER_LEFT_CORNER
   * <li>ScrollPaneConstants.UPPER_RIGHT_CORNER
   * <li>ScrollPaneConstants.LOWER_LEADING_CORNER
   * <li>ScrollPaneConstants.LOWER_TRAILING_CORNER
   * <li>ScrollPaneConstants.UPPER_LEADING_CORNER
   * <li>ScrollPaneConstants.UPPER_TRAILING_CORNER
   * </ul>
   * <p>
   * Although "corner" doesn't match any beans property
   * signature, <code>PropertyChange</code> events are generated with the
   * property name set to the corner key.
   *
   * @param key identifies which corner the component will appear in
   * @param corner one of the following components:
   * <ul>
   * <li>lowerLeft
   * <li>lowerRight
   * <li>upperLeft
   * <li>upperRight
   * </ul>
   * @throws IllegalArgumentException if corner key is invalid
   */
  setCorner(key: string, corner: Component): void {
    let old: Component;
    let isLeftToRight = this.getComponentOrientation().isLeftToRight();
    if ($J.equals(key, ScrollPaneConstants.LOWER_LEADING_CORNER)) {
      key = isLeftToRight ? ScrollPaneConstants.LOWER_LEFT_CORNER : ScrollPaneConstants.LOWER_RIGHT_CORNER;
    } else if ($J.equals(key, ScrollPaneConstants.LOWER_TRAILING_CORNER)) {
      key = isLeftToRight ? ScrollPaneConstants.LOWER_RIGHT_CORNER : ScrollPaneConstants.LOWER_LEFT_CORNER;
    } else if ($J.equals(key, ScrollPaneConstants.UPPER_LEADING_CORNER)) {
      key = isLeftToRight ? ScrollPaneConstants.UPPER_LEFT_CORNER : ScrollPaneConstants.UPPER_RIGHT_CORNER;
    } else if ($J.equals(key, ScrollPaneConstants.UPPER_TRAILING_CORNER)) {
      key = isLeftToRight ? ScrollPaneConstants.UPPER_RIGHT_CORNER : ScrollPaneConstants.UPPER_LEFT_CORNER;
    }
    if ($J.equals(key, ScrollPaneConstants.LOWER_LEFT_CORNER)) {
      old = this.lowerLeft;
      this.lowerLeft = corner;
    } else if ($J.equals(key, ScrollPaneConstants.LOWER_RIGHT_CORNER)) {
      old = this.lowerRight;
      this.lowerRight = corner;
    } else if ($J.equals(key, ScrollPaneConstants.UPPER_LEFT_CORNER)) {
      old = this.upperLeft;
      this.upperLeft = corner;
    } else if ($J.equals(key, ScrollPaneConstants.UPPER_RIGHT_CORNER)) {
      old = this.upperRight;
      this.upperRight = corner;
    } else {
      throw new IllegalArgumentException('invalid corner key');
    }
    if (old != null) {
      this.remove$Component(old);
    }
    if (corner != null) {
      this.add$Component$Object(corner, key);
    }
    this.firePropertyChange$String$Object$Object(key, old, corner);
    this.revalidate();
    this.repaint$();
  }
  /**
   * Sets the orientation for the vertical and horizontal
   * scrollbars as determined by the
   * <code>ComponentOrientation</code> argument.
   *
   * @param  co one of the following values:
   * <ul>
   * <li>java.awt.ComponentOrientation.LEFT_TO_RIGHT
   * <li>java.awt.ComponentOrientation.RIGHT_TO_LEFT
   * <li>java.awt.ComponentOrientation.UNKNOWN
   * </ul>
   * @see java.awt.ComponentOrientation
   */
  setComponentOrientation(co: ComponentOrientation): void {
    super.setComponentOrientation(co);
    if (this.verticalScrollBar != null) {
      this.verticalScrollBar.setComponentOrientation(co);
    }
    if (this.horizontalScrollBar != null) {
      this.horizontalScrollBar.setComponentOrientation(co);
    }
  }
  /**
   * Indicates whether or not scrolling will take place in response to the
   * mouse wheel.  Wheel scrolling is enabled by default.
   *
   * @return true if mouse wheel scrolling is enabled, false otherwise
   * @see #setWheelScrollingEnabled
   * @since 1.4
   */
  isWheelScrollingEnabled(): boolean {
    return this.wheelScrollState;
  }
  /**
   * Returns a string representation of this <code>JScrollPane</code>.
   * This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JScrollPane</code>.
   */
  paramString(): string {
    let viewportBorderString = (this.viewportBorder != null ? this.viewportBorder.toString() : '');
    let viewportString = (this.viewport != null ? this.viewport.toString() : '');
    let verticalScrollBarPolicyString: string;
    if (this.verticalScrollBarPolicy === ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED) {
      verticalScrollBarPolicyString = 'VERTICAL_SCROLLBAR_AS_NEEDED';
    } else if (this.verticalScrollBarPolicy === ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER) {
      verticalScrollBarPolicyString = 'VERTICAL_SCROLLBAR_NEVER';
    } else if (this.verticalScrollBarPolicy === ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS) {
      verticalScrollBarPolicyString = 'VERTICAL_SCROLLBAR_ALWAYS';
    } else {
      verticalScrollBarPolicyString = '';
    }
    let horizontalScrollBarPolicyString: string;
    if (this.horizontalScrollBarPolicy === ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED) {
      horizontalScrollBarPolicyString = 'HORIZONTAL_SCROLLBAR_AS_NEEDED';
    } else if (this.horizontalScrollBarPolicy === ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER) {
      horizontalScrollBarPolicyString = 'HORIZONTAL_SCROLLBAR_NEVER';
    } else if (this.horizontalScrollBarPolicy === ScrollPaneConstants.HORIZONTAL_SCROLLBAR_ALWAYS) {
      horizontalScrollBarPolicyString = 'HORIZONTAL_SCROLLBAR_ALWAYS';
    } else {
      horizontalScrollBarPolicyString = '';
    }
    let horizontalScrollBarString = (this.horizontalScrollBar != null ? this.horizontalScrollBar.toString() : '');
    let verticalScrollBarString = (this.verticalScrollBar != null ? this.verticalScrollBar.toString() : '');
    let columnHeaderString = (this.columnHeader != null ? this.columnHeader.toString() : '');
    let rowHeaderString = (this.rowHeader != null ? this.rowHeader.toString() : '');
    let lowerLeftString = (this.lowerLeft != null ? this.lowerLeft.toString() : '');
    let lowerRightString = (this.lowerRight != null ? this.lowerRight.toString() : '');
    let upperLeftString = (this.upperLeft != null ? this.upperLeft.toString() : '');
    let upperRightString = (this.upperRight != null ? this.upperRight.toString() : '');
    return super.paramString() + ',columnHeader=' + columnHeaderString + ',horizontalScrollBar=' + horizontalScrollBarString + ',horizontalScrollBarPolicy=' + horizontalScrollBarPolicyString + ',lowerLeft=' + lowerLeftString + ',lowerRight=' + lowerRightString + ',rowHeader=' + rowHeaderString + ',upperLeft=' + upperLeftString + ',upperRight=' + upperRightString + ',verticalScrollBar=' + verticalScrollBarString + ',verticalScrollBarPolicy=' + verticalScrollBarPolicyString + ',viewport=' + viewportString + ',viewportBorder=' + viewportBorderString;
  }
  /**
   * Gets the AccessibleContext associated with this JScrollPane.
   * For scroll panes, the AccessibleContext takes the form of an
   * AccessibleJScrollPane.
   * A new AccessibleJScrollPane instance is created if necessary.
   *
   * @return an AccessibleJScrollPane that serves as the
   *         AccessibleContext of this JScrollPane
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JScrollPane$AccessibleJScrollPane().$o(this)._JScrollPane$AccessibleJScrollPane();
    }
    return this.accessibleContext;
  }
}

/**
 * By default <code>JScrollPane</code> creates scrollbars
 * that are instances
 * of this class.  <code>Scrollbar</code> overrides the
 * <code>getUnitIncrement</code> and <code>getBlockIncrement</code>
 * methods so that, if the viewport's view is a <code>Scrollable</code>,
 * the view is asked to compute these values. Unless
 * the unit/block increment have been explicitly set.
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
 * @see Scrollable
 * @see JScrollPane#createVerticalScrollBar
 * @see JScrollPane#createHorizontalScrollBar
 */
export class JScrollPane$ScrollBar extends JScrollBar {
  /**
   * Set to true when the unit increment has been explicitly set.
   * If this is false the viewport's view is obtained and if it
   * is an instance of <code>Scrollable</code> the unit increment
   * from it is used.
   */
  unitIncrementSet: boolean = false;
  /**
   * Set to true when the block increment has been explicitly set.
   * If this is false the viewport's view is obtained and if it
   * is an instance of <code>Scrollable</code> the block increment
   * from it is used.
   */
  blockIncrementSet: boolean = false;
  /**
   * Creates a scrollbar with the specified orientation.
   * The options are:
   * <ul>
   * <li><code>ScrollPaneConstants.VERTICAL</code>
   * <li><code>ScrollPaneConstants.HORIZONTAL</code>
   * </ul>
   *
   * @param orientation  an integer specifying one of the legal
   *      orientation values shown above
   * @since 1.4
   */
  _JScrollPane$ScrollBar(orientation: number): this {
    this._JScrollBar$int(orientation);
    this.putClientProperty('JScrollBar.fastWheelScrolling', true);
    return this;
  }
  /**
   * Messages super to set the value, and resets the
   * <code>unitIncrementSet</code> instance variable to true.
   *
   * @param unitIncrement the new unit increment value, in pixels
   */
  setUnitIncrement(unitIncrement: number): void {
    this.unitIncrementSet = true;
    this.putClientProperty('JScrollBar.fastWheelScrolling', null);
    super.setUnitIncrement(unitIncrement);
  }
  /**
   * Computes the unit increment for scrolling if the viewport's
   * view is a <code>Scrollable</code> object.
   * Otherwise return <code>super.getUnitIncrement</code>.
   *
   * @param direction less than zero to scroll up/left,
   *      greater than zero for down/right
   * @return an integer, in pixels, containing the unit increment
   * @see Scrollable#getScrollableUnitIncrement
   */
  getUnitIncrement$int(direction: number): number {
    let vp = this.$outer.getViewport();
    if (!this.unitIncrementSet && (vp != null) && ($J.isa(vp.getView(), Scrollable))) {
      let view = (vp.getView());
      let vr = vp.getViewRect();
      return view.getScrollableUnitIncrement(vr, this.getOrientation(), direction);
    } else {
      return super.getUnitIncrement$int(direction);
    }
  }
  /**
   * Computes the block increment for scrolling if the viewport's
   * view is a <code>Scrollable</code> object.  Otherwise
   * the <code>blockIncrement</code> equals the viewport's width
   * or height.  If there's no viewport return
   * <code>super.getBlockIncrement</code>.
   *
   * @param direction less than zero to scroll up/left,
   *      greater than zero for down/right
   * @return an integer, in pixels, containing the block increment
   * @see Scrollable#getScrollableBlockIncrement
   */
  getBlockIncrement$int(direction: number): number {
    let vp = this.$outer.getViewport();
    if (this.blockIncrementSet || vp == null) {
      return super.getBlockIncrement$int(direction);
    } else if ($J.isa(vp.getView(), Scrollable)) {
      let view = (vp.getView());
      let vr = vp.getViewRect();
      return view.getScrollableBlockIncrement(vr, this.getOrientation(), direction);
    } else if (this.getOrientation() === Adjustable.VERTICAL) {
      return vp.getExtentSize().height_;
    } else {
      return vp.getExtentSize().width_;
    }
  }
}

/**
 * This class implements accessibility support for the
 * <code>JScrollPane</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to scroll pane user-interface
 * elements.
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
export class JScrollPane$AccessibleJScrollPane extends JComponent$AccessibleJComponent {
  /**
   * this {@code JScrollPane}'s current {@code JViewport}
   */
  viewPort: JViewport = null;
  /**
   * AccessibleJScrollPane constructor
   */
  _JScrollPane$AccessibleJScrollPane(): this {
    this._JComponent$AccessibleJComponent();
    this.viewPort = null;
    this.resetViewPort();
    let scrollBar = this.$outer.getHorizontalScrollBar();
    if (scrollBar != null) {
      this.setScrollBarRelations(scrollBar);
    }
    scrollBar = this.$outer.getVerticalScrollBar();
    if (scrollBar != null) {
      this.setScrollBarRelations(scrollBar);
    }
    return this;
  }
  /**
   * Resets the viewport ChangeListener and PropertyChangeListener
   */
  resetViewPort(): void {
    if (this.viewPort != null) {
      this.viewPort.removeChangeListener($J.fn(this, 'stateChanged'));
      this.viewPort.removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
    }
    this.viewPort = this.$outer.getViewport();
    if (this.viewPort != null) {
      this.viewPort.addChangeListener($J.fn(this, 'stateChanged'));
      this.viewPort.addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
    }
  }
  /**
   * Invoked when the target of the listener has changed its state.
   *
   * @param e  a <code>ChangeEvent</code> object. Must not be null.
   *
   * @throws NullPointerException if the parameter is null.
   */
  stateChanged(e: ChangeEvent): void {
    if (e == null) {
      throw new NullPointerException();
    }
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, false, true);
  }
  /**
   * This method gets called when a bound property is changed.
   * @param e A <code>PropertyChangeEvent</code> object describing
   * the event source and the property that has changed. Must not be null.
   *
   * @throws NullPointerException if the parameter is null.
   * @since 1.5
   */
  propertyChange(e: PropertyChangeEvent): void {
    let propertyName = e.getPropertyName();
    if (propertyName === 'horizontalScrollBar' || propertyName === 'verticalScrollBar') {
      if (e.getNewValue() instanceof JScrollBar) {
        this.setScrollBarRelations(e.getNewValue());
      }
    }
  }
  setScrollBarRelations(scrollBar: JScrollBar): void {
    let controlledBy = new AccessibleRelation()._AccessibleRelation$String$Object(AccessibleRelation.CONTROLLED_BY, scrollBar);
    let controllerFor = new AccessibleRelation()._AccessibleRelation$String$Object(AccessibleRelation.CONTROLLER_FOR, this.$outer);
    let ac = scrollBar.getAccessibleContext();
    ac.getAccessibleRelationSet().add(controllerFor);
    this.getAccessibleRelationSet().add(controlledBy);
  }
}

$J.define(JScrollPane, 'javax.swing.JScrollPane', { kind: 'class', ifaces: ['javax.swing.ScrollPaneConstants', 'javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { '': '_JScrollPane$', 'int,int': '_JScrollPane$int$int', 'java.awt.Component': '_JScrollPane$Component', 'java.awt.Component,int,int': '_JScrollPane$Component$int$int' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JScrollPane', 'isValidateRoot()': 'isValidateRoot$', 'setUI(javax.swing.plaf.ScrollPaneUI)': 'setUI$ScrollPaneUI' } });
$J.define(JScrollPane$ScrollBar, 'javax.swing.JScrollPane$ScrollBar', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.JScrollBar', ctors: { 'int': '_JScrollPane$ScrollBar' }, meths: { 'getBlockIncrement(int)': 'getBlockIncrement$int', 'getUnitIncrement(int)': 'getUnitIncrement$int' }, inner: true });
$J.define(JScrollPane$AccessibleJScrollPane, 'javax.swing.JScrollPane$AccessibleJScrollPane', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener', 'java.beans.PropertyChangeListener'], sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JScrollPane$AccessibleJScrollPane' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  Adjustable = $J.load('java.awt.Adjustable');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  AccessibleContext = $J.load('javax.accessibility.AccessibleContext');
  AccessibleRelation = $J.load('javax.accessibility.AccessibleRelation');
  JViewport = $J.load('javax.swing.JViewport');
  ScrollPaneConstants = $J.load('javax.swing.ScrollPaneConstants');
  ScrollPaneLayout = $J.load('javax.swing.ScrollPaneLayout');
  ScrollPaneLayout$UIResource = $J.load('javax.swing.ScrollPaneLayout$UIResource');
  Scrollable = $J.load('javax.swing.Scrollable');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
});
