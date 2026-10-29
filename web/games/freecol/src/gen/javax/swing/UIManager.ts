// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/UIManager.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2023, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, AppContext, ArrayList, Exception, File, FileInputStream, GetPropertyAction, JError, JObject, Properties, StringTokenizer, SunToolkit, Toolkit, Vector } from '../../../jre/index.ts';

let KeyboardFocusManager, FocusManager, JComponent, JComponent$KeyboardState, JRootPane, LayoutFocusTraversalPolicy, MultiUIDefaults, RepaintManager, SwingPaintEventDispatcher, SwingUtilities, UnsupportedLookAndFeelException, SwingPropertyChangeSupport, MetalLookAndFeel, AWTAccessor, OSInfo, OSInfo$OSType, PaintEventDispatcher, DefaultLookup, SwingUtilities2;

/**
 * {@code UIManager} manages the current look and feel, the set of
 * available look and feels, {@code PropertyChangeListeners} that
 * are notified when the look and feel changes, look and feel defaults, and
 * convenience methods for obtaining various default values.
 *
 * <h2>Specifying the look and feel</h2>
 *
 * The look and feel can be specified in two distinct ways: by
 * specifying the fully qualified name of the class for the look and
 * feel, or by creating an instance of {@code LookAndFeel} and passing
 * it to {@code setLookAndFeel}. The following example illustrates
 * setting the look and feel to the system look and feel:
 * <pre>
 *   UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
 * </pre>
 * The following example illustrates setting the look and feel based on
 * class name:
 * <pre>
 *   UIManager.setLookAndFeel("javax.swing.plaf.metal.MetalLookAndFeel");
 * </pre>
 * Once the look and feel has been changed it is imperative to invoke
 * {@code updateUI} on all {@code JComponents}. The method {@link
 * SwingUtilities#updateComponentTreeUI} makes it easy to apply {@code
 * updateUI} to a containment hierarchy. Refer to it for
 * details. The exact behavior of not invoking {@code
 * updateUI} after changing the look and feel is
 * unspecified. It is very possible to receive unexpected exceptions,
 * painting problems, or worse.
 *
 * <h2>Default look and feel</h2>
 *
 * The class used for the default look and feel is chosen in the following
 * manner:
 * <ol>
 *   <li>If the system property <code>swing.defaultlaf</code> is
 *       {@code non-null}, use its value as the default look and feel class
 *       name.
 *   <li>If the {@link java.util.Properties} file <code>swing.properties</code>
 *       exists and contains the key <code>swing.defaultlaf</code>,
 *       use its value as the default look and feel class name. The location
 *       that is checked for <code>swing.properties</code> may vary depending
 *       upon the implementation of the Java platform. Typically the
 *       <code>swing.properties</code> file is located in the <code>conf</code>
 *       subdirectory of the Java installation directory.
 *       Refer to the release notes of the implementation being used for
 *       further details.
 *   <li>Otherwise use the cross platform look and feel.
 * </ol>
 *
 * <h2>Defaults</h2>
 *
 * {@code UIManager} manages three sets of {@code UIDefaults}. In order, they
 * are:
 * <ol>
 *   <li>Developer defaults. With few exceptions Swing does not
 *       alter the developer defaults; these are intended to be modified
 *       and used by the developer.
 *   <li>Look and feel defaults. The look and feel defaults are
 *       supplied by the look and feel at the time it is installed as the
 *       current look and feel ({@code setLookAndFeel()} is invoked). The
 *       look and feel defaults can be obtained using the {@code
 *       getLookAndFeelDefaults()} method.
 *   <li>System defaults. The system defaults are provided by Swing.
 * </ol>
 * Invoking any of the various {@code get} methods
 * results in checking each of the defaults, in order, returning
 * the first {@code non-null} value. For example, invoking
 * {@code UIManager.getString("Table.foreground")} results in first
 * checking developer defaults. If the developer defaults contain
 * a value for {@code "Table.foreground"} it is returned, otherwise
 * the look and feel defaults are checked, followed by the system defaults.
 * <p>
 * It's important to note that {@code getDefaults} returns a custom
 * instance of {@code UIDefaults} with this resolution logic built into it.
 * For example, {@code UIManager.getDefaults().getString("Table.foreground")}
 * is equivalent to {@code UIManager.getString("Table.foreground")}. Both
 * resolve using the algorithm just described. In many places the
 * documentation uses the word defaults to refer to the custom instance
 * of {@code UIDefaults} with the resolution logic as previously described.
 * <p>
 * When the look and feel is changed, {@code UIManager} alters only the
 * look and feel defaults; the developer and system defaults are not
 * altered by the {@code UIManager} in any way.
 * <p>
 * The set of defaults a particular look and feel supports is defined
 * and documented by that look and feel. In addition, each look and
 * feel, or {@code ComponentUI} provided by a look and feel, may
 * access the defaults at different times in their life cycle. Some
 * look and feels may aggressively look up defaults, so that changing a
 * default may not have an effect after installing the look and feel.
 * Other look and feels may lazily access defaults so that a change to
 * the defaults may effect an existing look and feel. Finally, other look
 * and feels might not configure themselves from the defaults table in
 * any way. None-the-less it is usually the case that a look and feel
 * expects certain defaults, so that in general
 * a {@code ComponentUI} provided by one look and feel will not
 * work with another look and feel.
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
 * @author Thomas Ball
 * @author Hans Muller
 * @since 1.2
 */
export class UIManager extends JObject {
  static classLock: any = null;
  static readonly defaultLAFKey: string = 'swing.defaultlaf';
  static readonly auxiliaryLAFsKey: string = 'swing.auxiliarylaf';
  static readonly multiplexingLAFKey: string = 'swing.plaf.multiplexinglaf';
  static readonly installedLAFsKey: string = 'swing.installedlafs';
  static readonly disableMnemonicKey: string = 'swing.disablenavaids';
  /**
   * The default value of <code>installedLAFS</code> is used when no
   * <code>swing.properties</code>
   * file is available or if the file doesn't contain a "swing.installedlafs"
   * property.
   *
   * @see #initializeInstalledLAFs
   */
  static installedLAFs: UIManager$LookAndFeelInfo[] = null;
  /**
   * Return the <code>LAFState</code> object, lazily create one if necessary.
   * All access to the <code>LAFState</code> fields is done via this method,
   * for example:
   * <pre>
   *     getLAFState().initialized = true;
   * </pre>
   */
  static getLAFState(): UIManager$LAFState {
    let rv = SwingUtilities.appContextGet(SwingUtilities2.LAF_STATE_KEY);
    if (rv == null) {
      {
        rv = SwingUtilities.appContextGet(SwingUtilities2.LAF_STATE_KEY);
        if (rv == null) {
          SwingUtilities.appContextPut(SwingUtilities2.LAF_STATE_KEY, (rv = new UIManager$LAFState()._UIManager$LAFState()));
        }
      }
    }
    return rv;
  }
  /**
   * Return a <code>swing.properties</code> file key for the attribute of specified
   * look and feel.  The attr is either "name" or "class", a typical
   * key would be: "swing.installedlaf.windows.name"
   */
  static makeInstalledLAFKey(laf: string, attr: string): string {
    return 'swing.installedlaf.' + laf + '.' + attr;
  }
  /**
   * The location of the <code>swing.properties</code> property file is
   * implementation-specific.
   * It is typically located in the <code>conf</code> subdirectory of the Java
   * installation directory. This method returns a bogus filename
   * if <code>java.home</code> isn't defined.
   */
  static makeSwingPropertiesFilename(): string {
    let sep = File.separator;
    let javaHome = $J.system_getProperty('java.home');
    if (javaHome == null) {
      javaHome = '<java.home undefined>';
    }
    return javaHome + sep + 'conf' + sep + 'swing.properties';
  }
  /**
   * Returns the current look and feel or <code>null</code>.
   *
   * @return current look and feel, or <code>null</code>
   * @see #setLookAndFeel
   */
  static getLookAndFeel(): LookAndFeel {
    UIManager.maybeInitialize();
    return UIManager.getLAFState().lookAndFeel;
  }
  /**
   * Sets the current look and feel to {@code newLookAndFeel}.
   * If the current look and feel is {@code non-null} {@code
   * uninitialize} is invoked on it. If {@code newLookAndFeel} is
   * {@code non-null}, {@code initialize} is invoked on it followed
   * by {@code getDefaults}. The defaults returned from {@code
   * newLookAndFeel.getDefaults()} replace those of the defaults
   * from the previous look and feel. If the {@code newLookAndFeel} is
   * {@code null}, the look and feel defaults are set to {@code null}.
   * <p>
   * A value of {@code null} can be used to set the look and feel
   * to {@code null}. As the {@code LookAndFeel} is required for
   * most of Swing to function, setting the {@code LookAndFeel} to
   * {@code null} is strongly discouraged.
   * <p>
   * This is a JavaBeans bound property.
   *
   * @param newLookAndFeel {@code LookAndFeel} to install
   * @throws UnsupportedLookAndFeelException if
   *          {@code newLookAndFeel} is {@code non-null} and
   *          {@code newLookAndFeel.isSupportedLookAndFeel()} returns
   *          {@code false}
   * @see #getLookAndFeel
   */
  static setLookAndFeel$LookAndFeel(newLookAndFeel: LookAndFeel): void {
    if ((newLookAndFeel != null) && !newLookAndFeel.isSupportedLookAndFeel()) {
      let s = newLookAndFeel.toString() + ' not supported on this platform';
      throw new UnsupportedLookAndFeelException()._UnsupportedLookAndFeelException(s);
    }
    let lafState = UIManager.getLAFState();
    let oldLookAndFeel = lafState.lookAndFeel;
    if (oldLookAndFeel != null) {
      oldLookAndFeel.uninitialize();
    }
    lafState.lookAndFeel = newLookAndFeel;
    if (newLookAndFeel != null) {
      DefaultLookup.setDefaultLookup(null);
      newLookAndFeel.initialize();
      lafState.setLookAndFeelDefaults(newLookAndFeel.getDefaults());
    } else {
      lafState.setLookAndFeelDefaults(null);
    }
    let changeSupport = lafState.getPropertyChangeSupport(false);
    if (changeSupport != null) {
      changeSupport.firePropertyChange$String$Object$Object('lookAndFeel', oldLookAndFeel, newLookAndFeel);
    }
  }
  /**
   * Loads the {@code LookAndFeel} specified by the given class
   * name, using the current thread's context class loader, and
   * passes it to {@code setLookAndFeel(LookAndFeel)}.
   *
   * @param className  a string specifying the name of the class that implements
   *        the look and feel
   * @throws ClassNotFoundException if the <code>LookAndFeel</code>
   *           class could not be found
   * @throws InstantiationException if a new instance of the class
   *          couldn't be created
   * @throws IllegalAccessException if the class or initializer isn't accessible
   * @throws UnsupportedLookAndFeelException if
   *          <code>lnf.isSupportedLookAndFeel()</code> is false
   * @throws ClassCastException if {@code className} does not identify
   *         a class that extends {@code LookAndFeel}
   * @throws NullPointerException if {@code className} is {@code null}
   */
  static setLookAndFeel$String(className: string): void {
    if ($J.equals('javax.swing.plaf.metal.MetalLookAndFeel', className)) {
      UIManager.setLookAndFeel$LookAndFeel(new MetalLookAndFeel()._MetalLookAndFeel());
    } else {
      let lnfClass = SwingUtilities.loadSystemClass(className);
      UIManager.setLookAndFeel$LookAndFeel((lnfClass.newInstance()));
    }
  }
  /**
   * Returns the name of the <code>LookAndFeel</code> class that implements
   * the native system look and feel if there is one, otherwise
   * the name of the default cross platform <code>LookAndFeel</code>
   * class. This value can be overridden by setting the
   * <code>swing.systemlaf</code> system property.
   *
   * @return the <code>String</code> of the <code>LookAndFeel</code>
   *          class
   *
   * @see #setLookAndFeel
   * @see #getCrossPlatformLookAndFeelClassName
   */
  static getSystemLookAndFeelClassName(): string {
    let systemLAF = AccessController.doPrivileged(new GetPropertyAction('swing.systemlaf'));
    if (systemLAF != null) {
      return systemLAF;
    }
    let osType = OSInfo.getOSType();
    if (osType === OSInfo$OSType.WINDOWS) {
      return 'com.sun.java.swing.plaf.windows.WindowsLookAndFeel';
    } else {
      let toolkit = Toolkit.getDefaultToolkit();
      if ($J.isa(toolkit, SunToolkit)) {
        let suntk = toolkit;
        let desktop = suntk.getDesktop();
        let gtkAvailable = suntk.isNativeGTKAvailable();
        if ($J.equals('gnome', desktop) && gtkAvailable) {
          return 'com.sun.java.swing.plaf.gtk.GTKLookAndFeel';
        }
      }
      if (osType === OSInfo$OSType.MACOSX) {
        if ($J.equals($J.getClass(toolkit).getName(), 'sun.lwawt.macosx.LWCToolkit')) {
          return 'com.apple.laf.AquaLookAndFeel';
        }
      }
    }
    return UIManager.getCrossPlatformLookAndFeelClassName();
  }
  /**
   * Returns the name of the <code>LookAndFeel</code> class that implements
   * the default cross platform look and feel -- the Java
   * Look and Feel (JLF).  This value can be overridden by setting the
   * <code>swing.crossplatformlaf</code> system property.
   *
   * @return  a string with the JLF implementation-class
   * @see #setLookAndFeel
   * @see #getSystemLookAndFeelClassName
   */
  static getCrossPlatformLookAndFeelClassName(): string {
    let laf = AccessController.doPrivileged(new GetPropertyAction('swing.crossplatformlaf'));
    if (laf != null) {
      return laf;
    }
    return 'javax.swing.plaf.metal.MetalLookAndFeel';
  }
  /**
   * Returns the defaults. The returned defaults resolve using the
   * logic specified in the class documentation.
   *
   * @return a <code>UIDefaults</code> object containing the default values
   */
  static getDefaults(): UIDefaults {
    UIManager.maybeInitialize();
    return UIManager.getLAFState().multiUIDefaults;
  }
  /**
   * Returns a font from the defaults. If the value for {@code key} is
   * not a {@code Font}, {@code null} is returned.
   *
   * @param key  an <code>Object</code> specifying the font
   * @return the <code>Font</code> object
   * @throws NullPointerException if {@code key} is {@code null}
   */
  static getFont$Object(key: any): Font {
    return UIManager.getDefaults().getFont$Object(key);
  }
  /**
   * Returns a font from the defaults that is appropriate
   * for the given locale. If the value for {@code key} is
   * not a {@code Font}, {@code null} is returned.
   *
   * @param key  an <code>Object</code> specifying the font
   * @param l the <code>Locale</code> for which the font is desired; refer
   *        to {@code UIDefaults} for details on how a {@code null}
   *        {@code Locale} is handled
   * @return the <code>Font</code> object
   * @throws NullPointerException if {@code key} is {@code null}
   * @since 1.4
   */
  static getFont$Object$Locale(key: any, l: Locale): Font {
    return UIManager.getDefaults().getFont$Object$Locale(key, l);
  }
  /**
   * Returns a color from the defaults. If the value for {@code key} is
   * not a {@code Color}, {@code null} is returned.
   *
   * @param key  an <code>Object</code> specifying the color
   * @return the <code>Color</code> object
   * @throws NullPointerException if {@code key} is {@code null}
   */
  static getColor$Object(key: any): Color {
    return UIManager.getDefaults().getColor$Object(key);
  }
  /**
   * Returns a color from the defaults that is appropriate
   * for the given locale. If the value for {@code key} is
   * not a {@code Color}, {@code null} is returned.
   *
   * @param key  an <code>Object</code> specifying the color
   * @param l the <code>Locale</code> for which the color is desired; refer
   *        to {@code UIDefaults} for details on how a {@code null}
   *        {@code Locale} is handled
   * @return the <code>Color</code> object
   * @throws NullPointerException if {@code key} is {@code null}
   * @since 1.4
   */
  static getColor$Object$Locale(key: any, l: Locale): Color {
    return UIManager.getDefaults().getColor$Object$Locale(key, l);
  }
  /**
   * Returns an <code>Icon</code> from the defaults. If the value for
   * {@code key} is not an {@code Icon}, {@code null} is returned.
   *
   * @param key  an <code>Object</code> specifying the icon
   * @return the <code>Icon</code> object
   * @throws NullPointerException if {@code key} is {@code null}
   */
  static getIcon$Object(key: any): Icon {
    return UIManager.getDefaults().getIcon$Object(key);
  }
  /**
   * Returns a border from the defaults. If the value for
   * {@code key} is not a {@code Border}, {@code null} is returned.
   *
   * @param key  an <code>Object</code> specifying the border
   * @return the <code>Border</code> object
   * @throws NullPointerException if {@code key} is {@code null}
   */
  static getBorder$Object(key: any): Border {
    return UIManager.getDefaults().getBorder$Object(key);
  }
  /**
   * Returns a string from the defaults. If the value for
   * {@code key} is not a {@code String}, {@code null} is returned.
   *
   * @param key  an <code>Object</code> specifying the string
   * @return the <code>String</code>
   * @throws NullPointerException if {@code key} is {@code null}
   */
  static getString$Object(key: any): string {
    return UIManager.getDefaults().getString$Object(key);
  }
  /**
   * Returns a string from the defaults that is appropriate for the
   * given locale.  If the value for
   * {@code key} is not a {@code String}, {@code null} is returned.
   *
   * @param key  an <code>Object</code> specifying the string
   * @param l the <code>Locale</code> for which the string is desired; refer
   *        to {@code UIDefaults} for details on how a {@code null}
   *        {@code Locale} is handled
   * @return the <code>String</code>
   * @since 1.4
   * @throws NullPointerException if {@code key} is {@code null}
   */
  static getString$Object$Locale(key: any, l: Locale): string {
    return UIManager.getDefaults().getString$Object$Locale(key, l);
  }
  /**
   * Returns an integer from the defaults. If the value for
   * {@code key} is not an {@code Integer}, or does not exist,
   * {@code 0} is returned.
   *
   * @param key  an <code>Object</code> specifying the int
   * @return the int
   * @throws NullPointerException if {@code key} is {@code null}
   */
  static getInt$Object(key: any): number {
    return UIManager.getDefaults().getInt$Object(key);
  }
  /**
   * Returns a boolean from the defaults which is associated with
   * the key value. If the key is not found or the key doesn't represent
   * a boolean value then {@code false} is returned.
   *
   * @param key  an <code>Object</code> specifying the key for the desired boolean value
   * @return the boolean value corresponding to the key
   * @throws NullPointerException if {@code key} is {@code null}
   * @since 1.4
   */
  static getBoolean$Object(key: any): boolean {
    return UIManager.getDefaults().getBoolean$Object(key);
  }
  /**
   * Returns an <code>Insets</code> object from the defaults. If the value
   * for {@code key} is not an {@code Insets}, {@code null} is returned.
   *
   * @param key  an <code>Object</code> specifying the <code>Insets</code> object
   * @return the <code>Insets</code> object
   * @throws NullPointerException if {@code key} is {@code null}
   */
  static getInsets$Object(key: any): Insets {
    return UIManager.getDefaults().getInsets$Object(key);
  }
  /**
   * Returns a dimension from the defaults. If the value
   * for {@code key} is not a {@code Dimension}, {@code null} is returned.
   *
   * @param key  an <code>Object</code> specifying the dimension object
   * @return the <code>Dimension</code> object
   * @throws NullPointerException if {@code key} is {@code null}
   */
  static getDimension$Object(key: any): Dimension {
    return UIManager.getDefaults().getDimension$Object(key);
  }
  /**
   * Returns a dimension from the defaults that is appropriate
   * for the given locale. If the value
   * for {@code key} is not a {@code Dimension}, {@code null} is returned.
   *
   * @param key  an <code>Object</code> specifying the dimension object
   * @param l the <code>Locale</code> for which the object is desired; refer
   *        to {@code UIDefaults} for details on how a {@code null}
   *        {@code Locale} is handled
   * @return the <code>Dimension</code> object
   * @throws NullPointerException if {@code key} is {@code null}
   * @since 1.4
   */
  static getDimension$Object$Locale(key: any, l: Locale): Dimension {
    return UIManager.getDefaults().getDimension$Object$Locale(key, l);
  }
  /**
   * Returns an object from the defaults.
   *
   * @param key  an <code>Object</code> specifying the desired object
   * @return the <code>Object</code>
   * @throws NullPointerException if {@code key} is {@code null}
   */
  static get$Object(key: any): any {
    return UIManager.getDefaults().get(key);
  }
  /**
   * Returns an object from the defaults that is appropriate for
   * the given locale.
   *
   * @param key  an <code>Object</code> specifying the desired object
   * @param l the <code>Locale</code> for which the object is desired; refer
   *        to {@code UIDefaults} for details on how a {@code null}
   *        {@code Locale} is handled
   * @return the <code>Object</code>
   * @throws NullPointerException if {@code key} is {@code null}
   * @since 1.4
   */
  static get$Object$Locale(key: any, l: Locale): any {
    return UIManager.getDefaults().get$Object$Locale(key, l);
  }
  /**
   * Stores an object in the developer defaults. This is a cover method
   * for {@code getDefaults().put(key, value)}. This only effects the
   * developer defaults, not the system or look and feel defaults.
   *
   * @param key    an <code>Object</code> specifying the retrieval key
   * @param value  the <code>Object</code> to store; refer to
   *               {@code UIDefaults} for details on how {@code null} is
   *               handled
   * @return the <code>Object</code> returned by {@link UIDefaults#put}
   * @throws NullPointerException if {@code key} is {@code null}
   * @see UIDefaults#put
   */
  static put(key: any, value: any): any {
    return UIManager.getDefaults().put(key, value);
  }
  /**
   * Returns the appropriate {@code ComponentUI} implementation for
   * {@code target}. Typically, this is a cover for
   * {@code getDefaults().getUI(target)}. However, if an auxiliary
   * look and feel has been installed, this first invokes
   * {@code getUI(target)} on the multiplexing look and feel's
   * defaults, and returns that value if it is {@code non-null}.
   *
   * @param target the <code>JComponent</code> to return the
   *        {@code ComponentUI} for
   * @return the <code>ComponentUI</code> object for {@code target}
   * @throws NullPointerException if {@code target} is {@code null}
   * @see UIDefaults#getUI
   */
  static getUI(target: JComponent): ComponentUI {
    UIManager.maybeInitialize();
    UIManager.maybeInitializeFocusPolicy(target);
    let ui = null;
    let multiLAF = UIManager.getLAFState().multiLookAndFeel;
    if (multiLAF != null) {
      ui = multiLAF.getDefaults().getUI(target);
    }
    if (ui == null) {
      ui = UIManager.getDefaults().getUI(target);
    }
    return ui;
  }
  /**
   * Returns the {@code UIDefaults} from the current look and feel,
   * that were obtained at the time the look and feel was installed.
   * <p>
   * In general, developers should use the {@code UIDefaults} returned from
   * {@code getDefaults()}. As the current look and feel may expect
   * certain values to exist, altering the {@code UIDefaults} returned
   * from this method could have unexpected results.
   *
   * @return <code>UIDefaults</code> from the current look and feel
   * @see #getDefaults
   * @see #setLookAndFeel(LookAndFeel)
   * @see LookAndFeel#getDefaults
   */
  static getLookAndFeelDefaults(): UIDefaults {
    UIManager.maybeInitialize();
    return UIManager.getLAFState().getLookAndFeelDefaults();
  }
  /**
   * Finds the Multiplexing <code>LookAndFeel</code>.
   */
  static getMultiLookAndFeel(): LookAndFeel {
    let multiLookAndFeel = UIManager.getLAFState().multiLookAndFeel;
    if (multiLookAndFeel == null) {
      let defaultName = 'javax.swing.plaf.multi.MultiLookAndFeel';
      let className = UIManager.getLAFState().swingProps.getProperty(UIManager.multiplexingLAFKey, defaultName);
      try {
        let lnfClass = SwingUtilities.loadSystemClass(className);
        multiLookAndFeel = lnfClass.newInstance();
      } catch ($e0) {
        if ($J.isa($e0, Exception)) {
          let exc = $J.exc($e0);
          $J.err.println('UIManager: failed loading ' + className);
        } else {
          throw $e0;
        }
      }
    }
    return multiLookAndFeel;
  }
  /**
   * Adds a <code>PropertyChangeListener</code> to the listener list.
   * The listener is registered for all properties.
   *
   * @param listener  the <code>PropertyChangeListener</code> to be added
   * @see java.beans.PropertyChangeSupport
   */
  static addPropertyChangeListener(listener: PropertyChangeListener): void {
    {
      UIManager.getLAFState().getPropertyChangeSupport(true).addPropertyChangeListener$PropertyChangeListener(listener);
    }
  }
  /**
   * Removes a <code>PropertyChangeListener</code> from the listener list.
   * This removes a <code>PropertyChangeListener</code> that was registered
   * for all properties.
   *
   * @param listener  the <code>PropertyChangeListener</code> to be removed
   * @see java.beans.PropertyChangeSupport
   */
  static removePropertyChangeListener(listener: PropertyChangeListener): void {
    {
      UIManager.getLAFState().getPropertyChangeSupport(true).removePropertyChangeListener$PropertyChangeListener(listener);
    }
  }
  static loadSwingProperties(): Properties {
    if ($J.cls(UIManager).getClassLoader() != null) {
      return new Properties();
    } else {
      let props = new Properties();
      AccessController.doPrivileged(new (UIManager$1())().$c(props));
      return props;
    }
  }
  static checkProperty(props: Properties, key: string): void {
    let value = $J.system_getProperty(key);
    if (value != null) {
      props.put(key, value);
    }
  }
  /**
   * If a <code>swing.properties</code> file exist and it has a
   * <code>swing.installedlafs</code> property
   * then initialize the <code>installedLAFs</code> field.
   *
   * @see #getInstalledLookAndFeels
   */
  static initializeInstalledLAFs(swingProps: Properties): void {
    let ilafsString = swingProps.getProperty(UIManager.installedLAFsKey);
    if (ilafsString == null) {
      return;
    }
    let lafs = new ArrayList();
    let st = new StringTokenizer(ilafsString, ',', false);
    while (st.hasMoreTokens()) {
      lafs.add(st.nextToken());
    }
    let ilafs = new ArrayList(lafs.size());
    for (const $it2 = lafs.iterator(); $it2.hasNext(); ) {
      let laf = $it2.next();
      let name = swingProps.getProperty(UIManager.makeInstalledLAFKey(laf, 'name'), laf);
      let cls = swingProps.getProperty(UIManager.makeInstalledLAFKey(laf, 'class'));
      if (cls != null) {
        ilafs.add(new UIManager$LookAndFeelInfo()._UIManager$LookAndFeelInfo(name, cls));
      }
    }
    let installedLAFs = $J.newArray(ilafs.size(), null);
    for (let i = 0; i < ilafs.size(); i++) {
      installedLAFs[i] = ilafs.get(i);
    }
    UIManager.getLAFState().installedLAFs = installedLAFs;
  }
  /**
   * If the user has specified a default look and feel, use that.
   * Otherwise use the look and feel that's native to this platform.
   * If this code is called after the application has explicitly
   * set it's look and feel, do nothing.
   *
   * @see #maybeInitialize
   */
  static initializeDefaultLAF(swingProps: Properties): void {
    if (UIManager.getLAFState().lookAndFeel != null) {
      return;
    }
    let lafName = null;
    let lafData = AppContext.getAppContext().remove('swing.lafdata');
    if (lafData != null) {
      lafName = lafData.remove('defaultlaf');
    }
    if (lafName == null) {
      lafName = UIManager.getCrossPlatformLookAndFeelClassName();
    }
    lafName = swingProps.getProperty(UIManager.defaultLAFKey, lafName);
    try {
      UIManager.setLookAndFeel$String(lafName);
    } catch ($e3) {
      if ($J.isa($e3, Exception)) {
        let e = $J.exc($e3);
        throw new JError('Cannot load ' + lafName);
      } else {
        throw $e3;
      }
    }
    if (lafData != null) {
      for (const $it4 = lafData.keySet().iterator(); $it4.hasNext(); ) {
        let key = $it4.next();
        UIManager.put(key, lafData.get(key));
      }
    }
  }
  static initializeAuxiliaryLAFs(swingProps: Properties): void {
    let auxLookAndFeelNames = swingProps.getProperty(UIManager.auxiliaryLAFsKey);
    if (auxLookAndFeelNames == null) {
      return;
    }
    let auxLookAndFeels = new Vector();
    let p = new StringTokenizer(auxLookAndFeelNames, ',');
    let factoryName: string;
    while (p.hasMoreTokens()) {
      let className = p.nextToken();
      try {
        let lnfClass = SwingUtilities.loadSystemClass(className);
        let newLAF = lnfClass.newInstance();
        newLAF.initialize();
        auxLookAndFeels.addElement(newLAF);
      } catch ($e5) {
        if ($J.isa($e5, Exception)) {
          let e = $J.exc($e5);
          $J.err.println('UIManager: failed loading auxiliary look and feel ' + className);
        } else {
          throw $e5;
        }
      }
    }
    if (auxLookAndFeels.size() === 0) {
      auxLookAndFeels = null;
    } else {
      UIManager.getLAFState().multiLookAndFeel = UIManager.getMultiLookAndFeel();
      if (UIManager.getLAFState().multiLookAndFeel == null) {
        auxLookAndFeels = null;
      }
    }
    UIManager.getLAFState().auxLookAndFeels = auxLookAndFeels;
  }
  static initializeSystemDefaults(swingProps: Properties): void {
    UIManager.getLAFState().swingProps = swingProps;
  }
  static maybeInitialize(): void {
    {
      if (!UIManager.getLAFState().initialized) {
        UIManager.getLAFState().initialized = true;
        UIManager.initialize();
      }
    }
  }
  static maybeInitializeFocusPolicy(comp: JComponent): void {
    if (comp instanceof JRootPane) {
      {
        if (!UIManager.getLAFState().focusPolicyInitialized) {
          UIManager.getLAFState().focusPolicyInitialized = true;
          if (FocusManager.isFocusManagerEnabled()) {
            KeyboardFocusManager.getCurrentKeyboardFocusManager$().setDefaultFocusTraversalPolicy(new LayoutFocusTraversalPolicy()._LayoutFocusTraversalPolicy$());
          }
        }
      }
    }
  }
  static initialize(): void {
    let swingProps = UIManager.loadSwingProperties();
    UIManager.initializeSystemDefaults(swingProps);
    UIManager.initializeDefaultLAF(swingProps);
    UIManager.initializeAuxiliaryLAFs(swingProps);
    UIManager.initializeInstalledLAFs(swingProps);
    if (RepaintManager.HANDLE_TOP_LEVEL_PAINT) {
      PaintEventDispatcher.setPaintEventDispatcher(new SwingPaintEventDispatcher()._SwingPaintEventDispatcher());
    }
    KeyboardFocusManager.getCurrentKeyboardFocusManager$().addKeyEventPostProcessor(new (UIManager$2())());
    AWTAccessor.getComponentAccessor().setRequestFocusController(JComponent.focusController);
  }
  static $clinit() {
    UIManager.classLock = new JObject();
    let iLAFs = new ArrayList(4);
    iLAFs.add(new UIManager$LookAndFeelInfo()._UIManager$LookAndFeelInfo('Metal', 'javax.swing.plaf.metal.MetalLookAndFeel'));
    iLAFs.add(new UIManager$LookAndFeelInfo()._UIManager$LookAndFeelInfo('Nimbus', 'javax.swing.plaf.nimbus.NimbusLookAndFeel'));
    iLAFs.add(new UIManager$LookAndFeelInfo()._UIManager$LookAndFeelInfo('CDE/Motif', 'com.sun.java.swing.plaf.motif.MotifLookAndFeel'));
    let osType = OSInfo.getOSType();
    if (osType === OSInfo$OSType.WINDOWS) {
      iLAFs.add(new UIManager$LookAndFeelInfo()._UIManager$LookAndFeelInfo('Windows', 'com.sun.java.swing.plaf.windows.WindowsLookAndFeel'));
      if (Toolkit.getDefaultToolkit().getDesktopProperty('win.xpstyle.themeActive') != null) {
        iLAFs.add(new UIManager$LookAndFeelInfo()._UIManager$LookAndFeelInfo('Windows Classic', 'com.sun.java.swing.plaf.windows.WindowsClassicLookAndFeel'));
      }
    } else if (osType === OSInfo$OSType.MACOSX) {
      iLAFs.add(new UIManager$LookAndFeelInfo()._UIManager$LookAndFeelInfo('Mac OS X', 'com.apple.laf.AquaLookAndFeel'));
    } else {
      iLAFs.add(new UIManager$LookAndFeelInfo()._UIManager$LookAndFeelInfo('GTK+', 'com.sun.java.swing.plaf.gtk.GTKLookAndFeel'));
    }
    UIManager.installedLAFs = $J.toArrayInto(iLAFs.toArray(), $J.newArray(iLAFs.size(), null));
  }
}

/**
 * This class defines the state managed by the <code>UIManager</code>.  For
 * Swing applications the fields in this class could just as well
 * be static members of <code>UIManager</code> however we give them
 * "AppContext"
 * scope instead so that applets (and potentially multiple lightweight
 * applications running in a single VM) have their own state. For example,
 * an applet can alter its look and feel, see <code>setLookAndFeel</code>.
 * Doing so has no affect on other applets (or the browser).
 */
export class UIManager$LAFState extends JObject {
  swingProps: Properties = null;
  tables: UIDefaults[] = null;
  initialized: boolean = false;
  focusPolicyInitialized: boolean = false;
  multiUIDefaults: MultiUIDefaults = null;
  lookAndFeel: LookAndFeel = null;
  multiLookAndFeel: LookAndFeel = null;
  auxLookAndFeels: Vector<LookAndFeel> = null;
  changeSupport: SwingPropertyChangeSupport = null;
  installedLAFs: UIManager$LookAndFeelInfo[] = null;
  _UIManager$LAFState(): this {
    this.tables = $J.newArray(2, null);
    this.initialized = false;
    this.focusPolicyInitialized = false;
    this.multiUIDefaults = new MultiUIDefaults()._MultiUIDefaults$UIDefaultsArr(this.tables);
    this.multiLookAndFeel = null;
    this.auxLookAndFeels = null;
    return this;
  }
  getLookAndFeelDefaults(): UIDefaults {
    return this.tables[0];
  }
  setLookAndFeelDefaults(x: UIDefaults): void {
    this.tables[0] = x;
  }
  /**
   * Returns the SwingPropertyChangeSupport for the current
   * AppContext.  If <code>create</code> is a true, a non-null
   * <code>SwingPropertyChangeSupport</code> will be returned, if
   * <code>create</code> is false and this has not been invoked
   * with true, null will be returned.
   */
  getPropertyChangeSupport(create: boolean): SwingPropertyChangeSupport {
    if (create && this.changeSupport == null) {
      this.changeSupport = new SwingPropertyChangeSupport()._SwingPropertyChangeSupport$Object($J.cls(UIManager));
    }
    return this.changeSupport;
  }
}

/**
 * Provides a little information about an installed
 * <code>LookAndFeel</code> for the sake of configuring a menu or
 * for initial application set up.
 *
 * @see UIManager#getInstalledLookAndFeels
 * @see LookAndFeel
 */
export class UIManager$LookAndFeelInfo extends JObject {
  name: string = null;
  className: string = null;
  /**
   * Constructs a <code>UIManager</code>s
   * <code>LookAndFeelInfo</code> object.
   *
   * @param name      a <code>String</code> specifying the name of
   *                      the look and feel
   * @param className a <code>String</code> specifying the name of
   *                      the class that implements the look and feel
   */
  _UIManager$LookAndFeelInfo(name: string, className: string): this {
    this.name = name;
    this.className = className;
    return this;
  }
  /**
   * Returns the name of the look and feel in a form suitable
   * for a menu or other presentation
   * @return a <code>String</code> containing the name
   * @see LookAndFeel#getName
   */
  getName(): string {
    return this.name;
  }
  /**
   * Returns the name of the class that implements this look and feel.
   * @return the name of the class that implements this
   *              <code>LookAndFeel</code>
   * @see LookAndFeel
   */
  getClassName(): string {
    return this.className;
  }
  /**
   * Returns a string that displays and identifies this
   * object's properties.
   *
   * @return a <code>String</code> representation of this object
   */
  toString(): string {
    return $J.getClass(this).getName() + '[' + this.getName() + ' ' + this.getClassName() + ']';
  }
}

let $UIManager$1: any = null;
/** An anonymous class (UIManager.java:1288). */
function UIManager$1(): any {
  return $UIManager$1 ??= $J.local(class extends JObject {
    run(): any {
      if (OSInfo.getOSType() === OSInfo$OSType.MACOSX) {
        this.$cv_props.put(UIManager.defaultLAFKey, UIManager.getSystemLookAndFeelClassName());
      }
      try {
        let file = new File(UIManager.makeSwingPropertiesFilename());
        if (file.exists()) {
          {
            const ins = new FileInputStream(file);
            try {
              this.$cv_props.load(ins);
            } finally {
              if (ins != null) ins.close();
            }
          }
        }
      } catch ($e1) {
        if ($J.isa($e1, Exception)) {
          let e = $J.exc($e1);
        } else {
          throw $e1;
        }
      }
      UIManager.checkProperty(this.$cv_props, UIManager.defaultLAFKey);
      UIManager.checkProperty(this.$cv_props, UIManager.auxiliaryLAFsKey);
      UIManager.checkProperty(this.$cv_props, UIManager.multiplexingLAFKey);
      UIManager.checkProperty(this.$cv_props, UIManager.installedLAFsKey);
      UIManager.checkProperty(this.$cv_props, UIManager.disableMnemonicKey);
      return null;
    }
    $c($props): this {
      this.$cv_props = $props;
      return this;
    }
  }, 'javax.swing.UIManager$1', ['java.security.PrivilegedAction']);
}

let $UIManager$2: any = null;
/** An anonymous class (UIManager.java:1538). */
function UIManager$2(): any {
  return $UIManager$2 ??= $J.local(class extends JObject {
    postProcessKeyEvent(e: KeyEvent): boolean {
      let c = e.getComponent();
      if ((!(c instanceof JComponent) || (c != null && !c.isEnabled())) && JComponent$KeyboardState.shouldProcess(e) && SwingUtilities.processKeyBindings(e)) {
        e.consume();
        return true;
      }
      return false;
    }
  }, 'javax.swing.UIManager$2', ['java.awt.KeyEventPostProcessor']);
}

$J.define(UIManager, 'javax.swing.UIManager', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_UIManager' }, meths: { 'get(java.lang.Object,java.util.Locale)': 'get$Object$Locale', 'get(java.lang.Object)': 'get$Object', 'getDimension(java.lang.Object,java.util.Locale)': 'getDimension$Object$Locale', 'getDimension(java.lang.Object)': 'getDimension$Object', 'getInsets(java.lang.Object,java.util.Locale)': 'getInsets$Object$Locale', 'getInsets(java.lang.Object)': 'getInsets$Object', 'getBoolean(java.lang.Object,java.util.Locale)': 'getBoolean$Object$Locale', 'getBoolean(java.lang.Object)': 'getBoolean$Object', 'getInt(java.lang.Object,java.util.Locale)': 'getInt$Object$Locale', 'getInt(java.lang.Object)': 'getInt$Object', 'getString(java.lang.Object,java.awt.Component)': 'getString$Object$Component', 'getString(java.lang.Object,java.util.Locale)': 'getString$Object$Locale', 'getString(java.lang.Object)': 'getString$Object', 'getBorder(java.lang.Object,java.util.Locale)': 'getBorder$Object$Locale', 'getBorder(java.lang.Object)': 'getBorder$Object', 'getIcon(java.lang.Object,java.util.Locale)': 'getIcon$Object$Locale', 'getIcon(java.lang.Object)': 'getIcon$Object', 'getColor(java.lang.Object,java.util.Locale)': 'getColor$Object$Locale', 'getColor(java.lang.Object)': 'getColor$Object', 'getFont(java.lang.Object,java.util.Locale)': 'getFont$Object$Locale', 'getFont(java.lang.Object)': 'getFont$Object', 'setLookAndFeel(java.lang.String)': 'setLookAndFeel$String', 'setLookAndFeel(javax.swing.LookAndFeel)': 'setLookAndFeel$LookAndFeel', 'installLookAndFeel(java.lang.String,java.lang.String)': 'installLookAndFeel$String$String', 'installLookAndFeel(javax.swing.UIManager$LookAndFeelInfo)': 'installLookAndFeel$LookAndFeelInfo' }, clinit: true, lazy: ['classLock', 'installedLAFs'] });
$J.define(UIManager$LAFState, 'javax.swing.UIManager$LAFState', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_UIManager$LAFState' } });
$J.define(UIManager$LookAndFeelInfo, 'javax.swing.UIManager$LookAndFeelInfo', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.String,java.lang.String': '_UIManager$LookAndFeelInfo' } });
$J.module(() => {
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  FocusManager = $J.load('javax.swing.FocusManager');
  JComponent = $J.load('javax.swing.JComponent');
  JComponent$KeyboardState = $J.load('javax.swing.JComponent$KeyboardState');
  JRootPane = $J.load('javax.swing.JRootPane');
  LayoutFocusTraversalPolicy = $J.load('javax.swing.LayoutFocusTraversalPolicy');
  MultiUIDefaults = $J.load('javax.swing.MultiUIDefaults');
  RepaintManager = $J.load('javax.swing.RepaintManager');
  SwingPaintEventDispatcher = $J.load('javax.swing.SwingPaintEventDispatcher');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UnsupportedLookAndFeelException = $J.load('javax.swing.UnsupportedLookAndFeelException');
  SwingPropertyChangeSupport = $J.load('javax.swing.event.SwingPropertyChangeSupport');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  OSInfo = $J.load('sun.awt.OSInfo');
  OSInfo$OSType = $J.load('sun.awt.OSInfo$OSType');
  PaintEventDispatcher = $J.load('sun.awt.PaintEventDispatcher');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
