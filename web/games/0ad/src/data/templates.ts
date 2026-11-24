// 0 A.D.'s entity-template inheritance, the way CTemplateLoader and CParamNode do it.
//
// A template name may be a chain `a|b|c`: `c` is loaded first as the base and `a`, `b` are applied
// on top (source/ps/TemplateLoader.cpp). Each layer is found as
// `special/filter/<name>.xml`, then `mixins/<name>.xml`, then `<name>.xml`.
//
// Merging a child element into the tree follows CParamNode::ApplyLayer
// (source/simulation2/system/ParamNode.cpp): same-named children merge recursively; `disable`
// removes, `replace` starts over, `merge` only modifies an existing child, `datatype="tokens"`
// unions token lists (a `-token` removes one), `op="add"/"mul"/"mul_round"` changes the numeric
// value, and attributes become `@name` children.

import { parseXml, type XmlElement } from './xml.ts';

export class TemplateSet {
  /** template name without `.xml` → its file text */
  readonly files: Map<string, string>;
  private readonly cache = new Map<string, XmlElement>();
  private readonly resolving = new Set<string>();

  constructor(files: Map<string, string>) {
    this.files = files;
  }

  /** Resolve a template name (the part of a `<Template>` or an entity's `Template` attribute). */
  resolve(name: string): XmlElement {
    const cached = this.cache.get(name);
    if (cached) return clone(cached);
    if (this.resolving.has(name)) throw new Error(`template inheritance loop at ${name}`);
    this.resolving.add(name);
    try {
      const tree = this.resolveUncached(name);
      this.cache.set(name, tree);
      return clone(tree);
    } finally {
      this.resolving.delete(name);
    }
  }

  private resolveUncached(name: string): XmlElement {
    const node: XmlElement = { name: 'Entity', attrs: {}, children: [], text: '' };
    this.loadInto(node, name);
    return node;
  }

  private loadInto(node: XmlElement, name: string): void {
    if (name.startsWith('actor|')) {
      // "actor|foo" is a pseudo-template: the name itself is the actor, nothing is loaded
      node.children.push({ name: 'VisualActor', attrs: {}, children: [{ name: 'Actor', attrs: {}, children: [], text: name.slice(6) }], text: '' });
      return;
    }
    const bar = name.indexOf('|');
    if (bar >= 0) {
      this.loadInto(node, name.slice(bar + 1));
      this.loadInto(node, name.slice(0, bar));
      return;
    }
    const file = this.find(name);
    if (!file) throw new Error(`template not found: ${name}`);
    const xml = parseXml(file);
    const parent = xml.attrs.parent;
    if (parent) this.loadInto(node, parent);
    for (const c of xml.children) applyLayer(node, c);
    // the root element's own attributes are not used by the game (parent is already applied)
  }

  private find(name: string): string | undefined {
    return this.files.get(`special/filter/${name}`) ?? this.files.get(`mixins/${name}`) ?? this.files.get(name);
  }
}

function clone(node: XmlElement): XmlElement {
  return { name: node.name, attrs: { ...node.attrs }, children: node.children.map(clone), text: node.text };
}

/** Split a token list, dropping empty tokens. */
export function splitTokens(value: string): string[] {
  return value.split(/\s+/).filter(Boolean);
}

function applyLayer(parent: XmlElement, layer: XmlElement): void {
  const name = layer.name;
  const attrs = layer.attrs;
  if ('disable' in attrs) {
    parent.children = parent.children.filter((c) => c.name !== name);
    return;
  }
  let existing = parent.children.find((c) => c.name === name);
  const replacing = 'replace' in attrs;
  const merging = 'merge' in attrs;
  if (replacing) {
    parent.children = parent.children.filter((c) => c.name !== name);
    existing = undefined;
  }
  if (merging && !existing) return;
  if (!existing) {
    existing = { name, attrs: {}, children: [], text: '' };
    parent.children.push(existing);
  }
  let value = layer.text;

  if (attrs.datatype === 'tokens') {
    const old = replacing ? [] : splitTokens(existing.text);
    const tokens = [...old];
    for (const token of splitTokens(value)) {
      if (token.startsWith('-')) {
        const at = tokens.indexOf(token.slice(1));
        if (at >= 0) tokens.splice(at, 1);
      } else if (!old.includes(token)) {
        tokens.push(token);
      }
    }
    existing.text = tokens.join(' ');
    value = existing.text;
  }

  const op = attrs.op;
  if (op === 'add' || op === 'mul' || op === 'mul_round') {
    const old = Number.parseFloat(existing.text || '0');
    const mod = Number.parseFloat(value || '0');
    const result = op === 'add' ? old + mod : old * mod;
    existing.text = String(op === 'mul_round' ? Math.round(result) : result);
    value = existing.text;
  } else if (attrs.datatype !== 'tokens') {
    existing.text = value;
  }

  for (const child of layer.children) applyLayer(existing, child);

  // attributes become children named "@attr", as CParamNode does; the special attributes are not
  // added (there are none in the game data that matter after compositing)
  for (const [attr, attrValue] of Object.entries(attrs)) {
    if (attr === 'replace' || attr === 'op' || attr === 'merge' || attr === 'filtered' || attr === 'disable') continue;
    const at = existing.children.find((c) => c.name === `@${attr}`);
    if (at) at.text = attrValue;
    else existing.children.push({ name: `@${attr}`, attrs: {}, children: [], text: attrValue });
  }
}
