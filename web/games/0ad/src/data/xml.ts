// A small XML parser for 0 A.D.'s data files: elements, attributes, text, comments, CDATA and the
// five predefined entities (plus numeric character references). It is deliberately not a general
// XML library: it accepts exactly the subset the game's templates, maps and actor files use, and
// runs in Node (for the headless tests) as well as in the browser.
//
// 0 A.D.'s own XML is parsed by Xeromyces. The tree this returns is the same shape that
// CParamNode::ApplyLayer consumes (source/simulation2/system/ParamNode.cpp), which is what
// data/templates.ts implements.

export interface XmlElement {
  name: string;
  attrs: Record<string, string>;
  children: XmlElement[];
  /** the element's own text, trimmed (0 A.D. trims values when compositing) */
  text: string;
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function decode(text: string): string {
  return text.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (whole, body: string) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X' ? Number.parseInt(body.slice(2), 16) : Number.parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    }
    return ENTITIES[body] ?? whole;
  });
}

class Reader {
  pos = 0;
  readonly s: string;
  constructor(s: string) { this.s = s; }

  error(message: string): never {
    const before = this.s.slice(0, this.pos);
    const line = before.split('\n').length;
    const col = this.pos - before.lastIndexOf('\n');
    throw new Error(`XML: ${message} at line ${line}, column ${col}`);
  }

  skipWhitespace(): void {
    while (this.pos < this.s.length && /\s/.test(this.s[this.pos])) this.pos++;
  }

  /** Skip an XML declaration, comments, doctype and processing instructions before an element. */
  skipProlog(): void {
    for (;;) {
      this.skipWhitespace();
      if (this.s.startsWith('<?', this.pos)) {
        const end = this.s.indexOf('?>', this.pos + 2);
        if (end < 0) this.error('unterminated processing instruction');
        this.pos = end + 2;
      } else if (this.s.startsWith('<!--', this.pos)) {
        const end = this.s.indexOf('-->', this.pos + 4);
        if (end < 0) this.error('unterminated comment');
        this.pos = end + 3;
      } else if (this.s.startsWith('<!DOCTYPE', this.pos)) {
        // no doctype in the game data; skip to the matching '>' (the internal subset is not used)
        const end = this.s.indexOf('>', this.pos);
        if (end < 0) this.error('unterminated doctype');
        this.pos = end + 1;
      } else {
        return;
      }
    }
  }

  name(): string {
    const start = this.pos;
    while (this.pos < this.s.length && /[A-Za-z0-9_:.-]/.test(this.s[this.pos])) this.pos++;
    if (this.pos === start) this.error('expected a name');
    return this.s.slice(start, this.pos);
  }

  attributeValue(): string {
    const quote = this.s[this.pos];
    if (quote !== '"' && quote !== "'") this.error('expected a quoted attribute value');
    this.pos++;
    const end = this.s.indexOf(quote, this.pos);
    if (end < 0) this.error('unterminated attribute value');
    const raw = this.s.slice(this.pos, end);
    this.pos = end + 1;
    return decode(raw);
  }

  element(): XmlElement {
    if (this.s[this.pos] !== '<') this.error('expected <');
    this.pos++;
    const name = this.name();
    const attrs: Record<string, string> = {};
    for (;;) {
      this.skipWhitespace();
      if (this.s.startsWith('/>', this.pos)) {
        this.pos += 2;
        return { name, attrs, children: [], text: '' };
      }
      if (this.s[this.pos] === '>') {
        this.pos++;
        break;
      }
      const attr = this.name();
      this.skipWhitespace();
      if (this.s[this.pos] !== '=') this.error(`expected = after attribute ${attr}`);
      this.pos++;
      this.skipWhitespace();
      attrs[attr] = this.attributeValue();
    }
    const element: XmlElement = { name, attrs, children: [], text: '' };
    let text = '';
    for (;;) {
      if (this.pos >= this.s.length) this.error(`unterminated element ${name}`);
      if (this.s.startsWith('</', this.pos)) {
        this.pos += 2;
        const close = this.name();
        if (close !== name) this.error(`expected </${name}>, found </${close}>`);
        this.skipWhitespace();
        if (this.s[this.pos] !== '>') this.error(`expected > after </${name}`);
        this.pos++;
        element.text = decode(text).trim();
        return element;
      }
      if (this.s.startsWith('<!--', this.pos)) {
        const end = this.s.indexOf('-->', this.pos + 4);
        if (end < 0) this.error('unterminated comment');
        this.pos = end + 3;
      } else if (this.s.startsWith('<![CDATA[', this.pos)) {
        const end = this.s.indexOf(']]>', this.pos + 9);
        if (end < 0) this.error('unterminated CDATA');
        text += this.s.slice(this.pos + 9, end);
        this.pos = end + 3;
      } else if (this.s.startsWith('<?', this.pos)) {
        const end = this.s.indexOf('?>', this.pos + 2);
        if (end < 0) this.error('unterminated processing instruction');
        this.pos = end + 2;
      } else if (this.s[this.pos] === '<') {
        element.children.push(this.element());
      } else {
        const next = this.s.indexOf('<', this.pos);
        const end = next < 0 ? this.s.length : next;
        text += this.s.slice(this.pos, end);
        this.pos = end;
      }
    }
  }
}

/** Parse one XML document and return its root element. */
export function parseXml(source: string): XmlElement {
  const reader = new Reader(source);
  reader.skipProlog();
  const root = reader.element();
  reader.skipWhitespace();
  if (reader.pos !== source.length) {
    // trailing comments/whitespace are fine, anything else is a malformed document
    reader.skipProlog();
    if (reader.pos !== source.length) reader.error('trailing content after the root element');
  }
  return root;
}

/** The first child with that name, or undefined. */
export function child(node: XmlElement | undefined, name: string): XmlElement | undefined {
  return node?.children.find((c) => c.name === name);
}

/** The text of a child, or '' when it is absent. */
export function childText(node: XmlElement | undefined, name: string): string {
  return child(node, name)?.text ?? '';
}

/** Walk a path of element names, e.g. `path(root, 'Cost', 'Resources', 'wood')`. */
export function path(node: XmlElement | undefined, ...names: string[]): XmlElement | undefined {
  let cur = node;
  for (const name of names) cur = child(cur, name);
  return cur;
}

/** The text at a path, or '' when absent. */
export function pathText(node: XmlElement | undefined, ...names: string[]): string {
  return path(node, ...names)?.text ?? '';
}

/** Split a 0 A.D. `datatype="tokens"` value into its tokens. */
export function tokens(value: string): string[] {
  return value.split(/\s+/).filter(Boolean);
}
