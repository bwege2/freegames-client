// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/StyleContext.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Collections, FontUtilities, Hashtable, JObject, JString, NoSuchElementException, Throwable, WeakHashMap, WeakReference } from '../../../../jre/index.ts';

let Font, SwingUtilities, ChangeEvent, ChangeListener, EventListenerList, AttributeSet, MutableAttributeSet, SimpleAttributeSet, StyleConstants;

/**
 * A pool of styles and their associated resources.  This class determines
 * the lifetime of a group of resources by being a container that holds
 * caches for various resources such as font and color that get reused
 * by the various style definitions.  This can be shared by multiple
 * documents if desired to maximize the sharing of related resources.
 * <p>
 * This class also provides efficient support for small sets of attributes
 * and compresses them by sharing across uses and taking advantage of
 * their immutable nature.  Since many styles are replicated, the potential
 * for sharing is significant, and copies can be extremely cheap.
 * Larger sets reduce the possibility of sharing, and therefore revert
 * automatically to a less space-efficient implementation.
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
 * @author  Timothy Prinzing
 */
export class StyleContext extends JObject {
  static defaultContext: StyleContext = null;
  /**
   * The name given to the default logical style attached
   * to paragraphs.
   */
  static readonly DEFAULT_STYLE: string = 'default';
  static freezeKeyMap: Hashtable<any, string> = null;
  static thawKeyMap: Hashtable<string, any> = null;
  styles: Style = null;
  fontSearch: StyleContext$FontKey = null;
  fontTable: Hashtable<StyleContext$FontKey, Font> = null;
  attributesPool: JMap<StyleContext$SmallAttributeSet, WeakReference<StyleContext$SmallAttributeSet>> = null;
  search_: MutableAttributeSet = null;
  /**
   * Number of immutable sets that are not currently
   * being used.  This helps indicate when the sets need
   * to be cleaned out of the hashtable they are stored
   * in.
   */
  unusedSets: number = 0;
  /**
   * The threshold for no longer sharing the set of attributes
   * in an immutable table.
   */
  static readonly THRESHOLD: number = 9;
  /**
   * Creates a new StyleContext object.
   */
  _StyleContext(): this {
    this.fontSearch = new StyleContext$FontKey()._StyleContext$FontKey(null, 0, 0);
    this.fontTable = new Hashtable();
    this.attributesPool = Collections.synchronizedMap(new WeakHashMap());
    this.search_ = new SimpleAttributeSet()._SimpleAttributeSet$();
    this.styles = new StyleContext$NamedStyle().$o(this)._StyleContext$NamedStyle$Style(null);
    this.addStyle(StyleContext.DEFAULT_STYLE, null);
    return this;
  }
  /**
   * Returns default AttributeContext shared by all documents that
   * don't bother to define/supply their own context.
   *
   * @return the context
   */
  static getDefaultStyleContext(): StyleContext {
    if (StyleContext.defaultContext == null) {
      StyleContext.defaultContext = new StyleContext()._StyleContext();
    }
    return StyleContext.defaultContext;
  }
  /**
   * Adds a new style into the style hierarchy.  Style attributes
   * resolve from bottom up so an attribute specified in a child
   * will override an attribute specified in the parent.
   *
   * @param nm   the name of the style (must be unique within the
   *   collection of named styles in the document).  The name may
   *   be null if the style is unnamed, but the caller is responsible
   *   for managing the reference returned as an unnamed style can't
   *   be fetched by name.  An unnamed style may be useful for things
   *   like character attribute overrides such as found in a style
   *   run.
   * @param parent the parent style.  This may be null if unspecified
   *   attributes need not be resolved in some other style.
   * @return the created style
   */
  addStyle(nm: string, parent: Style): Style {
    let style = new StyleContext$NamedStyle().$o(this)._StyleContext$NamedStyle$String$Style(nm, parent);
    if (nm != null) {
      this.styles.addAttribute(nm, style);
    }
    return style;
  }
  /**
   * Fetches a named style previously added to the document
   *
   * @param nm  the name of the style
   * @return the style
   */
  getStyle(nm: string): Style {
    return this.styles.getAttribute(nm);
  }
  /**
   * Fetches the names of the styles defined.
   *
   * @return the list of names as an enumeration
   */
  getStyleNames(): Enumeration<any> {
    return this.styles.getAttributeNames();
  }
  /**
   * Adds a listener to track when styles are added
   * or removed.
   *
   * @param l the change listener
   */
  addChangeListener(l: ChangeListener): void {
    this.styles.addChangeListener(l);
  }
  /**
   * Removes a listener that was tracking styles being
   * added or removed.
   *
   * @param l the change listener
   */
  removeChangeListener(l: ChangeListener): void {
    this.styles.removeChangeListener(l);
  }
  /**
   * Gets the font from an attribute set.  This is
   * implemented to try and fetch a cached font
   * for the given AttributeSet, and if that fails
   * the font features are resolved and the
   * font is fetched from the low-level font cache.
   *
   * @param attr the attribute set
   * @return the font
   */
  getFont$AttributeSet(attr: AttributeSet): Font {
    let style = Font.PLAIN;
    if (StyleConstants.isBold(attr)) {
      style |= Font.BOLD;
    }
    if (StyleConstants.isItalic(attr)) {
      style |= Font.ITALIC;
    }
    let family = StyleConstants.getFontFamily(attr);
    let size = StyleConstants.getFontSize(attr);
    if (StyleConstants.isSuperscript(attr) || StyleConstants.isSubscript(attr)) {
      size = (size - 2) | 0;
    }
    return this.getFont$String$int$int(family, style, size);
  }
  /**
   * Takes a set of attributes and turn it into a foreground color
   * specification.  This might be used to specify things
   * like brighter, more hue, etc.  By default it simply returns
   * the value specified by the StyleConstants.Foreground attribute.
   *
   * @param attr the set of attributes
   * @return the color
   */
  getForeground$AttributeSet(attr: AttributeSet): Color {
    return StyleConstants.getForeground(attr);
  }
  /**
   * Takes a set of attributes and turn it into a background color
   * specification.  This might be used to specify things
   * like brighter, more hue, etc.  By default it simply returns
   * the value specified by the StyleConstants.Background attribute.
   *
   * @param attr the set of attributes
   * @return the color
   */
  getBackground$AttributeSet(attr: AttributeSet): Color {
    return StyleConstants.getBackground(attr);
  }
  /**
   * Gets a new font.  This returns a Font from a cache
   * if a cached font exists.  If not, a Font is added to
   * the cache.  This is basically a low-level cache for
   * 1.1 font features.
   *
   * @param family the font family (such as "Monospaced")
   * @param style the style of the font (such as Font.PLAIN)
   * @param size the point size &gt;= 1
   * @return the new font
   */
  getFont$String$int$int(family: string, style: number, size: number): Font {
    this.fontSearch.setValue(family, style, size);
    let f = this.fontTable.get(this.fontSearch);
    if (f == null) {
      let defaultStyle = this.getStyle(StyleContext.DEFAULT_STYLE);
      if (defaultStyle != null) {
        let FONT_ATTRIBUTE_KEY = 'FONT_ATTRIBUTE_KEY';
        let defaultFont = defaultStyle.getAttribute(FONT_ATTRIBUTE_KEY);
        if (defaultFont != null && JString.equalsIgnoreCase(defaultFont.getFamily$(), family)) {
          f = defaultFont.deriveFont$int$float(style, Math.fround(size));
        }
      }
      if (f == null) {
        f = new Font()._Font$String$int$int(family, style, size);
      }
      if (!FontUtilities.fontSupportsDefaultEncoding(f)) {
        f = FontUtilities.getCompositeFontUIResource(f);
      }
      let key = new StyleContext$FontKey()._StyleContext$FontKey(family, style, size);
      this.fontTable.put(key, f);
    }
    return f;
  }
  /**
   * Adds an attribute to the given set, and returns
   * the new representative set.
   * <p>
   * This method is thread safe, although most Swing methods
   * are not. Please see
   * <A HREF="https://docs.oracle.com/javase/tutorial/uiswing/concurrency/index.html">Concurrency
   * in Swing</A> for more information.
   *
   * @param old the old attribute set
   * @param name the non-null attribute name
   * @param value the attribute value
   * @return the updated attribute set
   * @see MutableAttributeSet#addAttribute
   */
  addAttribute(old: AttributeSet, name: any, value: any): AttributeSet {
    if (((old.getAttributeCount() + 1) | 0) <= this.getCompressionThreshold()) {
      this.search_.removeAttributes$AttributeSet(this.search_);
      this.search_.addAttributes(old);
      this.search_.addAttribute(name, value);
      this.reclaim(old);
      return this.getImmutableUniqueSet();
    }
    let ma = this.getMutableAttributeSet(old);
    ma.addAttribute(name, value);
    return ma;
  }
  /**
   * Adds a set of attributes to the element.
   * <p>
   * This method is thread safe, although most Swing methods
   * are not. Please see
   * <A HREF="https://docs.oracle.com/javase/tutorial/uiswing/concurrency/index.html">Concurrency
   * in Swing</A> for more information.
   *
   * @param old the old attribute set
   * @param attr the attributes to add
   * @return the updated attribute set
   * @see MutableAttributeSet#addAttribute
   */
  addAttributes(old: AttributeSet, attr: AttributeSet): AttributeSet {
    if (((old.getAttributeCount() + attr.getAttributeCount()) | 0) <= this.getCompressionThreshold()) {
      this.search_.removeAttributes$AttributeSet(this.search_);
      this.search_.addAttributes(old);
      this.search_.addAttributes(attr);
      this.reclaim(old);
      return this.getImmutableUniqueSet();
    }
    let ma = this.getMutableAttributeSet(old);
    ma.addAttributes(attr);
    return ma;
  }
  /**
   * Removes an attribute from the set.
   * <p>
   * This method is thread safe, although most Swing methods
   * are not. Please see
   * <A HREF="https://docs.oracle.com/javase/tutorial/uiswing/concurrency/index.html">Concurrency
   * in Swing</A> for more information.
   *
   * @param old the old set of attributes
   * @param name the non-null attribute name
   * @return the updated attribute set
   * @see MutableAttributeSet#removeAttribute
   */
  removeAttribute(old: AttributeSet, name: any): AttributeSet {
    if (((old.getAttributeCount() - 1) | 0) <= this.getCompressionThreshold()) {
      this.search_.removeAttributes$AttributeSet(this.search_);
      this.search_.addAttributes(old);
      this.search_.removeAttribute(name);
      this.reclaim(old);
      return this.getImmutableUniqueSet();
    }
    let ma = this.getMutableAttributeSet(old);
    ma.removeAttribute(name);
    return ma;
  }
  /**
   * Removes a set of attributes for the element.
   * <p>
   * This method is thread safe, although most Swing methods
   * are not. Please see
   * <A HREF="https://docs.oracle.com/javase/tutorial/uiswing/concurrency/index.html">Concurrency
   * in Swing</A> for more information.
   *
   * @param old the old attribute set
   * @param attrs the attributes
   * @return the updated attribute set
   * @see MutableAttributeSet#removeAttributes
   */
  removeAttributes$AttributeSet$AttributeSet(old: AttributeSet, attrs: AttributeSet): AttributeSet {
    if (old.getAttributeCount() <= this.getCompressionThreshold()) {
      this.search_.removeAttributes$AttributeSet(this.search_);
      this.search_.addAttributes(old);
      this.search_.removeAttributes$AttributeSet(attrs);
      this.reclaim(old);
      return this.getImmutableUniqueSet();
    }
    let ma = this.getMutableAttributeSet(old);
    ma.removeAttributes$AttributeSet(attrs);
    return ma;
  }
  /**
   * Fetches an empty AttributeSet.
   *
   * @return the set
   */
  getEmptySet(): AttributeSet {
    return SimpleAttributeSet.EMPTY;
  }
  /**
   * Returns a set no longer needed by the MutableAttributeSet implementation.
   * This is useful for operation under 1.1 where there are no weak
   * references.  This would typically be called by the finalize method
   * of the MutableAttributeSet implementation.
   * <p>
   * This method is thread safe, although most Swing methods
   * are not. Please see
   * <A HREF="https://docs.oracle.com/javase/tutorial/uiswing/concurrency/index.html">Concurrency
   * in Swing</A> for more information.
   *
   * @param a the set to reclaim
   */
  reclaim(a: AttributeSet): void {
    if (SwingUtilities.isEventDispatchThread()) {
      this.attributesPool.size();
    }
  }
  /**
   * Returns the maximum number of key/value pairs to try and
   * compress into unique/immutable sets.  Any sets above this
   * limit will use hashtables and be a MutableAttributeSet.
   *
   * @return the threshold
   */
  getCompressionThreshold(): number {
    return StyleContext.THRESHOLD;
  }
  /**
   * Create a compact set of attributes that might be shared.
   * This is a hook for subclasses that want to alter the
   * behavior of SmallAttributeSet.  This can be reimplemented
   * to return an AttributeSet that provides some sort of
   * attribute conversion.
   * @param a The set of attributes to be represented in the
   *  the compact form.
   * @return a compact set of attributes that might be shared
   */
  createSmallAttributeSet$AttributeSet(a: AttributeSet): StyleContext$SmallAttributeSet {
    return new StyleContext$SmallAttributeSet().$o(this)._StyleContext$SmallAttributeSet$AttributeSet(a);
  }
  /**
   * Create a large set of attributes that should trade off
   * space for time.  This set will not be shared.  This is
   * a hook for subclasses that want to alter the behavior
   * of the larger attribute storage format (which is
   * SimpleAttributeSet by default).   This can be reimplemented
   * to return a MutableAttributeSet that provides some sort of
   * attribute conversion.
   *
   * @param a The set of attributes to be represented in the
   *  the larger form.
   * @return a large set of attributes that should trade off
   * space for time
   */
  createLargeAttributeSet$AttributeSet(a: AttributeSet): MutableAttributeSet {
    return new SimpleAttributeSet()._SimpleAttributeSet$AttributeSet(a);
  }
  /**
   * Clean the unused immutable sets out of the hashtable.
   */
  removeUnusedSets(): void {
    this.attributesPool.size();
  }
  /**
   * Search for an existing attribute set using the current search
   * parameters.  If a matching set is found, return it.  If a match
   * is not found, we create a new set and add it to the pool.
   */
  getImmutableUniqueSet(): AttributeSet {
    let key = this.createSmallAttributeSet$AttributeSet(this.search_);
    let reference = this.attributesPool.get(key);
    let a: StyleContext$SmallAttributeSet;
    if (reference == null || (a = reference.get()) == null) {
      a = key;
      this.attributesPool.put(a, new WeakReference(a));
    }
    return a;
  }
  /**
   * Creates a mutable attribute set to hand out because the current
   * needs are too big to try and use a shared version.
   */
  getMutableAttributeSet(a: AttributeSet): MutableAttributeSet {
    if ($J.isa(a, MutableAttributeSet) && a !== SimpleAttributeSet.EMPTY) {
      return a;
    }
    return this.createLargeAttributeSet$AttributeSet(a);
  }
  /**
   * Converts a StyleContext to a String.
   *
   * @return the string
   */
  toString(): string {
    this.removeUnusedSets();
    let s = '';
    for (const $it0 = this.attributesPool.keySet().iterator(); $it0.hasNext(); ) {
      let set$ = $it0.next();
      s = s + $J.str(set$) + '\n';
    }
    return s;
  }
  /**
   * Registers an object as a static object that is being
   * used as a key in attribute sets.  This allows the key
   * to be treated specially for serialization.
   * <p>
   * For operation under a 1.1 virtual machine, this
   * uses the value returned by <code>toString</code>
   * concatenated to the classname.  The value returned
   * by toString should not have the class reference
   * in it (ie it should be reimplemented from the
   * definition in Object) in order to be the same when
   * recomputed later.
   *
   * @param key the non-null object key
   */
  static registerStaticAttributeKey(key: any): void {
    let ioFmt = $J.getClass(key).getName() + '.' + $J.str(key);
    if (StyleContext.freezeKeyMap == null) {
      StyleContext.freezeKeyMap = new Hashtable();
      StyleContext.thawKeyMap = new Hashtable();
    }
    StyleContext.freezeKeyMap.put(key, ioFmt);
    StyleContext.thawKeyMap.put(ioFmt, key);
  }
  removeAttributes(...a: any[]): any {
    if (a.length === 2 && (a[0] == null || $J.isa(a[0], AttributeSet)) && (a[1] == null || $J.isa(a[1], AttributeSet))) return this.removeAttributes$AttributeSet$AttributeSet(...a);
    throw new Error('no overload of removeAttributes for these arguments');
  }
  static $clinit() {
    try {
      let n = StyleConstants.keys.length;
      for (let i = 0; i < n; i++) {
        StyleContext.registerStaticAttributeKey(StyleConstants.keys[i]);
      }
    } catch ($e1) {
      {
        let e = $J.exc($e1);
        e.printStackTrace();
      }
    }
  }
}

/**
 * This class holds a small number of attributes in an array.
 * The storage format is key, value, key, value, etc.  The size
 * of the set is the length of the array divided by two.  By
 * default, this is the class that will be used to store attributes
 * when held in the compact shareable form.
 */
export class StyleContext$SmallAttributeSet extends JObject {
  attributes: any[] = null;
  resolveParent: AttributeSet = null;
  /**
   * Constructs a SmallAttributeSet.
   * @param attrs the attributes
   */
  _StyleContext$SmallAttributeSet$AttributeSet(attrs: AttributeSet): this {
    let n = attrs.getAttributeCount();
    let tbl = $J.newArray(Math.imul(2, n), null);
    let names = attrs.getAttributeNames();
    let i = 0;
    while (names.hasMoreElements()) {
      tbl[i] = names.nextElement();
      (tbl[(i + 1) | 0]) = attrs.getAttribute(tbl[i]);
      i = (i + 2) | 0;
    }
    this.attributes = tbl;
    this.updateResolveParent();
    return this;
  }
  updateResolveParent(): void {
    this.resolveParent = null;
    let tbl = this.attributes;
    for (let i = 0; i < tbl.length; i = (i + 2) | 0) {
      if (tbl[i] === StyleConstants.ResolveAttribute) {
        this.resolveParent = tbl[(i + 1) | 0];
        break;
      }
    }
  }
  getLocalAttribute(nm: any): any {
    if (nm === StyleConstants.ResolveAttribute) {
      return this.resolveParent;
    }
    let tbl = this.attributes;
    for (let i = 0; i < tbl.length; i = (i + 2) | 0) {
      if ($J.equals(nm, tbl[i])) {
        return tbl[(i + 1) | 0];
      }
    }
    return null;
  }
  /**
   * Returns a string showing the key/value pairs.
   * @return a string showing the key/value pairs
   */
  toString(): string {
    let s = '{';
    let tbl = this.attributes;
    for (let i = 0; i < tbl.length; i = (i + 2) | 0) {
      if ($J.isa((tbl[(i + 1) | 0]), AttributeSet)) {
        s = s + $J.str(tbl[i]) + '=AttributeSet,';
      } else {
        s = s + $J.str(tbl[i]) + '=' + $J.str(tbl[(i + 1) | 0]) + ',';
      }
    }
    s = s + '}';
    return s;
  }
  /**
   * Returns a hashcode for this set of attributes.
   * @return     a hashcode value for this set of attributes.
   */
  hashCode(): number {
    let code = 0;
    let tbl = this.attributes;
    for (let i = 1; i < tbl.length; i = (i + 2) | 0) {
      code ^= $J.hashCode(tbl[i]);
    }
    return code;
  }
  /**
   * Compares this object to the specified object.
   * The result is <code>true</code> if the object is an equivalent
   * set of attributes.
   * @param     obj   the object to compare with.
   * @return    <code>true</code> if the objects are equal;
   *            <code>false</code> otherwise.
   */
  equals(obj: any): boolean {
    if ($J.isa(obj, AttributeSet)) {
      let attrs = obj;
      return ((this.getAttributeCount() === attrs.getAttributeCount()) && this.containsAttributes(attrs));
    }
    return false;
  }
  /**
   * Clones a set of attributes.  Since the set is immutable, a
   * clone is basically the same set.
   *
   * @return the set of attributes
   */
  clone(): any {
    return this;
  }
  /**
   * Gets the number of attributes that are defined.
   *
   * @return the number of attributes
   * @see AttributeSet#getAttributeCount
   */
  getAttributeCount(): number {
    return $J.idiv(this.attributes.length, 2);
  }
  /**
   * Checks whether a given attribute is defined.
   *
   * @param key the attribute key
   * @return true if the attribute is defined
   * @see AttributeSet#isDefined
   */
  isDefined(key: any): boolean {
    let a = this.attributes;
    let n = a.length;
    for (let i = 0; i < n; i = (i + 2) | 0) {
      if ($J.equals(key, a[i])) {
        return true;
      }
    }
    return false;
  }
  /**
   * Checks whether two attribute sets are equal.
   *
   * @param attr the attribute set to check against
   * @return true if the same
   * @see AttributeSet#isEqual
   */
  isEqual(attr: AttributeSet): boolean {
    if (attr instanceof StyleContext$SmallAttributeSet) {
      return attr === this;
    }
    return ((this.getAttributeCount() === attr.getAttributeCount()) && this.containsAttributes(attr));
  }
  /**
   * Copies a set of attributes.
   *
   * @return the copy
   * @see AttributeSet#copyAttributes
   */
  copyAttributes(): AttributeSet {
    return this;
  }
  /**
   * Gets the value of an attribute.
   *
   * @param key the attribute name
   * @return the attribute value
   * @see AttributeSet#getAttribute
   */
  getAttribute(key: any): any {
    let value = this.getLocalAttribute(key);
    if (value == null) {
      let parent = this.getResolveParent();
      if (parent != null) {
        value = parent.getAttribute(key);
      }
    }
    return value;
  }
  /**
   * Gets the names of all attributes.
   *
   * @return the attribute names
   * @see AttributeSet#getAttributeNames
   */
  getAttributeNames(): Enumeration<any> {
    return new StyleContext$KeyEnumeration()._StyleContext$KeyEnumeration(this.attributes);
  }
  /**
   * Checks whether the attribute set contains all of
   * the given attributes.
   *
   * @param attrs the attributes to check
   * @return true if the element contains all the attributes
   * @see AttributeSet#containsAttributes
   */
  containsAttributes(attrs: AttributeSet): boolean {
    let result = true;
    let names = attrs.getAttributeNames();
    while (result && names.hasMoreElements()) {
      let name = names.nextElement();
      result = $J.equals(attrs.getAttribute(name), this.getAttribute(name));
    }
    return result;
  }
  /**
   * If not overridden, the resolving parent defaults to
   * the parent element.
   *
   * @return the attributes from the parent
   * @see AttributeSet#getResolveParent
   */
  getResolveParent(): AttributeSet {
    return this.resolveParent;
  }
}

/**
 * An enumeration of the keys in a SmallAttributeSet.
 */
export class StyleContext$KeyEnumeration extends JObject {
  attr: any[] = null;
  i: number = 0;
  _StyleContext$KeyEnumeration(attr: any[]): this {
    this.attr = attr;
    this.i = 0;
    return this;
  }
  /**
   * Tests if this enumeration contains more elements.
   *
   * @return  <code>true</code> if this enumeration contains more elements;
   *          <code>false</code> otherwise.
   * @since   1.0
   */
  hasMoreElements(): boolean {
    return this.i < this.attr.length;
  }
  /**
   * Returns the next element of this enumeration.
   *
   * @return     the next element of this enumeration.
   * @throws  NoSuchElementException  if no more elements exist.
   * @since      1.0
   */
  nextElement(): any {
    if (this.i < this.attr.length) {
      let o = this.attr[this.i];
      this.i = (this.i + 2) | 0;
      return o;
    }
    throw new NoSuchElementException();
  }
}

/**
 * key for a font table
 */
export class StyleContext$FontKey extends JObject {
  family: string = null;
  style: number = 0;
  size_: number = 0;
  /**
   * Constructs a font key.
   */
  _StyleContext$FontKey(family: string, style: number, size: number): this {
    this.setValue(family, style, size);
    return this;
  }
  setValue(family: string, style: number, size: number): void {
    this.family = (family != null) ? family : null;
    this.style = style;
    this.size_ = size;
  }
  /**
   * Returns a hashcode for this font.
   * @return     a hashcode value for this font.
   */
  hashCode(): number {
    let fhash = (this.family != null) ? $J.hashCode(this.family) : 0;
    return fhash ^ this.style ^ this.size_;
  }
  /**
   * Compares this object to the specified object.
   * The result is <code>true</code> if and only if the argument is not
   * <code>null</code> and is a <code>Font</code> object with the same
   * name, style, and point size as this font.
   * @param     obj   the object to compare this font with.
   * @return    <code>true</code> if the objects are equal;
   *            <code>false</code> otherwise.
   */
  equals(obj: any): boolean {
    if (obj instanceof StyleContext$FontKey) {
      let font = obj;
      return (this.size_ === font.size_) && (this.style === font.style) && (this.family === font.family);
    }
    return false;
  }
}

/**
 * A collection of attributes, typically used to represent
 * character and paragraph styles.  This is an implementation
 * of MutableAttributeSet that can be observed if desired.
 * These styles will take advantage of immutability while
 * the sets are small enough, and may be substantially more
 * efficient than something like SimpleAttributeSet.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 */
export class StyleContext$NamedStyle extends JObject {
  /**
   * The change listeners for the model.
   */
  listenerList: EventListenerList = null;
  /**
   * Only one ChangeEvent is needed per model instance since the
   * event's only (read-only) state is the source property.  The source
   * of events generated here is always "this".
   */
  changeEvent: ChangeEvent = null;
  /**
   * Inner AttributeSet implementation, which may be an
   * immutable unique set being shared.
   */
  attributes: AttributeSet = null;
  $init_StyleContext_NamedStyle() {
    this.listenerList = new EventListenerList()._EventListenerList();
    this.changeEvent = null;
  }
  /**
   * Creates a new named style.
   *
   * @param name the style name, null for unnamed
   * @param parent the parent style, null if none
   * @since 1.4
   */
  _StyleContext$NamedStyle$String$Style(name: string, parent: Style): this {
    this.$init_StyleContext_NamedStyle();
    this.attributes = this.$outer.getEmptySet();
    if (name != null) {
      this.setName(name);
    }
    if (parent != null) {
      this.setResolveParent(parent);
    }
    return this;
  }
  /**
   * Creates a new named style.
   *
   * @param parent the parent style, null if none
   * @since 1.4
   */
  _StyleContext$NamedStyle$Style(parent: Style): this {
    this._StyleContext$NamedStyle$String$Style(null, parent);
    return this;
  }
  /**
   * Creates a new named style, with a null name and parent.
   */
  _StyleContext$NamedStyle$(): this {
    this.$init_StyleContext_NamedStyle();
    this.attributes = this.$outer.getEmptySet();
    return this;
  }
  /**
   * Converts the style to a string.
   *
   * @return the string
   */
  toString(): string {
    return 'NamedStyle:' + this.getName() + ' ' + $J.str(this.attributes);
  }
  /**
   * Fetches the name of the style.   A style is not required to be named,
   * so null is returned if there is no name associated with the style.
   *
   * @return the name
   */
  getName(): string {
    if (this.isDefined(StyleConstants.NameAttribute)) {
      return $J.str(this.getAttribute(StyleConstants.NameAttribute));
    }
    return null;
  }
  /**
   * Changes the name of the style.  Does nothing with a null name.
   *
   * @param name the new name
   */
  setName(name: string): void {
    if (name != null) {
      this.addAttribute(StyleConstants.NameAttribute, name);
    }
  }
  /**
   * Adds a change listener.
   *
   * @param l the change listener
   */
  addChangeListener(l: ChangeListener): void {
    this.listenerList.add($J.cls(ChangeListener), l);
  }
  /**
   * Removes a change listener.
   *
   * @param l the change listener
   */
  removeChangeListener(l: ChangeListener): void {
    this.listenerList.remove($J.cls(ChangeListener), l);
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the parameters passed into
   * the fire method.
   *
   * @see EventListenerList
   */
  fireStateChanged(): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ChangeListener)) {
        if (this.changeEvent == null) {
          this.changeEvent = new ChangeEvent()._ChangeEvent(this);
        }
        $J.fn((listeners[(i + 1) | 0]), 'stateChanged')(this.changeEvent);
      }
    }
  }
  /**
   * Gets the number of attributes that are defined.
   *
   * @return the number of attributes &gt;= 0
   * @see AttributeSet#getAttributeCount
   */
  getAttributeCount(): number {
    return this.attributes.getAttributeCount();
  }
  /**
   * Checks whether a given attribute is defined.
   *
   * @param attrName the non-null attribute name
   * @return true if the attribute is defined
   * @see AttributeSet#isDefined
   */
  isDefined(attrName: any): boolean {
    return this.attributes.isDefined(attrName);
  }
  /**
   * Checks whether two attribute sets are equal.
   *
   * @param attr the attribute set to check against
   * @return true if the same
   * @see AttributeSet#isEqual
   */
  isEqual(attr: AttributeSet): boolean {
    return this.attributes.isEqual(attr);
  }
  /**
   * Copies a set of attributes.
   *
   * @return the copy
   * @see AttributeSet#copyAttributes
   */
  copyAttributes(): AttributeSet {
    let a = new StyleContext$NamedStyle().$o(this.$outer)._StyleContext$NamedStyle$();
    a.attributes = this.attributes.copyAttributes();
    return a;
  }
  /**
   * Gets the value of an attribute.
   *
   * @param attrName the non-null attribute name
   * @return the attribute value
   * @see AttributeSet#getAttribute
   */
  getAttribute(attrName: any): any {
    return this.attributes.getAttribute(attrName);
  }
  /**
   * Gets the names of all attributes.
   *
   * @return the attribute names as an enumeration
   * @see AttributeSet#getAttributeNames
   */
  getAttributeNames(): Enumeration<any> {
    return this.attributes.getAttributeNames();
  }
  /**
   * Gets attributes from the parent.
   * If not overridden, the resolving parent defaults to
   * the parent element.
   *
   * @return the attributes from the parent
   * @see AttributeSet#getResolveParent
   */
  getResolveParent(): AttributeSet {
    return this.attributes.getResolveParent();
  }
  /**
   * Adds an attribute.
   *
   * @param name the non-null attribute name
   * @param value the attribute value
   * @see MutableAttributeSet#addAttribute
   */
  addAttribute(name: any, value: any): void {
    let context = this.$outer;
    this.attributes = context.addAttribute(this.attributes, name, value);
    this.fireStateChanged();
  }
  /**
   * Adds a set of attributes to the element.
   *
   * @param attr the attributes to add
   * @see MutableAttributeSet#addAttribute
   */
  addAttributes(attr: AttributeSet): void {
    let context = this.$outer;
    this.attributes = context.addAttributes(this.attributes, attr);
    this.fireStateChanged();
  }
  /**
   * Removes an attribute from the set.
   *
   * @param name the non-null attribute name
   * @see MutableAttributeSet#removeAttribute
   */
  removeAttribute(name: any): void {
    let context = this.$outer;
    this.attributes = context.removeAttribute(this.attributes, name);
    this.fireStateChanged();
  }
  /**
   * Removes a set of attributes for the element.
   *
   * @param attrs the attributes
   * @see MutableAttributeSet#removeAttributes
   */
  removeAttributes$AttributeSet(attrs: AttributeSet): void {
    let context = this.$outer;
    if (attrs === this) {
      this.attributes = context.getEmptySet();
    } else {
      this.attributes = context.removeAttributes(this.attributes, attrs);
    }
    this.fireStateChanged();
  }
  /**
   * Sets the resolving parent.
   *
   * @param parent the parent, null if none
   * @see MutableAttributeSet#setResolveParent
   */
  setResolveParent(parent: AttributeSet): void {
    if (parent != null) {
      this.addAttribute(StyleConstants.ResolveAttribute, parent);
    } else {
      this.removeAttribute(StyleConstants.ResolveAttribute);
    }
  }
}

$J.define(StyleContext, 'javax.swing.text.StyleContext', { kind: 'class', ifaces: ['java.io.Serializable', 'javax.swing.text.AbstractDocument$AttributeContext'], sup: 'java.lang.Object', ctors: { '': '_StyleContext' }, meths: { 'createLargeAttributeSet(javax.swing.text.AttributeSet)': 'createLargeAttributeSet$AttributeSet', 'createSmallAttributeSet(javax.swing.text.AttributeSet)': 'createSmallAttributeSet$AttributeSet', 'removeAttributes(javax.swing.text.AttributeSet,javax.swing.text.AttributeSet)': 'removeAttributes$AttributeSet$AttributeSet', 'removeAttributes(javax.swing.text.AttributeSet,java.util.Enumeration)': 'removeAttributes$AttributeSet$Enumeration', 'getFont(java.lang.String,int,int)': 'getFont$String$int$int', 'getBackground(javax.swing.text.AttributeSet)': 'getBackground$AttributeSet', 'getForeground(javax.swing.text.AttributeSet)': 'getForeground$AttributeSet', 'getFont(javax.swing.text.AttributeSet)': 'getFont$AttributeSet', 'removeStyle(java.lang.String)': 'removeStyle$String' }, clinit: true, lazy: ['defaultContext', 'freezeKeyMap', 'thawKeyMap'] });
$J.define(StyleContext$SmallAttributeSet, 'javax.swing.text.StyleContext$SmallAttributeSet', { kind: 'class', ifaces: ['javax.swing.text.AttributeSet'], sup: 'java.lang.Object', ctors: { 'javax.swing.text.AttributeSet': '_StyleContext$SmallAttributeSet$AttributeSet', 'java.lang.Object[]': '_StyleContext$SmallAttributeSet$ObjectArr' }, inner: true });
$J.define(StyleContext$KeyEnumeration, 'javax.swing.text.StyleContext$KeyEnumeration', { kind: 'class', ifaces: ['java.util.Enumeration'], sup: 'java.lang.Object', ctors: { 'java.lang.Object[]': '_StyleContext$KeyEnumeration' } });
$J.define(StyleContext$FontKey, 'javax.swing.text.StyleContext$FontKey', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.String,int,int': '_StyleContext$FontKey' } });
$J.define(StyleContext$NamedStyle, 'javax.swing.text.StyleContext$NamedStyle', { kind: 'class', ifaces: ['javax.swing.text.Style', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_StyleContext$NamedStyle$', 'javax.swing.text.Style': '_StyleContext$NamedStyle$Style', 'java.lang.String,javax.swing.text.Style': '_StyleContext$NamedStyle$String$Style' }, meths: { 'removeAttributes(javax.swing.text.AttributeSet)': 'removeAttributes$AttributeSet', 'removeAttributes(java.util.Enumeration)': 'removeAttributes$Enumeration' }, inner: true });
$J.module(() => {
  Font = $J.load('java.awt.Font');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  ChangeEvent = $J.load('javax.swing.event.ChangeEvent');
  ChangeListener = $J.load('javax.swing.event.ChangeListener');
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
  AttributeSet = $J.load('javax.swing.text.AttributeSet');
  MutableAttributeSet = $J.load('javax.swing.text.MutableAttributeSet');
  SimpleAttributeSet = $J.load('javax.swing.text.SimpleAttributeSet');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
});
