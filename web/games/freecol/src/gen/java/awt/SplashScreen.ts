// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/SplashScreen.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2005, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, JObject, PlatformLogger } from '../../../jre/index.ts';

let GraphicsEnvironment, HeadlessException;

/**
 * The splash screen can be displayed at application startup, before the
 * Java Virtual Machine (JVM) starts. The splash screen is displayed as an
 * undecorated window containing an image. You can use GIF, JPEG, or PNG files
 * for the image. Animation is supported for the GIF format, while transparency
 * is supported both for GIF and PNG.  The window is positioned at the center
 * of the screen. The position on multi-monitor systems is not specified. It is
 * platform and implementation dependent.  The splash screen window is closed
 * automatically as soon as the first window is displayed by Swing/AWT (may be
 * also closed manually using the Java API, see below).
 * <P>
 * If your application is packaged in a jar file, you can use the
 * "SplashScreen-Image" option in a manifest file to show a splash screen.
 * Place the image in the jar archive and specify the path in the option.
 * The path should not have a leading slash.
 * <BR>
 * For example, in the {@code manifest.mf} file:
 * <PRE>
 * Manifest-Version: 1.0
 * Main-Class: Test
 * SplashScreen-Image: filename.gif
 * </PRE>
 * <P>
 * If the Java implementation provides the command-line interface and you run
 * your application by using the command line or a shortcut, use the Java
 * application launcher option to show a splash screen. The Oracle reference
 * implementation allows you to specify the splash screen image location with
 * the {@code -splash:} option.
 * <BR>
 * For example:
 * <PRE>
 * java -splash:filename.gif Test
 * </PRE>
 * HiDPI scaled image is also supported.
 * Unscaled image name i.e. filename.gif should be passed in
 * {@code manifest.mf}/{@code -splash:} option for all image types irrespective of
 * HiDPI and Non-HiDPI.
 * Following is the naming convention for scaled images.
 * Screen scale 1.25: filename@125pct.gif
 * Screen scale 1.50: filename@150pct.gif
 * Screen scale 2:    filename@200pct.gif and filename@2x.gif both are supported
 * Screen scale 2.50: filename@250pct.gif
 * Screen scale 3:    filename@300pct.gif and filename@3x.gif both are supported
 * The command line interface has higher precedence over the manifest
 * setting.
 * <p>
 * The splash screen will be displayed as faithfully as possible to present the
 * whole splash screen image given the limitations of the target platform and
 * display.
 * <p>
 * It is implied that the specified image is presented on the screen "as is",
 * i.e. preserving the exact color values as specified in the image file. Under
 * certain circumstances, though, the presented image may differ, e.g. when
 * applying color dithering to present a 32 bits per pixel (bpp) image on a 16
 * or 8 bpp screen. The native platform display configuration may also affect
 * the colors of the displayed image (e.g.  color profiles, etc.)
 * <p>
 * The {@code SplashScreen} class provides the API for controlling the splash
 * screen. This class may be used to close the splash screen, change the splash
 * screen image, get the splash screen native window position/size, and paint
 * in the splash screen. It cannot be used to create the splash screen. You
 * should use the options provided by the Java implementation for that.
 * <p>
 * This class cannot be instantiated. Only a single instance of this class
 * can exist, and it may be obtained by using the {@link #getSplashScreen()}
 * static method. In case the splash screen has not been created at
 * application startup via the command line or manifest file option,
 * the {@code getSplashScreen} method returns {@code null}.
 *
 * @author Oleg Semenov
 * @since 1.6
 */
export class SplashScreen extends JObject {
  image: BufferedImage = null;
  splashPtr: number = 0;
  static wasClosed: boolean = false;
  imageURL: URL = null;
  /**
   * The instance reference for the singleton.
   * ({@code null} if no instance exists yet.)
   *
   * @see #getSplashScreen
   * @see #close
   */
  static theInstance: SplashScreen = null;
  static log: PlatformLogger = null;
  _SplashScreen(ptr: number): this {
    this.splashPtr = ptr;
    return this;
  }
  /**
   * Returns the {@code SplashScreen} object used for
   * Java startup splash screen control on systems that support display.
   *
   * @throws UnsupportedOperationException if the splash screen feature is not
   *         supported by the current toolkit
   * @throws HeadlessException if {@code GraphicsEnvironment.isHeadless()}
   *         returns true
   * @return the {@link SplashScreen} instance, or {@code null} if there is
   *         none or it has already been closed
   */
  static getSplashScreen(): SplashScreen {
    {
      if (GraphicsEnvironment.isHeadless()) {
        throw new HeadlessException()._HeadlessException$();
      }
      if (!SplashScreen.wasClosed && SplashScreen.theInstance == null) {
        AccessController.doPrivileged(new (SplashScreen$1())());
        let ptr = SplashScreen._getInstance();
        if (ptr !== 0 && SplashScreen._isVisible(ptr)) {
          SplashScreen.theInstance = new SplashScreen()._SplashScreen(ptr);
        }
      }
      return SplashScreen.theInstance;
    }
  }
  static markClosed(): void {
    {
      SplashScreen.wasClosed = true;
      SplashScreen.theInstance = null;
    }
  }
  static _update(...$a: any[]): any {
    return $J.nativeCall('java.awt.SplashScreen', '_update', this, $a);
  }
  static _isVisible(...$a: any[]): any {
    return $J.nativeCall('java.awt.SplashScreen', '_isVisible', this, $a);
  }
  static _getBounds(...$a: any[]): any {
    return $J.nativeCall('java.awt.SplashScreen', '_getBounds', this, $a);
  }
  static _getInstance(...$a: any[]): any {
    return $J.nativeCall('java.awt.SplashScreen', '_getInstance', this, $a);
  }
  static _close(...$a: any[]): any {
    return $J.nativeCall('java.awt.SplashScreen', '_close', this, $a);
  }
  static _getImageFileName(...$a: any[]): any {
    return $J.nativeCall('java.awt.SplashScreen', '_getImageFileName', this, $a);
  }
  static _getImageJarName(...$a: any[]): any {
    return $J.nativeCall('java.awt.SplashScreen', '_getImageJarName', this, $a);
  }
  static _setImageData(...$a: any[]): any {
    return $J.nativeCall('java.awt.SplashScreen', '_setImageData', this, $a);
  }
  static _getScaleFactor(...$a: any[]): any {
    return $J.nativeCall('java.awt.SplashScreen', '_getScaleFactor', this, $a);
  }
  static $clinit() {
    SplashScreen.wasClosed = false;
    SplashScreen.theInstance = null;
    SplashScreen.log = PlatformLogger.getLogger('java.awt.SplashScreen');
  }
}

let $SplashScreen$1: any = null;
/** An anonymous class (SplashScreen.java:133). */
function SplashScreen$1(): any {
  return $SplashScreen$1 ??= $J.local(class extends JObject {
    run(): Void {
      $J.system_loadLibrary('splashscreen');
      return null;
    }
  }, 'java.awt.SplashScreen$1', ['java.security.PrivilegedAction']);
}

$J.define(SplashScreen, 'java.awt.SplashScreen', { kind: 'class', sup: 'java.lang.Object', ctors: { 'long': '_SplashScreen' }, clinit: true, lazy: ['wasClosed', 'theInstance', 'log'] });
$J.module(() => {
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  HeadlessException = $J.load('java.awt.HeadlessException');
});
