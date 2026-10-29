// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicScrollPaneUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, JObject, NullPointerException } from '../../../../../jre/index.ts';
import { ScrollPaneUI } from '../ScrollPaneUI.ts';
import { UIAction } from '../../../../sun/swing/UIAction.ts';

let Component$BaselineResizeBehavior, Dimension, Point, MouseWheelEvent, JComponent, LookAndFeel, ScrollPaneConstants, Scrollable, SwingConstants, SwingUtilities, UIManager, UIResource, BasicScrollBarUI, LazyActionMap, DefaultLookup;

/**
 * A default L&amp;F implementation of ScrollPaneUI.
 *
 * @author Hans Muller
 */
export class BasicScrollPaneUI extends ScrollPaneUI {
  /**
   * The instance of {@code JScrollPane}.
   */
  scrollpane: JScrollPane = null;
  /**
   * {@code ChangeListener} installed on the vertical scrollbar.
   */
  vsbChangeListener: ChangeListener = null;
  /**
   * {@code ChangeListener} installed on the horizontal scrollbar.
   */
  hsbChangeListener: ChangeListener = null;
  /**
   * {@code ChangeListener} installed on the viewport.
   */
  viewportChangeListener: ChangeListener = null;
  /**
   * {@code PropertyChangeListener} installed on the scroll pane.
   */
  spPropertyChangeListener: PropertyChangeListener = null;
  mouseScrollListener: MouseWheelListener = null;
  oldExtent: number = 0;
  /**
   * {@code PropertyChangeListener} installed on the vertical scrollbar.
   */
  vsbPropertyChangeListener: PropertyChangeListener = null;
  /**
   * {@code PropertyChangeListener} installed on the horizontal scrollbar.
   */
  hsbPropertyChangeListener: PropertyChangeListener = null;
  handler: BasicScrollPaneUI$Handler = null;
  /**
   * State flag that shows whether setValue() was called from a user program
   * before the value of "extent" was set in right-to-left component
   * orientation.
   */
  setValueCalled: boolean = false;
  /**
   * Constructs a {@code BasicScrollPaneUI}.
   */
  _BasicScrollPaneUI(): this {
    this._ScrollPaneUI();
    this.oldExtent = -2147483648;
    this.setValueCalled = false;
    return this;
  }
  /**
   * Returns a new instance of {@code BasicScrollPaneUI}.
   *
   * @param x a component.
   * @return a new instance of {@code BasicScrollPaneUI}
   */
  static createUI(x: JComponent): ComponentUI {
    return new BasicScrollPaneUI()._BasicScrollPaneUI();
  }
  static loadActionMap(map: LazyActionMap): void {
    map.put$Action(new BasicScrollPaneUI$Actions()._BasicScrollPaneUI$Actions(BasicScrollPaneUI$Actions.SCROLL_UP));
    map.put$Action(new BasicScrollPaneUI$Actions()._BasicScrollPaneUI$Actions(BasicScrollPaneUI$Actions.SCROLL_DOWN));
    map.put$Action(new BasicScrollPaneUI$Actions()._BasicScrollPaneUI$Actions(BasicScrollPaneUI$Actions.SCROLL_HOME));
    map.put$Action(new BasicScrollPaneUI$Actions()._BasicScrollPaneUI$Actions(BasicScrollPaneUI$Actions.SCROLL_END));
    map.put$Action(new BasicScrollPaneUI$Actions()._BasicScrollPaneUI$Actions(BasicScrollPaneUI$Actions.UNIT_SCROLL_UP));
    map.put$Action(new BasicScrollPaneUI$Actions()._BasicScrollPaneUI$Actions(BasicScrollPaneUI$Actions.UNIT_SCROLL_DOWN));
    map.put$Action(new BasicScrollPaneUI$Actions()._BasicScrollPaneUI$Actions(BasicScrollPaneUI$Actions.SCROLL_LEFT));
    map.put$Action(new BasicScrollPaneUI$Actions()._BasicScrollPaneUI$Actions(BasicScrollPaneUI$Actions.SCROLL_RIGHT));
    map.put$Action(new BasicScrollPaneUI$Actions()._BasicScrollPaneUI$Actions(BasicScrollPaneUI$Actions.UNIT_SCROLL_RIGHT));
    map.put$Action(new BasicScrollPaneUI$Actions()._BasicScrollPaneUI$Actions(BasicScrollPaneUI$Actions.UNIT_SCROLL_LEFT));
  }
  paint(g: Graphics, c: JComponent): void {
    let vpBorder = this.scrollpane.getViewportBorder();
    if (vpBorder != null) {
      let r = this.scrollpane.getViewportBorderBounds();
      vpBorder.paintBorder(this.scrollpane, g, r.x_, r.y_, r.width_, r.height_);
    }
  }
  /**
   * @return new Dimension(Short.MAX_VALUE, Short.MAX_VALUE)
   */
  getMaximumSize(c: JComponent): Dimension {
    return new Dimension()._Dimension$int$int(32767, 32767);
  }
  /**
   * Installs default properties.
   *
   * @param scrollpane an instance of {@code JScrollPane}
   */
  installDefaults(scrollpane: JScrollPane): void {
    LookAndFeel.installBorder(scrollpane, 'ScrollPane.border');
    LookAndFeel.installColorsAndFont(scrollpane, 'ScrollPane.background', 'ScrollPane.foreground', 'ScrollPane.font');
    let vpBorder = scrollpane.getViewportBorder();
    if ((vpBorder == null) || ($J.isa(vpBorder, UIResource))) {
      vpBorder = UIManager.getBorder$Object('ScrollPane.viewportBorder');
      scrollpane.setViewportBorder(vpBorder);
    }
    LookAndFeel.installProperty(scrollpane, 'opaque', true);
  }
  /**
   * Registers listeners.
   *
   * @param c an instance of {@code JScrollPane}
   */
  installListeners(c: JScrollPane): void {
    this.vsbChangeListener = this.createVSBChangeListener();
    this.vsbPropertyChangeListener = this.createVSBPropertyChangeListener();
    this.hsbChangeListener = this.createHSBChangeListener();
    this.hsbPropertyChangeListener = this.createHSBPropertyChangeListener();
    this.viewportChangeListener = this.createViewportChangeListener();
    this.spPropertyChangeListener = this.createPropertyChangeListener();
    let viewport = this.scrollpane.getViewport();
    let vsb = this.scrollpane.getVerticalScrollBar();
    let hsb = this.scrollpane.getHorizontalScrollBar();
    if (viewport != null) {
      viewport.addChangeListener(this.viewportChangeListener);
    }
    if (vsb != null) {
      vsb.getModel().addChangeListener(this.vsbChangeListener);
      vsb.addPropertyChangeListener$PropertyChangeListener(this.vsbPropertyChangeListener);
    }
    if (hsb != null) {
      hsb.getModel().addChangeListener(this.hsbChangeListener);
      hsb.addPropertyChangeListener$PropertyChangeListener(this.hsbPropertyChangeListener);
    }
    this.scrollpane.addPropertyChangeListener$PropertyChangeListener(this.spPropertyChangeListener);
    this.mouseScrollListener = this.createMouseWheelListener();
    this.scrollpane.addMouseWheelListener(this.mouseScrollListener);
  }
  /**
   * Registers keyboard actions.
   *
   * @param c an instance of {@code JScrollPane}
   */
  installKeyboardActions(c: JScrollPane): void {
    let inputMap = this.getInputMap(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT);
    SwingUtilities.replaceUIInputMap(c, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, inputMap);
    LazyActionMap.installLazyActionMap(c, $J.cls(BasicScrollPaneUI), 'ScrollPane.actionMap');
  }
  getInputMap(condition: number): InputMap {
    if (condition === JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT) {
      let keyMap = DefaultLookup.get(this.scrollpane, this, 'ScrollPane.ancestorInputMap');
      let rtlKeyMap: InputMap;
      if (this.scrollpane.getComponentOrientation().isLeftToRight() || ((rtlKeyMap = DefaultLookup.get(this.scrollpane, this, 'ScrollPane.ancestorInputMap.RightToLeft')) == null)) {
        return keyMap;
      } else {
        rtlKeyMap.setParent(keyMap);
        return rtlKeyMap;
      }
    }
    return null;
  }
  installUI(x: JComponent): void {
    this.scrollpane = x;
    this.installDefaults(this.scrollpane);
    this.installListeners(this.scrollpane);
    this.installKeyboardActions(this.scrollpane);
  }
  /**
   * Uninstalls default properties.
   *
   * @param c an instance of {@code JScrollPane}
   */
  uninstallDefaults(c: JScrollPane): void {
    LookAndFeel.uninstallBorder(this.scrollpane);
    if ($J.isa(this.scrollpane.getViewportBorder(), UIResource)) {
      this.scrollpane.setViewportBorder(null);
    }
  }
  /**
   * Unregisters listeners.
   *
   * @param c a component
   */
  uninstallListeners$JComponent(c: JComponent): void {
    let viewport = this.scrollpane.getViewport();
    let vsb = this.scrollpane.getVerticalScrollBar();
    let hsb = this.scrollpane.getHorizontalScrollBar();
    if (viewport != null) {
      viewport.removeChangeListener(this.viewportChangeListener);
    }
    if (vsb != null) {
      vsb.getModel().removeChangeListener(this.vsbChangeListener);
      vsb.removePropertyChangeListener$PropertyChangeListener(this.vsbPropertyChangeListener);
    }
    if (hsb != null) {
      hsb.getModel().removeChangeListener(this.hsbChangeListener);
      hsb.removePropertyChangeListener$PropertyChangeListener(this.hsbPropertyChangeListener);
    }
    this.scrollpane.removePropertyChangeListener$PropertyChangeListener(this.spPropertyChangeListener);
    if (this.mouseScrollListener != null) {
      this.scrollpane.removeMouseWheelListener(this.mouseScrollListener);
    }
    this.vsbChangeListener = null;
    this.hsbChangeListener = null;
    this.viewportChangeListener = null;
    this.spPropertyChangeListener = null;
    this.mouseScrollListener = null;
    this.handler = null;
  }
  /**
   * Unregisters keyboard actions.
   *
   * @param c an instance of {@code JScrollPane}
   */
  uninstallKeyboardActions(c: JScrollPane): void {
    SwingUtilities.replaceUIActionMap(c, null);
    SwingUtilities.replaceUIInputMap(c, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, null);
  }
  uninstallUI(c: JComponent): void {
    this.uninstallDefaults(this.scrollpane);
    this.uninstallListeners$JComponent(this.scrollpane);
    this.uninstallKeyboardActions(this.scrollpane);
    this.scrollpane = null;
  }
  getHandler(): BasicScrollPaneUI$Handler {
    if (this.handler == null) {
      this.handler = new BasicScrollPaneUI$Handler().$o(this)._BasicScrollPaneUI$Handler();
    }
    return this.handler;
  }
  /**
   * Synchronizes the {@code JScrollPane} with {@code Viewport}.
   */
  syncScrollPaneWithViewport(): void {
    let viewport = this.scrollpane.getViewport();
    let vsb = this.scrollpane.getVerticalScrollBar();
    let hsb = this.scrollpane.getHorizontalScrollBar();
    let rowHead = this.scrollpane.getRowHeader();
    let colHead = this.scrollpane.getColumnHeader();
    let ltr = this.scrollpane.getComponentOrientation().isLeftToRight();
    if (viewport != null) {
      let extentSize = viewport.getExtentSize();
      let viewSize = viewport.getViewSize();
      let viewPosition = viewport.getViewPosition();
      if (vsb != null) {
        let extent = extentSize.height_;
        let max = viewSize.height_;
        let value = Math.max(0, Math.min(viewPosition.y_, (max - extent) | 0));
        vsb.setValues(value, extent, 0, max);
      }
      if (hsb != null) {
        let extent = extentSize.width_;
        let max = viewSize.width_;
        let value: number;
        if (ltr) {
          value = Math.max(0, Math.min(viewPosition.x_, (max - extent) | 0));
        } else {
          let currentValue = hsb.getValue();
          if (this.setValueCalled && (((max - currentValue) | 0) === viewPosition.x_)) {
            value = Math.max(0, Math.min((max - extent) | 0, currentValue));
            if (extent !== 0) {
              this.setValueCalled = false;
            }
          } else {
            if (extent > max) {
              viewPosition.x_ = (max - extent) | 0;
              viewport.setViewPosition(viewPosition);
              value = 0;
            } else {
              value = Math.max(0, Math.min((max - extent) | 0, (max - extent - viewPosition.x_) | 0));
              if (this.oldExtent > extent) {
                value = (value - (this.oldExtent - extent)) | 0;
              }
            }
          }
        }
        this.oldExtent = extent;
        hsb.setValues(value, extent, 0, max);
      }
      if (rowHead != null) {
        let p = rowHead.getViewPosition();
        p.y_ = viewport.getViewPosition().y_;
        p.x_ = 0;
        rowHead.setViewPosition(p);
      }
      if (colHead != null) {
        let p = colHead.getViewPosition();
        if (ltr) {
          p.x_ = viewport.getViewPosition().x_;
        } else {
          p.x_ = Math.max(0, viewport.getViewPosition().x_);
        }
        p.y_ = 0;
        colHead.setViewPosition(p);
      }
    }
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
    if (c == null) {
      throw new NullPointerException('Component must be non-null');
    }
    if (width < 0 || height < 0) {
      throw new IllegalArgumentException('Width and height must be >= 0');
    }
    let viewport = this.scrollpane.getViewport();
    let spInsets = this.scrollpane.getInsets$();
    let y = spInsets.top;
    height = (height - spInsets.top - spInsets.bottom) | 0;
    width = (width - spInsets.left - spInsets.right) | 0;
    let columnHeader = this.scrollpane.getColumnHeader();
    if (columnHeader != null && columnHeader.isVisible$()) {
      let header = columnHeader.getView();
      if (header != null && header.isVisible$()) {
        let headerPref = header.getPreferredSize$();
        let baseline = header.getBaseline(headerPref.width_, headerPref.height_);
        if (baseline >= 0) {
          return (y + baseline) | 0;
        }
      }
      let columnPref = columnHeader.getPreferredSize$();
      height = (height - columnPref.height_) | 0;
      y = (y + columnPref.height_) | 0;
    }
    let view = (viewport == null) ? null : viewport.getView();
    if (view != null && view.isVisible$() && view.getBaselineResizeBehavior() === Component$BaselineResizeBehavior.CONSTANT_ASCENT) {
      let viewportBorder = this.scrollpane.getViewportBorder();
      if (viewportBorder != null) {
        let vpbInsets = viewportBorder.getBorderInsets$Component(this.scrollpane);
        y = (y + vpbInsets.top) | 0;
        height = (height - vpbInsets.top - vpbInsets.bottom) | 0;
        width = (width - vpbInsets.left - vpbInsets.right) | 0;
      }
      if (view.getWidth() > 0 && view.getHeight() > 0) {
        let min = view.getMinimumSize$();
        width = Math.max(min.width_, view.getWidth());
        height = Math.max(min.height_, view.getHeight());
      }
      if (width > 0 && height > 0) {
        let baseline = view.getBaseline(width, height);
        if (baseline > 0) {
          return (y + baseline) | 0;
        }
      }
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
    return Component$BaselineResizeBehavior.CONSTANT_ASCENT;
  }
  /**
   * Returns an instance of viewport {@code ChangeListener}.
   *
   * @return an instance of viewport {@code ChangeListener}
   */
  createViewportChangeListener(): ChangeListener {
    return $J.fn(this.getHandler(), 'stateChanged');
  }
  /**
   * Returns a <code>PropertyChangeListener</code> that will be installed
   * on the horizontal <code>JScrollBar</code>.
   */
  createHSBPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
  /**
   * Returns an instance of horizontal scroll bar {@code ChangeListener}.
   *
   * @return an instance of horizontal scroll bar {@code ChangeListener}
   */
  createHSBChangeListener(): ChangeListener {
    return $J.fn(this.getHandler(), 'stateChanged');
  }
  /**
   * Returns a <code>PropertyChangeListener</code> that will be installed
   * on the vertical <code>JScrollBar</code>.
   */
  createVSBPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
  /**
   * Returns an instance of vertical scroll bar {@code ChangeListener}.
   *
   * @return an instance of vertical scroll bar {@code ChangeListener}
   */
  createVSBChangeListener(): ChangeListener {
    return $J.fn(this.getHandler(), 'stateChanged');
  }
  /**
   * Creates an instance of MouseWheelListener, which is added to the
   * JScrollPane by installUI().  The returned MouseWheelListener is used
   * to handle mouse wheel-driven scrolling.
   *
   * @return      MouseWheelListener which implements wheel-driven scrolling
   * @see #installUI
   * @see MouseWheelHandler
   * @since 1.4
   */
  createMouseWheelListener(): MouseWheelListener {
    return this.getHandler();
  }
  /**
   * Updates a scroll bar display policy.
   *
   * @param e the property change event
   */
  updateScrollBarDisplayPolicy(e: PropertyChangeEvent): void {
    this.scrollpane.revalidate();
    this.scrollpane.repaint$();
  }
  /**
   * Updates viewport.
   *
   * @param e the property change event
   */
  updateViewport(e: PropertyChangeEvent): void {
    let oldViewport = (e.getOldValue());
    let newViewport = (e.getNewValue());
    if (oldViewport != null) {
      oldViewport.removeChangeListener(this.viewportChangeListener);
    }
    if (newViewport != null) {
      let p = newViewport.getViewPosition();
      if (this.scrollpane.getComponentOrientation().isLeftToRight()) {
        p.x_ = Math.max(p.x_, 0);
      } else {
        let max = newViewport.getViewSize().width_;
        let extent = newViewport.getExtentSize().width_;
        if (extent > max) {
          p.x_ = (max - extent) | 0;
        } else {
          p.x_ = Math.max(0, Math.min((max - extent) | 0, p.x_));
        }
      }
      p.y_ = Math.max(p.y_, 0);
      newViewport.setViewPosition(p);
      newViewport.addChangeListener(this.viewportChangeListener);
    }
  }
  /**
   * Updates row header.
   *
   * @param e the property change event
   */
  updateRowHeader(e: PropertyChangeEvent): void {
    let newRowHead = (e.getNewValue());
    if (newRowHead != null) {
      let viewport = this.scrollpane.getViewport();
      let p = newRowHead.getViewPosition();
      p.y_ = (viewport != null) ? viewport.getViewPosition().y_ : 0;
      newRowHead.setViewPosition(p);
    }
  }
  /**
   * Updates column header.
   *
   * @param e the property change event
   */
  updateColumnHeader(e: PropertyChangeEvent): void {
    let newColHead = (e.getNewValue());
    if (newColHead != null) {
      let viewport = this.scrollpane.getViewport();
      let p = newColHead.getViewPosition();
      if (viewport == null) {
        p.x_ = 0;
      } else {
        if (this.scrollpane.getComponentOrientation().isLeftToRight()) {
          p.x_ = viewport.getViewPosition().x_;
        } else {
          p.x_ = Math.max(0, viewport.getViewPosition().x_);
        }
      }
      newColHead.setViewPosition(p);
      this.scrollpane.add$Component$Object(newColHead, ScrollPaneConstants.COLUMN_HEADER);
    }
  }
  updateHorizontalScrollBar(pce: PropertyChangeEvent): void {
    this.updateScrollBar(pce, this.hsbChangeListener, this.hsbPropertyChangeListener);
  }
  updateVerticalScrollBar(pce: PropertyChangeEvent): void {
    this.updateScrollBar(pce, this.vsbChangeListener, this.vsbPropertyChangeListener);
  }
  updateScrollBar(pce: PropertyChangeEvent, cl: ChangeListener, pcl: PropertyChangeListener): void {
    let sb = pce.getOldValue();
    if (sb != null) {
      if (cl != null) {
        sb.getModel().removeChangeListener(cl);
      }
      if (pcl != null) {
        sb.removePropertyChangeListener$PropertyChangeListener(pcl);
      }
    }
    sb = pce.getNewValue();
    if (sb != null) {
      if (cl != null) {
        sb.getModel().addChangeListener(cl);
      }
      if (pcl != null) {
        sb.addPropertyChangeListener$PropertyChangeListener(pcl);
      }
    }
  }
  /**
   * Creates an instance of {@code PropertyChangeListener} that's added to
   * the {@code JScrollPane} by {@code installUI()}. Subclasses can override
   * this method to return a custom {@code PropertyChangeListener}, e.g.
   * <pre>
   * class MyScrollPaneUI extends BasicScrollPaneUI {
   *    protected PropertyChangeListener <b>createPropertyChangeListener</b>() {
   *        return new MyPropertyChangeListener();
   *    }
   *    public class MyPropertyChangeListener extends PropertyChangeListener {
   *        public void propertyChange(PropertyChangeEvent e) {
   *            if (e.getPropertyName().equals("viewport")) {
   *                // do some extra work when the viewport changes
   *            }
   *            super.propertyChange(e);
   *        }
   *    }
   * }
   * </pre>
   *
   * @return an instance of {@code PropertyChangeListener}
   *
   * @see java.beans.PropertyChangeListener
   * @see #installUI
   */
  createPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
}

export class BasicScrollPaneUI$Actions extends UIAction {
  static readonly SCROLL_UP: string = 'scrollUp';
  static readonly SCROLL_DOWN: string = 'scrollDown';
  static readonly SCROLL_HOME: string = 'scrollHome';
  static readonly SCROLL_END: string = 'scrollEnd';
  static readonly UNIT_SCROLL_UP: string = 'unitScrollUp';
  static readonly UNIT_SCROLL_DOWN: string = 'unitScrollDown';
  static readonly SCROLL_LEFT: string = 'scrollLeft';
  static readonly SCROLL_RIGHT: string = 'scrollRight';
  static readonly UNIT_SCROLL_LEFT: string = 'unitScrollLeft';
  static readonly UNIT_SCROLL_RIGHT: string = 'unitScrollRight';
  _BasicScrollPaneUI$Actions(key: string): this {
    this._UIAction(key);
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    let scrollPane = e.getSource();
    let ltr = scrollPane.getComponentOrientation().isLeftToRight();
    let key = this.getName();
    if (key === BasicScrollPaneUI$Actions.SCROLL_UP) {
      this.scroll(scrollPane, SwingConstants.VERTICAL, -1, true);
    } else if (key === BasicScrollPaneUI$Actions.SCROLL_DOWN) {
      this.scroll(scrollPane, SwingConstants.VERTICAL, 1, true);
    } else if (key === BasicScrollPaneUI$Actions.SCROLL_HOME) {
      this.scrollHome(scrollPane);
    } else if (key === BasicScrollPaneUI$Actions.SCROLL_END) {
      this.scrollEnd(scrollPane);
    } else if (key === BasicScrollPaneUI$Actions.UNIT_SCROLL_UP) {
      this.scroll(scrollPane, SwingConstants.VERTICAL, -1, false);
    } else if (key === BasicScrollPaneUI$Actions.UNIT_SCROLL_DOWN) {
      this.scroll(scrollPane, SwingConstants.VERTICAL, 1, false);
    } else if (key === BasicScrollPaneUI$Actions.SCROLL_LEFT) {
      this.scroll(scrollPane, SwingConstants.HORIZONTAL, ltr ? -1 : 1, true);
    } else if (key === BasicScrollPaneUI$Actions.SCROLL_RIGHT) {
      this.scroll(scrollPane, SwingConstants.HORIZONTAL, ltr ? 1 : -1, true);
    } else if (key === BasicScrollPaneUI$Actions.UNIT_SCROLL_LEFT) {
      this.scroll(scrollPane, SwingConstants.HORIZONTAL, ltr ? -1 : 1, false);
    } else if (key === BasicScrollPaneUI$Actions.UNIT_SCROLL_RIGHT) {
      this.scroll(scrollPane, SwingConstants.HORIZONTAL, ltr ? 1 : -1, false);
    }
  }
  scrollEnd(scrollpane: JScrollPane): void {
    let vp = scrollpane.getViewport();
    let view: Component;
    if (vp != null && (view = vp.getView()) != null) {
      let visRect = vp.getViewRect();
      let bounds = view.getBounds$();
      if (scrollpane.getComponentOrientation().isLeftToRight()) {
        vp.setViewPosition(new Point()._Point$int$int((bounds.width_ - visRect.width_) | 0, (bounds.height_ - visRect.height_) | 0));
      } else {
        vp.setViewPosition(new Point()._Point$int$int(0, (bounds.height_ - visRect.height_) | 0));
      }
    }
  }
  scrollHome(scrollpane: JScrollPane): void {
    let vp = scrollpane.getViewport();
    let view: Component;
    if (vp != null && (view = vp.getView()) != null) {
      if (scrollpane.getComponentOrientation().isLeftToRight()) {
        vp.setViewPosition(new Point()._Point$int$int(0, 0));
      } else {
        let visRect = vp.getViewRect();
        let bounds = view.getBounds$();
        vp.setViewPosition(new Point()._Point$int$int((bounds.width_ - visRect.width_) | 0, 0));
      }
    }
  }
  scroll(scrollpane: JScrollPane, orientation: number, direction: number, block: boolean): void {
    let vp = scrollpane.getViewport();
    let view: Component;
    if (vp != null && (view = vp.getView()) != null) {
      let visRect = vp.getViewRect();
      let vSize = view.getSize$();
      let amount: number;
      if ($J.isa(view, Scrollable)) {
        if (block) {
          amount = (view).getScrollableBlockIncrement(visRect, orientation, direction);
        } else {
          amount = (view).getScrollableUnitIncrement(visRect, orientation, direction);
        }
      } else {
        if (block) {
          if (orientation === SwingConstants.VERTICAL) {
            amount = visRect.height_;
          } else {
            amount = visRect.width_;
          }
        } else {
          amount = 10;
        }
      }
      if (orientation === SwingConstants.VERTICAL) {
        visRect.y_ = (visRect.y_ + (Math.imul(amount, direction))) | 0;
        if (((visRect.y_ + visRect.height_) | 0) > vSize.height_) {
          visRect.y_ = Math.max(0, (vSize.height_ - visRect.height_) | 0);
        } else if (visRect.y_ < 0) {
          visRect.y_ = 0;
        }
      } else {
        if (scrollpane.getComponentOrientation().isLeftToRight()) {
          visRect.x_ = (visRect.x_ + (Math.imul(amount, direction))) | 0;
          if (((visRect.x_ + visRect.width_) | 0) > vSize.width_) {
            visRect.x_ = Math.max(0, (vSize.width_ - visRect.width_) | 0);
          } else if (visRect.x_ < 0) {
            visRect.x_ = 0;
          }
        } else {
          visRect.x_ = (visRect.x_ - (Math.imul(amount, direction))) | 0;
          if (visRect.width_ > vSize.width_) {
            visRect.x_ = (vSize.width_ - visRect.width_) | 0;
          } else {
            visRect.x_ = Math.max(0, Math.min((vSize.width_ - visRect.width_) | 0, visRect.x_));
          }
        }
      }
      vp.setViewPosition(visRect.getLocation());
    }
  }
}

export class BasicScrollPaneUI$Handler extends JObject {
  _BasicScrollPaneUI$Handler(): this {
    return this;
  }
  mouseWheelMoved(e: MouseWheelEvent): void {
    if (this.$outer.scrollpane.isWheelScrollingEnabled() && e.getWheelRotation() !== 0) {
      let toScroll = this.$outer.scrollpane.getVerticalScrollBar();
      let direction = e.getWheelRotation() < 0 ? -1 : 1;
      let orientation = SwingConstants.VERTICAL;
      if (toScroll == null || !toScroll.isVisible$() || e.isShiftDown()) {
        let hScroll = this.$outer.scrollpane.getHorizontalScrollBar();
        if (hScroll == null) {
          return;
        } else if (hScroll.isVisible$()) {
          toScroll = hScroll;
          orientation = SwingConstants.HORIZONTAL;
        } else if (!hScroll.isVisible$()) {
          if (e.isShiftDown()) {
            return;
          }
          orientation = SwingConstants.VERTICAL;
        }
      }
      e.consume();
      if (e.getScrollType() === MouseWheelEvent.WHEEL_UNIT_SCROLL) {
        let vp = this.$outer.scrollpane.getViewport();
        if (vp == null) {
          return;
        }
        let comp = vp.getView();
        let units = Math.abs(e.getUnitsToScroll());
        let limitScroll = Math.abs(e.getWheelRotation()) === 1;
        let fastWheelScroll = toScroll.getClientProperty('JScrollBar.fastWheelScrolling');
        if (true === fastWheelScroll && $J.isa(comp, Scrollable)) {
          let scrollComp = comp;
          let viewRect = vp.getViewRect();
          let startingX = viewRect.x_;
          let leftToRight = comp.getComponentOrientation().isLeftToRight();
          let scrollMin = toScroll.getMinimum();
          let scrollMax = (toScroll.getMaximum() - toScroll.getModel().getExtent()) | 0;
          if (limitScroll) {
            let blockIncr = scrollComp.getScrollableBlockIncrement(viewRect, orientation, direction);
            if (direction < 0) {
              scrollMin = Math.max(scrollMin, (toScroll.getValue() - blockIncr) | 0);
            } else {
              scrollMax = Math.min(scrollMax, (toScroll.getValue() + blockIncr) | 0);
            }
          }
          for (let i = 0; i < units; i++) {
            let unitIncr = scrollComp.getScrollableUnitIncrement(viewRect, orientation, direction);
            if (orientation === SwingConstants.VERTICAL) {
              if (direction < 0) {
                viewRect.y_ = (viewRect.y_ - unitIncr) | 0;
                if (viewRect.y_ <= scrollMin) {
                  viewRect.y_ = scrollMin;
                  break;
                }
              } else {
                viewRect.y_ = (viewRect.y_ + unitIncr) | 0;
                if (viewRect.y_ >= scrollMax) {
                  viewRect.y_ = scrollMax;
                  break;
                }
              }
            } else {
              if ((leftToRight && direction < 0) || (!leftToRight && direction > 0)) {
                viewRect.x_ = (viewRect.x_ - unitIncr) | 0;
                if (leftToRight) {
                  if (viewRect.x_ < scrollMin) {
                    viewRect.x_ = scrollMin;
                    break;
                  }
                }
              } else if ((leftToRight && direction > 0) || (!leftToRight && direction < 0)) {
                viewRect.x_ = (viewRect.x_ + unitIncr) | 0;
                if (leftToRight) {
                  if (viewRect.x_ > scrollMax) {
                    viewRect.x_ = scrollMax;
                    break;
                  }
                }
              } else {
                // assert false
              }
            }
          }
          if (orientation === SwingConstants.VERTICAL) {
            toScroll.setValue(viewRect.y_);
          } else {
            if (leftToRight) {
              toScroll.setValue(viewRect.x_);
            } else {
              let newPos = (toScroll.getValue() - (viewRect.x_ - startingX)) | 0;
              if (newPos < scrollMin) {
                newPos = scrollMin;
              } else if (newPos > scrollMax) {
                newPos = scrollMax;
              }
              toScroll.setValue(newPos);
            }
          }
        } else {
          BasicScrollBarUI.scrollByUnits(toScroll, direction, units, limitScroll);
        }
      } else if (e.getScrollType() === MouseWheelEvent.WHEEL_BLOCK_SCROLL) {
        BasicScrollBarUI.scrollByBlock(toScroll, direction);
      }
    }
  }
  stateChanged(e: ChangeEvent): void {
    let viewport = this.$outer.scrollpane.getViewport();
    if (viewport != null) {
      if (e.getSource() === viewport) {
        this.$outer.syncScrollPaneWithViewport();
      } else {
        let hsb = this.$outer.scrollpane.getHorizontalScrollBar();
        if (hsb != null && e.getSource() === hsb.getModel()) {
          this.hsbStateChanged(viewport, e);
        } else {
          let vsb = this.$outer.scrollpane.getVerticalScrollBar();
          if (vsb != null && e.getSource() === vsb.getModel()) {
            this.vsbStateChanged(viewport, e);
          }
        }
      }
    }
  }
  vsbStateChanged(viewport: JViewport, e: ChangeEvent): void {
    let model = (e.getSource());
    let p = viewport.getViewPosition();
    p.y_ = model.getValue();
    viewport.setViewPosition(p);
  }
  hsbStateChanged(viewport: JViewport, e: ChangeEvent): void {
    let model = (e.getSource());
    let p = viewport.getViewPosition();
    let value = model.getValue();
    if (this.$outer.scrollpane.getComponentOrientation().isLeftToRight()) {
      p.x_ = value;
    } else {
      let max = viewport.getViewSize().width_;
      let extent = viewport.getExtentSize().width_;
      let oldX = p.x_;
      p.x_ = (max - extent - value) | 0;
      if ((extent === 0) && (value !== 0) && (oldX === max)) {
        this.$outer.setValueCalled = true;
      } else {
        if ((extent !== 0) && (oldX < 0) && (p.x_ === 0)) {
          p.x_ = (p.x_ + value) | 0;
        }
      }
    }
    viewport.setViewPosition(p);
  }
  propertyChange(e: PropertyChangeEvent): void {
    if (e.getSource() === this.$outer.scrollpane) {
      this.scrollPanePropertyChange(e);
    } else {
      this.sbPropertyChange(e);
    }
  }
  scrollPanePropertyChange(e: PropertyChangeEvent): void {
    let propertyName = e.getPropertyName();
    if (propertyName === 'verticalScrollBarDisplayPolicy') {
      this.$outer.updateScrollBarDisplayPolicy(e);
    } else if (propertyName === 'horizontalScrollBarDisplayPolicy') {
      this.$outer.updateScrollBarDisplayPolicy(e);
    } else if (propertyName === 'viewport') {
      this.$outer.updateViewport(e);
    } else if (propertyName === 'rowHeader') {
      this.$outer.updateRowHeader(e);
    } else if (propertyName === 'columnHeader') {
      this.$outer.updateColumnHeader(e);
    } else if (propertyName === 'verticalScrollBar') {
      this.$outer.updateVerticalScrollBar(e);
    } else if (propertyName === 'horizontalScrollBar') {
      this.$outer.updateHorizontalScrollBar(e);
    } else if (propertyName === 'componentOrientation') {
      this.$outer.scrollpane.revalidate();
      this.$outer.scrollpane.repaint$();
    }
  }
  sbPropertyChange(e: PropertyChangeEvent): void {
    let propertyName = e.getPropertyName();
    let source = e.getSource();
    if ('model' === propertyName) {
      let sb = this.$outer.scrollpane.getVerticalScrollBar();
      let oldModel = e.getOldValue();
      let cl = null;
      if (source === sb) {
        cl = this.$outer.vsbChangeListener;
      } else if (source === this.$outer.scrollpane.getHorizontalScrollBar()) {
        sb = this.$outer.scrollpane.getHorizontalScrollBar();
        cl = this.$outer.hsbChangeListener;
      }
      if (cl != null) {
        if (oldModel != null) {
          oldModel.removeChangeListener(cl);
        }
        if (sb.getModel() != null) {
          sb.getModel().addChangeListener(cl);
        }
      }
    } else if ('componentOrientation' === propertyName) {
      if (source === this.$outer.scrollpane.getHorizontalScrollBar()) {
        let hsb = this.$outer.scrollpane.getHorizontalScrollBar();
        let viewport = this.$outer.scrollpane.getViewport();
        let p = viewport.getViewPosition();
        if (this.$outer.scrollpane.getComponentOrientation().isLeftToRight()) {
          p.x_ = hsb.getValue();
        } else {
          p.x_ = (viewport.getViewSize().width_ - viewport.getExtentSize().width_ - hsb.getValue()) | 0;
        }
        viewport.setViewPosition(p);
      }
    }
  }
}

$J.define(BasicScrollPaneUI, 'javax.swing.plaf.basic.BasicScrollPaneUI', { kind: 'class', ifaces: ['javax.swing.ScrollPaneConstants'], sup: 'javax.swing.plaf.ScrollPaneUI', ctors: { '': '_BasicScrollPaneUI' }, meths: { 'getBaseline(javax.swing.JComponent,int,int)': 'getBaseline$JComponent$int$int', 'uninstallListeners(javax.swing.JComponent)': 'uninstallListeners$JComponent' } });
$J.define(BasicScrollPaneUI$Actions, 'javax.swing.plaf.basic.BasicScrollPaneUI$Actions', { kind: 'class', sup: 'sun.swing.UIAction', ctors: { 'java.lang.String': '_BasicScrollPaneUI$Actions' } });
$J.define(BasicScrollPaneUI$Handler, 'javax.swing.plaf.basic.BasicScrollPaneUI$Handler', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener', 'java.beans.PropertyChangeListener', 'java.awt.event.MouseWheelListener'], sup: 'java.lang.Object', ctors: { '': '_BasicScrollPaneUI$Handler' }, inner: true });
$J.module(() => {
  Component$BaselineResizeBehavior = $J.load('java.awt.Component$BaselineResizeBehavior');
  Dimension = $J.load('java.awt.Dimension');
  Point = $J.load('java.awt.Point');
  MouseWheelEvent = $J.load('java.awt.event.MouseWheelEvent');
  JComponent = $J.load('javax.swing.JComponent');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  ScrollPaneConstants = $J.load('javax.swing.ScrollPaneConstants');
  Scrollable = $J.load('javax.swing.Scrollable');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicScrollBarUI = $J.load('javax.swing.plaf.basic.BasicScrollBarUI');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
});
