// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/DefaultMetalTheme.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, AppContext, GetPropertyAction, JObject } from '../../../../../jre/index.ts';
import { MetalTheme } from './MetalTheme.ts';

let Font, UIManager, ColorUIResource, FontUIResource, MetalFontDesktopProperty, MetalLookAndFeel, SwingUtilities2;

/**
 * A concrete implementation of {@code MetalTheme} providing
 * the original look of the Java Look and Feel, code-named "Steel". Refer
 * to {@link MetalLookAndFeel#setCurrentTheme} for details on changing
 * the default theme.
 * <p>
 * All colors returned by {@code DefaultMetalTheme} are completely
 * opaque.
 *
 * <h2><a id="fontStyle"></a>Font Style</h2>
 *
 * {@code DefaultMetalTheme} uses bold fonts for many controls.  To make all
 * controls (with the exception of the internal frame title bars and
 * client decorated frame title bars) use plain fonts you can do either of
 * the following:
 * <ul>
 * <li>Set the system property <code>swing.boldMetal</code> to
 *     <code>false</code>.  For example,
 *     <code>java&nbsp;-Dswing.boldMetal=false&nbsp;MyApp</code>.
 * <li>Set the defaults property <code>swing.boldMetal</code> to
 *     <code>Boolean.FALSE</code>.  For example:
 *     <code>UIManager.put("swing.boldMetal",&nbsp;Boolean.FALSE);</code>
 * </ul>
 * The defaults property <code>swing.boldMetal</code>, if set,
 * takes precedence over the system property of the same name. After
 * setting this defaults property you need to re-install
 * <code>MetalLookAndFeel</code>, as well as update the UI
 * of any previously created widgets. Otherwise the results are undefined.
 * The following illustrates how to do this:
 * <pre>
 *   // turn off bold fonts
 *   UIManager.put("swing.boldMetal", Boolean.FALSE);
 *
 *   // re-install the Metal Look and Feel
 *   UIManager.setLookAndFeel(new MetalLookAndFeel());
 *
 *   // Update the ComponentUIs for all Components. This
 *   // needs to be invoked for all windows.
 *   SwingUtilities.updateComponentTreeUI(rootComponent);
 * </pre>
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
 * @see MetalLookAndFeel
 * @see MetalLookAndFeel#setCurrentTheme
 *
 * @author Steve Wilson
 */
export class DefaultMetalTheme extends MetalTheme {
  /**
   * Whether or not fonts should be plain.  This is only used if
   * the defaults property 'swing.boldMetal' == "false".
   */
  static PLAIN_FONTS: boolean = false;
  /**
   * Names of the fonts to use.
   */
  static fontNames: string[] = null;
  /**
   * Styles for the fonts.  This is ignored if the defaults property
   * <code>swing.boldMetal</code> is false, or PLAIN_FONTS is true.
   */
  static fontStyles: number[] = null;
  /**
   * Sizes for the fonts.
   */
  static fontSizes: number[] = null;
  /**
   * System property names used to look up fonts.
   */
  static defaultNames: string[] = null;
  static primary1: ColorUIResource = null;
  static primary2: ColorUIResource = null;
  static primary3: ColorUIResource = null;
  static secondary1: ColorUIResource = null;
  static secondary2: ColorUIResource = null;
  static secondary3: ColorUIResource = null;
  fontDelegate: DefaultMetalTheme$FontDelegate = null;
  /**
   * Creates and returns an instance of {@code DefaultMetalTheme}.
   */
  _DefaultMetalTheme(): this {
    this._MetalTheme();
    this.install();
    return this;
  }
  /**
   * Returns the ideal font name for the font identified by key.
   */
  static getDefaultFontName(key: number): string {
    return DefaultMetalTheme.fontNames[key];
  }
  /**
   * Returns the ideal font size for the font identified by key.
   */
  static getDefaultFontSize(key: number): number {
    return DefaultMetalTheme.fontSizes[key];
  }
  /**
   * Returns the ideal font style for the font identified by key.
   */
  static getDefaultFontStyle(key: number): number {
    if (key !== MetalTheme.WINDOW_TITLE_FONT) {
      let boldMetal = null;
      if (AppContext.getAppContext().get(SwingUtilities2.LAF_STATE_KEY) != null) {
        boldMetal = UIManager.get$Object('swing.boldMetal');
      }
      if (boldMetal != null) {
        if ($J.equals(false, boldMetal)) {
          return Font.PLAIN;
        }
      } else if (DefaultMetalTheme.PLAIN_FONTS) {
        return Font.PLAIN;
      }
    }
    return DefaultMetalTheme.fontStyles[key];
  }
  /**
   * Returns the default used to look up the specified font.
   */
  static getDefaultPropertyName(key: number): string {
    return DefaultMetalTheme.defaultNames[key];
  }
  /**
   * Returns the primary 1 color. This returns a color with rgb values
   * of 102, 102, and 153, respectively.
   *
   * @return the primary 1 color
   */
  getPrimary1(): ColorUIResource {
    return DefaultMetalTheme.primary1;
  }
  /**
   * Returns the primary 2 color. This returns a color with rgb values
   * of 153, 153, 204, respectively.
   *
   * @return the primary 2 color
   */
  getPrimary2(): ColorUIResource {
    return DefaultMetalTheme.primary2;
  }
  /**
   * Returns the primary 3 color. This returns a color with rgb values
   * 204, 204, 255, respectively.
   *
   * @return the primary 3 color
   */
  getPrimary3(): ColorUIResource {
    return DefaultMetalTheme.primary3;
  }
  /**
   * Returns the secondary 1 color. This returns a color with rgb values
   * 102, 102, and 102, respectively.
   *
   * @return the secondary 1 color
   */
  getSecondary1(): ColorUIResource {
    return DefaultMetalTheme.secondary1;
  }
  /**
   * Returns the secondary 2 color. This returns a color with rgb values
   * 153, 153, and 153, respectively.
   *
   * @return the secondary 2 color
   */
  getSecondary2(): ColorUIResource {
    return DefaultMetalTheme.secondary2;
  }
  /**
   * Returns the secondary 3 color. This returns a color with rgb values
   * 204, 204, and 204, respectively.
   *
   * @return the secondary 3 color
   */
  getSecondary3(): ColorUIResource {
    return DefaultMetalTheme.secondary3;
  }
  /**
   * Returns the control text font. This returns Dialog, 12pt. If
   * plain fonts have been enabled as described in <a href="#fontStyle">
   * font style</a>, the font style is plain. Otherwise the font style is
   * bold.
   *
   * @return the control text font
   */
  getControlTextFont(): FontUIResource {
    return this.getFont(MetalTheme.CONTROL_TEXT_FONT);
  }
  /**
   * Returns the system text font. This returns Dialog, 12pt, plain.
   *
   * @return the system text font
   */
  getSystemTextFont(): FontUIResource {
    return this.getFont(MetalTheme.SYSTEM_TEXT_FONT);
  }
  /**
   * Returns the user text font. This returns Dialog, 12pt, plain.
   *
   * @return the user text font
   */
  getUserTextFont(): FontUIResource {
    return this.getFont(MetalTheme.USER_TEXT_FONT);
  }
  /**
   * Returns the menu text font. This returns Dialog, 12pt. If
   * plain fonts have been enabled as described in <a href="#fontStyle">
   * font style</a>, the font style is plain. Otherwise the font style is
   * bold.
   *
   * @return the menu text font
   */
  getMenuTextFont(): FontUIResource {
    return this.getFont(MetalTheme.MENU_TEXT_FONT);
  }
  /**
   * Returns the window title font. This returns Dialog, 12pt, bold.
   *
   * @return the window title font
   */
  getWindowTitleFont(): FontUIResource {
    return this.getFont(MetalTheme.WINDOW_TITLE_FONT);
  }
  /**
   * Returns the sub-text font. This returns Dialog, 10pt, plain.
   *
   * @return the sub-text font
   */
  getSubTextFont(): FontUIResource {
    return this.getFont(MetalTheme.SUB_TEXT_FONT);
  }
  getFont(key: number): FontUIResource {
    return this.fontDelegate.getFont(key);
  }
  install(): void {
    if (MetalLookAndFeel.isWindows() && MetalLookAndFeel.useSystemFonts()) {
      this.fontDelegate = new DefaultMetalTheme$WindowsFontDelegate()._DefaultMetalTheme$WindowsFontDelegate();
    } else {
      this.fontDelegate = new DefaultMetalTheme$FontDelegate()._DefaultMetalTheme$FontDelegate();
    }
  }
  /**
   * Returns true if this is a theme provided by the core platform.
   */
  isSystemTheme(): boolean {
    return ($J.getClass(this) === $J.cls(DefaultMetalTheme));
  }
  static $clinit() {
    DefaultMetalTheme.fontNames = [Font.DIALOG, Font.DIALOG, Font.DIALOG, Font.DIALOG, Font.DIALOG, Font.DIALOG];
    DefaultMetalTheme.fontStyles = [Font.BOLD, Font.PLAIN, Font.PLAIN, Font.BOLD, Font.BOLD, Font.PLAIN];
    DefaultMetalTheme.fontSizes = [12, 12, 12, 12, 12, 10];
    DefaultMetalTheme.defaultNames = ['swing.plaf.metal.controlFont', 'swing.plaf.metal.systemFont', 'swing.plaf.metal.userFont', 'swing.plaf.metal.controlFont', 'swing.plaf.metal.controlFont', 'swing.plaf.metal.smallFont'];
    let boldProperty = AccessController.doPrivileged(new GetPropertyAction('swing.boldMetal'));
    if (boldProperty == null || !$J.equals('false', boldProperty)) {
      DefaultMetalTheme.PLAIN_FONTS = false;
    } else {
      DefaultMetalTheme.PLAIN_FONTS = true;
    }
    DefaultMetalTheme.primary1 = new ColorUIResource()._ColorUIResource$int$int$int(102, 102, 153);
    DefaultMetalTheme.primary2 = new ColorUIResource()._ColorUIResource$int$int$int(153, 153, 204);
    DefaultMetalTheme.primary3 = new ColorUIResource()._ColorUIResource$int$int$int(204, 204, 255);
    DefaultMetalTheme.secondary1 = new ColorUIResource()._ColorUIResource$int$int$int(102, 102, 102);
    DefaultMetalTheme.secondary2 = new ColorUIResource()._ColorUIResource$int$int$int(153, 153, 153);
    DefaultMetalTheme.secondary3 = new ColorUIResource()._ColorUIResource$int$int$int(204, 204, 204);
  }
}

/**
 * FontDelegates add an extra level of indirection to obtaining fonts.
 */
export class DefaultMetalTheme$FontDelegate extends JObject {
  static defaultMapping: number[] = null;
  fonts: FontUIResource[] = null;
  _DefaultMetalTheme$FontDelegate(): this {
    this.fonts = $J.newArray(6, null);
    return this;
  }
  getFont(type$: number): FontUIResource {
    let mappedType = DefaultMetalTheme$FontDelegate.defaultMapping[type$];
    if (this.fonts[type$] == null) {
      let f = this.getPrivilegedFont(mappedType);
      if (f == null) {
        f = new Font()._Font$String$int$int(DefaultMetalTheme.getDefaultFontName(type$), DefaultMetalTheme.getDefaultFontStyle(type$), DefaultMetalTheme.getDefaultFontSize(type$));
      }
      this.fonts[type$] = new FontUIResource()._FontUIResource$Font(f);
    }
    return this.fonts[type$];
  }
  /**
   * This is the same as invoking
   * <code>Font.getFont(key)</code>, with the exception
   * that it is wrapped inside a <code>doPrivileged</code> call.
   */
  getPrivilegedFont(key: number): Font {
    return AccessController.doPrivileged(new (DefaultMetalTheme$FontDelegate$1())().$o(this).$c(key));
  }
  static $clinit() {
    DefaultMetalTheme$FontDelegate.defaultMapping = [MetalTheme.CONTROL_TEXT_FONT, MetalTheme.SYSTEM_TEXT_FONT, MetalTheme.USER_TEXT_FONT, MetalTheme.CONTROL_TEXT_FONT, MetalTheme.CONTROL_TEXT_FONT, MetalTheme.SUB_TEXT_FONT];
  }
}

/**
 * The WindowsFontDelegate uses DesktopProperties to obtain fonts.
 */
export class DefaultMetalTheme$WindowsFontDelegate extends DefaultMetalTheme$FontDelegate {
  props: MetalFontDesktopProperty[] = null;
  checkedPriviledged: boolean[] = null;
  _DefaultMetalTheme$WindowsFontDelegate(): this {
    this._DefaultMetalTheme$FontDelegate();
    this.props = $J.newArray(6, null);
    this.checkedPriviledged = $J.newArray(6, false);
    return this;
  }
  getFont(type$: number): FontUIResource {
    if (this.fonts[type$] != null) {
      return this.fonts[type$];
    }
    if (!this.checkedPriviledged[type$]) {
      let f = this.getPrivilegedFont(type$);
      this.checkedPriviledged[type$] = true;
      if (f != null) {
        this.fonts[type$] = new FontUIResource()._FontUIResource$Font(f);
        return this.fonts[type$];
      }
    }
    if (this.props[type$] == null) {
      this.props[type$] = new MetalFontDesktopProperty()._MetalFontDesktopProperty$int(type$);
    }
    return this.props[type$].createValue(null);
  }
}

let $DefaultMetalTheme$FontDelegate$1: any = null;
/** An anonymous class (DefaultMetalTheme.java:394). */
function DefaultMetalTheme$FontDelegate$1(): any {
  return $DefaultMetalTheme$FontDelegate$1 ??= $J.local(class extends JObject {
    run(): Font {
      return Font.getFont$String(DefaultMetalTheme.getDefaultPropertyName(this.$cv_key));
    }
    $c($key): this {
      this.$cv_key = $key;
      return this;
    }
  }, 'javax.swing.plaf.metal.DefaultMetalTheme$FontDelegate$1', ['java.security.PrivilegedAction']);
}

$J.define(DefaultMetalTheme, 'javax.swing.plaf.metal.DefaultMetalTheme', { kind: 'class', sup: 'javax.swing.plaf.metal.MetalTheme', ctors: { '': '_DefaultMetalTheme' }, clinit: true, lazy: ['PLAIN_FONTS', 'fontNames', 'fontStyles', 'fontSizes', 'defaultNames', 'primary1', 'primary2', 'primary3', 'secondary1', 'secondary2', 'secondary3'] });
$J.define(DefaultMetalTheme$FontDelegate, 'javax.swing.plaf.metal.DefaultMetalTheme$FontDelegate', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_DefaultMetalTheme$FontDelegate' }, clinit: true, lazy: ['defaultMapping'] });
$J.define(DefaultMetalTheme$WindowsFontDelegate, 'javax.swing.plaf.metal.DefaultMetalTheme$WindowsFontDelegate', { kind: 'class', sup: 'javax.swing.plaf.metal.DefaultMetalTheme$FontDelegate', ctors: { '': '_DefaultMetalTheme$WindowsFontDelegate' } });
$J.module(() => {
  Font = $J.load('java.awt.Font');
  UIManager = $J.load('javax.swing.UIManager');
  ColorUIResource = $J.load('javax.swing.plaf.ColorUIResource');
  FontUIResource = $J.load('javax.swing.plaf.FontUIResource');
  MetalFontDesktopProperty = $J.load('javax.swing.plaf.metal.MetalFontDesktopProperty');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
