// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/AWTAccessor.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2008, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalAccessException, JObject, MethodHandles } from '../../../jre/index.ts';

let AWTEvent, Component, KeyboardFocusManager, Window, DragSourceContext, InputEvent, MouseEvent;

/**
 * The AWTAccessor utility class.
 * The main purpose of this class is to enable accessing
 * private and package-private fields of classes from
 * different classes/packages. See sun.misc.SharedSecretes
 * for another example.
 */
export class AWTAccessor extends JObject {
  static iccProfileAccessor: AWTAccessor$ICC_ProfileAccessor = null;
  static componentAccessor: AWTAccessor$ComponentAccessor = null;
  static containerAccessor: AWTAccessor$ContainerAccessor = null;
  static windowAccessor: AWTAccessor$WindowAccessor = null;
  static awtEventAccessor: AWTAccessor$AWTEventAccessor = null;
  static inputEventAccessor: AWTAccessor$InputEventAccessor = null;
  static mouseEventAccessor: AWTAccessor$MouseEventAccessor = null;
  static frameAccessor: AWTAccessor$FrameAccessor = null;
  static kfmAccessor: AWTAccessor$KeyboardFocusManagerAccessor = null;
  static menuComponentAccessor: AWTAccessor$MenuComponentAccessor = null;
  static eventQueueAccessor: AWTAccessor$EventQueueAccessor = null;
  static popupMenuAccessor: AWTAccessor$PopupMenuAccessor = null;
  static fileDialogAccessor: AWTAccessor$FileDialogAccessor = null;
  static scrollPaneAdjustableAccessor: AWTAccessor$ScrollPaneAdjustableAccessor = null;
  static checkboxMenuItemAccessor: AWTAccessor$CheckboxMenuItemAccessor = null;
  static cursorAccessor: AWTAccessor$CursorAccessor = null;
  static menuBarAccessor: AWTAccessor$MenuBarAccessor = null;
  static menuItemAccessor: AWTAccessor$MenuItemAccessor = null;
  static menuAccessor: AWTAccessor$MenuAccessor = null;
  static keyEventAccessor: AWTAccessor$KeyEventAccessor = null;
  static clientPropertyKeyAccessor: AWTAccessor$ClientPropertyKeyAccessor = null;
  static systemTrayAccessor: AWTAccessor$SystemTrayAccessor = null;
  static trayIconAccessor: AWTAccessor$TrayIconAccessor = null;
  static defaultKeyboardFocusManagerAccessor: AWTAccessor$DefaultKeyboardFocusManagerAccessor = null;
  static sequencedEventAccessor: AWTAccessor$SequencedEventAccessor = null;
  static toolkitAccessor: AWTAccessor$ToolkitAccessor = null;
  static invocationEventAccessor: AWTAccessor$InvocationEventAccessor = null;
  static systemColorAccessor: AWTAccessor$SystemColorAccessor = null;
  static accessibleContextAccessor: AWTAccessor$AccessibleContextAccessor = null;
  static accessibleBundleAccessor: AWTAccessor$AccessibleBundleAccessor = null;
  static dragSourceContextAccessor: AWTAccessor$DragSourceContextAccessor = null;
  static dropTargetContextAccessor: AWTAccessor$DropTargetContextAccessor = null;
  static setComponentAccessor(ca: AWTAccessor$ComponentAccessor): void {
    AWTAccessor.componentAccessor = ca;
  }
  static getComponentAccessor(): AWTAccessor$ComponentAccessor {
    let access = AWTAccessor.componentAccessor;
    if (access == null) {
      AWTAccessor.ensureClassInitialized($J.cls(Component));
      access = AWTAccessor.componentAccessor;
    }
    return access;
  }
  static setContainerAccessor(ca: AWTAccessor$ContainerAccessor): void {
    AWTAccessor.containerAccessor = ca;
  }
  static setWindowAccessor(wa: AWTAccessor$WindowAccessor): void {
    AWTAccessor.windowAccessor = wa;
  }
  static getWindowAccessor(): AWTAccessor$WindowAccessor {
    let access = AWTAccessor.windowAccessor;
    if (access == null) {
      AWTAccessor.ensureClassInitialized($J.cls(Window));
      access = AWTAccessor.windowAccessor;
    }
    return access;
  }
  static setAWTEventAccessor(aea: AWTAccessor$AWTEventAccessor): void {
    AWTAccessor.awtEventAccessor = aea;
  }
  static getAWTEventAccessor(): AWTAccessor$AWTEventAccessor {
    let access = AWTAccessor.awtEventAccessor;
    if (access == null) {
      AWTAccessor.ensureClassInitialized($J.cls(AWTEvent));
      access = AWTAccessor.awtEventAccessor;
    }
    return access;
  }
  static setInputEventAccessor(iea: AWTAccessor$InputEventAccessor): void {
    AWTAccessor.inputEventAccessor = iea;
  }
  static getInputEventAccessor(): AWTAccessor$InputEventAccessor {
    let access = AWTAccessor.inputEventAccessor;
    if (access == null) {
      AWTAccessor.ensureClassInitialized($J.cls(InputEvent));
      access = AWTAccessor.inputEventAccessor;
    }
    return access;
  }
  static setMouseEventAccessor(mea: AWTAccessor$MouseEventAccessor): void {
    AWTAccessor.mouseEventAccessor = mea;
  }
  static getMouseEventAccessor(): AWTAccessor$MouseEventAccessor {
    let access = AWTAccessor.mouseEventAccessor;
    if (access == null) {
      AWTAccessor.ensureClassInitialized($J.cls(MouseEvent));
      access = AWTAccessor.mouseEventAccessor;
    }
    return access;
  }
  static setFrameAccessor(fa: AWTAccessor$FrameAccessor): void {
    AWTAccessor.frameAccessor = fa;
  }
  static setKeyboardFocusManagerAccessor(kfma: AWTAccessor$KeyboardFocusManagerAccessor): void {
    AWTAccessor.kfmAccessor = kfma;
  }
  static getKeyboardFocusManagerAccessor(): AWTAccessor$KeyboardFocusManagerAccessor {
    let access = AWTAccessor.kfmAccessor;
    if (access == null) {
      AWTAccessor.ensureClassInitialized($J.cls(KeyboardFocusManager));
      access = AWTAccessor.kfmAccessor;
    }
    return access;
  }
  static setEventQueueAccessor(eqa: AWTAccessor$EventQueueAccessor): void {
    AWTAccessor.eventQueueAccessor = eqa;
  }
  /**
   * Set an accessor object for the java.awt.Cursor class.
   */
  static setCursorAccessor(ca: AWTAccessor$CursorAccessor): void {
    AWTAccessor.cursorAccessor = ca;
  }
  /**
   * Set an accessor object for the java.awt.event.KeyEvent class.
   */
  static setKeyEventAccessor(kea: AWTAccessor$KeyEventAccessor): void {
    AWTAccessor.keyEventAccessor = kea;
  }
  /**
   * Retrieve the accessor object for the java.awt.event.KeyEvent class.
   */
  static getKeyEventAccessor(): AWTAccessor$KeyEventAccessor {
    let access = AWTAccessor.keyEventAccessor;
    if (access == null) {
      AWTAccessor.ensureClassInitialized($J.cls(AWTAccessor$KeyEventAccessor));
      access = AWTAccessor.keyEventAccessor;
    }
    return access;
  }
  /**
   * Set an accessor object for the javax.swing.ClientPropertyKey class.
   */
  static setClientPropertyKeyAccessor(cpka: AWTAccessor$ClientPropertyKeyAccessor): void {
    AWTAccessor.clientPropertyKeyAccessor = cpka;
  }
  /**
   * Set an accessor object for the java.awt.DefaultKeyboardFocusManager class.
   */
  static setDefaultKeyboardFocusManagerAccessor(dkfma: AWTAccessor$DefaultKeyboardFocusManagerAccessor): void {
    AWTAccessor.defaultKeyboardFocusManagerAccessor = dkfma;
  }
  static setSequencedEventAccessor(sea: AWTAccessor$SequencedEventAccessor): void {
    AWTAccessor.sequencedEventAccessor = sea;
  }
  static setInvocationEventAccessor(invocationEventAccessor: AWTAccessor$InvocationEventAccessor): void {
    AWTAccessor.invocationEventAccessor = invocationEventAccessor;
  }
  static getInvocationEventAccessor(): AWTAccessor$InvocationEventAccessor {
    return AWTAccessor.invocationEventAccessor;
  }
  static setAccessibleBundleAccessor(accessor: AWTAccessor$AccessibleBundleAccessor): void {
    AWTAccessor.accessibleBundleAccessor = accessor;
  }
  static setAccessibleContextAccessor(accessor: AWTAccessor$AccessibleContextAccessor): void {
    AWTAccessor.accessibleContextAccessor = accessor;
  }
  static getDragSourceContextAccessor(): AWTAccessor$DragSourceContextAccessor {
    let access = AWTAccessor.dragSourceContextAccessor;
    if (access == null) {
      AWTAccessor.ensureClassInitialized($J.cls(DragSourceContext));
      access = AWTAccessor.dragSourceContextAccessor;
    }
    return access;
  }
  static setDragSourceContextAccessor(accessor: AWTAccessor$DragSourceContextAccessor): void {
    AWTAccessor.dragSourceContextAccessor = accessor;
  }
  static setDropTargetContextAccessor(accessor: AWTAccessor$DropTargetContextAccessor): void {
    AWTAccessor.dropTargetContextAccessor = accessor;
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
}

export class AWTAccessor$ComponentAccessor {
}

export class AWTAccessor$ContainerAccessor {
}

export class AWTAccessor$WindowAccessor {
}

/**
 * An accessor for the AWTEvent class.
 */
export class AWTAccessor$AWTEventAccessor {
}

export class AWTAccessor$InputEventAccessor {
}

/**
 * An accessor for the MouseEvent class.
 */
export class AWTAccessor$MouseEventAccessor {
}

export class AWTAccessor$FrameAccessor {
}

/**
 * An interface of accessor for the java.awt.KeyboardFocusManager class.
 */
export class AWTAccessor$KeyboardFocusManagerAccessor {
}

/**
 * An accessor for the EventQueue class
 */
export class AWTAccessor$EventQueueAccessor {
}

/**
 * An accessor for the Cursor class
 */
export class AWTAccessor$CursorAccessor {
}

/**
 * An accessor for the KeyEvent class
 */
export class AWTAccessor$KeyEventAccessor {
}

/**
 * An accessor for the ClientPropertyKey class
 */
export class AWTAccessor$ClientPropertyKeyAccessor {
}

/**
 * An accessor for the DefaultKeyboardFocusManager class
 */
export class AWTAccessor$DefaultKeyboardFocusManagerAccessor {
}

export class AWTAccessor$SequencedEventAccessor {
}

export class AWTAccessor$InvocationEventAccessor {
}

export class AWTAccessor$AccessibleContextAccessor {
}

export class AWTAccessor$AccessibleBundleAccessor {
}

export class AWTAccessor$DragSourceContextAccessor {
}

export class AWTAccessor$DropTargetContextAccessor {
}

$J.define(AWTAccessor, 'sun.awt.AWTAccessor', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_AWTAccessor' } });
$J.define(AWTAccessor$ComponentAccessor, 'sun.awt.AWTAccessor$ComponentAccessor', { kind: 'interface' });
$J.define(AWTAccessor$ContainerAccessor, 'sun.awt.AWTAccessor$ContainerAccessor', { kind: 'interface' });
$J.define(AWTAccessor$WindowAccessor, 'sun.awt.AWTAccessor$WindowAccessor', { kind: 'interface' });
$J.define(AWTAccessor$AWTEventAccessor, 'sun.awt.AWTAccessor$AWTEventAccessor', { kind: 'interface' });
$J.define(AWTAccessor$InputEventAccessor, 'sun.awt.AWTAccessor$InputEventAccessor', { kind: 'interface' });
$J.define(AWTAccessor$MouseEventAccessor, 'sun.awt.AWTAccessor$MouseEventAccessor', { kind: 'interface' });
$J.define(AWTAccessor$FrameAccessor, 'sun.awt.AWTAccessor$FrameAccessor', { kind: 'interface' });
$J.define(AWTAccessor$KeyboardFocusManagerAccessor, 'sun.awt.AWTAccessor$KeyboardFocusManagerAccessor', { kind: 'interface' });
$J.define(AWTAccessor$EventQueueAccessor, 'sun.awt.AWTAccessor$EventQueueAccessor', { kind: 'interface' });
$J.define(AWTAccessor$CursorAccessor, 'sun.awt.AWTAccessor$CursorAccessor', { kind: 'interface' });
$J.define(AWTAccessor$KeyEventAccessor, 'sun.awt.AWTAccessor$KeyEventAccessor', { kind: 'interface' });
$J.define(AWTAccessor$ClientPropertyKeyAccessor, 'sun.awt.AWTAccessor$ClientPropertyKeyAccessor', { kind: 'interface' });
$J.define(AWTAccessor$DefaultKeyboardFocusManagerAccessor, 'sun.awt.AWTAccessor$DefaultKeyboardFocusManagerAccessor', { kind: 'interface' });
$J.define(AWTAccessor$SequencedEventAccessor, 'sun.awt.AWTAccessor$SequencedEventAccessor', { kind: 'interface' });
$J.define(AWTAccessor$InvocationEventAccessor, 'sun.awt.AWTAccessor$InvocationEventAccessor', { kind: 'interface' });
$J.define(AWTAccessor$AccessibleContextAccessor, 'sun.awt.AWTAccessor$AccessibleContextAccessor', { kind: 'interface' });
$J.define(AWTAccessor$AccessibleBundleAccessor, 'sun.awt.AWTAccessor$AccessibleBundleAccessor', { kind: 'interface' });
$J.define(AWTAccessor$DragSourceContextAccessor, 'sun.awt.AWTAccessor$DragSourceContextAccessor', { kind: 'interface' });
$J.define(AWTAccessor$DropTargetContextAccessor, 'sun.awt.AWTAccessor$DropTargetContextAccessor', { kind: 'interface' });
$J.module(() => {
  AWTEvent = $J.load('java.awt.AWTEvent');
  Component = $J.load('java.awt.Component');
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  Window = $J.load('java.awt.Window');
  DragSourceContext = $J.load('java.awt.dnd.DragSourceContext');
  InputEvent = $J.load('java.awt.event.InputEvent');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
});
