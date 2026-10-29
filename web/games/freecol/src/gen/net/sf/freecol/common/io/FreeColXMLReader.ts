// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/io/FreeColXMLReader.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, ArrayList, BufferedInputStream, ClassCastException, Collections, Exception, Files, HashMap, IOException, IllegalAccessException, IllegalArgumentException, InstantiationException, InvocationTargetException, JEnum, JString, Level, Logger, NoSuchMethodException, NumberFormatException, SecurityException, StreamReaderDelegate, StringBuilder, XMLInputFactory, XMLStreamException } from '../../../../../../jre/index.ts';

let FreeColGameObject, FreeColObject, FreeColSpecObjectType, Game, Location, CollectionUtils, StringUtils, AIMain;

/**
 * A wrapper for {@code XMLStreamReader} and potentially an
 * underlying stream.  Adds on many useful utilities for reading
 * XML and FreeCol values.
 */
export class FreeColXMLReader extends StreamReaderDelegate {
  static logger: Logger = null;
  /**
   * Map for the XMLStreamConstants.
   */
  static tagStrings: JMap<number, string> = null;
  /**
   * Trace all reads?
   */
  tracing: boolean = false;
  /**
   * The stream to read from.
   */
  inputStream: InputStream = null;
  /**
   * The read scope to apply.
   */
  readScope: FreeColXMLReader$ReadScope = null;
  /**
   * A cache of uninterned objects.  Uninterned reads add to this list
   * so that they can refer to sub-objects correctly.  However there is no
   * obvious place to clear this cache, so we do that in replaceScope
   * as you can not expect to reference the same object across scopes.
   */
  uninterned: JMap<string, FreeColObject> = null;
  $init_FreeColXMLReader() {
    this.tracing = false;
    this.inputStream = null;
    this.uninterned = new HashMap();
  }
  /**
   * Creates a new {@code FreeColXMLReader}.
   *
   * @param bis The {@code BufferedInputStream} to create
   *     an {@code FreeColXMLReader} for.
   * @exception XMLStreamException can be thrown while creating the reader.
   */
  _FreeColXMLReader$BufferedInputStream(bis: BufferedInputStream): this {
    this._StreamReaderDelegate();
    this.$init_FreeColXMLReader();
    let xif = FreeColXMLReader.newXMLInputFactory();
    let xsr: XMLStreamReader;
    try {
      xsr = xif.createXMLStreamReader(bis, 'UTF-8');
      this.setParent(xsr);
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let ex = $J.exc($e0);
        throw new XMLStreamException('Stream reader fail', ex);
      } else {
        throw $e0;
      }
    }
    this.inputStream = bis;
    this.readScope = FreeColXMLReader$ReadScope.NORMAL;
    this.uninterned.clear();
    return this;
  }
  /**
   * Creates a new {@code FreeColXMLReader}.
   *
   * @param inputStream The {@code InputStream} to create
   *     an {@code FreeColXMLReader} for.
   * @exception XMLStreamException can be thrown while creating the reader.
   */
  _FreeColXMLReader$InputStream(inputStream: InputStream): this {
    this._FreeColXMLReader$BufferedInputStream(new BufferedInputStream(inputStream));
    return this;
  }
  /**
   * Creates a new {@code FreeColXMLReader}.
   *
   * @param file The {@code File} to create an {@code FreeColXMLReader} for.
   * @exception IOException if the file is missing.
   * @exception XMLStreamException can be thrown while creating the reader.
   */
  _FreeColXMLReader$File(file: File): this {
    this._FreeColXMLReader$InputStream(Files.newInputStream(file.toPath()));
    return this;
  }
  /**
   * Creates a new {@code FreeColXMLReader}.
   *
   * @param reader A {@code Reader} to create
   *     an {@code FreeColXMLReader} for.
   * @exception XMLStreamException if thrown while creating the reader.
   */
  _FreeColXMLReader$Reader(reader: Reader): this {
    this._StreamReaderDelegate();
    this.$init_FreeColXMLReader();
    let xif = FreeColXMLReader.newXMLInputFactory();
    let xsr = xif.createXMLStreamReader(reader);
    this.setParent(xsr);
    this.inputStream = null;
    this.readScope = FreeColXMLReader$ReadScope.NORMAL;
    this.uninterned.clear();
    return this;
  }
  /**
   * Create a new XMLInputFactory.
   *
   * Respond to CVE 2018-1000825.
   *
   * @return A new <code>XMLInputFactory</code>.
   */
  static newXMLInputFactory(): XMLInputFactory {
    let xif = XMLInputFactory.newInstance();
    xif.setProperty('javax.xml.stream.supportDTD', false);
    xif.setProperty('javax.xml.stream.isSupportingExternalEntities', false);
    return xif;
  }
  /**
   * Set the tracing state.
   *
   * @param tracing The new tracing state.
   * @return This reader.
   */
  setTracing(tracing: boolean): FreeColXMLReader {
    this.tracing = tracing;
    return this;
  }
  /**
   * Should reads from this stream intern their objects into the
   * enclosing game?
   *
   * @return True if this is an interning stream.
   */
  shouldIntern(): boolean {
    return this.readScope !== FreeColXMLReader$ReadScope.NOINTERN;
  }
  /**
   * Get the read scope.
   *
   * @return The {@code ReadScope}.
   */
  getReadScope(): FreeColXMLReader$ReadScope {
    return this.readScope;
  }
  /**
   * Set the read scope.
   *
   * @param readScope The new {@code ReadScope}.
   * @return This reader.
   */
  setReadScope(readScope: FreeColXMLReader$ReadScope): FreeColXMLReader {
    this.readScope = readScope;
    return this;
  }
  /**
   * Replace a the scope.
   *
   * @param newReadScope The {@code ReadScope} to push.
   * @return The previous {@code ReadScope}.
   */
  replaceScope(newReadScope: FreeColXMLReader$ReadScope): FreeColXMLReader$ReadScope {
    let ret = this.readScope;
    if (this.readScope !== newReadScope) {
      this.uninterned.clear();
    }
    this.readScope = newReadScope;
    return ret;
  }
  /**
   * Look up an identifier in an enclosing game.  If not interning
   * prefer an non-interned result.
   *
   * @param game The {@code Game} to consult.
   * @param id The object identifier.
   * @return The {@code FreeColObject} found, or null if none.
   */
  lookup$Game$String$FreeColXMLReader(game: Game, id: string): FreeColObject {
    let fco = (this.shouldIntern()) ? null : this.uninterned.get(id);
    return (fco != null) ? fco : (game == null) ? null : game.getFreeColGameObject$String(id);
  }
  /**
   * Look up an identifier in an enclosing game.
   *
   * This is public to allow the special fixup in Game.readChildren.
   *
   * @param <T> The expected object class type.
   * @param game The {@code Game} to consult.
   * @param id The object identifier.
   * @param returnClass The class of the return value.
   * @return The {@code FreeColObject} found, or null if none.
   * @exception XMLStreamException if the return class does not match.
   */
  lookup$Game$String$Class<T>(game: Game, id: string, returnClass: JClass<T>): T {
    let fco = this.lookup$Game$String$FreeColXMLReader(game, id);
    try {
      return returnClass.cast(fco);
    } catch ($e1) {
      if ($J.isa($e1, ClassCastException)) {
        let cce = $J.exc($e1);
        throw new XMLStreamException(cce);
      } else {
        throw $e1;
      }
    }
  }
  /**
   * Closes both the {@code XMLStreamReader} and
   * the underlying stream if any.
   *
   * Implements interface Closeable.
   */
  close(): void {
    try {
      super.close();
    } catch ($e2) {
      if ($J.isa($e2, XMLStreamException)) {
        let xse = $J.exc($e2);
        FreeColXMLReader.logger.log(Level.WARNING, 'Error closing stream.', xse);
      } else {
        throw $e2;
      }
    }
    if (this.inputStream != null) {
      try {
        this.inputStream.close();
      } catch ($e3) {
        if ($J.isa($e3, IOException)) {
          let ioe = $J.exc($e3);
          FreeColXMLReader.logger.log(Level.WARNING, 'Error closing stream.', ioe);
        } else {
          throw $e3;
        }
      }
      this.inputStream = null;
    }
  }
  /**
   * Reads the identifier attribute.
   *
   * When all the compatibility code is obsolete, remove this
   * routine and replace its uses with just:
   *     getAttribute(in, ID_ATTRIBUTE_TAG, (String)null)
   * or equivalent.
   *
   * @return The identifier found, or null if none present.
   */
  readId(): string {
    let id = this.getAttribute$String$String(FreeColObject.ID_ATTRIBUTE_TAG, null);
    if (id == null) {
      return null;
    }
    let idx = id.indexOf(String.fromCharCode(58 /* ':' */));
    if (idx > 10) {
      let prefix = id.substring(0, idx);
      if ($J.equals('tileitemcontainer', prefix)) {
        id = 'tileItemContainer' + id.substring(idx);
      } else if ($J.equals('tileimprovement', prefix)) {
        id = 'tileImprovement' + id.substring(idx);
      }
    }
    return id;
  }
  /**
   * {@inheritDoc}
   */
  nextTag(): number {
    let tag = super.nextTag();
    if (this.tracing) {
      {
        let val: string;
        switch (tag) {
          case 1:
            $J.err.println('[' + this.getLocalName());
            break;
          case 2:
            $J.err.println(this.getLocalName() + ']');
            break;
          default:
            val = FreeColXMLReader.tagStrings.get(tag);
            $J.err.println((val == null) ? 'Weird tag: ' + tag : val);
            break;
        }
      }
    }
    return tag;
  }
  /**
   * Is the stream at the given tag?
   *
   * @param tag The tag to test.
   * @return True if at the given tag.
   */
  atTag(tag: string): boolean {
    return $J.equals(this.getLocalName(), tag);
  }
  /**
   * Expect a particular tag.
   *
   * @param tag The expected tag name.
   * @exception XMLStreamException if the expected tag is not found.
   */
  expectTag(tag: string): void {
    let endTag = this.getLocalName();
    if (!$J.equals(endTag, tag)) {
      throw new XMLStreamException('Parse error, ' + tag + ' expected, not: ' + endTag);
    }
  }
  /**
   * Check if there are more tags in the current element.
   *
   * @return True if the stream has not reached the end of the
   *     current element.
   * @exception XMLStreamException if there is an error with the stream.
   */
  moreTags(): boolean {
    return this.nextTag() !== 2;
  }
  /**
   * Close the current tag, checking that it did indeed close correctly.
   *
   * @param tag The expected tag name.
   * @exception XMLStreamException if a closing tag is not found.
   */
  closeTag$String(tag: string): void {
    if (this.moreTags()) {
      throw new XMLStreamException('Parse error, END_ELEMENT expected, not: ' + this.getLocalName());
    }
    this.expectTag(tag);
  }
  /**
   * Close the current tag, but accept some alternative elements first.
   *
   * @param tag The expected tag to close.
   * @param others Alternate elements to accept.
   * @exception XMLStreamException if a closing tag is not found.
   */
  closeTag$String$StringArr(tag: string, others: string[]): void {
    for (let next = this.nextTag(); next !== 2; next = this.nextTag()) {
      let at = CollectionUtils.find$ObjectArr$Predicate(others, (s) => this.atTag(s));
      if (at == null) {
        throw new XMLStreamException('Parse error, END_ELEMENT(' + tag + ' or alternatives) expected, not: ' + this.getLocalName());
      }
      this.closeTag$String(at);
    }
    this.expectTag(tag);
  }
  /**
   * Swallow a tag, ignoring anything read until the tag closes.
   *
   * @param tag The tag to swallow.
   * @exception XMLStreamException if a there is an error with the stream.
   */
  swallowTag(tag: string): void {
    while (this.moreTags() || !$J.equals(tag, this.getLocalName())) {
    }
  }
  /**
   * Extract the current tag and its attributes from an input stream.
   * Useful for error messages.
   *
   * @return A simple display of the stream state.
   */
  currentTag(): string {
    let sb = new StringBuilder(this.getLocalName());
    sb.append(', attributes:');
    let n = this.getAttributeCount();
    for (let i = 0; i < n; i++) {
      sb.append(String.fromCharCode(32 /* ' ' */)).append(this.getAttributeLocalName(i)).append('="').append(this.getAttributeValue(i)).append(String.fromCharCode(34 /* '"' */));
    }
    return sb.toString();
  }
  /**
   * Standardized way to throw a parsing exception with a bit of context.
   *
   * @param context A context string.
   * @exception XMLStreamException is always thrown.
   */
  unexpectedTag(context: string): void {
    throw new XMLStreamException('In ' + context + ', unexpected tag ' + this.getLocalName() + ', at: ' + this.currentTag());
  }
  /**
   * Is there an attribute present in the stream?
   *
   * @param attributeName An attribute name
   * @return True if the attribute is present.
   */
  hasAttribute(attributeName: string): boolean {
    return this.getParent().getAttributeValue(null, attributeName) != null;
  }
  /**
   * Gets a boolean from an attribute in a stream.
   *
   * @param attributeName The attribute name.
   * @param defaultValue The default value.
   * @return The boolean attribute value, or the default value if none found.
   */
  getAttribute$String$boolean(attributeName: string, defaultValue: boolean): boolean {
    let attrib = this.getParent().getAttributeValue(null, attributeName);
    return (attrib == null) ? defaultValue : $J.parseBoolean(attrib);
  }
  /**
   * Gets a float from an attribute in a stream.
   *
   * @param attributeName The attribute name.
   * @param defaultValue The default value.
   * @return The float attribute value, or the default value if none found.
   */
  getAttribute$String$float(attributeName: string, defaultValue: number): number {
    let attrib = this.getParent().getAttributeValue(null, attributeName);
    let result = defaultValue;
    if (attrib != null) {
      try {
        result = Math.fround($J.parseDouble(attrib));
      } catch ($e4) {
        if ($J.isa($e4, NumberFormatException)) {
          let e = $J.exc($e4);
          FreeColXMLReader.logger.warning(attributeName + ' is not a float: ' + attrib);
        } else {
          throw $e4;
        }
      }
    }
    return result;
  }
  /**
   * Gets an int from an attribute in a stream.
   *
   * @param attributeName The attribute name.
   * @param defaultValue The default value.
   * @return The int attribute value, or the default value if none found.
   */
  getAttribute$String$int(attributeName: string, defaultValue: number): number {
    let attrib = this.getParent().getAttributeValue(null, attributeName);
    let result = defaultValue;
    if (attrib != null) {
      try {
        result = $J.Integer_decode(attrib);
      } catch ($e5) {
        if ($J.isa($e5, NumberFormatException)) {
          let e = $J.exc($e5);
          FreeColXMLReader.logger.warning(attributeName + ' is not an integer: ' + attrib);
        } else {
          throw $e5;
        }
      }
    }
    return result;
  }
  /**
   * Gets a long from an attribute in a stream.
   *
   * @param attributeName The attribute name.
   * @param defaultValue The default value.
   * @return The long attribute value, or the default value if none found.
   */
  getAttribute$String$long(attributeName: string, defaultValue: number): number {
    let attrib = this.getParent().getAttributeValue(null, attributeName);
    let result = defaultValue;
    if (attrib != null) {
      try {
        result = $J.Long_decode(attrib);
      } catch ($e6) {
        if ($J.isa($e6, NumberFormatException)) {
          let e = $J.exc($e6);
          FreeColXMLReader.logger.warning(attributeName + ' is not a long: ' + attrib);
        } else {
          throw $e6;
        }
      }
    }
    return result;
  }
  /**
   * Gets a string from an attribute in a stream.
   *
   * @param attributeName The attribute name.
   * @param defaultValue The default value.
   * @return The string attribute value, or the default value if none found.
   */
  getAttribute$String$String(attributeName: string, defaultValue: string): string {
    let attrib = this.getParent().getAttributeValue(null, attributeName);
    return (attrib == null) ? defaultValue : attrib;
  }
  /**
   * Gets an enum from an attribute in a stream.
   *
   * @param <T> The expected enum type.
   * @param attributeName The attribute name.
   * @param returnClass The class of the return value.
   * @param defaultValue The default value.
   * @return The enum attribute value, or the default value if none found.
   */
  getAttribute$String$Class$Enum<T>(attributeName: string, returnClass: JClass<T>, defaultValue: T): T {
    let attrib = this.getParent().getAttributeValue(null, attributeName);
    let result = defaultValue;
    if (attrib != null) {
      try {
        result = $J.enumValueOf(returnClass, StringUtils.upCase$String(attrib));
      } catch ($e7) {
        if ($J.isa($e7, Exception)) {
          let e = $J.exc($e7);
          FreeColXMLReader.logger.warning(attributeName + ' is not a ' + returnClass.getName() + ': ' + attrib);
        } else {
          throw $e7;
        }
      }
    }
    return result;
  }
  /**
   * Gets a FreeCol object from an attribute in a stream.
   *
   * @param <T> The expected attribute type.
   * @param game The {@code Game} to look in.
   * @param attributeName The attribute name.
   * @param returnClass The {@code FreeColObject} type to expect.
   * @param defaultValue The default value.
   * @return The {@code FreeColObject} found, or the default
   *     value if not.
   * @exception XMLStreamException if the wrong class was passed.
   */
  getAttribute$Game$String$Class$FreeColObject<T>(game: Game, attributeName: string, returnClass: JClass<T>, defaultValue: T): T {
    let attrib = ($J.equals(FreeColObject.ID_ATTRIBUTE_TAG, attributeName)) ? this.readId() : this.getAttribute$String$String(attributeName, null);
    if (attrib == null) {
      return defaultValue;
    }
    return this.lookup$Game$String$Class(game, attrib, returnClass);
  }
  /**
   * Get a FreeCol AI object from an attribute in a stream.
   *
   * @param <T> The expected attribute type.
   * @param aiMain The {@code AIMain} that contains the object.
   * @param attributeName The attribute name.
   * @param returnClass The {@code AIObject} type to expect.
   * @param defaultValue The default value.
   * @return The {@code AIObject} found, or the default value if not.
   */
  getAttribute$AIMain$String$Class$AIObject<T>(aiMain: AIMain, attributeName: string, returnClass: JClass<T>, defaultValue: T): T {
    let attrib = ($J.equals(FreeColObject.ID_ATTRIBUTE_TAG, attributeName)) ? this.readId() : this.getAttribute$String$String(attributeName, null);
    return (attrib == null) ? defaultValue : aiMain.getAIObject$String$Class(attrib, returnClass);
  }
  /**
   * Find a new location from a stream attribute.  This is necessary
   * because {@code Location} is an interface.
   *
   * @param game The {@code Game} to look in.
   * @param attributeName The attribute to check.
   * @param make If true, try to make the location if it is not found.
   * @return The {@code Location} found.
   * @exception XMLStreamException if a problem was encountered
   *     during parsing.
   */
  getLocationAttribute(game: Game, attributeName: string, make: boolean): Location {
    if (attributeName == null) {
      return null;
    }
    let attrib = ($J.equals(FreeColObject.ID_ATTRIBUTE_TAG, attributeName)) ? this.readId() : this.getAttribute$String$String(attributeName, null);
    if (attrib == null) {
      return null;
    }
    let fco = this.lookup$Game$String$FreeColXMLReader(game, attrib);
    if (fco == null && make) {
      let c = Game.getLocationClass(attrib);
      if (c != null) {
        fco = this.makeFreeColObject(game, attributeName, c, this.getReadScope() === FreeColXMLReader$ReadScope.SERVER);
      }
    }
    if ($J.isa(fco, Location)) {
      return fco;
    }
    FreeColXMLReader.logger.warning('Not a location: ' + attrib);
    return null;
  }
  /**
   * Get a map of attributes.
   *
   * @param attributes The list of attributes to look up.
   * @return A map of attributes.
   */
  getAttributeMap(attributes: string[]): JMap<string, string> {
    let ret = new HashMap(attributes.length);
    for (let a of attributes) {
      ret.put(a, this.getAttribute$String$String(a, null));
    }
    return ret;
  }
  /**
   * Get a map of the array attributes.
   *
   * @return A map of array attributes.
   */
  getArrayAttributeMap(): JMap<string, string> {
    let ret = new HashMap();
    let n = this.getAttribute$String$int(FreeColObject.ARRAY_SIZE_TAG, -1);
    if (n >= 0) {
      ret.put(FreeColObject.ARRAY_SIZE_TAG, String(n));
      for (let i = 0; i < n; i++) {
        let key = FreeColObject.arrayKey(i);
        if (!this.hasAttribute(key)) {
          break;
        }
        ret.put(key, this.getAttribute$String$String(key, null));
      }
    }
    return ret;
  }
  /**
   * Get a map of all attributes present.
   *
   * @return A map of all the attributes.
   */
  getAllAttributes(): JMap<string, string> {
    let n = this.getParent().getAttributeCount();
    let ret = new HashMap(n);
    for (let i = 0; i < n; i++) {
      let key = this.getParent().getAttributeLocalName(i);
      let value = this.getParent().getAttributeValue(i);
      ret.put(key, value);
    }
    return ret;
  }
  /**
   * Reads an XML-representation of a list of
   * {@code FreeColSpecObjectType}s.
   *
   * @param <T> The list member type.
   * @param tag The tag for the list.
   * @param spec The {@code Specification} to find items in.
   * @param type The type of the items to be added.  The type must exist
   *     in the supplied specification.
   * @return The list.
   * @exception XMLStreamException if a problem was encountered
   *     during parsing.
   */
  readList<T>(spec: Specification, tag: string, type$: JClass<T>): List<T> {
    this.expectTag(tag);
    let length = this.getAttribute$String$int(FreeColObject.ARRAY_SIZE_TAG, -1);
    if (length < 0) {
      return Collections.emptyList();
    }
    let list = new ArrayList(length);
    for (let x = 0; x < length; x++) {
      let value = this.getType(spec, FreeColObject.arrayKey(x), type$, null);
      if (value == null) {
        FreeColXMLReader.logger.warning('Null list value(' + x + ')');
      }
      list.add(value);
    }
    this.closeTag$String(tag);
    return list;
  }
  /**
   * Find a {@code FreeColGameObject} of a given class
   * from a stream attribute.
   *
   * Use this routine when the object is optionally already be
   * present in the game.
   *
   * @param <T> The actual return type.
   * @param game The {@code Game} to look in.
   * @param attributeName The attribute name.
   * @param returnClass The class to expect.
   * @param defaultValue A default value to return if not found.
   * @param required If true a null result should throw an exception.
   * @return The {@code FreeColGameObject} found, or the default
   *     value if not found.
   * @exception XMLStreamException if the attribute is missing.
   */
  findFreeColGameObject<T>(game: Game, attributeName: string, returnClass: JClass<T>, defaultValue: T, required: boolean): T {
    let ret = this.getAttribute$Game$String$Class$FreeColObject(game, attributeName, returnClass, null);
    if (ret === null) {
      if (required) {
        throw new XMLStreamException('Missing ' + attributeName + ' for ' + returnClass.getName() + ': ' + this.currentTag());
      } else {
        ret = defaultValue;
      }
    }
    return ret;
  }
  /**
   * Either get an existing {@code FreeColObject} from a stream
   * attribute or create it if it does not exist.
   *
   * Use this routine when the object may not necessarily already be
   * present in the game, but is expected to be defined eventually.
   *
   * @param <T> The actual return type.
   * @param game The {@code Game} to look in.
   * @param attributeName The required attribute name.
   * @param returnClass The class of object.
   * @param required If true a null result should throw an exception.
   * @return The {@code FreeColObject} found or made, or null
   *     if the attribute was not present.
   * @exception XMLStreamException if a problem was encountered
   *     during parsing.
   */
  makeFreeColObject<T>(game: Game, attributeName: string, returnClass: JClass<T>, required: boolean): T {
    let id = ($J.equals(FreeColObject.ID_ATTRIBUTE_TAG, attributeName)) ? this.readId() : this.getAttribute$String$String(attributeName, null);
    let ret = null;
    if (id == null) {
      if (required) {
        throw new XMLStreamException('Missing ' + attributeName + ' for ' + returnClass.getName() + ': ' + this.currentTag());
      }
    } else if ((ret = this.lookup$Game$String$Class(game, id, returnClass)) == null) {
      ret = Game.newInstance(game, returnClass, this.getReadScope() === FreeColXMLReader$ReadScope.SERVER);
      if (ret == null) {
        let err = 'Failed to create ' + returnClass.getName() + ' with id: ' + id;
        if (required) {
          throw new XMLStreamException(err);
        }
        FreeColXMLReader.logger.warning(err);
      } else if (ret instanceof FreeColGameObject) {
        ret.setId(id);
        if (this.shouldIntern()) {
          (ret).internId(id);
        } else {
          this.uninterned.put(id, ret);
        }
      }
    }
    return ret;
  }
  /**
   * Do a normal interning read of a {@code FreeColObject}.
   *
   * @param <T> The actual return type.
   * @param game The {@code Game} to look in.
   * @param returnClass The class to expect.
   * @return The {@code FreeColObject} found, or null there
   *     was no ID_ATTRIBUTE_TAG present.
   * @exception XMLStreamException if there is problem reading the stream.
   */
  internedRead<T>(game: Game, returnClass: JClass<T>): T {
    let ret = this.makeFreeColObject(game, FreeColObject.ID_ATTRIBUTE_TAG, returnClass, false);
    if (ret != null) {
      ret.readFromXML(this);
    }
    return ret;
  }
  /**
   * Do a special non-interning read of a {@code FreeColObject}.
   *
   * @param <T> The actual return type.
   * @param game The {@code Game} to look in.
   * @param returnClass The class to expect.
   * @return The {@code FreeColObject} found, or null there
   *     was no ID_ATTRIBUTE_TAG present.
   * @exception XMLStreamException if there is problem reading the stream.
   */
  uninternedRead<T>(game: Game, returnClass: JClass<T>): T {
    let id = this.readId();
    if (id == null) {
      throw new XMLStreamException('Null object identifier for: ' + returnClass.getName());
    }
    let ret: T;
    let fco = this.uninterned.get(id);
    if (fco == null) {
      ret = Game.newInstance(game, returnClass, this.getReadScope() === FreeColXMLReader$ReadScope.SERVER);
      if (ret == null) {
        throw new XMLStreamException('Failed to create ' + returnClass.getName() + ' with id: ' + id);
      }
    } else {
      try {
        ret = returnClass.cast(fco);
      } catch ($e8) {
        if ($J.isa($e8, ClassCastException)) {
          let cce = $J.exc($e8);
          throw new XMLStreamException(cce);
        } else {
          throw $e8;
        }
      }
    }
    this.uninterned.put(id, ret);
    ret.readFromXML(this);
    return ret;
  }
  /**
   * Reads a {@code FreeColObject} from a stream.
   * Expects the object to be identified by the standard ID_ATTRIBUTE_TAG.
   *
   * Use this routine when the object may or may not have been
   * referenced and created-by-id in this game, but this is the
   * point where it is authoritatively defined.
   *
   * @param <T> The actual return type.
   * @param game The {@code Game} to look in.
   * @param returnClass The class to expect.
   * @return The {@code FreeColObject} found, or null there
   *     was no ID_ATTRIBUTE_TAG present.
   * @exception XMLStreamException if there is problem reading the stream.
   */
  readFreeColObject$Game$Class<T>(game: Game, returnClass: JClass<T>): T {
    return (this.shouldIntern()) ? this.internedRead(game, returnClass) : this.uninternedRead(game, returnClass);
  }
  /**
   * Read a {@code FreeColObject} from a stream.
   *
   * @param <T> The actual return type.
   * @param game The {@code Game} to look in.
   * @return The {@code FreeColObject} found.
   * @exception XMLStreamException if there is problem reading the stream.
   */
  readFreeColObject$Game<T>(game: Game): T {
    let tag = this.getLocalName();
    let returnClass = FreeColObject.getFreeColObjectClassByName(tag);
    if (returnClass == null) {
      throw new XMLStreamException('No class: ' + tag);
    }
    return this.readFreeColObject$Game$Class(game, returnClass);
  }
  /**
   * Find a FreeCol AI object from an attribute in a stream.
   *
   * @param <T> The actual return type.
   * @param aiMain The {@code AIMain} that contains the object.
   * @param attributeName The attribute name.
   * @param returnClass The {@code AIObject} type to expect.
   * @param defaultValue The default value.
   * @param required If true a null result should throw an exception.
   * @exception XMLStreamException if there is problem reading the stream.
   * @return The {@code AIObject} found, or the default value if not.
   */
  findAIObject<T>(aiMain: AIMain, attributeName: string, returnClass: JClass<T>, defaultValue: T, required: boolean): T {
    let ret = this.getAttribute$AIMain$String$Class$AIObject(aiMain, attributeName, returnClass, null);
    if (ret === null) {
      if (required) {
        throw new XMLStreamException('Missing ' + attributeName + ' for ' + returnClass.getName() + ': ' + this.currentTag());
      } else {
        ret = defaultValue;
      }
    }
    return ret;
  }
  /**
   * Either get an existing {@code AIObject} from a stream
   * attribute or create it if it does not exist.
   *
   * Use this routine when the object may not necessarily already be
   * present in the game, but is expected to be defined eventually.
   *
   * @param <T> The actual return type.
   * @param aiMain The {@code AIMain} that contains the object.
   * @param attributeName The attribute name.
   * @param returnClass The {@code AIObject} type to expect.
   * @param defaultValue The default value.
   * @param required If true, throw exceptions on missing data.
   * @exception XMLStreamException if there is problem reading the stream.
   * @return The {@code AIObject} found, or the default value if not.
   */
  makeAIObject<T>(aiMain: AIMain, attributeName: string, returnClass: JClass<T>, defaultValue: T, required: boolean): T {
    let id = ($J.equals(FreeColObject.ID_ATTRIBUTE_TAG, attributeName)) ? this.readId() : this.getAttribute$String$String(attributeName, null);
    let ret = null;
    if (id == null) {
      if (required) {
        throw new XMLStreamException('Missing ' + attributeName + ' for ' + returnClass.getName() + ': ' + this.currentTag());
      }
    } else {
      ret = aiMain.getAIObject$String$Class(id, returnClass);
      if (ret == null) {
        try {
          let c = returnClass.getConstructor($J.cls(AIMain), $J.cls(JString));
          ret = returnClass.cast(c.newInstance(aiMain, id));
          if (required && ret == null) {
            throw new XMLStreamException('Constructed null ' + returnClass.getName() + ' for ' + id + ': ' + this.currentTag());
          }
        } catch ($e9) {
          if ($J.isa($e9, NoSuchMethodException) || $J.isa($e9, SecurityException) || $J.isa($e9, InstantiationException) || $J.isa($e9, IllegalAccessException) || $J.isa($e9, IllegalArgumentException) || $J.isa($e9, InvocationTargetException) || $J.isa($e9, XMLStreamException)) {
            let e = $J.exc($e9);
            if (required) {
              throw new XMLStreamException(e);
            } else {
              FreeColXMLReader.logger.log(Level.WARNING, 'Failed to create AIObject: ' + id, e);
            }
          } else {
            throw $e9;
          }
        }
      }
    }
    return ret;
  }
  /**
   * Should the game object type being read clear its containers before
   * reading the child elements?
   *
   * @return True if the containers should be cleared.
   */
  shouldClearContainers(): boolean {
    return !this.getAttribute$String$boolean(FreeColSpecObjectType.PRESERVE_TAG, false);
  }
  /**
   * Should the attributes of the game object type be read?
   *
   * @return True if the attributes should be read.
   */
  shouldReadAttributes(): boolean {
    return !this.getAttribute$String$boolean(FreeColSpecObjectType.PRESERVE_ATTRIBUTES_TAG, false);
  }
  /**
   * Get a FreeColSpecObjectType by identifier from a stream from a
   * specification.
   *
   * @param <T> The actual return type.
   * @param spec The {@code Specification} to look in.
   * @param attributeName the name of the attribute identifying the
   *     {@code FreeColSpecObjectType}.
   * @param returnClass The expected class of the return value.
   * @param defaultValue A default value to return if the attributeName 
   *     attribute is not present.
   * @return The {@code FreeColSpecObjectType} found, or the
   *     {@code defaultValue}.
   */
  getType<T>(spec: Specification, attributeName: string, returnClass: JClass<T>, defaultValue: T): T {
    let attrib = ($J.equals(FreeColObject.ID_ATTRIBUTE_TAG, attributeName)) ? this.readId() : this.getAttribute$String$String(attributeName, null);
    return (attrib == null) ? defaultValue : spec.findType(attrib, returnClass);
  }
  /**
   * Get an initialized FreeColSpecObjectType by identifier from a stream from a
   * specification.
   *
   * @param <T> The actual return type.
   * @param spec The {@code Specification} to look in.
   * @param attributeName the name of the attribute identifying the
   *     {@code FreeColSpecObjectType}.
   * @param returnClass The expected class of the return value.
   * @param defaultValue A default value to return if the attributeName 
   *     attribute is not present.
   * @return The {@code FreeColSpecObjectType} found, or the
   *     {@code defaultValue}.
   */
  getAlreadyInitializedType<T>(spec: Specification, attributeName: string, returnClass: JClass<T>, defaultValue: T): T {
    let id = this.getAttribute$String$String(attributeName, null);
    if (id == null) {
      return defaultValue;
    }
    let o = spec.getAlreadyInitializedType(id, returnClass);
    if (o == null) {
      throw new IllegalArgumentException(JString.format('The object "%s" of type "%s" was referenced from a "%s" attribute before being initialized.', id, returnClass.getSimpleName(), attributeName));
    }
    return o;
  }
  /**
   * Copy a FreeColObject by serializing it and reading back the result
   * with a non-interning stream.
   *
   * @param <T> The actual return type.
   * @param game The {@code Game} to look in.
   * @param returnClass The class to expect.
   * @return The copied {@code FreeColObject} found, or null there
   *     was no ID_ATTRIBUTE_TAG present.
   * @exception XMLStreamException if there is problem reading the stream.
   */
  copy<T>(game: Game, returnClass: JClass<T>): T {
    this.setReadScope(FreeColXMLReader$ReadScope.NOINTERN);
    this.nextTag();
    return this.uninternedRead(game, returnClass);
  }
  /**
   * Fill in the identifier values supplied in a map.
   *
   * Special case for early reads of the client options.
   *
   * @param map A map containing identifiers to find as keys.
   * @param attr The attribute to get for each identifier found.
   * @return The number of identifiers found or negative on error.
   * @exception XMLStreamException if a problem was encountered
   *     during parsing.
   */
  readAttributeValues(map: JMap<string, string>, attr: string): number {
    let ret = 0;
    while (this.hasNext()) {
      let id: string;
      try {
        this.nextTag();
      } catch ($e10) {
        if ($J.isa($e10, XMLStreamException)) {
          let xse = $J.exc($e10);
          break;
        } else {
          throw $e10;
        }
      }
      if (this.getEventType() === 1 && (id = this.readId()) != null && map.containsKey(id)) {
        map.put(id, this.getAttribute$String$String(attr, null));
        ret++;
      }
    }
    return ret;
  }
  static $clinit() {
    FreeColXMLReader.logger = Logger.getLogger($J.cls(FreeColXMLReader).getName());
    FreeColXMLReader.tagStrings = CollectionUtils.makeUnmodifiableMap([10, 12, 4, 5, 11, 8, 2, 15, 9, 13, 14, 3, 6, 7, 1], ['Attribute', 'CData', 'Characters', 'Comment', 'DTD', 'EndDocument', 'EndElement', 'EntityDeclaration', 'EntityReference', 'Namespace', 'NotationDeclaration', 'ProcessingInstruction', 'Space', 'StartDocument', 'StartElement']);
  }
}

export class FreeColXMLReader$ReadScope extends JEnum {
  static SERVER: FreeColXMLReader$ReadScope = null;
  static NORMAL: FreeColXMLReader$ReadScope = null;
  static NOINTERN: FreeColXMLReader$ReadScope = null;
  static $VALUES: FreeColXMLReader$ReadScope[] = null;
  _FreeColXMLReader$ReadScope($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): FreeColXMLReader$ReadScope[] { return FreeColXMLReader$ReadScope.$VALUES.slice(); }
  static valueOf(name: string): FreeColXMLReader$ReadScope { return $J.enumValueOf(FreeColXMLReader$ReadScope, name); }
  static $clinit() {
    FreeColXMLReader$ReadScope.SERVER = new FreeColXMLReader$ReadScope()._FreeColXMLReader$ReadScope('SERVER', 0);
    FreeColXMLReader$ReadScope.NORMAL = new FreeColXMLReader$ReadScope()._FreeColXMLReader$ReadScope('NORMAL', 1);
    FreeColXMLReader$ReadScope.NOINTERN = new FreeColXMLReader$ReadScope()._FreeColXMLReader$ReadScope('NOINTERN', 2);
    FreeColXMLReader$ReadScope.$VALUES = [FreeColXMLReader$ReadScope.SERVER, FreeColXMLReader$ReadScope.NORMAL, FreeColXMLReader$ReadScope.NOINTERN];
  }
}

$J.define(FreeColXMLReader, 'net.sf.freecol.common.io.FreeColXMLReader', { kind: 'class', ifaces: ['java.io.Closeable'], sup: 'javax.xml.stream.util.StreamReaderDelegate', ctors: { 'java.io.Reader': '_FreeColXMLReader$Reader', 'java.io.File': '_FreeColXMLReader$File', 'java.io.InputStream': '_FreeColXMLReader$InputStream', 'java.io.BufferedInputStream': '_FreeColXMLReader$BufferedInputStream' }, returns: { 'getAllAttributes': 'java.util.Map', 'getArrayAttributeMap': 'java.util.Map', 'getReadScope': 'net.sf.freecol.common.io.FreeColXMLReader$ReadScope' }, meths: { 'readFreeColObject(net.sf.freecol.common.model.Game)': 'readFreeColObject$Game', 'readFreeColObject(net.sf.freecol.common.model.Game,java.lang.Class)': 'readFreeColObject$Game$Class', 'getAttribute(net.sf.freecol.server.ai.AIMain,java.lang.String,java.lang.Class,net.sf.freecol.server.ai.AIObject)': 'getAttribute$AIMain$String$Class$AIObject', 'getAttribute(net.sf.freecol.common.model.Game,java.lang.String,java.lang.Class,net.sf.freecol.common.model.FreeColObject)': 'getAttribute$Game$String$Class$FreeColObject', 'getAttribute(java.lang.String,java.lang.Class,java.lang.Enum)': 'getAttribute$String$Class$Enum', 'getAttribute(java.lang.String,java.lang.String)': 'getAttribute$String$String', 'getAttribute(java.lang.String,long)': 'getAttribute$String$long', 'getAttribute(java.lang.String,int)': 'getAttribute$String$int', 'getAttribute(java.lang.String,float)': 'getAttribute$String$float', 'getAttribute(java.lang.String,boolean)': 'getAttribute$String$boolean', 'closeTag(java.lang.String,java.lang.String[])': 'closeTag$String$StringArr', 'closeTag(java.lang.String)': 'closeTag$String', 'lookup(net.sf.freecol.common.model.Game,java.lang.String,java.lang.Class)': 'lookup$Game$String$Class', 'lookup(net.sf.freecol.common.model.Game,java.lang.String)': 'lookup$Game$String$FreeColXMLReader' }, clinit: true, lazy: ['logger', 'tagStrings'] });
$J.define(FreeColXMLReader$ReadScope, 'net.sf.freecol.common.io.FreeColXMLReader$ReadScope', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_FreeColXMLReader$ReadScope' }, clinit: true, lazy: ['$VALUES', 'SERVER', 'NORMAL', 'NOINTERN'] });
$J.module(() => {
  FreeColGameObject = $J.load('net.sf.freecol.common.model.FreeColGameObject');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  FreeColSpecObjectType = $J.load('net.sf.freecol.common.model.FreeColSpecObjectType');
  Game = $J.load('net.sf.freecol.common.model.Game');
  Location = $J.load('net.sf.freecol.common.model.Location');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
  AIMain = $J.load('net.sf.freecol.server.ai.AIMain');
});
