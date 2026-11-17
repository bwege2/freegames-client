// ObjectValidator, KindDescriptor and AttributeDescriptor (ObjectValidator.cc, KindDescriptor.cc,
// AttributeDescriptor.cc): data/schemas/objects.xml declares every object kind with its attributes
// (types, defaults, access), messages and the subkinds that are identified by attribute values.
import { parseXml, findAll, findFirst, type XmlElement } from '../util/xml.ts';
import { valueEquals, vtype, VT, type Value } from './value.ts';

type ValType = 'nil' | 'bool' | 'int' | 'double' | 'dir' | 'string' | 'enum' | 'tokens';

class AttributeDescriptor {
  name: string; type: ValType; defaultValue: Value; readable: boolean; writable: boolean;
  min: Value; max: Value; value: Value = null; isKindValue = false;
  constructor(name: string, type: ValType, def: Value, r: boolean, w: boolean, min: Value, max: Value) {
    this.name = name; this.type = type; this.defaultValue = def; this.readable = r; this.writable = w; this.min = min; this.max = max;
  }
  clone(): AttributeDescriptor {
    const c = new AttributeDescriptor(this.name, this.type, this.defaultValue, this.readable, this.writable, this.min, this.max);
    c.value = this.value; c.isKindValue = this.isKindValue;
    return c;
  }
  checkValue(val: Value): 0 | 3 {
    const vt = vtype(val);
    switch (this.type) {
      case 'bool': return vt === VT.BOOL ? 0 : 3;
      case 'int': {
        let isNumber = vt === VT.DOUBLE;
        if (!isNumber && vt === VT.STRING) {
          if (this.name === 'code' || this.name === 'cluster') return 0;
          if ((val as string)[0] === '%') isNumber = true;
        }
        return isNumber ? 0 : 3;
      }
      case 'double': return vt === VT.DOUBLE ? 0 : 3;
      case 'string': return vt === VT.STRING ? 0 : 3;
      case 'tokens': {
        const ok = vt === VT.STRING || vt === VT.TOKENS || vt === VT.OBJECT || vt === VT.GROUP;
        if (this.name === 'destination') return ok || vt === VT.POSITION ? 0 : 3;
        return ok ? 0 : 3;
      }
      default: return 0;
    }
  }
}

export class KindDescriptor {
  kind: string; isAbstract: boolean; isInitOnly: boolean; numStates: number;
  super: KindDescriptor | null; isClass: boolean;
  messages = new Set<string>();
  attributes = new Map<string, AttributeDescriptor>();
  valuedAttributes = new Map<string, AttributeDescriptor>();
  subKinds: KindDescriptor[] = [];
  constructor(v: ObjectValidator, name: string, superKind: string, abstract: boolean, states: number, initOnly: boolean) {
    this.kind = name; this.isAbstract = abstract; this.isInitOnly = initOnly; this.numStates = states;
    if (superKind !== '-') this.super = v.kinds.get(superKind) ?? null;
    else {
      const pos = name.lastIndexOf('_');
      this.super = v.kinds.get(pos >= 0 ? name.slice(0, pos) : '') ?? null;
    }
    if (!this.super && name !== '') throw new Error(`Object description initialization error - unknown super kind of ${name}`);
    this.isClass = !abstract;
    for (let s = this.super; s; s = s.super) if (!s.isAbstract) this.isClass = false;
    if (this.super) {
      this.messages = new Set(this.super.messages);
      this.attributes = new Map(this.super.attributes);
      this.super.subKinds.push(this);
    }
  }
  validateObject(get: (key: string) => Value): boolean {
    for (const a of this.valuedAttributes.values()) if (!valueEquals(a.value, get(a.name))) return false;
    return true;
  }
  getKind(get: (key: string) => Value): string {
    for (const k of this.subKinds) if (!k.isInitOnly && k.validateObject(get)) return k.kind;
    return this.kind;
  }
}

function boolValue(s: string | undefined): boolean { return s === 'true' || s === '1'; }

export class ObjectValidator {
  kinds = new Map<string, KindDescriptor>();
  defaultAttributes = new Map<string, AttributeDescriptor>();
  allMessages = new Set<string>();

  constructor(xml: string) {
    const doc = parseXml(xml);
    const attrs = findFirst(doc, 'attributes')!;
    for (const a of findAll(attrs, 'attr')) {
      const type = (a.attrs.type || 'nil') as ValType;
      const r = (a.attrs.rw ?? '').includes('r'), w = (a.attrs.rw ?? '').includes('w');
      this.defaultAttributes.set(a.attrs.name, new AttributeDescriptor(a.attrs.name, type,
        parseTyped(a.attrs.default, type), r, w, parseTyped(a.attrs.min, type), parseTyped(a.attrs.max, type)));
    }
    const msgs = findFirst(doc, 'messages');
    if (msgs) for (const m of findAll(msgs, 'msg')) this.allMessages.add(m.attrs.name);
    for (const o of findAll(doc, 'object')) this.scanObject(o);
  }

  private scanObject(o: XmlElement) {
    const name = o.attrs.name;
    const kd = new KindDescriptor(this, name, o.attrs.super ?? '-', boolValue(o.attrs.abstract),
      o.attrs.states !== undefined ? parseInt(o.attrs.states, 10) : -1, boolValue(o.attrs.init));
    this.kinds.set(name, kd);
    for (const m of findAll(o, 'msg')) kd.messages.add(m.attrs.name);
    for (const a of findAll(o, 'attr')) {
      const an = a.attrs.name;
      const def = a.attrs.default ?? '', rw = a.attrs.rw ?? '', mn = a.attrs.min ?? '', mx = a.attrs.max ?? '', val = a.attrs.value ?? '';
      if ((a.attrs.type ?? '') === '' && def === '' && rw === '' && mn === '' && mx === '' && val === '') {
        if (!kd.attributes.get(an)) {
          const d = this.defaultAttributes.get(an);
          if (!d) throw new Error('ObjectValidator missing default attribute declaration for: ' + an);
          kd.attributes.set(an, d);
        }
        continue;
      }
      let inherited = kd.attributes.get(an);
      if (!inherited) {
        inherited = this.defaultAttributes.get(an);
        if (!inherited) throw new Error('ObjectValidator missing default attribute declaration for: ' + an);
      }
      const c = inherited.clone();
      if (!kd.isAbstract && !kd.isClass) { c.isKindValue = true; kd.valuedAttributes.set(an, c); }
      kd.attributes.set(an, c);
      if (rw !== '') { c.readable = rw.includes('r'); c.writable = rw.includes('w'); }
      if (def !== '') c.defaultValue = parseTyped(def, c.type);
      if (mn !== '') c.defaultValue = parseTyped(mn, c.type); // sic: KindDescriptor sets the default from "min"
      if (mx !== '') c.max = parseTyped(mx, c.type);
      if (val !== '') c.value = parseTyped(val, c.type);
    }
  }

  kindDesc(cls: string): KindDescriptor | undefined { return this.kinds.get(cls); }

  validateMessage(cls: string, msg: string, getAttr: (k: string) => Value): boolean {
    const k = this.kinds.get(cls);
    if (!k) return getAttr(msg) === undefined;
    return k.messages.has(msg);
  }
  validateAttributeWrite(cls: string, key: string, val: Value): 0 | 1 | 2 | 3 {
    const k = this.kinds.get(cls);
    if (!k) return 0;
    if (key.startsWith('target_')) key = 'target';
    else if (key.startsWith('action_')) key = 'action';
    const a = k.attributes.get(key);
    if (!a) return 1;
    if (!a.writable) return 2;
    if (val === null) return 0;
    return a.checkValue(val);
  }
  validateAttributeRead(cls: string, key: string): boolean {
    const k = this.kinds.get(cls);
    if (!k) return true;
    if (key.startsWith('target_')) key = 'target';
    else if (key.startsWith('action_')) key = 'action';
    const a = k.attributes.get(key);
    return !!a && a.readable;
  }
  getDefaultValue(cls: string, key: string): Value {
    const k = this.kinds.get(cls);
    if (!k) return undefined;
    if (key.startsWith('target_')) key = 'target';
    else if (key.startsWith('action_')) key = 'action';
    const a = k.attributes.get(key);
    if (!a) return undefined;
    return a.defaultValue === null ? undefined : a.defaultValue;
  }
  getKind(cls: string, getAttr: (k: string) => Value): string {
    const k = this.kinds.get(cls);
    if (!k) return cls;
    return k.getKind(getAttr);
  }
  isKind(cls: string, getAttr: (k: string) => Value, match: string): boolean {
    const k = this.kinds.get(cls);
    if (!k) return false;
    if (match === k.kind) return true;
    for (let s = k.super; s; s = s.super) if (match === s.kind) return true;
    return match === k.getKind(getAttr);
  }
}

function parseTyped(s: string | undefined, type: ValType): Value {
  if (s === undefined) return null; // objects.xsd defaults absent values to "nil"
  if (s === 'nil') return null;
  switch (type) {
    case 'bool': return boolValue(s);
    case 'string': return s;
    case 'int': case 'dir': case 'enum': { const n = parseInt(s.trim(), 10); return isNaN(n) ? 0 : n; }
    case 'double': { const n = Number(s.trim()); return s.trim() === '' || isNaN(n) ? 0 : n; }
    default: return null;
  }
}
