"""Whole-program analysis: which functions are called (directly, or through which function pointer
fields or signatures), whose address is taken, and from that which functions must be async: those
that can (through any chain of calls) wait for a key or for time to pass (program.ASYNC_ROOTS)."""
from . import ctypes_ as ct
from .program import ASYNC_ROOTS


def strip(n):
    """the expression under casts and parentheses"""
    while n.get('kind') in ('ImplicitCastExpr', 'CStyleCastExpr', 'ParenExpr') and n.get('inner'):
        n = n['inner'][0]
    return n


def walk(n, fn, parent=None):
    if isinstance(n, dict):
        fn(n, parent)
        for c in n.get('inner', []):
            walk(c, fn, n)
        if 'array_filler' in n:
            for c in n['array_filler']:
                walk(c, fn, n)


def sig_key(prog, t):
    """a function type, made comparable: the number of parameters (unknown for f()) and whether it
    returns something"""
    if isinstance(t, ct.Ptr):
        t = t.to
    if not isinstance(t, ct.Func):
        return None
    return (len(t.params) if t.proto else '?', isinstance(t.ret, ct.Void))


def analyze(prog):
    funcs = list(prog.funcs.values()) + list(prog.static_funcs.values())
    addr_taken = {}           # (tu, name) of a function whose address is taken -> Func
    field_targets = {}        # (record name, field) -> set of Func
    field_open = set()        # fields that are also assigned something other than a function name
    all_sigs = {}             # sig_key -> set of Func (address taken)

    def func_of(tu, name):
        return prog.func(tu, name)

    def note_field_init(tu, rec_t, init):
        """an initializer list of a record: functions put into its fields"""
        try:
            fields = prog.fields(rec_t)
        except Exception:
            return
        items = init.get('inner', [])
        for (fname, ftype, _w), val in zip(fields, items):
            v = strip(val)
            if isinstance(ftype, ct.Ptr) and isinstance(ftype.to, ct.Func):
                if v.get('kind') == 'DeclRefExpr' and v.get('referencedDecl', {}).get('kind') == 'FunctionDecl':
                    f = func_of(tu, v['referencedDecl']['name'])
                    if f:
                        field_targets.setdefault((rec_t.name, fname), set()).add(f)
                elif v.get('kind') not in ('ImplicitValueInitExpr',) and not (v.get('kind') == 'IntegerLiteral'):
                    field_open.add((rec_t.name, fname))
            elif isinstance(ftype, ct.Rec) and v.get('kind') == 'InitListExpr':
                note_field_init(tu, ftype, v)
            elif isinstance(ftype, ct.Arr) and isinstance(ftype.of, ct.Rec) and v.get('kind') == 'InitListExpr':
                for e in v.get('inner', []):
                    if strip(e).get('kind') == 'InitListExpr':
                        note_field_init(tu, ftype.of, strip(e))

    def visit_init(tu, t, init):
        init = strip(init)
        if init.get('kind') != 'InitListExpr':
            return
        if isinstance(t, ct.Rec):
            note_field_init(tu, t, init)
        elif isinstance(t, ct.Arr):
            for e in init.get('inner', []):
                visit_init(tu, t.of, e)

    # pass 1: calls, address taken, fields
    for f in funcs:
        tu = f.tu

        def on(n, parent, f=f, tu=tu):
            k = n.get('kind')
            if k == 'CallExpr':
                callee = strip(n['inner'][0])
                if callee.get('kind') == 'DeclRefExpr' and callee.get('referencedDecl', {}).get('kind') == 'FunctionDecl':
                    f.calls.add(callee['referencedDecl']['name'])
                    callee['_direct'] = True
                else:
                    c = callee
                    if c.get('kind') == 'UnaryOperator' and c.get('opcode') == '*':
                        c = strip(c['inner'][0])
                    if c.get('kind') == 'MemberExpr':
                        base_t = prog.type(c['inner'][0])
                        if isinstance(base_t, ct.Ptr):
                            base_t = base_t.to
                        f.icalls.append(('field', getattr(base_t, 'name', None), c['name'], n))
                    else:
                        f.icalls.append(('sig', sig_key(prog, prog.type(callee)), None, n))
            elif k == 'DeclRefExpr' and n.get('referencedDecl', {}).get('kind') == 'FunctionDecl':
                if not n.get('_direct'):
                    g = func_of(tu, n['referencedDecl']['name'])
                    if g:
                        addr_taken[(g.tu, g.name)] = g
            elif k == 'BinaryOperator' and n.get('opcode') == '=':
                lhs = strip(n['inner'][0])
                if lhs.get('kind') == 'MemberExpr':
                    lt = prog.type(lhs)
                    if isinstance(lt, ct.Ptr) and isinstance(lt.to, ct.Func):
                        base_t = prog.type(lhs['inner'][0])
                        if isinstance(base_t, ct.Ptr):
                            base_t = base_t.to
                        v = strip(n['inner'][1])
                        key = (getattr(base_t, 'name', None), lhs['name'])
                        if v.get('kind') == 'DeclRefExpr' and v.get('referencedDecl', {}).get('kind') == 'FunctionDecl':
                            g = func_of(tu, v['referencedDecl']['name'])
                            if g:
                                field_targets.setdefault(key, set()).add(g)
                        else:
                            field_open.add(key)
            elif k == 'VarDecl' and n.get('init'):
                visit_init(tu, prog.type(n), n['inner'][-1]) if n.get('inner') else None

        # mark direct callees first (pre-order walk visits CallExpr before its callee)
        walk(f.node, on)
    # address taken in global initializers
    for v in list(prog.globals.values()) + list(prog.static_vars.values()):
        if v.node.get('init'):
            def on(n, parent, tu=v.tu):
                if n.get('kind') == 'DeclRefExpr' and n.get('referencedDecl', {}).get('kind') == 'FunctionDecl':
                    g = func_of(tu, n['referencedDecl']['name'])
                    if g:
                        addr_taken[(g.tu, g.name)] = g
            walk(v.node, on)
            visit_init(v.tu, prog.type(v.node), v.node['inner'][-1])
    for g in addr_taken.values():
        all_sigs.setdefault(sig_key(prog, prog.type(g.node)), set()).add(g)

    def targets(site):
        kind, a, b, _n = site
        if kind == 'field':
            ts = set(field_targets.get((a, b), set()))
            if (a, b) in field_open or not ts:
                sig = sig_key(prog, prog.type(_n['inner'][0]))
                for k, fs in all_sigs.items():
                    if sig is None or sig[0] == '?' or k[0] == '?' or k == sig:
                        ts |= fs
            return ts
        if a is None:
            return set().union(*all_sigs.values()) if all_sigs else set()
        out = set()
        for k, fs in all_sigs.items():
            if a[0] == '?' or k[0] == '?' or k == a:
                out |= fs
        return out

    for f in funcs:
        f.site_targets = [targets(s) for s in f.icalls]
    # async fixpoint
    changed = True
    for f in funcs:
        if f.calls & ASYNC_ROOTS:
            f.is_async = True
    while changed:
        changed = False
        for f in funcs:
            if f.is_async:
                continue
            if any((func_of(f.tu, c) is not None and func_of(f.tu, c).is_async) for c in f.calls) or \
               any(any(t.is_async for t in ts) for ts in f.site_targets):
                f.is_async = True
                changed = True
    for f, sites in ((f, f.icalls) for f in funcs):
        for s, ts in zip(sites, f.site_targets):
            s[3]['_await'] = any(t.is_async for t in ts)
    prog.addr_taken = addr_taken
    return sum(1 for f in funcs if f.is_async), len(funcs)
