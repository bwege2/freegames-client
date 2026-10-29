// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/swing/plaf/DesktopProperty.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2001, 2018, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AppContext, JObject, ReferenceQueue, StringBuilder, Toolkit, WeakReference } from '../../../../jre/index.ts';

let Color, Font, Frame, SwingUtilities, UIDefaults$ActiveValue, UIDefaults$LazyValue, UIManager, ColorUIResource, FontUIResource;

/**
 * Wrapper for a value from the desktop. The value is lazily looked up, and
 * can be accessed using the <code>UIManager.ActiveValue</code> method
 * <code>createValue</code>. If the underlying desktop property changes this
 * will force the UIs to update all known Frames. You can invoke
 * <code>invalidate</code> to force the value to be fetched again.
 */
export class DesktopProperty extends JObject {
  static DESKTOP_PROPERTY_UPDATE_PENDING_KEY: StringBuilder = null;
  /**
   * ReferenceQueue of unreferenced WeakPCLs.
   */
  static queue: ReferenceQueue<DesktopProperty> = null;
  /**
   * PropertyChangeListener attached to the Toolkit.
   */
  pcl: DesktopProperty$WeakPCL = null;
  /**
   * Key used to lookup value from desktop.
   */
  key: string = null;
  /**
   * Value to return.
   */
  value_: any = null;
  /**
   * Fallback value in case we get null from desktop.
   */
  fallback: any = null;
  /**
   * Creates a DesktopProperty.
   *
   * @param key Key used in looking up desktop value.
   * @param fallback Value used if desktop property is null.
   */
  _DesktopProperty(key: string, fallback: any): this {
    this.key = key;
    this.fallback = fallback;
    DesktopProperty.flushUnreferencedProperties();
    return this;
  }
  /**
   * Cleans up any lingering state held by unrefeernced
   * DesktopProperties.
   */
  static flushUnreferencedProperties(): void {
    let pcl: DesktopProperty$WeakPCL;
    while ((pcl = DesktopProperty.queue.poll()) != null) {
      pcl.dispose();
    }
  }
  /**
   * Sets whether or not an updateUI call is pending.
   */
  static setUpdatePending(update: boolean): void {
    AppContext.getAppContext().put(DesktopProperty.DESKTOP_PROPERTY_UPDATE_PENDING_KEY, update);
  }
  /**
   * Returns true if a UI update is pending.
   */
  static isUpdatePending(): boolean {
    return $J.equals(true, AppContext.getAppContext().get(DesktopProperty.DESKTOP_PROPERTY_UPDATE_PENDING_KEY));
  }
  /**
   * Updates the UIs of all the known Frames.
   */
  updateAllUIs(): void {
    let appFrames = Frame.getFrames();
    for (let appFrame of appFrames) {
      DesktopProperty.updateWindowUI(appFrame);
    }
  }
  /**
   * Updates the UI of the passed in window and all its children.
   */
  static updateWindowUI(window: Window): void {
    SwingUtilities.updateComponentTreeUI(window);
    let ownedWins = window.getOwnedWindows();
    for (let ownedWin of ownedWins) {
      DesktopProperty.updateWindowUI(ownedWin);
    }
  }
  /**
   * UIManager.LazyValue method, returns the value from the desktop
   * or the fallback value if the desktop value is null.
   */
  createValue(table: UIDefaults): any {
    if (this.value_ == null) {
      this.value_ = this.configureValue(this.getValueFromDesktop());
      if (this.value_ == null) {
        this.value_ = this.configureValue(this.getDefaultValue());
      }
    }
    return this.value_;
  }
  /**
   * Returns the value from the desktop.
   */
  getValueFromDesktop(): any {
    let toolkit = Toolkit.getDefaultToolkit();
    if (this.pcl == null) {
      this.pcl = new DesktopProperty$WeakPCL()._DesktopProperty$WeakPCL(this, this.getKey(), UIManager.getLookAndFeel());
      toolkit.addPropertyChangeListener(this.getKey(), $J.fn(this.pcl, 'propertyChange'));
    }
    return toolkit.getDesktopProperty(this.getKey());
  }
  /**
   * Invalidates the current value.
   *
   * @param laf the LookAndFeel this DesktopProperty was created with
   */
  invalidate$LookAndFeel(laf: LookAndFeel): void {
    this.invalidate$();
  }
  /**
   * Invalides the current value so that the next invocation of
   * <code>createValue</code> will ask for the property again.
   */
  invalidate$(): void {
    this.value_ = null;
  }
  /**
   * Requests that all components in the GUI hierarchy be updated
   * to reflect dynamic changes in this {@literal look&feel}. This update occurs
   * by uninstalling and re-installing the UI objects. Requests are
   * batched and collapsed into a single update pass because often
   * many desktop properties will change at once.
   */
  updateUI(): void {
    if (!DesktopProperty.isUpdatePending()) {
      DesktopProperty.setUpdatePending(true);
      let uiUpdater = () => {
        this.updateAllUIs();
        DesktopProperty.setUpdatePending(false);
      };
      SwingUtilities.invokeLater(uiUpdater);
    }
  }
  /**
   * Configures the value as appropriate for a defaults property in
   * the UIDefaults table.
   */
  configureValue(value: any): any {
    if (value != null) {
      if (value instanceof Color) {
        return new ColorUIResource()._ColorUIResource$Color(value);
      } else if (value instanceof Font) {
        return new FontUIResource()._FontUIResource$Font(value);
      } else if ($J.isa(value, UIDefaults$LazyValue)) {
        value = $J.fn((value), 'createValue')(null);
      } else if ($J.isa(value, UIDefaults$ActiveValue)) {
        value = (value).createValue(null);
      }
    }
    return value;
  }
  /**
   * Returns the key used to lookup the desktop properties value.
   */
  getKey(): string {
    return this.key;
  }
  static $clinit() {
    DesktopProperty.DESKTOP_PROPERTY_UPDATE_PENDING_KEY = new StringBuilder('DesktopPropertyUpdatePending');
    DesktopProperty.queue = new ReferenceQueue();
  }
}

/**
 * As there is typically only one Toolkit, the PropertyChangeListener
 * is handled via a WeakReference so as not to pin down the
 * DesktopProperty.
 */
export class DesktopProperty$WeakPCL extends WeakReference {
  key: string = null;
  laf: LookAndFeel = null;
  _DesktopProperty$WeakPCL(target: DesktopProperty, key: string, laf: LookAndFeel): this {
    this._WeakReference(target, DesktopProperty.queue);
    this.key = key;
    this.laf = laf;
    return this;
  }
  propertyChange(pce: PropertyChangeEvent): void {
    let property = this.get();
    if (property == null || this.laf !== UIManager.getLookAndFeel()) {
      this.dispose();
    } else {
      property.invalidate$LookAndFeel(this.laf);
      property.updateUI();
    }
  }
  dispose(): void {
    Toolkit.getDefaultToolkit().removePropertyChangeListener(this.key, $J.fn(this, 'propertyChange'));
  }
}

$J.define(DesktopProperty, 'sun.swing.plaf.DesktopProperty', { kind: 'class', ifaces: ['javax.swing.UIDefaults$ActiveValue'], sup: 'java.lang.Object', ctors: { 'java.lang.String,java.lang.Object': '_DesktopProperty' }, meths: { 'invalidate()': 'invalidate$', 'invalidate(javax.swing.LookAndFeel)': 'invalidate$LookAndFeel' }, clinit: true, lazy: ['DESKTOP_PROPERTY_UPDATE_PENDING_KEY', 'queue'] });
$J.define(DesktopProperty$WeakPCL, 'sun.swing.plaf.DesktopProperty$WeakPCL', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'java.lang.ref.WeakReference', ctors: { 'sun.swing.plaf.DesktopProperty,java.lang.String,javax.swing.LookAndFeel': '_DesktopProperty$WeakPCL' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Font = $J.load('java.awt.Font');
  Frame = $J.load('java.awt.Frame');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIDefaults$ActiveValue = $J.load('javax.swing.UIDefaults$ActiveValue');
  UIDefaults$LazyValue = $J.load('javax.swing.UIDefaults$LazyValue');
  UIManager = $J.load('javax.swing.UIManager');
  ColorUIResource = $J.load('javax.swing.plaf.ColorUIResource');
  FontUIResource = $J.load('javax.swing.plaf.FontUIResource');
});
