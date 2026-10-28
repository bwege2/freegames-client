"""Runs the oracle once: python3 -I run.py [--seed N] [--login NAME] [--show] KEYS [-- ARGS...]

KEYS is a Python string literal body (escapes like \\n, \\033 work). Runs in a fresh directory with
a copy of re/nethack/work/install/, prints every screen when --show is given, else the last one."""
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from vt import VT  # noqa: E402

INSTALL = os.path.join(HERE, '..', 'work', 'install')
ORACLE = os.path.join(HERE, 'nethack-oracle')

TIME = 1704067200  # 2024-01-01 00:00 UTC


def run(keys: bytes, args=(), seed=1, login='tester', files=None, time=TIME, env_extra=None):
    """Returns (status, stdout bytes, frames [(kind, keyindex, offset, rngcalls)], files after)."""
    with tempfile.TemporaryDirectory() as d:
        game = os.path.join(d, 'game')
        shutil.copytree(INSTALL, game)
        for name, data in (files or {}).items():
            p = os.path.join(game, name)
            os.makedirs(os.path.dirname(p), exist_ok=True)
            with open(p, 'wb') as f:
                f.write(data)
        before = set()
        for root, _, fs in os.walk(INSTALL):
            for f in fs:
                before.add(os.path.relpath(os.path.join(root, f), INSTALL))
        with open(os.path.join(d, 'keys'), 'wb') as f:
            f.write(keys)
        home = os.path.join(d, 'home')
        os.mkdir(home)
        env = {
            'PATH': '/usr/bin:/bin', 'HOME': home, 'TERM': 'vt100', 'TZ': 'UTC', 'LANG': 'C',
            'NH_KEYS': os.path.join(d, 'keys'), 'NH_FRAMES': os.path.join(d, 'frames'),
            'NH_SEED': str(seed), 'NH_TIME': str(time), 'NH_LOGIN': login, 'USER': login,
        }
        env.update(env_extra or {})
        with open(os.path.join(d, 'out'), 'wb') as out:
            p = subprocess.run([globals()['ORACLE'], *args], cwd=game, env=env, stdin=subprocess.DEVNULL, stdout=out,
                               stderr=subprocess.PIPE, timeout=600)
        with open(os.path.join(d, 'out'), 'rb') as f:
            output = f.read()
        frames = []
        if os.path.exists(os.path.join(d, 'frames')):
            with open(os.path.join(d, 'frames')) as f:
                for line in f:
                    k, i, o, r = line.split()
                    frames.append((k, int(i), int(o), int(r)))
        after = {}
        for root, _, fs in os.walk(game):
            for f in fs:
                rel = os.path.relpath(os.path.join(root, f), game)
                with open(os.path.join(root, f), 'rb') as fh:
                    data = fh.read()
                if rel in before:
                    with open(os.path.join(INSTALL, rel), 'rb') as fh:
                        if fh.read() == data:
                            continue
                after[rel] = data
        return p.returncode, output, frames, after, p.stderr


def main():
    argv = sys.argv[1:]
    seed, login, show = 1, 'tester', False
    while argv and argv[0].startswith('--'):
        if argv[0] == '--seed':
            seed = int(argv[1]); argv = argv[2:]
        elif argv[0] == '--login':
            login = argv[1]; argv = argv[2:]
        elif argv[0] == '--show':
            show = True; argv = argv[1:]
        else:
            break
    from drive import unescape
    keys = unescape(argv[0])
    args = argv[2:] if len(argv) > 1 and argv[1] == '--' else []
    status, out, frames, files, err = run(keys, args, seed, login)
    vt = VT()
    pos = 0
    for k, i, o, r in frames:
        vt.feed(out[pos:o])
        pos = o
        if show:
            print(f'--- {k} key {i} rng {r} cursor {vt.y},{vt.x}')
            print('\n'.join(vt.lines()).rstrip())
    vt.feed(out[pos:])
    if not show:
        print('\n'.join(vt.lines()))
    print(f'status {status}, {len(frames)} frames, files: {sorted(files)}')
    if err:
        print('stderr:', err.decode('latin1')[:2000])


if __name__ == '__main__':
    main()
