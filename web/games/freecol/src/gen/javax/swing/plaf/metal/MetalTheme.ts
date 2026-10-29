// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalTheme.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2006, Oracle and/or its affiliates. All rights reserved.
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

let ColorUIResource;

/**
 * {@code MetalTheme} provides the color palette and fonts used by
 * the Java Look and Feel.
 * <p>
 * {@code MetalTheme} is abstract, see {@code DefaultMetalTheme} and
 * {@code OceanTheme} for concrete implementations.
 * <p>
 * {@code MetalLookAndFeel} maintains the current theme that the
 * the {@code ComponentUI} implementations for metal use. Refer to
 * {@link MetalLookAndFeel#setCurrentTheme
 * MetalLookAndFeel.setCurrentTheme(MetalTheme)} for details on changing
 * the current theme.
 * <p>
 * {@code MetalTheme} provides a number of public methods for getting
 * colors. These methods are implemented in terms of a
 * handful of protected abstract methods. A subclass need only override
 * the protected abstract methods ({@code getPrimary1},
 * {@code getPrimary2}, {@code getPrimary3}, {@code getSecondary1},
 * {@code getSecondary2}, and {@code getSecondary3}); although a subclass
 * may override the other public methods for more control over the set of
 * colors that are used.
 * <p>
 * Concrete implementations of {@code MetalTheme} must return {@code non-null}
 * values from all methods. While the behavior of returning {@code null} is
 * not specified, returning {@code null} will result in incorrect behavior.
 * <p>
 * It is strongly recommended that subclasses return completely opaque colors.
 * To do otherwise may result in rendering problems, such as visual garbage.
 *
 * @see DefaultMetalTheme
 * @see OceanTheme
 * @see MetalLookAndFeel#setCurrentTheme
 *
 * @author Steve Wilson
 */
export class MetalTheme extends JObject {
  static readonly CONTROL_TEXT_FONT: number = 0;
  static readonly SYSTEM_TEXT_FONT: number = 1;
  static readonly USER_TEXT_FONT: number = 2;
  static readonly MENU_TEXT_FONT: number = 3;
  static readonly WINDOW_TITLE_FONT: number = 4;
  static readonly SUB_TEXT_FONT: number = 5;
  static white: ColorUIResource = null;
  static black: ColorUIResource = null;
  /**
   * Constructor for subclasses to call.
   */
  _MetalTheme(): this {
    return this;
  }
  /**
   * Returns the white color. This returns opaque white
   * ({@code 0xFFFFFFFF}).
   *
   * @return the white color
   */
  getWhite(): ColorUIResource {
    return MetalTheme.white;
  }
  /**
   * Returns the black color. This returns opaque black
   * ({@code 0xFF000000}).
   *
   * @return the black color
   */
  getBlack(): ColorUIResource {
    return MetalTheme.black;
  }
  /**
   * Returns the focus color. This returns the value of
   * {@code getPrimary2()}.
   *
   * @return the focus color
   */
  getFocusColor(): ColorUIResource {
    return this.getPrimary2();
  }
  /**
   * Returns the desktop color. This returns the value of
   * {@code getPrimary2()}.
   *
   * @return the desktop color
   */
  getDesktopColor(): ColorUIResource {
    return this.getPrimary2();
  }
  /**
   * Returns the control color. This returns the value of
   * {@code getSecondary3()}.
   *
   * @return the control color
   */
  getControl(): ColorUIResource {
    return this.getSecondary3();
  }
  /**
   * Returns the control shadow color. This returns
   * the value of {@code getSecondary2()}.
   *
   * @return the control shadow color
   */
  getControlShadow(): ColorUIResource {
    return this.getSecondary2();
  }
  /**
   * Returns the control dark shadow color. This returns
   * the value of {@code getSecondary1()}.
   *
   * @return the control dark shadow color
   */
  getControlDarkShadow(): ColorUIResource {
    return this.getSecondary1();
  }
  /**
   * Returns the control info color. This returns
   * the value of {@code getBlack()}.
   *
   * @return the control info color
   */
  getControlInfo(): ColorUIResource {
    return this.getBlack();
  }
  /**
   * Returns the control highlight color. This returns
   * the value of {@code getWhite()}.
   *
   * @return the control highlight color
   */
  getControlHighlight(): ColorUIResource {
    return this.getWhite();
  }
  /**
   * Returns the control disabled color. This returns
   * the value of {@code getSecondary2()}.
   *
   * @return the control disabled color
   */
  getControlDisabled(): ColorUIResource {
    return this.getSecondary2();
  }
  /**
   * Returns the primary control color. This returns
   * the value of {@code getPrimary3()}.
   *
   * @return the primary control color
   */
  getPrimaryControl(): ColorUIResource {
    return this.getPrimary3();
  }
  /**
   * Returns the primary control shadow color. This returns
   * the value of {@code getPrimary2()}.
   *
   * @return the primary control shadow color
   */
  getPrimaryControlShadow(): ColorUIResource {
    return this.getPrimary2();
  }
  /**
   * Returns the primary control dark shadow color. This
   * returns the value of {@code getPrimary1()}.
   *
   * @return the primary control dark shadow color
   */
  getPrimaryControlDarkShadow(): ColorUIResource {
    return this.getPrimary1();
  }
  /**
   * Returns the primary control info color. This
   * returns the value of {@code getBlack()}.
   *
   * @return the primary control info color
   */
  getPrimaryControlInfo(): ColorUIResource {
    return this.getBlack();
  }
  /**
   * Returns the primary control highlight color. This
   * returns the value of {@code getWhite()}.
   *
   * @return the primary control highlight color
   */
  getPrimaryControlHighlight(): ColorUIResource {
    return this.getWhite();
  }
  /**
   * Returns the system text color. This returns the value of
   * {@code getBlack()}.
   *
   * @return the system text color
   */
  getSystemTextColor(): ColorUIResource {
    return this.getBlack();
  }
  /**
   * Returns the control text color. This returns the value of
   * {@code getControlInfo()}.
   *
   * @return the control text color
   */
  getControlTextColor(): ColorUIResource {
    return this.getControlInfo();
  }
  /**
   * Returns the inactive control text color. This returns the value of
   * {@code getControlDisabled()}.
   *
   * @return the inactive control text color
   */
  getInactiveControlTextColor(): ColorUIResource {
    return this.getControlDisabled();
  }
  /**
   * Returns the inactive system text color. This returns the value of
   * {@code getSecondary2()}.
   *
   * @return the inactive system text color
   */
  getInactiveSystemTextColor(): ColorUIResource {
    return this.getSecondary2();
  }
  /**
   * Returns the user text color. This returns the value of
   * {@code getBlack()}.
   *
   * @return the user text color
   */
  getUserTextColor(): ColorUIResource {
    return this.getBlack();
  }
  /**
   * Returns the text highlight color. This returns the value of
   * {@code getPrimary3()}.
   *
   * @return the text highlight color
   */
  getTextHighlightColor(): ColorUIResource {
    return this.getPrimary3();
  }
  /**
   * Returns the highlighted text color. This returns the value of
   * {@code getControlTextColor()}.
   *
   * @return the highlighted text color
   */
  getHighlightedTextColor(): ColorUIResource {
    return this.getControlTextColor();
  }
  /**
   * Returns the window background color. This returns the value of
   * {@code getWhite()}.
   *
   * @return the window background color
   */
  getWindowBackground(): ColorUIResource {
    return this.getWhite();
  }
  /**
   * Returns the window title background color. This returns the value of
   * {@code getPrimary3()}.
   *
   * @return the window title background color
   */
  getWindowTitleBackground(): ColorUIResource {
    return this.getPrimary3();
  }
  /**
   * Returns the window title foreground color. This returns the value of
   * {@code getBlack()}.
   *
   * @return the window title foreground color
   */
  getWindowTitleForeground(): ColorUIResource {
    return this.getBlack();
  }
  /**
   * Returns the window title inactive background color. This
   * returns the value of {@code getSecondary3()}.
   *
   * @return the window title inactive background color
   */
  getWindowTitleInactiveBackground(): ColorUIResource {
    return this.getSecondary3();
  }
  /**
   * Returns the window title inactive foreground color. This
   * returns the value of {@code getBlack()}.
   *
   * @return the window title inactive foreground color
   */
  getWindowTitleInactiveForeground(): ColorUIResource {
    return this.getBlack();
  }
  /**
   * Returns the menu background color. This
   * returns the value of {@code getSecondary3()}.
   *
   * @return the menu background color
   */
  getMenuBackground(): ColorUIResource {
    return this.getSecondary3();
  }
  /**
   * Returns the menu foreground color. This
   * returns the value of {@code getBlack()}.
   *
   * @return the menu foreground color
   */
  getMenuForeground(): ColorUIResource {
    return this.getBlack();
  }
  /**
   * Returns the menu selected background color. This
   * returns the value of {@code getPrimary2()}.
   *
   * @return the menu selected background color
   */
  getMenuSelectedBackground(): ColorUIResource {
    return this.getPrimary2();
  }
  /**
   * Returns the menu selected foreground color. This
   * returns the value of {@code getBlack()}.
   *
   * @return the menu selected foreground color
   */
  getMenuSelectedForeground(): ColorUIResource {
    return this.getBlack();
  }
  /**
   * Returns the menu disabled foreground color. This
   * returns the value of {@code getSecondary2()}.
   *
   * @return the menu disabled foreground color
   */
  getMenuDisabledForeground(): ColorUIResource {
    return this.getSecondary2();
  }
  /**
   * Returns the separator background color. This
   * returns the value of {@code getWhite()}.
   *
   * @return the separator background color
   */
  getSeparatorBackground(): ColorUIResource {
    return this.getWhite();
  }
  /**
   * Returns the separator foreground color. This
   * returns the value of {@code getPrimary1()}.
   *
   * @return the separator foreground color
   */
  getSeparatorForeground(): ColorUIResource {
    return this.getPrimary1();
  }
  /**
   * Returns the accelerator foreground color. This
   * returns the value of {@code getPrimary1()}.
   *
   * @return the accelerator foreground color
   */
  getAcceleratorForeground(): ColorUIResource {
    return this.getPrimary1();
  }
  /**
   * Returns the accelerator selected foreground color. This
   * returns the value of {@code getBlack()}.
   *
   * @return the accelerator selected foreground color
   */
  getAcceleratorSelectedForeground(): ColorUIResource {
    return this.getBlack();
  }
  /**
   * Adds values specific to this theme to the defaults table. This method
   * is invoked when the look and feel defaults are obtained from
   * {@code MetalLookAndFeel}.
   * <p>
   * This implementation does nothing; it is provided for subclasses
   * that wish to customize the defaults table.
   *
   * @param table the {@code UIDefaults} to add the values to
   *
   * @see MetalLookAndFeel#getDefaults
   */
  addCustomEntriesToTable(table: UIDefaults): void {
  }
  static $clinit() {
    MetalTheme.white = new ColorUIResource()._ColorUIResource$int$int$int(255, 255, 255);
    MetalTheme.black = new ColorUIResource()._ColorUIResource$int$int$int(0, 0, 0);
  }
}

$J.define(MetalTheme, 'javax.swing.plaf.metal.MetalTheme', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_MetalTheme' }, clinit: true, lazy: ['white', 'black'] });
$J.module(() => {
  ColorUIResource = $J.load('javax.swing.plaf.ColorUIResource');
});
