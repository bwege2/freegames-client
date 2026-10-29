// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/UIDefaults.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, Character, ClassCastException, ClassLoader, ClassNotFoundException, Exception, HashMap, Hashtable, IOException, Integer, InterruptedException, JBoolean, JClass, JError, JObject, JString, Locale, MethodUtil, MissingResourceException, NoSuchMethodException, PrintWriter, ReflectUtil, ResourceBundle, StringWriter, Throwable, UncheckedIOException, Vector } from '../../../jre/index.ts';

let Color, Dimension, Font, Insets, Icon, JComponent, LookAndFeel, SwingUtilities, Border, SwingPropertyChangeSupport, ComponentUI, SwingAccessor;

/**
 * A table of defaults for Swing components.  Applications can set/get
 * default values via the <code>UIManager</code>.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @see UIManager
 * @author Hans Muller
 * @since 1.2
 */
export class UIDefaults extends Hashtable {
  static PENDING: any = null;
  changeSupport: SwingPropertyChangeSupport = null;
  resourceBundles: Vector<string> = null;
  defaultLocale: Locale = null;
  /**
   * Maps from a Locale to a cached Map of the ResourceBundle. This is done
   * so as to avoid an exception being thrown when a value is asked for.
   * Access to this should be done while holding a lock on the
   * UIDefaults, eg synchronized(this).
   */
  resourceCache: JMap<Locale, JMap<string, any>> = null;
  $init_UIDefaults() {
    this.defaultLocale = Locale.getDefault();
  }
  /**
   * Creates an empty defaults table.
   */
  _UIDefaults$(): this {
    this._UIDefaults$int$float(700, 0.75);
    return this;
  }
  /**
   * Creates an empty defaults table with the specified initial capacity and
   * load factor.
   *
   * @param initialCapacity   the initial capacity of the defaults table
   * @param loadFactor        the load factor of the defaults table
   * @see java.util.Hashtable
   * @since 1.6
   */
  _UIDefaults$int$float(initialCapacity: number, loadFactor: number): this {
    this._Hashtable(initialCapacity, loadFactor);
    this.$init_UIDefaults();
    this.resourceCache = new HashMap();
    return this;
  }
  /**
   * Returns the value for key.  If the value is a
   * <code>UIDefaults.LazyValue</code> then the real
   * value is computed with <code>LazyValue.createValue()</code>,
   * the table entry is replaced, and the real value is returned.
   * If the value is an <code>UIDefaults.ActiveValue</code>
   * the table entry is not replaced - the value is computed
   * with <code>ActiveValue.createValue()</code> for each
   * <code>get()</code> call.
   *
   * If the key is not found in the table then it is searched for in the list
   * of resource bundles maintained by this object.  The resource bundles are
   * searched most recently added first using the locale returned by
   * <code>getDefaultLocale</code>.  <code>LazyValues</code> and
   * <code>ActiveValues</code> are not supported in the resource bundles.
   *
   *
   * @param key the desired key
   * @return the value for <code>key</code>
   * @see LazyValue
   * @see ActiveValue
   * @see java.util.Hashtable#get
   * @see #getDefaultLocale
   * @see #addResourceBundle
   * @since 1.4
   */
  get(key: any): any {
    let value = this.getFromHashtable(key);
    return (value != null) ? value : this.getFromResourceBundle(key, null);
  }
  /**
   * Looks up the given key in our Hashtable and resolves LazyValues
   * or ActiveValues.
   */
  getFromHashtable(key: any): any {
    let value = super.get(key);
    if ((value !== UIDefaults.PENDING) && !($J.isa(value, UIDefaults$ActiveValue)) && !($J.isa(value, UIDefaults$LazyValue))) {
      return value;
    }
    {
      value = super.get(key);
      if (value === UIDefaults.PENDING) {
        do {
          try {
            this.wait();
          } catch ($e0) {
            if ($J.isa($e0, InterruptedException)) {
              let e = $J.exc($e0);
            } else {
              throw $e0;
            }
          }
          value = super.get(key);
        } while (value === UIDefaults.PENDING);
        return value;
      } else if ($J.isa(value, UIDefaults$LazyValue)) {
        super.put(key, UIDefaults.PENDING);
      } else if (!($J.isa(value, UIDefaults$ActiveValue))) {
        return value;
      }
    }
    if ($J.isa(value, UIDefaults$LazyValue)) {
      try {
        value = $J.fn((value), 'createValue')(this);
      } finally {
        {
          if (value == null) {
            super.remove(key);
          } else {
            super.put(key, value);
          }
          this.notifyAll();
        }
      }
    } else {
      value = (value).createValue(this);
    }
    return value;
  }
  /**
   * Returns the value for key associated with the given locale.
   * If the value is a <code>UIDefaults.LazyValue</code> then the real
   * value is computed with <code>LazyValue.createValue()</code>,
   * the table entry is replaced, and the real value is returned.
   * If the value is an <code>UIDefaults.ActiveValue</code>
   * the table entry is not replaced - the value is computed
   * with <code>ActiveValue.createValue()</code> for each
   * <code>get()</code> call.
   *
   * If the key is not found in the table then it is searched for in the list
   * of resource bundles maintained by this object.  The resource bundles are
   * searched most recently added first using the given locale.
   * <code>LazyValues</code> and <code>ActiveValues</code> are not supported
   * in the resource bundles.
   *
   * @param key the desired key
   * @param l the desired <code>locale</code>
   * @return the value for <code>key</code>
   * @see LazyValue
   * @see ActiveValue
   * @see java.util.Hashtable#get
   * @see #addResourceBundle
   * @since 1.4
   */
  get$Object$Locale(key: any, l: Locale): any {
    let value = this.getFromHashtable(key);
    return (value != null) ? value : this.getFromResourceBundle(key, l);
  }
  /**
   * Looks up given key in our resource bundles.
   */
  getFromResourceBundle(key: any, l: Locale): any {
    if (this.resourceBundles == null || this.resourceBundles.isEmpty() || !($J.isa(key, JString))) {
      return null;
    }
    if (l == null) {
      if (this.defaultLocale == null) {
        return null;
      } else {
        l = this.defaultLocale;
      }
    }
    {
      return this.getResourceCache(l).get(key);
    }
  }
  /**
   * Returns a Map of the known resources for the given locale.
   */
  getResourceCache(l: Locale): JMap<string, any> {
    let values = this.resourceCache.get(l);
    if (values == null) {
      values = new UIDefaults$TextAndMnemonicHashMap()._UIDefaults$TextAndMnemonicHashMap();
      for (let i = (this.resourceBundles.size() - 1) | 0; i >= 0; i--) {
        let bundleName = this.resourceBundles.get(i);
        try {
          let b: ResourceBundle;
          if (UIDefaults.isDesktopResourceBundle(bundleName)) {
            b = ResourceBundle.getBundle(bundleName, l, $J.cls(UIDefaults).getModule());
          } else {
            b = ResourceBundle.getBundle(bundleName, l, ClassLoader.getSystemClassLoader());
          }
          let keys = b.getKeys();
          while (keys.hasMoreElements()) {
            let key = keys.nextElement();
            if (values.get(key) == null) {
              let value = b.getObject(key);
              values.put(key, value);
            }
          }
        } catch ($e1) {
          if ($J.isa($e1, MissingResourceException)) {
            let mre = $J.exc($e1);
          } else {
            throw $e1;
          }
        }
      }
      this.resourceCache.put(l, values);
    }
    return values;
  }
  static isDesktopResourceBundle(baseName: string): boolean {
    let thisModule = $J.cls(UIDefaults).getModule();
    return AccessController.doPrivileged(new (UIDefaults$1())().$c(thisModule, baseName));
  }
  /**
   * Sets the value of <code>key</code> to <code>value</code> for all locales.
   * If <code>key</code> is a string and the new value isn't
   * equal to the old one, fire a <code>PropertyChangeEvent</code>.
   * If value is <code>null</code>, the key is removed from the table.
   *
   * @param key    the unique <code>Object</code> who's value will be used
   *          to retrieve the data value associated with it
   * @param value  the new <code>Object</code> to store as data under
   *          that key
   * @return the previous <code>Object</code> value, or <code>null</code>
   * @see #putDefaults
   * @see java.util.Hashtable#put
   */
  put(key: any, value: any): any {
    let oldValue = (value == null) ? super.remove(key) : super.put(key, value);
    if ($J.isa(key, JString)) {
      this.firePropertyChange(key, oldValue, value);
    }
    return oldValue;
  }
  /**
   * Puts all of the key/value pairs in the database and
   * unconditionally generates one <code>PropertyChangeEvent</code>.
   * The events oldValue and newValue will be <code>null</code> and its
   * <code>propertyName</code> will be "UIDefaults".  The key/value pairs are
   * added for all locales.
   *
   * @param keyValueList  an array of key/value pairs
   * @see #put
   * @see java.util.Hashtable#put
   */
  putDefaults(keyValueList: any[]): void {
    for (let i = 0, max = keyValueList.length; i < max; i = (i + 2) | 0) {
      let value = keyValueList[(i + 1) | 0];
      if (value == null) {
        super.remove(keyValueList[i]);
      } else {
        super.put(keyValueList[i], value);
      }
    }
    this.firePropertyChange('UIDefaults', null, null);
  }
  /**
   * If the value of <code>key</code> is a <code>Font</code> return it,
   * otherwise return <code>null</code>.
   * @param key the desired key
   * @return if the value for <code>key</code> is a <code>Font</code>,
   *          return the <code>Font</code> object; otherwise return
   *          <code>null</code>
   */
  getFont$Object(key: any): Font {
    let value = this.get(key);
    return (value instanceof Font) ? value : null;
  }
  /**
   * If the value of <code>key</code> for the given <code>Locale</code>
   * is a <code>Font</code> return it, otherwise return <code>null</code>.
   * @param key the desired key
   * @param l the desired locale
   * @return if the value for <code>key</code> and <code>Locale</code>
   *          is a <code>Font</code>,
   *          return the <code>Font</code> object; otherwise return
   *          <code>null</code>
   * @since 1.4
   */
  getFont$Object$Locale(key: any, l: Locale): Font {
    let value = this.get$Object$Locale(key, l);
    return (value instanceof Font) ? value : null;
  }
  /**
   * If the value of <code>key</code> is a <code>Color</code> return it,
   * otherwise return <code>null</code>.
   * @param key the desired key
   * @return if the value for <code>key</code> is a <code>Color</code>,
   *          return the <code>Color</code> object; otherwise return
   *          <code>null</code>
   */
  getColor$Object(key: any): Color {
    let value = this.get(key);
    return (value instanceof Color) ? value : null;
  }
  /**
   * If the value of <code>key</code> for the given <code>Locale</code>
   * is a <code>Color</code> return it, otherwise return <code>null</code>.
   * @param key the desired key
   * @param l the desired locale
   * @return if the value for <code>key</code> and <code>Locale</code>
   *          is a <code>Color</code>,
   *          return the <code>Color</code> object; otherwise return
   *          <code>null</code>
   * @since 1.4
   */
  getColor$Object$Locale(key: any, l: Locale): Color {
    let value = this.get$Object$Locale(key, l);
    return (value instanceof Color) ? value : null;
  }
  /**
   * If the value of <code>key</code> is an <code>Icon</code> return it,
   * otherwise return <code>null</code>.
   * @param key the desired key
   * @return if the value for <code>key</code> is an <code>Icon</code>,
   *          return the <code>Icon</code> object; otherwise return
   *          <code>null</code>
   */
  getIcon$Object(key: any): Icon {
    let value = this.get(key);
    return ($J.isa(value, Icon)) ? value : null;
  }
  /**
   * If the value of <code>key</code> is a <code>Border</code> return it,
   * otherwise return <code>null</code>.
   * @param key the desired key
   * @return if the value for <code>key</code> is a <code>Border</code>,
   *          return the <code>Border</code> object; otherwise return
   *          <code>null</code>
   */
  getBorder$Object(key: any): Border {
    let value = this.get(key);
    return ($J.isa(value, Border)) ? value : null;
  }
  /**
   * If the value of <code>key</code> is a <code>String</code> return it,
   * otherwise return <code>null</code>.
   * @param key the desired key
   * @return if the value for <code>key</code> is a <code>String</code>,
   *          return the <code>String</code> object; otherwise return
   *          <code>null</code>
   */
  getString$Object(key: any): string {
    let value = this.get(key);
    return ($J.isa(value, JString)) ? value : null;
  }
  /**
   * If the value of <code>key</code> for the given <code>Locale</code>
   * is a <code>String</code> return it, otherwise return <code>null</code>.
   * @param key the desired key
   * @param l the desired <code>Locale</code>
   * @return if the value for <code>key</code> for the given
   *          <code>Locale</code> is a <code>String</code>,
   *          return the <code>String</code> object; otherwise return
   *          <code>null</code>
   * @since 1.4
   */
  getString$Object$Locale(key: any, l: Locale): string {
    let value = this.get$Object$Locale(key, l);
    return ($J.isa(value, JString)) ? value : null;
  }
  /**
   * If the value of <code>key</code> is an <code>Integer</code> return its
   * integer value, otherwise return 0.
   * @param key the desired key
   * @return if the value for <code>key</code> is an <code>Integer</code>,
   *          return its value, otherwise return 0
   */
  getInt$Object(key: any): number {
    let value = this.get(key);
    return ($J.isa(value, Integer)) ? (+(value)) : 0;
  }
  /**
   * If the value of <code>key</code> is boolean, return the
   * boolean value, otherwise return false.
   *
   * @param key an <code>Object</code> specifying the key for the desired boolean value
   * @return if the value of <code>key</code> is boolean, return the
   *         boolean value, otherwise return false.
   * @since 1.4
   */
  getBoolean$Object(key: any): boolean {
    let value = this.get(key);
    return ($J.isa(value, JBoolean)) ? (value) : false;
  }
  /**
   * If the value of <code>key</code> is an <code>Insets</code> return it,
   * otherwise return <code>null</code>.
   * @param key the desired key
   * @return if the value for <code>key</code> is an <code>Insets</code>,
   *          return the <code>Insets</code> object; otherwise return
   *          <code>null</code>
   */
  getInsets$Object(key: any): Insets {
    let value = this.get(key);
    return (value instanceof Insets) ? value : null;
  }
  /**
   * If the value of <code>key</code> is a <code>Dimension</code> return it,
   * otherwise return <code>null</code>.
   * @param key the desired key
   * @return if the value for <code>key</code> is a <code>Dimension</code>,
   *          return the <code>Dimension</code> object; otherwise return
   *          <code>null</code>
   */
  getDimension$Object(key: any): Dimension {
    let value = this.get(key);
    return (value instanceof Dimension) ? value : null;
  }
  /**
   * If the value of <code>key</code> for the given <code>Locale</code>
   * is a <code>Dimension</code> return it, otherwise return <code>null</code>.
   * @param key the desired key
   * @param l the desired locale
   * @return if the value for <code>key</code> and <code>Locale</code>
   *          is a <code>Dimension</code>,
   *          return the <code>Dimension</code> object; otherwise return
   *          <code>null</code>
   * @since 1.4
   */
  getDimension$Object$Locale(key: any, l: Locale): Dimension {
    let value = this.get$Object$Locale(key, l);
    return (value instanceof Dimension) ? value : null;
  }
  /**
   * The value of <code>get(uidClassID)</code> must be the
   * <code>String</code> name of a
   * class that implements the corresponding <code>ComponentUI</code>
   * class.  If the class hasn't been loaded before, this method looks
   * up the class with <code>uiClassLoader.loadClass()</code> if a non
   * <code>null</code>
   * class loader is provided, <code>classForName()</code> otherwise.
   * <p>
   * If a mapping for <code>uiClassID</code> exists or if the specified
   * class can't be found, return <code>null</code>.
   * <p>
   * This method is used by <code>getUI</code>, it's usually
   * not necessary to call it directly.
   *
   * @param uiClassID  a string containing the class ID
   * @param uiClassLoader the object which will load the class
   * @return the value of <code>Class.forName(get(uidClassID))</code>
   * @see #getUI
   */
  getUIClass$String$ClassLoader(uiClassID: string, uiClassLoader: ClassLoader): JClass<ComponentUI> {
    try {
      let className = this.get(uiClassID);
      if (className != null) {
        ReflectUtil.checkPackageAccess(className);
        let cls = this.get(className);
        if (cls == null) {
          if (uiClassLoader == null) {
            cls = SwingUtilities.loadSystemClass(className);
          } else {
            cls = uiClassLoader.loadClass(className);
          }
          if (cls != null) {
            this.put(className, cls);
          }
        }
        let tmp = cls;
        return tmp;
      }
    } catch ($e3) {
      if ($J.isa($e3, ClassNotFoundException) || $J.isa($e3, ClassCastException)) {
        let e = $J.exc($e3);
        return null;
      } else {
        throw $e3;
      }
    }
    return null;
  }
  /**
   * If <code>getUI()</code> fails for any reason,
   * it calls this method before returning <code>null</code>.
   * Subclasses may choose to do more or less here.
   *
   * @param msg message string to print
   * @see #getUI
   */
  getUIError(msg: string): void {
    try {
      throw new JError(msg);
    } catch ($e4) {
      {
        let e = $J.exc($e4);
        e.printStackTrace();
      }
    }
  }
  /**
   * Creates an <code>ComponentUI</code> implementation for the
   * specified component.  In other words create the look
   * and feel specific delegate object for <code>target</code>.
   * This is done in two steps:
   * <ul>
   * <li> Look up the name of the <code>ComponentUI</code> implementation
   * class under the value returned by <code>target.getUIClassID()</code>.
   * <li> Use the implementation classes static <code>createUI()</code>
   * method to construct a look and feel delegate.
   * </ul>
   * @param target  the <code>JComponent</code> which needs a UI
   * @return the <code>ComponentUI</code> object
   */
  getUI(target: JComponent): ComponentUI {
    let cl = this.get('ClassLoader');
    let uiClassLoader = (cl != null) ? cl : target.getClass().getClassLoader();
    let uiClass = this.getUIClass$String$ClassLoader(target.getUIClassID(), uiClassLoader);
    let uiObject = null;
    if (uiClass == null) {
      this.getUIError('no ComponentUI class for: ' + $J.str(target));
    } else {
      try {
        let m = this.get(uiClass);
        if (m == null) {
          m = uiClass.getMethod('createUI', ...[$J.cls(JComponent)]);
          this.put(uiClass, m);
        }
        if (uiClass.getModule() === $J.cls(ComponentUI).getModule()) {
          uiObject = m.invoke(null, ...[target]);
        } else {
          uiObject = MethodUtil.invoke(m, null, [target]);
        }
      } catch ($e5) {
        if ($J.isa($e5, NoSuchMethodException)) {
          let e = $J.exc($e5);
          this.getUIError('static createUI() method not found in ' + $J.str(uiClass));
        } else if ($J.isa($e5, Exception)) {
          let e = $J.exc($e5);
          let w = new StringWriter();
          let pw = new PrintWriter(w);
          e.printStackTrace(pw);
          pw.flush();
          this.getUIError('createUI() failed for ' + $J.str(target) + '\n' + $J.str(w));
        } else {
          throw $e5;
        }
      }
    }
    return uiObject;
  }
  /**
   * Adds a <code>PropertyChangeListener</code> to the listener list.
   * The listener is registered for all properties.
   * <p>
   * A <code>PropertyChangeEvent</code> will get fired whenever a default
   * is changed.
   *
   * @param listener  the <code>PropertyChangeListener</code> to be added
   * @see java.beans.PropertyChangeSupport
   */
  addPropertyChangeListener(listener: PropertyChangeListener): void {
    if (this.changeSupport == null) {
      this.changeSupport = new SwingPropertyChangeSupport()._SwingPropertyChangeSupport$Object(this);
    }
    this.changeSupport.addPropertyChangeListener$PropertyChangeListener(listener);
  }
  /**
   * Removes a <code>PropertyChangeListener</code> from the listener list.
   * This removes a <code>PropertyChangeListener</code> that was registered
   * for all properties.
   *
   * @param listener  the <code>PropertyChangeListener</code> to be removed
   * @see java.beans.PropertyChangeSupport
   */
  removePropertyChangeListener(listener: PropertyChangeListener): void {
    if (this.changeSupport != null) {
      this.changeSupport.removePropertyChangeListener$PropertyChangeListener(listener);
    }
  }
  /**
   * Support for reporting bound property changes.  If oldValue and
   * newValue are not equal and the <code>PropertyChangeEvent</code>x
   * listener list isn't empty, then fire a
   * <code>PropertyChange</code> event to each listener.
   *
   * @param propertyName  the programmatic name of the property
   *          that was changed
   * @param oldValue  the old value of the property
   * @param newValue  the new value of the property
   * @see java.beans.PropertyChangeSupport
   */
  firePropertyChange(propertyName: string, oldValue: any, newValue: any): void {
    if (this.changeSupport != null) {
      this.changeSupport.firePropertyChange$String$Object$Object(propertyName, oldValue, newValue);
    }
  }
  /**
   * This methods should be used to register internal resource bundles from
   * the java.desktop module.
   *
   * @param bundleName  the base name of the resource bundle to be added
   * @since 9
   */
  addInternalBundle(bundleName: string): void {
    if (bundleName == null) {
      return;
    }
    if (this.resourceBundles == null) {
      this.resourceBundles = new Vector(5);
    }
    if (!this.resourceBundles.contains(bundleName)) {
      this.resourceBundles.add(bundleName);
      this.resourceCache.clear();
    }
  }
  /**
   * Sets the default locale.  The default locale is used in retrieving
   * localized values via <code>get</code> methods that do not take a
   * locale argument.  As of release 1.4, Swing UI objects should retrieve
   * localized values using the locale of their component rather than the
   * default locale.  The default locale exists to provide compatibility with
   * pre 1.4 behaviour.
   *
   * @param l the new default locale
   * @see #getDefaultLocale
   * @see #get(Object)
   * @see #get(Object,Locale)
   * @since 1.4
   */
  setDefaultLocale(l: Locale): void {
    this.defaultLocale = l;
  }
  static $clinit() {
    UIDefaults.PENDING = new JObject();
    SwingAccessor.setUIDefaultsAccessor(($p0, $p1) => $p0.addInternalBundle($p1));
  }
}

/**
 * This class enables one to store an entry in the defaults
 * table that isn't constructed until the first time it's
 * looked up with one of the <code>getXXX(key)</code> methods.
 * Lazy values are useful for defaults that are expensive
 * to construct or are seldom retrieved.  The first time
 * a <code>LazyValue</code> is retrieved its "real value" is computed
 * by calling <code>LazyValue.createValue()</code> and the real
 * value is used to replace the <code>LazyValue</code> in the
 * <code>UIDefaults</code>
 * table.  Subsequent lookups for the same key return
 * the real value.  Here's an example of a <code>LazyValue</code>
 * that constructs a <code>Border</code>:
 * <pre>
 *  Object borderLazyValue = new UIDefaults.LazyValue() {
 *      public Object createValue(UIDefaults table) {
 *          return new BorderFactory.createLoweredBevelBorder();
 *      }
 *  };
 *
 *  uiDefaultsTable.put("MyBorder", borderLazyValue);
 * </pre>
 *
 * @see UIDefaults#get
 */
export class UIDefaults$LazyValue {
}

/**
 * This class enables one to store an entry in the defaults
 * table that's constructed each time it's looked up with one of
 * the <code>getXXX(key)</code> methods. Here's an example of
 * an <code>ActiveValue</code> that constructs a
 * <code>DefaultListCellRenderer</code>:
 * <pre>
 *  Object cellRendererActiveValue = new UIDefaults.ActiveValue() {
 *      public Object createValue(UIDefaults table) {
 *          return new DefaultListCellRenderer();
 *      }
 *  };
 *
 *  uiDefaultsTable.put("MyRenderer", cellRendererActiveValue);
 * </pre>
 *
 * @see UIDefaults#get
 */
export class UIDefaults$ActiveValue {
}

/**
 * <code>LazyInputMap</code> will create a <code>InputMap</code>
 * in its <code>createValue</code>
 * method. The bindings are passed in the constructor.
 * The bindings are an array with
 * the even number entries being string <code>KeyStrokes</code>
 * (eg "alt SPACE") and
 * the odd number entries being the value to use in the
 * <code>InputMap</code> (and the key in the <code>ActionMap</code>).
 * @since 1.3
 */
export class UIDefaults$LazyInputMap extends JObject {
  /**
   * Key bindings are registered under.
   */
  bindings: any[] = null;
  /**
   * Constructs a {@code LazyInputMap}.
   * @param bindings the bindings
   */
  _UIDefaults$LazyInputMap(bindings: any[]): this {
    this.bindings = bindings;
    return this;
  }
  /**
   * Creates an <code>InputMap</code> with the bindings that are
   * passed in.
   *
   * @param table a <code>UIDefaults</code> table
   * @return the <code>InputMap</code>
   */
  createValue(table: UIDefaults): any {
    if (this.bindings != null) {
      let km = LookAndFeel.makeInputMap(this.bindings);
      return km;
    }
    return null;
  }
}

/**
 * <code>TextAndMnemonicHashMap</code> stores swing resource strings. Many of strings
 * can have a mnemonic. For example:
 *   FileChooser.saveButton.textAndMnemonic=&Save
 * For this case method get returns "Save" for the key "FileChooser.saveButtonText" and
 * mnemonic "S" for the key "FileChooser.saveButtonMnemonic"
 *
 * There are several patterns for the text and mnemonic suffixes which are checked by the
 * <code>TextAndMnemonicHashMap</code> class.
 * Patterns which are converted to the xxx.textAndMnemonic key:
 * (xxxNameText, xxxNameMnemonic)
 * (xxxNameText, xxxMnemonic)
 * (xxx.nameText, xxx.mnemonic)
 * (xxxText, xxxMnemonic)
 *
 * These patterns can have a mnemonic index in format
 * (xxxDisplayedMnemonicIndex)
 *
 * Pattern which is converted to the xxx.titleAndMnemonic key:
 * (xxxTitle, xxxMnemonic)
 */
export class UIDefaults$TextAndMnemonicHashMap extends HashMap {
  static readonly AND_MNEMONIC: string = 'AndMnemonic';
  static readonly TITLE_SUFFIX: string = '.titleAndMnemonic';
  static readonly TEXT_SUFFIX: string = '.textAndMnemonic';
  _UIDefaults$TextAndMnemonicHashMap(): this {
    this._HashMap();
    return this;
  }
  get(key: any): any {
    let value = super.get(key);
    if (value == null) {
      let checkTitle = false;
      let stringKey = $J.str(key);
      let compositeKey = null;
      if (stringKey.endsWith(UIDefaults$TextAndMnemonicHashMap.AND_MNEMONIC)) {
        return null;
      }
      if (stringKey.endsWith('.mnemonic')) {
        compositeKey = this.composeKey(stringKey, 9, UIDefaults$TextAndMnemonicHashMap.TEXT_SUFFIX);
      } else if (stringKey.endsWith('NameMnemonic')) {
        compositeKey = this.composeKey(stringKey, 12, UIDefaults$TextAndMnemonicHashMap.TEXT_SUFFIX);
      } else if (stringKey.endsWith('Mnemonic')) {
        compositeKey = this.composeKey(stringKey, 8, UIDefaults$TextAndMnemonicHashMap.TEXT_SUFFIX);
        checkTitle = true;
      }
      if (compositeKey != null) {
        value = super.get(compositeKey);
        if (value == null && checkTitle) {
          compositeKey = this.composeKey(stringKey, 8, UIDefaults$TextAndMnemonicHashMap.TITLE_SUFFIX);
          value = super.get(compositeKey);
        }
        return value == null ? null : this.getMnemonicFromProperty($J.str(value));
      }
      if (stringKey.endsWith('NameText')) {
        compositeKey = this.composeKey(stringKey, 8, UIDefaults$TextAndMnemonicHashMap.TEXT_SUFFIX);
      } else if (stringKey.endsWith('.nameText')) {
        compositeKey = this.composeKey(stringKey, 9, UIDefaults$TextAndMnemonicHashMap.TEXT_SUFFIX);
      } else if (stringKey.endsWith('Text')) {
        compositeKey = this.composeKey(stringKey, 4, UIDefaults$TextAndMnemonicHashMap.TEXT_SUFFIX);
      } else if (stringKey.endsWith('Title')) {
        compositeKey = this.composeKey(stringKey, 5, UIDefaults$TextAndMnemonicHashMap.TITLE_SUFFIX);
      }
      if (compositeKey != null) {
        value = super.get(compositeKey);
        return value == null ? null : this.getTextFromProperty($J.str(value));
      }
      if (stringKey.endsWith('DisplayedMnemonicIndex')) {
        compositeKey = this.composeKey(stringKey, 22, UIDefaults$TextAndMnemonicHashMap.TEXT_SUFFIX);
        value = super.get(compositeKey);
        if (value == null) {
          compositeKey = this.composeKey(stringKey, 22, UIDefaults$TextAndMnemonicHashMap.TITLE_SUFFIX);
          value = super.get(compositeKey);
        }
        return value == null ? null : this.getIndexFromProperty($J.str(value));
      }
    }
    return value;
  }
  composeKey(key: string, reduce: number, sufix: string): string {
    return key.substring(0, (key.length - reduce) | 0) + sufix;
  }
  getTextFromProperty(text: string): string {
    return JString.replace(text, '&', '');
  }
  getMnemonicFromProperty(text: string): string {
    let index = text.indexOf(String.fromCharCode(38 /* '&' */));
    if (0 <= index && index < ((text.length - 1) | 0)) {
      let c = text.charCodeAt((index + 1) | 0);
      return String(Character.toUpperCase(c));
    }
    return null;
  }
  getIndexFromProperty(text: string): string {
    let index = text.indexOf(String.fromCharCode(38 /* '&' */));
    return (index === -1) ? null : String(index);
  }
}

let $UIDefaults$1: any = null;
/** An anonymous class (UIDefaults.java:347). */
function UIDefaults$1(): any {
  return $UIDefaults$1 ??= $J.local(class extends JObject {
    run(): boolean {
      let c = JClass.forName(this.$cv_thisModule, this.$cv_baseName);
      if (c != null) {
        return true;
      } else {
        let resourceName = JString.replaceChar(this.$cv_baseName, 46 /* '.' */, 47 /* \u002f */) + '.properties';
        {
          try {
            const in$ = this.$cv_thisModule.getResourceAsStream(resourceName);
            try {
              return in$ != null;
            } finally {
              if (in$ != null) in$.close();
            }
          } catch ($e2) {
            if ($J.isa($e2, IOException)) {
              let e = $J.exc($e2);
              throw new UncheckedIOException(e);
            } else {
              throw $e2;
            }
          }
        }
      }
    }
    $c($thisModule, $baseName): this {
      this.$cv_thisModule = $thisModule; this.$cv_baseName = $baseName;
      return this;
    }
  }, 'javax.swing.UIDefaults$1', ['java.security.PrivilegedAction']);
}

$J.define(UIDefaults, 'javax.swing.UIDefaults', { kind: 'class', sup: 'java.util.Hashtable', ctors: { 'java.lang.Object[]': '_UIDefaults$ObjectArr', 'int,float': '_UIDefaults$int$float', '': '_UIDefaults$' }, meths: { 'getUIClass(java.lang.String)': 'getUIClass$String', 'getUIClass(java.lang.String,java.lang.ClassLoader)': 'getUIClass$String$ClassLoader', 'getDimension(java.lang.Object,java.util.Locale)': 'getDimension$Object$Locale', 'getDimension(java.lang.Object)': 'getDimension$Object', 'getInsets(java.lang.Object,java.util.Locale)': 'getInsets$Object$Locale', 'getInsets(java.lang.Object)': 'getInsets$Object', 'getBoolean(java.lang.Object,java.util.Locale)': 'getBoolean$Object$Locale', 'getBoolean(java.lang.Object)': 'getBoolean$Object', 'getInt(java.lang.Object,java.util.Locale)': 'getInt$Object$Locale', 'getInt(java.lang.Object)': 'getInt$Object', 'getString(java.lang.Object,java.util.Locale)': 'getString$Object$Locale', 'getString(java.lang.Object)': 'getString$Object', 'getBorder(java.lang.Object,java.util.Locale)': 'getBorder$Object$Locale', 'getBorder(java.lang.Object)': 'getBorder$Object', 'getIcon(java.lang.Object,java.util.Locale)': 'getIcon$Object$Locale', 'getIcon(java.lang.Object)': 'getIcon$Object', 'getColor(java.lang.Object,java.util.Locale)': 'getColor$Object$Locale', 'getColor(java.lang.Object)': 'getColor$Object', 'getFont(java.lang.Object,java.util.Locale)': 'getFont$Object$Locale', 'getFont(java.lang.Object)': 'getFont$Object', 'get(java.lang.Object,java.util.Locale)': 'get$Object$Locale' }, clinit: true, lazy: ['PENDING'] });
$J.define(UIDefaults$LazyValue, 'javax.swing.UIDefaults$LazyValue', { kind: 'interface' });
$J.define(UIDefaults$ActiveValue, 'javax.swing.UIDefaults$ActiveValue', { kind: 'interface' });
$J.define(UIDefaults$LazyInputMap, 'javax.swing.UIDefaults$LazyInputMap', { kind: 'class', ifaces: ['javax.swing.UIDefaults$LazyValue'], sup: 'java.lang.Object', ctors: { 'java.lang.Object[]': '_UIDefaults$LazyInputMap' } });
$J.define(UIDefaults$TextAndMnemonicHashMap, 'javax.swing.UIDefaults$TextAndMnemonicHashMap', { kind: 'class', sup: 'java.util.HashMap', ctors: { '': '_UIDefaults$TextAndMnemonicHashMap' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Dimension = $J.load('java.awt.Dimension');
  Font = $J.load('java.awt.Font');
  Insets = $J.load('java.awt.Insets');
  Icon = $J.load('javax.swing.Icon');
  JComponent = $J.load('javax.swing.JComponent');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  Border = $J.load('javax.swing.border.Border');
  SwingPropertyChangeSupport = $J.load('javax.swing.event.SwingPropertyChangeSupport');
  ComponentUI = $J.load('javax.swing.plaf.ComponentUI');
  SwingAccessor = $J.load('sun.swing.SwingAccessor');
});
