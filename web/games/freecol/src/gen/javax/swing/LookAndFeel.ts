// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/LookAndFeel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2017, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, SunToolkit, Toolkit } from '../../../jre/index.ts';

let GrayFilter, ImageIcon, KeyStroke, UIManager, ComponentInputMapUIResource, InputMapUIResource, UIResource, ImageIconUIResource;

/**
 * {@code LookAndFeel}, as the name implies, encapsulates a look and
 * feel. Beyond installing a look and feel most developers never need to
 * interact directly with {@code LookAndFeel}. In general only developers
 * creating a custom look and feel need to concern themselves with this class.
 * <p>
 * Swing is built upon the foundation that each {@code JComponent}
 * subclass has an implementation of a specific {@code ComponentUI}
 * subclass. The {@code ComponentUI} is often referred to as "the ui",
 * "component ui", or "look and feel delegate". The {@code ComponentUI}
 * subclass is responsible for providing the look and feel specific
 * functionality of the component. For example, {@code JTree} requires
 * an implementation of the {@code ComponentUI} subclass {@code
 * TreeUI}. The implementation of the specific {@code
 * ComponentUI} subclass is provided by the {@code LookAndFeel}. Each
 * {@code JComponent} subclass identifies the {@code ComponentUI}
 * subclass it requires by way of the {@code JComponent} method {@code
 * getUIClassID}.
 * <p>
 * Each {@code LookAndFeel} implementation must provide
 * an implementation of the appropriate {@code ComponentUI} subclass by
 * specifying a value for each of Swing's ui class ids in the {@code
 * UIDefaults} object returned from {@code getDefaults}. For example,
 * {@code BasicLookAndFeel} uses {@code BasicTreeUI} as the concrete
 * implementation for {@code TreeUI}. This is accomplished by {@code
 * BasicLookAndFeel} providing the key-value pair {@code
 * "TreeUI"-"javax.swing.plaf.basic.BasicTreeUI"}, in the
 * {@code UIDefaults} returned from {@code getDefaults}. Refer to
 * {@link UIDefaults#getUI(JComponent)} for details on how the implementation
 * of the {@code ComponentUI} subclass is obtained.
 * <p>
 * When a {@code LookAndFeel} is installed the {@code UIManager} does
 * not check that an entry exists for all ui class ids. As such,
 * random exceptions will occur if the current look and feel has not
 * provided a value for a particular ui class id and an instance of
 * the {@code JComponent} subclass is created.
 *
 * <h2>Recommendations for Look and Feels</h2>
 *
 * As noted in {@code UIManager} each {@code LookAndFeel} has the opportunity
 * to provide a set of defaults that are layered in with developer and
 * system defaults. Some of Swing's components require the look and feel
 * to provide a specific set of defaults. These are documented in the
 * classes that require the specific default.
 *
 * <h3><a id="defaultRecommendation">ComponentUIs and defaults</a></h3>
 *
 * All {@code ComponentUIs} typically need to set various properties
 * on the {@code JComponent} the {@code ComponentUI} is providing the
 * look and feel for. This is typically done when the {@code
 * ComponentUI} is installed on the {@code JComponent}. Setting a
 * property should only be done if the developer has not set the
 * property. For non-primitive values it is recommended that the
 * {@code ComponentUI} only change the property on the {@code
 * JComponent} if the current value is {@code null} or implements
 * {@code UIResource}. If the current value is {@code null} or
 * implements {@code UIResource} it indicates the property has not
 * been set by the developer, and the ui is free to change it.  For
 * example, {@code BasicButtonUI.installDefaults} only changes the
 * font on the {@code JButton} if the return value from {@code
 * button.getFont()} is {@code null} or implements {@code
 * UIResource}. On the other hand if {@code button.getFont()} returned
 * a {@code non-null} value that did not implement {@code UIResource}
 * then {@code BasicButtonUI.installDefaults} would not change the
 * {@code JButton}'s font.
 * <p>
 * For primitive values, such as {@code opaque}, the method {@code
 * installProperty} should be invoked.  {@code installProperty} only changes
 * the corresponding property if the value has not been changed by the
 * developer.
 * <p>
 * {@code ComponentUI} implementations should use the various install methods
 * provided by this class as they handle the necessary checking and install
 * the property using the recommended guidelines.
 *
 * <h3><a id="exceptions"></a>Exceptions</h3>
 *
 * All of the install methods provided by {@code LookAndFeel} need to
 * access the defaults if the value of the property being changed is
 * {@code null} or a {@code UIResource}. For example, installing the
 * font does the following:
 * <pre>
 *   JComponent c;
 *   Font font = c.getFont();
 *   if (font == null || (font instanceof UIResource)) {
 *       c.setFont(UIManager.getFont("fontKey"));
 *   }
 * </pre>
 * If the font is {@code null} or a {@code UIResource}, the
 * defaults table is queried with the key {@code fontKey}. All of
 * {@code UIDefault's} get methods throw a {@code
 * NullPointerException} if passed in {@code null}. As such, unless
 * otherwise noted each of the various install methods of {@code
 * LookAndFeel} throw a {@code NullPointerException} if the current
 * value is {@code null} or a {@code UIResource} and the supplied
 * defaults key is {@code null}. In addition, unless otherwise specified
 * all of the {@code install} methods throw a {@code NullPointerException} if
 * a {@code null} component is passed in.
 *
 * @author Tom Ball
 * @author Hans Muller
 * @since 1.2
 */
export class LookAndFeel extends JObject {
  /**
   * Constructor for subclasses to call.
   */
  _LookAndFeel(): this {
    return this;
  }
  /**
   * Convenience method for setting a component's foreground
   * and background color properties with values from the
   * defaults.  The properties are only set if the current
   * value is either {@code null} or a {@code UIResource}.
   *
   * @param c component to set the colors on
   * @param defaultBgName key for the background
   * @param defaultFgName key for the foreground
   *
   * @see #installColorsAndFont
   * @see UIManager#getColor
   * @throws NullPointerException as described in
   *         <a href="#exceptions">exceptions</a>
   */
  static installColors(c: JComponent, defaultBgName: string, defaultFgName: string): void {
    let bg = c.getBackground();
    if (bg == null || $J.isa(bg, UIResource)) {
      c.setBackground(UIManager.getColor$Object(defaultBgName));
    }
    let fg = c.getForeground();
    if (fg == null || $J.isa(fg, UIResource)) {
      c.setForeground(UIManager.getColor$Object(defaultFgName));
    }
  }
  /**
   * Convenience method for setting a component's foreground,
   * background and font properties with values from the
   * defaults.  The properties are only set if the current
   * value is either {@code null} or a {@code UIResource}.
   *
   * @param c component set to the colors and font on
   * @param defaultBgName key for the background
   * @param defaultFgName key for the foreground
   * @param defaultFontName key for the font
   * @throws NullPointerException as described in
   *         <a href="#exceptions">exceptions</a>
   *
   * @see #installColors
   * @see UIManager#getColor
   * @see UIManager#getFont
   */
  static installColorsAndFont(c: JComponent, defaultBgName: string, defaultFgName: string, defaultFontName: string): void {
    let f = c.getFont();
    if (f == null || $J.isa(f, UIResource)) {
      c.setFont(UIManager.getFont$Object(defaultFontName));
    }
    LookAndFeel.installColors(c, defaultBgName, defaultFgName);
  }
  /**
   * Convenience method for setting a component's border property with
   * a value from the defaults. The border is only set if the border is
   * {@code null} or an instance of {@code UIResource}.
   *
   * @param c component to set the border on
   * @param defaultBorderName key specifying the border
   * @throws NullPointerException as described in
   *         <a href="#exceptions">exceptions</a>
   */
  static installBorder(c: JComponent, defaultBorderName: string): void {
    let b = c.getBorder();
    if (b == null || $J.isa(b, UIResource)) {
      c.setBorder(UIManager.getBorder$Object(defaultBorderName));
    }
  }
  /**
   * Convenience method for uninstalling a border. If the border of
   * the component is a {@code UIResource}, it is set to {@code
   * null}.
   *
   * @param c component to uninstall the border on
   * @throws NullPointerException if {@code c} is {@code null}
   */
  static uninstallBorder(c: JComponent): void {
    if ($J.isa(c.getBorder(), UIResource)) {
      c.setBorder(null);
    }
  }
  /**
   * Convenience method for installing a property with the specified name
   * and value on a component if that property has not already been set
   * by the developer.  This method is intended to be used by
   * ui delegate instances that need to specify a default value for a
   * property of primitive type (boolean, int, ..), but do not wish
   * to override a value set by the client.  Since primitive property
   * values cannot be wrapped with the {@code UIResource} marker, this method
   * uses private state to determine whether the property has been set
   * by the client.
   *
   * @throws IllegalArgumentException if the specified property is not
   *         one which can be set using this method
   * @throws ClassCastException if the property value has not been set
   *         by the developer and the type does not match the property's type
   * @throws NullPointerException if {@code c} is {@code null}, or the
   *         named property has not been set by the developer and
   *         {@code propertyValue} is {@code null}
   * @param c target component to set the property on
   * @param propertyName name of the property to set
   * @param propertyValue value of the property
   * @since 1.5
   */
  static installProperty(c: JComponent, propertyName: string, propertyValue: any): void {
    if (SunToolkit.isInstanceOf(c, 'javax.swing.JPasswordField')) {
      if (!(c).customSetUIProperty(propertyName, propertyValue)) {
        c.setUIProperty(propertyName, propertyValue);
      }
    } else {
      c.setUIProperty(propertyName, propertyValue);
    }
  }
  /**
   * Creates an {@code InputMapUIResource} from <code>keys</code>. This is
   * a convenience method for creating a new {@code InputMapUIResource},
   * invoking {@code loadKeyBindings(map, keys)}, and returning the
   * {@code InputMapUIResource}.
   *
   * @param keys alternating pairs of {@code keystroke-action key}
   *        pairs as described in {@link #loadKeyBindings}
   * @return newly created and populated {@code InputMapUIResource}
   * @see #loadKeyBindings
   *
   * @since 1.3
   */
  static makeInputMap(keys: any[]): InputMap {
    let retMap = new InputMapUIResource()._InputMapUIResource();
    LookAndFeel.loadKeyBindings(retMap, keys);
    return retMap;
  }
  /**
   * Creates a {@code ComponentInputMapUIResource} from
   * <code>keys</code>. This is a convenience method for creating a
   * new {@code ComponentInputMapUIResource}, invoking {@code
   * loadKeyBindings(map, keys)}, and returning the {@code
   * ComponentInputMapUIResource}.
   *
   * @param c component to create the {@code ComponentInputMapUIResource}
   *          with
   * @param keys alternating pairs of {@code keystroke-action key}
   *        pairs as described in {@link #loadKeyBindings}
   * @return newly created and populated {@code InputMapUIResource}
   * @throws IllegalArgumentException if {@code c} is {@code null}
   *
   * @see #loadKeyBindings
   * @see ComponentInputMapUIResource
   *
   * @since 1.3
   */
  static makeComponentInputMap(c: JComponent, keys: any[]): ComponentInputMap {
    let retMap = new ComponentInputMapUIResource()._ComponentInputMapUIResource(c);
    LookAndFeel.loadKeyBindings(retMap, keys);
    return retMap;
  }
  /**
   * Populates an {@code InputMap} with the specified bindings.
   * The bindings are supplied as a list of alternating
   * {@code keystroke-action key} pairs. The {@code keystroke} is either
   * an instance of {@code KeyStroke}, or a {@code String}
   * that identifies the {@code KeyStroke} for the binding. Refer
   * to {@code KeyStroke.getKeyStroke(String)} for the specific
   * format. The {@code action key} part of the pair is the key
   * registered in the {@code InputMap} for the {@code KeyStroke}.
   * <p>
   * The following illustrates loading an {@code InputMap} with two
   * {@code key-action} pairs:
   * <pre>
   *   LookAndFeel.loadKeyBindings(inputMap, new Object[] {
   *     "control X", "cut",
   *     "control V", "paste"
   *   });
   * </pre>
   * <p>
   * Supplying a {@code null} list of bindings ({@code keys}) does not
   * change {@code retMap} in any way.
   * <p>
   * Specifying a {@code null} {@code action key} results in
   * removing the {@code keystroke's} entry from the {@code InputMap}.
   * A {@code null} {@code keystroke} is ignored.
   *
   * @param retMap {@code InputMap} to add the {@code key-action}
   *               pairs to
   * @param keys bindings to add to {@code retMap}
   * @throws NullPointerException if {@code keys} is
   *         {@code non-null}, not empty, and {@code retMap} is
   *         {@code null}
   *
   * @see KeyStroke#getKeyStroke(String)
   * @see InputMap
   *
   * @since 1.3
   */
  static loadKeyBindings(retMap: InputMap, keys: any[]): void {
    if (keys != null) {
      for (let counter = 0, maxCounter = keys.length; counter < maxCounter; counter++) {
        let keyStrokeO = keys[counter++];
        let ks = (keyStrokeO instanceof KeyStroke) ? keyStrokeO : KeyStroke.getKeyStroke$String(keyStrokeO);
        retMap.put(ks, keys[counter]);
      }
    }
  }
  /**
   * Invoked when the user attempts an invalid operation,
   * such as pasting into an uneditable <code>JTextField</code>
   * that has focus. The default implementation beeps. Subclasses
   * that wish different behavior should override this and provide
   * the additional feedback.
   *
   * @param component the <code>Component</code> the error occurred in,
   *                  may be <code>null</code>
   *                  indicating the error condition is not directly
   *                  associated with a <code>Component</code>
   * @since 1.4
   */
  provideErrorFeedback(component: Component): void {
    let toolkit = null;
    if (component != null) {
      toolkit = component.getToolkit();
    } else {
      toolkit = Toolkit.getDefaultToolkit();
    }
    toolkit.beep();
  }
  /**
   * Returns an <code>Icon</code> with a disabled appearance.
   * This method is used to generate a disabled <code>Icon</code> when
   * one has not been specified.  For example, if you create a
   * <code>JButton</code> and only specify an <code>Icon</code> via
   * <code>setIcon</code> this method will be called to generate the
   * disabled <code>Icon</code>. If {@code null} is passed as
   * <code>icon</code> this method returns {@code null}.
   * <p>
   * Some look and feels might not render the disabled {@code Icon}, in which
   * case they will ignore this.
   *
   * @param component {@code JComponent} that will display the {@code Icon},
   *         may be {@code null}
   * @param icon {@code Icon} to generate the disabled icon from
   * @return disabled {@code Icon}, or {@code null} if a suitable
   *         {@code Icon} can not be generated
   * @since 1.5
   */
  getDisabledIcon(component: JComponent, icon: Icon): Icon {
    if (icon instanceof ImageIcon) {
      return new ImageIconUIResource()._ImageIconUIResource$Image(GrayFilter.createDisabledImage((icon).getImage()));
    }
    return null;
  }
  /**
   * Returns an <code>Icon</code> for use by disabled
   * components that are also selected. This method is used to generate an
   * <code>Icon</code> for components that are in both the disabled and
   * selected states but do not have a specific <code>Icon</code> for this
   * state.  For example, if you create a <code>JButton</code> and only
   * specify an <code>Icon</code> via <code>setIcon</code> this method
   * will be called to generate the disabled and selected
   * <code>Icon</code>. If {@code null} is passed as <code>icon</code> this
   * methods returns {@code null}.
   * <p>
   * Some look and feels might not render the disabled and selected
   * {@code Icon}, in which case they will ignore this.
   *
   * @param component {@code JComponent} that will display the {@code Icon},
   *        may be {@code null}
   * @param icon {@code Icon} to generate disabled and selected icon from
   * @return disabled and selected icon, or {@code null} if a suitable
   *         {@code Icon} can not be generated.
   * @since 1.5
   */
  getDisabledSelectedIcon(component: JComponent, icon: Icon): Icon {
    return this.getDisabledIcon(component, icon);
  }
  /**
   * Returns a string that displays and identifies this
   * object's properties.
   *
   * @return a String representation of this object
   */
  toString(): string {
    return '[' + this.getDescription() + ' - ' + $J.getClass(this).getName() + ']';
  }
}

$J.define(LookAndFeel, 'javax.swing.LookAndFeel', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_LookAndFeel' } });
$J.module(() => {
  GrayFilter = $J.load('javax.swing.GrayFilter');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  UIManager = $J.load('javax.swing.UIManager');
  ComponentInputMapUIResource = $J.load('javax.swing.plaf.ComponentInputMapUIResource');
  InputMapUIResource = $J.load('javax.swing.plaf.InputMapUIResource');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  ImageIconUIResource = $J.load('sun.swing.ImageIconUIResource');
});
