// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/swing/SwingAccessor.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2009, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalAccessException, JObject, MethodHandles, ThreadLocal } from '../../../jre/index.ts';

let KeyStroke, UIDefaults, JTextComponent;

/**
 * The SwingAccessor utility class.
 * The main purpose of this class is to enable accessing
 * private and package-private fields of classes from
 * different classes/packages. See sun.misc.SharedSecretes
 * for another example.
 */
export class SwingAccessor extends JObject {
  /**
   * The javax.swing.JComponent class accessor object.
   */
  static jComponentAccessor: SwingAccessor$JComponentAccessor = null;
  /**
   * The javax.swing.text.JTextComponent class accessor object.
   */
  static jtextComponentAccessor: SwingAccessor$JTextComponentAccessor = null;
  /**
   * The JLightweightFrame class accessor object
   */
  static jLightweightFrameAccessor: SwingAccessor$JLightweightFrameAccessor = null;
  /**
   * The UIDefaults class accessor object
   */
  static uiDefaultsAccessor: SwingAccessor$UIDefaultsAccessor = null;
  /**
   * The RepaintManager class accessor object.
   */
  static repaintManagerAccessor: SwingAccessor$RepaintManagerAccessor = null;
  /**
   * The PopupFactory class accessor object.
   */
  static popupFactoryAccessor: SwingAccessor$PopupFactoryAccessor = null;
  /**
   * The KeyStroke class accessor object.
   */
  static keyStrokeAccessor: SwingAccessor$KeyStrokeAccessor = null;
  static accessibleComponentAccessor: SwingAccessor$AccessibleComponentAccessor = null;
  static tlObj: ThreadLocal<boolean> = null;
  /**
   * Set an accessor object for the javax.swing.JComponent class.
   */
  static setJComponentAccessor(jCompAccessor: SwingAccessor$JComponentAccessor): void {
    SwingAccessor.jComponentAccessor = jCompAccessor;
  }
  /**
   * Set an accessor object for the javax.swing.text.JTextComponent class.
   */
  static setJTextComponentAccessor(jtca: SwingAccessor$JTextComponentAccessor): void {
    SwingAccessor.jtextComponentAccessor = jtca;
  }
  /**
   * Retrieve the accessor object for the javax.swing.text.JTextComponent class.
   */
  static getJTextComponentAccessor(): SwingAccessor$JTextComponentAccessor {
    let access = SwingAccessor.jtextComponentAccessor;
    if (access == null) {
      SwingAccessor.ensureClassInitialized($J.cls(JTextComponent));
      access = SwingAccessor.jtextComponentAccessor;
    }
    return access;
  }
  /**
   * Set an accessor object for the UIDefaults class.
   */
  static setUIDefaultsAccessor(accessor: SwingAccessor$UIDefaultsAccessor): void {
    SwingAccessor.uiDefaultsAccessor = accessor;
  }
  /**
   * Retrieve the accessor object for the JLightweightFrame class
   */
  static getUIDefaultsAccessor(): SwingAccessor$UIDefaultsAccessor {
    let access = SwingAccessor.uiDefaultsAccessor;
    if (access == null) {
      SwingAccessor.ensureClassInitialized($J.cls(UIDefaults));
      access = SwingAccessor.uiDefaultsAccessor;
    }
    return access;
  }
  /**
   * Set an accessor object for the RepaintManager class.
   */
  static setRepaintManagerAccessor(accessor: SwingAccessor$RepaintManagerAccessor): void {
    SwingAccessor.repaintManagerAccessor = accessor;
  }
  /**
   * Set an Accessor object for the PopupFactory class.
   */
  static setPopupFactoryAccessor(popupFactoryAccessor: SwingAccessor$PopupFactoryAccessor): void {
    SwingAccessor.popupFactoryAccessor = popupFactoryAccessor;
  }
  /**
   * Retrieve the accessor object for the KeyStroke class.
   */
  static getKeyStrokeAccessor(): SwingAccessor$KeyStrokeAccessor {
    let access = SwingAccessor.keyStrokeAccessor;
    if (access == null) {
      SwingAccessor.ensureClassInitialized($J.cls(KeyStroke));
      access = SwingAccessor.keyStrokeAccessor;
    }
    return access;
  }
  static setKeyStrokeAccessor(accessor: SwingAccessor$KeyStrokeAccessor): void {
    SwingAccessor.keyStrokeAccessor = accessor;
  }
  static setAccessibleComponentAccessor(accessibleAccessor: SwingAccessor$AccessibleComponentAccessor): void {
    SwingAccessor.accessibleComponentAccessor = accessibleAccessor;
  }
  static ensureClassInitialized(c: JClass<any>): void {
    try {
      MethodHandles.lookup().ensureInitialized(c);
    } catch ($e0) {
      if ($J.isa($e0, IllegalAccessException)) {
        let e = $J.exc($e0);
      } else {
        throw $e0;
      }
    }
  }
  static setAllowHTMLObject(val: boolean): void {
    SwingAccessor.tlObj.set(val);
  }
  static $clinit() {
    SwingAccessor.accessibleComponentAccessor = null;
    SwingAccessor.tlObj = new ThreadLocal();
  }
}

/**
 * This interface provides access to the renderer's accessibility component.
 * For example, the renderer of a list element, a table cell, or a tree node
 */
export class SwingAccessor$AccessibleComponentAccessor {
}

/**
 * An accessor for the JComponent class.
 */
export class SwingAccessor$JComponentAccessor {
}

/**
 * An accessor for the JTextComponent class.
 * Note that we intentionally introduce the JTextComponentAccessor,
 * and not the JComponentAccessor because the needed methods
 * aren't override methods.
 */
export class SwingAccessor$JTextComponentAccessor {
}

/**
 * An accessor for the UIDefaults class.
 */
export class SwingAccessor$UIDefaultsAccessor {
}

/**
 * An accessor for the RepaintManager class.
 */
export class SwingAccessor$RepaintManagerAccessor {
}

/**
 * An accessor for PopupFactory class.
 */
export class SwingAccessor$PopupFactoryAccessor {
}

export class SwingAccessor$KeyStrokeAccessor {
}

$J.define(SwingAccessor, 'sun.swing.SwingAccessor', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_SwingAccessor' }, clinit: true, lazy: ['jComponentAccessor', 'jtextComponentAccessor', 'jLightweightFrameAccessor', 'uiDefaultsAccessor', 'repaintManagerAccessor', 'popupFactoryAccessor', 'keyStrokeAccessor', 'accessibleComponentAccessor', 'tlObj'] });
$J.define(SwingAccessor$AccessibleComponentAccessor, 'sun.swing.SwingAccessor$AccessibleComponentAccessor', { kind: 'interface' });
$J.define(SwingAccessor$JComponentAccessor, 'sun.swing.SwingAccessor$JComponentAccessor', { kind: 'interface' });
$J.define(SwingAccessor$JTextComponentAccessor, 'sun.swing.SwingAccessor$JTextComponentAccessor', { kind: 'interface' });
$J.define(SwingAccessor$UIDefaultsAccessor, 'sun.swing.SwingAccessor$UIDefaultsAccessor', { kind: 'interface' });
$J.define(SwingAccessor$RepaintManagerAccessor, 'sun.swing.SwingAccessor$RepaintManagerAccessor', { kind: 'interface' });
$J.define(SwingAccessor$PopupFactoryAccessor, 'sun.swing.SwingAccessor$PopupFactoryAccessor', { kind: 'interface' });
$J.define(SwingAccessor$KeyStrokeAccessor, 'sun.swing.SwingAccessor$KeyStrokeAccessor', { kind: 'interface' });
$J.module(() => {
  KeyStroke = $J.load('javax.swing.KeyStroke');
  UIDefaults = $J.load('javax.swing.UIDefaults');
  JTextComponent = $J.load('javax.swing.text.JTextComponent');
});
