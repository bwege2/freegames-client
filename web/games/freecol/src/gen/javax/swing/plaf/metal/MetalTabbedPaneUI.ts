// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalTabbedPaneUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2015, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../../../jre/index.ts';
import { BasicTabbedPaneUI } from '../basic/BasicTabbedPaneUI.ts';
import { BasicTabbedPaneUI$TabbedPaneLayout } from '../basic/BasicTabbedPaneUI.ts';

let JTabbedPane, SwingConstants, UIManager, UIResource, MetalLookAndFeel, MetalUtils;

/**
 * The Metal subclass of BasicTabbedPaneUI.
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
 * @author Tom Santos
 */
export class MetalTabbedPaneUI extends BasicTabbedPaneUI {
  /**
   * The minimum width of a pane.
   */
  minTabWidth: number = 0;
  unselectedBackground: Color = null;
  /**
   * The color of tab's background.
   */
  tabAreaBackground: Color = null;
  /**
   * The color of the selected pane.
   */
  selectColor: Color = null;
  /**
   * The color of the highlight.
   */
  selectHighlight: Color = null;
  tabsOpaque$MetalTabbedPaneUI: boolean = false;
  ocean: boolean = false;
  oceanSelectedBorderColor: Color = null;
  /**
   * Constructs a {@code MetalTabbedPaneUI}.
   */
  _MetalTabbedPaneUI(): this {
    this._BasicTabbedPaneUI();
    this.minTabWidth = 40;
    this.tabsOpaque$MetalTabbedPaneUI = true;
    return this;
  }
  /**
   * Constructs {@code MetalTabbedPaneUI}.
   *
   * @param x a component
   * @return an instance of {@code MetalTabbedPaneUI}
   */
  static createUI(x: JComponent): ComponentUI {
    return new MetalTabbedPaneUI()._MetalTabbedPaneUI();
  }
  createLayoutManager(): LayoutManager {
    if (this.tabPane.getTabLayoutPolicy() === JTabbedPane.SCROLL_TAB_LAYOUT) {
      return super.createLayoutManager();
    }
    return new MetalTabbedPaneUI$TabbedPaneLayout().$o(this)._MetalTabbedPaneUI$TabbedPaneLayout();
  }
  installDefaults(): void {
    super.installDefaults();
    this.tabAreaBackground = UIManager.getColor$Object('TabbedPane.tabAreaBackground');
    this.selectColor = UIManager.getColor$Object('TabbedPane.selected');
    this.selectHighlight = UIManager.getColor$Object('TabbedPane.selectHighlight');
    this.tabsOpaque$MetalTabbedPaneUI = UIManager.getBoolean$Object('TabbedPane.tabsOpaque');
    this.unselectedBackground = UIManager.getColor$Object('TabbedPane.unselectedBackground');
    this.ocean = MetalLookAndFeel.usingOcean();
    if (this.ocean) {
      this.oceanSelectedBorderColor = UIManager.getColor$Object('TabbedPane.borderHightlightColor');
    }
  }
  paintTabBorder(g: Graphics, tabPlacement: number, tabIndex: number, x: number, y: number, w: number, h: number, isSelected: boolean): void {
    let bottom = (y + (h - 1)) | 0;
    let right = (x + (w - 1)) | 0;
    switch (tabPlacement) {
      case SwingConstants.LEFT:
        this.paintLeftTabBorder(tabIndex, g, x, y, w, h, bottom, right, isSelected);
        break;
      case SwingConstants.BOTTOM:
        this.paintBottomTabBorder(tabIndex, g, x, y, w, h, bottom, right, isSelected);
        break;
      case SwingConstants.RIGHT:
        this.paintRightTabBorder(tabIndex, g, x, y, w, h, bottom, right, isSelected);
        break;
      case SwingConstants.TOP:
      default:
        this.paintTopTabBorder(tabIndex, g, x, y, w, h, bottom, right, isSelected);
    }
  }
  /**
   * Paints the top tab border.
   *
   * @param tabIndex a tab index
   * @param g an instance of {@code Graphics}
   * @param x an X coordinate
   * @param y an Y coordinate
   * @param w a width
   * @param h a height
   * @param btm bottom
   * @param rght right
   * @param isSelected a selection
   */
  paintTopTabBorder(tabIndex: number, g: Graphics, x: number, y: number, w: number, h: number, btm: number, rght: number, isSelected: boolean): void {
    let currentRun = this.getRunForTab(this.tabPane.getTabCount(), tabIndex);
    let lastIndex = this.lastTabInRun(this.tabPane.getTabCount(), currentRun);
    let firstIndex = this.tabRuns[currentRun];
    let leftToRight = MetalUtils.isLeftToRight(this.tabPane);
    let selectedIndex = this.tabPane.getSelectedIndex();
    let bottom = (h - 1) | 0;
    let right = (w - 1) | 0;
    if (this.shouldFillGap(currentRun, tabIndex, x, y)) {
      g.translate$int$int(x, y);
      if (leftToRight) {
        g.setColor(this.getColorForGap(currentRun, x, (y + 1) | 0));
        g.fillRect(1, 0, 5, 3);
        g.fillRect(1, 3, 2, 2);
      } else {
        g.setColor(this.getColorForGap(currentRun, (x + w - 1) | 0, (y + 1) | 0));
        g.fillRect((right - 5) | 0, 0, 5, 3);
        g.fillRect((right - 2) | 0, 3, 2, 2);
      }
      g.translate$int$int(-x, -y);
    }
    g.translate$int$int(x, y);
    if (this.ocean && isSelected) {
      g.setColor(this.oceanSelectedBorderColor);
    } else {
      g.setColor(this.darkShadow);
    }
    if (leftToRight) {
      g.drawLine(1, 5, 6, 0);
      g.drawLine(6, 0, right, 0);
      if (tabIndex === lastIndex) {
        g.drawLine(right, 1, right, bottom);
      }
      if (this.ocean && ((tabIndex - 1) | 0) === selectedIndex && currentRun === this.getRunForTab(this.tabPane.getTabCount(), selectedIndex)) {
        g.setColor(this.oceanSelectedBorderColor);
      }
      if (tabIndex !== (this.tabRuns[(this.runCount - 1) | 0])) {
        if (this.ocean && isSelected) {
          g.drawLine(0, 6, 0, bottom);
          g.setColor(this.darkShadow);
          g.drawLine(0, 0, 0, 5);
        } else {
          g.drawLine(0, 0, 0, bottom);
        }
      } else {
        g.drawLine(0, 6, 0, bottom);
      }
    } else {
      g.drawLine((right - 1) | 0, 5, (right - 6) | 0, 0);
      g.drawLine((right - 6) | 0, 0, 0, 0);
      if (tabIndex === lastIndex) {
        g.drawLine(0, 1, 0, bottom);
      }
      if (this.ocean && ((tabIndex - 1) | 0) === selectedIndex && currentRun === this.getRunForTab(this.tabPane.getTabCount(), selectedIndex)) {
        g.setColor(this.oceanSelectedBorderColor);
        g.drawLine(right, 0, right, bottom);
      } else if (this.ocean && isSelected) {
        g.drawLine(right, 6, right, bottom);
        if (tabIndex !== 0) {
          g.setColor(this.darkShadow);
          g.drawLine(right, 0, right, 5);
        }
      } else {
        if (tabIndex !== (this.tabRuns[(this.runCount - 1) | 0])) {
          g.drawLine(right, 0, right, bottom);
        } else {
          g.drawLine(right, 6, right, bottom);
        }
      }
    }
    g.setColor(isSelected ? this.selectHighlight : this.highlight);
    if (leftToRight) {
      g.drawLine(1, 6, 6, 1);
      g.drawLine(6, 1, (tabIndex === lastIndex) ? (right - 1) | 0 : right, 1);
      g.drawLine(1, 6, 1, bottom);
      if (tabIndex === firstIndex && tabIndex !== (this.tabRuns[(this.runCount - 1) | 0])) {
        if (this.tabPane.getSelectedIndex() === (this.tabRuns[(currentRun + 1) | 0])) {
          g.setColor(this.selectHighlight);
        } else {
          g.setColor(this.highlight);
        }
        g.drawLine(1, 0, 1, 4);
      }
    } else {
      g.drawLine((right - 1) | 0, 6, (right - 6) | 0, 1);
      g.drawLine((right - 6) | 0, 1, 1, 1);
      if (tabIndex === lastIndex) {
        g.drawLine(1, 1, 1, bottom);
      } else {
        g.drawLine(0, 1, 0, bottom);
      }
    }
    g.translate$int$int(-x, -y);
  }
  /**
   * Returns {@code true} if the gap should be filled.
   *
   * @param currentRun the current run
   * @param tabIndex the tab index
   * @param x an X coordinate
   * @param y an Y coordinate
   * @return {@code true} if the gap should be filled
   */
  shouldFillGap(currentRun: number, tabIndex: number, x: number, y: number): boolean {
    let result = false;
    if (!this.tabsOpaque$MetalTabbedPaneUI) {
      return false;
    }
    if (currentRun === ((this.runCount - 2) | 0)) {
      let lastTabBounds = this.getTabBounds$JTabbedPane$int(this.tabPane, (this.tabPane.getTabCount() - 1) | 0);
      let tabBounds = this.getTabBounds$JTabbedPane$int(this.tabPane, tabIndex);
      if (MetalUtils.isLeftToRight(this.tabPane)) {
        let lastTabRight = (lastTabBounds.x_ + lastTabBounds.width_ - 1) | 0;
        if (lastTabRight > ((tabBounds.x_ + 2) | 0)) {
          return true;
        }
      } else {
        let lastTabLeft = lastTabBounds.x_;
        let currentTabRight = (tabBounds.x_ + tabBounds.width_ - 1) | 0;
        if (lastTabLeft < ((currentTabRight - 2) | 0)) {
          return true;
        }
      }
    } else {
      result = currentRun !== ((this.runCount - 1) | 0);
    }
    return result;
  }
  /**
   * Returns the color of the gap.
   *
   * @param currentRun the current run
   * @param x an X coordinate
   * @param y an Y coordinate
   * @return the color of the gap
   */
  getColorForGap(currentRun: number, x: number, y: number): Color {
    let shadowWidth = 4;
    let selectedIndex = this.tabPane.getSelectedIndex();
    let startIndex = this.tabRuns[(currentRun + 1) | 0];
    let endIndex = this.lastTabInRun(this.tabPane.getTabCount(), (currentRun + 1) | 0);
    let tabOverGap = -1;
    for (let i = startIndex; i <= endIndex; ++i) {
      let tabBounds = this.getTabBounds$JTabbedPane$int(this.tabPane, i);
      let tabLeft = tabBounds.x_;
      let tabRight = (tabBounds.x_ + tabBounds.width_ - 1) | 0;
      if (MetalUtils.isLeftToRight(this.tabPane)) {
        if (tabLeft <= x && ((tabRight - shadowWidth) | 0) > x) {
          return selectedIndex === i ? this.selectColor : this.getUnselectedBackgroundAt(i);
        }
      } else {
        if (((tabLeft + shadowWidth) | 0) < x && tabRight >= x) {
          return selectedIndex === i ? this.selectColor : this.getUnselectedBackgroundAt(i);
        }
      }
    }
    return this.tabPane.getBackground();
  }
  /**
   * Paints the left tab border.
   *
   * @param tabIndex a tab index
   * @param g an instance of {@code Graphics}
   * @param x an X coordinate
   * @param y an Y coordinate
   * @param w a width
   * @param h a height
   * @param btm bottom
   * @param rght right
   * @param isSelected a selection
   */
  paintLeftTabBorder(tabIndex: number, g: Graphics, x: number, y: number, w: number, h: number, btm: number, rght: number, isSelected: boolean): void {
    let tabCount = this.tabPane.getTabCount();
    let currentRun = this.getRunForTab(tabCount, tabIndex);
    let lastIndex = this.lastTabInRun(tabCount, currentRun);
    let firstIndex = this.tabRuns[currentRun];
    g.translate$int$int(x, y);
    let bottom = (h - 1) | 0;
    let right = (w - 1) | 0;
    if (tabIndex !== firstIndex && this.tabsOpaque$MetalTabbedPaneUI) {
      g.setColor(this.tabPane.getSelectedIndex() === ((tabIndex - 1) | 0) ? this.selectColor : this.getUnselectedBackgroundAt((tabIndex - 1) | 0));
      g.fillRect(2, 0, 4, 3);
      g.drawLine(2, 3, 2, 3);
    }
    if (this.ocean) {
      g.setColor(isSelected ? this.selectHighlight : MetalLookAndFeel.getWhite());
    } else {
      g.setColor(isSelected ? this.selectHighlight : this.highlight);
    }
    g.drawLine(1, 6, 6, 1);
    g.drawLine(1, 6, 1, bottom);
    g.drawLine(6, 1, right, 1);
    if (tabIndex !== firstIndex) {
      if (this.tabPane.getSelectedIndex() === ((tabIndex - 1) | 0)) {
        g.setColor(this.selectHighlight);
      } else {
        g.setColor(this.ocean ? MetalLookAndFeel.getWhite() : this.highlight);
      }
      g.drawLine(1, 0, 1, 4);
    }
    if (this.ocean) {
      if (isSelected) {
        g.setColor(this.oceanSelectedBorderColor);
      } else {
        g.setColor(this.darkShadow);
      }
    } else {
      g.setColor(this.darkShadow);
    }
    g.drawLine(1, 5, 6, 0);
    g.drawLine(6, 0, right, 0);
    if (tabIndex === lastIndex) {
      g.drawLine(0, bottom, right, bottom);
    }
    if (this.ocean) {
      if (this.tabPane.getSelectedIndex() === ((tabIndex - 1) | 0)) {
        g.drawLine(0, 5, 0, bottom);
        g.setColor(this.oceanSelectedBorderColor);
        g.drawLine(0, 0, 0, 5);
      } else if (isSelected) {
        g.drawLine(0, 6, 0, bottom);
        if (tabIndex !== 0) {
          g.setColor(this.darkShadow);
          g.drawLine(0, 0, 0, 5);
        }
      } else if (tabIndex !== firstIndex) {
        g.drawLine(0, 0, 0, bottom);
      } else {
        g.drawLine(0, 6, 0, bottom);
      }
    } else {
      if (tabIndex !== firstIndex) {
        g.drawLine(0, 0, 0, bottom);
      } else {
        g.drawLine(0, 6, 0, bottom);
      }
    }
    g.translate$int$int(-x, -y);
  }
  /**
   * Paints the bottom tab border.
   *
   * @param tabIndex a tab index
   * @param g an instance of {@code Graphics}
   * @param x an X coordinate
   * @param y an Y coordinate
   * @param w a width
   * @param h a height
   * @param btm bottom
   * @param rght right
   * @param isSelected a selection
   */
  paintBottomTabBorder(tabIndex: number, g: Graphics, x: number, y: number, w: number, h: number, btm: number, rght: number, isSelected: boolean): void {
    let tabCount = this.tabPane.getTabCount();
    let currentRun = this.getRunForTab(tabCount, tabIndex);
    let lastIndex = this.lastTabInRun(tabCount, currentRun);
    let firstIndex = this.tabRuns[currentRun];
    let leftToRight = MetalUtils.isLeftToRight(this.tabPane);
    let bottom = (h - 1) | 0;
    let right = (w - 1) | 0;
    if (this.shouldFillGap(currentRun, tabIndex, x, y)) {
      g.translate$int$int(x, y);
      if (leftToRight) {
        g.setColor(this.getColorForGap(currentRun, x, y));
        g.fillRect(1, (bottom - 4) | 0, 3, 5);
        g.fillRect(4, (bottom - 1) | 0, 2, 2);
      } else {
        g.setColor(this.getColorForGap(currentRun, (x + w - 1) | 0, y));
        g.fillRect((right - 3) | 0, (bottom - 3) | 0, 3, 4);
        g.fillRect((right - 5) | 0, (bottom - 1) | 0, 2, 2);
        g.drawLine((right - 1) | 0, (bottom - 4) | 0, (right - 1) | 0, (bottom - 4) | 0);
      }
      g.translate$int$int(-x, -y);
    }
    g.translate$int$int(x, y);
    if (this.ocean && isSelected) {
      g.setColor(this.oceanSelectedBorderColor);
    } else {
      g.setColor(this.darkShadow);
    }
    if (leftToRight) {
      g.drawLine(1, (bottom - 5) | 0, 6, bottom);
      g.drawLine(6, bottom, right, bottom);
      if (tabIndex === lastIndex) {
        g.drawLine(right, 0, right, bottom);
      }
      if (this.ocean && isSelected) {
        g.drawLine(0, 0, 0, (bottom - 6) | 0);
        if ((currentRun === 0 && tabIndex !== 0) || (currentRun > 0 && tabIndex !== (this.tabRuns[(currentRun - 1) | 0]))) {
          g.setColor(this.darkShadow);
          g.drawLine(0, (bottom - 5) | 0, 0, bottom);
        }
      } else {
        if (this.ocean && tabIndex === ((this.tabPane.getSelectedIndex() + 1) | 0)) {
          g.setColor(this.oceanSelectedBorderColor);
        }
        if (tabIndex !== (this.tabRuns[(this.runCount - 1) | 0])) {
          g.drawLine(0, 0, 0, bottom);
        } else {
          g.drawLine(0, 0, 0, (bottom - 6) | 0);
        }
      }
    } else {
      g.drawLine((right - 1) | 0, (bottom - 5) | 0, (right - 6) | 0, bottom);
      g.drawLine((right - 6) | 0, bottom, 0, bottom);
      if (tabIndex === lastIndex) {
        g.drawLine(0, 0, 0, bottom);
      }
      if (this.ocean && tabIndex === ((this.tabPane.getSelectedIndex() + 1) | 0)) {
        g.setColor(this.oceanSelectedBorderColor);
        g.drawLine(right, 0, right, bottom);
      } else if (this.ocean && isSelected) {
        g.drawLine(right, 0, right, (bottom - 6) | 0);
        if (tabIndex !== firstIndex) {
          g.setColor(this.darkShadow);
          g.drawLine(right, (bottom - 5) | 0, right, bottom);
        }
      } else if (tabIndex !== (this.tabRuns[(this.runCount - 1) | 0])) {
        g.drawLine(right, 0, right, bottom);
      } else {
        g.drawLine(right, 0, right, (bottom - 6) | 0);
      }
    }
    g.setColor(isSelected ? this.selectHighlight : this.highlight);
    if (leftToRight) {
      g.drawLine(1, (bottom - 6) | 0, 6, (bottom - 1) | 0);
      g.drawLine(1, 0, 1, (bottom - 6) | 0);
      if (tabIndex === firstIndex && tabIndex !== (this.tabRuns[(this.runCount - 1) | 0])) {
        if (this.tabPane.getSelectedIndex() === (this.tabRuns[(currentRun + 1) | 0])) {
          g.setColor(this.selectHighlight);
        } else {
          g.setColor(this.highlight);
        }
        g.drawLine(1, (bottom - 4) | 0, 1, bottom);
      }
    } else {
      if (tabIndex === lastIndex) {
        g.drawLine(1, 0, 1, (bottom - 1) | 0);
      } else {
        g.drawLine(0, 0, 0, (bottom - 1) | 0);
      }
    }
    g.translate$int$int(-x, -y);
  }
  /**
   * Paints the right tab border.
   *
   * @param tabIndex a tab index
   * @param g an instance of {@code Graphics}
   * @param x an X coordinate
   * @param y an Y coordinate
   * @param w a width
   * @param h a height
   * @param btm bottom
   * @param rght right
   * @param isSelected a selection
   */
  paintRightTabBorder(tabIndex: number, g: Graphics, x: number, y: number, w: number, h: number, btm: number, rght: number, isSelected: boolean): void {
    let tabCount = this.tabPane.getTabCount();
    let currentRun = this.getRunForTab(tabCount, tabIndex);
    let lastIndex = this.lastTabInRun(tabCount, currentRun);
    let firstIndex = this.tabRuns[currentRun];
    g.translate$int$int(x, y);
    let bottom = (h - 1) | 0;
    let right = (w - 1) | 0;
    if (tabIndex !== firstIndex && this.tabsOpaque$MetalTabbedPaneUI) {
      g.setColor(this.tabPane.getSelectedIndex() === ((tabIndex - 1) | 0) ? this.selectColor : this.getUnselectedBackgroundAt((tabIndex - 1) | 0));
      g.fillRect((right - 5) | 0, 0, 5, 3);
      g.fillRect((right - 2) | 0, 3, 2, 2);
    }
    g.setColor(isSelected ? this.selectHighlight : this.highlight);
    g.drawLine((right - 6) | 0, 1, (right - 1) | 0, 6);
    g.drawLine(0, 1, (right - 6) | 0, 1);
    if (!isSelected) {
      g.drawLine(0, 1, 0, bottom);
    }
    if (this.ocean && isSelected) {
      g.setColor(this.oceanSelectedBorderColor);
    } else {
      g.setColor(this.darkShadow);
    }
    if (tabIndex === lastIndex) {
      g.drawLine(0, bottom, right, bottom);
    }
    if (this.ocean && this.tabPane.getSelectedIndex() === ((tabIndex - 1) | 0)) {
      g.setColor(this.oceanSelectedBorderColor);
    }
    g.drawLine((right - 6) | 0, 0, right, 6);
    g.drawLine(0, 0, (right - 6) | 0, 0);
    if (this.ocean && isSelected) {
      g.drawLine(right, 6, right, bottom);
      if (tabIndex !== firstIndex) {
        g.setColor(this.darkShadow);
        g.drawLine(right, 0, right, 5);
      }
    } else if (this.ocean && this.tabPane.getSelectedIndex() === ((tabIndex - 1) | 0)) {
      g.setColor(this.oceanSelectedBorderColor);
      g.drawLine(right, 0, right, 6);
      g.setColor(this.darkShadow);
      g.drawLine(right, 6, right, bottom);
    } else if (tabIndex !== firstIndex) {
      g.drawLine(right, 0, right, bottom);
    } else {
      g.drawLine(right, 6, right, bottom);
    }
    g.translate$int$int(-x, -y);
  }
  update(g: Graphics, c: JComponent): void {
    if (c.isOpaque()) {
      g.setColor(this.tabAreaBackground);
      g.fillRect(0, 0, c.getWidth(), c.getHeight());
    }
    this.paint(g, c);
  }
  paintTabBackground(g: Graphics, tabPlacement: number, tabIndex: number, x: number, y: number, w: number, h: number, isSelected: boolean): void {
    let slantWidth = $J.idiv(h, 2);
    if (isSelected) {
      g.setColor(this.selectColor);
    } else {
      g.setColor(this.getUnselectedBackgroundAt(tabIndex));
    }
    if (MetalUtils.isLeftToRight(this.tabPane)) {
      switch (tabPlacement) {
        case SwingConstants.LEFT:
          g.fillRect((x + 5) | 0, (y + 1) | 0, (w - 5) | 0, (h - 1) | 0);
          g.fillRect((x + 2) | 0, (y + 4) | 0, 3, (h - 4) | 0);
          break;
        case SwingConstants.BOTTOM:
          g.fillRect((x + 2) | 0, y, (w - 2) | 0, (h - 4) | 0);
          g.fillRect((x + 5) | 0, (y + (h - 1) - 3) | 0, (w - 5) | 0, 3);
          break;
        case SwingConstants.RIGHT:
          g.fillRect(x, (y + 2) | 0, (w - 4) | 0, (h - 2) | 0);
          g.fillRect((x + (w - 1) - 3) | 0, (y + 5) | 0, 3, (h - 5) | 0);
          break;
        case SwingConstants.TOP:
        default:
          g.fillRect((x + 4) | 0, (y + 2) | 0, (w - 1 - 3) | 0, (h - 1 - 1) | 0);
          g.fillRect((x + 2) | 0, (y + 5) | 0, 2, (h - 5) | 0);
      }
    } else {
      switch (tabPlacement) {
        case SwingConstants.LEFT:
          g.fillRect((x + 5) | 0, (y + 1) | 0, (w - 5) | 0, (h - 1) | 0);
          g.fillRect((x + 2) | 0, (y + 4) | 0, 3, (h - 4) | 0);
          break;
        case SwingConstants.BOTTOM:
          g.fillRect(x, y, (w - 5) | 0, (h - 1) | 0);
          g.fillRect((x + (w - 1) - 4) | 0, y, 4, (h - 5) | 0);
          g.fillRect((x + (w - 1) - 4) | 0, (y + (h - 1) - 4) | 0, 2, 2);
          break;
        case SwingConstants.RIGHT:
          g.fillRect((x + 1) | 0, (y + 1) | 0, (w - 5) | 0, (h - 1) | 0);
          g.fillRect((x + (w - 1) - 3) | 0, (y + 5) | 0, 3, (h - 5) | 0);
          break;
        case SwingConstants.TOP:
        default:
          g.fillRect(x, (y + 2) | 0, (w - 1 - 3) | 0, (h - 1 - 1) | 0);
          g.fillRect((x + (w - 1) - 3) | 0, (y + 5) | 0, 3, (h - 3) | 0);
      }
    }
  }
  /**
   * Overridden to do nothing for the Java L&amp;F.
   */
  getTabLabelShiftX(tabPlacement: number, tabIndex: number, isSelected: boolean): number {
    return 0;
  }
  /**
   * Overridden to do nothing for the Java L&amp;F.
   */
  getTabLabelShiftY(tabPlacement: number, tabIndex: number, isSelected: boolean): number {
    return 0;
  }
  /**
   * {@inheritDoc}
   *
   * @since 1.6
   */
  getBaselineOffset(): number {
    return 0;
  }
  paint(g: Graphics, c: JComponent): void {
    let tabPlacement = this.tabPane.getTabPlacement();
    let insets = c.getInsets$();
    let size = c.getSize$();
    if (this.tabPane.isOpaque()) {
      let background = c.getBackground();
      if ($J.isa(background, UIResource) && this.tabAreaBackground != null) {
        g.setColor(this.tabAreaBackground);
      } else {
        g.setColor(background);
      }
      {
        let totalTabHeight: number, totalTabWidth: number;
        switch (tabPlacement) {
          case SwingConstants.LEFT:
            g.fillRect(insets.left, insets.top, this.calculateTabAreaWidth(tabPlacement, this.runCount, this.maxTabWidth), (size.height_ - insets.bottom - insets.top) | 0);
            break;
          case SwingConstants.BOTTOM:
            totalTabHeight = this.calculateTabAreaHeight(tabPlacement, this.runCount, this.maxTabHeight);
            g.fillRect(insets.left, (size.height_ - insets.bottom - totalTabHeight) | 0, (size.width_ - insets.left - insets.right) | 0, totalTabHeight);
            break;
          case SwingConstants.RIGHT:
            totalTabWidth = this.calculateTabAreaWidth(tabPlacement, this.runCount, this.maxTabWidth);
            g.fillRect((size.width_ - insets.right - totalTabWidth) | 0, insets.top, totalTabWidth, (size.height_ - insets.top - insets.bottom) | 0);
            break;
          case SwingConstants.TOP:
          default:
            g.fillRect(insets.left, insets.top, (size.width_ - insets.right - insets.left) | 0, this.calculateTabAreaHeight(tabPlacement, this.runCount, this.maxTabHeight));
            this.paintHighlightBelowTab();
        }
      }
    }
    super.paint(g, c);
  }
  /**
   * Paints highlights below tab.
   */
  paintHighlightBelowTab(): void {
  }
  paintFocusIndicator(g: Graphics, tabPlacement: number, rects: Rectangle[], tabIndex: number, iconRect: Rectangle, textRect: Rectangle, isSelected: boolean): void {
    if (this.tabPane.hasFocus() && isSelected) {
      let tabRect = rects[tabIndex];
      let lastInRun = this.isLastInRun(tabIndex);
      g.setColor(this.focus);
      g.translate$int$int(tabRect.x_, tabRect.y_);
      let right = (tabRect.width_ - 1) | 0;
      let bottom = (tabRect.height_ - 1) | 0;
      let leftToRight = MetalUtils.isLeftToRight(this.tabPane);
      switch (tabPlacement) {
        case SwingConstants.RIGHT:
          g.drawLine((right - 6) | 0, 2, (right - 2) | 0, 6);
          g.drawLine(1, 2, (right - 6) | 0, 2);
          g.drawLine((right - 2) | 0, 6, (right - 2) | 0, bottom);
          g.drawLine(1, 2, 1, bottom);
          g.drawLine(1, bottom, (right - 2) | 0, bottom);
          break;
        case SwingConstants.BOTTOM:
          if (leftToRight) {
            g.drawLine(2, (bottom - 6) | 0, 6, (bottom - 2) | 0);
            g.drawLine(6, (bottom - 2) | 0, right, (bottom - 2) | 0);
            g.drawLine(2, 0, 2, (bottom - 6) | 0);
            g.drawLine(2, 0, right, 0);
            g.drawLine(right, 0, right, (bottom - 2) | 0);
          } else {
            g.drawLine((right - 2) | 0, (bottom - 6) | 0, (right - 6) | 0, (bottom - 2) | 0);
            g.drawLine((right - 2) | 0, 0, (right - 2) | 0, (bottom - 6) | 0);
            if (lastInRun) {
              g.drawLine(2, (bottom - 2) | 0, (right - 6) | 0, (bottom - 2) | 0);
              g.drawLine(2, 0, (right - 2) | 0, 0);
              g.drawLine(2, 0, 2, (bottom - 2) | 0);
            } else {
              g.drawLine(1, (bottom - 2) | 0, (right - 6) | 0, (bottom - 2) | 0);
              g.drawLine(1, 0, (right - 2) | 0, 0);
              g.drawLine(1, 0, 1, (bottom - 2) | 0);
            }
          }
          break;
        case SwingConstants.LEFT:
          g.drawLine(2, 6, 6, 2);
          g.drawLine(2, 6, 2, (bottom - 1) | 0);
          g.drawLine(6, 2, right, 2);
          g.drawLine(right, 2, right, (bottom - 1) | 0);
          g.drawLine(2, (bottom - 1) | 0, right, (bottom - 1) | 0);
          break;
        case SwingConstants.TOP:
        default:
          if (leftToRight) {
            g.drawLine(2, 6, 6, 2);
            g.drawLine(2, 6, 2, (bottom - 1) | 0);
            g.drawLine(6, 2, right, 2);
            g.drawLine(right, 2, right, (bottom - 1) | 0);
            g.drawLine(2, (bottom - 1) | 0, right, (bottom - 1) | 0);
          } else {
            g.drawLine((right - 2) | 0, 6, (right - 6) | 0, 2);
            g.drawLine((right - 2) | 0, 6, (right - 2) | 0, (bottom - 1) | 0);
            if (lastInRun) {
              g.drawLine((right - 6) | 0, 2, 2, 2);
              g.drawLine(2, 2, 2, (bottom - 1) | 0);
              g.drawLine((right - 2) | 0, (bottom - 1) | 0, 2, (bottom - 1) | 0);
            } else {
              g.drawLine((right - 6) | 0, 2, 1, 2);
              g.drawLine(1, 2, 1, (bottom - 1) | 0);
              g.drawLine((right - 2) | 0, (bottom - 1) | 0, 1, (bottom - 1) | 0);
            }
          }
      }
      g.translate$int$int(-tabRect.x_, -tabRect.y_);
    }
  }
  paintContentBorderTopEdge(g: Graphics, tabPlacement: number, selectedIndex: number, x: number, y: number, w: number, h: number): void {
    let leftToRight = MetalUtils.isLeftToRight(this.tabPane);
    let right = (x + w - 1) | 0;
    let selRect = selectedIndex < 0 ? null : this.getTabBounds$int$Rectangle(selectedIndex, this.calcRect);
    if (this.ocean) {
      g.setColor(this.oceanSelectedBorderColor);
    } else {
      g.setColor(this.selectHighlight);
    }
    if (tabPlacement !== SwingConstants.TOP || selectedIndex < 0 || (((selRect.y_ + selRect.height_ + 1) | 0) < y) || (selRect.x_ < x || selRect.x_ > ((x + w) | 0))) {
      g.drawLine(x, y, (x + w - 2) | 0, y);
      if (this.ocean && tabPlacement === SwingConstants.TOP) {
        g.setColor(MetalLookAndFeel.getWhite());
        g.drawLine(x, (y + 1) | 0, (x + w - 2) | 0, (y + 1) | 0);
      }
    } else {
      let lastInRun = this.isLastInRun(selectedIndex);
      if (leftToRight || lastInRun) {
        g.drawLine(x, y, (selRect.x_ + 1) | 0, y);
      } else {
        g.drawLine(x, y, selRect.x_, y);
      }
      if (((selRect.x_ + selRect.width_) | 0) < ((right - 1) | 0)) {
        if (leftToRight && !lastInRun) {
          g.drawLine((selRect.x_ + selRect.width_) | 0, y, (right - 1) | 0, y);
        } else {
          g.drawLine((selRect.x_ + selRect.width_ - 1) | 0, y, (right - 1) | 0, y);
        }
      } else {
        g.setColor(this.shadow);
        g.drawLine((x + w - 2) | 0, y, (x + w - 2) | 0, y);
      }
      if (this.ocean) {
        g.setColor(MetalLookAndFeel.getWhite());
        if (leftToRight || lastInRun) {
          g.drawLine(x, (y + 1) | 0, (selRect.x_ + 1) | 0, (y + 1) | 0);
        } else {
          g.drawLine(x, (y + 1) | 0, selRect.x_, (y + 1) | 0);
        }
        if (((selRect.x_ + selRect.width_) | 0) < ((right - 1) | 0)) {
          if (leftToRight && !lastInRun) {
            g.drawLine((selRect.x_ + selRect.width_) | 0, (y + 1) | 0, (right - 1) | 0, (y + 1) | 0);
          } else {
            g.drawLine((selRect.x_ + selRect.width_ - 1) | 0, (y + 1) | 0, (right - 1) | 0, (y + 1) | 0);
          }
        } else {
          g.setColor(this.shadow);
          g.drawLine((x + w - 2) | 0, (y + 1) | 0, (x + w - 2) | 0, (y + 1) | 0);
        }
      }
    }
  }
  paintContentBorderBottomEdge(g: Graphics, tabPlacement: number, selectedIndex: number, x: number, y: number, w: number, h: number): void {
    let leftToRight = MetalUtils.isLeftToRight(this.tabPane);
    let bottom = (y + h - 1) | 0;
    let right = (x + w - 1) | 0;
    let selRect = selectedIndex < 0 ? null : this.getTabBounds$int$Rectangle(selectedIndex, this.calcRect);
    g.setColor(this.darkShadow);
    if (tabPlacement !== SwingConstants.BOTTOM || selectedIndex < 0 || (((selRect.y_ - 1) | 0) > h) || (selRect.x_ < x || selRect.x_ > ((x + w) | 0))) {
      if (this.ocean && tabPlacement === SwingConstants.BOTTOM) {
        g.setColor(this.oceanSelectedBorderColor);
      }
      g.drawLine(x, (y + h - 1) | 0, (x + w - 1) | 0, (y + h - 1) | 0);
    } else {
      let lastInRun = this.isLastInRun(selectedIndex);
      if (this.ocean) {
        g.setColor(this.oceanSelectedBorderColor);
      }
      if (leftToRight || lastInRun) {
        g.drawLine(x, bottom, selRect.x_, bottom);
      } else {
        g.drawLine(x, bottom, (selRect.x_ - 1) | 0, bottom);
      }
      if (((selRect.x_ + selRect.width_) | 0) < ((x + w - 2) | 0)) {
        if (leftToRight && !lastInRun) {
          g.drawLine((selRect.x_ + selRect.width_) | 0, bottom, right, bottom);
        } else {
          g.drawLine((selRect.x_ + selRect.width_ - 1) | 0, bottom, right, bottom);
        }
      }
    }
  }
  paintContentBorderLeftEdge(g: Graphics, tabPlacement: number, selectedIndex: number, x: number, y: number, w: number, h: number): void {
    let selRect = selectedIndex < 0 ? null : this.getTabBounds$int$Rectangle(selectedIndex, this.calcRect);
    if (this.ocean) {
      g.setColor(this.oceanSelectedBorderColor);
    } else {
      g.setColor(this.selectHighlight);
    }
    if (tabPlacement !== SwingConstants.LEFT || selectedIndex < 0 || (((selRect.x_ + selRect.width_ + 1) | 0) < x) || (selRect.y_ < y || selRect.y_ > ((y + h) | 0))) {
      g.drawLine(x, (y + 1) | 0, x, (y + h - 2) | 0);
      if (this.ocean && tabPlacement === SwingConstants.LEFT) {
        g.setColor(MetalLookAndFeel.getWhite());
        g.drawLine((x + 1) | 0, y, (x + 1) | 0, (y + h - 2) | 0);
      }
    } else {
      g.drawLine(x, y, x, (selRect.y_ + 1) | 0);
      if (((selRect.y_ + selRect.height_) | 0) < ((y + h - 2) | 0)) {
        g.drawLine(x, (selRect.y_ + selRect.height_ + 1) | 0, x, (y + h + 2) | 0);
      }
      if (this.ocean) {
        g.setColor(MetalLookAndFeel.getWhite());
        g.drawLine((x + 1) | 0, (y + 1) | 0, (x + 1) | 0, (selRect.y_ + 1) | 0);
        if (((selRect.y_ + selRect.height_) | 0) < ((y + h - 2) | 0)) {
          g.drawLine((x + 1) | 0, (selRect.y_ + selRect.height_ + 1) | 0, (x + 1) | 0, (y + h + 2) | 0);
        }
      }
    }
  }
  paintContentBorderRightEdge(g: Graphics, tabPlacement: number, selectedIndex: number, x: number, y: number, w: number, h: number): void {
    let selRect = selectedIndex < 0 ? null : this.getTabBounds$int$Rectangle(selectedIndex, this.calcRect);
    g.setColor(this.darkShadow);
    if (tabPlacement !== SwingConstants.RIGHT || selectedIndex < 0 || (((selRect.x_ - 1) | 0) > w) || (selRect.y_ < y || selRect.y_ > ((y + h) | 0))) {
      if (this.ocean && tabPlacement === SwingConstants.RIGHT) {
        g.setColor(this.oceanSelectedBorderColor);
      }
      g.drawLine((x + w - 1) | 0, y, (x + w - 1) | 0, (y + h - 1) | 0);
    } else {
      if (this.ocean) {
        g.setColor(this.oceanSelectedBorderColor);
      }
      g.drawLine((x + w - 1) | 0, y, (x + w - 1) | 0, selRect.y_);
      if (((selRect.y_ + selRect.height_) | 0) < ((y + h - 2) | 0)) {
        g.drawLine((x + w - 1) | 0, (selRect.y_ + selRect.height_) | 0, (x + w - 1) | 0, (y + h - 2) | 0);
      }
    }
  }
  calculateMaxTabHeight(tabPlacement: number): number {
    let metrics = this.getFontMetrics();
    let height = metrics.getHeight();
    let tallerIcons = false;
    for (let i = 0; i < this.tabPane.getTabCount(); ++i) {
      let icon = this.tabPane.getIconAt(i);
      if (icon != null) {
        if (icon.getIconHeight() > height) {
          tallerIcons = true;
          break;
        }
      }
    }
    return (super.calculateMaxTabHeight(tabPlacement) - (tallerIcons ? ((this.tabInsets.top + this.tabInsets.bottom) | 0) : 0)) | 0;
  }
  getTabRunOverlay(tabPlacement: number): number {
    if (tabPlacement === SwingConstants.LEFT || tabPlacement === SwingConstants.RIGHT) {
      let maxTabHeight = this.calculateMaxTabHeight(tabPlacement);
      return $J.idiv(maxTabHeight, 2);
    }
    return 0;
  }
  shouldPadTabRun(tabPlacement: number, run: number): boolean {
    return this.runCount > 1 && run < ((this.runCount - 1) | 0);
  }
  isLastInRun(tabIndex: number): boolean {
    let run = this.getRunForTab(this.tabPane.getTabCount(), tabIndex);
    let lastIndex = this.lastTabInRun(this.tabPane.getTabCount(), run);
    return tabIndex === lastIndex;
  }
  /**
   * Returns the color to use for the specified tab.
   */
  getUnselectedBackgroundAt(index: number): Color {
    let color = this.tabPane.getBackgroundAt(index);
    if ($J.isa(color, UIResource)) {
      if (this.unselectedBackground != null) {
        return this.unselectedBackground;
      }
    }
    return color;
  }
}

/**
 * This class should be treated as a &quot;protected&quot; inner class.
 * Instantiate it only within subclasses of {@code MetalTabbedPaneUI}.
 */
export class MetalTabbedPaneUI$TabbedPaneLayout extends BasicTabbedPaneUI$TabbedPaneLayout {
  /**
   * Constructs {@code TabbedPaneLayout}.
   */
  _MetalTabbedPaneUI$TabbedPaneLayout(): this {
    this._BasicTabbedPaneUI$TabbedPaneLayout();
    return this;
  }
  normalizeTabRuns(tabPlacement: number, tabCount: number, start: number, max: number): void {
    if (tabPlacement === SwingConstants.TOP || tabPlacement === SwingConstants.BOTTOM) {
      super.normalizeTabRuns(tabPlacement, tabCount, start, max);
    }
  }
  rotateTabRuns(tabPlacement: number, selectedRun: number): void {
  }
  padSelectedTab(tabPlacement: number, selectedIndex: number): void {
  }
}

$J.define(MetalTabbedPaneUI, 'javax.swing.plaf.metal.MetalTabbedPaneUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicTabbedPaneUI', ctors: { '': '_MetalTabbedPaneUI' }, meths: { 'shouldRotateTabRuns(int,int)': 'shouldRotateTabRuns$int$int' } });
$J.define(MetalTabbedPaneUI$TabbedPaneLayout, 'javax.swing.plaf.metal.MetalTabbedPaneUI$TabbedPaneLayout', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicTabbedPaneUI$TabbedPaneLayout', ctors: { '': '_MetalTabbedPaneUI$TabbedPaneLayout' }, inner: true });
$J.module(() => {
  JTabbedPane = $J.load('javax.swing.JTabbedPane');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  UIManager = $J.load('javax.swing.UIManager');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
  MetalUtils = $J.load('javax.swing.plaf.metal.MetalUtils');
});
