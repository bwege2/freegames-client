"""TypeScript classes for C's structs and unions (structs.ts): fields with C's zero values, $of()
(an initializer list), $cp() (struct assignment), $clone(), and $layout() (the C layout, for the files
the game writes with write() and reads with read(): save files, bones, level files)."""
from . import ctypes_ as ct


def elem_desc(prog, t, used):
    if isinstance(t, (ct.Int, ct.Enum)):
        return f"['i', {t.bits // 8}, {1 if t.signed else 0}]"
    if isinstance(t, ct.Float):
        return f"['d', {prog.sizeof(t)}]"
    if isinstance(t, ct.Ptr):
        return "['p']"
    if isinstance(t, ct.Rec):
        used.add(t.name)
        return f"['r', {prog.class_name(t)}]"
    if isinstance(t, ct.Arr):
        return f"['a', {elem_desc(prog, t.of, used)}, {t.n or 0}]"
    if isinstance(t, (ct.Opaque, ct.VaList)):
        return "['p']"
    raise ValueError(f'layout of {t.c()}')


def ts_type(prog, t):
    if isinstance(t, (ct.Int, ct.Enum, ct.Float)):
        return 'number'
    if isinstance(t, ct.Ptr):
        if isinstance(t.to, ct.Rec) and t.to.name in prog.records:
            return f'{prog.class_name(t.to)} | null'
        return 'any'
    if isinstance(t, ct.Rec):
        return prog.class_name(t)
    if isinstance(t, ct.Arr):
        ta = ct.typed_array(t.of)
        return ta if ta else 'any[]'
    return 'any'


def zero(prog, t):
    if isinstance(t, (ct.Int, ct.Enum, ct.Float)):
        return '0'
    if isinstance(t, (ct.Ptr, ct.Opaque, ct.VaList)):
        return 'null'
    if isinstance(t, ct.Rec):
        return f'new {prog.class_name(t)}()'
    if isinstance(t, ct.Arr):
        n = t.n or 0
        ta = ct.typed_array(t.of)
        if ta:
            return f'new {ta}({n})'
        if isinstance(t.of, ct.Rec):
            return f'$sarr({prog.class_name(t.of)}, {n})'
        if isinstance(t.of, ct.Arr):
            return f'$arr({n}, () => {zero(prog, t.of)})'
        return f'new Array({n}).fill(null)'
    raise ValueError(t.c())


def copy_field(prog, name, t):
    if isinstance(t, ct.Rec):
        return f'this.{name}.$cp(s.{name});'
    if isinstance(t, ct.Arr):
        if ct.typed_array(t.of):
            return f'this.{name}.set(s.{name});'
        inner = t.of
        while isinstance(inner, ct.Arr):
            inner = inner.of
        if isinstance(inner, ct.Rec) or ct.typed_array(inner):
            return f'$cparr(this.{name}, s.{name});'
        # pointers: the references, not what they point to
        return f'$cpvals(this.{name}, s.{name});'
    return f'this.{name} = s.{name};'


def record_class(prog, key, used):
    rec_node = prog.records[key]
    tag = rec_node.get('tagUsed', 'struct')
    rec = ct.Rec(tag, key)
    cls = prog.class_name(rec)
    fields = prog.fields(rec)
    lay = prog.layout(rec)
    out = [f'/** {tag} {key if not key.startswith("(") else "(anonymous)"}: {lay.size} bytes */']
    out.append(f'export class {cls} {{')
    if tag == 'union':
        out.append('  $v: any = 0;')
        out.append('  $raw: Uint8Array | null = null;')
        for fname, ft, w in fields:
            desc = elem_desc(prog, ft, used)
            if isinstance(ft, (ct.Rec, ct.Arr)):
                out.append(f'  get {fname}(): {ts_type(prog, ft)} {{ return $umember(this, {desc}, () => {zero(prog, ft)}); }}')
            else:
                out.append(f'  get {fname}(): {ts_type(prog, ft)} {{ return this.$raw ? $udecode(this, {desc}) : this.$v; }}')
            out.append(f'  set {fname}(v: {ts_type(prog, ft)}) {{ this.$v = v; this.$raw = null; }}')
        for fname, ft, w in fields:
            out.append(f'  static $of_{fname}(v: any): {cls} {{ const o = new {cls}(); o.{fname} = v; return o; }}')
        out.append(f'  $cp(s: {cls}): this {{ this.$v = $uclone(s.$v); this.$raw = s.$raw; return this; }}')
        out.append(f'  $clone(): {cls} {{ return new {cls}().$cp(this); }}')
        out.append(f'  static $size = {lay.size};')
        members = ', '.join(f"[{fname!r}, {elem_desc(prog, ft, used)}]" for fname, ft, w in fields)
        out.append(f'  static $layout(): any[] {{ return [{members}]; }}')
        out.append('}')
        return out, cls
    for fname, ft, w in fields:
        out.append(f'  {fname}: {ts_type(prog, ft)} = {zero(prog, ft)};')
    # $of
    out.append(f'  static $of(...a: any[]): {cls} {{')
    out.append(f'    const o = new {cls}();')
    out.append('    const n = a.length;')
    for i, (fname, ft, w) in enumerate(fields):
        out.append(f'    if (n > {i}) o.{fname} = a[{i}];')
    out.append('    return o;')
    out.append('  }')
    out.append(f'  $cp(s: {cls}): this {{')
    for fname, ft, w in fields:
        out.append('    ' + copy_field(prog, fname, ft))
    out.append('    return this;')
    out.append('  }')
    out.append(f'  $clone(): {cls} {{ return new {cls}().$cp(this); }}')
    out.append(f'  static $size = {lay.size};')
    descs = []
    for fname, ft, w in fields:
        off, lo, hi = lay.fields[fname]
        if w is not None:
            signed = isinstance(ft, (ct.Int, ct.Enum)) and ft.signed and not ft.name.startswith('unsigned')
            descs.append(f"[{fname!r}, {off}, ['b', {lo}, {w}, {1 if signed else 0}]]")
        else:
            descs.append(f"[{fname!r}, {off}, {elem_desc(prog, ft, used)}]")
    out.append(f'  static $layout(): any[] {{ return [{", ".join(descs)}]; }}')
    out.append('}')
    return out, cls


def structs_module(prog, wanted):
    """structs.ts with the classes of the records in wanted and of everything they contain"""
    todo = list(wanted)
    done = set()
    parts = []
    while todo:
        key = todo.pop()
        if key in done or key not in prog.records:
            continue
        done.add(key)
        used = set()
        lines, cls = record_class(prog, key, used)
        # field types that are records also need classes
        for fname, ft, w in prog.fields(ct.Rec(prog.records[key].get('tagUsed', 'struct'), key)):
            t = ft
            while isinstance(t, (ct.Arr, ct.Ptr)):
                t = t.of if isinstance(t, ct.Arr) else t.to
            if isinstance(t, ct.Rec) and t.name not in done:
                todo.append(t.name)
        for u in used:
            if u not in done:
                todo.append(u)
        parts.append((cls, lines))
    parts.sort()
    head = ['// @ts-nocheck',
            '// The structs and unions of NetHack 3.6.7, translated to TypeScript by re/nethack/tools/c2ts (do not edit).',
            "import { $sarr, $arr, $cparr, $cpvals, $umember, $udecode, $uclone } from './rt/index.ts';", '']
    body = []
    for cls, lines in parts:
        body.extend(lines)
        body.append('')
    return '\n'.join(head + body)
