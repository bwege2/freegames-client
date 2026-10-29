// @ts-nocheck
// javax.xml.stream: a pull parser with StAX's events, and a writer that writes what the JDK's
// XMLStreamWriterImpl writes (no self-closing tags, its escaping), so that saves are byte-identical.
import { $J, JObject, defineLib, str, XMLStreamException, IllegalStateException, UnsupportedOperationException } from './lang.ts';

export const XMLStreamConstants = {
  START_ELEMENT: 1, END_ELEMENT: 2, PROCESSING_INSTRUCTION: 3, CHARACTERS: 4, COMMENT: 5, SPACE: 6,
  START_DOCUMENT: 7, END_DOCUMENT: 8, ENTITY_REFERENCE: 9, ATTRIBUTE: 10, DTD: 11, CDATA: 12,
  NAMESPACE: 13, NOTATION_DECLARATION: 14, ENTITY_DECLARATION: 15,
};
const E = XMLStreamConstants;

export class QName extends JObject {
  ns: string;
  local: string;
  prefix: any;
  constructor(ns: string, local: string, prefix = '') {
    super();
    this.ns = ns; this.local = local; this.prefix = prefix;
    if (local === undefined) {
      this.local = ns;
      this.ns = '';
    }
  }
  getLocalPart() { return this.local; }
  getNamespaceURI() { return this.ns; }
  getPrefix() { return this.prefix; }
  toString() { return this.ns ? '{' + this.ns + '}' + this.local : this.local; }
  equals(o: any) { return o instanceof QName && o.local === this.local && o.ns === this.ns; }
  hashCode() { return $J.hashCode(this.local); }
}
defineLib(QName, 'javax.xml.namespace.QName');

function decodeEntities(s: string, attr: boolean, at: () => string): string {
  if (attr) s = s.replace(/[\t\n\r]/g, ' ');
  if (s.indexOf('&') < 0) return s;
  return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (m, e) => {
    switch (e) {
    case 'lt': return '<';
    case 'gt': return '>';
    case 'amp': return '&';
    case 'quot': return '"';
    case 'apos': return "'";
    default:
      if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' ? parseInt(e.substring(2), 16) : parseInt(e.substring(1), 10));
      throw new XMLStreamException('ParseError at ' + at() + '\nMessage: The entity "' + e + '" was referenced, but not declared.');
    }
  });
}

/** A StAX reader over a whole document. */
export class XMLStreamReaderImpl extends JObject {
  pos = 0;
  ev = E.START_DOCUMENT;
  name = '';
  attrs: [string, string][] = [];
  text = '';
  emptyPending = false;
  depth = 0;
  version: string = null;
  encoding: string = null;
  piTarget = '';
  src: string;
  constructor(src: string) {
    super();
    this.src = src;
    this.src = src.replace(/\r\n?/g, '\n');
    if (this.src.charCodeAt(0) === 0xfeff) this.src = this.src.substring(1);
    const m = /^<\?xml\s+([^?]*)\?>/.exec(this.src);
    if (m) {
      const v = /version\s*=\s*["']([^"']*)["']/.exec(m[1]);
      const e = /encoding\s*=\s*["']([^"']*)["']/.exec(m[1]);
      this.version = v ? v[1] : null;
      this.encoding = e ? e[1] : null;
      this.pos = m[0].length;
    }
  }
  where(): string {
    const before = this.src.substring(0, this.pos);
    const row = before.split('\n').length;
    const col = this.pos - before.lastIndexOf('\n');
    return '[row,col]:[' + row + ',' + col + ']';
  }
  fail(msg: string): never {
    throw new XMLStreamException('ParseError at ' + this.where() + '\nMessage: ' + msg);
  }
  hasNext(): boolean {
    return this.ev !== E.END_DOCUMENT;
  }
  next(): number {
    if (this.emptyPending) {
      this.emptyPending = false;
      this.depth--;
      this.ev = E.END_ELEMENT;
      return this.ev;
    }
    if (this.ev === E.END_DOCUMENT) throw new IllegalStateException('No more events');
    const s = this.src;
    if (this.pos >= s.length) {
      if (this.depth > 0) this.fail('XML document structures must start and end within the same entity.');
      this.ev = E.END_DOCUMENT;
      return this.ev;
    }
    if (s[this.pos] !== '<') {
      let end = s.indexOf('<', this.pos);
      if (end < 0) end = s.length;
      const raw = s.substring(this.pos, end);
      this.pos = end;
      this.text = decodeEntities(raw, false, () => this.where());
      this.ev = this.depth === 0 && /^\s*$/.test(this.text) ? E.SPACE : E.CHARACTERS;
      if (this.depth === 0 && this.ev === E.SPACE) return this.next();
      return this.ev;
    }
    if (s.startsWith('<!--', this.pos)) {
      const end = s.indexOf('-->', this.pos + 4);
      if (end < 0) this.fail('comment not closed');
      this.text = s.substring(this.pos + 4, end);
      this.pos = end + 3;
      this.ev = E.COMMENT;
      return this.ev;
    }
    if (s.startsWith('<![CDATA[', this.pos)) {
      const end = s.indexOf(']]>', this.pos + 9);
      this.text = s.substring(this.pos + 9, end);
      this.pos = end + 3;
      this.ev = E.CHARACTERS;
      return this.ev;
    }
    if (s.startsWith('<?', this.pos)) {
      const end = s.indexOf('?>', this.pos + 2);
      const body = s.substring(this.pos + 2, end);
      this.piTarget = body.split(/\s/)[0];
      this.text = body.substring(this.piTarget.length).trim();
      this.pos = end + 2;
      this.ev = E.PROCESSING_INSTRUCTION;
      return this.ev;
    }
    if (s.startsWith('<!DOCTYPE', this.pos)) {
      let d = 0, i = this.pos;
      for (; i < s.length; i++) {
        if (s[i] === '[') d++;
        else if (s[i] === ']') d--;
        else if (s[i] === '>' && d === 0) break;
      }
      this.text = s.substring(this.pos, i + 1);
      this.pos = i + 1;
      this.ev = E.DTD;
      return this.ev;
    }
    if (s[this.pos + 1] === '/') {
      const end = s.indexOf('>', this.pos);
      this.name = s.substring(this.pos + 2, end).trim();
      this.pos = end + 1;
      this.depth--;
      this.ev = E.END_ELEMENT;
      return this.ev;
    }
    // start tag
    let i = this.pos + 1;
    const re = /[^\s/>]+/y;
    re.lastIndex = i;
    const nm = re.exec(s);
    if (!nm) this.fail('bad element name');
    this.name = nm[0];
    i = re.lastIndex;
    this.attrs = [];
    const attrRe = /\s*([^\s=/>]+)\s*=\s*("([^"]*)"|'([^']*)')/y;
    for (;;) {
      attrRe.lastIndex = i;
      const a = attrRe.exec(s);
      if (!a) break;
      const raw = a[3] !== undefined ? a[3] : a[4];
      this.attrs.push([a[1], decodeEntities(raw, true, () => this.where())]);
      i = attrRe.lastIndex;
    }
    while (i < s.length && /\s/.test(s[i])) i++;
    if (s[i] === '/' && s[i + 1] === '>') {
      this.emptyPending = true;
      i += 2;
    } else if (s[i] === '>') {
      i++;
    } else {
      this.pos = i;
      this.fail('Element type "' + this.name + '" must be followed by either attribute specifications, ">" or "/>".');
    }
    this.pos = i;
    this.depth++;
    this.ev = E.START_ELEMENT;
    return this.ev;
  }
  nextTag(): number {
    let ev = this.next();
    while ((ev === E.CHARACTERS && /^\s*$/.test(this.text)) || ev === E.SPACE || ev === E.COMMENT || ev === E.PROCESSING_INSTRUCTION) ev = this.next();
    if (ev !== E.START_ELEMENT && ev !== E.END_ELEMENT) this.fail('found: ' + eventName(ev) + ', expected START_ELEMENT or END_ELEMENT');
    return ev;
  }
  getElementText(): string {
    if (this.ev !== E.START_ELEMENT) this.fail('parser must be on START_ELEMENT to read next text');
    let r = '';
    let ev = this.next();
    while (ev !== E.END_ELEMENT) {
      if (ev === E.CHARACTERS || ev === E.CDATA || ev === E.SPACE || ev === E.ENTITY_REFERENCE) r += this.text;
      else if (ev === E.PROCESSING_INSTRUCTION || ev === E.COMMENT) {
        // skip
      } else if (ev === E.END_DOCUMENT) this.fail('unexpected end of document when reading element text content');
      else if (ev === E.START_ELEMENT) this.fail('elementGetText() function expects text only elment but START_ELEMENT was encountered.');
      ev = this.next();
    }
    return r;
  }
  require(type: number, _ns: string, local: string) {
    if (type !== this.ev || (local != null && local !== this.name)) this.fail('Expected ' + eventName(type) + ' ' + local);
  }
  getEventType() { return this.ev; }
  getLocalName() { return this.name; }
  getName() { return new QName('', this.name); }
  hasName() { return this.ev === E.START_ELEMENT || this.ev === E.END_ELEMENT; }
  getPrefix() { return ''; }
  getNamespaceURI(_p?: string) { return null; }
  getNamespaceCount() { return 0; }
  getAttributeCount() { return this.attrs.length; }
  getAttributeLocalName(i: number) { return this.attrs[i][0]; }
  getAttributeName(i: number) { return new QName('', this.attrs[i][0]); }
  getAttributeNamespace(_i: number) { return null; }
  getAttributePrefix(_i: number) { return ''; }
  getAttributeType(_i: number) { return 'CDATA'; }
  isAttributeSpecified(_i: number) { return true; }
  getAttributeValue(a: any, b?: string): string {
    if (typeof a === 'number' && b === undefined) return this.attrs[a][1];
    for (const [k, v] of this.attrs) if (k === b) return v;
    return null;
  }
  getText() { return this.text; }
  getTextCharacters() { return [...this.text].map((c) => c.charCodeAt(0)); }
  getTextStart() { return 0; }
  getTextLength() { return this.text.length; }
  hasText() { return this.ev === E.CHARACTERS || this.ev === E.COMMENT || this.ev === E.SPACE || this.ev === E.CDATA; }
  isStartElement() { return this.ev === E.START_ELEMENT; }
  isEndElement() { return this.ev === E.END_ELEMENT; }
  isCharacters() { return this.ev === E.CHARACTERS; }
  isWhiteSpace() { return (this.ev === E.CHARACTERS || this.ev === E.SPACE) && /^\s*$/.test(this.text); }
  getPITarget() { return this.piTarget; }
  getPIData() { return this.text; }
  getVersion() { return this.version; }
  getEncoding() { return this.encoding; }
  getCharacterEncodingScheme() { return this.encoding; }
  isStandalone() { return false; }
  standaloneSet() { return false; }
  getLocation() {
    const self = this;
    return { getLineNumber: () => self.src.substring(0, self.pos).split('\n').length, getColumnNumber: () => 0, getCharacterOffset: () => self.pos, toString: () => self.where() };
  }
  getProperty() { return null; }
  getNamespaceContext() { return null; }
  close() {}
}
defineLib(XMLStreamReaderImpl, 'com.sun.org.apache.xerces.internal.impl.XMLStreamReaderImpl', { ifaces: ['javax.xml.stream.XMLStreamReader'] });

function eventName(e: number): string {
  for (const [k, v] of Object.entries(E)) if (v === e) return k;
  return String(e);
}

/** StreamReaderDelegate: every call goes to the parent reader. */
export class StreamReaderDelegate extends JObject {
  parent: any = null;
  constructor(p?: any) {
    super();
    if (p) this.parent = p;
  }
  _StreamReaderDelegate(p?: any): this {
    if (p) this.parent = p;
    return this;
  }
  setParent(p: any) { this.parent = p; }
  getParent() { return this.parent; }
}
for (const k of Object.getOwnPropertyNames(XMLStreamReaderImpl.prototype)) {
  if (k === 'constructor' || k in StreamReaderDelegate.prototype) continue;
  StreamReaderDelegate.prototype[k] = function (...a: any[]) {
    return this.parent[k](...a);
  };
}
defineLib(StreamReaderDelegate, 'javax.xml.stream.util.StreamReaderDelegate', { ifaces: ['javax.xml.stream.XMLStreamReader'] });

export class XMLInputFactory extends JObject {
  static readonly SUPPORT_DTD = 'javax.xml.stream.supportDTD';
  static readonly IS_COALESCING = 'javax.xml.stream.isCoalescing';
  static readonly IS_NAMESPACE_AWARE = 'javax.xml.stream.isNamespaceAware';
  static readonly IS_SUPPORTING_EXTERNAL_ENTITIES = 'javax.xml.stream.isSupportingExternalEntities';
  static newInstance() { return new XMLInputFactory(); }
  static newFactory() { return new XMLInputFactory(); }
  setProperty() {}
  createXMLStreamReader(src: any, _enc?: string) {
    const text = typeof src === 'string' ? src : src.$readAllText();
    return new XMLStreamReaderImpl(text);
  }
}
defineLib(XMLInputFactory, 'javax.xml.stream.XMLInputFactory');

/* ------------------------------------------------------------------ writer */

function escapeContent(s: string, attr: boolean): string {
  let r = '';
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    let rep: string | null = null;
    if (c === 60) rep = '&lt;';
    else if (c === 38) rep = '&amp;';
    else if (c === 62) rep = '&gt;';
    else if (c === 34 && attr) rep = '&quot;';
    if (rep) {
      r += s.substring(start, i) + rep;
      start = i + 1;
    }
  }
  return start === 0 ? s : r + s.substring(start);
}

/** What the JDK's XMLStreamWriterImpl writes (non-repairing). */
export class XMLStreamWriterImpl extends JObject {
  stack: string[] = [];
  open = false;
  empty = false;
  w: any;
  constructor(w: any) {
    super();
    this.w = w;
  }
  out(s: string) {
    this.w.write(s);
  }
  closeStart() {
    if (this.open) {
      this.out(this.empty ? '/>' : '>');
      if (this.empty) this.stack.pop();
      this.open = false;
      this.empty = false;
    }
  }
  writeStartDocument(a?: string, b?: string) {
    let enc: string = null, ver: string = null;
    if (b !== undefined) {
      enc = a;
      ver = b;
    } else if (a !== undefined) ver = a;
    if ((enc == null || enc.length === 0) && (ver == null || ver.length === 0)) {
      this.out('<?xml version="1.0" ?>');
      return;
    }
    this.out('<?xml version="' + (ver == null || ver === '' ? '1.0' : ver) + (enc ? '" encoding="' + enc : '') + '"?>');
  }
  writeEndDocument() {
    this.closeStart();
    while (this.stack.length) this.writeEndElement();
  }
  writeStartElement(a: string, b?: string, c?: string) {
    this.closeStart();
    const local = c !== undefined ? b : b !== undefined ? b : a;
    const name = c !== undefined && a ? a + ':' + b : local;
    this.out('<' + name);
    this.stack.push(name);
    this.open = true;
  }
  writeEmptyElement(a: string, b?: string, c?: string) {
    this.writeStartElement(a, b, c);
    this.empty = true;
  }
  writeEndElement() {
    this.closeStart();
    const n = this.stack.pop();
    this.out('</' + n + '>');
  }
  writeAttribute(a: string, b: string, c?: string, d?: string) {
    if (!this.open) throw new XMLStreamException('Attribute not associated with any element');
    let name: string, value: string;
    if (d !== undefined) { name = a ? a + ':' + c : c; value = d; }
    else if (c !== undefined) { name = b; value = c; }
    else { name = a; value = b; }
    this.out(' ' + name + '="' + escapeContent(value == null ? 'null' : value, true) + '"');
  }
  writeNamespace(p: string, uri: string) {
    this.out(' xmlns' + (p ? ':' + p : '') + '="' + escapeContent(uri, true) + '"');
  }
  writeDefaultNamespace(uri: string) {
    this.writeNamespace('', uri);
  }
  writeCharacters(a: any, start?: number, len?: number) {
    this.closeStart();
    let s = typeof a === 'string' ? a : String.fromCharCode(...a.slice(start, start + len));
    this.out(escapeContent(s, false));
  }
  writeCData(s: string) {
    this.closeStart();
    this.out('<![CDATA[' + s + ']]>');
  }
  writeComment(s: string) {
    this.closeStart();
    this.out('<!--' + (s == null ? '' : s) + '-->');
  }
  writeProcessingInstruction(t: string, d?: string) {
    this.closeStart();
    this.out('<?' + t + (d != null ? ' ' + d : '') + '?>');
  }
  writeDTD(s: string) {
    this.out(s);
  }
  writeEntityRef(n: string) {
    this.closeStart();
    this.out('&' + n + ';');
  }
  flush() {
    if (this.w.flush) this.w.flush();
  }
  close() {}
  getPrefix() { return null; }
  setPrefix() {}
  setDefaultNamespace() {}
  setNamespaceContext() {}
  getNamespaceContext() { return null; }
  getProperty() { return null; }
}
defineLib(XMLStreamWriterImpl, 'com.sun.xml.internal.stream.writers.XMLStreamWriterImpl', { ifaces: ['javax.xml.stream.XMLStreamWriter'] });

export class XMLOutputFactory extends JObject {
  static newInstance() { return new XMLOutputFactory(); }
  static newFactory() { return new XMLOutputFactory(); }
  setProperty() {}
  createXMLStreamWriter(w: any, _enc?: string) {
    // an OutputStream gets UTF-8 bytes; a Writer gets the text
    if (w && w.chunks) return new XMLStreamWriterImpl({ write: (s: string) => w.$writeText(s), flush: () => w.flush() });
    return new XMLStreamWriterImpl(w);
  }
}
defineLib(XMLOutputFactory, 'javax.xml.stream.XMLOutputFactory');

/* interfaces, for isa and class literals */
function iface(name: string, javaName: string): any {
  const C = { [name]: class {} }[name];
  defineLib(C, javaName, { kind: 'interface' });
  return C;
}
export const XMLStreamReader = iface('XMLStreamReader', 'javax.xml.stream.XMLStreamReader');
export const XMLStreamWriter = iface('XMLStreamWriter', 'javax.xml.stream.XMLStreamWriter');
export const XMLEvent = Object.assign(iface('XMLEvent', 'javax.xml.stream.events.XMLEvent'), XMLStreamConstants);
Object.assign(XMLStreamReader, XMLStreamConstants);
export const NamespaceContext = iface('NamespaceContext', 'javax.xml.namespace.NamespaceContext');

/* ------------------------------------------------------------------ javax.xml.transform: indentation */

/** The JDK's identity Transformer with indent: re-serializes an XML string with 2-space indentation. */
export class Transformer extends JObject {
  props: Record<string, string> = {};
  setOutputProperty(k: string, v: string) {
    this.props[k] = v;
  }
  transform(source: any, result: any) {
    const text = source.reader.$readAllText();
    const indent = this.props['indent'] === 'yes';
    const omitDecl = this.props['omit-xml-declaration'] === 'yes';
    result.write(indentXml(text, indent, omitDecl));
  }
}
defineLib(Transformer, 'javax.xml.transform.Transformer');

export class TransformerFactory extends JObject {
  static newInstance() { return new TransformerFactory(); }
  setAttribute() {}
  newTransformer() { return new Transformer(); }
}
defineLib(TransformerFactory, 'javax.xml.transform.TransformerFactory');

export class StreamSource extends JObject {
  reader: any;
  constructor(reader: any) {
    super();
    this.reader = reader;
  }
}
defineLib(StreamSource, 'javax.xml.transform.stream.StreamSource');
export class StreamResult extends JObject {
  writer: any;
  constructor(writer: any) {
    super();
    this.writer = writer;
  }
  write(s: string) {
    if (this.writer.$writeText && this.writer.chunks) this.writer.$writeText(s);
    else this.writer.write(s);
  }
}
defineLib(StreamResult, 'javax.xml.transform.stream.StreamResult');

export const OutputKeys = { ENCODING: 'encoding', METHOD: 'method', OMIT_XML_DECLARATION: 'omit-xml-declaration', INDENT: 'indent', STANDALONE: 'standalone' };
export const XMLConstants = { ACCESS_EXTERNAL_DTD: 'http://javax.xml.XMLConstants/property/accessExternalDTD', ACCESS_EXTERNAL_STYLESHEET: 'http://javax.xml.XMLConstants/property/accessExternalStylesheet', DEFAULT_NS_PREFIX: '' };

/** The JDK serializer's indented output (xalan ToStream with indent-amount 2), for the shapes FreeCol writes. */
function indentXml(text: string, indent: boolean, omitDecl: boolean): string {
  const r = new XMLStreamReaderImpl(text);
  let out = omitDecl ? '' : '<?xml version="1.0" encoding="UTF-8"?>';
  let depth = 0;
  let lastWasStart = false;
  let hadText = false;
  const nl = (d: number) => (indent ? '\n' + ' '.repeat(2 * d) : '');
  let first = true;
  while (r.hasNext()) {
    const ev = r.next();
    if (ev === E.START_ELEMENT) {
      if (lastWasStart) out += '>';
      if (!first || !omitDecl) out += hadText ? '' : nl(depth);
      first = false;
      out += '<' + r.getLocalName();
      for (const [k, v] of r.attrs) out += ' ' + k + '="' + escapeContent(v, true) + '"';
      depth++;
      lastWasStart = true;
      hadText = false;
    } else if (ev === E.END_ELEMENT) {
      depth--;
      if (lastWasStart) out += '/>';
      else out += (hadText ? '' : nl(depth)) + '</' + r.getLocalName() + '>';
      lastWasStart = false;
      hadText = false;
    } else if (ev === E.CHARACTERS) {
      if (/^\s*$/.test(r.getText()) && indent) continue;
      if (lastWasStart) out += '>';
      lastWasStart = false;
      out += escapeContent(r.getText(), false);
      hadText = true;
    } else if (ev === E.COMMENT) {
      if (lastWasStart) out += '>';
      lastWasStart = false;
      out += nl(depth) + '<!--' + r.getText() + '-->';
    }
  }
  return out + (indent ? '\n' : '');
}
