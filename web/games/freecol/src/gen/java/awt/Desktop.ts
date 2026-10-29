// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Desktop.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2005, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AppContext, FilePermission, JEnum, JObject, Objects, SunToolkit, Toolkit, UnsupportedOperationException } from '../../../jre/index.ts';

let AWTPermission, GraphicsEnvironment, HeadlessException;

/**
 * The {@code Desktop} class allows interact with various desktop capabilities.
 *
 * <p> Supported operations include:
 * <ul>
 *   <li>launching the user-default browser to show a specified
 *       URI;</li>
 *   <li>launching the user-default mail client with an optional
 *       {@code mailto} URI;</li>
 *   <li>launching a registered application to open, edit or print a
 *       specified file.</li>
 * </ul>
 *
 * <p> This class provides methods corresponding to these
 * operations. The methods look for the associated application
 * registered on the current platform, and launch it to handle a URI
 * or file. If there is no associated application or the associated
 * application fails to be launched, an exception is thrown.
 *
 * Please see {@link Desktop.Action} for the full list of supported operations
 * and capabilities.
 *
 * <p> An application is registered to a URI or file type.
 * The mechanism of registering, accessing, and
 * launching the associated application is platform-dependent.
 *
 * <p> Each operation is an action type represented by the {@link
 * Desktop.Action} class.
 *
 * <p> Note: when some action is invoked and the associated
 * application is executed, it will be executed on the same system as
 * the one on which the Java application was launched.
 *
 * @see Action
 *
 * @since 1.6
 * @author Armin Chen
 * @author George Zhang
 */
export class Desktop extends JObject {
  peer: DesktopPeer = null;
  /**
   * Suppresses default constructor for noninstantiability.
   */
  _Desktop(): this {
    let defaultToolkit = Toolkit.getDefaultToolkit();
    if ($J.isa(defaultToolkit, SunToolkit)) {
      this.peer = (defaultToolkit).createDesktopPeer(this);
    }
    return this;
  }
  /**
   * Returns the {@code Desktop} instance of the current
   * desktop context. On some platforms the Desktop API may not be
   * supported; use the {@link #isDesktopSupported} method to
   * determine if the current desktop is supported.
   * @return the Desktop instance
   * @throws HeadlessException if {@link
   * GraphicsEnvironment#isHeadless()} returns {@code true}
   * @throws UnsupportedOperationException if this class is not
   * supported on the current platform
   * @see #isDesktopSupported()
   * @see java.awt.GraphicsEnvironment#isHeadless
   */
  static getDesktop(): Desktop {
    if (GraphicsEnvironment.isHeadless()) {
      throw new HeadlessException()._HeadlessException$();
    }
    if (!Desktop.isDesktopSupported()) {
      throw new UnsupportedOperationException('Desktop API is not supported on the current platform');
    }
    let context = AppContext.getAppContext();
    let desktop = context.get($J.cls(Desktop));
    if (desktop == null) {
      desktop = new Desktop()._Desktop();
      context.put($J.cls(Desktop), desktop);
    }
    return desktop;
  }
  /**
   * Tests whether this class is supported on the current platform.
   * If it's supported, use {@link #getDesktop()} to retrieve an
   * instance.
   *
   * @return {@code true} if this class is supported on the
   *         current platform; {@code false} otherwise
   * @see #getDesktop()
   */
  static isDesktopSupported(): boolean {
    let defaultToolkit = Toolkit.getDefaultToolkit();
    if ($J.isa(defaultToolkit, SunToolkit)) {
      return (defaultToolkit).isDesktopSupported();
    }
    return false;
  }
  /**
   * Tests whether an action is supported on the current platform.
   *
   * <p>Even when the platform supports an action, a file or URI may
   * not have a registered application for the action.  For example,
   * most of the platforms support the {@link Desktop.Action#OPEN}
   * action.  But for a specific file, there may not be an
   * application registered to open it.  In this case, {@link
   * #isSupported(Action)} may return {@code true}, but the corresponding
   * action method will throw an {@link IOException}.
   *
   * @param action the specified {@link Action}
   * @return {@code true} if the specified action is supported on
   *         the current platform; {@code false} otherwise
   * @see Desktop.Action
   */
  isSupported(action: Desktop$Action): boolean {
    return this.peer.isSupported(action);
  }
  /**
   * Checks if the action type is supported.
   *
   * @param actionType the action type in question
   * @throws UnsupportedOperationException if the specified action type is not
   *         supported on the current platform
   */
  checkActionSupport(actionType: Desktop$Action): void {
    if (!this.isSupported(actionType)) {
      throw new UnsupportedOperationException('The ' + actionType.name() + ' action is not supported on the current platform!');
    }
  }
  /**
   * Calls to the security manager's {@code checkPermission} method with an
   * {@code AWTPermission("showWindowWithoutWarningBanner")} permission. This
   * permission is needed, because we cannot add a security warning icon to
   * the windows of the external native application.
   */
  checkAWTPermission(): void {
    let sm = $J.system_getSecurityManager();
    if (sm != null) {
      sm.checkPermission(new AWTPermission()._AWTPermission$String('showWindowWithoutWarningBanner'));
    }
  }
  /**
   * Launches the default browser to display a {@code URI}.
   * If the default browser is not able to handle the specified
   * {@code URI}, the application registered for handling
   * {@code URIs} of the specified type is invoked. The application
   * is determined from the protocol and path of the {@code URI}, as
   * defined by the {@code URI} class.
   *
   * @param uri the URI to be displayed in the user default browser
   * @throws NullPointerException if {@code uri} is {@code null}
   * @throws UnsupportedOperationException if the current platform
   * does not support the {@link Desktop.Action#BROWSE} action
   * @throws IOException if the user default browser is not found,
   * or it fails to be launched, or the default handler application
   * failed to be launched
   * @throws SecurityException if a security manager exists and it
   * denies the
   * {@code AWTPermission("showWindowWithoutWarningBanner")}
   * permission, or the calling thread is not allowed to create a
   * subprocess
   * @see java.net.URI
   * @see java.awt.AWTPermission
   */
  browse(uri: URI): void {
    this.checkAWTPermission();
    this.checkExec();
    this.checkActionSupport(Desktop$Action.BROWSE);
    Objects.requireNonNull(uri);
    this.peer.browse(uri);
  }
  checkExec(): void {
    let sm = $J.system_getSecurityManager();
    if (sm != null) {
      sm.checkPermission(new FilePermission('<<ALL FILES>>', 'execute'));
    }
  }
}

/**
 * Represents an action type.  Each platform supports a different
 * set of actions.  You may use the {@link Desktop#isSupported}
 * method to determine if the given action is supported by the
 * current platform.
 * @see java.awt.Desktop#isSupported(java.awt.Desktop.Action)
 * @since 1.6
 */
export class Desktop$Action extends JEnum {
  static OPEN: Desktop$Action = null;
  static EDIT: Desktop$Action = null;
  static PRINT: Desktop$Action = null;
  static MAIL: Desktop$Action = null;
  static BROWSE: Desktop$Action = null;
  static APP_EVENT_FOREGROUND: Desktop$Action = null;
  static APP_EVENT_HIDDEN: Desktop$Action = null;
  static APP_EVENT_REOPENED: Desktop$Action = null;
  static APP_EVENT_SCREEN_SLEEP: Desktop$Action = null;
  static APP_EVENT_SYSTEM_SLEEP: Desktop$Action = null;
  static APP_EVENT_USER_SESSION: Desktop$Action = null;
  static APP_ABOUT: Desktop$Action = null;
  static APP_PREFERENCES: Desktop$Action = null;
  static APP_OPEN_FILE: Desktop$Action = null;
  static APP_PRINT_FILE: Desktop$Action = null;
  static APP_OPEN_URI: Desktop$Action = null;
  static APP_QUIT_HANDLER: Desktop$Action = null;
  static APP_QUIT_STRATEGY: Desktop$Action = null;
  static APP_SUDDEN_TERMINATION: Desktop$Action = null;
  static APP_REQUEST_FOREGROUND: Desktop$Action = null;
  static APP_HELP_VIEWER: Desktop$Action = null;
  static APP_MENU_BAR: Desktop$Action = null;
  static BROWSE_FILE_DIR: Desktop$Action = null;
  static MOVE_TO_TRASH: Desktop$Action = null;
  static $VALUES: Desktop$Action[] = null;
  _Desktop$Action($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Desktop$Action[] { return Desktop$Action.$VALUES.slice(); }
  static valueOf(name: string): Desktop$Action { return $J.enumValueOf(Desktop$Action, name); }
  static $clinit() {
    Desktop$Action.OPEN = new Desktop$Action()._Desktop$Action('OPEN', 0);
    Desktop$Action.EDIT = new Desktop$Action()._Desktop$Action('EDIT', 1);
    Desktop$Action.PRINT = new Desktop$Action()._Desktop$Action('PRINT', 2);
    Desktop$Action.MAIL = new Desktop$Action()._Desktop$Action('MAIL', 3);
    Desktop$Action.BROWSE = new Desktop$Action()._Desktop$Action('BROWSE', 4);
    Desktop$Action.APP_EVENT_FOREGROUND = new Desktop$Action()._Desktop$Action('APP_EVENT_FOREGROUND', 5);
    Desktop$Action.APP_EVENT_HIDDEN = new Desktop$Action()._Desktop$Action('APP_EVENT_HIDDEN', 6);
    Desktop$Action.APP_EVENT_REOPENED = new Desktop$Action()._Desktop$Action('APP_EVENT_REOPENED', 7);
    Desktop$Action.APP_EVENT_SCREEN_SLEEP = new Desktop$Action()._Desktop$Action('APP_EVENT_SCREEN_SLEEP', 8);
    Desktop$Action.APP_EVENT_SYSTEM_SLEEP = new Desktop$Action()._Desktop$Action('APP_EVENT_SYSTEM_SLEEP', 9);
    Desktop$Action.APP_EVENT_USER_SESSION = new Desktop$Action()._Desktop$Action('APP_EVENT_USER_SESSION', 10);
    Desktop$Action.APP_ABOUT = new Desktop$Action()._Desktop$Action('APP_ABOUT', 11);
    Desktop$Action.APP_PREFERENCES = new Desktop$Action()._Desktop$Action('APP_PREFERENCES', 12);
    Desktop$Action.APP_OPEN_FILE = new Desktop$Action()._Desktop$Action('APP_OPEN_FILE', 13);
    Desktop$Action.APP_PRINT_FILE = new Desktop$Action()._Desktop$Action('APP_PRINT_FILE', 14);
    Desktop$Action.APP_OPEN_URI = new Desktop$Action()._Desktop$Action('APP_OPEN_URI', 15);
    Desktop$Action.APP_QUIT_HANDLER = new Desktop$Action()._Desktop$Action('APP_QUIT_HANDLER', 16);
    Desktop$Action.APP_QUIT_STRATEGY = new Desktop$Action()._Desktop$Action('APP_QUIT_STRATEGY', 17);
    Desktop$Action.APP_SUDDEN_TERMINATION = new Desktop$Action()._Desktop$Action('APP_SUDDEN_TERMINATION', 18);
    Desktop$Action.APP_REQUEST_FOREGROUND = new Desktop$Action()._Desktop$Action('APP_REQUEST_FOREGROUND', 19);
    Desktop$Action.APP_HELP_VIEWER = new Desktop$Action()._Desktop$Action('APP_HELP_VIEWER', 20);
    Desktop$Action.APP_MENU_BAR = new Desktop$Action()._Desktop$Action('APP_MENU_BAR', 21);
    Desktop$Action.BROWSE_FILE_DIR = new Desktop$Action()._Desktop$Action('BROWSE_FILE_DIR', 22);
    Desktop$Action.MOVE_TO_TRASH = new Desktop$Action()._Desktop$Action('MOVE_TO_TRASH', 23);
    Desktop$Action.$VALUES = [Desktop$Action.OPEN, Desktop$Action.EDIT, Desktop$Action.PRINT, Desktop$Action.MAIL, Desktop$Action.BROWSE, Desktop$Action.APP_EVENT_FOREGROUND, Desktop$Action.APP_EVENT_HIDDEN, Desktop$Action.APP_EVENT_REOPENED, Desktop$Action.APP_EVENT_SCREEN_SLEEP, Desktop$Action.APP_EVENT_SYSTEM_SLEEP, Desktop$Action.APP_EVENT_USER_SESSION, Desktop$Action.APP_ABOUT, Desktop$Action.APP_PREFERENCES, Desktop$Action.APP_OPEN_FILE, Desktop$Action.APP_PRINT_FILE, Desktop$Action.APP_OPEN_URI, Desktop$Action.APP_QUIT_HANDLER, Desktop$Action.APP_QUIT_STRATEGY, Desktop$Action.APP_SUDDEN_TERMINATION, Desktop$Action.APP_REQUEST_FOREGROUND, Desktop$Action.APP_HELP_VIEWER, Desktop$Action.APP_MENU_BAR, Desktop$Action.BROWSE_FILE_DIR, Desktop$Action.MOVE_TO_TRASH];
  }
}

$J.define(Desktop, 'java.awt.Desktop', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Desktop' }, meths: { 'mail(java.net.URI)': 'mail$URI', 'mail()': 'mail$' } });
$J.define(Desktop$Action, 'java.awt.Desktop$Action', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Desktop$Action' }, clinit: true, lazy: ['$VALUES', 'OPEN', 'EDIT', 'PRINT', 'MAIL', 'BROWSE', 'APP_EVENT_FOREGROUND', 'APP_EVENT_HIDDEN', 'APP_EVENT_REOPENED', 'APP_EVENT_SCREEN_SLEEP', 'APP_EVENT_SYSTEM_SLEEP', 'APP_EVENT_USER_SESSION', 'APP_ABOUT', 'APP_PREFERENCES', 'APP_OPEN_FILE', 'APP_PRINT_FILE', 'APP_OPEN_URI', 'APP_QUIT_HANDLER', 'APP_QUIT_STRATEGY', 'APP_SUDDEN_TERMINATION', 'APP_REQUEST_FOREGROUND', 'APP_HELP_VIEWER', 'APP_MENU_BAR', 'BROWSE_FILE_DIR', 'MOVE_TO_TRASH'] });
$J.module(() => {
  AWTPermission = $J.load('java.awt.AWTPermission');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  HeadlessException = $J.load('java.awt.HeadlessException');
});
