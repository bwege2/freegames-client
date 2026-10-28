"""Where do the port and the original first draw different random numbers?
    python3 -I rngtrace.py sessions/NAME.txt [run index]

Runs the session's run (default the first; the runs before it make its files) through the debug oracle
(DEBUG=1 build.sh: nethack-oracle-debug) with NH_RNGTRACE, symbolizes the callers of every draw with
addr2line, runs the port with the same keys (web/games/nethack/test/rngtrace.ts) and shows the first
draw whose callers differ, with the draws before it."""
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import run as runmod  # noqa: E402
from drive import parse  # noqa: E402

WEB = os.path.join(HERE, '..', '..', '..', 'web')
SKIP = {'__wrap_isaac64_next_uint64', 'RND', 'rn2', 'rnd', 'rn1', 'd', 'rnl', 'rne', 'rnz', 'rn2_on_display_rng'}


def oracle_trace(sess, idx):
    files = {}
    for i, r in enumerate(sess['runs']):
        if i == idx:
            break
        _st, _out, _fr, files, _err = runmod.run(r['keys'], r['args'], sess['seed'], sess['login'], files, sess['time'])
    r = sess['runs'][idx]
    with tempfile.TemporaryDirectory() as d:
        tf = os.path.join(d, 'trace')
        old = runmod.ORACLE
        runmod.ORACLE = os.path.join(HERE, 'nethack-oracle-debug')
        try:
            runmod.run(r['keys'], r['args'], sess['seed'], sess['login'], files, sess['time'], {'NH_RNGTRACE': tf})
        finally:
            runmod.ORACLE = old
        lines = open(tf).read().split('\n')
    binary = os.path.join(HERE, 'nethack-oracle-debug')
    nm = subprocess.run(['nm', binary], capture_output=True, text=True).stdout
    main_vma = int([ln.split()[0] for ln in nm.split('\n') if ln.endswith(' T main')][0], 16)
    addrs = sorted({a for ln in lines if ln for a in ln.split()[1:]})
    out = subprocess.run(['addr2line', '-f', '-e', binary] + [hex(main_vma + int(a) - 1) for a in addrs],
                         capture_output=True, text=True).stdout.split('\n')
    names = {a: out[2 * i] for i, a in enumerate(addrs)}
    trace = []
    for ln in lines:
        if not ln:
            continue
        parts = ln.split()
        chain = [names[a] for a in parts[1:]]
        chain = [c for c in chain if c not in SKIP][:6]
        trace.append(' < '.join(chain))
    return trace


def port_trace(sess, idx, path):
    with tempfile.TemporaryDirectory() as d:
        out = os.path.join(d, 'trace')
        subprocess.run(['node', 'games/nethack/test/rngtrace.ts', path, str(idx), out], cwd=WEB, check=False)
        return [ln for ln in open(out).read().split('\n') if ln]


def main():
    path = os.path.abspath(sys.argv[1])
    idx = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    sess = parse(path)
    o = oracle_trace(sess, idx)
    p = port_trace(sess, idx, path)
    n = min(len(o), len(p))
    for i in range(n):
        a = o[i].split(' < ')[:3]
        b = p[i].split(' < ')[:3]
        b[0] = b[0].split('@')[0]
        if a != b:
            print(f'draw {i + 1} differs')
            for k in range(max(0, i - 8), min(n, i + 4)):
                mark = '>>' if k == i else '  '
                print(f'{mark} {k + 1}\n     orig: {o[k]}\n     port: {p[k]}')
            return
    print(f'the same for {n} draws (original {len(o)}, port {len(p)})')


if __name__ == '__main__':
    main()
