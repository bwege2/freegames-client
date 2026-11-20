// Endless Sky data files: the original's indentation-based node format
// (source/DataFile.cpp and source/DataNode.cpp of the reference release).
// A line is a node; its tokens are separated by whitespace, a token may be
// quoted with " or ` (so that it can contain spaces or the other quote), and
// '#' starts a comment outside a quoted token. Lines indented deeper than the
// previous line are that line's children.

export interface DataNode {
  readonly tokens: string[];
  readonly children: DataNode[];
  readonly file: string;
  readonly line: number;
}

class Builder implements DataNode {
  readonly tokens: string[] = [];
  readonly children: DataNode[] = [];
  readonly file: string;
  readonly line: number;
  constructor(file: string, line: number) {
    this.file = file;
    this.line = line;
  }
}

/** Parse one data file. `file` only labels error messages and provenance. */
export function parseData(text: string, file = ''): DataNode[] {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  if (!text.endsWith('\n')) text += '\n';

  const root = new Builder(file, 0);
  // Stack of (separator count, node). The root has separator -1.
  const stack: { separators: number; node: Builder }[] = [{ separators: -1, node: root }];
  let pos = 0;
  let lineNumber = 0;
  const end = text.length;

  while (pos < end) {
    ++lineNumber;
    let c = text[pos];

    let separators = 0;
    while (c <= ' ' && c !== '\n') {
      ++separators;
      ++pos;
      c = text[pos];
    }

    // A comment line (or an empty line) is skipped whole.
    if (c === '#') {
      while (pos < end && text[pos] !== '\n') ++pos;
      if (pos < end) ++pos;
      continue;
    }
    if (c === '\n') {
      ++pos;
      continue;
    }

    // Insert the node at the right depth.
    while (stack[stack.length - 1].separators >= separators) stack.pop();
    const node = new Builder(file, lineNumber);
    stack[stack.length - 1].node.children.push(node);
    stack.push({ separators, node });

    // Tokenize the rest of the line.
    while (c !== '\n' && pos < end) {
      const endQuote = c;
      const isQuoted = endQuote === '"' || endQuote === '`';
      if (isQuoted) {
        ++pos;
        c = pos < end ? text[pos] : '\n';
      }
      const tokenStart = pos;
      while (pos < end && c !== '\n' && (isQuoted ? c !== endQuote : c > ' ')) {
        ++pos;
        c = pos < end ? text[pos] : '\n';
      }
      node.tokens.push(text.slice(tokenStart, pos));

      if (c !== '\n' && pos < end) {
        if (isQuoted) {
          ++pos;
          c = pos < end ? text[pos] : '\n';
        }
        while (pos < end && c !== '\n' && c <= ' ') {
          ++pos;
          c = pos < end ? text[pos] : '\n';
        }
        if (c === '#') {
          while (pos < end && text[pos] !== '\n') ++pos;
          if (pos < end) ++pos;
          break;
        }
      }
    }
    if (c === '\n' && pos < end) ++pos;
  }

  return root.children;
}

/** DataNode accessors as the original's DataNode (missing tokens are "" and 0). */
export const token = (node: DataNode, index: number): string => node.tokens[index] ?? '';
export const value = (node: DataNode, index: number): number => {
  const text = node.tokens[index];
  if (text === undefined) return 0;
  const number = Number(text);
  return Number.isFinite(number) ? number : 0;
};
export const boolValue = (node: DataNode, index: number): boolean => value(node, index) !== 0;
export const has = (node: DataNode, index: number): boolean => index < node.tokens.length;
