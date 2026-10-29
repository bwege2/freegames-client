// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/DebugSettings.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1999, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ByteArrayOutputStream, JObject, JString, PlatformLogger, PrintStream, Properties } from '../../../jre/index.ts';

export class DebugSettings extends JObject {
  static log: PlatformLogger = null;
  static readonly PREFIX: string = 'awtdebug';
  static readonly PROP_FILE: string = 'properties';
  static DEFAULT_PROPS: string[] = null;
  static instance: DebugSettings = null;
  props: Properties = null;
  static readonly PROP_CTRACE: string = 'ctrace';
  static PROP_CTRACE_LEN: number = 0;
  _DebugSettings(): this {
    this.props = new Properties();
    return this;
  }
  static getInstance(): DebugSettings {
    return DebugSettings.instance;
  }
  toString(): string {
    let bout = new ByteArrayOutputStream();
    let pout = new PrintStream(bout);
    for (const $it0 = this.props.stringPropertyNames().iterator(); $it0.hasNext(); ) {
      let key = $it0.next();
      let value = this.props.getProperty(key, '');
      pout.println(key + ' = ' + value);
    }
    return bout.toString();
  }
  /**
   * Gets named boolean property
   * @param key       Name of property
   * @param defval    Default value if property does not exist
   * @return boolean value of the named property
   */
  getBoolean(key: string, defval: boolean): boolean {
    let value = this.getString(key, String(defval));
    return JString.equalsIgnoreCase(value, 'true');
  }
  /**
   * Gets named String property
   * @param key       Name of property
   * @param defval    Default value if property does not exist
   * @return string value of the named property
   */
  getString(key: string, defval: string): string {
    let actualKeyName = DebugSettings.PREFIX + '.' + key;
    let value = this.props.getProperty(actualKeyName, defval);
    return value;
  }
  static $clinit() {
    DebugSettings.log = PlatformLogger.getLogger('sun.awt.debug.DebugSettings');
    DebugSettings.DEFAULT_PROPS = ['awtdebug.assert=true', 'awtdebug.trace=false', 'awtdebug.on=true', 'awtdebug.ctrace=false'];
    DebugSettings.instance = new DebugSettings()._DebugSettings();
    DebugSettings.PROP_CTRACE_LEN = DebugSettings.PROP_CTRACE.length;
  }
}

$J.define(DebugSettings, 'sun.awt.DebugSettings', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_DebugSettings' }, meths: { 'setCTracingOn(boolean,java.lang.String,int)': 'setCTracingOn$boolean$String$int$DebugSettings', 'setCTracingOn(boolean,java.lang.String)': 'setCTracingOn$boolean$String$DebugSettings', 'setCTracingOn(boolean)': 'setCTracingOn$boolean$DebugSettings' }, clinit: true, lazy: ['log', 'DEFAULT_PROPS', 'instance', 'PROP_CTRACE_LEN'] });
