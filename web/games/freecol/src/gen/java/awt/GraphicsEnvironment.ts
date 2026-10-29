// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/GraphicsEnvironment.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2024, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, FontManagerFactory, HeadlessGraphicsEnvironment, JObject, NullPointerException, PlatformGraphicsInfo, SunGraphicsEnvironment } from '../../../jre/index.ts';

let HeadlessException, Point;

/**
 * The {@code GraphicsEnvironment} class describes the collection
 * of {@link GraphicsDevice} objects and {@link java.awt.Font} objects
 * available to a Java(tm) application on a particular platform.
 * The resources in this {@code GraphicsEnvironment} might be local
 * or on a remote machine.  {@code GraphicsDevice} objects can be
 * screens, printers or image buffers and are the destination of
 * {@link Graphics2D} drawing methods.  Each {@code GraphicsDevice}
 * has a number of {@link GraphicsConfiguration} objects associated with
 * it.  These objects specify the different configurations in which the
 * {@code GraphicsDevice} can be used.
 * @see GraphicsDevice
 * @see GraphicsConfiguration
 */
export class GraphicsEnvironment extends JObject {
  /**
   * The headless state of the Toolkit and GraphicsEnvironment
   */
  static headless: boolean = null;
  /**
   * The headless state assumed by default
   */
  static defaultHeadless: boolean = null;
  /**
   * This is an abstract class and cannot be instantiated directly.
   * Instances must be obtained from a suitable factory or query method.
   */
  _GraphicsEnvironment(): this {
    return this;
  }
  /**
   * Returns the local {@code GraphicsEnvironment}.
   * @return the local {@code GraphicsEnvironment}
   */
  static getLocalGraphicsEnvironment(): GraphicsEnvironment {
    return GraphicsEnvironment$LocalGE.INSTANCE;
  }
  /**
   * Tests whether or not a display, keyboard, and mouse can be
   * supported in this environment.  If this method returns true,
   * a HeadlessException is thrown from areas of the Toolkit
   * and GraphicsEnvironment that are dependent on a display,
   * keyboard, or mouse.
   * @return {@code true} if this environment cannot support
   * a display, keyboard, and mouse; {@code false}
   * otherwise
   * @see java.awt.HeadlessException
   * @since 1.4
   */
  static isHeadless(): boolean {
    return GraphicsEnvironment.getHeadlessProperty();
  }
  /**
   * @return warning message if headless state is assumed by default;
   * null otherwise
   * @since 1.5
   */
  static getHeadlessMessage(): string {
    if (GraphicsEnvironment.headless == null) {
      GraphicsEnvironment.getHeadlessProperty();
    }
    return GraphicsEnvironment.defaultHeadless !== true ? null : PlatformGraphicsInfo.getDefaultHeadlessMessage();
  }
  /**
   * @return the value of the property "java.awt.headless"
   * @since 1.4
   */
  static getHeadlessProperty(): boolean {
    if (GraphicsEnvironment.headless == null) {
      AccessController.doPrivileged($J.lambdaObj(() => {
        let nm = $J.system_getProperty('java.awt.headless');
        if (nm == null) {
          GraphicsEnvironment.headless = GraphicsEnvironment.defaultHeadless = PlatformGraphicsInfo.getDefaultHeadlessProperty();
        } else {
          GraphicsEnvironment.headless = $J.parseBoolean(nm);
        }
        return null;
      }, 'run', 'java.security.PrivilegedAction'));
    }
    return GraphicsEnvironment.headless;
  }
  /**
   * Check for headless state and throw HeadlessException if headless
   * @since 1.4
   */
  static checkHeadless(): void {
    if (GraphicsEnvironment.isHeadless()) {
      throw new HeadlessException()._HeadlessException$();
    }
  }
  /**
   * Returns whether or not a display, keyboard, and mouse can be
   * supported in this graphics environment.  If this returns true,
   * {@code HeadlessException} will be thrown from areas of the
   * graphics environment that are dependent on a display, keyboard, or
   * mouse.
   * @return {@code true} if a display, keyboard, and mouse
   * can be supported in this environment; {@code false}
   * otherwise
   * @see java.awt.HeadlessException
   * @see #isHeadless
   * @since 1.4
   */
  isHeadlessInstance(): boolean {
    return GraphicsEnvironment.getHeadlessProperty();
  }
  /**
   * Registers a <i>created</i> {@code Font} in this
   * {@code GraphicsEnvironment}.
   * A created font is one that was returned from calling
   * {@link Font#createFont}, or derived from a created font by
   * calling {@link Font#deriveFont}.
   * After calling this method for such a font, it is available to
   * be used in constructing new {@code Font}s by name or family name,
   * and is enumerated by {@link #getAvailableFontFamilyNames} and
   * {@link #getAllFonts} within the execution context of this
   * application or applet. This means applets cannot register fonts in
   * a way that they are visible to other applets.
   * <p>
   * Reasons that this method might not register the font and therefore
   * return {@code false} are:
   * <ul>
   * <li>The font is not a <i>created</i> {@code Font}.
   * <li>The font conflicts with a non-created {@code Font} already
   * in this {@code GraphicsEnvironment}. For example if the name
   * is that of a system font, or a logical font as described in the
   * documentation of the {@link Font} class. It is implementation dependent
   * whether a font may also conflict if it has the same family name
   * as a system font.
   * <p>Notice that an application can supersede the registration
   * of an earlier created font with a new one.
   * </ul>
   *
   * @param  font the font to be registered
   * @return true if the {@code font} is successfully
   * registered in this {@code GraphicsEnvironment}.
   * @throws NullPointerException if {@code font} is null
   * @since 1.6
   */
  registerFont(font: Font): boolean {
    if (font == null) {
      throw new NullPointerException('font cannot be null.');
    }
    let fm = FontManagerFactory.getInstance();
    return fm.registerFont(font);
  }
  /**
   * Indicates a preference for locale-specific fonts in the mapping of
   * logical fonts to physical fonts. Calling this method indicates that font
   * rendering should primarily use fonts specific to the primary writing
   * system (the one indicated by the default encoding and the initial
   * default locale). For example, if the primary writing system is
   * Japanese, then characters should be rendered using a Japanese font
   * if possible, and other fonts should only be used for characters for
   * which the Japanese font doesn't have glyphs.
   * <p>
   * The actual change in font rendering behavior resulting from a call
   * to this method is implementation dependent; it may have no effect at
   * all, or the requested behavior may already match the default behavior.
   * The behavior may differ between font rendering in lightweight
   * and peered components.  Since calling this method requests a
   * different font, clients should expect different metrics, and may need
   * to recalculate window sizes and layout. Therefore this method should
   * be called before user interface initialisation.
   * @since 1.5
   */
  preferLocaleFonts(): void {
    let fm = FontManagerFactory.getInstance();
    fm.preferLocaleFonts();
  }
  /**
   * Indicates a preference for proportional over non-proportional (for
   * example dual-spaced CJK fonts) fonts in the mapping of logical fonts
   * to physical fonts. If the default mapping contains fonts for which
   * proportional and non-proportional variants exist, then calling
   * this method indicates the mapping should use a proportional variant.
   * <p>
   * The actual change in font rendering behavior resulting from a call to
   * this method is implementation dependent; it may have no effect at all.
   * The behavior may differ between font rendering in lightweight and
   * peered components. Since calling this method requests a
   * different font, clients should expect different metrics, and may need
   * to recalculate window sizes and layout. Therefore this method should
   * be called before user interface initialisation.
   * @since 1.5
   */
  preferProportionalFonts(): void {
    let fm = FontManagerFactory.getInstance();
    fm.preferProportionalFonts();
  }
  /**
   * Returns the Point where Windows should be centered.
   * It is recommended that centered Windows be checked to ensure they fit
   * within the available display area using getMaximumWindowBounds().
   * @return the point where Windows should be centered
   *
   * @throws HeadlessException if isHeadless() returns true
   * @see #getMaximumWindowBounds
   * @since 1.4
   */
  getCenterPoint(): Point {
    let usableBounds = SunGraphicsEnvironment.getUsableBounds(this.getDefaultScreenDevice());
    return new Point()._Point$int$int((($J.idiv(usableBounds.width_, 2)) + usableBounds.x_) | 0, (($J.idiv(usableBounds.height_, 2)) + usableBounds.y_) | 0);
  }
  /**
   * Returns the maximum bounds for centered Windows.
   * These bounds account for objects in the native windowing system such as
   * task bars and menu bars.  The returned bounds will reside on a single
   * display with one exception: on multi-screen systems where Windows should
   * be centered across all displays, this method returns the bounds of the
   * entire display area.
   * <p>
   * To get the usable bounds of a single display, use
   * {@code GraphicsConfiguration.getBounds()} and
   * {@code Toolkit.getScreenInsets()}.
   * @return  the maximum bounds for centered Windows
   *
   * @throws HeadlessException if isHeadless() returns true
   * @see #getCenterPoint
   * @see GraphicsConfiguration#getBounds
   * @see Toolkit#getScreenInsets
   * @since 1.4
   */
  getMaximumWindowBounds(): Rectangle {
    return SunGraphicsEnvironment.getUsableBounds(this.getDefaultScreenDevice());
  }
}

/**
 * Lazy initialization of local graphics environment using holder idiom.
 */
export class GraphicsEnvironment$LocalGE extends JObject {
  /**
   * The instance of the local {@code GraphicsEnvironment}.
   */
  static INSTANCE: GraphicsEnvironment = null;
  /**
   * Creates and returns the GraphicsEnvironment, according to the
   * platform-specific proxy class.
   *
   * @return the graphics environment
   */
  static createGE(): GraphicsEnvironment {
    let ge = PlatformGraphicsInfo.createGE();
    if (GraphicsEnvironment.isHeadless()) {
      ge = new HeadlessGraphicsEnvironment(ge);
    }
    return ge;
  }
  static $clinit() {
    GraphicsEnvironment$LocalGE.INSTANCE = GraphicsEnvironment$LocalGE.createGE();
  }
}

$J.define(GraphicsEnvironment, 'java.awt.GraphicsEnvironment', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_GraphicsEnvironment' }, meths: { 'getAvailableFontFamilyNames(java.util.Locale)': 'getAvailableFontFamilyNames$Locale', 'getAvailableFontFamilyNames()': 'getAvailableFontFamilyNames$' } });
$J.define(GraphicsEnvironment$LocalGE, 'java.awt.GraphicsEnvironment$LocalGE', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_GraphicsEnvironment$LocalGE' }, clinit: true, lazy: ['INSTANCE'] });
$J.module(() => {
  HeadlessException = $J.load('java.awt.HeadlessException');
  Point = $J.load('java.awt.Point');
});
