"""Summarizes a V8 .cpuprofile: self time and total time per function (top N).
python3 -I profsum.py FILE.cpuprofile [N]"""
import collections
import json
import sys

prof = json.load(open(sys.argv[1]))
n_top = int(sys.argv[2]) if len(sys.argv) > 2 else 25
nodes = {n['id']: n for n in prof['nodes']}
parent = {}
for n in prof['nodes']:
    for c in n.get('children', []):
        parent[c] = n['id']
counts = collections.Counter(prof['samples'])
total = sum(counts.values())
selft = collections.Counter()
incl = collections.Counter()
for nid, c in counts.items():
    fn = nodes[nid]['callFrame']
    key = f"{fn['functionName'] or '(anon)'} {fn['url'].split('/')[-1]}:{fn['lineNumber']}"
    selft[key] += c
    seen = set()
    x = nid
    while x is not None:
        f = nodes[x]['callFrame']
        k = f"{f['functionName'] or '(anon)'} {f['url'].split('/')[-1]}:{f['lineNumber']}"
        if k not in seen:
            incl[k] += c
            seen.add(k)
        x = parent.get(x)
print('self:')
for k, c in selft.most_common(n_top):
    print(f'  {100 * c / total:5.1f}% {k}')
print('total:')
for k, c in incl.most_common(n_top):
    print(f'  {100 * c / total:5.1f}% {k}')
