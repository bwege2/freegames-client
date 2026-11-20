#!/usr/bin/env python3
"""Generates web/games/teg/test/golden/oracle.json from the reference TEG 0.13.0 server.

This drives the real server (re/teg/oracle/build.sh) over its text protocol and records what it
does: the country distribution and first player for several seeds, the secret missions it assigns,
and a run of attacks with their dice and resulting countries (plus a card drawn after a conquest).
The port's test replays the same commands through the TypeScript engine and compares the results.

Run: python3 re/teg/oracle/transcripts.py [--server PATH] [--out FILE]
"""
import argparse
import json
import os
import random
import re
import select
import socket
import subprocess
import sys
import tempfile
import time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
DEFAULT_SERVER = os.path.join(ROOT, 're', 'teg', 'orig', 'build', 'tegserver')
DEFAULT_OUT = os.path.join(ROOT, 'web', 'games', 'teg', 'test', 'golden', 'oracle.json')


class Client:
    def __init__(self, port):
        self.sock = socket.create_connection(('127.0.0.1', port))
        self.sock.setblocking(False)
        self.buf = b''
        self.lines = []

    def send(self, msg):
        self.sock.sendall((msg + '\n').encode('latin-1'))

    def read(self, seconds=0.25):
        end = time.time() + seconds
        while time.time() < end:
            r, _, _ = select.select([self.sock], [], [], 0.02)
            if not r:
                continue
            try:
                data = self.sock.recv(65536)
            except BlockingIOError:
                continue
            if not data:
                break
            self.buf += data
            while b'\n' in self.buf:
                line, self.buf = self.buf.split(b'\n', 1)
                self.lines.append(line.decode('latin-1').rstrip('\r'))


class Server:
    def __init__(self, binary, seed, extra=()):
        self.port = random.randint(23000, 29000)
        home = tempfile.mkdtemp(prefix='teg-oracle-')
        env = dict(os.environ)
        env['HOME'] = home
        env['LD_LIBRARY_PATH'] = ':'.join(filter(None, [env.get('LD_LIBRARY_PATH'), '/usr/lib64', '/lib64']))
        self.proc = subprocess.Popen(
            [binary, '--port', str(self.port), '--seed', str(seed), '--console', '0', *extra],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=env)
        for _ in range(80):
            try:
                s = socket.create_connection(('127.0.0.1', self.port), timeout=0.1)
                s.close()
                return
            except OSError:
                time.sleep(0.025)
        raise RuntimeError('the reference server did not start')

    def close(self):
        self.proc.terminate()
        try:
            self.proc.wait(timeout=2)
        except subprocess.TimeoutExpired:
            self.proc.kill()


def drain(clients, seconds=0.2):
    end = time.time() + seconds
    while time.time() < end:
        r, _, _ = select.select([c.sock for c in clients], [], [], 0.02)
        for c in clients:
            if c.sock in r:
                c.read(0.001)


def connect(server, name, color, player=True):
    c = Client(server.port)
    c.send(f'player_id={name},{1 if player else 0},1')
    c.read(0.2)
    if player:
        c.send(f'color={color}')
        c.read(0.2)
    return c


def parse_paises(lines):
    """all countries from the `paises=` lines (owner and armies)"""
    out = {}
    for line in lines:
        m = re.match(r'paises=(\d+)/(.*)$', line)
        if not m:
            continue
        owner = int(m.group(1))
        for item in m.group(2).split(','):
            if not item:
                continue
            c, n = item.split(':')
            out[int(c)] = [owner, int(n)]
    return out


def start_message(lines):
    for line in lines:
        if line.startswith('start='):
            return line
    raise RuntimeError('no start message')


def game_turn(lines):
    m = re.search(r';fichas=(\d+),', start_message(lines))
    if not m:
        raise RuntimeError('no fichas in start')
    return int(m.group(1))


def assignment_case(binary, seed, players):
    server = Server(binary, seed)
    clients = [connect(server, chr(65 + i), i) for i in range(players)]
    try:
        drain(clients)
        clients[0].send('start')
        drain(clients, 0.35)
        clients[0].send('paises=-1')
        drain(clients, 0.3)
        lines = [l for c in clients for l in c.lines]
        owners = [-1] * 50
        for c, (owner, _) in parse_paises(lines).items():
            owners[c] = owner
        return {'seed': seed, 'players': players, 'owners': owners, 'turn': game_turn(lines)}
    finally:
        server.close()


def mission_case(binary, seed, players):
    server = Server(binary, seed)
    clients = [connect(server, chr(65 + i), i) for i in range(players)]
    try:
        drain(clients)
        clients[0].send('set=conquer_world:0')
        drain(clients)
        clients[0].send('start')
        drain(clients, 0.35)
        clients[0].send('paises=-1')
        drain(clients, 0.3)
        missions = []
        for c in clients:
            c.send('mission')
            c.read(0.25)
            m = [l for l in c.lines if l.startswith('mission=')]
            missions.append(int(m[-1].split('=')[1]) if m else -1)
        lines = [l for c in clients for l in c.lines]
        owners = [-1] * 50
        for c, (owner, _) in parse_paises(lines).items():
            owners[c] = owner
        return {'seed': seed, 'players': players, 'owners': owners, 'turn': game_turn(lines),
                'missions': missions}
    finally:
        server.close()


def adjacent_pairs():
    """the original's upper-triangle matrix (common/limitrof.h), as symmetric pairs"""
    path = os.path.join(ROOT, 're', 'teg', 'orig', 'src', 'common', 'limitrof.h')
    rows = []
    for line in open(path, encoding='latin-1'):
        m = re.match(r'\s*\{([0-9,\s]+)\},\s*/\*(.*?)\*/', line)
        if m:
            rows.append([int(x) for x in m.group(1).split(',') if x.strip()])
    adj = [set() for _ in range(50)]
    for i, row in enumerate(rows):
        for j, v in enumerate(row):
            if v == 1:
                adj[i].add(j)
                adj[j].add(i)
    return adj


def attack_case(binary, seed, armies1, armies2, max_attacks, draw_card):
    server = Server(binary, seed)
    clients = [connect(server, chr(65 + i), i) for i in range(2)]
    try:
        drain(clients)
        if (armies1, armies2) != (5, 3):
            clients[0].send(f'set=armies:{armies1},{armies2}')
            drain(clients)
        clients[0].send('start')
        drain(clients, 0.35)
        clients[0].send('paises=-1')
        drain(clients, 0.3)
        lines = [l for c in clients for l in c.lines]
        owners = [-1] * 50
        for c, (owner, _) in parse_paises(lines).items():
            owners[c] = owner
        turn = game_turn(lines)
        adj = adjacent_pairs()
        src = dst = None
        for c, o in enumerate(owners):
            if o == turn:
                for n in sorted(adj[c]):
                    if owners[n] != turn:
                        src, dst = c, n
                        break
            if src is not None:
                break
        if src is None:
            raise RuntimeError('no attack pair')
        other = 1 - turn
        placements = []
        for phase, n in (('fichas', armies1), ('fichas2', armies2)):
            for seat, country in ((turn, src), (other, dst)):
                clients[seat].send(f'{phase}={country}:{n}')
                drain(clients, 0.25)
                placements.append({'seat': seat, 'phase': phase, 'country': country, 'armies': n})
        drain(clients, 0.25)
        attacks = []
        for k in range(max_attacks):
            before = [l for c in clients for l in c.lines]
            clients[turn].send(f'ataque={src},{dst}')
            drain(clients, 0.35)
            new = [l for c in clients for l in c.lines][len(before):]
            dados = [l for l in new if l.startswith('dados=')]
            if not dados:
                break
            m = re.match(r'dados=(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)', dados[-1])
            dice = {
                'src': int(m.group(1)), 'srcDice': [int(m.group(2)), int(m.group(3)), int(m.group(4))],
                'dst': int(m.group(5)), 'dstDice': [int(m.group(6)), int(m.group(7)), int(m.group(8))],
            }
            paises = {}
            for l in new:
                if l.startswith('pais='):
                    for item in l.split(';'):
                        c, o, n = item.replace('pais=', '').split(',')
                        paises[int(c)] = [int(o), int(n)]
            tropas = [l for l in new if l.startswith(f'tropas={src},{dst},')]
            attacks.append({'dice': dice, 'countries': paises,
                            'conquest': bool(tropas),
                            'tropas': int(tropas[-1].split(',')[2]) if tropas else None})
            if tropas and draw_card:
                # the server allows a card after a conquest without resolving the move; this is
                # what the original client does when the player asks for the card
                clients[turn].send('tarjeta')
                drain(clients, 0.3)
                lines2 = [l for c in clients for l in c.lines]
                tarjeta = [l for l in lines2 if l.startswith('tarjeta=')]
                if not tarjeta:
                    raise RuntimeError('no tarjeta')
                card = [int(x) for x in tarjeta[-1].split('=')[1].split(',')]
                clients[turn].send('enum_cards')
                drain(clients, 0.25)
                lines3 = [l for c in clients for l in c.lines]
                enum = [l for l in lines3 if l.startswith('enum_cards=')]
                return {
                    'seed': seed, 'armies': [armies1, armies2], 'turn': turn, 'src': src, 'dst': dst,
                    'owners': owners, 'placements': placements, 'attacks': attacks,
                    'card': {'country': card[0], 'used': bool(card[1])},
                    'enumCards': enum[-1].split('=', 1)[1] if enum else '',
                }
            if tropas:
                # resolve the move with 0 extra armies and continue attacking
                clients[turn].send(f'tropas={src},{dst},0')
                drain(clients, 0.2)
            if paises.get(dst, [other, 1])[0] == turn:
                break
        return {'seed': seed, 'armies': [armies1, armies2], 'turn': turn, 'src': src, 'dst': dst,
                'owners': owners, 'placements': placements, 'attacks': attacks}
    finally:
        server.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--server', default=os.environ.get('TEGSERVER', DEFAULT_SERVER))
    ap.add_argument('--out', default=DEFAULT_OUT)
    args = ap.parse_args()
    if not os.path.exists(args.server):
        sys.exit(f'{args.server}: run re/teg/oracle/build.sh first')

    seeds = [1, 2, 3, 7, 42, 12345, 2147483647]
    data = {
        'source': 'TEG 0.13.0 server (re/teg/fetch.sh)',
        'assignments': [],
        'missions': [],
        'attacks': [],
    }
    for seed in seeds:
        for players in range(2, 7):
            data['assignments'].append(assignment_case(args.server, seed, players))
            print('assignment', seed, players, file=sys.stderr)
    for seed in [1, 12345]:
        for players in [2, 3, 4, 6]:
            data['missions'].append(mission_case(args.server, seed, players))
            print('mission', seed, players, file=sys.stderr)
    data['attacks'].append(attack_case(args.server, 12345, 5, 3, 4, False))
    print('attacks 1', file=sys.stderr)
    data['attacks'].append(attack_case(args.server, 12345, 40, 1, 40, True))
    print('attacks+card', file=sys.stderr)

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, 'w') as f:
        json.dump(data, f, indent=1)
        f.write('\n')
    print(f'{args.out}: {len(data["assignments"])} assignments, {len(data["missions"])} missions, '
          f'{len(data["attacks"])} attack runs')


if __name__ == '__main__':
    main()
