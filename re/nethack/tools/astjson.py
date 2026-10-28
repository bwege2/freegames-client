"""Prints a declaration of an extracted file as JSON without locations:
python3 -I astjson.py <file (e.g. pline)> <name> [max characters]"""
import json
import os
import pickle
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def strip(n):
    if isinstance(n, dict):
        return {k: strip(v) for k, v in n.items() if k not in ('range', 'loc', 'id')}
    if isinstance(n, list):
        return [strip(x) for x in n]
    return n


o = pickle.load(open(os.path.join(HERE, '..', 'work', 'ext', sys.argv[1] + '.pickle'), 'rb'))
limit = int(sys.argv[3]) if len(sys.argv) > 3 else 6000
for d in o['decls']:
    if d.get('name') == sys.argv[2] and 'inner' in d:
        print(json.dumps(strip(d), indent=1)[:limit])
