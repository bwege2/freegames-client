// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Cursor.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1996, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, Disposer, Exception, Hashtable, IllegalArgumentException, JObject, NumberFormatException, PlatformLogger, PlatformLogger_Level, Properties, StringTokenizer, Toolkit } from '../../../jre/index.ts';

let AWTException, GraphicsEnvironment, Point, AWTAccessor;

/**
 * A class to encapsulate the bitmap representation of the mouse cursor.
 *
 * @see Component#setCursor
 * @author      Amy Fowler
 */
export class Cursor extends JObject {
  /**
   * The default cursor type (gets set if no cursor is defined).
   */
  static readonly DEFAULT_CURSOR: number = 0;
  /**
   * The crosshair cursor type.
   */
  static readonly CROSSHAIR_CURSOR: number = 1;
  /**
   * The text cursor type.
   */
  static readonly TEXT_CURSOR: number = 2;
  /**
   * The wait cursor type.
   */
  static readonly WAIT_CURSOR: number = 3;
  /**
   * The south-west-resize cursor type.
   */
  static readonly SW_RESIZE_CURSOR: number = 4;
  /**
   * The south-east-resize cursor type.
   */
  static readonly SE_RESIZE_CURSOR: number = 5;
  /**
   * The north-west-resize cursor type.
   */
  static readonly NW_RESIZE_CURSOR: number = 6;
  /**
   * The north-east-resize cursor type.
   */
  static readonly NE_RESIZE_CURSOR: number = 7;
  /**
   * The north-resize cursor type.
   */
  static readonly N_RESIZE_CURSOR: number = 8;
  /**
   * The south-resize cursor type.
   */
  static readonly S_RESIZE_CURSOR: number = 9;
  /**
   * The west-resize cursor type.
   */
  static readonly W_RESIZE_CURSOR: number = 10;
  /**
   * The east-resize cursor type.
   */
  static readonly E_RESIZE_CURSOR: number = 11;
  /**
   * The hand cursor type.
   */
  static readonly HAND_CURSOR: number = 12;
  /**
   * The move cursor type.
   */
  static readonly MOVE_CURSOR: number = 13;
  /**
   * @deprecated As of JDK version 1.7, the {@link #getPredefinedCursor(int)}
   * method should be used instead.
   */
  static predefined: Cursor[] = null;
  /**
   * This field is a private replacement for 'predefined' array.
   */
  static predefinedPrivate: Cursor[] = null;
  static cursorProperties: string[][] = null;
  /**
   * The chosen cursor type initially set to
   * the {@code DEFAULT_CURSOR}.
   *
   * @serial
   * @see #getType()
   */
  type: number = 0;
  /**
   * The type associated with all custom cursors.
   */
  static readonly CUSTOM_CURSOR: number = -1;
  static systemCustomCursors: Hashtable<string, Cursor> = null;
  static readonly RESOURCE_PREFIX: string = '/sun/awt/resources/cursors/';
  static readonly PROPERTIES_FILE: string = '/sun/awt/resources/cursors/cursors.properties';
  static systemCustomCursorProperties: Properties = null;
  static readonly CURSOR_DOT_PREFIX: string = 'Cursor.';
  static readonly DOT_FILE_SUFFIX: string = '.File';
  static readonly DOT_HOTSPOT_SUFFIX: string = '.HotSpot';
  static readonly DOT_NAME_SUFFIX: string = '.Name';
  static log: PlatformLogger = null;
  /**
   * Hook into native data.
   */
  pData: number = 0;
  anchor: any = null;
  disposer: Cursor$CursorDisposer = null;
  /**
   * The user-visible name of the cursor.
   *
   * @serial
   * @see #getName()
   */
  name: string = null;
  $init_Cursor() {
    this.type = Cursor.DEFAULT_CURSOR;
    this.anchor = new JObject();
  }
  /**
   * Creates a new cursor object with the specified type.
   * @param type the type of cursor
   * @throws IllegalArgumentException if the specified cursor type
   * is invalid
   */
  _Cursor$int(type$: number): this {
    this.$init_Cursor();
    if (type$ < Cursor.DEFAULT_CURSOR || type$ > Cursor.MOVE_CURSOR) {
      throw new IllegalArgumentException('illegal cursor type');
    }
    this.type = type$;
    this.name = Toolkit.getProperty(Cursor.cursorProperties[type$][0], Cursor.cursorProperties[type$][1]);
    return this;
  }
  /**
   * Creates a new custom cursor object with the specified name.<p>
   * Note:  this constructor should only be used by AWT implementations
   * as part of their support for custom cursors.  Applications should
   * use Toolkit.createCustomCursor().
   * @param name the user-visible name of the cursor.
   * @see java.awt.Toolkit#createCustomCursor
   */
  _Cursor$String(name: string): this {
    this.$init_Cursor();
    this.type = Cursor.CUSTOM_CURSOR;
    this.name = name;
    return this;
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('java.awt.Cursor', 'initIDs', this, $a);
  }
  setPData(pData: number): void {
    this.pData = pData;
    if (GraphicsEnvironment.isHeadless()) {
      return;
    }
    if (this.disposer == null) {
      this.disposer = new Cursor$CursorDisposer()._Cursor$CursorDisposer(pData);
      if (this.anchor == null) {
        this.anchor = new JObject();
      }
      Disposer.addRecord(this.anchor, this.disposer);
    } else {
      this.disposer.pData = pData;
    }
  }
  /**
   * Returns a cursor object with the specified predefined type.
   *
   * @param type the type of predefined cursor
   * @return the specified predefined cursor
   * @throws IllegalArgumentException if the specified cursor type is
   *         invalid
   */
  static getPredefinedCursor(type$: number): Cursor {
    if (type$ < Cursor.DEFAULT_CURSOR || type$ > Cursor.MOVE_CURSOR) {
      throw new IllegalArgumentException('illegal cursor type');
    }
    let c = Cursor.predefinedPrivate[type$];
    if (c == null) {
      Cursor.predefinedPrivate[type$] = c = new Cursor()._Cursor$int(type$);
    }
    if (Cursor.predefined[type$] == null) {
      Cursor.predefined[type$] = c;
    }
    return c;
  }
  /**
   * Returns a system-specific custom cursor object matching the
   * specified name.  Cursor names are, for example: "Invalid.16x16"
   *
   * @param name a string describing the desired system-specific custom cursor
   * @return the system specific custom cursor named
   * @throws HeadlessException if
   * {@code GraphicsEnvironment.isHeadless} returns true
   * @throws AWTException in case of erroneous retrieving of the cursor
   */
  static getSystemCustomCursor(name: string): Cursor {
    GraphicsEnvironment.checkHeadless();
    let cursor = Cursor.systemCustomCursors.get(name);
    if (cursor == null) {
      Cursor.loadSystemCustomCursorProperties();
      let prefix = Cursor.CURSOR_DOT_PREFIX + name;
      let key = prefix + Cursor.DOT_FILE_SUFFIX;
      if (!Cursor.systemCustomCursorProperties.containsKey(key)) {
        if (Cursor.log.isLoggable(PlatformLogger_Level.FINER)) {
          Cursor.log.finer('Cursor.getSystemCustomCursor(' + name + ') returned null');
        }
        return null;
      }
      let fileName = Cursor.systemCustomCursorProperties.getProperty(key);
      let localized = Cursor.systemCustomCursorProperties.getProperty(prefix + Cursor.DOT_NAME_SUFFIX, name);
      let hotspot = Cursor.systemCustomCursorProperties.getProperty(prefix + Cursor.DOT_HOTSPOT_SUFFIX);
      if (hotspot == null) {
        throw new AWTException()._AWTException('no hotspot property defined for cursor: ' + name);
      }
      let st = new StringTokenizer(hotspot, ',');
      if (st.countTokens() !== 2) {
        throw new AWTException()._AWTException('failed to parse hotspot property for cursor: ' + name);
      }
      let hotPoint: Point;
      try {
        hotPoint = new Point()._Point$int$int($J.parseInt(st.nextToken()), $J.parseInt(st.nextToken()));
      } catch ($e0) {
        if ($J.isa($e0, NumberFormatException)) {
          let nfe = $J.exc($e0);
          throw new AWTException()._AWTException('failed to parse hotspot property for cursor: ' + name);
        } else {
          throw $e0;
        }
      }
      let toolkit = Toolkit.getDefaultToolkit();
      let file = Cursor.RESOURCE_PREFIX + fileName;
      let in$ = AccessController.doPrivileged($J.lambdaObj(() => {
        return $J.cls(Cursor).getResourceAsStream(file);
      }, 'run', 'java.security.PrivilegedAction'));
      {
        try {
          const $res1 = in$;
          try {
            let image = toolkit.createImage(in$.readAllBytes());
            cursor = toolkit.createCustomCursor(image, hotPoint, localized);
          } finally {
            if ($res1 != null) $res1.close();
          }
        } catch ($e2) {
          if ($J.isa($e2, Exception)) {
            let e = $J.exc($e2);
            throw new AWTException()._AWTException('Exception: ' + $J.str($J.getClass(e)) + ' ' + e.getMessage() + ' occurred while creating cursor ' + name);
          } else {
            throw $e2;
          }
        }
      }
      if (cursor == null) {
        if (Cursor.log.isLoggable(PlatformLogger_Level.FINER)) {
          Cursor.log.finer('Cursor.getSystemCustomCursor(' + name + ') returned null');
        }
      } else {
        Cursor.systemCustomCursors.put(name, cursor);
      }
    }
    return cursor;
  }
  /**
   * Return the system default cursor.
   *
   * @return the default cursor
   */
  static getDefaultCursor(): Cursor {
    return Cursor.getPredefinedCursor(Cursor.DEFAULT_CURSOR);
  }
  /**
   * Returns the type for this cursor.
   *
   * @return the cursor type
   */
  getType(): number {
    return this.type;
  }
  /**
   * Returns the name of this cursor.
   * @return    a localized description of this cursor.
   * @since     1.2
   */
  getName(): string {
    return this.name;
  }
  /**
   * Returns a string representation of this cursor.
   * @return    a string representation of this cursor.
   * @since     1.2
   */
  toString(): string {
    return $J.getClass(this).getName() + '[' + this.getName() + ']';
  }
  static loadSystemCustomCursorProperties(): void {
    {
      if (Cursor.systemCustomCursorProperties != null) {
        return;
      }
      Cursor.systemCustomCursorProperties = new Properties();
      try {
        AccessController.doPrivileged($J.lambdaObj(() => {
          {
            const is$ = $J.cls(Cursor).getResourceAsStream(Cursor.PROPERTIES_FILE);
            try {
              Cursor.systemCustomCursorProperties.load(is$);
            } finally {
              if (is$ != null) is$.close();
            }
          }
          return null;
        }, 'run', 'java.security.PrivilegedExceptionAction'));
      } catch ($e3) {
        if ($J.isa($e3, Exception)) {
          let e = $J.exc($e3);
          Cursor.systemCustomCursorProperties = null;
          throw new AWTException()._AWTException('Exception: ' + $J.str($J.getClass(e)) + ' ' + e.getMessage() + ' occurred while loading: ' + Cursor.PROPERTIES_FILE);
        } else {
          throw $e3;
        }
      }
    }
  }
  static finalizeImpl(...$a: any[]): any {
    return $J.nativeCall('java.awt.Cursor', 'finalizeImpl', this, $a);
  }
  static $clinit() {
    Cursor.predefined = $J.newArray(14, null);
    Cursor.predefinedPrivate = $J.newArray(14, null);
    Cursor.cursorProperties = [['AWT.DefaultCursor', 'Default Cursor'], ['AWT.CrosshairCursor', 'Crosshair Cursor'], ['AWT.TextCursor', 'Text Cursor'], ['AWT.WaitCursor', 'Wait Cursor'], ['AWT.SWResizeCursor', 'Southwest Resize Cursor'], ['AWT.SEResizeCursor', 'Southeast Resize Cursor'], ['AWT.NWResizeCursor', 'Northwest Resize Cursor'], ['AWT.NEResizeCursor', 'Northeast Resize Cursor'], ['AWT.NResizeCursor', 'North Resize Cursor'], ['AWT.SResizeCursor', 'South Resize Cursor'], ['AWT.WResizeCursor', 'West Resize Cursor'], ['AWT.EResizeCursor', 'East Resize Cursor'], ['AWT.HandCursor', 'Hand Cursor'], ['AWT.MoveCursor', 'Move Cursor']];
    Cursor.systemCustomCursors = new Hashtable(1);
    Cursor.systemCustomCursorProperties = null;
    Cursor.log = PlatformLogger.getLogger('java.awt.Cursor');
    Toolkit.loadLibraries();
    if (!GraphicsEnvironment.isHeadless()) {
      Cursor.initIDs();
    }
    AWTAccessor.setCursorAccessor(new (Cursor$1())());
  }
}

export class Cursor$CursorDisposer extends JObject {
  pData: number = 0;
  _Cursor$CursorDisposer(pData: number): this {
    this.pData = pData;
    return this;
  }
  dispose(): void {
    if (this.pData !== 0) {
      Cursor.finalizeImpl(this.pData);
    }
  }
}

let $Cursor$1: any = null;
/** An anonymous class (Cursor.java:194). */
function Cursor$1(): any {
  return $Cursor$1 ??= $J.local(class extends JObject {
  }, 'java.awt.Cursor$1', ['sun.awt.AWTAccessor$CursorAccessor']);
}

$J.define(Cursor, 'java.awt.Cursor', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'java.lang.String': '_Cursor$String', 'int': '_Cursor$int' }, clinit: true, lazy: ['predefined', 'predefinedPrivate', 'cursorProperties', 'systemCustomCursors', 'systemCustomCursorProperties', 'log'] });
$J.define(Cursor$CursorDisposer, 'java.awt.Cursor$CursorDisposer', { kind: 'class', ifaces: ['sun.java2d.DisposerRecord'], sup: 'java.lang.Object', ctors: { 'long': '_Cursor$CursorDisposer' } });
$J.module(() => {
  AWTException = $J.load('java.awt.AWTException');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  Point = $J.load('java.awt.Point');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
});
