"""Runs a session through the oracle and writes its golden:
    python3 -I drive.py sessions/NAME.txt OUT.json.gz

A session (sessions/*.txt) is lines of:
    seed N            the seed (/dev/urandom gives N, N+1, ... at each opening)
    login NAME        the login name (default tester)
    time T            the clock (seconds since 1970, UTC; default 2024-01-01 00:00)
    run [ARGS...]     a run of the program with these arguments; the files a run leaves (save file,
                      bones, record, level files) are there for the next run
    keys TEXT         keys for the current run (appended; escapes: \\n \\r \\e \\xHH \\\\, and ^X for
                      control characters); spaces at the ends are kept only when escaped (\\x20)
    # ...             a comment
The golden: {name, seed, login, time, runs: [{args, keys, status, frames, files}]}; a frame is
[kind, key index, draws from the random generators so far, the bytes written to the terminal since
the frame before (latin1)]; files are the files the run left that differ from the installation
(base64)."""
import base64
import gzip
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from run import TIME, run  # noqa: E402


def unescape(text):
    out = bytearray()
    i = 0
    while i < len(text):
        c = text[i]
        if c == '\\' and i + 1 < len(text):
            n = text[i + 1]
            if n == 'n':
                out.append(10)
            elif n == 'r':
                out.append(13)
            elif n == 'e':
                out.append(27)
            elif n == 'x':
                out.append(int(text[i + 2:i + 4], 16))
                i += 2
            else:
                out.append(ord(n))
            i += 2
            continue
        if c == '^' and i + 1 < len(text) and text[i + 1] in '@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_?':
            out.append(127 if text[i + 1] == '?' else ord(text[i + 1]) & 31)
            i += 2
            continue
        out.append(ord(c))
        i += 1
    return bytes(out)


def parse(path):
    sess = {'name': os.path.basename(path)[:-4], 'seed': 1, 'login': 'tester', 'time': TIME, 'runs': []}
    for line in open(path):
        line = line.rstrip('\n')
        if not line.strip() or line.lstrip().startswith('#'):
            continue
        word, _, rest = line.partition(' ')
        if word == 'seed':
            sess['seed'] = int(rest)
        elif word == 'login':
            sess['login'] = rest.strip()
        elif word == 'time':
            sess['time'] = int(rest)
        elif word == 'run':
            sess['runs'].append({'args': rest.split(), 'keys': b''})
        elif word == 'keys':
            sess['runs'][-1]['keys'] += unescape(rest.strip())
        else:
            raise SystemExit(f'{path}: bad line {line!r}')
    return sess


def drive(sess):
    files = {}
    out = {'name': sess['name'], 'seed': sess['seed'], 'login': sess['login'], 'time': sess['time'], 'runs': []}
    for r in sess['runs']:
        status, output, frames, after, err = run(r['keys'], r['args'], sess['seed'], sess['login'], files, sess['time'])
        fr = []
        pos = 0
        for kind, key, off, rng in frames:
            fr.append([kind, key, rng, output[pos:off].decode('latin1')])
            pos = off
        if pos < len(output):
            fr.append(['X', len(r['keys']), frames[-1][3] if frames else 0, output[pos:].decode('latin1')])
        out['runs'].append({'args': r['args'], 'keys': r['keys'].decode('latin1'), 'status': status,
                            'frames': fr, 'files': {k: base64.b64encode(v).decode() for k, v in sorted(after.items())}})
        # the next run starts with what this one left
        files = dict(after)
    return out


def main():
    sess = parse(sys.argv[1])
    g = drive(sess)
    data = json.dumps(g, separators=(',', ':')).encode('latin1')
    if sys.argv[2].endswith('.gz'):
        data = gzip.compress(data, 9, mtime=0)
    with open(sys.argv[2], 'wb') as fh:
        fh.write(data)
    n = sum(len(r['frames']) for r in g['runs'])
    print(f'{sess["name"]}: {len(g["runs"])} runs, {n} frames, status {[r["status"] for r in g["runs"]]}')


if __name__ == '__main__':
    main()
