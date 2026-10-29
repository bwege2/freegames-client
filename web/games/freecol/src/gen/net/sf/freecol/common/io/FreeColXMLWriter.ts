// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/io/FreeColXMLWriter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IOException, JEnum, JObject, JString, Level, Logger, OutputStreamWriter, StandardCharsets, StreamResult, StreamSource, StringReader, StringWriter, TransformerException, XMLOutputFactory, XMLStreamException } from '../../../../../../jre/index.ts';

let FreeColObject, StringUtils, Utils;

/**
 * A wrapper for {@code XMLStreamWriter} and potentially an
 * underlying stream.  Adds on many useful utilities for writing
 * XML and FreeCol values.
 *
 * Unlike FreeColXMLReader, do not try to close the underlying stream.
 * Sometimes items are saved with successive FreeColXMLWriters writing
 * to the same OutputStream.
 *
 * Strange, there is no StreamWriterDelegate, so we are stuck with
 * all the delegation functions.
 */
export class FreeColXMLWriter extends JObject {
  static logger: Logger = null;
  /**
   * The internal XML writer to write XML to.
   */
  xmlStreamWriter: XMLStreamWriter = null;
  /**
   * An internal writer to accumulate XML into.
   */
  stringWriter: StringWriter = null;
  /**
   * An optional transformer to handle indentation.
   */
  transformer: Transformer = null;
  /**
   * The writer that receives the final output.
   */
  outputWriter: Writer = null;
  /**
   * A write scope to use for FreeCol object writes.
   */
  writeScope: FreeColXMLWriter$WriteScope = null;
  /**
   * Creates a new {@code FreeColXMLWriter}.
   *
   * @param outputStream The {@code OutputStream} to create
   *     an {@code FreeColXMLWriter} for.
   * @param scope The {@code WriteScope} to use for FreeCol
   *     object writes.
   * @param indent If true, produce indented output if supported.
   * @exception IOException if there is a problem while creating the
   *     {@code FreeColXMLWriter}.
   */
  _FreeColXMLWriter$OutputStream$WriteScope$boolean(outputStream: OutputStream, scope: FreeColXMLWriter$WriteScope, indent: boolean): this {
    this._FreeColXMLWriter$Writer$WriteScope$boolean(new OutputStreamWriter(outputStream, StandardCharsets.UTF_8), scope, indent);
    return this;
  }
  /**
   * Creates a new {@code FreeColXMLWriter}.
   *
   * @param writer A {@code Writer} to create an 
   *     {@code FreeColXMLWriter} for.
   * @exception IOException if there is a problem while creating the
   *     {@code FreeColXMLWriter}.
   */
  _FreeColXMLWriter$Writer(writer: Writer): this {
    this._FreeColXMLWriter$Writer$WriteScope(writer, FreeColXMLWriter$WriteScope.toSave());
    return this;
  }
  /**
   * Creates a new {@code FreeColXMLWriter}.
   *
   * @param writer A {@code Writer} to create an
   *     {@code FreeColXMLWriter} for.
   * @param scope The {@code WriteScope} to use for FreeCol objects.
   * @exception IOException if there is a problem while creating the
   *     {@code FreeColXMLWriter}.
   */
  _FreeColXMLWriter$Writer$WriteScope(writer: Writer, scope: FreeColXMLWriter$WriteScope): this {
    this._FreeColXMLWriter$Writer$WriteScope$boolean(writer, scope, false);
    return this;
  }
  /**
   * Creates a new {@code FreeColXMLWriter}.
   *
   * @param writer A {@code Writer} to create an
   *     {@code FreeColXMLWriter} for.
   * @param scope The {@code WriteScope} to use for FreeCol objects.
   * @param indent If true, produce indented output if supported.
   * @exception IOException if there is a problem while creating the
   *     {@code FreeColXMLWriter}.
   */
  _FreeColXMLWriter$Writer$WriteScope$boolean(writer: Writer, scope: FreeColXMLWriter$WriteScope, indent: boolean): this {
    this.outputWriter = writer;
    try {
      this.stringWriter = new StringWriter(1024);
      this.xmlStreamWriter = this.getFactory().createXMLStreamWriter(this.stringWriter);
    } catch ($e0) {
      if ($J.isa($e0, XMLStreamException)) {
        let e = $J.exc($e0);
        throw new IOException(e);
      } else {
        throw $e0;
      }
    }
    this.transformer = (indent) ? Utils.makeTransformer(false, true) : null;
    this.writeScope = (scope == null) ? FreeColXMLWriter$WriteScope.toSave() : scope;
    return this;
  }
  /**
   * Get the {@code XMLOutputFactory} to create the output stream with.
   *
   * @return An {@code XMLOutputFactory}.
   */
  getFactory(): XMLOutputFactory {
    return XMLOutputFactory.newInstance();
  }
  /**
   * Get the write scope prevailing on this stream.
   *
   * @return The write scope.
   */
  getWriteScope(): FreeColXMLWriter$WriteScope {
    return this.writeScope;
  }
  /**
   * Set the write scope prevailing on this stream.
   *
   * @param writeScope The new {@code WriteScope}.
   */
  setWriteScope(writeScope: FreeColXMLWriter$WriteScope): void {
    this.writeScope = writeScope;
  }
  /**
   * Replace the scope.
   *
   * @param newWriteScope The {@code WriteScope} to push.
   * @return The previous {@code WriteScope}.
   */
  replaceScope(newWriteScope: FreeColXMLWriter$WriteScope): FreeColXMLWriter$WriteScope {
    let ret = this.writeScope;
    this.writeScope = newWriteScope;
    return ret;
  }
  /**
   * Internal flush, returning what was written.
   *
   * @return The internal buffer containing the flushed data.
   * @exception XMLStreamException on stream error.
   */
  flushBuffer(): StringBuffer {
    this.xmlStreamWriter.flush();
    let sb = this.stringWriter.getBuffer();
    if (sb.length() > 0) {
      let str = sb.toString();
      if (this.transformer == null) {
        try {
          this.outputWriter.write(str);
        } catch ($e1) {
          if ($J.isa($e1, IOException)) {
            let ioe = $J.exc($e1);
            FreeColXMLWriter.logger.log(Level.WARNING, 'Flush-write fail:' + str, ioe);
          } else {
            throw $e1;
          }
        }
      } else {
        let source = new StreamSource(new StringReader(str));
        let result = new StreamResult(this.outputWriter);
        try {
          this.transformer.transform(source, result);
        } catch ($e2) {
          if ($J.isa($e2, TransformerException)) {
            let te = $J.exc($e2);
            FreeColXMLWriter.logger.log(Level.WARNING, 'Transform fail:' + str, te);
          } else {
            throw $e2;
          }
        }
      }
      try {
        this.outputWriter.flush();
      } catch ($e3) {
        if ($J.isa($e3, IOException)) {
          let ioe = $J.exc($e3);
          FreeColXMLWriter.logger.log(Level.WARNING, 'Flush fail', ioe);
        } else {
          throw $e3;
        }
      }
    }
    return sb;
  }
  /**
   * {@inheritDoc}
   */
  flush(): void {
    this.flushBuffer().setLength(0);
  }
  /**
   * {@inheritDoc}
   */
  close(): void {
    try {
      this.flush();
    } catch ($e4) {
      if ($J.isa($e4, XMLStreamException)) {
        let xse = $J.exc($e4);
      } else {
        throw $e4;
      }
    }
    if (this.xmlStreamWriter != null) {
      try {
        this.xmlStreamWriter.close();
      } catch ($e5) {
        if ($J.isa($e5, XMLStreamException)) {
          let xse = $J.exc($e5);
          FreeColXMLWriter.logger.log(Level.WARNING, 'Error closing stream.', xse);
        } else {
          throw $e5;
        }
      }
    }
  }
  /**
   * Write a boolean attribute to the stream.
   *
   * @param attributeName The attribute name.
   * @param value A boolean to write.
   * @exception XMLStreamException if a write error occurs.
   */
  writeAttribute$String$boolean(attributeName: string, value: boolean): void {
    this.xmlStreamWriter.writeAttribute(attributeName, String(value));
  }
  /**
   * Write a float attribute to the stream.
   *
   * @param attributeName The attribute name.
   * @param value A float to write.
   * @exception XMLStreamException if a write error occurs.
   */
  writeAttribute$String$float(attributeName: string, value: number): void {
    this.xmlStreamWriter.writeAttribute(attributeName, $J.fstr(value));
  }
  /**
   * Write an integer attribute to the stream.
   *
   * @param attributeName The attribute name.
   * @param value An integer to write.
   * @exception XMLStreamException if a write error occurs.
   */
  writeAttribute$String$int(attributeName: string, value: number): void {
    this.xmlStreamWriter.writeAttribute(attributeName, String(value));
  }
  /**
   * Write a long attribute to the stream.
   *
   * @param attributeName The attribute name.
   * @param value A long to write.
   * @exception XMLStreamException if a write error occurs.
   */
  writeAttribute$String$long(attributeName: string, value: number): void {
    this.xmlStreamWriter.writeAttribute(attributeName, String(value));
  }
  /**
   * Write an enum attribute to the stream.
   *
   * @param attributeName The attribute name.
   * @param value The {@code Enum} to write.
   * @exception XMLStreamException if a write error occurs.
   */
  writeAttribute$String$Enum(attributeName: string, value: JEnum<any>): void {
    this.xmlStreamWriter.writeAttribute(attributeName, StringUtils.downCase$String(value.toString()));
  }
  /**
   * Write an Object attribute to the stream.
   *
   * @param attributeName The attribute name.
   * @param value The {@code Object} to write.
   * @exception XMLStreamException if a write error occurs.
   */
  writeAttribute$String$Object(attributeName: string, value: any): void {
    this.xmlStreamWriter.writeAttribute(attributeName, $J.str(value));
  }
  /**
   * Write the identifier attribute of a non-null FreeColObject to the stream.
   *
   * @param attributeName The attribute name.
   * @param value The {@code FreeColObject} to write the identifier of.
   * @exception XMLStreamException if a write error occurs.
   */
  writeAttribute$String$FreeColObject(attributeName: string, value: FreeColObject): void {
    if (value != null) {
      let id = value.getId();
      if (id != null) {
        this.xmlStreamWriter.writeAttribute(attributeName, value.getId());
      }
    }
  }
  /**
   * Write the identifier attribute of a non-null Location to the stream.
   *
   * @param attributeName The attribute name.
   * @param value The {@code Location} to write the identifier of.
   * @exception XMLStreamException if a write error occurs.
   */
  writeLocationAttribute(attributeName: string, value: Location): void {
    this.writeAttribute$String$FreeColObject(attributeName, value);
  }
  /**
   * Writes an XML-representation of a collection object to the given stream.
   *
   * @param <T> The collection type.
   * @param tag The tag for the array.
   * @param members The members of the array.
   * @exception XMLStreamException if a problem was encountered
   *      while writing.
   */
  writeToListElement<T>(tag: string, members: Collection<T>): void {
    if (members.isEmpty()) {
      return;
    }
    this.writeStartElement(tag);
    this.writeAttribute$String$int(FreeColObject.ARRAY_SIZE_TAG, members.size());
    let i = 0;
    for (const $it6 = members.iterator(); $it6.hasNext(); ) {
      let t = $it6.next();
      this.writeAttribute$String$FreeColObject(FreeColObject.arrayKey(i), t);
      i++;
    }
    this.writeEndElement();
  }
  getClientPlayer(): Player {
    return this.writeScope.getClient();
  }
  validForSave(): boolean {
    return this.writeScope.validForSave();
  }
  validFor(player: Player): boolean {
    return this.writeScope.validFor(player);
  }
  getNamespaceContext(): NamespaceContext {
    return this.xmlStreamWriter.getNamespaceContext();
  }
  getPrefix(uri: string): string {
    return this.xmlStreamWriter.getPrefix(uri);
  }
  getProperty(name: string): any {
    return this.xmlStreamWriter.getProperty(name);
  }
  setDefaultNamespace(uri: string): void {
    this.xmlStreamWriter.setDefaultNamespace(uri);
  }
  setNamespaceContext(context: NamespaceContext): void {
    this.xmlStreamWriter.setNamespaceContext(context);
  }
  setPrefix(prefix: string, uri: string): void {
    this.xmlStreamWriter.setPrefix(prefix, uri);
  }
  writeAttribute$String$String(localName: string, value: string): void {
    this.xmlStreamWriter.writeAttribute(localName, value);
  }
  writeAttribute$String$String$String(namespaceURI: string, localName: string, value: string): void {
    this.xmlStreamWriter.writeAttribute(namespaceURI, localName, value);
  }
  writeAttribute$String$String$String$String(prefix: string, namespaceURI: string, localName: string, value: string): void {
    this.xmlStreamWriter.writeAttribute(prefix, namespaceURI, localName, value);
  }
  writeCData(data: string): void {
    this.xmlStreamWriter.writeCData(data);
  }
  writeCharacters$charArr$int$int(text: number[], start: number, len: number): void {
    this.xmlStreamWriter.writeCharacters(text, start, len);
  }
  writeCharacters$String(text: string): void {
    this.xmlStreamWriter.writeCharacters(text);
  }
  writeComment(data: string): void {
    this.xmlStreamWriter.writeComment(data);
  }
  writeDefaultNamespace(namespaceURI: string): void {
    this.xmlStreamWriter.writeDefaultNamespace(namespaceURI);
  }
  writeDTD(dtd: string): void {
    this.xmlStreamWriter.writeDTD(dtd);
  }
  writeEmptyElement$String(localName: string): void {
    this.xmlStreamWriter.writeEmptyElement(localName);
  }
  writeEmptyElement$String$String(namespaceURI: string, localName: string): void {
    this.xmlStreamWriter.writeEmptyElement(namespaceURI, localName);
  }
  writeEmptyElement$String$String$String(prefix: string, localName: string, namespaceURI: string): void {
    this.xmlStreamWriter.writeEmptyElement(prefix, localName, namespaceURI);
  }
  writeEndDocument(): void {
    this.xmlStreamWriter.writeEndDocument();
  }
  writeEndElement(): void {
    this.xmlStreamWriter.writeEndElement();
  }
  writeEntityRef(name: string): void {
    this.xmlStreamWriter.writeEntityRef(name);
  }
  writeNamespace(prefix: string, namespaceURI: string): void {
    this.xmlStreamWriter.writeNamespace(prefix, namespaceURI);
  }
  writeProcessingInstruction$String(target: string): void {
    this.xmlStreamWriter.writeProcessingInstruction(target);
  }
  writeProcessingInstruction$String$String(target: string, data: string): void {
    this.xmlStreamWriter.writeProcessingInstruction(target, data);
  }
  writeStartDocument$(): void {
    this.xmlStreamWriter.writeStartDocument();
  }
  writeStartDocument$String(version: string): void {
    this.xmlStreamWriter.writeStartDocument(version);
  }
  writeStartDocument$String$String(encoding: string, version: string): void {
    this.xmlStreamWriter.writeStartDocument(encoding, version);
  }
  writeStartElement$String(localName: string): void {
    this.xmlStreamWriter.writeStartElement(localName);
  }
  writeStartElement$String$String(namespaceURI: string, localName: string): void {
    this.xmlStreamWriter.writeStartElement(namespaceURI, localName);
  }
  writeStartElement$String$String$String(prefix: string, localName: string, namespaceURI: string): void {
    this.xmlStreamWriter.writeStartElement(prefix, localName, namespaceURI);
  }
  writeAttribute(...a: any[]): any {
    if (a.length === 2 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string')) return this.writeAttribute$String$String(...a);
    if (a.length === 3 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string') && (a[2] == null || typeof a[2] === 'string')) return this.writeAttribute$String$String$String(...a);
    if (a.length === 4 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string') && (a[2] == null || typeof a[2] === 'string') && (a[3] == null || typeof a[3] === 'string')) return this.writeAttribute$String$String$String$String(...a);
    throw new Error('no overload of writeAttribute for these arguments');
  }
  writeCharacters(...a: any[]): any {
    if (a.length === 1 && (a[0] == null || typeof a[0] === 'string')) return this.writeCharacters$String(...a);
    if (a.length === 3 && (a[0] == null || Array.isArray(a[0]) || ArrayBuffer.isView(a[0])) && typeof a[1] === 'number' && typeof a[2] === 'number') return this.writeCharacters$charArr$int$int(...a);
    throw new Error('no overload of writeCharacters for these arguments');
  }
  writeEmptyElement(...a: any[]): any {
    if (a.length === 1 && (a[0] == null || typeof a[0] === 'string')) return this.writeEmptyElement$String(...a);
    if (a.length === 2 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string')) return this.writeEmptyElement$String$String(...a);
    if (a.length === 3 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string') && (a[2] == null || typeof a[2] === 'string')) return this.writeEmptyElement$String$String$String(...a);
    throw new Error('no overload of writeEmptyElement for these arguments');
  }
  writeProcessingInstruction(...a: any[]): any {
    if (a.length === 1 && (a[0] == null || typeof a[0] === 'string')) return this.writeProcessingInstruction$String(...a);
    if (a.length === 2 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string')) return this.writeProcessingInstruction$String$String(...a);
    throw new Error('no overload of writeProcessingInstruction for these arguments');
  }
  writeStartDocument(...a: any[]): any {
    if (a.length === 0) return this.writeStartDocument$(...a);
    if (a.length === 1 && (a[0] == null || typeof a[0] === 'string')) return this.writeStartDocument$String(...a);
    if (a.length === 2 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string')) return this.writeStartDocument$String$String(...a);
    throw new Error('no overload of writeStartDocument for these arguments');
  }
  writeStartElement(...a: any[]): any {
    if (a.length === 1 && (a[0] == null || typeof a[0] === 'string')) return this.writeStartElement$String(...a);
    if (a.length === 2 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string')) return this.writeStartElement$String$String(...a);
    if (a.length === 3 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string') && (a[2] == null || typeof a[2] === 'string')) return this.writeStartElement$String$String$String(...a);
    throw new Error('no overload of writeStartElement for these arguments');
  }
  static $clinit() {
    FreeColXMLWriter.logger = Logger.getLogger($J.cls(FreeColXMLWriter).getName());
  }
}

/**
 * The scope of a FreeCol object write.
 */
export class FreeColXMLWriter$WriteScopeType extends JEnum {
  static CLIENT: FreeColXMLWriter$WriteScopeType = null;
  static SERVER: FreeColXMLWriter$WriteScopeType = null;
  static SAVE: FreeColXMLWriter$WriteScopeType = null;
  static $VALUES: FreeColXMLWriter$WriteScopeType[] = null;
  _FreeColXMLWriter$WriteScopeType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): FreeColXMLWriter$WriteScopeType[] { return FreeColXMLWriter$WriteScopeType.$VALUES.slice(); }
  static valueOf(name: string): FreeColXMLWriter$WriteScopeType { return $J.enumValueOf(FreeColXMLWriter$WriteScopeType, name); }
  static $clinit() {
    FreeColXMLWriter$WriteScopeType.CLIENT = new FreeColXMLWriter$WriteScopeType()._FreeColXMLWriter$WriteScopeType('CLIENT', 0);
    FreeColXMLWriter$WriteScopeType.SERVER = new FreeColXMLWriter$WriteScopeType()._FreeColXMLWriter$WriteScopeType('SERVER', 1);
    FreeColXMLWriter$WriteScopeType.SAVE = new FreeColXMLWriter$WriteScopeType()._FreeColXMLWriter$WriteScopeType('SAVE', 2);
    FreeColXMLWriter$WriteScopeType.$VALUES = [FreeColXMLWriter$WriteScopeType.CLIENT, FreeColXMLWriter$WriteScopeType.SERVER, FreeColXMLWriter$WriteScopeType.SAVE];
  }
}

export class FreeColXMLWriter$WriteScope extends JObject {
  scopeType: FreeColXMLWriter$WriteScopeType = null;
  player: Player = null;
  _FreeColXMLWriter$WriteScope(scopeType: FreeColXMLWriter$WriteScopeType, player: Player): this {
    this.scopeType = scopeType;
    this.player = player;
    return this;
  }
  static toClient(player: Player): FreeColXMLWriter$WriteScope {
    return new FreeColXMLWriter$WriteScope()._FreeColXMLWriter$WriteScope(FreeColXMLWriter$WriteScopeType.CLIENT, player);
  }
  static toServer(): FreeColXMLWriter$WriteScope {
    return new FreeColXMLWriter$WriteScope()._FreeColXMLWriter$WriteScope(FreeColXMLWriter$WriteScopeType.SERVER, null);
  }
  static toSave(): FreeColXMLWriter$WriteScope {
    return new FreeColXMLWriter$WriteScope()._FreeColXMLWriter$WriteScope(FreeColXMLWriter$WriteScopeType.SAVE, null);
  }
  isValid(): boolean {
    return (this.scopeType === FreeColXMLWriter$WriteScopeType.CLIENT) === (this.player != null);
  }
  validForSave(): boolean {
    return this.scopeType === FreeColXMLWriter$WriteScopeType.SAVE;
  }
  validFor(player: Player): boolean {
    return this.scopeType !== FreeColXMLWriter$WriteScopeType.CLIENT || this.player === player;
  }
  getClient(): Player {
    return this.player;
  }
  toString(): string {
    let ret = this.scopeType.toString();
    if (this.scopeType === FreeColXMLWriter$WriteScopeType.CLIENT) {
      ret += ':' + ((this.player == null) ? 'INVALID' : this.player.getId());
    }
    return ret;
  }
}

$J.define(FreeColXMLWriter, 'net.sf.freecol.common.io.FreeColXMLWriter', { kind: 'class', ifaces: ['java.io.Closeable', 'javax.xml.stream.XMLStreamWriter'], sup: 'java.lang.Object', ctors: { 'java.io.Writer,net.sf.freecol.common.io.FreeColXMLWriter$WriteScope,boolean': '_FreeColXMLWriter$Writer$WriteScope$boolean', 'java.io.Writer,net.sf.freecol.common.io.FreeColXMLWriter$WriteScope': '_FreeColXMLWriter$Writer$WriteScope', 'java.io.Writer': '_FreeColXMLWriter$Writer', 'java.io.OutputStream,net.sf.freecol.common.io.FreeColXMLWriter$WriteScope,boolean': '_FreeColXMLWriter$OutputStream$WriteScope$boolean' }, returns: { 'getNamespaceContext': 'javax.xml.namespace.NamespaceContext', 'getClientPlayer': 'net.sf.freecol.common.model.Player', 'getWriteScope': 'net.sf.freecol.common.io.FreeColXMLWriter$WriteScope', 'getFactory': 'javax.xml.stream.XMLOutputFactory' }, meths: { 'writeStartElement(java.lang.String,java.lang.String,java.lang.String)': 'writeStartElement$String$String$String', 'writeStartElement(java.lang.String,java.lang.String)': 'writeStartElement$String$String', 'writeStartElement(java.lang.String)': 'writeStartElement$String', 'writeStartDocument(java.lang.String,java.lang.String)': 'writeStartDocument$String$String', 'writeStartDocument(java.lang.String)': 'writeStartDocument$String', 'writeStartDocument()': 'writeStartDocument$', 'writeProcessingInstruction(java.lang.String,java.lang.String)': 'writeProcessingInstruction$String$String', 'writeProcessingInstruction(java.lang.String)': 'writeProcessingInstruction$String', 'writeEmptyElement(java.lang.String,java.lang.String,java.lang.String)': 'writeEmptyElement$String$String$String', 'writeEmptyElement(java.lang.String,java.lang.String)': 'writeEmptyElement$String$String', 'writeEmptyElement(java.lang.String)': 'writeEmptyElement$String', 'writeCharacters(java.lang.String)': 'writeCharacters$String', 'writeCharacters(char[],int,int)': 'writeCharacters$charArr$int$int', 'writeAttribute(java.lang.String,java.lang.String,java.lang.String,java.lang.String)': 'writeAttribute$String$String$String$String', 'writeAttribute(java.lang.String,java.lang.String,java.lang.String)': 'writeAttribute$String$String$String', 'writeAttribute(java.lang.String,java.lang.String)': 'writeAttribute$String$String', 'writeAttribute(java.lang.String,net.sf.freecol.common.model.FreeColObject)': 'writeAttribute$String$FreeColObject', 'writeAttribute(java.lang.String,java.lang.Object)': 'writeAttribute$String$Object', 'writeAttribute(java.lang.String,java.lang.Enum)': 'writeAttribute$String$Enum', 'writeAttribute(java.lang.String,long)': 'writeAttribute$String$long', 'writeAttribute(java.lang.String,int)': 'writeAttribute$String$int', 'writeAttribute(java.lang.String,float)': 'writeAttribute$String$float', 'writeAttribute(java.lang.String,boolean)': 'writeAttribute$String$boolean' }, clinit: true, lazy: ['logger'] });
$J.define(FreeColXMLWriter$WriteScopeType, 'net.sf.freecol.common.io.FreeColXMLWriter$WriteScopeType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_FreeColXMLWriter$WriteScopeType' }, clinit: true, lazy: ['$VALUES', 'CLIENT', 'SERVER', 'SAVE'] });
$J.define(FreeColXMLWriter$WriteScope, 'net.sf.freecol.common.io.FreeColXMLWriter$WriteScope', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.io.FreeColXMLWriter$WriteScopeType,net.sf.freecol.common.model.Player': '_FreeColXMLWriter$WriteScope' }, returns: { 'getClient': 'net.sf.freecol.common.model.Player', 'isValid': 'boolean' } });
$J.module(() => {
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
