// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/ClientPropertyKey.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2006, 2012, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JEnum, JObject } from '../../../jre/index.ts';

let AWTAccessor;

/**
 * An enumeration for keys used as client properties within the Swing
 * implementation.
 * <p>
 * This enum holds only a small subset of the keys currently used within Swing,
 * but we may move more of them here in the future.
 * <p>
 * Adding an item to, and using, this class instead of {@code String} for
 * client properties protects against conflicts with developer-set client
 * properties. Using this class also avoids a problem with {@code StringBuilder}
 * and {@code StringBuffer} keys, whereby the keys are not recognized upon
 * deserialization.
 * <p>
 * When a client property value associated with one of these keys does not
 * implement {@code Serializable}, the result during serialization depends
 * on how the key is defined here. Historically, client properties with values
 * not implementing {@code Serializable} have simply been dropped and left out
 * of the serialized representation. To define keys with such behavior in this
 * enum, provide a value of {@code false} for the {@code reportValueNotSerializable}
 * property. When migrating existing properties to this enum, one may wish to
 * consider using this by default, to preserve backward compatibility.
 * <p>
 * To instead have a {@code NotSerializableException} thrown when a
 * {@code non-Serializable} property is encountered, provide the value of
 * {@code true} for the {@code reportValueNotSerializable} property. This
 * is useful when the property represents something that the developer
 * needs to know about when it cannot be serialized.
 *
 * @author  Shannon Hickey
 */
export class ClientPropertyKey extends JEnum {
  /**
   * Whether or not a {@code NotSerializableException} should be thrown
   * during serialization, when the value associated with this key does
   * not implement {@code Serializable}.
   */
  reportValueNotSerializable: boolean = false;
  static JComponent_INPUT_VERIFIER: ClientPropertyKey = null;
  static JComponent_TRANSFER_HANDLER: ClientPropertyKey = null;
  static JComponent_ANCESTOR_NOTIFIER: ClientPropertyKey = null;
  static PopupFactory_FORCE_HEAVYWEIGHT_POPUP: ClientPropertyKey = null;
  static $VALUES: ClientPropertyKey[] = null;
  /**
   * Constructs a key with the {@code reportValueNotSerializable} property
   * set to the given value.
   */
  _ClientPropertyKey$boolean($name: string, $ordinal: number, reportValueNotSerializable: boolean): this {
    this._JEnum($name, $ordinal);
    this.reportValueNotSerializable = reportValueNotSerializable;
    return this;
  }
  static values(): ClientPropertyKey[] { return ClientPropertyKey.$VALUES.slice(); }
  static valueOf(name: string): ClientPropertyKey { return $J.enumValueOf(ClientPropertyKey, name); }
  static $clinit() {
    ClientPropertyKey.JComponent_INPUT_VERIFIER = new ClientPropertyKey()._ClientPropertyKey$boolean('JComponent_INPUT_VERIFIER', 0, true);
    ClientPropertyKey.JComponent_TRANSFER_HANDLER = new ClientPropertyKey()._ClientPropertyKey$boolean('JComponent_TRANSFER_HANDLER', 1, true);
    ClientPropertyKey.JComponent_ANCESTOR_NOTIFIER = new ClientPropertyKey()._ClientPropertyKey$boolean('JComponent_ANCESTOR_NOTIFIER', 2, true);
    ClientPropertyKey.PopupFactory_FORCE_HEAVYWEIGHT_POPUP = new ClientPropertyKey()._ClientPropertyKey$boolean('PopupFactory_FORCE_HEAVYWEIGHT_POPUP', 3, true);
    ClientPropertyKey.$VALUES = [ClientPropertyKey.JComponent_INPUT_VERIFIER, ClientPropertyKey.JComponent_TRANSFER_HANDLER, ClientPropertyKey.JComponent_ANCESTOR_NOTIFIER, ClientPropertyKey.PopupFactory_FORCE_HEAVYWEIGHT_POPUP];
    AWTAccessor.setClientPropertyKeyAccessor(new (ClientPropertyKey$1())());
  }
}

let $ClientPropertyKey$1: any = null;
/** An anonymous class (ClientPropertyKey.java:93). */
function ClientPropertyKey$1(): any {
  return $ClientPropertyKey$1 ??= $J.local(class extends JObject {
  }, 'javax.swing.ClientPropertyKey$1', ['sun.awt.AWTAccessor$ClientPropertyKeyAccessor']);
}

$J.define(ClientPropertyKey, 'javax.swing.ClientPropertyKey', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'boolean': '_ClientPropertyKey$boolean', '': '_ClientPropertyKey$' }, clinit: true, lazy: ['$VALUES', 'JComponent_INPUT_VERIFIER', 'JComponent_TRANSFER_HANDLER', 'JComponent_ANCESTOR_NOTIFIER', 'PopupFactory_FORCE_HEAVYWEIGHT_POPUP'] });
$J.module(() => {
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
});
