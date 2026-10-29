// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/OSInfo.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, HashMap, JEnum, JObject, OperatingSystem } from '../../../jre/index.ts';

/**
 * @author Pavel Porvatov
 */
export class OSInfo extends JObject {
  static WINDOWS_UNKNOWN: OSInfo$WindowsVersion = null;
  static WINDOWS_95: OSInfo$WindowsVersion = null;
  static WINDOWS_98: OSInfo$WindowsVersion = null;
  static WINDOWS_ME: OSInfo$WindowsVersion = null;
  static WINDOWS_2000: OSInfo$WindowsVersion = null;
  static WINDOWS_XP: OSInfo$WindowsVersion = null;
  static WINDOWS_2003: OSInfo$WindowsVersion = null;
  static WINDOWS_VISTA: OSInfo$WindowsVersion = null;
  static WINDOWS_7: OSInfo$WindowsVersion = null;
  static readonly OS_VERSION: string = 'os.version';
  static windowsVersionMap: JMap<string, OSInfo$WindowsVersion> = null;
  static CURRENT_OSTYPE: OSInfo$OSType = null;
  /**
   * Returns type of operating system.
   */
  static getOSType(): OSInfo$OSType {
    return OSInfo.CURRENT_OSTYPE;
  }
  static getOSTypeImpl(): OSInfo$OSType {
    let os = OperatingSystem.current();
    return (() => {
  switch (os) {
    case OperatingSystem.WINDOWS:
      {
        return OSInfo$OSType.WINDOWS;
        break;
      }
    case OperatingSystem.LINUX:
      {
        return OSInfo$OSType.LINUX;
        break;
      }
    case OperatingSystem.MACOS:
      {
        return OSInfo$OSType.MACOSX;
        break;
      }
    case OperatingSystem.AIX:
      {
        return OSInfo$OSType.AIX;
        break;
      }
    default:
      {
        return OSInfo$OSType.UNKNOWN;
        break;
      }
  }
})();
  }
  static $clinit() {
    OSInfo.WINDOWS_UNKNOWN = new OSInfo$WindowsVersion()._OSInfo$WindowsVersion(-1, -1);
    OSInfo.WINDOWS_95 = new OSInfo$WindowsVersion()._OSInfo$WindowsVersion(4, 0);
    OSInfo.WINDOWS_98 = new OSInfo$WindowsVersion()._OSInfo$WindowsVersion(4, 10);
    OSInfo.WINDOWS_ME = new OSInfo$WindowsVersion()._OSInfo$WindowsVersion(4, 90);
    OSInfo.WINDOWS_2000 = new OSInfo$WindowsVersion()._OSInfo$WindowsVersion(5, 0);
    OSInfo.WINDOWS_XP = new OSInfo$WindowsVersion()._OSInfo$WindowsVersion(5, 1);
    OSInfo.WINDOWS_2003 = new OSInfo$WindowsVersion()._OSInfo$WindowsVersion(5, 2);
    OSInfo.WINDOWS_VISTA = new OSInfo$WindowsVersion()._OSInfo$WindowsVersion(6, 0);
    OSInfo.WINDOWS_7 = new OSInfo$WindowsVersion()._OSInfo$WindowsVersion(6, 1);
    OSInfo.windowsVersionMap = new HashMap();
    OSInfo.CURRENT_OSTYPE = OSInfo.getOSTypeImpl();
    OSInfo.windowsVersionMap.put(OSInfo.WINDOWS_95.toString(), OSInfo.WINDOWS_95);
    OSInfo.windowsVersionMap.put(OSInfo.WINDOWS_98.toString(), OSInfo.WINDOWS_98);
    OSInfo.windowsVersionMap.put(OSInfo.WINDOWS_ME.toString(), OSInfo.WINDOWS_ME);
    OSInfo.windowsVersionMap.put(OSInfo.WINDOWS_2000.toString(), OSInfo.WINDOWS_2000);
    OSInfo.windowsVersionMap.put(OSInfo.WINDOWS_XP.toString(), OSInfo.WINDOWS_XP);
    OSInfo.windowsVersionMap.put(OSInfo.WINDOWS_2003.toString(), OSInfo.WINDOWS_2003);
    OSInfo.windowsVersionMap.put(OSInfo.WINDOWS_VISTA.toString(), OSInfo.WINDOWS_VISTA);
    OSInfo.windowsVersionMap.put(OSInfo.WINDOWS_7.toString(), OSInfo.WINDOWS_7);
  }
}

export class OSInfo$OSType extends JEnum {
  static WINDOWS: OSInfo$OSType = null;
  static LINUX: OSInfo$OSType = null;
  static MACOSX: OSInfo$OSType = null;
  static AIX: OSInfo$OSType = null;
  static UNKNOWN: OSInfo$OSType = null;
  static $VALUES: OSInfo$OSType[] = null;
  _OSInfo$OSType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): OSInfo$OSType[] { return OSInfo$OSType.$VALUES.slice(); }
  static valueOf(name: string): OSInfo$OSType { return $J.enumValueOf(OSInfo$OSType, name); }
  static $clinit() {
    OSInfo$OSType.WINDOWS = new OSInfo$OSType()._OSInfo$OSType('WINDOWS', 0);
    OSInfo$OSType.LINUX = new OSInfo$OSType()._OSInfo$OSType('LINUX', 1);
    OSInfo$OSType.MACOSX = new OSInfo$OSType()._OSInfo$OSType('MACOSX', 2);
    OSInfo$OSType.AIX = new OSInfo$OSType()._OSInfo$OSType('AIX', 3);
    OSInfo$OSType.UNKNOWN = new OSInfo$OSType()._OSInfo$OSType('UNKNOWN', 4);
    OSInfo$OSType.$VALUES = [OSInfo$OSType.WINDOWS, OSInfo$OSType.LINUX, OSInfo$OSType.MACOSX, OSInfo$OSType.AIX, OSInfo$OSType.UNKNOWN];
  }
}

export class OSInfo$WindowsVersion extends JObject {
  major: number = 0;
  minor: number = 0;
  _OSInfo$WindowsVersion(major: number, minor: number): this {
    this.major = major;
    this.minor = minor;
    return this;
  }
  getMajor(): number {
    return this.major;
  }
  getMinor(): number {
    return this.minor;
  }
  compareTo(o: OSInfo$WindowsVersion): number {
    let result = (this.major - o.getMajor()) | 0;
    if (result === 0) {
      result = (this.minor - o.getMinor()) | 0;
    }
    return result;
  }
  equals(obj: any): boolean {
    return obj instanceof OSInfo$WindowsVersion && this.compareTo(obj) === 0;
  }
  hashCode(): number {
    return (Math.imul(31, this.major) + this.minor) | 0;
  }
  toString(): string {
    return this.major + '.' + this.minor;
  }
}

$J.define(OSInfo, 'sun.awt.OSInfo', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_OSInfo' }, clinit: true, lazy: ['WINDOWS_UNKNOWN', 'WINDOWS_95', 'WINDOWS_98', 'WINDOWS_ME', 'WINDOWS_2000', 'WINDOWS_XP', 'WINDOWS_2003', 'WINDOWS_VISTA', 'WINDOWS_7', 'windowsVersionMap', 'CURRENT_OSTYPE'] });
$J.define(OSInfo$OSType, 'sun.awt.OSInfo$OSType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_OSInfo$OSType' }, clinit: true, lazy: ['$VALUES', 'WINDOWS', 'LINUX', 'MACOSX', 'AIX', 'UNKNOWN'] });
$J.define(OSInfo$WindowsVersion, 'sun.awt.OSInfo$WindowsVersion', { kind: 'class', ifaces: ['java.lang.Comparable'], sup: 'java.lang.Object', ctors: { 'int,int': '_OSInfo$WindowsVersion' } });
