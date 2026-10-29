// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalRootPaneUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2020, Oracle and/or its affiliates. All rights reserved.
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
import { BasicRootPaneUI } from '../basic/BasicRootPaneUI.ts';

let Cursor, Dialog, Dimension, Frame, Rectangle, Window, InputEvent, JLayeredPane, JRootPane, LookAndFeel, SwingUtilities, MetalTitlePane;

/**
 * Provides the metal look and feel implementation of <code>RootPaneUI</code>.
 * <p>
 * <code>MetalRootPaneUI</code> provides support for the
 * <code>windowDecorationStyle</code> property of <code>JRootPane</code>.
 * <code>MetalRootPaneUI</code> does this by way of installing a custom
 * <code>LayoutManager</code>, a private <code>Component</code> to render
 * the appropriate widgets, and a private <code>Border</code>. The
 * <code>LayoutManager</code> is always installed, regardless of the value of
 * the <code>windowDecorationStyle</code> property, but the
 * <code>Border</code> and <code>Component</code> are only installed/added if
 * the <code>windowDecorationStyle</code> is other than
 * <code>JRootPane.NONE</code>.
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
 * @author Terry Kellerman
 * @since 1.4
 */
export class MetalRootPaneUI extends BasicRootPaneUI {
  /**
   * Keys to lookup borders in defaults table.
   */
  static borderKeys: string[] = null;
  /**
   * The amount of space (in pixels) that the cursor is changed on.
   */
  static readonly CORNER_DRAG_WIDTH: number = 16;
  /**
   * Region from edges that dragging is active from.
   */
  static readonly BORDER_DRAG_THICKNESS: number = 5;
  /**
   * Window the <code>JRootPane</code> is in.
   */
  window: Window = null;
  /**
   * <code>JComponent</code> providing window decorations. This will be
   * null if not providing window decorations.
   */
  titlePane: JComponent = null;
  /**
   * <code>MouseInputListener</code> that is added to the parent
   * <code>Window</code> the <code>JRootPane</code> is contained in.
   */
  mouseInputListener: MouseInputListener = null;
  /**
   * The <code>LayoutManager</code> that is set on the
   * <code>JRootPane</code>.
   */
  layoutManager: LayoutManager = null;
  /**
   * <code>LayoutManager</code> of the <code>JRootPane</code> before we
   * replaced it.
   */
  savedOldLayout: LayoutManager = null;
  /**
   * <code>JRootPane</code> providing the look and feel for.
   */
  root: JRootPane = null;
  /**
   * <code>Cursor</code> used to track the cursor set by the user.
   * This is initially <code>Cursor.DEFAULT_CURSOR</code>.
   */
  lastCursor: Cursor = null;
  /**
   * Maps from positions to cursor type. Refer to calculateCorner and
   * calculatePosition for details of this.
   */
  static cursorMapping: number[] = null;
  /**
   * Constructs a {@code MetalRootPaneUI}.
   */
  _MetalRootPaneUI(): this {
    this._BasicRootPaneUI();
    this.lastCursor = Cursor.getPredefinedCursor(Cursor.DEFAULT_CURSOR);
    return this;
  }
  /**
   * Creates a UI for a <code>JRootPane</code>.
   *
   * @param c the JRootPane the RootPaneUI will be created for
   * @return the RootPaneUI implementation for the passed in JRootPane
   */
  static createUI(c: JComponent): ComponentUI {
    return new MetalRootPaneUI()._MetalRootPaneUI();
  }
  /**
   * Invokes supers implementation of <code>installUI</code> to install
   * the necessary state onto the passed in <code>JRootPane</code>
   * to render the metal look and feel implementation of
   * <code>RootPaneUI</code>. If
   * the <code>windowDecorationStyle</code> property of the
   * <code>JRootPane</code> is other than <code>JRootPane.NONE</code>,
   * this will add a custom <code>Component</code> to render the widgets to
   * <code>JRootPane</code>, as well as installing a custom
   * <code>Border</code> and <code>LayoutManager</code> on the
   * <code>JRootPane</code>.
   *
   * @param c the JRootPane to install state onto
   */
  installUI(c: JComponent): void {
    super.installUI(c);
    this.root = c;
    let style = this.root.getWindowDecorationStyle();
    if (style !== JRootPane.NONE) {
      this.installClientDecorations(this.root);
    }
  }
  /**
   * Invokes supers implementation to uninstall any of its state. This will
   * also reset the <code>LayoutManager</code> of the <code>JRootPane</code>.
   * If a <code>Component</code> has been added to the <code>JRootPane</code>
   * to render the window decoration style, this method will remove it.
   * Similarly, this will revert the Border and LayoutManager of the
   * <code>JRootPane</code> to what it was before <code>installUI</code>
   * was invoked.
   *
   * @param c the JRootPane to uninstall state from
   */
  uninstallUI(c: JComponent): void {
    super.uninstallUI(c);
    this.uninstallClientDecorations(this.root);
    this.layoutManager = null;
    this.mouseInputListener = null;
    this.root = null;
  }
  /**
   * Installs the appropriate <code>Border</code> onto the
   * <code>JRootPane</code>.
   */
  installBorder(root: JRootPane): void {
    let style = root.getWindowDecorationStyle();
    if (style === JRootPane.NONE) {
      LookAndFeel.uninstallBorder(root);
    } else {
      LookAndFeel.installBorder(root, MetalRootPaneUI.borderKeys[style]);
    }
  }
  /**
   * Removes any border that may have been installed.
   */
  uninstallBorder(root: JRootPane): void {
    LookAndFeel.uninstallBorder(root);
  }
  /**
   * Installs the necessary Listeners on the parent <code>Window</code>,
   * if there is one.
   * <p>
   * This takes the parent so that cleanup can be done from
   * <code>removeNotify</code>, at which point the parent hasn't been
   * reset yet.
   *
   * @param parent The parent of the JRootPane
   */
  installWindowListeners(root: JRootPane, parent: Component): void {
    if (parent instanceof Window) {
      this.window = parent;
    } else {
      this.window = SwingUtilities.getWindowAncestor(parent);
    }
    if (this.window != null) {
      if (this.mouseInputListener == null) {
        this.mouseInputListener = this.createWindowMouseInputListener(root);
      }
      this.window.addMouseListener(this.mouseInputListener);
      this.window.addMouseMotionListener(this.mouseInputListener);
    }
  }
  /**
   * Uninstalls the necessary Listeners on the <code>Window</code> the
   * Listeners were last installed on.
   */
  uninstallWindowListeners(root: JRootPane): void {
    if (this.window != null) {
      this.window.removeMouseListener(this.mouseInputListener);
      this.window.removeMouseMotionListener(this.mouseInputListener);
    }
  }
  /**
   * Installs the appropriate LayoutManager on the <code>JRootPane</code>
   * to render the window decorations.
   */
  installLayout(root: JRootPane): void {
    if (this.layoutManager == null) {
      this.layoutManager = this.createLayoutManager();
    }
    this.savedOldLayout = root.getLayout();
    root.setLayout(this.layoutManager);
  }
  /**
   * Uninstalls the previously installed <code>LayoutManager</code>.
   */
  uninstallLayout(root: JRootPane): void {
    if (this.savedOldLayout != null) {
      root.setLayout(this.savedOldLayout);
      this.savedOldLayout = null;
    }
  }
  /**
   * Installs the necessary state onto the JRootPane to render client
   * decorations. This is ONLY invoked if the <code>JRootPane</code>
   * has a decoration style other than <code>JRootPane.NONE</code>.
   */
  installClientDecorations(root: JRootPane): void {
    this.installBorder(root);
    let titlePane = this.createTitlePane(root);
    this.setTitlePane(root, titlePane);
    this.installWindowListeners(root, root.getParent());
    this.installLayout(root);
    if (this.window != null) {
      root.revalidate();
      root.repaint$();
    }
  }
  /**
   * Uninstalls any state that <code>installClientDecorations</code> has
   * installed.
   * <p>
   * NOTE: This may be called if you haven't installed client decorations
   * yet (ie before <code>installClientDecorations</code> has been invoked).
   */
  uninstallClientDecorations(root: JRootPane): void {
    this.uninstallBorder(root);
    this.uninstallWindowListeners(root);
    this.setTitlePane(root, null);
    this.uninstallLayout(root);
    let style = root.getWindowDecorationStyle();
    if (style === JRootPane.NONE) {
      root.repaint$();
      root.revalidate();
    }
    if (this.window != null) {
      this.window.setCursor$Cursor(Cursor.getPredefinedCursor(Cursor.DEFAULT_CURSOR));
    }
    this.window = null;
  }
  /**
   * Returns the <code>JComponent</code> to render the window decoration
   * style.
   */
  createTitlePane(root: JRootPane): JComponent {
    return new MetalTitlePane()._MetalTitlePane(root, this);
  }
  /**
   * Returns a <code>MouseListener</code> that will be added to the
   * <code>Window</code> containing the <code>JRootPane</code>.
   */
  createWindowMouseInputListener(root: JRootPane): MouseInputListener {
    return new MetalRootPaneUI$MouseInputHandler().$o(this)._MetalRootPaneUI$MouseInputHandler();
  }
  /**
   * Returns a <code>LayoutManager</code> that will be set on the
   * <code>JRootPane</code>.
   */
  createLayoutManager(): LayoutManager {
    return new MetalRootPaneUI$MetalRootLayout()._MetalRootPaneUI$MetalRootLayout();
  }
  /**
   * Sets the window title pane -- the JComponent used to provide a plaf a
   * way to override the native operating system's window title pane with
   * one whose look and feel are controlled by the plaf.  The plaf creates
   * and sets this value; the default is null, implying a native operating
   * system window title pane.
   *
   * @param titlePane the <code>JComponent</code> to use for the window title pane.
   */
  setTitlePane(root: JRootPane, titlePane: JComponent): void {
    let layeredPane = root.getLayeredPane();
    let oldTitlePane = this.getTitlePane();
    if (oldTitlePane != null) {
      oldTitlePane.setVisible(false);
      layeredPane.remove$Component(oldTitlePane);
    }
    if (titlePane != null) {
      layeredPane.add$Component$Object(titlePane, JLayeredPane.FRAME_CONTENT_LAYER);
      titlePane.setVisible(true);
    }
    this.titlePane = titlePane;
  }
  /**
   * Returns the <code>JComponent</code> rendering the title pane. If this
   * returns null, it implies there is no need to render window decorations.
   *
   * @return the current window title pane, or null
   * @see #setTitlePane
   */
  getTitlePane(): JComponent {
    return this.titlePane;
  }
  /**
   * Returns the <code>JRootPane</code> we're providing the look and
   * feel for.
   */
  getRootPane(): JRootPane {
    return this.root;
  }
  /**
   * Invoked when a property changes. <code>MetalRootPaneUI</code> is
   * primarily interested in events originating from the
   * <code>JRootPane</code> it has been installed on identifying the
   * property <code>windowDecorationStyle</code>. If the
   * <code>windowDecorationStyle</code> has changed to a value other
   * than <code>JRootPane.NONE</code>, this will add a <code>Component</code>
   * to the <code>JRootPane</code> to render the window decorations, as well
   * as installing a <code>Border</code> on the <code>JRootPane</code>.
   * On the other hand, if the <code>windowDecorationStyle</code> has
   * changed to <code>JRootPane.NONE</code>, this will remove the
   * <code>Component</code> that has been added to the <code>JRootPane</code>
   * as well resetting the Border to what it was before
   * <code>installUI</code> was invoked.
   *
   * @param e A PropertyChangeEvent object describing the event source
   *          and the property that has changed.
   */
  propertyChange(e: PropertyChangeEvent): void {
    super.propertyChange(e);
    let propertyName = e.getPropertyName();
    if (propertyName == null) {
      return;
    }
    if ($J.equals(propertyName, 'windowDecorationStyle')) {
      let root = e.getSource();
      let style = root.getWindowDecorationStyle();
      this.uninstallClientDecorations(root);
      if (style !== JRootPane.NONE) {
        this.installClientDecorations(root);
      }
    } else if ($J.equals(propertyName, 'ancestor')) {
      this.uninstallWindowListeners(this.root);
      if ((e.getSource()).getWindowDecorationStyle() !== JRootPane.NONE) {
        this.installWindowListeners(this.root, this.root.getParent());
      }
    }
    return;
  }
  static $clinit() {
    MetalRootPaneUI.borderKeys = [null, 'RootPane.frameBorder', 'RootPane.plainDialogBorder', 'RootPane.informationDialogBorder', 'RootPane.errorDialogBorder', 'RootPane.colorChooserDialogBorder', 'RootPane.fileChooserDialogBorder', 'RootPane.questionDialogBorder', 'RootPane.warningDialogBorder'];
    MetalRootPaneUI.cursorMapping = [Cursor.NW_RESIZE_CURSOR, Cursor.NW_RESIZE_CURSOR, Cursor.N_RESIZE_CURSOR, Cursor.NE_RESIZE_CURSOR, Cursor.NE_RESIZE_CURSOR, Cursor.NW_RESIZE_CURSOR, 0, 0, 0, Cursor.NE_RESIZE_CURSOR, Cursor.W_RESIZE_CURSOR, 0, 0, 0, Cursor.E_RESIZE_CURSOR, Cursor.SW_RESIZE_CURSOR, 0, 0, 0, Cursor.SE_RESIZE_CURSOR, Cursor.SW_RESIZE_CURSOR, Cursor.SW_RESIZE_CURSOR, Cursor.S_RESIZE_CURSOR, Cursor.SE_RESIZE_CURSOR, Cursor.SE_RESIZE_CURSOR];
  }
}

/**
 * A custom layout manager that is responsible for the layout of
 * layeredPane, glassPane, menuBar and titlePane, if one has been
 * installed.
 */
export class MetalRootPaneUI$MetalRootLayout extends JObject {
  _MetalRootPaneUI$MetalRootLayout(): this {
    return this;
  }
  /**
   * Returns the amount of space the layout would like to have.
   *
   * @param parent the Container for which this layout manager is being used
   * @return a Dimension object containing the layout's preferred size
   */
  preferredLayoutSize(parent: Container): Dimension {
    let cpd: Dimension;
    let mbd: Dimension;
    let tpd: Dimension;
    let cpWidth = 0;
    let cpHeight = 0;
    let mbWidth = 0;
    let mbHeight = 0;
    let tpWidth = 0;
    let tpHeight = 0;
    let i = parent.getInsets$();
    let root = parent;
    if (root.getContentPane() != null) {
      cpd = root.getContentPane().getPreferredSize$();
    } else {
      cpd = root.getSize$();
    }
    if (cpd != null) {
      cpWidth = cpd.width_;
      cpHeight = cpd.height_;
    }
    if (root.getJMenuBar() != null) {
      mbd = root.getJMenuBar().getPreferredSize$();
      if (mbd != null) {
        mbWidth = mbd.width_;
        mbHeight = mbd.height_;
      }
    }
    if (root.getWindowDecorationStyle() !== JRootPane.NONE && (root.getUI() instanceof MetalRootPaneUI)) {
      let titlePane = (root.getUI()).getTitlePane();
      if (titlePane != null) {
        tpd = titlePane.getPreferredSize$();
        if (tpd != null) {
          tpWidth = tpd.width_;
          tpHeight = tpd.height_;
        }
      }
    }
    return new Dimension()._Dimension$int$int((Math.max(Math.max(cpWidth, mbWidth), tpWidth) + i.left + i.right) | 0, (cpHeight + mbHeight + tpHeight + i.top + i.bottom) | 0);
  }
  /**
   * Returns the minimum amount of space the layout needs.
   *
   * @param parent the Container for which this layout manager is being used
   * @return a Dimension object containing the layout's minimum size
   */
  minimumLayoutSize(parent: Container): Dimension {
    let cpd: Dimension;
    let mbd: Dimension;
    let tpd: Dimension;
    let cpWidth = 0;
    let cpHeight = 0;
    let mbWidth = 0;
    let mbHeight = 0;
    let tpWidth = 0;
    let tpHeight = 0;
    let i = parent.getInsets$();
    let root = parent;
    if (root.getContentPane() != null) {
      cpd = root.getContentPane().getMinimumSize$();
    } else {
      cpd = root.getSize$();
    }
    if (cpd != null) {
      cpWidth = cpd.width_;
      cpHeight = cpd.height_;
    }
    if (root.getJMenuBar() != null) {
      mbd = root.getJMenuBar().getMinimumSize$();
      if (mbd != null) {
        mbWidth = mbd.width_;
        mbHeight = mbd.height_;
      }
    }
    if (root.getWindowDecorationStyle() !== JRootPane.NONE && (root.getUI() instanceof MetalRootPaneUI)) {
      let titlePane = (root.getUI()).getTitlePane();
      if (titlePane != null) {
        tpd = titlePane.getMinimumSize$();
        if (tpd != null) {
          tpWidth = tpd.width_;
          tpHeight = tpd.height_;
        }
      }
    }
    return new Dimension()._Dimension$int$int((Math.max(Math.max(cpWidth, mbWidth), tpWidth) + i.left + i.right) | 0, (cpHeight + mbHeight + tpHeight + i.top + i.bottom) | 0);
  }
  /**
   * Returns the maximum amount of space the layout can use.
   *
   * @param target the Container for which this layout manager is being used
   * @return a Dimension object containing the layout's maximum size
   */
  maximumLayoutSize(target: Container): Dimension {
    let cpd: Dimension;
    let mbd: Dimension;
    let tpd: Dimension;
    let cpWidth = 2147483647;
    let cpHeight = 2147483647;
    let mbWidth = 2147483647;
    let mbHeight = 2147483647;
    let tpWidth = 2147483647;
    let tpHeight = 2147483647;
    let i = target.getInsets$();
    let root = target;
    if (root.getContentPane() != null) {
      cpd = root.getContentPane().getMaximumSize();
      if (cpd != null) {
        cpWidth = cpd.width_;
        cpHeight = cpd.height_;
      }
    }
    if (root.getJMenuBar() != null) {
      mbd = root.getJMenuBar().getMaximumSize();
      if (mbd != null) {
        mbWidth = mbd.width_;
        mbHeight = mbd.height_;
      }
    }
    if (root.getWindowDecorationStyle() !== JRootPane.NONE && (root.getUI() instanceof MetalRootPaneUI)) {
      let titlePane = (root.getUI()).getTitlePane();
      if (titlePane != null) {
        tpd = titlePane.getMaximumSize();
        if (tpd != null) {
          tpWidth = tpd.width_;
          tpHeight = tpd.height_;
        }
      }
    }
    let maxHeight = Math.max(Math.max(cpHeight, mbHeight), tpHeight);
    if (maxHeight !== 2147483647) {
      maxHeight = (cpHeight + mbHeight + tpHeight + i.top + i.bottom) | 0;
    }
    let maxWidth = Math.max(Math.max(cpWidth, mbWidth), tpWidth);
    if (maxWidth !== 2147483647) {
      maxWidth = (maxWidth + (i.left + i.right)) | 0;
    }
    return new Dimension()._Dimension$int$int(maxWidth, maxHeight);
  }
  /**
   * Instructs the layout manager to perform the layout for the specified
   * container.
   *
   * @param parent the Container for which this layout manager is being used
   */
  layoutContainer$Container(parent: Container): void {
    let root = parent;
    let b = root.getBounds$();
    let i = root.getInsets$();
    let nextY = 0;
    let w = (b.width_ - i.right - i.left) | 0;
    let h = (b.height_ - i.top - i.bottom) | 0;
    if (root.getLayeredPane() != null) {
      root.getLayeredPane().setBounds$int$int$int$int(i.left, i.top, w, h);
    }
    if (root.getGlassPane() != null) {
      root.getGlassPane().setBounds$int$int$int$int(i.left, i.top, w, h);
    }
    if (root.getWindowDecorationStyle() !== JRootPane.NONE && (root.getUI() instanceof MetalRootPaneUI)) {
      let titlePane = (root.getUI()).getTitlePane();
      if (titlePane != null) {
        let tpd = titlePane.getPreferredSize$();
        if (tpd != null) {
          let tpHeight = tpd.height_;
          titlePane.setBounds$int$int$int$int(0, 0, w, tpHeight);
          nextY = (nextY + tpHeight) | 0;
        }
      }
    }
    if (root.getJMenuBar() != null) {
      let mbd = root.getJMenuBar().getPreferredSize$();
      root.getJMenuBar().setBounds$int$int$int$int(0, nextY, w, mbd.height_);
      nextY = (nextY + mbd.height_) | 0;
    }
    if (root.getContentPane() != null) {
      let cpd = root.getContentPane().getPreferredSize$();
      root.getContentPane().setBounds$int$int$int$int(0, nextY, w, h < nextY ? 0 : (h - nextY) | 0);
    }
  }
  addLayoutComponent$String$Component(name: string, comp: Component): void {
  }
  removeLayoutComponent(comp: Component): void {
  }
  addLayoutComponent$Component$Object(comp: Component, constraints: any): void {
  }
  getLayoutAlignmentX(target: Container): number {
    return 0;
  }
  getLayoutAlignmentY(target: Container): number {
    return 0;
  }
  invalidateLayout(target: Container): void {
  }
}

/**
 * MouseInputHandler is responsible for handling resize/moving of
 * the Window. It sets the cursor directly on the Window when then
 * mouse moves over a hot spot.
 */
export class MetalRootPaneUI$MouseInputHandler extends JObject {
  /**
   * Set to true if the drag operation is moving the window.
   */
  isMovingWindow: boolean = false;
  /**
   * Used to determine the corner the resize is occurring from.
   */
  dragCursor: number = 0;
  /**
   * X location the mouse went down on for a drag operation.
   */
  dragOffsetX: number = 0;
  /**
   * Y location the mouse went down on for a drag operation.
   */
  dragOffsetY: number = 0;
  /**
   * Width of the window when the drag started.
   */
  dragWidth: number = 0;
  /**
   * Height of the window when the drag started.
   */
  dragHeight: number = 0;
  _MetalRootPaneUI$MouseInputHandler(): this {
    return this;
  }
  mousePressed(ev: MouseEvent): void {
    let rootPane = this.$outer.getRootPane();
    if (rootPane.getWindowDecorationStyle() === JRootPane.NONE) {
      return;
    }
    let dragWindowOffset = ev.getPoint();
    let w = ev.getSource();
    if (w != null) {
      w.toFront();
    }
    let convertedDragWindowOffset = SwingUtilities.convertPoint$Component$Point$Component(w, dragWindowOffset, this.$outer.getTitlePane());
    let f = null;
    let d = null;
    if (w instanceof Frame) {
      f = w;
    } else if (w instanceof Dialog) {
      d = w;
    }
    let frameState = (f != null) ? f.getExtendedState() : 0;
    if (this.$outer.getTitlePane() != null && this.$outer.getTitlePane().contains$Point(convertedDragWindowOffset)) {
      if ((f != null && ((frameState & Frame.MAXIMIZED_BOTH) === 0) || (d != null)) && dragWindowOffset.y_ >= MetalRootPaneUI.BORDER_DRAG_THICKNESS && dragWindowOffset.x_ >= MetalRootPaneUI.BORDER_DRAG_THICKNESS && dragWindowOffset.x_ < ((w.getWidth() - MetalRootPaneUI.BORDER_DRAG_THICKNESS) | 0)) {
        this.isMovingWindow = true;
        this.dragOffsetX = dragWindowOffset.x_;
        this.dragOffsetY = dragWindowOffset.y_;
      }
    } else if (f != null && f.isResizable() && ((frameState & Frame.MAXIMIZED_BOTH) === 0) || (d != null && d.isResizable())) {
      this.dragOffsetX = dragWindowOffset.x_;
      this.dragOffsetY = dragWindowOffset.y_;
      this.dragWidth = w.getWidth();
      this.dragHeight = w.getHeight();
      this.dragCursor = this.getCursor(this.calculateCorner(w, dragWindowOffset.x_, dragWindowOffset.y_));
    }
  }
  mouseReleased(ev: MouseEvent): void {
    if (this.dragCursor !== 0 && this.$outer.window != null && !this.$outer.window.isValid()) {
      this.$outer.window.validate();
      this.$outer.getRootPane().repaint$();
    }
    this.isMovingWindow = false;
    this.dragCursor = 0;
  }
  mouseMoved(ev: MouseEvent): void {
    let root = this.$outer.getRootPane();
    if (root.getWindowDecorationStyle() === JRootPane.NONE) {
      return;
    }
    let w = ev.getSource();
    let f = null;
    let d = null;
    if (w instanceof Frame) {
      f = w;
    } else if (w instanceof Dialog) {
      d = w;
    }
    let cursor = this.getCursor(this.calculateCorner(w, ev.getX(), ev.getY()));
    if (cursor !== 0 && ((f != null && (f.isResizable() && (f.getExtendedState() & Frame.MAXIMIZED_BOTH) === 0)) || (d != null && d.isResizable()))) {
      w.setCursor$Cursor(Cursor.getPredefinedCursor(cursor));
    } else {
      w.setCursor$Cursor(this.$outer.lastCursor);
    }
  }
  adjust(bounds: Rectangle, min: Dimension, deltaX: number, deltaY: number, deltaWidth: number, deltaHeight: number): void {
    bounds.x_ = (bounds.x_ + deltaX) | 0;
    bounds.y_ = (bounds.y_ + deltaY) | 0;
    bounds.width_ = (bounds.width_ + deltaWidth) | 0;
    bounds.height_ = (bounds.height_ + deltaHeight) | 0;
    if (min != null) {
      if (bounds.width_ < min.width_) {
        let correction = (min.width_ - bounds.width_) | 0;
        if (deltaX !== 0) {
          bounds.x_ = (bounds.x_ - correction) | 0;
        }
        bounds.width_ = min.width_;
      }
      if (bounds.height_ < min.height_) {
        let correction = (min.height_ - bounds.height_) | 0;
        if (deltaY !== 0) {
          bounds.y_ = (bounds.y_ - correction) | 0;
        }
        bounds.height_ = min.height_;
      }
    }
  }
  mouseDragged(ev: MouseEvent): void {
    let w = ev.getSource();
    let pt = ev.getPoint();
    if (this.isMovingWindow) {
      let eventLocationOnScreen = ev.getLocationOnScreen();
      w.setLocation$int$int((eventLocationOnScreen.x_ - this.dragOffsetX) | 0, (eventLocationOnScreen.y_ - this.dragOffsetY) | 0);
    } else if (this.dragCursor !== 0) {
      let r = w.getBounds$();
      let startBounds = new Rectangle()._Rectangle$Rectangle(r);
      let min = w.getMinimumSize$();
      switch (this.dragCursor) {
        case Cursor.E_RESIZE_CURSOR:
          this.adjust(r, min, 0, 0, (pt.x_ + (this.dragWidth - this.dragOffsetX) - r.width_) | 0, 0);
          break;
        case Cursor.S_RESIZE_CURSOR:
          this.adjust(r, min, 0, 0, 0, (pt.y_ + (this.dragHeight - this.dragOffsetY) - r.height_) | 0);
          break;
        case Cursor.N_RESIZE_CURSOR:
          this.adjust(r, min, 0, (pt.y_ - this.dragOffsetY) | 0, 0, -((pt.y_ - this.dragOffsetY) | 0));
          break;
        case Cursor.W_RESIZE_CURSOR:
          this.adjust(r, min, (pt.x_ - this.dragOffsetX) | 0, 0, -((pt.x_ - this.dragOffsetX) | 0), 0);
          break;
        case Cursor.NE_RESIZE_CURSOR:
          this.adjust(r, min, 0, (pt.y_ - this.dragOffsetY) | 0, (pt.x_ + (this.dragWidth - this.dragOffsetX) - r.width_) | 0, -((pt.y_ - this.dragOffsetY) | 0));
          break;
        case Cursor.SE_RESIZE_CURSOR:
          this.adjust(r, min, 0, 0, (pt.x_ + (this.dragWidth - this.dragOffsetX) - r.width_) | 0, (pt.y_ + (this.dragHeight - this.dragOffsetY) - r.height_) | 0);
          break;
        case Cursor.NW_RESIZE_CURSOR:
          this.adjust(r, min, (pt.x_ - this.dragOffsetX) | 0, (pt.y_ - this.dragOffsetY) | 0, -((pt.x_ - this.dragOffsetX) | 0), -((pt.y_ - this.dragOffsetY) | 0));
          break;
        case Cursor.SW_RESIZE_CURSOR:
          this.adjust(r, min, (pt.x_ - this.dragOffsetX) | 0, 0, -((pt.x_ - this.dragOffsetX) | 0), (pt.y_ + (this.dragHeight - this.dragOffsetY) - r.height_) | 0);
          break;
        default:
          break;
      }
      if (!r.equals(startBounds)) {
        w.setBounds$Rectangle(r);
        if (Toolkit.getDefaultToolkit().isDynamicLayoutActive()) {
          w.validate();
          this.$outer.getRootPane().repaint$();
        }
      }
    }
  }
  mouseEntered(ev: MouseEvent): void {
    let w = ev.getSource();
    this.$outer.lastCursor = w.getCursor();
    this.mouseMoved(ev);
  }
  mouseExited(ev: MouseEvent): void {
    let w = ev.getSource();
    w.setCursor$Cursor(this.$outer.lastCursor);
  }
  mouseClicked(ev: MouseEvent): void {
    let w = ev.getSource();
    let f = null;
    if (w instanceof Frame) {
      f = w;
    } else {
      return;
    }
    let convertedPoint = SwingUtilities.convertPoint$Component$Point$Component(w, ev.getPoint(), this.$outer.getTitlePane());
    let state = f.getExtendedState();
    if (this.$outer.getTitlePane() != null && this.$outer.getTitlePane().contains$Point(convertedPoint)) {
      if ((ev.getClickCount() % 2) === 0 && ((ev.getModifiers() & InputEvent.BUTTON1_MASK) !== 0)) {
        if (f.isResizable()) {
          if ((state & Frame.MAXIMIZED_BOTH) !== 0) {
            f.setExtendedState(state & ~Frame.MAXIMIZED_BOTH);
          } else {
            f.setExtendedState(state | Frame.MAXIMIZED_BOTH);
          }
          return;
        }
      }
    }
  }
  /**
   * Returns the corner that contains the point <code>x</code>,
   * <code>y</code>, or -1 if the position doesn't match a corner.
   */
  calculateCorner(w: Window, x: number, y: number): number {
    let insets = w.getInsets$();
    let xPosition = this.calculatePosition((x - insets.left) | 0, (w.getWidth() - insets.left - insets.right) | 0);
    let yPosition = this.calculatePosition((y - insets.top) | 0, (w.getHeight() - insets.top - insets.bottom) | 0);
    if (xPosition === -1 || yPosition === -1) {
      return -1;
    }
    return (Math.imul(yPosition, 5) + xPosition) | 0;
  }
  /**
   * Returns the Cursor to render for the specified corner. This returns
   * 0 if the corner doesn't map to a valid Cursor
   */
  getCursor(corner: number): number {
    if (corner === -1) {
      return 0;
    }
    return MetalRootPaneUI.cursorMapping[corner];
  }
  /**
   * Returns an integer indicating the position of <code>spot</code>
   * in <code>width</code>. The return value will be:
   * 0 if < BORDER_DRAG_THICKNESS
   * 1 if < CORNER_DRAG_WIDTH
   * 2 if >= CORNER_DRAG_WIDTH && < width - BORDER_DRAG_THICKNESS
   * 3 if >= width - CORNER_DRAG_WIDTH
   * 4 if >= width - BORDER_DRAG_THICKNESS
   * 5 otherwise
   */
  calculatePosition(spot: number, width: number): number {
    if (spot < MetalRootPaneUI.BORDER_DRAG_THICKNESS) {
      return 0;
    }
    if (spot < MetalRootPaneUI.CORNER_DRAG_WIDTH) {
      return 1;
    }
    if (spot >= ((width - MetalRootPaneUI.BORDER_DRAG_THICKNESS) | 0)) {
      return 4;
    }
    if (spot >= ((width - MetalRootPaneUI.CORNER_DRAG_WIDTH) | 0)) {
      return 3;
    }
    return 2;
  }
}

$J.define(MetalRootPaneUI, 'javax.swing.plaf.metal.MetalRootPaneUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicRootPaneUI', ctors: { '': '_MetalRootPaneUI' }, clinit: true, lazy: ['borderKeys', 'cursorMapping'] });
$J.define(MetalRootPaneUI$MetalRootLayout, 'javax.swing.plaf.metal.MetalRootPaneUI$MetalRootLayout', { kind: 'class', ifaces: ['java.awt.LayoutManager2'], sup: 'java.lang.Object', ctors: { '': '_MetalRootPaneUI$MetalRootLayout' }, meths: { 'addLayoutComponent(java.awt.Component,java.lang.Object)': 'addLayoutComponent$Component$Object', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component', 'layoutContainer(java.awt.Container)': 'layoutContainer$Container' } });
$J.define(MetalRootPaneUI$MouseInputHandler, 'javax.swing.plaf.metal.MetalRootPaneUI$MouseInputHandler', { kind: 'class', ifaces: ['javax.swing.event.MouseInputListener'], sup: 'java.lang.Object', ctors: { '': '_MetalRootPaneUI$MouseInputHandler' }, inner: true });
$J.module(() => {
  Cursor = $J.load('java.awt.Cursor');
  Dialog = $J.load('java.awt.Dialog');
  Dimension = $J.load('java.awt.Dimension');
  Frame = $J.load('java.awt.Frame');
  Rectangle = $J.load('java.awt.Rectangle');
  Window = $J.load('java.awt.Window');
  InputEvent = $J.load('java.awt.event.InputEvent');
  JLayeredPane = $J.load('javax.swing.JLayeredPane');
  JRootPane = $J.load('javax.swing.JRootPane');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  MetalTitlePane = $J.load('javax.swing.plaf.metal.MetalTitlePane');
});
