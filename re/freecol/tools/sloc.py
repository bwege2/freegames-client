# Lines of Java per part of FreeCol: python3 tools/sloc.py orig/src/freecol  (code lines, all lines)
import os, sys, re, collections
root = os.path.join(sys.argv[1], 'src', 'net', 'sf', 'freecol')
groups = [
 ('common/model', 'model (rules, game state)'),
 ('common/networking', 'messages (c-s protocol)'),
 ('common/io', 'XML io, savegames'),
 ('common/option', 'options'),
 ('common/util', 'util'),
 ('common/i18n', 'i18n'),
 ('common/resources', 'resources'),
 ('common/sound', 'sound'),
 ('common/debug', 'debug'),
 ('common/metaserver', 'metaserver'),
 ('common/logging', 'logging'),
 ('common', 'common other'),
 ('server/ai', 'server AI'),
 ('server/generator', 'map generator'),
 ('server/model', 'server model (rules executed)'),
 ('server/control', 'server control'),
 ('server/networking', 'server networking'),
 ('server', 'server other'),
 ('client/gui', 'client GUI (Swing)'),
 ('client/control', 'client control'),
 ('client', 'client other'),
 ('metaserver', 'metaserver'),
 ('tools', 'tools'),
 ('', 'FreeCol.java etc'),
]
code = collections.Counter(); raw = collections.Counter()
for dp, dn, fn in os.walk(root):
    rel = os.path.relpath(dp, root).replace('\\', '/')
    if rel == '.': rel = ''
    g = next(name for pre, name in groups if rel == pre or rel.startswith(pre + '/') or pre == '')
    for f in fn:
        if not f.endswith('.java'): continue
        txt = open(os.path.join(dp, f), encoding='utf-8', errors='replace').read()
        raw[g] += txt.count('\n')
        t = re.sub(r'/\*.*?\*/', '', txt, flags=re.S)
        t = re.sub(r'//[^\n]*', '', t)
        code[g] += sum(1 for l in t.split('\n') if l.strip())
for pre, name in groups:
    if raw[name]: print(f"{code[name]:7d} {raw[name]:7d}  {name}")
print(f"{sum(code.values()):7d} {sum(raw.values()):7d}  total")
