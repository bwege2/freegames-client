// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/accessibility/AccessibleBundle.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2019, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ClassCastException, JObject, Locale, MissingResourceException, ResourceBundle } from '../../../jre/index.ts';

let AWTAccessor;

/**
 * Base class used to maintain a strongly typed enumeration. This is the
 * superclass of {@link AccessibleState} and {@link AccessibleRole}.
 * <p>
 * The {@link #toDisplayString()} method allows you to obtain the localized
 * string for a locale independent key from a predefined {@code ResourceBundle}
 * for the keys defined in this class. This localized string is intended to be
 * readable by humans.
 *
 * @author Willie Walker
 * @author Peter Korn
 * @author Lynn Monsanto
 * @see AccessibleRole
 * @see AccessibleState
 */
export class AccessibleBundle extends JObject {
  defaultResourceBundleName: string = null;
  /**
   * The locale independent name of the state. This is a programmatic name
   * that is not intended to be read by humans.
   *
   * @see #toDisplayString
   */
  key: string = null;
  /**
   * Construct an {@code AccessibleBundle}.
   */
  _AccessibleBundle(): this {
    this.defaultResourceBundleName = 'com.sun.accessibility.internal.resources.accessibility';
    this.key = null;
    return this;
  }
  /**
   * Obtains the key as a localized string. If a localized string cannot be
   * found for the key, the locale independent key stored in the role will be
   * returned. This method is intended to be used only by subclasses so that
   * they can specify their own resource bundles which contain localized
   * strings for their keys.
   *
   * @param  name the name of the resource bundle to use for lookup
   * @param  locale the locale for which to obtain a localized string
   * @return a localized string for the key
   */
  toDisplayString$String$Locale(name: string, locale: Locale): string {
    try {
      return ResourceBundle.getBundle(name, locale).getString(this.key);
    } catch ($e0) {
      if ($J.isa($e0, ClassCastException) || $J.isa($e0, MissingResourceException)) {
        let ignored = $J.exc($e0);
        return this.key;
      } else {
        throw $e0;
      }
    }
  }
  /**
   * Obtains the key as a localized string. If a localized string cannot be
   * found for the key, the locale independent key stored in the role will be
   * returned.
   *
   * @param  locale the locale for which to obtain a localized string
   * @return a localized string for the key
   */
  toDisplayString$Locale(locale: Locale): string {
    return this.toDisplayString$String$Locale(this.defaultResourceBundleName, locale);
  }
  /**
   * Gets localized string describing the key using the default locale.
   *
   * @return a localized string describing the key using the default locale
   */
  toDisplayString$(): string {
    return this.toDisplayString$Locale(Locale.getDefault());
  }
  /**
   * Gets localized string describing the key using the default locale.
   *
   * @return a localized string describing the key using the default locale
   * @see #toDisplayString
   */
  toString(): string {
    return this.toDisplayString$();
  }
  static $clinit() {
    AWTAccessor.setAccessibleBundleAccessor(new (AccessibleBundle$1())());
  }
}

let $AccessibleBundle$1: any = null;
/** An anonymous class (AccessibleBundle.java:56). */
function AccessibleBundle$1(): any {
  return $AccessibleBundle$1 ??= $J.local(class extends JObject {
  }, 'javax.accessibility.AccessibleBundle$1', ['sun.awt.AWTAccessor$AccessibleBundleAccessor']);
}

$J.define(AccessibleBundle, 'javax.accessibility.AccessibleBundle', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_AccessibleBundle' }, meths: { 'toDisplayString()': 'toDisplayString$', 'toDisplayString(java.util.Locale)': 'toDisplayString$Locale', 'toDisplayString(java.lang.String,java.util.Locale)': 'toDisplayString$String$Locale' }, clinit: true, lazy: [] });
$J.module(() => {
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
});
