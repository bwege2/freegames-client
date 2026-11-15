// sgf/sgfnode.c, sgf/sgftree.c and sgf/sgf_utils.c of GNU Go 3.8: the SGF tree, its reader (a lax
// recursive-descent parser) and its writer (unparse_game, lines broken after 60 columns).
// Property names are kept as the C code keeps them: two characters, a one-letter name padded with a
// space ("B ", "C ").

export interface SGFProperty {
  name: string;
  value: string;
  /** set while writing (the C code ORs 0x20 into the name) */
  printed?: boolean;
}

export class SGFNode {
  props: SGFProperty[] = [];
  parent: SGFNode | null = null;
  child: SGFNode | null = null;
  next: SGFNode | null = null;
}

export interface SGFTree {
  root: SGFNode | null;
  lastnode: SGFNode | null;
}

export const VERSION = '3.8';

const normName = (name: string): string => (name.length === 1 ? name + ' ' : name.slice(0, 2));

/** "%3.1f" */
export const f31 = (v: number): string => v.toFixed(1);

export function sgfNewNode(): SGFNode {
  return new SGFNode();
}

export function sgfAddProperty(node: SGFNode, name: string, value: string): void {
  sgfMkProperty(name, value, node);
}

export function sgfAddPropertyInt(node: SGFNode, name: string, val: number): void {
  sgfAddProperty(node, name, String(val).slice(0, 9));
}

export function sgfAddPropertyFloat(node: SGFNode, name: string, val: number): void {
  sgfAddProperty(node, name, f31(val).slice(0, 9));
}

/** atoi */
export function atoi(s: string): number {
  const m = /^\s*([+-]?\d+)/.exec(s);
  return m ? parseInt(m[1], 10) | 0 : 0;
}

/** atof */
export function atof(s: string): number {
  const m = /^\s*([+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?)/.exec(s);
  return m ? parseFloat(m[1]) : 0;
}

function findProp(node: SGFNode, name: string): SGFProperty | undefined {
  const nam = normName(name);
  return node.props.find((p) => p.name === nam);
}

export function sgfGetIntProperty(node: SGFNode, name: string): number | null {
  const p = findProp(node, name);
  return p ? atoi(p.value) : null;
}

export function sgfGetFloatProperty(node: SGFNode, name: string): number | null {
  const p = findProp(node, name);
  return p ? Math.fround(atof(p.value)) : null;
}

export function sgfGetCharProperty(node: SGFNode, name: string): string | null {
  const p = findProp(node, name);
  return p ? p.value : null;
}

function sgfHasProperty(node: SGFNode, name: string): boolean {
  return !!findProp(node, name);
}

export function sgfOverwriteProperty(node: SGFNode, name: string, text: string): void {
  const p = findProp(node, name);
  if (p) p.value = text;
  else sgfAddProperty(node, name, text);
}

export function sgfOverwritePropertyInt(node: SGFNode, name: string, val: number): void {
  const p = findProp(node, name);
  if (p) p.value = String(val).slice(0, 11);
  else sgfAddPropertyInt(node, name, val);
}

export function sgfOverwritePropertyFloat(node: SGFNode, name: string, val: number): void {
  const p = findProp(node, name);
  if (p) p.value = f31(val).slice(0, 14);
  else sgfAddPropertyFloat(node, name, val);
}

const properties_allowing_ranges = ['AB', 'AW', 'AE', 'CR', 'MA', 'SQ', 'TR', 'DD', 'SL', 'VW', 'TB', 'TW'];

export function sgfMkProperty(name: string, value: string, node: SGFNode): void {
  const sgf_name = normName(name);
  if (properties_allowing_ranges.includes(sgf_name) && value.length === 5 && value[2] === ':') {
    const x1 = value.charCodeAt(0);
    const y1 = value.charCodeAt(1);
    const x2 = value.charCodeAt(3);
    const y2 = value.charCodeAt(4);
    if (x1 <= x2 && y1 <= y2) {
      for (let x = x1; x <= x2; x++)
        for (let y = y1; y <= y2; y++) node.props.push({ name: sgf_name, value: String.fromCharCode(x, y) });
      return;
    }
  }
  node.props.push({ name: sgf_name, value });
}

const coord = (movex: number, movey: number): string => String.fromCharCode(movey + 97, movex + 97);

export function sgfAddStone(node: SGFNode, color: number, movex: number, movey: number): SGFNode {
  sgfAddProperty(node, color === 2 ? 'AB' : 'AW', coord(movex, movey));
  return node;
}

export function sgfAddPlay(node: SGFNode, who: number, movex: number, movey: number): SGFNode {
  const move = movex === -1 && movey === -1 ? '' : coord(movex, movey);
  let n: SGFNode;
  if (node.child) n = sgfStartVariantFirst(node.child);
  else {
    n = sgfNewNode();
    node.child = n;
    n.parent = node;
  }
  sgfAddProperty(n, who === 2 ? 'B' : 'W', move);
  return n;
}

export function sgfAddPlayLast(node: SGFNode, who: number, movex: number, movey: number): SGFNode {
  const move = movex === -1 && movey === -1 ? '' : coord(movex, movey);
  const n = sgfAddChild(node);
  sgfAddProperty(n, who === 2 ? 'B' : 'W', move);
  return n;
}

export function sgfAddComment(node: SGFNode, comment: string): SGFNode {
  sgfAddProperty(node, 'C ', comment);
  return node;
}

export function sgfStartVariantFirst(node: SGFNode): SGFNode {
  const n = sgfNewNode();
  n.next = node;
  n.parent = node.parent;
  n.parent!.child = n;
  return n;
}

export function sgfAddChild(node: SGFNode): SGFNode {
  const n = sgfNewNode();
  n.parent = node;
  if (!node.child) node.child = n;
  else {
    let c = node.child;
    while (c.next) c = c.next;
    c.next = n;
  }
  return n;
}

export function sgfWriteResult(node: SGFNode | null, score: number, overwrite: boolean): void {
  if (!node) return;
  if (!overwrite && sgfGetIntProperty(node, 'RE') !== null) return;
  let winner;
  let s;
  if (score > 0.0) {
    winner = 'W';
    s = score;
  } else if (score < 0.0) {
    winner = 'B';
    s = -score;
  } else {
    winner = '0';
    s = 0;
  }
  let text;
  if (winner === '0') text = '0';
  else if (score < 1000.0 && score > -1000.0) text = `${winner}+${f31(s)}`.slice(0, 7);
  else text = `${winner}+R`;
  sgfOverwriteProperty(node, 'RE', text);
}

/** the clock for DT, replaceable in tests */
export const sgfClock = { now: (): Date => new Date() };

function sgf_write_header_reduced(root: SGFNode, overwrite: boolean): void {
  const d = sgfClock.now();
  const str = `${String(d.getFullYear()).padStart(4, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  if (overwrite || sgfGetIntProperty(root, 'DT') === null) sgfOverwriteProperty(root, 'DT', str);
  if (overwrite || sgfGetIntProperty(root, 'AP') === null) sgfOverwriteProperty(root, 'AP', 'GNU Go:' + VERSION);
  sgfOverwriteProperty(root, 'FF', '4');
}

export function sgf_write_header(
  root: SGFNode, overwrite: boolean, seed: number, komi: number, handicap: number, level: number, rules: boolean,
): void {
  const str = `GNU Go ${VERSION} Random Seed ${seed | 0} level ${level}`;
  if (overwrite || sgfGetIntProperty(root, 'GN') === null) sgfOverwriteProperty(root, 'GN', str);
  if (overwrite || sgfGetIntProperty(root, 'RU') === null) sgfOverwriteProperty(root, 'RU', rules ? 'Chinese' : 'Japanese');
  sgfOverwritePropertyFloat(root, 'KM', komi);
  sgfOverwritePropertyInt(root, 'HA', handicap);
  sgf_write_header_reduced(root, overwrite);
}

// ---------------------------------------------------------------- the reader

/** parse_error(): the C program prints the message and exits */
export class SgfParseError extends Error {}

const isspace = (c: number): boolean => c === 32 || (c >= 9 && c <= 13);
const isupper = (c: number): boolean => c >= 65 && c <= 90;
const isalpha = (c: number): boolean => isupper(c) || (c >= 97 && c <= 122);
const EOF = -1;

class Reader {
  pos = 0;
  lookahead = 0;
  data: Uint8Array;
  constructor(data: Uint8Array) {
    this.data = data;
  }
  getch(): number {
    return this.pos < this.data.length ? this.data[this.pos++] : EOF;
  }
  nexttoken(): void {
    do this.lookahead = this.getch();
    while (isspace(this.lookahead));
  }
  match(expected: number): void {
    if (this.lookahead !== expected) throw new SgfParseError(`expected: ${String.fromCharCode(expected)}`);
    this.nexttoken();
  }
  propident(): string {
    if (this.lookahead === EOF || !isupper(this.lookahead)) throw new SgfParseError('Expected an upper case letter.');
    let s = '';
    while (this.lookahead !== EOF && isalpha(this.lookahead)) {
      if (isupper(this.lookahead) && s.length < 2) s += String.fromCharCode(this.lookahead);
      this.nexttoken();
    }
    return s;
  }
  propvalue(): string {
    const buf: number[] = [];
    let size = 4000;
    this.match(91);
    while (this.lookahead !== 93 && this.lookahead !== EOF) {
      if (this.lookahead === 92) {
        this.lookahead = this.getch();
        if (this.lookahead === 13) {
          this.lookahead = this.getch();
          if (this.lookahead === 10) this.lookahead = this.getch();
        } else if (this.lookahead === 10) {
          this.lookahead = this.getch();
          if (this.lookahead === 13) this.lookahead = this.getch();
        }
      }
      if (size > 1) {
        buf.push(this.lookahead & 0xff);
        size--;
      }
      this.lookahead = this.getch();
    }
    this.match(93);
    let end = buf.length;
    while (end > 1 && isspace(buf[end - 1])) end--;
    if (end === 1 && isspace(buf[0])) end = 1; // the C loop stops at the first character
    return latin(buf.slice(0, end));
  }
  property(n: SGFNode): void {
    const name = this.propident();
    do {
      const v = this.propvalue();
      sgfMkProperty(name, v, n);
    } while (this.lookahead === 91);
  }
  node(n: SGFNode): void {
    this.match(59);
    while (this.lookahead !== EOF && isupper(this.lookahead)) this.property(n);
  }
  sequence(n: SGFNode): SGFNode {
    this.node(n);
    while (this.lookahead === 59) {
      const nn = sgfNewNode();
      nn.parent = n;
      n.child = nn;
      n = nn;
      this.node(n);
    }
    return n;
  }
  gametree(parent: SGFNode | null, strict: boolean): SGFNode {
    if (strict) this.match(40);
    else
      for (;;) {
        if (this.lookahead === EOF) throw new SgfParseError('Empty file?');
        if (this.lookahead === 40) {
          while (this.lookahead === 40) this.nexttoken();
          if (this.lookahead === 59) break;
        }
        this.nexttoken();
      }
    const head = sgfNewNode();
    head.parent = parent;
    const last = this.sequence(head);
    let prev: SGFNode | null = null;
    while (this.lookahead === 40) {
      const t = this.gametree(last, true);
      if (prev) prev.next = t;
      else last.child = t;
      prev = t;
    }
    if (strict) this.match(41);
    return head;
  }
}

const latin = (b: number[]): string => String.fromCharCode(...b);

export interface ReadResult {
  root: SGFNode;
  /** what readsgffile() writes to stderr on the way */
  warnings: string;
}

/** readsgffile(): throws SgfParseError where the C program exits */
export function readsgf(data: Uint8Array): ReadResult {
  const r = new Reader(data);
  r.nexttoken();
  const root = r.gametree(null, false);
  let warnings = '';
  const gm = sgfGetIntProperty(root, 'GM');
  if (gm !== null && gm !== 1)
    warnings += `SGF file might be for game other than go: ${gm}\nTrying to load anyway.\n`;
  return { root, warnings };
}

// ---------------------------------------------------------------- the writer

class Writer {
  out: string[] = [];
  column = 0;
  putc(c: string): void {
    if (c === '\n' && this.column === 0) return;
    this.out.push(c);
    if (c === '\n') this.column = 0;
    else this.column++;
    if (c === ']' && this.column > 60) {
      this.out.push('\n');
      this.column = 0;
    }
  }
  puts(s: string): void {
    for (const ch of s) {
      if (ch === '[' || ch === ']' || ch === '\\') {
        this.out.push('\\');
        this.column++;
      }
      this.out.push(ch);
      this.column++;
    }
  }
  print_name(name: string): void {
    this.putc(name[0]);
    if (name[1] !== ' ') this.putc(name[1]);
  }
  print_property(node: SGFNode, name: string, is_comment: boolean): void {
    let n = 0;
    for (const prop of node.props) {
      if (prop.name === name && !prop.printed) {
        prop.printed = true;
        if (n === 0) {
          this.print_name(name);
          this.putc('[');
        } else if (is_comment) this.putc('\n');
        else {
          this.putc(']');
          this.putc('[');
        }
        this.puts(prop.value);
        n++;
      }
    }
    if (n > 0) this.putc(']');
    if (name === 'AB' || name === 'AW' || name === 'AE' || (is_comment && n > 1)) this.putc('\n');
  }
  remaining(node: SGFNode): void {
    for (const prop of node.props) if (!prop.printed) this.print_property(node, prop.name, false);
  }
  node(node: SGFNode): void {
    this.putc(';');
    this.print_property(node, 'B ', false);
    this.print_property(node, 'W ', false);
    this.print_property(node, 'N ', true);
    this.print_property(node, 'C ', true);
    this.remaining(node);
  }
  root(node: SGFNode): void {
    this.putc(';');
    if (sgfHasProperty(node, 'GM')) this.print_property(node, 'GM', false);
    else {
      this.out.push('GM[1]');
      this.column += 5;
    }
    this.print_property(node, 'FF', false);
    this.putc('\n');
    this.print_property(node, 'SZ', false);
    this.putc('\n');
    this.print_property(node, 'GN', false);
    this.putc('\n');
    this.print_property(node, 'DT', false);
    this.putc('\n');
    this.print_property(node, 'PB', true);
    this.print_property(node, 'BR', true);
    this.putc('\n');
    this.print_property(node, 'PW', true);
    this.print_property(node, 'WR', true);
    this.putc('\n');
    this.print_property(node, 'N ', true);
    this.print_property(node, 'C ', true);
    this.remaining(node);
    this.putc('\n');
  }
  game(node: SGFNode | null, root: boolean): void {
    if (!root) this.putc('\n');
    this.putc('(');
    if (root) this.root(node!);
    else this.node(node!);
    node = node!.child;
    while (node !== null && node.next === null) {
      this.node(node);
      node = node.child;
    }
    while (node !== null) {
      this.game(node, false);
      node = node.next;
    }
    this.putc(')');
    if (root) this.putc('\n');
  }
}

function restore_node(node: SGFNode | null): void {
  if (node) {
    for (const p of node.props) p.printed = false;
    restore_node(node.child);
    restore_node(node.next);
  }
}

/** writesgf(): the file's bytes (Latin-1 strings) */
export function writesgf(root: SGFNode): string {
  sgf_write_header_reduced(root, false);
  const w = new Writer();
  w.game(root, true);
  restore_node(root);
  return w.out.join('');
}

// ---------------------------------------------------------------- sgftree.c

export function sgftree_clear(tree: SGFTree): void {
  tree.root = null;
  tree.lastnode = null;
}

export function sgftreeBack(tree: SGFTree): boolean {
  if (tree.lastnode) {
    if (tree.lastnode.parent) tree.lastnode = tree.lastnode.parent;
    else return false;
  } else while (sgftreeForward(tree));
  return true;
}

export function sgftreeForward(tree: SGFTree): boolean {
  if (tree.lastnode) {
    if (tree.lastnode.child) tree.lastnode = tree.lastnode.child;
    else return false;
  } else tree.lastnode = tree.root;
  return true;
}

export function sgftreeNodeCheck(tree: SGFTree): SGFNode {
  if (tree.lastnode) return tree.lastnode;
  let node = tree.root!;
  while (node.child) node = node.child;
  return node;
}

export function sgftreeAddPlay(tree: SGFTree, color: number, movex: number, movey: number): void {
  const node = sgftreeNodeCheck(tree);
  tree.lastnode = sgfAddPlay(node, color, movex, movey);
}

export function sgftreeAddPlayLast(tree: SGFTree, color: number, movex: number, movey: number): void {
  const node = sgftreeNodeCheck(tree);
  tree.lastnode = sgfAddPlayLast(node, color, movex, movey);
}

export function sgftreeCreateHeaderNode(tree: SGFTree, boardsize: number, komi: number, handicap: number): void {
  const root = sgfNewNode();
  sgfAddPropertyInt(root, 'SZ', boardsize);
  sgfAddPropertyFloat(root, 'KM', komi);
  sgfAddPropertyInt(root, 'HA', handicap);
  tree.root = root;
  tree.lastnode = root;
}

export function sgftreeAddComment(tree: SGFTree, comment: string): void {
  sgfAddComment(sgftreeNodeCheck(tree), comment);
}

export function sgftreeWriteResult(tree: SGFTree, score: number, overwrite: boolean): void {
  sgfWriteResult(tree.root, score, overwrite);
}

// ---------------------------------------------------------------- sgf_utils.c

export function get_moveX(property: SGFProperty, boardsize: number): number {
  if (property.value.length < 2) return -1;
  const i = property.value[1].toUpperCase().charCodeAt(0) - 65;
  if (i >= boardsize) return -1;
  return i;
}

export function get_moveY(property: SGFProperty, boardsize: number): number {
  if (property.value.length < 2) return -1;
  const j = property.value[0].toUpperCase().charCodeAt(0) - 65;
  if (j >= boardsize) return -1;
  return j;
}
